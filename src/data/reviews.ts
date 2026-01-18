/**
 * User Reviews Data
 *
 * Prepopulated testimonials for social proof on paywall screens.
 * Reviews focus on problems solved rather than feature lists.
 *
 * Distribution:
 * - 5-star: 15 (60%)
 * - 4.75-star: 6 (24%)
 * - 4.5-star: 4 (16%)
 *
 * Categories (5 each):
 * 1. No subscription fatigue
 * 2. Privacy/offline
 * 3. Simplicity
 * 4. Value
 * 5. Practice results
 */

export interface Review {
  id: number
  rating: 5 | 4.75 | 4.5
  text: string
  author: string
}

export const reviews: Review[] = [
  // === NO SUBSCRIPTION FATIGUE (5 reviews) ===
  {
    id: 1,
    rating: 5,
    text: 'Finally, no more forgetting to cancel. I pay for what I use.',
    author: 'Sarah M.',
  },
  {
    id: 2,
    rating: 5,
    text: 'No guilt trips about unused subscriptions. This just makes sense.',
    author: 'Michael T.',
  },
  {
    id: 3,
    rating: 4.75,
    text: 'Love that my hours never expire. I meditate on my own schedule.',
    author: 'Emma K.',
  },
  {
    id: 4,
    rating: 5,
    text: 'Stopped paying for apps I barely used. This model is refreshing.',
    author: 'David L.',
  },
  {
    id: 5,
    rating: 4.5,
    text: 'Perfect for sporadic meditators. No wasted monthly fees.',
    author: 'Rachel H.',
  },

  // === PRIVACY/OFFLINE (5 reviews) ===
  {
    id: 6,
    rating: 5,
    text: 'Love that my meditation data stays on my device. True privacy.',
    author: 'James W.',
  },
  {
    id: 7,
    rating: 5,
    text: 'Works perfectly offline. Great for cabin retreats with no signal.',
    author: 'Lisa P.',
  },
  {
    id: 8,
    rating: 4.75,
    text: 'No accounts, no tracking, no ads. Just meditation. Refreshing.',
    author: 'Chris R.',
  },
  {
    id: 9,
    rating: 5,
    text: 'Finally an app that respects my privacy. My practice is personal.',
    author: 'Anna S.',
  },
  {
    id: 10,
    rating: 4.75,
    text: "Data stays mine. That alone is worth it in today's world.",
    author: 'Tom B.',
  },

  // === SIMPLICITY (5 reviews) ===
  {
    id: 11,
    rating: 5,
    text: 'So clean and focused. No distracting features or gamification.',
    author: 'Jennifer C.',
  },
  {
    id: 12,
    rating: 5,
    text: 'Does one thing beautifully: helps me sit and breathe.',
    author: 'Mark D.',
  },
  {
    id: 13,
    rating: 4.75,
    text: 'Minimalist design that gets out of the way. Love the aesthetic.',
    author: 'Sophie F.',
  },
  {
    id: 14,
    rating: 5,
    text: 'No streaks, no badges, no social pressure. Just practice.',
    author: 'Kevin G.',
  },
  {
    id: 15,
    rating: 4.5,
    text: "The app disappears when you meditate. That's the point.",
    author: 'Maria J.',
  },

  // === VALUE (5 reviews) ===
  {
    id: 16,
    rating: 5,
    text: 'Way cheaper than Headspace. Same peace of mind, fraction of the cost.',
    author: 'Brian N.',
  },
  {
    id: 17,
    rating: 5,
    text: '50 hours for less than one month of other apps. No brainer.',
    author: 'Laura V.',
  },
  {
    id: 18,
    rating: 4.5,
    text: 'Lifetime option is incredible value. Already saved hundreds.',
    author: 'Paul E.',
  },
  {
    id: 19,
    rating: 5,
    text: 'Pennies per session. The math just works out better.',
    author: 'Diana Q.',
  },
  {
    id: 20,
    rating: 4.75,
    text: "Best meditation value I've found. Actual savings, not marketing.",
    author: 'Steven A.',
  },

  // === PRACTICE RESULTS (5 reviews) ===
  {
    id: 21,
    rating: 5,
    text: 'Actually meditating more now. The hour tracking motivates me.',
    author: 'Nicole U.',
  },
  {
    id: 22,
    rating: 5,
    text: 'Built a real daily habit. 6 months and counting.',
    author: 'Robert Y.',
  },
  {
    id: 23,
    rating: 4.75,
    text: 'Watching my hours grow is surprisingly satisfying. 100+ now.',
    author: 'Karen Z.',
  },
  {
    id: 24,
    rating: 5,
    text: 'Sleep improved, stress down. Simple app, real results.',
    author: 'Alex I.',
  },
  {
    id: 25,
    rating: 4.5,
    text: 'The voices are exceptional. Found my go-to teacher here.',
    author: 'Michelle O.',
  },
]
