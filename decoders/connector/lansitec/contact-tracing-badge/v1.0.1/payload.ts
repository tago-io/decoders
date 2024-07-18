// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(bytes: Buffer) {
  console.log("Decode");
  //获取uplink消息类型
  const uplink_type = (bytes[0] >> 4) & 0x0f;

  switch (uplink_type) {
    case 0x01:
      //proc
      return Register_proc(bytes);

    case 0x02:
      return Heartbeat_proc(bytes);

    case 0x08:
      return TenSecInstantReportMode_proc(bytes);

    case 0x0c:
      return EightySecPeriodicReportMode_proc(bytes);

    case 0x0f:
      return Acknowledge_proc(bytes);

    default:
      return null;
  }
}

//Message type: Register  0x1
function Register_proc(bytes: Buffer) {
  const Register_Msg: any = {
    type: 0,
    adr: 0,
    mode: 0,
    smode: 0,
    LoraTxpower: 0,
    dr: 0,
    pos: 0,
    hb: 0,
    buzzerAndvibrator: 0,
    BleTxPower: 0,
    proximitydetection: 0,
    threshold: 0,
    crc: 0,
  };

  //type
  Register_Msg.type = "Register";
  Register_Msg.adr = (bytes[0] >> 3) & 0x01;
  switch (Register_Msg.adr) {
    case 0:
      Register_Msg.adr = "OFF";
      break;

    case 1:
      Register_Msg.adr = "ON";
      break;

    default:
      break;
  }
  //mode
  Register_Msg.mode = bytes[0] & 0x07;
  switch (Register_Msg.mode) {
    case 0x01:
      Register_Msg.mode = "AU915";
      break;

    case 0x02:
      Register_Msg.mode = "IN865";
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
      Register_Msg.smode = "AU915";
      break;

    case 0x02:
      Register_Msg.smode = "IN865";
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
  //LoraTxpower
  Register_Msg.LoraTxpower = {
    value: (bytes[2] >> 3) & 0x1f,
    unit: "dBm",
  };
  //dr
  Register_Msg.dr = (bytes[3] >> 4) & 0x0f;
  //pos
  Register_Msg.pos = {
    value: (((bytes[4] << 8) & 0xff00) | (bytes[5] & 0xff)) * 5,
    unit: "sec",
  };
  //hb
  Register_Msg.hb = {
    value: bytes[6] * 30,
    unit: "sec",
  };
  //rfu
  // Register_Msg["rfu"] = ((bytes[7] >> 4) & 0x0F);
  //buzzer and vibrator
  const buzzerAndvibrator = (bytes[7] >> 3) & 0x01;
  switch (buzzerAndvibrator) {
    case 0x00:
      Register_Msg.buzzerAndvibrator = "OFF";
      break;

    case 0x01:
      Register_Msg.buzzerAndvibrator = "ON";
      break;

    default:
      break;
  }
  //BleTxPower
  Register_Msg.BleTxPower = bytes[7] & 0x07;
  switch (Register_Msg.BleTxPower) {
    case 0x01:
      Register_Msg.BleTxPower = {
        value: 4,
        unit: "dBm",
      };
      break;

    case 0x02:
      Register_Msg.BleTxPower = {
        value: 0,
        unit: "dBm",
      };
      break;

    case 0x03:
      Register_Msg.BleTxPower = {
        value: -4,
        unit: "dBm",
      };
      break;

    case 0x04:
      Register_Msg.BleTxPower = {
        value: -8,
        unit: "dBm",
      };
      break;

    case 0x05:
      Register_Msg.BleTxPower = {
        value: -12,
        unit: "dBm",
      };
      break;

    case 0x06:
      Register_Msg.BleTxPower = {
        value: -16,
        unit: "dBm",
      };
      break;

    case 0x07:
      Register_Msg.BleTxPower = {
        value: -20,
        unit: "dBm",
      };
      break;

    default:
      break;
  }
  //BT function and proximity detection
  const proximitydetection = (bytes[8] >> 7) & 0x01;
  switch (proximitydetection) {
    case 0x00:
      Register_Msg.proximitydetection = "OFF";
      break;

    case 0x01:
      Register_Msg.proximitydetection = "ON";
      break;

    default:
      break;
  }
  Register_Msg.threshold = {
    value: bytes[8] & 0x7f,
    unit: "-dBm",
  };
  Register_Msg.crc = ((bytes[9] << 8) & 0xff00) | (bytes[10] & 0xff);
  return Register_Msg;
}

//Message type: Heartbeat  0x2
function Heartbeat_proc(bytes: Buffer) {
  const Heartbeat_Msg: any = {
    type: 0,
    ver: 0,
    vol: 0,
    rssi: 0,
    snr: 0,
    revision: 0,
    chgstate: 0,
    crc: 0,
    mode: 0,
    buzzerAndvibrator: 0,
    range: 0,
    BleTxPower: 0,
    threshold: 0,
    friendnum: 0,
  };
  //type
  Heartbeat_Msg.type = "Heartbeat";
  //version
  Heartbeat_Msg.ver = bytes[0] & 0x0f;
  //battery level
  Heartbeat_Msg.vol = {
    value: bytes[1],
    unit: "%",
  };
  //rssi
  Heartbeat_Msg.rssi = {
    value: bytes[2],
    unit: "-dBm",
  };
  //SNR
  let snr = ((bytes[3] << 8) & 0xff00) | (bytes[4] & 0xff);
  snr = snr > 0x7fff ? snr - 0x10000 : snr;
  Heartbeat_Msg.snr = {
    value: snr * 0.01,
    unit: "dB",
  };
  //Revision
  Heartbeat_Msg.revision = bytes[5];
  //Status of battery.
  Heartbeat_Msg.chgstate = bytes[6];
  switch (Heartbeat_Msg.chgstate) {
    case 0x00:
      Heartbeat_Msg.chgstate = "Not charging";
      break;

    case 0x05:
      Heartbeat_Msg.chgstate = "Charging";
      break;

    case 0x06:
      Heartbeat_Msg.chgstate = "Charge completed";
      break;

    default:
      break;
  }
  //CRC
  Heartbeat_Msg.crc = ((bytes[7] << 8) & 0xff00) | (bytes[8] & 0xff);
  // BTSTATUS FIELD
  //mode
  Heartbeat_Msg.mode = (bytes[9] >> 4) & 0x0f;
  switch (Heartbeat_Msg.mode) {
    case 0x00:
      Heartbeat_Msg.mode = "no action";
      break;
    default:
      break;
  }
  //Vibrator and buzzer
  const buzzerAndvibrator = bytes[9] & 0x0f;
  switch (buzzerAndvibrator) {
    case 0x00:
      Heartbeat_Msg.buzzerAndvibrator = "No action";
      break;

    case 0x01:
      Heartbeat_Msg.buzzerAndvibrator = "vibrator disable and buzzer mute";
      break;

    case 0x02:
      Heartbeat_Msg.buzzerAndvibrator = "vibrator disable and buzzer half";
      break;

    case 0x03:
      Heartbeat_Msg.buzzerAndvibrator = "vibrator disable and buzzer full";
      break;

    case 0x04:
      Heartbeat_Msg.buzzerAndvibrator = "vibrator enable and buzzer mute";
      break;

    case 0x05:
      Heartbeat_Msg.buzzerAndvibrator = "vibrator enable and buzzer half";
      break;

    case 0x06:
      Heartbeat_Msg.buzzerAndvibrator = "vibrator enable and buzzer full";
      break;

    case 0x07:
      Heartbeat_Msg.buzzerAndvibrator = "vibrator disable and buzzer mute";
      break;

    case 0x08:
      Heartbeat_Msg.buzzerAndvibrator =
        "disable beacon-in-tracker and proximity detection";
      break;

    default:
      break;
  }
  //Range
  Heartbeat_Msg.range = (bytes[10] >> 7) & 0x01;
  switch (Heartbeat_Msg.range) {
    case 0x00:
      Heartbeat_Msg.range = "-73dBm~-87dBm";
      break;

    case 0x01:
      Heartbeat_Msg.range = "-58dBm~-72dBm";
      break;

    default:
      break;
  }
  //BleTxPower
  Heartbeat_Msg.BleTxPower = (bytes[10] >> 4) & 0x07;
  switch (Heartbeat_Msg.BleTxPower) {
    case 0x00:
      Heartbeat_Msg.BleTxPower = "not changed";
      break;

    case 0x01:
      Heartbeat_Msg.BleTxPower = {
        value: 4,
        unit: "dBm",
      };
      break;

    case 0x02:
      Heartbeat_Msg.BleTxPower = {
        value: 0,
        unit: "dBm",
      };
      break;

    case 0x03:
      Heartbeat_Msg.BleTxPower = {
        value: -4,
        unit: "dBm",
      };
      break;

    case 0x04:
      Heartbeat_Msg.BleTxPower = {
        value: -8,
        unit: "dBm",
      };
      break;

    case 0x05:
      Heartbeat_Msg.BleTxPower = {
        value: -12,
        unit: "dBm",
      };
      break;

    case 0x06:
      Heartbeat_Msg.BleTxPower = {
        value: -16,
        unit: "dBm",
      };
      break;

    case 0x07:
      Heartbeat_Msg.BleTxPower = {
        value: -20,
        unit: "dBm",
      };
      break;

    default:
      break;
  }
  //receiveThreshold
  Heartbeat_Msg.threshold = bytes[10] & 0x0f;
  switch (Heartbeat_Msg.threshold) {
    case 0x00:
      Heartbeat_Msg.threshold = "not changed";
      break;

    case 0x01:
      Heartbeat_Msg.threshold = {
        value: -73,
        unit: "dBm",
      };
      break;

    case 0x02:
      Heartbeat_Msg.threshold = {
        value: -74,
        unit: "dBm",
      };
      break;

    case 0x03:
      Heartbeat_Msg.threshold = {
        value: -75,
        unit: "dBm",
      };
      break;

    case 0x04:
      Heartbeat_Msg.threshold = {
        value: -76,
        unit: "dBm",
      };
      break;

    case 0x05:
      Heartbeat_Msg.threshold = {
        value: -77,
        unit: "dBm",
      };
      break;

    case 0x06:
      Heartbeat_Msg.threshold = {
        value: -78,
        unit: "dBm",
      };
      break;

    case 0x07:
      Heartbeat_Msg.threshold = {
        value: -79,
        unit: "dBm",
      };
      break;

    case 0x08:
      Heartbeat_Msg.threshold = {
        value: -80,
        unit: "dBm",
      };
      break;

    case 0x09:
      Heartbeat_Msg.threshold = {
        value: -81,
        unit: "dBm",
      };
      break;

    case 0x0a:
      Heartbeat_Msg.threshold = {
        value: -82,
        unit: "dBm",
      };
      break;

    case 0x0b:
      Heartbeat_Msg.threshold = {
        value: -83,
        unit: "dBm",
      };
      break;

    case 0x0c:
      Heartbeat_Msg.threshold = {
        value: -84,
        unit: "dBm",
      };
      break;

    case 0x0d:
      Heartbeat_Msg.threshold = {
        value: -85,
        unit: "dBm",
      };
      break;

    case 0x0e:
      Heartbeat_Msg.threshold = {
        value: -86,
        unit: "dBm",
      };
      break;

    case 0x0f:
      Heartbeat_Msg.threshold = {
        value: -87,
        unit: "dBm",
      };
      break;

    default:
      break;
  }
  // FRIEND FIELD
  const type = (bytes[11] >> 4) & 0x0f;
  if (0x0c !== type) {
    return Heartbeat_Msg;
  }
  Heartbeat_Msg.friendnum = bytes[11] & 0x0f;
  for (let i = 0; i < Heartbeat_Msg.friendnum; i++) {
    const tmp = i + 1;
    Heartbeat_Msg[`dev${tmp}major`] =
      ((bytes[12 + 4 * i] << 8) & 0xff00) | (bytes[13 + 4 * i] & 0xff);
    Heartbeat_Msg[`dev${tmp}minor`] =
      ((bytes[14 + 4 * i] << 8) & 0xff00) | (bytes[15 + 4 * i] & 0xff);
  }
  return Heartbeat_Msg;
}

//Message type: TenSecInstantReportMode  0x8
function TenSecInstantReportMode_proc(bytes: Buffer) {
  const TenSecInstantReportMode_Msg: any = {
    type: 0,
    length: 0,
  };
  TenSecInstantReportMode_Msg.type = "TenSecInstantReportMode";
  TenSecInstantReportMode_Msg.length = bytes[0] & 0x0f;
  if (0 === TenSecInstantReportMode_Msg.length) {
    return TenSecInstantReportMode_Msg;
  }
  for (let i = 0; i < TenSecInstantReportMode_Msg.length; i++) {
    const tmp = i + 1;
    TenSecInstantReportMode_Msg[`dev${tmp}major`] =
      ((bytes[1 + 5 * i] << 8) & 0xff00) | (bytes[2 + 5 * i] & 0xff);
    TenSecInstantReportMode_Msg[`dev${tmp}minor`] =
      ((bytes[3 + 5 * i] << 8) & 0xff00) | (bytes[4 + 5 * i] & 0xff);
    TenSecInstantReportMode_Msg[`dev${tmp}beacontype`] =
      (bytes[5 + 5 * i] >> 7) & 0x01;
    switch (TenSecInstantReportMode_Msg[`dev${tmp}beacontype`]) {
      case 0x00:
        TenSecInstantReportMode_Msg[`dev${tmp}beacontype`] =
          "beacon-in-tracker";
        break;

      case 0x01:
        TenSecInstantReportMode_Msg[`dev${tmp}beacontype`] = "bluetooth beacon";
        break;

      default:
        break;
    }
    TenSecInstantReportMode_Msg[`dev${tmp}rssi`] = {
      value: ((bytes[5 + 5 * i] & 0x7f) - 0x80) * -1,
      unit: "-dBm",
    };
  }
  const begin = 6 + 5 * (TenSecInstantReportMode_Msg.length - 1);
  const n = Math.floor((TenSecInstantReportMode_Msg.length + 1) / 2);
  for (let i = 0; i < n; ++i) {
    const tmp = i + 1;
    TenSecInstantReportMode_Msg[`dev${tmp}tmoff`] = {
      value: (bytes[begin + i] >> 4) & 0x0f,
      unit: "sec",
    };
    if (tmp + 1 <= TenSecInstantReportMode_Msg.length) {
      TenSecInstantReportMode_Msg[`dev${tmp}tmoff`] = {
        value: bytes[begin + i] & 0x0f,
        unit: "sec",
      };
    }
  }
  return TenSecInstantReportMode_Msg;
}

//Message type: EightySecPeriodicReportMode  0xC
function EightySecPeriodicReportMode_proc(bytes: Buffer) {
  const EightySecPeriodicReportMode_Msg: any = {
    type: 0,
    length: 0,
  };
  EightySecPeriodicReportMode_Msg.type = "EightySecPeriodicReportMode";
  EightySecPeriodicReportMode_Msg.length = bytes[0] & 0x0f;
  for (let i = 1, k = 1; i < bytes.length; k++) {
    if (bytes[i] === 0xff && bytes[i + 1] === 0xff) {
      i += 2;
      for (let j = 1; j <= EightySecPeriodicReportMode_Msg.length; j++) {
        EightySecPeriodicReportMode_Msg[`beacon${j}minor`] =
          ((bytes[i++] << 8) & 0xff00) | (bytes[i++] & 0xff);
        EightySecPeriodicReportMode_Msg[`beacon${j}timemark_beacon`] = bytes[i];
        EightySecPeriodicReportMode_Msg[`beacon${j}timemark_beacon_0_9`] =
          bytes[i] & 0x01;
        EightySecPeriodicReportMode_Msg[`beacon${j}timemark_beacon_10_19`] =
          (bytes[i] >> 1) & 0x01;
        EightySecPeriodicReportMode_Msg[`beacon${j}timemark_beacon_20_19`] =
          (bytes[i] >> 2) & 0x01;
        EightySecPeriodicReportMode_Msg[`beacon${j}timemark_beacon_30_19`] =
          (bytes[i] >> 3) & 0x01;
        EightySecPeriodicReportMode_Msg[`beacon${j}timemark_beacon_40_19`] =
          (bytes[i] >> 4) & 0x01;
        EightySecPeriodicReportMode_Msg[`beacon${j}timemark_beacon_50_19`] =
          (bytes[i] >> 5) & 0x01;
        EightySecPeriodicReportMode_Msg[`beacon${j}timemark_beacon_60_19`] =
          (bytes[i] >> 6) & 0x01;
        EightySecPeriodicReportMode_Msg[`beacon${j}timemark_beacon_70_19`] =
          (bytes[i++] >> 7) & 0x01;
      }
      return EightySecPeriodicReportMode_Msg;
    }
    EightySecPeriodicReportMode_Msg[`badge${k}major`] =
      ((bytes[i++] << 8) & 0xff00) | (bytes[i++] & 0xff);
    EightySecPeriodicReportMode_Msg[`badge${k}minor`] =
      ((bytes[i++] << 8) & 0xff00) | (bytes[i++] & 0xff);
    EightySecPeriodicReportMode_Msg[`badge${k}timemark_badge`] = bytes[i];
    EightySecPeriodicReportMode_Msg[`badge${k}timemark_badge_0_9`] =
      bytes[i] & 0x01;
    EightySecPeriodicReportMode_Msg[`badge${k}timemark_badge_10_19`] =
      (bytes[i] >> 1) & 0x01;
    EightySecPeriodicReportMode_Msg[`badge${k}timemark_badge_20_29`] =
      (bytes[i] >> 2) & 0x01;
    EightySecPeriodicReportMode_Msg[`badge${k}timemark_badge_30_39`] =
      (bytes[i] >> 3) & 0x01;
    EightySecPeriodicReportMode_Msg[`badge${k}timemark_badge_40_49`] =
      (bytes[i] >> 4) & 0x01;
    EightySecPeriodicReportMode_Msg[`badge${k}timemark_badge_50_59`] =
      (bytes[i] >> 5) & 0x01;
    EightySecPeriodicReportMode_Msg[`badge${k}timemark_badge_60_69`] =
      (bytes[i] >> 6) & 0x01;
    EightySecPeriodicReportMode_Msg[`badge${k}timemark_badge_70_79`] =
      (bytes[i++] >> 7) & 0x01;
  }

  return EightySecPeriodicReportMode_Msg;
}

//Message type: Acknowledge  0xF
function Acknowledge_proc(bytes: Buffer) {
  const Acknowledge_Msg: any = {
    type: 0,
    result: 0,
    msgid: 0,
  };
  Acknowledge_Msg.type = "Acknowledge";
  Acknowledge_Msg.result = bytes[0] & 0x0f;
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

// const payload = [{ variable: "payload", value: "1901702000020a0c810000"}];
//const payload = [{ variable: "payload", value: "215f0409c4010600000695"}];
// const payload = [{ variable: "payload", value: "820005000382000900072b21" }];
// const payload = [{ variable: "payload", value: "c2d011002ef9d011002d8f" }];
// const payload = [{ variable: "payload", value: "c2d011002ef9d011002d8fffff019bdf00f020" }];
// const payload = [{ variable: "payload", value: "d101 "}];
//console.log(payload);

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
  payload = payload.map((x) => ({ ...x, group }));
  payload = payload.concat(toTagoFormat(Decode(buffer), group));
  //payload = payload.map((x) => ({ ...x, group }));
}
//console.log(payload);
