const info = payload.find(x => x.bt);
const serie = info.bt || Number((Date.now() / 1000).toFixed(0));
const time = new Date(serie * 1000).toISOString();

const measurements = payload.filter(x => x.n);
payload = measurements.map((d) => {
  return {
    variable: String(d.n).replace(/:/, ''),
    value: d.v || d.vs || d.vb,
    serie,
    time,
    unit: d.u || null,
  };
});

const lat = payload.find(x => x.variable === 'latitude');
const lng = payload.find(x => x.variable === 'longitude');
if (lat && lng) {
  payload = payload.filter(x => !(x.variable === 'latitude' || x.variable === 'longitude'));
  payload.push({
    variable: 'location',
    value: `${lat.value}, ${lng.value}`,
    serie,
    time,
    location: {
      lat: lat.value,
      lng: lng.value,
    },
  });
}
