import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    exclude: ["**/node_modules/**"],
  },
  plugins: [
    swc.vite({
      module: { type: "es6" },
    }),
  ],
});
