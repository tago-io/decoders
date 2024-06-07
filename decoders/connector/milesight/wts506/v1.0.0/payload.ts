interface TagoFormatResult {
  variable: string;
  value: any;
  group: string;
  metadata?: { [key: string]: any };
  location?: {
    lat: number;
    lng: number;
  };
  unit?: string;
}

function Decoder(bytes) {
  const decoded: any = {};

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.battery = { variable: "battery", value: bytes[i], unit: "%" };
      i += 1;
    }
    // TEMPERATURE
    else if (channel_id === 0x03 && channel_type === 0x67) {
      // ℃
      decoded.temperature = { variable: "temperature", value: readInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°C" };
      i += 2;
      // ℉
      // decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10 * 1.8 + 32;
      // i +=2;
    }
    // HUMIDITY
    else if (channel_id === 0x04 && channel_type === 0x68) {
      decoded.humidity = { variable: "humidity", value: bytes[i] / 2, unit: "RH" };
      i += 1;
    }
    // Wind Direction, unit degree
    else if (channel_id === 0x05 && channel_type === 0x84) {
      decoded.wind_direction = { variable: "wind_direction", value: readInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°" };
      i += 2;
    }
    // Barometric Pressure, unit hPa
    else if (channel_id === 0x06 && channel_type === 0x73) {
      decoded.pressure = { variable: "pressure", value: readUInt16LE(bytes.slice(i, i + 2)) / 10, unit: "hPa" };
      i += 2;
    }
    // Wind Speed, unit m/s
    else if (channel_id === 0x07 && channel_type === 0x92) {
      decoded.wind_speed = { variable: "wind_speed", value: readUInt16LE(bytes.slice(i, i + 2)) / 10, unit: "m/s" };
      i += 2;
    }
    // rainfall_total, unit mm, Frame counter to define whether device enters the new rainfall accumulation phase, it will plus 1 every upload, range: 0~255
    else if (channel_id === 0x08 && channel_type === 0x77) {
      decoded.rainfall_total = { variable: "rainfall_total", value: readUInt16LE(bytes.slice(i, i + 2)) / 100, unit: "mm" };
      decoded.rainfall_counter = { variable: "rainfall_counter", value: bytes[i + 2], unit: "" };
      i += 3;
    } else {
      break;
    }
  }

  return decoded;
}

/* ******************************************
 * bytes to number
 ********************************************/
function readUInt16LE(bytes: number[]) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function Wts506toTagoFormat(object_item, group, prefix = "") {
  const result: TagoFormatResult[] = [];
  for (const key in object_item) {
    if (typeof object_item[key] == "object") {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value ?? null,
        group: object_item[key].group || group,
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

/* Example values for testing
let payload = [
  {
    variable: "payload",
    value: "01756403671001",
  },
  {
    variable: "port",
    value: 1,
  },
];
 */

const Wts506payload_raw = payload.find((x) => x.variable === "payload");

if (Wts506payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(Wts506payload_raw.value, "hex");
    const group = payload[0].group || String(Date.now());
    const payload_aux = Wts506toTagoFormat(Decoder(buffer), group);
    payload = payload.concat(payload_aux.map((x) => ({ ...x })));
  } catch (e) {
    // Print the error to the Live Inspector.
    if (e instanceof Error) {
      console.error(e);
      // Return the variable parse_error for debugging.
      payload = [{ variable: "parse_error", value: e.message }];
    }
  }
}

console.log("payload", payload);
