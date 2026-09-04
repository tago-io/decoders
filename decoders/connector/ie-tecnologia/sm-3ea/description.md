# IE Tecnologia SM-3EA

Three-phase current meter for per-phase current monitoring.

## Measured Parameters

- **Current Phase A** (mA)
- **Current Phase B** (mA)
- **Current Phase C** (mA)
- **Connection Type**
- **Wi-Fi Signal Strength** (dBm)

## Payload Format

The SM-3EA transmits a JSON object with 6 fields using short tag names (e.g., `ia`, `ib`, `ic`). Values are sent as numbers. The decoder converts these into individual TagoIO variables with descriptive names and proper units.