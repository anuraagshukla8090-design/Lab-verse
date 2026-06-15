# 4-Channel Oscilloscope

---

## Overview

An **Oscilloscope** (often called a "scope") is an electronic test instrument that graphically displays electrical signals as waveforms plotted on a screen — voltage on the vertical (Y) axis versus time on the horizontal (X) axis. Unlike a digital multimeter which shows only a single instantaneous number, an oscilloscope reveals the complete time-domain behavior of a signal: its shape, frequency, period, amplitude, rise time, duty cycle, phase relationship with other signals, and the presence of noise or transients.

A **4-channel oscilloscope** specifically provides four independent vertical input channels, each capable of simultaneously displaying a different signal. This multi-channel capability is essential for observing relationships between signals — for example, comparing an input signal to an output signal, viewing all four phases of a motor controller, or debugging a communication protocol like I2C or SPI where a clock and multiple data lines must be observed together.

Modern oscilloscopes are **Digital Storage Oscilloscopes (DSOs)** — they digitize the input signal using a high-speed ADC and store the waveform data in memory, allowing deep analysis, waveform math operations (add, subtract, FFT), persistence display, triggering on complex events, and transfer of waveform data to a computer.

> **Assumed Specifications (Typical Lab 4-Channel DSO):**
> - Channels: 4 (CH1, CH2, CH3, CH4)
> - Bandwidth: 100 MHz – 200 MHz
> - Sample Rate: 1 GSa/s (per channel) to 4 GSa/s (interleaved)
> - Vertical Resolution: 8-bit ADC (256 levels)
> - Vertical Sensitivity: 1 mV/div to 50 V/div
> - Time Base: 1 ns/div to 100 s/div
> - Memory Depth: 1 Mpts – 28 Mpts per channel
> - Input Impedance: 1 MΩ || 13 pF (with 1x probe); switchable to 50 Ω
> - Max Input Voltage: 300 V (CAT II) with appropriate probe attenuation
> - Trigger Types: Edge, Pulse Width, Pattern, Video, Serial (I2C, SPI, UART), etc.
> - Display: 7–10 inch TFT LCD, waveform display area 8×10 divisions
> - Interface: USB, LAN (optional), HDMI output

---

## Working Principle

### Signal Acquisition Path

1. **Probe and Attenuator:** The signal from the circuit under test enters through a probe. The probe contains internal resistors and capacitors for impedance matching. Most probes have a 10x attenuation switch (10:1 probe), which means only 1/10th of the input voltage reaches the scope's input, allowing measurement of higher voltages while maintaining the scope's input impedance.

2. **Vertical Amplifier:** The signal is amplified (or attenuated further) by the vertical amplifier to the selected volts/division setting. This sets how many volts are represented by each vertical grid division on the display.

3. **ADC (Analog-to-Digital Converter):** The conditioned analog signal is digitized by a high-speed ADC at the sample rate (e.g., 1 GSa/s = 1 billion samples per second). Higher bandwidth scopes require faster ADCs.

4. **Acquisition Memory:** The digitized samples are stored in the acquisition memory. The memory depth determines how many samples can be stored per trigger event, which affects how much signal history is captured.

5. **Trigger System:** The trigger determines the moment at which the scope "captures" a waveform. A stable trigger creates a stable display even for repetitive signals. Without triggering, the waveform would appear to scroll continuously. Common trigger: **Edge trigger** — the scope captures when the signal crosses a threshold voltage on a rising or falling edge.

6. **DSP and Waveform Processing:** The microprocessor performs waveform processing: calculating automatic measurements (frequency, period, amplitude, duty cycle, rise time), waveform math (CH1 + CH2, CH1 – CH2, FFT for frequency domain display), and filtering.

7. **Display Rendering:** The processed waveform data is rendered on the LCD screen as waveform traces. The grid (graticule), voltage, time measurements, and channel settings are overlaid as text.

### Key Oscilloscope Concepts

**Bandwidth:** The –3 dB frequency limit of the oscilloscope's vertical amplifier. A 100 MHz scope can faithfully display signals up to approximately 100 MHz. For higher-frequency signals, the amplitude will be attenuated and phase will shift.

**Sample Rate and Nyquist Criterion:** To faithfully reconstruct a signal, the sample rate must be at least twice the highest frequency present (Nyquist theorem). In practice, for accurate waveform shape reproduction, 5–10× oversampling is preferred. A 100 MHz signal ideally needs a 500 MHz – 1 GHz sample rate.

**Time Base (Sweep Speed):** The time/division setting controls how much time is represented by each horizontal division. 1 ms/div shows 10 ms of signal across the 10-division screen.

**Vertical Sensitivity:** The volts/division setting controls how many volts are represented by each vertical division. 1 V/div shows 8V total on an 8-division screen.

---

## Main Components

| Component | Description |
|---|---|
| **Input Channels (CH1–CH4)** | Four BNC connectors for signal input; each fully independent with its own amplifier and ADC. |
| **Oscilloscope Probes** | Passive or active probes that connect the circuit under test to the scope; 1:1 and 10:1 attenuation options. |
| **Vertical Amplifier** | Per-channel amplifier setting the volts/division for signal conditioning. |
| **ADC** | High-speed analog-to-digital converter for each channel (or time-multiplexed). |
| **Acquisition Memory** | High-speed RAM storing digitized waveform samples. |
| **Trigger System** | Determines the capture event; edge, pulse, video, pattern, serial triggers. |
| **Time Base Generator** | Controls the horizontal sweep speed (time/division). |
| **DSP / FPGA / Microprocessor** | Processes waveform data, performs measurements and math operations. |
| **Display (TFT LCD)** | Large color screen showing up to 4 waveform channels plus measurements. |
| **Front Panel Controls** | Knobs and buttons for VOLTS/DIV, TIME/DIV, TRIGGER level, POSITION for each channel. |
| **AUTOSET Button** | Automatically selects time base, trigger, and voltage scale for a quick, stable display. |
| **RUN/STOP Button** | Starts or freezes the acquisition; STOP freezes the display for detailed analysis. |
| **Channel Coupling Switch** | DC coupling (shows all frequencies including DC offset), AC coupling (blocks DC, shows only AC), GND (grounds the input for zero reference). |
| **BNC Calibration Output** | Generates a 1 kHz, 3.3 V (or similar) square wave for probe compensation. |
| **USB/LAN Ports** | For saving screenshots/waveforms, updating firmware, and remote control. |
| **External Trigger Input** | Accepts an external trigger signal to synchronize with an external event. |

---

## Inputs and Outputs

### Inputs
- **CH1, CH2, CH3, CH4:** Four BNC inputs for signal measurement (connected via probes).
- **EXT TRIG (External Trigger):** BNC input for external trigger signal.
- **AC Mains:** Power supply for the oscilloscope.
- **USB (Front/Rear):** For connecting USB drives, storage, or PC connection.

### Outputs
- **Display:** The primary output — visual waveform representation and measurement readout.
- **USB/LAN:** Waveform data files (CSV, BIN, or proprietary format), screen captures (PNG, BMP) transferable to a computer.
- **HDMI/VGA (if present):** External monitor output for display on a larger screen or projector.
- **Calibration Output (CAL/PROBE COMP):** ~1 kHz square wave output for probe compensation adjustment.

---

## Operating Procedure

1. **Connect the oscilloscope probe to the desired input channel (e.g., CH1).**
   - Attach the probe's BNC connector to CH1's BNC jack.
   - Set the probe's attenuation switch to 10x (for general use).
   - Inform the scope of the probe attenuation ratio: go to CH1 settings and set Probe = 10x.

2. **Compensate the probe** (do this the first time and whenever you change probes or scope):
   - Connect the probe tip to the CAL output on the front panel.
   - Press AUTOSET.
   - Observe the calibration square wave. If the top corners overshoot (peaked), adjust the small trimmer capacitor on the probe body until the square wave has flat, clean top corners. This is critical for accurate high-frequency measurements.

3. **Connect the probe tip to the test point in your circuit** and clip the probe ground to the circuit's reference ground.

4. **Press AUTOSET** to let the scope automatically select an appropriate time base, voltage scale, and trigger for a stable display.

5. **Fine-tune the vertical scale (VOLTS/DIV)** so the waveform fills approximately 5–6 of the 8 vertical divisions for best resolution.

6. **Fine-tune the time base (TIME/DIV)** to show 2–3 complete cycles of the waveform for good readability.

7. **Adjust the TRIGGER level** if the waveform is not stable (use the trigger level knob to set the threshold to the middle of the waveform's amplitude range).

8. **Adjust channel coupling:**
   - Use **DC coupling** to see both the AC and DC components of a signal.
   - Use **AC coupling** to remove the DC offset and observe only the AC waveform variation (useful for viewing small ripple on a large DC voltage).

9. **Enable additional channels (CH2, CH3, CH4)** as needed, repeat the probe connection and scaling for each.

10. **Use automatic measurements:** Press MEASURE and select parameters (Frequency, Period, Amplitude, RMS, Rise Time, Duty Cycle, etc.) to display calculated values.

11. **Use cursors for manual measurement:** Place cursor pairs on specific points of the waveform to read time differences (ΔT) and voltage differences (ΔV).

12. **Save waveform data or screenshot to USB** using the SAVE/RECALL menu.

13. **Press STOP to freeze** the display for detailed analysis; press RUN to resume live acquisition.

---

## Safety Guidelines

- **Check the maximum input voltage** before connecting to a circuit. Exceeding the rated input voltage (commonly 300–400V with 10x probe, or 40V with 1x probe) can permanently damage the input amplifiers.
- **Never connect the probe ground to a non-ground point in a circuit.** The probe ground is connected to the oscilloscope chassis, which is connected to earth ground through the mains plug. Connecting the probe ground to a non-grounded point can create a short circuit to earth ground, potentially destroying the circuit and causing a shock hazard.
- **For differential measurements on floating or live circuits:** Use differential probes or an isolation transformer — never use the standard ground-referenced probe setup.
- **Be careful with high-frequency probes** — the coaxial cables are fragile and the connectors can be damaged by rough handling.
- **Do not exceed the bandwidth of your probe** for the measurement — a 50 MHz probe on a 200 MHz scope limits measurement capability to 50 MHz.
- **Ensure good grounding practices:** Use the shortest possible ground clip lead to minimize ground lead inductance, which can cause ringing artifacts at high frequencies.
- **In high-voltage work (beyond 30V):** Verify probe CAT ratings match the measurement environment.

---

## Skills Required

- Understanding of voltage as a time-varying quantity (AC signals, waveforms).
- Basic knowledge of time domain vs. frequency domain concepts.
- Familiarity with waveform parameters: period, frequency, amplitude, phase.
- Basic electronics knowledge (what signals to expect at different circuit nodes).
- Knowledge of trigger concepts (edge trigger, trigger level).
- Understanding of probe attenuation (1x vs 10x).

---

## Skills Learned

- **Waveform interpretation:** Reading amplitude, period, frequency, duty cycle, phase from an oscilloscope display.
- **Triggering mastery:** Setting up stable triggers for repetitive and complex/one-shot events.
- **Probe compensation:** Understanding and performing probe compensation for accurate high-frequency measurements.
- **Time domain analysis:** Observing signal behavior over time — rise time, ringing, overshoot, settling time.
- **Frequency domain analysis (FFT):** Using the built-in FFT function to view frequency content of signals.
- **Multi-channel signal comparison:** Observing phase relationships, propagation delays, and cross-channel correlations.
- **Protocol decoding:** Using serial decode functions (I2C, SPI, UART) to interpret digital communication signals.
- **Waveform math:** Using CH1 – CH2 to measure differential signals; using FFT for spectral analysis.
- **Data export and analysis:** Saving waveform CSV data and analyzing it in Python, MATLAB, or Excel.

---

## Typical Applications

- **Analog signal analysis:** Observing the output of a function generator, amplifier, or filter.
- **Digital signal debugging:** Verifying logic levels, clock signals, PWM duty cycles, and glitch detection.
- **Power supply ripple measurement:** AC coupling onto a DC supply rail to measure residual AC ripple.
- **Amplifier characterization:** Measuring gain, bandwidth, phase shift, and clipping of amplifier stages.
- **Filter characterization:** Observing the attenuation and phase response of low-pass, high-pass, and band-pass filters.
- **Communication protocol debugging:** Decoding I2C, SPI, UART, CAN bus, and other serial protocols.
- **Sensor signal analysis:** Observing the output of accelerometers, pressure sensors, and other transducers.
- **Motor and power electronics:** Observing PWM switching waveforms, current sense signals, and gate drive signals.
- **Timing analysis:** Measuring propagation delays, setup and hold times in digital circuits.
- **RF and signal integrity:** Observing transmission line reflections, ringing, and eye diagrams.

---

## Common Student Projects

1. **Basic Waveform Measurement Lab:** Generate sine, square, and triangle waves from a function generator; display on the oscilloscope; measure frequency, amplitude, period, and RMS value; compare RMS with DMM reading.

2. **RC Time Constant Measurement:** Charge and discharge an RC circuit; observe the exponential voltage waveform; measure the time constant τ = RC from the waveform (at 63.2% of max voltage); compare to calculated value.

3. **Phase Difference Measurement:** Pass a sine wave through an RC network; use 2-channel display with Lissajous figures (XY mode) or cursor delta-time method to measure the phase shift; compare to arctan(1/ωRC).

4. **Amplifier Gain and Bandwidth Measurement:** Apply sine waves of various frequencies to an amplifier; measure input amplitude (CH1) and output amplitude (CH2); calculate gain; plot gain vs. frequency to get Bode plot; identify the -3 dB frequency.

5. **PWM Duty Cycle Measurement:** Generate PWM signals with an Arduino/microcontroller; display on the oscilloscope; use MEASURE function to verify duty cycle percentage at various settings.

6. **FFT Spectrum Analysis:** Display a distorted signal (e.g., clipped sine wave) on the oscilloscope; use the built-in FFT math function to view the harmonic content (fundamental + 2nd, 3rd harmonics); relate the FFT spectrum to the waveform shape.

7. **I2C Protocol Decoding:** Connect the oscilloscope to the SDA and SCL lines of an I2C bus; enable the protocol decode function; observe and decode I2C communication packets between a microcontroller and a sensor.

8. **Probe Compensation Study:** Intentionally under- and over-compensate a probe; observe the effect on a square wave (overshoot vs. rounded corners); then properly compensate; illustrate why probe compensation matters.

9. **Lissajous Figure Lab:** Set the oscilloscope to XY mode (CH1 = X, CH2 = Y); apply two sine waves of varying frequency ratios; observe the Lissajous figures and use them to determine frequency ratios.

10. **Motor Back-EMF Observation:** Connect the oscilloscope to the terminals of a DC motor as it decelerates; observe the decaying back-EMF waveform and measure the time constant.

---

## Common Mistakes

- **Not compensating the probe:** An under- or over-compensated probe causes amplitude errors at higher frequencies. Always compensate before making measurements.
- **Wrong probe attenuation setting:** Setting the scope to 1x when using a 10x probe causes readings to be 10 times too high.
- **Attaching probe ground to non-ground nodes:** This creates short circuits to earth ground, potentially destroying circuits and posing safety risks. Never do this with standard probes.
- **Using AC coupling for DC measurements:** AC coupling blocks DC, so reading the DC level of a signal while in AC coupling mode will show only zero or the AC variation.
- **Overdriving the input:** Applying a signal much larger than the V/div setting clips the display — increase V/div (zoom out vertically).
- **Incorrect trigger settings causing an unstable or scrolling display:** Ensure the trigger level is set within the amplitude range of the signal and the trigger source is set to the correct channel.
- **Forgetting to stop the acquisition before analysis:** The waveform keeps updating while in RUN mode, making cursor measurements difficult. Press STOP to freeze the display.
- **Misinterpreting FFT results:** The FFT function requires understanding of window functions, spectral leakage, and frequency resolution. Without this knowledge, FFT results can be misleading.
- **Using too short a ground lead at high frequencies:** Long ground leads add inductance, causing ringing on fast edges. Use the short ground spring included with the probe for high-frequency measurements.
- **Expecting the scope to show signals beyond its bandwidth:** A 100 MHz scope will not faithfully display a 500 MHz signal — it will attenuate and distort it severely.

---

## Maintenance Basics

- **Clean the screen** with a soft, lint-free cloth and an appropriate display cleaner — never use abrasive materials.
- **Inspect probe cables** regularly for cracks, kinks, or damaged connectors. A damaged probe cable significantly degrades signal integrity.
- **Check probe ground clips** — spring tension weakens over time; replace if they no longer grip well.
- **Keep the BNC connectors clean** — oxidized or dirty BNC connectors cause intermittent connections and signal degradation.
- **Update firmware** as the manufacturer releases updates — firmware updates can add features and fix measurement bugs.
- **Store probes** with their protective tip caps in place to prevent damage to the probe tip.
- **Annual calibration** by a metrology service ensures measurement accuracy is maintained.
- **Back up your settings** (channel configurations, trigger setups) to a USB drive for quick restoration.

---

## Troubleshooting Guide

| Problem | Possible Cause | Suggested Action |
|---|---|---|
| No waveform visible on screen | Channel not enabled; VOLTS/DIV too small or large; signal not connected | Enable channel; adjust V/div; verify probe connection and ground |
| Waveform scrolls horizontally | Trigger not set or trigger level out of range | Set trigger to correct channel; adjust trigger level to mid-signal amplitude |
| Waveform looks distorted/wrong amplitude | Probe not compensated; wrong probe attenuation selected | Compensate probe; verify V/div matches probe attenuation |
| High-frequency signal looks attenuated | Signal exceeds scope bandwidth; probe bandwidth too low | Use a higher-bandwidth scope/probe |
| Signal shows excessive ringing | Long ground lead adding inductance | Use shortest possible ground lead; use probe's ground spring |
| Waveform is noisy/fuzzy | Electrical interference; AC coupling + switching noise | Use shielded probe cables; improve grounding; use averaging acquisition |
| Scope won't trigger stably | Signal is aperiodic or trigger settings incorrect | Adjust trigger level and slope; try different trigger modes (Normal, Auto, Single) |
| Screen image cannot be saved to USB | USB drive incompatible or not formatted correctly | Use a USB 2.0 drive formatted as FAT32 |
| Automatic measurements show wrong values | Signal doesn't fill enough of the screen; wrong measurement type | Adjust V/div and TIME/DIV; ensure 2+ complete cycles are visible |
| CH1 and CH2 appear identical when measuring different signals | Probes sharing the same ground point in the circuit (ground loop) | Ensure each probe's ground is at the correct reference for that signal |

---

## Frequently Asked Questions

**Q1: What is bandwidth in an oscilloscope and why does it matter?**
A: Bandwidth is the frequency at which the oscilloscope's vertical amplifier attenuates a sinusoidal signal by 3 dB (reduces it to 70.7% of its actual amplitude). Signals above the bandwidth are not faithfully reproduced. As a rule of thumb, choose a scope with at least 5× the bandwidth of the highest frequency signal you need to measure.

**Q2: What is the difference between sample rate and bandwidth?**
A: Bandwidth refers to the analog frequency limit of the vertical amplifier. Sample rate is how many digital samples the ADC takes per second. A sufficient sample rate (Nyquist: ≥2× signal frequency; practice: ≥5–10×) is needed to reconstruct the signal accurately from samples.

**Q3: What is a trigger and why is it necessary?**
A: The trigger tells the oscilloscope when to start capturing a waveform snapshot. Without a trigger, repetitive signals would appear to scroll or blur because each capture would start at a different point in the cycle. By triggering on a consistent event (e.g., rising edge crossing 1 V), the scope always displays the waveform starting from the same point, creating a stable image.

**Q4: What is the difference between RUN and STOP mode?**
A: In RUN mode, the oscilloscope continuously captures and updates the display with new waveform data. In STOP mode, the last captured waveform is frozen on the display, allowing detailed analysis with cursors and zooming without the image changing.

**Q5: What is probe compensation and how do I do it?**
A: Probe compensation adjusts the probe's internal capacitor to match the oscilloscope input's capacitance, ensuring flat frequency response across the probe's bandwidth. Connect the probe to the CAL output (square wave), observe the waveform, and turn the small trimmer on the probe body with a plastic tool until the top of the square wave is perfectly flat.

**Q6: When should I use AC coupling vs. DC coupling?**
A: Use DC coupling to see the full signal including its DC offset (e.g., checking a power supply output). Use AC coupling when you want to observe small AC variations on top of a large DC level (e.g., viewing 50 mV of ripple on a 12V rail) — AC coupling blocks the DC component and lets you zoom in on the AC variation.

**Q7: What is the AUTOSET function?**
A: AUTOSET automatically selects an appropriate vertical scale (VOLTS/DIV), time base (TIME/DIV), and trigger settings to display a stable, readable waveform. It's a good starting point, though manual fine-tuning is usually needed for optimal display.

**Q8: What is memory depth and why does it matter?**
A: Memory depth is the number of samples stored in one acquisition. Deeper memory allows you to capture long time intervals at a high sample rate simultaneously — both time resolution and total captured time. With shallow memory, either you get short time or low sample rate (fewer detail).

**Q9: What is the FFT function on an oscilloscope?**
A: Fast Fourier Transform (FFT) is a mathematical algorithm that converts the time-domain waveform into a frequency-domain spectrum, showing which frequency components are present in the signal and at what amplitude. Useful for identifying harmonic distortion, noise sources, and signal composition.

**Q10: What is XY mode?**
A: XY mode plots CH1 on the X axis and CH2 on the Y axis instead of the usual time-based display. This is used to create Lissajous figures (for frequency ratio and phase difference determination), I-V characteristic curves, and other parametric plots.

**Q11: What is a Lissajous figure?**
A: A Lissajous figure is the pattern traced on an XY display when two sinusoidal signals of different frequencies and phases drive the X and Y inputs. The shape of the figure reveals the ratio of frequencies and phase relationship between the two signals.

**Q12: What is a "10x probe" and why should I usually use one instead of a 1x probe?**
A: A 10x probe has a 9 MΩ resistor in its tip that, combined with the scope's 1 MΩ input impedance, creates a 10:1 voltage divider. This raises the probe's effective input impedance to 10 MΩ (less loading of the circuit) and increases the maximum measurable voltage by 10x. The displayed voltage is automatically scaled by 10 to show the correct value. Use 1x probes only for measuring very small signals where the 10x attenuation would lose resolution.

**Q13: What is single-shot triggering mode?**
A: In SINGLE trigger mode, the oscilloscope arms itself and waits for one trigger event. When the trigger occurs, it captures one waveform snapshot and then stops. This is essential for capturing non-repetitive events like power-on glitches, communication packet errors, or mechanical switch bounce.

**Q14: What is protocol decoding on an oscilloscope?**
A: Many modern DSOs include serial protocol decode capabilities. By assigning digital signals on the channels to protocol roles (e.g., SDA and SCL for I2C, MOSI/MISO/SCK/CS for SPI), the scope automatically decodes the communication packets and displays the decoded data (hex values, ASCII) overlaid on the waveform. This greatly speeds up embedded system debugging.

**Q15: How do I measure rise time and why is it important?**
A: Rise time is the time for a signal to transition from 10% to 90% of its final amplitude. It is a key indicator of a circuit's speed. In digital systems, fast rise times can cause signal integrity problems (ringing, crosstalk). Measure using the MEASURE function or by placing cursors at the 10% and 90% amplitude levels and reading ΔT.

**Q16: What is the difference between a DSO (Digital Storage Oscilloscope) and an analog oscilloscope?**
A: An analog oscilloscope uses a Cathode Ray Tube (CRT) and draws the waveform directly by deflecting an electron beam — no digitization occurs. A DSO digitizes the signal, stores it in memory, and renders it on an LCD screen. DSOs have superior measurement capabilities, storage, waveform math, and protocol decoding, but can have aliasing issues if sample rate is insufficient.

**Q17: What is a mixed-signal oscilloscope (MSO)?**
A: An MSO combines an oscilloscope with a logic analyzer. In addition to the standard analog input channels, it has 16 or more digital (logic) input channels for observing multiple digital signal lines simultaneously. This is invaluable for debugging microcontroller-based systems where both analog and digital signals need to be observed together.

**Q18: What is bandwidth limiting and when should I use it?**
A: Most oscilloscopes have a bandwidth limit mode (e.g., 20 MHz bandwidth limit) that applies a digital low-pass filter to reduce high-frequency noise on the displayed signal. Use it when you're measuring a low-frequency signal that has high-frequency noise obscuring the measurement — it makes the signal cleaner. Do not use it when measuring high-frequency signals, as it will attenuate them.

---

## Related Machines

- **Function Generator** — Provides the test signals that are observed and analyzed on the oscilloscope; the two instruments are almost always used together.
- **Digital Multimeter (DMM)** — Complementary instrument; the DMM gives precise single-value measurements while the scope shows the full waveform.
- **Logic Analyzer** — Specialized digital-only instrument for capturing many simultaneous logic signals; more channels than an MSO but no analog capability.
- **Spectrum Analyzer** — Measures signals in the frequency domain natively; more accurate and dynamic range than the scope's FFT function, especially at RF frequencies.
- **Variable Power Supply** — Powers the circuit under test while the oscilloscope observes its signals.
- **LCR Meter** — Measures component values; scope can be used to verify LCR meter accuracy by observing resonance circuits.
- **Signal/Protocol Analyzer** — Specialized instrument for decoding and validating communication protocols (USB, Ethernet, etc.).

---

## Learning Path

**Beginner:**
- Learn to display and measure a simple sine wave from a function generator.
- Practice adjusting VOLTS/DIV and TIME/DIV for optimal display.
- Perform probe compensation.
- Measure frequency, period, and amplitude using the MEASURE function and cursors.
- Observe the difference between DC coupling and AC coupling.

**Intermediate:**
- Use 2 channels to compare input and output of a filter; measure phase shift.
- Set up edge, pulse-width, and pattern triggers.
- Use AC coupling to observe power supply ripple.
- Perform FFT analysis to view harmonics of a distorted signal.
- Use XY mode to create Lissajous figures.
- Measure rise time, fall time, and propagation delay.

**Advanced:**
- Decode I2C, SPI, and UART protocols using the serial decode function.
- Perform differential measurements using math (CH1 – CH2).
- Characterize amplifier bandwidth (Bode plot) by sweeping the function generator.
- Export waveform data to CSV and analyze in Python (scipy, numpy, matplotlib).
- Use deep memory and segmented acquisition for long capture sequences.
- Set up automated measurement scripts using SCPI commands over LAN/USB.

---

## Keywords

oscilloscope, digital storage oscilloscope, DSO, 4-channel oscilloscope, waveform, time domain, frequency domain, bandwidth, sample rate, Nyquist theorem, trigger, edge trigger, AUTOSET, VOLTS/DIV, TIME/DIV, vertical amplifier, ADC, acquisition memory, probe, 10x probe, probe compensation, AC coupling, DC coupling, GND coupling, rise time, fall time, propagation delay, duty cycle, period, frequency, amplitude, RMS voltage, peak-to-peak, FFT, Fast Fourier Transform, XY mode, Lissajous figure, protocol decode, I2C, SPI, UART, serial decode, mixed-signal oscilloscope, MSO, logic analyzer, trigger level, single-shot trigger, persistence mode, waveform math, cursor measurement, automatic measurement, SCPI, LabVIEW, Python, CSV export, signal integrity, crosstalk, bandwidth limiting, memory depth, CAT rating, differential probe, earth ground, floating measurement, harmonic analysis, spectrum, graticule
