function decodeUplink(input) {
  try {
    var bytes = input.bytes;
    var data = {};

    const calculateTemperature = (rawData) => (rawData - 400) / 10;
    const calculateHumidity = (rawData) => (rawData * 100) / 256;

    function handleKeepalive(bytes, data) {

      let temperatureRaw = (bytes[1] << 8) | bytes[2];
      data.sensorTemperature = Number(calculateTemperature(temperatureRaw).toFixed(2));

      data.relativeHumidity = Number(calculateHumidity(bytes[3]).toFixed(2));

      let batteryVoltageRaw = (bytes[4] >> 4) & 0x0F;
      data.batteryVoltage = Number((2 + batteryVoltageRaw * 0.1).toFixed(2));

      data.thermistorProperlyConnected = (bytes[5] & 0x04) === 0;
      let extThermHigh = bytes[5] & 0x03;  // mask out bits 1:0
      let extThermLow = bytes[6];
      let extThermRaw = (extThermHigh << 8) | extThermLow;

      data.extThermistorTemperature = data.thermistorProperlyConnected
        ? Number((extThermRaw * 0.1).toFixed(2))
        : 0;

      return data;
    }

    function handleResponse(bytes, data) {
      var commands = bytes.map(byte => ("0" + byte.toString(16)).substr(-2));
      commands = commands.slice(0, -7);
      var command_len = 0;

      commands.forEach((command, i) => {
        switch (command) {
          case '04':
            command_len = 2;
            data.deviceVersions = {
              hardware: Number(commands[i + 1]),
              software: Number(commands[i + 2])
            };
            break;
          case '12':
            command_len = 1;
            data.keepAliveTime = parseInt(commands[i + 1], 16);
            break;
          case '19':
            command_len = 1;
            let commandResponse = parseInt(commands[i + 1], 16);
            data.joinRetryPeriod = (commandResponse * 5) / 60;
            break;
          case '1b':
            command_len = 1;
            data.uplinkType = parseInt(commands[i + 1], 16);
            break;
          case '1d':
            command_len = 2;
            data.watchDogParams = {
              wdpC: commands[i + 1] === '00' ? false : parseInt(commands[i + 1], 16),
              wdpUc: commands[i + 2] === '00' ? false : parseInt(commands[i + 2], 16)
            };
            break;
          default:
            break;
        }
        commands.splice(i, command_len);
      });
      return data;
    }

    if (bytes[0] === 1) {
      data = handleKeepalive(bytes, data);
    } else {
      data = handleResponse(bytes, data);
      bytes = bytes.slice(-7);
      data = handleKeepalive(bytes, data);
    }

    return data;
  } catch (e) {
    // console.log(e);
    throw new Error(e);
  }
}


function hexToDecArr(hexData) {
  return hexData.match(/.{1,2}/g).map(function (byte) { return parseInt(byte, 16) })
}

function toTagoFormat(object_item, group, prefix = '', location_let) {
  const result = [];
  for (const key in object_item) {
    if (typeof object_item[key] === 'object') {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        group: object_item[key].group || group,
        metadata: object_item[key].metadata,
        location: object_item[key].location || location_let,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        location: location_let,
        group,
      });
    }
  }

  return result;
}
// let payload = [{ variable: 'payload', value: '01027473F10400', group: '' }];
// 01027473F10400
const data = payload.find(x => x.variable === 'data' || x.variable === 'payload');
if (data) {
  const group = String(data.group || Date.now());
  const lets_to_tago = decodeUplink({ bytes: hexToDecArr(data.value), port: 2 });
  payload = [...payload, ...toTagoFormat(lets_to_tago, group, '', lets_to_tago.location)];
}
