# Meditation Band - Wearable Timer

A wearable meditation timer that lives on your wrist as a gentle reminder, then transforms into the practice object itself when removed and held in cupped hands.

## The Core Insight

The device you **remove** to meditate becomes more powerful than one you pick up.

- Worn on wrist between sessions = constant gentle reminder
- Taking it off = ritual transition into sacred time
- Holding it in cupped hands = the object becomes part of the meditation pose itself

## Philosophy

No screen. No numbers during practice. A slim band that syncs with the 10000 Hours app via Bluetooth, replacing the phone during meditation while maintaining the app as the source of truth.

**What The Band Does:**

- Wearable (wrist) between sessions
- Remove easily for meditation
- Start session with haptic gesture (squeeze)
- End session with same gesture (or goal completion)
- Communicate completion via vibration felt in palms
- Sync sessions to app (invisible)

**What it Does NOT Do:**

- Display numbers
- Require looking at anything
- Feel like a smartwatch
- Demand attention

## Comparison: Screen Timer vs Band

| Aspect            | Pi Screen Timer       | Meditation Band         |
| ----------------- | --------------------- | ----------------------- |
| Form              | Desktop device        | Wearable (wrist)        |
| Boot time         | 10-30 seconds         | Instant                 |
| Battery life      | Needs constant power  | 3-5 days per charge     |
| Portability       | Desk/floor only       | Always with you         |
| Visual feedback   | Full timer UI, hours  | LED pulse only          |
| Interaction       | Pick up, press button | Remove, hold, squeeze   |
| During meditation | Sits beside you       | Held in your hands      |
| Philosophy        | Mirror the app        | Become part of practice |

Both are valid choices. The band integrates the timer into the meditation posture itself.

## The Daily Ritual

```
1. Band on wrist all day (reminder)
2. Time to meditate → remove band
3. Sit, cup hands, squeeze module
4. Practice...
5. Feel completion pulses in palms
6. Put band back on
7. Continue day, hours logged
```

## Interaction

### Starting a Session

1. Remove band from wrist (ritual transition)
2. Settle into meditation posture
3. Cup hands, thumbs touching, band resting in palms
4. Squeeze the module sides (both touch sensors)
5. Single haptic pulse confirms start
6. LED breathes softly (optional)
7. Close eyes, begin practice

### During Session

- Band rests in cupped hands
- LED pulses at breath rhythm (8 second cycle) if enabled
- If goal set: LED gradually brightens approaching end
- No other feedback - pure stillness

### Ending a Session

**Manual end (no goal):**

1. Squeeze module sides again
2. Three haptic pulses - felt directly in palms
3. LED glows steady 30s
4. Session saved locally
5. Put band back on wrist
6. Syncs when app in range

**Goal reached:**

1. Three haptic pulses in palms
2. LED glows steady
3. Phone chimes (if app open)
4. Squeeze to confirm end, or continue sitting

## Feedback Reference

### While Worn (Between Sessions)

| State                       | Feedback                              |
| --------------------------- | ------------------------------------- |
| Idle                        | LED off, band is just a bracelet      |
| Planned session approaching | Subtle single pulse every few minutes |
| Low battery                 | Double-pulse pattern when touched     |

### During Meditation (Held in Hands)

| State            | Feedback                                   |
| ---------------- | ------------------------------------------ |
| Session active   | Slow LED pulse (breath rhythm, 8s cycle)   |
| Time passing     | None - intentionally absent                |
| Approaching goal | LED pulse gradually brightens (last 2 min) |

### Session Complete

| Feedback | Implementation                             |
| -------- | ------------------------------------------ |
| Haptic   | Three gentle pulses - felt in cupped palms |
| Visual   | LED glows steady for 30s, then fades       |
| Audio    | None on device - phone chimes if app open  |

## Hardware Overview

- **Microcontroller**: ESP32-C3 (XIAO form factor)
- **Battery**: 100-150mAh LiPo
- **Interaction**: Capacitive touch sensors (squeeze to start/stop)
- **Feedback**: Single LED + coin vibration motor
- **Charging**: Magnetic pogo pins

**Estimated Cost**: ~$64 prototype, ~$179 production (titanium)

## Documentation

- [HARDWARE.md](./HARDWARE.md) - Parts list, module design, strap options
- [ELECTRONICS.md](./ELECTRONICS.md) - ESP32 wiring, PCB layout, charging
- [ENCLOSURE.md](./ENCLOSURE.md) - Module housing, strap attachment, materials
- [APP-INTEGRATION.md](./APP-INTEGRATION.md) - BLE protocol (same as Pi timer)
- [FIRMWARE/](./FIRMWARE/) - PlatformIO project with complete firmware

## Build Milestones

1. **Electronics Proof of Concept** - ESP32 + touch sensors + haptics on breadboard
2. **Miniaturization** - Custom PCB (~35mm x 12mm)
3. **App Integration** - BLE sync working
4. **Module Enclosure** - 3D printed capsule housing
5. **Strap Integration** - Wearable with magnetic clasp
6. **Charging Solution** - Pogo pin cradle
7. **Production Materials** (Optional) - CNC titanium, premium strap

## Verification Checklist

- [ ] ESP32-C3 boots and enters deep sleep
- [ ] Touch sensors detect squeeze gesture
- [ ] Vibration motor pulses on command
- [ ] LED breathes during session
- [ ] Squeeze starts timer
- [ ] Squeeze stops timer
- [ ] Three pulses on session complete
- [ ] Session saved to flash storage
- [ ] Device advertises BLE service
- [ ] App discovers band
- [ ] Sessions sync from band to app
- [ ] Plans sync from app to band
- [ ] Battery lasts 3+ days typical use
- [ ] Comfortable worn all day
- [ ] Easy to remove for meditation
- [ ] Feels natural held in cupped hands
