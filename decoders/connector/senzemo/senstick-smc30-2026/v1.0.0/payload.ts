// Valid frame sizes: alert (1), data (8/9), data + logging record (12/13), config (9).
const VALID_FRAME_SIZES = [1, 8, 9, 12, 13];

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

    const send_period_strings = ["OFF", "1 MIN", "2 MIN", "5 MIN", "10 MIN", "15 MIN", "30 MIN", "60 MIN"];

    const parsedResults: Data[] = [];

    // Port 1: Alarm packet
    if (port === 1) {
      if (bytes.length === 1) {
        const status = bytes[0];
        parsedResults.push({ variable: "status", value: status, unit: "" });
      }
    }

    // Port 2: Data packet
    else if (port === 2) {
      if (bytes.length === 8) {
        const temperature = ((bytes[0] << 24) >> 16) | bytes[1];
        const humidity = (bytes[2] << 8) + bytes[3];
        const air_pressure = (bytes[4] << 8) + bytes[5];
        const vbat = (bytes[6] << 8) + bytes[7];

        parsedResults.push(
          { variable: "temperature", value: temperature / 100.0, unit: "°C" },
          { variable: "humidity", value: humidity / 100.0, unit: "%" },
          { variable: "air_pressure", value: air_pressure / 10.0, unit: "hPa" },
          { variable: "vbat", value: vbat, unit: "mV" }
        );
      } else if (bytes.length === 9) {
        const status = bytes[0];
        const temperature = ((bytes[1] << 24) >> 16) | bytes[2];
        const humidity = (bytes[3] << 8) + bytes[4];
        const air_pressure = (bytes[5] << 8) + bytes[6];
        const vbat = (bytes[7] << 8) + bytes[8];

        parsedResults.push(
          { variable: "status", value: status, unit: "" },
          { variable: "temperature", value: temperature / 100.0, unit: "°C" },
          { variable: "humidity", value: humidity / 100.0, unit: "%" },
          { variable: "air_pressure", value: air_pressure / 10.0, unit: "hPa" },
          { variable: "vbat", value: vbat, unit: "mV" }
        );
      } else if (bytes.length === 12) {
        const temperature = ((bytes[0] << 24) >> 16) | bytes[1];
        const humidity = (bytes[2] << 8) + bytes[3];
        const air_pressure = (bytes[4] << 8) + bytes[5];
        const vbat = (bytes[6] << 8) + bytes[7];
        const unixtime = (bytes[8] << 24) + (bytes[9] << 16) + (bytes[10] << 8) + bytes[11];

        parsedResults.push(
          { variable: "temperature", value: temperature / 100.0, unit: "°C" },
          { variable: "humidity", value: humidity / 100.0, unit: "%" },
          { variable: "air_pressure", value: air_pressure / 10.0, unit: "hPa" },
          { variable: "vbat", value: vbat, unit: "mV" },
          { variable: "unixtime", value: unixtime, unit: "s" }
        );
      } else if (bytes.length === 13) {
        const status = bytes[0];
        const temperature = ((bytes[1] << 24) >> 16) | bytes[2];
        const humidity = (bytes[3] << 8) + bytes[4];
        const air_pressure = (bytes[5] << 8) + bytes[6];
        const vbat = (bytes[7] << 8) + bytes[8];
        const unixtime = (bytes[9] << 24) + (bytes[10] << 16) + (bytes[11] << 8) + bytes[12];

        parsedResults.push(
          { variable: "status", value: status, unit: "" },
          { variable: "temperature", value: temperature / 100.0, unit: "°C" },
          { variable: "humidity", value: humidity / 100.0, unit: "%" },
          { variable: "air_pressure", value: air_pressure / 10.0, unit: "hPa" },
          { variable: "vbat", value: vbat, unit: "mV" },
          { variable: "unixtime", value: unixtime, unit: "s" }
        );
      }
    }

    // Port 3: Config packet (source has no length check — mirrored as-is)
    else if (port === 3) {
      const status = bytes[0];
      const sp = bytes[1];
      const move_thr = bytes[2];
      const packet_confirm = bytes[3];
      const data_rate_plus_adr = bytes[4];
      const family_id = bytes[5];
      const product_id = bytes[6];
      const hw = bytes[7];
      const fw = bytes[8];

      const adr_on = Boolean(data_rate_plus_adr & (1 << 7));
      const data_rate = data_rate_plus_adr & 0x0f;

      parsedResults.push(
        { variable: "status", value: status, unit: "" },
        { variable: "send_period", value: send_period_strings[sp], unit: "" },
        { variable: "move_thr", value: move_thr, unit: "" },
        { variable: "packet_confirm", value: packet_confirm, unit: "" },
        { variable: "data_rate", value: data_rate, unit: "" },
        { variable: "adr_on", value: adr_on, unit: "" },
        { variable: "family_id", value: family_id, unit: "" },
        { variable: "product_id", value: product_id, unit: "" },
        { variable: "hw", value: hw / 10, unit: "" },
        { variable: "fw", value: fw / 10, unit: "" }
      );
    }

    // Unrecognized port/length combination: pass raw bytes through, mirroring the source's default fallback
    if (parsedResults.length === 0) {
      parsedResults.push({ variable: "bytes", value: bytes.toString("hex"), unit: "" });
    }

    payload = payload.concat(parsedResults);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(e);
    payload = [{ variable: "parse_error", value: errorMessage }];
  }
}