/**
 * IG502 - connector for TagoIO.
 *
 * The InHand IG502 edge gateway collects PLC/meter data with the Device
 * Supervisor app and publishes it over MQTT. This connector parses the
 * gateway's JSON payloads into TagoIO variables. Two formats are supported:
 *
 * 1. TagoIO-style array (Device Supervisor QuickFunction output):
 *    [{ "variable": "temperature", "value": 25.3, "unit": "C" }, ...]
 *
 * 2. Device Supervisor group message format:
 *    { "timestamp": 1694567890, "values": { "<controller>": { "<point>": <value | { "raw_data": <value> }> } } }
 *
 * Unrelated payloads are left untouched.
 */

type TagoData = { variable: string; value: any; unit?: string; time?: Date; group?: string };

/** Normalize a measuring point name into a valid TagoIO variable name. */
function toVariable(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 100);
}

/** Parse the TagoIO-style array format. Returns null if the shape does not match. */
function parseVariableArray(parsed: any, group?: string): TagoData[] | null {
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return null;
  }
  if (!parsed.every((item) => item && typeof item === "object" && "variable" in item && "value" in item)) {
    return null;
  }
  return parsed.map((item) => {
    const data: TagoData = { variable: toVariable(String(item.variable)), value: item.value, group };
    if (item.unit) {
      data.unit = String(item.unit);
    }
    return data;
  });
}

/** Parse the Device Supervisor group message format. Returns null if the shape does not match. */
function parseSupervisorMessage(parsed: any, group?: string): TagoData[] | null {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const values = parsed.values;
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return null;
  }

  let time: Date | undefined;
  if (typeof parsed.timestamp === "number") {
    // Device Supervisor reports seconds; treat values past year ~2286 as milliseconds.
    time = new Date(parsed.timestamp < 1e10 ? parsed.timestamp * 1000 : parsed.timestamp);
  }

  const result: TagoData[] = [];
  for (const controller of Object.keys(values)) {
    const points = values[controller];
    if (!points || typeof points !== "object" || Array.isArray(points)) {
      continue;
    }
    for (const point of Object.keys(points)) {
      const raw = points[point];
      const value = raw && typeof raw === "object" && "raw_data" in raw ? raw.raw_data : raw;
      if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
        const data: TagoData = { variable: toVariable(point), value, group };
        if (time) {
          data.time = time;
        }
        result.push(data);
      }
    }
  }
  return result.length > 0 ? result : null;
}

// The raw MQTT message as delivered by the network ("payload" or "data").
const ig502Raw: any = (payload as any[]).find((x: any) => x.variable === "payload" || x.variable === "data");

if (ig502Raw && typeof ig502Raw.value === "string") {
  let ig502Parsed: any = null;
  try {
    ig502Parsed = JSON.parse(ig502Raw.value);
  } catch {
    // Not JSON: leave the payload untouched.
  }

  if (ig502Parsed !== null) {
    const decoded = parseVariableArray(ig502Parsed, ig502Raw.group) ?? parseSupervisorMessage(ig502Parsed, ig502Raw.group);
    if (decoded) {
      (payload as any[]).push(...decoded);
    }
  }
}

// Return the payload for the test harness / platform.
payload;
