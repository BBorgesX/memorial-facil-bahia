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
 * tabelas ainda não criadas) são silenciosas — o dado local continua válido
 * e será reenviado na próxima sincronização.
 */
export async function empurrarRegistro(tabela: TabelaNuvem, id: string, dados: unknown) {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await supabase.from(tabela).upsert({
      id,
      user_id: data.session.user.id,
      dados,
      atualizado_em: new Date().toISOString(),
    });
  } catch {
    // sem conexão — o registro sobe na próxima sincronização
  }
}

export async function removerRegistro(tabela: TabelaNuvem, id: string) {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await supabase.from(tabela).delete().eq('id', id);
  } catch {
    // sem conexão
  }
}
