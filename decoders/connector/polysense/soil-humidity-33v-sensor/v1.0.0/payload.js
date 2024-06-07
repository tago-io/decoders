/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* This is an generic payload parser example.
** The code find the payload variable and parse it if exists.
**
** IMPORTANT: In most case,0x you will only need to edit the parsePayload function.
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

function dec2bin(dec) {
  const binary = (dec >>> 0).toString(2);
  return '00000000'.substr(binary.length) + binary;
}

// Basic function parse for common parameter types. return value and unit.
const parseDataType01 = x => ({ value: Number((x.readInt16BE() * 0.1).toFixed(1)), unit: '°C' }); // Temperature Data
const parseDataType02 = x => ({ value: Number(x.readUInt8().toFixed(2)), unit: '%' }); // Humidity Data
const parseDataType03 = x => ({ value: x.readInt16BE(), unit: 'mg' }); // 3-axis acceleration data (x/y/z axis)
const parseDataType04 = x => ({ value: Number((x.readInt16BE() * 0.01).toFixed(1)), unit: ' degree' }); // Three-dimension inclination angle data (x/y/z)
const parseDataType05 = x => ({ value: Number((x.readInt16BE() * 0.1).toFixed(1)), unit: 'mg' }); // Two-dimension acceleration data (x/y axis)
const parseDataType06 = x => ({ value: x.readUInt16BE(), unit: 'lm' }); // Light level in lumen
const parseDataType07 = x => ({ value: x.readUInt16BE(), unit: 'mv' }); // Battery voltage
const parseDataType08 = x => ({ value: x.readUInt8() * 0.1, unit: 'dB' }); // Sound level in dB
const parseDataType09 = x => (x.readUInt16BE() / 1000 / 60 / 60); // GPS Data
const parseDataType11 = x => ({ value: x.readUInt16BE(), unit: 'mV' }); // External sensor data (analog) in voltage
const parseDataType12 = x => ({ value: x.readUInt8() }); // External sensor data (digital), 0 or 1
const parseDataType13 = x => ({ value: x.readUInt32BE(), unit: 'Pa' }); // Atmosphere pressure in Pa
const parseDataType14 = x => ({ value: Number((x.readInt16BE() * 0.1).toFixed(1)), unit: '°C' }); // Temperature data from external temperature sensor
const parseDataType15 = x => ({ value: Number((x.readInt16BE() * 0.01).toFixed(1)), unit: 'mm' }); // Displacement data from external displacement sensor
const parseDataType16 = x => ({ value: x.readUInt8() }); // PIR Data
const parseDataType17 = x => ({ value: x.readUInt8(), unit: '%' }); // Unity of external soil humidity sensor
const parseDataType18 = x => ({ value: x.readUInt8() }); // PIR Data from external PIR sensor
const parseDataType19 = x => ({ value: x.readUInt32BE() }); // Counter data from external counter sensor
const parseDataType20detect = x => ({ value: parseInt(dec2bin(x).substr(7, 1), 2) }); // Detect switch open/close events
const parseDataType20count = x => ({ value: parseInt(dec2bin(x).substr(0, 7), 2) }); // Counter for switch open events
const parsePpmConcentration = x => ({ value: x.readUInt16BE(), unit: 'ppm' }); // Concentrations in ppm
const parseDataType38 = x => ({ value: x.readUInt16BE(), unit: 'mm' }); // Distance
const parseDataType39 = x => ({ value: Number((x.readUInt16BE() * 0.1).toFixed(1)), unit: '%' }); // CO2 concentration in %
const parseDataType40 = x => ({ value: x.readUInt16BE(), unit: 'pmm' }); // CO2 concentration in ppm
const parseDataType41 = x => ({ value: Number((x.readUInt16BE() * 10).toFixed(1)), unit: 'mA' }); // Current
const parseDataType42 = x => ({ value: x.readUInt16BE(), unit: 'PSI' }); // Pressure in PSI
const parseDataType43 = x => ({ value: x.readUInt16BE(), unit: 'ug/m3' }); // Air quality/PM for PM1.0
const parseDataType46 = x => ({ value: Number((x.readUInt16BE() * 10).toFixed(1)), unit: 'mA' }); // Average/Maximum/Minimum RMS current
const parseDataType47 = x => ({ value: x.readUInt8() }); // Ultra-violet index
const parseDataType48 = x => ({ value: x.readUInt16BE() }); // Wind direction
const parseDataType49 = x => ({ value: x.readUInt16BE(), unit: 'mm/s' }); // Wind speed
const parseDataType50 = x => ({ value: Number((x.readUInt16BE() * 0.1).toFixed(1)), unit: 'mm' }); // Rainfall
const parseDataType51statuschange = x => ({ value: parseInt(dec2bin(x).substr(3, 1), 2) }); // Status change indication
const parseDataType51reportsource = x => ({ value: parseInt(dec2bin(x).substr(1, 2), 2) }); // Source of the report
const parseDataType51currentstatus = x => ({ value: parseInt(dec2bin(x).substr(0, 1), 2) }); // Current status indication
const parseDataType52 = x => ({ value: x.readUInt16BE(), unit: 'Hz' }); // Vibration frequency in x/y/z axis
const parseDataType53 = x => ({ value: Number((x.readInt16BE() * 0.1).toFixed(1)), unit: 'mm/s' }); // Vibration velocity in x/y/z axis
const parseDataType54 = x => ({ value: Number((x.readInt16BE() * 0.1).toFixed(1)), unit: 'mm' }); // Vibration amplitude in x/y/z axis
const parseDataType55firstIR = x => ({ value: x.readUInt16BE() }); // People counter from #1 IR Sensor to #2 IR Sensor
const parseDataType55secondIR = x => ({ value: x.readUInt16BE() }); // People counter from #2 IR Sensor to #1 IR Sensor
const parseDataType56waterleak_detection = x => ({ value: parseInt(dec2bin(x).substr(7, 1), 2) }); // Water leak detection
const parseDataType56waterleak_counter = x => ({ value: parseInt(dec2bin(x).substr(0, 7), 2) }); // Counter for water leak events
const parseDataType58 = x => ({ value: Number((x.readUInt16BE() * 0.1).toFixed(1)), unit: 'mA' }); // Current information 4~20mA current output
const parseDataType59 = x => ({ value: x.readUInt16BE(), unit: 'ppb' }); // VOC concentration in ppb
const parseDataType60 = x => ({ value: Number((x.readUInt8() * 0.1).toFixed(1)), unit: 'PH' }); // PH value
const parseDataType61 = x => ({ value: Number((x.readUInt16BE() * 0.1).toFixed(1)), unit: '%' }); // O2 concentration in %

function insertData(decoded, variable, value) {
  let temp_var = `${variable}`;
  let x = 1;
  while (temp_var in decoded) {
    temp_var = `${variable}_${x}`;
    x += 1;
  }
  decoded[temp_var] = value;
}

// Start the parse of the payload
function parsePayload(payload_raw) {
  if (payload_raw[0] !== 0xD7 || payload_raw[1] !== 0x7E) {
    return null;
  }
  const decoded = {};
  const external_temperatures = [];
  let payloadWithLocation = false;
  let i = 2;
  while (i < payload_raw.length) {
    switch (payload_raw[i]) {
      case 1:
        insertData(decoded, 'temperature', parseDataType01(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 2:
        insertData(decoded, 'humidity', parseDataType02(payload_raw.slice(i + 1, i + 2)));
        i += 2;
        break;
      case 3:
        insertData(decoded, 'acceleration_x_axis', parseDataType03(payload_raw.slice(i + 1, i + 3)));
        insertData(decoded, 'acceleration_y_axis', parseDataType03(payload_raw.slice(i + 3, i + 5)));
        insertData(decoded, 'acceleration_z_axis', parseDataType03(payload_raw.slice(i + 5, i + 7)));
        i += 7;
        break;
      case 4:
        insertData(decoded, 'inclination_x_axis', parseDataType04(payload_raw.slice(i + 1, i + 3)));
        insertData(decoded, 'inclination_y_axis', parseDataType04(payload_raw.slice(i + 3, i + 5)));
        insertData(decoded, 'inclination_z_axis', parseDataType04(payload_raw.slice(i + 5, i + 7)));
        i += 7;
        break;
      case 5:
        insertData(decoded, 'acceleration_x_axis_2_dimensions', parseDataType05(payload_raw.slice(i + 1, i + 3)));
        insertData(decoded, 'acceleration_y_axis_2_dimensions', parseDataType05(payload_raw.slice(i + 3, i + 5)));
        i += 5;
        break;
      case 6:
        insertData(decoded, 'light_level', parseDataType06(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 7:
        insertData(decoded, 'battery_voltage', parseDataType07(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 8:
        insertData(decoded, 'sound_level', parseDataType08(payload_raw.slice(i + 1, i + 2)));
        i += 2;
        break;
      case 9:
        insertData(decoded, 'location', {value: `${parseDataType09(payload_raw.slice(i + 1, i + 5))}, ${parseDataType09(payload_raw.slice(i + 5, i + 9))}` });
        decoded.location.location = {
          lng: parseDataType09(payload_raw.slice(i + 1, i + 5)),
          lat: parseDataType09(payload_raw.slice(i + 5, i + 9)),
        };
        payloadWithLocation = true;
        i += 9;
        break;
      case 10:
        insertData(decoded, 'co_concentration_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 11:
        insertData(decoded, 'analog_voltage_external', parseDataType11(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 12:
        insertData(decoded, 'external_sensor_data_digital', parseDataType12(payload_raw.slice(i + 1, i + 2)));
        i += 2;
        break;
      case 13:
        insertData(decoded, 'atmosphere_pressure', parseDataType13(payload_raw.slice(i + 1, i + 5)));
        i += 5;
        break;
      case 14:
        external_temperatures.push(parseDataType14(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 15:
        insertData(decoded, 'displacement', parseDataType15(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 16:
        insertData(decoded, 'pir_data', parseDataType16(payload_raw.slice(i + 1, i + 2)));
        i += 2;
        break;
      case 17:
        insertData(decoded, 'soil_humidity', parseDataType17(payload_raw.slice(i + 1, i + 2)));
        i += 2;
        break;
      case 18:
        insertData(decoded, 'pir_data_external', parseDataType18(payload_raw.slice(i + 1, i + 2)));
        i += 2;
        break;
      case 19:
        insertData(decoded, 'count_from_external_counter_sensor', parseDataType18(payload_raw.slice(i + 1, i + 5)));
        i += 5;
        break;
      case 20:
        insertData(decoded, 'detect_switch_events', parseDataType20detect(payload_raw.slice(i + 1, i + 2)));
        insertData(decoded, 'count_switch_events', parseDataType20count(payload_raw.slice(i + 1, i + 2)));
        i += 2;
        break;
      case 21:
        insertData(decoded, 'nh3_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 22:
        insertData(decoded, 'ash3_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 23:
        insertData(decoded, 'c6h6_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 24:
        insertData(decoded, 'ci2_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 25:
        insertData(decoded, 'h2_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 26:
        insertData(decoded, 'h2s_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 27:
        insertData(decoded, 'hcl_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 28:
        insertData(decoded, 'hcn_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 29:
        insertData(decoded, 'hf_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 30:
        insertData(decoded, 'no2_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 31:
        insertData(decoded, 'o3_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 32:
        insertData(decoded, 'ph3_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 33:
        insertData(decoded, 'so2_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 34:
        insertData(decoded, 'ch4_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 35:
        insertData(decoded, 'c2h2_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 36:
        insertData(decoded, 'gasoline_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 37:
        insertData(decoded, 'c2h4o3_ppm', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 38:
        insertData(decoded, 'distance', parseDataType38(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 39:
        insertData(decoded, 'co2_percentual_concentration', parseDataType39(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 40:
        insertData(decoded, 'co2_ppm_concentration', parseDataType40(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 41:
        insertData(decoded, 'current', parseDataType41(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 42:
        insertData(decoded, 'pressure_in_psi', parseDataType42(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 43:
        insertData(decoded, 'air_quality_pm1', parseDataType43(payload_raw.slice(i + 1, i + 3)));
        insertData(decoded, 'air_quality_pm2_5', parseDataType43(payload_raw.slice(i + 3, i + 5)));
        insertData(decoded, 'air_quality_pm10', parseDataType43(payload_raw.slice(i + 5, i + 7)));
        i += 7;
        break;
      case 44:
        [...dec2bin(payload_raw[i + 1])].reverse().forEach((bit, j) => {
          if (bit === '1') {
            insertData(decoded, `external_temperature_sensor${j + 1}`, external_temperatures[external_temperatures.length - j - 1]);
          }
        });
        i += 2;
        break;
      case 45:
        [...dec2bin(payload_raw.readUInt16BE(i + 1))].reverse().forEach((bit, j) => {
          if (bit === '1') {
            insertData(decoded, `external_temperature_sensor${j + 1}`, external_temperatures[external_temperatures.length - j - 1]);
          }
        });
        i += 3;
        break;
      case 46:
        insertData(decoded, 'average_rms_current', parseDataType46(payload_raw.slice(i + 1, i + 3)));
        insertData(decoded, 'max_rms_current', parseDataType46(payload_raw.slice(i + 3, i + 5)));
        insertData(decoded, 'min_rms_current', parseDataType46(payload_raw.slice(i + 5, i + 7)));
        i += 7;
        break;
      case 47:
        insertData(decoded, 'ultra_violet_index', parseDataType47(payload_raw.slice(i + 1, i + 2)));
        i += 2;
        break;
      case 48:
        insertData(decoded, 'wind_direction', parseDataType48(payload_raw.slice(i + 1, i + 2)));
        i += 2;
        break;
      case 49:
        insertData(decoded, 'wind_speed', parseDataType49(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 50:
        insertData(decoded, 'rainfall', parseDataType50(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 51:
        insertData(decoded, 'motion_status_change_indication', parseDataType51statuschange(payload_raw.slice(i + 1, i + 2)));
        insertData(decoded, 'motion_status_report_source', parseDataType51reportsource(payload_raw.slice(i + 1, i + 2)));
        insertData(decoded, 'motion_current_status_indication', parseDataType51currentstatus(payload_raw.slice(i + 1, i + 2)));
        i += 2;
        break;
      case 52:
        insertData(decoded, 'vibration_frequency_x_axis', parseDataType52(payload_raw.slice(i + 1, i + 3)));
        insertData(decoded, 'vibration_frequency_y_axis', parseDataType52(payload_raw.slice(i + 3, i + 5)));
        insertData(decoded, 'vibration_frequency_z_axis', parseDataType52(payload_raw.slice(i + 5, i + 7)));
        i += 7;
        break;
      case 53:
        insertData(decoded, 'vibration_velocity_x_axis', parseDataType53(payload_raw.slice(i + 1, i + 3)));
        insertData(decoded, 'vibration_velocity_y_axis', parseDataType53(payload_raw.slice(i + 3, i + 5)));
        insertData(decoded, 'vibration_velocity_z_axis', parseDataType53(payload_raw.slice(i + 5, i + 7)));
        i += 7;
        break;
      case 54:
        insertData(decoded, 'vibration_amplitude_x_axis', parseDataType54(payload_raw.slice(i + 1, i + 3)));
        insertData(decoded, 'vibration_amplitude_y_axis', parseDataType54(payload_raw.slice(i + 3, i + 5)));
        insertData(decoded, 'vibration_amplitude_z_axis', parseDataType54(payload_raw.slice(i + 5, i + 7)));
        i += 7;
        break;
      case 55:
        insertData(decoded, 'counter_first_ir', parseDataType55firstIR(payload_raw.slice(i + 1, i + 3)));
        insertData(decoded, 'counter_second_ir', parseDataType55secondIR(payload_raw.slice(i + 3, i + 5)));
        i += 5;
        break;
      case 56:
        insertData(decoded, 'water_leak_detection', parseDataType56waterleak_detection(payload_raw.slice(i + 1, i + 2)));
        insertData(decoded, 'water_leak_count', parseDataType56waterleak_counter(payload_raw.slice(i + 1, i + 2)));
        i += 2;
        break;
      case 57:
        insertData(decoded, 'ch20_concentration', parsePpmConcentration(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 58:
        insertData(decoded, 'current_information', parseDataType58(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 59:
        insertData(decoded, 'voc_concentration', parseDataType59(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      case 60:
        insertData(decoded, 'ph_value', parseDataType60(payload_raw.slice(i + 1, i + 2)));
        i += 2;
        break;
      case 61:
        insertData(decoded, 'o2_concentration', parseDataType61(payload_raw.slice(i + 1, i + 3)));
        i += 3;
        break;
      default:
        return null;
    }
  }

  if (payloadWithLocation) {
    for (const data in decoded) {
      if (decoded[data].variable !== 'location') {
        decoded[data].location = { lat: decoded.location.location.lat, lgn: decoded.location.location.lng };
      }
    }
  }
  return decoded;
}

// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => ['payload', 'payload_raw', 'data'].includes(x.variable));
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const serie = payload_raw.serie || new Date().getTime();
  const { value } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = toTagoFormat(parsePayload(Buffer.from(payload_raw.value, 'hex')), serie);
  }
  console.log(payload);
}
