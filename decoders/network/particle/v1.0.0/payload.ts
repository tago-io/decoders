interface DataItem {
  variable: string;
  value: string | number | boolean;
  group: string;
  time?: string;
  location?: { lat: number; lng: number };
  metadata?: Record<string, unknown>;
}

interface ParticleLoc {
  lat?: number | string;
  lon?: number | string;
  lng?: number | string;
  [key: string]: unknown;
}

interface ParticleData {
  cmd?: string;
  time?: number;
  req_id?: number;
  v?: number;
  trig?: string[];
  src?: string[];
  loc?: ParticleLoc;
  towers?: Array<{ str?: number; [key: string]: unknown }>;
  wps?: Array<{ str?: number; [key: string]: unknown }>;
}

// Buffer.from silently drops invalid characters, so the format is validated before decoding.
function decodeBase64(raw: string) {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(raw) || raw.length % 4 !== 0) {
    return null;
  }
  return Buffer.from(raw, "base64").toString("utf-8");
}

function decodeHex(raw: string) {
  if (!/^[0-9a-fA-F]+$/.test(raw) || raw.length % 2 !== 0) {
    return null;
  }
  return Buffer.from(raw, "hex").toString("utf-8");
}

function tryParseJson(text: string | null) {
  if (!text) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === "object" && parsed !== null ? (parsed as ParticleData) : null;
  } catch {
    return null;
  }
}

function parseData(raw: string) {
  return tryParseJson(raw) ?? tryParseJson(decodeHex(raw)) ?? tryParseJson(decodeBase64(raw));
}

function parseLocation(loc: ParticleLoc, group: string, time?: string) {
  const lat = Number(loc.lat);
  const lng = Number(loc.lon ?? loc.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }
  const { lat: _lat, lon: _lon, lng: _lng, ...metadata } = loc;
  const item: DataItem = { variable: "location", value: `${lat},${lng}`, location: { lat, lng }, group, time };
  if (Object.keys(metadata).length) {
    item.metadata = metadata;
  }
  return item;
}

function parseIndexedArray(variable: string, items: Array<{ str?: number; [key: string]: unknown }>, group: string, time?: string) {
  return items.map((entry, index) => {
    const { str, ...metadata } = entry;
    const item: DataItem = { variable: `${variable}_${index}`, value: str as number, group, time };
    if (Object.keys(metadata).length) {
      item.metadata = metadata;
    }
    return item;
  });
}

function parseDataObject(data: ParticleData, group: string, fallbackTime?: string) {
  const time = typeof data.time === "number" ? new Date(data.time * 1000).toISOString() : fallbackTime;
  const result: DataItem[] = [];

  for (const key of ["cmd", "req_id", "v"] as const) {
    const value = data[key];
    if (value !== undefined && value !== null) {
      result.push({ variable: key, value, group, time });
    }
  }
  for (const key of ["trig", "src"] as const) {
    const value = data[key];
    if (Array.isArray(value) && value.length) {
      result.push({ variable: key, value: value.join(","), group, time });
    }
  }
  if (data.loc) {
    const location = parseLocation(data.loc, group, time);
    if (location) {
      result.push(location);
    }
  }
  if (Array.isArray(data.towers)) {
    result.push(...parseIndexedArray("towers", data.towers, group, time));
  }
  if (Array.isArray(data.wps)) {
    result.push(...parseIndexedArray("wps", data.wps, group, time));
  }
  return result;
}

const particleEntry = payload.find((item) => item.variable === "particle_payload");

if (particleEntry) {
  try {
    const parsed = JSON.parse(particleEntry.value as string);
    const group = String(particleEntry.group || Date.now());
    const publishedAt = parsed.published_at;
    const varsToTago: DataItem[] = [];

    if (parsed.event) {
      varsToTago.push({ variable: "event", value: parsed.event, group, time: publishedAt });
    }
    if (parsed.coreid) {
      varsToTago.push({ variable: "coreid", value: parsed.coreid, group, time: publishedAt });
    }

    if (typeof parsed.data === "string" && parsed.data.length) {
      const data = parseData(parsed.data);
      if (data) {
        varsToTago.push(...parseDataObject(data, group, publishedAt));
      } else {
        varsToTago.push({ variable: "data", value: parsed.data, group, time: publishedAt });
      }
    }

    payload = varsToTago;
  } catch (error) {
    console.error("Invalid JSON in particle_payload value. Keeping original payload.", error);
  }
}
