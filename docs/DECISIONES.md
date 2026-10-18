# Documento vivo: decisiones, supuestos, fuentes y pendientes

Última actualización: 18-10-2026 (Finanzas y Hoy aprobadas; interruptor en el sistema; maquetas del Calendario pendientes de revisión).
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
| D-027 | Finanzas calcada de Bolsa: en el Mac, barra lateral + lista de fondos + detalle (inspector oculto); en Android, lista con título grande y detalle en hoja. Sin «1D»; aportaciones en la franja del volumen; regla de aviso en lugar de noticias. Gráfico del valor liquidativo verde o rojo según el periodo, como Bolsa (petición del usuario). | Aceptada (usuario: «Finanzas listo», 18-10-2026) | Maquetas en `diseno/maquetas/finanzas/` y lienzo https://claude.ai/artifact/1Dmp1APhbBSL1Y1F3NuNAU | Al responder P-024 |
| D-028 | Datos financieros en dos niveles: A) importar los ficheros que descargas (CaixaBank, MyInvestor, Trade Republic) como base; B) opcional, PSD2 de solo lectura con Enable Banking en modo restringido (gratis, cuentas propias). Descartadas: API no oficial de Trade Republic, rascado con credenciales, apps agregadoras. Datos financieros solo en Mac o NAS, cifrados. Valor liquidativo: EODHD gratis + web de la gestora. | Aplazada (documentada; el usuario decide no implementarla todavía, 18-10-2026) | `producto/08` | Cuando se retome Finanzas en código |
| D-029 | Seguimiento de aportaciones mensuales: eliges fondos o ETF (buscador por nombre o ISIN), importe, día y desde dónde aportas (MyInvestor, Trade Republic u otro). Pauta recuerda la aportación, pregunta ese día si se hizo y suma lo aportado; nunca compra. El buscador necesita una fuente de datos de fondos (aplazada con D-028). | Propuesta (petición del usuario) | Maquetas `MacAnadir` y `AndroidAnadir` | Al revisar el lienzo |
| D-030 | Gráficos financieros como Bolsa: verde si el periodo sube, rojo si baja, contra el valor de partida (línea punteada) y con degradado; acento solo al inspeccionar; píldoras sólidas en listas (colores `on-gain`/`on-loss`, contraste comprobado). | Aceptada (petición del usuario) | Capturas oficiales de Bolsa; sistema de diseño versión 2 | — |
| D-031 | «Hoy» calcado de Things 3: en el Mac, barra lateral + lista del día + inspector (lo siguiente, pide atención, tu dinero hoy); en Android, título grande, lista y pestañas. Se añaden la barra de capacidad (tiempo libre hasta el ensayo), duración en cada tarea y «Planificar el día»: eliges tareas y Pauta propone dónde caben (Sunsama en el Mac, línea del día de Structured en Android). Lo propuesto va en acento con borde discontinuo hasta que lo guardas. Escribir el plan en Google Calendar queda desactivado por defecto y sin cuenta elegida (P-020). | Aceptada (usuario: «Hoy listo», 18-10-2026) | Maquetas en `diseno/maquetas/hoy/` y lienzo https://claude.ai/artifact/8GLyXqURLfdiLKDDpgec8h | Al responder P-026 |
| D-032 | Componente Interruptor (`pa-switch`, `pa-toggle`) en el sistema de diseño, con el color nuevo `switch-knob`: pista `border-control` apagado y `accent` encendido. Si al encenderlo se escribe en un servicio externo, empieza apagado y la escritura se confirma aparte con la cuenta de destino. | Aceptada (petición del usuario, 18-10-2026) | Contraste comprobado con `diseno/colores.py` (4,38:1 y 3,31:1); tokens versión 3 | — |
| D-033 | Calendario calcado de Fantastical: en el Mac, barra lateral con sectores, mini mes y cuentas + semana en rejilla + inspector; en Android, mes con puntos y lista debajo. Escalas Día · Semana · Mes · Año (D S M A); ⌘K para buscar y apuntar; sin el tiempo. Se añaden la pregunta ante horas ambiguas, la cuenta de destino a la vista, los cambios por ocurrencia («Mover esta vez», «Saltar esta vez»; la serie aparte), los conflictos explicados y el año como mapa de horas. | Propuesta | Maquetas en `diseno/maquetas/calendario/` y lienzo https://claude.ai/artifact/6Ca6kZvoyEtp3K4d2xW6G7 | Al responder P-027 |
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
- Día de ejemplo de maquetas y fichas: **viernes 23 de octubre de 2026** (antes ponía «viernes 24», que en 2026 es sábado; corregido el 18-10-2026). Todo lo demás de ese día es inventado salvo el ensayo de los viernes de 21:30 a 23:30.

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
| P-013 | ~~Entidades y gastos~~ Resuelto en parte: MyInvestor, Trade Republic y CaixaBank; sí a gastos y patrimonio. Faltan los ISIN de tus fondos. | Conectores de finanzas |
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
| P-024 | ~~Revisar las maquetas de Finanzas~~ Resuelto: aprobadas («Finanzas listo», 18-10-2026). | — |
| P-025 | (Aplazado) Aprobar los niveles A/B de datos financieros y hacer las pruebas: un fichero por entidad (anonimizado), cuenta de Enable Banking (la creas tú) y clave gratuita de EODHD. | Conectores de finanzas |
| P-026 | ~~Revisar las maquetas de «Hoy»~~ Resuelto: aprobadas («Hoy listo», 18-10-2026); el interruptor pasa al sistema (D-032) y el estado «propuesta» sigue en las maquetas. | — |
| P-027 | Revisar las maquetas del Calendario (lienzo): barra lateral con mini mes, inspector con el evento elegido, año como mapa de horas y cómo se propone la cuenta al apuntar (relacionado con P-020). | Maquetas de Tareas y código del Calendario |
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
| 18-10-2026 | Datos financieros (bancos, brókers, valores liquidativos) | Enable Banking: modo restringido gratis para cuentas propias, AISP supervisado por la FIN-FSA, JWT RS256, sin categorización (FAQ y referencia oficiales). Trade Republic: API PSD2 oficial solo para TPP con licencia (guía 2.1, julio de 2026) y CSV desde abril de 2026. MyInvestor: PSD2 vía Redsys. GoCardless sin altas desde julio de 2025. EODHD gratis: 20 llamadas/día, 1 año. CNMV: valores diarios en fichero mensual, solo fondos españoles. Ver `producto/08`. |
| 18-10-2026 | Color de los gráficos en Bolsa y aportaciones mensuales | Bolsa colorea línea y degradado según el resultado del periodo frente a la línea punteada de partida; pasa a un color neutro al inspeccionar y apaga lo que queda fuera de un tramo (capturas oficiales de la guía del Mac y la App Store). Sistema de diseño v2 y maquetas actualizadas; nuevas pantallas para añadir fondos o ETF con aportación mensual. |
| 18-10-2026 | Maquetas de «Hoy» | Anatomía de Things 3 para Mac (captura oficial de la App Store) y referencias de Things en iPhone, Sunsama, Structured y Notion Calendar; 6 tableros (Mac oscuro, claro y planificar; Android hoy, planificar y claro). Cifras de ejemplo que cuadran: 1 h elegida y 6 h 50 min libres entre las 9:40 y el ensayo. |
| 18-10-2026 | Maquetas del Calendario | Ficha de Fantastical en el Mac App Store de España consultada el 18-10-2026: versión 4.2.3, requiere macOS 12.4, gratis con suscripción Flexibits Premium; describe vistas de día, semana, mes y año, miniventana con atajo y «escriba los detalles de su evento o tarea y pulse volver». El tiempo viene de AccuWeather (3 días gratis, 10 con Premium). Anatomía sobre su captura oficial en oscuro; 8 tableros (Mac semana oscuro y claro, apuntar, año; Android mes oscuro y claro, apuntar, cambiar solo este viernes). Día de ejemplo corregido: el 24 de octubre de 2026 es sábado, se usa el viernes 23. El 25 de octubre de 2026 es el último domingo de octubre (cambio de hora). |
