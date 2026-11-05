-- Migration: Structured Family Fields and Publication Controls for Members
-- File: supabase/migrations/20261013000004_member_family_structured_fields.sql
-- Dubai Oasis Lions Club — Lions Year 2026–2027

-- 1. Extend members table with structured family fields and explicit details approval
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS spouse_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS spouse_details TEXT,
ADD COLUMN IF NOT EXISTS children_names TEXT,
ADD COLUMN IF NOT EXISTS children_details TEXT,
ADD COLUMN IF NOT EXISTS other_family_info TEXT,
ADD COLUMN IF NOT EXISTS family_details_approved BOOLEAN DEFAULT false;

-- 2. Ensure indexes on status, is_public and display_order for performant public queries
CREATE INDEX IF NOT EXISTS idx_members_status_public ON members(status, is_public);
CREATE INDEX IF NOT EXISTS idx_members_display_order ON members(display_order ASC);

-- 3. Row Level Security policy updates for members
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Ensure public policy only serves active, public members
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'members' AND policyname = 'Public can view active public members'
  ) THEN
    CREATE POLICY "Public can view active public members"
    ON members FOR SELECT
    USING (is_public = true AND status = 'active');
  END IF;

  -- Ensure staff have full CRUD permissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'members' AND policyname = 'Staff can manage all members'
  ) THEN
    CREATE POLICY "Staff can manage all members"
    ON members FOR ALL
    USING (auth_is_editor_or_admin())
    WITH CHECK (auth_is_editor_or_admin());
  END IF;
END $$;
