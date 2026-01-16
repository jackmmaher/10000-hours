import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../db'
import { getUserAffinities, saveUserAffinities, resetUserAffinities } from '../db/affinities'
import {
  deriveImplicitFeedback,
  updateAffinities,
  updateAffinitiesForDismissal,
  updateAffinitiesForFollow,
  decayAffinities,
  getTimeSlot,
  getDurationBucket,
  parseDurationBucket,
  getTagAffinity,
  getDisciplineAffinity,
  getTimeSlotAffinity,
  getDurationBucketAffinity,
  getAverageTagAffinity,
  detectStruggles,
} from '../affinities'
import type { Session } from '../db'
import type { SessionTemplate } from '../types'

// Mock session template for testing
const mockTemplate: SessionTemplate = {
  id: 'test-template-1',
  title: 'Test Meditation',
  tagline: 'A test meditation',
  durationGuidance: '15-20 mins',
  discipline: 'Breath Awareness',
  posture: 'Seated',
  bestTime: 'Morning',
  environment: 'Quiet space',
  guidanceNotes: 'Focus on breath',
  intention: 'Calm',
  recommendedAfterHours: 0,
  intentTags: ['focus', 'calm', 'morning'],
  karma: 10,
  saves: 5,
  completions: 20,
  creatorHours: 100,
}

// Mock session for testing
function createMockSession(overrides?: Partial<Session>): Session {
  return {
    uuid: `session-${Date.now()}`,
    startTime: Date.now() - 20 * 60 * 1000, // 20 mins ago
    endTime: Date.now(),
    durationSeconds: 20 * 60, // 20 mins
    discipline: 'Breath Awareness',
    ...overrides,
  }
}

describe('Affinities Module', () => {
  beforeEach(async () => {
    // Clear the affinities table and sessions table before each test
    await db.userAffinities.clear()
    await db.sessions.clear()
  })

  describe('getUserAffinities / saveUserAffinities', () => {
    it('should create default affinities on first access', async () => {
      const affinities = await getUserAffinities()

      expect(affinities.id).toBe(1)
      expect(affinities.totalFeedbackEvents).toBe(0)
      expect(affinities.lastDecayAt).toBeDefined()
      expect(affinities.tags).toEqual({})
      expect(affinities.disciplines).toEqual({})
      expect(affinities.timeSlots).toEqual({})
      expect(affinities.durationBuckets).toEqual({})
    })

    it('should persist changes when saved', async () => {
      const affinities = await getUserAffinities()
      affinities.tags.focus = 1.3
      affinities.disciplines['Breath Awareness'] = 1.2
      affinities.totalFeedbackEvents = 5

      await saveUserAffinities(affinities)
      const retrieved = await getUserAffinities()

      expect(retrieved.tags.focus).toBe(1.3)
      expect(retrieved.disciplines['Breath Awareness']).toBe(1.2)
      expect(retrieved.totalFeedbackEvents).toBe(5)
    })

    it('should reset to defaults', async () => {
      const affinities = await getUserAffinities()
      affinities.tags.focus = 1.5
      await saveUserAffinities(affinities)

      await resetUserAffinities()
      const reset = await getUserAffinities()

      expect(reset.tags).toEqual({})
      expect(reset.totalFeedbackEvents).toBe(0)
    })
  })

  describe('getTimeSlot', () => {
    it('should return morning for 5am-11:59am', () => {
      const morning5am = new Date()
      morning5am.setHours(5, 0, 0, 0)
      expect(getTimeSlot(morning5am.getTime())).toBe('morning')

      const morning11am = new Date()
      morning11am.setHours(11, 59, 0, 0)
      expect(getTimeSlot(morning11am.getTime())).toBe('morning')
    })

    it('should return midday for 12pm-4:59pm', () => {
      const noon = new Date()
      noon.setHours(12, 0, 0, 0)
      expect(getTimeSlot(noon.getTime())).toBe('midday')

      const afternoon = new Date()
      afternoon.setHours(16, 59, 0, 0)
      expect(getTimeSlot(afternoon.getTime())).toBe('midday')
    })

    it('should return evening for 5pm-8:59pm', () => {
      const evening = new Date()
      evening.setHours(17, 0, 0, 0)
      expect(getTimeSlot(evening.getTime())).toBe('evening')

      const lateEvening = new Date()
      lateEvening.setHours(20, 59, 0, 0)
      expect(getTimeSlot(lateEvening.getTime())).toBe('evening')
    })

    it('should return night for 9pm-4:59am', () => {
      const night = new Date()
      night.setHours(21, 0, 0, 0)
      expect(getTimeSlot(night.getTime())).toBe('night')

      const lateNight = new Date()
      lateNight.setHours(2, 0, 0, 0)
      expect(getTimeSlot(lateNight.getTime())).toBe('night')
    })
  })

  describe('getDurationBucket', () => {
    it('should return short for sessions under 12 mins', () => {
      expect(getDurationBucket(5 * 60)).toBe('short')
      expect(getDurationBucket(10 * 60)).toBe('short')
      expect(getDurationBucket(11 * 60)).toBe('short')
    })

    it('should return medium for sessions 12-24 mins', () => {
      expect(getDurationBucket(12 * 60)).toBe('medium')
      expect(getDurationBucket(15 * 60)).toBe('medium')
      expect(getDurationBucket(20 * 60)).toBe('medium')
      expect(getDurationBucket(24 * 60)).toBe('medium')
    })

    it('should return long for sessions 25+ mins', () => {
      expect(getDurationBucket(25 * 60)).toBe('long')
      expect(getDurationBucket(30 * 60)).toBe('long')
      expect(getDurationBucket(60 * 60)).toBe('long')
    })
  })

  describe('parseDurationBucket', () => {
    it('should parse short duration guidance', () => {
      expect(parseDurationBucket('5-10 mins')).toBe('short')
      expect(parseDurationBucket('5 minutes')).toBe('short')
      expect(parseDurationBucket('10 min')).toBe('short')
    })

    it('should parse medium duration guidance', () => {
      expect(parseDurationBucket('15-20 mins')).toBe('medium')
      expect(parseDurationBucket('15 minutes')).toBe('medium')
      expect(parseDurationBucket('20 min')).toBe('medium')
    })

    it('should parse long duration guidance', () => {
      expect(parseDurationBucket('30+ mins')).toBe('long')
      expect(parseDurationBucket('25-30 minutes')).toBe('long')
      expect(parseDurationBucket('30 min')).toBe('long')
    })
  })

  describe('deriveImplicitFeedback', () => {
    beforeEach(async () => {
      // Add some baseline sessions for average calculation
      await db.sessions.bulkAdd([
        createMockSession({ uuid: 'base-1', durationSeconds: 15 * 60 }),
        createMockSession({ uuid: 'base-2', durationSeconds: 15 * 60 }),
        createMockSession({ uuid: 'base-3', durationSeconds: 15 * 60 }),
      ])
    })

    it('should return positive feedback for completed session', async () => {
      const session = createMockSession({ durationSeconds: 20 * 60 })
      const feedback = await deriveImplicitFeedback(session, {
        plannedDurationMinutes: 20,
      })

      // Completed (>= 90%) = +0.3, longer than avg = +0.3
      expect(feedback).toBeGreaterThan(0)
    })

    it('should return negative feedback for early quit', async () => {
      const session = createMockSession({ durationSeconds: 5 * 60 }) // 5 mins
      const feedback = await deriveImplicitFeedback(session, {
        plannedDurationMinutes: 20, // Planned 20 mins
      })

      // Quit early (<50%) = -0.5
      expect(feedback).toBeLessThan(0)
    })

    it('should boost feedback for saved sessions', async () => {
      const session = createMockSession({ durationSeconds: 15 * 60 })
      const feedback = await deriveImplicitFeedback(session, {
        savedAfter: true,
      })

      // Saved = +1.0
      expect(feedback).toBeGreaterThanOrEqual(1.0)
    })

    it('should boost feedback for sessions with insights', async () => {
      const session = createMockSession({ durationSeconds: 15 * 60 })
      const feedback = await deriveImplicitFeedback(session, {
        insightCaptured: true,
      })

      // Insight = +0.5
      expect(feedback).toBeGreaterThanOrEqual(0.5)
    })

    it('should clamp feedback to [-1, 1]', async () => {
      const session = createMockSession({ durationSeconds: 30 * 60 })
      const feedback = await deriveImplicitFeedback(session, {
        plannedDurationMinutes: 20,
        savedAfter: true,
        insightCaptured: true,
      })

      expect(feedback).toBeLessThanOrEqual(1)
      expect(feedback).toBeGreaterThanOrEqual(-1)
    })
  })

  describe('updateAffinities', () => {
    it('should increase discipline affinity on positive feedback', async () => {
      const session = createMockSession({ discipline: 'Vipassana' })

      await updateAffinities(session, mockTemplate, 0.5)

      const affinities = await getUserAffinities()
      expect(affinities.disciplines['Vipassana']).toBeGreaterThan(1.0)
    })

    it('should decrease discipline affinity on negative feedback', async () => {
      const session = createMockSession({ discipline: 'Vipassana' })

      await updateAffinities(session, mockTemplate, -0.5)

      const affinities = await getUserAffinities()
      expect(affinities.disciplines['Vipassana']).toBeLessThan(1.0)
    })

    it('should update tag affinities from template', async () => {
      const session = createMockSession()

      await updateAffinities(session, mockTemplate, 0.5)

      const affinities = await getUserAffinities()
      expect(affinities.tags['focus']).toBeGreaterThan(1.0)
      expect(affinities.tags['calm']).toBeGreaterThan(1.0)
      expect(affinities.tags['morning']).toBeGreaterThan(1.0)
    })

    it('should update time slot affinity', async () => {
      const morningSession = createMockSession()
      const morning = new Date()
      morning.setHours(8, 0, 0, 0)
      morningSession.startTime = morning.getTime()

      await updateAffinities(morningSession, mockTemplate, 0.5)

      const affinities = await getUserAffinities()
      expect(affinities.timeSlots['morning']).toBeGreaterThan(1.0)
    })

    it('should update duration bucket affinity', async () => {
      const longSession = createMockSession({ durationSeconds: 30 * 60 })

      await updateAffinities(longSession, mockTemplate, 0.5)

      const affinities = await getUserAffinities()
      expect(affinities.durationBuckets['long']).toBeGreaterThan(1.0)
    })

    it('should clamp affinities to [0.5, 1.5]', async () => {
      const session = createMockSession({ discipline: 'Test' })

      // Apply many positive updates
      for (let i = 0; i < 20; i++) {
        await updateAffinities(session, mockTemplate, 1.0)
      }

      const affinities = await getUserAffinities()
      expect(affinities.disciplines['Test']).toBeLessThanOrEqual(1.5)

      // Apply many negative updates
      for (let i = 0; i < 40; i++) {
        await updateAffinities(session, mockTemplate, -1.0)
      }

      const finalAffinities = await getUserAffinities()
      expect(finalAffinities.disciplines['Test']).toBeGreaterThanOrEqual(0.5)
    })

    it('should increment totalFeedbackEvents', async () => {
      const session = createMockSession()

      await updateAffinities(session, mockTemplate, 0.5)
      await updateAffinities(session, mockTemplate, 0.5)
      await updateAffinities(session, mockTemplate, 0.5)

      const affinities = await getUserAffinities()
      expect(affinities.totalFeedbackEvents).toBe(3)
    })
  })

  describe('updateAffinitiesForDismissal', () => {
    it('should apply negative feedback for dismissed template', async () => {
      await updateAffinitiesForDismissal(mockTemplate)

      const affinities = await getUserAffinities()
      expect(affinities.disciplines['Breath Awareness']).toBeLessThan(1.0)
      expect(affinities.tags['focus']).toBeLessThan(1.0)
    })
  })

  describe('updateAffinitiesForFollow', () => {
    it('should apply positive feedback for followed recommendation', async () => {
      await updateAffinitiesForFollow(mockTemplate)

      const affinities = await getUserAffinities()
      expect(affinities.disciplines['Breath Awareness']).toBeGreaterThan(1.0)
      expect(affinities.tags['focus']).toBeGreaterThan(1.0)
    })
  })

  describe('decayAffinities', () => {
    it('should decay affinities toward 1.0', async () => {
      // Set up affinities away from neutral
      const affinities = await getUserAffinities()
      affinities.tags.focus = 1.4
      affinities.disciplines['Breath Awareness'] = 0.6
      affinities.timeSlots.morning = 1.3
      affinities.durationBuckets.long = 0.7
      affinities.lastDecayAt = Date.now() - 8 * 24 * 60 * 60 * 1000 // 8 days ago
      await saveUserAffinities(affinities)

      await decayAffinities()

      const decayed = await getUserAffinities()
      // Values should be closer to 1.0
      expect(decayed.tags.focus).toBeLessThan(1.4)
      expect(decayed.tags.focus).toBeGreaterThan(1.0)
      expect(decayed.disciplines['Breath Awareness']).toBeGreaterThan(0.6)
      expect(decayed.disciplines['Breath Awareness']).toBeLessThan(1.0)
    })

    it('should not decay if less than a week since last decay', async () => {
      const affinities = await getUserAffinities()
      affinities.tags.focus = 1.4
      affinities.lastDecayAt = Date.now() - 3 * 24 * 60 * 60 * 1000 // 3 days ago
      await saveUserAffinities(affinities)

      await decayAffinities()

      const unchanged = await getUserAffinities()
      expect(unchanged.tags.focus).toBe(1.4)
    })
  })

  describe('Affinity getters', () => {
    it('should return 1.0 for unset affinities', async () => {
      const affinities = await getUserAffinities()

      expect(getTagAffinity(affinities, 'unknown-tag')).toBe(1.0)
      expect(getDisciplineAffinity(affinities, 'Unknown Discipline')).toBe(1.0)
      expect(getTimeSlotAffinity(affinities, 'morning')).toBe(1.0)
      expect(getDurationBucketAffinity(affinities, 'short')).toBe(1.0)
    })

    it('should return set values', async () => {
      const affinities = await getUserAffinities()
      affinities.tags.focus = 1.3
      affinities.disciplines['Vipassana'] = 0.8

      expect(getTagAffinity(affinities, 'focus')).toBe(1.3)
      expect(getDisciplineAffinity(affinities, 'Vipassana')).toBe(0.8)
    })

    it('should calculate average tag affinity', async () => {
      const affinities = await getUserAffinities()
      affinities.tags.focus = 1.2
      affinities.tags.calm = 1.4
      affinities.tags.sleep = 0.8

      const avg = getAverageTagAffinity(affinities, ['focus', 'calm', 'sleep'])
      expect(avg).toBeCloseTo((1.2 + 1.4 + 0.8) / 3)
    })

    it('should return 1.0 for empty tag list average', async () => {
      const affinities = await getUserAffinities()
      expect(getAverageTagAffinity(affinities, [])).toBe(1.0)
    })
  })

  describe('detectStruggles', () => {
    beforeEach(async () => {
      await db.plannedSessions.clear()
    })

    it('should return empty array with insufficient data', async () => {
      // Only 2 sessions - not enough
      await db.sessions.bulkAdd([
        createMockSession({ uuid: 's1' }),
        createMockSession({ uuid: 's2' }),
      ])

      const struggles = await detectStruggles()
      expect(struggles).toEqual([])
    })

    it('should detect shallow practice pattern', async () => {
      // Add 12 short sessions (< 15 mins)
      const shortSessions = Array.from({ length: 12 }, (_, i) =>
        createMockSession({
          uuid: `short-${i}`,
          durationSeconds: 8 * 60, // 8 mins
          startTime: Date.now() - i * 24 * 60 * 60 * 1000, // Spread over days
        })
      )
      await db.sessions.bulkAdd(shortSessions)

      const struggles = await detectStruggles()

      const shallowPractice = struggles.find((s) => s.type === 'shallow_practice')
      expect(shallowPractice).toBeDefined()
      expect(shallowPractice?.detected).toBe(true)
    })

    it('should detect inconsistent timing pattern', async () => {
      // Add sessions at wildly varying times
      const sessions = [
        createMockSession({ uuid: 's1', startTime: new Date().setHours(6, 0) }),
        createMockSession({ uuid: 's2', startTime: new Date().setHours(14, 0) }),
        createMockSession({ uuid: 's3', startTime: new Date().setHours(22, 0) }),
        createMockSession({ uuid: 's4', startTime: new Date().setHours(3, 0) }),
        createMockSession({ uuid: 's5', startTime: new Date().setHours(11, 0) }),
        createMockSession({ uuid: 's6', startTime: new Date().setHours(19, 0) }),
        createMockSession({ uuid: 's7', startTime: new Date().setHours(8, 0) }),
        createMockSession({ uuid: 's8', startTime: new Date().setHours(16, 0) }),
        createMockSession({ uuid: 's9', startTime: new Date().setHours(0, 0) }),
        createMockSession({ uuid: 's10', startTime: new Date().setHours(12, 0) }),
      ]
      await db.sessions.bulkAdd(sessions)

      const struggles = await detectStruggles()

      const inconsistentTiming = struggles.find((s) => s.type === 'inconsistent_timing')
      expect(inconsistentTiming).toBeDefined()
    })

    it('should detect duration jump', async () => {
      // Add several short sessions, then one very long one as most recent
      // detectStruggles requires at least 3 sessions and looks at recent 30 days
      const baseTime = Date.now()

      // Add 5 sessions with consistent 10 min duration (older)
      for (let i = 0; i < 5; i++) {
        await db.sessions.add(
          createMockSession({
            uuid: `avg-${i}`,
            durationSeconds: 10 * 60, // 10 mins
            startTime: baseTime - (5 - i) * 24 * 60 * 60 * 1000, // Older sessions
          })
        )
      }

      // Add one very long session as the most recent (sessions sorted by startTime descending)
      await db.sessions.add(
        createMockSession({
          uuid: 'long-jump',
          durationSeconds: 45 * 60, // 45 mins - 4.5x the 10 min average
          startTime: baseTime, // Most recent
        })
      )

      const struggles = await detectStruggles()

      const durationJump = struggles.find((s) => s.type === 'duration_jump')
      expect(durationJump).toBeDefined()
      expect(durationJump?.context).toContain('45 min')
    })
  })
})

describe('Integration: Full Feedback Loop', () => {
  beforeEach(async () => {
    await db.userAffinities.clear()
    await db.sessions.clear()
    await db.plannedSessions.clear()
  })

  it('should improve recommendations after positive sessions', async () => {
    // Simulate multiple positive sessions with Vipassana
    const vipassanaTemplate: SessionTemplate = {
      ...mockTemplate,
      discipline: 'Vipassana',
      intentTags: ['focus', 'clarity'],
    }

    // User completes 5 positive Vipassana sessions
    for (let i = 0; i < 5; i++) {
      const session = createMockSession({
        uuid: `vip-${i}`,
        discipline: 'Vipassana',
        durationSeconds: 25 * 60, // Good completion
      })
      await db.sessions.add(session)

      // Simulate feedback with completed session, longer than average
      await updateAffinities(session, vipassanaTemplate, 0.6)
    }

    const affinities = await getUserAffinities()

    // Vipassana and related tags should be boosted
    expect(affinities.disciplines['Vipassana']).toBeGreaterThan(1.2)
    expect(affinities.tags['focus']).toBeGreaterThan(1.2)
    expect(affinities.tags['clarity']).toBeGreaterThan(1.2)
    expect(affinities.totalFeedbackEvents).toBe(5)
  })

  it('should reduce affinity after dismissed recommendations', async () => {
    // User dismisses a Body Scan recommendation twice
    const bodyScanTemplate: SessionTemplate = {
      ...mockTemplate,
      discipline: 'Body Scan',
      intentTags: ['sleep', 'body-awareness'],
    }

    await updateAffinitiesForDismissal(bodyScanTemplate)
    await updateAffinitiesForDismissal(bodyScanTemplate)

    const affinities = await getUserAffinities()

    // Body Scan and related tags should be reduced
    expect(affinities.disciplines['Body Scan']).toBeLessThan(1.0)
    expect(affinities.tags['sleep']).toBeLessThan(1.0)
    expect(affinities.tags['body-awareness']).toBeLessThan(1.0)
  })

  it('should balance follow and dismiss signals', async () => {
    // User follows one recommendation, dismisses another
    await updateAffinitiesForFollow(mockTemplate)
    await updateAffinitiesForDismissal(mockTemplate)

    const affinities = await getUserAffinities()

    // Should be roughly neutral (follow +0.05, dismiss -0.07 with learning rate 0.1)
    // Breath Awareness: 1.0 + 0.05 - 0.07 = 0.98
    expect(affinities.disciplines['Breath Awareness']).toBeCloseTo(0.98, 1)
  })
})
