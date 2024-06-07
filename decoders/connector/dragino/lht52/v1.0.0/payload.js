/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable prettier/prettier */
/* eslint-disable no-bitwise */
/*
* lht52
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

function str_pad(byte) {
  const zero = "0";
  const hex = byte.toString(16);
  const tmp = 2 - hex.length;
  return zero.substr(0, tmp) + hex;
}

function Decoder(bytes, port) {
  const decode = {};
  if (port === 2) {
    if (bytes.length === 11) {
      decode.TempC_SHT = parseFloat(((((bytes[0] << 24) >> 16) | bytes[1]) / 100).toFixed(2));
      decode.Hum_SHT = parseFloat(((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(1));
      decode.TempC_DS = parseFloat(((((bytes[4] << 24) >> 16) | bytes[5]) / 100).toFixed(2));

      decode.Ext = bytes[6];
      decode.Systimestamp = (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10];

      return decode;
    } else {
      decode.Status = "RPL data or sensor reset";

      return decode;
    }
  }

  if (port === 3) {
    decode.Status = "Data retrieved, your need to parse it by the application server";

    return decode;
  }

  if (port === 4) {
    decode.DS18B20_ID =
      str_pad(bytes[0]) + str_pad(bytes[1]) + str_pad(bytes[2]) + str_pad(bytes[3]) + str_pad(bytes[4]) + str_pad(bytes[5]) + str_pad(bytes[6]) + str_pad(bytes[7]);

    return decode;
  }

  if (port === 5) {
    decode.Sensor_Model = bytes[0];
    decode.Firmware_Version = str_pad((bytes[1] << 8) | bytes[2]);
    decode.Freq_Band = bytes[3];
    decode.Sub_Band = bytes[4];
    decode.Bat_mV = (bytes[5] << 8) | bytes[6];

    return decode;
  }
}

const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data" || x.variable === "RawData" || x.variable === "rawdata");
const port = payload.find((x) => x.variable === "port" || x.variable === "fport" || x.variable === "FPort" || x.variable === "fPort").value;

if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    const payload_aux = Decoder(buffer, Number(port));
    payload = payload.concat(toTagoFormat(payload_aux).map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
