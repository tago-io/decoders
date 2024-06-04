/* eslint-disable unicorn/number-literal-case */
/* eslint-disable unicorn/numeric-separators-style */
// eslint-disable-next-line unicorn/prefer-set-has

// This decoder is used for both the VS133 and VS135 devices. Any modifications done to the VS133 decoder must be done to the VS135 decoder as well.

const total_out_chns = [0x04, 0x07, 0x0a, 0x0d];
const total_in_chns = [0x03, 0x06, 0x09, 0x0c];
const period_chns = [0x05, 0x08, 0x0b, 0x0e];

function vs133decoder(bytes) {
  const decoded: any = [];

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];

    // LINE TOTAL IN
    if (includes(total_in_chns, channel_id) && channel_type === 0xd2) {
      const channel_in_name = `line_${(channel_id - total_in_chns[0]) / 3 + 1}`;
      decoded.push({ variable: channel_in_name + "_total_in", value: readUInt32LEe(bytes.slice(i, i + 4)) });
      i += 4;
    }
    // LINE TOTAL OUT
    else if (includes(total_out_chns, channel_id) && channel_type === 0xd2) {
      const channel_out_name = `line_${(channel_id - total_out_chns[0]) / 3 + 1}`;
      decoded.push({ variable: channel_out_name + "_total_out", value: readUInt32LEe(bytes.slice(i, i + 4)) });
      i += 4;
    }
    // LINE PERIOD
    else if (includes(period_chns, channel_id) && channel_type === 0xcc) {
      const channel_period_name = `line_${(channel_id - period_chns[0]) / 3 + 1}`;
      decoded.push({ variable: channel_period_name + "_period_in", value: readUInt16LEe(bytes.slice(i, i + 2)) });
      decoded.push({ variable: channel_period_name + "_period_out", value: readUInt16LEe(bytes.slice(i + 2, i + 4)) });
      i += 4;
    }
    // REGION COUNT
    else if (channel_id === 0x0f && channel_type === 0xe3) {
      decoded.push({ variable: "region_1_count", value: readUInt8E(bytes[i]) });
      decoded.push({ variable: "region_2_count", value: readUInt8E(bytes[i + 1]) });
      decoded.push({ variable: "region_3_count", value: readUInt8E(bytes[i + 2]) });
      decoded.push({ variable: "region_4_count", value: readUInt8E(bytes[i + 3]) });
      i += 4;
    }
    // REGION DWELL TIME
    else if (channel_id === 0x10 && channel_type === 0xe4) {
      const dwell_channel_name = "region_" + String(bytes[i]);
      decoded.push({ variable: dwell_channel_name + "_avg_dwell", value: readUInt16LEe(bytes.slice(i + 1, i + 3)) });
      decoded.push({ variable: dwell_channel_name + "_max_dwell", value: readUInt16LEe(bytes.slice(i + 3, i + 5)) });
      i += 5;
    } else {
      break;
    }
  }

  return decoded;
}

function readUInt8E(bytes) {
  return bytes & 0xff;
}

function readUInt16LEe(bytes) {
  const value = (bytes[1] << 8) + Number(bytes[0]);
  return value & 0xffff;
}

function readUInt32LEe(bytes) {
  const value = (bytes[3] << 24) + Number(bytes[2] << 16) + Number(bytes[1] << 8) + Number(bytes[0]);
  return (value & 0xffffffff) >>> 0;
}

function includes(datas, value) {
  const size = datas.length;
  for (let i = 0; i < size; i++) {
    if (datas[i] == value) {
      return true;
    }
  }
  return false;
}

const vs133PayloadData = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data" || x.variable === "payload_hex");

if (vs133PayloadData) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(vs133PayloadData?.value, "hex");
    const time = Date.now();
    const decodedvs133Payload = vs133decoder(buffer);
    payload = decodedvs133Payload?.map((x) => ({ ...x, time })) ?? [];
  } catch (error: any) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
