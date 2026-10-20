import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

// Salida estática (la que necesita Tauri). El sistema de diseño se importa desde ../diseno/sistema.
export default defineConfig({
  integrations: [svelte()],
  // Google pide esta cabecera para su ventana de permisos cuando la página se sirve desde http://localhost
  server: { headers: { "Referrer-Policy": "no-referrer-when-downgrade" } },
  vite: { server: { fs: { allow: [".."] } } },
});
