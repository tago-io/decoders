// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an object, e.g. {"temperature": 22.5}
// gateway上行数据解析代码
function Decode(fPort, bytes) {
  // 根据消息开头的第一个字节解析数据           
  var type = ((bytes[0] >> 4) & 0x0F);
  if(type == 0x01){
    var beaconBytes = bytes.slice(2, 5);
    // console.log(beaconBytes);
    // 校验过
    return registerUplinkMessage("", bytes);
  }           
  if (type == 0x02){          
    // 校验过
    return heartbeatUplinkMessage("", bytes);
  }  
  if (type == 0x06) {
    // 校验过
    return alarmUplinkMessage("", bytes);
  }            
  if (type == 0x08) {
    // 校验过
    return beaconUplinkMessage("", bytes);
  } 
  if (type == 0x09) {
    // 校验
    return braceletUplinkMessage("", bytes);
  } 
  if (type == 0x0A) {
    // 校验过 - 格式有待完善
    return lightPerceptionUplinkMessage("", bytes);
  } 
  if (type == 0x0B) {
    // 校验过 - 格式有待完善
    return gSensorUplinkMessage("", bytes);
  } 
  if (type == 0x0D) {
    // 校验
    return beaconListUplinkMessage("", bytes);
  } 
  if (type == 0x0F) {
    // 校验过
    return acknowledgeUplinkMessage("", bytes)
  } 
  
}
// 4.4.1 Register, 0x01设备注册消息
function registerUplinkMessage(prefix, bytes) {
  var data = {}; 
  data[prefix+"type"] = "Register";
  data[prefix+"adr"] = ((bytes[0] >> 3) & 0x01) === 0? "OFF" : "ON";
  data[prefix+"mode"] = (bytes[0] & 0x07);
  switch (data[prefix+"mode"]) {
    case 0x01:
      data[prefix+"mode"] = "AU920";
      break;
    case 0x02:
      data[prefix+"mode"] = "CLAA";
      break;
    case 0x03:
      data[prefix+"mode"] = "CN470";
      break;
    case 0x04:
      data[prefix+"mode"] = "AS923";
      break;
    case 0x05:
      data[prefix+"mode"] = "EU433";
      break;
    case 0x06:
      data[prefix+"mode"] = "EU868";
      break;
    case 0x07:
      data[prefix+"mode"] = "US915";
      break;
  }
  data[prefix+"smode"] = bytes[1];
  switch (data[prefix+"smode"]) {
    case 0x01:
      data[prefix+"smode"] = "AU920";
      break;
    case 0x02:
      data[prefix+"smode"] = "CLAA";
      break;
    case 0x04:
      data[prefix+"smode"] = "CN470";
      break;
    case 0x08:
      data[prefix+"smode"] = "AS923";
      break;
    case 0x10:
      data[prefix+"smode"] = "EU433";
      break;
    case 0x20:
      data[prefix+"smode"] = "EU868";
      break;
    case 0x40:
      data[prefix+"smode"] = "US915";
      break;
  }
  data[prefix+"power"] = {
    value: ((bytes[2] >> 3) & 0x1F),
    unit: "dBm"
  };
  if(data[prefix+"mode"] === "CLAA") {
    switch(bytes[2] & 0x07) {
      case 0x01:
        data[prefix+"frequencysweepmode"] = "A mode";
        break;
      case 0x02:
        data[prefix+"frequencysweepmode"] = "B mode";
        break;
      case 0x03:
        data[prefix+"frequencysweepmode"] = "C mode";
        break;  
      case 0x04:
        data[prefix+"frequencysweepmode"] = "D mode";
        break; 
      case 0x05:
        data[prefix+"frequencysweepmode"] = "E mode";
        break; 
      case 0x06:
        data[prefix+"frequencysweepmode"] = "All frequency sweep";
        break; 
    }
  }
  //data[prefix+"reserved"] = (bytes[2] & 0x07);
  data[prefix+"dr"] = `DR${((bytes[3] >> 4) & 0x0F)}`;
  // data[prefix+"cfgReserved"] = 0;
  data[prefix+"pos"] = {
    value: ((((bytes[4] << 8) & 0xff00) | (bytes[5] & 0xff)) * 5),
    unit: "sec"
  };
  data[prefix+"hb"] = {
    value: bytes[6] * 30,
    unit: "sec"
  };
  data[prefix+"crc"] = (((bytes[7] << 8) & 0xff00) | (bytes[8] & 0xff)); // - 65536;
  return data; 
}
// 4.4.2 Heartbeat, 0x2设备心跳消息
function heartbeatUplinkMessage(prefix, bytes) {  
  var data = {}; 
  data[prefix+"type"] = "Heartbeat";
  var bVersion = (bytes[0] & 0x0F)
  data[prefix+"version"] = bVersion;
  data[prefix+"vol"] = {
    value: bytes[1],
    unit: "%"
  };
  data[prefix+"rssi"] = {
    value: bytes[2] * (-1),
    unit: "dBm"
  };
  var snr = (((bytes[3] << 8) & 0xff00) | (bytes[4] & 0xff));
  snr = snr > 0x7fff ? snr - 0x10000 : snr;
  data[prefix+"snr"] =  snr * 0.01;
  data[prefix+"revision"] = bytes[5];
  data[prefix+"chgstat"] = bytes[6];
  switch(data[prefix+"chgstat"]) {
    case 0x00:
      data[prefix+"chgstat"] = "Not charging";
      break;
    case 0x05:
      data[prefix+"chgstat"] = "Charging";
      break;
    case 0x06:
      data[prefix+"chgstat"] = "Charge completed";
      break;
    default:
      break;
  }
  data[prefix+"crc"] = (((bytes[7] << 8) & 0xff00) | (bytes[8] & 0xff));         
  // 打印
  //document.getElementById("demo").innerHTML = JSON.stringify(data);
  //console.log(data);
  return data; 
}
// 4.3.8 Alarm, 0x6报警消息
function alarmUplinkMessage(prefix, bytes) {    
  var data = {}; 
  data[prefix+"type"] = "Alarm";
  data[prefix+"alarm"] = (bytes[0] & 0x0F);
  data[prefix+"msgid"] = bytes[1];   
  // document.getElementById("demo").innerHTML = JSON.stringify(data);
  return data; 
}
// 4.4.3 Beacon, 0x8信标消息
function beaconUplinkMessage(prefix, bytes) {  
  //console.log(bytes);   
  var data = {}; 
  data[prefix+"type"] = "Beacon";
  var length = (bytes[0] & 0X0F);
  data[prefix+"length"] = length;
  if(length === 0) {
    return data;
  }
  for(var idx = 0; idx < length; idx++){
    //console.log(bytes.slice(1 + 5 * idx, 6 + 5 * idx));
    var tmp1 = idx + 1;  
    var major =  ((bytes[1 + 5 * idx] & 0xFF) << 8 | (bytes[2 + 5 * idx] & 0xFF));
    var minor =  ((bytes[3 + 5 * idx] & 0xFF) << 8 | (bytes[4 + 5 * idx] & 0xFF));
    var rssi =   (bytes[5 + 5 * idx] & 0xFF) * (-1);
    data[prefix+"dev"+tmp1+"major"] = major;
    data[prefix+"dev"+tmp1+"minor"] = minor;
    data[prefix+"dev"+tmp1+"rssi"] = {
      value: rssi,
      unit: "dBm"
    };
  }
  const begin = 6 + 5 * (length - 1);
  const n = Math.floor((length + 1) / 2);
  console.log(n);
  for(var i = 0; i < n; ++i) {
    var tmp = 2*i + 1;
    data[prefix+"dev"+tmp+"tmoff"] = {
      value: (bytes[begin + i] >> 4) & 0x0F,
      unit: "sec"
    };
    if (tmp + 1 <= length) {
      data[prefix+"dev"+(tmp+1)+"tmoff"] = {
        value: (bytes[begin + i] & 0x0F),
        unit: "sec"
      };
    }
  }

  return data; 
}
// 4.4.4 Bracelet, 0x9手环消息
function braceletUplinkMessage(prefix, bytes) {   
  var data = {}; 
  data[prefix+"type"] = "Bracelet";
  var length = (bytes[0] & 0x0F);
  data[prefix+"length"] = length;
  var pos = 0;
  for(var i = 0; i < length; ++i) {
    var tmp1 = i+1;
    data[prefix+"dev"+tmp1+"mac"] = `${bytes[pos+1].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+2].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+3].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+4].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+5].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+6].toString(16).padStart(2, "0").toUpperCase()}`;//(((bytes[pos+1] & 0xff) << 40) | ((bytes[pos+2] & 0xff) << 32) | ((bytes[pos+3] & 0xff) << 24) | ((bytes[pos+4] & 0xff) << 16) | ((bytes[pos+5] & 0xff) << 8) | ((bytes[pos+6] & 0xff))).toString(16);
    data[prefix+"dev"+tmp1+"hb"] = (bytes[pos+7] & 0xff);
    data[prefix+"dev"+tmp1+"steps"] = (((bytes[pos+8] << 8) & 0xff00) | (bytes[pos+9] & 0xff));
    data[prefix+"dev"+tmp1+"bat"] = {
      value: (bytes[pos+10] & 0xff),
      unit: "%"
    };
    data[prefix+"dev"+tmp1+"sysp"] = (bytes[pos+11] & 0xff);
    data[prefix+"dev"+tmp1+"diap"] = (bytes[pos+12] & 0xff);
    data[prefix+"dev"+tmp1+"calo"] = {
      value: (((bytes[pos+13] << 8) & 0xff00) | (bytes[pos+14] & 0xff)),
      unit: "Calorie"
    };
    data[prefix+"dev"+tmp1+"rssi"] = {
      value: (bytes[pos+15] & 0xff) * (-1),
      unit: "dBm"
    };
    data[prefix+"dev"+tmp1+"sos"] = bytes[pos+16];
    pos += 16;
  }
  const begin = pos + 1;
  const n = Math.floor((length + 1) / 2);
  for(var i = 0; i < n; ++i) {
    var tmp = i+1;
    data[prefix+"dev"+tmp+"tmoff"] = {
      value: (bytes[begin + i] >> 4) & 0x0F,
      unit: "sec"
    };
    if (tmp + 1 <= length) {
      data[prefix+"dev"+(tmp+1)+"tmoff"] = {
        value: (bytes[begin + i] & 0x0F),
        unit: "sec"
      };
    }
  }          
  return data; 
}
// 4.3.5 Light perception, 0xA光感消息
function lightPerceptionUplinkMessage(prefix, bytes) {     
  var data = {}; 
  data[prefix+"type"] = "LightPerception";
  var length = (bytes[0] & 0x0F);
  data[prefix+"length"] = length;
  var pos = 0;
  for(var i = 0; i < length; ++i) {
    var tmp1 = i+1;
    data[prefix+"dev"+tmp1+"mac"] = `${bytes[pos+1].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+2].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+3].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+4].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+5].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+6].toString(16).padStart(2, "0").toUpperCase()}`;//(((bytes[pos+1] & 0xff) << 40) | ((bytes[pos+2] & 0xff) << 32) | ((bytes[pos+3] & 0xff) << 24) | ((bytes[pos+4] & 0xff) << 16) | ((bytes[pos+5] & 0xff) << 8) | ((bytes[pos+6] & 0xff))).toString(16);
    data[prefix+"dev"+tmp1+"light"] = {
      value: ((bytes[pos+7] & 0xff) << 8 | (bytes[pos+8] & 0xff)),
      unit: "Lux"
    };
    data[prefix+"dev"+tmp1+"bat"] = {
      value: (bytes[pos+9] & 0xff),
      unit: "%"
    };
    data[prefix+"dev"+tmp1+"rssi"] = {
      value: bytes[pos+10] * (-1),
      unit: "dBm"
    };
    pos += 10;
  }
  const begin = pos + 1;
  const n = Math.floor((length + 1) / 2);
  for(var i = 0; i < n; ++i) {
    var tmp = i+1;
    data[prefix+"dev"+tmp+"tmoff"] = {
      value: (bytes[begin + i] >> 4) & 0x0F,
      unit: "sec"
    };
    if (tmp + 1 <= length) {
      data[prefix+"dev"+(tmp+1)+"tmoff"] = {
        value: (bytes[begin + i] & 0x0F),
        unit: "sec"
      };
    }
  }
  return data; 
}
// 4.3.6 G-Sensor, 0xB重力加速度传感器消息
function gSensorUplinkMessage(prefix, bytes) {   
  var data = {}; 
  data[prefix+"type"] = "G-Sensor";
  var length = (bytes[0] & 0x0F);
  data[prefix+"length"] = length;
  var pos = 0;
  for(var i = 0; i < length; ++i) {
    var tmp1 = i+1;
    data[prefix+"dev"+tmp1+"mac"] = `${bytes[pos+1].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+2].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+3].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+4].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+5].toString(16).padStart(2, "0").toUpperCase()}${bytes[pos+6].toString(16).padStart(2, "0").toUpperCase()}`;//(((bytes[pos+1] & 0xff) << 40) | ((bytes[pos+2] & 0xff) << 32) | ((bytes[pos+3] & 0xff) << 24) | ((bytes[pos+4] & 0xff) << 16) | ((bytes[pos+5] & 0xff) << 8) | ((bytes[pos+6] & 0xff))).toString(16);
    var x = ((bytes[pos+7] & 0xff) << 8 | (bytes[pos+8] & 0xff));
    x = x > 0x7fff? x - 0x10000 : x;
    data[prefix+"dev"+tmp1+"x"] = {
      value: x,
      unit: "g"
    };
    var y = ((bytes[pos+9] & 0xff) << 8 | (bytes[pos+10] & 0xff));
    y = y > 0x7fff? y - 0x10000 : y;
    data[prefix+"dev"+tmp1+"y"] = {
      value: y,
      unit: "g"
    };
    var z = ((bytes[pos+11] & 0xff) << 8 | (bytes[pos+12] & 0xff));
    z = z > 0x7fff? z - 0x10000 : z;
    data[prefix+"dev"+tmp1+"z"] = {
      value: z,
      unit: "g"
    };
    data[prefix+"dev"+tmp1+"bat"] = {
      value: (bytes[pos+13] & 0xff),
      unit: "%"
    };
    data[prefix+"dev"+tmp1+"rssi"] = {
      value: (bytes[pos+14] & 0xff) * (-1),
      unit: "dBm"
    };
    pos += 14;
  }
  const begin = pos + 1;
  const n = Math.floor((length + 1) / 2);
  for(var i = 0; i < n; ++i) {
    var tmp = i+1;
    data[prefix+"dev"+tmp+"tmoff"] = {
      value: (bytes[begin + i] >> 4) & 0x0F,
      unit: "sec"
    };
    if (tmp + 1 <= length) {
      data[prefix+"dev"+(tmp+1)+"tmoff"] = {
        value: (bytes[begin + i] & 0x0F),
        unit: "sec"
      };
    }
  }
  return data; 
}
// 4.3.7 Beacon List, 0xD包含4.4.3 Beacon, 4.4.4 Bracelet, 4.3.5 Light perception, 4.3.6 G-Sensor, 四种类型消息至少两种消息以上
function beaconListUplinkMessage(prefix, bytes) {      
  var data = {};  
  data["type"] = "BeaconList";
  // 接收到几种信标类型
  var length = (bytes[0] & 0x0F);
  data["length"] = length;
  // 定义四种信标数据类型
  var beaconList  = {};
  var braceletList = {};
  var lightPerceptionList = {} ;
  var gSensorList  = {};
  //解析数据
  var index = 0
  for (let i = 0; i < length; i++) {
    var tmp1 = i+1;
    // 判断属于哪种信标类型
    var msgType = ((bytes[index+1] & 0xf0) >> 4);
    /*switch(msgType){
      case 0x01:
        data["msgType"+tmp1] = "Beacon";
        break;
      case 0x02:
        data["msgType"+tmp1] = "Bracelet";
        break;
      case 0x03:
        data["msgType"+tmp1] = "Light perception";
        break;
      case 0x04:
        data["msgType"+tmp1] = "G-Sensor";
        break;
      default:
        break;
    }*/
    //data["msgType"] = msgType;
    // 这种类型信标数量
    var msgLength = (bytes[index+1] & 0x0f);
    // msgLengthType, js 1/2 = 0.5, java 1/2 = 0
    var msgLengthType = msgLength;
    if (msgLength % 2 === 1) {
      msgLengthType = msgLength + 1;
    }
    //data["msgLength"+tmp1] = msgLength;
    // 定义变量用来标识数据解析到哪个数组下标
    var msgTotalLength = 0;
    index += 1;
    if(msgType == 1){
      // Beacon
      msgTotalLength = 1 + msgLength * 5 + ((msgLengthType)/2);
      if(index + msgTotalLength <= bytes.length){
        // 解析数据Beacon
        var beaconBytes = bytes.slice(index, index + msgTotalLength);
        beaconList = beaconUplinkMessage("msg"+tmp1, beaconBytes);
        index += msgLength * 5 + (msgLengthType)/2;
        continue;
      }
    } else if(msgType == 2){
      // Bracelet 
      msgTotalLength = 1 + msgLength*16+((msgLengthType)/2);					
      if(index + msgTotalLength <= bytes.length){
        // 解析手环
        var braceletListBytes = bytes.slice(index, index + msgTotalLength);
        braceletList = braceletUplinkMessage("msg"+tmp1, braceletListBytes);
        index += msgLength * 16 + ((msgLengthType)/2);
        continue;
      }
    } else if(msgType == 3){
      // Light perception 
      msgTotalLength = 1 + msgLength*10+((msgLengthType)/2);
      if( index + msgTotalLength <= bytes.length){
        // 解析光感
        var lightPerceptionBytes = bytes.slice(index, index + 1 + msgLength * 10 + ((msgLengthType)/2));
        lightPerceptionList = lightPerceptionUplinkMessage("msg"+tmp1, lightPerceptionBytes);
        index += msgLength * 10 + ((msgLengthType)/2);
        continue;
      }
    } else if(msgType == 4){
      // G-Sensor 
      msgTotalLength = 1 + msgLength*14+((msgLengthType)/2);
      if(index + msgTotalLength <= bytes.length){
        // 解析G-Sensor 
        var lightPerceptionBytes = bytes.slice(index, index + 1 + msgLength*14 + ((msgLengthType)/2));
        gSensorList = gSensorUplinkMessage("msg"+tmp1, lightPerceptionBytes);
        index += msgLength * 14 + ((msgLengthType)/2);
        continue;
      }
    } 
  }
  data = { ...data, ...beaconList, ...braceletList, ...lightPerceptionList, ...gSensorList };
  /*data["beaconList"] = beaconList;      
  data["braceletList"] = braceletList;  
  data["lightPerceptionList"] = lightPerceptionList;      
  data["gSensorList"] = gSensorList;         
  document.getElementById("demo").innerHTML = JSON.stringify(data);*/
  return data; 
}
// 4.3.9 Acknowledge, 0xF确认消息
function acknowledgeUplinkMessage(prefix, bytes) {   
  var data = {}; 
  data[prefix+"type"] = "Acknowledge";
  data[prefix+"result"] = (bytes[0] & 0x0F);
  switch(data[prefix+"result"]){
    case 0x00:
      data[prefix+"result"] = "success";
      break;
    case 0x01:
      data[prefix+"result"] = "failure";
      break;
  }
  data[prefix+"msgid"] = bytes[1];;          
  return data; 
}

const ignore_vars = [];

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

// let payload = [{ variable: "payload", value: "19017020000a040000"}]; // Register
// let payload = [{ variable: "payload", value: "215f0409c401060000"}]; // Heartbeat
// let payload = [{ variable: "payload", value: "81000500030400"}]; // Beacon
// let payload = [{ variable: "payload", value: "91abcdef0102035d03e75432320032040020"}]; // Bracelet
// let payload = [{ variable: "payload", value: "a1abcdef0102030072600430"}]; // light perception
// let payload = [{ variable: "payload", value: "b1abcdef01020300fdfffcffef460710"}]; // g-sensor
// let payload = [{ variable: "payload", value: "d111000500030400"}]; // beacon list - beacon
// let payload = [{ variable: "payload", value: "6005"}]; // alarm
// let payload = [{ variable: "payload", value: "f001"}]; // acknowledge


const data = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const port = payload.find((x) => x.variable === "fport" || x.variable === "port");
if (data) {
  const buffer = Buffer.from(data.value, "hex");

  const serie = data.serie || new Date().getTime();
  payload = payload.map((x) => ({ ...x, serie }));
  payload = payload.concat(toTagoFormat(Decode(port, buffer), serie));
}
// console.log(payload);
