/**
 * Update JSON files with UUIDs
 *
 * This updates the source JSON files to use UUIDs instead of string IDs.
 * Also removes the seed_ prefixed fields since values now come from DB.
 *
 * Run with: npx tsx scripts/update-json-with-uuids.ts
 */

import { v5 as uuidv5 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
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

// Update sessions
const updatedSessions = sessionsData.map(session => {
  const { seed_karma, seed_saves, seed_completions, source_reddit_id, ...rest } = session as any
  return {
    ...rest,
    id: sessionIdMap.get(session.id)!,
    course_id: session.course_id ? courseIdMap.get(session.course_id) : undefined,
    // Keep static values for offline fallback, but rename to match DB columns
    karma: seed_karma,
    saves: seed_saves,
    completions: seed_completions
  }
})

// Update courses
const updatedCourses = coursesData.map(course => {
  const { seed_karma, seed_saves, ...rest } = course as any
  return {
    ...rest,
    id: courseIdMap.get(course.id)!,
    session_ids: course.session_ids.map(id => sessionIdMap.get(id)!),
    karma: seed_karma,
    saves: seed_saves
  }
})

// Write updated files
const dataDir = path.join(process.cwd(), 'src', 'data')

fs.writeFileSync(
  path.join(dataDir, 'sessions.json'),
  JSON.stringify(updatedSessions, null, 2)
)
console.log('Updated src/data/sessions.json')

fs.writeFileSync(
  path.join(dataDir, 'courses.json'),
  JSON.stringify(updatedCourses, null, 2)
)
console.log('Updated src/data/courses.json')

// Also output the ID mapping for reference
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

console.log('\nDone!')
