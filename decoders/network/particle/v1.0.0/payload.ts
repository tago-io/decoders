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
  [key: string]: unknown;
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

// Binary publishes arrive as a Data URL, e.g.
// "data:application/octet-stream;base64,pyKYHEAbm4C7ndnAE7tO0A==".
// https://docs.particle.io/integrations/webhooks/#binary-data
function stripDataUrl(raw: string) {
  const match = /^data:[^,]*;base64,(.*)$/.exec(raw);
  return match ? match[1] : null;
}

function parseData(raw: string) {
  const dataUrlBody = stripDataUrl(raw);
  if (dataUrlBody !== null) {
    return tryParseJson(decodeBase64(dataUrlBody));
  }
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

// Structured publishes wrap binary values as { _type: "buffer", _data: "<base64>" }.
// https://docs.particle.io/integrations/webhooks/#binary-data
function isStructuredBuffer(value: unknown): value is { _type: "buffer"; _data: string } {
  return typeof value === "object" && value !== null && (value as { _type?: unknown })._type === "buffer" && typeof (value as { _data?: unknown })._data === "string";
}

const LOC_KEYS = ["cmd", "time", "req_id", "v", "trig", "src", "loc", "towers", "wps"];

// Keys outside the documented loc frame still carry sensor readings, so they are
// emitted generically instead of being dropped.
function parseExtraKeys(data: ParticleData, group: string, time?: string) {
  const result: DataItem[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (LOC_KEYS.includes(key) || value === undefined || value === null) {
      continue;
    }
    if (isStructuredBuffer(value)) {
      result.push({ variable: key, value: value._data, group, time, metadata: { type: "buffer" } });
    } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      result.push({ variable: key, value, group, time });
    } else if (Array.isArray(value)) {
      // Buffers nested in arrays get the same treatment as top-level ones.
      value.forEach((entry, index) => {
        const variable = `${key}_${index}`;
        if (isStructuredBuffer(entry)) {
          result.push({ variable, value: entry._data, group, time, metadata: { type: "buffer" } });
        } else if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
          result.push({ variable, value: entry, group, time });
        } else {
          result.push({ variable, value: JSON.stringify(entry), group, time });
        }
      });
    } else {
      result.push({ variable: key, value: JSON.stringify(value), group, time });
    }
  }
  return result;
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
  result.push(...parseExtraKeys(data, group, time));
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

    // Structured publishes deliver data as an object; classic publishes as a string.
    if (typeof parsed.data === "object" && parsed.data !== null) {
      varsToTago.push(...parseDataObject(parsed.data, group, publishedAt));
    } else if (typeof parsed.data === "string" && parsed.data.length) {
      const data = parseData(parsed.data);
      if (data) {
        varsToTago.push(...parseDataObject(data, group, publishedAt));
      } else {
        // Binary frames are not decodable here: hand the payload to the device
        // connector, dropping only the Data URL envelope.
        const raw = stripDataUrl(parsed.data) ?? parsed.data;
        varsToTago.push({ variable: "data", value: raw, group, time: publishedAt });
      }
    }

    payload = varsToTago;
  } catch (error) {
    console.error("Invalid JSON in particle_payload value. Keeping original payload.", error);
  }
}
