// @ts-nocheck
// Payload parser for Busylight Uplink, Release 0.9

// Search the payload variable in the payload global variable. It's contents is always [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");

    // Lets say you have a payload of 5 bytes.
    // 0 - Protocol Version
    // 1,2 - Temperature
    // 3,4 - Humidity
    // More information about buffers can be found here: https://nodejs.org/api/buffer.html
    //    payload= [
    payload.push(
      { variable: "RSSI", value: byteArrayToLong(buffer, 0), unit: "" },
      { variable: "SNR", value: byteArrayToLong(buffer, 4), unit: "" },
      { variable: "messages_received", value: byteArrayToLong(buffer, 8), unit: "" },
      { variable: "messages_send", value: byteArrayToLong(buffer, 12), unit: "" },
      { variable: "lastcolor_red", value: buffer[16], unit: "" },
      { variable: "lastcolor_blue", value: buffer[17], unit: "" },
      { variable: "lastcolor_green", value: buffer[18], unit: "" },
      { variable: "lastcolor_ontime", value: buffer[19], unit: "" },
      { variable: "lastcolor_offtime", value: buffer[20], unit: "" },
      { variable: "sw_rev", value: buffer[21], unit: "" },
      { variable: "hw_rev", value: buffer[22], unit: "" },
      { variable: "adr_state", value: buffer[23], unit: "" }
    );
    //  ];

    // This will concat the content sent by your device with the content generated in this payload parser.
    // It also add the field "group" and "time" to it, copying from your sensor data.
    //    payload = payload.concat(
    //      data.map((x) => ({
    //      }))
    //    );
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);

    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}

function byteArrayToLong(byteArray, from) {
  return byteArray[from] | (byteArray[from + 1] << 8) | (byteArray[from + 2] << 16) | (byteArray[from + 3] << 24);
}
