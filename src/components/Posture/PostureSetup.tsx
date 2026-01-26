/**
 * PostureSetup - Pre-session setup screen
 *
 * Features:
 * - Device compatibility check
 * - AirPods connection status
 * - Calibration status
 * - Instructions for posture practice
 */

interface PostureSetupProps {
  isSupported: boolean | null
  isDeviceConnected: boolean
  isCalibrated: boolean
  onCalibrate: () => void
  onBegin: () => void
}

export function PostureSetup({
  isSupported,
  isDeviceConnected,
  isCalibrated,
  onCalibrate,
  onBegin,
}: PostureSetupProps) {
  // Loading state
  if (isSupported === null) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  // Not supported
  if (!isSupported) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col min-h-full w-full max-w-md mx-auto px-6 py-6">
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl text-ink mb-2">Perfect Posture</h1>
            <p className="text-sm text-ink/60">iOS 14+ required</p>
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
                <p className="text-sm text-ink/60">This feature requires iOS 14 or later</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

        {/* Visual Preview - Posture illustration */}
        <div className="relative bg-gradient-to-b from-[#F97316]/10 to-[#C2410C]/5 rounded-xl h-32 mb-6 overflow-hidden flex items-center justify-center">
          <div className="flex items-end gap-8">
            {/* Good posture silhouette */}
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

            {/* Bad posture silhouette */}
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

        {/* AirPods Connection Status */}
        <div
          className={`rounded-xl p-4 mb-4 ${isDeviceConnected ? 'bg-[#22C55E]/10' : 'bg-[#F97316]/10'}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${isDeviceConnected ? 'bg-[#22C55E]/20' : 'bg-[#F97316]/20'}`}
            >
              {/* AirPods icon */}
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

        {/* Instructions */}
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

        {/* Spacer pushes CTA to bottom */}
        <div className="flex-1 min-h-4" />

        {/* CTA */}
        <button
          onClick={onBegin}
          disabled={!isDeviceConnected || !isCalibrated}
          className={`w-full h-14 font-medium rounded-xl transition-colors ${
            isDeviceConnected && isCalibrated
              ? 'bg-accent hover:bg-accent-hover text-white'
              : 'bg-ink/10 text-ink/30 cursor-not-allowed'
          }`}
        >
          {!isDeviceConnected
            ? 'Connect AirPods to Begin'
            : !isCalibrated
              ? 'Calibrate First'
              : 'Begin Practice'}
        </button>

        <p className="text-xs text-ink/40 mt-3 text-center">
          Works with AirPods Pro, AirPods Max, or AirPods 3rd gen
        </p>
      </div>
    </div>
  )
}
