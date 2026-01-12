/**
 * ReciprocityCard - Shows community give/receive balance
 *
 * Visualizes:
 * - What you've received (upvotes, saves, completions on your content)
 * - What you've given (upvotes, saves, completions of others' content)
 * - Balance indicator (generous / balanced / receiving support)
 *
 * Oxytocin trigger: Seeing the mutual flow of community support.
 * No judgment language - all states are positive.
 */

import type { ReciprocityData } from '../lib/reciprocity'

interface Props {
  data: ReciprocityData
}

export function ReciprocityCard({ data }: Props) {
  const receivedTotal = data.received.karma + data.received.saves + data.received.completions
  const givenTotal = data.given.karma + data.given.saves + data.given.completions

  // Calculate balance ratio
  const ratio = givenTotal / Math.max(receivedTotal, 1)
  const balance = ratio >= 1.2 ? 'generous' : ratio >= 0.8 ? 'balanced' : 'receiver'

  // All states are positive - no judgment
  const balanceMessages = {
    generous: 'You give more than you receive',
    balanced: 'Beautiful balance of give and take',
    receiver: 'The community is supporting you',
  }

  // Don't show if no community interaction at all
  if (receivedTotal === 0 && givenTotal === 0) {
    return null
  }

  return (
    <div className="bg-card/90 backdrop-blur-md rounded-2xl p-4 border border-ink/5 shadow-sm">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="font-serif text-lg text-ink">Community Flow</h3>
        <p className="text-xs text-ink-soft mt-1">Your give and receive</p>
      </div>

      {/* Give/Receive Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Given */}
        <div className="text-center">
          <p className="text-2xl font-medium text-ink">{givenTotal}</p>
          <p className="text-xs text-ink-soft">Given</p>
          <div className="text-xs text-ink/40 mt-1 space-y-0.5">
            {data.given.karma > 0 && <p>{data.given.karma} votes</p>}
            {data.given.saves > 0 && <p>{data.given.saves} saves</p>}
            {data.given.completions > 0 && <p>{data.given.completions} completions</p>}
          </div>
        </div>

        {/* Received */}
        <div className="text-center">
          <p className="text-2xl font-medium text-ink">{receivedTotal}</p>
          <p className="text-xs text-ink-soft">Received</p>
          <div className="text-xs text-ink/40 mt-1 space-y-0.5">
            {data.received.karma > 0 && <p>{data.received.karma} votes</p>}
            {data.received.saves > 0 && <p>{data.received.saves} saves</p>}
            {data.received.completions > 0 && <p>{data.received.completions} completions</p>}
          </div>
        </div>
      </div>

      {/* Balance message */}
      <p className="text-center text-sm text-ink/50 mt-4 italic">{balanceMessages[balance]}</p>
    </div>
  )
}
