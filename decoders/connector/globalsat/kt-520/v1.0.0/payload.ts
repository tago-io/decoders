/* eslint-disable unicorn/number-literal-case */
/* eslint-disable unicorn/numeric-separators-style */
// eslint-disable-next-line unicorn/prefer-set-has
function hexToBinary(hex) {
  let binary = "";
  for (let i = 0; i < hex.length; i++) {
    binary += parseInt(hex[i], 16).toString(2).padStart(4, "0");
  }
  return binary;
}

function calculateNewLongitude(originalLongitude: number, metersToAdd: number, latitude: number) {
  const latitudeInRadians = (latitude * Math.PI) / 180;
  const changeInLongitude = metersToAdd / (111320 * Math.cos(latitudeInRadians));
  const newLongitude = originalLongitude + changeInLongitude;
  return newLongitude;
}

function calculateNewLatitude(originalLatitude: number, metersToAdd: number) {
  const changeInLatitude = metersToAdd / 111132;
  const newLatitude = originalLatitude + changeInLatitude;
  return newLatitude;
}

function kt520decoder(bytes) {
  const decoded: any = [];
  const binaryPayload = hexToBinary(bytes);
  const time_period = binaryPayload.slice(0, 2) === "10" ? 30 : 60;
  decoded.push({ variable: "period_between_gps_acq", value: time_period, unit: "minutes" }); // time period between GPS acquisitions
  // modify the time to be the hours and minutes of the first GPS acquisition
  const hours = parseInt(binaryPayload.slice(2, 7), 2);
  const minutes = parseInt(binaryPayload.slice(7, 13), 2);

  const aux = Date.now();
  const date = new Date(aux);
  date.setHours(hours);
  date.setMinutes(minutes);
  let time = date.getTime();
  decoded[0].time = time;

  const fistlng = parseInt(binaryPayload.slice(14, 35), 2);
  const fistlat = parseInt(binaryPayload.slice(36, 56), 2);

  const lng1sign = binaryPayload.slice(13, 14) === "0" ? 1 : -1;
  const lat1sign = binaryPayload.slice(35, 36) === "0" ? 1 : -1;

  const lng1 = fistlng * lng1sign * 0.0001;
  const lat1 = fistlat * lat1sign * 0.0001;

  decoded.push({
    variable: "location",
    value: `${lat1.toFixed(4)},${lng1.toFixed(4)}`,
    location: { lat: Number(lat1.toFixed(4)), lng: Number(lng1.toFixed(4)) },
    time,
    group: String(time),
  });

  const lng2Sign = binaryPayload.slice(56, 57) === "0" ? -1 : 1;
  const lat2Sign = binaryPayload.slice(71, 72) === "0" ? -1 : 1;
  let lng2 = parseInt(binaryPayload.slice(57, 71), 2);
  let lat2 = parseInt(binaryPayload.slice(72, 86), 2);

  lng2 = lng2Sign * lng2 * 10;
  lat2 = lat2Sign * lat2 * 10;

  const lng2Final = calculateNewLongitude(Number(lng1), lng2, Number(lat1));
  const lat2Final = calculateNewLatitude(Number(lat1), lat2);

  // add time_period, which is in minutes, to the time of the first GPS acquisition
  time += time_period * 60 * 1000;

  decoded.push({
    variable: "location",
    value: `${lat2Final.toFixed(4)},${lng2Final.toFixed(4)}`,
    location: { lat: Number(lat2Final.toFixed(4)), lng: Number(lng2Final.toFixed(4)) },
    time,
    group: String(time),
  });

  const lng3Sign = binaryPayload.slice(86, 87) === "0" ? -1 : 1;
  const lat3Sign = binaryPayload.slice(102, 103) === "0" ? -1 : 1;
  let lng3 = parseInt(binaryPayload.slice(87, 102), 2);
  let lat3 = parseInt(binaryPayload.slice(103, 118), 2);

  lng3 = lng3Sign * lng3 * 10;
  lat3 = lat3Sign * lat3 * 10;

  const lng3Final = calculateNewLongitude(Number(lng1), lng3, Number(lat1));
  const lat3Final = calculateNewLatitude(Number(lat1), lat3);

  // add time_period, which is in minutes, to the time of the first GPS acquisition
  time += time_period * 60 * 1000;

  decoded.push({
    variable: "location",
    value: `${lat3Final.toFixed(4)},${lng3Final.toFixed(4)}`,
    location: { lat: Number(lat3Final.toFixed(4)), lng: Number(lng3Final.toFixed(4)) },
    time,
    group: String(time),
  });

  const lng4Sign = binaryPayload.slice(118, 119) === "0" ? -1 : 1;
  const lat4Sign = binaryPayload.slice(135, 136) === "0" ? -1 : 1;
  let lng4 = parseInt(binaryPayload.slice(120, 135), 2);
  let lat4 = parseInt(binaryPayload.slice(136, 152), 2);

  lng4 = lng4Sign * lng4 * 10;
  lat4 = lat4Sign * lat4 * 10;

  const lng4Final = calculateNewLongitude(Number(lng1), lng4, Number(lat1));
  const lat4Final = calculateNewLatitude(Number(lat1), lat4);

  // add time_period, which is in minutes, to the time of the third GPS acquisition
  time += time_period * 60 * 1000;

  decoded.push({
    variable: "location",
    value: `${lat4Final.toFixed(4)},${lng4Final.toFixed(4)}`,
    location: { lat: Number(lat4Final.toFixed(4)), lng: Number(lng4Final.toFixed(4)) },
    time,
    group: String(time),
  });
  return decoded;
}

const kt520PayloadData = payload.find((x) => x.variable === "sensors_raw_data");

if (kt520PayloadData) {
  try {
    const decodedkt520Payload = kt520decoder(kt520PayloadData.value);
    payload = decodedkt520Payload.map((x) => ({ ...x }));
  } catch (error: any) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
