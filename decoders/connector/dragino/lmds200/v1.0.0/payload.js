/* eslint-disable default-case */
/* eslint-disable radix */
/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable prettier/prettier */
/* eslint-disable no-bitwise */
/*
 * LMDS200
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

function Decoder(bytes, port) {
  let bat;
  let value;
  if (port === 2) {
    value = (bytes[0] << 8) | bytes[1];
    bat = value / 1000;
    value = (bytes[2] << 8) | bytes[3];
    const dis1 = value;
    value = (bytes[4] << 8) | bytes[5];
    const dis2 = value;
    const dalarm_count = (bytes[6] >> 2) & 0x3f;
    const distance_alarm = (bytes[6] >> 1) & 0x01;
    const inter_alarm = bytes[6] & 0x01;
    return {
      Bat: bat,
      dis1,
      dis2,
      DALARM_count: dalarm_count,
      Distance_alarm: distance_alarm,
      Interrupt_alarm: inter_alarm,
    };
  } else if (port === 5) {
    let model = "";
    if (bytes[0] === 0x0c) model = "LMDS200";
    let version = ((bytes[1] << 8) | bytes[2]).toString(16);
    version = parseInt(version, 10);
    let fre_band = "";
    switch (bytes[3]) {
      case 0x01:
        fre_band = "EU868";
        break;
      case 0x02:
        fre_band = "US915";
        break;
      case 0x03:
        fre_band = "IN865";
        break;
      case 0x04:
        fre_band = "AU915";
        break;
      case 0x05:
        fre_band = "KZ865";
        break;
      case 0x06:
        fre_band = "RU864";
        break;
      case 0x07:
        fre_band = "AS923";
        break;
      case 0x08:
        fre_band = "AS923-1";
        break;
      case 0x09:
        fre_band = "AS923-2";
        break;
      case 0x0a:
        fre_band = "AS923-3";
        break;
      case 0x0b:
        fre_band = "CN470";
        break;
      case 0x0c:
        fre_band = "EU433";
        break;
      case 0x0d:
        fre_band = "KR920";
        break;
      case 0x0e:
        fre_band = "MA869";
        break;
    }
    const sub_band = bytes[4];
    bat = ((bytes[5] << 8) | bytes[6]) / 1000;

    return {
      Sensor_model: model,
      Ver: version,
      Fre_band: fre_band,
      Sub_band: sub_band,
      Bat: bat,
    };
  } else if (port === 4) {
    const tdc = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
    const atdc = bytes[3];
    const alarm_min = (bytes[4] << 8) | bytes[5];
    const alarm_max = (bytes[6] << 8) | bytes[7];
    const input = bytes[8];
    return {
      TDC: tdc,
      ATDC: atdc,
      Alarm_min: alarm_min,
      Alarm_max: alarm_max,
      Interrupt: input,
    };
  }
}

const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const port = payload.find((x) => x.variable === "port" || x.variable === "fport").value;

if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    const payload_aux = Decoder(buffer, port);
    payload = payload.concat(toTagoFormat(payload_aux).map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
