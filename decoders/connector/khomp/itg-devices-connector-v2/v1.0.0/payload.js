var result = [];

function parseNewMeasures(){
  if (storedMeasures["voltage"] && storedMeasures["current"] && storedMeasures["pwr_factor"])
  {
    var apparent_power = storedMeasures["voltage"] * storedMeasures["current"];
    var active_power = apparent_power * storedMeasures["pwr_factor"];
    var reactive_power = Math.sqrt(Math.pow(apparent_power, 2) - Math.pow(active_power, 2));
    addMeasure({"n":"apparent_power", "v":apparent_power.toFixed(3), "u": "VA"});
    addMeasure({"n":"active_power", "v":active_power.toFixed(3), "u": "W"});
    addMeasure({"n":"reactive_power", "v":reactive_power.toFixed(3), "u": "var"});
  }
  if (storedMeasures["phase_a_voltage"] && storedMeasures["phase_a_current"] && storedMeasures["phase_a_pwr_factor"]) {
    var phase_a_apparent_power = storedMeasures["phase_a_voltage"] * storedMeasures["phase_a_current"];
    var phase_a_active_power = phase_a_apparent_power * storedMeasures["phase_a_pwr_factor"];
    var phase_a_reactive_power = Math.sqrt(Math.pow(phase_a_apparent_power, 2) - Math.pow(phase_a_active_power, 2));
    addMeasure({"n":"phase_a_apparent_power", "v":phase_a_apparent_power.toFixed(3), "u": "VA"});
    addMeasure({"n":"phase_a_active_power", "v":phase_a_active_power.toFixed(3), "u": "W"});
    addMeasure({"n":"phase_a_reactive_power", "v":phase_a_reactive_power.toFixed(3), "u": "var"});
  }
  if (storedMeasures["phase_b_voltage"] && storedMeasures["phase_b_current"] && storedMeasures["phase_b_pwr_factor"]) {
    var phase_b_apparent_power = storedMeasures["phase_b_voltage"] * storedMeasures["phase_b_current"];
    var phase_b_active_power = phase_b_apparent_power * storedMeasures["phase_b_pwr_factor"];
    var phase_b_reactive_power = Math.sqrt(Math.pow(phase_b_apparent_power, 2) - Math.pow(phase_b_active_power, 2));
    addMeasure({"n":"phase_b_apparent_power", "v":phase_b_apparent_power.toFixed(3), "u": "VA"});
    addMeasure({"n":"phase_b_active_power", "v":phase_b_active_power.toFixed(3), "u": "W"});
    addMeasure({"n":"phase_b_reactive_power", "v":phase_b_reactive_power.toFixed(3), "u": "var"});
  }
  if (storedMeasures["phase_c_voltage"] && storedMeasures["phase_c_current"] && storedMeasures["phase_c_pwr_factor"]) {
    var phase_c_apparent_power = storedMeasures["phase_c_voltage"] * storedMeasures["phase_c_current"];
    var phase_c_active_power = phase_c_apparent_power * storedMeasures["phase_c_pwr_factor"];
    var phase_c_reactive_power = Math.sqrt(Math.pow(phase_c_apparent_power, 2) - Math.pow(phase_c_active_power, 2));
    addMeasure({"n":"phase_c_apparent_power", "v":phase_c_apparent_power.toFixed(3), "u": "VA"});
    addMeasure({"n":"phase_c_active_power", "v":phase_c_active_power.toFixed(3), "u": "W"});
    addMeasure({"n":"phase_c_reactive_power", "v":phase_c_reactive_power.toFixed(3), "u": "var"});
  }
  if (storedMeasures["latitude"] && storedMeasures["longitude"]) {
    var gps = { "lat": storedMeasures["latitude"], "lng" : storedMeasures["longitude"]};
    if (storedMeasures["timestamp"]) {
      addMeasure({ n: "gps", v : JSON.stringify(gps)+'-'+storedMeasures["timestamp"], location: gps });
    } else {
      addMeasure({ n: "gps", v : JSON.stringify(gps), location: gps });
    } 
    addMeasure({n : "gps_availability", v: "GPS com conexão"});
  } else if (storedMeasures["latitude"] || storedMeasures["longitude"]) {
    addMeasure({n : "gps_availability", v: "GPS sem conexão"});
  }
  /*
  TODO: Operation_mode e Slot_running são interdependentes
  if (storedMeasures["operation_mode"] && storedMeasures["slot_running"]) {
    if (storedMeasures["operation_mode"] == "Programável" && storedMeasures["slot_running"] == "none") {
      addMeasure({n : "slot_running", v: "GPS sem conexão"});
    }
  } 
  */
  if (storedMeasures["rssi"] && storedMeasures["snr"])
  {
    //addMeasure({n : "quality", v : rssiAndSnrToQuality(storedMeasures["rssi"], storedMeasures["snr"])});
  }
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

function snrToQuality(snr) {
  quality = "Fraco";
  if (snr >= -2)
    quality = "Médio"
  if (snr >= 8)
    quality = "Forte";
  addMeasure({n : "quality", v : quality});
  return snr;
}

function resolveDS18B20(measure) {
  var ds_id;
  if (measure["n"].startsWith("28")) {
    ds_id = measure["n"].toUpperCase();
    addMeasure({"n":"DS18B20_ID_"+ds_id, "v":measure["n"].toUpperCase()});
  }
  if (measure["n"].startsWith("4b")) {
    ds_id = measure["n"].toUpperCase();
    addMeasure({"n":"THW_ID_"+ds_id, "v":measure["n"].toUpperCase()});
  }
  if (ds_id) {    
    if (measure["u"] == "%RH") {
      measure["n"] = "humidity_ow_"+ds_id;
      //measure["u"] = "%";
    }
    else if (measure["u"] == "dB") {
      measure["n"] = "noise_ow_"+ds_id;
    }
    else if (measure["u"] == "lx") {
      measure["n"] = "lux_ow_"+ds_id;
      measure["u"] = "lux";
    }
    else if (measure["u"] == "Cel") {
      
      measure["n"] = "temperature_ow_"+ds_id;
      measure["u"] = "Cel";
    }
  }
}

function opMode(mode) {
  if (mode == "slots")
    return "Programável";
  if (mode == "automatic")
    return "Automático";
  return "Manual";
}

function uvToUvRisk(uv) {
  uv_limits = [0, 3, 6, 8, 11];
  uv_strings = ["Baixo", "Moderado", "Alto", "Muito Alto", "Extremo"];
  for (limit in uv_limits) {
    if (uv >= uv_limits[limit])
      var uv_risk = uv_strings[limit];
  }
  addMeasure({n : "uv_risk", v : uv_risk});
  return uv;
}

function windDirectionToDegree(wind_direction_raw) {
  const windDirectionList = ["Norte", "Nordeste", "Leste", "Sudeste", "Sul", "Sudoeste", "Oeste", "Noroeste", "Norte"];
  var wind_degree = Math.round(wind_direction_raw * 57.2958);
  var wind_direction = windDirectionList[Math.trunc((wind_degree+22.5)/45)];
  addMeasure({n:"direction_name", v: wind_direction});
  return wind_degree;
}

function booleanMeasure(a) {
  return a | 0;
}

function particlesToQuality(particles) {
  particles_limits = [0, 40, 80, 120, 200]
  particles_strings = ["Boa", "Moderada", "Ruim", "Muito Ruim", "Péssima"];
  for (i in particles_limits) {
    if (particles > particles_limits[i])
      var air_quality = particles_strings[i];
  }
  addMeasure({n:"air_quality", v: air_quality});
  return particles;
}

function configToDR(config) {
  var DR_array = ["SF12BW125", "SF11BW125", "SF10BW125", "SF9BW125", "SF8BW125", "SF7BW125", "SF8BW500", "", "SF12BW500", "SF11BW500", "SF10BW500", "SF9BW500", "SF8BW500"];
  var DR = DR_array.indexOf(config);
  var spreading_factor = "", bandwidth = "";
  if (DR >= 0) {
    for (var i = config.search("SF") + 2; i < config.search("BW"); i++) {
      spreading_factor = spreading_factor + config[i];
    }
    for (var i = config.search("BW")+2; i < config.length; i++) {
      bandwidth = bandwidth + config[i];
    }
    addMeasure({n:"bandwidth", v: bandwidth, u: "kHz"});
    addMeasure({n:"spreading_factor", v: spreading_factor});
    //addMeasure({n:"adr", v: false}); // ADR Ainda não implementado no ITG 200
  }
  return DR;
}

var storedMeasures = {};
function parseMeasures(measure) {
  /* Parse messages and fix conflicts
     List works like:
     "measure["n"]" : {"name": {"unit":"new_measure_name", "another_unit":"another_new_measure_name", "default":"ignore unit"}, 
                       "unit" : "new_unity"},
                       "value" : function(measure["v"])},
  */
  const storeNames = [
    "rssi", "snr", 
    "latitude", "longitude", "timestamp",  
    "operation_mode", "slot_running", 
    "voltage", "current", "pwr_factor", "uv", 
    "phase_a_voltage", "phase_a_current", "phase_a_pwr_factor",
    "phase_b_voltage", "phase_b_current", "phase_b_pwr_factor",
    "phase_c_voltage", "phase_c_current", "phase_c_pwr_factor"
  ];
  const convertableNames = {
    "A" : {"name": {"Cel":"internal_temperature", "%RH":"internal_relative_humidity", "°C":"internal_temperature",}},
    "rssi" : {"unit":"dBm", "value": function(a){return a + 30}},
    "snr" : {"value": snrToQuality},
    "datarate" : {"name":{"default":"dr"}},
    "C1" : {"name":{"count":"c1_count", "default":"c1_state"}, "value": booleanMeasure},
    "C2" : {"name":{"count":"c2_count", "default":"c2_state"}, "value": booleanMeasure},
    "timestamp" : {"value":function(a){return Date(a).toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})}},
    // Fotocélula
    "line" : {"name":{"V":"voltage", "A":"current", "/":"pwr_factor", "Hz":"frequency"}},
    "luminosity" : {"name":{"default":"lux"}, "unit":"lux"},
    "angle" : {"unit":"º", "value":function(a){return a * 57.2958}},
    "swing_duty" : {"name":{"default":"swing"}},
    "active" : {"name":{"default":"energy_active"}, "unit": "kWh", "value": function(a){return (a / 3600000).toFixed(3)}},
    "reactive" : {"name":{"default":"energy_reactive"}, "unit": "kvarh","value": function(a){return (a / 3600000).toFixed(3)}},
    "light_on" : {"value": booleanMeasure},
    "light_event" : {"value": booleanMeasure},
    "operation_mode" : {"value":opMode},

    // ITC 100
    "fraud_event" : {"value": booleanMeasure},
    "fraud_status" : {"name":{"default":"fraud"}, "value": booleanMeasure},
    "tamper_detection_event" : {"value": booleanMeasure},
    "tamper_detection_status" : {"value": booleanMeasure},
    "mode" : {"name":{"default":"operation_mode"}},
    "pulse_counter_flux" : {"name":{"default":"pulse_count_flux_a"}},
    "pulse_counter_reflux" : {"name":{"default":"pulse_count_reflux"}},
    "pulse_counter_flux_A" : {"name":{"default":"pulse_count_flux_a"}},
    "pulse_counter_flux_B" : {"name":{"default":"pulse_count_flux_b"}},
    "pulse_counter_flux_C" : {"name":{"default":"pulse_count_flux_c"}},

    // EM R102
    "C3" : {"name":{"count":"emr_c3_count", "default":"emr_c3_status"}, "value": booleanMeasure},
    "C4" : {"name":{"count":"emr_c4_count", "default":"emr_c4_status"}, "value": booleanMeasure},
    "relay-B3" : {"name":{"default":"emr_b3_relay"}, "value": booleanMeasure},
    "relay-B4" : {"name":{"default":"emr_b4_relay"}, "value": booleanMeasure},

    // EM C104
    "current-E1" : {"name":{"default":"emc_e1_curr"}, "unit": "mA", "value": function(a){return a * 1000}},
    "current-E2" : {"name":{"default":"emc_e2_curr"}, "unit": "mA", "value": function(a){return a * 1000}},
    "current-E3" : {"name":{"default":"emc_e3_curr"}, "unit": "mA", "value": function(a){return a * 1000}},
    "current-E4" : {"name":{"default":"emc_e4_curr"}, "unit": "mA", "value": function(a){return a * 1000}},

    // EM S104
    "temperature-E1" : {"name":{"default":"ems_e1_temp"}, "unit": "°C"},
    "pressure-E2" : {"name":{"default":"ems_e2_kpa"}, "unit": "kPa", "value": function(a){return a / 1000}},
    "pressure-E3" : {"name":{"default":"ems_e3_kpa"}, "unit": "kPa", "value": function(a){return a / 1000}},
    "pressure-E4" : {"name":{"default":"ems_e4_kpa"}, "unit": "kPa", "value": function(a){return a / 1000}},    

    // EM W104
    "emw_temperature" : {"name":{"Cel":"emw_temperature"}, "unit":"°C"},
    "emw_humidity" : {"name":{"default":"emw_humidity"}, "unit":"%RH"},
    "emw_solar_radiation" : {"name":{"default":"emw_solar_radiation"}},
    "emw_luminosity" : {"name":{"default":"emw_luminosity"}, "unit":"lux"},
    "emw_uv" : {"name":{"default":"emw_uv"}, "unit" : null, "value": uvToUvRisk},
    "emw_wind_direction" : {"name":{"default":"emw_wind_direction"}, "unit":"°", "value": windDirectionToDegree},
    "emw_gust_wind_speed" : {"name":{"default":"emw_gust_wind_speed"}, "unit":"km/h", "value":function(a){return a * 3.6}},
    "emw_average_wind_speed" : {"name":{"default":"emw_avg_wind_speed"}, "unit":"km/h", "value":function(a){return a * 3.6}},
    "emw_rain_level" : {"name":{"default":"emw_rain_lvl"}, "unit":"mm","value":function(a){return a * 1000}},
    "emw_atm_pressure" : {"name":{"default":"emw_atm_pres"}, "unit":"hPa","value":function(a){return a / 100}},

    // ITE 11LI
    "phaseA_voltage" : {"name":{"default":"phase_a_voltage"}},
    "phaseB_voltage" : {"name":{"default":"phase_b_voltage"}},
    "phaseC_voltage" : {"name":{"default":"phase_c_voltage"}},
    "phaseA_current" : {"name":{"default":"phase_a_current"}},
    "phaseB_current" : {"name":{"default":"phase_b_current"}},
    "phaseC_current" : {"name":{"default":"phase_c_current"}},
    "phaseA_pwr_factor" : {"name":{"default":"phase_a_pwr_factor"}, "unit": null},
    "phaseB_pwr_factor" : {"name":{"default":"phase_b_pwr_factor"}, "unit": null},
    "phaseC_pwr_factor" : {"name":{"default":"phase_c_pwr_factor"}, "unit": null},
    "phaseA_tc_config" : {"name":{"default":"phase_a_tc_config"}},
    "phaseB_tc_config" : {"name":{"default":"phase_b_tc_config"}},
    "phaseC_tc_config" : {"name":{"default":"phase_c_tc_config"}},
    "phaseA_active" : {"name":{"default":"phase_a_active_energy"}, "unit": "kWh", "value": function(a){return a / 3600000}},
    "phaseA_reactive" : {"name":{"default":"phase_a_reactive_energy"}, "unit": "kvarh", "value": function(a){return a / 3600000}},
    "phaseB_active" : {"name":{"default":"phase_b_active_energy"}, "unit": "kWh", "value": function(a){return a / 3600000}},
    "phaseB_reactive" : {"name":{"default":"phase_b_reactive_energy"}, "unit": "kvarh", "value": function(a){return a / 3600000}},
    "phaseC_active" : {"name":{"default":"phase_c_active_energy"}, "unit": "kWh", "value": function(a){return a / 3600000}},
    "phaseC_reactive" : {"name":{"default":"phase_c_reactive_energy"}, "unit": "kvarh", "value": function(a){return a / 3600000}},
    // netvox acelerometro
    "ntc_temp" : {"name":{"default":"temperature"}, "unit": "Cel"},
    "acceleration_x" : {"unit": "m/s²"},
    "acceleration_y" : {"unit": "m/s²"},
    "acceleration_z" : {"unit": "m/s²"},
    // Qualidade do ar
    "pm2.5" : {"name":{"default":"particles"} ,"unit": "ug/m³", "value": particlesToQuality},
    // Vazamento de agua
    "water_leaking" : {"value": booleanMeasure},
    // Controle Remoto
    "trigger:1" : {"name":{"default":"trigger1"},"value": function(a){return 1}},
    "trigger:2" : {"name":{"default":"trigger2"},"value": function(a){return 1}},
    "trigger:3" : {"name":{"default":"trigger3"},"value": function(a){return 1}},
    "alert:1" : {"name":{"default":"alert4"},"value": function(a){return 1}},
    // Sensor de presença
    "1" : {"name":{"default":"presence1"},"value": booleanMeasure},
    //Medidor de Consumo de Energia
    "line-1" : {"name":{"V":"voltage_netvox", "A":"current_netvox", "/":"pwr_factor_netvox", "W":"power_netvox"}},
    "relay-1" : {"name":{"default":"relay1"},"value": booleanMeasure},
    //  Water level

    // NIT 21LV

    // ###
    "version" : {"name":{"default":"firmware_version"}},
    "uplink" : {"name":{"default":"fcnt"}},

    // ITC 2xx // TODO
    //

    // NIT 2xLI
    "ext_pwr" : {"name":{"default":"power"}},
  };
  if (measure.hasOwnProperty("n")) {
    resolveDS18B20(measure);
  }
  conversion = convertableNames[measure["n"]];
  if (conversion) {
    if ("value" in conversion)
      measure["v"] = conversion["value"](measure["v"]);
    if ("name" in conversion) {
      if (measure["u"] in conversion["name"])
        measure["n"] = conversion["name"][measure["u"]];
      else
        measure["n"] = conversion["name"]["default"];
    }
    if ("unit" in conversion)
      measure["u"] = conversion["unit"];
  }
  if (measure["u"] == "/")
    measure["u"] = null;
  if (storeNames.includes(measure["n"])) {
    storedMeasures[measure["n"]] = measure["v"];
  }
}

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

function addMeasure(object_item) {
  result.push({
    variable: eui_prefix+object_item.n,
    value: object_item.v,
    group: group,
    time: time,
    unit: object_item.u,
    location : object_item.location
  });
}
  
var eui_prefix = "";
function parseMessage(payload) {
  result = [];
  try {
    for (var key in payload) {
      if (payload[key].hasOwnProperty("bn")){
        var eui = payload[key].bn;
        if (IS_GATEWAY)
          eui_prefix = eui+"_";
        else if (eui != PARAM_DEVICE_EUI)
          return null;
        addMeasure({n : "device_eui", v : payload[key]["bn"]});
        addMeasure({n : "last_message_received", v : new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})});
      } else {
        if (payload[key].hasOwnProperty("n")){
          resolveValueType(payload[key]);
          if (ignoredMeasures[eui_prefix+payload[key]["n"]] == payload[key]["v"]) {
            console.log("filtered "+eui_prefix+payload[key]["n"]);
            break;
          }
          parseMeasures(payload[key]);
          addMeasure(payload[key]);
        } 
        else {
          throw new Error("Measure name not found");
        }
      }    
    }
    parseNewMeasures();
  } catch (err) {
    console.log("parser error: "+err.message);
    addMeasure({n : "parser_error", v : err.message});
  }
  return result;
}

function parseDataloggerMessage(payload) {
  result = [];
  try {
    for (var item in payload) {
      if (payload[item].hasOwnProperty("bn")) {
        var eui = String(payload[item]["bn"]).split(":")[0];
        var measure_name = String(payload[item]["bn"]).split(":")[1];
        if (IS_GATEWAY)
          eui_prefix = eui+"_";
        addMeasure({n : "device_eui", v : eui});
        addMeasure({n : "last_message_received", v : new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})});
      } 
      else if (payload[item].hasOwnProperty("bu")) {
        var unit = payload[item]["bu"];
      }
      else if (measure_name) {
        payload[item].n = measure_name;
        payload[item].u = unit;
        resolveValueType(payload[item]);
        if (ignoredMeasures[eui_prefix+payload[item]["n"]] == payload[item]["v"]) {
          console.log("filtered "+eui_prefix+payload[item]["n"]);
          break;
        }
        parseMeasures(payload[item]);
        time = new Date(payload[item]["t"]*1000);
        addMeasure(payload[item]);
      }
      else {
        throw new Error("Measure name not found");
      }
    }
  } catch (err) {
    console.log("error: "+err.message);
    time = new Date(payload[0].bt*1000);
    addMeasure({n : "datalogger_error", v : err.message});
  }
  return result;
}

function readDeviceParam(key) {
  for (param in device["params"]) {
    if (device["params"][param]["key"] == key)
      return device["params"][param]["value"];
  }
  return null;
}

function readTag(key) {
  for (param in device["tags"]) {
    if (device["tags"][param]["key"] == key)
      return device["tags"][param]["value"];
  }
  return null;
}

function readIgnoredMeasures(dict) {
  for (param in device["params"]) {
    if (device["params"][param]["key"].startsWith("ignore:")) {
      var measure_name = String(device["params"][param]["key"]).split(":")[1];
      var measure_value = device["params"][param]["value"];
      dict[measure_name] = measure_value;
    }
  }
}

var time;
const group = String(new Date().getTime());

var IS_GATEWAY = 0;

const PARAM_DEVICE_EUI = readDeviceParam("device_eui") ||  readTag("device_eui") || readTag("mac") || "gateway";

if (PARAM_DEVICE_EUI == "gateway") {
  IS_GATEWAY = 1;
}

ignoredMeasures = {};
readIgnoredMeasures(ignoredMeasures);

if (payload[0].hasOwnProperty("bt")){
  time = new Date(payload[0].bt*1000); // Tempo sem timezone. O widget compensa a timezone.
  payload = parseMessage(payload);
}
else if (payload[0].hasOwnProperty("bn")) {
  payload = parseDataloggerMessage(payload);
}
