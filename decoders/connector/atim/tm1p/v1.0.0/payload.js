/* eslint-disable guard-for-in */
/* eslint-disable no-use-before-define */
/* eslint-disable no-plusplus */
/* eslint-disable no-case-declarations */
/* eslint-disable no-bitwise */
/* eslint-disable no-nested-ternary */
function decodeStream(payload, timestamp, latitude, longitude) {
  // Init result
  let result = { historics: [], events: [], realTimes: [] };

  // Parse stream
  // const jsonStream = JSON.parse(stream);

  // Get time and payload
  // const time = new Date(data.timestamp * 1000) / 1000;
  const time = new Date(timestamp * 1000) / 1000;
  // const { payload } = data;

  // Get message ID
  const header = parseInt(payload.substring(0, 2), 16);
  if (((header << 2) & 255) >> 7 === 1) {
    result = DecodeMesureFrame(payload, time);
  } else {
    result = DecodeCommonFrame(payload, time);
  }

  if (header === 129) {
    result.realTimes.push({ tagRef: "p_batteryVoltage_empty", timestamp: time, tagValue: String(parseInt(payload.substr(2, 4), 16) / 1000) });
    result.realTimes.push({ tagRef: "p_batteryVoltage_inCharge", timestamp: time, tagValue: String(parseInt(payload.substr(6, 4), 16) / 1000) });
  }

  // Save network informations
  result.realTimes.push({ tagRef: "sys_data_payload", timestamp: time, tagValue: String(payload) });
  result.realTimes.push({ tagRef: "sys_data_timestamp", timestamp: time, tagValue: String(time) });
  /*
  if (data !== undefined) {
    result.realTimes.push({ tagRef: "sys_data_type", timestamp: time, tagValue: String(data.type) });
    result.realTimes.push({ tagRef: "sys_data_raw", timestamp: time, tagValue: String(data.raw) });
  }
  if (metadata !== undefined) {
    if (metadata.device !== undefined) {
      result.realTimes.push({ tagRef: "sys_device_sn", timestamp: time, tagValue: String(metadata.device.serialNumber) });
      result.realTimes.push({ tagRef: "sys_device_name", timestamp: time, tagValue: String(metadata.device.name) });
    }
    if (metadata.endpoint !== undefined) {
      result.realTimes.push({ tagRef: "sys_endpoint_name", timestamp: time, tagValue: String(metadata.endpoint.name) });
      result.realTimes.push({ tagRef: "sys_endpoint_type", timestamp: time, tagValue: String(metadata.endpoint.type) });
    }
    if (metadata.network !== undefined) {
      result.realTimes.push({ tagRef: "sys_network_port", timestamp: time, tagValue: String(metadata.network.port) });
      result.realTimes.push({ tagRef: "sys_network_linkQuality", timestamp: time, tagValue: String(metadata.network.linkQuality) });
    } */
  if (latitude !== undefined && longitude !== undefined) {
    // result.realTimes.push({ tagRef: "sys_location_source", timestamp: time, tagValue: String(metadata.location.source) });
    result.realTimes.push({ tagRef: "sys_location_latitude", timestamp: time, tagValue: latitude, unit: "°" });
    result.realTimes.push({ tagRef: "sys_location_longitude", timestamp: time, tagValue: longitude, unit: "°" });
    // result.realTimes.push({ tagRef: "sys_location_accuracy", timestamp: time, tagValue: String(metadata.location.accuracy) });
  }
  /* }
  
  if (metadata.endpoint !== undefined) {
    // if KHEIRON
    if (metadata.endpoint.type === 0) {
      result.realTimes.push({ tagRef: "custom_data_raw_count", timestamp: time, tagValue: String(data.raw.fcnt) });
    }
    // if SIGFOX
    if (metadata.endpoint.type === 5) {
      result.realTimes.push({ tagRef: "custom_data_raw_count", timestamp: time, tagValue: String(data.raw.seqNumber) });
    }
    // if OBJENIOUS
    if (metadata.endpoint.type === 6) {
      result.realTimes.push({ tagRef: "custom_data_raw_count", timestamp: time, tagValue: String(data.raw.count) });
      result.realTimes.push({ tagRef: "custom_data_raw_devEUI", timestamp: time, tagValue: String(data.raw.device_properties.deveui) });
    }
  } 
  */

  return result;
}

function DecodeCommonFrame(payload, time) {
  // Init result
  const result = {
    historics: [],
    events: [],
    realTimes: [],
  };

  // get bit values
  const horodatage = ((parseInt(payload.substring(0, 2), 16) << 1) & 255) >> 7;

  // calcul of the starting index
  let startingIndex = 2 + horodatage * 8;

  // get frame type
  const frameType = ((parseInt(payload.substring(0, 2), 16) << 4) & 255) >> 4;

  // keep alive frame
  if (frameType === 1) {
    result.realTimes.push({
      tagRef: "p_keepAlive",
      timestamp: time,
      tagValue: String(1),
    });
  }

  // threshold alarm
  if (frameType === 13 || frameType === 5) {
    while (startingIndex < payload.length) {
      // get header informations of each voie
      const header_voie = parseInt(payload.substring(startingIndex, startingIndex + 2), 16);
      const alertType_voie = header_voie >> 6;
      const number_voie = ((header_voie << 2) & 255) >> 6;
      const mesureType_voie = ((header_voie << 4) & 255) >> 4;
      const mesureSize_voie = getMesureSize(mesureType_voie);

      // increase starting index
      startingIndex += 2;

      // check if the size is different than 0
      if (mesureSize_voie !== 0) {
        // get mesure
        const mesure = parseInt(payload.substring(startingIndex, startingIndex + mesureSize_voie), 16);

        // get calculated table of log
        const calculatedMesureTab = getCalculatedMesure(
          mesure,
          mesureType_voie,
          number_voie,
          horodatage ? new Date(parseInt(payload.substring(2, 10), 16) * 1000).getTime() : time
        );

        // add table log into realtimes
        result.realTimes = result.realTimes.concat(calculatedMesureTab);

        // get calculated table of events
        const eventTab = getThresholdEvents(mesureType_voie, alertType_voie, number_voie, horodatage ? new Date(parseInt(payload.substring(2, 10), 16) * 1000).getTime() : time);

        // add table event into events
        result.events = result.events.concat(eventTab);

        // increase index
        startingIndex += mesureSize_voie;
      } else {
        return result;
      }
    }
  }

  // general alarm
  if (frameType === 14) {
    // get header informations of each voie
    const header_error = parseInt(payload.substring(startingIndex, startingIndex + 2), 16);
    const length_error = ((header_error << 3) & 255) >> 3;

    // increase starting index
    startingIndex += 2;

    for (let e = 0; e < length_error; e++) {
      // get error and add log into realtimes table
      result.realTimes.push(
        getError(parseInt(payload.substring(startingIndex, startingIndex + 2), 16), horodatage ? new Date(parseInt(payload.substring(2, 10), 16) * 1000).getTime() : time)
      );

      // increase starting index
      startingIndex += 2;
    }
  }

  if (frameType === 15) {
    if (parseInt(payload.substring(startingIndex, startingIndex + 2), 16) === 28) {
      // add wirecut into realtimes table
      result.realTimes.push({
        tagRef: "p_wirecut",
        timestamp: horodatage ? new Date(parseInt(payload.substring(2, 10), 16) * 1000).getTime() : time,
        tagValue: String(parseInt(payload.substring(startingIndex + 2, startingIndex + 4), 16) === 1 ? 0 : 1),
      });
    }
  }
  return result;
}

function DecodeMesureFrame(payload, time) {
  // Init result
  const result = {
    historics: [],
    events: [],
    realTimes: [],
  };

  // get bit values
  const horodatage = ((parseInt(payload.substring(0, 2), 16) << 1) & 255) >> 7;
  const profondeur = (((parseInt(payload.substring(0, 2), 16) << 3) & 255) >> 6) + 1;
  const nb_echantillons = (((parseInt(payload.substring(0, 2), 16) << 5) & 255) >> 5) + 1;
  const period = profondeur > 1 || nb_echantillons > 1 ? parseInt(payload.substring(2 + horodatage * 8, 6 + horodatage * 8), 16) : 0;
  // calcul of the starting index
  let startingIndex = 2 + horodatage * 8 + (profondeur > 1 || nb_echantillons > 1) * 4;

  while (startingIndex < payload.length) {
    // get header informations of each voie
    const header_voie = parseInt(payload.substring(startingIndex, startingIndex + 2), 16);
    const number_voie = ((header_voie << 2) & 255) >> 6;
    const mesureType_voie = ((header_voie << 4) & 255) >> 4;
    const mesureSize_voie = getMesureSize(mesureType_voie);

    // increase starting index
    startingIndex += 2;

    // check if the size is different than 0
    if (mesureSize_voie !== 0) {
      // iterate on each mesure

      for (let i = 0; i < profondeur * nb_echantillons; i++) {
        // get mesure
        const mesure = parseInt(payload.substring(startingIndex, startingIndex + mesureSize_voie), 16);

        if (i === 0) {
          // get calculated table of log
          const calculatedMesureTab = getCalculatedMesure(
            mesure,
            mesureType_voie,
            number_voie,
            horodatage ? new Date(parseInt(payload.substring(2, 10), 16) * 1000).getTime() : time
          );

          // add table log into realtimes
          result.realTimes = result.realTimes.concat(calculatedMesureTab);
        } else {
          // get calculated table of log
          const calculatedMesureTab = getCalculatedMesure(
            mesure,
            mesureType_voie,
            number_voie,
            horodatage
              ? new Date((parseInt(payload.substring(2, 10), 16) - (period / nb_echantillons) * 60 * i) * 1000).getTime()
              : new Date((time - (period / nb_echantillons) * 60 * i) * 1000).getTime()
          );

          // add table log into historics
          result.historics = result.historics.concat(calculatedMesureTab);
        }

        // increase index
        startingIndex += mesureSize_voie;
      }
    } else {
      return result;
    }
  }

  return result;
}

function getMesureSize(mesureType) {
  switch (mesureType) {
    case 1:
      return 2;
    case 2:
    case 3:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
      return 4;
    case 4:
      return 8;
    default:
      return 0;
  }
}

function getCalculatedMesure(mesure, mesureType, number_voie, date) {
  switch (mesureType) {
    case 1:
    case 2:
      const tab = [];
      const mesureString = `0000000${mesure.toString(2)}`.slice(-8);
      for (let i = 1; i < mesureString.length + 1; i++) {
        tab.push({
          tagRef: `p_DI${i}_${number_voie}`,
          timestamp: date,
          tagValue: String(mesureString[mesureString.length - i]),
        });
      }
      return tab;
    case 3:
    case 4:
      return [
        {
          tagRef: `p_count_${number_voie}`,
          timestamp: date,
          tagValue: String(mesure),
        },
      ];
    case 7:
      if (mesure >> 15 === 1) {
        return [
          {
            tagRef: `p_mm_${number_voie}`,
            timestamp: date,
            tagValue: String(((mesure ^ 65535) + 1) * -1),
          },
        ];
      }
      return [
        {
          tagRef: `p_mm_${number_voie}`,
          timestamp: date,
          tagValue: String(mesure),
        },
      ];

    case 10:
      if (mesure >> 15 === 1) {
        return [
          {
            tagRef: `p_mV_${number_voie}`,
            timestamp: date,
            tagValue: String(((mesure ^ 65535) + 1) * -1),
          },
        ];
      }
      return [
        {
          tagRef: `p_mV_${number_voie}`,
          timestamp: date,
          tagValue: String(mesure),
        },
      ];

    case 11:
      if (mesure >> 15 === 1) {
        return [
          {
            tagRef: `p_uA_${number_voie}`,
            timestamp: date,
            tagValue: String(((mesure ^ 65535) + 1) * -1),
          },
        ];
      }
      return [
        {
          tagRef: `p_uA_${number_voie}`,
          timestamp: date,
          tagValue: String(mesure),
        },
      ];

    case 8:
      if (mesure >> 15 === 1) {
        return [
          {
            tagRef: `p_temperature_${number_voie}`,
            timestamp: date,
            tagValue: String((((mesure ^ 65535) + 1) / 100) * -1),
          },
        ];
      }
      return [
        {
          tagRef: `p_temperature_${number_voie}`,
          timestamp: date,
          tagValue: String(mesure / 100),
        },
      ];

    case 9:
      if (mesure >> 15 === 1) {
        return [
          {
            tagRef: `p_humidity_${number_voie}`,
            timestamp: date,
            tagValue: String((((mesure ^ 65535) + 1) / 100) * -1),
          },
        ];
      }
      return [
        {
          tagRef: `p_humidity_${number_voie}`,
          timestamp: date,
          tagValue: String(mesure / 100),
        },
      ];

    default:
      return [];
  }
}

function getThresholdEvents(mesureType, alertType, number_voie, date) {
  switch (mesureType) {
    case 3:
    case 4:
      return [
        {
          tagRef: `p_count_${number_voie}_high_alm`,
          timestamp: date,
          tagValue: String(alertType === 0 ? 0 : alertType === 1 ? 1 : 0),
          context: [],
        },
        {
          tagRef: `p_count_${number_voie}_low_alm`,
          timestamp: date,
          tagValue: String(alertType === 0 ? 0 : alertType === 2 ? 1 : 0),
          context: [],
        },
      ];
    case 7:
      return [
        {
          tagRef: `p_mm_${number_voie}_high_alm`,
          timestamp: date,
          tagValue: String(alertType === 0 ? 0 : alertType === 1 ? 1 : 0),
          context: [],
        },
        {
          tagRef: `p_mm_${number_voie}_low_alm`,
          timestamp: date,
          tagValue: String(alertType === 0 ? 0 : alertType === 2 ? 1 : 0),
          context: [],
        },
      ];
    case 10:
      return [
        {
          tagRef: `p_mV_${number_voie}_high_alm`,
          timestamp: date,
          tagValue: String(alertType === 0 ? 0 : alertType === 1 ? 1 : 0),
          context: [],
        },
        {
          tagRef: `p_mV_${number_voie}_low_alm`,
          timestamp: date,
          tagValue: String(alertType === 0 ? 0 : alertType === 2 ? 1 : 0),
          context: [],
        },
      ];
    case 11:
      return [
        {
          tagRef: `p_uA_${number_voie}_high_alm`,
          timestamp: date,
          tagValue: String(alertType === 0 ? 0 : alertType === 1 ? 1 : 0),
          context: [],
        },
        {
          tagRef: `p_uA_${number_voie}_low_alm`,
          timestamp: date,
          tagValue: String(alertType === 0 ? 0 : alertType === 2 ? 1 : 0),
          context: [],
        },
      ];
    case 8:
      return [
        {
          tagRef: `p_temperature_${number_voie}_high_alm`,
          timestamp: date,
          tagValue: String(alertType === 0 ? 0 : alertType === 1 ? 1 : 0),
          context: [],
        },
        {
          tagRef: `p_temperature_${number_voie}_low_alm`,
          timestamp: date,
          tagValue: String(alertType === 0 ? 0 : alertType === 2 ? 1 : 0),
          context: [],
        },
      ];
    case 9:
      return [
        {
          tagRef: `p_humidity_${number_voie}_high_alm`,
          timestamp: date,
          tagValue: String(alertType === 0 ? 0 : alertType === 1 ? 1 : 0),
          context: [],
        },
        {
          tagRef: `p_humidity_${number_voie}_low_alm`,
          timestamp: date,
          tagValue: String(alertType === 0 ? 0 : alertType === 2 ? 1 : 0),
          context: [],
        },
      ];
    default:
      return [];
  }
}

function getError(error_code, date) {
  let ref;
  switch (error_code) {
    case 0:
      ref = "p_ERR_BUF_SMALLER";
      break;
    case 1:
      ref = "p_ERR_DEPTH_HISTORIC_OUT_OF_RANGE";
      break;
    case 2:
      ref = "p_ERR_NB_SAMPLE_OUT_OF_RANGE";
      break;
    case 3:
      ref = "p_ERR_NWAY_OUT_OF_RANGE";
      break;
    case 4:
      ref = "p_ERR_TYPEWAY_OUT_OF_RANGE";
      break;
    case 5:
      ref = "p_ERR_SAMPLING_PERIOD";
      break;
    case 6:
      ref = "p_ERR_KEEP_ALIVE_PERIOD";
      break;
    case 7:
      ref = "p_ERR_SUBTASK_END";
      break;
    case 8:
      ref = "p_ERR_NULL_POINTER";
      break;
    case 9:
      ref = "p_ERR_BATTERY_LEVEL_LOW";
      break;
    case 10:
      ref = "p_ERR_BATTERY_LEVEL_DEAD";
      break;
    case 11:
      ref = "p_ERR_EEPROM";
      break;
    case 12:
      ref = "p_ERR_ROM";
      break;
    case 13:
      ref = "p_ERR_RAM";
      break;
    case 14:
      ref = "p_ERR_SENSORS_TIMEOUT";
      break;
    case 15:
      ref = "p_ERR_SENSOR_STOP";
      break;
    case 16:
      ref = "p_ERR_SENSORS_FAIL";
      break;
    case 17:
      ref = "p_ERR_ARM_INIT_FAIL";
      break;
    case 18:
      ref = "p_ERR_ARM_PAYLOAD_BIGGER";
      break;
    case 19:
      ref = "p_ERR_ARM_BUSY";
      break;
    case 20:
      ref = "p_ERR_ARM_BRIDGE_ENABLE";
      break;
    case 21:
      ref = "p_ERR_ARM_TRANSMISSION";
      break;
    case 22:
      ref = "p_ERR_RADIO_QUEUE_FULL";
      break;
    case 23:
      ref = "p_ERR_CFG_BOX_INIT_FAIL";
      break;
    case 24:
      ref = "p_ERR_BOX_OPENED";
      break;
    default:
      return undefined;
  }

  return {
    tagRef: ref,
    timestamp: date,
    tagValue: String(1),
  };
}

// eslint-disable-next-line no-unused-vars
function ToTagoFormat(object_item, serie, prefix = "") {
  const historics = [];
  const events = [];
  const realTimes = [];
  for (const key in object_item.realTimes) {
    realTimes.push({
      variable: `realTimes_${object_item.realTimes[key].tagRef}`.toLowerCase(),
      value: object_item.realTimes[key].tagValue,
      time: object_item.realTimes[key].timestamp,
      serie,
    });
  }
  for (const key in object_item.events) {
    events.push({
      variable: `events_${object_item.events[key].tagRef}`.toLowerCase(),
      value: object_item.events[key].tagValue,
      time: object_item.events[key].timestamp,
      serie,
    });
  }
  for (const key in object_item.historics) {
    historics.push({
      variable: `historics_${object_item.historics[key].tagRef}`.toLowerCase(),
      value: object_item.historics[key].tagValue,
      time: object_item.historics[key].timestamp,
      serie,
    });
  }
  const result = historics.concat(events, realTimes);

  return result;
}

/* let payload = [
  { variable: "data", value: { timestamp: 1605614318410, payload: "810d240c68", raw: { seqNumber: 123 } } },
  {
    variable: "metadata",
    value: {
      endpoint: { name: "sigfox", type: 5 },
      network: { port: 95, linkQuality: 100 },
      location: { source: "my_head", latitude: "-38°", longitude: "-18°", accuracy: 95 },
      device: { name: "TM1P", serialNumber: "01101011" },
    },
  },
]; */
/*
let payload = [
  { variable: "data", value: "a1000211aabb220055006633000300044400000004000000055700050006682221222279777777788a000800099b0009000a" },
  { variable: "timestamp", value: 1605614318410 },
  { variable: "latitude", value: -38 },
  { variable: "longitude", value: -18 },
];
*/
const data = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const timestamp = payload.find((x) => x.variable === "timestamp");
const latitude = payload.find((x) => x.variable === "latitude");
const longitude = payload.find((x) => x.variable === "longitude");

if (data) {
  // const buffer = Buffer.from(data.value, "hex");
  const serie = new Date().getTime();
  payload = ToTagoFormat(decodeStream(data.value, timestamp.value, latitude.value, longitude.value), serie);
}

// eslint-disable-next-line no-console
// console.log(payload);
