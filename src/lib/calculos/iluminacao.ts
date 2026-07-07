/**
 * IT 18/2017 (CBMBA) — Iluminação de Emergência (complementada pela NBR 10898:2023).
 *
 * Parâmetros de projeto:
 * - Autonomia mínima de 2 horas (NBR 10898:2023);
 * - Nível mínimo de 5 lux no piso das rotas de fuga (aclaramento);
 * - Distância máxima de 15 m entre pontos e 7,5 m entre ponto e parede;
 * - Tempo máximo de 15 s para atingir 50% da iluminância requerida.
 */

export interface ResultadoIluminacao {
  autonomiaHoras: number;
  iluminanciaMinimaLux: number;
  distanciaMaximaPontosM: number;
  distanciaMaximaParedeM: number;
  pontosEstimados: number;
  observacao: string;
}

export function calcularIluminacao(params: { areaTotal: number; pavimentos: number }): ResultadoIluminacao {
  // Estimativa: um ponto cobre no máximo 15 m × 7,5 m ≈ 112,5 m² em rota de fuga
  const pontos = Math.max(Math.max(1, params.pavimentos) * 2, Math.ceil(params.areaTotal / 112.5));
  return {
    autonomiaHoras: 2,
    iluminanciaMinimaLux: 5,
    distanciaMaximaPontosM: 15,
    distanciaMaximaParedeM: 7.5,
    pontosEstimados: pontos,
    observacao:
      'Quantidade estimada pelo espaçamento máximo entre pontos (15 m) e mínimo de 2 pontos por pavimento. ' +
      'O posicionamento definitivo deve ser lançado em planta cobrindo rotas de fuga, mudanças de direção e de nível, ' +
      'saídas e proximidade de equipamentos de combate.',
  };
}
