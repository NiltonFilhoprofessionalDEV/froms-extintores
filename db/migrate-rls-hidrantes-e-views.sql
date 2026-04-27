-- Remove o aviso UNRESTRICTED na tabela `hidrantes` (RLS + leitura pública).
-- A chave `service_role` continua ignorando RLS (import admin).
--
-- Nota: o painel não usa mais views `vw_*` (ver migrate-painel-status-rpc.sql).
--
-- Execute no SQL Editor do Supabase.

alter table public.hidrantes enable row level security;

drop policy if exists "app_public_select_hidrantes" on public.hidrantes;
create policy "app_public_select_hidrantes"
  on public.hidrantes
  for select
  to public
  using (true);
