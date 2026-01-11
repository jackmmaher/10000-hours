/**
 * Color Utility Functions
 *
 * Color parsing, manipulation, and interpolation utilities for theme transitions.
 */

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Parse rgba string to components
 */
export function parseRgba(rgba: string): { r: number; g: number; b: number; a: number } | null {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1,
    }
  }
  return null
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

/**
 * Calculate relative luminance of a color (WCAG formula)
 * Used for contrast ratio calculations
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1) || parseRgba(color1)
  const rgb2 = hexToRgb(color2) || parseRgba(color2)

  if (!rgb1 || !rgb2) return 1 // Fallback if parsing fails

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Calculate HSL saturation of a color
 * Returns a value between 0 and 1
 */
export function getSaturation(color: string): number {
  const rgb = hexToRgb(color) || parseRgba(color)
  if (!rgb) return 0

  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return 0 // achromatic

  const d = max - min
  return l > 0.5 ? d / (2 - max - min) : d / (max + min)
}

/**
 * Pick the text color that provides better contrast against the background
 */
export function pickBetterContrastText(text1: string, text2: string, background: string): string {
  const contrast1 = getContrastRatio(text1, background)
  const contrast2 = getContrastRatio(text2, background)
  return contrast1 >= contrast2 ? text1 : text2
}

/**
 * Pick the more saturated accent color (preserves vibrancy)
 */
export function pickMoreSaturatedColor(color1: string, color2: string): string {
  const sat1 = getSaturation(color1)
  const sat2 = getSaturation(color2)
  return sat1 >= sat2 ? color1 : color2
}

/**
 * Interpolate between two colors (hex or rgba)
 */
export function interpolateColor(color1: string, color2: string, t: number): string {
  // Handle hex colors
  const hex1 = hexToRgb(color1)
  const hex2 = hexToRgb(color2)
  if (hex1 && hex2) {
    const r = hex1.r + (hex2.r - hex1.r) * t
    const g = hex1.g + (hex2.g - hex1.g) * t
    const b = hex1.b + (hex2.b - hex1.b) * t
    return rgbToHex(r, g, b)
  }

  // Handle rgba colors
  const rgba1 = parseRgba(color1)
  const rgba2 = parseRgba(color2)
  if (rgba1 && rgba2) {
    const r = rgba1.r + (rgba2.r - rgba1.r) * t
    const g = rgba1.g + (rgba2.g - rgba1.g) * t
    const b = rgba1.b + (rgba2.b - rgba1.b) * t
    const a = rgba1.a + (rgba2.a - rgba1.a) * t
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(2)})`
  }

  // Fallback: return second color if parsing fails
  return t < 0.5 ? color1 : color2
}
