-- Adiciona coluna equipe às inspeções (extintores e hidrantes). Execute no SQL Editor do Supabase.

alter table public.inspecoes
  add column if not exists equipe text;

alter table public.inspecoes_hidrantes
  add column if not exists equipe text;

alter table public.inspecoes drop constraint if exists inspecoes_equipe_chk;
alter table public.inspecoes
  add constraint inspecoes_equipe_chk
  check (equipe is null or equipe in ('ALFA', 'BRAVO', 'CHARLIE', 'DELTA'));

alter table public.inspecoes_hidrantes drop constraint if exists inspecoes_hidrantes_equipe_chk;
alter table public.inspecoes_hidrantes
  add constraint inspecoes_hidrantes_equipe_chk
  check (equipe is null or equipe in ('ALFA', 'BRAVO', 'CHARLIE', 'DELTA'));

-- Novas inspeções exigem equipe pelo app; linhas antigas podem ficar null até backfill opcional:
-- update public.inspecoes set equipe = 'ALFA' where equipe is null;
-- update public.inspecoes_hidrantes set equipe = 'ALFA' where equipe is null;
-- alter table public.inspecoes alter column equipe set not null;
-- alter table public.inspecoes_hidrantes alter column equipe set not null;
