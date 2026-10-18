# Fase 0 — Descubrimiento, investigación y propuesta

Fecha de la investigación: **18 de octubre de 2026**. Documento de revisión; nada de esto está implementado todavía.

## Cómo leer este documento

| Etiqueta | Significado |
|---|---|
| **[H]** | Hecho comprobado en fuente primaria (registro npm, ejecución propia). |
| **[H·r]** | Hecho comprobado a través del **resumen** de un buscador sobre una fuente oficial; no he podido abrir la página. |
| **[H·s]** | Dato de fuente secundaria (blog, prensa); plausible, pendiente de confirmar. |
| **[I]** | Inferencia mía a partir de los hechos. |
| **[P]** | Propuesta que tienes que validar. |
| **[?]** | Incierto o desconocido. |

> **Limitación importante de esta sesión.** La política de red del entorno en la nube **bloqueó la lectura directa** de webs y la descarga de imágenes (culturedcode.com, craft.do, bear.app, docs.astro.build, developers.google.com…). Solo funcionaron el buscador web (que devuelve resúmenes) y el registro npm. Por tanto:
> - **No he visto las capturas que me enlazaste.** El análisis visual de la sección 3.1 se basa en mi conocimiento previo de esas apps y en descripciones publicadas; está marcado como no comprobado visualmente.
> - Las cifras de precios y límites vienen de resúmenes; las marco como [H·r] o [H·s].
>
> Para la próxima ronda: o pegas las capturas en el chat, o añades esos dominios a la red permitida del entorno (menú del entorno → Editar → Network access; guía: https://code.claude.com/docs/en/cloud-environments#network-access).

---

## 1. Lo que he entendido y lo que es incierto

### Entendido
- **Una sola persona usuaria (tú)**, app privada, uso diario en ordenador y en un móvil Honor Android. No es un producto multiusuario. [I] Esto simplifica mucho: no hace falta multi-tenant, ni escalado, ni verificación pública de Google si se mantiene en uso personal.
- **Núcleo sin IA**: Hoy, captura, backlog, calendario y búsqueda exacta deben funcionar sin llamar a un modelo. La IA es una capa opcional donde aporte valor.
- **Varias cuentas Google**: lectura agregada con procedencia visible; **toda escritura indica cuenta de destino** y se confirma.
- **Cuatro tipos de compromiso**: inamovible, rutina opcional, tarea movible, pendiente sin fecha. Las excepciones se aplican **por ocurrencia**, nunca a la serie sin orden explícita.
- **Memoria revisable** con estados diferenciados (confirmado / inferido / temporal / acción) y vista «Lo que sé de ti». Lo del saxofón es un ejemplo hipotético: **no es un dato**.
- **Acciones externas** (Yeasy) más adelante, investigadas justo antes; sin suponer API ni MCP.
- **Calidad visual muy alta**, oscuro como dirección principal, claro seleccionable y respeto a la preferencia del sistema; inspiración Apple sin copiar su identidad; Android diseñado desde el primer prototipo.
- **Coste**: no pagas hoy ninguna API de IA. Evitar servicios de pago innecesarios.

### Incierto (bloquea o condiciona decisiones)
1. **Horario del ensayo de los viernes**: ¿09:30–11:30 o 21:30–23:30? ¿Existe ya en algún Google Calendar? ¿En cuál?
2. **Cuántas cuentas Google** y de qué tipo. Si alguna es de trabajo o estudios (Google Workspace), su administrador puede bloquear apps no verificadas. [I]
3. **Dónde vivirá la app**: ¿tienes un equipo siempre encendido (NAS, Raspberry Pi, PC)? Condiciona coste, privacidad y si un modelo local es viable.
4. **La suscripción «cloud»**: proveedor y plan desconocidos. Si fuera Claude Pro/Max, según fuentes secundarias **no incluye acceso API** para apps propias [H·s]; si fuera Google One / Gemini, el escenario cambia. No asumo nada.
5. **Modelo exacto del Honor, versión de Android/MagicOS y navegador** (Chrome u otro), y si tiene servicios de Google Play. Afecta a la instalación como app web. [?]
6. **Cómo se solicitan formalmente las vacaciones en tu trabajo** (portal de RR. HH., correo a una persona, herramienta concreta).
7. **Zona horaria**: supongo Europe/Madrid porque escribes en español de España. [Supuesto]
8. **Enlace de tu barbería en Yeasy**: pendiente; solo hará falta en la fase 4.

---

## 2. Tres recorridos que propongo priorizar

Los elijo porque son diarios, no dependen de IA y validan la arquitectura de punta a punta (offline, multi-cuenta, escritura segura).

### R1 · «Abrir y saber qué toca» (Hoy)
1. Abro la app desde el icono del Honor o una pestaña en el ordenador.
2. En < 1 s veo, con datos en caché aunque no haya red: **lo siguiente** (cita más próxima), **lo que puedo hacer hoy** (≤ 5 tareas), **hecho hoy**, **pendientes que piden atención** (≤ 3) y **próximos días** resumidos.
3. Toco un elemento y se amplía: hora, cuenta de origen, notas, acciones.

**Criterios**: primera pintura útil ≤ 1 s con caché y ≤ 2,5 s en frío con red móvil emulada; en 360 × 800 px el bloque «Ahora + Hoy» cabe sin desplazarse con hasta 7 elementos; cada elemento de calendario muestra su cuenta de origen con un indicador discreto (color + nombre accesible).

### R2 · «Capturar en segundos»
1. Desde Hoy (o desde el acceso directo largo del icono en Android, o compartiendo texto desde otra app) escribo o dicto con el teclado: «tengo que pedir cita en la peluquería».
2. Se guarda **al instante**, incluso sin red (cola local), como *pendiente sin fecha*.
3. Si el texto contiene una fecha («el martes a las 17:30»), veo la **interpretación en vivo** antes de guardar y puedo corregirla. Si hay ambigüedad (09:30 ¿mañana o noche?), la app **pregunta**, no adivina.
4. Más tarde, en el backlog, la app propone cuándo hacerlo (huecos libres) y puedo **aceptar, posponer o dejarlo pendiente**.

**Criterios**: de toque a guardado ≤ 2 s y ≤ 2 interacciones; funciona en modo avión y se sincroniza al volver la red sin duplicados; nunca crea un evento en Google Calendar desde la captura sin confirmación explícita de cuenta.

### R3 · «Un plan choca con el ensayo»
1. Añado «cena con Ana el viernes 23 a las 21:00».
2. La app detecta solape con el ensayo (rutina opcional) y muestra el conflicto con tres opciones: **mantener ensayo** (y mover la cena), **faltar solo esta semana**, **mover el otro plan**.
3. Si elijo faltar, se crea una **excepción solo para esa ocurrencia**; la serie no cambia. Si el ensayo vive en Google Calendar, la escritura indica la cuenta y se verifica releyendo el evento.

**Criterios**: ninguna operación modifica la serie salvo que pulse explícitamente «cambiar toda la serie», que pide una segunda confirmación; tras cada escritura externa se relee el recurso y se muestra «hecho y comprobado» o el error real.

> «¿Dónde está el CV?» (búsqueda) queda para la fase 2 como recorrido real, pero **sí entra en el prototipo** con datos ficticios, como pediste, para diseñar su composición desde ya.

---

## 3. Investigación

### 3.1 Referencias visuales

**Estado de comprobación**: no he podido ver las capturas (bloqueo de red). Lo que sigue combina descripciones publicadas [H·r/H·s] con mi conocimiento previo de estas apps [I]. Lo revisaré contra las imágenes cuando pueda verlas.

| Referencia | Principio que tomaría | Lo que **no** trasladaría | Evidencia |
|---|---|---|---|
| **Ajedrez de macOS Sequoia** | Un único objeto protagonista con iluminación y sombra creíbles sobre un fondo neutro con **degradado granulado**; el resto de la interfaz retrocede. Para «Hoy»: la tarjeta «Ahora» como único elemento con elevación real. | Madera, mármol, 3D literal. | [H·r] 9to5Mac (14-06-2024) y TechRadar describen el paso de fondo brillante a degradado granulado y texturas más realistas. |
| **Things (OS 26)** | Listas con mucho aire, una sola acción principal flotante (Magic Plus) para capturar, jerarquía por tipografía y no por cajas; esquinas más redondeadas y barra lateral translúcida en Mac. | Liquid Glass literal: reseñas indican peor legibilidad en pantallas pequeñas. | [H·r] Blog de Cultured Code «Things for OS 26» (09-2025): espaciado más amplio, barra lateral translúcida, botón Magic Plus que se deforma. [H·s] Stuff.tv sobre legibilidad de Liquid Glass. |
| **Craft (oscuro)** | Oscuro **no negro puro**, superficies escalonadas por luminosidad, el contenido manda y los controles aparecen al interactuar. | — | [?] No encontré la nota de la versión 3.6.5. Basado en conocimiento previo. |
| **Bear** | Tipografía como identidad; temas cálidos; calma por reducción de color: un acento y grises. | Interfaz de editor de notas. | [I] Conocimiento previo. |
| **iA Writer (search to navigate)** | **La búsqueda es la navegación**: un único campo que salta a cualquier elemento (tarea, evento, documento, ajuste). Pocos controles visibles. | — | [H·r] Notas de iA Writer 8: «Quick Search» para saltar a encabezados, archivos o resultados. |
| **Fantastical** | **Lenguaje natural con vista previa en vivo** antes de guardar; cambio fluido de escala (día ↔ semana ↔ mes); DayTicker como franja compacta de días. | Densidad de controles premium. | [H·r] MacStories y reseñas: parser con vista previa mientras se escribe y funcionando sin conexión. Fantastical lanzó un MCP para Mac (Product Hunt, 18-03-2026). |
| **Flighty** | Información temporal **condensada en estados** («sale en 25 min») en vez de datos crudos; color para estado; tiene que funcionar sin red. | Estética de panel de aeropuerto. | [H·r] Apple «Behind the Design: Flighty» (06-2023): «casi aburridamente obvia», información clave siempre visible, robusta sin conectividad. |

**Referencias adicionales que propongo** (porque tu móvil es Android y porque cubren huecos de las anteriores):

| Referencia | Por qué | Evidencia |
|---|---|---|
| **Material 3 Expressive** (Google, Android 16) | Es el lenguaje nativo de tu Honor: movimiento con muelles, formas, tamaños táctiles. Tomaría **ergonomía y movimiento**, no la estética. | [H·r] Anunciado en mayo de 2025 (9to5Google, Android Authority): sistema de movimiento basado en muelles y 15 componentes nuevos o actualizados. |
| **Structured** | Línea de tiempo vertical del día con huecos visibles; muy usado por personas que necesitan foco. Referencia directa para la composición B. | [H·s] Varias comparativas de 2026 lo sitúan como el planificador diario más recomendado; su app de Android tiene menos funciones que la de iOS. |
| **Todoist Ramble** | Captura por voz que estructura frases largas en tareas con fechas. Referencia de *qué* hacer en fase 3, no de cómo se ve. | [H·s] Reseñas de 2026; limitado en plan gratuito. |
| **Amie** | Calendario y tareas en una misma superficie con poca ceremonia. | [H·s] Comparativas 2026. |

### 3.2 Astro: estado actual y adecuación

**Estado** (registro npm, consultado hoy):
- **Astro 7.4.0** publicado el 15-10-2026; **7.0.0** el 22-06-2026; 6.0.0 el 10-03-2026. Requiere Node ≥ 22.22. [H]
- Astro 7: compilador reescrito en Rust, Vite 8 + Rolldown, renderizado por colas estable, caché de rutas estable, punto de entrada `src/fetch.ts` compatible con middleware Hono, modo para agentes (`astro dev --background`, logs JSON). El compilador ya **no corrige HTML mal formado**. [H·r] Blog oficial «Astro 7.0».
- **Cloudflare adquirió el equipo de Astro** el 16-01-2026; el framework sigue siendo MIT y abierto. [H·r] Nota de prensa en BusinessWire.
- Islas: compartir estado entre islas se hace con **Nano Stores**; un `.astro` no puede suscribirse a cambios ni escribir en el estado del cliente. [H·r] Docs «Share state between islands».
- Acciones (funciones de servidor tipadas) estables desde 5.0; sesiones en servidor introducidas en 5.1. [H·s] (Estado «estable» de las sesiones en 7.x: [?] no verificado.)
- **`@vite-pwa/astro` 1.2.0 declara compatibilidad solo hasta Astro 5** (peerDependencies `^1.6.0 … || ^5.0.0`). [H] Para PWA con Astro 7 habría que escribir el *service worker* a mano o forzar la dependencia.
- Hay **Astro Docs MCP** remoto y gratuito (`https://mcp.docs.astro.build/mcp`). [H·r]

**Adecuación por recorrido** [I]:
- R1 (Hoy): tras el login no hay contenido estático que aprovechar; la pantalla entera cambia con cada captura o check. En Astro sería **una isla grande** (Svelte/Preact) dentro de una página SSR. Funciona, pero lo que Astro hace mejor (HTML sin JS) no aplica.
- R2 (captura en todas las vistas): la barra de captura debe sobrevivir a la navegación. En Astro requiere `<ClientRouter />` + `transition:persist` y estado en Nano Stores. En un framework de aplicación es el comportamiento por defecto del *layout*.
- R3 (conflicto): tras una escritura hay que refrescar Hoy, backlog y semana. Astro no tiene un mecanismo de invalidación de datos de página; se haría a mano en el store.
- Offline: hay que escribir y mantener el *service worker* a mano (ver punto de `@vite-pwa/astro`).

### 3.3 Alternativas evaluadas

| Opción | Versión (npm, hoy) | A favor | En contra |
|---|---|---|---|
| **SvelteKit 3 + Svelte 5** | kit 3.1.0 (3.0.0: 01-10-2026), svelte 5.57.2 [H] | Pensado para apps: *layouts* persistentes, `load` + `invalidate` para refrescar datos tras mutaciones, *form actions* con mejora progresiva, módulo `$service-worker` integrado, adaptadores Node y Cloudflare actualizados (adapter-node 6.0.0, adapter-cloudflare 8.0.1) [H]. Bundles pequeños, buenos para un Android de gama media [I]. Tiene MCP oficial (`@sveltejs/mcp` 0.1.26) [H]. | **3.0 tiene 17 días**: riesgo de bugs y de que librerías tarden en adaptarse [I]. *Remote functions* siguen experimentales [H·r]. Cambios: config en `vite.config.ts`, `$lib` → `#lib` [H·s]. |
| **Astro 7 + isla Svelte** | astro 7.4.0, @astrojs/svelte 9.1.0 (peer astro ^7) [H] | Te gusta; encaja si en el futuro hubiera partes públicas o de contenido; Cloudflare de primera clase; acciones tipadas; mismos componentes Svelte que la opción anterior. | Ver 3.2: estado y refresco manuales, SW a mano, dos modelos mentales (Astro + Svelte). |
| **Next.js 16** | 16.4.2 [H] | Ecosistema enorme. | Más JS por defecto y complejidad (RSC, cachés) para una app de una persona [I]. |
| **React Router 8 / TanStack Start** | 8.4.0 / 1.169.3 [H] | Buen modelo de *loaders/actions* (React Router); React Aria para accesibilidad. | React pesa más en móvil que Svelte [I]; TanStack Start sigue en 1.x rápida [I]. |
| **SPA Vite + API Hono** | hono 4.13.13 [H] | Lo más simple de entender. | Sin SSR ni *form actions*; habría que montar routing y datos a mano [I]. |

### 3.4 Móvil Android

- **Instalación**: en Android, Chrome instala apps web como **WebAPK** (aparecen en el cajón de apps) si se cumplen los requisitos; en sistemas sin servicios de Google puede caer a un simple acceso directo. [H·r] Chromium `webapk/README.md`; [H·s] hilo de GrapheneOS. No encontré nada específico de MagicOS. [?]
- **Accesos rápidos**: el manifiesto admite `shortcuts` (pulsación larga en el icono → «Capturar», «Buscar»). [H·r] Docs Edge/Chromium.
- **Compartir hacia la app** (`share_target`): permite enviar texto o enlaces desde cualquier app a la captura; requiere la app instalada. [H·r] web.dev.
- **Dictado**: la Web Speech API ganó reconocimiento en el dispositivo en Chrome 139 solo para escritorio; en Chrome el reconocimiento por defecto va a la nube. [H·r] Chrome 139, *intent to ship*. [P] Para la fase 1, **usar el dictado del teclado** (Gboard u otro) en el campo de captura: gratis, sin permisos extra y conocido.
- **Widget**: **no hay evidencia de widgets para PWA en Android**; el único caso de widgets para PWA es Windows 11 con Adaptive Cards. [H·r] Un widget real exige una app Android nativa (Jetpack Glance es la vía oficial, documentación actualizada en junio de 2026 [H·r]), que puede empaquetar la web con *Trusted Web Activity* y añadir el widget. [I]

### 3.5 Google: OAuth, permisos y varias cuentas

- **Modo «Testing»**: los *refresh tokens* caducan a los **7 días**. En «In production» no caducan salvo revocación o ~6 meses sin uso. [H·r] developers.google.com (página de configuración de Google Health API) y foro oficial.
- **Uso personal**: las apps de uso personal con menos de 100 usuarios pueden usarse **sin verificación**, aceptando el aviso de «app no verificada». [H·r] support.google.com/cloud/answer/13464323. Hay un tope de 100 usuarios nuevos para apps no verificadas con permisos sensibles o restringidos. [H·r]
- **Clasificación de permisos**: Drive `drive.file` no sensible; `drive.readonly` y `drive.metadata.readonly` **restringidos** [H·r] (guía «Choose Google Drive API scopes»). Gmail lectura (`gmail.readonly`) es restringido y, para apps públicas, exige auditoría CASA anual [H·s].
- **Calendario recurrente**: modificar una ocurrencia crea una **excepción** (se obtiene la instancia y se hace PUT sobre ella); `originalStartTime` identifica la ocurrencia aunque se haya movido. [H·r] Guía oficial «Recurring events». La sincronización incremental usa `syncToken` (no combinable con filtros de fecha). [H·s]
- **Refresh tokens**: Google solo los emite en el primer consentimiento salvo que se pida `access_type=offline` y `prompt=consent`. [H·r] Docs de Better Auth. Límite de 100 tokens vivos por cuenta y cliente OAuth. [H·s]

[I] Consecuencias:
1. Un proyecto de Google Cloud **tuyo**, en estado «In production», sin verificar, usado solo por tus cuentas. Aceptas el aviso una vez por cuenta. **Hipótesis a comprobar en la fase 1**: que el token de una cuenta siga vivo pasados 8 días.
2. Permisos **incrementales por cuenta**: calendario en la fase 1 y Gmail/Drive solo en la fase 2 y solo en las cuentas que elijas.
3. Separar **iniciar sesión en la app** (tú) de **conectar cuentas de datos** (N cuentas Google, cada una con sus permisos y su token cifrado).
4. Si una cuenta es Workspace de empresa, puede que el administrador bloquee el acceso; por eso pregunto.

### 3.6 Despliegue y persistencia

| Opción | Coste | Notas |
|---|---|---|
| **Cloudflare Workers (gratis) + D1** | 0 € | 100 000 peticiones/día, **10 ms de CPU por petición**, 5 *cron triggers* por cuenta en plan gratuito [H·r]. Límites de D1 gratuito: [?] no verificados. Riesgo: sincronizaciones grandes con mucho JSON podrían rozar los 10 ms de CPU [I]. |
| **Equipo propio siempre encendido + SQLite** (Node) con acceso privado (Tailscale o Cloudflare Tunnel) | 0 € si ya lo tienes | Máxima privacidad; permite modelo local si el equipo tiene potencia. Depende de tu hardware y de que esté encendido. |
| **Turso (libSQL) gratis** + hosting serverless | 0 € | 100 bases, 5 GB, 500 M lecturas/mes [H·s]. |
| Supabase gratis | 0 € | **Pausa el proyecto tras 1 semana sin actividad** [H·s]: mala opción para algo personal que podrías no abrir en vacaciones. |

**Sincronización cliente**: los motores *local-first* (Zero 1.0, Electric, PowerSync, LiveStore) han madurado [H·s], pero para **una sola persona** basta una caché en IndexedDB y una **cola de salida** para capturas offline [I]. Se revisará si aparece un problema real.

### 3.7 IA y coste

- **Gemini API gratis**: límites de alrededor de 10 RPM / 1 500 peticiones al día en modelos Flash según fuentes que no coinciden, y **los datos del plan gratuito pueden usarse para entrenar y revisarse por personas** [H·s]. Inadecuado para correos privados; aceptable para texto no sensible.
- **Gemini Nano en Chrome (Prompt API)**: **no funciona en Android**, solo en escritorio. [H·r] Chrome for Developers.
- **Modelos locales (Ollama)**: viables en un PC con 16 GB o más para 7–8B parámetros; en CPU sin GPU, unos 7 tokens/s con un modelo de 3,8B (una sola prueba); hay fallos reportados en llamadas a herramientas. [H·s]
- **Suscripciones**: según fuentes secundarias, Claude Pro/Max no incluye API para apps propias [H·s]. No asumo que tu «cloud» sea Claude.
- **Prueba propia sin IA** (sección 3.9): el parser determinista en español acierta en frases simples pero falla en varias habituales.

[P] Fase 1 **sin IA**: parser determinista + vista previa + preguntas cuando haya ambigüedad. La IA se evalúa en la fase 3 con un banco de frases reales tuyas.

### 3.8 Ayudas para el agente

| Ayuda | Tipo | Decisión |
|---|---|---|
| Astro Docs MCP | MCP (acceso a docs) | Incorporar **solo si** se elige Astro. |
| Svelte MCP (`@sveltejs/mcp`) | MCP | Incorporar si se elige Svelte/SvelteKit. Revisar su contenido antes. |
| Playwright (`@playwright/test` 1.64.1 [H]) | Herramienta de pruebas | **Sí, desde el prototipo**: recorridos y capturas en 360 × 800, 412 × 915 y 1440 × 900, en oscuro y claro. Chromium ya está instalado en el entorno. |
| Figma MCP | MCP | **No por ahora**: no usamos Figma y el conector falló en esta sesión. El diseño se decide en prototipo navegable. |
| Skills propias | Procedimientos | Añado dos breves: `investigar-antes-de-construir` y `revision-visual` (en `.claude/skills/`). |

### 3.9 Prueba propia: fechas en español sin IA

`research/chrono-es/prueba.mjs` con chrono-node 2.10.3 (locale `es`, «parcial» según su README [H·r]):

| Frase | Resultado | ¿Correcto? |
|---|---|---|
| tengo que pedir cita en la peluquería | sin fecha | ✅ (debe ir al backlog) |
| llamar a mamá mañana | mañana | ✅ |
| dentista el martes a las 17:30 | martes 17:30 | ✅ (zona horaria a configurar) |
| cena con Ana el viernes a las nueve y media | viernes, **sin hora** | ❌ no entiende horas en palabras |
| ensayo viernes de 9:30 a 11:30 | viernes 9:30 + «11:30» suelto (asume **mañana**) | ⚠️ rango mal unido; ambigüedad sin señalar |
| renovar DNI la semana que viene | sin fecha | ❌ |
| pagar seguro el 3 de noviembre | 3 nov | ✅ |
| revisar CV pasado mañana por la tarde | «mañana» | ❌ confunde pasado mañana |
| en dos semanas devolver el libro | +14 días | ✅ |
| antes del 15 enviar factura | interpreta «15» como hora | ❌ |

[I] Conclusión: 5 de 10 aciertos completos. Hace falta una capa propia de reglas en español (horas en palabras, «pasado mañana», «la semana que viene», rangos, «antes del») y **mostrar siempre la interpretación**. Esto justifica la vista previa de Fantastical y la pregunta de mañana/noche: el parser elige la mañana por defecto, justo el error que quieres evitar.

---

## 4. Comparación y recomendación provisional

### Criterios (peso)
Recorridos R1–R3 sin fricción (alto) · rendimiento en Android medio (alto) · offline y captura en cola (alto) · simplicidad para una persona (alto) · coste 0 € (alto) · tu preferencia por Astro (medio) · madurez (medio).

| Criterio | SvelteKit 3 | Astro 7 + isla Svelte | React Router 8 |
|---|---|---|---|
| Estado persistente entre vistas | Nativo (*layout*) | `transition:persist` + Nano Stores | Nativo |
| Refresco tras mutación | `invalidate` | Manual | *Revalidation* nativa |
| Service worker / offline | Integrado | A mano (plugin PWA no declara Astro 7) | A mano o plugin |
| JS en móvil | Bajo | Bajo | Medio |
| Madurez de la versión | 17 días (riesgo) | 4 meses | Madura |
| Preferencia tuya | — | ✅ | — |

### Recomendación provisional [P]
1. **Componentes de interfaz en Svelte 5**, sea cual sea el contenedor. Así el diseño y los componentes sirven igual en Astro o en SvelteKit y la decisión sale más barata.
2. **Contenedor: SvelteKit 3**, por ahora. Para una app autenticada que cambia sin parar, sus primitivas (*layouts*, invalidación, *actions*, *service worker*) cubren directamente R1–R3. Lo que hace fuerte a Astro (contenido estático y HTML sin JS) no aplica tras el login.
3. **No descarto Astro**: propongo una **prueba de un día** que construya el mismo trozo (Hoy + captura offline + refresco tras completar) en Astro 7 y en SvelteKit 3, y medir: KB de JS, tiempo hasta interacción con CPU 4× más lenta, líneas de código propias para estado y offline, y bugs encontrados. **Si Astro empata o queda cerca, elegimos Astro por tu preferencia.**
4. **Datos**: SQLite con Drizzle (portable entre D1, libSQL y archivo local). Caché en IndexedDB y cola de salida en el cliente. Sin motor *local-first* por ahora.
5. **Despliegue**: depende de la pregunta 3. Por defecto, Cloudflare Workers gratis + D1; si tienes un equipo siempre encendido, Node + SQLite allí con acceso privado.
6. **Acceso a la app**: *passkey* (WebAuthn) como entrada principal y Google como alternativa, limitado a tu correo. Cuentas de datos conectadas aparte, tokens cifrados en reposo.
7. **Tareas** en la base de datos propia; **eventos** con Google Calendar como fuente de verdad y metadatos de flexibilidad propios (investigaré en la fase 1 si guardarlos en `extendedProperties.private` del evento).
8. **Sin IA en la fase 1.**

---

## 5. Plan de diseño y prototipo

### 5.1 Proceso
1. **Analizar las capturas reales** (cuando pueda verlas) y completar la tabla 3.1 con lo observado.
2. **Un único conjunto de datos ficticios** (JSON) para todas las composiciones: ensayo de los viernes (hora ambigua a propósito), dentista el martes 17:30, «pedir cita en la peluquería» sin fecha, cena con Ana que choca con el ensayo, tres resultados de «CV» con distinta certeza en dos cuentas, vacaciones del 22 al 26 de diciembre en un calendario personal y un correo de RR. HH. sin responder.
3. **Tres composiciones navegables** en HTML/CSS/Svelte mínimo (desechables), cada una con: Hoy, captura, búsqueda; móvil (360 × 800 y 412 × 915) y escritorio (1440 × 900); oscuro y claro; estados vacío, cargando, error (cuenta desconectada) y conflicto.
4. **Capturas automáticas con Playwright** de cada combinación y una hoja de contacto para que compares lado a lado.
5. Revisión contigo → eliges dirección (o mezcla) → **tokens y componentes** definitivos.

### 5.2 Las tres composiciones (borrador)

**A · «Lista serena»** (Things + Bear). Una columna, secciones por tipografía y no por tarjetas: *Ahora*, *Hoy*, *Hecho*, *Atención*, *Próximos días*. Captura en una barra inferior fija en móvil y en un atajo ⌘K/Ctrl+K en escritorio. Escritorio: barra lateral translúcida + lista + panel de detalle.
```
┌─────────────────────────┐
│ Domingo 18              │
│ ● 17:30 Dentista  [Pers]│  ← «Ahora», única con elevación
│ HOY                     │
│ ○ Pedir cita peluquería │
│ ○ Revisar CV            │
│ ATENCIÓN · 1            │
│ ! Correo RR. HH. 3 días │
│ PRÓXIMOS  L  M  X  J  V │
│ ┌─────────────────────┐ │
│ │ + Escribe o dicta…  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**B · «Línea del día»** (Structured + Flighty). Línea de tiempo vertical con marcador de «ahora», **huecos libres visibles** y tareas sin hora en una bandeja superior que se arrastran al hueco. Estados condensados («en 40 min», «libre hasta las 19:00»). Escritorio: línea del día + semana compacta a la derecha.

**C · «Foco»** (Ajedrez + Fantastical). Una tarjeta protagonista «Lo siguiente» con material y sombra cuidados sobre fondo con degradado granulado sutil; debajo, una franja DayTicker de 7 días y una lista corta. La búsqueda es el centro de la navegación (iA Writer): un campo único arriba. Escritorio: tres paneles (mini calendario, día, detalle).

Las tres comparten la captura con vista previa de la interpretación y el diálogo de conflicto del R3.

### 5.3 Criterios concretos de aceptación del prototipo
- **Contraste**: texto ≥ 4,5:1 y componentes/indicadores ≥ 3:1 (WCAG 2.2 AA) en ambos temas.
- **Táctil**: objetivos ≥ 48 × 48 dp en Android; acciones principales al alcance del pulgar (mitad inferior).
- **Densidad inicial**: en 360 × 800, máximo 7 elementos visibles en Hoy antes de desplazar; el resto se amplía con un gesto.
- **Origen visible**: cada evento y resultado muestra su cuenta (color **y** texto, nunca solo color).
- **Ambigüedad**: el prototipo nunca muestra «09:30» del ensayo sin señalar «¿mañana o noche?» hasta que se aclare.
- **Tema**: tres opciones (Sistema, Oscuro, Claro). Diseño pensado primero en oscuro. Sin parpadeo del tema al cargar.
- **Movimiento**: 150–250 ms, curvas suaves o muelles sobrios; todo se desactiva con `prefers-reduced-motion`.
- **Teclado y lector de pantalla**: Hoy, captura y búsqueda usables solo con teclado; orden de foco lógico; etiquetas accesibles.
- **Android**: gesto atrás cierra hojas y diálogos antes de salir de la vista; sin contenido bajo las barras del sistema; probado en Chrome Android emulado con Playwright y, cuando lo instales, en tu Honor real.
- **Rendimiento del prototipo**: primera pintura con contenido < 1,5 s en perfil de móvil medio emulado.

### 5.4 Dirección inicial de tokens (borrador, a validar con el prototipo)
- **Oscuro**: fondo casi negro cálido (no #000), 3 niveles de superficie por luminosidad, texto principal ~92 % y secundario ~62 % de luminosidad, **un único acento** y colores por cuenta desaturados.
- **Claro**: fondo blanco roto, superficies con sombra muy suave en vez de bordes.
- **Tipografía**: comparar en el prototipo `system-ui` (SF en Mac, Roboto en Android: sensación nativa en cada dispositivo) frente a una variable única como Inter (la misma identidad en ambos). Escala de 6 tamaños como máximo.
- **Espaciado**: retícula de 4 px, márgenes generosos (20–24 px en móvil), radios de 10–16 px.

---

## 6. Preguntas imprescindibles

1. **Ensayo**: ¿09:30–11:30 o 21:30–23:30? ¿Está ya en un Google Calendar? ¿En cuál?
2. **Cuentas**: ¿cuántas cuentas Google, cuáles son personales y cuáles de trabajo o estudios? ¿En cuáles quieres permitir escritura?
3. **Alojamiento**: ¿tienes un equipo siempre encendido (NAS, Raspberry Pi, PC)? Si no, ¿te parece bien que la app y tus tokens cifrados vivan en Cloudflare (gratis)?
4. **«Cloud»**: ¿qué suscripción es exactamente (proveedor y plan)?
5. **Móvil**: modelo del Honor, versión de Android/MagicOS y navegador que usas. ¿Tiene servicios de Google Play?
6. **Vacaciones formales**: ¿cómo las solicitas hoy en el trabajo (portal, correo, otra herramienta)?
7. **Stack**: ¿aceptas la prueba Astro vs SvelteKit con el criterio de «si Astro empata, gana Astro»?

---

## 7. Plan de fases revisado [P]

Cambio principal: entregas más pequeñas y **útiles desde la primera semana sin Google**, y app instalable desde la fase 1.

| Fase | Contenido | Por qué este orden |
|---|---|---|
| **0b** | Prototipo navegable A/B/C con datos ficticios + capturas Playwright → eliges dirección → tokens. | Decisión visual antes de código definitivo. |
| **0c** | Prueba técnica Astro vs SvelteKit (1 día) + prueba OAuth (1 cuenta, lectura de calendario, token vivo a 8 días). | Cierra la arquitectura con datos medidos. |
| **1a** | Hoy + captura (offline) + backlog con tareas locales; app instalable con accesos directos y *share target*; temas. | Útil ya sin integraciones. |
| **1b** | Lectura de N calendarios Google con procedencia; zonas horarias. | Lectura antes que escritura. |
| **1c** | Compromisos flexibles, excepciones por ocurrencia, escrituras confirmadas y verificadas. | Requiere 1a + 1b. |
| **2** | Búsqueda en Drive/Gmail en vivo vía API con procedencia y certeza; índice solo si hace falta. | Permisos restringidos: solo en cuentas que elijas. |
| **3** | IA opcional y memoria revisable (investigación comparativa antes de elegir). | Necesita uso real para aprender. |
| **4** | Planificación ante conflictos y gestiones externas (Yeasy: investigación específica). | Acciones irreversibles al final. |
| **5** | Widget Android nativo (Glance) si aporta valor tras usar los accesos directos. | Exige app nativa. |

---

## 8. Fuentes (consultadas el 18-10-2026)

Registro npm (fuente primaria, consulta directa): `astro`, `@astrojs/svelte`, `@astrojs/node`, `@astrojs/cloudflare`, `@vite-pwa/astro`, `@sveltejs/kit`, `svelte`, `@sveltejs/mcp`, `@sveltejs/adapter-node`, `@sveltejs/adapter-cloudflare`, `next`, `react-router`, `@tanstack/react-start`, `hono`, `drizzle-orm`, `@libsql/client`, `dexie`, `better-auth`, `arctic`, `chrono-node`, `@playwright/test` — https://www.npmjs.com/

Vía buscador (resumen; no pude abrir las páginas):
- Astro 7.0 — https://astro.build/blog/astro-7/
- Astro 6 beta — https://astro.build/blog/astro-6-beta/
- Compartir estado entre islas — https://docs.astro.build/en/recipes/sharing-state-islands/
- Astro Docs MCP — https://docs.astro.build/en/guides/build-with-ai/
- Cloudflare adquiere Astro (16-01-2026) — https://secure.businesswire.com/news/home/20260116386991/en/Cloudflare-Acquires-Astro-to-Accelerate-the-Future-of-High-Performance-Web-Development
- SvelteKit 3 — https://svelte.dev/blog/sveltekit-3-is-here · Remote functions — https://svelte.dev/docs/kit/remote-functions
- Google: refresh tokens en Testing — https://developers.google.com/health/setup · foro — https://discuss.google.dev/t/oauth2-refresh-token-expiration-and-youtube-api-v3/160874
- Google: exenciones de verificación — https://support.google.com/cloud/answer/13464323 · FAQ (tope de 100 usuarios) — https://support.google.com/cloud/answer/13463817 · Apps no verificadas — https://support.google.com/cloud/answer/7454865
- Permisos de Drive — https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- Eventos recurrentes — https://developers.google.com/workspace/calendar/api/guides/recurringevents
- Better Auth Google — https://www.better-auth.com/docs/authentication/google
- Cloudflare Workers límites — https://developers.cloudflare.com/workers/platform/limits
- Prompt API (no en Android) — https://developer.chrome.com/docs/ai/prompt-api
- Chrome 139 (voz en el dispositivo) — https://developer.chrome.com/blog/new-in-chrome-139
- WebAPK — https://chromium.googlesource.com/chromium/src/+/main/chrome/android/webapk/README.md · Share target — https://web.dev/web-share-target
- Jetpack Glance — https://developer.android.com/develop/ui/compose/glance
- Things for OS 26 — https://culturedcode.com/things/blog/2025/09/things-for-os-26/
- Ajedrez de macOS — https://9to5mac.com/2024/06/14/macos-sequoia-apple-chess-game/ · https://www.techradar.com/computing/mac-os/macos-sequoia-could-soon-spark-your-pawn-addiction-with-its-rebooted-chess-game
- Flighty «Behind the Design» (Apple, 06-2023) — https://cur.at/VcCahLU · análisis — https://blakecrosley.com/guides/design/flighty
- iA Writer notas de versión — https://ia.net/writer/support/help/version-history/release-notes-ipad
- Fantastical — https://www.macstories.net/reviews/fantastical-for-iphone-review/ · MCP — https://www.producthunt.com/products/fantastical/launches/fantastical-scheduling
- Material 3 Expressive — https://9to5google.com/2025/05/13/android-16-material-3-expressive-redesign/

Fuentes secundarias (contrastar antes de decidir): Gemini free tier — https://klymentiev.com/blog/gemini-api-free-tier · Supabase pausa — https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/ · Turso — https://agentdeals.dev/vendor/turso · Gmail CASA — https://www.leviathansecurity.com/programs/google-casa-cloud-application-security-assessment · Local-first 2026 — https://infoq.com/news/2026/06/zero-version-1 · Ollama en CPU — https://itsfoss.com/testing-local-llms-without-gpu · Claude Pro y API — https://www.superblocks.com/blog/claude-code-pricing · Planificadores 2026 — https://www.asianefficiency.com/task-management/best-daily-planner-apps-ai/
