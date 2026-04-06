-- Add secondary and tertiary category columns to leader_profiles
alter table public.leader_profiles
  add column if not exists category2 text,
  add column if not exists category3 text;
