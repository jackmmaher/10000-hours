-- Fix RLS Policies for Reciprocity & Attribution
--
-- PROBLEM: Current policies only allow users to see their OWN votes/saves/completions.
-- This breaks ReciprocityCard and Attribution features which need to count
-- OTHER users' interactions with YOUR content.
--
-- SOLUTION: Add policies allowing content owners to see interactions on their content.
--
-- Run this in Supabase SQL Editor after the existing migrations.

-- ===========================================
-- SESSION TEMPLATE VOTES
-- ===========================================

-- Allow template owners to see all votes on their templates
-- (so they can see how many people upvoted their meditation)
CREATE POLICY "Template owners can view votes on their templates"
  ON public.session_template_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.session_templates t
      WHERE t.id = template_id AND t.user_id = auth.uid()
    )
  );

-- ===========================================
-- SESSION TEMPLATE SAVES
-- ===========================================

-- Allow template owners to see all saves of their templates
-- (so they can see how many people saved their meditation)
CREATE POLICY "Template owners can view saves of their templates"
  ON public.session_template_saves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.session_templates t
      WHERE t.id = template_id AND t.user_id = auth.uid()
    )
  );

-- ===========================================
-- SESSION TEMPLATE COMPLETIONS
-- ===========================================

-- Allow template owners to see all completions of their templates
-- (so they can see how many people practiced their meditation)
CREATE POLICY "Template owners can view completions of their templates"
  ON public.session_template_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.session_templates t
      WHERE t.id = template_id AND t.user_id = auth.uid()
    )
  );

-- ===========================================
-- PEARL SAVES
-- ===========================================

-- Allow pearl owners to see all saves of their pearls
-- (so they can see how many people saved their wisdom)
CREATE POLICY "Pearl owners can view saves of their pearls"
  ON public.pearl_saves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pearls p
      WHERE p.id = pearl_id AND p.user_id = auth.uid()
    )
  );

-- ===========================================
-- PEARL VOTES (if table exists)
-- ===========================================

-- Allow pearl owners to see all votes on their pearls
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'pearl_votes'
  ) THEN
    EXECUTE '
      CREATE POLICY "Pearl owners can view votes on their pearls"
        ON public.pearl_votes FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.pearls p
            WHERE p.id = pearl_id AND p.user_id = auth.uid()
          )
        )
    ';
  END IF;
END $$;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- After running this migration, you can verify the policies exist:
--
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN (
--   'session_template_votes',
--   'session_template_saves',
--   'session_template_completions',
--   'pearl_saves',
--   'pearl_votes'
-- )
-- ORDER BY tablename, policyname;

-- ===========================================
-- WHAT THIS FIXES
-- ===========================================

-- Before: getReciprocityData() returns all zeros because:
--   - Query: SELECT COUNT(*) FROM session_template_votes WHERE template_id IN (your_templates) AND user_id != you
--   - RLS blocks: "user_id != you" means you can't see those rows
--   - Result: 0
--
-- After: getReciprocityData() returns real counts because:
--   - New policy: "Template owners can view votes on their templates"
--   - You can now see votes on templates YOU created, regardless of who voted
--   - Result: Actual count of community engagement

-- ===========================================
-- NOTES
-- ===========================================

-- These policies are ADDITIVE (OR logic with existing policies).
-- Users can STILL see their own votes/saves/completions (original policy).
-- Users can NOW ALSO see others' interactions with THEIR content (new policy).
-- Users CANNOT see others' interactions with OTHERS' content (privacy preserved).
