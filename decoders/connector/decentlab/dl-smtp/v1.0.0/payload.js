/*
* FILENAME : dl-smtp.js 
*
* DESCRIPTION : Decentlab DL-SMTP
*     
*
* FUNCTIONS : read_int, decode, ToTagoFormat, adjustObjectFormat
*       
*
* NOTES :
*
* AUTHOR : Mat Cercena        START DATE : 09/19/2022
*
* CHANGES :
*
* REF NO  VERSION DATE    WHO           DETAIL
* 1.0     09/19/2022      Mat Cercena   implementing DL-SMTP
* 
*
*/

const decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 16,
     values: [{name: 'soil_moisture_at_depth_0',
               displayName: 'Soil moisture at depth 0',
               convert (x) { return (x[0] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_0',
               displayName: 'Soil temperature at depth 0',
               convert (x) { return (x[1] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_1',
               displayName: 'Soil moisture at depth 1',
               convert (x) { return (x[2] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_1',
               displayName: 'Soil temperature at depth 1',
               convert (x) { return (x[3] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_2',
               displayName: 'Soil moisture at depth 2',
               convert (x) { return (x[4] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_2',
               displayName: 'Soil temperature at depth 2',
               convert (x) { return (x[5] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_3',
               displayName: 'Soil moisture at depth 3',
               convert (x) { return (x[6] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_3',
               displayName: 'Soil temperature at depth 3',
               convert (x) { return (x[7] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_4',
               displayName: 'Soil moisture at depth 4',
               convert (x) { return (x[8] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_4',
               displayName: 'Soil temperature at depth 4',
               convert (x) { return (x[9] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_5',
               displayName: 'Soil moisture at depth 5',
               convert (x) { return (x[10] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_5',
               displayName: 'Soil temperature at depth 5',
               convert (x) { return (x[11] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_6',
               displayName: 'Soil moisture at depth 6',
               convert (x) { return (x[12] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_6',
               displayName: 'Soil temperature at depth 6',
               convert (x) { return (x[13] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_7',
               displayName: 'Soil moisture at depth 7',
               convert (x) { return (x[14] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_7',
               displayName: 'Soil temperature at depth 7',
               convert (x) { return (x[15] - 32768) / 100; },
               unit: '°C'}]},
    {length: 1,
     values: [{name: 'battery_voltage',
               displayName: 'Battery voltage',
               convert (x) { return x[0] / 1000; },
               unit: 'V'}]}
  ],

  read_int (bytes, pos) {
    return (bytes[pos] << 8) + bytes[pos + 1];
  },

  decode (msg) {
    let bytes = msg;
    let i; let j;
    if (typeof msg === 'string') {
      bytes = [];
      for (i = 0; i < msg.length; i += 2) {
        bytes.push(parseInt(msg.substring(i, i + 2), 16));
      }
    }

    const version = bytes[0];
    if (version !== this.PROTOCOL_VERSION) {
      return {error: `protocol version ${  version  } doesn't match v2`};
    }

    const deviceId = this.read_int(bytes, 1);
    let flags = this.read_int(bytes, 3);
    const result = {'protocol_version': version, 'device_id': deviceId};
    // decode payload
    let pos = 5;
    for (i = 0; i < this.SENSORS.length; i+=1, flags >>= 1) {
      if ((flags & 1) !== 1)
        continue;

      const sensor = this.SENSORS[i];
      const x = [];
      // convert data to 16-bit integer array
      for (j = 0; j < sensor.length; j+=1) {
        x.push(this.read_int(bytes, pos));
        pos += 2;
      }

      // decode sensor values
      for (j = 0; j < sensor.values.length; j+=1) {
        const value = sensor.values[j];
        if ('convert' in value) {
          result[value.name] = {displayName: value.displayName,
                                value: value.convert.bind(this)(x)};
          if ('unit' in value)
            result[value.name].unit = value.unit;
        }
      }
    }
    return result;
  }
};

function adjustObjectFormat (result){
  for (const key_aux of result){
    // drop undefined fields
    if (typeof key_aux.unit === 'undefined'){
      delete key_aux.unit;
    }
    if (typeof key_aux.value === 'undefined'){
      delete key_aux.value;
    }
    // limit value to 2 decimal places
    if (typeof key_aux.value === 'number' ){
      key_aux.value = Number(key_aux.value.toFixed(2));
    }
  }
  return result;
}

function ToTagoFormat(object_item, serie, prefix = "") {
  let result = [];
  for (const key in object_item) {
    if (typeof object_item[key] === "object") {
      result.push({
        variable: (object_item[key].MessageType || `${prefix}${key}`).toLowerCase(),
        value: object_item[key].value || object_item[key].Value,
        serie: object_item[key].serie || serie,
        // metadata: object_item[key].metadata,
        unit: object_item[key].unit,
        // location: object_item.location,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`.toLowerCase(),
        value: object_item[key],
        serie,
      });
    }
  }

  result = adjustObjectFormat(result);
  return result;
}

const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    const payload_aux = ToTagoFormat(decentlab_decoder.decode(buffer));
    payload = payload.concat(payload_aux.map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}

/*
function main() {
  console.log(decentlab_decoder.decode("020b50000309018a8c09438a9809278a920b3c8aa50c9c8a8c11e08aa500000000000000000b3b"));
  console.log(decentlab_decoder.decode("020b5000020b3b"));
}
main();
*/