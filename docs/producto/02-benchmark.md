# 2. Comparativa: lo mejor de cada app, sector por sector

Fecha de consulta: **18-10-2026**. Etiquetas: [H·r] comprobado vía resumen de buscador de una fuente oficial; [H·s] fuente secundaria (reseñas o blogs); [I] mi conocimiento previo o inferencia, pendiente de comprobar. La red del entorno no me deja abrir las webs directamente; por eso casi todo es [H·r], [H·s] o [I].

Método: para cada sector, las apps de referencia, **qué hacen mejor** y **qué nos llevamos**. Al final de cada sector, la síntesis «nuestra versión».

---

## 2.1 Calendario

| App | Lo mejor | Qué tomamos | Evidencia |
|---|---|---|---|
| **Fantastical** | Lenguaje natural con vista previa al escribir; une Google, iCloud y Exchange; DayTicker (franja de días); escalas día, semana y mes | Escribir «cena con Ana el viernes a las 9» y ver el resultado antes de guardar; franja de días en móvil | [H·s] reseñas 2026 (timingapp, 2sync, machow2); MacStories |
| **Notion Calendar** | Teclado primero (paleta de comandos y atajos de una tecla); calendario en la barra de menús; varias zonas horarias; compartir disponibilidad | Paleta ⌘K y atajos; mini agenda en la barra de menús del Mac | [H·r] notas de versión de Notion (01-2024) |
| **BusyCal** | Tiempo de desplazamiento; **vista año con mapa de calor** | Vista año como mapa de calor de ocupación | [H·s] reseñas 2026; ficha de App Store |
| **Google Calendar** | Vistas día, semana, mes, año y agenda; búsqueda; base de tus datos | Las mismas escalas, con Google como fuente de verdad | [I] |
| **Apple Calendar** | Integración con el sistema, ligera y gratis; en macOS 26 sin novedades documentadas | Sencillez y respeto a las convenciones de macOS | [H·s] Take Control Books |
| **TickTick** | Tareas dentro del calendario (vistas lista, día, 3 días, semana, mes) | Tareas con hora dentro de las vistas del calendario | [H·s] comparativas 2026 |
| **Reclaim / Motion / Akiflow** | Bloques de tiempo y hábitos **flexibles** que se recolocan solos | Rutinas opcionales (tu ensayo) y propuestas de hueco; **sin** reorganizar nada sin permiso | [I] |
| **Morgen / Amie** | Calendario y tareas en una misma superficie | Arrastrar pendientes al calendario | [H·s] menciones breves |

**Nuestra versión**: vistas **día, semana, mes, año (mapa de calor) y agenda**, con cambio de escala fluido; varias cuentas con color y nombre; lenguaje natural con vista previa; tareas y huecos libres dentro del calendario; rutinas opcionales con excepciones por ocurrencia; paleta de comandos y atajos de teclado; mini agenda en la barra de menús del Mac.

## 2.2 Tareas y planificación del día

| App | Lo mejor | Qué tomamos | Evidencia |
|---|---|---|---|
| **Things 3** | La más cuidada en Apple; Quick Entry con atajo global; Hoy, Próximo y Algún día | Captura global; cubos claros (Hoy, Próximo, Algún día) | [H·s] comparativas 2026; [I] |
| **Todoist** | El mejor lenguaje natural para fechas | Calidad del intérprete de fechas | [H·s] |
| **TickTick** | Todo en uno: calendario, hábitos, Pomodoro y matriz de Eisenhower | Hábitos y rutinas dentro del mismo sistema | [H·s] |
| **Sunsama** | Ritual diario guiado para planificar | «Planificar el día» opcional por la mañana | [H·s] |
| **Structured** | Línea de tiempo visual del día | Vista «Planificar» con huecos | [H·s] |
| **Todoist Ramble** | Dictar frases largas y convertirlas en tareas | Captura por voz estructurada (fase 3, con IA) | [H·s] |

**Nuestra versión**: Hoy, Próximo y Pendientes (sin fecha); captura con lenguaje natural en español y preguntas si hay ambigüedad; arrastrar a huecos; rutinas y hábitos como compromisos flexibles; ritual de planificación opcional.

## 2.3 Finanzas e inversiones

| App | Lo mejor | Qué tomamos | Evidencia |
|---|---|---|---|
| **Bolsa (Stocks) de Apple** | Barra lateral con listas de seguimiento; gráficos interactivos por periodos; noticias; fecha de resultados con botón «añadir al calendario» | Lista de seguimiento en barra lateral; gráficos con periodo 1D/1S/1M/1A/Máx; **conectar finanzas con el calendario** | [H·r] Guía de uso de Bolsa para macOS |
| **Copilot Money** | Considerada de las más pulidas en Apple; patrimonio neto; inversiones incluidas | Nivel de acabado; patrimonio neto como cifra principal | [H·s] reseñas 2026 (EE. UU.; no conecta con bancos españoles) |
| **getquin** | Agrega bancos y brókers europeos (más de 2.000 según su ficha); calendario de dividendos; TIR; riesgo de cartera | Rentabilidad real (TIR o TWR); calendario de dividendos | [H·s] ficha de App Store y reseñas; hay quejas de exactitud |
| **Ghostfolio** (código abierto) | Autoalojable (AGPL-3.0); acciones, ETF, fondos y cripto; asignación por clase, región y divisa; multidivisa; API REST | **Posible motor de cartera dentro de tu NAS** en lugar de programarlo desde cero | [H·s] varias guías 2026 |
| **Fintonic** (España) | Agrega bancos españoles y categoriza gastos | Categorías de gasto en español | [I] |
| **Indexa Capital** | Token de acceso desde el área de cliente (Configuración → Aplicaciones), usado por un servidor MCP comunitario | Leer tu cartera de Indexa si eres cliente | [H·s] el servidor MCP no es oficial |

**Cómo llegarían los datos** (lo más delicado del sector):
- **Cuentas bancarias**: por open banking (PSD2). GoCardless Bank Account Data **ya no admite cuentas nuevas** (desde julio de 2025). **Enable Banking** ofrece un modo de producción restringido gratuito, limitado a cuentas que conectas tú mismo [H·s]. En España casi todos los bancos pasan por Redsys, que permite **una sola sesión activa por usuario** [H·r, documentación de Enable Banking].
- **Fondos y brókers**: PSD2 **no cubre inversiones**. Opciones: importar CSV o extractos, token propio de la entidad (Indexa), o apuntar las participaciones a mano y actualizar los precios.
- **Precios de fondos por ISIN**: no he encontrado una fuente gratuita y fiable para fondos UCITS. FundFacts tiene un plan gratuito de solo 15 consultas al mes; EODHD está orientado a EE. UU. Hay que mirar las condiciones de licencia [H·s]. Para unos pocos fondos con valor liquidativo diario, **una consulta al día por fondo** basta.

**Oportunidades**: reglas que **tú** defines por fondo (caída desde el máximo de N días, caída diaria superior a un umbral, recordatorio de aportación periódica). El aviso explica el dato («−5,2 % desde el máximo del 2 de octubre») y no recomienda nada.

**Nuestra versión**: patrimonio total y variación; fondos con gráfico por periodo; rentabilidad real; lista de seguimiento; reglas de aviso; aportaciones periódicas en el calendario; todo con fecha del último precio y su fuente.

## 2.4 Correo, documentos y búsqueda

| App | Lo mejor | Qué tomamos | Evidencia |
|---|---|---|---|
| **Gemini en Gmail y Drive** | Responde con base en tus correos, archivos y calendario | Referencia de lo que hace Google, aunque **cuenta por cuenta**; nuestro valor es unir las dos cuentas con procedencia | [H·s] |
| **Shortwave** | Búsqueda en lenguaje natural sobre Gmail («correos de Sara sobre precios del mes pasado») | Consultas naturales que se traducen a filtros exactos | [H·s] |
| **Superhuman** | Velocidad con teclado | Atajos y triaje rápido | [H·s] |
| **Raycast** | Lanzador de Mac con acciones y extensiones | Paleta de comandos y atajo global | [H·s] |
| **Khoj** (código abierto) | Búsqueda e IA sobre notas, PDF y documentos propios; puede funcionar en local | Motor de búsqueda por significado en el NAS (fase 2–3) | [H·s] |
| **iA Writer** | Buscar para navegar | Un solo campo para encontrar y saltar | [H·r] notas de versión |

**Nuestra versión**: un buscador que consulta Gmail y Drive de **las dos cuentas** en vivo, con operadores exactos; resultados con nombre, ubicación, cuenta, fecha, enlace y certeza; aviso de dónde **no** se ha buscado. Más adelante, índice propio y búsqueda por significado en el NAS.

## 2.5 Memoria y conocimiento personal

| Referencia | Lo mejor | Qué tomamos |
|---|---|---|
| Memoria de ChatGPT/Claude | Recordar preferencias entre conversaciones; ver y borrar recuerdos | Vista «Lo que sé de ti» editable [I] |
| Grafos temporales (Graphiti, Zep) y memorias como Mem0 | Hechos con validez en el tiempo («ensayaba los viernes hasta…») | Se evaluará con consultas de prueba en la fase 3; **no se elige ahora** [I] |
| Apple Notes, Obsidian, Notion | Notas propias | Pregunta abierta: ¿usas alguna? |

## 2.6 Acabado de app nativa de Mac (para cuando retomemos el diseño)

| Referencia | Qué tomamos | Evidencia |
|---|---|---|
| **Guía de interfaz de Apple (HIG) y Liquid Glass** | Barra lateral flotante; inspector a la derecha; barra de herramientas sobre cristal con controles agrupados; el contenido manda | [H·r] WWDC25, sesión 310; documentación de Liquid Glass |
| Things, Fantastical, Bolsa, Calendario | Convenciones de Mac: barra lateral, ⌘K, atajos, barra de menús, ventanas múltiples | [I] |

**Lección de las rondas de diseño anteriores**: el acabado premium sale de **respetar las convenciones de la plataforma** (barra lateral, inspector, barra de herramientas, atajos y menús) más que de efectos. Por eso la decisión de plataforma (documento 4) va antes que el diseño.

## Fuentes principales
- Calendario: https://timingapp.com/blog/best-calendar-apps-for-mac/ · https://2sync.com/blog/best-calendar-apps-for-mac · https://machow2.com/best-calendar-apps-mac/ · https://www.notion.com/releases/2024-01-17 · https://www.takecontrolbooks.com/tag/calendar-reminders · https://apps.apple.com/app/id1173663647
- Tareas: https://clickup.com/blog/ticktick-vs-things3/ · https://thedigitalprojectmanager.com/tools/ticktick-vs-todoist/ · https://unstar.app/blog/todoist-ticktick-things-3-microsoft-todo-apple-reminders-todo-apps-ranked-2026
- Finanzas: https://support.apple.com/guide/stocks/stbd78ea5034/mac · https://www.thepennyhoarder.com/budgeting/budgeting-copilot-money-review/ · https://freenance.io/products/getquin-review-2026-portfolio-tracker-european-investors-app/ · https://blog.elest.io/ghostfolio-free-open-source-privacy-first-portfolio-wealth-tracker/ · https://glama.ai/mcp/servers/rb92suhhvn
- Datos financieros: https://dev.to/johnfrandsen/gocardless-bank-account-data-alternatives-what-to-use-when-signups-are-disabled-326d · https://www.openbankingtracker.com/guides/free-open-banking-apis · https://enablebanking.com/docs/markets/es/ · https://fundfactsapi.com/blog/fund-data-providers-for-developers-2026
- Búsqueda: https://aiagentrank.io/blog/shortwave-vs-superhuman-2026 · https://devtoollab.com/ai-tools/khoj-ai · https://cut-the-saas.com/the-cut/best-ai-email-assistants
- Mac: https://developer.apple.com/videos/play/wwdc2025/310/ · https://developer.apple.com/documentation/technologyoverviews/liquid-glass
