/**
 * TagoIO Payload Parser for Milesight UC50x
 * Converts Milesight UC50x LoRaWAN payloads into TagoIO format
 *
 * Supports: GPIO, ADC, SDI-12, Modbus, Battery, Device Status, and History Data
 */

var RAW_VALUE = 0x00;
var gpio_chns = [0x03, 0x04];
var adc_chns = [0x05, 0x06];
var adc_alarm_chns = [0x85, 0x86];

/**
 * Main Milesight device decoder function
 * @param {Array} bytes - Byte array from hex payload
 * @param {string} group - Group identifier
 * @param {string} time - Timestamp
 * @returns {Array} Array of TagoIO data objects
 */
function milesightDeviceDecode(bytes: number[], group: string, time: string) {
  var data: any = [];
  var decoded: any = {};

  for (var i = 0; i < bytes.length; ) {
    var channel_id = bytes[i++];
    var channel_type = bytes[i++];

    // IPSO VERSION
    if (channel_id === 0xff && channel_type === 0x01) {
      decoded.ipso_version = readProtocolV(bytes[i]);
      i += 1;
    }
    // HARDWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x09) {
      decoded.hardware_version = readHardwareV(bytes.slice(i, i + 2));
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x0a) {
      decoded.firmware_version = readFirmwareV(bytes.slice(i, i + 2));
      i += 2;
    }
    // TSL VERSION
    else if (channel_id === 0xff && channel_type === 0xff) {
      decoded.tsl_version = readTslV(bytes.slice(i, i + 2));
      i += 2;
    }
    // SERIAL NUMBER
    else if (channel_id === 0xff && channel_type === 0x16) {
      decoded.sn = readSerialN(bytes.slice(i, i + 8));
      i += 8;
    }
    // LORAWAN CLASS TYPE
    else if (channel_id === 0xff && channel_type === 0x0f) {
      decoded.lorawan_class = readLoRaWANC(bytes[i]);
      i += 1;
    }
    // RESET EVENT
    else if (channel_id === 0xff && channel_type === 0xfe) {
      decoded.reset_event = readResetEvent(1);
      i += 1;
    }
    // DEVICE STATUS
    else if (channel_id === 0xff && channel_type === 0x0b) {
      decoded.device_status = readOnOffStatus(1);
      i += 1;
    }
    // BATTERY
    else if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.battery = readUI8(bytes[i]);
      i += 1;
    }
    // GPIO (Input)
    else if (includesContains(gpio_chns, channel_id) && channel_type === 0x00) {
      var gpio_channel_name = "gpio_input_" + (channel_id - gpio_chns[0] + 1);
      decoded[gpio_channel_name] = readOnOffStatus(bytes[i]);
      i += 1;
    }
    // GPIO (Output)
    else if (includesContains(gpio_chns, channel_id) && channel_type === 0x01) {
      var gpio_channel_name = "gpio_output_" + (channel_id - gpio_chns[0] + 1);
      decoded[gpio_channel_name] = readOnOffStatus(bytes[i]);
      i += 1;
    }
    // GPIO (GPIO as PULSE COUNTER)
    else if (includesContains(gpio_chns, channel_id) && channel_type === 0xc8) {
      var gpio_channel_name = "gpio_counter_" + (channel_id - gpio_chns[0] + 1);
      decoded[gpio_channel_name] = readUI32LE(bytes.slice(i, i + 4));
      i += 4;
    }
    // ANALOG INPUT TYPE
    else if (channel_id === 0xff && channel_type === 0x14) {
      var channel = bytes[i];
      var chn_name = "analog_input_" + (channel >>> 4) + "_type";
      decoded[chn_name] = readAnalogInputType(channel & 0x0f);
      i += 1;
    }
    // ADC (UC50x v2)
    else if (includesContains(adc_chns, channel_id) && channel_type === 0x02) {
      var adc_channel_name = "analog_input_" + (channel_id - adc_chns[0] + 1);
      decoded[adc_channel_name] = readI16LE(bytes.slice(i, i + 2)) / 1000;
      decoded[adc_channel_name + "_min"] = readI16LE(bytes.slice(i + 2, i + 4)) / 1000;
      decoded[adc_channel_name + "_max"] = readI16LE(bytes.slice(i + 4, i + 6)) / 1000;
      decoded[adc_channel_name + "_avg"] = readI16LE(bytes.slice(i + 6, i + 8)) / 1000;
      i += 8;
    }
    // ADC (UC50x v3)
    else if (includesContains(adc_chns, channel_id) && channel_type === 0xe2) {
      var adc_channel_name = "analog_input_" + (channel_id - adc_chns[0] + 1);
      decoded[adc_channel_name] = readFloat16LE(bytes.slice(i, i + 2));
      decoded[adc_channel_name + "_min"] = readFloat16LE(bytes.slice(i + 2, i + 4));
      decoded[adc_channel_name + "_max"] = readFloat16LE(bytes.slice(i + 4, i + 6));
      decoded[adc_channel_name + "_avg"] = readFloat16LE(bytes.slice(i + 6, i + 8));
      i += 8;
    }
    // SDI-12
    else if (channel_id === 0x08 && channel_type === 0xdb) {
      var name = "sdi12_" + (bytes[i++] + 1);
      decoded[name] = readString(bytes.slice(i, i + 36));
      i += 36;
    }
    // MODBUS
    else if ((channel_id === 0xff || channel_id === 0x80) && channel_type === 0x0e) {
      var modbus_chn_id = bytes[i++] - 6;
      var package_type = bytes[i++];
      var data_type = package_type & 0x07;
      var chn = "modbus_chn_" + modbus_chn_id;
      switch (data_type) {
        case 0:
        case 1:
          decoded[chn] = readOnOffStatus(bytes[i]);
          i += 1;
          break;
        case 2:
        case 3:
          decoded[chn] = readUI16LE(bytes.slice(i, i + 2));
          i += 2;
          break;
        case 4:
        case 6:
          decoded[chn] = readUI32LE(bytes.slice(i, i + 4));
          i += 4;
          break;
        case 5:
        case 7:
          decoded[chn] = readFlLE(bytes.slice(i, i + 4));
          i += 4;
          break;
      }
      if (channel_id === 0x80) {
        decoded[chn + "_alarm"] = readAlarm(bytes[i++]);
      }
    }
    // MODBUS READ ERROR
    else if (channel_id === 0xff && channel_type === 0x15) {
      var modbus_error_chn_id = bytes[i] - 6;
      var channel_name = "modbus_chn_" + modbus_error_chn_id;
      decoded[channel_name + "_alarm"] = "read error";
      i += 1;
    }
    // ADC alert (UC50x v3)
    else if (includesContains(adc_alarm_chns, channel_id) && channel_type === 0xe2) {
      var adc_channel_name = "analog_input_" + (channel_id - adc_alarm_chns[0] + 1);
      decoded[adc_channel_name] = readFloat16LE(bytes.slice(i, i + 2));
      decoded[adc_channel_name + "_min"] = readFloat16LE(bytes.slice(i + 2, i + 4));
      decoded[adc_channel_name + "_max"] = readFloat16LE(bytes.slice(i + 4, i + 6));
      decoded[adc_channel_name + "_avg"] = readFloat16LE(bytes.slice(i + 6, i + 8));
      i += 8;
      decoded[adc_channel_name + "_alarm"] = readAlarm(bytes[i++]);
    }
    // HISTORY DATA (GPIO / ADC)
    else if (channel_id === 0x20 && channel_type === 0xdc) {
      var timestamp = readUI32LE(bytes.slice(i, i + 4));
      var historyData: any = { timestamp: timestamp };
      var gpio_1_type = readUI8(bytes[i + 4]);
      if (gpio_1_type === 0x00) {
        historyData.gpio_input_1 = readOnOffStatus(readUI32LE(bytes.slice(i + 5, i + 9)));
      } else if (gpio_1_type === 0x01) {
        historyData.gpio_output_1 = readOnOffStatus(readUI32LE(bytes.slice(i + 5, i + 9)));
      } else if (gpio_1_type === 0x02) {
        historyData.gpio_counter_1 = readUI32LE(bytes.slice(i + 5, i + 9));
      }
      var gpio_2_type = readUI8(bytes[i + 9]);
      if (gpio_2_type === 0x00) {
        historyData.gpio_input_2 = readOnOffStatus(readUI32LE(bytes.slice(i + 10, i + 14)));
      } else if (gpio_2_type === 0x01) {
        historyData.gpio_output_2 = readOnOffStatus(readUI32LE(bytes.slice(i + 10, i + 14)));
      } else if (gpio_2_type === 0x02) {
        historyData.gpio_counter_2 = readUI32LE(bytes.slice(i + 10, i + 14));
      }
      historyData.analog_input_1 = readI32LE(bytes.slice(i + 14, i + 18)) / 1000;
      historyData.analog_input_2 = readI32LE(bytes.slice(i + 18, i + 22)) / 1000;
      i += 22;
      decoded.history = decoded.history || [];
      decoded.history.push(historyData);
    }
    // Handle other cases...
    else {
      break;
    }
  }

  // Convert decoded object to TagoIO format
  for (var key in decoded) {
    if (decoded.hasOwnProperty(key)) {
      var value = decoded[key];
      var unit = getUnitForVariable(key);

      if (key === "history" && Array.isArray(value)) {
        // Handle history data as metadata
        data.push({
          variable: "history_data",
          value: value.length,
          unit: "records",
          group: group,
          time: time,
          metadata: { history: value },
        });
      } else if (key === "battery") {
        data.push({
          variable: key,
          value: value,
          unit: "%",
          group: group,
          time: time,
        });
      } else {
        data.push({
          variable: key,
          value: value,
          unit: unit,
          group: group,
          time: time,
        });
      }
    }
  }

  return data;
}

/**
 * Get appropriate unit for variable
 * @param {string} variableName - Variable name
 * @returns {string} Unit string
 */
function getUnitForVariable(variableName: string) {
  if (variableName.includes("analog_input") && !variableName.includes("type")) {
    return "V"; // Voltage or Current
  }
  if (variableName.includes("counter")) {
    return "count";
  }
  if (variableName === "battery") {
    return "%";
  }
  if (variableName.includes("temperature")) {
    return "°C";
  }
  if (variableName.includes("humidity")) {
    return "%";
  }
  return undefined;
}

/**
 * Read protocol version
 * @param {number} bytes - Byte array
 * @returns {string} Protocol version
 */
function readProtocolV(bytes: number) {
  var major = (bytes & 0xf0) >> 4;
  var minor = bytes & 0x0f;
  return "v" + major + "." + minor;
}

/**
 *
 * @param {number} bytes - Byte array
 * @returns
 */
function readHardwareV(bytes: number[]) {
  var major = (bytes[0] & 0xff).toString(16);
  var minor = (bytes[1] & 0xff) >> 4;
  return "v" + major + "." + minor;
}

/**
 * Read firmware version
 * @param {number} bytes - Byte array
 * @returns {string} Firmware version
 */
function readFirmwareV(bytes: number[]) {
  var major = (bytes[0] & 0xff).toString(16);
  var minor = (bytes[1] & 0xff).toString(16);
  return "v" + major + "." + minor;
}

/**
 * Read TSL version
 * @param {number} bytes - Byte array
 * @returns {string} TSL version
 */
function readTslV(bytes: number[]) {
  var major = bytes[0] & 0xff;
  var minor = bytes[1] & 0xff;
  return "v" + major + "." + minor;
}

/**
 * Read serial number
 * @param {number} bytes - Byte array
 * @returns {string} Serial number
 */
function readSerialN(bytes: number[]) {
  var temp: any = [];
  for (var idx = 0; idx < bytes.length; idx++) {
    temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
  }
  return temp.join("");
}

/**
 * Read LoRaWAN class type
 * @param {number} type - LoRaWAN class type
 * @returns {string} LoRaWAN class type
 */
function readLoRaWANC(type: number) {
  var class_map = {
    0: "Class A",
    1: "Class B",
    2: "Class C",
    3: "Class CtoB",
  };
  return getValue(class_map, type);
}

/**
 * Read reset event
 * @param {number} status - Reset event status
 * @returns {string} Reset event status
 */
function readResetEvent(status: number) {
  var status_map = { 0: "normal", 1: "reset" };
  return getValue(status_map, status);
}

/**
 * Read on/off status
 * @param {number} status - On/off status
 * @returns {string} On/off status
 */
function readOnOffStatus(status: number) {
  var status_map = { 0: "off", 1: "on" };
  return getValue(status_map, status);
}

/**
 * Read alarm
 * @param {number} type - Alarm type
 * @returns {string} Alarm type
 */
function readAlarm(type: number) {
  var alarm_map = { 1: "threshold alarm", 2: "value change alarm" };
  return getValue(alarm_map, type);
}

/**
 * Read analog input type
 * @param {number} type - Analog input type
 * @returns {string} Analog input type
 */
function readAnalogInputType(type: number) {
  var type_map = { 0: "current", 1: "voltage" };
  return getValue(type_map, type);
}

/**
 * Read unsigned 8-bit integer
 * @param {number} bytes - Byte array
 * @returns {number} Unsigned 8-bit integer
 */
function readUI8(bytes: number) {
  return bytes & 0xff;
}

/**
 * Read signed 16-bit integer
 * @param {number} bytes - Byte array
 * @returns {number} Signed 16-bit integer
 */
function readI16LE(bytes: number[]) {
  var ref = readUI16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

/**
 * Read unsigned 16-bit integer
 * @param {number} bytes - Byte array
 * @returns {number} Unsigned 16-bit integer
 */
function readUI16LE(bytes: number[]) {
  var value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

/**
 * Read unsigned 32-bit integer
 * @param {number} bytes - Byte array
 * @returns {number} Unsigned 32-bit integer
 */
function readUI32LE(bytes: number[]) {
  var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return value & 0xffffffff;
}

/**
 * Read signed 32-bit integer
 * @param {number} bytes - Byte array
 * @returns {number} Signed 32-bit integer
 */
function readI32LE(bytes: number[]) {
  var ref = readUI32LE(bytes);
  return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

/**
 * Read float 16-bit integer
 * @param {number} bytes - Byte array
 * @returns {number} Float 16-bit integer
 */
function readFloat16LE(bytes: number[]) {
  var bits = (bytes[1] << 8) | bytes[0];
  var sign = bits >>> 15 === 0 ? 1.0 : -1.0;
  var e = (bits >>> 10) & 0x1f;
  var m = e === 0 ? (bits & 0x3ff) << 1 : (bits & 0x3ff) | 0x400;
  var f = sign * m * Math.pow(2, e - 25);
  return f;
}

/**
 * Read float 32-bit integer
 * @param {number} bytes - Byte array
 * @returns {number} Float 32-bit integer
 */
function readFlLE(bytes: number[]) {
  var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
  var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
  var e = (bits >>> 23) & 0xff;
  var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return f;
}

/**
 * Read string
 * @param {number} bytes - Byte array
 * @returns {string} String
 */
function readString(bytes: number[]) {
  var str = "";
  for (var i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) {
      break;
    }
    str += String.fromCharCode(bytes[i]);
  }
  return str;
}

/**
 * Check if data contains value
 * @param {number} data - Data array
 * @param {number} value - Value to check
 * @returns {boolean} True if data contains value, false otherwise
 */
function includesContains(data: number[], value: number) {
  var size = data.length;
  for (var i = 0; i < size; i++) {
    if (data[i] == value) {
      return true;
    }
  }
  return false;
}

/**
 * Get value from map
 * @param {number} map - Map
 * @param {number} key - Key
 * @returns {string} Value
 */
function getValue(map: any, key: number) {
  if (RAW_VALUE) return key;
  var value = map[key];
  if (!value) value = "unknown";
  return value;
}

// Main TagoIO payload processing
const dataPayload = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));
const portData = payload.find((x) => ["port", "fport"].includes(x.variable));

if (dataPayload) {
  try {
    // Convert hex string to byte array
    const hexString = dataPayload.value;
    const bytes: any = [];
    for (let i = 0; i < hexString.length; i += 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
    }

    // Generate group and time
    const group = dataPayload.group || `${new Date().getTime()}-${Math.random().toString(36).substring(2, 5)}`;
    const time = dataPayload.time || new Date().toISOString();

    // Decode the payload
    const decodedData: any = milesightDeviceDecode(bytes, group, time);

    // Add port information if available
    if (portData) {
      decodedData.push({
        variable: "port",
        value: portData.value,
        group: group,
        time: time,
      });
    }

    // Replace payload with decoded data
    payload = decodedData;
  } catch (error) {
    payload = [
      {
        variable: "parser_error",
        value: `Milesight UC50x parsing failed: ${error.message}`,
        time: dataPayload.time || new Date().toISOString(),
      },
    ];
  }
}
