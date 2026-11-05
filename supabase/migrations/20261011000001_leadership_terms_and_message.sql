-- Versioned Migration: Add structured Term of Service (term_start_year, term_end_year)
-- and leader_message to leadership_assignments while preserving existing member relationships and RLS.

ALTER TABLE leadership_assignments
  ADD COLUMN IF NOT EXISTS term_start_year INTEGER NOT NULL DEFAULT 2026,
  ADD COLUMN IF NOT EXISTS term_end_year INTEGER NOT NULL DEFAULT 2027,
  ADD COLUMN IF NOT EXISTS leader_message TEXT;

-- Backfill existing rows if any have null leader_message using associated member biography
UPDATE leadership_assignments la
SET leader_message = m.biography
FROM members m
WHERE la.member_id = m.id
  AND la.leader_message IS NULL;

-- Ensure updated_at trigger is attached to leadership_assignments
DROP TRIGGER IF EXISTS update_leadership_modtime ON leadership_assignments;
CREATE TRIGGER update_leadership_modtime
  BEFORE UPDATE ON leadership_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
