import { default as common } from "@luludev/configs/oxlint/common";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [common],
  globals: {
    es2024: "readonly",
  },
  rules: {
    "new-cap": "off",
    "typescript/restrict-template-expressions": "off",
  },
});
