/**
 * MeditationPlanner - Plan or view meditation sessions
 *
 * Two modes:
 * 1. Plan mode (no sessions): For future dates, all fields editable
 * 2. Session mode (has sessions): For past sessions, shows read-only time/duration,
 *    allows editing metadata (pose, discipline, notes), displays insight if captured
 *
 * Uses DayItemsCarousel to show sessions and plans as swipeable cards.
 */

import { useState } from 'react'
import { SessionDetailModal, SessionTemplate } from '../SessionDetailModal'
import { POSE_GROUPS, DISCIPLINE_GROUPS, DURATION_CATEGORIES } from '../../lib/meditation-options'
import type { MeditationPlannerProps } from './types'
import {
  formatDateForDisplay,
  formatDateForInput,
  formatTimeFromTimestamp,
  formatDurationMinutes,
  formatCustomDuration,
  getTemplateById,
} from './utils'
import { usePlannerState } from './usePlannerState'
import { DayItemsCarousel } from './DayItemsCarousel'
import { RepeatPicker } from './RepeatPicker'
import { PearlPicker } from './PearlPicker'

export type { MeditationPlannerProps } from './types'

export function MeditationPlanner({
  date,
  sessions,
  onClose,
  onSave,
  prefillTemplate,
}: MeditationPlannerProps) {
  const state = usePlannerState({ date, sessions, onSave, onClose, prefillTemplate })

  // Source template modal state
  const [sourceTemplate, setSourceTemplate] = useState<SessionTemplate | null>(null)

  // Pearl picker modal state
  const [showPearlPicker, setShowPearlPicker] = useState(false)

  // Destructure pearl state from usePlannerState
  const { attachedPearl, handlePearlSelect } = state

  // Block swipe navigation when modal is open
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
      onTouchMove={handleTouchEvent}
    >
      <div
        className="bg-cream rounded-t-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-ink/5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl text-indigo-deep">
                {state.isAddingNewPlan
                  ? 'Add Session'
                  : state.currentItem?.type === 'session'
                    ? 'Session Details'
                    : state.currentItem?.type === 'plan'
                      ? state.currentItem.plan?.title || 'Planned Session'
                      : state.planTitle || 'Plan Meditation'}
              </h2>
              <p className="text-sm text-ink-soft mt-1">
                {state.isAddingNewPlan
                  ? formatDateForDisplay(date)
                  : state.dayItems.length > 0
                    ? `${state.dayItems.length} item${state.dayItems.length !== 1 ? 's' : ''} · ${formatDateForDisplay(date)}`
                    : formatDateForDisplay(date)}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 -mr-2 text-ink/40 hover:text-ink/60 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-5 w-full max-w-full">
          {state.isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-indigo-deep/20 border-t-indigo-deep rounded-full animate-spin" />
            </div>
          ) : state.isAddingNewPlan ? (
            // When adding a new plan, show the form directly without carousel
            <div className="space-y-5">
              {/* Plan content - show editable date picker */}
              <div className="w-full">
                <label className="text-xs text-ink-soft block mb-2">Date</label>
                <div className="relative w-full">
                  <input
                    type="date"
                    value={formatDateForInput(state.selectedDate)}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value + 'T00:00:00')
                      state.handleDateChange(newDate)
                    }}
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                    className="block w-full max-w-full box-border px-4 py-4 rounded-xl bg-elevated text-ink text-lg font-medium text-center focus:outline-none focus:ring-2 focus:ring-accent/30 appearance-none"
                  />
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>

              {/* Time */}
              <div className="w-full">
                <label className="text-xs text-ink-soft block mb-2">Time</label>
                <div className="relative w-full">
                  <input
                    type="time"
                    value={state.plannedTime}
                    onChange={(e) => state.setPlannedTime(e.target.value)}
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                    className="block w-full max-w-full box-border px-4 py-4 rounded-xl bg-elevated text-ink text-lg font-medium text-center focus:outline-none focus:ring-2 focus:ring-accent/30 appearance-none"
                  />
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {!state.plannedTime && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-ink-soft font-medium pointer-events-none">
                      Tap to set time
                    </span>
                  )}
                </div>
              </div>

              {/* Duration - Progressive disclosure */}
              <div>
                <label className="text-xs text-ink-soft block mb-2">Duration</label>

                {/* Tier 1: Categories */}
                <div className="flex gap-2">
                  {DURATION_CATEGORIES.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => state.handleDurationCategoryChange(cat.label)}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm transition-colors min-h-[44px] flex flex-col items-center justify-center ${
                        state.durationCategory === cat.label
                          ? 'bg-accent text-on-accent'
                          : 'bg-deep/50 text-ink-soft hover:bg-deep'
                      }`}
                    >
                      <span className="font-medium">{cat.label}</span>
                      <span className="text-xs opacity-70">{cat.range}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => state.handleDurationCategoryChange('custom')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm transition-colors min-h-[44px] flex items-center justify-center ${
                      state.durationCategory === 'custom'
                        ? 'bg-accent text-on-accent'
                        : 'bg-deep/50 text-ink-soft hover:bg-deep'
                    }`}
                  >
                    <span className="font-medium">Custom</span>
                  </button>
                </div>

                {/* Tier 2: Specific durations within category */}
                {state.durationCategory && state.durationCategory !== 'custom' && (
                  <div className="flex gap-2 mt-3 animate-fade-in">
                    {DURATION_CATEGORIES.find(
                      (c) => c.label === state.durationCategory
                    )?.durations.map((d) => (
                      <button
                        key={d}
                        onClick={() => state.handleDurationChange(d)}
                        className={`px-4 py-2 rounded-full text-sm min-h-[44px] transition-colors ${
                          state.duration === d
                            ? 'bg-accent text-on-accent'
                            : 'bg-deep/30 text-ink-soft hover:bg-deep/50'
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom duration - scrollable picker */}
                {state.showCustomDuration && (
                  <div className="mt-3 animate-fade-in">
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                      {[
                        1, 2, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90, 120, 150,
                        180,
                      ].map((d) => (
                        <button
                          key={d}
                          onClick={() => state.handleDurationChange(d)}
                          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap min-h-[44px] transition-colors flex-shrink-0 ${
                            state.duration === d
                              ? 'bg-accent text-on-accent'
                              : 'bg-deep/30 text-ink-soft hover:bg-deep/50'
                          }`}
                        >
                          {formatCustomDuration(d)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Position - horizontal scroll with groups */}
              <div>
                <label className="text-xs text-ink-soft block mb-2">Position</label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                  {POSE_GROUPS.map((group, groupIndex) => (
                    <div key={group.label} className="flex gap-2 items-center">
                      {group.poses.map((p) => (
                        <button
                          key={p}
                          onClick={() => state.setPose(state.pose === p ? '' : p)}
                          className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors min-h-[44px] ${
                            state.pose === p
                              ? 'bg-accent text-on-accent'
                              : 'bg-deep/50 text-ink-soft hover:bg-deep'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      {groupIndex < POSE_GROUPS.length - 1 && (
                        <div className="w-px h-6 bg-ink/10 mx-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Technique - horizontal scroll with groups */}
              <div>
                <label className="text-xs text-ink-soft block mb-2">Technique</label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                  {DISCIPLINE_GROUPS.map((group, groupIndex) => (
                    <div key={group.label} className="flex gap-2 items-center">
                      {group.disciplines.map((d) => (
                        <button
                          key={d}
                          onClick={() => state.setDiscipline(state.discipline === d ? '' : d)}
                          className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors min-h-[44px] ${
                            state.discipline === d
                              ? 'bg-accent text-on-accent'
                              : 'bg-deep/50 text-ink-soft hover:bg-deep'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                      {groupIndex < DISCIPLINE_GROUPS.length - 1 && (
                        <div className="w-px h-6 bg-ink/10 mx-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes / Intention */}
              <div>
                <label className="text-xs text-ink-soft block mb-2">Notes</label>
                <textarea
                  value={state.notes}
                  onChange={(e) => state.setNotes(e.target.value)}
                  placeholder="Set your intention for this session..."
                  className="w-full h-24 px-4 py-3 rounded-xl bg-deep/50 text-ink placeholder:text-ink/30 resize-none focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              {/* Pearl Attachment */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink/70">Guidance</label>
                {attachedPearl ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowPearlPicker(true)
                    }}
                    className="w-full text-left p-3 rounded-xl bg-moss/10 border border-moss/30 touch-manipulation"
                  >
                    <p className="text-xs text-moss mb-1 flex items-center gap-1">
                      <span>💎</span> Attached Pearl
                    </p>
                    {attachedPearl.text ? (
                      <p className="text-ink leading-relaxed italic">"{attachedPearl.text}"</p>
                    ) : (
                      <p className="text-ink/50 italic text-sm">Pearl attached</p>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowPearlPicker(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-ink/20 text-ink/50 hover:border-moss/50 hover:text-moss transition-colors touch-manipulation"
                  >
                    <span className="text-lg">💎</span>
                    <span>Attach a Pearl</span>
                  </button>
                )}
              </div>

              {/* Repeat picker for scheduling recurring sessions */}
              <RepeatPicker
                frequency={state.repeatFrequency}
                customDays={state.repeatCustomDays}
                onChange={state.handleRepeatChange}
              />
            </div>
          ) : (
            <DayItemsCarousel
              items={state.dayItems}
              currentIndex={state.selectedItemIndex}
              onIndexChange={state.setSelectedItemIndex}
            >
              <div className="space-y-5">
                {/* Session content (type='session') */}
                {state.currentItem?.type === 'session' && state.session && (
                  <>
                    {/* Read-only time and duration */}
                    <div className="bg-moss/10 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-ink-soft">Time</span>
                        <span className="text-ink font-medium">
                          {formatTimeFromTimestamp(state.session.startTime)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-ink-soft">Duration</span>
                        <span className="text-ink font-medium">
                          {formatDurationMinutes(state.session.durationSeconds)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Plan content (type='plan' or empty state) - show editable date picker */}
                {(state.currentItem?.type === 'plan' || !state.currentItem) && (
                  <div className="w-full">
                    <label className="text-xs text-ink-soft block mb-2">Date</label>
                    <div className="relative w-full">
                      <input
                        type="date"
                        value={formatDateForInput(state.selectedDate)}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value + 'T00:00:00')
                          state.handleDateChange(newDate)
                        }}
                        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                        className="block w-full max-w-full box-border px-4 py-4 rounded-xl bg-elevated text-ink text-lg font-medium text-center focus:outline-none focus:ring-2 focus:ring-accent/30 appearance-none"
                      />
                      <svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Source template link */}
                {!state.isSessionMode && state.planSourceTemplateId && (
                  <button
                    onClick={() => {
                      const template = getTemplateById(state.planSourceTemplateId!)
                      if (template) setSourceTemplate(template)
                    }}
                    className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    <span>From guided meditation · View full guidance →</span>
                  </button>
                )}

                {/* Plan mode: Time and Duration inputs */}
                {!state.isSessionMode && (
                  <>
                    {/* Time */}
                    <div className="w-full">
                      <label className="text-xs text-ink-soft block mb-2">Time</label>
                      <div className="relative w-full">
                        <input
                          type="time"
                          value={state.plannedTime}
                          onChange={(e) => state.setPlannedTime(e.target.value)}
                          style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                          className="block w-full max-w-full box-border px-4 py-4 rounded-xl bg-elevated text-ink text-lg font-medium text-center focus:outline-none focus:ring-2 focus:ring-accent/30 appearance-none"
                        />
                        <svg
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {!state.plannedTime && (
                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-ink-soft font-medium pointer-events-none">
                            Tap to set time
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Duration - Progressive disclosure */}
                    <div>
                      <label className="text-xs text-ink-soft block mb-2">Duration</label>

                      {/* Tier 1: Categories */}
                      <div className="flex gap-2">
                        {DURATION_CATEGORIES.map((cat) => (
                          <button
                            key={cat.label}
                            onClick={() => state.handleDurationCategoryChange(cat.label)}
                            className={`flex-1 py-2 px-3 rounded-xl text-sm transition-colors min-h-[44px] flex flex-col items-center justify-center ${
                              state.durationCategory === cat.label
                                ? 'bg-accent text-on-accent'
                                : 'bg-deep/50 text-ink-soft hover:bg-deep'
                            }`}
                          >
                            <span className="font-medium">{cat.label}</span>
                            <span className="text-xs opacity-70">{cat.range}</span>
                          </button>
                        ))}
                        <button
                          onClick={() => state.handleDurationCategoryChange('custom')}
                          className={`flex-1 py-2 px-3 rounded-xl text-sm transition-colors min-h-[44px] flex items-center justify-center ${
                            state.durationCategory === 'custom'
                              ? 'bg-accent text-on-accent'
                              : 'bg-deep/50 text-ink-soft hover:bg-deep'
                          }`}
                        >
                          <span className="font-medium">Custom</span>
                        </button>
                      </div>

                      {/* Tier 2: Specific durations within category */}
                      {state.durationCategory && state.durationCategory !== 'custom' && (
                        <div className="flex gap-2 mt-3 animate-fade-in">
                          {DURATION_CATEGORIES.find(
                            (c) => c.label === state.durationCategory
                          )?.durations.map((d) => (
                            <button
                              key={d}
                              onClick={() => state.handleDurationChange(d)}
                              className={`px-4 py-2 rounded-full text-sm min-h-[44px] transition-colors ${
                                state.duration === d
                                  ? 'bg-accent text-on-accent'
                                  : 'bg-deep/30 text-ink-soft hover:bg-deep/50'
                              }`}
                            >
                              {d} min
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Custom duration - scrollable picker */}
                      {state.showCustomDuration && (
                        <div className="mt-3 animate-fade-in">
                          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                            {[
                              1, 2, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90, 120,
                              150, 180,
                            ].map((d) => (
                              <button
                                key={d}
                                onClick={() => state.handleDurationChange(d)}
                                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap min-h-[44px] transition-colors flex-shrink-0 ${
                                  state.duration === d
                                    ? 'bg-accent text-on-accent'
                                    : 'bg-deep/30 text-ink-soft hover:bg-deep/50'
                                }`}
                              >
                                {formatCustomDuration(d)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Position - horizontal scroll with groups */}
                <div>
                  <label className="text-xs text-ink-soft block mb-2">Position</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                    {POSE_GROUPS.map((group, groupIndex) => (
                      <div key={group.label} className="flex gap-2 items-center">
                        {group.poses.map((p) => (
                          <button
                            key={p}
                            onClick={() => state.setPose(state.pose === p ? '' : p)}
                            className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors min-h-[44px] ${
                              state.pose === p
                                ? 'bg-accent text-on-accent'
                                : 'bg-deep/50 text-ink-soft hover:bg-deep'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        {groupIndex < POSE_GROUPS.length - 1 && (
                          <div className="w-px h-6 bg-ink/10 mx-1 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technique - horizontal scroll with groups */}
                <div>
                  <label className="text-xs text-ink-soft block mb-2">Technique</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                    {DISCIPLINE_GROUPS.map((group, groupIndex) => (
                      <div key={group.label} className="flex gap-2 items-center">
                        {group.disciplines.map((d) => (
                          <button
                            key={d}
                            onClick={() => state.setDiscipline(state.discipline === d ? '' : d)}
                            className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors min-h-[44px] ${
                              state.discipline === d
                                ? 'bg-accent text-on-accent'
                                : 'bg-deep/50 text-ink-soft hover:bg-deep'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                        {groupIndex < DISCIPLINE_GROUPS.length - 1 && (
                          <div className="w-px h-6 bg-ink/10 mx-1 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes / Intention */}
                <div>
                  <label className="text-xs text-ink-soft block mb-2">
                    {state.isSessionMode ? 'Intention' : 'Notes'}
                  </label>
                  <textarea
                    value={state.notes}
                    onChange={(e) => state.setNotes(e.target.value)}
                    placeholder={
                      state.isSessionMode
                        ? 'What was your intention for this session?'
                        : 'Set your intention for this session...'
                    }
                    className="w-full h-24 px-4 py-3 rounded-xl bg-deep/50 text-ink placeholder:text-ink/30 resize-none focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                {/* Pearl Attachment - only show for plan mode, not session mode */}
                {!state.isSessionMode && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-ink/70">Guidance</label>
                    {attachedPearl ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowPearlPicker(true)
                        }}
                        className="w-full text-left p-3 rounded-xl bg-moss/10 border border-moss/30 touch-manipulation"
                      >
                        <p className="text-xs text-moss mb-1 flex items-center gap-1">
                          <span>💎</span> Attached Pearl
                        </p>
                        {attachedPearl.text ? (
                          <p className="text-ink leading-relaxed italic">"{attachedPearl.text}"</p>
                        ) : (
                          <p className="text-ink/50 italic text-sm">Pearl attached</p>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowPearlPicker(true)
                        }}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-ink/20 text-ink/50 hover:border-moss/50 hover:text-moss transition-colors touch-manipulation"
                      >
                        <span className="text-lg">💎</span>
                        <span>Attach a Pearl</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Repeat picker - only show for plan mode, not session mode */}
                {!state.isSessionMode && (
                  <RepeatPicker
                    frequency={state.repeatFrequency}
                    customDays={state.repeatCustomDays}
                    onChange={state.handleRepeatChange}
                  />
                )}

                {/* Insight display - show in session mode */}
                {state.isSessionMode && (
                  <div>
                    <label className="text-xs text-ink-soft block mb-2">Insight captured</label>
                    {state.insight ? (
                      <div className="bg-accent/5 rounded-xl p-4 border border-accent/10">
                        <p className="text-ink text-sm whitespace-pre-wrap">
                          {state.insight.formattedText || state.insight.rawText}
                        </p>
                        <p className="text-xs text-ink/40 mt-2">
                          {new Date(state.insight.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-deep/30 rounded-xl p-4">
                        <p className="text-ink/40 text-sm italic">
                          No insight captured for this session
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DayItemsCarousel>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-8 pt-4 border-t border-ink/5 space-y-3 safe-area-bottom">
          {/* Add another session button - only show when viewing existing items and not already adding */}
          {state.dayItems.length > 0 && !state.isAddingNewPlan && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                state.handleAddNewPlan()
              }}
              className="w-full py-3 rounded-xl text-sm font-medium border border-dashed border-ink/20 text-ink/50 hover:border-ink/40 hover:text-ink/70 transition-colors touch-manipulation"
            >
              + Add Another Session
            </button>
          )}

          <button
            onClick={state.handleSave}
            disabled={state.isSaving || state.isLoading}
            className="w-full py-3 rounded-xl text-sm font-medium bg-accent text-on-accent hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
          >
            {state.isSaving
              ? 'Saving...'
              : state.isSessionMode
                ? 'Save Details'
                : state.existingPlan
                  ? 'Update Plan'
                  : 'Save Plan'}
          </button>

          {state.existingPlan && !state.isSessionMode && (
            <button
              onClick={state.handleDelete}
              className="w-full py-3 rounded-xl text-sm font-medium border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors active:scale-[0.98]"
            >
              Delete Plan
            </button>
          )}
        </div>
      </div>

      {/* Source template modal */}
      {sourceTemplate && (
        <SessionDetailModal
          session={sourceTemplate}
          onClose={() => setSourceTemplate(null)}
          onAdopt={() => setSourceTemplate(null)}
        />
      )}

      {/* Pearl picker modal */}
      <PearlPicker
        isOpen={showPearlPicker}
        onClose={() => setShowPearlPicker(false)}
        onSelect={handlePearlSelect}
        selectedPearlId={attachedPearl?.id}
      />
    </div>
  )
}
