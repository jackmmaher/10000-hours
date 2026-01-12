-- 10,000 Hours Seeded Content Migration
-- Generated: 2026-01-12T17:46:11.241Z
-- Run this in Supabase SQL Editor

-- This uses UPSERT (ON CONFLICT) to be idempotent

-- ============================================
-- SESSION TEMPLATES
-- ============================================

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '61fcdd00-833b-5527-a4fa-de193d8ead79',
  NULL,
  'First Breath Awakening',
  'Begin your journey with the simplest practice',
  'from-emerald-400 to-teal-600',
  '5-10 mins',
  'Breath Awareness',
  'Seated (chair)',
  'Morning',
  'Quiet indoor space',
  'Welcome to your first meditation. There is nothing to achieve here, nowhere to arrive. Simply settle into your seat, allowing your body to feel supported. Let your hands rest comfortably in your lap or on your knees.

Close your eyes gently and bring your attention to the natural rhythm of your breath. Don''t try to control it or change it in any way. Simply notice the subtle sensations of air moving in through your nostrils, the slight pause, and then the release of the exhale. Your breath has been doing this your entire life without any help from you.

When you notice your mind has wandered - and it will, many times - simply acknowledge this with kindness and return to the breath. Each return is not a failure but a success. It''s like doing a bicep curl for your attention.

After a few minutes, take three deeper breaths, wiggle your fingers and toes, and gently open your eyes. You''ve just completed a meditation. Well done.',
  'Establishing presence',
  0,
  '{}',
  '{"focus","sleep","body-awareness","self-compassion","emotions","letting-go","morning","beginners"}',
  39,
  75,
  159,
  10,
  8,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '3ebd77a4-56cf-56a9-a5d5-615e01d15aff',
  NULL,
  'The Mountain Within',
  'Cultivate unshakeable stillness',
  'from-stone-400 to-slate-600',
  '15-20 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'Settle into your posture with the stability of a mountain. Your spine rises naturally like a peak, your base is wide and grounded. Mountains don''t strain to be still - they simply are. Allow this same quality of effortless presence to infuse your sitting.

Begin by establishing your breath as an anchor. Feel the coolness of the inhale, the warmth of the exhale. Then gradually expand your awareness outward like ripples on a pond. Include sounds, sensations in the body, the quality of light through your closed eyelids.

Weather passes over mountains - rain, snow, sunshine, storm - but the mountain remains unchanged in its essential nature. Similarly, thoughts and emotions will pass through your awareness. Observe them without becoming them. You are the awareness in which they appear and disappear.

When it''s time to close, gather your attention back to the breath, back to the body. Feel your feet on the ground. Open your eyes slowly, carrying this mountain-like stability into your day.',
  'Grounding and stability',
  10,
  '{}',
  '{"focus","racing-mind","body-awareness","emotions","letting-go"}',
  18,
  14,
  57,
  728,
  62,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '24cf2299-99ec-59ab-9822-0c9b1cd69591',
  NULL,
  'Releasing the Day',
  'Let go of what you''ve carried',
  'from-indigo-400 to-violet-600',
  '15-20 mins',
  'Body Scan',
  'Lying down',
  'Evening',
  'Bedroom or comfortable space',
  'Lie down in a comfortable position, arms slightly away from your body, palms facing up in a gesture of openness. Allow the surface beneath you to fully support your weight. You don''t need to hold anything up right now.

Begin by taking three deep breaths, sighing audibly on each exhale. With each sigh, imagine releasing the tensions of the day - the conversations, the tasks, the small stresses that accumulated. Let them drain out of you like water.

Now bring your attention to the top of your head. Notice any sensations there without judgment. Slowly move your awareness down through your face - forehead softening, jaw unclenching, shoulders dropping away from your ears. Continue this gentle scan through your arms and hands, your torso, your hips, legs, and feet.

Wherever you find tension, breathe into that area and release it on the exhale. The day is complete. Whatever happened, happened. Whatever didn''t, didn''t. This moment is fresh. When you''re ready, either drift into sleep or slowly return to waking awareness.',
  'Evening release',
  0,
  '{}',
  '{"stress","low-mood","grief","focus","sleep","body-awareness","letting-go","morning","evening"}',
  39,
  89,
  112,
  76,
  21,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'b3d2e372-366c-5eb5-b35f-6e257615a880',
  NULL,
  'Loving-Kindness for Self',
  'The compassion you give begins within',
  'from-rose-400 to-pink-600',
  '15-20 mins',
  'Loving-Kindness',
  'Seated (chair)',
  'Anytime',
  'Quiet, private space',
  'Compassion for others begins with compassion for yourself. This isn''t selfishness - it''s the foundation. Find a comfortable seated position and place one or both hands over your heart if that feels natural.

Begin by breathing gently and bringing to mind a moment when you felt truly at peace or genuinely loved. It might be a memory, a person, or simply a feeling. Let this warmth spread through your chest.

Now, silently offer yourself these traditional phrases: ''May I be happy. May I be healthy. May I be safe. May I live with ease.'' Repeat them slowly, letting each one land. If resistance arises - if it feels strange or undeserved - simply notice that and continue anyway.

You can modify the phrases to fit your needs: ''May I accept myself as I am. May I be free from unnecessary suffering. May I find peace.'' The words matter less than the intention behind them.

Close by sitting quietly for a moment, feeling whatever is present. Then gently return to the room, perhaps placing your hand on your heart once more in a gesture of self-kindness.',
  'Self-compassion',
  10,
  '{}',
  '{"anger","pain","self-compassion","emotions","letting-go","beginners"}',
  1,
  1,
  10,
  263,
  43,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'e2283be3-46e0-5193-8ea8-952354e8a4af',
  NULL,
  'The Silent Watcher',
  'Discover the awareness behind your thoughts',
  'from-sky-400 to-cyan-600',
  '20-25 mins',
  'Vipassana',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'Settle into a stable, alert posture. The spine is naturally erect, the shoulders relaxed, the chin slightly tucked. This posture expresses both dignity and ease.

Begin with the breath, using it to gather and steady your attention. After a few minutes, shift your focus from the breath itself to the awareness that knows the breath. There is breathing happening, and there is something aware of the breathing. Turn your attention to that awareness.

Thoughts will arise. Instead of following them into their stories, simply note: ''thinking.'' Emotions will surface. Note: ''feeling.'' Sensations will grab attention. Note: ''sensing.'' Then return to the silent watching.

You are not trying to stop thoughts. You are discovering that you are not your thoughts. You are the awareness in which thoughts appear and disappear. This awareness is always present, always peaceful, regardless of what passes through it.

As you close, reflect briefly on this: what you are looking for is what is looking. Bow to your practice and carry this witnessing quality into your day.',
  'Developing insight',
  50,
  '{}',
  '{"anger","focus","racing-mind","clarity","body-awareness","self-compassion","emotions"}',
  130,
  148,
  303,
  480,
  53,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'b97e45ca-d095-58e8-b5dd-3aa8052fd370',
  NULL,
  'Walking in Presence',
  'Every step is an arrival',
  'from-emerald-400 to-green-600',
  '15-20 mins',
  'Walking Meditation',
  'Walking',
  'Anytime',
  'Indoor path or outdoor trail',
  'Find a path where you can walk undisturbed for about 20-30 steps. You won''t be going anywhere - this is meditation in movement, not a walk with a destination.

Stand at one end of your path. Feel your feet on the ground. Take a moment to arrive fully in your body. Then begin walking very slowly, much slower than normal. Feel the weight shift as you lift one foot. Notice the swing of the leg through space. Feel the heel make contact, then the ball of the foot, then the toes.

Your eyes are soft, gazing downward a few feet ahead. Your arms hang naturally or are clasped gently behind or in front. The pace is slow enough that you could stop at any moment.

When you reach the end of your path, pause. Feel yourself standing. Then turn slowly and walk back. There is nowhere to go. Each step is complete in itself. Each step is an arrival.

If your mind wanders, note it with kindness and return attention to the sensations of walking. After 15-20 minutes, stand still for a moment, feeling the stability of the earth beneath you, before resuming normal activity.',
  'Embodied presence',
  10,
  '{}',
  '{"low-mood","grief","focus","sleep","body-awareness","self-compassion","emotions"}',
  3,
  0,
  5,
  246,
  38,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '67577fe3-1d26-5f73-b2f5-d1e51bb88056',
  NULL,
  'Breath Counting Basics',
  'Numbers become doorways to stillness',
  'from-teal-400 to-emerald-600',
  '10-15 mins',
  'Breath Awareness',
  'Seated (chair)',
  'Morning',
  'Quiet indoor space',
  'Breath counting is a time-tested technique for developing concentration. Think of it as training wheels for presence - a simple structure that gives the wandering mind something to do.

Settle into your seat and take a few natural breaths. Then begin counting: breathe in, breathe out, count ''one'' silently. Breathe in, breathe out, count ''two.'' Continue up to ten, then start again at one.

The rules are simple: if you lose count, start over at one. If you find yourself at fourteen, start over at one. If you''re not sure where you are, start over at one. There''s no failure here - each restart is a moment of awakening, a recognition that the mind had wandered.

Don''t rush to get to ten. The goal isn''t to count higher; it''s to be completely present with each breath. One fully present breath is worth more than ten distracted ones.

As your concentration deepens over many sessions, you may find you need the counting less. But for now, let the numbers be a gentle tether, always bringing you back to this breath, this moment.',
  'Building concentration',
  0,
  '{}',
  '{"anger","focus","sleep","self-compassion","morning","beginners"}',
  161,
  160,
  815,
  87,
  25,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'ca913887-5f8c-566d-8474-d21705de1736',
  NULL,
  'The Gap Between Breaths',
  'Find the stillness in the turning point',
  'from-violet-400 to-purple-600',
  '15-20 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'There is a small gap between the inhale and the exhale, another between the exhale and the inhale. These gaps are doorways to profound stillness.

Settle into your posture and begin with normal breathing, simply observing the rhythm. After a few minutes, start to notice the moment when the inhale completes and the exhale hasn''t yet begun. Don''t hold the breath artificially - just notice that natural pause.

In that gap, there is no movement, no doing. There is only being. Rest your attention there, even if just for a fraction of a second.

Similarly, notice the pause after the exhale, before the body naturally draws in the next breath. This empty moment at the bottom of the breath is where consciousness rests. Don''t force anything. Simply become curious about these turning points.

Over time, you may find these gaps naturally lengthening as the nervous system calms. The breath becomes slower, smoother. The gaps become doorways. But don''t pursue this as a goal - just notice what''s already there.

Close by returning to normal breathing, carrying the awareness of these still points with you.',
  'Deepening stillness',
  50,
  '{}',
  '{"anxiety","focus","sleep","body-awareness","beginners"}',
  5,
  6,
  42,
  56,
  19,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '3ad8e5ab-0810-57e9-b0b1-dd03da326612',
  NULL,
  'Sitting with Difficulty',
  'What blocks you teaches you',
  'from-amber-400 to-orange-600',
  '20-25 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'This practice is for when life feels hard. When the mind is turbulent. When you''d rather do anything but sit. This is precisely when meditation matters most.

Settle into your posture and immediately notice any resistance. Maybe it feels like restlessness, anxiety, or sadness. Whatever it is, you''re not going to try to change it. You''re going to turn toward it with curiosity.

Locate where the difficulty lives in your body. Is it a tightness in the chest? A knot in the stomach? A buzzing in the head? Stay with the physical sensations rather than the story your mind creates about them.

The suffering we avoid creates more suffering than the suffering we face. So breathe into the discomfort. Not to make it go away, but to make space for it. What you resist persists. What you accept transforms.

If it becomes overwhelming, return to the breath as a refuge. Then, when you feel stable, turn back toward the difficulty. You''re building the capacity to be with what is.

As you close, acknowledge yourself for showing up. This is brave work. The willingness to sit with difficulty on the cushion builds the capacity to navigate difficulty in life.',
  'Building resilience',
  50,
  '{}',
  '{"anxiety","low-mood","focus","sleep","body-awareness","pain","self-compassion","emotions","letting-go"}',
  66,
  33,
  114,
  232,
  41,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '10e10d0f-909b-582d-93d3-e6c8d12c8adc',
  NULL,
  'Midday Reset',
  'Reclaim your center in the chaos',
  'from-yellow-400 to-amber-600',
  '5-10 mins',
  'Breath Awareness',
  'Seated (chair)',
  'Midday',
  'Office, car, or quiet corner',
  'The middle of the day is when presence often slips away. Energy flags, stress accumulates, the morning''s clarity fades. This short practice is a reset button.

You don''t need a special place. Your desk chair, your parked car, a bench in the park - anywhere you can sit undisturbed for five minutes will work.

Close your eyes and take three deep breaths, exhaling fully each time. Feel the chair supporting you. Feel your feet on the ground. You are here, now, in this body, in this moment.

For the next few minutes, simply follow your breath. Don''t try to achieve anything. Don''t review the morning or preview the afternoon. Just be present with the rise and fall of breathing.

If the mind races through to-do lists, acknowledge it: ''planning.'' If it replays a morning conversation: ''remembering.'' Then return to the breath. No judgment. Just returning.

After five minutes, take one final deep breath. Roll your shoulders. Open your eyes slowly. You''ve just reclaimed your center. The afternoon is fresh.',
  'Midday refresh',
  0,
  '{}',
  '{"stress","anger","focus","clarity","sleep","body-awareness","emotions","morning"}',
  94,
  45,
  316,
  100,
  26,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '41e49a1e-0edf-5d25-97a6-cfc3393f897d',
  NULL,
  'The Body Electric',
  'Awaken to the life force within',
  'from-cyan-400 to-blue-600',
  '20-25 mins',
  'Body Scan',
  'Lying down',
  'Anytime',
  'Comfortable quiet space',
  'The body is always in the present moment. It cannot be anywhere else. This practice uses the body as a doorway to deep presence and aliveness.

Lie down comfortably and allow your eyes to close. Take a few moments to feel the weight of your body against the surface beneath you. You don''t have to hold yourself up right now. Let go.

Bring your attention to your left foot. Notice any sensations there - warmth, coolness, tingling, pressure, or perhaps nothing at all. Whatever you find is correct. Don''t try to feel something specific.

Slowly move your attention up through the left leg, then the right foot and leg, through the pelvis and lower back, the belly and chest, the shoulders and arms, the hands and fingers, the neck and throat, the face and head.

As you scan, you may notice areas of aliveness, areas of numbness, areas of tension. Don''t try to fix anything. Simply illuminate each area with your attention like a flashlight moving through a dark room.

Finally, expand your awareness to feel the body as a whole - a single, living field of sensation. Rest here. This aliveness is always available. You just have to remember to feel it.',
  'Embodied awareness',
  10,
  '{}',
  '{"stress","low-mood","grief","anger","focus","sleep","body-awareness","self-compassion","emotions","letting-go","morning"}',
  141,
  187,
  524,
  651,
  55,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'f337be52-fc20-5b63-bea9-5214d1176b6d',
  NULL,
  'Just Sitting',
  'The simplest practice, the deepest teaching',
  'from-slate-400 to-zinc-600',
  '20-30 mins',
  'Zen/Zazen',
  'Seated (cushion)',
  'Morning',
  'Quiet, uncluttered space',
  'Shikantaza - ''just sitting'' - is both the simplest and most challenging practice. There is no technique to master, no goal to achieve. There is only this: sitting, breathing, being.

Take your seat with dignity. The spine is naturally erect, not rigid. The hands rest in the cosmic mudra - left hand cradling right, thumbs lightly touching, forming an oval. The eyes are half-open, gaze lowered at a 45-degree angle.

Now, simply sit. Don''t follow thoughts. Don''t push them away. Don''t concentrate on the breath. Don''t do anything at all. Just be present to whatever arises, letting it come and go like clouds in an empty sky.

This is not passive daydreaming. It requires bright, alert awareness. When you notice you''ve become lost in thought, simply wake up to this moment and continue sitting. No judgment. No correction. Just returning to presence.

The mind will protest. ''What am I supposed to be doing?'' The answer: nothing. Just sitting. Just being. This is enough. This has always been enough.

When your sit is complete, bow to honor the practice. Rise slowly. Carry this ''just being'' quality into your activities.',
  'Pure presence',
  100,
  '{}',
  '{"grief","anger","focus","racing-mind","sleep","pain","self-compassion","morning","beginners"}',
  48,
  45,
  153,
  504,
  50,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'd22d1be2-4cae-5657-a614-2997bdd0ff20',
  NULL,
  'Expanding Loving-Kindness',
  'Let compassion ripple outward',
  'from-pink-400 to-rose-600',
  '20-25 mins',
  'Loving-Kindness',
  'Seated (chair)',
  'Anytime',
  'Quiet, private space',
  'Having cultivated kindness toward yourself, you''re now ready to extend it outward. This practice expands the heart''s capacity to include others.

Begin with yourself, as always. Place your hand on your heart and offer: ''May I be happy. May I be healthy. May I be safe. May I live with ease.'' Let these words generate a felt sense of warmth.

Now bring to mind someone you love easily - a friend, family member, or pet. Visualize them clearly and offer the same phrases: ''May you be happy. May you be healthy. May you be safe. May you live with ease.''

Next, bring to mind someone neutral - perhaps a cashier you see regularly or a neighbor you barely know. Offer them the same wishes. This is where the practice deepens, extending kindness beyond personal preference.

If you''re ready, bring to mind someone difficult - not your hardest person, but someone who mildly irritates you. Offer them the phrases. This may feel forced. That''s okay. You''re training the heart.

Finally, expand to all beings everywhere: ''May all beings be happy. May all beings be free from suffering.'' Feel the boundaries of your heart softening, widening. Close by returning attention to yourself, hand on heart.',
  'Expanding compassion',
  50,
  '{}',
  '{"anger","focus","clarity","pain","self-compassion","emotions"}',
  77,
  91,
  308,
  2391,
  80,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '113025e5-e158-5f92-b9c8-573c642f878f',
  NULL,
  'Noting Practice',
  'Name it to tame it',
  'from-indigo-400 to-blue-600',
  '15-20 mins',
  'Vipassana',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'Noting is a powerful technique for developing clarity about what''s happening in your experience moment to moment. By gently labeling what arises, you create space between yourself and the contents of consciousness.

Settle into your posture and establish awareness of the breath. After a few minutes, begin noting whatever becomes predominant in your experience.

When a thought arises, note ''thinking.'' When you hear a sound, note ''hearing.'' When you feel a physical sensation, note ''feeling.'' When emotions surface, note them specifically: ''anger,'' ''sadness,'' ''joy,'' ''boredom.''

The notes should be quiet, almost sub-vocal. Use only one or two words. Don''t elaborate or analyze. Note and release. Note and release. Think of it as lightly touching experiences as they pass by.

You''ll discover that noting creates perspective. You realize: ''There is thinking happening'' rather than ''I am thinking.'' You become the witness rather than the content.

If noting feels mechanical, let it drop and simply observe. If the mind becomes scattered, return to noting. Use it as a tool, not a religion. Close by sitting quietly without noting, then slowly open your eyes.',
  'Developing clarity',
  50,
  '{}',
  '{"low-mood","anger","focus","racing-mind","clarity","body-awareness","self-compassion","emotions","letting-go"}',
  111,
  74,
  205,
  100,
  25,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '5c170331-baff-54ee-9d00-61d61d799a03',
  NULL,
  'Softening into Sleep',
  'Surrender the day to the night',
  'from-purple-400 to-indigo-600',
  '10-15 mins',
  'Body Scan',
  'Lying down',
  'Before sleep',
  'Bedroom, lights dimmed',
  'This practice is designed to transition you from waking into sleep. There''s no need to stay awake for it - if you drift off, that''s perfect.

Lie in your sleeping position. Take three slow, deep breaths, extending each exhale. With each exhale, let go of something from the day - a worry, a regret, an unfinished task. The day is done. Let it go.

Now begin a gentle body scan. Bring attention to your forehead and consciously soften. Let the muscles release. Move to your eyes, softening the area around them. Your jaw - let it slacken. Your throat - release any tension held there.

Continue down through your shoulders (let them melt into the bed), your arms (heavy and warm), your hands (fingers uncurling). Soften your chest, your belly, your lower back. Let your legs become heavy, your feet release.

Now simply follow your breath. Don''t try to do anything. Let the breath breathe itself. Let thoughts come and go without engagement. You''re not going to solve any problems right now. You''re not going to plan or remember. You''re simply letting go, letting go, letting go.

If you''re still awake, that''s fine. Rest in the softness you''ve created. Sleep will come when it comes.',
  'Peaceful sleep',
  0,
  '{}',
  '{"anxiety","stress","low-mood","grief","focus","racing-mind","sleep","body-awareness","self-compassion","letting-go","morning","evening"}',
  86,
  196,
  210,
  292,
  42,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'a5d1048f-61f3-5452-99ac-668d144bc753',
  NULL,
  'So Hum Mantra',
  'I am That. That I am.',
  'from-amber-400 to-yellow-600',
  '15-20 mins',
  'Mantra',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'So Hum is one of the oldest mantras, meaning ''I am That'' or ''I am the universe.'' The sound naturally aligns with the breath, making it an effortless entry point into mantra meditation.

Settle into your seat and close your eyes. Spend a few moments simply observing your natural breath without manipulation.

Now begin coordinating the mantra with your breath. As you inhale, silently say ''So.'' As you exhale, silently say ''Hum.'' Let the words ride the breath rather than controlling it. So... Hum... So... Hum...

The mantra serves as a focus point for the wandering mind. When you notice thoughts pulling you away, simply return to So Hum. No frustration needed. The return is the practice.

As you continue, let the mantra become quieter, more subtle. Eventually it may become just a whisper, then just a vibration, then just presence. Don''t force this progression - let it happen naturally.

After 15-20 minutes, let the mantra fade and sit in the silence it has created. This silence is not empty - it is full of awareness. Rest here for a few minutes before gently returning.',
  'Cultivating stillness',
  10,
  '{}',
  '{"anger","focus","racing-mind","clarity","sleep"}',
  58,
  106,
  311,
  47,
  21,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '097de5b9-8355-51ad-9c65-78e0a268e58f',
  NULL,
  'Anxiety Anchor',
  'Finding ground when the mind spins',
  'from-teal-400 to-cyan-600',
  '10-15 mins',
  'Breath Awareness',
  'Seated (chair)',
  'Anytime',
  'Wherever you are',
  'When anxiety arises, the mind spins into the future, creating worst-case scenarios. This practice brings you back to the only moment that exists: now.

Sit in a chair with both feet flat on the floor. Press your feet down, feeling the solid ground beneath you. Place your hands on your thighs and feel their weight. You are here, in this body, in this room, right now.

Take one deep breath in through the nose, and let out a long, slow exhale through the mouth. Do this three times. Extended exhales activate the parasympathetic nervous system, signaling safety to your body.

Now bring your attention to five things you can see, four things you can touch, three things you can hear, two things you can smell, one thing you can taste. This grounds you in sensory reality rather than mental projection.

Return to the breath. Notice: you are breathing. The body knows how to do this. You don''t have to control it. Just watch. Anxious thoughts may continue - that''s okay. You don''t have to believe every thought you think. Thoughts are just thoughts.

When you feel more grounded, stand slowly. Feel your feet. Take three more breaths. The present moment is manageable. It''s only our thoughts about it that overwhelm.',
  'Calming anxiety',
  0,
  '{}',
  '{"anxiety","low-mood","anger","focus","racing-mind","body-awareness","emotions"}',
  67,
  61,
  289,
  382,
  50,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '1c73aecd-1433-559c-aa63-1e4d8caa95cf',
  NULL,
  'Open Sky Awareness',
  'Become the space in which everything appears',
  'from-sky-400 to-blue-600',
  '20-30 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'This practice cultivates panoramic awareness - consciousness without a specific focus. It''s advanced work, building on the foundation of concentrated attention.

Settle into your posture and close your eyes. Begin with a few minutes of breath awareness, gathering and stabilizing attention.

Now gradually release the focus on breath. Let your awareness expand outward in all directions like a sphere. Include sounds from all around you - near and far, pleasant and unpleasant. Include sensations throughout the body. Include thoughts as they arise and pass.

You''re not focusing on any particular object. You''re resting as awareness itself - spacious, open, accepting whatever appears. Imagine your awareness as the sky, and all experiences as weather passing through. The sky never resists the weather. It simply holds it.

When you notice the mind has contracted around something - a sound, a thought, a sensation - gently expand again. Open. Soften. Allow.

This practice reveals that awareness itself is already peaceful, already whole. It doesn''t need the contents to be any particular way. Rest in this natural, open awareness.

To close, gently narrow attention back to the breath, back to the body, back to the room. Open your eyes slowly, maintaining the sense of spaciousness.',
  'Expansive presence',
  100,
  '{}',
  '{"grief","focus","racing-mind","clarity","sleep","body-awareness","self-compassion","letting-go","beginners"}',
  69,
  124,
  335,
  268,
  41,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'eb582dbb-f476-59da-9358-237e478f1cec',
  NULL,
  'Gratitude Reflection',
  'Recognize the gifts already present',
  'from-amber-400 to-orange-600',
  '10-15 mins',
  'Open Awareness',
  'Seated (chair)',
  'Evening',
  'Quiet comfortable space',
  'Gratitude is a powerful practice that shifts attention from what''s lacking to what''s present. This evening reflection can transform how you experience your life.

Settle into your seat and close your eyes. Take a few breaths to arrive in the present moment.

Now cast your mind back over this day. Without judgment about what happened, simply review it like watching a movie. Morning... midday... afternoon... evening...

As you review, notice three things you''re grateful for today. They don''t have to be big - a good cup of coffee, a moment of sunshine, a smile from a stranger. Let each one land. Feel the gratitude in your body.

Expand outward: What are you grateful for in your life right now? Health? Relationships? Home? Work that provides? The ability to read these words? Let the feeling of appreciation wash through you.

Gratitude isn''t about denying difficulties or pretending everything is perfect. It''s about recognizing that alongside the challenges, there are also gifts. Both exist simultaneously.

Close by placing your hand on your heart and offering a silent thank you - to life, to the day, to yourself for showing up. Carry this appreciation with you.',
  'Cultivating gratitude',
  0,
  '{}',
  '{"anger","focus","sleep","body-awareness","self-compassion","emotions","morning","evening"}',
  43,
  59,
  110,
  601,
  58,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '858e5ec9-1691-549e-8b94-2b28cfe76f73',
  NULL,
  'Tension Release Breath',
  'Let the body exhale its holding',
  'from-emerald-400 to-teal-600',
  '10-15 mins',
  'Breath Awareness',
  'Seated (chair)',
  'Anytime',
  'Quiet indoor space',
  'The body accumulates tension throughout the day, often without our awareness. This practice uses the breath to consciously locate and release holding patterns.

Sit comfortably and close your eyes. Take a few natural breaths to settle.

Now take a deep breath in, and as you exhale through your mouth, let out an audible sigh. Do this three times. These sighs send a signal to the nervous system: it''s safe to let go.

Bring your attention to your shoulders. On your next inhale, deliberately tense them up toward your ears. Hold briefly. On the exhale, release completely, letting them drop. Notice the contrast between tension and release.

Repeat this pattern with other areas: Make fists with your hands, hold, release. Scrunch your face, hold, release. Tense your whole body, hold, release.

Now scan through your body without adding tension. Notice where you''re already holding without meaning to. Common places: jaw, shoulders, belly, lower back. Breathe into these areas and invite them to soften.

Finish with a few minutes of natural breathing, enjoying the sense of release you''ve created. The body wants to let go. Sometimes it just needs permission.',
  'Physical release',
  0,
  '{}',
  '{"anxiety","stress","grief","focus","clarity","body-awareness","letting-go"}',
  70,
  22,
  271,
  17,
  13,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'dff29176-43e7-549e-94fb-c5b9fd90c7b6',
  NULL,
  'Sound as Meditation',
  'Let the ears be the doorway',
  'from-violet-400 to-purple-600',
  '15-20 mins',
  'Open Awareness',
  'Seated (chair)',
  'Anytime',
  'Any environment with sounds',
  'Sound meditation uses whatever sounds are present as the focus of awareness. Unlike breath meditation, you don''t need special conditions - sounds are everywhere.

Settle into your seat and close your eyes. Rather than trying to create silence, open your ears wide. What can you hear?

Start with the most distant sounds. Traffic, birds, wind, voices far away. Don''t label them as ''traffic'' or ''birds'' - simply hear them as pure sound, as vibration.

Gradually bring attention closer. Sounds in the building or room. The hum of electricity, a ticking clock, the creak of wood. Still closer: sounds of your own body. Your breath. Your heartbeat.

Now hold all sounds in awareness simultaneously. Far and near, loud and soft. You''re not focusing on any particular sound; you''re being aware of the entire soundscape.

Notice how sounds arise, exist briefly, and fade. They come uninvited and leave without asking permission. Thoughts are similar - arising, existing, passing. Can you listen to thoughts the way you listen to sounds?

When the mind labels a sound (''annoying,'' ''pleasant''), notice the labeling and return to pure hearing. Sound before meaning.

To close, take a few breaths and gently open your eyes, maintaining the quality of open listening.',
  'Present-moment awareness',
  10,
  '{}',
  '{"grief","anger","focus","racing-mind","clarity","body-awareness","emotions","beginners"}',
  120,
  81,
  602,
  41,
  16,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '06a89c59-9e51-5f80-a0d7-d26b802cee94',
  NULL,
  'Forgiveness Practice',
  'Release the weight of holding on',
  'from-rose-400 to-pink-600',
  '20-25 mins',
  'Loving-Kindness',
  'Seated (chair)',
  'Anytime',
  'Private quiet space',
  'Forgiveness is not about condoning harm. It''s about freeing yourself from the burden of carrying resentment. This practice is a gift you give to yourself.

Settle in and place a hand on your heart. Take several breaths, grounding yourself in the present moment.

Begin by offering forgiveness to yourself. Think of ways you may have harmed others through your actions, words, or thoughts. Without dwelling in guilt, simply acknowledge: ''For the ways I have caused harm, intentionally or unintentionally, I forgive myself. I forgive myself.''

Next, think of ways others may have harmed you. Start with smaller hurts before approaching larger ones. ''For the ways you have caused me harm, intentionally or unintentionally, I forgive you. I forgive you.''

Forgiveness may not come immediately. That''s okay. You''re planting seeds. Even the willingness to forgive is powerful.

Finally, extend this forgiveness outward: ''May all beings forgive themselves. May all beings forgive each other. May there be peace between us all.''

Sit quietly with whatever arose. Forgiveness is a process, not an event. Each time you practice, you loosen the grip a little more. Close with a hand on your heart, acknowledging your courage.',
  'Releasing resentment',
  50,
  '{}',
  '{"anger","racing-mind","body-awareness","pain","self-compassion","emotions","letting-go","beginners"}',
  4,
  5,
  68,
  5,
  8,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '94e4e2e2-cede-5a23-b446-1825bea3108a',
  NULL,
  'Energy Awakening',
  'Start the day with vital presence',
  'from-orange-400 to-red-600',
  '10-15 mins',
  'Breath Awareness',
  'Standing',
  'Morning',
  'Open space indoors or outdoors',
  'This energizing practice is perfect for mornings when you need to wake up body and mind together. It combines breath, movement, and awareness.

Stand with feet hip-width apart, arms at your sides. Close your eyes and feel your connection to the ground. Take three natural breaths to arrive.

Now begin breathing more deeply. As you inhale, raise your arms slowly out to the sides and overhead. As you exhale, lower them back down. Coordinate movement with breath. Do this five times, feeling the expansion.

Next, stand still and take five rapid breaths through the nose - short, sharp inhales and exhales, pumping from the belly. This awakens energy. Then take one deep breath and hold briefly at the top. Exhale slowly.

Now shake your body. Start with your hands, then arms, shoulders, hips, legs, whole body. Shake for 30 seconds, loosening everything. Stop suddenly and stand still. Feel the aliveness buzzing in your body.

Finish by standing quietly for two minutes, eyes closed, simply feeling the energy you''ve generated. This is your natural vitality. You don''t create it; you just get out of its way.

Open your eyes. Step into your day awake and alive.',
  'Energizing start',
  0,
  '{}',
  '{"low-mood","focus","sleep","body-awareness","emotions","morning","beginners"}',
  5,
  5,
  6,
  650,
  57,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '8deb9331-0603-5227-a73d-3708142dae46',
  NULL,
  'Impermanence Contemplation',
  'Find freedom in the changing nature of things',
  'from-slate-400 to-stone-600',
  '20-25 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'Impermanence is one of the deepest teachings. Everything changes. Everything passes. This contemplation helps transform this from concept to lived understanding.

Settle into your posture and establish steady awareness. Spend five minutes with the breath, stabilizing attention.

Now bring to mind something from your past that once seemed permanent - a relationship, a home, a job, a phase of life. Remember how solid it felt at the time. Notice that it has changed or ended. Where did it go?

Turn your attention to this present moment. Notice the sensations arising and passing in your body. The sounds arising and passing around you. The thoughts arising and passing in your mind. Nothing stays. Each moment dissolves into the next.

This isn''t pessimistic. It''s liberating. Because things change, growth is possible. Because things pass, suffering is temporary. Because nothing is fixed, you are free to transform.

Contemplate: ''This too shall pass. This difficulty will pass. This pleasure will pass. This moment will pass.'' Not morbidly, but with clear seeing.

Close by feeling gratitude for this passing moment. It will never come again. That''s what makes it precious. Rest in the flowing nature of reality.',
  'Understanding impermanence',
  100,
  '{}',
  '{"grief","anger","focus","racing-mind","clarity","sleep","body-awareness","pain","emotions","letting-go"}',
  27,
  28,
  98,
  197,
  41,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '29c35233-b393-5d9e-be83-959602ca19bd',
  NULL,
  'Belly Breath Foundation',
  'Return to the breath of children',
  'from-emerald-400 to-green-600',
  '10-15 mins',
  'Breath Awareness',
  'Lying down',
  'Anytime',
  'Comfortable quiet space',
  'Deep belly breathing is how we breathed as babies before stress taught us to breathe shallowly in the chest. This practice reclaims that natural, calming pattern.

Lie on your back and place one hand on your chest, one hand on your belly. Close your eyes and simply observe your breathing for a minute without changing anything. Which hand rises more?

For many adults, the chest hand moves while the belly stays relatively still. We''re going to reverse this.

As you inhale, focus on pushing the belly hand up toward the ceiling. Imagine filling a balloon in your abdomen. Let the chest stay relatively still. As you exhale, let the belly naturally fall. The exhale requires no effort - just release.

Breath in: belly rises. Breath out: belly falls. Breath in: belly rises. Breath out: belly falls. This is diaphragmatic breathing, the most efficient and calming pattern.

If it feels awkward, be patient. You''re relearning something the body already knows. With practice, this will become your default breathing pattern.

After 10-15 minutes, remove your hands and continue belly breathing. Notice how your whole body feels. This calm, grounded state is available whenever you return to deep belly breathing.',
  'Foundation breathing',
  0,
  '{}',
  '{"stress","focus","body-awareness","emotions","letting-go","beginners"}',
  0,
  0,
  46,
  406,
  51,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '23246f7f-75cc-5367-8a3f-4c1d0104fb2c',
  NULL,
  'Dealing with Drowsiness',
  'Awaken to the alert edge',
  'from-yellow-400 to-amber-600',
  '15-20 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Anytime',
  'Well-lit space',
  'Drowsiness in meditation is common and workable. This session teaches techniques to maintain alertness without creating tension.

Sit in a well-lit room, perhaps near a window. Choose a firm cushion or even sit without back support. Close your eyes and establish awareness of the breath.

If drowsiness arises, try these techniques one at a time:

First, deepen your breath. Take three strong inhales, holding briefly at the top, then exhaling fully. This increases oxygen and wakes the system.

Second, open your eyes partially. Keep the gaze soft, directed downward at a 45-degree angle. This maintains alertness while still supporting inward focus.

Third, adjust your posture. Sit taller. Lift the crown of the head toward the ceiling. Imagine a string pulling you upward. Drowsiness often increases when we slump.

Fourth, broaden your attention. Instead of focusing narrowly on the breath, expand awareness to include sounds, sensations throughout the body. Wide awareness is wakeful awareness.

Fifth, if nothing else works, stand up and continue meditating standing, or do a few minutes of walking meditation.

Meditation cultivates both calm and clarity. We need the alert edge to see clearly. Work with drowsiness, not against it, and it becomes another teacher.',
  'Maintaining alertness',
  10,
  '{}',
  '{"stress","low-mood","focus","clarity","sleep","body-awareness","pain","morning","beginners"}',
  87,
  104,
  366,
  914,
  66,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '3bf1fafa-8ebf-5876-aa66-2753d1fdaedd',
  NULL,
  'Heart Opening',
  'Soften the armor around the heart',
  'from-rose-400 to-red-600',
  '15-20 mins',
  'Loving-Kindness',
  'Seated (chair)',
  'Anytime',
  'Private quiet space',
  'We build armor around our hearts for protection. This practice invites you to safely soften that armor and reconnect with your natural capacity for love.

Sit comfortably and place both hands over your heart. Feel the warmth of your palms, the beat of your heart beneath them. This heart has been beating since before you were born. It doesn''t need your instruction.

Close your eyes and imagine your heart not as a physical organ but as a space - a room within your chest. What is this room like? Is it bright or dim? Spacious or cramped? Open or guarded?

Now imagine that you can open a window in this heart-room. Fresh air enters. Light streams in. Whatever stuffiness or darkness was there begins to clear.

Breathing in, feel the heart space expand slightly. Breathing out, feel it soften. Expand... soften... expand... soften...

Bring to mind someone you love. Let their image fill this heart-space. Feel what happens in your chest. This warmth, this openness - this is your natural state. The armor is learned; the openness is original.

Remain here for several minutes, allowing the heart to simply be open. When you''re ready, slowly remove your hands and sit quietly. The heart remains soft, undefended, available.',
  'Opening the heart',
  10,
  '{}',
  '{"low-mood","clarity","body-awareness","emotions"}',
  0,
  0,
  2,
  206,
  38,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'e0b607d1-a6e1-54f9-835c-12f607da984e',
  NULL,
  'Working with Restlessness',
  'Find stillness within the storm',
  'from-cyan-400 to-teal-600',
  '15-20 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'Restlessness is one of the most common obstacles in meditation. Rather than fighting it, this practice teaches you to work with agitated energy skillfully.

Take your seat and immediately notice if restlessness is present. Where do you feel it? Maybe it''s a jittery sensation in the legs, an urge to move, a feeling that you should be doing something else.

First, acknowledge it: ''Ah, restlessness is here.'' Don''t judge it as bad. It''s just energy in the system that hasn''t found its place yet.

Instead of trying to suppress the energy, channel it. Take five deep, vigorous breaths. Then slowly extend your exhales - make each exhale twice as long as the inhale. This signals the nervous system to downshift.

Now examine the restlessness with curiosity. Where exactly do you feel it? What does it feel like? Hot? Cold? Buzzing? Pulsing? As you investigate, you may notice the restlessness changes or moves.

Remember: you don''t have to scratch every itch. Restlessness often peaks about 10-15 minutes into a sit and then naturally decreases. If you can ride it out with patience, calm awaits on the other side.

Close by appreciating your willingness to sit with discomfort. This builds the capacity to be with difficulty in daily life.',
  'Working with agitation',
  10,
  '{}',
  '{"anxiety","low-mood","anger","focus","sleep","body-awareness","pain","emotions","letting-go","beginners"}',
  11,
  13,
  37,
  740,
  62,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'bf606be6-e5dc-538d-b710-701032c88de4',
  NULL,
  'Equanimity Practice',
  'Rest in unwavering balance',
  'from-stone-400 to-zinc-600',
  '20-25 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'Equanimity is the capacity to remain balanced regardless of what arises. It''s not indifference or suppression - it''s stable, caring presence that doesn''t wobble.

Settle into your posture with a sense of dignity and balance. Spend several minutes establishing steady awareness with the breath.

Now bring to mind something pleasant - a happy memory, a loved one, a beautiful scene. Notice how the mind reaches toward it, wanting to hold on. Notice any attachment.

Next, bring to mind something unpleasant - a minor frustration, a small worry. Notice how the mind pulls away, wanting to escape. Notice any aversion.

Finally, bring to mind something neutral - a stranger''s face, an ordinary object. Notice how the mind glazes over, loses interest. Notice any boredom.

Now practice: whatever arises - pleasant, unpleasant, neutral - meet it with the same quality of balanced attention. Not grasping, not pushing away, not spacing out. Just present, just aware, just accepting.

Use this phrase: ''Things are as they are.'' Pleasant things are as they are. Unpleasant things are as they are. This moment is as it is. Can you rest in that acceptance?

Close by appreciating the glimpses of equanimity you touched. This balance grows through practice.',
  'Cultivating balance',
  100,
  '{}',
  '{"anxiety","anger","focus","sleep","pain","self-compassion","letting-go"}',
  135,
  55,
  578,
  208,
  33,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '41e34b5d-c587-5a0a-96c5-15a3aeecaf3a',
  NULL,
  'Two-Minute Presence',
  'Any moment can be a meditation',
  'from-emerald-400 to-teal-600',
  '2 mins',
  'Breath Awareness',
  'Seated (chair)',
  'Anytime',
  'Anywhere',
  'You don''t always have 20 minutes. But you always have two. This micro-meditation proves that presence is always accessible.

Wherever you are, whatever you''re doing, pause. If possible, close your eyes. If not, soften your gaze.

Take one breath and really feel it - the coolness entering, the warmth leaving. That''s thirty seconds.

Take another breath. Feel your feet on the ground. Feel your body in the chair or wherever you are. That''s one minute.

Two more breaths. On the first, say silently ''I am.'' On the second, say silently ''here.'' I am... here. I am... here.

Open your eyes if they were closed. Look around as if seeing this place for the first time. The colors, the shapes, the light.

That''s two minutes. You just meditated. The app timer can wait. The meeting can wait. Your phone can wait. But presence? Presence is always now.

Use this practice at red lights, in waiting rooms, before meetings, after phone calls. Two minutes, scattered throughout the day, changes everything.',
  'Quick reset',
  0,
  '{}',
  '{"focus","body-awareness","emotions","letting-go","beginners"}',
  303,
  616,
  643,
  123,
  29,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '5b10dc2d-fb35-56d4-b454-04727118d965',
  NULL,
  'Concentration Building',
  'Sharpen the focus like a blade',
  'from-indigo-400 to-violet-600',
  '20-25 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'Concentration is the foundation of deeper meditation. This practice develops one-pointed focus that can eventually penetrate to insight.

Settle into your posture and close your eyes. Begin with broad awareness of the breath - the whole cycle of inhale and exhale.

Now narrow your focus to one specific point: the tip of the nose where air enters. Stay exclusively with the sensations at this one spot - the slight touch of air on the nostrils, the subtle temperature change.

This is focused attention, not relaxed awareness. It requires effort, like balancing on the edge of a knife. When the mind wanders - and it will - notice immediately and return to the point of focus. The quicker you notice, the sharper your concentration becomes.

You may find it helpful to count: inhale, exhale, one. Inhale, exhale, two. Up to five, then restart. If you lose count, start at one.

After 15-20 minutes of focused concentration, relax the effort slightly. Let the focus soften and broaden. Notice how alert the mind has become. This heightened clarity is the fruit of concentration.

Close by sitting openly for a few minutes. The concentrated mind is a powerful tool. Learn to wield it wisely.',
  'Building focus',
  50,
  '{}',
  '{"focus","clarity","sleep","body-awareness","letting-go","beginners"}',
  241,
  509,
  700,
  246,
  39,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '9dc53e37-af7e-5fe1-88fd-8c754c8e5e6e',
  NULL,
  'Self-Inquiry: Who Am I?',
  'Turn the light of awareness on itself',
  'from-purple-400 to-indigo-600',
  '25-30 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'This is an advanced contemplation that points directly to the nature of awareness itself. It requires patience and a willingness to not find easy answers.

Settle into stable sitting and establish several minutes of calm abiding. Let the mind become relatively quiet.

Now ask internally: ''Who am I?'' Not seeking a verbal answer, but looking for the one who is asking. Can you find that one?

Thoughts arise. Who notices them? A body is sitting. Who is aware of the body? Sounds occur. Who hears?

Look for the looker. Listen for the listener. Think about the thinker. Each time you seem to find something, ask: ''Who is aware of that?''

You may notice that awareness cannot find itself as an object. The eye cannot see itself. The knife cannot cut itself. What does this suggest about the nature of what you are?

Don''t try to create a mystical experience. Simply inquire with genuine curiosity. The answer isn''t a concept to grasp but a recognition to rest in.

What you are looking for is what is looking. Rest there. Let the question dissolve. Sit in whatever remains.

Close by returning attention to the breath and body. Ground yourself before opening your eyes.',
  'Self-inquiry',
  500,
  '{}',
  '{"focus","racing-mind","sleep","body-awareness","self-compassion","beginners"}',
  138,
  118,
  443,
  2836,
  78,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '08bc39d7-10b0-50a4-89a5-bd92c2b02c8e',
  NULL,
  'Compassion for a Difficult Person',
  'Transform the heart through challenge',
  'from-pink-400 to-rose-600',
  '20-25 mins',
  'Loving-Kindness',
  'Seated (chair)',
  'Anytime',
  'Private quiet space',
  'Working with a difficult person in metta practice is advanced heart-training. Start with someone only mildly difficult, not your greatest enemy.

Begin by grounding yourself in self-compassion. Place hand on heart. ''May I be happy. May I be safe.'' Establish a felt sense of warmth.

Now, very gently, bring to mind someone who irritates or frustrates you. Don''t choose your deepest wound - choose someone who mildly pushes your buttons.

Notice what happens in your body. Tightening? Resistance? Acknowledge this without judgment. It''s natural.

Now consider: this person, like you, wants to be happy. This person, like you, wants to avoid suffering. Whatever they''ve done, it comes from their own confusion, their own pain, their own unskillful attempts to find peace.

Offer the phrases: ''May you be happy. May you be free from suffering. May you find peace.'' You don''t have to feel it. The willingness to offer is enough.

If it feels impossible, back off. Return to self-compassion. Try again another day. The heart opens gradually, not by force.

Close by returning to yourself, hand on heart. ''May I be at peace. May all beings be at peace.'' This practice takes courage. Honor yours.',
  'Transforming difficulty',
  100,
  '{}',
  '{"anger","focus","clarity","body-awareness","pain","self-compassion","emotions","beginners"}',
  121,
  97,
  1075,
  52,
  17,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'a44a5e6a-250b-53ad-9934-e0651ae3fa4c',
  NULL,
  'Nature Connection',
  'Remember that you belong to the earth',
  'from-green-400 to-emerald-600',
  '15-20 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Anytime',
  'Outdoor setting if possible',
  'This practice reconnects you with the natural world. While it''s best done outdoors, you can also do it indoors by imagining a natural setting.

Find a comfortable seat - on the ground if possible, or a bench or chair. Take a few breaths to arrive.

First, feel the earth beneath you. This ground has been here for billions of years. It holds everything - trees, buildings, oceans, you. Feel supported by this ancient presence.

Now feel the air on your skin. This same air has circulated around the planet, breathed by countless beings. You are part of this great breathing.

Listen to the sounds of nature - wind, birds, insects, leaves. Or if indoors, imagine them. These sounds existed before humans, will exist after. You are visiting their world.

Feel the sun (real or imagined) on your face. This light has traveled 93 million miles to reach you. You are literally made of starlight.

Expand your awareness to include all of nature around you. You are not separate from this. You are this - temporarily organized in human form. The trees, the sky, the earth, you - one interconnected whole.

Sit in this recognition for several minutes. Then, carrying this connection, gently return to activity.',
  'Connecting with nature',
  0,
  '{}',
  '{"emotions","beginners"}',
  25,
  33,
  157,
  12,
  6,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '3c8b5b45-a3c9-5f38-a012-c1fdce67fd4a',
  NULL,
  'Emotional Weather',
  'Observe feelings without becoming them',
  'from-sky-400 to-cyan-600',
  '15-20 mins',
  'Vipassana',
  'Seated (chair)',
  'Anytime',
  'Quiet indoor space',
  'Emotions are like weather systems passing through the sky of awareness. This practice develops the skill of observing emotional states without being swept away by them.

Settle in and spend a few minutes with the breath, establishing stability.

Now tune into your current emotional state. What is the weather like inside? Sunny and clear? Cloudy and heavy? Stormy with turbulence? Or perhaps a mix?

Don''t try to change what you find. Just observe with curiosity. Where do you feel this emotion in the body? What does it feel like - hot, cold, tight, expansive, heavy, light?

Name what you observe: ''There is sadness.'' ''There is anxiety.'' ''There is boredom.'' Using ''there is'' rather than ''I am'' creates perspective. You are not the weather - you are the sky in which weather appears.

Watch how the emotional weather shifts. Even in twenty minutes, you''ll likely notice changes. Emotions are not as solid as they seem. They rise, peak, and fade.

If a strong emotion arises, don''t suppress it, but also don''t feed it with stories. Just feel it directly as sensation in the body. Stay with the felt sense rather than the narrative.

Close by appreciating your capacity to witness emotions. This is freedom - not from emotions, but in them.',
  'Emotional awareness',
  50,
  '{}',
  '{"anxiety","low-mood","grief","clarity","body-awareness","emotions","letting-go"}',
  7,
  17,
  39,
  634,
  54,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'e31841dd-323f-58d5-8097-7683b65d6a3a',
  NULL,
  'Joy Practice',
  'Cultivate the capacity for happiness',
  'from-yellow-400 to-orange-600',
  '15-20 mins',
  'Loving-Kindness',
  'Seated (chair)',
  'Anytime',
  'Comfortable space',
  'Sympathetic joy - happiness at others'' happiness - is one of the four immeasurables. This practice strengthens your capacity for joy.

Settle in and take a few breaths. Let a soft smile come to your face - even a slight upturn of the corners of the mouth changes your state.

Bring to mind a moment when you felt genuinely happy. Not excited or thrilled, but simply content and at ease. Let this memory fill you. Where do you feel happiness in your body?

Now think of someone you love who is experiencing good fortune - success, health, love, or simply a good day. Feel their happiness. Let yourself be genuinely glad for them. ''May your happiness continue. May your joy increase.''

Expand to someone neutral - perhaps a stranger you saw who seemed happy. ''May their happiness continue.'' Joy for their joy.

Finally, bring to mind someone successful whom you might normally envy. Instead of comparing, try: ''I''m happy that you''re happy. May your good fortune continue.'' This is advanced work. Do what you can.

Joy is a skill. The more you practice being happy for others, the more happiness becomes available to you. It''s not a zero-sum game.

Close with a smile and the wish: ''May all beings be happy.''',
  'Cultivating joy',
  50,
  '{}',
  '{"anger","focus","body-awareness","self-compassion","emotions","letting-go"}',
  36,
  35,
  157,
  26,
  19,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'b5e2aff6-8533-525a-ae1b-8b983baeea6a',
  NULL,
  'Silent Retreat at Home',
  'Create sacred space in everyday life',
  'from-stone-400 to-slate-600',
  '60+ mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Your dedicated practice space',
  'This extended practice mimics the silence of a meditation retreat. Set aside at least an hour, preferably more. Turn off your phone. Tell others you''ll be unavailable.

Begin with 5 minutes of settling. Arrive in your body, in this space, in this moment.

For the next 20 minutes, practice breath awareness. Simply follow the breath, returning when the mind wanders.

After 20 minutes, stand mindfully and do 10 minutes of slow walking meditation. Each step deliberate, each movement conscious.

Return to sitting for another 20 minutes. This time, practice open awareness - no specific focus, just spacious presence including all that arises.

Throughout, maintain noble silence - no speaking, no reading, no screens. Let the silence deepen. Notice what happens when external stimulation is removed.

Close with 5 minutes of gratitude reflection, appreciating this time you''ve given yourself.

The silence you''ve cultivated will ripple through your day. Consider making this a weekly practice - your home retreat, your dedicated time for going inward.',
  'Deep practice',
  100,
  '{}',
  '{"focus","body-awareness","self-compassion"}',
  0,
  6,
  20,
  185,
  32,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'bbe516b4-b663-5f91-842f-c3b29ec52219',
  NULL,
  'Body Wisdom',
  'Listen to what the body knows',
  'from-teal-400 to-cyan-600',
  '15-20 mins',
  'Body Scan',
  'Lying down',
  'Anytime',
  'Comfortable quiet space',
  'The body holds wisdom that the thinking mind doesn''t have access to. This practice develops the skill of listening to somatic intelligence.

Lie down comfortably and close your eyes. Take a few breaths to settle.

Bring a question or situation to mind - something you''re uncertain about, a decision you''re facing. Hold it lightly, without trying to think your way to an answer.

Now scan through your body with the question in the background. Notice where you feel something - any sensation, any response. There might be tightness, warmth, expansion, contraction. Don''t interpret yet. Just notice.

Ask the body: ''What do you want me to know?'' Listen. The body doesn''t answer in words but in sensations. A releasing might mean yes. A contracting might mean no. A heaviness might mean something else.

You''re not expecting a clear verbal answer. You''re developing a different kind of knowing - felt sense, gut instinct, somatic wisdom. This takes practice.

If nothing comes, that''s okay. The seeds have been planted. Sometimes the body answers later - in a dream, in a sudden knowing, in how you feel when you try one path versus another.

Close by thanking your body for its wisdom, even if you didn''t clearly receive it today.',
  'Somatic listening',
  50,
  '{}',
  '{"low-mood","racing-mind","clarity","sleep","body-awareness","self-compassion","emotions","letting-go"}',
  40,
  11,
  308,
  24,
  15,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'c694f814-22fd-53d3-adbe-f1b9eb74aa6e',
  NULL,
  'Mindful Eating Preview',
  'Transform your relationship with food',
  'from-amber-400 to-orange-600',
  '15-20 mins',
  'Open Awareness',
  'Seated (chair)',
  'Anytime',
  'Eating space',
  'This practice transforms an ordinary meal into a meditation. You''ll need a small piece of food - a raisin, a strawberry, a piece of chocolate - for this practice.

Sit with the food in front of you. Close your eyes and take three breaths to arrive.

Open your eyes and look at the food as if you''ve never seen it before. Notice its color, shape, texture. How does light play on its surface? If an alien asked you to describe it, what would you say?

Pick it up. Feel its weight in your hand. Notice the texture against your skin. Temperature. Any sensations.

Bring it to your nose. What do you smell? Does your mouth respond? Notice any anticipation.

Slowly bring it to your lips. Feel the contact before you take it in. Place it on your tongue without chewing. What do you notice?

Begin to chew very slowly. How does the texture change? The taste? Notice the impulse to swallow and delay it slightly. When you do swallow, follow the sensation as far down as you can.

Sit quietly afterward. What was that experience like compared to how you normally eat?

This is how our ancestors ate - with attention, with gratitude, with presence. Consider bringing some of this awareness to your next meal.',
  'Mindful eating',
  0,
  '{}',
  '{"low-mood","focus","body-awareness","emotions","letting-go"}',
  22,
  16,
  154,
  422,
  48,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '21db2bbb-96e9-5d43-a432-e0eafe79d875',
  NULL,
  'Death Awareness',
  'Let mortality awaken you to life',
  'from-slate-400 to-zinc-700',
  '20-25 mins',
  'Vipassana',
  'Seated (cushion)',
  'Evening',
  'Quiet private space',
  'Contemplating death is not morbid - it''s clarifying. Awareness of mortality cuts through what doesn''t matter and reveals what does. This is advanced practice.

Settle into stable sitting. Ground yourself with several minutes of breath awareness.

Now contemplate: ''I will die. This is certain. When, I don''t know.'' Let this fact land. Don''t rush past it. Feel its weight.

''Everyone I love will die.'' Parents, children, friends, partners - all are mortal. All these connections are temporary. Does this make them less precious or more?

''Everything I''m worried about will be forgotten.'' In a hundred years, who will remember today''s stress? What will have mattered?

Now ask: ''If I were to die today, how would I want to have lived? What would I regret not doing? What would I be glad I did?''

This contemplation isn''t meant to depress you. It''s meant to wake you up. Death is the teacher that reveals life''s preciousness. Every moment becomes more vivid when you know it''s borrowed.

Close by returning to the breath - this breath, now. Feel the aliveness in your body. You are alive. This is the miracle. Live accordingly.

Sit quietly before opening your eyes. Let the contemplation settle into wisdom.',
  'Awakening through mortality',
  100,
  '{}',
  '{"anxiety","stress","low-mood","grief","sleep","body-awareness","pain","self-compassion","emotions","morning"}',
  0,
  2,
  7,
  706,
  58,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'e8cce4b4-4fbf-52e0-b8b4-0a8cdd635d9a',
  NULL,
  'Morning Intention Setting',
  'Plant the seeds for your day',
  'from-orange-400 to-amber-600',
  '10-15 mins',
  'Open Awareness',
  'Seated (chair)',
  'Morning',
  'Quiet morning space',
  'How you begin the morning shapes the entire day. This practice combines meditation with conscious intention-setting.

Sit comfortably and close your eyes. Take three deep breaths, arriving fully in this new day.

Spend five minutes simply sitting with the breath. No agenda. Just presence. Let the night''s sleep complete and the mind clear.

Now ask: ''What matters most today?'' Not your to-do list, but your deeper priorities. Connection? Creativity? Patience? Courage? Let one quality or intention arise.

Hold this intention like a seed. Visualize planting it in your heart. See it taking root. Imagine carrying this intention through your day - into conversations, tasks, challenges.

State your intention clearly: ''Today, I will practice patience.'' Or: ''Today, I will be present with my family.'' Or: ''Today, I will bring kindness to my work.'' Whatever arose.

Sit for a few more minutes, letting the intention settle. Feel it becoming part of you.

Close by taking one deep breath and opening your eyes. The day awaits. You''ve just chosen how you want to meet it. Now go live your intention.',
  'Setting daily intention',
  0,
  '{}',
  '{"anger","focus","clarity","sleep","self-compassion","emotions","morning","evening"}',
  155,
  81,
  1371,
  59,
  20,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'd0a4eac0-5e29-501b-aff1-063e7d9184ed',
  NULL,
  'Breath and Beyond',
  'Use the breath as a launch pad',
  'from-cyan-400 to-blue-600',
  '20-25 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'This practice uses breath as a foundation to launch into subtler states of awareness. It''s a bridge practice between concentration and insight.

Settle in and establish clear awareness of the breath. Spend 10 minutes developing steady attention, using counting if helpful.

Once concentration feels stable, begin to notice not just the breath but the knowing of the breath. There is breath happening, and there is awareness of breath. Turn attention toward that awareness.

Now let the breath do what it will - you''re no longer directing attention to it. Instead, rest in the awareness that was knowing the breath. What is this awareness like? Does it have edges? A center? A location?

You may notice that awareness itself is spacious, clear, and unchanging - unlike the breath and thoughts which come and go. Rest in this recognition.

If the mind gets lost in thought, use the breath as a home base - return to it, stabilize, then let go again into open awareness.

This oscillation between focus and openness develops flexibility. Sometimes we need concentration; sometimes we need spaciousness. This practice cultivates both.

Close by returning fully to breath awareness, then to body awareness, then slowly open your eyes.',
  'Developing flexibility',
  50,
  '{}',
  '{"grief","focus","racing-mind","clarity","sleep","body-awareness","self-compassion","emotions","letting-go","beginners"}',
  7,
  6,
  9,
  70,
  16,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'e2837e0d-5c38-54c7-a1af-44e5c23794c6',
  NULL,
  'Pain and Presence',
  'Meet physical discomfort with awareness',
  'from-amber-400 to-red-600',
  '15-20 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'This practice develops the skill of being with physical discomfort - useful both in meditation and in life. If you have chronic pain, consult a teacher.

Take your seat and close your eyes. Spend five minutes establishing steady awareness.

Now notice any physical discomfort that''s present - perhaps from sitting, from the day, from your body''s condition. If nothing is present, continue with breath awareness.

If discomfort is present, bring attention directly to it. Instead of pulling away, lean in with curiosity. Where exactly is the sensation? What are its qualities - sharp, dull, throbbing, burning?

Notice that ''pain'' is a label. Underneath the label are raw sensations. Can you feel the sensations without the label? Without the story about them?

Breath into the area of discomfort. Don''t try to make it go away. Simply accompany it with awareness. You might silently say: ''I see you. I''m here with you.''

You may discover that pain observed closely begins to change - shifting location, intensity, quality. Sometimes it decreases. Sometimes it just becomes more workable.

If it becomes too intense, shift attention to a neutral area of the body, stabilize there, then return.

Close by appreciating your willingness to be with difficulty. This is the training for life''s inevitable discomforts.',
  'Working with pain',
  50,
  '{}',
  '{"stress","anger","focus","body-awareness","pain","emotions","letting-go"}',
  168,
  214,
  679,
  52,
  18,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '215fb691-99f0-557b-a8cd-011c7acee6bc',
  NULL,
  'Noting Thoughts',
  'Label the mind''s movements lightly',
  'from-indigo-400 to-violet-600',
  '15-20 mins',
  'Vipassana',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'This practice refines the noting technique to work specifically with thoughts, developing insight into the mind''s patterns.

Settle into your posture and establish breath awareness for several minutes.

Now shift attention to include thoughts. When a thought arises, note its general category. If it''s planning, note ''planning.'' If remembering, note ''remembering.'' If judging, note ''judging.'' If fantasizing, note ''fantasizing.''

Keep the notes simple, one or two words. The purpose isn''t to analyze but to maintain awareness. Note and release. Note and release.

You may start to notice patterns. Maybe your mind plans a lot. Maybe it judges a lot. Maybe it worries. These are just habits, not who you are.

Sometimes you''ll notice you''ve been thinking without noting - you got lost. That''s fine. The moment of noticing is an awakening. Note ''waking up'' and continue.

After fifteen minutes, drop the noting and simply observe thoughts arising and passing. They come uninvited. They leave without asking permission. You don''t create them. Who do they belong to?

Close by returning to breath awareness. The noting mind can rest now. But the awareness it cultivated remains.',
  'Thought awareness',
  50,
  '{}',
  '{"grief","focus","racing-mind","clarity","sleep","body-awareness","letting-go","morning","beginners"}',
  167,
  236,
  585,
  282,
  38,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '88835b45-3d7b-5843-b89f-74816e29e859',
  NULL,
  'Weekend Morning Expansion',
  'Take time when time allows',
  'from-emerald-400 to-teal-600',
  '30-40 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet home space',
  'Weekend mornings often allow for longer practice. This session uses that time for deeper settling.

Before you begin, set aside 30-40 minutes without interruption. Let others know you''ll be unavailable. Turn off devices.

Start simply sitting and breathing. No technique, no agenda. Just arriving. Do this for five minutes.

Now spend 10 minutes with focused breath awareness. Notice the sensations at the nostrils or the rise and fall of the belly. When the mind wanders, return. Build concentration.

Transition to 10 minutes of body awareness. Scan slowly from head to feet, noticing whatever is present. Don''t try to change anything. Just illuminate.

Finally, spend 10-15 minutes in open awareness. No specific focus. Include everything - sounds, sensations, thoughts, breath - in spacious attention. Rest as awareness itself.

The extended time allows deeper settling. After 20-30 minutes, the mind often shifts to a quieter, more subtle state. Trust the process.

Close by sitting quietly for a few minutes without any technique. Then slowly return to your weekend. Carry the stillness with you.',
  'Deep settling',
  10,
  '{}',
  '{"anger","focus","racing-mind","sleep","body-awareness","self-compassion","letting-go","morning","beginners"}',
  256,
  234,
  1797,
  206,
  38,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '2479cf4e-df20-5daa-bf44-60a4274ad1a0',
  NULL,
  'Breathing Through Stress',
  'Activate your parasympathetic ally',
  'from-teal-400 to-emerald-600',
  '5-10 mins',
  'Breath Awareness',
  'Seated (chair)',
  'Anytime',
  'Wherever stress finds you',
  'When stress activates the sympathetic nervous system, this breathing technique activates its opposite - the parasympathetic, or rest-and-digest, response.

Sit or stand and bring your attention to your breath. Don''t change it yet - just notice. Is it shallow? Rapid? Held?

Now begin extending your exhale. Breathe in for a count of 4. Breathe out for a count of 6 or 8. The longer exhale signals safety to your nervous system.

Repeat this pattern several times. In 4... out 6 or 8. In 4... out 6 or 8. Feel the shift happening.

If counting feels stressful, simply focus on making the exhale longer than the inhale. Breathe out as if you''re sighing, completely emptying the lungs.

After five or six extended exhales, let the breath return to normal. But continue to observe. Is it slower now? Deeper? Is there more space between breaths?

Notice your body. Shoulders dropping? Jaw loosening? Heart rate slowing? You''ve just told your nervous system: the threat isn''t as big as it seemed. We can handle this.

Use this practice whenever stress arises. In traffic. Before meetings. During conflict. The breath is always there, always available.',
  'Stress relief',
  0,
  '{}',
  '{"anxiety","stress","focus","sleep","body-awareness","emotions","letting-go"}',
  26,
  26,
  193,
  1982,
  77,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'a74ccd1b-207c-59ea-9ec1-bd309034512a',
  NULL,
  'The Space Between',
  'Rest in the gaps of experience',
  'from-violet-400 to-indigo-600',
  '20-25 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'Between every thought is a space. Between every sound is silence. This practice develops awareness of these gaps - glimpses of pure presence.

Settle in and establish stable attention with several minutes of breath awareness.

Now shift attention to sounds. Notice a sound arise, exist, and fade. In the moment it fades, there is silence. Rest in that silence until the next sound. The silence isn''t empty - it''s aware.

Do the same with thoughts. A thought arises, exists, passes. In the gap before the next thought, there is space. What is that space like? Can you rest there?

The gaps may seem very brief at first. With practice, they expand. Or more accurately, you become more aware of them - they were always there.

These spaces between are not different from your true nature. They are glimpses of awareness without content. Clear. Open. Already peaceful.

When you find yourself lost in content - thoughts, sounds, sensations - gently return to noticing the gaps. Rest in the space that thoughts appear from and dissolve into.

Close by sitting quietly, no longer looking for gaps, simply resting in open awareness. The spaciousness you''ve touched is always present.',
  'Recognizing awareness',
  100,
  '{}',
  '{"grief","anger","focus","racing-mind","clarity","sleep","body-awareness","self-compassion","beginners"}',
  68,
  72,
  352,
  60,
  18,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '266f27b4-a219-523a-9f7a-f812bf2fa636',
  NULL,
  'Whole Body Breathing',
  'Let the entire body breathe',
  'from-emerald-400 to-green-600',
  '15-20 mins',
  'Breath Awareness',
  'Lying down',
  'Anytime',
  'Comfortable quiet space',
  'This practice expands breathing awareness from the nostrils or belly to the entire body, cultivating whole-body sensitivity and presence.

Lie down comfortably and close your eyes. Take several breaths to settle.

Begin with normal breath awareness, noticing the belly rising and falling. Stay here for a few minutes, stabilizing attention.

Now imagine that you can breathe through every pore of your skin. As you inhale, feel the breath entering not just through your nose but through your entire body surface - as if the breath could seep in through your skin everywhere at once.

As you exhale, feel the breath leaving through every pore. The whole body releasing, softening, letting go.

You''re not trying to physically do something different. You''re expanding awareness to include the whole body in the experience of breathing. Breath in: the whole body fills with awareness. Breath out: the whole body releases.

Continue this whole-body breathing for 10-15 minutes. You may notice the boundaries of the body becoming less fixed, more permeable. The breath breathing the body.

Close by allowing the breath to return to normal and simply resting in the feeling of the whole body at once. This unified body awareness is available whenever you remember to notice.',
  'Whole body awareness',
  50,
  '{}',
  '{"low-mood","grief","focus","sleep","body-awareness","emotions","letting-go"}',
  0,
  0,
  3,
  10,
  8,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'f1c17ea0-37d9-55de-9867-618529f069cf',
  NULL,
  'Letting Go Practice',
  'Release your grip on holding',
  'from-sky-400 to-teal-600',
  '15-20 mins',
  'Open Awareness',
  'Seated (chair)',
  'Evening',
  'Quiet indoor space',
  'We spend so much energy holding on - to plans, to worries, to identities, to outcomes. This practice cultivates the skill of releasing.

Settle in and take three deep breaths. On each exhale, consciously release tension in your body. Shoulders drop. Jaw softens. Hands unfold.

Now bring to mind something you''re holding onto - a worry, a resentment, a hope, a plan. Notice where you feel the holding in your body. Tight chest? Knotted stomach? Clenched jaw?

You don''t have to figure out what to do about this thing. You don''t have to let it go permanently. Just for this practice, experiment with loosening your grip.

Breathe into the area where you feel the holding. On the exhale, imagine the fingers of your mind opening, releasing their grip. ''For now, I don''t have to hold this.''

The thing itself may not change. But your relationship to it can. Holding takes energy. Letting go returns that energy to you.

Repeat with other holdings that arise. Some will release easily. Others will grip back. That''s okay. You''re practicing, not achieving perfection.

Close by sitting with open hands, palms up - a gesture of release. Whatever needs holding will find its way. For now, rest with empty hands.',
  'Releasing attachment',
  10,
  '{}',
  '{"anxiety","stress","grief","anger","sleep","body-awareness","self-compassion","emotions","letting-go"}',
  251,
  432,
  1030,
  690,
  64,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '630a012d-8635-5d9a-9f66-00895a081cec',
  NULL,
  'Presence in Daily Life',
  'Every moment is a meditation',
  'from-amber-400 to-orange-600',
  '10-15 mins',
  'Open Awareness',
  'Seated (chair)',
  'Anytime',
  'Any space',
  'Formal meditation is training for what matters more: being present in daily life. This session bridges the cushion and the world.

Sit quietly and close your eyes. Establish a few minutes of simple presence with the breath.

Now consider your day. What activities will you engage in? Work? Conversations? Cooking? Commuting? Choose one ordinary activity.

Imagine doing this activity with full presence. If it''s cooking: the feel of the knife, the colors of the vegetables, the sizzle in the pan. If it''s commuting: the sensations of sitting, the sounds of traffic, the faces of strangers.

Set an intention: ''When I do this activity today, I will be fully present.'' Visualize yourself doing it with awareness, returning when the mind wanders, just as you do in meditation.

Consider what might help you remember. A sticky note? A phone reminder? A physical trigger, like every time you walk through a certain doorway?

The ultimate meditation is life itself, lived with awareness. Formal practice prepares us. Daily presence is the fruit.

Close by taking three breaths, each one a commitment to presence. Then open your eyes and go live your meditation.',
  'Daily presence',
  10,
  '{}',
  '{"anger","focus","body-awareness","self-compassion","emotions","beginners"}',
  65,
  25,
  356,
  12,
  11,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'fb541841-7d53-5c57-8e86-7d9e43e93c14',
  NULL,
  'Forest Path Walking',
  'Each step returns you home',
  'from-green-400 to-emerald-600',
  '20-25 mins',
  'Walking Meditation',
  'Walking',
  'Morning',
  'Outdoor path or indoor hallway',
  'Find a path where you can walk undisturbed - a garden, a hallway, even a room. The destination doesn''t matter. The journey is everything.

Stand at one end of your path. Feel the ground beneath your feet. Notice the weight of your body, the slight swaying as you balance. Take three deep breaths.

Begin walking slowly - much slower than normal. Lift one foot with full awareness. Feel the heel leave the ground, then the ball, then the toes. Swing the leg forward. Place the heel down, then the ball, then the toes. Shift your weight. Repeat with the other foot.

When you reach the end of your path, pause. Stand still for a moment. Then turn slowly and walk back. There is nowhere to go. You are already here. Each step is complete in itself.',
  'Embodied presence',
  0,
  '{}',
  '{"low-mood","grief","sleep","body-awareness","self-compassion","emotions"}',
  21,
  13,
  26,
  312,
  41,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'dc925f21-aa4d-5a3c-873c-a7d7f5109548',
  NULL,
  'Urban Mindful Steps',
  'Find stillness in the city''s pulse',
  'from-slate-400 to-zinc-600',
  '15-20 mins',
  'Walking Meditation',
  'Walking',
  'Midday',
  'City street or office building',
  'You don''t need a forest to practice walking meditation. The city itself can be your temple.

As you walk through urban spaces, maintain a slightly slower pace than usual. Feel each footfall on concrete. Notice the rhythm of your steps against the city''s symphony - traffic, voices, machines.

Let sounds wash over you without following them into stories. A car horn is just sound. A snippet of conversation is just vibration in the air. You are the awareness through which these experiences pass.

When you reach crosswalks, stop and breathe. Use the red light as a mindfulness bell. When you walk again, walk with purpose but without rush. You are practicing presence in the place most people forget to look for it.',
  'Urban presence',
  10,
  '{}',
  '{"clarity","sleep","self-compassion","emotions"}',
  84,
  66,
  521,
  2277,
  79,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '6edf6f60-3951-527a-a2f3-e89d162f0195',
  NULL,
  'Slow Motion Journey',
  'When you slow down, everything opens up',
  'from-amber-300 to-yellow-500',
  '25-30 mins',
  'Walking Meditation',
  'Walking',
  'Morning',
  'Private indoor space',
  'This practice invites you into extreme slowness. Each step may take 30 seconds or more. This is advanced walking meditation.

Stand at the beginning of your walking path. Close your eyes briefly and feel your body as a whole. Open your eyes with a soft gaze, looking a few feet ahead.

Now begin to shift your weight ever so slightly onto your left foot. Feel the right foot becoming lighter. Slowly, achingly slowly, begin to lift the right heel. Notice every micro-movement. The toes lifting. The foot rising through space.

This pace may feel uncomfortable at first. The mind wants to rush. But in this slowness, you discover the infinite complexity of a single step. When you arrive at the end of your path after 20 minutes, you will have taken perhaps 20 steps. And you will have traveled light-years in awareness.',
  'Deep embodiment',
  50,
  '{}',
  '{"low-mood","body-awareness","pain","emotions","beginners"}',
  42,
  61,
  158,
  220,
  34,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'ec5a0618-6607-53e3-8d80-7953860a92dd',
  NULL,
  'Evening Stroll Release',
  'Walk off the weight of the day',
  'from-purple-400 to-indigo-600',
  '15-20 mins',
  'Walking Meditation',
  'Walking',
  'Evening',
  'Neighborhood streets or park',
  'The evening walk is ancient medicine. Cultures around the world practice the after-dinner stroll. This is that tradition, made conscious.

As you step outside, take a moment to feel the transition from indoor to outdoor. Notice the temperature, the light quality, the sounds of evening.

Walk at a natural, comfortable pace - not rushed, not artificially slow. With each step, imagine you are leaving the day behind. The meetings, the emails, the conversations - let them fall away with each footfall.

Breathe deeply as you walk. The evening air carries its own quality. As the day''s light fades, so can your grip on the day''s concerns. By the time you return home, you have shed what needs shedding. You are ready for rest.',
  'Evening release',
  0,
  '{}',
  '{"sleep","body-awareness","emotions","letting-go","evening"}',
  74,
  61,
  269,
  435,
  50,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '981bdf00-60cc-59c0-80b0-30001a98db93',
  NULL,
  'Breath-Step Synchrony',
  'When breath and step become one rhythm',
  'from-teal-400 to-cyan-600',
  '20-25 mins',
  'Walking Meditation',
  'Walking',
  'Anytime',
  'Indoor or outdoor path',
  'In this practice, we unite two natural rhythms: breathing and walking. This creates a moving meditation of remarkable power.

Begin walking at a natural pace. After a minute, start to notice your breath without changing it. Then notice your steps. Now begin to experiment with coordination.

Perhaps you inhale for four steps and exhale for four steps. Or inhale for three, exhale for four. Find a ratio that feels natural and sustainable. There''s no right answer - only what works for your body today.

Once you find your rhythm, let it become automatic. The conscious mind can rest. You become a walking, breathing meditation. If thoughts arise, return to counting: in-2-3-4, out-2-3-4. The simplicity of this rhythm is its power.',
  'Rhythmic presence',
  10,
  '{}',
  '{"focus","racing-mind","sleep","body-awareness","emotions","beginners"}',
  100,
  87,
  321,
  75,
  19,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'ac36ff4e-893c-572b-8b37-feab26973651',
  NULL,
  'Gratitude Walk',
  'Step by step, count your blessings',
  'from-rose-400 to-pink-600',
  '15-20 mins',
  'Walking Meditation',
  'Walking',
  'Morning',
  'Any outdoor space',
  'This walking practice combines movement with gratitude, creating a powerful positive state.

As you begin walking, start to notice things you''re grateful for. Begin with the obvious: I''m grateful for these legs that carry me. I''m grateful for this breath. I''m grateful for this moment.

Let your attention expand outward. Notice the ground supporting you - thank it. Notice the air you breathe - thank it. Notice the sky above - thank it. With each step, find something new to appreciate.

Gratitude is not about ignoring difficulties. It''s about noticing what''s already good while still acknowledging what''s hard. By the end of this walk, you may find your perspective has shifted. The same world looks different through grateful eyes.',
  'Cultivating gratitude',
  0,
  '{}',
  '{"focus","beginners"}',
  3,
  3,
  3,
  64,
  19,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '6ca0588a-5235-58bb-9cce-a55aa7e11936',
  NULL,
  'Walking with Questions',
  'Let your feet find the answers',
  'from-violet-400 to-purple-600',
  '25-30 mins',
  'Walking Meditation',
  'Walking',
  'Anytime',
  'Quiet path or nature trail',
  'Sometimes we need to walk a problem through. This practice uses walking to access deeper wisdom.

Before you begin, hold a question gently in your mind. Not an analytical question, but one from the heart. What do I really want? What am I avoiding? What needs to change?

Begin walking without seeking an answer. Let the question rest lightly in your awareness as you focus on walking. Feel your feet, your breath, your body moving through space.

Often, insights arise spontaneously when we stop grasping for them. If something emerges, pause and let it settle. If nothing comes, that''s fine too. The walking itself is valuable. Trust that your deeper mind is processing, whether or not you receive a clear answer today.

Close by thanking your feet for carrying you, and your mind for its willingness to explore.',
  'Insight seeking',
  50,
  '{}',
  '{"focus","clarity","sleep","body-awareness","self-compassion","emotions","letting-go"}',
  57,
  91,
  375,
  592,
  58,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '493e2856-dfb9-550b-aa8f-0ee6fb369d8f',
  NULL,
  'Barefoot Earth Connection',
  'Feel the planet beneath your feet',
  'from-amber-400 to-green-600',
  '15-20 mins',
  'Walking Meditation',
  'Walking',
  'Morning',
  'Grass, sand, or safe natural surface',
  'Grounding - walking barefoot on the earth - is an ancient practice now backed by modern research. This session invites direct contact with the ground.

Find a safe surface: grass, sand, soft earth. Remove your shoes and socks. Stand still for a moment, feeling the earth''s texture, temperature, and subtle energies against your soles.

Begin walking slowly. Feel each blade of grass, each grain of sand. The foot has thousands of nerve endings - let them awaken. Notice sensations you''ve never noticed before.

As you walk, imagine roots extending from your feet into the earth with each step, then releasing as you lift. You are connecting with something vast and ancient. The earth has been here for billions of years. For these few minutes, you are consciously touching that history.

Close by standing still, pressing your feet firmly into the earth, and breathing deeply three times.',
  'Earth connection',
  0,
  '{}',
  '{"sleep","body-awareness","emotions","letting-go","morning"}',
  153,
  158,
  922,
  247,
  39,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'b51480ed-e8b6-5135-bef2-de00e398497b',
  NULL,
  'Just Sitting: Shikantaza',
  'No technique, no goal, just this',
  'from-stone-400 to-gray-600',
  '25-30 mins',
  'Zen/Zazen',
  'Seated (cushion)',
  'Morning',
  'Simple, uncluttered space',
  'Shikantaza - just sitting - is the heart of Zen practice. There is no technique here. No object of meditation. No goal to achieve.

Take your seat on the cushion. Arrange your body in a stable posture. Hands rest in the cosmic mudra: left hand in right, thumbs lightly touching. Eyes are slightly open, gazing downward about three feet ahead.

Now simply sit. Don''t try to do anything. Don''t try not to do anything. If thoughts arise, let them. If they pass, let them. You are not meditating on something. You are being meditation.

This practice is paradoxically the simplest and the hardest. The ego wants something to do. Give it nothing. Just sit. Just breathe. Just be. When the bell sounds, bow to your practice and rise.',
  'Pure presence',
  100,
  '{}',
  '{"low-mood","racing-mind","sleep","body-awareness","emotions","beginners"}',
  72,
  109,
  457,
  49,
  15,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'cf5314be-4c9c-5ed9-9927-f279a1c5e1a3',
  NULL,
  'Beginner''s Mind Sitting',
  'Fresh eyes see what expertise misses',
  'from-sky-300 to-blue-500',
  '15-20 mins',
  'Zen/Zazen',
  'Seated (cushion)',
  'Morning',
  'Simple, uncluttered space',
  'Shunryu Suzuki wrote: ''In the beginner''s mind there are many possibilities, but in the expert''s there are few.'' This practice cultivates beginner''s mind.

Sit as if you have never sat before. What is this experience of having a body? What is breath? What is sitting? Approach everything with fresh curiosity.

Notice how the mind wants to label and categorize. ''I know what sitting is. I''ve done this before.'' Each time this arises, gently return to not knowing. What is this sensation, really? What is this moment, freshly encountered?

Beginner''s mind is not ignorance. It''s openness. It''s the willingness to be surprised by what we think we already know. The expert is certain. The beginner is curious. Curiosity leads to discovery.

Carry this quality of freshness into your day. What else do you think you know that might benefit from beginner''s eyes?',
  'Fresh perception',
  10,
  '{}',
  '{"body-awareness","beginners"}',
  5,
  4,
  49,
  97,
  23,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '11cd7ce9-7476-50b6-b2f0-ed8792730ef0',
  NULL,
  'Breath Counting Zen Style',
  'Count to ten, then start again',
  'from-slate-300 to-gray-500',
  '20-25 mins',
  'Zen/Zazen',
  'Seated (cushion)',
  'Anytime',
  'Simple, uncluttered space',
  'Breath counting is a traditional Zen technique for developing concentration. It is deceptively simple.

Settle into your posture. Eyes slightly open, gazing downward. Begin breathing naturally. On the first exhale, count ''one'' silently. Inhale. On the exhale, ''two.'' Continue to ten.

When you reach ten, return to one. If you lose count, return to one. If you find yourself at fifteen, return to one. If you''re not sure where you are, return to one.

The rules are simple, but the practice is challenging. The mind wanders constantly. Each return to one is not a failure - it''s a moment of awakening. You noticed the wandering. That''s the practice.

After some months or years of practice, you may find you can count to ten reliably. Then you might count to five. Then just one. Then no counting at all. But for now, just count.',
  'Building concentration',
  0,
  '{}',
  '{"low-mood","focus","sleep","self-compassion","morning","beginners"}',
  5,
  2,
  5,
  531,
  53,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '29e0e166-46df-5f52-8eb7-7230cc525c46',
  NULL,
  'Sitting with Koans',
  'What is the sound of one hand clapping?',
  'from-amber-400 to-orange-600',
  '25-30 mins',
  'Zen/Zazen',
  'Seated (cushion)',
  'Morning',
  'Simple, uncluttered space',
  'Koans are paradoxical questions or statements used in Zen to short-circuit the thinking mind. They cannot be solved intellectually.

For this sitting, take up the koan: ''What was your original face before your parents were born?'' Don''t think about it. Don''t analyze it. Just hold it in your awareness as you sit.

Let the question sink below thought. Let it become a felt sense, a wondering that lives in your belly rather than your head. If you find yourself reasoning about it, drop the reasoning and return to the question itself.

The koan is not meant to have an answer. It''s meant to reveal the limitations of conceptual thinking. When you truly meet the koan, something shifts. But don''t expect this or seek it. Just sit with the question.

Close your sitting with three bows, acknowledging the mystery that cannot be grasped.',
  'Beyond thinking',
  100,
  '{}',
  '{"racing-mind","self-compassion"}',
  56,
  19,
  173,
  23,
  10,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '7ce3ad5e-84cb-5521-87a4-21e0b031c2f9',
  NULL,
  'Kinhin: Walking Zen',
  'Meditation between meditation',
  'from-green-400 to-teal-600',
  '10-15 mins',
  'Zen/Zazen',
  'Walking',
  'Anytime',
  'Meditation hall or room',
  'Kinhin is the walking meditation practiced between periods of sitting in Zen. It maintains the meditative state while giving the body relief.

Stand and place your hands in shashu: make a fist with your left hand, thumb inside, and cover it with your right hand. Hold this at your solar plexus.

Walk very slowly, taking one small step per breath. On the inhale, lift the foot slightly. On the exhale, place it down and shift your weight forward. The movement is continuous and flowing.

Maintain the same quality of attention you had while sitting. Eyes are slightly open, gazing about two feet ahead. The mind is alert but soft. There is nowhere to go. Each step is complete.

When you return to your cushion, sit smoothly back down and resume zazen. The walking and sitting are not different practices. They are one continuous meditation.',
  'Continuous practice',
  10,
  '{}',
  '{"low-mood","focus","body-awareness"}',
  50,
  35,
  134,
  556,
  58,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '936ae000-20d5-5341-a6f3-126ca880baaa',
  NULL,
  'Tea Mind Sitting',
  'Nothing matters except this cup',
  'from-emerald-300 to-green-500',
  '20-25 mins',
  'Zen/Zazen',
  'Seated (cushion)',
  'Midday',
  'Simple space with a cup of tea',
  'The Japanese tea ceremony is Zen in action. This practice brings that spirit to your everyday cup of tea.

Prepare a cup of tea mindfully. Heat the water with attention. Steep the tea with care. Bring the cup to your meditation space.

Sit in zazen posture, the cup before you. For the first several minutes, simply sit with the cup in front of you, not touching it. See it fully. Notice its shape, color, the steam rising.

Then, with great deliberation, lift the cup. Feel its warmth. Bring it to your lips. Take one sip, tasting fully. Set it down. Return to stillness.

Continue this way: periods of stillness, interrupted by single, fully conscious sips. There is no hurry. The tea will cool. That too is part of impermanence.

When the cup is empty, sit with the empty cup. All things arise and pass. The tea is gone. What remains?',
  'Ceremonial presence',
  10,
  '{}',
  '{"low-mood","focus","emotions","letting-go","beginners"}',
  13,
  6,
  75,
  759,
  65,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '859f9ddd-34cf-5d4d-b70b-489f95384ca6',
  NULL,
  'Empty Mind, Empty Room',
  'What''s left when there''s nothing left?',
  'from-gray-200 to-slate-400',
  '30-40 mins',
  'Zen/Zazen',
  'Seated (cushion)',
  'Morning',
  'Very simple, empty space',
  'For this practice, simplify your space as much as possible. Remove distractions. Create emptiness around you as a support for emptiness within.

Sit facing a blank wall, as in traditional zazen. There is nothing to look at. Nothing to focus on. Just you, the wall, and the breath.

Let thoughts empty out. Don''t push them away - that''s more thinking. Simply let them arise and fade like ripples on a pond. Eventually, fewer ripples come. The pond becomes still.

In the stillness, what is there? Can you find the one who is sitting? Look for yourself. Where are you? The more you look, the less you find. This is not a problem. This is the discovery.

Sit in this empty fullness for as long as you can. When you rise, carry this quality of openness with you. The world will fill you again soon enough. For now, rest in the vast emptiness.',
  'Emptiness practice',
  100,
  '{}',
  '{"focus","racing-mind","sleep","self-compassion"}',
  4,
  13,
  68,
  21,
  10,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '1d109167-905f-543e-9025-a2e9342404d9',
  NULL,
  'Zen at Your Desk',
  'The office becomes the zendo',
  'from-blue-300 to-slate-500',
  '10-15 mins',
  'Zen/Zazen',
  'Seated (chair)',
  'Midday',
  'Office or workspace',
  'You don''t need a meditation hall to practice Zen. Your office chair can become your cushion.

Sit upright in your chair, feet flat on the floor, hands resting on your thighs. If possible, close your office door or find a quiet corner. Close your eyes or keep them slightly open, gazing at your desk.

For these few minutes, let work fall away. The emails can wait. The deadlines can wait. Right now, there is only sitting.

Breathe naturally. Let your shoulders drop. Let your jaw relax. Notice the sounds of the office without labeling them as interruption. They are simply sounds. You are simply sitting.

This brief practice can transform your workday. Even five minutes of true presence resets the nervous system. When you return to work, you may find you''re more focused, less reactive, more creative. Zen is not separate from life. Life is the practice.',
  'Work presence',
  0,
  '{}',
  '{"anxiety","stress","focus","sleep","body-awareness","emotions"}',
  0,
  1,
  15,
  88,
  19,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '996cc9f8-0ef7-5d11-90b9-46f74c233de3',
  NULL,
  'Om: The Universal Sound',
  'Vibrate with the cosmos',
  'from-amber-400 to-orange-600',
  '15-20 mins',
  'Mantra',
  'Seated (cushion)',
  'Morning',
  'Private space where sound is okay',
  'Om (or Aum) is perhaps the most ancient mantra, said to contain the vibration of the entire universe.

Sit comfortably and take several deep breaths. When you feel settled, begin to chant ''Om'' on your exhale. Feel the sound begin deep in your belly (ah), rise through your chest (oh), and close at your lips (mm).

Let the sound be natural, not forced. There''s no need to be loud. The vibration matters more than the volume. Feel the sound reverberating through your body - chest, throat, head.

Between each Om, pause briefly. Inhale naturally. Then Om again. Settle into a rhythm. The thinking mind may quiet as you become absorbed in the sound.

After 10 minutes of chanting, let the sound fade but continue sitting in the vibrating silence. The echo of Om continues within you. Rest in that resonance before returning to ordinary consciousness.',
  'Universal connection',
  0,
  '{}',
  '{"racing-mind","sleep","body-awareness","emotions"}',
  134,
  130,
  765,
  7,
  8,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '31cdd746-bb99-5990-bb84-b85eef762d31',
  NULL,
  'So Hum: I Am That',
  'Ride the natural mantra of breath',
  'from-indigo-400 to-violet-600',
  '15-20 mins',
  'Mantra',
  'Seated (chair)',
  'Anytime',
  'Any quiet space',
  'So Hum is called the natural mantra because it mimics the sound of the breath itself. ''So'' on the inhale, ''Hum'' on the exhale.

Settle into your seat and close your eyes. Begin by simply observing your breath without changing it. Notice its natural rhythm.

Now, silently add the mantra. As you breathe in, hear ''So'' in your mind. As you breathe out, hear ''Hum.'' The words can be soft, almost subliminal. They ride the breath like a whisper.

So Hum translates to ''I am that'' - a statement of unity with the cosmic. But don''t worry about meaning. Let the syllables become pure sound, pure vibration synchronized with your breath.

If your mind wanders, gently return to So... Hum... So... Hum... The mantra is a thread leading you back to presence. After 15 minutes, let the mantra fade and sit in the stillness it has created.',
  'Breath unity',
  0,
  '{}',
  '{"anxiety","focus","clarity","self-compassion"}',
  66,
  75,
  621,
  1033,
  69,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '936fd9b6-2021-5670-8e73-ee5f2ff876b3',
  NULL,
  'Mala Meditation',
  '108 repetitions to inner quiet',
  'from-red-400 to-rose-600',
  '20-25 mins',
  'Mantra',
  'Seated (cushion)',
  'Morning',
  'Private space',
  'A mala is a string of 108 beads used to count mantra repetitions. This practice teaches you to use this ancient tool.

Hold the mala in your right hand, draped over the middle finger. Use the thumb to pull each bead toward you as you complete each mantra repetition. Don''t use the index finger, which represents ego in yogic tradition.

Choose a simple mantra: Om, So Hum, or any phrase that resonates. Begin at the guru bead (the large bead) and move bead by bead, repeating your mantra with each.

Let the fingers learn their work so the mind can rest in the sound. The physical sensation of moving beads keeps you grounded while the mantra occupies the verbal mind.

When you return to the guru bead after 108 repetitions, pause. Sit in the accumulated stillness. You can continue for another round or rest in the silence. The mala has done its work.',
  'Devoted repetition',
  10,
  '{}',
  '{"anger","focus","sleep","body-awareness","pain","beginners"}',
  86,
  72,
  431,
  72,
  14,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '395a7883-ee9f-541d-8201-a1cfa4e6588b',
  NULL,
  'Loving-Kindness Mantra',
  'May all beings be happy',
  'from-pink-400 to-rose-600',
  '15-20 mins',
  'Mantra',
  'Seated (chair)',
  'Anytime',
  'Any quiet space',
  'The loving-kindness phrases can be used as mantras, repeated until they sink below thought into feeling.

Settle into your seat and place your hands on your heart. Begin by directing the phrases toward yourself: ''May I be happy. May I be peaceful. May I be free from suffering.''

Repeat these phrases slowly, like a chant. Let them become rhythmic. After several minutes, expand outward: ''May all beings be happy. May all beings be peaceful. May all beings be free from suffering.''

The words may feel hollow at first. That''s okay. With repetition, they begin to carry genuine feeling. The mantra is like a well - the more you draw from it, the deeper it goes.

If you encounter someone difficult in your day, you can silently repeat this mantra for them. It transforms your experience more than theirs. But perhaps it touches them too, in ways we cannot see.',
  'Compassion cultivation',
  10,
  '{}',
  '{"pain","self-compassion","emotions","beginners"}',
  51,
  20,
  172,
  97,
  27,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '8e2a895a-770f-536c-b742-138b4861bb05',
  NULL,
  'Silent Mantra Practice',
  'The sound that only you can hear',
  'from-purple-400 to-indigo-600',
  '20-25 mins',
  'Mantra',
  'Seated (cushion)',
  'Morning',
  'Any quiet space',
  'In this practice, the mantra is repeated silently, heard only in the inner ear. This allows practice anywhere, anytime.

Choose a mantra that resonates with you - Om, So Hum, a sacred phrase from your tradition, or even a word like ''peace'' or ''love.'' Sit comfortably and close your eyes.

Begin repeating the mantra silently. Let it arise naturally, without force. The mantra doesn''t need to be loud in your mind - it can be almost subliminal, a whisper beneath thought.

When other thoughts arise, don''t fight them. Let them pass like clouds while the mantra continues beneath, like a river flowing underground. The mantra is always there when you return to it.

With practice, the mantra becomes automatic. It repeats itself while you rest in awareness. This is the goal - effortless repetition that calms the mind without effort. When you open your eyes, the mantra may continue softly throughout your day.',
  'Inner sound',
  10,
  '{}',
  '{"racing-mind","sleep","self-compassion"}',
  74,
  24,
  81,
  223,
  39,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '225df925-5d6b-579c-9957-d20ab62b1c6f',
  NULL,
  'Healing Sound Meditation',
  'Let vibration medicine reach deep',
  'from-teal-400 to-cyan-600',
  '20-25 mins',
  'Mantra',
  'Lying down',
  'Before sleep',
  'Bedroom or healing space',
  'Sound has been used for healing across all cultures. This practice directs mantra energy toward areas that need healing.

Lie down comfortably. Take several deep breaths and scan your body for areas of tension, pain, or unease. Choose one area to focus on for this session.

Begin chanting ''Om'' softly, directing the vibration toward that area. Imagine the sound waves penetrating the tissue, soothing and healing. Feel the vibration massage the cells.

You can also use healing syllables from various traditions: ''Ram'' for digestion, ''Yam'' for the heart, ''Ham'' for the throat. Or simply use a tone that feels right for the area.

The healing may be physical, emotional, or both - they are not separate. What the body holds, the emotions feel. What the emotions suppress, the body stores. Sound reaches both.

After 20 minutes, let the chanting fade. Rest in silence, feeling whatever shifts have occurred. Then sleep or rise slowly.',
  'Sound healing',
  10,
  '{}',
  '{"stress","low-mood","focus","sleep","body-awareness","pain","emotions"}',
  133,
  70,
  279,
  67,
  20,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '6611aa3e-2a58-558e-bd59-a0a12e074615',
  NULL,
  'Morning Affirmation Mantra',
  'Program your day with positive vibration',
  'from-amber-300 to-yellow-500',
  '10-15 mins',
  'Mantra',
  'Seated (chair)',
  'Morning',
  'Bedroom upon waking',
  'How you begin your day shapes everything that follows. This practice uses mantra-like affirmations to set a positive tone.

Before getting out of bed or shortly after, sit quietly for a few moments. Take three deep breaths to center yourself.

Now begin repeating positive affirmations as mantras: ''I am calm and centered. I meet this day with openness. I have everything I need.'' Repeat each phrase several times before moving to the next.

Choose affirmations that address your current challenges. If you struggle with anxiety: ''I am safe in this moment.'' If you face a difficult task: ''I have the strength to meet what comes.''

These are not lies you tell yourself - they are intentions you set. They create the mental environment in which you''ll operate. Repeat them until they feel real, or at least possible.

Close by taking three more breaths and stepping into your day with the energy you''ve cultivated.',
  'Positive day-setting',
  0,
  '{}',
  '{"anxiety","sleep","self-compassion","emotions","morning"}',
  37,
  20,
  160,
  73,
  20,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '8304aaba-91ef-5bc9-a0b0-6c5db0f91fd8',
  NULL,
  'Chanting into Stillness',
  'Build the wave, then ride the silence',
  'from-orange-400 to-red-600',
  '25-30 mins',
  'Mantra',
  'Seated (cushion)',
  'Evening',
  'Private space where sound is okay',
  'This advanced practice uses vigorous chanting to build energy, then drops into profound stillness.

Begin chanting Om or another mantra with full voice. Don''t be timid - let the sound fill the room. Chant with energy, perhaps even moving your body slightly as you do.

Continue for 10-15 minutes, building intensity. The chanting should feel almost ecstatic by the end. You are generating energy, raising vibration.

Then, suddenly, stop. Completely. Sit in absolute stillness. Don''t move. Don''t make a sound. Just be.

The contrast is striking. The silence after sound is deeper than silence alone. The stillness after movement is more profound. You have created a wave and now you ride it into the depths.

Sit in this stillness for 10-15 minutes. Whatever arises, let it. The energy you generated is doing its work. When you finally move, do so slowly, reverently.',
  'Dynamic stillness',
  50,
  '{}',
  '{"focus","body-awareness","emotions"}',
  1,
  2,
  5,
  283,
  43,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '2048c6f8-8314-56d5-9687-4606ea21a7cd',
  NULL,
  'Full Body Scan',
  'Meet your body, part by part',
  'from-blue-400 to-indigo-600',
  '25-30 mins',
  'Body Scan',
  'Lying down',
  'Evening',
  'Comfortable floor or bed',
  'The body scan is a foundational practice for developing interoception - awareness of the body''s internal states.

Lie down comfortably, arms at your sides, palms up. Close your eyes and take several deep breaths, allowing your body to settle into the surface supporting you.

Begin at the top of your head. Notice any sensations there - tingling, pressure, warmth, coolness, or nothing at all. Don''t try to change anything. Simply notice.

Slowly move your attention down: forehead, eyes, cheeks, jaw, neck, shoulders. Take your time. There''s no rush. Each area deserves your full attention for several breaths.

Continue through arms, hands, fingers, chest, belly, hips, legs, feet, toes. Some areas will be vivid, others vague. Both are fine. You''re building a relationship with your body.

When complete, feel your body as a whole. Then wiggle fingers and toes, stretch gently, and slowly rise.',
  'Body awareness',
  0,
  '{}',
  '{"stress","low-mood","focus","body-awareness","emotions","letting-go","beginners"}',
  8,
  19,
  14,
  100,
  21,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'bd701a22-3934-56e7-81c6-89579240c0e8',
  NULL,
  'Quick Body Check-In',
  'Sixty seconds of embodiment',
  'from-cyan-400 to-blue-600',
  '5-10 mins',
  'Body Scan',
  'Seated (chair)',
  'Midday',
  'Office or any space',
  'This rapid body scan can be done anywhere, anytime, to quickly reconnect with your body.

Sit or stand comfortably. Close your eyes if possible, or keep a soft gaze. Take one deep breath.

Scan quickly from head to feet. Don''t linger, just check in: Head - any tension? Shoulders - holding? Hands - clenched? Belly - tight? Legs - braced? Feet - grounded?

Breathe into any areas of obvious tension. Consciously release. Drop shoulders. Unclench jaw. Relax hands. Soften belly.

Take one more deep breath, feeling your body as a whole. Notice the ground beneath you, the air around you, the weight of your body.

Open your eyes. You''ve just reset your nervous system in under two minutes. This practice, done multiple times throughout the day, prevents tension from accumulating.',
  'Quick reset',
  0,
  '{}',
  '{"anxiety","stress","body-awareness","emotions","letting-go"}',
  3,
  2,
  22,
  417,
  50,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '727c1c52-bfb2-50a4-a5ec-eab9b6af7876',
  NULL,
  'Tension Release Scan',
  'Find it, feel it, let it go',
  'from-rose-400 to-pink-600',
  '20-25 mins',
  'Body Scan',
  'Lying down',
  'Evening',
  'Comfortable floor or bed',
  'This body scan specifically targets tension patterns, using the breath to release them.

Lie down and take several deep breaths. As you settle, begin to notice where you hold tension. Everyone has signature patterns: jaw, shoulders, lower back, hips.

Start with your feet and move upward. When you find an area of tension, pause. Breathe into it - imagine the breath flowing directly to that spot. On the exhale, imagine the tension flowing out.

Some areas may need several breaths. Some tension is stored for years. Be patient and gentle. You''re not forcing release - you''re inviting it.

Pay special attention to common tension zones: jaw (clenching), shoulders (carrying burdens), hands (grasping), belly (protection), hips (stored emotion). Each area has its wisdom.

By the end, your body should feel heavier, more relaxed, more connected to the surface supporting you. You''ve released what you could. The rest will come in time.',
  'Deep release',
  10,
  '{}',
  '{"stress","low-mood","focus","sleep","body-awareness","emotions","letting-go","beginners"}',
  83,
  83,
  597,
  86,
  22,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'f038fcde-8dff-5e52-9053-9e00734a8cf9',
  NULL,
  'Mindful Movement Scan',
  'Scan as you stretch',
  'from-green-400 to-emerald-600',
  '15-20 mins',
  'Body Scan',
  'Standing',
  'Morning',
  'Space to move freely',
  'This practice combines body scanning with gentle movement, waking up the body mindfully.

Stand with feet hip-width apart. Close your eyes briefly and check in: how does your body feel this morning?

Begin by raising your arms slowly overhead, scanning the sensation of muscles lengthening. Pause at the top and notice.

Slowly fold forward, scanning the spine as it curves, the hamstrings as they stretch. Pause at the bottom.

Continue with gentle, intuitive movements: twisting, side-bending, circling joints. With each movement, scan the sensations. What''s tight? What''s open? What feels good? What needs attention?

This isn''t exercise - it''s embodied awareness. Move slowly enough to feel everything. The body is your first and last home. Morning is a good time to walk through the rooms.

Close standing still, scanning the body after movement. Notice how different it feels from when you began.',
  'Moving awareness',
  0,
  '{}',
  '{"grief","focus","sleep","body-awareness","self-compassion","emotions","morning","beginners"}',
  82,
  84,
  694,
  250,
  38,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'fb3820fa-06f0-5f31-aa42-252ae499b74b',
  NULL,
  'Sleep Preparation Scan',
  'Guide your body into deep rest',
  'from-indigo-500 to-purple-700',
  '15-20 mins',
  'Body Scan',
  'Lying down',
  'Before sleep',
  'Bed',
  'This body scan is designed to transition you into sleep. You may drift off before it''s complete - that''s perfect.

Lie in your sleeping position. Take three deep breaths, sighing on the exhales. With each sigh, let the day fall away.

Begin at your feet. Tell them: ''Feet, you''ve carried me today. You can rest now.'' Feel them relax, sink into the mattress.

Move up to legs: ''Legs, you can rest now.'' Then hips, belly, chest, each time thanking the body part and giving it permission to let go.

When you reach your head, thank your mind for its work today. Tell it: ''Mind, you can rest now. I don''t need you for a while. Let go.''

If you''re still awake, simply rest in the sensation of a fully relaxed body. Thoughts may come. Let them. You''re not doing anything now. You''re allowing sleep to come to you.

Sweet dreams.',
  'Sleep transition',
  0,
  '{}',
  '{"grief","focus","racing-mind","sleep","body-awareness","emotions","letting-go","morning"}',
  120,
  106,
  796,
  665,
  59,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'b66f6f87-df9f-5699-82e4-aa3247a30ea3',
  NULL,
  'Pain Awareness Scan',
  'Meeting discomfort with curiosity',
  'from-amber-400 to-orange-600',
  '20-25 mins',
  'Body Scan',
  'Lying down',
  'Anytime',
  'Comfortable floor or bed',
  'This practice is for times when you''re experiencing physical discomfort. It doesn''t make pain disappear, but it can change your relationship to it.

Lie down and settle in. Take several breaths and acknowledge that there is pain present in your body. This is real. This is what''s happening.

Now, with curiosity rather than aversion, move your attention toward the painful area. What exactly do you feel? Is it sharp or dull? Constant or pulsing? Does it have edges or does it blur?

Explore the sensation with the neutral interest of a scientist. Often we resist pain so much that we don''t actually know what it feels like. We experience our resistance more than the pain itself.

Breathe around the area. Not trying to fix it, but creating space. Pain that has room around it is different from pain we clench against.

Scan the rest of your body too. Find areas that are pain-free. Rest your attention there occasionally. Remember that pain is not all of you.

Close with self-compassion. Having a body means sometimes having pain. May you find ease.',
  'Pain relationship',
  10,
  '{}',
  '{"low-mood","anger","focus","sleep","body-awareness","pain","self-compassion","emotions","letting-go"}',
  40,
  22,
  120,
  76,
  23,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '30261f38-fc8d-5d92-bb96-90b19b56a2fb',
  NULL,
  'Metta for Difficult People',
  'The hardest kindness transforms us most',
  'from-violet-400 to-purple-600',
  '20-25 mins',
  'Loving-Kindness',
  'Seated (cushion)',
  'Anytime',
  'Quiet, private space',
  'This is advanced loving-kindness practice. We extend compassion to those who challenge us.

Begin by establishing metta for yourself. ''May I be happy. May I be peaceful.'' Spend several minutes cultivating warmth in your own heart.

Now bring to mind someone who has hurt you or whom you find difficult. Start with someone mildly challenging - not your worst enemy, just someone who irritates you.

See their face. Remember: they too want to be happy. They too suffer. Their difficult behavior comes from their own pain. This doesn''t excuse it, but it explains it.

Now, with whatever sincerity you can muster: ''May you be happy. May you be peaceful. May you be free from suffering.'' The words may feel false. Say them anyway. You''re not condoning their behavior. You''re freeing yourself from resentment.

If it becomes too difficult, return to metta for yourself or for an easy person. Then try again. This is hard work. Be patient with yourself.

Close with metta for all beings, letting the difficult person dissolve back into the ocean of humanity.',
  'Difficult forgiveness',
  50,
  '{}',
  '{"anger","focus","pain","self-compassion","emotions","beginners"}',
  18,
  23,
  213,
  2091,
  77,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '7522a4da-301e-57f6-aa04-a686f73994b9',
  NULL,
  'Loving-Kindness for the World',
  'Expand your heart to hold everything',
  'from-sky-400 to-cyan-600',
  '20-25 mins',
  'Loving-Kindness',
  'Seated (cushion)',
  'Morning',
  'Quiet space',
  'In this practice, we expand loving-kindness outward in ever-widening circles until we hold the whole world.

Begin with yourself. ''May I be happy. May I be peaceful.'' Feel warmth in your heart. Spend a few minutes establishing this.

Now extend to loved ones nearby - family, friends, pets. ''May you be happy. May you be peaceful.'' See their faces, feel your care for them.

Expand to your community - neighbors, colleagues, acquaintances. Then to your city. Then to your country. Then to the whole world.

''May all beings be happy. May all beings be peaceful. May all beings be free from suffering.'' Include humans and animals. Include beings you''ll never meet. Include those being born right now and those dying right now.

Your heart is bigger than you think. It can hold the whole world. Let it expand to do so.

Close by coming back to yourself, feeling the warmth still present, and dedicating this practice to the benefit of all beings everywhere.',
  'Universal compassion',
  10,
  '{}',
  '{"grief","anger","pain","self-compassion","emotions"}',
  54,
  34,
  159,
  338,
  47,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '514de2e5-ab4d-5b86-b0cc-8ff615b69889',
  NULL,
  'Self-Compassion Break',
  'Be your own best friend',
  'from-rose-300 to-pink-500',
  '10-15 mins',
  'Loving-Kindness',
  'Seated (chair)',
  'Anytime',
  'Any quiet space',
  'This brief practice is for moments when you''re struggling - with failure, with shame, with self-judgment.

Place both hands on your heart. Feel the warmth and gentle pressure. Take a few deep breaths.

Acknowledge what you''re feeling: ''This is a moment of suffering.'' Name it honestly. You don''t have to fix it or push it away.

Recognize common humanity: ''Suffering is part of life. Everyone feels this way sometimes.'' You are not alone in your struggle.

Now offer yourself kindness: ''May I be kind to myself. May I give myself the compassion I need.'' Speak as you would to a dear friend who was suffering.

If words feel hollow, simply stay with the warmth of your hands on your heart. Touch itself is healing. Presence is enough.

When you''re ready, take a deep breath, open your eyes, and continue your day with whatever has shifted.',
  'Self-comfort',
  0,
  '{}',
  '{"stress","pain","self-compassion","emotions"}',
  274,
  331,
  1411,
  24,
  12,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '5a7a21e4-12ba-5f61-a603-ad532d0b699d',
  NULL,
  'Gratitude Loving-Kindness',
  'Thank the web that holds you',
  'from-amber-300 to-orange-500',
  '15-20 mins',
  'Loving-Kindness',
  'Seated (chair)',
  'Evening',
  'Quiet space',
  'This practice combines loving-kindness with gratitude, appreciating all who contribute to your life.

Begin by bringing to mind someone who has helped you recently - a friend, a teacher, a stranger who held a door. See their face. ''Thank you. May you be happy.''

Expand to people who support your life invisibly: farmers who grew your food, workers who built your home, ancestors who shaped your culture. ''Thank you, all of you. May you be happy.''

Consider the earth itself that supports you. The air you breathe. The water you drink. Send gratitude and loving-kindness to the planet.

Now bring to mind anyone you''ve taken for granted. Perhaps a family member who''s always there. Perhaps yourself. ''Thank you. May you be happy.''

We are held by a vast web of beings and forces. This practice acknowledges our interdependence and sends blessing back along all the threads that hold us.

Close feeling held, grateful, and part of something larger.',
  'Grateful connection',
  0,
  '{}',
  '{"anger","focus","pain","self-compassion","emotions"}',
  90,
  72,
  427,
  744,
  61,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '790a2ca2-8a19-59cf-bfd1-8b84ac6dfd60',
  NULL,
  'Heart-Opening Visualization',
  'Let your heart bloom',
  'from-pink-400 to-red-600',
  '20-25 mins',
  'Loving-Kindness',
  'Seated (cushion)',
  'Morning',
  'Quiet, private space',
  'This practice uses visualization to open the heart center and cultivate loving-kindness.

Sit comfortably with your spine erect. Close your eyes and take several deep breaths. Bring your attention to the center of your chest.

Visualize a small light there - perhaps warm pink or golden white. With each inhale, see this light growing brighter and larger. With each exhale, see it radiating outward.

As the light grows, let it represent loving-kindness - warmth, care, and compassion. Let it fill your chest, then your whole body, then expand beyond your body into the room.

See the light touching everyone and everything around you. See it spreading to your neighborhood, your city, the whole world. You are a source of light and love.

Now bring the light back, gathering it again at your heart. The source remains. It is inexhaustible. You can shine this light anytime you choose.

Rest in the warmth of your open heart before returning to ordinary awareness.',
  'Heart opening',
  10,
  '{}',
  '{"anger","focus","sleep","body-awareness","self-compassion","emotions"}',
  44,
  36,
  233,
  652,
  63,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'dc7d6616-75d0-5b5b-a295-663f3b80a8bd',
  NULL,
  'Tonglen: Taking and Giving',
  'Transform suffering through the breath',
  'from-slate-400 to-gray-600',
  '20-25 mins',
  'Loving-Kindness',
  'Seated (cushion)',
  'Anytime',
  'Quiet, private space',
  'Tonglen is a Tibetan practice of breathing in suffering and breathing out compassion. It''s counterintuitive and powerful.

Begin by connecting with your own suffering - whatever is difficult right now. Breathe in the feeling fully, not resisting it. On the exhale, breathe out relief, spaciousness, and light.

Now bring to mind someone you know who is suffering. Visualize their pain as dark, heavy smoke. On your inhale, breathe in their suffering. On your exhale, breathe out light, healing, and peace toward them.

This seems backwards - we usually try to exhale negativity and inhale positivity. But tonglen transforms our relationship to suffering. By willingly taking in pain and sending out relief, we discover that we are bigger than our suffering.

Expand to all beings who suffer in similar ways. Breathe in the suffering of the world. Breathe out compassion and healing for all.

Close by resting in open awareness, having expanded your capacity to hold both suffering and joy.',
  'Transforming suffering',
  100,
  '{}',
  '{"low-mood","sleep","pain","self-compassion","emotions"}',
  287,
  197,
  1405,
  278,
  38,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '917a1061-0cc6-5b08-82ba-a3baf38da3c5',
  NULL,
  'Belly Breathing Basics',
  'Drop your breath into your center',
  'from-emerald-400 to-teal-600',
  '10-15 mins',
  'Breath Awareness',
  'Lying down',
  'Anytime',
  'Comfortable floor or bed',
  'Many of us breathe shallowly, only into the chest. This practice teaches diaphragmatic breathing, which calms the nervous system.

Lie down and place one hand on your chest and one on your belly. Breathe normally and notice: which hand rises more?

For most people, it''s the chest hand. We''ve learned to breathe shallowly, anxiously. Let''s unlearn that.

Now, consciously breathe so that your belly hand rises while your chest hand stays relatively still. This means you''re engaging your diaphragm fully.

The inhale should feel like a balloon inflating in your belly. The exhale, the balloon deflating. The chest moves very little. This is how babies breathe, how we breathed before stress taught us otherwise.

Practice for 10 minutes, simply belly breathing. It may feel strange at first. With practice, it becomes natural again.

This single shift - from chest to belly breathing - can reduce anxiety, improve sleep, and create a foundation for all other meditation.',
  'Deep breathing',
  0,
  '{}',
  '{"anxiety","stress","low-mood","sleep","pain","emotions","beginners"}',
  35,
  24,
  185,
  12,
  12,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'ceecc458-bccb-544e-9fd7-6a6398104a35',
  NULL,
  'Four-Count Square Breathing',
  'Create a calm, steady rhythm',
  'from-blue-400 to-indigo-600',
  '10-15 mins',
  'Breath Awareness',
  'Seated (chair)',
  'Midday',
  'Any quiet space',
  'Square breathing (also called box breathing) is used by Navy SEALs and therapists alike. It''s powerfully calming.

Sit comfortably with your spine erect. Take a moment to settle, then begin the pattern:

Inhale for 4 counts. Hold full for 4 counts. Exhale for 4 counts. Hold empty for 4 counts. Repeat.

The counts should be slow and even. If 4 is too long, start with 3. If 4 is easy, try 5 or 6.

The ''square'' comes from the four equal sides: in, hold, out, hold. You''re creating a steady, rhythmic container for your attention.

If your mind wanders, return to counting. The simplicity of the structure makes it easy to notice when you''ve drifted.

After 10 minutes, let the counting go and breathe naturally. Notice how you feel. The nervous system has received a signal of safety through this slow, controlled breathing.

Use this technique anytime you feel anxious, overwhelmed, or need to refocus.',
  'Calm focus',
  0,
  '{}',
  '{"anxiety","focus","emotions","beginners"}',
  4,
  5,
  42,
  8,
  5,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '6e3ccbed-7355-5da1-bac9-1d6abc50b0b8',
  NULL,
  'Extended Exhale Relaxation',
  'Let the out-breath carry you to rest',
  'from-violet-400 to-purple-600',
  '15-20 mins',
  'Breath Awareness',
  'Lying down',
  'Before sleep',
  'Bed or comfortable surface',
  'Extending the exhale activates the parasympathetic nervous system - the ''rest and digest'' mode. This practice uses that mechanism for deep relaxation.

Lie down comfortably. Begin by breathing naturally, observing your rhythm without changing it.

Now begin to lengthen your exhale. If you inhale for 4 counts, exhale for 6 or 8. Don''t force it - just gently extend.

The inhale remains natural. The exhale is where the magic happens. As you breathe out slowly, you''re telling your body it''s safe to relax.

With each extended exhale, feel yourself sinking deeper into the surface beneath you. Feel your muscles releasing. Feel your mind slowing.

If you''re doing this before sleep, you may not finish the practice. That''s perfect. Let the breath carry you into dreams.

If you''re doing this for relaxation during the day, after 15 minutes return to natural breathing and notice the profound shift in your state.',
  'Deep relaxation',
  0,
  '{}',
  '{"anxiety","low-mood","sleep","body-awareness","self-compassion","emotions","letting-go"}',
  1,
  0,
  4,
  56,
  15,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'b750f474-61f4-529b-bfe9-4235c3dae117',
  NULL,
  'Breath at the Nostrils',
  'The subtle doorway to presence',
  'from-cyan-400 to-teal-600',
  '20-25 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'This classic technique focuses attention on the subtle sensations where breath enters and leaves the nostrils.

Sit in a stable posture. Close your eyes and take a few settling breaths. Now bring your attention to the tip of your nose and the rim of your nostrils.

Notice the sensation of air passing in - perhaps cool, perhaps tingling. Notice the sensation of air passing out - perhaps warm, perhaps soft. This is your entire field of attention.

The sensations are subtle. This is intentional. By focusing on something subtle, we train the mind to be fine and precise.

When thoughts arise, simply note ''thinking'' and return to the nostrils. The breath is always happening right here. It''s a constant anchor.

With practice, you''ll notice subtler and subtler sensations: the slight pause between breaths, the different quality of in-breath and out-breath, perhaps even the sensation of individual hairs in the nostrils.

This refined attention spills over into daily life, making you more present and perceptive everywhere.',
  'Refined attention',
  10,
  '{}',
  '{"grief","anger","focus","racing-mind","body-awareness"}',
  0,
  1,
  2,
  20,
  8,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'e1c4304c-cb59-5216-b9c2-e78a4111ed1b',
  NULL,
  'Whole Body Breathing',
  'Let breath animate every cell',
  'from-green-400 to-emerald-600',
  '20-25 mins',
  'Breath Awareness',
  'Lying down',
  'Anytime',
  'Comfortable floor or bed',
  'In this practice, we expand breath awareness from the lungs to the entire body.

Lie down and begin with natural breathing. Feel the belly and chest rise and fall. This is breath as we usually know it.

Now expand your awareness. Feel how the breath creates subtle movement throughout the body. The ribs expand. The back presses into the floor. Even the limbs move slightly.

Go further. Imagine you''re breathing through your skin. With each inhale, imagine oxygen entering through every pore. With each exhale, imagine tension and toxins releasing through every pore.

Feel the body as a breathing whole, not just lungs but every cell participating in this exchange with the environment. The boundaries between inside and outside become less distinct.

This is not just imagination. At a cellular level, every part of you is involved in respiration. This practice brings that reality into conscious experience.

Close by feeling the whole body breathing as one organism, connected to the air that surrounds you and all who breathe it.',
  'Full-body awareness',
  50,
  '{}',
  '{"stress","low-mood","body-awareness","emotions","letting-go"}',
  1,
  0,
  10,
  52,
  19,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '67d7812a-4e8b-5b83-9630-a796eafc285d',
  NULL,
  'Noting Practice',
  'Name what arises, then let it go',
  'from-amber-400 to-orange-600',
  '20-25 mins',
  'Vipassana',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'Noting is a core Vipassana technique where we mentally label experiences as they arise.

Settle into your posture and begin with the breath. When you notice a thought, silently note ''thinking.'' When you notice a sensation, note ''feeling.'' When you hear a sound, note ''hearing.''

The label is a light touch - just one word, then release. You''re not analyzing or elaborating. Just: note, release, return.

Common notes include: thinking, planning, remembering, fantasizing, worrying, feeling, sensing, hearing, itching, pain, pleasure, restless, sleepy.

The act of noting creates distance between you and your experiences. You become the witness rather than the participant. This is insight.

With practice, you''ll notice patterns. Perhaps you think more than you feel. Perhaps you constantly plan. These observations are not judgments - just information about how your mind works.

Close by releasing the noting and sitting in open awareness, letting experience flow without labels.',
  'Developing insight',
  10,
  '{}',
  '{"anxiety","focus","racing-mind","clarity","sleep","body-awareness","pain","emotions","letting-go"}',
  103,
  148,
  530,
  3265,
  80,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '2d16dfbc-647c-51b5-a997-011ce5ce1edb',
  NULL,
  'Observing Impermanence',
  'Watch everything change',
  'from-slate-400 to-gray-600',
  '25-30 mins',
  'Vipassana',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'Impermanence (anicca) is one of the three characteristics of existence in Buddhist teaching. This practice cultivates direct experience of it.

Sit quietly and begin by noticing sensations in your body. Pick any sensation - an itch, a pressure, a tingling. Watch it closely.

Notice: the sensation is not static. It fluctuates. It intensifies or fades. It moves. If you watch long enough, it changes completely or disappears.

This is impermanence at the level of moment-to-moment experience. Everything is in flux. Nothing stays the same.

Now expand your observation. Notice sounds arising and passing. Thoughts arising and passing. Emotions arising and passing. Everything comes and goes.

This insight, deeply felt, can be liberating. We suffer because we try to hold onto pleasant experiences and push away unpleasant ones. But nothing can be held. Everything flows.

The practice is not to make impermanence happen - it''s already happening. The practice is to notice it clearly. This noticing changes everything.',
  'Seeing impermanence',
  50,
  '{}',
  '{"stress","grief","racing-mind","clarity","body-awareness","pain","self-compassion","emotions","letting-go"}',
  54,
  86,
  523,
  445,
  51,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'c5e19ee2-e99e-5bd1-938e-59402214394f',
  NULL,
  'Investigating Vedana',
  'Notice pleasant, unpleasant, neutral',
  'from-rose-400 to-pink-600',
  '20-25 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'Vedana refers to the feeling tone of experience - whether it''s pleasant, unpleasant, or neutral. This is a foundational Vipassana practice.

Sit quietly and begin observing your experience. As sensations, thoughts, or sounds arise, notice: is this pleasant, unpleasant, or neutral?

The noting is quick and simple. An itch: unpleasant. A comfortable feeling in the belly: pleasant. The hum of traffic: neutral. Continue noting the feeling tone of whatever arises.

This practice reveals how much of our reactivity is based on vedana. We automatically grasp at pleasant, push away unpleasant, and ignore neutral. These reactions happen before conscious thought.

By bringing awareness to vedana, we create a gap between stimulus and response. We see the pleasant and can choose not to grasp. We see the unpleasant and can choose not to flee. This is freedom.

With practice, you''ll notice that vedana itself is not solid - pleasant can become unpleasant, neutral can become pleasant. Even our feeling tones are impermanent.',
  'Understanding reactivity',
  50,
  '{}',
  '{"racing-mind","clarity","body-awareness","self-compassion","emotions","beginners"}',
  4,
  2,
  11,
  7,
  8,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '141aad11-cdae-5a71-8150-ed6a9fddb7fe',
  NULL,
  'Open Awareness Vipassana',
  'Include everything, grasp nothing',
  'from-sky-400 to-blue-600',
  '25-30 mins',
  'Vipassana',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'In this practice, we don''t focus on any particular object. We rest in awareness itself, noticing whatever arises.

Begin with a few minutes of breath awareness to settle the mind. Then release the focus on breath and open to everything.

Whatever arises - thought, sensation, sound, emotion - let it come. Notice it. Let it go. Don''t follow it. Don''t push it away. Simply allow.

You are like the sky. Thoughts are clouds passing through. Sounds are birds flying past. Sensations are weather moving through. The sky doesn''t grab or reject. It simply contains.

This is choiceless awareness - what some call ''open awareness'' or ''rigpa.'' There''s no technique here, only allowing. The practice is to not do anything with what arises.

This may sound easy but it''s quite advanced. The mind wants to engage, to think about, to fix. Notice that impulse too. Let it pass.

Close by returning briefly to the breath, then opening your eyes with the same quality of open awareness.',
  'Spacious awareness',
  100,
  '{}',
  '{"grief","focus","racing-mind","sleep","body-awareness","self-compassion","emotions","letting-go","beginners"}',
  68,
  99,
  418,
  326,
  46,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '6e2bb4d0-31e8-5dd0-9b21-96042eeb5818',
  NULL,
  'Body Sensations Vipassana',
  'The body as a field of changing sensations',
  'from-emerald-400 to-teal-600',
  '30-40 mins',
  'Vipassana',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'This practice systematically observes body sensations with equanimity, seeing their impermanent nature.

Sit in a stable posture. Begin by scanning through the body from head to feet, noticing whatever sensations are present. Take your time.

Now choose an area to investigate. Perhaps the hands. Focus attention there and notice: what sensations are actually present? Tingling? Warmth? Pulsing? Pressure?

Watch these sensations with microscopic attention. Notice: they are not solid. They vibrate, fluctuate, change. Even what seems like a stable sensation is actually a flow of micro-sensations.

Move through different body areas: hands, arms, face, torso, legs, feet. In each area, observe the dance of sensation. Everything is vibrating. Nothing is static.

As you develop concentration, you may notice subtler and subtler sensations - a vibrating field throughout the body. This is direct experience of impermanence at the level of body.

Close by feeling the whole body as a unified field of sensation, then slowly return to ordinary awareness.',
  'Deep body insight',
  50,
  '{}',
  '{"stress","anger","focus","clarity","body-awareness","emotions","letting-go"}',
  14,
  15,
  40,
  231,
  36,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '7f56f0fc-e6b8-59b8-9aac-ab6acb08dde0',
  NULL,
  'Sky-Like Mind',
  'Thoughts are clouds, you are the sky',
  'from-sky-300 to-blue-500',
  '20-25 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'The sky metaphor is one of the most useful in meditation. The mind, like the sky, is vast and unchanging; thoughts, like clouds, pass through but don''t affect it.

Sit quietly and close your eyes. Imagine your mind as a vast blue sky - spacious, clear, and boundless.

Now, as thoughts arise, see them as clouds. Some are wispy, quick to pass. Some are heavy and dark. Some float by slowly. But all are just weather. The sky remains unchanged.

You are not your thoughts. You are the awareness in which thoughts appear. Just as the sky doesn''t become a cloud, you don''t become your thoughts.

When you find yourself caught in a thought-cloud, remember: step back. Be the sky. Watch the cloud pass.

This isn''t about suppressing thoughts. It''s about changing your relationship to them. Clouds are not a problem for the sky. Thoughts are not a problem for awareness.

Close by resting in the sky-like nature of your mind, spacious and clear, welcoming whatever weather arises.',
  'Spacious mind',
  10,
  '{}',
  '{"low-mood","racing-mind","clarity","sleep","self-compassion","letting-go"}',
  3,
  5,
  0,
  33,
  14,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'faa2a7dd-561e-57bb-9a79-8236d7d4d306',
  NULL,
  'Sound Bath Meditation',
  'Let sounds wash through you',
  'from-violet-400 to-purple-600',
  '15-20 mins',
  'Open Awareness',
  'Seated (chair)',
  'Anytime',
  'Any space with ambient sound',
  'We usually try to minimize sound for meditation. This practice reverses that: sound becomes the object of meditation.

Sit comfortably and close your eyes. Rather than treating sounds as distraction, welcome them. They are your teachers today.

Open your ears fully. What do you hear? Near sounds? Far sounds? Constant sounds? Occasional sounds? Let sound come to you rather than reaching for it.

Notice how the mind wants to label and judge: ''car,'' ''annoying,'' ''bird,'' ''nice.'' Can you hear sounds before the labeling? Just as vibration, just as experience?

Let sounds wash through you like water through a net. You don''t catch them, hold them, or push them away. They arise, pass through, and are gone.

This practice develops equanimity. You''re training the mind to not react automatically to sensory experience. Sound becomes neither pleasant nor unpleasant - just sound.

Close by sitting in silence (or as close to silence as is available), noticing the silence that contains all sound.',
  'Equanimity with sound',
  0,
  '{}',
  '{"anger","focus","pain","emotions"}',
  11,
  9,
  57,
  64,
  26,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '1d15cd97-771d-57c8-87e5-97bc96fb5437',
  NULL,
  'Midday Presence Reset',
  'Find stillness in the center of your day',
  'from-amber-400 to-yellow-600',
  '10-15 mins',
  'Open Awareness',
  'Seated (chair)',
  'Midday',
  'Office or any space',
  'Midday is when the momentum of doing can sweep us away. This practice pauses the momentum and returns us to being.

Wherever you are, take a seat. Close your eyes or soften your gaze. Let your hands rest. Let your shoulders drop.

Take three deep breaths, exhaling fully. With each exhale, release the morning. The tasks done and undone. The conversations had. Let it all go for now.

Sit in open awareness. You''re not meditating on anything in particular. Just being. Feeling the chair beneath you. Hearing the sounds around you. Noticing the breath happening by itself.

This is the center of your day. Like the eye of a storm. Around you, activity continues. But here, in this moment, there is stillness.

After 10 minutes, take a deep breath and consider: what''s most important for the afternoon? Not the most urgent - the most important. Set a simple intention.

Open your eyes and continue your day, carrying a thread of this stillness with you.',
  'Midday reset',
  0,
  '{}',
  '{"sleep","body-awareness","self-compassion","emotions","letting-go","morning","beginners"}',
  45,
  31,
  108,
  142,
  34,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'e03bec23-0228-531d-8d9f-b8ab19ba42fc',
  NULL,
  'Resting in Not Knowing',
  'Release the need to figure it all out',
  'from-slate-400 to-gray-600',
  '20-25 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Evening',
  'Quiet indoor space',
  'The mind wants to know. This practice cultivates comfort with not knowing - a spacious, humble unknowing.

Sit quietly and notice how the mind seeks answers. It wants to understand, explain, predict, control. This is its nature. But sometimes, not knowing is the wiser stance.

Let questions arise without answering them. What is the meaning of life? Let the question hang. What should I do about that problem? Let it hang. Who am I really? Let it hang.

Rest in the questions themselves rather than rushing to answers. Feel the spaciousness of not knowing. It''s uncomfortable at first. The mind protests. It wants closure.

But there''s a deeper peace in unknowing. When we admit we don''t know, we stop pretending. We open to what is, rather than what we think should be.

Mystics from all traditions speak of this ''cloud of unknowing'' - the humble admission that reality is too vast to fit into concepts. Rest there.

Close by acknowledging that not knowing is okay. Perhaps even liberating.',
  'Embracing mystery',
  50,
  '{}',
  '{"racing-mind","clarity","sleep","body-awareness","emotions","letting-go","beginners"}',
  6,
  0,
  10,
  73,
  20,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'b2c0a168-40dc-5e03-a3b2-5edff4e2f5f2',
  NULL,
  'Before Sleep Stillness',
  'Let the day dissolve into rest',
  'from-indigo-500 to-purple-700',
  '15-20 mins',
  'Open Awareness',
  'Lying down',
  'Before sleep',
  'Bed',
  'This practice bridges waking and sleeping, creating a conscious transition into rest.

Lie in your sleeping position. Take three deep breaths, each one releasing more of the day. The tasks, the interactions, the triumphs and frustrations - let them fall away.

Rest in open awareness. You''re not doing anything. You''re not going anywhere. You''re simply being - the same being-ness you''ve been all day, now at rest.

Notice: thoughts may still arise. Let them. They''re the mind''s way of processing the day. Don''t engage with them. Let them pass like distant traffic.

Feel your body heavy on the mattress. Feel the breath slow. Feel consciousness begin to soften at the edges.

You don''t have to meditate yourself to sleep. Just rest in this open awareness. Sleep will come when it comes. For now, there''s nothing to do but be.

If you''re still awake after 15 minutes, release the practice and simply allow sleep. Whatever happens, you''ve prepared the ground for rest.',
  'Sleep preparation',
  0,
  '{}',
  '{"low-mood","anger","racing-mind","sleep","body-awareness","self-compassion","emotions","letting-go","morning"}',
  220,
  307,
  1254,
  14,
  6,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'f8571e7a-99ed-5926-a4b3-ef187c98e579',
  NULL,
  'Equanimity Practice',
  'Meet everything with steady presence',
  'from-teal-400 to-cyan-600',
  '20-25 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'Equanimity is the balanced response to all experience - not suppression, not indulgence, but steady presence.

Sit quietly and establish open awareness. Whatever arises, meet it with the same quality of attention. Pleasant sensation? Same attention. Unpleasant thought? Same attention.

Notice the mind''s tendencies. It leans toward pleasant and away from unpleasant. Watch this leaning without acting on it. Just observe.

Now experiment. When something pleasant arises, don''t grasp. When something unpleasant arises, don''t push away. Can you meet both with equal presence?

This is not about being cold or detached. It''s about not being controlled by reactivity. You can feel fully while still maintaining balance.

Use the breath as your anchor. When you notice yourself caught in preference - wanting more of this, less of that - return to the neutral rhythm of breathing.

Close by setting an intention to carry this equanimity into your day. Not cold, not reactive, but steady. Present to everything.',
  'Balanced presence',
  50,
  '{}',
  '{"anger","focus","body-awareness","pain","self-compassion","emotions","letting-go"}',
  6,
  1,
  31,
  179,
  32,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '886a5ea1-9197-5b66-8dc6-b4aa391c3919',
  NULL,
  'Nature Immersion Sitting',
  'Let nature meditate you',
  'from-green-400 to-emerald-600',
  '20-30 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Anytime',
  'Outdoor natural setting',
  'Nature is perhaps the greatest meditation teacher. This practice is done outdoors, letting the natural world be your guide.

Find a comfortable seat in nature - a park, a forest, a garden, a beach. Settle in and close your eyes briefly, establishing inner stillness.

Now open your eyes and simply receive. Don''t look for anything. Let your senses open like a flower. What does nature offer right now?

Perhaps the wind in leaves. Perhaps birdsong. Perhaps the play of light and shadow. Perhaps scent. Perhaps the feel of air on skin. Receive it all.

You are not separate from this. You are nature too - a part of the same system, breathing the same air, warmed by the same sun. Let the boundaries soften.

Nature doesn''t try to be nature. It simply is. Can you be like that? Not trying to meditate, just being? Let nature meditate you.

When it''s time to close, thank this place. Rise slowly. Carry the spaciousness of the natural world with you as you return to human spaces.',
  'Nature connection',
  0,
  '{}',
  '{"sleep","pain","emotions"}',
  28,
  20,
  97,
  26,
  11,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '795aac6f-1917-557b-9469-ef2ef6f67ddd',
  NULL,
  'Twilight Transition',
  'Observe the dying of the light',
  'from-orange-400 to-purple-600',
  '20-25 mins',
  'Open Awareness',
  'Seated (chair)',
  'Evening',
  'Window facing west or outdoors',
  'Twilight is a liminal time - between day and night, between doing and resting. This practice honors that transition.

Sit facing the evening sky, either outside or at a window. Time this practice for sunset or shortly after.

Watch the light change. Notice how colors shift from gold to pink to purple to deep blue. Notice how shadows lengthen and merge. This is impermanence made visible.

As the light fades, let your thoughts about the day fade too. The day is ending. Whatever happened, happened. Whatever didn''t, didn''t. Let it go with the light.

Feel the world settling. Birds quiet. Activity slows. Something in the collective consciousness relaxes. Tune into that relaxation.

As darkness arrives, close your eyes and sit in the dark. You''ve witnessed the great transition. Day becoming night. Like birth becoming death. Like waking becoming sleeping. All endings are natural.

When you open your eyes to the night, carry this acceptance of endings with you.',
  'Transition wisdom',
  10,
  '{}',
  '{"low-mood","grief","racing-mind","sleep","body-awareness","self-compassion","emotions","letting-go","morning","evening"}',
  131,
  255,
  844,
  453,
  55,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'c4543e53-0af4-576b-9614-e491100066ff',
  NULL,
  'Witnessing Thoughts',
  'Step back and watch the show',
  'from-slate-400 to-zinc-600',
  '15-20 mins',
  'Open Awareness',
  'Seated (chair)',
  'Anytime',
  'Any quiet space',
  'We are usually so caught up in thoughts that we don''t notice we''re thinking. This practice develops the capacity to step back and observe.

Sit comfortably and close your eyes. Let thoughts come. For the first few minutes, just notice that you''re thinking. This itself is a big step.

Now imagine you''re sitting in a movie theater. The screen is in front of you, and your thoughts are the movie. You''re watching the movie, not in it.

Thoughts will try to pull you in. That''s their nature. When you find yourself in the movie, just remember: you''re the audience. Step back. Watch.

Notice: thoughts have no power unless you engage with them. They arise, they pass. Only when you grab onto them do they seem to become real and important.

Practice this stepping-back. Movie... audience. Thought... witness. Reaction... awareness. With practice, this becomes a skill you can use anytime - in arguments, in anxiety, in confusion.

Close by taking a breath and acknowledging: you are not your thoughts. You are that which witnesses them.',
  'Thought awareness',
  0,
  '{}',
  '{"anxiety","racing-mind","clarity","self-compassion","emotions","beginners"}',
  22,
  31,
  245,
  85,
  22,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'd4f468b2-fd1b-5d73-880f-ee39670999c9',
  NULL,
  'Integration Practice',
  'Bring all parts of yourself together',
  'from-rose-400 to-violet-600',
  '25-30 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Evening',
  'Quiet, private space',
  'We often feel fragmented - pulled in different directions, holding conflicting parts. This practice invites integration.

Sit quietly and scan your inner landscape. What parts of you are present today? Perhaps there''s a part that''s tired. A part that''s ambitious. A part that''s sad. A part that''s restless.

Rather than favoring one part over another, make space for all of them. Imagine your awareness as a big room. Every part of you has a seat at this table.

Address each part with kindness: ''I see you, tired part. You''re welcome here.'' ''I see you, ambitious part. You''re welcome here.'' No part is wrong. All are valid expressions of your humanity.

Now imagine these parts beginning to communicate with each other. What does the tired part want the ambitious part to know? What does the sad part need from the others?

As you sit in open awareness, feel how all these parts exist within one larger you. You are the whole that contains the parts. Nothing needs to be rejected.

Close with a sense of wholeness - not perfect, but complete.',
  'Inner wholeness',
  50,
  '{}',
  '{"low-mood","anger","clarity","sleep","body-awareness","self-compassion","emotions","beginners"}',
  4,
  0,
  15,
  69,
  24,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '5e3c3206-7bbc-5fc0-87a2-f709a2a4968c',
  NULL,
  'Anchor Breath Basics',
  'The breath is always here',
  'from-blue-400 to-cyan-600',
  '10-15 mins',
  'Breath Awareness',
  'Seated (chair)',
  'Morning',
  'Any quiet space',
  'The breath is the most reliable anchor in meditation. It''s always happening, always available, always now.

Sit comfortably and close your eyes. Notice that you''re breathing. You don''t have to change anything - just notice.

Choose where to feel the breath. It could be the nostrils, the chest, or the belly. Pick one area and rest your attention there.

Now simply follow the breath. Inhale... exhale... inhale... exhale... The rhythm is natural. You''re not controlling it, just witnessing.

When the mind wanders - and it will - gently return to the breath. No judgment. The wandering is part of the practice. The returning is the practice.

Think of the breath as a home base. You can explore, but you can always return. Thought... breath. Distraction... breath. Worry... breath.

After 10 minutes, take a slightly deeper breath and open your eyes. The anchor is always available, all day long.',
  'Foundation practice',
  0,
  '{}',
  '{"anxiety","focus","sleep","emotions","letting-go","beginners"}',
  72,
  127,
  300,
  308,
  42,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '8baf23ad-5394-5de5-a455-30d1e35e4f36',
  NULL,
  'Anxiety Antidote',
  'When worry strikes, come back to now',
  'from-teal-400 to-blue-600',
  '15-20 mins',
  'Breath Awareness',
  'Seated (chair)',
  'Anytime',
  'Any space',
  'Anxiety lives in the future. This practice brings you firmly into the present, where anxiety cannot exist.

Sit down wherever you are. Place your feet flat on the floor. Feel the contact. Press down slightly. Feel the solidity of the ground.

Place your hands on your thighs. Feel the pressure. Feel the texture of fabric. You are here. Not in the future. Here.

Now slow your breathing deliberately. Inhale for 4 counts. Exhale for 6 counts. The extended exhale activates your calm-down system.

With each exhale, silently say: ''Right now, I am safe.'' It doesn''t matter what might happen tomorrow. Right now, in this moment, you are okay.

Continue the slow breathing. Feel the ground. Feel your hands. You are not in the nightmare your mind creates. You are here, in this room, in this chair, breathing.

When the anxiety fades to manageable levels, take three normal breaths and return to your day. Remember: you can always come back to now.',
  'Anxiety relief',
  0,
  '{}',
  '{"anxiety","stress","low-mood","anger","sleep","emotions","evening"}',
  0,
  3,
  20,
  25,
  15,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '6cb9a97f-404c-5712-ac48-1325c0ab9557',
  NULL,
  'Midday Mantra Pause',
  'Sacred sound in the middle of chaos',
  'from-orange-400 to-amber-600',
  '5-10 mins',
  'Mantra',
  'Seated (chair)',
  'Midday',
  'Office or any space',
  'This ultra-brief mantra practice can reset your entire afternoon. It''s designed for busy days.

Sit where you are. Close your eyes. Take one deep breath.

Begin silently repeating your chosen mantra. Om. So Hum. Peace. Love. Whatever word creates calm.

Repeat it with each breath. On the inhale, the first syllable. On the exhale, the second. If it''s one syllable, repeat on the exhale only.

Let the mantra become rhythmic, automatic. Let it quiet the mental chatter. For these few minutes, there are no emails, no deadlines, no problems. Just the mantra.

After 5 minutes - or as long as you have - let the mantra fade. Sit in the quiet for a moment. Notice: you feel different. The nervous system has reset.

Open your eyes. Return to your day with the echo of the mantra still humming beneath your thoughts.',
  'Quick reset',
  0,
  '{}',
  '{"anxiety","stress","racing-mind","emotions","beginners"}',
  85,
  79,
  335,
  498,
  51,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'a0398cc1-4e38-5b26-9e1a-78cf0b4454a4',
  NULL,
  'Night Wisdom Reflection',
  'What did today teach you?',
  'from-purple-500 to-indigo-700',
  '15-20 mins',
  'Open Awareness',
  'Seated (chair)',
  'Before sleep',
  'Quiet room with low light',
  'This reflective practice closes the day with awareness and gratitude, preparing the ground for sleep.

Sit in dim light as the day ends. Take several deep breaths. Let the activity of the day settle.

Now review your day like watching a movie. Not judging, just observing. See yourself waking, moving through the morning, the afternoon, the evening. What happened?

Ask yourself: What did today teach me? Perhaps you learned patience through frustration. Compassion through another''s pain. Strength through challenge. Every day is a teacher if we''re willing to learn.

What are you grateful for from today? Even difficult days have gifts - perhaps just the gift of another day of life. Name three things, however small.

Is there anything you need to release? Any resentment, any guilt, any worry? Imagine placing it in a box and setting it aside. You can pick it up tomorrow if you want. For now, let it go.

Close by taking three breaths and acknowledging: the day is complete. Sleep well.',
  'Daily completion',
  0,
  '{}',
  '{"anxiety","anger","sleep","body-awareness","pain","self-compassion","letting-go","morning","evening"}',
  170,
  193,
  382,
  105,
  25,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'bce0d58f-cabe-50d8-9406-e6bfda4eac74',
  NULL,
  'First Breath',
  'Where every journey begins',
  'from-emerald-400 to-teal-600',
  '10-15 mins',
  'Breath Awareness',
  'Seated (chair)',
  'Morning',
  'Quiet indoor space',
  'Find a place to sit. It doesn''t need to be special—a chair, a cushion, the edge of your bed. What matters is that you''re here, choosing to begin.

Sit in a way that feels both stable and relaxed. Your back is naturally upright, not rigid. Your shoulders settle away from your ears. Your hands rest wherever they''re comfortable. There''s no perfect posture—only the posture that allows you to be present.

Now, simply notice that you''re breathing. Don''t try to breathe in any particular way. The breath has been happening your entire life without your direction. Let it continue. Your only job is to notice.

Where do you feel the breath most clearly? Perhaps at the nostrils, where air enters cool and leaves warm. Perhaps in the chest, rising and falling. Perhaps in the belly, expanding and contracting. Find the place where the breath is most vivid for you, and rest your attention there.

The mind will wander. This is not a problem—it''s the nature of minds. When you notice you''ve drifted into thought, simply return to the breath. No judgment, no frustration. Each return is the practice. Each return strengthens your capacity for presence.

You might return a hundred times in ten minutes. Each return is a small awakening, a moment of recognizing where you actually are. This is the entire practice: noticing when you''ve left, and coming back.

When you''re ready to end, take three slightly deeper breaths. Feel your body sitting here. Hear the sounds around you. Open your eyes slowly. You''ve just meditated. The journey has begun.',
  'Establishing presence',
  0,
  '{}',
  '{"beginners","focus","morning"}',
  39,
  21,
  227,
  28,
  7,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '3d7b69cb-b1d1-54b6-9b48-3dac1ea36662',
  NULL,
  'Finding Your Seat',
  'The body as foundation',
  'from-stone-400 to-slate-600',
  '10-15 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'Before we attend to the breath, we attend to the body that breathes. Take a moment to consciously arrange yourself for sitting.

If you''re on a cushion, let your hips be slightly higher than your knees—this allows the spine to rise naturally. If you''re in a chair, feel your feet flat on the floor, your sitting bones pressing into the seat. Either way, imagine a thread at the crown of your head, gently drawing you upward. The spine lengthens, but doesn''t strain.

The Buddha described four postures for meditation: sitting, standing, walking, and lying down. Each has its place. But sitting carries a particular dignity—we are neither collapsed nor rigid, neither passive nor effortful. We are simply present, in the posture of one who is awake.

Now scan through your body briefly. Soften the muscles of the face. Unclench the jaw. Let the shoulders drop. Release any gripping in the hands, the belly, the thighs. You don''t need to hold anything up right now. The structure of your body supports you; let it.

With the body settled, turn your attention to the breath. Let the breath breathe itself while you observe. Notice how different this sitting feels when the body is consciously arranged, when you''ve chosen this posture rather than collapsed into it.

The body is not an obstacle to meditation—it is the ground of meditation. We don''t transcend the body; we inhabit it fully. Feel yourself here, in this body, in this moment, breathing.

As you continue, maintain a light awareness of your posture. When you notice you''ve slumped, gently realign. When you notice tension creeping in, soften. The posture is alive—it requires gentle, ongoing attention.

Close by taking three conscious breaths, feeling the stability of your seat, and slowly opening your eyes.',
  'Grounding and stability',
  0,
  '{}',
  '{"beginners","body-awareness","morning"}',
  46,
  23,
  229,
  96,
  24,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'a750ca4b-d631-5684-84a8-1839cf86c004',
  NULL,
  'The Wandering Mind',
  'Returning is the practice',
  'from-violet-400 to-purple-600',
  '15-20 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'Settle into your posture and begin with the breath. Today we explore what happens when the mind wanders—which it will, many times.

Think of attention like a puppy on a leash. The puppy runs after every squirrel, every interesting smell. It forgets entirely that you exist. And then, at some point, it remembers and comes bounding back. Your job is not to punish the puppy for running. Your job is to welcome it when it returns.

So begin with the breath. Feel its rhythm. And wait. Before long, you''ll find yourself somewhere else—planning tomorrow, replaying yesterday, composing emails, having arguments. This is not failure. This is the mind doing what minds do.

The moment of noticing that you''ve wandered is precious. It''s a moment of waking up. You were lost in thought, and now you''re aware that you were lost. This is consciousness recognizing itself. Celebrate this moment—then gently return to the breath.

Don''t investigate where you went or why. Don''t build a story about your inability to concentrate. Simply notice: ''Not here. Coming back.'' And return.

The muscles of attention strengthen through returning, not through never leaving. Each time you come back, you''re doing a mental bicep curl. A session with fifty returns is not a failure—it''s fifty repetitions of the most important exercise there is.

Notice what happens in the body when you realize you''ve wandered. Perhaps a slight startle, a tension. Can you make the return soft? Can you come back to the breath like coming home—not with frustration, but with the simple relief of being here again?

This is the practice. Not perfect concentration—that comes later, if it comes at all. But patient returning, again and again, building the capacity to recognize when you''re not present and choose presence instead.',
  'Working with distraction',
  0,
  '{}',
  '{"beginners","focus","racing-mind"}',
  8,
  15,
  35,
  117,
  31,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'cbb01dda-8aec-5343-b0d4-2001d0c53c21',
  NULL,
  'Resting Here',
  'Letting presence deepen',
  'from-sky-400 to-cyan-600',
  '15-20 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'In the previous sessions, we established the basics: posture, breath, returning. Now we let presence deepen—not through effort, but through allowing.

Settle into your seat and find the breath. Let the first few minutes be about arriving—letting the busyness of the day settle like sediment in a jar of water. You don''t need to force the water to clear; you simply stop stirring.

As the breath continues, see if you can let go of any remaining sense of trying. You''re not trying to concentrate. You''re not trying to be calm. You''re not trying to have a ''good'' meditation. You''re simply here, aware of breathing.

The Buddha described this as calming the bodily formations—the breathing becomes smoother, gentler, as the body releases its holding. You don''t make this happen; you allow it. As you stop interfering with the breath, it naturally settles.

Notice if there''s any subtle tension in maintaining attention. Can you be with the breath without gripping? Imagine watching clouds drift across the sky—interested, present, but not grasping at them. Let attention be like that: soft, open, receiving.

There may come moments when the sense of ''you'' watching the breath softens, when there''s just breathing happening and awareness present. Don''t reach for these moments or try to hold them. Let them come and go like everything else.

In traditional language, this is ''tranquility'' or ''calm abiding.'' It''s not a doing—it''s what remains when the doing stops. The nervous system remembers its natural state of ease. The mind, no longer churning, discovers it was always still beneath the waves.

Rest here. There''s nowhere else to be. Nothing else to do. Just this breath. Just this moment. Just this mysterious fact of being aware.

When you''re ready to close, do so slowly. Let the eyes open without rushing back into the day. Carry this quality of restful presence with you.',
  'Calming and settling',
  0,
  '{}',
  '{"beginners","stress","focus","letting-go"}',
  104,
  141,
  450,
  635,
  59,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'e293572a-1db8-5e14-ad77-0f8fc1e69a36',
  NULL,
  'The Path Opens',
  'Committing to the journey',
  'from-amber-400 to-orange-500',
  '15-20 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'You''ve completed the foundations. You know how to sit, how to attend to the breath, how to work with the wandering mind, how to let presence deepen. Now we plant the seeds of ongoing practice.

Settle into your seat with the care of someone who has sat many times before. Find the breath with the familiarity of greeting an old friend. Let the first minutes be about simply being here, practicing what you''ve learned.

As you sit, consider: what brought you to meditation? Perhaps you wanted less stress, better focus, more peace. Perhaps you were curious about your own mind. Perhaps something deeper drew you—a sense that there''s more to discover about the nature of awareness itself.

Whatever your reasons, honor them. They were enough to bring you here, to complete these first sessions. But notice, too, if something has shifted. Perhaps you''ve glimpsed something in the stillness that goes beyond your original goals. Perhaps you''ve tasted, however briefly, a quality of presence that feels like coming home.

The Buddha called this path ''the one way''—not because there are no other valid paths, but because this particular practice of establishing mindfulness leads reliably toward freedom. You''ve taken the first steps. The path stretches ahead, through territory both familiar and unknown.

As you breathe, make a simple commitment: to continue. Not perfectly—there''s no such thing. Not without interruption—life happens. But to return, again and again, to this practice of presence. To keep showing up for this encounter with your own mind.

The benefits of meditation are real, but they emerge over time, like a photograph slowly developing. Trust the process. What you''re building—the capacity for sustained awareness—will serve you in ways you can''t yet imagine.

Close this session by taking three breaths with full attention. Feel the weight of your body. Hear the sounds around you. Open your eyes and see, as if for the first time, the world that was waiting for you to return.

The path is open. Walk it well.',
  'Dedication and commitment',
  0,
  '{}',
  '{"beginners","morning","self-compassion"}',
  4,
  2,
  55,
  21,
  12,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'fa2e4b16-735a-5c15-83e4-58f93533c188',
  NULL,
  'Breathing Long and Short',
  'Knowing the breath as it is',
  'from-teal-400 to-emerald-600',
  '15-20 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'We begin the Ānāpānasati path—the Buddha''s complete system of breath meditation. These sixteen stages span from the simplest awareness to the highest liberation. We start where we must: with knowing the breath as it actually is.

''Breathing in long, one knows: I breathe in long. Breathing out long, one knows: I breathe out long. Breathing in short, one knows: I breathe in short. Breathing out short, one knows: I breathe out short.''

This is not about making the breath long or short. It''s about knowing what''s actually happening. Sometimes the breath is long, slow, deep. Sometimes it''s short, quick, shallow. Your only job is to know which.

Settle into your posture and find the breath. For the first few minutes, simply observe without analysis. Let the breath be whatever it is.

Now, with each inhale, note silently: is this breath long or short? Don''t judge—there''s no correct answer. Just know. With each exhale: long or short? You''re developing a quality of attention that knows what''s happening as it happens.

This simple knowing is more profound than it appears. We spend most of our lives not knowing our experience as it occurs. We''re lost in thought about the past or future while the present slips by unnoticed. This practice reverses that tendency. It trains the mind to be where the body is.

As you continue, you might notice the breath naturally lengthening. When we pay attention, the body relaxes; when the body relaxes, the breath deepens. Don''t chase this—just notice if it happens.

You might also notice that ''long'' and ''short'' are relative. Compared to your first breath, this one might be long. Compared to tomorrow''s settled practice, it might be short. There''s no absolute measure. There''s just knowing, moment by moment, what''s actually occurring.

This is the foundation of all insight: knowing what is. Before we can understand impermanence or non-self or suffering, we must first learn to know our experience as it happens. The breath is our teacher.

Close by taking three breaths with full awareness of their length. You''ve begun the path of sixteen stages. Trust the unfolding.',
  'Direct knowing',
  5,
  '{}',
  '{"focus","body-awareness","beginners"}',
  5,
  11,
  62,
  96,
  25,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '7bc4716d-3302-520f-9d0f-d45442d0b480',
  NULL,
  'The Whole Body Breathing',
  'Experiencing the breath fully',
  'from-emerald-400 to-green-600',
  '20-25 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  '''One trains thus: Experiencing the whole body, I shall breathe in. Experiencing the whole body, I shall breathe out. One trains thus: Calming the bodily formation, I shall breathe in. Calming the bodily formation, I shall breathe out.''

We move from knowing long and short to experiencing the breath with the whole body, then calming the body through the breath.

Begin with your familiar practice—settling, finding the breath, knowing its qualities. Spend several minutes here, establishing presence.

Now expand your awareness. Instead of attending only to the nostrils or belly, let yourself feel the breath in the whole body. With each inhale, the entire body responds—the chest expands, the belly moves, even the back subtly widens. With each exhale, the whole body releases. Feel this.

You''re not imagining breath flowing everywhere—you''re noticing how the act of breathing involves the whole body. Even your sitting bones might press slightly more into the cushion as the breath settles. Even your hands might release a fraction more on the exhale.

Experience this for some time: the whole body involved in breathing, breathing infusing the whole body.

Now, we calm the bodily formation. The ''bodily formation'' (kāya-sankhāra) is the breath itself and the activity that surrounds it. As attention deepens, this activity naturally calms. The breath becomes smoother, gentler. The body releases its background tension.

You don''t force this calming—you allow it. Intend ease with each exhale. Let the outbreath carry away any holding. The inhale will naturally become gentler, the exhale longer, the spaces between breaths more spacious.

This is where meditation begins to feel different from ordinary life. The nervous system shifts. The usual vigilance relaxes. The body, feeling truly attended to, can finally let go.

Spend the remaining time in this calmed state. Whole-body awareness, breath gently moving, the body at ease. Don''t reach for anything special—just rest in this simplicity.

Close by noticing how the body feels now compared to when you began. This calming is not an achievement but a returning—the body remembering its natural state of peace.',
  'Whole-body awareness',
  5,
  '{}',
  '{"body-awareness","stress","focus"}',
  199,
  155,
  587,
  654,
  59,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '208b6273-996d-5388-b0f2-8b893a8149d2',
  NULL,
  'Rapture Arises',
  'Joy in presence',
  'from-yellow-400 to-amber-500',
  '20-25 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  '''One trains thus: Experiencing rapture, I shall breathe in. Experiencing rapture, I shall breathe out. One trains thus: Experiencing pleasure, I shall breathe in. Experiencing pleasure, I shall breathe out.''

We enter the second tetrad. Having calmed the body, we now turn to feeling—specifically, to the joy and pleasure that arise naturally from settled practice.

Begin with the body. Find the breath, establish whole-body awareness, allow calming to occur. Don''t rush this. The stages build on each other.

As the body settles, something shifts. There''s a quality of ease, of rightness, of simply being here. This isn''t happiness about something—it''s the intrinsic pleasantness of awareness at rest. The Buddha called this ''pīti'' (rapture) and ''sukha'' (pleasure).

Rapture tends to be more energetic—a tingling, a buoyancy, sometimes waves of gentle bliss. Pleasure is quieter—a deep sense of well-being, contentment, the body at peace. Both arise when we stop fighting experience and simply rest in awareness.

Don''t grasp for these states. That grasping is precisely what prevents them. Instead, simply notice if they''re present. Is there any pleasantness in this moment? Any sense of gladness? Any ease?

If you notice rapture or pleasure, breathe with it. Let each inhale be infused with this quality, each exhale release further into it. You''re not creating the experience—you''re allowing yourself to notice what''s already emerging.

If these states aren''t present, don''t worry. Just keep sitting. The body might not be calm enough yet. The mind might still be restless. Return to the earlier stages: knowing the breath, experiencing the whole body, calming. Trust the progression.

With time, as practice matures, these states become more accessible. They''re not the goal—they''re sign posts on the path. But they do make the journey pleasant. The Buddha was practical: he knew we''re more likely to continue what brings us joy.

Close by appreciating whatever quality of experience is present. Even the subtlest ease counts. Even neutral stillness is precious. You''re walking a path that countless others have walked, and its fruits are becoming available to you.',
  'Accessing joy',
  10,
  '{}',
  '{"focus","low-mood","morning"}',
  0,
  2,
  28,
  4109,
  79,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'a4535ac0-b008-5c6f-a27e-b7b7d6c151fe',
  NULL,
  'Calming Mental Formations',
  'Settling the mind''s activity',
  'from-indigo-400 to-violet-600',
  '20-25 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  '''One trains thus: Experiencing mental formations, I shall breathe in. Experiencing mental formations, I shall breathe out. One trains thus: Calming mental formations, I shall breathe in. Calming mental formations, I shall breathe out.''

We come to stages seven and eight. Having worked with body and feeling, we now address the mind''s activity directly.

''Mental formations'' (citta-sankhāra) are the movements of mind—thoughts, emotions, intentions, reactions. Even in meditation, the mind is active. We''re not trying to stop this activity but to know it and allow it to calm.

Begin with the body and breath. Establish the earlier stages: knowing, whole-body awareness, calming, perhaps touching rapture or pleasure. Take your time.

Now, expand your attention to include the mind''s activity. What''s happening in there? Thoughts drifting through. Perhaps commentary on the meditation. Perhaps planning, remembering, imagining. Perhaps emotional currents—anxiety, peace, boredom, anticipation.

Don''t try to stop any of this. Just know it''s happening. You''re experiencing mental formations.

This knowing itself has a calming effect. When we bring awareness to mental activity without judgment, it settles. Like a child who stops acting out once they feel seen, the mind calms when it''s truly witnessed.

Now, intentionally calm these formations. With each exhale, let mental activity settle. Don''t suppress—release. Imagine thoughts as ripples on a pond, gradually stilling. The mind becomes clearer, quieter, more unified.

This is subtle work. You might find that trying to calm creates more activity. If so, just return to experiencing—knowing what''s happening. The calming will occur in its own time.

As mental formations settle, something interesting happens: you become aware of the awareness itself. Behind all the activity, there''s a quality of knowing that remains constant. We''ll explore this further in the next stages.

For now, rest in this calmer mind. The body is settled, feelings are pleasant or at least neutral, and the mind''s usual churning has quieted. This is a profound shift from ordinary consciousness. Honor it.

Close by noticing the quality of your mind right now. Whatever that quality is, you''ve brought awareness to it. That''s the practice.',
  'Mental calming',
  10,
  '{}',
  '{"racing-mind","stress","focus"}',
  113,
  310,
  581,
  15,
  14,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '71c4017d-b700-5c76-9362-0c531086213d',
  NULL,
  'Knowing the Mind',
  'Awareness aware of itself',
  'from-sky-400 to-blue-600',
  '25-30 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  '''One trains thus: Experiencing the mind, I shall breathe in. Experiencing the mind, I shall breathe out.''

We enter the third tetrad—the contemplation of mind itself. Having calmed the body, accessed pleasant feeling, and settled mental activity, we now turn attention to the consciousness in which all this occurs.

Begin by establishing the earlier stages. Let the body calm. Let whatever pleasantness is available arise. Let mental formations settle. This might take ten minutes or more. Don''t rush.

Now, consider: what is it that''s been aware of all these experiences? The breath was known—but by what? Feelings arose—but in what? Mental formations played out—but where?

Shift attention from the contents of experience to the awareness that knows the contents. This is subtle. You can''t see consciousness the way you see a breath. But you can recognize it, the way you recognize the space in which objects appear.

One approach: notice that you''re aware. Whatever is happening, awareness is present to know it. Rest in that recognition. Let the breath continue. Let feelings be whatever they are. Let thoughts drift. But keep returning to the fact of awareness itself.

Another approach: ask ''What is the quality of the mind right now?'' Is it scattered or collected? Dull or bright? Contracted or expansive? You''re not changing anything—just knowing the state of consciousness in this moment.

In the Satipaṭṭhāna Sutta, the Buddha lists mental states to recognize: ''One knows a mind with lust as with lust, a mind without lust as without lust...'' This is not about achieving particular states but about knowing what''s present.

As you breathe, continually know the mind. Inhale: what is the quality of awareness? Exhale: what is the quality of awareness? The content changes; the knowing remains.

This practice can reveal something remarkable: consciousness itself is already peaceful. It''s not disturbed by what appears in it, the way a mirror is not disturbed by its reflections. Touch this peace.

Close by resting in awareness of awareness. The mind knowing itself. The subject that usually hides behind every experience, here recognized directly.',
  'Direct awareness',
  20,
  '{}',
  '{"clarity","focus","emotions"}',
  30,
  45,
  121,
  291,
  42,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'accd95c7-a4ff-536e-b43f-8865cf998d2c',
  NULL,
  'Gladdening and Concentrating',
  'Unifying consciousness',
  'from-amber-400 to-yellow-500',
  '25-30 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  '''One trains thus: Gladdening the mind, I shall breathe in. Gladdening the mind, I shall breathe out. One trains thus: Concentrating the mind, I shall breathe in. Concentrating the mind, I shall breathe out.''

Stages eleven and twelve mark the culmination of the third tetrad. We gladden the mind—not with external stimuli but through the practice itself. We concentrate the mind—bringing it to unified, stable presence.

Establish the earlier stages. Take whatever time is needed. The depth of these later practices depends on the foundation you build.

Gladdening the mind: This is not about forcing happiness. It''s about reconnecting with the natural gladness of presence. Consider what a gift it is to have this time for practice. Consider the countless beings who''ve walked this path before you. Consider the simple miracle of consciousness—that there''s something it''s like to be you, right now, aware.

Let a subtle gladness arise from these reflections, or from the practice itself. When concentration is stable and the body at ease, a quality of satisfaction naturally emerges. The mind, no longer scattered, rests in itself. That resting is inherently pleasing.

Now, concentrating the mind: Draw attention into a more unified focus. The breath becomes not just an object of attention but the center around which the mind collects. Other experiences continue at the periphery, but the breath holds the center.

Concentration is not strain. Think of gathering rather than forcing—like collecting scattered papers into a neat stack. The mind that was spread across many objects gathers onto one. The breath is here. Awareness is here. There''s no elsewhere.

In this state, the mind becomes quite still. Thoughts may arise at the edges but don''t pull you away. There''s a sense of depth, of presence, of being fully here in a way that''s rarely achieved in ordinary life.

This concentrated state is valuable in itself—research shows it calms the nervous system profoundly. But it''s also preparation. From this stable base, insight can arise. The seeing that liberates requires a mind that can hold steady on what it sees.

Rest in concentration for as long as it remains natural. When it starts to fade, don''t grasp. Simply note its passing and continue with simple breath awareness until you''re ready to close.',
  'Unified presence',
  20,
  '{}',
  '{"focus","clarity","morning"}',
  104,
  115,
  777,
  39,
  11,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '50e22647-5f78-5a13-aaed-7408cb4d4f30',
  NULL,
  'Contemplating Impermanence',
  'Seeing change, releasing',
  'from-slate-400 to-gray-600',
  '25-30 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  '''One trains thus: Contemplating impermanence, I shall breathe in. Contemplating impermanence, I shall breathe out. One trains thus: Contemplating fading away, I shall breathe in. Contemplating fading away, I shall breathe out.''

We enter the fourth tetrad—the path of insight. Having developed calm, we now turn to wisdom. And wisdom begins with seeing clearly the nature of experience: that everything passes.

Establish concentration with the earlier stages. Let the body calm, the feelings settle, the mind unify. From this stable base, insight becomes possible.

Now, contemplate impermanence. Watch the breath—it arises, it passes. Every inhale is born, exists briefly, and dies into exhale. Every exhale vanishes into the next inhale. Nothing remains. The breath you''re taking now will never come again.

Expand this seeing. Notice sensations in the body—tingling, pulsing, pressure. None of them are static. They arise, change, fade. The body is not a thing but a process, a flow of constantly changing experience.

Notice feelings. Even the pleasant feelings that arose from calm don''t last. They peak and decline. Even stillness is not a stable state—it''s a series of moments, each fresh, each passing.

Notice thoughts. They appear, linger for their moment, and dissolve back into silence. No thought persists. The thought you had a moment ago is gone forever, replaced by this one, which is already fading.

This isn''t depressing—it''s liberating. Impermanence means nothing we dislike lasts. It means nothing we like can become a prison. It means every moment is fresh, unprecedented, free.

''Fading away'' (virāga) is this seeing applied to attachment. Watch how the mind reaches for experience, tries to hold what passes. See how that grasping creates tension. And see how the fading of phenomena is already freeing you, whether you consent or not.

Breathe with impermanence. Each breath confirms it. Each moment demonstrates it. This is not belief but direct observation. The Buddha didn''t ask us to believe—he asked us to look.

Close by sitting in the space that this contemplation opens. Everything passes—but what is it that knows the passing? Is there something here that doesn''t come and go? Leave this question open.',
  'Wisdom arising',
  50,
  '{}',
  '{"letting-go","clarity","emotions"}',
  9,
  28,
  63,
  137,
  35,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '6d9aee47-1bdd-5f23-ad4a-517b8c7698ab',
  NULL,
  'Relinquishment',
  'Letting go completely',
  'from-purple-400 to-indigo-600',
  '30-40 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  '''One trains thus: Contemplating cessation, I shall breathe in. Contemplating cessation, I shall breathe out. One trains thus: Contemplating relinquishment, I shall breathe in. Contemplating relinquishment, I shall breathe out.''

We come to the culmination of the Ānāpānasati path. Having seen impermanence and fading, we now contemplate cessation itself—and the complete letting go that makes liberation possible.

This is advanced territory. Don''t expect fireworks. The profundity here is subtle—a gradual releasing that may not announce itself but changes everything.

Establish the earlier stages thoroughly. Today, don''t rush. Let the body calm deeply. Let concentration develop fully. You need a stable base for what comes next.

Cessation (nirodha): Every moment of experience has a birth and a death. Usually, we attend to the birth—the arising of sensation, thought, feeling. Now, attend to the death. Where do experiences go when they end? Each sound arises and... dissolves where? Each breath comes and then... where does it go?

You''re pointing attention toward the vanishing point of phenomena. This is not nihilism—you''re not denying that experiences occur. But you''re noticing that their ending is just as real as their beginning. And in that ending, there''s a gap, a space, a stillness.

Relinquishment (paṭinissagga): This is the active release that mirrors the natural cessation. You''ve been holding so much—holding to self, to preferences, to ideas about how things should be. Now, practice letting go.

With each exhale, relinquish. Let go of effort. Let go of trying to meditate well. Let go of expectations about what should happen. Let go of your position, your opinions, your identity. You don''t need them right now.

This is not loss but liberation. What are you without all that baggage? What remains when you stop holding? Find out.

There may come moments where the sense of self becomes very light, very transparent. Where awareness remains but ''you'' are not running the show. Don''t grasp at these moments—that grasping brings back the very self you''re releasing.

The Buddha said this practice leads to nibbāna—the unconditioned, the unborn, the deathless. These are not poetic exaggerations. They point to what remains when all grasping ceases. You may touch this today, or it may take years. Either way, you''re walking the path.

Close by sitting in whatever remains when you stop holding. If that''s just ordinary sitting, that''s fine. The sixteen stages are complete. Let them work in you over time.',
  'Complete release',
  50,
  '{}',
  '{"letting-go","clarity","emotions"}',
  96,
  58,
  389,
  29,
  14,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'cf8f100f-c4fb-5037-9f7a-bac084809b71',
  NULL,
  'The Four Postures',
  'Awareness in every position',
  'from-stone-400 to-slate-600',
  '20-25 mins',
  'Body Scan',
  'Seated (cushion)',
  'Anytime',
  'Space to sit, stand, walk, and lie down',
  '''When walking, a practitioner knows: I am walking. When standing, one knows: I am standing. When sitting, one knows: I am sitting. When lying down, one knows: I am lying down. In whatever way the body is disposed, one knows it accordingly.''

We begin the body contemplations. The Buddha taught that mindfulness of the body is the foundation of all practice. We start with the simplest fact: knowing the posture you''re in.

Begin seated. Feel the particularity of sitting—the way the weight transfers through the sitting bones, the way the spine stacks, the relationship of head to shoulders to hips. Know: ''I am sitting.''

This sounds obvious, but notice how rarely we actually know our posture. We sit without knowing we''re sitting. We walk while lost in thought about destinations. The body moves through the world while we''re elsewhere.

Now, slowly rise to standing. Feel the transition—weight shifting forward, legs engaging, the body rising. In standing, feel what''s different: legs bearing full weight, a different relationship to gravity, the feet pressing into the ground. Know: ''I am standing.''

Remain standing for a minute or two. Simply feel what standing is. The subtle sway of balance. The work of muscles maintaining uprightness. The spaciousness above.

Now walk slowly across the room. Know: ''I am walking.'' Feel each foot lift, swing, and place. Feel the shifting of weight from side to side. Walking is controlled falling—feel this.

Finally, lie down. Feel the transition from vertical to horizontal, the surrender of weight to the floor. Know: ''I am lying down.'' The body spreads, the breath changes, a different quality of rest emerges.

In daily life, this practice continues. Whatever position the body takes, know it. This simple knowing brings you into presence, over and over, throughout the day. The body is always here; your awareness can be too.

Close by returning to seated. Appreciate this most dignified of postures, chosen consciously, known fully.',
  'Embodied awareness',
  10,
  '{}',
  '{"body-awareness","focus","beginners"}',
  5,
  3,
  44,
  718,
  66,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'f2206639-c420-578d-9f09-2d174a10645c',
  NULL,
  'Clear Comprehension',
  'Mindfulness in action',
  'from-emerald-400 to-teal-600',
  '20-25 mins',
  'Open Awareness',
  'Seated (chair)',
  'Anytime',
  'Quiet indoor space',
  '''A practitioner acts with clear comprehension when going forward and returning; when looking ahead and looking away; when bending and extending the limbs; when wearing robes and carrying bowl; when eating, drinking, chewing, and tasting; when urinating and defecating; when walking, standing, sitting, falling asleep, waking up, talking, and keeping silent.''

The Buddha included the most mundane activities—even the bathroom. Nothing is excluded from practice. This is clear comprehension (sampajañña): knowing what you''re doing while you''re doing it.

Begin seated. For the first few minutes, simply be aware of sitting and breathing. Let the mind settle.

Now, we''ll move through simple actions with full awareness. Slowly raise one hand. Know that you''re raising it. Feel the muscles engage, the arm lift, the change in sensation. Know the intention that preceded the movement.

Place the hand on your knee. Know the placing, the contact, the settling.

Turn your head slowly to the right. Know the turning. Feel the neck rotate, the visual field shift, the head come to rest. Turn back to center with the same awareness.

These aren''t meditation exercises—they''re how you can move through life. Every action can be done with this quality of knowing. Reaching for a cup. Opening a door. Typing on a keyboard. The action itself becomes meditation.

The Buddha emphasized four aspects of clear comprehension: knowing what you''re doing, knowing its purpose, knowing it''s appropriate, and knowing it without delusion. For now, simply practice the first: knowing the action as it occurs.

Notice how different even simple movements feel when done with full awareness. There''s a quality of presence, of intentionality, of being here for your own life rather than sleepwalking through it.

The gap between formal practice and daily life closes when you bring this quality to ordinary actions. You don''t need a meditation cushion to practice—you need only to know what you''re doing while you do it.

Close by sitting in stillness, but carry this knowing into your next action: rising from your seat, walking to whatever comes next. Let life itself become the practice.',
  'Mindful action',
  10,
  '{}',
  '{"body-awareness","focus","clarity"}',
  70,
  67,
  490,
  60,
  21,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '8a2749c4-206a-53ff-a07d-8d3e14d3c636',
  NULL,
  'Swept by Awareness',
  'The complete body scan',
  'from-sky-400 to-blue-600',
  '25-30 mins',
  'Body Scan',
  'Lying down',
  'Evening',
  'Quiet, comfortable space',
  'Lie down comfortably, arms at your sides, palms up in a gesture of openness. Let your feet fall naturally apart. This is the posture of complete surrender—you have nothing to do but be aware.

We''ll sweep through the body with attention, not to change anything, but to know what''s here. The body is always speaking; this practice is learning to listen.

Begin at the top of the head. Feel whatever is there—perhaps a subtle tingling, perhaps warmth, perhaps nothing distinct. Don''t search for sensation; just notice what''s present.

Move to the forehead. The eyes. The cheeks. The jaw—notice if there''s holding here; most people clench without knowing. The lips, the tongue, the throat.

Drift down through the neck to the shoulders. The shoulders carry so much of our burden. Don''t try to relax them—just feel them. Whatever tension is there, let it be known.

Sweep down each arm in turn. The upper arm, elbow, forearm, wrist. Each finger individually. The palms of the hands. The backs of the hands.

Return to the chest. Feel the breath here, the rise and fall. The heart, working without your direction. The ribcage, the upper back.

Down through the belly—soft, expanding and contracting with breath. The lower back, the pelvis, the hips.

Through each leg: thigh, knee, shin, calf, ankle, heel, the arch of the foot, each toe.

Now let awareness expand to include the whole body at once. Feel the entire body lying here, breathing, alive. Not a collection of parts but one unified field of sensation.

This is the body the Buddha said contains the entire path. In this fathom-long body with its perceptions and mind, you''ll find everything you need for liberation. Honor it.

Rest here in whole-body awareness. When you''re ready to close, begin with small movements—fingers, toes. Gradually awaken the body, returning to activity with this quality of embodied presence.',
  'Deep body awareness',
  10,
  '{}',
  '{"body-awareness","stress","sleep","evening"}',
  2,
  0,
  39,
  721,
  61,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'd5b455aa-bbd6-54f6-a20d-e9b8e24a89ec',
  NULL,
  'The Four Elements',
  'Earth, water, fire, air within',
  'from-amber-500 to-orange-600',
  '25-30 mins',
  'Body Scan',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  '''A practitioner reviews this same body, however placed or disposed, as consisting of elements: In this body there are the earth element, the water element, the fire element, and the air element.''

This contemplation comes from the Satipaṭṭhāna Sutta. We examine the body not as ''mine'' but as a composition of the same elements found everywhere in nature. This loosens the grip of identification.

Settle into your seat. Establish breath awareness. Let the body calm.

Earth element (paṭhavī): This is solidity, heaviness, resistance. Feel the weight of your body pressing into the cushion. Feel the bones—their hardness, their structure. Feel the teeth, the nails. Wherever there''s solidity in the body, that''s earth element. The same solidity is in mountains, in stones, in the ground beneath you. The earth in your body is not different from the earth of the planet.

Water element (āpo): This is fluidity, cohesion. Feel the saliva in your mouth. The blood pulsing through vessels. The tears waiting in tear ducts. The body is mostly water—flowing, circulating, connecting. The water in your body once fell as rain, flowed in rivers, rose from the ocean. It will return there.

Fire element (tejo): This is heat, temperature. Feel the warmth of the body—the heat generated by metabolism, the temperature difference between core and skin. Feel the warmth of the breath. This is the same fire that burns in the sun, that cooks your food, that all life requires.

Air element (vāyo): This is movement, wind. Feel the breath moving in and out. Feel the subtle movements of the body—the pulse, the digestive activity, the currents of sensation. Air element is movement itself.

Now contemplate: where does ''your'' body end and the world begin? You breathe the air, drink the water, eat what grows from the earth, receive the fire of the sun. The body is not a separate thing—it''s a temporary gathering of elements, a meeting place, a pattern in the universal flow.

This isn''t meant to make you feel less real. It''s meant to show you that you''re part of everything. The anxiety about maintaining a separate self can relax. You were never separate to begin with.

Close by feeling gratitude for this elemental body, borrowed from the world and destined to return to it.',
  'Elemental wisdom',
  20,
  '{}',
  '{"body-awareness","letting-go","clarity"}',
  63,
  56,
  491,
  558,
  51,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '016045ef-06c3-594f-a820-c3e360a0fb00',
  NULL,
  'This Living Body',
  'Anatomy as contemplation',
  'from-slate-500 to-gray-700',
  '25-30 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  '''A practitioner reviews this same body from the soles of the feet up and from the crown of the head down, enclosed by skin, as full of many kinds of impurity: In this body there are head-hairs, body-hairs, nails, teeth, skin, flesh, sinews, bones, bone-marrow, kidneys, heart, liver, pleura, spleen, lungs, intestines, mesentery, contents of the stomach, feces, bile, phlegm, pus, blood, sweat, fat, tears, grease, saliva, snot, oil of the joints, and urine.''

This is a challenging practice, often misunderstood. The Buddha wasn''t teaching body-hatred. He was offering a medicine for body-obsession, for the cultural tendency to fixate on the body''s surface while ignoring its reality.

Settle into your seat. This practice requires stability—don''t attempt it if you''re feeling vulnerable.

Begin by appreciating the body''s functioning. Right now, without any effort from you, the heart pumps blood, the lungs exchange gases, the stomach digests, the kidneys filter. The body is a miracle of coordinated activity.

Now, contemplate the body''s interior. Beneath the skin you''ve spent so much time decorating and worrying about, there are organs, fluids, processes. This isn''t disgusting—it''s simply true. The heart is a muscle the size of your fist, beating 100,000 times a day. The intestines, uncoiled, would stretch over twenty feet.

The Buddha listed thirty-one parts. You don''t need to memorize them. Simply recognize that the body is complex, composed of parts, none of which are ''you.'' The hair that falls from your head was once ''you''; now it''s garbage. The food you ate becomes flesh; the flesh becomes waste.

This contemplation reduces vanity and attachment, not through self-rejection but through clear seeing. The body is not what we pretend it is. It''s more interesting, more strange, more temporary.

If resistance arises, note it. The mind that recoils from the body''s reality is the same mind that will recoil from aging, illness, and death. This practice builds the capacity to face what''s true.

Close by returning to simple appreciation. This body, however composed, allows you to practice, to love, to learn. Treat it well—not because it''s beautiful, but because it''s the vehicle of awakening.',
  'Realistic seeing',
  50,
  '{}',
  '{"body-awareness","letting-go","clarity"}',
  123,
  80,
  221,
  10,
  5,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'ed6cc815-377b-54b1-828a-7a0490f75df5',
  NULL,
  'Body as Teacher',
  'Integration and embodied wisdom',
  'from-emerald-500 to-green-700',
  '20-25 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'We complete the body course by integrating what we''ve learned. The body is not just an object of meditation—it''s a teacher, a guide, a constant reminder of presence.

Settle into your seat with all the care you''ve developed through these sessions. Feel the posture—the stability of a practitioner who knows this body.

Begin with the breath, but expand to include the whole body. The four postures are present in this one: the sitting body contains the memory of standing, walking, lying down. You know what it is to inhabit this form.

Feel the elements: the earth of bone and flesh, the water of blood and fluid, the fire of warmth, the air of breath. You''re not separate from nature—you''re nature knowing itself.

Notice any sensations arising. The body is always communicating—tension here, ease there, aliveness everywhere. Listen without agenda. The body often knows what the mind refuses to acknowledge.

The Buddha said enlightenment is found in ''this fathom-long body with its perceptions and mind.'' Not somewhere else. Not in a different realm. Here, in this body you''ve been given, the entire path unfolds.

The body teaches impermanence: cells dying and replacing, sensations arising and passing, the body itself aging moment by moment. It teaches suffering: when we fight the body''s reality, we create pain. It teaches non-self: the body operates without a controller, an intricate dance of processes with no one running the show.

Sit for some minutes in simple embodied awareness. Not analyzing, not contemplating—just being present in and as this body. Feel the life in it. The breath. The pulse. The subtle vibration of existence.

Carry this forward. The body is always available as an anchor to the present. Whenever you notice you''ve drifted into thought, return to the body. It''s always here, always now, always ready to bring you home.

Close by thanking the body—not with words, but with attention. The gift of a human body is rare and precious. Use it well.',
  'Embodied integration',
  20,
  '{}',
  '{"body-awareness","clarity","morning"}',
  167,
  70,
  847,
  154,
  35,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'dbaed6dd-bc79-5287-895a-270d19114391',
  NULL,
  'Beginning with Self',
  'The first circle of loving-kindness',
  'from-rose-400 to-pink-600',
  '20-25 mins',
  'Loving-Kindness',
  'Seated (chair)',
  'Morning',
  'Quiet, private space',
  '''Here, a practitioner, with a mind imbued with loving-kindness, pervades one quarter... the second quarter... the third quarter... the fourth quarter... above, below, across, everywhere, all around, the whole world they pervade with a mind imbued with loving-kindness, vast, exalted, measureless, without hostility, without ill will.''

Before we can extend love to the whole world, we must establish it in ourselves. This isn''t selfishness—it''s the necessary foundation. You cannot give what you don''t have.

Settle into a comfortable seat. Place one or both hands over your heart if that feels natural. Feel the warmth of your palms, the rhythm of your heartbeat.

Bring to mind a moment when you felt truly at peace, truly loved. It might be a memory, a person, or simply a feeling. Let this warmth fill your chest.

Now, offer yourself the traditional phrases of loving-kindness:

''May I be happy.''
''May I be healthy.''
''May I be safe.''
''May I live with ease.''

Repeat these slowly, letting each phrase land. Don''t worry if you don''t feel anything special. The practice works through repetition, not intensity.

If resistance arises—if a voice says you don''t deserve this—notice that voice without argument. Return to the phrases. You''re not claiming to be perfect. You''re wishing yourself well, as you would wish any struggling being well.

You might adapt the phrases to your needs:
''May I accept myself as I am.''
''May I be free from fear.''
''May I find peace.''
''May I be kind to myself.''

The specific words matter less than the intention. You''re cultivating a quality of warmth, of care, of wishing yourself well. This is mettā—usually translated as loving-kindness, but perhaps better understood as unconditional friendliness.

Spend the session returning to the phrases whenever the mind wanders. Feel the heart area. Imagine warmth radiating from your center. You''re not trying to force a feeling—you''re planting seeds.

Close by sitting quietly, feeling whatever is present. Then gently return to the world, carrying this quality of self-care with you.',
  'Self-love',
  10,
  '{}',
  '{"self-compassion","low-mood","morning"}',
  60,
  54,
  108,
  52,
  17,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '5a146ba8-3b23-595e-aa1e-f99adecf7549',
  NULL,
  'The Beloved',
  'Love for those who are dear',
  'from-pink-400 to-rose-600',
  '20-25 mins',
  'Loving-Kindness',
  'Seated (chair)',
  'Anytime',
  'Quiet, private space',
  'We extend the circle of loving-kindness to those we love. This is often the easiest step—the love is already there. We''re simply making it conscious, cultivating it.

Begin with yourself. Spend a few minutes with the self-directed phrases: ''May I be happy. May I be healthy. May I be safe. May I live with ease.'' Establish the warm feeling in your heart.

Now, bring to mind someone you love unconditionally. A person whose happiness you genuinely wish for. It might be a parent, a child, a dear friend, a partner. Choose someone whose image naturally evokes warmth. Avoid complicated relationships for now.

See this person clearly in your mind''s eye. Their face, their smile, their way of being. Feel the natural love that arises.

Now offer them the phrases:

''May you be happy.''
''May you be healthy.''
''May you be safe.''
''May you live with ease.''

Really mean it. This person has struggled, has suffered, has their own fears and hopes. You''re wishing them the fundamental goods: happiness, health, safety, ease.

If the formal phrases feel stiff, use your own words: ''I hope you find peace. I want you to be well. May your path be smooth.''

Notice how easy this is compared to self-directed mettā. Most of us find it easier to love others than ourselves. That discrepancy is worth noting—and addressing through practice.

You might bring to mind additional loved ones, offering each the phrases in turn. Or stay with one person, deepening the connection. There''s no wrong approach.

The Buddha taught that loving-kindness meditation brings many benefits: peaceful sleep, waking with ease, pleasant dreams, protection from harm. But the deepest benefit is simply the experience itself—the opening of the heart, the recognition that love is our natural state.

Close by returning briefly to yourself: ''May I be happy...'' Then expand to include both yourself and your loved ones: ''May we be happy. May we be at peace.''',
  'Extending love',
  10,
  '{}',
  '{"self-compassion","emotions","morning"}',
  56,
  48,
  414,
  85,
  24,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '540bb71c-9453-504d-a74d-c71d5b91da78',
  NULL,
  'The Stranger',
  'Love without reason',
  'from-violet-400 to-purple-600',
  '20-25 mins',
  'Loving-Kindness',
  'Seated (cushion)',
  'Anytime',
  'Quiet, private space',
  'Now we reach beyond the easy circle. We extend loving-kindness to someone we neither love nor dislike—a neutral person, a stranger. This is where the practice becomes truly transformative.

Begin with yourself. Establish mettā with the phrases: ''May I be happy. May I be healthy. May I be safe. May I live with ease.''

Briefly touch into love for a dear one. Feel that warmth.

Now, bring to mind a neutral person. Someone you''ve seen but don''t know—a cashier at the store, a neighbor you''ve never spoken to, someone you passed on the street. Anyone toward whom you have no strong feelings.

See this person in your mind. They have a face, a life, hopes and fears you know nothing about. They wake each morning, brush their teeth, worry about things. They''ve known joy and sorrow.

Offer them the phrases:

''May you be happy.''
''May you be healthy.''
''May you be safe.''
''May you live with ease.''

Notice any resistance. The mind might say: ''Why would I wish them well? I don''t even know them.'' But this is precisely the point. Love that requires a reason is conditional. We''re practicing unconditional friendliness.

This stranger has a mother who loves them, or had one once. They''ve been sick, been scared, been lonely. They will die, just as you will. In all the ways that matter, they''re exactly like you—a conscious being trying to be happy and avoid suffering.

The Buddha taught that all beings want to be happy. Every being—not just those we know, not just those who are kind to us. This practice aligns us with that universal wish.

Repeat the phrases slowly. Feel the stretch of the heart as it reaches toward someone with no self-interest involved. This is love without reason, kindness as a way of being rather than a response to merit.

Close by widening the circle further: ''May all those I''ll pass today be happy. May all in this neighborhood be safe.'' We''re preparing for boundless love.',
  'Unconditional kindness',
  20,
  '{}',
  '{"self-compassion","emotions","letting-go"}',
  168,
  161,
  563,
  53,
  14,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'bfabaa99-7a55-5a89-898f-b119ae3d5179',
  NULL,
  'The Difficult One',
  'Love at the edge',
  'from-amber-500 to-orange-700',
  '25-30 mins',
  'Loving-Kindness',
  'Seated (cushion)',
  'Anytime',
  'Quiet, private space',
  'This is the challenging session. We extend loving-kindness to someone we find difficult—someone who has hurt us, irritated us, or whom we simply dislike. This is advanced practice; go gently.

Begin with yourself. Take extra time here. Fill your heart with warmth: ''May I be happy. May I be healthy. May I be safe. May I live with ease.''

Touch into love for a dear one. Strengthen the heart''s warmth.

Connect with a neutral person. Extend the kindness.

Now—only if you feel stable—bring to mind a mildly difficult person. Don''t start with your greatest enemy. Choose someone who irritates you, someone with whom you have a small conflict. Someone manageable.

See their face. Notice what arises. Probably not love. Perhaps irritation, judgment, resentment. Let these feelings be present. You''re not trying to suppress them.

Now, consider: this person, too, wants to be happy. They act the way they do because of their conditioning, their fears, their pain. They didn''t choose their genes, their childhood, their neural wiring. In some sense, they''re doing the best they can with what they have.

This isn''t about condoning harm or pretending it didn''t happen. It''s about releasing your own burden of ill will. Resentment doesn''t hurt the other person—it poisons you.

Gently, experimentally, offer the phrases:

''May you be happy.''
''May you be healthy.''
''May you be safe.''
''May you live with ease.''

If resistance is too strong, back off. Return to self-directed mettā. Try again later, or with a less difficult person. This practice takes time.

If you can offer the phrases, notice what happens. Perhaps nothing. Perhaps a slight softening. Perhaps tears. Whatever arises, let it be.

The Buddha said that loving-kindness is the ''beautiful abiding.'' It makes the mind luminous and pleasant. But this only happens when we can extend love to all—including those who don''t ''deserve'' it.

Close by returning to yourself with extra tenderness. This is brave work. Whatever degree of love you could muster today is enough.',
  'Transforming resentment',
  20,
  '{}',
  '{"anger","emotions","letting-go","self-compassion"}',
  71,
  106,
  237,
  52,
  19,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '74e23de4-392c-5999-90cc-fa4d69fdb25f',
  NULL,
  'All Beings Everywhere',
  'Boundless love',
  'from-sky-400 to-blue-600',
  '25-30 mins',
  'Loving-Kindness',
  'Seated (cushion)',
  'Morning',
  'Quiet, private space',
  '''Just as a mother would protect her only child with her life, even so let one cultivate a boundless mind towards all beings. Let one''s thoughts of boundless love pervade the whole world—above, below, and across—without obstruction, without hatred, without enmity.''

We complete the mettā progression by removing all limits. Love pervades everywhere, excluding no one.

Begin as before: self, then a dear one, then a neutral person. If it feels right, include a mildly difficult person. Take your time with each stage.

Now, begin to expand. Imagine loving-kindness radiating from your heart in all directions. Like ripples from a stone dropped in water, it spreads outward without boundary.

First, those nearby: ''May all beings in this building be happy. May all beings in this neighborhood be safe.'' Feel the love extending.

Wider: ''May all beings in this city be well. May all in this country find peace.''

Wider still: ''May all beings on this continent be happy. May all across the oceans know safety and ease.''

Include all types of beings. Humans, yes, but also animals—the birds outside, the insects, the fish in the sea. All beings that can experience happiness and suffering.

Now, directional extension. Send mettā to the east: ''May all beings to the east be happy.'' To the south, west, north. Above you—beings in planes, in space. Below—creatures in the earth. Everywhere.

''May all beings everywhere be happy.''
''May all beings everywhere be free from suffering.''
''May all beings everywhere know peace.''

The heart cannot actually feel this vastness, but it can orient toward it. We''re training a disposition, a way of meeting the world. When you leave this practice and encounter a stranger, the echo of this boundless love softens your response.

Rest in the intention of boundless love. The phrases can fall away; just feel the radiance.

The Buddha promised that one who practices this way ''sleeps easily, wakes easily, has no bad dreams, is dear to human beings, is dear to non-human beings, deities protect them.'' Whether literally true, these words point to the protection that love itself provides.

Close by returning to yourself: ''May I be happy.'' The circle completes where it began.',
  'Boundless love',
  20,
  '{}',
  '{"self-compassion","emotions","morning"}',
  346,
  280,
  1337,
  262,
  39,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '3f2f0f04-eb89-5536-852e-6bb9e58e624b',
  NULL,
  'The Four Immeasurables',
  'Love, compassion, joy, equanimity',
  'from-purple-500 to-indigo-700',
  '30-35 mins',
  'Loving-Kindness',
  'Seated (cushion)',
  'Morning',
  'Quiet, private space',
  'The Buddha taught four ''immeasurable'' qualities of heart: loving-kindness (mettā), compassion (karuṇā), appreciative joy (muditā), and equanimity (upekkhā). Together, they form a complete heart practice.

We''ve developed loving-kindness—the wish for beings to be happy. Now we add the remaining three.

Begin with mettā. ''May all beings be happy.'' Feel the warmth, the friendliness, the unconditional wish for well-being.

Now, compassion. Bring to mind beings who are suffering—those who are sick, grieving, afraid. Not to dwell on suffering, but to meet it with care. Compassion is love''s response to pain.

''May all beings be free from suffering.''
''May those in pain find relief.''
''May those who are afraid find safety.''

Feel the heart soften toward suffering. Compassion is not sadness—it''s the strong, tender willingness to be present with difficulty. The wish to help, to heal.

Now, appreciative joy. Bring to mind beings who are happy, successful, fortunate. Can you feel glad for them without envy? Muditā is the opposite of jealousy—it delights in others'' good fortune.

''May your happiness continue.''
''I''m glad for your success.''
''May your joy increase.''

This is surprisingly challenging. We often feel diminished by others'' good fortune. But joy is not a limited resource. Their happiness doesn''t reduce yours. Practice celebrating without comparison.

Finally, equanimity. This is the stability that holds all the other qualities. It recognizes that we cannot control others'' happiness, cannot prevent all suffering, cannot guarantee outcomes.

''All beings are the heirs of their own karma.''
''I wish you well, and I accept what I cannot change.''
''May I meet whatever arises with balance.''

Equanimity is not indifference—it''s love that doesn''t grasp. It''s care that can let go. It''s the peace that remains when we''ve done what we can.

Spend some minutes moving between the four qualities. Mettā, karuṇā, muditā, upekkhā. Feel how they complement each other, how together they form a complete response to life.

Close by resting in the heart. These four immeasurables are not techniques to acquire but capacities to uncover. They''re already in you. This practice simply clears the obstructions.',
  'Complete heart',
  50,
  '{}',
  '{"self-compassion","emotions","letting-go","clarity"}',
  187,
  309,
  539,
  3001,
  79,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'bd9cd85a-77a4-505b-af61-bfc38314c35f',
  NULL,
  'Pleasant, Unpleasant, Neutral',
  'The three feeling tones',
  'from-indigo-400 to-violet-600',
  '20-25 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  '''How does a practitioner abide contemplating feelings as feelings? Here, when feeling a pleasant feeling, one knows: I feel a pleasant feeling. When feeling an unpleasant feeling, one knows: I feel an unpleasant feeling. When feeling a neither-pleasant-nor-unpleasant feeling, one knows: I feel a neither-pleasant-nor-unpleasant feeling.''

This is vedanā—the second foundation of mindfulness. Every moment of experience has a feeling tone: pleasant, unpleasant, or neutral. This simple awareness is the key to freedom.

Settle into your seat. Establish breath awareness. Let the body calm.

Now, notice the feeling tone of this moment. Is it pleasant, unpleasant, or neutral? Don''t analyze why—just notice which.

Perhaps there''s mild pleasantness—the body is comfortable, the mind is relatively quiet. That''s pleasant feeling. Know it: ''Pleasant.''

Perhaps there''s discomfort somewhere—a tight muscle, a restless mind. That''s unpleasant feeling. Know it: ''Unpleasant.''

Perhaps it''s hard to say—not particularly pleasant or unpleasant. That''s neutral feeling. Know it: ''Neutral.''

This practice reveals something crucial: feeling tone is not about external objects but about how experience registers. The same cup of coffee is pleasant when you want it, unpleasant when you''re over-caffeinated, neutral when you''re distracted.

As you sit, feeling tones shift constantly. A pleasant sensation arises, then fades; an unpleasant one takes its place. Watch this flow. You''re not trying to have more pleasant feelings—you''re knowing whatever feeling is present.

Why does this matter? Because feeling tone triggers reaction. Pleasant feeling triggers grasping—we want more. Unpleasant feeling triggers aversion—we want it gone. Neutral feeling triggers boredom—we want something else. These reactions, unexamined, run our lives.

But when we know the feeling tone as it arises, we create a gap. We can feel pleasantness without blindly grasping. We can feel unpleasantness without reactive aversion. We can feel neutrality without seeking distraction.

This is where freedom lives—in the gap between feeling and reaction.

Close by appreciating this practice. It''s simple but profound. The Buddha said that one who understands vedanā understands everything that matters about liberation.',
  'Understanding reactivity',
  20,
  '{}',
  '{"emotions","clarity","focus"}',
  55,
  11,
  104,
  51,
  18,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '28be42fe-01fb-5629-8adf-cedeb67bbbe9',
  NULL,
  'The Reactive Chain',
  'Where craving begins',
  'from-amber-500 to-red-600',
  '25-30 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'The Buddha identified a chain of causation: Contact leads to feeling. Feeling leads to craving. Craving leads to clinging. Clinging leads to suffering. Today we observe this chain as it operates in real-time.

Settle into your seat. Establish presence with the breath and body.

Now, wait. Simply sit, aware. Soon enough, something will arise—a sound, a sensation, a thought. When it does, watch carefully.

First comes contact—the meeting of sense organ, object, and consciousness. A sound reaches your ear. A sensation arises in your body.

Immediately, there''s feeling—pleasant, unpleasant, or neutral. You might not notice it consciously, but it''s there. The sound is harsh (unpleasant) or melodic (pleasant). The sensation is uncomfortable (unpleasant) or soothing (pleasant).

Then, watch for craving. If the feeling was pleasant, does the mind reach for more? Does it want the experience to continue or intensify? If the feeling was unpleasant, does the mind push away? Does it want the experience to stop? If neutral, does the mind seek something more stimulating?

This craving happens fast—often before we notice. But with practice, you can see it arising. You can feel the subtle grasping or aversion in the body.

Now, the crucial insight: craving is not inevitable. When you see feeling clearly—when you know ''pleasant'' or ''unpleasant'' with full awareness—you can let the feeling be without automatically reacting. The chain can be broken.

This doesn''t mean suppressing desire or forcing equanimity. It means seeing clearly. When craving arises with full awareness, it loses its compulsive power. You can feel the urge to grasp without grasping. You can feel the urge to push away without pushing.

Spend the remaining time simply sitting, watching experiences arise, noticing feeling tones, and observing any movement of craving. Each time you see the chain, you weaken it.

Close by recognizing: this is where suffering is created and where it can end. Not in grand spiritual experiences, but in these small moments of clarity.',
  'Breaking the chain',
  20,
  '{}',
  '{"emotions","clarity","letting-go"}',
  2,
  6,
  20,
  64,
  23,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'c17d81ec-2c97-5ed5-9cab-ddf3c5daf694',
  NULL,
  'States of Mind',
  'Knowing the citta',
  'from-sky-400 to-cyan-600',
  '25-30 mins',
  'Vipassana',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  '''When the mind has lust, one knows: The mind has lust. When the mind is without lust, one knows: The mind is without lust. When the mind has aversion, one knows: The mind has aversion. When the mind is without aversion, one knows: The mind is without aversion. When the mind has delusion, one knows: The mind has delusion. When the mind is without delusion, one knows: The mind is without delusion.''

The Buddha continued listing mental states: contracted or expansive, developed or undeveloped, surpassed or unsurpassed, concentrated or unconcentrated, liberated or not liberated. Our practice today is simple: knowing the state of the mind.

Settle into your seat. Establish breath awareness. Let the body calm.

Now, turn attention to the quality of the mind itself. Not the contents—not what you''re thinking—but the state of the consciousness in which thoughts appear.

Is the mind contracted or expansive? Contracted mind feels tight, restricted, clamped down. Expansive mind feels open, spacious, without boundaries. Which is present now?

Is the mind concentrated or scattered? Concentrated mind is unified, gathered on one point. Scattered mind is fragmented, jumping between objects. Which is present now?

Is the mind dull or bright? Dull mind feels foggy, slow, unclear. Bright mind is alert, clear, vivid. Which is present now?

Is there wanting present? The sense of reaching for something, dissatisfaction with what is? Or is there contentment—nothing needed in this moment?

Is there aversion present? Resistance, pushing away, irritation? Or is there acceptance—allowing what is?

You''re not trying to change the state. You''re simply knowing it. This knowing is profoundly stabilizing. Whatever state is present, you can know it. That knowing is always available.

You might notice the state shifting as you observe it. Contraction sometimes relaxes when witnessed. Dullness sometimes lifts when noticed. This isn''t the goal, but it happens—awareness has healing properties.

Spend the session simply knowing the state of mind, moment by moment. Let the states come and go while you remain the knowing.

Close by appreciating this capacity. You have the ability to know your own mind. This meta-awareness is the beginning of freedom.',
  'Meta-awareness',
  20,
  '{}',
  '{"clarity","emotions","focus"}',
  27,
  31,
  100,
  318,
  39,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '8c7670bf-e39a-54b7-ac04-327891b8819e',
  NULL,
  'The Five Hindrances',
  'Naming the obstacles',
  'from-slate-500 to-gray-700',
  '25-30 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'The Buddha identified five mental states that obstruct meditation and wise living: sensual desire (kāmacchanda), ill-will (byāpāda), sloth and torpor (thīna-middha), restlessness and remorse (uddhacca-kukkucca), and doubt (vicikicchā). Today we learn to recognize them.

Settle into your seat. Establish breath awareness.

Now, observe the mind. One or more of these hindrances may be present—they usually are, to some degree.

Sensual desire: The mind wanting pleasant experiences. Not just sexual desire—any reaching for pleasure. The wish for tastier food, more comfort, better entertainment. Notice if the mind is leaning toward something pleasurable.

Ill-will: Aversion, irritation, anger. Not just rage—any pushing away. Annoyance at the noise outside, frustration with the wandering mind, resistance to discomfort. Notice if there''s any hostility present.

Sloth and torpor: Dullness, heaviness, sleepiness. The mind sinking, losing clarity. A fog descending. This isn''t physical tiredness—it''s a mental unwillingness to engage. Notice if the mind is fading.

Restlessness and remorse: Agitation, anxiety, guilt about the past. The mind can''t settle, keeps replaying events, worries about what''s to come. Notice if there''s buzzing, jumping, inability to rest.

Doubt: Uncertainty about the practice, about yourself, about whether any of this works. The skeptical voice that undermines engagement. Notice if doubt is present.

The Buddha''s instruction is simply to know when these are present and when they''re absent. ''There is desire in me'' or ''There is no desire in me.'' The knowing is the practice.

Why just know? Because hindrances thrive in darkness. When you clearly see ''this is restlessness,'' the restlessness often settles. When you clearly see ''this is doubt,'' the doubt has less power. Awareness is the solvent.

Don''t fight the hindrances. Don''t feel bad about them. They''re universal—every meditator faces them. Simply know when they''re present and when they''re gone.

Close by recognizing whatever state is present now. Hindrances or their absence—both can be known. That knowing is your freedom.',
  'Recognizing obstacles',
  20,
  '{}',
  '{"racing-mind","stress","emotions","focus"}',
  47,
  25,
  204,
  64,
  20,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '49dc5ed3-4413-5d87-b1e0-fd6a150f0072',
  NULL,
  'Working with Obstacles',
  'Antidotes and release',
  'from-emerald-500 to-teal-700',
  '25-30 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'Having learned to recognize the five hindrances, we now explore how to work with them. The Buddha taught both understanding their causes and applying appropriate antidotes.

Settle into your seat. Establish breath awareness. Observe what hindrances, if any, are present.

For sensual desire: Notice where desire lives in the body. Feel its texture, its energy. Often, simply feeling desire fully—without acting on it—allows it to pass. The antidote is also reflection on impermanence: whatever you desire will not satisfy permanently. Or focus on a less appealing aspect of the desired object—not to create aversion, but to balance the mind''s lopsided attraction.

For ill-will: Again, feel it in the body. Where is the tightness, the heat? Breathe into it. The antidote is loving-kindness—if you notice aversion toward someone, try offering them mettā. Or reflect: this person, too, wants to be happy; their behavior comes from their own suffering.

For sloth and torpor: Energy is needed. Open the eyes wide. Take deeper breaths. Stand up if necessary. Contemplate something inspiring—the preciousness of human life, the opportunity of this moment. Sometimes sloth is the body''s genuine need for rest—honor that too.

For restlessness and remorse: Grounding is needed. Return firmly to the body, to the breath. Feel the weight of the body on the cushion. Let the breath become slower, deeper. For remorse about the past, practice self-forgiveness: you did what you could with what you knew; resolve to do better.

For doubt: Recognize doubt as just another mental state, not truth. Ask yourself: ''Is doubt helping me right now?'' Often, the answer is clear. The antidote is also confidence from practice—remember times when meditation has helped, insights you''ve had.

The deepest antidote to all hindrances is simply awareness itself. When you clearly know ''restlessness is present,'' you are no longer fully lost in restlessness. The knowing stands apart.

Spend the session working with whatever arises. Not fighting, not indulging—skillfully attending.

Close by appreciating your growing capacity to meet these universal challenges. The hindrances become teachers.',
  'Skillful response',
  20,
  '{}',
  '{"racing-mind","stress","emotions","clarity"}',
  98,
  65,
  572,
  69,
  20,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '767d758f-bb02-5b47-b108-2b652834ee88',
  NULL,
  'The Mind Knows Itself',
  'Pure awareness',
  'from-purple-400 to-indigo-600',
  '30-35 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'We complete this course by resting in awareness itself—the knowing that underlies all experience.

Settle into your seat with the stability developed through these sessions. You''ve learned to know feeling tones, mental states, and hindrances. Now we turn to the knowing itself.

Begin with the breath. Let the body calm. Let mental activity settle.

Now, notice that whatever arises is known. Sounds are known. Sensations are known. Thoughts are known. Emotions are known. What is this knowing?

You can''t see awareness the way you see objects—awareness is not an object. It''s what knows objects. But you can recognize it, sense it, rest in it.

Try this: notice a sensation in the body. Now notice that you''re aware of the sensation. The sensation is the object; awareness is the subject. Usually, we''re focused on objects. Now, sense the subject.

Or: notice a thought arising. Before you follow the thought, notice: there''s knowing of this thought. The thought will pass; the knowing remains.

This knowing is always present. It''s present in every experience. It''s present when you''re happy and when you''re suffering. It''s present in deep meditation and in everyday chaos. It doesn''t come and go—only the contents of awareness come and go.

This is sometimes called ''pure awareness'' or ''rigpa'' or ''the witness.'' The name matters less than the recognition. Can you sense, right now, the awareness in which these words are appearing?

Rest here. Let objects come and go. Stay with the knowing. If you get lost in thought, the moment you notice you''re lost, you''re back—because noticing is awareness.

This isn''t a mental state to achieve. It''s what''s always been the case—you''re just noticing it. Every experience has happened in awareness; you''re simply recognizing awareness directly.

The Buddha said this recognition, fully stabilized, is liberation. The one who knows is not affected by what it knows. The mirror is not altered by reflections. This awareness is already free.

Rest here for the remainder of the session. No technique needed—just being what you already are.

Close by carrying this recognition with you. Awareness doesn''t stop when you open your eyes.',
  'Self-recognition',
  50,
  '{}',
  '{"clarity","focus","emotions","letting-go"}',
  51,
  206,
  294,
  245,
  39,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'dda619cb-9e6b-54c7-aec9-6a6d15a48b60',
  NULL,
  'Settling into Stillness',
  'Preparing for depth',
  'from-slate-400 to-gray-600',
  '25-30 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet, undisturbed space',
  'We begin the concentration path. Jhāna—deep meditative absorption—requires preparation: a settled body, calmed mind, and stable attention. This session establishes the conditions.

Find a posture you can maintain without moving. Deeper concentration requires stillness—not rigid, but genuinely unmoving. Arrange the body with care.

Begin with the breath. But today, treat the breath as more than an anchor—treat it as a home. You''re not just returning to the breath when you wander; you''re settling into it, making it your dwelling place.

For the first minutes, simply let the body calm. Let breathing become natural, unforced, gentle. The body needs to feel safe enough to release its vigilance.

Now, attend to the breath at one location. Choose the nostrils, the chest, or the belly—wherever the breath is most vivid. Stay there. Resist the temptation to scan the body or follow sounds. One place.

The attention will wander. When it does, return without agitation. The key is patient repetition, not forceful concentration. Think of water gradually wearing a groove in stone.

As concentration develops, the breath may change. It might become subtle, light, almost imperceptible. This is natural—as the body relaxes deeply, it needs less oxygen. Don''t chase the changing breath; let it be however it is.

You might notice the mind becoming more unified. Instead of many thoughts, few. Instead of fragmentation, gathering. This is the beginning of access concentration.

Don''t strain. Concentration that comes from force creates tension and can''t be sustained. Let concentration arise from interest, from settling, from the natural pleasure of resting in one place.

Spend the session simply being with the breath, one moment at a time. Not reaching for special states, not expecting anything. Just here, just breathing, just this.

Close by noting how the mind feels. Whatever quality is present—scattered, settled, or somewhere between—is your starting point. With practice, the settling deepens.',
  'Preparing concentration',
  50,
  '{}',
  '{"focus","clarity","morning"}',
  102,
  323,
  403,
  31,
  11,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '557fbaed-858e-52c2-994a-10171c2c7fce',
  NULL,
  'Access Concentration',
  'The threshold',
  'from-indigo-400 to-blue-600',
  '30-35 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet, undisturbed space',
  'Access concentration (upacāra samādhi) is the threshold of jhāna—a state of gathered, stable attention that precedes full absorption. Today we work toward this threshold.

Settle the body completely. Resolve not to move for the duration of the session unless absolutely necessary.

Begin with the breath at your chosen location. Establish continuity of attention—one breath after another, staying present.

As concentration develops, watch for changes. The body may feel lighter. The breath may become subtle or seem to fade. The sense of sitting in a room may recede. These are signs of deepening concentration.

In access concentration, the mind becomes quite still. Hindrances are suppressed—not eradicated, but temporarily set aside. There''s a sense of peace, of unification, of the mind resting in itself.

You might notice what''s called the ''nimitta''—a mental sign that appears when concentration deepens. This might be a sense of light, or a pleasant feeling in the body, or a subtle image at the point of attention. Different practitioners experience it differently. Don''t chase it; let it develop naturally.

If the nimitta appears, treat it gently. Pay attention to it without grasping. Let it stabilize. This is the doorway—the entry point to deeper states.

If no nimitta appears, don''t worry. Access concentration is still valuable. The mind at rest, attention stable, body peaceful—this itself is beneficial. Not everyone develops jhāna, but everyone can develop stability.

The Buddha said that concentration is like water in a calm pool—clear, undisturbed, you can see to the bottom. The turbulence of the ordinary mind prevents this clarity. In access concentration, the waters begin to still.

Spend the session maintaining stable attention on the breath or the nimitta if one appears. Don''t expect anything particular. Just maintain presence.

Close by noting the quality of your mind. Whatever degree of stillness you achieved, honor it. This path is gradual; be patient with yourself.',
  'Approaching absorption',
  50,
  '{}',
  '{"focus","clarity","morning"}',
  134,
  101,
  352,
  294,
  40,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '31dbf0d9-bf6c-593c-bee0-c19e66994eaa',
  NULL,
  'First Jhāna',
  'Full absorption begins',
  'from-violet-400 to-purple-600',
  '35-45 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet, undisturbed space',
  '''Quite secluded from sensual pleasures, secluded from unwholesome states, one enters and dwells in the first jhāna, which is accompanied by applied thought and sustained thought, with rapture and pleasure born of seclusion.''

The Buddha described the first jhāna as having five factors: applied thought (vitakka)—placing the mind on the object; sustained thought (vicāra)—keeping it there; rapture (pīti)—a thrilling joy; pleasure (sukha)—a deep contentment; and one-pointedness (ekaggatā)—unified focus.

This is advanced practice. Don''t expect jhāna to arise on demand. Think of this session as creating the conditions; what happens is not entirely in your control.

Settle the body deeply. Establish access concentration. Stay with the breath until the mind is quite stable.

As stability develops, notice if rapture begins to arise. This might feel like waves of pleasant energy, tingling, buoyancy. If it comes, don''t get excited—that disrupts concentration. Simply include it in your awareness while maintaining attention on the breath.

Notice also pleasure—a quieter, deeper sense of well-being. This is different from the more energetic rapture. Both can be present simultaneously.

If you''ve developed a nimitta, gently shift attention from the breath to the nimitta. Let the nimitta stabilize and expand. This transition is often where jhāna begins.

In jhāna, the sense of effort drops away. You''re no longer working to concentrate—concentration has become natural, self-sustaining. The mind is absorbed in its object. Thought may still occur, but it''s thought about the meditation object, not discursive wandering.

If this happens, rest in it. Let the jhāna develop on its own. Don''t analyze or think ''Am I in jhāna?'' This would be discursive thought, which would undermine the state.

If jhāna doesn''t arise, simply maintain whatever concentration you have. Access concentration itself brings peace, clarity, and a foundation for insight. There''s no failure here.

Spend the session in the deepest concentration available to you. Let the factors be present or not. Trust the practice.

Close by emerging gently. Don''t rush out. Let awareness gradually expand to include the room, the body, sounds. Carry the peace forward.',
  'Deep absorption',
  50,
  '{}',
  '{"focus","clarity","morning"}',
  12,
  7,
  61,
  58,
  20,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '2f59529e-5b47-578d-9135-ad2cb4f55e4c',
  NULL,
  'Deepening Absorption',
  'The second and third jhānas',
  'from-cyan-400 to-teal-600',
  '40-50 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet, undisturbed space',
  '''With the subsiding of applied thought and sustained thought, one enters and dwells in the second jhāna, which has internal confidence and unification of mind, without applied thought and sustained thought, with rapture and pleasure born of concentration.''

The deeper jhānas are progressively more refined. In the second jhāna, the verbal, discursive quality of the mind settles completely. There''s no more ''placing'' the mind—it''s simply there, unified, confident.

Begin as before: settle the body, establish access concentration, allow jhāna to develop. If you''ve touched the first jhāna previously, aim for that stability.

Once stable in the first jhāna, notice the applied and sustained thought—the subtle mental activity that keeps you oriented to the object. Now, let even this settle. The mind becomes quieter still. No more positioning, no more maintaining—just presence.

In the second jhāna, there''s a quality of internal confidence (sampasādana)—a deep trust, a sense that this is right. The mind is unified (ekodi-bhāva)—not just focused but fundamentally gathered into one. Rapture and pleasure continue, now born of concentration itself rather than seclusion.

''With the fading away of rapture, one dwells equanimous... and enters and dwells in the third jhāna.''

As the second jhāna stabilizes, the rapture—the more energetic quality—may fade. What remains is pleasure and equanimity. This is the third jhāna: calmer, smoother, more refined. Less exciting, but more stable.

These transitions happen gradually. Don''t force them. Let the mind find its natural depth. Each practitioner''s experience is unique; the texts describe ideal progressions, but your path may vary.

If you don''t reach these states, simply rest in whatever depth is available. Even access concentration, maintained for extended periods, transforms the mind. The benefits aren''t limited to jhāna attainment.

Spend the session in the deepest absorption you can access. Let the depth find you rather than chasing it.

Close by emerging slowly, appreciating whatever degree of concentration was present.',
  'Refining absorption',
  100,
  '{}',
  '{"focus","clarity"}',
  54,
  37,
  164,
  476,
  57,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'd7cfeb76-3039-5914-99d0-95be3e4739d4',
  NULL,
  'Pure Equanimity',
  'The fourth jhāna',
  'from-slate-400 to-gray-500',
  '45-60 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet, undisturbed space',
  '''With the abandoning of pleasure and pain, and with the previous passing away of joy and grief, one enters and dwells in the fourth jhāna, which has neither-pain-nor-pleasure and has purity of mindfulness due to equanimity.''

The fourth jhāna is the culmination of concentration practice. Here, even pleasure fades, replaced by profound equanimity. The mind is perfectly balanced, still as a deep lake with no wind.

This is advanced territory. Approach with humility and without expectation.

Begin as before: body still, access concentration, allowing whatever depth develops.

If you''re able to establish the earlier jhānas, move through them sequentially. First jhāna: applied thought, sustained thought, rapture, pleasure. Second jhāna: the thought subsides, rapture and pleasure remain. Third jhāna: rapture fades, pleasure and equanimity remain.

Now, in the fourth jhāna, even pleasure fades. What remains is equanimity—perfect balance. Neither pleasant nor unpleasant. Neither leaning toward nor pushing away. Just presence. Just being. The mind is so still that even the breath may seem to stop or become imperceptible.

This state is described as ''purity of mindfulness.'' Mindfulness is so clear, so undisturbed, that it''s like pure water or a polished mirror. Nothing obscures it.

The fourth jhāna is valuable not just as an experience but as a platform. From here, insight can be particularly clear. The mind stabilized in this way can turn to investigate impermanence, suffering, non-self with unusual precision.

If you don''t reach this depth, don''t be discouraged. The concentration path takes years, sometimes decades. What matters is gradual development, not achievement.

Spend the session in whatever depth is available. If fourth jhāna arises, rest there. If not, rest in what is present.

Close by emerging very slowly. The fourth jhāna is profound; rushing out can be jarring. Take many minutes to return to ordinary awareness.

The Buddha said that one who develops these states lives in happiness here and now, and creates the conditions for wisdom. Whatever your progress today, you''re walking this path.',
  'Complete stillness',
  100,
  '{}',
  '{"focus","clarity","letting-go"}',
  41,
  55,
  162,
  88,
  19,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'b3782e46-c72b-5b13-9c60-642e290982ee',
  NULL,
  'Seeing Impermanence',
  'Everything changes',
  'from-slate-500 to-gray-700',
  '30-35 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  '''All conditioned things are impermanent.'' (Sabbe sankhārā aniccā.) This is the first of the three characteristics—the marks of all existence. Today we see impermanence directly.

Settle into your seat. Establish concentration with the breath. You''ll need a stable base for insight work.

Now, turn attention to the flow of experience. Choose any sense door—sounds, sensations, thoughts.

Notice a sound. Any sound—the hum of electricity, distant traffic, your own breathing. Watch it: the sound arises, exists for its moment, and passes. It''s gone. Another sound takes its place, then it too vanishes.

Notice a sensation in the body. Watch it closely. It seems stable, but is it? Look more carefully. The sensation flickers, pulses, shifts. It''s not a thing but a process—constantly arising and passing, faster than you usually notice.

Notice a thought. The moment you notice it, watch it dissolve. Thoughts arise uninvited and vanish unasked. Where did that thought come from? Where did it go? Can you find it now?

This is impermanence (anicca). Not as a concept—you already know conceptually that things change. But as direct perception. You''re seeing the momentary nature of experience, the arising and passing that underlies all phenomena.

Deepen the observation. See how even your sense of ''self'' is impermanent—a series of moments, each fresh, each passing. The ''you'' of a moment ago is gone. The ''you'' of this moment is already fading.

This seeing is not pessimistic. Impermanence means freedom—nothing is fixed, nothing imprisons you permanently, every moment is a fresh start. It means relief—even suffering passes. It means urgency—this precious life won''t last.

Spend the remaining time simply watching phenomena arise and pass. Don''t label or analyze—just see the flow.

Close by sitting in the space that this seeing opens. Impermanence is not a problem to solve but a truth to embrace. When you see it clearly, grasping relaxes and freedom dawns.',
  'Direct insight',
  50,
  '{}',
  '{"letting-go","clarity","emotions"}',
  62,
  99,
  354,
  37,
  17,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '46dc4c96-2337-542f-8729-696635afb639',
  NULL,
  'The Nature of Suffering',
  'Understanding dukkha',
  'from-amber-600 to-red-700',
  '30-35 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  '''All conditioned things are unsatisfactory.'' (Sabbe sankhārā dukkhā.) The second characteristic is often translated as ''suffering,'' but dukkha is broader—it includes dissatisfaction, unreliability, the incapacity of anything conditioned to provide lasting satisfaction.

Settle into your seat. Establish breath awareness. Let the mind become stable.

Now, contemplate dukkha. Not to become depressed, but to understand.

First, obvious suffering: pain, illness, loss, grief. You''ve experienced these. Everyone has. This is dukkha in its most visible form.

But the Buddha pointed to subtler dukkha. Even pleasant experiences contain it—not because they''re painful, but because they end. The joy of reunion contains the dukkha of impending separation. The pleasure of eating contains the dukkha of inevitably finishing. Every high contains the seed of its decline.

Subtler still: the constant effort of maintaining a self. Right now, there''s subtle work happening—the mind constructing a coherent ''you,'' defending positions, seeking approval, avoiding threats. This effort is dukkha—a constant low-grade stress that underlies ordinary consciousness.

Notice it now. Beneath whatever surface experience is present, is there an undertone of not-quite-rightness? A sense that this moment should be slightly different? A reaching for what''s not here? This is the dukkha of conditioned existence.

This sounds grim, but seeing dukkha clearly is liberating. When you stop expecting conditioned things to provide what they can''t provide, you stop being disappointed. When you see that the self-construction is optional, you can let it rest.

The Buddha didn''t teach dukkha to create despair. He taught it as a diagnosis: this is why you suffer. With accurate diagnosis, treatment becomes possible. The treatment is the path—the very practice you''re doing.

Spend the remaining time simply observing experience, noticing any quality of unsatisfactoriness. Not creating dukkha—it''s already there—but recognizing it.

Close by recognizing: seeing dukkha clearly is the first step to its end. The Buddha''s third noble truth is cessation—there is a way beyond.',
  'Understanding suffering',
  50,
  '{}',
  '{"clarity","emotions","letting-go"}',
  37,
  14,
  348,
  20,
  11,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '4e5d7c7c-df2b-5450-ba1b-511080511787',
  NULL,
  'The Question of Self',
  'Investigating anattā',
  'from-purple-500 to-indigo-700',
  '35-40 mins',
  'Vipassana',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  '''All phenomena are non-self.'' (Sabbe dhammā anattā.) The third characteristic is the most radical: there is no fixed, unchanging self to be found anywhere in experience.

This is not a belief to adopt but a truth to investigate. Approach with genuine inquiry, not predetermined conclusions.

Settle into your seat. Establish concentration. You''ll need a stable, clear mind for this investigation.

Now, look for the self. Where is it?

Is the self the body? But the body changes constantly—cells die and replace, sensations come and go. Which body is ''you''? The one from childhood? Yesterday? This moment? The body is more like a river than a thing.

Is the self the feelings? But feelings arise and pass based on conditions. Pleasant feeling now, unpleasant later. These come and go—they can''t be a permanent self.

Is the self the thoughts? But thoughts appear without your choosing them. Can you control the next thought that arises? If thoughts were ''you,'' you could control them. Thoughts are more like weather—arising based on conditions, passing through.

Is the self the awareness that knows all these? This is subtler. But even awareness changes—sometimes clear, sometimes dull, different in sleep than in waking. Can you find a stable, unchanging awareness?

What actually happens when you look? Experiences arise and pass. There''s a sense of continuity, but it''s constructed from memory and projection. There''s no unchanging entity to be found—only process, flow, moment-to-moment arising.

This can be disorienting. Who''s meditating if there''s no self? But notice: experience continues. Awareness continues. Compassion continues. What falls away is the illusion of a separate, permanent entity—and with it, so much suffering.

The Buddha said this seeing, fully mature, is liberation. Not annihilation—you''re not disappearing. Just accurate seeing. What you thought you were, you''re not. What you actually are is more mysterious and more free.

Spend the remaining time in open inquiry. Not reaching for conclusions—just looking.

Close by resting in whatever remains when you stop constructing. This too is you—or more accurately, this is.',
  'Self-investigation',
  50,
  '{}',
  '{"clarity","letting-go","emotions"}',
  22,
  8,
  26,
  3721,
  77,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '7606701a-39de-55bf-8496-e3c58981c155',
  NULL,
  'Arising and Passing',
  'Moment-to-moment reality',
  'from-teal-400 to-cyan-600',
  '35-40 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  '''One contemplates the nature of arising in phenomena... the nature of passing away in phenomena... the nature of both arising and passing away in phenomena.''

This is the direct observation of change—not conceptual understanding but moment-to-moment seeing of how experience actually occurs.

Settle into your seat. Establish concentration. The clearer the mind, the more subtle the observation.

Now, observe any experience—a sensation, a sound, a thought. Watch its arising. Where does it come from? One moment it wasn''t there; the next it is. What''s the first instant of its appearance?

Watch its duration. How long does it actually last? Seconds? Or is what you''re calling ''one experience'' actually a rapid succession of moments?

Watch its passing. Where does it go? One moment it''s there; the next it''s not. Can you catch the exact instant it vanishes?

As concentration deepens, the observation becomes finer. What seemed like continuous experience reveals itself as discontinuous—a series of rapid pulses, each arising and passing too fast to normally perceive.

This is sometimes called the ''knowledge of arising and passing'' (udayabbaya-ñāṇa). In traditional frameworks, it''s a significant milestone on the insight path. When it''s clear, there''s often joy, light, confidence—signs that practice is maturing.

But don''t seek special experiences. Simply observe: arising, passing. This breath arises, passes. This sensation arises, passes. This thought arises, passes. The one who observes... is that arising and passing too?

You may find that with clear observation, the solidity of experience dissolves. What seemed like ''things'' reveal themselves as processes. What seemed permanent reveals itself as momentary. This is insight—not intellectual understanding but direct seeing.

Spend the remaining time in continuous observation of arising and passing. Not trying to achieve anything—just seeing what''s true.

Close by recognizing: you''re seeing reality more clearly than most humans ever do. This seeing, accumulated over time, rewires the mind toward freedom.',
  'Refined seeing',
  50,
  '{}',
  '{"clarity","focus","letting-go"}',
  1,
  2,
  34,
  419,
  54,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '109f9b1e-7d96-5b01-9b61-df0689097ea7',
  NULL,
  'Disenchantment',
  'The turning away',
  'from-gray-500 to-slate-700',
  '35-40 mins',
  'Vipassana',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'As insight deepens, something shifts. Having seen impermanence, suffering, and non-self clearly, the mind naturally turns away from its usual fixations. This is nibbidā—usually translated as ''disenchantment'' or ''dispassion.''

This isn''t depression. It''s the fading of false promises—the recognition that conditioned things can''t provide what we''ve been seeking from them.

Settle into your seat. Establish concentration and begin observing the three characteristics.

As you watch experience arise and pass, ask: where is the lasting satisfaction in this? Each moment vanishes almost as soon as it appears. Each pleasure fades. Each achievement becomes yesterday''s news.

This isn''t pessimism—it''s accurate assessment. We''ve spent our lives seeking happiness in conditioned things that can''t provide it. Seeing this clearly, the grip relaxes. The seeking slows.

Notice if there''s a quality of tiredness or weariness arising. Not physical tiredness—a kind of exhaustion with the pursuit, with the constant reaching for what can''t be held. This is nibbidā.

Let this arise naturally from the seeing. Don''t manufacture disenchantment—that would be another form of self-manipulation. Simply observe, and let the implications land.

With disenchantment comes a strange relief. The burden of maintaining illusions lightens. The pressure to find happiness in the right experience, the right achievement, the right relationship—it eases. You''re not giving up on life; you''re giving up on a strategy that never worked.

The Buddha described this as a bird that''s been carrying a rock finally letting it go. The bird can fly now. The weight wasn''t inherent—it was held.

Spend the remaining time in observation, letting whatever arises come and go. If disenchantment arises, let it be there. If not, continue the clear seeing that leads to it.

Close by recognizing: disenchantment precedes liberation. The mind that stops seeking in wrong places becomes available for what''s actually here.',
  'Release of seeking',
  100,
  '{}',
  '{"letting-go","clarity","emotions"}',
  7,
  0,
  0,
  68,
  20,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'b08fc690-a740-5d2e-aa19-f34bc71d6865',
  NULL,
  'Release',
  'Glimpses of freedom',
  'from-sky-300 to-blue-500',
  '40-50 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet, undisturbed space',
  'We complete the insight course by opening to release—vimutti, liberation. Not as something to achieve, but as what''s already present when grasping ceases.

This is advanced practice. Approach without expectation. Whatever happens is the right thing.

Settle deeply. Let the body calm completely. Let concentration develop. Then turn to insight.

Observe the three characteristics: impermanence, suffering, non-self. Let the seeing be clear, continuous, penetrating. Don''t theorize—look.

As insight matures, there may be moments where grasping relaxes profoundly. The self-construction pauses. The usual commentary stops. What remains is... difficult to describe. Open. Awake. Unconditioned.

These moments might be brief—flashes that come and go. Or they might extend. Traditional texts describe this as ''knowledge of equanimity toward formations'' (sankhārupekkhā-ñāṇa)—a profound balance where experience arises and passes without any resistance.

From this balance, deeper release can occur. The Buddha called the deepest release ''the unconditioned,'' ''nibbāna,'' ''the deathless.'' These words point beyond words—to what remains when all fabrication ceases, even momentarily.

Don''t seek this as an experience. Seeking is grasping, and grasping is precisely what obscures release. Simply see clearly, maintain equanimity, and let go. Let go even of letting go.

If release occurs, you''ll know it—there will be a shift, a recognition, a peace beyond the peace of concentration. If it doesn''t occur, continue the practice without disappointment. The path is gradual; this session is one step among many.

The Buddha guaranteed: one who walks this path correctly will realize its goal. Not because of magic, but because clear seeing naturally dissolves confusion. You''re doing the work. Trust the process.

Spend the remaining time in whatever the deepest available practice is. Insight, concentration, simple presence—let the session unfold.

Close by recognizing that whatever degree of freedom you''ve touched is real. Carry it forward. Let it inform how you meet the rest of your day, your life.',
  'Liberation glimpsed',
  100,
  '{}',
  '{"letting-go","clarity","emotions"}',
  10,
  15,
  53,
  179,
  32,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '4544d9b6-9c6d-5d03-9c75-5d7a61cbae92',
  NULL,
  'Mindfulness as Foundation',
  'The factor that enables all others',
  'from-emerald-400 to-teal-600',
  '25-30 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'The seven factors of awakening (bojjhaṅga) are qualities that, when developed and balanced, lead to liberation. The first is mindfulness (sati)—without it, the others cannot arise.

Mindfulness is the capacity to be aware of experience as it happens. Not lost in thought about the past or future, but present with what''s actually occurring. Simple, but powerful.

Settle into your seat. This session is about stabilizing mindfulness itself.

Begin with the body. Be aware that you''re sitting. Feel the body from the inside. Know posture, breath, sensation. Simple mindfulness of body.

Expand to include feelings. Know the feeling tone of this moment—pleasant, unpleasant, or neutral. Not judging, just knowing.

Expand to include the mind. What''s the quality of awareness right now? Clear or foggy? Calm or restless? Just know.

Expand to include all experience. Whatever arises—sounds, thoughts, sensations—know it as it happens. This is open mindfulness, inclusive of everything.

Mindfulness has a quality of being ''established''—steady, continuous, unhurried. It''s not effortful noticing but relaxed awareness. Practice resting in this knowing.

When mindfulness is stable, the other awakening factors have a foundation. Investigation can occur because you''re aware of what you''re investigating. Energy arises because you see what needs attention. Without mindfulness, we''re just lost in experience.

The Buddha said mindfulness is always beneficial—there''s no situation where more mindfulness causes harm. It''s the universal factor, needed in every moment.

Spend this session cultivating steady, continuous mindfulness. Not straining—resting in awareness. Not achieving—simply knowing what''s present.

Close by appreciating this quality. Mindfulness is the beginning and the foundation. With it established, the path unfolds naturally.',
  'Establishing awareness',
  100,
  '{}',
  '{"focus","clarity","morning"}',
  97,
  65,
  665,
  42,
  20,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '711ae1c5-4899-5826-82eb-bee50d623aa0',
  NULL,
  'Investigation and Energy',
  'Active engagement',
  'from-amber-400 to-orange-600',
  '25-30 mins',
  'Vipassana',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'The second and third awakening factors are investigation of states (dhammavicaya) and energy (vīriya). These are the active, arousing factors that balance the calming ones.

Investigation is not intellectual analysis. It''s the quality of looking closely, examining experience, seeking to understand. When the Buddha tells us to know impermanence, we investigate—we look.

Energy is the effort that sustains practice. Not strain, but engaged presence. The willingness to stay with difficult observations, to return when distracted, to maintain continuity.

Settle into your seat. Establish mindfulness.

Now, investigate. Choose any aspect of experience and look closely. What''s actually happening with this breath? Not conceptually—directly. What''s this sensation made of? Is it solid or flickering? Where are its edges?

Bring energy to the looking. Don''t fall into passive drifting—actively engage. Adjust your posture if needed. Open the eyes slightly if dullness approaches. Investigation requires alertness.

Notice when energy flags. The mind starts to drift, attention softens. This is the moment for renewal. Reconnect with the intention to know. Arouse interest in what''s right here.

Notice when investigation becomes mechanical. Just going through motions, not actually seeing. Refresh the looking. What''s actually here? What haven''t you noticed?

These factors work together. Investigation without energy becomes passive. Energy without investigation becomes blind effort. Together, they form an engaged, intelligent presence.

The Buddha said that when these factors are developed, they lead to direct knowledge. Not belief based on reading or hearing—knowledge from your own investigation, sustained by your own energy.

Spend the session alternating between investigation and noticing your energy level. Let them support each other.

Close by appreciating these qualities. They make enlightenment possible—not as grace from above, but as the fruit of your own effort to see clearly.',
  'Active inquiry',
  100,
  '{}',
  '{"focus","clarity","morning"}',
  23,
  2,
  67,
  60,
  19,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '7e0a47bb-b917-5c60-894f-3009a2b9336d',
  NULL,
  'Rapture and Tranquility',
  'The fruits of practice',
  'from-rose-400 to-pink-600',
  '25-30 mins',
  'Breath Awareness',
  'Seated (cushion)',
  'Anytime',
  'Quiet indoor space',
  'The fourth and fifth awakening factors are rapture (pīti) and tranquility (passaddhi). These arise naturally when practice matures—they''re not goals to achieve but fruits to receive.

Rapture is energetic joy—tingling, lightness, waves of pleasure. Tranquility is calm—body settled, mind quiet, a deep peace.

Settle into your seat. Establish mindfulness. Let the body calm through the breath.

As practice continues, notice if any pleasantness arises. It might be subtle—just a slight sense of well-being. Or it might be stronger—distinct waves of pleasant feeling. This is pīti beginning to arise.

Don''t chase it. The grasping after rapture prevents it. Just continue your practice and let it come or not come.

If rapture arises, notice its quality. Is it energetic? Bubbly? Expansive? Let it be there without clinging to it. It will intensify on its own or fade—either is fine.

As the session continues, rapture often settles into tranquility. The excitement fades; what remains is calm. This is passaddhi—the body deeply relaxed, the mind quiet and stable.

These states are not just pleasant; they''re functional. Rapture gives energy to continue practice. Tranquility provides the stability for clear insight. They''re not entertainment—they''re tools.

The Buddha said that a mind with these factors present is ''malleable, workable''—ready for whatever comes next. From this state, investigation and concentration are more effective.

Spend the session allowing whatever arises. If rapture or tranquility appear, rest in them. If not, continue with breath or body awareness. The factors arise based on conditions; your job is to create the conditions through patient practice.

Close by appreciating whatever quality is present. Even ordinary calm is valuable. Even subtle pleasantness counts. You''re cultivating a mind capable of awakening.',
  'Receiving the fruits',
  100,
  '{}',
  '{"focus","stress","emotions"}',
  171,
  141,
  812,
  468,
  56,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '80ef954d-956e-58c5-8dda-bb03e7ac1ddc',
  NULL,
  'Concentration and Equanimity',
  'Stability and balance',
  'from-slate-400 to-gray-600',
  '30-35 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet indoor space',
  'The sixth and seventh awakening factors are concentration (samādhi) and equanimity (upekkhā). These are the stabilizing, calming factors that balance the arousing ones.

Concentration is unified mind—attention gathered rather than scattered. Equanimity is balance—not swayed by attraction or aversion.

Settle into your seat. Establish mindfulness. Let the earlier factors develop as they will.

Now, cultivate concentration. Choose an object—the breath, a sensation, a mental image—and gather attention onto it. Let other experiences fade to the periphery. One object, one focus.

As concentration develops, the mind becomes unified. Instead of fragmentation, there''s coherence. Instead of jumping around, there''s stability. Rest in this gathering.

With stable concentration, equanimity naturally arises. The concentrated mind doesn''t chase pleasant experiences or flee unpleasant ones. It can rest with whatever appears, balanced and at ease.

Equanimity is not indifference. You''re not checked out or numb. You''re fully present, but not reactive. Experience arises; it''s known; it passes. No problem.

Notice if there''s attachment to pleasant states—the pleasant experiences themselves, or the pleasure of concentration. Equanimity includes these too: enjoying without grasping, appreciating without clinging.

Notice if there''s aversion to unpleasant states—discomfort in the body, restlessness of mind. Equanimity includes these: allowing without fighting, present without pushing away.

The Buddha described equanimity as the culmination of the awakening factors. When all seven are present and balanced—mindfulness, investigation, energy, rapture, tranquility, concentration, equanimity—the conditions for liberation are complete.

Spend the session developing concentration and resting in equanimity. Not striving for perfection—just inclining the mind in this direction.

Close by appreciating the balance. These factors, developed together, create a mind capable of seeing and releasing. You''re closer than you know.',
  'Complete balance',
  100,
  '{}',
  '{"focus","clarity","letting-go"}',
  164,
  97,
  826,
  19,
  10,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  'bd7873a0-cf27-5b8c-8777-c9777fbf0560',
  NULL,
  'The Balanced Path',
  'All factors integrated',
  'from-purple-400 to-indigo-600',
  '35-45 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet, undisturbed space',
  'We complete this course by bringing all seven awakening factors into dynamic balance. This is the mature practice—not cultivating factors separately but letting them work together as an integrated whole.

Settle into your seat. Take whatever time is needed to arrive.

Begin with mindfulness—the foundation. Establish clear, continuous awareness of whatever is present.

From this base, let investigation arise. Look closely at experience. What''s actually here? Not concepts—direct seeing.

Let energy support the investigation. Stay engaged, alert, interested. When attention flags, renew it.

If conditions allow, rapture may arise—the pleasant fruit of engaged practice. Let it be there without grasping.

As rapture settles, let tranquility develop—the calm body, the quiet mind.

From tranquility, let concentration deepen—the unified, gathered quality of attention.

And throughout, let equanimity pervade—the balanced acceptance of whatever arises.

These factors are not seven separate things. They''re aspects of one integrated state. When they''re all present, they support each other. Mindfulness enables investigation. Energy sustains it. Rapture and tranquility make it pleasant. Concentration gives it depth. Equanimity gives it balance.

The Buddha described this as ''the path to the unconditioned.'' Not just pleasant meditation—the actual means of liberation.

Notice which factors are strong and which are weak. If the mind is dull, arouse investigation and energy. If the mind is restless, emphasize tranquility and equanimity. The art of practice is this balancing.

Spend the remaining time in this integrated state. Let the factors dance together. Let them lead you deeper than any single factor could.

Close by recognizing: you''ve practiced what countless practitioners have practiced. You''ve walked the path the Buddha walked. Whatever your progress today, you''re moving toward freedom.

The seven factors complete. Carry them with you.',
  'Complete integration',
  100,
  '{}',
  '{"focus","clarity","letting-go"}',
  26,
  16,
  29,
  235,
  35,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '0efd10a7-42e7-5f84-9c60-e260351f6222',
  NULL,
  'Walking Meditation',
  'Movement as stillness',
  'from-emerald-400 to-green-600',
  '20-30 mins',
  'Walking Meditation',
  'Walking',
  'Anytime',
  'Indoor path or outdoor trail',
  'Walking meditation (caṅkama) is formal practice in motion. The Buddha often taught while walking and recommended walking as an essential practice.

Find a path where you can walk back and forth—20-30 steps is ideal. Outdoors is wonderful if available; indoors works fine.

Stand at one end. Feel your feet on the ground. Notice the body standing—vertical, balanced, alive.

Begin walking very slowly. Much slower than normal walking. You''re not going anywhere; each step is complete in itself.

Feel the lifting of the foot. The movement through space. The placing down—heel, then ball, then toes. The shifting of weight. The other foot lifting.

Break the walk into parts. ''Lifting... moving... placing.'' Or even simpler: ''Left... right... left...'' The noting helps maintain continuity.

When you reach the end of your path, stand still. Feel the stopping. Then turn slowly, feeling the rotation of the body. Stand again. Then resume walking.

The mind will wander, just as in sitting. When you notice you''re lost in thought, return to the feet. Feel the contact, the movement, the living process of walking.

Walking meditation has unique benefits. It integrates practice with movement, bridging formal sitting and daily life. It energizes when you''re drowsy. It grounds when you''re restless.

Notice how walking can be complete presence. Each step is an arrival, not a means to an end. Where would you rather be than right here, in this step, in this moment?

Spend 20-30 minutes in formal walking. At the end, stand still for a minute, feeling the transition back to stillness.

Close by recognizing: every step you take, for the rest of your life, can be meditation. The practice is available whenever you''re on your feet.',
  'Moving presence',
  0,
  '{}',
  '{"body-awareness","focus","beginners"}',
  1,
  0,
  14,
  37,
  17,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '0a8df91b-9db1-53d0-a113-11e8f0fe82c3',
  NULL,
  'Mindfulness in Action',
  'Every activity is practice',
  'from-amber-400 to-yellow-600',
  '15-20 mins guidance + informal practice',
  'Open Awareness',
  'Seated (chair)',
  'Morning',
  'Any',
  'The Buddha didn''t teach meditation only for the cushion. He taught mindfulness in every activity—eating, drinking, walking, talking, urinating, defecating, sleeping, waking.

This session prepares you to bring practice into daily life.

Sit for a few minutes and establish mindfulness. Feel the body, know the breath, settle the mind.

Now, consider your day ahead. What activities will you do? Eating breakfast. Commuting. Working. Talking with colleagues. Household tasks. Each of these can be practice.

Choose one activity to bring special mindfulness to today. It might be drinking your morning beverage. It might be washing dishes. It might be a specific conversation. Choose something you do regularly.

When you do this activity, do it with full presence. If it''s drinking tea: feel the cup in your hands—its weight, its warmth. See the liquid. Smell it. Raise the cup slowly, feeling the movement. Let the tea enter your mouth, tasting it fully. Feel the swallowing. Feel the warmth in your belly.

This is how any activity can be done. Not rushing to finish, not lost in thought about something else. Fully present with what''s actually happening.

The gap between ''meditation'' and ''life'' is artificial. When you''re mindful eating, that''s meditation. When you''re mindful walking to the car, that''s practice. When you''re mindful listening to a friend, that''s the path.

The Buddha spent much of each day in ordinary activities—eating, walking, meeting with people. He was practicing continuously. The formal sitting was part of a seamless whole.

Set the intention: today, I''ll bring full presence to this one activity. Not the whole day—that''s overwhelming. Just one thing. Master that, then expand.

Close by recognizing: the cushion is training; life is the field. What you develop in formal practice, you apply everywhere. This is how meditation transforms.',
  'Life as practice',
  0,
  '{}',
  '{"focus","beginners","morning"}',
  28,
  22,
  257,
  326,
  47,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '6b4b425a-863c-53cc-a883-528cfe91a51e',
  NULL,
  'Relational Presence',
  'Mindfulness with others',
  'from-rose-400 to-pink-600',
  '20-25 mins',
  'Loving-Kindness',
  'Seated (chair)',
  'Morning',
  'Quiet space',
  'Much of life happens with others—conversations, meetings, shared moments. Can we bring the same quality of presence to relationships that we bring to the cushion?

Settle into your seat. Establish mindfulness with the breath.

Now, bring to mind a person you''ll see today. A colleague, a family member, a friend. See them in your mind—their face, their way of being.

Consider: when you''re with this person, where is your attention usually? Often, we''re half-present—thinking about what we''ll say next, judging what they said, drifting to other concerns.

Imagine being with this person with full presence. Listening without preparing your response. Seeing them without the filter of past impressions. Being with them as they actually are, in this moment.

This is harder than solo meditation. Another person is unpredictable, triggering, complicated. But the practice is the same: notice when attention wanders, return to presence.

Add loving-kindness. Silently, while listening to someone, you can hold the intention: ''May you be happy. May you be at peace.'' This doesn''t interrupt listening—it infuses it with care.

Notice your own reactivity. When someone says something that irritates, can you feel the irritation without acting on it? When someone is boring, can you be present without checking out? These are opportunities.

The Buddha emphasized wise speech as part of the path: speaking truthfully, kindly, usefully, at the right time. Mindful listening enables wise speech—you respond to what''s actually being said, not to your projections.

Set an intention for a specific conversation today. ''When I talk to _____, I''ll practice full presence. I''ll listen more than I speak. I''ll notice my reactions without being run by them.''

Close by recognizing: relationships are the advanced class. They''re where practice gets tested and deepened. Welcome the challenge.',
  'Aware connection',
  20,
  '{}',
  '{"self-compassion","emotions","focus"}',
  59,
  63,
  510,
  26,
  13,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

INSERT INTO public.session_templates (
  id, user_id, title, tagline, hero_gradient, duration_guidance,
  discipline, posture, best_time, environment, guidance_notes,
  intention, recommended_after_hours, tags, intent_tags,
  karma, saves, completions, creator_hours, creator_voice_score, course_id, course_position
) VALUES (
  '2e577555-b574-5183-8ca7-9825502daae6',
  NULL,
  'The Seamless Day',
  'Waking to sleeping as practice',
  'from-indigo-400 to-violet-600',
  '20-25 mins',
  'Open Awareness',
  'Seated (cushion)',
  'Morning',
  'Quiet space',
  'We complete this curriculum by envisioning what it means to live an entire day as practice. Not perfection—presence. Not constant meditation—continuous availability to this moment.

Settle into your seat. Establish mindfulness.

Imagine waking tomorrow. The first moment of consciousness—can you catch it? Even before you know who you are, where you are, there''s awareness. Start there.

Feel the transition from sleep to waking. The body gradually engaging. The mind assembling its stories. Before you check your phone, before you think about the day—just breathe. Start the day with presence.

Imagine moving through morning routines with mindfulness. Not rushing through to get somewhere else. Showering: feeling water. Eating: tasting food. Dressing: touching fabric. Each activity complete in itself.

Imagine working with presence. Whatever your work—typing, building, serving, creating—doing it with attention. When the mind wanders to worries or distractions, noticing and returning. The work itself as practice.

Imagine encountering difficulties mindfully. The frustration, the disappointment, the stress—felt, known, not suppressed. Not becoming the difficulty, but holding it in awareness. Responding rather than reacting.

Imagine evening as practice. Eating dinner with care. Conversations with presence. Rest with awareness. Not collapsing into unconscious consumption, but choosing how you spend your precious hours.

Imagine lying down to sleep. Reviewing the day—not with judgment, but with interest. What did you learn? Where did you lose presence? Where did you find it? Offering gratitude for the day, whatever it held.

Imagine consciousness fading into sleep. Even this can be noticed—the gradual dimming, the letting go. Practice continues even into dreams.

This is the seamless day. Not special states, but ordinary life, lived with extraordinary attention. This is what the Buddha pointed to: not escape from life, but full presence with it.

Close by committing: today, I''ll practice living this way. Not perfectly—that''s not the point. But intentionally. Knowing that each moment of presence is the path itself, not preparation for something else.

The curriculum is complete. The practice continues.',
  'Complete presence',
  20,
  '{}',
  '{"focus","morning","clarity"}',
  14,
  11,
  53,
  50,
  17,
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  guidance_notes = EXCLUDED.guidance_notes,
  intent_tags = EXCLUDED.intent_tags,
  karma = EXCLUDED.karma,
  saves = EXCLUDED.saves,
  completions = EXCLUDED.completions,
  creator_voice_score = EXCLUDED.creator_voice_score;

-- ============================================
-- ID MAPPING REFERENCE
-- ============================================

-- Sessions (first 20):
-- fc68ad3a-1af8-5c3f-beda-0b61f80ede74 -> 61fcdd00-833b-5527-a4fa-de193d8ead79
-- 6f3836dd-7fb6-5fe4-81cb-92cf6942650f -> 3ebd77a4-56cf-56a9-a5d5-615e01d15aff
-- 5daf3801-206f-5b47-8323-728e7f22c6d4 -> 24cf2299-99ec-59ab-9822-0c9b1cd69591
-- 86273986-4db7-5e9d-8a32-235b6bb9051b -> b3d2e372-366c-5eb5-b35f-6e257615a880
-- d289969c-c889-5a3f-b001-4ca35ea11364 -> e2283be3-46e0-5193-8ea8-952354e8a4af
-- fbeeac9a-dae8-5d95-98d6-5c98205b7798 -> b97e45ca-d095-58e8-b5dd-3aa8052fd370
-- 25961543-231d-5d56-99bd-2e44f0209895 -> 67577fe3-1d26-5f73-b2f5-d1e51bb88056
-- 2cd4aa9c-31fc-50c3-b165-f1f39622db66 -> ca913887-5f8c-566d-8474-d21705de1736
-- b73d6c0b-e6bb-51d1-99b9-ae637e6e6788 -> 3ad8e5ab-0810-57e9-b0b1-dd03da326612
-- da132f0b-315a-5a9a-84e2-c564badf3129 -> 10e10d0f-909b-582d-93d3-e6c8d12c8adc
-- 69aa045b-ced8-55de-b651-45b0bb027eff -> 41e49a1e-0edf-5d25-97a6-cfc3393f897d
-- 37d7e48f-02db-5f4f-b451-56496f1f8b99 -> f337be52-fc20-5b63-bea9-5214d1176b6d
-- dab9c033-87d9-59da-ab83-7f6755f0584e -> d22d1be2-4cae-5657-a614-2997bdd0ff20
-- 9cc6f490-69a7-58d7-91d6-e4b8dd5635a4 -> 113025e5-e158-5f92-b9c8-573c642f878f
-- 195ed675-c8a9-508b-90f9-be171a456057 -> 5c170331-baff-54ee-9d00-61d61d799a03
-- 9a7b11e2-e638-577f-a6f2-f38c55d9bc64 -> a5d1048f-61f3-5452-99ac-668d144bc753
-- ed02cf3d-7920-5adc-97f6-9c0752ff84bf -> 097de5b9-8355-51ad-9c65-78e0a268e58f
-- 0708b6e0-2a2a-5224-83a3-f5e6f27826c2 -> 1c73aecd-1433-559c-aa63-1e4d8caa95cf
-- 9ad841f3-2b4e-5d7b-ad46-7c85b3b348fe -> eb582dbb-f476-59da-9358-237e478f1cec
-- d8f32e38-cf88-59e4-b651-1779f51daa64 -> 858e5ec9-1691-549e-8b94-2b28cfe76f73
-- ... and 141 more

-- Migration complete!
-- Total: 161 sessions
