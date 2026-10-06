/**
 * Gestão de projetos e clientes: status do processo no CBMBA, alertas de
 * vencimento do AVCB, CRM simples (clientes/obras) e portal do cliente.
 */

import {
  DadosProjeto,
  EventoHistorico,
  ResumoProjeto,
  STATUS_PROJETO,
  StatusProjeto,
  carregarProjeto,
  listarProjetos,
  normalizarStatus,
} from './projeto';
import { empurrarRegistro, removerRegistro } from './supabase';
import { empurrarExclusao, registrarExclusao } from './exclusoes';

// ---------------------------------------------------------------------------
// Status do projeto (fluxo de aprovação do FirePro Suite)
// ---------------------------------------------------------------------------

export const STATUS_INFO: Record<StatusProjeto, { descricao: string; ponto: string }> = {
  Levantamento: {
    descricao: 'Coleta de dados da edificação — projeto em elaboração',
    ponto: 'bg-slate-400',
  },
  'Em desenho': {
    descricao: 'Projeto em desenho/detalhamento, ainda não protocolado',
    ponto: 'bg-blue-400',
  },
  Protocolado: {
    descricao: 'Protocolado no Corpo de Bombeiros, aguardando distribuição',
    ponto: 'bg-violet-500',
  },
  'Em análise': {
    descricao: 'Em análise pelo Corpo de Bombeiros',
    ponto: 'bg-amber-500',
  },
  Aprovado: {
    descricao: 'Projeto aprovado / AVCB emitido',
    ponto: 'bg-emerald-500',
  },
  'Comunique-se': {
    descricao: 'O Corpo de Bombeiros apontou exigências a atender',
    ponto: 'bg-red-500',
  },
  Vencido: {
    descricao: 'AVCB vencido — é preciso solicitar a renovação',
    ponto: 'bg-red-700',
  },
};

export const TODOS_STATUS = STATUS_PROJETO;

/**
 * Status efetivo do projeto: um AVCB com validade ultrapassada torna o
 * projeto "Vencido" automaticamente, mesmo que o status salvo seja outro.
 */
export function statusEfetivo(p: Pick<DadosProjeto, 'status' | 'avcbValidade'>): StatusProjeto {
  const situacao = situacaoAvcb(p.avcbValidade);
  if (situacao.nivel === 'vencido') return 'Vencido';
  return normalizarStatus(p.status);
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

/** Carrega todos os projetos completos do usuário (para o painel de gestão). */
export function carregarTodosProjetos(ownerId?: string): DadosProjeto[] {
  return listarProjetos(ownerId)
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
  /** Dono do cliente (mesma regra multi-tenant de DadosProjeto.ownerId) */
  ownerId: string;
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

export function novoCliente(nome = '', ownerId = ''): Cliente {
  const agora = new Date().toISOString();
  return {
    id: `cli_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    ownerId,
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

/**
 * Lista os clientes do usuário. Clientes antigos (sem ownerId) continuam
 * visíveis até serem salvos de novo — mesma regra de adoção de listarProjetos.
 */
export function listarClientes(ownerId?: string): Cliente[] {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_CLIENTES) ?? '[]') as Cliente[];
    return lista
      .map((c) => ({ ...novoCliente(), ...c }))
      .filter((c) => !ownerId || !c.ownerId || c.ownerId === ownerId)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  } catch {
    return [];
  }
}

export function carregarCliente(id: string, ownerId?: string): Cliente | null {
  return listarClientes(ownerId).find((c) => c.id === id) ?? null;
}

/** Grava no cache local sem alterar atualizadoEm nem enviar à nuvem (uso interno da sincronização). */
export function gravarClienteLocal(cliente: Cliente) {
  // Sem escopo de propósito: a gravação precisa preservar os clientes de
  // outras contas que ainda estejam no cache deste navegador.
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
  // Marca a exclusão para que o cliente não volte na próxima sincronização
  const marca = registrarExclusao('clientes', id);
  void removerRegistro('clientes', id);
  void empurrarExclusao('clientes', id, marca.excluidoEm);
}

/** Remove só a cópia local, sem marcar exclusão nem tocar na nuvem (uso da sincronização). */
export function removerClienteLocal(id: string) {
  localStorage.setItem(CHAVE_CLIENTES, JSON.stringify(listarClientes().filter((c) => c.id !== id)));
}

/** Apaga o cache local de clientes (troca de conta / logout). Não toca na nuvem. */
export function limparClientesLocais() {
  localStorage.removeItem(CHAVE_CLIENTES);
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
export function projetosDoCliente(clienteId: string, ownerId?: string): DadosProjeto[] {
  return carregarTodosProjetos(ownerId).filter((p) => p.clienteId === clienteId);
}

// ---------------------------------------------------------------------------
// Portal do cliente — link somente leitura com o andamento do projeto.
//
// O link carrega APENAS o token; os dados vêm ao vivo da nuvem pela função
// public.portal_projeto. Versões anteriores embutiam o retrato inteiro no
// próprio link (parâmetro ?d=), o que tornava o acesso irrevogável: quem
// recebesse o link continuava vendo os dados mesmo depois de o token ser
// trocado. Trocar o token agora invalida de fato os links já enviados.
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

/**
 * Token do portal — 128 bits de gerador criptográfico. O endpoint é público
 * (anon tem execute em portal_projeto), então o token é a única barreira e
 * não pode ser adivinhável a partir do horário de criação.
 */
export function gerarTokenPortal(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `pt_${hex}`;
}

/** Localiza (neste navegador) o projeto associado a um token do portal. */
export function projetoPorToken(token: string, ownerId?: string): DadosProjeto | null {
  return carregarTodosProjetos(ownerId).find((p) => p.tokenPortal === token) ?? null;
}

/** Link do portal. Exige token — sem ele não há o que compartilhar. */
export function urlPortal(p: DadosProjeto): string {
  // Rotas ficam após o "#" (HashRouter)
  return `${window.location.origin}${window.location.pathname}#/portal/${p.tokenPortal}`;
}
