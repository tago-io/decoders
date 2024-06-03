/* eslint-disable prettier/prettier */
/* eslint-disable no-bitwise */
/*
 * LSE01 
 * Payload total 11 bytes
 * value -> BAT (unit V) - Size(bytes) = 2
 * Temperature(RESERVED) - Size(bytes) = 2
 * Soil Moisture - Size(bytes) = 2 
 * Soil Temperature  - Size(bytes) = 2 
 * Soil Conductivity  - Size(bytes) = 1 
 * Digital Interrupt- Size(bytes) = 1
 */
function Decoder(bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  let value=(bytes[0]<<8 | bytes[1]) & 0x3FFF;
  const batV=value/1000;

  value=bytes[2]<<8 | bytes[3];
  if(bytes[2] & 0x80)
  {value |= 0xFFFF0000;}
   const tempc_ds18b20=(value/10).toFixed(2);
   
   value=bytes[4]<<8 | bytes[5];
   const water_soil=(value/100).toFixed(2);
   
   value=bytes[6]<<8 | bytes[7];
   let temp_soil;

   if((value & 0x8000)>>15 === 0)
   temp_soil=(value/100).toFixed(2);
   else if((value & 0x8000)>>15 === 1)
   temp_soil=((value-0xFFFF)/100).toFixed(2);
   
   value=bytes[8]<<8 | bytes[9];
   const conduct_soil=(value);
   return [
    {variable:"bat",value:batV,unit: "v"},
    {variable:"tempc_ds18b20",value:tempc_ds18b20,unit:"°c"},
    {variable:"soil_moisture",value:water_soil,unit:"%"},
    {variable:"temp_soil",value:temp_soil,unit:"°c"},
    {variable:"conduct_soil",value:conduct_soil,unit:"us/cm"},
  ];
}

const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data" || x.variable === "frm_payload");

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