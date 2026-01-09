-- Voice Score Migration
-- Adds voice_score to profiles and updates RPCs to include creator's voice_score
-- Run this in Supabase SQL Editor

-- ===========================================
-- ADD VOICE_SCORE TO PROFILES
-- ===========================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS voice_score INT DEFAULT 0;

-- Index for potential sorting/filtering by voice
CREATE INDEX IF NOT EXISTS profiles_voice_score_idx
ON public.profiles(voice_score DESC);

-- ===========================================
-- DROP EXISTING FUNCTIONS (required to change return type)
-- ===========================================

DROP FUNCTION IF EXISTS get_pearls_for_user(uuid, text, integer, integer);
DROP FUNCTION IF EXISTS get_session_templates_for_user(uuid, text, text, text, integer, integer);

-- ===========================================
-- UPDATE GET_PEARLS_FOR_USER FUNCTION
-- Now includes creator's voice_score from profiles
-- ===========================================

CREATE OR REPLACE FUNCTION get_pearls_for_user(
  p_user_id uuid,
  p_filter text default 'new',
  p_limit int default 50,
  p_offset int default 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  text text,
  upvotes int,
  saves int,
  created_at timestamptz,
  intent_tags text[],
  has_voted boolean,
  has_saved boolean,
  creator_voice_score int
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.text,
    p.upvotes,
    p.saves,
    p.created_at,
    p.intent_tags,
    EXISTS(SELECT 1 FROM public.pearl_votes v WHERE v.pearl_id = p.id AND v.user_id = p_user_id) AS has_voted,
    EXISTS(SELECT 1 FROM public.pearl_saves s WHERE s.pearl_id = p.id AND s.user_id = p_user_id) AS has_saved,
    COALESCE(pr.voice_score, 0) AS creator_voice_score
  FROM public.pearls p
  LEFT JOIN public.profiles pr ON p.user_id = pr.id
  ORDER BY
    CASE WHEN p_filter = 'top' THEN p.upvotes ELSE 0 END DESC,
    CASE WHEN p_filter = 'rising' THEN p.upvotes::float / GREATEST(1, EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600) ELSE 0 END DESC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- UPDATE GET_SESSION_TEMPLATES_FOR_USER FUNCTION
-- Now includes creator's voice_score from profiles
-- ===========================================

CREATE OR REPLACE FUNCTION get_session_templates_for_user(
  p_user_id uuid,
  p_filter text default 'new',
  p_discipline text default null,
  p_difficulty text default null,
  p_limit int default 50,
  p_offset int default 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  tagline text,
  hero_gradient text,
  duration_guidance text,
  discipline text,
  posture text,
  best_time text,
  environment text,
  guidance_notes text,
  intention text,
  recommended_after_hours int,
  tags text[],
  intent_tags text[],
  karma int,
  saves int,
  completions int,
  creator_hours int,
  course_id uuid,
  course_position int,
  created_at timestamptz,
  has_voted boolean,
  has_saved boolean,
  has_completed boolean,
  creator_voice_score int
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.user_id,
    t.title,
    t.tagline,
    t.hero_gradient,
    t.duration_guidance,
    t.discipline,
    t.posture,
    t.best_time,
    t.environment,
    t.guidance_notes,
    t.intention,
    t.recommended_after_hours,
    t.tags,
    t.intent_tags,
    t.karma,
    t.saves,
    t.completions,
    t.creator_hours,
    t.course_id,
    t.course_position,
    t.created_at,
    EXISTS(SELECT 1 FROM public.session_template_votes v WHERE v.template_id = t.id AND v.user_id = p_user_id) AS has_voted,
    EXISTS(SELECT 1 FROM public.session_template_saves s WHERE s.template_id = t.id AND s.user_id = p_user_id) AS has_saved,
    EXISTS(SELECT 1 FROM public.session_template_completions c WHERE c.template_id = t.id AND c.user_id = p_user_id) AS has_completed,
    COALESCE(pr.voice_score, 0) AS creator_voice_score
  FROM public.session_templates t
  LEFT JOIN public.profiles pr ON t.user_id = pr.id
  WHERE
    (p_discipline IS NULL OR t.discipline = p_discipline) AND
    (p_difficulty IS NULL OR (
      (p_difficulty = 'beginner' AND t.recommended_after_hours < 10) OR
      (p_difficulty = 'intermediate' AND t.recommended_after_hours >= 10 AND t.recommended_after_hours < 100) OR
      (p_difficulty = 'advanced' AND t.recommended_after_hours >= 100)
    ))
  ORDER BY
    CASE WHEN p_filter = 'top' THEN t.karma ELSE 0 END DESC,
    CASE WHEN p_filter = 'rising' THEN t.karma::float / GREATEST(1, EXTRACT(EPOCH FROM (now() - t.created_at)) / 3600) ELSE 0 END DESC,
    CASE WHEN p_filter = 'most_saved' THEN t.saves ELSE 0 END DESC,
    t.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- FUNCTION TO UPDATE USER'S VOICE SCORE
-- Called from the client when Voice is recalculated
-- ===========================================

CREATE OR REPLACE FUNCTION update_voice_score(
  p_user_id uuid,
  p_voice_score int
)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET voice_score = p_voice_score
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
