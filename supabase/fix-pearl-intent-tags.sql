-- Fix Pearl Intent Tags
-- Run this in Supabase SQL Editor to restore intent_tags to seeded pearls
-- Created: 2026-01-10
-- Issue: update-pearls-v2.sql deleted and re-inserted pearls WITHOUT intent_tags

-- ===========================================
-- STEP 1: Reset all intent_tags to empty array
-- (ensures clean slate before re-tagging)
-- ===========================================

UPDATE public.pearls
SET intent_tags = '{}'
WHERE intent_tags IS NULL OR array_length(intent_tags, 1) IS NULL;

-- ===========================================
-- STEP 2: Apply intent tags based on keyword matching
-- Uses the 8 Pareto-aligned intents from INTENT_OPTIONS
-- ===========================================

-- Anxiety-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'anxiety')
WHERE NOT ('anxiety' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%anxiety%' OR
    LOWER(text) LIKE '%anxious%' OR
    LOWER(text) LIKE '%worry%' OR
    LOWER(text) LIKE '%panic%' OR
    LOWER(text) LIKE '%fear%' OR
    LOWER(text) LIKE '%nervous%' OR
    LOWER(text) LIKE '%dread%'
  );

-- Stress-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'stress')
WHERE NOT ('stress' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%stress%' OR
    LOWER(text) LIKE '%tension%' OR
    LOWER(text) LIKE '%pressure%' OR
    LOWER(text) LIKE '%overwhelm%' OR
    LOWER(text) LIKE '%burnout%' OR
    LOWER(text) LIKE '%exhausted%'
  );

-- Sleep-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'sleep')
WHERE NOT ('sleep' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%sleep%' OR
    LOWER(text) LIKE '%rest%' OR
    LOWER(text) LIKE '%tired%' OR
    LOWER(text) LIKE '%night%' OR
    LOWER(text) LIKE '%calm%' OR
    LOWER(text) LIKE '%bedtime%'
  );

-- Focus-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'focus')
WHERE NOT ('focus' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%focus%' OR
    LOWER(text) LIKE '%concentrat%' OR
    LOWER(text) LIKE '%attention%' OR
    LOWER(text) LIKE '%distract%' OR
    LOWER(text) LIKE '%wander%' OR
    LOWER(text) LIKE '%clarity%' OR
    LOWER(text) LIKE '%clear mind%'
  );

-- Beginners-related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'beginners')
WHERE NOT ('beginners' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%beginner%' OR
    LOWER(text) LIKE '%start%' OR
    LOWER(text) LIKE '%first%' OR
    LOWER(text) LIKE '%simple%' OR
    LOWER(text) LIKE '%basic%' OR
    LOWER(text) LIKE '%foundation%'
  );

-- Body-awareness related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'body-awareness')
WHERE NOT ('body-awareness' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%body%' OR
    LOWER(text) LIKE '%breath%' OR
    LOWER(text) LIKE '%physical%' OR
    LOWER(text) LIKE '%sensation%' OR
    LOWER(text) LIKE '%somatic%'
  );

-- Self-compassion related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'self-compassion')
WHERE NOT ('self-compassion' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%compassion%' OR
    LOWER(text) LIKE '%kind%' OR
    LOWER(text) LIKE '%accept%' OR
    LOWER(text) LIKE '%forgive%' OR
    LOWER(text) LIKE '%worthy%' OR
    LOWER(text) LIKE '%love yourself%' OR
    LOWER(text) LIKE '%self%'
  );

-- Letting-go related pearls
UPDATE public.pearls SET intent_tags = array_append(intent_tags, 'letting-go')
WHERE NOT ('letting-go' = ANY(intent_tags))
  AND (
    LOWER(text) LIKE '%let go%' OR
    LOWER(text) LIKE '%letting go%' OR
    LOWER(text) LIKE '%release%' OR
    LOWER(text) LIKE '%surrender%' OR
    LOWER(text) LIKE '%attach%' OR
    LOWER(text) LIKE '%impermanence%'
  );

-- ===========================================
-- STEP 3: Verify results
-- ===========================================

-- Show count of pearls with each intent tag
SELECT
  unnest(intent_tags) as tag,
  count(*) as count
FROM public.pearls
WHERE intent_tags IS NOT NULL AND array_length(intent_tags, 1) > 0
GROUP BY tag
ORDER BY count DESC;

-- Show total pearls with at least one tag
SELECT
  count(*) as pearls_with_tags
FROM public.pearls
WHERE array_length(intent_tags, 1) > 0;

-- Show pearls with no tags (for manual review if needed)
SELECT id, text
FROM public.pearls
WHERE array_length(intent_tags, 1) IS NULL OR array_length(intent_tags, 1) = 0
LIMIT 10;
