# IE Tecnologia SM-WT

Temperature and humidity meter supporting SHT40 and DS18B20 sensors.

## Measured Parameters

- **Temperature** (°C) — channel 1 (SHT40 or DS18B20)
- **Relative Humidity** (%rH) — channel 1 (SHT40 sensor only)
- **Wi-Fi Signal Strength** (dBm)

## Payload Format

The SM-WT transmits a JSON object with 3 or 4 fields depending on the sensor used. With the SHT40 sensor, it sends temperature and humidity. With the DS18B20 sensor, it sends temperature only. All values are sent as strings.