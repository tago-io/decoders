/* eslint-disable default-case */
/* eslint-disable radix */
/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable prettier/prettier */
/* eslint-disable no-bitwise */

// Add ignorable variables in this array.
const ignore_vars = [] as any;

function toTagoFormat(object_item: {}, group: number, prefix = "") {
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

function datalog(i: number, bytes: Buffer) {
  var aa = bytes[0 + i] & 0x08 ? "PART" : "SUM";
  var bb = bytes[0 + i] & 0x04 ? "YES" : "NO";
  var cc = bytes[0 + i] & 0x02 ? "TRUE" : "FALSE";
  var dd = bytes[0 + i] & 0x01 ? "LEAK" : "NO LEAK";
  var ee = ((bytes[1 + i] << 16) | (bytes[2 + i] << 8) | bytes[3 + i]).toString(10);
  var ff = ((bytes[4 + i] << 16) | (bytes[5 + i] << 8) | bytes[6 + i]).toString(10);
  var gg = getMyDate(((bytes[7 + i] << 24) | (bytes[8 + i] << 16) | (bytes[9 + i] << 8) | bytes[10 + i]).toString(10));
  var string = "[" + aa + "," + bb + "," + cc + "," + dd + "," + ee + "," + ff + "," + gg + "]" + ",";

  return string;
}

function getzf(c_num: string) {
  if (parseInt(c_num) < 10) c_num = "0" + c_num;

  return c_num;
}

function getMyDate(str: string) {
  var c_Date;
  if (parseInt(str) > 9999999999) {
    c_Date = new Date(parseInt(str));
  } else {
    c_Date = new Date(parseInt(str) * 1000);
  }

  var c_Year = c_Date.getFullYear(),
    c_Month = c_Date.getMonth() + 1,
    c_Day = c_Date.getDate(),
    c_Hour = c_Date.getHours(),
    c_Min = c_Date.getMinutes(),
    c_Sen = c_Date.getSeconds();
  var c_Time = c_Year + "-" + getzf(c_Month) + "-" + getzf(c_Day) + " " + getzf(c_Hour) + ":" + getzf(c_Min) + ":" + getzf(c_Sen);

  return c_Time;
}

function Decoder(bytes: Buffer, port: number) {
  if (port == 0x03) {
    var pnack = (bytes[0] >> 7) & 0x01 ? "True" : "False";
    let data_sum: any = "";
    for (var i = 0; i < bytes.length; i = i + 11) {
      var data = datalog(i, bytes);
      if (i == 0) {
        data_sum = data;
      } else {
        data_sum += data;
      }
    }
    return {
      DATALOG: data_sum,
      PNACKMD: pnack,
    };
  } else if (port == 0x04) {
    var tdc = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
    var disalarm = bytes[3] & 0x01;
    var keep_status = bytes[4] & 0x01;
    var keep_time = (bytes[5] << 8) | bytes[6];
    var leak_alarm_time = bytes[7];

    return {
      TDC: tdc,
      DISALARM: disalarm,
      KEEP_STATUS: keep_status,
      KEEP_TIME: keep_time,
      LEAK_ALARM_TIME: leak_alarm_time,
    };
  } else if (port == 0x05) {
    var sub_band;
    var freq_band;
    var sensor;

    if (bytes[0] == 0x1d) sensor = "WL03A-LB";

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

    var firm_ver = (bytes[1] & 0x0f) + "." + ((bytes[2] >> 4) & 0x0f) + "." + (bytes[2] & 0x0f);
    var bat = ((bytes[5] << 8) | bytes[6]) / 1000;

    return {
      SENSOR_MODEL: sensor,
      FIRMWARE_VERSION: firm_ver,
      FREQUENCY_BAND: freq_band,
      SUB_BAND: sub_band,
      BAT: bat,
    };
  } else {
    var count_mod = bytes[0] & 0x08 ? "PART" : "SUM";
    var tdc_interval = bytes[0] & 0x04 ? "YES" : "NO";
    var alarm = bytes[0] & 0x02 ? "TRUE" : "FALSE";
    var leak_status = bytes[0] & 0x01 ? "LEAK" : "NO LEAK";
    var leak_times = (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    var leak_duration = (bytes[4] << 16) | (bytes[5] << 8) | bytes[6];
    var data_time = getMyDate(((bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10]).toString(10));

    if (bytes.length == 11) {
      return {
        CMOD: count_mod,
        TDC: tdc_interval,
        ALARM: alarm,
        WATER_LEAK_STATUS: leak_status,
        WATER_LEAK_TIMES: leak_times,
        LAST_WATER_LEAK_DURATION: leak_duration,
        TIME: data_time,
      };
    }
  }
}

const wl03alb_payload = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

const port = payload.find((x) => x.variable === "port" || x.variable === "fport" || x.variable === "fPort");

if (wl03alb_payload && port) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(wl03alb_payload.value, "hex");
    const group = port.group || String(new Date().getTime());
    const payload_aux = Decoder(buffer, Number(port.value));
    payload = payload.concat(toTagoFormat(payload_aux, group));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
