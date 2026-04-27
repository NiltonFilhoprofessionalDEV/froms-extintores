-- Execute no Supabase (SQL Editor) para criar cadastro e inspeções de hidrantes.

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
