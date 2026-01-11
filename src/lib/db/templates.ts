/**
 * Template Helpers
 *
 * Functions for managing saved templates and drafts.
 */

import { db } from './schema'
import type { SavedTemplate, PearlDraft, TemplateDraft } from './types'

// Saved Templates helpers
export async function saveTemplate(templateId: string): Promise<SavedTemplate> {
  const existing = await db.savedTemplates.where('templateId').equals(templateId).first()
  if (existing) return existing

  const saved: SavedTemplate = {
    id: crypto.randomUUID(),
    templateId,
    savedAt: Date.now(),
  }
  await db.savedTemplates.add(saved)
  return saved
}

export async function unsaveTemplate(templateId: string): Promise<void> {
  const saved = await db.savedTemplates.where('templateId').equals(templateId).first()
  if (saved) {
    await db.savedTemplates.delete(saved.id)
  }
}

export async function isTemplateSaved(templateId: string): Promise<boolean> {
  const saved = await db.savedTemplates.where('templateId').equals(templateId).first()
  return !!saved
}

export async function getSavedTemplates(): Promise<SavedTemplate[]> {
  return db.savedTemplates.orderBy('savedAt').reverse().toArray()
}

// Pearl Draft helpers - work-in-progress pearls before posting

export async function savePearlDraft(insightId: string, text: string): Promise<PearlDraft> {
  const existing = await db.pearlDrafts.where('insightId').equals(insightId).first()
  const now = Date.now()

  if (existing) {
    // Update existing draft
    await db.pearlDrafts.update(existing.id, { text, updatedAt: now })
    return { ...existing, text, updatedAt: now }
  } else {
    // Create new draft
    const draft: PearlDraft = {
      id: crypto.randomUUID(),
      insightId,
      text,
      createdAt: now,
      updatedAt: now,
    }
    await db.pearlDrafts.add(draft)
    return draft
  }
}

export async function getPearlDraft(insightId: string): Promise<PearlDraft | undefined> {
  return db.pearlDrafts.where('insightId').equals(insightId).first()
}

export async function deletePearlDraft(insightId: string): Promise<void> {
  const draft = await db.pearlDrafts.where('insightId').equals(insightId).first()
  if (draft) {
    await db.pearlDrafts.delete(draft.id)
  }
}

export async function getAllPearlDrafts(): Promise<PearlDraft[]> {
  return db.pearlDrafts.orderBy('updatedAt').reverse().toArray()
}

// Template Draft helpers - work-in-progress meditation templates before publishing

export async function saveTemplateDraft(
  data: Omit<TemplateDraft, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TemplateDraft> {
  const existing = await db.templateDrafts.get('current')
  const now = Date.now()

  if (existing) {
    // Update existing draft
    const updated = { ...existing, ...data, updatedAt: now }
    await db.templateDrafts.update('current', updated)
    return updated
  } else {
    // Create new draft
    const draft: TemplateDraft = {
      id: 'current',
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    await db.templateDrafts.add(draft)
    return draft
  }
}

export async function getTemplateDraft(): Promise<TemplateDraft | undefined> {
  return db.templateDrafts.get('current')
}

export async function deleteTemplateDraft(): Promise<void> {
  await db.templateDrafts.delete('current')
}

export async function hasTemplateDraft(): Promise<boolean> {
  const draft = await db.templateDrafts.get('current')
  return !!draft
}
