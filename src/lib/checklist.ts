/**
 * Checklist de Aprovação CBM — geração das seções e subitens técnicos.
 *
 * Cada medida exigida pela Matriz de Exigências vira uma SEÇÃO com subitens
 * de conferência (os pontos que mais geram comunique-se). Os valores citados
 * nos subitens vêm dos módulos de cálculo já validados do projeto ativo
 * (extintores, saídas, hidrantes/RTI, iluminação, brigada, TRRF) — nunca de
 * números inventados; itens sem valor calculável são descritivos e citam a
 * IT correspondente da UF ativa.
 */

import type { DadosProjeto } from '@/lib/projeto';
import type { ResultadoTecnico } from '@/lib/engine';
import { nomeMedida } from '@/lib/engine';
import { referenciaMedidaUF } from '@/data/normas';

export interface SubitemChecklist {
  /** id estável para persistência (medida:sub) */
  id: string;
  texto: string;
  /** Detalhe com o valor calculado do projeto, quando houver */
  detalhe?: string;
}

export interface SecaoChecklist {
  id: string;
  titulo: string;
  referencia: string;
  nota?: string;
  subitens: SubitemChecklist[];
}

const f = (n: number, casas = 2) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas });

/** Subitens técnicos por medida, alimentados pelos resultados do projeto. */
function subitensDaMedida(medidaId: string, r: ResultadoTecnico, p: DadosProjeto): SubitemChecklist[] {
  const sub = (suffix: string, texto: string, detalhe?: string): SubitemChecklist => ({
    id: `${medidaId}:${suffix}`,
    texto,
    detalhe,
  });

  switch (medidaId) {
    case 'extintores': {
      const e = r.extintores;
      return [
        sub('classe', 'Capacidade extintora mínima (classe) compatível com o risco', e ? `Mínimo ${e.capacidadeMinima} — risco ${r.carga?.nivel ?? ''}` : undefined),
        sub('distancia', 'Distância máxima de caminhamento até o extintor verificada em planta', e ? `Máximo ${e.distanciaMaximaM} m` : undefined),
        sub('quantidade', 'Quantidade mínima de unidades atendida (mín. 2 por pavimento)', e ? `Estimativa do projeto: ${e.quantidadeEstimada} unidades` : undefined),
        sub('tipos', 'Tipos de agente adequados aos materiais do local', e ? e.tiposRecomendados.join(', ') : undefined),
        sub('locacao', 'Extintores locados em planta, sinalizados e desobstruídos (inclusive casa de máquinas/central GLP)'),
        sub('instalacao', 'Altura de fixação e instalação conforme a IT de extintores da UF'),
      ];
    }
    case 'saidas_emergencia': {
      const s = r.saidas;
      const itens = [
        sub('numero', 'Número mínimo de saídas por pavimento atendido', s ? `Mínimo ${s.numeroMinimoSaidas} — ${s.conformidade.saidas.criterio}` : undefined),
        sub('largura', 'Larguras mínimas de portas, acessos, escadas e descargas atendidas', s ? `Portas ${f(s.dimensionamento.portas.larguraM)} m · escadas ${f(s.dimensionamento.escadas.larguraM)} m · descargas ${f(s.dimensionamento.descargas.larguraM)} m` : undefined),
        sub('distancia_terreo', 'Distância máxima a percorrer no piso de descarga verificada em planta', s?.distanciaMaxima.pisoDescargaM != null ? `Máximo ${s.distanciaMaxima.pisoDescargaM} m` : undefined),
        sub('distancia_demais', 'Distância máxima a percorrer nos demais pavimentos verificada em planta', s?.distanciaMaxima.demaisPavimentosM != null ? `Máximo ${s.distanciaMaxima.demaisPavimentosM} m` : undefined),
        sub('escada_tipo', 'Tipo de escada de emergência enquadrado (Anexo C — Tabela 3 da IT 11)', s ? `${s.tipoEscada.sigla} — ${s.tipoEscada.descricao} (${s.tipoEscada.base}); classificação preliminar — confirmar na Tabela 3` : undefined),
        sub('populacao', 'Cálculo de população documentado no memorial', s ? `${s.populacaoAdotada} pessoas (${s.coeficiente})` : undefined),
        sub('abertura', 'Portas abrindo no sentido da fuga onde exigido e barras antipânico onde aplicável'),
        sub('corrimao', 'Corrimãos, guarda-corpos e degraus conforme a IT de saídas da UF'),
      ];
      return itens;
    }
    case 'hidrantes': {
      const h = r.hidrantes;
      return [
        sub('tipo', 'Tipo de sistema compatível com a ocupação e área (Tabela 3 da IT 22)', h ? `Tipo ${h.sistemaTipo} — ${h.origemTipo}` : undefined),
        sub('rti', 'Reserva Técnica de Incêndio (RTI) dimensionada', h ? `${h.rtiM3} m³ (autonomia ${h.duracaoMinutos} min)` : undefined),
        sub('vazao', 'Vazão e pressão residual no hidrante mais desfavorável comprovadas por memória de cálculo', h ? `Vazão mínima ${h.vazaoMinimaLmin} L/min · pressão ≥ ${h.pressaoMinimaMca} mca` : undefined),
        sub('memoria', 'Memória de cálculo hidráulico anexada (módulo Hidráulica — perspectiva isométrica cotada)'),
        sub('recalque', 'Dispositivo de recalque previsto e acessível à viatura (duas entradas se vazão > 1.000 L/min)'),
        sub('cobertura', 'Todos os pontos da edificação alcançados pelos esguichos considerando o trajeto real das mangueiras'),
        sub('bombas', 'Bombas de incêndio (principal + reserva) e automação especificadas quando exigidas'),
      ];
    }
    case 'iluminacao_emergencia': {
      const i = r.iluminacao;
      return [
        sub('autonomia', 'Autonomia mínima do sistema atendida', i ? `${i.autonomiaHoras} h` : undefined),
        sub('iluminancia', 'Iluminância mínima nas rotas de fuga', i ? `${i.iluminanciaMinimaLux} lux no piso` : undefined),
        sub('espacamento', 'Espaçamento máximo entre pontos e à parede respeitado', i ? `${i.distanciaMaximaPontosM} m entre pontos · ${i.distanciaMaximaParedeM} m à parede` : undefined),
        sub('pontos', 'Pontos locados em planta cobrindo rotas, mudanças de direção/nível e saídas', i ? `Estimativa do projeto: ${i.pontosEstimados} pontos` : undefined),
      ];
    }
    case 'brigada_incendio': {
      const b = r.brigada;
      return [
        sub('quantidade', 'Número mínimo de brigadistas dimensionado', b ? `${b.quantidadeMinima} brigadista(s)` : undefined),
        sub('nivel', 'Nível de treinamento e carga horária adequados', b ? `Nível ${b.nivelTreinamento} · ${b.cargaHoraria}` : undefined),
        sub('memorial', 'Memorial de brigada elaborado e assinado (módulo Memorial de Brigada)'),
        sub('composicao', 'Composição por turno/pavimento definida', b?.composicao),
      ];
    }
    case 'alarme_incendio':
      return [
        sub('central', 'Central de alarme prevista em local com vigilância permanente', p.alarme.centralLocalizacao || 'Entrada principal/recepção (padrão)'),
        sub('acionadores', 'Acionadores manuais locados junto às saídas e nas rotas de fuga'),
        sub('avisadores', 'Avisadores sonoros (e visuais, quando exigidos) audíveis em toda a edificação'),
        sub('fonte', 'Fonte de alimentação com autonomia conforme a IT de detecção e alarme da UF'),
      ];
    case 'deteccao_incendio': {
      const tipos = [
        p.deteccao.pontuais && 'pontuais',
        p.deteccao.lineares && 'lineares',
        p.deteccao.chama && 'chama',
        p.deteccao.termovelocimetricos && 'termovelocimétricos',
        p.deteccao.gases && 'gases',
      ].filter(Boolean).join(', ');
      return [
        sub('cobertura', 'Cobertura dos detectores compatível com os ambientes protegidos', tipos ? `Tipos selecionados: ${tipos}` : 'Selecione os tipos no cadastro do projeto'),
        sub('laco', 'Endereçamento/laços e central compatíveis com o porte da edificação'),
        sub('areas_criticas', 'Detecção prevista em áreas críticas (CPD, depósitos, casa de máquinas) quando exigido'),
      ];
    }
    case 'sinalizacao_emergencia':
      return [
        sub('rotas', 'Sinalização de orientação das rotas de fuga completa até a saída final'),
        sub('equipamentos', 'Sinalização de equipamentos (extintores, hidrantes, alarme) em todos os pontos'),
        sub('fotoluminescente', 'Material fotoluminescente/dimensões conforme a IT de sinalização da UF e NBR 13434'),
        sub('proibicao', 'Sinalização de proibição/alerta em áreas de risco específico (GLP, inflamáveis)'),
      ];
    case 'seguranca_estrutural':
      return [
        sub('trrf', 'TRRF dos elementos estruturais atendido', r.trrf?.pavimentos != null ? `${r.trrf.pavimentos} min (pavimentos)${r.trrf.subsolo != null ? ` · ${r.trrf.subsolo} min (subsolo)` : ''}` : undefined),
        sub('laudo', 'Comprovação do TRRF (laudo/projeto estrutural ou memorial de revestimento contra fogo)'),
      ];
    case 'chuveiros_automaticos':
      return [
        sub('cobertura', 'Cobertura dos chuveiros em todas as áreas exigidas (NBR 10897)'),
        sub('memoria', 'Memória de cálculo hidráulico dos chuveiros anexada'),
        sub('reserva', 'Reserva de água e bombas dimensionadas para o sistema'),
      ];
    case 'spda':
      return [
        sub('projeto', 'Projeto/laudo de SPDA conforme NBR 5419 com ART'),
        sub('inspecao', 'Medições de aterramento e relatório de inspeção anexados quando existente'),
      ];
    case 'acesso_viatura':
      return [
        sub('via', 'Via de acesso e faixa de estacionamento da viatura dimensionadas conforme a IT da UF'),
        sub('portao', 'Portões/altura livre compatíveis e acesso desobstruído até a edificação'),
      ];
    case 'separacao_edificacoes':
      return [
        sub('isolamento', 'Distâncias de isolamento de risco entre edificações atendidas ou compensadas'),
        sub('paredes', 'Paredes corta-fogo de separação com TRRF adequado, quando adotadas'),
      ];
    case 'compartimentacao_horizontal':
    case 'compartimentacao_vertical':
      return [
        sub('elementos', 'Elementos de compartimentação (paredes/lajes/selagens) indicados em planta'),
        sub('portas', 'Portas corta-fogo com resistência compatível e fechamento automático'),
        sub('selagem', 'Selagem corta-fogo das passagens de instalações (shafts, leitos de cabos)'),
      ];
    case 'controle_materiais':
      return [
        sub('classes', 'Classes de reação ao fogo dos acabamentos (piso/parede/teto) especificadas no memorial'),
        sub('laudos', 'Laudos/certificados dos materiais de revestimento anexados quando exigidos'),
      ];
    case 'plano_emergencia':
      return [
        sub('documento', 'Plano de emergência elaborado conforme a IT da UF (com plantas de emergência)'),
        sub('exercicios', 'Previsão de exercícios simulados e responsabilidades definidas'),
      ];
    case 'controle_fumaca':
      return [
        sub('projeto', 'Sistema de controle de fumaça projetado para as áreas exigidas'),
        sub('acionamento', 'Acionamento automático/manual e fonte de energia de emergência definidos'),
      ];
    case 'elevador_emergencia':
      return [
        sub('cabina', 'Elevador de emergência com requisitos da IT (dimensões, comando, alimentação)'),
      ];
    case 'espuma':
      return [
        sub('projeto', 'Sistema de espuma dimensionado para as áreas com líquidos inflamáveis'),
      ];
    case 'controle_ignicao':
      return [
        sub('eletricas', 'Instalações elétricas conforme NBR 5410 (com ART quando exigida)'),
        sub('fontes', 'Fontes de ignição controladas nas áreas de risco (permissão de trabalho a quente etc.)'),
      ];
    default:
      return [sub('geral', 'Sistema projetado, indicado em planta e descrito no memorial')];
  }
}

/** Itens documentais fixos do protocolo. */
export const SECAO_DOCUMENTACAO: SecaoChecklist = {
  id: 'documentacao',
  titulo: 'Documentação do protocolo',
  referencia: 'Legislação da UF',
  subitens: [
    { id: 'doc:art', texto: 'ART/RRT de projeto recolhida e assinada' },
    { id: 'doc:memorial', texto: 'Memorial descritivo revisado e assinado' },
    { id: 'doc:plantas', texto: 'Plantas com leiaute dos sistemas, rotas de fuga e detalhes exigidos' },
    { id: 'doc:isometrico', texto: 'Perspectiva isométrica cotada da rede de hidrantes (quando exigida)' },
    { id: 'doc:dados', texto: 'Dados cadastrais (proprietário, endereço, CNPJ) conferidos' },
    { id: 'doc:taxas', texto: 'Taxas e formulários do CBM preenchidos e pagos' },
  ],
};

/** Gera as seções do checklist a partir da Matriz de Exigências do projeto. */
export function gerarChecklist(r: ResultadoTecnico, p: DadosProjeto): SecaoChecklist[] {
  const secoes: SecaoChecklist[] = r.medidasExigidas.map((m) => ({
    id: m.id,
    titulo: nomeMedida(m.id),
    referencia: referenciaMedidaUF(p.uf, m.id) || '—',
    nota: m.nota,
    subitens: subitensDaMedida(m.id, r, p),
  }));
  secoes.push(SECAO_DOCUMENTACAO);
  return secoes;
}
