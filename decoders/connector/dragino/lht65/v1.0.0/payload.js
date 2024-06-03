const ignore_vars = ['device_addr', 'port', 'duplicate', 'network', 'packet_hash', 'application', 'device', 'packet_id'];


/**
 * Convert an object to TagoIO object format.
 * Can be used in two ways:
 * toTagoFormat({ myvariable: myvalue , anothervariable: anothervalue... })
 * toTagoFormat({ myvariable: { value: myvalue, unit: 'C', metadata: { color: 'green' }} , anothervariable: anothervalue... })
 *
 * @param {Object} object_item Object containing key and value.
 * @param {String} serie Serie for the variables
 * @param {String} prefix Add a prefix to the variables name
 */
 function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] == 'object') {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

/**
 *  In the solutions params is where usually latitude and longitude for your antenna signal comes from.
 * @param {Object} solutions gateway object from everynet
 * @param {String|Number} serie serie for the variables
 */
function transformSolutionParam(solutions, serie) {
  let to_tago = [];
  for (const s of solutions) {
    let convert_json = {};
    convert_json.base_location = { value: `${s.lat}, ${s.lng}`, location: { lat: s.lat, lng: s.lng } };
    delete s.lat;
    delete s.lng;

    convert_json = { ...convert_json, ...s };
    to_tago = to_tago.concat(toTagoFormat(convert_json, serie));
  }

  return to_tago;
}

/**
 * This is the main function to parse the payload. Everything else doesn't require your attention.
 * @param {String} payload_raw
 * @returns {Object} containing key and value to TagoIO
 */
 function Decoder13(bytes, serie) {
  bytes = Buffer.from(bytes, 'hex');
  var value = (bytes[0] << 8 | bytes[1]) & 0x3FFF;
  var batV = value / 1000;//Battery,units:V
  value = bytes[2] << 8 | bytes[3];
  if (bytes[2] & 0x80) { value |= 0xFFFF0000; }
  var temp_SHT = (value / 100).toFixed(2);//SHT20,temperature,units:℃

  value = bytes[4] << 8 | bytes[5];
  var hum_SHT = (value / 10).toFixed(1);//SHT20,Humidity,units:%

  value = bytes[7] << 8 | bytes[8];
  if (bytes[7] & 0x80) { value |= 0xFFFF0000; }
  var temp_ds = (value / 100).toFixed(2);//DS18B20,temperature,units:℃

  return {
    battery: { value: Number(batV), serie, unit: 'V' },
    temp_ds: { value: Number(temp_ds), serie, unit: '°C' },
    temp_sht: { value: Number(temp_SHT), serie, unit: '°C' },
    hum_sht: { value: Number(hum_SHT), serie, unit: '%' },
  };
}

function Decoder18(bytes, port) {
  const decoded = [];
  
  if(port !== 2) {
    return decoded;
  }

  const ext = bytes[6];
  let connected = false;

  if ((ext & 0x0f) !== 0x09) {
    // BAT-Battery Info (2 bytes)
    const value = bytes[0] >> 6;
    switch(value) {
      case 0b00:
        decoded.push({ variable: "bat_status", value: "Ultra Low ( BAT <= 2.50v )" });
        break;
      case 0b01:
        decoded.push({ variable: "bat_status", value: "Low ( 2.50v <= BAT <= 2.55v )" });
        break;
      case 0b10:
        decoded.push({ variable: "bat_status", value: "OK ( 2.55v <= BAT <= 2.65v )" });
        break;
      case 0b11:
        decoded.push({ variable: "bat_status", value: "Good ( BAT >= 2.65v )" });
        break;
      default:
        break;
    }
    decoded.push({ variable: "battery", value: ((bytes[0] & 0x3f) << 8 | bytes[1]) / 1000, unit: "V" });
    // Built-In Temperature (2 bytes)
    decoded.push({ variable: "temp_sht", value: ((bytes[2]<<24>>16 | bytes[3])/100), unit: "°C" });
    // Built-In Humidity (2 bytes)
    decoded.push({ variable: "hum_sht", value: (bytes[4] << 8 | bytes[5]) / 10, unit: "%" });
    // Ext (1 byte) & ext value (4 bytes)
    //const ext = bytes[6];
    switch(ext & 0x0f) {
      case 0x00:
        decoded.push({ variable: "ext_sensor", value: "No external sensor" });
        break;
      case 0x01:
        decoded.push({ variable: "ext_sensor", value: "Sensor E1, Temperature Sensor" });
        decoded.push({ variable: "temp_ds", value: ((bytes[7]<<24>>16 | bytes[8])/100), unit: "°C" });
        break;
      case 0x04:
        decoded.push({ variable: "ext_sensor", value: "Sensor E4, Interrupt Sensor" });
        connected = (bytes[6] >> 4) === 0;  
        decoded.push({ variable: "cable_connected", value: connected });
        if(connected) {
          decoded.push({ variable: "pin_level", value: bytes[7] & 0x01 });
          decoded.push({ variable: "interrupt_uplink", value: bytes[8] === 0x01 });
        }
        break;
      case 0x05:
        decoded.push({ variable: "ext_sensor", value: "Sensor E5, Illumination Sensor" });
        connected = (bytes[6] >> 4) === 0;
        decoded.push({ variable: "cable_connected", value: connected });
        if(connected) {
          decoded.push({ variable: "illumination", value: bytes[7] << 8 | bytes[8], unit: "lux" });   
        }
        break;
      case 0x06:
        decoded.push({ variable: "ext_sensor", value: "Sensor E6, ADC Sensor" });
        connected = (bytes[6] >> 4) === 0;
        decoded.push({ variable: "cable_connected", value: connected });
        if(connected) {
          decoded.push({ variable: "adc", value: (bytes[7] << 8 | bytes[8])/1000, unit: "V" });
        }
        break;
      case 0x07:
        decoded.push({ variable: "ext_sensor", value: "Sensor E7, Counting Sensor, 16 bit" });
        connected = (bytes[6] >> 4) === 0;
        decoded.push({ variable: "cable_connected", value: connected });
        if(connected) {
          decoded.push({ variable: "count", value: (bytes[7] << 8 | bytes[8]) });
        }
        break;
      case 0x08:
        decoded.push({ variable: "ext_sensor", value: "Sensor E7, Counting Sensor, 32 bit" });
        connected = (bytes[6] >> 4) === 0;
        decoded.push({ variable: "cable_connected", value: connected });
        if(connected) {
          decoded.push({ variable: "count", value: (bytes[7] << 24 | bytes[8] << 16 | bytes[9] << 8 | bytes[10]) });
        }
        break;
      default:
        break; 
    }
  } else {
    decoded.push({ variable: "ext_sensor", value: "Sensor E1, Temperature Sensor, Datalog Mod" });
    // External Temperature
    decoded.push({ variable: "temp_ds", value: ((bytes[0]<<24>>16 | bytes[1])/100), unit: "°C" });
    // Built-In Temperature (2 bytes)
    decoded.push({ variable: "temp_sht", value: ((bytes[2]<<24>>16 | bytes[3])/100), unit: "°C" });
    // BAT Status & Built-In Humidity (2 bytes)
    const value = bytes[4] >> 6;
    switch(value) {
      case 0b00:
        decoded.push({ variable: "bat_status", value: "Ultra Low ( BAT <= 2.50v )" });
        break;
      case 0b01:
        decoded.push({ variable: "bat_status", value: "Low ( 2.50v <= BAT <= 2.55v )" });
        break;
      case 0b10:
        decoded.push({ variable: "bat_status", value: "OK ( 2.55v <= BAT <= 2.65v )" });
        break;
      case 0b11:
        decoded.push({ variable: "bat_status", value: "Good ( BAT >= 2.65v )" });
        break;
      default:
        break;
    }
    decoded.push({ variable: "hum_sht", value: ((bytes[4] & 0x0f) << 8 | bytes[5]) / 10, unit: "%" });
    // Status & Ext
    decoded.push({ variable: "poll_message_flag", value: (bytes[6] >> 6) & 0x01 });
    decoded.push({ variable: "sync_time_ok", value: (bytes[6] >> 5) & 0x01 });
    decoded.push({ variable: "unix_time_request", value: (bytes[6] >> 4) & 0x01 });
    // Unix Timestamp
    decoded.push({ variable: "unix_timestamp", value: (bytes[7] << 24 | bytes[8] << 16 | bytes[9] << 8 | bytes[10]) });
  }

  if(bytes.length === 11) {
    return decoded;
  }
}

// let payload = [{ variable: "payload", value: "cb060b5b02770400017fff" }, { variable: "fport", value: "2" }];
// let payload = [{ variable: "payload", value: "cbf60b0d037601addd7fff" }, { variable: "fport", value: "2" }];
// let payload = [{ variable: "payload", value: "cbbdf5c6022e01f54f7fff" }, { variable: "fport", value: "2" }];
// let payload = [{ variable: "payload", value: "cbf60b0d0376010add7fff" }, { variable: "fport", value: "2" }];
// let payload = [{ variable: "payload", value: "cb040b55025a0401007fff" }, { variable: "fport", value: "2" }];
// let payload = [{ variable: "payload", value: "cb030b2d027c0501917fff" }, { variable: "fport", value: "2" }];
// let payload = [{ variable: "payload", value: "cb0b0b640272060b067fff" }, { variable: "fport", value: "2" }];
// let payload = [{ variable: "payload", value: "cbd50b0502e70700067fff" }, { variable: "fport", value: "2" }];
// let payload = [{ variable: "payload", value: "cbcb09e702140800010005" }, { variable: "fport", value: "2" }];
// let payload = [{ variable: "payload", value: "0add0b0dc376596075ad9a" }, { variable: "fport", value: "2" }];

const data = payload.find((x) => x.variable === "payload" || x.variable === "payload_raw" || x.variable === "data" || x.variable === "payload_hex");
const port = payload.find((x) => x.variable === "port" || x.variable === "fport" || x.variable === "FPort" || x.variable === "fPort"); //uplink uses fport === 2
const version = device.params.find((x) => x.key.toLowerCase() === "version");

if (data) {
  const serie = data.serie || new Date().getTime();
  const bytes = Buffer.from(data.value, "hex");
  if(!version || !version.value || version.value === "1.8") {
    payload = payload.concat(Decoder18( bytes, Number(port.value) )).map((x) => ({ ...x, serie}));
  } else {
    payload = payload.concat(toTagoFormat(Decoder13( bytes, Number(port.value) ), Number(port.value))).map((x) => ({ ...x, serie }));
  }
}
