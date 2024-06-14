/* eslint-disable no-undef */
/* eslint-disable no-useless-concat */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-use-before-define */
/* eslint-disable radix */
/* eslint-disable prettier/prettier */
/* eslint-disable no-bitwise */
/* eslint-disable prettier/prettier */

/* sw3l */

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

function datalog(i, bytes) {
  const aa = bytes[0 + i] & 0x02 ? "TRUE" : "FALSE";
  const bb = (bytes[0 + i] & 0xfc) >> 2;
  const cc = bytes[1 + i];
  const dd =
    ((bytes[3 + i] << 24) |
      (bytes[4 + i] << 16) |
      (bytes[5 + i] << 8) |
      bytes[6 + i]) >>>
    0;
  let ee;

  if (bb == 0x02) ee = (dd / 60).toFixed(1);
  else if (bb == 0x01) ee = (dd / 360).toFixed(1);
  else ee = (dd / 450).toFixed(1);

  const ff = getMyDate(
    (
      (bytes[7 + i] << 24) |
      (bytes[8 + i] << 16) |
      (bytes[9 + i] << 8) |
      bytes[10 + i]
    ).toString(10)
  );
  const string = `[${aa},${bb},${cc},${dd},${ee},${ff}]` + `,`;

  return string;
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
  const c_Time = `${c_Year}-${getzf(c_Month)}-${getzf(c_Day)} ${getzf(
    c_Hour
  )}:${getzf(c_Min)}:${getzf(c_Sen)}`;

  return c_Time;
}

function Decoder(bytes, port) {
  if (port == 0x02) {
    const flag = (bytes[0] & 0xfc) >> 2;
    const decode = {};

    decode.MOD = bytes[5];
    decode.Calculate_flag = flag;
    decode.Alarm = bytes[0] & 0x02 ? "TRUE" : "FALSE";

    if (flag == 2)
      decode.Water_flow_value = parseFloat(
        (
          (((bytes[1] << 24) |
            (bytes[2] << 16) |
            (bytes[3] << 8) |
            bytes[4]) >>>
            0) /
          60
        ).toFixed(1)
      );
    else if (flag == 1)
      decode.Water_flow_value = parseFloat(
        (
          (((bytes[1] << 24) |
            (bytes[2] << 16) |
            (bytes[3] << 8) |
            bytes[4]) >>>
            0) /
          360
        ).toFixed(1)
      );
    else
      decode.Water_flow_value = parseFloat(
        (
          (((bytes[1] << 24) |
            (bytes[2] << 16) |
            (bytes[3] << 8) |
            bytes[4]) >>>
            0) /
          450
        ).toFixed(1)
      );

    if (bytes[5] == 0x01)
      decode.Last_pulse =
        ((bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4]) >>>
        0;
    else
      decode.Total_pulse =
        ((bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4]) >>>
        0;

    decode.Data_time = getMyDate(
      (
        (bytes[7] << 24) |
        (bytes[8] << 16) |
        (bytes[9] << 8) |
        bytes[10]
      ).toString(10)
    );

    return decode;
  }
  if (port == 0x03) {
    for (let i = 0; i < bytes.length; i += 11) {
      const data = datalog(i, bytes);
      if (i == "0") data_sum = data;
      else data_sum += data;
    }
    return {
      DATALOG: data_sum,
    };
  }
  if (port == 0x04) {
    const tdc = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
    const stop_timer = bytes[4];
    const alarm_timer = (bytes[5] << 8) | bytes[6];

    return {
      TDC: tdc,
      Stop_Timer: stop_timer,
      Alarm_Timer: alarm_timer,
    };
  }
  if (port == 0x05) {
    let sub_band;
    let freq_band;
    let sensor;

    if (bytes[0] == 0x11) sensor = "SW3L";

    if (bytes[4] == 0xff) sub_band = "NULL";
    else sub_band = bytes[4];

    if (bytes[3] == 0x01) freq_band = "EU868";
    else if (bytes[3] == 0x02) freq_band = "US915";
    else if (bytes[3] == 0x03) freq_band = "IN865";
    else if (bytes[3] == 0x04) freq_band = "AU915";
    else if (bytes[3] == 0x05) freq_band = "KZ865";
    else if (bytes[3] == 0x06) freq_band = "RU864";
    else if (bytes[3] == 0x07) freq_band = "AS923";
    else if (bytes[3] == 0x08) freq_band = "AS923_1";
    else if (bytes[3] == 0x09) freq_band = "AS923_2";
    else if (bytes[3] == 0x0a) freq_band = "AS923_3";
    else if (bytes[3] == 0x0b) freq_band = "CN470";
    else if (bytes[3] == 0x0c) freq_band = "EU433";
    else if (bytes[3] == 0x0d) freq_band = "KR920";
    else if (bytes[3] == 0x0e) freq_band = "MA869";

    const firm_ver = `${bytes[1] & 0x0f}.${(bytes[2] >> 4) & 0x0f}.${
      bytes[2] & 0x0f
    }`;
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

const payload_raw = payload.find(
  (x) =>
    x.variable === "payload_raw" ||
    x.variable === "payload" ||
    x.variable === "data"
);
const port = payload.find(
  (x) => x.variable === "port" || x.variable === "fport"
)?.value;

if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const group = new Date().getTime().toString();
    const payload_aux = Decoder(buffer, port);
    payload = payload.concat(
      toTagoFormat(payload_aux).map((x) => ({ ...x, group }))
    );
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}