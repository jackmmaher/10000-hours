#!/usr/bin/env node
/**
 * Normalize engagement data for pearls and guided meditations
 *
 * Creates realistic distributions for:
 * - creator_hours (affecting voice score)
 * - karma (upvotes)
 * - saves (bookmarks)
 * - completions (for sessions only)
 *
 * Distribution targets:
 * - 80% beginner/intermediate voice scores (creator_hours < 500)
 * - Life-like engagement reflecting content lifecycle stages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seeded random for reproducibility
let seed = 42;
function seededRandom() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function randomInt(min, max) {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

function pickFromDistribution(distribution) {
  const roll = seededRandom();
  let cumulative = 0;
  for (const [range, probability] of distribution) {
    cumulative += probability;
    if (roll <= cumulative) {
      return randomInt(range[0], range[1]);
    }
  }
  return randomInt(distribution[distribution.length - 1][0][0], distribution[distribution.length - 1][0][1]);
}

// Creator hours distribution (80% should be < 500 hours for beginner/intermediate voice scores)
// Voice score tiers: 0-19 Newcomer, 20-44 Practitioner, 45-69 Established, 70-84 Respected, 85-100 Mentor
const creatorHoursDistribution = [
  [[5, 30], 0.20],       // 20% - Very new practitioners (Newcomer voice)
  [[30, 100], 0.30],     // 30% - Growing practitioners (Practitioner voice)
  [[100, 350], 0.30],    // 30% - Established practitioners (Established voice)
  [[350, 800], 0.12],    // 12% - Serious practitioners (Respected voice)
  [[800, 2500], 0.06],   // 6% - Experienced teachers (High Respected)
  [[2500, 5000], 0.02],  // 2% - Master teachers (Mentor voice)
];

// Content lifecycle profiles for engagement
const contentProfiles = [
  {
    name: 'fresh',
    probability: 0.15,
    karma: [[0, 3], [3, 8]],
    saves: [[0, 2], [2, 6]],
    completions: [[0, 15], [10, 40]]
  },
  {
    name: 'new',
    probability: 0.20,
    karma: [[4, 15], [12, 28]],
    saves: [[3, 12], [10, 25]],
    completions: [[20, 60], [50, 120]]
  },
  {
    name: 'growing',
    probability: 0.25,
    karma: [[18, 45], [35, 75]],
    saves: [[15, 40], [30, 70]],
    completions: [[80, 180], [150, 300]]
  },
  {
    name: 'established',
    probability: 0.20,
    karma: [[50, 100], [80, 140]],
    saves: [[45, 100], [80, 160]],
    completions: [[250, 450], [380, 650]]
  },
  {
    name: 'popular',
    probability: 0.12,
    karma: [[100, 170], [140, 220]],
    saves: [[90, 180], [150, 280]],
    completions: [[500, 850], [700, 1100]]
  },
  {
    name: 'beloved',
    probability: 0.08,
    karma: [[160, 280], [220, 350]],
    saves: [[180, 350], [280, 480]],
    completions: [[900, 1400], [1200, 1800]]
  }
];

function selectContentProfile() {
  const roll = seededRandom();
  let cumulative = 0;
  for (const profile of contentProfiles) {
    cumulative += profile.probability;
    if (roll <= cumulative) {
      return profile;
    }
  }
  return contentProfiles[0];
}

function generateEngagementFromProfile(profile) {
  // Randomly pick from the two ranges for each metric
  const karmaRange = profile.karma[seededRandom() < 0.6 ? 0 : 1];
  const savesRange = profile.saves[seededRandom() < 0.6 ? 0 : 1];
  const completionsRange = profile.completions[seededRandom() < 0.6 ? 0 : 1];

  const karma = randomInt(karmaRange[0], karmaRange[1]);
  let saves = randomInt(savesRange[0], savesRange[1]);
  let completions = randomInt(completionsRange[0], completionsRange[1]);

  // Add some variation in ratios
  // Some content is "save-heavy" (inspirational), some is "completion-heavy" (utilitarian)
  const contentType = seededRandom();
  if (contentType < 0.25) {
    // Save-heavy: people save but don't always complete
    saves = Math.floor(saves * 1.3);
    completions = Math.floor(completions * 0.7);
  } else if (contentType < 0.50) {
    // Completion-heavy: utilitarian content people use but don't save
    completions = Math.floor(completions * 1.3);
    saves = Math.floor(saves * 0.7);
  }
  // Other 50% stays balanced

  return { karma, saves, completions };
}

// Course engagement (aggregated from sessions, so typically higher)
function generateCourseEngagement() {
  const profile = selectContentProfile();
  const base = generateEngagementFromProfile(profile);

  // Courses have slightly different engagement patterns
  // Higher saves (people bookmark courses), moderate karma
  return {
    karma: base.karma,
    saves: Math.floor(base.saves * 1.2) // Courses get saved more often
  };
}

// Process sessions.json
function processSessionsFile() {
  const sessionsPath = path.join(__dirname, '..', 'src', 'data', 'sessions.json');
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf-8'));

  // Reset seed for reproducibility
  seed = 42;

  const updatedSessions = sessions.map((session, index) => {
    const profile = selectContentProfile();
    const engagement = generateEngagementFromProfile(profile);
    const creatorHours = pickFromDistribution(creatorHoursDistribution);

    return {
      ...session,
      creator_hours: creatorHours,
      karma: engagement.karma,
      saves: engagement.saves,
      completions: engagement.completions
    };
  });

  // Write updated file
  fs.writeFileSync(sessionsPath, JSON.stringify(updatedSessions, null, 2) + '\n');

  // Generate statistics
  const stats = analyzeDistribution(updatedSessions, true);
  console.log('\n=== SESSIONS STATISTICS ===');
  console.log(`Total sessions: ${updatedSessions.length}`);
  console.log('\nCreator Hours (Voice Score proxy):');
  console.log(`  0-100 hours (Newcomer/Practitioner): ${stats.creatorHours.low} (${(stats.creatorHours.low/updatedSessions.length*100).toFixed(1)}%)`);
  console.log(`  100-500 hours (Established): ${stats.creatorHours.mid} (${(stats.creatorHours.mid/updatedSessions.length*100).toFixed(1)}%)`);
  console.log(`  500+ hours (Respected/Mentor): ${stats.creatorHours.high} (${(stats.creatorHours.high/updatedSessions.length*100).toFixed(1)}%)`);
  console.log('\nKarma distribution:');
  console.log(`  0-30: ${stats.karma.veryLow}, 31-80: ${stats.karma.low}, 81-150: ${stats.karma.mid}, 151+: ${stats.karma.high}`);
  console.log(`  Range: ${stats.karma.min}-${stats.karma.max}, Avg: ${stats.karma.avg.toFixed(1)}`);
  console.log('\nSaves distribution:');
  console.log(`  0-30: ${stats.saves.veryLow}, 31-100: ${stats.saves.low}, 101-200: ${stats.saves.mid}, 201+: ${stats.saves.high}`);
  console.log(`  Range: ${stats.saves.min}-${stats.saves.max}, Avg: ${stats.saves.avg.toFixed(1)}`);
  console.log('\nCompletions distribution:');
  console.log(`  0-100: ${stats.completions.veryLow}, 101-300: ${stats.completions.low}, 301-700: ${stats.completions.mid}, 701+: ${stats.completions.high}`);
  console.log(`  Range: ${stats.completions.min}-${stats.completions.max}, Avg: ${stats.completions.avg.toFixed(1)}`);

  return updatedSessions;
}

// Process courses.json
function processCoursesFile() {
  const coursesPath = path.join(__dirname, '..', 'src', 'data', 'courses.json');
  const courses = JSON.parse(fs.readFileSync(coursesPath, 'utf-8'));

  // Reset seed with different value for variety
  seed = 123;

  const updatedCourses = courses.map((course) => {
    const engagement = generateCourseEngagement();

    return {
      ...course,
      karma: engagement.karma,
      saves: engagement.saves
    };
  });

  // Write updated file
  fs.writeFileSync(coursesPath, JSON.stringify(updatedCourses, null, 2) + '\n');

  // Generate statistics
  const stats = analyzeDistribution(updatedCourses, false);
  console.log('\n=== COURSES STATISTICS ===');
  console.log(`Total courses: ${updatedCourses.length}`);
  console.log('\nKarma distribution:');
  console.log(`  0-30: ${stats.karma.veryLow}, 31-80: ${stats.karma.low}, 81-150: ${stats.karma.mid}, 151+: ${stats.karma.high}`);
  console.log(`  Range: ${stats.karma.min}-${stats.karma.max}, Avg: ${stats.karma.avg.toFixed(1)}`);
  console.log('\nSaves distribution:');
  console.log(`  0-30: ${stats.saves.veryLow}, 31-100: ${stats.saves.low}, 101-200: ${stats.saves.mid}, 201+: ${stats.saves.high}`);
  console.log(`  Range: ${stats.saves.min}-${stats.saves.max}, Avg: ${stats.saves.avg.toFixed(1)}`);

  return updatedCourses;
}

function analyzeDistribution(items, hasSessions) {
  const stats = {
    creatorHours: { low: 0, mid: 0, high: 0 },
    karma: { veryLow: 0, low: 0, mid: 0, high: 0, min: Infinity, max: -Infinity, sum: 0 },
    saves: { veryLow: 0, low: 0, mid: 0, high: 0, min: Infinity, max: -Infinity, sum: 0 },
    completions: { veryLow: 0, low: 0, mid: 0, high: 0, min: Infinity, max: -Infinity, sum: 0 }
  };

  for (const item of items) {
    // Creator hours (sessions only)
    if (item.creator_hours !== undefined) {
      if (item.creator_hours <= 100) stats.creatorHours.low++;
      else if (item.creator_hours <= 500) stats.creatorHours.mid++;
      else stats.creatorHours.high++;
    }

    // Karma
    if (item.karma <= 30) stats.karma.veryLow++;
    else if (item.karma <= 80) stats.karma.low++;
    else if (item.karma <= 150) stats.karma.mid++;
    else stats.karma.high++;
    stats.karma.min = Math.min(stats.karma.min, item.karma);
    stats.karma.max = Math.max(stats.karma.max, item.karma);
    stats.karma.sum += item.karma;

    // Saves
    if (item.saves <= 30) stats.saves.veryLow++;
    else if (item.saves <= 100) stats.saves.low++;
    else if (item.saves <= 200) stats.saves.mid++;
    else stats.saves.high++;
    stats.saves.min = Math.min(stats.saves.min, item.saves);
    stats.saves.max = Math.max(stats.saves.max, item.saves);
    stats.saves.sum += item.saves;

    // Completions (sessions only)
    if (hasSessions && item.completions !== undefined) {
      if (item.completions <= 100) stats.completions.veryLow++;
      else if (item.completions <= 300) stats.completions.low++;
      else if (item.completions <= 700) stats.completions.mid++;
      else stats.completions.high++;
      stats.completions.min = Math.min(stats.completions.min, item.completions);
      stats.completions.max = Math.max(stats.completions.max, item.completions);
      stats.completions.sum += item.completions;
    }
  }

  stats.karma.avg = stats.karma.sum / items.length;
  stats.saves.avg = stats.saves.sum / items.length;
  if (hasSessions) stats.completions.avg = stats.completions.sum / items.length;

  return stats;
}

// Generate SQL update script
function generateSqlScript(sessions, courses) {
  const sqlPath = path.join(__dirname, '..', 'supabase', 'update-engagement-data.sql');

  let sql = `-- Update engagement data for session_templates and courses
-- Generated: ${new Date().toISOString()}
--
-- This script normalizes engagement metrics to create realistic distributions:
-- - 80% of creator_hours reflect beginner/intermediate practitioners
-- - Varied karma, saves, completions reflecting content lifecycle stages
-- - Some content is new (low engagement), some established, some popular

BEGIN;

-- =============================================
-- SESSION TEMPLATES
-- =============================================

`;

  for (const session of sessions) {
    sql += `UPDATE public.session_templates
SET creator_hours = ${session.creator_hours},
    karma = ${session.karma},
    saves = ${session.saves},
    completions = ${session.completions}
WHERE id = '${session.id}';

`;
  }

  sql += `
-- =============================================
-- COURSES
-- =============================================

`;

  for (const course of courses) {
    sql += `UPDATE public.courses
SET karma = ${course.karma},
    saves = ${course.saves}
WHERE id = '${course.id}';

`;
  }

  sql += `COMMIT;

-- Verification queries
SELECT
  'Sessions' as type,
  COUNT(*) as total,
  AVG(karma)::int as avg_karma,
  AVG(saves)::int as avg_saves,
  AVG(completions)::int as avg_completions,
  COUNT(*) FILTER (WHERE creator_hours <= 100) as beginner_creators,
  COUNT(*) FILTER (WHERE creator_hours > 100 AND creator_hours <= 500) as intermediate_creators,
  COUNT(*) FILTER (WHERE creator_hours > 500) as advanced_creators
FROM public.session_templates;

SELECT
  'Courses' as type,
  COUNT(*) as total,
  AVG(karma)::int as avg_karma,
  AVG(saves)::int as avg_saves
FROM public.courses;
`;

  fs.writeFileSync(sqlPath, sql);
  console.log(`\nSQL script written to: ${sqlPath}`);
}

// Main execution
console.log('Normalizing engagement data...\n');

const sessions = processSessionsFile();
const courses = processCoursesFile();
generateSqlScript(sessions, courses);

console.log('\nDone! Files updated:');
console.log('  - src/data/sessions.json');
console.log('  - src/data/courses.json');
console.log('  - supabase/update-engagement-data.sql');
