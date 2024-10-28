/* eslint-disable default-case */
/* eslint-disable radix */
/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable prettier/prettier */
/* eslint-disable no-bitwise */
/*
 * cs01lb
 */
// Add ignorable variables in this array.
const ignore_vars = [] as any;

function toTagoFormat(object_item: {}, group: string, prefix = "") {
  const result = [] as any;
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] === "object") {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`.toLowerCase(),
        value: object_item[key].value,
        group: object_item[key].group || group,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`.toLowerCase(),
        value: object_item[key],
        group,
      });
    }
  }

  return result;
}

function getzf(c_num: string) {
  if (parseInt(c_num) < 10) c_num = `0${c_num}`;

  return c_num;
}

function getMyDate(str: string) {
  let c_Date;
  if (Number(str) > 9999999999) c_Date = new Date(parseInt(str));
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

function datalog(i: number, bytes: Buffer) {
  const aa = parseFloat(((bytes[1 + i] << 8) | bytes[2 + i]) / 100).toFixed(2);
  const bb = parseFloat(((bytes[3 + i] << 8) | bytes[4 + i]) / 100).toFixed(2);
  const cc = parseFloat(((bytes[5 + i] << 8) | bytes[6 + i]) / 100).toFixed(2);
  const dd = bytes[0 + i] & 0x02 ? "High" : "Low";
  const ee = bytes[0 + i] & 0x01 ? "True" : "FALSE";
  const ff = getMyDate(((bytes[7 + i] << 24) | (bytes[8 + i] << 16) | (bytes[9 + i] << 8) | bytes[10 + i]).toString(10));
  let string = `[${aa},${bb},${cc},${ff},${dd},${ee}]`;
  string = string.concat(",");

  return string;
}

function datalog2(i: number, bytes: Buffer) {
  var aa = parseFloat(((bytes[i] << 8) | bytes[i + 1]) / 100).toFixed(2);
  var string = "[" + aa + "]" + ",";
  return string;
}

function Decoder(bytes: Buffer, port: number) {
  if (port === 0x03) {
    let data_sum;
    for (let i = 0; i < bytes.length; i += 11) {
      const data = datalog(i, bytes);
      if (i == 0) data_sum = data;
      else data_sum += data;
    }
    return {
      DATALOG: data_sum,
    };
  } else if (port === 0x07) {
    const bat = ((bytes[5] << 8) | bytes[6]) / 1000;
    let data_sum;
    for (var k = 2; k < bytes.length; k = k + 2) {
      const data = datalog2(k, bytes);
      if (k == 2) data_sum = data;
      else data_sum += data;
    }
    return {
      BAT: bat,
      DATALOG: data_sum,
    };
  } else if (port === 0x02) {
    const bat = ((bytes[5] << 8) | bytes[6]) / 1000;
    const exti_Trigger = bytes[0] & 0x40 ? "TRUE" : "FALSE";
    const exti_Level = bytes[0] & 0x80 ? "HIGH" : "LOW";
    const current1_A = ((bytes[2] << 8) | bytes[3]) / 100;
    const current2_A = ((bytes[4] << 8) | bytes[5]) / 100;
    const current3_A = ((bytes[6] << 8) | bytes[7]) / 100;
    const current4_A = ((bytes[8] << 8) | bytes[9]) / 100;
    const cur1L_status = bytes[10] & 0x80 ? "True" : "False";
    const cur1H_status = bytes[10] & 0x40 ? "True" : "False";
    const cur2L_status = bytes[10] & 0x20 ? "True" : "False";
    const cur2H_status = bytes[10] & 0x10 ? "True" : "False";
    const cur3L_status = bytes[10] & 0x08 ? "True" : "False";
    const cur3H_status = bytes[10] & 0x04 ? "True" : "False";
    const cur4L_status = bytes[10] & 0x02 ? "True" : "False";
    const cur4H_status = bytes[10] & 0x01 ? "True" : "False";

    return {
      EXTI_Trigger: exti_Trigger,
      BAT: bat,
      KEEP_STATUS: exti_Level,
      Current1_A: current1_A,
      Current2_A: current2_A,
      Current3_A: current3_A,
      Current4_A: current4_A,
      Cur1L_status: cur1L_status,
      Cur1H_status: cur1H_status,
      Cur2L_status: cur2L_status,
      Cur2H_status: cur2H_status,
      Cur3L_status: cur3L_status,
      Cur3H_status: cur3H_status,
      Cur4L_status: cur4L_status,
      Cur4H_status: cur4H_status,
    };
  } else if (port === 0x05) {
    let sub_band;
    let freq_band;
    let sensor;
    if (bytes[0] === 0x33) sensor = "CS01-LB";

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

const cs01lb_payload = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

const port = payload.find((x) => x.variable === "port" || x.variable === "fport" || x.variable === "fPort");

if (cs01lb_payload) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(cs01lb_payload.value, "hex");
    const group = new Date().getTime().toString();
    const payload_aux = Decoder(buffer, Number(port.value));
    payload = payload.concat(toTagoFormat(payload_aux, group));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
