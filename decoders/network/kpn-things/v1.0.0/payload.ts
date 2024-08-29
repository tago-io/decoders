/**
 * @description SenML is a simple format for representing sensor measurements.
 * Documentation https://datatracker.ietf.org/doc/html/rfc8428#section-5
 */
interface SenML {
  bn?: string; // Base Name
  bt?: number; // Base Time
  bu?: string; // Base Unit
  bv?: number; // Base Value
  bs?: string; // Base Sum
  bver?: number; // Version
  n?: string; // Name
  u?: string; // Unit
  v?: number; // Value
  vb?: boolean; // Boolean Value
  vs?: string; // String Value
  vd?: string; // Data Value (base64)
  s?: string; // Sum
  t?: number; // Time in seconds
  ut?: number; // Update Time
}

/**
 * @description Parses the value of the reading
 * @param {Object} item - SenML object
 * @returns {number | boolean | string  | undefined }
 */
function parseValue(item: SenML): number | boolean | string | undefined {
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
 * @description Removes unaccepted parameters from the variable name
 * @param {string} variableName - Variable name
 */
function parseVariable(variableName: string): string {
  const variableParsed = variableName.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");

  if (!variableParsed) {
    return "measurement";
  }

  return variableParsed;
}

/**
 * @description Decodes the SenML payload
 * @param {SenML[]} senMLObj - SenML object
 */
function decoder(senMLObj: SenML[]) {
  const toTagoJSON: any[] = [];
  const serie = String(new Date().getTime());

  let currTime = Date.now();
  let baseUnit = "";
  let baseName = "";
  for (const item of senMLObj) {
    if (item.bt) {
      const timestampInMilliseconds = item.bt;
      currTime = timestampInMilliseconds < 1e12 ? timestampInMilliseconds * 1000 : timestampInMilliseconds;
    }
    if (item.bn) {
      baseName = item.bn;
    }
    if (item.bu) {
      baseUnit = item.bu;
    }

    const itemTago = {
      variable: parseVariable(item.n || baseName),
      unit: item.u || baseUnit,
      value: parseValue(item),
      time: new Date(currTime),
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
  try {
    const contentJSON = JSON.parse(kpnPayload.value as string);
    const parsedData = decoder(contentJSON);
    payload = parsedData;
  } catch (error) {
    // Print the error to the Live Inspector.
    // console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
