/**
 * Gerador do Memorial Descritivo de Segurança Contra Incêndio e Pânico.
 *
 * Estrutura e conteúdo técnico baseados no memorial de referência
 * "XXX-NNN-DG-DOC-001-00 — Memorial Descritivo Incêndio (set/2024)"
 * (Instalações de Segurança e Combate a Incêndio), preenchidos automaticamente
 * com a classificação e os cálculos das ITs do CBMBA.
 */

import { alarmePadrao, DadosProjeto, deteccaoPadrao, hidrantesPadrao } from './projeto';
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

/**
 * Bloco de detectores automáticos (IT 19): lista somente os tipos marcados
 * pelo usuário; sem marcação, apresenta a relação geral com definição
 * remetida ao projeto executivo.
 */
function gerarBlocoDetectores(p: DadosProjeto): string {
  const det = p.deteccao ?? deteccaoPadrao();
  const tipos: { marcado: boolean; nome: string; descricao: string }[] = [
    { marcado: det.pontuais, nome: 'Detectores de Fumaça Pontuais', descricao: 'tecnologia fotoelétrica, sensibilidade ajustável, indicados para áreas administrativas, corredores e salas técnicas. Cobertura máxima de 81 m² por detector e pé-direito limitado a 8 m' },
    { marcado: det.lineares, nome: 'Detectores de Fumaça Lineares', descricao: 'feixe infravermelho, alcance de até 100 m, aplicados em áreas amplas como galpões e auditórios (pé-direito superior a 8 m), com projeto de compatibilização do fabricante' },
    { marcado: det.chama, nome: 'Detectores de Chama', descricao: 'baseados em radiação ultravioleta/infravermelha, destinados a áreas com risco de combustíveis líquidos e inflamáveis' },
    { marcado: det.termovelocimetricos, nome: 'Detectores Termovelocimétricos (Térmicos e Velocímetros)', descricao: 'acionados por elevação brusca ou crítica de temperatura, instalados em cozinhas, áreas técnicas e depósitos. Cobertura de 36 m² por detector' },
    { marcado: det.gases, nome: 'Detectores de Gases Combustíveis', descricao: 'sensores específicos para metano, GLP ou outros, aplicados em centrais de GLP e salas de geradores, com atuação no bloqueio automático do suprimento de gás' },
  ];
  const selecionados = tipos.filter((t) => t.marcado);
  const intro = `<p>Sistema integrado de detecção precoce de incêndios projetado para identificar automaticamente
      sinais de combustão em ambientes internos e externos, proporcionando resposta rápida e eficaz para proteção de
      vidas e patrimônio.${selecionados.length ? ' Serão utilizados os seguintes tipos de detectores automáticos:' : ''}</p>`;

  const lista = selecionados.length
    ? `<ul>${selecionados.map((t) => `<li><strong>${t.nome}:</strong> ${t.descricao};</li>`).join('')}</ul>`
    : `<ul>${tipos.map((t) => `<li><strong>${t.nome}:</strong> ${t.descricao};</li>`).join('')}</ul>
       <p><em>Os tipos de detectores aplicáveis a cada ambiente serão definidos no projeto executivo.</em></p>`;

  const outros = det.outros.trim()
    ? `<p><strong>Outros / complementos:</strong></p>${paragrafos(det.outros)}`
    : '';

  return `
      <h3>Detectores automáticos</h3>
      ${intro}
      ${lista}
      <p>Detectores especiais (sistemas saponificantes, gases de extinção e coifas) deverão estar obrigatoriamente
      interligados à central de alarme, mesmo quando não constem do projeto de segurança.</p>
      ${outros}
  `;
}

/**
 * Bloco da Reserva Técnica de Incêndio (IT 22): tabela da RTI com os
 * reservatórios selecionados pelo usuário — a capacidade em litros é a mesma
 * informação da tabela da reserva de incêndio — e o material construtivo.
 */
function gerarBlocoRTI(p: DadosProjeto, r: ResultadoTecnico): string {
  const h = r.hidrantes;
  if (!h) return '';
  const cfg = p.hidrantesConfig ?? hidrantesPadrao();
  const litros = `${(h.rtiM3 * 1000).toLocaleString('pt-BR')} litros`;
  const reservatorios: string[] = [];
  if (cfg.reservatorioSuperior) reservatorios.push(`Superior — ${litros} (RTI)`);
  if (cfg.reservatorioInferior) reservatorios.push(`Inferior — ${litros} (RTI)`);
  if (cfg.reservatorioPiscina) reservatorios.push(`Piscina — ${litros} (RTI)`);
  if (cfg.reservatorioOutrosAtivo && cfg.reservatorioOutros.trim()) {
    reservatorios.push(esc(cfg.reservatorioOutros.trim()));
  }
  const materiais: string[] = [];
  if (cfg.materialConcretoAco) materiais.push('Concreto armado / aço');
  if (cfg.materialOutroAtivo && cfg.materialOutro.trim()) materiais.push(esc(cfg.materialOutro.trim()));
  return `
      <h3>Reserva Técnica de Incêndio (RTI)</h3>
      <table class="dados">
        <tr><td>Área da edificação</td><td>${fmt(r.areaTotal, 2)} m²</td></tr>
        <tr><td>Volume da RTI</td><td><strong>${fmt(h.rtiM3)} m³ (${litros})</strong> — mínimo ${fmt(h.duracaoMinutos)} min de operação</td></tr>
        <tr><td>Reservatório(s)</td><td>${reservatorios.length ? reservatorios.join('; ') : 'Superior, inferior ou outro previsto em projeto'}</td></tr>
        <tr><td>Material construtivo do reservatório</td><td>${materiais.length ? materiais.join(' / ') : 'Concreto armado / aço'}</td></tr>
      </table>
      <p>A RTI será garantida em reservatório com dispositivo que impeça o seu uso para consumo predial. Existirá
      <strong>dispositivo de recalque</strong> na fachada principal do empreendimento, no passeio, conforme detalhado
      no projeto.</p>
  `;
}

/** Texto fixo dos abrigos de mangueiras (Anexo D da IT 22). */
const BLOCO_ABRIGOS = `
      <h3>Abrigos</h3>
      <p>Os abrigos de mangueiras devem seguir as especificações do Anexo D, ser destinados exclusivamente a essa
      finalidade, conforme a legislação vigente, e estar de acordo com o projeto arquitetônico. Ajustes às necessidades
      específicas são permitidos, desde que sejam respeitados os seguintes requisitos:</p>
      <ul>
        <li>Serem confeccionados em materiais incombustíveis;</li>
        <li>Estarem devidamente identificados, conforme a legislação aplicável;</li>
        <li>Possuírem porta ou visor transparente, com a inscrição "INCÊNDIO" em vermelho;</li>
        <li>Não possuírem fechadura trancada por chave;</li>
        <li>Armazenarem os equipamentos de forma adequada;</li>
        <li>Estarem localizados em áreas livres e desobstruídas.</li>
      </ul>
`;

/**
 * Bloco das redes hidráulicas (IT 22): tubulações conforme os locais de
 * instalação marcados e conexões apenas dos sistemas selecionados — grupos sem
 * seleção são omitidos do texto final.
 */
function gerarBlocoRedeHidraulica(p: DadosProjeto): string {
  const cfg = p.hidrantesConfig ?? hidrantesPadrao();
  const locais: string[] = [];
  if (cfg.redeAparente) locais.push('rede aparente (teto)');
  if (cfg.redeForro) locais.push('interior de forros');
  if (cfg.redeEmbutida) locais.push('embutida em paredes');
  if (cfg.redeSubterranea) locais.push('rede subterrânea');
  const temRedeAco = cfg.redeAparente || cfg.redeForro || cfg.redeEmbutida;

  const tubulacoes: string[] = [];
  if (temRedeAco) {
    tubulacoes.push(`<li><strong>Redes aparentes, no interior de forros ou embutidas em paredes:</strong> tubo em aço
        DIN 2440 — NBR 5580, Classe Média, com costura, acabamento galvanizado preto;</li>`);
  }
  if (cfg.redeSubterranea) {
    tubulacoes.push(`<li><strong>Rede subterrânea:</strong> PEAD (Polietileno de Alta Densidade) PN20, com profundidade
        mínima de 1,00 m e afastamento mínimo de 1,00 m da área de risco;</li>`);
  }
  tubulacoes.push(`<li><strong>Tratamento e pintura:</strong> remoção de impurezas, condicionador para metais, primer
        fosfatizado e duas demãos de esmalte sintético na cor vermelho incêndio.</li>`);

  const conexoesAco: string[] = [];
  if (cfg.conexoesRosqueaveis) conexoesAco.push('<li>Conexões rosqueáveis em ferro maleável, Classe 10;</li>');
  if (cfg.conexoesSoldaveis) conexoesAco.push('<li>Conexões soldáveis em aço carbono, pretas, biseladas, para 150 psi;</li>');
  if (cfg.conexoesGrooving) conexoesAco.push('<li>Sistema Grooving (ranhurado);</li>');

  const blocoConexoes = (conexoesAco.length || cfg.conexoesPEADFusao) ? `
      <h3>Redes hidráulicas — conexões</h3>
      ${conexoesAco.length ? `<p><strong>Para redes de aço:</strong></p><ul>${conexoesAco.join('')}</ul>` : ''}
      ${cfg.conexoesPEADFusao ? `<p><strong>Para redes plásticas (PEAD):</strong></p>
      <ul><li>Conexões soldáveis por fusão térmica, com a mesma classe de pressão da tubulação.</li></ul>` : ''}
  ` : '';

  return `
      <h3>Redes hidráulicas — tubulações</h3>
      <p>A tubulação da rede de hidrantes será instalada em: ${locais.length ? locais.join('; ') : 'conforme lançamento em projeto'}.</p>
      <ul>${tubulacoes.join('')}</ul>
      ${blocoConexoes}
  `;
}

/**
 * Bloco do sistema de pressurização (IT 22 / NFPA 20): textos fixos de
 * automação e painéis, texto condicional da bomba reserva (Diesel ou grupo
 * gerador), dados técnicos das bombas e memória de cálculo hidráulico.
 */
function gerarBlocoPressurizacao(p: DadosProjeto): string {
  const cfg = p.hidrantesConfig ?? hidrantesPadrao();
  const bombaReserva = cfg.pressurizacaoDiesel
    ? `<p>A bomba reserva será a combustão Diesel, obedecendo rigorosamente ao disposto na NFPA 20.</p>`
    : cfg.pressurizacaoEletrica
      ? `<p>Não existirá bomba a combustão interna. A edificação será suprida por grupo gerador de emergência,
      dimensionado para atender a demanda da bomba elétrica e com volume de combustível para o tempo necessário ao
      combate previsto na legislação em vigor.</p>`
      : '';
  const dadosBomba = (titulo: string, valor: string) => `
      <p><strong>${titulo}</strong></p>
      ${valor.trim()
        ? paragrafos(valor)
        : '<p><em>Dados técnicos e curva de desempenho da bomba deverão acompanhar o projeto executivo.</em></p>'}`;
  const imagens = (cfg.memoriaCalculoImagens ?? []).filter(Boolean);
  return `
      <h3>Sistema de pressurização (casa de bombas)</h3>
      <p><strong>Observação:</strong> Conforme IT-41 (item 7.1 — Premissas Específicas) não se admite o uso de
      dispositivo DR para proteção contra choques elétricos nos circuitos dos serviços de segurança.</p>
      <p>A pressurização será feita através de bombas elétricas, abastecendo exclusivamente o sistema hidráulico de
      hidrantes de combate a incêndio.</p>
      ${bombaReserva}
      <p>A automatização da bomba principal e reserva deve ser executada de maneira que, após a partida do motor, o
      seu desligamento seja somente manual no seu próprio painel de comando, localizado na casa de bombas. O
      funcionamento automático é iniciado pela simples abertura de um hidrante.</p>
      <p>As automatizações da bomba de pressurização (jockey) para ligá-la e desligá-la automaticamente e das bombas
      principais para somente ligá-las automaticamente devem ser feitas através dos pressostatos.</p>
      <p>O painel de sinalização das bombas principal ou de reforço, elétrica ou de combustão interna, deve ser dotado
      de uma botoeira para ligar manualmente tais bombas, possuindo sinalização ótica e acústica.</p>
      <p>Deverá ser previsto na guarita um painel de acionamento remoto e manual para o quadro e bombas de incêndio.</p>
      <p>As características das bombas estão calculadas e dimensionadas para atender os hidrantes mais desfavoráveis
      mantendo sua pressão e vazão mínimas estabelecidas em norma.</p>
      <h3>Dados técnicos das bombas</h3>
      ${dadosBomba('Bomba Elétrica (Bomba Principal)', cfg.bombaPrincipalDados)}
      ${cfg.pressurizacaoDiesel ? dadosBomba('Bomba a Combustão', cfg.bombaCombustaoDados) : ''}
      ${dadosBomba('Bomba Jockey', cfg.bombaJockeyDados)}
      <h3>Cálculo hidráulico</h3>
      ${imagens.length
        ? `<div class="memoria-calculo">${imagens.map((img, i) =>
            `<p class="memoria-legenda">Memória de cálculo do sistema de hidrantes — folha ${i + 1}</p>
             <img src="${img}" alt="Memória de cálculo do sistema de hidrantes — folha ${i + 1}" />`).join('')}</div>`
        : '<p><em>A memória de cálculo do sistema de hidrantes deverá ser anexada ao projeto executivo.</em></p>'}
  `;
}

/** Cabeçalho com logotipo e título, repetido no topo de todas as páginas. */
export function gerarCabecalho(p: DadosProjeto, tituloDocumento = 'MEMORIAL DESCRITIVO — Instalações de Segurança e Combate a Incêndio'): string {
  const codigo = p.codigoDocumento.trim() || 'XXX-NNN-DG-DOC-001';
  const rev = p.revisaoDocumento.trim() || '00';
  return `
  <table class="doc-cabecalho">
    <tr>
      <td class="cab-logo">${p.logoDataUrl
        ? `<img src="${p.logoDataUrl}" alt="Logotipo" />`
        : '<span class="cab-logo-texto">SCIP</span>'}</td>
      <td class="cab-titulo">
        <strong>${esc(tituloDocumento)}</strong><br>
        <span>${esc(p.proprietario || p.nome)}</span>
      </td>
      <td class="cab-codigo">
        ${esc(codigo)}<br>
        Rev. ${esc(rev)} — ${new Date().toLocaleDateString('pt-BR')}
      </td>
    </tr>
  </table>
  `;
}

/**
 * Envolve o conteúdo do documento em uma tabela com o cabeçalho em <thead>,
 * fazendo com que logotipo e título se repitam no topo de cada página
 * impressa (PDF) e sejam tratados como linha de cabeçalho no Word.
 */
export function envolverEmFolha(p: DadosProjeto, corpo: string, tituloDocumento?: string): string {
  return `
  <table class="folha">
    <thead><tr><td>${gerarCabecalho(p, tituloDocumento)}</td></tr></thead>
    <tbody><tr><td>${corpo}</td></tr></tbody>
  </table>
  `;
}

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
          <td class="capa-logo">${p.logoDataUrl
            ? `<img src="${p.logoDataUrl}" alt="Logotipo" class="capa-logo-img" />`
            : 'Segurança Contra<br>Incêndio e Pânico<br><span>Projeto Técnico — CBMBA</span>'}</td>
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
  const titulos: { numero: number; titulo: string }[] = [];
  const aplicavel = (id: string) => medidaAplicavel(p, r, id);
  const detalhesUsuario = (id: string) => {
    const d = p.medidas[id]?.detalhes?.trim();
    return d ? `<div class="detalhes-usuario"><p><strong>Complementos específicos do projeto:</strong></p>${paragrafos(d)}</div>` : '';
  };
  const sec = (titulo: string, corpo: string) => {
    n += 1;
    titulos.push({ numero: n, titulo });
    secoes.push(`<section><h2 id="sec-${n}">${n}. ${titulo}</h2>${corpo}</section>`);
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
    const s = r.saidas;
    const conformeTxt = (c: boolean | null) =>
      c === null ? '<em>(não verificado)</em>' : c ? '<strong style="color:#15803d">CONFORME</strong>' : '<strong style="color:#b91c1c">NÃO CONFORME</strong>';
    sec('SAÍDAS DE EMERGÊNCIA — MEMORIAL DE CÁLCULO (IT 11/2016, ANEXO A)', `
      <p>Neste empreendimento, a saída de emergência é composta de: acessos e/ou corredores; rotas de fuga com
      respectivas portas; espaço livre exterior; escadas; rampas e descarga${aplicavel('elevador_emergencia') ? '; e elevador de emergência' : ''}.</p>

      <h3>1. Dados normativos da ocupação</h3>
      <table class="dados">
        <tr><td>Divisão</td><td>${s.divisao} — ${esc(s.descricaoOcupacao)}</td></tr>
        <tr><td>Coeficiente de população</td><td>${esc(s.coeficiente)}</td></tr>
        <tr><td>Capacidade AD (acessos/descargas)</td><td>${fmt(s.capacidadeUP.acessos)} pessoas por U.P.</td></tr>
        <tr><td>Capacidade ER (escadas/rampas)</td><td>${fmt(s.capacidadeUP.escadas)} pessoas por U.P.</td></tr>
        <tr><td>Capacidade Portas</td><td>${fmt(s.capacidadeUP.portas)} pessoas por U.P.</td></tr>
      </table>

      <h3>2. Cálculo de população por pavimento (P)</h3>
      <table class="normas">
        <tr><th>Pavimento</th><th>Área (m²)</th><th>Memória de cálculo</th><th>População</th></tr>
        ${s.pavimentos.map((pav) => `
        <tr${pav.nome === s.pavimentoCritico ? ' class="linha-ativa"' : ''}>
          <td>${esc(pav.nome)}</td>
          <td>${fmt(pav.areaM2, 2)}</td>
          <td>${esc(pav.memoria)}</td>
          <td><strong>${fmt(pav.populacao)}</strong></td>
        </tr>`).join('')}
      </table>
      <table class="dados">
        <tr><td>População crítica (máxima)</td><td><strong>${fmt(s.populacaoCritica)} pessoas</strong> (${esc(s.pavimentoCritico)})</td></tr>
        <tr><td>População total da edificação</td><td>${fmt(s.populacaoTotal)} pessoas</td></tr>
        <tr><td>População adotada no projeto</td><td><strong>${fmt(s.populacaoAdotada)} pessoas</strong></td></tr>
      </table>

      <h3>3. Dimensionamento das saídas (N = P / C; W = N × 0,55 m; mínimo 2 U.P.)</h3>
      <p><strong>Acessos</strong> (dimensionados pavimento a pavimento):</p>
      <table class="normas">
        <tr><th>Pavimento</th><th>Cálculo</th></tr>
        ${s.pavimentos.map((pav) => `<tr><td>${esc(pav.nome)}</td><td>${esc(pav.acessos.memoria)}</td></tr>`).join('')}
      </table>
      <p><strong>Escadas, rampas, descargas e portas</strong> (dimensionados pela população crítica = ${fmt(s.populacaoCritica)} pessoas):</p>
      <table class="normas">
        <tr><th>Elemento</th><th>Cálculo</th><th>Resultado</th></tr>
        <tr><td>E — Escadas</td><td>${esc(s.dimensionamento.escadas.memoria)}</td><td><strong>${fmt(s.dimensionamento.escadas.unidades)} U.P. · ${fmt(s.dimensionamento.escadas.larguraM, 2)} m</strong></td></tr>
        <tr><td>R — Rampas</td><td>${esc(s.dimensionamento.rampas.memoria)}</td><td><strong>${fmt(s.dimensionamento.rampas.unidades)} U.P. · ${fmt(s.dimensionamento.rampas.larguraM, 2)} m</strong></td></tr>
        <tr><td>D — Descargas</td><td>${esc(s.dimensionamento.descargas.memoria)}</td><td><strong>${fmt(s.dimensionamento.descargas.unidades)} U.P. · ${fmt(s.dimensionamento.descargas.larguraM, 2)} m</strong></td></tr>
        <tr><td>P — Portas</td><td>${esc(s.dimensionamento.portas.memoria)}</td><td><strong>${fmt(s.dimensionamento.portas.unidades)} U.P. · ${fmt(s.dimensionamento.portas.larguraM, 2)} m</strong></td></tr>
      </table>

      <h3>4. Tipo de escada (Anexo C, Tabela 3)</h3>
      <table class="dados">
        <tr><td>Altura da edificação</td><td>${fmt(p.alturaM, 2)} m</td></tr>
        <tr><td>Classificação</td><td><strong>${s.tipoEscada.sigla}</strong></td></tr>
        <tr><td>Descrição</td><td>${esc(s.tipoEscada.descricao)}</td></tr>
        <tr><td>Critério</td><td>${esc(s.tipoEscada.base)}</td></tr>
      </table>

      <h3>5. Veredito de conformidade</h3>
      <table class="normas">
        <tr><th>Item verificado</th><th>Real / Existente</th><th>Exigido / Permitido</th><th>Situação</th></tr>
        <tr>
          <td>Tipo de escada</td>
          <td>—</td>
          <td>${s.tipoEscada.sigla} — ${esc(s.tipoEscada.descricao)}</td>
          <td>Baseado na altura de ${fmt(p.alturaM, 2)} m</td>
        </tr>
        <tr>
          <td>Distância a percorrer — piso de descarga</td>
          <td>${s.conformidade.distanciaTerreo.realM > 0 ? `${fmt(s.conformidade.distanciaTerreo.realM, 1)} m` : 'não informado'}</td>
          <td>${s.conformidade.distanciaTerreo.permitidoM ? `${s.conformidade.distanciaTerreo.permitidoM} m` : 'consultar CBMBA'}</td>
          <td>${conformeTxt(s.conformidade.distanciaTerreo.conforme)}</td>
        </tr>
        <tr>
          <td>Distância a percorrer — demais andares</td>
          <td>${s.conformidade.distanciaDemais.realM > 0 ? `${fmt(s.conformidade.distanciaDemais.realM, 1)} m` : 'não informado'}</td>
          <td>${s.conformidade.distanciaDemais.permitidoM ? `${s.conformidade.distanciaDemais.permitidoM} m` : 'consultar CBMBA'}</td>
          <td>${conformeTxt(s.conformidade.distanciaDemais.conforme)}</td>
        </tr>
        <tr>
          <td>Quantitativo de saídas</td>
          <td>${esc(s.conformidade.saidas.existente)}</td>
          <td>Mínimo: ${fmt(s.conformidade.saidas.minimo)} saída(s) (${esc(s.conformidade.saidas.criterio)})</td>
          <td>${conformeTxt(s.conformidade.saidas.conforme)}</td>
        </tr>
      </table>
      <p>${esc(s.distanciaMaxima.consideracoes)}</p>
      <p>As portas das rotas de saída abrirão no sentido do fluxo de fuga, dotadas de barra antipânico onde exigido
      (NBR 11785). Corrimãos contínuos em ambos os lados das escadas, guarda-corpos e degraus conforme IT 11 e
      NBR 9077. Pisos das rotas de fuga antiderrapantes e desobstruídos.</p>
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
    const alm = p.alarme ?? alarmePadrao();
    const tipoTxt = alm.tipoSistema === 'enderecavel'
      ? '<strong>endereçável</strong>'
      : alm.tipoSistema === 'convencional'
        ? '<strong>convencional</strong>'
        : '<strong>endereçável ou convencional</strong> (a definir no projeto executivo)';
    const localCentral = alm.centralLocalizacao.trim() || 'entrada principal (recepção/portaria)';
    const sinalizadores: string[] = [];
    if (alm.sirenes) {
      sinalizadores.push('<li><strong>Sirenes:</strong> alta potência sonora, padrão intermitente, instaladas de forma a garantir audibilidade em todos os ambientes ocupados;</li>');
    }
    if (alm.sinalizadoresVisuais) {
      sinalizadores.push('<li><strong>Sinalizadores visuais:</strong> lâmpadas LED estroboscópicas, utilizadas em locais com alto nível de ruído e em áreas acessíveis a pessoas com deficiência auditiva;</li>');
    }
    if (!sinalizadores.length) {
      sinalizadores.push('<li>Sinalizadores audiovisuais conforme lançamento em projeto, garantindo audibilidade e visibilidade em toda a edificação;</li>');
    }
    const auxiliares: string[] = [];
    if (alm.doorHolders) {
      auxiliares.push('<li><strong>Door holders (eletroímãs retentores de porta):</strong> mantêm as portas corta-fogo abertas em uso normal e liberam o fechamento automático em caso de alarme;</li>');
    }
    auxiliares.push('<li><strong>Flow switches:</strong> sensores de fluxo instalados em ramais de sprinklers e hidrantes, enviando sinal à central de alarme em caso de descarga de água e permitindo identificar o ponto de atuação;</li>');
    if (alm.controleAcesso) {
      auxiliares.push('<li><strong>Equipamentos de controle de acesso:</strong> catracas, portas automáticas e elevadores programados para destravar/liberar em caso de alarme, garantindo a evacuação (elevadores transferidos ao pavimento de descarga, exceto o de emergência);</li>');
    }
    sec('SISTEMA DE DETECÇÃO E ALARME DE INCÊNDIO (IT 19 / NBR 17240)', `
      <h3>Descrição geral do sistema</h3>
      <p>O sistema projetado será do tipo ${tipoTxt}, composto por central de alarme de incêndio,
      ${aplicavel('deteccao_incendio') ? 'detectores automáticos, ' : ''}acionadores manuais, sinalizadores
      audiovisuais, módulos de interface, dispositivos auxiliares e cabeamento específico, devidamente setorizado de
      acordo com a compartimentação da edificação.</p>
      <p>A arquitetura do sistema prevê a identificação rápida e precisa do ponto de atuação, a emissão imediata de
      alarme sonoro e visual, e a transmissão de informações à central, possibilitando pronta resposta em situações de
      emergência.</p>
      <p>Nenhum equipamento de alarme e detecção de incêndio poderá ser instalado no empreendimento caso não possua,
      nesta ordem de preferência, certificação FM (Factory Mutual), UL (Underwriters Laboratories) ou CE (Comunidade
      Europeia).</p>
      <h3>Componentes do sistema</h3>
      ${alm.central ? `
      <p><strong>Central de Alarme de Incêndio</strong></p>
      <ul>
        <li><strong>Tipo:</strong> ${alm.tipoSistema === 'convencional' ? 'convencional' : alm.tipoSistema === 'enderecavel' ? 'analógica endereçável' : 'convencional ou endereçável'}, com display digital,
        capacidade de expansão e registro de eventos em memória não volátil;</li>
        <li><strong>Funções:</strong> supervisão contínua do sistema, indicação de falhas (curto-circuito, circuito aberto,
        perda de alimentação), registro de alarmes, acionamento automático de sirenes e possibilidade de
        intertravamento com sistemas auxiliares;</li>
        <li><strong>Localização:</strong> ${esc(localCentral)}, com monitoramento 24 horas por operadores treinados, protegida
        contra vandalismo e com fácil visualização e audição pela brigada;</li>
        ${alm.fonte220 ? '<li><strong>Fonte de alimentação:</strong> rede elétrica de 220 Vca, com carregador automático de baterias;</li>' : ''}
        <li>Elementos de teste dos indicadores luminosos e sinalizadores acústicos, locais e remotos.</li>
      </ul>` : ''}
      <p><strong>Acionadores manuais</strong></p>
      <p>Também conhecidos como botoeiras, são dispositivos acionados manualmente por pessoas que identificam um
      princípio de incêndio — pressiona-se, puxa-se ou quebra-se a cobertura de vidro (que não se estilhaça
      perigosamente) para ativar o acionador. Na cor vermelha, instalados em rotas de fuga, corredores e acessos,
      entre 0,90 m e 1,35 m do piso acabado, com espaçamento máximo de 30 m, conforme NBR 17240. Recomenda-se a
      instalação de acionador manual próximo aos postos de hidrante.</p>
      <p><strong>Sinalizadores audiovisuais</strong></p>
      <ul>${sinalizadores.join('')}</ul>
      <p>Instalados entre 2,20 m e 3,50 m, embutidos ou sobrepostos, com volume mínimo de 90 dB.</p>
      <p><strong>Equipamentos auxiliares</strong></p>
      <ul>${auxiliares.join('')}</ul>
      <h3>Alimentação elétrica e baterias</h3>
      <ul>
        <li>O sistema será alimentado pela rede elétrica da edificação, com fornecimento de energia estabilizada;</li>
        <li>Serão utilizadas baterias seladas de chumbo-ácido (máx. 24 Vcc), com autonomia mínima de <strong>24 horas em
        regime de supervisão + 15 minutos em alarme geral</strong>, conforme NBR 17240 — a alimentação por grupo gerador
        terá apenas a finalidade de recarregar as baterias internas.</li>
      </ul>
      <h3>Acionamento e transmissão</h3>
      <ul>
        <li>Alarme geral acionado exclusivamente de forma centralizada pela central, com temporização de retardo de até
        2 minutos e pré-alarme para atuação rápida da brigada;</li>
        <li>Envio automático de mensagem ao Corpo de Bombeiros por ligação telefônica com gravação automática (SIM
        dedicado ou linha privada de alarme), com aviso remoto à diretoria/gerência operacional;</li>
        <li>Possibilidade de ajuste de set point de detecção dentro dos limites normativos.</li>
      </ul>
      ${aplicavel('deteccao_incendio') ? gerarBlocoDetectores(p) : ''}
      <h3>Condutores e fiação</h3>
      <ul>
        <li>Cabos com isolação em material antichama e baixa emissão de fumaça e gases tóxicos (cabo blindado, par
        trançado, isolação 750 V, classe 70 °C — 105 °C para condutor dreno), em lances únicos, sem emendas, com seção
        dimensionada conforme a corrente do circuito;</li>
        <li>Identificação por cores e etiquetas de setor, atendendo aos requisitos de rastreabilidade e manutenção;</li>
        <li>Condutos exclusivos do sistema de incêndio (vedado o compartilhamento com outras instalações), com rede de
        eletrodutos identificada na cor vermelha (ou anéis vermelhos de 2 cm a cada 3 m em locais aparentes);</li>
        <li>Aterramento interligado ao sistema principal da edificação através do BEP (barramento de
        equipotencialização), conforme NBR 5410.</li>
      </ul>
      <h3>Funcionalidades do sistema</h3>
      <ul>
        <li>Monitoramento contínuo de falhas (curto-circuito, circuito aberto, perda de alimentação);</li>
        <li>Registro cronológico de eventos (alarme, falha, restauração);</li>
        <li>Identificação do ponto de origem do alarme;</li>
        <li>Integração com sistemas de combate e de segurança predial (abrigos de mangueiras com interruptores nas
        portas e monitoramento recomendado por CFTV);</li>
        <li>Operação em conformidade com os critérios de confiabilidade e redundância estabelecidos pela NBR 17240.</li>
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
      pressão residual à ponta do esguicho mais desfavorável. Tipo de sistema ${esc(r.hidrantes.origemTipo)}.</p>
      ${gerarBlocoRTI(p, r)}
      ${BLOCO_ABRIGOS}
      <h3>Válvulas, mangueiras e esguichos</h3>
      <ul>
        <li><strong>Válvulas de hidrantes:</strong> tipo globo angular DN 65 (2½"), com junta de união engate rápido (Storz)
        compatível com as mangueiras do Corpo de Bombeiros; válvulas de mangotinhos de abertura rápida, passagem plena,
        DN mínimo 25 (1");</li>
        <li><strong>Mangueiras:</strong> acondicionadas aduchadas nos abrigos conforme NBR 12779; vedado o uso para lavagem de
        pátios ou fins diversos do combate a incêndio; mangueiras usadas em treinamento não retornam aos abrigos;</li>
        <li><strong>Esguichos:</strong> reguláveis, indeformáveis, em material não sujeito à corrosão, resistentes à pressão das
        mangueiras, com adaptador Storz.</li>
      </ul>
      ${gerarBlocoRedeHidraulica(p)}
      ${gerarBlocoPressurizacao(p)}
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

  // Sumário gerado a partir das seções efetivamente incluídas
  const sumario = `
    <div class="sumario">
      <h2 class="sumario-titulo">SUMÁRIO</h2>
      <table class="sumario-lista">
        ${titulos.map((t) => `
        <tr>
          <td class="sumario-num">${t.numero}.</td>
          <td class="sumario-item"><span>${esc(t.titulo)}</span></td>
        </tr>`).join('')}
      </table>
    </div>
  `;

  // Nota obrigatória em todos os documentos gerados pela plataforma
  const notaFerramenta = `
    <p style="margin-top: 18pt; font-size: 9pt; color: #555; border-top: 1px solid #ccc; padding-top: 6pt;">
      Documento gerado por ferramenta de apoio; a responsabilidade técnica e a conferência final são do
      engenheiro responsável conforme as ITs vigentes da UF.
    </p>
  `;

  return `
    ${gerarCapa(p)}
    ${sumario}
    ${secoes.join('\n')}
    ${assinaturas}
    ${notaFerramenta}
  `;
}

/** Estilos usados na pré-visualização, no Word e no PDF (impressão). */
export const ESTILOS_MEMORIAL = `
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.5; margin: 1.5cm 2cm 2cm; }
  /* ---- Folha com cabeçalho repetido (thead repete em todas as páginas impressas) ---- */
  table.folha { width: 100%; border-collapse: collapse; }
  table.folha > thead > tr > td, table.folha > tbody > tr > td { border: none; padding: 0; vertical-align: top; }
  table.folha > thead > tr > td { padding-bottom: 10pt; }
  .doc-cabecalho { width: 100%; border-collapse: collapse; border-bottom: 2px solid #b91c1c; }
  .doc-cabecalho td { border: none; padding: 4pt 6pt; vertical-align: middle; }
  .cab-logo { width: 22%; }
  .cab-logo img { max-height: 42px; max-width: 100%; }
  .cab-logo-texto { font-weight: bold; color: #7f1d1d; font-size: 12pt; }
  .cab-titulo { text-align: center; font-size: 9pt; line-height: 1.3; }
  .cab-titulo strong { font-size: 9.5pt; color: #7f1d1d; }
  .cab-codigo { width: 22%; text-align: right; font-size: 8.5pt; color: #444; }
  /* ---- Sumário ---- */
  .sumario { page-break-after: always; }
  .sumario-titulo { font-size: 14pt; color: #7f1d1d; text-align: center; border-bottom: none !important; margin: 18pt 0 14pt !important; }
  table.sumario-lista { width: 100%; border-collapse: collapse; }
  table.sumario-lista td { border: none; padding: 3pt 4pt; font-size: 10.5pt; }
  td.sumario-num { width: 8%; font-weight: bold; color: #7f1d1d; }
  td.sumario-item span { border-bottom: 1px dotted #999; display: inline-block; width: 100%; padding-bottom: 1pt; }
  /* ---- Capa ---- */
  .capa-logo-img { max-height: 70px; max-width: 100%; }
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
  .memoria-calculo img { max-width: 100%; margin: 4pt 0 10pt; border: 1px solid #bbb; page-break-inside: avoid; }
  .memoria-legenda { font-size: 9pt; color: #555; margin: 8pt 0 2pt; text-align: left; }
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
<body>${envolverEmFolha(p, gerarMemorialHTML(p, r))}</body>
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
