// @ts-check

import common from "@luludev/eslint-config/common";
import node from "@luludev/eslint-config/node";
import prettier from "@luludev/eslint-config/prettier";
import typescript from "@luludev/eslint-config/typescript";

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  { ignores: ["**/dist/*"] },
  ...common,
  ...node,
  ...typescript,
  ...prettier,
  {
    languageOptions: { parserOptions: { project: "./tsconfig.json" } },
  },
];

export default config;
