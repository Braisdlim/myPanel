# Pauta — la app (primera versión, paso 3 bis)

Astro 7.4.1 + Svelte 5.57.2, con el sistema de diseño de `../diseno/sistema/` (importado, sin copias).

## Qué funciona y qué es de ejemplo
| Parte | Estado |
|---|---|
| **Tareas** (Entrada, Hoy, Programadas, En cualquier momento, Algún día, Registro, proyectos, detalle con fecha, hora, duración, fecha límite, notas y pasos) | **Real**: se guardan en este dispositivo (IndexedDB) |
| **Apuntar** (⌘K / Ctrl+K o ＋) con fechas en español sin IA; si algo es ambiguo, pregunta | **Real**: guarda tareas o, si activas «Crear eventos» en una cuenta, crea el evento en Google tras pulsar «Crear en …» y lo relee (D-050) |
| **Cuentas de Google** (Ajustes › Cuentas): conectar varias, elegir calendarios, actualizar, renombrar, desconectar y activar «Crear eventos» | **Real** (D-049, D-050); los eventos repetidos entre calendarios se ven una vez (D-051). El ID de cliente del proyecto va en `src/lib/google.js`; otro, en `app/.env` ([guía](../docs/guias/conectar-google-calendar.md)) |
| **Hoy**: tiempo libre, eventos, tareas, lo siguiente, avisos, huecos | Real con tus tareas y, si conectas Google, con tus eventos |
| **Calendario** (día, semana, mes, año) | Real con tus cuentas de Google; en el detalle, «Mover esta vez», «Saltar esta vez» (calendarios tuyos) o «No voy esta vez» (solo en Pauta) (D-052); sin cuentas, ejemplo (Gmail 1, Gmail 2 y Outlook inventados alrededor de la fecha real) |
| **Finanzas** | Ejemplo: tres fondos inventados |
| **Pide atención** | Real con tus tareas (atrasadas, fechas límite) y los solapes entre tus cuentas; fondos de ejemplo |
| **Asistente** | Maqueta sin conectar (D-047) |
| **Ajustes**: tema, cuentas, avisos, asistente, privacidad (descargar copia, borrar todo) | Tema, cuentas de Google y privacidad reales; el resto, informativo |

Todo lo que no es real lleva la etiqueta «ejemplo». El ensayo de los viernes (21:30–23:30) es un hecho real; está en calendarios compartidos de tu primera cuenta (P-001), que aparecen unidos en uno (D-051). Al conectar Google, los calendarios de ejemplo desaparecen (también ese ensayo, que vendrá de tu calendario).

## Uso
```sh
npm install
npm run dev          # http://localhost:4321
npm run build && npx astro preview --port 4330
npm test             # pruebas de fechas, analizador, tareas, Google Calendar, paso 3 y 3 bis (node --test)
npm run build:pruebas && npx playwright test   # revisión (contraste, táctil, consola) y recorridos con Google imitado; la primera vez: npx playwright install chromium
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
