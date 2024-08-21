import { Data, DataToSend } from "@tago-io/sdk/lib/types";

declare let payload: DataToSend[];

function calculateLatitude(lat: number): number {
  const degreePerCountLat = 90.0 / Math.pow(2, 23);
  let latitude = lat * degreePerCountLat;

  if (latitude > 90) {
    latitude = 180 - latitude;
  }

  return latitude;
}

function calculateLongitude(long: number): number {
  const degreePerCountLong = 180.0 / Math.pow(2, 23);
  let longitude = long * degreePerCountLong;

  if (longitude > 180) {
    longitude = longitude - 360;
  }

  return longitude;
}

interface DecodedData extends Pick<Data, "variable" | "value" | "time" | "unit" | "group" | "location"> {}

function ParsePayload(payload: string, group: string | undefined, receivedTime: Date | string | undefined): DecodedData[] {
  const buffer = Buffer.from(payload, "hex");
  // const buffer = payload as unknown as Buffer;

  if (buffer.length < 2) {
    throw new Error("Invalid payload size");
  }

  const data: DecodedData[] = [];
  const checkTime = receivedTime || new Date().toISOString();
  const time = new Date(checkTime);

  const batteryState = (buffer.readUInt8(0) & 0x04) >> 2;
  const gpsDataValid = (buffer.readUInt8(0) & 0x08) >> 3;
  const missedInput1 = (buffer.readUInt8(0) & 0x10) >> 4;
  const missedInput2 = (buffer.readUInt8(0) & 0x20) >> 5;
  const gpsFailCounter = (buffer.readUInt8(0) & 0xc0) >> 6;

  const latitude = calculateLatitude(buffer.readIntBE(1, 3));
  const longitude = calculateLongitude(buffer.readIntBE(4, 3));

  data.push({ variable: "battery_state", value: batteryState ? "Replace" : "Good", group, time });
  data.push({ variable: "gps_data_valid", value: gpsDataValid ? "Invalid" : "Valid", group, time });
  data.push({ variable: "missed_input_1", value: missedInput1, group, time });
  data.push({ variable: "missed_input_2", value: missedInput2, group, time });
  data.push({ variable: "gps_fail_counter", value: gpsFailCounter, group, time });
  data.push({ variable: "location", value: `${latitude},${longitude}`, location: { type: "Point", coordinates: [longitude, latitude] }, group, time });

  const messageSubtype = (buffer.readUInt8(7) & 0xf0) >> 4;

  switch (messageSubtype) {
    case 0:
      data.push({ variable: "message_type", value: "Location Message", group, time });
      break;
    case 1:
      data.push({ variable: "message_type", value: "Device Turned On Message", group, time });
      break;
    case 2:
      data.push({ variable: "message_type", value: "Change of Location Area Alert Message", group, time });
      break;
    case 3:
      data.push({ variable: "message_type", value: "Input Status Changed Message", group, time });
      break;
    case 4:
      data.push({ variable: "message_type", value: "Undesired Input State Message", group, time });
      break;
    case 5:
      data.push({ variable: "message_type", value: "Re-Center Message", group, time });
      break;
    default:
      data.push({ variable: "message_type", value: "Unknown", group, time });
      break;
  }

  return data;
}

// Handle Received Data
const payload_raw = payload.find((x) => ["payload_raw", "payload", "data", "globalstar_payload"].includes(x.variable));

if (payload_raw) {
  try {
    const parsedData = ParsePayload(payload_raw.value as string, payload_raw.group, payload_raw.time);
    payload = payload.concat(parsedData);
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
