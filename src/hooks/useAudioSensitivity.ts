/**
 * useAudioSensitivity - User-adjustable audio sensitivity settings
 *
 * Provides manual fallback controls when auto-gain doesn't work well.
 * Settings persist to localStorage for cross-session consistency.
 *
 * Settings:
 * - gainMultiplier: Manual gain adjustment (0.5x - 4x)
 * - clarityThreshold: Detection sensitivity (Strict/Normal/Relaxed/Very Relaxed)
 * - useAutoGain: Enable/disable automatic gain normalization
 * - useMedianFiltering: Enable/disable median filter smoothing
 */

import { useState, useCallback, useEffect } from 'react'

// LocalStorage key
const STORAGE_KEY = 'aum-audio-sensitivity'

/**
 * Clarity threshold presets
 */
export type ClarityPreset = 'strict' | 'normal' | 'relaxed' | 'very-relaxed'

export const CLARITY_PRESETS: Record<ClarityPreset, { label: string; value: number }> = {
  strict: { label: 'Strict', value: 0.85 },
  normal: { label: 'Normal', value: 0.75 },
  relaxed: { label: 'Relaxed', value: 0.65 },
  'very-relaxed': { label: 'Very Relaxed', value: 0.55 },
}

/**
 * Audio sensitivity settings
 */
export interface AudioSensitivitySettings {
  gainMultiplier: number // 0.5 - 4.0
  clarityPreset: ClarityPreset
  useAutoGain: boolean
  useMedianFiltering: boolean
}

/**
 * Default settings - optimized for most devices
 */
export const DEFAULT_SETTINGS: AudioSensitivitySettings = {
  gainMultiplier: 1.0,
  clarityPreset: 'normal',
  useAutoGain: true,
  useMedianFiltering: true,
}

/**
 * Validate settings structure
 */
function isValidSettings(obj: unknown): obj is AudioSensitivitySettings {
  if (!obj || typeof obj !== 'object') return false
  const settings = obj as Record<string, unknown>

  return (
    typeof settings.gainMultiplier === 'number' &&
    settings.gainMultiplier >= 0.5 &&
    settings.gainMultiplier <= 4.0 &&
    typeof settings.clarityPreset === 'string' &&
    settings.clarityPreset in CLARITY_PRESETS &&
    typeof settings.useAutoGain === 'boolean' &&
    typeof settings.useMedianFiltering === 'boolean'
  )
}

/**
 * Load settings from localStorage
 */
function loadFromStorage(): AudioSensitivitySettings {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_SETTINGS

    const parsed: unknown = JSON.parse(stored)
    if (isValidSettings(parsed)) {
      return parsed
    }
    return DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

/**
 * Save settings to localStorage
 */
function saveToStorage(settings: AudioSensitivitySettings): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[AudioSensitivity] Failed to save:', err)
    }
  }
}

export interface UseAudioSensitivityResult {
  settings: AudioSensitivitySettings
  // Individual setters
  setGainMultiplier: (value: number) => void
  setClarityPreset: (preset: ClarityPreset) => void
  setUseAutoGain: (enabled: boolean) => void
  setUseMedianFiltering: (enabled: boolean) => void
  // Bulk update
  updateSettings: (partial: Partial<AudioSensitivitySettings>) => void
  // Reset to defaults
  resetToDefaults: () => void
  // Get computed clarity threshold value
  getClarityThreshold: () => number
}

export function useAudioSensitivity(): UseAudioSensitivityResult {
  const [settings, setSettings] = useState<AudioSensitivitySettings>(() => loadFromStorage())

  // Save to storage whenever settings change
  useEffect(() => {
    saveToStorage(settings)
  }, [settings])

  const setGainMultiplier = useCallback((value: number) => {
    setSettings((prev) => ({
      ...prev,
      gainMultiplier: Math.max(0.5, Math.min(4.0, value)),
    }))
  }, [])

  const setClarityPreset = useCallback((preset: ClarityPreset) => {
    setSettings((prev) => ({
      ...prev,
      clarityPreset: preset,
    }))
  }, [])

  const setUseAutoGain = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      useAutoGain: enabled,
    }))
  }, [])

  const setUseMedianFiltering = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      useMedianFiltering: enabled,
    }))
  }, [])

  const updateSettings = useCallback((partial: Partial<AudioSensitivitySettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...partial,
    }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const getClarityThreshold = useCallback(() => {
    return CLARITY_PRESETS[settings.clarityPreset].value
  }, [settings.clarityPreset])

  return {
    settings,
    setGainMultiplier,
    setClarityPreset,
    setUseAutoGain,
    setUseMedianFiltering,
    updateSettings,
    resetToDefaults,
    getClarityThreshold,
  }
}
