const bcd2number_r718ka = function (bcd) {
  let n = 0;
  let m = 1;
  for (let i = 0; i < bcd.length; i += 1) {
    n += (bcd[bcd.length - 1 - i] & 0x0f) * m;
    n += ((bcd[bcd.length - 1 - i] >> 4) & 0x0f) * m * 10;
    m *= 100;
  }
  return n;
};

function Decoder_r718ka(input, port) {
  switch (port) {
    case 6:
      return decodePort6_r718ka(input);
    case 7:
      return decodePort7_r718ka(input);
    default:
      throw new Error("no port configured");
  }
}

function decodePort6_r718ka(bytes) {
  const data = [] as any;
  const cmd = bytes[2];

  switch (cmd) {
    case 0x00:
      data.push({ variable: "software_version", value: bytes[3] / 10 });
      data.push({ variable: "hardware_version", value: bytes[4] });
      data.push({ variable: "datacode", value: bcd2number_r718ka(bytes.slice(5, 9)) });
      return data;
    case 0x01:
      data.push({ variable: "battery", value: bytes[3] / 10, unit: "v" });
      data.push({ variable: "current", value: bytes[4], unit: "mA" });
      data.push({ variable: "fine_current", value: bytes[5] / 10, unit: "mA" });
      return data;
  }
}

function decodePort7_r718ka(bytes) {
  const data = [] as any;
  const cmd = bytes[0];

  switch (cmd) {
    case 0x81:
      data.push({ variable: "cmd", value: "config_report_rsp" });
      data.push({ variable: "status", value: bytes[2] == 0x00 ? "success" : "failure" });
      return data;
    case 0x82:
      data.push({ variable: "cmd", value: "read_config_report_rsp" });
      data.push({ variable: "min_time", value: Number(bytes[2] << 8) + Number(bytes[3]), unit: "s" });
      data.push({ variable: "max_time", value: Number(bytes[4] << 8) + Number(bytes[5]), unit: "s" });
      data.push({ variable: "battery_change", value: bytes[6] / 10, unit: "v" });
      data.push({ variable: "current_change", value: bytes[7], unit: "mA" });
      return data;
    default:
      data.push({ variable: "failure", value: "command_configuration" });
      return null;
  }
}

const payload_r718ka = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const port_r718ka = payload.find((x) => x.variable === "port" || x.variable === "fPort")?.value;

if (payload_r718ka) {
  try {
    const buffer = Buffer.from(payload_r718ka.value, "hex");
    const data = Decoder_r718ka(buffer, port_r718ka);
    payload = payload.concat(data.map((x) => ({ ...x, serie: payload_r718ka.group, time: payload_r718ka.time })));
  } catch (error: any) {
    console.error(error);
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
