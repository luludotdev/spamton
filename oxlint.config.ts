import { default as common } from "@luludev/configs/oxlint/common";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [common],
  globals: {
    es2024: "readonly",
  },
  rules: {},
});
