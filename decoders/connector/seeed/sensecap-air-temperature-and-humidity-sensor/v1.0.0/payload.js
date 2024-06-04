/**
 * SenseCAP & TTN Converter
 *
 * @since 1.0
 * @return Object
 *      @param  Boolean     valid       Indicates whether the payload is a valid payload.
 *      @param  String      err         The reason for the payload to be invalid. 0 means valid, minus means invalid.
 *      @param  String      payload     Hexadecimal string, to show the payload.
 *      @param  Array       messages    One or more messages are parsed according to payload.
 *                              type // Enum:
 *                                   //   - "report_telemetry"
 *                                   //   - "upload_battery"
 *                                   //   - "upload_interval"
 *                                   //   - "upload_version"
 *                                   //   - "upload_sensor_id"
 *                                   //   - "report_remove_sensor"
 *                                   //   - "unknown_message"
 *
 *
 *
 *
 *  @sample-1
 *      var sample = Decoder(["00", "00", "00", "01", "01", "00", "01", "00", "07", "00", "64", "00", "3C", "00", "01", "20", "01", "00", "00", "00", "00", "28", "90"], null);
 *      {
 *        valid: true,
 *        err: 0,
 *        payload: '0000000101000100070064003C00012001000000002890',
 *        messages: [
 *           { type: 'upload_version',
 *             hardwareVersion: '1.0',
 *             softwareVersion: '1.1' },
 *           { type: 'upload_battery', battery: 100 },
 *           { type: 'upload_interval', interval: 3600 },
 *           { type: 'report_remove_sensor', channel: 1 }
 *        ]
 *      }
 * @sample-2
 *      var sample = Decoder(["01", "01", "10", "98", "53", "00", "00", "01", "02", "10", "A8", "7A", "00", "00", "AF", "51"], null);
 *      {
 *        valid: true,
 *        err: 0,
 *        payload: '01011098530000010210A87A0000AF51',
 *        messages: [
 *           { type: 'report_telemetry',
 *             measurementId: 4097,
 *             measurementValue: 21.4 },
 *           { type: 'report_telemetry',
 *             measurementId: 4098,
 *             measurementValue: 31.4 }
 *        ]
 *      }
 * @sample-3
 *      var sample = Decoder(["01", "01", "00", "01", "01", "00", "01", "01", "02", "00", "6A", "01", "00", "15", "01", "03", "00", "30", "F1", "F7", "2C", "01", "04", "00", "09", "0C", "13", "14", "01", "05", "00", "7F", "4D", "00", "00", "01", "06", "00", "00", "00", "00", "00", "4C", "BE"], null);
 *      {
 *        valid: true,
 *        err: 0,
 *        payload: '010100010100010102006A01001501030030F1F72C010400090C13140105007F4D0000010600000000004CBE',
 *        messages: [
 *            { type: 'upload_sensor_id', sensorId: '2CF7F1301500016A', channel: 1 }
 *        ]
 *      }
 */

// util
function toBinary(arr) {
  const binaryData = [];
  // eslint-disable-next-line no-plusplus
  for (let forArr = 0; forArr < arr.length; forArr++) {
    const item = arr[forArr];
    let data = parseInt(item, 16).toString(2);
    const dataLength = data.length;
    if (data.length !== 8) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 8 - dataLength; i++) {
        data = `0${data}`;
      }
    }
    binaryData.push(data);
  }
  return binaryData.toString().replace(/,/g, "");
}

function crc16Check(data) {
  return true;
}

// util
function bytes2HexString(arrBytes) {
  let str = "";
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < arrBytes.length; i++) {
    let tmp;
    const num = arrBytes[i];
    if (num < 0) {
      tmp = (255 + num + 1).toString(16);
    } else {
      tmp = num.toString(16);
    }
    if (tmp.length === 1) {
      tmp = `0${tmp}`;
    }
    str += tmp;
  }
  return str;
}

// util
function divideBy7Bytes(str) {
  const frameArray = [];
  for (let i = 0; i < str.length - 4; i += 14) {
    const data = str.substring(i, i + 14);
    frameArray.push(data);
  }
  return frameArray;
}

// util
function littleEndianTransform(data) {
  const dataArray = [];
  for (let i = 0; i < data.length; i += 2) {
    dataArray.push(data.substring(i, i + 2));
  }
  dataArray.reverse();
  return dataArray;
}

// util
function strTo10SysNub(str) {
  const arr = littleEndianTransform(str);
  return parseInt(arr.toString().replace(/,/g, ""), 16);
}

// util
function checkDataIdIsMeasureUpload(dataId) {
  return parseInt(dataId, 10) > 4096;
}

// configurable.
function isSpecialDataId(dataID) {
  switch (dataID) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 7:
    case 0x120:
      return true;
    default:
      return false;
  }
}

// configurable
function ttnDataSpecialFormat(dataId, str) {
  const strReverse = littleEndianTransform(str);
  if (dataId === 2 || dataId === 3) {
    return strReverse.join("");
  }

  // handle unsigned number
  const str2 = toBinary(strReverse);

  const dataArray = [];
  switch (dataId) {
    case 0: // DATA_BOARD_VERSION
    case 1: // DATA_SENSOR_VERSION
      // Using point segmentation
      for (let k = 0; k < str2.length; k += 16) {
        let tmp146 = str2.substring(k, k + 16);
        tmp146 = `${parseInt(tmp146.substring(0, 8), 2) || 0}.${
          parseInt(tmp146.substring(8, 16), 2) || 0
        }`;
        dataArray.push(tmp146);
      }
      return dataArray.join(",");
    case 4:
      for (let i = 0; i < str2.length; i += 8) {
        let item = parseInt(str2.substring(i, i + 8), 2);
        if (item < 10) {
          item = `0${item.toString()}`;
        } else {
          item = item.toString();
        }
        dataArray.push(item);
      }
      return dataArray.join("");
    case 7:
      // battery && interval
      return {
        interval: parseInt(str2.substr(0, 16), 2),
        power: parseInt(str2.substr(-16, 16), 2),
      };
    default:
      return [];
  }
}

// util
function ttnDataFormat(str) {
  const strReverse = littleEndianTransform(str);
  let str2 = toBinary(strReverse);
  if (str2.substring(0, 1) === "1") {
    const arr = str2.split("");
    const reverseArr = [];
    // eslint-disable-next-line no-plusplus
    for (let forArr = 0; forArr < arr.length; forArr++) {
      const item = arr[forArr];
      if (parseInt(item, 2) === 1) {
        reverseArr.push(0);
      } else {
        reverseArr.push(1);
      }
    }
    str2 = parseInt(reverseArr.join(""), 2) + 1;
    return `-${str2 / 1000}`;
  }
  return parseInt(str2, 2) / 1000;
}

// util
function sensorAttrForVersion(dataValue) {
  const dataValueSplitArray = dataValue.split(",");
  return {
    ver_hardware: dataValueSplitArray[0],
    ver_software: dataValueSplitArray[1],
  };
}

/**
 * Entry, decoder.js
 */
function Decoder(bytes) {
  // init
  const bytesString = bytes2HexString(bytes).toLocaleUpperCase();
  const decoded = {
    // valid
    valid: true,
    err: 0,
    // bytes
    payload: bytesString,
    // messages array
    messages: [],
  };

  // Cache sensor id
  let sensorEuiLowBytes;
  let sensorEuiHighBytes;
  const frameArray = divideBy7Bytes(bytesString);
  const id_soil = (bytes[0] << 8) | bytes[1];
  if (id_soil === 3088) {
    decoded.messages.push({ ec_id: "100C" });

    decoded.messages.push({
      ec_Value:
        (bytes[2] | (bytes[3] << 8) | (bytes[4] << 16) | (bytes[5] << 24)) /
        1000,
    });
    return decoded;
  }
  // CRC check
  if (!crc16Check(bytesString)) {
    decoded.valid = false;
    decoded.err = -1; // "crc check fail."
    return decoded;
  }

  // Length Check
  if ((bytesString.length / 2 - 2) % 7 !== 0) {
    decoded.valid = false;
    decoded.err = -2; // "length check fail."
    return decoded;
  }

  // Handle each frame
  // eslint-disable-next-line no-plusplus
  for (let forFrame = 0; forFrame < frameArray.length; forFrame++) {
    const frame = frameArray[forFrame];
    // Extract key parameters
    // const channel = strTo10SysNub(frame.substring(0, 2));
    const dataID = strTo10SysNub(frame.substring(2, 6));
    const dataValue = frame.substring(6, 14);
    const realDataValue = isSpecialDataId(dataID)
      ? ttnDataSpecialFormat(dataID, dataValue)
      : ttnDataFormat(dataValue);
    // eslint-disable-next-line no-console
    // console.log(dataID, dataValue, realDataValue);

    if (checkDataIdIsMeasureUpload(dataID)) {
      // if telemetry.
      if (dataID === 4097)
        decoded.messages.push({ temperature: realDataValue });
      if (dataID === 4108 || dataID === 4111)
        decoded.messages.push({ soil_ec: realDataValue });
      else if (dataID === 4098)
        decoded.messages.push({ humidity: realDataValue });
      else if (dataID === 4100) decoded.messages.push({ co2: realDataValue });
      else if (dataID === 4102 || dataID === 4112)
        decoded.messages.push({ soil_temperature: realDataValue });
      else if (dataID === 4103 || dataID === 4110)
        decoded.messages.push({ soil_moisture: realDataValue });
      else if (dataID === 4099)
        decoded.messages.push({ ligh_itensity: realDataValue });
      else if (dataID === 4101)
        decoded.messages.push({ barometric_pressure: realDataValue });
      decoded.messages.push({
        type: "report_telemetry",
        // measurementId: dataID,
        // measurementValue: realDataValue,
      });
    } else if (isSpecialDataId(dataID) || dataID === 5 || dataID === 6) {
      // if special order, except "report_sensor_id".
      switch (dataID) {
        case 0x00:
          // node version
          decoded.messages.push({
            type: "upload_version",
            hardwareVersion: sensorAttrForVersion(realDataValue).ver_hardware,
            softwareVersion: sensorAttrForVersion(realDataValue).ver_software,
          });
          break;
        case 1:
          // sensor version
          break;
        case 2:
          // sensor eui, low bytes
          sensorEuiLowBytes = realDataValue;
          break;
        case 3:
          // sensor eui, high bytes
          sensorEuiHighBytes = realDataValue;
          break;
        case 7:
          // battery power && interval
          decoded.messages.push(
            { type: "upload_battery", battery: realDataValue.power },
            {
              type: "upload_interval",
              interval: parseInt(realDataValue.interval, 10) * 60,
            }
          );
          break;
        case 0x120:
          // remove sensor
          decoded.messages.push({
            type: "report_remove_sensor",
            channel: 1,
          });
          break;
        default:
          break;
      }
    } else {
      decoded.messages.push({
        type: "unknown_message",
        dataID,
        dataValue,
      });
    }
  }

  // if the complete id received, as "upload_sensor_id"
  if (sensorEuiHighBytes && sensorEuiLowBytes) {
    decoded.messages.unshift({
      type: "upload_sensor_id",
      channel: 1,
      sensorId: (sensorEuiHighBytes + sensorEuiLowBytes).toUpperCase(),
    });
  }

  // return
  return decoded;
}

function ToTagoFormat(object_item, serie, prefix = "") {
  const result = [];
  const messages = [];
  // eslint-disable-next-line guard-for-in
  for (let i = 0; i < object_item.messages.length; i += 1) {
    if (typeof object_item.messages[i] === "object") {
      // eslint-disable-next-line guard-for-in
      for (const item in object_item.messages[i]) {
        let data_to_send = {
          variable: item.toLowerCase(),
          value:
            typeof object_item.messages[i][item] === "string"
              ? object_item.messages[i][item].toLowerCase()
              : object_item.messages[i][item],
          serie,
        };
        if (item === "temperature") data_to_send.unit = "°C";
        else if (item === "humidity") data_to_send.unit = "%";
        else if (item === "co2") data_to_send.unit = "ppm";
        else if (item === "soil_temperature") data_to_send.unit = "°C";
        else if (item === "soil_moisture") data_to_send.unit = "%";
        else if (item === "ligh_itensity") data_to_send.unit = "lux";
        else if (item === "barometric_pressure") data_to_send.unit = "pa";
        else if (item === "soil_ec") data_to_send.unit = "dS/m";
        messages.push(data_to_send);
      }
    }
  }
  delete object_item.messages;
  for (const key in object_item) {
    if (typeof object_item[key] === "object") {
      result.push({
        variable: (
          object_item[key].MessageType || `${prefix}${key}`
        ).toLowerCase(),
        value:
          // eslint-disable-next-line no-nested-ternary
          typeof object_item[key].value === "string"
            ? object_item[key].value.toLowerCase()
            : object_item[key].value ||
              typeof object_item[key].Value === "string"
            ? object_item[key].Value.toLowerCase()
            : object_item[key].Value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        unit: object_item[key].unit,
        location: object_item[key].location,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`.toLowerCase(),
        value:
          typeof object_item[key] === "string"
            ? object_item[key].toLowerCase()
            : object_item[key],
        serie,
      });
    }
  }
  return result.concat(messages);
}

const data = payload.find(
  (x) =>
    x.variable === "payload_raw" ||
    x.variable === "payload" ||
    x.variable === "data"
);

if (data) {
  const buffer = Buffer.from(data.value, "hex");
  const serie = new Date().getTime();
  payload = ToTagoFormat(Decoder(buffer), serie);
}
