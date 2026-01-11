/**
 * Journey Utility Functions
 */

/**
 * Get Monday of the current week at midnight
 */
export function getMondayOfWeek(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  return monday
}
