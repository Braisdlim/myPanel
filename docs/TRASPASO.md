# Traspaso de sesión: dónde estamos (20-10-2026, actualizado tras la prueba real en Windows)

Este documento sirve para continuar el trabajo en Claude Code en el ordenador del usuario (Windows) sin perder contexto. Resume la conversación en la nube del 18 al 20-10-2026 (sesión `session_0198Hqdxi7xdDqfq9pZ9jgNd`).

**Si eres el agente que retoma el trabajo**, lee en este orden antes de proponer nada:
1. Este documento.
2. `CLAUDE.md`, que tiene las reglas fijas.
3. `docs/DECISIONES.md`: decisiones D-, supuestos S-, pendientes P- y registro de fuentes.
4. `docs/traspaso/mensajes-del-usuario.md`: los 42 mensajes del usuario, literales.
5. Lo que toque según la tarea:
   - `docs/producto/` (visión y arquitectura).
   - `diseno/` (sistema de diseño y maquetas).
   - `app/README.md` (código).
   - `research/` (investigaciones).

Etiquetas que se usan en todo el repositorio: [H] comprobado en fuente primaria, [H·r] vía resumen, [H·s] fuente secundaria, [I] inferencia, [P] propuesta, [?] incierto.

---

## 1. Qué es Pauta

**Pauta** es el nombre de la app; el repositorio se llama myPanel. Es una «secretaria personal» privada:
- Reúne en un sitio tus compromisos (calendarios de varias cuentas), tareas, correos, documentos y finanzas.
- Te dice qué importa hoy.
- Te ayuda a decidir cuándo hacer las cosas.
- Más adelante, hace gestiones contigo (crear eventos, reservar en Yeasy…), siempre con tu supervisión.

Para quién y dónde (D-001, D-036):
- **Principalmente para el usuario.** Debe quedar preparada para que otras personas la usen más adelante. Además, el usuario quiere poder defenderla en una entrevista de trabajo como proyecto personal.
- **Open source o privado: por decidir** (P-032).
- **Plataformas:** escritorio Windows y Mac; móvil Android (Honor 600 Pro) e iPhone. Todas las pantallas deben existir en escritorio y en móvil (D-035, «paridad»).
- **Idiomas:** español primero, inglés después (D-037).

Principios, que deciden los empates (`docs/producto/01-vision-y-sectores.md`):
1. Un sitio para todo, cada cosa en su sector; «Hoy» resume.
2. **Procedencia siempre visible:** qué cuenta, cuándo se actualizó, con qué certeza.
3. **Nada se escribe ni se mueve sin ti.** Las acciones externas se confirman, con la cuenta de destino a la vista, y se comprueban releyendo.
4. **Funciona sin IA.** La IA ayuda, pero el núcleo no depende de ella.
5. Rápida como una app nativa: teclado en escritorio, pulgar en el móvil.
6. Finanzas con datos y reglas definidas por el usuario. **Nunca recomienda inversiones.**
7. Privacidad por defecto y permisos mínimos por cuenta.
8. Coste cero siempre que se pueda. El usuario no paga ninguna API de IA.

Sectores: Hoy, Calendario, Tareas, Compromisos flexibles (dentro de Calendario y Tareas), Finanzas, Oportunidades (avisos de caídas de fondos según reglas propias), Correo, Documentos y búsqueda, Asistente de IA, «Lo que sé de ti» (memoria revisable), Gestiones (Yeasy), y Ajustes y cuentas. La tabla completa está en `docs/producto/01`.

**Lo que NO es:** no sustituye a Gmail ni a Google Calendar (los lee y, con permiso, escribe); no hace *trading* ni da asesoramiento; no es multiusuario (por ahora); no tramita las vacaciones del trabajo (D-014).

## 2. Hechos reales del usuario (no inventar más)

| Dato | Valor | Fuente |
|---|---|---|
| Cuentas de correo | **Dos Gmail personales.** Todavía no se sabe en cuál se permitirá escribir (P-002). | Mensaje 2, D-015 |
| Cuenta de trabajo | Microsoft de NTT DATA, con reuniones diarias. **Antes de conectarla hay que comprobar la política de la empresa**; mientras tanto, solo «ocupado» o nada (D-038, P-031). | Mensaje 20 |
| Ensayo | **Viernes de 21:30 a 23:30**, recurrente y **opcional**: puede faltar alguna semana. Las excepciones se hacen **por ocurrencia**, nunca a la serie sin orden explícita. **Está en `brais.dlim@gmail.com`**, en calendarios compartidos contigo («Glissandoo» ×2 y `bandadenoia@gmail.com`), y aparece repetido (P-001 resuelto el 20-10-2026, P-043). | Mensajes 1 y 2; prueba real |
| Móvil | Honor 600 Pro con Google Play (MagicOS 10, Android 16). Navegador por confirmar, se supone Chrome (P-005). | Mensaje 2 |
| Ordenadores | Windows (lo usa ahora). Mac: por confirmar si tiene uno personal (P-014). | Mensajes 20 y 41 |
| Vacaciones | Se piden en el portal corporativo desde el PC de la empresa. Pauta solo apunta días libres (D-014). | Mensaje 2 |
| Finanzas | MyInvestor, Trade Republic y CaixaBank. Quiere patrimonio, gastos y aportaciones mensuales a fondos o ETF. Faltan los ISIN (P-013). Seguridad máxima: «solo si encontramos una manera 100 % segura». | Mensajes 15 y 16 |
| App de finanzas favorita | Bolsa (Stocks) de Apple, a la que llamaba «Financia». | Mensaje 9 |
| Peluquería | Reserva en Yeasy. Falta el enlace de su barbería (P-007). No dar por hecho que Yeasy tiene API o MCP. | Mensaje 1 |
| Zona horaria | Europe/Madrid (supuesto S-001) | — |
| NAS | Tiene uno, pero queda **fuera** de la arquitectura (D-045). Como mucho, destino de copias. | Mensaje 24 |
| Suscripción «cloud» | Proveedor y plan desconocidos. No suponer que incluye API (P-004). | Mensaje 1 |
| **Hipotético, NO es un dato** | «Toca el saxofón» | Mensaje 1 |

El día de ejemplo de las maquetas es el **viernes 23-10-2026**. El 25-10-2026 es el último domingo de octubre, día de cambio de hora.

## 3. Cómo trabajar con el usuario

- **Todo en español:** documentos, interfaz, commits y conversación.
- **Investigar antes de construir** (skill `investigar-antes-de-construir`), con fuentes primarias y fechadas. Distinguir lo comprobado de lo supuesto. **No inventar** resultados, precios ni APIs. Si una web está bloqueada, decirlo.
- Cuando pide investigar, quiere **saber qué hacen los expertos y la comunidad** (foros, documentación, productos reales), no un experimento propio en su lugar (corrección del 19-10, mensaje 29). Las pruebas propias van como complemento.
- **Propuesta concreta antes de decisiones grandes** de producto, interfaz, permisos, coste o arquitectura. Los detalles menores, resolverlos sin preguntar. Cuando hay que elegir, **dar una recomendación**, no un catálogo.
- **Método de diseño** (D-019, D-023, D-026): producto → arquitectura → sistema de diseño → maquetas → código. Cada sector se calca de una **app base** con contenido propio:

  | Sector | App base |
  |---|---|
  | Finanzas | Bolsa |
  | Hoy y Tareas | Things 3 |
  | Calendario | Fantastical |
  | Asistente | Shortwave |

  Las maquetas se hacen en el lienzo de Claude (claude.ai) y solo se programa lo aprobado. El usuario aprueba con frases cortas («Finanzas listo», «Hoy listo»).
- **Calidad visual muy alta:** sensación de app Apple muy pulida sin copiar su identidad; oscuro como dirección principal. Hay que revisar las capturas a ojo (skill `revision-visual`), no solo pasar pruebas.
- **Le gusta que se le diga el siguiente paso natural** y avanzar por incrementos comprobables. Suele contestar «adelante» o «vamos».
- **No quiere renovar cosas a mano** (por ejemplo, la caducidad de 7 días de Google) y prioriza la comodidad si el riesgo es bajo: el ID de cliente se subió al repositorio porque lo pidió.
- `docs/DECISIONES.md` es el documento vivo. Hay que actualizarlo en cada decisión, supuesto, pendiente o fuente nueva, con fecha y cita literal del usuario cuando decide algo.

## 4. Estado a 22-10-2026

### Hecho
| Pieza | Dónde | Estado |
|---|---|---|
| Investigación de la fase 0 y prototipo inicial | `docs/fase-0/`, `prototype/` | Histórico (sustituido) |
| Definición del producto (11 documentos) | `docs/producto/` | Propuesta; varias partes aprobadas |
| Referencias visuales (capturas oficiales) | `docs/referencias/` (+ `research/referencias/`) | Hecho |
| Identidad: Pauta, Inter, acento lavanda plano sobre grafito | D-024 | **Aceptada** |
| Sistema de diseño Pauta v1 (tokens, 25+ componentes `pa-*`, Lucide 1.50.0) | `diseno/sistema/` (única fuente de valores visuales) | Propuesta en uso (P-022) |
| Maquetas por sector, escritorio y móvil | `diseno/maquetas/{finanzas,hoy,calendario,tareas,asistente}/` (`*.dc.html`) | Finanzas y Hoy **aprobadas**; Calendario, Tareas y Asistente pendientes de revisión (P-027, P-028, P-033, P-038) |
| Investigación de datos y sincronización, finanzas, voz y asistente de IA | `docs/producto/08`, `10`, `11`; `research/` | Hecho; D-041 propuesta, D-028 aplazada |
| **App, paso 1**: carcasa, todos los sectores, tareas reales en IndexedDB, «Apuntar» con analizador de fechas propio | `app/` | Hecho (D-048) |
| **App, paso 2**: Google Calendar en solo lectura, varias cuentas | `app/src/lib/google.js`, `calendario.js`, `agenda.svelte.js`, `sectores/Ajustes.svelte` | Hecho y **probado con tus dos cuentas reales el 20-10-2026** (D-049, P-041). Falta S-003 (27-10). |
| **App, paso 3** (22-10-2026): eventos repetidos unidos (D-051) y crear eventos desde «Apuntar» con confirmación y relectura (D-050) | `calendario.js`, `google.js`, `estado.svelte.js`, `componentes/Apuntar.svelte`, `sectores/Ajustes.svelte`, `sectores/Calendario.svelte` | Hecho y **probado con la cuenta real el 22-10-2026**: «Dentista», mar 27-10, 10:30–11:30, creado en `brais.dlim@gmail.com` y comprobado en Google Calendar (P-044). Versión 0.3.0. |
| **App, paso 3 bis** (22-10-2026): cambiar solo esta vez (D-052): «Mover esta vez», «Saltar esta vez» y «No voy esta vez» | `componentes/CambiarEvento.svelte`, `calendario.js` (huecos, claves, copia principal), `estado.svelte.js` | Probado con Google imitado; con datos reales, «No voy esta vez» en el ensayo y «Mover» del «Dentista» al mié 28-10, 10:30–11:30, comprobado en Google (P-045). Falta «Saltar» con una serie real. |

### Lienzos en claude.ai
Son privados del usuario; se abren con su sesión de claude.ai. El código de los tableros está copiado en `diseno/maquetas/*/` (`canvas.json` + `*.dc.html`). Para editar un lienzo hace falta claude.ai, porque la herramienta de artefactos no existe en Claude Code local.

| Qué | Enlace |
|---|---|
| Vista previa de la app (paso 1; Google no conecta allí) | https://claude.ai/artifact/TZbZd7bVhQfpRPeuQqVLqN |
| Sistema de diseño Pauta v1 | https://claude.ai/artifact/JXsNVroPQxnUhhwAZaB83m |
| Lienzo Finanzas | https://claude.ai/artifact/1Dmp1APhbBSL1Y1F3NuNAU |
| Lienzo Hoy | https://claude.ai/artifact/8GLyXqURLfdiLKDDpgec8h |
| Lienzo Calendario (incluye la matriz de paridad) | https://claude.ai/artifact/6Ca6kZvoyEtp3K4d2xW6G7 |
| Lienzo Tareas | https://claude.ai/artifact/8kxm5xqxYybUh3DWtpWdNa |
| Lienzo Asistente | https://claude.ai/artifact/LK2CJNMSSyHTm88QsNgghP |
| Referencias de Calendario, Finanzas y Tareas | https://claude.ai/artifact/V2Wp6obG8vzFD2mkpWsZih · https://claude.ai/artifact/NL6KyAiHjEGTTJ6VMP1GCc · https://claude.ai/artifact/FCyV5pXLj82tfDd4Nfb2Eq |
| Históricos: definición, prototipo y sistema antiguo | https://claude.ai/artifact/WoUToaxt9LQDPYHXYrGmvA · https://claude.ai/artifact/1J3LjR2F2K3Mu3tsYqtsuM · https://claude.ai/artifact/SAbg5oEbwfe1pJT6XE9QXK |

### La app (`app/`)
- **Tecnología:**
  - Astro 7.4.1 + Svelte 5.57.2 (runes), en una sola página con rutas `#/sector/…` y salida estática, pensada para empaquetarla luego con Tauri.
  - Importa `../diseno/sistema/` sin copiarlo.
  - Sin dependencias de ejecución añadidas.
- **Real:**
  - Tareas y proyectos (IndexedDB) y «Apuntar» (⌘K o Ctrl+K, o el botón ＋ en el móvil), que **pregunta si una fecha u hora es ambigua**.
  - Tema, privacidad (exportar y borrar) y cuentas de Google.
  - Tus calendarios en Hoy, Calendario, Pide atención y la barra lateral.
- **De ejemplo, con etiqueta «ejemplo»:**
  - Finanzas.
  - Los calendarios mientras no haya cuentas conectadas.
  - El asistente, que es solo maqueta (D-047: aplazado; la pantalla existe pero no funciona).
- **Google Calendar (D-049):**
  - Usa la biblioteca de Google (`google.accounts.oauth2`), sin servidor ni secreto.
  - Permisos: `calendar.calendarlist.readonly` y `calendar.events.readonly`.
  - El token vive solo en memoria y dura alrededor de 1 h; «Actualizar» lo pide de nuevo con `login_hint`.
  - Eventos de −60 a +180 días guardados en IndexedDB.
  - Un mismo evento en dos cuentas se muestra una vez (`iCalUID`); y desde el paso 3 también las copias del mismo plan en varios calendarios (mismo día, hora de inicio y título equivalente, D-051).
  - Calendarios activables por cuenta; al desconectar se revoca el permiso si sigue vivo.
- **Crear eventos (D-050):**
  - Interruptor «Crear eventos» por cuenta en Ajustes › Cuentas, apagado por defecto; al encenderlo pide `calendar.events.owned` (solo calendarios tuyos). Calendario por defecto elegible.
  - En Apuntar, algo con día y hora pregunta «¿Dónde lo guardo?» (tarea o evento en una cuenta); ajuste en Ajustes › General. Solo el botón «Crear en ‹cuenta›» escribe; Enter lleva al botón.
  - Tras crear, relee el evento en Google, lo compara y lo añade a la copia local.
- **Cambiar solo esta vez (D-052):** en el detalle de un evento (Calendario). En calendarios tuyos con «Crear eventos»: «Mover esta vez» (huecos libres u «Otra hora…») y «Saltar esta vez» en series, con tarjeta, «… en ‹cuenta›» y relectura de la ocurrencia y la serie. En los demás (el ensayo): «No voy esta vez», solo en Pauta (`app.noVoy`, guardado en el almacén `ajustes` con id `noVoy`). Nunca toda la serie.
- **Proyecto de Google Cloud:**
  - Se llama `proyecto-pauta`, con la API de Calendar activada.
  - Está **In production sin verificar** (decisión del usuario, P-041).
  - ID de cliente en el código (`app/src/lib/google.js`, a petición del usuario); `app/.env` puede sustituirlo.
  - Origen autorizado: `http://localhost:4321`.
  - No consta si el usuario añadió ya `calendar.events.owned` en *Data Access*; se le sugirió (P-042). [?] Si no está, Google puede avisar de nuevo al pedirlo; se verá en P-044.
- **Pruebas:** `npm test` lanza 36 unitarias; `npm run build:pruebas` + Playwright lanzan 102 (móvil 360 y 412, escritorio 1440, claro y oscuro). En Windows funciona con `npx playwright install chromium` (instalado el 22-10-2026), sin `PW_CHROMIUM`. Comprueban:
  - contraste de al menos 4,5:1;
  - objetivos táctiles de al menos 44 px en móvil;
  - que no haya errores de consola;
  - el recorrido completo con Google imitado.

### Prueba real del 20-10-2026 (hecha en Windows)
- Entorno: Node 24.20.0, npm 11.19.0, `npm test` 28 de 28, `npm run dev` en `http://localhost:4321`.
- Conectadas las dos cuentas en solo lectura: `brais.dlim@gmail.com` (8 calendarios, 123 eventos) y `braisdlim.tw@gmail.com` (2 calendarios, 26 eventos). El correo se ve bien. Consola sin errores.
- La ventana de Google obliga a permitir las ventanas emergentes de `localhost`.
- El ensayo está en `brais.dlim@gmail.com`, en calendarios compartidos, y sale **tres veces** (P-043). Los calendarios compartidos quizá no admitan escritura (P-042).

### Versión publicada (D-053, 22-10-2026)
- Dirección: **https://braisdlim.github.io/myPanel/** (GitHub Pages, gratis). Se publica sola en cada push a la rama principal si pasan las pruebas (`.github/workflows/publicar.yml`; Pages con origen «GitHub Actions», activado con `gh api`).
- Instalable en el móvil (manifiesto e iconos en `app/public/`; iconos generados con `app/scripts/iconos.mjs`). Sin *service worker*: necesita conexión.
- Compilar como en GitHub: `PAUTA_SITE=https://braisdlim.github.io PAUTA_BASE=/myPanel npx astro build` (en Git Bash de Windows, con `MSYS_NO_PATHCONV=1` delante, o convierte `/myPanel` en una ruta de Windows).
- Los datos de cada dispositivo van aparte: lo del móvil no se ve en el ordenador hasta la sincronización (D-041).
- La web personal del usuario apuntaba a `braisdlim.me`, que no existe; se quitó el dominio (con su permiso) y vuelve a funcionar en `braisdlim.github.io`.

### Uso diario (D-054 y D-055, 22-10-2026)
- **Horario de trabajo** en Ajustes › General (`app/src/lib/horario.js`): bloque «Trabajo» solo en Pauta; días libres = eventos de todo el día de tus calendarios con «vacaciones», «festivo», «no trabajo» o «día libre». Los festivos de Google no cuentan. Hay que encenderlo en cada dispositivo (los ajustes son locales).
- **Móvil:** Mes y Año llenan el alto; título que se encoge al desplazar (`App.svelte`); Calendario con cabecera compacta; Ajustes con índice; Hoy sin el panel del escritorio; prop `llenar` de `Dos.svelte` para pantallas a alto completo. Medir con `node pruebas/medir-movil.mjs` (con `astro preview --port 4330` en marcha).
- Trampa: en el móvil, `.dos__main` no puede tener `overflow: auto` o los encabezados `sticky` no se pegan.

### Navegación y accesibilidad (D-056, 22-10-2026)
- `ir()` añade al historial; `sustituir()` reemplaza (fechas, escala, pestañas hermanas). Usa uno u otro según si es «entrar» o «moverse dentro».
- Toda hoja o diálogo modal va con `componentes/Hoja.svelte` (se monta en `<body>`, deja la app `inert`, cierra con «atrás»/Esc, devuelve el foco). No hagas otro `.capa` a mano.
- `pruebas/accesibilidad.spec.js` pasa axe-core por todas las pantallas; `pruebas/navegacion.spec.js`, el historial y el foco. Si añades una pantalla, añádela a la lista de rutas de las dos.

### Lo siguiente inmediato
0. **P-046:** añadir `https://braisdlim.github.io` como origen en Google Cloud, instalar Pauta en el Honor y conectar las cuentas.
1. «Saltar esta vez» con una serie real del usuario, cuando la haya (P-045; mover ya probado).
2. **El 27-10-2026**, confirmar que el permiso no caduca a los 7 días (S-003).
3. Aceptar o corregir D-049 a D-052, y revisar las maquetas del Calendario (P-027, P-028).
- Hecho el 22-10-2026: prueba real del paso 3 (P-044), con `brais.dlim@gmail.com` y «Crear eventos» activado; paso 3 bis programado (D-052).
- El servidor de desarrollo puede quedarse con una copia vieja de un módulo tras muchos cambios («does not provide an export named…»): reiniciar `npm run dev`.

### Propuesta de hoja de ruta [P] (no aprobada; preséntala como recomendación)
1. ~~Paso 3 bis~~ Hecho (D-052).
2. **Paso 4, app instalada en el escritorio (Tauri, Windows y Mac):**
   - permiso que se renueva solo (PKCE o el flujo de escritorio), sincronización en segundo plano y avisos;
   - SQLite local (D-041) y la cuestión P-034.
3. **Móvil:**
   - ~~web instalable con alojamiento~~ Publicada en GitHub Pages (D-053); falta probarla en el Honor (P-046) y, si se quiere sin conexión, un *service worker*;
   - widget, más tarde (D-011, P-030).
4. **Sistema de diseño:** pasar a `diseno/sistema` los arreglos de `app/src/estilos.css` y decidir 44 o 48 px (P-039, P-040).
5. **Más adelante:**
   - Microsoft u Outlook (P-030 y P-031);
   - Finanzas reales (D-028 y P-025, aplazadas por el usuario);
   - Correo y búsqueda en Drive (fase 2, D-008);
   - el asistente de IA (D-042 a D-047, aplazado: «es un tema que quiero meditar»);
   - memoria «Lo que sé de ti»;
   - Yeasy.

## 5. Reglas técnicas y trampas aprendidas
- **Secretos:** nunca subir secretos ni tokens. El ID de cliente de Google no es secreto y está subido. Los ficheros financieros reales van en `research/finanzas-import/privado/` (ignorado) y nunca se suben.
- **El repositorio `Braisdlim/myPanel` es PÚBLICO**: comprobado el 20-10-2026, la API de GitHub responde sin autenticar. Todo lo que se sube, incluidos `DECISIONES.md` y los mensajes literales, lo puede leer cualquiera. Si el usuario no lo quiere así, que lo haga privado en GitHub › Settings.
- **Ramas:** el remoto **solo tiene la rama `claude/confident-bohr-h7z5mh`**, que es la rama por defecto; no hay `main`. Crear `main` u otra rama es decisión del usuario. No abrir *pull requests* sin que lo pida.
- **Escritura en servicios externos:** indicar la cuenta de destino, pedir confirmación y releer el resultado (`CLAUDE.md`). Las excepciones de calendario, siempre por ocurrencia.
- **Fechas:** las calcula siempre el código, nunca un modelo. El analizador (`app/src/lib/analizador.js`) devuelve dudas con opciones en lugar de adivinar.
- **Pruebas visuales:**
  - El tema por defecto es «del sistema»; en Playwright hay que usar `page.emulateMedia({ colorScheme })`, porque `localStorage` solo evita el parpadeo. Hasta el 20-10-2026 las capturas «oscuras» salían en claro.
  - Revisar las capturas a ojo.
- **Google:**
  - `selected` de CalendarList vale *false* si falta; se enciende solo lo que ves en Google y siempre el principal.
  - El correo de la cuenta se toma del `id` del calendario principal; está por confirmar en la prueba real.
  - La vista previa de claude.ai bloquea el script de Google.
- **Astro:** solo admite un `astro preview` a la vez. Si Playwright dice «webServer exited early», ya hay uno en el puerto 4330 y se reutiliza.
- **Diálogos:** no usar `confirm()` ni `prompt()`, que el visor bloquea y quizá Tauri también; las confirmaciones van en la propia página.
- **Diseño:** usar tokens, nunca valores sueltos; si falta un valor, añadirlo a `tokens.json`, comprobarlo con `diseno/colores.py` y regenerar. Seguir las reglas de la skill `diseno-mypanel`.
- **Consola de Google en español:** «Google Auth platform» no aparece en el menú. Hay enlaces directos en `docs/guias/conectar-google-calendar.md`.

## 6. Entorno local (Windows)
- **Requisitos:** Git para Windows y Node.js 22.22 o más reciente (Astro 7.4.1 pide `>=22.22.0`).
- **Arrancar:** `cd app` → `npm install` → `npm run dev` y abrir `http://localhost:4321`. Usar `localhost`, no `127.0.0.1`, porque es el origen autorizado en Google.
- **Pruebas:**
  - `npm test`.
  - Para Playwright: `npm run build:pruebas`, luego `npx playwright install chromium` (solo la primera vez) y `npx playwright test`. En la nube se usaba `PW_CHROMIUM` con un Chromium preinstalado; en local no hace falta.
- **Ayudas del agente** (D-013), configuradas en el repositorio:
  - Skills: `.claude/skills/` (`investigar-antes-de-construir`, `diseno-mypanel`, `revision-visual`).
  - Plugin oficial `frontend-design`: `.claude/settings.json`.
  - Astro Docs MCP: `.mcp.json`. Claude Code pedirá aprobarlo.
- **Python** (opcional): solo para los scripts de `diseno/` (contraste y tokens) y algunas pruebas de `research/`.

## 7. Mensaje para empezar la sesión local
Pega esto en la primera conversación de Claude Code en el ordenador:

> Retomamos Pauta (repositorio myPanel) desde una sesión en la nube. Lee `docs/TRASPASO.md` entero, `CLAUDE.md`, `docs/DECISIONES.md` y `docs/traspaso/mensajes-del-usuario.md`. Después:
> 1. Resúmeme en 10 líneas dónde estamos y qué es lo siguiente.
> 2. Comprueba que la app arranca en Windows (`cd app`, `npm install`, `npm test` y `npm run dev`).
> 3. Guíame para probar la conexión real con mis dos Gmail (P-041).
>
> No cambies nada todavía.
