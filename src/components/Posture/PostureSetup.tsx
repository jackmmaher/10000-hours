/**
 * PostureSetup - Pre-session setup screen
 *
 * Features:
 * - Mode toggle: AirPods or Camera
 * - Device compatibility check
 * - AirPods connection status (AirPods mode)
 * - Camera support status (Camera mode)
 * - Calibration status
 * - Duration picker (Camera mode)
 * - Instructions for posture practice
 */

export type PostureMode = 'airpods' | 'camera'

interface PostureSetupProps {
  isSupported: boolean | null
  isDeviceConnected: boolean
  isCalibrated: boolean
  isCameraSupported: boolean | null
  isCameraCalibrated: boolean
  mode: PostureMode
  onModeChange: (mode: PostureMode) => void
  selectedDuration: number
  onDurationChange: (minutes: number) => void
  onCalibrate: () => void
  onBegin: () => void
}

const DURATION_OPTIONS = [5, 10, 15, 20]

export function PostureSetup({
  isSupported,
  isDeviceConnected,
  isCalibrated,
  isCameraSupported,
  isCameraCalibrated,
  mode,
  onModeChange,
  selectedDuration,
  onDurationChange,
  onCalibrate,
  onBegin,
}: PostureSetupProps) {
  // Loading state
  if (isSupported === null && isCameraSupported === null) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  // Neither mode supported
  if (isSupported === false && isCameraSupported === false) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col min-h-full w-full max-w-md mx-auto px-6 py-6">
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl text-ink mb-2">Perfect Posture</h1>
            <p className="text-sm text-ink/60">Not available on this device</p>
          </div>

          <div className="bg-elevated rounded-xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-ink/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-ink/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-ink">Not Available</p>
                <p className="text-sm text-ink/60">
                  Requires AirPods (iOS 14+) or a camera-enabled device
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Determine if each mode is available
  const airpodsAvailable = isSupported !== false
  const cameraAvailable = isCameraSupported !== false

  // CTA enabled logic
  const canBegin = mode === 'airpods' ? isDeviceConnected && isCalibrated : cameraAvailable

  // CTA label
  const ctaLabel =
    mode === 'airpods'
      ? !isDeviceConnected
        ? 'Connect AirPods to Begin'
        : !isCalibrated
          ? 'Calibrate First'
          : 'Begin Practice'
      : 'Begin Practice'

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col min-h-full w-full max-w-md mx-auto px-6 py-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl text-ink mb-2">Perfect Posture</h1>
          <p className="text-sm text-ink/60">
            Gentle reminders to sit up straight during meditation
          </p>
        </div>

        {/* Visual Preview */}
        <div className="relative bg-gradient-to-b from-[#F97316]/10 to-[#C2410C]/5 rounded-xl h-32 mb-6 overflow-hidden flex items-center justify-center">
          <div className="flex items-end gap-8">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-[#F97316]/30 mb-1" />
              <div className="w-4 h-12 bg-[#F97316]/20 rounded-sm" />
              <svg className="w-4 h-4 text-[#22C55E] mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex flex-col items-center opacity-50">
              <div className="w-6 h-6 rounded-full bg-ink/20 mb-1 translate-x-2" />
              <div className="w-4 h-12 bg-ink/10 rounded-sm -rotate-12 origin-bottom" />
              <svg className="w-4 h-4 text-[#EF4444] mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-elevated rounded-xl p-1 mb-6">
          <button
            onClick={() => onModeChange('airpods')}
            disabled={!airpodsAvailable}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              mode === 'airpods'
                ? 'bg-accent text-white shadow-sm'
                : airpodsAvailable
                  ? 'text-ink/60 hover:text-ink'
                  : 'text-ink/25 cursor-not-allowed'
            }`}
          >
            AirPods
          </button>
          <button
            onClick={() => onModeChange('camera')}
            disabled={!cameraAvailable}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              mode === 'camera'
                ? 'bg-accent text-white shadow-sm'
                : cameraAvailable
                  ? 'text-ink/60 hover:text-ink'
                  : 'text-ink/25 cursor-not-allowed'
            }`}
          >
            Camera
          </button>
        </div>

        {/* Mode-specific content */}
        {mode === 'airpods' ? (
          <>
            {/* AirPods Connection Status */}
            <div
              className={`rounded-xl p-4 mb-4 ${isDeviceConnected ? 'bg-[#22C55E]/10' : 'bg-[#F97316]/10'}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${isDeviceConnected ? 'bg-[#22C55E]/20' : 'bg-[#F97316]/20'}`}
                >
                  <svg
                    className={`w-5 h-5 ${isDeviceConnected ? 'text-[#22C55E]' : 'text-[#F97316]'}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6 3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h.5v4a1.5 1.5 0 0 0 3 0v-4H10a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6zm12 0a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h.5v4a1.5 1.5 0 0 0 3 0v-4H22a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${isDeviceConnected ? 'text-[#22C55E]' : 'text-[#F97316]'}`}
                  >
                    {isDeviceConnected ? 'AirPods Connected' : 'AirPods Not Connected'}
                  </p>
                  <p className="text-sm text-ink/60">
                    {isDeviceConnected
                      ? 'Motion sensors ready'
                      : 'Connect AirPods Pro, Max, or 3rd gen'}
                  </p>
                </div>
              </div>
            </div>

            {/* AirPods instructions */}
            <div className="bg-elevated rounded-xl p-4 mb-6">
              <h3 className="font-medium text-ink mb-3">How it works</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-semibold text-accent">1</span>
                  </div>
                  <p className="text-sm text-ink">
                    Calibrate your ideal seated posture with AirPods in
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-semibold text-accent">2</span>
                  </div>
                  <p className="text-sm text-ink">
                    AirPods track your head position using motion sensors
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-semibold text-accent">3</span>
                  </div>
                  <p className="text-sm text-ink">
                    A gentle iPhone vibration reminds you when you slouch
                  </p>
                </div>
              </div>
            </div>

            {/* Calibration Status */}
            <div className="bg-elevated rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${isCalibrated ? 'bg-[#22C55E]' : 'bg-ink/20'}`}
                  />
                  <div>
                    <p className="font-medium text-ink">
                      {isCalibrated ? 'Calibrated' : 'Not Calibrated'}
                    </p>
                    <p className="text-xs text-ink/50">
                      {isCalibrated ? 'Your good posture is saved' : 'Set your baseline posture'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onCalibrate}
                  disabled={!isDeviceConnected}
                  className="px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalibrated ? 'Recalibrate' : 'Calibrate'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Camera instructions */}
            <div className="bg-elevated rounded-xl p-4 mb-6">
              <h3 className="font-medium text-ink mb-3">How it works</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-semibold text-accent">1</span>
                  </div>
                  <p className="text-sm text-ink">
                    Position phone 3-4 feet away, facing you at eye level
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-semibold text-accent">2</span>
                  </div>
                  <p className="text-sm text-ink">
                    Camera tracks your shoulders, head, and spine alignment
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-semibold text-accent">3</span>
                  </div>
                  <p className="text-sm text-ink">
                    Video fades to 5 floating dots of light with alignment feedback
                  </p>
                </div>
              </div>
            </div>

            {/* Duration picker */}
            <div className="bg-elevated rounded-xl p-4 mb-6">
              <h3 className="font-medium text-ink mb-3">Duration</h3>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((min) => (
                  <button
                    key={min}
                    onClick={() => onDurationChange(min)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      selectedDuration === min
                        ? 'bg-accent text-white'
                        : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>

            {/* Camera calibration status */}
            <div className="bg-elevated rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${isCameraCalibrated ? 'bg-[#22C55E]' : 'bg-ink/20'}`}
                />
                <div>
                  <p className="font-medium text-ink">
                    {isCameraCalibrated ? 'Camera Calibrated' : 'Calibration on Start'}
                  </p>
                  <p className="text-xs text-ink/50">
                    {isCameraCalibrated
                      ? 'Your baseline posture is saved'
                      : "You'll calibrate after positioning"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        {/* CTA */}
        <button
          onClick={onBegin}
          disabled={!canBegin}
          className={`w-full h-14 font-medium rounded-xl transition-colors ${
            canBegin
              ? 'bg-accent hover:bg-accent-hover text-white'
              : 'bg-ink/10 text-ink/30 cursor-not-allowed'
          }`}
        >
          {ctaLabel}
        </button>

        <p className="text-xs text-ink/40 mt-3 text-center">
          {mode === 'airpods'
            ? 'Works with AirPods Pro, AirPods Max, or AirPods 3rd gen'
            : 'Uses front camera for pose estimation'}
        </p>
      </div>
    </div>
  )
}
