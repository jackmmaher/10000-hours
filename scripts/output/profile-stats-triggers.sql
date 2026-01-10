-- ===========================================
-- PROFILE STATS TRIGGERS
-- ===========================================
-- These triggers update the CREATOR's profile stats when their
-- content receives votes/saves. This feeds into Voice score calculation.
-- ===========================================

-- ============================================
-- PEARL VOTE → AUTHOR'S KARMA
-- ============================================

-- When someone votes on a pearl, increment the pearl author's total_karma
CREATE OR REPLACE FUNCTION increment_author_karma_on_pearl_vote()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_karma = total_karma + 1
  WHERE id = (SELECT user_id FROM public.pearls WHERE id = NEW.pearl_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pearl_vote_update_author_karma ON public.pearl_votes;
CREATE TRIGGER on_pearl_vote_update_author_karma
  AFTER INSERT ON public.pearl_votes
  FOR EACH ROW EXECUTE FUNCTION increment_author_karma_on_pearl_vote();

-- When someone unvotes a pearl, decrement the author's karma
CREATE OR REPLACE FUNCTION decrement_author_karma_on_pearl_unvote()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_karma = GREATEST(0, total_karma - 1)
  WHERE id = (SELECT user_id FROM public.pearls WHERE id = OLD.pearl_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pearl_unvote_update_author_karma ON public.pearl_votes;
CREATE TRIGGER on_pearl_unvote_update_author_karma
  AFTER DELETE ON public.pearl_votes
  FOR EACH ROW EXECUTE FUNCTION decrement_author_karma_on_pearl_unvote();

-- ============================================
-- PEARL SAVE → AUTHOR'S SAVES
-- ============================================

CREATE OR REPLACE FUNCTION increment_author_saves_on_pearl_save()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_saves = total_saves + 1
  WHERE id = (SELECT user_id FROM public.pearls WHERE id = NEW.pearl_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pearl_save_update_author_saves ON public.pearl_saves;
CREATE TRIGGER on_pearl_save_update_author_saves
  AFTER INSERT ON public.pearl_saves
  FOR EACH ROW EXECUTE FUNCTION increment_author_saves_on_pearl_save();

CREATE OR REPLACE FUNCTION decrement_author_saves_on_pearl_unsave()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_saves = GREATEST(0, total_saves - 1)
  WHERE id = (SELECT user_id FROM public.pearls WHERE id = OLD.pearl_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pearl_unsave_update_author_saves ON public.pearl_saves;
CREATE TRIGGER on_pearl_unsave_update_author_saves
  AFTER DELETE ON public.pearl_saves
  FOR EACH ROW EXECUTE FUNCTION decrement_author_saves_on_pearl_unsave();

-- ============================================
-- TEMPLATE VOTE → AUTHOR'S KARMA
-- ============================================

-- When someone votes on a template, increment the template author's total_karma
-- Note: Only for user-created templates (user_id IS NOT NULL)
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

-- ============================================
-- TEMPLATE SAVE → AUTHOR'S SAVES
-- ============================================

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

-- ============================================
-- VERIFY TRIGGERS EXIST
-- ============================================
SELECT
  tgname AS trigger_name,
  tgrelid::regclass AS table_name
FROM pg_trigger
WHERE tgname LIKE '%author%'
ORDER BY tgname;
