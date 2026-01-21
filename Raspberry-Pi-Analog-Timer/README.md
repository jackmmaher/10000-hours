# Raspberry Pi Analog-Digital Meditation Timer

A dedicated meditation timer that provides the 10000 Hours experience without the phone. Physical knobs. Tactile button. No notifications. Pure stillness.

## Overview

This device syncs with the 10000 Hours app via Bluetooth, replacing the phone during meditation while maintaining the app as the source of truth for all meditation data.

### Key Features

- **Desktop portable** - sits on floor during meditation (slanted screen facing up), moves to desk as reminder
- **Slanted display** - angled so meditator looking down sees the screen naturally
- **Physical controls** - two rotary knobs (volume, brightness), one tactile start/stop button
- **Offline during meditation** - no active connection while timer runs
- **Auto-sync when in range** - silently syncs sessions when phone nearby

## Key Decisions

| Decision        | Choice                     | Rationale                                            |
| --------------- | -------------------------- | ---------------------------------------------------- |
| Microcontroller | Raspberry Pi Zero 2 W      | Built-in Bluetooth, WiFi, affordable, good community |
| Display         | 3.5" IPS LCD touchscreen   | Color, smooth animation, reasonable resolution       |
| Connectivity    | BLE (Bluetooth Low Energy) | Low power, reliable, native mobile support           |
| Session storage | Offline first              | Sacred space - no connection during meditation       |
| Sync trigger    | Automatic proximity        | Seamless experience, no manual steps                 |

## Display Behavior

- **Idle state**: Mirrors Timer tab - "26h 45m" prominently displayed, "Tap to meditate" indicator
- **Active state**: Exact timer experience from app - counting seconds, or pulsating orb mode
- **Completion state**: Shows cumulative time growth ("26h 45m → 27h 10m")

## Documentation

- [HARDWARE.md](./HARDWARE.md) - Parts list, wiring diagrams, assembly guide
- [PI-SOFTWARE.md](./PI-SOFTWARE.md) - Python application architecture
- [APP-INTEGRATION.md](./APP-INTEGRATION.md) - React Native Bluetooth integration
- [ENCLOSURE.md](./ENCLOSURE.md) - Physical design, 3D print files, materials
- [reference/sync-protocol.md](./reference/sync-protocol.md) - BLE GATT service definitions

## Build Milestones

1. **Proof of Concept** - Display text, detect button press
2. **Full Timer** - Complete UI, knobs, sound, local storage
3. **Bluetooth Sync** - Bidirectional communication with app
4. **Enclosure** - Physical housing with slanted design

## Estimated Cost

~$75-100 for all hardware components

## Build Complexity

Beginner-friendly with patience. No soldering required for initial prototype (breadboard-based).

## Verification Checklist

- [ ] Pi boots and displays idle screen
- [ ] Button press starts timer
- [ ] Timer counts correctly
- [ ] Button press stops timer
- [ ] Session saved to local SQLite
- [ ] Rotary encoder adjusts brightness
- [ ] Rotary encoder adjusts volume
- [ ] Chime plays at session end
- [ ] Device advertises BLE service
- [ ] App discovers device
- [ ] App pairs with device
- [ ] Plans sync from app to device
- [ ] Sessions sync from device to app
- [ ] Sessions appear in app Journey tab
- [ ] Hour bank updates after sync
- [ ] Auto-sync triggers when in proximity
