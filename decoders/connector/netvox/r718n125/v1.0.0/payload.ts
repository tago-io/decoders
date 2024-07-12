function Decoder_r718n125(input: Buffer, port: number) {
  switch (port) {
    case 6: // 0x06
      return decodePort6_r718n125(input);
    case 7: // 0x07
      return decodePort7_r718n125(input);
    default:
      throw new Error("no port configured");
  }
}

function decodePort6_r718n125(bytes: Buffer) {
  const data = [] as any;
  const cmd = bytes[2];

  switch (cmd) {
    case 0x00:
      data.push({ variable: "software_version", value: bytes[3] / 10 });
      data.push({ variable: "hardware_version", value: bytes[4] / 10 });
      data.push({
        variable: "date_code",
        value:
          (Number(bytes[5]) << 24) +
          (Number(bytes[6]) << 16) +
          (Number(bytes[7]) << 8) +
          Number(bytes[8]),
      });
      return data;
    case 0x01:
      data.push({ variable: "battery", value: bytes[3] / 10, unit: "V" });
      data.push({
        variable: "current",
        value: (Number(bytes[4]) << 8) + Number(bytes[5]),
        unit: "mA",
      });
      data.push({ variable: "multiplier", value: Number(bytes[6]) });
      data.push({
        variable: "lowCurrent",
        value: (bytes[7] & 1) > 0 ? "alarm" : "noalarm",
      });
      data.push({
        variable: "highCurrent",
        value: ((bytes[7] >> 1) & 1) > 0 ? "alarm" : "noalarm",
      });
      return data;
  }
}

function decodePort7_r718n125(bytes: Buffer) {
  const data = [] as any;
  const cmd = bytes[0];

  switch (cmd) {
    case 0x01: // same
      data.push({ variable: "cmd", value: "config_report_req" });
      data.push({
        variable: "min_time",
        value: Number(bytes[2] << 8) + Number(bytes[3]),
        unit: "S",
      });
      data.push({
        variable: "max_time",
        value: Number(bytes[4] << 8) + Number(bytes[5]),
        unit: "S",
      });
      data.push({
        variable: "current_change",
        value: Number(bytes[6] << 8) + Number(bytes[7]),
        unit: "mA",
      });
      return data;
    case 0x81: // same
      data.push({ variable: "cmd", value: "config_report_rsp" });
      if (bytes[2] == 0x00) {
        data.push({ variable: "status", value: "failure" });
      } else if (bytes[2] == 0x01) {
        data.push({ variable: "status", value: "success" });
      } else {
        data.push({ variable: "status", value: Number(bytes[2]) });
      }
      return data;
    case 0x82: // same
      data.push({ variable: "cmd", value: "read_config_report_rsp" });
      data.push({ variable: "cmd", value: "read_config_report_rsp" });
      data.push({
        variable: "min_time",
        value: Number(bytes[2] << 8) + Number(bytes[3]),
        unit: "S",
      });
      data.push({
        variable: "max_time",
        value: Number(bytes[4] << 8) + Number(bytes[5]),
        unit: "S",
      });
      data.push({
        variable: "current_change",
        value: Number(bytes[6] << 8) + Number(bytes[7]),
        unit: "mA",
      });
      return data;
    default:
      data.push({ variable: "failure", value: "command_configuration" });
      return null;
  }
}

const payload_r718n125 = payload.find(
  (x) =>
    x.variable === "payload_raw" ||
    x.variable === "payload" ||
    x.variable === "data"
);
const port_r718n125 = payload.find(
  (x) =>
    x.variable === "port" || x.variable === "fPort" || x.variable === "fport"
)?.value;

if (payload_r718n125) {
  try {
    const buffer = Buffer.from(payload_r718n125.value, "hex");
    const data = Decoder_r718n125(buffer, port_r718n125);
    payload = payload.concat(
      data.map((x) => ({
        ...x,
        group: payload_r718n125.group,
        time: payload_r718n125.time,
      }))
    );
  } catch (error: any) {
    console.error(error);
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
