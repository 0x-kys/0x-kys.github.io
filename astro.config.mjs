// @ts-check
import { defineConfig } from "astro/config";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  site: "https://0x-kys.github.io",
  // base: "0x-kys.github.io",
  //
  // no need to set base if project is being loaded from
  // root or repo name is in <username>.github.io format

  adapter: node({
    mode: "standalone",
  }),
});
