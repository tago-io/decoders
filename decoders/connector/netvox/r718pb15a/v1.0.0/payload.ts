/**
 * TagoIO Payload Parser for R718PB15A Environmental Monitoring Device
 * Supports multiple sensor readings and device configuration commands
 */

/**
 * Configuration command mapping
 */
function getCfgCmd(cfgcmd: number) {
  const cfgcmdlist: Record<number, string> = {
    0x01: "ConfigReportReq",
    0x81: "ConfigReportRsp",
    0x02: "ReadConfigReportReq",
    0x82: "ReadConfigReportRsp",
    0x03: "SetLDOSettingReq",
    0x83: "SetLDOSettingRsp",
    0x04: "GetLDOSettingReq",
    0x84: "GetLDOSettingRsp",
    0x05: "ORPCalibrateReq",
    0x85: "ORPCalibrateRsp",
    0x06: "PHCalibrateReq",
    0x86: "PHCalibrateRsp",
    0x07: "NTUCalibrateReq",
    0x87: "NTUCalibrateRsp",
    0x08: "SetWireLengthReq",
    0x88: "SetWireLengthRsp",
    0x09: "GetWireLengthReq",
    0x89: "GetWireLengthRsp",
    0x0A: "SetSoilTypeReq",
    0x8A: "SetSoilTypeRsp",
    0x0B: "GetSoilTypeReq",
    0x8B: "GetSoilTypeRsp",
    0x0C: "SoilCalibrateReq",
    0x8C: "SoilCalibrateRsp",
  };
  return cfgcmdlist[cfgcmd];
}

/**
 * Device name mapping
 */
function getDeviceName(dev: number) {
  const deviceName = {
    0x58: "R718PB15A"
  };
  return deviceName[dev];
}

/**
 * Utility function to pad hex strings
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
 * Parse sensor data payload for port 6
 */
function parseSensorData(bytes: number[], group: string, time: string) {
  const data: any[] = [];
  
  // Device information (always present)
  const deviceName = getDeviceName(bytes[1]);
  if (deviceName) {
    data.push({
      variable: "device_name",
      value: deviceName,
      group,
      time
    });
  }

  // Handle device info packet (bytes[2] === 0x00)
  if (bytes[2] === 0x00) {
    data.push({
      variable: "software_version",
      value: bytes[3] / 10,
      group,
      time
    });
    
    data.push({
      variable: "hardware_version",
      value: bytes[4],
      group,
      time
    });
    
    const datecode = padLeft(bytes[5].toString(16), 2) + 
                    padLeft(bytes[6].toString(16), 2) + 
                    padLeft(bytes[7].toString(16), 2) + 
                    padLeft(bytes[8].toString(16), 2);
    
    data.push({
      variable: "date_code",
      value: datecode,
      group,
      time
    });
    
    return data;
  }

  // Battery voltage processing
  let batteryVoltage;
  let batteryStatus = "normal";
  
  if (bytes[3] & 0x80) {
    const tmp_v = bytes[3] & 0x7F;
    batteryVoltage = tmp_v / 10;
    batteryStatus = "low";
  } else {
    batteryVoltage = bytes[3] / 10;
  }
  
  data.push({
    variable: "battery_voltage",
    value: batteryVoltage,
    unit: "V",
    group,
    time,
    metadata: { status: batteryStatus }
  });

  // Parse sensor data based on data type (bytes[2])
  switch (bytes[2]) {
    case 0x01: // PM CF data
      data.push({
        variable: "pm1_0_cf",
        value: (bytes[4] << 8) | bytes[5],
        unit: "μg/m³",
        group,
        time
      });
      data.push({
        variable: "pm2_5_cf",
        value: (bytes[6] << 8) | bytes[7],
        unit: "μg/m³",
        group,
        time
      });
      data.push({
        variable: "pm10_cf",
        value: (bytes[8] << 8) | bytes[9],
        unit: "μg/m³",
        group,
        time
      });
      break;

    case 0x02: // PM standard data
      data.push({
        variable: "pm1_0",
        value: (bytes[4] << 8) | bytes[5],
        unit: "μg/m³",
        group,
        time
      });
      data.push({
        variable: "pm2_5",
        value: (bytes[6] << 8) | bytes[7],
        unit: "μg/m³",
        group,
        time
      });
      data.push({
        variable: "pm10",
        value: (bytes[8] << 8) | bytes[9],
        unit: "μg/m³",
        group,
        time
      });
      break;

    case 0x03: // Particle count 1
      let pm03um = (bytes[4] << 16) | (bytes[5] << 8) | bytes[6];
      if (pm03um & 0x80) {
        pm03um = pm03um & 0x7F;
      }
      data.push({
        variable: "pm0_3um",
        value: pm03um,
        unit: "particles/0.1L",
        group,
        time
      });
      data.push({
        variable: "pm0_5um",
        value: (bytes[7] << 8) | bytes[8],
        unit: "particles/0.1L",
        group,
        time
      });
      data.push({
        variable: "pm1_0um",
        value: (bytes[9] << 8) | bytes[10],
        unit: "particles/0.1L",
        group,
        time
      });
      break;

    case 0x04: // Particle count 2
      data.push({
        variable: "pm2_5um",
        value: (bytes[4] << 8) | bytes[5],
        unit: "particles/0.1L",
        group,
        time
      });
      data.push({
        variable: "pm5_0um",
        value: (bytes[6] << 8) | bytes[7],
        unit: "particles/0.1L",
        group,
        time
      });
      data.push({
        variable: "pm10um",
        value: (bytes[8] << 8) | bytes[9],
        unit: "particles/0.1L",
        group,
        time
      });
      break;

    case 0x05: // Gas sensors 1
      data.push({
        variable: "o3",
        value: ((bytes[4] << 8) | bytes[5]) * 0.1,
        unit: "ppb",
        group,
        time
      });
      data.push({
        variable: "co",
        value: ((bytes[6] << 8) | bytes[7]) * 0.1,
        unit: "ppm",
        group,
        time
      });
      data.push({
        variable: "no",
        value: ((bytes[8] << 8) | bytes[9]) * 0.1,
        unit: "ppb",
        group,
        time
      });
      break;

    case 0x06: // Gas sensors 2
      data.push({
        variable: "no2",
        value: ((bytes[4] << 8) | bytes[5]) * 0.1,
        unit: "ppb",
        group,
        time
      });
      data.push({
        variable: "so2",
        value: (bytes[6] << 8) | bytes[7],
        unit: "ppb",
        group,
        time
      });
      data.push({
        variable: "h2s",
        value: ((bytes[8] << 8) | bytes[9]) * 0.1,
        unit: "ppb",
        group,
        time
      });
      break;

    case 0x07: // Gas sensors 3
      data.push({
        variable: "co2",
        value: ((bytes[4] << 8) | bytes[5]) * 0.1,
        unit: "ppm",
        group,
        time
      });
      data.push({
        variable: "nh3",
        value: ((bytes[6] << 8) | bytes[7]) * 0.1,
        unit: "ppm",
        group,
        time
      });
      data.push({
        variable: "noise",
        value: ((bytes[8] << 8) | bytes[9]) * 0.1,
        unit: "dB",
        group,
        time
      });
      break;

    case 0x08: // Water quality 1
      data.push({
        variable: "ph",
        value: ((bytes[4] << 8) | bytes[5]) * 0.01,
        unit: "pH",
        group,
        time
      });
      
      let temperature = ((bytes[6] << 8) | bytes[7]) * 0.01;
      if (temperature & 0x80) {
        temperature = temperature & 0x7F;
      }
      data.push({
        variable: "temperature",
        value: temperature,
        unit: "°C",
        group,
        time
      });
      
      let orp = (bytes[8] << 8) | bytes[9];
      if (orp & 0x80) {
        orp = orp & 0x7F;
      }
      data.push({
        variable: "orp",
        value: orp,
        unit: "mV",
        group,
        time
      });
      break;

    case 0x09: // Water quality 2
      data.push({
        variable: "ntu",
        value: ((bytes[4] << 8) | bytes[5]) * 0.1,
        unit: "NTU",
        group,
        time
      });
      
      let temp = ((bytes[6] << 8) | bytes[7]) * 0.01;
      if (temp & 0x80) {
        temp = temp & 0x7F;
      }
      data.push({
        variable: "temperature",
        value: temp,
        unit: "°C",
        group,
        time
      });
      
      data.push({
        variable: "soil_vwc",
        value: ((bytes[8] << 8) | bytes[9]) * 0.01,
        unit: "%",
        group,
        time
      });
      break;

    case 0x0A: // Soil sensors
      data.push({
        variable: "soil_vwc",
        value: ((bytes[4] << 8) | bytes[5]) * 0.01,
        unit: "%",
        group,
        time
      });
      data.push({
        variable: "soil_temperature",
        value: ((bytes[6] << 8) | bytes[7]) * 0.01,
        unit: "°C",
        group,
        time
      });
      data.push({
        variable: "water_level",
        value: (bytes[8] << 8) | bytes[9],
        unit: "mm",
        group,
        time
      });
      data.push({
        variable: "soil_ec",
        value: bytes[10] * 0.1,
        unit: "mS/cm",
        group,
        time
      });
      break;

    case 0x0B: // Dissolved oxygen
      let tempDO = ((bytes[4] << 8) | bytes[5]) * 0.01;
      if (tempDO & 0x80) {
        tempDO = tempDO & 0x7F;
      }
      data.push({
        variable: "temperature",
        value: tempDO,
        unit: "°C",
        group,
        time
      });
      
      data.push({
        variable: "dissolved_oxygen",
        value: ((bytes[6] << 8) | bytes[7]) * 0.01,
        unit: "mg/L",
        group,
        time
      });
      data.push({
        variable: "do_saturation",
        value: ((bytes[8] << 8) | bytes[9]) * 0.1,
        unit: "%",
        group,
        time
      });
      break;

    case 0x0C: // Weather sensors 1
      data.push({
        variable: "temperature",
        value: ((bytes[4] << 8) | bytes[5]) * 0.01,
        unit: "°C",
        group,
        time
      });
      data.push({
        variable: "humidity",
        value: ((bytes[6] << 8) | bytes[7]) * 0.01,
        unit: "%",
        group,
        time
      });
      data.push({
        variable: "wind_speed",
        value: ((bytes[8] << 8) | bytes[9]) * 0.01,
        unit: "m/s",
        group,
        time
      });
      break;

    case 0x0D: // Weather sensors 2
      data.push({
        variable: "wind_direction",
        value: (bytes[4] << 8) | bytes[5],
        unit: "°",
        group,
        time
      });
      data.push({
        variable: "atmospheric_pressure",
        value: ((bytes[6] << 24) | (bytes[7] << 16) | (bytes[8] << 8) | bytes[9]) * 0.01,
        unit: "hPa",
        group,
        time
      });
      break;

    case 0x0E: // VOC sensor
      data.push({
        variable: "voc",
        value: ((bytes[4] << 8) | bytes[5]) * 0.1,
        unit: "ppm",
        group,
        time
      });
      break;

    case 0x0F: // NPK sensors
      data.push({
        variable: "nitrogen",
        value: (bytes[4] << 8) | bytes[5],
        unit: "mg/kg",
        group,
        time
      });
      data.push({
        variable: "phosphorus",
        value: (bytes[6] << 8) | bytes[7],
        unit: "mg/kg",
        group,
        time
      });
      data.push({
        variable: "potassium",
        value: (bytes[8] << 8) | bytes[9],
        unit: "mg/kg",
        group,
        time
      });
      break;

    case 0x10: // Soil comprehensive
      data.push({
        variable: "soil_vwc",
        value: ((bytes[4] << 8) | bytes[5]) * 0.01,
        unit: "%",
        group,
        time
      });
      data.push({
        variable: "soil_temperature",
        value: ((bytes[6] << 8) | bytes[7]) * 0.01,
        unit: "°C",
        group,
        time
      });
      data.push({
        variable: "soil_ec",
        value: ((bytes[8] << 8) | bytes[9]) * 0.001,
        unit: "mS/cm",
        group,
        time
      });
      break;

    default:
      data.push({
        variable: "parser_error",
        value: `Unknown sensor data type: 0x${bytes[2].toString(16).padStart(2, '0')}`,
        group,
        time
      });
  }

  return data;
}

/**
 * Parse configuration command payload for port 7
 */
function parseConfigData(bytes: number[], group: string, time: string) {
  const data: any[] = [];
  
  const cmdName = getCfgCmd(bytes[0]);
  const deviceName = getDeviceName(bytes[1]);
  
  data.push({
    variable: "command",
    value: cmdName || `Unknown (0x${bytes[0].toString(16)})`,
    group,
    time
  });
  
  if (deviceName) {
    data.push({
      variable: "device_name",
      value: deviceName,
      group,
      time
    });
  }

  // Parse command-specific data
  if (bytes[0] === 0x82) { // ReadConfigReportRsp
    data.push({
      variable: "min_time",
      value: (bytes[2] << 8) | bytes[3],
      unit: "minutes",
      group,
      time
    });
    data.push({
      variable: "max_time",
      value: (bytes[4] << 8) | bytes[5],
      unit: "minutes",
      group,
      time
    });
  } else if ([0x81, 0x83, 0x85, 0x86, 0x87, 0x88, 0x8A, 0x8C].includes(bytes[0])) {
    // Response commands with status
    data.push({
      variable: "command_status",
      value: bytes[2] === 0x00 ? "Success" : "Failure",
      group,
      time
    });
  } else if (bytes[0] === 0x84) { // GetLDOSettingRsp
    data.push({
      variable: "ldo_altitude",
      value: (bytes[2] << 8) | bytes[3],
      unit: "m",
      group,
      time
    });
    data.push({
      variable: "ldo_psu",
      value: (bytes[4] << 8) | bytes[5],
      unit: "PSU",
      group,
      time
    });
  } else if (bytes[0] === 0x89) { // GetWireLengthRsp
    data.push({
      variable: "wire_length",
      value: (bytes[2] << 8) | bytes[3],
      unit: "cm",
      group,
      time
    });
  } else if (bytes[0] === 0x8B) { // GetSoilTypeRsp
    data.push({
      variable: "soil_type",
      value: bytes[2],
      group,
      time
    });
  }

  return data;
}

// Main payload processing logic
try {
  // Find payload and port data
  const payloadData = payload.find((x: any) => ["payload_raw", "payload", "data"].includes(x.variable));
  const portData = payload.find((x: any) => ["port", "fport"].includes(x.variable));

  if (!payloadData || !payloadData.value) {
    payload = [{ variable: "parse_error", value: "No payload data found" }];
  } else {
    // Convert hex string to bytes array
    const hexString = payloadData.value.toString();
    const bytes: number[] = [];
    for (let i = 0; i < hexString.length; i += 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
    }

    if (bytes.length === 0) {
      payload = [{ variable: "parse_error", value: "Invalid payload: empty bytes array" }];
    } else {
      const port = portData ? parseInt(portData.value) : 6; // Default to port 6
      const group = payloadData.group || `${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      const time = payloadData.time || new Date().toISOString();

      let parsedData: any[] = [];

      switch (port) {
        case 6:
          parsedData = parseSensorData(bytes, group, time);
          break;
        case 7:
          parsedData = parseConfigData(bytes, group, time);
          break;
        default:
          parsedData = [{
            variable: "parser_error",
            value: `Unsupported port: ${port}`,
            group,
            time
          }];
      }

      payload = payload.concat(parsedData);
    }
  }
} catch (error) {
  payload = [{
    variable: "parser_error",
    value: `Parsing failed: ${error.message}`,
    time: new Date().toISOString()
  }];
}