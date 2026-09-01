/**
 * IE Tecnologia SM-WL — Decoder para medidor de energia monofásico com energia reativa e deltas
 */

const VARIABLE_MAP = {
  id: { variable: "device_id", unit: "" },
  pa: { variable: "active_power", unit: "W" },
  qa: { variable: "reactive_power", unit: "VAr" },
  sa: { variable: "apparent_power", unit: "VA" },
  uarms: { variable: "voltage", unit: "V" },
  iarms: { variable: "current", unit: "A" },
  pfa: { variable: "power_factor", unit: "" },
  pga: { variable: "phase_angle", unit: "°" },
  freq: { variable: "frequency", unit: "Hz" },
  epa_c: { variable: "energy_consumption_active", unit: "kWh" },
  eqa_c: { variable: "energy_consumption_reactive", unit: "kVArh" },
  epa_g: { variable: "energy_generation_active", unit: "kWh" },
  eqa_g: { variable: "energy_generation_reactive", unit: "kVArh" },
  delta_epa_c: { variable: "delta_consumption_active", unit: "kWh" },
  delta_eqa_c: { variable: "delta_consumption_reactive", unit: "kVArh" },
  delta_epa_g: { variable: "delta_generation_active", unit: "kWh" },
  delta_eqa_g: { variable: "delta_generation_reactive", unit: "kVArh" },
  tpsd: { variable: "device_temperature", unit: "°C" },
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

    if (item && typeof item === "object" && !item.variable && item.uarms !== undefined && item.pfa !== undefined && item.delta_epa_c !== undefined) {
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
        if (parsed && typeof parsed === "object" && parsed.uarms !== undefined && parsed.pfa !== undefined && parsed.delta_epa_c !== undefined) {
          return parsed;
        }
      } catch {}
    }
  }

  return null;
}

const sm_wl_data = findPayload(payload);

if (sm_wl_data) {
  const group = String(Date.now());
  const result = [];

  for (const [tag, raw_value] of Object.entries(sm_wl_data)) {
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