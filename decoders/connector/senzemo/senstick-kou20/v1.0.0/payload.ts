const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));
const port_variable = payload.find((x) => x.variable === "port");

if (payload_raw) {
  try {
    const bytes = Buffer.from(payload_raw.value as string, "hex");
    const port = port_variable ? Number(port_variable.value) : 0;
    const parsedResults: { variable: string; value: string | number | boolean; unit: string }[] = [];

    // Port 1: Alarm packet
    if (port === 1) {
      if (bytes.length === 1) {
        const status = bytes[0];
        parsedResults.push({ variable: "status", value: status, unit: "" });
      }
    }

    // Port 2: Data packet
    else if (port === 2) {
      if (bytes.length === 4) {
        const temperature = bytes.readInt16BE(0) / 100;
        const battery = (bytes[2] << 8) + bytes[3];

        parsedResults.push({ variable: "temperature", value: temperature, unit: "°C" });
        parsedResults.push({ variable: "battery", value: battery, unit: "mV" });
      } else if (bytes.length === 5) {
        const status = bytes[0];
        const temperature = bytes.readInt16BE(1) / 100;
        const battery = (bytes[3] << 8) + bytes[4];

        parsedResults.push({ variable: "status", value: status, unit: "" });
        parsedResults.push({ variable: "temperature", value: temperature, unit: "°C" });
        parsedResults.push({ variable: "battery", value: battery, unit: "mV" });
      }
    }

    // Port 3: Config packet
    else if (port === 3) {
      if (bytes.length === 10) {
        const status = bytes[0];
        const send_period = bytes[1];
        const move_thr = bytes[2];
        const packet_confirm = bytes[3];
        const data_rate_plus_adr = bytes[4];
        const family_id = bytes[5];
        const product_id = bytes[6];
        const hw_version = bytes[7] / 10;
        const fw_version = bytes[8] / 10;

        const adr_on = Boolean(data_rate_plus_adr & (1 << 7));
        const data_rate = data_rate_plus_adr & 0x7f;

        parsedResults.push({ variable: "status", value: status, unit: "" });
        parsedResults.push({ variable: "send_period", value: send_period, unit: "min" });
        parsedResults.push({ variable: "move_thr", value: move_thr, unit: "" });
        parsedResults.push({ variable: "packet_confirm", value: packet_confirm, unit: "" });
        parsedResults.push({ variable: "data_rate", value: data_rate, unit: "" });
        parsedResults.push({ variable: "adr_on", value: adr_on, unit: "" });
        parsedResults.push({ variable: "family_id", value: family_id, unit: "" });
        parsedResults.push({ variable: "product_id", value: product_id, unit: "" });
        parsedResults.push({ variable: "hw_version", value: hw_version, unit: "" });
        parsedResults.push({ variable: "fw_version", value: fw_version, unit: "" });
      }
    }

    payload = payload.concat(parsedResults);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(e);
    payload = [{ variable: "parse_error", value: errorMessage }];
  }
}