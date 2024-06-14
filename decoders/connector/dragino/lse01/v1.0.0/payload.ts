/*
LSE01
- Uplink payload includes in total 11 bytes.
- Uplink Payload Test Values = 0B45 0000 05DC 0105 00C8 
- What each value represents = <battery = 2885> <Reserved Space For Temp = 0> <Soil Moisture = 1500> <Soil Temperature = 0261> <Soil Conductivity = 200>
*/

function lse01decoder(payload: typeof Buffer) {
  if (payload.length != 10) {
    throw new Error("INCORRECT_HEXADECIMAL_PAYLOAD_LENGTH");
  }
  const batV = payload.readInt16BE(0);
  const temp = payload.readInt16BE(2);
  const soilMoisture = payload.readInt16BE(4) / 100;
  const soilTemperature = payload.readInt16BE(6) / 100;
  const soilConductivity = payload.readInt16BE(8);

  return [
    { variable: "battery", value: batV, unit: "mV" },
    { variable: "temperature", value: temp, unit: "°C" },
    { variable: "soil_moisture", value: soilMoisture, unit: "%" },
    { variable: "soil_temperature", value: soilTemperature, unit: "°C" },
    { variable: "soil_conductivity", value: soilConductivity, unit: "uS/cm" },
  ];
}

const lse01PayloadData = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (lse01PayloadData) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(lse01PayloadData?.value, "hex");
    const decodedPayload = lse01decoder(buffer);
    const time = Date.now();
    payload = decodedPayload.concat(decodedPayload.map((x) => ({ ...x, time: time })));
  } catch (error: any) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
