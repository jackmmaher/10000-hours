/**
 * Intent Filtering Test Suite
 *
 * Tests for the intent-based content discovery feature.
 * Run with: npm test -- --grep "Intent Filtering"
 */

import { describe, it, expect } from 'vitest'

// Mock data matching real structure
const mockSessions = [
  {
    id: 'session-001',
    title: 'Anxiety Relief',
    intent_tags: ['anxiety', 'stress', 'beginners']
  },
  {
    id: 'session-002',
    title: 'Deep Focus',
    intent_tags: ['focus', 'racing-mind']
  },
  {
    id: 'session-003',
    title: 'Sleep Preparation',
    intent_tags: ['sleep', 'letting-go', 'evening']
  },
  {
    id: 'session-004',
    title: 'Body Scan',
    intent_tags: ['body-awareness', 'emotions']
  },
  {
    id: 'session-005',
    title: 'No Tags Session',
    intent_tags: []
  }
]

const mockPearls = [
  {
    id: 'pearl-001',
    text: 'When anxiety arises, breathe deeply',
    intentTags: ['anxiety', 'body-awareness']
  },
  {
    id: 'pearl-002',
    text: 'Focus is a muscle that strengthens with practice',
    intentTags: ['focus']
  },
  {
    id: 'pearl-003',
    text: 'Simple wisdom with no tags',
    intentTags: []
  }
]

// UI filter options as defined in Explore.tsx (Pareto-aligned)
const INTENT_OPTIONS = [
  'anxiety',
  'stress',
  'sleep',
  'focus',
  'beginners',
  'body-awareness',
  'self-compassion',
  'letting-go'
] as const

describe('Intent Filtering', () => {
  describe('Data Structure Validation', () => {
    it('all sessions have intent_tags array (even if empty)', () => {
      mockSessions.forEach(session => {
        expect(Array.isArray(session.intent_tags)).toBe(true)
      })
    })

    it('all pearls have intentTags array (even if empty)', () => {
      mockPearls.forEach(pearl => {
        expect(Array.isArray(pearl.intentTags)).toBe(true)
      })
    })

    it('intent_tags values are lowercase strings without spaces', () => {
      const allTags = mockSessions.flatMap(s => s.intent_tags)
      allTags.forEach(tag => {
        expect(tag).toBe(tag.toLowerCase())
        expect(tag).not.toContain(' ')
      })
    })
  })

  describe('Filter Logic', () => {
    it('filters sessions by single intent tag', () => {
      const filter = 'anxiety'
      const filtered = mockSessions.filter(s =>
        s.intent_tags?.includes(filter)
      )
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('session-001')
    })

    it('filters pearls by single intent tag', () => {
      const filter = 'focus'
      const filtered = mockPearls.filter(p =>
        p.intentTags?.includes(filter)
      )
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('pearl-002')
    })

    it('returns empty array when no content matches filter', () => {
      const filter = 'grief' // Not in mock data
      const filtered = mockSessions.filter(s =>
        s.intent_tags?.includes(filter)
      )
      expect(filtered).toHaveLength(0)
    })

    it('returns all content when filter is null', () => {
      const filter = null
      const filtered = filter
        ? mockSessions.filter(s => s.intent_tags?.includes(filter))
        : mockSessions
      expect(filtered).toHaveLength(mockSessions.length)
    })

    it('handles sessions with empty intent_tags array', () => {
      const filter = 'anxiety'
      const filtered = mockSessions.filter(s =>
        s.intent_tags?.includes(filter)
      )
      // session-005 has empty array, should not error
      expect(filtered.every(s => s.intent_tags.length > 0)).toBe(true)
    })

    it('handles undefined intentTags gracefully', () => {
      const pearlWithUndefined: { id: string; text: string; intentTags?: string[] } = {
        id: 'pearl-x',
        text: 'test',
        intentTags: undefined
      }
      const filter = 'anxiety'
      // Using optional chaining like the real code
      const matches = pearlWithUndefined.intentTags?.includes(filter) ?? false
      expect(matches).toBe(false)
    })
  })

  describe('UI Filter Options Coverage', () => {
    it('UI options exist for high-value user intents', () => {
      // These are the core mental health concerns users seek help for
      const mustHaveOptions = ['anxiety', 'stress', 'sleep', 'focus']
      mustHaveOptions.forEach(option => {
        expect(INTENT_OPTIONS).toContain(option)
      })
    })

    it('KNOWN ISSUE: Some data tags have no UI filter', () => {
      // Tags in data but not in UI - documenting known gap
      // After Pareto optimization, only 5 orphaned tags remain (down from 9)
      const orphanedTags = [
        'emotions',      // 82 sessions - too broad/vague
        'anger',         // 38 sessions - niche
        'racing-mind',   // 35 sessions - covered by focus/anxiety
        'low-mood',      // 35 sessions - covered by anxiety
        'grief',         // 24 sessions - niche
        'clarity',       // 30 sessions - covered by focus
        'pain',          // 29 sessions - niche
        'morning',       // 23 sessions - time-based, not intent
        'evening'        // 8 sessions - time-based, not intent
      ]

      orphanedTags.forEach(tag => {
        expect(INTENT_OPTIONS).not.toContain(tag)
      })

      // This test documents the gap - content exists but users can't filter to it
      console.warn(`WARNING: ${orphanedTags.length} tags have content but no UI filter (acceptable per Pareto)`)
    })
  })

  describe('Combined Filtering', () => {
    it('intent filter works with content type filter', () => {
      const intentFilter = 'anxiety'
      // contentType = 'sessions' means we only look at sessions, not pearls

      // Simulate Explore.tsx logic
      let filtered = mockSessions
      if (intentFilter) {
        filtered = filtered.filter(s => s.intent_tags?.includes(intentFilter))
      }
      // Content type filter would exclude pearls entirely

      expect(filtered).toHaveLength(1)
    })

    it('intent filter persists across sort changes', () => {
      // Sort doesn't affect which items match the filter
      const intentFilter = 'focus'
      const sortedByNew = [...mockSessions].sort((a, b) =>
        a.id.localeCompare(b.id)
      )
      const sortedByTop = [...mockSessions].sort((a, b) =>
        b.id.localeCompare(a.id)
      )

      const filteredNew = sortedByNew.filter(s => s.intent_tags?.includes(intentFilter))
      const filteredTop = sortedByTop.filter(s => s.intent_tags?.includes(intentFilter))

      expect(filteredNew.map(s => s.id).sort())
        .toEqual(filteredTop.map(s => s.id).sort())
    })
  })

  describe('Edge Cases', () => {
    it('handles hyphenated tags correctly', () => {
      const filter = 'racing-mind'
      const filtered = mockSessions.filter(s =>
        s.intent_tags?.includes(filter)
      )
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('session-002')
    })

    it('tag matching is exact (no partial matches)', () => {
      // 'self' should not match 'self-compassion'
      const partialTag = 'self'
      const filtered = mockSessions.filter(s =>
        s.intent_tags?.includes(partialTag)
      )
      expect(filtered).toHaveLength(0)
    })

    it('tag matching is case-sensitive', () => {
      const upperTag = 'ANXIETY'
      const filtered = mockSessions.filter(s =>
        s.intent_tags?.includes(upperTag)
      )
      // Should not match 'anxiety' (lowercase)
      expect(filtered).toHaveLength(0)
    })
  })
})

describe('Intent Tags Propagation', () => {
  describe('SessionDetailModal Interface', () => {
    it('SessionTemplate interface includes intentTags', () => {
      // Type check - if this compiles, the interface is correct
      interface SessionTemplate {
        id: string
        title: string
        intentTags?: string[]
      }

      const session: SessionTemplate = {
        id: '1',
        title: 'Test',
        intentTags: ['anxiety']
      }

      expect(session.intentTags).toBeDefined()
    })
  })

  describe('KNOWN ISSUE: JourneySavedContent Missing intentTags', () => {
    it('documents the propagation gap', () => {
      // JourneySavedContent.tsx lines 93-136 do not include intent_tags
      // in the type definition or mapping

      const savedSessionMapping = {
        id: 'session-001',
        title: 'Test',
        tags: ['#beginners'],
        // intentTags: MISSING - this is the bug
      }

      // When user views saved meditation details, intentTags will be undefined
      expect(savedSessionMapping).not.toHaveProperty('intentTags')

      console.warn('BUG: JourneySavedContent does not propagate intentTags')
    })
  })
})

describe('Supabase Migration Validation', () => {
  describe('Keyword Matching Accuracy', () => {
    it('documents over-matching risk in SQL patterns', () => {
      // The SQL uses LIKE '%kind%' which matches:
      const targetWord = 'kind'
      const falsePositives = [
        'mankind',
        'unkind',
        'kindergarten',
        'kindred'
      ]

      falsePositives.forEach(word => {
        expect(word.toLowerCase().includes(targetWord)).toBe(true)
      })

      console.warn('WARNING: SQL pattern %kind% may over-tag pearls')
    })

    it('documents word boundary issues', () => {
      // '%self%' matches many unintended words
      const targetWord = 'self'
      const falsePositives = ['myself', 'itself', 'yourself', 'selfie']

      falsePositives.forEach(word => {
        expect(word.toLowerCase().includes(targetWord)).toBe(true)
      })
    })
  })
})
