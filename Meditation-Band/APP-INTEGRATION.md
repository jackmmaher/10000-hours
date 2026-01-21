# App Integration Guide

The Meditation Band uses the same BLE GATT protocol as the Raspberry Pi Screen Timer. This document covers band-specific considerations.

## Protocol Reference

The complete BLE protocol is documented in:

- [../Raspberry-Pi-Analog-Timer/APP-INTEGRATION.md](../Raspberry-Pi-Analog-Timer/APP-INTEGRATION.md)
- [../Raspberry-Pi-Analog-Timer/reference/sync-protocol.md](../Raspberry-Pi-Analog-Timer/reference/sync-protocol.md)

Both devices use the same GATT service, so the app code works identically.

## GATT Service (Same as Pi Timer)

**Service UUID:** `10000001-0000-1000-8000-00805f9b34fb`

| Characteristic      | UUID         | Properties   | Description                  |
| ------------------- | ------------ | ------------ | ---------------------------- |
| Cumulative Hours    | 10000002-... | Read         | Total seconds (uint32)       |
| Device Status       | 10000003-... | Read, Notify | Timer state (uint8)          |
| Pending Sessions    | 10000004-... | Read         | Unsynced sessions (JSON)     |
| Planned Sessions    | 10000005-... | Write        | Today's plans (JSON)         |
| Sync Acknowledgment | 10000006-... | Write        | Synced UUIDs (JSON)          |
| Total Hours Update  | 10000007-... | Write        | Authoritative total (uint32) |

## Device Status Values

| Value | State    | Pi Timer              | Band                       |
| ----- | -------- | --------------------- | -------------------------- |
| 0     | IDLE     | Showing hours display | LED off, worn on wrist     |
| 1     | PENDING  | Breath alignment      | Brief moment after squeeze |
| 2     | ACTIVE   | Timer running         | LED breathing, in hands    |
| 3     | SETTLING | Showing completion    | LED glowing, haptic done   |

## Band-Specific Behavior

### Device Name

The band advertises as:

```
Local Name: "Meditation Band"
```

vs. the Pi timer which advertises as:

```
Local Name: "Meditation Timer"
```

The app can differentiate device types by name if needed for UI purposes.

### Connection Patterns

**Band stays connected more often:**

The band is worn, so it's frequently in BLE range of the phone. Unlike the Pi timer (which may be on a desk far from the phone), the band maintains connection throughout the day.

```
Typical day:

6:00 AM  - Wake up, put on band
         - App auto-connects, syncs overnight sessions (if any)
         - Plans for today sync to band

7:00 AM  - Meditation session
         - Band disconnects (optional, saves power)
         - Session runs locally

7:30 AM  - Session ends
         - Band reconnects when app in foreground
         - Session syncs to app

...throughout day, band and phone stay loosely connected...

10:00 PM - Remove band, place on charger
         - Connection lost (expected)
```

### Sync Timing

**Immediate sync on session end:**

Unlike the Pi timer (which may batch sessions), the band should sync immediately when a session ends and the app is available.

```cpp
// Band firmware: after session ends
void onSessionComplete() {
  saveSessionToFlash();

  // If BLE connected, trigger sync
  if (bleConnected) {
    notifyDeviceStatus(SETTLING);
    // App will read pending sessions
  }
}
```

### Plan Sync for Reminders

The band uses planned sessions to trigger reminder pulses:

```json
// Written to band via PLANNED_SESSIONS characteristic
[
  {
    "date": 1705622400000,
    "plannedTime": "07:00",
    "duration": 25,
    "enforceGoal": true
  }
]
```

**Band behavior with plans:**

- Stores plan locally
- At planned time, pulses every 5 minutes until session started
- Uses duration for goal enforcement (three pulses at goal)
- Uses enforceGoal to determine if timer auto-stops

## App UI Considerations

### Connection Indicator

The app should show different states for band vs. screen timer:

```
┌─────────────────────────────────┐
│  ● Meditation Band              │  ← Band connected
│    Connected                    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  ○ Meditation Band              │  ← Band disconnected
│    Disconnected                 │     (normal when not worn)
└─────────────────────────────────┘
```

### Session Source

Sessions from the band show `source: "device"` like the Pi timer. The app can further differentiate by storing the device name:

```typescript
interface Session {
  id: string
  // ...
  source: 'app' | 'device'
  deviceName?: string // "Meditation Band" or "Meditation Timer"
}
```

### No Device Preview

Unlike the Pi timer (which has a screen to mirror), the band has no visual state to show. The app should:

- NOT show a device preview/mirror for bands
- Show simple connection status only
- Focus on session history from band

## Multiple Device Support

A user might have both a Pi timer and a band. The app should:

1. Scan for all devices advertising the meditation service
2. Allow pairing multiple devices
3. Sync with whichever device is available
4. Merge sessions from both devices

```typescript
interface DeviceStore {
  pairedDevices: MeditationDevice[] // Can be multiple
  connectedDevice: MeditationDevice | null // Currently connected
}
```

### Conflict Resolution

If same session UUID exists (shouldn't happen, UUIDs are unique):

- Keep the version with earlier startTime
- Log the conflict for debugging

## Firmware BLE Implementation

### ESP32-C3 BLE Setup

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Service and characteristic UUIDs (same as Pi)
#define SERVICE_UUID        "10000001-0000-1000-8000-00805f9b34fb"
#define CHAR_HOURS_UUID     "10000002-0000-1000-8000-00805f9b34fb"
#define CHAR_STATUS_UUID    "10000003-0000-1000-8000-00805f9b34fb"
#define CHAR_SESSIONS_UUID  "10000004-0000-1000-8000-00805f9b34fb"
#define CHAR_PLANS_UUID     "10000005-0000-1000-8000-00805f9b34fb"
#define CHAR_ACK_UUID       "10000006-0000-1000-8000-00805f9b34fb"
#define CHAR_TOTAL_UUID     "10000007-0000-1000-8000-00805f9b34fb"

BLEServer* pServer;
BLECharacteristic* pHoursChar;
BLECharacteristic* pStatusChar;
BLECharacteristic* pSessionsChar;
BLECharacteristic* pPlansChar;
BLECharacteristic* pAckChar;
BLECharacteristic* pTotalChar;

void setupBLE() {
  BLEDevice::init("Meditation Band");
  pServer = BLEDevice::createServer();

  BLEService* pService = pServer->createService(SERVICE_UUID);

  // Cumulative hours (read)
  pHoursChar = pService->createCharacteristic(
    CHAR_HOURS_UUID,
    BLECharacteristic::PROPERTY_READ
  );

  // Device status (read + notify)
  pStatusChar = pService->createCharacteristic(
    CHAR_STATUS_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pStatusChar->addDescriptor(new BLE2902());

  // Pending sessions (read)
  pSessionsChar = pService->createCharacteristic(
    CHAR_SESSIONS_UUID,
    BLECharacteristic::PROPERTY_READ
  );

  // Planned sessions (write)
  pPlansChar = pService->createCharacteristic(
    CHAR_PLANS_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pPlansChar->setCallbacks(new PlansCallback());

  // Sync acknowledgment (write)
  pAckChar = pService->createCharacteristic(
    CHAR_ACK_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pAckChar->setCallbacks(new AckCallback());

  // Total hours update (write)
  pTotalChar = pService->createCharacteristic(
    CHAR_TOTAL_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pTotalChar->setCallbacks(new TotalCallback());

  pService->start();

  // Start advertising
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->start();
}
```

### Characteristic Callbacks

```cpp
class PlansCallback : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pChar) {
    std::string value = pChar->getValue();
    // Parse JSON, store plans
    storePlans(value.c_str());
  }
};

class AckCallback : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pChar) {
    std::string value = pChar->getValue();
    // Parse JSON array of UUIDs, mark as synced
    markSessionsSynced(value.c_str());
  }
};

class TotalCallback : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pChar) {
    std::string value = pChar->getValue();
    if (value.length() >= 4) {
      uint32_t total = *(uint32_t*)value.data();
      storeTotalHours(total);
    }
  }
};
```

### Updating Characteristics

```cpp
void updateHoursCharacteristic() {
  uint32_t total = getTotalSeconds();
  pHoursChar->setValue((uint8_t*)&total, 4);
}

void updateStatusCharacteristic(uint8_t status) {
  pStatusChar->setValue(&status, 1);
  pStatusChar->notify();  // Push to connected clients
}

void updateSessionsCharacteristic() {
  String json = getPendingSessionsJSON();
  pSessionsChar->setValue(json.c_str());
}
```

## Testing

### With nRF Connect App

1. Scan for "Meditation Band"
2. Connect to device
3. Expand service `10000001-...`
4. Read characteristics to verify values
5. Write to characteristics to test sync

### Sync Flow Test

1. Create a session on band (squeeze to start/stop)
2. Open app, connect to band
3. Verify session appears in app
4. Verify session marked synced on band (re-read pending sessions = empty)
5. Check hours updated on band

## Error Handling

### Connection Lost During Sync

- Sessions remain in pending until acknowledged
- App should retry sync on next connection
- No data loss possible

### JSON Parse Errors

- Band logs error
- Ignores malformed data
- Continues operating normally

### Full Flash Storage

- Band stores max ~50 unsynced sessions
- If full, oldest unsynced session is overwritten
- Should never happen with regular syncing
