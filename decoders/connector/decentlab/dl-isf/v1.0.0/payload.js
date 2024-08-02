/*
* FILENAME : dl-isf.js
*
* DESCRIPTION : Decentlab DL-ISF
*
*
* FUNCTIONS : read_int, decode, ToTagoFormat, adjustObjectFormat
*
*
* NOTES :
*
* AUTHOR : Decentlab          START DATE : 08/01/2024
*
* CHANGES :
*
* REF NO  VERSION DATE    WHO           DETAIL
* 1.0     08/01/2024      Decentlab     implementing DL-ISF
*
*
*/

/* https://www.decentlab.com/products/sapflow-sensor-for-lorawan */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 16,
     values: [{name: 'sap_flow',
               displayName: 'Sap flow',
               convert: function (x) { return (x[0] * 16 - 50000) / 1000; },
               unit: 'l⋅h⁻¹'},
              {name: 'heat_velocity_outer',
               displayName: 'Heat velocity (outer)',
               convert: function (x) { return (x[1] * 16 - 50000) / 1000; },
               unit: 'cm⋅h⁻¹'},
              {name: 'heat_velocity_inner',
               displayName: 'Heat velocity (inner)',
               convert: function (x) { return (x[2] * 16 - 50000) / 1000; },
               unit: 'cm⋅h⁻¹'},
              {name: 'alpha_outer',
               displayName: 'Alpha (outer)',
               convert: function (x) { return (x[3] * 32 - 1000000) / 100000; }},
              {name: 'alpha_inner',
               displayName: 'Alpha (inner)',
               convert: function (x) { return (x[4] * 32 - 1000000) / 100000; }},
              {name: 'beta_outer',
               displayName: 'Beta (outer)',
               convert: function (x) { return (x[5] * 32 - 1000000) / 100000; }},
              {name: 'beta_inner',
               displayName: 'Beta (inner)',
               convert: function (x) { return (x[6] * 32 - 1000000) / 100000; }},
              {name: 'tmax_outer',
               displayName: 'Tmax (outer)',
               convert: function (x) { return (x[7] * 2) / 1000; },
               unit: 's'},
              {name: 'tmax_inner',
               displayName: 'Tmax (inner)',
               convert: function (x) { return (x[8] * 2) / 1000; },
               unit: 's'},
              {name: 'temperature_outer',
               displayName: 'Temperature (outer)',
               convert: function (x) { return (x[9] - 32768) / 100; },
               unit: '°C'},
              {name: 'max_voltage',
               displayName: 'Max voltage',
               convert: function (x) { return (x[10] - 32768) / 1000; },
               unit: 'V'},
              {name: 'min_voltage',
               displayName: 'Min voltage',
               convert: function (x) { return (x[11] - 32768) / 1000; },
               unit: 'V'},
              {name: 'diagnostic',
               displayName: 'Diagnostic',
               convert: function (x) { return x[12] + x[13] * 65536; }},
              {name: 'upstream_tmax_outer',
               displayName: 'Upstream Tmax (outer)',
               convert: function (x) { return (x[14] * 2) / 1000; },
               unit: 's'},
              {name: 'upstream_tmax_inner',
               displayName: 'Upstream Tmax (inner)',
               convert: function (x) { return (x[15] * 2) / 1000; },
               unit: 's'}]},
    {length: 1,
     values: [{name: 'battery_voltage',
               displayName: 'Battery voltage',
               convert: function (x) { return x[0] / 1000; },
               unit: 'V'}]}
  ],

  read_int: function (bytes, pos) {
    return (bytes[pos] << 8) + bytes[pos + 1];
  },

  decode: function (msg) {
    var bytes = msg;
    var i, j;
    if (typeof msg === 'string') {
      bytes = [];
      for (i = 0; i < msg.length; i += 2) {
        bytes.push(parseInt(msg.substring(i, i + 2), 16));
      }
    }

    var version = bytes[0];
    if (version != this.PROTOCOL_VERSION) {
      return {error: "protocol version " + version + " doesn't match v2"};
    }

    var deviceId = this.read_int(bytes, 1);
    var flags = this.read_int(bytes, 3);
    var result = {'protocol_version': version, 'device_id': deviceId};
    // decode payload
    var pos = 5;
    for (i = 0; i < this.SENSORS.length; i++, flags >>= 1) {
      if ((flags & 1) !== 1)
        continue;

      var sensor = this.SENSORS[i];
      var x = [];
      // convert data to 16-bit integer array
      for (j = 0; j < sensor.length; j++) {
        x.push(this.read_int(bytes, pos));
        pos += 2;
      }

      // decode sensor values
      for (j = 0; j < sensor.values.length; j++) {
        var value = sensor.values[j];
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
    if (typeof key_aux.value === 'number'){
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
    if (decentlab_decoder.PARAMETERS && typeof device !== 'undefined' && device.params) {
      device.params.forEach((p) => {
        if (p.key in decentlab_decoder.PARAMETERS) {
          decentlab_decoder.PARAMETERS[p.key] = p.value;
        }
      });
    }
    const payload_aux = ToTagoFormat(decentlab_decoder.decode(buffer));
    payload = payload.concat(payload_aux.map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
