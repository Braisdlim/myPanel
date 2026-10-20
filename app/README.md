# Pauta — la app (primera versión, paso 2)

Astro 7.4.1 + Svelte 5.57.2, con el sistema de diseño de `../diseno/sistema/` (importado, sin copias).

## Qué funciona y qué es de ejemplo
| Parte | Estado |
|---|---|
| **Tareas** (Entrada, Hoy, Programadas, En cualquier momento, Algún día, Registro, proyectos, detalle con fecha, hora, duración, fecha límite, notas y pasos) | **Real**: se guardan en este dispositivo (IndexedDB) |
| **Apuntar** (⌘K / Ctrl+K o ＋) con fechas en español sin IA; si algo es ambiguo, pregunta | **Real** (guarda tareas; los eventos de calendario llegarán al conectar cuentas) |
| **Cuentas de Google** (Ajustes › Cuentas): conectar varias, elegir calendarios, actualizar, renombrar, desconectar | **Real, solo lectura** (D-049). El ID de cliente del proyecto va en `src/lib/google.js`; otro, en `app/.env` ([guía](../docs/guias/conectar-google-calendar.md)) |
| **Hoy**: tiempo libre, eventos, tareas, lo siguiente, avisos, huecos | Real con tus tareas y, si conectas Google, con tus eventos |
| **Calendario** (día, semana, mes, año) | Real con tus cuentas de Google; sin cuentas, ejemplo (Gmail 1, Gmail 2 y Outlook inventados alrededor de la fecha real) |
| **Finanzas** | Ejemplo: tres fondos inventados |
| **Pide atención** | Real con tus tareas (atrasadas, fechas límite) y los solapes entre tus cuentas; fondos de ejemplo |
| **Asistente** | Maqueta sin conectar (D-047) |
| **Ajustes**: tema, cuentas, avisos, asistente, privacidad (descargar copia, borrar todo) | Tema, cuentas de Google y privacidad reales; el resto, informativo |

Todo lo que no es real lleva la etiqueta «ejemplo». El ensayo de los viernes (21:30–23:30) es un hecho real; su cuenta está por confirmar (P-001). Al conectar Google, los calendarios de ejemplo desaparecen (también ese ensayo, que vendrá de tu calendario).

## Uso
```sh
npm install
npm run dev          # http://localhost:4321
npm run build && npx astro preview --port 4330
npm test             # pruebas de fechas, analizador, tareas y Google Calendar (node --test)
npm run build:pruebas && PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx playwright test   # capturas y revisión (contraste, táctil, consola) y el recorrido con Google imitado
```
`build:pruebas` compila con el ID de cliente falso de `.env.pruebas` para que el botón «Conectar Google» funcione contra las imitaciones de `pruebas/google.spec.js`; nunca llama a Google.
`npm run vista-previa -- <carpeta>` prepara la página privada de claude.ai (vista previa: https://claude.ai/artifact/TZbZd7bVhQfpRPeuQqVLqN). Allí no funcionan «Descargar una copia» (el visor bloquea las descargas) y los datos se guardan solo en ese navegador.

Las capturas se guardan en `capturas/` (no van al repositorio). Variables: `THEMES=dark,light`, `FORMAT=png|jpeg`.

## Estructura
- `src/App.svelte`: carcasa (barra superior y lateral en el escritorio, pestañas con ＋ en el móvil), rutas `#/sector/…`, tema y ⌘K.
- `src/sectores/`: una pantalla por sector.
- `src/componentes/`: Apuntar, detalle y fila de tarea, rejilla de tiempo, disposición con inspector, barra lateral e iconos.
- `src/lib/`: fechas, analizador, tareas, almacén local, estado y datos de ejemplo; `google.js` (permiso y API de Calendar), `calendario.js` (une las cuentas) y `agenda.svelte.js` (lo que ven las pantallas: real o de ejemplo). `iconos.js` sale de Lucide 1.50.0 (ISC).
- `pruebas/`: pruebas unitarias (`*.test.mjs`) y de Playwright (`*.spec.js`).
