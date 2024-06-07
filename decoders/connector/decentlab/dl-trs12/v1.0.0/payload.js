/*
* FILENAME : dl-trs12.js 
*
* DESCRIPTION : Decentlab DL-TRS12
*     
*
* FUNCTIONS : read_int, decode, ToTagoFormat, adjustObjectFormat
*       
*
* NOTES :
*
* AUTHOR : Mat Cercena        START DATE : 09/20/2022
*
* CHANGES :
*
* REF NO  VERSION DATE    WHO           DETAIL
* 1.0     09/20/2022      Mat Cercena   implementing DL-TRS12
* 
*
*/

/* eslint-disable no-restricted-properties */

const decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 3,
     values: [{name: 'dielectric_permittivity',
               displayName: 'Dielectric permittivity',
               convert (x) { return Math.pow(0.000000002887 * Math.pow(x[0]/10, 3) - 0.0000208 * Math.pow(x[0]/10, 2) + 0.05276 * (x[0]/10) - 43.39, 2); }},
              {name: 'volumetric_water_content',
               displayName: 'Volumetric water content',
               convert (x) { return x[0]/10 * 0.0003879 - 0.6956; },
               unit: 'm³⋅m⁻³'},
              {name: 'soil_temperature',
               displayName: 'Soil temperature',
               convert (x) { return (x[1] - 32768) / 10; },
               unit: '°C'},
              {name: 'electrical_conductivity',
               displayName: 'Electrical conductivity',
               convert (x) { return x[2]; },
               unit: 'µS⋅cm⁻¹'}]},
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
  console.log(decentlab_decoder.decode("0210d3000346be813d00000c80"));
  console.log(decentlab_decoder.decode("0210d300020c80"));
}
main();
*/