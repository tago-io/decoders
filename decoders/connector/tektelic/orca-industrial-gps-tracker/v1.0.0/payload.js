/* This is an generic payload parser example.
 ** The code find the payload variable and parse it if exists.
 **
 ** IMPORTANT: In most case, you will only need to edit the parsePayload function.
 **
 ** Testing:
 ** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
 ** [{ variable: 'payload', value: '00 67 FF FF 01 BA 63 00 06 00 00 71 02 44 00 46 03 3E 00 88 3E 50 B0 BC 02 2D 60 08 2A'.replace(/ /g, '') }]
 **
 ** The ignore_vars variable in this code should be used to ignore variables
 ** from the device that you don't want.
 */

// let payload = [
//   {
//     id: "63e54c27ce6cbd0009d71abe",
//     origin: "63c072304659fa0009e46eb5",
//     serie: "1675971623799",
//     time: "2023-02-09T19:40:23.805Z",
//     value: 10,
//     variable: "port",
//     group: "1675971623799",
//   },
//   {
//     id: "63c0c6304659fa0009ebf840",
//     origin: "63c072304659fa0009e46eb5",
//     serie: "1673578032830",
//     time: "2023-01-13T02:47:12.836Z",
//     value: "00881baf0743f80faa01bd",
//     variable: "payload",
//     device: "63c072304659fa0009e46eb5",
//     group: "1673578032830",
//   },
// ];
const ignore_vars = [];

let beacon_decoder = device.params.find((x) => x.key === "beacon_decoder");
beacon_decoder = beacon_decoder && beacon_decoder.value === "simple" ? "simple" : null;

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

function transformLatLngToLocation(fields, serie, prefix = "") {
  if ((fields.latitude && fields.longitude) || (fields.lat && fields.lng)) {
    const lat = fields.lat || fields.latitude;
    const lng = fields.lng || fields.longitude;

    // Change to TagoIO format.
    // Using variable "location".
    const variable = {
      variable: `${prefix}location`,
      value: `${lat}, ${lng}`,
      location: { lat, lng },
      serie,
    };

    delete fields.latitude; // remove latitude so it's not parsed later
    delete fields.longitude; // remove latitude so it's not parsed later
    delete fields.lat; // remove latitude so it's not parsed later
    delete fields.lng; // remove latitude so it's not parsed later

    return variable;
  }
  return null;
}

function Decoder(bytes, port) {
  // bytes - Array of bytes
  function slice(a, f, t) {
    const res = [];
    for (let i = 0; i < t - f; i++) {
      res[i] = a[f + i];
    }
    return res;
  }

  function extract_bytes(chunk, start_bit, end_bit) {
    const total_bits = end_bit - start_bit + 1;
    const total_bytes = total_bits % 8 === 0 ? to_uint(total_bits / 8) : to_uint(total_bits / 8) + 1;
    const offset_in_byte = start_bit % 8;
    const end_bit_chunk = total_bits % 8;
    const arr = new Array(total_bytes);
    for (byte = 0; byte < total_bytes; ++byte) {
      const chunk_idx = to_uint(start_bit / 8) + byte;
      let lo = chunk[chunk_idx] >> offset_in_byte;
      let hi = 0;
      if (byte < total_bytes - 1) {
        hi = (chunk[chunk_idx + 1] & ((1 << offset_in_byte) - 1)) << (8 - offset_in_byte);
      } else if (end_bit_chunk !== 0) {
        // Truncate last bits
        lo &= (1 << end_bit_chunk) - 1;
      }
      arr[byte] = hi | lo;
    }
    return arr;
  }

  function apply_data_type(bytes, data_type) {
    output = 0;
    if (data_type === "unsigned") {
      for (var i = 0; i < bytes.length; ++i) {
        output = to_uint(output << 8) | bytes[i];
      }
      return output;
    }
    if (data_type === "signed") {
      for (var i = 0; i < bytes.length; ++i) {
        output = (output << 8) | bytes[i];
      }
      // Convert to signed, based on value size
      if (output > Math.pow(2, 8 * bytes.length - 1)) {
        output -= Math.pow(2, 8 * bytes.length);
      }
      return output;
    }
    if (data_type === "bool") {
      return !(bytes[0] === 0);
    }
    if (data_type === "hexstring") {
      return toHexString(bytes);
    }
    // Incorrect data type
    return null;
  }

  function decode_field(chunk, start_bit, end_bit, data_type) {
    chunk_size = chunk.length;
    if (end_bit >= chunk_size * 8) {
      return null; // Error: exceeding boundaries of the chunk
    }
    if (end_bit < start_bit) {
      return null; // Error: invalid input
    }
    arr = extract_bytes(chunk, start_bit, end_bit);
    return apply_data_type(arr, data_type);
  }

  let decoded_data = {};
  let decoder = [];

  if (port === 10) {
    decoder = [
      {
        key: [0x00, 0xba],
        fn(arg) {
          decoded_data.battery1_status_life = 2.5 + decode_field(arg, 0, 6, "unsigned") * 0.01;
          decoded_data.battery1_status_eos_alert = decode_field(arg, 7, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x01, 0xba],
        fn(arg) {
          decoded_data.battery2_status_life = 2.5 + decode_field(arg, 0, 6, "unsigned") * 0.01;
          decoded_data.battery2_status_eos_alert = decode_field(arg, 7, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x02, 0xba],
        fn(arg) {
          decoded_data.battery3_status_life = 2.5 + decode_field(arg, 0, 6, "unsigned") * 0.01;
          decoded_data.battery3_status_eos_alert = decode_field(arg, 7, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x00, 0x85],
        fn(arg) {
          const year = decode_field(arg, 0, 15, "unsigned");
          const month = decode_field(arg, 16, 23, "unsigned");
          const day = decode_field(arg, 24, 31, "unsigned");
          const hour = decode_field(arg, 32, 39, "unsigned");
          const minute = decode_field(arg, 40, 47, "unsigned");
          const second = decode_field(arg, 48, 55, "unsigned");
          decoded_data.timestamp = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

          return 7;
        },
      },
      {
        key: [0x00, 0x92],
        fn(arg) {
          const ground_speed = decode_field(arg, 0, 15, "unsigned") * 0.1;
          decoded_data.ground_speed = Math.round(ground_speed * 10) / 10;
          return 2;
        },
      },
      {
        key: [0x00, 0x88],
        fn(arg) {
          decoded_data.latitude = decode_field(arg, 0, 23, "signed") * 0.0000125;
          decoded_data.longitude = decode_field(arg, 24, 55, "signed") * 0.0000001;
          decoded_data.altitude = decode_field(arg, 56, 71, "signed") * 0.5;
          return 9;
        },
      },
      {
        key: [0x00, 0x04],
        fn(arg) {
          decoded_data.fsm_state = decode_field(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x00, 0x06],
        fn(arg) {
          decoded_data.fix_status_time = decode_field(arg, 0, 0, "unsigned");
          decoded_data.fix_status_position = decode_field(arg, 1, 1, "unsigned");
          return 1;
        },
      },
      {
        key: [0x01, 0x06],
        fn(arg) {
          decoded_data.geofence_status_one = decode_field(arg, 4, 7, "unsigned");
          decoded_data.geofence_status_two = decode_field(arg, 0, 3, "unsigned");
          decoded_data.geofence_status_three = decode_field(arg, 12, 15, "unsigned");
          decoded_data.geofence_status_four = decode_field(arg, 8, 11, "unsigned");
          return 2;
        },
      },
      {
        key: [0x00, 0x67],
        fn(arg) {
          decoded_data.mcu_temperature = decode_field(arg, 0, 15, "signed") * 0.1;
          return 2;
        },
      },
      {
        key: [0x00, 0x00],
        fn(arg) {
          decoded_data.acceleration_alarm = decode_field(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x00, 0x71],
        fn(arg) {
          decoded_data.acceleration_xaxis = decode_field(arg, 0, 15, "signed") * 0.001;
          decoded_data.acceleration_yaxis = decode_field(arg, 16, 31, "signed") * 0.001;
          decoded_data.acceleration_zaxis = decode_field(arg, 32, 47, "signed") * 0.001;
          return 6;
        },
      },
    ];
  }
  if (port === 100) {
    decoder = [
      {
        key: [0x00],
        fn(arg) {
          decoded_data.device_eui = decode_field(arg, 0, 63, "hexstring");
          return 8;
        },
      },
      {
        key: [0x01],
        fn(arg) {
          decoded_data.app_eui = decode_field(arg, 0, 63, "hexstring");
          return 8;
        },
      },
      {
        key: [0x02],
        fn(arg) {
          decoded_data.app_key = decode_field(arg, 0, 127, "hexstring");
          return 16;
        },
      },
      {
        key: [0x03],
        fn(arg) {
          decoded_data.device_address = decode_field(arg, 0, 31, "hexstring");
          return 4;
        },
      },
      {
        key: [0x04],
        fn(arg) {
          decoded_data.network_session_key = decode_field(arg, 0, 127, "hexstring");
          return 16;
        },
      },
      {
        key: [0x05],
        fn(arg) {
          decoded_data.app_session_key = decode_field(arg, 0, 127, "hexstring");
          return 16;
        },
      },
      {
        key: [0x10],
        fn(arg) {
          decoded_data.loramac_join_mode = decode_field(arg, 7, 7, "unsigned");
          return 2;
        },
      },
      {
        key: [0x11],
        fn(arg) {
          decoded_data.loramac_opts_confirm_mode = decode_field(arg, 8, 8, "unsigned");
          decoded_data.loramac_opts_sync_word = decode_field(arg, 9, 9, "unsigned");
          decoded_data.loramac_opts_duty_cycle = decode_field(arg, 10, 10, "unsigned");
          decoded_data.loramac_opts_adr = decode_field(arg, 11, 11, "unsigned");
          return 2;
        },
      },
      {
        key: [0x12],
        fn(arg) {
          decoded_data.loramac_dr_tx_dr_number = decode_field(arg, 0, 3, "unsigned");
          decoded_data.loramac_dr_tx_tx_power_number = decode_field(arg, 8, 11, "unsigned");
          return 2;
        },
      },
      {
        key: [0x13],
        fn(arg) {
          decoded_data.loramac_rx2_frequency = decode_field(arg, 0, 31, "unsigned");
          decoded_data.loramac_rx2_dr_number = decode_field(arg, 32, 39, "unsigned");
          return 5;
        },
      },
      {
        key: [0x20],
        fn(arg) {
          decoded_data.seconds_per_core_tick = decode_field(arg, 0, 31, "unsigned");
          return 4;
        },
      },
      {
        key: [0x21],
        fn(arg) {
          decoded_data.tick_per_battery = decode_field(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x22],
        fn(arg) {
          decoded_data.tick_per_gps_stillness = decode_field(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x23],
        fn(arg) {
          decoded_data.tick_per_gps_mobility = decode_field(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x24],
        fn(arg) {
          decoded_data.tick_per_accelerometer = decode_field(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x25],
        fn(arg) {
          decoded_data.tick_per_ble_default = decode_field(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x26],
        fn(arg) {
          decoded_data.tick_per_ble_stillness = decode_field(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x27],
        fn(arg) {
          decoded_data.tick_per_ble_mobility = decode_field(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x28],
        fn(arg) {
          decoded_data.tick_per_temperature = decode_field(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x2a],
        fn(arg) {
          decoded_data.mode_reed_event_type = decode_field(arg, 7, 7, "unsigned");
          decoded_data.mode_battery_voltage_report = decode_field(arg, 8, 8, "unsigned");
          decoded_data.mode_acceleration_vector_report = decode_field(arg, 9, 9, "unsigned");
          decoded_data.mode_temperature_report = decode_field(arg, 10, 10, "unsigned");
          decoded_data.mode_ble_report = decode_field(arg, 11, 11, "unsigned");
          return 2;
        },
      },
      {
        key: [0x2b],
        fn(arg) {
          decoded_data.event_type1_m_value = decode_field(arg, 0, 3, "unsigned");
          decoded_data.event_type1_n_value = decode_field(arg, 4, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x2c],
        fn(arg) {
          decoded_data.event_type2_t_value = decode_field(arg, 0, 3, "unsigned");
          return 1;
        },
      },
      {
        key: [0x30],
        fn(arg) {
          decoded_data.gps_enabled = decode_field(arg, 7, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x31],
        fn(arg) {
          decoded_data.speed_threshold_mobility = decode_field(arg, 0, 7, "unsigned") * 0.1;
          decoded_data.speed_threshold_stillness = decode_field(arg, 8, 15, "unsigned") * 0.1;
          return 2;
        },
      },
      {
        key: [0x32],
        fn(arg) {
          decoded_data.average_speed_count_mobility = decode_field(arg, 4, 7, "unsigned");
          decoded_data.average_speed_count_stillness = decode_field(arg, 0, 3, "unsigned");
          return 1;
        },
      },
      {
        key: [0x33],
        fn(arg) {
          decoded_data.tx_utc_report_enabled = decode_field(arg, 0, 0, "unsigned");
          decoded_data.tx_coordinate_report_enabled = decode_field(arg, 1, 1, "unsigned");
          decoded_data.tx_fsm_report_enabled = decode_field(arg, 2, 2, "unsigned");
          return 1;
        },
      },
      {
        key: [0x34],
        fn(arg) {
          decoded_data.geofence_definition1_latitude = decode_field(arg, 0, 23, "unsigned") * 0.0000125;
          decoded_data.geofence_definition1_longitude = decode_field(arg, 24, 47, "unsigned") * 0.000025;
          decoded_data.geofence_definition1_radius = decode_field(arg, 48, 63, "unsigned") * 10;
          return 8;
        },
      },
      {
        key: [0x35],
        fn(arg) {
          decoded_data.geofence_definition2_latitude = decode_field(arg, 0, 23, "unsigned") * 0.0000125;
          decoded_data.geofence_definition2_longitude = decode_field(arg, 24, 47, "unsigned") * 0.000025;
          decoded_data.geofence_definition2_radius = decode_field(arg, 48, 63, "unsigned") * 10;
          return 8;
        },
      },
      {
        key: [0x36],
        fn(arg) {
          decoded_data.geofence_definition3_latitude = decode_field(arg, 0, 23, "unsigned") * 0.0000125;
          decoded_data.geofence_definition3_longitude = decode_field(arg, 24, 47, "unsigned") * 0.000025;
          decoded_data.geofence_definition3_radius = decode_field(arg, 48, 63, "unsigned") * 10;
          return 8;
        },
      },
      {
        key: [0x37],
        fn(arg) {
          decoded_data.geofence_definition4_latitude = decode_field(arg, 0, 23, "unsigned") * 0.0000125;
          decoded_data.geofence_definition4_longitude = decode_field(arg, 24, 47, "unsigned") * 0.000025;
          decoded_data.geofence_definition4_radius = decode_field(arg, 48, 63, "unsigned") * 10;
          return 8;
        },
      },
      {
        key: [0x40],
        fn(arg) {
          decoded_data.accelerometer_xaxis_enabled = decode_field(arg, 0, 0, "unsigned");
          decoded_data.accelerometer_yaxis_enabled = decode_field(arg, 1, 1, "unsigned");
          decoded_data.accelerometer_zaxis_enabled = decode_field(arg, 2, 2, "unsigned");
          return 1;
        },
      },
      {
        key: [0x41],
        fn(arg) {
          // }
          decoded_data.sensitivity_accelerometer_sample_rate = decode_field(arg, 0, 2, "unsigned") * 1;
          switch (decoded_data.sensitivity_accelerometer_sample_rate) {
            case 1:
              decoded_data.sensitivity_accelerometer_sample_rate = 1;
              break;
            case 2:
              decoded_data.sensitivity_accelerometer_sample_rate = 10;
              break;
            case 3:
              decoded_data.sensitivity_accelerometer_sample_rate = 25;
              break;
            case 4:
              decoded_data.sensitivity_accelerometer_sample_rate = 50;
              break;
            case 5:
              decoded_data.sensitivity_accelerometer_sample_rate = 100;
              break;
            case 6:
              decoded_data.sensitivity_accelerometer_sample_rate = 200;
              break;
            case 7:
              decoded_data.sensitivity_accelerometer_sample_rate = 400;
              break;
            default:
              // invalid value
              decoded_data.sensitivity_accelerometer_sample_rate = 0;
              break;
          }

          decoded_data.sensitivity_accelerometer_measurement_range = decode_field(arg, 4, 5, "unsigned") * 1;
          switch (decoded_data.sensitivity_accelerometer_measurement_range) {
            case 0:
              decoded_data.sensitivity_accelerometer_measurement_range = 2;
              break;
            case 1:
              decoded_data.sensitivity_accelerometer_measurement_range = 4;
              break;
            case 2:
              decoded_data.sensitivity_accelerometer_measurement_range = 8;
              break;
            case 3:
              decoded_data.sensitivity_accelerometer_measurement_range = 16;
              break;
            default:
              decoded_data.sensitivity_accelerometer_measurement_range = 0;
          }
          return 1;
        },
      },
      {
        key: [0x42],
        fn(arg) {
          decoded_data.acceleration_alarm_threshold_count = decode_field(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x43],
        fn(arg) {
          decoded_data.acceleration_alarm_threshold_period = decode_field(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x44],
        fn(arg) {
          decoded_data.acceleration_alarm_threshold = decode_field(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x45],
        fn(arg) {
          decoded_data.acceleration_alarm_grace_period = decode_field(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x46],
        fn(arg) {
          decoded_data.accelerometer_tx_report_periodic_enabled = decode_field(arg, 0, 0, "unsigned");
          decoded_data.accelerometer_tx_report_alarm_enabled = decode_field(arg, 1, 1, "unsigned");
          return 1;
        },
      },
      {
        key: [0x50],
        fn(arg) {
          decoded_data.ble_mode = decode_field(arg, 7, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x51],
        fn(arg) {
          decoded_data.ble_scan_interval = decode_field(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x52],
        fn(arg) {
          decoded_data.ble_scan_window = decode_field(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x53],
        fn(arg) {
          decoded_data.ble_scan_duration = decode_field(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x54],
        fn(arg) {
          decoded_data.ble_reported_devices = decode_field(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x60],
        fn(arg) {
          decoded_data.temperature_sample_period_idle = decode_field(arg, 0, 31, "unsigned");
          return 4;
        },
      },
      {
        key: [0x61],
        fn(arg) {
          decoded_data.temperature_sample_period_active = decode_field(arg, 0, 31, "unsigned");
          return 4;
        },
      },
      {
        key: [0x62],
        fn(arg) {
          decoded_data.temperature_threshold_high = decode_field(arg, 0, 7, "unsigned");
          decoded_data.temperature_threshold_low = decode_field(arg, 8, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x63],
        fn(arg) {
          decoded_data.temperature_threshold_enabled = decode_field(arg, 0, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x71],
        fn(arg) {
          decoded_data.firmware_version_app_major_version = decode_field(arg, 0, 7, "unsigned");
          decoded_data.firmware_version_app_minor_version = decode_field(arg, 8, 15, "unsigned");
          decoded_data.firmware_version_app_revision = decode_field(arg, 16, 23, "unsigned");
          decoded_data.firmware_version_loramac_major_version = decode_field(arg, 24, 31, "unsigned");
          decoded_data.firmware_version_loramac_minor_version = decode_field(arg, 32, 39, "unsigned");
          decoded_data.firmware_version_loramac_revision = decode_field(arg, 40, 47, "unsigned");
          decoded_data.firmware_version_region = decode_field(arg, 48, 55, "unsigned");
          return 7;
        },
      },
    ];
  }

  if (port === 25) {
    decoder = [
      {
        key: [0x0a],
        fn(arg) {
          // RSSI to beacons
          let count = 0;
          for (let i = 0; i < arg.length * 8; i += 7 * 8) {
            dev_id = decode_field(arg, i, i + 6 * 8 - 1, "hexstring");
            if (beacon_decoder === "simple") {
              dev_id = `${dev_id}_beacon`;
            }
            decoded_data[dev_id] = decode_field(arg, i + 6 * 8, i + 7 * 8 - 1, "signed");
            count += 7;
          }
          return count;
        },
      },
    ];
  }

  bytes = convertToUint8Array(bytes);

  for (let bytes_left = bytes.length; bytes_left > 0; ) {
    let found = false;
    for (let i = 0; i < decoder.length; i++) {
      const item = decoder[i];
      const { key } = item;
      const keylen = key.length;
      header = slice(bytes, 0, keylen);
      // Header in the data matches to what we expect
      if (is_equal(header, key)) {
        const f = item.fn;
        consumed = f(slice(bytes, keylen, bytes.length)) + keylen;
        bytes_left -= consumed;
        bytes = slice(bytes, consumed, bytes.length);
        found = true;
        break;
      }
    }
    if (found) {
      continue;
    }
    // Unable to decode -- headers are not as expected, send raw payload to the application!
    decoded_data = {};
    decoded_data.raw = JSON.stringify(byteToArray(bytes));
    decoded_data.port = port;
    return decoded_data;
  }

  // Converts value to unsigned
  function to_uint(x) {
    return x >>> 0;
  }

  // Checks if two arrays are equal
  function is_equal(arr1, arr2) {
    if (arr1.length != arr2.length) {
      return false;
    }
    for (let i = 0; i != arr1.length; i++) {
      if (arr1[i] != arr2[i]) {
        return false;
      }
    }
    return true;
  }

  function byteToArray(byteArray) {
    arr = [];
    for (let i = 0; i < byteArray.length; i++) {
      arr.push(byteArray[i]);
    }
    return arr;
  }

  function convertToUint8Array(byteArray) {
    arr = [];
    for (let i = 0; i < byteArray.length; i++) {
      arr.push(to_uint(byteArray[i]) & 0xff);
    }
    return arr;
  }

  function toHexString(byteArray) {
    const arr = [];
    for (let i = 0; i < byteArray.length; ++i) {
      arr.push(`0${(byteArray[i] & 0xff).toString(16)}`.slice(-2));
    }
    return arr.join("");
  }

  return decoded_data;
}

// Remove unwanted variables.
payload = payload.filter((x) => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data" || x.variable === "payload_hex");
const port = payload.find((x) => x.variable === "port" || x.variable === "fport" || x.variable === "FPort");

if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, time } = payload_raw;
  let { serie } = payload_raw;
  serie = new Date().getTime();

  // Parse the payload_raw to JSON format (it comes in a String format)

  if (value) {
    let decoded = Decoder(Buffer.from(value.replace(/ /g, ""), "hex"), Number(port.value));

    // Apply simplified beacon version;
    const beacons = Object.keys(decoded).filter((x) => x.includes("_beacon"));
    if (beacons.length) {
      decoded.beacons = {
        variable: "beacons",
        value: beacons.map((x) => `${x.replace("_beacon", "")}: ${decoded[x]}`).join("; "),
        metadata: beacons.reduce((final, x) => {
          final[x.replace("_beacon", "")] = decoded[x];
          return final;
        }, {}),
      };

      decoded = Object.keys(decoded).reduce((final, x) => {
        if (!x.includes("_beacon")) {
          final[x] = decoded[x];
        }

        return final;
      }, {});
    }

    const loc = transformLatLngToLocation(decoded, serie);
    if (loc) {
      payload = payload.concat(loc);
    }

    const timesTamp = decoded.timestamp;
    // Parse the payload_raw to JSON format (it comes in a String format)
    payload = payload.concat(toTagoFormat(decoded, serie)).map((x) => ({ ...x, serie, time: timesTamp }));
  }
}
