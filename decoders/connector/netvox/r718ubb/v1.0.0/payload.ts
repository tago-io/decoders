function sensorType(bytes) {
  switch (bytes) {
    case 0x01:
      return "temperature";
    case 0x02:
      return "humidity";
    case 0x03:
      return "light";
    case 0x06:
      return "co2";
    case 0x35:
      return "air_pressure";
    default:
      return "unknown";
  }
}

function Decoder_r718ubb(input, port) {
  switch (port) {
    case 6: // 0x06
      return decodePort6_r718ubb(input);
    case 7: // 0x07
      return decodePort7_r718ubb(input);
    case 14: // 0x0E
      return decodePort14_r718ubb(input);
    default:
      throw new Error("no port configured");
  }
}

function decodePort6_r718ubb(bytes) {
  const data = [] as any;
  const cmd = bytes[2];

  switch (cmd) {
    case 0x01:
      data.push({ variable: "battery", value: bytes[3] / 10, unit: "v" });
      data.push({ variable: "temperature", value: ((Number(bytes[4]) << 8) + Number(bytes[5])) / 100, unit: "°C" });
      data.push({ variable: "humidity", value: ((Number(bytes[6]) << 8) + Number(bytes[7])) / 100, unit: "%" });
      data.push({ variable: "co2", value: (Number(bytes[8]) << 8) + Number(bytes[9]), unit: "ppm" });
      data.push({ variable: "shock_event", value: bytes[10] == 0x00 ? "no_shock" : "shock" });
      return data;
    case 0x02:
      data.push({ variable: "battery", value: bytes[3] / 10, unit: "v" });
      data.push({ variable: "air_pressure", value: ((Number(bytes[4]) << 24) + (Number(bytes[5]) << 16) + (Number(bytes[6]) << 8) + Number(bytes[7])) / 100, unit: "hPa" });
      data.push({ variable: "illuminance", value: (Number(bytes[8]) << 16) + (Number(bytes[9]) << 8) + Number(bytes[10]), unit: "lux" });
      return data;
  }
}

function decodePort7_r718ubb(bytes) {
  const data = [] as any;
  const cmd = bytes[0];

  switch (cmd) {
    case 0x81: // same
      data.push({ variable: "cmd", value: "config_report_rsp" });
      data.push({ variable: "status", value: bytes[2] == 0x00 ? "success" : "failure" });
      return data;
    case 0x82: // same
      data.push({ variable: "cmd", value: "read_config_report_rsp" });
      data.push({ variable: "min_time", value: Number(bytes[2] << 8) + Number(bytes[3]), unit: "s" });
      data.push({ variable: "max_time", value: Number(bytes[4] << 8) + Number(bytes[5]), unit: "s" });
      return data;
    case 0x83: // new but simple
      data.push({ variable: "cmd", value: "calibrate_co2_rsp" });
      data.push({ variable: "status", value: bytes[2] == 0x00 ? "success" : "failure" });
      return data;
    case 0x84: // new but simple
      data.push({ variable: "cmd", value: "set_shock_sensor_sensitivity_rsp" });
      data.push({ variable: "status", value: bytes[2] == 0x00 ? "success" : "failure" });
      return data;
    case 0x85: // new but simple
      data.push({ variable: "cmd", value: "get_shock_sensor_sensitivity_rsp" });
      data.push({ variable: "sensitivity", value: bytes[2] });
      return data;
    default:
      data.push({ variable: "failure", value: "command_configuration" });
      return null;
  }
}

function decodePort14_r718ubb(bytes) {
  const data = [] as any;
  const cmd = bytes[0];

  switch (cmd) {
    case 0x81:
      data.push({ variable: "cmd", value: "set_global_calibrate_rsp" });
      data.push({ variable: "sensor_type", value: sensorType(bytes[1]) });
      data.push({ variable: "channel", value: bytes[2] });
      data.push({ variable: "status", value: bytes[3] == 0x00 ? "success" : "failure" });
      return data;
    case 0x82:
      data.push({ variable: "cmd", value: "get_global_calibrate_rsp" });
      data.push({ variable: "sensor_type", value: sensorType(bytes[1]) });
      data.push({ variable: "channel", value: bytes[2] });
      data.push({ variable: "multipler", value: Number(bytes[3] << 8) + Number(bytes[4]) });
      data.push({ variable: "divisor", value: Number(bytes[5] << 8) + Number(bytes[6]) });
      data.push({ variable: "delta_value", value: Number(bytes[7] << 8) + Number(bytes[8]) });
      return data;
    case 0x83:
      data.push({ variable: "cmd", value: "clear_global_calibrate_rsp" });
      data.push({ variable: "status", value: bytes[1] == 0x00 ? "success" : "failure" });
      return data;
    default:
      data.push({ variable: "failure", value: "command_configuration" });
      return null;
  }
}

const payload_r718ubb = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const port_r718ubb = payload.find((x) => x.variable === "port" || x.variable === "fPort" || x.variable === "fport")?.value;

if (payload_r718ubb) {
  try {
    const buffer = Buffer.from(payload_r718ubb.value, "hex");
    const data = Decoder_r718ubb(buffer, port_r718ubb);
    payload = payload.concat(data.map((x) => ({ ...x, serie: payload_r718ubb.group, time: payload_r718ubb.time })));
  } catch (error: any) {
    console.error(error);
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
