/**
 * EC312-LoRaWAN - connector for TagoIO.
 *
 * The EC312-LoRaWAN delivers uplinks through the LoRaWAN ChirpStack
 * network integration, which runs BEFORE this connector and has already
 * converted the uplink into TagoIO variables.
 *
 * This connector normalizes the raw LoRaWAN frame payload to hexadecimal
 * (adding a `payload_hex` variable) and passes all other variables through
 * unchanged. Replace the decoding section below with device-specific byte
 * parsing when integrating a particular InHand LoRaWAN end-device.
 */

/** Convert a base64 string to hex; returns the input unchanged if not base64. */
function base64ToHex(str: string): string {
  const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  const hexRegex = /^([0-9A-Fa-f]{2})+$/;
  if (base64regex.test(str) && !hexRegex.test(str)) {
    return Buffer.from(str, "base64").toString("hex");
  }
  return str;
}

// The raw frame payload as delivered by the network parser ("data" or "payload").
const raw: any = (payload as any[]).find((x: any) => x.variable === "data" || x.variable === "payload");

if (raw && typeof raw.value === "string") {
  const hex = base64ToHex(raw.value);
  (payload as any[]).push({ variable: "payload_hex", value: hex, group: raw.group });
}

// Return the payload for the test harness / platform.
payload;
