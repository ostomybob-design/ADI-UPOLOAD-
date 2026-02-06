# 🏖️ Away Mode Feature Documentation

## Overview
Away Mode allows you to mark days when you'll be away, and the system will automatically approve posts as needed to keep your Late.dev queue filled.

## How It Works

### 1. **Setting Away Days**
- Click the "Away Mode" button in the header (next to "Scheduling")
- A calendar dialog appears
- Click on dates to select/deselect away days
- Past dates are grayed out and cannot be selected
- Click "Save Away Days" to save your selection

### 2. **Visual Indicators**
The Away Mode button shows the current status:

- **No away days**: Normal button appearance
- **Away days set**: 
  - Red border around button
  - Orange badge with count (e.g., "3" for 3 days)
  - Hover shows: "3 day(s) set to away mode"
  
- **Insufficient posts warning**:
  - Red badge instead of orange
  - Red plane icon
  - Hover shows: "5 days set - insufficient posts available!"

### 3. **Just-in-Time Auto-Approval**
When you approve and schedule posts:

1. System gets the next available queue slot from Late.dev
2. Checks if that date is marked as an away day
3. If yes, checks if enough approved posts are available
4. If not enough approved posts:
   - Automatically selects the **oldest pending posts**
   - Auto-approves them with `approved_by: "away-mode-auto"`
   - Logs the action in console
5. Continues with normal scheduling

### 4. **Database Structure**

```sql
CREATE TABLE away_mode (
  id SERIAL PRIMARY KEY,
  away_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### GET `/api/away-mode`
Fetches all away days and post availability stats

**Response:**
```json
{
  "awayDays": [
    { "id": 1, "away_date": "2026-02-15T00:00:00.000Z", ... }
  ],
  "stats": {
    "approvedPosts": 5,
    "pendingPosts": 12
  }
}
```

### POST `/api/away-mode`
Save away days (replaces all existing)

**Request:**
```json
{
  "awayDates": ["2026-02-15", "2026-02-16", "2026-02-17"]
}
```

**Response:**
```json
{
  "success": true,
  "count": 3
}
```

### DELETE `/api/away-mode`
Clear all away days

**Response:**
```json
{
  "success": true,
  "message": "All away days cleared"
}
```

## Key Files

- **Component**: `components/away-mode-modal.tsx` - Calendar UI
- **Header Integration**: `components/dashboard/header.tsx` - Button and status
- **API**: `app/api/away-mode/route.ts` - CRUD operations
- **Auto-Approval Logic**: `lib/away-mode-utils.ts` - Just-in-time approval
- **Integration**: `app/api/posts/approve/route.ts` - Scheduling workflow
- **Database**: `prisma/schema.prisma` - away_mode model

## Usage Example

1. **User going on vacation Feb 15-20:**
   - Opens Away Mode
   - Selects Feb 15, 16, 17, 18, 19, 20
   - Saves

2. **Auto-approval in action:**
   - User approves a post to schedule to Late.dev
   - Late.dev says next slot is Feb 16 at 2pm
   - System checks: "Is Feb 16 an away day?" → Yes!
   - System checks: "Do we have approved posts?" → Only 0
   - System auto-approves 1 oldest pending post
   - Post gets scheduled to Feb 16 at 2pm
   - User's queue stays filled even while away

## Future Enhancements

Potential improvements for the feature:
- Calculate posts needed based on actual Late.dev queue schedule (e.g., 2x/day = 10 posts for 5 days)
- Allow selecting date ranges instead of individual days
- Show preview of which posts will be auto-approved
- Email/notification when auto-approval happens
- Set different auto-approval rules per away day
- Bulk delete away days by date range

## Security Notes

- Only affects **future** scheduling operations
- Does not retroactively change existing posts
- Auto-approved posts are marked with `approved_by: "away-mode-auto"` for tracking
- Always approves oldest pending posts first (FIFO)
- Away days are stored in database (persists across sessions)
