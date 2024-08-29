function readUInt16LE(bytes: Buffer): number {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes: Buffer): number {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes: Buffer): number {
  const value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

interface DecodedData {
  [key: string]: any;
}

function mileSightDeviceDecode(bytes: Buffer): DecodedData {
  const decoded: DecodedData = {};

  if (bytes.length < 2) {
    throw new Error("Invalid payload size");
  }

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.battery = bytes[i];
      i += 1;
    }
    // TEMPERATURE
    else if (channel_id === 0x03 && channel_type === 0x67) {
      // ℃
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // HUMIDITY
    else if (channel_id === 0x04 && channel_type === 0x68) {
      decoded.humidity = bytes[i] / 2;
      i += 1;
    }
    // OCCUPANCY
    else if (channel_id === 0x05 && channel_type === 0x00) {
      decoded.occupancy = bytes[i] === 0 ? "vacant" : "occupied";
      i += 1;
    }
    // TEMPERATURE WITH ABNORMAL
    else if (channel_id === 0x83 && channel_type === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.temperature_abnormal = bytes[i + 2] === 0 ? "normal" : "abnormal";
      i += 3;
    }
    // HISTORICAL DATA
    else if (channel_id === 0x20 && channel_type === 0xce) {
      const data: { [key: string]: number | string } = {};
      data.timestamp = readUInt32LE(bytes.slice(i, i + 4));
      const report_type = bytes[i + 4];
      data.report_type = ["temperature resume", "temperature threshold", "pir idle", "pir occupancy", "period"][report_type & 0x07];
      data.occupancy = bytes[i + 5] === 0 ? "vacant" : "occupied";
      data.temperature = readInt16LE(bytes.slice(i + 6, i + 8)) / 10;
      data.humidity = bytes[i + 8] / 2;
      i += 9;

      decoded.history = decoded.history || [];
      decoded.history.push(data);
    } else {
      break;
    }
  }

  return decoded;
}

const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));

if (payload_raw) {
  try {
    const buffer = Buffer.from(payload_raw.value as string, "hex");
    const decoded = mileSightDeviceDecode(buffer);

    const time = payload_raw.time || new Date().toISOString();
    const group = payload_raw.group || `${new Date().getTime()}-${Math.random().toString(36).substring(2, 5)}`;

    const parsedTagoObj: Pick<Data, "variable" | "value" | "time" | "unit" | "group" | "metadata">[] = [];

    if (decoded.battery !== undefined) {
      parsedTagoObj.push({ variable: "battery", value: decoded.battery, unit: "%", group, time: new Date(time) });
    }
    if (decoded.temperature !== undefined) {
      parsedTagoObj.push({ variable: "temperature", value: decoded.temperature, unit: "°C", group, time: new Date(time) });
    }
    if (decoded.humidity !== undefined) {
      parsedTagoObj.push({ variable: "humidity", value: decoded.humidity, unit: "%RH", group, time: new Date(time) });
    }
    if (decoded.occupancy !== undefined) {
      parsedTagoObj.push({ variable: "occupancy", value: decoded.occupancy, group, time: new Date(time) });
    }
    if (decoded.temperature_abnormal !== undefined) {
      parsedTagoObj.push({ variable: "temperature_abnormal", value: decoded.temperature_abnormal, group, time: new Date(time) });
    }
    if (decoded.history !== undefined) {
      decoded.history.forEach((history) => {
        const dateTime = new Date(history.timestamp * 1000);
        parsedTagoObj.push({ variable: "humidity", value: history.humidity, group, unit: "%RH", time: dateTime });
        parsedTagoObj.push({ variable: "occupancy", value: history.occupancy, group, time: dateTime });
        parsedTagoObj.push({ variable: "report_type", value: history.report_type, group, time: dateTime });
        parsedTagoObj.push({ variable: "temperature", value: history.temperature, group, unit: "°C", time: dateTime });
      });
    }

    payload = payload.concat(parsedTagoObj);
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
