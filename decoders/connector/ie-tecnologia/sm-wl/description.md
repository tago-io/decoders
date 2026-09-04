# IE Tecnologia SM-WL

Single-phase energy meter with active and reactive energy monitoring, consumption and generation tracking, with delta between telemetries.

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
- **Reactive Energy Consumption** (kVArh)
- **Active Energy Generation** (kWh)
- **Reactive Energy Generation** (kVArh)
- **Energy Delta** — difference between last and current telemetry (active and reactive, consumption and generation)
- **Device Temperature** (°C)
- **Wi-Fi Signal Strength** (dBm)

## Payload Format

The SM-WL transmits a JSON object with 19 fields using short tag names (e.g., `pa`, `uarms`, `freq`, `delta_epa_c`). All values are sent as strings. The decoder converts these into individual TagoIO variables with descriptive names and proper units.