-- Two-Way Validation Migration
-- Adds "giving" stats to profiles for reciprocal community engagement
-- Run this in Supabase SQL Editor AFTER voice_score_migration.sql

-- ===========================================
-- ADD GIVING STATS TO PROFILES
-- ===========================================

-- Karma given (upvotes you've given to others' content)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS karma_given INT DEFAULT 0;

-- Saves made (content you've bookmarked)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS saves_made INT DEFAULT 0;

-- Completions performed (meditations you've practiced)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS completions_performed INT DEFAULT 0;

-- Pearls created (actual count from Supabase, not local)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS pearls_created INT DEFAULT 0;

-- ===========================================
-- TRIGGERS FOR KARMA GIVEN (Pearl Votes)
-- ===========================================

-- Increment karma_given when user votes on a pearl
CREATE OR REPLACE FUNCTION increment_karma_given_pearl()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET karma_given = karma_given + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement karma_given when user removes vote
CREATE OR REPLACE FUNCTION decrement_karma_given_pearl()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET karma_given = GREATEST(0, karma_given - 1)
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pearl_vote_given ON public.pearl_votes;
CREATE TRIGGER on_pearl_vote_given
  AFTER INSERT ON public.pearl_votes
  FOR EACH ROW EXECUTE FUNCTION increment_karma_given_pearl();

DROP TRIGGER IF EXISTS on_pearl_vote_removed ON public.pearl_votes;
CREATE TRIGGER on_pearl_vote_removed
  AFTER DELETE ON public.pearl_votes
  FOR EACH ROW EXECUTE FUNCTION decrement_karma_given_pearl();

-- ===========================================
-- TRIGGERS FOR KARMA GIVEN (Template Votes)
-- ===========================================

-- Increment karma_given when user votes on a template
CREATE OR REPLACE FUNCTION increment_karma_given_template()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET karma_given = karma_given + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement karma_given when user removes vote
CREATE OR REPLACE FUNCTION decrement_karma_given_template()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET karma_given = GREATEST(0, karma_given - 1)
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_template_vote_given ON public.session_template_votes;
CREATE TRIGGER on_template_vote_given
  AFTER INSERT ON public.session_template_votes
  FOR EACH ROW EXECUTE FUNCTION increment_karma_given_template();

DROP TRIGGER IF EXISTS on_template_vote_removed ON public.session_template_votes;
CREATE TRIGGER on_template_vote_removed
  AFTER DELETE ON public.session_template_votes
  FOR EACH ROW EXECUTE FUNCTION decrement_karma_given_template();

-- ===========================================
-- TRIGGERS FOR SAVES MADE (Pearl Saves)
-- ===========================================

-- Increment saves_made when user saves a pearl
CREATE OR REPLACE FUNCTION increment_saves_made_pearl()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET saves_made = saves_made + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement saves_made when user unsaves
CREATE OR REPLACE FUNCTION decrement_saves_made_pearl()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET saves_made = GREATEST(0, saves_made - 1)
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pearl_save_made ON public.pearl_saves;
CREATE TRIGGER on_pearl_save_made
  AFTER INSERT ON public.pearl_saves
  FOR EACH ROW EXECUTE FUNCTION increment_saves_made_pearl();

DROP TRIGGER IF EXISTS on_pearl_unsave_made ON public.pearl_saves;
CREATE TRIGGER on_pearl_unsave_made
  AFTER DELETE ON public.pearl_saves
  FOR EACH ROW EXECUTE FUNCTION decrement_saves_made_pearl();

-- ===========================================
-- TRIGGERS FOR SAVES MADE (Template Saves)
-- ===========================================

-- Increment saves_made when user saves a template
CREATE OR REPLACE FUNCTION increment_saves_made_template()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET saves_made = saves_made + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement saves_made when user unsaves
CREATE OR REPLACE FUNCTION decrement_saves_made_template()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET saves_made = GREATEST(0, saves_made - 1)
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_template_save_made ON public.session_template_saves;
CREATE TRIGGER on_template_save_made
  AFTER INSERT ON public.session_template_saves
  FOR EACH ROW EXECUTE FUNCTION increment_saves_made_template();

DROP TRIGGER IF EXISTS on_template_unsave_made ON public.session_template_saves;
CREATE TRIGGER on_template_unsave_made
  AFTER DELETE ON public.session_template_saves
  FOR EACH ROW EXECUTE FUNCTION decrement_saves_made_template();

-- ===========================================
-- TRIGGERS FOR COMPLETIONS PERFORMED
-- ===========================================

-- Increment completions_performed when user completes a meditation
CREATE OR REPLACE FUNCTION increment_completions_performed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET completions_performed = completions_performed + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_completion_performed ON public.session_template_completions;
CREATE TRIGGER on_completion_performed
  AFTER INSERT ON public.session_template_completions
  FOR EACH ROW EXECUTE FUNCTION increment_completions_performed();

-- ===========================================
-- TRIGGERS FOR PEARLS CREATED
-- ===========================================

-- Increment pearls_created when user creates a pearl
CREATE OR REPLACE FUNCTION increment_pearls_created()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET pearls_created = pearls_created + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement pearls_created when user deletes a pearl
CREATE OR REPLACE FUNCTION decrement_pearls_created()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET pearls_created = GREATEST(0, pearls_created - 1)
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pearl_created ON public.pearls;
CREATE TRIGGER on_pearl_created
  AFTER INSERT ON public.pearls
  FOR EACH ROW EXECUTE FUNCTION increment_pearls_created();

DROP TRIGGER IF EXISTS on_pearl_deleted ON public.pearls;
CREATE TRIGGER on_pearl_deleted
  AFTER DELETE ON public.pearls
  FOR EACH ROW EXECUTE FUNCTION decrement_pearls_created();

-- ===========================================
-- BACKFILL EXISTING DATA
-- ===========================================

-- Backfill karma_given from existing votes
UPDATE public.profiles p
SET karma_given = (
  SELECT COUNT(*) FROM public.pearl_votes WHERE user_id = p.id
) + (
  SELECT COUNT(*) FROM public.session_template_votes WHERE user_id = p.id
);

-- Backfill saves_made from existing saves
UPDATE public.profiles p
SET saves_made = (
  SELECT COUNT(*) FROM public.pearl_saves WHERE user_id = p.id
) + (
  SELECT COUNT(*) FROM public.session_template_saves WHERE user_id = p.id
);

-- Backfill completions_performed from existing completions
UPDATE public.profiles p
SET completions_performed = (
  SELECT COUNT(*) FROM public.session_template_completions WHERE user_id = p.id
);

-- Backfill pearls_created from existing pearls
UPDATE public.profiles p
SET pearls_created = (
  SELECT COUNT(*) FROM public.pearls WHERE user_id = p.id
);

-- ===========================================
-- VERIFICATION QUERY
-- ===========================================
-- Run this to verify the backfill worked:
-- SELECT id, karma_given, saves_made, completions_performed, pearls_created
-- FROM profiles
-- WHERE karma_given > 0 OR saves_made > 0 OR completions_performed > 0 OR pearls_created > 0;
