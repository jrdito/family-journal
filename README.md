# 📔 Family Journal

A full-stack family journal web app to record places, events, memories, and photos.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Server Actions
- **Auth**: Supabase Auth (Email + Google OAuth)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Deployment**: Vercel
- **Bot**: Telegram Webhook
- **Export**: XLSX

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd family-journal
npm install
cp .env.example .env.local
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **Anon Key** from Settings → API

### 3. Run Database Schema

In Supabase → SQL Editor:

```sql
-- Run these files in order:
-- 1. supabase/schema.sql
-- 2. supabase/policies.sql
```

### 4. Create Storage Bucket

In Supabase → Storage → New Bucket:
- **Name**: `journal-photos`
- **Public**: OFF (private)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/jpeg, image/png, image/webp`

Then add storage policies in SQL Editor:

```sql
-- Allow authenticated users to upload to their folder
CREATE POLICY "storage_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'journal-photos' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow users to view their own photos
CREATE POLICY "storage_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'journal-photos' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow users to delete their own photos
CREATE POLICY "storage_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'journal-photos' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );
```

### 5. Enable Auth Providers

**Email Auth**:
- Supabase → Authentication → Providers → Email → Enable

**Google OAuth**:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → Enable Google+ API
3. OAuth 2.0 → Create credentials → Web application
4. Authorized redirect URIs: `https://<your-project>.supabase.co/auth/v1/callback`
5. Copy Client ID & Secret
6. Supabase → Authentication → Providers → Google → Enable → Paste credentials

### 6. Create Telegram Bot

1. Open Telegram → Search `@BotFather`
2. Send `/newbot` and follow prompts
3. Copy the **Bot Token**
4. Generate a random webhook secret: `openssl rand -hex 32`

### 7. Fill Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
TELEGRAM_BOT_TOKEN=1234567890:AABBccDD...
TELEGRAM_WEBHOOK_SECRET=your_random_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ NEVER commit `.env.local`. Only `.env.example` goes to git.

### 8. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/yourname/family-journal.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Add all environment variables (same as `.env.local`)
4. Change `NEXT_PUBLIC_APP_URL` to your Vercel URL
5. Click **Deploy**

### 3. Set Telegram Webhook

After deploying, run this once:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.vercel.app/api/telegram/webhook",
    "secret_token": "your_webhook_secret"
  }'
```

Or open in browser:
```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram/webhook
```

---

## 👤 Create Admin User

After registering your first account, run this in Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your@email.com';
```

---

## 🤖 Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/help` | Show all commands |
| `/link` | Get a code to link your account |
| `/add_place` | Add a new place (step by step) |
| `/add_event` | Add a new event (step by step) |
| `/wishlist` | View your wishlist |
| `/visited` | View visited places |
| `/search <name>` | Search your journals |
| `/random` | Random journal suggestion |
| `/toprated` | Top rated places |

### Linking Telegram Account

1. Send `/link` to the bot → get a 6-character code
2. Go to **Profile** page on the web app
3. Enter the code in the **Telegram** section
4. Done! You can now add entries via Telegram.

---

## 📁 Project Structure

```
family-journal/
├── app/
│   ├── (app)/                  # Protected routes (with sidebar)
│   │   ├── dashboard/          # Main dashboard
│   │   ├── journals/           # Journal CRUD
│   │   ├── wishlist/           # Wishlist page
│   │   ├── visited/            # Visited page
│   │   ├── timeline/           # Memory timeline
│   │   ├── profile/            # Profile + Telegram
│   │   └── admin/              # Admin panel
│   ├── api/
│   │   ├── export/             # XLSX export
│   │   └── telegram/webhook/   # Telegram bot
│   ├── auth/callback/          # OAuth callback
│   ├── login/                  # Login page
│   ├── register/               # Register page
│   └── page.tsx                # Landing page
├── components/
│   ├── dashboard/              # Dashboard charts
│   ├── journal/                # Journal components
│   ├── ui/                     # Shared UI components
│   ├── AppSidebar.tsx
│   ├── AppHeader.tsx
│   ├── ProfileForm.tsx
│   └── TelegramLinkSection.tsx
├── lib/
│   ├── supabase.ts             # Browser client
│   ├── supabase-server.ts      # Server client + admin
│   └── utils.ts                # Utilities
├── types/
│   └── index.ts                # TypeScript types
├── supabase/
│   ├── schema.sql              # Database schema
│   └── policies.sql            # RLS policies
└── middleware.ts               # Auth middleware
```

---

## 🔒 Security

- Supabase RLS enabled on all tables — users only see their own data
- Service Role key never exposed to client
- Telegram webhook verified with secret token
- File uploads validated for type and size
- Passwords handled by Supabase Auth (bcrypt)

---

## 📦 Features

- ✅ Email + Google OAuth login
- ✅ Full CRUD for Places & Events
- ✅ Photo upload to Supabase Storage
- ✅ Dashboard with charts (Recharts)
- ✅ Wishlist, Visited, Timeline views
- ✅ Filters: type, status, category, city, verdict, kid-friendly
- ✅ Sort: newest, oldest, highest rating
- ✅ Telegram Bot for adding entries
- ✅ Export to XLSX
- ✅ Admin panel
- ✅ Dark mode toggle
- ✅ Fully responsive (mobile-first)
