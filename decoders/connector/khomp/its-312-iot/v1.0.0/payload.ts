//@ts-nocheck
/* eslint-disable eqeqeq */
/* eslint-disable max-len */
/* eslint-disable no-plusplus */
/* eslint-disable radix */
/* eslint-disable no-bitwise */
/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
/* This is an generic payload parser example.
 ** The code find the payload variable and parse it if exists.
 **
 ** IMPORTANT: In most case, you will only need to edit the parsePayload function.
 **
 ** Testing:
 ** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
 ** [{ "variable": "payload", "value": "0109611395" }]
 **
 ** The ignore_vars variable in this code should be used to ignore variables
 ** from the device that you don't want.
 */
// Add ignorable variables in this array.
const ignore_vars = [];

// Function to convert an object to TagoIO data format.
function ToTagoFormat(object_item, serie, prefix = "") {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue; // ignore chosen vars

    if (typeof object_item[key] === "object") {
      result.push({
        variable: object_item[key].MessageType || `${prefix}${key}`,
        value: object_item[key].value || object_item[key].Value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        unit: object_item[key].unit,
        location: object_item[key].location,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

function insertData(decoded, variable, value) {
  let temp_var = `${variable}`;
  let x = 1;
  while (temp_var in decoded) {
    temp_var = `${variable}_${x}`;
    x += 1;
  }
  decoded[temp_var] = value;
}

function Decoder(payload) {
  const decoded = {};
  payload.forEach((data) => {
    const decodedData = {};
    if (!data.n && !data.bn) return;
    if (data.n) {
      if (data.v || data.vb || data.vs) decodedData.value = data.v || data.vb || data.vs;
      if (data.u) decodedData.unit = data.u;
      insertData(decoded, data.n.replace(/[?*!<>.-=$]/, ""), decodedData);
    } else if (data.bn) {
      insertData(decoded, "device_number", data.bn);
    }
  });
  return decoded;
}

const aux = payload;

const serie = Date.now();
const decodedPayload = Decoder(payload);

// Parse the payload_raw to JSON format (it comes in a String format)
payload = ToTagoFormat(decodedPayload, serie);
payload.push({ variable: "payload", value: JSON.stringify(aux) }); // Added stringify since this was causing issues when
