/**
 * RacingMindPostAssessment - Post-session self-assessment screen
 *
 * Asked BEFORE showing results to get unbiased feedback.
 * Optionally includes eye tracking metrics if available.
 */

import { useState } from 'react'
import { MindStateSlider } from './MindStateSlider'
import { RACING_MIND_COLORS } from '../../lib/racingMindAnimation'
import type { TrackingMetrics } from './index'

interface RacingMindPostAssessmentProps {
  onComplete: (postScore: number, metrics?: TrackingMetrics) => void
  trackingMetrics?: TrackingMetrics | null
}

export function RacingMindPostAssessment({
  onComplete,
  trackingMetrics,
}: RacingMindPostAssessmentProps) {
  const [postScore, setPostScore] = useState<number | null>(null)

  const handleContinue = () => {
    if (postScore !== null) {
      onComplete(postScore, trackingMetrics ?? undefined)
    }
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: RACING_MIND_COLORS.background }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Completion indicator */}
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-6">
          <svg
            className="w-7 h-7 text-white/80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-serif text-2xl text-white mb-2 text-center">Practice Complete</h1>
        <p className="text-sm text-white/60 text-center mb-10">Before we show your results...</p>

        {/* Assessment question */}
        <div className="w-full max-w-sm bg-white/5 backdrop-blur rounded-2xl p-6">
          <MindStateSlider
            value={postScore}
            onChange={setPostScore}
            label="How is your mind now?"
            variant="dark"
          />
        </div>
      </div>

      {/* Continue button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleContinue}
          disabled={postScore === null}
          className={`w-full h-14 rounded-xl font-medium transition-all ${
            postScore !== null
              ? 'bg-white text-[#0A0A12] hover:bg-white/90'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          See Your Progress
        </button>
      </div>

      {/* Safe area padding */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  )
}
