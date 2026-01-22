/**
 * Database Schema
 *
 * MeditationDB class with all table definitions and version migrations.
 */

import Dexie, { Table } from 'dexie'
import { InAppNotification } from '../notifications'
import type {
  Session,
  AppState,
  UserProfile,
  UserSettings,
  Insight,
  PlannedSession,
  UserCourseProgress,
  SavedTemplate,
  PearlDraft,
  TemplateDraft,
  UserPreferences,
  WellbeingDimension,
  WellbeingCheckIn,
  WellbeingSettings,
  RepeatRule,
  UserAffinities,
  HourBank,
  MeditationLockSettings,
} from './types'

export class MeditationDB extends Dexie {
  sessions!: Table<Session>
  appState!: Table<AppState>
  profile!: Table<UserProfile>
  settings!: Table<UserSettings>
  insights!: Table<Insight>
  plannedSessions!: Table<PlannedSession>
  courseProgress!: Table<UserCourseProgress>
  savedTemplates!: Table<SavedTemplate>
  pearlDrafts!: Table<PearlDraft>
  templateDrafts!: Table<TemplateDraft>
  userPreferences!: Table<UserPreferences>
  wellbeingDimensions!: Table<WellbeingDimension>
  wellbeingCheckIns!: Table<WellbeingCheckIn>
  wellbeingSettings!: Table<WellbeingSettings>
  notifications!: Table<InAppNotification>
  repeatRules!: Table<RepeatRule>
  userAffinities!: Table<UserAffinities>
  hourBank!: Table<HourBank>
  meditationLockSettings!: Table<MeditationLockSettings>

  constructor() {
    super('10000hours')

    // v1: Original schema
    this.version(1).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
    })

    // v2: Add profile and settings tables for tier logic
    this.version(2)
      .stores({
        sessions: '++id, uuid, startTime, endTime',
        appState: 'id',
        profile: 'id',
        settings: 'id',
      })
      .upgrade(async (tx) => {
        // Backfill firstSessionDate from earliest session
        const sessions = await tx.table('sessions').orderBy('startTime').first()
        const firstSessionDate = sessions?.startTime ?? undefined

        // Initialize profile with defaults
        await tx.table('profile').put({
          id: 1,
          tier: 'free',
          firstSessionDate,
          trialExpired: false,
        })

        // Initialize settings with defaults
        await tx.table('settings').put({
          id: 1,
          hideTimeDisplay: false,
        })
      })

    // v3: Add insights table for voice note capture
    this.version(3).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt',
    })

    // v4: Add sharedPearlId to insights for tracking shared pearls
    this.version(4)
      .stores({
        sessions: '++id, uuid, startTime, endTime',
        appState: 'id',
        profile: 'id',
        settings: 'id',
        insights: 'id, sessionId, createdAt, sharedPearlId',
      })
      .upgrade(async (tx) => {
        // Backfill existing insights with null sharedPearlId
        await tx
          .table('insights')
          .toCollection()
          .modify((insight) => {
            insight.sharedPearlId = null
          })
      })

    // v5: Add plannedSessions table for meditation planning
    this.version(5).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt',
    })

    // v6: Extend plannedSessions with session linking, add course progress and saved templates
    this.version(6)
      .stores({
        sessions: '++id, uuid, startTime, endTime',
        appState: 'id',
        profile: 'id',
        settings: 'id',
        insights: 'id, sessionId, createdAt, sharedPearlId',
        plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId',
        courseProgress: 'id, courseId, status',
        savedTemplates: 'id, templateId, savedAt',
      })
      .upgrade(async (tx) => {
        // Backfill existing planned sessions with null linking fields
        await tx
          .table('plannedSessions')
          .toCollection()
          .modify((plan) => {
            plan.linkedSessionUuid = plan.linkedSessionUuid ?? null
            plan.sourceTemplateId = plan.sourceTemplateId ?? null
            plan.courseId = plan.courseId ?? null
            plan.coursePosition = plan.coursePosition ?? null
          })
      })

    // v7: Add per-session metadata (pose, discipline, notes) to sessions
    // No index changes needed - fields are optional and stored directly on session
    this.version(7).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
    })

    // v8: Add pearl drafts table for work-in-progress pearls
    this.version(8).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt',
    })

    // v9: Add template drafts table for work-in-progress templates
    this.version(9).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt',
      templateDrafts: 'id, updatedAt',
    })

    // v10: Add user preferences, wellbeing tracking tables
    this.version(10).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt',
      templateDrafts: 'id, updatedAt',
      userPreferences: 'id',
      wellbeingDimensions: 'id, name, createdAt',
      wellbeingCheckIns: 'id, dimensionId, createdAt',
      wellbeingSettings: 'id',
    })

    // v11: Add notifications table for in-app notification center
    this.version(11).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt',
      templateDrafts: 'id, updatedAt',
      userPreferences: 'id',
      wellbeingDimensions: 'id, name, createdAt',
      wellbeingCheckIns: 'id, dimensionId, createdAt',
      wellbeingSettings: 'id',
      notifications: 'id, type, createdAt, readAt',
    })

    // v12: Add repeatRules table for recurring sessions
    this.version(12).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId, repeatRuleId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt',
      templateDrafts: 'id, updatedAt',
      userPreferences: 'id',
      wellbeingDimensions: 'id, name, createdAt',
      wellbeingCheckIns: 'id, dimensionId, createdAt',
      wellbeingSettings: 'id',
      notifications: 'id, type, createdAt, readAt',
      repeatRules: '++id, createdAt',
    })

    // v13: Add userAffinities table for adaptive recommendations
    this.version(13).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId, repeatRuleId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt',
      templateDrafts: 'id, updatedAt',
      userPreferences: 'id',
      wellbeingDimensions: 'id, name, createdAt',
      wellbeingCheckIns: 'id, dimensionId, createdAt',
      wellbeingSettings: 'id',
      notifications: 'id, type, createdAt, readAt',
      repeatRules: '++id, createdAt',
      userAffinities: 'id', // Singleton table
    })

    // v14: Add hourBank table for consumption-based pricing
    this.version(14).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId, repeatRuleId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt',
      templateDrafts: 'id, updatedAt',
      userPreferences: 'id',
      wellbeingDimensions: 'id, name, createdAt',
      wellbeingCheckIns: 'id, dimensionId, createdAt',
      wellbeingSettings: 'id',
      notifications: 'id, type, createdAt, readAt',
      repeatRules: '++id, createdAt',
      userAffinities: 'id',
      hourBank: 'id', // Singleton table for hour tracking
    })

    // v15: Add meditationLockSettings table for Screen Time integration
    this.version(15).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId, repeatRuleId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt',
      templateDrafts: 'id, updatedAt',
      userPreferences: 'id',
      wellbeingDimensions: 'id, name, createdAt',
      wellbeingCheckIns: 'id, dimensionId, createdAt',
      wellbeingSettings: 'id',
      notifications: 'id, type, createdAt, readAt',
      repeatRules: '++id, createdAt',
      userAffinities: 'id',
      hourBank: 'id',
      meditationLockSettings: 'id', // Singleton table for meditation lock
    })

    // v16: Add sessionType, practiceToolId, omCoachMetrics to sessions for practice tools
    // No index changes needed - fields are optional and stored directly on session
    this.version(16).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId, repeatRuleId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt',
      templateDrafts: 'id, updatedAt',
      userPreferences: 'id',
      wellbeingDimensions: 'id, name, createdAt',
      wellbeingCheckIns: 'id, dimensionId, createdAt',
      wellbeingSettings: 'id',
      notifications: 'id, type, createdAt, readAt',
      repeatRules: '++id, createdAt',
      userAffinities: 'id',
      hourBank: 'id',
      meditationLockSettings: 'id',
    })
  }
}

export const db = new MeditationDB()
