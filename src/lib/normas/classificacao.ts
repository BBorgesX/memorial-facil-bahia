/**
 * TABELAS 2 e 3 do Decreto Estadual nº 16.302/2015 (Bahia)
 * - Tabela 2: classificação das edificações quanto à altura.
 * - Tabela 3: classificação das edificações quanto à carga de incêndio.
 */

export interface ClassificacaoAltura {
  tipo: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  denominacao: string;
  descricao: string;
}

export const TABELA_2_ALTURA: ClassificacaoAltura[] = [
  { tipo: 'I', denominacao: 'Edificação Térrea', descricao: 'Um pavimento' },
  { tipo: 'II', denominacao: 'Edificação Baixa', descricao: 'H ≤ 6,00 m' },
  { tipo: 'III', denominacao: 'Edificação de Baixa-Média Altura', descricao: '6,00 m < H ≤ 12,00 m' },
  { tipo: 'IV', denominacao: 'Edificação de Média Altura', descricao: '12,00 m < H ≤ 23,00 m' },
  { tipo: 'V', denominacao: 'Edificação Mediamente Alta', descricao: '23,00 m < H ≤ 30,00 m' },
  { tipo: 'VI', denominacao: 'Edificação Alta', descricao: 'Acima de 30,00 m' },
];

/** Classifica automaticamente pela altura (m) e nº de pavimentos — Tabela 2. */
export function classificarAltura(alturaM: number, pavimentos: number): ClassificacaoAltura {
  if (pavimentos <= 1) return TABELA_2_ALTURA[0];
  if (alturaM <= 6) return TABELA_2_ALTURA[1];
  if (alturaM <= 12) return TABELA_2_ALTURA[2];
  if (alturaM <= 23) return TABELA_2_ALTURA[3];
  if (alturaM <= 30) return TABELA_2_ALTURA[4];
  return TABELA_2_ALTURA[5];
}

export type NivelRisco = 'Baixo' | 'Médio' | 'Alto';

export interface ClassificacaoCarga {
  nivel: NivelRisco;
  descricao: string;
}

export const TABELA_3_CARGA: ClassificacaoCarga[] = [
  { nivel: 'Baixo', descricao: 'Carga de incêndio até 300 MJ/m²' },
  { nivel: 'Médio', descricao: 'Carga de incêndio entre 300 e 1.200 MJ/m²' },
  { nivel: 'Alto', descricao: 'Carga de incêndio acima de 1.200 MJ/m²' },
];

/** Classifica automaticamente pela carga de incêndio (MJ/m²) — Tabela 3. */
export function classificarCarga(cargaMJm2: number): ClassificacaoCarga {
  if (cargaMJm2 <= 300) return TABELA_3_CARGA[0];
  if (cargaMJm2 <= 1200) return TABELA_3_CARGA[1];
  return TABELA_3_CARGA[2];
}

/**
 * Cargas de incêndio típicas por divisão de ocupação (valores de referência
 * do Anexo A da IT-14/CBMSP, adotados como sugestão inicial — o responsável
 * técnico deve confirmar o valor real da edificação).
 */
export const CARGA_INCENDIO_SUGERIDA: Record<string, number> = {
  'A-1': 300, 'A-2': 300, 'A-3': 300,
  'B-1': 500, 'B-2': 500,
  'C-1': 300, 'C-2': 800, 'C-3': 800,
  'D-1': 700, 'D-2': 300, 'D-3': 400, 'D-4': 500,
  'E-1': 300, 'E-2': 300, 'E-3': 150, 'E-4': 300, 'E-5': 300, 'E-6': 300,
  'F-1': 800, 'F-2': 200, 'F-3': 150, 'F-4': 200, 'F-5': 600, 'F-6': 600,
  'F-7': 300, 'F-8': 300, 'F-9': 200, 'F-10': 500,
  'G-1': 200, 'G-2': 300, 'G-3': 300, 'G-4': 300, 'G-5': 600,
  'H-1': 300, 'H-2': 300, 'H-3': 300, 'H-4': 450, 'H-5': 100, 'H-6': 300,
  'I-1': 300, 'I-2': 800, 'I-3': 1700,
  'J-1': 200, 'J-2': 300, 'J-3': 800, 'J-4': 1700,
  'L-1': 1500, 'L-2': 2000, 'L-3': 2000,
  'M-1': 200, 'M-2': 1700, 'M-3': 300, 'M-4': 500, 'M-5': 1700, 'M-6': 300, 'M-7': 800,
};
