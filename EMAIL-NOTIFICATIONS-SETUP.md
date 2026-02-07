# 📧 Email Notifications Setup Guide

## Overview
Your dashboard now sends email notifications for critical events to help you stay informed about your posting queue.

## What You'll Get Notified About

### 1. ⚠️ No Posts Available
**When:** Late.dev tries to schedule but there are no approved posts
**Includes:**
- Time of the alert
- Next scheduled queue slot
- Number of approved posts (0)
- Number of pending posts available
- Action buttons to go to dashboard

### 2. ❌ Post Failed to Publish
**When:** A post fails to publish to social media
**Includes:**
- Post ID and title
- Platform it failed on
- Error message
- Action button to view the post

### 3. 🤖 Away Mode Auto-Approval
**When:** System automatically approves posts because you're away
**Includes:**
- Date of the away day
- Number of posts auto-approved
- When they're scheduled for
- Link to review the posts

### 4. ⚠️ Insufficient Posts for Away Days
**When:** You set away days but don't have enough posts to cover them
**Includes:**
- Number of away days set
- Approved posts count
- Pending posts count
- Total available vs needed
- Action button to add more posts

## Setup Instructions

### Step 1: Add Environment Variables to Vercel

1. Go to https://vercel.com/ostomybob-design/projects
2. Click on your project
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar
5. Add these two variables:

**Variable 1:**
```
Name: RESEND_API_KEY
Value: re_itDcKDDS_3JxzUg7qCmGBuuDxejr6xPMq
Environment: ✓ Production ✓ Preview ✓ Development
```

**Variable 2:**
```
Name: NOTIFICATION_EMAIL
Value: ostomybob@gmail.com
Environment: ✓ Production ✓ Preview ✓ Development
```

6. Click **Save** for each
7. **Redeploy** your application

### Step 2: Verify Resend Domain (Important!)

Resend has a **default sending domain** (notifications@resend.dev) that works immediately but has limitations. For better deliverability:

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Add your domain (e.g., ostomyhub.com)
4. Follow their DNS setup instructions
5. Once verified, update `lib/email-notifications.ts`:
   ```typescript
   from: 'Ostomy Dashboard <notifications@ostomyhub.com>'
   ```

**For now**, emails will come from `notifications@resend.dev` which works fine for testing!

## Email Templates

All emails include:
- **Professional HTML formatting**
- **Color-coded alerts** (red for urgent, orange for warnings)
- **Detailed information** about what happened
- **Action buttons** linking to your dashboard
- **Mobile-responsive** design

## Monitoring Endpoint

We've added `/api/check-post-availability` that you can:
- Call manually to check status
- Set up as a **Vercel Cron Job** to run hourly/daily
- Use with monitoring tools like UptimeRobot

### Optional: Set Up Daily Check (Recommended)

1. Create `/vercel.json` in your project root:
```json
{
  "crons": [{
    "path": "/api/check-post-availability",
    "schedule": "0 9 * * *"
  }]
}
```

This checks every day at 9 AM and sends an email if no posts are available.

## Testing Notifications

### Test 1: Insufficient Posts Warning
1. Clear all approved posts
2. Go to Away Mode
3. Select 5 days in the future
4. Save
5. You should get an email about insufficient posts

### Test 2: Auto-Approval Notification
1. Have 1+ away day set
2. Have pending posts but no approved posts
3. Approve a post and schedule it
4. If it schedules for an away day, you'll get auto-approval email

### Test 3: Post Failed (Manual)
Create a test post with invalid data and try to schedule - you'll get failure notification

## Troubleshooting

### Not Receiving Emails?

1. **Check Spam Folder** - Resend emails might go to spam initially
2. **Verify API Key** - Make sure it's correct in Vercel environment variables
3. **Check Resend Dashboard** - https://resend.com/emails shows all sent emails
4. **Verify Email Address** - Make sure ostomybob@gmail.com is correct
5. **Redeploy** - Environment variables only take effect after redeployment

### Email Formatting Issues?
All emails are responsive HTML. If they look weird, try viewing in a different email client.

## Resend Free Tier Limits

- **100 emails per day**
- **3,000 emails per month**
- More than enough for notifications!

## Future Enhancements

Possible additions:
- Daily digest of queue status
- Weekly summary of posts published
- Slack/Discord notifications
- SMS notifications via Twilio
- Custom notification preferences (turn on/off each type)

## Support

If you have issues:
1. Check Vercel logs for error messages
2. Check Resend dashboard for delivery status
3. Verify environment variables are set correctly
4. Make sure you redeployed after adding variables

---

**You're all set!** 🎉 You'll now get emails whenever important events happen with your posting queue.
