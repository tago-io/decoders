/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
function decodeStream(payload, type, timestamp) {
  // Init result
  const result = { historics: [], events: [], realTimes: [] };

  // Parse stream
  // const jsonStream = JSON.parse(stream);

  // Get time and payload
  // const time = new Date(jsonStream.data.timestamp * 1000) / 1000;
  const time = new Date(timestamp * 1000) / 1000;
  // const { payload } = jsonStream.data;

  // Save network informations
  result.realTimes.push({ tagRef: "sys_data_payload", timestamp: time, tagValue: String(payload) });
  result.realTimes.push({ tagRef: "sys_data_timestamp", timestamp: time, tagValue: String(time) });
  /* if (jsonStream.data !== undefined) {
    result.realTimes.push({ tagRef: "sys_data_type", timestamp: time, tagValue: String(jsonStream.data.type) });
    result.realTimes.push({ tagRef: "sys_data_raw", timestamp: time, tagValue: String(jsonStream.data.raw) });
  }
  if (jsonStream.metadata !== undefined) {
    result.realTimes.push({ tagRef: "sys_metadata_lastStreamTimestampUtc", timestamp: time, tagValue: String(jsonStream.metadata.lastStreamTimestampUtc) });
    if (jsonStream.metadata.device !== undefined) {
      result.realTimes.push({ tagRef: "sys_device_sn", timestamp: time, tagValue: String(jsonStream.metadata.device.serialNumber) });
      result.realTimes.push({ tagRef: "sys_device_name", timestamp: time, tagValue: String(jsonStream.metadata.device.name) });
    }
    if (jsonStream.metadata.endpoint !== undefined) {
      result.realTimes.push({ tagRef: "sys_endpoint_name", timestamp: time, tagValue: String(jsonStream.metadata.endpoint.name) });
      result.realTimes.push({ tagRef: "sys_endpoint_type", timestamp: time, tagValue: String(jsonStream.metadata.endpoint.type) });
    }
    if (jsonStream.metadata.network !== undefined) {
      result.realTimes.push({ tagRef: "sys_network_port", timestamp: time, tagValue: String(jsonStream.metadata.network.port) });
      result.realTimes.push({ tagRef: "sys_network_linkQuality", timestamp: time, tagValue: String(jsonStream.metadata.network.linkQuality) });
    }
    if (jsonStream.metadata.location !== undefined) {
      result.realTimes.push({ tagRef: "sys_location_source", timestamp: time, tagValue: String(jsonStream.metadata.location.source) });
      result.realTimes.push({ tagRef: "sys_location_latitude", timestamp: time, tagValue: String(jsonStream.metadata.location.latitude) });
      result.realTimes.push({ tagRef: "sys_location_longitude", timestamp: time, tagValue: String(jsonStream.metadata.location.longitude) });
      result.realTimes.push({ tagRef: "sys_location_accuracy", timestamp: time, tagValue: String(jsonStream.metadata.location.accuracy) });
    }
  } */
  if (type !== 3) {
    // if KHEIRON
    /* if (jsonStream.metadata.endpoint.type === 0) {
      result.realTimes.push({ tagRef: "custom_data_raw_count", timestamp: time, tagValue: String(JSON.parse(jsonStream.data.raw).fcnt) });
    }
    // if SIGFOX
    if (jsonStream.metadata.endpoint.type === 5) {
      result.realTimes.push({ tagRef: "custom_data_raw_count", timestamp: time, tagValue: String(JSON.parse(jsonStream.data.raw).seqNumber) });
    }
    // if OBJENIOUS
    if (jsonStream.metadata.endpoint.type === 6) {
      result.realTimes.push({ tagRef: "custom_data_raw_count", timestamp: time, tagValue: String(JSON.parse(jsonStream.data.raw).count) });
      result.realTimes.push({ tagRef: "custom_data_raw_devEUI", timestamp: time, tagValue: String(JSON.parse(jsonStream.data.raw).device_properties.deveui) });
    }
    */
    // Get message ID
    const msgStr = parseInt(payload.substring(0, 2), 16);

    // Switch message ids
    switch (msgStr) {
      case 1: {
        // Get meter
        const battery = parseInt(payload.substring(2, 6), 16);

        result.realTimes.push({
          tagRef: "p_battery",
          timestamp: time,
          tagValue: String(battery / 1000),
        });

        break;
      }
      case 3: {
        // Get data
        const battery = parseInt(payload.substring(2, 4), 16);
        let temperature = parseInt(payload.substring(4, 8), 16);
        const humidity = parseInt(payload.substring(8, 12), 16);

        // check if negative value
        if (temperature >> 15 === 1) {
          const reverseValue = temperature ^ 65535;
          temperature = (reverseValue + 1) * -1;
        }

        result.realTimes.push({
          tagRef: "p_battery",
          timestamp: time,
          tagValue: String(battery),
        });
        result.realTimes.push({
          tagRef: "p_temperature",
          timestamp: time,
          tagValue: String(temperature / 100),
        });
        result.realTimes.push({
          tagRef: "p_humidity",
          timestamp: time,
          tagValue: String(humidity / 100),
        });
        break;
      }
      case 5: {
        const testCounter = parseInt(payload.substring(2, 4), 16);

        result.realTimes.push({
          tagRef: "p_test",
          timestamp: time,
          tagValue: String(testCounter),
        });

        break;
      }
      case 9: {
        // Get input
        const di = parseInt(payload.substring(4, 6), 16);
        const di1 = (di & 1) === 1;
        const di2 = (di & 2) === 2;

        // get ouput
        const dout = parseInt(payload.substring(2, 4), 16);
        const do1 = (dout & 1) === 1;

        result.realTimes.push({
          tagRef: "p_DI1",
          timestamp: time,
          tagValue: String(di1),
        });

        result.realTimes.push({
          tagRef: "p_DI2",
          timestamp: time,
          tagValue: String(di2),
        });

        result.realTimes.push({
          tagRef: "p_DO1",
          timestamp: time,
          tagValue: String(do1),
        });

        break;
      }
      case 10: {
        // Get input
        const di = parseInt(payload.substring(2, 4), 16);
        const di1 = (di & 4) === 4;
        const di2 = (di & 8) === 8;
        const di3 = (di & 32) === 32;
        const di4 = (di & 128) === 128;

        result.realTimes.push({
          tagRef: "p_DI1",
          timestamp: time,
          tagValue: String(di1),
        });

        result.realTimes.push({
          tagRef: "p_DI2",
          timestamp: time,
          tagValue: String(di2),
        });

        result.realTimes.push({
          tagRef: "p_DI3",
          timestamp: time,
          tagValue: String(di3),
        });

        result.realTimes.push({
          tagRef: "p_DI4",
          timestamp: time,
          tagValue: String(di4),
        });
        break;
      }
      case 11: {
        break;
      }
      case 12: {
        break;
      }
      case 13: {
        break;
      }
      case 14: {
        break;
      }
      case 21: {
        // Get temperature
        let temp = parseInt(payload.substring(2, 6), 16);

        // Decode
        temp = (temp - 33184) / 128;

        result.realTimes.push({
          tagRef: "p_temperature",
          timestamp: time,
          tagValue: String(temp),
        });
        break;
      }
      case 20: {
        // Get meter
        const meter1 = parseInt(payload.substring(4, 12), 16);
        const meter2 = parseInt(payload.substring(12, 20), 16);

        result.realTimes.push({
          tagRef: "p_wirecut",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(2, 4), 16) & 1) === 1),
        });

        result.realTimes.push({
          tagRef: "p_count1",
          timestamp: time,
          tagValue: String(meter1),
        });

        result.realTimes.push({
          tagRef: "p_count2",
          timestamp: time,
          tagValue: String(meter2),
        });
        break;
      }
      case 48: {
        // get realtime meter
        const meter = parseInt(payload.substring(42, 50), 16);
        result.realTimes.push({
          tagRef: "p_count1",
          timestamp: time,
          tagValue: String(meter),
        });

        // get historic meter
        const meter1 = parseInt(payload.substring(34, 42), 16);
        const meter2 = parseInt(payload.substring(26, 34), 16);
        const meter3 = parseInt(payload.substring(18, 26), 16);
        const meter4 = parseInt(payload.substring(10, 18), 16);
        const meter5 = parseInt(payload.substring(2, 10), 16);
        result.historics.push({
          tagRef: "p_count1",
          timestamp: new Date(time * 1000 - 600000 * 1) / 1000,
          tagValue: String(meter1),
        });
        result.historics.push({
          tagRef: "p_count1",
          timestamp: new Date(time * 1000 - 600000 * 2) / 1000,
          tagValue: String(meter2),
        });
        result.historics.push({
          tagRef: "p_count1",
          timestamp: new Date(time * 1000 - 600000 * 3) / 1000,
          tagValue: String(meter3),
        });
        result.historics.push({
          tagRef: "p_count1",
          timestamp: new Date(time * 1000 - 600000 * 4) / 1000,
          tagValue: String(meter4),
        });
        result.historics.push({
          tagRef: "p_count1",
          timestamp: new Date(time * 1000 - 600000 * 5) / 1000,
          tagValue: String(meter5),
        });

        break;
      }
      case 49: {
        // get realtime meter
        const meter = parseInt(payload.substring(2, 10), 16);
        result.realTimes.push({
          tagRef: "p_count1",
          timestamp: time,
          tagValue: String(meter),
        });
        break;
      }
      case 55: {
        result.realTimes.push({
          tagRef: "p_wirecut",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(2, 4), 16) & 1) === 1),
        });
        break;
      }
      case 57: {
        // get realtime meter
        let meter1 = parseInt(payload.substring(2, 7), 16);
        result.realTimes.push({
          tagRef: "p_count1",
          timestamp: time,
          tagValue: String(meter1),
        });

        // get historic meter
        for (let i = 0; i < 5; i++) {
          // remove delta from reference meter
          meter1 -= parseInt(payload.substring(7 + i * 3, 10 + i * 3), 16);

          // const a = new Date(time * 1000);

          // add to historics (remove 10min to the date of the reference meter)
          result.historics.push({
            tagRef: "p_count1",
            timestamp: new Date(time * 1000 - (600000 + i * 600000)) / 1000,
            tagValue: String(meter1),
          });
        }
        break;
      }
      case 58: {
        // get realtime meter
        let meter1 = parseInt(payload.substring(2, 7), 16);
        result.realTimes.push({
          tagRef: "p_count1",
          timestamp: time,
          tagValue: String(meter1),
        });

        // get historic meter
        for (let i = 0; i < 5; i++) {
          // remove delta from reference meter
          meter1 -= parseInt(payload.substring(7 + i * 3, 10 + i * 3), 16);

          // add to historics (remove 10min to the date of the reference meter)
          result.historics.push({
            tagRef: "p_count1",
            timestamp: new Date(time * 1000 - (1800000 + i * 1800000)) / 1000,
            tagValue: String(meter1),
          });
        }
        break;
      }
      case 59: {
        // get realtime meter
        let meter1 = parseInt(payload.substring(2, 7), 16);
        result.realTimes.push({
          tagRef: "p_count1",
          timestamp: time,
          tagValue: String(meter1),
        });

        // get historic meter
        for (let i = 0; i < 5; i++) {
          // remove delta from reference meter
          meter1 -= parseInt(payload.substring(7 + i * 3, 10 + i * 3), 16);

          // add to historics (remove 10min to the date of the reference meter)
          result.historics.push({
            tagRef: "p_count1",
            timestamp: new Date(time * 1000 - (3600000 + i * 3600000)) / 1000,
            tagValue: String(meter1),
          });
        }
        break;
      }
      case 22: {
        // Get meter
        // Get input
        const di = parseInt(payload.substring(2, 4), 16);
        const di1 = (di & 4) === 4;
        const di2 = (di & 8) === 8;
        const di3 = (di & 32) === 32;
        const di4 = (di & 128) === 128;

        result.realTimes.push({
          tagRef: "p_DI1",
          timestamp: time,
          tagValue: String(di1),
        });

        result.realTimes.push({
          tagRef: "p_DI2",
          timestamp: time,
          tagValue: String(di2),
        });

        result.realTimes.push({
          tagRef: "p_DI3",
          timestamp: time,
          tagValue: String(di3),
        });

        result.realTimes.push({
          tagRef: "p_DI4",
          timestamp: time,
          tagValue: String(di4),
        });

        const meter1 = parseInt(payload.substring(4, 12), 16);
        const meter2 = parseInt(payload.substring(12, 20), 16);

        result.realTimes.push({
          tagRef: "p_wirecut",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(4, 6), 16) & 1) === 1),
        });

        result.realTimes.push({
          tagRef: "p_count1",
          timestamp: time,
          tagValue: String(meter1),
        });

        result.realTimes.push({
          tagRef: "p_count2",
          timestamp: time,
          tagValue: String(meter2),
        });
        break;
      }
      case 15: {
        break;
      }
      case 16: {
        break;
      }
      case 17: {
        break;
      }
      case 18: {
        break;
      }
      case 23: {
        // Get temperature & humidity
        let temp = parseInt(payload.substring(2, 6), 16);
        let humidity = parseInt(payload.substring(6, 10), 16);

        // Decode
        temp = (temp * 175.72) / 65536 - 46.85;
        humidity = (humidity * 125) / 65536 - 6;

        result.realTimes.push({
          tagRef: "p_temperature",
          timestamp: time,
          tagValue: String(temp),
        });

        result.realTimes.push({
          tagRef: "p_humidity",
          timestamp: time,
          tagValue: String(humidity),
        });
        break;
      }
      case 24: {
        break;
      }
      case 30: {
        break;
      }
      case 31: {
        break;
      }
      case 32: {
        break;
      }
      case 33: {
        // Get input
        const di = parseInt(payload.substring(2, 4), 16);
        const di1 = (di & 32) === 32;
        const di2 = (di & 16) === 16;

        result.realTimes.push({
          tagRef: "p_DI1",
          timestamp: time,
          tagValue: String(di1),
        });

        result.realTimes.push({
          tagRef: "p_DI2",
          timestamp: time,
          tagValue: String(di2),
        });

        // Get ana
        let ana = parseInt(payload.substring(4, 8), 16);

        // Decode
        ana *= 10 / 64240;

        result.realTimes.push({
          tagRef: "p_voltage",
          timestamp: time,
          tagValue: String(ana),
        });
        break;
      }
      case 25: {
        break;
      }
      case 34: {
        break;
      }
      case 35: {
        break;
      }
      case 36: {
        break;
      }
      case 37: {
        // Get input
        const di = parseInt(payload.substring(2, 4), 16);
        const di1 = (di & 32) === 32;
        const di2 = (di & 16) === 16;

        result.realTimes.push({
          tagRef: "p_DI1",
          timestamp: time,
          tagValue: String(di1),
        });

        result.realTimes.push({
          tagRef: "p_DI2",
          timestamp: time,
          tagValue: String(di2),
        });

        // Get ana
        let ana = parseInt(payload.substring(4, 8), 16);

        // Decode
        ana *= 16 / 47584;
        result.realTimes.push({
          tagRef: "p_current",
          timestamp: time,
          tagValue: String(ana),
        });
        break;
      }
      case 27: {
        break;
      }
      case 42: {
        break;
      }
      case 43: {
        break;
      }
      case 44: {
        break;
      }
      case 45: {
        // Get temperature
        let temp = parseInt(payload.substring(2, 6), 16);

        // check if error
        if (temp !== 32768) {
          // check if negative value
          if (temp >> 15 === 1) {
            const reverseValue = temp ^ 65535;
            temp = (reverseValue + 1) * -1;
          }

          // apply coef
          temp *= 0.0625;

          // save
          result.realTimes.push({
            tagRef: "p_temperature",
            timestamp: time,
            tagValue: String(temp),
          });
        }
        break;
      }
      case 26: {
        break;
      }
      case 38: {
        break;
      }
      case 39: {
        break;
      }
      case 40: {
        break;
      }
      case 41: {
        break;
      }
      case 83: {
        break;
      }
      case 84: {
        break;
      }
      case 85: {
        break;
      }
      case 86: {
        break;
      }
      case 87: {
        break;
      }
      case 88: {
        break;
      }
      case 89: {
        break;
      }
      case 90: {
        break;
      }
      case 91: {
        // Get temperature
        let temp = parseInt(payload.substring(2, 6), 16);
        let temp2 = parseInt(payload.substring(6, 10), 16);

        // check if error
        if (temp !== 32768) {
          // check if negative value
          if (temp >> 15 === 1) {
            const reverseValue = temp ^ 65535;
            temp = (reverseValue + 1) * -1;
          }

          // apply coef
          temp *= 0.0625;

          // save
          result.realTimes.push({
            tagRef: "p_temperature",
            timestamp: time,
            tagValue: String(temp),
          });
        }

        // check if error
        if (temp2 !== 32768) {
          // check if negative value
          if (temp2 >> 15 === 1) {
            const reverseValue = temp ^ 65535;
            temp2 = (reverseValue + 1) * -1;
          }

          // apply coef
          temp2 *= 0.0625;

          // save
          result.realTimes.push({
            tagRef: "p_temperature2",
            timestamp: time,
            tagValue: String(temp2),
          });
        }

        break;
      }
      case 19: {
        // Get water leak state
        const waterleak = parseInt(payload.substring(4, 6), 16);

        // save
        result.realTimes.push({
          tagRef: "p_waterLeak",
          timestamp: time,
          tagValue: String(waterleak),
        });
        break;
      }
      case 47: {
        // get temperature
        const temp = parseInt(payload.substring(14, 18), 16);
        const p_temperature = (10.888 - Math.sqrt((-10.888) ** 2 + 4 * 0.00347 * (1777.3 - temp))) / (2 * -0.00347) + 30;

        // save
        result.realTimes.push({
          tagRef: "p_temperature",
          timestamp: time,
          tagValue: String(p_temperature),
        });

        if (parseInt(payload.substring(18, 34), 16) !== 0) {
          // get data for gps decoding
          const a = parseInt(payload.substring(18, 20), 16) >> 4;
          const b = ((parseInt(payload.substring(18, 20), 16) << 4) & 255) >> 4;
          const c = parseInt(payload.substring(20, 22), 16) >> 4;
          const d = ((parseInt(payload.substring(20, 22), 16) << 4) & 255) >> 4;
          const e = parseInt(payload.substring(22, 24), 16) >> 4;
          const f = ((parseInt(payload.substring(22, 24), 16) << 4) & 255) >> 4;
          const g = parseInt(payload.substring(24, 26), 16) >> 4;
          const h = ((parseInt(payload.substring(24, 26), 16) << 4) & 255) >> 4;
          const i = parseInt(payload.substring(26, 28), 16) >> 4;
          const j = ((parseInt(payload.substring(26, 28), 16) << 4) & 255) >> 4;
          const k = parseInt(payload.substring(28, 30), 16) >> 4;
          const l = ((parseInt(payload.substring(28, 30), 16) << 4) & 255) >> 4;
          const m = parseInt(payload.substring(30, 32), 16) >> 4;
          const n = ((parseInt(payload.substring(30, 32), 16) << 4) & 255) >> 4;
          const o = parseInt(payload.substring(32, 34), 16) >> 4;
          // const p = ((parseInt(payload.substring(32, 34), 16) << 4) & 255) >> 6;
          const q = ((parseInt(payload.substring(32, 34), 16) << 6) & 255) >> 7;
          const r = ((parseInt(payload.substring(32, 34), 16) << 7) & 255) >> 7;
          // get latitude and longitude
          const latitude = (2 * q - 1) * (10 * a + b + c / 6 + d / 60 + e / 600 + f / 6000 + g / 60000);
          const longitude = (2 * r - 1) * (100 * h + 10 * i + j + k / 6 + l / 60 + m / 600 + n / 6000 + o / 60000);

          // save
          result.realTimes.push({
            tagRef: "p_latitude",
            timestamp: time,
            tagValue: String(latitude),
          });
          result.realTimes.push({
            tagRef: "p_longitude",
            timestamp: time,
            tagValue: String(longitude),
          });
        }

        break;
      }
      case 50: {
        const p_vibration = parseInt(payload.substring(4, 6), 16);
        const p_ils = parseInt(payload.substring(6, 8), 16);
        const p_temperature = (2103 - parseInt(payload.substring(8, 12), 16)) / 10.9;

        // save
        result.realTimes.push({
          tagRef: "p_vibration",
          timestamp: time,
          tagValue: String(p_vibration),
        });
        result.realTimes.push({
          tagRef: "p_ils",
          timestamp: time,
          tagValue: String(p_ils),
        });
        result.realTimes.push({
          tagRef: "p_temperature",
          timestamp: time,
          tagValue: String(p_temperature),
        });
        break;
      }
      case 51: {
        // get DI
        result.realTimes.push({
          tagRef: "p_DI1",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(2, 4), 16) & 1) === 1),
        });
        result.realTimes.push({
          tagRef: "p_DI2",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(2, 4), 16) & 2) === 2),
        });
        break;
      }
      case 52: {
        // get DI
        result.realTimes.push({
          tagRef: "p_DI1",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(2, 4), 16) & 1) === 1),
        });
        result.realTimes.push({
          tagRef: "p_DI2",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(2, 4), 16) & 2) === 2),
        });

        // get count
        result.realTimes.push({
          tagRef: "p_count1",
          timestamp: time,
          tagValue: String(parseInt(payload.substring(4, 12), 16)),
        });
        result.realTimes.push({
          tagRef: "p_count2",
          timestamp: time,
          tagValue: String(parseInt(payload.substring(12, 20), 16)),
        });
        break;
      }
      case 53: {
        // get DI
        result.realTimes.push({
          tagRef: "p_DI1",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(2, 4), 16) & 1) === 1),
        });
        result.realTimes.push({
          tagRef: "p_DI2",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(2, 4), 16) & 2) === 2),
        });

        // get ana
        result.realTimes.push({
          tagRef: "p_analogic1",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(6, 10), 16) * 20) / 4095),
        });
        result.realTimes.push({
          tagRef: "p_analogic2",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(10, 14), 16) * 20) / 4095),
        });
        result.realTimes.push({
          tagRef: "p_analogic3",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(14, 18), 16) * 20) / 4095),
        });
        result.realTimes.push({
          tagRef: "p_analogic4",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(18, 22), 16) * 20) / 4095),
        });
        break;
      }
      case 54: {
        // get DI
        result.realTimes.push({
          tagRef: "p_DI1",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(2, 4), 16) & 1) === 1),
        });
        result.realTimes.push({
          tagRef: "p_DI2",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(2, 4), 16) & 2) === 2),
        });

        // get ana
        result.realTimes.push({
          tagRef: "p_analogic1",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(6, 10), 16) * 20) / 4095),
        });
        result.realTimes.push({
          tagRef: "p_analogic2",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(10, 14), 16) * 20) / 4095),
        });
        result.realTimes.push({
          tagRef: "p_analogic3",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(14, 18), 16) * 20) / 4095),
        });
        result.realTimes.push({
          tagRef: "p_analogic4",
          timestamp: time,
          tagValue: String((parseInt(payload.substring(18, 22), 16) * 20) / 4095),
        });
        break;
      }
      case 62: {
        // Get Absence
        result.realTimes.push({
          tagRef: "p_presence",
          timestamp: time,
          tagValue: String(0),
        });

        // get values
        const valueNorV = parseInt(payload.substring(2, 6), 16);
        const valueMorY = parseInt(payload.substring(6, 10), 16);
        const valueWorZ = parseInt(payload.substring(10, 14), 16);

        // Save NorV
        result.realTimes.push({
          tagRef: "p_NorV",
          timestamp: time,
          tagValue: String(valueNorV),
        });

        // Save MorY
        result.realTimes.push({
          tagRef: "p_MorY",
          timestamp: time,
          tagValue: String(valueMorY),
        });

        // Save WorZ
        result.realTimes.push({
          tagRef: "p_WorZ",
          timestamp: time,
          tagValue: String(valueWorZ),
        });
        break;
      }
      case 63: {
        // Get Presence
        result.realTimes.push({
          tagRef: "p_presence",
          timestamp: time,
          tagValue: String(1),
        });

        // get values
        const valueNorV = parseInt(payload.substring(2, 6), 16);
        const valueMorY = parseInt(payload.substring(6, 10), 16);

        // Save NorV
        result.realTimes.push({
          tagRef: "p_NorV",
          timestamp: time,
          tagValue: String(valueNorV),
        });

        // Save MorY
        result.realTimes.push({
          tagRef: "p_MorY",
          timestamp: time,
          tagValue: String(valueMorY),
        });
        break;
      }
      case 65: {
        // get digital input
        const di = parseInt(payload.substring(4, 6) + payload.substring(2, 4), 16);
        // init coef
        let coef = 1;

        for (let i = 1; i < 17; i++) {
          // save
          result.realTimes.push({
            tagRef: `p_DI${i}`,
            timestamp: time,
            tagValue: String((di & coef) === coef),
          });

          coef *= 2;
        }

        // get temperature
        let temp = parseInt(payload.substring(6, 10), 16);

        // check if negative value
        if (temp >> 15 === 1) {
          const reverseValue = temp ^ 65535;
          temp = (reverseValue + 1) * -1;
        }

        // save
        result.realTimes.push({
          tagRef: "p_temperature",
          timestamp: time,
          tagValue: String(temp / 10),
        });

        break;
      }
      case 66: {
        // get digital input
        const di = parseInt(payload.substring(4, 6) + payload.substring(2, 4), 16);

        // init coef
        let coef = 1;

        for (let i = 1; i < 17; i++) {
          // save
          result.realTimes.push({
            tagRef: `p_DI${i}`,
            timestamp: time,
            tagValue: String((di & coef) === coef),
          });

          coef *= 2;
        }

        break;
      }
      case 67: {
        // save
        result.events.push({
          tagRef: "p_choc_alm",
          timestamp: time - 1,
          tagValue: String(1),
          context: [],
        });
        result.events.push({
          tagRef: "p_choc_alm",
          timestamp: time,
          tagValue: String(0),
          context: [],
        });
        break;
      }
      case 78: {
        // get digital input
        const di = parseInt(payload.substring(4, 6) + payload.substring(2, 4), 16);
        // init coef
        let coef = 1;

        for (let i = 1; i < 17; i++) {
          // save
          result.realTimes.push({
            tagRef: `p_DI${i}`,
            timestamp: time,
            tagValue: String((di & coef) === coef),
          });

          // multiply coef by 2
          coef *= 2;
        }

        // get temperature
        let temp = parseInt(payload.substring(6, 10), 16);

        // check if negative value
        if (temp >> 15 === 1) {
          const reverseValue = temp ^ 65535;
          temp = (reverseValue + 1) * -1;
        }

        // save
        result.realTimes.push({
          tagRef: "p_temperature",
          timestamp: time,
          tagValue: String(temp / 10),
        });

        // get count 1
        const count1 = parseInt(payload.substring(10, 18), 16);
        // save
        result.realTimes.push({
          tagRef: "p_count1",
          timestamp: time,
          tagValue: String(count1),
        });
        break;
      }
      case 79: {
        // get digital input
        const di = parseInt(payload.substring(4, 6) + payload.substring(2, 4), 16);
        // init coef
        let coef = 1;

        for (let i = 1; i < 17; i++) {
          // save
          result.realTimes.push({
            tagRef: `p_DI${i}`,
            timestamp: time,
            tagValue: String((di & coef) === coef),
          });

          // multiply coef by 2
          coef *= 2;
        }

        // get count 1
        const count1 = parseInt(payload.substring(6, 14), 16);
        // save
        result.realTimes.push({
          tagRef: "p_count1",
          timestamp: time,
          tagValue: String(count1),
        });

        // get count 2
        const count2 = parseInt(payload.substring(14, 22), 16);
        // save
        result.realTimes.push({
          tagRef: "p_count2",
          timestamp: time,
          tagValue: String(count2),
        });
        break;
      }
      case 80: {
        // get count 1
        const count1 = parseInt(payload.substring(2, 10), 16);
        // save
        result.realTimes.push({
          tagRef: "p_count1",
          timestamp: time,
          tagValue: String(count1),
        });

        // get count 2
        const count2 = parseInt(payload.substring(10, 18), 16);
        // save
        result.realTimes.push({
          tagRef: "p_count2",
          timestamp: time,
          tagValue: String(count2),
        });
        break;
      }
      case 81: {
        // get count 3
        const count3 = parseInt(payload.substring(2, 10), 16);
        // save
        result.realTimes.push({
          tagRef: "p_count3",
          timestamp: time,
          tagValue: String(count3),
        });

        // get count 4
        const count4 = parseInt(payload.substring(10, 18), 16);
        // save
        result.realTimes.push({
          tagRef: "p_count4",
          timestamp: time,
          tagValue: String(count4),
        });
        break;
      }
      case 82: {
        // get digital input
        const di = parseInt(payload.substring(4, 6) + payload.substring(2, 4), 16);
        // init coef
        let coef = 1;

        for (let i = 1; i < 17; i++) {
          // save
          result.realTimes.push({
            tagRef: `p_DI${i}`,
            timestamp: time,
            tagValue: String((di & coef) === coef),
          });

          // multiply coef by 2
          coef *= 2;
        }

        // get count 1
        const count1 = parseInt(payload.substring(6, 14), 16);
        // save
        result.realTimes.push({
          tagRef: "p_count1",
          timestamp: time,
          tagValue: String(count1),
        });
        break;
      }
      case 93: {
        // get digital input
        const di = parseInt(payload.substring(4, 6) + payload.substring(2, 4), 16);
        // init coef
        let coef = 1;

        for (let i = 1; i < 17; i++) {
          // save
          result.realTimes.push({
            tagRef: `p_DI${i}`,
            timestamp: time,
            tagValue: String((di & coef) === coef),
          });

          // multiply coef by 2
          coef *= 2;
        }

        // get temperature
        let temp = parseInt(payload.substring(6, 10), 16);

        // check if negative value
        if (temp >> 15 === 1) {
          const reverseValue = temp ^ 65535;
          temp = (reverseValue + 1) * -1;
        }

        // save
        result.realTimes.push({
          tagRef: "p_temperature",
          timestamp: time,
          tagValue: String(temp / 10),
        });

        for (let j = 1; j < 9; j++) {
          // save
          result.realTimes.push({
            tagRef: `p_count${j}`,
            timestamp: time,
            tagValue: String(parseInt(payload.substring(2 + 8 * j, 10 + 8 * j), 16)),
          });
        }
        break;
      }
      case 94: {
        // get digital input
        const di = parseInt(payload.substring(4, 6) + payload.substring(2, 4), 16);
        // init coef
        let coef = 1;

        for (let i = 1; i < 17; i++) {
          // save
          result.realTimes.push({
            tagRef: `p_DI${i}`,
            timestamp: time,
            tagValue: String((di & coef) === coef),
          });

          // multiply coef by 2
          coef *= 2;
        }

        for (let j = 1; j < 9; j++) {
          // save
          result.realTimes.push({
            tagRef: `p_count${j}`,
            timestamp: time,
            tagValue: String(parseInt(payload.substring(-2 + 8 * j, 6 + 8 * j), 16)),
          });
        }
        break;
      }
      case 95: {
        // get count 5
        const count5 = parseInt(payload.substring(2, 10), 16);
        // save
        result.realTimes.push({
          tagRef: "p_count5",
          timestamp: time,
          tagValue: String(count5),
        });

        // get count 6
        const count6 = parseInt(payload.substring(10, 18), 16);
        // save
        result.realTimes.push({
          tagRef: "p_count6",
          timestamp: time,
          tagValue: String(count6),
        });
        break;
      }
      case 96: {
        // get count 7
        const count7 = parseInt(payload.substring(2, 10), 16);
        // save
        result.realTimes.push({
          tagRef: "p_count7",
          timestamp: time,
          tagValue: String(count7),
        });

        // get count 8
        const count8 = parseInt(payload.substring(10, 18), 16);
        // save
        result.realTimes.push({
          tagRef: "p_count8",
          timestamp: time,
          tagValue: String(count8),
        });
        break;
      }
      case 2:
      case 4:
      case 6:
      case 7:
      case 8:
      case 46:
      case 56:
      case 60:
      case 61:
      case 64:
      case 68:
      case 69:
      case 70:
      case 71:
      case 72:
      case 73:
      case 74:
      case 75:
      case 76:
      case 77:
      case 92:
      case 97:
      case 98:
      case 99:
      default:
        break;
    }
  }
  // Return result
  return result;
}

function ToTagoFormat(object_item, serie) {
  const historics = [];
  const events = [];
  const realTimes = [];
  // eslint-disable-next-line guard-for-in
  for (const key in object_item.realTimes) {
    realTimes.push({
      variable: `realTimes_${object_item.realTimes[key].tagRef}`.toLowerCase(),
      value: object_item.realTimes[key].tagValue,
      time: object_item.realTimes[key].timestamp,
      serie,
    });
  }
  // eslint-disable-next-line guard-for-in
  for (const key in object_item.events) {
    events.push({
      variable: `events_${object_item.events[key].tagRef}`.toLowerCase(),
      value: object_item.events[key].tagValue,
      time: object_item.events[key].timestamp,
      serie,
    });
  }
  // eslint-disable-next-line guard-for-in
  for (const key in object_item.historics) {
    historics.push({
      variable: `historics_${object_item.historics[key].tagRef}`.toLowerCase(),
      value: object_item.historics[key].tagValue,
      time: object_item.historics[key].timestamp,
      serie,
    });
  }
  const result = historics.concat(events, realTimes);

  return result;
}

/* let payload = [
  { variable: "payload", value: "5e7f000000003f00000040000000410000004200000043000000440000004500000046" },
  { variable: "type", value: 0 },
  { variable: "timestamp", value: 1605614318410 },
]; */

const data = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const type = payload.find((x) => x.variable === "type");
const timestamp = payload.find((x) => x.variable === "timestamp");

if (data) {
  // const buffer = Buffer.from(data.value, "hex");
  const serie = new Date().getTime();
  // payload = decodeStream(data.value, type.value, timestamp.value);
  payload = ToTagoFormat(decodeStream(data.value, type.value, timestamp.value), serie);
}

// eslint-disable-next-line no-console
// console.log(payload);
