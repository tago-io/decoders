# IE Tecnologia SM-WU

Ultrasonic level and volume meter for reservoirs and tanks.

## Measured Parameters

- **Distance** (cm) — distance from sensor to current level surface
- **Level** (cm) — calculated according to device configuration
- **Volume** (L) — calculated according to device configuration
- **Wi-Fi Signal Strength** (dBm)

## Payload Format

The SM-WU transmits a JSON object with 5 fields using short tag names (e.g., `d`, `nivel`, `volume`). All values are sent as strings. The decoder converts these into individual TagoIO variables with descriptive names and proper units.