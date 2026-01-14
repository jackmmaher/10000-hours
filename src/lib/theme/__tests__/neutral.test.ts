/**
 * Hermès-Inspired Neutral Theme QA Tests
 *
 * Comprehensive verification that all theme tokens match the design spec:
 * - NEUTRAL_LIGHT: Warm cream (#F5F5F0), Hermès orange (#E35205)
 * - NEUTRAL_DARK: Warm charcoal (#1C1917), boosted orange (#EA580C)
 */

import { describe, it, expect } from 'vitest'
import { NEUTRAL_LIGHT, NEUTRAL_DARK } from '../tokens/neutral'
import type { ThemeTokens } from '../types'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate hex color format (#RGB or #RRGGBB)
 */
function isValidHex(color: string): boolean {
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/i.test(color)
}

/**
 * Validate rgba format
 */
function isValidRgba(color: string): boolean {
  return /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(color)
}

/**
 * Validate shadow format (0 Xpx Ypx rgba(...))
 */
function isValidShadow(shadow: string): boolean {
  return /^0\s+\d+px\s+\d+px\s+rgba/i.test(shadow)
}

/**
 * Get all token keys from ThemeTokens
 */
const ALL_TOKEN_KEYS: (keyof ThemeTokens)[] = [
  'bgBase',
  'bgElevated',
  'bgDeep',
  'bgOverlay',
  'textPrimary',
  'textSecondary',
  'textMuted',
  'textOnAccent',
  'accent',
  'accentHover',
  'accentMuted',
  'accentGlow',
  'orbCore',
  'orbMid',
  'orbEdge',
  'orbGlow',
  'orbAtmosphere',
  'stoneCompleted',
  'stoneCompletedInner',
  'stonePlanned',
  'stonePlannedBorder',
  'stoneEmpty',
  'stoneToday',
  'cardBg',
  'cardBorder',
  'cardShadow',
  'calendarDayBg',
  'calendarDayText',
  'calendarIntensity1',
  'calendarIntensity2',
  'calendarIntensity3',
  'calendarIntensity4',
  'progressTrack',
  'progressFill',
  'progressGlow',
  'buttonPrimaryBg',
  'buttonPrimaryText',
  'buttonSecondaryBg',
  'buttonSecondaryText',
  'toggleOn',
  'toggleOff',
  'toggleThumb',
  'border',
  'borderSubtle',
  'divider',
  'shadowColor',
  'shadowElevation1',
  'shadowElevation2',
  'shadowElevation3',
  'pearlBg',
  'pearlShimmer',
  'pearlOrb',
  'pearlOrbInner',
  'navBg',
  'navActive',
  'navInactive',
  'pullIndicator',
  'voiceHighBg',
  'voiceHighText',
  'voiceHighDot',
  'voiceEstablishedBg',
  'voiceEstablishedText',
  'voiceEstablishedDot',
  'voiceGrowingBg',
  'voiceGrowingText',
  'voiceGrowingDot',
  'voiceNewBg',
  'voiceNewText',
  'voiceNewDot',
  'isDark',
  'seasonalAccent',
]

// ============================================================================
// TOKEN EXISTENCE TESTS
// ============================================================================

describe('Token Existence', () => {
  it('NEUTRAL_LIGHT has all 57 required tokens', () => {
    ALL_TOKEN_KEYS.forEach((key) => {
      expect(NEUTRAL_LIGHT).toHaveProperty(key)
    })
  })

  it('NEUTRAL_DARK has all 57 required tokens', () => {
    ALL_TOKEN_KEYS.forEach((key) => {
      expect(NEUTRAL_DARK).toHaveProperty(key)
    })
  })
})

// ============================================================================
// NEUTRAL_LIGHT VALUE VERIFICATION
// ============================================================================

describe('NEUTRAL_LIGHT Values', () => {
  describe('Backgrounds - Warm Cream', () => {
    it('bgBase is warm cream #F5F5F0', () => {
      expect(NEUTRAL_LIGHT.bgBase).toBe('#F5F5F0')
    })

    it('bgElevated is pure white #FFFFFF', () => {
      expect(NEUTRAL_LIGHT.bgElevated).toBe('#FFFFFF')
    })

    it('bgDeep is deeper cream #EDEBE5', () => {
      expect(NEUTRAL_LIGHT.bgDeep).toBe('#EDEBE5')
    })

    it('bgOverlay uses warm dark rgba', () => {
      expect(NEUTRAL_LIGHT.bgOverlay).toBe('rgba(23, 23, 23, 0.5)')
    })
  })

  describe('Text - Warm Neutrals', () => {
    it('textPrimary is near-black #171717', () => {
      expect(NEUTRAL_LIGHT.textPrimary).toBe('#171717')
    })

    it('textSecondary is medium neutral #525252', () => {
      expect(NEUTRAL_LIGHT.textSecondary).toBe('#525252')
    })

    it('textMuted is lighter neutral #737373', () => {
      expect(NEUTRAL_LIGHT.textMuted).toBe('#737373')
    })

    it('textOnAccent is white', () => {
      expect(NEUTRAL_LIGHT.textOnAccent).toBe('#FFFFFF')
    })
  })

  describe('Accent - Hermès Orange', () => {
    it('accent is Hermès orange #E35205', () => {
      expect(NEUTRAL_LIGHT.accent).toBe('#E35205')
    })

    it('accentHover is darker orange #C2410C', () => {
      expect(NEUTRAL_LIGHT.accentHover).toBe('#C2410C')
    })

    it('accentMuted uses orange base', () => {
      expect(NEUTRAL_LIGHT.accentMuted).toContain('227, 82, 5')
    })

    it('accentGlow uses orange base', () => {
      expect(NEUTRAL_LIGHT.accentGlow).toContain('227, 82, 5')
    })
  })

  describe('Orb - Orange Glow', () => {
    it('orbCore is white', () => {
      expect(NEUTRAL_LIGHT.orbCore).toBe('#FFFFFF')
    })

    it('orbGlow uses Hermès orange', () => {
      expect(NEUTRAL_LIGHT.orbGlow).toContain('227, 82, 5')
    })

    it('orbAtmosphere uses Hermès orange', () => {
      expect(NEUTRAL_LIGHT.orbAtmosphere).toContain('227, 82, 5')
    })
  })

  describe('Stones - Orange for Planned', () => {
    it('stonePlanned uses orange base', () => {
      expect(NEUTRAL_LIGHT.stonePlanned).toContain('227, 82, 5')
    })

    it('stonePlannedBorder uses orange base', () => {
      expect(NEUTRAL_LIGHT.stonePlannedBorder).toContain('227, 82, 5')
    })

    it('stoneCompleted is neutral gray', () => {
      expect(NEUTRAL_LIGHT.stoneCompleted).toBe('#525252')
    })
  })

  describe('Calendar - Orange Intensity Gradient', () => {
    it('calendarIntensity1 uses orange at 15%', () => {
      expect(NEUTRAL_LIGHT.calendarIntensity1).toBe('rgba(227, 82, 5, 0.15)')
    })

    it('calendarIntensity2 uses orange at 30%', () => {
      expect(NEUTRAL_LIGHT.calendarIntensity2).toBe('rgba(227, 82, 5, 0.30)')
    })

    it('calendarIntensity3 uses orange at 50%', () => {
      expect(NEUTRAL_LIGHT.calendarIntensity3).toBe('rgba(227, 82, 5, 0.50)')
    })

    it('calendarIntensity4 uses orange at 70%', () => {
      expect(NEUTRAL_LIGHT.calendarIntensity4).toBe('rgba(227, 82, 5, 0.70)')
    })
  })

  describe('Progress - Orange Fill', () => {
    it('progressFill is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.progressFill).toBe('#E35205')
    })

    it('progressGlow uses orange', () => {
      expect(NEUTRAL_LIGHT.progressGlow).toContain('227, 82, 5')
    })
  })

  describe('Interactive - Orange Primary', () => {
    it('buttonPrimaryBg is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.buttonPrimaryBg).toBe('#E35205')
    })

    it('toggleOn is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.toggleOn).toBe('#E35205')
    })
  })

  describe('Navigation - Orange Active', () => {
    it('navActive is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.navActive).toBe('#E35205')
    })

    it('pullIndicator is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.pullIndicator).toBe('#E35205')
    })
  })

  describe('Voice Badges - Orange Scale', () => {
    it('voiceHighDot is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.voiceHighDot).toBe('#E35205')
    })

    it('voiceHighBg uses orange base', () => {
      expect(NEUTRAL_LIGHT.voiceHighBg).toContain('227, 82, 5')
    })
  })

  describe('Meta', () => {
    it('isDark is false', () => {
      expect(NEUTRAL_LIGHT.isDark).toBe(false)
    })

    it('seasonalAccent is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.seasonalAccent).toBe('#E35205')
    })
  })
})

// ============================================================================
// NEUTRAL_DARK VALUE VERIFICATION
// ============================================================================

describe('NEUTRAL_DARK Values', () => {
  describe('Backgrounds - Warm Charcoal', () => {
    it('bgBase is warm charcoal #1C1917', () => {
      expect(NEUTRAL_DARK.bgBase).toBe('#1C1917')
    })

    it('bgElevated is lighter charcoal #292524', () => {
      expect(NEUTRAL_DARK.bgElevated).toBe('#292524')
    })

    it('bgDeep is near-black #0C0A09', () => {
      expect(NEUTRAL_DARK.bgDeep).toBe('#0C0A09')
    })
  })

  describe('Text - Warm Stone Tones', () => {
    it('textPrimary is near-white #FAFAF9', () => {
      expect(NEUTRAL_DARK.textPrimary).toBe('#FAFAF9')
    })

    it('textSecondary is stone-400 #A8A29E', () => {
      expect(NEUTRAL_DARK.textSecondary).toBe('#A8A29E')
    })

    it('textMuted is stone-500 #78716C', () => {
      expect(NEUTRAL_DARK.textMuted).toBe('#78716C')
    })
  })

  describe('Accent - Boosted Orange for Dark', () => {
    it('accent is boosted orange #EA580C', () => {
      expect(NEUTRAL_DARK.accent).toBe('#EA580C')
    })

    it('accentHover is brighter orange #F97316', () => {
      expect(NEUTRAL_DARK.accentHover).toBe('#F97316')
    })

    it('accentMuted uses boosted orange base', () => {
      expect(NEUTRAL_DARK.accentMuted).toContain('234, 88, 12')
    })

    it('accentGlow uses boosted orange base', () => {
      expect(NEUTRAL_DARK.accentGlow).toContain('234, 88, 12')
    })
  })

  describe('Orb - Orange Glow in Darkness', () => {
    it('orbGlow uses boosted orange', () => {
      expect(NEUTRAL_DARK.orbGlow).toContain('234, 88, 12')
    })

    it('orbAtmosphere uses boosted orange', () => {
      expect(NEUTRAL_DARK.orbAtmosphere).toContain('234, 88, 12')
    })
  })

  describe('Stones - Orange for Planned', () => {
    it('stonePlanned uses boosted orange', () => {
      expect(NEUTRAL_DARK.stonePlanned).toContain('234, 88, 12')
    })

    it('stonePlannedBorder uses boosted orange', () => {
      expect(NEUTRAL_DARK.stonePlannedBorder).toContain('234, 88, 12')
    })
  })

  describe('Calendar - Orange Intensity Gradient', () => {
    it('calendarIntensity1 uses boosted orange at 15%', () => {
      expect(NEUTRAL_DARK.calendarIntensity1).toBe('rgba(234, 88, 12, 0.15)')
    })

    it('calendarIntensity2 uses boosted orange at 30%', () => {
      expect(NEUTRAL_DARK.calendarIntensity2).toBe('rgba(234, 88, 12, 0.30)')
    })

    it('calendarIntensity3 uses boosted orange at 50%', () => {
      expect(NEUTRAL_DARK.calendarIntensity3).toBe('rgba(234, 88, 12, 0.50)')
    })

    it('calendarIntensity4 uses boosted orange at 70%', () => {
      expect(NEUTRAL_DARK.calendarIntensity4).toBe('rgba(234, 88, 12, 0.70)')
    })
  })

  describe('Progress - Boosted Orange Fill', () => {
    it('progressFill is boosted orange', () => {
      expect(NEUTRAL_DARK.progressFill).toBe('#EA580C')
    })

    it('progressGlow uses boosted orange', () => {
      expect(NEUTRAL_DARK.progressGlow).toContain('234, 88, 12')
    })
  })

  describe('Interactive - Boosted Orange Primary', () => {
    it('buttonPrimaryBg is boosted orange', () => {
      expect(NEUTRAL_DARK.buttonPrimaryBg).toBe('#EA580C')
    })

    it('buttonPrimaryText is white (not dark)', () => {
      expect(NEUTRAL_DARK.buttonPrimaryText).toBe('#FFFFFF')
    })

    it('toggleOn is boosted orange', () => {
      expect(NEUTRAL_DARK.toggleOn).toBe('#EA580C')
    })
  })

  describe('Borders - Light on Dark', () => {
    it('border uses white with low opacity', () => {
      expect(NEUTRAL_DARK.border).toBe('rgba(255, 255, 255, 0.08)')
    })

    it('borderSubtle uses white with very low opacity', () => {
      expect(NEUTRAL_DARK.borderSubtle).toBe('rgba(255, 255, 255, 0.04)')
    })
  })

  describe('Navigation - Boosted Orange Active', () => {
    it('navActive is boosted orange', () => {
      expect(NEUTRAL_DARK.navActive).toBe('#EA580C')
    })

    it('pullIndicator is boosted orange', () => {
      expect(NEUTRAL_DARK.pullIndicator).toBe('#EA580C')
    })
  })

  describe('Voice Badges - Boosted Orange Scale', () => {
    it('voiceHighDot is boosted orange', () => {
      expect(NEUTRAL_DARK.voiceHighDot).toBe('#EA580C')
    })

    it('voiceHighBg uses boosted orange', () => {
      expect(NEUTRAL_DARK.voiceHighBg).toContain('234, 88, 12')
    })
  })

  describe('Meta', () => {
    it('isDark is true', () => {
      expect(NEUTRAL_DARK.isDark).toBe(true)
    })

    it('seasonalAccent is boosted orange', () => {
      expect(NEUTRAL_DARK.seasonalAccent).toBe('#EA580C')
    })
  })
})

// ============================================================================
// COLOR FORMAT VALIDATION
// ============================================================================

describe('Color Format Validation', () => {
  describe('NEUTRAL_LIGHT hex colors are valid', () => {
    const hexTokens: (keyof ThemeTokens)[] = [
      'bgBase',
      'bgElevated',
      'bgDeep',
      'textPrimary',
      'textSecondary',
      'textMuted',
      'textOnAccent',
      'accent',
      'accentHover',
      'orbCore',
      'orbMid',
      'orbEdge',
      'stoneCompleted',
      'stoneCompletedInner',
      'stoneEmpty',
      'stoneToday',
      'cardBg',
      'calendarDayBg',
      'calendarDayText',
      'progressTrack',
      'progressFill',
      'buttonPrimaryBg',
      'buttonPrimaryText',
      'buttonSecondaryBg',
      'buttonSecondaryText',
      'toggleOn',
      'toggleOff',
      'toggleThumb',
      'pearlBg',
      'pearlOrb',
      'pearlOrbInner',
      'navActive',
      'navInactive',
      'pullIndicator',
      'voiceHighText',
      'voiceHighDot',
      'voiceEstablishedText',
      'voiceEstablishedDot',
      'voiceGrowingText',
      'voiceGrowingDot',
      'voiceNewBg',
      'voiceNewText',
      'voiceNewDot',
      'seasonalAccent',
    ]

    hexTokens.forEach((token) => {
      it(`${token} is valid hex`, () => {
        const value = NEUTRAL_LIGHT[token]
        if (typeof value === 'string') {
          expect(isValidHex(value)).toBe(true)
        }
      })
    })
  })

  describe('NEUTRAL_LIGHT rgba colors are valid', () => {
    const rgbaTokens: (keyof ThemeTokens)[] = [
      'bgOverlay',
      'accentMuted',
      'accentGlow',
      'orbGlow',
      'orbAtmosphere',
      'stonePlanned',
      'stonePlannedBorder',
      'cardBorder',
      'cardShadow',
      'calendarIntensity1',
      'calendarIntensity2',
      'calendarIntensity3',
      'calendarIntensity4',
      'progressGlow',
      'border',
      'borderSubtle',
      'divider',
      'shadowColor',
      'pearlShimmer',
      'voiceHighBg',
      'voiceEstablishedBg',
      'voiceGrowingBg',
    ]

    rgbaTokens.forEach((token) => {
      it(`${token} is valid rgba`, () => {
        const value = NEUTRAL_LIGHT[token]
        if (typeof value === 'string') {
          expect(isValidRgba(value)).toBe(true)
        }
      })
    })
  })

  describe('Shadow elevations are valid', () => {
    it('NEUTRAL_LIGHT shadowElevation1 is valid', () => {
      expect(isValidShadow(NEUTRAL_LIGHT.shadowElevation1)).toBe(true)
    })

    it('NEUTRAL_LIGHT shadowElevation2 is valid', () => {
      expect(isValidShadow(NEUTRAL_LIGHT.shadowElevation2)).toBe(true)
    })

    it('NEUTRAL_LIGHT shadowElevation3 is valid', () => {
      expect(isValidShadow(NEUTRAL_LIGHT.shadowElevation3)).toBe(true)
    })

    it('NEUTRAL_DARK shadowElevation1 is valid', () => {
      expect(isValidShadow(NEUTRAL_DARK.shadowElevation1)).toBe(true)
    })

    it('NEUTRAL_DARK shadowElevation2 is valid', () => {
      expect(isValidShadow(NEUTRAL_DARK.shadowElevation2)).toBe(true)
    })

    it('NEUTRAL_DARK shadowElevation3 is valid', () => {
      expect(isValidShadow(NEUTRAL_DARK.shadowElevation3)).toBe(true)
    })
  })
})

// ============================================================================
// DESIGN SYSTEM CONSISTENCY CHECKS
// ============================================================================

describe('Design System Consistency', () => {
  describe('Hermès Orange Consistency', () => {
    it('Light mode uses consistent orange base (227, 82, 5)', () => {
      const orangeTokens = [
        NEUTRAL_LIGHT.accentMuted,
        NEUTRAL_LIGHT.accentGlow,
        NEUTRAL_LIGHT.orbGlow,
        NEUTRAL_LIGHT.orbAtmosphere,
        NEUTRAL_LIGHT.stonePlanned,
        NEUTRAL_LIGHT.stonePlannedBorder,
        NEUTRAL_LIGHT.calendarIntensity1,
        NEUTRAL_LIGHT.calendarIntensity2,
        NEUTRAL_LIGHT.calendarIntensity3,
        NEUTRAL_LIGHT.calendarIntensity4,
        NEUTRAL_LIGHT.progressGlow,
        NEUTRAL_LIGHT.voiceHighBg,
        NEUTRAL_LIGHT.voiceEstablishedBg,
        NEUTRAL_LIGHT.voiceGrowingBg,
      ]

      orangeTokens.forEach((token) => {
        expect(token).toContain('227, 82, 5')
      })
    })

    it('Dark mode uses consistent boosted orange base (234, 88, 12)', () => {
      const orangeTokens = [
        NEUTRAL_DARK.accentMuted,
        NEUTRAL_DARK.accentGlow,
        NEUTRAL_DARK.orbGlow,
        NEUTRAL_DARK.orbAtmosphere,
        NEUTRAL_DARK.stonePlanned,
        NEUTRAL_DARK.stonePlannedBorder,
        NEUTRAL_DARK.calendarIntensity1,
        NEUTRAL_DARK.calendarIntensity2,
        NEUTRAL_DARK.calendarIntensity3,
        NEUTRAL_DARK.calendarIntensity4,
        NEUTRAL_DARK.progressGlow,
        NEUTRAL_DARK.voiceHighBg,
        NEUTRAL_DARK.voiceEstablishedBg,
        NEUTRAL_DARK.voiceGrowingBg,
      ]

      orangeTokens.forEach((token) => {
        expect(token).toContain('234, 88, 12')
      })
    })
  })

  describe('Elevation Direction', () => {
    it('Light mode: elevated is lighter than base', () => {
      // #FFFFFF (white) is lighter than #F5F5F0 (cream)
      expect(NEUTRAL_LIGHT.bgElevated).toBe('#FFFFFF')
      expect(NEUTRAL_LIGHT.bgBase).toBe('#F5F5F0')
    })

    it('Dark mode: elevated is lighter than base', () => {
      // #292524 is lighter than #1C1917
      expect(NEUTRAL_DARK.bgElevated).toBe('#292524')
      expect(NEUTRAL_DARK.bgBase).toBe('#1C1917')
    })

    it('Light mode: deep is darker than base', () => {
      // #EDEBE5 is darker than #F5F5F0
      expect(NEUTRAL_LIGHT.bgDeep).toBe('#EDEBE5')
    })

    it('Dark mode: deep is darker than base', () => {
      // #0C0A09 is darker than #1C1917
      expect(NEUTRAL_DARK.bgDeep).toBe('#0C0A09')
    })
  })

  describe('Temperature Consistency (Warm Colors)', () => {
    it('Light backgrounds use warm tones (not blue-tinted slate)', () => {
      // Warm cream/beige colors should not contain blue slate values
      expect(NEUTRAL_LIGHT.bgBase).not.toContain('F8FAFC') // old cool slate
      expect(NEUTRAL_LIGHT.bgDeep).not.toContain('F1F5F9') // old cool slate
    })

    it('Dark backgrounds use warm charcoal (not cool slate)', () => {
      // Warm charcoal should not contain blue slate values
      expect(NEUTRAL_DARK.bgBase).not.toContain('0F172A') // old cool slate
      expect(NEUTRAL_DARK.bgElevated).not.toContain('1E293B') // old cool slate
    })
  })

  describe('Calendar Intensity Progression', () => {
    it('Light mode intensity increases from 1 to 4', () => {
      const i1 = parseFloat(NEUTRAL_LIGHT.calendarIntensity1.match(/[\d.]+(?=\))/)?.[0] || '0')
      const i2 = parseFloat(NEUTRAL_LIGHT.calendarIntensity2.match(/[\d.]+(?=\))/)?.[0] || '0')
      const i3 = parseFloat(NEUTRAL_LIGHT.calendarIntensity3.match(/[\d.]+(?=\))/)?.[0] || '0')
      const i4 = parseFloat(NEUTRAL_LIGHT.calendarIntensity4.match(/[\d.]+(?=\))/)?.[0] || '0')

      expect(i2).toBeGreaterThan(i1)
      expect(i3).toBeGreaterThan(i2)
      expect(i4).toBeGreaterThan(i3)
    })

    it('Dark mode intensity increases from 1 to 4', () => {
      const i1 = parseFloat(NEUTRAL_DARK.calendarIntensity1.match(/[\d.]+(?=\))/)?.[0] || '0')
      const i2 = parseFloat(NEUTRAL_DARK.calendarIntensity2.match(/[\d.]+(?=\))/)?.[0] || '0')
      const i3 = parseFloat(NEUTRAL_DARK.calendarIntensity3.match(/[\d.]+(?=\))/)?.[0] || '0')
      const i4 = parseFloat(NEUTRAL_DARK.calendarIntensity4.match(/[\d.]+(?=\))/)?.[0] || '0')

      expect(i2).toBeGreaterThan(i1)
      expect(i3).toBeGreaterThan(i2)
      expect(i4).toBeGreaterThan(i3)
    })
  })
})

// ============================================================================
// REGRESSION TESTS - Ensure old slate values are gone
// ============================================================================

describe('Regression: No Slate Colors Remain', () => {
  const slateColors = [
    '#F8FAFC',
    '#F1F5F9',
    '#E2E8F0',
    '#CBD5E1',
    '#94A3B8',
    '#64748B',
    '#475569',
    '#334155',
    '#1E293B',
    '#0F172A',
    '#0B1120',
  ]

  describe('NEUTRAL_LIGHT has no slate backgrounds', () => {
    it('bgBase is not slate', () => {
      expect(slateColors).not.toContain(NEUTRAL_LIGHT.bgBase)
    })

    it('bgDeep is not slate', () => {
      expect(slateColors).not.toContain(NEUTRAL_LIGHT.bgDeep)
    })
  })

  describe('NEUTRAL_DARK has no slate backgrounds', () => {
    it('bgBase is not slate', () => {
      expect(slateColors).not.toContain(NEUTRAL_DARK.bgBase)
    })

    it('bgElevated is not slate', () => {
      expect(slateColors).not.toContain(NEUTRAL_DARK.bgElevated)
    })

    it('bgDeep is not slate', () => {
      expect(slateColors).not.toContain(NEUTRAL_DARK.bgDeep)
    })
  })

  describe('Accent colors are orange, not slate', () => {
    it('NEUTRAL_LIGHT accent is orange, not slate', () => {
      expect(slateColors).not.toContain(NEUTRAL_LIGHT.accent)
      expect(NEUTRAL_LIGHT.accent).toBe('#E35205')
    })

    it('NEUTRAL_DARK accent is orange, not slate', () => {
      expect(slateColors).not.toContain(NEUTRAL_DARK.accent)
      expect(NEUTRAL_DARK.accent).toBe('#EA580C')
    })
  })
})
