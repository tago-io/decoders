// Add ignorable variables in this array.

const ignore_vars = [];
/*
const ignore_vars = ["counter_up", "datarate", "delay", "freq", "packet_id", "size", "status_channel_mask_ack", "status_data_rate_ack", 
  "status_power_ack", "duplicate", "radio_datarate", "encrypted_payload", "method", "precision", "port", "gps_alt", "gps_location", 
  "header_adr_ack_req", "gw_location", "time", "hardware_chain", "hardware_channel", "hardware_status", "hardware_tmst", "header_ack", 
  "header_type", "header_adr", "header_confirmed", "header_version", "method", "modulation_bandwidth", "modulation_coderate", 
  "modulation_spreading", "modulation_type", "quality", "radio_delay", "radio_freq", "radio_size", "radio_time", "rx_time"];
*/

const HIDROMETER_CHECKER = 0x48;
const ITC_MODE_SINGLE = 0x49;
const ITC_MODE_MULTI = 0x4A;
const ITC_MODE_DIGITAL_REFLUX = 0x4B;
const ITC_MODE_DICT = {
    ITC_MODE_SINGLE: "single_mode",
    ITC_MODE_MULTI: "multi_mode",
    ITC_MODE_DIGITAL_REFLUX: "digital_reflux_mode",
};
const COUNTER_REPORT_FRAUD = 1;
const COUNTER_REPORT_TAMPER = 2;
const COUNTER_REPORT_ACK = 3;

function parsePayload(payload_raw) {
  try {
    // If your device is sending something different than hex, like base64, just specify it bellow.
    const buffer = Buffer.from(payload_raw, 'hex');
    const data = [];
    const checker = buffer.readUInt8(0);
    const status_byte = buffer.readUInt8(1);
    
    // Status Flags
    var status_array = []
    for (var i = (("00000000"+status_byte.toString(2)).slice(-8)).length; i > 0; i -= 1) {
      status_array.push(Number((("00000000"+status_byte.toString(2)).slice(-8)).substring(i, i - 1)));
    }
    status_array.reverse();

    let msg_type = parseInt("" + status_array[0] + status_array[1], 2);
    let fraud = status_array[2];
    let tamper_detection = status_array[3];
    let resolution = parseInt("" + status_array[4] + status_array[5] + status_array[6], 2);
    let overflow_reflux = status_array[7];

    switch(msg_type) {
      case 1:
        data.push({ variable: "fraud_event",  value: "alert" });
        break;
      case 2:
        data.push({ variable: "tamper_detection_event",  value: "alert" });
        break;
      case 3:
        data.push({ variable: "resolution_ack",  value: "received" });
        break;
    }
    
    data.push({ variable: "fraud_status",  value: fraud });
    data.push({ variable: "tamper_detection_status",  value: tamper_detection });

    const resolution_factor = {0: 0, 1: 1, 2: 10, 3: 100, 4: 1000, 5: 10000};
    data.push({ variable: "resolution_configured",  value: resolution_factor[resolution], unit: "/" });
    
    var index = 2;

    // Battery
    const battery = buffer.readInt8(index);
    data.push({ variable: "battery",  value: battery / 10, unit: "V" });
    index += 1;
    
    // Version 
    const version = buffer.readIntBE(index,2);
 
    var version_list = [];
    for (i = version.toString().length; i > 0; i -= 1) {
      version_list.push(Number(version.toString().substring(i, i - 1)));
    }
    version_list.reverse();
    data.push({ variable: "version", value: version_list.join(".") });
    index += 2;

    if (checker == ITC_MODE_MULTI){
      counters = ['a', 'b', 'c'];
      for (counter in counters) {
        const flux_idx = buffer.readIntBE(index,4);
        data.push({ variable: "pulse_counter_flux_"+counters[counter],  value: flux_idx, unit: "count" });
        index += 4;
      }
    } else { //if (checker == ITC_MODE_SINGLE) {
      // Flux
      const flux = buffer.readIntBE(index,4);
      data.push({ variable: "pulse_counter_flux",  value: flux, unit: "count" });
      index += 4;
      
      // Reflux
      const reflux = buffer.readIntBE(index,2);
      data.push({ variable: "pulse_counter_reflux",  value: reflux + (overflow_reflux * 65535), unit: "count" });
      index += 2;

      data.push({ variable: "flux_consumption",  value: flux*resolution_factor[resolution], unit: "m³" });
      data.push({ variable: "reflux_consumption",  value: (reflux + (overflow_reflux * 65535))*resolution_factor[resolution], unit: "m³" });
    }


    return data;

  } catch (e) {
    console.log(e);
    // Return the variable parse_error for debugging.
    return [{ variable: 'parse_error', value: e.message }];
  }
}

// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => x.variable === 'payload_raw' || x.variable === 'payload' || x.variable === 'data' || x.variable === 'frm_payload');
const rssi = payload.find(x => x.variable === 'hardware_rssi' || x.variable === 'rssi');
const snr = payload.find(x => x.variable === 'hardware_snr' || x.variable === 'snr');

if (rssi && snr) {
    const { value, serie, time } = rssi; 
    var quality = "Desconhecido"

    if (snr.value >= 8) {
      quality = "Forte";
    } else if (snr.value >= -2) {
      quality = "Médio";
    } else {
      quality = "Fraco";
    }

    payload = payload.concat([{ variable: "signal_quality",  value: quality}].map(x => ({ ...x, serie, time: x.time || time })));
}

//const ttn_payload = payload.find(x => x.variable === 'ttn_payload_v3');
//if (ttn_payload) {
//  console.log(ttn_payload.value);
//}
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie, time } = payload_raw;

    
  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(parsePayload(value).map(x => ({ ...x, serie, time: x.time || time })));
  }
}