function parse(body) {
  const group = String(Date.now());
  return Object.keys(body).map((item) => {
    return {
      variable: item,
      value: body[item],
      group,
    };
  });
}

const senet = payload.find(x => x.variable === "senet_payload");
if (senet) {
  const jsonFormat = JSON.parse(senet.value);
  payload = parse(jsonFormat);
}

const tpu = payload.find(data => data.variable === "tpu");
if (tpu) {
  payload.push({ variable: "payload", value: tpu.value, group: tpu.group || tpu.serie, time: tpu.time });
  payload = payload.filter(data => data.variable !== "tpu");
}

const pdu = payload.find(data => data.variable === "pdu");
if (pdu) {
  payload.push({ variable: "payload", value: pdu.value, group: pdu.group || pdu.serie, time: pdu.time });
  payload = payload.filter(data => data.variable !== "pdu");
}