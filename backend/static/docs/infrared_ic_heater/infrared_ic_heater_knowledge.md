# Infrared IC Heater

## Overview

An **Infrared IC Heater** (also known as an Infrared Rework Station or IR Desoldering Station) is a specialized piece of electronic workshop equipment that uses focused infrared (IR) radiation to heat surface-mount integrated circuits (ICs) and other surface-mount technology (SMT) components on printed circuit boards (PCBs). Unlike conventional soldering irons, which use direct contact to transfer heat, the infrared heater transfers heat through electromagnetic radiation — allowing it to heat a component and its surrounding solder joints simultaneously and uniformly without touching the PCB.

In the engineering laboratory context, an infrared IC heater is primarily used for:
- **Desoldering** large SMD (Surface Mount Device) ICs such as BGA (Ball Grid Array), QFP (Quad Flat Package), and SOIC (Small Outline IC) packages without damaging the PCB or adjacent components
- **Soldering** replacement components onto a board
- **Rework** of PCBs where conventional soldering iron access is insufficient

This document is an educational reference for engineering students learning electronic rework skills. Actual temperature values and profiles should be validated against your specific equipment and the solder specifications used.

---

## Working Principle

### Infrared Radiation Heating
The infrared heater generates electromagnetic radiation in the infrared spectrum (wavelengths approximately 780 nm to 1 mm). When this radiation strikes a PCB or IC, it is absorbed by the materials and converted into heat. Darker surfaces and certain materials (like PCB substrates and solder masks) absorb IR radiation more readily than reflective surfaces.

Unlike hot air rework stations, which blow heated air over components:
- IR heating is **non-contact** and **directional**
- IR heating is generally more **uniform** across a large area
- IR heating is **less likely to blow small passive components** off the board

### Solder Reflow Principle
The infrared heater raises the temperature of solder joints above the solder's melting point (liquidus temperature). For standard lead-free solder (SAC305: Sn-Ag-Cu alloy), the liquidus temperature is approximately **217°C**. For older eutectic tin-lead (Sn63Pb37) solder, the melting point is approximately **183°C**. Once molten, the component can be lifted from the board or a replacement component can be pressed into position.

### Temperature Profile (Reflow Curve)
Professional rework follows a controlled temperature profile to prevent thermal shock:

1. **Preheat Phase**: Gradually raise board temperature to 100–150°C over ~60–90 seconds. This evaporates moisture, activates flux, and reduces thermal shock.
2. **Soak Phase**: Hold temperature at 140–180°C for 60–90 seconds to equalize temperature across the component and board.
3. **Reflow Phase**: Rapidly raise temperature above liquidus (e.g., 217°C for lead-free) for 30–60 seconds. Solder melts and flows.
4. **Cooling Phase**: Allow temperature to drop naturally or with gentle air. Rapid quenching causes solder joint cracking.

---

## Main Components

| Component | Description |
|---|---|
| **Upper IR Heater (Top Heater)** | Focused IR lamp or ceramic IR emitter directed at the top of the target IC. Provides localized reflow heat. |
| **Lower IR Heater (Bottom Heater / Preheater)** | Large IR panel beneath the PCB that preheats the entire board uniformly, reducing thermal stress. |
| **Temperature Controller** | PID (Proportional-Integral-Derivative) controller that maintains accurate temperature profiles. |
| **Thermocouple / IR Sensor** | Measures temperature at or near the component for feedback control. |
| **PCB Holder / Fixture** | Adjustable clamp or support rack that holds the PCB securely during rework. |
| **Vacuum Pickup Pen** | A small vacuum pump with a pen-like tool used to lift the IC after solder melts. |
| **Timer / Profile Controller** | Allows programming of multi-stage temperature profiles (preheat → soak → reflow → cool). |
| **Power Control / Intensity Knob** | Adjusts IR power output (often 0–100% or in wattage steps). |
| **Cooling Fan (optional)** | Some stations include a fan for controlled post-reflow cooling. |
| **Digital Display** | Shows current temperature, set temperature, and timer. |

---

## Inputs and Outputs

### Inputs
- **Mains AC Power**: Typically 220–240V AC (assume standard laboratory mains supply).
- **PCB with Target Component**: The circuit board on which the IC is to be removed or reflowed.
- **Flux**: Liquid or gel flux applied to solder joints before heating to improve wetting and flow.
- **Replacement IC** (for rework operations): The new component to be placed after removal.
- **Operator Settings**: Target temperatures, timing for each phase, IR power level.

### Outputs
- **Heated PCB / Component**: The board and target IC raised to reflow temperature.
- **Removed IC** (desoldering): The lifted component, potentially reusable if undamaged.
- **Reflowed Solder Joints** (soldering): New component attached with solid, shiny solder joints.
- **Heat**: Radiated and convected into the surrounding environment.

---

## Operating Procedure

1. **Inspect the PCB**: Examine the board for moisture, damaged traces, or adjacent heat-sensitive components. Remove batteries, plastic covers, and electrolytic capacitors near the work area if they cannot withstand reflow temperatures.
2. **Apply Flux**: Apply no-clean flux gel or liquid flux to the solder joints of the target IC. This improves solder flow and prevents oxidation.
3. **Set Up the PCB**: Secure the PCB on the fixture/holder with the target IC centered under the upper IR heater.
4. **Set Temperature Profile**: Program or manually set the preheat, soak, and reflow temperatures on the controller. For lead-free solder, a typical peak temperature is 240–250°C at the board surface (above the 217°C liquidus by a safety margin).
5. **Lower the Upper Heater**: Bring the upper IR head to the appropriate height above the target IC (typically 2–5 cm, depending on the unit and IC size).
6. **Enable the Lower Preheater**: Turn on the bottom heater first to preheat the board gradually.
7. **Begin the Reflow Cycle**: Start the temperature profile or timer. Monitor the temperature display and observe solder joints.
8. **Watch for Solder Melt**: Observe the solder joints (using magnification if available). When solder melts (joints go glossy and may shift slightly), the solder is liquid.
9. **Lift the Component (Desoldering)**: Use the vacuum pickup pen to gently lift the IC straight up from the board. Do not wiggle or tilt — this can damage solder pads.
10. **Place Replacement Component (Rework)**: Align the new IC over the pads while solder is still liquid, or place it and apply a second reflow cycle.
11. **Begin Cooling**: Reduce heater power and allow the board to cool. Do not blow cold air directly on the joint while solder is molten.
12. **Inspect Solder Joints**: After cooling, use a magnifying glass or microscope to inspect joint quality. Good joints are smooth, shiny, and concave. Dull, grainy, or balled joints indicate a cold solder joint.
13. **Clean the PCB**: Use isopropyl alcohol (IPA) and a brush to remove flux residue.
14. **Test the Board**: Power up the board and functionally test the reworked area.

---

## Safety Guidelines

- **High Temperatures**: The IR heater and the PCB reach temperatures of 200–300°C. Never touch the heater element, the PCB, or the IC with bare hands during or immediately after operation.
- **Eye Protection**: IR radiation is invisible and can damage eyes. Do not stare directly at the IR heater element. Use appropriate IR-blocking safety glasses if required by your lab.
- **Fume Extraction**: Heated flux, solder, and PCB substrates release harmful fumes. Always operate the infrared heater under a fume extractor or in a well-ventilated space.
- **Lead Warning**: If working with tin-lead (Sn-Pb) solder, observe lead safety precautions: wear nitrile gloves, wash hands after use, do not eat/drink near the workstation.
- **Fire Hazard**: PCBs with flammable coatings or conformal coat can ignite if over-heated. Keep a fire extinguisher accessible.
- **Capacitor Explosion Risk**: Electrolytic capacitors near the heated area may vent or explode if taken above their rated temperature. Remove or shield them before heating.
- **Hot Surfaces**: The PCB holder, fixture clamps, and surrounding area will be hot after operation. Allow adequate cooling time before handling.
- **Do Not Leave Unattended**: Never leave the IR heater running unattended, especially during a reflow cycle.
- **Proper Grounding**: Ensure the machine is grounded to prevent static damage to sensitive ICs being reworked.

---

## Skills Required

- Basic understanding of PCB construction and SMD component types
- Familiarity with soldering and desoldering fundamentals
- Ability to identify component package types (BGA, QFP, SOIC, QFN, etc.)
- Understanding of solder alloy properties (melting points, lead-free vs. leaded)
- Safe handling of hot surfaces and chemical flux
- Steady hands and attention to detail for component placement

---

## Skills Learned

- Controlled thermal profiling for electronic rework
- Non-contact, area-based soldering technique
- Component identification and package-type recognition
- Solder joint quality inspection (visual criteria for good vs. cold joints)
- Flux chemistry and application techniques
- PCB rework and repair — a critical industry skill
- Understanding of solder reflow curves and their importance
- Introduction to BGA rework (one of the most advanced soldering skills)

---

## Typical Applications

- Removing burnt or failed ICs from expensive PCBs for board-level repair
- Replacing microcontrollers, FPGAs, or processors in prototype boards
- Desoldering and recovering ICs from scrap PCBs for reuse in student projects
- Reflowing BGA packages that have developed cold joints (common in laptops)
- Prototype board assembly using SMD components where oven reflow is unavailable
- Repair of industrial control boards and embedded systems in lab settings
- Teaching SMD soldering and rework skills in electronics engineering courses

---

## Common Student Projects

1. **Laptop GPU/CPU Reballing**: Reball and reflow a BGA processor or GPU recovered from a failed laptop, learning the complete BGA rework workflow.
2. **Microcontroller Transplant**: Remove a programmed microcontroller from a reference board and install it onto a custom PCB design.
3. **Scrap Board IC Harvesting**: Systematically remove useful ICs (voltage regulators, microcontrollers, drivers) from scrap PCBs for reuse in student projects.
4. **Cold Solder Joint Repair**: Take a board with deliberately introduced cold joints and practice identifying and reflowing them back to specification.
5. **SMD Soldering Practice Board**: Use the IR heater to practice placing and reflowing a variety of SMD components (resistors, capacitors, SOICs) on a practice board.
6. **PCB Rework Documentation Project**: Document the complete rework procedure for a specific IC (with photos at each stage) as a technical manual.
7. **Thermal Profile Optimization**: Experiment with different temperature profiles and evaluate solder joint quality under a microscope to find the optimal profile.
8. **Conformal Coat Rework**: Practice removing conformal coating from a specific area, reworking the component, and reapplying coating.
9. **QFP Package Replacement**: Remove and replace a QFP (Quad Flat Package) IC on a motor driver board after simulating a failure.
10. **Heat Damage Study**: Intentionally exceed recommended temperatures on scrap boards and document the types of damage (delamination, pad lift, component cracking) under a microscope.

---

## Common Mistakes

- **Insufficient Preheating**: Applying reflow heat too quickly causes thermal shock — cracking capacitors, delaminating PCB layers, or shattering components.
- **Overheating**: Exceeding 260°C for lead-free (or 240°C for leaded) for too long damages PCB substrates, melts plastic connectors, and destroys sensitive components.
- **Not Using Flux**: Attempting to rework without flux leads to solder balling, poor wetting, and bridges.
- **Lifting Pads**: Trying to remove a component before solder is fully liquid, or pulling at an angle — the solder pads can tear off the PCB.
- **Misaligning Replacement IC**: Placing the new IC misaligned on BGA or QFP pads — leads to bridges or open joints after reflow.
- **Forgetting to Remove Electrolytic Capacitors**: Heat-sensitive electrolytics near the work zone will bulge, vent, or explode.
- **Ignoring Fume Extraction**: Flux fumes are harmful; operating without extraction in an enclosed lab is a health hazard.
- **Not Allowing Cooling**: Moving or testing the board while solder is still liquid causes disturbed solder joints.
- **Using Wrong Flux Type**: Using water-soluble flux without cleaning leaves residue that causes corrosion over time.

---

## Maintenance Basics

- **Clean the IR Heater Element**: Dust and flux vapor can deposit on the IR emitter. Clean gently with a dry cloth when cool and unplugged.
- **Calibrate the Thermocouple**: Use a calibrated reference thermometer or thermocouple on a test board to verify displayed temperatures are accurate.
- **Inspect Vacuum Pickup Pen**: Check vacuum tip for blockages; clean with a fine wire or replace tips periodically.
- **Check PCB Holder Clamps**: Ensure clamp springs and adjustment screws move freely and hold the PCB securely.
- **Inspect Power Cable**: Check for damaged insulation, especially near the heater head where heat stress is highest.
- **Replace Worn IR Lamps**: Quartz IR lamps have a finite lifespan. If heating becomes uneven or power output drops, the lamp may need replacement.

---

## Troubleshooting Guide

| Problem | Possible Cause | Suggested Action |
|---|---|---|
| Solder not melting at expected time | Temperature too low; thermocouple not near joint; cold board | Increase top heater temperature; ensure preheater is on; move thermocouple closer |
| PCB pads lifting | Component lifted before fully liquid; angle applied; old/damaged PCB | Wait until all solder fully liquid; lift straight up; avoid old, brittle boards |
| Component slips out of alignment during reflow | No alignment aid; component misplaced | Use flux as adhesive before reflow; use a stencil for placement; add solder paste |
| Solder balling around IC | Insufficient flux; too-rapid heating | Apply more flux gel; slow down preheat ramp rate |
| Adjacent components displaced | Too wide IR beam; excessive temperature; small passives not protected | Shield adjacent components with aluminum foil; reduce IR power; use focused nozzle |
| Burn smell or smoke from board | Overheating; flammable conformal coat; organic flux burning | Reduce temperature; check profile; ensure correct flux type; stop and inspect |
| Vacuum pickup not holding | Vacuum tip blocked; pump weak; worn tip | Clean or replace tip; check pump suction; replace tip |
| Temperature reading unstable | Thermocouple loose or damaged; EMI interference | Reattach thermocouple; replace if damaged; check grounding |
| IR element not heating | Element burned out; fuse blown; power supply failure | Replace IR lamp; check and replace fuse; test power supply output |
| Cold solder joints after rework | Peak temperature too low; too short at reflow; poor flux | Reflow again with correct profile; add flux; verify temperature calibration |

---

## Frequently Asked Questions

**Q1: What is the difference between an infrared heater and a hot air rework station?**
A: A hot air station blows heated air through a nozzle to melt solder; it is fast and precise for small areas but can blow small passive components off the board. An IR heater uses radiated infrared energy — it heats without airflow, making it better for large ICs (BGA, QFP) and sensitive boards where component displacement is a risk.

**Q2: What types of ICs can be reworked with an infrared heater?**
A: IR heaters are suitable for BGA (Ball Grid Array), QFP (Quad Flat Package), SOIC (Small Outline IC), QFN (Quad Flat No-lead), PLCC, and other SMD packages. Through-hole components are not typically reworked with an IR heater.

**Q3: What is a BGA package, and why is it difficult to rework?**
A: A BGA has hundreds of solder balls on the underside of the IC in a grid pattern, making direct visual inspection and conventional soldering impossible. X-ray inspection is needed to verify BGA joints after rework. An IR heater (or controlled reflow oven) is the standard method for BGA rework.

**Q4: What is flux, and why is it necessary for rework?**
A: Flux is a chemical agent (typically rosin-based or no-clean formula) that removes metal oxides from solder and component leads, reduces surface tension of molten solder, and promotes proper wetting. Without flux, solder does not flow or wet properly, resulting in poor or failed joints.

**Q5: What is the difference between lead-free and leaded solder, and how does it affect IR rework?**
A: Leaded solder (Sn63Pb37) melts at ~183°C; lead-free (SAC305) melts at ~217°C. Lead-free requires higher peak temperatures during rework, which demands more precise control to avoid board damage. Lead-free is now mandatory in most consumer electronics (RoHS directive), but leaded solder is still used in some aerospace and military applications.

**Q6: How do I know when solder has melted during desoldering?**
A: Watch the solder joints under a magnifying glass. Molten solder appears glossy and may shift slightly as surface tension changes. At the correct temperature, gently testing the vacuum pickup pen against the IC will confirm it lifts freely.

**Q7: What causes solder balling, and how is it prevented?**
A: Solder balls are small spheres of solder that separate from joints during reflow. They are caused by excessive flux gassing (too-rapid heating), poor flux quality, or contamination. Prevention: use adequate flux, slow preheat ramp, and ensure pads are clean.

**Q8: Can I use an infrared heater to solder components (not just desolder)?**
A: Yes. For placing new SMD components, apply solder paste (solder + flux in paste form) to the pads using a stencil or syringe, place the component, then reflow with the IR heater. This is effectively a manual reflow soldering process.

**Q9: What is "tombstoning," and what causes it during reflow?**
A: Tombstoning is when a small SMD component (like a 0402 resistor) stands up vertically on one pad during reflow. It is caused by uneven heating — one end reflows and its surface tension pulls the component upright before the other end melts. Uniform heating (such as proper preheating) minimizes tombstoning.

**Q10: What safety hazard does incorrect flux residue pose after rework?**
A: Water-soluble flux residue, if not cleaned, absorbs moisture and becomes conductive over time, causing dendritic growth (metal filament growth between conductors) that leads to short circuits. No-clean flux leaves a less harmful residue but can still cause issues in high-impedance circuits. Always clean the board appropriately for the flux type used.

**Q11: What is "delamination," and how does the IR heater cause it?**
A: Delamination is the separation of internal PCB layers, caused by rapid thermal expansion of trapped moisture or resin within the board. It appears as bubbles or visible separation under the surface. Preventing it requires slow preheating to drive out moisture before reaching high temperatures.

**Q12: How do I protect adjacent components during IR rework?**
A: Shield heat-sensitive components adjacent to the work area using aluminum foil (which reflects IR radiation). Some practitioners also use Kapton tape. Plastic connectors, electrolytic capacitors, and battery holders should always be shielded or removed before rework.

**Q13: What is the typical lifespan of an IR heater element?**
A: Quartz IR lamp elements typically last several hundred to a few thousand hours of use, depending on operating temperature and duty cycle. Ceramic IR emitters tend to have longer lifespans. Signs of lamp failure: reduced heating power, uneven heating, or visible darkening of the quartz envelope.

**Q14: Why must I allow the board to cool slowly after reflow?**
A: Rapid cooling (quenching) causes thermal shock, which can crack solder joints (especially with lead-free solder, which is less ductile). Slow, controlled cooling allows solder to solidify gradually with a strong crystalline structure. The ideal cooling rate is approximately 2–4°C/second.

**Q15: Is it possible to reuse an IC removed by an IR heater?**
A: Sometimes yes, sometimes no. If the IC was removed carefully at the correct temperature and not mechanically stressed, it may be functional. However, repeated thermal cycling degrades semiconductor junctions. For BGA ICs, the solder balls may need to be reballed before reuse. Testing after removal is always necessary.

**Q16: What is reballing?**
A: Reballing is the process of removing old, deformed solder balls from a BGA IC and attaching new solder balls using a stencil and solder paste. This is done when reusing BGA ICs removed from boards, or when old solder balls are oxidized or damaged.

**Q17: What is the role of the bottom preheater?**
A: The bottom preheater raises the entire board temperature uniformly to a preheat level (100–150°C) before the top heater activates. This reduces the temperature differential between the target area and the rest of the board, preventing thermal stress, warping, and delamination.

---

## Related Machines

- **Soldering Iron / Soldering Station**: For through-hole components and fine SMD rework where IR access is impractical.
- **Hot Air Rework Station**: Alternative to IR for small SMD component rework; uses directed hot air instead of IR radiation.
- **Digital Multimeter**: For testing continuity and voltage on reworked boards post-reflow.
- **Digital Microscope / USB Microscope**: Essential for inspecting SMD solder joints after rework.
- **Coil Winding Machine**: Related in that both involve controlled thermal processes and precision component handling in an electronics workshop.
- **Battery Charger**: For recharging and testing boards with battery-backed systems after rework.

---

## Learning Path

### Beginner
- Study SMD component types and package designations (SOIC, QFP, BGA, 0402, etc.)
- Learn solder alloy properties and the reflow curve concept
- Practice applying solder paste with a syringe and stencil
- Use the IR heater to reflow simple SOIC packages on practice boards

### Intermediate
- Practice desoldering and replacing QFP packages on scrap boards
- Study flux chemistry: rosin, no-clean, water-soluble — differences and applications
- Perform post-rework inspection with a magnifying glass or USB microscope
- Experiment with temperature profiles: compare results at different peak temperatures

### Advanced
- Perform BGA rework: desoldering, reballing, and replacement on real boards
- Use X-ray inspection to verify BGA joint quality (if available)
- Design and document a complete rework process for a specific high-value PCB
- Study IPC-7711/7721 (rework and repair of electronic assemblies standard)
- Explore conformal coating removal and reapplication procedures

---

## Keywords

infrared IC heater, IR rework station, SMD rework, surface mount technology, BGA rework, QFP desoldering, solder reflow, reflow profile, lead-free solder, SAC305, tin-lead solder, flux, no-clean flux, solder paste, solder balling, tombstoning, delamination, PCB rework, component desoldering, vacuum pickup, preheater, thermocouple, PID controller, temperature profile, preheat soak reflow cool, infrared radiation, non-contact heating, reballing, solder joint inspection, cold solder joint, pad lifting, conformal coating, IPC-7711, IPC-7721, RoHS, lead-free transition, fume extraction, thermal shock, solder liquidus, solder melting point, reflow oven, hot air rework, electronics repair, PCB repair, engineering lab, SMT assembly
