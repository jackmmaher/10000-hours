import { describe, it, expect } from 'vitest'
import { formatHemingwayCumulative, formatHemingwayActive } from '../format'

describe('formatHemingwayCumulative', () => {
  it('returns hours and minutes for values >= 1 hour', () => {
    // 12h 34m = 12*3600 + 34*60 = 45240 seconds
    const result = formatHemingwayCumulative(45240)
    expect(result).toEqual({ hours: '12', minutes: '34' })
  })

  it('returns null hours for values under 1 hour', () => {
    // 34m = 34*60 = 2040 seconds
    const result = formatHemingwayCumulative(2040)
    expect(result).toEqual({ hours: null, minutes: '34' })
  })

  it('pads minutes to 2 digits when hours exist and minutes is 0', () => {
    // 2h 0m = 2*3600 = 7200 seconds
    const result = formatHemingwayCumulative(7200)
    expect(result).toEqual({ hours: '2', minutes: '00' })
  })

  it('returns 0 minutes for 0 seconds', () => {
    const result = formatHemingwayCumulative(0)
    expect(result).toEqual({ hours: null, minutes: '0' })
  })

  it('does not pad hours', () => {
    // 1h 5m = 3600 + 300 = 3900 seconds
    const result = formatHemingwayCumulative(3900)
    expect(result).toEqual({ hours: '1', minutes: '05' })
  })

  it('pads minutes to 2 digits when hours exist', () => {
    // 5h 3m = 5*3600 + 3*60 = 18180 seconds
    const result = formatHemingwayCumulative(18180)
    expect(result).toEqual({ hours: '5', minutes: '03' })
  })

  it('does not pad minutes when no hours', () => {
    // 3m = 180 seconds
    const result = formatHemingwayCumulative(180)
    expect(result).toEqual({ hours: null, minutes: '3' })
  })

  it('handles large values', () => {
    // 100h 59m = 100*3600 + 59*60 = 363540 seconds
    const result = formatHemingwayCumulative(363540)
    expect(result).toEqual({ hours: '100', minutes: '59' })
  })
})

describe('formatHemingwayActive', () => {
  it('returns only seconds for values under 1 minute', () => {
    const result = formatHemingwayActive(27)
    expect(result).toEqual({ hours: null, minutes: null, seconds: '27' })
  })

  it('returns minutes and seconds for values >= 1 minute and < 1 hour', () => {
    // 1m 27s = 87 seconds
    const result = formatHemingwayActive(87)
    expect(result).toEqual({ hours: null, minutes: '1', seconds: '27' })
  })

  it('returns hours, minutes, and seconds for values >= 1 hour', () => {
    // 1h 34m 27s = 3600 + 34*60 + 27 = 5667 seconds
    const result = formatHemingwayActive(5667)
    expect(result).toEqual({ hours: '1', minutes: '34', seconds: '27' })
  })

  it('pads seconds to 2 digits when minutes exist', () => {
    // 1m 5s = 65 seconds
    const result = formatHemingwayActive(65)
    expect(result).toEqual({ hours: null, minutes: '1', seconds: '05' })
  })

  it('pads minutes to 2 digits when hours exist', () => {
    // 2h 3m 45s = 7200 + 180 + 45 = 7425 seconds
    const result = formatHemingwayActive(7425)
    expect(result).toEqual({ hours: '2', minutes: '03', seconds: '45' })
  })

  it('does not pad seconds when no minutes', () => {
    const result = formatHemingwayActive(5)
    expect(result).toEqual({ hours: null, minutes: null, seconds: '5' })
  })

  it('handles 0 seconds', () => {
    const result = formatHemingwayActive(0)
    expect(result).toEqual({ hours: null, minutes: null, seconds: '0' })
  })

  it('handles exactly 1 minute', () => {
    const result = formatHemingwayActive(60)
    expect(result).toEqual({ hours: null, minutes: '1', seconds: '00' })
  })

  it('handles exactly 1 hour', () => {
    const result = formatHemingwayActive(3600)
    expect(result).toEqual({ hours: '1', minutes: '00', seconds: '00' })
  })

  it('handles large values with all components', () => {
    // 10h 59m 59s = 36000 + 3540 + 59 = 39599 seconds
    const result = formatHemingwayActive(39599)
    expect(result).toEqual({ hours: '10', minutes: '59', seconds: '59' })
  })
})
