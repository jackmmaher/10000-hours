-- Completions Received Migration
-- Adds denormalized total_completions_received to profiles for direct attribution
-- Run this in Supabase SQL Editor AFTER two_way_validation_migration.sql

-- ===========================================
-- ADD COMPLETIONS RECEIVED TO PROFILES
-- ===========================================

-- Total completions of your meditations by others
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_completions_received INT DEFAULT 0;

-- ===========================================
-- TRIGGER FOR COMPLETIONS RECEIVED
-- ===========================================

-- When someone completes a template, increment the creator's total_completions_received
-- This provides direct attribution to User B when User A completes their meditation
CREATE OR REPLACE FUNCTION increment_completions_received()
RETURNS TRIGGER AS $$
DECLARE
  template_creator_id UUID;
BEGIN
  -- Look up the template creator
  SELECT user_id INTO template_creator_id
  FROM public.session_templates
  WHERE id = NEW.template_id;

  -- Only increment if template has a creator (not seeded/system content)
  IF template_creator_id IS NOT NULL THEN
    UPDATE public.profiles
    SET total_completions_received = total_completions_received + 1
    WHERE id = template_creator_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (fires alongside the existing on_template_completion_added trigger)
DROP TRIGGER IF EXISTS on_completion_received ON public.session_template_completions;
CREATE TRIGGER on_completion_received
  AFTER INSERT ON public.session_template_completions
  FOR EACH ROW EXECUTE FUNCTION increment_completions_received();

-- ===========================================
-- BACKFILL EXISTING DATA
-- ===========================================

-- Backfill total_completions_received from existing completions
-- This sums completions across all templates owned by each user
UPDATE public.profiles p
SET total_completions_received = COALESCE((
  SELECT SUM(t.completions)
  FROM public.session_templates t
  WHERE t.user_id = p.id
), 0);

-- ===========================================
-- VERIFICATION QUERY
-- ===========================================
-- Run this to verify the backfill worked:
-- SELECT
--   p.id,
--   p.total_completions_received,
--   (SELECT SUM(t.completions) FROM session_templates t WHERE t.user_id = p.id) as calculated
-- FROM profiles p
-- WHERE p.total_completions_received > 0;
