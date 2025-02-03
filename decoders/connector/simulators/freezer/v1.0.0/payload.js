function transform(data, temp_type = false) {
  const decoded = [];
  const variables = [];
  const temperature = data.find((x) => x.variable.match(/temperature_[0-9]$/));
  if (temperature) {
    if (temp_type) {
      temperature.value = (temperature.value - 32) * (5 / 9);
      temperature.unit = "°C";
    } else {
      temperature.unit = "°F";
    }
    decoded.push({ variable: "temperature", value: Number(temperature.value.toFixed(2)), unit: temperature.unit });
    variables.push("temperature");
  }
  const door = data.find((x) => x.variable.match(/door_[0-9]$/));
  if (door) {
    decoded.push({ variable: "door", value: door.value });
    variables.push("door");
  }
  const compressor = data.find((x) => x.variable.match(/compressor_[0-9]$/));
  if (compressor) {
    decoded.push({ variable: "compressor", value: compressor.value });
    variables.push("compressor");
  }

  if (decoded.length !== data.length) {
    data.forEach((x) => {
      if (!variables.includes(x.variable)) {
        decoded.push(x);
      }
    });
  }

  return decoded;
}

if (payload.length === 7) {
  const freezer = device.params.find((x) => x.key === "freezer");
  if (freezer === undefined || Number(freezer.value) === 1) {
    payload = payload.filter((x) => x.variable.match(/.*\_1$/));
  } else if (Number(freezer.value) === 2) {
    payload = payload.filter((x) => x.variable.match(/.*\_2$/));
  }
}

const temp_type = device.params.find((x) => x.key === "temp_type");
const serie = new Date().getTime().toString();

if (temp_type && temp_type.value === "C") {
  payload = transform(payload, true).map((x) => ({ ...x, serie }));
} else {
  payload = transform(payload).map((x) => ({ ...x, serie }));
}
