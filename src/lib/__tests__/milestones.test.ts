import { describe, it, expect } from 'vitest'
import {
  generateMilestones,
  generateExtensionMilestones,
  getNextMilestone,
  getPreviousMilestone,
  GOAL_PRESETS
} from '../milestones'

describe('generateMilestones', () => {
  it('returns infinite sequence when no goal', () => {
    const milestones = generateMilestones()
    expect(milestones).toContain(2)
    expect(milestones).toContain(100)
    expect(milestones).toContain(10000)
    expect(milestones.length).toBeGreaterThan(20)
  })

  it('includes early wins for small goals', () => {
    const milestones = generateMilestones(50)
    expect(milestones).toContain(2)
    expect(milestones).toContain(5)
    expect(milestones).toContain(10)
  })

  it('ends with the goal', () => {
    expect(generateMilestones(50).pop()).toBe(50)
    expect(generateMilestones(100).pop()).toBe(100)
    expect(generateMilestones(1000).pop()).toBe(1000)
  })

  it('uses round numbers (except early wins 2h)', () => {
    const milestones = generateMilestones(500)
    for (const m of milestones) {
      // Early win of 2h is the exception, all others divisible by 5
      if (m !== 2) {
        expect(m % 5).toBe(0)
      }
    }
  })

  it('handles edge case: goal smaller than early wins', () => {
    const milestones = generateMilestones(5)
    expect(milestones).toEqual([2, 5])
  })

  it('handles very small goal', () => {
    const milestones = generateMilestones(2)
    expect(milestones).toEqual([2])
  })

  it('generates expected milestones for 25h goal', () => {
    const milestones = generateMilestones(25)
    expect(milestones).toContain(2)
    expect(milestones).toContain(5)
    expect(milestones).toContain(10)
    expect(milestones[milestones.length - 1]).toBe(25)
  })

  it('generates expected milestones for 100h goal', () => {
    const milestones = generateMilestones(100)
    expect(milestones).toContain(2)
    expect(milestones).toContain(5)
    expect(milestones).toContain(10)
    expect(milestones[milestones.length - 1]).toBe(100)
  })

  it('generates expected milestones for 1000h goal', () => {
    const milestones = generateMilestones(1000)
    expect(milestones).toContain(2)
    expect(milestones).toContain(5)
    expect(milestones).toContain(10)
    expect(milestones[milestones.length - 1]).toBe(1000)
    // Should have percentage-based intermediate milestones
    expect(milestones.length).toBeGreaterThan(5)
  })

  it('milestone array is sorted ascending', () => {
    for (const goal of [25, 50, 100, 500, 1000, undefined]) {
      const milestones = generateMilestones(goal)
      for (let i = 1; i < milestones.length; i++) {
        expect(milestones[i]).toBeGreaterThan(milestones[i - 1])
      }
    }
  })
})

describe('generateExtensionMilestones', () => {
  it('returns only new milestones', () => {
    const extension = generateExtensionMilestones(50, 100)
    expect(extension.every(m => m > 50)).toBe(true)
    expect(extension).toContain(100)
  })

  it('excludes previous goal', () => {
    const extension = generateExtensionMilestones(50, 100)
    expect(extension).not.toContain(50)
  })

  it('works for large extensions', () => {
    const extension = generateExtensionMilestones(100, 1000)
    expect(extension.every(m => m > 100)).toBe(true)
    expect(extension).toContain(1000)
  })
})

describe('getNextMilestone', () => {
  it('returns next milestone for given hours', () => {
    expect(getNextMilestone(0)).toBe(2)
    expect(getNextMilestone(3)).toBe(5)
    expect(getNextMilestone(10)).toBe(25)
  })

  it('respects user goal', () => {
    expect(getNextMilestone(40, 50)).toBe(50)
    expect(getNextMilestone(50, 50)).toBe(null) // At goal
  })

  it('returns null when past all milestones', () => {
    expect(getNextMilestone(100000)).toBe(null)
  })

  it('handles infinite mode', () => {
    expect(getNextMilestone(0)).toBe(2)
    expect(getNextMilestone(50000)).toBe(100000)
    expect(getNextMilestone(100000)).toBe(null)
  })
})

describe('getPreviousMilestone', () => {
  it('returns 0 when no milestone achieved', () => {
    expect(getPreviousMilestone(0)).toBe(0)
    expect(getPreviousMilestone(1)).toBe(0)
  })

  it('returns last achieved milestone', () => {
    expect(getPreviousMilestone(3)).toBe(2)
    expect(getPreviousMilestone(7)).toBe(5)
    expect(getPreviousMilestone(50)).toBe(50)
  })

  it('respects user goal', () => {
    expect(getPreviousMilestone(35, 50)).toBeGreaterThan(0)
    expect(getPreviousMilestone(50, 50)).toBe(50)
  })
})

describe('GOAL_PRESETS', () => {
  it('contains expected values', () => {
    expect(GOAL_PRESETS).toContain(25)
    expect(GOAL_PRESETS).toContain(100)
    expect(GOAL_PRESETS).toContain(1000)
    expect(GOAL_PRESETS).toContain(10000)
  })

  it('is sorted ascending', () => {
    for (let i = 1; i < GOAL_PRESETS.length; i++) {
      expect(GOAL_PRESETS[i]).toBeGreaterThan(GOAL_PRESETS[i - 1])
    }
  })
})
