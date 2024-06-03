/*
  Port 1: Hello Message
    Firmware major version
    Firmware minor version
    Product ID
    Hardware revision
    Power on reset
    Watchdog reset
    External reset
    Software reset
    RFU
    Watchdog reset code
    Battery voltage
    LR1110 hardware revision
    LR1110 firmware major version
    LR1110 firmware minor version
  Port 2: Downlink ACK
    Sequence Number
    Accept
    Firmware major version
    Firmware minor version
    Product ID
    Hardware revision
    Downlink port number
    LR1110 hardware revision
    LR1110 firmware major version
    LR1110 firmware minor version
  Port 3: Stats message
    Initial battery voltage
    Current battery voltage
    wakeups per trip
    trip count
    uptime in weeks
    battery used
    percentage used on LoRaWAN
    percentage used on GNSS
    percentage used on WiFi
    percentage used sleeping
    percentage used on battery self discharge
  Port 5: Location message
    Number of WiFi access points N (0-31)
    In-trip
    Inactivity Indicator
    RFU
    Timestamp in NAV message (if present)
    position assistance sequence number
    Access point 1, RSSI, in dBm (signed)
    Access point 1, MAC address
    Access point 2, RSSI, in dBm (signed)
    Access point 2, MAC address
    Further access points
    Semtech format GNSS NAV message (optional)
*/

function Decoder(bytes, port) {
  const decoded = [];
  if (port === 1) {
    // FIRMWARE VERSION
    // Firmware major version
    const major = bytes.readUInt8(0);
    // Firmware minor version
    const minor = bytes.readUInt8(1);
    decoded.push({ variable: "firmware_version", value: `${major}.${minor}` });
    // Product ID
    const prod_id = bytes.readUInt8(2);
    decoded.push({ variable: "product_id", value: prod_id });
    // Hardware revision
    const hw_rev = bytes.readUInt8(3);
    decoded.push({ variable: "hardware_revision", value: hw_rev });
    // RESETS
    const resets = bytes.readUInt8(4);
    // Power on reset
    const power_on_reset = resets & 1;
    decoded.push({ variable: "power_on_reset", value: power_on_reset });
    // Watchdog reset
    const watchdog_reset = (resets >> 1) & 1;
    decoded.push({ variable: "watchdog_reset", value: watchdog_reset });
    // External reset
    const external_reset = (resets >> 2) & 1;
    decoded.push({ variable: "external_reset", value: external_reset });
    // Software reset
    const sw_reset = (resets >> 3) & 1;
    decoded.push({ variable: "software_reset", value: sw_reset });
    // RFU (resets -- bit 4 to bit 7. Beginning at 0)
    // Watchdog reset code
    const watchdog_reset_code = bytes.readUInt16LE(5);
    decoded.push({ variable: "watchdog_reset_code", value: watchdog_reset_code });
    // Battery voltage
    const battery = bytes.readUInt8(7);
    decoded.push({ variable: "battery", value: 2000 + 7 * battery, unit: "mV" });
    // LR1110 hardware revision
    const lr1110_hw_rev = bytes.readUInt8(8);
    decoded.push({ variable: "lr1110_hardware_revision", value: lr1110_hw_rev.toString(16) });
    // LR1110 FIRMWARE VERSION
    // LR1110 firmware major
    const lr1110_fw_major_version = bytes.readUInt8(9);
    // LR1110 firmware minor
    const lr1110_fw_minor_version = bytes.readUInt8(10);
    decoded.push({ variable: "lr1110_firmware", value: `${lr1110_fw_major_version}.${lr1110_fw_minor_version}` });
  } else if (port === 2) {
    // DOWNLINK
    const downlink = bytes.readUInt8(0);
    // Sequence Number
    const sequence_number = downlink & 0x7f;
    decoded.push({ variable: "downlink_sequence_number", value: sequence_number });
    // Accept
    const accept = downlink >> 7;
    decoded.push({ variable: "downlink_accepted", value: accept });
    // FIRMWARE VERSION
    // Firmware major version
    const major = bytes.readUInt8(1);
    // Firmware minor version
    const minor = bytes.readUInt8(2);
    decoded.push({ variable: "firmware_version", value: `${major}.${minor}` });
    // Product ID
    const prod_id = bytes.readUInt8(3);
    decoded.push({ variable: "product_id", value: prod_id });
    // Hardware revision
    const hw_rev = bytes.readUInt8(4);
    decoded.push({ variable: "hardware_revision", value: hw_rev });
    // Downlink port number
    const downlink_port = bytes.readUInt8(5);
    decoded.push({ variable: "downlink_port_number", value: downlink_port });
    // LR1110 hardware revision
    const lr1110_hw_rev = bytes.readUInt8(6);
    decoded.push({ variable: "lr1110_hardware_revision", value: lr1110_hw_rev.toString(16) });
    // LR1110 FIRMWARE VERSION
    // LR1110 firmware major
    const lr1110_fw_major_version = bytes.readUInt8(7);
    // LR1110 firmware minor
    const lr1110_fw_minor_version = bytes.readUInt8(8);
    decoded.push({ variable: "lr1110_firmware", value: `${lr1110_fw_major_version}.${lr1110_fw_minor_version}` });
  } else if (port === 3) {
    // Initial battery voltage
    const initial_battery = bytes.readUInt8(0);
    decoded.push({ variable: "initial_battery", value: 2000 + 7 * initial_battery, unit: "mV" });
    // Current battery voltage
    const curr_battery = bytes.readUInt8(1);
    decoded.push({ variable: "current_battery", value: 2000 + 7 * curr_battery, unit: "mV" });
    // wakeups per trip
    const wakeups_trip = bytes.readUInt8(2);
    decoded.push({ variable: "wakeups_per_trip", value: wakeups_trip });
    // trip count
    const trip_count = bytes.readUInt16LE(3) & 0x3fff;
    decoded.push({ variable: "trip_count", value: 32 * trip_count });
    // uptime in weeks
    const uptime = bytes.readUInt16LE(4) >> 6;
    decoded.push({ variable: "uptime", value: uptime, unit: "weeks" });
    // battery used
    const battery = bytes.readUInt16LE(6) & 0x03ff;
    decoded.push({ variable: "battery_used", value: battery * 2, unit: "mAh" });
    // percentage used on LoRaWAN
    const p_lorawan = bytes.readUInt8(7) >> 2;
    decoded.push({ variable: "percentage_used_lorawan", value: p_lorawan * 1.5625, unit: "%" });
    // percentage used on GNSS
    const p_gnss = bytes.readUInt8(8) & 0x3f;
    decoded.push({ variable: "percentage_used_gnss", value: p_gnss * 1.5625, unit: "%" });
    // percentage used on WiFi
    const p_wifi = (bytes.readUInt16LE(8) >> 6) & 0x3f;
    decoded.push({ variable: "percentage_used_wifi", value: p_wifi * 1.5625, unit: "%" });
    // percentage used sleeping
    const p_sleep = (bytes.readUInt16LE(9) >> 4) & 0x3f;
    decoded.push({ variable: "percentage_used_sleeping", value: p_sleep * 1.5625, unit: "%" });
    // percentage used on battery self discharge
    const p_discharge = bytes.readUInt8(10) >> 2;
    decoded.push({ variable: "percentage_used_battery_self_discharge", value: p_discharge * 1.5625, unit: "%" });
  } else if (port === 5) {
    // Number of WiFi access points N (0-31)
    const number_wifi_points = bytes.readUInt8(0) & 0x1f;
    decoded.push({ variable: "number_of_wifi_access_points", value: number_wifi_points });
    // In-trip
    const intrip = (bytes.readUInt8(0) >> 5) & 0x01;
    decoded.push({ variable: "in_trip", value: intrip });
    // Inactivity Indicator
    const inactivity = (bytes.readUInt8(0) >> 6) & 0x01;
    decoded.push({ variable: "inactivity_indicator", value: inactivity });
    // RFU
    // Timestamp in NAV message (if present)
    const timestamp_nav_message = (bytes.readUInt8(1) >> 2) & 0x01;
    decoded.push({ variable: "timestamp_in_nav_message", value: timestamp_nav_message });
    // position assistance sequence number
    const sequence_number = bytes.readUInt8(1) >> 3;
    decoded.push({ variable: "sequence_number", value: sequence_number });
    // ACCESS POINTS
    for (let i = 1, j = 0; i <= number_wifi_points; ++i, ++j) {
      // Access point X, RSSI, in dBm (signed)
      const rssi = bytes.readInt8(2 + 7 * j);
      decoded.push({ variable: `rssi${i}`, value: rssi, unit: "dBm" });
      // Access point X, MAC address
      const mac = bytes
        .readUIntBE(3 + 7 * j, 6)
        .toString(16)
        .toUpperCase();
      decoded.push({ variable: `mac${i}`, value: mac });
    }
    // Semtech format GNSS NAV message (optional)
    if (bytes.length > 7 * number_wifi_points + 2) {
      const start = 7 * number_wifi_points + 2;
      const semtech_nav_message = bytes
        .slice(start, start + 8)
        .toString("hex")
        .toUpperCase();
      decoded.push({ variable: "semtech_nav_message", value: semtech_nav_message });
    }
  }
  return decoded;
}

// let payload = [
//   { variable: "payload", value: "22E09DAC86749221DB0A48C09342A0CA01961B2230217E03" },
//   { variable: "port", value: 5 },
// ];
// let payload = [
//   { variable: "payload", value: "7A4A031234013B05030A00" },
//   { variable: "port", value: 3 },
// ];
// let payload = [
//   { variable: "payload", value: "D30102560107220305" },
//   { variable: "port", value: 2 },
// ];
// let payload = [
//   { variable: "payload", value: "010A56010203017A220305" },
//   { variable: "port", value: 1 },
// ];

const data = payload.find((x) => x.variable === "payload" || x.variable === "payload_raw" || x.variable === "data");
const port = payload.find((x) => x.variable === "fport" || x.variable === "port");

if (data && port) {
  const serie = data.serie || new Date().getTime();
  const bytes = Buffer.from(data.value, "hex");
  payload = payload.concat(Decoder(bytes, Number(port.value))).map((x) => ({ ...x, serie }));
}