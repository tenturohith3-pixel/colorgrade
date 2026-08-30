-- =============================================
-- ColorGrade (ezcc) — Supabase Schema & RLS
-- =============================================
-- Run this in Supabase SQL Editor to set up
-- the database with Row Level Security.
-- =============================================

-- ── Enable UUID extension ──────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── User Profiles Table ───────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'trial', 'basic', 'pro', 'lifetime')),
  trial_ends_at TIMESTAMPTZ,
  clips_remaining INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  age_verified BOOLEAN DEFAULT FALSE,
  parental_consent BOOLEAN DEFAULT FALSE,
  parent_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Grading Jobs Table ────────────────────────
CREATE TABLE IF NOT EXISTS public.grading_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  input_url TEXT,
  output_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ── User Presets Table ────────────────────────
CREATE TABLE IF NOT EXISTS public.user_presets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Payments Table ────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'inr',
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ── User Profiles ─────────────────────────────
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable"
  ON public.user_profiles FOR SELECT USING (TRUE);

-- ── Grading Jobs ──────────────────────────────
CREATE POLICY "Users can view own grading jobs"
  ON public.grading_jobs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own grading jobs"
  ON public.grading_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grading jobs"
  ON public.grading_jobs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grading jobs"
  ON public.grading_jobs FOR DELETE USING (auth.uid() = user_id);

-- ── User Presets ──────────────────────────────
CREATE POLICY "Users can view own presets"
  ON public.user_presets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public presets"
  ON public.user_presets FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can create own presets"
  ON public.user_presets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presets"
  ON public.user_presets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets"
  ON public.user_presets FOR DELETE USING (auth.uid() = user_id);

-- ── Payments ──────────────────────────────────
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- Payments are managed server-side via service role only.
-- No direct user access to other users' payments.
-- RLS blocks all direct access; service role bypasses RLS.

-- =============================================
-- STORAGE BUCKET
-- =============================================

-- Create storage bucket for graded images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'graded-images',
  'graded-images',
  true,
  20971520,  -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/tiff']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'graded-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'graded-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public can view graded images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'graded-images');

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'graded-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_presets_updated_at
  BEFORE UPDATE ON public.user_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_grading_jobs_user_id ON public.grading_jobs(user_id);
CREATE INDEX idx_grading_jobs_status ON public.grading_jobs(status);
CREATE INDEX idx_user_presets_user_id ON public.user_presets(user_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_stripe_session ON public.payments(stripe_session_id);
CREATE INDEX idx_user_profiles_stripe_customer ON public.user_profiles(stripe_customer_id);
