/**
 * Session Helpers
 *
 * CRUD operations for meditation sessions.
 */

import { db } from './schema'
import type { Session } from './types'

export async function getAllSessions(): Promise<Session[]> {
  return db.sessions.orderBy('startTime').toArray()
}

export async function addSession(session: Omit<Session, 'id'>): Promise<number> {
  return db.sessions.add(session as Session)
}

export async function updateSession(
  uuid: string,
  updates: Partial<Pick<Session, 'pose' | 'discipline' | 'notes'>>
): Promise<void> {
  const session = await db.sessions.where('uuid').equals(uuid).first()
  if (session && session.id) {
    await db.sessions.update(session.id, updates)
  }
}

export async function getSessionByUuid(uuid: string): Promise<Session | undefined> {
  return db.sessions.where('uuid').equals(uuid).first()
}

export async function deleteSession(uuid: string): Promise<void> {
  const session = await db.sessions.where('uuid').equals(uuid).first()
  if (session && session.id) {
    await db.sessions.delete(session.id)
  }
}

export async function updateSessionFull(
  uuid: string,
  updates: Partial<
    Pick<Session, 'startTime' | 'endTime' | 'durationSeconds' | 'pose' | 'discipline' | 'notes'>
  >
): Promise<void> {
  const session = await db.sessions.where('uuid').equals(uuid).first()
  if (session && session.id) {
    await db.sessions.update(session.id, updates)
  }
}

export async function getTotalSeconds(): Promise<number> {
  const sessions = await db.sessions.toArray()
  return sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
}
