import { buildTS } from "./build-ts.ts";
import { readFileFromPath } from "./read-file.ts";

function resolvePayload(path: string, filename: string): Buffer {
  if (filename.endsWith(".ts")) {
    const source = readFileFromPath(path, filename, true);
    if (source === null) {
      throw new Error(`Decoder source not found: ${path}/${filename}`);
    }

    return Buffer.from(buildTS(source), "utf-8");
  }

  const file = readFileFromPath(path, filename);
  if (file === null) {
    throw new Error(`Decoder file not found: ${path}/${filename}`);
  }

  return file;
}

export { resolvePayload };
