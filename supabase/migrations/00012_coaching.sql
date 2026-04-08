-- ============================================================
-- Coaching: platform coaches, per-user assignment, session tasks
-- ============================================================

create table public.coaches (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  phone        text,
  bio          text,
  calendly_url text not null,
  photo_url    text,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_coaches_active on public.coaches (active) where active = true;

create table public.user_coach_assignments (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  coach_id   uuid references public.coaches (id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_coach_assignments_coach on public.user_coach_assignments (coach_id);

create table public.coach_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  coach_id   uuid not null references public.coaches (id) on delete cascade,
  session_at timestamptz not null default now(),
  tasks      jsonb not null default '[]'::jsonb,
  notes      text,
  created_at timestamptz not null default now()
);

create index if not exists idx_coach_sessions_user_time on public.coach_sessions (user_id, session_at desc);

-- ---- RLS ---------------------------------------------------------------

alter table public.coaches enable row level security;
alter table public.user_coach_assignments enable row level security;
alter table public.coach_sessions enable row level security;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;

-- Coaches: members see only their assigned coach; super-admins see all (client uses admin API too).
create policy coaches_select_member
  on public.coaches for select
  to authenticated
  using (
    exists (
      select 1 from public.user_coach_assignments u
      where u.user_id = auth.uid() and u.coach_id = coaches.id
    )
    or public.is_super_admin()
  );

create policy coaches_insert_admin
  on public.coaches for insert
  to authenticated
  with check (public.is_super_admin());

create policy coaches_update_admin
  on public.coaches for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy coaches_delete_admin
  on public.coaches for delete
  to authenticated
  using (public.is_super_admin());

-- Assignments
create policy uca_select_own_or_admin
  on public.user_coach_assignments for select
  to authenticated
  using (user_id = auth.uid() or public.is_super_admin());

create policy uca_insert_admin
  on public.user_coach_assignments for insert
  to authenticated
  with check (public.is_super_admin());

create policy uca_update_admin
  on public.user_coach_assignments for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy uca_delete_admin
  on public.user_coach_assignments for delete
  to authenticated
  using (public.is_super_admin());

-- Sessions
create policy coach_sessions_select_own_or_admin
  on public.coach_sessions for select
  to authenticated
  using (user_id = auth.uid() or public.is_super_admin());

create policy coach_sessions_insert_admin
  on public.coach_sessions for insert
  to authenticated
  with check (public.is_super_admin());

create policy coach_sessions_update_admin
  on public.coach_sessions for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy coach_sessions_delete_admin
  on public.coach_sessions for delete
  to authenticated
  using (public.is_super_admin());
