// Revisión visual de Pauta: capturas en móvil (360 y 412) y escritorio (1440), tema claro y oscuro.
// Uso: npm run build && PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx playwright test
import { defineConfig } from "@playwright/test";

const chromium = { launchOptions: { executablePath: process.env.PW_CHROMIUM || undefined } };
export default defineConfig({
  testDir: "pruebas",
  testMatch: /.*\.spec\.js/,
  workers: 2,
  reporter: [["list"]],
  webServer: { command: "npx astro preview --port 4330", port: 4330, reuseExistingServer: true },
  use: { baseURL: "http://localhost:4330", reducedMotion: "reduce", ...chromium },
  projects: [
    { name: "honor", use: { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
    { name: "estrecho", use: { viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
    { name: "escritorio", use: { viewport: { width: 1440, height: 900 } } },
  ],
});
