/**
 * Matriz de exigências — SÃO PAULO (Decreto Estadual nº 69.118/2024, Anexo A).
 *
 * Implementado a partir do texto oficial fornecido pelo usuário:
 * - TABELA 5 (completa): edificações com área ≤ 750 m² E altura ≤ 12,00 m.
 * - TABELAS 6A–6M (apenas resumo estrutural no documento): para área > 750 m²
 *   ou altura > 12 m aplicam-se as regras-resumo do decreto (chuveiros > 30 m,
 *   elevador de emergência > 60 m / > 80 m residencial, controle de fumaça
 *   > 90 m conforme IT-15) SOBRE a matriz validada da Bahia, usada como
 *   referência de partida.
 *   // TODO: VALIDAR COM A IT VIGENTE — incorporar as Tabelas 6A a 6M.5
 *   // integrais do Decreto 69.118/2024 quando disponíveis.
 * - TABELA 7 (completa): exigências adicionais para subsolos com ocupações
 *   distintas de estacionamento.
 *
 * Observação: as Tabelas 2 (altura) e 3 (carga de incêndio) de SP são
 * idênticas às da Bahia já implementadas (mesmas faixas), por isso a
 * classificação de altura/carga é reutilizada.
 */

import { ClassificacaoAltura, ClassificacaoCarga } from '@/lib/normas/classificacao';
import { determinarMedidasExigidas, MedidaExigida } from '@/lib/normas/exigencias';

export interface ParametrosExigenciasSP {
  grupo: string;
  divisao: string;
  altura: ClassificacaoAltura;
  carga: ClassificacaoCarga;
  areaTotal: number;
  alturaM: number;
  pavimentos: number;
  /** População/lotação informada (0 = não informada) — usada nas notas 1 a 6 da Tabela 5 */
  populacao: number;
}

/** Grupos de colunas da Tabela 5 do Decreto 69.118/2024. */
function colunaTabela5(grupo: string, divisao: string):
  | 'ADEG'
  | 'B'
  | 'C'
  | 'F_GERAL'
  | 'F9'
  | 'F11'
  | 'H_146'
  | 'H_235'
  | 'IJM3'
  | 'L1'
  | null {
  if (['A', 'D', 'E', 'G'].includes(grupo)) return 'ADEG';
  if (grupo === 'B') return 'B';
  if (grupo === 'C') return 'C';
  if (grupo === 'F') {
    if (divisao === 'F-9') return 'F9';
    if (divisao === 'F-11') return 'F11';
    return 'F_GERAL'; // F-1 a F-8 e F-10
  }
  if (grupo === 'H') return ['H-1', 'H-4', 'H-6'].includes(divisao) ? 'H_146' : 'H_235';
  if (grupo === 'I' || grupo === 'J' || divisao === 'M-3') return 'IJM3';
  if (divisao === 'L-1') return 'L1';
  return null; // K, L-2/L-3 e demais M: fora da Tabela 5 — IT específica
}

/**
 * TABELA 5 — Edificações com área ≤ 750 m² e altura ≤ 12,00 m.
 * Notas do decreto: 1) iluminação p/ mais de 2 pavimentos; 2) isento motel
 * sem corredor; 3) mais de 50 pessoas ou mais de 2 pavimentos; 4/5) mais de
 * 250 pessoas; 6) mais de 500 pessoas sem janelas.
 */
function medidasTabela5(p: ParametrosExigenciasSP): MedidaExigida[] {
  const medidas: MedidaExigida[] = [];
  const add = (id: string, nota?: string) => medidas.push({ id, obrigatoria: true, nota });
  const coluna = colunaTabela5(p.grupo, p.divisao);

  if (!coluna) {
    // K, L-2, L-3 e ocupações especiais M (exceto M-3): sem coluna na Tabela 5
    add('saidas_emergencia');
    add('sinalizacao_emergencia');
    add('extintores');
    add(
      'controle_ignicao',
      'Ocupação fora das colunas da Tabela 5 (Decreto 69.118/2024) — consultar a IT específica da divisão junto ao CBPMESP.',
    );
    return medidas;
  }

  const maisDe2Pav = p.pavimentos > 2;
  const popDesconhecida = p.populacao <= 0;

  // Nota 1: iluminação para mais de 2 pavimentos
  const iluminacaoNota1 = () => {
    if (maisDe2Pav) add('iluminacao_emergencia', 'Exigida por haver mais de 2 pavimentos (nota 1, Tabela 5)');
  };
  // Nota 3: mais de 50 pessoas OU mais de 2 pavimentos
  const iluminacaoNota3 = () => {
    if (maisDe2Pav || p.populacao > 50) {
      add('iluminacao_emergencia', 'Exigida para lotação > 50 pessoas ou mais de 2 pavimentos (nota 3, Tabela 5)');
    } else if (popDesconhecida) {
      add('iluminacao_emergencia', 'Exigida se a lotação superar 50 pessoas (nota 3) — informe a população no cadastro do projeto');
    }
  };
  // Notas 4/5: mais de 250 pessoas
  const seMaisDe250 = (id: string, rotuloNota: string) => {
    if (p.populacao > 250) add(id, `Exigido para lotação > 250 pessoas (${rotuloNota}, Tabela 5)`);
    else if (popDesconhecida) add(id, `Exigido se a lotação superar 250 pessoas (${rotuloNota}) — informe a população no cadastro`);
  };

  // Exigidas em todas as colunas da Tabela 5
  add('saidas_emergencia');
  add('sinalizacao_emergencia');
  add('extintores');

  switch (coluna) {
    case 'ADEG':
      iluminacaoNota1();
      break;
    case 'B':
      add('controle_materiais');
      add('iluminacao_emergencia', 'Isento para motéis que não possuam corredor interno de serviço (nota 2, Tabela 5)');
      break;
    case 'C':
      iluminacaoNota1();
      break;
    case 'F_GERAL':
      seMaisDe250('controle_materiais', 'nota 5');
      iluminacaoNota3();
      seMaisDe250('brigada_incendio', 'nota 4');
      break;
    case 'F9':
      iluminacaoNota3();
      seMaisDe250('brigada_incendio', 'nota 4');
      break;
    case 'F11':
      seMaisDe250('controle_materiais', 'nota 5');
      iluminacaoNota3();
      seMaisDe250('brigada_incendio', 'nota 4');
      add('plano_emergencia', 'Gerenciamento de risco — exigido para boates (F-11), Tabela 5');
      if (p.populacao > 500) {
        add('controle_fumaca', 'Exigido para lotação > 500 pessoas sem janelas (nota 6, Tabela 5) — IT-15');
      } else if (popDesconhecida) {
        add('controle_fumaca', 'Exigido se lotação > 500 pessoas sem janelas (nota 6) — informe a população no cadastro');
      }
      break;
    case 'H_146':
      iluminacaoNota1();
      break;
    case 'H_235':
      add('controle_materiais');
      iluminacaoNota1();
      add('brigada_incendio');
      add('plano_emergencia', 'Gerenciamento de risco — exigido para H-2, H-3 e H-5, Tabela 5');
      break;
    case 'IJM3':
      iluminacaoNota1();
      break;
    case 'L1':
      add('controle_materiais');
      add('brigada_incendio');
      break;
  }

  return medidas;
}

/**
 * Determina as medidas exigidas em SP (Decreto 69.118/2024, Anexo A).
 *
 * - Área ≤ 750 m² e altura ≤ 12 m → Tabela 5 (oficial, completa).
 * - Acima disso → matriz validada da Bahia como referência de partida
 *   (// TODO: VALIDAR — Tabelas 6A–6M integrais) + regras-resumo oficiais
 *   das Tabelas 6 (chuveiros > 30 m; elevador > 60 m / > 80 m residencial;
 *   controle de fumaça > 90 m conforme IT-15).
 */
export function determinarMedidasExigidasSP(p: ParametrosExigenciasSP): MedidaExigida[] {
  // Art. 4º, § 1º: residencial exclusivamente unifamiliar é excluída das exigências
  if (p.divisao === 'A-1') return [];

  if (p.areaTotal <= 750 && p.alturaM <= 12) return medidasTabela5(p);

  // > 750 m² ou > 12 m — Tabelas 6A–6M (resumo) sobre a matriz de referência
  const medidas = determinarMedidasExigidas({
    grupo: p.grupo,
    divisao: p.divisao,
    altura: p.altura,
    carga: p.carga,
    areaTotal: p.areaTotal,
  });
  const ids = new Set(medidas.map((m) => m.id));
  const add = (id: string, nota: string) => {
    if (!ids.has(id)) {
      medidas.push({ id, obrigatoria: true, nota });
      ids.add(id);
    }
  };

  if (p.alturaM > 30) {
    add('chuveiros_automaticos', 'Exigidos para altura > 30 m na maioria das ocupações (resumo das Tabelas 6, Decreto 69.118/2024)');
  }
  const limiteElevador = p.grupo === 'A' ? 80 : 60;
  if (p.alturaM > limiteElevador) {
    add(
      'elevador_emergencia',
      `Exigido para altura > ${limiteElevador} m (${p.grupo === 'A' ? 'residencial' : 'geral'} — resumo das Tabelas 6)`,
    );
  }
  if (p.alturaM > 90) {
    add('controle_fumaca', 'Exigido para altura > 90 m conforme IT-15 (resumo das Tabelas 6)');
  }

  return medidas;
}

/**
 * TABELA 7 do Decreto 69.118/2024 — exigências adicionais para subsolos com
 * ocupações distintas de estacionamento.
 */
export function exigenciasSubsoloSP(params: {
  areaSubsolo: number;
  primeiroOuSegundoNivel: boolean;
  divisao: string;
}): string[] {
  const { areaSubsolo: area, primeiroOuSegundoNivel, divisao } = params;
  const exigencias: string[] = [];
  if (area <= 0) return exigencias;

  const grupo = divisao.split('-')[0];
  const ehDeposito = grupo === 'J';
  const divisoesF = ['F-1', 'F-3', 'F-5', 'F-6', 'F-10', 'F-11'];

  if (primeiroOuSegundoNivel) {
    if (area <= 50) {
      if (divisao === 'F-11') {
        exigencias.push('Chuveiros automáticos de resposta rápida; OU');
        exigencias.push('Controle de fumaça.');
      } else {
        exigencias.push('Sem exigências adicionais específicas além das medidas da edificação.');
      }
    } else if (area <= 100) {
      if (ehDeposito) {
        exigencias.push('Compartimentos com área máxima de até 5 m² cada; OU');
        exigencias.push('Compartimentos de até 25 m² com detecção automática de incêndio; OU');
        exigencias.push('Chuveiros automáticos de resposta rápida; OU');
        exigencias.push('Controle de fumaça.');
      } else if (divisoesF.includes(divisao)) {
        exigencias.push('Subdivisões com área máxima de até 50 m² com detecção automática de incêndio; OU');
        exigencias.push('Chuveiros automáticos de resposta rápida; OU');
        exigencias.push('Controle de fumaça.');
      } else {
        exigencias.push(
          'Combinação não tabelada na Tabela 7 do Decreto 69.118/2024 para esta ocupação — consultar o CBPMESP.',
        );
      }
    } else if (area <= 250) {
      exigencias.push('Detecção automática de incêndio, controle de fumaça e 2 saídas de emergência; OU');
      exigencias.push('Chuveiros automáticos de resposta rápida e controle de fumaça.');
    } else if (area <= 500) {
      exigencias.push('Detecção automática de incêndio e controle de fumaça; OU');
      exigencias.push('Chuveiros automáticos de resposta rápida e controle de fumaça.');
    } else {
      exigencias.push(
        'OBRIGATÓRIO: chuveiros automáticos de resposta rápida, detecção automática de incêndio, ' +
          '2 saídas de emergência em lados opostos e controle de fumaça.',
      );
    }
  } else {
    // 3º subsolo em diante ("demais subsolos")
    if (area <= 100 && (ehDeposito || grupo === 'F')) {
      exigencias.push('Compartimentos com área máxima de até 5 m² cada; OU');
      exigencias.push('Detecção automática de incêndio, controle de fumaça e 2 saídas de emergência.');
    } else if (area <= 100) {
      exigencias.push(
        'Combinação não tabelada na Tabela 7 do Decreto 69.118/2024 para esta ocupação — consultar o CBPMESP.',
      );
    } else {
      exigencias.push(
        'OBRIGATÓRIO: chuveiros automáticos de resposta rápida, detecção automática de incêndio, ' +
          '2 saídas de emergência em lados opostos e controle de fumaça.',
      );
    }
  }

  return exigencias;
}
