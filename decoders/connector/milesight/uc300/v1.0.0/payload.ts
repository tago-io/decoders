/* eslint-disable unicorn/prefer-array-some */
/* eslint-disable unicorn/number-literal-case */
/* eslint-disable unicorn/numeric-separators-style */
// eslint-disable-next-line unicorn/prefer-set-has
const gpio_in_chns = [0x03, 0x04, 0x05, 0x06];
const gpio_out_chns = [0x07, 0x08];
const pt100_chns = [0x09, 0x0a];
const ai_chns = [0x0b, 0x0c];
const av_chns = [0x0d, 0x0e];

function milesightUC300(bytes: any) {
  const decoded: any = [];

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];

    // PROTOCOL VESION
    if (channel_id === 0xff && channel_type === 0x01) {
      // if the variable device_information already exists, just add it to the metadata, esle create the variable.
      if (decoded.find((x) => x.variable === "device_information")) {
        decoded.find((x) => x.variable === "device_information").metadata["protocol_version"] = bytes[i];
      } else {
        decoded.push({
          variable: "device_information",
          value: "true",
          metadata: { protocol_version: bytes[i] },
        });
      }
      i += 1;
    }
    // POWER ON
    else if (channel_id === 0xff && channel_type === 0x0b) {
      // if the variable device_information already exists, just add it to the metadata, esle create the variable.
      if (decoded.find((x) => x.variable === "device_information")) {
        decoded.find((x) => x.variable === "device_information").metadata["power"] = "on";
      } else {
        decoded.push({
          variable: "device_information",
          value: "true",
          metadata: { power: "on" },
        });
      }
      i += 1;
    }
    // SERIAL NUMBER
    else if (channel_id === 0xff && channel_type === 0x16) {
      // if the variable device_information already exists, just add it to the metadata, esle create the variable.
      if (decoded.find((x) => x.variable === "device_information")) {
        decoded.find((x) => x.variable === "device_information").metadata["serial_number"] = rreadSerialNumber(bytes.slice(i, i + 8));
      } else {
        decoded.push({
          variable: "device_information",
          value: "true",
          metadata: {
            serial_number: rreadSerialNumber(bytes.slice(i, i + 8)),
          },
        });
      }
      i += 8;
    }
    // HARDWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x09) {
      // if the variable device_information already exists, just add it to the metadata, esle create the variable.
      if (decoded.find((x) => x.variable === "device_information")) {
        decoded.find((x) => x.variable === "device_information").metadata["hardware_version"] = rreadHardwareVersion(bytes.slice(i, i + 2));
      } else {
        decoded.push({
          variable: "device_information",
          value: "true",
          metadata: {
            hardware_version: rreadHardwareVersion(bytes.slice(i, i + 2)),
          },
        });
      }
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x0a) {
      // if the variable device_information already exists, just add it to the metadata, esle create the variable.
      if (decoded.find((x) => x.variable === "device_information")) {
        decoded.find((x) => x.variable === "device_information").metadata["firmware_version"] = rreadFirmwareVersion(bytes.slice(i, i + 2));
      } else {
        decoded.push({
          variable: "device_information",
          value: "true",
          metadata: {
            firmware_version: rreadFirmwareVersion(bytes.slice(i, i + 2)),
          },
        });
      }
      i += 2;
    }
    // GPIO INPUT
    else if (iincludes(gpio_in_chns, channel_id) && channel_type === 0x00) {
      const id = channel_id - gpio_in_chns[0] + 1;
      const gpio_in_variable = decoded.find((x) => x.variable === "gpio_in");
      if (gpio_in_variable) {
        gpio_in_variable.metadata[id] = bytes[i] === 0 ? "off" : "on";
      } else {
        decoded.push({
          variable: "gpio_in",
          value: "true",
          time: Date.now(),
          metadata: { [id]: bytes[i] === 0 ? "off" : "on" },
        });
      }
      i += 1;
    }
    // GPIO OUTPUT
    else if (iincludes(gpio_out_chns, channel_id) && channel_type === 0x01) {
      const id = channel_id - gpio_out_chns[0] + 1;
      const gpio_out_variable = decoded.find((x) => x.variable === "gpio_out");
      if (gpio_out_variable) {
        gpio_out_variable.metadata[id] = bytes[i] === 0 ? "off" : "on";
      } else {
        decoded.push({
          variable: "gpio_out",
          value: "true",
          time: Date.now(),
          metadata: { [id]: bytes[i] === 0 ? "off" : "on" },
        });
      }
      i += 1;
    }
    // GPIO AS COUNTER
    else if (iincludes(gpio_in_chns, channel_id) && channel_type === 0xc8) {
      const id = channel_id - gpio_in_chns[0] + 1;
      const counters_variable = decoded.find((x) => x.variable === "counter");
      if (counters_variable) {
        counters_variable.metadata[id] = rreadUInt32LE(bytes.slice(i, i + 4));
      } else {
        decoded.push({
          variable: "counter",
          value: "true",
          time: Date.now(),
          metadata: { [id]: rreadUInt32LE(bytes.slice(i, i + 4)) },
        });
      }
      i += 4;
    }
    // PT100
    else if (iincludes(pt100_chns, channel_id) && channel_type === 0x67) {
      const id = channel_id - pt100_chns[0] + 1;
      const pt100_name = "pt100_" + String(id);
      decoded[pt100_name] = rreadInt16LE(bytes.slice(i, i + 2)) / 10;
      const pt100s_variable = decoded.find((x) => x.variable === "pt100");
      if (pt100s_variable) {
        pt100s_variable.metadata[id] = decoded[pt100_name];
      } else {
        decoded.push({
          variable: "pt100",
          value: "true",
          time: Date.now(),
          metadata: { [id]: decoded[pt100_name] },
        });
      }
      i += 2;
    }
    // ADC CHANNEL
    else if (iincludes(ai_chns, channel_id) && channel_type === 0x02) {
      const id = channel_id - ai_chns[0] + 1;
      const adc_name = "adc_" + String(id);
      decoded[adc_name] = rreadUInt32LE(bytes.slice(i, i + 4)) / 100;
      const adcs_variable = decoded.find((x) => x.variable === "adc");
      if (adcs_variable) {
        adcs_variable.metadata[id] = decoded[adc_name];
      } else {
        decoded.push({
          variable: "adc",
          value: "true",
          time: Date.now(),
          metadata: { [id]: decoded[adc_name] },
        });
      }
      i += 4;
      continue;
    }
    // ADC CHANNEL FOR VOLTAGE
    else if (iincludes(av_chns, channel_id) && channel_type === 0x02) {
      const id = channel_id - av_chns[0] + 1;
      const adv_name = "adv_" + String(id);
      decoded[adv_name] = rreadUInt32LE(bytes.slice(i, i + 4)) / 100;
      const advs_variable = decoded.find((x) => x.variable === "adv");
      if (advs_variable) {
        advs_variable.metadata[id] = decoded[adv_name];
      } else {
        decoded.push({
          variable: "adv",
          value: "true",
          time: Date.now(),
          metadata: { [id]: decoded[adv_name] },
        });
      }
      i += 4;
      continue;
    }
    // MODBUS
    if (channel_id === 0xff && channel_type === 0x19) {
      const modbus_chn_id = Number(bytes[i++]) + 1;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const data_length = bytes[i++];
      const data_type = bytes[i++];
      const sign = (data_type >>> 7) & 0x01;
      const type = data_type & 0x7f; // 0b01111111
      const chn = `modbus_chn_${modbus_chn_id}`;

      switch (type) {
        case 0:
          decoded[chn] = bytes[i] ? "on" : "off";
          i += 1;
          break;
        case 1:
          decoded[chn] = sign ? rreadInt8(bytes.slice(i, i + 1)) : rreadUInt8(bytes.slice(i, i + 1));
          i += 1;
          break;
        case 2:
        case 3:
          decoded[chn] = sign ? rreadInt16LE(bytes.slice(i, i + 2)) : rreadUInt16LE(bytes.slice(i, i + 2));
          i += 2;
          break;
        case 4:
        case 6:
          decoded[chn] = sign ? rreadInt32LE(bytes.slice(i, i + 4)) : rreadUInt32LE(bytes.slice(i, i + 4));
          i += 4;
          break;
        case 8:
        case 10:
          decoded[chn] = sign ? rreadInt16LE(bytes.slice(i, i + 2)) : rreadUInt16LE(bytes.slice(i, i + 2));
          i += 4;
          break;
        case 9:
        case 11:
          decoded[chn] = sign ? rreadInt16LE(bytes.slice(i + 2, i + 4)) : rreadUInt16LE(bytes.slice(i + 2, i + 4));
          i += 4;
          break;
        case 5:
        case 7:
          decoded[chn] = rreadFloatLE(bytes.slice(i, i + 4));
          i += 4;
          break;
      }

      const modbus_variable = decoded.find((x) => x.variable === "modbus");

      if (modbus_variable) {
        modbus_variable.metadata[modbus_chn_id] = decoded[chn];
      } else {
        decoded.push({
          variable: "modbus",
          value: "true",
          metadata: { [modbus_chn_id]: decoded[chn] },
        });
      }
    }
    // MODBUS READ ERROR
    else if (channel_id === 0xff && channel_type === 0x15) {
      const modbus_chn_id = Number(bytes[i]) + 1;
      const channel_name = "modbus_chn_" + String(modbus_chn_id) + "_alarm";
      decoded[channel_name] = "read error";
      const modbus_variable = decoded.find((x) => x.variable === "modbus_read_error");
      if (modbus_variable) {
        modbus_variable.metadata[modbus_chn_id] = decoded[channel_name];
      } else {
        decoded.push({
          variable: "modbus_read_error",
          value: "true",
          time: Date.now(),
          metadata: { [modbus_chn_id]: decoded[channel_name] },
        });
      }

      i += 1;
    }
    // ANALOG INPUT STATISTICS
    else if (iincludes(ai_chns, channel_id) && channel_type === 0xe2) {
      const id = channel_id - ai_chns[0] + 1;
      decoded.push({
        variable: "adc_" + String(id),
        value: rreadFloat16LE(bytes.slice(i, i + 2)),
        metadata: {
          max: rreadFloat16LE(bytes.slice(i + 2, i + 4)),
          min: rreadFloat16LE(bytes.slice(i + 4, i + 6)),
          avg: rreadFloat16LE(bytes.slice(i + 6, i + 8)),
        },
      });
      i += 8;
    }
    // ANALOG VOLTAGE STATISTICS
    else if (iincludes(av_chns, channel_id) && channel_type === 0xe2) {
      const id = channel_id - av_chns[0] + 1;
      decoded.push({
        variable: "adv_" + String(id),
        value: rreadFloat16LE(bytes.slice(i, i + 2)),
        metadata: {
          max: rreadFloat16LE(bytes.slice(i + 2, i + 4)),
          min: rreadFloat16LE(bytes.slice(i + 4, i + 6)),
          avg: rreadFloat16LE(bytes.slice(i + 6, i + 8)),
        },
      });
      i += 8;
    }
    // PT100 ARGS STATISTICS
    else if (iincludes(pt100_chns, channel_id) && channel_type === 0xe2) {
      const id = channel_id - pt100_chns[0] + 1;
      const pt100_name = "pt100_" + String(id);
      decoded[pt100_name] = rreadFloat16LE(bytes.slice(i, i + 2));
      decoded[pt100_name + "_max"] = rreadFloat16LE(bytes.slice(i + 2, i + 4));
      decoded[pt100_name + "_min"] = rreadFloat16LE(bytes.slice(i + 4, i + 6));
      decoded[pt100_name + "_avg"] = rreadFloat16LE(bytes.slice(i + 6, i + 8));
      decoded.push({
        variable: pt100_name,
        value: decoded[pt100_name],
        metadata: {
          max: decoded[pt100_name],
          min: decoded[pt100_name],
          avg: decoded[pt100_name],
        },
      });
      i += 8;
    }
    // CHANNEL HISTORICAL DATA
    else if (channel_id === 0x20 && channel_type === 0xdc) {
      const timestamp = rreadUInt32LE(bytes.slice(i, i + 4));
      const channel_mask = numToBits(rreadUInt16LE(bytes.slice(i + 4, i + 6)), 16);
      i += 6;

      for (let j = 0; j < channel_mask.length; j++) {
        // SKIP UNUSED CHANNELS
        if (channel_mask[j] !== 1) {
          continue;
        }
        // GPIO INPUT
        if (j < 4) {
          const type = bytes[i++];
          // AS GPIO INPUT
          if (type === 0) {
            const id = String(j + 1);
            const value = rreadUInt32LE(bytes.slice(i, i + 4)) === 0 ? "off" : "on";
            const historical_gpio_in_variable = decoded.find((x) => x.variable === "gpio_in" && x.time === timestamp);
            if (historical_gpio_in_variable) {
              historical_gpio_in_variable.metadata[id] = bytes[i] === 0 ? "off" : "on";
            } else {
              decoded.push({
                variable: "gpio_in",
                value: "true",
                time: timestamp,
                metadata: {
                  [id]: value,
                },
              });
            }
            i += 4;
          }
          // AS COUNTER
          else {
            const id = String(j + 1);
            const value = rreadUInt32LE(bytes.slice(i, i + 4));
            const historical_counters_variable = decoded.find((x) => x.variable === "counter" && x.time === timestamp);
            if (historical_counters_variable) {
              historical_counters_variable.metadata[id] = value;
            } else {
              decoded.push({
                variable: "counter",
                value: "true",
                time: timestamp,
                metadata: { [id]: value },
              });
            }
            i += 4;
          }
        }
        // GPIO OUTPUT
        else if (j < 6) {
          const id = j - 4 + 1;
          const value = bytes[i] === 0 ? "off" : "on";
          const historical_gpio_out_variable = decoded.find((x) => x.variable === "gpio_out");
          if (historical_gpio_out_variable) {
            historical_gpio_out_variable.metadata[id] = value;
          } else {
            decoded.push({
              variable: "gpio_out",
              value: "true",
              time: timestamp,
              metadata: { [id]: value },
            });
          }
          i += 1;
        }
        // PT100
        else if (j < 8) {
          const id = j - 6 + 1;
          const value = rreadInt16LE(bytes.slice(i, i + 2)) / 10;
          const historical_pt100_variable = decoded.find((x) => x.variable === "pt100" && x.time === timestamp);
          if (historical_pt100_variable) {
            historical_pt100_variable.metadata[id] = value;
          } else {
            decoded.push({
              variable: "pt100",
              value: "true",
              time: timestamp,
              metadata: { [id]: value },
            });
          }
          i += 2;
        }
        // ADC
        else if (j < 10) {
          decoded.push({
            variable: "adc_" + String(j - 8 + 1),
            value: rreadFloat16LE(bytes.slice(i, i + 2)),
            metadata: {
              max: rreadFloat16LE(bytes.slice(i + 2, i + 4)),
              min: rreadFloat16LE(bytes.slice(i + 4, i + 6)),
              avg: rreadFloat16LE(bytes.slice(i + 6, i + 8)),
            },
            time: timestamp,
          });
          i += 8;
        }
        // ADV
        else if (j < 12) {
          decoded.push({
            variable: "adv_" + String(j - 10 + 1),
            value: rreadFloat16LE(bytes.slice(i, i + 2)),
            metadata: {
              max: rreadFloat16LE(bytes.slice(i + 2, i + 4)),
              min: rreadFloat16LE(bytes.slice(i + 4, i + 6)),
              avg: rreadFloat16LE(bytes.slice(i + 6, i + 8)),
            },
            time: timestamp,
          });
          i += 8;
        }
      }
    }
    // MODBUS HISTORICAL DATA
    else if (channel_id === 0x20 && channel_type === 0xdd) {
      const timestamp = rreadUInt32LE(bytes.slice(i, i + 4));
      const modbus_chn_mask = numToBits(rreadUInt32LE(bytes.slice(i + 4, i + 8)), 32);
      i += 8;

      const data = { timestamp: timestamp };
      for (let j = 0; j < modbus_chn_mask.length; j++) {
        if (modbus_chn_mask[j] !== 1) {
          continue;
        }

        const modbus_chn_id = j + 1;
        const chn = "modbus_chn_" + String(modbus_chn_id);
        const data_type = bytes[i++];
        const sign = (data_type >>> 7) & 0x01;
        const type = data_type & 0x7f; // 0b01111111
        switch (type) {
          case 0: // MB_COIL
            decoded[chn] = bytes[i] ? "on" : "off";
            break;
          case 1: // MB_DISCRETE
            data[chn] = sign ? rreadInt8(bytes.slice(i, i + 1)) : rreadUInt8(bytes.slice(i, i + 1));
            break;
          case 2: // MB_INPUT_INT16
          case 3: // MB_HOLDING_INT16
            data[chn] = sign ? rreadInt16LE(bytes.slice(i, i + 2)) : rreadUInt16LE(bytes.slice(i, i + 2));
            break;
          case 4: // MB_HOLDING_INT32
          case 6: // MB_INPUT_INT32
            data[chn] = sign ? rreadInt32LE(bytes.slice(i, i + 4)) : rreadUInt32LE(bytes.slice(i, i + 4));
            break;
          case 8: // MB_INPUT_INT32_AB
          case 10: // MB_HOLDING_INT32_AB
            data[chn] = sign ? rreadInt16LE(bytes.slice(i, i + 2)) : rreadUInt16LE(bytes.slice(i, i + 2));
            break;
          case 9: // MB_INPUT_INT32_CD
          case 11: // MB_HOLDING_INT32_CD
            data[chn] = sign ? rreadInt16LE(bytes.slice(i + 2, i + 4)) : rreadUInt16LE(bytes.slice(i + 2, i + 4));
            break;
          case 5: // MB_HOLDING_FLOAT
          case 7: // MB_INPUT_FLOAT
            data[chn] = rreadFloatLE(bytes.slice(i, i + 4));
            break;
        }
        const historic_modbus_variable = decoded.find((x) => x.variable === "modbus" && x.time === timestamp);
        if (historic_modbus_variable) {
          historic_modbus_variable.metadata[modbus_chn_id] = decoded[chn];
        } else {
          decoded.push({
            variable: "modbus",
            value: "true",
            time: timestamp,
            metadata: { [modbus_chn_id]: decoded[chn] },
          });
        }
        i += 4;
      }
    }
  }

  return decoded;
}

/* ******************************************
 * bytes to number
 ********************************************/
function numToBits(num, bit_count) {
  const bits: any = [];
  for (let i = 0; i < bit_count; i++) {
    bits.push((num >> i) & 1);
  }
  return bits;
}
function rreadUInt8(bytes) {
  return bytes & 0xff;
}

function rreadInt8(bytes) {
  const ref = rreadUInt8(bytes);
  return ref > 0x7f ? ref - 0x100 : ref;
}

function rreadUInt16LE(bytes) {
  const value = (Number(bytes[1]) << 8) + Number(bytes[0]);
  return value & 0xffff;
}

function rreadInt16LE(bytes) {
  const ref = rreadUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function rreadUInt32LE(bytes) {
  const value = (Number(bytes[3]) << 24) + (Number(bytes[2]) << 16) + (Number(bytes[1]) << 8) + Number(bytes[0]);
  return (value & 0xffffffff) >>> 0;
}

function rreadInt32LE(bytes) {
  const ref = rreadUInt32LE(bytes);
  return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function rreadFloatLE(bytes) {
  // JavaScript bitwise operators yield a 32 bits integer, not a float.
  // Assume LSB (least significant byte first).
  const bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
  const sign = bits >>> 31 === 0 ? 1.0 : -1.0;
  const e = (bits >>> 23) & 0xff;
  const m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  const f = sign * m * Math.pow(2, e - 150);

  const n = Number(f.toFixed(2));
  return n;
}

function rreadFloat16LE(bytes) {
  const bits = (bytes[1] << 8) | bytes[0];
  const sign = bits >>> 15 === 0 ? 1.0 : -1.0;
  const e = (bits >>> 10) & 0x1f;
  const m = e === 0 ? (bits & 0x3ff) << 1 : (bits & 0x3ff) | 0x400;
  const f = sign * m * Math.pow(2, e - 25);

  const n = Number(f.toFixed(2));
  return n;
}

function iincludes(datas, value) {
  const size = datas.length;
  for (let i = 0; i < size; i++) {
    if (datas[i] == value) {
      return true;
    }
  }
  return false;
}

function rreadHardwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = (bytes[1] & 0xff) >> 4;
  return `v${major}.${minor}`;
}

function rreadFirmwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `v${major}.${minor}`;
}

function rreadSerialNumber(bytes) {
  const temp: any = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
  }
  return temp.join("");
}

const uc300PayloadData = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (uc300PayloadData) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(uc300PayloadData?.value, "hex");
    const time = Date.now();
    const decodedat101Payload = milesightUC300(buffer);
    payload = decodedat101Payload?.map((x) => ({ ...x, time: x.time || time })) ?? [];
  } catch (error: any) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
