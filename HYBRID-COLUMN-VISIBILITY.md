# Hybrid Column Visibility System

## 🎯 How It Works

Your dashboard now uses a **two-tier column visibility system**:

1. **Database Defaults** (shared across all users)
2. **Personal Overrides** (localStorage, per-user customization)

```
┌─────────────────────────────────────────┐
│  Database: Default Column Visibility   │
│  (What everyone sees by default)       │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  localStorage: Personal Overrides       │
│  (Your customizations only)             │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Final Column Visibility                │
│  (Defaults + Your Overrides)            │
└─────────────────────────────────────────┘
```

## 📋 Step 1: Run Database Migration

**Go to Supabase → SQL Editor** and run:

```sql
-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  preference_key VARCHAR(100) UNIQUE NOT NULL,
  preference_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP(6) DEFAULT NOW(),
  updated_at TIMESTAMP(6) DEFAULT NOW()
);

-- Create index
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

-- Verification
SELECT * FROM user_preferences WHERE preference_key LIKE 'column_visibility_%';
```

## 🎨 Step 2: Set Default Column Visibility (As Admin)

You can now set which columns show **by default** for all users:

### Option A: Via SQL (Quick)

Example: Hide "Scheduled" column by default in Draft tab:

```sql
UPDATE user_preferences
SET preference_value = '{"late_scheduled_for": false}'::jsonb,
    updated_at = NOW()
WHERE preference_key = 'column_visibility_draft';
```

Example: Hide multiple columns in Approved tab:

```sql
UPDATE user_preferences
SET preference_value = '{"rejection_reason": false, "late_post_id": false}'::jsonb,
    updated_at = NOW()
WHERE preference_key = 'column_visibility_approved';
```

### Option B: Via API (Programmatic)

```javascript
// Set defaults via API
await fetch('/api/preferences', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'column_visibility_draft',
    value: {
      "late_scheduled_for": false,
      "late_published_at": false,
      "rejection_reason": false
    }
  })
});
```

## 👤 How Users Override Defaults

Users simply use the column visibility menu in the UI:
1. Click the **Columns** button (3 vertical lines icon)
2. Check/uncheck columns
3. Their choices are saved to localStorage
4. **Their overrides take precedence** over database defaults

## 📊 Column Names Reference

Common column IDs you can hide by default:

- `id` - Post ID
- `title` - Title
- `url` - URL
- `snippet` - Snippet  
- `ai_caption` - Body/Caption
- `main_image_url` - Image
- `ai_hashtags` - Hashtags
- `approval_status` - Approval Status
- `late_scheduled_for` - Scheduled
- `late_published_at` - Published
- `late_platforms` - Platforms
- `rejection_reason` - Rejection Reason
- `status` - Status Badge
- `actions` - Actions

## 🔄 How It Works Technically

1. **On Page Load**:
   - Fetch database defaults for current tab
   - Load localStorage overrides (if any)
   - Merge: `{...defaults, ...userOverrides}`

2. **When User Changes Columns**:
   - Calculate difference from defaults
   - Save only the differences to localStorage
   - This keeps localStorage small and efficient

3. **For New Users**:
   - They see database defaults
   - No localStorage clutter initially
   - Only saves when they customize

## 💡 Example Workflow

**As Admin**, you decide:
- Draft tab: Hide "Scheduled", "Published", "Rejection Reason" by default
- Scheduled tab: Hide "Rejection Reason" by default
- Everyone sees these defaults

**As User**, Bob:
- Sees your defaults
- Decides to also hide "URL" in Draft tab
- His localStorage saves: `{"url": false}`
- His final view: Your defaults + his override

**As User**, Alice:
- Sees your defaults
- Decides to show "Rejection Reason" in Draft tab (opposite of default)
- Her localStorage saves: `{"rejection_reason": true}`
- Her final view: Your defaults + her override

## 🎉 Benefits

✅ **Consistency**: All users start with same clean view  
✅ **Flexibility**: Each user can customize their own experience  
✅ **Scalability**: Easy to update defaults for everyone  
✅ **Performance**: Only stores overrides, not entire config  
✅ **Per-Tab**: Different defaults for each tab  

---

**Next**: Run the migration, then set your default column visibility preferences!
