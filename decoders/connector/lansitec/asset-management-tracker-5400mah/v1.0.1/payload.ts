function float16(bytes: Buffer) {
  console.log(bytes.toString("hex"));
  const sign = bytes[0] >> 7 === 1 ? -1 : 1;
  const bias = 0x0f;
  const exponent = (bytes[0] & 0x7c) >> 2;
  const fraction = ((bytes[0] & 0x03) << 8) | bytes[1];

  if (exponent === 0x00) {
    return sign * 2 ** -14 * (0 + fraction / 1024);
  }
  if (exponent === 0xff) {
    return 0; //infinity
  }
  return sign * 2 ** (exponent - bias) * (1 + fraction / 1024);
}

// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(bytes: Buffer) {
  //获取uplink消息类型
  const uplink_type = (bytes[0] >> 4) & 0x0f;
  switch (uplink_type) {
    case 0x01:
      return Register_proc(bytes);

    case 0x02:
      return Heartbeat_proc(bytes);

    case 0x03:
      return PeriodicalPosition_proc(bytes);

    case 0x04:
      return OnDemandPosition_proc(bytes);

    case 0x05:
      return HistoryPosition_proc(bytes);

    case 0x06:
      return Alarm_proc(bytes);

    case 0x07:
      return BleCoordinate_proc(bytes);

    case 0x08:
      return Acknowledge_proc(bytes);

    default:
      return null;
  }
}

//Message type: Register  0x1
function Register_proc(bytes: Buffer) {
  const Register_Msg: {
    type: string;
    adr: string;
    mode: string;
    smode: string;
    BleTxPower: number;
    frequencysweepmode: string;
    dr: string;
    breakpoint: string;
    selfadapt: string;
    oneoff: string;
    alreport: string;
    pos: number;
    hb: number;
    crc: number;
  } = {
    type: "",
    adr: "",
    mode: "",
    smode: "",
    BleTxPower: 0,
    frequencysweepmode: "",
    dr: "",
    breakpoint: "",
    selfadapt: "",
    oneoff: "",
    alreport: "",
    pos: 0,
    hb: 0,
    crc: 0,
  };
  //type
  Register_Msg.type = "Register";
  //adr
  const adr = (bytes[0] >> 3) & 0x01;
  switch (adr) {
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
  const mode = bytes[0] & 0x07;
  switch (mode) {
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
  const smode = bytes[1];
  switch (smode) {
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
    value: (bytes[2] >> 3) & 0x1f,
    unit: "dBm",
  };
  //Register_Msg.rfu1 = (bytes[2] & 0x07);
  if (Register_Msg.mode === "CLAA") {
    const frequencysweepmode = bytes[2] & 0x07;
    if (frequencysweepmode === 0x01) {
      Register_Msg.frequencysweepmode = "A mode";
    } else if (frequencysweepmode === 0x02) {
      Register_Msg.frequencysweepmode = "B mode";
    } else if (frequencysweepmode === 0x03) {
      Register_Msg.frequencysweepmode = "C mode";
    } else if (frequencysweepmode === 0x04) {
      Register_Msg.frequencysweepmode = "D mode";
    } else if (frequencysweepmode === 0x05) {
      Register_Msg.frequencysweepmode = "E mode";
    } else if (frequencysweepmode === 0x06) {
      Register_Msg.frequencysweepmode = "All frequency sweep";
    }
  }
  //DR
  Register_Msg.dr = `DR${(bytes[3] >> 4) & 0x0f}`;
  //breakpoint
  const breakpoint = (bytes[3] >> 3) & 0x01;
  switch (breakpoint) {
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
  const selfadapt = (bytes[3] >> 2) & 0x01;
  switch (selfadapt) {
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
  const oneoff = (bytes[3] >> 1) & 0x01;
  switch (oneoff) {
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
  const alreport = bytes[3] & 0x01;
  switch (alreport) {
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
  Register_Msg.pos = (((bytes[4] << 8) & 0xff00) | (bytes[5] & 0xff)) * 5;
  //HB
  Register_Msg.hb = bytes[6] * 30;
  //crc
  Register_Msg.crc = ((bytes[7] << 8) & 0xff00) | (bytes[8] & 0xff);
  return Register_Msg;
}

//Message type: Heartbeat  0x2
function Heartbeat_proc(bytes: Buffer) {
  const Heartbeat_Msg: {
    type: string;
    ver: number;
    vol: number;
    rssi: number;
    snr: number;
    gpsstate: string;
    vibstate: number;
    chgstate: string;
    crc: number;
  } = {
    type: "",
    ver: 0,
    vol: 0,
    rssi: 0,
    snr: 0,
    gpsstate: "",
    vibstate: 0,
    chgstate: "",
    crc: 0,
  };
  //type
  Heartbeat_Msg.type = "Heartbeat";
  //ver
  Heartbeat_Msg.ver = bytes[0] & 0x0f;
  //vol
  Heartbeat_Msg.vol = bytes[1];
  //rssi
  Heartbeat_Msg.rssi = bytes[2] * -1;
  //SNR
  let snr = ((bytes[3] << 8) & 0xff00) | (bytes[4] & 0xff);
  snr = snr > 0x7fff ? snr - 0x10000 : snr;

  Heartbeat_Msg.snr = snr * 0.01;
  //GPSSTATE
  const gpsstate = (bytes[5] >> 4) & 0x0f;
  switch (gpsstate) {
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
  Heartbeat_Msg.vibstate = bytes[5] & 0x0f;

  //chgstate
  const chgstate = (bytes[6] >> 4) & 0x0f;
  switch (chgstate) {
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
  Heartbeat_Msg.crc = ((bytes[7] << 8) & 0xff00) | (bytes[8] & 0xff);
  return Heartbeat_Msg;
}

//Message type: PeriodicalPosition  0x03
function PeriodicalPosition_proc(bytes: Buffer) {
  const PeriodicalPposition_Msg: any = {
    type: 0,
    longitude: 0,
    latitude: 0,
    time: 0,
    location: 0,
  };
  //type
  PeriodicalPposition_Msg.type = "PeriodicalPosition";
  //longitude
  const lng = bytes.readFloatBE(1); //(((bytes[1] << 24) & 0xFF000000) | ((bytes[2] << 16) & 0xFF0000) | ((bytes[3] << 8) & 0xFF00) | (bytes[4] & 0xFF));
  // lng = lng > 0x7fffffff ? lng - 0x100000000 : lng; // 0x94B62E00 (-180) to 0x6B49D200 (180)
  PeriodicalPposition_Msg.longitude = {
    value: lng, //bytes.readFloatBE(1),
    unit: "°",
  };
  //latitude
  const lat = bytes.readFloatBE(5); //(((bytes[5] << 24) & 0xFF000000) | ((bytes[6] << 16) & 0xFF0000) | ((bytes[7] << 8) & 0xFF00) | (bytes[8] & 0xFF));
  // lat = lat > 0x7fffffff ? lat - 0x100000000 : lat; // 0xCA5B1700 (-90) to 0x35A4E900 (90)
  PeriodicalPposition_Msg.latitude = {
    value: lat, //bytes.readFloatBE(5), //lat / 10000000,
    unit: "°",
  };
  //time
  PeriodicalPposition_Msg.time = {
    value:
      ((bytes[9] << 24) & 0xff000000) |
      ((bytes[10] << 16) & 0xff0000) |
      ((bytes[11] << 8) & 0xff00) |
      (bytes[12] & 0xff),
    unit: "sec",
  };
  PeriodicalPposition_Msg.location = {
    value: `${lat},${lng}`,
    location: {
      lat: lat,
      lng: lng,
    },
  };
  return PeriodicalPposition_Msg;
}

//Message type: OnDemandPosition  0x04
function OnDemandPosition_proc(bytes: Buffer) {
  const OnDemandPosition_Msg: {
    type: string;
    msgid: number;
    longitude: number;
    latitude: number;
    location: string;
    time: number;
  } = {
    type: "",
    msgid: 0,
    longitude: 0,
    latitude: 0,
    location: "",
    time: 0,
  };
  //type
  OnDemandPosition_Msg.type = "OnDemandPosition";
  //magid
  OnDemandPosition_Msg.msgid = bytes[1];
  //longitude
  const lng = bytes.readFloatBE(2); //(((bytes[2] <<24) & 0xFF000000) | ((bytes[3] << 16) & 0xFF0000) | ((bytes[4] << 8) & 0xFF00) | (bytes[5] & 0xFF));
  //lng = lng > 0x7fffffff ? lng - 0x100000000 : lng; // 0x94B62E00 (-180) to 0x6B49D200 (180)
  OnDemandPosition_Msg.longitude = lng;
  //latitude
  const lat = bytes.readFloatBE(6); //(((bytes[6] <<24) & 0xFF000000) | ((bytes[7] << 16) & 0xFF0000) | ((bytes[8] << 8) & 0xFF00) | (bytes[9] & 0xFF));
  //lat = lat > 0x7fffffff ? lat - 0x100000000 : lat; // 0xCA5B1700 (-90) to 0x35A4E900 (90)
  OnDemandPosition_Msg.latitude = lat;
  //time
  OnDemandPosition_Msg.time =
    ((bytes[10] << 24) & 0xff000000) |
    ((bytes[11] << 16) & 0xff0000) |
    ((bytes[12] << 8) & 0xff00) |
    (bytes[13] & 0xff);
  OnDemandPosition_Msg.location = `${lat},${lng}`;
  return OnDemandPosition_Msg;
}

//Message type: HistoryPosition  0x05
function HistoryPosition_proc(bytes: Buffer) {
  const HistoryPositon_Msg: {
    type: string;
    length: number;
    longitude: number;
    latitude: number;
    location: string;
    time: number;
  } = {
    type: "",
    length: 0,
    longitude: 0,
    latitude: 0,
    location: "",
    time: 0,
  };
  //type
  HistoryPositon_Msg.type = "HistoryPosition";
  //length
  HistoryPositon_Msg.length = bytes[0] & 0x0f;
  //longitude
  const lng = bytes.readFloatBE(1); //(((bytes[1] <<24) & 0xFF000000) | ((bytes[2] << 16) & 0xFF0000) | ((bytes[3] << 8) & 0xFF00) | (bytes[4] & 0xFF));
  // lng = lng > 0x7fffffff ? lng - 0x100000000 : lng; // 0x94B62E00 (-180) to 0x6B49D200 (180)

  HistoryPositon_Msg.longitude = lng;
  //latitude
  const lat = bytes.readFloatBE(5); //(((bytes[5] <<24) & 0xFF000000) | ((bytes[6] << 16) & 0xFF0000) | ((bytes[7] << 8) & 0xFF00) | (bytes[8] & 0xFF));
  //lat = lat > 0x7fffffff ? lat - 0x100000000 : lat;
  HistoryPositon_Msg.latitude = lat;
  //location
  HistoryPositon_Msg.location = `${lat},${lng}`;
  //time
  HistoryPositon_Msg.time =
    ((bytes[9] << 24) & 0xff000000) |
    ((bytes[10] << 16) & 0xff0000) |
    ((bytes[11] << 8) & 0xff00) |
    (bytes[12] & 0xff);
  //It's P2P message, need to calcuate the real length.
  if (HistoryPositon_Msg.length === 0x0f) {
    return null;
  }
  //Maximum 6 groups of history position
  if (HistoryPositon_Msg.length > 6) {
    return null;
  }
  for (let i = 0; i < HistoryPositon_Msg.length; i++) {
    const tmp = i + 2;
    //console.log(bytes.slice(15+6*i,17+6*i),bytes.slice(13+6*i,15+6*i));
    const lngoff = float16(bytes.slice(13 + 6 * i, 15 + 6 * i)); //float16(((bytes[13+6*i] << 8) & 0xFF00) | (bytes[14+6*i] & 0xFF));
    //lngoff = lngoff > 0x7fff ? lngoff - 0x10000 : lngoff;
    HistoryPositon_Msg[`pos${tmp}lngoff`] = {
      value: lngoff, // / 10000000,
      unit: "°",
    };
    const latoff = float16(bytes.slice(15 + 6 * i, 17 + 6 * i)); //float16(((bytes[15+6*i] << 8) & 0xFF00) | (bytes[16+6*i] & 0xFF));
    // latoff = latoff > 0x7fff ? latoff - 0x10000 : latoff;
    HistoryPositon_Msg[`pos${tmp}latoff`] = {
      value: latoff, // / 10000000,
      unit: "°",
    };
    HistoryPositon_Msg[`pos${tmp}toff`] = {
      value: ((bytes[17 + 6 * i] << 8) & 0xff00) | (bytes[18 + 6 * i] & 0xff),
      unit: "sec",
    };
  }
  return HistoryPositon_Msg;
}

//Message type: Alarm  0x06
function Alarm_proc(bytes: Buffer) {
  const Alarm_Msg: {
    type: string;
    alarm: string;
    msgid: number;
  } = {
    type: "",
    alarm: "",
    msgid: 0,
  };
  //type
  Alarm_Msg.type = "Alarm";
  //alarm
  const alarm = bytes[0] & 0x0f;
  switch (alarm) {
    case 0x1:
      Alarm_Msg.alarm = "sos";
      break;

    default:
      break;
  }
  //msgid
  Alarm_Msg.msgid = bytes[1];
  return Alarm_Msg;
}

//Message type: BleCoordinate   0x07
function BleCoordinate_proc(bytes: Buffer) {
  const BleCoordinate_Msg: {
    type: string;
    length: number;
    move: number;
  } = {
    type: "",
    length: 0,
    move: 0,
    // "name":0,
  };
  BleCoordinate_Msg.type = "BleCoordinate";
  BleCoordinate_Msg.length = bytes[0] & 0x0f;
  BleCoordinate_Msg.move = bytes[1];
  // BleCoordinate_Msg.rfu = ((bytes[2] << 24) & 0xFF000000) | ((bytes[3] << 16) & 0x00FF0000) | ((bytes[4] << 8) & 0x0000FF00) | (bytes[5] & 0x000000FF);
  for (let i = 0; i < BleCoordinate_Msg.length; i++) {
    BleCoordinate_Msg[`dev${i + 1}major`] =
      ((bytes[6 + 5 * i] << 8) & 0xff00) | (bytes[7 + 5 * i] & 0xff);
    BleCoordinate_Msg[`dev${i + 1}minor`] =
      ((bytes[8 + 5 * i] << 8) & 0xff00) | (bytes[9 + 5 * i] & 0xff);
    BleCoordinate_Msg[`dev${i + 1}rssi`] = {
      value: bytes[10 + 5 * i] - 256,
      unit: "dBm",
    };
  }
  return BleCoordinate_Msg;
}

//Message type: Acknowledge   0x08
function Acknowledge_proc(bytes: Buffer) {
  const Acknowledge_Msg: {
    type: string;
    result: string;
    msgid: number;
  } = {
    type: "",
    result: "",
    msgid: 0,
  };
  Acknowledge_Msg.type = "Acknowledge";
  const result = bytes[0] & 0x0f;
  switch (result) {
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

const ignore_vars: any = [];

function toTagoFormat(object_item: any, group: any, prefix = "") {
  const result: any = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) {
      continue;
    }

    if (typeof object_item[key] === "object") {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        group: object_item[key].group || group,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        group,
      });
    }
  }

  return result;
}

// const payload = [{ variable: "payload", value: "3042ed8a9c41ffce2f60742681" }]; //this is for type 1
// const payload = [{ variable: "payload", value: "1101702f00030a0000" }]; //this is for type 1
//const payload = [{ variable: "payload", value: "215f5ff44810500000" }]; // snr -30 for type 2
//const payload = [{ variable: "payload", value: "215f5f0bb810500000" }]; // snr 30 for type 2
// const payload = [{ variable: "payload", value: "3094b62e0035a4e900605b92a7" }]; // negative lng positive lat for type 3
// const payload = [{ variable: "payload", value: "40016b49d200ca5b1700605b92a7" }]; // positive lng negative lat for type 4
// const payload = [{ variable: "payload", value: "5142ed8a9c41ffce2f605b92a7000103ff000f" }]; // positive lng negative lat for type 5
// const payload = [{ variable: "payload", value: "7100000000000005000348" }]; // type 7

const data = payload.find(
  (x) =>
    x.variable === "payload_raw" ||
    x.variable === "payload" ||
    x.variable === "data"
);

if (data) {
  const buffer = Buffer.from(data.value, "hex");
  // console.log(buffer);
  const group = payload[0].group || String(new Date().getTime());
  payload = payload.concat(toTagoFormat(Decode(buffer), group));
  //payload = payload.map((x) => ({ ...x, group }));
}

// console.log(payload);
