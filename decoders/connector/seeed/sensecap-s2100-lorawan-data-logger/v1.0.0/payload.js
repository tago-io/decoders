/* eslint-disable no-throw-literal */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable radix */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable no-use-before-define */
/**
 * Entry, decoder.js
 */
function decodeUplink(input, port) {
  // init
  var bytes = bytes2HexString(input).toLocaleUpperCase();

  const result = {
    err: 0,
    payload: bytes,
    valid: true,
    messages: [],
  };
  const splitArray = dataSplit(bytes);
  // data decoder
  const decoderArray = [];
  for (let i = 0; i < splitArray.length; i++) {
    const item = splitArray[i];
    const { dataId } = item;
    const { dataValue } = item;
    const messages = dataIdAndDataValueJudge(dataId, dataValue);
    decoderArray.push(messages);
  }
  result.messages = decoderArray;
  return { data: result };
}

/**
 * data splits
 * @param bytes
 * @returns {*[]}
 */
function dataSplit(bytes) {
  const frameArray = [];

  for (let i = 0; i < bytes.length; i++) {
    const remainingValue = bytes;
    const dataId = remainingValue.substring(0, 2);
    let dataValue;
    let dataObj = {};
    switch (dataId) {
      case "01":
      case "20":
      case "21":
      case "30":
      case "31":
      case "33":
      case "40":
      case "41":
      case "42":
      case "43":
      case "44":
      case "45":
        dataValue = remainingValue.substring(2, 22);
        bytes = remainingValue.substring(22);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "02":
        dataValue = remainingValue.substring(2, 18);
        bytes = remainingValue.substring(18);
        dataObj = {
          dataId: "02",
          dataValue,
        };
        break;
      case "03":
      case "06":
        dataValue = remainingValue.substring(2, 4);
        bytes = remainingValue.substring(4);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "05":
      case "34":
        dataValue = bytes.substring(2, 10);
        bytes = remainingValue.substring(10);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "04":
      case "10":
      case "32":
      case "35":
      case "36":
      case "37":
      case "38":
      case "39":
        dataValue = bytes.substring(2, 20);
        bytes = remainingValue.substring(20);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      default:
        dataValue = "9";
        break;
    }
    if (dataValue.length < 2) {
      break;
    }
    frameArray.push(dataObj);
  }
  return frameArray;
}

function dataIdAndDataValueJudge(dataId, dataValue) {
  let messages = [];
  switch (dataId) {
    case "01":
      const temperature = dataValue.substring(0, 4);
      const humidity = dataValue.substring(4, 6);
      const illumination = dataValue.substring(6, 14);
      const uv = dataValue.substring(14, 16);
      const windSpeed = dataValue.substring(16, 20);
      messages = [
        {
          variable: "4097",
          value: loraWANV2DataFormat(temperature, 10),
          metadata: {
            type: "Air Temperature",
          },
        },
        {
          variable: "4098",
          value: loraWANV2DataFormat(humidity),
          metadata: {
            type: "Air Humidity",
          },
        },
        {
          variable: "4099",
          value: loraWANV2DataFormat(illumination),
          metadata: {
            type: "Light Intensity",
          },
        },
        {
          variable: "4190",
          value: loraWANV2DataFormat(uv, 10),
          metadata: {
            type: "UV Index",
          },
        },
        {
          variable: "4105",
          value: loraWANV2DataFormat(windSpeed, 10),
          metadata: {
            type: "Wind Speed",
          },
        },
      ];
      break;
    case "02":
      const windDirection = dataValue.substring(0, 4);
      const rainfall = dataValue.substring(4, 12);
      const airPressure = dataValue.substring(12, 16);
      messages = [
        {
          variable: "4104",
          value: loraWANV2DataFormat(windDirection),
          metadata: {
            type: "Wind Direction Sensor",
          },
        },
        {
          variable: "4113",
          value: loraWANV2DataFormat(rainfall, 1000),
          metadata: {
            type: "Rain Gauge",
          },
        },
        {
          variable: "4101",
          value: loraWANV2DataFormat(airPressure, 0.1),
          metadata: {
            type: "Barometric Pressure",
          },
        },
      ];
      break;
    case "03":
      const Electricity = dataValue;
      messages = [
        {
          variable: "battery",
          value: loraWANV2DataFormat(Electricity),
          unit: "%",
        },
      ];
      break;
    case "04":
      const electricityWhether = dataValue.substring(0, 2);
      const hwv = dataValue.substring(2, 6);
      const bdv = dataValue.substring(6, 10);
      const sensorAcquisitionInterval = dataValue.substring(10, 14);
      const gpsAcquisitionInterval = dataValue.substring(14, 18);
      messages = [
        {
          variable: "battery",
          value: loraWANV2DataFormat(electricityWhether),
          unit: "%",
        },
        {
          variable: "hardware_version",
          value: `${loraWANV2DataFormat(
            hwv.substring(0, 2)
          )}.${loraWANV2DataFormat(hwv.substring(2, 4))}`,
        },
        {
          variable: "firmware_version",
          value: `${loraWANV2DataFormat(
            bdv.substring(0, 2)
          )}.${loraWANV2DataFormat(bdv.substring(2, 4))}`,
        },
        {
          variable: "measure_interval",
          value: parseInt(loraWANV2DataFormat(sensorAcquisitionInterval)) * 60,
        },
        {
          variable: "gps_interval",
          value: parseInt(loraWANV2DataFormat(gpsAcquisitionInterval)) * 60,
        },
      ];
      break;
    case "05":
      const sensorAcquisitionIntervalFive = dataValue.substring(0, 4);
      const gpsAcquisitionIntervalFive = dataValue.substring(4, 8);
      messages = [
        {
          variable: "measure_interval",
          value:
            parseInt(loraWANV2DataFormat(sensorAcquisitionIntervalFive)) * 60,
        },
        {
          variable: "gps_interval",
          value: parseInt(loraWANV2DataFormat(gpsAcquisitionIntervalFive)) * 60,
        },
      ];
      break;
    case "06":
      const errorCode = dataValue;
      let descZh;
      switch (errorCode) {
        case "00":
          descZh = "ccl_sensor_error_none";
          break;
        case "01":
          descZh = "ccl_sensor_not_found";
          break;
        case "02":
          descZh = "ccl_sensor_wakeup_error";
          break;
        case "03":
          descZh = "ccl_sensor_not_response";
          break;
        case "04":
          descZh = "ccl_sensor_data_empty";
          break;
        case "05":
          descZh = "ccl_sensor_data_head_error";
          break;
        case "06":
          descZh = "ccl_sensor_data_crc_error";
          break;
        case "07":
          descZh = "ccl_sensor_data_b1_no_valid";
          break;
        case "08":
          descZh = "ccl_sensor_data_b2_no_valid";
          break;
        case "09":
          descZh = "ccl_sensor_random_not_match";
          break;
        case "0A":
          descZh = "ccl_sensor_pubkey_sign_verify_failed";
          break;
        case "0B":
          descZh = "ccl_sensor_data_sign_verify_failed";
          break;
        case "0C":
          descZh = "ccl_sensor_data_value_hi";
          break;
        case "0D":
          descZh = "ccl_sensor_data_value_low";
          break;
        case "0E":
          descZh = "ccl_sensor_data_value_missed";
          break;
        case "0F":
          descZh = "ccl_sensor_arg_invaild";
          break;
        case "10":
          descZh = "ccl_sensor_rs485_master_busy";
          break;
        case "11":
          descZh = "ccl_sensor_rs485_rev_data_error";
          break;
        case "12":
          descZh = "ccl_sensor_rs485_reg_missed";
          break;
        case "13":
          descZh = "ccl_sensor_rs485_fun_exe_error";
          break;
        case "14":
          descZh = "ccl_sensor_rs485_write_strategy_error";
          break;
        case "15":
          descZh = "ccl_sensor_config_error";
          break;
        case "FF":
          descZh = "ccl_sensor_data_error_unkonw";
          break;
        default:
          descZh = "cc_other_failed";
          break;
      }
      messages = [
        {
          variable: "4101",
          value: descZh,
          metadata: {
            type: "sensor_error_event",
          },
        },
      ];
      break;
    case "10":
      const statusValue = dataValue.substring(0, 2);
      const { status, type } = loraWANV2BitDataFormat(statusValue);
      const sensecapId = dataValue.substring(2);
      messages = [
        {
          variable: "case10",
          value: "case10",
          metadata: {
            status,
            channelType: type,
            sensorEui: sensecapId,
          },
        },
      ];
      break;
    case "20":
      let initmeasurementId = 4175;
      const sensor = [];
      for (let i = 0; i < dataValue.length; i += 4) {
        const modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2));
        const detectionType = loraWANV2DataFormat(
          dataValue.substring(i + 2, i + 4)
        );
        const aiHeadValues = `${modelId}.${detectionType}`;
        sensor.push({
          variable: String(initmeasurementId),
          value: aiHeadValues,
        });
        initmeasurementId++;
      }
      messages = sensor;
      break;
    case "21":
      // Vision AI:
      // AI 识别输出帧
      const tailValueArray = [];
      let initTailmeasurementId = 4180;
      for (let i = 0; i < dataValue.length; i += 4) {
        const modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2));
        const detectionType = loraWANV2DataFormat(
          dataValue.substring(i + 2, i + 4)
        );
        const aiTailValues = `${modelId}.${detectionType}`;
        tailValueArray.push({
          variable: String(initTailmeasurementId),
          value: aiTailValues,
          metadata: {
            type: `AI Detection ${i}`,
          },
        });
        initTailmeasurementId++;
      }
      messages = tailValueArray;
      break;
    case "30":
    case "31":
      // 首帧或者首帧输出帧
      const channelInfoOne = loraWANV2ChannelBitFormat(
        dataValue.substring(0, 2)
      );
      const dataOne = {
        variable: String(parseInt(channelInfoOne.one)),
        value: loraWANV2DataFormat(dataValue.substring(4, 12), 1000),
        metadata: {
          type: "Measurement",
        },
      };
      const dataTwo = {
        variable: String(parseInt(channelInfoOne.two)),
        value: loraWANV2DataFormat(dataValue.substring(12, 20), 1000),
        metadata: {
          type: "Measurement",
        },
      };
      const cacheArrayInfo = [];
      if (parseInt(channelInfoOne.one)) {
        cacheArrayInfo.push(dataOne);
      }
      if (parseInt(channelInfoOne.two)) {
        cacheArrayInfo.push(dataTwo);
      }
      cacheArrayInfo.forEach((item) => {
        messages.push(item);
      });
      break;
    case "32":
      const channelInfoTwo = loraWANV2ChannelBitFormat(
        dataValue.substring(0, 2)
      );
      const dataThree = {
        variable: String(parseInt(channelInfoTwo.one)),
        value: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        metadata: {
          type: "Measurement",
        },
      };
      const dataFour = {
        variable: String(parseInt(channelInfoTwo.two)),
        value: loraWANV2DataFormat(dataValue.substring(10, 18), 1000),
        metadata: {
          type: "Measurement",
        },
      };
      if (parseInt(channelInfoTwo.one)) {
        messages.push(dataThree);
      }
      if (parseInt(channelInfoTwo.two)) {
        messages.push(dataFour);
      }
      break;
    case "33":
      const channelInfoThree = loraWANV2ChannelBitFormat(
        dataValue.substring(0, 2)
      );
      const dataFive = {
        variable: String(parseInt(channelInfoThree.one)),
        value: loraWANV2DataFormat(dataValue.substring(4, 12), 1000),
        metadata: {
          type: "Measurement",
        },
      };
      const dataSix = {
        variable: String(parseInt(channelInfoThree.two)),
        value: loraWANV2DataFormat(dataValue.substring(12, 20), 1000),
        metadata: {
          type: "Measurement",
        },
      };
      if (parseInt(channelInfoThree.one)) {
        messages.push(dataFive);
      }
      if (parseInt(channelInfoThree.two)) {
        messages.push(dataSix);
      }

      break;
    case "34":
      const model = loraWANV2DataFormat(dataValue.substring(0, 2));
      const GPIOInput = loraWANV2DataFormat(dataValue.substring(2, 4));
      const simulationModel = loraWANV2DataFormat(dataValue.substring(4, 6));
      const simulationInterface = loraWANV2DataFormat(
        dataValue.substring(6, 8)
      );
      messages = [
        {
          variable: "datalogger",
          value: "datalogger",
          metadata: {
            dataloggerProtocol: model,
            dataloggerGPIOInput: GPIOInput,
            dataloggerAnalogType: simulationModel,
            dataloggerAnalogInterface: simulationInterface,
          },
        },
      ];
      break;
    case "35":
    case "36":
      const channelTDOne = loraWANV2ChannelBitFormat(dataValue.substring(0, 2));
      const channelSortTDOne = 3920 + (parseInt(channelTDOne.one) - 1) * 2;
      const channelSortTDTWO = 3921 + (parseInt(channelTDOne.one) - 1) * 2;
      messages = [
        {
          variable: String([channelSortTDOne]),
          value: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        },
        {
          variable: String([channelSortTDTWO]),
          value: loraWANV2DataFormat(dataValue.substring(10, 18), 1000),
        },
      ];
      break;
    case "37":
      const channelTDInfoTwo = loraWANV2ChannelBitFormat(
        dataValue.substring(0, 2)
      );
      const channelSortOne = 3920 + (parseInt(channelTDInfoTwo.one) - 1) * 2;
      const channelSortTWO = 3921 + (parseInt(channelTDInfoTwo.one) - 1) * 2;
      messages = [
        {
          variable: String([channelSortOne]),
          value: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        },
        {
          variable: String([channelSortTWO]),
          value: loraWANV2DataFormat(dataValue.substring(10, 18), 1000),
        },
      ];
      break;
    case "38":
      const channelTDInfoThree = loraWANV2ChannelBitFormat(
        dataValue.substring(0, 2)
      );
      const channelSortThreeOne =
        3920 + (parseInt(channelTDInfoThree.one) - 1) * 2;
      const channelSortThreeTWO =
        3921 + (parseInt(channelTDInfoThree.one) - 1) * 2;
      messages = [
        {
          variable: String([channelSortThreeOne]),
          value: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        },
        {
          variable: String([channelSortThreeTWO]),
          value: loraWANV2DataFormat(dataValue.substring(10, 18), 1000),
        },
      ];
      break;
    case "39":
      const electricityWhetherTD = dataValue.substring(0, 2);
      const hwvTD = dataValue.substring(2, 6);
      const bdvTD = dataValue.substring(6, 10);
      const sensorAcquisitionIntervalTD = dataValue.substring(10, 14);
      const gpsAcquisitionIntervalTD = dataValue.substring(14, 18);

      messages = [
        {
          variable: "battery",
          value: loraWANV2DataFormat(electricityWhetherTD),
          unit: "%",
        },
        {
          variable: "hardware_version",
          value: `${loraWANV2DataFormat(
            hwvTD.substring(0, 2)
          )}.${loraWANV2DataFormat(hwvTD.substring(2, 4))}`,
        },
        {
          variable: "firmware_version",
          value: `${loraWANV2DataFormat(
            bdvTD.substring(0, 2)
          )}.${loraWANV2DataFormat(bdvTD.substring(2, 4))}`,
        },
        {
          variable: "measure_interval",
          value:
            parseInt(loraWANV2DataFormat(sensorAcquisitionIntervalTD)) * 60,
        },
        {
          variable: "thresholdMeasureInterval",
          value: parseInt(loraWANV2DataFormat(gpsAcquisitionIntervalTD)),
        },
      ];
      break;
    case "40":
    case "41":
      const lightIntensity = dataValue.substring(0, 4);
      const loudness = dataValue.substring(4, 8);
      // X
      const accelerateX = dataValue.substring(8, 12);
      // Y
      const accelerateY = dataValue.substring(12, 16);
      // Z
      const accelerateZ = dataValue.substring(16, 20);
      messages = [
        {
          variable: "4193",
          value: loraWANV2DataFormat(lightIntensity),
          metadata: {
            type: "Light Intensity",
          },
        },
        {
          variable: "4192",
          value: loraWANV2DataFormat(loudness),
          metadata: {
            type: "Sound Intensity",
          },
        },
        {
          variable: "4150",
          value: loraWANV2DataFormat(accelerateX, 100),
          metadata: {
            type: "AccelerometerX",
          },
        },
        {
          variable: "4151",
          value: loraWANV2DataFormat(accelerateY, 100),
          metadata: {
            type: "AccelerometerY",
          },
        },
        {
          variable: "4152",
          value: loraWANV2DataFormat(accelerateZ, 100),
          metadata: {
            type: "AccelerometerZ",
          },
        },
      ];
      break;
    case "42":
      const airTemperature = dataValue.substring(0, 4);
      const AirHumidity = dataValue.substring(4, 8);
      const tVOC = dataValue.substring(8, 12);
      const CO2eq = dataValue.substring(12, 16);
      const soilMoisture = dataValue.substring(16, 20);
      messages = [
        {
          variable: "4097",
          value: loraWANV2DataFormat(airTemperature, 100),
          metadata: {
            type: "Air Temperature",
          },
        },
        {
          variable: "4098",
          value: loraWANV2DataFormat(AirHumidity, 100),
          metadata: {
            type: "Air Humidity",
          },
        },
        {
          variable: "4195",
          value: loraWANV2DataFormat(tVOC),
          metadata: {
            type: "Total Volatile Organic Compounds",
          },
        },
        {
          variable: "4100",
          value: loraWANV2DataFormat(CO2eq),
          metadata: {
            type: "CO2",
          },
        },
        {
          variable: "4196",
          value: loraWANV2DataFormat(soilMoisture),
          metadata: {
            type: "Soil moisture intensity",
          },
        },
      ];
      break;
    case "43":
    case "44":
      const headerDevKitValueArray = [];
      let initDevkitmeasurementId = 4175;
      for (let i = 0; i < dataValue.length; i += 4) {
        const modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2));
        const detectionType = loraWANV2DataFormat(
          dataValue.substring(i + 2, i + 4)
        );
        const aiHeadValues = `${modelId}.${detectionType}`;
        headerDevKitValueArray.push({
          variable: String(initDevkitmeasurementId),
          value: aiHeadValues,
          metadata: {
            type: `AI Detection ${i}`,
          },
        });
        initDevkitmeasurementId++;
      }
      messages = headerDevKitValueArray;
      break;
    case "45":
      let initTailDevKitmeasurementId = 4180;
      for (let i = 0; i < dataValue.length; i += 4) {
        const modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2));
        const detectionType = loraWANV2DataFormat(
          dataValue.substring(i + 2, i + 4)
        );
        const aiTailValues = `${modelId}.${detectionType}`;
        messages.push({
          variable: String(initTailDevKitmeasurementId),
          value: aiTailValues,
          metadata: {
            type: `AI Detection ${i}`,
          },
        });
        initTailDevKitmeasurementId++;
      }
      break;
    default:
      break;
  }
  return messages;
}

/**
 *
 * data formatting
 * @param str
 * @param divisor
 * @returns {string|number}
 */
function loraWANV2DataFormat(str, divisor = 1) {
  const strReverse = bigEndianTransform(str);
  let str2 = toBinary(strReverse);
  if (str2.substring(0, 1) === "1") {
    const arr = str2.split("");
    const reverseArr = arr.map((item) => {
      if (parseInt(item) === 1) {
        return 0;
      }
      return 1;
    });
    str2 = parseInt(reverseArr.join(""), 2) + 1;
    return `-${str2 / divisor}`;
  }
  return parseInt(str2, 2) / divisor;
}

/**
 * Handling big-endian data formats
 * @param data
 * @returns {*[]}
 */
function bigEndianTransform(data) {
  const dataArray = [];
  for (let i = 0; i < data.length; i += 2) {
    dataArray.push(data.substring(i, i + 2));
  }
  // array of hex
  return dataArray;
}

/**
 * Convert to an 8-digit binary number with 0s in front of the number
 * @param arr
 * @returns {string}
 */
function toBinary(arr) {
  const binaryData = arr.map((item) => {
    let data = parseInt(item, 16).toString(2);
    const dataLength = data.length;
    if (data.length !== 8) {
      for (let i = 0; i < 8 - dataLength; i++) {
        data = `0${data}`;
      }
    }
    return data;
  });
  const ret = binaryData.toString().replace(/,/g, "");
  return ret;
}

/**
 * sensor
 * @param str
 * @returns {{channel: number, type: number, status: number}}
 */
function loraWANV2BitDataFormat(str) {
  const strReverse = bigEndianTransform(str);
  const str2 = toBinary(strReverse);
  const channel = parseInt(str2.substring(0, 4), 2);
  const status = parseInt(str2.substring(4, 5), 2);
  const type = parseInt(str2.substring(5), 2);
  return { channel, status, type };
}

/**
 * channel info
 * @param str
 * @returns {{channelTwo: number, channelOne: number}}
 */
function loraWANV2ChannelBitFormat(str) {
  const strReverse = bigEndianTransform(str);
  const str2 = toBinary(strReverse);
  const one = parseInt(str2.substring(0, 4), 2);
  const two = parseInt(str2.substring(4, 8), 2);
  const resultInfo = {
    one,
    two,
  };
  return resultInfo;
}

/**
 * data log status bit
 * @param str
 * @returns {{total: number, level: number, isTH: number}}
 */
function loraWANV2DataLogBitFormat(str) {
  const strReverse = bigEndianTransform(str);
  const str2 = toBinary(strReverse);
  const isTH = parseInt(str2.substring(0, 1), 2);
  const total = parseInt(str2.substring(1, 5), 2);
  const left = parseInt(str2.substring(5), 2);
  const resultInfo = {
    isTH,
    total,
    left,
  };
  return resultInfo;
}

function bytes2HexString(arrBytes) {
  var str = "";
  for (var i = 0; i < arrBytes.length; i++) {
    var tmp;
    var num = arrBytes[i];
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

function toTagoFormat(result) {
  if (!result.data.messages.length) {
    return "Payload is not valid";
  }

  console.log("result", result.data.messages);
  const arrayToTago = [];
  result.data.messages.forEach((messageArray) => {
    messageArray.forEach((item) => {
      arrayToTago.push(item);
    });
  });

  console.log("arrayToTago", arrayToTago);
  return arrayToTago;
}

const payload_raw = payload.find((x) => x.variable === "payload");

if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const payload_aux = toTagoFormat(decodeUplink(buffer));
    // verify if payload_aux is of type array
    payload = payload.concat(payload_aux.map((x) => ({ ...x })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}

console.log("payload", payload);
