/**
 * IE Tecnologia SM-3EA — Decoder para medidor de corrente trifásico
 */

const VARIABLE_MAP = {
  id: { variable: "device_id", unit: "" },
  ia: { variable: "current_a", unit: "mA" },
  ib: { variable: "current_b", unit: "mA" },
  ic: { variable: "current_c", unit: "mA" },
  tec: { variable: "connection_type", unit: "" },
  rssi_wifi: { variable: "rssi_wifi", unit: "dBm" },
};

const STRING_TAGS = new Set(["id"]);

function findPayload(payload) {
  if (!Array.isArray(payload)) {
    return null;
  }

  for (const item of payload) {
    if (typeof item === "string" && item.startsWith("{")) {
      try {
        const parsed = JSON.parse(item);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
    }

    if (item && item.variable && typeof item.value === "string") {
      const candidates = ["payload", "data", "payload_raw"];
      if (candidates.includes(item.variable)) {
        try {
          const parsed = JSON.parse(item.value);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed;
          }
        } catch {}
      }
    }

    if (item && typeof item === "object" && !item.variable && item.ia !== undefined) {
      return item;
    }

    if (item && typeof item === "object" && !item.variable) {
      const keys = Object.keys(item);
      if (keys.length === 1 && keys[0].startsWith("{")) {
        try {
          const parsed = JSON.parse(keys[0]);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed;
          }
        } catch {}
      }
    }

    if (item && typeof item.value === "string" && item.value.startsWith("{")) {
      try {
        const parsed = JSON.parse(item.value);
        if (parsed && typeof parsed === "object" && parsed.ia !== undefined) {
          return parsed;
        }
      } catch {}
    }
  }

  return null;
}

const sm_3ea_data = findPayload(payload);

if (sm_3ea_data) {
  const group = String(Date.now());
  const result = [];

  for (const [tag, raw_value] of Object.entries(sm_3ea_data)) {
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