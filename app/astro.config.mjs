import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

// Salida estática (la que necesita Tauri). El sistema de diseño se importa desde ../diseno/sistema.
export default defineConfig({
  integrations: [svelte()],
  // Publicada en GitHub Pages bajo /myPanel/ (D-053): el flujo de despliegue pasa PAUTA_SITE y PAUTA_BASE.
  // En local, en las pruebas y en Tauri, la raíz.
  site: process.env.PAUTA_SITE || undefined,
  base: process.env.PAUTA_BASE || "/",
  // Google pide esta cabecera para su ventana de permisos cuando la página se sirve desde http://localhost
  server: { headers: { "Referrer-Policy": "no-referrer-when-downgrade" } },
  vite: { server: { fs: { allow: [".."] } } },
});
