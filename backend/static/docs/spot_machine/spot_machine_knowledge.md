# Spot Machine (Resistance Spot Welder)

## Overview

The Resistance Spot Welder (commonly called a "spot machine" or "spot welder") is an electrical welding machine that joins two or more overlapping metal sheets by passing a high-amperage electrical current through the contact point between them. Unlike conventional fusion welding, no filler metal, flux, or shielding gas is required — the heat is generated entirely by the electrical resistance at the faying surfaces of the workpieces. The result is a small, discrete nugget of solidified metal that bonds the sheets together, replicating the manufacturing process used extensively in the automotive, aerospace, and sheet-metal fabrication industries.

In a mechanical engineering laboratory, the resistance spot welder is a cornerstone machine for sheet-metal joining exercises, prototype chassis fabrication, and manufacturing process education. Students gain direct experience with the physics of Joule heating, material metallurgy (nugget formation, heat-affected zone), joint design principles, and quality inspection techniques such as peel testing and cross-section examination. These skills are directly applicable to engineering roles in automotive body shops, HVAC duct fabrication, and electronic enclosure manufacturing.

Modern lab spot welders range from bench-mounted pneumatic press types to handheld portable units (scissor or gun-type). The bench press variant is most common in educational settings, offering precise electrode force control, adjustable weld time, and a foot-pedal trigger that keeps both hands free to position and steady the workpiece. The machine produces a weld in milliseconds to seconds, and the entire joining cycle — squeeze, weld, hold — is automated by the weld timer/controller, making repeatability straightforward once parameters are established.

## Working Principle

Resistance spot welding is governed by **Joule's law of heating**: Q = I² × R × t, where Q is heat generated, I is welding current (typically 5,000–15,000 A), R is the electrical resistance at the weld interface, and t is weld time. The high current is delivered at low voltage (typically 2–12 V at the electrodes) from a step-down transformer, making the process safe in terms of voltage while providing enormous current density at the small electrode contact area.

The process follows three sequential phases: **Squeeze phase** — the upper electrode descends under pneumatic or spring pressure, clamping the workpiece stack between both electrodes and establishing firm metal-to-metal contact, which lowers interface resistance and pre-heats the contact zone. **Weld phase** — the weld timer triggers the main contactor, sending current through the electrodes and workpiece stack. Resistance is highest at the faying surface (the interface between the two sheets) because surface oxides and micro-asperities limit the contact area. Joule heating concentrates here, creating a molten metal nugget that grows outward from the interface centre. **Hold phase** — current ceases but electrode pressure is maintained, confining and forging the cooling nugget under pressure to produce a dense, void-free weld. The electrodes then retract and the cycle is complete.

Electrode material is critical: **copper-chromium-zirconium (CuCrZr)** alloy electrodes are standard, offering high electrical conductivity to minimise electrode heating, combined with hardness and high-temperature strength to maintain contact geometry under repeated clamping loads. Water cooling (internal electrode passages) removes heat to extend electrode life and prevent workpiece surface overheating.

## Main Components

| Component | Function |
|---|---|
| Step-Down Transformer | Converts mains voltage (230/400 V) to low welding voltage (2–12 V) at very high current (5,000–15,000 A) |
| Primary Contactor / SCR Switch | High-current switch (mechanical or SCR-based) that controls the duration of current flow during the weld phase |
| Weld Timer / Controller | Electronic control unit that programs and executes the squeeze, weld, and hold time sequence |
| Upper Electrode (Movable) | Water-cooled copper-alloy electrode tip that descends to clamp and carry current through the workpiece |
| Lower Electrode (Fixed) | Stationary electrode that supports the workpiece and completes the current circuit |
| Electrode Arms (Secondary Circuit) | Low-resistance copper bus bars or arms that carry welding current from the transformer to the electrodes |
| Pneumatic / Spring Actuator | Provides controlled, consistent electrode clamping force; pneumatic systems allow force adjustment via air pressure |
| Foot Pedal / Trigger | Initiates the weld cycle; foot pedal keeps both hands free to position the workpiece |
| Water Cooling Circuit | Circulates cooling water through the electrodes and transformer to remove heat and maintain component temperatures |
| Frame / C-Frame | Rigid structural frame that maintains electrode alignment and absorbs the reaction force of electrode clamping |

## Inputs and Outputs

### Inputs
- **Electrical power** — Single-phase 230 V or three-phase 400 V AC, 50 Hz; high apparent power (10–100 kVA depending on model)
- **Workpiece material** — Low-carbon steel sheet, galvanised steel, stainless steel, or aluminium (with appropriate settings)
- **Weld parameters** — Squeeze time, weld time (heat cycles), hold time, and electrode force (pressure)
- **Cooling water** — Clean mains water or recirculating chiller supply for electrode and transformer cooling
- **Electrode tips** — Selected for workpiece material and geometry (flat, dome, or truncated cone profiles)

### Outputs
- **Resistance spot weld nugget** — Discrete fusion bond between the overlapping sheets; diameter typically 4–10 mm
- **Heat-affected zone (HAZ)** — Region of base metal altered by welding heat; exhibits changed microstructure and properties
- **Electrode indentation** — Slight surface impression on both sides of the workpiece at the weld point from electrode pressure
- **Spatter (occasional)** — Molten metal expulsion at the weld interface if current or force settings are incorrect
- **Waste heat** — Heat dissipated to the electrodes, transformer, and workpiece surroundings

## Operating Procedure

1. **Pre-operation checks** — Confirm cooling water supply is connected and flowing, verify power supply is correct, and inspect electrodes for wear, pitting, or misalignment.
2. **Dress the electrodes** — Use an electrode tip dresser to restore the correct contact face geometry if the tips are pitted or mushroomed from previous use.
3. **Set weld parameters** — Programme the controller with the appropriate squeeze time, weld time (heat time), and hold time for the material type and thickness combination. Refer to the parameter chart posted on the machine.
4. **Set electrode force** — Adjust the pneumatic pressure regulator or spring-load setting to achieve the correct electrode force for the sheet thickness (typically 1–4 kN for 0.5–2 mm steel).
5. **Prepare the workpieces** — Clean the weld area of oil, paint, heavy oxide scale, and galvanic coatings using a wire brush or abrasive pad. Overlapping surfaces must be flat and in firm contact.
6. **Position the workpieces between the electrodes** — Insert the overlapping sheets between the upper and lower electrodes, positioning the weld location at the electrode centreline with the required edge margin (minimum 1.5× nugget diameter from the sheet edge).
7. **Perform a test weld on scrap** — Weld two scrap pieces of the same material and thickness, then perform a peel test (bend one sheet back to 90° and pry) to verify nugget size and penetration before welding the actual part.
8. **Initiate the weld cycle** — Hold the workpiece steady and depress the foot pedal. The machine will automatically execute the squeeze–weld–hold sequence.
9. **Release the foot pedal and remove the workpiece** — Wait for the hold phase to complete (indicated by electrode retraction or cycle completion light) before removing the workpiece.
10. **Allow the weld area to cool before handling** — The weld nugget and surrounding metal are extremely hot immediately after welding; allow 10–20 seconds before touching.
11. **Inspect the weld** — Check for consistent electrode indentation depth, surface appearance (no gross spatter or surface cracking), and correct nugget placement.
12. **Repeat for all weld spots** — Maintain minimum pitch between adjacent welds (typically ≥15 mm center-to-center) to avoid shunting (current bypass through previous weld).
13. **Power down and isolate** — Turn off the machine, close the cooling water supply, and ensure electrodes are in the open (retracted) position before leaving.

## Safety Rules

1. **Never touch both electrodes simultaneously** — Even at low voltage, very high current through the body is lethal. The secondary circuit carries thousands of amperes.
2. **Wear safety glasses or a full face shield** — Weld spatter, arc flash during electrode contact, and scale ejection are all hazards at the weld point.
3. **Wear appropriate PPE** — Heat-resistant leather gloves, a leather or flame-resistant apron, and closed-toe leather shoes are mandatory for spot welding operation.
4. **Ensure cooling water is flowing before starting** — Operating without adequate cooling rapidly overheats electrodes and the transformer, causing premature failure or fire risk.
5. **Do not weld galvanised (zinc-coated) steel without adequate ventilation** — Zinc vaporises at weld temperatures, producing toxic zinc oxide fumes. Use forced ventilation or a fume extraction system.
6. **Do not weld near flammable materials or pressurised containers** — Weld spatter can travel several centimetres and ignite combustibles.
7. **Inspect the secondary circuit connections before operation** — Loose electrode arm connections cause localised arcing and overheating at contact points; tighten any loose connections before energising.
8. **Never place fingers or hands near the electrode gap when the machine is armed** — The electrodes descend with forces of 1–4 kN; crushing injuries occur instantly.
9. **Do not weld material thicker than the machine's rated capacity** — Attempting to weld beyond the rated capacity overloads the transformer and may cause insulation breakdown.
10. **Keep the work area dry** — Water on the floor or workpiece surface combined with high-current equipment creates electrocution risk. Ensure no water leaks from the cooling circuit onto the work area.
11. **Do not operate the machine alone** — A second person should be present to summon help in case of electrical accident or fire.
12. **Never modify or bypass the weld timer controls** — The timer prevents electrode overheating and excessive heat input; bypassing it can cause workpiece burning or transformer failure.

## Specifications

| Parameter | Value |
|---|---|
| Input power supply | 230 V AC single-phase / 400 V three-phase, 50 Hz |
| Rated input power | 10–25 kVA (lab bench model) |
| Secondary (weld) voltage range | 2–12 V |
| Maximum weld current | 8,000–15,000 A |
| Electrode force range | 0.5–5 kN (pneumatic) |
| Maximum single sheet thickness (mild steel) | 2 mm per sheet (stack of 2) |
| Maximum throat depth | 200–400 mm (model dependent) |
| Weld time range | 1–99 cycles (0.02–2 s at 50 Hz) |
| Electrode tip diameter | 5–8 mm (flat or dome profile) |
| Cooling water requirement | ~2–5 L/min at 3 bar |
| Machine mass | ~80–200 kg |

## Common Applications

- Joining overlapping mild steel sheets in sheet-metal prototype chassis and enclosure fabrication
- Teaching resistance welding fundamentals and weld parameter optimisation in manufacturing courses
- Fabricating automotive-style body panel assemblies in vehicle design projects
- Joining galvanised steel duct sections in HVAC system prototyping
- Producing battery tab spot welds in energy storage device projects (with appropriate small-format machine)
- Joining stainless steel sheet components for food-safe enclosure and equipment prototypes
- Demonstrating HAZ microstructural analysis — students section and etch weld nuggets to study fusion zone metallurgy

## Maintenance

- **After each use:** Dress the electrode tips with the tip dresser to restore contact geometry. Wipe spatter and scale from the electrode arms and platen.
- **Daily:** Confirm cooling water flow at both the supply and return lines before starting and after shutdown.
- **Weekly:** Inspect the secondary circuit bus bars and electrode arm clamps for overheating discolouration, loose connections, or arcing marks.
- **Weekly:** Check pneumatic hoses and fittings for leaks; confirm the pressure regulator holds the set pressure accurately.
- **Monthly:** Inspect the primary electrical connections, contactor contacts, and SCR module for signs of pitting, overheating, or corrosion.
- **Monthly:** Replace electrode tips when the contact face diameter grows more than 20% beyond the original due to mushrooming; worn electrodes produce undersized, weak nuggets.
- **Monthly:** Flush the cooling water circuit and check for scale buildup; treat or replace water according to the manufacturer's specification.
- **Annually:** Have the transformer insulation resistance and weld timer calibration checked by a qualified electrician or service engineer.

## Frequently Asked Questions

**Q: Why are my spot welds leaving deep, sunken pits instead of smooth indentations?**
A: This indicates excessive electrode force, weld current, or weld time, or a combination of all three. The weld nugget is expelling molten metal (expulsion/spatter) and over-penetrating the sheet. Reduce weld time and current, and verify electrode force is within the correct range for the material thickness.

**Q: My welds keep failing the peel test — the nugget pulls out of only one sheet. What is wrong?**
A: This usually means current density is insufficient, often because the electrode tips are worn (mushroomed) and the contact area is too large, spreading current over a wider zone. Dress the electrode tips first, then increase weld current or time incrementally until peel tests show a full nugget button.

**Q: How do I know the minimum number of weld spots needed for a joint?**
A: The number and spacing of welds depends on the expected load on the joint and the sheet thickness. A common starting formula for shear-loaded joints is: number of welds = (joint load) ÷ (nugget shear strength × safety factor). Consult the AWS D1.3 structural sheet steel welding standard or your lab's design guidelines.

**Q: Can this machine weld aluminium?**
A: Resistance spot welding of aluminium is significantly more difficult than steel because aluminium has much higher electrical and thermal conductivity, requiring very high current (3–5× that for steel) and very fast weld times. Lab bench machines are typically rated for steel and may not deliver sufficient current for aluminium. Check the machine's specification sheet and use a model specifically rated for aluminium if required.

**Q: Is cooling water always needed?**
A: Yes, for any sustained production welding. The cooling water removes Joule heat from the electrodes and transformer continuously; without it, electrode tips overheat, mushroom rapidly, and the transformer winding insulation can be permanently damaged within a few minutes of operation at full current.

## Related Machines

- **MIG / MAG Welder** — Fusion welding process using filler wire; suitable for thicker materials and complex joints where spot welding is impractical
- **TIG Welder** — High-precision fusion welding for stainless steel, aluminium, and critical structural joints
- **Sheet Metal Shear (Guillotine)** — Used to cut workpiece blanks to size before spot welding assembly
- **Sheet Metal Folding Machine (Pan Brake)** — Used to form sheet-metal edges and flanges that are subsequently spot-welded
- **Bench Grinder / Angle Grinder** — Used to remove weld spatter and prepare joint surfaces before and after welding
- **Hot Air Gun** — Alternative thermal joining tool for thermoplastic sheets; complements the spot welder in a mixed-materials lab
