-- =============================================
-- ColorGrade — Supabase Schema & RLS Policies
-- =============================================
-- Run this in the Supabase SQL Editor to set up
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
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'inr',
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ── User Profiles Policies ────────────────────
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup trigger)
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Public profiles are viewable by anyone (for avatars etc.)
CREATE POLICY "Public profiles are viewable"
  ON public.user_profiles
  FOR SELECT
  USING (TRUE);

-- ── Grading Jobs Policies ─────────────────────
-- Users can only see their own grading jobs
CREATE POLICY "Users can view own grading jobs"
  ON public.grading_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own grading jobs
CREATE POLICY "Users can create own grading jobs"
  ON public.grading_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own grading jobs (for status changes)
CREATE POLICY "Users can update own grading jobs"
  ON public.grading_jobs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own grading jobs
CREATE POLICY "Users can delete own grading jobs"
  ON public.grading_jobs
  FOR DELETE
  USING (auth.uid() = user_id);

-- ── User Presets Policies ─────────────────────
-- Users can view their own presets
CREATE POLICY "Users can view own presets"
  ON public.user_presets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view public presets (shared presets)
CREATE POLICY "Users can view public presets"
  ON public.user_presets
  FOR SELECT
  USING (is_public = TRUE);

-- Users can create their own presets
CREATE POLICY "Users can create own presets"
  ON public.user_presets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own presets
CREATE POLICY "Users can update own presets"
  ON public.user_presets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own presets
CREATE POLICY "Users can delete own presets"
  ON public.user_presets
  FOR DELETE
  USING (auth.uid() = user_id);

-- ── Payments Policies ─────────────────────────
-- Users can only see their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert payments (from webhook)
CREATE POLICY "Service role can insert payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (TRUE);

-- Service role can update payments (from webhook)
CREATE POLICY "Service role can update payments"
  ON public.payments
  FOR UPDATE
  WITH CHECK (TRUE);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-create user profile on signup
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

-- Trigger: create profile on new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_presets_updated_at
  BEFORE UPDATE ON public.user_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_grading_jobs_user_id ON public.grading_jobs(user_id);
CREATE INDEX idx_grading_jobs_status ON public.grading_jobs(status);
CREATE INDEX idx_user_presets_user_id ON public.user_presets(user_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_stripe_session ON public.payments(stripe_session_id);
