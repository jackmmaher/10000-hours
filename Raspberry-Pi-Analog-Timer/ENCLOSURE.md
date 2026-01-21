# Enclosure Design

Physical housing design for the meditation timer device.

## Design Requirements

- **Slanted face**: 30-45 degree angle for floor viewing
- **Stable on flat surfaces**: Works on desk and floor
- **Access to USB-C power port**: Clean cable management
- **Knobs accessible**: On sides or front
- **Button prominent**: Satisfying tactile press
- **Adequate ventilation**: Passive cooling for Pi

## Conceptual Design

### Side View

```
         ________
        /        \
       /  SCREEN  \
      /____________\
     |              |
     |   (Pi/etc)   |
     |______________|
        ↑
       Base (weighted for stability)
```

### Front View

```
     ________________
    |                |
    |    26h 45m     |
    |                |
    |  [START BTN]   |
    |________________|
   ◯                  ◯
  VOL               BRIGHT
```

### Dimensions

- **Width**: ~120mm (to accommodate 3.5" display)
- **Height**: ~100mm (at tallest point)
- **Depth**: ~80mm (base depth for stability)
- **Display angle**: 35 degrees from horizontal

## Material Options

### 1. 3D Printed (PLA/PETG)

**Pros:**

- Custom fit, iterate quickly
- Affordable ($10-20 in materials)
- Full control over design
- Easy to add internal mounting features

**Cons:**

- May look "homemade"
- Less durable than machined options
- Layer lines visible without post-processing

**Recommended for:** Prototyping, personal use

**Services:**

- Local library makerspaces
- Shapeways
- JLCPCB 3D printing

### 2. Laser-cut Wood

**Pros:**

- Warm aesthetic, meditation-appropriate
- Natural material feel
- Precise tolerances
- Can look very professional

**Cons:**

- Requires design for flat-pack assembly
- Limited to certain geometries
- Assembly required

**Recommended for:** Final version with craft aesthetic

**Services:**

- Ponoko
- Local makerspaces
- SendCutSend

### 3. CNC Aluminum

**Pros:**

- Premium feel
- Excellent durability
- Professional appearance
- Good thermal properties

**Cons:**

- Expensive ($100-300)
- Longer lead time
- Requires experienced design

**Recommended for:** Production quality device

**Services:**

- Xometry
- Fictiv
- PCBWay CNC

## Recommended Approach

1. **Start with 3D printed prototype** to validate fit and ergonomics
2. **Iterate 2-3 times** until satisfied with design
3. **Decide final material** based on intended use
4. **Either keep the print** or commission wood/metal version

## 3D Printed Design

### Print Settings

```
Material: PETG (more durable than PLA)
Layer Height: 0.2mm
Infill: 20%
Supports: Yes (for angled face)
Print Orientation: Base down
```

### Design Files Structure

```
/enclosure/
├── meditation-timer-body.stl      # Main enclosure
├── meditation-timer-lid.stl       # Back panel/lid
├── button-surround.stl            # Decorative button ring
├── knob-volume.stl                # Volume knob
├── knob-brightness.stl            # Brightness knob
└── fusion360/
    └── meditation-timer.f3d       # Source file
```

### Key Design Features

1. **Display Mount**
   - Snap-fit or screw mount for 3.5" LCD
   - Bezel hides display edges
   - Slight recess prevents scratches

2. **Button Integration**
   - 30mm arcade button fits standard hole
   - Spring contact ensures good travel
   - Centered on front face

3. **Encoder Mounts**
   - Panel-mount holes for KY-040 modules
   - Or internal mount with shaft extension

4. **Pi Mount**
   - M2.5 standoffs for Pi Zero
   - Positioned for heat management
   - Access to SD card slot

5. **Cable Management**
   - USB-C port cutout in rear
   - Internal cable routing channels
   - Strain relief feature

6. **Ventilation**
   - Slots on bottom and rear
   - Convection cooling path

## Knob Selection

Authentic analog feel matters for the meditation experience.

### Recommended Knobs

**Machined Aluminum**

- Premium feel, good weight
- Knurled grip
- 6mm D-shaft hole
- ~$5-10 each
- Source: Adafruit, Amazon, eBay

**Soft-Touch Rubber**

- Comfortable, quiet rotation
- Good grip
- ~$3-5 each
- Source: Amazon, AliExpress

**Wooden Knobs**

- Matches meditation aesthetic
- Warm feel
- ~$5-15 each
- Source: Etsy, woodworking suppliers

### Avoid

- Cheap plastic knobs - undermines analog experience
- Overly large knobs - disproportionate to device
- Shiny chrome - too flashy for meditation context

## Button Selection

The main button should be:

- **Satisfying to press** - good tactile feedback
- **Quiet** - no loud click during meditation
- **Large enough** - easy to find without looking
- **Durable** - rated for many cycles

### Recommended

**30mm Dome Arcade Button**

- Classic satisfying feel
- Quiet microswitches available
- Many color options
- ~$3-5 each
- Source: Adafruit, Amazon

**Sanwa OBSF-30**

- Premium arcade quality
- Very quiet
- Excellent durability
- ~$10-15 each
- Source: Focus Attack, Paradise Arcade

## Assembly Instructions

### Components Checklist

- [ ] 3D printed enclosure body
- [ ] 3D printed lid/back
- [ ] 2x knobs
- [ ] 1x arcade button
- [ ] 4x M2.5 standoffs (for Pi)
- [ ] 4x M2.5 screws
- [ ] 4x M3 screws (for lid)
- [ ] USB-C panel mount connector

### Assembly Steps

1. **Prepare Enclosure**
   - Remove support material
   - Sand any rough edges
   - Test fit all components

2. **Install Pi**
   - Attach standoffs to enclosure
   - Mount Pi Zero with screws
   - Connect display ribbon cable

3. **Install Display**
   - Position LCD in bezel opening
   - Secure with clips or screws
   - Verify angle is comfortable

4. **Install Button**
   - Insert button from front
   - Secure with locking ring
   - Connect wires to GPIO

5. **Install Encoders**
   - Mount through panel holes
   - Attach knobs to shafts
   - Connect wires to GPIO

6. **Install USB-C**
   - Mount panel connector
   - Wire to Pi power pins
   - Test power delivery

7. **Final Assembly**
   - Route cables neatly
   - Attach back panel
   - Test all functions

## Floor vs Desk Use

The design should work in both positions:

### Floor Position (During Meditation)

- Meditator sits on floor, looks down
- 35° angle puts screen perpendicular to gaze
- Base provides stability on carpet/mat
- Button accessible without looking

### Desk Position (As Reminder)

- Sits on desk like small photo frame
- Screen visible from chair
- Shows cumulative hours as motivation
- Knobs accessible for adjustment

## Finishing Options

### For 3D Prints

1. **Basic**
   - Light sanding
   - Leave as printed

2. **Painted**
   - Sand, prime, paint
   - Use plastic-compatible paint
   - Matte finish recommended

3. **Coated**
   - XTC-3D epoxy coating
   - Fills layer lines
   - Smooth, professional finish

### For Wood

1. **Natural**
   - Sand to 220 grit
   - Apply clear oil or wax

2. **Stained**
   - Sand, apply stain
   - Clear coat to protect

## Weight Considerations

For stability, the base should be weighted:

- **Option 1**: Steel washers glued to base interior
- **Option 2**: Lead fishing weights in cavity
- **Option 3**: Concrete pour in base cavity
- **Target weight**: 200-400g total

## Future Iterations

Consider for v2:

- Wireless charging pad integration
- Ambient light sensor for auto-brightness
- Magnetic detachable base
- Battery for portability
- E-ink display variant for lower power
