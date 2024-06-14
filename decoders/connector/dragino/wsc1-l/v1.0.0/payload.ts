/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable unicorn/number-literal-case */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
function freqBandFind(payload) {
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

function decodePort5(payload) {
  const sensorModel = payload[0] == 0x0d ? "WSC1-L" : "";
  const firmwareVersion = `${payload[1]}.${payload[2] >> 4}.${payload[2]}`;
  const frequencyBand = freqBandFind(payload);
  const subBand = payload[4] == 0xff ? "NULL" : payload[4];
  const BAT = ((payload[5] << 8) | payload[6]) / 1000;
  const weatherSensorTypes = String(payload[7].toString(16)) + ("0" + String(payload[8].toString(16))).slice(-2) + String(payload[9].toString(16));
  return [
    {
      variable: "sensor_model",
      value: sensorModel,
    },
    {
      variable: "firmware_version",
      value: firmwareVersion,
    },
    {
      variable: "frequency_band",
      value: frequencyBand,
    },
    {
      variable: "sub_band",
      value: subBand,
    },
    {
      variable: "battery",
      value: BAT,
      unit: "V",
    },
    {
      variable: "weather_sensor_types",
      value: weatherSensorTypes,
    },
  ];
}

// payload format: typecode, length, value (depends on length)
// payload: 0103001402 020302C903 03021190 0402000A 0502021C 060200FA 07020262 08022763 09020000 0A020023 0B02002D 0C0200B3 0D020073
function decodePort2(payload) {
  const direction = { 0: "N", 1: "NNE", 2: "NE", 3: "ENE", 4: "E", 5: "ESE", 6: "SE", 7: "SSE", 8: "S", 9: "SSW", 10: "SW", 11: "WSW", 12: "W", 13: "WNW", 14: "NW", 15: "NNW" };
  const dic = {
    wind_speed: "",
    wind_speed_level: "",
    wind_direction: "",
    wind_direction_angle: "",
    illumination: "",
    rain_snow: "",
    CO2: "",
    TEM: "",
    HUM: "",
    pressure: "",
    rain_gauge: "",
    PM2_5: "",
    PM10: "",
    PAR: "",
    TSR: "",
  };
  const sensor = ["bat", "wind_speed", "wind_direction_angle", "illumination", "rain_snow", "CO2", "TEM", "HUM", "pressure", "rain_gauge", "PM2_5", "PM10", "PAR", "TSR"];
  const sensor_diy = ["A1", "A2", "A3", "A4"];
  //4~7:0->/,1->*,2->NULL
  //3~0:count
  const algorithm = [0x03, 0x01, 0x01, 0x11, 0x20, 0x20, 0x01, 0x01, 0x01, 0x01, 0x20, 0x20, 0x20, 0x01];
  for (let i = 0; i < payload.length; ) {
    const len = payload[i + 1];
    if (payload[i] < 0xa1) {
      const sensor_type = payload[i];
      const operation = algorithm[sensor_type] >> 4;
      const count = algorithm[sensor_type] & 0x0f;

      if (operation === 0) {
        if (sensor_type === 0x06) {
          //TEM
          if (payload[i + 2] & 0x80) {
            dic[sensor[sensor_type]] = (((payload[i + 2] << 8) | payload[i + 3]) - 0xffff) / (count * 10.0);
          } else {
            dic[sensor[sensor_type]] = ((payload[i + 2] << 8) | payload[i + 3]) / (count * 10.0);
          }
        } else {
          dic[sensor[sensor_type]] = ((payload[i + 2] << 8) | payload[i + 3]) / (count * 10.0);
        }

        if (dic[sensor[1]] === 20) {
          dic[sensor[sensor_type]] = "No sensor";
        }

        if (dic[sensor[2]] === 383.8) {
          dic[sensor[sensor_type]] = "No sensor";
        }

        if (dic[sensor[5]] === 5374) {
          dic[sensor[sensor_type]] = "No sensor";
        }

        if (dic[sensor[6]] === 76.6) {
          dic[sensor[sensor_type]] = "No sensor";
        }

        if (dic[sensor[7]] === 102.2) {
          dic[sensor[sensor_type]] = "No sensor";
        }

        if (dic[sensor[8]] === 0) {
          dic[sensor[sensor_type]] = "No sensor";
        }

        if (dic[sensor[9]] === 102.2) {
          dic[sensor[sensor_type]] = "No sensor";
        }
        i;
        if (dic[sensor[10]] === 102.2) {
          dic[sensor[sensor_type]] = "No sensor";
        }
        i;
        if (dic[sensor[11]] === 102.2) {
          dic[sensor[sensor_type]] = "No sensor";
        }

        if (dic[sensor[12]] === 2558) {
          dic[sensor[sensor_type]] = "No sensor";
        }

        if (dic[sensor[13]] === 2022.2) {
          dic[sensor[sensor_type]] = "No sensor";
        }
      } else if (operation === 1) {
        dic[sensor[sensor_type]] = ((payload[i + 2] << 8) | payload[i + 3]) * (count * 10);
      } else {
        if (sensor_type === 0x04) {
          //RAIN_SNOW
          dic[sensor[sensor_type]] = payload[i + 2];
        } else {
          dic[sensor[sensor_type]] = (payload[i + 2] << 8) | payload[i + 3];
        }
      }
      if (dic[sensor[3]] === 202220) {
        dic[sensor[sensor_type]] = "No sensor";
      }
      if (dic[sensor[1]] === 76.6) {
        dic.wind_speed = "No sensor";
        dic.wind_speed_level = "No sensor";
      } else if (sensor_type === 0x01) {
        dic.wind_speed_level = payload[i + 4];
      } else if (sensor_type === 0x02) {
        const values = payload[i + 4];
        dic.wind_direction = direction[values];
      }
    } else {
      dic[sensor_diy[payload[i] - 0xa1]] = (payload[i + 2] << 8) | payload[i + 3];
    }

    i = i + 2 + len;
  }
  return [
    {
      variable: "wind_speed",
      value: dic.wind_speed,
      unit: "m/s",
    },
    {
      variable: "wind_direction_angle",
      value: dic.wind_direction_angle,
      unit: "°",
    },
    {
      variable: "wind_direction",
      value: dic.wind_direction,
    },
    {
      variable: "illumination",
      value: dic.illumination,
      unit: "lux",
    },
    {
      variable: "rain_snow",
      value: dic.rain_snow,
    },
    {
      variable: "carbon_dioxide",
      value: dic.CO2,
      unit: "ppm",
    },
    {
      variable: "temperature",
      value: dic.TEM,
      unit: "°C",
    },
    {
      variable: "humidity",
      value: dic.HUM,
      unit: "%RH",
    },
    {
      variable: "pressure",
      value: dic.pressure,
      unit: "hPa",
    },
    {
      variable: "rain_gauge",
      value: dic.rain_gauge,
      unit: "mm",
    },
    {
      variable: "pm2_5",
      value: dic.PM2_5,
      unit: "µg/m³",
    },
    {
      variable: "pm10",
      value: dic.PM10,
      unit: "µg/m³",
    },
    {
      variable: "par",
      value: dic.PAR,
      unit: "µmol/m²·s",
    },
    {
      variable: "tsr",
      value: dic.TSR,
      unit: "W/m²",
    },
  ];
}

function wsc1lDecoder(payload, port) {
  switch (port) {
    // Real time sensorType value
    case 0x02:
      if (payload.length == 54) {
        return decodePort2(payload);
      }
      throw new Error("Incorrect hexadecimal payload length");
    // Device Status
    case 0x05:
      if (payload.length == 10) {
        return decodePort5(payload);
      }
      throw new Error("Incorrect hexadecimal payload length");
    default:
      throw new Error("Unknown port");
  }
}

const wsc1lPayloadData = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const wsc1lPort = payload.find((x) => x.variable === "fport" || x.variable === "port");

if (wsc1lPayloadData && wsc1lPort) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(wsc1lPayloadData?.value, "hex");
    const decodedwsc1lPayload = wsc1lDecoder(buffer, wsc1lPort?.value);
    const time = Date.now();
    payload = decodedwsc1lPayload?.map((x) => ({ ...x, time })) ?? [];
  } catch (error: any) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
