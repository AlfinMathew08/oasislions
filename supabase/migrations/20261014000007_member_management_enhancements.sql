-- Migration: Complete Member Management — Date of Birth, Address in India & Security
-- File: supabase/migrations/20261014000007_member_management_enhancements.sql
-- Dubai Oasis Lions Club — Lions Year 2026–2027

-- 1. Add date_of_birth, address_in_india, and address_in_india_visible to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(50);
ALTER TABLE members ADD COLUMN IF NOT EXISTS address_in_india TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS address_in_india_visible BOOLEAN DEFAULT false;

-- 2. Indexes for privacy filter and query performance
CREATE INDEX IF NOT EXISTS idx_members_address_visible ON members(address_in_india_visible);
CREATE INDEX IF NOT EXISTS idx_members_dob ON members(date_of_birth);

-- 3. Ensure relational member_children table exists with foreign key and cascading delete
CREATE TABLE IF NOT EXISTS member_children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_member_children_member_id ON member_children(member_id);
CREATE INDEX IF NOT EXISTS idx_member_children_order ON member_children(member_id, display_order);

-- 4. Enable Row Level Security
ALTER TABLE member_children ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies
-- Public can read children only if parent member is public and family_details_approved is true
DROP POLICY IF EXISTS "Public can view approved member children" ON member_children;
CREATE POLICY "Public can view approved member children"
ON member_children FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE members.id = member_children.member_id
      AND members.is_public = true
      AND members.family_details_approved = true
  )
);

-- Authorized editors and admins can manage member children
DROP POLICY IF EXISTS "Staff can manage member children" ON member_children;
CREATE POLICY "Staff can manage member children"
ON member_children FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());
