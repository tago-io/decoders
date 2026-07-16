const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));
const port_variable = payload.find((x) => x.variable === "port");

if (payload_raw) {
  try {
    const bytes = Buffer.from(payload_raw.value as string, "hex");
    const port = port_variable ? Number(port_variable.value) : 0;

    const sintToDec = (value: number): number => {
      if (value > 32767) {
        return (value - 65536) / 100.0;
      }
      return value / 100.0;
    };

    const mapRange = (x: number, in_min: number, in_max: number, out_min: number, out_max: number): number => {
      const temp = ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
      return Math.round(temp);
    };

    const bitsToMsg = (bits: number): string => {
      let msg = "";
      if (bits === 0) {
        msg = "OK  ";
      }
      if ((bits & 1) === 1) {
        msg += "Movement Detected Packet, ";
      }
      if (((bits >> 1) & 1) === 1) {
        msg += "Movement Detected Confirmed, ";
      }
      if (((bits >> 2) & 1) === 1) {
        msg += "Accelerometer Failure, ";
      }
      if (((bits >> 3) & 1) === 1) {
        msg += "Temperature Sensor Failure, ";
      }
      if (((bits >> 4) & 1) === 1) {
        msg += "NFC IC Failure, ";
      }
      if (((bits >> 5) & 1) === 1) {
        msg += "EUI IC Failure, ";
      }
      if (((bits >> 6) & 1) === 1) {
        msg += "Wrong Battery, ";
      }
      return msg.slice(0, -2);
    };

    const parsed_results: Data[] = [];

    // Alarm Packet
    if (port === 1 && bytes.length === 1) {
      const status = bytes[0];
      parsed_results.push({ variable: "status", value: bitsToMsg(status), unit: "" });
    }

    // Data Packet
    else if (port === 2) {
      if (bytes.length === 3) {
        const temperature_raw = (bytes[0] << 8) + bytes[1];
        const battery_level_raw = bytes[2];

        parsed_results.push({ variable: "status", value: bitsToMsg(0), unit: "" });
        parsed_results.push({ variable: "temperature", value: sintToDec(temperature_raw), unit: "°C" });
        parsed_results.push({ variable: "battery_level", value: mapRange(battery_level_raw, 0, 255, 800, 1800), unit: "mV" });
      } else if (bytes.length === 4) {
        const status = bytes[0];
        const temperature_raw = (bytes[1] << 8) + bytes[2];
        const battery_level_raw = bytes[3];

        parsed_results.push({ variable: "status", value: bitsToMsg(status), unit: "" });
        parsed_results.push({ variable: "temperature", value: sintToDec(temperature_raw), unit: "°C" });
        parsed_results.push({ variable: "battery_level", value: mapRange(battery_level_raw, 0, 255, 800, 1800), unit: "mV" });
      }
    }

    // Config Packet
    else if (port === 3 && bytes.length === 9) {
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

      parsed_results.push({ variable: "status", value: bitsToMsg(status), unit: "" });
      parsed_results.push({ variable: "send_period", value: send_period, unit: "" });
      parsed_results.push({ variable: "move_thr", value: move_thr, unit: "" });
      parsed_results.push({ variable: "packet_confirm", value: packet_confirm, unit: "" });
      parsed_results.push({ variable: "data_rate", value: data_rate, unit: "" });
      parsed_results.push({ variable: "adr_on", value: adr_on, unit: "" });
      parsed_results.push({ variable: "family_id", value: family_id, unit: "" });
      parsed_results.push({ variable: "product_id", value: product_id, unit: "" });
      parsed_results.push({ variable: "hw", value: hw / 10, unit: "" });
      parsed_results.push({ variable: "fw", value: fw / 10, unit: "" });
    }

    // RTT Firmware Warning
    else if (port === 4) {
      parsed_results.push({ variable: "warning", value: "RTT FIRMWARE", unit: "" });
    }

    if (parsed_results.length > 0) {
      payload = payload.concat(parsed_results);
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(e);
    payload = [{ variable: "parse_error", value: errorMessage }];
  }
}