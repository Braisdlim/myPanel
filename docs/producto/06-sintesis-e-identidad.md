# Síntesis de referencias e identidad

Fecha: 18-10-2026. Estado: **propuesta, pendiente de tu revisión**.
Página de revisión (privada, con demo en vivo): https://claude.ai/artifact/SAbg5oEbwfe1pJT6XE9QXK · copia local: [`identidad/propuesta.html`](identidad/propuesta.html).

## 1. Plan [P]
1. **Síntesis**: qué cogemos de cada referencia y qué piezas son comunes. Sustituye a las decisiones sueltas P-018, P-019 y P-020.
2. **Identidad**: nombre, icono, tipografía y paleta (tres opciones de cada una).
3. **Sistema de diseño**: tokens + componentes + reglas en una página de sistema de diseño; los mismos tokens en el repositorio como única fuente para el código.
4. **Tres pantallas clave** (Hoy, Semana, Finanzas) en código (Astro + Svelte), revisadas en el Mac y en el Honor.

**Herramienta** [P]: páginas privadas para identidad y sistema; pantallas directamente en el prototipo de código; revisión con Playwright y script de contraste. **Figma no, de momento**: el plan Starter es gratuito con «acceso limitado» y el Professional cuesta 16 $/mes por editor [H figma.com/pricing, 18-10-2026]; exigiría conectar la cuenta y añade un paso de traducción a código [I].

## 2. Reglas de unificación [P]
1. Una carcasa, tres contenidos (Mac: barra lateral · contenido · inspector; Android: pestañas abajo + hojas).
2. De cada referencia, el comportamiento; la estética es siempre la nuestra.
3. Mismo problema, misma pieza.
4. Una familia tipográfica y una escala; cifras tabulares.
5. Un solo acento (ahora, foco, acción principal); semánticos y colores de cuenta aparte.
6. Mismas palabras: Hoy, Planificar, Algún día, Pide atención.

## 3. Piezas compartidas [P]
| Pieza | Sale de | Dónde aparece |
|---|---|---|
| Captura única | Fantastical, Todoist, Things | ⌘K / atajo global (Mac), ＋ y «Compartir» (Android) |
| Rejilla de tiempo | Google Calendar, TickTick, Structured, Sunsama | Día/semana del Calendario y «Planificar» |
| Escala anual | BusyCal, Parqet, getquin | Año del Calendario (horas) y de Finanzas (rentabilidad mensual) |
| Fila con valor | Bolsa, Things | Tareas, eventos y fondos |
| Inspector | Notion Calendar, Copilot, Things | Panel derecho (Mac) / hoja (Android) |
| Pide atención | Fintonic, Sunsama, Reclaim | Conflictos, sobrecarga, reglas de Finanzas |
| Teclado | Notion Calendar | ⌘1–4 sectores, D/S/M/A escalas, «?» |

## 4. Qué cogemos por sector [P]
- **Calendario**: Fantastical (lenguaje natural con vista previa y pregunta si hay ambigüedad), Notion Calendar (teclado, mini agenda en la barra de menús), BusyCal (año como mapa de calor de horas), Reclaim (rutinas flexibles que proponen; cambios por ocurrencia), Google/Apple (vistas básicas). Fuera: calendarios ajenos superpuestos, mover sin permiso.
- **Tareas**: Things (Hoy con eventos arriba, «Esta noche», «Algún día»), Todoist (fichas en la captura; voz más tarde), Sunsama (Planificar con duraciones y aviso de sobrecarga; cierre del día opcional), Structured (línea del día en el móvil), TickTick (solo matriz en la revisión semanal). Fuera: Pomodoro, sonidos, rachas, P1–P4.
- **Finanzas**: Bolsa (lista con minigráfico, periodos, variación entre dos fechas, «Añadir al calendario»), Copilot (tres zonas, frente a índice), Finary (patrimonio en €), getquin/Parqet (resumen del día, rentabilidad mensual), Fintonic (bandeja de avisos), avisos con reglas propias. Aparte: Ghostfolio (técnica, NAS). Fuera: noticias, cotización al segundo.

## 5. Identidad: opciones
| Grupo | Opciones | Recomendación |
|---|---|---|
| Nombre e icono | **Pauta** (tres líneas del día, la de ahora en acento) · myPanel (cuatro bloques) · Norte (aguja) | Pauta [P] |
| Tipografía | **Inter** · la del sistema (San Francisco en Mac, Roboto/MagicOS en Android) · Geist | Inter [P] |
| Paleta | **Lavanda plana** · Índigo · Ámbar, sobre grafito frío; oscuro por defecto | Lavanda sin degradados ni brillos [P] |

Hechos que sostienen la propuesta:
- San Francisco solo se licencia para maquetas de interfaces de sistemas de Apple [H developer.apple.com/fonts, 18-10-2026]; no se puede incluir en la app. Usar la fuente del sistema en el Mac no la distribuye [I].
- Tauri usa WebKit (WKWebView) en macOS [H v2.tauri.app/reference/webview-versions, 18-10-2026].
- Inter (con eje de tamaño óptico 14–32), Geist y Geist Mono se sirven en Google Fonts [H, petición a la API de CSS, 18-10-2026].
- App Store España [H API de búsqueda de iTunes, 18-10-2026]: «Pauta» es una app de noticias; «Norte Hábitos, Rutina, Meta» es de productividad; «Brújula», «Rumbo» y «Atril» ya existen. Irrelevante mientras la app sea privada [I].
- Contraste de las tres paletas ≥ 4,5:1 en texto, en ambos temas: [`research/identidad/`](../../research/identidad/).

## 6. Pendiente de tu respuesta
1. ¿Plan y herramienta?
2. Tabla «Qué cogemos»: ✅ o cambios.
3. Nombre e icono, tipografía, paleta.
