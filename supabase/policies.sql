-- ============================================================
-- FAMILY JOURNAL — ROW LEVEL SECURITY POLICIES
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_journals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_photos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_user_links  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES policies
-- ============================================================

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- FAMILY_JOURNALS policies
-- ============================================================

-- Users can select only their own journals
CREATE POLICY "journals_select_own"
  ON public.family_journals FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can select all journals
CREATE POLICY "journals_select_admin"
  ON public.family_journals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Users can insert their own journals
CREATE POLICY "journals_insert_own"
  ON public.family_journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own journals
CREATE POLICY "journals_update_own"
  ON public.family_journals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own journals
CREATE POLICY "journals_delete_own"
  ON public.family_journals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- JOURNAL_PHOTOS policies
-- ============================================================

-- Users can select their own photos
CREATE POLICY "photos_select_own"
  ON public.journal_photos FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can select all photos
CREATE POLICY "photos_select_admin"
  ON public.journal_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Users can insert their own photos
CREATE POLICY "photos_insert_own"
  ON public.journal_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "photos_delete_own"
  ON public.journal_photos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TELEGRAM_USER_LINKS policies
-- ============================================================

-- Users can select their own telegram link
CREATE POLICY "telegram_select_own"
  ON public.telegram_user_links FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert telegram links (for linking)
CREATE POLICY "telegram_insert_own"
  ON public.telegram_user_links FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own telegram link
CREATE POLICY "telegram_update_own"
  ON public.telegram_user_links FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can delete their own telegram link
CREATE POLICY "telegram_delete_own"
  ON public.telegram_user_links FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE POLICIES (run separately or via Supabase dashboard)
-- ============================================================

-- Create storage bucket (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('journal-photos', 'journal-photos', false);

-- Storage: Users can upload to their own folder
-- CREATE POLICY "storage_upload_own"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'journal-photos' AND
--     auth.uid()::text = (storage.foldername(name))[2]
--   );

-- Storage: Users can view their own photos
-- CREATE POLICY "storage_select_own"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'journal-photos' AND
--     auth.uid()::text = (storage.foldername(name))[2]
--   );

-- Storage: Users can delete their own photos
-- CREATE POLICY "storage_delete_own"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'journal-photos' AND
--     auth.uid()::text = (storage.foldername(name))[2]
--   );
