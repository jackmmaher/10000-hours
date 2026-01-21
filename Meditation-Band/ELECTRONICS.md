# Electronics Design

ESP32-C3 wiring, power management, PCB layout, and charging system for the Meditation Band.

## System Architecture

```
                    ┌─────────────────────────────────────┐
                    │           ESP32-C3 (XIAO)           │
                    │                                     │
    ┌─────────┐     │  GPIO2 ──────────────── Touch L    │
    │ Battery │─────│  GPIO3 ──────────────── Touch R    │
    │ 100mAh  │     │  GPIO4 ──────────────── LED Data   │
    └─────────┘     │  GPIO5 ──────────────── Motor      │
         │          │                                     │
    ┌────┴────┐     │  3V3 ────────────────── VCC rails  │
    │ Charger │     │  GND ────────────────── GND rails  │
    └─────────┘     └─────────────────────────────────────┘
         │
    ┌────┴────┐
    │  Pogo   │
    │  Pins   │
    └─────────┘
```

## Pin Assignment

| GPIO   | Function      | Notes                     |
| ------ | ------------- | ------------------------- |
| GPIO2  | Touch Left    | TTP223 output             |
| GPIO3  | Touch Right   | TTP223 output             |
| GPIO4  | LED Data      | WS2812B data in           |
| GPIO5  | Motor Control | Via MOSFET                |
| GPIO21 | I2C SDA       | Reserved (future sensors) |
| GPIO22 | I2C SCL       | Reserved (future sensors) |

## Wiring Diagram

### Touch Sensors (TTP223)

```
                TTP223 Module (x2)
                ┌─────────────┐
    3V3 ────────│ VCC         │
                │         OUT │──────── GPIO2 (Left) or GPIO3 (Right)
    GND ────────│ GND         │
                └─────────────┘
                     │
              Touch Pad (connects to module)
              (copper pad on PCB or conductive fabric)
```

**Notes:**

- TTP223 has adjustable sensitivity (onboard resistor)
- Active HIGH output when touched
- Can sense through 2-3mm of plastic
- Both sensors must be active to trigger gesture

### LED (WS2812B Mini)

```
                WS2812B (3535)
                ┌───────────┐
    3V3 ────────│ VCC   DIN │──────── GPIO4
                │       DOUT│──────── NC (only 1 LED)
    GND ────────│ GND       │
                └───────────┘
```

**Notes:**

- 3.3V operation works but LED is dimmer (fine for this use)
- No level shifter needed for single LED at close distance
- Add 300-500 ohm series resistor on data line for reliability
- 100nF decoupling cap close to VCC/GND

### Vibration Motor

```
                          ┌─────────┐
    GPIO5 ───┬───[10K]────│ G       │
             │            │   2N7000│
             └────────────│ S     D │────┬───── Motor (+)
                          └─────────┘    │
                                         │
    3V3 ──────────────────[Flyback]──────┤
                          [Diode  ]──────┘
                                         │
                                    Motor (-)
                                         │
    GND ─────────────────────────────────┘
```

**Notes:**

- 2N7000 N-channel MOSFET for motor switching
- 10K gate resistor limits current
- 1N4148 flyback diode across motor terminals
- Motor draws ~60mA, MOSFET can handle 200mA+

### Power System

```
                 TP4056 Charging Module
    Pogo+ ──────┬──────────────────────────────────┐
                │     ┌─────────────────┐          │
                └─────│ IN+         B+  │──────────┼──── Battery (+)
                      │                 │          │
    Pogo- ────────────│ IN-         B-  │─────┬────┼──── Battery (-)
                      │             OUT+│─────│────┘
                      │             OUT-│─────┴────────── System GND
                      └─────────────────┘
                                │
                          System 3.3V (from ESP32 LDO or separate regulator)
```

**XIAO ESP32-C3 has onboard:**

- Battery charging circuit (connect battery to BAT pads)
- 3.3V regulator
- USB-C for development/charging

For final design, the XIAO's battery management can be used directly.

## Power Budget

### Current Draw by State

| State                         | Current | Duration       | Notes              |
| ----------------------------- | ------- | -------------- | ------------------ |
| Deep sleep                    | 5µA     | Most of time   | ESP32-C3 sleep     |
| Light sleep + BLE advertising | 10-50µA | Worn, idle     | Varies by interval |
| Active (LED breathing)        | 5-15mA  | During session | LED + processing   |
| Motor pulse                   | 60mA    | 100-300ms      | Brief bursts       |
| Peak (motor + LED)            | 80mA    | Rare           | Simultaneous       |

### Battery Life Calculation

**Typical day scenario:**

- 22 hours worn idle (BLE advertising): 50µA average = 1.1mAh
- 2 hours meditation (LED breathing): 10mA average = 20mAh
- 5 motor pulses: 60mA × 0.3s × 5 = 0.025mAh

**Daily consumption:** ~21mAh

**With 100mAh battery:** ~4-5 days typical use

**With 150mAh battery:** ~6-7 days typical use

## PCB Design

### Board Dimensions

```
Target: 35mm x 12mm (fits in 40mm module with margin)

    ┌─────────────────────────────────┐
    │ ○                           ○   │  12mm
    │   [ESP32-C3 module area]        │
    │ ○                           ○   │
    └─────────────────────────────────┘
              35mm

Layer stackup:
- 2-layer board (top + bottom)
- 1oz copper
- 0.8mm thickness (for flexibility in tight space)
```

### Component Placement

```
Top view:
    ┌─────────────────────────────────┐
    │ [Touch]  [ESP32-C3]  [Touch]    │
    │  Left                  Right    │
    │         [LED]                   │
    └─────────────────────────────────┘

Bottom view:
    ┌─────────────────────────────────┐
    │                                 │
    │       [Vibration Motor]         │
    │    [Battery connector]          │
    │       [Pogo pads]               │
    └─────────────────────────────────┘
```

### Touch Sensor Pads

```
Instead of TTP223 modules, use raw copper pads + TTP223-BA2 ICs:

    ┌─────────────────────────────────┐
    │                                 │
    │ ┌───┐                   ┌───┐   │
    │ │ T │      Module       │ T │   │
    │ │ P │                   │ P │   │
    │ └───┘                   └───┘   │
    │  20x10mm pad          20x10mm   │
    └─────────────────────────────────┘

- Pads extend to module edges
- Sense through enclosure walls
- Adjust sensitivity with capacitor value
```

## Charging System

### Magnetic Pogo Pin Interface

```
Module bottom:
    ┌─────────────────────────────────┐
    │                                 │
    │        ◉ V+     ◉ GND          │  Pogo pad contacts
    │                                 │
    └─────────────────────────────────┘

Cradle top:
    ┌─────────────────────────────────┐
    │                                 │
    │        ⬆ V+     ⬆ GND          │  Spring-loaded pogo pins
    │        (magnet alignment)       │
    └─────────────────────────────────┘
```

### Charging Cradle Circuit

```
    USB-C ────┬──────────────────────── Pogo V+ ────── Module
              │
         ┌────┴────┐
         │ TP4056  │ (optional, if module has no charger)
         │ or just │
         │  direct │
         └────┬────┘
              │
    GND ──────┴──────────────────────── Pogo GND ──── Module
```

**If using XIAO ESP32-C3:**
The XIAO has built-in battery charging via USB-C. The cradle can simply provide 5V to the XIAO's USB pads (or dedicated BAT+ pad).

### Charging Indicator

Option A: **LED on cradle** (simpler)

- Green when charging complete
- Red when charging

Option B: **Module LED shows state** (cleaner)

- Module detects charging via voltage
- Shows subtle glow while charging
- Can be off when charged

## Prototype Wiring (Breadboard)

For initial development without custom PCB:

```
XIAO ESP32-C3
     ┌───────────────┐
     │ [USB-C]       │
     │               │
 3V3 │ ●           ● │ 5V
 GND │ ●           ● │ GND
 D0  │ ●           ● │ D10
 D1  │ ●           ● │ D9
 D2  │ ●───────────────────► Touch L (TTP223 OUT)
 D3  │ ●───────────────────► Touch R (TTP223 OUT)
 D4  │ ●───────────────────► LED Data (WS2812B DIN)
 D5  │ ●───────────────────► Motor (via MOSFET)
 D6  │ ●           ● │ D8
 D7  │ ●           ● │ BAT+
     └───────────────┘

Breadboard connections:
- TTP223 x2: VCC→3V3, GND→GND, OUT→D2/D3
- WS2812B: VCC→3V3, GND→GND, DIN→D4 (with 330Ω series)
- Motor: Via 2N7000, G→D5 (with 10K), D→Motor+, S→GND
- 100mAh LiPo: Connect to XIAO BAT+ and GND pads
```

## Firmware Considerations

### Wake Sources

ESP32-C3 can wake from deep sleep via:

- **GPIO** - Touch sensors trigger wake
- **Timer** - Periodic wake for BLE advertising
- **BLE** - Wake on connection (if advertising in sleep)

Recommended: Timer wake every 1-2 seconds for BLE, GPIO wake for touch.

### Power Optimization

```cpp
// Before deep sleep
esp_wifi_stop();  // Disable WiFi
esp_bt_controller_disable();  // Disable BT if not advertising

// Configure wake source
esp_sleep_enable_gpio_wakeup();
esp_sleep_enable_timer_wakeup(1000000);  // 1 second

// Enter deep sleep
esp_deep_sleep_start();
```

### Touch Debouncing

```cpp
// Both sensors must be held for gesture
bool detectSqueeze() {
  bool leftPressed = digitalRead(TOUCH_LEFT) == HIGH;
  bool rightPressed = digitalRead(TOUCH_RIGHT) == HIGH;

  if (leftPressed && rightPressed) {
    delay(50);  // Debounce
    // Recheck
    return digitalRead(TOUCH_LEFT) && digitalRead(TOUCH_RIGHT);
  }
  return false;
}
```

## ESD Protection

For production:

- TVS diodes on touch sensor lines
- ESD protection on pogo pin contacts
- Keep touch traces short and shielded

## Design Files

When PCB is designed:

- KiCad project files in `/Meditation-Band/pcb/`
- Gerber files for manufacturing
- BOM with exact part numbers
- Assembly diagram

## Testing Points

Add test pads for:

- Battery voltage measurement
- Touch sensor outputs
- Motor drive signal
- LED data verification
- Programming/debug (UART TX/RX)
