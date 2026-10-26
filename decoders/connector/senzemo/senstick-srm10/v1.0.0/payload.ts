// Valid frame sizes: alert (1), data (8/9), config (9).
const VALID_FRAME_SIZES = [1, 8, 9];

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

function mapBatteryLevel(x: number): number {
  const temp = ((x - 0) * (1800 - 800)) / (255 - 0) + 800;
  return Math.round(temp);
}

if (payload_raw) {
  try {
    const bytes = decodeRawFrame(payload_raw.value as string, payload_raw.variable as string);
    const port = port_variable ? Number(port_variable.value) : 0;

    const parsedResults: Data[] = [];

    // Alarm Packet
    if (port === 1) {
      if (bytes.length === 1) {
        const status = bytes[0];
        parsedResults.push({ variable: "status", value: status, unit: "" });
      }
    }

    // Data Packet
    else if (port === 2) {
      if (bytes.length === 8) {
        const cur_rain_int_cnt = bytes[0];
        const cur_rain_cnt = (bytes[1] << 8) + bytes[2];
        const tot_rain_cnt = bytes[3] * 0x1000000 + (bytes[4] << 16) + (bytes[5] << 8) + bytes[6];
        const battery_level = bytes[7];

        parsedResults.push({ variable: "current_rain", value: Number((cur_rain_int_cnt * 0.2).toFixed(1)), unit: "mm" });
        parsedResults.push({ variable: "current_rain_total", value: Number((cur_rain_cnt * 0.2).toFixed(1)), unit: "mm" });
        parsedResults.push({ variable: "total_rain", value: Number((tot_rain_cnt * 0.2).toFixed(1)), unit: "mm" });
        parsedResults.push({ variable: "battery_level", value: mapBatteryLevel(battery_level), unit: "mV" });
      } else if (bytes.length === 9) {
        const status = bytes[0];
        const cur_rain_int_cnt = bytes[1];
        const cur_rain_cnt = (bytes[2] << 8) + bytes[3];
        const tot_rain_cnt = bytes[4] * 0x1000000 + (bytes[5] << 16) + (bytes[6] << 8) + bytes[7];
        const battery_level = bytes[8];

        parsedResults.push({ variable: "status", value: status, unit: "" });
        parsedResults.push({ variable: "current_rain", value: Number((cur_rain_int_cnt * 0.2).toFixed(1)), unit: "mm" });
        parsedResults.push({ variable: "current_rain_total", value: Number((cur_rain_cnt * 0.2).toFixed(1)), unit: "mm" });
        parsedResults.push({ variable: "total_rain", value: Number((tot_rain_cnt * 0.2).toFixed(1)), unit: "mm" });
        parsedResults.push({ variable: "battery_level", value: mapBatteryLevel(battery_level), unit: "mV" });
      }
    }

    // Config Packet
    else if (port === 3) {
      const status = bytes[0];
      const send_period = bytes[1];
      const movement_threshold = bytes[2];
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
      parsedResults.push({ variable: "movement_threshold", value: movement_threshold, unit: "" });
      parsedResults.push({ variable: "packet_confirm", value: packet_confirm, unit: "" });
      parsedResults.push({ variable: "data_rate", value: data_rate, unit: "" });
      parsedResults.push({ variable: "adr_on", value: adr_on, unit: "" });
      parsedResults.push({ variable: "family_id", value: family_id, unit: "" });
      parsedResults.push({ variable: "product_id", value: product_id, unit: "" });
      parsedResults.push({ variable: "hw_version", value: hw / 10, unit: "" });
      parsedResults.push({ variable: "fw_version", value: fw / 10, unit: "" });
    }

    payload = payload.concat(parsedResults);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(e);
    payload = [{ variable: "parse_error", value: errorMessage }];
  }
}