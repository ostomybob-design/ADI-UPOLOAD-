-- Migration: Add user_preferences table for default column visibility settings
-- This allows admins to set default column visibility that all users see,
-- while users can override with their own localStorage preferences

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  preference_key VARCHAR(100) UNIQUE NOT NULL,
  preference_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP(6) DEFAULT NOW(),
  updated_at TIMESTAMP(6) DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_preferences_key ON user_preferences(preference_key);

-- Insert default column visibility settings for each tab
INSERT INTO user_preferences (preference_key, preference_value, description) VALUES
  ('column_visibility_draft', '{}', 'Default column visibility for Draft tab'),
  ('column_visibility_pending', '{}', 'Default column visibility for Ready to Post tab'),
  ('column_visibility_approved', '{}', 'Default column visibility for Approved tab'),
  ('column_visibility_scheduled', '{}', 'Default column visibility for Scheduled tab'),
  ('column_visibility_published', '{}', 'Default column visibility for Published tab'),
  ('column_visibility_rejected', '{}', 'Default column visibility for Rejected tab'),
  ('column_visibility_all', '{}', 'Default column visibility for All tab')
ON CONFLICT (preference_key) DO NOTHING;

-- Verification: Check that preferences were created
SELECT * FROM user_preferences WHERE preference_key LIKE 'column_visibility_%';
