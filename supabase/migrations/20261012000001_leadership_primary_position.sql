-- Versioned Migration: Add primary_position to leadership_assignments
-- Values: 'president', 'secretary', 'treasurer', 'none'
-- Allows explicit assignment of top executive office bearers while maintaining RLS.

ALTER TABLE leadership_assignments
  ADD COLUMN IF NOT EXISTS primary_position VARCHAR(20) DEFAULT 'none';

-- Automatically classify existing assignments based on position title
UPDATE leadership_assignments
SET primary_position = 'president'
WHERE position_title ILIKE '%president%' 
  AND position_title NOT ILIKE '%vice%' 
  AND (primary_position IS NULL OR primary_position = 'none');

UPDATE leadership_assignments
SET primary_position = 'secretary'
WHERE position_title ILIKE '%secretary%' 
  AND (primary_position IS NULL OR primary_position = 'none');

UPDATE leadership_assignments
SET primary_position = 'treasurer'
WHERE position_title ILIKE '%treasurer%' 
  AND (primary_position IS NULL OR primary_position = 'none');
