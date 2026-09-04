# IE Tecnologia SM-W Lite

Single-phase energy meter for monitoring electrical parameters.

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
- **Active Energy Generation** (kWh)
- **Device Temperature** (°C)
- **Wi-Fi Signal Strength** (dBm)

## Payload Format

The SM-W Lite transmits a JSON object with 13 fields using short tag names (e.g., `pa`, `uarms`, `freq`). All values are sent as strings. The decoder converts these into individual TagoIO variables with descriptive names and proper units.