IG502 is an industrial cellular edge gateway that collects data from PLCs and meters over industrial protocols (Modbus TCP/RTU, ISO on TCP, IEC 101/104, and others) using the InHand Device Supervisor app, and publishes it over MQTT.

Use this connector for IG502 (and the IG902/IG974 family) gateways publishing Device Supervisor data to TagoIO. It parses the gateway's JSON payloads — either a TagoIO-style array of variable/value objects or the Device Supervisor group message format — into TagoIO variables, and leaves unrelated payloads untouched.
