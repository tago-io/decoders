/**
 * IE Tecnologia SM-W Lite — Decoder para medidor de energia monofásico
 *
 * Converte o payload JSON enviado pelo SM-W Lite em variáveis TagoIO.
 */

const VARIABLE_MAP: Record<string, { variable: string; unit: string }> = {
  id: { variable: "device_id", unit: "" },
  pa: { variable: "active_power", unit: "W" },
  qa: { variable: "reactive_power", unit: "VAr" },
  sa: { variable: "apparent_power", unit: "VA" },
  uarms: { variable: "voltage", unit: "V" },
  iarms: { variable: "current", unit: "A" },
  pft: { variable: "power_factor", unit: "" },
  pga: { variable: "phase_angle", unit: "°" },
  freq: { variable: "frequency", unit: "Hz" },
  epa_c: { variable: "energy_consumption", unit: "kWh" },
  epa_g: { variable: "energy_generation", unit: "kWh" },
  tpsd: { variable: "device_temperature", unit: "°C" },
  rssi_wifi: { variable: "rssi_wifi", unit: "dBm" },
};

const STRING_TAGS = new Set(["id"]);

function findPayload(payload: any[]): Record<string, string> | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  for (const item of payload) {
    // Caso 1: string JSON direta
    if (typeof item === "string" && item.startsWith("{")) {
      try {
        const parsed = JSON.parse(item);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
    }

    // Caso 2: variável payload/data/payload_raw com JSON string
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

    // Caso 3: objeto JSON direto (HTTP POST com application/json)
    if (item && typeof item === "object" && !item.variable && item.uarms !== undefined && item.pft !== undefined && item.iarms !== undefined) {
      return item;
    }

    // Caso 4: x-www-form-urlencoded — JSON inteiro virou chave do objeto
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

    // Caso 5: qualquer variável com JSON do SM-W Lite
    if (item && typeof item.value === "string" && item.value.startsWith("{")) {
      try {
        const parsed = JSON.parse(item.value);
        if (parsed && typeof parsed === "object" && parsed.uarms !== undefined && parsed.pft !== undefined) {
          return parsed;
        }
      } catch {}
    }
  }

  return null;
}

const sm_w_lite_data = findPayload(payload);

if (sm_w_lite_data) {
  const group = String(Date.now());
  const result: { variable: string; value: string | number; unit?: string; group: string }[] = [];

  for (const [tag, raw_value] of Object.entries(sm_w_lite_data)) {
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