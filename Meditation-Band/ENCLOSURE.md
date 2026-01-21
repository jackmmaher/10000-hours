# Enclosure Design

Module housing, strap attachment, and material options for the Meditation Band.

## Design Goals

1. **Comfortable on wrist** - Smooth edges, slim profile
2. **Natural in cupped hands** - Ergonomic shape when held
3. **Touch-friendly** - Sensors work through walls
4. **Water resistant** - Sealed for daily wear (IPX4 target)
5. **Easy to charge** - Magnetic alignment

## Module Housing

### Capsule Shape

```
Top view:
    ╭─────────────────────────────╮
    │                             │
    │          LED window         │
    │                             │
    ╰─────────────────────────────╯
           40mm x 15mm

Side view:
    ╭───────────────────────────────╮
    │                               │  8mm
    ╰───────────────────────────────╯

End view:
       ╭─────╮
      /       \
     │         │  15mm
      \       /
       ╰─────╯

Capsule shape rationale:
- No sharp corners to catch on clothing
- Comfortable resting in palm
- Visually softer than rectangle
- Classic, timeless form
```

### Internal Layout

```
Cross-section (side):
    ┌─────────────────────────────────────┐
    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← Top shell (1.5mm)
    │  [PCB + ESP32-C3]                   │
    │  ├──────────────────────────────┤   │ ← PCB (1.0mm)
    │  [Battery 100mAh]                   │
    │  [Motor] ●                          │ ← Coin motor
    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← Bottom shell (1.5mm)
    │  ◉ ◉  Pogo pads                     │
    └─────────────────────────────────────┘

Cross-section (end):
         ╭─────────────╮
        /░░░░░░░░░░░░░░░\
       │ ┌─────────────┐ │
       │ │   Battery   │ │
       │ │    Motor    │ │
       │ └─────────────┘ │
        \░░░░░░░░░░░░░░░/
         ╰─────────────╯
           Touch zone
```

### Touch Sensor Zones

```
Top view showing touch zones:

    ╭─────────────────────────────╮
    │█████│             │█████████│
    │█████│  LED window │█████████│
    │█████│             │█████████│
    ╰─────────────────────────────╯
    ↑ Left              Right ↑
      touch               touch
      zone                zone

- Touch zones on curved ends
- Capacitive sensing through 1.5mm shell
- User naturally squeezes the ends when holding
```

### LED Window

```
Detail of LED window:

    ┌──────────────────┐
    │      ╭───╮       │
    │      │ ● │       │  ← Frosted/diffused area
    │      ╰───╯       │     5mm diameter
    │                  │
    └──────────────────┘

Options:
1. Thin wall (~0.5mm) over LED - light bleeds through
2. Translucent insert (silicone or acrylic)
3. Frosted window inset
```

## Strap Attachment

### Spring Bar System

```
Standard 18mm watch spring bars:

    Module cross-section at attachment point:

         ═══════════════════════════════
        /    ┌─────────────────────┐    \
       │     │    Module body      │     │
        \    │                     │    /
         ═══ └─────────────────────┘ ═══
          ↑                           ↑
       Spring bar                Spring bar
       channel                   channel

    Channel detail:
        ┌───────┐
        │  ╭─╮  │  ← 1.5mm deep groove
        │  ╰─╯  │     2mm wide
        └───────┘

    Allows standard watch straps with 18mm width.
```

### Quick-Release Option

```
For easier strap swapping:

    Quick-release spring bar:

        ━━━━━━●━━━━━━━━━━●━━━━━━
             ↑           ↑
          Push here to release

    User can change straps without tools.
```

### Strap Attachment Dimensions

```
Module attachment points:

    ╭────╮─────────────────────────────╭────╮
    │    │                             │    │
    │ ○  │         Module              │  ○ │
    │    │                             │    │
    ╰────╯─────────────────────────────╰────╯
      ↑                                   ↑
    6mm lug                           6mm lug
    width                             width

    Total lug-to-lug: ~52mm
    (fits standard 18mm strap systems)
```

## Material Options

### Option 1: 3D Printed SLA Resin (Prototype)

**Recommended for initial prototypes.**

- Material: Standard or tough resin
- Finish: Matte black (post-process with sandblasting)
- Wall thickness: 1.5mm minimum
- Cost: $10-20 per print

**Process:**

1. Design in Fusion 360 / SolidWorks
2. Export STL
3. Print on Formlabs or similar SLA
4. Cure, sand, finish

**Limitations:**

- Less durable than production materials
- May yellow over time
- Not ideal for daily wear long-term

### Option 2: Injection Molded ABS/PC (Small Batch)

- Material: ABS or Polycarbonate blend
- Finish: Soft-touch coating available
- Wall thickness: 1.2mm minimum
- Cost: $30-50 per unit (with tooling amortized)
- MOQ: Usually 100+ units

**Suitable for:**

- Small production runs
- Durable daily wear
- Consistent quality

### Option 3: CNC Titanium (Premium)

**Recommended for final production.**

- Material: Grade 5 titanium (Ti-6Al-4V)
- Finish: Bead blasted, satin, or brushed
- Wall thickness: 1.0mm possible
- Cost: $80-150 per unit
- No MOQ (machined per-unit)

**Benefits:**

- Extremely durable
- Hypoallergenic
- Premium feel
- Lightweight for metal
- Develops subtle patina

**Challenges:**

- Higher cost
- Longer lead time
- Touch sensing needs careful design (metal case)

### Touch Sensing with Metal Case

For titanium/metal enclosures:

```
Option A: Exposed touch pads

    ╭─────────────────────────────╮
    │░░░░│             │░░░░░░░░░│  ← Metal body
    │    │  LED window │         │
    │░░░░│             │░░░░░░░░░│
    ╰─────────────────────────────╯
      ↑                    ↑
    Plastic/ceramic     Plastic/ceramic
    touch insert        touch insert

Option B: Capacitive through glass

    Use sapphire or glass inserts in metal body.
    Sensors detect through non-conductive material.
```

## Assembly

### Two-Piece Shell

```
Module assembly:

1. Bottom shell with pogo pads
2. PCB + battery assembly
3. Motor attached to bottom shell
4. Top shell snaps or screws on

    ┌─ Top shell ────────────────────┐
    │                                │
    │   ┌─ PCB ──────────────────┐   │
    │   │                        │   │
    │   │   ┌─ Battery ──────┐   │   │
    │   │   │                │   │   │
    │   │   └────────────────┘   │   │
    │   └────────────────────────┘   │
    │                                │
    └─ Bottom shell ─────────────────┘
```

### Sealing Options

**For IPX4 (splash resistant):**

- Gasket between shell halves
- Sealed pogo pad contacts
- No exposed openings

**For IPX7 (submersible):**

- Ultrasonic welding of shells
- Conformal coating on PCB
- Sealed LED window

## Charging Cradle

### Cradle Design

```
Side view:
                    ┌───────────┐
                   /│           │\
                  / │  Module   │ \
                 /  │   sits    │  \
    ────────────/   │   here    │   \────────────
    │                                            │
    │          ⬆ ⬆  Pogo pins                    │
    │                                            │
    │  USB-C ──●                                 │
    │                                            │
    └────────────────────────────────────────────┘

Top view:
    ╭─────────────────────────────────╮
    │                                 │
    │    ╭───────────────────────╮    │
    │    │                       │    │  ← Module depression
    │    │    ◉       ◉         │    │     Magnets align
    │    │   Pogo   Pogo        │    │
    │    ╰───────────────────────╯    │
    │                                 │
    ╰─────────────────────────────────╯
```

### Magnetic Alignment

```
Module bottom:           Cradle:
    ┌─────────┐          ┌─────────┐
    │  ◉   ◉  │          │  ◉   ◉  │
    │  N   S  │    →     │  S   N  │
    │  ◉   ◉  │          │  ◉   ◉  │
    │ Pogo Pads│         │Pogo Pins│
    └─────────┘          └─────────┘

- Two magnets for rotational alignment
- Module drops in, magnets snap it into place
- Pogo pins make contact automatically
```

### Cradle Materials

- 3D printed base (any material)
- Silicone or rubber insert (optional, for grip)
- Weighted base (optional, to prevent tipping)

## Hand-Held Ergonomics

### Cupped Hands Position

```
When held in meditation pose:

         ___________
        /   Band    \
       |   Module    |
       |     ●       |  ← LED visible if looking down
        \___________/     (but eyes are closed)

    Hands position:

         ╭─────────╮
        /  Module   \
       │  in palms   │
        \___________/
          ↑     ↑
       Left    Right
       palm    palm

    Thumbs touching above, fingers below.
    Module rests naturally in the hollow.
```

### Touch Zone Placement

```
When held, user's fingers naturally curl around ends:

    Side view of hand holding module:

        Thumb
          │
          │    ╭──────────────╮
          └────│   Module     │────── Fingers
               ╰──────────────╯
                    ↑
                Touch zones here
                (fingertip pressure)
```

The squeeze gesture uses finger pressure on the ends, which is natural when holding a small object.

## Design Files

### CAD Files (to be created)

```
/Meditation-Band/cad/
├── module-housing.step      # Complete module assembly
├── top-shell.step           # Top shell only
├── bottom-shell.step        # Bottom shell only
├── charging-cradle.step     # Cradle assembly
└── renders/
    ├── module-perspective.png
    ├── module-worn.png
    └── module-in-hands.png
```

### Print Files

```
/Meditation-Band/print/
├── top-shell.stl
├── bottom-shell.stl
├── cradle-base.stl
└── cradle-insert.stl
```

## Iteration Process

### Phase 1: Rough Prototype

- Basic shape, no internal features
- Test hand feel and wrist comfort
- Quick prints, don't worry about finish

### Phase 2: Functional Prototype

- Internal mounting for electronics
- Spring bar channels
- Pogo pad cutouts
- Test with breadboard electronics

### Phase 3: Refined Prototype

- Final dimensions
- LED window
- Touch zone optimization
- Proper wall thicknesses

### Phase 4: Production Candidate

- Manufacturing-ready design
- Tolerances for chosen material
- Assembly instructions
- Quality control points

## Specifications Summary

| Dimension               | Value                        |
| ----------------------- | ---------------------------- |
| Module length           | 40mm                         |
| Module width            | 15mm                         |
| Module height           | 8mm                          |
| Wall thickness          | 1.5mm (resin), 1.0mm (metal) |
| Spring bar width        | 18mm                         |
| Lug-to-lug              | ~52mm                        |
| LED window              | 5mm diameter                 |
| Touch zones             | 10mm x 15mm (each end)       |
| Weight (electronics)    | ~15g                         |
| Weight (resin shell)    | ~5g                          |
| Weight (titanium shell) | ~10g                         |
| Total weight            | 20-25g                       |
