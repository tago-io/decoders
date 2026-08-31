/**
 * IE Tecnologia SM-3EGW — Decoder para medidor de energia trifásico com WiFi/Ethernet/GSM
 */

const VARIABLE_MAP = {
  id: { variable: "device_id", unit: "" },
  pa: { variable: "active_power_a", unit: "W" },
  pb: { variable: "active_power_b", unit: "W" },
  pc: { variable: "active_power_c", unit: "W" },
  pt: { variable: "active_power_total", unit: "W" },
  qa: { variable: "reactive_power_a", unit: "VAr" },
  qb: { variable: "reactive_power_b", unit: "VAr" },
  qc: { variable: "reactive_power_c", unit: "VAr" },
  qt: { variable: "reactive_power_total", unit: "VAr" },
  sa: { variable: "apparent_power_a", unit: "VA" },
  sb: { variable: "apparent_power_b", unit: "VA" },
  sc: { variable: "apparent_power_c", unit: "VA" },
  st: { variable: "apparent_power_total", unit: "VA" },
  uarms: { variable: "voltage_a", unit: "V" },
  ubrms: { variable: "voltage_b", unit: "V" },
  ucrms: { variable: "voltage_c", unit: "V" },
  iarms: { variable: "current_a", unit: "A" },
  ibrms: { variable: "current_b", unit: "A" },
  icrms: { variable: "current_c", unit: "A" },
  itrms: { variable: "current_total", unit: "A" },
  pfa: { variable: "power_factor_a", unit: "" },
  pfb: { variable: "power_factor_b", unit: "" },
  pfc: { variable: "power_factor_c", unit: "" },
  pft: { variable: "power_factor_total", unit: "" },
  pga: { variable: "phase_angle_a", unit: "°" },
  pgb: { variable: "phase_angle_b", unit: "°" },
  pgc: { variable: "phase_angle_c", unit: "°" },
  freq: { variable: "frequency", unit: "Hz" },
  epa_c: { variable: "energy_consumption_active_a", unit: "kWh" },
  epb_c: { variable: "energy_consumption_active_b", unit: "kWh" },
  epc_c: { variable: "energy_consumption_active_c", unit: "kWh" },
  ept_c: { variable: "energy_consumption_active_total", unit: "kWh" },
  eqa_c: { variable: "energy_consumption_reactive_a", unit: "kVArh" },
  eqb_c: { variable: "energy_consumption_reactive_b", unit: "kVArh" },
  eqc_c: { variable: "energy_consumption_reactive_c", unit: "kVArh" },
  eqt_c: { variable: "energy_consumption_reactive_total", unit: "kVArh" },
  epa_g: { variable: "energy_generation_active_a", unit: "kWh" },
  epb_g: { variable: "energy_generation_active_b", unit: "kWh" },
  epc_g: { variable: "energy_generation_active_c", unit: "kWh" },
  ept_g: { variable: "energy_generation_active_total", unit: "kWh" },
  eqa_g: { variable: "energy_generation_reactive_a", unit: "kVArh" },
  eqb_g: { variable: "energy_generation_reactive_b", unit: "kVArh" },
  eqc_g: { variable: "energy_generation_reactive_c", unit: "kVArh" },
  eqt_g: { variable: "energy_generation_reactive_total", unit: "kVArh" },
  deltaepac: { variable: "delta_consumption_active_a", unit: "kWh" },
  deltaepbc: { variable: "delta_consumption_active_b", unit: "kWh" },
  deltaepcc: { variable: "delta_consumption_active_c", unit: "kWh" },
  deltaeptc: { variable: "delta_consumption_active_total", unit: "kWh" },
  delta_epa_c: { variable: "delta_consumption_active_a", unit: "kWh" },
  delta_epb_c: { variable: "delta_consumption_active_b", unit: "kWh" },
  delta_epc_c: { variable: "delta_consumption_active_c", unit: "kWh" },
  delta_ept_c: { variable: "delta_consumption_active_total", unit: "kWh" },
  deltaeqac: { variable: "delta_consumption_reactive_a", unit: "kVArh" },
  deltaeqbc: { variable: "delta_consumption_reactive_b", unit: "kVArh" },
  deltaeqcc: { variable: "delta_consumption_reactive_c", unit: "kVArh" },
  deltaeqtc: { variable: "delta_consumption_reactive_total", unit: "kVArh" },
  delta_eqa_c: { variable: "delta_consumption_reactive_a", unit: "kVArh" },
  delta_eqb_c: { variable: "delta_consumption_reactive_b", unit: "kVArh" },
  delta_eqc_c: { variable: "delta_consumption_reactive_c", unit: "kVArh" },
  delta_eqt_c: { variable: "delta_consumption_reactive_total", unit: "kVArh" },
  deltaepag: { variable: "delta_generation_active_a", unit: "kWh" },
  deltaepbg: { variable: "delta_generation_active_b", unit: "kWh" },
  deltaepcg: { variable: "delta_generation_active_c", unit: "kWh" },
  deltaeptg: { variable: "delta_generation_active_total", unit: "kWh" },
  delta_epa_g: { variable: "delta_generation_active_a", unit: "kWh" },
  delta_epb_g: { variable: "delta_generation_active_b", unit: "kWh" },
  delta_epc_g: { variable: "delta_generation_active_c", unit: "kWh" },
  delta_ept_g: { variable: "delta_generation_active_total", unit: "kWh" },
  deltaeqag: { variable: "delta_generation_reactive_a", unit: "kVArh" },
  deltaeqbg: { variable: "delta_generation_reactive_b", unit: "kVArh" },
  deltaeqcg: { variable: "delta_generation_reactive_c", unit: "kVArh" },
  deltaeqtg: { variable: "delta_generation_reactive_total", unit: "kVArh" },
  delta_eqa_g: { variable: "delta_generation_reactive_a", unit: "kVArh" },
  delta_eqb_g: { variable: "delta_generation_reactive_b", unit: "kVArh" },
  delta_eqc_g: { variable: "delta_generation_reactive_c", unit: "kVArh" },
  delta_eqt_g: { variable: "delta_generation_reactive_total", unit: "kVArh" },
  yuaub: { variable: "voltage_angle_ab", unit: "°" },
  yuauc: { variable: "voltage_angle_ac", unit: "°" },
  yubuc: { variable: "voltage_angle_bc", unit: "°" },
  tpsd: { variable: "device_temperature", unit: "°C" },
  tec: { variable: "connection_type", unit: "" },
  rssi_wifi: { variable: "rssi_wifi", unit: "dBm" },
  rssi_gsm: { variable: "rssi_gsm", unit: "dBm" },
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

    if (item && typeof item === "object" && !item.variable && item.uarms !== undefined) {
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
        if (parsed && typeof parsed === "object" && parsed.uarms !== undefined && parsed.tec !== undefined) {
          return parsed;
        }
      } catch {}
    }
  }

  return null;
}

const sm3egw_data = findPayload(payload);

if (sm3egw_data) {
  const group = String(Date.now());
  const result = [];

  for (const [tag, raw_value] of Object.entries(sm3egw_data)) {
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