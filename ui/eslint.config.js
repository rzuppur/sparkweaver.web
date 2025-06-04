import js from "@eslint/js";
import { includeIgnoreFile } from "@eslint/compat";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import { fileURLToPath } from "node:url";
import ts from "typescript-eslint";
import svelteConfig from "./svelte.config.js";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default ts.config(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    ignores: [
      "src/assets",
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser, ...globals.node,
        BluetoothDevice: "readonly",
        BluetoothRemoteGATTCharacteristic: "readonly",
        BluetoothRemoteGATTService: "readonly",
      },
    },
  },
  {
    files: [
      "**/*.svelte",
      "**/*.svelte.ts",
      "**/*.svelte.js",
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
  {
    rules: {
      semi: ["error", "always"],
      "comma-dangle": [
        "warn",
        "always-multiline",
      ],
      quotes: [
        "error",
        "double",
      ],
      indent: [
        "error",
        2,
        {
          SwitchCase: 1,
        },
      ],
      "svelte/no-at-html-tags": [
        "off",
      ],
    },
  },
);
