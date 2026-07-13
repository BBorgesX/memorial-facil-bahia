/**
 * Serviço de IA do FirePro Suite.
 *
 * Ponto de extensão único para geração de texto assistida (memorial e
 * resposta a notificação/comunique-se). No MVP opera em MODO TEMPLATE
 * (sem chave de API); para ativar um provedor real basta implementar
 * `gerarComProvedor` e definir a chave — nenhum componente precisa mudar.
 */

export interface ContextoGeracao {
  /** UF ativa do projeto (define órgão e referências normativas) */
  uf: 'BA' | 'SP';
  /** Nome do órgão (CBMBA/CBMSP) — vem da camada de normas */
  orgao: string;
  /** Legislação base da UF — vem da camada de normas */
  legislacao: string;
  /** Nome do projeto/edificação */
  projeto: string;
  /** Município da edificação */
  municipio: string;
  /** Classificação resumida (divisão, tipo, risco) se disponível */
  classificacao: string;
  /** Responsável técnico (nome, título e registro) */
  responsavel: string;
}

export interface ResultadoGeracao {
  texto: string;
  /** 'template' = preenchimento estruturado local; 'ia' = provedor externo */
  origem: 'template' | 'ia';
}

/** Chave do provedor externo (Anthropic/OpenAI). Vazia = modo template. */
function chaveProvedor(): string {
  // Fase 2: ler de configuração segura (variável de ambiente no backend).
  return '';
}

/**
 * Ponto de extensão para o provedor real de IA.
 * Fase 2: chamar a API da Anthropic (claude) ou OpenAI aqui.
 */
async function gerarComProvedor(_prompt: string): Promise<string> {
  throw new Error('Provedor de IA não configurado. Operando em modo template.');
}

/**
 * Gera a resposta técnica formal a uma notificação (comunique-se) do CBM.
 * Com chave de IA configurada usa o provedor; sem chave, aplica o template
 * estruturado com os dados do projeto.
 */
export async function gerarRespostaNotificacao(
  notificacao: string,
  ctx: ContextoGeracao,
): Promise<ResultadoGeracao> {
  if (chaveProvedor()) {
    const prompt =
      `Você é um engenheiro responsável técnico de PPCI. Redija, em português formal, ` +
      `uma resposta técnica à notificação do ${ctx.orgao} abaixo, justificando cada item ` +
      `com base na legislação (${ctx.legislacao}) e nas ITs vigentes da UF ${ctx.uf}. ` +
      `Projeto: ${ctx.projeto} (${ctx.municipio}). Classificação: ${ctx.classificacao}.\n\n` +
      `NOTIFICAÇÃO:\n${notificacao}`;
    return { texto: await gerarComProvedor(prompt), origem: 'ia' };
  }
  return { texto: templateRespostaNotificacao(notificacao, ctx), origem: 'template' };
}

/** Divide o texto da notificação em itens numerados (heurística simples). */
function extrairItens(notificacao: string): string[] {
  const linhas = notificacao
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const itens = linhas.filter((l) => /^(\d+[).:-]|\d+\s*[–—-]|[a-z]\)|item\s*\d+)/i.test(l));
  return itens.length > 0 ? itens : linhas;
}

function templateRespostaNotificacao(notificacao: string, ctx: ContextoGeracao): string {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const itens = extrairItens(notificacao);

  const blocoItens = itens
    .map(
      (item, i) =>
        `${i + 1}. Quanto ao apontamento "${item}":\n` +
        `   Em atenção à exigência, informamos que o projeto foi revisado/complementado no ponto indicado, ` +
        `em conformidade com a ${ctx.legislacao} e com a Instrução Técnica aplicável do ${ctx.orgao}. ` +
        `[DESCREVER AQUI a providência adotada: alteração em planta, complementação do memorial, ` +
        `justificativa técnica ou documento anexado.]`,
    )
    .join('\n\n');

  return (
    `AO ${ctx.orgao.toUpperCase()}\n` +
    `SERVIÇO DE ANÁLISE DE PROJETOS — ${ctx.municipio || '[MUNICÍPIO]'} / ${ctx.uf}\n\n` +
    `REF.: Resposta à Notificação (Comunique-se) — Projeto "${ctx.projeto}"\n` +
    (ctx.classificacao ? `Classificação da edificação: ${ctx.classificacao}\n` : '') +
    `Data: ${hoje}\n\n` +
    `Prezados Senhores,\n\n` +
    `Em atenção à notificação emitida por esse Corpo de Bombeiros referente ao processo de análise ` +
    `do projeto técnico de segurança contra incêndio e pânico da edificação em referência, ` +
    `apresentamos as respostas e providências adotadas para cada item apontado:\n\n` +
    `${blocoItens}\n\n` +
    `Diante do exposto, entendemos estarem sanadas as exigências apontadas, pelo que requeremos o ` +
    `prosseguimento da análise do processo. Permanecemos à disposição para quaisquer esclarecimentos ` +
    `adicionais.\n\n` +
    `Atenciosamente,\n\n` +
    `${ctx.responsavel || '[RESPONSÁVEL TÉCNICO — nome, título e registro CREA]'}\n` +
    `Responsável Técnico\n\n` +
    `---\n` +
    `Documento gerado por ferramenta de apoio; a responsabilidade técnica e a conferência final são ` +
    `do engenheiro responsável conforme as ITs vigentes da UF.`
  );
}
