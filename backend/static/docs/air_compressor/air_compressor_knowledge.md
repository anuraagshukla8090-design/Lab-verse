# Air Compressor

## Overview

The Air Compressor is a mechanical device that converts electrical (or sometimes mechanical) energy into stored potential energy in the form of compressed air, held in a pressure vessel (receiver tank). The compressed air is then distributed through a piped or hose-connected system to power pneumatic tools, inflate tyres, operate spray equipment, and supply clean dry air for numerous laboratory and workshop applications. Air compressors are among the most universally used utility machines in any engineering workshop.

In an educational mechanical laboratory, the air compressor serves as the primary compressed-air utility supply for all pneumatic tools and workstations on the floor. Students interact with it not only as users of its output, but also as engineering students who study its working principles: thermodynamic compression cycles, pressure–volume relationships (Boyle's Law), volumetric efficiency, pressure regulation, and moisture management. Understanding the compressor's principles is directly relevant to thermodynamics, fluid mechanics, and machine design coursework.

Beyond utility supply, the air compressor is often studied in its own right as a machine — students may perform performance tests, plot pressure–volume diagrams, measure free air delivery (FAD), calculate motor efficiency, and compare single-stage with two-stage compression. These experiments connect classroom thermodynamics directly to a real working machine, providing a tangible and memorable learning experience across mechanical, aeronautical, and mechatronics engineering programs.

## Working Principle

A reciprocating piston air compressor operates on a positive-displacement principle. An electric motor drives a crankshaft through a belt-and-pulley or direct-drive arrangement. The crankshaft converts rotary motion into the reciprocating motion of one or more pistons within cylinders. On the downstroke (intake stroke), the piston moves down, creating a partial vacuum; atmospheric pressure forces air in through the inlet reed valve, which opens automatically. On the upstroke (compression stroke), the piston rises, compressing the trapped air. When the cylinder pressure exceeds the line pressure, the discharge reed valve opens and compressed air flows into the receiver tank.

The thermodynamic process follows a compression cycle approximating adiabatic behaviour in single-stage compressors (no cooling between stages). In two-stage compressors, the partially compressed air is passed through an intercooler before entering a second, smaller-bore cylinder for final compression, improving efficiency and reducing final delivery temperature. The compression process follows the polytropic relationship: PVⁿ = constant, where n is between 1 (isothermal, ideal) and 1.4 (adiabatic, theoretical maximum for diatomic air).

The receiver tank stores compressed air as a buffer, smoothing out pressure fluctuations from the intermittent piston action and providing a reserve volume for peak demand. A pressure switch monitors tank pressure and automatically starts and stops the motor to maintain pressure between preset cut-in (e.g., 6 bar) and cut-out (e.g., 8 bar) set points. A pressure relief valve provides a safety over-pressure protection mechanism.

## Main Components

| Component | Function |
|---|---|
| Electric Motor | Provides rotational driving energy; typically single-phase (small units) or three-phase induction motor |
| Crankshaft and Connecting Rod | Converts motor rotary motion into piston reciprocating motion |
| Piston and Cylinder | Compresses air through reduction of cylinder volume on upstroke |
| Reed Valves (Inlet and Discharge) | Automatic one-way valves that control air entry and exit from the compression cylinder |
| Receiver Tank (Air Vessel) | Stores compressed air, buffers pressure fluctuations, and allows moisture to settle |
| Pressure Switch | Automatically starts and stops the motor between cut-in and cut-out pressure set points |
| Safety Relief Valve | Opens automatically if tank pressure exceeds safe rated maximum (mandatory safety device) |
| Pressure Gauge | Displays current tank pressure and, on some units, line (outlet) pressure |
| Air Filter / Intake Filter | Removes dust and particles from incoming atmospheric air before compression |
| Drain Valve (Condensate Drain) | Allows removal of water condensate that collects in the receiver tank |

## Inputs and Outputs

### Inputs
- Electrical power (230 V single-phase or 415 V three-phase, depending on motor size)
- Atmospheric air (drawn in through the intake filter)
- Compressor oil (for lubricated piston and valve lubrication — oil-lubricated models)

### Outputs
- Compressed air (at 6–10 bar gauge pressure, distributed to the workshop pneumatic system)
- Heat (compression generates heat; dissipated through cylinder walls and aftercooler if fitted)
- Water condensate (moisture that condenses from compressed air and collects in the receiver tank)
- Noise (reciprocating compressors generate 75–90 dB(A); appropriate acoustic enclosure or ear protection required)

## Operating Procedure

1. **Pre-start inspection**: check oil level in the crankcase sight glass (oil-lubricated models) — top up with correct compressor oil if below minimum. Check belt tension if belt-driven.
2. **Inspect the receiver tank**: open the drain valve briefly to expel any water condensate from the previous session; close the drain valve securely.
3. **Check intake filter**: inspect the air filter element for clogging; clean or replace if visibly dirty.
4. **Confirm the pressure relief valve is functional**: briefly lift the ring on the relief valve (with the tank under pressure) to verify it opens and reseats. If it does not reseat, tag out and service.
5. **Verify all downstream pneumatic tools and hoses are disconnected or closed** before pressurising the system for the first time.
6. **Switch on the compressor**: turn the power switch to ON. The motor will start and compress air into the receiver tank. Monitor the pressure gauge for normal pressure rise.
7. **Allow the tank to reach operating pressure**: the pressure switch will automatically shut off the motor when the cut-out pressure (typically 8 bar) is reached.
8. **Connect the air distribution hose** to the outlet valve/regulator. Set the outlet regulator to the required tool working pressure (e.g., 6.2 bar for a pneumatic impact wrench, 90 psi / 6.2 bar is common).
9. **Connect and operate the pneumatic tool** as per its own operating procedure.
10. **Monitor tank pressure** during use: if the motor does not restart when pressure drops to the cut-in set point, investigate before continuing.
11. **On completion**: disconnect all tools and hoses. Switch off the compressor at the power switch.
12. **Bleed residual pressure** from the receiver tank using the drain valve or outlet valve (where local lab procedure requires this for overnight lockout). Some labs leave tanks pressurised between sessions — follow the applicable local procedure.
13. **Drain condensate**: open the drain valve fully to expel water. Leave it cracked open if the tank is being depressurised for storage.
14. **Log operating hours** if the machine has an hour meter, and record any unusual observations in the maintenance logbook.

## Safety Rules

1. **Never exceed the tank's rated maximum working pressure (MAWP)**: the MAWP is stamped on the tank nameplate. Ensure the pressure switch cut-out is set below this value and the relief valve is rated and calibrated correctly.
2. **Never bypass or tamper with the safety relief valve**: this is the last line of defence against catastrophic tank rupture; defeating it is illegal and extremely dangerous.
3. **Drain the receiver tank of condensate daily**: accumulated water causes internal corrosion that progressively weakens the tank wall. Tank rupture under pressure is a catastrophic failure mode.
4. **Do not direct compressed air at any person**: even at low pressure, compressed air injected under skin (air embolism) or into body orifices can be fatal. This is one of the most serious hazards associated with compressed air systems.
5. **Ensure all hose connections are secure before pressurising**: a whipping disconnected hose can cause severe injury. Use safety whip checks on all hose-to-tool connections.
6. **Wear hearing protection** when working near an operating reciprocating compressor: sound levels typically exceed 85 dB(A), the exposure action value.
7. **Do not operate a compressor in an enclosed space without ventilation**: the motor generates heat, and the compression process consumes oxygen; adequate airflow is required.
8. **Inspect the receiver tank annually**: have the vessel inspected for corrosion, pitting, and wall thickness by a qualified pressure vessel inspector. Keep inspection records.
9. **Lock out/tag out** the compressor and fully depressurise the system before performing any maintenance on the pressure circuit, valves, or fittings.
10. **Use only hose and fittings rated for the working pressure**: never use domestic garden hose or poorly rated fittings on compressed air circuits.

## Specifications

| Parameter | Value |
|---|---|
| Motor Power | 1.5–5.5 kW (typical lab reciprocating unit) |
| Maximum Tank Pressure (MAWP) | 10–16 bar (varies by model) |
| Typical Operating Pressure Range | 6–8 bar (cut-in/cut-out) |
| Receiver Tank Volume | 50–270 litres (lab models) |
| Free Air Delivery (FAD) | 150–600 L/min (depends on motor size and stages) |
| Number of Stages | 1 (single-stage) or 2 (two-stage for higher pressure) |
| Motor Speed | 960–1,450 RPM |
| Noise Level | 75–88 dB(A) at 1 metre |

## Common Applications

- Supply of compressed air to pneumatic tools: impact wrenches, ratchets, drills, and grinders
- Supply to the Pneumatic Workstation for circuit assembly and pneumatics coursework
- Powering the Benchtop Pneumatic Gun and Nail Gun
- Tyre inflation for lab vehicles and equipment
- Air supply to spray painting equipment and airbrush stations
- Blow-down cleaning of machine tools, swarf, and dust
- Supply to sandblasting cabinets for surface preparation
- Compressed air supply for thermodynamics performance experiments (FAD measurement, efficiency tests)

## Maintenance

- **Daily**: Drain condensate from the receiver tank; inspect intake filter for blockage.
- **Weekly**: Check oil level in crankcase (oil-lubricated units); inspect belt tension and condition (belt-driven units).
- **Monthly**: Clean or replace the intake filter element; test the relief valve by lifting the ring manually; check all hose connections for leaks using soapy water.
- **3-Monthly**: Change compressor oil (oil-lubricated units); inspect piston rings and valve reeds if the unit has accessible service panels.
- **Annually**: Commission a qualified inspection of the pressure vessel (receiver tank) in accordance with local pressure vessel regulations; check motor insulation resistance and terminal connections.
- **As needed**: Replace worn or damaged reed valves if the compressor starts but pressure builds slowly, or if it cycles excessively; replace drive belt if cracked or fraying.
- **Logbook**: Record every maintenance action, oil change, filter replacement, and inspection in the machine logbook with date and technician signature.

## Frequently Asked Questions

**Q: Why does the compressor motor keep cycling on and off very frequently?**
Rapid cycling (short on-off cycles) indicates one of two issues: a high demand that exceeds the compressor's FAD (free air delivery) — meaning the connected tools are consuming more air than the compressor can supply — or a leaking pressure switch, relief valve, or pipe fitting that is causing the tank to lose pressure faster than normal. Check all connections with soapy water and verify the total air demand of connected tools does not exceed the compressor's rated FAD.

**Q: Why is there water coming out of my pneumatic tool lines?**
Water in the air lines is caused by moisture in the atmospheric air condensing when compressed air cools downstream of the compressor. This is normal but must be managed: drain the tank daily, install an inline moisture separator/water trap at the outlet, and consider an aftercooler or refrigerated air dryer for applications sensitive to moisture (paint spraying, precision pneumatics). Oil-contaminated air indicates worn piston rings or overfilled oil — service the compressor.

**Q: How do I know when to change the compressor oil?**
Oil-lubricated reciprocating compressors typically require an oil change every 500–1,000 operating hours or every 3 months, whichever comes first. Check the oil at every session — if it appears milky (water contamination), black (overheating and degradation), or gritty (debris), change it immediately regardless of hours. Always use oil specified for air compressors; never use automotive engine oil.

**Q: What is FAD and why is it important?**
FAD (Free Air Delivery) is the volume of air, measured at atmospheric conditions, that the compressor delivers per minute. It is the true measure of a compressor's output capacity. When selecting a compressor for a set of tools, sum the individual air consumption rates of all tools that may run simultaneously and ensure the compressor's FAD exceeds this total. A common mistake is to match tank volume rather than FAD — a large tank with a low-FAD compressor will run out of air quickly under sustained load.

## Related Machines

- Pneumatic Workstation (primary consumer of compressed air from this compressor)
- Benchtop Pneumatic Gun (connected to compressor for operation)
- Nail Gun (pneumatically powered fastening tool)
- Spray Paint Station (compressed air supply for atomisation)
- Sandblasting Cabinet (compressed air supply for abrasive blasting)
