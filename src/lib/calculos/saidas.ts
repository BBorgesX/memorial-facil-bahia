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

// ---------------------------------------------------------------------------
// Tipo de escada — Anexo C (Tabela 3) da IT 11
// ---------------------------------------------------------------------------

export interface TipoEscada {
  sigla: 'NE' | 'EP' | 'PF';
  descricao: string;
  base: string;
  /**
   * true enquanto a classificação usar a regra simplificada por grupo/altura.
   * // TODO: VALIDAR — substituir pela Tabela 3 (Anexo C) da IT 11 do CBMBA
   * // ("Tipos de escadas de emergência por ocupação"), com as faixas de
   * // altura POR DIVISÃO, assim que a tabela oficial for fornecida.
   */
  preliminar: boolean;
}

/**
 * Classificação simplificada do tipo de escada exigido (Anexo C da IT 11 /
 * Tabela 9 da NBR 9077), em função do grupo de ocupação e da altura:
 * - NE: escada comum (não enclausurada);
 * - EP: escada protegida (enclausurada protegida);
 * - PF: escada enclausurada à prova de fumaça.
 */
export function classificarTipoEscada(grupo: string, divisao: string, alturaM: number): TipoEscada {
  const nomes: Record<TipoEscada['sigla'], string> = {
    NE: 'Escada Comum (Não Enclausurada)',
    EP: 'Escada Protegida (Enclausurada Protegida)',
    PF: 'Escada Enclausurada à Prova de Fumaça',
  };
  const montar = (sigla: TipoEscada['sigla'], base: string): TipoEscada =>
    ({ sigla, descricao: nomes[sigla], base, preliminar: true });

  // Habitação unifamiliar: sempre escada comum
  if (divisao === 'A-1') return montar('NE', 'Habitação unifamiliar (A-1) — escada comum em qualquer altura');

  // Ocupações com maior exigência (saúde/institucional e explosivos):
  // protegida a partir de 6 m e à prova de fumaça acima de 23 m
  if (grupo === 'H' || grupo === 'L') {
    if (alturaM > 23) return montar('PF', `Grupo ${grupo} com H > 23 m`);
    if (alturaM > 6) return montar('EP', `Grupo ${grupo} com 6 m < H ≤ 23 m`);
    return montar('NE', `Grupo ${grupo} com H ≤ 6 m`);
  }

  // Regra geral das demais ocupações
  if (alturaM > 30) return montar('PF', 'H > 30 m');
  if (alturaM > 12) return montar('EP', '12 m < H ≤ 30 m');
  return montar('NE', 'H ≤ 12 m');
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

const MIN_UP = 2; // largura mínima normativa de 1,10 m (2 unidades de passagem)

function dimensionar(populacao: number, capacidade: number, rotulo: string) {
  const calculado = Math.ceil(populacao / capacidade);
  const unidades = Math.max(MIN_UP, calculado);
  return {
    unidades,
    larguraM: unidades * LARGURA_UP_M,
    memoria: `N = ${populacao} / ${capacidade} = ${calculado} → adotado ${unidades} U.P. · W = ${unidades} × 0,55 = ${(unidades * LARGURA_UP_M).toFixed(2).replace('.', ',')} m (${rotulo})`,
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
      acessos: dimensionar(populacao, capacidade.acessos, 'acessos'),
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
  const dimensionamento = {
    escadas: dimensionar(populacaoCritica, capacidade.escadas, 'escadas'),
    rampas: dimensionar(populacaoCritica, capacidade.escadas, 'rampas'),
    descargas: dimensionar(populacaoCritica, capacidade.acessos, 'descargas'),
    portas: dimensionar(populacaoCritica, capacidade.portas, 'portas'),
  };

  // ---- 4. Tipo de escada (Anexo C, Tabela 3) ----
  const tipoEscada = classificarTipoEscada(params.grupo, params.divisao, params.alturaM);

  // ---- Distâncias máximas permitidas (tabela da IT 11) ----
  const cat = categoriaDistancia(params.grupo, params.divisao);
  const sp = params.temSprinklers ? 1 : 0;
  const su = params.saidaUnica ? 0 : 1;
  const det = params.temDeteccao ? 1 : 0;
  const distTerreo = DIST[cat - 1][0][sp][su][det];
  const distSuperior = DIST[cat - 1][1][sp][su][det];

  // ---- Quantitativo mínimo de saídas ----
  const numeroMinimoSaidas = populacaoCritica >= 50 ? 2 : 1;
  const criterioSaidas = populacaoCritica >= 50
    ? `P ≥ 50 pessoas no pavimento crítico`
    : `P < 50 e Grupo ${params.grupo}`;

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
    distanciaMaxima: {
      pisoDescargaM: distTerreo,
      demaisPavimentosM: distSuperior,
      consideracoes: distTerreo === null
        ? 'Combinação não tabelada na IT 11 para esta ocupação — consultar o CBMBA.'
        : `Valores considerando ${params.temSprinklers ? 'presença' : 'ausência'} de chuveiros automáticos, ${params.temDeteccao ? 'com' : 'sem'} detecção automática de fumaça e ${params.saidaUnica ? 'saída única' : 'mais de uma saída'}.`,
    },
    conformidade,
    numeroMinimoSaidas,
  };
}
