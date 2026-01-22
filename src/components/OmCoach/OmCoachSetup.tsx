/**
 * OmCoachSetup - Pre-session setup screen for Aum Coach
 *
 * Features:
 * - Duration picker (5/10/15 min)
 * - Timing mode selector (Traditional 18s / Extended 24s / Long Breath 36s)
 * - Dynamic cycle count based on mode
 * - Instructions for A-U-M practice
 * - Audio settings for mobile sensitivity adjustment
 */

import { useState } from 'react'
import { OPTIMAL_NO_FREQUENCY } from '../../hooks/usePitchDetection'
import {
  type SessionDuration,
  type TimingMode,
  getSessionCycles,
  getCycleDuration,
} from '../../hooks/useGuidedOmCycle'
import {
  type ClarityPreset,
  type AudioSensitivitySettings,
  CLARITY_PRESETS,
  DEFAULT_SETTINGS,
} from '../../hooks/useAudioSensitivity'

interface OmCoachSetupProps {
  onBegin: (duration: SessionDuration, mode: TimingMode) => void
  isLoading?: boolean
  error?: string | null
  hasCalibration?: boolean
  onRecalibrate?: () => void
  onStartCalibration?: () => void
  // Audio sensitivity settings (optional)
  audioSettings?: AudioSensitivitySettings
  onAudioSettingsChange?: (settings: Partial<AudioSensitivitySettings>) => void
}

const DURATIONS: SessionDuration[] = [5, 10, 15]

const TIMING_MODE_INFO: Record<
  TimingMode,
  {
    label: string
    description: string
  }
> = {
  traditional: {
    label: 'Traditional',
    description: '18s cycle',
  },
  extended: {
    label: 'Extended',
    description: '24s cycle',
  },
  longbreath: {
    label: 'Long Breath',
    description: '36s cycle',
  },
}

const CLARITY_PRESET_ORDER: ClarityPreset[] = ['strict', 'normal', 'relaxed', 'very-relaxed']

export function OmCoachSetup({
  onBegin,
  isLoading,
  error,
  hasCalibration = false,
  onRecalibrate,
  onStartCalibration,
  audioSettings,
  onAudioSettingsChange,
}: OmCoachSetupProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showAudioSettings, setShowAudioSettings] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<SessionDuration>(5)
  const [selectedMode, setSelectedMode] = useState<TimingMode>('traditional')

  const estimatedCycles = getSessionCycles(selectedDuration, selectedMode)
  const cycleDuration = getCycleDuration(selectedMode)
  const cycleDurationSec = cycleDuration > 0 ? Math.round(cycleDuration / 1000) : null

  // Use provided settings or defaults
  const settings = audioSettings || DEFAULT_SETTINGS

  const handleGainChange = (value: number) => {
    onAudioSettingsChange?.({ gainMultiplier: value })
  }

  const handleClarityPresetChange = (preset: ClarityPreset) => {
    onAudioSettingsChange?.({ clarityPreset: preset })
  }

  const handleAutoGainToggle = () => {
    onAudioSettingsChange?.({ useAutoGain: !settings.useAutoGain })
  }

  const handleMedianFilterToggle = () => {
    onAudioSettingsChange?.({ useMedianFiltering: !settings.useMedianFiltering })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col min-h-full w-full max-w-md mx-auto px-6 py-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl text-ink mb-2">Aum Coach</h1>
          <p className="text-sm text-ink/60">Guided A-U-M practice with real-time feedback</p>
        </div>

        {/* Instructions */}
        <div className="bg-elevated rounded-xl p-4 mb-6">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-semibold text-accent">1</span>
              </div>
              <p className="text-sm text-ink">Follow the phases: Breathe → Ah → Oo → Mm</p>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-semibold text-accent">2</span>
              </div>
              <p className="text-sm text-ink">
                Match your pitch to ~{OPTIMAL_NO_FREQUENCY} Hz for all sounds
              </p>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-semibold text-accent">3</span>
              </div>
              <p className="text-sm text-ink">Complete cycles to build your alignment score</p>
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
                Humming at ~130 Hz increases nasal nitric oxide production 15-20x. Extended
                exhalation activates the parasympathetic nervous system. The A-U-M sequence engages
                different vocal resonances for full benefit.
              </p>
            </div>
          )}
        </div>

        {/* Voice Calibration Section */}
        {!hasCalibration && onStartCalibration && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 text-sm">!</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink mb-1">Voice Calibration Recommended</p>
                <p className="text-xs text-ink/60 mb-3">
                  Quick 15-second setup for better phoneme detection tailored to your voice.
                </p>
                <button
                  onClick={onStartCalibration}
                  className="text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                  Calibrate Now
                </button>
              </div>
            </div>
          </div>
        )}

        {hasCalibration && onRecalibrate && (
          <div className="flex items-center justify-between bg-elevated rounded-xl px-4 py-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-ink/70">Voice calibrated</span>
            </div>
            <button onClick={onRecalibrate} className="text-xs text-ink/50 hover:text-ink/70">
              Recalibrate
            </button>
          </div>
        )}

        {/* Audio Settings (collapsible) */}
        {onAudioSettingsChange && (
          <div className="mb-6">
            <button
              onClick={() => setShowAudioSettings(!showAudioSettings)}
              className="flex items-center justify-between w-full bg-elevated rounded-xl px-4 py-3"
            >
              <span className="text-sm text-ink/70">Audio Settings</span>
              <span className="text-xs text-ink/40">{showAudioSettings ? '−' : '+'}</span>
            </button>

            {showAudioSettings && (
              <div className="mt-2 bg-elevated rounded-xl p-4 space-y-4">
                {/* Manual Gain Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-ink/60">Microphone Sensitivity</label>
                    <span className="text-xs text-ink/40">
                      {settings.gainMultiplier.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.1"
                    value={settings.gainMultiplier}
                    onChange={(e) => handleGainChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-base rounded-lg appearance-none cursor-pointer accent-accent"
                    disabled={settings.useAutoGain}
                  />
                  <div className="flex justify-between text-[10px] text-ink/30 mt-1">
                    <span>Quieter</span>
                    <span>Louder</span>
                  </div>
                </div>

                {/* Auto Gain Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-ink/70">Auto-adjust sensitivity</p>
                    <p className="text-[10px] text-ink/40">
                      Automatically adapts to your mic level
                    </p>
                  </div>
                  <button
                    onClick={handleAutoGainToggle}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      settings.useAutoGain ? 'bg-accent' : 'bg-ink/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                        settings.useAutoGain ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Detection Threshold */}
                <div>
                  <label className="text-xs text-ink/60 block mb-2">Detection Threshold</label>
                  <div className="grid grid-cols-4 gap-1">
                    {CLARITY_PRESET_ORDER.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleClarityPresetChange(preset)}
                        className={`py-1.5 px-1 rounded-lg text-[10px] transition-colors ${
                          settings.clarityPreset === preset
                            ? 'bg-accent text-white'
                            : 'bg-base text-ink/60 hover:bg-base/80'
                        }`}
                      >
                        {CLARITY_PRESETS[preset].label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-ink/30 mt-1">
                    {settings.clarityPreset === 'strict' && 'Best for quiet environments'}
                    {settings.clarityPreset === 'normal' && 'Balanced for most situations'}
                    {settings.clarityPreset === 'relaxed' && 'Better for noisy environments'}
                    {settings.clarityPreset === 'very-relaxed' && 'Maximum sensitivity for mobile'}
                  </p>
                </div>

                {/* Smoothing Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-ink/70">Smoothing filter</p>
                    <p className="text-[10px] text-ink/40">Reduces erratic detection jumps</p>
                  </div>
                  <button
                    onClick={handleMedianFilterToggle}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      settings.useMedianFiltering ? 'bg-accent' : 'bg-ink/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                        settings.useMedianFiltering ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Spacer pushes controls to bottom on tall screens */}
        <div className="flex-1 min-h-4" />

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Timing Mode Picker */}
        <div className="mb-4">
          <p className="text-xs text-ink/50 mb-2 text-center uppercase tracking-wide">
            Timing Mode
          </p>
          <div className="flex gap-2">
            {(Object.keys(TIMING_MODE_INFO) as TimingMode[]).map((mode) => {
              const info = TIMING_MODE_INFO[mode]
              const isSelected = selectedMode === mode

              return (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`flex-1 py-2.5 px-2 rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-accent text-white'
                      : 'bg-elevated text-ink hover:bg-elevated/80'
                  }`}
                >
                  <div className="text-sm font-medium">{info.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-ink/50'}`}
                  >
                    {info.description}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Duration picker */}
        <div className="mb-6">
          <p className="text-xs text-ink/50 mb-2 text-center uppercase tracking-wide">Duration</p>
          <div className="flex gap-2">
            {DURATIONS.map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`flex-1 py-3 rounded-xl transition-colors ${
                  selectedDuration === duration
                    ? 'bg-accent text-white'
                    : 'bg-elevated text-ink hover:bg-elevated/80'
                }`}
              >
                <div className="text-xl font-semibold">{duration}</div>
                <div
                  className={`text-xs ${
                    selectedDuration === duration ? 'text-white/70' : 'text-ink/50'
                  }`}
                >
                  min
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-ink/40 mt-2 text-center">
            {estimatedCycles} cycles ({cycleDurationSec}s each)
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => onBegin(selectedDuration, selectedMode)}
          disabled={isLoading}
          className="w-full h-14 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Starting...' : 'Begin Practice'}
        </button>

        <p className="text-xs text-ink/40 mt-3 text-center">Requires microphone access</p>
      </div>
    </div>
  )
}
