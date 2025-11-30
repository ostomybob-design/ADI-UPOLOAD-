-- Add Late.dev integration columns to search_results table
-- Run this SQL directly in Supabase SQL Editor

-- Add Late.dev fields
ALTER TABLE search_results 
ADD COLUMN IF NOT EXISTS late_post_id VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS late_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS late_scheduled_for TIMESTAMP(6),
ADD COLUMN IF NOT EXISTS late_published_at TIMESTAMP(6),
ADD COLUMN IF NOT EXISTS late_platforms JSON,
ADD COLUMN IF NOT EXISTS late_error_message TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_late_post_id ON search_results(late_post_id);
CREATE INDEX IF NOT EXISTS idx_late_status ON search_results(late_status);
CREATE INDEX IF NOT EXISTS idx_late_scheduled_for ON search_results(late_scheduled_for);

-- Add approval_status column if it doesn't exist (for older databases)
ALTER TABLE search_results 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';

-- Add approval workflow columns if they don't exist
ALTER TABLE search_results 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP(6),
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- Add index for approval_status
CREATE INDEX IF NOT EXISTS idx_approval_status ON search_results(approval_status);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'search_results' 
AND column_name LIKE 'late_%'
ORDER BY ordinal_position;
