// BluetoothGateway
function decodeUplink(bytes: Buffer) {
  // type
  const uplinkType = (bytes[0] >> 4) & 0x0f;

  switch (uplinkType) {
    case 0x01:
      return decodeRegistration(bytes);

    case 0x02:
      return decodeHeartbeat(bytes);

    case 0x03:
      return decodeDeviceReportRule(bytes);

    case 0x08:
      return decodeDeviceType1(bytes);

    case 0x09:
      return decodeDeviceType2(bytes);

    case 0x0a:
      return decodeDeviceType3(bytes);

    case 0x0e:
      return decodeMultiDeviceTypeMessage(bytes);

    case 0x0f:
      return decodeAcknowledgment(bytes);

    default:
      return null;
  }
}

// type: 0x1 Registration
function decodeRegistration(bytes: Buffer) {
  const data: any = {};
  data.type = "Registration";
  // adr
  data.adr = ((bytes[0] >> 3) & 0x1) === 0 ? "OFF" : "ON";
  // mode
  data.mode = bytes[0] & 0x07;
  // loRaWANBand
  const loRaWANBandValue = bytes[1];
  if (loRaWANBandValue === 0x00) {
    data.loRaWANBand = "KR920";
  } else if (loRaWANBandValue === 0x01) {
    data.loRaWANBand = "AU915";
  } else if (loRaWANBandValue === 0x04) {
    data.loRaWANBand = "CN470";
  } else if (loRaWANBandValue === 0x08) {
    data.loRaWANBand = "AS923";
  } else if (loRaWANBandValue === 0x10) {
    data.loRaWANBand = "EU433";
  } else if (loRaWANBandValue === 0x20) {
    data.loRaWANBand = "EU868";
  } else if (loRaWANBandValue === 0x40) {
    data.loRaWANBand = "US915";
  }
  // power
  data.power = (bytes[2] >> 3) & 0x1f;
  // continuousBleReceiveEnable
  data.continuousBleReceiveEnable =
    ((bytes[2] >> 1) & 0x1) === 0 ? "Disable" : "Enable";
  // dr
  data.dr = (bytes[3] >> 4) & 0x0f;
  // positionReportInterval
  data.positionReportInterval =
    (((bytes[4] << 8) & 0xff00) | (bytes[5] & 0xff)) * 5;
  // heartbeatInterval
  data.heartbeatInterval = bytes[6] * 30;
  // bleReceivingDuration
  data.bleReceivingDuration = bytes[7];
  // networkReconnectionInterval
  data.networkReconnectionInterval = bytes[8] * 5;
  return data;
}

// type: 0x2 Heartbeat
function decodeHeartbeat(bytes: Buffer) {
  const data: any = {};
  // type
  data.type = "Heartbeat";
  // battery
  const batteryValue = bytes[1];
  if (batteryValue > 100) {
    data.battery = bytes[1] / 100 + 1.5;
  } else {
    data.battery = bytes[1];
  }
  // rssi
  data.rssi = bytes[2] * -1;
  // snr
  data.snr = (((bytes[3] << 8) & 0xff00) | (bytes[4] & 0xff)) / 100;
  // version
  data.version = ((bytes[5] << 8) & 0xff00) | (bytes[6] & 0xff);
  // chargeState
  const chargeStateValue = bytes[7] & 0xff;
  if (chargeStateValue === 0x00) {
    data.chargeState = "Not charging";
  } else if (chargeStateValue === 0x50) {
    data.chargeState = "Charging";
  } else if (chargeStateValue === 0x60) {
    data.chargeState = "Charging completed";
  }
  return data;
}

// type: 0x3 DeviceReportRule
function decodeDeviceReportRule(bytes: Buffer) {
  const data: any = {};
  data.type = "DeviceReportRule";
  data.deviceTypeQuantity = bytes[1] & 0xff;
  data.deviceTypeId = (bytes[2] >> 4) & 0x0f;
  data.filterAndDataBlockQuantity = bytes[2] & 0x0f;
  const filterBlock: any = [];
  const dataBlock: any = [];
  const macBlock: any = [];
  let index = 3;
  for (let i = 0; i < data.filterAndDataBlockQuantity; i++) {
    const ruleType = bytes[index++] & 0xff;
    const startAddress = bytes[index++] & 0xff;
    const endAddress = bytes[index++] & 0xff;
    const filter: any = {};
    const payload =
      "0201061AFF4C000215F2A52D43E0AB489CB64C4A8300146720AABBCCCCB3";
    if (ruleType === 1) {
      filter.ruleType = "FilterBlock";
      filter.startAddress = byteToHex(startAddress);
      filter.endAddress = byteToHex(endAddress);
      filter.value = payload.substring(startAddress * 2, (endAddress + 1) * 2);
      index = index + (endAddress - startAddress + 1);
      filterBlock.push(filter);
    } else if (ruleType === 2) {
      filter.ruleType = "DataBlock";
      filter.startAddress = byteToHex(startAddress);
      filter.endAddress = byteToHex(endAddress);
      dataBlock.push(filter);
    } else if (ruleType === 3) {
      filter.ruleType = "MACBlock";
      filter.startAddress = byteToHex(startAddress);
      filter.endAddress = byteToHex(endAddress);
      macBlock.push(filter);
    }
  }
  data.filterBlock = filterBlock;
  data.dataBlock = dataBlock;
  data.macBlock = macBlock;
  return data;
}

// type: 0x8 DeviceType1
function decodeDeviceType1(bytes: Buffer) {
  const data = {
    type: "DeviceType1",
    number: bytes[0] & 0x0f,
  };

  for (let i = 0; i < data.number; i++) {
    const index = 1 + 5 * i;
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

// type: 0x9 DeviceType2
function decodeDeviceType2(bytes: Buffer) {
  const data = {
    type: "DeviceType2",
    number: bytes[0] & 0x0f,
  };

  for (let i = 0; i < data.number; i++) {
    const index = 1 + 5 * i;
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

// type: 0xa DeviceType3
function decodeDeviceType3(bytes: Buffer) {
  const data = {
    type: "DeviceType3",
    number: bytes[0] & 0x0f,
  };

  for (let i = 0; i < data.number; i++) {
    const index = 1 + 5 * i;
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

// type: 0xe MultiDeviceTypeMessage
function decodeMultiDeviceTypeMessage(bytes: Buffer) {
  const data = {
    type: "MultiDeviceTypeMessage",
    number: bytes[0] & 0x0f,
  };

  for (let i = 0; i < data.number; i++) {
    const index = 1 + 6 * i;
    const deviceTypeId = bytes[index];
    const major = ((bytes[index + 1] << 8) | bytes[index + 2])
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const minor = ((bytes[index + 3] << 8) | bytes[index + 4])
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const rssi = bytes[index + 5] - 256;

    data[`deviceTypeId${i + 1}`] = deviceTypeId;
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

function byteToHex(str: any) {
  return str.toString(16).toUpperCase().padStart(2, "0");
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
