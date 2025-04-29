import { defineConfig } from "tsdown/config";

const config = defineConfig(() => ({
  entry: "./src/index.ts",
  target: "es2024",
  sourcemap: true,
}));

export default config;
