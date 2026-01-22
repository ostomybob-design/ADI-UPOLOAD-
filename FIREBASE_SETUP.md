# Firebase/Firestore Setup for Admin Panel

## ✅ What Changed
The admin panel now uses **Firestore** (Firebase) instead of Supabase for:
- Ticker messages (`ticker_messages` collection)
- Quotes (`quotes` collection)
- Joke of the day (`joke_of_the_day` collection)

Posts still use **Supabase** (no changes there).

---

## 🔧 Setup Instructions

### 1. Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one if needed)
3. Click **Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

### 2. Add Environment Variables to Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to your project → **Settings** → **Environment Variables**
3. Add these 3 variables from your downloaded JSON:

```
FIREBASE_PROJECT_ID = your-project-id
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n
```

**Important for FIREBASE_PRIVATE_KEY:**
- Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters as-is (Vercel will handle them)

### 3. Redeploy

Vercel will automatically redeploy when you push to git. If not, manually trigger a redeploy.

### 4. Test the Admin Panel

1. Go to https://ostomybuddy-dashboard.vercel.app/admin
2. You should see 3 tabs: **Ticker Messages**, **Quotes**, **Joke of the Day**
3. Try adding a ticker message - if it works, Firebase is connected!

---

## 📦 Collections Created Automatically

The collections will be created automatically when you add your first item:
- `ticker_messages` - with fields: message, is_active, order_index, created_at, updated_at
- `quotes` - with fields: quote, author, category, is_active, created_at, updated_at
- `joke_of_the_day` - with fields: joke, punchline, date, is_active, created_at, updated_at

No manual database setup needed! Just add the environment variables and start using it.

---

## 🎯 Next Steps

Once Firebase is connected, you can:
1. Add ticker messages for your dashboard
2. Add inspirational quotes
3. Add daily jokes

To display these on your main dashboard, you'll need to:
1. Create public API endpoints (e.g., `/api/ticker/active`)
2. Add UI components to display ticker tape, quotes, jokes
3. Integrate them into your dashboard layout

Need help with integration? Let me know!
