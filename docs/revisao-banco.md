# Revisão do banco de dados — FirePro Suite

Revisão da camada de persistência: `supabase/setup.sql`, `src/lib/supabase.ts`,
`src/lib/sync.ts`, `src/lib/projeto.ts`, `src/lib/gestao.ts`,
`src/services/auth.ts`, `src/store/appStore.tsx` e `src/pages/PortalCliente.tsx`.

**Nada foi corrigido ainda** — este documento é o levantamento. Vários itens
mudam o formato dos dados já gravados e precisam de decisão antes.

## Como o modelo funciona hoje

Duas tabelas (`projetos`, `clientes`), cada uma com `id text primary key`,
`user_id uuid`, `dados jsonb` (o documento inteiro) e `atualizado_em`.
O localStorage é a fonte de leitura; a nuvem é lida só em `sincronizarTudo()`,
no login. O merge é last-write-wins pelo `atualizadoEm` **de dentro do JSON**.
O portal do cliente é uma função `security definer` que devolve um recorte do
projeto a partir do token.

O desenho é coerente com o objetivo (app offline-first, migrável). Os problemas
abaixo são de escopo por usuário, de exclusão e de visibilidade de erro.

---

## Críticos

### 1. Clientes não têm dono — vazam entre contas e são apropriados na sincronização

`Cliente` (`gestao.ts:132`) não tem `ownerId`, e `listarClientes()`
(`gestao.ts:169`) lê a chave global `mfb:clientes` sem filtrar por usuário.
Consequências, num navegador usado por mais de uma conta:

- o usuário B **vê e edita** os clientes do usuário A (`Clientes.tsx:14`,
  `Painel.tsx:38`);
- pior, `sync.ts:61-66` percorre `listarClientes()` e empurra **todos** eles
  para a nuvem com o `user_id` de B — os clientes de A passam a existir também
  na conta de B, com CPF/CNPJ, telefone, e-mail e histórico de interações.

Projetos não têm esse problema porque `DadosProjeto.ownerId` existe e
`listarProjetos(ownerId)` filtra (`projeto.ts:502`).

**Correção:** dar `ownerId` a `Cliente`, filtrar em `listarClientes(ownerId)`
e nunca empurrar registro cujo `ownerId` não seja o da sessão. Exige migração
dos clientes já salvos (adoção pelo primeiro usuário que logar, igual ao que
`sync.ts:43-46` faz com projetos sem dono).

### 2. Sair da conta não limpa o cache local

`sair()` (`appStore.tsx:126`, `auth.ts:80`) encerra a sessão do Supabase e zera
o estado do React, mas não toca no localStorage. Ficam no navegador:
`mfb:clientes` (global), `mfb:projeto:<id>` de todos, `fps:perfil:<uid>` e o
índice `mfb:projetos`. Somado ao item 1, a próxima conta a logar naquele
computador enxerga os clientes da anterior.

### 3. Exclusões ressuscitam na sincronização seguinte

Não existe tombstone. `excluirProjeto` (`projeto.ts:561`) e `excluirCliente`
(`gestao.ts:198`) apagam local e chamam `removerRegistro`, mas:

- se o `delete` na nuvem falhar (offline, sessão expirada), nada reagenda — o
  registro fica na nuvem para sempre e volta no próximo `sincronizarTudo()`
  (`sync.ts:35-38`, `57-60`);
- se o usuário apagar no dispositivo A, o dispositivo B ainda tem o registro
  local e, tendo `atualizadoEm` mais recente ou não existindo na nuvem, o
  **reenvia** (`sync.ts:47-50`, `62-65`).

Resultado prático: projeto/cliente apagado reaparece. Precisa de uma tabela (ou
coluna) de exclusões com a data, respeitada nos dois sentidos do merge.

### 4. O link do portal carrega os dados embutidos — revogar o token não revoga o acesso

`urlPortal()` (`gestao.ts:284`) monta
`#/portal/<token>?d=<base64 do snapshot inteiro>`, e `PortalCliente.tsx:61-64`
usa esse `?d=` como fallback. O base64 contém nome da obra, empresa, RT,
protocolo, número/validade do AVCB, exigências e histórico completo.

Ou seja: quem receber o link encaminhado continua vendo os dados **mesmo depois
de o token ser trocado ou o projeto apagado**, porque a informação viaja no
próprio link. Isso contradiz o modelo do RPC, que foi feito justamente para ser
revogável. Além disso, com histórico longo a URL passa dos limites práticos de
navegador/WhatsApp.

**Sugestão:** o link padrão deve ser só `#/portal/<token>`; o `?d=` viraria uma
opção explícita de "retrato offline", com aviso de que não expira.

---

## Altos

### 5. Erros do Supabase são invisíveis

Em supabase-js v2 as queries **não lançam exceção** — devolvem `{ data, error }`.
O código nunca lê `error`:

- `empurrarRegistro` / `removerRegistro` (`supabase.ts:28`, `43`) têm
  `try/catch` que praticamente nunca dispara; falha de RLS, de coluna ou de
  tabela inexistente passa como sucesso;
- `sync.ts:26-29` ignora `proj.error` / `cli.error` e usa `?? []`. **Um SELECT
  que falhou é tratado como "a nuvem está vazia"** — e o código então empurra
  tudo o que é local, mascarando o problema.

Nenhuma tela informa o usuário de que os dados não subiram. Mínimo: checar
`error`, logar, e expor um indicador de "não sincronizado" na interface.

### 6. O perfil do responsável técnico não sincroniza, mas a documentação diz que sim

`auth.ts:3-7` e `Login.tsx:3` afirmam que "os dados sincronizam pela nuvem".
`PerfilProfissional` (nome, título, CREA/RRT, contato, UF padrão) é gravado
**só** em `localStorage` (`auth.ts:97-108`) e não tem tabela. Quem entra de
outro computador acha o perfil em branco e os memoriais saem sem RT — que é
exatamente o dado mais sensível do documento gerado.

Alternativas: tabela `perfis (user_id pk, dados jsonb)` ou gravar no
`user_metadata` do Supabase Auth.

### 7. `importarProjetoJSON` preserva `ownerId` e `tokenPortal` de outra conta

`projeto.ts:596-600` faz `{ ...base, ...dados, id: base.id }` — só o `id` é
regerado. Então o JSON importado traz junto:

- `ownerId` do exportador → `listarProjetos(meuId)` filtra e **o projeto some
  da lista** logo depois de importado (fica no localStorage, invisível);
- `tokenPortal` do exportador → dois projetos com o mesmo token; o
  `portal_projeto` tem `limit 1` e devolve um deles arbitrariamente.

A importação deveria zerar `ownerId` (para o usuário atual), `tokenPortal`,
`protocoloCBMBA`, AVCB e `historico`, como `duplicarProjeto` já faz
(`projeto.ts:567-590`).

### 8. `atualizado_em` (coluna) e `atualizadoEm` (JSON) são duas verdades

`empurrarRegistro` grava a coluna com o relógio do cliente
(`supabase.ts:32`), mas `sync.ts:27` seleciona apenas `id, dados` e compara
pelo campo de dentro do JSON. A coluna existe, é escrita, e **não é usada por
nada** exceto o `geradoEm` do portal. Ou a sincronização passa a usá-la (com
`default now()` no servidor, o que também elimina divergência de relógio), ou
ela deveria ser apenas informativa e populada por trigger.

---

## Médios

### 9. Chave primária global, sem `user_id`

`id text primary key` é global às contas. Como o id é gerado com
`Date.now()+Math.random()` (`projeto.ts:397`), colisão é improvável — mas se
acontecer, o `upsert` vira UPDATE numa linha de outro dono, o RLS bloqueia e,
pelo item 5, **o erro é silencioso**: o usuário acha que salvou. Uma PK
composta `(user_id, id)` elimina a classe inteira do problema.

### 10. Nada garante `tokenPortal` único

Não há constraint. O `limit 1` do `portal_projeto` esconde a duplicidade em vez
de sinalizá-la. Com o item 7, duplicar token é fácil. Cabe um índice único
parcial em `(dados->>'tokenPortal')` para valores não vazios.

### 11. Token do portal usa `Math.random()`

`gerarTokenPortal` (`gestao.ts:275`) monta `pt_ + timestamp + 8 chars`. Não é
gerador criptográfico e o timestamp é adivinhável, então a entropia real é
menor do que parece. Para um endpoint público e não autenticado (`anon` tem
`execute`), o correto é `crypto.getRandomValues` com 128 bits.

### 12. O portal devolve mais campo do que declara

`portal_projeto` retorna `dados -> 'exigencias'` inteiro — cada exigência vai
com `id` e `criadaEm`, que não estão em `SnapshotPortal` (`gestao.ts:234`) nem
são exibidos. O `gerarSnapshotPortal` local, esse sim, faz o recorte correto
(`gestao.ts:251`). O SQL deveria fazer o mesmo recorte.

### 13. O portal usa `'rascunho'` como status padrão

`coalesce(dados ->> 'status', 'rascunho')` no `setup.sql`. `'rascunho'` é
**status legado**, fora do enum atual (`projeto.ts:147-164`). Funciona só porque
`statusEfetivo`/`normalizarStatus` traduz no cliente (`PortalCliente.tsx:50`).
O padrão deveria ser `'Levantamento'`.

### 14. `clienteId` fica órfão ao excluir um cliente

`excluirCliente` (`gestao.ts:198`) remove o cliente, mas os projetos mantêm
`clienteId` apontando para um registro que não existe mais. `ClienteDetalhe`,
`Clientes` e `Painel` passam a contar/exibir vínculos quebrados. Como o modelo é
jsonb, não há FK que resolva — tem de ser feito na aplicação (limpar o
`clienteId` dos projetos afetados, ou bloquear a exclusão com obras vinculadas).

### 15. A sincronização baixa o documento inteiro, com imagens em base64

`sync.ts:27-28` faz `select id, dados` de **todos** os projetos. `dados` inclui
`logoDataUrl` e `hidrantesConfig.memoriaCalculoImagens[]` — PNGs em data URL de
até 480 px e 1200 px de largura (`DadosGerais.tsx:46`,
`MedidasSeguranca.tsx:83`). Alguns projetos com memória de cálculo anexada já
tornam o login lento e podem estourar a cota de ~5 MB do localStorage, cujo
erro (`QuotaExceededError`) hoje **não é tratado** em `gravarProjetoLocal`
(`projeto.ts:542`) — o `setItem` lança e a gravação simplesmente falha.

Caminho natural: Supabase Storage para as imagens, guardando só a URL no JSON.

### 16. Last-write-wins no documento inteiro perde edições concorrentes

O merge (`sync.ts:37`, `48`) compara um único `atualizadoEm` do projeto todo.
Editar a aba de medidas no desktop e o AVCB no notebook resulta em uma das duas
edições descartada, sem aviso. É aceitável para uso individual — mas precisa
estar consciente antes de o app ganhar mais de um usuário por escritório.

### 17. Projetos sem dono são adotados por quem logar primeiro

`listarProjetos(uid)` inclui projetos com `ownerId` vazio (`projeto.ts:504`) e
`sync.ts:43-46` os grava com o `uid` da sessão. É a migração pretendida para
dados anteriores ao login, mas num navegador compartilhado significa que a
primeira conta a logar leva os projetos antigos de outra pessoa.

---

## Menores

- **Prefixos de chave inconsistentes:** `mfb:` (projetos, clientes) e `fps:`
  (perfil, projeto ativo) convivem. Só higiene, mas atrapalha uma futura
  limpeza por prefixo — que é justamente o que o item 2 vai precisar.
- **Sem trigger de `atualizado_em`:** o valor depende do cliente (item 8).
- **Sem validação de forma do `jsonb`:** nenhuma `check` garante que `dados`
  tenha `id`/`atualizadoEm`. Um documento malformado só quebra em runtime.
- **`upsert`/`delete` sem `.eq('user_id', uid)`:** correto hoje porque o RLS
  cobre, mas o código fica dependente exclusivamente da política. Um filtro
  explícito é defesa em profundidade barata.
- **`projetoPorToken`** (`gestao.ts:280`) chama `carregarTodosProjetos()` sem
  `ownerId`, varrendo os projetos de todas as contas do navegador. Só é usado
  no fallback do portal, mas é mais amplo do que precisa.

---

## Sugestão de ordem

1. Itens 1, 2 e 5 — vazamento entre contas e erro invisível; são os que causam
   dano real e não mudam formato de dado.
2. Itens 3 e 7 — corrupção de dados (ressurreição e importação).
3. Item 4 e 11 — exposição do portal.
4. Itens 6, 8, 9, 10, 13, 14 — mudanças de schema, melhor agrupadas numa única
   revisão do `setup.sql`.
5. Item 15 — migração das imagens para Storage; é a maior obra da lista.
