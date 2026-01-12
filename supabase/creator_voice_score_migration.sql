-- Creator Voice Score Migration
-- Adds creator_voice_score column to session_templates for seeded content
-- Updates RPCs to prefer stored voice score over profile lookup
-- Run this in Supabase SQL Editor

-- ===========================================
-- ADD CREATOR_VOICE_SCORE TO SESSION_TEMPLATES
-- ===========================================

-- For seeded content that has no user_id (no profile to look up)
-- we store the voice score directly on the content
ALTER TABLE public.session_templates
ADD COLUMN IF NOT EXISTS creator_voice_score INT DEFAULT NULL;

-- Index for potential filtering/sorting
CREATE INDEX IF NOT EXISTS session_templates_creator_voice_score_idx
ON public.session_templates(creator_voice_score DESC NULLS LAST);

-- ===========================================
-- ADD CREATOR_VOICE_SCORE TO PEARLS
-- ===========================================

ALTER TABLE public.pearls
ADD COLUMN IF NOT EXISTS creator_voice_score INT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS pearls_creator_voice_score_idx
ON public.pearls(creator_voice_score DESC NULLS LAST);

-- ===========================================
-- UPDATE GET_SESSION_TEMPLATES_FOR_USER RPC
-- Now uses: stored creator_voice_score > profile voice_score > 0
-- ===========================================

DROP FUNCTION IF EXISTS get_session_templates_for_user(uuid, text, text, text, integer, integer);

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
    -- Prefer stored creator_voice_score (for seeded content), then profile voice_score, then 0
    COALESCE(t.creator_voice_score, pr.voice_score, 0) AS creator_voice_score
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
-- UPDATE GET_PEARLS_FOR_USER RPC
-- Now uses: stored creator_voice_score > profile voice_score > 0
-- ===========================================

DROP FUNCTION IF EXISTS get_pearls_for_user(uuid, text, integer, integer);

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
    -- Prefer stored creator_voice_score (for seeded content), then profile voice_score, then 0
    COALESCE(p.creator_voice_score, pr.voice_score, 0) AS creator_voice_score
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
-- VERIFICATION
-- ===========================================
-- Run this to verify columns exist:
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'session_templates' AND column_name = 'creator_voice_score';
--
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'pearls' AND column_name = 'creator_voice_score';
