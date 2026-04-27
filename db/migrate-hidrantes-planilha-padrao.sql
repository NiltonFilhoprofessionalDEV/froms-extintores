-- Migração: substitui o cadastro antigo de hidrantes pelo padrão da planilha oficial.
-- ATENÇÃO: apaga a tabela `hidrantes` e recria. Linhas em `inspecoes_hidrantes` que
-- referenciem códigos inexistentes após o import impedirão a recriação da FK até
-- você truncar ou ajustar. Recomendado em ambiente de teste ou após backup.
--
-- Passos:
-- 1) (Opcional) truncate table public.inspecoes_hidrantes;
-- 2) Execute o bloco abaixo.

drop view if exists public.vw_hidrantes_status_mes;

-- CASCADE remove a FK de inspecoes_hidrantes para hidrantes (a tabela de inspeções permanece).
drop table if exists public.hidrantes cascade;

create table public.hidrantes (
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

alter table public.inspecoes_hidrantes
  add constraint inspecoes_hidrantes_hidrante_id_fkey
  foreign key (hidrante_id) references public.hidrantes (codigo);

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
