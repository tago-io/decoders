const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));
const port_variable = payload.find((x) => x.variable === "port");

function mapValue(x: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
  return Math.round(((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min);
}

if (payload_raw) {
  try {
    const bytes = Buffer.from(payload_raw.value as string, "hex");
    const port = port_variable ? Number(port_variable.value) : 0;
    const parsedResults: Data[] = [];

    // Data packet
    if (port === 2) {
      if (bytes.length === 5) {
        const temp_buf = bytes.readInt16BE(0);
        const temp_inn = bytes.readInt16BE(2);
        const bat = bytes[4];

        parsedResults.push({ variable: "status", value: 0, unit: "" });
        parsedResults.push({ variable: "temp_buf", value: temp_buf / 100, unit: "°C" });
        parsedResults.push({ variable: "temp_inn", value: temp_inn / 100, unit: "°C" });
        parsedResults.push({ variable: "bat", value: mapValue(bat, 0, 255, 800, 1800), unit: "mV" });
      } else if (bytes.length === 6) {
        const status = bytes[0];
        const temp_buf = bytes.readInt16BE(1);
        const temp_inn = bytes.readInt16BE(3);
        const bat = bytes[5];

        parsedResults.push({ variable: "status", value: status, unit: "" });
        parsedResults.push({ variable: "temp_buf", value: temp_buf / 100, unit: "°C" });
        parsedResults.push({ variable: "temp_inn", value: temp_inn / 100, unit: "°C" });
        parsedResults.push({ variable: "bat", value: mapValue(bat, 0, 255, 800, 1800), unit: "mV" });
      } else if (bytes.length === 13) {
        const status = 0;
        const temp_buf = bytes.readInt16BE(0);
        const temp_inn = bytes.readInt16BE(2);
        const bat = bytes[4];
        const fcnt_ret = (bytes[5] << 16) + (bytes[6] << 8) + bytes[7];
        const temp_buf_ret = bytes.readInt16BE(8);
        const temp_inn_ret = bytes.readInt16BE(10);
        const bat_ret = bytes[12];

        parsedResults.push({ variable: "status", value: status, unit: "" });
        parsedResults.push({ variable: "temp_buf", value: temp_buf / 100, unit: "°C" });
        parsedResults.push({ variable: "temp_inn", value: temp_inn / 100, unit: "°C" });
        parsedResults.push({ variable: "bat", value: mapValue(bat, 0, 255, 800, 1800), unit: "mV" });
        parsedResults.push({ variable: "fcnt_ret", value: fcnt_ret, unit: "" });
        parsedResults.push({ variable: "temp_buf_ret", value: temp_buf_ret / 100, unit: "°C" });
        parsedResults.push({ variable: "temp_inn_ret", value: temp_inn_ret / 100, unit: "°C" });
        parsedResults.push({ variable: "bat_ret", value: mapValue(bat_ret, 0, 255, 800, 1800), unit: "mV" });
      } else if (bytes.length === 14) {
        const status = bytes[0];
        const temp_buf = bytes.readInt16BE(1);
        const temp_inn = bytes.readInt16BE(3);
        const bat = bytes[5];
        const fcnt_ret = (bytes[6] << 16) + (bytes[7] << 8) + bytes[8];
        const temp_buf_ret = bytes.readInt16BE(9);
        const temp_inn_ret = bytes.readInt16BE(11);
        const bat_ret = bytes[13];

        parsedResults.push({ variable: "status", value: status, unit: "" });
        parsedResults.push({ variable: "temp_buf", value: temp_buf / 100, unit: "°C" });
        parsedResults.push({ variable: "temp_inn", value: temp_inn / 100, unit: "°C" });
        parsedResults.push({ variable: "bat", value: mapValue(bat, 0, 255, 800, 1800), unit: "mV" });
        parsedResults.push({ variable: "fcnt_ret", value: fcnt_ret, unit: "" });
        parsedResults.push({ variable: "temp_buf_ret", value: temp_buf_ret / 100, unit: "°C" });
        parsedResults.push({ variable: "temp_inn_ret", value: temp_inn_ret / 100, unit: "°C" });
        parsedResults.push({ variable: "bat_ret", value: mapValue(bat_ret, 0, 255, 800, 1800), unit: "mV" });
      }
    }
    // Config packet
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

        const adr_on = Boolean(data_rate_plus_adr & (1 << 4));
        const data_rate = data_rate_plus_adr & 0x0f;

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