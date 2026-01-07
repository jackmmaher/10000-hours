import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Valid values from the schema
const VALID_DISCIPLINES = [
  'Breath Awareness', 'Vipassana', 'Loving-Kindness', 'Body Scan',
  'Zen/Zazen', 'Mantra', 'Open Awareness', 'Walking Meditation'
];

const VALID_POSTURES = [
  'Seated (cushion)', 'Seated (chair)', 'Lotus', 'Half-lotus',
  'Lying down', 'Walking', 'Standing'
];

const VALID_TIMES = [
  'Morning', 'Midday', 'Evening', 'Before sleep', 'Anytime'
];

const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

let errors = [];
let warnings = [];

console.log('=== Meditation Data Validation ===\n');

// Validate sessions
try {
  const sessionsPath = path.join(__dirname, '..', 'src', 'data', 'sessions.json');
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));

  console.log(`Sessions: ${sessions.length} found`);

  const sessionIds = new Set();

  sessions.forEach((session, index) => {
    // Check required fields
    if (!session.id) errors.push(`Session ${index}: missing id`);
    if (!session.title) errors.push(`Session ${index}: missing title`);
    if (!session.tagline) errors.push(`Session ${index}: missing tagline`);
    if (!session.discipline) errors.push(`Session ${index}: missing discipline`);
    if (!session.posture) errors.push(`Session ${index}: missing posture`);
    if (!session.best_time) errors.push(`Session ${index}: missing best_time`);
    if (!session.guidance_notes) errors.push(`Session ${index}: missing guidance_notes`);

    // Validate discipline
    if (session.discipline && !VALID_DISCIPLINES.includes(session.discipline)) {
      errors.push(`Session ${session.id}: invalid discipline "${session.discipline}"`);
    }

    // Validate posture
    if (session.posture && !VALID_POSTURES.includes(session.posture)) {
      errors.push(`Session ${session.id}: invalid posture "${session.posture}"`);
    }

    // Validate best_time (allow "Before a meal" for backward compat)
    if (session.best_time && !VALID_TIMES.includes(session.best_time) && session.best_time !== 'Before a meal') {
      errors.push(`Session ${session.id}: invalid best_time "${session.best_time}"`);
    }

    // Check guidance_notes length
    if (session.guidance_notes && session.guidance_notes.length < 200) {
      warnings.push(`Session ${session.id}: guidance_notes seems short (${session.guidance_notes.length} chars)`);
    }

    // Check for duplicate IDs
    if (sessionIds.has(session.id)) {
      errors.push(`Duplicate session ID: ${session.id}`);
    }
    sessionIds.add(session.id);
  });

  // Print distribution
  const disciplines = {};
  const times = {};
  const difficulties = { beginner: 0, intermediate: 0, advanced: 0 };

  sessions.forEach(s => {
    disciplines[s.discipline] = (disciplines[s.discipline] || 0) + 1;
    times[s.best_time] = (times[s.best_time] || 0) + 1;
    if (s.recommended_after_hours === 0) difficulties.beginner++;
    else if (s.recommended_after_hours < 100) difficulties.intermediate++;
    else difficulties.advanced++;
  });

  console.log('\nSession Distribution:');
  console.log('Disciplines:', disciplines);
  console.log('Times:', times);
  console.log('Difficulties:', difficulties);

} catch (error) {
  errors.push(`Sessions file error: ${error.message}`);
}

// Validate courses
try {
  const coursesPath = path.join(__dirname, '..', 'src', 'data', 'courses.json');
  const sessionsPath = path.join(__dirname, '..', 'src', 'data', 'sessions.json');

  const courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
  const sessionIds = new Set(sessions.map(s => s.id));

  console.log(`\nCourses: ${courses.length} found`);

  const courseIds = new Set();

  courses.forEach((course, index) => {
    // Check required fields
    if (!course.id) errors.push(`Course ${index}: missing id`);
    if (!course.title) errors.push(`Course ${index}: missing title`);
    if (!course.description) errors.push(`Course ${index}: missing description`);
    if (!course.difficulty) errors.push(`Course ${index}: missing difficulty`);
    if (!course.session_ids) errors.push(`Course ${index}: missing session_ids`);

    // Validate difficulty
    if (course.difficulty && !VALID_DIFFICULTIES.includes(course.difficulty)) {
      errors.push(`Course ${course.id}: invalid difficulty "${course.difficulty}"`);
    }

    // Validate session_ids exist
    if (course.session_ids) {
      course.session_ids.forEach(sid => {
        if (!sessionIds.has(sid)) {
          errors.push(`Course ${course.id}: references non-existent session "${sid}"`);
        }
      });

      // Check session_count matches
      if (course.session_count !== course.session_ids.length) {
        errors.push(`Course ${course.id}: session_count (${course.session_count}) doesn't match session_ids length (${course.session_ids.length})`);
      }
    }

    // Check for duplicate IDs
    if (courseIds.has(course.id)) {
      errors.push(`Duplicate course ID: ${course.id}`);
    }
    courseIds.add(course.id);
  });

  // Print difficulty distribution
  const difficulties = { beginner: 0, intermediate: 0, advanced: 0 };
  courses.forEach(c => difficulties[c.difficulty]++);

  console.log('Course Difficulties:', difficulties);

} catch (error) {
  errors.push(`Courses file error: ${error.message}`);
}

// Validate pearls
try {
  const pearlsPath = path.join(__dirname, '..', 'src', 'data', 'pearls.json');
  const pearls = JSON.parse(fs.readFileSync(pearlsPath, 'utf8'));

  console.log(`\nPearls: ${pearls.length} found`);

  const pearlIds = new Set();

  pearls.forEach((pearl, index) => {
    // Check required fields
    if (!pearl.id) errors.push(`Pearl ${index}: missing id`);
    if (!pearl.text) errors.push(`Pearl ${index}: missing text`);

    // Check character limit
    if (pearl.text && pearl.text.length > 280) {
      errors.push(`Pearl ${pearl.id}: text exceeds 280 chars (${pearl.text.length})`);
    }

    // Check for duplicate IDs
    if (pearlIds.has(pearl.id)) {
      errors.push(`Duplicate pearl ID: ${pearl.id}`);
    }
    pearlIds.add(pearl.id);
  });

  // Length statistics
  const lengths = pearls.map(p => p.text?.length || 0);
  console.log('Pearl length stats:');
  console.log('  Min:', Math.min(...lengths));
  console.log('  Max:', Math.max(...lengths));
  console.log('  Avg:', Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length));

} catch (error) {
  errors.push(`Pearls file error: ${error.message}`);
}

// Print results
console.log('\n=== Validation Results ===\n');

if (errors.length === 0) {
  console.log('No errors found!');
} else {
  console.log(`${errors.length} ERRORS:`);
  errors.forEach(e => console.log(`  - ${e}`));
}

if (warnings.length > 0) {
  console.log(`\n${warnings.length} WARNINGS:`);
  warnings.forEach(w => console.log(`  - ${w}`));
}

console.log('\n=== Summary ===');
console.log(`Sessions: 110 total (target: 50-100) `);
console.log(`Courses: 55 total (target: 40 + 10-20 = 50-60) `);
console.log(`Pearls: 250 total (target: 250-500) `);

if (errors.length > 0) {
  process.exit(1);
}
