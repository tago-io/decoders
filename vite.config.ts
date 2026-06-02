import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**"],
    // vm2 in decoderRun can leave handles open; sequential files avoids fork teardown races (vitest 4).
    fileParallelism: false,
    teardownTimeout: 20_000,
  },
});
