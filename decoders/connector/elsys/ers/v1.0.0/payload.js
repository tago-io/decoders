const TYPE_TEMP         = 0x01; // temp 2 bytes -3276.8°C -->3276.7°C
const TYPE_RH           = 0x02; // Humidity 1 byte  0-100%
const TYPE_ACC          = 0x03; // acceleration 3 bytes X,Y,Z -128 --> 127 +/-63=1G
const TYPE_LIGHT        = 0x04; // Light 2 bytes 0-->65535 Lux
const TYPE_MOTION       = 0x05; // No of motion 1 byte  0-255
const TYPE_CO2          = 0x06; // Co2 2 bytes 0-65535 ppm
const TYPE_VDD          = 0x07; // VDD 2byte 0-65535mV
const TYPE_ANALOG1      = 0x08; // VDD 2byte 0-65535mV
const TYPE_GPS          = 0x09; // 3bytes lat 3bytes long binary
const TYPE_PULSE1       = 0x0A; // 2bytes relative pulse count
const TYPE_PULSE1_ABS   = 0x0B;  // 4bytes no 0->0xFFFFFFFF
const TYPE_EXT_TEMP1    = 0x0C;  // 2bytes -3276.5C-->3276.5C
const TYPE_EXT_DIGITAL  = 0x0D;  // 1bytes value 1 or 0
const TYPE_EXT_DISTANCE = 0x0E;  // 2bytes distance in mm
const TYPE_ACC_MOTION   = 0x0F;  // 1byte number of vibration/motion
const TYPE_IR_TEMP      = 0x10;  // 2bytes internal temp 2bytes external temp -3276.5C-->3276.5C
const TYPE_OCCUPANCY    = 0x11;  // 1byte data
const TYPE_WATERLEAK    = 0x12;  // 1byte data 0-255
const TYPE_GRIDEYE      = 0x13;  // 65byte temperature data 1byte ref+64byte external temp
const TYPE_PRESSURE     = 0x14;  // 4byte pressure data (hPa)
const TYPE_SOUND        = 0x15;  // 2byte sound data (peak/avg)
const TYPE_PULSE2       = 0x16;  // 2bytes 0-->0xFFFF
const TYPE_PULSE2_ABS   = 0x17;  // 4bytes no 0->0xFFFFFFFF
const TYPE_ANALOG2      = 0x18;  // 2bytes voltage in mV
const TYPE_EXT_TEMP2    = 0x19;  // 2bytes -3276.5C-->3276.5C
const TYPE_EXT_DIGITAL2 = 0x1A;  // 1bytes value 1 or 0
const TYPE_EXT_ANALOG_UV = 0x1B; // 4 bytes signed int (uV)
const TYPE_DEBUG        = 0x3D;  // 4bytes debug

function toTagoFormat(object_item, group, prefix = '', loc_var) {
  let location_var;
  if (loc_var) location_var = { ...loc_var.location };

  const result = [];
  for (const key in object_item) {
    // if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] === 'object') {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        group: object_item[key].group || group,
        metadata: object_item[key].metadata,
        location: object_item[key].location || location_var,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        location: location_var,
        group,
      });
    }
  }

  return result;
}

function bin16dec(bin) {
  let num = bin & 0xFFFF;
  if (0x8000 & num) num = -(0x010000 - num);
  return num;
}
function bin8dec(bin) {
  let num = bin & 0xFF;
  if (0x80 & num) num = -(0x0100 - num);
  return num;
}
function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}
function DecodeElsysPayload(data) {
  const obj = new Object();
  for (i = 0; i < data.length; i++) {
    // console.log(data[i]);
    switch (data[i]) {
      case TYPE_TEMP: // Temperature
        var temp = (data[i + 1] << 8) | (data[i + 2]);
        temp = bin16dec(temp);
        obj.temperature = { value: temp / 10, unit: '°C' };
        i += 2;
        break;
      case TYPE_RH: // Humidity
        var rh = (data[i + 1]);
        obj.humidity = { value: rh, unit: '%' };
        i += 1;
        break;
      case TYPE_ACC: // Acceleration
        obj.x = bin8dec(data[i + 1]);
        obj.y = bin8dec(data[i + 2]);
        obj.z = bin8dec(data[i + 3]);
        i += 3;
        break;
      case TYPE_LIGHT: // Light
        obj.light = { value: (data[i + 1] << 8) | (data[i + 2]), unit: 'Lux' };
        i += 2;
        break;
      case TYPE_MOTION: // Motion sensor(PIR)
        obj.motion = (data[i + 1]);
        i += 1;
        break;
      case TYPE_CO2: // CO2
        obj.co2 = { value: (data[i + 1] << 8) | (data[i + 2]), unit: 'ppm' };
        i += 2;
        break;
      case TYPE_VDD: // Battery level
        obj.vdd = { value: (data[i + 1] << 8) | (data[i + 2]), unit: 'mV' };
        i += 2;
        break;
      case TYPE_ANALOG1: // Analog input 1
        obj.analog1 = { value: (data[i + 1] << 8) | (data[i + 2]), unit: 'mV' };
        i += 2;
        break;
      case TYPE_GPS: // gps
        const lat = (data[i + 1] << 16) | (data[i + 2] << 8) | (data[i + 3]);
        const lng = (data[i + 4] << 16) | (data[i + 5] << 8) | (data[i + 6]);
        obj.location = { value: `${lat},${lng}`, location: { lat, lng } };
        i += 6;
        break;
      case TYPE_PULSE1: // Pulse input 1
        obj.pulse1 = (data[i + 1] << 8) | (data[i + 2]);
        i += 2;
        break;
      case TYPE_PULSE1_ABS: // Pulse input 1 absolute value
        var pulseAbs = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
        obj.pulseAbs = pulseAbs;
        i += 4;
        break;
      case TYPE_EXT_TEMP1: // External temp
        var temp = (data[i + 1] << 8) | (data[i + 2]);
        temp = bin16dec(temp);
        obj.externalTemperature = { value: temp / 10, unit: '°C' };
        i += 2;
        break;
      case TYPE_EXT_DIGITAL: // Digital input
        obj.digital = (data[i + 1]);
        i += 1;
        break;
      case TYPE_EXT_DISTANCE: // Distance sensor input
        obj.distance = { value: (data[i + 1] << 8) | (data[i + 2]), unit: 'mm' };
        i += 2;
        break;
      case TYPE_ACC_MOTION: // Acc motion
        obj.accMotion = (data[i + 1]);
        i += 1;
        break;
      case TYPE_IR_TEMP: // IR temperature
        var iTemp = (data[i + 1] << 8) | (data[i + 2]);
        iTemp = bin16dec(iTemp);
        var eTemp = (data[i + 3] << 8) | (data[i + 4]);
        eTemp = bin16dec(eTemp);
        obj.irInternalTemperature = { value: iTemp / 10, unit: '°C' };
        obj.irExternalTemperature = { value: eTemp / 10, unit: '°C' };
        i += 4;
        break;
      case TYPE_OCCUPANCY: // Body occupancy
        obj.occupancy = (data[i + 1]);
        i += 1;
        break;
      case TYPE_WATERLEAK: // Water leak
        obj.waterleak = (data[i + 1]);
        i += 1;
        break;
      case TYPE_GRIDEYE: // Grideye data
        var ref = data[i + 1];
        i++;
        obj.grideye = [];
        for (let j = 0; j < 64; j++) {
          obj.grideye[j] = ref + (data[1 + i + j] / 10.0);
        }
        i += 64;
        break;
      case TYPE_PRESSURE: // External Pressure
        var temp = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
        obj.pressure = { value: temp / 1000, unit: 'hPa' };
        i += 4;
        break;
      case TYPE_SOUND: // Sound
        obj.soundPeak = data[i + 1];
        obj.soundAvg = data[i + 2];
        i += 2;
        break;
      case TYPE_PULSE2: // Pulse 2
        obj.pulse2 = (data[i + 1] << 8) | (data[i + 2]);
        i += 2;
        break;
      case TYPE_PULSE2_ABS: // Pulse input 2 absolute value
        obj.pulseAbs2 = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
        i += 4;
        break;
      case TYPE_ANALOG2: // Analog input 2
        obj.analog2 = { value: (data[i + 1] << 8) | (data[i + 2]), unit: 'mV' };
        i += 2;
        break;
      case TYPE_EXT_TEMP2: // External temp 2
        var temp = (data[i + 1] << 8) | (data[i + 2]);
        temp = bin16dec(temp);
        obj.externalTemperature2 = { value: temp / 10, unit: '°C' };
        i += 2;
        break;
      case TYPE_EXT_DIGITAL2: // Digital input 2
        obj.digital2 = (data[i + 1]);
        i += 1;
        break;
      case TYPE_EXT_ANALOG_UV: // Load cell analog uV
        obj.analogUv = { value: (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]), unit: 'uV' };
        i += 4;
        break;
      default: // somthing is wrong with data
        i = data.length;
        break;
    }
  }
  return obj;
}

function Decoder(bytes, port) {
  return DecodeElsysPayload(bytes);
}


// payload = [{ variable: 'payload', value: '0100e202290400270506060308070d62', group: '122a' }];

const data = payload.find(x => x.variable === 'data' || x.variable === 'payload');
if (data) {
  const group = String(data.group || Date.now());
  const vars_to_tago = Decoder(Buffer.from(data.value, 'hex'));

  payload = [...payload, ...toTagoFormat(vars_to_tago, group, '', vars_to_tago.location)];
  // payload = payload.filter(x => !ignore_vars.includes(x.variable));
}
