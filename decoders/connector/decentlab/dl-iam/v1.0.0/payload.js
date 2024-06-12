/*
* FILENAME : dl-iam.js 
*
* DESCRIPTION : Decentlab DL-IAM
*     
*
* FUNCTIONS : read_int, decode, ToTagoFormat, adjustObjectFormat
*       
*
* NOTES :
*
* AUTHOR : Mat Cercena        START DATE : 09/16/2022
*
* CHANGES :
*
* REF NO  VERSION DATE    WHO           DETAIL
* 1.0     09/16/2022      Mat Cercena   implementing DL-IAM
* 
*
*/

let decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 1,
     values: [{name: 'battery_voltage',
               displayName: 'Battery voltage',
               convert: function (x) { return x[0] / 1000; },
               unit: 'V'}]},
    {length: 2,
     values: [{name: 'air_temperature',
               displayName: 'Air temperature',
               convert: function (x) { return 175 * x[0] / 65535 - 45; },
               unit: '°C'},
              {name: 'air_humidity',
               displayName: 'Air humidity',
               convert: function (x) { return 100 * x[1] / 65535; },
               unit: '%'}]},
    {length: 1,
     values: [{name: 'barometric_pressure',
               displayName: 'Barometric pressure',
               convert: function (x) { return x[0] * 2; },
               unit: 'Pa'}]},
    {length: 2,
     values: [{name: 'ambient_light_visible_infrared',
               displayName: 'Ambient light (visible + infrared)',
               convert: function (x) { return x[0]; }},
              {name: 'ambient_light_infrared',
               displayName: 'Ambient light (infrared)',
               convert: function (x) { return x[1]; }},
              {name: 'illuminance',
               displayName: 'Illuminance',
               convert: function (x) { return Math.max(Math.max(1.0 * x[0] - 1.64 * x[1], 0.59 * x[0] - 0.86 * x[1]), 0) * 1.5504; },
               unit: 'lx'}]},
    {length: 3,
     values: [{name: 'co2_concentration',
               displayName: 'CO2 concentration',
               convert: function (x) { return x[0] - 32768; },
               unit: 'ppm'},
              {name: 'co2_sensor_status',
               displayName: 'CO2 sensor status',
               convert: function (x) { return x[1]; }},
              {name: 'raw_ir_reading',
               displayName: 'Raw IR reading',
               convert: function (x) { return x[2]; }}]},
    {length: 1,
     values: [{name: 'activity_counter',
               displayName: 'Activity counter',
               convert: function (x) { return x[0]; }}]},
    {length: 1,
     values: [{name: 'total_voc',
               displayName: 'Total VOC',
               convert: function (x) { return x[0]; },
               unit: 'ppb'}]}
  ],

  read_int: function (bytes, pos) {
    return (bytes[pos] << 8) + bytes[pos + 1];
  },

  decode: function (msg) {
    let bytes = msg;
    let i, j;
    if (typeof msg === 'string') {
      bytes = [];
      for (i = 0; i < msg.length; i += 2) {
        bytes.push(parseInt(msg.substring(i, i + 2), 16));
      }
    }

    let version = bytes[0];
    if (version != this.PROTOCOL_VERSION) {
      return {error: "protocol version " + version + " doesn't match v2"};
    }

    let deviceId = this.read_int(bytes, 1);
    let flags = this.read_int(bytes, 3);
    let result = {'protocol_version': version, 'device_id': deviceId};
    // decode payload
    let pos = 5;
    for (i = 0; i < this.SENSORS.length; i++, flags >>= 1) {
      if ((flags & 1) !== 1)
        continue;

      let sensor = this.SENSORS[i];
      let x = [];
      // convert data to 16-bit integer array
      for (j = 0; j < sensor.length; j++) {
        x.push(this.read_int(bytes, pos));
        pos += 2;
      }

      // decode sensor values
      for (j = 0; j < sensor.values.length; j++) {
        let value = sensor.values[j];
        if ('convert' in value) {
          result[value.name] = {displayName: value.displayName,
                                value: value.convert.bind(this)(x)};
          if ('unit' in value)
            result[value.name]['unit'] = value.unit;
        }
      }
    }
    return result;
  }
};

function ToTagoFormat(object_item, serie, prefix = "") {
  let result = [];
  for (const key in object_item) {
    if (typeof object_item[key] === "object") {
      result.push({
        variable: (object_item[key].MessageType || `${prefix}${key}`).toLowerCase(),
        value: object_item[key].value || object_item[key].Value,
        serie: object_item[key].serie || serie,
        //metadata: object_item[key].metadata,
        unit: object_item[key].unit,
        //location: object_item.location,
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

function adjustObjectFormat (result){
  for (const key_aux of result){
    // drop undefined fields
    if (typeof key_aux.unit === 'undefined'){
      delete key_aux.unit;
    }
    // limit value to 2 decimal places
    if (typeof key_aux.value === 'number' ){
      key_aux.value = Number(key_aux.value.toFixed(2));
    }
  }
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
  console.log(decentlab_decoder.decode("020bbd007f0b926a515d48bc4e0262006981c7000093d4000b0111"));
  console.log(decentlab_decoder.decode("020bbd006f0b926a515d48bc4e02620069000b0111"));
  console.log(decentlab_decoder.decode("020bbd00010b92"));
}
main();
*/