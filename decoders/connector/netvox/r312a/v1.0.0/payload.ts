const bcd2number = function (bcd) {
  let n = 0;
  let m = 1;
  for (let i = 0; i < bcd.length; i += 1) {
    n += (bcd[bcd.length - 1 - i] & 0x0f) * m;
    n += ((bcd[bcd.length - 1 - i] >> 4) & 0x0f) * m * 10;
    m *= 100;
  }
  return n;
};

function Decoder_r312a(input, port) {
  switch (port) {
    case 6:
      return decodePort6(input);
    case 7:
      return decodePort7(input);
    case 13:
      return decodePort13(input);
    default:
      return null;
  }
}

function decodePort6(bytes) {
  const data = [] as any;
  const cmd = bytes[2];

  switch (cmd) {
    case 0x00:
      data.push({ variable: "software_version", value: bytes[3] / 10 });
      data.push({ variable: "hardware_version", value: bytes[4] });
      data.push({ variable: "datacode", value: bcd2number(bytes.slice(5, 9)) });
      return data;
    case 0x01:
      data.push({ variable: "volt", value: bytes[3] / 10 });
      data.push({ variable: "alarm", value: bytes[4] == 1 ? "alarm" : "no_alarm" });
      return data;
  }
}

function decodePort7(bytes) {
  const data = [] as any;
  const cmd = bytes[0];

  switch (cmd) {
    case 0x81:
      data.push({ variable: "cmd", value: "config_report_rsp" });
      data.push({ variable: "status", value: bytes[2] == 0x00 ? "success" : "failure" });
      return data;
    case 0x82:
      data.push({ variable: "cmd", value: "read_config_report_rsp" });
      data.push({ variable: "min_time", value: Number(bytes[2] << 8) + Number(bytes[3]) });
      data.push({ variable: "max_time", value: Number(bytes[4] << 8) + Number(bytes[5]) });
      data.push({ variable: "battery_change", value: bytes[6] / 10 });
      return data;
    default:
      data.push({ variable: "failure", value: "command_configuration" });
      return null;
  }
}

function decodePort13(bytes) {
  const data = [] as any;
  const cmd = bytes[0];

  switch (cmd) {
    case 0x81:
      data.push({ variable: "cmd", value: "set_button_press_time_rsp" });
      data.push({ variable: "status", value: "success" });
      return data;
    case 0x82:
      data.push({ variable: "cmd", value: "get_button_press_time_rsp" });
      data.push({ variable: "press_time", value: bytes[2] });
      return data;
    default:
      return null;
  }
}

const payload_r312a = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const port_r312a = payload.find((x) => x.variable === "port" || x.variable === "fPort")?.value;

if (payload_r312a) {
  try {
    const buffer = Buffer.from(payload_r312a.value, "hex");
    const data = Decoder_r312a(buffer, port_r312a);
    payload = payload.concat(data.map((x) => ({ ...x, serie: payload_r312a.group, time: payload_r312a.time })));
  } catch (error: any) {
    console.error(error);
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
