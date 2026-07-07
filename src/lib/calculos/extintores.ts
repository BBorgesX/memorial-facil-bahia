/**
 * IT 21/2017 (CBMBA) — Sistema de Proteção por Extintores de Incêndio
 * (complementada pela NBR 12693).
 *
 * Parâmetros por nível de risco (carga de incêndio — Tabela 3 do Decreto):
 * - Capacidade extintora mínima por unidade;
 * - Distância máxima a ser percorrida até o extintor;
 * - Área máxima protegida por unidade extintora (base para estimativa de quantidade).
 */

import { NivelRisco } from '../normas/classificacao';

interface ParametroExtintor {
  capacidadeA: string;
  capacidadeBC: string;
  distanciaMaximaM: number;
  areaPorUnidadeM2: number;
}

const PARAMETROS: Record<NivelRisco, ParametroExtintor> = {
  Baixo: { capacidadeA: '2-A', capacidadeBC: '20-B:C', distanciaMaximaM: 25, areaPorUnidadeM2: 500 },
  Médio: { capacidadeA: '3-A', capacidadeBC: '40-B:C', distanciaMaximaM: 20, areaPorUnidadeM2: 250 },
  Alto: { capacidadeA: '4-A', capacidadeBC: '80-B:C', distanciaMaximaM: 15, areaPorUnidadeM2: 150 },
};

export interface ResultadoExtintores {
  capacidadeMinima: string;
  distanciaMaximaM: number;
  quantidadeEstimada: number;
  tiposRecomendados: string[];
  observacao: string;
}

export function calcularExtintores(params: {
  cargaNivel: NivelRisco;
  areaTotal: number;
  pavimentos: number;
}): ResultadoExtintores {
  const p = PARAMETROS[params.cargaNivel];
  // Ao menos 1 unidade extintora por pavimento; estimativa por área protegida
  const porArea = Math.ceil(params.areaTotal / p.areaPorUnidadeM2);
  const quantidade = Math.max(porArea, Math.max(1, params.pavimentos) * 2);
  return {
    capacidadeMinima: `${p.capacidadeA} / ${p.capacidadeBC}`,
    distanciaMaximaM: p.distanciaMaximaM,
    quantidadeEstimada: quantidade,
    tiposRecomendados: [
      'Pó químico ABC 4/6 kg — proteção geral (classes A, B e C)',
      'Água pressurizada 10 L — áreas com predominância de classe A',
      'CO₂ 6 kg — quadros elétricos, CPDs e equipamentos energizados',
    ],
    observacao:
      'Quantidade estimada pela área máxima protegida por unidade extintora e mínimo de 2 unidades por pavimento. ' +
      'A distribuição definitiva deve ser lançada em planta, respeitando a distância máxima de caminhamento, ' +
      'instalação a no máximo 1,60 m do piso (parte superior) e sinalização conforme IT 20.',
  };
}
