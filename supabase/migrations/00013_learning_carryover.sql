-- Points from completed journey items when switching primary leader; applied to skill_scores after the next gap analysis.
alter table public.profiles
  add column if not exists learning_carryover_points int not null default 0;
