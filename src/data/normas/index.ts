/**
 * Ponto único de acesso à camada de normas por UF.
 * Os módulos NUNCA importam ba.ts/sp.ts diretamente — sempre via getNormas().
 */

import type { UFProjeto } from '@/lib/projeto';
import type { ConfigUF } from './tipos';
import { NORMAS_BA } from './ba';
import { NORMAS_SP } from './sp';

export type { ConfigUF } from './tipos';

const NORMAS: Record<UFProjeto, ConfigUF> = {
  BA: NORMAS_BA,
  SP: NORMAS_SP,
};

export function getNormas(uf: UFProjeto): ConfigUF {
  return NORMAS[uf] ?? NORMAS_BA;
}

/** Referência normativa de uma medida na UF ativa (ex.: "IT 22/2016"). */
export function referenciaMedidaUF(uf: UFProjeto, medidaId: string): string {
  return getNormas(uf).referencias[medidaId] ?? '';
}
