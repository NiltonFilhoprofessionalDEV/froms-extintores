-- Execute no SQL Editor do Supabase se você já tinha a view antiga (boolean).
-- Substitui por status_mes: pendente | conforme | nao_conforme (última inspeção do mês).
--
-- O Postgres não permite CREATE OR REPLACE VIEW ao renomear colunas da view;
-- por isso é preciso DROP e CREATE.

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
