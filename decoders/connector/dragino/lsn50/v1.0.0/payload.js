function Decoder(bytes) {
  var mode = (bytes[6] & 0x7c) >> 2;
  const decoded = [];
  if (mode != 2) {
    decoded.push({ variable: "BatV", value: ((bytes[0] << 8) | bytes[1]) / 1000, unit: "V" });
    decoded.push({ variable: "TempC1", value: parseFloat(((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(2)), unit: "°C" });
    decoded.push({ variable: "ADC_CH0V", value: ((bytes[4] << 8) | bytes[5]) / 1000, unit: "V" });
    decoded.push({ variable: "Digital_IStatus", value: bytes[6] & 0x02 ? "H" : "L" });
    if (mode != 6) {
      decoded.push({ variable: "EXTI_Trigger", value: bytes[6] & 0x01 ? "TRUE" : "FALSE" });
      decoded.push({ variable: "Door_status", value: bytes[6] & 0x80 ? "CLOSE" : "OPEN" });
    }
  }

  if (mode == "0") {
    decoded.push({ variable: "Work_mode", value: "IIC" });
    if (((bytes[9] << 8) | bytes[10]) === 0) {
      decoded.push({ variable: "Illum", value: ((bytes[7] << 24) >> 16) | bytes[8] });
    } else {
      decoded.push({ variable: "TempC_SHT", value: parseFloat(((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(2)), unit: "°C" });
      decoded.push({ variable: "Hum_SHT", value: parseFloat((((bytes[9] << 8) | bytes[10]) / 10).toFixed(1)), unit: "%" });
    }
  } else if (mode == "1") {
    decoded.push({ variable: "Work_mode", value: "Distance" });
    decoded.push({ variable: "Distance", value: parseFloat((((bytes[7] << 8) | bytes[8]) / 10).toFixed(1)), unit: "cm" });
    if (((bytes[9] << 8) | bytes[10]) != 65535) {
      decoded.push({ variable: "Distance_signal_strength", value: parseFloat(((bytes[9] << 8) | bytes[10]).toFixed(0)) });
    }
  } else if (mode == "2") {
    decoded.push({ variable: "Work_mode", value: "3ADC" });
    decoded.push({ variable: "BatV", value: bytes[11]/10, unit: "V" });
    decoded.push({ variable: "ADC_CH0V", value: ((bytes[0] << 8) | bytes[1]) / 1000, unit: "V" });
    decoded.push({ variable: "ADC_CH1V", value: ((bytes[2] << 8) | bytes[3]) / 1000, unit: "V" });
    decoded.push({ variable: "ADC_CH4V", value: ((bytes[4] << 8) | bytes[5]) / 1000, unit: "V" });
    decoded.push({ variable: "Digital_IStatus", value: bytes[6] & 0x02 ? "H" : "L" });
    decoded.push({ variable: "EXTI_Trigger", value: bytes[6] & 0x01 ? "TRUE" : "FALSE" });
    decoded.push({ variable: "Door_status", value: bytes[6] & 0x80 ? "CLOSE" : "OPEN" });
    if (((bytes[9] << 8) | bytes[10]) === 0) {
      decoded.push({ variable: "Illum", value: ((bytes[7] << 24) >> 16) | bytes[8] });
    } else {
      decoded.push({ variable: "TempC_SHT", value: parseFloat(((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(2)), unit: "°C" });
      decoded.push({ variable: "Hum_SHT", value: parseFloat((((bytes[9] << 8) | bytes[10]) / 10).toFixed(1)), unit: "%" });
    }
  } else if (mode == "3") {
    decoded.push({ variable: "Work_mode", value: "3DS18B20" });
    decoded.push({ variable: "TempC2", value: parseFloat(((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(2)), unit: "°C" });
    decoded.push({ variable: "TempC3", value: parseFloat((((bytes[9] << 8) | bytes[10]) / 10).toFixed(1)), unit: "°C" });
  } else if (mode == "4") {
    decoded.push({ variable: "Work_mode", value: "Weight" });
    decoded.push({ variable: "Weight", value: ((bytes[7] << 24) >> 16) | bytes[8], unit: "g" });
  } else if (mode == "5") {;
    decoded.push({ variable: "Work_mode", value: "Count" });
    decoded.push({ variable: "Count", value: (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10] });
  }

  if (bytes.length == 11 || bytes.length == 12) {
    return decoded;
  }
}

// let payload = [{ variable: "payload", value: "0d320000011500ffffffff" }];

const data = payload.find((x) => x.variable === "payload" || x.variable === "payload_raw" || x.variable === "data");

if (data) {
  const bytes = Buffer.from(data.value, "hex");
  const serie = data.serie || new Date().getTime();
  try {
    payload = payload.concat(Decoder(bytes)).map((x) => ({ ...x, serie }));
  } catch(e) {
    payload = payload.concat({ variable: "parser_error", value: e.message || e });
  }
}

// console.log(payload);
