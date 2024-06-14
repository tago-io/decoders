/* eslint-disable unicorn/number-literal-case */
/* eslint-disable unicorn/numeric-separators-style */
// eslint-disable-next-line unicorn/prefer-set-has
function at101decoder(bytes) {
  const decoded: any = [];

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.push({ variable: "battery", value: readUInt8(bytes[i]), unit: "%" });
      i += 1;
    }
    // TEMPERATURE
    else if (channel_id === 0x03 && channel_type === 0x67) {
      decoded.push({ variable: "temperature", value: readInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°C" });
      i += 2;
    }
    // LOCATION
    else if ((channel_id === 0x04 || channel_id == 0x84) && channel_type === 0x88) {
      const latitude = readInt32LE(bytes.slice(i, i + 4)) / 1000000;
      const longitude = readInt32LE(bytes.slice(i + 4, i + 8)) / 1000000;
      decoded.push({ variable: "location", value: `${latitude},${longitude}`, metadata: { lat: latitude, lng: longitude } });
      const status = bytes[i + 8];
      const motionStatus = ["unknown", "start", "moving", "stop"][status & 0x0f];
      const geofenceStatus = ["inside", "outside", "unset", "unknown"][status >> 4];

      decoded.push({ variable: "motion_status", value: motionStatus });
      decoded.push({ variable: "geofence_status", value: geofenceStatus });
      i += 9;
    }
    // DEVICE POSITION
    else if (channel_id === 0x05 && channel_type === 0x00) {
      const position = bytes[i] === 0 ? "normal" : "tilt";
      decoded.push({ variable: "position", value: position });
      i += 1;
    }
    // Wi-Fi SCAN RESULT
    else if (channel_id === 0x06 && channel_type === 0xd9) {
      const group = readUInt8(bytes[i]);
      const mac = readMAC(bytes.slice(i + 1, i + 7));
      const rssi = readInt8(bytes[i + 7]);

      decoded.push({ variable: "wifi", value: mac, metadata: { rssi, group } });
      i += 9;
    }
    // TAMPER STATUS
    else if (channel_id === 0x07 && channel_type === 0x00) {
      const tamper_status = bytes[i] === 0 ? "install" : "uninstall";
      decoded.push({ variable: "tamper_status", value: tamper_status });
      i += 1;
    }
    // TEMPERATURE WITH ABNORMAL
    else if (channel_id === 0x83 && channel_type === 0x67) {
      const temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      const temperature_abnormal = bytes[i + 2] == 0 ? false : true;
      decoded.push({ variable: "temperature", value: temperature, unit: "°C" });
      decoded.push({ variable: "temperature_abnormal", value: temperature_abnormal });
      i += 3;
    }
    // HISTORICAL DATA
    else if (channel_id === 0x20 && channel_type === 0xce) {
      const timestamp = readUInt32LE(bytes.slice(i, i + 4));
      const latitude = readInt32LE(bytes.slice(i + 4, i + 8)) / 1000000;
      const longitude = readInt32LE(bytes.slice(i + 8, i + 12)) / 1000000;
      decoded.push({ variable: "historical_location", value: `${latitude},${longitude}`, metadata: { lat: latitude, lng: longitude, timestamp } });
      i += 12;
    } else {
      break;
    }
  }
  return decoded;
}

function readUInt8(bytes) {
  return bytes & 0xff;
}

function readInt8(bytes) {
  const ref = readUInt8(bytes);
  return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + Number(bytes[0]);
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
  const value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + Number(bytes[0]);
  return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
  const ref = readUInt32LE(bytes);
  return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readMAC(bytes: number[]) {
  const temp: any = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
  }
  return temp.join(":");
}

const at101PayloadData = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (at101PayloadData) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(at101PayloadData?.value, "hex");
    const time = Date.now();
    const decodedat101Payload = at101decoder(buffer);
    payload = decodedat101Payload?.map((x) => ({ ...x, time })) ?? [];
  } catch (error: any) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
