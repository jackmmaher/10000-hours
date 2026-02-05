/**
 * Interstellar Tick Sound Synthesis
 *
 * Ported from cumulative-clock-v11.jsx's playTick function.
 * Synthesizes a Zimmer-inspired clock tick with three components:
 *
 * 1. Click: Bandpass-filtered noise burst (sharp transient attack)
 * 2. Body: Damped 220Hz sine wave (warm tonal character)
 * 3. Resonance: Very quiet 110Hz sine (subtle room presence)
 *
 * The noise buffer is pre-created once and reused across ticks
 * to avoid per-tick AudioBuffer allocation.
 *
 * Pure function — no React dependency.
 */

const CLICK_DURATION = 0.015 // 15ms noise burst
const BODY_FREQUENCY = 220 // A3 — warm but not boomy
const RESONANCE_FREQUENCY = 110 // A2 — sub presence
const DEFAULT_VOLUME = 0.15 // Lowered from v11's 0.3 for meditation context

// Pre-created noise buffer (lazily initialized, reused across all ticks)
let cachedNoiseBuffer: AudioBuffer | null = null
let cachedSampleRate: number = 0

/**
 * Get or create the pre-computed noise buffer for the click component.
 * Cached per sample rate — if the AudioContext sample rate changes,
 * we regenerate (extremely rare in practice).
 */
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (cachedNoiseBuffer && cachedSampleRate === ctx.sampleRate) {
    return cachedNoiseBuffer
  }

  const bufferLength = Math.ceil(ctx.sampleRate * CLICK_DURATION)
  const buffer = ctx.createBuffer(1, bufferLength, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < data.length; i++) {
    // Shaped noise: random values with exponential decay envelope baked in
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3))
  }

  cachedNoiseBuffer = buffer
  cachedSampleRate = ctx.sampleRate
  return buffer
}

/**
 * Play the Interstellar-inspired tick sound.
 *
 * @param ctx - An active AudioContext (caller manages lifecycle)
 * @param volume - Master volume multiplier (default: 0.15)
 */
export function playInterstellarTick(ctx: AudioContext, volume: number = DEFAULT_VOLUME): void {
  const now = ctx.currentTime

  // Master gain for the tick
  const masterGain = ctx.createGain()
  masterGain.connect(ctx.destination)
  masterGain.gain.value = volume

  // === CLICK COMPONENT (noise burst) ===
  const clickGain = ctx.createGain()
  clickGain.connect(masterGain)
  clickGain.gain.setValueAtTime(0.8, now)
  clickGain.gain.exponentialRampToValueAtTime(0.01, now + CLICK_DURATION)

  const noiseSource = ctx.createBufferSource()
  noiseSource.buffer = getNoiseBuffer(ctx)

  // Bandpass filter to shape the click
  const clickFilter = ctx.createBiquadFilter()
  clickFilter.type = 'bandpass'
  clickFilter.frequency.value = 2000
  clickFilter.Q.value = 1

  noiseSource.connect(clickFilter)
  clickFilter.connect(clickGain)
  noiseSource.start(now)
  noiseSource.stop(now + CLICK_DURATION)

  // === BODY COMPONENT (damped tone) ===
  const bodyOsc = ctx.createOscillator()
  const bodyGain = ctx.createGain()

  bodyOsc.type = 'sine'
  bodyOsc.frequency.value = BODY_FREQUENCY

  bodyGain.gain.setValueAtTime(0.15, now)
  bodyGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)

  bodyOsc.connect(bodyGain)
  bodyGain.connect(masterGain)

  bodyOsc.start(now)
  bodyOsc.stop(now + 0.1)

  // === RESONANCE COMPONENT (subtle room) ===
  const resoOsc = ctx.createOscillator()
  const resoGain = ctx.createGain()

  resoOsc.type = 'sine'
  resoOsc.frequency.value = RESONANCE_FREQUENCY

  resoGain.gain.setValueAtTime(0.05, now)
  resoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

  resoOsc.connect(resoGain)
  resoGain.connect(masterGain)

  resoOsc.start(now)
  resoOsc.stop(now + 0.2)
}
