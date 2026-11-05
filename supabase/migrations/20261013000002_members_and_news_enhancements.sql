-- Versioned Migration: Members Directory, Name Prefixes, Family Privacy & News Management Enhancements
-- Dubai Oasis Lions Club — Lions Year 2026–2027
-- Adds name_prefix, joining_date, family_photo_url, family_photo_approved to members
-- Adds author_name, seo_title, seo_description to news_articles
-- Preserves all existing tables, foreign keys, and Row Level Security (RLS).

-- 1. Members enhancements
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS name_prefix VARCHAR(50) DEFAULT 'Lion',
  ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT '2026-07-01',
  ADD COLUMN IF NOT EXISTS family_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS family_photo_approved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Update existing members to default prefix 'Lion' where null
UPDATE members
SET name_prefix = 'Lion'
WHERE name_prefix IS NULL;

-- 2. News Articles enhancements
ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS author_name VARCHAR(150) DEFAULT 'Dubai Oasis Lions Club',
  ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- 3. Configurable Name Prefixes Table
CREATE TABLE IF NOT EXISTS name_prefixes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prefix VARCHAR(50) NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Seed initial allowed name prefixes
INSERT INTO name_prefixes (prefix, display_order, is_enabled, is_default) VALUES
('Lion', 1, true, true),
('Mr.', 2, true, false),
('Mrs.', 3, true, false),
('Ms.', 4, true, false),
('Dr.', 5, true, false),
('No prefix', 6, true, false)
ON CONFLICT (prefix) DO NOTHING;

-- Enable RLS on name_prefixes
ALTER TABLE name_prefixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view enabled prefixes"
ON name_prefixes FOR SELECT
USING (is_enabled = true);

CREATE POLICY "Staff can manage prefixes"
ON name_prefixes FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());

-- Index for public member queries
CREATE INDEX IF NOT EXISTS idx_members_public_directory 
  ON members (is_public, display_order ASC) 
  WHERE is_public = true;
