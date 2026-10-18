import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: "artifact/dist",
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    lib: { entry: "artifact/main.js", formats: ["iife"], name: "myPanelPrototipo", fileName: () => "app.js" },
  },
});
