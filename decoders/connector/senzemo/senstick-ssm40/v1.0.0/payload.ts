function voltageToMoisture(mV: number): number {
  const v_max = 2876; // Max mV @ 100% = 2871-2882 mV
  const v_min = 44; // Min mV @ 0% = 44 mV

  let sm = Math.round(((mV - v_min) * 100) / (v_max - v_min));

  if (sm > 100) sm = 100;
  else if (sm < 0) sm = 0;

  return sm;
}

function voltageToVWC(mV: number): number {
  const voltage = mV / 1000;
  let vwc_value =
    2.8432 * voltage * voltage * voltage -
    9.1993 * voltage * voltage +
    20.2553 * voltage -
    4.1882;

  vwc_value = Math.round(vwc_value);

  if (vwc_value < 0) vwc_value = 0;

  return vwc_value;
}

// Valid frame sizes: alert (1), data (4/5), config (9).
const VALID_FRAME_SIZES = [1, 4, 5, 9];

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

    // Alarm Packet
    if (port === 1) {
      if (bytes.length === 1) {
        const status = bytes[0];
        parsedResults.push({ variable: "status", value: status, unit: "" });
      }
    }

    // Data Packet
    else if (port === 2) {
      if (bytes.length === 4) {
        const battery_voltage = (bytes[0] << 8) + bytes[1];
        const sensor_voltage = (bytes[2] << 8) + bytes[3];

        parsedResults.push({ variable: "battery_voltage", value: battery_voltage, unit: "mV" });
        parsedResults.push({ variable: "sensor_voltage", value: sensor_voltage, unit: "mV" });
        parsedResults.push({ variable: "soil_moisture", value: voltageToMoisture(sensor_voltage), unit: "%" });
        parsedResults.push({ variable: "vwc", value: voltageToVWC(sensor_voltage), unit: "%" });
      } else if (bytes.length === 5) {
        const status = bytes[0];
        const battery_voltage = (bytes[1] << 8) + bytes[2];
        const sensor_voltage = (bytes[3] << 8) + bytes[4];

        parsedResults.push({ variable: "status", value: status, unit: "" });
        parsedResults.push({ variable: "battery_voltage", value: battery_voltage, unit: "mV" });
        parsedResults.push({ variable: "sensor_voltage", value: sensor_voltage, unit: "mV" });
        parsedResults.push({ variable: "soil_moisture", value: voltageToMoisture(sensor_voltage), unit: "%" });
        parsedResults.push({ variable: "vwc", value: voltageToVWC(sensor_voltage), unit: "%" });
      }
    }

    // Config Packet
    else if (port === 3) {
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

    // RTT FW warning
    else if (port === 4) {
      parsedResults.push({ variable: "warning", value: "RTT FIRMWARE", unit: "" });
    }

    payload = payload.concat(parsedResults);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(e);
    payload = [{ variable: "parse_error", value: errorMessage }];
  }
}