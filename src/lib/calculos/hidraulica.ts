/**
 * Cálculo hidráulico de SISTEMAS DE HIDRANTES — IT 22/2016 (CBMBA).
 *
 * Método conforme a IT 22/2016 e a planilha de referência do usuário
 * ("Cálculo de sistemas de hidrantes", passos 5 a 17):
 *
 *  1. Hidrante mais desfavorável: vazão mínima e nº de jatos simultâneos
 *     pela Tabela 2 da IT 22; pressão residual mínima na saída.
 *  2. Perda de carga no sub-ramal por Hazen-Williams (item 5.8.7-b):
 *     hf = 10,65 · L · Q^1,85 / (C^1,85 · D^4,87), unidades SI coerentes
 *     (Q em m³/s, D em m), com fator C pela Tabela 1 da IT 22 —
 *     mais perdas localizadas de válvula angular, mangueira e esguicho.
 *  3. Pressão no ponto A (terminal do hidrante) = residual + perdas.
 *  4. Fator de vazão K = Q/√P e vazão real do segundo jato (tipos 4 e 5).
 *  5. Coluna/recalque: comprimento reto + comprimentos equivalentes das
 *     conexões; altura manométrica total = P(ponto B) + desnível
 *     geométrico + perdas da coluna.
 *  6. Verificações da IT 22: velocidade ≤ 5 m/s (5.8.9), pressão máxima no
 *     esguicho 100 mca (5.8.6), DN mínimo 65 (5.11.6.1/5.11.6.2), bomba
 *     ≤ 100 mca recomendado (C.1.14), duas entradas de recalque quando
 *     vazão > 1.000 L/min (5.3.3), jockey ≤ 20 L/min e diferencial
 *     ~10 mca (C.1.15).
 *  7. RTI (Tabela 3 da IT 22 — módulo de RTI) e tempo de operação.
 */

import type { EntradaHidraulica } from '@/lib/projeto';

export type StatusHidraulica = 'OK' | 'Atenção' | 'Fora do padrão';

/** TABELA 2 da IT 22/2016 — tipos de sistemas de hidrantes e mangotinhos. */
export const TABELA_2_IT22: Record<number, {
  sistema: string;
  vazaoPorPontoLmin: number;
  pontosSimultaneos: number;
  mangueiraMaxM: number;
}> = {
  1: { sistema: 'Mangotinho', vazaoPorPontoLmin: 100, pontosSimultaneos: 1, mangueiraMaxM: 30 },
  2: { sistema: 'Hidrante', vazaoPorPontoLmin: 250, pontosSimultaneos: 1, mangueiraMaxM: 30 },
  3: { sistema: 'Hidrante', vazaoPorPontoLmin: 500, pontosSimultaneos: 1, mangueiraMaxM: 45 },
  4: { sistema: 'Hidrante', vazaoPorPontoLmin: 750, pontosSimultaneos: 2, mangueiraMaxM: 60 },
  5: { sistema: 'Hidrante', vazaoPorPontoLmin: 1000, pontosSimultaneos: 2, mangueiraMaxM: 60 },
};

/** TABELA 1 da IT 22/2016 — fator "C" de Hazen-Williams por material. */
export const MATERIAIS_TUBULACAO: { id: string; nome: string; c: number }[] = [
  { id: 'aco_novo', nome: 'Aço-carbono novo', c: 120 },
  { id: 'aco_usado', nome: 'Aço-carbono usado', c: 100 },
  { id: 'ffo_novo', nome: 'Ferro fundido novo', c: 130 },
  { id: 'ffo_usado', nome: 'Ferro fundido usado', c: 100 },
  { id: 'pvc', nome: 'PVC', c: 150 },
  { id: 'cobre', nome: 'Cobre', c: 150 },
  { id: 'concreto', nome: 'Concreto', c: 120 },
  { id: 'outro', nome: 'Outro (informar C)', c: 0 },
];

/**
 * Comprimentos equivalentes das conexões da coluna/recalque (m) — valores da
 * planilha de referência do usuário (rede DN 63/65).
 */
export const CONEXOES_COLUNA: { id: keyof ConexoesColuna; nome: string; equivalenteM: number }[] = [
  { id: 'registroGaveta', nome: 'Registro de gaveta', equivalenteM: 0.9 },
  { id: 'valvulaRetencao', nome: 'Válvula de retenção', equivalenteM: 8.1 },
  { id: 'tePassagemDireta', nome: 'Tê de passagem direta', equivalenteM: 2.4 },
  { id: 'joelho90', nome: 'Joelho 90°', equivalenteM: 1.4 },
  { id: 'valvulaPeCrivo', nome: 'Válvula de pé com crivo', equivalenteM: 25 },
];

export interface ConexoesColuna {
  registroGaveta: number;
  valvulaRetencao: number;
  tePassagemDireta: number;
  joelho90: number;
  valvulaPeCrivo: number;
}

/** Contexto vindo da classificação do projeto (módulo de RTI — IT 22 Tabela 3). */
export interface ContextoSistema {
  /** Tipo de sistema definido pela classificação (1–5); 0 = indefinido */
  tipoSistema: number;
  /** Pressão residual mínima do tipo (especificação validada do módulo RTI) */
  pressaoResidualMca: number;
  /** RTI da Tabela 3 (m³); 0 = indefinida */
  rtiM3: number;
}

export interface ResultadoHidraulica {
  tipoAdotado: number;
  sistema: string;
  vazaoPorPontoLmin: number;
  pontosSimultaneos: number;
  mangueiraMaxM: number;
  coeficienteC: number;
  pressaoResidualMca: number;

  /** Perdas no sub-ramal do hidrante mais desfavorável (mca) */
  perdaCanalizacaoSubRamalMca: number;
  perdaSubRamalTotalMca: number;
  /** Pressão no ponto A — terminal da caixa do hidrante mais desfavorável (mca) */
  pressaoPontoAMca: number;
  /** Fator de vazão K = Q/√P (L/min·mca^-1/2) */
  fatorK: number;

  /** Pressão no ponto B — junção com a coluna (mca) */
  pressaoPontoBMca: number;
  /** Vazão real do segundo jato (tipos 4 e 5), em L/min */
  vazaoSegundoJatoLmin: number | null;
  /** Vazão de cálculo na coluna de incêndio (L/min e m³/h) */
  vazaoColunaLmin: number;
  vazaoColunaM3h: number;

  /** Comprimento total da coluna (reto + equivalentes), em m */
  comprimentoColunaTotalM: number;
  comprimentoEquivalentesM: number;
  perdaColunaMca: number;

  /** Altura manométrica total para seleção da bomba (mca) */
  alturaManometricaMca: number;

  velocidadeSubRamalMs: number;
  velocidadeColunaMs: number;

  /** Tempo de operação garantido pela RTI (min); null sem RTI */
  rtiM3: number | null;
  tempoOperacaoMin: number | null;

  /** Pressões de referência da bomba jockey (C.1.15) */
  jockey: { pressaoMca: number; vazaoMaxLmin: number };

  folgaMca: number | null;
  status: StatusHidraulica;
  verificacoes: { item: string; referencia: string; ok: boolean | null; detalhe: string }[];
  memoria: string[];
}

/** Perda de carga unitária por Hazen-Williams (IT 22, 5.8.7-b), em mca/m. */
export function perdaUnitariaHW(vazaoLmin: number, coefC: number, diametroMm: number): number {
  if (vazaoLmin <= 0 || coefC <= 0 || diametroMm <= 0) return 0;
  const Q = vazaoLmin / 60000; // m³/s
  const D = diametroMm / 1000; // m
  return (10.65 * Math.pow(Q, 1.85)) / (Math.pow(coefC, 1.85) * Math.pow(D, 4.87));
}

/** Velocidade do escoamento V = Q/A (IT 22, 5.8.8), em m/s. */
export function velocidadeEscoamento(vazaoLmin: number, diametroMm: number): number {
  if (vazaoLmin <= 0 || diametroMm <= 0) return 0;
  const Q = vazaoLmin / 60000;
  const D = diametroMm / 1000;
  return Q / ((Math.PI * D * D) / 4);
}

export function calcularHidraulicaHidrantes(
  e: EntradaHidraulica,
  ctx: ContextoSistema,
): ResultadoHidraulica {
  const memoria: string[] = [];
  const verificacoes: ResultadoHidraulica['verificacoes'] = [];

  // ---- Sistema adotado (Tabela 2 da IT 22) ----
  const tipoAdotado = e.tipoSistema > 0 ? e.tipoSistema : ctx.tipoSistema > 0 ? ctx.tipoSistema : 2;
  const tab2 = TABELA_2_IT22[tipoAdotado] ?? TABELA_2_IT22[2];
  const vazaoPorPonto = e.vazaoPorPontoLmin > 0 ? e.vazaoPorPontoLmin : tab2.vazaoPorPontoLmin;
  const pontos = e.hidrantesSimultaneos > 0 ? e.hidrantesSimultaneos : tab2.pontosSimultaneos;
  const pressaoResidual =
    e.pressaoResidualMca > 0 ? e.pressaoResidualMca : ctx.pressaoResidualMca > 0 ? ctx.pressaoResidualMca : 0;

  const material = MATERIAIS_TUBULACAO.find((m) => m.id === e.material);
  const coefC = material && material.c > 0 ? material.c : e.coeficienteC > 0 ? e.coeficienteC : 120;

  memoria.push(
    `Sistema Tipo ${tipoAdotado} (${tab2.sistema}) — Tabela 2 da IT 22/2016: vazão mínima de ${tab2.vazaoPorPontoLmin} L/min por ponto, ` +
      `${tab2.pontosSimultaneos} ponto(s) de uso simultâneo e mangueira de até ${tab2.mangueiraMaxM} m.` +
      (e.vazaoPorPontoLmin > 0 ? ` Vazão adotada no projeto: ${vazaoPorPonto} L/min.` : ''),
    `Fator C de Hazen-Williams (Tabela 1 da IT 22): C = ${coefC}${material && material.c > 0 ? ` (${material.nome})` : ' (informado)'}.`,
  );

  // ---- Sub-ramal do hidrante mais desfavorável (Passos 6 e 7) ----
  const J_sub = perdaUnitariaHW(vazaoPorPonto, coefC, e.diametroInternoMm);
  const perdaCanalizacaoSubRamal = J_sub * Math.max(0, e.comprimentoSubRamalM);
  const perdaSubRamalTotal =
    perdaCanalizacaoSubRamal +
    Math.max(0, e.perdaValvulaAngularMca) +
    Math.max(0, e.perdaMangueiraMca) +
    Math.max(0, e.perdaEsguichoMca);

  memoria.push(
    `Perda de carga na canalização do sub-ramal (Hazen-Williams, 5.8.7-b): hf = 10,65 · L · Q^1,85 / (C^1,85 · D^4,87) = ` +
      `${J_sub.toFixed(4)} mca/m × ${e.comprimentoSubRamalM} m = ${perdaCanalizacaoSubRamal.toFixed(2)} mca.`,
    `Perdas localizadas: válvula angular ${e.perdaValvulaAngularMca} + mangueira ${e.perdaMangueiraMca} + esguicho ${e.perdaEsguichoMca} mca.`,
    `Perda total no sub-ramal: ${perdaSubRamalTotal.toFixed(2)} mca.`,
  );

  // ---- Pressão no ponto A e fator K (Passos 8 e 9) ----
  const pressaoPontoA = pressaoResidual + perdaSubRamalTotal;
  const fatorK = pressaoPontoA > 0 ? vazaoPorPonto / Math.sqrt(pressaoPontoA) : 0;
  memoria.push(
    `Pressão no ponto A (terminal do hidrante mais desfavorável): PA = ${pressaoResidual} (residual mínima) + ` +
      `${perdaSubRamalTotal.toFixed(2)} (perdas) = ${pressaoPontoA.toFixed(2)} mca.`,
    `Fator de vazão: K = Q/√PA = ${vazaoPorPonto}/√${pressaoPontoA.toFixed(2)} = ${fatorK.toFixed(2)} L/min·mca⁻¹ᐟ².`,
  );

  // ---- Segundo jato e vazão da coluna (Passos 10 a 12) ----
  const pressaoPontoB = pressaoPontoA + Math.max(0, e.desnivelEntreHidrantesM);
  let vazaoSegundoJato: number | null = null;
  let vazaoColuna = vazaoPorPonto;
  if (pontos >= 2) {
    vazaoSegundoJato = fatorK * Math.sqrt(pressaoPontoB);
    vazaoColuna = vazaoPorPonto + vazaoSegundoJato;
    memoria.push(
      `Pressão no ponto B (junção): PB = PA + desnível entre hidrantes = ${pressaoPontoA.toFixed(2)} + ${e.desnivelEntreHidrantesM} = ${pressaoPontoB.toFixed(2)} mca.`,
      `Vazão real do 2º jato (5.8.3): Q₂ = K·√PB = ${fatorK.toFixed(2)}·√${pressaoPontoB.toFixed(2)} = ${vazaoSegundoJato.toFixed(1)} L/min.`,
      `Vazão de cálculo na coluna: Q = ${vazaoPorPonto} + ${vazaoSegundoJato.toFixed(1)} = ${vazaoColuna.toFixed(1)} L/min.`,
    );
  } else {
    memoria.push(`Sistema com 1 ponto de uso simultâneo: vazão de cálculo na coluna = ${vazaoColuna.toFixed(1)} L/min.`);
  }
  const vazaoColunaM3h = (vazaoColuna * 60) / 1000;

  // ---- Coluna / recalque (Passo 13) ----
  const equivalentes = CONEXOES_COLUNA.reduce(
    (soma, c) => soma + c.equivalenteM * Math.max(0, e.conexoesColuna[c.id] ?? 0),
    0,
  );
  const comprimentoColunaTotal = Math.max(0, e.comprimentoColunaM) + equivalentes;
  const J_col = perdaUnitariaHW(vazaoColuna, coefC, e.diametroInternoMm);
  const perdaColuna = J_col * comprimentoColunaTotal;
  const alturaManometrica = pressaoPontoB + Math.max(0, e.desnivelGeometricoM) + perdaColuna;

  memoria.push(
    `Comprimento da coluna: ${e.comprimentoColunaM} m (reto) + ${equivalentes.toFixed(1)} m (equivalentes das conexões) = ${comprimentoColunaTotal.toFixed(1)} m.`,
    `Perda de carga na coluna (Hazen-Williams com Q = ${vazaoColuna.toFixed(1)} L/min): ${J_col.toFixed(4)} mca/m × ${comprimentoColunaTotal.toFixed(1)} m = ${perdaColuna.toFixed(2)} mca.`,
    `Altura manométrica total: Hmt = ${pressaoPontoB.toFixed(2)} (PB) + ${e.desnivelGeometricoM} (desnível geométrico) + ${perdaColuna.toFixed(2)} (perdas) = ${alturaManometrica.toFixed(2)} mca.`,
  );

  // ---- Velocidades (5.8.9) ----
  const vSub = velocidadeEscoamento(vazaoPorPonto, e.diametroInternoMm);
  const vCol = velocidadeEscoamento(vazaoColuna, e.diametroInternoMm);
  memoria.push(
    `Velocidades (V = Q/A): sub-ramal ${vSub.toFixed(2)} m/s · coluna ${vCol.toFixed(2)} m/s (máximo 5 m/s — item 5.8.9).`,
  );

  // ---- RTI e tempo de operação (Passo 16 — Tabela 3 da IT 22) ----
  const rtiM3 = ctx.rtiM3 > 0 ? ctx.rtiM3 : null;
  const tempoOperacao = rtiM3 !== null && vazaoColuna > 0 ? (rtiM3 * 1000) / vazaoColuna : null;
  if (rtiM3 !== null && tempoOperacao !== null) {
    memoria.push(
      `RTI (Tabela 3 da IT 22, via classificação do projeto): ${rtiM3} m³ → tempo de operação = ${rtiM3 * 1000} L ÷ ${vazaoColuna.toFixed(0)} L/min = ${tempoOperacao.toFixed(0)} min.`,
    );
  }

  // ---- Verificações normativas ----
  const check = (item: string, referencia: string, ok: boolean | null, detalhe: string) =>
    verificacoes.push({ item, referencia, ok, detalhe });

  const dadosCompletos = e.diametroInternoMm > 0 && e.comprimentoSubRamalM > 0 && pressaoResidual > 0;

  check(
    'Velocidade na tubulação ≤ 5 m/s',
    'IT 22, 5.8.9',
    dadosCompletos ? vCol <= 5 && vSub <= 5 : null,
    `Sub-ramal ${vSub.toFixed(2)} m/s · coluna ${vCol.toFixed(2)} m/s`,
  );
  check(
    'Pressão máxima no esguicho ≤ 100 mca',
    'IT 22, 5.8.6',
    pressaoResidual > 0 ? pressaoResidual <= 100 : null,
    `Pressão residual adotada: ${pressaoResidual} mca`,
  );
  const dnOk = e.diametroInternoMm >= 65 ? true : e.diametroInternoMm >= 50 && tipoAdotado <= 2 ? null : false;
  check(
    'Diâmetro nominal mínimo DN 65 (2 ½")',
    'IT 22, 5.11.6.1/5.11.6.2',
    e.diametroInternoMm > 0 ? dnOk : null,
    e.diametroInternoMm >= 65
      ? `Diâmetro adotado: ${e.diametroInternoMm} mm`
      : e.diametroInternoMm >= 50 && tipoAdotado <= 2
        ? `DN ${e.diametroInternoMm} mm: admitido para sistemas tipo 1 e 2 somente com laudo técnico`
        : `Diâmetro adotado (${e.diametroInternoMm} mm) inferior ao mínimo da IT`,
  );
  check(
    'Pressão da bomba ≤ 100 mca (recomendação)',
    'IT 22, C.1.14',
    dadosCompletos ? alturaManometrica <= 100 : null,
    `Altura manométrica total: ${alturaManometrica.toFixed(2)} mca`,
  );
  check(
    'Duas entradas de recalque quando vazão > 1.000 L/min',
    'IT 22, 5.3.3',
    null,
    vazaoColuna > 1000
      ? `Vazão de ${vazaoColuna.toFixed(0)} L/min: prever DUAS entradas no dispositivo de recalque`
      : `Vazão de ${vazaoColuna.toFixed(0)} L/min: uma entrada de recalque atende`,
  );

  // ---- Veredito ----
  let folgaMca: number | null = null;
  let status: StatusHidraulica = 'OK';
  if (!dadosCompletos) {
    status = 'Atenção';
  }
  if (verificacoes.some((v) => v.ok === false)) status = 'Fora do padrão';
  else if (verificacoes.some((v) => v.ok === null && v.referencia !== 'IT 22, 5.3.3') && status === 'OK') {
    status = 'Atenção';
  }
  if (e.pressaoDisponivelMca > 0 && dadosCompletos) {
    folgaMca = e.pressaoDisponivelMca - alturaManometrica;
    if (folgaMca < 0) status = 'Fora do padrão';
    memoria.push(
      `Pressão disponível informada (${e.pressaoDisponivelMca} mca) − Hmt (${alturaManometrica.toFixed(2)} mca) = folga de ${folgaMca.toFixed(2)} mca.`,
    );
  }

  return {
    tipoAdotado,
    sistema: tab2.sistema,
    vazaoPorPontoLmin: vazaoPorPonto,
    pontosSimultaneos: pontos,
    mangueiraMaxM: tab2.mangueiraMaxM,
    coeficienteC: coefC,
    pressaoResidualMca: pressaoResidual,
    perdaCanalizacaoSubRamalMca: perdaCanalizacaoSubRamal,
    perdaSubRamalTotalMca: perdaSubRamalTotal,
    pressaoPontoAMca: pressaoPontoA,
    fatorK,
    pressaoPontoBMca: pressaoPontoB,
    vazaoSegundoJatoLmin: vazaoSegundoJato,
    vazaoColunaLmin: vazaoColuna,
    vazaoColunaM3h,
    comprimentoColunaTotalM: comprimentoColunaTotal,
    comprimentoEquivalentesM: equivalentes,
    perdaColunaMca: perdaColuna,
    alturaManometricaMca: alturaManometrica,
    velocidadeSubRamalMs: vSub,
    velocidadeColunaMs: vCol,
    rtiM3,
    tempoOperacaoMin: tempoOperacao,
    jockey: { pressaoMca: alturaManometrica + 10, vazaoMaxLmin: 20 },
    folgaMca,
    status,
    verificacoes,
    memoria,
  };
}
