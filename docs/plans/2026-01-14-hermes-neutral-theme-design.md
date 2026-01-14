# Hermès-Inspired Neutral Theme Overhaul

**Date:** 2026-01-14
**Status:** Ready for Execution

## Overview

Complete overhaul of `NEUTRAL_LIGHT` and `NEUTRAL_DARK` themes to adopt a Hermès-inspired design language: warm cream backgrounds, warm charcoal dark mode, and signature orange accent.

## Architecture

```
Single Source of Truth:
src/lib/theme/tokens/neutral.ts
         ↓
src/lib/theme/cssProperties.ts (converts to CSS vars)
         ↓
:root CSS custom properties
         ↓
All components automatically updated
```

**Files to modify:** `src/lib/theme/tokens/neutral.ts` (ONLY)
**Files to create:** `src/lib/theme/__tests__/neutral.test.ts` (QA verification)

---

## Execution Plan

### Phase 1: Update NEUTRAL_LIGHT Tokens

Replace all values in the `NEUTRAL_LIGHT` export:

#### 1.1 Backgrounds

| Token        | Old Value               | New Value               |
| ------------ | ----------------------- | ----------------------- |
| `bgBase`     | `#F8FAFC`               | `#F5F5F0`               |
| `bgElevated` | `#FFFFFF`               | `#FFFFFF`               |
| `bgDeep`     | `#F1F5F9`               | `#EDEBE5`               |
| `bgOverlay`  | `rgba(15, 23, 42, 0.4)` | `rgba(23, 23, 23, 0.5)` |

#### 1.2 Text

| Token           | Old Value | New Value |
| --------------- | --------- | --------- |
| `textPrimary`   | `#1E293B` | `#171717` |
| `textSecondary` | `#475569` | `#525252` |
| `textMuted`     | `#64748B` | `#737373` |
| `textOnAccent`  | `#FFFFFF` | `#FFFFFF` |

#### 1.3 Accent (Hermès Orange)

| Token         | Old Value                 | New Value                |
| ------------- | ------------------------- | ------------------------ |
| `accent`      | `#475569`                 | `#E35205`                |
| `accentHover` | `#334155`                 | `#C2410C`                |
| `accentMuted` | `rgba(71, 85, 105, 0.12)` | `rgba(227, 82, 5, 0.12)` |
| `accentGlow`  | `rgba(71, 85, 105, 0.25)` | `rgba(227, 82, 5, 0.25)` |

#### 1.4 Orb (Meditation Timer)

| Token           | Old Value                  | New Value                |
| --------------- | -------------------------- | ------------------------ |
| `orbCore`       | `#FFFFFF`                  | `#FFFFFF`                |
| `orbMid`        | `#E2E8F0`                  | `#F5F5F0`                |
| `orbEdge`       | `#CBD5E1`                  | `#E7E5DF`                |
| `orbGlow`       | `rgba(148, 163, 184, 0.3)` | `rgba(227, 82, 5, 0.25)` |
| `orbAtmosphere` | `rgba(148, 163, 184, 0.1)` | `rgba(227, 82, 5, 0.08)` |

#### 1.5 Stones (Week Indicators)

| Token                 | Old Value                | New Value                |
| --------------------- | ------------------------ | ------------------------ |
| `stoneCompleted`      | `#334155`                | `#525252`                |
| `stoneCompletedInner` | `#475569`                | `#737373`                |
| `stonePlanned`        | `rgba(71, 85, 105, 0.2)` | `rgba(227, 82, 5, 0.15)` |
| `stonePlannedBorder`  | `rgba(71, 85, 105, 0.4)` | `rgba(227, 82, 5, 0.5)`  |
| `stoneEmpty`          | `#F1F5F9`                | `#EDEBE5`                |
| `stoneToday`          | `#E2E8F0`                | `#E7E5DF`                |

#### 1.6 Cards

| Token        | Old Value                | New Value             |
| ------------ | ------------------------ | --------------------- |
| `cardBg`     | `#FFFFFF`                | `#FFFFFF`             |
| `cardBorder` | `rgba(71, 85, 105, 0.1)` | `rgba(0, 0, 0, 0.06)` |
| `cardShadow` | `rgba(15, 23, 42, 0.05)` | `rgba(0, 0, 0, 0.06)` |

#### 1.7 Calendar

| Token                | Old Value                 | New Value                |
| -------------------- | ------------------------- | ------------------------ |
| `calendarDayBg`      | `#FFFFFF`                 | `#FFFFFF`                |
| `calendarDayText`    | `#475569`                 | `#525252`                |
| `calendarIntensity1` | `rgba(71, 85, 105, 0.15)` | `rgba(227, 82, 5, 0.15)` |
| `calendarIntensity2` | `rgba(71, 85, 105, 0.30)` | `rgba(227, 82, 5, 0.30)` |
| `calendarIntensity3` | `rgba(71, 85, 105, 0.50)` | `rgba(227, 82, 5, 0.50)` |
| `calendarIntensity4` | `rgba(71, 85, 105, 0.70)` | `rgba(227, 82, 5, 0.70)` |

#### 1.8 Progress

| Token           | Old Value                 | New Value                |
| --------------- | ------------------------- | ------------------------ |
| `progressTrack` | `#E2E8F0`                 | `#E7E5DF`                |
| `progressFill`  | `#475569`                 | `#E35205`                |
| `progressGlow`  | `rgba(71, 85, 105, 0.25)` | `rgba(227, 82, 5, 0.25)` |

#### 1.9 Interactive

| Token                 | Old Value | New Value |
| --------------------- | --------- | --------- |
| `buttonPrimaryBg`     | `#334155` | `#E35205` |
| `buttonPrimaryText`   | `#FFFFFF` | `#FFFFFF` |
| `buttonSecondaryBg`   | `#F1F5F9` | `#EDEBE5` |
| `buttonSecondaryText` | `#1E293B` | `#171717` |
| `toggleOn`            | `#475569` | `#E35205` |
| `toggleOff`           | `#CBD5E1` | `#D6D3D1` |
| `toggleThumb`         | `#FFFFFF` | `#FFFFFF` |

#### 1.10 Borders

| Token          | Old Value                 | New Value             |
| -------------- | ------------------------- | --------------------- |
| `border`       | `rgba(71, 85, 105, 0.15)` | `rgba(0, 0, 0, 0.08)` |
| `borderSubtle` | `rgba(71, 85, 105, 0.08)` | `rgba(0, 0, 0, 0.04)` |
| `divider`      | `rgba(71, 85, 105, 0.08)` | `rgba(0, 0, 0, 0.06)` |

#### 1.11 Shadows

| Token              | Old Value                           | New Value                        |
| ------------------ | ----------------------------------- | -------------------------------- |
| `shadowColor`      | `rgba(15, 23, 42, 0.06)`            | `rgba(0, 0, 0, 0.06)`            |
| `shadowElevation1` | `0 1px 3px rgba(15, 23, 42, 0.04)`  | `0 1px 3px rgba(0, 0, 0, 0.04)`  |
| `shadowElevation2` | `0 4px 12px rgba(15, 23, 42, 0.06)` | `0 4px 12px rgba(0, 0, 0, 0.06)` |
| `shadowElevation3` | `0 8px 24px rgba(15, 23, 42, 0.08)` | `0 8px 24px rgba(0, 0, 0, 0.08)` |

#### 1.12 Pearls

| Token           | Old Value                  | New Value                  |
| --------------- | -------------------------- | -------------------------- |
| `pearlBg`       | `#FFFFFF`                  | `#FFFFFF`                  |
| `pearlShimmer`  | `rgba(248, 250, 252, 0.8)` | `rgba(255, 255, 255, 0.8)` |
| `pearlOrb`      | `#F1F5F9`                  | `#F5F5F0`                  |
| `pearlOrbInner` | `#E2E8F0`                  | `#E7E5DF`                  |

#### 1.13 Navigation

| Token           | Old Value                   | New Value                   |
| --------------- | --------------------------- | --------------------------- |
| `navBg`         | `rgba(248, 250, 252, 0.95)` | `rgba(245, 245, 240, 0.95)` |
| `navActive`     | `#1E293B`                   | `#E35205`                   |
| `navInactive`   | `#64748B`                   | `#737373`                   |
| `pullIndicator` | `#475569`                   | `#E35205`                   |

#### 1.14 Voice Badges

| Token                  | Old Value                  | New Value                |
| ---------------------- | -------------------------- | ------------------------ |
| `voiceHighBg`          | `rgba(34, 197, 94, 0.12)`  | `rgba(227, 82, 5, 0.15)` |
| `voiceHighText`        | `#166534`                  | `#C2410C`                |
| `voiceHighDot`         | `#22C55E`                  | `#E35205`                |
| `voiceEstablishedBg`   | `rgba(59, 130, 246, 0.12)` | `rgba(227, 82, 5, 0.10)` |
| `voiceEstablishedText` | `#1D4ED8`                  | `#525252`                |
| `voiceEstablishedDot`  | `#3B82F6`                  | `#E9762B`                |
| `voiceGrowingBg`       | `rgba(71, 85, 105, 0.12)`  | `rgba(227, 82, 5, 0.06)` |
| `voiceGrowingText`     | `#334155`                  | `#737373`                |
| `voiceGrowingDot`      | `#64748B`                  | `#EFA06A`                |
| `voiceNewBg`           | `#F1F5F9`                  | `#EDEBE5`                |
| `voiceNewText`         | `#64748B`                  | `#737373`                |
| `voiceNewDot`          | `#94A3B8`                  | `#D6D3D1`                |

#### 1.15 Meta

| Token            | Old Value | New Value |
| ---------------- | --------- | --------- |
| `isDark`         | `false`   | `false`   |
| `seasonalAccent` | `#475569` | `#E35205` |

---

### Phase 2: Update NEUTRAL_DARK Tokens

Replace all values in the `NEUTRAL_DARK` export:

#### 2.1 Backgrounds

| Token        | Old Value            | New Value            |
| ------------ | -------------------- | -------------------- |
| `bgBase`     | `#0F172A`            | `#1C1917`            |
| `bgElevated` | `#1E293B`            | `#292524`            |
| `bgDeep`     | `#0B1120`            | `#0C0A09`            |
| `bgOverlay`  | `rgba(0, 0, 0, 0.6)` | `rgba(0, 0, 0, 0.7)` |

#### 2.2 Text

| Token           | Old Value | New Value |
| --------------- | --------- | --------- |
| `textPrimary`   | `#F1F5F9` | `#FAFAF9` |
| `textSecondary` | `#CBD5E1` | `#A8A29E` |
| `textMuted`     | `#94A3B8` | `#78716C` |
| `textOnAccent`  | `#FFFFFF` | `#FFFFFF` |

#### 2.3 Accent (Hermès Orange - boosted for dark)

| Token         | Old Value                   | New Value                 |
| ------------- | --------------------------- | ------------------------- |
| `accent`      | `#94A3B8`                   | `#EA580C`                 |
| `accentHover` | `#CBD5E1`                   | `#F97316`                 |
| `accentMuted` | `rgba(148, 163, 184, 0.15)` | `rgba(234, 88, 12, 0.15)` |
| `accentGlow`  | `rgba(148, 163, 184, 0.3)`  | `rgba(234, 88, 12, 0.35)` |

#### 2.4 Orb

| Token           | Old Value                   | New Value                 |
| --------------- | --------------------------- | ------------------------- |
| `orbCore`       | `#F1F5F9`                   | `#FAFAF9`                 |
| `orbMid`        | `#94A3B8`                   | `#78716C`                 |
| `orbEdge`       | `#64748B`                   | `#44403C`                 |
| `orbGlow`       | `rgba(148, 163, 184, 0.35)` | `rgba(234, 88, 12, 0.35)` |
| `orbAtmosphere` | `rgba(148, 163, 184, 0.12)` | `rgba(234, 88, 12, 0.12)` |

#### 2.5 Stones

| Token                 | Old Value                   | New Value                |
| --------------------- | --------------------------- | ------------------------ |
| `stoneCompleted`      | `#94A3B8`                   | `#A8A29E`                |
| `stoneCompletedInner` | `#CBD5E1`                   | `#D6D3D1`                |
| `stonePlanned`        | `rgba(148, 163, 184, 0.25)` | `rgba(234, 88, 12, 0.2)` |
| `stonePlannedBorder`  | `rgba(148, 163, 184, 0.5)`  | `rgba(234, 88, 12, 0.6)` |
| `stoneEmpty`          | `#1E293B`                   | `#292524`                |
| `stoneToday`          | `#334155`                   | `#3D3836`                |

#### 2.6 Cards

| Token        | Old Value                  | New Value                   |
| ------------ | -------------------------- | --------------------------- |
| `cardBg`     | `#1E293B`                  | `#292524`                   |
| `cardBorder` | `rgba(148, 163, 184, 0.1)` | `rgba(255, 255, 255, 0.06)` |
| `cardShadow` | `rgba(0, 0, 0, 0.3)`       | `rgba(0, 0, 0, 0.4)`        |

#### 2.7 Calendar

| Token                | Old Value                   | New Value                 |
| -------------------- | --------------------------- | ------------------------- |
| `calendarDayBg`      | `#1E293B`                   | `#292524`                 |
| `calendarDayText`    | `#CBD5E1`                   | `#A8A29E`                 |
| `calendarIntensity1` | `rgba(148, 163, 184, 0.15)` | `rgba(234, 88, 12, 0.15)` |
| `calendarIntensity2` | `rgba(148, 163, 184, 0.30)` | `rgba(234, 88, 12, 0.30)` |
| `calendarIntensity3` | `rgba(148, 163, 184, 0.50)` | `rgba(234, 88, 12, 0.50)` |
| `calendarIntensity4` | `rgba(148, 163, 184, 0.70)` | `rgba(234, 88, 12, 0.70)` |

#### 2.8 Progress

| Token           | Old Value                  | New Value                 |
| --------------- | -------------------------- | ------------------------- |
| `progressTrack` | `#334155`                  | `#3D3836`                 |
| `progressFill`  | `#94A3B8`                  | `#EA580C`                 |
| `progressGlow`  | `rgba(148, 163, 184, 0.3)` | `rgba(234, 88, 12, 0.35)` |

#### 2.9 Interactive

| Token                 | Old Value | New Value |
| --------------------- | --------- | --------- |
| `buttonPrimaryBg`     | `#94A3B8` | `#EA580C` |
| `buttonPrimaryText`   | `#0F172A` | `#FFFFFF` |
| `buttonSecondaryBg`   | `#334155` | `#3D3836` |
| `buttonSecondaryText` | `#F1F5F9` | `#FAFAF9` |
| `toggleOn`            | `#94A3B8` | `#EA580C` |
| `toggleOff`           | `#334155` | `#3D3836` |
| `toggleThumb`         | `#FFFFFF` | `#FFFFFF` |

#### 2.10 Borders

| Token          | Old Value                   | New Value                   |
| -------------- | --------------------------- | --------------------------- |
| `border`       | `rgba(148, 163, 184, 0.15)` | `rgba(255, 255, 255, 0.08)` |
| `borderSubtle` | `rgba(148, 163, 184, 0.08)` | `rgba(255, 255, 255, 0.04)` |
| `divider`      | `rgba(148, 163, 184, 0.08)` | `rgba(255, 255, 255, 0.06)` |

#### 2.11 Shadows

| Token              | Old Value                       | New Value                       |
| ------------------ | ------------------------------- | ------------------------------- |
| `shadowColor`      | `rgba(0, 0, 0, 0.4)`            | `rgba(0, 0, 0, 0.4)`            |
| `shadowElevation1` | `0 1px 3px rgba(0, 0, 0, 0.2)`  | `0 1px 3px rgba(0, 0, 0, 0.2)`  |
| `shadowElevation2` | `0 4px 12px rgba(0, 0, 0, 0.3)` | `0 4px 12px rgba(0, 0, 0, 0.3)` |
| `shadowElevation3` | `0 8px 24px rgba(0, 0, 0, 0.4)` | `0 8px 24px rgba(0, 0, 0, 0.4)` |

#### 2.12 Pearls

| Token           | Old Value               | New Value               |
| --------------- | ----------------------- | ----------------------- |
| `pearlBg`       | `#1E293B`               | `#292524`               |
| `pearlShimmer`  | `rgba(30, 41, 59, 0.8)` | `rgba(41, 37, 36, 0.8)` |
| `pearlOrb`      | `#334155`               | `#3D3836`               |
| `pearlOrbInner` | `#475569`               | `#44403C`               |

#### 2.13 Navigation

| Token           | Old Value                | New Value                |
| --------------- | ------------------------ | ------------------------ |
| `navBg`         | `rgba(15, 23, 42, 0.95)` | `rgba(28, 25, 23, 0.95)` |
| `navActive`     | `#F1F5F9`                | `#EA580C`                |
| `navInactive`   | `#94A3B8`                | `#78716C`                |
| `pullIndicator` | `#94A3B8`                | `#EA580C`                |

#### 2.14 Voice Badges

| Token                  | Old Value                   | New Value                 |
| ---------------------- | --------------------------- | ------------------------- |
| `voiceHighBg`          | `rgba(34, 197, 94, 0.15)`   | `rgba(234, 88, 12, 0.18)` |
| `voiceHighText`        | `#86EFAC`                   | `#FB923C`                 |
| `voiceHighDot`         | `#22C55E`                   | `#EA580C`                 |
| `voiceEstablishedBg`   | `rgba(59, 130, 246, 0.15)`  | `rgba(234, 88, 12, 0.12)` |
| `voiceEstablishedText` | `#93C5FD`                   | `#A8A29E`                 |
| `voiceEstablishedDot`  | `#3B82F6`                   | `#F97316`                 |
| `voiceGrowingBg`       | `rgba(148, 163, 184, 0.15)` | `rgba(234, 88, 12, 0.08)` |
| `voiceGrowingText`     | `#CBD5E1`                   | `#78716C`                 |
| `voiceGrowingDot`      | `#94A3B8`                   | `#FB923C`                 |
| `voiceNewBg`           | `#334155`                   | `#292524`                 |
| `voiceNewText`         | `#94A3B8`                   | `#78716C`                 |
| `voiceNewDot`          | `#64748B`                   | `#57534E`                 |

#### 2.15 Meta

| Token            | Old Value | New Value |
| ---------------- | --------- | --------- |
| `isDark`         | `true`    | `true`    |
| `seasonalAccent` | `#94A3B8` | `#EA580C` |

---

### Phase 3: Create QA Test File

Create `src/lib/theme/__tests__/neutral.test.ts` with comprehensive assertions for:

1. **Token Existence:** All 57 tokens exist in both NEUTRAL_LIGHT and NEUTRAL_DARK
2. **Value Correctness:** Each token matches the specified new value
3. **Color Format Validation:** Hex colors are valid, rgba values are properly formatted
4. **Contrast Verification:** Key text/background combinations meet WCAG AA (4.5:1)
5. **Consistency Checks:** isDark flag matches theme, accent colors are consistent

---

## Verification Checklist

After execution, verify:

- [ ] `NEUTRAL_LIGHT.bgBase` is `#F5F5F0` (warm cream)
- [ ] `NEUTRAL_DARK.bgBase` is `#1C1917` (warm charcoal)
- [ ] `NEUTRAL_LIGHT.accent` is `#E35205` (Hermès orange)
- [ ] `NEUTRAL_DARK.accent` is `#EA580C` (boosted orange)
- [ ] All calendar intensity colors use orange base
- [ ] All voice badge colors use orange variants
- [ ] Navigation active color is orange
- [ ] Progress fill is orange
- [ ] Buttons primary background is orange
- [ ] All 57 tokens updated in both themes
- [ ] QA tests pass with 100% coverage

---

## Rollback Plan

If issues arise, revert `neutral.ts` to previous commit:

```bash
git checkout HEAD~1 -- src/lib/theme/tokens/neutral.ts
```
