const data = payload.find((x) => x.variable === "payload");

if (data) {
  payload = JSON.parse(data.value);
}
