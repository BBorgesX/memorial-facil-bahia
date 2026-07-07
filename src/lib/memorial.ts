/**
 * Gerador do Memorial Descritivo de Segurança Contra Incêndio e Pânico.
 *
 * Estrutura e conteúdo técnico baseados no memorial de referência
 * "XXX-NNN-DG-DOC-001-00 — Memorial Descritivo Incêndio (set/2024)"
 * (Instalações de Segurança e Combate a Incêndio), preenchidos automaticamente
 * com a classificação e os cálculos das ITs do CBMBA.
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

/** Capa do documento, com código, quadro de revisões e quebra de página. */
function gerarCapa(p: DadosProjeto): string {
  const hoje = new Date();
  const dataCurta = hoje.toLocaleDateString('pt-BR');
  const mesAno = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const codigo = p.codigoDocumento.trim() || 'XXX-NNN-DG-DOC-001';
  const rev = p.revisaoDocumento.trim() || '00';
  return `
  <div class="capa-pagina">
    <div class="capa-topo">
      <table class="capa-cabecalho">
        <tr>
          <td class="capa-logo">CBMBA<br><span>Segurança Contra Incêndio e Pânico</span></td>
          <td class="capa-codigo">
            <strong>${esc(codigo)}</strong><br>
            Revisão: ${esc(rev)}<br>
            Data: ${dataCurta}
          </td>
        </tr>
      </table>
    </div>
    <div class="capa-centro">
      <p class="capa-tipo-doc">MEMORIAL DESCRITIVO</p>
      <p class="capa-subtitulo">Instalações de Segurança e Combate a Incêndio</p>
      <div class="capa-faixa"></div>
      <p class="capa-obra">${esc(p.proprietario || p.nome)}</p>
      ${p.empresa ? `<p class="capa-cliente">Cliente: ${esc(p.empresa)}</p>` : ''}
      <p class="capa-endereco">${esc(enderecoCompleto(p))}</p>
      <p class="capa-apresentacao">${APRESENTACAO[p.apresentacao] ?? 'Projeto Técnico'}</p>
    </div>
    <div class="capa-rodape">
      <table class="capa-revisoes">
        <tr><th>Rev.</th><th>Data</th><th>Descrição</th><th>Elaborado por</th><th>Aprovado por</th></tr>
        <tr>
          <td>${esc(rev)}</td>
          <td>${dataCurta}</td>
          <td>${rev === '00' ? 'Emissão inicial' : 'Revisão do documento'}</td>
          <td>${esc(p.respTecnicoNome || '—')}</td>
          <td>&nbsp;</td>
        </tr>
        <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
      </table>
      <p class="capa-ref">Elaborado conforme a Lei Estadual nº 12.929/2013, o Decreto Estadual nº 16.302/2015 e as
      Instruções Técnicas do Corpo de Bombeiros Militar do Estado da Bahia — ${esc(p.municipio || 'Salvador')} – BA, ${mesAno}.</p>
    </div>
  </div>
  `;
}

/** Gera o corpo HTML do memorial (sem <html>/<head> — o chamador embala). */
export function gerarMemorialHTML(p: DadosProjeto, r: ResultadoTecnico): string {
  let n = 0; // numerador de seções
  const secoes: string[] = [];
  const aplicavel = (id: string) => medidaAplicavel(p, r, id);
  const detalhesUsuario = (id: string) => {
    const d = p.medidas[id]?.detalhes?.trim();
    return d ? `<div class="detalhes-usuario"><p><strong>Complementos específicos do projeto:</strong></p>${paragrafos(d)}</div>` : '';
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
      <tr><td>Responsável técnico</td><td>${esc(p.respTecnicoNome || '—')} ${p.respTecnicoRegistro ? `— ${esc(p.respTecnicoRegistro)}` : ''}</td></tr>
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
      <tr><td>ABNT NBR 12779</td><td>Mangueiras de incêndio — inspeção, manutenção e cuidados</td></tr>
      <tr><td>ABNT NBR 13434</td><td>Sinalização de segurança contra incêndio e pânico</td></tr>
      <tr><td>ABNT NBR 13714</td><td>Sistemas de hidrantes e de mangotinhos para combate a incêndio</td></tr>
      <tr><td>ABNT NBR 15200</td><td>Projeto de estruturas de concreto em situação de incêndio</td></tr>
      <tr><td>ABNT NBR 14323</td><td>Projeto de estruturas de aço em situação de incêndio</td></tr>
      <tr><td>ABNT NBR 16820</td><td>Sistemas de sinalização de emergência</td></tr>
      <tr><td>ABNT NBR 17240</td><td>Sistemas de detecção e alarme de incêndio</td></tr>
      <tr><td>NFPA 20</td><td>Bombas estacionárias de proteção contra incêndio</td></tr>
    </table>
    <p>Na inexistência destas, ou em caráter suplementar, poderão ser adotadas normas de entidades reconhecidas
    internacionalmente, tais como: ANSI (American National Standards Institute), DIN (Deutsche Industrie Normen),
    ASTM (American Society for Testing and Materials), IEC (International Electrotechnical Commission) e
    NFPA (National Fire Protection Association).</p>
    <h3>Certificações permitidas</h3>
    <p>Para os sistemas de chuveiros automáticos, alarme de incêndio e outros sistemas especiais, considerando a
    complexidade e a responsabilidade desses elementos, são exigidas certificações na seguinte ordem de preferência,
    não sendo aceitas certificações diferentes das especificadas:</p>
    <ul>
      <li><strong>FM</strong> — Factory Mutual;</li>
      <li><strong>UL</strong> — Underwriters Laboratories;</li>
      <li><strong>CE</strong> — Comunidade Europeia.</li>
    </ul>
    <p>Portas corta-fogo, extintores e demais equipamentos nacionais deverão possuir certificação INMETRO.</p>
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
      <table class="dados">
        <tr><td>Área ocupada no(s) subsolo(s)</td><td>${fmt(p.areaSubsoloM2, 2)} m²</td></tr>
        <tr><td>Ocupação do subsolo</td><td>${esc(p.ocupacaoSubsolo || 'ocupação diversa de estacionamento')}</td></tr>
        <tr><td>Nível</td><td>${p.subsoloPrimeiroSegundoNivel ? '1º ou 2º subsolo' : '3º subsolo ou inferior'}</td></tr>
      </table>
      <p>Medidas de segurança adicionais no subsolo:</p>
      <ul>${r.exigenciasSubsolo.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
    ` : ''}
  `);

  // -------------------------------------------------------------------------
  // Seções descritivas por sistema
  // -------------------------------------------------------------------------
  if (aplicavel('acesso_viatura')) {
    sec('ACESSO DE VIATURA NA EDIFICAÇÃO E ÁREAS DE RISCO (IT 06)', `
      <p>O uso das viaturas dos bombeiros segue regras para buscas, salvamentos e combate a incêndios, conforme as
      condições estabelecidas na IT 06/2016. O acesso das viaturas do Corpo de Bombeiros se dará pela
      ${esc(enderecoCompleto(p))}.</p>
      <h3>Características da via de acesso</h3>
      <table class="dados">
        <tr><td>Largura mínima</td><td>6,00 m</td></tr>
        <tr><td>Peso a suportar</td><td>Viaturas com peso de 25.000 kg</td></tr>
        <tr><td>Altura livre mínima</td><td>4,50 m</td></tr>
        <tr><td>Portão de acesso (quando houver)</td><td>Largura mínima 4,00 m / altura mínima 4,50 m</td></tr>
      </table>
      <p>A via de acesso e as faixas de estacionamento das viaturas serão mantidas permanentemente desobstruídas e
      sinalizadas conforme a IT 06.</p>
      ${detalhesUsuario('acesso_viatura')}
    `);
  }

  if (aplicavel('separacao_edificacoes')) {
    sec('SEPARAÇÃO ENTRE EDIFICAÇÕES — ISOLAMENTO DE RISCO (IT 07)', `
      <p>A separação entre edificações (isolamento de risco) atenderá aos parâmetros da IT 07/2016, considerando a
      distância de segurança entre fachadas, a severidade da carga de incêndio e a porcentagem de aberturas, de modo
      que as edificações sejam consideradas riscos isolados, evitando a propagação do incêndio por radiação de calor,
      convecção de gases quentes e transmissão de chama.</p>
      ${detalhesUsuario('separacao_edificacoes')}
    `);
  }

  if (aplicavel('seguranca_estrutural')) {
    sec('SEGURANÇA ESTRUTURAL CONTRA INCÊNDIO (IT 08)', `
      <p>Classificação conforme a Tabela A da IT 08 — Resistência ao Fogo dos Elementos de Construção. O TRRF mínimo
      para edificações da divisão ${r.ocupacao?.divisao ?? '—'} com a altura classificada é o indicado a seguir, e todos os
      elementos da edificação cumprem os índices mínimos exigidos:</p>
      <table class="dados">
        <tr><td>TRRF — pavimentos</td><td><strong>${r.trrf?.pavimentos ? `${r.trrf.pavimentos} minutos` : 'Consultar CBMBA'}</strong> (faixa: ${esc(r.trrf?.faixaAltura ?? '—')})</td></tr>
        ${p.temSubsolo ? `<tr><td>TRRF — subsolo</td><td><strong>${r.trrf?.subsolo ? `${r.trrf.subsolo} minutos` : 'Consultar CBMBA'}</strong></td></tr>` : ''}
      </table>
      <h3>Elementos construtivos essenciais</h3>
      <ul>
        <li><strong>Estrutura de concreto:</strong> executada em concreto armado conforme a NBR 15200 (estruturas de concreto em situação de incêndio);</li>
        <li><strong>Estrutura metálica:</strong> em aço, com tratamento ignifugante de retardo, atendendo à NBR 14323;</li>
        <li><strong>Fundações:</strong> em concreto armado, dimensionadas conforme a NBR 6122 e normas vigentes;</li>
        <li><strong>Alvenarias em blocos cerâmicos ou de concreto:</strong> assentadas e revestidas com argamassa, conforme as normas construtivas aplicáveis;</li>
        <li><strong>Alvenarias em gesso cartonado (dry wall):</strong> painéis destinados à vedação com TRRF mínimo de 120 minutos;</li>
        <li><strong>Vidros:</strong> elementos envidraçados dimensionados e instalados conforme critérios de segurança da ABNT;</li>
        <li><strong>Aberturas laterais:</strong> separação vertical mínima de 1,20 m entre a verga da abertura inferior e o peitoril do pavimento superior, sendo vedada a utilização de "pele de vidro" sem separação;</li>
        <li><strong>Instalações:</strong> elétricas, eletrônicas, hidrossanitárias e de conforto térmico projetadas segundo os requisitos normativos da ABNT e das concessionárias.</li>
      </ul>
      <p>A comprovação da resistência ao fogo dos elementos estruturais seguirá a NBR 5628 e normas correlatas.</p>
      ${detalhesUsuario('seguranca_estrutural')}
    `);
  }

  if (aplicavel('compartimentacao_horizontal') || aplicavel('compartimentacao_vertical')) {
    sec('COMPARTIMENTAÇÃO HORIZONTAL E VERTICAL (IT 09)', `
      <p>A IT 09 define os critérios para compartimentação horizontal e vertical da edificação. A compartimentação
      horizontal impede a propagação do incêndio no mesmo pavimento e, conforme o Anexo da IT, há uma área máxima de
      compartimentação exigida para este empreendimento em função do grupo ${r.ocupacao?.grupoCodigo ?? ''} e do tipo
      ${r.altura?.tipo ?? ''} de altura.</p>
      <h3>Observações obrigatórias</h3>
      <ul>
        <li>Limites de área máxima por compartimento horizontal, com separação adequada entre ambientes;</li>
        <li>Distâncias mínimas entre aberturas de fachada, conforme a proximidade entre edificações e compartimentos;</li>
        <li>Shafts, dutos e aberturas entre compartimentos ou pavimentos selados com TRRF de 120 minutos, conforme NBR 6479;</li>
        <li>Dutos de ar-condicionado, ventilação ou exaustão que cruzem compartimentos dotados de dampers automáticos
        acionados por fusíveis ou pelo sistema de detecção de incêndio.</li>
      </ul>
      <p>Para paredes corta-fogo com TRRF de até 120 minutos, a construção será realizada em alvenaria de blocos
      certificados pela ABNT, revestidos com argamassa de cimento, cal e areia conforme traço indicado para inspeção.
      A parede de compartimentação apresentará propriedade corta-fogo, construída do piso ao teto, devidamente
      vinculada à estrutura do edifício e reforçada estruturalmente, sem aberturas como janelas.</p>
      <p>As portas corta-fogo possuirão certificação INMETRO e identificação própria incorporada à estrutura; não
      serão aceitas portas artesanais.</p>
      ${detalhesUsuario('compartimentacao_horizontal')}${detalhesUsuario('compartimentacao_vertical')}
    `);
  }

  if (aplicavel('controle_materiais')) {
    sec('CONTROLE DE MATERIAIS DE ACABAMENTO E REVESTIMENTO (IT 10)', `
      <p>A limitação da propagação do fogo e do desenvolvimento de fumaça depende da classificação da edificação
      conforme sua ocupação e das características dos materiais utilizados, de acordo com a IT 10. A obrigatoriedade
      do uso dos materiais é determinada conforme o Anexo B (Tabela B.1) dessa Instrução Técnica:</p>
      <table class="normas">
        <tr><th>Finalidade do material</th><th>Classe exigida (divisão ${r.ocupacao?.divisao ?? '—'})</th></tr>
        <tr><td>Piso (acabamento/revestimento)</td><td>Classe I ou II-A</td></tr>
        <tr><td>Parede e divisória (acabamento/revestimento)</td><td>Classe I ou II-A</td></tr>
        <tr><td>Teto e forro (acabamento/revestimento)</td><td>Classe I ou II-A</td></tr>
      </table>
      <h3>Materiais de revestimento externo previstos</h3>
      <p>Pintura sobre argamassa; revestimento em vidro; cerâmica; revestimento metálico; ACM (alumínio composto)
      resistente ao fogo; madeira tratada com pintura ignifugante.</p>
      <h3>Materiais de revestimento interno previstos</h3>
      <p>Pintura sobre argamassa; pisos em cerâmica, mármore ou granito; paredes em cerâmica, mármore ou granito;
      divisórias de vidro; alvenarias em dry wall; forros metálicos; forros em plástico com composto autoextinguível;
      ambientes parcialmente revestidos com painéis de madeira tratada com ignifugante.</p>
      <h3>Instalações e elementos em madeira</h3>
      <p>Materiais usados em instalações elétricas, eletrônicas, hidrossanitárias, ar-condicionado e sistemas contra
      incêndio feitos de materiais facilmente combustíveis serão produzidos com compostos antichama ou
      autoextinguíveis. Coberturas, pergolados e materiais de madeira ou compostos de madeira receberão pintura ou
      revestimento ignifugante obrigatório.</p>
      ${detalhesUsuario('controle_materiais')}
    `);
  }

  if (aplicavel('saidas_emergencia') && r.saidas) {
    sec('SAÍDAS DE EMERGÊNCIA (IT 11 / NBR 9077)', `
      <p>Neste empreendimento, a saída de emergência é composta de: acessos e/ou corredores; rotas de fuga com
      respectivas portas; espaço livre exterior; escadas; rampas e descarga${aplicavel('elevador_emergencia') ? '; e elevador de emergência' : ''}.</p>
      <h3>Cálculo da população (planilha da IT 11)</h3>
      <table class="dados">
        <tr><td>Grupo / Divisão</td><td>${r.ocupacao?.divisao ?? '—'}</td></tr>
        <tr><td>Coeficiente de população</td><td>${esc(r.saidas.coeficiente)}</td></tr>
        <tr><td>População calculada</td><td>${fmt(r.saidas.populacaoCalculada)} pessoas</td></tr>
        <tr><td>População adotada no projeto</td><td><strong>${fmt(r.saidas.populacaoAdotada)} pessoas</strong></td></tr>
      </table>
      <h3>Dimensionamento das saídas (N = P / C)</h3>
      <table class="normas">
        <tr><th>Elemento</th><th>Capacidade da UP (pessoas)</th><th>Unidades de passagem</th><th>Largura mínima</th></tr>
        <tr><td>Acessos e descargas</td><td>${fmt(r.saidas.capacidadeUP.acessos)}</td><td>${fmt(r.saidas.unidadesPassagem.acessos)}</td><td>${fmt(r.saidas.larguraMinima.acessosM, 2)} m</td></tr>
        <tr><td>Escadas e rampas</td><td>${fmt(r.saidas.capacidadeUP.escadas)}</td><td>${fmt(r.saidas.unidadesPassagem.escadas)}</td><td>${fmt(r.saidas.larguraMinima.escadasM, 2)} m</td></tr>
        <tr><td>Portas</td><td>${fmt(r.saidas.capacidadeUP.portas)}</td><td>${fmt(r.saidas.unidadesPassagem.portas)}</td><td>${fmt(r.saidas.larguraMinima.portasM, 2)} m</td></tr>
      </table>
      <h3>Distâncias máximas a percorrer</h3>
      <table class="dados">
        <tr><td>Piso de descarga (térreo)</td><td>${r.saidas.distanciaMaxima.pisoDescargaM ? `${r.saidas.distanciaMaxima.pisoDescargaM} m` : 'Consultar CBMBA'}</td></tr>
        <tr><td>Demais pavimentos</td><td>${r.saidas.distanciaMaxima.demaisPavimentosM ? `${r.saidas.distanciaMaxima.demaisPavimentosM} m` : 'Consultar CBMBA'}</td></tr>
      </table>
      <p>${esc(r.saidas.distanciaMaxima.consideracoes)}</p>
      <p>Número mínimo de saídas: <strong>${fmt(r.saidas.numeroMinimoSaidas)}</strong>. As portas das rotas de saída abrirão
      no sentido do fluxo de fuga, dotadas de barra antipânico onde exigido (NBR 11785). Corrimãos contínuos em ambos
      os lados das escadas, guarda-corpos e degraus conforme IT 11 e NBR 9077. Pisos das rotas de fuga
      antiderrapantes e desobstruídos.</p>
      ${detalhesUsuario('saidas_emergencia')}
    `);
  }

  if (aplicavel('elevador_emergencia')) {
    sec('ELEVADOR DE EMERGÊNCIA (IT 11)', `
      <p>Será previsto elevador de emergência com acionamento prioritário por chave (operação bombeiro), alimentação
      elétrica protegida e independente, cabina com dimensões mínimas para transporte de maca, porta corta-fogo no
      hall de acesso e intercomunicação com a central. Em caso de sinistro, os demais elevadores serão
      automaticamente transferidos para o pavimento de descarga e desligados, permanecendo em funcionamento apenas o
      elevador de emergência. Atendimento integral à IT 11 e à NBR NM 207.</p>
      ${detalhesUsuario('elevador_emergencia')}
    `);
  }

  if (aplicavel('plano_emergencia')) {
    sec('PLANO DE EMERGÊNCIA CONTRA INCÊNDIO E PÂNICO (IT 16)', `
      <p>Será elaborado e mantido atualizado Plano de Emergência conforme a IT 16/2018 e a NBR 15219, destinado à
      operação física e diária do sistema de proteção contra incêndio da edificação, contemplando: identificação dos
      riscos, recursos humanos e materiais disponíveis, rotas de fuga e ponto de encontro, e os procedimentos básicos
      de emergência:</p>
      <ul>
        <li><strong>Alerta e alarme:</strong> identificado o princípio de incêndio, acionamento imediato do alarme e comunicação à brigada;</li>
        <li><strong>Corte de energia:</strong> o pessoal da manutenção ficará à disposição do chefe da brigada para o corte da energia elétrica;</li>
        <li><strong>Abandono:</strong> se necessário, início do processo de abandono da edificação com orientação do público pela brigada,
        reunião no ponto de encontro e verificação de retardatários;</li>
        <li><strong>Chamada do Corpo de Bombeiros:</strong> acionamento pelo telefone 193;</li>
        <li><strong>Combate:</strong> realizado pelos brigadistas treinados, que auxiliarão o Corpo de Bombeiros na chegada;</li>
        <li><strong>Primeiros socorros:</strong> prestados apenas pela brigada ou pelo Corpo de Bombeiros/SAMU;</li>
        <li><strong>Investigação:</strong> após o controle da emergência, o chefe da brigada elaborará relatório escrito sobre o sinistro.</li>
      </ul>
      <h3>Instruções complementares por área</h3>
      <p><strong>Copa/cozinha e locais com gases combustíveis:</strong> proibido fumar; limpeza semanal de exaustores,
      coifas e filtros; em caso de vazamento de gás, fechar a válvula geral, não acionar equipamentos elétricos e
      ventilar naturalmente o ambiente; nunca utilizar água em fogões e instalações elétricas — usar extintores
      adequados (ABC/CO₂).</p>
      <p><strong>Quadros e instalações elétricas:</strong> manter limpas e ventiladas; reparos apenas por profissionais
      habilitados; em caso de incêndio, cortar imediatamente a energia e utilizar extintores de CO₂ ou pó químico.</p>
      <p>O plano será exercitado por meio de simulados periódicos com registro em ata, e revisado a cada alteração
      física da edificação ou da estrutura de recursos humanos de segurança. Um plano de emergência só funciona se
      houver pessoas treinadas para executá-lo.</p>
      ${detalhesUsuario('plano_emergencia')}
    `);
  }

  if (aplicavel('brigada_incendio') && r.brigada) {
    sec('BRIGADA DE INCÊNDIO (IT 17 / NBR 14276)', `
      <h3>Dimensionamento da equipe de brigadistas (Anexo A da IT 17)</h3>
      <table class="normas">
        <tr><th>Grupo</th><th>Divisão</th><th>Grau de risco</th><th>População fixa</th><th>Brigadistas (mínimo)</th><th>Nível de treinamento</th></tr>
        <tr>
          <td>${r.ocupacao?.grupoCodigo ?? '—'}</td>
          <td>${r.ocupacao?.divisao ?? '—'}</td>
          <td>${r.carga?.nivel ?? '—'}</td>
          <td>${fmt(r.saidas?.populacaoAdotada)}</td>
          <td><strong>${fmt(r.brigada.quantidadeMinima)}</strong></td>
          <td>${esc(r.brigada.nivelTreinamento)}</td>
        </tr>
      </table>
      <table class="dados">
        <tr><td>Carga horária de formação</td><td>${esc(r.brigada.cargaHoraria)}</td></tr>
        <tr><td>Reciclagem</td><td>Anual, obrigatória</td></tr>
        <tr><td>Exercício simulado</td><td>A cada 6 meses, com registro em ata</td></tr>
      </table>
      <h3>Organograma da brigada</h3>
      <p>A brigada será organizada com <strong>coordenador geral</strong> (responsável máximo pela brigada),
      <strong>chefes de brigada</strong> por turno/pavimento (quando aplicável) e <strong>brigadistas</strong>
      distribuídos por pavimento/setor, conforme o organograma a ser detalhado no Plano de Emergência.</p>
      <p>${esc(r.brigada.composicao)}</p>
      ${detalhesUsuario('brigada_incendio')}
    `);
  }

  if (aplicavel('iluminacao_emergencia') && r.iluminacao) {
    sec('SISTEMA DE ILUMINAÇÃO DE EMERGÊNCIA (IT 18 / NBR 10898)', `
      <h3>Composição do sistema de iluminação</h3>
      <p>O sistema de iluminação do empreendimento poderá ser composto pelos seguintes subsistemas:</p>
      <ul>
        <li><strong>Iluminação geral</strong>, alimentada diretamente pela rede da concessionária (não classificada como iluminação de emergência);</li>
        <li><strong>Iluminação geral parcialmente alimentada por grupo motogerador</strong>, com operação automática em caso de
        interrupção do fornecimento — o gerador é considerado sistema essencial quando atende painéis de alarme,
        controle de acesso emergencial e bombas de incêndio;</li>
        <li><strong>Sistema centralizado de iluminação de emergência</strong>, com central concentradora, baterias seladas e
        circuitos independentes para as luminárias distribuídas na edificação e em áreas críticas;</li>
        <li><strong>Blocos autônomos de iluminação de emergência</strong>, com baterias internas seladas, mantidos carregados pela
        rede elétrica e/ou pelo grupo gerador.</li>
      </ul>
      <h3>Parâmetros de projeto</h3>
      <table class="dados">
        <tr><td>Autonomia mínima do sistema</td><td>${r.iluminacao.autonomiaHoras} horas (NBR 10898:2023)</td></tr>
        <tr><td>Iluminância mínima (aclaramento)</td><td>${r.iluminacao.iluminanciaMinimaLux} lux no piso das rotas de fuga</td></tr>
        <tr><td>Distância máxima entre pontos</td><td>${r.iluminacao.distanciaMaximaPontosM} m (${fmt(r.iluminacao.distanciaMaximaParedeM, 1)} m entre ponto e parede)</td></tr>
        <tr><td>Tempo de comutação</td><td>máx. 15 s para atingir 50% da iluminância requerida</td></tr>
        <tr><td>Quantidade estimada de pontos</td><td><strong>${fmt(r.iluminacao.pontosEstimados)}</strong></td></tr>
      </table>
      <p>Luminárias com corpo em material resistente ao fogo e autoextinguível, grau de proteção mínimo IP20 (IP54 em
      áreas molhadas/externas), bateria selada livre de manutenção com vida útil mínima de 4 anos, carregamento
      automático, indicador visual de funcionamento e teste automático. Instalação a no mínimo 2,00 m do piso acabado,
      em saídas, mudanças de direção e de nível, e junto a equipamentos de segurança (extintores, hidrantes,
      acionadores).</p>
      <h3>Grupo motogerador (quando presente)</h3>
      <ul>
        <li>Atuação automática em até 30 segundos após o corte de energia da concessionária;</li>
        <li>Para alimentação de bombas de incêndio: autonomia mínima de 6 horas sem reabastecimento;</li>
        <li>Instalação em local com acesso livre e desobstruído, próximo à subestação ou entrada de energia;</li>
        <li>Tomada de ar protegida contra fogo e captação de fumaça de incêndio interno;</li>
        <li>Ambiente/container com TRRF mínimo de 2 horas, porta corta-fogo P-90 (INMETRO) e isolamento acústico autoextinguível.</li>
      </ul>
      <p>${esc(r.iluminacao.observacao)}</p>
      ${detalhesUsuario('iluminacao_emergencia')}
    `);
  }

  if (aplicavel('deteccao_incendio') || aplicavel('alarme_incendio')) {
    sec('ALARME DE INCÊNDIO E DETECTORES AUTOMÁTICOS (IT 19 / NBR 17240)', `
      <p>Nenhum equipamento de alarme e detecção de incêndio poderá ser instalado no empreendimento caso não possua,
      nesta ordem de preferência, certificação FM (Factory Mutual), UL (Underwriters Laboratories) ou CE (Comunidade
      Europeia). O sistema cobrirá as áreas indicadas em projeto e será compostos por:</p>
      <h3>Central de alarme</h3>
      <ul>
        <li>Tipo analógico ${aplicavel('deteccao_incendio') ? 'endereçável' : 'endereçável ou convencional'}, com número de
        laços conforme projeto e capacidade para atender toda a edificação;</li>
        <li>Localizada na entrada principal (recepção/portaria), com monitoramento 24 horas por operadores treinados,
        protegida contra vandalismo e com fácil visualização e audição pela brigada;</li>
        <li>Elementos de teste dos indicadores luminosos e sinalizadores acústicos, locais e remotos;</li>
        <li>Registro de eventos em memória não volátil e supervisão contínua de falhas (curto-circuito, circuito aberto, perda de alimentação).</li>
      </ul>
      <h3>Suprimento de energia</h3>
      <p>Duas fontes de alimentação: rede elétrica da edificação (principal) e baterias/nobreak/gerador (auxiliar).
      O fornecimento por baterias (máx. 24 Vcc) garantirá autonomia mínima de <strong>24 horas em regime de
      supervisão</strong> e <strong>15 minutos em regime de alarme</strong>, ou o tempo necessário para evacuação. A
      alimentação por grupo gerador terá apenas a finalidade de recarregar as baterias internas.</p>
      <h3>Acionamento e transmissão</h3>
      <ul>
        <li>Alarme geral acionado exclusivamente de forma centralizada pela central, com temporização de retardo de até
        2 minutos e pré-alarme para atuação rápida da brigada;</li>
        <li>Envio automático de mensagem ao Corpo de Bombeiros por ligação telefônica com gravação automática (SIM
        dedicado ou linha privada de alarme), com aviso remoto à diretoria/gerência operacional;</li>
        <li>Possibilidade de ajuste de set point de detecção dentro dos limites normativos.</li>
      </ul>
      <h3>Acionadores manuais</h3>
      <p>Instalados em locais de circulação, entre 0,90 m e 1,35 m do piso acabado, com distância máxima de 30 m de
      qualquer ponto da área protegida ao acionador mais próximo. Recomenda-se a instalação de acionador manual
      próximo aos postos de hidrante.</p>
      <h3>Avisadores audiovisuais</h3>
      <p>Instalados entre 2,20 m e 3,50 m, embutidos ou sobrepostos, com volume mínimo de <strong>90 dB</strong>,
      assegurando audibilidade e visibilidade em toda a edificação, incluindo sinalizadores visuais estroboscópicos em
      áreas ruidosas ou acessíveis a pessoas com deficiência auditiva.</p>
      ${aplicavel('deteccao_incendio') ? `
      <h3>Detectores automáticos</h3>
      <ul>
        <li><strong>Detectores de fumaça pontuais:</strong> analógicos endereçáveis, cobertura máxima de 81 m² por detector e
        pé-direito limitado a 8 m (área quadrada de 9 m de lado, inscrita em círculo de raio 6,30 m);</li>
        <li><strong>Detectores de fumaça lineares (beam):</strong> para ambientes com pé-direito superior a 8 m (galpões,
        átrios), com projeto de compatibilização do fabricante;</li>
        <li><strong>Detectores termovelocimétricos:</strong> uso restrito aos locais especificados (cozinhas, áreas técnicas),
        cobertura de 36 m² (quadrado de 6 m de lado);</li>
        <li><strong>Detectores de chama:</strong> para áreas de maior risco com possibilidade de emissão de chama (inflamáveis);</li>
        <li><strong>Detectores de gases combustíveis:</strong> em centrais de GLP/GN e salas de geradores, com atuação no
        bloqueio automático do suprimento de gás;</li>
        <li><strong>Detectores especiais:</strong> de sistemas saponificantes, gases de extinção e coifas, obrigatoriamente
        interligados à central de alarme.</li>
      </ul>` : ''}
      <h3>Equipamentos auxiliares e de controle de acesso</h3>
      <ul>
        <li><strong>Door holders (eletroímãs):</strong> mantêm as portas corta-fogo abertas no uso normal e liberam o
        fechamento automático no acionamento de qualquer dispositivo do sistema;</li>
        <li><strong>Catracas, portas automáticas e elevadores:</strong> liberados automaticamente em caso de alarme, sem
        bloquear a evacuação; elevadores transferidos ao pavimento de descarga e desligados (exceto o de emergência);</li>
        <li><strong>Flow switches:</strong> interruptores de fluxo nos ramais de sprinklers e hidrantes, interligados ao laço do
        pavimento para identificar na central o ponto de atuação e evitar uso não autorizado;</li>
        <li><strong>Abrigos de mangueiras:</strong> com interruptores certificados nas portas para identificar abertura, sendo
        recomendável o monitoramento por CFTV.</li>
      </ul>
      <h3>Condutores, condutos e aterramento</h3>
      <ul>
        <li>Fiação em cabo blindado, par trançado, isolação 750 V, classe 70 °C antichama (105 °C para condutor dreno),
        em lances únicos, sem emendas;</li>
        <li>Condutos exclusivos do sistema de incêndio (vedado o compartilhamento com outras instalações), com rede de
        eletrodutos identificada na cor vermelha (ou anéis vermelhos de 2 cm a cada 3 m em locais aparentes);</li>
        <li>Aterramento interligado ao sistema principal da edificação através do BEP (barramento de
        equipotencialização), conforme NBR 5410.</li>
      </ul>
      ${detalhesUsuario('deteccao_incendio')}${detalhesUsuario('alarme_incendio')}
    `);
  }

  if (aplicavel('sinalizacao_emergencia')) {
    sec('SINALIZAÇÃO DE EMERGÊNCIA (IT 20 / NBR 13434 / NBR 16820)', `
      <p>A sinalização de emergência obedecerá aos seguintes tipos, em placas fotoluminescentes conforme as NBR 13434
      e NBR 16820:</p>
      <h3>Sinalização básica</h3>
      <ul>
        <li><strong>Proibição:</strong> proibido fumar, proibido produzir chama aberta, proibido obstruir;</li>
        <li><strong>Alerta:</strong> riscos específicos (inflamáveis, choque elétrico, GLP, produtos perigosos);</li>
        <li><strong>Orientação e salvamento:</strong> rotas de fuga, saídas de emergência e sinalização de portas;</li>
        <li><strong>Equipamentos de combate:</strong> indicação de extintores, hidrantes, acionadores manuais e alarme.</li>
      </ul>
      <h3>Sinalização complementar</h3>
      <ul>
        <li>Indicação continuada das rotas de fuga (faixas de piso ou rodapé fotoluminescentes);</li>
        <li>Indicação de obstáculos (pilares, rebaixos, desníveis) nas circulações;</li>
        <li>Mensagens escritas complementares onde necessário.</li>
      </ul>
      <p>As placas serão dimensionadas em função da distância de leitura, instaladas conforme as alturas normativas e
      mantidas visíveis e legíveis permanentemente.</p>
      ${detalhesUsuario('sinalizacao_emergencia')}
    `);
  }

  if (aplicavel('extintores') && r.extintores) {
    sec('EXTINTORES PORTÁTEIS E SOBRE RODAS (IT 21 / NBR 12693)', `
      <h3>Capacidade extintora</h3>
      <p>Estabelecida em função da ocupação/uso (${esc(r.ocupacao?.grupoNome ?? '—')}), da carga de incêndio específica
      (${fmt(p.cargaIncendioMJm2)} MJ/m²) e do risco (${r.carga?.nivel ?? '—'}).</p>
      <h3>Distâncias máximas a serem percorridas</h3>
      <p>Os extintores portáteis serão distribuídos de tal forma que o operador não percorra distância maior do que a
      estabelecida abaixo:</p>
      <table class="normas">
        <tr><th>Classe de risco</th><th>Capacidade extintora mínima</th><th>Distância máxima (m)</th></tr>
        <tr class="${r.carga?.nivel === 'Baixo' ? 'linha-ativa' : ''}"><td>BAIXO</td><td>2-A / 20-B:C</td><td>25</td></tr>
        <tr class="${r.carga?.nivel === 'Médio' ? 'linha-ativa' : ''}"><td>MÉDIO</td><td>3-A / 40-B:C</td><td>20</td></tr>
        <tr class="${r.carga?.nivel === 'Alto' ? 'linha-ativa' : ''}"><td>ALTO</td><td>4-A / 80-B:C</td><td>15</td></tr>
      </table>
      <table class="dados">
        <tr><td>Capacidade adotada no projeto</td><td><strong>${esc(r.extintores.capacidadeMinima)}</strong></td></tr>
        <tr><td>Distância máxima a percorrer</td><td>${fmt(r.extintores.distanciaMaximaM)} m</td></tr>
        <tr><td>Quantidade estimada</td><td><strong>${fmt(r.extintores.quantidadeEstimada)} unidades</strong></td></tr>
      </table>
      <h3>Regras de instalação</h3>
      <ul>
        <li>Dispostos de modo que possam ser alcançados de qualquer ponto da área protegida e que não fiquem bloqueados pelo fogo;</li>
        <li>Parte superior a no máximo 1,60 m do piso acabado; quando apoiados em suporte de piso, entre 0,10 m e 0,20 m;</li>
        <li>Bem visíveis e sinalizados conforme IT 20;</li>
        <li>Cada extintor com ficha de identificação presa ao bojo (data de carga, recarga, nº de identificação e última inspeção).</li>
      </ul>
      <h3>Locais de risco específico</h3>
      <table class="normas">
        <tr><th>Local</th><th>Tipo e modelo do extintor</th></tr>
        <tr><td>Centrais de gases combustíveis (GLP/GN)</td><td>Pó químico BC 6 kg (mínimo 20-B:C)</td></tr>
        <tr><td>Centrais de líquidos inflamáveis ou combustíveis</td><td>Pó químico BC 6 kg (mínimo 20-B:C)</td></tr>
        <tr><td>Geradores de energia</td><td>CO₂ 6 kg (mínimo 20-B:C)</td></tr>
        <tr><td>Subestação / cabines de transformadores</td><td>CO₂ 6 kg (mínimo 20-B:C)</td></tr>
        <tr><td>Salas de painéis elétricos (QGBT / distribuição)</td><td>CO₂ 6 kg (mínimo 20-B:C)</td></tr>
        <tr><td>Casa de bombas / casa de caldeira</td><td>Pó químico ABC 6 kg (mínimo 2-A:20-B:C)</td></tr>
        <tr><td>Outros riscos específicos</td><td>Conforme análise de risco</td></tr>
      </table>
      <p>${esc(r.extintores.observacao)}</p>
      ${detalhesUsuario('extintores')}
    `);
  }

  if (aplicavel('hidrantes') && r.hidrantes) {
    sec('SISTEMA DE HIDRANTES E MANGOTINHOS (IT 22 / NBR 13714)', `
      <h3>Tipo de sistema</h3>
      <p>Será utilizado o tipo de sistema abaixo indicado, determinado pela divisão de ocupação e pela carga de
      incêndio conforme a IT 22:</p>
      <table class="normas">
        <tr>
          <th>Tipo</th><th>Esguicho DN (mm)</th><th>Mangueira DN (mm)</th><th>Comprimento (m)</th>
          <th>Expedições</th><th>Vazão mínima (L/min)</th><th>Pressão residual mínima (mca)</th>
        </tr>
        <tr class="linha-ativa">
          <td><strong>${r.hidrantes.sistemaTipo}</strong></td>
          <td>${fmt(r.hidrantes.esguichoDN)}</td>
          <td>${fmt(r.hidrantes.mangueiraDN)}</td>
          <td>${fmt(r.hidrantes.mangueiraComprimentoM)}</td>
          <td>${esc(r.hidrantes.expedicoes)}</td>
          <td><strong>${fmt(r.hidrantes.vazaoMinimaLmin)}</strong></td>
          <td>${fmt(r.hidrantes.pressaoMinimaMca)}</td>
        </tr>
      </table>
      <p>${esc(r.hidrantes.descricaoSistema)}. A vazão mínima é referida à válvula do hidrante mais desfavorável e a
      pressão residual à ponta do esguicho mais desfavorável.</p>
      <h3>Reserva Técnica de Incêndio (RTI)</h3>
      <table class="dados">
        <tr><td>Área da edificação</td><td>${fmt(r.areaTotal, 2)} m²</td></tr>
        <tr><td>Volume da RTI</td><td><strong>${fmt(r.hidrantes.rtiM3)} m³</strong> (mínimo ${fmt(r.hidrantes.duracaoMinutos)} min de operação)</td></tr>
        <tr><td>Material construtivo do reservatório</td><td>Concreto armado / aço</td></tr>
      </table>
      <p>A RTI será garantida em reservatório (superior, inferior ou outro previsto em projeto) com dispositivo que
      impeça o seu uso para consumo predial. Existirá <strong>dispositivo de recalque</strong> na fachada principal do
      empreendimento, no passeio, conforme detalhado no projeto.</p>
      <h3>Abrigos, válvulas, mangueiras e esguichos</h3>
      <ul>
        <li><strong>Abrigos:</strong> de uso exclusivo, em materiais incombustíveis, em áreas livres e desobstruídas, com porta
        ou visor transparente, inscrição "INCÊNDIO" na cor vermelha e sem fechaduras trancadas a chave;</li>
        <li><strong>Válvulas de hidrantes:</strong> tipo globo angular DN 65 (2½"), com junta de união engate rápido (Storz)
        compatível com as mangueiras do Corpo de Bombeiros; válvulas de mangotinhos de abertura rápida, passagem plena,
        DN mínimo 25 (1");</li>
        <li><strong>Mangueiras:</strong> acondicionadas aduchadas nos abrigos conforme NBR 12779; vedado o uso para lavagem de
        pátios ou fins diversos do combate a incêndio; mangueiras usadas em treinamento não retornam aos abrigos;</li>
        <li><strong>Esguichos:</strong> reguláveis, indeformáveis, em material não sujeito à corrosão, resistentes à pressão das
        mangueiras, com adaptador Storz.</li>
      </ul>
      <h3>Redes hidráulicas</h3>
      <ul>
        <li><strong>Redes aparentes/embutidas:</strong> tubos de aço DIN 2440 / NBR 5580 classe média, com costura, galvanizados;</li>
        <li><strong>Redes subterrâneas:</strong> PEAD PN20, profundidade mínima de 1,00 m e afastamento mínimo de 1,00 m da área de risco;</li>
        <li><strong>Conexões:</strong> rosqueáveis em ferro maleável classe 10, soldáveis em aço carbono (150 psi) ou sistema ranhurado (grooving);</li>
        <li><strong>Tratamento e pintura:</strong> remoção de impurezas, condicionador para metais, primer fosfatizado e duas
        demãos de esmalte sintético na cor vermelho incêndio.</li>
      </ul>
      <h3>Sistema de pressurização (casa de bombas)</h3>
      <ul>
        <li>Pressurização por <strong>bomba principal elétrica</strong>, abastecendo exclusivamente o sistema de hidrantes;</li>
        <li><strong>Bomba de reserva</strong> a combustão diesel conforme NFPA 20 (ou suprimento por grupo gerador dimensionado
        para a demanda da bomba elétrica pelo tempo de combate previsto na legislação);</li>
        <li><strong>Bomba jockey</strong> para manutenção da pressão do sistema, com liga/desliga automático por pressostatos;</li>
        <li>Partida automática das bombas principais pela simples abertura de um hidrante; após a partida, o
        desligamento será somente manual, no painel de comando da casa de bombas;</li>
        <li>Painel com botoeira de acionamento manual, sinalização ótica e acústica, e painel de acionamento remoto na
        guarita/portaria;</li>
        <li>Conforme IT 41, não se admite dispositivo DR na proteção dos circuitos dos serviços de segurança.</li>
      </ul>
      <p><em>As características das bombas (curvas de desempenho e pontos de operação) e a memória de cálculo
      hidráulico do sistema deverão acompanhar o projeto executivo.</em></p>
      ${detalhesUsuario('hidrantes')}
    `);
  }

  if (aplicavel('chuveiros_automaticos')) {
    sec('SISTEMA DE CHUVEIROS AUTOMÁTICOS — FIRE SPRINKLER (IT 23/IT 24 / NBR 10897)', `
      <h3>Tipo de sistema</h3>
      <p>Será utilizado prioritariamente o sistema <strong>wet pipe</strong> (tubulação molhada com sprinklers fechados),
      admitindo-se, nos locais indicados em projeto, sistemas dry pipe (tubulação seca), preaction (ação prévia),
      deluge (dilúvio) ou combinados.</p>
      <h3>Bicos (sprinklers)</h3>
      <ul>
        <li><strong>Pendent:</strong> instalados no teto ou sob forros, temperaturas de 68/79/93/141 °C conforme o ambiente;</li>
        <li><strong>Upright:</strong> instalados sobre a tubulação em áreas sem forro (galpões, depósitos, casas de máquinas);</li>
        <li><strong>Sidewall:</strong> laterais, para ambientes específicos conforme projeto.</li>
      </ul>
      <p>O sistema será dimensionado por cálculo hidráulico conforme NBR 10897 para a classe de risco da ocupação
      (${r.carga?.nivel ?? '—'}), incluindo válvulas de governo e alarme (VGA), detectores de fluxo (flow switches)
      supervisionados pela central de alarme, dreno e dispositivo de teste. Bicos, válvulas e conexões com
      certificação FM, UL ou CE, nesta ordem de preferência.</p>
      ${detalhesUsuario('chuveiros_automaticos')}
    `);
  }

  if (aplicavel('controle_fumaca')) {
    sec('CONTROLE DE FUMAÇA (IT 43)', `
      <p>Sistema de controle de fumaça (natural e/ou mecânico) das áreas exigidas, com acionamento automático pelo
      sistema de detecção e comando manual na central, garantindo a manutenção de camada livre de fumaça nas rotas de
      fuga e a extração dos gases quentes, conforme IT 43 e normas complementares.</p>
      ${detalhesUsuario('controle_fumaca')}
    `);
  }

  if (aplicavel('espuma')) {
    sec('SISTEMA DE ESPUMA (IT 26)', `
      <p>Sistema de combate por espuma mecânica para as áreas com líquidos inflamáveis/combustíveis, com proporção e
      taxas de aplicação conforme IT 26 e NBR 17505, incluindo reserva de Líquido Gerador de Espuma (LGE),
      proporcionadores e câmaras/canhões conforme o risco protegido.</p>
      ${detalhesUsuario('espuma')}
    `);
  }

  if (aplicavel('controle_ignicao')) {
    sec('CONTROLE DE FONTES DE IGNIÇÃO', `
      <p>Instalações elétricas conforme NBR 5410 (e NBR IEC 60079 em áreas classificadas), aterramento e
      equipotencialização através do BEP, proibição de chama aberta em áreas de risco, controle de serviços de solda e
      corte (permissão de trabalho) e sinalização de alerta correspondente.</p>
      ${detalhesUsuario('controle_ignicao')}
    `);
  }

  if (aplicavel('spda')) {
    sec('SISTEMA DE PROTEÇÃO CONTRA DESCARGAS ATMOSFÉRICAS — SPDA (IT 41 / NBR 5419)', `
      <p>SPDA projetado conforme análise de risco da NBR 5419-2, com subsistemas de captação, descidas e aterramento,
      equipotencialização e DPS (dispositivos de proteção contra surtos) nos quadros, e medição da resistência de
      aterramento com emissão de laudo e ART específica. As inspeções periódicas seguirão a NBR 5419-4.</p>
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
    normas ABNT referenciadas, sempre em sua última atualização vigente. Em caso de conflito entre normas, prevalecerá
    a mais restritiva, respeitando-se a hierarquia da legislação brasileira.</p>
    <p>Alterações de layout, ocupação ou área implicarão revisão deste memorial e do projeto técnico correspondente.
    O responsável técnico declara que as informações prestadas são verdadeiras, estando ciente de que o Corpo de
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
    ${gerarCapa(p)}
    ${secoes.join('\n')}
    ${assinaturas}
  `;
}

/** Estilos usados na pré-visualização, no Word e no PDF (impressão). */
export const ESTILOS_MEMORIAL = `
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.5; margin: 2cm; }
  /* ---- Capa ---- */
  .capa-pagina { min-height: 24cm; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
  .capa-cabecalho { width: 100%; border-collapse: collapse; }
  .capa-cabecalho td { border: 1px solid #999; padding: 8pt 12pt; vertical-align: middle; }
  .capa-logo { font-size: 16pt; font-weight: bold; color: #7f1d1d; width: 55%; }
  .capa-logo span { font-size: 9pt; font-weight: normal; color: #555; }
  .capa-codigo { text-align: right; font-size: 10pt; }
  .capa-codigo strong { font-size: 12pt; }
  .capa-centro { text-align: center; margin: 60pt 0; }
  .capa-tipo-doc { font-size: 26pt; font-weight: bold; letter-spacing: 2px; color: #7f1d1d; margin: 0 0 6pt; }
  .capa-subtitulo { font-size: 15pt; font-weight: bold; margin: 0 0 18pt; }
  .capa-faixa { height: 4px; background: #b91c1c; width: 60%; margin: 0 auto 24pt; }
  .capa-obra { font-size: 14pt; font-weight: bold; margin: 0 0 6pt; }
  .capa-cliente { font-size: 11pt; margin: 0 0 4pt; }
  .capa-endereco { font-size: 10pt; color: #444; margin: 0 0 16pt; }
  .capa-apresentacao { font-size: 11pt; font-weight: bold; color: #7f1d1d; margin: 0; }
  .capa-revisoes { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 10pt; }
  .capa-revisoes th, .capa-revisoes td { border: 1px solid #999; padding: 4pt 6pt; text-align: left; }
  .capa-revisoes th { background: #7f1d1d; color: #fff; }
  .capa-ref { font-size: 8.5pt; color: #666; text-align: center; margin: 0; }
  /* ---- Corpo ---- */
  h2 { font-size: 13pt; color: #7f1d1d; border-bottom: 1px solid #ddd; padding-bottom: 3pt; margin: 22pt 0 8pt; page-break-after: avoid; }
  h3 { font-size: 11pt; margin: 12pt 0 4pt; page-break-after: avoid; }
  p { margin: 6pt 0; text-align: justify; }
  ul { margin: 6pt 0 6pt 18pt; padding: 0; }
  li { margin: 3pt 0; text-align: justify; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0; page-break-inside: avoid; }
  table.dados td, table.normas td, table.normas th { border: 1px solid #bbb; padding: 4pt 8pt; vertical-align: top; }
  table.dados td:first-child { width: 38%; font-weight: bold; background: #f5f5f5; }
  table.normas td:first-child { font-weight: bold; background: #f5f5f5; }
  table.normas th { background: #7f1d1d; color: #fff; text-align: left; }
  tr.linha-ativa td { background: #fdecec !important; font-weight: bold; }
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

function baixarHTMLComoDoc(html: string, nomeArquivo: string) {
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

function imprimirHTML(html: string): boolean {
  const janela = window.open('', '_blank');
  if (!janela) return false;
  janela.document.write(html);
  janela.document.close();
  janela.focus();
  setTimeout(() => janela.print(), 400);
  return true;
}

/** Exporta o memorial como documento Word (.doc via HTML). */
export function exportarWord(p: DadosProjeto, r: ResultadoTecnico) {
  baixarHTMLComoDoc(documentoCompleto(p, r), `memorial-incendio-${p.nome.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.doc`);
}

/** Exporta em PDF abrindo a caixa de impressão do navegador (Salvar como PDF). */
export function exportarPDF(p: DadosProjeto, r: ResultadoTecnico): boolean {
  return imprimirHTML(documentoCompleto(p, r));
}

export { baixarHTMLComoDoc, imprimirHTML };
