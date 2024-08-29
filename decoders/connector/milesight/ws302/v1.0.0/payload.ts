function readFrequencyWeightType(type: number): string {
  switch (type) {
    case 0:
      return "z";
    case 1:
      return "a";
    case 2:
      return "c";
    default:
      return "";
  }
}

function readTimeWeightType(type: number): string {
  switch (type) {
    case 0:
      return "i";
    case 1:
      return "f";
    case 2:
      return "s";
    default:
      return "";
  }
}

function readLoRaWANClass(type: number): string {
  switch (type) {
    case 0:
      return "ClassA";
    case 1:
      return "ClassB";
    case 2:
      return "ClassC";
    case 3:
      return "ClassCtoB";
    default:
      return "";
  }
}

function readUInt16LE(bytes: Buffer): number {
  var value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

interface DecodedData {
  [key: string]: number | string;
}

function mileSightDeviceDecode(bytes: Buffer): DecodedData {
  const decoded: DecodedData = {};

  if (bytes.length < 2) {
    throw new Error("Invalid payload size");
  }

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      decoded.battery = bytes[i];
      i += 1;
    } // SOUND
    else if (channelId === 0x05 && channelType === 0x5b) {
      const weight = bytes[i];
      const freqWeight = readFrequencyWeightType(weight & 0x03);
      const timeWeight = readTimeWeightType((weight >> 2) & 0x03);

      const soundLevelName = `l${freqWeight}${timeWeight}`;
      const soundLevelEqName = `l${freqWeight}eq`;
      const soundLevelMaxName = `l${freqWeight}${timeWeight}max`;

      decoded[soundLevelName] = readUInt16LE(bytes.slice(i + 1, i + 3)) / 10;
      decoded[soundLevelEqName] = readUInt16LE(bytes.slice(i + 3, i + 5)) / 10;
      decoded[soundLevelMaxName] = readUInt16LE(bytes.slice(i + 5, i + 7)) / 10;
      i += 7;
    } // LoRaWAN Class Type
    else if (channelId === 0xff && channelType === 0x0f) {
      decoded.lorawan_class = readLoRaWANClass(bytes[i]);
      i += 1;
    } else {
      break;
    }
  }

  return decoded;
}

const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));

if (payload_raw) {
  try {
    const buffer = Buffer.from(payload_raw.value as string, "hex");
    const decoded = mileSightDeviceDecode(buffer);

    const time = payload_raw.time || new Date().toISOString();
    const group = payload_raw.group || `${new Date().getTime()}-${Math.random().toString(36).substring(2, 5)}`;

    const parsedTagoObj = Object.keys(decoded).map((key) => ({
      variable: key,
      value: decoded[key],
      unit: key === "battery" ? "%" : "",
      group,
      time,
    }));

    payload = payload.concat(parsedTagoObj);
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
