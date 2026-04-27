-- Resumo da última inspeção com não conforme (tela de correção; mesma regra do painel, qualquer mês).
-- SECURITY DEFINER: leitura pontual sem abrir SELECT público em toda a tabela de inspeções.
-- Execute no SQL Editor do Supabase após o deploy do app.

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
