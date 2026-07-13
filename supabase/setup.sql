-- ============================================================================
-- Memorial Fácil Bahia — configuração do banco no Supabase
--
-- COMO USAR: no painel do Supabase, abra "SQL Editor" (ícone </> no menu
-- lateral), cole este arquivo inteiro e clique em RUN. Pode rodar mais de
-- uma vez sem problema.
-- ============================================================================

-- Tabelas: cada registro guarda o documento completo em JSON (mesmo formato
-- usado no navegador), o que mantém a migração e a sincronização simples.

create table if not exists public.projetos (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.clientes (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);

create index if not exists projetos_user_idx on public.projetos (user_id);
create index if not exists clientes_user_idx on public.clientes (user_id);
create index if not exists projetos_token_idx on public.projetos ((dados ->> 'tokenPortal'));

-- Segurança (RLS): cada usuário só enxerga e altera os próprios registros.

alter table public.projetos enable row level security;
alter table public.clientes enable row level security;

drop policy if exists "projetos_proprios" on public.projetos;
create policy "projetos_proprios" on public.projetos
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "clientes_proprios" on public.clientes;
create policy "clientes_proprios" on public.clientes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Portal do cliente: função pública que devolve SOMENTE os campos de
-- acompanhamento do projeto cujo token do portal for informado. É o que
-- permite ao cliente ver o andamento ao vivo sem ter conta.

create or replace function public.portal_projeto(token_busca text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'nome',            dados ->> 'nome',
    'municipio',       dados ->> 'municipio',
    'empresa',         dados ->> 'empresa',
    'respTecnicoNome', dados ->> 'respTecnicoNome',
    'status',          coalesce(dados ->> 'status', 'rascunho'),
    'protocoloCBMBA',  dados ->> 'protocoloCBMBA',
    'dataProtocolo',   dados ->> 'dataProtocolo',
    'avcbNumero',      dados ->> 'avcbNumero',
    'avcbEmissao',     dados ->> 'avcbEmissao',
    'avcbValidade',    dados ->> 'avcbValidade',
    'exigencias',      coalesce(dados -> 'exigencias', '[]'::jsonb),
    'historico',       coalesce(dados -> 'historico', '[]'::jsonb),
    'geradoEm',        atualizado_em
  )
  from public.projetos
  where token_busca <> '' and dados ->> 'tokenPortal' = token_busca
  limit 1;
$$;

revoke all on function public.portal_projeto(text) from public;
grant execute on function public.portal_projeto(text) to anon, authenticated;
