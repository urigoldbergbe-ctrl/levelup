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
  id              text primary key,           -- slug e.g. 'bezos'
  name            text not null,
  title           text,
  company         text,
  category        text,                       -- Strategy | Marketing | Sales | Product | Investing | Leadership
  quote           text,
  photo_url       text,
  g1              text,                       -- fallback gradient start colour
  g2              text,                       -- fallback gradient end colour
  own_book        jsonb,                      -- { title, url, why }
  skills          jsonb,                      -- string[5]
  career_ladder   jsonb,                      -- CareerRole[4]
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
  gaps            jsonb,   -- { skill: string, why: string, category: 'Technical'|'Communication'|'Thinking' }[]
  strengths       jsonb,   -- string[]
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
  dimension     text not null,   -- technical | communication | thinking
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
  dimension        text not null,  -- technical | communication | thinking
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
  session_type     text not null,  -- 1on1 | milestone_review
  scheduled_at     timestamptz,
  status           text not null default 'scheduled', -- scheduled | completed | cancelled
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
