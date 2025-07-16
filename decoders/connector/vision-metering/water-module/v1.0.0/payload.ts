/**
 * Water Meter Device Payload Parser for TagoIO
 * Handles 3 packet types: Startup, Periodic and Reed Switch
 */

import { DataCreate } from "@tago-io/sdk/lib/types";

// Packet type constants
const PACKET_TYPES = {
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
 * @param {number} headerByte - The header byte from the payload
 * @returns {Object} Parsed header information
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
 * @param {Buffer} buffer - Buffer containing voltage data
 * @param {number} offset - Offset in buffer
 * @returns {number} Voltage in volts
 */
function parseBatteryVoltage(buffer: Buffer, offset: number) {
  const rawValue = buffer.readUInt8(offset); // Read single byte instead of 2 bytes
  // Formula: (raw_value + 110) / 100 to convert to voltage
  return ((rawValue + 110) / 100).toFixed(2);
}

/**
 * Parses consumption value from 4-byte big-endian format
 * @param {Buffer} buffer - Buffer containing consumption data
 * @param {number} offset - Offset in buffer
 * @returns {number} Consumption value
 */
function parseConsumption(buffer: Buffer, offset: number) {
  return buffer.readUInt32BE(offset);
}

/**
 * Parses reset reason from 4-byte value
 * @param {Buffer} buffer - Buffer containing reset reason
 * @param {number} offset - Offset in buffer
 * @returns {Array} Array of active reset reasons
 */
function parseResetReason(buffer: Buffer, offset: number) {
  const resetValue = buffer.readUInt32BE(offset);
  const reasons = [];

  for (let bit = 0; bit < 32; bit++) {
    if ((resetValue >> bit) & 1) {
      if (RESET_REASONS[bit]) {
        reasons.push(RESET_REASONS[bit]);
      }
    }
  }

  console.log("resetValue", resetValue);

  return reasons.length > 0 ? reasons : ["Unknown"];
}

/**
 * Extracts null-terminated string from buffer
 * @param {Buffer} buffer - Buffer containing string data
 * @param {number} offset - Starting offset
 * @returns {string} Extracted string
 */
function parseNullTerminatedString(buffer: Buffer, offset: number) {
  let end = offset;
  while (end < buffer.length && buffer[end] !== 0) {
    end++;
  }
  return buffer.slice(offset, end).toString("utf8");
}

/**
 * Parses startup packet (type 0)
 * @param {Buffer} buffer - Payload buffer
 * @param {string} group - Group identifier
 * @param {string} time - Timestamp
 * @returns {Array} Array of data objects
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
 * @param {Buffer} buffer - Payload buffer
 * @param {string} group - Group identifier
 * @param {string} time - Timestamp
 * @returns {Array} Array of data objects
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

  // Consumption values (6 readings, 4 bytes each)
  const consumptionLabels = [
    "consumption_now",
    "consumption_1h_ago",
    "consumption_2h_ago",
    "consumption_3h_ago",
    "consumption_4h_ago",
    "consumption_5h_ago",
  ];

  for (let i = 0; i < 6; i++) {
    const offset = 2 + i * 4; // Start at offset 2, each consumption is 4 bytes
    if (offset + 3 < buffer.length) {
      const consumption = parseConsumption(buffer, offset);

      // Calculate time by subtracting hours from current time
      const currentTime = new Date(time);
      const adjustedTime = new Date(currentTime.getTime() - i * 60 * 60 * 1000); // Subtract i hours

      data.push({
        variable: consumptionLabels[i],
        value: consumption,
        unit: "L",
        group,
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
      data.push({
        variable: "meter_alert",
        value: alertString,
        group,
        time,
        metadata: { packet_type: "periodic" },
      });
    }
  }

  return data;
}

/**
 * Parses reed switch packet (type 2)
 * @param {Buffer} buffer - Payload buffer
 * @param {string} group - Group identifier
 * @param {string} time - Timestamp
 * @returns {Array} Array of data objects
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
      data.push({
        variable: "meter_alert",
        value: alertString,
        group,
        time,
        metadata: { packet_type: "reed_switch" },
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
 * @param {string} hexPayload - Hexadecimal payload string
 * @param {string} group - Group identifier
 * @param {string} time - Timestamp
 * @returns {Array} Array of parsed data objects
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
        console.log("Startup");
        parsedData = parseStartupPacket(buffer, group, time);
        break;
      case 1: // Periodic
        console.log("Periodic");
        parsedData = parsePeriodicPacket(buffer, group, time);
        break;
      case 2: // Reed switch
        console.log("Reed switch");
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
  const group = dataPayload.group || new Date().getTime();
  const time = dataPayload.time || new Date().toISOString();
  const hexData = Buffer.from(dataPayload, "hex");
  const parsedData = parseWaterMeterPayload(hexData, group, time);

  payload = payload.concat(parsedData);
}
