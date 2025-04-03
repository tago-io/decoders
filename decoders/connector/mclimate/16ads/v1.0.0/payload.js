const decodeUplink = (input) => {
  try {
    let { bytes } = input;
    let data = {};

    const handleKeepalive = (bytes, data) => {
      // Temperature sign and internal temperature
      const isNegative = (bytes[1] & 0x80) !== 0; // Check the 7th bit for the sign

      let temperature = bytes[1] & 0x7F; // Mask out the 7th bit to get the temperature value
      data.internalTemperature = isNegative ? -temperature : temperature;

      // Relay state
      data.relayState = bytes[2] === 0x01 ? "ON" : "OFF";

      return data;
    };

    const handleResponse = (bytes, data) => {
      let commands = bytes.map(byte => (`0${byte.toString(16)}`).slice(-2)).slice(0, -3);
      let command_len = 0;

      commands.forEach((command, i) => {
        switch (command) {
          case '04': {
            command_len = 2;
            const hardwareVersion = commands[i + 1];
            const softwareVersion = commands[i + 2];
            data.deviceVersions = {
              hardware: Number(hardwareVersion),
              software: Number(softwareVersion),
            };
            break;
          }
          case '12': {
            command_len = 1;
            data.keepAliveTime = parseInt(commands[i + 1], 16);
            break;
          }
          case '19': {
            command_len = 1;
            const commandResponse = parseInt(commands[i + 1], 16);
            const periodInMinutes = (commandResponse * 5) / 60;
            data.joinRetryPeriod = periodInMinutes;
            break;
          }
          case '1b': {
            command_len = 1;
            data.uplinkType = parseInt(commands[i + 1], 16);
            break;
          }
          case '1d': {
            command_len = 2;
            const wdpC = commands[i + 1] === '00' ? false : parseInt(commands[i + 1], 16);
            const wdpUc = commands[i + 2] === '00' ? false : parseInt(commands[i + 2], 16);
            data.watchDogParams = { wdpC, wdpUc };
            break;
          }
          case '1f': {
            command_len = 2;
            data.overheatingThresholds = {
              trigger: parseInt(commands[i + 1], 16),
              recovery: parseInt(commands[i + 2], 16),
            };
            break;
          }
          case '5a': {
            command_len = 1;
            data.afterOverheatingProtectionRecovery = parseInt(commands[i + 1], 16);
            break;
          }
          case '5c': {
            command_len = 1;
            data.ledIndicationMode = parseInt(commands[i + 1], 16);
            break;
          }
          case '5d': {
            command_len = 1;
            data.manualChangeRelayState = parseInt(commands[i + 1], 16) === 0x01;
            break;
          }
          case '5f': {
            command_len = 1;
            data.relayRecoveryState = parseInt(commands[i + 1], 16);
            break;
          }
          case '60': {
            command_len = 2;
            data.overheatingEvents = {
              events: parseInt(commands[i + 1], 16),
              temperature: parseInt(commands[i + 2], 16),
            };
            break;
          }
          case '70': {
            command_len = 2;
            data.overheatingRecoveryTime = (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16);
            break;
          }
          case 'b1': {
            command_len = 1;
            data.relayState = parseInt(commands[i + 1], 16) === 0x01;
            break;
          }
          case 'a0': {
            command_len = 4;
            const fuota_address = parseInt(
              `${commands[i + 1]}${commands[i + 2]}${commands[i + 3]}${commands[i + 4]}`,
              16
            );
            const fuota_address_raw = `${commands[i + 1]}${commands[i + 2]}${commands[i + 3]}${commands[i + 4]}`;
            data.fuota = { fuota_address, fuota_address_raw };
            break;
          }
          case 'a4': {
            command_len = 1;
            data.region = parseInt(commands[i + 1], 16);
            break;
          }
          default:
            break;
        }
        commands.splice(i, command_len);
      });

      return data;
    };

    if (bytes[0] === 1) {
      data = handleKeepalive(bytes, data);
    } else {
      data = handleResponse(bytes, data);
      bytes = bytes.slice(-3);
      data = handleKeepalive(bytes, data);
    }

    return data;
  } catch (e) {
    console.log(e);
    throw new Error('Unhandled data');
  }
};


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

// let payload = [{ variable: 'payload', value: '011C01', group: '' }];
// 011C01
const data = payload.find(x => x.variable === 'data' || x.variable === 'payload');
if (data) {
  const group = String(data.group || Date.now());
  const lets_to_tago = decodeUplink({ bytes: hexToDecArr(data.value), port: 2 });
  payload = [...payload, ...toTagoFormat(lets_to_tago, group, '', lets_to_tago.location)];
}
