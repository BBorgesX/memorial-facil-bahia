/**
 * Gerador do Memorial Descritivo de Segurança Contra Incêndio e Pânico.
 *
 * Estrutura baseada no modelo de memorial descritivo (Instalações de Segurança
 * e Combate a Incêndio) usado em projetos submetidos ao CBMBA, preenchida
 * automaticamente com a classificação e os cálculos das ITs.
 */

import { DadosProjeto } from './projeto';
import { medidaAplicavel, ResultadoTecnico } from './engine';
import { MEDIDAS_SEGURANCA, RISCOS_ESPECIAIS } from './normas/exigencias';

const fmt = (n: number | null | undefined, casas = 0): string =>
  n === null || n === undefined ? '—' : n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const paragrafos = (s: string): string =>
  s.split(/\n+/).filter(Boolean).map((l) => `<p>${esc(l)}</p>`).join('');

function enderecoCompleto(p: DadosProjeto): string {
  const partes = [
    [p.logradouro, p.numero].filter(Boolean).join(', '),
    p.complemento,
    p.bairro,
    p.municipio ? `${p.municipio} – BA` : '',
    p.cep ? `CEP ${p.cep}` : '',
  ].filter(Boolean);
  return partes.join(', ') || 'Não informado';
}

const TIPO_EDIFICACAO: Record<string, string> = {
  construcao: 'Construção (edificação a construir)',
  existente: 'Edificação existente (regularização conforme IT 42)',
  renovacao: 'Renovação',
};

const APRESENTACAO: Record<string, string> = {
  PT: 'Projeto Técnico (PT)',
  PTS: 'Projeto Técnico Simplificado (PTS)',
  PTIOT: 'Projeto Técnico para Instalação e Ocupação Temporária (PTIOT)',
  PTOTEP: 'Projeto Técnico para Ocupação Temporária em Edificação Permanente (PTOTEP)',
};

/** Gera o corpo HTML do memorial (sem <html>/<head> — o chamador embala). */
export function gerarMemorialHTML(p: DadosProjeto, r: ResultadoTecnico): string {
  let n = 0; // numerador de seções
  const secoes: string[] = [];
  const aplicavel = (id: string) => medidaAplicavel(p, r, id);
  const detalhesUsuario = (id: string) => {
    const d = p.medidas[id]?.detalhes?.trim();
    return d ? `<div class="detalhes-usuario">${paragrafos(d)}</div>` : '';
  };
  const sec = (titulo: string, corpo: string) => {
    n += 1;
    secoes.push(`<section><h2>${n}. ${titulo}</h2>${corpo}</section>`);
  };

  // -------------------------------------------------------------------------
  // 1. Dados da edificação
  // -------------------------------------------------------------------------
  sec('DADOS DA EDIFICAÇÃO', `
    <table class="dados">
      <tr><td>Proprietário / Obra</td><td>${esc(p.proprietario || p.nome)}</td></tr>
      <tr><td>Cliente / Empresa</td><td>${esc(p.empresa || '—')}</td></tr>
      <tr><td>CNPJ</td><td>${esc(p.cnpj || '—')}</td></tr>
      <tr><td>Tipo de edificação</td><td>${TIPO_EDIFICACAO[p.tipoEdificacao] ?? '—'}</td></tr>
      <tr><td>Forma de apresentação</td><td>${APRESENTACAO[p.apresentacao] ?? '—'}</td></tr>
      <tr><td>Endereço</td><td>${esc(enderecoCompleto(p))}</td></tr>
      <tr><td>Área existente</td><td>${fmt(p.areaExistente, 2)} m²</td></tr>
      <tr><td>Área a construir</td><td>${fmt(p.areaConstruir, 2)} m²</td></tr>
      <tr><td>Área total construída</td><td><strong>${fmt(r.areaTotal, 2)} m²</strong></td></tr>
      <tr><td>Altura da edificação</td><td>${fmt(p.alturaM, 2)} m</td></tr>
      <tr><td>Número de pavimentos</td><td>${fmt(p.pavimentos)}</td></tr>
      <tr><td>Subsolo</td><td>${p.temSubsolo ? `Sim — ${fmt(p.areaSubsoloM2, 2)} m² (${esc(p.ocupacaoSubsolo || 'ocupação não informada')})` : 'Não há'}</td></tr>
      <tr><td>População (fixa + flutuante)</td><td>${fmt(r.saidas?.populacaoAdotada)} pessoas</td></tr>
    </table>
  `);

  // -------------------------------------------------------------------------
  // 2. Normas técnicas
  // -------------------------------------------------------------------------
  sec('NORMAS TÉCNICAS', `
    <p>Os equipamentos e serviços objeto deste memorial deverão estar em conformidade com a legislação vigente do
    Estado da Bahia, as regulamentações do Corpo de Bombeiros Militar do Estado da Bahia (CBMBA), as normas da
    ABNT e demais diretrizes técnicas aplicáveis, sempre em sua última atualização vigente:</p>
    <table class="normas">
      <tr><td>Lei Estadual nº 12.929/2013</td><td>Lei de Prevenção e Proteção Contra Incêndio do Estado da Bahia</td></tr>
      <tr><td>Decreto Estadual nº 16.302/2015</td><td>Regulamenta a Lei nº 12.929/2013</td></tr>
      <tr><td>Lei Federal nº 13.425/2017</td><td>Diretrizes gerais de prevenção e combate a incêndio e desastres</td></tr>
      <tr><td>ITs 01 a 43 — CBMBA</td><td>Instruções Técnicas do Corpo de Bombeiros Militar da Bahia</td></tr>
      <tr><td>ABNT NBR 5628</td><td>Componentes construtivos estruturais — determinação da resistência ao fogo</td></tr>
      <tr><td>ABNT NBR 9050</td><td>Acessibilidade a edificações, mobiliário, espaços e equipamentos urbanos</td></tr>
      <tr><td>ABNT NBR 9077</td><td>Saídas de emergência em edifícios</td></tr>
      <tr><td>ABNT NBR 10898</td><td>Sistema de iluminação de emergência</td></tr>
      <tr><td>ABNT NBR 11742</td><td>Porta corta-fogo para saída de emergência</td></tr>
      <tr><td>ABNT NBR 11785</td><td>Barra antipânico — requisitos</td></tr>
      <tr><td>ABNT NBR 12693</td><td>Sistemas de proteção por extintores de incêndio</td></tr>
      <tr><td>ABNT NBR 13434</td><td>Sinalização de segurança contra incêndio e pânico</td></tr>
      <tr><td>ABNT NBR 13714</td><td>Sistemas de hidrantes e de mangotinhos para combate a incêndio</td></tr>
      <tr><td>ABNT NBR 16820</td><td>Sistemas de sinalização de emergência</td></tr>
      <tr><td>ABNT NBR 17240</td><td>Sistemas de detecção e alarme de incêndio</td></tr>
      <tr><td>NFPA 20</td><td>Bombas estacionárias de proteção contra incêndio</td></tr>
    </table>
    <p>Na inexistência destas, ou em caráter suplementar, poderão ser adotadas normas de entidades reconhecidas
    internacionalmente (ANSI, DIN, ASTM, IEC, NFPA).</p>
    <p><strong>Certificações:</strong> para sistemas de chuveiros automáticos, alarme e outros sistemas especiais serão
    exigidas certificações FM (Factory Mutual), UL (Underwriters Laboratories) ou CE (Comunidade Europeia), nesta
    ordem de preferência, além da certificação INMETRO onde aplicável.</p>
  `);

  // -------------------------------------------------------------------------
  // 3. Classificação do empreendimento
  // -------------------------------------------------------------------------
  if (r.ocupacao && r.altura && r.carga) {
    sec('CLASSIFICAÇÃO DO EMPREENDIMENTO (DECRETO ESTADUAL Nº 16.302/2015)', `
      <h3>Tabela 1 — Classificação quanto à ocupação</h3>
      <table class="dados">
        <tr><td>Grupo</td><td>${r.ocupacao.grupoCodigo} — ${esc(r.ocupacao.grupoNome)}</td></tr>
        <tr><td>Divisão</td><td>${r.ocupacao.divisao}</td></tr>
        <tr><td>Descrição</td><td>${esc(r.ocupacao.descricao)}</td></tr>
        <tr><td>Exemplos</td><td>${esc(r.ocupacao.exemplos)}</td></tr>
      </table>
      <h3>Tabela 2 — Classificação quanto à altura</h3>
      <table class="dados">
        <tr><td>Tipo</td><td>${r.altura.tipo}</td></tr>
        <tr><td>Denominação</td><td>${esc(r.altura.denominacao)}</td></tr>
        <tr><td>Altura da edificação</td><td>${fmt(p.alturaM, 2)} m (${esc(r.altura.descricao)})</td></tr>
      </table>
      <h3>Tabela 3 — Classificação quanto à carga de incêndio</h3>
      <table class="dados">
        <tr><td>Risco</td><td>${r.carga.nivel}</td></tr>
        <tr><td>Carga de incêndio específica</td><td>${fmt(p.cargaIncendioMJm2)} MJ/m² (${esc(r.carga.descricao)})</td></tr>
      </table>
    `);
  }

  // -------------------------------------------------------------------------
  // 4. Sistemas a serem instalados
  // -------------------------------------------------------------------------
  const listaMedidas = MEDIDAS_SEGURANCA.filter((m) => aplicavel(m.id));
  const notas = new Map(r.medidasExigidas.map((m) => [m.id, m.nota]));
  sec('MEDIDAS DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO EXIGIDAS', `
    <p>De acordo com as Tabelas 5 e 6 do Decreto Estadual nº 16.302/2015 (exigências para edificações, estruturas e
    áreas de risco), em função da ocupação, altura, área e carga de incêndio classificadas acima, serão
    implementadas as seguintes medidas de segurança:</p>
    <table class="normas">
      ${listaMedidas.map((m) => `<tr><td>${esc(m.nome)}</td><td>${esc(m.referencia)}${notas.get(m.id) ? ` — ${esc(notas.get(m.id)!)}` : ''}</td></tr>`).join('')}
    </table>
    ${r.exigenciasSubsolo.length ? `
      <h3>Exigências adicionais para ocupação em subsolo (Tabela 7)</h3>
      <p>Subsolo com ${fmt(p.areaSubsoloM2, 2)} m² destinado a ${esc(p.ocupacaoSubsolo || 'ocupação diversa de estacionamento')}:</p>
      <ul>${r.exigenciasSubsolo.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
    ` : ''}
  `);

  // -------------------------------------------------------------------------
  // Seções descritivas por sistema
  // -------------------------------------------------------------------------
  if (aplicavel('acesso_viatura')) {
    sec('ACESSO DE VIATURA NA EDIFICAÇÃO E ÁREAS DE RISCO (IT 06)', `
      <p>O acesso das viaturas do Corpo de Bombeiros atenderá às condições da IT 06/2016 para busca, salvamento e
      combate a incêndio. O acesso se dará pela ${esc(enderecoCompleto(p))}.</p>
      <h3>Características da via de acesso</h3>
      <ul>
        <li>Largura mínima: 6,00 m;</li>
        <li>Suporte de viaturas com peso de 25.000 kg;</li>
        <li>Altura livre mínima: 4,50 m;</li>
        <li>Portão de acesso (quando houver): largura mínima 4,00 m e altura mínima 4,50 m.</li>
      </ul>
      ${detalhesUsuario('acesso_viatura')}
    `);
  }

  if (aplicavel('seguranca_estrutural')) {
    sec('SEGURANÇA ESTRUTURAL CONTRA INCÊNDIO (IT 08)', `
      <p>Os elementos estruturais e de compartimentação atenderão ao Tempo Requerido de Resistência ao Fogo (TRRF)
      determinado pela Tabela A da IT 08, em função da ocupação e da altura da edificação:</p>
      <table class="dados">
        <tr><td>TRRF — pavimentos</td><td><strong>${r.trrf?.pavimentos ? `${r.trrf.pavimentos} minutos` : 'Consultar CBMBA'}</strong> (faixa: ${esc(r.trrf?.faixaAltura ?? '—')})</td></tr>
        ${p.temSubsolo ? `<tr><td>TRRF — subsolo</td><td><strong>${r.trrf?.subsolo ? `${r.trrf.subsolo} minutos` : 'Consultar CBMBA'}</strong></td></tr>` : ''}
      </table>
      <p>A comprovação da resistência ao fogo dos elementos estruturais seguirá a NBR 5628 e normas correlatas.
      Selagens de shafts, dutos e aberturas entre compartimentos deverão apresentar TRRF compatível com o exigido.</p>
      ${detalhesUsuario('seguranca_estrutural')}
    `);
  }

  if (aplicavel('compartimentacao_horizontal') || aplicavel('compartimentacao_vertical')) {
    sec('COMPARTIMENTAÇÃO HORIZONTAL E VERTICAL (IT 09)', `
      <p>A IT 09 define os critérios de compartimentação horizontal e vertical. A compartimentação horizontal impede a
      propagação do incêndio no mesmo pavimento e a vertical impede a propagação entre pavimentos consecutivos.</p>
      <ul>
        <li>Limites de área máxima por compartimento conforme o Anexo da IT 09 para o grupo ${r.ocupacao?.grupoCodigo ?? ''} e tipo ${r.altura?.tipo ?? ''};</li>
        <li>Distâncias mínimas entre aberturas de fachada conforme a proximidade entre edificações e compartimentos;</li>
        <li>Shafts, dutos e aberturas entre compartimentos ou pavimentos selados com TRRF de 120 minutos (NBR 6479);</li>
        <li>Dutos de ar-condicionado, ventilação ou exaustão que cruzem compartimentos dotados de dampers automáticos
        acionados por fusíveis ou pelo sistema de detecção;</li>
        <li>Paredes corta-fogo em alvenaria certificada, do piso à laje, vinculadas à estrutura, sem aberturas;</li>
        <li>Portas corta-fogo certificadas pelo INMETRO (NBR 11742).</li>
      </ul>
      ${detalhesUsuario('compartimentacao_horizontal')}${detalhesUsuario('compartimentacao_vertical')}
    `);
  }

  if (aplicavel('controle_materiais')) {
    sec('CONTROLE DE MATERIAIS DE ACABAMENTO E REVESTIMENTO (IT 10)', `
      <p>Os materiais de acabamento e revestimento de pisos, paredes, tetos e forros atenderão às classes de reação ao
      fogo estabelecidas na IT 10 para a ocupação ${r.ocupacao?.divisao ?? ''}, comprovadas por ensaios conforme as
      normas nela referenciadas. Em rotas de fuga serão utilizados apenas materiais incombustíveis ou classe II-A.</p>
      ${detalhesUsuario('controle_materiais')}
    `);
  }

  if (aplicavel('saidas_emergencia') && r.saidas) {
    sec('SAÍDAS DE EMERGÊNCIA (IT 11 / NBR 9077)', `
      <h3>Cálculo da população</h3>
      <table class="dados">
        <tr><td>Coeficiente adotado</td><td>${esc(r.saidas.coeficiente)}</td></tr>
        <tr><td>População calculada</td><td>${fmt(r.saidas.populacaoCalculada)} pessoas</td></tr>
        <tr><td>População adotada no projeto</td><td><strong>${fmt(r.saidas.populacaoAdotada)} pessoas</strong></td></tr>
      </table>
      <h3>Dimensionamento das saídas (N = P / C)</h3>
      <table class="normas">
        <tr><th>Elemento</th><th>Unidades de passagem</th><th>Largura mínima</th></tr>
        <tr><td>Acessos e descargas</td><td>${fmt(r.saidas.unidadesPassagem.acessos)}</td><td>${fmt(r.saidas.larguraMinima.acessosM, 2)} m</td></tr>
        <tr><td>Escadas e rampas</td><td>${fmt(r.saidas.unidadesPassagem.escadas)}</td><td>${fmt(r.saidas.larguraMinima.escadasM, 2)} m</td></tr>
        <tr><td>Portas</td><td>${fmt(r.saidas.unidadesPassagem.portas)}</td><td>${fmt(r.saidas.larguraMinima.portasM, 2)} m</td></tr>
      </table>
      <h3>Distâncias máximas a percorrer</h3>
      <table class="dados">
        <tr><td>Piso de descarga (térreo)</td><td>${r.saidas.distanciaMaxima.pisoDescargaM ? `${r.saidas.distanciaMaxima.pisoDescargaM} m` : 'Consultar CBMBA'}</td></tr>
        <tr><td>Demais pavimentos</td><td>${r.saidas.distanciaMaxima.demaisPavimentosM ? `${r.saidas.distanciaMaxima.demaisPavimentosM} m` : 'Consultar CBMBA'}</td></tr>
      </table>
      <p>${esc(r.saidas.distanciaMaxima.consideracoes)}</p>
      <p>Número mínimo de saídas: <strong>${fmt(r.saidas.numeroMinimoSaidas)}</strong>. As portas das rotas de saída abrirão
      no sentido do fluxo de fuga, dotadas de barra antipânico onde exigido (NBR 11785). Corrimãos e guarda-corpos
      conforme IT 11 e NBR 9077.</p>
      ${detalhesUsuario('saidas_emergencia')}
    `);
  }

  if (aplicavel('elevador_emergencia')) {
    sec('ELEVADOR DE EMERGÊNCIA (IT 11)', `
      <p>Será previsto elevador de emergência com acionamento prioritário por chave, alimentação elétrica protegida,
      cabina com dimensões mínimas para maca, porta corta-fogo no hall e comunicação com a central. Atendimento
      integral à IT 11 e à NBR NM 207.</p>
      ${detalhesUsuario('elevador_emergencia')}
    `);
  }

  if (aplicavel('plano_emergencia')) {
    sec('PLANO DE EMERGÊNCIA CONTRA INCÊNDIO E PÂNICO (IT 16)', `
      <p>Será elaborado e mantido atualizado Plano de Emergência conforme a IT 16/2018, contemplando: identificação
      dos riscos, recursos humanos e materiais disponíveis, rotas de fuga e ponto de encontro, procedimentos de
      alerta, alarme, combate a princípio de incêndio, corte de energia, abandono da edificação, chamada do Corpo de
      Bombeiros (193) e primeiros socorros.</p>
      <p>O plano será exercitado por meio de simulados periódicos com registro em ata, e revisado a cada alteração
      física da edificação ou da estrutura de recursos humanos de segurança.</p>
      ${detalhesUsuario('plano_emergencia')}
    `);
  }

  if (aplicavel('brigada_incendio') && r.brigada) {
    sec('BRIGADA DE INCÊNDIO (IT 17 / NBR 14276)', `
      <table class="dados">
        <tr><td>População fixa considerada</td><td>${fmt(r.saidas?.populacaoAdotada)} pessoas</td></tr>
        <tr><td>Nível de risco (Tabela 3)</td><td>${r.carga?.nivel ?? '—'}</td></tr>
        <tr><td>Quantidade mínima de brigadistas</td><td><strong>${fmt(r.brigada.quantidadeMinima)}</strong></td></tr>
        <tr><td>Nível de treinamento</td><td>${esc(r.brigada.nivelTreinamento)}</td></tr>
        <tr><td>Carga horária de formação</td><td>${esc(r.brigada.cargaHoraria)}</td></tr>
      </table>
      <p>${esc(r.brigada.composicao)}</p>
      ${detalhesUsuario('brigada_incendio')}
    `);
  }

  if (aplicavel('iluminacao_emergencia') && r.iluminacao) {
    sec('ILUMINAÇÃO DE EMERGÊNCIA (IT 18 / NBR 10898:2023)', `
      <p>O sistema de iluminação de emergência será composto por iluminação de aclaramento (rotas de fuga e áreas
      comuns) e de balizamento (demarcação das rotas e saídas), atendendo aos parâmetros:</p>
      <table class="dados">
        <tr><td>Autonomia mínima</td><td>${r.iluminacao.autonomiaHoras} horas</td></tr>
        <tr><td>Iluminância mínima (aclaramento)</td><td>${r.iluminacao.iluminanciaMinimaLux} lux no piso das rotas de fuga</td></tr>
        <tr><td>Distância máxima entre pontos</td><td>${r.iluminacao.distanciaMaximaPontosM} m (${fmt(r.iluminacao.distanciaMaximaParedeM, 1)} m até a parede)</td></tr>
        <tr><td>Tempo de comutação</td><td>máx. 15 s para atingir 50% da iluminância requerida</td></tr>
        <tr><td>Quantidade estimada de pontos</td><td><strong>${fmt(r.iluminacao.pontosEstimados)}</strong></td></tr>
      </table>
      <p>Luminárias com corpo autoextinguível, grau de proteção mínimo IP20 (IP54 em áreas molhadas/externas),
      bateria selada livre de manutenção com vida útil mínima de 4 anos, carregamento automático e indicador de
      funcionamento. Instalação a no mínimo 2,00 m do piso acabado, em saídas, mudanças de direção e de nível e
      junto a equipamentos de segurança.</p>
      <p>${esc(r.iluminacao.observacao)}</p>
      ${detalhesUsuario('iluminacao_emergencia')}
    `);
  }

  if (aplicavel('deteccao_incendio') || aplicavel('alarme_incendio')) {
    sec('DETECÇÃO E ALARME DE INCÊNDIO (IT 19 / NBR 17240)', `
      <p>Sistema ${aplicavel('deteccao_incendio') ? 'de detecção automática e alarme' : 'de alarme'} de incêndio composto por
      central, ${aplicavel('deteccao_incendio') ? 'detectores automáticos (fumaça pontuais/lineares, térmicos, de chama ou de gases, conforme o ambiente), ' : ''}
      acionadores manuais, sinalizadores audiovisuais, módulos de interface e cabeamento específico, setorizado de
      acordo com a compartimentação da edificação.</p>
      <ul>
        <li><strong>Central de alarme:</strong> endereçável ou convencional, com display, registro de eventos em memória
        não volátil, supervisão contínua de falhas e acionamento automático de sirenes;</li>
        <li><strong>Acionadores manuais:</strong> cor vermelha, instalados nas rotas de fuga com espaçamento máximo de
        30 m e altura entre 0,90 m e 1,35 m;</li>
        <li><strong>Sinalizadores audiovisuais:</strong> sirenes com potência sonora superior a 85 dB a 3 m e sinalizadores
        visuais estroboscópicos em áreas ruidosas ou acessíveis a pessoas com deficiência auditiva;</li>
        <li><strong>Alimentação:</strong> rede elétrica com baterias seladas — autonomia mínima de 24 h em supervisão
        mais 15 min em alarme geral (NBR 17240);</li>
        <li><strong>Fiação:</strong> cabos com isolação antichama e baixa emissão de fumaça, identificados por setor.</li>
      </ul>
      ${detalhesUsuario('deteccao_incendio')}${detalhesUsuario('alarme_incendio')}
    `);
  }

  if (aplicavel('sinalizacao_emergencia')) {
    sec('SINALIZAÇÃO DE EMERGÊNCIA (IT 20 / NBR 13434 / NBR 16820)', `
      <p>Sinalização básica composta por quatro categorias, em placas fotoluminescentes conforme NBR 13434:</p>
      <ul>
        <li><strong>Proibição:</strong> proibido fumar, proibido produzir chama, etc.;</li>
        <li><strong>Alerta:</strong> riscos específicos (inflamáveis, choque elétrico, GLP);</li>
        <li><strong>Orientação e salvamento:</strong> rotas de fuga, saídas e sinalização continuada;</li>
        <li><strong>Equipamentos:</strong> indicação de extintores, hidrantes, acionadores e alarme.</li>
      </ul>
      <p>Sinalização complementar de indicação continuada nas rotas de fuga e de obstáculos, conforme IT 20.</p>
      ${detalhesUsuario('sinalizacao_emergencia')}
    `);
  }

  if (aplicavel('extintores') && r.extintores) {
    sec('EXTINTORES DE INCÊNDIO (IT 21 / NBR 12693)', `
      <table class="dados">
        <tr><td>Risco da edificação</td><td>${r.carga?.nivel ?? '—'}</td></tr>
        <tr><td>Capacidade extintora mínima</td><td><strong>${esc(r.extintores.capacidadeMinima)}</strong></td></tr>
        <tr><td>Distância máxima a percorrer</td><td>${fmt(r.extintores.distanciaMaximaM)} m</td></tr>
        <tr><td>Quantidade estimada</td><td><strong>${fmt(r.extintores.quantidadeEstimada)} unidades</strong></td></tr>
      </table>
      <p>Tipos recomendados:</p>
      <ul>${r.extintores.tiposRecomendados.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <p>${esc(r.extintores.observacao)}</p>
      ${detalhesUsuario('extintores')}
    `);
  }

  if (aplicavel('hidrantes') && r.hidrantes) {
    sec('SISTEMA DE HIDRANTES E MANGOTINHOS (IT 22 / NBR 13714)', `
      <table class="dados">
        <tr><td>Tipo de sistema</td><td><strong>Tipo ${r.hidrantes.sistemaTipo}</strong> — ${esc(r.hidrantes.descricaoSistema)}</td></tr>
        <tr><td>Vazão mínima no hidrante mais desfavorável</td><td><strong>${fmt(r.hidrantes.vazaoMinimaLmin)} L/min</strong></td></tr>
        <tr><td>Pressão dinâmica mínima no esguicho</td><td>${fmt(r.hidrantes.pressaoMinimaMca)} m.c.a.</td></tr>
        <tr><td>Esguicho</td><td>${esc(r.hidrantes.esguicho)}</td></tr>
        <tr><td>Mangueiras</td><td>${esc(r.hidrantes.mangueira)}</td></tr>
        <tr><td>Reserva Técnica de Incêndio (RTI)</td><td><strong>${fmt(r.hidrantes.rtiM3)} m³</strong> (mínimo ${fmt(r.hidrantes.duracaoMinutos)} min de operação)</td></tr>
      </table>
      <h3>Reservatório e pressurização</h3>
      <p>A RTI será garantida em reservatório com dispositivo que impeça seu uso para consumo predial. O sistema será
      pressurizado por conjunto de bombas dimensionado para manter a vazão e a pressão mínimas no hidrante mais
      desfavorável (bomba principal elétrica, bomba de reserva — elétrica ou a combustão, conforme o caso — e bomba
      jockey para manutenção de pressão), com partida automática por pressostatos e acionamento supervisionado,
      conforme IT 22 e NFPA 20.</p>
      <p>Hidrantes com registro globo angular DN 65 mm (2½"), adaptação Storz, abrigos sinalizados com mangueiras,
      esguichos e chaves. Hidrante de recalque no passeio, no alinhamento da via de acesso das viaturas.</p>
      <p><em>A memória de cálculo hidráulico definitiva (perdas de carga, curvas das bombas e pontos de operação)
      deverá acompanhar o projeto executivo.</em></p>
      ${detalhesUsuario('hidrantes')}
    `);
  }

  if (aplicavel('chuveiros_automaticos')) {
    sec('SISTEMA DE CHUVEIROS AUTOMÁTICOS — SPRINKLERS (IT 23/IT 24 / NBR 10897)', `
      <p>Sistema de chuveiros automáticos do tipo tubo molhado cobrindo as áreas exigidas, dimensionado por cálculo
      hidráulico conforme NBR 10897 para a classe de risco da ocupação (${r.carga?.nivel ?? '—'}), incluindo válvulas de
      governo e alarme (VGA), detectores de fluxo (flow switches) supervisionados pela central de alarme, dreno e
      dispositivo de teste. Certificações FM/UL/CE exigidas para bicos, válvulas e conexões.</p>
      ${detalhesUsuario('chuveiros_automaticos')}
    `);
  }

  if (aplicavel('controle_fumaca')) {
    sec('CONTROLE DE FUMAÇA (IT 43)', `
      <p>Sistema de controle de fumaça (natural e/ou mecânico) das áreas exigidas, com acionamento automático pelo
      sistema de detecção e comando manual na central, garantindo a manutenção de camada livre de fumaça nas rotas
      de fuga, conforme IT 43 e normas complementares.</p>
      ${detalhesUsuario('controle_fumaca')}
    `);
  }

  if (aplicavel('espuma')) {
    sec('SISTEMA DE ESPUMA (IT 26)', `
      <p>Sistema de combate por espuma mecânica para as áreas com líquidos inflamáveis/combustíveis, com proporção
      e taxas de aplicação conforme IT 26 e NBR 17505, incluindo reserva de Líquido Gerador de Espuma (LGE).</p>
      ${detalhesUsuario('espuma')}
    `);
  }

  if (aplicavel('controle_ignicao')) {
    sec('CONTROLE DE FONTES DE IGNIÇÃO', `
      <p>Instalações elétricas conforme NBR 5410 (e NBR IEC 60079 em áreas classificadas), aterramento e
      equipotencialização, proibição de chama aberta em áreas de risco e sinalização de alerta correspondente.</p>
      ${detalhesUsuario('controle_ignicao')}
    `);
  }

  if (aplicavel('spda')) {
    sec('SISTEMA DE PROTEÇÃO CONTRA DESCARGAS ATMOSFÉRICAS — SPDA (IT 41 / NBR 5419)', `
      <p>SPDA projetado conforme análise de risco da NBR 5419-2, com subsistemas de captação, descida e aterramento,
      equipotencialização e DPS nos quadros, e medição de resistência de aterramento com laudo e ART específica.</p>
      ${detalhesUsuario('spda')}
    `);
  }

  // -------------------------------------------------------------------------
  // Riscos especiais
  // -------------------------------------------------------------------------
  const riscosAtivos = RISCOS_ESPECIAIS.filter((risco) => p.riscosEspeciais[risco.id]?.aplicavel);
  const outrosRiscos = p.riscosEspeciais['outros']?.detalhes?.trim();
  if (riscosAtivos.length || outrosRiscos) {
    sec('RISCOS ESPECIAIS', `
      <p>São presentes na edificação os seguintes riscos especiais, cujas medidas específicas atenderão às respectivas
      Instruções Técnicas:</p>
      ${riscosAtivos.map((risco) => `
        <h3>${esc(risco.nome)} (${esc(risco.referencia)})</h3>
        ${p.riscosEspeciais[risco.id]?.detalhes ? paragrafos(p.riscosEspeciais[risco.id].detalhes) : '<p>Atendimento integral à IT correspondente.</p>'}
      `).join('')}
      ${outrosRiscos ? `<h3>Outros riscos</h3>${paragrafos(outrosRiscos)}` : ''}
    `);
  }

  // -------------------------------------------------------------------------
  // Considerações finais e assinaturas
  // -------------------------------------------------------------------------
  const dataExtenso = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  sec('CONSIDERAÇÕES FINAIS', `
    <p>Todos os sistemas descritos serão executados, testados e mantidos conforme as Instruções Técnicas do CBMBA e
    normas ABNT referenciadas. Alterações de layout, ocupação ou área implicarão revisão deste memorial e do projeto
    técnico correspondente.</p>
    <p>O responsável técnico declara que as informações prestadas são verdadeiras, estando ciente de que o Corpo de
    Bombeiros Militar da Bahia poderá, a qualquer tempo, proceder à verificação por meio de vistorias e solicitação de
    documentos complementares.</p>
  `);

  const assinaturas = `
    <div class="assinaturas">
      <p class="local-data">${esc(p.municipio || 'Salvador')} – BA, ${dataExtenso}.</p>
      <div class="linha-assinatura">
        <p>___________________________________________</p>
        <p><strong>${esc(p.proprietario || '[Nome do Proprietário/Responsável pelo Uso]')}</strong><br>Proprietário / Responsável pelo Uso</p>
      </div>
      <div class="linha-assinatura">
        <p>___________________________________________</p>
        <p><strong>${esc(p.respTecnicoNome || '[Nome do Responsável Técnico]')}</strong><br>Responsável Técnico — ${esc(p.respTecnicoRegistro || 'CREA/CAU nº ______')}</p>
      </div>
    </div>
  `;

  return `
    <div class="capa">
      <h1>MEMORIAL DESCRITIVO</h1>
      <p class="subtitulo">Instalações de Segurança e Combate a Incêndio</p>
      <p class="obra">${esc(p.nome)}</p>
      <p class="endereco">${esc(enderecoCompleto(p))}</p>
      <p class="ref">Conforme Lei Estadual nº 12.929/2013, Decreto Estadual nº 16.302/2015 e Instruções Técnicas do CBMBA</p>
    </div>
    ${secoes.join('\n')}
    ${assinaturas}
  `;
}

/** Estilos usados na pré-visualização, no Word e no PDF (impressão). */
export const ESTILOS_MEMORIAL = `
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.5; margin: 2cm; }
  .capa { text-align: center; margin-bottom: 28pt; padding-bottom: 16pt; border-bottom: 3px solid #b91c1c; }
  .capa h1 { font-size: 20pt; letter-spacing: 1px; margin: 0 0 4pt; color: #7f1d1d; }
  .capa .subtitulo { font-size: 13pt; font-weight: bold; margin: 0 0 12pt; }
  .capa .obra { font-size: 12pt; font-weight: bold; margin: 0; }
  .capa .endereco { font-size: 10pt; margin: 2pt 0 10pt; }
  .capa .ref { font-size: 9pt; color: #555; margin: 0; }
  h2 { font-size: 13pt; color: #7f1d1d; border-bottom: 1px solid #ddd; padding-bottom: 3pt; margin: 22pt 0 8pt; page-break-after: avoid; }
  h3 { font-size: 11pt; margin: 12pt 0 4pt; page-break-after: avoid; }
  p { margin: 6pt 0; text-align: justify; }
  ul { margin: 6pt 0 6pt 18pt; padding: 0; }
  li { margin: 3pt 0; text-align: justify; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0; page-break-inside: avoid; }
  table.dados td, table.normas td, table.normas th { border: 1px solid #bbb; padding: 4pt 8pt; vertical-align: top; }
  table.dados td:first-child { width: 38%; font-weight: bold; background: #f5f5f5; }
  table.normas td:first-child { width: 32%; font-weight: bold; background: #f5f5f5; }
  table.normas th { background: #7f1d1d; color: #fff; text-align: left; }
  .detalhes-usuario { border-left: 3px solid #b91c1c; padding-left: 8pt; margin: 8pt 0; }
  .assinaturas { margin-top: 40pt; page-break-inside: avoid; }
  .assinaturas .local-data { text-align: right; margin-bottom: 30pt; }
  .linha-assinatura { text-align: center; margin-top: 34pt; }
  .linha-assinatura p { text-align: center; margin: 2pt 0; }
  @media print { body { margin: 0; } }
`;

export function documentoCompleto(p: DadosProjeto, r: ResultadoTecnico): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Memorial Descritivo — ${esc(p.nome)}</title>
<style>${ESTILOS_MEMORIAL}</style>
</head>
<body>${gerarMemorialHTML(p, r)}</body>
</html>`;
}

/** Exporta o memorial como documento Word (.doc via HTML). */
export function exportarWord(p: DadosProjeto, r: ResultadoTecnico) {
  const html = documentoCompleto(p, r);
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `memorial-incendio-${p.nome.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Exporta em PDF abrindo a caixa de impressão do navegador (Salvar como PDF). */
export function exportarPDF(p: DadosProjeto, r: ResultadoTecnico) {
  const html = documentoCompleto(p, r);
  const janela = window.open('', '_blank');
  if (!janela) return false;
  janela.document.write(html);
  janela.document.close();
  janela.focus();
  setTimeout(() => janela.print(), 400);
  return true;
}
