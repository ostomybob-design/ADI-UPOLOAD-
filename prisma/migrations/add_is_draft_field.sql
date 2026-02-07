-- Migration: Add is_draft field to search_results table
-- This allows drafts to be stored in the database instead of localStorage
-- Making them accessible to all users and devices

-- Add is_draft column (default false for existing records)
ALTER TABLE search_results
ADD COLUMN is_draft BOOLEAN DEFAULT false;

-- Create index for faster draft filtering
CREATE INDEX idx_is_draft ON search_results(is_draft);

-- Update existing records: any post with approval_status = 'pending' and no content_processed can be considered a draft
-- (This is optional - you can skip this if you want to start fresh)
-- UPDATE search_results
-- SET is_draft = true
-- WHERE approval_status = 'pending' AND (content_processed IS NULL OR content_processed = false);

-- Verification: Check the new column
SELECT 
    COUNT(*) as total_posts,
    COUNT(*) FILTER (WHERE is_draft = true) as draft_posts,
    COUNT(*) FILTER (WHERE is_draft = false) as non_draft_posts
FROM search_results;
