/**
 * ? VM2 has security flaws, that is only for testing purposes
 * ? TagoIO use a custom Javascript VM to run the decoders not open source
 * ? Maybe the test can have a different result from the TagoIO platform
 */

import path from "node:path";
import fs from "node:fs";
import { VM } from "vm2";
import moment from "moment-timezone";
import { buildTS } from "../helpers/build-ts";

function decoderRun(file_path: string, params = {}) {
  let file = fs.readFileSync(path.join(__dirname, "../", file_path), "utf-8");

  file = buildTS(file);

  const vm = new VM({ timeout: 1000, wasm: false, sandbox: params });
  vm.freeze(moment, "moment");
  const footer = "\n ; this.payload";
  return vm.run(`${file}${footer}`);
};

// ? It is necessary to export in this way to be used in the tests
module.exports = decoderRun; // ? CommonJS
export {decoderRun }; // ? ESM
