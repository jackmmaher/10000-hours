# BLE GATT Sync Protocol Specification

Complete Bluetooth Low Energy GATT service definition for communication between the meditation timer device and the 10000 Hours app.

## Service Overview

The meditation timer device advertises a single custom GATT service containing all characteristics needed for bidirectional synchronization.

```
Service: Meditation Timer Service
UUID: 10000001-0000-1000-8000-00805f9b34fb
```

## Characteristics

### 1. Cumulative Hours

Stores the total meditation seconds as reported by the app (source of truth).

| Property    | Value                                  |
| ----------- | -------------------------------------- |
| UUID        | `10000002-0000-1000-8000-00805f9b34fb` |
| Properties  | Read                                   |
| Value Type  | uint32 (4 bytes, little-endian)        |
| Description | Total meditation seconds               |

**Read Response Format:**

```
Bytes 0-3: Total seconds (uint32, little-endian)
```

**Example:**

- 96300 seconds (26h 45m) = `0x7C 0x78 0x01 0x00`

---

### 2. Device Status

Current state of the timer state machine.

| Property    | Value                                  |
| ----------- | -------------------------------------- |
| UUID        | `10000003-0000-1000-8000-00805f9b34fb` |
| Properties  | Read, Notify                           |
| Value Type  | uint8 (1 byte)                         |
| Description | Current timer state                    |

**Status Values:**
| Value | State | Description |
|-------|-------|-------------|
| 0 | IDLE | Waiting for user, showing hours |
| 1 | PENDING | Button pressed, aligning breath |
| 2 | ACTIVE | Timer running |
| 3 | SETTLING | Session complete, showing result |

**Notify Behavior:**

- Device sends notification when state changes
- App can subscribe to monitor session activity

---

### 3. Pending Sessions

Sessions completed on device but not yet synced to app.

| Property    | Value                                  |
| ----------- | -------------------------------------- |
| UUID        | `10000004-0000-1000-8000-00805f9b34fb` |
| Properties  | Read                                   |
| Value Type  | UTF-8 JSON string                      |
| Max Size    | 512 bytes                              |
| Description | Array of unsynced sessions             |

**Read Response Format:**

```json
[
  {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "startTime": 1705672800000,
    "endTime": 1705674300000,
    "durationSeconds": 1500,
    "pose": null,
    "discipline": null
  }
]
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| uuid | string | Yes | Unique session identifier (UUIDv4) |
| startTime | number | Yes | Unix timestamp in milliseconds |
| endTime | number | Yes | Unix timestamp in milliseconds |
| durationSeconds | number | Yes | Session duration in seconds |
| pose | string | No | Meditation pose identifier |
| discipline | string | No | Practice discipline identifier |

---

### 4. Planned Sessions

Today's meditation plans, written by app.

| Property    | Value                                  |
| ----------- | -------------------------------------- |
| UUID        | `10000005-0000-1000-8000-00805f9b34fb` |
| Properties  | Write                                  |
| Value Type  | UTF-8 JSON string                      |
| Max Size    | 512 bytes                              |
| Description | Array of plans for today               |

**Write Request Format:**

```json
[
  {
    "date": 1705622400000,
    "plannedTime": "06:00",
    "duration": 25,
    "title": "Morning sit",
    "discipline": "vipassana",
    "enforceGoal": true
  }
]
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | number | Yes | Day start timestamp (midnight) in ms |
| plannedTime | string | No | Planned time "HH:MM" format |
| duration | number | No | Planned duration in minutes |
| title | string | No | Session title/label |
| discipline | string | No | Practice discipline identifier |
| enforceGoal | boolean | No | If true, timer enforces duration |

**Device Behavior:**

- Device stores plans in local SQLite
- Replaces any existing plans for the day
- Updates idle screen to show plan info

---

### 5. Sync Acknowledgment

App confirms which sessions have been successfully imported.

| Property    | Value                                  |
| ----------- | -------------------------------------- |
| UUID        | `10000006-0000-1000-8000-00805f9b34fb` |
| Properties  | Write                                  |
| Value Type  | UTF-8 JSON string                      |
| Max Size    | 512 bytes                              |
| Description | Array of synced session UUIDs          |

**Write Request Format:**

```json
["550e8400-e29b-41d4-a716-446655440000", "6ba7b810-9dad-11d1-80b4-00c04fd430c8"]
```

**Device Behavior:**

- Device marks listed sessions as `synced = true`
- Synced sessions no longer appear in pending sessions read

---

### 6. Total Hours Update

App sends authoritative total after syncing sessions.

| Property    | Value                                  |
| ----------- | -------------------------------------- |
| UUID        | `10000007-0000-1000-8000-00805f9b34fb` |
| Properties  | Write                                  |
| Value Type  | uint32 (4 bytes, little-endian)        |
| Description | Authoritative total seconds from app   |

**Write Request Format:**

```
Bytes 0-3: Total seconds (uint32, little-endian)
```

**Device Behavior:**

- Device stores as authoritative total
- Updates idle screen display
- Local sessions are additive to this baseline

---

## Sync Flow Diagrams

### Plans Sync (App → Device)

```
┌─────────┐                              ┌─────────┐
│   App   │                              │ Device  │
└────┬────┘                              └────┬────┘
     │                                        │
     │  ─────── Connect ───────────────────►  │
     │                                        │
     │  ─────── Discover Services ─────────►  │
     │                                        │
     │  ─────── Write PLANNED_SESSIONS ────►  │
     │          [{"date":..., ...}]           │
     │                                        │
     │  ◄─────── Write Response ────────────  │
     │                                        │
     │                              ┌─────────┴─────────┐
     │                              │ Store plans       │
     │                              │ Update display    │
     │                              └─────────┬─────────┘
```

### Sessions Sync (Device → App)

```
┌─────────┐                              ┌─────────┐
│   App   │                              │ Device  │
└────┬────┘                              └────┬────┘
     │                                        │
     │  ─────── Read PENDING_SESSIONS ─────►  │
     │                                        │
     │  ◄─────── [session1, session2] ──────  │
     │                                        │
┌────┴────────────────┐                       │
│ For each session:   │                       │
│ - Create in DB      │                       │
│ - Update hour bank  │                       │
└────┬────────────────┘                       │
     │                                        │
     │  ─────── Write SYNC_ACK ────────────►  │
     │          ["uuid1", "uuid2"]            │
     │                                        │
     │                              ┌─────────┴─────────┐
     │                              │ Mark as synced    │
     │                              └─────────┬─────────┘
     │                                        │
     │  ─────── Write TOTAL_HOURS_UPDATE ──►  │
     │          [total_seconds]               │
     │                                        │
     │                              ┌─────────┴─────────┐
     │                              │ Update display    │
     │                              └─────────┬─────────┘
```

### Full Sync Sequence

```
┌─────────┐                              ┌─────────┐
│   App   │                              │ Device  │
└────┬────┘                              └────┬────┘
     │                                        │
     │  ═══════ BLE Connection ════════════►  │
     │                                        │
     │  ═══════ PLANS SYNC ════════════════►  │
     │  (Write today's plans)                 │
     │                                        │
     │  ◄═══════ SESSIONS SYNC ═══════════════  │
     │  (Read pending, ack synced)            │
     │                                        │
     │  ═══════ HOURS SYNC ════════════════►  │
     │  (Write authoritative total)           │
     │                                        │
     │  ═══════ Disconnect ════════════════►  │
     │                                        │
```

## Error Handling

### Connection Errors

| Error              | Recovery                               |
| ------------------ | -------------------------------------- |
| Device not found   | Continue scanning, exponential backoff |
| Connection timeout | Retry after 5 seconds, max 3 attempts  |
| Connection dropped | Re-scan and reconnect                  |
| Service not found  | Device may need update, alert user     |

### Sync Errors

| Error            | Recovery                                   |
| ---------------- | ------------------------------------------ |
| Read fails       | Retry read, log error                      |
| Write fails      | Retry write, log error                     |
| JSON parse error | Skip malformed data, log                   |
| UUID collision   | Use app's version (app is source of truth) |

### Conflict Resolution

The app is always the source of truth:

1. **Session exists in both**: Keep app version
2. **Session only on device**: Import to app
3. **Session only in app**: No action needed (device doesn't store app sessions)
4. **Hour total mismatch**: App total overwrites device

## Security Considerations

### Pairing

- Device requires pairing on first connection
- Use "Just Works" pairing for simplicity
- Store bonding info to avoid re-pairing

### Data Privacy

- Session data includes only timestamps and duration
- No PII transmitted
- BLE range limits exposure (~10m)

### Encryption

- BLE 4.2+ provides encrypted connections after pairing
- Characteristics use no additional encryption

## Implementation Notes

### Device Side (Pi)

```python
# Using bleak/bluez for GATT server
from bleak import BleakGATTServiceCollection

# Create service with characteristics
service = BleakGATTServiceCollection()
service.add_service("10000001-...")
service.add_characteristic("10000002-...", read=True)
# ... etc
```

### App Side (React Native)

```typescript
// Using react-native-ble-plx
import { BleManager } from 'react-native-ble-plx'

const manager = new BleManager()
await manager.connectToDevice(deviceId)
await device.discoverAllServicesAndCharacteristics()

// Read
const char = await device.readCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID)

// Write
await device.writeCharacteristicWithResponseForService(
  SERVICE_UUID,
  CHARACTERISTIC_UUID,
  base64Value
)
```

## Testing

### Manual Testing

1. **Scan test**: App discovers device advertising service
2. **Connect test**: App connects and discovers characteristics
3. **Read test**: App reads cumulative hours
4. **Write test**: App writes plans, device displays them
5. **Notify test**: Device notifies on state change
6. **Full sync test**: Complete sync cycle works

### Automated Testing

Use BLE testing tools:

- **nRF Connect** (mobile): Manual GATT exploration
- **Wireshark** (with BLE sniffer): Packet analysis
- **bluetoothctl** (Linux): Command-line testing

## Versioning

Future protocol versions can be negotiated via a version characteristic:

```
Characteristic: Protocol Version (future)
UUID: 10000000-0000-1000-8000-00805f9b34fb
Properties: Read
Value: uint8 version number
```

Current implicit version: 1
