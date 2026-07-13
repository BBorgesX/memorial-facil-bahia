/**
 * Configuração normativa — SÃO PAULO (CBPMESP).
 *
 * Base legal implementada: Decreto Estadual nº 69.118/2024 (Regulamento de
 * Segurança Contra Incêndios do Estado de São Paulo, Anexo A), fornecido
 * pelo usuário — revoga o Decreto nº 63.911/2018.
 *
 * O que já é OFICIAL nesta camada (src/data/normas/sp/):
 * - Tabela 1 — classificação por ocupação (completa);
 * - Tabelas 2 e 3 — altura e carga de incêndio (faixas idênticas às da BA);
 * - Tabela 5 — exigências para área ≤ 750 m² e altura ≤ 12 m (completa);
 * - Tabela 7 — exigências adicionais de subsolo (completa);
 * - Regras-resumo das Tabelas 6 (chuveiros > 30 m; elevador de emergência
 *   > 60 m / > 80 m residencial; controle de fumaça > 90 m — IT-15).
 *
 * O que segue pendente de validação (por isso `validado: false`):
 * - Tabelas 6A a 6M.5 integrais (exigências por altura para > 750 m² ou
 *   > 12 m) — o documento traz apenas o resumo estrutural;
 * - Numeração das ITs específicas de cada medida (exceto IT-15 e IT-43,
 *   citadas expressamente no decreto).
 * // TODO: VALIDAR COM A IT VIGENTE (CBPMESP) — preencher as referências e
 * // as Tabelas 6 integrais e então mudar `validado` para true.
 */

import { MEDIDAS_SEGURANCA } from '@/lib/normas/exigencias';
import type { ConfigUF } from './tipos';

// Referências por medida. IT-15 (controle de fumaça) e IT-43 (edificações
// existentes) são citadas expressamente no Decreto 69.118/2024; as demais
// permanecem pendentes de confirmação da numeração vigente.
// TODO: VALIDAR COM A IT VIGENTE (CBPMESP) — preencher a numeração real.
const referenciasSP: Record<string, string> = Object.fromEntries(
  MEDIDAS_SEGURANCA.map((m) => [m.id, 'IT correspondente (CBPMESP) — validar numeração vigente']),
);
referenciasSP['controle_fumaca'] = 'IT-15 (CBPMESP) e Decreto 69.118/2024';

export const NORMAS_SP: ConfigUF = {
  uf: 'SP',
  orgao: 'CBMSP',
  orgaoNomeCompleto: 'Corpo de Bombeiros da Polícia Militar do Estado de São Paulo',
  legislacao: 'Lei Complementar nº 1.257/2015 e Decreto Estadual nº 69.118/2024',
  linkITs: 'https://cbaplang.corpodebombeiros.sp.gov.br/internetCB/#/LegislacaoConsulta',
  certificado: 'AVCB / CLCB / TAACB — conforme o Decreto nº 69.118/2024',
  validado: false,
  avisoValidacao:
    'SP: classificação e exigências baseadas no Decreto nº 69.118/2024 (Tabelas 1, 2, 3, 5 e 7 oficiais). ' +
    'Para edificações acima de 750 m² ou 12 m, as Tabelas 6A–6M são aplicadas em regime de resumo — ' +
    'valide a tabela integral da divisão e a numeração das ITs antes de protocolar.',
  referencias: referenciasSP,
};
