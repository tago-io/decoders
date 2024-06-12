try {
  payload_raw = payload.find((x) => x.variable === 'payload' || x.variable === 'payload_raw');
  port = payload.find((x) => x.variable === 'port' || x.variable === 'fPort' || x.variable === 'fport');
  rssi = payload.find((x) => x.variable === 'rssi' || x.variable === 'hardware_rssi');
  snr = payload.find((x) => x.variable === 'snr' || x.variable === 'hardware_snr');
  timestamp = payload.find((x) => x.variable === 'timestamp');
  recvTime = payload.find((x) => x.variable === 'recvTime');
  var serie;
  var time;
  // Normalizando o nome para diferentes networks
  if (rssi)
    rssi.variable = 'rssi';
  if (snr)
    snr.variable = 'snr';

  if (payload_raw && port) {
    serie = payload_raw.serie;
    if (timestamp) 
      time = timestamp.value;
    else if (recvTime)
      time = recvTime.value;
    payload_to_bytes = Buffer.from(payload_raw.value, "hex");
    decodedPayload = Decoder(payload_to_bytes, port.value);
    for (i in decodedPayload) {
      addMeasure(decodedPayload[i]);
    }
  }
  if (rssi && snr) {
    addMeasure({n: 'signal_quality', v:rssiAndSnrToQuality(rssi.value, snr.value)})
  }
  voltage = payload.find((x) => x.variable === 'voltage');
  current = payload.find((x) => x.variable === 'current');
  power_factor = payload.find((x) => x.variable === 'power_factor');
  if (voltage && current && power_factor) {
    var apparent_power = voltage.value * current.value;
    var active_power = apparent_power * power_factor.value;
    var reactive_power = Math.sqrt(Math.pow(apparent_power, 2) - Math.pow(active_power, 2));
    addMeasure({"n":"apparent_power", "v":apparent_power, "u": "VA"});
    addMeasure({"n":"active_power", "v":active_power, "u": "W"});
    addMeasure({"n":"reactive_power", "v":reactive_power, "u": "var"});
  }
  
  //if (time) {
//    for (i in payload) {
      //payload[i].time = time * 1000;
    //}
  //}
} catch (e) {
  console.log("parser error: " + e.message);
}

function rssiAndSnrToQuality(rssi, snr) {
  var quality;
  if (rssi > -70 && snr > 0) 
    quality = "Excelente";
  else if (rssi > -110 && snr > -5)
    quality = "Bom"
  else if (rssi > -120 && snr > -20)
    quality = "Operável";
  else 
    quality = "Não operável";
  return quality;
}

function addMeasure(measure) {
  payload.push({
    variable: measure.n,
    value: measure.v,
    serie: serie,
    time: time,
    unit: measure.u,
    location : measure.location
  });
}

function setTimestamp(timestamp) {
  time = timestamp;
}

// ### NÃO ALTERAR NADA A PARTIR DAQUI

//###DECODER_POINT###
/**
* Decode an uplink message from a buffer (array) of bytes to an object of fields.
* If use ChirpStack, rename the function to "function Decode(port, bytes, variables)"
*/
function Decoder(bytes, port) {
  var decoded = [];

  var model = {};
  model.n = "model";
  switch(port)
  {
    case 5: model.v = "ITP100"; break;
    case 6: model.v = "ITP101"; break;
    case 7: model.v = "ITP110"; break;
    case 8: model.v = "ITP111"; break;
  }
  decoded.push(model);

  var message_type = {};
  message_type.n = 'message_type';
  if (bytes[0] == 0x4C && bytes[1] == 0x01)
  {
    message_type.v = 'measures_report';
    var firmware_version = {};
    firmware_version.n = "firmware_version";
    firmware_version.v = (bytes[3] & 0x0F) + '.' +  ((bytes[3] >> 4) & 0x0F) + '.' +
      (bytes[2] & 0x0F) + '.' +  ((bytes[2] >> 4) & 0x0F);
    decoded.push(firmware_version);

    mask = (bytes[4] << 24) +  (bytes[5] << 16) + (bytes[6] << 8)  + bytes[7];

    var i = 7;

    if (mask >> 0 & 0x01) {
      var voltage = {};
      voltage.n = 'voltage';
      voltage.v = ((bytes[++i] << 8) + bytes[++i])/10.0;
      voltage.u = 'V';
      decoded.push(voltage);
    }
    if (mask >> 1 & 0x01) {
      var current = {};
      current.n = 'current';
      current.v = ((bytes[++i] << 16) + (bytes[++i] << 8) + bytes[++i])/10000.0;
      current.u = 'A';
      decoded.push(current);
    }
    if (mask >> 2 & 0x01) {
      var power_factor = {};
      power_factor.n = 'power_factor';
      power_factor.v = ((bytes[++i] << 8) + bytes[++i])/1000.0;
      decoded.push(power_factor);
    }
    if (mask >> 3 & 0x01) {
      var frequency = {};
      frequency.n = 'frequency';
      frequency.v = ((bytes[++i] << 8) + bytes[++i])/1000.0;
      frequency.u = 'Hz';
      decoded.push(frequency);
    }
    if (mask >> 4 & 0x01) {
      var temperature = {};
      temperature.n = 'temperature';
      temperature.v = ((bytes[++i] << 8) + bytes[++i])/100.0;
      temperature.u = 'K';
      decoded.push(temperature);
    }
    if (mask >> 5 & 0x01) {
      var lux = {};
      lux.n = 'lux';
      lux.v = ((bytes[++i] << 8) + bytes[++i])/1.0;
      lux.u = 'lx';
      decoded.push(lux);
    }
    if (mask >> 6 & 0x01) {
      var angle = {};
      angle.n = 'angle';
      angle.v = ((bytes[++i] << 8) + bytes[++i])/100.0;
      angle.u = '°';
      decoded.push(angle);
    }
    if (mask >> 7 & 0x01) {
      var swing_duty = {};
      swing_duty.n = 'swing_duty';
      swing_duty.v = ((bytes[++i] << 8) + bytes[++i])/100.0;
      swing_duty.u = '%'
      decoded.push(swing_duty);
    }
    if (mask >> 8 & 0x01) {
      var std_deviation = {};
      std_deviation.n = 'std_deviation';
      std_deviation.v = ((bytes[++i] << 8) + bytes[++i])/100.0;
      decoded.push(std_deviation);
    }
    if (mask >> 9 & 0x01) {
      var energy_active = {};
      energy_active.n = 'energy_active';
      energy_active.v = ((bytes[++i] << 56) + (bytes[++i] << 48) +
                        (bytes[++i] << 40) + (bytes[++i] << 32) +
                        (bytes[++i] << 24) + (bytes[++i] << 16) +
                        (bytes[++i] << 8))/1000000.0;
      energy_active.u = 'kWh';
      decoded.push(energy_active);
    }
    if (mask >> 10 & 0x01) {
      var energy_reactive = {};
      energy_reactive.n = 'energy_reactive';
      energy_reactive.v = ((bytes[++i] << 56) + (bytes[++i] << 48) +
                          (bytes[++i] << 40) + (bytes[++i] << 32) +
                          (bytes[++i] << 24) + (bytes[++i] << 16) +
                          (bytes[++i] << 8))/1000000.0;
      energy_reactive.u = 'kWh';
      decoded.push(energy_reactive);
    }
    if (mask >> 11 & 0x01) {
      var latitude = ((bytes[++i] << 24)  + (bytes[++i] << 16) +
                      (bytes[++i] << 8)   +  bytes[++i]) >>> 0;
      var longitude = ((bytes[++i] << 24) + (bytes[++i] << 16) +
                        (bytes[++i] << 8)  +  bytes[++i]) >>> 0;

      if (latitude  >> 31 & 0x01) {
        latitude = - (latitude - 0x80000000);
      }
      latitude = latitude/1000000.0;

      if (longitude  >> 31 & 0x01) {
        longitude = - (longitude - 0x80000000);
      }
      longitude = longitude/1000000.0;

      pos = {'lat' : latitude, 'lng' : longitude}
      gps = {n:'gps', v:latitude+','+longitude, position:pos};
      decoded.push(gps);
    }
    if (mask >> 12 & 0x01) {
      var dimmer_duty = {};
      dimmer_duty.n = 'dimmer_duty';
      dimmer_duty.v = bytes[++i];
      decoded.push(dimmer_duty);
    }
    if (mask >> 13 & 0x01) {
      var last_commutation = {};
      last_commutation.n = 'last_commutation';
      last_commutation.v = (bytes[++i] << 8) + bytes[++i];
      last_commutation.u = 's';
      decoded.push(last_commutation);
    }
    var light_on = {};
    light_on.n = 'light_on';
    light_on.v = mask >> 14 & 0x01;
    decoded.push(light_on);

    var operation_mode = {};
    operation_mode.n = 'operation_mode';
    switch (mask >> 16 & 0x03) {
      case 0:  operation_mode.v = "manual";    break;
      case 1:  operation_mode.v = "automatic"; break;
      case 2:  operation_mode.v = "slots";     break;
      default: operation_mode.v = "error";     break;
    }
    decoded.push(operation_mode);

    var rtc_syncronized = {};
    rtc_syncronized.n = 'rtc_syncronized';
    rtc_syncronized.v = mask >> 18 & 0x01;
    decoded.push(rtc_syncronized);

    if (mask >> 19 & 0x01) {
      var timestamp = {};
      timestamp.n = 'timestamp';
      timestamp.v = (bytes[++i] << 24) + (bytes[++i] << 16) +
                    (bytes[++i] << 8)  +  bytes[++i];
      //setTimestamp(timestamp.v);
      decoded.push(timestamp);
    }

    var slot_running = {};
    slot_running.n = 'slot_running';
    switch(mask >> 20 & 0x03) {
      case 0:  slot_running.v = "Slot 0"; break;
      case 1:  slot_running.v = "Slot 1"; break;
      case 2:  slot_running.v = "Slot 2"; break;
      case 15: slot_running.v = "None";   break;
      default: slot_running.v = "None";   break;
    }
    decoded.push(slot_running);
  }
  else if (bytes[0] == 0x4B && bytes[1] == 0x02) {
    message_type.v = 'alarm_tilt';
  }
  else if (bytes[0] == 0x4B && bytes[1] == 0x03) {
    message_type.v = 'alarm_power';
  }
  else if (bytes[0] == 0x4B && bytes[1] == 0x04) {
    message_type.v = 'alarm_report';
    if (bytes[2] >> 0 & 0x01) {
      message_type.v = message_type.v + "_power_meter_fail";
    }
    if (bytes[2] >> 1 & 0x01) {
      message_type.v = message_type.v + "_lux_sensor_fail";
    }
    if (bytes[2] >> 2 & 0x01) {
      message_type.v = message_type.v + "_gps_sensor_fail";
    }
    if (bytes[2] >> 3 & 0x01) {
      message_type.v = message_type.v + "_accelerometer_fail";
    }
  }
  else if (bytes[0] == 0x4B && bytes[1] == 0x05) {
    var light_on = {};
    light_on.n = 'light_on';
    light_on.v = (bytes[2] == 0x01);
    decoded.push(light_on);

    var event_time = {};
    event_time.n = 'event_time';
    event_time.v = ((bytes[3] << 24)  + (bytes[4] << 16) +
                          (bytes[5] << 8)   +  bytes[6]) >>> 0;
    decoded.push(event_time);
  }
  if (message_type.v)
    decoded.push(message_type);
  return decoded;
}