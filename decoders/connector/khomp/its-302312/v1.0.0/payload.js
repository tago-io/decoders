/** 
 * Payload Parser ITS 3G/Nx2Q - Tago.io
 * v2.0 20/10/20 
 * 
 * Copyright (C) 2020 Khomp, Inc - All rights Reserved.
 */


try {
  const ignore_vars = [];

  function resolveValueType(measure) {
    // Solve multiple values types (int, string, data, boolean)
    const valueTypes = ["v", "vs", "vd", "vb"];
    for (var v_type in valueTypes) {
      if (measure.hasOwnProperty(valueTypes[v_type])) {
        measure["v"] = measure[valueTypes[v_type]];
        return (measure["v"]);
      }
    }
    return "Unknown value type";
  }

  function formatDate(unix_time) {
      const date = new Date(unix_time * 1000);
      return date;
  }

  var convert_data_name_dict = {
    "update": "update_available",
    "ext_pwr": "external_power",
    "relay": "relay_1",
    "env_temp": "AT",
    "env_hum": "AH",
    "c1_status": "C1",
    "c1_count": "C1",
    "c2_status": "C2",
    "c2_count": "C2"
  };

  if (!payload[0].variable) {
      const data = [];
      try {
          const device = payload.find(x => x.bn);

          if (device) {
              const device_time = formatDate(device.bt);
              const serie = device.bt * 1000;
              data.push({ variable: 'serial_number', value: device.bn });
              data.push({ variable: 'time_last_input_br', value: String(formatDate(device.bt))}); // 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]') 

              const rssi = payload.find(x => (x.n === 'rssi'));
              if (rssi) {
                rssi.u = "dBm";
                rssi.v = rssi.v + 30;
                if (rssi.v >= -73)
                  quality = "Forte";
                else if (rssi.v >= -83)
                  quality = "Médio";
                else
                  quality = "Fraco";
              data.push({ variable : 'quality', value: quality, time: device_time});
              }

              for (var key in payload) {
                  if (payload[key].hasOwnProperty("n")) {
                      var measu_time = device_time;
                      if (payload[key].hasOwnProperty("t")) {
                          measu_time = formatDate(device.bt + payload[key].t);
                      }

                      /* remove ':' from var name */
                      let data_name = payload[key].n
                      data_name = data_name.split(":").join("_"); /* same effect as replaceAll, which is not avaliable */

                      if (convert_data_name_dict.hasOwnProperty(data_name)) {
                        data_name = convert_data_name_dict[data_name];
                      }
                      if (data_name.startsWith('4b')) {
                          let data_u = (payload[key].u).replace('%', '');
                          data_name += ('_' + data_u);
                      }

                      data.push({
                          variable: data_name,
                          value: resolveValueType(payload[key]), //payload[key].v || `${payload[key].vb}` || payload[key].vs,
                          time: measu_time,
                          unit: payload[key].u,
                      })
                  }
              }
              
              const lat = payload.find(x => ((x.n === 'latitude') || (x.n === 'lat')));
              const lng = payload.find(x => ((x.n === 'longitude') || (x.n === 'lon')));
              if (lat && lng) {
                position = {};
                position['lat'] = lat.v;
                position['lng'] = lng.v;
                data.push({ variable: 'location', location: position, time: device_time });
              }

              const net_info = payload.find(x => x.current_apn);
              if (net_info) {
                  data.push({ variable: 'net_info', value: net_info.net_info[0], time: device_time });
                  data.push({ variable: 'net_info_band', value: net_info.net_info[2], time: device_time });
                  data.push({ variable: 'current_apn', value: net_info.current_apn, time: device_time });
              }

              const info = payload.find(x => x.device);
              if (info) {
                  data.push({ variable: 'fw_version', value: info.device.firmware, time: device_time });
                  data.push({ variable: 'model', value: info.device.model, time: device_time });
              }
          }

      } catch (err) {
          //data.push({ variable: 'error', value: err.message });
          console.log(err.message);
      }
      payload = data;
  }
} catch (err) {
  console.log(err.message);
}