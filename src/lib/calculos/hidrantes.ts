/**
 * IT 22/2016 (CBMBA) — Sistema de Hidrantes e Mangotinhos para Combate a Incêndio
 * (complementada pela NBR 13714).
 *
 * - Determinação do TIPO de sistema (1 a 5) em função da divisão de ocupação e
 *   da carga de incêndio (Tabela da IT 22).
 * - Determinação da RESERVA TÉCNICA DE INCÊNDIO (RTI) em função do tipo de
 *   sistema e da área construída (Tabela da IT 22).
 * (Lógica reaproveitada da calculadora de RTI do sistema anterior.)
 */

import { NivelRisco } from '../normas/classificacao';

type GrupoRTI = 'g1' | 'g2' | 'g3' | 'g4' | 'g5';

/**
 * Mapeia a divisão de ocupação + nível de carga de incêndio para o grupo/tipo
 * de sistema de hidrantes da IT 22.
 */
function grupoSistema(divisao: string, carga: NivelRisco): GrupoRTI {
  // Divisões cujo tipo depende da carga de incêndio
  const dependeCarga: Record<string, { baixa: GrupoRTI; media: GrupoRTI; alta: GrupoRTI }> = {
    'D-1': { baixa: 'g1', media: 'g2', alta: 'g2' },
    'D-3': { baixa: 'g1', media: 'g2', alta: 'g2' },
    'D-4': { baixa: 'g1', media: 'g2', alta: 'g2' },
    'F-1': { baixa: 'g1', media: 'g2', alta: 'g2' },
    'C-2': { baixa: 'g2', media: 'g2', alta: 'g3' },
    'I-2': { baixa: 'g2', media: 'g2', alta: 'g3' },
    'J-3': { baixa: 'g2', media: 'g2', alta: 'g3' },
  };
  if (dependeCarga[divisao]) {
    const m = dependeCarga[divisao];
    return carga === 'Baixo' ? m.baixa : carga === 'Médio' ? m.media : m.alta;
  }

  const tipo1 = ['A-2', 'A-3', 'C-1', 'D-2', 'E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'F-2', 'F-3', 'F-4', 'F-8', 'G-1', 'G-2', 'G-3', 'G-4', 'H-1', 'H-2', 'H-3', 'H-5', 'H-6', 'I-1', 'J-1', 'J-2', 'M-3'];
  const tipo2 = ['B-1', 'B-2', 'C-3', 'F-5', 'F-6', 'F-7', 'F-9', 'F-10', 'H-4'];
  const tipo3 = ['L-1', 'M-1', 'M-5'];
  const tipo4 = ['G-5', 'I-3', 'J-4', 'L-2', 'L-3'];

  if (tipo1.includes(divisao)) return 'g1';
  if (tipo2.includes(divisao)) return 'g2';
  if (tipo3.includes(divisao)) return 'g3';
  if (tipo4.includes(divisao)) return 'g4';
  // M-2 e casos especiais de alto risco → tipo 5
  if (divisao === 'M-2') return 'g5';
  return 'g1';
}

/** Tabela RTI (m³) por tipo de sistema × faixa de área construída — IT 22. */
const TABELA_RTI: Record<GrupoRTI, number[]> = {
  //        ≤2500 ≤5000 ≤10000 ≤20000 ≤50000 >50000
  g1: [5, 8, 12, 18, 25, 35],
  g2: [8, 12, 18, 25, 35, 48],
  g3: [12, 18, 25, 35, 48, 70],
  g4: [28, 32, 48, 70, 96, 120],
  g5: [32, 48, 64, 90, 120, 180],
};

function indiceFaixaArea(area: number): number {
  if (area <= 2500) return 0;
  if (area <= 5000) return 1;
  if (area <= 10000) return 2;
  if (area <= 20000) return 3;
  if (area <= 50000) return 4;
  return 5;
}

/**
 * Especificações por tipo de sistema — Tabela de tipos da IT 22 (esguicho,
 * mangueira, expedições, vazão mínima na válvula do hidrante mais desfavorável
 * e pressão residual mínima na ponta do esguicho mais desfavorável).
 */
const ESPECIFICACOES_TIPO: Record<GrupoRTI, {
  tipo: number;
  descricao: string;
  esguichoDN: number;
  mangueiraDN: number;
  mangueiraComprimentoM: number;
  expedicoes: 'simples' | 'duplo';
  vazaoMinima: number;
  pressaoMca: number;
}> = {
  g1: { tipo: 1, descricao: 'Sistema Tipo 1 — mangotinho DN 25 mm com mangueira semirrígida e esguicho regulável', esguichoDN: 25, mangueiraDN: 25, mangueiraComprimentoM: 30, expedicoes: 'simples', vazaoMinima: 100, pressaoMca: 30 },
  g2: { tipo: 2, descricao: 'Sistema Tipo 2 — hidrante DN 40 mm, expedição simples, com esguicho regulável', esguichoDN: 40, mangueiraDN: 40, mangueiraComprimentoM: 30, expedicoes: 'simples', vazaoMinima: 125, pressaoMca: 15 },
  g3: { tipo: 3, descricao: 'Sistema Tipo 3 — hidrante DN 40 mm, expedição dupla, com esguicho regulável', esguichoDN: 40, mangueiraDN: 40, mangueiraComprimentoM: 30, expedicoes: 'duplo', vazaoMinima: 200, pressaoMca: 15 },
  g4: { tipo: 4, descricao: 'Sistema Tipo 4 — hidrante DN 40/65 mm, expedição dupla, com esguicho regulável', esguichoDN: 40, mangueiraDN: 65, mangueiraComprimentoM: 30, expedicoes: 'duplo', vazaoMinima: 300, pressaoMca: 16 },
  g5: { tipo: 5, descricao: 'Sistema Tipo 5 — hidrante DN 65 mm, expedição dupla, com esguicho regulável', esguichoDN: 65, mangueiraDN: 65, mangueiraComprimentoM: 30, expedicoes: 'duplo', vazaoMinima: 600, pressaoMca: 21 },
};

export interface ResultadoHidrantes {
  sistemaTipo: number;
  descricaoSistema: string;
  rtiM3: number;
  vazaoMinimaLmin: number;
  esguichoDN: number;
  mangueiraDN: number;
  mangueiraComprimentoM: number;
  expedicoes: string;
  /** Pressão residual mínima na ponta do esguicho mais desfavorável (mca) */
  pressaoMinimaMca: number;
  /** Tempo mínimo de funcionamento garantido pela RTI (min) */
  duracaoMinutos: number;
}

export function calcularHidrantes(params: {
  divisao: string;
  cargaNivel: NivelRisco;
  areaTotal: number;
}): ResultadoHidrantes {
  const grupo = grupoSistema(params.divisao, params.cargaNivel);
  const rti = TABELA_RTI[grupo][indiceFaixaArea(params.areaTotal)];
  const spec = ESPECIFICACOES_TIPO[grupo];
  // RTI = Q × t → duração garantida com a vazão mínima de projeto
  const duracao = Math.round((rti * 1000) / spec.vazaoMinima);
  return {
    sistemaTipo: spec.tipo,
    descricaoSistema: spec.descricao,
    rtiM3: rti,
    vazaoMinimaLmin: spec.vazaoMinima,
    esguichoDN: spec.esguichoDN,
    mangueiraDN: spec.mangueiraDN,
    mangueiraComprimentoM: spec.mangueiraComprimentoM,
    expedicoes: spec.expedicoes,
    pressaoMinimaMca: spec.pressaoMca,
    duracaoMinutos: Math.min(duracao, 60),
  };
}
