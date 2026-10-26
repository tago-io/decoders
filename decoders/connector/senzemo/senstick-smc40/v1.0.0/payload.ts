// Valid frame sizes: alert (1), data (7/8), config (9).
const VALID_FRAME_SIZES = [1, 7, 8, 9];

function isValidFrameSize(length: number): boolean {
  return VALID_FRAME_SIZES.includes(length);
}

// Raw frame arrives hex-encoded in `payload`/`payload_raw`/`frm_payload`, or base64 in
// `data`/`dataFrame`, and the port under four different spellings, depending on network.
const RAW_VARIABLES = ["payload_raw", "payload", "frm_payload", "data", "dataframe"];
const BASE64_VARIABLES = ["data", "dataframe"];
const PORT_VARIABLES = ["port", "fport", "f_port"];

// Buffer.from() silently drops characters it cannot parse, so the guess is confirmed by
// re-encoding; a string valid as both hex and base64 is settled by which length is a frame size.
function decodeRawFrame(value: string, variable: string): Buffer {
  const encodings: BufferEncoding[] = BASE64_VARIABLES.includes(variable.toLowerCase())
    ? ["base64", "hex"]
    : ["hex"];

  let fallback: Buffer | undefined;
  for (const encoding of encodings) {
    const bytes = Buffer.from(value, encoding);
    const canonical = encoding === "hex" ? value.toLowerCase() : value;
    if (!bytes.length || bytes.toString(encoding) !== canonical) {
      continue;
    }
    if (isValidFrameSize(bytes.length)) {
      return bytes;
    }
    fallback = fallback ?? bytes;
  }

  if (!fallback) {
    throw new Error(`Could not decode "${variable}" as ${encodings.join(" or ")}`);
  }
  return fallback;
}

const payload_raw = payload.find(
  (x) => RAW_VARIABLES.includes(String(x.variable).toLowerCase()) && typeof x.value === "string",
);
const port_variable = payload.find((x) => PORT_VARIABLES.includes(String(x.variable).toLowerCase()));

if (payload_raw) {
  try {
    const bytes = decodeRawFrame(payload_raw.value as string, payload_raw.variable as string);
    const port = port_variable ? Number(port_variable.value) : 0;

    const parsedResults: Data[] = [];

    const sint_to_dec = (t: number): number => {
      if (t > 32767) {
        return (t - 65536) / 100.0;
      }
      return t / 100.0;
    };

    const map_range = (x: number, in_min: number, in_max: number, out_min: number, out_max: number): number => {
      const temp = ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
      return Math.round(temp);
    };

    // Alarm Packet
    if (port === 1) {
      if (bytes.length === 1) {
        const status = bytes[0];
        parsedResults.push({ variable: "status", value: status, unit: "" });
      }
    }

    // Data Packet
    if (port === 2) {
      if (bytes.length === 7) {
        const temperature_raw = (bytes[0] << 8) + bytes[1];
        const humidity_raw = (bytes[2] << 8) + bytes[3];
        const air_pressure_raw = (bytes[4] << 8) + bytes[5];
        const battery_level_raw = bytes[6];

        parsedResults.push({ variable: "status", value: 0, unit: "" });
        parsedResults.push({ variable: "temperature", value: sint_to_dec(temperature_raw), unit: "°C" });
        parsedResults.push({ variable: "humidity", value: humidity_raw / 100.0, unit: "%" });
        parsedResults.push({ variable: "air_pressure", value: air_pressure_raw / 10.0, unit: "hPa" });
        parsedResults.push({
          variable: "battery_level",
          value: map_range(battery_level_raw, 0, 255, 800, 1800),
          unit: "mV",
        });
      } else if (bytes.length === 8) {
        const status = bytes[0];
        const temperature_raw = (bytes[1] << 8) + bytes[2];
        const humidity_raw = (bytes[3] << 8) + bytes[4];
        const air_pressure_raw = (bytes[5] << 8) + bytes[6];
        const battery_level_raw = bytes[7];

        parsedResults.push({ variable: "status", value: status, unit: "" });
        parsedResults.push({ variable: "temperature", value: sint_to_dec(temperature_raw), unit: "°C" });
        parsedResults.push({ variable: "humidity", value: humidity_raw / 100.0, unit: "%" });
        parsedResults.push({ variable: "air_pressure", value: air_pressure_raw / 10.0, unit: "hPa" });
        parsedResults.push({
          variable: "battery_level",
          value: map_range(battery_level_raw, 0, 255, 800, 1800),
          unit: "mV",
        });
      }
    }

    // Config Packet
    if (port === 3) {
      if (bytes.length === 9) {
        const status = bytes[0];
        const send_period = bytes[1];
        const move_thr = bytes[2];
        const packet_confirm = bytes[3];
        const data_rate_plus_adr = bytes[4];
        const family_id = bytes[5];
        const product_id = bytes[6];
        const hw = bytes[7];
        const fw = bytes[8];

        const adr_on = Boolean(data_rate_plus_adr & (1 << 7));
        const data_rate = data_rate_plus_adr & 0x7f;

        parsedResults.push({ variable: "status", value: status, unit: "" });
        parsedResults.push({ variable: "send_period", value: send_period, unit: "" });
        parsedResults.push({ variable: "move_thr", value: move_thr, unit: "" });
        parsedResults.push({ variable: "packet_confirm", value: packet_confirm, unit: "" });
        parsedResults.push({ variable: "data_rate", value: data_rate, unit: "" });
        parsedResults.push({ variable: "adr_on", value: adr_on, unit: "" });
        parsedResults.push({ variable: "family_id", value: family_id, unit: "" });
        parsedResults.push({ variable: "product_id", value: product_id, unit: "" });
        parsedResults.push({ variable: "hw", value: hw / 10, unit: "" });
        parsedResults.push({ variable: "fw", value: fw / 10, unit: "" });
      }
    }

    payload = payload.concat(parsedResults);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(e);
    payload = [{ variable: "parse_error", value: errorMessage }];
  }
}