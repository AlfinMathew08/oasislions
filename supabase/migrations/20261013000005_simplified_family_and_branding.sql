-- Migration: Simplified Family Profile Fields and Family Message
-- File: supabase/migrations/20261013000005_simplified_family_and_branding.sql
-- Dubai Oasis Lions Club — Lions Year 2026–2027

-- 1. Extend members table with simplified family columns
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS has_spouse BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS spouse_dob VARCHAR(50),
ADD COLUMN IF NOT EXISTS wedding_anniversary VARCHAR(50),
ADD COLUMN IF NOT EXISTS children_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS family_message TEXT,
ADD COLUMN IF NOT EXISTS family_message_approved BOOLEAN DEFAULT false;

-- 2. Performance indexes for efficient lookup
CREATE INDEX IF NOT EXISTS idx_members_has_spouse ON members(has_spouse);
CREATE INDEX IF NOT EXISTS idx_members_family_approvals ON members(family_photo_approved, family_details_approved, family_message_approved);
