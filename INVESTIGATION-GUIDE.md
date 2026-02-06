# 🔍 How to Track What's Creating Auto-Approved Posts

## Method 1: Supabase Database Webhooks (EASIEST)

1. **Go to your Supabase Dashboard**
   - https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Enable Database Webhooks**
   - Click "Database" → "Webhooks" in the sidebar
   - Click "Create a new webhook"
   - Configure:
     - **Table**: `search_results`
     - **Events**: Check "Insert"
     - **Webhook URL**: Use a service like https://webhook.site to get a temporary URL
     - **HTTP Headers**: Leave as default
   
3. **Wait for Next Post**
   - When a post is created, the webhook will fire
   - Check webhook.site to see the full request including headers
   - Look for identifying information about the source

## Method 2: Supabase Database Triggers (BEST - Logs to Database)

Run this SQL in Supabase SQL Editor:

```sql
-- Create a table to log all insertions
CREATE TABLE IF NOT EXISTS post_insertion_logs (
  id BIGSERIAL PRIMARY KEY,
  post_id INTEGER,
  inserted_at TIMESTAMP DEFAULT NOW(),
  inserted_by TEXT,
  session_user TEXT,
  application_name TEXT,
  client_addr INET,
  full_context JSONB
);

-- Create trigger function to log insertions
CREATE OR REPLACE FUNCTION log_post_insertion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO post_insertion_logs (
    post_id,
    inserted_by,
    session_user,
    application_name,
    client_addr,
    full_context
  )
  VALUES (
    NEW.id,
    current_user,
    session_user,
    current_setting('application_name', true),
    inet_client_addr(),
    jsonb_build_object(
      'title', NEW.title,
      'approval_status', NEW.approval_status,
      'search_query', NEW.search_query,
      'created_at', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to search_results table
DROP TRIGGER IF EXISTS log_search_results_insert ON search_results;
CREATE TRIGGER log_search_results_insert
  AFTER INSERT ON search_results
  FOR EACH ROW
  EXECUTE FUNCTION log_post_insertion();

-- Query to see the logs
SELECT * FROM post_insertion_logs ORDER BY inserted_at DESC LIMIT 10;
```

After running this, every post insertion will be logged with connection details!

## Method 3: Supabase Logs (Real-time)

1. **Go to Supabase Dashboard** → **Logs** → **Postgres Logs**
2. Look for `INSERT INTO search_results` statements
3. Check the connection information

## Method 4: Enable PostgreSQL Logging

Run this in Supabase SQL Editor:

```sql
-- Enable statement logging for INSERT operations
ALTER DATABASE postgres SET log_statement = 'mod';
ALTER DATABASE postgres SET log_connections = 'on';
ALTER DATABASE postgres SET log_disconnections = 'on';

-- Then check logs in Supabase Dashboard → Logs
```

## Method 5: Check Row-Level Security Policies

See if there are any bypass policies:

```sql
-- Check RLS policies on search_results
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'search_results';
```

## Method 6: Application-Level Logging (Already Done!)

I've added comprehensive logging to your `/api/posts` endpoint. Check **Vercel Logs**:

1. Go to https://vercel.com/ostomybob-design
2. Click your project
3. Go to "Deployments" → Latest deployment → "Logs"
4. Wait for next post creation
5. Look for the `🤖 POST REQUEST TO /api/posts` log
6. It will show:
   - User-Agent (identifies the bot)
   - Origin (where request came from)
   - Full request body
   - Whether approval_status was set

## 🎯 RECOMMENDED APPROACH

**Do Method 2 (Database Trigger)** - it's the most reliable and will catch ALL insertions regardless of how they happen:

1. Copy the SQL above
2. Go to Supabase → SQL Editor
3. Paste and run the SQL
4. Wait for next post
5. Run: `SELECT * FROM post_insertion_logs ORDER BY inserted_at DESC;`
6. Check the `application_name` and `client_addr` columns

This will tell you EXACTLY what's creating posts!

## 🔍 What to Look For

Once you have the logs, look for:
- **application_name**: Might say "OpenAI", "Python", "Node.js", etc.
- **client_addr**: IP address of the source
- **session_user**: Database user being used
- **User-Agent** (from Vercel logs): Will identify the bot framework

---

## Quick Wins

While investigating, I've already:
- ✅ Added logging to `/api/posts` endpoint
- ✅ Forced all new posts to "pending" status (prevents auto-approval)
- ✅ Created diagnostic script to analyze existing posts

Push the changes to Vercel and new posts will be forced to pending!
