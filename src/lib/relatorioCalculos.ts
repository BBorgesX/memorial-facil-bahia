/**
 * Relatório de Cálculos (memória de cálculo resumida) — exportação separada
 * dos dados da aba "Cálculos", em PDF (impressão) ou Word (.doc).
 */

import { DadosProjeto } from './projeto';
import { ResultadoTecnico } from './engine';
import { MEDIDAS_SEGURANCA } from './normas/exigencias';
import { ESTILOS_MEMORIAL, baixarHTMLComoDoc, imprimirHTML } from './memorial';

const fmt = (n: number | null | undefined, casas = 0): string =>
  n === null || n === undefined ? '—' : n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function gerarRelatorioCalculosHTML(p: DadosProjeto, r: ResultadoTecnico): string {
  const dataCurta = new Date().toLocaleDateString('pt-BR');
  const codigo = p.codigoDocumento.trim() || 'XXX-NNN-DG-DOC-001';
  const medidasAtivas = MEDIDAS_SEGURANCA.filter((m) => r.medidasExigidas.some((e) => e.id === m.id));

  const corpo = `
  <div class="capa-topo">
    <table class="capa-cabecalho">
      <tr>
        <td class="capa-logo">Relatório de Cálculos<br><span>Projeto de Segurança Contra Incêndio e Pânico — CBMBA</span></td>
        <td class="capa-codigo">
          <strong>${esc(codigo)}-CALC</strong><br>
          Revisão: ${esc(p.revisaoDocumento || '00')}<br>
          Data: ${dataCurta}
        </td>
      </tr>
    </table>
  </div>

  <section>
    <h2>1. IDENTIFICAÇÃO</h2>
    <table class="dados">
      <tr><td>Obra / Proprietário</td><td>${esc(p.proprietario || p.nome)}</td></tr>
      <tr><td>Endereço</td><td>${esc([p.logradouro, p.numero, p.bairro, p.municipio ? `${p.municipio} – BA` : ''].filter(Boolean).join(', ') || '—')}</td></tr>
      <tr><td>Responsável técnico</td><td>${esc(p.respTecnicoNome || '—')} ${p.respTecnicoRegistro ? `— ${esc(p.respTecnicoRegistro)}` : ''}</td></tr>
    </table>
  </section>

  <section>
    <h2>2. CLASSIFICAÇÃO (DECRETO Nº 16.302/2015)</h2>
    <table class="normas">
      <tr><th>Parâmetro</th><th>Classificação</th><th>Base</th></tr>
      <tr><td>Ocupação (Tabela 1)</td><td><strong>${r.ocupacao?.divisao ?? '—'}</strong> — ${esc(r.ocupacao?.descricao ?? '—')}</td><td>Grupo ${r.ocupacao?.grupoCodigo ?? '—'} (${esc(r.ocupacao?.grupoNome ?? '—')})</td></tr>
      <tr><td>Altura (Tabela 2)</td><td><strong>Tipo ${r.altura?.tipo ?? '—'}</strong> — ${esc(r.altura?.denominacao ?? '—')}</td><td>H = ${fmt(p.alturaM, 2)} m · ${fmt(p.pavimentos)} pavimento(s)</td></tr>
      <tr><td>Carga de incêndio (Tabela 3)</td><td><strong>${r.carga?.nivel ?? '—'}</strong></td><td>q = ${fmt(p.cargaIncendioMJm2)} MJ/m²</td></tr>
      <tr><td>Área total construída</td><td><strong>${fmt(r.areaTotal, 2)} m²</strong></td><td>Existente ${fmt(p.areaExistente, 2)} + a construir ${fmt(p.areaConstruir, 2)}</td></tr>
    </table>
  </section>

  ${r.trrf ? `
  <section>
    <h2>3. TRRF — SEGURANÇA ESTRUTURAL (IT 08)</h2>
    <table class="normas">
      <tr><th>Elemento</th><th>TRRF</th><th>Faixa de altura</th></tr>
      <tr><td>Pavimentos</td><td><strong>${r.trrf.pavimentos ? `${r.trrf.pavimentos} min` : 'Consultar CBMBA'}</strong></td><td>${esc(r.trrf.faixaAltura)}</td></tr>
      ${p.temSubsolo ? `<tr><td>Subsolo</td><td><strong>${r.trrf.subsolo ? `${r.trrf.subsolo} min` : '—'}</strong></td><td>Profundidade ${fmt(p.profundidadeSubsoloM, 2)} m</td></tr>` : ''}
    </table>
  </section>` : ''}

  ${r.saidas ? `
  <section>
    <h2>4. SAÍDAS DE EMERGÊNCIA — MEMORIAL DE CÁLCULO (IT 11/2016, ANEXO A)</h2>
    <h3>4.1 Dados normativos da ocupação</h3>
    <table class="dados">
      <tr><td>Divisão</td><td>${r.saidas.divisao} — ${esc(r.saidas.descricaoOcupacao)}</td></tr>
      <tr><td>Coeficiente de população</td><td>${esc(r.saidas.coeficiente)}</td></tr>
      <tr><td>Capacidades AD / ER / Portas</td><td>${fmt(r.saidas.capacidadeUP.acessos)} / ${fmt(r.saidas.capacidadeUP.escadas)} / ${fmt(r.saidas.capacidadeUP.portas)} pessoas por U.P.</td></tr>
    </table>
    <h3>4.2 População por pavimento (P)</h3>
    <table class="normas">
      <tr><th>Pavimento</th><th>Área (m²)</th><th>Memória de cálculo</th><th>Acessos (N = P/C)</th></tr>
      ${r.saidas.pavimentos.map((pav) => `
      <tr${pav.nome === r.saidas!.pavimentoCritico ? ' class="linha-ativa"' : ''}>
        <td>${esc(pav.nome)}</td>
        <td>${fmt(pav.areaM2, 2)}</td>
        <td>${esc(pav.memoria)}</td>
        <td>${fmt(pav.acessos.unidades)} U.P. · ${fmt(pav.acessos.larguraM, 2)} m</td>
      </tr>`).join('')}
    </table>
    <table class="dados">
      <tr><td>População crítica (máxima)</td><td><strong>${fmt(r.saidas.populacaoCritica)} pessoas</strong> (${esc(r.saidas.pavimentoCritico)})</td></tr>
      <tr><td>População total / adotada</td><td>${fmt(r.saidas.populacaoTotal)} / <strong>${fmt(r.saidas.populacaoAdotada)}</strong> pessoas</td></tr>
    </table>
    <h3>4.3 Escadas, rampas, descargas e portas (pela população crítica; W = N × 0,55; mín. 2 U.P.)</h3>
    <table class="normas">
      <tr><th>Elemento</th><th>Cálculo</th></tr>
      <tr><td>E — Escadas</td><td>${esc(r.saidas.dimensionamento.escadas.memoria)}</td></tr>
      <tr><td>R — Rampas</td><td>${esc(r.saidas.dimensionamento.rampas.memoria)}</td></tr>
      <tr><td>D — Descargas</td><td>${esc(r.saidas.dimensionamento.descargas.memoria)}</td></tr>
      <tr><td>P — Portas</td><td>${esc(r.saidas.dimensionamento.portas.memoria)}</td></tr>
    </table>
    <h3>4.4 Tipo de escada (Anexo C) e veredito de conformidade</h3>
    <table class="normas">
      <tr><th>Item</th><th>Real / Existente</th><th>Exigido / Permitido</th><th>Situação</th></tr>
      <tr><td>Tipo de escada</td><td>—</td><td>${r.saidas.tipoEscada.sigla} — ${esc(r.saidas.tipoEscada.descricao)}</td><td>${esc(r.saidas.tipoEscada.base)}</td></tr>
      <tr><td>Distância — piso de descarga</td><td>${r.saidas.conformidade.distanciaTerreo.realM > 0 ? `${fmt(r.saidas.conformidade.distanciaTerreo.realM, 1)} m` : 'não informado'}</td><td>${r.saidas.conformidade.distanciaTerreo.permitidoM ? `${r.saidas.conformidade.distanciaTerreo.permitidoM} m` : 'consultar CBMBA'}</td><td>${r.saidas.conformidade.distanciaTerreo.conforme === null ? 'não verificado' : r.saidas.conformidade.distanciaTerreo.conforme ? 'CONFORME' : 'NÃO CONFORME'}</td></tr>
      <tr><td>Distância — demais andares</td><td>${r.saidas.conformidade.distanciaDemais.realM > 0 ? `${fmt(r.saidas.conformidade.distanciaDemais.realM, 1)} m` : 'não informado'}</td><td>${r.saidas.conformidade.distanciaDemais.permitidoM ? `${r.saidas.conformidade.distanciaDemais.permitidoM} m` : 'consultar CBMBA'}</td><td>${r.saidas.conformidade.distanciaDemais.conforme === null ? 'não verificado' : r.saidas.conformidade.distanciaDemais.conforme ? 'CONFORME' : 'NÃO CONFORME'}</td></tr>
      <tr><td>Quantitativo de saídas</td><td>${esc(r.saidas.conformidade.saidas.existente)}</td><td>Mínimo ${fmt(r.saidas.conformidade.saidas.minimo)} (${esc(r.saidas.conformidade.saidas.criterio)})</td><td>${r.saidas.conformidade.saidas.conforme ? 'CONFORME' : 'NÃO CONFORME'}</td></tr>
    </table>
    <p>${esc(r.saidas.distanciaMaxima.consideracoes)}</p>
  </section>` : ''}

  ${r.hidrantes ? `
  <section>
    <h2>5. HIDRANTES E RTI (IT 22 / NBR 13714)</h2>
    <table class="normas">
      <tr><th>Tipo</th><th>Esguicho DN</th><th>Mangueira DN / compr.</th><th>Expedições</th><th>Vazão mínima</th><th>Pressão residual mín.</th><th>RTI</th></tr>
      <tr>
        <td><strong>Tipo ${r.hidrantes.sistemaTipo}</strong></td>
        <td>${fmt(r.hidrantes.esguichoDN)} mm</td>
        <td>${fmt(r.hidrantes.mangueiraDN)} mm / ${fmt(r.hidrantes.mangueiraComprimentoM)} m</td>
        <td>${esc(r.hidrantes.expedicoes)}</td>
        <td><strong>${fmt(r.hidrantes.vazaoMinimaLmin)} L/min</strong></td>
        <td>${fmt(r.hidrantes.pressaoMinimaMca)} mca</td>
        <td><strong>${fmt(r.hidrantes.rtiM3)} m³</strong></td>
      </tr>
    </table>
    <p>${esc(r.hidrantes.descricaoSistema)}. RTI dimensionada para no mínimo ${fmt(r.hidrantes.duracaoMinutos)} minutos de operação.</p>
  </section>` : ''}

  ${r.extintores ? `
  <section>
    <h2>6. EXTINTORES (IT 21 / NBR 12693)</h2>
    <table class="dados">
      <tr><td>Risco (carga de incêndio)</td><td>${r.carga?.nivel ?? '—'}</td></tr>
      <tr><td>Capacidade extintora mínima</td><td><strong>${esc(r.extintores.capacidadeMinima)}</strong></td></tr>
      <tr><td>Distância máxima a percorrer</td><td>${fmt(r.extintores.distanciaMaximaM)} m</td></tr>
      <tr><td>Quantidade estimada</td><td><strong>${fmt(r.extintores.quantidadeEstimada)} unidades</strong></td></tr>
    </table>
    <p>${esc(r.extintores.observacao)}</p>
  </section>` : ''}

  ${r.brigada ? `
  <section>
    <h2>7. BRIGADA DE INCÊNDIO (IT 17 / NBR 14276)</h2>
    <table class="normas">
      <tr><th>Divisão</th><th>Grau de risco</th><th>População fixa</th><th>Brigadistas (mín.)</th><th>Treinamento</th><th>Carga horária</th></tr>
      <tr>
        <td>${r.ocupacao?.divisao ?? '—'}</td>
        <td>${r.carga?.nivel ?? '—'}</td>
        <td>${fmt(r.saidas?.populacaoAdotada)}</td>
        <td><strong>${fmt(r.brigada.quantidadeMinima)}</strong></td>
        <td>${esc(r.brigada.nivelTreinamento)}</td>
        <td>${esc(r.brigada.cargaHoraria)}</td>
      </tr>
    </table>
  </section>` : ''}

  ${r.iluminacao ? `
  <section>
    <h2>8. ILUMINAÇÃO DE EMERGÊNCIA (IT 18 / NBR 10898)</h2>
    <table class="dados">
      <tr><td>Autonomia mínima</td><td>${r.iluminacao.autonomiaHoras} horas</td></tr>
      <tr><td>Iluminância mínima (aclaramento)</td><td>${r.iluminacao.iluminanciaMinimaLux} lux</td></tr>
      <tr><td>Distância máxima entre pontos</td><td>${r.iluminacao.distanciaMaximaPontosM} m (${fmt(r.iluminacao.distanciaMaximaParedeM, 1)} m até a parede)</td></tr>
      <tr><td>Pontos estimados</td><td><strong>${fmt(r.iluminacao.pontosEstimados)}</strong></td></tr>
    </table>
  </section>` : ''}

  <section>
    <h2>9. MEDIDAS DE SEGURANÇA EXIGIDAS (TABELAS 5/6 DO DECRETO)</h2>
    <table class="normas">
      <tr><th>Medida</th><th>Referência</th></tr>
      ${medidasAtivas.map((m) => `<tr><td>${esc(m.nome)}</td><td>${esc(m.referencia)}</td></tr>`).join('')}
    </table>
    ${r.exigenciasSubsolo.length ? `
    <h3>Exigências adicionais de subsolo (Tabela 7)</h3>
    <ul>${r.exigenciasSubsolo.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : ''}
    ${r.avisos.length ? `
    <h3>Avisos técnicos</h3>
    <ul>${r.avisos.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
    <p><em>Valores determinados pelas tabelas normativas citadas, como apoio ao projeto. O dimensionamento final
    (memória de cálculo hidráulico e lançamento em planta) é de responsabilidade do responsável técnico
    habilitado.</em></p>
  </section>
  `;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Relatório de Cálculos — ${esc(p.nome)}</title>
<style>${ESTILOS_MEMORIAL}</style>
</head>
<body>${corpo}</body>
</html>`;
}

export function exportarCalculosWord(p: DadosProjeto, r: ResultadoTecnico) {
  baixarHTMLComoDoc(
    gerarRelatorioCalculosHTML(p, r),
    `calculos-incendio-${p.nome.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.doc`,
  );
}

export function exportarCalculosPDF(p: DadosProjeto, r: ResultadoTecnico): boolean {
  return imprimirHTML(gerarRelatorioCalculosHTML(p, r));
}
