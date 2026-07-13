/**
 * Gestão de projetos e clientes: status do processo no CBMBA, alertas de
 * vencimento do AVCB, CRM simples (clientes/obras) e portal do cliente.
 */

import {
  DadosProjeto,
  EventoHistorico,
  ResumoProjeto,
  StatusProjeto,
  carregarProjeto,
  listarProjetos,
} from './projeto';
import { empurrarRegistro, removerRegistro } from './supabase';

// ---------------------------------------------------------------------------
// Status do projeto
// ---------------------------------------------------------------------------

export const STATUS_INFO: Record<
  StatusProjeto,
  { rotulo: string; descricao: string; classe: string; ponto: string }
> = {
  rascunho: {
    rotulo: 'Em elaboração',
    descricao: 'Projeto em elaboração, ainda não protocolado no CBMBA',
    classe: 'bg-muted text-muted-foreground border-transparent',
    ponto: 'bg-slate-400',
  },
  em_analise: {
    rotulo: 'Em análise',
    descricao: 'Protocolado e aguardando análise do CBMBA',
    classe: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
    ponto: 'bg-blue-500',
  },
  com_exigencia: {
    rotulo: 'Com exigência',
    descricao: 'O CBMBA apontou exigências a atender',
    classe: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
    ponto: 'bg-amber-500',
  },
  aprovado: {
    rotulo: 'Aprovado',
    descricao: 'Projeto aprovado / AVCB emitido',
    classe: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
    ponto: 'bg-emerald-500',
  },
  vencido: {
    rotulo: 'Vencido',
    descricao: 'AVCB vencido — é preciso solicitar a renovação',
    classe: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
    ponto: 'bg-red-500',
  },
};

export const TODOS_STATUS: StatusProjeto[] = ['rascunho', 'em_analise', 'com_exigencia', 'aprovado', 'vencido'];

/**
 * Status efetivo do projeto: um AVCB com validade ultrapassada torna o
 * projeto "vencido" automaticamente, mesmo que o status salvo seja outro.
 */
export function statusEfetivo(p: Pick<DadosProjeto, 'status' | 'avcbValidade'>): StatusProjeto {
  const situacao = situacaoAvcb(p.avcbValidade);
  if (situacao.nivel === 'vencido') return 'vencido';
  return p.status ?? 'rascunho';
}

// ---------------------------------------------------------------------------
// Alertas de vencimento do AVCB
// ---------------------------------------------------------------------------

export type NivelAvcb = 'sem_data' | 'ok' | 'atencao' | 'critico' | 'vencido';

export interface SituacaoAvcb {
  nivel: NivelAvcb;
  /** Dias até o vencimento (negativo = vencido há N dias) */
  dias: number | null;
  rotulo: string;
}

const DIAS_ALERTA_ATENCAO = 90;
const DIAS_ALERTA_CRITICO = 30;

export function situacaoAvcb(validade: string | undefined): SituacaoAvcb {
  if (!validade) return { nivel: 'sem_data', dias: null, rotulo: 'Sem AVCB cadastrado' };
  const fim = new Date(`${validade}T23:59:59`);
  if (isNaN(fim.getTime())) return { nivel: 'sem_data', dias: null, rotulo: 'Data de validade inválida' };
  const dias = Math.ceil((fim.getTime() - Date.now()) / 86_400_000);
  if (dias < 0) return { nivel: 'vencido', dias, rotulo: `AVCB vencido há ${Math.abs(dias)} dia(s)` };
  if (dias <= DIAS_ALERTA_CRITICO) return { nivel: 'critico', dias, rotulo: `AVCB vence em ${dias} dia(s)` };
  if (dias <= DIAS_ALERTA_ATENCAO) return { nivel: 'atencao', dias, rotulo: `AVCB vence em ${dias} dia(s)` };
  return { nivel: 'ok', dias, rotulo: `AVCB válido por mais ${dias} dia(s)` };
}

export function formatarData(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
}

/** Registro para o histórico do projeto. */
export function evento(descricao: string): EventoHistorico {
  return { data: new Date().toISOString(), descricao };
}

/** Carrega todos os projetos completos (para o painel de gestão). */
export function carregarTodosProjetos(): DadosProjeto[] {
  return listarProjetos()
    .map((r: ResumoProjeto) => carregarProjeto(r.id))
    .filter((p): p is DadosProjeto => p !== null);
}

// ---------------------------------------------------------------------------
// CRM simples — clientes e interações
// ---------------------------------------------------------------------------

export type TipoInteracao = 'ligacao' | 'whatsapp' | 'email' | 'reuniao' | 'visita' | 'outro';

export const TIPOS_INTERACAO: Record<TipoInteracao, string> = {
  ligacao: 'Ligação',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  reuniao: 'Reunião',
  visita: 'Visita à obra',
  outro: 'Outro',
};

export interface Interacao {
  id: string;
  data: string;
  tipo: TipoInteracao;
  descricao: string;
}

export interface Cliente {
  id: string;
  nome: string;
  tipoPessoa: 'PF' | 'PJ';
  cpfCnpj: string;
  email: string;
  telefone: string;
  whatsapp: string;
  endereco: string;
  municipio: string;
  observacoes: string;
  interacoes: Interacao[];
  criadoEm: string;
  atualizadoEm: string;
}

const CHAVE_CLIENTES = 'mfb:clientes';

export function novoCliente(nome = ''): Cliente {
  const agora = new Date().toISOString();
  return {
    id: `cli_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    nome,
    tipoPessoa: 'PJ',
    cpfCnpj: '',
    email: '',
    telefone: '',
    whatsapp: '',
    endereco: '',
    municipio: '',
    observacoes: '',
    interacoes: [],
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

export function listarClientes(): Cliente[] {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_CLIENTES) ?? '[]') as Cliente[];
    return lista
      .map((c) => ({ ...novoCliente(), ...c }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  } catch {
    return [];
  }
}

export function carregarCliente(id: string): Cliente | null {
  return listarClientes().find((c) => c.id === id) ?? null;
}

/** Grava no cache local sem alterar atualizadoEm nem enviar à nuvem (uso interno da sincronização). */
export function gravarClienteLocal(cliente: Cliente) {
  const lista = listarClientes().filter((c) => c.id !== cliente.id);
  lista.push(cliente);
  localStorage.setItem(CHAVE_CLIENTES, JSON.stringify(lista));
}

export function salvarCliente(cliente: Cliente): Cliente {
  const atualizado = { ...cliente, atualizadoEm: new Date().toISOString() };
  gravarClienteLocal(atualizado);
  void empurrarRegistro('clientes', atualizado.id, atualizado);
  return atualizado;
}

export function excluirCliente(id: string) {
  localStorage.setItem(CHAVE_CLIENTES, JSON.stringify(listarClientes().filter((c) => c.id !== id)));
  void removerRegistro('clientes', id);
}

export function novaInteracao(tipo: TipoInteracao, descricao: string): Interacao {
  return {
    id: `int_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    data: new Date().toISOString(),
    tipo,
    descricao,
  };
}

/** Projetos (obras) vinculados a um cliente. */
export function projetosDoCliente(clienteId: string): DadosProjeto[] {
  return carregarTodosProjetos().filter((p) => p.clienteId === clienteId);
}

// ---------------------------------------------------------------------------
// Portal do cliente — link somente leitura com um retrato do andamento.
// O retrato vai codificado no próprio link (hash da URL), portanto funciona
// em qualquer dispositivo, sem depender dos dados deste navegador.
// ---------------------------------------------------------------------------

export interface SnapshotPortal {
  nome: string;
  municipio: string;
  empresa: string;
  respTecnicoNome: string;
  status: StatusProjeto;
  protocoloCBMBA: string;
  dataProtocolo: string;
  avcbNumero: string;
  avcbEmissao: string;
  avcbValidade: string;
  exigencias: { descricao: string; prazo: string; resolvida: boolean }[];
  historico: EventoHistorico[];
  geradoEm: string;
}

export function gerarSnapshotPortal(p: DadosProjeto): SnapshotPortal {
  return {
    nome: p.nome,
    municipio: p.municipio,
    empresa: p.empresa,
    respTecnicoNome: p.respTecnicoNome,
    status: statusEfetivo(p),
    protocoloCBMBA: p.protocoloCBMBA,
    dataProtocolo: p.dataProtocolo,
    avcbNumero: p.avcbNumero,
    avcbEmissao: p.avcbEmissao,
    avcbValidade: p.avcbValidade,
    exigencias: p.exigencias.map(({ descricao, prazo, resolvida }) => ({ descricao, prazo, resolvida })),
    historico: p.historico,
    geradoEm: new Date().toISOString(),
  };
}

export function codificarSnapshot(s: SnapshotPortal): string {
  const json = JSON.stringify(s);
  return btoa(String.fromCharCode(...new TextEncoder().encode(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodificarSnapshot(codigo: string): SnapshotPortal | null {
  try {
    const base64 = codigo.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as SnapshotPortal;
  } catch {
    return null;
  }
}

export function gerarTokenPortal(): string {
  return `pt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/** Localiza (neste navegador) o projeto associado a um token do portal. */
export function projetoPorToken(token: string): DadosProjeto | null {
  return carregarTodosProjetos().find((p) => p.tokenPortal === token) ?? null;
}

export function urlPortal(p: DadosProjeto): string {
  const snapshot = codificarSnapshot(gerarSnapshotPortal(p));
  const token = p.tokenPortal ? `/${p.tokenPortal}` : '';
  return `${window.location.origin}/portal${token}#d=${snapshot}`;
}
