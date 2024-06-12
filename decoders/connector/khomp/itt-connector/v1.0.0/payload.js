var timestamp;

const ignore_vars = [];
// Add ignorable variables in this array.
/*
const ignore_vars = [ "duplicate", "encrypted_payload", "method", "precision", "port", "gps_alt", "gps_location", "header_adr_ack_req", 
  "gw_location", "time", "hardware_chain", "hardware_channel", "hardware_status", "hardware_tmst", "header_ack", "header_type", "header_adr", 
  "header_confirmed", "header_version", "method", "modulation_bandwidth", "modulation_coderate", "modulation_type", 
  "quality", "radio_delay", "radio_freq", "radio_size", "radio_time", "rx_time",
  "delay", "gateway", "packet_id", "size", "freq"];
*/

function parsePayload(payload_raw) {
  try {
    const buffer = Buffer.from(payload_raw, 'hex');
    const data = [];
    const checker = buffer.readUInt8(0);
    const type = buffer.readInt8(1);
    
    var index = 2;

    // Battery voltage
    const battery = buffer.readInt8(index);
    data.push({ variable: "battery",  value: battery / 10, unit: 'V' });
    index += 1;

    // Battery status
    var bat_status_array = ["Não carregando", "Carregando", "Carregando", "Carregada", "Erro", "Não-recarregável"];
    data.push({ variable : "bat_status", value : bat_status_array[(type & 0x0F)]})

    // Version 
    const version = buffer.readIntLE(index,2);
   
    var version_list = [];
    for (i = version.toString().length; i > 0; i -= 1) {
      version_list.push(Number(version.toString().substring(i, i - 1)));
    }
    version_list.reverse();
    data.push({ variable: "version", value: version_list.join(".") });
    index += 2;

    // Temperature
    if (checker == 174){
      const temperature = buffer.readIntLE(index,2);
      data.push({ variable: "temperature",  value: ((temperature / 100) - 273.15).toFixed(2), unit: '°C' });
      index += 2;
    }

    // GPS
    var gps_availability;
    if ( (type & 0xF0) == 0x00) {
      gps_availability = "GPS desativado"
      data.push({ variable: "gps_availability", value: gps_availability });
    } else if ((type & 0xF0) == 0x10) {
      // latitude
      const lat_direction = buffer.readInt8(index);
      index += 1;
      const latitude = buffer.readInt8(index) + (buffer.readInt8(index+1) / 60) + (buffer.readIntLE(index+2,3) / 10000 / 3600);
      index += 5;
      var lat_calc = lat_direction == 1 ? latitude : latitude * (-1);

      // longitude
      const lon_direction = buffer.readInt8(index);
      index += 1;
      const longitude = buffer.readInt8(index) + (buffer.readInt8(index+1) / 60) + (buffer.readIntLE(index+2,3) / 10000 / 3600);
      index += 5;
      var long_calc = lon_direction == 1 ? longitude : longitude * (-1);

      // velocity
      //const velocity = buffer.readInt8(index) * 3.6;
      //index += 1;
      
      // timestamp
      timestamp = new Date(buffer.readIntLE(index,4) * 1000);

      gps_availability = "GPS com conexão"
      data.push({ variable: "gps_availability", value: gps_availability });

      data.push({ variable: "lat", value:  lat_calc});
      data.push({ variable: "long", value:  long_calc});

      const gps = { "lat": lat_calc , "lng" : long_calc }; 
      data.push({ variable: "gps", value: (lat_calc).toFixed(6) + "," + (long_calc).toFixed(6) + " - " +  timestamp.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}), location: gps });

      // data.push({ variable: "velocity", value: velocity.toFixed(2), unit: 'km/h' });
      
    } else if ((type & 0xF0) == 0x20) {
      timestamp = new Date;
      data.push({ variable: "gps_availability", value: "GPS sem conexão"});
    }
 
    return data;

  } catch (e) {
    console.log(e);
    // Return the variable parse_error for debugging.
    return [{ variable: 'parse_error', value: e.message }];
  }
}

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => x.variable === 'payload_raw' || x.variable === 'payload' || x.variable === 'data' || x.variable === 'frm_payload');
const rssi = payload.find(x => x.variable === 'hardware_rssi' || x.variable === 'rssi');
const snr = payload.find(x => x.variable === 'hardware_snr' || x.variable === 'snr');
const uplink_counter = payload.find(x => x.variable === 'counter_up' || x.variable === 'fcntup');

if (snr) {
  var serie = snr.serie;
}

const time_obj = payload.find(x => x.variable === 'time');
if (time_obj) {
  timestamp = time_obj.value * 1000;
}

if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value } = payload_raw;
  
  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(parsePayload(value));
  }
}

if (rssi && snr) {
    //const { value, serie, time } = rssi; 
    var quality = "Desconhecido"

    if (snr.value >= 8) {
      quality = "Forte";
    } else if (snr.value >= -2) {
      quality = "Médio";
    } else {
      quality = "Fraco";
    }

    payload = payload.concat([{ variable: "signal_quality",  value: quality}]);
}

payload = payload.map(x => ({ ...x, serie: serie, time: timestamp }));
//payload = payload.map(x => ({ ...x, serie: serie}));

// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));
