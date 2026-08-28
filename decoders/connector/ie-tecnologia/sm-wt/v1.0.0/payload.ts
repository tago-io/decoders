/**
 * IE Tecnologia SM-WT — Decoder para medidor de temperatura e umidade
 *
 * Suporta sensores SHT40 (temperatura + umidade) e DS18B20 (somente temperatura).
 */

const VARIABLE_MAP: Record<string, { variable: string; unit: string }> = {
  id: { variable: "device_id", unit: "" },
  t_canal1: { variable: "temperature", unit: "°C" },
  u_canal1: { variable: "humidity", unit: "%rH" },
  rssi_wifi: { variable: "rssi_wifi", unit: "dBm" },
};

const STRING_TAGS = new Set(["id"]);

function findPayload(payload: any[]): Record<string, string> | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  // JSON puro do SM-WT (envio direto via HTTP POST)
  if (payload.length === 1 && payload[0] && !payload[0].variable && payload[0].t_canal1 !== undefined) {
    return payload[0];
  }

  const candidates = ["payload", "data", "payload_raw"];
  for (const name of candidates) {
    const item = payload.find((x: any) => x.variable === name);
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
        if (parsed && typeof parsed === "object" && parsed.t_canal1 !== undefined) {
          return parsed;
        }
      } catch {}
    }
  }

  return null;
}

const sm_wt_data = findPayload(payload);

if (sm_wt_data) {
  const group = String(Date.now());
  const result: { variable: string; value: string | number; unit?: string; group: string }[] = [];

  for (const [tag, raw_value] of Object.entries(sm_wt_data)) {
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