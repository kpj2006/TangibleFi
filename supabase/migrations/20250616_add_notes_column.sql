-- Add notes column to assets table for storing admin comments, rejection reasons, etc.
ALTER TABLE assets ADD COLUMN notes TEXT;

-- Update existing rejected assets to have a default note
UPDATE assets 
SET notes = 'Asset rejected by admin' 
WHERE verification_status = 'rejected' AND notes IS NULL; 