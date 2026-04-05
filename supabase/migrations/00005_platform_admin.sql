-- ============================================================
-- LevelUp — Platform admin improvements
-- ============================================================

-- Leader skill scores: structured ratings per skill in the catalog
-- Each entry: { skill_name, dimension, score (1-5 = 20/40/60/80/95%) }
alter table public.leader_profiles
  add column if not exists leader_skill_scores jsonb not null default '[]'::jsonb;

-- News alert log: tracks every alert composed & sent per leader
create table if not exists public.news_alert_logs (
  id          uuid primary key default gen_random_uuid(),
  leader_id   text not null,
  org_id      uuid,                          -- null = platform-wide (global leader)
  subject     text not null,
  body        text not null,
  sent_by     uuid references auth.users(id) on delete set null,
  sent_at     timestamptz not null default now(),
  recipient_count int not null default 0
);

alter table public.news_alert_logs enable row level security;

create policy "Admins can view alert logs for their org"
  on public.news_alert_logs for select
  using (
    auth.uid() in (
      select user_id from public.org_memberships
      where org_id = news_alert_logs.org_id
        and role in ('hr_admin', 'owner')
    )
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Pending invites table (for batch upload tracking)
create table if not exists public.pending_invites (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references public.organizations(id) on delete cascade,
  email       text not null,
  name        text,
  role        text not null default 'member',
  invited_by  uuid references auth.users(id) on delete set null,
  invited_at  timestamptz not null default now(),
  accepted_at timestamptz,
  unique(org_id, email)
);

alter table public.pending_invites enable row level security;

create policy "Org admins can manage invites"
  on public.pending_invites for all
  using (
    auth.uid() in (
      select user_id from public.org_memberships
      where org_id = pending_invites.org_id
        and role in ('hr_admin', 'owner')
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and is_admin = true
    )
  )
  with check (
    auth.uid() in (
      select user_id from public.org_memberships
      where org_id = pending_invites.org_id
        and role in ('hr_admin', 'owner')
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and is_admin = true
    )
  );
