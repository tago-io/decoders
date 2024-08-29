import { transformSync } from "@swc/core";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function buildTS(fileContent: string) {
  const { code } = transformSync(fileContent, {
    cwd: __dirname,
    jsc: {
      parser: { syntax: "typescript" },
      target: "es2020",
      // minify: {
      //   compress: false,
      //   mangle: false,
      //   format: {
      //     comments: false, // ? Remove comments
      //   },
      // },
    },
    module: {
      type: "commonjs",
      noInterop: true, // This line to prevent empty export
    },
  });

  return code;
}

export { buildTS };
