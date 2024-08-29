/**
 * Payload Decoder for Milesight IoT EM400-UDL
 *
 * @param {Object} payload - The payload object containing the data to be parsed.
 * @param {string} group - The group identifier for the data.
 * @param {number} port - The port number associated with the payload.
 * @param {string} receivedTime - The time the payload was received.
 * @returns {Array} An array of data objects extracted from the payload.
 */
function decodePayload(bytes: number[]) {
  const buffer = new Buffer(bytes);

  if (bytes.length < 2) {
    throw new Error("Invalid payload size");
  }

  const payload: { [key: string]: any } = {};
  payload.startFlag = buffer.readUInt8();
  payload.id = buffer.readUInt16BE();
  payload.length = buffer.readUInt16BE();
  payload.flag = buffer.readUInt8();
  payload.frameCnt = buffer.readUInt16BE();
  payload.protocolVersion = buffer.readUInt8();
  payload.firmwareVersion = buffer.readAscii(4);
  payload.hardwareVersion = buffer.readAscii(4);
  payload.sn = buffer.readAscii(16);
  payload.imei = buffer.readAscii(15);
  payload.imsi = buffer.readAscii(15);
  payload.iccid = buffer.readAscii(20);
  payload.csq = buffer.readUInt8();
  payload.data_length = buffer.readUInt16BE();
  payload.data = decodeSensorData(buffer.slice(payload.data_length));

  return payload;
}

function decodeSensorData(bytes) {
  const history: { [key: string]: string | number | boolean }[] = [];

  let lastid = 0;
  let decoded: { [key: string]: string | number | boolean } = {};
  const buffer = new Buffer(bytes);
  while (buffer.remaining() > 0) {
    const channel_id = buffer.readUInt8();
    const channel_type = buffer.readUInt8();

    // check if the channel id is continuous
    if (lastid - (channel_id & 0x0f) >= 0) {
      history.push(decoded);
      decoded = {};
      lastid = 0;
    }
    lastid = channel_id & 0x0f;

    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.battery = buffer.readUInt8();
    }
    // TEMPERATURE
    else if (channel_id === 0x03 && channel_type === 0x67) {
      decoded.temperature = buffer.readUInt16LE() / 10;
    }
    // DISTANCE
    else if (channel_id === 0x04 && channel_type === 0x82) {
      decoded.distance = buffer.readUInt16LE();
    }
    // POSITION
    else if (channel_id === 0x05 && channel_type === 0x00) {
      decoded.position = buffer.readUInt8() === 0 ? "normal" : "tilt";
    }
    // LOCATION
    else if (channel_id === 0x06 && channel_type === 0x88) {
      decoded.latitude = buffer.readInt32LE() / 1000000;
      decoded.longitude = buffer.readInt32LE() / 1000000;

      const status = buffer.readUInt8();
      decoded.motion_status = ["unknown", "start", "moving", "stop"][status & 0x03];
      decoded.geofence_status = ["inside", "outside", "unset", "unknown"][status >> 4];
    }
    // TEMPERATURE WITH ABNORMAL
    else if (channel_id === 0x83 && channel_type === 0x67) {
      decoded.temperature = buffer.readUInt16LE() / 10;
      decoded.temperature_abnormal = buffer.readUInt8() == 0 ? false : true;
    }
    // DISTANCE WITH ALARMING
    else if (channel_id === 0x84 && channel_type === 0x82) {
      decoded.distance = buffer.readUInt16LE();
      decoded.distance_alarming = buffer.readUInt8() == 0 ? false : true;
    } else {
      break;
    }
  }

  // push the last channel
  history.push(decoded);

  return history;
}

function Buffer(bytes: number[]): void {
  this.bytes = bytes;
  this.length = bytes.length;
  this.offset = 0;
}

Buffer.prototype.readUInt8 = function (): number {
  const value = this.bytes[this.offset];
  this.offset += 1;
  return value & 0xff;
};

Buffer.prototype.readInt8 = function (): number {
  const value = this.readUInt8();
  return value > 0x7f ? value - 0x100 : value;
};

Buffer.prototype.readUInt16LE = function (): number {
  const value = (this.bytes[this.offset + 1] << 8) + this.bytes[this.offset];
  this.offset += 2;
  return value & 0xffff;
};

Buffer.prototype.readInt16LE = function (): number {
  const value = this.readUInt16LE();
  return value > 0x7fff ? value - 0x10000 : value;
};

Buffer.prototype.readUInt16BE = function (): number {
  const value = (this.bytes[this.offset] << 8) + this.bytes[this.offset + 1];
  this.offset += 2;
  return value & 0xffff;
};

Buffer.prototype.readInt16BE = function (): number {
  const value = this.readUIntBE();
  return value > 0x7fff ? value - 0x10000 : value;
};

Buffer.prototype.readUInt32LE = function (): number {
  const value = (this.bytes[this.offset + 3] << 24) + (this.bytes[this.offset + 2] << 16) + (this.bytes[this.offset + 1] << 8) + this.bytes[this.offset];
  this.offset += 4;
  return (value & 0xffffffff) >>> 0;
};

Buffer.prototype.readInt32LE = function (): number {
  const value = this.readUInt32LE();
  return value > 0x7fffffff ? value - 0x100000000 : value;
};

Buffer.prototype.readAscii = function (length: number): string {
  const str = String.fromCharCode.apply(null, this.bytes.slice(this.offset, this.offset + length));
  this.offset += length;
  return str;
};

Buffer.prototype.slice = function (length: number): number[] {
  return this.bytes.slice(this.offset, this.offset + length);
};

Buffer.prototype.remaining = function (): number {
  return this.bytes.length - this.offset;
};

function readHexString(hexString: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16));
  }
  return bytes;
}

const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));

if (payload_raw) {
  try {
    const bytes = readHexString(payload_raw.value as string);
    const { data, ...parsedPayload } = decodePayload(bytes);

    const getTime = payload_raw.time || new Date().toISOString();
    const time = new Date(getTime);
    const group = payload_raw.group || `${new Date().getTime()}-${Math.random().toString(36).substring(2, 5)}`;

    const parsedTagoObj: Pick<Data, "variable" | "value" | "time" | "unit" | "group" | "location" | "metadata">[] = [];

    parsedTagoObj.push({ variable: "additional_information", value: "additional_information", group, time, metadata: parsedPayload });

    data.forEach((sensorData) => {
      if (sensorData.battery !== undefined) {
        parsedTagoObj.push({ variable: "battery", value: sensorData.battery, unit: "%", group, time });
      }
      if (sensorData.temperature !== undefined) {
        parsedTagoObj.push({ variable: "temperature", value: sensorData.temperature, unit: "°C", group, time });
      }
      if (sensorData.distance !== undefined) {
        parsedTagoObj.push({ variable: "distance", value: sensorData.distance, unit: "mm", group, time });
      }
      if (sensorData.position !== undefined) {
        parsedTagoObj.push({ variable: "position", value: sensorData.position, group, time });
      }
      if (sensorData.latitude !== undefined && sensorData.longitude !== undefined) {
        parsedTagoObj.push({
          variable: "location",
          value: `${sensorData.latitude},${sensorData.longitude}`,
          location: { type: "Point", coordinates: [sensorData.latitude, sensorData.longitude] },
          group,
          time,
        });
      }
      if (sensorData.motion_status !== undefined) {
        parsedTagoObj.push({ variable: "motion_status", value: sensorData.motion_status, group, time });
      }
      if (sensorData.geofence_status !== undefined) {
        parsedTagoObj.push({ variable: "geofence_status", value: sensorData.geofence_status, group, time });
      }
      if (sensorData.temperature_abnormal !== undefined) {
        parsedTagoObj.push({ variable: "temperature_abnormal", value: sensorData.temperature_abnormal, group, time });
      }
      if (sensorData.distance_alarming !== undefined) {
        parsedTagoObj.push({ variable: "distance_alarming", value: sensorData.distance_alarming, group, time });
      }
    });
    payload = payload.concat(parsedTagoObj);
  } catch (e) {
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
