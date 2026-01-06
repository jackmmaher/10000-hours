import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import {
  db,
  addInsight,
  getInsights,
  getInsightById,
  updateInsight,
  deleteInsight,
  getInsightsBySessionId
} from '../db'

describe('Insights CRUD operations', () => {
  beforeEach(async () => {
    await db.insights.clear()
  })

  describe('addInsight', () => {
    it('should create an insight with required fields', async () => {
      const insight = await addInsight({
        rawText: 'A moment of clarity about breath awareness'
      })

      expect(insight.id).toBeDefined()
      expect(insight.rawText).toBe('A moment of clarity about breath awareness')
      expect(insight.sessionId).toBeNull()
      expect(insight.formattedText).toBeNull()
      expect(insight.createdAt).toBeInstanceOf(Date)
      expect(insight.updatedAt).toBeNull()
    })

    it('should create an insight with optional fields', async () => {
      const insight = await addInsight({
        sessionId: 'session-123',
        rawText: 'Raw text here',
        formattedText: 'Formatted text here'
      })

      expect(insight.sessionId).toBe('session-123')
      expect(insight.formattedText).toBe('Formatted text here')
    })

    it('should generate unique IDs for each insight', async () => {
      const insight1 = await addInsight({ rawText: 'First insight' })
      const insight2 = await addInsight({ rawText: 'Second insight' })

      expect(insight1.id).not.toBe(insight2.id)
    })
  })

  describe('getInsights', () => {
    it('should return empty array when no insights exist', async () => {
      const insights = await getInsights()
      expect(insights).toEqual([])
    })

    it('should return insights in reverse chronological order', async () => {
      await addInsight({ rawText: 'First' })
      await new Promise(r => setTimeout(r, 10))
      await addInsight({ rawText: 'Second' })
      await new Promise(r => setTimeout(r, 10))
      await addInsight({ rawText: 'Third' })

      const insights = await getInsights()

      expect(insights).toHaveLength(3)
      expect(insights[0].rawText).toBe('Third')
      expect(insights[1].rawText).toBe('Second')
      expect(insights[2].rawText).toBe('First')
    })
  })

  describe('getInsightById', () => {
    it('should return insight by ID', async () => {
      const created = await addInsight({ rawText: 'Test insight' })
      const retrieved = await getInsightById(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(created.id)
      expect(retrieved?.rawText).toBe('Test insight')
    })

    it('should return undefined for non-existent ID', async () => {
      const retrieved = await getInsightById('non-existent-id')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('updateInsight', () => {
    it('should update rawText', async () => {
      const insight = await addInsight({ rawText: 'Original text' })

      await updateInsight(insight.id, { rawText: 'Updated text' })

      const updated = await getInsightById(insight.id)
      expect(updated?.rawText).toBe('Updated text')
      expect(updated?.updatedAt).toBeInstanceOf(Date)
    })

    it('should update formattedText', async () => {
      const insight = await addInsight({ rawText: 'Raw' })

      await updateInsight(insight.id, { formattedText: 'Formatted version' })

      const updated = await getInsightById(insight.id)
      expect(updated?.formattedText).toBe('Formatted version')
    })

    it('should set updatedAt timestamp', async () => {
      const insight = await addInsight({ rawText: 'Test' })
      expect(insight.updatedAt).toBeNull()

      await updateInsight(insight.id, { rawText: 'Modified' })

      const updated = await getInsightById(insight.id)
      expect(updated?.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('deleteInsight', () => {
    it('should delete an insight', async () => {
      const insight = await addInsight({ rawText: 'To be deleted' })

      await deleteInsight(insight.id)

      const retrieved = await getInsightById(insight.id)
      expect(retrieved).toBeUndefined()
    })

    it('should not affect other insights', async () => {
      const insight1 = await addInsight({ rawText: 'Keep me' })
      const insight2 = await addInsight({ rawText: 'Delete me' })

      await deleteInsight(insight2.id)

      const insights = await getInsights()
      expect(insights).toHaveLength(1)
      expect(insights[0].id).toBe(insight1.id)
    })
  })

  describe('getInsightsBySessionId', () => {
    it('should return insights for a specific session', async () => {
      await addInsight({ sessionId: 'session-1', rawText: 'Session 1 insight' })
      await addInsight({ sessionId: 'session-2', rawText: 'Session 2 insight' })
      await addInsight({ sessionId: 'session-1', rawText: 'Another session 1 insight' })

      const session1Insights = await getInsightsBySessionId('session-1')

      expect(session1Insights).toHaveLength(2)
      expect(session1Insights.every(i => i.sessionId === 'session-1')).toBe(true)
    })

    it('should return empty array when no insights match', async () => {
      await addInsight({ sessionId: 'session-1', rawText: 'Test' })

      const insights = await getInsightsBySessionId('non-existent')

      expect(insights).toEqual([])
    })
  })
})
