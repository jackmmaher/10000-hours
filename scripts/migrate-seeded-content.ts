/**
 * Migration Script: Seeded Content to Supabase
 *
 * This script migrates sessions.json and courses.json into Supabase tables.
 * It generates deterministic UUIDs from seed IDs so migrations are idempotent.
 *
 * Run with: npx tsx scripts/migrate-seeded-content.ts
 */

import { v5 as uuidv5 } from 'uuid'
import { createClient } from '@supabase/supabase-js'
import sessionsData from '../src/data/sessions.json'
import coursesData from '../src/data/courses.json'

// Namespace UUID for 10,000 Hours app (generated once, use forever)
const NAMESPACE_10K_HOURS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

// Generate deterministic UUID from seed ID
function seedIdToUUID(seedId: string): string {
  return uuidv5(seedId, NAMESPACE_10K_HOURS)
}

// Build mapping of old IDs to new UUIDs
const sessionIdMap = new Map<string, string>()
const courseIdMap = new Map<string, string>()

// Pre-generate all UUIDs
for (const session of sessionsData) {
  sessionIdMap.set(session.id, seedIdToUUID(session.id))
}
for (const course of coursesData) {
  courseIdMap.set(course.id, seedIdToUUID(course.id))
}

interface SessionRow {
  id: string
  user_id: null
  title: string
  tagline: string
  hero_gradient: string
  duration_guidance: string
  discipline: string
  posture: string
  best_time: string
  environment: string | null
  guidance_notes: string
  intention: string
  recommended_after_hours: number
  tags: string[]
  intent_tags: string[]
  karma: number
  saves: number
  completions: number
  creator_hours: number
  course_id: string | null
  course_position: number | null
}

interface CourseRow {
  id: string
  user_id: null
  title: string
  description: string
  session_count: number
  difficulty: string
  karma: number
  saves: number
}

async function migrate() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('Starting migration...\n')

  // Step 1: Migrate courses first (sessions reference them)
  console.log('=== Migrating Courses ===')
  const courseRows: CourseRow[] = coursesData.map(course => ({
    id: courseIdMap.get(course.id)!,
    user_id: null,
    title: course.title,
    description: course.description,
    session_count: course.session_count,
    difficulty: course.difficulty,
    karma: course.seed_karma,
    saves: course.seed_saves
  }))

  const { error: courseError, data: courseData } = await supabase
    .from('courses')
    .upsert(courseRows, { onConflict: 'id' })
    .select()

  if (courseError) {
    console.error('Course migration error:', courseError)
  } else {
    console.log(`Migrated ${courseRows.length} courses`)
  }

  // Step 2: Migrate sessions
  console.log('\n=== Migrating Sessions ===')
  const sessionRows: SessionRow[] = sessionsData.map(session => ({
    id: sessionIdMap.get(session.id)!,
    user_id: null,
    title: session.title,
    tagline: session.tagline,
    hero_gradient: session.hero_gradient || 'from-emerald-400 to-teal-600',
    duration_guidance: session.duration_guidance,
    discipline: session.discipline,
    posture: session.posture,
    best_time: session.best_time,
    environment: session.environment || null,
    guidance_notes: session.guidance_notes,
    intention: session.intention,
    recommended_after_hours: session.recommended_after_hours,
    tags: session.tags || [],
    intent_tags: session.intent_tags || [],
    karma: session.seed_karma,
    saves: session.seed_saves,
    completions: session.seed_completions,
    creator_hours: session.creator_hours,
    course_id: session.course_id ? courseIdMap.get(session.course_id) || null : null,
    course_position: session.course_position || null
  }))

  // Batch insert in chunks of 50 to avoid payload limits
  const BATCH_SIZE = 50
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < sessionRows.length; i += BATCH_SIZE) {
    const batch = sessionRows.slice(i, i + BATCH_SIZE)
    const { error: sessionError } = await supabase
      .from('session_templates')
      .upsert(batch, { onConflict: 'id' })

    if (sessionError) {
      console.error(`Batch ${i / BATCH_SIZE + 1} error:`, sessionError)
      errorCount += batch.length
    } else {
      successCount += batch.length
      console.log(`Batch ${i / BATCH_SIZE + 1}: Migrated ${batch.length} sessions`)
    }
  }

  console.log(`\nSession migration complete: ${successCount} succeeded, ${errorCount} failed`)

  // Step 3: Output ID mapping for reference
  console.log('\n=== ID Mapping ===')
  console.log('\nCourses:')
  for (const [oldId, newId] of courseIdMap) {
    console.log(`  ${oldId} -> ${newId}`)
  }

  console.log('\nSessions (first 10):')
  let count = 0
  for (const [oldId, newId] of sessionIdMap) {
    if (count++ >= 10) {
      console.log(`  ... and ${sessionIdMap.size - 10} more`)
      break
    }
    console.log(`  ${oldId} -> ${newId}`)
  }

  // Step 4: Generate updated JSON with UUIDs
  console.log('\n=== Generating Updated JSON ===')

  const updatedSessions = sessionsData.map(session => ({
    ...session,
    id: sessionIdMap.get(session.id)!,
    course_id: session.course_id ? courseIdMap.get(session.course_id) : undefined,
    // Remove seed_ prefixed fields - now using real DB values
    karma: session.seed_karma,
    saves: session.seed_saves,
    completions: session.seed_completions
  }))

  const updatedCourses = coursesData.map(course => ({
    ...course,
    id: courseIdMap.get(course.id)!,
    session_ids: course.session_ids.map(id => sessionIdMap.get(id)!),
    karma: course.seed_karma,
    saves: course.seed_saves
  }))

  // Write to output files (don't overwrite originals)
  const fs = await import('fs')
  const path = await import('path')

  const outputDir = path.join(process.cwd(), 'scripts', 'output')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(
    path.join(outputDir, 'sessions-with-uuids.json'),
    JSON.stringify(updatedSessions, null, 2)
  )
  fs.writeFileSync(
    path.join(outputDir, 'courses-with-uuids.json'),
    JSON.stringify(updatedCourses, null, 2)
  )

  console.log('Updated JSON files written to scripts/output/')
  console.log('\nMigration complete!')
}

// Export for testing
export { seedIdToUUID, sessionIdMap, courseIdMap }

// Run if called directly
migrate().catch(console.error)
