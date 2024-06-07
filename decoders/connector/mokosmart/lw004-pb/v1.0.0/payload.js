/*
* LW004-PB
*/
function signed_convert(val, bitwidth) {
	const isnegative = val & (1 << (bitwidth - 1));
	const boundary = (1 << bitwidth);
	const minval = -boundary;
	const mask = boundary - 1;
	return isnegative ? minval + (val & mask) : val;
}
function Decoder(bytes,beacon_decoder_aux) {
	// Decode an uplink message from a buffer
	// (array) of bytes to an object of fields.
	const battery_level = bytes[0];
	const alarm_status = bytes[1];
	let lat = bytes[5]<<24 | bytes [4]<<16 | bytes[3]<<8 | bytes[2];
	lat = signed_convert(lat,32);
	lat = lat*90/8388607;
	let lng = bytes[9]<<24 | bytes [8]<<16 | bytes[7]<<8 | bytes[6];
	lng = signed_convert(lng,32);
	lng = lng*180/8388607;

	// bytes.lenght === 25 only one beacon send, no need to split and put metadata
	if(bytes.length === 25){
		const first_mac_beacon_addr = bytes[10]<<40 | bytes[11]<<32 | bytes[12]<<24 | bytes[13]<<16 | bytes[14]<<8 | bytes[15];
		const first_mac_beacon_rssi = (bytes[16]) - 256;
		const X_axis_acceleration = (bytes[17]<<8 | bytes[18])*2/32768;
		const y_axis_acceleration = (bytes[19]<<8 | bytes[20])*2/32768;
		const z_axis_acceleration = (bytes[21]<<8 | bytes[22])*2/32768;
		const angular = bytes[23]<<8 | bytes[24];
		return [
			{variable:"battery_level",value:battery_level,unit:"%"}, 
			{variable:"alarm_status",value:alarm_status},
			{variable: "gps_location", location: {lat,lng}, value: `${lat},${lng}`},
			{variable:first_mac_beacon_addr,value:first_mac_beacon_rssi},
			{variable:"X_axis_acceleration",value:X_axis_acceleration,unit:"g"},
			{variable:"y_axis_acceleration",value:y_axis_acceleration,unit:"g"},
			{variable:"z_axis_acceleration",value:z_axis_acceleration,unit:"g"},
			{variable:"angular",value:angular, unit:"degree"},
		]
	}
	// bytes.lenght === 32 two beacon send, need to split and put metadata
	if(bytes.length === 32){
		const first_mac_beacon_addr = bytes[10]<<40 | bytes[11]<<32 | bytes[12]<<24 | bytes[13]<<16 | bytes[14]<<8 | bytes[15];
		const first_mac_beacon_rssi = (bytes[16]) - 256;
		const second_mac_beacon_addr = bytes[17]<<40 | bytes[18]<<32 | bytes[19]<<24 | bytes[20]<<16 | bytes[21]<<8 | bytes[22];
		const second_mac_beacon_rssi = (bytes[23]) - 256;
		const X_axis_acceleration = (bytes[24]<<8 | bytes[25])*2/32768;
		const y_axis_acceleration = (bytes[26]<<8 | bytes[27])*2/32768;
		const z_axis_acceleration = (bytes[28]<<8 | bytes[29])*2/32768;
		const angular = bytes[30]<<8 | bytes[31];
		if(beacon_decoder_aux === "simple"){
		let string_value = "";
		string_value= string_value.concat(first_mac_beacon_addr,":" ,first_mac_beacon_rssi,";",second_mac_beacon_addr,":",second_mac_beacon_rssi);
			return [
				{variable:"battery_level",value:battery_level,unit:"%"},
				{variable:"alarm_status",value:alarm_status},
				{variable: "gps_location", location: {lat,lng}, value: `${lat},${lng}`},
				{
					variable: "beacons",
					value: string_value,
					metadata: {
						[first_mac_beacon_addr]: first_mac_beacon_rssi,
						[second_mac_beacon_addr]: second_mac_beacon_rssi,
					}
				},
				{variable:"X_axis_acceleration",value:X_axis_acceleration,unit:"g"},
				{variable:"y_axis_acceleration",value:y_axis_acceleration,unit:"g"},
				{variable:"z_axis_acceleration",value:z_axis_acceleration,unit:"g"},
				{variable:"angular",value:angular, unit:"degree"},
			]
		}
		if(beacon_decoder_aux === "splitted"){
			return [
				{variable:"battery_level",value:battery_level,unit:"%"},
				{variable:"alarm_status",value:alarm_status},
				{variable: "gps_location", location: {lat,lng}, value: `${lat},${lng}`},
				{variable:first_mac_beacon_addr,value:first_mac_beacon_rssi},
				{variable:second_mac_beacon_addr,value:second_mac_beacon_rssi},
				{variable:"X_axis_acceleration",value:X_axis_acceleration,unit:"g"},
				{variable:"y_axis_acceleration",value:y_axis_acceleration,unit:"g"},
				{variable:"z_axis_acceleration",value:z_axis_acceleration,unit:"g"},
				{variable:"angular",value:angular, unit:"degree"},
			]
		}
	}
	// bytes.lenght === 39 three beacon send, need to split and put metadata
	if(bytes.length === 39){
		const first_mac_beacon_addr = bytes[10]<<40 | bytes[11]<<32 | bytes[12]<<24 | bytes[13]<<16 | bytes[14]<<8 | bytes[15];
		const first_mac_beacon_rssi = (bytes[16]) - 256;
		const second_mac_beacon_addr = bytes[17]<<40 | bytes[18]<<32 | bytes[19]<<24 | bytes[20]<<16 | bytes[21]<<8 | bytes[22];
		const second_mac_beacon_rssi = (bytes[23]) - 256;
		const third_mac_beacon_addr = bytes[24]<<40 | bytes[25]<<32 | bytes[26]<<24 | bytes[27]<<16 | bytes[28]<<8 | bytes[29];
		const third_mac_beacon_rssi = (bytes[30]) - 256;
		const X_axis_acceleration = (bytes[31]<<8 | bytes[32])*2/32768;
		const y_axis_acceleration = (bytes[33]<<8 | bytes[34])*2/32768;
		const z_axis_acceleration = (bytes[35]<<8 | bytes[36])*2/32768;
		const angular = bytes[37]<<8 | bytes[38];
		if(beacon_decoder_aux === "simple"){
		let string_value = "";
		string_value= string_value.concat(first_mac_beacon_addr,":" ,first_mac_beacon_rssi,";",second_mac_beacon_addr,":",second_mac_beacon_rssi,";",third_mac_beacon_addr,":",third_mac_beacon_rssi);
			return [
				{variable:"battery_level",value:battery_level,unit:"%"},
				{variable:"alarm_status",value:alarm_status},
				{variable: "gps_location", location: {lat,lng}, value:`${lat},${lng}`},
				{
					variable: "beacons",
					value: string_value,
					metadata: {
						[first_mac_beacon_addr]: first_mac_beacon_rssi,
						[second_mac_beacon_addr]: second_mac_beacon_rssi,
						[third_mac_beacon_addr]: third_mac_beacon_rssi,
					}
				},
				{variable:"X_axis_acceleration",value:X_axis_acceleration,unit:"g"},
				{variable:"y_axis_acceleration",value:y_axis_acceleration,unit:"g"},
				{variable:"z_axis_acceleration",value:z_axis_acceleration,unit:"g"},
				{variable:"angular",value:angular, unit:"degree"},
			]
		}
		if(beacon_decoder_aux === "splitted"){
			return [
				{variable:"battery_level",value:battery_level,unit:"%"},
				{variable:"alarm_status",value:alarm_status},
				{variable: "gps_location", location: {lat,lng}, value: `${lat},${lng}`},
				{variable:first_mac_beacon_addr,value:first_mac_beacon_rssi},
				{variable:second_mac_beacon_addr,value:second_mac_beacon_rssi},
				{variable:third_mac_beacon_addr,value:third_mac_beacon_rssi},
				{variable:"X_axis_acceleration",value:X_axis_acceleration,unit:"g"},
				{variable:"y_axis_acceleration",value:y_axis_acceleration,unit:"g"},
				{variable:"z_axis_acceleration",value:z_axis_acceleration,unit:"g"},
				{variable:"angular",value:angular, unit:"degree"},
			]
		}
	}
	// bytes.lenght === 46 four beacon send, need to split and put metadata
	if(bytes.length === 46){
		const first_mac_beacon_addr = bytes[10]<<40 | bytes[11]<<32 | bytes[12]<<24 | bytes[13]<<16 | bytes[14]<<8 | bytes[15];
		const first_mac_beacon_rssi = (bytes[16]) - 256;
		const second_mac_beacon_addr = bytes[17]<<40 | bytes[18]<<32 | bytes[19]<<24 | bytes[20]<<16 | bytes[21]<<8 | bytes[22];
		const second_mac_beacon_rssi = (bytes[23]) - 256;
		const third_mac_beacon_addr = bytes[24]<<40 | bytes[25]<<32 | bytes[26]<<24 | bytes[27]<<16 | bytes[28]<<8 | bytes[29];
		const third_mac_beacon_rssi = (bytes[30]) - 256;
		const fourth_mac_beacon_addr = bytes[31]<<40 | bytes[32]<<32 | bytes[33]<<24 | bytes[34]<<16 | bytes[35]<<8 | bytes[36];
		const fourth_mac_beacon_rssi = (bytes[37]) - 256;
		const X_axis_acceleration = (bytes[38]<<8 | bytes[39])*2/32768;
		const y_axis_acceleration = (bytes[40]<<8 | bytes[41])*2/32768;
		const z_axis_acceleration = (bytes[42]<<8 | bytes[43])*2/32768;
		const angular = bytes[44]<<8 | bytes[45];
		if(beacon_decoder_aux === "simple"){
		let string_value = "";
		string_value= string_value.concat(first_mac_beacon_addr,":" ,first_mac_beacon_rssi,";",second_mac_beacon_addr,":",second_mac_beacon_rssi,";",third_mac_beacon_addr,":",third_mac_beacon_rssi,";",fourth_mac_beacon_addr,":",fourth_mac_beacon_rssi);
			return [
				{variable:"battery_level",value:battery_level,unit:"%"},
				{variable:"alarm_status",value:alarm_status},
				{variable: "gps_location", location: {lat,lng}, value: `${lat},${lng}`},
				{
					variable: "beacons",
					value: string_value,
					metadata: {
						[first_mac_beacon_addr]: first_mac_beacon_rssi,
						[second_mac_beacon_addr]: second_mac_beacon_rssi,
						[third_mac_beacon_addr]: third_mac_beacon_rssi,
						[fourth_mac_beacon_addr]: fourth_mac_beacon_rssi,
					}
				},
				{variable:"X_axis_acceleration",value:X_axis_acceleration,unit:"g"},
				{variable:"y_axis_acceleration",value:y_axis_acceleration,unit:"g"},
				{variable:"z_axis_acceleration",value:z_axis_acceleration,unit:"g"},
				{variable:"angular",value:angular, unit:"degree"},
			]
		}
		if(beacon_decoder_aux === "splitted"){
			return [
				{variable:"battery_level",value:battery_level,unit:"%"},
				{variable:"alarm_status",value:alarm_status},
				{variable: "gps_location", location: {lat,lng}, value: `${lat},${lng}`},
				{variable:first_mac_beacon_addr,value:first_mac_beacon_rssi},
				{variable:second_mac_beacon_addr,value:second_mac_beacon_rssi},
				{variable:third_mac_beacon_addr,value:third_mac_beacon_rssi},
				{variable:fourth_mac_beacon_addr,value:fourth_mac_beacon_rssi},
				{variable:"X_axis_acceleration",value:X_axis_acceleration,unit:"g"},
				{variable:"y_axis_acceleration",value:y_axis_acceleration,unit:"g"},
				{variable:"z_axis_acceleration",value:z_axis_acceleration,unit:"g"},
				{variable:"angular",value:angular, unit:"degree"},
			]
		}
	}
}

const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

 let beacon_decoder = device.params.find((x) => x.key === "beacon_decoder");
 if (beacon_decoder.value === "simple")
 {
	beacon_decoder = "simple";
 }
 else if(beacon_decoder === "splitted"){
	beacon_decoder = "splitted";
 }

if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    const payload_aux = Decoder(buffer,beacon_decoder);
    payload = payload.concat(payload_aux.map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
