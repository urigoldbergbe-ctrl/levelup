-- ============================================================
-- LevelUp — Initial Schema
-- ============================================================

-- ---- Profiles (extends auth.users) -------------------------
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text,
  plan            text not null default 'free', -- free | pro | premium
  mentor_id       text,
  current_semester int not null default 1,
  created_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Automatically create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ---- Leader Profiles (curated + user-added) ----------------
create table public.leader_profiles (
  id              text primary key,
  name            text not null,
  title           text,
  company         text,
  category        text,
  quote           text,
  photo_url       text,
  g1              text,
  g2              text,
  own_book        jsonb,
  skills          jsonb,
  career_ladder   jsonb,
  spotify_url     text,
  goodreads_url   text,
  approved        boolean not null default true,
  is_custom       boolean not null default false,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

alter table public.leader_profiles enable row level security;

create policy "Anyone can view approved leaders"
  on public.leader_profiles for select
  using (approved = true);

create policy "Users can insert custom leaders"
  on public.leader_profiles for insert
  with check (auth.uid() = created_by and is_custom = true);


-- ---- Assessments (AI gap analysis results) -----------------
create table public.assessments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  mentor_id       text references public.leader_profiles(id) on delete set null,
  profile_text    text,
  headline        text,
  current_level   text,
  target_level    text,
  gaps            jsonb,
  strengths       jsonb,
  year_one_action text,
  mentor_parallel text,
  created_at      timestamptz not null default now()
);

alter table public.assessments enable row level security;

create policy "Users can view own assessments"
  on public.assessments for select
  using (auth.uid() = user_id);

create policy "Users can insert own assessments"
  on public.assessments for insert
  with check (auth.uid() = user_id);


-- ---- Progress (semester completion state) ------------------
create table public.progress (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  semester            int not null,
  books_completed     text[] not null default '{}',
  course_completed    boolean not null default false,
  podcast_scheduled   boolean not null default false,
  milestone_achieved  boolean not null default false,
  updated_at          timestamptz not null default now(),
  unique(user_id, semester)
);

alter table public.progress enable row level security;

create policy "Users can manage own progress"
  on public.progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ---- Skill Scores ------------------------------------------
create table public.skill_scores (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  dimension     text not null,
  skill_name    text not null,
  current_pct   int not null default 0,
  target_pct    int not null default 0,
  updated_at    timestamptz not null default now(),
  unique(user_id, dimension, skill_name)
);

alter table public.skill_scores enable row level security;

create policy "Users can manage own skill scores"
  on public.skill_scores for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ---- Readiness Checklist Items -----------------------------
create table public.checklist_items (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  next_role_title  text,
  requirement_id   text not null,
  dimension        text not null,
  label            text not null,
  completed        boolean not null default false,
  completed_at     timestamptz
);

alter table public.checklist_items enable row level security;

create policy "Users can manage own checklist"
  on public.checklist_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ---- Mentorship Sessions -----------------------------------
create table public.mentor_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  session_type     text not null,
  scheduled_at     timestamptz,
  status           text not null default 'scheduled',
  prep_sent        boolean not null default false,
  notes            text,
  linked_milestone text,
  created_at       timestamptz not null default now()
);

alter table public.mentor_sessions enable row level security;

create policy "Users can manage own sessions"
  on public.mentor_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Performance indexes
create index if not exists idx_assessments_user_id on public.assessments(user_id);
create index if not exists idx_assessments_created_at on public.assessments(created_at desc);
create index if not exists idx_progress_user_id on public.progress(user_id);
create index if not exists idx_skill_scores_user_dim on public.skill_scores(user_id, dimension);
create index if not exists idx_checklist_user_id on public.checklist_items(user_id);
create index if not exists idx_sessions_user_id on public.mentor_sessions(user_id);
create index if not exists idx_leaders_category on public.leader_profiles(category) where approved = true;

-- ============================================================
-- Migration 00003: Organizations & Admin Schema
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
  role       text not null default 'member',
  created_at timestamptz not null default now(),
  unique(org_id, user_id)
);

alter table public.org_memberships enable row level security;

-- RLS policies (defined after both tables exist)

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
  add column if not exists org_id               uuid references public.organizations(id) on delete cascade,
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
  status       text not null default 'pending',
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

-- ============================================================
-- Migration 00004: Catalog columns + FK fix + is_admin
-- ============================================================

-- Drop FK so static (code-only) leaders don't break assessment inserts
alter table public.assessments
  drop constraint if exists assessments_mentor_id_fkey;

-- Catalog columns
alter table public.leader_profiles
  add column if not exists catalog_books    jsonb not null default '[]'::jsonb,
  add column if not exists catalog_podcasts jsonb not null default '[]'::jsonb,
  add column if not exists catalog_courses  jsonb not null default '[]'::jsonb;

-- Super-admin flag
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create index if not exists idx_profiles_is_admin on public.profiles(is_admin) where is_admin = true;

-- ============================================================
-- Migration 00005: Platform admin — skill scores, alerts, invites
-- ============================================================

alter table public.leader_profiles
  add column if not exists leader_skill_scores jsonb not null default '[]'::jsonb;

create table if not exists public.news_alert_logs (
  id              uuid primary key default gen_random_uuid(),
  leader_id       text not null,
  org_id          uuid,
  subject         text not null,
  body            text not null,
  sent_by         uuid references auth.users(id) on delete set null,
  sent_at         timestamptz not null default now(),
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

-- ============================================================
-- Migration 00006: Leader CV text (for gap analysis + AI skills)
-- ============================================================

alter table public.leader_profiles
  add column if not exists leader_cv_text text;
