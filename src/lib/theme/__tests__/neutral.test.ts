/**
 * Hermès-Inspired Neutral Theme QA Tests
 *
 * Comprehensive verification that all theme tokens match the design spec:
 * - NEUTRAL_LIGHT: Warm cream (#F6F2EC), Hermès orange (#EA6512) - Figma exact
 * - NEUTRAL_DARK: Warm charcoal (#1C1917), boosted orange (#F07020)
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
  describe('Backgrounds - Warm Cream (Figma exact)', () => {
    it('bgBase is warm cream #F6F2EC (Figma exact)', () => {
      expect(NEUTRAL_LIGHT.bgBase).toBe('#F6F2EC')
    })

    it('bgElevated is pure white #FFFFFF', () => {
      expect(NEUTRAL_LIGHT.bgElevated).toBe('#FFFFFF')
    })

    it('bgDeep is deeper cream #EDE9E3', () => {
      expect(NEUTRAL_LIGHT.bgDeep).toBe('#EDE9E3')
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

  describe('Accent - Hermès Orange (Figma exact)', () => {
    it('accent is Hermès orange #EA6512 (Figma exact)', () => {
      expect(NEUTRAL_LIGHT.accent).toBe('#EA6512')
    })

    it('accentHover is darker orange #D55A0F', () => {
      expect(NEUTRAL_LIGHT.accentHover).toBe('#D55A0F')
    })

    it('accentMuted uses orange base (234, 101, 18)', () => {
      expect(NEUTRAL_LIGHT.accentMuted).toContain('234, 101, 18')
    })

    it('accentGlow uses orange base (234, 101, 18)', () => {
      expect(NEUTRAL_LIGHT.accentGlow).toContain('234, 101, 18')
    })
  })

  describe('Orb - Orange Glow', () => {
    it('orbCore is white', () => {
      expect(NEUTRAL_LIGHT.orbCore).toBe('#FFFFFF')
    })

    it('orbGlow uses Hermès orange (234, 101, 18)', () => {
      expect(NEUTRAL_LIGHT.orbGlow).toContain('234, 101, 18')
    })

    it('orbAtmosphere uses Hermès orange (234, 101, 18)', () => {
      expect(NEUTRAL_LIGHT.orbAtmosphere).toContain('234, 101, 18')
    })
  })

  describe('Stones - Orange for Planned', () => {
    it('stonePlanned uses orange base (234, 101, 18)', () => {
      expect(NEUTRAL_LIGHT.stonePlanned).toContain('234, 101, 18')
    })

    it('stonePlannedBorder uses orange base (234, 101, 18)', () => {
      expect(NEUTRAL_LIGHT.stonePlannedBorder).toContain('234, 101, 18')
    })

    it('stoneCompleted is neutral gray', () => {
      expect(NEUTRAL_LIGHT.stoneCompleted).toBe('#525252')
    })
  })

  describe('Cards - Borderless Design', () => {
    it('cardBg is white', () => {
      expect(NEUTRAL_LIGHT.cardBg).toBe('#FFFFFF')
    })

    it('cardBorder is transparent (borderless design)', () => {
      expect(NEUTRAL_LIGHT.cardBorder).toBe('transparent')
    })

    it('cardShadow provides haptic depth', () => {
      expect(NEUTRAL_LIGHT.cardShadow).toContain('rgba')
    })
  })

  describe('Borders - Transparent (Borderless Design)', () => {
    it('border is transparent', () => {
      expect(NEUTRAL_LIGHT.border).toBe('transparent')
    })

    it('borderSubtle is transparent', () => {
      expect(NEUTRAL_LIGHT.borderSubtle).toBe('transparent')
    })

    it('divider is very subtle for minimal separation', () => {
      expect(NEUTRAL_LIGHT.divider).toContain('rgba')
    })
  })

  describe('Calendar - Orange Intensity Gradient', () => {
    it('calendarIntensity1 uses orange at 15%', () => {
      expect(NEUTRAL_LIGHT.calendarIntensity1).toBe('rgba(234, 101, 18, 0.15)')
    })

    it('calendarIntensity2 uses orange at 30%', () => {
      expect(NEUTRAL_LIGHT.calendarIntensity2).toBe('rgba(234, 101, 18, 0.30)')
    })

    it('calendarIntensity3 uses orange at 50%', () => {
      expect(NEUTRAL_LIGHT.calendarIntensity3).toBe('rgba(234, 101, 18, 0.50)')
    })

    it('calendarIntensity4 uses orange at 70%', () => {
      expect(NEUTRAL_LIGHT.calendarIntensity4).toBe('rgba(234, 101, 18, 0.70)')
    })
  })

  describe('Progress - Orange Fill', () => {
    it('progressFill is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.progressFill).toBe('#EA6512')
    })

    it('progressGlow uses orange (234, 101, 18)', () => {
      expect(NEUTRAL_LIGHT.progressGlow).toContain('234, 101, 18')
    })
  })

  describe('Interactive - Orange Primary', () => {
    it('buttonPrimaryBg is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.buttonPrimaryBg).toBe('#EA6512')
    })

    it('toggleOn is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.toggleOn).toBe('#EA6512')
    })
  })

  describe('Navigation - Orange Active', () => {
    it('navActive is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.navActive).toBe('#EA6512')
    })

    it('pullIndicator is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.pullIndicator).toBe('#EA6512')
    })
  })

  describe('Voice Badges - Orange Scale', () => {
    it('voiceHighDot is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.voiceHighDot).toBe('#EA6512')
    })

    it('voiceHighBg uses orange base (234, 101, 18)', () => {
      expect(NEUTRAL_LIGHT.voiceHighBg).toContain('234, 101, 18')
    })
  })

  describe('Meta', () => {
    it('isDark is false', () => {
      expect(NEUTRAL_LIGHT.isDark).toBe(false)
    })

    it('seasonalAccent is Hermès orange', () => {
      expect(NEUTRAL_LIGHT.seasonalAccent).toBe('#EA6512')
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

  describe('Accent - Boosted Orange for Dark Visibility', () => {
    it('accent is boosted orange #F07020', () => {
      expect(NEUTRAL_DARK.accent).toBe('#F07020')
    })

    it('accentHover is brighter orange #F8923C', () => {
      expect(NEUTRAL_DARK.accentHover).toBe('#F8923C')
    })

    it('accentMuted uses boosted orange base (240, 112, 32)', () => {
      expect(NEUTRAL_DARK.accentMuted).toContain('240, 112, 32')
    })

    it('accentGlow uses boosted orange base (240, 112, 32)', () => {
      expect(NEUTRAL_DARK.accentGlow).toContain('240, 112, 32')
    })
  })

  describe('Orb - Orange Glow in Darkness', () => {
    it('orbGlow uses boosted orange (240, 112, 32)', () => {
      expect(NEUTRAL_DARK.orbGlow).toContain('240, 112, 32')
    })

    it('orbAtmosphere uses boosted orange (240, 112, 32)', () => {
      expect(NEUTRAL_DARK.orbAtmosphere).toContain('240, 112, 32')
    })
  })

  describe('Stones - Orange for Planned', () => {
    it('stonePlanned uses boosted orange (240, 112, 32)', () => {
      expect(NEUTRAL_DARK.stonePlanned).toContain('240, 112, 32')
    })

    it('stonePlannedBorder uses boosted orange (240, 112, 32)', () => {
      expect(NEUTRAL_DARK.stonePlannedBorder).toContain('240, 112, 32')
    })
  })

  describe('Cards - Borderless Design', () => {
    it('cardBg is elevated charcoal', () => {
      expect(NEUTRAL_DARK.cardBg).toBe('#292524')
    })

    it('cardBorder is transparent (borderless design)', () => {
      expect(NEUTRAL_DARK.cardBorder).toBe('transparent')
    })

    it('cardShadow provides depth in dark mode', () => {
      expect(NEUTRAL_DARK.cardShadow).toContain('rgba')
    })
  })

  describe('Borders - Transparent (Borderless Design)', () => {
    it('border is transparent', () => {
      expect(NEUTRAL_DARK.border).toBe('transparent')
    })

    it('borderSubtle is transparent', () => {
      expect(NEUTRAL_DARK.borderSubtle).toBe('transparent')
    })

    it('divider is very subtle for minimal separation', () => {
      expect(NEUTRAL_DARK.divider).toContain('rgba')
    })
  })

  describe('Calendar - Orange Intensity Gradient', () => {
    it('calendarIntensity1 uses boosted orange at 15%', () => {
      expect(NEUTRAL_DARK.calendarIntensity1).toBe('rgba(240, 112, 32, 0.15)')
    })

    it('calendarIntensity2 uses boosted orange at 30%', () => {
      expect(NEUTRAL_DARK.calendarIntensity2).toBe('rgba(240, 112, 32, 0.30)')
    })

    it('calendarIntensity3 uses boosted orange at 50%', () => {
      expect(NEUTRAL_DARK.calendarIntensity3).toBe('rgba(240, 112, 32, 0.50)')
    })

    it('calendarIntensity4 uses boosted orange at 70%', () => {
      expect(NEUTRAL_DARK.calendarIntensity4).toBe('rgba(240, 112, 32, 0.70)')
    })
  })

  describe('Progress - Boosted Orange Fill', () => {
    it('progressFill is boosted orange', () => {
      expect(NEUTRAL_DARK.progressFill).toBe('#F07020')
    })

    it('progressGlow uses boosted orange (240, 112, 32)', () => {
      expect(NEUTRAL_DARK.progressGlow).toContain('240, 112, 32')
    })
  })

  describe('Interactive - Boosted Orange Primary', () => {
    it('buttonPrimaryBg is boosted orange', () => {
      expect(NEUTRAL_DARK.buttonPrimaryBg).toBe('#F07020')
    })

    it('buttonPrimaryText is white (not dark)', () => {
      expect(NEUTRAL_DARK.buttonPrimaryText).toBe('#FFFFFF')
    })

    it('toggleOn is boosted orange', () => {
      expect(NEUTRAL_DARK.toggleOn).toBe('#F07020')
    })
  })

  describe('Navigation - Boosted Orange Active', () => {
    it('navActive is boosted orange', () => {
      expect(NEUTRAL_DARK.navActive).toBe('#F07020')
    })

    it('pullIndicator is boosted orange', () => {
      expect(NEUTRAL_DARK.pullIndicator).toBe('#F07020')
    })
  })

  describe('Voice Badges - Boosted Orange Scale', () => {
    it('voiceHighDot is boosted orange', () => {
      expect(NEUTRAL_DARK.voiceHighDot).toBe('#F07020')
    })

    it('voiceHighBg uses boosted orange (240, 112, 32)', () => {
      expect(NEUTRAL_DARK.voiceHighBg).toContain('240, 112, 32')
    })
  })

  describe('Meta', () => {
    it('isDark is true', () => {
      expect(NEUTRAL_DARK.isDark).toBe(true)
    })

    it('seasonalAccent is boosted orange', () => {
      expect(NEUTRAL_DARK.seasonalAccent).toBe('#F07020')
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

  describe('NEUTRAL_LIGHT transparent borders are valid', () => {
    it('cardBorder is transparent', () => {
      expect(NEUTRAL_LIGHT.cardBorder).toBe('transparent')
    })

    it('border is transparent', () => {
      expect(NEUTRAL_LIGHT.border).toBe('transparent')
    })

    it('borderSubtle is transparent', () => {
      expect(NEUTRAL_LIGHT.borderSubtle).toBe('transparent')
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
      'cardShadow',
      'calendarIntensity1',
      'calendarIntensity2',
      'calendarIntensity3',
      'calendarIntensity4',
      'progressGlow',
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
  describe('Hermès Orange Consistency (Figma exact)', () => {
    it('Light mode uses consistent orange base (234, 101, 18)', () => {
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
        expect(token).toContain('234, 101, 18')
      })
    })

    it('Dark mode uses consistent boosted orange base (240, 112, 32)', () => {
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
        expect(token).toContain('240, 112, 32')
      })
    })
  })

  describe('Borderless Design', () => {
    it('Light mode uses transparent borders', () => {
      expect(NEUTRAL_LIGHT.cardBorder).toBe('transparent')
      expect(NEUTRAL_LIGHT.border).toBe('transparent')
      expect(NEUTRAL_LIGHT.borderSubtle).toBe('transparent')
    })

    it('Dark mode uses transparent borders', () => {
      expect(NEUTRAL_DARK.cardBorder).toBe('transparent')
      expect(NEUTRAL_DARK.border).toBe('transparent')
      expect(NEUTRAL_DARK.borderSubtle).toBe('transparent')
    })
  })

  describe('Elevation Direction', () => {
    it('Light mode: elevated is lighter than base', () => {
      // #FFFFFF (white) is lighter than #F6F2EC (cream)
      expect(NEUTRAL_LIGHT.bgElevated).toBe('#FFFFFF')
      expect(NEUTRAL_LIGHT.bgBase).toBe('#F6F2EC')
    })

    it('Dark mode: elevated is lighter than base', () => {
      // #292524 is lighter than #1C1917
      expect(NEUTRAL_DARK.bgElevated).toBe('#292524')
      expect(NEUTRAL_DARK.bgBase).toBe('#1C1917')
    })

    it('Light mode: deep is darker than base', () => {
      // #EDE9E3 is darker than #F6F2EC
      expect(NEUTRAL_LIGHT.bgDeep).toBe('#EDE9E3')
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

  describe('Accent colors are Figma-exact orange, not slate', () => {
    it('NEUTRAL_LIGHT accent is Figma orange #EA6512', () => {
      expect(slateColors).not.toContain(NEUTRAL_LIGHT.accent)
      expect(NEUTRAL_LIGHT.accent).toBe('#EA6512')
    })

    it('NEUTRAL_DARK accent is boosted orange #F07020', () => {
      expect(slateColors).not.toContain(NEUTRAL_DARK.accent)
      expect(NEUTRAL_DARK.accent).toBe('#F07020')
    })
  })
})

// ============================================================================
// GLASSMORPHISM SUPPORT TESTS
// ============================================================================

describe('Glassmorphism Support', () => {
  describe('Semi-transparent backgrounds for blur effect', () => {
    it('cardShadow provides depth without border', () => {
      expect(NEUTRAL_LIGHT.cardShadow).toBeTruthy()
      expect(NEUTRAL_DARK.cardShadow).toBeTruthy()
    })

    it('navBg uses semi-transparent for blur-through', () => {
      expect(NEUTRAL_LIGHT.navBg).toContain('rgba')
      expect(NEUTRAL_DARK.navBg).toContain('rgba')
    })
  })
})
