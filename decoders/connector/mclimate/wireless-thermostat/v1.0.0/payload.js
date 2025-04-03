function decodeUplink(input) {
  try {
    let bytes = input.bytes;
    let data = {};
    const toBool = value => value == '1';
    let calculateTemperature = function (rawData) { return (rawData - 400) / 10 };
    let calculateHumidity = function (rawData) { return (rawData * 100) / 256 };
    let decbin = function (number) {
      if (number < 0) {
        number = 0xFFFFFFFF + number + 1
      }
      number = number.toString(2);
      return "00000000".substr(number.length) + number;
    }
    function handleKeepalive(bytes, data) {
      let tempHex = '0' + bytes[1].toString(16) + bytes[2].toString(16);
      let tempDec = parseInt(tempHex, 16);
      let temperatureValue = calculateTemperature(tempDec);
      let humidityValue = calculateHumidity(bytes[3]);

      let temperature = temperatureValue;
      let humidity = humidityValue;
      let batteryVoltage = parseInt(`${decbin(bytes[4])}${decbin(bytes[5])}`, 2) / 1000;
      let targetTemperature, powerSourceStatus, lux, pir;
      if (bytes[0] == 1) {
        targetTemperature = bytes[6];
        powerSourceStatus = bytes[7];
        lux = parseInt('0' + bytes[8].toString(16) + bytes[9].toString(16), 16);
        pir = toBool(bytes[10]);
      } else {
        targetTemperature = parseInt(`${decbin(bytes[6])}${decbin(bytes[7])}`, 2) / 10;
        powerSourceStatus = bytes[8];
        lux = parseInt('0' + bytes[9].toString(16) + bytes[10].toString(16), 16);
        pir = toBool(bytes[11]);
      }

      data.sensorTemperature = Number(temperature.toFixed(2));
      data.relativeHumidity = Number(humidity.toFixed(2));
      data.batteryVoltage = Number(batteryVoltage.toFixed(3));
      data.targetTemperature = targetTemperature;
      data.powerSourceStatus = powerSourceStatus;
      data.lux = lux;
      data.pir = pir;

      return data;
    }

    function handleResponse(bytes, data, keepaliveLength) {
      let commands = bytes.map(function (byte) {
        return ("0" + byte.toString(16)).substr(-2);
      });
      commands = commands.slice(0, -keepaliveLength);
      let command_len = 0;

      commands.map(function (command, i) {
        switch (command) {
          case '04':
            {
              command_len = 2;
              let hardwareVersion = commands[i + 1];
              let softwareVersion = commands[i + 2];
              data.deviceVersions = { hardware: Number(hardwareVersion), software: Number(softwareVersion) };
            }
            break;
          case '12':
            {
              command_len = 1;
              data.keepAliveTime = parseInt(commands[i + 1], 16);
            }
            break;
          case '14':
            {
              command_len = 1;
              data.childLock = toBool(parseInt(commands[i + 1], 16));
            }
            break;
          case '15':
            {
              command_len = 2;
              data.temperatureRangeSettings = { min: parseInt(commands[i + 1], 16), max: parseInt(commands[i + 2], 16) };
            }
            break;
          case '19':
            {
              command_len = 1;
              let commandResponse = parseInt(commands[i + 1], 16);
              let periodInMinutes = commandResponse * 5 / 60;
              data.joinRetryPeriod = periodInMinutes;
            }
            break;
          case '1b':
            {
              command_len = 1;
              data.uplinkType = parseInt(commands[i + 1], 16);
            }
            break;
          case '1d':
            {
              command_len = 2;
              let deviceKeepAlive = 5;
              let wdpC = commands[i + 1] == '00' ? false : commands[i + 1] * deviceKeepAlive + 7;
              let wdpUc = commands[i + 2] == '00' ? false : parseInt(commands[i + 2], 16);
              data.watchDogParams = { wdpC: wdpC, wdpUc: wdpUc };
            }
            break;
          case '2f':
            {
              command_len = 1;
              data.targetTemperature = parseInt(commands[i + 1], 16);
            }
            break;
          case '30':
            {
              command_len = 1;
              data.manualTargetTemperatureUpdate = parseInt(commands[i + 1], 16);
            }
            break;
          case '32':
            {
              command_len = 1;
              data.heatingStatus = parseInt(commands[i + 1], 16);
            }
            break;
          case '34':
            {
              command_len = 1;
              data.displayRefreshPeriod = parseInt(commands[i + 1], 16);
            }
            break;
          case '36':
            {
              command_len = 1;
              data.sendTargetTempDelay = parseInt(commands[i + 1], 16);
            }
            break;
          case '38':
            {
              command_len = 1;
              data.automaticHeatingStatus = parseInt(commands[i + 1], 16);
            }
            break;
          case '3a':
            {
              command_len = 1;
              data.sensorMode = parseInt(commands[i + 1], 16);
            }
            break;
          case '3d':
            {
              command_len = 1;
              data.pirSensorStatus = parseInt(commands[i + 1], 16);
            }
            break;
          case '3f':
            {
              command_len = 1;
              data.pirSensorSensitivity = parseInt(commands[i + 1], 16);
            }
            break;
          case '41':
            {
              command_len = 1;
              data.currentTemperatureVisibility = parseInt(commands[i + 1], 16);
            }
            break;
          case '43':
            {
              command_len = 1;
              data.humidityVisibility = parseInt(commands[i + 1], 16);
            }
            break;
          case '45':
            {
              command_len = 1;
              data.lightIntensityVisibility = parseInt(commands[i + 1], 16);
            }
            break;
          case '47':
            {
              command_len = 1;
              data.pirInitPeriod = parseInt(commands[i + 1], 16);
            }
            break;
          case '49':
            {
              command_len = 1;
              data.pirMeasurementPeriod = parseInt(commands[i + 1], 16);
            }
            break;
          case '4b':
            {
              command_len = 1;
              data.pirCheckPeriod = parseInt(commands[i + 1], 16);
            }
            break;
          case '4d':
            {
              command_len = 1;
              data.pirBlindPeriod = parseInt(commands[i + 1], 16);
            }
            break;
          case '4f':
            {
              command_len = 1;
              data.temperatureHysteresis = parseInt(commands[i + 1], 16) / 10;
            }
            break;
          case '51':
            {
              command_len = 2;
              data.targetTemperature = parseInt(`0x${commands[i + 1]}${commands[i + 2]}`, 16) / 10;
            }
            break;
          case '53':
            {
              command_len = 1;
              data.targetTemperatureStep = parseInt(commands[i + 1], 16) / 10;
            }
            break;
          case '54':
            {
              command_len = 2;
              data.manualTargetTemperatureUpdate = parseInt(`0x${commands[i + 1]}${commands[i + 2]}`, 16) / 10;
            }
            break;
          case 'a0':
            {
              command_len = 4;
              let fuota_address = parseInt(`${commands[i + 1]}${commands[i + 2]}${commands[i + 3]}${commands[i + 4]}`, 16)
              let fuota_address_raw = `${commands[i + 1]}${commands[i + 2]}${commands[i + 3]}${commands[i + 4]}`
              data.fuota = { fuota_address, fuota_address_raw };
            }
            break;
          default:
            break;
        }
        commands.splice(i, command_len);
      });
      return data;
    }
    if (bytes[0] == 1 || bytes[0] == 129) {
      data = handleKeepalive(bytes, data);
    } else {
      let keepaliveLength = 11;
      let potentialKeepAlive = bytes.slice(-12);
      if (potentialKeepAlive[0] == 129) keepaliveLength = 12;
      data = handleResponse(bytes, data, keepaliveLength);
      bytes = bytes.slice(-keepaliveLength);
      data = handleKeepalive(bytes, data);
    }
    return data;
  } catch (e) {
    throw new Error('Unhandled data');
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
const data = payload.find(x => x.variable === 'data' || x.variable === 'payload');
if (data) {
  const group = String(data.group || Date.now());
  const lets_to_tago = decodeUplink({ bytes: hexToDecArr(data.value), port: 2 });
  payload = [...payload, ...toTagoFormat(lets_to_tago, group, '', lets_to_tago.location)];
}
