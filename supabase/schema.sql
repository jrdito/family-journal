-- ============================================================
-- FAMILY JOURNAL — DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    TEXT,
  last_name     TEXT,
  display_name  TEXT,
  email         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'admin')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. FAMILY JOURNALS TABLE
CREATE TABLE IF NOT EXISTS public.family_journals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('PLACE', 'EVENT')),
  name             TEXT NOT NULL,
  category         TEXT,
  city             TEXT,
  address          TEXT,
  location_name    TEXT,
  google_maps_url  TEXT,
  status           TEXT NOT NULL
                     CHECK (status IN ('WISHLIST', 'VISITED', 'ATTENDED', 'UPCOMING', 'CANCELLED')),
  visit_date       DATE,
  event_start_date DATE,
  event_end_date   DATE,
  event_time       TIME,
  ticket_price     NUMERIC,
  ticket_link      TEXT,
  rating           NUMERIC CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  kid_friendly     BOOLEAN NOT NULL DEFAULT FALSE,
  budget_estimate  NUMERIC,
  family_verdict   TEXT
                     CHECK (family_verdict IS NULL OR
                            family_verdict IN ('MUST TRY','WORTH IT','BIASA AJA','SKIP','COMEBACK')),
  notes            TEXT,
  source           TEXT NOT NULL DEFAULT 'WEB'
                     CHECK (source IN ('WEB', 'TELEGRAM')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. JOURNAL PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.journal_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id  UUID NOT NULL REFERENCES public.family_journals(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name   TEXT,
  file_path   TEXT,
  file_url    TEXT,
  mime_type   TEXT,
  file_size   BIGINT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TELEGRAM USER LINKS TABLE
CREATE TABLE IF NOT EXISTS public.telegram_user_links (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id      TEXT UNIQUE,
  telegram_username TEXT,
  link_code        TEXT,
  is_linked        BOOLEAN NOT NULL DEFAULT FALSE,
  linked_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_family_journals_user_id    ON public.family_journals(user_id);
CREATE INDEX IF NOT EXISTS idx_family_journals_type       ON public.family_journals(type);
CREATE INDEX IF NOT EXISTS idx_family_journals_status     ON public.family_journals(status);
CREATE INDEX IF NOT EXISTS idx_family_journals_created_at ON public.family_journals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_photos_journal_id  ON public.journal_photos(journal_id);
CREATE INDEX IF NOT EXISTS idx_journal_photos_user_id     ON public.journal_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_links_telegram_id ON public.telegram_user_links(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_links_link_code   ON public.telegram_user_links(link_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_telegram_links_unique_pending_code ON public.telegram_user_links(link_code) WHERE is_linked = false;

-- ============================================================
-- AUTO-UPDATE updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trigger_journals_updated_at
  BEFORE UPDATE ON public.family_journals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE on new user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'given_name', NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'family_name', NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
