function float16(bytes) {
  console.log(bytes.toString("hex"));
  const sign = bytes[0] >> 7 === 1? -1 : 1;
  const bias = 0x0f;
  const exponent = (bytes[0] & 0x7c) >> 2;
  const fraction = (bytes[0] & 0x03) << 8 | bytes[1];

  if (exponent === 0x00) {
    return sign * (2 ** (-14)) * (0 + (fraction / 1024));
  } else if (exponent === 0xff) {
    return null; //infinity
  } else {
    return sign * (2 ** (exponent - bias) ) * (1 + (fraction / 1024));
  }
}

// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(fPort, bytes, variables) {
  //获取uplink消息类型
  var uplink_type = ((bytes[0] >> 4) & 0x0F);
  switch (uplink_type) {
    case 0x01:
      var Register_Msg = Register_proc(bytes);
      return Register_Msg;
      break;
    
    case 0x02:
      var Heartbeat_Msg = Heartbeat_proc(bytes);
      return Heartbeat_Msg;
      break;
    
    case 0x03:
      var PeriodicalPposition_Msg = PeriodicalPosition_proc(bytes);
      return PeriodicalPposition_Msg;
      break;
            
    case 0x04:
      var OnDemandPosition_Msg = OnDemandPosition_proc(bytes);
      return OnDemandPosition_Msg;
      break;
    
    case 0x05:
      var HistoryPositon_Msg = HistoryPosition_proc(bytes);
      return HistoryPositon_Msg;
      break;
    
    case 0x06:
      var Alarm_Msg = Alarm_proc(bytes);
      return Alarm_Msg;
      break;
    
    case 0x07:
      var BleCoordinate_Msg = BleCoordinate_proc(bytes);
      return BleCoordinate_Msg;
      break;
    
    case 0x08:
      var Acknowledge_Msg = Acknowledge_proc(bytes);
      return Acknowledge_Msg;
      break;

    default:
      return null;
      break;
  }
}

//Message type: Register  0x1
function Register_proc(bytes) {
  var Register_Msg = {
  "type":           0,
  "adr":            0,
  "mode":           0,
  "smode":          0,
  "BleTxPower":     0,
  "dr":             0,
  "breakpoint":     0,
  "selfadapt":      0,
  "oneoff":         0,
  "alreport":       0,
  "pos":            0,
  "hb":             0,
  "crc":            0
  };
  //type
  Register_Msg.type = "Register";
  //adr
  Register_Msg.adr = ((bytes[0] >> 3) & 0x01);
  switch (Register_Msg.adr) {
      case 0x00:
          Register_Msg.adr = "OFF";
          break;
      
      case 0x01:
          Register_Msg.adr = "ON";
          break;
  
      default:
          break;
  }
  //mode
  Register_Msg.mode = (bytes[0] & 0x07);
  switch (Register_Msg.mode) {
      case 0x01:
          Register_Msg.mode = "AU920";
          break;
      
      case 0x02:
          Register_Msg.mode = "CLAA";
          break;
      
      case 0x03:
          Register_Msg.mode = "CN470";
          break;
      
      case 0x04:
          Register_Msg.mode = "AS923";
          break;
      
      case 0x05:
          Register_Msg.mode = "EU433";
          break;
      
      case 0x06:
          Register_Msg.mode = "EU868";
          break;
      
      case 0x07:
          Register_Msg.mode = "US915";
          break;
  
      default:
          break;
  }
  //smode
  Register_Msg.smode = bytes[1];
  switch (Register_Msg.smode) {
      case 0x01:
          Register_Msg.smode = "AU920";
          break;

      case 0x02:
          Register_Msg.smode = "CLAA";
          break;
  
      case 0x04:
          Register_Msg.smode = "CN470";
          break;
      
      case 0x08:
          Register_Msg.smode = "AS923";
          break;
      
      case 0x10:
          Register_Msg.smode = "EU433";
          break;
      
      case 0x20:
          Register_Msg.smode = "EU868";
          break;
      
      case 0x40:
          Register_Msg.smode = "US915";
          break;
  
      default:
          break;
  }
  //BleTxPower
  Register_Msg.BleTxPower = {
    value: ((bytes[2] >> 3) & 0x1F),
    unit: "dBm"
  };
  //Register_Msg.rfu1 = (bytes[2] & 0x07);
  if(Register_Msg.mode === "CLAA") {
    Register_Msg.frequencysweepmode = (bytes[2] & 0x07);
    if(Register_Msg.frequencysweepmode === 0x01) {
      Register_Msg.frequencysweepmode = "A mode";
    }
    else if(Register_Msg.frequencysweepmode === 0x02) {
      Register_Msg.frequencysweepmode = "B mode";
    }
    else if(Register_Msg.frequencysweepmode === 0x03) {
      Register_Msg.frequencysweepmode = "C mode";
    }
    else if(Register_Msg.frequencysweepmode === 0x04) {
      Register_Msg.frequencysweepmode = "D mode";
    }
    else if(Register_Msg.frequencysweepmode === 0x05) {
      Register_Msg.frequencysweepmode = "E mode";
    }
    else if(Register_Msg.frequencysweepmode === 0x06) {
      Register_Msg.frequencysweepmode = "All frequency sweep";
    }
  }
  //DR
  Register_Msg.dr = `DR${((bytes[3] >> 4) & 0x0F)}`;
  //breakpoint
  Register_Msg.breakpoint = ((bytes[3] >> 3) & 0x01);
  switch (Register_Msg.breakpoint) {
      case 0x00:
          Register_Msg.breakpoint = "Disable";
          break;
      
      case 0x01:
          Register_Msg.breakpoint = "Enable";
          break;
  
      default:
          break;
  }
  //selfadapt
  Register_Msg.selfadapt = ((bytes[3] >> 2) & 0x01);
  switch (Register_Msg.selfadapt) {
      case 0x00:
          Register_Msg.selfadapt = "Disable";
          break;
  
      case 0x01:
          Register_Msg.selfadapt = "Enable";
          break;

      default:
          break;
  }
  //oneoff
  Register_Msg.oneoff = ((bytes[3] >> 1) & 0x01);
  switch (Register_Msg.oneoff) {
      case 0x00:
          Register_Msg.oneoff = "Disable";
          break;
      
      case 0x01:
          Register_Msg.oneoff = "Enable";
          break;
  
      default:
          break;
  }
  //alreport
  Register_Msg.alreport = (bytes[3] & 0x01);
  switch (Register_Msg.alreport) {
      case 0x00:
          Register_Msg.alreport = "Disable";
          break;
  
      case 0x01:
          Register_Msg.alreport = "Enable";
          break;

      default:
          break;
  }
  //pos
  Register_Msg.pos = {
    value: ((((bytes[4] << 8) & 0xFF00) | (bytes[5] & 0xFF))*5),
    unit: "sec"
  };
  //HB
  Register_Msg.hb = {
    value: (bytes[6]*30),
    unit: "sec"
  };
  //crc
  Register_Msg.crc = (((bytes[7] << 8) & 0xFF00) | (bytes[8] &0xFF));
  return Register_Msg;
}

//Message type: Heartbeat  0x2
function Heartbeat_proc(bytes) {
  var Heartbeat_Msg = {
      "type":0,
      "ver":0,
      "vol":0,
      "rssi":0,
      "snr":0,
      "gpsstate":0,
      "vibstate":0,
      "chgstate":0,
      "crc":0
  };
  //type
  Heartbeat_Msg.type = "Heartbeat";
  //ver
  Heartbeat_Msg.ver = (bytes[0] & 0x0F);
  //vol
  Heartbeat_Msg.vol = {
    value: bytes[1],
    unit: "%"
  };
  //rssi
  Heartbeat_Msg.rssi = {
    value: bytes[2] * (-1),
    unit: "dBm"
  };
  //SNR
  let snr = (((bytes[3] << 8) & 0xFF00) | (bytes[4] & 0xFF));
  snr = snr > 0x7fff ? snr - 0x10000 : snr;

  Heartbeat_Msg.snr = {
    value: snr * (0.01),//(((((bytes[3] << 8) & 0xFF00) | (bytes[4] & 0xFF)) & 0xffff )*(0.01)),
    unit: "dB"
  };
  //GPSSTATE
  Heartbeat_Msg.gpsstate = ((bytes[5] >> 4) & 0x0F);
  switch (Heartbeat_Msg.gpsstate) {
      case 0x00:
          Heartbeat_Msg.gpsstate = "off";
          break;
      
      case 0x01:
          Heartbeat_Msg.gpsstate = "boot GPS";
          break;

      case 0x02:
          Heartbeat_Msg.gpsstate = "locating";
          break;
      
      case 0x03:
          Heartbeat_Msg.gpsstate = "located";
          break;
      
      case 0x09:
          Heartbeat_Msg.gpsstate = "no signal";
          break;

      default:
          break;
  }
  //vibstate
  Heartbeat_Msg.vibstate = {
    value: (bytes[5] & 0x0F),
    unit: "level"
  };
  //chgstate
  Heartbeat_Msg.chgstate = ((bytes[6] >> 4) & 0x0F);
  switch (Heartbeat_Msg.chgstate) {
      case 0x00:
          Heartbeat_Msg.chgstate = "power cable disconnected";
          break;
      
      case 0x05:
          Heartbeat_Msg.chgstate = "power cable connected, charging";
          break;
      
      case 0x06:
          Heartbeat_Msg.chgstate = "power cable connected, charge complete";
          break;

      default:
          break;
  }
  //crc
  Heartbeat_Msg.crc = (((bytes[7] << 8) & 0xFF00) | (bytes[8] & 0xFF));
  return Heartbeat_Msg;
}

//Message type: PeriodicalPosition  0x03
function PeriodicalPosition_proc(bytes) {
  var PeriodicalPposition_Msg = {
    "type":0,
    "longitude":0,
    "latitude":0,
    "time":0,
    "location":0,
  };
  //type
  PeriodicalPposition_Msg.type = "PeriodicalPosition";
  //longitude
  let lng = bytes.readFloatBE(1); //(((bytes[1] << 24) & 0xFF000000) | ((bytes[2] << 16) & 0xFF0000) | ((bytes[3] << 8) & 0xFF00) | (bytes[4] & 0xFF));
  // lng = lng > 0x7fffffff ? lng - 0x100000000 : lng; // 0x94B62E00 (-180) to 0x6B49D200 (180)
  PeriodicalPposition_Msg.longitude = {
    value: lng,//bytes.readFloatBE(1),
    unit: "°"
  };
  //latitude
  let lat = bytes.readFloatBE(5); //(((bytes[5] << 24) & 0xFF000000) | ((bytes[6] << 16) & 0xFF0000) | ((bytes[7] << 8) & 0xFF00) | (bytes[8] & 0xFF));
  // lat = lat > 0x7fffffff ? lat - 0x100000000 : lat; // 0xCA5B1700 (-90) to 0x35A4E900 (90)
  PeriodicalPposition_Msg.latitude = {
    value: lat, //bytes.readFloatBE(5), //lat / 10000000,
    unit: "°"
  };
  //time
  PeriodicalPposition_Msg.time = {
    value: (((bytes[9] << 24) & 0xFF000000) | ((bytes[10] << 16) & 0xFF0000) | ((bytes[11] << 8) & 0xFF00) | (bytes[12] & 0xFF)),
    unit: "sec"
  };
  PeriodicalPposition_Msg.location = {
    value: `${lat},${lng}`,
    location: {
    lat: lat,
    lng: lng,
    }
  }
  return PeriodicalPposition_Msg;
}

//Message type: OnDemandPosition  0x04
function OnDemandPosition_proc(bytes) {
  var OnDemandPosition_Msg = {
      "type":0,
      "msgid":0,
      "longitude":0,
      "latitude":0,
      "location":0,
      "time":0,
  };
  //type
  OnDemandPosition_Msg.type = "OnDemandPosition";
  //magid
  OnDemandPosition_Msg.msgid = bytes[1];
  //longitude
  let lng = bytes.readFloatBE(2); //(((bytes[2] <<24) & 0xFF000000) | ((bytes[3] << 16) & 0xFF0000) | ((bytes[4] << 8) & 0xFF00) | (bytes[5] & 0xFF));
  //lng = lng > 0x7fffffff ? lng - 0x100000000 : lng; // 0x94B62E00 (-180) to 0x6B49D200 (180)
  OnDemandPosition_Msg.longitude = {
    value: lng, //lng / 10000000,
    unit: "°",
  };
  //latitude
  let lat = bytes.readFloatBE(6); //(((bytes[6] <<24) & 0xFF000000) | ((bytes[7] << 16) & 0xFF0000) | ((bytes[8] << 8) & 0xFF00) | (bytes[9] & 0xFF));
  //lat = lat > 0x7fffffff ? lat - 0x100000000 : lat; // 0xCA5B1700 (-90) to 0x35A4E900 (90)
  OnDemandPosition_Msg.latitude = {
    value: lat, //lat / 10000000,
    unit: "°",
  };
  //time
  OnDemandPosition_Msg.time = {
    value: (((bytes[10] <<24) & 0xFF000000) | ((bytes[11] << 16) & 0xFF0000) | ((bytes[12] << 8) & 0xFF00) | (bytes[13] & 0xFF)),
    unit: "sec",
  };
  OnDemandPosition_Msg.location = {
    value: `${lat},${lng}`,
    location: {
    lat: lat,
    lng: lng,
    }
  }
  return OnDemandPosition_Msg;
}

//Message type: HistoryPosition  0x05
function HistoryPosition_proc(bytes) {
  var HistoryPositon_Msg = {
      "type":0,
      "length":0,
      "longitude":0,
      "latitude":0,
      "location":0,
      "time":0,
      // "lonoff":0,
      // "latoff":0,
      // "toff":0
  };
  //type
  HistoryPositon_Msg.type = "HistoryPosition";
  //length
  HistoryPositon_Msg.length = (bytes[0] & 0x0F);
  //longitude
  let lng = bytes.readFloatBE(1); //(((bytes[1] <<24) & 0xFF000000) | ((bytes[2] << 16) & 0xFF0000) | ((bytes[3] << 8) & 0xFF00) | (bytes[4] & 0xFF));
  // lng = lng > 0x7fffffff ? lng - 0x100000000 : lng; // 0x94B62E00 (-180) to 0x6B49D200 (180)

  HistoryPositon_Msg.longitude = {
    value: lng, // / 10000000,
    unit: "°"
  };
  //latitude
  let lat = bytes.readFloatBE(5); //(((bytes[5] <<24) & 0xFF000000) | ((bytes[6] << 16) & 0xFF0000) | ((bytes[7] << 8) & 0xFF00) | (bytes[8] & 0xFF));
  //lat = lat > 0x7fffffff ? lat - 0x100000000 : lat;
  HistoryPositon_Msg.latitude = {
      value: lat, // / 10000000,
      unit: "°",
  };
  //location
  HistoryPositon_Msg.location = {
    value: `${lat},${lng}`,
    location: {
      lat: lat,
      lng: lng,
    }
  }
  //time
  HistoryPositon_Msg.time = {
    value: (((bytes[9] <<24) & 0xFF000000) | ((bytes[10] << 16) & 0xFF0000) | ((bytes[11] << 8) & 0xFF00) | (bytes[12] & 0xFF)),
    unit: "sec",
  };
  //It's P2P message, need to calcuate the real length.
  if (HistoryPositon_Msg.length === 0x0F) {
    return null;
  }
  else{
    //Maximum 6 groups of history position
    if (HistoryPositon_Msg.length > 6) {
        return null;
    }
    for (var i = 0; i < HistoryPositon_Msg.length; i++) {
        var tmp = i+2;
        //console.log(bytes.slice(15+6*i,17+6*i),bytes.slice(13+6*i,15+6*i));
        let lngoff = float16(bytes.slice(13+6*i, 15+6*i)); //float16(((bytes[13+6*i] << 8) & 0xFF00) | (bytes[14+6*i] & 0xFF));
        //lngoff = lngoff > 0x7fff ? lngoff - 0x10000 : lngoff;
        HistoryPositon_Msg["pos"+tmp+"lngoff"] = {
        value: lngoff, // / 10000000,
        unit: "°",
        };
        let latoff = float16(bytes.slice(15+6*i, 17+6*i)); //float16(((bytes[15+6*i] << 8) & 0xFF00) | (bytes[16+6*i] & 0xFF));
        // latoff = latoff > 0x7fff ? latoff - 0x10000 : latoff;
        HistoryPositon_Msg["pos"+tmp+"latoff"] = {
        value: latoff, // / 10000000,
        unit: "°",
        };
        HistoryPositon_Msg["pos"+tmp+"toff"] =  {
        value: (((bytes[17+6*i] << 8) & 0xFF00) | (bytes[18+6*i] & 0xFF)),
        unit: "sec",
        };
    }
    return HistoryPositon_Msg;
  }
}

//Message type: Alarm  0x06
function Alarm_proc(bytes) {
  var Alarm_Msg = {
      "type":0,
      "alarm":0,
      "msgid":0
  };
  //type
  Alarm_Msg.type = "Alarm";
  //alarm
  Alarm_Msg.alarm = (bytes[0] & 0x0F);
  switch (Alarm_Msg.alarm) {
      case 0x1:
          Alarm_Msg.alarm = "sos"
          break;
  
      default:
          break;
  }
  //msgid
  Alarm_Msg.msgid = bytes[1];
  return Alarm_Msg;
}

//Message type: BleCoordinate   0x07
function BleCoordinate_proc(bytes) {
  var BleCoordinate_Msg = {
      "type":0,
      "length":0,
      "move":0,
      // "name":0,
  };
  BleCoordinate_Msg.type = "BleCoordinate";
  BleCoordinate_Msg.length = (bytes[0] & 0x0F);
  BleCoordinate_Msg.move = bytes[1];
  // BleCoordinate_Msg.rfu = ((bytes[2] << 24) & 0xFF000000) | ((bytes[3] << 16) & 0x00FF0000) | ((bytes[4] << 8) & 0x0000FF00) | (bytes[5] & 0x000000FF);
  for (var i = 0; i < BleCoordinate_Msg.length; i++) {
      BleCoordinate_Msg[`dev${i+1}major`] = (((bytes[6+5*i] << 8) & 0xFF00) | (bytes[7+5*i] & 0xFF));
      BleCoordinate_Msg[`dev${i+1}minor`] = (((bytes[8+5*i] << 8) & 0xFF00) | (bytes[9+5*i] & 0xFF));
      BleCoordinate_Msg[`dev${i+1}rssi`] = {
        value: bytes[10+5*i] - 256,
        unit: "dBm"
      };
  }
  return BleCoordinate_Msg;
}

//Message type: Acknowledge   0x08
function Acknowledge_proc(bytes) {
  var Acknowledge_Msg = {
      "type":0,
      "result":0,
      "msgid":0
  };
  Acknowledge_Msg.type = "Acknowledge";
  Acknowledge_Msg.result = (bytes[0] & 0x0F);
  switch (Acknowledge_Msg.result) {
      case 0x00:
          Acknowledge_Msg.result = "success";
          break;
  
      case 0x01:
          Acknowledge_Msg.result = "failure";
          break;

      default:
          break;
  }
  Acknowledge_Msg.msgid = bytes[1];
  return Acknowledge_Msg;
}

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

// let payload = [{ variable: "payload", value: "3042ed8a9c41ffce2f60742681" }]; //this is for type 1
// let payload = [{ variable: "payload", value: "1101702f00030a0000" }]; //this is for type 1
//let payload = [{ variable: "payload", value: "215f5ff44810500000" }]; // snr -30 for type 2
//let payload = [{ variable: "payload", value: "215f5f0bb810500000" }]; // snr 30 for type 2
// let payload = [{ variable: "payload", value: "3094b62e0035a4e900605b92a7" }]; // negative lng positive lat for type 3
// let payload = [{ variable: "payload", value: "40016b49d200ca5b1700605b92a7" }]; // positive lng negative lat for type 4
// let payload = [{ variable: "payload", value: "5142ed8a9c41ffce2f605b92a7000103ff000f" }]; // positive lng negative lat for type 5
// let payload = [{ variable: "payload", value: "7100000000000005000348" }]; // type 7


const data = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const port = payload.find((x) => x.variable === "fport" || x.variable === "port");
if (data) {
  const buffer = Buffer.from(data.value, "hex");
  // console.log(buffer);
  const serie = new Date().getTime();
  payload = payload.concat(toTagoFormat(Decode(port, buffer), serie));
  //payload = payload.map((x) => ({ ...x, serie }));
}

// console.log(payload);