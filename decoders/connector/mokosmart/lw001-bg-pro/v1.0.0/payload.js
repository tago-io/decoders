/* eslint-disable no-plusplus */
/* eslint-disable prettier/prettier */
/*
 * LW001-BG-PRO
 */

const packet_type = [
  "heart",
  "fix_success",
  "fix_false",
  "sys_close_info",
  "shake_info",
  "idle_info",
  "demolish_alarm",
  "event",
  "battery_consume",
  "config",
  "store_data",
  "limit_gps_data",
];
const dev_mode = ["standby", "period", "timing", "motion"];
const dev_fix_type = ["work_mode_fix", "down_request_fix"];
function substringBytes(bytes, start, len) {
  const char = [];
  for (let i = 0; i < len; i++) {
    char.push(`0x${bytes[start + i].toString(16)}` < 0x10 ? `0${bytes[start + i].toString(16)}` : bytes[start + i].toString(16));
  }
  return char.join("");
}
function BytestoInt(bytes, start) {
  const value = (bytes[start] << 24) | (bytes[start + 1] << 16) | (bytes[start + 2] << 8) | bytes[start + 3];
  return value;
}
function Decoder(bytes, port) {
  const dev_info = {};
  dev_info.pack_type = packet_type[port - 1];
  // common frame head
  if (port <= 10) {
    dev_info.work_mode = dev_mode[bytes[0] & 0x03];
    dev_info.low_power_state = (bytes[0] >> 2) & 0x01;
    dev_info.demolish_state = (bytes[0] >> 3) & 0x01;
    dev_info.idle_state = (bytes[0] >> 4) & 0x01;
    dev_info.motion_state = (bytes[0] >> 5) & 0x01;
    if (port === 2 || port === 3) {
      dev_info.fix_type = dev_fix_type[(bytes[0] >> 6) & 0x01];
    }

    if (bytes[1] > 0x80) {
      dev_info.temperature = `${bytes[1] - 0x100}°C`;
    } else {
      dev_info.temperature = `${bytes[1]}°C`;
    }

    dev_info.lorawan_downlink_count = bytes[2] & 0x0f;
    dev_info.battery_voltage = `${(22 + ((bytes[2] >> 4) & 0x0f)) / 10}V`;
  }
  if (port === 1) {
    const restart_reason = ["power_restart", "ble_cmd_restart", "lorawan_cmd_restart", "switch_off_mode_restart"];
    dev_info.pre_restart_reason = restart_reason[bytes[3]];

    const ver_major = (bytes[4] >> 6) & 0x03;
    const ver_mijor = (bytes[4] >> 4) & 0x03;
    const ver_patch = bytes[4] & 0x0f;
    dev_info.ver = `V${ver_major}.${ver_mijor}.${ver_patch}`;

    dev_info.motion_count = BytestoInt(bytes, 5);
  } else if (port === 2) {
    const fix_tech = ["wifi", "ble", "gps"];
    let parse_len = 3; // common head is 3 byte
    const datas = [];
    const tech = bytes[parse_len++];
    dev_info.fix_tech = fix_tech[tech];

    const year = bytes[parse_len] * 256 + bytes[parse_len + 1];
    parse_len += 2;
    const mon = bytes[parse_len++];
    const days = bytes[parse_len++];
    const hour = bytes[parse_len++];
    const minute = bytes[parse_len++];
    const sec = bytes[parse_len++];
    const timezone = bytes[parse_len++];

    if (timezone > 0x80) {
      dev_info.utc_time = `${year}-${mon}-${days} ${hour}:${minute}:${sec}  TZ:${timezone - 0x100}`;
    } else {
      dev_info.utc_time = `${year}-${mon}-${days} ${hour}:${minute}:${sec}  TZ:${timezone}`;
    }
    const datalen = bytes[parse_len++];

    if (tech === 0 || tech === 1) {
      for (let i = 0; i < datalen / 7; i++) {
        const data = {};
        data.mac = substringBytes(bytes, parse_len, 6);
        parse_len += 6;
        data.rssi = `${bytes[parse_len++] - 256}dBm`;
        datas.push(data);
      }
      dev_info.mac_data = datas;
    } else {
      let lat = BytestoInt(bytes, parse_len);
      parse_len += 4;
      let lng = BytestoInt(bytes, parse_len);
      parse_len += 4;

      if (lat > 0x80000000) lat -= 0x100000000;
      if (lng > 0x80000000) lng -= 0x100000000;

      dev_info.lat = lat / 10000000;
      dev_info.lng = lng / 10000000;
      lat = dev_info.lat;
      lng = dev_info.lng;
      dev_info.location = { variable: "location", value: `${lat},${lng}`, location: { lat, lng } };
      dev_info.pdop = bytes[parse_len] / 10;
    }
  } else if (port === 3) {
    const fix_false_reason = [
      "wifi_fix_time_timeout",
      "wifi_fix_tech_timeout",
      "wifi_module_nofind",
      "ble_fix_time_timeout",
      "ble_fix_tech_timeout",
      "ble_adv",
      "gps_no_budget",
      "gps_coarse_acc_timeout",
      "gps_fine_acc_timeout",
      "gps_fix_timeout",
      "gps_assistnow_timeout",
      "gps_cold_start_timeout",
      "down_request_fix_interrupt",
      "motion_start_fix_false_by_motion_end",
      "motion_end_fix_false_by_motion_start",
    ];
    let parse_len = 3;
    const datas = [];
    const reason = bytes[parse_len++];
    dev_info.fix_false_reason = fix_false_reason[reason];
    const datalen = bytes[parse_len++];
    if (reason <= 5) {
      // wifi and ble reason
      if (datalen) {
        for (let i = 0; i < datalen / 7; i++) {
          const data = {};
          data.mac = substringBytes(bytes, parse_len, 6);
          parse_len += 6;
          data.rssi = `${bytes[parse_len++] - 256}dBm`;
          datas.push(data);
        }
        dev_info.mac_data = datas;
      }
    } else if (reason <= 11) {
      // gps reason
      const pdop = bytes[parse_len++];
      if (pdop !== 0xff) dev_info.pdop = pdop / 10;
      else dev_info.pdop = "unknow";
      dev_info.gps_satellite_cn = `${bytes[parse_len]}-${bytes[parse_len + 1]}-${bytes[parse_len + 2]}-${bytes[parse_len + 3]}`;
    }
  } else if (port === 4) {
    const sys_close_reason = ["ble_cmd_close", "lorawan_cmd_close", "reed_switch_close"];
    dev_info.sys_close_reason = sys_close_reason[bytes[3]];
  } else if (port === 5) {
    dev_info.shake_num = bytes[3] * 256 + bytes[4];
  } else if (port === 6) {
    dev_info.idle_time = bytes[3] * 256 + bytes[4];
  } else if (port === 7) {
    let parse_len = 3; // common head is 3 byte
    const year = bytes[parse_len] * 256 + bytes[parse_len + 1];
    parse_len += 2;
    const mon = bytes[parse_len++];
    const days = bytes[parse_len++];
    const hour = bytes[parse_len++];
    const minute = bytes[parse_len++];
    const sec = bytes[parse_len++];
    const timezone = bytes[parse_len++];

    if (timezone > 0x80) {
      dev_info.alarm_time = `${year}-${mon}-${days} ${hour}:${minute}:${sec}  TZ:${timezone - 0x100}`;
    } else {
      dev_info.alarm_time = `${year}-${mon}-${days} ${hour}:${minute}:${sec}  TZ:${timezone}`;
    }
  } else if (port === 8) {
    const event = ["motion start", "moving fix start", "motion end", "lorawan downlink trigger uplink"];
    dev_info.event_info = event[bytes[3]];
  } else if (port === 9) {
    let parse_len = 3;
    dev_info.gps_work_time = BytestoInt(bytes, parse_len);
    parse_len += 4;
    dev_info.wifi_work_time = BytestoInt(bytes, parse_len);
    parse_len += 4;
    dev_info.ble_scan_work_time = BytestoInt(bytes, parse_len);
    parse_len += 4;
    dev_info.ble_adv_work_time = BytestoInt(bytes, parse_len);
    parse_len += 4;
    dev_info.lorawan_work_time = BytestoInt(bytes, parse_len);
    parse_len += 4;
  } else if (port === 10) {
    //
  } else if (port === 11) {
    //
  } else if (port === 12) {
    dev_info.work_mode = dev_mode[bytes[0] & 0x03];
    dev_info.low_power_state = bytes[0] & 0x04;
    dev_info.demolish_state = bytes[0] & 0x08;
    dev_info.idle_state = bytes[0] & 0x10;
    dev_info.motion_state = bytes[0] & 0x20;
    dev_info.fix_type = dev_fix_type[(bytes[0] >> 6) & 0x01];

    dev_info.lorawan_downlink_count = bytes[1] & 0x0f;
    dev_info.battery_voltage = `${(22 + ((bytes[2] >> 4) & 0x0f)) / 10}V`;

    let parse_len = 2;
    let lat = BytestoInt(bytes, parse_len);
    parse_len += 4;
    let lng = BytestoInt(bytes, parse_len);
    parse_len += 4;

    if (lat > 0x80000000) lat -= 0x100000000;
    if (lng > 0x80000000) lng -= 0x100000000;

    dev_info.lat = lat / 10000000;
    dev_info.lng = lng / 10000000;
    lat = dev_info.lat;
    lng = dev_info.lng;
    dev_info.location = { variable: "location", value: `${lat},${lng}`, location: { lat, lng } };
    dev_info.pdop = bytes[parse_len] / 10;
  }
  return dev_info;
}

function ToTagoFormat(object_item, serie, prefix = "") {
  const result = [];
  for (const key in object_item) {
    if (typeof object_item[key] === "object") {
      result.push({
        variable: (object_item[key].MessageType || `${prefix}${key}`).toLowerCase(),
        value: object_item[key].value || object_item[key].Value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        unit: object_item[key].unit,
        location: object_item[key].location,
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

const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

// Get the port variable.
const port = payload.find((x) => x.variable === "port" || x.variable === "fport").value;

if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    const payload_aux = ToTagoFormat(Decoder(buffer, port), serie);
    payload = payload.concat(payload_aux.map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
