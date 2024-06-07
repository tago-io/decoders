/*
 * Smart Room Sensor (Gen 4)
 */
function signed_convert(val, bitwidth) {
  const isnegative = val & (1 << (bitwidth - 1));
  const boundary = 1 << bitwidth;
  const minval = -boundary;
  const mask = boundary - 1;
  return isnegative ? minval + (val & mask) : val;
}
function Decoder(bytes, port, string_find) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  // Device Info Not Repeated
  const array_result = [];
  if (port === 10) {
    // CO2 Concentration(PressureCompensated)
    if (string_find.search("0be4") !== -1) {
      const result = string_find.search("0be4") / 2 + 2;
      const co2_pressure_compensated = (bytes[result] << 8) | bytes[result + 1];
      array_result.push({ variable: "co2_pressure_compensated", value: co2_pressure_compensated, unit: "ppm" });
    }
    if (string_find.search("0BE4") !== -1) {
      const result = string_find.search("0BE4") / 2 + 2;
      const co2_pressure_compensated = (bytes[result] << 8) | bytes[result + 1];
      array_result.push({ variable: "co2_pressure_compensated", value: co2_pressure_compensated, unit: "ppm" });
    }
    // CO2 Concentration(Raw)
    if (string_find.search("0ee4") !== -1) {
      const result = string_find.search("0be4") / 2 + 2;
      const co2_raw = (bytes[result] << 8) | bytes[result + 1];
      array_result.push({ variable: "co2_raw", value: co2_raw, unit: "ppm" });
    }
    if (string_find.search("0EE4") !== -1) {
      const result = string_find.search("0EE4") / 2 + 2;
      const co2_raw = (bytes[result] << 8) | bytes[result + 1];
      array_result.push({ variable: "co2_raw", value: co2_raw, unit: "ppm" });
    }
    // Atmospheric Pressure
    if (string_find.search("0c73") !== -1) {
      const result = string_find.search("0c73") / 2 + 2;
      const atmospheric_pressure = ((bytes[result] << 8) | bytes[result + 1]) * 0.1;
      array_result.push({ variable: "atmospheric_pressure", value: atmospheric_pressure, unit: "hPa" });
    }
    if (string_find.search("0C73") !== -1) {
      const result = string_find.search("0C73") / 2 + 2;
      const atmospheric_pressure = ((bytes[result] << 8) | bytes[result + 1]) * 0.1;
      array_result.push({ variable: "atmospheric_pressure", value: atmospheric_pressure, unit: "hPa" });
    }
    // Motion (PIR) Event State
    if (string_find.search("0a00") !== -1) {
      const result = string_find.search("0a00") / 2 + 2;
      const motion_event_state = bytes[result];
      array_result.push({ variable: "motion_event_state", value: motion_event_state });
    }
    if (string_find.search("0A00") !== -1) {
      const result = string_find.search("0A00") / 2 + 2;
      const motion_event_state = bytes[result];
      array_result.push({ variable: "motion_event_state", value: motion_event_state });
    }
    // Motion (PIR) Event Count
    if (string_find.search("0d04") !== -1) {
      const result = string_find.search("0d04") / 2 + 2;
      const motion_event_count = (bytes[result] << 8) | bytes[result + 1];
      array_result.push({ variable: "motion_event_count", value: motion_event_count });
    }
    if (string_find.search("0D04") !== -1) {
      const result = string_find.search("0D04") / 2 + 2;
      const motion_event_count = (bytes[result] << 8) | bytes[result + 1];
      array_result.push({ variable: "motion_event_count", value: motion_event_count });
    }
    // Ambient Temperature
    if (string_find.search("0367") !== -1) {
      const result = string_find.search("0367") / 2 + 2;
      const ambient_temperature = (bytes[result] << 8) | bytes[result + 1];
      const temperature = signed_convert(ambient_temperature, 16) * 0.1;
      array_result.push({ variable: "temperature", value: temperature, unit: "°C" });
    }
    // Ambient RH
    if (string_find.search("0468") !== -1) {
      const result = string_find.search("0468") / 2 + 2;
      const relative_humidity = bytes[result] * 0.5;
      array_result.push({ variable: "relative_humidity", value: relative_humidity, unit: "%" });
    }
    // Ambient Light State
    if (string_find.search("0200") !== -1) {
      const result = string_find.search("0200") / 2 + 2;
      const light_state = bytes[result];
      array_result.push({ variable: "light_state", value: light_state });
    }

    // Ambient Light Intensity
    if (string_find.search("1002") !== -1) {
      const result = string_find.search("1002") / 2 + 2;
      const light_intensity = ((bytes[result] << 8) | bytes[result + 1]) * 0.1;
      array_result.push({ variable: "light_intensity", value: light_intensity });
    }
    return array_result;
  }
}

const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data" || x.variable === "payload_hex");
const port = payload.find((x) => x.variable === "port" || x.variable === "fport" || x.variable === "FPort");
if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    const string_find = payload_raw.value;
    const payload_aux = Decoder(buffer, port.value, string_find);
    payload = payload.concat(payload_aux.map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
