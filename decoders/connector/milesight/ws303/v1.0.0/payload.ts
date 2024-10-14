function milesightDeviceDecode(bytes) {
  let decoded: any = {};
  let data: any = [];

  for (var i = 0; i < bytes.length; ) {
    var channel_id = bytes[i++];
    var channel_type = bytes[i++];
    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.battery = bytes[i];
      data.push({ variable: "battery", value: bytes[i], unit: "%" });
      i += 1;
    }
    // WATER LEAK
    else if (channel_id === 0x03 && channel_type === 0x00) {
      decoded.leakage_status = bytes[i] === 0 ? "normal" : "leak";
      data.push({ variable: "leakage_status", value: decoded.leakage_status });
      i += 1;
    } else {
      break;
    }
  }

  return data;
}

const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));

if (payload_raw) {
  try {
    const buffer = Buffer.from(payload_raw.value as string, "hex");
    const decoded = milesightDeviceDecode(buffer);
    const time = Date.now();
    const payloadAux = decoded.map((x) => ({ ...x, time })) ?? [];
    payload = payload.concat(payloadAux);
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
