/**
 * Motor de processamento técnico do projeto.
 *
 * A partir dos dados informados pelo usuário, aplica as regras do Decreto
 * Estadual nº 16.302/2015 e das ITs do CBMBA e produz o resultado técnico
 * completo usado no painel em tempo real e no memorial descritivo.
 */

import { DadosProjeto } from './projeto';
import { getDivisao } from './normas/ocupacoes';
import {
  classificarAltura,
  classificarCarga,
  ClassificacaoAltura,
  ClassificacaoCarga,
} from './normas/classificacao';
import {
  determinarMedidasExigidas,
  exigenciasSubsolo,
  MedidaExigida,
  MEDIDAS_SEGURANCA,
} from './normas/exigencias';
import { calcularTRRF, ResultadoTRRF } from './calculos/trrf';
import { calcularHidrantes, ResultadoHidrantes } from './calculos/hidrantes';
import { calcularExtintores, ResultadoExtintores } from './calculos/extintores';
import { calcularSaidas, ResultadoSaidas } from './calculos/saidas';
import { calcularBrigada, ResultadoBrigada } from './calculos/brigada';
import { calcularIluminacao, ResultadoIluminacao } from './calculos/iluminacao';

export interface ErroValidacao {
  campo: string;
  mensagem: string;
}

export interface ResultadoTecnico {
  valido: boolean;
  erros: ErroValidacao[];
  avisos: string[];

  areaTotal: number;
  ocupacao?: {
    grupoCodigo: string;
    grupoNome: string;
    divisao: string;
    descricao: string;
    exemplos: string;
  };
  altura?: ClassificacaoAltura;
  carga?: ClassificacaoCarga;

  medidasExigidas: MedidaExigida[];
  exigenciasSubsolo: string[];

  trrf?: ResultadoTRRF;
  hidrantes?: ResultadoHidrantes;
  extintores?: ResultadoExtintores;
  saidas?: ResultadoSaidas;
  brigada?: ResultadoBrigada;
  iluminacao?: ResultadoIluminacao;
}

export function validarProjeto(p: DadosProjeto): ErroValidacao[] {
  const erros: ErroValidacao[] = [];
  const areaTotal = (p.areaExistente || 0) + (p.areaConstruir || 0);

  if (!p.divisao) erros.push({ campo: 'divisao', mensagem: 'Selecione a classificação de ocupação (Tabela 1).' });
  if (areaTotal <= 0) erros.push({ campo: 'area', mensagem: 'Informe a área construída (existente e/ou a construir).' });
  if (p.alturaM < 0) erros.push({ campo: 'alturaM', mensagem: 'A altura da edificação não pode ser negativa.' });
  if (p.pavimentos < 1) erros.push({ campo: 'pavimentos', mensagem: 'A edificação deve ter ao menos 1 pavimento.' });
  if (p.cargaIncendioMJm2 <= 0) erros.push({ campo: 'cargaIncendioMJm2', mensagem: 'Informe a carga de incêndio específica (MJ/m²).' });
  if (p.pavimentos > 1 && p.alturaM <= 0) erros.push({ campo: 'alturaM', mensagem: 'Informe a altura da edificação (piso do último pavimento habitado).' });
  if (p.temSubsolo && p.areaSubsoloM2 <= 0) erros.push({ campo: 'areaSubsoloM2', mensagem: 'Informe a área do subsolo.' });
  if (p.cep && !/^\d{5}-?\d{3}$/.test(p.cep)) erros.push({ campo: 'cep', mensagem: 'CEP inválido (formato 00000-000).' });
  if (p.cnpj && !/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(p.cnpj)) erros.push({ campo: 'cnpj', mensagem: 'CNPJ inválido (formato 00.000.000/0000-00).' });

  return erros;
}

/** Estado efetivo de uma medida: ajuste manual do usuário ou exigência automática. */
export function medidaAplicavel(p: DadosProjeto, resultado: ResultadoTecnico, id: string): boolean {
  const ajuste = p.medidas[id];
  if (ajuste && !ajuste.automatica) return ajuste.aplicavel;
  return resultado.medidasExigidas.some((m) => m.id === id);
}

export function processarProjeto(p: DadosProjeto): ResultadoTecnico {
  const erros = validarProjeto(p);
  const avisos: string[] = [];
  const areaTotal = (p.areaExistente || 0) + (p.areaConstruir || 0);

  const resultado: ResultadoTecnico = {
    valido: erros.length === 0,
    erros,
    avisos,
    areaTotal,
    medidasExigidas: [],
    exigenciasSubsolo: [],
  };

  const ocup = p.divisao ? getDivisao(p.divisao) : undefined;
  if (!ocup || areaTotal <= 0) return resultado;

  resultado.ocupacao = {
    grupoCodigo: ocup.grupo.codigo,
    grupoNome: ocup.grupo.nome,
    divisao: ocup.divisao.cod,
    descricao: ocup.divisao.desc,
    exemplos: ocup.divisao.exemplos,
  };

  const altura = classificarAltura(p.alturaM, p.pavimentos);
  const carga = classificarCarga(p.cargaIncendioMJm2 || 0);
  resultado.altura = altura;
  resultado.carga = carga;

  resultado.medidasExigidas = determinarMedidasExigidas({
    grupo: ocup.grupo.codigo,
    divisao: ocup.divisao.cod,
    altura,
    carga,
    areaTotal,
  });

  if (p.temSubsolo && p.ocupacaoSubsolo && !p.ocupacaoSubsolo.toLowerCase().includes('estacionamento') && !p.ocupacaoSubsolo.toLowerCase().includes('garagem')) {
    resultado.exigenciasSubsolo = exigenciasSubsolo({
      areaSubsolo: p.areaSubsoloM2,
      primeiroOuSegundoNivel: p.subsoloPrimeiroSegundoNivel,
      divisao: ocup.divisao.cod,
    });
  }

  // Estado efetivo das medidas (com ajustes manuais do usuário)
  const aplicavel = (id: string) => {
    const ajuste = p.medidas[id];
    if (ajuste && !ajuste.automatica) return ajuste.aplicavel;
    return resultado.medidasExigidas.some((m) => m.id === id);
  };

  // Cálculos técnicos por sistema
  resultado.trrf = calcularTRRF({
    grupo: ocup.grupo.codigo,
    divisao: ocup.divisao.cod,
    alturaM: p.alturaM,
    temSubsolo: p.temSubsolo,
    profundidadeSubsoloM: p.profundidadeSubsoloM,
    garagemAberta: p.garagemAberta,
  });

  if (aplicavel('hidrantes')) {
    resultado.hidrantes = calcularHidrantes({
      divisao: ocup.divisao.cod,
      cargaNivel: carga.nivel,
      areaTotal,
    });
  }

  resultado.extintores = calcularExtintores({
    cargaNivel: carga.nivel,
    areaTotal,
    pavimentos: p.pavimentos,
  });

  resultado.saidas = calcularSaidas({
    grupo: ocup.grupo.codigo,
    divisao: ocup.divisao.cod,
    areaTotal,
    pavimentos: p.pavimentos,
    populacaoInformada: p.ocupantes,
    temSprinklers: aplicavel('chuveiros_automaticos'),
    temDeteccao: aplicavel('deteccao_incendio'),
    saidaUnica: p.saidaUnica,
  });

  resultado.brigada = calcularBrigada({
    divisao: ocup.divisao.cod,
    cargaNivel: carga.nivel,
    populacaoFixa: resultado.saidas.populacaoAdotada,
  });

  resultado.iluminacao = calcularIluminacao({ areaTotal, pavimentos: p.pavimentos });

  // Avisos técnicos
  if (resultado.trrf.pavimentos === null && resultado.trrf.observacao) avisos.push(resultado.trrf.observacao);
  if (resultado.saidas.distanciaMaxima.pisoDescargaM === null) {
    avisos.push('Distância máxima de caminhamento não tabelada para esta combinação — verificar IT 11 com o CBMBA.');
  }
  if (p.ocupantes > 0 && p.ocupantes < resultado.saidas.populacaoCalculada) {
    avisos.push(
      `A população informada (${p.ocupantes}) é inferior à calculada pelos coeficientes da IT 11/NBR 9077 ` +
      `(${resultado.saidas.populacaoCalculada}). O CBMBA pode exigir justificativa.`,
    );
  }
  if (p.temSubsolo && p.areaSubsoloM2 > 500) {
    avisos.push('Subsolo com área superior a 500 m²: chuveiros automáticos, detecção e controle de fumaça obrigatórios (Tabela 7).');
  }

  return resultado;
}

export function nomeMedida(id: string): string {
  return MEDIDAS_SEGURANCA.find((m) => m.id === id)?.nome ?? id;
}

export function referenciaMedida(id: string): string {
  return MEDIDAS_SEGURANCA.find((m) => m.id === id)?.referencia ?? '';
}
