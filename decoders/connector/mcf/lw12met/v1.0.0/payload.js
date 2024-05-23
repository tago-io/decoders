function reverse(str) {
  return str.match(/[a-fA-F0-9]{2}/g).reverse().join('');
}
 
function parseDate(payload) {
  const bin2 = Number(`0x${reverse(payload)}`).toString(2).padStart(32, '0');
  const year = parseInt(bin2.substring(0, 7), 2) + 2000;
  const month = parseInt(bin2.substring(7, 11), 2) - 1;
  const day = parseInt(bin2.substring(11, 16), 2);
  const hour = parseInt(bin2.substring(16, 21), 2);
  const minute = parseInt(bin2.substring(21, 27), 2);
  const second = parseInt(bin2.substring(27, 32), 2) * 2;
  return new Date(year, month, day, hour, minute, second, 0).toISOString();
}
 
function parseTimeSync(payload, serie) {
  // Parse all data and format to TagoIO JSON format.
  const sync_id = { variable: 'sync_id', serie, value: payload.substring(2, 10) };
  const sync_version = { variable: 'sync_version', serie, value: payload.substring(10, 16) };
  const application_type = { variable: 'application_type', serie, value: payload.substring(16, 20) };
  const rfu = { variable: 'rfu', serie, value: payload.substring(20) };
 
  // Return an array with the content.
  return [
    sync_id,
    sync_version,
    application_type,
    rfu,
  ];
}
 
 
function parseMetering(payload) {
  const time = parseDate(payload.substring(2, 10));
  const serie = time;
  const date = { variable: 'date', value: time, time, serie };
 
  var activeEnergy = parseSignedInt(payload.substring(10, 18));
  var reactiveEnergy = parseSignedInt(payload.substring(18, 26));
  var apparentEnergy = parseSignedInt(payload.substring(26, 34));
 
  const activeEnergyConst = { variable: 'activeEnergy', value: activeEnergy, unit: 'Wh', time, serie };
  const reactiveEnergyConst = { variable: 'reactiveEnergy', value: reactiveEnergy, unit: 'VARh', time, serie };
  const apparentEnergyConst = { variable: 'apparentEnergy', value: apparentEnergy, unit: 'VAh', time, serie };
 
  if (payload.length <= 42) {
    var activation = parseUnsignedInt(payload.substring(34, 42));
    const activationConst = { variable: 'activation', value: activation, time, unit: 's', serie };
    return [
      date,
      activeEnergyConst,
      reactiveEnergyConst,
      apparentEnergyConst,
      activationConst
    ];
  } else {
    var activePower = parseSignedShort(payload.substring(34, 38));
    var reactivePower = parseSignedShort(payload.substring(38, 42));
    var apparentPower = parseSignedShort(payload.substring(42, 46));
    var voltage = parseUnsignedShort(payload.substring(46, 50));
    var current = parseUnsignedShort(payload.substring(50, 54));
    var period = parseUnsignedShort(payload.substring(54, 58));
 
    const activePowerConst = { variable: 'activePower', value: activePower, unit: 'W', time, serie };
    const reactivePowerConst = { variable: 'reactivePower', value: reactivePower, unit: 'VAR', time, serie };
    const apparentPowerConst = { variable: 'apparentPower', value: apparentPower, unit: 'VA', time, serie };
    const voltageConst = { variable: 'voltage', value: voltage, time, unit: 'dv RMS', serie };
    const currentConst = { variable: 'current', value: current, time, unit: 'mA RMS', serie };
    const periodConst = { variable: 'period', value: period, time, unit: 'us', serie };
 
    if (payload.length > 58) {
      activation = parseUnsignedInt(payload.substring(58, 66));
      const activationConst = { variable: 'activation', value: activation, time, unit: 's', serie };
      return [
        date,
        activeEnergyConst,
        reactiveEnergyConst,
        apparentEnergyConst,
        activePowerConst,
        reactivePowerConst,
        apparentPowerConst,
        voltageConst,
        currentConst,
        periodConst,
        activationConst
      ];
    }
 
    return [
      date,
      activeEnergyConst,
      reactiveEnergyConst,
      apparentEnergyConst,
      activePowerConst,
      reactivePowerConst,
      apparentPowerConst,
      voltageConst,
      currentConst,
      periodConst
    ];
  }
}
 
function parseIO(payload) {
  const time = parseDate(payload.substring(2, 10));
  const serie = time;
  const date = { variable: 'date', value: time, time, serie };
 
  var firstByte = [];
  var secondByte = [];
  var thirdByte = [];
  var fourthByte = [];
 
  var k = 0;
  for (var i = 0; i < 3; i++) {
    firstByte[i] = parseInt(payload.substring(k + 10, k + 10 + 2), 16);
    secondByte[i] = parseInt(payload.substring(k + 10 + 2, k + 10 + 4), 16);
    thirdByte[i] = parseInt(payload.substring(k + 10 + 4, k + 10 + 6), 16);
    fourthByte[i] = parseInt(payload.substring(k + 10 + 6, k + 10 + 8), 16);
 
    k = k + 8;
  }
 
  const input_status8_1 = { variable: 'input_status8_1', value: firstByte[0].toString(2).padStart(8, 0), time, serie };
  const input_status9_16 = { variable: 'input_status9_16', value: secondByte[0].toString(2).padStart(8, 0), time, serie };
  const input_status17_24 = { variable: 'input_status17_24', value: thirdByte[0].toString(2).padStart(8, 0), time, serie };
  const input_status25_32 = { variable: 'input_status25_32', value: fourthByte[0].toString(2).padStart(8, 0), time, serie };
 
  const output_status8_1 = { variable: 'output_status8_1', value: firstByte[1].toString(2).padStart(8, 0), time, serie };
  const output_status9_16 = { variable: 'output_status9_16', value: secondByte[1].toString(2).padStart(8, 0), time, serie };
  const output_status17_24 = { variable: 'output_status17_24', value: thirdByte[1].toString(2).padStart(8, 0), time, serie };
  const output_status25_32 = { variable: 'output_status25_32', value: fourthByte[1].toString(2).padStart(8, 0), time, serie };
 
  const input_trigger8_1 = { variable: 'input_trigger8_1', value: firstByte[2].toString(2).padStart(8, 0), time, serie };
  const input_trigger9_16 = { variable: 'input_trigger9_16', value: secondByte[2].toString(2).padStart(8, 0), time, serie };
  const input_trigger17_24 = { variable: 'input_trigger17_24', value: thirdByte[2].toString(2).padStart(8, 0), time, serie };
  const input_trigger25_32 = { variable: 'input_trigger25_32', value: fourthByte[2].toString(2).padStart(8, 0), time, serie };
 
  return [
    date,
    input_status8_1,
    input_status9_16,
    input_status17_24,
    input_status25_32,
   
    output_status8_1,
    output_status9_16,
    output_status17_24,
    output_status25_32,
   
    input_trigger8_1,
    input_trigger9_16,
    input_trigger17_24,
    input_trigger25_32
 
  ];
}
 
function parseSignedInt(substring) {
  substring = switchByte(substring);
  var rno = hexStringToByteArray(substring);
  var n = 0;
  if (rno.length === 4) {
    n = (rno[0] << 24) & 0xff000000 |
      (rno[1] << 16) & 0x00ff0000 |
      (rno[2] << 8) & 0x0000ff00 |
      (rno[3] << 0) & 0x000000ff;
  }
  return n;
}
 
function parseUnsignedInt(substring) {
  substring = switchByte(substring);
  var rno = hexStringToByteArray(substring);
  var l;
  if (rno.length === 4) {
    l = (rno[0] << 24) & 0x00000000ff000000 |
      (rno[1] << 16) & 0x0000000000ff0000 |
      (rno[2] << 8) & 0x000000000000ff00 |
      (rno[3] << 0) & 0x00000000000000ff;
  }
  return l;
}
 
function parseSignedShort(substring) {
  substring = switchByte(substring);
  var rno = hexStringToByteArray(substring);
  var i = 0;
  if (rno.length === 2) {
    i = ((rno[0] << 8) & 0x0000ff00 | (rno[1] << 0) & 0x000000ff);
  }
  return i;
}
 
function parseUnsignedShort(substring) {
  substring = switchByte(substring);
  var rno = hexStringToByteArray(substring);
  var i = 0;
  if (rno.length === 2) {
    i = (rno[0] << 8) & 0x0000ff00 | (rno[1] << 0) & 0x000000ff;
  }
  return i;
}
 
function switchByte(bytes) {
  var mirrored = bytes;
  if (bytes.length % 2 === 0) {
    mirrored = "";
    for (var starting = 0; starting + 2 <= bytes.length; starting += 2) {
      mirrored = bytes.substring(starting, starting + 2) + mirrored;
    }
  }
  return mirrored;
}
 
function hexStringToByteArray(s) {
  for (var bytes = [], c = 0; c < s.length; c += 2)
    bytes.push(parseInt(s.substr(c, 2), 16));
  return bytes;
}
/*
function getStatus(imageFromSensor) {
    var inputMask = (switchByte(imageFromSensor), 16);
    var status = [];
    for (var i = 0; i < 32; i++) {
        status[i] = getBit(inputMask, i);
    }
    return status;
}
 

*/
 

function getStatus(imageFromSensor) {
  var inputMask = (imageFromSensor);
  var status = inputMask;
  return status;
 
}
 

function getBit(n, k) {
  return ((n >> k) & 1) == 1;
}
 

function parsePayload(payload_raw, serie) {
  try {
    // Get the Payload ID.
    const uplinkId = payload_raw.substring(0, 2);
    
    // Apply different parsers for each ID.
    let content = [];
    switch (uplinkId.toUpperCase()) {
      case '01':
        content = parseTimeSync(payload_raw, serie);
        break;
      case '09':
        content = parseMetering(payload_raw, serie);
        break;
      case '0A':
        content = parseIO(payload_raw);
        break;
      default:
        break;
    }
    return content;
  } catch (e) {
    // Return the variable parse_error for debugging.
    return [{ variable: 'parse_error', value: e.message }];
  }

}


// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => ['payload', 'payload_raw', 'data'].includes(x.variable));
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(parsePayload(value, serie));
  }
}