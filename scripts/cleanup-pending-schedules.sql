-- Cleanup script: Remove scheduling data from posts in "Ready to Post" (pending) status
-- 
-- Context: Previously, posts could be scheduled before approval. Now scheduling only 
-- happens after approval. This script cleans up legacy scheduling data from pending posts.
--
-- What this does:
-- 1. Clears Late.dev post ID and status
-- 2. Clears scheduled date and published date
-- 3. Clears platform selections
-- 4. Clears any error messages
-- 5. Only affects posts with approval_status = 'pending'
--
-- Run this in your Supabase SQL Editor or psql terminal

-- Preview: See which posts will be affected (run this first to check)
SELECT 
    id,
    title,
    approval_status,
    late_post_id,
    late_status,
    late_scheduled_for,
    late_published_at,
    late_platforms
FROM search_results
WHERE approval_status = 'pending'
  AND (
    late_post_id IS NOT NULL 
    OR late_status IS NOT NULL 
    OR late_scheduled_for IS NOT NULL
    OR late_published_at IS NOT NULL
    OR late_platforms IS NOT NULL
  );

-- Actual cleanup: Clear all Late.dev scheduling fields for pending posts
UPDATE search_results
SET 
    late_post_id = NULL,
    late_status = NULL,
    late_scheduled_for = NULL,
    late_published_at = NULL,
    late_platforms = NULL,
    late_error_message = NULL,
    updated_at = NOW()
WHERE approval_status = 'pending'
  AND (
    late_post_id IS NOT NULL 
    OR late_status IS NOT NULL 
    OR late_scheduled_for IS NOT NULL
    OR late_published_at IS NOT NULL
    OR late_platforms IS NOT NULL
  );

-- Verification: Check that no pending posts have scheduling data anymore
SELECT 
    COUNT(*) as pending_with_schedule_data
FROM search_results
WHERE approval_status = 'pending'
  AND (
    late_post_id IS NOT NULL 
    OR late_status IS NOT NULL 
    OR late_scheduled_for IS NOT NULL
    OR late_published_at IS NOT NULL
    OR late_platforms IS NOT NULL
  );
-- This should return 0 if cleanup was successful
