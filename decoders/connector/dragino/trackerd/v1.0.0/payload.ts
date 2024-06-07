/* eslint-disable unicorn/number-literal-case */
function freqqBandFind(payload) {
  switch (payload[3]) {
    case 0x01:
      return "EU868";
    case 0x02:
      return "US915";
    case 0x03:
      return "IN865";
    case 0x04:
      return "AU915";
    case 0x05:
      return "KZ865";
    case 0x06:
      return "RU864";
    case 0x07:
      return "AS923";
    case 0x08:
      return "AS923_1";
    case 0x09:
      return "AS923_2";
    case 0x0a:
      return "AS923_3";
  }
}

function decodeePort2(payload) {
  const latitude = ((payload[0] << 24) | (payload[1] << 16) | (payload[2] << 8) | payload[3]) / 1_000_000;
  const longitude = ((payload[4] << 24) | (payload[5] << 16) | (payload[6] << 8) | payload[7]) / 1_000_000;
  const location = `${latitude},${longitude}`;

  const alarm = payload[6] & 0x40 ? true : false;
  const battery = ((payload[8] & 0x3f) << 8) | payload[9];
  const mod = (payload[10] & 0xc0) >> 6;
  const led_updown = payload[10] & 0x20 ? "ON" : "OFF";

  const humidity = ((payload[11] << 8) | payload[12]) / 10;
  const temperature = ((payload[13] << 8) | payload[14]) / 10;

  return [
    { variable: "location", value: String(location), location: { lat: String(latitude), lng: String(longitude) } },
    { variable: "alarm", value: alarm },
    { variable: "battery", value: battery, unit: "mV" },
    { variable: "mode_type", value: mod },
    { variable: "led_activity", value: led_updown },
    { variable: "humidity", value: humidity },
    { variable: "temperature", value: temperature },
  ];
}

function decodeePort3(payload) {
  const latitude = ((payload[0] << 24) | (payload[1] << 16) | (payload[2] << 8) | payload[3]) / 1_000_000;
  const longitude = ((payload[4] << 24) | (payload[5] << 16) | (payload[6] << 8) | payload[7]) / 1_000_000;
  const location = `${latitude},${longitude}`;

  const alarm = payload[8] & 0x40 ? true : false;
  const battery = ((payload[8] & 0x3f) << 8) | payload[9];
  const mod = (payload[10] & 0xc0) >> 6;
  const led_updown = payload[10] & 0x20 ? "ON" : "OFF";

  return [
    { variable: "location", value: location, location: { lat: String(latitude), lng: String(longitude) } },
    { variable: "alarm", value: alarm },
    { variable: "battery", value: battery, unit: "mV" },
    { variable: "mode_type", value: mod },
    { variable: "led_activity", value: led_updown },
  ];
}

function decodeePort4(payload) {
  const latitude = ((payload[0] << 24) | (payload[1] << 16) | (payload[2] << 8) | payload[3]) / 1_000_000;
  const longitude = ((payload[4] << 24) | (payload[5] << 16) | (payload[6] << 8) | payload[7]) / 1_000_000;
  const location = `${latitude},${longitude}`;

  const year: number = (payload[8] << 8) | payload[9];
  const month: string = payload[10];
  const day: string = payload[11];
  const hour: string = payload[12];
  const minute: string = payload[13];
  const second: string = payload[14];

  const date = `${("0" + day).slice(-2)}:${("0" + month).slice(-2)}:${year}`;
  const time = `${("0" + hour).slice(-2)}:${("0" + minute).slice(-2)}:${("0" + second).slice(-2)}`;

  return [
    { variable: "location", value: location, location: { lat: String(latitude), lng: String(longitude) } },
    { variable: "date", value: date },
    { variable: "time", value: time },
  ];
}

function decodeePort5(payload) {
  const sensor_model = payload[0] == 0x13 ? "TrackerD" : "";
  const firmware_version = `${payload[1]}.${payload[2] >> 4}.${payload[2] >> 8}`;
  const frequency_band = freqqBandFind(payload);
  const sub_band = payload[4] == 0xff ? "NULL" : payload[4];
  const battery = (payload[5] << 8) | payload[6];
  const smod = (payload[7] >> 6) & 0x3f;
  let sensor_mode = "NULL";

  if (smod == 1) {
    sensor_mode = "GPS";
  } else if (smod == 2) {
    sensor_mode = "BLE";
  } else if (smod == 3) {
    sensor_mode = "GPS+BLE";
  }

  const gps_mode = (payload[7] >> 4) & 0x03;
  const ble_mod = payload[7] & 0x0f;
  const ack_mode = payload[8] & 0x04;
  const led_activity = (payload[8] >> 1) & 0x01 ? "ON" : "OFF";
  const transport_mode = payload[8] & 0x01;

  return [
    { variable: "sensor_model", value: sensor_model },
    { variable: "firmware_version", value: firmware_version },
    { variable: "frequency_band", value: frequency_band },
    { variable: "sub_band", value: sub_band },
    { variable: "battery", value: battery, unit: "mV" },
    { variable: "sensor_mode", value: sensor_mode },
    { variable: "gps_mode", value: gps_mode },
    { variable: "ble_mod", value: ble_mod },
    { variable: "ack_mode", value: ack_mode },
    { variable: "led_activity", value: led_activity },
    { variable: "transport_mode", value: transport_mode },
  ];
}

function decodeePort6(payload) {
  const slicedArray = payload.slice(0, 16);
  const universally_unique_identifier = slicedArray.toString("hex");

  const alarm = payload[30] & 0x40 ? true : false;
  const battery = ((payload[30] & 0x3f) << 8) | payload[31];
  const mod = (payload[32] & 0xc0) >> 6;
  const led_updown = payload[32] & 0x20 ? "ON" : "OFF";

  const ibeacon_major = (payload[16] << 24) | (payload[17] << 16) | (payload[18] << 8) | payload[19];
  const ibeacon_minor = (payload[20] << 24) | (payload[21] << 16) | (payload[22] << 8) | payload[23];
  const ibeacon_power = (payload[24] << 8) | payload[25];
  const received_signal_strength_indication = (payload[26] << 24) | (payload[27] << 16) | (payload[28] << 8) | payload[29];

  return [
    { variable: "universally_unique_identifier", value: universally_unique_identifier },
    { variable: "ibeacon_major", value: ibeacon_major },
    { variable: "ibeacon_minor", value: ibeacon_minor },
    { variable: "ibeacon_power", value: ibeacon_power },
    { variable: "received_signal_strength_indication", value: received_signal_strength_indication },
    { variable: "alarm", value: alarm },
    { variable: "battery", value: battery, unit: "mV" },
    { variable: "mode_type", value: mod },
    { variable: "led_activity", value: led_updown },
  ];
}

function decodeePort8(payload) {
  const slicedArray = payload.slice(0, 6);
  const service_set_identifier = slicedArray.toString("hex");
  const received_signal_strength_indication = (payload[6] << 24) >> 24;
  const alarm = payload[7] & 0x40 ? true : false; //Alarm status
  const battery = (((payload[7] & 0x3f) << 8) | payload[8]) / 1000; //Battery,units:V
  const mod = (payload[9] & 0xc0) >> 6;
  const led_updown = payload[9] & 0x20 ? "ON" : "OFF"; //LED status for position,uplink and downlink

  return [
    { variable: "service_set_identifier", value: service_set_identifier },
    { variable: "received_signal_strength_indication", value: received_signal_strength_indication },
    { variable: "alarm", value: alarm },
    { variable: "battery", value: battery, unit: "mV" },
    { variable: "mode_type", value: mod },
    { variable: "led_activity", value: led_updown },
  ];
}

function trackerdDecoder(payload, port) {
  switch (port) {
    // Realtime GNSS Positioning + Temperature & Humidity
    case 0x02:
      if (payload.length == 15) {
        return decodeePort2(payload);
      }
      throw new Error("Incorrect hexadecimal payload length in port 2");
    // Realtime GNSS Positioning (Default Mode)
    case 0x03:
      if (payload.length == 11) {
        return decodeePort3(payload);
      }
      throw new Error("Incorrect hexadecimal payload length in port 3");
    // History GNSS Positioning
    case 0x04:
      if (payload.length == 15) {
        return decodeePort4(payload);
      }
      throw new Error("Incorrect hexadecimal payload length in port 4");
    // Device Status
    case 0x05:
      if (payload.length == 9) {
        return decodeePort5(payload);
      }
      throw new Error("Incorrect hexadecimal payload length in port 5");
    // BLE Positioning with Strongest iBeacon
    case 0x06:
      if (payload.length == 33) {
        return decodeePort6(payload);
      }
      throw new Error("Incorrect hexadecimal payload length in port 6");
    // WiFi Positioning with Strongest WiFi SSID（Since firmware 1.4.1）
    case 0x08:
      if (payload.length == 13) {
        return decodeePort8(payload);
      }
      throw new Error("Incorrect hexadecimal payload length in port 8");
    default:
      throw new Error("Unknown port");
  }
}

const trackerdPayloadData = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const trackerdPort = payload.find((x) => x.variable === "fport" || x.variable === "port");

if (trackerdPayloadData && trackerdPort) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(trackerdPayloadData?.value, "hex");
    const decodedtrackerdPayload = trackerdDecoder(buffer, trackerdPort?.value);
    const group = Date.now();
    payload = decodedtrackerdPayload?.map((x) => ({ ...x, group })) ?? [];
  } catch (error: any) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
