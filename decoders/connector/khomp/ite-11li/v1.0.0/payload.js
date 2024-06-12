result = [];

Number.prototype.round = function (n) {
  const d = Math.pow(10, n);
  return Math.round((this + Number.EPSILON) * d) / d;
};

try {
  payload_raw = payload.find((x) => x.variable.includes("payload"));
  port = payload.find((x) => x.variable.includes("port") || x.variable === 'fPort' || x.variable === 'fport');
  rssi = payload.find((x) => x.variable.includes("rssi") || x.variable === 'hardware_rssi');
  snr = payload.find((x) => x.variable.includes("snr") || x.variable === 'hardware_snr');
  if (rssi) {
    rssi.variable = 'hardware_rssi';
  }
  if (snr) {
    snr.variable = 'hardware_snr';
  }
  if (rssi && snr) {
    payload.push({
      variable: "quality",
      value: snrToQuality(snr.value),
      time: rssi.time,
      serie: rssi.serie,
    })
  }
  if (payload_raw && port) {
    serie = payload_raw.serie;
    time = payload_raw.time;
    payload_bytes = Buffer.from(payload_raw.value, "hex");
    decoded = [];
    decoded = Decoder(payload_bytes, port.value);
    payload = payload.concat(decodedToPayload(decoded));
  } else {
    console.log("Error: payload and port not found")
    payload = [];
  }
} catch (e) {
  console.log("parser error: " + e.message);
}

function snrToQuality(snr) {
  quality = "Fraco";
  if (snr >= -2)
    quality = "Médio"
  if (snr >= 8)
    quality = "Forte";
  return quality;
}

function addMeasure(data_arr, measure_obj) {
  data_arr.push({
    variable: measure_obj.name,
    value: measure_obj.value,
    serie: serie,
    time: time,
    unit: measure_obj.unit,
    location: measure_obj.location,
  });
}

function decodedToPayload(decoded) {
  data_array = [];
  for (i in decoded) {
    data_array.push({
      variable: decoded[i].n,
      value: decoded[i].v,
      serie: serie,
      time: time,
      unit: decoded[i].u
    })
  }
  return data_array;
}

function Decoder(bytes, port) {
  var i = 0;
  var decoded = [];
  var decode_ver = bytes[i++];

  model = {};
  if (decode_ver < 3) {
    model.n = "model";
    switch (port) {
      case 10: model.v = "ITE11LI"; break;
      default: model.v = "Unknow Model"; return model;
    }

    mask = (bytes[i++] << 8) | bytes[i++];

    // Firmware
    if (mask >> 0 & 0x01) {
      var firmware = {};
      firmware.n = "firmware_version";
      firmware.v = (bytes[i] >> 4 & 0x0F) + '.' + (bytes[i++] & 0x0F) + '.';
      firmware.v += (bytes[i] >> 4 & 0x0F) + '.' + (bytes[i++] & 0x0F);
      decoded.push(firmware);
    }

    // Temperature
    if (mask >> 1 & 0x01) {
      var temperature = {};
      temperature.n = 'temperature';
      temperature.v = (bytes[i++] / 2).round(1);
      temperature.u = 'C';
      decoded.push(temperature);
    }

    // Frequency
    if (mask >> 2 & 0x01) {
      var frequency = {};
      frequency.n = 'frequency';
      frequency.v = ((bytes[i++] / 10.0) + 45).round(1);
      frequency.u = 'Hz';
      decoded.push(frequency);
    }

    var c1_state_name = ["OPEN", "CLOSED"];
    var phases_name = ["phase_a", "phase_b", "phase_c"];
    var tc_config_name = ["POWCT-T16-150-333", "POWCT-T24-250-333", "POWCT-T36-630-333", "POWCT-T50-1500-333",
      "POWCT-T16-25-333", "POWCT-T16-40-333", "POWCT-T16-100-333"];

    var total_ac_energy = 0;
    var total_re_energy = 0;

    for (var index = 0; index < 3; index++) {
      if (mask >> (3 + index) & 0x01) {
        var phase = [];
        var voltage = {};
        var current = {};
        var pwr_factor = {};
        var active_energy = {};
        var reactive_energy = {};
        var tc_config = {};

        voltage.n = phases_name[index] + "_" + 'voltage';
        voltage.v = (((bytes[i++] << 8) | bytes[i++]) / 10.0).round(1);
        voltage.u = 'V';
        decoded.push(voltage);

        current.n = phases_name[index] + "_" + 'current';
        if (decode_ver == 1) {
          current.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).round(3);
        }
        else {
          current.v = (((bytes[i++] << 8) | bytes[i++]) / 20.0).round(2);
        }
        current.u = 'A';
        decoded.push(current);

        pwr_factor.n = phases_name[index] + "_" + 'pwr_factor';
        pwr_factor.v = ((bytes[i++] / 100.0) - 1).round(2);
        pwr_factor.u = '/';
        decoded.push(pwr_factor);

        active_energy.n = phases_name[index] + "_" + 'active_energy';
        active_energy.v = ((bytes[i++] << 24) | (bytes[i++] << 16) | (bytes[i++] << 8) | bytes[i++]);
        total_ac_energy += (active_energy.v / 100.0);
        active_energy.v = (active_energy.v / 100.0).round(2);
        active_energy.u = 'kWh';
        decoded.push(active_energy);

        reactive_energy.n = phases_name[index] + "_" + 'reactive_energy';
        reactive_energy.v = ((bytes[i++] << 24) | (bytes[i++] << 16) | (bytes[i++] << 8) | bytes[i++]);
        total_re_energy += (reactive_energy.v / 100.0);
        reactive_energy.v = (reactive_energy.v / 100.0).round(2);
        reactive_energy.u = 'kWh';
        decoded.push(reactive_energy);

        tc_config.n = phases_name[index] + '_tc_config';
        tc_config.v = tc_config_name[bytes[i++]];
        decoded.push(tc_config);

        var apparent_power = {};
        apparent_power.n = phases_name[index] + '_' + 'apparent_power';
        apparent_power.v = (voltage.v * current.v).round(2);
        apparent_power.u = 'VA';
        decoded.push(apparent_power);

        var active_power = {};
        active_power.n = phases_name[index] + '_' + 'active_power';
        active_power.v = (apparent_power.v * pwr_factor.v).round(2);
        active_power.u = 'W';
        decoded.push(active_power);

        var reactive_power = {};
        reactive_power.n = phases_name[index] + '_' + 'reactive_power';
        reactive_power.v = (Math.sqrt(Math.pow(apparent_power.v, 2) - Math.pow(active_power.v, 2))).round(2);
        reactive_power.u = 'VAr';
        decoded.push(reactive_power);
      }
    }

    // Total active energy
    var total_active_energy = {};
    total_active_energy.n = 'total_active_energy';
    total_active_energy.v = total_ac_energy;
    total_active_energy.u = 'kWh';
    decoded.push(total_active_energy);

    // Total reactive energy
    var total_reactive_energy = {};
    total_reactive_energy.n = 'total_reactive_energy';
    total_reactive_energy.v = total_re_energy;
    total_reactive_energy.u = 'kWh';
    decoded.push(total_reactive_energy);

    // B1
    if (mask >> 6 & 0x01) {
      var b1_state = {};
      b1_state.n = 'b1_state';
      b1_state.v = c1_state_name[bytes[i++]];
      b1_state.u = 'bool';

      decoded.push(b1_state);
    }
  }

  return decoded;
}