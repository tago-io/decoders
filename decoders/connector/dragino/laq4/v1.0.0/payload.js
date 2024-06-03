//LAQ4 LoRaWAN Air quality Sensor

/**
 * size(bytes)  | 2       | 1          | 2    | 2   | 2           | 2
 * value        | battery | alarm flag | TVOC | CO2 | Temperature | Humidity
 */

function Decoder(bytes, port) {
  if(bytes.length===11)
  {
    var data = [];
    // Battery
    data.push({ variable: "Bat_V", value: (bytes[0]<<8 | bytes[1])/1000, unit: "V" });  //0dac -> 3500/1000 -> 3.5
    // Mode (alarm flag)
    var mode = ( bytes[2] & 0x7C ) >> 2; //04 --> 1 | 7c --> 31
    if(mode===1)
    {
      data.push({ variable: "Work_mode", value: "CO2" });
      data.push({ variable: "Alarm_status", value: (bytes[2] & 0x01)? "TRUE":"FALSE" }); // 04 -> FALSE
      // TVOC
      data.push({ variable: "TVOC_ppb", value: bytes[3]<<8 | bytes[4], unit: "ppb" }); //00fa -> 250
      // CO2
      data.push({ variable: "CO2_ppm", value: bytes[5]<<8 | bytes[6], unit: "ppm" }); //00fa -> 250
      // Temperature
      data.push({ variable: "TempC_SHT", value: parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(2)), unit: "°C" }); //ff = -256 ef = 239 --> -17 / 10 = -1.7
      // Humidity
      data.push({ variable: "Hum_SHT", value: parseFloat(((bytes[9]<<8 | bytes[10])/10).toFixed(1)), unit: "%" }); //03bb => 955/10 => 95.5
    }
    else if(mode===31)
    {
      data.push({ variable: "Work_mode", value: "ALARM" });
      // Temp minimum of alarm value
      data.push({ variable: "SHTTEMPMIN", value: bytes[3]<<24>>24, unit: "°C" });
      // Temp maximum of alarm value
      data.push({ variable: "SHTTEMPMAX", value: bytes[4]<<24>>24, unit: "°C" });
      // Hum minumum of alarm value
      data.push({ variable: "SHTHUMMIN", value: bytes[5], unit: "%" });
      // Hum maximum of alarm value
      data.push({ variable: "SHTHUMMAX", value: bytes[6], unit: "%" });
      // CO2 minimum of alarm value
      data.push({ variable: "CO2MIN", value: bytes[7] <<8 | bytes[8], unit: "ppm" });
      // CO2 maximum of alarm value
      data.push({ variable: "CO2MAX", value: bytes[9] <<8 | bytes[10], unit: "ppm" });
    }
    return data;
  } else if (bytes.length % 11 === 0) {
    var data = [];
    for(var i = 0; i < bytes.length; ) {
      //CO2
      data.push({ variable: `entry_${i/11}_CO2`, value: (bytes[i + 1] << 8 | bytes[i + 0]), unit: "ppm" });
      //Poll message flag & ext
      data.push({ variable: `entry_${i/11}_Poll_message_flag`, value: (bytes[i + 2] >> 7) });
      data.push({ variable: `entry_${i/11}_Mode`, value: (bytes[i + 2] & 0x7c) >> 2 });
      data.push({ variable: `entry_${i/11}_Alarm`, value: bytes[i + 2] & 0x01 ? "TRUE" : "FALSE" });
      //Temperature
      data.push({ variable: `entry_${i/11}_Temp`, value: parseFloat(((bytes[i + 3]<<24>>16 | bytes[i + 4])/100).toFixed(2)), unit: "°C" })
      //Humidity
      data.push({ variable: `entry_${i/11}_Hum`, value: parseFloat(((bytes[i + 5]<< 8 | bytes[i + 6])/10).toFixed(2)), unit: "%" })
      //Unix Time Stamp
      data.push({ variable: `entry_${i/11}_unix_time`, value: (bytes[i + 7] << 24 | bytes[i + 8] << 16 | bytes[i + 9] << 8 | bytes[i + 10]) * 1000 })
      i += 11;
    }
    return data;
  }
   else {
    return [{ variable: "parser_error", value: "Parser Error: payload length does not match, must have 11 bytes or it's multiples." }];
  }
}

//let payload = [{ variable: "payload", value: "0d057c001e003c000007d0" }, {variable: "port", value: 100 }];
// let payload = [{ variable: "payload", value: "0d057c001e003c000007d0" }, {variable: "port", value: 100 }];
// let payload = [{ variable: "payload", value: "900184093001806059B432A20184092C018A6059B68DE30184091F019C6059B8B8E30184092301916059B8CFAC0185091C018B6059BA98AC0184091F01AF6059BAA5AC0184091F01C66059BAAD900184092001D66059BAB7".toLowerCase() }, {variable: "port", value: 100 }];

const data = payload.find((x) => x.variable === "payload" || x.variable === "payload_raw" || x.variable === "data");
const port = payload.find((x) => x.variable === "port" || x.variable === "fport");
if(data) {
  const serie = data.serie || new Date().getTime();
  const bytes = Buffer.from(data.value, "hex");

  payload = payload.concat(Decoder(bytes, Number(port))).map((x) => ({ variable: x.variable.toLowerCase(), value: x.value, unit: x.unit, serie }));
}

// console.log(payload);