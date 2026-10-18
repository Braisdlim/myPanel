# 5. Plan y siguiente paso

## Qué hemos aprendido
Dos rondas de diseño visual sin una definición completa del producto dieron pantallas bonitas pero incompletas: sin calendario semanal ni mensual, sin finanzas y sin una estructura de sectores. **El orden correcto es producto → arquitectura → plataforma → sistema de diseño → pantallas.**

## Nueva hoja de ruta [P]

| Etapa | Qué | Resultado |
|---|---|---|
| **D1. Definición** (ahora) | Visión, sectores, comparativa, arquitectura de información y de sistema | Estos documentos, revisados y aprobados por ti |
| **D2. Decisiones de base** | Plataforma (PWA, Tauri o nativa), servidor (Cloudflare o NAS), fuentes financieras según tus entidades | Prueba técnica corta de lo que elijas (p. ej., ventana Tauri en Mac con atajo global) |
| **D3. Recorridos detallados** | Pantalla a pantalla de R1–R9: estados, datos y acciones (sin estética todavía, como esquemas) | Esquemas navegables de baja fidelidad por sector |
| **D4. Sistema de diseño** | Tomando las convenciones de Mac (barra lateral, inspector, barra de herramientas, ⌘K) y lo mejor de Fantastical, Things, Bolsa y Copilot | Tokens y componentes; después, pantallas de alta fidelidad |
| **1. Núcleo** | Hoy, Calendario (día, semana, mes y agenda), Tareas, captura, dos cuentas Google | App usable a diario |
| **2. Información** | Correo importante, búsqueda en Drive y Gmail | «¿Dónde está…?» resuelto |
| **3. Finanzas** | Patrimonio, fondos, precios diarios, reglas de aviso | «¿Cómo van mis inversiones?» y avisos de caídas |
| **4. Memoria e IA** | Lo que sé de ti, consultas naturales | Memoria revisable |
| **5. Gestiones y widget** | Yeasy y otras; widget Android | Gestiones con confirmación |

[P] Pongo **Finanzas antes que Memoria e IA** porque lo has pedido expresamente y no depende de la IA.

## Siguiente paso concreto
1. **Tú**: lee los documentos 1 a 4 (sobre todo la lista de sectores y la sección 4.6) y respóndeme las preguntas de abajo.
2. **Yo**: con tus respuestas cierro D1 y preparo D2. Después, esquemas de baja fidelidad de todos los sectores (D3) para que valides la **estructura** antes de volver a la estética.

## Preguntas que necesito
1. **«Financia»**: ¿te refieres a la app **Bolsa (Stocks)** del Mac? Si es otra, dime cuál.
2. **Finanzas**: ¿con qué bancos y con qué gestoras o brókers trabajas (por ejemplo, MyInvestor, Indexa, Trade Republic…) y qué fondos tienes? ¿Quieres también **gastos e ingresos** de tus cuentas o solo inversiones?
3. **Mac**: ¿tienes un Mac personal donde usarías la app? ¿Te importa que en el Mac sea una app instalada con atajo global y barra de menús (opción 2) en lugar de una 100 % nativa (opción 3)?
4. **Prioridades**: ordena los sectores del 1 al 10 según lo que más te ayudaría en el día a día.
5. **Conocimiento personal**: ¿tomas notas en alguna app (Apple Notas, Notion, Obsidian…) que deba entrar en la búsqueda?
6. **NAS**: con finanzas y correo en juego, ¿prefieres tener los datos en casa (NAS) aunque haya que montarlo?
