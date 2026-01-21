# Hardware Specification

Complete parts list, module design, and strap options for the Meditation Band.

## Module Design

The electronics are housed in a capsule-shaped module that attaches to interchangeable straps.

```
Module dimensions: ~40mm x 15mm x 8mm

    ┌─────────────────────────────┐
    │ ○  [PCB + Battery]  ○      │ 8mm thick
    │     [Motor] [LED]          │
    └─────────────────────────────┘
         ←───── 40mm ─────→

Side view:
    ┌─────────────────┐
    │  ○   [●]   ○    │  ← Touch zones on sides
    │     (LED)       │     Center LED breathes
    └─────────────────┘
```

- Capsule-shaped module (~40mm x 15mm x 8mm)
- Touch sensors on sides (squeeze to start/stop)
- Single LED in center (status)
- Vibration motor inside

## Bill of Materials

### Electronics

| Item                    | Model        | Purpose            | Qty | Unit | Total   |
| ----------------------- | ------------ | ------------------ | --- | ---- | ------- |
| XIAO ESP32-C3           | Seeed Studio | Brain + BLE        | 1   | $5   | $5      |
| LiPo Battery            | 100-150mAh   | Power              | 1   | $5   | $5      |
| Capacitive Touch        | TTP223       | Squeeze sensors    | 2   | $1   | $2      |
| LED                     | WS2812B Mini | Status light       | 1   | $1   | $1      |
| Vibration Motor         | 8mm coin     | Haptic feedback    | 1   | $2   | $2      |
| Magnetic Pogo Connector | 2-pin        | Charging contact   | 1   | $3   | $3      |
| Custom PCB              | 35x12mm      | Component mounting | 1   | $5   | $5      |
| **Subtotal**            |              |                    |     |      | **$23** |

### Enclosure (Prototype)

| Item                          | Qty | Unit | Total   |
| ----------------------------- | --- | ---- | ------- |
| SLA 3D print (module housing) | 1   | $15  | $15     |
| NATO nylon strap              | 1   | $10  | $10     |
| Magnetic clasp                | 1   | $5   | $5      |
| **Subtotal**                  |     |      | **$30** |

### Enclosure (Production)

| Item                 | Qty | Unit | Total    |
| -------------------- | --- | ---- | -------- |
| CNC titanium module  | 1   | $100 | $100     |
| Custom leather strap | 1   | $25  | $25      |
| Titanium clasp       | 1   | $20  | $20      |
| **Subtotal**         |     |      | **$145** |

### Charging Cradle

| Item            | Qty | Unit | Total   |
| --------------- | --- | ---- | ------- |
| 3D printed base | 1   | $5   | $5      |
| Pogo pins       | 2   | $2   | $4      |
| USB-C connector | 1   | $2   | $2      |
| **Subtotal**    |     |      | **$11** |

### Total Cost

- **Prototype:** ~$64
- **Production (titanium):** ~$179

## Component Details

### Seeed XIAO ESP32-C3

The heart of the device. Tiny (21x17.5mm) development board with:

- ESP32-C3 RISC-V single-core CPU
- Built-in BLE 5.0
- Ultra-low power deep sleep (~5µA)
- Native USB-C (for development)
- WiFi (not used, but available)
- 4MB flash for code + storage
- Operating voltage: 3.3V

**Why ESP32-C3 over nRF52:**

- Easier development (Arduino/PlatformIO)
- Better documentation
- More affordable
- Good enough power consumption for daily charging

### TTP223 Capacitive Touch

Simple capacitive touch sensor modules:

- Single-channel touch detection
- Active high output
- Low power standby
- Adjustable sensitivity via onboard resistor
- Can sense through thin enclosure walls

**Configuration:**

- Two sensors, one on each side of module
- Both must be touched simultaneously for gesture detection
- Prevents accidental triggers

### WS2812B Mini (3535 package)

Addressable RGB LED in tiny 3.5x3.5mm package:

- Single data line control
- Full RGB color mixing
- PWM brightness control
- 5V tolerant (runs on 3.3V with reduced brightness)

**Usage:**

- Breath animation during session (8s cycle)
- Steady glow on completion
- Brief flash on session start
- Can be disabled entirely for eyes-closed practice

### 8mm Coin Vibration Motor

Small pancake-style vibration motor:

- 8mm diameter, 2.7mm thick
- Operating voltage: 2.5-3.8V
- Start voltage: 2.3V
- Rated current: ~60mA
- Vibration strength felt clearly in palm

**Patterns:**

- Single short pulse: Session started
- Three medium pulses: Session complete
- Double quick pulse: Low battery warning

### 100-150mAh LiPo Battery

Small lithium polymer cell:

- 3.7V nominal
- Dimensions vary, target ~30x15x4mm
- JST-SH connector or direct solder
- Built-in protection circuit preferred

**Power Budget:**

- ESP32-C3 deep sleep: ~5µA
- Worn standby (BLE advertising): ~10µA average
- Active session: ~15mA average
- Expected life: 3-5 days between charges

### Magnetic Pogo Connector

Two-pin magnetic connector for charging:

- Spring-loaded pins for reliable contact
- Magnets for self-alignment
- Reverse polarity tolerant (charging circuit handles)
- No exposed USB port to seal

## Strap Options

### Option 1: NATO-Style Woven Nylon

**Recommended for prototype.**

- Breathable, soft
- Quick-release spring bars
- Many colors available
- Width: 18-20mm standard
- Cost: $5-15

Meditation-appropriate aesthetic. Easy to swap.

### Option 2: Silicone

- Waterproof, sporty
- Comfortable all-day wear
- Magnetic clasp can be integrated
- Width: 18-20mm
- Cost: $5-10

Good for active users.

### Option 3: Leather

- Premium feel
- Develops patina over time
- Requires care (no water)
- Width: 18-20mm
- Cost: $15-30

Premium option.

### Option 4: Titanium Links

- Ultimate premium
- Adds weight (grounding when held)
- Most watch-like appearance
- Width: 18-20mm
- Cost: $50-100

For those who want jewelry-quality finish.

## Module-to-Strap Attachment

```
Standard 18mm spring bar attachment:

    ┌─────────────────────┐
 ═══│        Module        │═══  ← Spring bars
    └─────────────────────┘

Cross-section:
         ─────────
        /         \
       │  Module   │
        \_________/
          ║     ║   ← Spring bar channels
       ───╨─────╨───  Strap
```

Standard watch spring bars allow:

- Quick strap changes
- Compatibility with standard 18mm straps
- Easy access for charging (remove strap if needed)

## Sourcing Guide

### Development Parts

| Part                | Source              | Link                 |
| ------------------- | ------------------- | -------------------- |
| XIAO ESP32-C3       | Seeed Studio        | seeedstudio.com      |
| TTP223 modules      | Amazon/AliExpress   | Search "TTP223"      |
| WS2812B Mini        | Adafruit/AliExpress | "WS2812B 3535"       |
| 8mm vibration motor | Amazon/AliExpress   | "8mm coin motor"     |
| 100mAh LiPo         | Adafruit/Sparkfun   | "100mah lipo"        |
| Pogo pins           | SparkFun/Digikey    | "spring loaded pogo" |

### Prototype Enclosure

| Part         | Source                               |
| ------------ | ------------------------------------ |
| SLA 3D print | Shapeways, JLCPCB, local makerspaces |
| NATO strap   | Amazon, watch strap retailers        |
| Spring bars  | Any watch repair supplier            |

### Production Parts

| Part          | Source                               |
| ------------- | ------------------------------------ |
| CNC titanium  | Xometry, Protolabs, Shapeways        |
| Leather strap | Etsy craftspeople, leather suppliers |
| Custom clasp  | Jewelry suppliers, Alibaba           |

## Size Reference

For comparison with common objects:

```
Module (40x15x8mm):

    ┌────────────────────────────────────┐
    │         Apple AirTag               │  31.9mm diameter
    └────────────────────────────────────┘

    ┌──────────────────────────────────────────────┐
    │              Meditation Band Module           │  40mm length
    └──────────────────────────────────────────────┘

    ┌────────────────────────────────────────────────────────────────┐
    │                     Apple Watch (44mm case)                    │
    └────────────────────────────────────────────────────────────────┘
```

The module is smaller than an Apple Watch case, comparable to a wide fitness tracker.
