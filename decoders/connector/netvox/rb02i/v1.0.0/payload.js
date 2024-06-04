/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* This is an generic payload parser example.
** The code find the payload variable and parse it if exists.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "payload", "value": "0109611395" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = [];


// Function to convert an object to TagoIO data format.
function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue; // ignore chosen vars

    if (typeof object_item[key] === 'object') {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        unit: object_item[key].unit,
        location: object_item[key].location,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

// Basic function parse for common parameter types. return value and unit.
const batteryParse = x => ({ value: Number((x.readInt8() / 10).toFixed(1)), unit: 'v' });
const temperatureParse = x => ({ value: Number((((x.readInt16BE() / 100) * 9/5) + 32).toFixed(2)), unit: '°F' });
const humidityParse = x => ({ value: Number((x.readInt16BE() / 100).toFixed(2)), unit: '%' });
const statusParse = x => ({ value: x.readInt8() === 0 ? 'off' : 'on' });
const waterleak = x => ({ value: x.readInt8() === 0 ? 'noleak' : 'leak' });
const voltParse = x => ({ value: x.readInt16BE(), unit: 'v' });
const energyParse = x => ({ value: x.readInt32BE(), unit: 'wh' });
const currentParse = x => ({ value: x.readInt8(), unit: 'ma' });
const illuminanceParse = x => ({ value: x.readInt32BE(), unit: 'Lux' });
const velocityParse = x => ({ value: x.readUInt16BE() / 100, unit: 'mm/s' });
const occupyParse = x => ({ value: x.readInt8() === 0 ? 'Unoccupy' : 'Occupy' });
const pm2_5 = x => ({ value: x.readUInt16BE(), unit: 'ug/m3' });
const pm1 = x => ({ value: x.readUInt16BE(), unit: 'ug/m3' });
const pm10 = x => ({ value: x.readUInt16BE(), unit: 'ug/m3' });
const umPM = x => ({ value: x.readUInt16BE(), unit: 'pcs' });
const gasParse = x => ({ value: Number((x.readUInt16BE() / 10).toFixed(2)), unit: 'ppm' });
const noiseParse = x => ({ value: Number((x.readUInt16BE() / 10).toFixed(2)), unit: 'db' });
const acidityParse = x => ({ value: Number((x.readUInt16BE() / 100).toFixed(2)), unit: 'pH' });
const temperatureCelsiusParse = x => ({ value: Number((x.readInt16BE() / 100).toFixed(2)), unit: '°C' });
const orpParse = x => ({ value: x.readInt16BE(), unit: 'mv' });
const ntuParse = x => ({ value: Number((x.readUInt16BE() / 10).toFixed(2)), unit: 'ntu' });
const waterLevel = x => ({ value: x.readUInt16BE(), unit: 'cm' });

// Start the parse of the payload
function parsePayload(payload_raw) {
  payload_raw = Buffer.from(payload_raw, 'hex');

  if (payload_raw[2] === 0x00) {
    return {
      software_version: payload_raw.readInt8(3) * 0.1,
      hardware_version: payload_raw.readInt8(4),
      data_code: payload_raw.slice(5, 9).toString('hex'),
    };
  }

  switch (payload_raw[1]) {
    case 0x01:
    case 0x13:
    case 0x0B:
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        temperature: temperatureParse(payload_raw.slice(4, 6)),
        humidity: humidityParse(payload_raw.slice(6, 8)),
      };

    case 0x15:
    case 0x16:
    case 0x17:
    case 0x18:
    case 0x19:
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        temperature1: temperatureParse(payload_raw.slice(4, 6)),
        temperature2: temperatureParse(payload_raw.slice(6, 8)),
      };
    case 0x38:
    case 0x39:
    case 0x3A:
    case 0x3B:
    case 0x3C: {
      switch (payload_raw[2]) {
        case 0x01:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            temperature1: temperatureParse(payload_raw.slice(4, 6)),
            temperature2: temperatureParse(payload_raw.slice(6, 8)),
          };
        case 0x02:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            temperature3: temperatureParse(payload_raw.slice(4, 6)),
            temperature4: temperatureParse(payload_raw.slice(6, 8)),
          };
      }
      break;
    }
    case 0x14: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        temperature1: temperatureParse(payload_raw.slice(4, 6)),
        temperature2: temperatureParse(payload_raw.slice(6, 8)),
      };
    }
    case 0x2E: {
      switch (payload_raw[2]) {
        case 0x01:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            temperature1: temperatureParse(payload_raw.slice(4, 6)),
            temperature2: temperatureParse(payload_raw.slice(6, 8)),
          };
        case 0x02:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            temperature3: temperatureParse(payload_raw.slice(4, 6)),
            temperature4: temperatureParse(payload_raw.slice(6, 8)),
          };
      }
      break;
    }
    case 0x1A:
    case 0x1B:
    case 0x21:
    case 0x25:
    case 0x27:
    case 0x4F:
    case 0x5B:
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        status: statusParse(payload_raw.slice(4, 5)),
      };
    case 0x2F:
    case 0x3D:
    case 0x3E:
    case 0x43:
    case 0x45:
    case 0x4C:
    case 0x56:
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        status1: statusParse(payload_raw.slice(4, 5)),
        status2: statusParse(payload_raw.slice(5, 6)),
      };
    case 0x02:
    case 0x1D:
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        contact_switch: statusParse(payload_raw.slice(4, 5)),
      };
    case 0x0E: {
      switch (payload_raw[2]) {
        case 0x01:
          return {
            status: statusParse(payload_raw.slice(3, 4)),
            energy: energyParse(payload_raw.slice(4, 8)),
          };
        case 0x02:
          return {
            volt: voltParse(payload_raw.slice(3, 5)),
            current: currentParse(payload_raw.slice(5, 7)),
            power: { value: payload_raw.slice(7, 9).readInt8(), unit: 'W' },
          };
      }
      break;
    }

    case 0x1E: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        illuminance: illuminanceParse(payload_raw.slice(4, 8)),
      };
    }
    case 0x1C: {
      switch (payload_raw[2]) {
        case 0x01:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            acceleration_x: velocityParse(payload_raw.slice(4, 6)),
            acceleration_y: velocityParse(payload_raw.slice(6, 8)),
            acceleration_z: velocityParse(payload_raw.slice(8, 10)),
          };
        case 0x02:
          return {
            acceleration_x: velocityParse(payload_raw.slice(3, 5)),
            acceleration_y: velocityParse(payload_raw.slice(5, 7)),
            acceleration_z: velocityParse(payload_raw.slice(7, 9)),
            temperature: temperatureParse(payload_raw.slice(9, 11)),
          };
      }
      break;
    }
    case 0x20:
    case 0x2A: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        adcrawvalue: { value: payload_raw.slice(4, 6).readInt16BE(), unit: 'mv' },
      };
    }
    case 0x41:
    case 0x42: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        adcrawvalue: { value: payload_raw.slice(4, 6).readInt16BE(), unit: 'mv' },
        adcrawvalue2: { value: payload_raw.slice(6, 8).readInt16BE(), unit: 'mv' },
      };
    }

    case 0x5D:
    case 0x5E:
    case 0x5F:
    case 0x6A:
    case 0x37:
    case 0x35:
    case 0x36: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        temperature: temperatureParse(payload_raw.slice(4, 6)),
        humidity: humidityParse(payload_raw.slice(6, 8)),
        pm2_5: pm2_5(payload_raw.slice(8, 10)),
      };
    }
    case 0x2B:
    case 0x50: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        workcount: { value: payload_raw.slice(4, 8).readInt32BE(), unit: 's' },
      };
    }
    case 0x51:
    case 0x2C: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        worktime: { value: payload_raw.slice(4, 8).readInt32BE(), unit: 's' },
      };
    }
    case 0x5C: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        status: statusParse(payload_raw.slice(4, 5)),
        current: currentParse(payload_raw.slice(6, 7)),
        adcrawvalue: { value: payload_raw.slice(7, 9).readInt16BE(), unit: 'mv' },
      };
    }
    case 0x22: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        current: currentParse(payload_raw.slice(4, 5)),
      };
    }
    case 0x44: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        current: currentParse(payload_raw.slice(4, 5)),
        current2: currentParse(payload_raw.slice(5, 6)),
      };
    }
    case 0x23: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        resistive: { value: payload_raw.slice(4, 8).readInt32BE() * 10, unit: 'ohms' },
      };
    }
    case 0x1F: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        pulsecount: payload_raw.slice(4, 6).readInt16BE(),
      };
    }
    case 0x3F: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        pulsecount: payload_raw.slice(4, 6).readInt16BE(),
        pulsecount2: payload_raw.slice(6, 8).readInt16BE(),
      };
    }
    case 0x10:
    case 0x31:
    case 0x4D:
    case 0x55: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        alarm: statusParse(payload_raw.slice(4, 5)),
      };
    }

    case 0x12:
    case 0x32: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        waterleak: statusParse(payload_raw.slice(4, 5)),
      };
    }

    case 0x46:
    case 0x47: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        waterleak: statusParse(payload_raw.slice(4, 5)),
        waterleak2: statusParse(payload_raw.slice(5, 6)),
      };
    }

    case 0x48: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        alarm: statusParse(payload_raw.slice(4, 5)),
        alarm2: statusParse(payload_raw.slice(5, 6)),
      };
    }

    case 0x11: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        co_alarm: statusParse(payload_raw.slice(4, 5)),
        hightemp_alarm: statusParse(payload_raw.slice(5, 6)),
      };
    }
    case 0x49: {
      const multiplier = payload_raw.slice(6, 7).readInt8();
      const to_return = {
        battery: batteryParse(payload_raw.slice(3, 4)),
        current: currentParse(payload_raw.slice(4, 6)),
      };

      to_return.current.value *= multiplier;

      return to_return;
    }
    case 0x4A: {
      const multiplier = payload_raw.slice(10, 11).readInt8();
      const to_return = {
        battery: batteryParse(payload_raw.slice(3, 4)),
        current: currentParse(payload_raw.slice(4, 6)),
        current2: currentParse(payload_raw.slice(6, 8)),
        current3: currentParse(payload_raw.slice(8, 10)),
      };

      to_return.current.value *= multiplier;
      to_return.current2.value *= multiplier;
      to_return.current3.value *= multiplier;

      return to_return;
    }
    case 0x69: {
      return {
        heartbeattime: { value: payload_raw.readInt16BE(3) / 3600, unit: 's' },
      };
    }
    case 0x03:
    case 0x07: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        temperature: temperatureCelsiusParse(payload_raw.slice(4, 6)),
        illuminance: { value: payload_raw.slice(6, 8).readUInt16BE(), unit: 'Lux' },
        occupy: occupyParse(payload_raw.slice(8, 9)),
      };
    }
    case 0x04:
    case 0x4B: {
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        illuminance: { value: payload_raw.slice(4, 6).readUInt16BE(), unit: 'Lux' },
      };
    }
    case 0x05:
    case 0x09:
    case 0x0D:
    case 0x52:
    case 0x53:
    case 0x54:
    case 0x57:
    case 0x58:
    case 0x60:
    case 0x61:
    case 0x62:
    case 0x63:
    case 0x64:
    case 0x65:
    case 0x66:
    case 0x67:
    case 0x68: {
      switch (payload_raw[2]) {
        case 0x01:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            pm1: pm1(payload_raw.slice(4, 6)), // CF = 1 (??)
            pm2_5: pm2_5(payload_raw.slice(6, 8)), // CF = 1 (??)
            pm10: pm10(payload_raw.slice(8, 10)), // CF = 1 (??)
          };
        case 0x02:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            pm1: pm1(payload_raw.slice(4, 6)),
            pm2_5: pm2_5(payload_raw.slice(6, 8)),
            pm10: pm10(payload_raw.slice(8, 10)),
          };
        case 0x03:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            _3umPM: umPM(payload_raw.slice(4, 6)),
            _5umPM: umPM(payload_raw.slice(6, 8)),
            oneumPM: umPM(payload_raw.slice(8, 10)),
          };
        case 0x04:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            two_5umPM: umPM(payload_raw.slice(4, 6)),
            fiveumPM: umPM(payload_raw.slice(6, 8)),
            tenumPM: umPM(payload_raw.slice(8, 10)),
          };
        case 0x05:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            o3: gasParse(payload_raw.slice(4, 6)),
            co: gasParse(payload_raw.slice(6, 8)),
            no: gasParse(payload_raw.slice(8, 10)),
          };
        case 0x06:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            no2: gasParse(payload_raw.slice(4, 6)),
            so2: gasParse(payload_raw.slice(6, 8)),
            h2s: gasParse(payload_raw.slice(8, 10)),
          };
        case 0x07:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            co2: gasParse(payload_raw.slice(4, 6)),
            nh3: gasParse(payload_raw.slice(6, 8)),
            noise: noiseParse(payload_raw.slice(8, 10)),
          };
        case 0x08:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            ph: acidityParse(payload_raw.slice(4, 6)),
            temperature_with_ph: temperatureCelsiusParse(payload_raw.slice(6, 8)),
            orp: orpParse(payload_raw.slice(8, 10)),
          };
        case 0x09:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            ntu: ntuParse(payload_raw.slice(4, 6)),
            temperature_with_ntu: temperatureCelsiusParse(payload_raw.slice(6, 8)),
            ec5_soildHumidity: humidityParse(payload_raw.slice(8, 10)),
          };
        case 0x0A:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            _5te_SoildHumidity: humidityParse(payload_raw.slice(4, 6)),
            _5te_SoildTemp: temperatureCelsiusParse(payload_raw.slice(6, 8)),
            water_level: waterLevel(payload_raw.slice(8, 10)),
          };
        case 0x0B:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            temperature_with_ldo: temperatureCelsiusParse(payload_raw.slice(4, 6)),
            ldo_do: { value: payload_raw.slice(6, 8).readInt8() / 100, unit: 'ppm' },
            ldo_sat: { value: payload_raw.slice(8, 10).readInt8() / 100, unit: '%' },
          };
        case 0x0C:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            temperature: temperatureCelsiusParse(payload_raw.slice(4, 6)),
            humidity: humidityParse(payload_raw.slice(6, 8)),
            wind_speed: { value: payload_raw.slice(8, 10).readInt8() / 100, unit: 'm/s' },
          };
        case 0x0D:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            wind_direction: { value: payload_raw.slice(4, 6).readUInt16BE() },
            atmosphere: { value: payload_raw.slice(6, 10).readUInt32BE() / 100, unit: 'mbar' },
          };
        case 0x0E:
          return {
            battery: batteryParse(payload_raw.slice(3, 4)),
            voc: { value: payload_raw.readInt32BE(4) / 10, unit: 'ppm' },
          };
        default: return { payload: payload_raw.join(''), parse_error: 'Report Type not found. Couldn\'t parse the payload' };
      }
    }
    case 0x06:
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        water1leak: waterleak(payload_raw.slice(4, 5)),
        water2leak: waterleak(payload_raw.slice(5, 6)),
      };
    case 0x5A:
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        status1: statusParse(payload_raw.slice(4, 5)),
        status2: statusParse(payload_raw.slice(5, 6)),
      };
    case 0x08:
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        temperature1: temperatureCelsiusParse(payload_raw.slice(4, 6)),
        temperature2: temperatureCelsiusParse(payload_raw.slice(6, 8)),
      };
    case 0x0A:
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        fire_alarm: { value: payload_raw.slice(4, 5).readInt8() == 0 ? 'noalarm' : 'alarm' },
        hightemp_alarm: { value: payload_raw.slice(5, 6).readInt8() == 0 ? 'noalarm' : 'alarm' },
      };
    case 0x0C:
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        waterleak_location: { value: payload_raw.slice(4, 6).readUInt16BE(), unit: 'cm' }, // NEED REVISION
      };
    case 0x33:
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        tank_raw_data: { value: payload_raw.slice(4, 6).readUInt16BE(), unit: 'mv' },
        tank_level: { value: payload_raw.slice(6, 7).readInt8(), unit: '%' },
      };
    case 0x26:
    case 0x4E:
      return {
        battery: batteryParse(payload_raw.slice(3, 4)),
        rssi: { value: payload_raw.slice(4, 6).readInt16BE(), unit: 'dbm' },
        snr: { value: payload_raw.slice(6, 7).readInt8() },
        heart_interval: { value: payload_raw.slice(7, 9).readInt16BE(), unit: 's' },
      };
    default: return { payload: payload_raw.join(''), parse_error: 'Device Type not found. Couldn\'t parse the payload' };
  }
}
// let payload = [{
//   variable: 'payload',
//   value: '010b0124f9451c81000000',
//   serie: 1578676097214,
// }];
// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const data = payload.find(x => ['payload', 'payload_raw', 'data'].includes(x.variable));
if (data) {
  // Get a unique serie for the incoming data.
  const { value, serie } = data;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(toTagoFormat(parsePayload(value), serie));
  }
}
// console.log(payload);
