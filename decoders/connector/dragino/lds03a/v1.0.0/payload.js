/* eslint-disable radix */
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

function getzf(c_num) {
  if (parseInt(c_num) < 10) c_num = `0${c_num}`;

  return c_num;
}

function getMyDate(str) {
  let c_Date;
  if (str > 9999999999) c_Date = new Date(parseInt(str));
  else c_Date = new Date(parseInt(str) * 1000);

  const c_Year = c_Date.getFullYear();
  const c_Month = c_Date.getMonth() + 1;
  const c_Day = c_Date.getDate();
  const c_Hour = c_Date.getHours();
  const c_Min = c_Date.getMinutes();
  const c_Sen = c_Date.getSeconds();
  const c_Time = `${c_Year}-${getzf(c_Month)}-${getzf(c_Day)} ${getzf(c_Hour)}:${getzf(c_Min)}:${getzf(c_Sen)}`;

  return c_Time;
}

function datalog(i, bytes) {
  const aa = bytes[0 + i] & 0x02 ? "TRUE" : "FALSE";
  const bb = bytes[0 + i] & 0x01 ? "OPEN" : "CLOSE";
  const cc = ((bytes[1 + i] << 16) | (bytes[2 + i] << 8) | bytes[3 + i]).toString(10);
  const dd = ((bytes[4 + i] << 16) | (bytes[5 + i] << 8) | bytes[6 + i]).toString(10);
  const ee = getMyDate(((bytes[7 + i] << 24) | (bytes[8 + i] << 16) | (bytes[9 + i] << 8) | bytes[10 + i]).toString(10));
  let string = `[${aa},${bb},${cc},${dd},${ee}]`;
  string = string.concat(",");

  return string;
}

function Decoder(bytes, port) {
  if (port === 0x02) {
    const alarm = bytes[0] & 0x02 ? "TRUE" : "FALSE";
    const door_open_status = bytes[0] & 0x01 ? "OPEN" : "CLOSE";
    const open_times = (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    const open_duration = (bytes[4] << 16) | (bytes[5] << 8) | bytes[6];
    const data_time = getMyDate(((bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10]).toString(10));

    if (bytes.length === 11) {
      return {
        ALARM: alarm,
        DOOR_OPEN_STATUS: door_open_status,
        DOOR_OPEN_TIMES: open_times,
        LAST_DOOR_OPEN_DURATION: open_duration,
        TIME: data_time,
      };
    }
  } else if (port === 0x03) {
    let data_sum;
    for (let i = 0; i < bytes.length; i += 11) {
      const data = datalog(i, bytes);
      if (i === "0") {
        data_sum = data;
      } else {
        data_sum += data;
      }
    }
    return {
      DATALOG: data_sum,
    };
  } else if (port === 0x04) {
    const tdc = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
    const disalarm = bytes[3] & 0x01;
    const keep_status = bytes[4] & 0x01;
    const keep_time = (bytes[5] << 8) | bytes[6];

    return {
      TDC: tdc,
      DISALARM: disalarm,
      KEEP_STATUS: keep_status,
      KEEP_TIME: keep_time,
    };
  } else if (port === 0x05) {
    let sub_band;
    let freq_band;
    let sensor;
    if (bytes[0] === 0x0a) {
      sensor = "LDS03A";
    }

    if (bytes[4] === 0xff) sub_band = "NULL";
    else sub_band = bytes[4];

    if (bytes[3] === 0x01) freq_band = "EU868";
    else if (bytes[3] === 0x02) freq_band = "US915";
    else if (bytes[3] === 0x03) freq_band = "IN865";
    else if (bytes[3] === 0x04) freq_band = "AU915";
    else if (bytes[3] === 0x05) freq_band = "KZ865";
    else if (bytes[3] === 0x06) freq_band = "RU864";
    else if (bytes[3] === 0x07) freq_band = "AS923";
    else if (bytes[3] === 0x08) freq_band = "AS923_1";
    else if (bytes[3] === 0x09) freq_band = "AS923_2";
    else if (bytes[3] === 0x0a) freq_band = "AS923_3";
    else if (bytes[3] === 0x0b) freq_band = "CN470";
    else if (bytes[3] === 0x0c) freq_band = "EU433";
    else if (bytes[3] === 0x0d) freq_band = "KR920";
    else if (bytes[3] === 0x0e) freq_band = "MA869";

    const firm_ver = `${bytes[1] & 0x0f}.${(bytes[2] >> 4) & 0x0f}.${bytes[2] & 0x0f}`;
    const bat = ((bytes[5] << 8) | bytes[6]) / 1000;

    return {
      SENSOR_MODEL: sensor,
      FIRMWARE_VERSION: firm_ver,
      FREQUENCY_BAND: freq_band,
      SUB_BAND: sub_band,
      BAT: bat,
    };
  }
}

const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const port = payload.find((x) => x.variable === "port" || x.variable === "fport")?.value;

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