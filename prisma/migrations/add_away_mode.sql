-- Add away_mode table for managing away days and future admin functions
CREATE TABLE IF NOT EXISTS away_mode (
  id SERIAL PRIMARY KEY,
  away_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_away_mode_date ON away_mode(away_date);

-- Add comment for table documentation
COMMENT ON TABLE away_mode IS 'Stores days when user is away and system should auto-approve posts as needed';
COMMENT ON COLUMN away_mode.away_date IS 'Date when user will be away (YYYY-MM-DD)';
