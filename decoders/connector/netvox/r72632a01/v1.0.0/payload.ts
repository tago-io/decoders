/**
 * Configuration command mapping
 */
function getCfgCmd(cfgcmd: number) {
  const cfgcmdlist: Record<number, string> = {
    0x01: "ConfigReportReq",
    0x81: "ConfigReportRsp",
    0x02: "ReadConfigReportReq",
    0x82: "ReadConfigReportRsp"
  };
  return cfgcmdlist[cfgcmd];
}

/**
 * Device name mapping
 */
function getDeviceName(dev: number) {
  const deviceName = {
    0x05: "RA07 Series",
    0x09: "R726 Series",
    0x0D: "RA07**Y Series",
    0x52: "RA07A",
    0x53: "R726A",
    0x54: "R727A",
    0x57: "R718PA",
    0x58: "R718PB"
  };
  return deviceName[dev];
}

/**
 * Check if sensor value exists (not 0xFF, 0xFFFF, or 0xFFFFFFFF)
 */
function checkSensorExist(val: number) {
  if ((val === 0xFF) || (val === 0xFFFF) || (val === 0xFFFFFFFF)) {
    return null; // Return null instead of -1 for TagoIO compatibility
  }
  return val;
}

/**
 * Pad string with leading zeros
 */
function padLeft(str: string, len: number) {
  str = '' + str;
  if (str.length >= len) {
    return str;
  } else {
    return padLeft("0" + str, len);
  }
}

/**
 * Parse environmental sensor data based on sensor type
 */
function parseSensorData(sensorType: number, bytes: number[], group: string, time: string) {
  const data: any[] = [];
  
  const retSensorVal1 = checkSensorExist(bytes[4] << 8 | bytes[5]);
  const retSensorVal2 = checkSensorExist(bytes[6] << 8 | bytes[7]);
  const retSensorVal3 = checkSensorExist(bytes[8] << 8 | bytes[9]);

  switch (sensorType) {
    case 0x01:
    case 0x02:
      if (retSensorVal1 !== null) {
        data.push({ variable: "pm1_0", value: retSensorVal1, unit: "μg/m³", group, time });
      }
      if (retSensorVal2 !== null) {
        data.push({ variable: "pm2_5", value: retSensorVal2, unit: "μg/m³", group, time });
      }
      if (retSensorVal3 !== null) {
        data.push({ variable: "pm10", value: retSensorVal3, unit: "μg/m³", group, time });
      }
      break;

    case 0x03:
      if (retSensorVal1 !== null) {
        data.push({ variable: "particles_0_3", value: retSensorVal1, unit: "count", group, time });
      }
      if (retSensorVal2 !== null) {
        data.push({ variable: "particles_0_5", value: retSensorVal2, unit: "count", group, time });
      }
      if (retSensorVal3 !== null) {
        data.push({ variable: "particles_1_0", value: retSensorVal3, unit: "count", group, time });
      }
      break;

    case 0x04:
      if (retSensorVal1 !== null) {
        data.push({ variable: "particles_2_5", value: retSensorVal1, unit: "count", group, time });
      }
      if (retSensorVal2 !== null) {
        data.push({ variable: "particles_5_0", value: retSensorVal2, unit: "count", group, time });
      }
      if (retSensorVal3 !== null) {
        data.push({ variable: "particles_10", value: retSensorVal3, unit: "count", group, time });
      }
      break;

    case 0x05:
      if (retSensorVal1 !== null) {
        data.push({ variable: "o3", value: retSensorVal1 / 10, unit: "ppm", group, time });
      }
      if (retSensorVal2 !== null) {
        data.push({ variable: "co", value: retSensorVal2 / 10, unit: "ppm", group, time });
      }
      if (retSensorVal3 !== null) {
        data.push({ variable: "no", value: retSensorVal3 / 10, unit: "ppm", group, time });
      }
      break;

    case 0x06:
      if (retSensorVal1 !== null) {
        data.push({ variable: "no2", value: retSensorVal1 / 10, unit: "ppm", group, time });
      }
      if (retSensorVal2 !== null) {
        data.push({ variable: "so2", value: retSensorVal2 / 10, unit: "ppm", group, time });
      }
      if (retSensorVal3 !== null) {
        data.push({ variable: "h2s", value: retSensorVal3 / 10, unit: "ppm", group, time });
      }
      break;

    case 0x07:
      if (retSensorVal1 !== null) {
        data.push({ variable: "co2", value: retSensorVal1 / 10, unit: "ppm", group, time });
      }
      if (retSensorVal2 !== null) {
        data.push({ variable: "nh3", value: retSensorVal2 / 10, unit: "ppm", group, time });
      }
      if (retSensorVal3 !== null) {
        data.push({ variable: "noise", value: retSensorVal3 / 10, unit: "dB", group, time });
      }
      break;

    case 0x08:
      if (retSensorVal1 !== null) {
        data.push({ variable: "ph", value: retSensorVal1 / 100, unit: "pH", group, time });
      }
      if (retSensorVal2 !== null) {
        const tempPH = (bytes[6] & 0x80) ? (0x10000 - retSensorVal2) / 100 * -1 : (retSensorVal2 / 100);
        data.push({ variable: "temperature_ph", value: tempPH, unit: "°C", group, time });
      }
      if (retSensorVal3 !== null) {
        const orp = (bytes[8] & 0x80) ? (0x10000 - retSensorVal3) * -1 : retSensorVal3;
        data.push({ variable: "orp", value: orp, unit: "mV", group, time });
      }
      break;

    case 0x09:
      if (retSensorVal1 !== null) {
        data.push({ variable: "turbidity", value: retSensorVal1 / 10, unit: "NTU", group, time });
      }
      if (retSensorVal2 !== null) {
        const tempNTU = (bytes[6] & 0x80) ? (0x10000 - retSensorVal2) / 100 * -1 : (retSensorVal2 / 100);
        data.push({ variable: "temperature_ntu", value: tempNTU, unit: "°C", group, time });
      }
      if (retSensorVal3 !== null) {
        data.push({ variable: "soil_humidity_ec5", value: retSensorVal3 / 100, unit: "%", group, time });
      }
      break;

    case 0x0A:
      if (retSensorVal1 !== null) {
        data.push({ variable: "soil_humidity_5te", value: retSensorVal1 / 100, unit: "%", group, time });
      }
      if (retSensorVal2 !== null) {
        const soilTemp = (bytes[6] & 0x80) ? (0x10000 - retSensorVal2) / 100 * -1 : (retSensorVal2 / 100);
        data.push({ variable: "soil_temperature_5te", value: soilTemp, unit: "°C", group, time });
      }
      if (retSensorVal3 !== null) {
        data.push({ variable: "water_level", value: retSensorVal3, unit: "mm", group, time });
      }
      if (bytes.length > 10) {
        const ec5te = checkSensorExist(bytes[10]);
        if (ec5te !== null) {
          data.push({ variable: "ec_5te", value: ec5te / 10, unit: "dS/m", group, time });
        }
      }
      break;

    case 0x0B:
      if (retSensorVal1 !== null) {
        const tempLDO = (bytes[4] & 0x80) ? (0x10000 - retSensorVal1) / 100 * -1 : (retSensorVal1 / 100);
        data.push({ variable: "temperature_ldo", value: tempLDO, unit: "°C", group, time });
      }
      if (retSensorVal2 !== null) {
        data.push({ variable: "dissolved_oxygen", value: retSensorVal2 / 100, unit: "mg/L", group, time });
      }
      if (retSensorVal3 !== null) {
        data.push({ variable: "oxygen_saturation", value: retSensorVal3 / 10, unit: "%", group, time });
      }
      break;

    case 0x0C:
      if (retSensorVal1 !== null) {
        const temperature = (bytes[4] & 0x80) ? (0x10000 - retSensorVal1) / 100 * -1 : (retSensorVal1 / 100);
        data.push({ variable: "temperature", value: temperature, unit: "°C", group, time });
      }
      if (retSensorVal2 !== null) {
        data.push({ variable: "humidity", value: retSensorVal2 / 100, unit: "%", group, time });
      }
      if (retSensorVal3 !== null) {
        data.push({ variable: "wind_speed", value: retSensorVal3 / 100, unit: "m/s", group, time });
      }
      break;

    case 0x0D:
      if (retSensorVal1 !== null) {
        data.push({ variable: "wind_direction", value: retSensorVal1, unit: "°", group, time });
      }
      if (bytes.length >= 10) {
        const atmosphere = checkSensorExist((bytes[6] << 24) | (bytes[7] << 16) | (bytes[8] << 8) | bytes[9]);
        if (atmosphere !== null) {
          data.push({ variable: "atmospheric_pressure", value: atmosphere / 100, unit: "hPa", group, time });
        }
      }
      break;

    case 0x0E:
      if (retSensorVal1 !== null) {
        data.push({ variable: "voc", value: retSensorVal1 / 10, unit: "ppm", group, time });
      }
      break;

    case 0x0F:
      if (retSensorVal1 !== null) {
        data.push({ variable: "nitrogen", value: retSensorVal1, unit: "mg/kg", group, time });
      }
      if (retSensorVal2 !== null) {
        data.push({ variable: "phosphorus", value: retSensorVal2, unit: "mg/kg", group, time });
      }
      if (retSensorVal3 !== null) {
        data.push({ variable: "potassium", value: retSensorVal3, unit: "mg/kg", group, time });
      }
      break;

    case 0x10:
      if (retSensorVal1 !== null) {
        data.push({ variable: "soil_vwc", value: retSensorVal1 / 100, unit: "%", group, time });
      }
      if (retSensorVal2 !== null) {
        const soilTemp = (bytes[6] & 0x80) ? (0x10000 - retSensorVal2) / 100 * -1 : (retSensorVal2 / 100);
        data.push({ variable: "soil_temperature", value: soilTemp, unit: "°C", group, time });
      }
      if (retSensorVal3 !== null) {
        data.push({ variable: "soil_ec", value: retSensorVal3 / 1000, unit: "dS/m", group, time });
      }
      break;
  }

  return data;
}

/**
 * Main decoder function for TagoIO
 */
// Find payload and port data from the received payload
const payloadData = payload.find((x: any) => ["payload_raw", "payload", "data"].includes(x.variable));
const portData = payload.find((x: any) => ["port", "fport"].includes(x.variable));

if (payloadData && portData) {
  try {
    // Convert hex string to bytes array
    const hexString = payloadData.value;
    const bytes: number[] = [];
    for (let i = 0; i < hexString.length; i += 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
    }

    const port = portData.value;
    const group = payloadData.group || `${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const time = payloadData.time || new Date().toISOString();
    const data: any[] = [];

    switch (port) {
      case 6:
        // Device information or sensor data
        if (bytes[2] === 0x00) {
          // Device information
          const deviceName = getDeviceName(bytes[1]);
          const swVersion = bytes[3] / 10;
          const hwVersion = bytes[4];
          const dateCode = padLeft(bytes[5].toString(16), 2) + 
                          padLeft(bytes[6].toString(16), 2) + 
                          padLeft(bytes[7].toString(16), 2) + 
                          padLeft(bytes[8].toString(16), 2);

          data.push({ variable: "device_name", value: deviceName, group, time });
          data.push({ variable: "software_version", value: swVersion, group, time });
          data.push({ variable: "hardware_version", value: hwVersion, group, time });
          data.push({ variable: "date_code", value: dateCode, group, time });
        } else {
          // Sensor data
          const deviceName = getDeviceName(bytes[1]);
          data.push({ variable: "device_name", value: deviceName, group, time });

          // Battery voltage
          let voltage;
          let batteryLow = false;
          if (bytes[3] & 0x80) {
            const tmpV = bytes[3] & 0x7F;
            voltage = tmpV / 10;
            batteryLow = true;
          } else {
            voltage = bytes[3] / 10;
          }

          data.push({ 
            variable: "battery_voltage", 
            value: voltage, 
            unit: "V", 
            group, 
            time,
            metadata: { low_battery: batteryLow }
          });

          // Parse sensor data based on sensor type
          const sensorData = parseSensorData(bytes[2], bytes, group, time);
          data.push(...sensorData);
        }
        break;

      case 7:
        // Configuration commands
        const cmd = getCfgCmd(bytes[0]);
        const deviceName = getDeviceName(bytes[1]);

        data.push({ variable: "command", value: cmd, group, time });
        data.push({ variable: "device_name", value: deviceName, group, time });

        if (bytes[0] === 0x81) { // ConfigReportRsp
          const status = bytes[2] === 0x00 ? 'Success' : 'Failure';
          data.push({ variable: "config_status", value: status, group, time });
        } else if (bytes[0] === 0x82) { // ReadConfigReportRsp
          const minTime = (bytes[2] << 8) | bytes[3];
          const maxTime = (bytes[4] << 8) | bytes[5];
          data.push({ variable: "min_time", value: minTime, unit: "s", group, time });
          data.push({ variable: "max_time", value: maxTime, unit: "s", group, time });
        }
        break;

      default:
        data.push({ 
          variable: "parser_error", 
          value: `Unknown port: ${port}`, 
          group, 
          time 
        });
    }

    // Replace payload with parsed data
    payload = payload.concat(data);

  } catch (error) {
    // Handle parsing errors
    payload = [{
      variable: "parser_error",
      value: `Parsing failed: ${error.message}`,
      time: new Date().toISOString()
    }];
  }
}
