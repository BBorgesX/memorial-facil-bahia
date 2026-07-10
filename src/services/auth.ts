/**
 * Camada de autenticação do FirePro Suite (MVP).
 *
 * Implementação MOCK/local: usuários e sessão ficam no localStorage do
 * navegador. A interface pública (cadastrar/entrar/sair/recuperarSenha/
 * usuarioAtual) foi desenhada para ser substituída por Supabase Auth na
 * fase 2 sem alterar os componentes que a consomem.
 */

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
}

/** Perfil profissional do responsável técnico (injetado nos memoriais/ARTs). */
export interface PerfilProfissional {
  nome: string;
  titulo: string; // ex.: Engenheiro Civil, Engenheiro de Segurança
  registro: string; // CREA/RRT
  contato: string; // telefone/e-mail profissional
  ufPadrao: 'BA' | 'SP';
}

export function perfilPadrao(): PerfilProfissional {
  return { nome: '', titulo: '', registro: '', contato: '', ufPadrao: 'BA' };
}

interface UsuarioArmazenado extends Usuario {
  /** Hash simplificado da senha (mock — NUNCA usar em produção). */
  senhaHash: string;
}

const CHAVE_USUARIOS = 'fps:usuarios';
const CHAVE_SESSAO = 'fps:sessao';
const CHAVE_PERFIL = (userId: string) => `fps:perfil:${userId}`;

/** Hash mock apenas para não guardar a senha em texto puro no MVP local. */
function hashMock(senha: string): string {
  let h = 0;
  for (let i = 0; i < senha.length; i++) h = (Math.imul(31, h) + senha.charCodeAt(i)) | 0;
  return `h${h.toString(36)}${senha.length}`;
}

function lerUsuarios(): UsuarioArmazenado[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIOS) ?? '[]');
  } catch {
    return [];
  }
}

function gravarUsuarios(usuarios: UsuarioArmazenado[]) {
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

function publico(u: UsuarioArmazenado): Usuario {
  return { id: u.id, nome: u.nome, email: u.email, criadoEm: u.criadoEm };
}

export function cadastrar(nome: string, email: string, senha: string): Usuario {
  const usuarios = lerUsuarios();
  const emailNorm = email.trim().toLowerCase();
  if (!nome.trim()) throw new Error('Informe o seu nome.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailNorm)) throw new Error('E-mail inválido.');
  if (senha.length < 6) throw new Error('A senha deve ter ao menos 6 caracteres.');
  if (usuarios.some((u) => u.email === emailNorm)) throw new Error('Já existe uma conta com este e-mail.');

  const usuario: UsuarioArmazenado = {
    id: `usr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    nome: nome.trim(),
    email: emailNorm,
    criadoEm: new Date().toISOString(),
    senhaHash: hashMock(senha),
  };
  gravarUsuarios([...usuarios, usuario]);
  localStorage.setItem(CHAVE_SESSAO, usuario.id);
  return publico(usuario);
}

export function entrar(email: string, senha: string): Usuario {
  const emailNorm = email.trim().toLowerCase();
  const usuario = lerUsuarios().find((u) => u.email === emailNorm);
  if (!usuario || usuario.senhaHash !== hashMock(senha)) {
    throw new Error('E-mail ou senha incorretos.');
  }
  localStorage.setItem(CHAVE_SESSAO, usuario.id);
  return publico(usuario);
}

export function sair() {
  localStorage.removeItem(CHAVE_SESSAO);
}

/**
 * Recuperação de senha (mock): redefine a senha diretamente.
 * Na fase 2 será substituído pelo fluxo de e-mail do Supabase Auth.
 */
export function recuperarSenha(email: string, novaSenha: string) {
  const emailNorm = email.trim().toLowerCase();
  const usuarios = lerUsuarios();
  const usuario = usuarios.find((u) => u.email === emailNorm);
  if (!usuario) throw new Error('Nenhuma conta encontrada com este e-mail.');
  if (novaSenha.length < 6) throw new Error('A nova senha deve ter ao menos 6 caracteres.');
  usuario.senhaHash = hashMock(novaSenha);
  gravarUsuarios(usuarios);
}

export function usuarioAtual(): Usuario | null {
  const id = localStorage.getItem(CHAVE_SESSAO);
  if (!id) return null;
  const usuario = lerUsuarios().find((u) => u.id === id);
  return usuario ? publico(usuario) : null;
}

export function carregarPerfil(userId: string): PerfilProfissional {
  try {
    const bruto = localStorage.getItem(CHAVE_PERFIL(userId));
    return bruto ? { ...perfilPadrao(), ...JSON.parse(bruto) } : perfilPadrao();
  } catch {
    return perfilPadrao();
  }
}

export function salvarPerfil(userId: string, perfil: PerfilProfissional) {
  localStorage.setItem(CHAVE_PERFIL(userId), JSON.stringify(perfil));
}
