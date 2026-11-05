-- Migration: Add Family Details to Members and Read Status to Contact Enquiries
-- File: supabase/migrations/20261013000003_enquiries_and_family_details.sql
-- Lions Year 2026–2027

-- 1. Extend members table with separate family details fields
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS family_members_names TEXT,
ADD COLUMN IF NOT EXISTS family_intro TEXT;

-- 2. Extend contact_enquiries table with is_read status
ALTER TABLE contact_enquiries
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- 3. Create index on contact_enquiries status and created_at
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_status ON contact_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_created_at ON contact_enquiries(created_at DESC);

-- 4. Ensure RLS policies on contact_enquiries
ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_enquiries' AND policyname = 'Public can submit contact enquiries'
  ) THEN
    CREATE POLICY "Public can submit contact enquiries"
    ON contact_enquiries FOR INSERT
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_enquiries' AND policyname = 'Staff can view and manage enquiries'
  ) THEN
    CREATE POLICY "Staff can view and manage enquiries"
    ON contact_enquiries FOR ALL
    USING (auth_is_editor_or_admin())
    WITH CHECK (auth_is_editor_or_admin());
  END IF;
END $$;
