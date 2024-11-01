/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */

/*
** RA02G Custom Payload Decoder for TagoIO 
** Parses sensor data such as alarms, battery, and environmental readings.
**
*/

const ignore_vars = [];

function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

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

// Parsing functions for common sensor data types
const batteryParse = x => ({ value: Number((x.readInt8() / 10).toFixed(1)), unit: 'v' });
const temperatureParse = x => ({ value: Number((x.readInt16BE() / 100).toFixed(2)), unit: '°C' });
const humidityParse = x => ({ value: Number((x.readInt16BE() / 100).toFixed(2)), unit: '%' });
const statusParse = x => ({ value: x.readInt8() === 0 ? 'no alarm' : 'alarm' });
const gasParse = x => ({ value: Number((x.readUInt16BE() / 10).toFixed(2)), unit: 'ppm' });
const noiseParse = x => ({ value: Number((x.readUInt16BE() / 10).toFixed(2)), unit: 'db' });
const currentParse = x => ({ value: x.readInt8(), unit: 'ma' });

// Main function to parse RA02G payloads
function parsePayload(payload_raw) {
  payload_raw = Buffer.from(payload_raw, 'hex');

  if (payload_raw[2] === 0x00) {
    return {
      software_version: payload_raw.readInt8(3) * 0.1,
      hardware_version: payload_raw.readInt8(4),
      data_code: payload_raw.slice(5, 9).toString('hex'),
    };
  }

  const deviceType = payload_raw[1];
  const reportType = payload_raw[2];

  switch (deviceType) {
    case 0xD7: {
      // Report type 0x01: Alarms and Battery
      if (reportType === 0x01) {
        return {
          battery: batteryParse(payload_raw.slice(3, 4)),
          smokeAlarm: statusParse(payload_raw.slice(4, 5)),
          soundAlarm: statusParse(payload_raw.slice(5, 6)),
          shockAlarm: statusParse(payload_raw.slice(6, 7)),
          powerOffAlarm: statusParse(payload_raw.slice(7, 8)),
          reserved: payload_raw.slice(8, 11).toString('hex'), // Reserved bytes
        };
      }
      // Report type 0x02: Environmental Data
      else if (reportType === 0x02) {
        return {
          battery: batteryParse(payload_raw.slice(3, 4)),
          temperature: temperatureParse(payload_raw.slice(4, 6)),
          humidity: humidityParse(payload_raw.slice(6, 8)),
          gasLevel: gasParse(payload_raw.slice(8, 10)),
          noiseLevel: noiseParse(payload_raw.slice(10, 12)),
        };
      }
      // Report type 0x03: Advanced Electrical Measurements
      else if (reportType === 0x03) {
        return {
          battery: batteryParse(payload_raw.slice(3, 4)),
          current: currentParse(payload_raw.slice(4, 5)),
          voltage: { value: payload_raw.slice(5, 7).readInt16BE(), unit: 'V' },
          power: { value: payload_raw.slice(7, 9).readInt16BE(), unit: 'W' },
        };
      }
      // Unknown report type
      else {
        return { payload: payload_raw.join(''), parse_error: 'Report Type not recognized for RA02G.' };
      }
    }
    default:
      return { payload: payload_raw.join(''), parse_error: 'Device Type not recognized.' };
  }
}

// Filter out unwanted variables from processing
payload = payload.filter(x => !ignore_vars.includes(x.variable));

// Extract and parse payload data if available
const data = payload.find(x => ['payload', 'payload_raw', 'data'].includes(x.variable));
if (data) {
  const { value, serie } = data;
  if (value) {
    payload = payload.concat(toTagoFormat(parsePayload(value), serie));
  }
}
