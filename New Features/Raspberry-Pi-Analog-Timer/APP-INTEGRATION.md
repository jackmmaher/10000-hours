# App Integration Guide

React Native Bluetooth integration for the 10000 Hours app to communicate with the meditation timer device.

## Bluetooth Architecture

The Pi device acts as a **BLE Peripheral (GATT Server)**. The phone app acts as a **BLE Central (GATT Client)**.

```
┌──────────────────┐         BLE          ┌──────────────────┐
│                  │ ◄─────────────────── │                  │
│   Phone App      │      Scanning        │   Pi Timer       │
│   (Central)      │ ───────────────────► │   (Peripheral)   │
│                  │   Connect/Read/Write │                  │
└──────────────────┘                      └──────────────────┘
```

## GATT Service Definition

See [reference/sync-protocol.md](./reference/sync-protocol.md) for complete specification.

**Service UUID:** `10000001-0000-1000-8000-00805f9b34fb`

| Characteristic      | UUID         | Properties   | Description                  |
| ------------------- | ------------ | ------------ | ---------------------------- |
| Cumulative Hours    | 10000002-... | Read         | Total seconds (uint32)       |
| Device Status       | 10000003-... | Read, Notify | Timer state (uint8)          |
| Pending Sessions    | 10000004-... | Read         | Unsynced sessions (JSON)     |
| Planned Sessions    | 10000005-... | Write        | Today's plans (JSON)         |
| Sync Acknowledgment | 10000006-... | Write        | Synced UUIDs (JSON)          |
| Total Hours Update  | 10000007-... | Write        | Authoritative total (uint32) |

## New Files Required

```
/src/lib/bluetooth/
├── bleService.ts              # BLE scanning, connection management
├── meditationDeviceProfile.ts # GATT service UUIDs and parsing
├── syncOrchestrator.ts        # Coordinates plan/session sync
└── types.ts                   # TypeScript interfaces

/src/stores/
└── useDeviceStore.ts          # Device connection state

/src/components/
└── DeviceConnectionIndicator.tsx  # UI for pairing status
```

## Implementation

### types.ts

```typescript
// src/lib/bluetooth/types.ts

export interface MeditationDevice {
  id: string
  name: string
  rssi: number
  connected: boolean
}

export interface DeviceSession {
  uuid: string
  startTime: number // Unix timestamp ms
  endTime: number
  durationSeconds: number
  pose?: string
  discipline?: string
}

export interface DevicePlan {
  date: number
  plannedTime?: string
  duration?: number
  title?: string
  discipline?: string
  enforceGoal: boolean
}

export enum DeviceStatus {
  Idle = 0,
  Pending = 1,
  Active = 2,
  Settling = 3,
}
```

### meditationDeviceProfile.ts

```typescript
// src/lib/bluetooth/meditationDeviceProfile.ts

export const MEDITATION_SERVICE_UUID = '10000001-0000-1000-8000-00805f9b34fb'

export const CHARACTERISTICS = {
  CUMULATIVE_HOURS: '10000002-0000-1000-8000-00805f9b34fb',
  DEVICE_STATUS: '10000003-0000-1000-8000-00805f9b34fb',
  PENDING_SESSIONS: '10000004-0000-1000-8000-00805f9b34fb',
  PLANNED_SESSIONS: '10000005-0000-1000-8000-00805f9b34fb',
  SYNC_ACKNOWLEDGMENT: '10000006-0000-1000-8000-00805f9b34fb',
  TOTAL_HOURS_UPDATE: '10000007-0000-1000-8000-00805f9b34fb',
} as const

/**
 * Parse cumulative seconds from raw BLE data
 */
export function parseCumulativeHours(data: Uint8Array): number {
  const view = new DataView(data.buffer)
  return view.getUint32(0, true) // Little-endian
}

/**
 * Parse device status byte
 */
export function parseDeviceStatus(data: Uint8Array): number {
  return data[0]
}

/**
 * Parse pending sessions JSON
 */
export function parsePendingSessions(data: Uint8Array): DeviceSession[] {
  const decoder = new TextDecoder()
  const json = decoder.decode(data)
  return JSON.parse(json)
}

/**
 * Encode planned sessions as JSON for write
 */
export function encodePlannedSessions(plans: DevicePlan[]): Uint8Array {
  const json = JSON.stringify(plans)
  const encoder = new TextEncoder()
  return encoder.encode(json)
}

/**
 * Encode sync acknowledgment UUIDs
 */
export function encodeSyncAck(uuids: string[]): Uint8Array {
  const json = JSON.stringify(uuids)
  const encoder = new TextEncoder()
  return encoder.encode(json)
}

/**
 * Encode total seconds for write
 */
export function encodeTotalSeconds(seconds: number): Uint8Array {
  const buffer = new ArrayBuffer(4)
  const view = new DataView(buffer)
  view.setUint32(0, seconds, true) // Little-endian
  return new Uint8Array(buffer)
}
```

### bleService.ts

```typescript
// src/lib/bluetooth/bleService.ts

import { BleManager, Device, Characteristic } from 'react-native-ble-plx'
import { MEDITATION_SERVICE_UUID, CHARACTERISTICS } from './meditationDeviceProfile'
import type { MeditationDevice } from './types'

class BLEService {
  private manager: BleManager
  private connectedDevice: Device | null = null
  private scanCallback: ((device: MeditationDevice) => void) | null = null

  constructor() {
    this.manager = new BleManager()
  }

  /**
   * Start scanning for meditation timer devices
   */
  async startScanning(onDeviceFound: (device: MeditationDevice) => void): Promise<void> {
    this.scanCallback = onDeviceFound

    // Request permissions first (handled elsewhere)
    this.manager.startDeviceScan(
      [MEDITATION_SERVICE_UUID],
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('BLE scan error:', error)
          return
        }

        if (device && this.scanCallback) {
          this.scanCallback({
            id: device.id,
            name: device.name || 'Meditation Timer',
            rssi: device.rssi || 0,
            connected: false,
          })
        }
      }
    )
  }

  stopScanning(): void {
    this.manager.stopDeviceScan()
  }

  /**
   * Connect to a meditation timer device
   */
  async connect(deviceId: string): Promise<boolean> {
    try {
      const device = await this.manager.connectToDevice(deviceId)
      await device.discoverAllServicesAndCharacteristics()
      this.connectedDevice = device

      // Monitor connection state
      device.onDisconnected(() => {
        this.connectedDevice = null
      })

      return true
    } catch (error) {
      console.error('BLE connect error:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      await this.connectedDevice.cancelConnection()
      this.connectedDevice = null
    }
  }

  /**
   * Read a characteristic value
   */
  async readCharacteristic(uuid: string): Promise<Uint8Array | null> {
    if (!this.connectedDevice) return null

    try {
      const char = await this.connectedDevice.readCharacteristicForService(
        MEDITATION_SERVICE_UUID,
        uuid
      )

      if (char.value) {
        // Value is base64 encoded
        const decoded = Buffer.from(char.value, 'base64')
        return new Uint8Array(decoded)
      }
    } catch (error) {
      console.error('BLE read error:', error)
    }

    return null
  }

  /**
   * Write to a characteristic
   */
  async writeCharacteristic(uuid: string, data: Uint8Array): Promise<boolean> {
    if (!this.connectedDevice) return false

    try {
      const base64 = Buffer.from(data).toString('base64')
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        MEDITATION_SERVICE_UUID,
        uuid,
        base64
      )
      return true
    } catch (error) {
      console.error('BLE write error:', error)
      return false
    }
  }

  /**
   * Subscribe to characteristic notifications
   */
  onCharacteristicChange(uuid: string, callback: (data: Uint8Array) => void): () => void {
    if (!this.connectedDevice) return () => {}

    const subscription = this.connectedDevice.monitorCharacteristicForService(
      MEDITATION_SERVICE_UUID,
      uuid,
      (error, char) => {
        if (error) {
          console.error('BLE notify error:', error)
          return
        }

        if (char?.value) {
          const decoded = Buffer.from(char.value, 'base64')
          callback(new Uint8Array(decoded))
        }
      }
    )

    return () => subscription.remove()
  }

  get isConnected(): boolean {
    return this.connectedDevice !== null
  }
}

export const bleService = new BLEService()
```

### syncOrchestrator.ts

```typescript
// src/lib/bluetooth/syncOrchestrator.ts

import { bleService } from './bleService'
import {
  CHARACTERISTICS,
  parsePendingSessions,
  encodePlannedSessions,
  encodeSyncAck,
  encodeTotalSeconds,
} from './meditationDeviceProfile'
import type { DeviceSession, DevicePlan } from './types'
import { useSessionStore } from '@/stores/useSessionStore'
import { usePlanStore } from '@/stores/usePlanStore'
import { useHourBankStore } from '@/stores/useHourBankStore'

class SyncOrchestrator {
  private syncing = false

  /**
   * Perform full bidirectional sync with device
   */
  async performFullSync(): Promise<void> {
    if (this.syncing || !bleService.isConnected) return

    this.syncing = true

    try {
      // 1. Sync plans TO device
      await this.syncPlansToDevice()

      // 2. Sync sessions FROM device
      await this.syncSessionsFromDevice()

      // 3. Update device with authoritative total
      await this.syncTotalToDevice()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      this.syncing = false
    }
  }

  /**
   * Send today's planned sessions to device
   */
  private async syncPlansToDevice(): Promise<void> {
    const planStore = usePlanStore.getState()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get plans for today
    const todaysPlans = planStore.plans.filter((plan) => {
      const planDate = new Date(plan.date)
      return planDate.toDateString() === today.toDateString()
    })

    const devicePlans: DevicePlan[] = todaysPlans.map((plan) => ({
      date: plan.date,
      plannedTime: plan.plannedTime,
      duration: plan.duration,
      title: plan.title,
      discipline: plan.discipline,
      enforceGoal: plan.enforceGoal ?? false,
    }))

    const encoded = encodePlannedSessions(devicePlans)
    await bleService.writeCharacteristic(CHARACTERISTICS.PLANNED_SESSIONS, encoded)
  }

  /**
   * Import unsynced sessions from device
   */
  private async syncSessionsFromDevice(): Promise<void> {
    const data = await bleService.readCharacteristic(CHARACTERISTICS.PENDING_SESSIONS)
    if (!data) return

    const sessions = parsePendingSessions(data)
    if (sessions.length === 0) return

    const sessionStore = useSessionStore.getState()
    const hourBankStore = useHourBankStore.getState()
    const syncedUuids: string[] = []

    for (const deviceSession of sessions) {
      try {
        // Create session in app
        await sessionStore.addSession({
          id: deviceSession.uuid,
          startTime: deviceSession.startTime,
          endTime: deviceSession.endTime,
          duration: deviceSession.durationSeconds,
          source: 'device',
          pose: deviceSession.pose,
          discipline: deviceSession.discipline,
        })

        // Consume from hour bank
        const hoursUsed = deviceSession.durationSeconds / 3600
        await hourBankStore.consumeHours(hoursUsed, deviceSession.uuid)

        syncedUuids.push(deviceSession.uuid)
      } catch (error) {
        console.error('Failed to import session:', deviceSession.uuid, error)
      }
    }

    // Acknowledge synced sessions to device
    if (syncedUuids.length > 0) {
      const encoded = encodeSyncAck(syncedUuids)
      await bleService.writeCharacteristic(CHARACTERISTICS.SYNC_ACKNOWLEDGMENT, encoded)
    }
  }

  /**
   * Send authoritative total hours to device
   */
  private async syncTotalToDevice(): Promise<void> {
    const sessionStore = useSessionStore.getState()
    const totalSeconds = sessionStore.getTotalSeconds()

    const encoded = encodeTotalSeconds(totalSeconds)
    await bleService.writeCharacteristic(CHARACTERISTICS.TOTAL_HOURS_UPDATE, encoded)
  }
}

export const syncOrchestrator = new SyncOrchestrator()
```

### useDeviceStore.ts

```typescript
// src/stores/useDeviceStore.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { MeditationDevice, DeviceStatus } from '@/lib/bluetooth/types'

interface DeviceState {
  // Paired device info (persisted)
  pairedDevice: MeditationDevice | null

  // Runtime state
  isConnected: boolean
  isScanning: boolean
  deviceStatus: DeviceStatus

  // Actions
  setPairedDevice: (device: MeditationDevice | null) => void
  setConnected: (connected: boolean) => void
  setScanning: (scanning: boolean) => void
  setDeviceStatus: (status: DeviceStatus) => void
  unpair: () => void
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set) => ({
      pairedDevice: null,
      isConnected: false,
      isScanning: false,
      deviceStatus: 0, // Idle

      setPairedDevice: (device) => set({ pairedDevice: device }),
      setConnected: (connected) => set({ isConnected: connected }),
      setScanning: (scanning) => set({ isScanning: scanning }),
      setDeviceStatus: (status) => set({ deviceStatus: status }),
      unpair: () => set({ pairedDevice: null, isConnected: false }),
    }),
    {
      name: 'device-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ pairedDevice: state.pairedDevice }),
    }
  )
)
```

### DeviceConnectionIndicator.tsx

```typescript
// src/components/DeviceConnectionIndicator.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDeviceStore } from '@/stores/useDeviceStore';
import { DeviceStatus } from '@/lib/bluetooth/types';

export function DeviceConnectionIndicator() {
  const { pairedDevice, isConnected, deviceStatus } = useDeviceStore();

  if (!pairedDevice) {
    return null; // No device paired, don't show indicator
  }

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    switch (deviceStatus) {
      case DeviceStatus.Active:
        return 'Meditating';
      case DeviceStatus.Pending:
        return 'Starting...';
      case DeviceStatus.Settling:
        return 'Completing...';
      default:
        return 'Connected';
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return '#888';
    if (deviceStatus === DeviceStatus.Active) return '#4CAF50';
    return '#2196F3';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
});
```

## Integration Points

### Background Proximity Detection

Add to app initialization (e.g., `App.tsx`):

```typescript
import { useEffect } from 'react'
import { AppState } from 'react-native'
import { bleService } from '@/lib/bluetooth/bleService'
import { syncOrchestrator } from '@/lib/bluetooth/syncOrchestrator'
import { useDeviceStore } from '@/stores/useDeviceStore'

function useBackgroundDeviceSync() {
  const { pairedDevice, setConnected } = useDeviceStore()

  useEffect(() => {
    if (!pairedDevice) return

    let reconnectInterval: NodeJS.Timeout

    const attemptReconnect = async () => {
      if (!bleService.isConnected) {
        const connected = await bleService.connect(pairedDevice.id)
        setConnected(connected)

        if (connected) {
          await syncOrchestrator.performFullSync()
        }
      }
    }

    // Try to reconnect periodically when app is active
    const handleAppStateChange = (state: string) => {
      if (state === 'active') {
        attemptReconnect()
        reconnectInterval = setInterval(attemptReconnect, 30000) // Every 30s
      } else {
        clearInterval(reconnectInterval)
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    attemptReconnect() // Initial attempt

    return () => {
      subscription.remove()
      clearInterval(reconnectInterval)
    }
  }, [pairedDevice])
}
```

### Session Store Integration

After saving a session, notify device store:

```typescript
// In useSessionStore.ts, after stopTimer():

// Queue session for potential device sync
if (useDeviceStore.getState().isConnected) {
  syncOrchestrator.performFullSync()
}
```

### Settings Screen

Add device management section:

```typescript
// In Settings screen

import { useDeviceStore } from '@/stores/useDeviceStore';
import { bleService } from '@/lib/bluetooth/bleService';

function DeviceSettings() {
  const { pairedDevice, isConnected, unpair } = useDeviceStore();

  const handlePair = async () => {
    // Navigate to pairing screen
  };

  const handleUnpair = async () => {
    await bleService.disconnect();
    unpair();
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Meditation Timer Device</Text>

      {pairedDevice ? (
        <View>
          <Text>Device: {pairedDevice.name}</Text>
          <Text>Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
          <TouchableOpacity onPress={handleUnpair}>
            <Text>Unpair Device</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={handlePair}>
          <Text>Pair Meditation Timer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

## Required Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "react-native-ble-plx": "^3.1.2"
  }
}
```

### iOS Setup

Add to `ios/[AppName]/Info.plist`:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app uses Bluetooth to connect to your meditation timer device.</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>This app uses Bluetooth to connect to your meditation timer device.</string>
<key>UIBackgroundModes</key>
<array>
  <string>bluetooth-central</string>
</array>
```

### Android Setup

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"/>
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

## Sync Protocol Flow

### Plans Sync (App → Device)

```
1. App connects to device when in range
2. App reads today's plans from planStore
3. App writes plans to PLANNED_SESSIONS characteristic
4. Device stores plans locally
5. Device updates idle display with plan info
```

### Sessions Sync (Device → App)

```
1. App reads PENDING_SESSIONS characteristic
2. For each unsynced session:
   a. App creates Session via addSession()
   b. App links to plan if applicable
   c. App consumes hours from hour bank
3. App writes synced UUIDs to SYNC_ACKNOWLEDGMENT
4. Device marks those sessions as synced
```

### Hours Sync (App → Device)

```
1. After importing sessions, app calculates new total
2. App writes total seconds to TOTAL_HOURS_UPDATE
3. Device updates its cumulative display
```
