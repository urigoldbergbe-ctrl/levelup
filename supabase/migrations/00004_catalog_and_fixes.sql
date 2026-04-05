-- ============================================================
-- LevelUp — Catalog schema + FK fix
-- ============================================================

-- Drop the FK on assessments.mentor_id so static leaders
-- (stored in code, not DB) don't cause silent insert failures.
alter table public.assessments
  drop constraint if exists assessments_mentor_id_fkey;

-- Add catalog columns to leader_profiles
-- Each is a JSONB array of structured objects.
alter table public.leader_profiles
  add column if not exists catalog_books    jsonb not null default '[]'::jsonb,
  add column if not exists catalog_podcasts jsonb not null default '[]'::jsonb,
  add column if not exists catalog_courses  jsonb not null default '[]'::jsonb;

-- Add is_admin flag to profiles (for super-admin access)
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Index for quick admin lookup
create index if not exists idx_profiles_is_admin on public.profiles(is_admin) where is_admin = true;
