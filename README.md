# Memorial Fácil Bahia 🔥

Web app **monolítico e integrado** para elaboração de **projetos de segurança contra incêndio e pânico** no Estado da Bahia: o usuário preenche os dados técnicos da edificação, o sistema **classifica e calcula automaticamente** conforme o Decreto Estadual nº 16.302/2015 e as Instruções Técnicas (ITs) do CBMBA, e gera o **memorial descritivo** pronto para exportação em **PDF** e **Word**.

Referência oficial das ITs: <http://www.cbm.ba.gov.br/instrucao-tecnica>

## Funcionalidades

1. **Formulário de entrada de dados** — identificação do projeto, endereço, características da edificação (áreas, altura, pavimentos, subsolo), ocupação (Tabela 1), carga de incêndio e riscos especiais.
2. **Processamento técnico em tempo real** — validação dos dados e aplicação automática das regras técnicas:
   - Classificação por **ocupação, altura e carga de incêndio** (Tabelas 1, 2 e 3 do Decreto 16.302/2015);
   - Determinação das **medidas de segurança exigidas** (Tabelas 5/6), com ajuste manual pelo usuário;
   - Exigências adicionais para **subsolo** (Tabela 7);
   - **TRRF** — Tempo Requerido de Resistência ao Fogo (IT 08);
   - **Saídas de emergência** — população, unidades de passagem, larguras e distâncias máximas (IT 11 / NBR 9077);
   - **Extintores** — capacidade extintora, distâncias e quantidade estimada (IT 21 / NBR 12693);
   - **Hidrantes** — tipo de sistema (1 a 5), vazão, pressão e **RTI** (IT 22 / NBR 13714);
   - **Brigada de incêndio** — dimensionamento e nível de treinamento (IT 17 / NBR 14276);
   - **Iluminação de emergência** — autonomia, iluminância e pontos estimados (IT 18 / NBR 10898:2023).
3. **Memorial descritivo automático** — documento técnico estruturado (normas, classificação, medidas, cálculos, riscos especiais e assinaturas), com pré-visualização, **exportação em PDF** (impressão) e **Word (.doc)**.
4. **Persistência de projetos** — os projetos ficam salvos no navegador (localStorage) com salvamento automático, duplicação e importação/exportação em JSON.

## Arquitetura

Aplicação única (SPA) em **React 18 + TypeScript + Vite**, UI com **shadcn/ui + Tailwind CSS**.

```
src/
├── lib/
│   ├── normas/
│   │   ├── ocupacoes.ts       # Tabela 1 — grupos e divisões de ocupação (A–M)
│   │   ├── classificacao.ts   # Tabelas 2 (altura) e 3 (carga de incêndio)
│   │   └── exigencias.ts      # Matriz de medidas exigidas (Tabelas 5/6) + subsolo (Tabela 7)
│   ├── calculos/
│   │   ├── trrf.ts            # IT 08 — TRRF
│   │   ├── saidas.ts          # IT 11 — população, saídas e distâncias máximas
│   │   ├── brigada.ts         # IT 17 — brigada de incêndio
│   │   ├── iluminacao.ts      # IT 18 — iluminação de emergência
│   │   ├── extintores.ts      # IT 21 — extintores
│   │   └── hidrantes.ts       # IT 22 — hidrantes, tipo de sistema e RTI
│   ├── engine.ts              # Orquestra validação + classificação + cálculos
│   ├── memorial.ts            # Gerador do memorial (HTML → PDF/Word)
│   └── projeto.ts             # Modelo de dados + persistência (localStorage)
├── pages/
│   ├── Index.tsx              # Lista de projetos salvos
│   └── ProjetoEditor.tsx      # Editor com abas (dados, medidas, riscos, cálculos, memorial)
└── components/editor/         # Formulários e painéis do editor
```

A lógica técnica reaproveita e integra as ferramentas desenvolvidas anteriormente neste repositório (Classificador PPCI Bahia, Calculadora TRRF, Cálculo de RTI, Consulta de distâncias máximas e Memorial de Brigada), agora unificadas em módulos TypeScript.

> **Aviso técnico:** os valores calculados são determinados pelas tabelas normativas citadas, mas constituem apoio ao projeto. O dimensionamento final (memória de cálculo hidráulico, lançamento em planta, etc.) é de responsabilidade do responsável técnico habilitado.

## Como rodar

```sh
npm install
npm run dev       # desenvolvimento (http://localhost:8080)
npm run build     # build de produção (dist/)
npm run preview   # servir o build
```

## Legislação e normas aplicadas

- Lei Estadual nº 12.929/2013 e Decreto Estadual nº 16.302/2015 (Bahia);
- Lei Federal nº 13.425/2017;
- Instruções Técnicas 01 a 43 do CBMBA;
- ABNT NBR 5628, 9050, 9077, 10898, 11742, 11785, 12693, 13434, 13714, 16820, 17240; NFPA 20.
