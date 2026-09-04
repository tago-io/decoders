# IE Tecnologia SM-3ELW

Three-phase energy meter with WiFi connectivity for comprehensive electrical parameter monitoring across three phases (A, B, C).

## Measured Parameters

- **Voltage** (V) — phases A, B, C
- **Current** (A) — phases A, B, C and total
- **Active Power** (W) — phases A, B, C and total
- **Reactive Power** (VAr) — phases A, B, C and total
- **Apparent Power** (VA) — phases A, B, C and total
- **Power Factor** — phases A, B, C and total
- **Phase Angle** (°) — voltage-current angle per phase
- **Frequency** (Hz)
- **Active Energy Consumption** (kWh) — phases A, B, C and total
- **Reactive Energy Consumption** (kVArh) — phases A, B, C and total
- **Active Energy Generation** (kWh) — phases A, B, C and total
- **Reactive Energy Generation** (kVArh) — phases A, B, C and total
- **Energy Delta** — difference between last and current telemetry (active and reactive, consumption and generation)
- **Voltage Phase Angles** (°) — A-B, A-C, B-C
- **Device Temperature** (°C)
- **Connection Type**
- **Wi-Fi Signal Strength** (dBm)

## Payload Format

The SM-3ELW transmits a JSON object with 66 fields using short tag names (e.g., `pa`, `uarms`, `freq`, `delta_epa_c`). All values are sent as strings. The decoder converts these into individual TagoIO variables with descriptive names and proper units.