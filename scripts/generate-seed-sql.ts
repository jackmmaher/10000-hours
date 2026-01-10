/**
 * Generate SQL to seed content into Supabase
 *
 * This generates SQL INSERT statements that can be run in Supabase SQL editor.
 * This bypasses RLS since SQL editor runs with admin privileges.
 *
 * Run with: npx tsx scripts/generate-seed-sql.ts > scripts/output/seed-content.sql
 */

import { v5 as uuidv5 } from 'uuid'
import sessionsData from '../src/data/sessions.json'
import coursesData from '../src/data/courses.json'

// Namespace UUID for 10,000 Hours app
const NAMESPACE_10K_HOURS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

function seedIdToUUID(seedId: string): string {
  return uuidv5(seedId, NAMESPACE_10K_HOURS)
}

// Build ID mappings
const sessionIdMap = new Map<string, string>()
const courseIdMap = new Map<string, string>()

for (const session of sessionsData) {
  sessionIdMap.set(session.id, seedIdToUUID(session.id))
}
for (const course of coursesData) {
  courseIdMap.set(course.id, seedIdToUUID(course.id))
}

// Escape single quotes for SQL
function escapeSQL(str: string): string {
  return str.replace(/'/g, "''")
}

// Map best_time values to allowed enum values
// Allowed: 'Morning', 'Midday', 'Evening', 'Before sleep', 'Anytime'
function normalizeBestTime(bestTime: string): string {
  const allowed = ['Morning', 'Midday', 'Evening', 'Before sleep', 'Anytime']
  if (allowed.includes(bestTime)) return bestTime
  // Map non-standard values
  if (bestTime.toLowerCase().includes('meal')) return 'Anytime'
  if (bestTime.toLowerCase().includes('night')) return 'Evening'
  return 'Anytime' // Default fallback
}

// Format array for PostgreSQL
function formatArray(arr: string[]): string {
  if (!arr || arr.length === 0) return "'{}'"
  const escaped = arr.map(s => `"${escapeSQL(s)}"`).join(',')
  return `'{${escaped}}'`
}

console.log('-- 10,000 Hours Seeded Content Migration')
console.log('-- Generated: ' + new Date().toISOString())
console.log('-- Run this in Supabase SQL Editor')
console.log('')
console.log('-- This uses UPSERT (ON CONFLICT) to be idempotent')
console.log('')

// NOTE: Courses are not enabled yet - skipping course migration
// When courses are enabled, add course migration here

// Sessions
console.log('-- ============================================')
console.log('-- SESSION TEMPLATES')
console.log('-- ============================================')
console.log('')

for (const session of sessionsData) {
  const uuid = sessionIdMap.get(session.id)!
  const courseUuid = session.course_id ? courseIdMap.get(session.course_id) : null

  console.log(`INSERT INTO public.session_templates (`)
  console.log(`  id, user_id, title, tagline, hero_gradient, duration_guidance,`)
  console.log(`  discipline, posture, best_time, environment, guidance_notes,`)
  console.log(`  intention, recommended_after_hours, tags, intent_tags,`)
  console.log(`  karma, saves, completions, creator_hours, course_id, course_position`)
  console.log(`) VALUES (`)
  console.log(`  '${uuid}',`)
  console.log(`  NULL,`)
  console.log(`  '${escapeSQL(session.title)}',`)
  console.log(`  '${escapeSQL(session.tagline)}',`)
  console.log(`  '${escapeSQL(session.hero_gradient || 'from-emerald-400 to-teal-600')}',`)
  console.log(`  '${escapeSQL(session.duration_guidance)}',`)
  console.log(`  '${escapeSQL(session.discipline)}',`)
  console.log(`  '${escapeSQL(session.posture)}',`)
  console.log(`  '${escapeSQL(normalizeBestTime(session.best_time))}',`)
  console.log(`  ${session.environment ? `'${escapeSQL(session.environment)}'` : 'NULL'},`)
  console.log(`  '${escapeSQL(session.guidance_notes)}',`)
  console.log(`  '${escapeSQL(session.intention)}',`)
  console.log(`  ${session.recommended_after_hours},`)
  console.log(`  ${formatArray(session.tags || [])},`)
  console.log(`  ${formatArray(session.intent_tags || [])},`)
  console.log(`  ${session.seed_karma},`)
  console.log(`  ${session.seed_saves},`)
  console.log(`  ${session.seed_completions},`)
  console.log(`  ${session.creator_hours},`)
  console.log(`  NULL,`)  // course_id - courses not enabled yet
  console.log(`  NULL`)   // course_position - courses not enabled yet
  console.log(`)`)
  console.log(`ON CONFLICT (id) DO UPDATE SET`)
  console.log(`  title = EXCLUDED.title,`)
  console.log(`  tagline = EXCLUDED.tagline,`)
  console.log(`  guidance_notes = EXCLUDED.guidance_notes,`)
  console.log(`  intent_tags = EXCLUDED.intent_tags;`)
  console.log('')
}

// Output ID mapping as comments
console.log('-- ============================================')
console.log('-- ID MAPPING REFERENCE')
console.log('-- ============================================')
console.log('')
console.log('-- Sessions (first 20):')
let count = 0
for (const [oldId, newId] of sessionIdMap) {
  if (count++ >= 20) {
    console.log(`-- ... and ${sessionIdMap.size - 20} more`)
    break
  }
  console.log(`-- ${oldId} -> ${newId}`)
}

console.log('')
console.log('-- Migration complete!')
console.log(`-- Total: ${sessionsData.length} sessions`)
