const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));
const port_variable = payload.find((x) => x.variable === "port");

if (payload_raw) {
  try {
    const bytes = Buffer.from(payload_raw.value as string, "hex");
    const port = port_variable ? Number(port_variable.value) : 0;
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
      if (bytes.length === 4) {
        const battery_voltage = (bytes[0] << 8) + bytes[1];
        const raw_temp = (bytes[2] << 8) + bytes[3];
        const probe_temperature = (raw_temp > 0x7fff ? raw_temp - 0x10000 : raw_temp) / 100;

        parsedResults.push({ variable: "battery_voltage", value: battery_voltage, unit: "mV" });
        parsedResults.push({ variable: "probe_temperature", value: probe_temperature, unit: "°C" });
      } else if (bytes.length === 5) {
        const status = bytes[0];
        const battery_voltage = (bytes[1] << 8) + bytes[2];
        const raw_temp = (bytes[2] << 8) + bytes[3];
        const probe_temperature = (raw_temp > 0x7fff ? raw_temp - 0x10000 : raw_temp) / 100;

        parsedResults.push({ variable: "status", value: status, unit: "" });
        parsedResults.push({ variable: "battery_voltage", value: battery_voltage, unit: "mV" });
        parsedResults.push({ variable: "probe_temperature", value: probe_temperature, unit: "°C" });
      } else if (bytes.length === 12) {
        const battery_voltage = (bytes[0] << 8) + bytes[1];
        const raw_temp = (bytes[2] << 8) + bytes[3];
        const probe_temperature = (raw_temp > 0x7fff ? raw_temp - 0x10000 : raw_temp) / 100;
        const sensor_voltage = (bytes[4] << 8) + bytes[5];
        const ntc_resistance = (bytes[6] << 24) + (bytes[7] << 16) + (bytes[8] << 8) + bytes[9];
        const vdda = (bytes[10] << 8) + bytes[11];

        parsedResults.push({ variable: "battery_voltage", value: battery_voltage, unit: "mV" });
        parsedResults.push({ variable: "probe_temperature", value: probe_temperature, unit: "°C" });
        parsedResults.push({ variable: "sensor_voltage", value: sensor_voltage, unit: "mV" });
        parsedResults.push({ variable: "ntc_resistance", value: ntc_resistance, unit: "ohm" });
        parsedResults.push({ variable: "vdda", value: vdda, unit: "mV" });
      } else if (bytes.length === 13) {
        const status = bytes[0];
        const battery_voltage = (bytes[1] << 8) + bytes[2];
        const raw_temp = (bytes[2] << 8) + bytes[3];
        const probe_temperature = (raw_temp > 0x7fff ? raw_temp - 0x10000 : raw_temp) / 100;
        const sensor_voltage = (bytes[5] << 8) + bytes[6];
        const ntc_resistance = (bytes[7] << 24) + (bytes[8] << 16) + (bytes[9] << 8) + bytes[10];
        const vdda = (bytes[11] << 8) + bytes[12];

        parsedResults.push({ variable: "status", value: status, unit: "" });
        parsedResults.push({ variable: "battery_voltage", value: battery_voltage, unit: "mV" });
        parsedResults.push({ variable: "probe_temperature", value: probe_temperature, unit: "°C" });
        parsedResults.push({ variable: "sensor_voltage", value: sensor_voltage, unit: "mV" });
        parsedResults.push({ variable: "ntc_resistance", value: ntc_resistance, unit: "ohm" });
        parsedResults.push({ variable: "vdda", value: vdda, unit: "mV" });
      }
    }

    // Port 3: Config packet
    else if (port === 3) {
      if (bytes.length === 9) {
        const status = bytes[0];
        const send_period = bytes[1];
        const move_thr = bytes[2];
        const packet_confirm = bytes[3];
        const data_rate_plus_adr = bytes[4];
        const family_id = bytes[5];
        const product_id = bytes[6];
        const hw = bytes[7] / 10;
        const fw = bytes[8] / 10;

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
        parsedResults.push({ variable: "hw", value: hw, unit: "" });
        parsedResults.push({ variable: "fw", value: fw, unit: "" });
      }
    }

    // Port 4: RTT firmware warning
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