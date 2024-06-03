/* This is an example code for Everynet Parser.
 ** Everynet send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
 ** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
 **
 ** IMPORTANT: In most case, you will only need to edit the parsePayload function.
 **
 ** Testing:
 ** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
 ** [{ "variable": "everynet_payload", "value": "{ \"params\": { \"payload\": \"0109611395\" } }" }]
 **
 ** The ignore_vars variable in this code should be used to ignore variables
 ** from the device that you don't want.
 */
// Add ignorable variables in this array.
const ignore_vars = [
  "device_addr",
  "port",
  "duplicate",
  "network",
  "packet_hash",
  "application",
  "device",
  "packet_id",
];

/**
 * Convert an object to TagoIO object format.
 * Can be used in two ways:
 * toTagoFormat({ myvariable: myvalue , anothervariable: anothervalue... })
 * toTagoFormat({ myvariable: { value: myvalue, unit: 'C', metadata: { color: 'green' }} , anothervariable: anothervalue... })
 *
 * @param {Object} object_item Object containing key and value.
 * @param {String} serie Serie for the variables
 * @param {String} prefix Add a prefix to the variables name
 */
function toTagoFormat(object_item, serie, prefix = "") {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] === "object") {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

function Decoder16(bytes, port) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.

  var latitude =
    ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) /
    1000000; //gps latitude,units: °

  var longitude =
    ((bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7]) /
    1000000; //gps longitude,units: °

  var alarm = bytes[8] & 0x40 ? "TRUE" : "FALSE"; //Alarm status

  var batV = (((bytes[8] & 0x3f) << 8) | bytes[9]) / 1000; //Battery,units:V

  var md = "";

  //mode of motion
  var mode = bytes[10] >> 6;
  if (mode === 0x00) {
    md = "Disable";
  } else if (mode === 0x01) {
    md = "Move";
  } else if (mode === 0x02) {
    md = "Collide";
  } else if (mode === 0x03) {
    md = "Custom";
  }

  var led_updown = bytes[10] & 0x20 ? "ON" : "OFF"; //LED status for position,uplink and downlink

  var Firmware = 160 + (bytes[10] & 0x1f); // Firmware version; 5 bits

  var roll = ((bytes[11] << 8) | bytes[12]) / 100; //roll,units: °

  var pitch = ((bytes[13] << 8) | bytes[14]) / 100; //pitch,units: °

  var hdop = 0;
  if (bytes[15] > 0) {
    hdop = bytes[15] / 100; //hdop,units: °
  } else {
    hdop = bytes[15];
  }

  var altitude = ((bytes[16] << 8) | bytes[17]) / 100; //Altitude,units: °

  var decoded = {
    lat: latitude,
    lng: longitude,
    roll: roll,
    pitch: pitch,
    batv: batV,
    alarm_status: alarm,
    md: md,
    lon: led_updown,
    fw: Firmware,
    hdop: hdop,
    altitude: altitude,
  };

  if (decoded.lat && decoded.lng) {
    decoded.location = {
      value: `${decoded.lat},${decoded.lng}`,
      location: { lat: decoded.lat, lng: decoded.lng },
    };
    delete decoded.lat;
    delete decoded.lng;
  }

  return decoded;
}

function Decoder15(bytes, port) {
  const data = {
    // GPS coordinates; signed 32 bits integer, MSB; unit: Â°
    // When power is low (<2.84v), GPS wonâ€™t be able to get location
    // info and GPS feature will be disabled and the location field
    // will be filled with 0x0FFFFFFF, 0x0FFFFFFF.

    lat:
      ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) /
      1000000,

    lng:
      ((bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7]) /
      1000000,

    // Alarm status: boolean
    alarm_status: (bytes[8] & 0x40) > 0,

    // Battery; 14 bits; unit: V
    batv: (((bytes[8] & 0x3f) << 8) | bytes[9]) / 1000,

    // Motion detection mode; 2 bits
    md: {
      0: "Disable",
      1: "Move",
      2: "Collide",
      3: "Custom",
    }[bytes[10] >> 6],

    // LED status for position, uplink and downlink; 1 bit
    lon: bytes[10] & 0x20 ? "ON" : "OFF",

    // Firmware version; 5 bits
    fw: 150 + (bytes[10] & 0x1f),

    // Roll; signed 16 bits integer, MSB; unit: Â°

    // Sign-extend to 32 bits to support negative values: shift 16 bytes

    // too far to the left, followed by sign-propagating right shift

    roll: (((bytes[11] << 24) >> 16) | bytes[12]) / 100,

    // Pitch: signed 16 bits integer, MSB, unit: Â°

    pitch: (((bytes[13] << 24) >> 16) | bytes[14]) / 100,
  };

  data.location = {
    value: `${data.lat},${data.lng}`,
    location: { lng: data.lng, lat: data.lat },
  };
  delete data.lng;
  delete data.lat;

  return data;
}

function Decoder14(bytes, port) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  const alarm = !!(bytes[6] & 0x40); // Alarm status
  value = ((bytes[6] & 0x3f) << 8) | bytes[7];
  const battery = value / 1000; // Battery,units:Volts
  value = (bytes[8] << 8) | bytes[9];
  if (bytes[8] & 0x80) {
    value |= 0xffff0000;
  }
  const roll = value / 100; // roll,units: °
  value = (bytes[10] << 8) | bytes[11];
  if (bytes[10] & 0x80) {
    value |= 0xffff0000;
  }
  const pitch = value / 100; // pitch,units: °
  const json = {
    roll,
    pitch,
    battery,
    alarm,
  };
  var value = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
  if (bytes[0] & 0x80) {
    value |= 0xffffff000000;
  }
  let value2 = (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
  if (bytes[3] & 0x80) {
    value2 |= 0xffffff000000;
  }
  if (value == 0x0fffff && value2 == 0x0fffff) {
    // gps disabled (low battery)
  } else if (value === 0 && value2 === 0) {
    // gps no position yet
  } else {
    const lat = value / 10000; // gps latitude,units: °
    const lng = value2 / 10000; // gps longitude,units: °
    json.location = { value: `${lat},${lng}`, location: { lat, lng } };
  }
  return json;
}

//const device = { params: [{ key: "firmware_version", value: "1.6" }] };
// let payload = [{ variable: "payload", value: "02863D68FAC29BAF4B456004D2FB2E" }];
//   {
//     variable: 'time',
//     value: 1571874770.422976,
//     serie: 1571874770524,
//   },
//   {
//     variable: 'payload',
//     value: '0571e6f3f8bc0fe31672f934',
//     serie: 1571874770524,
//   },
//   {
//     variable: 'port',
//     value: 2,
//     serie: 1571874770524,
//   },
//   {
//     variable: 'duplicate',
//     value: false,
//     serie: 1571874770524,
//   },
//   {
//     variable: 'counter_up',
//     value: 38,
//     serie: 1571874770524,
//   },
//   {
//     variable: 'rx_time',
//     value: 1571874770.3568993,
//     serie: 1571874770524,
//   },
//   {
//     variable: 'encrypted_payload',
//     value: 'c12oeBn03DxbfqcD',
//     serie: 1571874770524,
//   },
// ];
// Check if what is being stored is the ttn_payload.
// Payload is an environment variable. Is where what is being inserted to your device comes in.

//let payload = [{ variable: "payload", value: "AyF7+ADL+28O5mQ=" }];
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(
  (x) =>
    x.variable === "payload" ||
    x.variable === "payload_raw" ||
    x.variable === "data" ||
    x.variable === "frm_payload"
);

if (payload_raw) {
  // Get a unique serie for the incoming data.
  const serie = payload_raw.serie || new Date().getTime();

  let vars_to_tago = [];

  // Parse the payload from your sensor to function parsePayload
  try {
    const firmware_version = device.params.find(
      (param) => param.key === "firmware_version"
    );

    let decoded = {};
    if (firmware_version.value === "1.4") {
      decoded = Decoder14(Buffer.from(payload_raw.value, "hex"));
    } else if (firmware_version.value === "1.5") {
      decoded = Decoder15(Buffer.from(payload_raw.value, "hex"));
    } else {
      decoded = Decoder16(Buffer.from(payload_raw.value, "hex"));
    }

    vars_to_tago = vars_to_tago.concat(toTagoFormat(decoded, serie));
  } catch (e) {
    // Catch any error in the parse code and send to parse_error variable.
    vars_to_tago = vars_to_tago.concat({
      variable: "parse_error",
      value: e.message || e,
    });
  }

  if (payload.find((x) => x.variable === "frm_payload")) {
    payload = payload.filter((x) => {
      if (
        (x.location && x.value.includes("undefined")) ||
        x.value === undefined ||
        x.value === null
      ) {
        return false;
      }
      return true;
    });
    const keys = [];
    for (const key in payload) {
      keys.push(payload[key].variable);
    }
    vars_to_tago = vars_to_tago.filter((y) => {
      if (
        keys.includes(y.variable) ||
        y.value === undefined ||
        y.value === null
      ) {
        return false;
      }
      return true;
    });
  }
  payload = payload.concat(vars_to_tago);
}
payload = payload.filter((item) => {
  if (item.variable === "lat") {
    if (item.value === 0) {
      console.error("Variable lat is ignored");
      return false;
    }
  }
  if (item.variable === "lng") {
    if (item.value === 0) {
      console.error("Variable lng is ignored");
      return false;
    }
  }
  return true;
});

payload = payload.filter((item) => {
  if (item.location) {
    if (item.location.lat === 0 && item.location.lng === 0) {
      console.error("Variable Location is ignored");
      return false;
    }
  }
  return true;
});
