/**
 * Configuração normativa — SÃO PAULO (CBMSP / CBPMESP).
 *
 * ATENÇÃO — UF EM VALIDAÇÃO:
 * A numeração e os valores das Instruções Técnicas do CBMSP NÃO foram
 * importados de nenhum app validado pelo usuário. Por regra do produto,
 * NENHUM número de IT é inventado: cada referência abaixo aponta para a
 * "IT correspondente (CBMSP)" até que o responsável técnico confirme a
 * numeração vigente em https://cbaplang.corpodebombeiros.sp.gov.br.
 *
 * // TODO: VALIDAR COM A IT VIGENTE (CBMSP) — preencher a numeração real de
 * // cada medida abaixo e então mudar `validado` para true.
 *
 * Enquanto `validado === false`, todos os módulos exibem um aviso permanente
 * quando a UF ativa for SP, e a lógica de cálculo reutiliza a matriz já
 * validada da Bahia (os regulamentos de ambas as UFs derivam do mesmo
 * modelo de segurança contra incêndio; as diferenças devem ser ajustadas
 * na validação).
 */

import { MEDIDAS_SEGURANCA } from '@/lib/normas/exigencias';
import type { ConfigUF } from './tipos';

// TODO: VALIDAR COM A IT VIGENTE (CBMSP) — substituir cada entrada pela IT
// específica de São Paulo (a numeração difere da BA em várias medidas).
const referenciasSP: Record<string, string> = Object.fromEntries(
  MEDIDAS_SEGURANCA.map((m) => [m.id, `IT correspondente (CBMSP) — validar numeração vigente`]),
);

export const NORMAS_SP: ConfigUF = {
  uf: 'SP',
  orgao: 'CBMSP',
  orgaoNomeCompleto: 'Corpo de Bombeiros da Polícia Militar do Estado de São Paulo',
  // TODO: VALIDAR COM A IT VIGENTE — confirmar o decreto regulamentar vigente em SP
  legislacao: 'Regulamento de Segurança contra Incêndio das edificações do Estado de São Paulo (validar decreto vigente)',
  linkITs: 'https://cbaplang.corpodebombeiros.sp.gov.br/internetCB/#/LegislacaoConsulta',
  certificado: 'AVCB/CLCB — validar modalidade aplicável',
  validado: false,
  avisoValidacao:
    'UF São Paulo em validação: as referências de IT exibidas são provisórias e os cálculos ' +
    'reutilizam a matriz validada da Bahia. Confirme a numeração e os valores nas ITs vigentes do ' +
    'CBMSP antes de protocolar.',
  referencias: referenciasSP,
};
