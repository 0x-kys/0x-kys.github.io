// @ts-check
import { defineConfig } from "astro/config";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  site: "https://0x-kys.github.io",
  base: "0x-kys.github.io",

  adapter: node({
    mode: "standalone",
  }),
});