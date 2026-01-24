/**
 * PhonePositioning - Phone setup instructions before calibration
 *
 * Guides user to:
 * - Hold phone at eye level with one hand
 * - Tap calibration dots with other hand
 * - Keep head still during calibration
 * - Ensure good lighting on face
 */

interface PhonePositioningProps {
  onReady: () => void
  onSkip: () => void
}

export function PhonePositioning({ onReady, onSkip }: PhonePositioningProps) {
  return (
    <div className="h-full flex flex-col bg-base">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col min-h-full w-full max-w-md mx-auto px-6 py-8">
          {/* Title */}
          <h2 className="font-serif text-xl text-ink text-center mb-2 mt-4">
            Calibrate Eye Tracking
          </h2>
          <p className="text-sm text-ink/60 text-center mb-8">Tap each dot while looking at it</p>

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <InstructionItem
              icon={<PhoneIcon />}
              title="Hold at eye level"
              description="One hand holds the phone, comfortably in front of you"
            />

            <InstructionItem
              icon={<TapIcon />}
              title="Tap each dot"
              description="Look at the dot, then tap it with your other hand"
            />

            <InstructionItem
              icon={<HeadIcon />}
              title="Keep your head still"
              description="Move only your eyes to follow each dot"
            />

            <InstructionItem
              icon={<LightIcon />}
              title="Good lighting on face"
              description="Face a light source, avoid backlight"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1 min-h-4" />

          {/* CTA */}
          <button
            onClick={onReady}
            className="w-full h-14 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors mb-3"
          >
            I'm Ready
          </button>

          <button
            onClick={onSkip}
            className="w-full py-3 text-sm text-ink/50 hover:text-ink/70 transition-colors"
          >
            Skip calibration
          </button>
        </div>
      </div>
    </div>
  )
}

interface InstructionItemProps {
  icon: React.ReactNode
  title: string
  description: string
}

function InstructionItem({ icon, title, description }: InstructionItemProps) {
  return (
    <div className="flex gap-4 p-4 bg-elevated rounded-xl">
      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-ink mb-0.5">{title}</p>
        <p className="text-xs text-ink/60">{description}</p>
      </div>
    </div>
  )
}

// Icons
function PhoneIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    </svg>
  )
}

function TapIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
      />
    </svg>
  )
}

function HeadIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
      />
    </svg>
  )
}

function LightIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
    </svg>
  )
}
