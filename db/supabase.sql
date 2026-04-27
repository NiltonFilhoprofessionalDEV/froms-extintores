-- Tabelas base
create table if not exists public.extintores (
  codigo text primary key,
  pavimento text not null,
  local text not null,
  n_inmetro text not null,
  tipo text not null,
  tamanho text not null,
  capacidade text not null,
  vencimento_nivel_2 date not null,
  vencimento_nivel_3 date not null
);

create table if not exists public.inspecoes (
  id uuid primary key default gen_random_uuid(),
  extintor_id text not null references public.extintores(codigo),
  data_inspecao timestamp with time zone not null default now(),
  conferente text not null,
  equipe text not null check (equipe in ('ALFA', 'BRAVO', 'CHARLIE', 'DELTA')),
  observacoes text not null default '',
  pergunta_1 text not null check (pergunta_1 in ('conforme', 'nao_conforme', 'na')),
  pergunta_2 text not null check (pergunta_2 in ('conforme', 'nao_conforme', 'na')),
  pergunta_3 text not null check (pergunta_3 in ('conforme', 'nao_conforme', 'na')),
  pergunta_4 text not null check (pergunta_4 in ('conforme', 'nao_conforme', 'na')),
  pergunta_5 text not null check (pergunta_5 in ('conforme', 'nao_conforme', 'na')),
  pergunta_6 text not null check (pergunta_6 in ('conforme', 'nao_conforme', 'na')),
  pergunta_7 text not null check (pergunta_7 in ('conforme', 'nao_conforme', 'na')),
  pergunta_8 text not null check (pergunta_8 in ('conforme', 'nao_conforme', 'na')),
  justificativa_nc_1 text not null default '',
  justificativa_nc_2 text not null default '',
  justificativa_nc_3 text not null default '',
  justificativa_nc_4 text not null default '',
  justificativa_nc_5 text not null default '',
  justificativa_nc_6 text not null default '',
  justificativa_nc_7 text not null default '',
  justificativa_nc_8 text not null default ''
);

-- Painel: última inspeção de cada equipamento (qualquer data).
-- pendente = nunca inspecionado | conforme = última sem NC | nao_conforme = última com NC (vermelho até nova inspeção sem NC, mesmo virando o mês).
--
-- RPC do painel (evita views UNRESTRICTED no editor; RLS das tabelas base continua valendo).
drop view if exists public.vw_extintores_status_mes;

create or replace function public.painel_extintores_status_mes()
returns table(codigo text, status_mes text)
language sql
stable
security invoker
set search_path = public
as $$
  with ultima_inspecao as (
    select distinct on (i.extintor_id)
      i.extintor_id,
      (
        i.pergunta_1 = 'nao_conforme'
        or i.pergunta_2 = 'nao_conforme'
        or i.pergunta_3 = 'nao_conforme'
        or i.pergunta_4 = 'nao_conforme'
        or i.pergunta_5 = 'nao_conforme'
        or i.pergunta_6 = 'nao_conforme'
        or i.pergunta_7 = 'nao_conforme'
        or i.pergunta_8 = 'nao_conforme'
      ) as tem_nao_conforme
    from public.inspecoes i
    order by i.extintor_id, i.data_inspecao desc, i.id desc
  )
  select
    e.codigo,
    case
      when u.extintor_id is null then 'pendente'
      when u.tem_nao_conforme then 'nao_conforme'
      else 'conforme'
    end::text as status_mes
  from public.extintores e
  left join ultima_inspecao u on u.extintor_id = e.codigo
  order by e.codigo;
$$;

grant execute on function public.painel_extintores_status_mes() to anon;
grant execute on function public.painel_extintores_status_mes() to authenticated;

-- Hidrantes — padrão da planilha de importação (CÓDIGO … QUANTIDADE DE ESGUICHO)
create table if not exists public.hidrantes (
  codigo text primary key,
  pavimento text not null,
  local_detalhado text not null,
  quantidade_mangueiras integer not null check (quantidade_mangueiras >= 0),
  data_teste_hidrostatico_m1 date,
  data_teste_hidrostatico_m2 date,
  data_teste_hidrostatico_m3 date,
  data_teste_hidrostatico_m4 date,
  quantidade_chaves_storz integer not null check (quantidade_chaves_storz >= 0),
  quantidade_esguicho integer not null check (quantidade_esguicho >= 0)
);

create table if not exists public.inspecoes_hidrantes (
  id uuid primary key default gen_random_uuid(),
  hidrante_id text not null references public.hidrantes(codigo),
  data_inspecao timestamp with time zone not null default now(),
  conferente text not null,
  equipe text not null check (equipe in ('ALFA', 'BRAVO', 'CHARLIE', 'DELTA')),
  observacoes text not null default '',
  pergunta_1 text not null check (pergunta_1 in ('conforme', 'nao_conforme', 'na')),
  pergunta_2 text not null check (pergunta_2 in ('conforme', 'nao_conforme', 'na')),
  pergunta_3 text not null check (pergunta_3 in ('conforme', 'nao_conforme', 'na')),
  pergunta_4 text not null check (pergunta_4 in ('conforme', 'nao_conforme', 'na')),
  pergunta_5 text not null check (pergunta_5 in ('conforme', 'nao_conforme', 'na')),
  pergunta_6 text not null check (pergunta_6 in ('conforme', 'nao_conforme', 'na')),
  pergunta_7 text not null check (pergunta_7 in ('conforme', 'nao_conforme', 'na')),
  pergunta_8 text not null check (pergunta_8 in ('conforme', 'nao_conforme', 'na')),
  justificativa_nc_1 text not null default '',
  justificativa_nc_2 text not null default '',
  justificativa_nc_3 text not null default '',
  justificativa_nc_4 text not null default '',
  justificativa_nc_5 text not null default '',
  justificativa_nc_6 text not null default '',
  justificativa_nc_7 text not null default '',
  justificativa_nc_8 text not null default ''
);

drop view if exists public.vw_hidrantes_status_mes;

create or replace function public.painel_hidrantes_status_mes()
returns table(codigo text, status_mes text)
language sql
stable
security invoker
set search_path = public
as $$
  with ultima_inspecao as (
    select distinct on (i.hidrante_id)
      i.hidrante_id,
      (
        i.pergunta_1 = 'nao_conforme'
        or i.pergunta_2 = 'nao_conforme'
        or i.pergunta_3 = 'nao_conforme'
        or i.pergunta_4 = 'nao_conforme'
        or i.pergunta_5 = 'nao_conforme'
        or i.pergunta_6 = 'nao_conforme'
        or i.pergunta_7 = 'nao_conforme'
        or i.pergunta_8 = 'nao_conforme'
      ) as tem_nao_conforme
    from public.inspecoes_hidrantes i
    order by i.hidrante_id, i.data_inspecao desc, i.id desc
  )
  select
    h.codigo,
    case
      when u.hidrante_id is null then 'pendente'
      when u.tem_nao_conforme then 'nao_conforme'
      else 'conforme'
    end::text as status_mes
  from public.hidrantes h
  left join ultima_inspecao u on u.hidrante_id = h.codigo
  order by h.codigo;
$$;

grant execute on function public.painel_hidrantes_status_mes() to anon;
grant execute on function public.painel_hidrantes_status_mes() to authenticated;

-- Resumo da última inspeção com NC (abre ao clicar célula vermelha; mesma regra do painel, qualquer mês).
create or replace function public.resumo_ultima_inspecao_nc_extintor(p_codigo text)
returns table (
  id uuid,
  data_inspecao timestamptz,
  conferente text,
  equipe text,
  observacoes text,
  pergunta_1 text,
  pergunta_2 text,
  pergunta_3 text,
  pergunta_4 text,
  pergunta_5 text,
  pergunta_6 text,
  pergunta_7 text,
  pergunta_8 text,
  justificativa_nc_1 text,
  justificativa_nc_2 text,
  justificativa_nc_3 text,
  justificativa_nc_4 text,
  justificativa_nc_5 text,
  justificativa_nc_6 text,
  justificativa_nc_7 text,
  justificativa_nc_8 text
)
language sql
stable
security definer
set search_path = public
as $$
  with ultima as (
    select
      i.id,
      i.data_inspecao,
      i.conferente,
      i.equipe,
      i.observacoes,
      i.pergunta_1,
      i.pergunta_2,
      i.pergunta_3,
      i.pergunta_4,
      i.pergunta_5,
      i.pergunta_6,
      i.pergunta_7,
      i.pergunta_8,
      i.justificativa_nc_1,
      i.justificativa_nc_2,
      i.justificativa_nc_3,
      i.justificativa_nc_4,
      i.justificativa_nc_5,
      i.justificativa_nc_6,
      i.justificativa_nc_7,
      i.justificativa_nc_8
    from public.inspecoes i
    where i.extintor_id = p_codigo
    order by i.data_inspecao desc, i.id desc
    limit 1
  )
  select u.*
  from ultima u
  where
    u.pergunta_1 = 'nao_conforme'
    or u.pergunta_2 = 'nao_conforme'
    or u.pergunta_3 = 'nao_conforme'
    or u.pergunta_4 = 'nao_conforme'
    or u.pergunta_5 = 'nao_conforme'
    or u.pergunta_6 = 'nao_conforme'
    or u.pergunta_7 = 'nao_conforme'
    or u.pergunta_8 = 'nao_conforme';
$$;

create or replace function public.resumo_ultima_inspecao_nc_hidrante(p_codigo text)
returns table (
  id uuid,
  data_inspecao timestamptz,
  conferente text,
  equipe text,
  observacoes text,
  pergunta_1 text,
  pergunta_2 text,
  pergunta_3 text,
  pergunta_4 text,
  pergunta_5 text,
  pergunta_6 text,
  pergunta_7 text,
  pergunta_8 text,
  justificativa_nc_1 text,
  justificativa_nc_2 text,
  justificativa_nc_3 text,
  justificativa_nc_4 text,
  justificativa_nc_5 text,
  justificativa_nc_6 text,
  justificativa_nc_7 text,
  justificativa_nc_8 text
)
language sql
stable
security definer
set search_path = public
as $$
  with ultima as (
    select
      i.id,
      i.data_inspecao,
      i.conferente,
      i.equipe,
      i.observacoes,
      i.pergunta_1,
      i.pergunta_2,
      i.pergunta_3,
      i.pergunta_4,
      i.pergunta_5,
      i.pergunta_6,
      i.pergunta_7,
      i.pergunta_8,
      i.justificativa_nc_1,
      i.justificativa_nc_2,
      i.justificativa_nc_3,
      i.justificativa_nc_4,
      i.justificativa_nc_5,
      i.justificativa_nc_6,
      i.justificativa_nc_7,
      i.justificativa_nc_8
    from public.inspecoes_hidrantes i
    where i.hidrante_id = p_codigo
    order by i.data_inspecao desc, i.id desc
    limit 1
  )
  select u.*
  from ultima u
  where
    u.pergunta_1 = 'nao_conforme'
    or u.pergunta_2 = 'nao_conforme'
    or u.pergunta_3 = 'nao_conforme'
    or u.pergunta_4 = 'nao_conforme'
    or u.pergunta_5 = 'nao_conforme'
    or u.pergunta_6 = 'nao_conforme'
    or u.pergunta_7 = 'nao_conforme'
    or u.pergunta_8 = 'nao_conforme';
$$;

grant execute on function public.resumo_ultima_inspecao_nc_extintor(text) to anon;
grant execute on function public.resumo_ultima_inspecao_nc_extintor(text) to authenticated;
grant execute on function public.resumo_ultima_inspecao_nc_hidrante(text) to anon;
grant execute on function public.resumo_ultima_inspecao_nc_hidrante(text) to authenticated;

-- RLS em hidrantes (views não suportam ENABLE RLS neste Postgres — ver migrate-rls-hidrantes-e-views.sql).
alter table public.hidrantes enable row level security;
drop policy if exists "app_public_select_hidrantes" on public.hidrantes;
create policy "app_public_select_hidrantes"
  on public.hidrantes
  for select
  to public
  using (true);
