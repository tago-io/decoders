# IE Tecnologia SM-W Plug

Single-phase energy meter with integrated relay for load control.

## Measured Parameters

- **Active Power** (W)
- **Reactive Power** (VAr)
- **Apparent Power** (VA)
- **Voltage** (V)
- **Current** (A)
- **Power Factor**
- **Phase Angle** (°) — voltage-current angle
- **Frequency** (Hz)
- **Active Energy Consumption** (kWh)
- **Relay State** — 0: off, 1: on
- **Wi-Fi Signal Strength** (dBm)

## Payload Format

The SM-W Plug transmits a JSON object with 12 fields using short tag names (e.g., `pa`, `uarms`, `freq`, `rele`). All values are sent as strings. The decoder converts these into individual TagoIO variables with descriptive names and proper units.