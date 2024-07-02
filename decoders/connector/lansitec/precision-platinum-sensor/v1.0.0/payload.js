// PT100
function decodeUplink(bytes) {
  // type
  var uplinkType = (bytes[0] >> 4) & 0x0f;

  switch (uplinkType) {
    case 0x01:
      return decodeRegistration(bytes);

    case 0x03:
      return decodeTemperature(bytes);

    case 0x0f:
      return decodeAcknowledgment(bytes);

    default:
      return null;
  }
}

// type: 0x1 Registration
function decodeRegistration(bytes) {
  var data = {};
  data.type = "Registration";
  // adr
  data.adr = ((bytes[0] >> 3) & 0x1) == 0 ? "OFF" : "ON";
  // mode
  var modeValue = bytes[0] & 0x07;
  if (modeValue == 0x01) {
    data.mode = "AU920";
  } else if (modeValue == 0x02) {
    data.mode = "CLAA";
  } else if (modeValue == 0x03) {
    data.mode = "CN470";
  } else if (modeValue == 0x04) {
    data.mode = "AS923";
  } else if (modeValue == 0x05) {
    data.mode = "EU433";
  } else if (modeValue == 0x06) {
    data.mode = "EU868";
  } else if (modeValue == 0x07) {
    data.mode = "US915";
  }
  // smode
  var smodeValue = bytes[1];
  if (smodeValue == 0x01) {
    data.smode = "AU920";
  } else if (smodeValue == 0x02) {
    data.smode = "CLAA";
  } else if (smodeValue == 0x04) {
    data.smode = "CN470";
  } else if (smodeValue == 0x08) {
    data.smode = "AS923";
  } else if (smodeValue == 0x10) {
    data.smode = "EU433";
  } else if (smodeValue == 0x20) {
    data.smode = "EU868";
  } else if (smodeValue == 0x40) {
    data.smode = "US915";
  }
  // power
  data.power = ((bytes[2] >> 3) & 0x1f) + "dBm";
  // reserved
  var reservedValue = bytes[2] & 0x07;
  if (reservedValue == 1) {
    data.frequencySweepMode = "A mode";
  } else if (reservedValue == 2) {
    data.frequencySweepMode = "B mode";
  } else if (reservedValue == 3) {
    data.frequencySweepMode = "C mode";
  } else if (reservedValue == 4) {
    data.frequencySweepMode = "D mode";
  } else if (reservedValue == 5) {
    data.frequencySweepMode = "E mode";
  } else if (reservedValue == 6) {
    data.frequencySweepMode = "All frequency sweep";
  }
  // dr
  data.dr = (bytes[3] >> 4) & 0x0f;
  // repting
  data.repting = ((bytes[3] >> 3) & 0x01) == 0 ? "false" : "true";
  // temperatureReportPeriod
  data.temperatureReportPeriod =
    (((bytes[4] << 8) & 0xff00) | (bytes[5] & 0xff)) * 10 + "s";
  // crc
  data.crc = ((bytes[6] << 8) & 0xff00) | (bytes[7] & 0xff);
  return data;
}

// type: 0x3 Temperature
function decodeTemperature(bytes) {
  var data = {};
  // type
  data.type = "Temperature";
  // number
  data.number = bytes[0] & 0x0f;
  // battery
  data.battery = bytes[1] + "%";
  // rssi
  data.rssi = bytes[2] * -1 + "dBm";
  // temp
  for (let i = 0; i < data.number; i++) {
    var tempIndex = i + 1;
    data["temp" + tempIndex] =
      (((bytes[3 + 2 * i] << 8) & 0xff00) | (bytes[4 + 2 * i] & 0xff)) / 100 +
      "℃";
  }
  // crc
  data.crc =
    ((bytes[3 + 2 * data.number] << 8) & 0xff00) |
    (bytes[4 + 2 * data.number] & 0xff);

  return data;
}

// type: 0xf Acknowledgment
function decodeAcknowledgment(bytes) {
  var data = {};
  data.type = "Acknowledgment";
  data.result = (bytes[0] & 0x0f) == 0 ? "Success" : "Failure";
  data.msgId = (bytes[1] & 0xff).toString(16).toUpperCase();

  return data;
}

// payload
var ignore_vars = [];

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

const data = payload.find(
  (x) =>
    x.variable === "payload_raw" ||
    x.variable === "payload" ||
    x.variable === "data"
);
const port = payload.find(
  (x) => x.variable === "fport" || x.variable === "port"
);
if (data) {
  const buffer = Buffer.from(data.value, "hex");
  const serie = new Date().getTime();
  payload = payload.concat(toTagoFormat(decodeUplink(buffer), serie));
}
