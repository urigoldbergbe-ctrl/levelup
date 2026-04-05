-- ============================================================
-- LevelUp — Organizations & Admin Schema
-- ============================================================

-- ---- Organizations ------------------------------------------
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique not null,
  logo_url   text,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;


-- ---- Org Memberships ----------------------------------------
create table if not exists public.org_memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null default 'member',   -- member | hr_admin | owner
  created_at timestamptz not null default now(),
  unique(org_id, user_id)
);

alter table public.org_memberships enable row level security;

-- RLS policies (defined after both tables exist so cross-references work)

create policy "Members can view their org"
  on public.organizations for select
  using (
    exists (
      select 1 from public.org_memberships
      where org_id = organizations.id
        and user_id = auth.uid()
    )
  );

create policy "Members can view own memberships"
  on public.org_memberships for select
  using (user_id = auth.uid());

create policy "Owners can manage memberships"
  on public.org_memberships for all
  using (
    exists (
      select 1 from public.org_memberships om
      where om.org_id = org_memberships.org_id
        and om.user_id = auth.uid()
        and om.role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.org_memberships om
      where om.org_id = org_memberships.org_id
        and om.user_id = auth.uid()
        and om.role = 'owner'
    )
  );


-- ---- Extend profiles ----------------------------------------
alter table public.profiles
  add column if not exists org_id   uuid references public.organizations(id) on delete set null,
  add column if not exists is_admin boolean not null default false;


-- ---- Extend leader_profiles for org leaders -----------------
alter table public.leader_profiles
  add column if not exists org_id             uuid references public.organizations(id) on delete cascade,
  add column if not exists book_recommendations jsonb default '[]'::jsonb,
  add column if not exists news_alerts          jsonb default '[]'::jsonb;

-- Drop the old blanket "anyone can view approved" policy and replace
drop policy if exists "Anyone can view approved leaders" on public.leader_profiles;

create policy "Anyone can view approved global leaders"
  on public.leader_profiles for select
  using (approved = true and org_id is null);

create policy "Org members can view their org leaders"
  on public.leader_profiles for select
  using (
    org_id is not null and
    exists (
      select 1 from public.org_memberships om
      where om.org_id = leader_profiles.org_id
        and om.user_id = auth.uid()
    )
  );

create policy "HR admins can insert org leaders"
  on public.leader_profiles for insert
  with check (
    org_id is not null and
    exists (
      select 1 from public.org_memberships om
      where om.org_id = leader_profiles.org_id
        and om.user_id = auth.uid()
        and om.role in ('hr_admin', 'owner')
    )
  );

create policy "HR admins can update org leaders"
  on public.leader_profiles for update
  using (
    org_id is not null and
    exists (
      select 1 from public.org_memberships om
      where om.org_id = leader_profiles.org_id
        and om.user_id = auth.uid()
        and om.role in ('hr_admin', 'owner')
    )
  );

create policy "HR admins can delete org leaders"
  on public.leader_profiles for delete
  using (
    org_id is not null and
    exists (
      select 1 from public.org_memberships om
      where om.org_id = leader_profiles.org_id
        and om.user_id = auth.uid()
        and om.role in ('hr_admin', 'owner')
    )
  );


-- ---- Leader curriculum (AI-generated) -----------------------
create table if not exists public.leader_curriculum (
  id           uuid primary key default gen_random_uuid(),
  leader_id    text not null references public.leader_profiles(id) on delete cascade,
  generated_at timestamptz not null default now(),
  content      jsonb not null default '{}',
  status       text not null default 'pending',  -- pending | generating | done | error
  unique(leader_id)
);

alter table public.leader_curriculum enable row level security;

create policy "Members can view curriculum"
  on public.leader_curriculum for select
  using (
    exists (
      select 1 from public.leader_profiles lp
      where lp.id = leader_curriculum.leader_id
        and (
          (lp.approved = true and lp.org_id is null)
          or exists (
            select 1 from public.org_memberships om
            where om.org_id = lp.org_id
              and om.user_id = auth.uid()
          )
        )
    )
  );

create policy "HR admins can manage curriculum"
  on public.leader_curriculum for all
  using (
    exists (
      select 1 from public.leader_profiles lp
      join public.org_memberships om on om.org_id = lp.org_id
      where lp.id = leader_curriculum.leader_id
        and om.user_id = auth.uid()
        and om.role in ('hr_admin', 'owner')
    )
  )
  with check (
    exists (
      select 1 from public.leader_profiles lp
      join public.org_memberships om on om.org_id = lp.org_id
      where lp.id = leader_curriculum.leader_id
        and om.user_id = auth.uid()
        and om.role in ('hr_admin', 'owner')
    )
  );

-- Indexes
create index if not exists idx_org_memberships_user on public.org_memberships(user_id);
create index if not exists idx_org_memberships_org  on public.org_memberships(org_id);
create index if not exists idx_leaders_org          on public.leader_profiles(org_id);
