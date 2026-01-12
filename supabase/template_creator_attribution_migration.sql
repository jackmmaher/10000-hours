-- Template Creator Attribution Migration
-- Adds triggers to credit template CREATORS when their content receives votes/saves
-- This was missing - templates only updated their own karma/saves, not the creator's profile
-- Run this in Supabase SQL Editor

-- ===========================================
-- TEMPLATE VOTE → CREATOR'S TOTAL_KARMA
-- ===========================================

-- When someone votes on a template, increment the template creator's total_karma
-- Note: Only for user-created templates (user_id IS NOT NULL) - not seeded content
CREATE OR REPLACE FUNCTION increment_author_karma_on_template_vote()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
BEGIN
  SELECT user_id INTO v_author_id FROM public.session_templates WHERE id = NEW.template_id;

  -- Only update if template has an author (not seeded content)
  IF v_author_id IS NOT NULL THEN
    UPDATE public.profiles
    SET total_karma = total_karma + 1
    WHERE id = v_author_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_template_vote_update_author_karma ON public.session_template_votes;
CREATE TRIGGER on_template_vote_update_author_karma
  AFTER INSERT ON public.session_template_votes
  FOR EACH ROW EXECUTE FUNCTION increment_author_karma_on_template_vote();

-- When someone unvotes a template, decrement the creator's karma
CREATE OR REPLACE FUNCTION decrement_author_karma_on_template_unvote()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
BEGIN
  SELECT user_id INTO v_author_id FROM public.session_templates WHERE id = OLD.template_id;

  IF v_author_id IS NOT NULL THEN
    UPDATE public.profiles
    SET total_karma = GREATEST(0, total_karma - 1)
    WHERE id = v_author_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_template_unvote_update_author_karma ON public.session_template_votes;
CREATE TRIGGER on_template_unvote_update_author_karma
  AFTER DELETE ON public.session_template_votes
  FOR EACH ROW EXECUTE FUNCTION decrement_author_karma_on_template_unvote();

-- ===========================================
-- TEMPLATE SAVE → CREATOR'S TOTAL_SAVES
-- ===========================================

CREATE OR REPLACE FUNCTION increment_author_saves_on_template_save()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
BEGIN
  SELECT user_id INTO v_author_id FROM public.session_templates WHERE id = NEW.template_id;

  IF v_author_id IS NOT NULL THEN
    UPDATE public.profiles
    SET total_saves = total_saves + 1
    WHERE id = v_author_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_template_save_update_author_saves ON public.session_template_saves;
CREATE TRIGGER on_template_save_update_author_saves
  AFTER INSERT ON public.session_template_saves
  FOR EACH ROW EXECUTE FUNCTION increment_author_saves_on_template_save();

CREATE OR REPLACE FUNCTION decrement_author_saves_on_template_unsave()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
BEGIN
  SELECT user_id INTO v_author_id FROM public.session_templates WHERE id = OLD.template_id;

  IF v_author_id IS NOT NULL THEN
    UPDATE public.profiles
    SET total_saves = GREATEST(0, total_saves - 1)
    WHERE id = v_author_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_template_unsave_update_author_saves ON public.session_template_saves;
CREATE TRIGGER on_template_unsave_update_author_saves
  AFTER DELETE ON public.session_template_saves
  FOR EACH ROW EXECUTE FUNCTION decrement_author_saves_on_template_unsave();

-- ===========================================
-- BACKFILL EXISTING DATA
-- ===========================================

-- Add karma from template votes to creators
-- For each template creator, count votes on their templates and add to total_karma
UPDATE public.profiles p
SET total_karma = total_karma + COALESCE((
  SELECT COUNT(*)
  FROM public.session_template_votes v
  JOIN public.session_templates t ON v.template_id = t.id
  WHERE t.user_id = p.id
), 0);

-- Add saves from template saves to creators
-- For each template creator, count saves on their templates and add to total_saves
UPDATE public.profiles p
SET total_saves = total_saves + COALESCE((
  SELECT COUNT(*)
  FROM public.session_template_saves s
  JOIN public.session_templates t ON s.template_id = t.id
  WHERE t.user_id = p.id
), 0);

-- ===========================================
-- VERIFICATION
-- ===========================================
-- Run this to verify triggers are installed:
-- SELECT tgname AS trigger_name, tgrelid::regclass AS table_name
-- FROM pg_trigger
-- WHERE tgname LIKE '%template%author%'
-- ORDER BY tgname;
