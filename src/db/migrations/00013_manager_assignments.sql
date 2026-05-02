-- Manager assignments: links a manager (user) to their employees within an org
CREATE TABLE IF NOT EXISTS manager_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  manager_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (manager_id, employee_id)
);

-- Allow managers to access admin team view (new role value)
-- Existing org_memberships.role check constraint may need updating:
-- ALTER TABLE org_memberships DROP CONSTRAINT IF EXISTS org_memberships_role_check;
-- ALTER TABLE org_memberships ADD CONSTRAINT org_memberships_role_check
--   CHECK (role IN ('owner', 'hr_admin', 'manager', 'member'));
