// Genera capturas de cada combinación para revisar. Uso: npx playwright test [--grep texto]
import { test } from "@playwright/test";

const devices = {
  movil360: { viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  honor: { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  escritorio: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const comps = (process.env.COMPS ?? "a,b,c").split(",");
const screens = (process.env.SCREENS ?? "hoy,captura,busqueda").split(",");
const estados = (process.env.ESTADOS ?? "normal").split(",");
const themes = (process.env.THEMES ?? "dark,light").split(",");
const devs = (process.env.DEVICES ?? "honor,escritorio").split(",");
const out = process.env.OUT ?? "capturas";

for (const dev of devs) for (const comp of comps) for (const screen of screens) for (const estado of estados) for (const theme of themes) {
  const name = `${comp}-${screen}-${estado}-${theme}-${dev}`;
  test(name, async ({ browser }) => {
    const ctx = await browser.newContext({ ...devices[dev], colorScheme: theme, reducedMotion: "reduce", locale: "es-ES" });
    const page = await ctx.newPage();
    await page.goto(`/?comp=${comp}&screen=${screen}&estado=${estado}&theme=${theme}&bare`);
    await page.waitForTimeout(400);
    const ext = process.env.FORMAT === "jpeg" ? "jpg" : "png";
    await page.screenshot({ path: `${out}/${name}.${ext}`, fullPage: process.env.FULL === "1", ...(ext === "jpg" ? { type: "jpeg", quality: 82 } : {}) });
    await ctx.close();
  });
}
