-- Create ticker_messages table
CREATE TABLE IF NOT EXISTS ticker_messages (
  id SERIAL PRIMARY KEY,
  message VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticker_active ON ticker_messages(is_active);
CREATE INDEX IF NOT EXISTS idx_ticker_order ON ticker_messages(order_index);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  quote TEXT NOT NULL,
  author VARCHAR(200),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quotes_active ON quotes(is_active);
CREATE INDEX IF NOT EXISTS idx_quotes_category ON quotes(category);

-- Create joke_of_the_day table
CREATE TABLE IF NOT EXISTS joke_of_the_day (
  id SERIAL PRIMARY KEY,
  joke TEXT NOT NULL,
  punchline TEXT,
  date DATE UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_joke_date ON joke_of_the_day(date);
CREATE INDEX IF NOT EXISTS idx_joke_active ON joke_of_the_day(is_active);

-- Insert some sample data
INSERT INTO ticker_messages (message, is_active, order_index) VALUES
  ('Welcome to OstomyBuddy! Your trusted companion for ostomy care.', true, 1),
  ('New content updated daily - Check back often!', true, 2),
  ('Join our community and share your story.', true, 3)
ON CONFLICT DO NOTHING;

INSERT INTO quotes (quote, author, category, is_active) VALUES
  ('Every day may not be good, but there is something good in every day.', 'Alice Morse Earle', 'motivation', true),
  ('Health is not valued till sickness comes.', 'Thomas Fuller', 'health', true),
  ('Your present circumstances don''t determine where you can go; they merely determine where you start.', 'Nido Qubein', 'motivation', true)
ON CONFLICT DO NOTHING;

INSERT INTO joke_of_the_day (joke, punchline, date, is_active) VALUES
  ('Why did the scarecrow win an award?', 'Because he was outstanding in his field!', CURRENT_DATE, true)
ON CONFLICT (date) DO NOTHING;
