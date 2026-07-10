/**
 * Tipos da camada de normas por UF (arquitetura multi-UF do FirePro Suite).
 */

import type { UFProjeto } from '@/lib/projeto';

export interface ConfigUF {
  uf: UFProjeto;
  /** Sigla do órgão (CBMBA / CBMSP) */
  orgao: string;
  orgaoNomeCompleto: string;
  /** Legislação base da UF citada nos documentos */
  legislacao: string;
  /** Link oficial para consulta das ITs */
  linkITs: string;
  /** Nome do certificado de conformidade emitido pelo órgão */
  certificado: string;
  /**
   * true quando os valores/referências desta UF já foram validados pelo
   * responsável técnico; false exibe aviso permanente na interface.
   */
  validado: boolean;
  /** Mensagem exibida na interface enquanto a UF não estiver validada */
  avisoValidacao: string;
  /** Referência normativa por medida de segurança (id da medida → IT/NBR) */
  referencias: Record<string, string>;
}
