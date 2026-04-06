-- Add next_role_pct column to skill_scores: the minimum % needed for the user's next role step
alter table public.skill_scores
  add column if not exists next_role_pct int not null default 0;
