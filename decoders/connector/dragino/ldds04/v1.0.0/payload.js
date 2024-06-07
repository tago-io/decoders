/*
 * LDDS04
 * Payload total 11 bytes
 * value -> BAT&InterruptorFlag (unit V) - Size(bytes) = 2
 * Distance sensor 1 - Size(bytes) = 2
 * Distance sensor 2 - Size(bytes) = 2
 * Distance sensor 3 - Size(bytes) = 2
 * Distance sensor 4 - Size(bytes) = 2
 * Message Type- Size(bytes) = 1
 */
function Decoder(bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  let value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
  const batV = value / 1000;
  const exti_trigger = bytes[0] & 0x80 ? "TRUE" : "FALSE";

  value = (bytes[2] << 8) | bytes[3];
  const distance_cm1 = value / 10;

  value = (bytes[4] << 8) | bytes[5];
  const distance_cm2 = value / 10;

  value = (bytes[6] << 8) | bytes[7];
  const distance_cm3 = value / 10;

  value = (bytes[8] << 8) | bytes[9];
  const distance_cm4 = value / 10;

  const mes_type = bytes[10];

  if (bytes[0] !== 0x03 && bytes[10] !== 0x02) {
    return [
      { variable: "bat_v", value: batV, unit: "v" },
      { variable: "exti_trigger", value: exti_trigger },
      { variable: "distance1_cm", value: distance_cm1, unit: "cm" },
      { variable: "distance2_cm", value: distance_cm2, unit: "cm" },
      { variable: "distance3_cm", value: distance_cm3, unit: "cm" },
      { variable: "distance4_cm", value: distance_cm4, unit: "cm" },
      { variable: "mes_type", value: mes_type },
    ];
  }
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
