function parseExtended(raw_payload) {
  const variables = [];
  for (const item of raw_payload) {
    const my_var = item.t.replace('/', '').split('/').join('_');
    variables.push({ variable: my_var, value: item.v, time: item.ts })
  }
  return variables;
}

function parseCompact(raw_payload) {
  const variables = [];
  for (key in raw_payload) {
    const my_var = key.replace('/', '').split('/').join('_');
    for (const item of raw_payload[key]) {
      variables.push({ variable: my_var, value: item.v, time: item.ts })
    }
  }
  return variables;
}

if (Array.isArray(payload[0])) {
  payload = parseExtended(payload[0]);
} else if (!payload[0].variable) {
  payload = parseCompact(payload[0]);
}