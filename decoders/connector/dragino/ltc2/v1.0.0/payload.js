/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable prettier/prettier */
/* eslint-disable no-bitwise */
/*
 * ltc2
 */
// Add ignorable variables in this array.
const ignore_vars = [];

function toTagoFormat(object_item, serie, prefix = "") {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] === "object") {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`.toLowerCase(),
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`.toLowerCase(),
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

function Decoder(bytes) {
  const poll_message_status = (bytes[2] & 0x40) >> 6;

  const decode = {};

  decode.Ext = bytes[2] & 0x0f;
  decode.BatV = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;

  if (decode.Ext === 0x01) {
    decode.Temp_Channel1 = parseFloat(((((bytes[3] << 24) >> 16) | bytes[4]) / 100).toFixed(2));
    decode.Temp_Channel2 = parseFloat(((((bytes[5] << 24) >> 16) | bytes[6]) / 100).toFixed(2));
  } else if (decode.Ext === 0x02) {
    decode.Temp_Channel1 = parseFloat(((((bytes[3] << 24) >> 16) | bytes[4]) / 10).toFixed(1));
    decode.Temp_Channel2 = parseFloat(((((bytes[5] << 24) >> 16) | bytes[6]) / 10).toFixed(1));
  } else if (decode.Ext === 0x03) {
    decode.Res_Channel1 = parseFloat((((bytes[3] << 8) | bytes[4]) / 100).toFixed(2));
    decode.Res_Channel2 = parseFloat((((bytes[5] << 8) | bytes[6]) / 100).toFixed(2));
  }

  decode.Systimestamp = (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10];

  if (poll_message_status === 0) {
    if (bytes.length === 11) {
      return decode;
    }
  }
}

const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    const payload_aux = Decoder(buffer);
    payload = payload.concat(toTagoFormat(payload_aux).map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}

