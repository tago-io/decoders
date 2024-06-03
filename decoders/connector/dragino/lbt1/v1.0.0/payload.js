/*
* LBT1
* mode 1,2 and 3 - payload type
*/
function Decoder(bytes) {
	// Decode an uplink message from a buffer
	// (array) of bytes to an object of fields.
	let value = bytes[0] << 8 | bytes[1];
	const batV = value/1000;// Battery,units:V

	const mode = bytes[5];

	// var value=(bytes[3]-0x30)*1000 +(bytes[5]-0x30)*100 + (bytes[5]-0x30)*10 +(bytes[6]-0x30);
	// var value = bytes.slice(3);

	let i;
	let con;
	let str = "";
	let major = 1;
	let minor = 1;
	let rssi = 0;
	let addr = "";

	if(mode === 2 ) {
		for(i = 38 ; i<50 ; i+=1) {
			con = bytes[i].toString();
			str += String.fromCharCode(con);
		}

		addr = str;

		str = "";

		for(i = 6 ; i<38 ; i+=1) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		value = str;
	}

	if(mode === 3 ) {
		str = "";
		for(i = 18 ; i < 22 ; i+=1) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		major = parseInt(str, 16);
		
		str = "";

		for(i = 22 ; i < 26 ; i+=1) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		minor = parseInt(str, 16); 

		str = "";

		for(i = 28 ; i < 32 ; i+=1) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		rssi = parseInt(str,16);

		str = "";
		for(i = 6 ; i < 18 ; i+=1) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		value = str;
	}

	if(mode === 1) {
		for(i = 6 ; i<11 ; i+=1) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		value = str;
	}

	const uuid = value;
	const alarm = bytes[2] >> 4 & 0x0F;
	const step_count = (bytes[2] & 0x0F) << 16 | bytes[3] << 8 | bytes[4];

	return [
		{variable:"uuid",value:uuid},
		{variable:"addr",value:addr},
		{variable:"major",value:major},
		{variable:"minor",value:minor},
		{variable:"rssi",value:rssi},
		{variable:"step",value:step_count},
		{variable:"alarm",value:alarm},
		{variable:"batv",value:batV,unit:"v"}
	];
}

const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    const payload_aux = Decoder(buffer);
    payload = payload.concat(payload_aux.map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}