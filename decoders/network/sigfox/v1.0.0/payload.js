const duplicates = payload.find(p => p.variable === "duplicates");
if (duplicates) {
  payload = payload.map((p) => {
    if (p.variable === "duplicates") {
      p.value = JSON.stringify(p.value);
    }
    return p;
  });
}

const location = payload.find(p => p.variable === "location");

if (location && location.location && location.location.lat && location.location.lng) {
  payload = payload
    .map((p) => {
      if (p.variable === "location") {
        p.value = `${p.location.lat}, ${p.location.lng}`;
        const radius = {
          variable: "radius",
          value: p.location.radius || 0,
          unit: "m",
          serie: p.serie,
        };
        return [p, radius];
      }
      return p;
    })
    .flat();
}

payload = payload.filter((p) => {
  if (p.variable === 'location' && p.location && !p.location.lat) {
    return false;
  }
  return p;
});