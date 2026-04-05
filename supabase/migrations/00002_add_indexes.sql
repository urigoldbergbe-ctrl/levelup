-- Performance indexes
create index if not exists idx_assessments_user_id on public.assessments(user_id);
create index if not exists idx_assessments_created_at on public.assessments(created_at desc);
create index if not exists idx_progress_user_id on public.progress(user_id);
create index if not exists idx_skill_scores_user_dim on public.skill_scores(user_id, dimension);
create index if not exists idx_checklist_user_id on public.checklist_items(user_id);
create index if not exists idx_sessions_user_id on public.mentor_sessions(user_id);
create index if not exists idx_leaders_category on public.leader_profiles(category) where approved = true;
