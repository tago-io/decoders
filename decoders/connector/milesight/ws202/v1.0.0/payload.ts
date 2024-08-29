interface DecodedData {
  [key: string]: number | string;
}

function mileSightDeviceDecode(bytes: Buffer): DecodedData {
  const decoded: DecodedData = {};

  if (bytes.length < 2) {
    throw new Error("Invalid payload size");
  }

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.battery = bytes[i];
      i += 1;
    }
    // PIR
    else if (channel_id === 0x03 && channel_type === 0x00) {
      decoded.pir = bytes[i] === 0 ? "normal" : "trigger";
      i += 1;
    }
    // DAYLIGHT
    else if (channel_id === 0x04 && channel_type === 0x00) {
      decoded.daylight = bytes[i] === 0 ? "dark" : "light";
      i += 1;
    } else {
      break;
    }
  }

  return decoded;
}

const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));

if (payload_raw) {
  try {
    const buffer = Buffer.from(payload_raw.value as string, "hex");
    const decoded = mileSightDeviceDecode(buffer);

    const time = payload_raw.time || new Date().toISOString();
    const group = payload_raw.group || `${new Date().getTime()}-${Math.random().toString(36).substring(2, 5)}`;

    const parsedTagoObj = [
      { variable: "battery", value: decoded.battery, unit: "%", group, time },
      { variable: "pir", value: decoded.pir, group, time },
      { variable: "daylight", value: decoded.daylight, group, time },
    ];

    payload = payload.concat(parsedTagoObj);
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
