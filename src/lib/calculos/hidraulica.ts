/**
 * Calculadora hidráulica — vazão, perda de carga (Hazen-Williams) e pressão
 * necessária no ponto mais desfavorável.
 *
 * Referências de projeto: NBR 10897 (chuveiros automáticos) e NBR 13714 /
 * IT de hidrantes da UF ativa. As fórmulas abaixo são de hidráulica geral
 * (não normativas): J = 10,643 · Q^1,852 / (C^1,852 · D^4,87), com Q em
 * m³/s, D em m e J em m/m.
 */

import type { EntradaHidraulica } from '@/lib/projeto';

export type StatusHidraulica = 'OK' | 'Atenção' | 'Fora do padrão';

export interface ResultadoHidraulica {
  /** Vazão dos chuveiros automáticos: área protegida × densidade (L/min) */
  vazaoSprinklersLmin: number;
  /** Vazão total simultânea (sprinklers + hidrantes), em L/min */
  vazaoTotalLmin: number;
  /** Vazão total em m³/h */
  vazaoTotalM3h: number;
  /** Vazão média por bico, quando informado o nº de bicos (L/min) */
  vazaoPorBicoLmin: number | null;
  /** Velocidade do escoamento na tubulação (m/s) */
  velocidadeMs: number;
  /** Perda de carga unitária (mca por metro de tubulação) */
  perdaCargaUnitariaMcaM: number;
  /** Perda de carga total no trecho (mca) */
  perdaCargaTotalMca: number;
  /** Pressão necessária no ponto de suprimento (mca):
   *  perda de carga + desnível + pressão mínima requerida no ponto mais desfavorável */
  pressaoNecessariaMca: number;
  /** Folga entre a pressão disponível e a necessária (mca); null sem pressão disponível */
  folgaMca: number | null;
  status: StatusHidraulica;
  observacoes: string[];
  memoria: string[];
}

export function calcularHidraulica(e: EntradaHidraulica): ResultadoHidraulica {
  const observacoes: string[] = [];
  const memoria: string[] = [];

  // Vazões
  const vazaoSprinklersLmin = Math.max(0, e.areaProtegidaM2) * Math.max(0, e.densidadeMmMin);
  const vazaoTotalLmin = vazaoSprinklersLmin + Math.max(0, e.vazaoHidrantesLmin);
  const vazaoTotalM3h = (vazaoTotalLmin * 60) / 1000;
  const vazaoPorBicoLmin = e.numBicos > 0 ? vazaoSprinklersLmin / e.numBicos : null;

  memoria.push(
    `Vazão dos chuveiros automáticos: ${e.areaProtegidaM2} m² × ${e.densidadeMmMin} mm/min = ${vazaoSprinklersLmin.toFixed(1)} L/min`,
    `Vazão total simultânea: ${vazaoSprinklersLmin.toFixed(1)} + ${e.vazaoHidrantesLmin} (hidrantes) = ${vazaoTotalLmin.toFixed(1)} L/min (${vazaoTotalM3h.toFixed(1)} m³/h)`,
  );

  // Hazen-Williams
  const Q = vazaoTotalLmin / 60000; // m³/s
  const D = e.diametroTubulacaoMm / 1000; // m
  const C = e.coeficienteC > 0 ? e.coeficienteC : 120;

  let perdaCargaUnitariaMcaM = 0;
  let velocidadeMs = 0;
  if (Q > 0 && D > 0) {
    perdaCargaUnitariaMcaM = (10.643 * Math.pow(Q, 1.852)) / (Math.pow(C, 1.852) * Math.pow(D, 4.87));
    velocidadeMs = Q / ((Math.PI * D * D) / 4);
    memoria.push(
      `Perda de carga unitária (Hazen-Williams, C=${C}): J = 10,643 × ${Q.toExponential(3)}^1,852 / (${C}^1,852 × ${D.toFixed(3)}^4,87) = ${perdaCargaUnitariaMcaM.toFixed(4)} mca/m`,
      `Velocidade do escoamento: v = Q/A = ${velocidadeMs.toFixed(2)} m/s`,
    );
  }
  const perdaCargaTotalMca = perdaCargaUnitariaMcaM * Math.max(0, e.comprimentoTubulacaoM);
  memoria.push(
    `Perda de carga no trecho: ${perdaCargaUnitariaMcaM.toFixed(4)} mca/m × ${e.comprimentoTubulacaoM} m = ${perdaCargaTotalMca.toFixed(2)} mca`,
  );

  // Pressão necessária no suprimento para garantir o ponto mais desfavorável
  const pressaoNecessariaMca =
    perdaCargaTotalMca + Math.max(0, e.desnivelM) + Math.max(0, e.pressaoMinimaRequeridaMca);
  memoria.push(
    `Pressão necessária: ${perdaCargaTotalMca.toFixed(2)} (perda de carga) + ${e.desnivelM} (desnível) + ${e.pressaoMinimaRequeridaMca} (pressão mínima no ponto mais desfavorável) = ${pressaoNecessariaMca.toFixed(2)} mca`,
  );

  // Veredito
  let status: StatusHidraulica;
  let folgaMca: number | null = null;
  if (vazaoTotalLmin <= 0 || D <= 0 || e.comprimentoTubulacaoM <= 0) {
    status = 'Atenção';
    observacoes.push('Preencha vazões, diâmetro e comprimento da tubulação para o dimensionamento completo.');
  } else if (e.pressaoDisponivelMca > 0) {
    folgaMca = e.pressaoDisponivelMca - pressaoNecessariaMca;
    if (folgaMca >= pressaoNecessariaMca * 0.1) {
      status = 'OK';
      observacoes.push(`Pressão disponível atende com folga de ${folgaMca.toFixed(2)} mca (≥ 10%).`);
    } else if (folgaMca >= 0) {
      status = 'Atenção';
      observacoes.push(
        `Pressão disponível atende com folga reduzida (${folgaMca.toFixed(2)} mca). Recomenda-se margem de segurança no ponto mais desfavorável.`,
      );
    } else {
      status = 'Fora do padrão';
      observacoes.push(
        `Pressão disponível INSUFICIENTE: faltam ${Math.abs(folgaMca).toFixed(2)} mca no ponto mais desfavorável. Redimensionar bomba, diâmetro ou traçado.`,
      );
    }
  } else {
    status = 'Atenção';
    observacoes.push('Informe a pressão disponível na fonte (bomba/reservatório) para o veredito de conformidade.');
  }

  if (velocidadeMs > 5) {
    if (status === 'OK') status = 'Atenção';
    observacoes.push(
      `Velocidade de ${velocidadeMs.toFixed(2)} m/s elevada — verificar o limite de velocidade da NBR 13714/NBR 10897 para o trecho.`,
    );
  }

  return {
    vazaoSprinklersLmin,
    vazaoTotalLmin,
    vazaoTotalM3h,
    vazaoPorBicoLmin,
    velocidadeMs,
    perdaCargaUnitariaMcaM,
    perdaCargaTotalMca,
    pressaoNecessariaMca,
    folgaMca,
    status,
    observacoes,
    memoria,
  };
}
