/**
 * Sincronização entre o cache local (localStorage) e a nuvem (Supabase).
 *
 * Executada no login e ao abrir o app: baixa os registros da nuvem, mescla
 * com os locais (vence quem tem atualizadoEm mais recente) e sobe o que só
 * existe neste navegador. Projetos antigos sem dono (criados antes do login
 * existir) são adotados pela conta e migrados automaticamente.
 */

import { supabase, empurrarRegistro } from './supabase';
import {
  DadosProjeto,
  carregarProjeto,
  gravarProjetoLocal,
  listarProjetos,
  novoProjeto,
} from './projeto';
import { Cliente, gravarClienteLocal, listarClientes, novoCliente } from './gestao';

export async function sincronizarTudo(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;
  const uid = data.session.user.id;

  try {
    const [proj, cli] = await Promise.all([
      supabase.from('projetos').select('id, dados'),
      supabase.from('clientes').select('id, dados'),
    ]);

    // --- Projetos ---
    const projetosRemotos = new Map<string, DadosProjeto>(
      (proj.data ?? []).map((r) => [r.id as string, { ...novoProjeto(), ...(r.dados as DadosProjeto) }])
    );
    for (const remoto of projetosRemotos.values()) {
      const local = carregarProjeto(remoto.id);
      if (!local || local.atualizadoEm < remoto.atualizadoEm) gravarProjetoLocal(remoto);
    }
    // listarProjetos(uid) inclui projetos sem dono — eles são adotados aqui
    for (const resumo of listarProjetos(uid)) {
      let local = carregarProjeto(resumo.id);
      if (!local) continue;
      if (!local.ownerId) {
        local = { ...local, ownerId: uid };
        gravarProjetoLocal(local);
      }
      const remoto = projetosRemotos.get(resumo.id);
      if (!remoto || remoto.atualizadoEm < local.atualizadoEm) {
        await empurrarRegistro('projetos', local.id, local);
      }
    }

    // --- Clientes ---
    const clientesRemotos = new Map<string, Cliente>(
      (cli.data ?? []).map((r) => [r.id as string, { ...novoCliente(), ...(r.dados as Cliente) }])
    );
    for (const remoto of clientesRemotos.values()) {
      const local = listarClientes().find((c) => c.id === remoto.id);
      if (!local || local.atualizadoEm < remoto.atualizadoEm) gravarClienteLocal(remoto);
    }
    for (const local of listarClientes()) {
      const remoto = clientesRemotos.get(local.id);
      if (!remoto || remoto.atualizadoEm < local.atualizadoEm) {
        await empurrarRegistro('clientes', local.id, local);
      }
    }
  } catch {
    // Sem conexão ou tabelas ainda não criadas — o app segue com os dados locais.
  }
}
