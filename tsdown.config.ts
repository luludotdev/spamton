import { defineConfig } from "tsdown/config";

const config = defineConfig((options) => ({
  entry: "./src/index.ts",
  target: "node24",
  sourcemap: true,
  minify: !options.watch,
}));

export default config;
