/* eslint-disable no-mixed-operators */
/* eslint-disable no-bitwise */

/* This is an example code for Everynet Parser.
** Everynet send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "everynet_payload", "value": "{ \"params\": { \"payload\": \"0109611395\" } }" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = ['device_addr', 'port', 'duplicate', 'network', 'packet_hash', 'application', 'device', 'packet_id'];


/**
 * Convert an object to TagoIO object format.
 * Can be used in two ways:
 * toTagoFormat({ myvariable: myvalue , anothervariable: anothervalue... })
 * toTagoFormat({ myvariable: { value: myvalue, unit: 'C', metadata: { color: 'green' }} , anothervariable: anothervalue... })
 *
 * @param {Object} object_item Object containing key and value.
 * @param {String} serie Serie for the variables
 * @param {String} prefix Add a prefix to the variables name
 */
function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] === 'object') {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`.toLowerCase(),
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`.toLowerCase(),
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

function Decoder(bytes, port) {
  // Functions

  function parseCoordinate(raw_value, coordinate) {
    // This function parses a coordinate payload part into

    // dmm and ddd

    let raw_itude = raw_value;

    let temp = '';


    // Degree section

    let itude_string = ((raw_itude >> 28) & 0xF).toString();

    raw_itude <<= 4;


    itude_string += ((raw_itude >> 28) & 0xF).toString();

    raw_itude <<= 4;


    coordinate.degrees += itude_string;

    itude_string += '°';


    // Minute section

    temp = ((raw_itude >> 28) & 0xF).toString();

    raw_itude <<= 4;


    temp += ((raw_itude >> 28) & 0xF).toString();

    raw_itude <<= 4;

    itude_string += temp;

    itude_string += '.';

    coordinate.minutes += temp;


    // Decimal section

    temp = ((raw_itude >> 28) & 0xF).toString();

    raw_itude <<= 4;


    temp += ((raw_itude >> 28) & 0xF).toString();

    raw_itude <<= 4;


    itude_string += temp;

    coordinate.minutes += '.';

    coordinate.minutes += temp;


    return itude_string;
  }

  function parseLatitude(raw_latitude, coordinate) {
    let latitude = parseCoordinate(raw_latitude, coordinate);

    latitude += ((raw_latitude & 0xF0) >> 4).toString();

    coordinate.minutes += ((raw_latitude & 0xF0) >> 4).toString();


    return latitude;
  }

  function parseLongitude(raw_longitude, coordinate) {
    let longitude = (((raw_longitude >> 28) & 0xF)).toString();

    coordinate.degrees = longitude;

    longitude += parseCoordinate(raw_longitude << 4, coordinate);


    return longitude;
  }

  function addField(field_no, payload) {
    switch (field_no) {
      // Presence of temperature information

      case 0:

        payload.temperature = bytes[bytes_pos_] & 0x7F;

        // Temperature is negative

        if ((bytes[bytes_pos_] & 0x80) > 0) {
          payload.temperature -= 128;
        }

        bytes_pos_++;

        break;

        // Transmission triggered by the accelerometer

      case 1:

        payload.trigger = 'accelerometer';

        break;

        // Transmission triggered by pressing pushbutton 1

      case 2:

        payload.trigger = 'pushbutton';

        break;

        // Presence of GPS information

      case 3: {
        // GPS Latitude

        // An object is needed to handle and parse coordinates into ddd notation

        const coordinate = {};

        coordinate.degrees = '';

        coordinate.minutes = '';


        let raw_value = 0;

        raw_value |= bytes[bytes_pos_++] << 24;

        raw_value |= bytes[bytes_pos_++] << 16;

        raw_value |= bytes[bytes_pos_++] << 8;

        raw_value |= bytes[bytes_pos_++];


        payload.lati_hemisphere = (raw_value & 1) == 1 ? 'South' : 'North';

        payload.latitude_dmm = `${payload.lati_hemisphere.charAt(0)} `;

        payload.latitude_dmm += parseLatitude(raw_value, coordinate);

        const latitude = (parseFloat(coordinate.degrees) + parseFloat(coordinate.minutes) / 60) * ((raw_value & 1) == 1 ? -1.0 : 1.0);


        // GPS Longitude

        coordinate.degrees = '';

        coordinate.minutes = '';

        raw_value = 0;

        raw_value |= bytes[bytes_pos_++] << 24;

        raw_value |= bytes[bytes_pos_++] << 16;

        raw_value |= bytes[bytes_pos_++] << 8;

        raw_value |= bytes[bytes_pos_++];


        payload.long_hemisphere = (raw_value & 1) == 1 ? 'West' : 'East';

        payload.longitude_dmm = `${payload.long_hemisphere.charAt(0)} `;

        payload.longitude_dmm += parseLongitude(raw_value, coordinate);

        const longitude = (parseFloat(coordinate.degrees) + parseFloat(coordinate.minutes) / 60) * ((raw_value & 1) == 1 ? -1.0 : 1.0);

        payload.location = { value: `${latitude},${longitude}`, location: { lat: latitude, lng: longitude } };

        // GPS Quality

        raw_value = bytes[bytes_pos_++];


        switch ((raw_value & 0xF0) >> 4) {
          case 1:

            payload.gps_quality = 'Good';

            break;

          case 2:

            payload.gps_quality = 'Average';

            break;

          case 3:

            payload.gps_quality = 'Poor';

            break;

          default:

            payload.gps_quality = (raw_value >> 4) & 0xF;

            break;
        }

        payload.hdop = (raw_value >> 4) & 0xF;


        // Number of satellites

        payload.sats = raw_value & 0xF;


        break;

        // Presence of Uplink frame counter
      } case 4:

        payload.ul_counter = bytes[bytes_pos_++];

        break;

        // Presence of Downlink frame counter

      case 5:

        payload.dl_counter = bytes[bytes_pos_++];

        break;

        // Presence of battery level information

      case 6:

        payload.battery_level = bytes[bytes_pos_++] << 8;

        payload.battery_level |= bytes[bytes_pos_++];

        break;

        // Presence of RSSI and SNR information

      case 7:

        // RSSI

        payload.rssi_dl = bytes[bytes_pos_++];

        payload.rssi_dl *= -1;


        // SNR

        payload.snr_dl = bytes[bytes_pos_] & 0x7F;

        if ((bytes[bytes_pos_] & 0x80) > 0) {
          payload.snr_dl -= 128;
        }

        bytes_pos_++;

        break;

      default:

        // Do nothing

        break;
    }
  }


  // Declaration & initialization

  let status_ = bytes[0];

  const bytes_len_ = bytes.length;

  let bytes_pos_ = 1;

  let i = 0;

  const payload = {};


  // Get raw payload

  let temp_hex_str = '';

  // for (let j = 0; j < bytes_len_; j++) {
  //   temp_hex_str = bytes[j].toString(16).toUpperCase();

  //   if (temp_hex_str.length == 1) {
  //     temp_hex_str = `0${temp_hex_str}`;
  //   }

  //   payload.payload += temp_hex_str;
  // }

  // Get payload values

  do {
    // Check status, whether a field is set
    if ((status_ & 0x80) > 0) {
      addField(i, payload);
    }
    i++;
  } while (((status_ <<= 1) & 0xFF) > 0);


  return payload;
}

// let payload = [{ variable: 'payload', value: '9E1B4515969000553450272020'}]
const payload_raw = payload.find(x => x.variable === 'payload' || x.variable === 'payload_raw' || x.variable === 'data');
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const serie = payload_raw.serie || new Date().getTime();
  let vars_to_tago = [];
  // Parse the payload from your sensor to function parsePayload
  try {
    const decoded = Decoder(Buffer.from(payload_raw.value, 'hex'));
    console.log(decoded);
    vars_to_tago = vars_to_tago.concat(toTagoFormat(decoded, serie));
  } catch (e) {
    // Catch any error in the parse code and send to parse_error variable.
    vars_to_tago = vars_to_tago.concat({ variable: 'parse_error', value: e.message || e });
  }

  payload = payload.concat(vars_to_tago);
}