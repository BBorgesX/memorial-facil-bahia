# FirePro Suite 🔥

Plataforma web **tudo-em-um** para engenheiros projetistas de combate a incêndio (PPCI) no Brasil — Bahia (**CBMBA**) e São Paulo (**CBMSP**).

> **Posicionamento:** a plataforma que evita reprovação (comunique-se) no Corpo de Bombeiros.
> Entre com os dados da edificação **uma única vez** e gere classificação, cálculos, memoriais, checklists e respostas — tudo parametrizado pela UF (BA ou SP).

Evolução do **Memorial Fácil Bahia**: os web apps HTML originais (Classificador PPCI, Cálculo de RTI, Calculadora TRRF, Consulta de distâncias máximas, Memorial de Brigada IT 25) foram unificados numa casca SaaS, **preservando 100% da lógica validada**.

## Módulos

| Módulo | Origem | Rota |
| --- | --- | --- |
| Dashboard (resumo por status) | novo | `/` |
| Projetos (cadastro central) | evolução | `/projetos` e `/projeto/:id` |
| Classificação & Enquadramento + Matriz de Exigências | Classificador PPCI Bahia | `/classificacao` |
| Cálculo de RTI | CALCULO DE RTI AUTOMATICA | `/calculos/rti` |
| Cálculo de TRRF | Calculadora TRRF | `/calculos/trrf` |
| Calculadora Hidráulica (Hazen-Williams) | **novo (MVP)** | `/calculos/hidraulica` |
| Distâncias Máximas / Rotas de Fuga | Consulta de distâncias | `/distancias` |
| Memorial Descritivo (unificado, PDF/Word) | Memorial Fácil Bahia | `/memoriais/descritivo` |
| Memorial de Brigada (IT 25) | app original embarcado | `/memoriais/brigada` |
| Checklist de Aprovação CBM (anti-comunique-se) | **novo (MVP)** | `/checklist` |
| Resposta a Notificação / Comunique-se | **novo (MVP)** | `/notificacao` |
| Configurações (UF padrão, responsável técnico) | novo | `/configuracoes` |

Topbar sempre visível com **Projeto ativo** e **UF (BA/SP)** — o contexto de todos os módulos.

## Arquitetura multi-UF

Toda regra, número de IT e exigência fica na camada de dados por estado (`src/data/normas/ba.ts` e `sp.ts`), nunca "chumbada" no componente.

- **BA (validado):** referências e lógica dos apps originais (Decreto Estadual nº 16.302/2015 + ITs do CBMBA).
- **SP (Decreto nº 69.118/2024):** a classificação usa o texto oficial do decreto (`src/data/normas/sp/`):
  - **Tabela 1** (ocupações), **Tabelas 2 e 3** (altura/carga — mesmas faixas da BA), **Tabela 5** (exigências para ≤ 750 m² e H ≤ 12 m, com as notas 1–6 de lotação/pavimentos) e **Tabela 7** (subsolos) — completas;
  - Residencial unifamiliar (A-1) excluída das exigências (art. 4º, § 1º);
  - **Tabelas 6A–6M** (> 750 m² ou > 12 m): o documento traz apenas o resumo estrutural — aplica-se a matriz de referência + regras-resumo oficiais (chuveiros > 30 m; elevador de emergência > 60 m / > 80 m residencial; controle de fumaça > 90 m — IT-15), com aviso na interface e `// TODO: VALIDAR` no código;
  - Numeração das ITs por medida pendente de confirmação (exceto IT-15 e IT-43, citadas no decreto).

Referências oficiais: [ITs do CBMBA](http://www.cbm.ba.gov.br/instrucao-tecnica) · [Legislação do CBMSP](https://cbaplang.corpodebombeiros.sp.gov.br/internetCB/#/LegislacaoConsulta)

## Stack e estrutura

SPA em **React 18 + TypeScript + Vite**, UI **shadcn/ui + Tailwind CSS** (primária `#7A1C1C`, secundária `#2E2E2E`).

```
src/
├── components/
│   ├── shell/                 # Casca SaaS: AppShell (sidebar+topbar), StatusBadge, SemProjetoAtivo
│   ├── editor/                # Formulários/preview do editor de projeto
│   └── ui/                    # shadcn/ui
├── data/normas/               # Camada multi-UF: ba.ts (validado), sp.ts (TODO validar), tipos, index
├── lib/
│   ├── normas/                # Tabelas 1–3, matriz de exigências (Tabelas 5/6/7) — BA validado
│   ├── calculos/              # trrf, saidas, brigada, iluminacao, extintores, hidrantes/RTI, hidraulica (novo)
│   ├── engine.ts              # Orquestra validação + classificação + cálculos
│   ├── memorial.ts            # Gerador do memorial (HTML → PDF/Word)
│   └── projeto.ts             # Modelo Projeto (uf, status, checklist, hidráulica) + persistência local
├── pages/
│   ├── Login.tsx / Dashboard.tsx / Projetos.tsx / Configuracoes.tsx / ProjetoEditor.tsx
│   └── modulos/               # Um arquivo por módulo, todos lendo o Projeto ativo
├── services/
│   ├── auth.ts                # Autenticação mock/local (isolada p/ Supabase Auth na fase 2)
│   ├── ai.ts                  # IA plugável (modo template no MVP; ponto de extensão Anthropic/OpenAI)
│   └── pdf.ts                 # Exportação PDF dos módulos novos
└── store/appStore.tsx         # Contexto global: usuário, perfil RT, projeto ativo, UF, normas
```

**Persistência (MVP):** localStorage multi-tenant local (projetos por usuário, perfil do responsável técnico, projeto ativo). Estrutura isolada para trocar por **Supabase (Postgres + Auth)** na fase 2.

**Modelo central `Projeto`:** uf, cliente, status (`Levantamento … Comunique-se`), classificação, `sistemasExigidos` (matriz), resultados (RTI/TRRF/hidráulica/distâncias), checklist e responsável técnico — todos os módulos leem e escrevem neste objeto.

## Como rodar

```sh
npm install
npm run dev       # desenvolvimento (http://localhost:8080)
npm run build     # build de produção (dist/)
npm run preview   # servir o build
```

## Avisos

- Os valores calculados são apoio ao projeto; o dimensionamento final é do responsável técnico habilitado. Todos os documentos gerados incluem a nota: *"Documento gerado por ferramenta de apoio; a responsabilidade técnica e a conferência final são do engenheiro responsável conforme as ITs vigentes da UF."*
- Nenhum valor normativo foi inventado: valores de SP pendentes estão marcados `// TODO: VALIDAR` no código e sinalizados na interface.

## Legislação e normas aplicadas (BA — validado)

- Lei Estadual nº 12.929/2013 e Decreto Estadual nº 16.302/2015 (Bahia);
- Lei Federal nº 13.425/2017;
- Instruções Técnicas 01 a 43 do CBMBA;
- ABNT NBR 5628, 9050, 9077, 10897, 10898, 11742, 11785, 12693, 13434, 13714, 16820, 17240; NFPA 20.
