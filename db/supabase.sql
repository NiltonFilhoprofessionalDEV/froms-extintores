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
  observacoes text not null default '',
  pergunta_1 text not null check (pergunta_1 in ('conforme', 'nao_conforme', 'na')),
  pergunta_2 text not null check (pergunta_2 in ('conforme', 'nao_conforme', 'na')),
  pergunta_3 text not null check (pergunta_3 in ('conforme', 'nao_conforme', 'na')),
  pergunta_4 text not null check (pergunta_4 in ('conforme', 'nao_conforme', 'na')),
  pergunta_5 text not null check (pergunta_5 in ('conforme', 'nao_conforme', 'na')),
  pergunta_6 text not null check (pergunta_6 in ('conforme', 'nao_conforme', 'na')),
  pergunta_7 text not null check (pergunta_7 in ('conforme', 'nao_conforme', 'na')),
  pergunta_8 text not null check (pergunta_8 in ('conforme', 'nao_conforme', 'na'))
);

-- View da Tela 1: última inspeção do mês/ano atual por extintor.
-- Permite várias inspeções no mês; vale sempre a mais recente.
-- pendente = sem inspeção no mês | conforme = última sem itens "não conforme" | nao_conforme = última com algum "não conforme"
--
-- Se a view já existia com outra coluna (ex.: status_inspecionado_mes), use DROP antes de CREATE.
drop view if exists public.vw_extintores_status_mes;

create view public.vw_extintores_status_mes as
with ultima_inspecao_mes as (
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
  where extract(month from i.data_inspecao) = extract(month from now())
    and extract(year from i.data_inspecao) = extract(year from now())
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
left join ultima_inspecao_mes u on u.extintor_id = e.codigo
order by e.codigo;
