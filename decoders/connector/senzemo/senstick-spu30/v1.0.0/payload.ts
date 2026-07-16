const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));
const port_variable = payload.find((x) => x.variable === "port");

if (payload_raw) {
  try {
    const bytes = Buffer.from(payload_raw.value as string, "hex");
    const port = port_variable ? Number(port_variable.value) : 0;

    const parsedResults: Data[] = [];

    if (port === 2) {
      // Data packet. Length determines whether a leading status byte
      // and a VOC index field are present:
      //   10 bytes -> no status, no VOC
      //   11 bytes -> status,    no VOC
      //   12 bytes -> no status, VOC
      //   13 bytes -> status,    VOC
      let has_status: boolean;
      let has_voc: boolean;

      if (bytes.length === 10) {
        has_status = false;
        has_voc = false;
      } else if (bytes.length === 11) {
        has_status = true;
        has_voc = false;
      } else if (bytes.length === 12) {
        has_status = false;
        has_voc = true;
      } else if (bytes.length === 13) {
        has_status = true;
        has_voc = true;
      } else {
        throw new Error(`Unexpected data packet length: ${bytes.length}`);
      }

      let idx = 0;
      let status = 0;
      if (has_status) {
        status = bytes.readUInt8(idx);
        idx += 1;
      }

      const temperature = bytes.readInt16BE(idx);
      idx += 2;
      const humidity = bytes.readUInt16BE(idx);
      idx += 2;
      const air_pressure = bytes.readUInt16BE(idx);
      idx += 2;
      const co2 = bytes.readUInt16BE(idx);
      idx += 2;

      let voc_index: number | undefined;
      if (has_voc) {
        voc_index = bytes.readUInt16BE(idx);
        idx += 2;
      }

      const battery_level = bytes.readUInt16BE(idx);
      idx += 2;

      parsedResults.push({ variable: "status", value: status, unit: "" });
      parsedResults.push({ variable: "temperature", value: temperature / 100, unit: "C" });
      parsedResults.push({ variable: "humidity", value: humidity / 100, unit: "%" });
      parsedResults.push({ variable: "air_pressure", value: air_pressure / 10, unit: "hPa" });
      parsedResults.push({ variable: "co2", value: co2, unit: "ppm" });
      if (has_voc && voc_index !== undefined) {
        parsedResults.push({ variable: "voc_index", value: voc_index, unit: "" });
      }
      parsedResults.push({ variable: "battery_level", value: battery_level, unit: "mV" });
    } else if (port === 3) {
      // Config packet, fixed 11 bytes.
      if (bytes.length !== 11) {
        throw new Error(`Unexpected config packet length: ${bytes.length}`);
      }

      const status = bytes.readUInt8(0);
      const send_period = bytes.readUInt8(1);
      const packet_confirm = bytes.readUInt8(2);
      const data_rate_plus_adr = bytes.readUInt8(3);
      const co2_mid_threshold = bytes.readUInt8(4);
      const co2_high_threshold = bytes.readUInt8(5);
      const led_intensity = bytes.readUInt8(6);
      const family_id = bytes.readUInt8(7);
      const product_id = bytes.readUInt8(8);
      const hw = bytes.readUInt8(9);
      const fw = bytes.readUInt8(10);

      const adr_on = Boolean(data_rate_plus_adr & (1 << 7));
      const data_rate = data_rate_plus_adr & 0x7f;

      parsedResults.push({ variable: "status", value: status, unit: "" });
      parsedResults.push({ variable: "send_period", value: send_period, unit: "" });
      parsedResults.push({ variable: "packet_confirm", value: packet_confirm, unit: "" });
      parsedResults.push({ variable: "data_rate", value: data_rate, unit: "" });
      parsedResults.push({ variable: "adr_on", value: adr_on, unit: "" });
      parsedResults.push({ variable: "co2_mid_threshold", value: co2_mid_threshold * 10, unit: "ppm" });
      parsedResults.push({ variable: "co2_high_threshold", value: co2_high_threshold * 10, unit: "ppm" });
      parsedResults.push({ variable: "led_intensity", value: led_intensity, unit: "" });
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