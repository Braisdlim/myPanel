# Prototipo de la fase 0b

Prototipo **desechable** con datos ficticios para elegir la dirección visual. Astro 7.4 + Svelte 5.

- `npm install && npx astro build && npx astro preview` y abre `http://localhost:4321/?comp=a&screen=hoy&estado=normal`.
- Parámetros: `comp` (a, b, c), `screen` (hoy, captura, busqueda), `estado` (normal, vacio, cargando, error, conflicto), `theme` (dark, light), `font` (onest, system), `bare` (oculta los controles de revisión).
- Capturas: `PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx playwright test` (ver variables en `tests/capturas.spec.js`).
- Página única para el visor de claude.ai: `npx vite build --config artifact/vite.config.js && node artifact/build.mjs salida.html`.
