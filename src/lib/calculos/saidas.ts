/**
 * IT 11/2016 (CBMBA) — Saídas de Emergência (complementada pela NBR 9077).
 *
 * - Cálculo da população (coeficientes por ocupação — Tabela da IT 11/NBR 9077);
 * - Dimensionamento das saídas em unidades de passagem (N = P / C);
 * - Distâncias máximas a serem percorridas (Tabela da IT 11, reaproveitada da
 *   ferramenta "Consulta de distâncias máximas" do sistema anterior).
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
  'F-6': { descricao: 'Três pessoas por 1 m² de área', m2PorPessoa: 1 / 3 },
  'F-7': { descricao: 'Três pessoas por 1 m² de área', m2PorPessoa: 1 / 3 },
  'F-8': { descricao: 'Uma pessoa por 1 m² de área', m2PorPessoa: 1 },
  'F-9': { descricao: 'Duas pessoas por 1 m² de área', m2PorPessoa: 0.5 },
  'F-10': { descricao: 'Uma pessoa por 3 m² de área', m2PorPessoa: 3 },
  'G-1': { descricao: 'Uma pessoa por 40 vagas de veículos (adotado ≈ 40 m² por pessoa)', m2PorPessoa: 40 },
  'G-2': { descricao: 'Uma pessoa por 40 vagas de veículos (adotado ≈ 40 m² por pessoa)', m2PorPessoa: 40 },
  'G-3': { descricao: 'Uma pessoa por 40 vagas de veículos (adotado ≈ 40 m² por pessoa)', m2PorPessoa: 40 },
  'G-4': { descricao: 'Uma pessoa por 20 m² de área', m2PorPessoa: 20 },
  'G-5': { descricao: 'Uma pessoa por 20 m² de área', m2PorPessoa: 20 },
  'H-1': { descricao: 'Uma pessoa por 7 m² de área', m2PorPessoa: 7 },
  'H-2': { descricao: 'Duas pessoas por dormitório e uma pessoa por 4 m² de alojamento', m2PorPessoa: 4 },
  'H-3': { descricao: 'Uma pessoa por leito e uma pessoa por 7 m² de área de ambulatório', m2PorPessoa: 7 },
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

export interface ResultadoSaidas {
  populacaoCalculada: number;
  populacaoAdotada: number;
  coeficiente: string;
  /** Capacidade de uma unidade de passagem (pessoas) usada no cálculo */
  capacidadeUP: { acessos: number; escadas: number; portas: number };
  unidadesPassagem: { acessos: number; escadas: number; portas: number };
  larguraMinima: { acessosM: number; escadasM: number; portasM: number };
  distanciaMaxima: {
    pisoDescargaM: number | null;
    demaisPavimentosM: number | null;
    consideracoes: string;
  };
  numeroMinimoSaidas: number;
}

export function calcularSaidas(params: {
  grupo: string;
  divisao: string;
  areaTotal: number;
  pavimentos: number;
  populacaoInformada?: number;
  temSprinklers: boolean;
  temDeteccao: boolean;
  saidaUnica: boolean;
}): ResultadoSaidas {
  // Busca por divisão primeiro (linha específica da planilha da IT 11);
  // se não houver, usa a linha do grupo.
  const coef = COEFICIENTES_POPULACAO[params.divisao]
    ?? COEFICIENTES_POPULACAO[params.grupo]
    ?? COEFICIENTES_POPULACAO.M;
  const populacaoCalculada = Math.ceil(params.areaTotal / coef.m2PorPessoa);
  const populacaoAdotada = params.populacaoInformada && params.populacaoInformada > 0
    ? params.populacaoInformada
    : populacaoCalculada;

  const capacidade = CAPACIDADE_UP[params.divisao]
    ?? CAPACIDADE_UP[params.grupo]
    ?? CAPACIDADE_UP.M;

  // População por pavimento (distribuição uniforme — conservador usar o total
  // quando térrea/um pavimento)
  const populacaoPavimento = Math.ceil(populacaoAdotada / Math.max(1, params.pavimentos));

  const nAcessos = Math.max(1, Math.ceil(populacaoPavimento / capacidade.acessos));
  const nEscadas = Math.max(1, Math.ceil(populacaoPavimento / capacidade.escadas));
  const nPortas = Math.max(1, Math.ceil(populacaoPavimento / capacidade.portas));

  const cat = categoriaDistancia(params.grupo, params.divisao);
  const sp = params.temSprinklers ? 1 : 0;
  const su = params.saidaUnica ? 0 : 1;
  const det = params.temDeteccao ? 1 : 0;
  const distTerreo = DIST[cat - 1][0][sp][su][det];
  const distSuperior = DIST[cat - 1][1][sp][su][det];

  // Número mínimo de saídas: 2 quando população > 100 ou distância excedida —
  // regra geral simplificada da IT 11 (varia por ocupação)
  const numeroMinimoSaidas = populacaoAdotada > 100 || params.pavimentos > 3 ? 2 : 1;

  return {
    populacaoCalculada,
    populacaoAdotada,
    coeficiente: coef.descricao,
    capacidadeUP: { ...capacidade },
    unidadesPassagem: { acessos: nAcessos, escadas: nEscadas, portas: nPortas },
    larguraMinima: {
      acessosM: Math.max(1.1, nAcessos * LARGURA_UP_M),
      escadasM: Math.max(1.1, nEscadas * LARGURA_UP_M),
      portasM: Math.max(0.8, nPortas * LARGURA_UP_M),
    },
    distanciaMaxima: {
      pisoDescargaM: distTerreo,
      demaisPavimentosM: distSuperior,
      consideracoes: distTerreo === null
        ? 'Combinação não tabelada na IT 11 para esta ocupação — consultar o CBMBA.'
        : `Valores considerando ${params.temSprinklers ? 'presença' : 'ausência'} de chuveiros automáticos, ${params.temDeteccao ? 'com' : 'sem'} detecção automática de fumaça e ${params.saidaUnica ? 'saída única' : 'mais de uma saída'}.`,
    },
    numeroMinimoSaidas,
  };
}
