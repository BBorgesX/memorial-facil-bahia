/**
 * Modelo de dados do projeto de segurança contra incêndio e pânico.
 */

export interface DetalhesMedida {
  aplicavel: boolean;
  /** true quando o estado veio da classificação automática (não editado pelo usuário) */
  automatica: boolean;
  detalhes: string;
  nota?: string;
}

/** Dados informados pelo usuário para cada pavimento (cálculo da IT 11). */
export interface PavimentoProjeto {
  nome: string;
  areaM2: number;
  /** Nº de dormitórios (grupos A e H-2 — população = dormitórios × 2) */
  dormitorios?: number;
  /** População informada manualmente para o pavimento (prevalece) */
  populacaoManual?: number;
}

/** Configuração do sistema de detecção e alarme de incêndio (IT 19). */
export interface ConfiguracaoAlarme {
  /** Tipo do sistema: endereçável ou convencional ('' = a definir) */
  tipoSistema: 'enderecavel' | 'convencional' | '';
  /** Central de alarme prevista no sistema */
  central: boolean;
  /** Localização da central (vazio = padrão: entrada principal/recepção) */
  centralLocalizacao: string;
  /** Fonte de alimentação: rede 220 Vca com carregador automático de baterias */
  fonte220: boolean;
  /** Sinalizadores audiovisuais */
  sirenes: boolean;
  sinalizadoresVisuais: boolean;
  /** Equipamentos auxiliares */
  doorHolders: boolean;
  controleAcesso: boolean;
}

export function alarmePadrao(): ConfiguracaoAlarme {
  return {
    tipoSistema: '',
    central: true,
    centralLocalizacao: '',
    fonte220: true,
    sirenes: true,
    sinalizadoresVisuais: false,
    doorHolders: false,
    controleAcesso: false,
  };
}

/** Tipos de detectores automáticos selecionados para o projeto (IT 19). */
export interface ConfiguracaoDeteccao {
  pontuais: boolean;
  lineares: boolean;
  chama: boolean;
  termovelocimetricos: boolean;
  gases: boolean;
  /** Texto livre: localização dos detectores, central, fonte alternativa etc. */
  outros: string;
}

export function deteccaoPadrao(): ConfiguracaoDeteccao {
  return {
    pontuais: false,
    lineares: false,
    chama: false,
    termovelocimetricos: false,
    gases: false,
    outros: '',
  };
}

/** Configuração do sistema de hidrantes e mangotinhos (IT 22). */
export interface ConfiguracaoHidrantes {
  // Reservatórios (a capacidade em litros vem da tabela da RTI)
  reservatorioSuperior: boolean;
  reservatorioInferior: boolean;
  reservatorioPiscina: boolean;
  reservatorioOutrosAtivo: boolean;
  /** Descrição de outros reservatórios */
  reservatorioOutros: string;
  /** Material construtivo do reservatório: concreto armado / aço */
  materialConcretoAco: boolean;
  materialOutroAtivo: boolean;
  /** Descrição de outro material construtivo */
  materialOutro: string;
  // Tubulações — onde a rede será instalada
  redeAparente: boolean;
  redeForro: boolean;
  redeEmbutida: boolean;
  redeSubterranea: boolean;
  // Conexões — redes de aço
  conexoesRosqueaveis: boolean;
  conexoesSoldaveis: boolean;
  conexoesGrooving: boolean;
  // Conexões — redes plásticas (PEAD)
  conexoesPEADFusao: boolean;
  // Sistema de pressurização
  pressurizacaoEletrica: boolean;
  pressurizacaoDiesel: boolean;
  /** Dados técnicos + curva de desempenho da bomba principal (elétrica) */
  bombaPrincipalDados: string;
  /** Dados técnicos + curva de desempenho da bomba a combustão (se Diesel) */
  bombaCombustaoDados: string;
  /** Dados técnicos + curva de desempenho da bomba jockey */
  bombaJockeyDados: string;
  /** Memória de cálculo do sistema de hidrantes (imagens em data URL) */
  memoriaCalculoImagens: string[];
}

export function hidrantesPadrao(): ConfiguracaoHidrantes {
  return {
    reservatorioSuperior: false,
    reservatorioInferior: false,
    reservatorioPiscina: false,
    reservatorioOutrosAtivo: false,
    reservatorioOutros: '',
    materialConcretoAco: true,
    materialOutroAtivo: false,
    materialOutro: '',
    redeAparente: true,
    redeForro: false,
    redeEmbutida: false,
    redeSubterranea: false,
    conexoesRosqueaveis: true,
    conexoesSoldaveis: false,
    conexoesGrooving: false,
    conexoesPEADFusao: false,
    pressurizacaoEletrica: true,
    pressurizacaoDiesel: false,
    bombaPrincipalDados: '',
    bombaCombustaoDados: '',
    bombaJockeyDados: '',
    memoriaCalculoImagens: [],
  };
}

/** Situação do projeto no fluxo de aprovação junto ao CBMBA. */
export type StatusProjeto = 'rascunho' | 'em_analise' | 'aprovado' | 'com_exigencia' | 'vencido';

/** Exigência apontada pelo CBMBA na análise do projeto/vistoria. */
export interface Exigencia {
  id: string;
  descricao: string;
  /** Prazo para atendimento (YYYY-MM-DD, vazio = sem prazo) */
  prazo: string;
  resolvida: boolean;
  criadaEm: string;
}

/** Evento registrado na linha do tempo do projeto (mudança de status, exigência etc.). */
export interface EventoHistorico {
  data: string;
  descricao: string;
}

export interface DadosProjeto {
  id: string;
  nome: string;
  criadoEm: string;
  atualizadoEm: string;

  // Gestão — acompanhamento do processo no CBMBA e do AVCB
  clienteId: string;
  status: StatusProjeto;
  protocoloCBMBA: string;
  /** Data de entrada do protocolo no CBMBA (YYYY-MM-DD) */
  dataProtocolo: string;
  avcbNumero: string;
  /** Data de emissão do AVCB (YYYY-MM-DD) */
  avcbEmissao: string;
  /** Data de validade do AVCB (YYYY-MM-DD) — usada nos alertas de renovação */
  avcbValidade: string;
  exigencias: Exigencia[];
  historico: EventoHistorico[];
  /** Token de acesso do portal do cliente (vazio = portal não gerado) */
  tokenPortal: string;

  // Identificação
  proprietario: string;
  empresa: string;
  cnpj: string;
  /** Código do documento na capa (ex.: XXX-NNN-DG-DOC-001) */
  codigoDocumento: string;
  /** Número da revisão do documento (ex.: 00) */
  revisaoDocumento: string;
  tipoEdificacao: 'construcao' | 'existente' | 'renovacao' | '';
  apresentacao: 'PT' | 'PTS' | 'PTIOT' | 'PTOTEP' | '';
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  cep: string;

  // Edificação
  areaExistente: number;
  areaConstruir: number;
  alturaM: number;
  pavimentos: number;
  ocupantes: number; // população fixa informada (0 = calcular automaticamente)

  // Subsolo
  temSubsolo: boolean;
  areaSubsoloM2: number;
  profundidadeSubsoloM: number;
  subsoloPrimeiroSegundoNivel: boolean;
  ocupacaoSubsolo: string;

  // Classificação (Tabelas 1 e 3)
  grupo: string;
  divisao: string;
  cargaIncendioMJm2: number;
  garagemAberta: boolean;
  saidaUnica: boolean;

  // Saídas de emergência — dados por pavimento e verificação (IT 11)
  pavimentosDetalhados: PavimentoProjeto[];
  /** Distância real a percorrer no piso de descarga (m) — para o veredito */
  distanciaRealTerreoM: number;
  /** Distância real a percorrer nos demais pavimentos (m) */
  distanciaRealDemaisM: number;

  /** Tipo de sistema de hidrantes selecionado manualmente (1–5); 0 = automático (mín. Tipo 2) */
  hidranteTipoManual: number;

  /** Configuração do sistema de detecção e alarme (IT 19) */
  alarme: ConfiguracaoAlarme;

  /** Tipos de detectores automáticos do projeto (IT 19) */
  deteccao: ConfiguracaoDeteccao;

  /** Configuração do sistema de hidrantes e mangotinhos (IT 22) */
  hidrantesConfig: ConfiguracaoHidrantes;

  /** Logotipo do projeto/empresa em data URL (exibido na capa e no cabeçalho) */
  logoDataUrl: string;

  // Medidas de segurança (ajustes do usuário sobre a classificação automática)
  medidas: Record<string, DetalhesMedida>;

  // Riscos especiais
  riscosEspeciais: Record<string, { aplicavel: boolean; detalhes: string }>;

  // Responsáveis
  respTecnicoNome: string;
  respTecnicoRegistro: string;

  termoAceito: boolean;
}

export function novoProjeto(nome = 'Novo Projeto'): DadosProjeto {
  const agora = new Date().toISOString();
  return {
    id: `prj_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    nome,
    criadoEm: agora,
    atualizadoEm: agora,
    clienteId: '',
    status: 'rascunho',
    protocoloCBMBA: '',
    dataProtocolo: '',
    avcbNumero: '',
    avcbEmissao: '',
    avcbValidade: '',
    exigencias: [],
    historico: [],
    tokenPortal: '',
    proprietario: '',
    empresa: '',
    cnpj: '',
    codigoDocumento: '',
    revisaoDocumento: '00',
    tipoEdificacao: '',
    apresentacao: 'PT',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    cep: '',
    areaExistente: 0,
    areaConstruir: 0,
    alturaM: 0,
    pavimentos: 1,
    ocupantes: 0,
    temSubsolo: false,
    areaSubsoloM2: 0,
    profundidadeSubsoloM: 0,
    subsoloPrimeiroSegundoNivel: true,
    ocupacaoSubsolo: '',
    grupo: '',
    divisao: '',
    cargaIncendioMJm2: 0,
    garagemAberta: false,
    saidaUnica: false,
    pavimentosDetalhados: [],
    distanciaRealTerreoM: 0,
    distanciaRealDemaisM: 0,
    hidranteTipoManual: 0,
    alarme: alarmePadrao(),
    deteccao: deteccaoPadrao(),
    hidrantesConfig: hidrantesPadrao(),
    logoDataUrl: '',
    medidas: {},
    riscosEspeciais: {},
    respTecnicoNome: '',
    respTecnicoRegistro: '',
    termoAceito: false,
  };
}

// ---------------------------------------------------------------------------
// Persistência: o localStorage funciona como cache local (leitura instantânea
// e uso offline) e cada gravação é replicada para a nuvem (Supabase) quando o
// usuário está logado. A sincronização completa fica em lib/sync.ts.
// ---------------------------------------------------------------------------

import { empurrarRegistro, removerRegistro } from './supabase';

const CHAVE_INDICE = 'mfb:projetos';

export interface ResumoProjeto {
  id: string;
  nome: string;
  municipio: string;
  divisao: string;
  atualizadoEm: string;
  clienteId?: string;
  status?: StatusProjeto;
  avcbValidade?: string;
}

function lerIndice(): ResumoProjeto[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_INDICE) ?? '[]');
  } catch {
    return [];
  }
}

function gravarIndice(indice: ResumoProjeto[]) {
  localStorage.setItem(CHAVE_INDICE, JSON.stringify(indice));
}

export function listarProjetos(): ResumoProjeto[] {
  return lerIndice().sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}

export function carregarProjeto(id: string): DadosProjeto | null {
  try {
    const bruto = localStorage.getItem(`mfb:projeto:${id}`);
    if (!bruto) return null;
    // Mescla com o modelo vazio para tolerar projetos salvos por versões antigas
    return { ...novoProjeto(), ...(JSON.parse(bruto) as DadosProjeto) };
  } catch {
    return null;
  }
}

/** Grava no cache local sem alterar atualizadoEm nem enviar à nuvem (uso interno da sincronização). */
export function gravarProjetoLocal(projeto: DadosProjeto) {
  localStorage.setItem(`mfb:projeto:${projeto.id}`, JSON.stringify(projeto));
  const indice = lerIndice().filter((p) => p.id !== projeto.id);
  indice.push({
    id: projeto.id,
    nome: projeto.nome,
    municipio: projeto.municipio,
    divisao: projeto.divisao,
    atualizadoEm: projeto.atualizadoEm,
    clienteId: projeto.clienteId,
    status: projeto.status,
    avcbValidade: projeto.avcbValidade,
  });
  gravarIndice(indice);
}

export function salvarProjeto(projeto: DadosProjeto): DadosProjeto {
  const atualizado = { ...projeto, atualizadoEm: new Date().toISOString() };
  gravarProjetoLocal(atualizado);
  void empurrarRegistro('projetos', atualizado.id, atualizado);
  return atualizado;
}

export function excluirProjeto(id: string) {
  localStorage.removeItem(`mfb:projeto:${id}`);
  gravarIndice(lerIndice().filter((p) => p.id !== id));
  void removerRegistro('projetos', id);
}

export function duplicarProjeto(id: string): DadosProjeto | null {
  const original = carregarProjeto(id);
  if (!original) return null;
  const copia: DadosProjeto = {
    ...original,
    id: novoProjeto().id,
    nome: `${original.nome} (cópia)`,
    criadoEm: new Date().toISOString(),
    // A cópia inicia um novo processo: não herda protocolo, AVCB nem histórico
    status: 'rascunho',
    protocoloCBMBA: '',
    dataProtocolo: '',
    avcbNumero: '',
    avcbEmissao: '',
    avcbValidade: '',
    exigencias: [],
    historico: [],
    tokenPortal: '',
  };
  return salvarProjeto(copia);
}

export function exportarProjetoJSON(projeto: DadosProjeto): string {
  return JSON.stringify(projeto, null, 2);
}

export function importarProjetoJSON(json: string): DadosProjeto {
  const dados = JSON.parse(json) as Partial<DadosProjeto>;
  const base = novoProjeto(dados.nome ?? 'Projeto importado');
  return salvarProjeto({ ...base, ...dados, id: base.id });
}
