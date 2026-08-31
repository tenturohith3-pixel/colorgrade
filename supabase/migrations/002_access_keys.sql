-- ============================================================
-- Access Keys Migration
-- Creates the access_keys table for key-based tier access.
-- ============================================================

CREATE TABLE IF NOT EXISTS access_keys (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key_code      TEXT NOT NULL UNIQUE,
  tier          TEXT NOT NULL CHECK (tier IN ('basic', 'pro', 'studio', 'lifetime')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  expires_at    TIMESTAMPTZ,  -- NULL for lifetime keys
  used_by       TEXT,          -- browser fingerprint / session identifier
  used_at       TIMESTAMPTZ,
  is_consumed   BOOLEAN DEFAULT false,
  consumed_by   TEXT           -- who consumed it (for audit)
);

-- Index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_access_keys_key_code ON access_keys (key_code);
CREATE INDEX IF NOT EXISTS idx_access_keys_tier ON access_keys (tier);
CREATE INDEX IF NOT EXISTS idx_access_keys_is_consumed ON access_keys (is_consumed);

-- RLS — service role bypasses, but add basic policies
ALTER TABLE access_keys ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything (for API routes)
CREATE POLICY "Service role full access" ON access_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Public can read key existence (for validation endpoint)
CREATE POLICY "Public can validate keys" ON access_keys
  FOR SELECT
  USING (true);

-- ============================================================
-- Helper: Generate a batch of access keys
-- Usage: SELECT generate_access_keys('pro', 10);
-- ============================================================
CREATE OR REPLACE FUNCTION generate_access_keys(
  p_tier TEXT,
  p_count INTEGER
)
RETURNS TABLE(key_code TEXT, tier TEXT, expires_at TIMESTAMPTZ) AS $$
DECLARE
  i INTEGER;
  new_key TEXT;
  new_expires TIMESTAMPTZ;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- no I,O,0,1 to avoid confusion
  segment TEXT;
  j INTEGER;
BEGIN
  FOR i IN 1..p_count LOOP
    -- Generate CG-XXXX-XXXX-XXXX format
    new_key := 'CG-';
    FOR j IN 1..3 LOOP
      segment := '';
      FOR k IN 1..4 LOOP
        segment := segment || substr(chars, floor(random() * length(chars) + 1)::int, 1);
      END LOOP;
      new_key := new_key || segment;
      IF j < 3 THEN
        new_key := new_key || '-';
      END IF;
    END LOOP;

    -- Calculate expiration based on tier
    CASE p_tier
      WHEN 'basic' THEN new_expires := now() + INTERVAL '7 days';
      WHEN 'pro' THEN new_expires := now() + INTERVAL '30 days';
      WHEN 'studio' THEN new_expires := now() + INTERVAL '365 days';
      WHEN 'lifetime' THEN new_expires := NULL;
      ELSE RAISE EXCEPTION 'Invalid tier: %', p_tier;
    END CASE;

    INSERT INTO access_keys (key_code, tier, expires_at)
    VALUES (new_key, p_tier, new_expires);

    key_code := new_key;
    tier := p_tier;
    expires_at := new_expires;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
