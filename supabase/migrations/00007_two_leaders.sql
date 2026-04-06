-- Allow users to follow a second leader alongside their primary one.
-- Assessment target_pct will be averaged across both leaders' skill scores.
alter table public.profiles
  add column if not exists mentor_id_2 text;
