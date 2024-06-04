function Decoder_r718n325(input, port) {
  switch (port) {
    case 6: // 0x06
      return decodePort6_r718n325(input);
    case 7: // 0x07
      return decodePort7_r718n325(input);
    default:
      throw new Error("no port configured");
  }
}

function decodePort6_r718n325(bytes) {
  const data = [] as any;
  const cmd = bytes[2];

  switch (cmd) {
    case 0x00:
      data.push({ variable: "software_version", value: bytes[3] / 10 });
      data.push({ variable: "hardware_version", value: bytes[4] / 10 });
      data.push({ variable: "date_code", value: (Number(bytes[5]) << 24) + (Number(bytes[6]) << 16) + (Number(bytes[7]) << 8) + Number(bytes[8]) });
      return data;
    case 0x01:
      //data.push({ variable: "multiplier1", value: parseInt(bytes[10], 16) });
      data.push({ variable: "battery", value: bytes[3] / 10, unit: "V" });
      data.push({
        variable: "current1",
        value: ((Number(bytes[4]) << 8) + Number(bytes[5])) * parseInt(bytes[10], 16),
        unit: "mA",
        metadata: { multiplier1: parseInt(bytes[10], 16) },
      });
      data.push({ variable: "current2", value: ((Number(bytes[6]) << 8) + Number(bytes[7])) * parseInt(bytes[10], 16), unit: "mA" });
      data.push({ variable: "current3", value: ((Number(bytes[8]) << 8) + Number(bytes[9])) * parseInt(bytes[10], 16), unit: "mA" });
      return data;
    case 0x02:
      data.push({ variable: "battery", value: bytes[3] / 10, unit: "V" });
      data.push({ variable: "multiplier2", value: parseInt(bytes[4], 16) });
      data.push({ variable: "multiplier3", value: parseInt(bytes[5], 16) });
      return data;
  }
}

function decodePort7_r718n325(bytes) {
  const data = [] as any;
  const cmd = bytes[0];

  switch (cmd) {
    case 0x81: // same
      data.push({ variable: "cmd", value: "config_report_rsp" });
      data.push({ variable: "status", value: bytes[2] == 0x00 ? "success" : "failure" });
      return data;
    case 0x82: // same
      data.push({ variable: "cmd", value: "read_config_report_rsp" });
      data.push({ variable: "min_time", value: Number(bytes[2] << 8) + Number(bytes[3]), unit: "S" });
      data.push({ variable: "max_time", value: Number(bytes[4] << 8) + Number(bytes[5]), unit: "S" });
      data.push({ variable: "current_change", value: Number(bytes[6] << 8) + Number(bytes[7]), unit: "mA" });
      return data;
    default:
      data.push({ variable: "failure", value: "command_configuration" });
      return null;
  }
}

const payload_r718n325 = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const port_r718n325 = payload.find((x) => x.variable === "port" || x.variable === "fPort" || x.variable === "fport")?.value;

if (payload_r718n325) {
  try {
    const buffer = Buffer.from(payload_r718n325.value, "hex");
    const data = Decoder_r718n325(buffer, port_r718n325);
    payload = payload.concat(data.map((x) => ({ ...x, serie: payload_r718n325.group, time: payload_r718n325.time })));
  } catch (error: any) {
    console.error(error);
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
