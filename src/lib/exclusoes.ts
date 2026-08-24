/**
 * Registro de exclusões (tombstones).
 *
 * Apagar um registro só localmente não basta: o outro dispositivo ainda tem a
 * cópia dele e a reenvia na sincronização seguinte, "ressuscitando" o que o
 * usuário apagou. Aqui guardamos a data da exclusão — local e na nuvem — e a
 * sincronização respeita esse registro nos dois sentidos do merge.
 *
 * A exclusão vence a edição quando é mais recente ou igual: se o registro foi
 * editado em outro dispositivo DEPOIS de apagado aqui, a edição prevalece e a
 * exclusão é descartada.
 */

import { supabase } from './supabase';

export type TabelaSincronizada = 'projetos' | 'clientes';

export interface Exclusao {
  tabela: TabelaSincronizada;
  id: string;
  excluidoEm: string;
}

const CHAVE_EXCLUSOES = 'mfb:excluidos';

const chave = (tabela: TabelaSincronizada, id: string) => `${tabela}:${id}`;

export function listarExclusoes(): Exclusao[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_EXCLUSOES) ?? '[]') as Exclusao[];
  } catch {
    return [];
  }
}

/** Mapa "tabela:id" → data da exclusão, para consulta rápida durante o merge. */
export function mapaExclusoes(extras: Exclusao[] = []): Map<string, string> {
  const mapa = new Map<string, string>();
  for (const e of [...listarExclusoes(), ...extras]) {
    const atual = mapa.get(chave(e.tabela, e.id));
    // Guarda sempre a exclusão mais recente conhecida para o mesmo registro
    if (!atual || atual < e.excluidoEm) mapa.set(chave(e.tabela, e.id), e.excluidoEm);
  }
  return mapa;
}

function gravarExclusoes(lista: Exclusao[]) {
  localStorage.setItem(CHAVE_EXCLUSOES, JSON.stringify(lista));
}

/** Marca um registro como excluído neste dispositivo. */
export function registrarExclusao(tabela: TabelaSincronizada, id: string): Exclusao {
  const marca: Exclusao = { tabela, id, excluidoEm: new Date().toISOString() };
  const lista = listarExclusoes().filter((e) => chave(e.tabela, e.id) !== chave(tabela, id));
  lista.push(marca);
  gravarExclusoes(lista);
  return marca;
}

/** Guarda exclusões vindas da nuvem sem sobrescrever datas locais mais recentes. */
export function absorverExclusoes(remotas: Exclusao[]) {
  if (!remotas.length) return;
  const mapa = mapaExclusoes(remotas);
  gravarExclusoes(
    [...mapa.entries()].map(([k, excluidoEm]) => {
      const [tabela, id] = [k.slice(0, k.indexOf(':')), k.slice(k.indexOf(':') + 1)];
      return { tabela: tabela as TabelaSincronizada, id, excluidoEm };
    })
  );
}

/**
 * Descarta a exclusão de um registro — usado quando o registro é recriado
 * (importação, restauração) ou quando uma edição remota mais recente vence.
 */
export function revogarExclusao(tabela: TabelaSincronizada, id: string) {
  gravarExclusoes(listarExclusoes().filter((e) => chave(e.tabela, e.id) !== chave(tabela, id)));
}

export function limparExclusoesLocais() {
  localStorage.removeItem(CHAVE_EXCLUSOES);
}

// ---------------------------------------------------------------------------
// Nuvem — tabela public.exclusoes (ver supabase/setup.sql)
// ---------------------------------------------------------------------------

/** Publica a exclusão na nuvem para os outros dispositivos da mesma conta. */
export async function empurrarExclusao(tabela: TabelaSincronizada, id: string, excluidoEm: string) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;
  await supabase
    .from('exclusoes')
    .upsert(
      { tabela, id, user_id: data.session.user.id, excluido_em: excluidoEm },
      { onConflict: 'user_id,tabela,id' }
    );
}

export async function baixarExclusoes(): Promise<Exclusao[]> {
  const { data, error } = await supabase.from('exclusoes').select('tabela, id, excluido_em');
  if (error || !data) return [];
  return data.map((r) => ({
    tabela: r.tabela as TabelaSincronizada,
    id: r.id as string,
    excluidoEm: r.excluido_em as string,
  }));
}
