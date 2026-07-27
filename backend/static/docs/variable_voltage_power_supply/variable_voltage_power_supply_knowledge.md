# Variable Voltage Power Supply

---

## Overview

A **Variable Voltage Power Supply** (also called a bench power supply, variable bench supply, or lab power supply) is an electronic instrument that converts AC mains power into a stable, adjustable DC output voltage and current. It is one of the most foundational instruments on any electronics workbench, providing the "heartbeat" of power that allows electronic circuits to operate.

Unlike a fixed power adapter that provides a single set voltage (e.g., 5V, 12V), a variable power supply allows the user to continuously adjust the output voltage over a wide range (typically 0–30V) and limit the maximum current that the supply will deliver. This current limiting capability is not just a safety feature — it is a crucial experimental tool that prevents circuits from being damaged by excessive current during testing.

Variable power supplies are available in several configurations:
- **Single-channel:** One independent output.
- **Dual-channel / Triple-channel:** Two or more independent outputs; some lab supplies offer a fixed 5V output alongside two adjustable outputs.
- **Tracking supplies:** Dual outputs where the negative output mirrors the positive output, useful for generating ±V symmetrical supplies for op-amp circuits.

> **Assumed Specifications (General Lab-Grade Variable Power Supply):**
> - Output Voltage: 0 – 30 VDC (continuously adjustable)
> - Output Current: 0 – 5 A (continuously adjustable)
> - Maximum Power: 150 W per channel
> - Voltage Regulation (Load): ≤ 0.01% + 2 mV
> - Current Regulation: ≤ 0.2% + 1 mA
> - Ripple and Noise: ≤ 1 mVrms
> - Display: Dual digital meters (V and A) — digital LED or LCD
> - Protection: Over-voltage protection (OVP), over-current protection (OCP), short-circuit protection
> - Channels: 2 adjustable + 1 fixed 5V (common lab configuration)

---

## Working Principle

Variable power supplies use one of two fundamental technologies: **linear regulation** or **switching (switch-mode) regulation**. Most benchtop lab supplies use linear regulation for its low noise output, while modern compact models may use switching regulation for higher efficiency.

### Linear Power Supply Operation

1. **Mains Transformer:** The AC mains voltage (e.g., 230 VAC) is stepped down by a transformer to a lower AC voltage appropriate for the desired output range (e.g., 0–35 VAC).

2. **Rectification:** The transformer's secondary AC output passes through a full-wave rectifier (typically a bridge rectifier using four diodes). This converts the bidirectional AC voltage into a unidirectional pulsating DC voltage.

3. **Filtering:** A large electrolytic capacitor smooths the pulsating DC into a relatively steady DC voltage with small ripple. The capacitor charges during each AC cycle peak and discharges into the load between peaks.

4. **Linear Voltage Regulator (Series Pass Element):** The heart of the variable supply is the series pass element — typically a power transistor (BJT or MOSFET) connected in series between the filtered DC and the output. The transistor acts as a variable resistor: the control circuit adjusts the transistor's conduction to maintain a constant output voltage regardless of load changes.

5. **Error Amplifier and Feedback Loop:** An operational amplifier compares the actual output voltage (fed back through a resistor divider) to a precise reference voltage set by the VOLTAGE adjustment potentiometer. If the output voltage drops below the setpoint (due to an increased load), the error amplifier increases the transistor's conduction to restore it. This is a classic **negative feedback control loop**.

6. **Current Limiting Circuit:** A separate current sensing circuit monitors the output current (via a shunt resistor). When the current reaches the setpoint (set by the CURRENT adjustment potentiometer), the current limiting circuit takes control and reduces the output voltage to keep the current at the limit. This is called **Constant Current (CC) mode**. When the current is below the limit and voltage is regulated, the supply is in **Constant Voltage (CV) mode**.

### Switch-Mode Power Supply (SMPS) Operation (Brief)

In an SMPS, the series transistor switches on and off at high frequency (tens to hundreds of kHz) rather than acting as a continuously variable resistor. Energy is stored in an inductor or transformer during the "on" period and released during the "off" period. The duty cycle of the switching controls the output voltage. SMPS are more efficient (less heat) but produce more electromagnetic interference (EMI) and ripple/noise than linear supplies.

---

## Main Components

| Component | Description |
|---|---|
| **Mains Transformer** | Steps down 230/120 VAC to appropriate secondary voltage. Provides isolation from mains. |
| **Bridge Rectifier** | Four-diode arrangement converting AC to pulsating DC. |
| **Filter Capacitor** | Large electrolytic capacitor smoothing the rectified DC voltage. |
| **Series Pass Transistor** | Power BJT or MOSFET acting as adjustable series resistance for voltage regulation. |
| **Error Amplifier (Op-Amp)** | Compares output to reference; drives the series pass transistor. |
| **Voltage Reference** | Precision, stable voltage reference (e.g., bandgap reference) for comparison. |
| **VOLTAGE Potentiometer** | User-controlled knob setting the desired output voltage. |
| **CURRENT Potentiometer** | User-controlled knob setting the current limit (maximum current allowed). |
| **Current Sense Resistor (Shunt)** | Precision low-value resistor for monitoring output current. |
| **Current Limit Amplifier** | Detects when current exceeds limit and reduces output voltage to maintain current limit. |
| **Digital Voltmeter Display** | Shows the actual output voltage (or setpoint voltage). |
| **Digital Ammeter Display** | Shows the actual output current drawn by the load. |
| **Output Binding Posts** | + (red), – (black), and often GND terminals for connecting the load. |
| **CV/CC Indicator LED** | Green LED for CV mode, Red LED for CC mode — shows which parameter is being regulated. |
| **OVP (Over-Voltage Protection)** | Crow-bar circuit that short-circuits the output (blowing a fuse) if voltage exceeds a set limit. |
| **Power Switch and Fuse** | Main power switch and line fuse protecting the mains input. |
| **Heat Sink and Fan** | Dissipates heat from the series pass transistor (linear supplies waste power as heat). |

---

## Inputs and Outputs

### Inputs
- **Electrical:** AC mains voltage (230V or 120V depending on region).
- **User Controls:** VOLTAGE knob (sets output voltage), CURRENT knob (sets current limit), ON/OFF switch.
- **Optional:** Remote sensing inputs (4-terminal connections to compensate for lead resistance at high currents); remote programming interface (RS-232, USB, LAN, GPIB).

### Outputs
- **Primary:** Regulated DC voltage at the output binding posts (+ and – terminals).
- **Information:** Digital voltage and current displays; CV/CC mode indicator LEDs.
- **Optional:** Analog output signal (for data logging), remote programming interface data.

---

## Operating Procedure

1. **Before connecting any load, ensure the power supply is switched OFF.**

2. **Set the current limit first.** This is a critical safety step often overlooked by beginners.
   - Turn the VOLTAGE knob to minimum (fully counterclockwise).
   - Turn the power supply ON.
   - Short-circuit the output terminals using a piece of wire or a banana plug shorting bar. The supply will enter CC mode.
   - Adjust the CURRENT knob to the desired current limit value as read on the ammeter display.
   - Remove the short circuit.
   - Turn the power supply OFF.

3. **Connect your load** (the circuit under test) to the output binding posts. Ensure correct polarity: red (+) to the positive terminal of your load, black (–) to the negative terminal.

4. **If using remote sensing:** Connect the sense terminals (S+ and S–) to the actual load terminals (not the supply terminals) to compensate for voltage drop in long supply leads.

5. **Turn the power supply ON.**

6. **Slowly increase the VOLTAGE knob** to the desired output voltage, watching the display.

7. **Observe the CV/CC indicator:**
   - **Green (CV):** The supply is maintaining the set voltage; current is below the limit. This is normal operation for most circuits.
   - **Red (CC):** The load is drawing current at or above the limit; the supply has reduced voltage to maintain the current limit. This may indicate a short circuit or unexpected behavior in the circuit.

8. **Monitor both voltage and current displays** during operation. Unexpectedly high current draw is an early warning sign of a circuit fault.

9. **When done, reduce the VOLTAGE knob to minimum** before switching off. This prevents voltage spikes when the supply is re-energized.

10. **Switch OFF the power supply, then disconnect the load.**

---

## Safety Guidelines

- **Always set the current limit before connecting your circuit.** The current limit protects both your circuit and the power supply from damage due to short circuits or incorrect wiring.
- **Observe correct polarity.** Reversing + and – connections can destroy polarity-sensitive components (electrolytic capacitors, ICs, transistors, LEDs) instantly.
- **Never short-circuit the output at high voltage and high current limit simultaneously** — the power dissipated can be dangerous: P = V × I (e.g., 30V × 5A = 150W, which could cause severe burns or a fire in seconds).
- **Do not connect the power supply output to an AC power line.** The supply output is DC and is isolated from mains, but attempting to power AC appliances with a DC supply can cause damage.
- **Check the voltage rating of your load before applying power.** A circuit rated for 5V will be damaged if 12V is applied accidentally.
- **Ensure adequate ventilation** around the supply. Linear power supplies generate significant heat. Blocked ventilation can cause overheating and failure.
- **Do not modify the power supply internally** unless you are a qualified technician. Mains voltages inside the supply are lethal.
- **Be aware of OVP settings.** If your load is sensitive to overvoltage (e.g., a microcontroller at 3.3V), set the OVP threshold to just above the operating voltage.

---

## Skills Required

- Understanding of DC electrical circuits (Ohm's Law, series/parallel connections).
- Knowledge of voltage and current as separate but related quantities.
- Familiarity with electronic components (resistors, LEDs, capacitors, ICs) and their voltage/current requirements.
- Basic circuit connection skills (using banana leads, breadboards, binding posts).
- Safety awareness for electrical lab work.

---

## Skills Learned

- **Power supply operation:** Setting voltage and current limits correctly and interpreting CV vs. CC modes.
- **Circuit testing methodology:** Using the power supply as a diagnostic tool (observing current draw to diagnose circuit faults).
- **Feedback control concepts:** Understanding how the error amplifier and feedback loop maintain regulation.
- **Linear vs. switching regulation:** Understanding the trade-offs between efficiency and noise/ripple.
- **Voltage regulation concepts:** Load regulation, line regulation, ripple, and their impact on circuit performance.
- **Power calculations:** P = V × I; understanding power dissipation in the series pass transistor.
- **Remote sensing:** Understanding four-wire supply connections for minimizing voltage drop errors in high-current applications.
- **Series and parallel supply connections:** Combining multiple channels for higher voltage or higher current outputs.

---

## Typical Applications

- **Powering prototype circuits on a breadboard** during design and debugging.
- **Testing electronic assemblies** after manufacturing, verifying power consumption.
- **Charging batteries** (in constant-current mode) with controlled current.
- **LED and diode testing:** Precisely controlling forward current to safely test LEDs.
- **Motor speed control testing:** Varying voltage to a DC motor to study speed-torque characteristics.
- **Solenoid and relay testing:** Applying rated voltage and checking activation current.
- **Op-amp and analog circuit testing:** Providing symmetrical ±15V (dual tracking supply).
- **Microcontroller and embedded system development:** Providing stable 3.3V or 5V for microcontrollers while monitoring current.
- **Electrochemical experiments:** Controlling electrolysis voltage and monitoring current.
- **Burn-in testing:** Running circuits at elevated voltages for extended periods to identify early failures.

---

## Common Student Projects

1. **Ohm's Law Lab:** Apply measured voltages across a known resistor; measure current; plot V-I curve; extract resistance from slope; compare to nominal value.

2. **LED Forward Voltage and Current Characterization:** Slowly increase voltage from 0V; plot current vs. voltage across an LED to obtain the I-V characteristic curve; determine the threshold voltage and series resistance.

3. **Voltage Divider Study:** Use the power supply to provide a known voltage; measure the divided voltages across resistors; verify the voltage divider formula.

4. **BJT Biasing Lab:** Supply VCC to a simple common-emitter amplifier circuit; adjust supply voltage and measure quiescent currents; verify the operating point (Q-point).

5. **DC Motor Characterization:** Apply variable voltage to a small DC motor; measure current and speed (using a tachometer or encoder); plot speed vs. voltage and torque vs. current curves.

6. **Series and Parallel Supply Configuration:** Connect two channels of a dual supply in series to achieve 0–60V; connect in parallel to achieve 0–10A; verify with a multimeter.

7. **Battery Simulation:** Set the supply to a specific voltage and current limit; use it as a "virtual battery" for testing a circuit that would normally run on a battery.

8. **Short-Circuit Protection Demonstration:** Set a low current limit, then deliberately short the output; observe the supply entering CC mode and the output voltage collapsing — demonstrating safe current-limiting behavior.

9. **Voltage Regulation Lab:** Measure the output voltage at no load and at full load; calculate load regulation percentage; measure the effect of changing input voltage on output (line regulation).

10. **Electrolysis Experiment:** Set up a simple water electrolysis cell; apply a controlled voltage and monitor current as bubbles form at electrodes; calculate the rate of gas production using Faraday's law of electrolysis.

---

## Common Mistakes

- **Forgetting to set the current limit first:** This is the single most common mistake. Connecting a circuit with a high current limit can cause a small wiring error to immediately destroy expensive components.
- **Ignoring the CV/CC indicator:** When a circuit is drawing more current than expected, it transitions to CC mode and the voltage drops. Students often think the supply is broken rather than recognizing this as a protection event (and a fault indicator in their circuit).
- **Connecting in reverse polarity:** Hooking up the + terminal to GND and the – terminal to the positive rail. Always double-check before powering on.
- **Not accounting for load regulation:** The output voltage may drop slightly under heavy current draw in a linear supply. For sensitive circuits, use a supply with better regulation or add local bypass capacitors.
- **Measuring too close to the minimum voltage range:** At 0V setting, the supply may not be perfectly zero; there may be a small residual offset. Check the actual output with a multimeter.
- **Running at high power without adequate ventilation:** Linear supplies dissipate (V_in – V_out) × I as heat. At maximum power, this can be significant and requires good airflow around the heat sink.
- **Using the supply with too long or thin wires at high current:** Thin wires have resistance; at high currents, the voltage drop across the leads is significant. Use remote sensing or thick, short leads.
- **Turning the voltage up abruptly to full value on startup:** This can cause voltage spikes. Always ramp up voltage slowly.

---

## Maintenance Basics

- **Keep ventilation slots clear** — dust buildup in fan vents and heat sink fins causes overheating. Use compressed air periodically to clean.
- **Inspect output binding posts** for oxidation or damage — clean with fine sandpaper or contact cleaner if needed.
- **Check and replace the front-panel fuse** if the supply does not power on (this is the first thing to check after a suspected overload event).
- **Inspect banana plugs and leads** for cracked insulation or bent contacts.
- **Annual calibration** — verify the displayed voltage and current against a calibrated reference multimeter; adjust the calibration trimmers if accessible.
- **Check the fan operation** — a failed cooling fan will lead to thermal shutdown or long-term damage of the pass transistors.
- **Do not store with maximum voltage settings** — return knobs to minimum before storing to reduce stress on components.

---

## Troubleshooting Guide

| Problem | Possible Cause | Suggested Action |
|---|---|---|
| Output voltage is zero with no load | Current limit set too low; CV/CC not properly set | Increase current limit; recheck voltage setting |
| Supply immediately enters CC mode | Short circuit in the load; current limit too low | Check load for shorts; increase current limit or fix circuit |
| Output voltage drops under load | Load exceeds supply's current rating; poor load regulation | Check current draw; use remote sensing; use a higher-rated supply |
| Fan running constantly at maximum speed | Internal overheating; high ambient temperature | Reduce load power; improve ventilation; check fan efficiency |
| Display reads wrong voltage | Calibration drift; display fault | Calibrate against a reference multimeter; service the unit |
| Supply does not power on | Blown mains fuse; AC power issue | Replace mains fuse; verify AC socket is live |
| Ripple/noise on output is high | Filter capacitor aging; poor filtering in load | Check capacitor condition; add external bypass capacitors at load |
| Output voltage cannot reach maximum | Transformer output low; pass transistor fault | Check AC input voltage; have the supply professionally inspected |
| CV indicator flickers between CV and CC | Load is borderline at the current limit | Slightly increase current limit; check load for intermittent short |
| Strange burning smell | Component overheating or failure | Turn off immediately; do not use; have unit inspected by a technician |

---

## Frequently Asked Questions

**Q1: What is the difference between CV (Constant Voltage) and CC (Constant Current) mode?**
A: In CV mode, the supply maintains a fixed output voltage regardless of current (up to the current limit). In CC mode, the supply maintains a fixed output current by reducing voltage as needed. The supply automatically switches based on which limit the load hits first.

**Q2: Why should I set the current limit before connecting my circuit?**
A: If your circuit has a wiring error (e.g., a short circuit), without a current limit, the supply will deliver potentially hundreds of watts into the fault, instantly destroying components and possibly causing a fire. With a proper current limit, the supply safely clamps the current and drops the voltage.

**Q3: How do I set up ±15V for an op-amp circuit?**
A: Use a dual-channel power supply with tracking mode. Connect channel 1's + terminal to your +15V rail and its – terminal to your common ground. Connect channel 2's – terminal to your –15V rail and its + terminal to your common ground. Adjust both channels to 15V.

**Q4: What does "load regulation" mean?**
A: Load regulation measures how much the output voltage changes as the load current changes from no load to full load. It is expressed as a percentage or in mV. A well-regulated supply maintains the output voltage very closely regardless of load.

**Q5: What does "line regulation" mean?**
A: Line regulation measures how much the output voltage changes when the AC input voltage varies. Good line regulation means the output stays stable even if the mains voltage fluctuates.

**Q6: What is ripple and noise in a power supply?**
A: Ripple is the residual AC component (from the rectifier's pulsating output) that appears on the DC output, typically measured in mVpp (peak-to-peak millivolts) or mVrms. Noise is higher-frequency electromagnetic interference. Both are important in sensitive analog circuits; specifications are usually stated as mVrms or mVpp.

**Q7: Why does a linear power supply run hot?**
A: The series pass transistor drops the difference between the internal rectified voltage and the output voltage: V_drop = V_internal – V_out. It dissipates power P = V_drop × I_out as heat. This is why linear supplies are less efficient at low output voltages.

**Q8: When should I use a switching power supply instead of a linear one?**
A: Use a switching supply when you need high efficiency (e.g., battery-powered equipment), compact size, or high power. Use a linear supply when you need very low noise/ripple (e.g., for sensitive analog circuits, audio equipment, or RF systems).

**Q9: What is "remote sensing" and when do I need it?**
A: Remote sensing compensates for the resistance of supply leads by measuring the voltage directly at the load terminals rather than at the supply terminals. It is important in high-current applications where thick supply cables still have non-negligible resistance and can cause significant voltage drops.

**Q10: Can I connect two power supply channels in parallel for higher current?**
A: Yes, if the supply supports it. Both channels must be set to exactly the same voltage. To ensure proper current sharing, the channels should be designed for parallel operation (some supplies have a dedicated parallel mode). Mismatched voltages can damage the supplies.

**Q11: Can I connect two power supply channels in series for higher voltage?**
A: Yes. Connect the + terminal of channel 1 to the – terminal of channel 2. The total voltage is channel 1 + channel 2. The maximum current is limited to the lower of the two channels' limits. Ensure both channels' maximum combined voltage does not exceed their rated insulation voltage.

**Q12: What is OVP (Over-Voltage Protection)?**
A: OVP is a circuit that disconnects or crowbars the output if the output voltage exceeds a preset threshold, protecting sensitive loads. It is especially important for protecting logic devices and microcontrollers where even brief overvoltage can cause permanent damage.

**Q13: What is "tracking" on a dual power supply?**
A: In tracking mode, when you adjust the output voltage on channel 1 (master), channel 2 (slave) automatically adjusts to match. This is useful for generating symmetrical ±V supplies with a single knob adjustment.

**Q14: What is a "crowbar" protection circuit?**
A: A crowbar is a rapid overvoltage protection circuit that intentionally short-circuits the output when an overvoltage is detected, blowing a fuse and protecting the load. The name refers to the idea of "throwing a crowbar" across the output terminals — a sudden, dramatic short.

**Q15: How do I use the power supply to test a circuit for the first time?**
A: Set a conservative current limit (e.g., 50–100 mA more than expected consumption). Slowly increase voltage from 0V while watching the current meter. If current rises abnormally fast before reaching the target voltage, stop — there may be a fault. If current rises to the expected quiescent value at the target voltage, the circuit is likely connected correctly.

**Q16: What should I do if the supply enters CC mode unexpectedly?**
A: First, reduce the voltage to zero. Disconnect the load. Inspect the circuit for short circuits, reversed components, or incorrect wiring. Once the fault is identified and corrected, reconnect and power up again slowly.

**Q17: What is the efficiency of a linear power supply?**
A: Efficiency = P_out / P_in = (V_out × I_out) / (V_in × I_in). For a linear supply, this can be as low as 30–50% at low output voltages. The rest is dissipated as heat in the series pass transistor. Switching supplies typically achieve 80–95% efficiency.

---

## Related Machines

- **Switching Mode Power Supply (SMPS)** — Higher efficiency alternative; lower noise floor but higher ripple.
- **DC Electronic Load** — A programmable device that draws a controlled current/voltage from a power supply; used to test supply regulation and transient response.
- **Digital Multimeter** — Used to independently verify power supply output voltage and current.
- **Oscilloscope** — Used to measure ripple and noise on the power supply output.
- **Battery Charger** — Uses constant-current charging principle (same as CC mode in a power supply).
- **Programmable Power Supply** — Remotely controllable via GPIB/USB/LAN for automated testing.

---

## Learning Path

**Beginner:**
- Learn DC voltage, current, and power relationships (P = V × I, V = I × R).
- Practice setting voltage and current limits correctly.
- Power simple LED circuits and resistor networks from the supply.
- Understand CV vs. CC mode by observing both states.

**Intermediate:**
- Study load regulation and line regulation; measure them experimentally.
- Connect two channels in series and parallel configurations.
- Use the supply as a battery charger (constant current mode).
- Measure ripple and noise on the output using an oscilloscope.

**Advanced:**
- Study the internal circuit of a linear power supply (error amplifier, feedback loop, pass transistor).
- Design and build a simple linear regulated power supply from scratch.
- Explore switching power supply topologies (buck, boost, buck-boost).
- Implement remote programming of the power supply via GPIB or USB using Python/LabVIEW.
- Perform load transient response testing and compare linear vs. switching supply behavior.

---

## Keywords

variable power supply, bench power supply, lab power supply, linear power supply, switching power supply, SMPS, constant voltage, CV mode, constant current, CC mode, voltage regulation, current limiting, load regulation, line regulation, ripple, noise, series pass transistor, error amplifier, feedback control, negative feedback, bridge rectifier, filter capacitor, voltage reference, current sense resistor, shunt, binding posts, banana plug, tracking supply, dual supply, remote sensing, OVP, over-voltage protection, crowbar circuit, current limit, short circuit protection, heat sink, thermal management, efficiency, power dissipation, electrolysis, battery charging, breadboard power, prototype testing, GPIB, USB, programmable supply, Ohm's Law, power calculation, op-amp supply, ±15V, series connection, parallel connection
