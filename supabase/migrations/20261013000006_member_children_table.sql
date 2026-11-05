-- Migration: Dedicated member_children Table & Foreign Key Relationship
-- File: supabase/migrations/20261013000006_member_children_table.sql
-- Dubai Oasis Lions Club — Lions Year 2026–2027

CREATE TABLE IF NOT EXISTS member_children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_children_member_id ON member_children(member_id);
CREATE INDEX IF NOT EXISTS idx_member_children_order ON member_children(member_id, display_order);

-- Enable Row Level Security
ALTER TABLE member_children ENABLE ROW LEVEL SECURITY;

-- Public can read children only if parent member is public and family_details_approved is true
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

-- Staff can manage member children
CREATE POLICY "Staff can manage member children"
ON member_children FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());
