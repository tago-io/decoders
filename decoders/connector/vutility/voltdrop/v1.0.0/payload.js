/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it has been sent from the device
 * @param {number} input.fPort - The Port Field on which the uplink has been sent
 * @param {Date} input.recvTime - The uplink message time recorded by the LoRaWAN network server
 */ function voltDropDecoder(input) {
  const data = [];
  const packetList = {
    VD_DIRECT_VOLTAGE_PF: 40,
    VD_DIRECT_AMPERAGE: 41,
    VD_DIRECT_ACT_ENERGY_CONF: 42,
    VD_DIRECT_ACT_ENERGY_UNCONF: 43,
    VD_DIRECT_APP_ENERGY_CONF: 44,
    VD_DIRECT_APP_ENERGY_UNCONF: 45,
    VD_DIRECT_STARTUP_DIAG: 46,
    VD_DIRECT_OPERATIONAL_DIAG: 47
  };
  // Constant factors for formulas
  const capacitorVoltageFactor = 5.0 / 255.0;
  const temperatureCelsiusFactor = 120.0 / 255.0;
  let result = {
    data: {},
    errors: [],
    warnings: []
  };
  const raw = Buffer.from(input, "hex");
  // Uplink payload must be 11 bytes long.
  if (raw.byteLength != 11) {
    result.errors.push("Payload length must be 11 bytes");
    data.push({
      variable: "parse_error",
      value: "Payload length must be 11 bytes"
    });
    delete result.data;
    // return result;
    return data;
  }
  // Packet ID - 1 byte
  const packetId = raw[0];
  switch (packetId) {
    case packetList.VD_DIRECT_VOLTAGE_PF:
      result.data = {
        // Average Phase Voltages - 2 bytes each
        // 16-bit unsigned integers in network byte order (MSB/BE) with 10 integer and 6 fractional bits
        voltageL1: raw.readUInt16BE(1) / 64.0,
        voltageL2: raw.readUInt16BE(3) / 64.0,
        voltageL3: raw.readUInt16BE(5) / 64.0,
        // Phase Power Factors - 1 byte each, 8-bit signed integers as percentage
        powerFactorL1: raw.readInt8(7),
        powerFactorL2: raw.readInt8(8),
        powerFactorL3: raw.readInt8(9),
        // Capacitor Voltage Scalar - 1 byte
        // 8-bit unsigned integer representing the capacitor voltage.
        // (as if the integer range from 0-255 is scaled to between 0.0V and 5.0V)
        capacitorVoltage: raw[10] * capacitorVoltageFactor
      };
      // TagoIO Format Insertion
      data.push({
        variable: "voltage",
        value: `${result.data.voltageL1},${result.data.voltageL2},${result.data.voltageL3}`,
        metadata: {
          voltageL1: result.data.voltageL1,
          voltageL2: result.data.voltageL2,
          voltageL3: result.data.voltageL3
        }
      });
      data.push({
        variable: "power_factor",
        value: `${result.data.powerFactorL1},${result.data.powerFactorL2},${result.data.powerFactorL3}`,
        metadata: {
          powerFactorL1: result.data.powerFactorL1,
          powerFactorL2: result.data.powerFactorL2,
          powerFactorL3: result.data.powerFactorL3
        }
      });
      // data.push({
      //     variable: "capacitor_voltage",
      //     value: String(result.data.capacitorVoltage)
      // });
      break;
    case packetList.VD_DIRECT_AMPERAGE:
      let currentL1 = raw.readUInt16BE(1) / 16.0;
      let currentL2 = raw.readUInt16BE(3) / 16.0;
      let currentL3 = raw.readUInt16BE(5) / 16.0;
      result.data = {
        // Average Phase Current - 2 bytes each
        // 16-bit unsigned integers in network byte order (MSB/BE) with 12 integer and 4 fractional bits
        currentL1: currentL1,
        currentL2: currentL2,
        currentL3: currentL3,
        // Maximum Phase Current - 1 byte each
        // 8-bit unsigned integer with 3 integer and 5 fractional bits (expressed as percentage in addition to 100%)
        maxCurrentL1: (raw[7] / 32.0 + 1.0) * currentL1,
        maxCurrentL2: (raw[8] / 32.0 + 1.0) * currentL2,
        maxCurrentL3: (raw[9] / 32.0 + 1.0) * currentL3,
        // Temperature Scalar
        // 8-bit unsigned integer representing the temperature.
        // (as if the integer range from 0-255 is scaled to between -40C and 80C)
        temperatureCelsius: raw[10] * temperatureCelsiusFactor - 40.0
      };
      // TagoIO Format Insertion
      data.push({
        variable: "current",
        value: `${result.data.currentL1},${result.data.currentL2},${result.data.currentL3}`,
        metadata: {
          currentL1: result.data.currentL1,
          currentL2: result.data.currentL2,
          currentL3: result.data.currentL3
        }
      });
      data.push({
        variable: "max_current",
        value: `${result.data.maxCurrentL1},${result.data.maxCurrentL2},${result.data.maxCurrentL3}`,
        metadata: {
          maxCurrentL1: result.data.maxCurrentL1,
          maxCurrentL2: result.data.maxCurrentL2,
          maxCurrentL3: result.data.maxCurrentL3
        }
      });
      data.push({
        variable: "temperature",
        value: result.data.temperatureCelsius,
        unit: "C"
      });
      break;
    case packetList.VD_DIRECT_ACT_ENERGY_CONF:
    case packetList.VD_DIRECT_ACT_ENERGY_UNCONF:
      result.data = {
        // Total Forward Active Energy - 8 bytes
        // Sum of all phases active energy accumulated in Watt-Hours since last factory reset downlink.
        // 64-bit unsigned integer in network byte order (MSB/BE)
        //
        // NOTE: Due to the limitations of Javascript and JSON this codec only uses 53 bits
        // (max of standard number type) This still gives an effective range of 102,821 years
        // at 10 Mega-Watts which is more than the Voltdrop is reasonably capable of measuring.
        // Test and truncate the BigInt type into a normal number for JSON compatibility to the
        // ES5 version of the codec.
        activeEnergyAccumulation: Number(BigInt.asUintN(53, raw.readBigUInt64BE(1))),
        // Average Power Factor over all Phases - 2 bytes
        // 16-bit signed integer in network byte order (MSB/BE) expressed as percentage with 8 integer and 7 fractional bits
        averagePowerFactor: raw.readInt16BE(9) / 128.0
      };
      // TagoIO Format Insertion
      data.push({
        variable: "active_energy",
        value: result.data.activeEnergyAccumulation
      });
      data.push({
        variable: "average_power_factor",
        value: result.data.averagePowerFactor
      });
      break;
    case packetList.VD_DIRECT_APP_ENERGY_CONF:
    case packetList.VD_DIRECT_APP_ENERGY_UNCONF:
      result.data = {
        // Total Forward Active Energy - 8 bytes
        // Sum of all phases active energy accumulated in Watt-Hours since last factory reset downlink.
        // 64-bit unsigned integer in network byte order (MSB/BE)
        //
        // NOTE: See info about activeEnergyAccumulation and 53 bit numeric limitation
        apparentEnergyAccumulation: Number(BigInt.asUintN(53, raw.readBigUInt64BE(1))),
        // Average Power Factor over all Phases - 2 bytes
        // 16-bit signed integer in network byte order (MSB/BE) expressed as percentage with 8 integer and 7 fractional bits
        averagePowerFactor: raw.readInt16BE(9) / 128.0
      };
      //TagoIO Format Insertion
      data.push({
        variable: "apparent_energy",
        value: result.data.apparentEnergyAccumulation,
      });
      data.push({
        variable: "average_power_factor",
        value: result.data.averagePowerFactor
      });
      break;
    case packetList.VD_DIRECT_STARTUP_DIAG:
      let resetReason = "Invalid";
      switch (raw.readUInt8(1)) {
        case 0:
          resetReason = "Power Loss";
          break;
        case 1:
          resetReason = "Hardware Reset";
          break;
        case 2:
          resetReason = "Watchdog Timer";
          break;
        case 3:
          resetReason = "Software Request";
          break;
        case 4:
          resetReason = "CPU Lock-Up";
          break;
      }
      // Format hashes to hexadecimal and pad to correct length if leading zeroes are needed
      let coreFirmwareHash = raw.readUInt32BE(2).toString(16).toUpperCase();
      coreFirmwareHash = "0".repeat(Math.max(0, 8 - coreFirmwareHash.length)) + coreFirmwareHash;
      let readerFirmwareHash = raw.readUInt16BE(6).toString(16).toUpperCase();
      readerFirmwareHash = "0".repeat(Math.max(0, 4 - readerFirmwareHash.length)) + readerFirmwareHash;
      result.data = {
        resetReason: resetReason,
        coreFirmwareHash: "0x" + coreFirmwareHash,
        readerFirmwareHash: "0x" + readerFirmwareHash
      };
      break;
    case packetList.VD_DIRECT_OPERATIONAL_DIAG:
      const systemErrorConditionsList = [
        "Invalid Downlink",
        "Core Voltage Drop",
        "EEPROM Fail",
        "Reader Timeout",
        "Reader NACK",
        "Reader Overvoltage",
        "Reader Not Calibrated",
        "Phase Sequence Error"
      ];
      let rawErrorConditions = raw.readUInt16BE(1);
      let systemErrorConditions = [];
      for (let idx = 0; idx < systemErrorConditionsList.length; idx++) {
        if (rawErrorConditions & 1 << idx) {
          systemErrorConditions.push(systemErrorConditionsList[idx]);
        }
      }
      result.data = {
        systemErrorConditions: systemErrorConditions,
        registerID: "0x" + raw.readUInt16BE(3).toString(16).toUpperCase()
      };
      // TagoIO Format Insertion
      // map the systemerrorconditions
      const metadata = systemErrorConditionsList.reduce((acc, curr) => {
        acc[curr.replaceAll(" ", "_").toLowerCase()] = systemErrorConditions.includes(curr);
        return acc;
      }, {});
      data.push({
        variable: "system_error_conditions",
        value: systemErrorConditions.toString(),
        metadata
      });
      break;
    default:
      result.errors.push("Unsupported packet ID");
      data.push({
        variable: "parse_error",
        value: "Unsupported packet ID"
      });
      delete result.data;
      return result;
  }
  //return result;
  return data;
}

function getSignalData(originalPayload) {

  const snr = originalPayload.find((x) => x.variable === "snr")?.value;
  const rssi = originalPayload.find((x) => x.variable === "rssi")?.value;
  const spreadingFactor = originalPayload.find((x) => x.variable === "lora_spreading_factor")?.value;
  let signalRating = "Unknown";
  let qualityScore = undefined;

  if (snr && rssi && spreadingFactor) {
    if (spreadingFactor === 7) {
      qualityScore = ((snr + 7.5) / 17.5) * 100;
    } else if (spreadingFactor === 8) {
      qualityScore = ((snr + 10) / 20) * 100;
    } else if (spreadingFactor === 9) {
      qualityScore = ((snr + 12.5) / 22.5) * 100;
    } else if (spreadingFactor === 10) {
      qualityScore = ((snr + 15) / 25) * 100;
    } else {
      qualityScore = 0;
    }

    qualityScore = Math.min(Math.max(qualityScore, 0), 100);

    if (qualityScore >= 80) {
      signalRating = "Excellent";
    } else if (qualityScore >= 60) {
      signalRating = "Good";
    } else if (qualityScore >= 40) {
      signalRating = "Fair";
    } else if (qualityScore >= 20) {
      signalRating = "Poor";
    } else {
      signalRating = "Critical";
    }
    return [
      {
        variable: "signal_strength",
        value: rssi.value,
        time: rssi.time,
        metadata: {
          rssi: rssi.value,
          snr: snr,
          spreading_factor: spreadingFactor,
          quality_score: qualityScore,
          signal_rating: signalRating
        }
      }
    ];
  }
  return [];
}


const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
if (payload_raw) {
  try {
    const decodedPayload = voltDropDecoder(payload_raw.value);
    const signalData = getSignalData(payload);
    payload = payload.concat(decodedPayload, signalData);
  } catch (error) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [
      {
        variable: "parse_error",
        value: error.message
      }
    ];
  }
}

