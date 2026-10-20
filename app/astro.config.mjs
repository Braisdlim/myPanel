import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

// Salida estática (la que necesita Tauri). El sistema de diseño se importa desde ../diseno/sistema.
export default defineConfig({
  integrations: [svelte()],
  vite: { server: { fs: { allow: [".."] } } },
});
