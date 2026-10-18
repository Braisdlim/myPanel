# Documento vivo: decisiones, supuestos, fuentes y pendientes

Última actualización: 18-10-2026 (fase 0, primera ronda).
Detalle y evidencias de esta ronda: [`fase-0/investigacion-y-propuesta.md`](fase-0/investigacion-y-propuesta.md).

Estados: **Propuesta** (pendiente de tu revisión) · **Aceptada** · **Rechazada** · **Sustituida**.

## Decisiones

| ID | Decisión | Estado | Motivo y evidencia | Revisar cuando |
|---|---|---|---|---|
| D-001 | App para una sola persona; sin multi-tenant. | Propuesta | Alcance del encargo. | — |
| D-002 | Núcleo (Hoy, captura, backlog, calendario, búsqueda exacta) sin llamadas a IA. | Propuesta | Encargo + coste 0 €. Prueba chrono-es: el parser determinista necesita reglas propias y vista previa. | Fase 3 |
| D-003 | Componentes de interfaz en Svelte 5. | Propuesta | Portables entre Astro 7 (`@astrojs/svelte` 9.1.0) y SvelteKit 3; bundles pequeños. | Prueba 0c |
| D-004 | Contenedor provisional SvelteKit 3; Astro 7 compite en una prueba de un día; si empata, gana Astro. | Propuesta | *Layouts* persistentes, invalidación, SW integrado frente a estado y SW manuales en Astro; `@vite-pwa/astro` no declara Astro ≥ 6. | Prueba 0c |
| D-005 | SQLite + Drizzle; caché IndexedDB + cola de salida en el cliente; sin motor *local-first*. | Propuesta | Una sola persona; portabilidad D1/libSQL/archivo. | Si aparecen conflictos de sincronización |
| D-006 | Separar inicio de sesión en la app (passkey + Google limitado a tu correo) de las conexiones de datos (N cuentas Google, tokens cifrados). | Propuesta | Mínimo privilegio y procedencia por cuenta. | Fase 1b |
| D-007 | Proyecto Google Cloud propio en «In production» sin verificar (uso personal). | Propuesta | Testing caduca tokens a 7 días; exención de uso personal < 100 usuarios. Hipótesis a probar. | Prueba 0c |
| D-008 | Permisos incrementales por cuenta: calendario en la fase 1; Gmail/Drive (restringidos) solo en la fase 2 y en cuentas elegidas. | Propuesta | Clasificación oficial de permisos. | Fase 2 |
| D-009 | Google Calendar es la fuente de verdad de los eventos; la flexibilidad es un metadato propio. Toda excepción se aplica por ocurrencia. | Propuesta | API de excepciones por instancia (`originalStartTime`). | Fase 1c |
| D-010 | Dictado en la fase 1 mediante el teclado del sistema, no la Web Speech API. | Propuesta | Web Speech en Chrome usa la nube por defecto; en el dispositivo solo en escritorio. | Fase 3 |
| D-011 | Sin widget PWA: accesos directos del manifiesto y *share target* en la fase 1; widget nativo (Glance) en la fase 5 si aporta. | Propuesta | No hay widgets de PWA en Android. | Fase 5 |
| D-012 | Tema: Sistema / Oscuro / Claro, diseñado primero en oscuro. | Propuesta | Encargo. | Tras prototipo |
| D-013 | Playwright desde el prototipo; Figma MCP no; Astro Docs MCP o Svelte MCP según D-004. | Propuesta | Ver 3.8 del informe. | Prueba 0c |

## Supuestos

| ID | Supuesto | Cómo se comprobará |
|---|---|---|
| S-001 | Zona horaria Europe/Madrid. | Pregunta / ajustes del calendario. |
| S-002 | El Honor tiene Chrome y servicios de Google Play (instalación WebAPK). | Pregunta 5 + prueba en el dispositivo. |
| S-003 | Un token de app no verificada en producción no caduca a los 7 días. | Prueba 0c: token vivo el día 8. |
| S-004 | Ninguna cuenta Workspace bloquea apps no verificadas. | Pregunta 2. |

## Hechos de ejemplo que NO son datos

- «Toca el saxofón»: ejemplo hipotético del encargo. **No guardar como hecho.**

## Pendientes (abiertos)

| ID | Pendiente | Bloquea |
|---|---|---|
| P-001 | ¿Ensayo 09:30–11:30 o 21:30–23:30? ¿En qué calendario? | Datos del prototipo (se mantiene ambiguo a propósito), fase 1c |
| P-002 | Número y tipo de cuentas Google; cuáles con escritura. | Fase 1b |
| P-003 | ¿Equipo siempre encendido? Si no, ¿Cloudflare aceptable? | D-005 despliegue |
| P-004 | Proveedor y plan de la suscripción «cloud». | Fase 3 |
| P-005 | Modelo del Honor, Android/MagicOS, navegador. | Pruebas móviles reales |
| P-006 | Procedimiento formal de vacaciones en el trabajo. | Fase 4 |
| P-007 | Enlace de la barbería en Yeasy. | Fase 4 |
| P-008 | Ver las capturas de referencia (bloqueadas por la red del entorno). | Cerrar el análisis visual 3.1 |
| P-009 | Confirmar límites gratuitos de D1 y Turso en sus páginas oficiales. | D-005 |

## Registro de investigación

| Fecha | Tema | Resultado |
|---|---|---|
| 18-10-2026 | Fase 0: frameworks, Android, Google OAuth, despliegue, IA, referencias | Informe de la fase 0. Red del entorno bloqueó la lectura directa de webs; se usó buscador + npm. |
| 18-10-2026 | Parser de fechas en español (chrono-node 2.10.3) | 5/10 aciertos completos; ver `research/chrono-es/`. |
