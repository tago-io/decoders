/**
 * IE Tecnologia SM-WU — Decoder para medidor ultrassônico de nível e volume
 */

const VARIABLE_MAP = {
  id: { variable: "device_id", unit: "" },
  d: { variable: "distance", unit: "cm" },
  nivel: { variable: "level", unit: "cm" },
  volume: { variable: "volume", unit: "L" },
  rssi_wifi: { variable: "rssi_wifi", unit: "dBm" },
};

const STRING_TAGS = new Set(["id"]);

function findPayload(payload) {
  if (!Array.isArray(payload)) {
    return null;
  }

  if (payload.length === 1 && payload[0] && !payload[0].variable && payload[0].nivel !== undefined) {
    return payload[0];
  }

  const candidates = ["payload", "data", "payload_raw"];
  for (const name of candidates) {
    const item = payload.find((x) => x.variable === name);
    if (item && typeof item.value === "string") {
      try {
        const parsed = JSON.parse(item.value);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
    }
  }

  for (const item of payload) {
    if (item && typeof item.value === "string" && item.value.startsWith("{")) {
      try {
        const parsed = JSON.parse(item.value);
        if (parsed && typeof parsed === "object" && parsed.nivel !== undefined) {
          return parsed;
        }
      } catch {}
    }
  }

  return null;
}

const sm_wu_data = findPayload(payload);

if (sm_wu_data) {
  const group = String(Date.now());
  const result = [];

  for (const [tag, raw_value] of Object.entries(sm_wu_data)) {
    const mapping = VARIABLE_MAP[tag];
    if (!mapping) {
      continue;
    }

    if (STRING_TAGS.has(tag)) {
      result.push({
        variable: mapping.variable,
        value: String(raw_value),
        ...(mapping.unit ? { unit: mapping.unit } : {}),
        group,
      });
    } else {
      const num = Number(raw_value);
      if (Number.isNaN(num)) {
        continue;
      }
      result.push({
        variable: mapping.variable,
        value: num,
        ...(mapping.unit ? { unit: mapping.unit } : {}),
        group,
      });
    }
  }

  if (result.length > 0) {
    payload = result;
  }
}