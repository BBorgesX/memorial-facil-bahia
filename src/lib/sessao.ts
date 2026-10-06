/**
 * Ciclo de vida do cache local em relação à conta logada.
 *
 * O localStorage é compartilhado por todas as contas que usarem o mesmo
 * navegador. Sem limpeza, os dados de quem saiu continuam na máquina de quem
 * entrou depois. Aqui está a regra: o cache pertence a UMA conta por vez.
 *
 * O perfil do responsável técnico (fps:perfil:<uid>) é preservado de
 * propósito — já é isolado por conta e hoje é a única cópia existente, porque
 * ele ainda não sincroniza com a nuvem.
 */

import { limparProjetosLocais } from './projeto';
import { limparClientesLocais } from './gestao';
import { limparExclusoesLocais } from './exclusoes';
import { sincronizarTudo } from './sync';
import { sair as encerrarNoSupabase } from '@/services/auth';

const CHAVE_ULTIMO_USUARIO = 'fps:ultimoUsuario';

/** Remove do navegador os dados de projeto/cliente da conta anterior. */
export function limparDadosLocais() {
  limparProjetosLocais();
  limparClientesLocais();
  limparExclusoesLocais();
  for (const chave of Object.keys(localStorage)) {
    if (chave.startsWith('fps:ativo:')) localStorage.removeItem(chave);
  }
}

/**
 * Chamado no login. Se a conta mudou desde a última sessão neste navegador,
 * o cache da conta anterior é apagado antes de qualquer leitura.
 */
export function prepararCacheParaUsuario(uid: string) {
  const anterior = localStorage.getItem(CHAVE_ULTIMO_USUARIO);
  if (anterior && anterior !== uid) limparDadosLocais();
  localStorage.setItem(CHAVE_ULTIMO_USUARIO, uid);
}

/**
 * Encerra a sessão. Antes de limpar o cache, tenta garantir na nuvem tudo o
 * que só existe neste navegador — se a sincronização falhar (offline), o
 * cache é PRESERVADO para não perder trabalho, e sairá daqui assim que outra
 * conta entrar (prepararCacheParaUsuario).
 */
export async function encerrarSessao(): Promise<void> {
  const sincronizado = await sincronizarTudo();
  if (sincronizado) {
    limparDadosLocais();
    localStorage.removeItem(CHAVE_ULTIMO_USUARIO);
  }
  encerrarNoSupabase();
}
