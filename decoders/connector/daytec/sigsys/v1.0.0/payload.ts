/* 
** NOTES:
   The SigSys sends a string of characters that gets split into specific inputs. 

** TESTING
[
  {
        "variable": "payload",
        "value": "2,3,0,1,OFF,1,4,0,000000,000000,000000,000000,000000,000000,000000,000000,1,1,1,1,0.0762,OPN,3.9027,15,1.8,SS0001,-26.22951,28.13108",
        "metadata": {
        "mqtt_topic": "&0015"
        }
  }
]

*/

function devicetester(bytes) {
  const valuesString = bytes;
  const splitValues = valuesString.split(",");
  const device = splitValues[0]; // DATA INDICATOR
  if (device !== "2") {
    throw new Error("String Not Valid");
  }
  if (valuesString.length < 70) {
    throw new Error("String Length Not Valid");
  }
  decodedPayload(bytes);
}

function decodedPayload(data) {
  const valuesString = data;
  const splitValues = valuesString.split(",");

  const DATA_INDICATOR = splitValues[0];
  let DEVICE_MODE = splitValues[1];
  let DEVICE_GNSS_SETTING = splitValues[2];
  const DEVICE_UPDATE_PER_DAY = splitValues[3];
  const DEVICE_UDOC_UPDATE_ON_CHANGE = splitValues[4];
  const DEVICE_UPDATE_TOLERANCE = splitValues[5];
  let DEVICE_SLOT_1 = splitValues[6];
  let DEVICE_SLOT_2 = splitValues[7];
  const SLOT1_DATA_1 = splitValues[8];
  const SLOT1_DATA_2 = splitValues[9];
  const SLOT1_DATA_3 = splitValues[10];
  const SLOT1_DATA_4 = splitValues[11];
  const SLOT2_DATA_1 = splitValues[12];
  const SLOT2_DATA_2 = splitValues[13];
  const SLOT2_DATA_3 = splitValues[14];
  const SLOT2_DATA_4 = splitValues[15];
  const RELAY_1 = splitValues[16];
  const RELAY_2 = splitValues[17];
  const RELAY_3 = splitValues[18];
  const RELAY_4 = splitValues[19];
  let BASE_ANALOG_1 = splitValues[20];
  let BASE_ANALOG_2 = splitValues[21];
  const BASE_BATTERY_VOLTAGE = splitValues[22];
  const SIGNAL_RSSI = splitValues[23];
  const FIRMWARE_VERSION = splitValues[24];
  const DEVICE_SERIAL_NUMBER = splitValues[25];
  const LATITUDE = splitValues[26];
  const LONGITUDE = splitValues[27];

  // Convert DEVICE_MODE to descriptive text
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
  }

  // Convert GNSS mode to On/Off only if it's 0 or 1
  if (DEVICE_GNSS_SETTING === "1") {
    DEVICE_GNSS_SETTING = "ON";
  } else if (DEVICE_GNSS_SETTING === "0") {
    DEVICE_GNSS_SETTING = "OFF";
  }

  // Convert analog 1 to opn and closed
  if (BASE_ANALOG_1 === "OPN") {
    BASE_ANALOG_1 = "0";
  } else {
    BASE_ANALOG_1 = "1";
  }

  // Convert analog 2 to opn and closed
  if (BASE_ANALOG_2 === "OPN") {
    BASE_ANALOG_2 = "0";
  } else {
    BASE_ANALOG_2 = "1";
  }

  // Convert EXP codes to descriptive slot names
  const slotDescriptions = {
    "0": "EXP0-NOTHING",
    "1": "EXP1-POWER",
    "2": "EXP2-DIGITAL",
    "3": "EXP3-RESISTIVE ANALOG",
    "4": "EXP4-ANALOG PRO",
    "5": "EXP5-DISTANCE",
    "6": "EXP6- ACCELEROMETER",
    "7": "EXP7-TEMP AND HUMIDITY",
    "8": "EXP8-LOAD WEIGHT",
    "9": "EXP9-RELAY",
    A: "EXP10-RS232 CUSTOM",
    B: "EXP11-RS485 CUSTOM",
  };

  if (slotDescriptions[DEVICE_SLOT_1]) {
    DEVICE_SLOT_1 = slotDescriptions[DEVICE_SLOT_1];
  }
  if (slotDescriptions[DEVICE_SLOT_2]) {
    DEVICE_SLOT_2 = slotDescriptions[DEVICE_SLOT_2];
  }

  payload.push({ variable: "device", value: DATA_INDICATOR });
  payload.push({ variable: "device_mode", value: DEVICE_MODE });
  payload.push({ variable: "device_gnss_setting", value: DEVICE_GNSS_SETTING });
  payload.push({ variable: "device_update_per_day", value: DEVICE_UPDATE_PER_DAY });
  payload.push({ variable: "device_udoc_update_on_change", value: DEVICE_UDOC_UPDATE_ON_CHANGE });
  payload.push({ variable: "device_update_tolerance", value: DEVICE_UPDATE_TOLERANCE });
  payload.push({ variable: "device_slot_1", value: DEVICE_SLOT_1 });
  payload.push({ variable: "device_slot_2", value: DEVICE_SLOT_2 });
  payload.push({ variable: "slot1_data_1", value: SLOT1_DATA_1 });
  payload.push({ variable: "slot1_data_2", value: SLOT1_DATA_2 });
  payload.push({ variable: "slot1_data_3", value: SLOT1_DATA_3 });
  payload.push({ variable: "slot1_data_4", value: SLOT1_DATA_4 });
  payload.push({ variable: "slot2_data_1", value: SLOT2_DATA_1 });
  payload.push({ variable: "slot2_data_2", value: SLOT2_DATA_2 });
  payload.push({ variable: "slot2_data_3", value: SLOT2_DATA_3 });
  payload.push({ variable: "slot2_data_4", value: SLOT2_DATA_4 });
  payload.push({ variable: "relay_1", value: RELAY_1 });
  payload.push({ variable: "relay_2", value: RELAY_2 });
  payload.push({ variable: "relay_3", value: RELAY_3 });
  payload.push({ variable: "relay_4", value: RELAY_4 });
  payload.push({ variable: "base_analog_1", value: BASE_ANALOG_1 });
  payload.push({ variable: "base_analog_2", value: BASE_ANALOG_2 });
  payload.push({ variable: "base_battery_voltage", value: BASE_BATTERY_VOLTAGE });
  payload.push({ variable: "signal_rssi", value: SIGNAL_RSSI });
  payload.push({ variable: "firmware_version", value: FIRMWARE_VERSION });
  payload.push({ variable: "device_serial_number", value: DEVICE_SERIAL_NUMBER });
  payload.push({ variable: "latitude", value: LATITUDE });
  payload.push({ variable: "longitude", value: LONGITUDE });

  // GNSS Location

  payload.push({
    variable: "sitelocation",
    value: "My Address",
    location: {
      lat: parseFloat(LATITUDE),
      lng: parseFloat(LONGITUDE),
    },
  });

  // FIXED LOCATION FROM MAPS https://www.gps-coordinates.net/
  //   payload.push({ "variable": "Sitelocation","value":"My Address","location": {"lat":-26.163531, "lng":28.164376 }});    //{"lat":-26.177394, "lng":28.256277}});
}

// Handle Payload
const rawValues1 = payload.find((item) => item.variable === "payload");
if (rawValues1) {
  try {
    const buffer = rawValues1.value;
    devicetester(buffer);
  } catch (error) {
    console.Error(error.message);
    payload = [{ variable: "parse_error", value: error.message }];
  }
} else {
  try {
    throw new Error("Payload Not Valid");
  } catch (error) {
    console.Error(error.message);
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
