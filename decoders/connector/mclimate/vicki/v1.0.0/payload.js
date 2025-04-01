function decodeUplink(input) {
  var bytes = input.bytes;
  var data = {};
  var resultToPass = {};
  const toBool = function (value) { return value == '1' };

  function merge_obj(obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname2 in obj2) { obj3[attrname2] = obj2[attrname2]; }
    return obj3;
  }

  function handleKeepalive(bytes, data) {
    let tmp = ("0" + bytes[6].toString(16)).substr(-2);
    let motorRange1 = tmp[1];
    let motorRange2 = ("0" + bytes[5].toString(16)).substr(-2);
    let motorRange = parseInt("0x" + motorRange1 + motorRange2, 16);

    let motorPos2 = ("0" + bytes[4].toString(16)).substr(-2);
    let motorPos1 = tmp[0];
    let motorPosition = parseInt("0x" + motorPos1 + motorPos2, 16);

    let batteryTmp = ("0" + bytes[7].toString(16)).substr(-2)[0];
    let batteryVoltageCalculated = 2 + parseInt("0x" + batteryTmp, 16) * 0.1;

    let decbin = (number) => {
      if (number < 0) {
        number = 0xFFFFFFFF + number + 1
      }
      number = number.toString(2);
      return "00000000".substr(number.length) + number;
    }
    let byte7Bin = decbin(bytes[7]);
    let openWindow = byte7Bin[4];
    let highMotorConsumption = byte7Bin[5];
    let lowMotorConsumption = byte7Bin[6];
    let brokenSensor = byte7Bin[7];
    let byte8Bin = decbin(bytes[8]);
    let childLock = byte8Bin[0];
    let calibrationFailed = byte8Bin[1];
    let attachedBackplate = byte8Bin[2];
    let perceiveAsOnline = byte8Bin[3];
    let antiFreezeProtection = byte8Bin[4];

    var sensorTemp = 0;
    if (Number(bytes[0].toString(16)) == 1) {
      sensorTemp = (bytes[2] * 165) / 256 - 40;
    }

    if (Number(bytes[0].toString(16)) == 81) {
      sensorTemp = (bytes[2] - 28.33333) / 5.66666;
    }
    data.reason = Number(bytes[0].toString(16));
    data.targetTemperature = Number(bytes[1]);
    data.sensorTemperature = Number(sensorTemp.toFixed(2));
    data.relativeHumidity = Number(((bytes[3] * 100) / 256).toFixed(2));
    data.motorRange = motorRange;
    data.motorPosition = motorPosition;
    data.batteryVoltage = Number(batteryVoltageCalculated.toFixed(2));
    data.openWindow = toBool(openWindow);
    data.highMotorConsumption = toBool(highMotorConsumption);
    data.lowMotorConsumption = toBool(lowMotorConsumption);
    data.brokenSensor = toBool(brokenSensor);
    data.childLock = toBool(childLock);
    data.calibrationFailed = toBool(calibrationFailed);
    data.attachedBackplate = toBool(attachedBackplate);
    data.perceiveAsOnline = toBool(perceiveAsOnline);
    data.antiFreezeProtection = toBool(antiFreezeProtection);
    data.valveOpenness = motorRange != 0 ? Math.round((1 - (motorPosition / motorRange)) * 100) : 0;
    if (!data.hasOwnProperty('targetTemperatureFloat')) {
      data.targetTemperatureFloat = parseFloat(bytes[1])
    }
    return data;
  }

  function handleResponse(bytes, data) {
    var commands = bytes.map(function (byte, i) {
      return ("0" + byte.toString(16)).substr(-2);
    });
    commands = commands.slice(0, -9);
    var command_len = 0;

    commands.map(function (command, i) {
      switch (command) {
        case '04':
          {
            command_len = 2;
            var hardwareVersion = commands[i + 1];
            var softwareVersion = commands[i + 2];
            var dataK = { deviceVersions: { hardware: Number(hardwareVersion), software: Number(softwareVersion) } };
            resultToPass = merge_obj(resultToPass, dataK);
          }
          break;
        case '12':
          {
            command_len = 1;
            var dataC = { keepAliveTime: parseInt(commands[i + 1], 16) };
            resultToPass = merge_obj(resultToPass, dataC);
          }
          break;
        case '13':
          {
            command_len = 4;
            var enabled = toBool(parseInt(commands[i + 1], 16));
            var duration = parseInt(commands[i + 2], 16) * 5;
            var tmp = ("0" + commands[i + 4].toString(16)).substr(-2);
            var motorPos2 = ("0" + commands[i + 3].toString(16)).substr(-2);
            var motorPos1 = tmp[0];
            var motorPosition = parseInt('0x' + motorPos1 + motorPos2, 16);
            var delta = Number(tmp[1]);

            var dataD = { openWindowParams: { enabled: enabled, duration: duration, motorPosition: motorPosition, delta: delta } };
            resultToPass = merge_obj(resultToPass, dataD);
          }
          break;
        case '14':
          {
            command_len = 1;
            var dataB = { childLock: toBool(parseInt(commands[i + 1], 16)) };
            resultToPass = merge_obj(resultToPass, dataB);
          }
          break;
        case '15':
          {
            command_len = 2;
            var dataA = { temperatureRangeSettings: { min: parseInt(commands[i + 1], 16), max: parseInt(commands[i + 2], 16) } };
            resultToPass = merge_obj(resultToPass, dataA);
          }
          break;
        case '16':
          {
            command_len = 2;
            var data = { internalAlgoParams: { period: parseInt(commands[i + 1], 16), pFirstLast: parseInt(commands[i + 2], 16), pNext: parseInt(commands[i + 3], 16) } };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '17':
          {
            command_len = 2;
            var dataF = { internalAlgoTdiffParams: { warm: parseInt(commands[i + 1], 16), cold: parseInt(commands[i + 2], 16) } };
            resultToPass = merge_obj(resultToPass, dataF);
          }
          break;
        case '18':
          {
            command_len = 1;
            var dataE = { operationalMode: parseInt(commands[i + 1], 16) };
            resultToPass = merge_obj(resultToPass, dataE);
          }
          break;
        case '19':
          {
            command_len = 1;
            var commandResponse = parseInt(commands[i + 1], 16);
            var periodInMinutes = commandResponse * 5 / 60;
            var dataH = { joinRetryPeriod: periodInMinutes };
            resultToPass = merge_obj(resultToPass, dataH);
          }
          break;
        case '1b':
          {
            command_len = 1;
            var dataG = { uplinkType: parseInt(commands[i + 1], 16) };
            resultToPass = merge_obj(resultToPass, dataG);
          }
          break;
        case '1d':
          {
            // get default keepalive if it is not available in data
            command_len = 2;
            var wdpC = commands[i + 1] == '00' ? false : parseInt(commands[i + 1], 16);
            var wdpUc = commands[i + 2] == '00' ? false : parseInt(commands[i + 2], 16);
            var dataJ = { watchDogParams: { wdpC: wdpC, wdpUc: wdpUc } };
            resultToPass = merge_obj(resultToPass, dataJ);
          }
          break;
        case '1f':
          {
            command_len = 1;
            var data = { primaryOperationalMode: commands[i + 1] };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '21':
          {
            command_len = 6;
            var data = {
              batteryRangesBoundaries: {
                Boundary1: parseInt(commands[i + 1] + commands[i + 2], 16),
                Boundary2: parseInt(commands[i + 3] + commands[i + 4], 16),
                Boundary3: parseInt(commands[i + 5] + commands[i + 6], 16),
              }
            };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '23':
          {
            command_len = 4;
            var data = {
              batteryRangesOverVoltage: {
                Range1: parseInt(commands[i + 2], 16),
                Range2: parseInt(commands[i + 3], 16),
                Range3: parseInt(commands[i + 4], 16),
              }
            };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '27':
          {
            command_len = 1;
            var data = { OVAC: parseInt(commands[i + 1], 16) };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '28':
          {
            command_len = 1;
            var data = { manualTargetTemperatureUpdate: parseInt(commands[i + 1], 16) };
            resultToPass = merge_obj(resultToPass, data);

          }
          break;
        case '29':
          {
            command_len = 2;
            var data = { proportionalAlgoParams: { coefficient: parseInt(commands[i + 1], 16), period: parseInt(commands[i + 2], 16) } };
            resultToPass = merge_obj(resultToPass, data);

          }
          break;
        case '2b':
          {
            command_len = 1;
            var data = { algoType: commands[i + 1] };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '36':
          {
            command_len = 3;
            var kp = parseInt(`${commands[i + 1]}${commands[i + 2]}${commands[i + 3]}`, 16) / 131072;
            var data = { proportionalGain: Number(kp).toFixed(5) };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '3d':
          {
            command_len = 3;
            var ki = parseInt(`${commands[i + 1]}${commands[i + 2]}${commands[i + 3]}`, 16) / 131072;
            var data = { integralGain: Number(ki).toFixed(5) };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '3f':
          {
            command_len = 2;
            var data = { integralValue: (parseInt(`${commands[i + 1]}${commands[i + 2]}`, 16)) / 10 };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '40':
          {
            command_len = 1;
            var data = { piRunPeriod: parseInt(commands[i + 1], 16) };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '42':
          {
            command_len = 1;
            var data = { tempHysteresis: parseInt(commands[i + 1], 16) };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '44':
          {
            command_len = 2;
            var data = { extSensorTemperature: (parseInt(`${commands[i + 1]}${commands[i + 2]}`, 16)) / 10 };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '46':
          {
            command_len = 3;
            var enabled = toBool(parseInt(commands[i + 1], 16));
            var duration = parseInt(commands[i + 2], 16) * 5;
            var delta = parseInt(commands[i + 3], 16) / 10;

            var data = { openWindowParams: { enabled: enabled, duration: duration, delta: delta } };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '48':
          {
            command_len = 1;
            var data = { forceAttach: parseInt(commands[i + 1], 16) };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '4a':
          {
            command_len = 3;
            var activatedTemperature = parseInt(commands[i + 1], 16) / 10;
            var deactivatedTemperature = parseInt(commands[i + 2], 16) / 10;
            var targetTemperature = parseInt(commands[i + 3], 16);

            var data = { antiFreezeParams: { activatedTemperature, deactivatedTemperature, targetTemperature } };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '4d':
          {
            command_len = 2;
            var data = { piMaxIntegratedError: (parseInt(`${commands[i + 1]}${commands[i + 2]}`, 16)) / 10 };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '50':
          {
            command_len = 2;
            var data = { effectiveMotorRange: { minValveOpenness: 100 - parseInt(commands[i + 2], 16), maxValveOpenness: 100 - parseInt(commands[i + 1], 16) } };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '52':
          {
            command_len = 2;
            var data = { targetTemperatureFloat: (parseInt(`${commands[i + 1]}${commands[i + 2]}`, 16)) / 10 };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        case '54':
          {
            command_len = 1;
            var offset = (parseInt(commands[i + 1], 16) - 28) * 0.176
            var data = { temperatureOffset: offset };
            resultToPass = merge_obj(resultToPass, data);
          }
          break;
        default:
          break;
      }
      commands.splice(i, command_len);
    });
    return resultToPass;
  }

  if (bytes[0].toString(16) == 1 || bytes[0].toString(16) == 129) {
    data = merge_obj(data, handleKeepalive(bytes, data));
  } else {
    data = merge_obj(data, handleResponse(bytes, data));
    bytes = bytes.slice(-9);
    data = merge_obj(data, handleKeepalive(bytes, data));
  }

  return data;
}

// 011D5A78FA2C01F080
function hexToDecArr(hexData) {
  return hexData.match(/.{1,2}/g).map(function (byte) { return parseInt(byte, 16) })
}

function toTagoFormat(object_item, group, prefix = '', location_var) {
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

// let payload = [{ variable: 'payload', value: '011D5A78FA2C01F080', group: '' }];

const data = payload.find(x => x.variable === 'data' || x.variable === 'payload');
if (data) {
  const group = String(data.group || Date.now());
  const vars_to_tago = decodeUplink({ bytes: hexToDecArr(data.value), port: 2 });
  payload = [...payload, ...toTagoFormat(vars_to_tago, group, '', vars_to_tago.location)];
  // payload = payload.filter(x => !ignore_vars.includes(x.variable));
}
