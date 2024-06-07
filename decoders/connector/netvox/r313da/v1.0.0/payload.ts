function decode(bytes) {
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
      return data;
    case 0x83:
      data.push({ variable: "cmd", value: "set_restore_report_rsp" });
      data.push({ variable: "status", value: bytes[2] == 0x00 ? "success" : "failure" });
      return data;
    case 0x84:
      data.push({ variable: "restore_report_set", value: bytes[2] == 0x00 ? "Do_not_report_when_sensor_restore" : "report_when_sensor_restore" });
      return data;
    default:
      data.push({ variable: "failure", value: "command_configuration" });
      return null;
  }
}

const payload_r313da = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data" || x.variable === "payload_hex");

if (payload_r313da) {
  try {
    const buffer = Buffer.from(payload_r313da.value, "hex");
    const data = decode(buffer);
    payload = payload.concat(data.map((x) => ({ ...x, serie: payload_r313da.group, time: payload_r313da.time })));
  } catch (error: any) {
    console.error(error);
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
