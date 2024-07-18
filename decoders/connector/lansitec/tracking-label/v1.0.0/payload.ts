// Tracking Label
function decodeUplink(bytes: Buffer) {
  // type
  const uplinkType = (bytes[0] >> 4) & 0x0f;

  switch (uplinkType) {
    case 0x01:
      return decodeRegistration(bytes);

    case 0x02:
      return decodeHeartbeat(bytes);

    case 0x03:
      return decodeGNSSPosition(bytes);

    case 0x07:
      return decodeBeacon(bytes);

    case 0x08:
      return decodeAlarm(bytes);

    default:
      return null;
  }
}

// type: 0x01 Registration
function decodeRegistration(bytes: Buffer) {
  const data: any = {};
  data.type = "Registration";
  data.adr = ((bytes[0] >> 3) & 0x1) === 0 ? "OFF" : "ON";
  data.power = (bytes[2] >> 3) & 0x1f;
  data.dr = (bytes[3] >> 4) & 0x0f;
  data.gnssEnable = ((bytes[3] >> 3) & 0x01) === 0 ? "Disable" : "Enable";
  const positionModeValue = (bytes[3] >> 1) & 0x03;
  if (positionModeValue === 0) {
    data.positionMode = "Period";
  } else if (positionModeValue === 1) {
    data.positionMode = "Autonomous";
  } else if (positionModeValue === 2) {
    data.positionMode = "Demand";
  }
  data.bleEnable = (bytes[3] & 0x01) === 0 ? "Disable" : "Enable";
  data.blePositionReportInterval =
    (((bytes[4] << 8) & 0xff00) | (bytes[5] & 0xff)) * 5;
  data.gnssPositionReportInterval =
    (((bytes[6] << 8) & 0xff00) | (bytes[7] & 0xff)) * 5;
  data.heartbeatReportInterval = (bytes[8] & 0xff) * 30;
  data.version =
    (bytes[9] & 0xff).toString(16).toUpperCase() +
    "." +
    (bytes[10] & 0xff).toString(16).toUpperCase();
  data.cfmsg = "1 Confirmed every " + (bytes[11] & 0xff) + " Heartbeat";
  data.hbCount = "Disconnect Judgement " + (bytes[12] & 0xff);
  data.fallDetection = (bytes[13] & 0xff) * 0.5 + " meters";
  return data;
}

// type: 0x02 Heartbeat
function decodeHeartbeat(bytes: Buffer) {
  const data: any = {};
  data.type = "Heartbeat";
  data.battery = bytes[1];
  data.rssi = bytes[2] * -1;
  data.snr = (((bytes[3] << 8) & 0xff00) | (bytes[4] & 0xff)) / 100;
  const gnssStateValue = (bytes[5] >> 4) & 0x0f;
  if (gnssStateValue === 0) {
    data.gnssState = "Off";
  } else if (gnssStateValue === 1) {
    data.gnssState = "Boot GNSS";
  } else if (gnssStateValue === 2) {
    data.gnssState = "Locating";
  } else if (gnssStateValue === 3) {
    data.gnssState = "Located";
  } else if (gnssStateValue === 9) {
    data.gnssState = "No signal";
  }
  data.moveState = bytes[5] & 0x0f;
  const chargeStateValue = (bytes[6] >> 4) & 0x0f;
  if (chargeStateValue === 0) {
    data.chargeState = "Power cable disconnected";
  } else if (chargeStateValue === 5) {
    data.chargeState = "Charging";
  } else if (chargeStateValue === 6) {
    data.chargeState = "Charge complete";
  }
  return data;
}

// type: 0x03 GNSSPosition
function decodeGNSSPosition(bytes: Buffer) {
  const data: any = {};
  data.type = "GNSSPosition";
  // longitude
  const longitude =
    (bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4];
  data.longitude = hex2float(longitude);

  // latitude
  const latitude =
    (bytes[5] << 24) | (bytes[6] << 16) | (bytes[7] << 8) | bytes[8];
  data.latitude = hex2float(latitude);

  // time
  const time =
    (bytes[9] << 24) | (bytes[10] << 16) | (bytes[11] << 8) | bytes[12];
  data.time = timestampToTime((time + 8 * 60 * 60) * 1000);

  return data;
}

// type: 0x07 Beacon
function decodeBeacon(bytes: Buffer) {
  const data = {
    type: "Beacon",
    length: bytes[0] & 0x0f,
  };

  for (let i = 0; i < data.length; i++) {
    const index = 6 + 5 * i;
    const major = ((bytes[index] << 8) | bytes[index + 1])
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const minor = ((bytes[index + 2] << 8) | bytes[index + 3])
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const rssi = bytes[index + 4] - 256;

    data[`beacon${i + 1}`] = major + minor;
    data[`rssi${i + 1}`] = rssi;
  }

  return data;
}

// type: 0x08 Alarm
function decodeAlarm(bytes: Buffer) {
  const data: any = {};
  data.type = "Alarm";

  const alarmValue = bytes[1] & 0xff;
  if (alarmValue === 1) {
    data.alarm = "SOS";
  } else if (alarmValue === 2) {
    data.alarm = "Fall";
  } else {
    data.alarm = "Unknown";
  }

  return data;
}

function hex2float(num: number) {
  const sign = num & 0x80000000 ? -1 : 1;
  const exponent = ((num >> 23) & 0xff) - 127;
  const mantissa = 1 + (num & 0x7fffff) / 0x7fffff;
  return sign * mantissa * 2 ** exponent;
}

function timestampToTime(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

const ignore_vars: any = [];

function toTagoFormat(object_item: any, group: any, prefix = "") {
  const result: any = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) {
      continue;
    }

    if (typeof object_item[key] === "object") {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        group: object_item[key].group || group,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        group,
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

if (data) {
  const buffer = Buffer.from(data.value, "hex");
  const group = payload[0].group || String(new Date().getTime());
  payload = payload.concat(toTagoFormat(decodeUplink(buffer), group));
}
