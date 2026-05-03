-- Per-user thumbs feedback on individual book/podcast/course recommendations.
-- Aggregated feedback is fed back to the AI curriculum generator for all users.
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type  text NOT NULL,          -- 'book' | 'podcast' | 'course'
  resource_title text NOT NULL,
  feedback       text NOT NULL CHECK (feedback IN ('up', 'down')),
  created_at     timestamptz DEFAULT now(),
  UNIQUE (user_id, resource_type, resource_title)
);

ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own feedback"
  ON recommendation_feedback FOR ALL
  USING (auth.uid() = user_id);

-- Index for fast aggregation across all users (for AI prompts)
CREATE INDEX IF NOT EXISTS recommendation_feedback_type_title_idx
  ON recommendation_feedback (resource_type, resource_title, feedback);

-- Add checklist custom label support (for progress edit)
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS custom_label text;
