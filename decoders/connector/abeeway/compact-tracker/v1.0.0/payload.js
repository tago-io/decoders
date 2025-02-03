/* eslint-disable prettier/prettier */
/* eslint-disable no-bitwise */
/*
 * Abeeway Tracker
 *
 */

function step_size(lo, hi, nbits, nresv) {
  return 1.0 / (((1 << nbits) - 1 - nresv) / (hi - lo));
}
function mt_value_decode(value, lo, hi, nbits, nresv) {
  return (value - nresv / 2) * step_size(lo, hi, nbits, nresv) + lo;
}

let beacon_decoder = device.params.find((x) => x.key === "beacon_decoder");
beacon_decoder = beacon_decoder && beacon_decoder.value === "simple" ? "simple" : null;

function signed_convert(val, bitwidth) {
  const isnegative = val & (1 << (bitwidth - 1));
  const boundary = 1 << bitwidth;
  const minval = -boundary;
  const mask = boundary - 1;
  return isnegative ? minval + (val & mask) : val;
}
function Decoder(bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  // Device Info Not Repeated
  const type = bytes[0];
  if (type === 0x05) {
    // Heartbeat
    let cause = bytes[5];
    if (cause === 0x00) {
      cause = "Default value, no reset was done on the tracker";
    }
    if (cause === 0x01) {
      cause = "Power-On Reset";
    }
    if (cause === 0x02) {
      cause = "Brown-Out Unregulated Domain Reset";
    }
    if (cause === 0x04) {
      cause = "Brown-Out Regulated Domain Reset";
    }
    if (cause === 0x08) {
      cause = "External Pin Reset";
    }
    if (cause === 0x10) {
      cause = "Watchdog Reset";
    }
    if (cause === 0x20) {
      cause = "Lockup Reset";
    }
    if (cause === 0x40) {
      cause = "System Request (application) Reset";
    }
    const mcu_firmware_major_version = bytes[6];
    const mcu_firmware_minor_version = bytes[7];
    let mcu_firmware_iteration = bytes[8].toString();
    mcu_firmware_iteration = mcu_firmware_iteration.concat(mcu_firmware_major_version, mcu_firmware_minor_version);

    const ble_firmware_major_version = bytes[9];
    const ble_firmware_minor_version = bytes[10];
    let ble_firmware_iteration = bytes[11].toString();;
    ble_firmware_iteration = ble_firmware_iteration.concat(ble_firmware_major_version, ble_firmware_minor_version);

    return [
      { variable: "type", value: type },
      { variable: "cause", value: cause },
      { variable: "mcu_firmware_iteration", value: mcu_firmware_iteration },
      { variable: "ble_firmware_iteration", value: ble_firmware_iteration },
    ];
  }
  if (type === 0x03) {
    // Position
    const status = bytes[1];
    const battery = bytes[2];
    let temperature = bytes[3];
    temperature = mt_value_decode(temperature, -44, 85, 8, 0);
    const opt = bytes[4] & 0xf;
    if (opt === 0xb) {
      const age = bytes[5];
      const long_bid0 =
        bytes[6].toString(16) +
        bytes[7].toString(16) +
        bytes[8].toString(16) +
        bytes[9].toString(16) +
        bytes[10].toString(16) +
        bytes[11].toString(16) +
        bytes[12].toString(16) +
        bytes[13].toString(16) +
        bytes[14].toString(16) +
        bytes[15].toString(16) +
        bytes[16].toString(16) +
        bytes[17].toString(16) +
        bytes[18].toString(16) +
        bytes[19].toString(16) +
        bytes[20].toString(16) +
        bytes[21].toString(16);
      const rssi0 = bytes[22];
      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "age", value: age },
        { variable: "long_bid0", value: long_bid0 },
        { variable: "rssi0", value: signed_convert(rssi0, 8) },
      ];
    }
    if (opt === 0x8) {
      const error = bytes[5];

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "error", value: error },
      ];
    }
    if (opt === 0x0) {
      const age = bytes[5];
      const latitude = (bytes[6] << 16) | (bytes[7] << 8) | bytes[8];
      const longitude = (bytes[9] << 16) | (bytes[10] << 8) | bytes[11];
      const ehpe = bytes[12];
      const encrypted = (bytes[13] << 16) | (bytes[14] << 8) | bytes[15];
      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "age", value: age },
        { variable: "latitude", value: latitude },
        { variable: "longitude", value: longitude },
        { variable: "ehpe", value: ehpe },
        { variable: "encrypted", value: encrypted },
      ];
    }
    if (opt === 0x1) {
      const cause = bytes[5];
      const cn0 = bytes[6];
      const cn1 = bytes[7];
      const cn2 = bytes[8];
      const cn3 = bytes[9];
      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "cause", value: cause },
        { variable: "cn0", value: cn0 },
        { variable: "cn1", value: cn1 },
        { variable: "cn2", value: cn2 },
        { variable: "cn3", value: cn3 },
      ];
    }
    if (opt === 0x3) {
      const v_bat1 = bytes[5];
      const v_bat2 = bytes[6];
      const v_bat3 = bytes[7];
      const v_bat4 = bytes[8];
      const v_bat5 = bytes[9];
      const v_bat6 = bytes[10];
      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "v_bat1", value: v_bat1 },
        { variable: "v_bat2", value: v_bat2 },
        { variable: "v_bat3", value: v_bat3 },
        { variable: "v_bat4", value: v_bat4 },
        { variable: "v_bat5", value: v_bat5 },
        { variable: "v_bat6", value: v_bat6 },
      ];
    }
    if (opt === 0x4) {
      const v_bat1 = bytes[5];
      const v_bat2 = bytes[6];
      const v_bat3 = bytes[7];
      const v_bat4 = bytes[8];
      const v_bat5 = bytes[9];
      const v_bat6 = bytes[10];
      const error = bytes[11];

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "v_bat1", value: v_bat1 },
        { variable: "v_bat2", value: v_bat2 },
        { variable: "v_bat3", value: v_bat3 },
        { variable: "v_bat4", value: v_bat4 },
        { variable: "v_bat5", value: v_bat5 },
        { variable: "v_bat6", value: v_bat6 },
        { variable: "error", value: error },
      ];
    }
    if (opt === 0x09) {
      const age = bytes[5];
      const bssid0 = bytes[6].toString(16) + bytes[7].toString(16) + bytes[8].toString(16) + bytes[9].toString(16) + bytes[10].toString(16) + bytes[11].toString(16);
      const rssi0 = bytes[12];
      const bssid1 = bytes[13].toString(16) + bytes[14].toString(16) + bytes[15].toString(16) + bytes[16].toString(16) + bytes[17].toString(16) + bytes[18].toString(16);
      const rssi1 = bytes[19];
      const bssid2 = bytes[20].toString(16) + bytes[21].toString(16) + bytes[22].toString(16) + bytes[23].toString(16) + bytes[24].toString(16) + bytes[25].toString(16);
      const rssi2 = bytes[26];
      const bssid3 = bytes[27].toString(16) + bytes[28].toString(16) + bytes[29].toString(16) + bytes[30].toString(16) + bytes[31].toString(16) + bytes[32].toString(16);
      const rssi3 = bytes[33];

      if (beacon_decoder === "simple") {
        const beacon = {
          variable: "beacons",
          value: `${bssid0}:${signed_convert(rssi0, 8)};${bssid1}:${signed_convert(rssi1, 8)};${bssid2}:${signed_convert(rssi2, 8)};${bssid3}:${signed_convert(rssi3, 8)}`,
          metada: {
            [bssid0]: rssi0,
            [bssid1]: rssi1,
            [bssid2]: rssi2,
            [bssid3]: rssi3,
          },
        };
        return [
          { variable: "type", value: type },
          { variable: "status", value: status },
          { variable: "battery", value: battery },
          { variable: "temperature", value: temperature },
          { variable: "age", value: age },
          beacon,
        ];
      }

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "age", value: age },
        { variable: "bssid0", value: bssid0 },
        { variable: "rssi0", value: signed_convert(rssi0, 8) },
        { variable: "bssid1", value: bssid1 },
        { variable: "rssi1", value: signed_convert(rssi1, 8) },
        { variable: "bssid2", value: bssid2 },
        { variable: "rssi2", value: signed_convert(rssi2, 8) },
        { variable: "bssid3", value: bssid3 },
        { variable: "rssi3", value: signed_convert(rssi3, 8) },
      ];
    }
    if (opt === 0x07) {
      const age = bytes[5];
      const mac_addr0 = bytes[6].toString(16) + bytes[7].toString(16) + bytes[8].toString(16) + bytes[9].toString(16) + bytes[10].toString(16) + bytes[11].toString(16);
      const rssi0 = bytes[12];
      const mac_addr1 = bytes[13].toString(16) + bytes[14].toString(16) + bytes[15].toString(16) + bytes[16].toString(16) + bytes[17].toString(16) + bytes[18].toString(16);
      const rssi1 = bytes[19];
      const mac_addr2 = bytes[20].toString(16) + bytes[21].toString(16) + bytes[22].toString(16) + bytes[23].toString(16) + bytes[24].toString(16) + bytes[25].toString(16);
      const rssi2 = bytes[26];
      const mac_addr3 = bytes[27].toString(16) + bytes[28].toString(16) + bytes[29].toString(16) + bytes[30].toString(16) + bytes[31].toString(16) + bytes[32].toString(16);
      const rssi3 = bytes[33];

      if (beacon_decoder === "simple") {
        const beacon = {
          variable: "beacons",
          value: `${mac_addr0}:${signed_convert(rssi0, 8)};${mac_addr1}:${signed_convert(rssi1, 8)};${mac_addr2}:${signed_convert(rssi2, 8)};${mac_addr3}:${signed_convert(
            rssi3,
            8
          )}`,
          metada: {
            [mac_addr0]: rssi0,
            [mac_addr1]: rssi1,
            [mac_addr2]: rssi2,
            [mac_addr3]: rssi3,
          },
        };
        return [
          { variable: "type", value: type },
          { variable: "status", value: status },
          { variable: "battery", value: battery },
          { variable: "temperature", value: temperature },
          { variable: "age", value: age },
          beacon,
        ];
      }

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "age", value: age },
        { variable: "mac_addr0", value: mac_addr0 },
        { variable: "rssi0", value: signed_convert(rssi0, 8) },
        { variable: "mac_addr1", value: mac_addr1 },
        { variable: "rssi1", value: signed_convert(rssi1, 8) },
        { variable: "mac_addr2", value: mac_addr2 },
        { variable: "rssi2", value: signed_convert(rssi2, 8) },
        { variable: "mac_addr3", value: mac_addr3 },
        { variable: "rssi3", value: signed_convert(rssi3, 8) },
      ];
    }
    if (opt === 0xa) {
      const age = bytes[5];
      const short_bid0 = bytes[6].toString(16) + bytes[7].toString(16) + bytes[8].toString(16) + bytes[9].toString(16) + bytes[10].toString(16) + bytes[11].toString(16);
      const rssi0 = bytes[12];
      const short_bid1 = bytes[13].toString(16) + bytes[14].toString(16) + bytes[15].toString(16) + bytes[16].toString(16) + bytes[17].toString(16) + bytes[18].toString(16);
      const rssi1 = bytes[19];
      const short_bid2 = bytes[20].toString(16) + bytes[21].toString(16) + bytes[22].toString(16) + bytes[23].toString(16) + bytes[24].toString(16) + bytes[25].toString(16);
      const rssi2 = bytes[26];
      const short_bid3 = bytes[27].toString(16) + bytes[28].toString(16) + bytes[29].toString(16) + bytes[30].toString(16) + bytes[31].toString(16) + bytes[32].toString(16);
      const rssi3 = bytes[33];

      if (beacon_decoder === "simple") {
        const beacon = {
          variable: "beacons",
          value: `${short_bid0}:${signed_convert(rssi0, 8)};${short_bid1}:${signed_convert(rssi1, 8)};${short_bid2}:${signed_convert(rssi2, 8)};${short_bid3}:${signed_convert(
            rssi3,
            8
          )}`,
          metada: {
            [short_bid0]: rssi0,
            [short_bid1]: rssi1,
            [short_bid2]: rssi2,
            [short_bid3]: rssi3,
          },
        };
        return [
          { variable: "type", value: type },
          { variable: "status", value: status },
          { variable: "battery", value: battery },
          { variable: "temperature", value: temperature },
          { variable: "age", value: age },
          beacon,
        ];
      }

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "age", value: age },
        { variable: "short_bid0", value: short_bid0 },
        { variable: "rssi0", value: signed_convert(rssi0, 8) },
        { variable: "short_bid1", value: short_bid1 },
        { variable: "rssi1", value: signed_convert(rssi1, 8) },
        { variable: "short_bid2", value: short_bid2 },
        { variable: "rssi2", value: signed_convert(rssi2, 8) },
        { variable: "short_bid3", value: short_bid3 },
        { variable: "rssi3", value: signed_convert(rssi3, 8) },
      ];
    }
  }
  if (type === 0x0e) {
    // Position
    const status = bytes[1];
    const battery = bytes[2];
    let temperature = bytes[3];
    temperature = mt_value_decode(temperature, -44, 85, 8, 0);
    const opt = bytes[4] & 0xf;
    const age = (bytes[5] << 16) | (bytes[6] << 8) | bytes[7];

    if (opt === 0x0) {
      const flag = bytes[7];
      const latitude = (bytes[8] << 24) | (bytes[9] << 16) | (bytes[10] << 8) | bytes[11];
      const longitude = (bytes[12] << 24) | (bytes[13] << 16) | (bytes[14] << 8) | bytes[15];
      const altitude = (bytes[16] << 8) | bytes[17];
      const ehpe = bytes[18];
      const cog = (bytes[19] << 8) | bytes[20];
      const sog = (bytes[21] << 8) | bytes[22];
      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "age", value: age },
        { variable: "flag", value: flag },
        { variable: "latitude", value: latitude },
        { variable: "longitude", value: longitude },
        { variable: "altitude", value: altitude },
        { variable: "ehpe", value: ehpe },
        { variable: "cog", value: cog },
        { variable: "sog", value: sog },
      ];
    }

    if (opt === 0x1) {
      const cause = bytes[7];
      const cn0 = bytes[8];
      const cn1 = bytes[9];
      const cn2 = bytes[10];
      const cn3 = bytes[11];
      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "cause", value: cause },
        { variable: "cn0", value: cn0 },
        { variable: "cn1", value: cn1 },
        { variable: "cn2", value: cn2 },
        { variable: "cn3", value: cn3 },
      ];
    }

    if (opt === 0x3) {
      const v_bat1 = bytes[7];
      const v_bat2 = bytes[8];
      const v_bat3 = bytes[9];
      const v_bat4 = bytes[10];
      const v_bat5 = bytes[11];
      const v_bat6 = bytes[12];
      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "v_bat1", value: v_bat1 },
        { variable: "v_bat2", value: v_bat2 },
        { variable: "v_bat3", value: v_bat3 },
        { variable: "v_bat4", value: v_bat4 },
        { variable: "v_bat5", value: v_bat5 },
        { variable: "v_bat6", value: v_bat6 },
      ];
    }

    if (opt === 0x4) {
      const v_bat1 = bytes[7];
      const v_bat2 = bytes[8];
      const v_bat3 = bytes[9];
      const v_bat4 = bytes[10];
      const v_bat5 = bytes[11];
      const v_bat6 = bytes[12];
      const error = bytes[13];

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "v_bat1", value: v_bat1 },
        { variable: "v_bat2", value: v_bat2 },
        { variable: "v_bat3", value: v_bat3 },
        { variable: "v_bat4", value: v_bat4 },
        { variable: "v_bat5", value: v_bat5 },
        { variable: "v_bat6", value: v_bat6 },
        { variable: "error", value: error },
      ];
    }
    if (opt === 0x9) {
      const bssid0 = bytes[7].toString(16) + bytes[8].toString(16) + bytes[9].toString(16) + bytes[10].toString(16) + bytes[11].toString(16) + bytes[12].toString(16);
      const rssi0 = bytes[13];
      const bssid1 = bytes[14].toString(16) + bytes[15].toString(16) + bytes[16].toString(16) + bytes[17].toString(16) + bytes[18].toString(16) + bytes[19].toString(16);
      const rssi1 = bytes[20];
      const bssid2 = bytes[21].toString(16) + bytes[22].toString(16) + bytes[23].toString(16) + bytes[24].toString(16) + bytes[25].toString(16) + bytes[26].toString(16);
      const rssi2 = bytes[27];
      const bssid3 = bytes[28].toString(16) + bytes[29].toString(16) + bytes[30].toString(16) + bytes[31].toString(16) + bytes[32].toString(16) + bytes[33].toString(16);
      const rssi3 = bytes[34];

      if (beacon_decoder === "simple") {
        const beacon = {
          variable: "beacons",
          value: `${bssid0}:${signed_convert(rssi0, 8)};${bssid1}:${signed_convert(rssi1, 8)};${bssid2}:${signed_convert(rssi2, 8)};${bssid3}:${signed_convert(rssi3, 8)}`,
          metada: {
            [bssid0]: rssi0,
            [bssid1]: rssi1,
            [bssid2]: rssi2,
            [bssid3]: rssi3,
          },
        };
        return [
          { variable: "type", value: type },
          { variable: "status", value: status },
          { variable: "battery", value: battery },
          { variable: "temperature", value: temperature },
          { variable: "age", value: age },
          beacon,
        ];
      }

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "age", value: age },
        { variable: "bssid0", value: bssid0 },
        { variable: "rssi0", value: signed_convert(rssi0, 8) },
        { variable: "bssid1", value: bssid1 },
        { variable: "rssi1", value: signed_convert(rssi1, 8) },
        { variable: "bssid2", value: bssid2 },
        { variable: "rssi2", value: signed_convert(rssi2, 8) },
        { variable: "bssid3", value: bssid3 },
        { variable: "rssi3", value: signed_convert(rssi3, 8) },
      ];
    }
    if (opt === 0x07) {
      const mac_addr0 = bytes[7].toString(16) + bytes[8].toString(16) + bytes[9].toString(16) + bytes[10].toString(16) + bytes[11].toString(16) + bytes[12].toString(16);
      const rssi0 = bytes[13];
      const mac_addr1 = bytes[14].toString(16) + bytes[15].toString(16) + bytes[16].toString(16) + bytes[17].toString(16) + bytes[18].toString(16) + bytes[19].toString(16);
      const rssi1 = bytes[20];
      const mac_addr2 = bytes[21].toString(16) + bytes[22].toString(16) + bytes[23].toString(16) + bytes[24].toString(16) + bytes[25].toString(16) + bytes[26].toString(16);
      const rssi2 = bytes[27];
      const mac_addr3 = bytes[28].toString(16) + bytes[29].toString(16) + bytes[30].toString(16) + bytes[31].toString(16) + bytes[32].toString(16) + bytes[33].toString(16);
      const rssi3 = bytes[34];

      if (beacon_decoder === "simple") {
        const beacon = {
          variable: "beacons",
          value: `${mac_addr0}:${signed_convert(rssi0, 8)};${mac_addr1}:${signed_convert(rssi1, 8)};${mac_addr2}:${signed_convert(rssi2, 8)};${mac_addr3}:${signed_convert(
            rssi3,
            8
          )}`,
          metada: {
            [mac_addr0]: rssi0,
            [mac_addr1]: rssi1,
            [mac_addr2]: rssi2,
            [mac_addr3]: rssi3,
          },
        };
        return [
          { variable: "type", value: type },
          { variable: "status", value: status },
          { variable: "battery", value: battery },
          { variable: "temperature", value: temperature },
          { variable: "age", value: age },
          beacon,
        ];
      }

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "age", value: age },
        { variable: "mac_addr0", value: mac_addr0 },
        { variable: "rssi0", value: signed_convert(rssi0, 8) },
        { variable: "mac_addr1", value: mac_addr1 },
        { variable: "rssi1", value: signed_convert(rssi1, 8) },
        { variable: "mac_addr2", value: mac_addr2 },
        { variable: "rssi2", value: signed_convert(rssi2, 8) },
        { variable: "mac_addr3", value: mac_addr3 },
        { variable: "rssi3", value: signed_convert(rssi3, 8) },
      ];
    }

    if (opt === 0xa) {
      const short_bid0 = bytes[7].toString(16) + bytes[8].toString(16) + bytes[9].toString(16) + bytes[10].toString(16) + bytes[11].toString(16) + bytes[12].toString(16);
      const rssi0 = bytes[13];
      const short_bid1 = bytes[14].toString(16) + bytes[15].toString(16) + bytes[16].toString(16) + bytes[17].toString(16) + bytes[18].toString(16) + bytes[19].toString(16);
      const rssi1 = bytes[20];
      const short_bid2 = bytes[21].toString(16) + bytes[22].toString(16) + bytes[23].toString(16) + bytes[24].toString(16) + bytes[25].toString(16) + bytes[26].toString(16);
      const rssi2 = bytes[27];
      const short_bid3 = bytes[28].toString(16) + bytes[29].toString(16) + bytes[30].toString(16) + bytes[31].toString(16) + bytes[32].toString(16) + bytes[33].toString(16);
      const rssi3 = bytes[34];

      if (beacon_decoder === "simple") {
        const beacon = {
          variable: "beacons",
          value: `${short_bid0}:${signed_convert(rssi0, 8)};${short_bid1}:${signed_convert(rssi1, 8)};${short_bid2}:${signed_convert(rssi2, 8)};${short_bid3}:${signed_convert(
            rssi3,
            8
          )}`,
          metada: {
            [short_bid0]: rssi0,
            [short_bid1]: rssi1,
            [short_bid2]: rssi2,
            [short_bid3]: rssi3,
          },
        };
        return [
          { variable: "type", value: type },
          { variable: "status", value: status },
          { variable: "battery", value: battery },
          { variable: "temperature", value: temperature },
          { variable: "age", value: age },
          beacon,
        ];
      }

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "age", value: age },
        { variable: "short_bid0", value: short_bid0 },
        { variable: "rssi0", value: signed_convert(rssi0, 8) },
        { variable: "short_bid1", value: short_bid1 },
        { variable: "rssi1", value: signed_convert(rssi1, 8) },
        { variable: "short_bid2", value: short_bid2 },
        { variable: "rssi2", value: signed_convert(rssi2, 8) },
        { variable: "short_bid3", value: short_bid3 },
        { variable: "rssi3", value: signed_convert(rssi3, 8) },
      ];
    }

    if (opt === 0xb) {
      const long_bid0 =
        bytes[7].toString(16) +
        bytes[8].toString(16) +
        bytes[9].toString(16) +
        bytes[10].toString(16) +
        bytes[11].toString(16) +
        bytes[12].toString(16) +
        bytes[13].toString(16) +
        bytes[14].toString(16) +
        bytes[15].toString(16) +
        bytes[16].toString(16) +
        bytes[17].toString(16) +
        bytes[18].toString(16) +
        bytes[19].toString(16) +
        bytes[20].toString(16) +
        bytes[21].toString(16) +
        bytes[22].toString(16);
      const rssi0 = bytes[23];
      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "age", value: age },
        { variable: "long_bid0", value: long_bid0 },
        { variable: "rssi0", value: signed_convert(rssi0, 8) },
      ];
    }
    if (opt === 0x8) {
      const error = bytes[7];

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "error", value: error },
      ];
    }
  }
  if (type === 0x07) {
    const status = bytes[1];
    const battery = bytes[2];
    let temperature = bytes[3];
    temperature = mt_value_decode(temperature, -44, 85, 8, 0);
    const byte5 = bytes[5];

    if (byte5 === 0x01) {
      const active_data = (bytes[6] << 24) | (bytes[7] << 16) | (bytes[8] << 8) | bytes[9];
      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "active_data", value: active_data },
      ];
    }
    if (byte5 === 0x04) {
      const window1 = (bytes[6] << 8) | bytes[7];
      const window2 = (bytes[8] << 8) | bytes[9];
      const window3 = (bytes[10] << 8) | bytes[11];
      const window4 = (bytes[12] << 8) | bytes[13];
      const window5 = (bytes[14] << 8) | bytes[15];
      const window6 = (bytes[16] << 8) | bytes[17];

      const global_counter = (bytes[18] << 24) | (bytes[19] << 16) | (bytes[20] << 8) | bytes[21];
      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "window1", value: window1 },
        { variable: "window2", value: window2 },
        { variable: "window3", value: window3 },
        { variable: "window4", value: window4 },
        { variable: "window5", value: window5 },
        { variable: "window6", value: window6 },
        { variable: "global_counter", value: global_counter },
      ];
    }
    if (byte5 === 0x02) {
      const parameter1 = (bytes[6] << 32) | (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | (bytes[10] << 16);
      const parameter2 = (bytes[11] << 32) | (bytes[12] << 24) | (bytes[13] << 16) | (bytes[14] << 8) | (bytes[15] << 16);
      const parameter3 = (bytes[16] << 32) | (bytes[17] << 24) | (bytes[18] << 16) | (bytes[19] << 8) | (bytes[20] << 16);
      const parameter4 = (bytes[21] << 32) | (bytes[22] << 24) | (bytes[23] << 16) | (bytes[24] << 8) | (bytes[25] << 16);
      const parameter5 = (bytes[26] << 32) | (bytes[27] << 24) | (bytes[28] << 16) | (bytes[29] << 8) | (bytes[30] << 16);

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "parameter1", value: parameter1 },
        { variable: "parameter2", value: parameter2 },
        { variable: "parameter3", value: parameter3 },
        { variable: "parameter4", value: parameter4 },
        { variable: "parameter5", value: parameter5 },
      ];
    }
  }
  if (type === 0x00) {
    const ack = bytes[1];

    return [{ variable: "ack", value: ack }];
  }
  if (type === 0x9) {
    const status = bytes[1];
    const battery = bytes[2];
    let temperature = bytes[3];
    temperature = mt_value_decode(temperature, -44, 85, 8, 0);
    const shutdown_case = bytes[5];

    return [
      { variable: "type", value: type },
      { variable: "status", value: status },
      { variable: "battery", value: battery },
      { variable: "temperature", value: temperature },
      { variable: "shutdown_case", value: shutdown_case },
    ];
  }
  if (type === 0x0a) {
    const status = bytes[1];
    const battery = bytes[2];
    let temperature = bytes[3];
    temperature = mt_value_decode(temperature, -44, 85, 8, 0);
    const event_value = bytes[5];
    if (event_value === 0x02) {
      const x_axis = (bytes[6] << 8) | bytes[7];
      const y_axis = (bytes[8] << 8) | bytes[9];
      const z_axis = (bytes[10] << 8) | bytes[11];

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "event_value", value: event_value },
        { variable: "x_axis", value: x_axis },
        { variable: "y_axis", value: y_axis },
        { variable: "z_axis", value: z_axis },
      ];
    }
    if (event_value === 0x05) {
      const state = bytes[6];
      const max_temperature = bytes[7];
      const min_temperature = bytes[8];
      const high_counter = (bytes[9] << 8) | bytes[10];
      const low_counter = (bytes[11] << 8) | bytes[12];

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "event_value", value: event_value },
        { variable: "state", value: state },
        { variable: "max_temperature", value: max_temperature },
        { variable: "min_temperature", value: min_temperature },
        { variable: "high_counter", value: high_counter },
        { variable: "low_counter", value: low_counter },
      ];
    }

    if (event_value === 0x09) {
      const flags = bytes[6];
      const age = (bytes[7] << 8) | bytes[8];
      const ref_vector_x = (bytes[9] << 8) | bytes[10];
      const ref_vector_y = (bytes[11] << 8) | bytes[12];
      const ref_vector_z = (bytes[13] << 8) | bytes[14];

      const critical_vector_x = (bytes[15] << 8) | bytes[16];
      const critical_vector_y = (bytes[17] << 8) | bytes[18];
      const critical_vector_z = (bytes[19] << 8) | bytes[20];

      const angle = bytes[21];

      return [
        { variable: "type", value: type },
        { variable: "status", value: status },
        { variable: "battery", value: battery },
        { variable: "temperature", value: temperature },
        { variable: "event_value", value: event_value },
        { variable: "flags", value: flags },
        { variable: "age", value: age },
        { variable: "ref_vector_x", value: ref_vector_x },
        { variable: "ref_vector_y", value: ref_vector_y },
        { variable: "ref_vector_z", value: ref_vector_z },
        { variable: "critical_vector_x", value: critical_vector_x },
        { variable: "critical_vector_y", value: critical_vector_y },
        { variable: "critical_vector_z", value: critical_vector_z },
        { variable: "angle", value: angle },
      ];
    }
  }
  return [];
}
const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    const payload_aux = Decoder(buffer);
    payload = payload.concat(payload_aux.map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
