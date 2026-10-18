---
name: revision-visual
description: Revisión visual de pantallas de myPanel con Playwright en móvil Android y escritorio, temas oscuro y claro, y estados vacío/cargando/error/conflicto.
---

1. Arranca la app o el prototipo en local. Prototipo: `cd prototype && npx astro build`, y luego `PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx playwright test` (variables `COMPS`, `SCREENS`, `ESTADOS`, `THEMES`, `DEVICES`, `OUT`, `FORMAT=jpeg`).
2. Con Playwright (Chromium ya instalado en `/opt/pw-browsers`; no ejecutes `playwright install`), captura cada pantalla en 360×800, 412×915 (táctil, `isMobile`) y 1440×900, con `colorScheme` `dark` y `light`, y con `reducedMotion: 'reduce'`.
3. Incluye los estados: vacío, cargando, error (cuenta desconectada) y conflicto.
4. Comprueba y anota:
   - Contraste de texto ≥ 4,5:1 e indicadores ≥ 3:1.
   - Objetivos táctiles ≥ 48×48 px en móvil.
   - Máximo 7 elementos visibles en Hoy en 360×800 sin desplazar.
   - Origen de cuenta visible con texto, no solo color.
   - Horas ambiguas señaladas.
   - Navegación completa con teclado y foco visible.
5. Mira tú mismo las capturas (Read sobre el PNG) antes de declarar que algo está bien. Guarda la hoja de contacto en `docs/<fase>/capturas/`.
