-- Painéis: funções RPC (substituem views). Status pela ÚLTIMA inspeção (qualquer mês):
-- vermelho permanece até nova inspeção sem itens não conformes.
-- SECURITY INVOKER: RLS nas tabelas base continua valendo.
--
-- Faça deploy do app e execute no SQL Editor do Supabase.

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

grant execute on function public.painel_extintores_status_mes() to anon;
grant execute on function public.painel_extintores_status_mes() to authenticated;
grant execute on function public.painel_hidrantes_status_mes() to anon;
grant execute on function public.painel_hidrantes_status_mes() to authenticated;

drop view if exists public.vw_hidrantes_status_mes;
drop view if exists public.vw_extintores_status_mes;
