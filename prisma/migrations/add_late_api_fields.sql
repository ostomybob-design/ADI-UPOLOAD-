-- Migration: Add Late.dev API tracking fields
-- Description: Adds fields to track posts created via Late.dev API
-- Date: 2024-10-31

-- Add Late API tracking columns to search_results table
ALTER TABLE search_results 
ADD COLUMN IF NOT EXISTS late_post_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS late_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS late_published_at TIMESTAMP(6),
ADD COLUMN IF NOT EXISTS late_error_message TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_late_post_id ON search_results(late_post_id);
CREATE INDEX IF NOT EXISTS idx_late_status ON search_results(late_status);

-- Add comments to document the columns
COMMENT ON COLUMN search_results.late_post_id IS 'Late.dev post ID for tracking';
COMMENT ON COLUMN search_results.late_status IS 'Post status from Late API: scheduled, published, failed, draft';
COMMENT ON COLUMN search_results.late_published_at IS 'Timestamp when Late.dev published the post';
COMMENT ON COLUMN search_results.late_error_message IS 'Error message if posting failed via Late API';
