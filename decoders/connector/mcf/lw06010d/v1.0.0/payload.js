
/*                               ___   ___
 *                           __ / _ \ / _ \
 *           _ __ ___   ___ / _| (_) | (_) |
 *          |  _ ` _ \ / __| |_ > _ < > _ < 
 *          | | | | | | (__|  _| (_) | (_) |
 *          |_| |_| |_|\___|_|  \___/ \___/
 *
 *          WEB:    https://www.mcf88.it
 *          E-MAIL: info@mcf88.it
 */

/*
 * VERSION: 1.0.0
 * 
 * INPUT:
 * payload      -> MCF-LW12WAM / MCF-LW06420 / MCF-LW06424 / MCF-LW06010 payload
 * 
 * OUTPUT:
 * sensorName   -> sensor name
 * m            -> measurement. See @parseAnalogMeasurement
 */
function parseAnalog(payload) {
  const uplinkId = payload.substring(0, 2);
  if (uplinkId.toUpperCase() === '0D') {
      var sensorName = payload.substring(2, 4);

      switch (sensorName.toUpperCase()) {
          case '00':
              sensorName = {
                  variable: 'sensorName',
                  value: 'MCF-LW12WAM'
              };
              break;
          case '01':
              sensorName = {
                  variable: 'sensorName',
                  value: 'MCF-LW06420 / MCF-LW06424 / MCF-LW06010'
              };
              break;
      }

      const m = parseAnalogMeasurement(payload.substring(4, 28));

      return [
          sensorName,
          ...m
      ];
  } else {
      return null;
  }
}



/*
* VERSION: 1.0.0
* 
* INPUT:
* payload  -> payload substring of measurement
* 
* OUTPUT:
* date     -> date of measurement. See @parseDate
* m        -> measured value. For measure unit see @getAnalogUnit
* error    -> if 0 sensor is disconnected (4-20 mA only), if 1 generic error
* tpye     -> measyre type. See @getAnalogType
* rfu      -> future use bit
*/
function parseAnalogMeasurement(payload) {
  const date = {
      variable: 'date',
      value: parseDate(payload.substring(0, 8))
  };

  var m = [];
  var error = [];
  var type = [];
  var rfu = [];

  var k = 0;
  for (var i = 0; i < 4; i++) {
      var firstByte = parseInt(payload.substring(k + 8, k + 8 + 2), 16);
      var secondByte = parseInt(payload.substring(k + 8 + 2, k + 8 + 4), 16);

      var hexInBin = (((secondByte & 0xFF) << 8) & 0xFF00) + ((firstByte & 0xFF)) & 0x0000FFFF;
      type[i] = (hexInBin & 0b0110000000000000) >> 13;
      error[i] = (hexInBin & 0b0001000000000000) >> 12;

      m[i] = hexInBin & 0b0000111111111111;
      rfu[i] = (hexInBin & 0b1000000000000000) >> 15;
      switch (type[i]) {
          case 0:
              if (error[i] === 0) {
                  m[i] = ((m[i] * 16) / 4096) + 4;
              } else {
                  m[i] = 0;
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

  const m1 = {
      variable: 'm1',
      value: Number(m[0]).toFixed(2),
      unit: getAnalogUnit(type[0])
  };
  const error1 = {
      variable: 'error1',
      value: Number(error[0]).toFixed()
  };
  const type1 = {
      variable: 'type1',
      value: getAnalogType(type[0])
  };
  const rfu1 = {
      variable: 'rfu1',
      value: Number(rfu[0]).toFixed()
  };

  const m2 = {
      variable: 'm2',
      value: Number(m[1]).toFixed(2),
      unit: getAnalogUnit(type[1])
  };
  const error2 = {
      variable: 'error2',
      value: Number(error[1]).toFixed()
  };
  const type2 = {
      variable: 'type2',
      value: getAnalogType(type[1])
  };
  const rfu2 = {
      variable: 'rfu2',
      value: Number(rfu[1]).toFixed()
  };

  const m3 = {
      variable: 'm3',
      value: Number(m[2]).toFixed(2),
      unit: getAnalogUnit(type[2])
  };
  const error3 = {
      variable: 'error3',
      value: Number(error[2]).toFixed()
  };
  const type3 = {
      variable: 'type3',
      value: getAnalogType(type[2])
  };
  const rfu3 = {
      variable: 'rfu3',
      value: Number(rfu[2]).toFixed()
  };

  const m4 = {
      variable: 'm4',
      value: Number(m[3]).toFixed(2),
      unit: getAnalogUnit(type[3])
  };
  const error4 = {
      variable: 'error4',
      value: Number(error[3]).toFixed()
  };
  const type4 = {
      variable: 'type4',
      value: getAnalogType(type[3])
  };
  const rfu4 = {
      variable: 'rfu4',
      value: Number(rfu[3]).toFixed()
  };

  return [
      date,
      m1,
      error1,
      type1,
      rfu1,
      m2,
      error2,
      type2,
      rfu2,
      m3,
      error3,
      type3,
      rfu3,
      m4,
      error4,
      type4,
      rfu4
  ];
}

/*
* VERSION: 1.0.0
* 
* INPUT:
* typeAnalog   -> bits of analog type
* 
* OUTPUT:
* unit         -> unit of measurement 
*/
function getAnalogUnit(typeAnalog) {
  var unit = '';
  switch (typeAnalog) {
      case 0:
          unit = 'mA';
          break;
      case 1:
          unit = 'V';
          break;
      case 2:
          unit = 'V';
          break;
  }
  return unit;
}



/*
* VERSION: 1.0.0
* 
* INPUT:
* typeAnalog   -> bits of analog type
* 
* OUTPUT:
* type         -> type of measurement 
*/
function getAnalogType(typeAnalog) {
  var type = '';
  switch (typeAnalog) {
      case 0:
          type = '4-20 mA';
          break;
      case 1:
          type = '0-10 V';
          break;
      case 2:
          type = '0-5 V';
          break;
  }
  return type;
}



/*
* VERSION: 1.0.0
* 
* INPUT:
* payload  -> payload substring to decode
* 
* OUTPUT:
* date     -> date decoded from payload
*/
function parseDate(payload) {
  var date = new Date();

  var binary = Number(parseInt(reverseBytes(payload), 16)).toString(2).padStart(32, '0');
  var year = parseInt(binary.substring(0, 7), 2) + 2000;
  var month = parseInt(binary.substring(7, 11), 2);
  var day = parseInt(binary.substring(11, 16), 2);
  var hour = parseInt(binary.substring(16, 21), 2);
  var minute = parseInt(binary.substring(21, 27), 2);
  var second = parseInt(binary.substring(27, 32), 2) * 2;

  date = new Date(year, month - 1, day, hour, minute, second, 0).toLocaleString();
  return date;
}

/*
* VERSION: 1.0.0
* 
* INPUT:
* bytes    -> string of bytes to invert for LSB
* 
* OUTPUT:
* reversed -> reversed string of bytes in LSB
*/
function reverseBytes(bytes) {
  var reversed = bytes;
  if (bytes.length % 2 === 0) {
      reversed = "";
      for (var starting = 0; starting + 2 <= bytes.length; starting += 2) {
          reversed = bytes.substring(starting, starting + 2) + reversed;
      }
  }
  return reversed;
}

// console.log(parseAnalog('0D01A0815B299B26DE260427A726'));

// let payload = [{ variable: 'payload', value: '0D01A0815B299B26DE260427A726' }];
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => ['payload', 'payload_raw', 'data'].includes(x.variable));
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(parseAnalog(value));
  }
}
// console.log(payload);

// console.log(parseAnalog('0D0180635729FF2FA426FF2FA126'));
