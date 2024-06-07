// Function to parse the date from a given timestamp
function getMyDate(timestamp) {
  const date = new Date(timestamp * 1000).toISOString();
  return date;
}

// Function to process data logs from the payload
function datalog(hexStringAfter28) {
  const numberOfRecords = hexStringAfter28.length / 22;
  const recordLength = hexStringAfter28.length / numberOfRecords;
  const data: any = [];

  for (let i = 0; i < numberOfRecords; i++) {
    const start = i * recordLength;
    const end = (i + 1) * recordLength;
    const slice = hexStringAfter28.slice(start, end);
    const time = getMyDate(parseInt(slice.slice(14, 22), 16));

    data.push(
      { variable: "contact_status", value: parseInt(slice.slice(0, 2), 16), time, group: time },
      { variable: "total_pulse", value: parseInt(slice.slice(2, 8), 16), time, group: time },
      { variable: "open_duration", value: parseInt(slice.slice(8, 14), 16), time, group: time }
    );
  }

  return data;
}

// Function to decode the buffer and extract common and datalog data
function decodeBuffer(buffer, hexStringAfter28, data1, data2) {
  const time = getMyDate(buffer.readUInt32BE(23));
  const group = String(Date.now());

  const commonData = [
    { variable: "battery_level", value: buffer.readUInt16BE(10) / 1000, unit: "V", time, group },
    { variable: "signal", value: buffer.readInt8(12), time, group },
    { variable: "mod", value: buffer.readInt8(13), time, group },
    { variable: "calculate_flag", value: buffer.readInt8(14), time, group },
    { variable: "contact_status", value: buffer.readUInt16BE(15), time, group },
    { variable: "alarm", value: buffer.readUInt16BE(16), time, group },
    { variable: "total_pulse", value: data1, time, group },
    { variable: "open_duration", value: data2, time, group },
  ];

  return buffer.length === 27 ? commonData : commonData.concat(datalog(hexStringAfter28));
}

// Main payload processing function
function processPayload(payload) {
  const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));

  if (payload_raw) {
    try {
      const buffer = Buffer.from(payload_raw.value, "hex");
      const hexString = buffer.toString("hex");
      const hexStringAfter28 = hexString.slice(54);
      const data1 = parseInt(hexString.slice(34, 40), 16);
      const data2 = parseInt(hexString.slice(40, 46), 16);
      const data = decodeBuffer(buffer, hexStringAfter28, data1, data2);
      return data;
    } catch (error: any) {
      console.error("Parsing error:", error);
      return [{ variable: "parse_error", value: error.message }];
    }
  }

  return [];
}

// Append the processed data to the payload
try {
  const processedData = processPayload(payload);
  payload = payload.concat(processedData);
} catch (error: any) {
  console.error("Error processing payload:", error);
  payload = [{ variable: "parse_error", value: error.message }];
}

// 8 Variables in total
