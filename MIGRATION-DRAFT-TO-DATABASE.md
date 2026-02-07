# Migration Guide: localStorage to Database for Drafts

## 🎯 Goal
Eliminate localStorage completely and store ALL posts (including drafts) in the database.
This allows multiple users to collaborate and access drafts from any device/browser.

## 📋 Step 1: Run Database Migration (REQUIRED FIRST!)

**Go to your Supabase Dashboard → SQL Editor** and run this:

```sql
-- Add is_draft column
ALTER TABLE search_results
ADD COLUMN is_draft BOOLEAN DEFAULT false;

-- Create index for faster filtering
CREATE INDEX idx_is_draft ON search_results(is_draft);

-- Verification
SELECT 
    COUNT(*) as total_posts,
    COUNT(*) FILTER (WHERE is_draft = true) as draft_posts,
    COUNT(*) FILTER (WHERE is_draft = false) as non_draft_posts
FROM search_results;
```

## 📋 Step 2: Deploy Code Changes

The code has been updated to:

### ✅ Completed Changes:
1. **Schema**: Added `is_draft` field to prisma/schema.prisma
2. **Dashboard page.tsx**: Removed localStorage draft loading
3. **columns.tsx**: 
   - `handleMoveToDrafts` now sets `is_draft = true` in database
   - `handleMoveToReadyToPost` now sets `is_draft = false` in database
   - `handleReject` simplified (no localStorage logic)
   - Removed `draftUtils` import
4. **Filtering**: Draft tab now filters by `post.is_draft === true`

### 🔄 Still TODO:
1. **create-post-modal.tsx**: Update to save drafts to database instead of localStorage
2. **edit-post-modal.tsx**: Same as above
3. **row-actions.tsx**: Remove localStorage delete logic
4. **/api/posts route**: Handle creating posts with `is_draft: true`

## 📋 Step 3: Optional - Migrate Existing localStorage Drafts

If you have important drafts in localStorage that you want to keep, you can manually:
1. Open each draft in the current system
2. Click "Save as Draft" (after we finish the migration)
3. They'll be saved to the database

OR clear localStorage to start fresh:
```javascript
// Run in browser console
localStorage.removeItem('post_drafts');
localStorage.removeItem('postDrafts');
```

## 🚀 Benefits After Migration

✅ **Collaboration**: All team members see the same drafts
✅ **No Data Loss**: Drafts persist even if browser cache is cleared
✅ **Cross-Device**: Access drafts from any computer/browser
✅ **Reliability**: No more localStorage mismatches or sync issues
✅ **Backup**: Drafts are backed up with your database

## ⚠️ Important Notes

- **Run the SQL migration FIRST** before deploying the new code
- Existing localStorage drafts won't automatically migrate
- Once migrated, there's no going back to localStorage (but that's a good thing!)

---

**Current Status**: Database schema updated, action handlers updated. 
**Next**: Update create/edit modals to save drafts to database.
