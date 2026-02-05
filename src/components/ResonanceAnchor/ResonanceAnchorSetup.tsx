/**
 * ResonanceAnchorSetup - Pre-session setup screen
 *
 * Features:
 * - Duration picker (5/10/15 min, 10 recommended)
 * - Pre-session "mental noise" slider (reuses MindStateSlider)
 * - Instructions: "Hold phone to chest, hum when the orb glows"
 * - "Show science" expandable section
 * - Microphone permission awareness
 * - CTA: "Begin Practice"
 *
 * Follows RacingMindSetup pattern.
 */

import { useState } from 'react'
import { MindStateSlider } from '../RacingMind/MindStateSlider'

export type SessionDuration = 5 | 10 | 15

interface ResonanceAnchorSetupProps {
  onBegin: (duration: SessionDuration, preScore: number) => void
  isLoading?: boolean
}

export function ResonanceAnchorSetup({ onBegin, isLoading }: ResonanceAnchorSetupProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<SessionDuration>(10)
  const [preScore, setPreScore] = useState<number | null>(null)

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col min-h-full w-full max-w-md mx-auto px-6 py-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl text-ink mb-2">Resonance Anchor</h1>
          <p className="text-sm text-ink/60">Find your center through sound and vibration</p>
        </div>

        {/* Visual Preview - CSS animated orb */}
        <div className="relative bg-[#0A0A12] rounded-xl h-32 mb-6 overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full animate-resonance-preview"
            style={{
              background: 'radial-gradient(circle, #00CED1 0%, #4B0082 50%, transparent 70%)',
              boxShadow: '0 0 40px 15px rgba(0, 206, 209, 0.3)',
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
              <p className="text-sm text-ink">Hold your phone against your chest with both hands</p>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-semibold text-accent">2</span>
              </div>
              <p className="text-sm text-ink">
                When the orb glows, hum a low steady tone — like "hmmm" or "om"
              </p>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-semibold text-accent">3</span>
              </div>
              <p className="text-sm text-ink">
                Feel the vibration in your hands match the vibration in your chest
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
                Exhale-dominant slow breathing activates the parasympathetic nervous system (Hayashi
                2018, Lehrer & Gevirtz 2014). Humming provides articulatory suppression of racing
                thoughts by occupying the verbal-motor system (Baddeley Working Memory Model). Slow
                breathing at 4.5-6.5 breaths per minute maximizes heart rate variability through
                respiratory sinus arrhythmia resonance.
              </p>
            </div>
          )}
        </div>

        {/* Microphone note */}
        <p className="text-xs text-ink/40 mb-6 text-center">
          Requires microphone access to detect your voice
        </p>

        {/* Spacer pushes controls to bottom on tall screens */}
        <div className="flex-1 min-h-4" />

        {/* Duration picker */}
        <div className="mb-6">
          <p className="text-xs text-ink/50 mb-3 text-center uppercase tracking-wide">Duration</p>
          <div className="flex items-center justify-center gap-3">
            {/* 5 min */}
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
                Recommended
              </div>
            </button>

            {/* 15 min */}
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
          <MindStateSlider value={preScore} onChange={setPreScore} scaleType="racing" />
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
          Sound and haptic feedback — headphones not recommended
        </p>
      </div>

      {/* CSS Animation for preview orb */}
      <style>{`
        @keyframes resonance-preview {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.7);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 1;
          }
        }
        .animate-resonance-preview {
          animation: resonance-preview 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
