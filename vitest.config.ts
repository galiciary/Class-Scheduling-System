import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Vitest needs its own resolution of the "@/" alias — tsconfig paths only inform the
 * type checker, not the test runner's module resolution.
 *
 * The node environment is enough because everything under test is a pure module: no
 * component here touches the DOM, which is the point of keeping this logic out of
 * the components in the first place.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});