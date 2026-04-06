-- Career maps: stores AI-generated branching career paths per user
create table if not exists public.career_maps (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  content     jsonb not null,
  mentor_id   text,
  generated_at timestamptz not null default now(),
  constraint career_maps_user_id_key unique (user_id)
);

alter table public.career_maps enable row level security;

create policy "Users can read their own career map"
  on public.career_maps for select
  using (auth.uid() = user_id);

create policy "Users can insert their own career map"
  on public.career_maps for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own career map"
  on public.career_maps for update
  using (auth.uid() = user_id);

create policy "Users can delete their own career map"
  on public.career_maps for delete
  using (auth.uid() = user_id);
