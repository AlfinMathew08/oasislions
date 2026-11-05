-- Versioned Migration: Upcoming Events Management Enhancements
-- Dubai Oasis Lions Club — Lions Year 2026–2027
-- Adds category, short_summary, venue_name, contact_info, event_status, published_at, created_by
-- while preserving existing schema, columns, and Row Level Security (RLS).

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Community Service',
  ADD COLUMN IF NOT EXISTS short_summary TEXT,
  ADD COLUMN IF NOT EXISTS venue_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_info VARCHAR(255),
  ADD COLUMN IF NOT EXISTS event_status VARCHAR(50) DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Populate short_summary from description where missing
UPDATE events
SET short_summary = SUBSTRING(description FROM 1 FOR 180)
WHERE short_summary IS NULL AND description IS NOT NULL;

-- Ensure published_at is set for existing published events
UPDATE events
SET published_at = created_at
WHERE status = 'published' AND published_at IS NULL;

-- Populate venue_name from location if venue_name is empty
UPDATE events
SET venue_name = location
WHERE venue_name IS NULL AND location IS NOT NULL;

-- Create composite index for efficient public upcoming query
CREATE INDEX IF NOT EXISTS idx_events_public_upcoming 
  ON events (status, start_time ASC) 
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_events_slug 
  ON events (slug);
