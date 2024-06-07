/* 
 * uDEV Payload Parser to PMS100
 *
 * This code finds the variable 'data' 
 * Then parse uDEV PMS100 to TagoIo format.
 * You'll need to implement the other modes yourself by editing this code.
 */

// convert hex to dec
function convert_hex2dec(num) {
  return parseInt((num), 16).toString(10);
}

// special convert hex to dec 2 bytes
function special_convert_hex2bin(num) {
  let bin = String(parseInt(num, 16).toString(2));
  if (bin.length < 8) {
    const addzero = 8 - bin.length;
    for (let index = 0; index < addzero; index++) {
      bin = `0${bin}`;
    }
  }
  return bin;
}
// convert hex to dec 2 bytes
function extract_number_2Bytes_inverted(message, low, high) {
  const hex = `${message[high]}${message[low]}`; // first high - second low. inverted byte
  return convert_hex2dec(hex);
}

// special convert hex to dec 1 byte
function special_extract_number_1Byte(message, low) {
  const hex = `${message[low]}`;
  return special_convert_hex2bin(hex);
}

// convert hex to dec 2 bytes
function extract_number_1Byte(message, low) {
  const hex = `${message[low]}`;
  return convert_hex2dec(hex);
}

// find variable data and check if it exists
const data = payload.find(x => x.variable === 'data');
if (!data) throw 'Variable data can not be found';

const serie = data.serie || Date.now();
const time = data.time || undefined;
const data_value = String(data.value);
const bytes = [];

for (let i = 0; i < data_value.length; i += 2) {
  bytes.push(`${data_value[i]}${data_value[i + 1]}`);
}

const byte1 = special_extract_number_1Byte(bytes, 0);
let sequence;
let mode_operation;
let event;

if (String(byte1).length === 8) {
  sequence = String(byte1).slice(0, 3);
  mode_operation = String(byte1).slice(3, 5);
  event = String(byte1).slice(5, 8);
}

const battery = extract_number_1Byte(bytes, 1) / 10;
const temperature = extract_number_1Byte(bytes, 2);
const humidity = extract_number_1Byte(bytes, 3);


if (bytes.length === 6) {
  const pulse = extract_number_2Bytes_inverted(bytes, 4, 5);
  payload.push({ variable: 'pulse_count', value: Number(pulse), serie, time, unit: 'Pulses' });
} else {
  const external_status = extract_number_1Byte(bytes, 4);
  payload.push({ variable: 'external_status', value: Number(external_status), serie, time });
}

// pushing parsed data
payload.push({
  variable: 'mode_operation',
  value: Number(mode_operation) === 0 ? 'Pulse counter mode' : 'External event mode',
  metadata: { mode_operation: Number(mode_operation) },
  serie,
  time,
}, {
    variable: 'event',
    value: Number(event) === 0 ? 'Periodic timer event' :  Number(event) === 1 ? 'Button pressed' : 'External occurrence',
    metadata: { sequence: Number(sequence), event: Number(event) },
    serie,
    time,
  }, {
    variable: 'battery',
    value: Number(battery),
    unit: 'V',
    serie,
    time,
  }, {
    variable: 'temperature',
    value: Number(temperature),
    unit: '°C',
    serie,
    time,
  }, {
    variable: 'humidity',
    value: Number(humidity),
    unit: '%',
    serie,
    time,
  });