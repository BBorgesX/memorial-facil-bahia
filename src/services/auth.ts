/**
 * Camada de autenticação do FirePro Suite — Supabase Auth.
 *
 * Substitui a implementação mock/local do MVP mantendo a mesma interface
 * pública (cadastrar/entrar/sair/recuperarSenha/usuarioAtual). A conta vale
 * em qualquer dispositivo e os dados sincronizam pela nuvem (lib/sync.ts).
 */

import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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

const CHAVE_PERFIL = (userId: string) => `fps:perfil:${userId}`;

const MENSAGENS: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail: enviamos um link de confirmação para sua caixa de entrada.',
  'User already registered': 'Já existe uma conta com este e-mail.',
  'Password should be at least 6 characters.': 'A senha deve ter ao menos 6 caracteres.',
};

function traduzir(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  return new Error(MENSAGENS[msg] ?? msg);
}

export function usuarioDaSessao(sessao: Session): Usuario {
  const u = sessao.user;
  return {
    id: u.id,
    nome: (u.user_metadata?.nome as string) ?? u.email?.split('@')[0] ?? '',
    email: u.email ?? '',
    criadoEm: u.created_at,
  };
}

/**
 * Cadastro. Retorna o usuário quando a sessão abre na hora, ou null quando o
 * Supabase exige confirmação do e-mail antes do primeiro login.
 */
export async function cadastrar(nome: string, email: string, senha: string): Promise<Usuario | null> {
  if (!nome.trim()) throw new Error('Informe o seu nome.');
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: senha,
    options: { data: { nome: nome.trim() } },
  });
  if (error) throw traduzir(error);
  return data.session ? usuarioDaSessao(data.session) : null;
}

export async function entrar(email: string, senha: string): Promise<Usuario> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: senha,
  });
  if (error) throw traduzir(error);
  return usuarioDaSessao(data.session);
}

export function sair() {
  void supabase.auth.signOut();
}

/** Envia o e-mail de redefinição de senha do Supabase. */
export async function recuperarSenha(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: window.location.origin + window.location.pathname,
  });
  if (error) throw traduzir(error);
}

export async function usuarioAtual(): Promise<Usuario | null> {
  const { data } = await supabase.auth.getSession();
  return data.session ? usuarioDaSessao(data.session) : null;
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
