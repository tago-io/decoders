function transform(payload, group) {
  const decoded = [];
  const variables = [];
  const location = payload.find((x) => x.variable === "location");
  if (location) {
    decoded.push({ variable: "location", value: location.value, location: location.location, group });
    variables.push("location");
  }
  const fuel_level = payload.find((x) => x.variable === "fuel_level");
  if (fuel_level) {
    decoded.push({ variable: "fuel_level", value: fuel_level.value, unit: fuel_level.unit, group });
    variables.push("fuel_level");
  }
  const speed = payload.find((x) => x.variable === "speed");
  if (speed) {
    decoded.push({ variable: "speed", value: Number(speed.value.toFixed(2)), speed: speed.unit, group });
    variables.push("speed");
  }
  const trip_odometer = payload.find((x) => x.variable === "trip_odometer");
  if (trip_odometer) {
    decoded.push({ variable: "trip_odometer", value: Number(trip_odometer.value.toFixed(2)), group });
    variables.push("trip_odometer");
  }

  if (decoded.length !== payload.length) {
    payload.forEach((x) => {
      if (!variables.includes(x.variable)) {
        decoded.push(x);
      }
    });
  }

  return decoded;
}

if (payload.length === 14) {
  const bus_id = device.params.find((x) => x.key === "bus_id");
  if (bus_id === undefined || Number(bus_id.value) === 1) {
    payload = payload.filter((x) => x.metadata.type === 1 && delete x.metadata);
  } else if (Number(bus_id.value) === 2) {
    payload = payload.filter((x) => x.metadata.type === 2 && delete x.metadata);
  }
}

const speed_type = device.params.find((x) => x.key === "speed_type");

if (speed_type && speed_type.value === "km") {
  const speed = payload.find((x) => x.variable === "speed");
  if (speed) {
    payload = payload.filter((x) => x.variable !== "speed");

    payload.push({ variable: "speed", value: speed.value / 1.609344, unit: "km" });
  }
}

const group = new Date().getTime().toString();
payload = transform(payload, group);
