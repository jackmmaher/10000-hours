-- ============================================
-- REVIEWS TABLE FOR STILL HOURS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create the reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating DECIMAL(3,2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL CHECK (char_length(text) >= 10 AND char_length(text) <= 500),
  author_name TEXT NOT NULL CHECK (char_length(author_name) >= 2 AND char_length(author_name) <= 50),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  approved BOOLEAN DEFAULT false NOT NULL,
  is_seed BOOLEAN DEFAULT false NOT NULL
);

-- 2. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reviews_approved_rating ON public.reviews (approved, rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Anyone can read approved reviews (for paywall display)
CREATE POLICY "Anyone can read approved reviews"
  ON public.reviews
  FOR SELECT
  USING (approved = true);

-- Authenticated users can insert their own reviews
CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own reviews (even if not approved)
CREATE POLICY "Users can read own reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Seed with 25 prepopulated reviews (all approved, is_seed = true)
-- These serve as initial social proof and baseline content

INSERT INTO public.reviews (rating, text, author_name, approved, is_seed, created_at) VALUES
-- NO SUBSCRIPTION FATIGUE (5 reviews)
(5.00, 'Finally, no more forgetting to cancel. I pay for what I use.', 'Sarah M.', true, true, NOW() - INTERVAL '45 days'),
(5.00, 'No guilt trips about unused subscriptions. This just makes sense.', 'Michael T.', true, true, NOW() - INTERVAL '42 days'),
(4.75, 'Love that my hours never expire. I meditate on my own schedule.', 'Emma K.', true, true, NOW() - INTERVAL '38 days'),
(5.00, 'Stopped paying for apps I barely used. This model is refreshing.', 'David L.', true, true, NOW() - INTERVAL '35 days'),
(4.50, 'Perfect for sporadic meditators. No wasted monthly fees.', 'Rachel H.', true, true, NOW() - INTERVAL '32 days'),

-- PRIVACY/OFFLINE (5 reviews)
(5.00, 'Love that my meditation data stays on my device. True privacy.', 'James W.', true, true, NOW() - INTERVAL '30 days'),
(5.00, 'Works perfectly offline. Great for cabin retreats with no signal.', 'Lisa P.', true, true, NOW() - INTERVAL '28 days'),
(4.75, 'No accounts, no tracking, no ads. Just meditation. Refreshing.', 'Chris R.', true, true, NOW() - INTERVAL '25 days'),
(5.00, 'Finally an app that respects my privacy. My practice is personal.', 'Anna S.', true, true, NOW() - INTERVAL '22 days'),
(4.75, 'Data stays mine. That alone is worth it in today''s world.', 'Tom B.', true, true, NOW() - INTERVAL '20 days'),

-- SIMPLICITY (5 reviews)
(5.00, 'So clean and focused. No distracting features or gamification.', 'Jennifer C.', true, true, NOW() - INTERVAL '18 days'),
(5.00, 'Does one thing beautifully: helps me sit and breathe.', 'Mark D.', true, true, NOW() - INTERVAL '16 days'),
(4.75, 'Minimalist design that gets out of the way. Love the aesthetic.', 'Sophie F.', true, true, NOW() - INTERVAL '14 days'),
(5.00, 'No streaks, no badges, no social pressure. Just practice.', 'Kevin G.', true, true, NOW() - INTERVAL '12 days'),
(4.50, 'The app disappears when you meditate. That''s the point.', 'Maria J.', true, true, NOW() - INTERVAL '10 days'),

-- VALUE (5 reviews)
(5.00, 'Way cheaper than Headspace. Same peace of mind, fraction of the cost.', 'Brian N.', true, true, NOW() - INTERVAL '9 days'),
(5.00, '50 hours for less than one month of other apps. No brainer.', 'Laura V.', true, true, NOW() - INTERVAL '8 days'),
(4.50, 'Lifetime option is incredible value. Already saved hundreds.', 'Paul E.', true, true, NOW() - INTERVAL '7 days'),
(5.00, 'Pennies per session. The math just works out better.', 'Diana Q.', true, true, NOW() - INTERVAL '6 days'),
(4.75, 'Best meditation value I''ve found. Actual savings, not marketing.', 'Steven A.', true, true, NOW() - INTERVAL '5 days'),

-- PRACTICE RESULTS (5 reviews)
(5.00, 'Actually meditating more now. The hour tracking motivates me.', 'Nicole U.', true, true, NOW() - INTERVAL '4 days'),
(5.00, 'Built a real daily habit. 6 months and counting.', 'Robert Y.', true, true, NOW() - INTERVAL '3 days'),
(4.75, 'Watching my hours grow is surprisingly satisfying. 100+ now.', 'Karen Z.', true, true, NOW() - INTERVAL '2 days'),
(5.00, 'Sleep improved, stress down. Simple app, real results.', 'Alex I.', true, true, NOW() - INTERVAL '1 day'),
(4.50, 'The voices are exceptional. Found my go-to teacher here.', 'Michelle O.', true, true, NOW());

-- 6. Grant permissions
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT ON public.reviews TO authenticated;

-- ============================================
-- VERIFICATION QUERIES (run after to confirm)
-- ============================================
-- SELECT COUNT(*) FROM public.reviews WHERE is_seed = true;
-- Should return: 25

-- SELECT rating, COUNT(*) FROM public.reviews GROUP BY rating ORDER BY rating DESC;
-- Should show distribution: 5.00 (15), 4.75 (6), 4.50 (4)
