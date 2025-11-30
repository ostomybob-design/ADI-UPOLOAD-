-- Migration: Add approval workflow and scheduling fields
-- Run this in your Supabase SQL editor

-- Add approval workflow columns
ALTER TABLE search_results 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- Add scheduling columns
ALTER TABLE search_results
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP,
ADD COLUMN IF NOT EXISTS scheduled_platform VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_in_buffer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS buffer_position INTEGER;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_approval_status ON search_results(approval_status);
CREATE INDEX IF NOT EXISTS idx_scheduled_for ON search_results(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_is_in_buffer ON search_results(is_in_buffer);

-- Create posting_schedule table
CREATE TABLE IF NOT EXISTS posting_schedule (
  id SERIAL PRIMARY KEY,
  posts_per_day INTEGER DEFAULT 3,
  posting_times JSON NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  instagram_enabled BOOLEAN DEFAULT true,
  facebook_enabled BOOLEAN DEFAULT true,
  buffer_size INTEGER DEFAULT 7,
  auto_approve_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default schedule
INSERT INTO posting_schedule (posts_per_day, posting_times, timezone, instagram_enabled, facebook_enabled, buffer_size, auto_approve_enabled)
VALUES (3, '["09:00", "13:00", "18:00"]', 'UTC', true, true, 7, false)
ON CONFLICT DO NOTHING;

-- Update existing posts to have pending status
UPDATE search_results 
SET approval_status = 'pending' 
WHERE approval_status IS NULL;
