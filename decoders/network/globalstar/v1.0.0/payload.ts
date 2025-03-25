import { DataToSend } from "@tago-io/sdk/lib/types";

declare let payload: DataToSend[];

/**
 * @description Decodes the SenML payload
 * @param {SenML[]} senMLObj - SenML object
 */
function decoder(senMLObj: any[]) {
  // * to be implemented
}

// Handle Received Data
const kpnPayload = payload.find((x) => x.variable === "globalstar_payload");

if (kpnPayload) {
  try {
    const contentJSON = JSON.parse(kpnPayload.value as string);
    const parsedData = decoder(contentJSON);
    // payload = parsedData;
  } catch (error) {
    // Print the error to the Live Inspector.
    // console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
