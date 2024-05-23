const tpu = payload.find(data => data.variable === "tpu" || data.variable === "pdu" || data.variable === "PDU");

if (tpu) {
  payload.push({ variable: "payload", value: tpu.value, serie: String(tpu.serie), time: tpu.time });
  payload = payload.filter(data => data.variable !== "tpu" && data.variable !== "pdu" && data.variable !== "PDU");
}