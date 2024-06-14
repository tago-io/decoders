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
    /*
    mode_type:
    Example:  (0x60>>6) & 0x3f =1

    Set the format of GPS data uplink link：

    0x00:   Enable uploading on-board Temperature and humidity values
    0x01:   Disable uploading on-board Temperature and humidity values

    Set the format of BLE data uplink link：

    0x01:    BLE Positioning with Strongest iBeacon
    */
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
    { variable: "sensor_model", value: sensor_model, metadata: { firmware_version: firmware_version, frequency_band: frequency_band, sub_band: sub_band } },
    { variable: "battery", value: battery, unit: "mV" },
    { variable: "sensor_mode", value: sensor_mode, metadata: { gps_mode: gps_mode, ble_mod: ble_mod, ack_mode: ack_mode, transport_mode: transport_mode } },
    { variable: "led_activity", value: led_activity },
  ];
}

function decodeePort7(payload) {
  const alarm = payload[0] & 0x40 ? true : false;
  const batV = ((payload[0] & 0x3f) << 8) | payload[1];
  const mod = payload[2] & 0xc0;
  const Lon = payload[2] & 0x20;
  return [
    { variable: "alarm", value: alarm },
    { variable: "battery", value: batV, unit: "mV" },
    { variable: "mode_type", value: mod },
    { variable: "led_activity", value: Lon ? "ON" : "OFF" },
  ];
}

function trackerdlsDecoder(payload, port) {
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
    // Device Status
    case 0x05:
      if (payload.length == 9) {
        return decodeePort5(payload);
      }
      throw new Error("Incorrect hexadecimal payload length in port 5");
    // Alarm information status
    case 0x07:
      if (payload.length == 3) {
        return decodeePort7(payload);
      }
      throw new Error("Incorrect hexadecimal payload length in port 7");
    default:
      throw new Error("Unknown port");
  }
}

const trackerdlsPayloadData = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const trackerdlsPort = payload.find((x) => x.variable === "fport" || x.variable === "port");

if (trackerdlsPayloadData && trackerdlsPort) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(trackerdlsPayloadData?.value, "hex");
    const decodedtrackerdPayload = trackerdlsDecoder(buffer, trackerdlsPort?.value);
    const group = String(Date.now());
    payload = decodedtrackerdPayload?.map((x) => ({ ...x, group })) ?? [];
  } catch (error: any) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
