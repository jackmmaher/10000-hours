-- Intent Tags Migration
-- Adds intent_tags column to pearls and session_templates for intent-based filtering
-- Run this in Supabase SQL Editor

-- ===========================================
-- DROP EXISTING FUNCTIONS (required to change return type)
-- ===========================================

DROP FUNCTION IF EXISTS get_pearls_for_user(uuid, text, integer, integer);
DROP FUNCTION IF EXISTS get_session_templates_for_user(uuid, text, text, text, integer, integer);

-- ===========================================
-- ADD INTENT_TAGS COLUMNS
-- ===========================================

-- Add to pearls table
ALTER TABLE public.pearls
ADD COLUMN IF NOT EXISTS intent_tags TEXT[] DEFAULT '{}';

-- Add to session_templates table
ALTER TABLE public.session_templates
ADD COLUMN IF NOT EXISTS intent_tags TEXT[] DEFAULT '{}';

-- ===========================================
-- CREATE INDEXES FOR FILTERING
-- ===========================================

-- GIN indexes for efficient array containment queries
CREATE INDEX IF NOT EXISTS pearls_intent_tags_idx
ON public.pearls USING GIN(intent_tags);

CREATE INDEX IF NOT EXISTS session_templates_intent_tags_idx
ON public.session_templates USING GIN(intent_tags);

-- ===========================================
-- UPDATE GET_PEARLS_FOR_USER FUNCTION
-- ===========================================

-- Drop and recreate to include intent_tags
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
  has_saved boolean
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
    EXISTS(SELECT 1 FROM public.pearl_saves s WHERE s.pearl_id = p.id AND s.user_id = p_user_id) AS has_saved
  FROM public.pearls p
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
  has_completed boolean
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
    EXISTS(SELECT 1 FROM public.session_template_completions c WHERE c.template_id = t.id AND c.user_id = p_user_id) AS has_completed
  FROM public.session_templates t
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
-- SEED EXISTING PEARLS WITH INTENT TAGS
-- Based on keyword analysis of pearl text
-- ===========================================

-- Anxiety-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'anxiety')
WHERE intent_tags IS NOT NULL
  AND NOT ('anxiety' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%anxiety%' OR
    LOWER(text) LIKE '%anxious%' OR
    LOWER(text) LIKE '%worry%' OR
    LOWER(text) LIKE '%panic%' OR
    LOWER(text) LIKE '%fear%' OR
    LOWER(text) LIKE '%nervous%'
  );

-- Stress-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'stress')
WHERE intent_tags IS NOT NULL
  AND NOT ('stress' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%stress%' OR
    LOWER(text) LIKE '%tension%' OR
    LOWER(text) LIKE '%pressure%' OR
    LOWER(text) LIKE '%overwhelm%' OR
    LOWER(text) LIKE '%burnout%'
  );

-- Focus-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'focus')
WHERE intent_tags IS NOT NULL
  AND NOT ('focus' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%focus%' OR
    LOWER(text) LIKE '%concentrat%' OR
    LOWER(text) LIKE '%attention%' OR
    LOWER(text) LIKE '%distract%' OR
    LOWER(text) LIKE '%wander%'
  );

-- Racing-mind related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'racing-mind')
WHERE intent_tags IS NOT NULL
  AND NOT ('racing-mind' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%thought%' OR
    LOWER(text) LIKE '%thinking%' OR
    LOWER(text) LIKE '%mind wander%' OR
    LOWER(text) LIKE '%busy mind%' OR
    LOWER(text) LIKE '%monkey mind%'
  );

-- Self-compassion related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'self-compassion')
WHERE intent_tags IS NOT NULL
  AND NOT ('self-compassion' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%compassion%' OR
    LOWER(text) LIKE '%kind%' OR
    LOWER(text) LIKE '%accept%' OR
    LOWER(text) LIKE '%forgive%' OR
    LOWER(text) LIKE '%worthy%' OR
    LOWER(text) LIKE '%self%'
  );

-- Emotions-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'emotions')
WHERE intent_tags IS NOT NULL
  AND NOT ('emotions' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%emotion%' OR
    LOWER(text) LIKE '%feeling%' OR
    LOWER(text) LIKE '%feel %' OR
    LOWER(text) LIKE '%heart%'
  );

-- Grief-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'grief')
WHERE intent_tags IS NOT NULL
  AND NOT ('grief' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%grief%' OR
    LOWER(text) LIKE '%loss%' OR
    LOWER(text) LIKE '%death%' OR
    LOWER(text) LIKE '%letting go%' OR
    LOWER(text) LIKE '%mourn%'
  );

-- Low-mood related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'low-mood')
WHERE intent_tags IS NOT NULL
  AND NOT ('low-mood' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%depress%' OR
    LOWER(text) LIKE '%sad%' OR
    LOWER(text) LIKE '%dark%' OR
    LOWER(text) LIKE '%heavy%' OR
    LOWER(text) LIKE '%hopeless%'
  );

-- Sleep-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'sleep')
WHERE intent_tags IS NOT NULL
  AND NOT ('sleep' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%sleep%' OR
    LOWER(text) LIKE '%rest%' OR
    LOWER(text) LIKE '%tired%' OR
    LOWER(text) LIKE '%night%' OR
    LOWER(text) LIKE '%calm%'
  );

-- Beginners-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'beginners')
WHERE intent_tags IS NOT NULL
  AND NOT ('beginners' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%beginner%' OR
    LOWER(text) LIKE '%start%' OR
    LOWER(text) LIKE '%first%' OR
    LOWER(text) LIKE '%simple%' OR
    LOWER(text) LIKE '%basic%'
  );

-- Body-awareness related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'body-awareness')
WHERE intent_tags IS NOT NULL
  AND NOT ('body-awareness' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%body%' OR
    LOWER(text) LIKE '%breath%' OR
    LOWER(text) LIKE '%physical%' OR
    LOWER(text) LIKE '%sensation%'
  );

-- Letting-go related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'letting-go')
WHERE intent_tags IS NOT NULL
  AND NOT ('letting-go' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%let go%' OR
    LOWER(text) LIKE '%release%' OR
    LOWER(text) LIKE '%surrender%' OR
    LOWER(text) LIKE '%attach%'
  );

-- Anger-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'anger')
WHERE intent_tags IS NOT NULL
  AND NOT ('anger' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%anger%' OR
    LOWER(text) LIKE '%angry%' OR
    LOWER(text) LIKE '%frustrat%' OR
    LOWER(text) LIKE '%irritat%' OR
    LOWER(text) LIKE '%rage%'
  );

-- Verify: Show count of pearls with each intent tag
-- SELECT
--   unnest(intent_tags) as tag,
--   count(*) as count
-- FROM public.pearls
-- WHERE intent_tags IS NOT NULL AND array_length(intent_tags, 1) > 0
-- GROUP BY tag
-- ORDER BY count DESC;
