var ignore_vars = [];

function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] === 'object') {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}


function Decoder(bytes, port) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  
  function decodeFrame(type, target, prefix = "")
  {
    // REPORT TYPE
    switch(type & 0x7f) {
      // empty report
      case 0:
        target[`${prefix}empty_frame`] = {};
        break;
      // battery report
      case 1: // Battery 1byte 0-100%
        target[`${prefix}battery`] = {};
        target[`${prefix}battery`].value = bytes[pos++];
        target[`${prefix}battery`].unit = "%";
        break;
      // temperature report
      case 2: // TempReport 2bytes 0.1degree C
        target[`${prefix}temperature`] = {}; // celcius 0.1 precision: -40 to 125
        target[`${prefix}temperature`].value = ((bytes[pos++] << 8 | bytes[pos++]) <<16>>16 ) * 0.1; // ((bytes[pos] & 0x80 ? 0xFFFF<<16 : 0) | (bytes[pos++] << 8) | bytes[pos++]) / 10;
        target[`${prefix}temperature`].unit = "°C";
        break;
      // temperature level alarm
      case 3:
        // Temp alarm
        target[`${prefix}temp_high_alarm`] = {};  // sends alarm after >x<
        target[`${prefix}temp_low_alarm`] = {};  // sends alarm after >x<
        // console.log(bytes[pos].toString(2), bytes[pos].toString(16));
        target[`${prefix}temp_high_alarm`].value = !!(bytes[pos] & 0x01); // boolean
        target[`${prefix}temp_low_alarm`].value = !!(bytes[pos] & 0x02);  // boolean
        pos++;
        break;
      // average temperature report
      case 4: // AvgTempReport 2bytes 0.1degree C
        target[`${prefix}average_temperature`] = {};
        target[`${prefix}average_temperature`].value = ((bytes[pos++] << 8 | bytes[pos++]) <<16>>16 ) * 0.1; //((bytes[pos] & 0x80 ? 0xFFFF<<16 : 0) | (bytes[pos++] << 8) | bytes[pos++]) / 10;
        target[`${prefix}average_temperature`].unit = "°C";
        break;
      // average temperature level alarm
      case 5:
        // AvgTemp alarm
        target[`${prefix}avg_temp_high_alarm`] = {}; // sends alarm after >x<
        target[`${prefix}avg_temp_low_alarm`] = {}; // sends alarm after >x<
        target[`${prefix}avg_temp_high_alarm`].value = !!(bytes[pos] & 0x01); // boolean
        target[`${prefix}avg_temp_low_alarm`].value = !!(bytes[pos] & 0x02); // boolean
        pos++;
        break;
      // relative humidity report
      case 6: // Humidity 1byte 0-100% in 0.5%
        target[`${prefix}humidity`] = {};
        target[`${prefix}humidity`].value = bytes[pos++] / 2; // relativeHumidity percent 0,5
        target[`${prefix}humidity`].unit = "%";
        break;
      // ambient light report
      case 7: // Lux 2bytes 0-65535lux
        target[`${prefix}lux`] = {};
        target[`${prefix}lux`].value = ((bytes[pos++] << 8) | bytes[pos++]); // you can  the lux range between two sets (lux1 and 2)
        target[`${prefix}lux`].unit = "lux";
        break;
      // second ambient light report  
      case 8: // Lux 2bytes 0-65535lux
        target[`${prefix}lux2`] = {};
        target[`${prefix}lux2`].value = ((bytes[pos++] << 8) | bytes[pos++]);
        target[`${prefix}lux2`].unit = "lux";
        break;
      // door report - external input
      case 9: // DoorSwitch 1bytes binary
        target[`${prefix}external_input`] = {};
        target[`${prefix}external_input`].value = !!bytes[pos++];
        break;
      // door alarm
      case 10: // DoorAlarm 1bytes binary
        target[`${prefix}door_alarm`] = {};
        target[`${prefix}door_alarm`].value = !!bytes[pos++]; // boolean true = alarm
        break;
      // tamper switch report
      case 11: // TamperReport 1bytes binary (was previously TamperSwitch)
        target[`${prefix}tamper`] = {};
        target[`${prefix}tamper`].value = !!bytes[pos++] ? "Magnet on tamper sensor" : "No magnet on tamper sensor";
        break;
      // tamper alarm
      case 12: // TamperAlarm 1bytes binary
        target[`${prefix}tamper_alarm`] = {};
        target[`${prefix}tamper_alarm`].value = !!bytes[pos++];
        break;
      // flood sensor level report
      case 13: // Flood 1byte 0-100%
        target[`${prefix}flood`] = {};
        target[`${prefix}flood`].value = bytes[pos++]; // percentage, relative wetness
        target[`${prefix}flood`].unit = "%";
        break;
      // flood alarm
      case 14: // FloodAlarm 1bytes binary
        target[`${prefix}flood_alarm`] = {};
        target[`${prefix}flood_alarm`].value = !!bytes[pos++]; // boolean, after >x<
        break;
      // foil alarm
      case 15: // FoilAlarm 1bytes binary
        target[`${prefix}foil_alarm`] = {};
        target[`${prefix}foil_alarm`].value = !!bytes[pos++];
        break;
      // user switch alarm
      case 16: // UserSwitch1Alarm, 1 byte digital
        target[`${prefix}user_switch_alarm`] = {};
        target[`${prefix}user_switch_alarm`].value = !!bytes[pos++];
        break;
      // door count report
      case 17: // DoorCountReport, 2 byte analog
        target[`${prefix}door_count`] = {};
        target[`${prefix}door_count`].value = ((bytes[pos++] << 8) | bytes[pos++]);
        break;
      // presence report
      case 18: // PresenceReport, 1 byte digital
        target[`${prefix}presence`] = {};
        target[`${prefix}presence`].value = !!bytes[pos++] ? "Occupied" : "Vacant";
        break;
      // IR proximity report
      case 19: // IRProximityReport
        target[`${prefix}ir_proximity`] = {};
        target[`${prefix}ir_proximity`].value = ((bytes[pos++] << 8) | bytes[pos++]);
        break;
      // IR low power proximity report
      case 20: // IRCloseProximityReport, low power
        target[`${prefix}ir_low_power_proximity`] = {};
        target[`${prefix}ir_low_power_proximity`].value = ((bytes[pos++] << 8) | bytes[pos++]);
        break;
      // close proximity report
      case 21: // CloseProximityAlarm, something very close to presence sensor
        target[`${prefix}close_proximity`] = {};
        target[`${prefix}close_proximity`].value = !!bytes[pos++] ? "Something in close proximity" : "Nothing in close proximity";
        break;
      // disinfect report
      case 22: // DisinfectAlarm
        target[`${prefix}disinfect`] = {};
        target[`${prefix}disinfect`].value = bytes[pos++];
        if (target[`${prefix}disinfect`].value == 0) target[`${prefix}disinfect`].value="Dirty";
        else if (target[`${prefix}disinfect`].value == 1) target[`${prefix}disinfect`].value="Occupied";
        else if (target[`${prefix}disinfect`].value == 2) target[`${prefix}disinfect`].value="Cleaning";
        else if (target[`${prefix}disinfect`].value == 3) target[`${prefix}disinfect`].value="Clean";
        break;
      // combined temperature and humidity report
      case 80:
        target[`${prefix}temperature`] = {};
        target[`${prefix}temperature`].value = ((bytes[pos++] << 8 | bytes[pos++]) <<16>>16 ) * 0.1;
        target[`${prefix}temperature`].unit = "°C";
        target[`${prefix}humidity`] = {};
        target[`${prefix}humidity`].value = bytes[pos++] / 2;
        target[`${prefix}humidity`].unit = "%";
        break;
      // combined average temperature and humidity report
      case 81:
        target[`${prefix}average_temperature`] = {};
        target[`${prefix}average_temperature`].value = ((bytes[pos++] << 8 | bytes[pos++]) <<16>>16 ) * 0.1;
        target[`${prefix}average_temperature`].unit = "°C";
        target[`${prefix}humidity`] = {};
        target[`${prefix}humidity`].value = bytes[pos++] / 2;
        target[`${prefix}humidity`].unit = "%";
        break;
      // combined temperature and door report -- external_input
      case 82:
        target[`${prefix}average_temperature`] = {};
        target[`${prefix}average_temperature`].value = ((bytes[pos++] << 8 | bytes[pos++]) <<16>>16 ) * 0.1;
        target[`${prefix}average_temperature`].unit = "°C";
        target[`${prefix}external_input`] = {};
        target[`${prefix}external_input`].value = !!bytes[pos++]; // true = door open, false = door closed
        break;
      // status report
      case 110:
        target[`${prefix}build_id_modified`] = {};
        target[`${prefix}build_id_modified`].value = bytes[pos] >> 7;
        target[`${prefix}build_id`] = {};
        target[`${prefix}build_id`].value = bytes.readUInt32BE(pos) & 0x7fffffff;
        pos += 4;
        target[`${prefix}status_info`] = {};
        target[`${prefix}status_info`].value = bytes.readUInt32BE(pos);
        pos += 4;
        break;
      // raw capacitance flood sensor report
      case 112: // Capacitance Raw Sensor Value 2bytes 0-65535
        target[`${prefix}raw_capacitance_flood`] = {};
        target[`${prefix}raw_capacitance_flood`].value = ((bytes[pos++] << 8) | bytes[pos++]); // should never trigger anymore
        break;
      // raw capacitance pad sensor report
      case 113: // Capacitance Raw Sensor Value 2bytes 0-65535
        target[`${prefix}raw_capacitance_pad`] = {};
        target[`${prefix}raw_capacitance_pad`].value = ((bytes[pos++] << 8) | bytes[pos++]); // should never trigger anymore
        break;
      // raw capacitance end sensor report
      case 114: // Capacitance Raw Sensor Value 2bytes 0-65535
        target[`${prefix}raw_capacitance_end`] = {};
        target[`${prefix}raw_capacitance_end`].value = ((bytes[pos++] << 8) | bytes[pos++]); // should never trigger anymore
        break;
	  }
  }

  var decoded = {};
  var pos = 0;
  var type;

  switch(port) {
    case 1:
      if(bytes.length < 2) {
        decoded.error = 'Wrong length of RX package';
        break;
      }
      decoded.historySeqNr = (bytes[pos++] << 8) | bytes[pos++];
      decoded.prevHistSeqNr = decoded.historySeqNr;
      while(pos < bytes.length) {
        type = bytes[pos++];
        if(type & 0x80)
          decoded.prevHistSeqNr--;
		    decodeFrame(type, decoded);
      }
      break;

    case 2:
      var now = new Date();
      decoded = {};
      if(bytes.length < 2) {
        decoded.error = 'Wrong length of RX package';
        break;
      }	  
      var seqNr = (bytes[pos++] << 8) | bytes[pos++];
      while(pos < bytes.length) {
        // decoded[seqNr] = {};
        decoded.now = now.toUTCString();
        secondsAgo = bytes.readUInt32BE(pos);
        pos += 4;
        decoded[`history_${seqNr}_timestamp`] = new Date(now.getTime() - secondsAgo*1000).toUTCString();
        type = bytes[pos++];
        decodeFrame(type, decoded, `history_${seqNr}_`);
        seqNr++;
      }
      break;
    case 11:
      if(bytes.length < 2) {
        decoded.error = 'Wrong length of RX package';
        break;
      }
      decoded.command = {}
      decoded.command.value = bytes[pos++];
      decoded.value_id = {};
      decoded.value_id.value = bytes[pos++];
      decoded.value = {};
      decoded.value.value = `0x${bytes.slice(pos, pos+4).toString("hex")}`;
      pos+=4;
      break;
  }
  return decoded;
}

// let payload = [{ variable: "payload", value: "000200014502ffa1030204ffa16e80000005000020a1" },{ variable: "port", value: 1 }];
// let payload = [{ variable: "payload", value: "0002000000010d460000000206be" },{ variable: "port", value: 2 }];
// let payload = [{ variable: "payload", value: "0102abbaabba" },{ variable: "port", value: 11 }];


const data = payload.find((x) => x.variable === "payload" || x.variable === "payload_raw" || x.variable === "data");
const port = payload.find((x) => x.variable === "port" || x.variable === "fport" );

if(data) {
  const serie = data.serie || new Date().getTime();
  const bytes = Buffer.from(data.value, "hex");
  payload = payload.concat(toTagoFormat(Decoder(bytes, Number(port.value)), serie)).map((x) => ({ ...x, serie }));
}
