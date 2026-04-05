-- Leader CV text: stored for gap-analysis comparison (local leaders)
-- and AI skill suggestions (both local & global leaders).
alter table public.leader_profiles
  add column if not exists leader_cv_text text;
