/**
 * Configuração normativa — BAHIA (CBMBA).
 *
 * Camada de dados por UF do FirePro Suite: toda referência de IT, legislação
 * e exigência exibida na interface vem daqui (nunca "chumbada" no componente).
 *
 * As referências abaixo vêm da lógica já validada do Memorial Fácil Bahia
 * (Decreto Estadual nº 16.302/2015 e ITs do CBMBA) — fonte:
 * src/lib/normas/exigencias.ts.
 */

import { MEDIDAS_SEGURANCA } from '@/lib/normas/exigencias';
import type { ConfigUF } from './tipos';

export const NORMAS_BA: ConfigUF = {
  uf: 'BA',
  orgao: 'CBMBA',
  orgaoNomeCompleto: 'Corpo de Bombeiros Militar da Bahia',
  legislacao: 'Lei Estadual nº 12.929/2013 e Decreto Estadual nº 16.302/2015',
  linkITs: 'http://www.cbm.ba.gov.br/instrucao-tecnica',
  certificado: 'AVCB — Auto de Vistoria do Corpo de Bombeiros',
  /** Lógica e numeração de ITs validadas pelos apps originais da Bahia. */
  validado: true,
  avisoValidacao: '',
  // Referência normativa por medida de segurança (id → IT do CBMBA)
  referencias: Object.fromEntries(MEDIDAS_SEGURANCA.map((m) => [m.id, m.referencia])),
};
