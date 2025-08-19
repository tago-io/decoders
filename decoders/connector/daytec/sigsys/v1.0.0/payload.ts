/* SigSys payload decoder – VM2/CJS-safe, no import/export */

// Validate and split incoming CSV string
function _validateAndSplit(valuesString) {
  if (typeof valuesString !== "string" || valuesString.trim() === "") {
    throw new Error("String Not Valid");
  }

  const splitValues = valuesString.split(",");

  // First field must be "2"
  if (splitValues[0] !== "2") {
    throw new Error("String Not Valid");
  }

  // Require at least 28 fields (up to LONGITUDE) and a sane string length
  var MIN_FIELDS = 28;
  if (splitValues.length < MIN_FIELDS || valuesString.length < 70) {
    throw new Error("String Length Not Valid");
  }

  return splitValues;
}

// Decode one valid CSV line into KV array
function _decode(valuesString) {
  var out = [];
  var s = _validateAndSplit(valuesString);

  var DATA_INDICATOR = s[0];
  var DEVICE_MODE = s[1];
  var DEVICE_GNSS_SETTING = s[2];
  var DEVICE_UPDATE_PER_DAY = s[3];
  var DEVICE_UDOC_UPDATE_ON_CHANGE = s[4];
  var DEVICE_UPDATE_TOLERANCE = s[5];
  var DEVICE_SLOT_1 = s[6];
  var DEVICE_SLOT_2 = s[7];
  var SLOT1_DATA_1 = s[8];
  var SLOT1_DATA_2 = s[9];
  var SLOT1_DATA_3 = s[10];
  var SLOT1_DATA_4 = s[11];
  var SLOT2_DATA_1 = s[12];
  var SLOT2_DATA_2 = s[13];
  var SLOT2_DATA_3 = s[14];
  var SLOT2_DATA_4 = s[15];
  var RELAY_1 = s[16];
  var RELAY_2 = s[17];
  var RELAY_3 = s[18];
  var RELAY_4 = s[19];
  var BASE_ANALOG_1 = s[20];
  var BASE_ANALOG_2 = s[21];
  var BASE_BATTERY_VOLTAGE = s[22];
  var SIGNAL_RSSI = s[23];
  var FIRMWARE_VERSION = s[24];
  var DEVICE_SERIAL_NUMBER = s[25];
  var LATITUDE = s[26];
  var LONGITUDE = s[27];

  // Map device mode
  switch (DEVICE_MODE) {
    case "1":
      DEVICE_MODE = "M1-Online";
      break;
    case "2":
      DEVICE_MODE = "M2-Power Cycle(Time)";
      break;
    case "3":
      DEVICE_MODE = "M3-Power Cycle(Change)";
      break;
    case "4":
      DEVICE_MODE = "M4-Power Cycle(Time + Change)";
      break;
    default:
      break; // leave raw value if unknown
  }

  // GNSS: 0/1 -> OFF/ON
  if (DEVICE_GNSS_SETTING === "1") DEVICE_GNSS_SETTING = "ON";
  else if (DEVICE_GNSS_SETTING === "0") DEVICE_GNSS_SETTING = "OFF";

  // Analog textual to binary
  BASE_ANALOG_1 = BASE_ANALOG_1 === "OPN" ? "0" : "1";
  BASE_ANALOG_2 = BASE_ANALOG_2 === "OPN" ? "0" : "1";

  // Slot codes -> description
  var slotDescriptions = {
    "0": "EXP0-NOTHING",
    "1": "EXP1-POWER",
    "2": "EXP2-DIGITAL",
    "3": "EXP3-RESISTIVE ANALOG",
    "4": "EXP4-ANALOG PRO",
    "5": "EXP5-DISTANCE",
    "6": "EXP6-ACCELEROMETER",
    "7": "EXP7-TEMP AND HUMIDITY",
    "8": "EXP8-LOAD WEIGHT",
    "9": "EXP9-RELAY",
    A: "EXP10-RS232 CUSTOM",
    B: "EXP11-RS485 CUSTOM",
  };
  if (slotDescriptions[DEVICE_SLOT_1]) DEVICE_SLOT_1 = slotDescriptions[DEVICE_SLOT_1];
  if (slotDescriptions[DEVICE_SLOT_2]) DEVICE_SLOT_2 = slotDescriptions[DEVICE_SLOT_2];

  // Output variables
  out.push({ variable: "device", value: DATA_INDICATOR });
  out.push({ variable: "device_mode", value: DEVICE_MODE });
  out.push({ variable: "device_gnss_setting", value: DEVICE_GNSS_SETTING });
  out.push({ variable: "device_update_per_day", value: DEVICE_UPDATE_PER_DAY });
  out.push({ variable: "device_udoc_update_on_change", value: DEVICE_UDOC_UPDATE_ON_CHANGE });
  out.push({ variable: "device_update_tolerance", value: DEVICE_UPDATE_TOLERANCE });
  out.push({ variable: "device_slot_1", value: DEVICE_SLOT_1 });
  out.push({ variable: "device_slot_2", value: DEVICE_SLOT_2 });

  out.push({ variable: "slot1_data_1", value: SLOT1_DATA_1 });
  out.push({ variable: "slot1_data_2", value: SLOT1_DATA_2 });
  out.push({ variable: "slot1_data_3", value: SLOT1_DATA_3 });
  out.push({ variable: "slot1_data_4", value: SLOT1_DATA_4 });

  out.push({ variable: "slot2_data_1", value: SLOT2_DATA_1 });
  out.push({ variable: "slot2_data_2", value: SLOT2_DATA_2 });
  out.push({ variable: "slot2_data_3", value: SLOT2_DATA_3 });
  out.push({ variable: "slot2_data_4", value: SLOT2_DATA_4 });

  out.push({ variable: "relay_1", value: RELAY_1 });
  out.push({ variable: "relay_2", value: RELAY_2 });
  out.push({ variable: "relay_3", value: RELAY_3 });
  out.push({ variable: "relay_4", value: RELAY_4 });

  out.push({ variable: "base_analog_1", value: BASE_ANALOG_1 });
  out.push({ variable: "base_analog_2", value: BASE_ANALOG_2 });

  out.push({ variable: "base_battery_voltage", value: BASE_BATTERY_VOLTAGE });
  out.push({ variable: "signal_rssi", value: SIGNAL_RSSI });
  out.push({ variable: "firmware_version", value: FIRMWARE_VERSION });
  out.push({ variable: "device_serial_number", value: DEVICE_SERIAL_NUMBER });
  out.push({ variable: "latitude", value: LATITUDE });
  out.push({ variable: "longitude", value: LONGITUDE });

  // GNSS location (only if numeric)
  var latNum = parseFloat(LATITUDE);
  var lngNum = parseFloat(LONGITUDE);
  if (isFinite(latNum) && isFinite(lngNum)) {
    out.push({
      variable: "sitelocation",
      value: "My Address",
      location: { lat: latNum, lng: lngNum },
    });
  }

  return out;
}

/* Entry point – uses global `payload` provided by the runner (vm2).
   On success:   payload = [ ...decoded KVs... ]
   On failure:   payload = [{ variable: "parse_error", value: "<msg>" }]
*/
(function () {
  try {
    if (!Array.isArray(payload)) {
      throw new Error("Payload Not Valid");
    }
    var raw = payload.find(function (i) {
      return i && i.variable === "payload";
    });
    if (!raw || typeof raw.value !== "string") {
      throw new Error("Payload Not Valid");
    }
    payload = _decode(String(raw.value));
  } catch (err) {
    var msg = err && err.message ? err.message : "Unknown Error";
   
    payload = [{ variable: "parse_error", value: msg }];
  }
})();
