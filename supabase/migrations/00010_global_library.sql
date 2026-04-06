-- Add bio column to leader_profiles (short biography for global leaders)
alter table public.leader_profiles
  add column if not exists bio text;

-- Global library: curated books, podcasts, and courses used by AI for gap-filling
create table if not exists public.global_library (
  id           uuid primary key default gen_random_uuid(),
  type         text not null check (type in ('book', 'podcast', 'course')),
  title        text not null,
  author       text,          -- book author / podcast host / course instructor
  url          text,
  description  text,
  platform     text,          -- e.g. 'Coursera', 'Spotify', 'Amazon'
  -- Which gap categories this item addresses (array of skill/dimension names)
  gap_tags     text[] not null default '{}',
  created_at   timestamptz not null default now()
);

alter table public.global_library enable row level security;

-- Anyone authenticated can read the library
create policy "Authenticated users can read global library"
  on public.global_library for select
  using (auth.role() = 'authenticated');

-- Only super admins can write
create policy "Super admins can manage global library"
  on public.global_library for all
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles where id = auth.uid() and is_admin = true
    )
  );
