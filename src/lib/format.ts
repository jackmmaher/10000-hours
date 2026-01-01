// Format seconds as HH:MM:SS
export function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  return [
    h.toString().padStart(2, '0'),
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0')
  ].join(':')
}

// Format total hours with one decimal
export function formatTotalHours(seconds: number): string {
  const hours = seconds / 3600
  return hours.toFixed(1)
}

// Format duration in human readable form
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours === 0) {
    return `${minutes} min`
  }

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}

// Format as "+ X min" or "+ X hr Y min" for session complete feedback
export function formatSessionAdded(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours === 0) {
    return `+${minutes} min`
  }

  if (minutes === 0) {
    return `+${hours} hr`
  }

  return `+${hours} hr ${minutes} min`
}

// Format date as "January 2026"
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// Format date as "Jan 2025"
export function formatShortMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// Format date as "January 1, 2026"
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

// Format time as "6:00 AM"
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Format as "March 2031"
export function formatProjectedDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// Format large numbers with commas
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

// Format days remaining
export function formatDaysRemaining(days: number): string {
  if (days < 365) {
    return `${Math.round(days)} days`
  }
  const years = days / 365
  if (years < 2) {
    return `${Math.round(days)} days`
  }
  return `~${years.toFixed(1)} years`
}
