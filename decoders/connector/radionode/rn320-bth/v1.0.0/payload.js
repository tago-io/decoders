/* --- Radionode RN320-BTH Decoder --- */

function Decoder(bytes, port) {
  // ... (Your existing Decoder logic with readUInt8, readFloatLE, etc.)
  // Ensure this function returns an object: { head, temperature, humidity, etc. }
  const readUInt8 = b => b & 0xFF;
  const readUInt16LE = b => (b[1] << 8) + b[0];
  const readUInt32LE = b => (b[3] << 24) + (b[2] << 16) + (b[1] << 8) + b[0];
  const readFloatLE = b => {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    for (let i = 0; i < 4; i++) view.setUint8(i, b[i]);
    return view.getFloat32(0, true);
  };

  const head = readUInt8(bytes[0]);
  if (head === 12 || head === 13) {
    const splfmt = readUInt8(bytes[7]);
    if (splfmt !== 2) return { error: "Unsupported Format" };
    const temperature = parseFloat(readFloatLE(bytes.slice(8, 12)).toFixed(2));
    const humidity = parseFloat(readFloatLE(bytes.slice(12, 16)).toFixed(2));
    return { head, temperature, humidity };
  }
  return { error: "Unsupported head: " + head };
}

// --- TagoIO HELPERS (The "Glue") ---

function ToTagoFormat(object_item) {
  const result = [];
  for (const key in object_item) {
    result.push({
      variable: key.toLowerCase(),
      value: object_item[key],
    });
  }
  return result;
}

// --- ENTRY POINT ---
const payload_raw = payload.find((x) => x.variable === "payload" || x.variable === "data");
if (payload_raw) {
  try {
    const buffer = Buffer.from(payload_raw.value, "hex");
    const decoded_obj = Decoder(buffer, 1);
    
    if (decoded_obj.error) {
      payload.push({ variable: "parse_error", value: decoded_obj.error });
    } else {
      const tago_data = ToTagoFormat(decoded_obj);
      // Concat the results to the global payload array
      payload = payload.concat(tago_data);
    }
  } catch (e) {
    payload = [{ variable: "parse_error", value: e.message }];
  }
}