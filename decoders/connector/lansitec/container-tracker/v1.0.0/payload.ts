// ContainerTracker
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
      return decodePositionBeacon(bytes);

    case 0x08:
      return decodeAssetBeacon(bytes);

    case 0x09:
      return decodeAlarm(bytes);

    case 0x0a:
      return decodeVibrationShockDetectionReport(bytes);

    case 0x0b:
      return decodeOfflineCachePosition(bytes);

    default:
      return null;
  }
}
// type: 0x1 Registration
function decodeRegistration(bytes: Buffer) {
  const data: any = {};
  data.type = "Registration";
  data.adr = ((bytes[0] >> 3) & 0x1) === 0 ? "OFF" : "ON";
  // mode
  data.mode = 0x00;
  // smode
  data.smode = 0x00;
  // power
  data.power = (bytes[2] >> 3) & 0x1f;
  // offlineCacheEnable
  data.offlineCacheEnable =
    ((bytes[2] >> 2) & 0x01) === 0 ? "Disable" : "Enable";
  // alarmEnable
  data.alarmEnable = ((bytes[2] >> 1) & 0x01) === 0 ? "Disable" : "Enable";
  // singleKeyEnable
  data.singleKeyEnable = (bytes[2] & 0x01) === 0 ? "Disable" : "Enable";
  // dr
  data.dr = (bytes[3] >> 4) & 0x0f;
  // gnssEnable
  data.gnssEnable = ((bytes[3] >> 3) & 0x01) === 0 ? "Disable" : "Enable";
  // positionReportMode
  const positionReportModeValue = (bytes[3] >> 1) & 0x03;
  if (positionReportModeValue === 0) {
    data.positionReportMode = "Period";
  } else if (positionReportModeValue === 1) {
    data.positionReportMode = "Autonomous";
  } else if (positionReportModeValue === 2) {
    data.positionReportMode = "On-Demand";
  }
  // switchEnable
  data.switchEnable = (bytes[3] & 0x01) === 0 ? "Disable" : "Enable";
  // heartbeatReportInterval
  data.heartbeatReportInterval =
    (((bytes[4] << 8) & 0xff00) | (bytes[5] & 0xff)) * 30;
  // blePositionReportInterval
  data.blePositionReportInterval =
    (((bytes[6] << 8) & 0xff00) | (bytes[7] & 0xff)) * 5;
  // div
  data.div = bytes[8] & 0xff;
  // bleEnable
  data.bleEnable = (bytes[9] & 0x01) === 0 ? "Disable" : "Enable";
  // positioningUUID
  let positioningUUID = "";
  for (let i = 0; i < 4; i++) {
    const byte1 = bytes[10 + 4 * i];
    const byte2 = bytes[11 + 4 * i];
    const byte3 = bytes[12 + 4 * i];
    const byte4 = bytes[13 + 4 * i];

    const part1 = ((byte1 << 8) | byte2)
      .toString(16)
      .padStart(4, "0")
      .toUpperCase();
    const part2 = ((byte3 << 8) | byte4)
      .toString(16)
      .padStart(4, "0")
      .toUpperCase();

    positioningUUID += part1 + part2;
  }
  data.positioningUUID = positioningUUID;
  // accelerometerThreshold
  data.accelerometerThreshold = (50 + bytes[26] * 5) * 0.001 + "g";
  // version
  data.version = (((bytes[27] << 8) & 0xff00) | (bytes[28] & 0xff))
    .toString(16)
    .toUpperCase();
  // cfmmsg
  data.cfmmsg = bytes[29];
  // hbCount
  data.hbCount = bytes[30];
  // assetBeaconReportPeriod
  data.assetBeaconReportPeriod = bytes[31];
  // bluetoothReceivingDuration
  data.bluetoothReceivingDuration = bytes[32];
  // extraAssetBeaconReportInterval
  data.extraAssetBeaconReportInterval = bytes[33];
  // assetBeaconUUID
  let assetBeaconUUID = "";
  for (let i = 0; i < 4; i++) {
    const byte1 = bytes[34 + 4 * i];
    const byte2 = bytes[35 + 4 * i];
    const byte3 = bytes[36 + 4 * i];
    const byte4 = bytes[37 + 4 * i];

    const part1 = ((byte1 << 8) | byte2)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const part2 = ((byte3 << 8) | byte4)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");

    assetBeaconUUID += part1 + part2;
  }
  data.assetBeaconUUID = assetBeaconUUID;
  // vibrationShockDetectionThreshold
  data.vibrationShockDetectionThreshold = (50 + bytes[50] * 5) * 0.001 + "g";
  // vibrationShockDetectionReportPeriod
  data.vibrationShockDetectionReportPeriod = bytes[51] * 30;
  // gnssPositionReportInterval
  data.gnssPositionReportInterval =
    (((bytes[52] << 8) & 0xff00) | (bytes[53] & 0xff)) * 5;

  return data;
}

// type: 0x2 Heartbeat
function decodeHeartbeat(bytes: Buffer) {
  const data: any = {};
  data.type = "Heartbeat";
  // snrEnable
  data.snrEnable =
    (bytes[0] & 0x0f) === 0 ? "No SNR field" : "SNR field Enable";
  // voltage
  data.voltage = bytes[1] / 100 + 1.5;
  // rssi
  data.rssi = bytes[2] * -1;
  // snr
  data.snr = (((bytes[3] << 8) & 0xff00) | (bytes[4] & 0xff)) / 100;

  // gnssState
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
  // moveState
  data.moveState = bytes[5] & 0x0f;
  // temperature
  data.temperature = (((bytes[6] << 8) & 0xff00) | (bytes[7] & 0xff)) + "℃";
  // movement
  data.movement = (((bytes[8] << 8) & 0xff00) | (bytes[9] & 0xff)) * 5;

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

// type: 0x07 PositionBeacon
function decodePositionBeacon(bytes: Buffer) {
  const data: any = {};
  data.type = "PositionBeacon";
  data.length = bytes[0] & 0x0f;
  for (let i = 0; i < data.length; i++) {
    const major = (
      ((bytes[6 + 5 * i] << 8) & 0xff00) |
      (bytes[7 + 5 * i] & 0xff)
    )
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const minor = (
      ((bytes[8 + 5 * i] << 8) & 0xff00) |
      (bytes[9 + 5 * i] & 0xff)
    )
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const rssi = bytes[10 + 5 * i] - 256;

    data[`beacon${i + 1}`] = major + minor;
    data[`rssi${i + 1}`] = rssi;
  }

  return data;
}

// type: 0x08 AssetBeacon
function decodeAssetBeacon(bytes: Buffer) {
  const data: any = {};
  data.type = "AssetBeacon";
  data.qty = bytes[1] & 0xff;
  for (let i = 0; i < data.qty; i++) {
    const major = (
      ((bytes[2 + 5 * i] << 8) & 0xff00) |
      (bytes[3 + 5 * i] & 0xff)
    )
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const minor = (
      ((bytes[4 + 5 * i] << 8) & 0xff00) |
      (bytes[5 + 5 * i] & 0xff)
    )
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const rssi = bytes[6 + 5 * i] - 256;

    data[`beacon${i + 1}`] = major + minor;
    data[`rssi${i + 1}`] = rssi;
  }

  return data;
}

// type: 0x09 Alarm
function decodeAlarm(bytes: Buffer) {
  const data: any = {};
  data.type = "Alarm";
  const alarmValue = bytes[1] & 0xff;
  if (alarmValue === 1) {
    data.alarm = "Alarm";
  }
  return data;
}

// type: 0x0B OfflineCachePosition
function decodeOfflineCachePosition(bytes: Buffer) {
  const data: any = {};
  // type
  data.type = "OfflineCachePosition";
  // length
  data.length = bytes[0] & 0x0f;
  // cacheDataType
  data.cacheDataType = bytes[1] & 0xff;
  let beaconIndex = 1;
  let gnssIndex = 1;
  let index = 2;
  for (let i = 0; i < data.length; i++) {
    const flag = (data.cacheDataType >> (7 - i)) & 0x01;
    if (flag === 0) {
      const major = (((bytes[index] << 8) & 0xff00) | (bytes[index + 1] & 0xff))
        .toString(16)
        .toUpperCase()
        .padStart(4, "0");
      const minor = (
        ((bytes[index + 2] << 8) & 0xff00) |
        (bytes[index + 3] & 0xff)
      )
        .toString(16)
        .toUpperCase()
        .padStart(4, "0");
      const rssi = bytes[index + 4] - 256;

      data["beacon" + beaconIndex] = major + minor;
      data["rssi" + beaconIndex] = rssi;
      beaconIndex = beaconIndex + 1;
      index = index + 5;
    } else if (flag === 1) {
      const gnss: any = {};
      // longitude
      const longitude =
        (bytes[index] << 24) |
        (bytes[index + 1] << 16) |
        (bytes[index + 2] << 8) |
        bytes[index + 3];
      gnss.longitude = hex2float(longitude);
      // latitude
      const latitude =
        (bytes[index + 4] << 24) |
        (bytes[index + 5] << 16) |
        (bytes[index + 6] << 8) |
        bytes[index + 7];
      gnss.latitude = hex2float(latitude);
      // time
      const time =
        (bytes[index + 8] << 24) |
        (bytes[index + 9] << 16) |
        (bytes[index + 10] << 8) |
        bytes[index + 11];
      gnss.time = timestampToTime((time + 8 * 60 * 60) * 1000);

      data["longitude" + gnssIndex] = gnss.longitude;
      data["latitude" + gnssIndex] = gnss.latitude;
      data["time" + gnssIndex] = gnss.time;

      gnssIndex = gnssIndex + 1;
      index = index + 12;
    }
  }

  return data;
}

// type: 0x0A VibrationShockDetectionReport
function decodeVibrationShockDetectionReport(bytes: Buffer) {
  const data: any = {};
  data.type = "VibrationShockDetectionReport";
  data.vibrationShockCount = ((bytes[1] << 8) & 0xff00) | (bytes[2] & 0xff);
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
