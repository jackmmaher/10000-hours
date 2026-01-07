-- Migration: Allow seeded pearls without user_id
-- This enables community-seeded content without fake user accounts

-- Allow NULL user_id for seeded/system pearls
ALTER TABLE public.pearls ALTER COLUMN user_id DROP NOT NULL;

-- Add index for filtering seeded vs user pearls
CREATE INDEX IF NOT EXISTS pearls_user_id_idx ON public.pearls(user_id);

-- Note: Seeded pearls are identifiable by user_id IS NULL
-- User-created pearls always have user_id pointing to their profile
