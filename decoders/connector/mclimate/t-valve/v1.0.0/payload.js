function decodeUplink(input) {
  var bytes = input.bytes;
  var decbin = function (number) {
    return parseInt(number, 10).toString(2);
  };
  var byteArray = bytes.map(function (byte) {
    var number = decbin(byte);
    return Array(9 - number.length).join('0') + number;
  });

  var messageTypes = ['keepalive', 'testButtonPressed', 'floodDetected', 'controlButtonPressed', 'fraudDetected'];
  toBool = function (value) {
    return value == '1';
  };
  shortPackage = function (byteArray) {
    return {
      reason: 'keepalive',
      waterTemp: parseInt(byteArray[0], 2) / 2,
      valveState: toBool(byteArray[1][0]),
      ambientTemp: (parseInt(byteArray[1].slice(1, 8), 2) - 20) / 2,
    };
  };
  longPackage = function (byteArray) {
    return {
      reason: messageTypes[parseInt(byteArray[0].slice(0, 3), 2)],
      boxTamper: toBool(byteArray[0][4]),
      floodDetectionWireState: toBool(byteArray[0][5]),
      flood: toBool(byteArray[0][6]),
      magnet: toBool(byteArray[0][7]),
      alarmValidated: toBool(byteArray[1][0]),
      manualOpenIndicator: toBool(byteArray[1][1]),
      manualCloseIndicator: toBool(byteArray[1][2]),
      closeTime: parseInt(byteArray[2], 2),
      openTime: parseInt(byteArray[3], 2),
      battery: ((parseInt(byteArray[4], 2) * 8) + 1600) / 1000,
    };
  };
  if (byteArray.length > 2) {
    return longPackage(byteArray);
  } else {
    return shortPackage(byteArray);
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
// let payload = [{ variable: 'payload', value: '1205010267980C301B00029100', group: '' }];

const data = payload.find(x => x.variable === 'data' || x.variable === 'payload');
if (data) {
  const group = String(data.group || Date.now());
  const lets_to_tago = decodeUplink({ bytes: hexToDecArr(data.value), port: 2 });
  payload = [...payload, ...toTagoFormat(lets_to_tago, group, '', lets_to_tago.location)];
}
