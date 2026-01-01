import { useEffect, useState } from 'react'
import { ZEN_MESSAGE_BEFORE, ZEN_MESSAGE_AFTER } from '../lib/constants'

interface ZenMessageProps {
  isEnlightened: boolean
  onComplete: () => void
  variant: 'before' | 'after'
}

export function ZenMessage({ isEnlightened, onComplete, variant }: ZenMessageProps) {
  const [visibleWords, setVisibleWords] = useState(0)
  const [fading, setFading] = useState(false)

  const message = variant === 'after' || isEnlightened
    ? ZEN_MESSAGE_AFTER
    : ZEN_MESSAGE_BEFORE

  const words = message.split(' ')

  // Slower timing for enlightenment reveal
  const isEnlightenmentReveal = variant === 'after'
  const wordDelay = isEnlightenmentReveal ? 500 : 400
  const holdDuration = isEnlightenmentReveal ? 4000 : 2000
  const fadeOutDuration = isEnlightenmentReveal ? 1000 : 800

  useEffect(() => {
    // Animate words appearing one by one
    const wordTimers: ReturnType<typeof setTimeout>[] = []

    words.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleWords(index + 1)
      }, (index + 1) * wordDelay)
      wordTimers.push(timer)
    })

    // Hold, then fade out
    const holdTimer = setTimeout(() => {
      setFading(true)
    }, words.length * wordDelay + holdDuration)

    // Complete after fade
    const completeTimer = setTimeout(() => {
      onComplete()
    }, words.length * wordDelay + holdDuration + fadeOutDuration)

    return () => {
      wordTimers.forEach(clearTimeout)
      clearTimeout(holdTimer)
      clearTimeout(completeTimer)
    }
  }, [words.length, wordDelay, holdDuration, fadeOutDuration, onComplete])

  return (
    <div
      className={`
        fixed inset-0 flex items-center justify-center bg-cream z-50
        transition-opacity duration-800
        ${fading ? 'opacity-0' : 'opacity-100'}
      `}
      style={{ transitionDuration: `${fadeOutDuration}ms` }}
    >
      <p className="font-serif text-2xl text-indigo-deep text-center px-8 leading-relaxed">
        {words.map((word, index) => (
          <span
            key={index}
            className={`
              inline-block mr-2 transition-opacity duration-400
              ${index < visibleWords ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {word}
          </span>
        ))}
      </p>
    </div>
  )
}
