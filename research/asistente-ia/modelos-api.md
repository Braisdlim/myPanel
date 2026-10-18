# Modelos por API con plan gratuito o barato y function calling (18-10-2026)

Investigación para el asistente de Pauta (chat por texto y voz que busca correos en varias cuentas de Gmail, busca archivos en Google Drive y OneDrive, y crea eventos a partir de lenguaje natural). Usuario único en España (UE).

Etiquetas: **[H]** comprobado en fuente primaria (leída el 18-10-2026), **[H·s]** fuente secundaria, **[I]** inferencia o cálculo propio, **[?]** sin comprobar.
Precios en USD por millón de tokens (MTok), sin IVA. No he convertido a euros, así que no doy cifras en €.

## Supuestos de carga y método de cálculo [I]

- **Carga base (la del enunciado):** 50 peticiones al día de 3.000 tokens de entrada y 300 de salida. Al mes (30 días) son 1.500 peticiones, **4,5 MTok de entrada y 0,45 MTok de salida**. Al día son 150.000 de entrada y 15.000 de salida.
- **Carga «agéntica» (más realista):** cada petición del usuario suele necesitar unas 2,5 llamadas al modelo: elegir herramienta, recibir el resultado y responder. Además, los modelos con razonamiento cobran el razonamiento como salida. Supongo **125 llamadas al día de 3.000 tokens de entrada y 600 de salida**, que al mes son **11,25 MTok de entrada y 2,25 MTok de salida**.
- Coste mensual = MTok de entrada × precio de entrada + MTok de salida × precio de salida. No incluyo caché de prompt: con el prompt de sistema y las herramientas en caché, la entrada sería bastante más barata.

## Tabla comparativa

| Proveedor · modelo | Gratis: límites | Pago (entrada / salida por MTok) | Coste/mes carga base | Coste/mes carga agéntica | ¿Entrena con tus datos en gratis? | UE |
|---|---|---|---|---|---|---|
| **Gemini 3.8 Flash** (`gemini-3.8-flash`) | Gratis en Standard [H]. **20 peticiones/día** [H·s, foro oficial de Google, 3-9-2026]. Google ya no publica la tabla del plan gratuito, solo se ve en AI Studio [H] | 0,75 / 3,75 hasta el 31-12-2026; **1,50 / 7,50 desde el 1-1-2027** [H] | 5,06 USD (10,13 en 2027) [I] | 16,88 USD (33,75 en 2027) [I] | En general sí. **En el EEE, no**: allí se aplican los términos de pago también al plan gratuito [H] | Disponible en España [H]. Ojo a la cláusula sobre usuarios del EEE (ver más abajo) |
| **Gemini 3.5 Flash-Lite** (`gemini-3.5-flash-lite`) | Gratis [H]. **500 peticiones/día** para «Flash-Lite» [H·s, mismo foro; no dice qué versión]. 30 peticiones/minuto y 1.500 al día [H·s, agregador; no concuerda con la cifra anterior] | 0,30 / 2,50 [H] | 2,48 USD [I] | 9,00 USD [I] | Igual que la fila anterior [H] | Igual que la fila anterior |
| Gemini 3.1 Flash-Lite | Gratis [H]; límites [?] | 0,25 / 1,50 [H] | 1,80 USD [I] | 6,19 USD [I] | Igual que la fila anterior | Igual que la fila anterior |
| Gemini 2.5 Flash-Lite | Solo para quien ya lo usaba antes [H] | 0,10 / 0,40 [H] | 0,63 USD [I] | 2,03 USD [I] | Igual que la fila anterior | No sirve para un proyecto nuevo [H] |
| **Groq** · `openai/gpt-oss-120b` | **30 peticiones/minuto, 1.000/día, 8.000 tokens/minuto y 200.000 tokens/día** [H] | 0,15 / 0,60 [H] | 0,95 USD [I] | 3,04 USD [I] | No: el contrato lo prohíbe salvo permiso expreso [H] | Datos guardados en EE. UU. con cláusulas contractuales tipo [H] |
| Groq · `openai/gpt-oss-20b` | Mismos límites [H] | 0,075 / 0,30 [H] | 0,47 USD [I] | 1,52 USD [I] | No [H] | Igual que la fila anterior |
| Groq · `qwen/qwen3.8-27b` (en vista previa) | Mismos límites [H] | 0,80 / 4,00 [H] | 5,40 USD [I] | 18,00 USD [I] | No [H] | Igual que la fila anterior |
| **Mistral Small 4** (`mistral-small-2603`) | «Free mode» sin tarjeta, con uso mensual incluido y límites de velocidad que solo se ven en la consola [H]. Cifras [?] | 0,15 / 0,60 [H] | 0,95 USD [I] | 3,04 USD [I] | **Sí por defecto en Free mode, con opción de desactivarlo** [H] | Empresa francesa [H]. Endpoint `api.eu.mistral.ai` con proceso en la UE [H]; si tiene sobreprecio [?] |
| Mistral Ministral 3 8B / 14B | Igual que Mistral Small 4 | 0,15 / 0,15 y 0,20 / 0,20 [H] | 0,74 / 0,99 USD [I] | 2,03 / 2,70 USD [I] | Igual que Mistral Small 4 | Igual que Mistral Small 4 |
| **Cloudflare Workers AI** · `@cf/google/gemma-4-26b-a4b-it` | **10.000 neuronas al día** gratis en los planes Free y Paid; 300 peticiones/minuto en generación de texto [H] | 0,10 / 0,30 (0,011 USD por cada 1.000 neuronas) [H] | **0 USD**: unas 1.770 neuronas/día [I] | **0 USD**: unas 5.450 neuronas/día [I] | **No**: ni entrena ni conserva el contenido en las peticiones normales [H] | [?] dónde se procesa |
| Cloudflare · `@cf/openai/gpt-oss-120b` | Igual que la fila anterior | 0,35 / 0,75 [H] | **0 USD**: unas 5.800 neuronas/día [I] | Unas 17.000 neuronas/día. Hace falta Workers Paid: 5 USD + 2,32 USD = **7,32 USD** [I] | No [H] | [?] |
| **Claude Haiku 5.5** (`claude-haiku-5-5`) | No hay plan gratis; solo unos créditos iniciales pequeños [H] | **0,10 / 0,50** con prompts de hasta 100.000 tokens [H] | 0,68 USD [I] | 2,25 USD [I] | No: «Anthropic may not train models on Customer Content» [H] | Disponible en España [H]. En el EEE contrata Anthropic Ireland [H] |
| Claude Haiku 4.5 | — | 1 / 5 [H] | 6,75 USD [I] | 22,50 USD [I] | No [H] | Igual que la fila anterior |
| **OpenAI GPT-6 Luna** (`gpt-6-luna`) | Existe un nivel «Free», pero sin límites publicados para ningún modelo [H]. Uso gratuito [?] | **0,10 / 0,50**; escribir en caché cuesta 0,125 [H] | 0,68 USD (0,74 con residencia en la UE, +10 %) [I] | 2,25 USD [I] | No, salvo que actives compartir datos [H] | Disponible en España [H]. Residencia de datos en la UE con +10 % [H] |
| **OpenRouter** · modelos `:free` | **20 peticiones/minuto**. **50 al día** si has comprado menos de 10 USD de créditos y **1.000 al día** desde 10 USD [H] | — | 0 USD (50/día es justo el límite) [I] | 0 USD si compras 10 USD una vez [I] | Depende del proveedor que sirva la petición. Hay un ajuste aparte para modelos gratuitos que excluye a los que entrenan [H] | El enrutado en la UE solo está en los planes Business y Enterprise [H] |
| **GitHub Models** | **Retirado el 30-7-2026** [H] | — | — | — | — | — |

## Detalle por proveedor

### Google Gemini API (AI Studio)
- Modelos actuales: Gemini 4 Argon (no está en el plan gratuito), Gemini 3.8 Flash, 3.6 Flash, 3.5 Flash-Lite y 3.1 Flash-Lite. Para proyectos nuevos Google recomienda 3.5 Flash-Lite o 3.8 Flash. Los modelos 2.5 solo se sirven a quien ya los usaba [H models, 13-10-2026].
- 3.8 Flash y 3.5 Flash-Lite admiten function calling, salidas estructuradas, razonamiento y caché [H páginas de cada modelo]. En 3.8 Flash el razonamiento solo puede ser low, medium o high; `minimal` devuelve error [H].
- La página de límites ya no publica las cifras del plan gratuito: solo dice «View your active rate limits in AI Studio». Las cuotas diarias se reinician a medianoche, hora del Pacífico, y se cuentan por proyecto [H rate-limits, 15-10-2026]. Las cifras de 20 y 500 peticiones al día salen de un hilo del foro oficial, escrito por usuarios [H·s]. Con 20 peticiones al día, **3.8 Flash no da para 50 peticiones diarias** [I].
- Pasar a pago exige prepago: mínimo 5 USD de créditos, que caducan a los 12 meses. Con saldo 0, la API devuelve el error 402 [H billing].
- **Datos.** En los servicios no pagados, Google usa el contenido para mejorar productos y puede haber revisores humanos [H terms]. Pero: «If you're in the European Economic Area, Switzerland, or the United Kingdom, the terms under "How Google uses Your Data" in "Paid Services" apply to all Services, including … unpaid quota» [H terms, actualizado el 28-4-2026]. **Desde España, el plan gratuito no entrena con tus datos** [H].
- **Ojo:** los términos también dicen «You may use only Paid Services when making API Clients available to users in the European Economic Area» [H]. Que una app personal, usada solo por quien la desarrolla, cuente como «hacerla disponible a usuarios» no está claro [I]. Lo prudente es usar el plan de pago o tener una cuenta de facturación activa: con cualquiera de los dos, la clave de API cuenta como servicio de pago [H].
- Grounding con Google Search: 5.000 búsquedas gratis al mes en los modelos de pago Gemini 3 o posteriores; no está disponible en el plan gratuito de 3.8 Flash [H].

### Groq
- Los modelos Llama 3.3 70B y Llama 3.1 8B han pasado a «Enterprise / Contact sales» [H models]. En el plan gratuito con tool use quedan: gpt-oss-120b, gpt-oss-20b, gpt-oss-safeguard-20b y qwen3.8-27b (en vista previa) [H rate-limits, tool-use].
- **gpt-oss no admite llamadas a herramientas en paralelo**; qwen3.8-27b sí [H tool-use].
- Límites del plan gratuito para gpt-oss-120b: 30 peticiones/minuto, 1.000/día, 8.000 tokens/minuto y 200.000 tokens/día [H]. Con la carga base salen unos 165.000 tokens al día, que caben. Con la carga agéntica salen unos 450.000, que **superan el límite diario de tokens**. Además, un bucle de 3 llamadas de 3.000 tokens en el mismo minuto se pasa de 8.000 tokens/minuto [I].
- **Datos.** Por defecto no conserva entradas ni salidas. Puede guardarlas hasta 30 días para fiabilidad o abusos, y eso se desactiva activando cero retención de datos [H your-data]. El contrato de servicios dice: «Groq is not permitted to use Inputs or Outputs for training or fine-tuning … unless explicitly granted permission» [H services-agreement]. Los datos se guardan en Google Cloud en EE. UU. [H].

### Mistral
- Plataforma: «Mistral Studio», antes La Plateforme. El plan «Experiment» ya no aparece. Ahora hay **Free mode** por defecto: acceso a la API sin tarjeta, con uso mensual incluido y límites que solo se ven en Admin Panel › API › Limits [H docs]. Las cifras concretas no son públicas [?]. Los agregadores hablan de 1.000 millones de tokens al mes y de 1 a 2 peticiones/minuto, pero se contradicen entre sí [H·s].
- Precios por MTok: Small 4 0,15 / 0,60; Ministral 3 8B 0,15 / 0,15; Ministral 3 14B 0,20 / 0,20; Medium 3.5 1,50 / 7,50 [H pricing/api]. Small 4 admite function calling y tiene 256.000 tokens de contexto [H].
- Pasar de lo incluido exige prepago con créditos y activar el pago por uso; con saldo 0, error 402 [H billing].
- **Datos.** En Free mode, «we may use your data (input and output) to train our artificial intelligence models», con derecho a desactivarlo en Admin › Privacy › «Anonymous improvement data» [H help center, 31-8-2026 y 3-9-2026]. En pago por uso también se puede desactivar [H]. Los modelos «labs» y en vista previa entrenan siempre, aunque lo hayas desactivado [H commercial terms 4.3].
- Empresa francesa con sede en París [H]. Tiene inferencia regional en la UE en `api.eu.mistral.ai` [H].

### OpenRouter (`:free`)
- Límites: 20 peticiones/minuto. Al día, 50 peticiones si has comprado menos de 10 USD de créditos en total, y 1.000 desde 10 USD [H limits; constantes leídas en la propia página]. Con saldo negativo fallan incluso los modelos gratuitos [H].
- Modelos `:free` con `tools` según la API pública `/api/v1/models` (16 modelos gratuitos, 15 con herramientas) [H]: `google/gemma-4-31b-it:free`, `google/gemma-4-26b-a4b-it:free`, `nvidia/nemotron-3-super-120b-a12b:free`, `nvidia/nemotron-3-ultra-550b-a55b:free`, `thinkingmachines/inkling:free`, `poolside/laguna-s-2.1:free` y otros. El endpoint de `inkling:free` declara `supports_tool_choice` en false para todas las opciones [H], lo que hace dudar de su fiabilidad.
- **Datos.** Cada proveedor tiene su política. En la configuración hay un ajuste **separado para modelos gratuitos** que impide enrutar a proveedores que entrenan [H privacy]. La API no expone la política de cada endpoint [H]. Gemma 4 `:free` la sirve «Google AI Studio» [H], y lo probable es que se apliquen sus condiciones del plan gratuito [I].

### Cloudflare Workers AI
- 10.000 neuronas al día gratis tanto en Workers Free como en Workers Paid. Lo que exceda cuesta 0,011 USD por cada 1.000 neuronas y solo se puede pagar con Workers Paid. Se reinicia a las 00:00 UTC [H pricing]. Workers Paid cuesta **mínimo 5 USD al mes** [H workers/pricing].
- Con function calling «Yes» en la ficha de cada modelo [H]: gemma-4-26b-a4b-it (256.000 tokens de contexto), gpt-oss-120b y gpt-oss-20b, llama-3.3-70b-instruct-fp8-fast (solo 24.000 de contexto), qwen3.8-27b, glm-4.7-flash, mistral-small-3.1-24b, llama-4-scout, qwen3-30b-a3b y glm-5.3-flash. glm-5.3-flash y otros modelos «frontier» **requieren el plan de pago** [H].
- Neuronas por MTok de entrada / salida [H]: gemma-4-26b 9.091 / 27.273; gpt-oss-120b 31.818 / 68.182; glm-4.7-flash 5.500 / 36.400; llama-3.3-70b 26.668 / 204.805.
- **Datos.** «Cloudflare does not use Customer Content processed by Workers AI to train AI models». En la inferencia normal no se conservan entradas ni salidas [H data-usage, 16-10-2026].
- Encaja con la propuesta de usar Cloudflare para sincronizar. Pero las 10.000 neuronas se comparten con cualquier otro uso de Workers AI, por ejemplo transcribir voz con whisper a 0,0005 USD por minuto [H pricing], así que el margen se reduce [I].

### Anthropic Claude API
- El modelo más barato actual es **Claude Haiku 5.5: 0,10 / 0,50 por MTok** con prompts de hasta 100.000 tokens, y 0,50 / 2,50 por encima. En lote cuesta 0,05 / 0,25 y la lectura de caché 0,01 [H platform.claude.com pricing]. Haiku 4.5 cuesta 1 / 5 [H].
- Usar herramientas añade a cada petición un prompt de sistema de 286 o 406 tokens, según la opción de `tool_choice` [H].
- Haiku 5.5 razona de forma adaptativa por defecto (esfuerzo `medium`), y ese razonamiento se cobra como salida [H·s, guía de la skill claude-api con caché del 6-10-2026]. Por eso uso la carga agéntica como referencia realista [I].
- No hay plan gratis: «New users receive a small amount of free credits» [H].
- **Datos.** «Anthropic may not train models on Customer Content from Services» [H commercial terms, en vigor desde el 17-6-2025]. Anthropic Ireland es la parte contratante en el EEE [H]. España está entre los países admitidos [H supported-countries].

### OpenAI
- El modelo más barato con function calling es **GPT-6 Luna (`gpt-6-luna`): 0,10 / 0,50 por MTok**; la entrada en caché cuesta 0,01 y la escritura en caché 0,125 [H pricing y ficha del modelo]. Tiene 1.050.000 tokens de contexto y razonamiento configurable, `medium` por defecto [H].
- Matiz: «Chat Completions supports function calling only with `reasoning_effort` set to `none`»; para usar herramientas con razonamiento hay que ir a la Responses API [H ficha del modelo].
- Niveles de uso: Free (en países admitidos, límite de 100 USD al mes), Build (desde 5 USD de compras), Launch y Grow. La tabla de límites solo tiene filas para Build y superiores [H rate-limits]. No consta que el nivel Free dé uso gratuito [?].
- **Datos.** «data sent to the OpenAI API is not used to train or improve OpenAI models (unless you explicitly opt in)». Los registros para vigilar abusos se guardan 30 días [H your-data]. Hay residencia de datos en la UE con un 10 % más [H].

### GitHub Models
- **Retirado por completo el 30-7-2026**: ya no existen el playground, el catálogo, la API de inferencia ni BYOK [H docs.github.com; github.blog changelog 2026-07-30]. Descartado.

## Conclusiones y propuestas (no son decisiones)
1. **[I] Gratis, sin entrenar con los datos y desde la UE:** las opciones más sólidas son **Cloudflare Workers AI con gemma-4-26b** (0 USD incluso con la carga agéntica, y sin entrenamiento [H]) y **Gemini 3.5 Flash-Lite en el plan gratuito**, donde los términos de pago se aplican en el EEE [H]. En Gemini queda la duda de la cláusula sobre usuarios del EEE y los límites no son públicos.
2. **[I] Muy barato y con buena fiabilidad:** **Claude Haiku 5.5** o **GPT-6 Luna**, unos **0,7 USD al mes** con la carga base y unos **2,3 USD** con la agéntica. Ninguno entrena con los datos.
3. **[I] Precio intermedio de gran proveedor:** Gemini 3.8 Flash de pago, unos 5 USD al mes ahora y el doble desde enero de 2027.
4. **[I] Lo que no conviene:** Mistral Free mode sin desactivar el entrenamiento, porque entrena por defecto; OpenRouter `:free` sin comprar créditos (50 peticiones al día); Groq gratis con la carga agéntica, porque supera los 200.000 tokens diarios; y GitHub Models, que está retirado.
5. **[?] Pendiente:** la calidad del function calling en español de cada modelo no la he medido. Propongo una batería de prueba como la de `research/asistente-ia/prueba-local/prueba-tools.mjs` contra Gemma 4 en Cloudflare, Gemini 3.5 Flash-Lite, Haiku 5.5 y GPT-6 Luna.
6. **[?] Pendiente:** ver en AI Studio y en la consola de Mistral los límites reales del plan gratuito de esta cuenta.

## Fuentes (todas consultadas el 18-10-2026)
- Gemini, precios: https://ai.google.dev/gemini-api/docs/pricing (actualizada el 16-10-2026)
- Gemini, límites: https://ai.google.dev/gemini-api/docs/rate-limits (15-10-2026)
- Gemini, modelos: https://ai.google.dev/gemini-api/docs/models (13-10-2026); …/models/gemini-3.8-flash; …/models/gemini-3.5-flash-lite
- Gemini API Additional Terms: https://ai.google.dev/gemini-api/terms (28-4-2026)
- Gemini, regiones: https://ai.google.dev/gemini-api/docs/available-regions (28-4-2026)
- Gemini, facturación: https://ai.google.dev/gemini-api/docs/billing
- Foro de Google (secundaria): https://discuss.ai.google.dev/t/gemini-3-8-flash-free-tier-20-rpd-is-too-limited-for-practical-evaluation/180609 (3-9-2026)
- Groq: https://console.groq.com/docs/rate-limits · https://console.groq.com/docs/models · https://console.groq.com/docs/tool-use · https://console.groq.com/docs/your-data · https://console.groq.com/docs/legal/services-agreement
- Mistral: https://mistral.ai/pricing/api · https://docs.mistral.ai/models/mistral-small-4-0-26-03 · https://docs.mistral.ai/getting-started/quickstarts/studio/activate-and-generate-api-key · https://docs.mistral.ai/admin/billing-usage/subscriptions · https://docs.mistral.ai/admin/billing-usage/billing · https://docs.mistral.ai/admin/billing-usage/usage-limits · https://docs.mistral.ai/inference/regional-inference · https://legal.mistral.ai/terms/commercial-terms-of-service · https://help.mistral.ai/en/articles/347617 (31-8-2026) · https://help.mistral.ai/en/articles/455207 (3-9-2026)
- OpenRouter: https://openrouter.ai/docs/api-reference/limits · https://openrouter.ai/docs/features/privacy-and-logging · https://openrouter.ai/api/v1/models
- Cloudflare: https://developers.cloudflare.com/workers-ai/platform/pricing/ · …/platform/limits/ · …/features/function-calling/ · …/models/ (fichas de cada modelo) · …/platform/data-usage/ (16-10-2026) · https://developers.cloudflare.com/workers/platform/pricing/
- Anthropic: https://platform.claude.com/docs/en/about-claude/pricing · https://www.anthropic.com/legal/commercial-terms · https://www.anthropic.com/supported-countries
- OpenAI: https://platform.openai.com/docs/pricing · https://developers.openai.com/api/docs/models/gpt-6-luna · https://developers.openai.com/api/docs/guides/rate-limits · https://platform.openai.com/docs/guides/your-data · https://developers.openai.com/api/docs/supported-countries
- GitHub Models: https://docs.github.com/en/github-models · https://github.blog/changelog/2026-07-30-github-models-is-now-retired/
- Agregadores (secundarias, solo para contrastar): https://freellm.net/models/google-gemini/gemini-3-5-flash-lite/ · https://costbench.com/software/llm-api-providers/mistral-ai/free-plan/
