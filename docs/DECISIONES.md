# Documento vivo: decisiones, supuestos, fuentes y pendientes

Última actualización: 18-10-2026 (sistema de diseño de Pauta v1 publicado; siguiente paso: tres pantallas clave en código).
Detalle: [`fase-0/investigacion-y-propuesta.md`](fase-0/investigacion-y-propuesta.md) y [`fase-0/prototipo-y-herramientas.md`](fase-0/prototipo-y-herramientas.md) y [`fase-0/direccion-visual-v2.md`](fase-0/direccion-visual-v2.md).

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
| D-016 | ~~Tokens v1 (ámbar, Figtree)~~ Sustituida por D-018. | Sustituida | — | — |
| D-019 | **Diseño visual aparcado.** Nuevo orden: producto → arquitectura → plataforma → sistema de diseño → pantallas (etapas D1–D4). | Aceptada (petición del usuario) | Las dos rondas de diseño quedaron incompletas (sin calendario semanal ni mensual, sin finanzas). | — |
| D-020 | Alcance ampliado: sectores Calendario (día, semana, mes, año, agenda), Finanzas (patrimonio, fondos, precios) y Oportunidades (reglas de aviso definidas por el usuario, sin recomendaciones). | Propuesta | Petición del usuario; ver `producto/01` y `producto/02`. | Al cerrar D1 |
| D-021 | Arquitectura API primero: los clientes (web, Android, Mac) solo hablan con la API. | Propuesta | Permite añadir un cliente Mac nativo sin rehacer el servidor. | D2 |
| D-022 | Plataforma: provisionalmente web + carcasa Tauri en Mac (opción 2); alternativas PWA, nativa SwiftUI + Kotlin, Compose Multiplatform. | Decisión abierta | `producto/04`, sección 4.6. | D2 |
| D-018 | ~~Dirección visual v2: cristal oscuro con brillos ambientales, *bento* en escritorio, barra flotante en móvil, Outfit con pesos ligeros, acento lavanda en degradado; cuentas cielo y melocotón. Estructura: foco de C + captura de A + «Planificar» (línea del día de B).~~ Sustituida por D-024 y D-025. | Sustituida | — | — |
| D-023 | Proceso de diseño: síntesis → identidad → sistema de diseño (página + tokens en el repositorio) → tres pantallas en código. Sin Figma de momento. | Aceptada (usuario, 18-10-2026) | `producto/06`. Figma Starter con acceso limitado y Professional 16 $/mes por editor [H 18-10-2026]. | Al responder P-021 |
| D-024 | Identidad: nombre **Pauta**, tipografía **Inter**, acento **lavanda plano** sobre grafito frío (alternativas: myPanel/Norte, sistema/Geist, índigo/ámbar). | Aceptada (usuario, 18-10-2026) | `producto/06`; contraste comprobado en `research/identidad/`. Sustituiría a D-018 (v2). | Al responder P-021 |
| D-025 | Sistema de diseño Pauta v1 en `diseno/sistema/` (única fuente): 33 colores en oscuro y claro, 15 estilos de texto (escritorio y móvil), espacios, radios, sombras, medidas, 25 componentes `pa-*`, iconos Lucide 1.50.0 y logotipos. | Propuesta (pendiente de tu revisión) | Síntesis aprobada (`producto/06`); contraste de 112 pares comprobado; vistas previas en escritorio y a 412 px. Página: https://claude.ai/artifact/JXsNVroPQxnUhhwAZaB83m | Al revisar las tres pantallas clave |
| D-026 | Antes de programar: una app base por sector (Finanzas = Bolsa; propuesta: Calendario = Fantastical, Tareas y Hoy = Things 3), anatomía de su pantalla y calco con nuestro contenido en el lienzo de diseño de Claude; código solo de lo aprobado. | Aceptada (usuario, 18-10-2026) | `producto/07`; práctica 2026 según fuentes secundarias; Figma y Penpot como alternativas. | Al responder P-023 |
| D-027 | Finanzas calcada de Bolsa: en el Mac, barra lateral + lista de fondos + detalle (inspector oculto); en Android, lista con título grande y detalle en hoja. Sin «1D»; aportaciones en la franja del volumen; regla de aviso en lugar de noticias. | Propuesta | Maquetas en `diseno/maquetas/finanzas/` y lienzo https://claude.ai/artifact/1Dmp1APhbBSL1Y1F3NuNAU | Al responder P-024 |
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

| P-010 | ~~Revisar la v2~~ Sustituido por P-022. | — |
| P-012 | ~~«Financia»~~ Resuelto: es Bolsa (Stocks) de Apple. | — |
| P-013 | Entidades financieras (bancos, gestoras, brókers, ISIN) y si interesan también gastos e ingresos. | Conectores de finanzas |
| P-014 | ¿Mac personal? ¿Opción 2 o nativa? | D-022 |
| P-015 | Orden de prioridad de los sectores. | Hoja de ruta |
| P-016 | ¿Notas personales en alguna app? | Sector de búsqueda y conocimiento |
| P-017 | ~~Acceso de red para capturas~~ Resuelto: el usuario amplió el acceso de red. | — |
| P-019 | ~~Ideas de Finanzas~~ Resuelto en la síntesis (P-021). Siguen abiertos: gastos sí o no; entidades y fondos; umbrales de aviso. | Esquemas de Finanzas (D3) |
| P-018 | ~~Ideas del Calendario~~ Resuelto en la síntesis (P-021). | Esquemas del Calendario (D3) |
| P-020 | ~~Ideas de Tareas~~ Resuelto en la síntesis (P-021). Sigue abierto: si las tareas planificadas se escriben en Google Calendar y en qué cuenta. | Esquemas de Tareas (D3) |
| P-021 | ~~Síntesis, plan e identidad~~ Resuelto: todo lo recomendado aprobado (18-10-2026). | — |
| P-022 | Revisar el sistema de diseño Pauta v1 (página de revisión) y señalar qué cambiar antes de construir las pantallas. | Tres pantallas clave (paso 4) |
| P-023 | ~~Herramienta y apps base~~ Resuelto: lienzo de Claude; Fantastical, Things 3 y Bolsa. | — |
| P-024 | Revisar las maquetas de Finanzas (lienzo) y, en concreto, las tres columnas en el Mac. | Maquetas de Hoy y código de Finanzas |
| P-011 | Alojamiento de la fase 1a (Cloudflare gratis con cuenta del usuario, o esperar al NAS). | Despliegue de la fase 1a |

## Registro de investigación

| Fecha | Tema | Resultado |
|---|---|---|
| 18-10-2026 | Fase 0: frameworks, Android, Google OAuth, despliegue, IA, referencias | Informe de la fase 0. Red del entorno bloqueó la lectura directa de webs; se usó buscador + npm. |
| 18-10-2026 | Parser de fechas en español (chrono-node 2.10.3) | 5/10 aciertos completos; ver `research/chrono-es/`. |
| 18-10-2026 | Skills y MCP para Astro + IA; NAS; Honor 600 Pro | Leídos `frontend-design` (oficial), `incluud/astro-agent-skills`, `FredKSchott/astro-skills` y la documentación oficial de Astro (repositorio `withastro/docs`). |
| 18-10-2026 | Prototipo en Astro 7.4 + Svelte 5 | 3 composiciones, 52 capturas, contraste comprobado; publicado como página privada. |
| 18-10-2026 | Referencias visuales del usuario (3 paneles) | Dirección v2 implementada en el prototipo; enlace de Dribbble bloqueado por la red. |
| 18-10-2026 | Comparativa por sector (calendario, tareas, finanzas, búsqueda, memoria, Mac) y datos financieros en España | `docs/producto/`. GoCardless cerrado a cuentas nuevas; Enable Banking con producción restringida gratuita; PSD2 no cubre inversiones; sin fuente gratuita fiable de valores liquidativos por ISIN. |
| 18-10-2026 | Referencias visuales del Calendario (Fantastical, Notion Calendar, BusyCal, Reclaim) | Dossier `docs/referencias/calendario.md` y script de descarga; capturas bloqueadas por la red del entorno (solo GitHub accesible). |
| 18-10-2026 | Descarga de capturas del Calendario | 123 capturas reales (App Store y webs oficiales), 0 fallos; 20 seleccionadas en una página de revisión privada. |
| 18-10-2026 | Referencias de Finanzas (Bolsa, Copilot, Finary, getquin, Parqet, Ghostfolio, Fintonic) | 98 capturas reales, 0 fallos; 21 seleccionadas. getquin conecta con MyInvestor y no permite umbrales de aviso propios; Copilot solo en EE. UU.; guía de Bolsa ya en versión 8.0 para macOS 27. |
| 18-10-2026 | Referencias de Tareas (Things 3, Todoist, TickTick, Sunsama, Structured) | 118 capturas reales, 0 fallos; 24 seleccionadas. La captura de Todoist para Mac muestra el lenguaje natural resaltado con fichas (cubre el hueco de Fantastical). Ramble: fecha límite y duración por voz son de pago. Sunsama: unos 20 $/mes sin plan gratis (reseña). |
| 18-10-2026 | Síntesis de referencias e identidad | Reglas de unificación, 7 piezas compartidas y tabla por sector; 3 opciones de nombre, tipografía y paleta. Licencia de San Francisco solo para maquetas en sistemas Apple; Tauri usa WKWebView en macOS; Inter/Geist en Google Fonts; contraste de las 3 paletas ≥ 4,5:1. |
| 18-10-2026 | Sistema de diseño Pauta v1 | Revisadas de nuevo las capturas de referencia; Lucide 1.50.0 (ISC) y @fontsource-variable/inter 5.3.0 (OFL, ejes opsz 14–32 y wght 100–900, sin ⌘ en el subconjunto latino) comprobados en npm; icono adaptable de Android: lienzo 108 dp, zona segura 66 dp, capa monocroma (developer.android.com). Contraste de 112 pares OK. |
| 18-10-2026 | Método de maquetas y herramientas | Kit de macOS 27 para Figma y Sketch en Apple Design Resources; Penpot Professional a 0 $ con servidor MCP; Figma Starter limitado y Professional 16 $/mes; Mobbin Pro 15 $/mes sin biblioteca de Mac comprobada; Stitch gratis (reseñas). Ver `producto/07`. |
| 18-10-2026 | Maquetas de Finanzas | Anatomía de Bolsa con 26 capturas de la guía del Mac y 6 de la App Store; 8 tableros (Mac oscuro, claro y tramo; Android lista, detalle y claro; referencias). |
