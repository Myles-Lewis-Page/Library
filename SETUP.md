# Library Manager — Setup & Deploy Guide

---

## Overview

| Layer      | Service    | Cost  |
|------------|------------|-------|
| Database   | Supabase   | Free  |
| Auth       | Supabase   | Free  |
| Frontend   | Netlify    | Free  |
| Source code| GitHub     | Free  |

---

## Step 1 — Supabase (Database + Auth)

1. Go to https://supabase.com and sign up / log in
2. Click **New project**, name it `library-manager`, set a strong DB password, pick a region
3. Wait ~2 minutes for it to provision

### Run the database setup

4. In the left sidebar click **SQL Editor**
5. Click **New query**
6. Open the file `sql/setup.sql` from this project
7. Paste the entire contents into the editor
8. Click **Run** — you should see "Success" for each statement

### Create your staff login

9. In the left sidebar click **Authentication → Users**
10. Click **Add user → Create new user**
11. Enter your email and a strong password — this is what you'll use to log in to the app
12. Click **Create user**

### Get your API keys

13. In the left sidebar click **Project Settings → API**
14. Copy two values:
    - **Project URL** (looks like `https://abcdefgh.supabase.co`)
    - **anon public** key (long string starting with `eyJ...`)

---

## Step 2 — Configure the app

15. Open `js/config.js` in a text editor
16. Replace the placeholder values:

```js
const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';  // ← paste Project URL
const SUPABASE_ANON = 'YOUR_ANON_PUBLIC_KEY';                 // ← paste anon key
```

17. Save the file

---

## Step 3 — Push to GitHub

> If you don't have Git installed: https://git-scm.com/downloads

Open a terminal in the `library-manager` folder and run:

```bash
git init
git add .
git commit -m "Initial library manager setup"
```

Then on https://github.com:
1. Click **+** → **New repository**
2. Name it `library-manager`, set to Public or Private
3. **Do not** initialize with README (you already have files)
4. Copy the commands GitHub shows under "push an existing repository":

```bash
git remote add origin https://github.com/YOUR_USERNAME/library-manager.git
git branch -M main
git push -u origin main
```

---

## Step 4 — Deploy on Netlify

1. Go to https://netlify.com and sign up / log in (use GitHub to sign in for easiest setup)
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** and authorize Netlify
4. Select your `library-manager` repository
5. Leave all build settings blank (no build command, no publish directory needed — it's plain HTML)
6. Click **Deploy site**

Netlify will give you a URL like `https://jolly-cupcake-123.netlify.app`.
You can set a custom domain in Site Settings → Domain management.

### Auto-deploys
Every time you `git push` to GitHub, Netlify automatically re-deploys. Your live site is always in sync with your repo.

---

## Step 5 — Test it

1. Open your Netlify URL
2. Sign in with the email/password you created in Supabase Step 12
3. The sample data (books and patrons) from the SQL script will already be there
4. Add a book → check Supabase Table Editor to confirm it saved instantly

---

## Adding more staff accounts

- Go to Supabase → Authentication → Users → Add user
- Each staff member gets their own email/password login
- All staff see the same live database

---

## Project structure

```
library-manager/
├── index.html          ← Main app (all tabs, modals)
├── css/
│   └── styles.css      ← All styling
├── js/
│   ├── config.js       ← ⚠ Your Supabase URL and key go here
│   └── app.js          ← All logic, Supabase calls, rendering
├── sql/
│   └── setup.sql       ← Run once in Supabase SQL Editor
└── .gitignore
```

---

## Notes

- **config.js** contains your anon key — this is safe to commit to a public repo.
  The anon key only allows what Row Level Security permits (authenticated users only).
- **Never commit** your Supabase service_role key (that's the secret one — you won't need it here).
- The email reminder system logs emails to the `email_log` table.
  To actually send emails, connect a service like Resend or SendGrid to a Supabase Edge Function (optional upgrade).
