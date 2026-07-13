/**
 * Memorial Descritivo de Brigada de Incêndio — IT 17 (Brigada de Incêndio)
 * complementada pela NBR 14276.
 *
 * Gerado a partir dos dados do projeto (aba "1. Dados e Classificação"):
 * ocupação/divisão, nível de risco pela carga de incêndio e população
 * adotada. Reutiliza a folha, o cabeçalho e os estilos do memorial
 * descritivo para manter a identidade visual dos documentos.
 */

import { DadosProjeto } from './projeto';
import { ResultadoTecnico } from './engine';
import {
  ESTILOS_MEMORIAL,
  baixarHTMLComoDoc,
  envolverEmFolha,
  imprimirHTML,
} from './memorial';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const CONTEUDO_TREINAMENTO: Record<string, string[]> = {
  Básico: [
    'Teoria do fogo e propagação',
    'Prevenção e métodos de extinção',
    'Agentes e equipamentos de combate (extintores e hidrantes)',
    'Abandono de área e pontos de encontro',
    'Primeiros socorros básicos',
  ],
  Intermediário: [
    'Teoria do fogo, propagação e classes de incêndio',
    'Prevenção e métodos de extinção',
    'Equipamentos de combate: extintores, hidrantes e acessórios',
    'Abandono de área, população fixa/flutuante e pontos de encontro',
    'Primeiros socorros: avaliação da vítima, RCP e hemorragias',
    'Prática de combate a incêndio em campo',
  ],
  Avançado: [
    'Teoria do fogo, propagação e comportamento dos materiais',
    'Prevenção, métodos de extinção e agentes extintores',
    'Equipamentos de combate, EPI e EPR',
    'Abandono de área, exercícios simulados e plano de emergência',
    'Primeiros socorros: avaliação, RCP com DEA, hemorragias, queimaduras e transporte de vítimas',
    'Prática intensiva de combate a incêndio em campo',
  ],
};

const INVENTARIO_PRIMEIROS_SOCORROS = [
  'Luvas de procedimento descartáveis',
  'Gazes estéreis, ataduras de crepom e esparadrapo',
  'Soro fisiológico 0,9% para limpeza de ferimentos',
  'Tesoura de ponta romba e pinça',
  'Colar cervical (tamanhos P/M/G) e talas moldáveis',
  'Máscara de proteção para RCP (pocket mask)',
  'Manta térmica aluminizada',
  'Bolsa/maleta identificada de primeiros socorros por pavimento/setor',
];

/** Corpo (HTML) do memorial de brigada — sem folha/cabeçalho. */
export function gerarMemorialBrigadaHTML(p: DadosProjeto, r: ResultadoTecnico): string {
  const brigada = r.brigada;
  const ocupacao = r.ocupacao;
  const carga = r.carga;
  if (!brigada || !ocupacao) return '<p>Preencha a classificação na aba "1. Dados e Classificação".</p>';

  const turnos = Math.max(1, p.brigadaTurnos || 1);
  const totalBrigadistas = brigada.quantidadeMinima * turnos;
  const populacao = r.saidas?.populacaoAdotada ?? p.ocupantes;
  const areaTotal = (p.areaExistente || 0) + (p.areaConstruir || 0);
  const endereco = [p.logradouro, p.numero, p.complemento, p.bairro, p.municipio]
    .filter(Boolean)
    .join(', ');
  const conteudo = CONTEUDO_TREINAMENTO[brigada.nivelTreinamento] ?? CONTEUDO_TREINAMENTO['Básico'];

  return `
<h2>1. OBJETIVO</h2>
<p>Este memorial estabelece o dimensionamento, a composição, o treinamento e as atribuições da
Brigada de Incêndio da edificação, em atendimento à Instrução Técnica nº 17 — Brigada de
Incêndio e à NBR 14276, como parte integrante do processo de segurança contra incêndio e
pânico.</p>

<h2>2. DADOS DA EDIFICAÇÃO</h2>
<table>
  <tr><th>Razão social / Proprietário</th><td>${esc(p.empresa || p.proprietario || '—')}</td></tr>
  <tr><th>Edificação</th><td>${esc(p.nome)}</td></tr>
  <tr><th>Endereço</th><td>${esc(endereco || '—')}</td></tr>
  <tr><th>Ocupação (Tabela 1)</th><td>Grupo ${esc(ocupacao.grupoCodigo)} (${esc(ocupacao.grupoNome)}) — Divisão ${esc(ocupacao.divisao)}: ${esc(ocupacao.descricao)}</td></tr>
  <tr><th>Área construída total</th><td>${areaTotal.toLocaleString('pt-BR')} m²</td></tr>
  <tr><th>Altura / Pavimentos</th><td>${p.alturaM.toLocaleString('pt-BR')} m · ${p.pavimentos} pavimento(s)</td></tr>
  <tr><th>Nível de risco (carga de incêndio)</th><td>${esc(carga?.nivel ?? '—')}${carga ? ` — ${esc(carga.descricao)}` : ''}</td></tr>
  <tr><th>População fixa adotada</th><td>${populacao.toLocaleString('pt-BR')} pessoa(s)</td></tr>
</table>

<h2>3. QUADRO DE DIMENSIONAMENTO DA BRIGADA</h2>
<p>O dimensionamento segue a composição mínima da brigada por população fixa e nível de risco
(Tabela A.1 da IT 17/NBR 14276):</p>
<table>
  <tr><th>População fixa (por turno)</th><td>${populacao.toLocaleString('pt-BR')} pessoa(s)</td></tr>
  <tr><th>Nível de risco</th><td>${esc(carga?.nivel ?? '—')}</td></tr>
  <tr><th>Brigadistas mínimos por turno</th><td><strong>${brigada.quantidadeMinima}</strong></td></tr>
  <tr><th>Turnos de trabalho</th><td>${turnos}</td></tr>
  <tr><th>Total de brigadistas da edificação</th><td><strong>${totalBrigadistas}</strong></td></tr>
  <tr><th>Nível de treinamento</th><td>${esc(brigada.nivelTreinamento)}</td></tr>
  <tr><th>Carga horária do treinamento</th><td>${esc(brigada.cargaHoraria)}</td></tr>
</table>
<p>${esc(brigada.composicao)}</p>

<h2>4. TREINAMENTO DA BRIGADA</h2>
<p>Os brigadistas receberão treinamento de nível <strong>${esc(brigada.nivelTreinamento)}</strong>,
com carga horária de ${esc(brigada.cargaHoraria)}, ministrado por profissional habilitado,
contemplando no mínimo:</p>
<ul>
${conteudo.map((item) => `  <li>${esc(item)}</li>`).join('\n')}
</ul>
<p>A reciclagem do treinamento é anual e o exercício simulado de abandono de área é realizado a
cada 6 (seis) meses, com registro em ata contendo horários, tempo de abandono, participantes e
não conformidades observadas.</p>

<h2>5. ATRIBUIÇÕES DA BRIGADA</h2>
<h3>5.1 Ações de prevenção</h3>
<ul>
  <li>Conhecer o plano de emergência da edificação;</li>
  <li>Inspecionar periodicamente os equipamentos de combate a incêndio, primeiros socorros e rotas de fuga;</li>
  <li>Identificar e comunicar riscos e não conformidades;</li>
  <li>Orientar a população fixa e flutuante sobre procedimentos de emergência.</li>
</ul>
<h3>5.2 Ações de emergência</h3>
<ul>
  <li>Identificar a situação e acionar o alarme e o Corpo de Bombeiros (193);</li>
  <li>Cortar energia elétrica dos setores atingidos, quando necessário;</li>
  <li>Realizar o combate a princípios de incêndio com os equipamentos disponíveis;</li>
  <li>Prestar os primeiros socorros a vítimas;</li>
  <li>Coordenar o abandono de área até o ponto de encontro e conferir a população;</li>
  <li>Recepcionar e apoiar o Corpo de Bombeiros, fornecendo informações da edificação.</li>
</ul>

<h2>6. ORGANOGRAMA FUNCIONAL</h2>
<p>A brigada é organizada com a seguinte hierarquia por turno de trabalho:</p>
<ul>
  <li><strong>Coordenador geral da brigada:</strong> ${esc(p.brigadaCoordenador || 'a designar pelo responsável pela edificação')};</li>
  <li><strong>Líder de brigada</strong> por pavimento/setor;</li>
  <li><strong>Brigadistas</strong> distribuídos pelos pavimentos/setores conforme o quadro de dimensionamento.</li>
</ul>
<p>Na ausência do coordenador geral, assume o líder do turno; na ausência deste, o brigadista
mais experiente presente.</p>

<h2>7. INVENTÁRIO MÍNIMO DE PRIMEIROS SOCORROS</h2>
<ul>
${INVENTARIO_PRIMEIROS_SOCORROS.map((i) => `  <li>${esc(i)}</li>`).join('\n')}
</ul>

<h2>8. IDENTIFICAÇÃO DOS BRIGADISTAS</h2>
<p>Os brigadistas serão identificados por crachá e/ou colete/braçadeira, e a relação nominal da
brigada, com respectivos setores e turnos, ficará afixada em local visível e será mantida
atualizada.</p>
${p.brigadaObservacoes ? `\n<h2>9. OBSERVAÇÕES COMPLEMENTARES</h2>\n<p>${esc(p.brigadaObservacoes)}</p>` : ''}

<div class="assinatura">
  <p>________________________________________</p>
  <p><strong>${esc(p.respTecnicoNome || 'Responsável Técnico')}</strong><br>${esc(p.respTecnicoRegistro || 'Registro profissional')}</p>
</div>`;
}

const TITULO_DOC = 'MEMORIAL DESCRITIVO — Brigada de Incêndio (IT 17/NBR 14276)';

export function documentoBrigada(p: DadosProjeto, r: ResultadoTecnico): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Memorial de Brigada — ${esc(p.nome)}</title>
<style>${ESTILOS_MEMORIAL}</style>
</head>
<body>${envolverEmFolha(p, gerarMemorialBrigadaHTML(p, r), TITULO_DOC)}</body>
</html>`;
}

/** Exporta em PDF abrindo a caixa de impressão do navegador (Salvar como PDF). */
export function exportarBrigadaPDF(p: DadosProjeto, r: ResultadoTecnico): boolean {
  return imprimirHTML(documentoBrigada(p, r));
}

export function exportarBrigadaWord(p: DadosProjeto, r: ResultadoTecnico) {
  baixarHTMLComoDoc(
    documentoBrigada(p, r),
    `memorial-brigada-${p.nome.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.doc`,
  );
}
