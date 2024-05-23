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
 
function parseAnalogMeasurement(payload) {
  const time = parseDate(payload.substring(0, 8));
  const serie = time;
  const date = { variable: 'date', value: time, time, serie };
 
  var m = [];
  var mError = [];
  var mType = [];
  var mBit = [];
 
  var k = 0;
  for (var i = 0; i < 4; i++) {
    var firstByte = parseInt(payload.substring(k + 8, k + 8 + 2), 16);
    var secondByte = parseInt(payload.substring(k + 8 + 2, k + 8 + 4), 16);
 
    var hexInBin = (((secondByte & 0xFF) << 8) & 0xFF00) + ((firstByte & 0xFF)) & 0x0000FFFF;
    mType[i] = (hexInBin & 0b0110000000000000) >> 13;
    mError[i] = (hexInBin & 0b0001000000000000) >> 12;
 
    m[i] = hexInBin & 0b0000111111111111;
    mBit[i] = m[i];
    switch (mType[i]) {
      case 0:
        if (mError[i] == 0) {
          m[i] = ((m[i] * 16) / 4096) + 4;
        } else {
          m[i] = 0
        }
        break;
      case 1:
        m[i] = (m[i] * 10) / 4096;
        break;
      case 2:
        m[i] = (m[i] * 5) / 4096;
        break;
    }
    k = k + 4;
  }
 
  const m1 = { variable: 'm1', value: m[0], unit: getUnitAnalog(mType[0]), time, serie };
  const mError1 = { variable: 'mError1', value: mError[0], time, serie };
  const mType1 = { variable: 'mType1', value: mType[0], time, serie };
  const mBit1 = { variable: 'mBit1', value: mBit[0], time, serie };
 
  const m2 = { variable: 'm2', value: m[1], unit: getUnitAnalog(mType[1]), time, serie };
  const mError2 = { variable: 'mError2', value: mError[1], time, serie };
  const mType2 = { variable: 'mType2', value: mType[1],time, serie };
  const mBit2 = { variable: 'mBit2', value: mBit[1], time, serie };
 
  const m3 = { variable: 'm3', value: m[2], unit: getUnitAnalog(mType[2]), time, serie };
  const mError3 = { variable: 'mError3', value: mError[2], time, serie };
  const mType3 = { variable: 'mType3', value: mType[2], time, serie };
  const mBit3 = { variable: 'mBit3', value: mBit[2], time, serie };
 
  const m4 = { variable: 'm4', value: m[3], unit: getUnitAnalog(mType[3]), time, serie };
  const mError4 = { variable: 'mError4', value: mError[3], time, serie };
  const mType4 = { variable: 'mType4', value: mType[3], time, serie };
  const mBit4 = { variable: 'mBit4', value: mBit[3], time, serie };
 
  return [
    date,
    m1,
    mError1,
    mType1,
    mBit1,
    m2,
    mError2,
    mType2,
    mBit2,
    m3,
    mError3,
    mType3,
    mBit3,
    m4,
    mError4,
    mType4,
    mBit4
  ];
}
 
function getUnitAnalog(typeAnalog) {
  switch (typeAnalog) {
    case 0:
      return 'mA';
    case 1:
 return 'V';
    case 2:
      return 'V';
  }
}
 
function parseAnalog(payload, serie) {
  const sensorType = payload.substring(2, 4);
  var sensorName = "";
 
  switch (sensorType) {
    case '00': {
      sensorName = { variable: 'sensorName', value: "MCF-LW12WAM", serie };
      const m = parseAnalogMeasurement(payload.substring(4, 28))
      return [sensorName, ...m];
    }
    case '01': {
      sensorName = { variable: 'sensorName', value: "MCF-LW06420 / MCF-LW06424 / MCF-LW06010", serie };
     const m = parseAnalogMeasurement(payload.substring(4, 28))
      return [sensorName, ...m];
    }
  }
}
 
// Check if the incoming data is from TTN.
var data = payload.find(x => x.variable === 'ttn_payload');
if (data) {
  // Get a unique serie for the incoming data.
  const serie = data.serie ? `${new Date().getTime()}-${data.serie}` :new Date().getTime();
 
  // Parse the data to JSON format (it comes in a String format)
  data = JSON.parse(data.value);
  const raw_payload = data.payload || data.payload_raw;
 
  // Get the Payload ID.
  const uplinkId = raw_payload.substring(0, 2);
 
  // Apply different parsers for each ID.
  let content;
  switch (uplinkId) {
    case '01':
      content = parseTimeSync(raw_payload, serie);
      break;
    case '0D':
      content = parseAnalog(raw_payload, serie);
      break;
    default:
      break;
  }
 
  // Change the payload to the parsed variables.
  payload = content;
}