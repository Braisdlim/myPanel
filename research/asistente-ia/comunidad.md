# Cómo lo hace la comunidad: asistentes de correo, archivos y calendario con presupuesto cero (19-10-2026)

Investigación para el asistente de Pauta: buscar correos en varias cuentas de Gmail y Outlook, encontrar archivos en Drive y OneDrive, y crear eventos a partir de una frase en español, también dictada por voz, siempre con confirmación. Un solo usuario y unas decenas de peticiones al día. Presupuesto: cero euros y poco mantenimiento.

Esto **no es una prueba de modelos**. Recoge qué usan, recomiendan y desaconsejan otras personas con sistemas parecidos. Complementa `modelos-api.md` (precios y límites oficiales a 18-10-2026), `modelos-locales.md` y `arquitectura-y-permisos.md`.

**Etiquetas.** **[H]** dato comprobado en fuente primaria (documentación, condiciones o código del proveedor o proyecto). **[H·s]** fuente secundaria o foro: es la opinión o experiencia de una persona. **[I]** inferencia mía. **[?]** incierto o sin comprobar. Junto a cada afirmación indico si la dice **una persona** (anécdota) o si hay **consenso** (varias fuentes independientes).

**Límites de esta investigación.** Lo que no he podido consultar:

- **Reddit:** no lo he podido leer. La web y la API devuelven 403, el RSS redirige a la pantalla de inicio de sesión, los espejos tipo Redlib tienen una comprobación antibots que no he querido saltarme y el buscador tiene `reddit.com` vetado. Por eso **no cito ningún hilo de Reddit**. Algunos blogs dicen resumir «lo que recomienda Reddit», pero son de empresas que venden algo y no los uso como fuente.
- **Repositorio `cheahjs/free-llm-api-resources`:** `raw.githubusercontent.com` devuelve 404 en las ramas main, master y HEAD, mientras que otros repositorios se leen bien. Las páginas de github.com están bloqueadas en este entorno. No sé si el repositorio se ha borrado, renombrado o hecho privado [?]. Hay agregadores que lo dan por activo, pero no lo he verificado.
- **Latent Space:** no he encontrado nada específico sobre este caso de uso.

En su lugar he usado Hacker News (API de Algolia), los foros Discourse de Home Assistant y de n8n, el catálogo público de plantillas de n8n, el blog de Simon Willison y el código y la documentación de proyectos abiertos.

---

## Resumen en 10 líneas

1. **Consenso:** a coste cero, los aficionados usan **Gemini (plan gratuito de AI Studio)**, **Groq** y los modelos `:free` de **OpenRouter**, y con frecuencia los combinan con un respaldo [H·s, varios foros].
2. Las plantillas públicas de n8n para correo y calendario se apoyan sobre todo en OpenAI y Gemini. Las que dicen «basta con el plan gratuito» suelen usar Gemini o Groq [H, recuento propio].
3. Los límites gratuitos chocan con el uso real. Gemini Flash gratis da **unas 20 peticiones al día** y devuelve 429 y 503 en horas de carga [H·s, foros de n8n, 2026]. Cerebras **ya no tiene plan gratuito permanente** [H].
4. Hay un **consenso fuerte** en que **las fechas no se las dejes calcular al modelo**: hay que darle la fecha actual y la zona horaria, o resolver «mañana» o «el viernes» con código antes de llamarlo [H·s, n8n].
5. Otra idea que se repite: **lo determinista primero y el modelo solo de respaldo**. Home Assistant resuelve antes las órdenes locales y un usuario mide un clasificador a unos 0,00006 USD por orden [H·s].
6. En voz y en idiomas que no son el inglés, `gpt-oss-120b` **filtra su razonamiento y se repite** según un usuario que lo usó durante meses en alemán. `gpt-oss-20b` le fue mejor en eso [H·s, anécdota].
7. La seguridad que más se recomienda viene de Simon Willison: evitar la **«tríada letal»**, es decir, juntar datos privados, contenido no fiable y un canal de salida. La solución práctica es que el modelo **no lea los correos**, solo traduzca la frase a una búsqueda [H, I].
8. **Modelos chinos:** en foros técnicos se valoran bien en llamadas a herramientas y por precio (MiniMax, Kimi, GLM, DeepSeek Flash). La preocupación es la **jurisdicción**: DeepSeek guarda los datos en China [H]. También se habla de posibles «puertas traseras» en modelos con herramientas [H·s, minoritaria].
9. Hay pasarelas que juntan varios planes gratuitos, como FreeLLMAPI o LiteLLM. Sus propios autores dicen que **no sirven para producción**: la calidad baja a lo largo del día y los límites cambian sin aviso [H].
10. **Lo más sorprendente:** las condiciones de Gemini (actualizadas el 28-4-2026) dicen que **solo se pueden usar servicios de pago para clientes de API ofrecidos a usuarios del EEE**, y limitan el uso a fines «profesionales o de empresa, no de consumo» [H]. Para una app personal en España el plan gratuito queda en zona gris.

---

## Qué usa la gente

| Modelo · proveedor | Para qué lo usan | Quién lo dice (tipo) | Fecha | Fuente |
|---|---|---|---|---|
| **Gemini (Flash y Flash-Lite) gratis en AI Studio** | Agente de conversación en n8n y Home Assistant, plantillas «empieza gratis» | Respuestas de foro de n8n (varias personas, **consenso** entre principiantes); un usuario de HA usa «Gemini con su plan gratuito» como agente de conversación | 10-6-2026; 7-9-2026 | [n8n 298906](https://community.n8n.io/t/298906), [HA 1024305](https://community.home-assistant.io/t/1024305) [H·s] |
| Gemini Flash 3.5 Lite (de pago, muy barato) | Asistente de voz de Home Assistant | Un usuario: «blazing fast… intelligent enough to steer my home» (anécdota) | 13-8-2026 | [HA 964603 #27](https://community.home-assistant.io/t/964603) [H·s] |
| **Groq** (Llama 3.3 70B, `gpt-oss`) | Plantillas de n8n con «free tier is enough»: clasificar, resumir, una llamada por ejecución | Autores de plantillas de n8n (varias, **consenso**) | 3-2026 a 9-2026 | [n8n templates](https://n8n.io/workflows/) (p. ej. 13905, 19266, 18959) [H] |
| Groq · `gpt-oss-120b` | Asistente de voz por su latencia: primer token en 0,28 s y 314 tokens/s, según los datos de OpenRouter que cita el usuario | Un usuario de HA que lo dejó por problemas en alemán (anécdota detallada) | 12-2025 a 8-2026 | [HA 964603 #1, #15, #23, #26](https://community.home-assistant.io/t/964603) [H·s] |
| `gpt-oss-120b` por OpenRouter | «Más capaz llamando a las herramientas correctas y más barato que OpenAI» | Otro usuario de HA (anécdota) | 15-2-2026 | [HA 964603 #9](https://community.home-assistant.io/t/964603) [H·s] |
| **OpenRouter `:free`** como respaldo | Alternativa cuando se agota la cuota de Gemini | Varias respuestas en n8n (**consenso**) | 5-2026 y 6-2026 | [n8n 296206](https://community.n8n.io/t/296206), [n8n 298906](https://community.n8n.io/t/298906) [H·s] |
| Gemini principal + Groq de respaldo | Plantilla de incidencias: Gemini «main LLM, free tier is fine» y Groq «backup LLM, also has free tier» | Un autor de plantilla | 22-3-2026 | [n8n plantilla 14237](https://n8n.io/workflows/14237) [H] |
| MiniMax 2.7 (en Groq o Fireworks, de pago) | Voz: «way smarter than gpt-oss-120b». Precio de 0,60 / 1,80 USD por MTok según el usuario | Un usuario de HA (anécdota) | 17-7-2026 y 5-8-2026 | [HA 964603](https://community.home-assistant.io/t/964603) [H·s] |
| DeepSeek V4 Flash (en Baseten, de pago) | Voz y domótica: «very interesting price tag» (0,13 / 0,26 USD); errores por carga en el lanzamiento | Un usuario de HA (anécdota) | 5-8-2026 y 15-8-2026 | [HA 964603](https://community.home-assistant.io/t/964603) [H·s] |
| GLM-5.3-Flash (de pago) | Voz: «fast and cheap» con un buen proveedor | Un usuario de HA (anécdota) | 9-9-2026 | [HA 964603 #29](https://community.home-assistant.io/t/964603) [H·s] |
| MiniMax M2.1 | Asistente OpenClaw: «fast, cheap and excellent at tool calling» | Un usuario de HN (anécdota) | 12-2-2026 | [HN 46991615](https://news.ycombinator.com/item?id=46991615) [H·s] |
| Locales: Qwen 3.6 y 3.8, Ministral 3, Gemma 4 | Domótica local con herramientas | Guía de la comunidad de HA (un autor experto, «dated August 2026») | 19-8-2026 | [HA 1021777](https://community.home-assistant.io/t/1021777) [H·s] |
| Inbox Zero (asistente de correo abierto): **sin modelo por defecto**, con perfiles por función | `DEFAULT`, `ECONOMY`, `CHAT`, `NANO` y `DRAFT`. Para Gemini propone `gemini-3.8-flash` en DEFAULT y DRAFT y `gemini-3.1-flash-lite` en el resto; también Groq, Cerebras y Ollama `qwen3.5:4b` | Código del proyecto | Consultado el 19-10-2026 | [.env.example](https://github.com/elie222/inbox-zero/blob/main/apps/web/.env.example) [H] |

**Recuento en el catálogo de plantillas de n8n** [H, recuento propio con la API pública `api.n8n.io/api/templates/search`, 19-10-2026]:

- **Plantillas de correo, calendario y asistente** publicadas desde el 1-10-2025: 221. Por nodo de modelo: OpenAI en 92, Gemini en 43, OpenRouter en 15, Anthropic en 15, Azure OpenAI en 6, Groq en 5, DeepSeek en 2, Ollama en 1 y Mistral en 1.
- **Plantillas que dicen que basta el plan gratuito:** 13 de 170, buscando sin nombres de proveedor para no sesgar el resultado. Gemini aparece en 4, OpenRouter en 2, Groq en 1 y OpenAI en 1.

**Lectura [I]:** quien publica plantillas «de negocio» usa OpenAI. Quien busca coste cero elige Gemini, Groq u OpenRouter. La muestra es pequeña, y la búsqueda del catálogo no está pensada para estadística.

---

## Qué desaconsejan

| Desaconsejado | Por qué | Quién lo dice | Fecha · fuente |
|---|---|---|---|
| **Dejar que el modelo calcule fechas relativas** | Un agente con Gemini 2.5 Flash reservaba en fechas equivocadas con «today» y «tomorrow». La respuesta del foro: «Pre-process relative dates in a Function node… Don't rely on the model to calculate». En otro hilo, el agente proponía fechas de 2024 y se arregló pasando las franjas con formato | Varias personas en n8n (**consenso**) | 17-9-2025 [n8n 189617](https://community.n8n.io/t/189617); 2-2-2026 [n8n 259554](https://community.n8n.io/t/259554) [H·s] |
| **Contar con el plan gratuito de Gemini como base estable** | Hay errores 429 «Free tier limit 20 requests/day». Hay 503 por saturación: «free tier shares capacity with everyone and gets deprioritized under load». La recomendación es reintentar con espera | Usuarios de n8n | 19-5-2026 [n8n 296206](https://community.n8n.io/t/296206); 26-7-2026 [n8n 304875](https://community.n8n.io/t/304875) [H·s] |
| **Esperar que el modelo de respaldo salte solo** | El nodo de OpenRouter de n8n **no** pasaba al modelo de respaldo cuando el gratuito llegaba al límite por minuto. Hubo que capturar el error a mano | Un usuario y la respuesta del foro | 6-10-2025 [n8n 200772](https://community.n8n.io/t/200772) [H·s] |
| **`gpt-oss-120b` en idiomas distintos del inglés con reglas de estilo** | «starts to leak reasoning text and tends to repeat itself», y ocurre «far less (close to never) when talking english». Acabó con «I decided to stop fighting gpt-oss-120b» | Un usuario de HA con meses de uso (anécdota detallada). Otro sugiere que se estaba saturando el contexto | 17-7 a 5-8-2026 [HA 964603](https://community.home-assistant.io/t/964603) [H·s] |
| **Proxies que juntan varias cuentas de Google** para multiplicar la cuota gratuita | «PSA: Don't use Google accounts that you care about… they shut down all your access (Gmail, Calendar, etc)» | Un comentario en HN (opinión aislada, pero muy pertinente aquí: Pauta usa esas mismas cuentas) | 28-5-2026 [HN 48296259](https://news.ycombinator.com/item?id=48296259) [H·s] |
| **Construir algo «real» sobre planes gratuitos apilados** | «This project is for personal experimentation… If you build something real… swap in a paid API». «Intelligence degrades as the day progresses» porque los mejores modelos agotan antes su cuota | El autor de FreeLLMAPI | Consultado el 19-10-2026 [README](https://github.com/tashfeenahmed/freellmapi) y [limitaciones](https://github.com/tashfeenahmed/freellmapi/blob/main/docs/en/architecture/00-high-level-index.md) [H] |
| **Cohere en plan gratuito para uso personal** | Su apartado 14 prohíbe «personal, family or household purposes» | Revisión de condiciones de FreeLLMAPI, mayo de 2026 | [H·s] (no he leído las condiciones de Cohere) |
| **NVIDIA NIM gratis como servidor** | «evaluation only, not production», 40 peticiones por minuto | Ídem | [H·s] |
| **Fiarse de las listas de «APIs gratis»** | Se quedan viejas. Una lista «mantenida» (`h-michaelson20/free-llm-api-resources`) aún da 14.400 peticiones diarias gratis en Cerebras y lista GitHub Models. Cerebras dice hoy: «doesn't currently offer a no-cost tier that renews automatically» (solo 5 USD de prueba durante 30 días y con tarjeta). GitHub Models se retiró el 30-7-2026 (ver `modelos-api.md`) | Comprobación propia | 19-10-2026 [Cerebras](https://inference-docs.cerebras.ai/support/rate-limits) [H]; [lista](https://github.com/h-michaelson20/free-llm-api-resources) [H] |
| **Facturas sin tope** | «We're going to need default hard budget caps». Prefiere errores a «a surprise $10,000+ bill». Cita los Spend Caps de Google Cloud (julio de 2026) | Simon Willison (opinión de experto) | 3-10-2026 [blog](https://simonwillison.net/2026/Oct/3/default-hard-budget-caps/) [H·s] |
| **Leer correo y poder enviar o abrir enlaces en el mismo agente** | La tríada letal: «If your agent combines these three features, an attacker can easily trick it» | Simon Willison (experto, muy citado: **consenso** en seguridad) | 16-6-2025 [blog](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) [H] |
| **Elegir el modelo por un benchmark** | «Do Not Choose a Model From One Benchmark… test Home Assistant-like work» | Guía de la comunidad de HA | 19-8-2026 [HA 1021777](https://community.home-assistant.io/t/1021777) [H·s] |

---

## Patrones que recomiendan

1. **Lo determinista primero y el modelo después.** En Home Assistant, con «Prefer handling commands locally», las órdenes conocidas se resuelven sin modelo y el resto pasa al agente [H·s, guía de HA, 19-8-2026]. Un usuario midió un clasificador en lugar de un modelo generativo para encender y apagar: entre 250 y 580 ms y unos **0,00006 USD por orden**. Avisa de que todo lo demás necesita un agente de respaldo [H·s, [HA 964603 #30](https://community.home-assistant.io/t/964603), 19-9-2026]. Varias plantillas de n8n lo dicen claro: «the AI is not what decides the result» [H].
   **Para Pauta [I]:** el parser de fechas en español (`research/chrono-es`) va antes que el modelo. El modelo solo rellena lo que el parser no resuelve.
2. **Las fechas, con código.** Hay que inyectar la fecha actual y la zona horaria, convertir las expresiones relativas en fechas absolutas antes de llamar al modelo y pasarle **listas estructuradas** (`availableSlots`) en lugar de texto [H·s, n8n, **consenso**].
3. **Router por funciones o niveles.** Inbox Zero separa `DEFAULT`, `ECONOMY`, `CHAT`, `NANO` y `DRAFT` en su configuración [H]. La guía de HA recomienda «a fast model and a heavier reasoning model» [H·s]. FreeLLMAPI ordena una cadena de respaldo con enfriamiento cuando un proveedor devuelve 429 [H].
4. **Respaldo entre proveedores**, siempre **capturando el error tú**:
   - OpenRouter acepta un array `models` y prueba el siguiente si el primero falla o está limitado [H, [docs](https://openrouter.ai/docs/guides/routing/model-fallbacks)].
   - LiteLLM ofrece `fallbacks` entre grupos de modelos tras `num_retries` [H, [docs](https://docs.litellm.ai/docs/proxy/reliability)].
   - En n8n el respaldo automático no saltaba con el 429 y hubo que capturar el error a mano [H·s].
5. **Menos herramientas y menos contexto.** Un usuario de HA quitó herramientas sin uso y el contexto estático: el modelo busca las entidades con una herramienta índice [H·s]. Leon carga sus herramientas de forma progresiva, «without exposing its full tool surface to unrelated turns» [H, README]. La guía de HA insiste en que **un modelo pequeño fiable con herramientas vale más que uno grande «creativo con los argumentos»** [H·s].
6. **El arnés importa tanto como el modelo.** Cambiar solo el formato de la herramienta de edición subió 15 puntos de media a 16 modelos. Con los formatos de otros proveedores, GLM-4.7 fallaba el 46,2 % de las veces [H·s, [Stencil](https://stencil.so/blog/the-harness-problem), 12-2-2026, en programación]. Otro usuario de HN: Kimi «collapses into tool calling loops» sin las protecciones de su propio CLI [H·s, 12-6-2026].
   **Para Pauta [I]:** esquemas de herramientas pequeños y planos, validación con esquema y un reintento si falla.
7. **Salidas estructuradas.** «You would prefer the model not respond: "Certainly! Here is the JSON…"» [H·s, guía de HA]. FreeLLMAPI «rescata» las llamadas a herramientas que algunos modelos emiten como texto y solo envía las peticiones con herramientas a modelos que las soportan [H].
8. **Confirmar antes de actuar.** En el lanzamiento de April (YC), un asistente de correo y calendario por voz, piden un paso de confirmación aislado del resto del contexto y un «safe mode» de solo lectura. El cofundador responde que ya confirma antes de enviar o borrar [H·s, [HN 45015230](https://news.ycombinator.com/item?id=45015230), 25-8-2025].
9. **Patrones contra la inyección de instrucciones** [H, [Willison sobre Beurer-Kellner et al.](https://simonwillison.net/2025/Jun/13/prompt-injection-design-patterns/), 13-6-2025]:
   - *Action-Selector:* el modelo elige una acción, pero no ve lo que devuelve.
   - *Plan-Then-Execute:* las llamadas se planifican antes de ver contenido no fiable.
   - *Context-Minimization:* se le da al modelo el mínimo contexto posible.

   **Para Pauta [I]:** los tres casos de uso caben en el *Action-Selector*. El modelo convierte la frase en una búsqueda de Gmail o Graph, en una búsqueda de Drive o en un borrador de evento. Los resultados se muestran **sin devolvérselos al modelo**. Así desaparecen a la vez el riesgo de inyección y la mayor parte del problema de privacidad.
10. **Empezar por la búsqueda nativa del proveedor antes de indexar nada.** El fundador de Nango aconseja: «start with a simple tool for your agent to run queries» sobre el endpoint de búsqueda de Gmail o Calendar, y sincronizar solo si hace falta [H·s, [HN 45671561](https://news.ycombinator.com/item?id=45671561), 22-10-2025]. Otro fundador opina lo contrario para búsquedas difíciles: indexar fue imprescindible [H·s, mismo hilo]. Para «el correo de la gestoría con la factura de septiembre» basta la búsqueda nativa [I].
11. **Topes de gasto duros** en cualquier respaldo de pago [H·s, Willison, 3-10-2026].
12. **Tendencia nueva, de septiembre a octubre de 2026: los «modelos de decisión».** Jev, de TypeSafe, devuelve elecciones tipadas en lugar de texto, a 0,042 USD por MTok de entrada y con la salida gratis según el fabricante [H, [blog](https://typesafe.ai/blog/introducing-system-one-models-and-jev), 15-9-2026]. Ya está en Inbox Zero como «decision model» opcional [H], en LiteLLM («Decisions API») [H], en OpenRouter [H] y en integraciones de HA y n8n [H·s].
    **Para Pauta [I]:** no es gratis, está en acceso anticipado y no genera texto libre, así que **no sirve** para producir la búsqueda. Como mucho valdría para clasificar la intención, y eso se puede hacer con reglas.

---

## Modelos chinos

**Calidad con herramientas.** Las opiniones son positivas pero dispersas. **Sin consenso numérico.**

- Kimi «is noticeably better at tool calling than gpt-oss-120b» (un usuario de HN, 7-11-2025). Kimi K2.5 «a lot better than previous open source models» (30-1-2026). Pero también «collapses into tool calling loops» fuera del arnés adecuado (12-6-2026) [H·s, todo anecdótico].
- MiniMax: «fast, cheap and excellent at tool calling» (HN, 12-2-2026). MiniMax 2.7 «way smarter than gpt-oss-120b» en voz (HA, 2026) [H·s].
- GLM: hay quejas por el formato de sus llamadas a herramientas («fighting with GLM's tool calling format», HN 14-4-2026) y fallos en arneses ajenos (HN 15-8-2026). Otro usuario dice: «GLM also works great» con un arnés mínimo (HN 11-9-2026) [H·s].
- DeepSeek: «extreme reasoning heavy and step heavy», lo que encarece cada llamada tras la subida de precios del 16-8-2026 (HN 13-8-2026) [H·s]. Precios actuales de `deepseek-flash`: entre 0,15 y 0,30 USD por MTok de entrada y entre 0,60 y 1,20 de salida, con tarifas de hora valle y hora punta [H, [precios](https://api-docs.deepseek.com/quick_start/pricing)].
- Opinión general en HN: «They deliver 90% of the leading benchmarks at less than one tenth the cost» (17-6-2026). En contra: «There's nothing practical about open-source models yet that makes them even remotely comparable» (17-7-2026). **El debate está dividido** [H·s].

**Precio cero.**

- **Z.ai** ofrece **GLM-4.7-Flash y GLM-4.5-Flash gratis**; el resto, a precio rebajado por tiempo limitado [H, [precios](https://docs.z.ai/guides/overview/pricing), página del 10-10-2026].
- **Moonshot (Kimi)** pasó a ser solo de pago y la vía gratuita de MiniMax es `minimax/minimax-m2.5:free` en OpenRouter [H·s, FreeLLMAPI, abril de 2026].
- **DeepSeek** no tiene plan gratuito en su API [H, página de precios].
- Qwen gratis por Alibaba Model Studio: [?] no lo he podido comprobar.

**Privacidad y jurisdicción.**

- **DeepSeek:** «we directly collect, process and store your Personal Data in People's Republic of China» [H, [política de privacidad](https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html), actualizada el 10-2-2026].
- **Z.ai:** lo opera una sociedad de **Singapur** (JINGSHENG HENGXING TECHNOLOGY PTE. LTD.). Tiene un anexo de tratamiento de datos para la API en el que actúa como encargado del tratamiento para clientes de empresa [H, [política](https://docs.z.ai/legal-agreement/privacy-policy), actualizada el 29-9-2025]. FreeLLMAPI marca Z.ai con «⚠️ Caution» por una cláusula contra la redirección de tráfico [H·s].
- **Puertas traseras en modelos con herramientas** (opinión **minoritaria pero recurrente** en HN): «most open claw users have no idea how easy it is to add backdoors to these models» (18-2-2026). «A bad actor can perfectly create models that sheepishly try to execute a tool call… steganographically exfiltrate» (26-7-2026). Incluso los modelos locales serían «DOA for most USA based companies» por ese riesgo (7-6-2026) [H·s]. Es especulativo: nadie aporta un caso demostrado [I].
- **Mitigación que se repite:** ejecutar los pesos abiertos en local, o con un proveedor occidental que los aloje. Usuarios de HA usan DeepSeek y GLM **en Baseten, Groq o Fireworks**, no en la API china [H·s]. Ojo: la guía de haimaker (que también es proveedor) recuerda que unos pesos abiertos alojados en la nube «still send prompts to external infrastructure» [H·s].

**Para Pauta [I].** Si el modelo solo recibe la frase del usuario y nunca el contenido de los correos (patrón 9), el riesgo de jurisdicción baja mucho: lo que sale es «factura gestoría septiembre», no la factura. Aun así:

- Las búsquedas revelan con quién te relacionas.
- La voz ya transcrita es igual de personal.
- Para un usuario de la UE, enviar datos personales a China exige una base de transferencia (RGPD, capítulo V). No lo he analizado jurídicamente [?].

Si se usan modelos chinos, mejor sus **pesos abiertos alojados en un proveedor de EE. UU. o la UE** (Groq, Cloudflare o Mistral si los ofrece) que su API directa.

---

## Datos de proveedores que cambian la recomendación (comprobados hoy)

- **Gemini API, condiciones adicionales** (actualizadas el 28-4-2026) [H, [terms](https://ai.google.dev/gemini-api/terms)]:
  - «Use of Google AI Studio and Gemini API is for developers building with Google AI models for professional or business purposes, not for consumer use.»
  - «You may use only Paid Services when making API Clients available to users in the European Economic Area, Switzerland, or the United Kingdom.»
  - Para usuarios del EEE, los términos de uso de datos de pago se aplican también a la cuota gratuita.
  - **[I]** Una app que solo usa su propio desarrollador quizá no sea «ponerla a disposición de usuarios», pero es interpretable. FreeLLMAPI marca Gemini con «⚠️ Caution» por la misma cláusula [H·s].
- **Cerebras** solo da 5 USD de prueba durante 30 días y pide tarjeta. No hay plan gratuito que se renueve [H, docs del 7-10-2026].
- **OpenRouter** tiene un ajuste de tope de gasto por clave y una cuota diaria de peticiones a modelos gratuitos que se consulta en `GET /api/v1/key` [H, [limits](https://openrouter.ai/docs/api/reference/limits)].

---

## Propuesta derivada [P]

Es una propuesta para discutir, no una decisión, y no toca `docs/DECISIONES.md`.

1. **Núcleo determinista:**
   - Parser de fechas en español.
   - Plantillas de búsqueda de Gmail, Graph y Drive.
   - Confirmación obligatoria antes de crear nada.
2. **Modelo pequeño solo para traducir la frase** a un JSON con esquema (`{tipo, consulta, cuentas, fecha_inicio…}`), **sin ver los correos**.
3. **Cadena de proveedores con reintento y captura del error en la app:** Groq (gratis, sin entrenar con tus datos) → Cloudflare Workers AI (gratis, sin entrenar) → OpenRouter `:free`, con el ajuste que excluye proveedores que entrenan. Gemini gratis solo si se acepta la zona gris de sus condiciones.
4. **Pruebas en español**, sobre todo para detectar la fuga de razonamiento de `gpt-oss` antes de elegirlo.
5. **Tope de gasto duro** si algún día se añade un respaldo de pago.

---

## Fuentes (consultadas el 19-10-2026)

**Foros y comunidades**

- Home Assistant Community, «Fast (low latency) cloud models with OpenAI compatible endpoint: Which do you use and recommend?», 20-12-2025 a 30-9-2026: https://community.home-assistant.io/t/964603 [H·s]
- Home Assistant Community, NathanCu, «So You Want to AI in Home Assistant», 19-8-2026: https://community.home-assistant.io/t/1021777 [H·s]
- Home Assistant Community, «Managed AI/LLM in Nabu Casa Cloud for Assist?», 7-9-2026: https://community.home-assistant.io/t/1024305 [H·s]
- n8n Community, «AI Agent node failing with Gemini 429… 20 requests/day», 19-5-2026: https://community.n8n.io/t/296206 [H·s]
- n8n Community, «Telegram AI Agent… free alternatives», 10-6-2026: https://community.n8n.io/t/298906 [H·s]
- n8n Community, «Gemini API 503 Error on Free Tier», 26-7-2026: https://community.n8n.io/t/304875 [H·s]
- n8n Community, «AI Agente or Google Calendar gives wrong dates», 2-2-2026: https://community.n8n.io/t/259554 [H·s]
- n8n Community, «Google Calendar Agent – Natural Date Handling», 17-9-2025: https://community.n8n.io/t/189617 [H·s]
- n8n Community, «OpenRouter fallback model not used when free primary model limit hit», 6-10-2025: https://community.n8n.io/t/200772 [H·s]
- Catálogo de plantillas de n8n, API pública: https://api.n8n.io/api/templates/search (recuento propio) [H]

**Hacker News**

- «Anyone built an email or calendar assistant that syncs and indexes data?», 22-10-2025: https://news.ycombinator.com/item?id=45671561 [H·s]
- «Launch HN: April (YC S25) – Voice AI to manage your email and calendar», 25-8-2025: https://news.ycombinator.com/item?id=45015230 [H·s]
- «Show HN: Turn your Google accounts into a free, load-balanced LLM API gateway», 27-5-2026: https://news.ycombinator.com/item?id=48296259 [H·s]
- Comentarios citados sobre modelos chinos:
  - 45844658 (7-11-2025)
  - 46831040 (30-1-2026)
  - 46991615 (12-2-2026)
  - 47065566 (18-2-2026)
  - 48435776 (7-6-2026)
  - 48501216 (12-6-2026)
  - 48571663 (17-6-2026)
  - 49057680 (26-7-2026)
  - 49287098 (13-8-2026)
  - 47766734 (14-4-2026)
  - 49653594 (11-9-2026)
  - 48948353 (17-7-2026)

  URL de cada uno: `https://news.ycombinator.com/item?id=<id>` [H·s]

**Expertos y blogs**

- Simon Willison, «The lethal trifecta for AI agents», 16-6-2025: https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/ [H]
- Simon Willison, «Design Patterns for Securing LLM Agents against Prompt Injections», 13-6-2025: https://simonwillison.net/2025/Jun/13/prompt-injection-design-patterns/ [H]
- Simon Willison, «We're going to need default hard budget caps on pretty much everything», 3-10-2026: https://simonwillison.net/2026/Oct/3/default-hard-budget-caps/ [H·s]
- Simon Willison, «Claude Haiku 5.5», 7-10-2026: https://simonwillison.net/2026/Oct/7/claude-haiku-5-5/ [H·s]. Contexto de precios: Haiku 5.5 y GPT-6 Luna cuestan los dos 0,10 / 0,50 USD; no son gratis.
- Stencil, «We improved 15 LLMs at coding in one afternoon. Only the harness changed», 12-2-2026: https://stencil.so/blog/the-harness-problem [H·s]
- WotAI, «The best free LLM APIs in 2026 (live-probed list)», 6-7-2026: https://wotai.co/blog/best-free-llm-apis [H·s, blog comercial]
- haimaker.ai, «Best Models for OpenClaw (October 2026)», comprobado el 14-10-2026: https://haimaker.ai/blog/best-models-for-openclaw/ [H·s, blog de un proveedor]
- TypeSafe, «Introducing System One Models & Jev», 15-9-2026: https://typesafe.ai/blog/introducing-system-one-models-and-jev [H, afirmaciones del fabricante]

**Proyectos abiertos (código y documentación)**

- Inbox Zero, `apps/web/.env.example`: https://github.com/elie222/inbox-zero [H]
- FreeLLMAPI, README y documento de arquitectura (limitaciones y revisión de condiciones de mayo de 2026): https://github.com/tashfeenahmed/freellmapi [H; la revisión de condiciones es H·s]
- Leon, README: https://github.com/leon-ai/leon [H]
- Khoj, README (admite modelos locales y en línea; no fija ninguno por defecto en el README): https://github.com/khoj-ai/khoj [H]
- Lista `h-michaelson20/free-llm-api-resources` (desactualizada): https://github.com/h-michaelson20/free-llm-api-resources [H]
- `cheahjs/free-llm-api-resources`: **no accesible**, 404 en raw [?]

**Proveedores**

- Gemini API Additional Terms, actualizados el 28-4-2026: https://ai.google.dev/gemini-api/terms [H]
- Cerebras, Rate Limits y FAQ del plan de prueba (página del 7-10-2026): https://inference-docs.cerebras.ai/support/rate-limits [H]
- DeepSeek, Models & Pricing y aviso del 13-8-2026: https://api-docs.deepseek.com/quick_start/pricing y https://api-docs.deepseek.com/news/news260813/ [H]
- DeepSeek, Privacy Policy, actualizada el 10-2-2026: https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html [H]
- Z.ai, Pricing (10-10-2026) y Privacy Policy (29-9-2025): https://docs.z.ai/guides/overview/pricing y https://docs.z.ai/legal-agreement/privacy-policy [H]
- OpenRouter, Model Fallbacks y Limits: https://openrouter.ai/docs/guides/routing/model-fallbacks y https://openrouter.ai/docs/api/reference/limits [H]
- LiteLLM, Fallbacks: https://docs.litellm.ai/docs/proxy/reliability [H]

## Pendientes

- Leer hilos de Reddit (r/LocalLLaMA, r/n8n, r/homeassistant) desde un navegador con sesión iniciada. Desde aquí no ha sido posible.
- Confirmar si `cheahjs/free-llm-api-resources` sigue existiendo.
- Pedir una interpretación de la cláusula del EEE de Gemini para una app personal de un único desarrollador.
- Comprobar si Alibaba Model Studio internacional da cuota gratuita de Qwen y en qué jurisdicción procesa los datos.
- Probar `gpt-oss-20b` y `gpt-oss-120b` en Groq con frases en español para ver si filtran el razonamiento, reutilizando `research/asistente-ia/banco`.
