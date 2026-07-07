/**
 * IT 17/2016 (CBMBA) — Brigada de Incêndio (complementada pela NBR 14276).
 *
 * Tabela A.1: composição mínima da brigada por população fixa e nível de risco:
 * - Risco Baixo: 2 brigadistas até 10 pessoas; acima, +1 a cada 20 pessoas;
 * - Risco Médio: 4 brigadistas até 10 pessoas; acima, +1 a cada 15 pessoas;
 * - Risco Alto: 8 brigadistas até 10 pessoas; acima, +1 a cada 10 pessoas.
 * (Lógica reaproveitada do gerador de memorial de brigada do sistema anterior.)
 */

import { NivelRisco } from '../normas/classificacao';

const TABELA_A1: Record<NivelRisco, { base: number; divisor: number }> = {
  Baixo: { base: 2, divisor: 20 },
  Médio: { base: 4, divisor: 15 },
  Alto: { base: 8, divisor: 10 },
};

/** Nível mínimo de treinamento da brigada por divisão de ocupação (IT 17). */
const TREINAMENTO_POR_DIVISAO: Record<string, string> = {
  'A-3': 'Intermediário',
  'B-1': 'Intermediário', 'B-2': 'Intermediário',
  'C-2': 'Intermediário', 'C-3': 'Intermediário',
  'E-1': 'Intermediário', 'E-2': 'Intermediário', 'E-3': 'Intermediário',
  'E-4': 'Intermediário', 'E-5': 'Intermediário', 'E-6': 'Intermediário',
  'F-5': 'Intermediário', 'F-6': 'Intermediário', 'F-7': 'Intermediário',
  'H-2': 'Intermediário', 'H-4': 'Intermediário',
  'I-1': 'Intermediário', 'I-2': 'Intermediário', 'I-3': 'Avançado',
  'J-2': 'Intermediário', 'J-3': 'Intermediário', 'J-4': 'Intermediário',
  'L-1': 'Intermediário', 'L-2': 'Avançado', 'L-3': 'Avançado',
  'M-1': 'Avançado', 'M-2': 'Avançado', 'M-3': 'Intermediário',
  'M-5': 'Intermediário', 'M-6': 'Intermediário', 'M-7': 'Intermediário',
};

export interface ResultadoBrigada {
  quantidadeMinima: number;
  nivelTreinamento: string;
  cargaHoraria: string;
  composicao: string;
}

export function calcularBrigada(params: {
  divisao: string;
  cargaNivel: NivelRisco;
  populacaoFixa: number;
}): ResultadoBrigada {
  const { base, divisor } = TABELA_A1[params.cargaNivel];
  const pop = Math.max(1, params.populacaoFixa);
  const quantidade = pop <= 10 ? Math.min(pop, base) : base + Math.ceil((pop - 10) / divisor);

  const nivel = TREINAMENTO_POR_DIVISAO[params.divisao]
    ?? (params.cargaNivel === 'Alto' ? 'Avançado' : params.cargaNivel === 'Médio' ? 'Intermediário' : 'Básico');

  const cargaHoraria = nivel === 'Avançado' ? '24 horas (módulos teórico e prático)'
    : nivel === 'Intermediário' ? '16 horas (módulos teórico e prático)'
    : '8 horas (módulos teórico e prático)';

  return {
    quantidadeMinima: quantidade,
    nivelTreinamento: nivel,
    cargaHoraria,
    composicao: `Mínimo de ${quantidade} brigadista(s) por turno de trabalho, distribuído(s) por pavimento/setor, com coordenador geral da brigada designado. Reciclagem anual obrigatória e exercício simulado a cada 6 meses.`,
  };
}
