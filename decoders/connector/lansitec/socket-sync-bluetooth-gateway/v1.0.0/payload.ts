//  SocketSync Bluetooth Gateway
function decodeUplink(bytes: Buffer) {
  // type
  const uplinkType = (bytes[0] >> 4) & 0x0f;

  switch (uplinkType) {
    case 0x04:
      return decodeRegistration(bytes);

    case 0x02:
      return decodeHeartbeat(bytes);

    case 0x06:
      return decodeBeacon(bytes);

    case 0x0e:
      return decodeAlarmBeaconList(bytes);

    case 0x0f:
      return decodeAcknowledgment(bytes);

    default:
      return null;
  }
}

// type: 0x4 Registration
function decodeRegistration(bytes: Buffer) {
  const data: any = {};
  data.type = "Registration";
  // adr
  data.adr = ((bytes[0] >> 3) & 0x1) === 0 ? "OFF" : "ON";
  // mode
  const modeValue = bytes[0] & 0x07;
  if (modeValue === 0x01) {
    data.mode = "AU915";
  } else if (modeValue === 0x03) {
    data.mode = "CN470";
  } else if (modeValue === 0x04) {
    data.mode = "AS923";
  } else if (modeValue === 0x05) {
    data.mode = "EU433";
  } else if (modeValue === 0x06) {
    data.mode = "EU868";
  } else if (modeValue === 0x07) {
    data.mode = "US915";
  }
  // smode
  const smodeValue = bytes[1];
  if (smodeValue === 0x01) {
    data.smode = "AU915";
  } else if (smodeValue === 0x04) {
    data.smode = "CN470";
  } else if (smodeValue === 0x08) {
    data.smode = "AS923";
  } else if (smodeValue === 0x10) {
    data.smode = "EU433";
  } else if (smodeValue === 0x20) {
    data.smode = "EU868";
  } else if (smodeValue === 0x40) {
    data.smode = "US915";
  }
  // power
  data.power = (bytes[2] >> 3) & 0x1f;
  // continuousBleReceiveEnable
  data.continuousBleReceiveEnable =
    ((bytes[2] >> 1) & 0x1) === 0 ? "Disable" : "Enable";
  // powerDownFlag
  data.powerDownFlag =
    (bytes[2] & 0x1) === 0 ? "Normal status" : "Automatic shutdown status";
  // dr
  data.dr = (bytes[3] >> 4) & 0x0f;
  // deviceType
  const deviceType = (bytes[3] >> 1) & 0x02;
  if (deviceType === 0) {
    data.deviceType = "OutdoorGateway";
  } else if (deviceType === 1) {
    data.deviceType = "IndoorGateway";
  } else if (deviceType === 2) {
    data.deviceType = "PlugGateway";
  }
  // rssiSortMethod
  data.rssiSortMethod =
    (bytes[3] & 0x01) === 0 ? "SortByAverage" : "SortByTheMaximumValue";
  // positionReportInterval
  data.positionReportInterval =
    (((bytes[4] << 8) & 0xff00) | (bytes[5] & 0xff)) * 5;
  // bleReceivingDuration
  data.bleReceivingDuration = bytes[6] * 30;
  // heartbeatInterval
  data.heartbeatInterval = bytes[7] * 30;
  // beaconQTY
  data.beaconQTY = bytes[8] & 0xff;
  // crc
  data.crc = ((bytes[9] << 8) & 0xff00) | (bytes[10] & 0xff);
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
  // version
  data.version = bytes[5] & 0xff;
  // chargeState
  const chargeState = bytes[6] & 0xff;
  if (chargeState === 0x00) {
    data.chargeState = "Not charging";
  } else if (chargeState === 0x50) {
    data.chargeState = "Charging";
  } else if (chargeState === 0x60) {
    data.chargeState = "Charging completed";
  }
  // crc
  data.crc = ((bytes[7] << 8) & 0xff00) | (bytes[8] & 0xff);

  return data;
}

// type: 0x6 Beacon
function decodeBeacon(bytes: Buffer) {
  const data: any = {};
  data.type = "Beacon";
  data.length = bytes[0] & 0x0f;
  for (let i = 0; i < data.length; i++) {
    const index = 1 + 6 * i;
    const uuidTailNumber = bytes[index];
    const major = ((bytes[index + 1] << 8) | bytes[index + 2])
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const minor = ((bytes[index + 3] << 8) | bytes[index + 4])
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const rssi = bytes[index + 5] - 256;

    data["uuidTailNumber" + (i + 1)] = uuidTailNumber;
    data[`beacon${i + 1}`] = major + minor;
    data[`rssi${i + 1}`] = rssi;
  }

  return data;
}

// type: 0xe AlarmBeaconList
function decodeAlarmBeaconList(bytes: Buffer) {
  const data: any = {};
  data.type = "AlarmBeaconList";
  data.length = bytes[0] & 0x0f;
  for (let i = 0; i < data.length; i++) {
    const index = 1 + 6 * i;
    const uuidTailNumber = bytes[index];
    const major = ((bytes[index + 1] << 8) | bytes[index + 2])
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const minor = ((bytes[index + 3] << 8) | bytes[index + 4])
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const rssi = bytes[index + 5] - 256;

    data["uuidTailNumber" + (i + 1)] = uuidTailNumber;
    data[`beacon${i + 1}`] = major + minor;
    data[`rssi${i + 1}`] = rssi;
  }

  return data;
}

// type: 0xf Acknowledgment
function decodeAcknowledgment(bytes: Buffer) {
  const data: any = {};
  data.type = "Acknowledgment";
  data.result = (bytes[0] & 0x0f) === 0 ? "Success" : "Failure";
  data.msgId = (bytes[1] & 0xff).toString(16).toUpperCase();

  return data;
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
