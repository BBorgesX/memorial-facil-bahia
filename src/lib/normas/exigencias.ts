/**
 * Motor de exigências de medidas de segurança contra incêndio e pânico.
 *
 * Regras baseadas nas Tabelas 5, 6A a 6M e 7 do Decreto Estadual nº 16.302/2015
 * (Bahia) e nas Instruções Técnicas (ITs) do CBMBA correspondentes a cada medida.
 * A determinação é automática a partir de: grupo/divisão de ocupação (Tabela 1),
 * tipo de altura (Tabela 2), nível de carga de incêndio (Tabela 3) e área construída.
 */

import { ClassificacaoAltura, ClassificacaoCarga } from './classificacao';

export interface MedidaSeguranca {
  id: string;
  nome: string;
  referencia: string; // ITs do CBMBA aplicáveis
  categoria: string;
}

export const MEDIDAS_SEGURANCA: MedidaSeguranca[] = [
  { id: 'acesso_viatura', nome: 'Acesso de Viatura na Edificação e Áreas de Risco', referencia: 'IT 06/2016', categoria: 'Acesso' },
  { id: 'separacao_edificacoes', nome: 'Separação entre Edificações (Isolamento de Risco)', referencia: 'IT 07/2016', categoria: 'Proteção Passiva' },
  { id: 'seguranca_estrutural', nome: 'Segurança Estrutural contra Incêndio', referencia: 'IT 08/2016', categoria: 'Proteção Passiva' },
  { id: 'compartimentacao_horizontal', nome: 'Compartimentação Horizontal', referencia: 'IT 09/2022', categoria: 'Proteção Passiva' },
  { id: 'compartimentacao_vertical', nome: 'Compartimentação Vertical', referencia: 'IT 09/2022', categoria: 'Proteção Passiva' },
  { id: 'controle_materiais', nome: 'Controle de Materiais de Acabamento e Revestimento', referencia: 'IT 10/2016', categoria: 'Proteção Passiva' },
  { id: 'saidas_emergencia', nome: 'Saídas de Emergência', referencia: 'IT 11/2016 e IT 12/2016', categoria: 'Evacuação' },
  { id: 'elevador_emergencia', nome: 'Elevador de Emergência', referencia: 'IT 11/2016', categoria: 'Evacuação' },
  { id: 'plano_emergencia', nome: 'Plano de Emergência Contra Incêndio e Pânico', referencia: 'IT 16/2018', categoria: 'Gestão' },
  { id: 'brigada_incendio', nome: 'Brigada de Incêndio', referencia: 'IT 17/2016', categoria: 'Gestão' },
  { id: 'iluminacao_emergencia', nome: 'Iluminação de Emergência', referencia: 'IT 18/2017', categoria: 'Sinalização' },
  { id: 'deteccao_incendio', nome: 'Detecção Automática de Incêndio', referencia: 'IT 19/2017', categoria: 'Detecção e Alarme' },
  { id: 'alarme_incendio', nome: 'Alarme de Incêndio', referencia: 'IT 19/2017', categoria: 'Detecção e Alarme' },
  { id: 'sinalizacao_emergencia', nome: 'Sinalização de Emergência', referencia: 'IT 20/2017', categoria: 'Sinalização' },
  { id: 'extintores', nome: 'Extintores de Incêndio', referencia: 'IT 21/2017', categoria: 'Combate' },
  { id: 'hidrantes', nome: 'Sistema de Hidrantes e Mangotinhos', referencia: 'IT 22/2016', categoria: 'Combate' },
  { id: 'chuveiros_automaticos', nome: 'Sistema de Chuveiros Automáticos (Sprinklers)', referencia: 'IT 23/2018 e IT 24/2020', categoria: 'Combate' },
  { id: 'controle_fumaca', nome: 'Controle de Fumaça', referencia: 'IT 43/2016', categoria: 'Proteção Ativa' },
  { id: 'espuma', nome: 'Sistema de Espuma', referencia: 'IT 26/2019', categoria: 'Combate' },
  { id: 'controle_ignicao', nome: 'Controle de Fontes de Ignição', referencia: 'IT 15 e NRs aplicáveis', categoria: 'Prevenção' },
  { id: 'spda', nome: 'Sistema de Proteção contra Descargas Atmosféricas (SPDA)', referencia: 'IT 41/2018 e NBR 5419', categoria: 'Proteção' },
];

export interface RiscoEspecial {
  id: string;
  nome: string;
  referencia: string;
}

export const RISCOS_ESPECIAIS: RiscoEspecial[] = [
  { id: 'liquidos_inflamaveis', nome: 'Armazenamento ou manipulação de líquidos inflamáveis/combustíveis', referencia: 'IT 25' },
  { id: 'glp', nome: 'Gás Liquefeito de Petróleo (GLP) — central e/ou manipulação', referencia: 'IT 28/2021' },
  { id: 'fogos_artificio', nome: 'Fogos de artifício — comercialização/armazenamento', referencia: 'IT 30/2017' },
  { id: 'vaso_pressao', nome: 'Vaso sob pressão (caldeira)', referencia: 'IT 03/2016' },
  { id: 'produtos_perigosos', nome: 'Armazenamento de produtos perigosos', referencia: 'IT 32/2021' },
  { id: 'silos', nome: 'Silos', referencia: 'IT 27/2020' },
  { id: 'subestacao_eletrica', nome: 'Subestação elétrica', referencia: 'IT 37/2018' },
  { id: 'tunel_rodoviario', nome: 'Túnel rodoviário', referencia: 'IT 35/2021' },
  { id: 'patio_conteineres', nome: 'Pátio de contêineres', referencia: 'IT 36/2021' },
  { id: 'restricao_liberdade', nome: 'Estabelecimento destinado à restrição de liberdade', referencia: 'IT 39/2016' },
  { id: 'patrimonio_historico', nome: 'Edificação do patrimônio histórico ou cultural', referencia: 'IT 40/2017' },
  { id: 'cobertura_sape', nome: 'Cobertura de sapé, piaçava e similares', referencia: 'IT 33/2021' },
  { id: 'hidrante_urbano', nome: 'Hidrante urbano', referencia: 'IT 34/2021' },
];

export interface MedidaExigida {
  id: string;
  obrigatoria: boolean;
  nota?: string;
}

/**
 * Determina as medidas de segurança exigidas conforme a matriz de exigências
 * do Decreto 16.302/2015 (Tabelas 5 e 6A–6M).
 */
export function determinarMedidasExigidas(params: {
  grupo: string;
  divisao: string;
  altura: ClassificacaoAltura;
  carga: ClassificacaoCarga;
  areaTotal: number;
}): MedidaExigida[] {
  const { grupo, divisao, altura, carga, areaTotal } = params;
  const tipoAltura = altura.tipo;
  const isMediaAltura = tipoAltura === 'IV';
  const isAlta = tipoAltura === 'V' || tipoAltura === 'VI';
  const isGrandeArea = areaTotal > 750;

  const medidas = new Map<string, MedidaExigida>();
  const add = (id: string, nota?: string) => {
    if (!medidas.has(id)) medidas.set(id, { id, obrigatoria: true, nota });
  };

  // Tabela 5 — exigências mínimas para todas as edificações
  add('saidas_emergencia');
  add('iluminacao_emergencia');
  add('sinalizacao_emergencia');
  add('extintores');
  add('brigada_incendio');
  add('controle_ignicao');
  add('spda', 'Conforme NBR 5419 e normas técnicas oficiais');

  // Exigências por altura (Tabelas 6A–6M)
  if (tipoAltura !== 'I' && tipoAltura !== 'II') {
    add('acesso_viatura');
    add('seguranca_estrutural');
  }
  if (areaTotal > 750) {
    add('acesso_viatura');
    add('seguranca_estrutural');
    add('separacao_edificacoes');
  }
  if (isMediaAltura || isAlta) add('compartimentacao_vertical');
  if (isAlta) {
    add('compartimentacao_horizontal');
    add('controle_fumaca');
  }
  if (tipoAltura === 'VI') add('elevador_emergencia', 'Exigido para edificações com altura superior a 60 m ou conforme IT 11');

  // Exigências por área
  if (isGrandeArea) {
    add('hidrantes');
    add('alarme_incendio');
  }

  // Exigências por carga de incêndio
  if (carga.nivel === 'Médio' || carga.nivel === 'Alto') add('controle_materiais');
  if (carga.nivel === 'Alto') {
    add('deteccao_incendio');
    add('chuveiros_automaticos');
  }

  // Exigências específicas por grupo/divisão de ocupação
  switch (grupo) {
    case 'A':
      if (tipoAltura === 'VI') add('chuveiros_automaticos');
      if (areaTotal > 750) add('alarme_incendio', 'Pode ser substituído por sistema de interfone conforme o Decreto');
      break;
    case 'B':
      add('controle_materiais');
      if (['IV', 'V', 'VI'].includes(tipoAltura)) add('deteccao_incendio', 'Em todos os quartos e áreas comuns');
      if (isAlta) {
        add('chuveiros_automaticos');
        add('plano_emergencia');
      }
      break;
    case 'C':
      add('controle_materiais');
      add('deteccao_incendio');
      add('plano_emergencia', divisao === 'C-3' ? 'Obrigatório para shopping centers' : undefined);
      if (isAlta) add('chuveiros_automaticos');
      break;
    case 'D':
      add('controle_materiais');
      if (tipoAltura === 'VI') {
        add('deteccao_incendio');
        add('chuveiros_automaticos');
        add('plano_emergencia');
      }
      break;
    case 'E':
      add('controle_materiais');
      if (divisao === 'E-5' || divisao === 'E-6') add('deteccao_incendio', 'Prioritário para pré-escolas e escolas para portadores de deficiência');
      if (isAlta) {
        add('chuveiros_automaticos');
        add('plano_emergencia');
      }
      break;
    case 'F':
      add('controle_materiais');
      add('plano_emergencia', 'Obrigatório para público superior a 1.000 pessoas');
      if (['F-1', 'F-5'].includes(divisao)) add('deteccao_incendio');
      if (['F-3', 'F-4'].includes(divisao) && areaTotal > 10000) add('chuveiros_automaticos');
      if (isAlta) add('chuveiros_automaticos');
      break;
    case 'G':
      if (['G-3', 'G-4'].includes(divisao)) add('espuma', 'Para áreas com líquidos inflamáveis');
      if (divisao === 'G-5' && areaTotal > 2000) add('espuma', 'Sistema fixo para hangares conforme IT 26');
      break;
    case 'H':
      add('controle_materiais');
      if (['H-2', 'H-3', 'H-5'].includes(divisao)) {
        add('deteccao_incendio', 'Em todos os quartos/leitos');
        add('plano_emergencia');
      }
      if (tipoAltura === 'VI') add('chuveiros_automaticos');
      break;
    case 'I':
      if (divisao === 'I-3') {
        add('deteccao_incendio');
        add('chuveiros_automaticos');
        add('plano_emergencia');
      }
      if (divisao === 'I-2' && tipoAltura !== 'I' && tipoAltura !== 'II') add('deteccao_incendio');
      break;
    case 'J':
      if (['J-3', 'J-4'].includes(divisao)) {
        add('deteccao_incendio');
        add('chuveiros_automaticos');
        add('plano_emergencia');
      }
      if (divisao === 'J-2' && tipoAltura !== 'I' && tipoAltura !== 'II') add('alarme_incendio');
      break;
    case 'L':
      add('deteccao_incendio');
      add('chuveiros_automaticos');
      add('plano_emergencia');
      add('espuma', 'Conforme IT 26/IT 30');
      break;
    case 'M':
      add('plano_emergencia');
      if (divisao === 'M-2') {
        add('espuma');
        add('deteccao_incendio');
      }
      if (divisao === 'M-3') {
        add('deteccao_incendio');
        if (['IV', 'V', 'VI'].includes(tipoAltura)) add('chuveiros_automaticos', 'Pode ser substituído por sistema fixo de gases');
      }
      if (divisao === 'M-5') {
        add('chuveiros_automaticos', 'Conforme IT 27 (Silos)');
        add('controle_ignicao', 'Inclui controle de pós combustíveis');
      }
      break;
  }

  // Ordena conforme a ordem canônica da lista de medidas
  const ordem = new Map(MEDIDAS_SEGURANCA.map((m, i) => [m.id, i]));
  return Array.from(medidas.values()).sort((a, b) => (ordem.get(a.id) ?? 99) - (ordem.get(b.id) ?? 99));
}

/**
 * Tabela 7 do Decreto 16.302/2015 — exigências adicionais para ocupações em
 * subsolos diferentes de estacionamento.
 */
export function exigenciasSubsolo(params: {
  areaSubsolo: number;
  primeiroOuSegundoNivel: boolean;
  divisao: string;
}): string[] {
  const { areaSubsolo: area, primeiroOuSegundoNivel, divisao } = params;
  const exigencias: string[] = [];
  const divisoesReuniao = ['F-1', 'F-2', 'F-3', 'F-5', 'F-6', 'F-10'];

  if (area <= 0) return exigencias;

  if (area <= 50) {
    exigencias.push('Sem exigências adicionais específicas além das medidas básicas da edificação.');
  } else if (area <= 100) {
    if (divisao.startsWith('J')) {
      exigencias.push('Depósitos individuais com área máxima de até 5 m² cada; OU');
      exigencias.push('Depósitos individuais de até 25 m² com detecção automática de incêndio; OU');
    } else {
      exigencias.push('Ambientes subdivididos com área máxima de até 50 m² e detecção automática de incêndio; OU');
    }
    exigencias.push('Chuveiros automáticos de resposta rápida; OU');
    exigencias.push('Controle de fumaça.');
  } else if (area <= 250) {
    if (primeiroOuSegundoNivel) {
      exigencias.push('Detecção automática de incêndio e exaustão; OU');
    } else {
      exigencias.push('Detecção automática de incêndio em todo o subsolo, exaustão e duas saídas de emergência; OU');
    }
    exigencias.push('Chuveiros automáticos de resposta rápida e exaustão; OU');
    exigencias.push('Controle de fumaça.');
  } else if (area <= 500) {
    exigencias.push('Detecção automática de incêndio em todo o subsolo e exaustão; OU');
    exigencias.push('Chuveiros automáticos de resposta rápida e exaustão; OU');
    exigencias.push('Controle de fumaça.');
    if (primeiroOuSegundoNivel && divisoesReuniao.includes(divisao)) {
      exigencias.push('Duas saídas de emergência em lados opostos.');
    }
  } else {
    exigencias.push('OBRIGATÓRIO: chuveiros automáticos de resposta rápida E detecção automática de incêndio em todo o subsolo.');
    exigencias.push('OBRIGATÓRIO: duas saídas de emergência em lados opostos.');
    exigencias.push('OBRIGATÓRIO: controle de fumaça.');
  }

  return exigencias;
}
