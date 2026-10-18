# Documento vivo: decisiones, supuestos, fuentes y pendientes

Última actualización: 18-10-2026 (fase 0b: prototipo).
Detalle: [`fase-0/investigacion-y-propuesta.md`](fase-0/investigacion-y-propuesta.md) y [`fase-0/prototipo-y-herramientas.md`](fase-0/prototipo-y-herramientas.md).

Estados: **Propuesta** (pendiente de tu revisión) · **Aceptada** · **Rechazada** · **Sustituida**.

## Decisiones

| ID | Decisión | Estado | Motivo y evidencia | Revisar cuando |
|---|---|---|---|---|
| D-001 | App para una sola persona; sin multi-tenant. | Propuesta | Alcance del encargo. | — |
| D-002 | Núcleo (Hoy, captura, backlog, calendario, búsqueda exacta) sin llamadas a IA. | Propuesta | Encargo + coste 0 €. Prueba chrono-es: el parser determinista necesita reglas propias y vista previa. | Fase 3 |
| D-003 | Componentes de interfaz en Svelte 5. | Aceptada | Prototipo hecho con Svelte 5.57.2 en Astro: ~36 KB de JS comprimido. | — |
| D-004 | **Astro 7** (con islas Svelte 5) como base de la app. | Aceptada (decisión del usuario, 18-10-2026) | Encaja tras el prototipo. Costes asumidos: *service worker* y refresco de datos a mano; `@vite-pwa/astro` no declara Astro ≥ 6. | Si el offline o el estado compartido se complican en la fase 1a |
| D-005 | SQLite + Drizzle; caché IndexedDB + cola de salida en el cliente; sin motor *local-first*. | Propuesta | Una sola persona; portabilidad D1/libSQL/archivo. | Si aparecen conflictos de sincronización |
| D-006 | Separar inicio de sesión en la app (passkey + Google limitado a tu correo) de las conexiones de datos (N cuentas Google, tokens cifrados). | Propuesta | Mínimo privilegio y procedencia por cuenta. | Fase 1b |
| D-007 | Proyecto Google Cloud propio en «In production» sin verificar (uso personal). | Propuesta | Testing caduca tokens a 7 días; exención de uso personal < 100 usuarios. Hipótesis a probar. | Prueba 0c |
| D-008 | Permisos incrementales por cuenta: calendario en la fase 1; Gmail/Drive (restringidos) solo en la fase 2 y en cuentas elegidas. | Propuesta | Clasificación oficial de permisos. | Fase 2 |
| D-009 | Google Calendar es la fuente de verdad de los eventos; la flexibilidad es un metadato propio. Toda excepción se aplica por ocurrencia. | Propuesta | API de excepciones por instancia (`originalStartTime`). | Fase 1c |
| D-010 | Dictado en la fase 1 mediante el teclado del sistema, no la Web Speech API. | Propuesta | Web Speech en Chrome usa la nube por defecto; en el dispositivo solo en escritorio. | Fase 3 |
| D-011 | Sin widget PWA: accesos directos del manifiesto y *share target* en la fase 1; widget nativo (Glance) en la fase 5 si aporta. | Propuesta | No hay widgets de PWA en Android. | Fase 5 |
| D-012 | Tema: Sistema / Oscuro / Claro, diseñado primero en oscuro. | Propuesta | Encargo. | Tras prototipo |
| D-013 | Ayudas del agente: plugin oficial `frontend-design`, Astro Docs MCP (`.mcp.json`), skills propias (`diseno-mypanel`, `revision-visual`, `investigar-antes-de-construir`), Playwright. No: Figma MCP, `incluud/astro-agent-skills`, `FredKSchott/astro-skills`. Svelte MCP se evalúa en la fase 1. | Aceptada | Contenido de cada una leído (ver fase 0b, sección 3). | Fase 1 |
| D-014 | La app no tramita vacaciones: solo apunta días libres y puede recordar pedirlos en el portal de la empresa. | Aceptada | El usuario usa el portal corporativo desde el PC de empresa. | — |
| D-015 | Dos cuentas de Gmail personales desde el diseño inicial. | Aceptada | Respuesta del usuario. | — |
| D-016 | Tokens de diseño (borrador): oscuro primero, un acento ámbar, colores de cuenta azul y lila, Figtree. | Propuesta | Prototipo + script de contraste (todos ≥ 4,5:1 en texto). | Tras elegir composición |
| D-017 | NAS: no necesario en la fase 1; decidir antes de la fase 2 (índice local, modelos pequeños, automatización de navegador). Código portable Cloudflare/Node. | Propuesta | Análisis en fase 0b, sección 2. | Antes de la fase 2 |

## Supuestos

| ID | Supuesto | Cómo se comprobará |
|---|---|---|
| S-001 | Zona horaria Europe/Madrid. | Pregunta / ajustes del calendario. |
| S-002 | El Honor 600 Pro (MagicOS 10, Android 16, con Google Play) instala la app como WebAPK desde Chrome; ancho CSS ~412–421 px. | Prueba en el dispositivo en la fase 1a. |
| S-003 | Un token de app no verificada en producción no caduca a los 7 días. | Prueba 0c: token vivo el día 8. |
| S-004 | Ninguna cuenta Workspace bloquea apps no verificadas. | Resuelto: son dos cuentas personales de Gmail. |

## Hechos de ejemplo que NO son datos

- «Toca el saxofón»: ejemplo hipotético del encargo. **No guardar como hecho.**

## Pendientes (abiertos)

| ID | Pendiente | Bloquea |
|---|---|---|
| P-001 | ~~¿Ensayo de mañana o de noche?~~ Resuelto: 21:30–23:30. Falta saber en qué calendario está. | Fase 1c |
| P-002 | Dos Gmail personales. Falta: en cuáles permitir escritura. | Fase 1b |
| P-003 | ¿NAS o Cloudflare? Ver D-017. | Antes de la fase 2 |
| P-004 | Proveedor y plan de la suscripción «cloud». | Fase 3 |
| P-005 | ~~Modelo del móvil~~ Resuelto: Honor 600 Pro con Google Play. Falta confirmar el navegador (supongo Chrome). | Fase 1a |
| P-006 | ~~Vacaciones formales~~ Resuelto: fuera del alcance (D-014). | — |
| P-007 | Enlace de la barbería en Yeasy. | Fase 4 |
| P-008 | Ver las capturas de referencia (bloqueadas por la red del entorno). | Cerrar el análisis visual 3.1 |
| P-009 | Confirmar límites gratuitos de D1 y Turso en sus páginas oficiales. | D-005 |

| P-010 | Elegir composición (A, B, C o mezcla), tipografía y acento. | Congelar tokens, fase 1a |

## Registro de investigación

| Fecha | Tema | Resultado |
|---|---|---|
| 18-10-2026 | Fase 0: frameworks, Android, Google OAuth, despliegue, IA, referencias | Informe de la fase 0. Red del entorno bloqueó la lectura directa de webs; se usó buscador + npm. |
| 18-10-2026 | Parser de fechas en español (chrono-node 2.10.3) | 5/10 aciertos completos; ver `research/chrono-es/`. |
| 18-10-2026 | Skills y MCP para Astro + IA; NAS; Honor 600 Pro | Leídos `frontend-design` (oficial), `incluud/astro-agent-skills`, `FredKSchott/astro-skills` y la documentación oficial de Astro (repositorio `withastro/docs`). |
| 18-10-2026 | Prototipo en Astro 7.4 + Svelte 5 | 3 composiciones, 52 capturas, contraste comprobado; publicado como página privada. |
