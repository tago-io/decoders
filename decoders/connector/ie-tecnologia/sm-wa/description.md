# IE Tecnologia SM-WA

Water consumption meter with instantaneous flow rate and accumulated consumption monitoring.

## Measured Parameters

- **Pulses per Liter** (pulses/L) — sensor configuration
- **Instantaneous Flow Rate** (L/min) — calculated from pulses
- **Total Accumulated Consumption** (L)
- **Wi-Fi Signal Strength** (dBm)

## Payload Format

The SM-WA transmits a JSON object with 5 fields using short tag names (e.g., `ppl`, `vazao`, `consumo`). All values are sent as strings. The decoder converts these into individual TagoIO variables with descriptive names and proper units.