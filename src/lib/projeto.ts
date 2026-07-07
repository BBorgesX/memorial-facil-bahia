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

export interface DadosProjeto {
  id: string;
  nome: string;
  criadoEm: string;
  atualizadoEm: string;

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
    medidas: {},
    riscosEspeciais: {},
    respTecnicoNome: '',
    respTecnicoRegistro: '',
    termoAceito: false,
  };
}

// ---------------------------------------------------------------------------
// Persistência local (localStorage) — os projetos ficam salvos no navegador e
// podem ser reabertos/editados. Estrutura pronta para migração a um backend.
// ---------------------------------------------------------------------------

const CHAVE_INDICE = 'mfb:projetos';

interface ResumoProjeto {
  id: string;
  nome: string;
  municipio: string;
  divisao: string;
  atualizadoEm: string;
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

export function salvarProjeto(projeto: DadosProjeto): DadosProjeto {
  const atualizado = { ...projeto, atualizadoEm: new Date().toISOString() };
  localStorage.setItem(`mfb:projeto:${projeto.id}`, JSON.stringify(atualizado));
  const indice = lerIndice().filter((p) => p.id !== projeto.id);
  indice.push({
    id: atualizado.id,
    nome: atualizado.nome,
    municipio: atualizado.municipio,
    divisao: atualizado.divisao,
    atualizadoEm: atualizado.atualizadoEm,
  });
  gravarIndice(indice);
  return atualizado;
}

export function excluirProjeto(id: string) {
  localStorage.removeItem(`mfb:projeto:${id}`);
  gravarIndice(lerIndice().filter((p) => p.id !== id));
}

export function duplicarProjeto(id: string): DadosProjeto | null {
  const original = carregarProjeto(id);
  if (!original) return null;
  const copia: DadosProjeto = {
    ...original,
    id: novoProjeto().id,
    nome: `${original.nome} (cópia)`,
    criadoEm: new Date().toISOString(),
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
