import { default as base } from "@luludev/configs/oxfmt";
import { merge } from "@luludev/configs/utils";
import { defineConfig } from "oxfmt";

const config = defineConfig({
  ignorePatterns: ["**/dist/*"],
});

export default merge(base, config);
