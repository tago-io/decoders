/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it has been sent from the device
 * @param {number} input.fPort - The Port Field on which the uplink has been sent
 * @param {Date} input.recvTime - The uplink message time recorded by the LoRaWAN network server
 */ function hotDropDecoder(input) {
  const data = [];
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
      value: result.errors
    });
    delete result.data;
    // return result;
    return data;
  }
  // Packet ID - 1 byte
  const packetId = raw[0];
  if (packetId !== 50) {
    result.errors.push("Payload packet ID is not equal to 50");
    data.push({
      variable: "parse_error",
      value: result.errors
    });
    delete result.data;
    // return result;
    return data;
  }
  // Constant factors for formulas
  const capacitorVoltageFactor = 5.0 / 255.0;
  const temperatureCelsiusFactor = 120.0 / 255.0;
  const deciToUnitFactor = 0.1;
  // Amp hour accumulation - 4 bytes
  // 32-bit unsigned integer in network byte order (MSB/BE) reported in deci-ampere-hour (dAh)
  const ampHourAccumulationDeciAmpere = raw.readUInt32BE(1);
  // Average amps - 2 bytes
  // 16-bit unsigned integer in network byte order (MSB/BE) reported in deci-ampere (dA),
  // this average represents the entire time since the last transmit (one entire transmit period)
  const averageAmpsDeciAmpere = raw.readUInt16BE(5);
  // Max Offset - 1 byte
  // 8-bit unsigned integer representing the percent offset above the Average amps value.
  const maxOffset = raw[7];
  // Min Offset - 1 byte
  // 8-bit unsigned integer representing the percent offset below the Average amps value.
  const minOffset = raw[8];
  // Capacitor Voltage Scalar - 1 byte
  // 8-bit unsigned integer representing the capacitor voltage.
  // (as if the integer range from 0-255 is scaled to between 0.0V and 5.0V)
  const capacitorVoltageScalar = raw[9];
  // Temperature Scalar
  // 8-bit unsigned integer representing the temperature.
  // (as if the integer range from 0-255 is scaled to between -40C and 80C)
  const temperatureScalar = raw[10];
  // Calculated fields
  const maximumAmpsDeciAmpere = averageAmpsDeciAmpere * ((100 + maxOffset) / 100.0);
  const minimumAmpsDeciAmpere = averageAmpsDeciAmpere * ((100 - minOffset) / 100.0);
  const capacitorVoltage = capacitorVoltageFactor * capacitorVoltageScalar;
  const temperatureCelsius = temperatureCelsiusFactor * temperatureScalar - 40;
  // if (minimumAmpsDeciAmpere < 0) {
  //   result.warnings.push("Minimum amps is less than 0.");
  //   data.push({ variable: "warning", value: result.warnings.toString() });
  // }
  // if (capacitorVoltage < 3.4) {
  //   result.warnings.push("Low capacitor voltage may reduce transmit interval.");
  //   data.push({ variable: "warning", value: result.warnings.toString() });
  // }
  result.data = {
    ampHourAccumulation: ampHourAccumulationDeciAmpere * deciToUnitFactor,
    averageAmps: averageAmpsDeciAmpere * deciToUnitFactor,
    maximumAmps: maximumAmpsDeciAmpere * deciToUnitFactor,
    minimumAmps: minimumAmpsDeciAmpere * deciToUnitFactor,
    capacitorVoltage: capacitorVoltage,
    temperatureCelsius: temperatureCelsius
  };
  data.push({
    variable: "amp_hour_accumulation",
    value: result.data.ampHourAccumulation
  });
  data.push({
    variable: "average_amps",
    value: result.data.averageAmps,
    metadata: {
      max_amps: result.data.maximumAmps,
      min_amps: result.data.minimumAmps
    }
  });
  data.push({
    variable: "capacitor_voltage",
    value: result.data.capacitorVoltage
  });
  data.push({
    variable: "temperature",
    value: result.data.temperatureCelsius,
    unit: "C"
  });
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
    const decodedhotDropPayload = hotDropDecoder(payload_raw.value);
    const signalData = getSignalData(payload);
    payload = payload.concat(decodedhotDropPayload, signalData);
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

