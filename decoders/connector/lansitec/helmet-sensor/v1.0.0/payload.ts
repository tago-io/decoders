// HelmetTracker
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

    case 0x05:
      return decodeUUIDReport(bytes);

    case 0x07:
      return decodeBeacon(bytes);

    case 0x08:
      return decodeAlarm(bytes);

    default:
      return null;
  }
}

// type: 0x1 Registration
function decodeRegistration(bytes: Buffer) {
  const data: any = {};
  data.type = "Registration";
  // adr
  data.adr = ((bytes[0] >> 3) & 0x1) == 0 ? "OFF" : "ON";
  // power
  data.power = (bytes[2] >> 3) & 0x1f;
  // dr
  data.dr = (bytes[3] >> 4) & 0x0f;
  // gnssEnable
  data.gnssEnable = ((bytes[3] >> 3) & 0x01) == 0 ? "Disable" : "Enable";
  // positionReportMode
  const positionReportMode = (bytes[3] >> 1) & 0x03;
  if (positionReportMode == 0) {
    data.positionReportMode = "Period";
  } else if (positionReportMode == 0) {
    data.positionReportMode = "Autonomous";
  } else if (positionReportMode == 0) {
    data.positionReportMode = "On-Demand";
  }
  // bleEnable
  data.bleEnable = (bytes[3] & 0x01) == 0 ? "Disable" : "Enable";
  // blePositionReportInterval
  data.blePositionReportInterval =
    (((bytes[4] << 8) & 0xff00) | (bytes[5] & 0xff)) * 5;
  // gnssPositionReportInterval
  data.gnssPositionReportInterval =
    (((bytes[6] << 8) & 0xff00) | (bytes[7] & 0xff)) * 5;
  // heartbeatPeriod
  data.heartbeatPeriod = (bytes[8] & 0xff) * 30;
  // version
  data.version =
    (bytes[9] & 0xff).toString(16).toUpperCase() +
    "." +
    (bytes[10] & 0xff).toString(16).toUpperCase();
  // cfmmsg
  data.cfmmsg = "1 Confirmed every " + (bytes[11] & 0xff) + " Heartbeat";
  // hbCount
  data.hbCount = "Disconnect Judgement " + (bytes[12] & 0xff);
  // fallDetectFeatureThreshold
  data.fallDetectFeatureThreshold = (bytes[13] & 0xff) * 0.5 + " meters";

  return data;
}

// type: 0x2 Heartbeat
function decodeHeartbeat(bytes: Buffer) {
  const data: any = {};
  // type
  data.type = "Heartbeat";
  // battery
  data.battery = bytes[1];
  // rssi
  data.rssi = bytes[2] * -1;
  // snr
  data.snr = (((bytes[3] << 8) & 0xff00) | (bytes[4] & 0xff)) / 100;
  // bleReceivingNumber
  data.bleReceivingNumber = bytes[5];
  // gnssSearchingNumber
  data.gnssSearchingNumber = bytes[6];
  // chargeTime
  data.chargeTime = bytes[7] * 30;
  // wearTime
  data.wearTime = bytes[8] * 30;
  // moveState
  data.moveState = (bytes[9] >> 4) & 0x0f;
  // temperature
  data.temperature = 0;

  return data;
}

// type: 0x3 GNSSPosition
function decodeGNSSPosition(bytes: Buffer) {
  const data: any = {};
  // type
  data.type = "GNSSPosition";
  // gnssState
  data.gnssState = ((bytes[0] >> 3) & 0x01) == 0 ? "Success" : "Fail";
  // wearState
  data.wearState = (bytes[0] & 0x01) == 0 ? "Do not wear" : "Wear";
  // pressure
  const pressure =
    (bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4];
  data.pressure = pressure / 10 + "pa";
  // longitude
  const longitude =
    (bytes[5] << 24) | (bytes[6] << 16) | (bytes[7] << 8) | bytes[8];
  data.longitude = hex2float(longitude);
  // latitude
  const latitude =
    (bytes[9] << 24) | (bytes[10] << 16) | (bytes[11] << 8) | bytes[12];
  data.latitude = hex2float(latitude);
  // time
  const time =
    (bytes[13] << 24) | (bytes[14] << 16) | (bytes[15] << 8) | bytes[16];
  data.time = timestampToTime((time + 8 * 60 * 60) * 1000);

  return data;
}

// type: 0x5 UUIDReport
function decodeUUIDReport(bytes: Buffer) {
  const data: any = {};
  // type
  data.type = "UUIDReport";
  // number
  data.number = Math.floor((bytes.length - 1) / 17);
  const beaconUUIDList: any = [];
  for (let i = 0; i < data.number; i++) {
    const beaconTypeIdVal = bytes[1 + 17 * i] & 0x03;
    let beaconTypeId = "";
    if (beaconTypeIdVal == 0x00) {
      beaconTypeId = "PositionBeaconUUID";
    } else if (beaconTypeIdVal == 0x01) {
      beaconTypeId = "AssetBeaconUUID";
    } else if (beaconTypeIdVal == 0x02) {
      beaconTypeId = "SpecialBeaconUUID";
    } else if (beaconTypeIdVal == 0x03) {
      beaconTypeId = "SearchBeaconUUID";
    }

    let beaconUUID = "";
    for (let j = 0; j < 16; j++) {
      beaconUUID += (bytes[2 + 17 * i + j] & 0xff)
        .toString(16)
        .toUpperCase()
        .padStart(2, "0");
    }
    beaconUUIDList.push({ beaconTypeId, beaconUUID });
  }
  data.beaconUUIDList = beaconUUIDList;

  return data;
}

// type: 0x7 Beacon
function decodeBeacon(bytes: Buffer) {
  const data: any = {};
  data.type = "Beacon";
  // wearState
  data.wearState = (bytes[0] & 0x01) == 0 ? "Not wearing" : "Wearing";
  // pressure
  const pressure =
    (bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4];
  data.pressure = pressure / 10 + "pa";
  // numner
  data.number = bytes[5] & 0x0f;
  for (let i = 0; i < data.number; i++) {
    const index = 7 + 5 * i;
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

// type: 0x8 Alarm
function decodeAlarm(bytes: Buffer) {
  const data: any = {};
  data.type = "Alarm";
  const alarmValue = bytes[1] & 0xff;
  if (alarmValue == 1) {
    data.alarm = "SOS";
  } else if (alarmValue == 2) {
    data.alarm = "Fall";
  } else if (alarmValue == 3) {
    data.alarm = "Special area";
  } else if (alarmValue == 4) {
    data.alarm = "Search";
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
