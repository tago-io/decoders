const ignore_vars = ["payload_size", "uuid", "id"];

function toTagoFormat(object_item, group, prefix = "") {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] === "object") {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        group: object_item[key].group || group,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        group,
      });
    }
  }

  return result;
}

function parseDC(data, group) {
  const result = [];

  // balance
  result.push({ variable: "dc_balance", value: data.balance, group });
  // nonce
  result.push({ variable: "dc_nonce", value: data.nonce, group });

  return result;
}

function parseHotspots(data, group) {
  const result = [];

  for (let i = 0; i < data.length; ++i) {
    // channel
    result.push({
      variable: `hotspot_${i}_channel`,
      value: data[i].channel,
      group,
    });
    // frequency
    result.push({
      variable: `hotspot_${i}_frequency`,
      value: data[i].frequency,
      group,
    });
    // id
    result.push({ variable: `hotspot_${i}_id`, value: data[i].id, group });
    // lat/long
    if (!isNaN(data[i].lat) && !isNaN(data[i].long)) {
      result.push({
        variable: `hotspot_${i}_location`,
        location: { lat: data[i].lat, lng: data[i].long },
        group,
      });
    }
    // name
    result.push({ variable: `hotspot_${i}_name`, value: data[i].name, group });
    // reported_at
    result.push({
      variable: `hotspot_${i}_reported_at`,
      value: data[i].reported_at,
      group,
    });
    // rssi
    result.push({ variable: `hotspot_${i}_rssi`, value: data[i].rssi, group });
    // snr
    result.push({ variable: `hotspot_${i}_snr`, value: data[i].snr, group });
    // spreading
    result.push({
      variable: `hotspot_${i}_spreading`,
      value: data[i].spreading,
      group,
    });
    // status
    result.push({
      variable: `hotspot_${i}_status`,
      value: data[i].status,
      group,
    });
    // hold_time
    result.push({
      variable: `hotspot_${i}_hold_time`,
      value: data[i].hold_time,
      group,
    });
  }

  return result;
}

function parseDecodedData(decoded, group) {
  if (decoded.payload) decoded = decoded.payload;

  const lat = decoded.latitude || decoded.lat;
  const lng = decoded.longitude || decoded.lng || decoded.long;
  const alt = decoded.altitude;
  if (lat && lng && lat !== 0 && lng !== 0) {
    decoded.location = {
      value: `${lat},${lng}`,
      location: { lat: Number(lat), lng: Number(lng) },
    };
    if (alt) decoded.location.metadata = { altitude: alt };
    delete decoded.latitude;
    delete decoded.longitude;
    delete decoded.lat;
    delete decoded.lng;
  }
  return toTagoFormat(decoded, group);
}

let helium_payload = payload.find((item) => item.variable === "helium_payload");

if (helium_payload) {
  let group = String(helium_payload.group || new Date().getTime()); // Get a unique group for the incoming data.

  // Parse the helium_payload to JSON format (it comes in a String format)
  helium_payload = JSON.parse(helium_payload.value);
  // group = helium_payload.id || group;

  let vars_to_tago = [];

  // metadata
  if (helium_payload.metadata) {
    vars_to_tago = vars_to_tago.concat({
      variable: "metadata",
      metadata: helium_payload.metadata,
      group,
    });
    delete helium_payload.metadata;
  }

  // base64 variables
  if (helium_payload.payload) {
    helium_payload.payload = Buffer.from(
      helium_payload.payload,
      "base64"
    ).toString("hex");
  }

  // base64 variables
  if (helium_payload.decoded) {
    vars_to_tago = vars_to_tago.concat(
      parseDecodedData(helium_payload.decoded.payload, group)
    );
    delete helium_payload.decoded;
  }

  // Parse DC
  if (helium_payload.dc) {
    vars_to_tago = vars_to_tago.concat(parseDC(helium_payload.dc, group));
    delete helium_payload.dc;
  }
  // Parse hotsposts
  if (helium_payload.hotspots) {
    vars_to_tago = vars_to_tago.concat(
      parseHotspots(helium_payload.hotspots, group)
    );
    delete helium_payload.hotspots;
  }

  vars_to_tago = vars_to_tago.concat(toTagoFormat(helium_payload, group));

  // Change the payload to the new formated variables.
  payload = vars_to_tago;
}

//console.log(payload, payload.length);
