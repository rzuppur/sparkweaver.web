import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import postcssPresetEnv from "postcss-preset-env";
import { defineConfig } from "vite";

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        postcssPresetEnv({
          browsers: ">= 0.25%, not dead",
        }),
      ],
    },
  },
  server: {
    host: "0.0.0.0",
  },
  plugins: [svelte()],
  resolve: {
    alias: {
      $assets: path.resolve("./src/assets"),
      $lib: path.resolve("./src/lib"),
    },
  },
});
