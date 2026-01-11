/**
 * Course Progress Helpers
 *
 * Functions for managing user progress through meditation courses.
 */

import { db } from './schema'
import type { UserCourseProgress } from './types'

export async function getCourseProgress(courseId: string): Promise<UserCourseProgress | undefined> {
  return db.courseProgress.where('courseId').equals(courseId).first()
}

export async function getAllCourseProgress(): Promise<UserCourseProgress[]> {
  return db.courseProgress.orderBy('lastActivityAt').reverse().toArray()
}

export async function getActiveCourses(): Promise<UserCourseProgress[]> {
  return db.courseProgress.where('status').equals('active').toArray()
}

export async function startCourse(courseId: string): Promise<UserCourseProgress> {
  const existing = await getCourseProgress(courseId)
  if (existing) {
    // Resume if paused
    if (existing.status === 'paused') {
      await db.courseProgress.update(existing.id, {
        status: 'active',
        lastActivityAt: Date.now(),
      })
    }
    return existing
  }

  const progress: UserCourseProgress = {
    id: crypto.randomUUID(),
    courseId,
    sessionsCompleted: [],
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    status: 'active',
  }
  await db.courseProgress.add(progress)
  return progress
}

export async function updateCourseProgress(
  courseId: string,
  updates: Partial<Omit<UserCourseProgress, 'id' | 'courseId' | 'startedAt'>>
): Promise<void> {
  const progress = await getCourseProgress(courseId)
  if (progress) {
    await db.courseProgress.update(progress.id, {
      ...updates,
      lastActivityAt: Date.now(),
    })
  }
}

export async function markCourseSessionComplete(courseId: string, position: number): Promise<void> {
  const progress = await getCourseProgress(courseId)
  if (progress && !progress.sessionsCompleted.includes(position)) {
    const newCompleted = [...progress.sessionsCompleted, position].sort((a, b) => a - b)
    await db.courseProgress.update(progress.id, {
      sessionsCompleted: newCompleted,
      lastActivityAt: Date.now(),
    })
  }
}

export async function pauseCourse(courseId: string): Promise<void> {
  await updateCourseProgress(courseId, { status: 'paused' })
}

export async function completeCourse(courseId: string): Promise<void> {
  await updateCourseProgress(courseId, { status: 'completed' })
}
