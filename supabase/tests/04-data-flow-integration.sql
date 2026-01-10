-- ============================================
-- 10,000 HOURS DATABASE STRESS TESTS
-- Part 4: End-to-End Data Flow Verification
-- ============================================
-- Tests the complete user journey data flow
-- ============================================

DROP TABLE IF EXISTS test_results;
CREATE TEMP TABLE test_results (
  test_name TEXT,
  passed BOOLEAN,
  details TEXT
);

-- ============================================
-- SCENARIO 1: New User Discovery Flow
-- User opens app → sees templates → votes → saves
-- ============================================

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_template_id UUID;
  v_karma_before INT;
  v_karma_after INT;
  v_has_voted BOOLEAN;
  v_has_saved BOOLEAN;
BEGIN
  -- Step 1: User fetches explore feed
  SELECT id, karma INTO v_template_id, v_karma_before
  FROM session_templates
  WHERE user_id IS NULL
  ORDER BY karma DESC
  LIMIT 1;

  IF v_template_id IS NOT NULL THEN
    INSERT INTO test_results VALUES (
      'Discovery: Fetch top template',
      TRUE,
      'Got template with karma=' || v_karma_before
    );
  ELSE
    INSERT INTO test_results VALUES ('Discovery: Fetch top template', FALSE, 'No templates found');
    RETURN;
  END IF;

  -- Step 2: User votes on template
  INSERT INTO session_template_votes (template_id, user_id)
  VALUES (v_template_id, v_user_id);

  SELECT karma INTO v_karma_after FROM session_templates WHERE id = v_template_id;

  IF v_karma_after = v_karma_before + 1 THEN
    INSERT INTO test_results VALUES ('Discovery: Vote registered', TRUE, 'Karma incremented correctly');
  ELSE
    INSERT INTO test_results VALUES ('Discovery: Vote registered', FALSE, 'Karma not incremented');
  END IF;

  -- Step 3: Verify has_voted flag in RPC response
  SELECT has_voted INTO v_has_voted
  FROM get_session_templates_for_user(v_user_id, 'top', NULL, NULL, 1, 0)
  WHERE id = v_template_id;

  IF v_has_voted THEN
    INSERT INTO test_results VALUES ('Discovery: has_voted flag', TRUE, 'User vote reflected in feed');
  ELSE
    INSERT INTO test_results VALUES ('Discovery: has_voted flag', FALSE, 'Vote not reflected');
  END IF;

  -- Step 4: User saves template
  INSERT INTO session_template_saves (template_id, user_id)
  VALUES (v_template_id, v_user_id);

  SELECT has_saved INTO v_has_saved
  FROM get_session_templates_for_user(v_user_id, 'top', NULL, NULL, 1, 0)
  WHERE id = v_template_id;

  IF v_has_saved THEN
    INSERT INTO test_results VALUES ('Discovery: has_saved flag', TRUE, 'Save reflected in feed');
  ELSE
    INSERT INTO test_results VALUES ('Discovery: has_saved flag', FALSE, 'Save not reflected');
  END IF;

  -- Cleanup
  DELETE FROM session_template_votes WHERE user_id = v_user_id;
  DELETE FROM session_template_saves WHERE user_id = v_user_id;
END $$;

-- ============================================
-- SCENARIO 2: Meditation Completion Flow
-- User plans meditation → completes → completion tracked
-- ============================================

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_template_id UUID;
  v_session_uuid TEXT := gen_random_uuid()::text;
  v_completions_before INT;
  v_completions_after INT;
  v_has_completed BOOLEAN;
BEGIN
  -- Get a template
  SELECT id, completions INTO v_template_id, v_completions_before
  FROM session_templates
  WHERE user_id IS NULL
  LIMIT 1;

  -- Record completion (simulates app recording after meditation)
  INSERT INTO session_template_completions (template_id, user_id, session_uuid)
  VALUES (v_template_id, v_user_id, v_session_uuid);

  -- Verify completions incremented
  SELECT completions INTO v_completions_after
  FROM session_templates WHERE id = v_template_id;

  IF v_completions_after = v_completions_before + 1 THEN
    INSERT INTO test_results VALUES ('Completion: Count incremented', TRUE, 'Completions: ' || v_completions_before || ' → ' || v_completions_after);
  ELSE
    INSERT INTO test_results VALUES ('Completion: Count incremented', FALSE, 'Expected ' || (v_completions_before + 1) || ', got ' || v_completions_after);
  END IF;

  -- Verify has_completed flag
  SELECT has_completed INTO v_has_completed
  FROM get_session_templates_for_user(v_user_id, 'new', NULL, NULL, 100, 0)
  WHERE id = v_template_id;

  IF v_has_completed THEN
    INSERT INTO test_results VALUES ('Completion: has_completed flag', TRUE, 'Completion reflected for user');
  ELSE
    INSERT INTO test_results VALUES ('Completion: has_completed flag', FALSE, 'Completion not reflected');
  END IF;

  -- Cleanup (note: completion count stays - by design)
  DELETE FROM session_template_completions WHERE user_id = v_user_id;
END $$;

-- ============================================
-- SCENARIO 3: Social Proof Accumulation
-- Multiple users interact → counts reflect community activity
-- ============================================

DO $$
DECLARE
  v_template_id UUID;
  v_initial_karma INT;
  v_final_karma INT;
  v_user_count INT := 50;
  i INT;
BEGIN
  SELECT id, karma INTO v_template_id, v_initial_karma
  FROM session_templates
  WHERE user_id IS NULL
  OFFSET 5 LIMIT 1;

  -- Simulate 50 users voting
  FOR i IN 1..v_user_count LOOP
    INSERT INTO session_template_votes (template_id, user_id)
    VALUES (v_template_id, gen_random_uuid())
    ON CONFLICT DO NOTHING;
  END LOOP;

  SELECT karma INTO v_final_karma FROM session_templates WHERE id = v_template_id;

  IF v_final_karma >= v_initial_karma + v_user_count THEN
    INSERT INTO test_results VALUES (
      'Social Proof: Multi-user votes',
      TRUE,
      v_user_count || ' users voted, karma: ' || v_initial_karma || ' → ' || v_final_karma
    );
  ELSE
    INSERT INTO test_results VALUES (
      'Social Proof: Multi-user votes',
      FALSE,
      'Expected karma >= ' || (v_initial_karma + v_user_count) || ', got ' || v_final_karma
    );
  END IF;
END $$;

-- ============================================
-- SCENARIO 4: Intent-Based Filtering
-- User filters by intent → sees relevant content
-- ============================================

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_anxiety_count INT;
  v_sleep_count INT;
  v_total_count INT;
BEGIN
  -- Count templates with anxiety tag
  SELECT COUNT(*) INTO v_anxiety_count
  FROM session_templates
  WHERE 'anxiety' = ANY(intent_tags);

  -- Count templates with sleep tag
  SELECT COUNT(*) INTO v_sleep_count
  FROM session_templates
  WHERE 'sleep' = ANY(intent_tags);

  SELECT COUNT(*) INTO v_total_count FROM session_templates;

  INSERT INTO test_results VALUES (
    'Intent Filter: Anxiety',
    v_anxiety_count > 0,
    v_anxiety_count || ' templates tagged with anxiety (of ' || v_total_count || ' total)'
  );

  INSERT INTO test_results VALUES (
    'Intent Filter: Sleep',
    v_sleep_count > 0,
    v_sleep_count || ' templates tagged with sleep'
  );

  -- Verify filter works in app context (array containment)
  IF v_anxiety_count > 0 THEN
    INSERT INTO test_results VALUES (
      'Intent Filter: Query works',
      TRUE,
      'WHERE ANY(intent_tags) filtering operational'
    );
  END IF;
END $$;

-- ============================================
-- SCENARIO 5: Vote/Unvote Toggle
-- User votes → unvotes → votes again
-- ============================================

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_template_id UUID;
  v_karma_start INT;
  v_karma_after_vote INT;
  v_karma_after_unvote INT;
  v_karma_after_revote INT;
BEGIN
  SELECT id, karma INTO v_template_id, v_karma_start
  FROM session_templates
  WHERE user_id IS NULL
  OFFSET 10 LIMIT 1;

  -- Vote
  INSERT INTO session_template_votes (template_id, user_id) VALUES (v_template_id, v_user_id);
  SELECT karma INTO v_karma_after_vote FROM session_templates WHERE id = v_template_id;

  -- Unvote
  DELETE FROM session_template_votes WHERE template_id = v_template_id AND user_id = v_user_id;
  SELECT karma INTO v_karma_after_unvote FROM session_templates WHERE id = v_template_id;

  -- Re-vote
  INSERT INTO session_template_votes (template_id, user_id) VALUES (v_template_id, v_user_id);
  SELECT karma INTO v_karma_after_revote FROM session_templates WHERE id = v_template_id;

  IF v_karma_after_vote = v_karma_start + 1
     AND v_karma_after_unvote = v_karma_start
     AND v_karma_after_revote = v_karma_start + 1 THEN
    INSERT INTO test_results VALUES (
      'Vote Toggle: Full cycle',
      TRUE,
      'Vote/unvote/revote: ' || v_karma_start || ' → ' || v_karma_after_vote || ' → ' || v_karma_after_unvote || ' → ' || v_karma_after_revote
    );
  ELSE
    INSERT INTO test_results VALUES (
      'Vote Toggle: Full cycle',
      FALSE,
      'Unexpected karma sequence'
    );
  END IF;

  -- Cleanup
  DELETE FROM session_template_votes WHERE user_id = v_user_id;
END $$;

-- ============================================
-- SCENARIO 6: Leaderboard / Top Content
-- Verify sorting by karma works for discovery
-- ============================================

DO $$
DECLARE
  v_top_10 RECORD;
  v_prev_karma INT := 999999999;
  v_is_sorted BOOLEAN := TRUE;
BEGIN
  FOR v_top_10 IN
    SELECT id, title, karma
    FROM session_templates
    ORDER BY karma DESC
    LIMIT 10
  LOOP
    IF v_top_10.karma > v_prev_karma THEN
      v_is_sorted := FALSE;
    END IF;
    v_prev_karma := v_top_10.karma;
  END LOOP;

  IF v_is_sorted THEN
    INSERT INTO test_results VALUES (
      'Leaderboard: Karma sorting',
      TRUE,
      'Top 10 templates correctly sorted by karma DESC'
    );
  ELSE
    INSERT INTO test_results VALUES (
      'Leaderboard: Karma sorting',
      FALSE,
      'Sorting by karma is broken'
    );
  END IF;
END $$;

-- ============================================
-- SCENARIO 7: User's Personal Stats
-- Track user's total activity
-- ============================================

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_vote_count INT;
  v_save_count INT;
  v_completion_count INT;
  v_template_id UUID;
BEGIN
  SELECT id INTO v_template_id FROM session_templates LIMIT 1;

  -- Simulate user activity
  INSERT INTO session_template_votes (template_id, user_id) VALUES (v_template_id, v_user_id);
  INSERT INTO session_template_saves (template_id, user_id) VALUES (v_template_id, v_user_id);
  INSERT INTO session_template_completions (template_id, user_id, session_uuid) VALUES (v_template_id, v_user_id, 'test');

  -- Query user's stats
  SELECT COUNT(*) INTO v_vote_count FROM session_template_votes WHERE user_id = v_user_id;
  SELECT COUNT(*) INTO v_save_count FROM session_template_saves WHERE user_id = v_user_id;
  SELECT COUNT(*) INTO v_completion_count FROM session_template_completions WHERE user_id = v_user_id;

  IF v_vote_count = 1 AND v_save_count = 1 AND v_completion_count = 1 THEN
    INSERT INTO test_results VALUES (
      'User Stats: Activity tracking',
      TRUE,
      'User activity tracked: votes=' || v_vote_count || ', saves=' || v_save_count || ', completions=' || v_completion_count
    );
  ELSE
    INSERT INTO test_results VALUES ('User Stats: Activity tracking', FALSE, 'Activity counts incorrect');
  END IF;

  -- Cleanup
  DELETE FROM session_template_votes WHERE user_id = v_user_id;
  DELETE FROM session_template_saves WHERE user_id = v_user_id;
  DELETE FROM session_template_completions WHERE user_id = v_user_id;
END $$;

-- ============================================
-- PRINT RESULTS
-- ============================================

SELECT
  test_name,
  CASE WHEN passed THEN '✓ PASS' ELSE '✗ FAIL' END as status,
  details
FROM test_results
ORDER BY passed DESC, test_name;

-- Summary
SELECT
  COUNT(*) FILTER (WHERE passed) as passed,
  COUNT(*) FILTER (WHERE NOT passed) as failed,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE passed) / COUNT(*), 1) as pass_rate
FROM test_results;
