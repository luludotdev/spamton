import { defineConfig } from "tsdown/config";

const config = defineConfig((options) => ({
  entry: "./src/index.ts",
  target: "node24",
  sourcemap: true,
  // oxlint-disable-next-line typescript/strict-boolean-expressions
  minify: !options.watch,
  tsconfig: "./tsconfig.json",
}));

export default config;
