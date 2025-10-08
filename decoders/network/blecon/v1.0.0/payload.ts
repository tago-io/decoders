/**
 * Decoder to capture metadata.converted_payload into TagoIO variables.
 * - Dynamically adapts to any fields present.
 * - Handles top-level fields (e.g., uptime, battery).
 * - Handles events array, emitting variables per event with their own time.
 * - Ignores any "id" fields.
 * - Preserves incoming group and location if available.
 */

function pushVar(arr: any[], { variable, value, time, group, location, unit, metadata }: any) {
  if (value === undefined || value === null) return;
  if (variable === "id") return; // ignore id as requested
  const item: any = { variable, value, time, group };
  if (location && location.lat && location.lng && location.lat !== 0 && location.lng !== 0) {
    item.location = location;
  }
  if (unit) item.unit = unit;
  if (metadata && Object.keys(metadata).length) item.metadata = metadata;
  arr.push(item);
}

function extractLocation(loc: any) {
  // Support both Tago location object and GeoJSON-like objects if present
  if (!loc) return null;
  if (loc.lat !== undefined && loc.lng !== undefined) return { lat: Number(loc.lat), lng: Number(loc.lng) };
  if (loc.type === "Point" && Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    // coordinates: [lng, lat]
    const lng = Number(loc.coordinates[0]);
    const lat = Number(loc.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}

// 1) Find original message entry (where metadata.converted_payload is present)
const entry = payload.find((x: any) => x.metadata && x.metadata.converted_payload);

// If not found, keep payload unchanged.
if (entry) {
  const cp = entry.metadata.converted_payload;
  const out: any[] = [];
  const group = entry.group;
  const timeBase = entry.time || new Date().toISOString();
  const loc = extractLocation(entry.location);

  // 2) Push top-level fields (except events and id)
  if (cp && typeof cp === "object") {
    Object.keys(cp).forEach((key: string) => {
      if (key === "events" || key === "id") return;
      pushVar(out, { variable: key, value: cp[key], time: timeBase, group, location: loc });
    });

    // 3) Handle events array dynamically
    if (Array.isArray(cp.events)) {
      for (let i = 0; i < cp.events.length; i++) {
        const ev = cp.events[i];
        if (!ev || typeof ev !== "object") continue;
        const evTime = ev.time || timeBase;

        // Push all other event fields except id and time and type already added
        Object.keys(ev).forEach((k: string) => {
          if (k === "id" || k === "time" || k === "type") return;
          pushVar(out, { variable: k, value: ev[k], time: evTime, group, location: loc, metadata: { index: i } });
        });
      }
    }
  }

  // 4) Replace payload with parsed variables
  payload = out;
}
