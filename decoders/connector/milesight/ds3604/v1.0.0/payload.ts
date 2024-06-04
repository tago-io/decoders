/* eslint-disable unicorn/prefer-code-point */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable unicorn/number-literal-case */
/* eslint-disable unicorn/numeric-separators-style */
// eslint-disable-next-line unicorn/prefer-set-has
function ds3604decoder(bytes) {
  const decoded: any = [];

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];

    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.push({ variable: "battery", value: bytes[i] });
      i += 1;
    }
    // TEMPLATE
    else if (channel_id == 0xff && channel_type == 0x73) {
      decoded.push({ variable: "template", value: bytes[i] + 1 });
      i += 1;
    }
    // TEMPLATE BLOCK CHANNEL DATA
    else if (channel_id == 0xfb && channel_type == 0x01) {
      const template_id = (bytes[i] >> 6) + 1;
      const block_id = bytes[i++] & 0x3f;
      let block_name;
      if (block_id < 10) {
        block_name = "text_" + (block_id + 1);
        const block_length = bytes[i++];
        decoded[block_name] = fromAsciiBytes(bytes.slice(i, i + block_length));
        decoded.push({ variable: block_name, value: fromAsciiBytes(bytes.slice(i, i + block_length)) });
        i += block_length;
      } else if (block_id == 10) {
        block_name = "qrcode";
        const block_length = bytes[i++];
        decoded[block_name] = fromAsciiBytes(bytes.slice(i, i + block_length));
        decoded.push({ variable: block_name, value: fromAsciiBytes(bytes.slice(i, i + block_length)) });
        i += block_length;
      }
      decoded.template = template_id;
      decoded.push({ variable: "template", value: template_id });
    } else {
      break;
    }
  }

  return decoded;
}

function fromAsciiBytes(bytes) {
  let asciiStr = "";
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] <= 0x7f) {
      asciiStr += String.fromCharCode(bytes[i]);
    } else {
      asciiStr += "?";
    }
  }
  return asciiStr;
}

const ds3604PayloadData = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (ds3604PayloadData) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(ds3604PayloadData?.value, "hex");
    const time = Date.now();
    const decodedds3604Payload = ds3604decoder(buffer);
    payload = decodedds3604Payload?.map((x) => ({ ...x, time })) ?? [];
  } catch (error: any) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
