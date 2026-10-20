# Paso 1 de la primera versión: base técnica

Fecha: 19-10-2026. Etiquetas: [H] comprobado, [I] inferencia, [P] propuesta.

## Recorrido y criterios de aceptación
- Abres Pauta en el navegador del Mac, Windows o móvil y ves **Hoy** con tu día: eventos de ejemplo y tus tareas reales.
- Apuntas una tarea con ⌘K o con el ＋ («llamar a la gestoría el lunes»); queda guardada en el dispositivo, la ves en Tareas y en Hoy, y la completas.
- Recorres Calendario (día, semana, mes, año), Finanzas (ejemplo), Asistente (maqueta, sin conectar) y Ajustes.
- Criterios:
  - mismas pantallas en escritorio y móvil;
  - tema claro, oscuro y el del sistema;
  - todo lo que no es real dice «ejemplo»;
  - sin cuentas ni claves;
  - sin servicios de pago;
  - funciona sin conexión una vez cargada;
  - accesible con teclado.

## Versiones (npm, consultadas el 19-10-2026)
| Paquete | Versión | Nota |
|---|---|---|
| astro | 7.4.1 | Pide Node ≥ 22.22.0; aquí hay 22.22.0 [H `npm view astro@7.4.1 engines`] |
| svelte | 5.57.2 | Igual que el prototipo [H] |
| @astrojs/svelte | 9.1.0 | [H] |
| @playwright/test | 1.56.1 (fijada) | Hay 1.64.1, pero 1.56.1 usa el Chromium ya instalado (`chromium-1194`), sin descargas [H] |
| @tauri-apps/cli | 2.12.3 | Para el paso 3. Tauri sirve cualquier salida estática (SSG, SPA o MPA); no admite SSR [H v2.tauri.app/start/frontend, 19-10-2026] |

## Decisiones técnicas [P]
1. **Carpeta `app/`**, separada del prototipo desechable (`prototype/`).
2. **Una sola página de Astro** con la app en Svelte (`client:only`) y rutas con `#/…`.
   - Salida estática, que es lo que Tauri necesita.
   - Navegar entre sectores no recarga la página.
3. **Sistema de diseño importado desde `diseno/sistema/`** (`tokens.css`, `components/bundle.css` y la fuente Inter), sin copias. Una sola fuente de verdad.
4. **Iconos**: los que usa la app, sacados de Lucide 1.50.0 (licencia ISC) en `app/src/lib/iconos.js`. Así no añadimos la dependencia `lucide-svelte`.
5. **Tareas guardadas en el dispositivo con IndexedDB**, detrás de una interfaz `almacen` que luego podrá usar SQLite (D-041).
   - IndexedDB, con envoltorio propio y sin dependencias: asíncrono, sin límite práctico para tareas y disponible en WKWebView, WebView2 y Android WebView [I por ser estándar web; se comprobará en el paso 3].
   - SQLite en WebAssembly (`@sqlite.org/sqlite-wasm` 3.54.1): es el mismo motor que en Tauri, pero suma ~1 MB y complica el almacenamiento en el navegador (OPFS). Mejor cuando llegue la sincronización.
   - `localStorage`: síncrono y limitado a ~5 MB. Descartado.
   - `idb` (8.0.4) o `dexie` (4.4.6): ahorran poco código frente a un envoltorio de 60 líneas.
6. **Fechas sin bibliotecas**: días como texto `AAAA-MM-DD` y aritmética de calendario en local. `Temporal` llegará con la sincronización y las zonas horarias.
7. **Analizador propio de fechas en español** para «Apuntar», determinista (D-002): hoy, mañana, pasado mañana, días de la semana, «el lunes que viene», «el 3 de noviembre», «dentro de dos semanas», horas y rangos. Si la hora es ambigua («a las 9»), pregunta. Lo prueban los casos de evento del banco del asistente.
8. **Datos de ejemplo relativos a hoy**: los eventos de las tres cuentas se generan alrededor de la fecha real para que la app parezca viva, y llevan la marca «ejemplo».
   - Excepción: el ensayo de cada viernes de 21:30 a 23:30 es un hecho real (P-001: calendario sin confirmar).
9. **Pruebas** con `node --test` (sin dependencias) para fechas y tareas, y Playwright para capturas en móvil y escritorio.
