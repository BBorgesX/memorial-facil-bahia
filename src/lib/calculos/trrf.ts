/**
 * IT 08/2016 (CBMBA) — Segurança Estrutural contra Incêndio.
 * Tabela A do Anexo: Tempo Requerido de Resistência ao Fogo (TRRF), em minutos,
 * em função do grupo/divisão de ocupação e da altura da edificação.
 * (Lógica reaproveitada da Calculadora TRRF do sistema anterior.)
 */

type FaixaAltura =
  | 'S2' // subsolo h > 10 m
  | 'S1' // subsolo h ≤ 10 m
  | 'P1' // h ≤ 6 m
  | 'P2_6_12'
  | 'P2_12_23'
  | 'P3_23_30'
  | 'P4_30_80'
  | 'P5_80_120'
  | 'P6_120_150'
  | 'P7_150_250';

type LinhaTRRF = Record<FaixaAltura, number | null>;

const TABELA_TRRF: Record<string, LinhaTRRF> = {
  // Grupo A
  'A': { S2: 90, S1: 60, P1: 30, P2_6_12: 30, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: 120, P6_120_150: 150, P7_150_250: 180 },
  // Grupo B
  'B': { S2: 90, S1: 60, P1: 30, P2_6_12: 60, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: 150, P6_120_150: 180, P7_150_250: 180 },
  // Grupo C
  'C-1': { S2: 90, S1: 60, P1: 60, P2_6_12: 60, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: 150, P6_120_150: 150, P7_150_250: 180 },
  'C-2': { S2: 90, S1: 60, P1: 60, P2_6_12: 60, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: 150, P6_120_150: 150, P7_150_250: 180 },
  'C-3': { S2: 90, S1: 60, P1: 30, P2_6_12: 60, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: 120, P6_120_150: 150, P7_150_250: 180 },
  // Grupo D (D-1 a D-4)
  'D': { S2: 90, S1: 60, P1: 30, P2_6_12: 60, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: 120, P6_120_150: 150, P7_150_250: 180 },
  // Grupo E
  'E': { S2: 90, S1: 60, P1: 30, P2_6_12: 30, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: 120, P6_120_150: 150, P7_150_250: 180 },
  // Grupo F
  'F-A': { S2: 90, S1: 60, P1: 60, P2_6_12: 60, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: 150, P6_120_150: 180, P7_150_250: null }, // F-1, F-2, F-3, F-6, F-8, F-10
  'F-B': { S2: 90, S1: 60, P1: 30, P2_6_12: 60, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: null, P6_120_150: null, P7_150_250: null }, // F-4, F-5, F-7, F-9
  // Grupo G
  'G-FECHADO': { S2: 90, S1: 60, P1: 30, P2_6_12: 60, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: 120, P6_120_150: 150, P7_150_250: 180 }, // G-1/G-2 não abertos
  'G-ABERTO': { S2: 90, S1: 60, P1: 30, P2_6_12: 30, P2_12_23: 30, P3_23_30: 30, P4_30_80: 60, P5_80_120: 120, P6_120_150: 150, P7_150_250: 150 }, // G-1/G-2 abertos lateralmente
  'G-345': { S2: 90, S1: 60, P1: 30, P2_6_12: 60, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: 120, P6_120_150: 150, P7_150_250: 180 }, // G-3, G-4, G-5
  // Grupo H
  'H-14': { S2: 90, S1: 60, P1: 30, P2_6_12: 60, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: 150, P6_120_150: 180, P7_150_250: 180 }, // H-1, H-4 (e H-6 assimilado)
  'H-235': { S2: 90, S1: 60, P1: 30, P2_6_12: 60, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: 150, P6_120_150: 180, P7_150_250: 180 }, // H-2, H-3, H-5
  // Grupo I
  'I-1': { S2: 90, S1: 60, P1: 30, P2_6_12: 30, P2_12_23: 30, P3_23_30: 60, P4_30_80: 120, P5_80_120: null, P6_120_150: null, P7_150_250: null },
  'I-2': { S2: 120, S1: 90, P1: 30, P2_6_12: 30, P2_12_23: 60, P3_23_30: 90, P4_30_80: 120, P5_80_120: null, P6_120_150: null, P7_150_250: null },
  'I-3': { S2: 120, S1: 90, P1: 60, P2_6_12: 60, P2_12_23: 90, P3_23_30: 120, P4_30_80: 120, P5_80_120: null, P6_120_150: null, P7_150_250: null },
  // Grupo J
  'J-1': { S2: 60, S1: 30, P1: null, P2_6_12: null, P2_12_23: 30, P3_23_30: 30, P4_30_80: 60, P5_80_120: null, P6_120_150: null, P7_150_250: null },
  'J-2': { S2: 90, S1: 60, P1: 30, P2_6_12: 30, P2_12_23: 30, P3_23_30: 30, P4_30_80: 60, P5_80_120: null, P6_120_150: null, P7_150_250: null },
  'J-3': { S2: 90, S1: 60, P1: 30, P2_6_12: 60, P2_12_23: 60, P3_23_30: 120, P4_30_80: 120, P5_80_120: null, P6_120_150: null, P7_150_250: null },
  'J-4': { S2: 120, S1: 90, P1: 60, P2_6_12: 60, P2_12_23: 90, P3_23_30: 120, P4_30_80: 120, P5_80_120: null, P6_120_150: null, P7_150_250: null },
  // Grupo L
  'L': { S2: 120, S1: 120, P1: 120, P2_6_12: 120, P2_12_23: 120, P3_23_30: 120, P4_30_80: null, P5_80_120: null, P6_120_150: null, P7_150_250: null },
  // Grupo M
  'M-1': { S2: 120, S1: 120, P1: 120, P2_6_12: null, P2_12_23: null, P3_23_30: null, P4_30_80: null, P5_80_120: null, P6_120_150: null, P7_150_250: null },
  'M-2': { S2: 120, S1: 90, P1: 60, P2_6_12: 60, P2_12_23: 90, P3_23_30: 120, P4_30_80: null, P5_80_120: null, P6_120_150: null, P7_150_250: null },
  'M-3': { S2: 120, S1: 90, P1: 90, P2_6_12: 90, P2_12_23: 120, P3_23_30: 120, P4_30_80: 120, P5_80_120: 150, P6_120_150: null, P7_150_250: null },
};

function chaveDivisao(grupo: string, divisao: string, garagemAberta = false): string | null {
  switch (grupo) {
    case 'A': return 'A';
    case 'B': return 'B';
    case 'C': return divisao; // C-1, C-2, C-3
    case 'D': return 'D';
    case 'E': return 'E';
    case 'F':
      return ['F-4', 'F-5', 'F-7', 'F-9'].includes(divisao) ? 'F-B' : 'F-A';
    case 'G':
      if (divisao === 'G-1' || divisao === 'G-2') return garagemAberta ? 'G-ABERTO' : 'G-FECHADO';
      return 'G-345';
    case 'H':
      return ['H-2', 'H-3', 'H-5'].includes(divisao) ? 'H-235' : 'H-14';
    case 'I': return divisao;
    case 'J': return divisao;
    case 'L': return 'L';
    case 'M':
      return ['M-1', 'M-2', 'M-3'].includes(divisao) ? divisao : null;
    default: return null;
  }
}

function faixaPorAltura(alturaM: number): FaixaAltura {
  if (alturaM <= 6) return 'P1';
  if (alturaM <= 12) return 'P2_6_12';
  if (alturaM <= 23) return 'P2_12_23';
  if (alturaM <= 30) return 'P3_23_30';
  if (alturaM <= 80) return 'P4_30_80';
  if (alturaM <= 120) return 'P5_80_120';
  if (alturaM <= 150) return 'P6_120_150';
  return 'P7_150_250';
}

export interface ResultadoTRRF {
  /** TRRF dos pavimentos, em minutos (null = consultar CBMBA / caso não tabelado) */
  pavimentos: number | null;
  /** TRRF do subsolo, em minutos (null se não há subsolo ou caso não tabelado) */
  subsolo: number | null;
  faixaAltura: string;
  observacao?: string;
}

export function calcularTRRF(params: {
  grupo: string;
  divisao: string;
  alturaM: number;
  temSubsolo: boolean;
  profundidadeSubsoloM?: number;
  garagemAberta?: boolean;
}): ResultadoTRRF {
  const { grupo, divisao, alturaM, temSubsolo, profundidadeSubsoloM = 0, garagemAberta } = params;
  const chave = chaveDivisao(grupo, divisao, garagemAberta);
  if (!chave || !TABELA_TRRF[chave]) {
    return {
      pavimentos: null,
      subsolo: null,
      faixaAltura: '-',
      observacao: 'Divisão sem TRRF tabelado na IT 08 — consultar o CBMBA (comissão técnica).',
    };
  }
  const linha = TABELA_TRRF[chave];
  const faixa = faixaPorAltura(alturaM);
  const pavimentos = linha[faixa];
  let subsolo: number | null = null;
  if (temSubsolo) {
    subsolo = profundidadeSubsoloM > 10 ? linha.S2 : linha.S1;
  }
  return {
    pavimentos,
    subsolo,
    faixaAltura: descricaoFaixa(faixa),
    observacao: pavimentos === null ? 'Altura fora das faixas tabeladas para esta ocupação — consultar o CBMBA.' : undefined,
  };
}

function descricaoFaixa(faixa: FaixaAltura): string {
  const mapa: Record<FaixaAltura, string> = {
    S2: 'Subsolo com h > 10 m',
    S1: 'Subsolo com h ≤ 10 m',
    P1: 'h ≤ 6 m',
    P2_6_12: '6 m < h ≤ 12 m',
    P2_12_23: '12 m < h ≤ 23 m',
    P3_23_30: '23 m < h ≤ 30 m',
    P4_30_80: '30 m < h ≤ 80 m',
    P5_80_120: '80 m < h ≤ 120 m',
    P6_120_150: '120 m < h ≤ 150 m',
    P7_150_250: '150 m < h ≤ 250 m',
  };
  return mapa[faixa];
}
