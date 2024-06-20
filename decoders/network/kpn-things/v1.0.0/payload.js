/**
 * Parses the value of the reading
 *
 * Value  Value of the entry.  Optional if a Sum value is present,
 * otherwise required.  Values are represented using three basic data
 * types, Floating point numbers ("v" field for "Value"), Booleans
 * ("vb" for "Boolean Value") and Strings ("vs" for "String Value").
 * Exactly one of these three fields MUST appear.
 * @param {Object} item
 * @returns {number | boolean | string}
 */
function parseValue(item) {
  if ("vb" in item) {
    return !!item.vb;
  }

  if ("v" in item) {
    return Number(item.v);
  }

  if ("vs" in item) {
    return item.vs;
  }
}

/**
 * Removes unnacepted parameters from the variable name
 * @param {string} variable
 */
function parseVariable(variable) {
  const variableParsed = variable.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");
  if (!variableParsed) {
    return "measurement";
  }
  return variableParsed;
}

/**
 *
 * @param {Object[]} senml_obj
 */
function decoder(senml_obj) {
  const toTagoJSON = [];
  const serie = String(new Date().getTime());

  let curr_time = Date.now();
  let base_unit;
  let base_name;
  for (const item of senml_obj) {
    if (item.bt) {
      const timestampInMilliseconds = item.bt;
      curr_time = timestampInMilliseconds < 1e12 ? timestampInMilliseconds * 1000 : timestampInMilliseconds;
    }
    if (item.bn) {
      base_name = item.bn;
    }
    if (item.bu) {
      base_unit = item.bu;
    }

    const itemTago = {
      variable: parseVariable(item.n || base_name),
      unit: item.u || base_unit,
      value: parseValue(item),
      time: new Date(curr_time),
      serie,
      group: serie,
    };

    toTagoJSON.push(itemTago);
  }

  return toTagoJSON;
}

// Handle Received Data
const kpnPayload = payload.find((x) => x.variable === "kpn_payload");
if (kpnPayload) {
  const contentJSON = JSON.parse(kpnPayload.value);
  const parsedData = decoder(contentJSON);
  payload = parsedData;
}
