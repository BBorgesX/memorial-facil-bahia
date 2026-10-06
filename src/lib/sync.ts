/**
 * Sincronização entre o cache local (localStorage) e a nuvem (Supabase).
 *
 * Executada no login e ao abrir o app: baixa os registros da nuvem, mescla
 * com os locais (vence quem tem atualizadoEm mais recente) e sobe o que só
 * existe neste navegador. Registros sem dono (criados antes de o login
 * existir) são adotados pela conta e migrados automaticamente.
 *
 * Exclusões: um registro apagado em qualquer dispositivo deixa uma marca
 * (lib/exclusoes.ts) que é respeitada nos dois sentidos do merge — é o que
 * impede o registro de "ressuscitar" vindo do outro dispositivo. A edição só
 * vence a exclusão quando é posterior a ela.
 */

import { supabase, empurrarRegistro, removerRegistro } from './supabase';
import {
  DadosProjeto,
  carregarProjeto,
  gravarProjetoLocal,
  listarProjetos,
  novoProjeto,
  removerProjetoLocal,
} from './projeto';
import {
  Cliente,
  gravarClienteLocal,
  listarClientes,
  novoCliente,
  removerClienteLocal,
} from './gestao';
import {
  absorverExclusoes,
  baixarExclusoes,
  empurrarExclusao,
  listarExclusoes,
  mapaExclusoes,
  revogarExclusao,
  type TabelaSincronizada,
} from './exclusoes';

/**
 * @returns true quando a sincronização completou. false significa que os
 * dados locais NÃO estão garantidos na nuvem (offline, sessão ausente, erro
 * de consulta) — quem for apagar o cache local depende dessa resposta.
 */
export async function sincronizarTudo(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return false;
  const uid = data.session.user.id;

  try {
    const [proj, cli] = await Promise.all([
      supabase.from('projetos').select('id, dados'),
      supabase.from('clientes').select('id, dados'),
    ]);
    // Consulta que falhou NÃO é "a nuvem está vazia": seguir daqui empurraria
    // o cache local inteiro por cima de dados que podem estar íntegros lá.
    if (proj.error || cli.error) return false;

    // --- Exclusões (antes de tudo: definem o que nem deve ser mesclado) ---
    const exclusoesRemotas = await baixarExclusoes();
    absorverExclusoes(exclusoesRemotas);
    const excluidos = mapaExclusoes();

    /** A exclusão vence enquanto for igual ou posterior à edição do registro. */
    const foiExcluido = (tabela: TabelaSincronizada, id: string, atualizadoEm: string) => {
      const excluidoEm = excluidos.get(`${tabela}:${id}`);
      return !!excluidoEm && atualizadoEm <= excluidoEm;
    };

    // --- Projetos ---
    const projetosRemotos = new Map<string, DadosProjeto>(
      (proj.data ?? []).map((r) => [r.id as string, { ...novoProjeto(), ...(r.dados as DadosProjeto) }])
    );
    for (const remoto of projetosRemotos.values()) {
      if (foiExcluido('projetos', remoto.id, remoto.atualizadoEm)) {
        // Apagado em outro dispositivo: some da nuvem, não desce para cá
        void removerRegistro('projetos', remoto.id);
        projetosRemotos.delete(remoto.id);
        continue;
      }
      // Editado depois de apagado — a edição vence e a marca deixa de valer
      if (excluidos.has(`projetos:${remoto.id}`)) {
        revogarExclusao('projetos', remoto.id);
        excluidos.delete(`projetos:${remoto.id}`);
      }
      const local = carregarProjeto(remoto.id);
      if (!local || local.atualizadoEm < remoto.atualizadoEm) gravarProjetoLocal(remoto);
    }
    // listarProjetos(uid) inclui projetos sem dono — eles são adotados aqui
    for (const resumo of listarProjetos(uid)) {
      let local = carregarProjeto(resumo.id);
      if (!local) continue;
      if (foiExcluido('projetos', local.id, local.atualizadoEm)) {
        // Apagado em outro dispositivo depois desta cópia: apaga aqui também
        removerProjetoLocal(local.id);
        continue;
      }
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
      if (foiExcluido('clientes', remoto.id, remoto.atualizadoEm)) {
        void removerRegistro('clientes', remoto.id);
        clientesRemotos.delete(remoto.id);
        continue;
      }
      if (excluidos.has(`clientes:${remoto.id}`)) {
        revogarExclusao('clientes', remoto.id);
        excluidos.delete(`clientes:${remoto.id}`);
      }
      const local = listarClientes().find((c) => c.id === remoto.id);
      if (!local || local.atualizadoEm < remoto.atualizadoEm) {
        // O RLS garante que só chega aqui cliente desta conta
        gravarClienteLocal({ ...remoto, ownerId: remoto.ownerId || uid });
      }
    }
    // Escopo: só os clientes desta conta (ou sem dono, que são adotados).
    // Sem esse filtro, os clientes de outra conta no mesmo navegador subiriam
    // para a nuvem sob este user_id.
    for (const local of listarClientes(uid)) {
      if (foiExcluido('clientes', local.id, local.atualizadoEm)) {
        removerClienteLocal(local.id);
        continue;
      }
      const adotado = local.ownerId ? local : { ...local, ownerId: uid };
      if (!local.ownerId) gravarClienteLocal(adotado);
      const remoto = clientesRemotos.get(local.id);
      if (!remoto || remoto.atualizadoEm < adotado.atualizadoEm) {
        await empurrarRegistro('clientes', adotado.id, adotado);
      }
    }

    // --- Sobe as exclusões que só existem neste dispositivo ---
    const jaNaNuvem = new Set(exclusoesRemotas.map((e) => `${e.tabela}:${e.id}`));
    for (const e of listarExclusoes()) {
      if (!jaNaNuvem.has(`${e.tabela}:${e.id}`)) {
        await empurrarExclusao(e.tabela, e.id, e.excluidoEm);
      }
    }

    return true;
  } catch {
    // Sem conexão ou tabelas ainda não criadas — o app segue com os dados locais.
    return false;
  }
}
