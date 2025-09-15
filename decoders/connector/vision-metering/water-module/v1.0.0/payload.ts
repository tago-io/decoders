/**
 * Water Meter Device Payload Parser for TagoIO
 * Handles 3 packet types: Startup, Periodic and Reed Switch
 */

// Packet type constants
const PACKET_TYPES: any = {
  0: "startup",
  1: "periodic",
  2: "reed_switch",
  3: "reserved",
  4: "reserved",
  5: "reserved",
  6: "reserved",
  7: "reserved",
};

// Reset reason bit flags
const RESET_REASONS: any = {
  0: "Reset pin",
  1: "Watchdog",
  2: "Soft reset",
  3: "CPU lockup",
  16: "System off GPIO (woken from deepsleep via magnetic reed switch)",
};

/**
 * Parses the header byte to extract packet information
 */
function parseHeader(headerByte: number) {
  return {
    packetType: headerByte & 0x07, // Bits 0-2: packet type (3 bits)
    multiPacket: (headerByte >> 3) & 0x01, // Bit 3: multi packet flag (1 bit)
    packetNumber: (headerByte >> 4) & 0x0f, // Bits 4-7: packet number (4 bits)
  };
}

/**
 * Converts battery voltage from hex to actual voltage
 */
function parseBatteryVoltage(buffer: Buffer, offset: number) {
  const rawValue = buffer.readUInt8(offset); // Read single byte instead of 2 bytes
  // Formula: (raw_value + 110) / 100 to convert to voltage
  return ((rawValue + 110) / 100).toFixed(2);
}

/**
 * Parses consumption value from 4-byte big-endian format
 */
function parseConsumption(buffer: Buffer, offset: number) {
  return buffer.readUInt32BE(offset);
}

/**
 * Parses reset reason from 4-byte value
 */
function parseResetReason(buffer: Buffer, offset: number) {
  const resetValue = buffer.readUInt32BE(offset);
  const reasons: string[] = [];

  for (let bit = 0; bit < 32; bit++) {
    if ((resetValue >> bit) & 1) {
      if (RESET_REASONS[bit]) {
        reasons.push(RESET_REASONS[bit]);
      }
    }
  }

  return reasons.length > 0 ? reasons : ["Unknown"];
}

/**
 * Extracts null-terminated string from buffer
 */
function parseNullTerminatedString(buffer: Buffer, offset: number) {
  let end = offset;
  while (end < buffer.length && buffer[end] !== 0) {
    end++;
  }
  return buffer.slice(offset, end).toString("utf8");
}

/**
 * Parses meter alert hex string into readable status with metadata
 */
function parseMeterAlert(alertHex: string) {
  if (!alertHex || alertHex.length !== 8) {
    return { type: "Invalid", metadata: {} };
  }
  
  // Alert type mappings based on hex codes from the specification
  const alertTypes: Record<string, { name: string; currentError: boolean; continuousError: boolean; historicalError: boolean }> = {
    "00000001": { name: "Checksum", currentError: false, continuousError: true, historicalError: false },

    "00000020": { name: "Backflow volume", currentError: false, continuousError: true, historicalError: false },
    "00200000": { name: "Backflow volume", currentError: false, continuousError: false, historicalError: true },

    "00000002": { name: "Hardware flow", currentError: false, continuousError: true, historicalError: false },
    "00040000": { name: "Hardware flow", currentError: false, continuousError: false, historicalError: true },

    "00000400": { name: "Undersized meter", currentError: true, continuousError: false, historicalError: false },
    "00000010": { name: "Undersized meter", currentError: false, continuousError: true, historicalError: false },
    "00100000": { name: "Undersized meter", currentError: false, continuousError: false, historicalError: true },

    "00001000": { name: "No Usage", currentError: true, continuousError: false, historicalError: false },
    "01000000": { name: "No Usage", currentError: false, continuousError: false, historicalError: true },

    "00000080": { name: "Measurement interference", currentError: false, continuousError: true, historicalError: false },
    "02000000": { name: "Measurement interference", currentError: false, continuousError: false, historicalError: true },

    "00000800": { name: "Air in pipe", currentError: true, continuousError: false, historicalError: false },

    "00000004": { name: "Hardware temperature", currentError: false, continuousError: true, historicalError: false },

    "00004000": { name: "High medium temperature", currentError: true, continuousError: false, historicalError: false },
    "00000200": { name: "High medium temperature", currentError: false, continuousError: true, historicalError: false },
    "08000000": { name: "High medium temperature", currentError: false, continuousError: false, historicalError: true },

    "00002000": { name: "Freezing risk", currentError: true, continuousError: false, historicalError: false },
    "00000100": { name: "Freezing risk", currentError: false, continuousError: true, historicalError: false },
    "04000000": { name: "Freezing risk", currentError: false, continuousError: false, historicalError: true },

    "00020000": { name: "Low battery", currentError: true, continuousError: false, historicalError: false },

    "00008000": { name: "Too much communication", currentError: true, continuousError: false, historicalError: true },

    "00000008": { name: "Leakage Detection", currentError: false, continuousError: true, historicalError: false },
    "00080000": { name: "Leakage Detection", currentError: false, continuousError: false, historicalError: true },

    "00000040": { name: "Fallback mode - Only for HYDRUS 2.0 Bulk", currentError: false, continuousError: true, historicalError: false },
    "00400000": { name: "Fallback mode - Only for HYDRUS 2.0 Bulk", currentError: false, continuousError: false, historicalError: true },

    "00010000": { name: "Metrological log access", currentError: true, continuousError: false, historicalError: false },
  };

  // Direct mapping lookup
  if (alertTypes[alertHex]) {
    const alertInfo = alertTypes[alertHex];
    return {
      type: alertInfo.name,
      metadata: {
        "Current Error": alertInfo.currentError,
        "Continuous Error": alertInfo.continuousError,
        "Historical Error": alertInfo.historicalError,
        "Raw Value": alertHex
      }
    };
  }

  // Default case
  return {
    type: "Unknown Alert",
    metadata: {
      "Current Error": false,
      "Continuous Error": false,
      "Historical Error": false,
      "Raw Value": alertHex
    }
  };
}

/**
 * Parses startup packet (type 0)
 */
function parseStartupPacket(buffer: Buffer, group: string, time: string) {
  const data: DataCreate[] = [];
  // Battery voltage (offset 1, 2 bytes)
  const batteryVolt = parseBatteryVoltage(buffer, 1);
  data.push({
    variable: "battery_voltage",
    value: parseFloat(batteryVolt),
    unit: "V",
    group,
    time,
    metadata: { packet_type: "startup" },
  });

  // Reset reason (offset 2, 4 bytes)
  if (buffer.length >= 6) {
    const resetReasons = parseResetReason(buffer, 2);
    data.push({
      variable: "reset_reason",
      value: resetReasons.join(", "),
      group,
      time,
      metadata: { packet_type: "startup", reset_code: buffer.readUInt32BE(2) },
    });
  }

  // Reboot counter (offset 6, 4 bytes)
  if (buffer.length >= 10) {
    const rebootCounter = buffer.readUInt32BE(6);
    data.push({
      variable: "reboot_counter",
      value: rebootCounter,
      group,
      time,
      metadata: { packet_type: "startup" },
    });
  }

  // Firmware version (offset 10, 3 bytes)
  if (buffer.length >= 13) {
    const major = buffer[10];
    const minor = buffer[11];
    const patch = buffer[12];
    const firmwareVersion = `${major}.${minor}.${patch}`;
    data.push({
      variable: "firmware_version",
      value: firmwareVersion,
      group,
      time,
      metadata: { packet_type: "startup" },
    });
  }

  return data;
}

/**
 * Parses periodic packet (type 1)
 */
function parsePeriodicPacket(buffer: Buffer, group: string, time: string) {
  const data: DataCreate[] = [];

  // Battery voltage (offset 1, 2 bytes)
  const batteryVolt = parseBatteryVoltage(buffer, 1);
  data.push({
    variable: "battery_voltage",
    value: parseFloat(batteryVolt),
    unit: "V",
    group,
    time,
    metadata: { packet_type: "periodic" },
  });

  for (let i = 0; i < 6; i++) {
    const offset = 2 + i * 4; // Start at offset 2, each consumption is 4 bytes
    if (offset + 3 < buffer.length) {
      const consumption = parseConsumption(buffer, offset);

      // Calculate time by subtracting hours from current time
      const currentTime = new Date(time);
      const adjustedTime = new Date(currentTime.getTime() - i * 60 * 60 * 1000); // Subtract i hours

      data.push({
        variable: "consumption_now",
        value: consumption,
        unit: "L",
        group: adjustedTime.toISOString(),
        time: adjustedTime.toISOString(),
        metadata: {
          packet_type: "periodic",
          hours_ago: i,
        },
      });
    }
  }

  // Alert string (if present, null-terminated)
  if (buffer.length > 26) {
    const alertString = parseNullTerminatedString(buffer, 26);
    if (alertString.length > 0) {
      const alertInfo = parseMeterAlert(alertString);
      data.push({
        variable: "meter_alert",
        value: alertInfo.type,
        group,
        time,
        metadata: { 
          packet_type: "periodic",
          ...alertInfo.metadata
        },
      });
    }
  }

  return data;
}

/**
 * Parses reed switch packet (type 2)
 */
function parseReedSwitchPacket(buffer: Buffer, group: string, time: string) {
  const data: DataCreate[] = [];

  // Battery voltage (offset 1, 2 bytes)
  const batteryVolt = parseBatteryVoltage(buffer, 1);
  data.push({
    variable: "battery_voltage",
    value: parseFloat(batteryVolt),
    unit: "V",
    group,
    time,
    metadata: { packet_type: "reed_switch" },
  });

  // Current consumption (offset 2, 4 bytes)
  const consumption = parseConsumption(buffer, 2);
  data.push({
    variable: "consumption_current",
    value: consumption,
    unit: "L",
    group,
    time,
    metadata: { packet_type: "reed_switch" },
  });

  // Firmware version (offset 6, 3 bytes for Reed Switch)
  const major = buffer[6];
  const minor = buffer[7];
  const patch = buffer[8];
  const firmwareVersion = `${major}.${minor}.${patch}`;
  data.push({
    variable: "firmware_version",
    value: firmwareVersion,
    group,
    time,
    metadata: { packet_type: "reed_switch" },
  });

  // Alert string (if present, null-terminated, starts around offset 11)
  let currentOffset = 11;
  if (currentOffset < buffer.length) {
    const alertString = parseNullTerminatedString(buffer, currentOffset);
    if (alertString.length > 0) {
      const alertInfo = parseMeterAlert(alertString);
      data.push({
        variable: "meter_alert",
        value: alertInfo.type,
        group,
        time,
        metadata: { 
          packet_type: "reed_switch",
          ...alertInfo.metadata
        },
      });
      currentOffset += alertString.length + 1; // +1 for null terminator
    }
  }

  // Meter identifier (if present, null-terminated)
  if (currentOffset < buffer.length) {
    const meterIdentifier = parseNullTerminatedString(buffer, currentOffset);
    if (meterIdentifier.length > 0) {
      data.push({
        variable: "meter_identifier",
        value: meterIdentifier,
        group,
        time,
        metadata: { packet_type: "reed_switch" },
      });
    }
  }

  return data;
}

/**
 * Main payload parser function
 */
function parseWaterMeterPayload(buffer: Buffer, group: string, time: string) {
  try {
    if (buffer.length < 1) {
      return [
        {
          variable: "parser_error",
          value: "Payload too short: minimum 1 byte required for header",
          time: time || new Date().toISOString(),
        },
      ];
    }

    // Parse header
    const header = parseHeader(buffer[0]);

    const packetTypeName = PACKET_TYPES[header.packetType] || "unknown";

    // Add header information
    const data: DataCreate[] = [
      {
        variable: "packet_type",
        value: packetTypeName,
        group,
        time,
        metadata: {
          packet_number: header.packetNumber,
          multi_packet: header.multiPacket === 1,
          header_byte: buffer[0].toString(16).padStart(2, "0"),
        },
      },
    ];

    // Parse based on packet type
    let parsedData: DataCreate[] = [];
    switch (header.packetType) {
      case 0: // Startup
        parsedData = parseStartupPacket(buffer, group, time);
        break;
      case 1: // Periodic
        parsedData = parsePeriodicPacket(buffer, group, time);
        break;
      case 2: // Reed switch
        parsedData = parseReedSwitchPacket(buffer, group, time);
        break;
      default:
        parsedData = [
          {
            variable: "parser_warning",
            value: `Unknown packet type: ${header.packetType}`,
            group,
            time,
          },
        ];
    }

    return data.concat(parsedData);
  } catch (error) {
    return [
      {
        variable: "parser_error",
        value: `Payload parsing failed: ${error.message}`,
        time: time || new Date().toISOString(),
      },
    ];
  }
}

const dataPayload = payload.find((x) => x.variable === "payload")?.value;

if (dataPayload) {
  const group = dataPayload.group || new Date().getTime().toString();
  const time = dataPayload.time || new Date().toISOString();
  const hexData = Buffer.from(dataPayload, "hex");
  const parsedData = parseWaterMeterPayload(hexData, group, time);

  payload = payload.concat(parsedData);
}
