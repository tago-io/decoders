# IE Tecnologia SM-3W Lite

Three-phase energy meter for monitoring electrical parameters across three phases (A, B, C).

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
- **Active Energy Generation** (kWh) — phases A, B, C and total
- **Voltage Phase Angles** (°) — A-B, A-C, B-C
- **Device Temperature** (°C)

## Payload Format

The SM-3W Lite transmits a JSON object with 40 fields using short tag names (e.g., `pa`, `uarms`, `freq`). All values are sent as strings. The decoder converts these into individual TagoIO variables with descriptive names and proper units.