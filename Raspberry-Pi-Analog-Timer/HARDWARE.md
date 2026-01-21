# Hardware Guide

Complete parts list, wiring diagrams, and assembly instructions for the meditation timer.

## Parts List

| Component             | Specific Model     | Purpose                 | Est. Cost | Where to Buy       |
| --------------------- | ------------------ | ----------------------- | --------- | ------------------ |
| Raspberry Pi Zero 2 W | Official           | Main board, BLE         | $15       | Adafruit, Pimoroni |
| MicroSD Card          | 32GB Class 10      | OS and storage          | $8        | Amazon             |
| 3.5" LCD Display      | Waveshare 3.5" IPS | Main display            | $25       | Amazon, Waveshare  |
| Rotary Encoder x2     | KY-040             | Volume/brightness knobs | $4 each   | Amazon             |
| Arcade Button         | 30mm dome          | Start/stop              | $3        | Adafruit           |
| Speaker               | 3W 4ohm mini       | Chime sounds            | $5        | Adafruit           |
| Amplifier             | MAX98357A I2S      | Audio output            | $6        | Adafruit           |
| USB-C Breakout        | Panel mount        | Clean power input       | $3        | Amazon             |
| Jumper Wires          | Various            | Connections             | $5        | Amazon             |
| **Total**             |                    |                         | **~$75**  |                    |

## GPIO Pin Assignments

```
Pi Zero 2 W GPIO Layout:

Button (Start/Stop):
  - Signal: GPIO17 (Pin 11)
  - Ground: Pin 9

Volume Encoder:
  - CLK: GPIO27 (Pin 13)
  - DT: GPIO22 (Pin 15)
  - SW: GPIO23 (Pin 16)
  - VCC: 3.3V (Pin 1)
  - GND: Pin 6

Brightness Encoder:
  - CLK: GPIO24 (Pin 18)
  - DT: GPIO25 (Pin 22)
  - SW: GPIO5 (Pin 29)
  - VCC: 3.3V (Pin 17)
  - GND: Pin 20

Display (SPI):
  - Standard SPI pins
  - Backlight PWM: GPIO18 (Pin 12)

Audio (I2S):
  - BCLK: GPIO18 (shared with backlight, use PWM chip)
  - LRCLK: GPIO19 (Pin 35)
  - DIN: GPIO21 (Pin 40)
```

## Wiring Diagram

```
                    Raspberry Pi Zero 2 W
                    ┌─────────────────────┐
                    │  3V3 (1) │ (2) 5V   │
                    │  SDA (3) │ (4) 5V   │
                    │  SCL (5) │ (6) GND ←──── Vol Encoder GND
                    │ GPIO4(7) │ (8) TX   │
    Button GND ────→│  GND (9) │ (10) RX  │
    Button Signal ─→│ G17(11)  │ (12) G18 │←── Backlight PWM
    Vol CLK ───────→│ G27(13)  │ (14) GND │
    Vol DT ────────→│ G22(15)  │ (16) G23 │←── Vol SW
    Bright VCC ────→│ 3V3(17)  │ (18) G24 │←── Bright CLK
                    │ MOSI(19) │ (20) GND │←── Bright GND
                    │ MISO(21) │ (22) G25 │←── Bright DT
                    │ SCLK(23) │ (24) CE0 │
                    │  GND(25) │ (26) CE1 │
                    │ ID_SD(27)│ (28)ID_SC│
    Bright SW ─────→│  G5(29)  │ (30) GND │
                    │  G6(31)  │ (32) G12 │
                    │ G13(33)  │ (34) GND │
    Audio LRCLK ───→│ G19(35)  │ (36) G16 │
                    │ G26(37)  │ (38) G20 │
                    │  GND(39) │ (40) G21 │←── Audio DIN
                    └─────────────────────┘
```

## Assembly Instructions

### Phase 1: Initial Setup

1. **Flash the SD Card**
   - Download Raspberry Pi OS Lite (64-bit)
   - Use Raspberry Pi Imager to flash
   - Enable SSH and configure WiFi in advanced settings
   - Insert card into Pi

2. **Test Basic Boot**
   - Connect Pi to power via micro-USB
   - Wait 2-3 minutes for first boot
   - SSH into the Pi: `ssh pi@raspberrypi.local`

### Phase 2: Display Connection

1. **Connect the Waveshare 3.5" Display**
   - The display connects directly to the 40-pin GPIO header
   - Carefully align pins and press down firmly
   - Display should sit flush with the Pi

2. **Configure Display Driver**
   ```bash
   # SSH into Pi and run:
   git clone https://github.com/waveshare/LCD-show.git
   cd LCD-show
   chmod +x LCD35-show
   ./LCD35-show
   # Pi will reboot with display active
   ```

### Phase 3: Button Wiring

1. **Connect the Arcade Button**
   - Button has two terminals (NO - normally open)
   - One terminal → GPIO17 (Pin 11)
   - Other terminal → GND (Pin 9)
   - Use female-to-female jumper wires

2. **Test Button**

   ```python
   from gpiozero import Button
   from signal import pause

   button = Button(17)
   button.when_pressed = lambda: print("Pressed!")
   button.when_released = lambda: print("Released!")
   pause()
   ```

### Phase 4: Rotary Encoder Wiring

1. **Connect Volume Encoder**
   - CLK → GPIO27 (Pin 13)
   - DT → GPIO22 (Pin 15)
   - SW → GPIO23 (Pin 16)
   - VCC → 3.3V (Pin 1)
   - GND → GND (Pin 6)

2. **Connect Brightness Encoder**
   - CLK → GPIO24 (Pin 18)
   - DT → GPIO25 (Pin 22)
   - SW → GPIO5 (Pin 29)
   - VCC → 3.3V (Pin 17)
   - GND → GND (Pin 20)

3. **Test Encoders**

   ```python
   from gpiozero import RotaryEncoder

   volume = RotaryEncoder(27, 22)
   volume.when_rotated_clockwise = lambda: print("Vol +")
   volume.when_rotated_counter_clockwise = lambda: print("Vol -")
   ```

### Phase 5: Audio Setup

1. **Connect MAX98357A Amplifier**
   - LRCLK → GPIO19 (Pin 35)
   - BCLK → GPIO18 (Pin 12)
   - DIN → GPIO21 (Pin 40)
   - VIN → 5V (Pin 2)
   - GND → GND (Pin 39)

2. **Connect Speaker**
   - Speaker positive → Amplifier "+"
   - Speaker negative → Amplifier "-"

3. **Configure I2S Audio**

   ```bash
   # Add to /boot/config.txt:
   dtoverlay=hifiberry-dac

   # Reboot and test:
   speaker-test -c 2
   ```

## Assembly Notes

- **Use a breadboard first** - Test all connections before any permanent assembly
- **Hot glue for strain relief** - Secure wire connections after testing
- **Display ribbon cable is fragile** - Handle carefully, don't bend sharply
- **Consider JST connectors** - Makes components removable for enclosure work
- **Label your wires** - Use tape or wire labels during prototyping

## Troubleshooting

### Display Not Working

- Check all 40 pins are properly seated
- Verify display driver is installed
- Check `/boot/config.txt` for correct display settings

### Button Not Responding

- Verify GPIO17 connection
- Check ground connection
- Test with multimeter in continuity mode

### Encoder Skipping Steps

- Add 0.1µF capacitor between CLK/GND and DT/GND
- Check for loose connections
- Reduce polling rate in software

### No Audio

- Verify I2S overlay in config.txt
- Check amplifier power (needs 5V, not 3.3V)
- Test speaker separately with a battery
