import { buildTS } from "./build-ts";
import { readFileFromPath } from "./read-file";

function resolvePayload(path: string, filename: string): Buffer {
  let payload_decoder: Buffer;

  if (String(filename).endsWith(".ts")) {
    payload_decoder = Buffer.from(
      buildTS(readFileFromPath(path, filename, true) as string),
      "utf-8"
    );
  } else {
    payload_decoder = readFileFromPath(path, filename) as Buffer;
  }

  return payload_decoder;
}

export { resolvePayload };
