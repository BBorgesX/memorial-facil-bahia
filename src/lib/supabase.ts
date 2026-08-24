/**
 * Conexão com o Supabase (banco de dados na nuvem + autenticação).
 *
 * A chave abaixo é a chave PUBLICÁVEL (publishable/anon) — ela é pública por
 * design e pode ficar no código do site. A proteção dos dados é feita pelas
 * regras de segurança (RLS) do banco, criadas pelo script supabase/setup.sql.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://ipdtwwcjopiejcbrqpor.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_HHvLynvfYT8naABxZP9xfA_POn5YHa_';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type TabelaNuvem = 'projetos' | 'clientes';

/**
 * Envia um registro para a nuvem em segundo plano. Falhas (sem internet,
 * tabelas ainda não criadas) não interrompem o app — o dado local continua
 * válido e será reenviado na próxima sincronização.
 *
 * @returns true quando o registro chegou à nuvem. As chamadas em
 * fire-and-forget ignoram o retorno; a sincronização o usa para saber se pode
 * considerar o dado local já garantido lá.
 */
export async function empurrarRegistro(
  tabela: TabelaNuvem,
  id: string,
  dados: unknown
): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return false;
    // supabase-js não lança em erro de banco: o erro vem no retorno
    const { error } = await supabase.from(tabela).upsert({
      id,
      user_id: data.session.user.id,
      dados,
      atualizado_em: new Date().toISOString(),
    });
    return !error;
  } catch {
    // sem conexão — o registro sobe na próxima sincronização
    return false;
  }
}

export async function removerRegistro(tabela: TabelaNuvem, id: string): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return false;
    // O RLS já restringe ao dono; o filtro explícito é defesa em profundidade
    const { error } = await supabase
      .from(tabela)
      .delete()
      .eq('id', id)
      .eq('user_id', data.session.user.id);
    return !error;
  } catch {
    // sem conexão
    return false;
  }
}
