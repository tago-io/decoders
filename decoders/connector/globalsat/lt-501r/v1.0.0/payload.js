/* eslint-disable prefer-destructuring */
/* eslint-disable radix */
/* This is an generic payload parser example.
 ** The code find the payload variable and parse it if exists.
 **
 ** IMPORTANT: In most case, you will only need to edit the parsePayload function.
 **
 ** Testing:
 ** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
 ** [{ "variable": "payload", "value": "0109611395" }]
 **
 ** The ignore_vars variable in this code should be used to ignore variables
 ** from the device that you don't want.
 */
// Add ignorable variables in this array.
const ignore_vars = [];

// this is for the message type 0700
function helpReportMessage(message) {
  const beacon = message.substring(6, 46);
  const reportType = message.substring(46, 48);
  const rssi = Number(`0x${message.substring(48, 50)}`);
  const tx = Number(`0x${message.substring(50, 52)}`);
  const battery = Number(`0x${message.substring(52, 54)}`);
  return {
    beacon,
    reportType,
    rssi,
    tx,
    battery,
  };
}

// this is for the message type 0700
function decode0B00(message) {
  // const longitude = Number(`0x${message.substring(6, 14)}`);
  // const latitude = Number(`0x${message.substring(14, 22)}`);
  const rssi = Number(`0x${message.substring(48, 50)}`);
  const tx = Number(`0x${message.substring(50, 52)}`);
  const battery = Number(`0x${message.substring(52, 54)}`);
  return {
    // beacon,
    // reportType,
    rssi,
    tx,
    battery,
  };
}

// this is for the message type 0700
function decode1302(message) {
  const beacon = message.substring(6, 46);
  const reportType = message.substring(46, 48);
  const rssi = Number(`0x${message.substring(48, 50)}`);
  const tx = Number(`0x${message.substring(50, 52)}`);
  const battery = Number(`0x${message.substring(52, 54)}`);
  return {
    beacon,
    reportType,
    rssi,
    tx,
    battery,
  };
}

function reverse(str) {
  return str
    .match(/[a-fA-F0-9]{2}/g)
    .reverse()
    .join("");
}

function decode1002(message) {
  const lng = ~~parseInt(Number(`0x${reverse(message.substring(6, 14))}`).toString(2), 2) * 0.000001;
  const lat = ~~parseInt(Number(`0x${reverse(message.substring(14, 22))}`).toString(2), 2) * 0.000001;
  const gpsFixReport = Number(message.substring(22, 24)).toString(2).padStart(8, "0");
  const gpsFix = gpsFixReport.substring(6, 8);
  const reportType = parseInt(gpsFixReport.substring(0, 6), 2).toString();
  const battery = Number(`0x${message.substring(24, 26)}`);
  const date = new Date(Number(`0x${reverse(message.substring(26, 34))}`)).toLocaleString();

  return {
    gpsFix,
    location: {
      lat,
      lng,
    },
    reportType,
    battery,
    date,
  };
}

function parsePayload(payload_raw, serie) {
  const data = Buffer.from(payload_raw, "hex").toString("hex");
  const time = data.time;

  const payloadBytes = data;

  const command = payloadBytes.substring(2, 6);

  let message;

  switch (command) {
    case "0700":
      message = helpReportMessage(payloadBytes);
      break;
    case "0B00":
      message = decode0B00(payloadBytes);
      break;
    case "1302":
      message = decode1302(payloadBytes);
      break;
    case "1002":
      message = decode1002(payloadBytes);
      break;
    default:
      break;
  }

  const variables = [
    {
      variable: "decoded_payload",
      value: payload_raw,
      serie,
      time,
    },
  ];

  for (const m in message) {
    if (message[m] !== undefined) {
      if (m === "location") {
        variables.push({
          variable: m,
          location: message[m],
          serie,
          time,
        });
      } else {
        variables.push({
          variable: m,
          value: message[m],
          serie,
          time,
        });
      }
    }
  }

  return variables;
}

function Decoder(bytes) {
  const parsed_payload = {};
  // parsed_payload.byte0 = bytes[0]

  if (bytes[0] === 0x80) {
    // if(true) {
    /*
    GPS Fix Status Report Type
    Bit6~Bit7 Bit0~Bit5
    00=not fix, 01=2D, 10=3D
    */

    parsed_payload.gps_status = bytes[10] >> 5;
    parsed_payload.gps_valid = 1;
    if (parsed_payload.gps_status === 0) {
      parsed_payload.gps_valid = 0;
    }

    parsed_payload.message_type_code = bytes[10] & 0x1f;
    parsed_payload.message_type = "Unknown";

    switch (parsed_payload.message_type_code) {
      case 1:
        parsed_payload.message_type = "Ping report";
        break;
      case 2:
        parsed_payload.message_type = "Periodic mode report";
        break;
      case 4:
        parsed_payload.message_type = "Motion mode static report";
        break;
      case 5:
        parsed_payload.message_type = "Motion mode moving report";
        break;
      case 6:
        parsed_payload.message_type = "Motion mode static to moving report";
        break;
      case 7:
        parsed_payload.message_type = "Motion mode moving to static report";
        break;
      case 15:
        parsed_payload.message_type = "Low battery alarm report";
        break;
      case 17:
        parsed_payload.message_type = "Power on (temperature)";
        break;
      case 19:
        parsed_payload.message_type = "Power off (low battery)";
        break;
      case 20:
        parsed_payload.message_type = "Power off (temperature)";
        break;
      case 25:
        parsed_payload.message_type = "External GPS antenna fail report";
        break;
      case 26:
        parsed_payload.message_type = "Schedule report";
        break;
      default:
        break;
    }

    // build latitude
    let lat = (bytes[9] << 24) | (bytes[8] << 16) | (bytes[7] << 8) | bytes[6];

    // build longitude
    let lng = (bytes[5] << 24) | (bytes[4] << 16) | (bytes[3] << 8) | bytes[2];

    // shift decimal point
    lat = parseInt(lat) * 0.000001;
    lat = Number(lat.toFixed(5));

    lng = parseInt(lng) * 0.000001;
    lng = Number(lng.toFixed(5));

    if (parsed_payload.gps_valid === 1) {
      // parsed_payload.latitude = latitude;
      // parsed_payload.longitude = longitude;
      parsed_payload.location = { lat, lng };
    }
    return parsed_payload;
  }
}

function ToTagoFormat(object_item, serie, prefix = "") {
  const result = [];
  for (const key in object_item) {
    if (typeof object_item[key] === "object") {
      result.push({
        variable: (object_item[key].MessageType || `${prefix}${key}`).toLowerCase(),
        value: object_item[key].value || object_item[key].Value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        unit: object_item[key].unit,
        location: object_item.location,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`.toLowerCase(),
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

// let payload = [{ variable: "payload", value: "80834dcacffa3fc30f0244" }];

// Remove unwanted variables.
payload = payload.filter((x) => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find((x) => ["payload", "payload_raw", "data"].includes(x.variable));
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value } = payload_raw;
  const serie = new Date().getTime();
  const data = Buffer.from(value, "hex");

  if (data[0] === 0x80) {
    const payload_aux = ToTagoFormat(Decoder(data));
    payload = payload.concat(payload_aux.map((x) => ({ ...x, serie })));
  } else {
    payload = parsePayload(value).map((x) => ({ ...x, serie }));
  }
}
