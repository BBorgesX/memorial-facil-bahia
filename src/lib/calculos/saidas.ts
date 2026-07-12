/**
 * IT 11/2016 (CBMBA) — Saídas de Emergência.
 * Atualizada pela Portaria n.º 067 CG-CBMBA/19 — revisado contra o texto
 * integral da IT fornecido pelo usuário.
 *
 * - Cálculo da população (Tabela 1 — Anexo A) e dimensionamento N = P/C (5.4);
 * - Larguras mínimas por ocupação (5.4.2) e dimensões de luz de portas (5.5.4.3);
 * - Distâncias máximas a serem percorridas (Tabela 2 — Anexo B);
 * - Tipos de escadas de emergência por ocupação (Tabela 3 — Anexo C);
 * - Exigências específicas: nº de escadas (5.5.3.5/5.5.3.6), elevador de
 *   emergência (5.9.1), área de refúgio (5.10.2), barra antipânico (5.5.4.6),
 *   subsolos (nota "l" da Tabela 3) e painel de contagem (5.12).
 */

export interface CoeficientePopulacao {
  descricao: string;
  m2PorPessoa: number;
}

/**
 * Coeficientes de cálculo de população POR DIVISÃO (planilha da IT 11/NBR 9077,
 * conforme o memorial de referência). Fallback por grupo quando a divisão não
 * está listada.
 */
export const COEFICIENTES_POPULACAO: Record<string, CoeficientePopulacao> = {
  'A-1': { descricao: 'Duas pessoas por dormitório (adotado ≈ 15 m² por pessoa)', m2PorPessoa: 15 },
  'A-2': { descricao: 'Duas pessoas por dormitório (adotado ≈ 15 m² por pessoa)', m2PorPessoa: 15 },
  'A-3': { descricao: 'Duas pessoas por dormitório e uma pessoa por 4 m² de alojamento', m2PorPessoa: 4 },
  B: { descricao: 'Uma pessoa por 15 m² de área', m2PorPessoa: 15 },
  C: { descricao: 'Uma pessoa por 5 m² de área', m2PorPessoa: 5 },
  D: { descricao: 'Uma pessoa por 7 m² de área', m2PorPessoa: 7 },
  E: { descricao: 'Uma pessoa por 1,5 m² de área de sala de aula', m2PorPessoa: 1.5 },
  'F-1': { descricao: 'Uma pessoa por 3 m² de área', m2PorPessoa: 3 },
  'F-2': { descricao: 'Uma pessoa por 1 m² de área', m2PorPessoa: 1 },
  'F-3': { descricao: 'Duas pessoas por 1 m² de área', m2PorPessoa: 0.5 },
  'F-4': { descricao: 'Uma pessoa por 3 m² de área', m2PorPessoa: 3 },
  'F-5': { descricao: 'Uma pessoa por 1 m² de área', m2PorPessoa: 1 },
  'F-6': { descricao: 'Três pessoas por 1 m² de área (Tabela 1 — IT 11)', m2PorPessoa: 1 / 3 },
  'F-7': { descricao: 'Duas pessoas por 1 m² de área (Tabela 1 — IT 11)', m2PorPessoa: 0.5 },
  'F-8': { descricao: 'Uma pessoa por 1 m² de área', m2PorPessoa: 1 },
  'F-9': { descricao: 'Duas pessoas por 1 m² de área (célula agrupada da Tabela 1 — confirmar enquadramento)', m2PorPessoa: 0.5 },
  'F-10': { descricao: 'Uma pessoa por 3 m² de área', m2PorPessoa: 3 },
  'G-1': { descricao: 'Uma pessoa por 40 vagas de veículos (adotado ≈ 40 m² por pessoa)', m2PorPessoa: 40 },
  'G-2': { descricao: 'Uma pessoa por 40 vagas de veículos (adotado ≈ 40 m² por pessoa)', m2PorPessoa: 40 },
  'G-3': { descricao: 'Uma pessoa por 40 vagas de veículos (adotado ≈ 40 m² por pessoa)', m2PorPessoa: 40 },
  'G-4': { descricao: 'Uma pessoa por 20 m² de área', m2PorPessoa: 20 },
  'G-5': { descricao: 'Uma pessoa por 20 m² de área', m2PorPessoa: 20 },
  'H-1': { descricao: 'Uma pessoa por 7 m² de área', m2PorPessoa: 7 },
  'H-2': { descricao: 'Duas pessoas por dormitório e uma pessoa por 4 m² de alojamento', m2PorPessoa: 4 },
  'H-3': { descricao: '1,5 pessoa por leito + uma pessoa por 7 m² de área de ambulatório (Tabela 1 — IT 11)', m2PorPessoa: 7 },
  'H-4': { descricao: 'Uma pessoa por 7 m² de área', m2PorPessoa: 7 },
  'H-5': { descricao: 'Uma pessoa por 7 m² de área', m2PorPessoa: 7 },
  'H-6': { descricao: 'Uma pessoa por 7 m² de área', m2PorPessoa: 7 },
  I: { descricao: 'Uma pessoa por 10 m² de área', m2PorPessoa: 10 },
  J: { descricao: 'Uma pessoa por 30 m² de área', m2PorPessoa: 30 },
  'L-1': { descricao: 'Uma pessoa por 3 m² de área', m2PorPessoa: 3 },
  'L-2': { descricao: 'Uma pessoa por 10 m² de área', m2PorPessoa: 10 },
  'L-3': { descricao: 'Uma pessoa por 10 m² de área', m2PorPessoa: 10 },
  'M-3': { descricao: 'Uma pessoa por 10 m² de área', m2PorPessoa: 10 },
  'M-4': { descricao: 'Uma pessoa por 4 m² de área', m2PorPessoa: 4 },
  'M-5': { descricao: 'Uma pessoa por 10 m² de área', m2PorPessoa: 10 },
  M: { descricao: 'Uma pessoa por 10 m² de área', m2PorPessoa: 10 },
};

interface CapacidadeUP {
  acessos: number;
  escadas: number;
  portas: number;
}

/**
 * Capacidade de uma unidade de passagem (pessoas) POR DIVISÃO — planilha da
 * IT 11/NBR 9077 do memorial de referência. Fallback por grupo.
 */
const CAPACIDADE_UP: Record<string, CapacidadeUP> = {
  A: { acessos: 60, escadas: 45, portas: 100 },
  B: { acessos: 60, escadas: 45, portas: 100 },
  C: { acessos: 100, escadas: 75, portas: 100 },
  D: { acessos: 100, escadas: 75, portas: 100 },
  E: { acessos: 100, escadas: 75, portas: 100 },
  'E-5': { acessos: 30, escadas: 22, portas: 30 },
  'E-6': { acessos: 30, escadas: 22, portas: 30 },
  F: { acessos: 100, escadas: 75, portas: 100 },
  G: { acessos: 100, escadas: 60, portas: 100 },
  H: { acessos: 60, escadas: 45, portas: 100 },
  'H-2': { acessos: 30, escadas: 22, portas: 30 },
  'H-3': { acessos: 30, escadas: 22, portas: 30 },
  I: { acessos: 100, escadas: 60, portas: 100 },
  J: { acessos: 100, escadas: 60, portas: 100 },
  L: { acessos: 100, escadas: 60, portas: 100 },
  M: { acessos: 100, escadas: 60, portas: 100 },
  'M-1': { acessos: 100, escadas: 75, portas: 100 },
  'M-4': { acessos: 60, escadas: 45, portas: 100 },
};

const LARGURA_UP_M = 0.55; // uma unidade de passagem = 0,55 m

// ---------------------------------------------------------------------------
// Distâncias máximas a percorrer (m) — Tabela da IT 11
// ---------------------------------------------------------------------------

/** Categorias de ocupação da tabela de distâncias. */
function categoriaDistancia(grupo: string, divisao: string): number {
  if (grupo === 'A' || grupo === 'B') return 1;
  if (divisao === 'I-1' || divisao === 'J-1') return 3;
  if (['G-1', 'G-2', 'J-2'].includes(divisao)) return 4;
  if (['I-2', 'I-3', 'J-3', 'J-4'].includes(divisao)) return 5;
  return 2; // C, D, E, F, G-3..G-5, H, L, M
}

/**
 * dist[categoria][pisoDescarga? 0:1][semSprinkler? 0:1][saidaUnica? 0:1][semDeteccao? 0:1]
 * Índices: [cat-1][piso][sprinkler][saidas][deteccao] → distância (m) ou null (não permitido).
 */
const DIST: (number | null)[][][][][] = [
  // Categoria 1 (A, B)
  [
    [ // piso de descarga
      [[45, 55], [55, 65]],   // sem sprinkler: [saída única [s/det, c/det]], [múltiplas saídas]
      [[60, 70], [80, 95]],   // com sprinkler
    ],
    [ // demais pavimentos
      [[40, 45], [50, 60]],
      [[55, 65], [75, 90]],
    ],
  ],
  // Categoria 2 (C, D, E, F, G-3/4/5, H, L, M)
  [
    [
      [[40, 45], [50, 60]],
      [[55, 65], [75, 90]],
    ],
    [
      [[30, 35], [40, 45]],
      [[45, 55], [65, 75]],
    ],
  ],
  // Categoria 3 (I-1, J-1)
  [
    [
      [[80, 95], [120, 140]],
      [[null, null], [null, null]], // com sprinkler: sem limite tabelado (consultar IT)
    ],
    [
      [[70, 80], [110, 130]],
      [[null, null], [null, null]],
    ],
  ],
  // Categoria 4 (G-1, G-2, J-2)
  [
    [
      [[50, 60], [60, 70]],
      [[80, 95], [120, 140]],
    ],
    [
      [[45, 55], [55, 65]],
      [[70, 80], [110, 130]],
    ],
  ],
  // Categoria 5 (I-2, I-3, J-3, J-4)
  [
    [
      [[40, 45], [50, 60]],
      [[60, 70], [100, 120]],
    ],
    [
      [[30, 35], [40, 45]],
      [[50, 65], [80, 95]],
    ],
  ],
];

// ---------------------------------------------------------------------------
// Tipo de escada — Anexo C (Tabela 3) da IT 11
// ---------------------------------------------------------------------------

export type SiglaEscada = 'NE' | 'EP' | 'PF';

export interface TipoEscada {
  sigla: SiglaEscada;
  descricao: string;
  base: string;
  /**
   * Opção menos rigorosa admitida pela própria célula da Tabela 3 (células
   * "NE/EP" e "EP/PF") — a adoção depende das condições da IT; o sistema
   * adota a mais rigorosa por padrão.
   */
  alternativa?: SiglaEscada;
  /** false: classificação pela Tabela 3 (Anexo C) oficial da IT 11/2016 */
  preliminar: boolean;
  /** Notas aplicáveis da Tabela 3 */
  notas: string[];
}

const NOMES_ESCADA: Record<SiglaEscada, string> = {
  NE: 'Escada Não Enclausurada (comum)',
  EP: 'Escada Enclausurada Protegida',
  PF: 'Escada à Prova de Fumaça',
};

/** Célula da Tabela 3: tipo exigido e, quando houver "X/Y", a opção alternativa. */
type CelulaEscada = SiglaEscada | [SiglaEscada, SiglaEscada]; // [alternativa, adotada]

/**
 * ANEXO C — TABELA 3 da IT 11/2016 (CBMBA): tipos de escadas de emergência
 * por ocupação, nas faixas H ≤ 6 · 6 < H ≤ 12 · 12 < H ≤ 30 · acima de 30 m.
 * Células "X/Y" da tabela oficial são representadas como [X, Y]; o sistema
 * adota a opção mais rigorosa (Y) e informa a alternativa (X).
 */
const TABELA_3_ESCADAS: { divisoes: (d: string, g: string) => boolean; rotulo: string; faixas: [CelulaEscada, CelulaEscada, CelulaEscada, CelulaEscada] }[] = [
  { rotulo: 'A-1, A-2, A-3', divisoes: (_d, g) => g === 'A', faixas: ['NE', 'NE', 'EP', 'PF'] },
  { rotulo: 'B-1, B-2', divisoes: (_d, g) => g === 'B', faixas: ['NE', 'EP', 'EP', 'PF'] },
  { rotulo: 'C-1, C-2, C-3', divisoes: (_d, g) => g === 'C', faixas: ['NE', ['NE', 'EP'], ['EP', 'PF'], 'PF'] },
  { rotulo: 'D', divisoes: (_d, g) => g === 'D', faixas: ['NE', 'NE', 'EP', 'PF'] },
  { rotulo: 'E-1 a E-6', divisoes: (_d, g) => g === 'E', faixas: ['NE', 'NE', 'EP', 'PF'] },
  { rotulo: 'F-1, F-2, F-4', divisoes: (d) => ['F-1', 'F-2', 'F-4'].includes(d), faixas: ['NE', 'NE', 'EP', 'PF'] },
  { rotulo: 'F-3, F-5, F-8 a F-10', divisoes: (d) => ['F-3', 'F-5', 'F-8', 'F-9', 'F-10'].includes(d), faixas: ['NE', 'EP', 'PF', 'PF'] },
  { rotulo: 'F-6, F-7', divisoes: (d) => ['F-6', 'F-7'].includes(d), faixas: ['NE', 'EP', 'PF', 'PF'] },
  { rotulo: 'F-11', divisoes: (d) => d === 'F-11', faixas: ['NE', 'EP', 'PF', 'PF'] },
  { rotulo: 'G-1, G-2, G-3', divisoes: (d) => ['G-1', 'G-2', 'G-3'].includes(d), faixas: ['NE', 'NE', 'EP', 'EP'] },
  { rotulo: 'G-4, G-5', divisoes: (d) => ['G-4', 'G-5'].includes(d), faixas: ['NE', 'NE', 'EP', 'PF'] },
  { rotulo: 'H-1, H-4, H-5, H-6', divisoes: (d) => ['H-1', 'H-4', 'H-5', 'H-6'].includes(d), faixas: ['NE', 'NE', 'EP', ['EP', 'PF']] },
  { rotulo: 'H-2, H-3', divisoes: (d) => ['H-2', 'H-3'].includes(d), faixas: ['NE', 'EP', 'PF', 'PF'] },
  { rotulo: 'I-1, I-2, I-3', divisoes: (_d, g) => g === 'I', faixas: ['NE', ['NE', 'EP'], ['EP', 'PF'], 'PF'] },
  { rotulo: 'J', divisoes: (_d, g) => g === 'J', faixas: ['NE', 'NE', 'EP', 'PF'] },
  { rotulo: 'L-1, L-2, L-3', divisoes: (_d, g) => g === 'L', faixas: ['NE', 'EP', 'PF', 'PF'] },
  { rotulo: 'M-1 a M-5', divisoes: (_d, g) => g === 'M', faixas: ['NE', ['NE', 'EP'], ['EP', 'PF'], 'PF'] },
];

/**
 * Classificação do tipo de escada exigido — Tabela 3 (Anexo C) da IT 11/2016.
 * A célula "F-11" segue a linha F-6/F-7 (reunião de público com maior rigor);
 * a nota (1) da tabela trata A-2 acima de 30 m em função da área.
 */
export function classificarTipoEscada(
  grupo: string,
  divisao: string,
  alturaM: number,
  areaTotalM2 = 0,
): TipoEscada {
  const faixa = alturaM <= 6 ? 0 : alturaM <= 12 ? 1 : alturaM <= 30 ? 2 : 3;
  const faixaTxt = ['H ≤ 6 m', '6 m < H ≤ 12 m', '12 m < H ≤ 30 m', 'H > 30 m'][faixa];

  const linha = TABELA_3_ESCADAS.find((l) => l.divisoes(divisao, grupo));
  const notas: string[] = [];

  // Nota (1) da Tabela 3: A-2 com área ≤ 750 m² e 30 < H ≤ 50 m aceita EP;
  // acima de 50 m exige-se PF.
  if (divisao === 'A-2' && faixa === 3) {
    if (areaTotalM2 > 0 && areaTotalM2 <= 750 && alturaM <= 50) {
      notas.push('Nota (1) da Tabela 3: A-2 com área ≤ 750 m² e 30 m < H ≤ 50 m — aceita-se EP.');
      return {
        sigla: 'EP',
        descricao: NOMES_ESCADA.EP,
        base: `Tabela 3 (Anexo C) da IT 11 — linha A, ${faixaTxt}, nota (1)`,
        preliminar: false,
        notas,
      };
    }
    if (alturaM > 50) notas.push('Nota (1) da Tabela 3: A-2 acima de 50 m — exige-se PF.');
  }

  if (!linha) {
    // Divisão fora das linhas da Tabela 3 (ex.: M-6, M-7 — não listadas)
    return {
      sigla: 'PF',
      descricao: NOMES_ESCADA.PF,
      base: `Divisão ${divisao} sem linha específica na Tabela 3 da IT 11 — adotada a opção mais rigorosa; consultar o CBMBA`,
      preliminar: true,
      notas,
    };
  }

  const celula = linha.faixas[faixa];
  const [alternativa, adotada] = Array.isArray(celula) ? celula : [undefined, celula];

  if (alturaM > 36 && divisao !== 'A-2') {
    notas.push('Nota (i) da Tabela 3 / item 5.5.3.5: acima de 36 m é obrigatório o mínimo de 2 escadas (exceto A-2).');
  }
  if (['H-2', 'H-3'].includes(divisao) && alturaM > 12) {
    notas.push('Nota (g) da Tabela 3: H-2 e H-3 acima de 12 m exigem também elevador de emergência.');
  }
  if (alternativa) {
    notas.push(
      `A célula da Tabela 3 indica "${alternativa}/${adotada}" — adotada a opção mais rigorosa (${adotada}); ` +
        `${alternativa} pode ser admitida conforme as condições da IT/análise do CBMBA.`,
    );
  }

  return {
    sigla: adotada,
    descricao: NOMES_ESCADA[adotada],
    base: `Tabela 3 (Anexo C) da IT 11 — linha ${linha.rotulo}, ${faixaTxt}`,
    alternativa,
    preliminar: false,
    notas,
  };
}

// ---------------------------------------------------------------------------
// Cálculo por pavimento
// ---------------------------------------------------------------------------

/** Dados de entrada de um pavimento (informados pelo usuário). */
export interface PavimentoEntrada {
  nome: string;
  areaM2: number;
  /** Nº de dormitórios (grupos A e H-2 — população = dormitórios × 2) */
  dormitorios?: number;
  /** População informada manualmente (prevalece sobre o cálculo) */
  populacaoManual?: number;
}

export interface PavimentoCalculado {
  nome: string;
  areaM2: number;
  populacao: number;
  /** Memória de cálculo da população do pavimento (ex.: "P = 120 m² / 7 = 18") */
  memoria: string;
  /** Acessos dimensionados por pavimento: N = P/C (mínimo 2 UP) */
  acessos: { unidades: number; larguraM: number; memoria: string };
}

export interface ResultadoSaidas {
  divisao: string;
  descricaoOcupacao: string;
  coeficiente: string;
  usaDormitorios: boolean;
  /** Capacidade de uma unidade de passagem (pessoas) — Anexo A da IT 11 */
  capacidadeUP: { acessos: number; escadas: number; portas: number };
  /** Cálculo detalhado por pavimento */
  pavimentos: PavimentoCalculado[];
  /** População crítica (máxima entre os pavimentos) — dimensiona escadas/descargas */
  populacaoCritica: number;
  pavimentoCritico: string;
  /** População total da edificação (soma dos pavimentos) */
  populacaoTotal: number;
  /** População adotada (informada pelo usuário ou total calculada) */
  populacaoAdotada: number;
  populacaoCalculada: number;
  /** Dimensionados pela população crítica (mínimo 2 UP = 1,10 m) */
  dimensionamento: {
    escadas: { unidades: number; larguraM: number; memoria: string };
    rampas: { unidades: number; larguraM: number; memoria: string };
    descargas: { unidades: number; larguraM: number; memoria: string };
    portas: { unidades: number; larguraM: number; memoria: string };
  };
  tipoEscada: TipoEscada;
  /** Nº mínimo de escadas (5.5.3.5/5.5.3.6 e nota "i" da Tabela 3) */
  escadasMinimas: number;
  /** Exigências específicas da IT 11 aplicáveis ao projeto (5.9, 5.10, 5.5.4.6, 5.12, nota "l") */
  exigenciasEspecificas: { id: string; texto: string; referencia: string }[];
  distanciaMaxima: {
    pisoDescargaM: number | null;
    demaisPavimentosM: number | null;
    consideracoes: string;
  };
  /** Veredito de conformidade (real informado × permitido pela IT 11) */
  conformidade: {
    distanciaTerreo: { realM: number; permitidoM: number | null; conforme: boolean | null };
    distanciaDemais: { realM: number; permitidoM: number | null; conforme: boolean | null };
    saidas: { existente: string; minimo: number; criterio: string; conforme: boolean };
  };
  numeroMinimoSaidas: number;
}

/**
 * Larguras mínimas por ocupação — item 5.4.2 da IT 11:
 * geral 1,10 m (2 UP); H-2 e H-3: 1,65 m (3 UP) para escadas/acessos/descarga;
 * rampas: 1,65 m (3 UP) em H-2 e 2,20 m (4 UP) em H-3.
 */
function upMinimas(divisao: string): { acessos: number; escadas: number; rampas: number; descargas: number } {
  if (divisao === 'H-2') return { acessos: 3, escadas: 3, rampas: 3, descargas: 3 };
  if (divisao === 'H-3') return { acessos: 3, escadas: 3, rampas: 4, descargas: 3 };
  return { acessos: 2, escadas: 2, rampas: 2, descargas: 2 };
}

function dimensionar(populacao: number, capacidade: number, rotulo: string, minUP = 2) {
  const calculado = Math.ceil(populacao / capacidade);
  const unidades = Math.max(minUP, calculado);
  return {
    unidades,
    larguraM: unidades * LARGURA_UP_M,
    memoria: `N = ${populacao} / ${capacidade} = ${calculado} → adotado ${unidades} U.P. (mín. ${minUP}) · W = ${unidades} × 0,55 = ${(unidades * LARGURA_UP_M).toFixed(2).replace('.', ',')} m (${rotulo})`,
  };
}

/**
 * Portas — item 5.5.4.3 da IT 11: dimensões mínimas de luz por UP:
 * 0,80 m = 1 UP · 1,00 m = 2 UP · 1,50 m (2 folhas) = 3 UP · 2,00 m (2 folhas) = 4 UP.
 */
function dimensionarPortas(populacao: number, capacidade: number) {
  const LUZ_POR_UP: Record<number, { luzM: number; obs: string }> = {
    1: { luzM: 0.8, obs: '0,80 m (1 UP)' },
    2: { luzM: 1.0, obs: '1,00 m (2 UP)' },
    3: { luzM: 1.5, obs: '1,50 m em duas folhas (3 UP)' },
    4: { luzM: 2.0, obs: '2,00 m em duas folhas (4 UP)' },
  };
  const calculado = Math.max(1, Math.ceil(populacao / capacidade));
  if (calculado <= 4) {
    const { luzM, obs } = LUZ_POR_UP[calculado];
    return {
      unidades: calculado,
      larguraM: luzM,
      memoria: `N = ${populacao} / ${capacidade} = ${calculado} U.P. → porta com luz mínima de ${obs} (item 5.5.4.3)`,
    };
  }
  // Acima de 4 UP: distribuir em múltiplas portas de 2,00 m (4 UP cada)
  const qtdPortas = Math.ceil(calculado / 4);
  return {
    unidades: calculado,
    larguraM: qtdPortas * 2.0,
    memoria:
      `N = ${populacao} / ${capacidade} = ${calculado} U.P. → distribuir em ${qtdPortas} porta(s) de 2,00 m ` +
      `(duas folhas, 4 UP cada) ou combinação equivalente (item 5.5.4.3)`,
  };
}

export function calcularSaidas(params: {
  grupo: string;
  divisao: string;
  descricaoOcupacao?: string;
  areaTotal: number;
  alturaM: number;
  pavimentosEntrada: PavimentoEntrada[];
  populacaoInformada?: number;
  temSprinklers: boolean;
  temDeteccao: boolean;
  saidaUnica: boolean;
  distanciaRealTerreoM?: number;
  distanciaRealDemaisM?: number;
  temSubsolo?: boolean;
}): ResultadoSaidas {
  // Busca por divisão primeiro (linha específica da planilha da IT 11);
  // se não houver, usa a linha do grupo.
  const coef = COEFICIENTES_POPULACAO[params.divisao]
    ?? COEFICIENTES_POPULACAO[params.grupo]
    ?? COEFICIENTES_POPULACAO.M;
  const capacidade = CAPACIDADE_UP[params.divisao]
    ?? CAPACIDADE_UP[params.grupo]
    ?? CAPACIDADE_UP.M;

  // Divisões cuja população se calcula por dormitórios (duas pessoas por dormitório)
  const usaDormitorios = ['A-1', 'A-2', 'A-3', 'H-2'].includes(params.divisao);

  // Larguras mínimas por ocupação (item 5.4.2 da IT 11)
  const minimos = upMinimas(params.divisao);

  // ---- 2. População por pavimento (P) ----
  const pavimentos: PavimentoCalculado[] = params.pavimentosEntrada.map((pav) => {
    let populacao: number;
    let memoria: string;
    if (pav.populacaoManual && pav.populacaoManual > 0) {
      populacao = Math.ceil(pav.populacaoManual);
      memoria = `P = ${populacao} pessoas (população informada pelo responsável)`;
    } else if (usaDormitorios && pav.dormitorios !== undefined && pav.dormitorios >= 0) {
      populacao = pav.dormitorios * 2;
      memoria = `P = ${pav.dormitorios} dormitório(s) × 2 = ${populacao} pessoas`;
    } else {
      populacao = Math.ceil(pav.areaM2 / coef.m2PorPessoa);
      const coefTxt = coef.m2PorPessoa < 1
        ? `× ${(1 / coef.m2PorPessoa).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} pessoas/m²`
        : `/ ${coef.m2PorPessoa.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m²/pessoa`;
      memoria = `P = ${pav.areaM2.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m² ${coefTxt} = ${populacao} pessoas`;
    }
    // 3. Acessos: dimensionados pavimento a pavimento
    return {
      nome: pav.nome,
      areaM2: pav.areaM2,
      populacao,
      memoria,
      acessos: dimensionar(populacao, capacidade.acessos, 'acessos', minimos.acessos),
    };
  });

  const populacaoTotal = pavimentos.reduce((s, pav) => s + pav.populacao, 0);
  const critico = pavimentos.reduce(
    (max, pav) => (pav.populacao > max.populacao ? pav : max),
    pavimentos[0] ?? { nome: '—', populacao: 0 } as PavimentoCalculado,
  );
  const populacaoCritica = critico?.populacao ?? 0;
  const populacaoAdotada = params.populacaoInformada && params.populacaoInformada > 0
    ? params.populacaoInformada
    : populacaoTotal;

  // ---- 3. Escadas, rampas, descargas e portas: pela população crítica ----
  // Larguras mínimas por ocupação (5.4.2) e luz de portas (5.5.4.3)
  const dimensionamento = {
    escadas: dimensionar(populacaoCritica, capacidade.escadas, 'escadas', minimos.escadas),
    rampas: dimensionar(populacaoCritica, capacidade.escadas, 'rampas', minimos.rampas),
    descargas: dimensionar(populacaoCritica, capacidade.acessos, 'descargas', minimos.descargas),
    portas: dimensionarPortas(populacaoCritica, capacidade.portas),
  };

  // ---- 4. Tipo de escada (Anexo C — Tabela 3 da IT 11) ----
  const tipoEscada = classificarTipoEscada(params.grupo, params.divisao, params.alturaM, params.areaTotal);

  // ---- Distâncias máximas permitidas (tabela da IT 11) ----
  const cat = categoriaDistancia(params.grupo, params.divisao);
  const sp = params.temSprinklers ? 1 : 0;
  const su = params.saidaUnica ? 0 : 1;
  const det = params.temDeteccao ? 1 : 0;
  const distTerreo = DIST[cat - 1][0][sp][su][det];
  const distSuperior = DIST[cat - 1][1][sp][su][det];

  // ---- Quantitativo mínimo de saídas e escadas ----
  const populacaoAdotadaTmp = params.populacaoInformada && params.populacaoInformada > 0
    ? params.populacaoInformada
    : populacaoTotal;
  let numeroMinimoSaidas = populacaoCritica >= 50 ? 2 : 1;
  let criterioSaidas = populacaoCritica >= 50
    ? `P ≥ 50 pessoas no pavimento crítico`
    : `P < 50 e Grupo ${params.grupo}`;
  // 5.4.3.4: Grupo F com capacidade acima de 300 pessoas — mínimo 2 saídas
  // com, no mínimo, 10 m entre elas.
  if (params.grupo === 'F' && populacaoAdotadaTmp > 300 && numeroMinimoSaidas < 2) {
    numeroMinimoSaidas = 2;
    criterioSaidas = 'Grupo F com capacidade acima de 300 pessoas (item 5.4.3.4) — mínimo 2 saídas com 10 m entre elas';
  }

  // 5.5.3.5/5.5.3.6 e nota (i) da Tabela 3: nº mínimo de escadas
  let escadasMinimas = 1;
  if (params.alturaM > 36 && params.divisao !== 'A-2') escadasMinimas = 2;

  // ---- Exigências específicas da IT 11 aplicáveis ao projeto ----
  const exigenciasEspecificas: { id: string; texto: string; referencia: string }[] = [];
  const exigir = (id: string, texto: string, referencia: string) =>
    exigenciasEspecificas.push({ id, texto, referencia });

  if (params.grupo === 'F' && populacaoAdotadaTmp > 300) {
    exigir(
      'f_duas_saidas',
      'Mínimo de 2 saídas de emergência com, no mínimo, 10 m entre elas (Grupo F com capacidade acima de 300 pessoas)',
      'IT 11, 5.4.3.4',
    );
  }
  if (params.alturaM > 36 && params.divisao !== 'A-2') {
    exigir('duas_escadas', 'Mínimo de 2 escadas de emergência (altura acima de 36 m)', 'IT 11, 5.5.3.5');
  }
  if (params.divisao === 'A-2' && params.alturaM > 80) {
    exigir(
      'a2_duas_escadas',
      'A-2 acima de 80 m: mínimo de 2 escadas se houver mais de 4 unidades habitacionais por pavimento',
      'IT 11, 5.5.3.6',
    );
  }
  // 5.9.1 — Elevador de emergência
  if (['H-2', 'H-3'].includes(params.divisao) && params.alturaM > 12) {
    exigir('elevador', 'Elevador de emergência obrigatório (H-2/H-3 acima de 12 m)', 'IT 11, 5.9.1');
  } else if (['A-2', 'A-3'].includes(params.divisao) && params.alturaM > 80) {
    exigir('elevador', 'Elevador de emergência obrigatório (residencial acima de 80 m)', 'IT 11, 5.9.1');
  } else if (!['A-1', 'A-2', 'A-3'].includes(params.divisao) && params.alturaM > 60) {
    exigir('elevador', 'Elevador de emergência obrigatório (altura acima de 60 m)', 'IT 11, 5.9.1');
  }
  // 5.10.2 — Área de refúgio
  if (['E-5', 'E-6'].includes(params.divisao)) {
    exigir('refugio', 'Área de refúgio obrigatória (mínimo 30% da área do pavimento)', 'IT 11, 5.10.2');
  } else if (params.divisao === 'H-2' && params.alturaM > 12) {
    exigir('refugio', 'Área de refúgio obrigatória em H-2 acima de 12 m (mínimo 30% da área do pavimento)', 'IT 11, 5.10.2');
  } else if (params.divisao === 'H-3' && params.alturaM > 6) {
    exigir('refugio', 'Área de refúgio obrigatória em H-3 acima de 6 m ou com internação (mínimo 30% da área do pavimento)', 'IT 11, 5.10.2');
  }
  // 5.5.4.6 — Barra antipânico
  if (params.grupo === 'F' && populacaoAdotadaTmp > 100) {
    exigir('barra_antipanico', 'Barra antipânico obrigatória nas portas de saída de emergência (Grupo F acima de 100 pessoas — NBR 11785)', 'IT 11, 5.5.4.6');
  }
  // 5.12 — Painel eletrônico de contagem
  if (['F-6', 'F-7'].includes(params.divisao) && populacaoAdotadaTmp > 500) {
    exigir('painel_contagem', 'Painel eletrônico de contagem de público em tempo real (reunião de público acima de 500 pessoas)', 'IT 11, 5.12');
  }
  // Nota (l) da Tabela 3 e 5.5.3.8 — Subsolos
  if (params.temSubsolo) {
    exigir(
      'subsolo_pcf',
      'Escadas/rampas provenientes de subsolos compartimentadas com PCF P-90 em relação aos pisos contíguos',
      'IT 11, 5.5.3.8 e nota (l) da Tabela 3',
    );
    if (!['G-1', 'G-2'].includes(params.divisao)) {
      exigir(
        'subsolo_pressurizacao',
        'Subsolos com profundidade acima de 12 m (exceto garagens G-1/G-2) exigem pressurização da escada',
        'Nota (l) da Tabela 3 da IT 11',
      );
    }
  }
  // 5.5.3.7 — Altura extrema
  if (params.alturaM > 150) {
    exigir('comissao_tecnica', 'Edificação acima de 150 m: condições das saídas analisadas por Comissão Técnica', 'IT 11, 5.5.3.7');
  }

  // ---- 5. Veredito de conformidade ----
  const realTerreo = params.distanciaRealTerreoM ?? 0;
  const realDemais = params.distanciaRealDemaisM ?? 0;
  const conformidade = {
    distanciaTerreo: {
      realM: realTerreo,
      permitidoM: distTerreo,
      conforme: distTerreo === null ? null : realTerreo <= 0 ? null : realTerreo <= distTerreo,
    },
    distanciaDemais: {
      realM: realDemais,
      permitidoM: distSuperior,
      conforme: distSuperior === null ? null : realDemais <= 0 ? null : realDemais <= distSuperior,
    },
    saidas: {
      existente: params.saidaUnica ? 'Saída única' : 'Mais de uma saída',
      minimo: numeroMinimoSaidas,
      criterio: criterioSaidas,
      conforme: params.saidaUnica ? numeroMinimoSaidas <= 1 : true,
    },
  };

  return {
    divisao: params.divisao,
    descricaoOcupacao: params.descricaoOcupacao ?? '',
    coeficiente: coef.descricao,
    usaDormitorios,
    capacidadeUP: { ...capacidade },
    pavimentos,
    populacaoCritica,
    pavimentoCritico: critico?.nome ?? '—',
    populacaoTotal,
    populacaoAdotada,
    populacaoCalculada: populacaoTotal,
    dimensionamento,
    tipoEscada,
    escadasMinimas,
    exigenciasEspecificas,
    distanciaMaxima: {
      pisoDescargaM: distTerreo,
      demaisPavimentosM: distSuperior,
      consideracoes: distTerreo === null
        ? 'Combinação não tabelada na Tabela 2 da IT 11 para esta ocupação — consultar o CBMBA.'
        : `Valores da Tabela 2 (Anexo B) considerando ${params.temSprinklers ? 'presença' : 'ausência'} de chuveiros automáticos, ` +
          `${params.temDeteccao ? 'com' : 'sem'} detecção automática e ${params.saidaUnica ? 'saída única' : 'mais de uma saída'}. ` +
          'Sem leiaute definido em planta, considerar as distâncias diretas reduzidas em 30% (5.5.2.2.1). ' +
          'Havendo mais de uma saída, distância mínima de 10 m entre elas (nota "d"). Áreas técnicas: máximo 140 m (5.5.2.4).',
    },
    conformidade,
    numeroMinimoSaidas,
  };
}
