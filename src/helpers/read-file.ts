import fs from "node:fs";
import path from "node:path";

function readFileFromPath(filePath: string, file?: string, utf?: boolean): Buffer | string | null {
  if (!file) {
    return null;
  }

  const directory = path.join(filePath, file);

  if (!fs.existsSync(directory)) {
    return null;
  }

  if (utf) {
    return fs.readFileSync(directory, "utf8");
  }

  return fs.readFileSync(directory);
}
export { readFileFromPath };
