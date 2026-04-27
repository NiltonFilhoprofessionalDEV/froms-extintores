-- Justificativas obrigatórias no app quando a pergunta for "não conforme".
-- Execute no SQL Editor do Supabase.

alter table public.inspecoes add column if not exists justificativa_nc_1 text not null default '';
alter table public.inspecoes add column if not exists justificativa_nc_2 text not null default '';
alter table public.inspecoes add column if not exists justificativa_nc_3 text not null default '';
alter table public.inspecoes add column if not exists justificativa_nc_4 text not null default '';
alter table public.inspecoes add column if not exists justificativa_nc_5 text not null default '';
alter table public.inspecoes add column if not exists justificativa_nc_6 text not null default '';
alter table public.inspecoes add column if not exists justificativa_nc_7 text not null default '';
alter table public.inspecoes add column if not exists justificativa_nc_8 text not null default '';

alter table public.inspecoes_hidrantes add column if not exists justificativa_nc_1 text not null default '';
alter table public.inspecoes_hidrantes add column if not exists justificativa_nc_2 text not null default '';
alter table public.inspecoes_hidrantes add column if not exists justificativa_nc_3 text not null default '';
alter table public.inspecoes_hidrantes add column if not exists justificativa_nc_4 text not null default '';
alter table public.inspecoes_hidrantes add column if not exists justificativa_nc_5 text not null default '';
alter table public.inspecoes_hidrantes add column if not exists justificativa_nc_6 text not null default '';
alter table public.inspecoes_hidrantes add column if not exists justificativa_nc_7 text not null default '';
alter table public.inspecoes_hidrantes add column if not exists justificativa_nc_8 text not null default '';
