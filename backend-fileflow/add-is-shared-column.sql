-- Migration script to add is_shared column to file table
-- This script adds the missing column from the merge

-- Add is_shared column to file table
ALTER TABLE file ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;

-- Update existing files to set is_shared to false by default
UPDATE file SET is_shared = FALSE WHERE is_shared IS NULL;

-- Add a comment to explain the column
COMMENT ON COLUMN file.is_shared IS 'Indicates whether the file is shared with other users';

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'file' AND column_name = 'is_shared';
