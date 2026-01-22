/**
 * RacingMindSetup - Pre-session setup screen
 *
 * Features:
 * - Duration picker (5/10/15 min, 5 recommended)
 * - Visual preview (CSS-animated orb)
 * - Instructions for visual focus practice
 */

import { useState } from 'react'
import type { SessionDuration } from './index'
import { MindStateSlider } from './MindStateSlider'

interface RacingMindSetupProps {
  onBegin: (duration: SessionDuration, preScore: number) => void
  isLoading?: boolean
}

export function RacingMindSetup({ onBegin, isLoading }: RacingMindSetupProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<SessionDuration>(10) // Default to hero duration
  const [preScore, setPreScore] = useState<number | null>(null)

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col min-h-full w-full max-w-md mx-auto px-6 py-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl text-ink mb-2">Racing Mind</h1>
          <p className="text-sm text-ink/60">Not ready to sit still? Start here.</p>
        </div>

        {/* Visual Preview - CSS animated orb */}
        <div className="relative bg-[#0A0A12] rounded-xl h-32 mb-6 overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 w-12 h-12 -translate-y-1/2 rounded-full animate-racing-mind-preview"
            style={{
              background: 'radial-gradient(circle, #4A7FD4 0%, #2C5AA0 50%, transparent 70%)',
              boxShadow: '0 0 40px 15px rgba(44, 90, 160, 0.4)',
            }}
          />
        </div>

        {/* Instructions */}
        <div className="bg-elevated rounded-xl p-4 mb-6">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-semibold text-accent">1</span>
              </div>
              <p className="text-sm text-ink">
                Follow the orb with your eyes as it moves gently across the screen
              </p>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-semibold text-accent">2</span>
              </div>
              <p className="text-sm text-ink">
                Let your thoughts drift away as you focus on the calming blue light
              </p>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-semibold text-accent">3</span>
              </div>
              <p className="text-sm text-ink">
                The movement will gradually slow, preparing you for stillness
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 text-xs text-accent hover:underline"
          >
            {showDetails ? 'Hide' : 'Show'} science
          </button>

          {showDetails && (
            <div className="mt-3 p-3 bg-base rounded-lg">
              <p className="text-xs text-ink/70 leading-relaxed">
                Smooth pursuit eye tracking suppresses the Default Mode Network, reducing rumination
                and anxious thoughts. Blue light around 471nm wavelength has been shown to
                accelerate relaxation 3x compared to white light. This "soft fascination" state is a
                validated restorative attention pattern.
              </p>
            </div>
          )}
        </div>

        {/* Spacer pushes controls to bottom on tall screens */}
        <div className="flex-1 min-h-4" />

        {/* Duration picker - 10 min hero, 5 & 15 min secondary */}
        <div className="mb-6">
          <p className="text-xs text-ink/50 mb-3 text-center uppercase tracking-wide">Duration</p>
          <div className="flex items-center justify-center gap-3">
            {/* 5 min - secondary option */}
            <button
              onClick={() => setSelectedDuration(5)}
              className={`w-16 h-16 rounded-xl transition-all ${
                selectedDuration === 5
                  ? 'bg-accent text-white'
                  : 'bg-elevated text-ink hover:bg-elevated/80'
              }`}
            >
              <div className="text-lg font-semibold">5</div>
              <div
                className={`text-[10px] ${
                  selectedDuration === 5 ? 'text-white/70' : 'text-ink/50'
                }`}
              >
                min
              </div>
            </button>

            {/* 10 min - HERO option */}
            <button
              onClick={() => setSelectedDuration(10)}
              className={`w-24 h-24 rounded-2xl transition-all relative ${
                selectedDuration === 10
                  ? 'bg-accent text-white shadow-lg shadow-accent/30'
                  : 'bg-elevated text-ink hover:bg-elevated/80 ring-1 ring-accent/20'
              }`}
            >
              <div className="text-2xl font-semibold">10</div>
              <div
                className={`text-xs ${selectedDuration === 10 ? 'text-white/70' : 'text-ink/50'}`}
              >
                min
              </div>
              <div
                className={`absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                  selectedDuration === 10 ? 'bg-white text-accent' : 'bg-accent text-white'
                }`}
              >
                Enhanced
              </div>
            </button>

            {/* 15 min - secondary option */}
            <button
              onClick={() => setSelectedDuration(15)}
              className={`w-16 h-16 rounded-xl transition-all ${
                selectedDuration === 15
                  ? 'bg-accent text-white'
                  : 'bg-elevated text-ink hover:bg-elevated/80'
              }`}
            >
              <div className="text-lg font-semibold">15</div>
              <div
                className={`text-[10px] ${
                  selectedDuration === 15 ? 'text-white/70' : 'text-ink/50'
                }`}
              >
                min
              </div>
            </button>
          </div>
        </div>

        {/* Pre-session assessment */}
        <div className="mb-6 bg-elevated rounded-xl p-4">
          <MindStateSlider
            value={preScore}
            onChange={setPreScore}
            label="How is your mind right now?"
          />
        </div>

        {/* CTA */}
        <button
          onClick={() => preScore !== null && onBegin(selectedDuration, preScore)}
          disabled={isLoading || preScore === null}
          className={`w-full h-14 font-medium rounded-xl transition-colors ${
            preScore !== null
              ? 'bg-accent hover:bg-accent-hover text-white'
              : 'bg-ink/10 text-ink/30 cursor-not-allowed'
          } disabled:opacity-50`}
        >
          {isLoading
            ? 'Starting...'
            : preScore === null
              ? 'Rate your mind state to begin'
              : 'Begin Practice'}
        </button>

        <p className="text-xs text-ink/40 mt-3 text-center">
          Visual focus only — no sound required
        </p>

        {/* Disclaimer */}
        <p className="text-[10px] text-ink/30 mt-2 text-center">Contains moving visual elements</p>
      </div>

      {/* CSS Animation for preview orb */}
      <style>{`
        @keyframes racing-mind-preview {
          0%, 100% {
            transform: translate(-50%, -50%) translateX(-40px);
          }
          50% {
            transform: translate(-50%, -50%) translateX(40px);
          }
        }
        .animate-racing-mind-preview {
          animation: racing-mind-preview 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
