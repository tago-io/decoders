interface DecodedData extends Pick<Data, "variable" | "value" | "time" | "unit" | "group"> {}

function mileSightDeviceDecode(bytes: Buffer): DecodedData[] {
  const decoded: DecodedData[] = [];

  if (bytes.length < 2) {
    throw new Error("Invalid payload size");
  }

  const group = `${new Date().getTime()}-${Math.random().toString(36).substring(2, 5)}`;
  const time = new Date();

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];

    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.push({
        variable: "battery",
        value: bytes[i],
        unit: "%",
        group,
        time,
      });
      i += 1;
    }
    // DISTANCE
    else if (channel_id === 0x02 && channel_type === 0x82) {
      const distance = (bytes[i] | (bytes[i + 1] << 8)) & 0xffff;
      decoded.push({
        variable: "distance",
        value: distance,
        unit: "mm",
        group,
        time,
      });
      i += 2;
    }
    // OCCUPANCY
    else if (channel_id === 0x03 && channel_type === 0x8e) {
      const occupancy = bytes[i] === 0 ? "vacant" : "occupied";
      decoded.push({
        variable: "occupancy",
        value: occupancy,
        group,
        time,
      });
      i += 1;
    }
    // CALIBRATION
    else if (channel_id === 0x04 && channel_type === 0x8e) {
      const calibration = bytes[i] === 0 ? "failed" : "success";
      decoded.push({
        variable: "calibration",
        value: calibration,
        group,
        time,
      });
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
    const parsedTagoObj = mileSightDeviceDecode(buffer);

    payload = payload.concat(parsedTagoObj);
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
