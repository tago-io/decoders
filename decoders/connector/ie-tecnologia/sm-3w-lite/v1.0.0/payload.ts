/**
 * IE Tecnologia SM-3W Lite — Decoder para medidor de energia trifásico
 *
 * Converte o payload JSON enviado pelo SM-3W Lite em variáveis TagoIO.
 * O dispositivo envia um objeto JSON com tags curtas e valores em string.
 *
 * Exemplo de payload:
 * {
 *   "id": "12345678901234567890123",
 *   "pa": "0.00",
 *   "uarms": "120.15",
 *   "freq": "60.00",
 *   ...
 * }
 */

/**
 * Mapeamento: tag do dispositivo -> { nome da variável TagoIO, unidade }
 */
const VARIABLE_MAP: Record<string, { variable: string; unit: string }> = {
  // Identificação
  id: { variable: "device_id", unit: "" },

  // Potência Ativa (W)
  pa: { variable: "active_power_a", unit: "W" },
  pb: { variable: "active_power_b", unit: "W" },
  pc: { variable: "active_power_c", unit: "W" },
  pt: { variable: "active_power_total", unit: "W" },

  // Potência Reativa (VAr)
  qa: { variable: "reactive_power_a", unit: "VAr" },
  qb: { variable: "reactive_power_b", unit: "VAr" },
  qc: { variable: "reactive_power_c", unit: "VAr" },
  qt: { variable: "reactive_power_total", unit: "VAr" },

  // Potência Aparente (VA)
  sa: { variable: "apparent_power_a", unit: "VA" },
  sb: { variable: "apparent_power_b", unit: "VA" },
  sc: { variable: "apparent_power_c", unit: "VA" },
  st: { variable: "apparent_power_total", unit: "VA" },

  // Tensão (V)
  uarms: { variable: "voltage_a", unit: "V" },
  ubrms: { variable: "voltage_b", unit: "V" },
  ucrms: { variable: "voltage_c", unit: "V" },

  // Corrente (A)
  iarms: { variable: "current_a", unit: "A" },
  ibrms: { variable: "current_b", unit: "A" },
  icrms: { variable: "current_c", unit: "A" },
  itrms: { variable: "current_total", unit: "A" },

  // Fator de Potência
  pfa: { variable: "power_factor_a", unit: "" },
  pfb: { variable: "power_factor_b", unit: "" },
  pfc: { variable: "power_factor_c", unit: "" },
  pft: { variable: "power_factor_total", unit: "" },

  // Ângulo entre Tensão e Corrente (°)
  pga: { variable: "phase_angle_a", unit: "°" },
  pgb: { variable: "phase_angle_b", unit: "°" },
  pgc: { variable: "phase_angle_c", unit: "°" },

  // Frequência (Hz)
  freq: { variable: "frequency", unit: "Hz" },

  // Consumo de Energia Ativa (kWh)
  epa_c: { variable: "energy_consumption_a", unit: "kWh" },
  epb_c: { variable: "energy_consumption_b", unit: "kWh" },
  epc_c: { variable: "energy_consumption_c", unit: "kWh" },
  ept_c: { variable: "energy_consumption_total", unit: "kWh" },

  // Geração de Energia Ativa (kWh)
  epa_g: { variable: "energy_generation_a", unit: "kWh" },
  epb_g: { variable: "energy_generation_b", unit: "kWh" },
  epc_g: { variable: "energy_generation_c", unit: "kWh" },
  ept_g: { variable: "energy_generation_total", unit: "kWh" },

  // Ângulos entre Tensões de Fase (°)
  yuaub: { variable: "voltage_angle_ab", unit: "°" },
  yuauc: { variable: "voltage_angle_ac", unit: "°" },
  yubuc: { variable: "voltage_angle_bc", unit: "°" },

  // Temperatura do Equipamento (°C)
  tpsd: { variable: "device_temperature", unit: "°C" },
};

/**
 * Tags que devem ser armazenadas como string (não converter para número).
 */
const STRING_TAGS = new Set(["id"]);

/**
 * Tenta encontrar o JSON do SM-3W Lite nos dados recebidos.
 * O payload pode chegar de diferentes formas dependendo da rede:
 * - Via HTTP POST direto: como objeto JSON puro dentro de um array
 * - Via MQTT/HTTPS: como valor de uma variável "payload", "data" ou "payload_raw"
 * - Via TagoTiP raw: como string JSON diretamente
 */
function findPayload(payload: any[]): Record<string, string> | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  // JSON puro do SM-3W Lite (envio direto via HTTP POST)
  if (payload.length === 1 && payload[0] && !payload[0].variable && payload[0].uarms !== undefined) {
    return payload[0];
  }

  // Busca em variáveis conhecidas
  const candidates = ["payload", "data", "payload_raw"];
  for (const name of candidates) {
    const item = payload.find((x: any) => x.variable === name);
    if (item && typeof item.value === "string") {
      try {
        const parsed = JSON.parse(item.value);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // não é JSON, pula
      }
    }
  }

  // Busca em qualquer variável que contenha JSON do SM-3W Lite
  for (const item of payload) {
    if (item && typeof item.value === "string" && item.value.startsWith("{")) {
      try {
        const parsed = JSON.parse(item.value);
        if (parsed && typeof parsed === "object" && parsed.uarms !== undefined) {
          return parsed;
        }
      } catch {
        // não é JSON, pula
      }
    }
  }

  return null;
}

// Lógica principal do decoder
const sm3w_data = findPayload(payload);

if (sm3w_data) {
  const group = String(Date.now());
  const result: { variable: string; value: string | number; unit?: string; group: string }[] = [];

  for (const [tag, raw_value] of Object.entries(sm3w_data)) {
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