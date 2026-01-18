/**
 * Reviews Service - User review API for paywall social proof
 *
 * Handles saving user reviews and fetching approved reviews
 * for display in the paywall carousel.
 */

import { supabase, isSupabaseConfigured } from './supabase'
import { reviews as fallbackReviews, type Review as LocalReview } from '../data/reviews'

export interface Review {
  id: string
  rating: number
  text: string
  authorName: string
  createdAt: string
}

/**
 * Save a user's review to Supabase
 * Reviews start as unapproved and require moderation
 */
export async function saveReview(
  userId: string,
  rating: number,
  text: string,
  authorName: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase not configured - review not saved')
    return false
  }

  // Validate inputs
  if (rating < 1 || rating > 5) {
    console.error('Invalid rating:', rating)
    return false
  }

  if (text.length < 10 || text.length > 500) {
    console.error('Review text must be 10-500 characters')
    return false
  }

  if (authorName.length < 2 || authorName.length > 50) {
    console.error('Author name must be 2-50 characters')
    return false
  }

  try {
    const { error } = await supabase.from('reviews').insert({
      user_id: userId,
      rating,
      text: text.trim(),
      author_name: authorName.trim(),
      approved: false, // Requires moderation
    })

    if (error) {
      console.error('Failed to save review:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error saving review:', err)
    return false
  }
}

/**
 * Fetch approved reviews for paywall display
 * Returns reviews with rating >= 4.5, ordered by rating then recency
 * Falls back to hardcoded reviews if Supabase unavailable
 */
export async function fetchApprovedReviews(limit = 25): Promise<Review[]> {
  if (!isSupabaseConfigured() || !supabase) {
    // Return hardcoded fallback reviews
    return fallbackReviews.map(localToReview)
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, text, author_name, created_at')
      .eq('approved', true)
      .gte('rating', 4.5)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch reviews:', error)
      return fallbackReviews.map(localToReview)
    }

    if (!data || data.length === 0) {
      // No approved reviews yet, use fallback
      return fallbackReviews.map(localToReview)
    }

    return data.map((row) => ({
      id: row.id,
      rating: parseFloat(row.rating),
      text: row.text,
      authorName: row.author_name,
      createdAt: row.created_at,
    }))
  } catch (err) {
    console.error('Error fetching reviews:', err)
    return fallbackReviews.map(localToReview)
  }
}

/**
 * Convert local fallback review to Review interface
 */
function localToReview(local: LocalReview): Review {
  return {
    id: String(local.id),
    rating: local.rating,
    text: local.text,
    authorName: local.author,
    createdAt: new Date().toISOString(),
  }
}
