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
    receiver: 'The community is supporting you'
  }

  // Don't show if no community interaction at all
  if (receivedTotal === 0 && givenTotal === 0) {
    return null
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-indigo-deep/5">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="font-serif text-lg text-indigo-deep">Community Flow</h3>
        <p className="text-xs text-indigo-deep/50 mt-1">Your give and receive</p>
      </div>

      {/* Give/Receive Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Given */}
        <div className="text-center">
          <p className="text-2xl font-medium text-indigo-deep">{givenTotal}</p>
          <p className="text-xs text-indigo-deep/60">Given</p>
          <div className="text-xs text-indigo-deep/40 mt-1 space-y-0.5">
            {data.given.karma > 0 && <p>{data.given.karma} votes</p>}
            {data.given.saves > 0 && <p>{data.given.saves} saves</p>}
            {data.given.completions > 0 && <p>{data.given.completions} completions</p>}
          </div>
        </div>

        {/* Received */}
        <div className="text-center">
          <p className="text-2xl font-medium text-indigo-deep">{receivedTotal}</p>
          <p className="text-xs text-indigo-deep/60">Received</p>
          <div className="text-xs text-indigo-deep/40 mt-1 space-y-0.5">
            {data.received.karma > 0 && <p>{data.received.karma} votes</p>}
            {data.received.saves > 0 && <p>{data.received.saves} saves</p>}
            {data.received.completions > 0 && <p>{data.received.completions} completions</p>}
          </div>
        </div>
      </div>

      {/* Balance message */}
      <p className="text-center text-sm text-indigo-deep/50 mt-4 italic">
        {balanceMessages[balance]}
      </p>
    </div>
  )
}
