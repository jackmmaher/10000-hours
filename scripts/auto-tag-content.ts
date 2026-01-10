/**
 * Auto-Tag Content Script
 *
 * Analyzes existing sessions and pearls to suggest intent-based tags.
 * Run with: npx ts-node scripts/auto-tag-content.ts
 *
 * Outputs:
 * - sessions-with-intents.json
 * - pearls-with-intents.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Intent keywords - lowercase matching
const INTENT_KEYWORDS: Record<string, string[]> = {
  // Mental states
  'anxiety': [
    'anxiety', 'anxious', 'worry', 'worrying', 'worried', 'panic', 'panick',
    'fear', 'fearful', 'nervous', 'nervousness', 'racing mind', 'racing thoughts',
    'overwhelm', 'overwhelming', 'dread'
  ],
  'stress': [
    'stress', 'stressed', 'stressful', 'tension', 'tense', 'pressure',
    'burnout', 'burnt out', 'exhausted', 'exhaustion', 'frazzled',
    'deadline', 'busy', 'hectic'
  ],
  'low-mood': [
    'depress', 'depression', 'depressed', 'sad', 'sadness', 'dark', 'darkness',
    'heavy', 'heaviness', 'hopeless', 'despair', 'down', 'low mood',
    'unhappy', 'miserable', 'melancholy'
  ],
  'grief': [
    'grief', 'grieving', 'loss', 'losing', 'lost', 'death', 'dying', 'died',
    'letting go', 'let go', 'mourning', 'mourn', 'sorrow', 'bereavement',
    'goodbye', 'passing'
  ],
  'anger': [
    'anger', 'angry', 'rage', 'frustrat', 'irritat', 'annoyed', 'annoying',
    'furious', 'resentment', 'resent', 'hostile', 'aggravat'
  ],

  // Cognitive
  'focus': [
    'focus', 'focused', 'focusing', 'concentrat', 'attention', 'attentive',
    'distract', 'scattered', 'wander', 'wandering', 'adhd', 'productivity',
    'work', 'study', 'clarity', 'clear mind', 'sharp'
  ],
  'racing-mind': [
    'racing', 'thoughts', 'thinking', 'think too much', 'overthink',
    'rumination', 'ruminating', 'mental chatter', 'busy mind', 'restless mind',
    'monkey mind', 'constant thoughts', 'can\'t stop thinking'
  ],
  'clarity': [
    'clarity', 'clear', 'decision', 'confusion', 'confused', 'uncertain',
    'direction', 'purpose', 'meaning', 'insight', 'understanding'
  ],

  // Physical
  'sleep': [
    'sleep', 'sleeping', 'sleepy', 'insomnia', 'rest', 'restful', 'resting',
    'bedtime', 'bed', 'tired', 'tiredness', 'fatigue', 'night', 'nighttime',
    'evening', 'wake', 'waking', 'dream', 'drowsy'
  ],
  'body-awareness': [
    'body', 'bodily', 'somatic', 'sensation', 'physical', 'tension',
    'relax', 'relaxation', 'release', 'scan', 'scanning'
  ],
  'pain': [
    'pain', 'painful', 'chronic', 'ache', 'aching', 'discomfort',
    'suffering', 'hurt', 'hurting', 'sore'
  ],

  // Emotional
  'self-compassion': [
    'self', 'compassion', 'self-compassion', 'kind', 'kindness', 'self-kind',
    'accept', 'acceptance', 'self-accept', 'worthy', 'worth', 'enough',
    'love yourself', 'loving-kindness', 'metta', 'forgive', 'forgiveness'
  ],
  'emotions': [
    'emotion', 'emotional', 'feeling', 'feelings', 'feel', 'heart',
    'sensitive', 'sensitivity', 'mood', 'react', 'reaction', 'trigger'
  ],
  'letting-go': [
    'let go', 'letting go', 'release', 'releasing', 'surrender', 'accept',
    'attachment', 'detach', 'non-attachment', 'impermanence', 'change'
  ],

  // Situational
  'morning': [
    'morning', 'wake', 'waking', 'start the day', 'begin the day',
    'dawn', 'sunrise', 'first thing'
  ],
  'evening': [
    'evening', 'night', 'end of day', 'wind down', 'unwind',
    'sunset', 'dusk', 'close the day'
  ],
  'beginners': [
    'beginner', 'beginning', 'start', 'first', 'new to', 'introduction',
    'foundation', 'basic', 'simple', 'easy'
  ]
};

interface Session {
  id: string;
  title: string;
  tagline: string;
  guidance_notes: string;
  intention: string;
  tags?: string[];
  intent_tags?: string[];
  [key: string]: unknown;
}

interface Pearl {
  id: string;
  text: string;
  intent_tags?: string[];
  [key: string]: unknown;
}

function suggestIntentTags(text: string): string[] {
  const textLower = text.toLowerCase();
  const foundTags = new Set<string>();

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword)) {
        foundTags.add(intent);
        break; // Found one match, move to next intent
      }
    }
  }

  return Array.from(foundTags);
}

function processSessions(inputPath: string, outputPath: string): void {
  console.log('\n=== Processing Sessions ===\n');

  const rawData = fs.readFileSync(inputPath, 'utf-8');
  const sessions: Session[] = JSON.parse(rawData);

  const stats: Record<string, number> = {};

  const taggedSessions = sessions.map(session => {
    // Combine all text fields for analysis
    const combinedText = [
      session.title,
      session.tagline,
      session.guidance_notes,
      session.intention
    ].join(' ');

    const intents = suggestIntentTags(combinedText);

    // Track stats
    intents.forEach(intent => {
      stats[intent] = (stats[intent] || 0) + 1;
    });

    return {
      ...session,
      intent_tags: intents
    };
  });

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(taggedSessions, null, 2));

  console.log(`Processed ${sessions.length} sessions`);
  console.log('\nIntent tag distribution:');
  Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([intent, count]) => {
      console.log(`  ${intent}: ${count}`);
    });

  // Show sessions with no intents
  const noIntents = taggedSessions.filter(s => s.intent_tags?.length === 0);
  console.log(`\nSessions with no auto-detected intents: ${noIntents.length}`);
  if (noIntents.length > 0 && noIntents.length <= 10) {
    noIntents.forEach(s => console.log(`  - ${s.title}`));
  }

  console.log(`\nOutput: ${outputPath}`);
}

function processPearls(inputPath: string, outputPath: string): void {
  console.log('\n=== Processing Pearls ===\n');

  const rawData = fs.readFileSync(inputPath, 'utf-8');
  const pearls: Pearl[] = JSON.parse(rawData);

  const stats: Record<string, number> = {};

  const taggedPearls = pearls.map(pearl => {
    const intents = suggestIntentTags(pearl.text);

    // Track stats
    intents.forEach(intent => {
      stats[intent] = (stats[intent] || 0) + 1;
    });

    return {
      ...pearl,
      intent_tags: intents
    };
  });

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(taggedPearls, null, 2));

  console.log(`Processed ${pearls.length} pearls`);
  console.log('\nIntent tag distribution:');
  Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([intent, count]) => {
      console.log(`  ${intent}: ${count}`);
    });

  // Show sample tagged pearls
  const highIntentPearls = taggedPearls.filter(p => (p.intent_tags?.length || 0) >= 2);
  console.log(`\nPearls with 2+ intents: ${highIntentPearls.length}`);

  console.log(`\nOutput: ${outputPath}`);
}

function main(): void {
  const dataDir = path.join(__dirname, '..', 'src', 'data');
  const outputDir = path.join(__dirname, 'output');

  // Create output directory if needed
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('='.repeat(60));
  console.log('Intent Tag Auto-Tagger');
  console.log('='.repeat(60));

  // Process sessions
  try {
    processSessions(
      path.join(dataDir, 'sessions.json'),
      path.join(outputDir, 'sessions-with-intents.json')
    );
  } catch (err) {
    console.error('Error processing sessions:', err);
  }

  // Process pearls
  try {
    processPearls(
      path.join(dataDir, 'pearls.json'),
      path.join(outputDir, 'pearls-with-intents.json')
    );
  } catch (err) {
    console.error('Error processing pearls:', err);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Done! Review output files and merge intent_tags into source data.');
  console.log('='.repeat(60));
}

main();
