/**
 * Dispatcher de regras normativas por UF.
 *
 * O motor (src/lib/engine.ts) e a interface consultam SEMPRE este módulo:
 * - BA: lógica validada original (Decreto 16.302/2015 — src/lib/normas).
 * - SP: Decreto nº 69.118/2024 (src/data/normas/sp) — Tabelas 1, 5 e 7
 *   oficiais; Tabelas 6A–6M em regime de resumo (ver sp/exigencias.ts).
 *
 * As Tabelas 2 (altura) e 3 (carga) têm as mesmas faixas nas duas UFs,
 * portanto classificarAltura/classificarCarga são comuns.
 */

import type { UFProjeto } from '@/lib/projeto';
import { GrupoOcupacao, TABELA_1_OCUPACOES, getDivisao } from '@/lib/normas/ocupacoes';
import {
  determinarMedidasExigidas,
  exigenciasSubsolo,
  MedidaExigida,
} from '@/lib/normas/exigencias';
import { ClassificacaoAltura, ClassificacaoCarga } from '@/lib/normas/classificacao';
import { TABELA_1_OCUPACOES_SP, getDivisaoSP } from './sp/ocupacoes';
import { determinarMedidasExigidasSP, exigenciasSubsoloSP } from './sp/exigencias';

/** Tabela 1 (grupos e divisões de ocupação) da UF. */
export function getOcupacoesUF(uf: UFProjeto): GrupoOcupacao[] {
  return uf === 'SP' ? TABELA_1_OCUPACOES_SP : TABELA_1_OCUPACOES;
}

/** Busca a divisão de ocupação na Tabela 1 da UF. */
export function getDivisaoUF(uf: UFProjeto, cod: string) {
  return uf === 'SP' ? getDivisaoSP(cod) : getDivisao(cod);
}

/** Matriz de exigências da UF. */
export function determinarMedidasExigidasUF(
  uf: UFProjeto,
  params: {
    grupo: string;
    divisao: string;
    altura: ClassificacaoAltura;
    carga: ClassificacaoCarga;
    areaTotal: number;
    alturaM: number;
    pavimentos: number;
    populacao: number;
  },
): MedidaExigida[] {
  if (uf === 'SP') return determinarMedidasExigidasSP(params);
  return determinarMedidasExigidas(params);
}

/** Exigências adicionais de subsolo (Tabela 7) da UF. */
export function exigenciasSubsoloUF(
  uf: UFProjeto,
  params: { areaSubsolo: number; primeiroOuSegundoNivel: boolean; divisao: string },
): string[] {
  return uf === 'SP' ? exigenciasSubsoloSP(params) : exigenciasSubsolo(params);
}
