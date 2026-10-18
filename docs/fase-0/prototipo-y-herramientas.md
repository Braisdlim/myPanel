# Fase 0b — Prototipo navegable, herramientas de IA para Astro y NAS

Fecha: **18 de octubre de 2026**. Las etiquetas [H], [H·r], [H·s], [I], [P] y [?] significan lo mismo que en [`investigacion-y-propuesta.md`](investigacion-y-propuesta.md).

## 1. Tus respuestas y qué cambian

| Respuesta | Efecto |
|---|---|
| Ensayo a las 21:30 (noche) | El ensayo queda como rutina opcional los viernes de 21:30 a 23:30. El prototipo ya muestra el conflicto con una cena a las 21:00. |
| Dos cuentas de Gmail | Diseño para dos cuentas desde el principio. Al ser cuentas personales de Gmail, no hay un administrador de Workspace que pueda bloquear la app [I]. |
| NAS posible | Analizado en la sección 2. Por ahora no hace falta; la arquitectura quedará preparada para usarlo. |
| Honor 600 Pro con Google Play | Pantalla de 1264 × 2728 px, MagicOS 10 sobre Android 16 [H·r]. Con Google Play, Chrome debería instalar la app como WebAPK [I]. Ancho CSS estimado: unos 412–421 px [I]; el prototipo se prueba a 412 px y a 360 px. |
| Vacaciones por portal corporativo desde el PC de empresa | La app **no** tramitará vacaciones. Solo distingue «día libre apuntado en tu calendario» y puede recordarte pedirlo en el portal. Se elimina esa integración del plan. |
| Astro, sí | **Decisión tomada: Astro 7** con islas Svelte 5. El prototipo ya está hecho con ese stack (sección 5). |

## 2. ¿Para qué serviría un NAS?

Un NAS (o un miniPC) es un ordenador pequeño de tu casa, siempre encendido. Para myPanel aportaría lo siguiente:

| Capacidad | ¿Necesita un equipo siempre encendido? | Con Cloudflare gratis | Con NAS |
|---|---|---|---|
| Hoy, captura, tareas, calendario (fases 1a–1c) | No | ✅ Suficiente | ✅ |
| Sincronizar calendarios en segundo plano y avisos | Sí, algo que despierte periódicamente | ✅ Hasta 5 tareas programadas gratis [H·r] | ✅ Sin límites |
| Índice propio de Drive/Gmail para búsquedas rápidas (fase 2) | Sí | ⚠️ Posible, pero tus correos indexados quedarían en un proveedor | ✅ **Los datos se quedan en casa** |
| Búsqueda semántica con un modelo local pequeño (fase 2–3) | Sí, y CPU suficiente | ❌ | ✅ Viable para modelos pequeños de *embeddings* [I] |
| Modelo de lenguaje local (fase 3) | Sí, y mucha CPU/GPU | ❌ | ⚠️ Lento en la CPU típica de un NAS [I] |
| Automatizar el navegador para Yeasy (fase 4, si no hay API) | Sí | ❌ No en el plan gratuito [I] | ✅ Playwright en Docker |
| Copias de seguridad de tu base de datos | — | Depende del proveedor | ✅ Bajo tu control |

**Costes y riesgos** [I]: hardware y discos (no he verificado precios), electricidad, mantenimiento (actualizaciones y copias), y que si se apaga o cae la conexión de casa la app solo mostrará lo que tenga en caché. Para acceder desde el móvil sin abrir puertos hay dos vías: **Tailscale** (red privada; hay que tener su app activa en el Honor) o **Cloudflare Tunnel + Access** (sin app extra; Cloudflare autentica antes de llegar a casa). Tailscale documenta el uso con contenedores Docker [H·r].

**Si vas a comprar algo** [I]: para *ejecutar apps* (no solo guardar archivos), un miniPC x86 con Docker suele dar más CPU por euro que un NAS de gama de entrada. Un NAS compensa si además quieres discos para fotos y copias.

**Recomendación** [P]: no lo necesitas para la fase 1. Empiezo con un código que funcione igual en Cloudflare y en un equipo con Node (Astro tiene adaptadores para ambos y SQLite es portable). Decidimos lo del NAS **antes de la fase 2**, cuando haya que indexar correos y documentos.

## 3. Skills y herramientas para que la interfaz quede excelente con Astro e IA

He clonado y **leído** el contenido de cada candidata antes de recomendarla.

| Herramienta | Qué es | Estado comprobado | Decisión |
|---|---|---|---|
| **frontend-design** (plugin oficial de Anthropic) | Skill de proceso de diseño: plan de tokens, revisión contra el encargo, construir y autocrítica con capturas. Lista los rasgos típicos del diseño generado por IA para evitarlos. | [H] Repositorio `anthropics/claude-code`, versión 1.1.0, último cambio 17-10-2026. Licencia: todos los derechos reservados, así que **no la copio**: se activa como plugin. | ✅ Activada en `.claude/settings.json` para las próximas sesiones. Ya he aplicado su proceso en este prototipo. |
| **Astro Docs MCP** | Acceso a la documentación actual de Astro (servidor remoto gratuito). | [H] Guía oficial `build-with-ai.mdx` del repositorio `withastro/docs` (actualizado 16-10-2026). | ✅ Añadido en `.mcp.json`. [?] Desde este entorno en la nube no tengo red hacia ese dominio; mientras tanto consulto la documentación oficial clonando su repositorio. |
| `incluud/astro-agent-skills` | Skills comunitarias: buenas prácticas, componentes, colecciones de contenido. | [H] Último cambio 23-04-2026 (anterior a Astro 7); orientadas a webs de contenido. | ❌ No la adopto entera. Tomo dos ideas para nuestra skill: hidratar solo lo necesario y lista de revisión de accesibilidad. |
| `FredKSchott/astro-skills` | Integración para **publicar** skills desde una web Astro. | [H] Leído el README. | ❌ No sirve para construir interfaces. |
| **Svelte MCP** (`@sveltejs/mcp`) | Documentación y análisis de componentes Svelte. | [H] npm 0.1.26. | ⏳ Lo evaluaré al empezar la fase 1 (versión 0.x). |
| Skills de diseño de este entorno (`design:design-critique`, `design:accessibility-review`, `design:ux-copy`) | Revisión de diseño, accesibilidad y textos. | [H] Disponibles en esta sesión. | ✅ Para las rondas de revisión. |
| **Skill propia `diseno-mypanel`** | Tu encargo visual, los tokens, la calidad mínima y el proceso, en una página. | Creada en `.claude/skills/diseno-mypanel/`. | ✅ Es la que manda si hay conflicto. |
| **Playwright** | Capturas automáticas de cada composición, tema, estado y dispositivo. | [H] Ya funciona: 52 capturas en `docs/fase-0/capturas/`. | ✅ |
| Figma MCP | Diseño en Figma. | El conector falló en esta sesión y no usamos Figma. | ❌ Decidimos en prototipo navegable. |

**Forma de trabajar propuesta** [P]: (1) el plan visual se escribe como tokens; (2) se construye en el stack real; (3) se generan capturas de móvil y escritorio en ambos temas; (4) yo reviso las capturas y corrijo **antes** de enseñártelas (en esta ronda corregí horas solapadas, bloques recortados, un botón desplazado y un contraste insuficiente); (5) tú revisas en tu Honor; (6) los tokens se congelan y pasan a la app.

## 4. Prototipo

- **Ábrelo en el móvil**: https://claude.ai/artifact/1J3LjR2F2K3Mu3tsYqtsuM (privado; solo tú). Botón «Revisión» arriba a la derecha para cambiar composición, pantalla, estado, tema y tipografía.
- **Capturas**: [`capturas/`](capturas/) — nombre `composición-pantalla-estado-tema-dispositivo.jpg`.
- **Código**: [`../../prototype/`](../../prototype/) (Astro 7.4.0 + Svelte 5.57.2). Desechable: sirve para decidir, no es la app.

### Las tres composiciones (mismos datos)
| | A · Lista serena | B · Línea del día | C · Foco |
|---|---|---|---|
| Idea | Una columna; jerarquía por tipografía (Things, Bear). | El día como línea de tiempo con huecos libres visibles (Structured, Flighty). | Un único protagonista y una franja de días (Ajedrez de macOS, Fantastical, iA Writer). |
| Captura | Botón flotante → hoja inferior. | Campo siempre visible encima de la barra inferior; sugiere huecos libres. | Un solo campo «Busca o apunta algo» con modos visibles. |
| Búsqueda | Pestaña propia. | Pestaña propia. | Dentro del mismo campo (paleta). |
| Escritorio | Barra lateral + día + próximos días. | Barra superior con captura + línea del día + columna de atención y próximos días. | Tres paneles: mes y cuentas, foco, próximos días. |
| Fuerte | La más clara y tranquila. | La mejor para decidir **cuándo** hacer algo. | La más «premium» y rápida de leer. |
| Débil | Menos visual para planificar. | Más densa; exige más pantalla. | Mezclar buscar y apuntar puede confundir. |

Elementos comunes: tarjeta «Lo siguiente» con el único tratamiento de material; cuenta de origen con punto y nombre; vista previa de la interpretación al apuntar, con pregunta «¿21:30 o 09:30?» cuando hay ambigüedad; elegir explícitamente dónde guardar (solo myPanel o Google Calendar con cuenta); diálogo de conflicto con «faltar solo este viernes» y aviso de que la serie no cambia; búsqueda con certeza, ubicación, cuenta, fecha y qué cuentas **no** se han buscado.

### Comprobación de los criterios de la fase 0
| Criterio | Estado | Evidencia |
|---|---|---|
| Contraste texto ≥ 4,5:1 | ✅ Tras corregir el ámbar de «atención» en claro (4,43 → 5,35) | Script de contraste sobre los tokens |
| Objetivos táctiles ≥ 48 px | ✅ Filas, casillas, pestañas y botones principales | Código y capturas |
| ≤ 7 elementos visibles en Hoy (360 × 800) | ✅ A y C; B muestra la semana y la bandeja antes de la línea | `*-hoy-normal-dark-movil360.jpg` |
| Cuenta con texto, no solo color | ✅ (en listas compactas el nombre está como texto accesible) | Capturas |
| Hora ambigua señalada | ✅ | `*-captura-*` |
| Tema Sistema/Oscuro/Claro sin parpadeo | ✅ Script en `<head>` antes de pintar | `index.astro` |
| Movimiento reducido | ✅ Duraciones a 0 con `prefers-reduced-motion` | `tokens.css` |
| Teclado y foco | ⚠️ Parcial: foco visible, diálogos con Escape y foco inicial; falta una auditoría completa | Pendiente fase 1 |
| Gesto atrás de Android cierra hojas | ❌ No implementado en el prototipo | Pendiente fase 1 |
| Primera pintura < 1,5 s en móvil medio | ⏳ Sin medir; el paquete pesa 36 KB de JS comprimido | Medir en la fase 1 |

### Lo que el prototipo enseña sobre Astro [H]
- Astro 7.4 + `@astrojs/svelte` 9.1 compiló a la primera (build de ~1,6 s). JS total: **~36 KB comprimidos** (runtime de Svelte + app).
- Toda la app es **una isla** (`client:only`), como anticipé: tras el login Astro aporta el armazón, el servidor y las rutas; la interactividad es Svelte. En la fase 1 usaré renderizado en servidor, Actions y sesiones de Astro.
- Astro 7 detecta agentes y lanza `astro preview` en segundo plano: útil, pero hay que tenerlo en cuenta en los scripts de prueba.
- La documentación oficial confirma: sesiones desde 5.7.0, `transition:persist` para mantener la barra de captura entre páginas y API de fuentes con proveedores locales [H]. No hay guía de *service worker*: se escribirá a mano en la fase 1a.

## 5. Qué necesito que decidas
1. **Composición**: ¿A, B, C o una mezcla? Mi propuesta [P]: **Hoy de C** (foco + franja de días) con **captura de A** (botón flotante + hoja) y **la línea del día de B como vista «Planificar»** para colocar pendientes en huecos.
2. **Tipografía**: Figtree (amigable, redonda), Onest (más neutra y técnica) o la del sistema (Roboto en tu Honor). Mi propuesta: Figtree.
3. **Acento ámbar** («luz de lámpara»): ¿te gusta o prefieres otro tono?
4. **NAS**: ¿lo dejamos para antes de la fase 2?

## 6. Siguiente paso
Con tu elección: congelo tokens y componentes, y empiezo la **fase 1a** (Hoy + captura offline + pendientes con tareas locales, app instalable con accesos directos y «compartir con»). Antes repetiré la investigación de persistencia, autenticación y *service worker* en Astro 7.
