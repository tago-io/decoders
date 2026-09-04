# IE Tecnologia SM-WRC

Relay controller with state monitoring and Wi-Fi signal strength.

## Measured Parameters

- **Relay State** — 0: off, 1: on
- **Wi-Fi Signal Strength** (dBm)

## Payload Format

The SM-WRC transmits a JSON object with 3 fields using short tag names (e.g., `er`, `rssi`). All values are sent as strings. The decoder converts these into individual TagoIO variables with descriptive names and proper units.