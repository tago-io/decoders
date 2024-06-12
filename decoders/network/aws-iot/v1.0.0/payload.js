const awS_payload = payload.find(x => x.variable === "aws_payload");

if (awS_payload) {
  try {
    const temp_payload = JSON.parse(awS_payload.value);
    console.log(temp_payload);
    if (Array.isArray(temp_payload) && !temp_payload.find(x => x.variable === undefined || x.value === undefined)) {
      payload = temp_payload;
    } else if (temp_payload.variable !== undefined && temp_payload.value !== undefined) {
      payload = [temp_payload];
    } else {
      throw "error"
    }
  } catch (e) {
    console.error("INFO: Not valid TagoIO payload. Please create a connector for this device and parse the data yourself.");
  }
}
