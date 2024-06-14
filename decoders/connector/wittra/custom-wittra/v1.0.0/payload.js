/**
 * Parses the payload and returns an array of data objects.
 *
 * @param {Object} payload - The payload object containing the data to be parsed.
 * @param {string} group - The group identifier for the data.
 * @param {string} receivedTime - The time the payload was received.
 * @returns {Array} An array of data objects extracted from the payload.
 */
function parseWittraPayload(payload, group, receivedTime) {
  let data = [];
  const time = receivedTime || new Date().toISOString();

  // Helper function to add data to the array
  function addData(variable, value, unit, metadata, location) {
    data.push({ variable, value, unit, group, time, metadata, location });
  }

  // Iterate through the payload keys
  for (const key of Object.keys(payload)) {
    const value = payload[key];

    if (typeof value === "object" && !Array.isArray(value)) {
      // Handle nested objects
      for (const subKey of Object.keys(value)) {
        const subValue = value[subKey];
        addData(`${key}_${subKey}`, subValue, undefined, undefined);
      }
    } else if (Array.isArray(value)) {
      // Handle arrays by putting information in the metadata
      value.forEach((item, index) => {
        addData(`${key}_${index}`, null, undefined, item);
      });
    } else {
      // Handle simple key-value pairs
      addData(key, value, undefined, undefined);
    }
  }

  // Handle location separately
  if (payload.location) {
    const { latitude, longitude, ...locationMetadata } = payload.location;
    if (latitude && longitude) {
      data = data.filter((x) => !x.variable.includes("latitude") && !x.variable.includes("longitude"));
      addData("location", `${latitude},${longitude}`, undefined, { lat: latitude, lng: longitude, ...locationMetadata }, { lat: latitude, lng: longitude });
    }
  }

  return data;
}

// Handle Received Data
const wittraPayload = payload.find((x) => x.variable === "wittra_payload");
if (wittraPayload) {
  const contentJSON = JSON.parse(wittraPayload.value);
  const parsedData = parseWittraPayload(contentJSON.payload, wittraPayload.group, contentJSON.timestamp);
  payload = parsedData;
}
