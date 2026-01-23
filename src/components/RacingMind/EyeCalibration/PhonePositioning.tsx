/**
 * PhonePositioning - Phone setup instructions before calibration
 *
 * Guides user to:
 * - Prop phone at eye level (not handheld or flat)
 * - Position at arm's length (~40-50cm)
 * - Keep head still during session
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
          {/* Illustration */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48">
              {/* Phone illustration */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {/* Phone body */}
                <div
                  className="w-16 h-28 rounded-xl border-2 border-ink/20 bg-elevated relative"
                  style={{ transform: 'perspective(200px) rotateY(-5deg)' }}
                >
                  {/* Screen */}
                  <div className="absolute inset-2 rounded-lg bg-accent/10" />
                  {/* Camera dot */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-ink/30" />
                </div>
                {/* Stand indication */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-ink/10 rounded-full" />
              </div>

              {/* User face (simplified) */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-12 h-14 rounded-full border-2 border-ink/20 relative">
                  {/* Eyes */}
                  <div className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full bg-ink/40" />
                  <div className="absolute top-4 right-2 w-1.5 h-1.5 rounded-full bg-ink/40" />
                  {/* Eye tracking lines */}
                  <svg
                    className="absolute -left-8 top-4 w-8 h-2 text-accent/40"
                    viewBox="0 0 32 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  >
                    <line x1="0" y1="2" x2="28" y2="2" />
                    <line x1="0" y1="6" x2="28" y2="6" />
                  </svg>
                </div>
              </div>

              {/* Distance indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1">
                <div className="w-8 h-px bg-ink/20" />
                <span className="text-[10px] text-ink/40">40-50cm</span>
                <div className="w-8 h-px bg-ink/20" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="font-serif text-xl text-ink text-center mb-2">Position Your Phone</h2>
          <p className="text-sm text-ink/60 text-center mb-8">
            For accurate eye tracking during your session
          </p>

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <InstructionItem
              icon={<PhoneIcon />}
              title="Prop at eye level"
              description="Lean against something stable. Don't hold or lay flat."
            />

            <InstructionItem
              icon={<DistanceIcon />}
              title="Arm's length away"
              description="About 40-50cm (16-20 inches) from your face"
            />

            <InstructionItem
              icon={<HeadIcon />}
              title="Keep your head still"
              description="Let only your eyes follow the orb during practice"
            />

            <InstructionItem
              icon={<LightIcon />}
              title="Good lighting on face"
              description="Avoid bright light behind you (backlight)"
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

function DistanceIcon() {
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
        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
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
