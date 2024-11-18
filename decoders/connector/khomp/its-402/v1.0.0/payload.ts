//@ts-nocheck
/**
 * Payload Parser ITS 402 - Tago.io
 * v2.0 28/10/21
 *
 * Copyright (C) 2021 Khomp, Inc - All rights Reserved.
 */
const FIX_COMMAND_TIME = 1;

const language_dict = {
  raw: {},
  EN: {},
  PT: {
    unknown: "Desconhecido",
    no_signal: "Sem sinal",
    excellent: "Excelente",
    good: "Bom",
    mid_cell: "Médio",
    with_position: "Com posição",
    getting_position: "Sem posição",
    accepted: "Aceito",
    rejected: "Rejeitado",
    discharging: "Descarregando",
    battery_full: "Bateria cheia",
    charging: "Carregando",
    not_found: "Não encontrado",
    charging_error: "Erro no carregamento",
  },
};

const bool_language_dict = {
  raw: {},
  EN: {
    gps_enabled: { true: "Enabled", false: "Disabled" },
    gps_ext_antenna: { true: "External", false: "Internal" },
    external_power: { true: "Connected", false: "Disconnected" },
    C1: { true: "Closed", false: "Open" },
    C2: { true: "Closed", false: "Open" },
    update: { true: "Available", false: "Not available" },
    softsim: { true: "Enabled", false: "Disabled" },
  },
  PT: {
    gps_enabled: { true: "Ativado", false: "Desativado" },
    gps_ext_antenna: { true: "Externa", false: "Interna" },
    external_power: { true: "Conectada", false: "Desconectada" },
    C1: { true: "Fechado", false: "Aberto" },
    C2: { true: "Fechado", false: "Aberto" },
    update: { true: "Disponível", false: "Não disponível" },
    softsim: { true: "Ativado", false: "Desativado" },
  },
};

function resolveValueType(measure) {
  // Solve multiple values types (int, string, data, boolean)
  const valueTypes = ["v", "vs", "vd", "vb"];
  for (var v_type in valueTypes) {
    if (measure.hasOwnProperty(valueTypes[v_type])) {
      measure["v"] = measure[valueTypes[v_type]];
      return measure["v"];
    }
  }
  return "Unknown value type";
}

function formatDate(unix_time) {
  const date = new Date(unix_time * 1000);
  return date;
}

const convert_data_name_dict = {
  ext_pwr: "external_power",
  relay: "relay_1",
  env_temp: "AT",
  env_hum: "AH",
  c1_status: "C1",
  c1_count: "C1",
  c2_status: "C2",
  c2_count: "C2",
};

function getBoolString(variable, value) {
  if (language == "raw") return value;
  return bool_language_dict[language][variable][value];
}

const frequencyTable = {
  "1": "2100",
  "2": "1900",
  "3": "1800",
  "4": "1700",
  "5": "850",
  "8": "900",
  "11": "1500",
  "12": "700",
  "13": "700",
  "18": "850",
  "19": "850",
  "20": "800",
  "25": "1900",
  "26": "850",
  "28": "700",
  "66": "1700",
  "71": "600",
  "85": "700",
};

function bandToFrequency(band_str, device_time) {
  band = band_str.replace("LTE BAND ", "");
  if (frequencyTable.hasOwnProperty(band)) return { variable: "network_frequency", value: frequencyTable[band], unit: "MHz", time: device_time };
  return;
}

function parsePayload(payload) {
  try {
    if (payload[0].variable) return;
    const device_its = payload.find((x) => x.bn);
    if (!device_its) return;
    var data = [];
    const device_time = formatDate(device_its.bt);
    data.push({ variable: "serial_number", value: device_its.bn });
    data.push({
      variable: "time_last_input_br",
      value: dayjs(device_its.bt * 1000)
        .tz("America/Sao_Paulo")
        .format("HH:mm:ss DD/MM/YY"),
    });
    for (var key in payload) {
      if (!payload[key].hasOwnProperty("n")) {
        continue;
      }
      var measu_time = device_time;
      if (payload[key].hasOwnProperty("t")) {
        measu_time = formatDate(device_its.bt + payload[key].t);
      }
      let data_name = payload[key].n;
      data_name = data_name.split(":").join("_");

      if (convert_data_name_dict.hasOwnProperty(data_name)) {
        data_name = convert_data_name_dict[data_name];
      }
      if (data_name.startsWith("4b")) {
        let data_u = payload[key].u.replace("%", "");
        data_name += "_" + data_u;
      }
      value = resolveValueType(payload[key]);
      if ((value == true || value == false) && bool_language_dict[language].hasOwnProperty(data_name)) {
        value = getBoolString(data_name, value);
      }
      if (language_dict[language].hasOwnProperty(value)) {
        value = language_dict[language][value];
      }
      data.push({
        variable: data_name,
        value: value, // resolveValueType(payload[key]),
        time: measu_time,
        unit: payload[key].u,
      });
    }
    const lat = payload.find((x) => x.n === "lat");
    const lng = payload.find((x) => x.n === "lon");
    if (lat && lng) {
      position = { lat: lat.v, lng: lng.v };
      data.push({ variable: "location", location: position, time: device_time });
    }
    const battery = data.find((x) => x.variable === "battery");
    if (battery) {
      battery.value = parseFloat(battery.value.toFixed(2));
    }
    const softsim = payload.find((x) => x.softsim);
    if (softsim) {
      data.push({ variable: "softsim", value: getBoolString("softsim", softsim.softsim.enabled), time: device_time });
    }
    const net_info = payload.find((x) => x.net_info);
    if (net_info) {
      var net_name = net_info.net_info[0];
      if (net_name == "eMTC") {
        net_name = "LTE Cat-M1";
        //data.push(bandToFrequency(net_info.net_info[2], device_time));
      }
      data.push({ variable: "net_info", value: net_name, time: device_time });
      data.push({ variable: "net_info_band", value: net_info.net_info[2], time: device_time });
      data.push({ variable: "network_frequency", value: net_info.net_info[3], unit: "MHz", time: device_time });
      data.push({ variable: "current_apn", value: net_info.current_apn, time: device_time });
      if (net_info.hasOwnProperty("operator")) data.push({ variable: "operator", value: net_info.operator, time: device_time });
    }
    const info = payload.find((x) => x.device);
    if (info) {
      data.push({ variable: "fw_version", value: info.device.firmware, time: device_time });
      data.push({ variable: "model", value: info.device.model, time: device_time });
    }
    const gps = payload.find((x) => x.gps);
    if (gps) {
      data.push({ variable: "gps_fix_time", value: gps.gps.fix_time, unit: "s", time: device_time });
      data.push({ variable: "gps_enabled", value: getBoolString("gps_enabled", gps.gps.enabled), time: device_time });
      data.push({ variable: "gps_ext_antenna", value: getBoolString("gps_ext_antenna", gps.gps.ext_antenna), time: device_time });
    }
    const sensor = payload.find((x) => x.sensor);
    if (sensor) {
      data.push({ variable: "sampling_period", value: sensor.sensor.sampling_period, unit: "s", time: device_time });
    }
    const rssi = data.find((x) => x.variable === "rssi");
    if (rssi) {
      rssi.unit = "dBm";
      rssi.value = rssi.value + 30;
    }
    if (FIX_COMMAND_TIME) {
      const relay = data.find((x) => x.variable.startsWith("relay"));
      if (relay) {
        relay.time = new Date();
      }
      const config = data.find((x) => x.variable === "config");
      if (config) {
        config.time = new Date();
      }
      const command = data.find((x) => x.variable === "command");
      if (command) {
        command.time = new Date();
      }
    }
  } catch (err) {
    console.log("Parser error: " + err.message);
  }
  return data;
}

var language = "EN";
language_obj = device.params.find((x) => x.key === "language");
if (language_obj) {
  if (!language_dict.hasOwnProperty(language_obj.value)) {
    console.log("This language is not supported, using EN as fallback. Available params: 'EN', 'PT', 'raw'.");
  }
  language = language_obj.value;
} else {
  console.log("Language not found, using EN as fallback. Set Configuration Parameters 'language' with params: 'EN', 'PT', 'raw'.");
}

const decodeData = payload.find((x) => x.bn);

if (decodeData) {
  payload = parsePayload(payload);
}
