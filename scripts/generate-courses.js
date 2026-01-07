import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New courses to append (course-041 to course-055)
const newCourses = [
  {
    id: "course-041",
    title: "Walking Wisdom: A Movement Journey",
    description: "Discover the profound practice of walking meditation. These 5 sessions take you from basic walking awareness to deep embodied presence, proving that stillness doesn't require standing still.",
    session_count: 5,
    difficulty: "beginner",
    seed_karma: 178,
    seed_saves: 345,
    session_ids: ["session-051", "session-054", "session-056", "session-058", "session-055"]
  },
  {
    id: "course-042",
    title: "Zen Essentials: The Art of Just Sitting",
    description: "An introduction to Zen meditation practices. From breath counting to shikantaza (just sitting), explore the elegant simplicity that has transformed practitioners for centuries.",
    session_count: 5,
    difficulty: "intermediate",
    seed_karma: 145,
    seed_saves: 289,
    session_ids: ["session-061", "session-060", "session-063", "session-066", "session-059"]
  },
  {
    id: "course-043",
    title: "Sound Medicine: Mantra Mastery",
    description: "Harness the power of sacred sound. This 6-session journey teaches traditional mantras and modern applications, from Om to personalized affirmations.",
    session_count: 6,
    difficulty: "beginner",
    seed_karma: 167,
    seed_saves: 312,
    session_ids: ["session-067", "session-068", "session-073", "session-069", "session-071", "session-074"]
  },
  {
    id: "course-044",
    title: "Midday Mindfulness",
    description: "Reclaim your lunch hour with these 5 midday practices. Each session is designed for the workplace, helping you reset and return to your afternoon with clarity.",
    session_count: 5,
    difficulty: "beginner",
    seed_karma: 189,
    seed_saves: 367,
    session_ids: ["session-052", "session-076", "session-088", "session-099", "session-109"]
  },
  {
    id: "course-045",
    title: "Sleep Sanctuary Extended",
    description: "Expand your before-sleep practice with these 5 sessions designed to transition you from waking to restful slumber. End each day with peace.",
    session_count: 5,
    difficulty: "beginner",
    seed_karma: 212,
    seed_saves: 423,
    session_ids: ["session-079", "session-089", "session-101", "session-072", "session-110"]
  },
  {
    id: "course-046",
    title: "Body Wisdom: Deep Somatic Practice",
    description: "Your body holds wisdom your mind doesn't know. These 6 body scan sessions teach you to listen to the body's messages and release stored tension.",
    session_count: 6,
    difficulty: "intermediate",
    seed_karma: 156,
    seed_saves: 298,
    session_ids: ["session-075", "session-077", "session-078", "session-080", "session-076", "session-087"]
  },
  {
    id: "course-047",
    title: "Compassion Deep Dive",
    description: "Take loving-kindness practice to new depths. From self-compassion to tonglen, these 6 sessions systematically open the heart and develop genuine care for all beings.",
    session_count: 6,
    difficulty: "advanced",
    seed_karma: 134,
    seed_saves: 256,
    session_ids: ["session-083", "session-084", "session-082", "session-085", "session-081", "session-086"]
  },
  {
    id: "course-048",
    title: "Vipassana Insight Path",
    description: "Develop the clear seeing of insight meditation. These 5 sessions introduce noting, impermanence observation, and open awareness in the Vipassana tradition.",
    session_count: 5,
    difficulty: "advanced",
    seed_karma: 123,
    seed_saves: 234,
    session_ids: ["session-092", "session-093", "session-094", "session-096", "session-095"]
  },
  {
    id: "course-049",
    title: "Breath Mastery Foundations",
    description: "Master the breath as your primary meditation tool. From belly breathing to whole-body awareness, these 5 sessions build a solid foundation for all other practices.",
    session_count: 5,
    difficulty: "beginner",
    seed_karma: 198,
    seed_saves: 378,
    session_ids: ["session-087", "session-107", "session-088", "session-090", "session-091"]
  },
  {
    id: "course-050",
    title: "Anxiety Toolkit",
    description: "Practical meditation techniques for managing anxiety. These 4 sessions provide go-to practices for when worry strikes, building resilience over time.",
    session_count: 4,
    difficulty: "beginner",
    seed_karma: 234,
    seed_saves: 456,
    session_ids: ["session-108", "session-076", "session-088", "session-083"]
  },
  {
    id: "course-051",
    title: "Evening Wind-Down",
    description: "Create a consistent evening practice that helps you transition from the active day to restful night. These 5 sessions are perfect for unwinding.",
    session_count: 5,
    difficulty: "beginner",
    seed_karma: 189,
    seed_saves: 367,
    session_ids: ["session-054", "session-104", "session-077", "session-100", "session-106"]
  },
  {
    id: "course-052",
    title: "Advanced Open Awareness",
    description: "For experienced practitioners ready to rest in awareness itself. These 5 sessions explore equanimity, not-knowing, and the spacious nature of mind.",
    session_count: 5,
    difficulty: "advanced",
    seed_karma: 112,
    seed_saves: 198,
    session_ids: ["session-097", "session-100", "session-102", "session-106", "session-095"]
  },
  {
    id: "course-053",
    title: "Nature Connection Practices",
    description: "Take your meditation outdoors with these 4 sessions designed for natural settings. From walking to sitting, learn to let nature be your teacher.",
    session_count: 4,
    difficulty: "beginner",
    seed_karma: 167,
    seed_saves: 312,
    session_ids: ["session-058", "session-103", "session-056", "session-051"]
  },
  {
    id: "course-054",
    title: "Zen at Work",
    description: "Bring Zen principles to your professional life. These 4 sessions teach you to find stillness amid activity, making the workplace a place of practice.",
    session_count: 4,
    difficulty: "intermediate",
    seed_karma: 145,
    seed_saves: 278,
    session_ids: ["session-066", "session-099", "session-109", "session-105"]
  },
  {
    id: "course-055",
    title: "The Complete Day: Morning to Night",
    description: "A full-day meditation journey with practices for each phase of the day. From morning awakening to nighttime reflection, live your whole day mindfully.",
    session_count: 5,
    difficulty: "intermediate",
    seed_karma: 178,
    seed_saves: 345,
    session_ids: ["session-107", "session-099", "session-104", "session-101", "session-110"]
  }
];

// Main execution
const coursesPath = path.join(__dirname, '..', 'src', 'data', 'courses.json');

try {
  // Read existing courses
  const existingData = fs.readFileSync(coursesPath, 'utf8');
  const existingCourses = JSON.parse(existingData);

  console.log(`Existing courses: ${existingCourses.length}`);
  console.log(`New courses to add: ${newCourses.length}`);

  // Combine existing and new courses
  const allCourses = [...existingCourses, ...newCourses];

  // Write back to file
  fs.writeFileSync(coursesPath, JSON.stringify(allCourses, null, 2));

  console.log(`Total courses after merge: ${allCourses.length}`);
  console.log('Courses successfully written to courses.json');

  // Print analysis
  const difficulties = { beginner: 0, intermediate: 0, advanced: 0 };
  allCourses.forEach(c => difficulties[c.difficulty]++);

  console.log('\n--- Difficulty Distribution ---');
  console.log(difficulties);

} catch (error) {
  console.error('Error processing courses:', error);
}
