-- Per-user AI-generated curriculum (personalized using the user's assessed gaps)
CREATE TABLE IF NOT EXISTS user_curriculum (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id   text NOT NULL,
  content     jsonb NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE user_curriculum ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own curriculum"
  ON user_curriculum FOR SELECT
  USING (auth.uid() = user_id);

-- manager_assignments (from previous migration attempt that may not have run)
CREATE TABLE IF NOT EXISTS manager_assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  manager_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (manager_id, employee_id)
);

ALTER TABLE progress ADD COLUMN IF NOT EXISTS coach_assignment_completed boolean DEFAULT false;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS custom_goal text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS leader_choice_reason text;
