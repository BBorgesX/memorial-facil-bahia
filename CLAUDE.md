# CLAUDE.md

Guia para agentes que trabalham neste repositório. Leia antes de alterar código.

## O que é

**FirePro Suite** (evolução do *Memorial Fácil Bahia*) — SPA para engenheiros
projetistas de PPCI (Prevenção e Proteção Contra Incêndio) no Brasil, cobrindo
**Bahia (CBMBA)** e **São Paulo (CBMSP)**.

O usuário cadastra a edificação **uma única vez** e o app deriva: classificação
(grupo/divisão, altura, carga de incêndio), matriz de medidas de segurança
exigidas, cálculos (RTI, TRRF, hidráulica, saídas, brigada, extintores,
iluminação), memoriais descritivos, checklist anti-“comunique-se” e resposta a
notificações do Corpo de Bombeiros.

**Idioma do código:** tudo em **português** — identificadores, comentários,
tipos, nomes de arquivo. Mantenha esse padrão em qualquer código novo.

## Comandos

```sh
npm install
npm run dev       # http://localhost:8080
npm run build     # produção → dist/
npm run build:dev # build sem minificação
npm run lint      # eslint
npm run preview   # serve o build
```

Não há suíte de testes. Não há typecheck separado — `npm run build` (vite/tsc)
é a verificação mais próxima disso. `node_modules` não vem no clone: rode
`npm install` antes de qualquer build/lint.

## Stack

React 18 + TypeScript + Vite (SWC) · shadcn/ui + Tailwind · React Router
(**HashRouter**) · TanStack Query (instanciado, pouco usado) · Supabase
(Auth + Postgres) · zod + react-hook-form.

Alias `@/` → `src/`. Cor primária `#7A1C1C`, secundária `#2E2E2E`.

`vite.config.ts` usa `assetsInlineLimit: 1MB` de propósito: o build precisa
funcionar como arquivo único em prévias/artifacts. O HashRouter existe pelo
mesmo motivo (hospedagem estática sem rewrites).

## Arquitetura

### Fluxo de dados

```
DadosProjeto (src/lib/projeto.ts)   ← objeto central, TUDO gira em torno dele
        │
        ├── engine.ts               → valida + classifica + roda os cálculos
        │      ├── lib/normas/      → Tabelas 1–3, matriz de exigências (5/6/7)
        │      └── lib/calculos/    → trrf, saidas, brigada, iluminacao,
        │                             extintores, hidrantes(RTI), hidraulica
        ├── memorial.ts             → HTML do memorial descritivo → PDF/Word
        ├── memorialBrigada.ts      → memorial de brigada (IT 17 / NBR 14276)
        ├── checklist.ts            → checklist de aprovação
        └── gestao.ts               → status CBM, AVCB, CRM, portal do cliente
```

Todos os módulos em `src/pages/modulos/` leem e escrevem **o mesmo**
`projetoAtivo` do `appStore`. Nenhum módulo mantém estado de projeto próprio.

### Camada multi-UF — regra inegociável

Nenhum número normativo, número de IT ou exigência pode ser “chumbado” em
componente ou cálculo. Tudo vive em `src/data/normas/` e é acessado **somente**
via `getNormas(uf)` / `referenciaMedidaUF(uf, medidaId)` de
`src/data/normas/index.ts`. Nunca importe `ba.ts` ou `sp.ts` direto.

- **BA** — validado contra o Decreto Estadual 16.302/2015 + ITs 01–43 do CBMBA.
- **SP** — Decreto 69.118/2024. Tabelas 1, 2, 3, 5 e 7 completas; **Tabelas
  6A–6M pendentes**, marcadas com `// TODO: VALIDAR` no código e com aviso na
  interface.

Se precisar de um valor normativo que não existe na camada de dados: **não
invente**. Marque `// TODO: VALIDAR`, sinalize na interface e pergunte.

### Persistência (híbrida local + nuvem)

```
localStorage (fonte de leitura)          Supabase (fonte de verdade entre dispositivos)
  mfb:projetos        índice               public.projetos  (id, user_id, dados jsonb, atualizado_em)
  mfb:projeto:<id>    documento completo   public.clientes  (id, user_id, dados jsonb, atualizado_em)
  mfb:clientes        lista de clientes    public.portal_projeto(token) → RPC pública do portal
  fps:perfil:<uid>    perfil do RT (SÓ local — não sincroniza)
  fps:ativo:<uid>     id do projeto ativo
```

- **Escrita:** `salvarProjeto` / `salvarCliente` gravam local e disparam
  `empurrarRegistro` (fire-and-forget) para a nuvem.
- **Leitura:** sempre do localStorage. A nuvem só é lida em `sincronizarTudo()`
  (`src/lib/sync.ts`), chamado no login e ao restaurar sessão.
- **Merge:** last-write-wins pelo campo `atualizadoEm` **de dentro do JSON**
  (a coluna `atualizado_em` do Postgres é ignorada pela sincronização).
- O documento inteiro vai como `jsonb` — não há colunas tipadas por campo. Ao
  adicionar um campo em `DadosProjeto`, adicione também o padrão em
  `novoProjeto()`: `carregarProjeto()` faz merge com o modelo vazio, e é isso
  que mantém compatibilidade com projetos salvos por versões antigas.

**Estado atual do banco:** há inconsistências conhecidas e ainda não corrigidas
(escopo de clientes por usuário, exclusões que ressuscitam, perfil que não
sincroniza, link do portal que carrega os dados embutidos). Veja
`docs/revisao-banco.md` antes de mexer em `sync.ts`, `supabase.ts`, `gestao.ts`
ou `supabase/setup.sql`.

### Autenticação

`src/services/auth.ts` encapsula **todo** o Supabase Auth (`cadastrar`,
`entrar`, `sair`, `recuperarSenha`, `usuarioAtual`) e traduz as mensagens de
erro para português no mapa `MENSAGENS`. Páginas nunca chamam
`supabase.auth.*` diretamente — passam por esse serviço.

A chave no `src/lib/supabase.ts` é a **publishable/anon**, pública por design;
a proteção real é o RLS de `supabase/setup.sql`. Pode ser sobrescrita por
`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`.

### Banco — como aplicar mudanças

`supabase/setup.sql` é **idempotente** e é o único lugar onde o schema vive
(não há sistema de migrations). Alterações vão nesse arquivo, preservando a
propriedade de poder rodar de novo sem erro (`create ... if not exists`,
`drop policy if exists` antes de `create policy`, `create or replace function`).
Aplicação: SQL Editor do painel do Supabase.

## Estrutura de pastas

```
src/
├── components/
│   ├── shell/     AppShell (sidebar + topbar com Projeto ativo e UF), StatusBadge
│   ├── editor/    abas do editor de projeto (DadosGerais, MedidasSeguranca, …)
│   └── ui/        shadcn/ui — não editar sem motivo
├── data/normas/   camada multi-UF (ba.ts, sp.ts, sp/, tipos.ts, regras.ts, index.ts)
├── lib/           modelo, engine, cálculos, normas, geradores, persistência
├── pages/         Login, Dashboard, Projetos, ProjetoEditor, Painel, Clientes,
│                  PortalCliente, Configuracoes e pages/modulos/ (um por módulo)
├── services/      auth.ts (Supabase Auth), ai.ts (plugável), pdf.ts
└── store/         appStore.tsx — Context global
```

Os `.html` na raiz e em `public/ferramentas/` são os **web apps originais**
(Classificador PPCI, RTI, TRRF, Distâncias, Memorial de Brigada IT 25). São a
referência da lógica validada que foi portada para `src/lib/`. Não são build
artifacts — não apague. `trrf_calculator.tsx` na raiz também é legado de
referência, fora do bundle.

`SISTEMAS` e `normas` na raiz são arquivos vazios (1 byte) sem uso.

## Convenções

- Comentários explicam **a norma**, não o código (“Tabela 2 da IT 22”, “art. 4º,
  § 1º”). Cite a IT/artigo sempre que codificar uma regra.
- Valores calculados são **apoio**; o dimensionamento é do RT habilitado. Todo
  documento gerado leva a nota de responsabilidade técnica — não remova.
- `normalizarStatus()` migra status legados (`rascunho`, `em_analise`,
  `com_exigencia`). Qualquer leitura de `status` vinda de dado persistido passa
  por ela.
- Ao ler um campo que pode não existir em documentos antigos, use `?? padrão`
  (o padrão do merge cobre o primeiro nível; objetos aninhados como
  `hidraulica.conexoesColuna` precisam de merge explícito — veja
  `carregarProjeto`).
- Imagens (logo, memória de cálculo) são redimensionadas em canvas e guardadas
  como **data URL dentro do JSON do projeto**. Isso pesa no localStorage e no
  payload da nuvem — evite adicionar novos campos de imagem sem discutir.

## Git

Branch de trabalho definida pela tarefa; `main` é a branch padrão. Commits em
português, no imperativo, descrevendo o efeito para o usuário.
