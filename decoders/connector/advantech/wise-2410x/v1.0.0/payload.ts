/* eslint-disable unicorn/prefer-string-replace-all */
/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable unicorn/prefer-string-slice */
/* eslint-disable unicorn/prefer-date-now */
/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable unicorn/number-literal-case */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unicorn/no-lonely-if */
/* eslint-disable unicorn/prefer-at */
/* eslint-disable unicorn/prefer-negative-index */
/* eslint-disable no-undef */
/* eslint-disable no-redeclare */
/* eslint-disable curly */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable no-var */
// @ts-nocheck

// Code received from Advantech, therfor after verifying with Vitor, Typescript will not be needed.

////////////////////////////////////////////////////////////////////////////////
// Advantech, iSensing SW team
//
// Frame Data Parser for WISE Lora modules (execute in Node-RED)
//
// version: 1.7.1 <2023/09/26>
//
////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////
// User defined variables
///////////////////////////////////////

// If program is run in NodeRed. True: run in NodeRed, False: not run in NodeRed
var bIsRunNodeRed = false;

// If MQTT publish message with Femto Gateway. True: publish with Femto Gateway, False: not publish with Femto Gateway
var bIsFemtoGateway = false;

///////////////////////////////////////
// User defined variables
///////////////////////////////////////

//Min Frame length
const MIN_FRAME_LENGTH = 4;

//Header
const MASK_HEADER_FIRST_SEGMENT = 0x80;
const MASK_HEADER_ADDRESS_MODE = 0x0c;
const MASK_HEADER_ADDRESS_NONE = 0x00;
const MASK_HEADER_ADDRESS_2_OCTECT = 0x04;
const MASK_HEADER_ADDRESS_8_OCTECT = 0x08;
const MASK_HEADER_FRAME_VERSION = 0x03;

//Payload Data
//AI
const PAYLOAD_DI_DATA = 0x00;
//DO
const PAYLOAD_DO_DATA = 0x10;
//DI
const PAYLOAD_AI_DATA = 0x30;
//Sensor
const PAYLOAD_SENSOR_DATA = 0x50;
//Device Status
const PAYLOAD_DEVICE_DATA = 0x60;
//Coil data
const PAYLOAD_COIL_DATA = 0x70;
//Register data
const PAYLOAD_REGISTER_DATA = 0x80;

//DI
const MASK_PAYLOAD_DI_STATUS = 0x01;
const MASK_PAYLOAD_DI_VALUE = 0x02;
const MASK_PAYLOAD_DI_EVENT = 0x04;
const DI_MODE_FREQUENCY = 4;

//DO
const MASK_PAYLOAD_DO_STATUS = 0x01;
const MASK_PAYLOAD_DO_ABSOLUTE_PULSE_OUTPUT = 0x02;
const MASK_PAYLOAD_DO_INCREMENTAL_PULSE_OUTPUT = 0x04;

//AI
const MASK_PAYLOAD_AI_STATUS = 0x01;
const MASK_PAYLOAD_AI_RAW_VALUE = 0x02;
const MASK_PAYLOAD_AI_EVENT = 0x04;
const MASK_PAYLOAD_AI_MAX_VALUE = 0x08;
const MASK_PAYLOAD_AI_MIN_VALUE = 0x10;

const MASK_PAYLOAD_AI_MASK2_RANGE = 0x01;

//Sensor Range
const MASK_PAYLOAD_SENSOR_TEMP_C_TYPE = 0x00;
const MASK_PAYLOAD_SENSOR_TEMP_F_TYPE = 0x01;
const MASK_PAYLOAD_SENSOR_TEMP_K_TYPE = 0x02;
const MASK_PAYLOAD_SENSOR_HUMIDITY_TYPE = 0x03;
const MASK_PAYLOAD_SENSOR_ACCELERATOR_TYPE_G = 0x04;
const MASK_PAYLOAD_SENSOR_ACCELERATOR_TYPE_MS2 = 0x05;

const MASK_PAYLOAD_SENSOR_MASK_SENSNSOR_STATUS = 0x01;
const MASK_PAYLOAD_SENSOR_MASK_SENSNSOR_EVENT = 0x02;
const MASK_PAYLOAD_SENSOR_MASK_SENSNSOR_VALUE = 0x04;
const MASK_PAYLOAD_SENSOR_MASK_SENSNSOR_MAX_VALUE = 0x08;
const MASK_PAYLOAD_SENSOR_MASK_SENSNSOR_MIN_VALUE = 0x10;

const MASK_PAYLOAD_SENSOR_AXIS_X_MASK = 0x01;
const MASK_PAYLOAD_SENSOR_AXIS_Y_MASK = 0x02;
const MASK_PAYLOAD_SENSOR_AXIS_Z_MASK = 0x04;

const MASK_PAYLOAD_SENSOR_MASK2_LOGINDEX = 0x01;
const MASK_PAYLOAD_SENSOR_MASK2_TIME = 0x02;

//Sensor Extend Mask
const MASK_PAYLOAD_SENSOR_EXTMASK_VELOCITY = 0x01;
const MASK_PAYLOAD_SENSOR_EXTMASK_PEAK = 0x02;
const MASK_PAYLOAD_SENSOR_EXTMASK_RMS = 0x04;
const MASK_PAYLOAD_SENSOR_EXTMASK_KURTOSIS = 0x08;
const MASK_PAYLOAD_SENSOR_EXTMASK_CRESTFACTOR = 0x10;
const MASK_PAYLOAD_SENSOR_EXTMASK_SKEWNESS = 0x20;
const MASK_PAYLOAD_SENSOR_EXTMASK_STDDEVIATION = 0x40;
const MASK_PAYLOAD_SENSOR_EXTMASK_DISPLACEMENT = 0x80;

//Massive data
const MASK_PAYLOAD_SENSOR_EXTMASK_B = 0x01;
const MASK_PAYLOAD_SENSOR_EXTMASK_MASSIVE_DATA_INFO = 0x01;
const MASK_PAYLOAD_SENSOR_EXTMASK_MASSIVE_DATA_SEC = 0x02;
const MASK_PAYLOAD_SENSOR_EXTMASK_MASSIVE_DATA_LOG = 0x04;

//Massive Data Type
const MASK_PAYLOAD_SENSOR_MASSIVE_DATA_TYPE_MASSIVE_TYPE = 0x03;
const MASK_PAYLOAD_SENSOR_MASSIVE_DATA_TYPE_SAMPLE_PER_AXIS = 0x0c;
const MASK_PAYLOAD_SENSOR_MASSIVE_DATA_TYPE_BYTES_PER_SAMPLE = 0x10;
const MASK_PAYLOAD_SENSOR_MASSIVE_DATA_TYPE_MASSIVE_TYPE_FFT = 0x01;

///////////////////////////////////////
//Device Status
const MASK_DEVICE_EVENT = 0x01;
const MASK_DEVICE_POWER_SOURCE = 0x02;
const MASK_DEVICE_BATTERY_LEVEL = 0x04;
const MASK_DEVICE_BATTERY_VOLTAGE = 0x08;
const MASK_DEVICE_TIMESTAMP = 0x10;
const MASK_DEVICE_POSITION = 0x20;

const MASK_DEVICE_POSITION_LATITUDE = 0x02;
const MASK_DEVICE_POSITION_LONGITUDE = 0x01;

//Coil Data
const MASK_PAYLOAD_COIL_STATUS = 0x01;
const MASK_PAYLOAD_COIL_VALUE = 0x02;
const MASK_PAYLOAD_COIL_MULTI_CH = 0x04;

//Register Data
const MASK_PAYLOAD_REGISTER_STATUS = 0x01;
const MASK_PAYLOAD_REGISTER_VALUE = 0x02;
const MASK_PAYLOAD_REGISTER_MULTI_CH = 0x04;

///////////////////////////////////////
// Variables
////////////////////////////////////////////

//input data is hex string

var version;
var payload_mac;

//If program executes in NodeRed, get input data from msg.payload.data
if (bIsRunNodeRed) {
  if (bIsFemtoGateway) {
    payloadHex = msg.payload[0].data;
    payload_mac = msg.payload[0].macAddr;
  } else {
    payloadHex = msg.payload.data;
    if (msg.payload.macAddr) {
      payload_mac = msg.payload.macAddr;
    } else {
      payload_mac = "";
    }
  }
} else {
  var msg = {};
  msg.payload = "";
}

/* 8bit-CRC: 0x07 = x8 + x2 + x + 1 */
var au8CRC8_Pol07_Table = [
  0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b, 0x12, 0x15, 0x38, 0x3f, 0x36, 0x31, 0x24, 0x23, 0x2a, 0x2d, 0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65, 0x48, 0x4f, 0x46, 0x41, 0x54,
  0x53, 0x5a, 0x5d, 0xe0, 0xe7, 0xee, 0xe9, 0xfc, 0xfb, 0xf2, 0xf5, 0xd8, 0xdf, 0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd, 0x90, 0x97, 0x9e, 0x99, 0x8c, 0x8b, 0x82, 0x85, 0xa8, 0xaf,
  0xa6, 0xa1, 0xb4, 0xb3, 0xba, 0xbd, 0xc7, 0xc0, 0xc9, 0xce, 0xdb, 0xdc, 0xd5, 0xd2, 0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4, 0xed, 0xea, 0xb7, 0xb0, 0xb9, 0xbe, 0xab, 0xac, 0xa5,
  0xa2, 0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a, 0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32, 0x1f, 0x18, 0x11, 0x16, 0x03, 0x04, 0x0d, 0x0a, 0x57, 0x50, 0x59, 0x5e,
  0x4b, 0x4c, 0x45, 0x42, 0x6f, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7d, 0x7a, 0x89, 0x8e, 0x87, 0x80, 0x95, 0x92, 0x9b, 0x9c, 0xb1, 0xb6, 0xbf, 0xb8, 0xad, 0xaa, 0xa3, 0xa4, 0xf9,
  0xfe, 0xf7, 0xf0, 0xe5, 0xe2, 0xeb, 0xec, 0xc1, 0xc6, 0xcf, 0xc8, 0xdd, 0xda, 0xd3, 0xd4, 0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c, 0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a,
  0x43, 0x44, 0x19, 0x1e, 0x17, 0x10, 0x05, 0x02, 0x0b, 0x0c, 0x21, 0x26, 0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34, 0x4e, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5c, 0x5b, 0x76, 0x71, 0x78,
  0x7f, 0x6a, 0x6d, 0x64, 0x63, 0x3e, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2c, 0x2b, 0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d, 0x14, 0x13, 0xae, 0xa9, 0xa0, 0xa7, 0xb2, 0xb5, 0xbc, 0xbb,
  0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8d, 0x84, 0x83, 0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb, 0xe6, 0xe1, 0xe8, 0xef, 0xfa, 0xfd, 0xf4, 0xf3,
];

////////////////////////////////////////////
// Functions
////////////////////////////////////////////

function transformData(data, parentKey = "") {
  let transformed = [];

  Object.keys(data).forEach((key) => {
    // Process the key to be in lowercase and replace spaces with underscores
    const processedKey = key.toLowerCase().replace(/\s+/g, "_");
    // Initially form the newKey, then replace "." and "-" with "_"
    let newKey = parentKey ? `${parentKey}.${processedKey}` : processedKey;
    // Replace "." and "-" with "_" in the newKey
    newKey = newKey.replace(/[.-]/g, "_");

    if (typeof data[key] === "object" && data[key] !== null && !Array.isArray(data[key])) {
      // Recursively call transformData for nested objects
      transformed = transformed.concat(transformData(data[key], newKey));
    } else {
      // Push the processed key and value to the transformed array
      transformed.push({ variable: newKey, value: data[key] });
    }
  });

  return transformed;
}

if (!bIsRunNodeRed) {
  var node = function () {};
  node.warn = function (arg) {
    console.log(arg);
  };
  node.error = function (arg) {
    console.error(arg);
  };
}

function addZero(i) {
  i = i + "";
  if (i.length < 2) {
    i = "0" + i;
  }
  return i;
}

function translateInt32(a, b, c, d) {
  return (d << 24) + (c << 16) + (b << 8) + a;
}

function translateInt24(a, b, c) {
  return (c << 16) + (b << 8) + a;
}

function translateInt16(a, b) {
  return a + (b << 8);
}

function convertMaskToArray(number, channelCount) {
  var biArray = [];
  var temp;
  for (var i = 0; i < channelCount; ++i) {
    temp = number;
    temp = temp >> i;
    biArray.push(temp & 1);
  }
  return biArray;
}

function convertToSignedInt16(number) {
  if ((number & 0x8000) > 0) {
    number = number - 0x10000;
  }
  return number;
}

function convertToSignedInt32(number) {
  if ((number & 0x80000000) > 0) {
    number = number - 0x100000000;
  }
  return number;
}

function parseAxisData(index, bIsSensorEventExist, extMask, jsonObj, range) {
  if (bIsSensorEventExist) {
    jsonObj.SenEvent = translateInt16(hexArr[index++], hexArr[index++]);
  }
  if (extMask & MASK_PAYLOAD_SENSOR_EXTMASK_VELOCITY) {
    jsonObj.OAVelocity = translateInt16(hexArr[index++], hexArr[index++]) / 100;
  }
  if (extMask & MASK_PAYLOAD_SENSOR_EXTMASK_PEAK) {
    if (range === MASK_PAYLOAD_SENSOR_ACCELERATOR_TYPE_G) {
      jsonObj.Peak = translateInt16(hexArr[index++], hexArr[index++]) / 1000;
    } else {
      jsonObj.Peak = translateInt16(hexArr[index++], hexArr[index++]) / 100;
    }
  }
  if (extMask & MASK_PAYLOAD_SENSOR_EXTMASK_RMS) {
    if (range === MASK_PAYLOAD_SENSOR_ACCELERATOR_TYPE_G) {
      jsonObj.RMS = translateInt16(hexArr[index++], hexArr[index++]) / 1000;
    } else {
      jsonObj.RMS = translateInt16(hexArr[index++], hexArr[index++]) / 100;
    }
  }
  if (extMask & MASK_PAYLOAD_SENSOR_EXTMASK_KURTOSIS) {
    jsonObj.Kurtosis = convertToSignedInt16(translateInt16(hexArr[index++], hexArr[index++])) / 100;
  }
  if (extMask & MASK_PAYLOAD_SENSOR_EXTMASK_CRESTFACTOR) {
    jsonObj.CrestFactor = convertToSignedInt16(translateInt16(hexArr[index++], hexArr[index++])) / 100;
  }
  if (extMask & MASK_PAYLOAD_SENSOR_EXTMASK_SKEWNESS) {
    jsonObj.Skewness = convertToSignedInt16(translateInt16(hexArr[index++], hexArr[index++])) / 100;
  }
  if (extMask & MASK_PAYLOAD_SENSOR_EXTMASK_STDDEVIATION) {
    jsonObj.Deviation = convertToSignedInt16(translateInt16(hexArr[index++], hexArr[index++])) / 100;
  }
  if (extMask & MASK_PAYLOAD_SENSOR_EXTMASK_DISPLACEMENT) {
    jsonObj["Peak-to-Peak Displacement"] = translateInt16(hexArr[index++], hexArr[index++]);
  }

  return index;
}

function DIParse(index) {
  var length;
  var mode = hexArr[index++] & 0x0f;

  if (version > 0) {
    length = hexArr[index++];
  }

  var channel = hexArr[index++];
  if (version > 0) length -= 1; // channel index and mask
  var channelIndex = (channel & 0xe0) >> 5;
  var channelMask = channel & 0x07;

  message["DI" + channelIndex] = {};

  if (channelMask & MASK_PAYLOAD_DI_STATUS) {
    var arrBinary = convertMaskToArray(hexArr[index++], 8);
    if (version > 0) length -= 1;

    message["DI" + channelIndex].status = {};
    message["DI" + channelIndex].status["Signal Logic"] = arrBinary[0];
    message["DI" + channelIndex].status["Start Counter"] = arrBinary[1];
    message["DI" + channelIndex].status["Get/Clean Counter Overflow"] = arrBinary[2];
    // message['DI'+channelIndex].status['Clean Counter Status'] = arrBinary[3];
    message["DI" + channelIndex].status["Get/Clean L2H Latch"] = arrBinary[4];
    message["DI" + channelIndex].status["Get/Clean H2L Latch"] = arrBinary[5];
  }

  message["DI" + channelIndex].mode = mode;

  if (channelMask & MASK_PAYLOAD_DI_VALUE) {
    if (mode == DI_MODE_FREQUENCY) {
      // frequency mode
      message["DI" + channelIndex].Frequency_Value = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
    } else {
      message["DI" + channelIndex].Counter_Value = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
    }
    if (version > 0) length -= 4;
  }

  if (channelMask & MASK_PAYLOAD_DI_EVENT) {
    message["DI" + channelIndex].Event = hexArr[index++];
    if (version > 0) length -= 1;
  }

  if (version > 0) {
    if (length > 0) {
      index += length;
    }
  }

  return index;
}

function DOParse(index) {
  var length;
  var mode = hexArr[index++] & 0x0f;

  if (version > 0) {
    length = hexArr[index++];
  }

  var channel = hexArr[index++];
  if (version > 0) length -= 1; // channel index and mask
  var channelIndex = (channel & 0xe0) >> 5;
  var channelMask = channel & 0x07;

  message["DO" + channelIndex] = {};

  var modeText = "";
  switch (mode) {
    case 0:
      modeText = "DO";
      break;
    case 1:
      modeText = "Pulse output";
      break;
    case 2:
      modeText = "Low to High delay";
      break;
    case 3:
      modeText = "High to Low delay";
      break;
    case 4:
      modeText = "AI alarm drive";
      break;
  }
  message["DO" + channelIndex].Mode = modeText;

  if (channelMask & MASK_PAYLOAD_DO_STATUS) {
    var status = convertMaskToArray(hexArr[index++], 8);
    if (version > 0) length -= 1;
    message["DO" + channelIndex].status = {};
    message["DO" + channelIndex].status["Signal Logic"] = status[0];
    message["DO" + channelIndex].status["Pulse Output Continue"] = status[1];
  }
  if (mode == 1) {
    message["DO" + channelIndex].PulsAbs = 0;
    message["DO" + channelIndex].PulsInc = 0;
  }
  if (channelMask & MASK_PAYLOAD_DO_ABSOLUTE_PULSE_OUTPUT) {
    message["DO" + channelIndex].PulsAbs = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
    if (version > 0) length -= 4;
  }
  if (channelMask & MASK_PAYLOAD_DO_INCREMENTAL_PULSE_OUTPUT) {
    message["DO" + channelIndex].PulsInc = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
    if (version > 0) length -= 4;
  }

  if (version > 0) {
    if (length > 0) {
      index += length;
    }
  }

  return index;
}

function AIParse(index) {
  var length;
  var range = hexArr[index++] & 0x0f;

  if (version > 0) {
    length = hexArr[index++];
  }

  var channel = hexArr[index++];
  if (version > 0) length -= 1; // channel index and mask
  var channelIndex = (channel & 0xe0) >> 5;
  var channelMask = channel & 0x1f;

  message["AI" + channelIndex] = {};
  message["AI" + channelIndex].Range = range;

  if (channelMask & MASK_PAYLOAD_AI_STATUS) {
    var status = convertMaskToArray(hexArr[index++], 8);
    if (version > 0) length -= 1;
    message["AI" + channelIndex].status = {};
    message["AI" + channelIndex].status["Low Alarm"] = status[0];
    message["AI" + channelIndex].status["High Alarm"] = status[1];
  }
  if (channelMask & MASK_PAYLOAD_AI_RAW_VALUE) {
    message["AI" + channelIndex]["Raw Data"] = translateInt16(hexArr[index++], hexArr[index++]);
    if (version > 0) length -= 2;
  }
  if (channelMask & MASK_PAYLOAD_AI_EVENT) {
    message["AI" + channelIndex].Event = translateInt16(hexArr[index++], hexArr[index++]);
    if (version > 0) length -= 2;
  }
  if (channelMask & MASK_PAYLOAD_AI_MAX_VALUE) {
    message["AI" + channelIndex].MaxVal = translateInt16(hexArr[index++], hexArr[index++]);
    if (version > 0) length -= 2;
  }
  if (channelMask & MASK_PAYLOAD_AI_MIN_VALUE) {
    message["AI" + channelIndex].MinVal = translateInt16(hexArr[index++], hexArr[index++]);
    if (version > 0) length -= 2;
  }

  if (version > 0 && length > 0) {
    var mask2 = hexArr[index++];
    length -= 1;
    if (mask2 & MASK_PAYLOAD_AI_MASK2_RANGE) {
      message["AI" + channelIndex].Range = hexArr[index++];
      length -= 1;
    }
    if (length > 0) {
      index += length;
    }
  }

  return index;
}

function sensorParse(index) {
  var length;
  var range = hexArr[index] & 0x0f;
  //Temperature/Humidity
  if (
    range === MASK_PAYLOAD_SENSOR_TEMP_C_TYPE ||
    range === MASK_PAYLOAD_SENSOR_TEMP_F_TYPE ||
    range === MASK_PAYLOAD_SENSOR_TEMP_K_TYPE ||
    range === MASK_PAYLOAD_SENSOR_HUMIDITY_TYPE
  ) {
    if (version > 0) {
      index++;
      length = hexArr[index];
    }

    message.TempHumi = {};
    message.TempHumi.Range = range;
    index++;
    //message.TempHumi.ChIdx = hexArr[index] & 0xE0;
    mask = hexArr[index] & 0x1f;
    if (version > 0) length -= 1; // channel index and mask
    index++;

    //if sensor status exist
    if (mask & MASK_PAYLOAD_SENSOR_MASK_SENSNSOR_STATUS) {
      message.TempHumi.Status = hexArr[index++];
      if (version > 0) length -= 1;
    }
    //if sensor event exist
    if (mask & MASK_PAYLOAD_SENSOR_MASK_SENSNSOR_EVENT) {
      message.TempHumi.Event = translateInt16(hexArr[index++], hexArr[index++]);
      if (version > 0) length -= 2;
    }
    //if sensor value exist
    if (mask & MASK_PAYLOAD_SENSOR_MASK_SENSNSOR_VALUE) {
      if (range === MASK_PAYLOAD_SENSOR_HUMIDITY_TYPE) {
        message.TempHumi.SenVal = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]) / 1000;
      } else {
        message.TempHumi.SenVal = convertToSignedInt32(translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++])) / 1000;
      }
      if (version > 0) length -= 4;
    }
    //if sensor MAX value exist
    if (mask & MASK_PAYLOAD_SENSOR_MASK_SENSNSOR_MAX_VALUE) {
      message.TempHumi.SenMaxVal = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]) / 100;
      if (version > 0) length -= 4;
    }
    //if sensor MIN value exist
    if (mask & MASK_PAYLOAD_SENSOR_MASK_SENSNSOR_MIN_VALUE) {
      message.TempHumi.SenMinVal = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]) / 100;
      if (version > 0) length -= 4;
    }

    if (version > 0) {
      // reserved
      // var mask2 = hexArr[index++];
      if (length > 0) {
        index += length;
      }
    }
  }
  if (range === MASK_PAYLOAD_SENSOR_ACCELERATOR_TYPE_G || range === MASK_PAYLOAD_SENSOR_ACCELERATOR_TYPE_MS2) {
    bIsSensorEventExist = false;

    if (version > 0) {
      index++;
      var length = hexArr[index];
    }

    index++;
    axisMask = (hexArr[index] & 0xe0) >> 5;

    var arrAxisMask = convertMaskToArray(axisMask, 8);
    var intAxisMaskEnable = 0;
    arrAxisMask.forEach(function (item) {
      if (item == 1) {
        intAxisMaskEnable++;
      }
    });

    mask = hexArr[index] & 0x1f;
    index++;
    extMask = hexArr[index]; //extend mask

    var arrExtMask = convertMaskToArray(extMask, 8);
    var intExtMaskEnable = 0;
    arrExtMask.forEach(function (item) {
      if (item == 1) {
        intExtMaskEnable++;
      }
    });

    if (!(mask & MASK_PAYLOAD_SENSOR_EXTMASK_B)) {
      message.Accelerometer = {};

      //if sensor event exist
      if (mask & MASK_PAYLOAD_SENSOR_MASK_SENSNSOR_EVENT) {
        bIsSensorEventExist = true;
      }
      index++;

      if (axisMask & MASK_PAYLOAD_SENSOR_AXIS_X_MASK) {
        message.Accelerometer["X-Axis"] = {};
        index = parseAxisData(index, bIsSensorEventExist, extMask, message.Accelerometer["X-Axis"], range);
      }
      if (axisMask & MASK_PAYLOAD_SENSOR_AXIS_Y_MASK) {
        message.Accelerometer["Y-Axis"] = {};
        index = parseAxisData(index, bIsSensorEventExist, extMask, message.Accelerometer["Y-Axis"], range);
      }
      if (axisMask & MASK_PAYLOAD_SENSOR_AXIS_Z_MASK) {
        message.Accelerometer["Z-Axis"] = {};
        index = parseAxisData(index, bIsSensorEventExist, extMask, message.Accelerometer["Z-Axis"], range);
      }

      length = length - 2 - intAxisMaskEnable * (intExtMaskEnable * 2 + (bIsSensorEventExist ? 2 : 0)); // Length - (Axis Mask + Mask) - Extend Mask A - Axis Data
      message.Accelerometer.LogIndex = 0;
      if (version > 0 && length > 0) {
        var mask2 = hexArr[index++];
        length -= 1;
        if (mask2 & MASK_PAYLOAD_SENSOR_MASK2_LOGINDEX) {
          message.Accelerometer.LogIndex = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
          length -= 4;
        }
        if (mask2 & MASK_PAYLOAD_SENSOR_MASK2_TIME) {
          message.Accelerometer.Time = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
          length -= 4;
        }
        if (length > 0) {
          index += length;
        }
      }
    } else {
      // extend mask B
      index++;
      if (extMask & MASK_PAYLOAD_SENSOR_EXTMASK_MASSIVE_DATA_INFO) {
        var dataType = hexArr[index++];
        var sampleRate = translateInt24(hexArr[index++], hexArr[index++], hexArr[index++]);
        var points = translateInt16(hexArr[index++], hexArr[index++]);
        var logIndex = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
        var timestamp = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
        var totalLength = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
        var massType = dataType & MASK_PAYLOAD_SENSOR_MASSIVE_DATA_TYPE_MASSIVE_TYPE;
        var bytesPerSample = (dataType & MASK_PAYLOAD_SENSOR_MASSIVE_DATA_TYPE_BYTES_PER_SAMPLE) >> 4 > 0 ? 4 : 2;
        var samplesPerAxis =
          massType == MASK_PAYLOAD_SENSOR_MASSIVE_DATA_TYPE_MASSIVE_TYPE_FFT && (dataType & MASK_PAYLOAD_SENSOR_MASSIVE_DATA_TYPE_SAMPLE_PER_AXIS) >> 2 > 0
            ? points / 2.56 / 2
            : points / 2.56;
        var bytesPerAxis = bytesPerSample * samplesPerAxis;

        // length = length - Massive Info
        length = length - 18;

        var objData = {};
        objData.timestamp = timestamp;
        objData.lastSeq = hexArr[1];
        objData.lastPayload = hexArr;
        objData.logIndex = logIndex;
        objData.sampleRate = sampleRate;
        objData.points = points;
        objData.bytesPerSample = bytesPerSample;
        objData.samplesPerAxis = samplesPerAxis;
        objData.bytesPerAxis = bytesPerAxis;
        objData.totalLength = totalLength;
      }
      if (extMask & MASK_PAYLOAD_SENSOR_EXTMASK_MASSIVE_DATA_SEC) {
        var FFTDataStorage = JSON.parse();
        if (typeof FFTDataStorage.timestamp == "undefined") {
          throw "FFT Data lost first packet.";
        }

        var axisType = ["X", "Y", "Z"];
        if (!(axisMask & MASK_PAYLOAD_SENSOR_AXIS_X_MASK)) {
          var axisIndex = axisType.indexOf("X");
          if (axisIndex > -1) {
            axisType.splice(axisIndex, 1);
          }
        }
        if (!(axisMask & MASK_PAYLOAD_SENSOR_AXIS_Y_MASK)) {
          var axisIndex = axisType.indexOf("Y");
          if (axisIndex > -1) {
            axisType.splice(axisIndex, 1);
          }
        }
        if (!(axisMask & MASK_PAYLOAD_SENSOR_AXIS_Z_MASK)) {
          var axisIndex = axisType.indexOf("Z");
          if (axisIndex > -1) {
            axisType.splice(axisIndex, 1);
          }
        }

        var logIndex = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
        var initialOffset = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
        var offset = initialOffset;
        // length = length - (Axis Mask + Mask + Extend Mask + Log Index + Offset)
        length = length - 10;

        message.FFT = {};
        if (!(extMask & MASK_PAYLOAD_SENSOR_EXTMASK_MASSIVE_DATA_INFO)) {
          if (FFTDataStorage.lastSeq === hexArr[1]) {
            throw "Packet of FFT Data duplicated.";
          }

          if ((("0x" + (FFTDataStorage.lastSeq + 1).toString(16)) & 0xff) !== hexArr[1]) {
            // lost packet
            var lastPayload = FFTDataStorage.lastPayload;
            var lastOffset;
            if (lastPayload[6] & MASK_PAYLOAD_SENSOR_EXTMASK_MASSIVE_DATA_INFO) {
              lastOffset = translateInt32(lastPayload[29], lastPayload[30], lastPayload[31], lastPayload[32]) + lastPayload[4] - 28;
            } else {
              lastOffset = translateInt32(lastPayload[11], lastPayload[12], lastPayload[13], lastPayload[14]) + lastPayload[4] - 10;
            }

            if (logIndex != FFTDataStorage.logIndex) {
              // previous FFT Data lost packet and next FFT Data lost first packet
              var fillLength = FFTDataStorage.bytesPerAxis * intAxisMaskEnable - 1 - lastOffset;
              var logIndex = FFTDataStorage.logIndex;

              var objData = {};
              objData.LOG_INDEX = logIndex;
              objData.BYTE_OFFSET = lastOffset;
              objData.LENGTH = fillLength;
              throw "FFT Data lost first packet.";
            }

            var fillLength = offset - lastOffset;
            var logIndex = FFTDataStorage.logIndex;

            lostPacketInfo.LOG_INDEX = logIndex;
            lostPacketInfo.BYTE_OFFSET = lastOffset;
            lostPacketInfo.LENGTH = fillLength;
          }
        }

        var timestamp = FFTDataStorage.timestamp;
        var logIndex = FFTDataStorage.logIndex;
        var sampleRate = FFTDataStorage.sampleRate;
        var points = FFTDataStorage.points;
        var bytesPerSample = FFTDataStorage.bytesPerSample;
        var samplesPerAxis = FFTDataStorage.samplesPerAxis;
        var bytesPerAxis = FFTDataStorage.bytesPerAxis;
        var totalLength = FFTDataStorage.totalLength;
        message.FFT.LOG_INDEX = logIndex;
        message.FFT.TIME = timestamp;
        message.FFT.SAMPLING_RATE = sampleRate;
        message.FFT.NUMBER_OF_SAMPLES = points;
        message.FFT.START_BYTE_OFFSET = offset;
        var axisData = {};
        csvMessage = '"TIME","AXIS_TYPE","DATA","LOG_INDEX","BYTE_OFFSET","SAMPLE_FREQ"\n';
        for (var i = 0; i < length / bytesPerSample; i++) {
          var axis = offset < bytesPerAxis ? axisType[0] : offset < bytesPerAxis * 2 ? axisType[1] : axisType[2];
          var data = bytesPerSample == 2 ? translateInt16(hexArr[index++], hexArr[index++]) : translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
          var sampleIndex = (offset % bytesPerAxis) / bytesPerSample; // by axis
          // sampleFreq = sampleIndex * sampling rate / number of samples
          var sampleFreq = sampleIndex * (sampleRate / points);

          if (typeof axisData[axis] == "undefined") {
            axisData[axis] = {};
            axisData[axis].AXIS_TYPE = axis;
            axisData[axis].START_SAMPLE_INDEX = sampleIndex;
            axisData[axis].END_SAMPLE_INDEX =
              offset % bytesPerAxis >= (initialOffset + length) % bytesPerAxis ? samplesPerAxis - 1 : ((initialOffset + length) % bytesPerAxis) / bytesPerSample - 1;
            axisData[axis].DATA = [];
          }
          axisData[axis].DATA.push(data);
          csvMessage += timestamp + "," + axis + "," + data + "," + logIndex + "," + offset + "," + Math.floor(sampleFreq * 1000) / 1000 + "\n";

          offset += bytesPerSample;
          if (offset >= totalLength) {
            index = index + (length / bytesPerSample - i - 1) * bytesPerSample;
            break;
          }
        }
        message.FFT.END_BYTE_OFFSET = offset - 1;
        message.FFT.AXIS_DATA = [];
        for (i in axisData) {
          message.FFT.AXIS_DATA.push(axisData[i]);
        }
        axisData = {};

        if (offset != bytesPerAxis * intAxisMaskEnable) {
          FFTDataStorage.lastSeq = hexArr[1];
          FFTDataStorage.lastPayload = hexArr;
        } else {
          var objData = {};
        }
      }
      // TBD
      // if (extMask & MASK_PAYLOAD_SENSOR_EXTMASK_MASSIVE_DATA_LOG) {

      // }
    }
  }

  return index;
}

function deviceParse(index) {
  var length;
  message.Device = {};
  index++;
  if (version > 0) {
    length = hexArr[index++];
  }
  mask = hexArr[index++];
  if (version > 0) length -= 1; // mask

  if (mask & MASK_DEVICE_EVENT) {
    message.Device.Events = hexArr[index++];
    if (version > 0) length -= 1;
  }
  if (mask & MASK_DEVICE_POWER_SOURCE) {
    message.Device.PowerSrc = hexArr[index++];
    if (version > 0) length -= 1;
  }
  if (mask & MASK_DEVICE_BATTERY_LEVEL) {
    message.Device.BatteryLevel = hexArr[index++];
    if (version > 0) length -= 1;
  }
  if (mask & MASK_DEVICE_BATTERY_VOLTAGE) {
    message.Device.BatteryVolt = translateInt16(hexArr[index++], hexArr[index++]);
    if (version > 0) length -= 2;
  }
  if (mask & MASK_DEVICE_TIMESTAMP) {
    message.Device.Time = translateInt32(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
    if (version > 0) length -= 4;
  }
  if (mask & MASK_DEVICE_POSITION) {
    message.Device.GNSS = {};
    var latitudeStr = "";
    var longitudeStr = "";
    if (hexArr[index] & MASK_DEVICE_POSITION_LATITUDE) {
      latitudeStr = "S";
    } else {
      latitudeStr = "N";
    }
    if (hexArr[index] & MASK_DEVICE_POSITION_LONGITUDE) {
      longitudeStr = "W";
    } else {
      longitudeStr = "E";
    }
    index++;

    message.Device.GNSS.Latitude = (translateInt24(hexArr[index++], hexArr[index++], hexArr[index++]) / 100000).toFixed(5) + " " + latitudeStr;
    message.Device.GNSS.Longitude = (translateInt24(hexArr[index++], hexArr[index++], hexArr[index++]) / 100000).toFixed(5) + " " + longitudeStr;
    if (version > 0) length -= 7;
  }

  if (version > 0) {
    if (length > 0) {
      index += length;
    }
  }

  return index;
}

function coilParse(index) {
  var length;
  var mask = hexArr[index++] & 0x07;

  if (version > 0) {
    length = hexArr[index++];
  }

  var channel = hexArr[index++];
  if (version > 0) length -= 1; // port and channel index
  var port = (channel & 0x80) >> 7;

  if (mask & MASK_PAYLOAD_COIL_MULTI_CH) {
    var infoLen = channel & 0x7f;
    var recordLen = hexArr[index++];
    var dataMask = hexArr[index++];
    var i,
      j,
      k,
      maskGroup,
      chMask,
      ch = 0;
    var isSupportStatus = (dataMask & MASK_PAYLOAD_COIL_STATUS) == MASK_PAYLOAD_COIL_STATUS;
    var isSupportData = (dataMask & MASK_PAYLOAD_COIL_VALUE) == MASK_PAYLOAD_COIL_VALUE;

    for (i = 1; i <= infoLen - 2; i++) {
      maskGroup = hexArr[index++];
      i++;
      for (j = 0; j < 7; j++) {
        if ((maskGroup & (1 << j)) == 0) {
          ch += 8;
          continue;
        }
        chMask = hexArr[index++];
        i++;
        for (k = 0; k < 8; k++) {
          if ((chMask & (1 << k)) == 0) {
            ch += 1;
            continue;
          }
          message["RtuCoil" + port + "-" + ch] = {};
          ch += 1;
        }
      }
    }
    if (version > 0) length -= infoLen;

    for (i = 0; i < ch; i++) {
      if (typeof message["RtuCoil" + port + "-" + i] != "undefined") {
        if (isSupportStatus) {
          message["RtuCoil" + port + "-" + i].Status = hexArr[index++];
          if (version > 0) length -= 1;
        }
        if (isSupportData) {
          message["RtuCoil" + port + "-" + i].Data = hexArr[index++];
          if (version > 0) length -= 1;
        }
      }
    }
  } else {
    var channelIndex = channel & 0x7f;

    message["RtuCoil" + port + "-" + channelIndex] = {};

    if (mask & MASK_PAYLOAD_COIL_STATUS) {
      message["RtuCoil" + port + "-" + channelIndex].Status = hexArr[index++];
      if (version > 0) length -= 1;
    }
    if (mask & MASK_PAYLOAD_COIL_VALUE) {
      message["RtuCoil" + port + "-" + channelIndex].Data = hexArr[index++];
      if (version > 0) length -= 1;
    }
  }

  if (version > 0) {
    if (length > 0) {
      index += length;
    }
  }

  return index;
}

function registerParse(index) {
  var length;
  var mask = hexArr[index++] & 0x07;

  if (version > 0) {
    length = hexArr[index++];
  }

  var channel = hexArr[index++];
  if (version > 0) length -= 1; // port and channel index
  var port = (channel & 0x80) >> 7;

  if (mask & MASK_PAYLOAD_REGISTER_MULTI_CH) {
    var infoLen = channel & 0x7f;
    var recordLen = hexArr[index++];
    var dataMask = hexArr[index++];
    var i,
      j,
      k,
      maskGroup,
      chMask,
      ch = 0;
    var isSupportStatus = (dataMask & MASK_PAYLOAD_REGISTER_STATUS) == MASK_PAYLOAD_REGISTER_STATUS;
    var isSupportData = (dataMask & MASK_PAYLOAD_REGISTER_VALUE) == MASK_PAYLOAD_REGISTER_VALUE;

    for (i = 1; i <= infoLen - 2; i++) {
      maskGroup = hexArr[index++];
      i++;
      for (j = 0; j < 7; j++) {
        if ((maskGroup & (1 << j)) == 0) {
          ch += 8;
          continue;
        }
        chMask = hexArr[index++];
        i++;
        for (k = 0; k < 8; k++) {
          if ((chMask & (1 << k)) == 0) {
            ch += 1;
            continue;
          }
          message["RtuRegister" + port + "-" + ch] = {};
          ch += 1;
        }
      }
    }
    if (version > 0) length -= infoLen;

    for (i = 0; i < ch; i++) {
      if (typeof message["RtuRegister" + port + "-" + i] != "undefined") {
        if (isSupportStatus) {
          message["RtuRegister" + port + "-" + i].Status = hexArr[index++];
          if (version > 0) length -= 1;
        }
        if (isSupportData) {
          message["RtuRegister" + port + "-" + i].Data = translateInt16(hexArr[index++], hexArr[index++]);
          if (version > 0) length -= 2;
        }
      }
    }
  } else {
    var channelIndex = channel & 0x7f;

    message["RtuRegister" + port + "-" + channelIndex] = {};

    if (mask & MASK_PAYLOAD_REGISTER_STATUS) {
      message["RtuRegister" + port + "-" + channelIndex].Status = hexArr[index++];
      if (version > 0) length -= 1;
    }
    if (mask & MASK_PAYLOAD_REGISTER_VALUE) {
      message["RtuRegister" + port + "-" + channelIndex].Data = translateInt16(hexArr[index++], hexArr[index++]);
      if (version > 0) length -= 2;
    }
  }

  if (version > 0) {
    if (length > 0) {
      index += length;
    }
  }

  return index;
}

function parsePayLoad(index) {
  //var bIsDataParsed = false;
  var axisMask = "";
  var mask = "";
  var extMask = ""; //extend mask
  var bIsSensorEventExist = false;

  //DI
  if ((hexArr[index] & 0xf0) === PAYLOAD_DI_DATA) {
    index = DIParse(index);

    if (index < arrLength - 1) {
      //1: ignore CRC
      parsePayLoad(index);
    }
  }

  //DO
  else if ((hexArr[index] & 0xf0) === PAYLOAD_DO_DATA) {
    index = DOParse(index);

    if (index < arrLength - 1) {
      //1: ignore CRC
      parsePayLoad(index);
    }
  }

  //AI
  else if ((hexArr[index] & 0xf0) === PAYLOAD_AI_DATA) {
    index = AIParse(index);

    if (index < arrLength - 1) {
      //1: ignore CRC
      parsePayLoad(index);
    }
  }

  //Sensor Type
  else if ((hexArr[index] & 0xf0) === PAYLOAD_SENSOR_DATA) {
    index = sensorParse(index);

    if (index < arrLength - 1) {
      //1: ignore CRC
      parsePayLoad(index);
    }
  }

  //Device Status
  else if ((hexArr[index] & 0xf0) === PAYLOAD_DEVICE_DATA) {
    index = deviceParse(index);

    if (index < arrLength - 1) {
      //1: ignore CRC
      parsePayLoad(index);
    }
  }

  //Coil Data
  else if ((hexArr[index] & 0xf0) === PAYLOAD_COIL_DATA) {
    index = coilParse(index);

    if (index < arrLength - 1) {
      //1: ignore CRC
      parsePayLoad(index);
    }
  }

  //Register Data
  else if ((hexArr[index] & 0xf0) === PAYLOAD_REGISTER_DATA) {
    index = registerParse(index);

    if (index < arrLength - 1) {
      //1: ignore CRC
      parsePayLoad(index);
    }
  }
}

function getSourceAddressLength(address) {
  var addressLength = 0;

  if (address != "" && address != null) {
    addressLength = address.length / 2;
  }

  return addressLength;
}

function checkFrameLength() {
  var addressLength = getSourceAddressLength(message.SourceAddress);

  if (message.TotalLength + addressLength + 4 != arrLength) {
    //4: Frame control + Sequence number + length + CRC
    return false;
  } else {
    return true;
  }
}

function CrcCalc(u8Arr, u16Length) {
  var u16i;
  var u8CRC = 0xff;

  for (u16i = 0; u16i < u16Length; u16i++) {
    u8CRC = au8CRC8_Pol07_Table[u8CRC ^ u8Arr[u16i]];
  }
  return u8CRC;
}

function checkPayloadLengthAndSetStorage(hexArr, sequence) {
  var sourceAddressLen = 0;
  if ((hexArr[0] & MASK_HEADER_ADDRESS_MODE) === MASK_HEADER_ADDRESS_2_OCTECT) {
    sourceAddressLen = 2;
  } else if ((hexArr[0] & MASK_HEADER_ADDRESS_MODE) === MASK_HEADER_ADDRESS_8_OCTECT) {
    sourceAddressLen = 8;
  }
  // (Octet)packet length - Frame Control - Frame Sequence Number - Total Length - Source Address - CRC !== payload length
  if (hexArr.length - 1 - 1 - 1 - sourceAddressLen - 1 !== hexArr[2]) {
    var objData = {};
    objData.sequence = sequence !== null ? sequence : hexArr[1];
    objData.time = new Date().getTime();
    objData.payload = hexArr;

    return false;
  } else {
    return true;
  }
}

const WISE2410Payloadd = payload.find(
  (x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "frm_payload" || x.variable === "data" || x.variable === "payload_hex"
);

////////////////////////////////////////////
// Main
////////////////////////////////////////////
if (WISE2410Payloadd) {
  payloadHex = WISE2410Payloadd.value;
  var message = {}; //output of this program
  var csvMessage = ""; // csv data output for MQTT publish
  var lostPacketInfo = {}; // data for packet re-transmission

  var i, arrLength;
  var hexArr = []; //translated hex arry from input string
  //var payload = {};
  var hexPayloadArr = [];
  var arrayIndex = 0; //index of current processing position in hexArr

  arrLength = payloadHex.length;

  try {
    if (arrLength < MIN_FRAME_LENGTH || arrLength % 2 !== 0) {
      msg.payload = "received frame length error";
    }

    //parse hex string to array
    arrLength = arrLength / 2;

    for (i = 0; i < arrLength; i++) {
      hexArr.push(parseInt(payloadHex.substring(i * 2, i * 2 + 2), 16)); //parse hex
    }

    // check frame structure version
    version = hexArr[0] & MASK_HEADER_FRAME_VERSION;

    //check if this is first segment
    if (!(hexArr[0] & MASK_HEADER_FIRST_SEGMENT)) {
      // packet reassemble

      if (payloadStorage.sequence === hexArr[1]) {
        msg.payload = "Sequence number repeat. Drop this packet.";
      }

      if (typeof payloadStorage.sequence == "undefined" || (("0x" + (payloadStorage.sequence + 1).toString(16)) & 0xff) !== hexArr[1]) {
        msg.payload = "Sequence number error. Packet may be lost.";
      }

      if (typeof payloadStorage.time == "undefined" || new Date().getTime() - payloadStorage.time > 60000) {
        msg.payload = "Timeout.";
      }

      var currentSeq = hexArr[1];

      hexArr = payloadStorage.payload.concat(hexArr.slice(2, hexArr.length));
    }

    arrLength = hexArr.length;
    if (bIsFemtoGateway) {
      message.mac = payload_mac;
    }
    //get sequence number
    message.SequenceNumber = hexArr[++arrayIndex];
    //get payload length
    message.TotalLength = hexArr[++arrayIndex];

    var sourceAddress = "";

    //check WHDR header: source address
    if ((hexArr[0] & MASK_HEADER_ADDRESS_MODE) === MASK_HEADER_ADDRESS_NONE) {
      arrayIndex++;
      message.SourceAddress = null;
    } else if ((hexArr[0] & MASK_HEADER_ADDRESS_MODE) === MASK_HEADER_ADDRESS_2_OCTECT) {
      console.log("2 octects source address");
      arrayIndex++;
      for (i = arrayIndex; i < arrayIndex + 2; i++) {
        sourceAddress = sourceAddress + addZero(hexArr[i].toString(16));
      }
      message.SourceAddress = sourceAddress;
      arrayIndex += 2;
    } else if ((hexArr[0] & MASK_HEADER_ADDRESS_MODE) === MASK_HEADER_ADDRESS_8_OCTECT) {
      console.log("8 octects source address");
      arrayIndex++;
      for (i = arrayIndex; i < arrayIndex + 8; i++) {
        sourceAddress = sourceAddress + addZero(hexArr[i].toString(16));
      }
      message.SourceAddress = sourceAddress;
      arrayIndex += 8;
    }

    //check CRC
    hexPayloadArr = hexArr.slice(3 + getSourceAddressLength(message.SourceAddress), hexArr.length - 1);
    var calculateCRC = CrcCalc(hexPayloadArr, hexPayloadArr.length);
    if (version > 0) {
      calculateCRC = ~calculateCRC & 0xff; // JavaScript bitwise operators are converted to signed 32-bit integers
    }

    if (calculateCRC != hexArr[hexArr.length - 1]) {
      console.log("Frame CRC check failed.");
      msg.payload = "Frame CRC check failed.";
    }

    //check if frame legnth is correct
    if (message.SourceAddress != null && !checkFrameLength()) {
      console.log("Frame length error");
      msg.payload = "Frame length error";
    }

    // Parse Payload
    parsePayLoad(arrayIndex);
  } catch (error) {
    console.log("Error: Parser failed. " + error);
    msg.payload = "Error: Parser failed. " + error;
    var output = [msg, null];
    if (typeof lostPacketInfo.LOG_INDEX != "undefined") {
      output.push({ payload: JSON.stringify(lostPacketInfo) });

      lostPacketInfo = {};
    }
  }

  ////////////////////////////////////////////
  //return data
  ////////////////////////////////////////////

  if (bIsRunNodeRed) {
    msg.payload = message;
    var output = [msg];
    if (csvMessage.length > 0) {
      output.push({ payload: csvMessage });
      if (typeof lostPacketInfo.LOG_INDEX != "undefined") {
        output.push({ payload: JSON.stringify(lostPacketInfo) });
        lostPacketInfo = {};
      }
    }
  } else {
    payload = payload.concat(transformData(message));
  }
}
