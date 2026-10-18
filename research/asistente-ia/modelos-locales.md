# Asistente de Pauta con modelo local o en el dispositivo (18-10-2026)

**Pregunta.** ¿Puede el asistente (chat por texto y voz que busca correos en varias cuentas de Gmail, encuentra archivos en Drive y OneDrive y crea eventos a partir de lenguaje natural en español) funcionar con un modelo que corra en el propio dispositivo o en el NAS, a 0 € y con poco mantenimiento? La parte delicada es que las llamadas a herramientas (function calling) sean fiables.

**Respuesta corta.** Hoy no conviene que sea la única vía. Se puede usar como vía opcional y sin conexión, sobre todo en el Mac (el modelo de Apple con su API de herramientas) y en servidores con Ollama o llama.cpp. Lo que no es viable es en el Honor 600 Pro con Gemini Nano (el móvil no está en la lista oficial) ni en el NAS para uso interactivo: tarda unos 10 s por petición incluso con un modelo de 2B y una CPU mejor que la de un NAS típico. Los modelos pequeños eligen bien la herramienta, pero se equivocan en los argumentos, sobre todo en las fechas. Por eso la fecha y la hora deben calcularse siempre con código determinista, y cada acción debe confirmarse antes de ejecutarse.

Etiquetas: [H] comprobado en fuente primaria · [H·s] fuente secundaria · [I] inferencia · [P] propuesta · [?] incierto o no comprobado. Todas las fuentes se consultaron el 18-10-2026 salvo que se indique otra fecha.

---

## 1. Modelos pequeños abiertos con llamadas a herramientas

| Modelo (publicación en HF) | Parámetros | Licencia | Herramientas | Español | Resultado en herramientas publicado por el propio fabricante |
|---|---|---|---|---|---|
| **Qwen3.5-0.8B / 2B / 4B / 9B** (27-28-02-2026) | 0,8 / 2 / 4,66 / 9,7 B | Apache-2.0 [H] | Sí, nativas (`qwen3_coder` parser en vLLM/SGLang) [H] | 201 idiomas y dialectos [H] | BFCL-V4: 2B 43,6 · 4B 50,3 · 9B 66,1 (modo razonamiento); TAU2: 2B 48,8 · 4B 79,9 · 9B 79,1 [H tarjeta del modelo]. El 2B va sin razonamiento por defecto [H] |
| **Gemma 4 E2B / E4B / 12B** (02-03-2026; 12B 23-05-2026) | E2B 5,1 B totales (2 B efectivos) · E4B 8 B (4 B efectivos) · 12B | **Apache-2.0** [H API HF] (cambio respecto a las «Gemma terms» de Gemma 3) | «Function Calling – Native support» [H] | «35+ idiomas listos, preentrenado en 140+» [H] | Tau2 media de 3: E2B 24,5 % · E4B 42,2 % · 12B 69,0 % [H]. No publica BFCL. Según la tabla de Liquid AI, BFCLv4 E2B 36,98 · E4B 46,39 [H·s: medición de un competidor] |
| **Ministral 3 3B / 8B Instruct 2512** (31-10-2025) | 3,85 B / 8 B | Apache-2.0 [H] | «Native function calling and JSON outputting» [H] | Español en la lista [H] | No publica BFCL [H] |
| **Granite 4.2 3B / 8B** (IBM, 07-08-2026) | 3,66 B / 8 B | Apache-2.0 [H] | Sí, «Reasoning-Augmented Tool Calling» [H] | Español probado [H] | BFCL v4: 3B 52,41 · 8B 52,39 · 30B 61,39 [H tarjeta] |
| **LFM2.5-1.2B / 2.6B** (Liquid AI; 2,6B el 28-07-2026) | 1,2 B / 2,7 B | **LFM 1.0**: gratis por debajo de 10 M$ de ingresos anuales [H LICENSE] | Sí, con formato propio «pythonic» entre `<\|tool_call_start\|>` [H] | Español en la lista [H] | BFCLv4 2.6B: 56,88 frente a 50,56 de Qwen3.5-4B (medido por Liquid) [H tarjeta, autoevaluación] |
| **SmolLM3-3B** (HF, 08-07-2025) | 3,08 B | Apache-2.0 [H] | Sí (`xml_tools` / `python_tools`) [H] | 6 idiomas nativos, incluido el español [H] | «BFCL 92,3» en la tarjeta: versión antigua del banco, no comparable con v4 [H/I] |
| **Phi-4-mini-instruct** (19-02-2025) | 3,8 B | MIT [H] | Formato `<\|tool\|>` en el prompt [H] | Español en la lista; la tarjeta avisa de peor rendimiento fuera del inglés [H] | Sin cifra concreta de BFCL en la tarjeta [H] |
| **Llama 3.2 1B/3B** (2024) · **Llama 4** | 1-3 B · Llama 4 solo en MoE 17B×16/128 expertos | Llama Community | Sí | Sí | En BFCL oficial: Llama-3.2-3B 21,95 % en total. **Meta no ha publicado modelos pequeños nuevos desde abril de 2025** (último en HF: Llama Guard 4, 28-04-2025) [H API HF] |
| **FunctionGemma 270M** (08-10-2025) | 0,27 B | Gemma terms (acceso con aceptación) [H] | Solo llamadas a funciones; pensado para ajustarlo [H] | [?] | Es el ejemplo que usa LiteRT-LM para las herramientas en Android [H] |

**Leaderboard oficial de BFCL** (gorilla.cs.berkeley.edu, «Last Updated: 2026-04-12») [H, CSV `data_overall.csv` descargado]:
- 1.º Claude-Opus-4.5 (FC): 77,47 % en total.
- Pequeños: Qwen3-4B-Instruct-2507 (FC) 35,68 % en total (Live 76,4 %, Multi-turn 22,1 %); Qwen3-1.7B 28,41 %; Gemma-3-4b-it 19,62 %; Llama-3.2-3B 21,95 %; xLAM-2-3b-fc-r 41,22 % (licencia CC-BY-NC); Ministral-8B-2410 11,10 % (falló el formato).
- **El leaderboard no incluye todavía Qwen3.5, Gemma 4, Granite 4.2 ni LFM2.5.** Sus cifras de BFCL-V4 son **autoevaluaciones** de cada fabricante [H/I]. En la versión 4 la puntuación total incluye la búsqueda web y la memoria. Para nuestro caso (una sola llamada bien formada), lo que más importa son las columnas «Live Simple/Multiple» y la detección de irrelevancia [I].
- Lectura [I]: un modelo de 2-4 B elige bien la herramienta en peticiones sencillas, pero en varios turnos y con argumentos complejos está muy por debajo de los modelos de frontera.

## 2. Motores de inferencia: estado y versiones

| Motor | Versión actual (fecha) | Herramientas | Plataformas | Notas |
|---|---|---|---|---|
| **Ollama** | v0.40.6 «Latest» (16-10); v0.40.7 previa (18-10) [H GitHub Releases] · Docker `ollama/ollama` amd64+arm64, actualizado el 17-10-2026 [H Docker Hub] · npm `ollama` 0.6.4 (29-09) [H npm] | Sí, `tools` en `/api/chat`, también en paralelo [H docs.ollama.com] | macOS, Windows, Linux; Docker solo CPU [H] | Etiqueta «tools» en `qwen3.5`, `gemma4`, `ministral-3`, `lfm2.5`, `phi4-mini` [H ollama.com/library]. Desde la v0.40.0 usa MLX por defecto en Apple Silicon para qwen3.5/gemma4 [H]. Tiene ahora un plan de nube de pago (no hace falta) [H] |
| **llama.cpp** | b11719 (18-10-2026), varias versiones al día [H GitHub] · etiquetas semánticas nuevas, la última v0.7.0 [H git] | Sí, con plantillas jinja (`--jinja`) [H·s] | Todas, también Android e iOS como biblioteca | Base de Ollama, LM Studio y node-llama-cpp |
| **node-llama-cpp** | 3.22.2 (17-10-2026) [H npm] | Sí (`defineChatSessionFunction`) [H, probado] | Node en escritorio | Usado en la prueba (sección 6). Elige plantilla por modelo: con LFM2.5 eligió ChatML genérico y **no hubo ninguna llamada** [H, prueba] |
| **LM Studio** | 0.4.26 [H lmstudio.ai/download] · SDK `@lmstudio/sdk` 2.1.0 [H npm] | Sí, API compatible con OpenAI (`/v1/chat/completions`) [H] | Mac, Windows, Linux | Aplicación de escritorio; no se puede integrar en Pauta, sería un servidor aparte |
| **LiteRT-LM** (Google) | v0.18.0 [H git; página del 06-10-2026] | «Function calling… with constrained decoding» [H] | Android (Kotlin, estable), iOS/macOS (Swift, «Early Preview»), Web (JS, «Early Preview»), Python, C++ [H] | Sucesor de MediaPipe LLM Inference |
| **MediaPipe LLM Inference** | `@mediapipe/tasks-genai` 0.10.29; 1.2.0-rc del 18-10 [H npm] | — | Android, iOS, Web | «**Now in maintenance-only mode**… migrate to LiteRT-LM» [H ai.google.dev, act. 01-10-2026] |
| **WebLLM** (MLC) | `@mlc-ai/web-llm` 0.2.86 (11-10-2026) [H npm] | `tools` solo para 5 modelos Hermes de 8 B; para el resto, «function-calling (WIP)» manual [H código del paquete] | Navegador con WebGPU | Trae Qwen3.5-0.8B…9B y Ministral-3-3B ya compilados; Qwen3.5-4B pide unos 3,9 GB de VRAM con **contexto limitado a 4096** [H prebuiltAppConfig] |
| **Transformers.js** / **wllama** | 4.3.1 (06-10) / 3.8.1 (02-10) [H npm] | Manual | Navegador | Alternativas WASM/WebGPU [H] |
| **Apple Foundation Models** | iOS/macOS 26.0+; 3 versiones del modelo (26.0-26.3, 26.4, 27.0) [H developer.apple.com] | **Sí**: protocolo `Tool`, llamadas encadenadas y modo de llamada configurable [H] | iPhone, iPad, Mac, Vision Pro con Apple Intelligence [H] | Detalle en la sección 2.1 |
| **Gemini Nano (ML Kit GenAI Prompt API / AICore)** | Página actualizada el 16-10-2026 [H] | **No documentadas** (sí salida estructurada «Alpha») [H por ausencia] | Solo Android, en la lista de dispositivos | Detalle en la sección 2.2 |
| **Chrome Prompt API (Gemini Nano en el navegador)** | Web: Chrome 148; extensiones: Chrome 138 [H developer.chrome.com, act. 26-08-2026] | No; sí `responseConstraint` (JSON Schema) [H] | **Solo escritorio** (Windows, macOS 13+, Linux, Chromebook Plus); «no funciona en móviles» [H] | Idiomas: en, ja, **es**, de, fr [H]. Requisitos: más de 4 GB de VRAM, o 16 GB de RAM y 4 núcleos, y 22 GB libres [H]. No está disponible en los webviews de Tauri (WKWebView en macOS) [I] |
| **Windows AI: Phi Silica** | Página del 12-10-2026 [H] | [?] | NPU de un Copilot+ PC, o GPU RTX 30+ / RX 9060+ con 6 GB (en GPU solo en Insider Experimental y con el modo de desarrollador) [H] | Es una **Limited Access Feature** (hay que pedir un token) y **será sustituida por «Aion Instruct»**: Insider en noviembre de 2026 y retirada de Phi Silica en enero de 2027 [H]. Hoy no es una base estable |
| **Foundry Local** (Microsoft) | Página del 04-08-2026 [H] | [?] (API compatible con OpenAI) | Windows, macOS (Apple Silicon), Linux; sin suscripción a Azure [H] | Alternativa a Ollama dentro de la app |

### 2.1 Apple Foundation Models (lo más prometedor en los dispositivos Apple)
- Modelo en el dispositivo: **AFM 3 Core, 3 B densos**. Hay además **AFM 3 Core Advanced, 20 B dispersos** (activa de 1 a 4 B por petición) para «our most capable Apple silicon systems» [H machinelearning.apple.com, 08-06-2026].
- **Tool calling**: «Use [Tool] to create custom tools that the model can call… calls a service in your app» [H]. Apple recomienda **no más de 3 a 5 herramientas por petición** y descripciones cortas [H «Managing the context window»].
- **Contexto de 4096 tokens** por sesión en el dispositivo, sin razonamiento. La versión en la nube privada de Apple (Private Cloud Compute) ofrece 32K y razonamiento, con **límite diario por persona** (más con iCloud+), desde iOS/macOS 27 y con un *entitlement* que hay que solicitar [H].
- **Español**: el modelo es multilingüe en todos los idiomas de Apple Intelligence, y el español está en la lista [H support.apple.com/121115, 14-09-2026]. Requisito: el idioma del dispositivo y el de Siri deben coincidir [H].
- Dispositivos: iPhone 15 Pro/Pro Max, iPhone 16 o posterior, iPhone Air, iPad con A17 Pro o M1+, **Mac con M1 o posterior**. Ocupa hasta 8 GB, o hasta 14 GB en los equipos que llevan el modelo Advanced [H].
- Coste: 0 €, sin claves y sin límite de uso en el dispositivo [H «Usage limits: Unlimited»].
- Limitación clave para Pauta [I]: es una API **Swift nativa**. No se puede usar desde una web app instalada. En Tauri hace falta un plugin (sección 4).

### 2.2 Gemini Nano en Android y el Honor 600 Pro
- La lista oficial de la Prompt API (act. 16-10-2026) incluye estos Honor: **Magic V5, Magic 7, Magic 7 Pro (nano-v2) y Magic 8 Pro (nano-v3)**. Las API GenAI en general también listan el Honor 400 Pro. **El Honor 600 Pro no aparece** [H developers.google.com/ml-kit/genai].
- Límites aunque estuviera en la lista [H]: entrada de menos de 4000 tokens, cuota por app (`BUSY`, `PER_APP_BATTERY_USE_QUOTA_EXCEEDED`), y solo funciona **con la app en primer plano** (`BACKGROUND_USE_BLOCKED`). Las herramientas no están documentadas.
- Honor 600 Pro: **Snapdragon 8 Elite** y batería de **6400 mAh** en la versión española [H honor.com/es]; **12 GB de RAM** (16 en algunas versiones) [H·s 91mobiles, Tecnoblog].
- Alternativa en ese móvil [I]: LiteRT-LM con Gemma 4 E2B (2,58 GB) dentro de un plugin nativo en Kotlin. No hay medidas publicadas para el Snapdragon 8 Elite; la referencia oficial es el S26 Ultra (sección 3).

## 3. Hardware, velocidad, memoria, batería y descarga

**Cifras oficiales de Gemma 4 E2B con LiteRT-LM** (prompt de 1024 tokens, generación de 256 y contexto de 2048) [H tarjeta litert-community/gemma-4-E2B-it-litert-lm y ai.google.dev/edge/litert-lm, 06-10-2026]:

| Dispositivo | Motor | Lectura del prompt (tok/s) | Generación (tok/s) | Primer token | Memoria |
|---|---|---|---|---|---|
| Samsung S26 Ultra | CPU / GPU | 557 / 3808 | 46,9 / 52,1 | 1,8 s / 0,3 s | 1733 / 676 MB |
| iPhone 17 Pro | CPU / GPU | 532 / 2878 | 25,0 / 56,5 | 1,9 s / 0,3 s | 607 / 1450 MB |
| Portátil Intel Lunar Lake (Windows) | CPU / GPU | 435 / 3751 | 29,8 / 48,4 | 2,4 s / 0,3 s | ~3,5 GB |
| MacBook Pro M4 Max | CPU / GPU | 901 / 7835 | 41,6 / 160,2 | 1,1 s / 0,1 s | 736 / 1623 MB |
| Web (WebGPU, M4 Max) | WebGPU | 4853 | 73 | 1,1 s | ~1,8 GB (modelo web de 2,0 GB, solo texto) |
| **Raspberry Pi 5 16 GB** (referencia de un NAS ARM) | CPU | 133 | **7,6** | **7,8 s** | 1546 MB |

Gemma 4 E4B (3,65 GB): S26 Ultra 18/22 tok/s, iPhone 17 Pro 10/25 tok/s (CPU/GPU) [H].

- **LFM2.5-2.6B**: «220 tok/s en un M5 Max y 113 tok/s en un Ryzen AI Max+ 395, en menos de 2,5 GB»; «30 tok/s… en un teléfono» (sin decir cuál) [H tarjeta, autodeclarado].
- **Tamaños de descarga en Ollama** [H ollama.com/library]: qwen3.5:0.8b 1,2-1,3 GB · 2b 2,7-3,1 GB · 4b 3,3-4,0 GB · 9b 6,6-7,6 GB; gemma4:e2b 4,6 GB (q4_K_M, con visión y audio) · e4b 6,6-9,5 GB; ministral-3:3b 3,0 GB; granite4.2:3b 2,2 GB; phi4-mini 2,5 GB. Como GGUF Q4_K_M sueltos: Qwen3.5-2B 1,28 GB, Qwen3.5-4B 2,74 GB, LFM2.5-2.6B 1,67 GB, Granite-4.2-3B 2,24 GB [H API HF].
- **Memoria de los pesos de Gemma 4 según Google** [H ai.google.dev/gemma, 08-07-2026]: E2B 2,9 GB en Q4_0 (1,1 GB en la versión móvil); E4B 4,5 GB (2,5 GB en la móvil). A eso se suma la caché del contexto.
- **Batería**: no hay cifras oficiales de Google ni de Apple por petición [?]. Los estudios académicos dicen que la inferencia en el móvil es de media unas 3 veces menos eficiente que la de un servidor por lotes (arXiv 2609.11940, 10-07-2026), y que la arquitectura del modelo pesa más que la cuantización (arXiv 2603.26603, con llama.cpp en un móvil Android de gama alta) [H resúmenes de arXiv]. Orden de magnitud [I]: con unos 0,3-0,7 J por token (cifras de PowerInfer-2, 2024 [H·s]) y unos 1000 tokens por petición, el consumo rondaría los 0,3-0,7 kJ. La batería de 6400 mAh almacena unos 89 kJ, así que serían menos del 1 % por petición. Es una estimación sin medir.

## 4. Plugins de Tauri para modelos locales (crates.io y npm, 18-10-2026)

| Crate | Versión (fecha) | Descargas | Qué hace | Estado [I] |
|---|---|---|---|---|
| `tauri-plugin-apple-intelligence` (entro314-labs) | 0.13.0 (28-09-2026), 10 versiones desde el 05-08-2026 | 425 | Foundation Models: generación, streaming, **tool calling**, salida estructurada, PCC; incluye un proveedor para el Vercel AI SDK | **Solo macOS 26+ en Apple Silicon**; «Other platforms… UnsupportedPlatform» [H README]. Joven y con un solo mantenedor |
| `tauri-apple-intelligence` (mismo autor) | 0.6.10 (22-07-2026) | 587 | Puente anterior | Sustituido por el plugin anterior [I] |
| `tauri-plugin-llama-crab` | 0.1.8 (16-06-2026) | 188 | llama.cpp dentro de la app: GGUF, chat **con herramientas**, streaming, embeddings | Muy nuevo; sin cambios desde junio [H crates.io] |
| `tauri-plugin-device-ai-apis` (hypothesi) | 0.3.0 (04-10-2026) | 65 | Voz, OCR… y LLM solo en iOS/macOS con Foundation Models; **Android ❌**; Windows ❌ («Phi Silica is not yet accessible from Rust») [H README] | Experimental |
| `tauri-plugin-leap-ai` | 0.1.1 (17-02-2026) | 61 | LEAP de Liquid AI (LFM) | Sin repositorio público [H] |
| `llama-cpp-2` (bindings de Rust, sin Tauri) | 0.1.160 (15-10-2026) | 1,65 M | Base habitual para integrar llama.cpp en Rust [H] | Mantenido y muy usado |

En npm no hay ningún plugin de Tauri para LLM con uso real; solo aparecen los plugins oficiales `@tauri-apps/*` [H registro de npm]. Conclusión [I]: hay un plugin aprovechable para el Mac (Foundation Models). Para Windows y Android habría que mantener código propio: Rust con `llama-cpp-2` o Ollama aparte en escritorio, y Kotlin con LiteRT-LM en Android. Eso contradice el objetivo de mantenimiento mínimo.

## 5. El modelo en el NAS (solo CPU) a través de Tailscale

- Ollama se instala en el NAS con una línea de Docker, solo CPU, en amd64 o arm64 [H docs.ollama.com/docker, Docker Hub]. Para escuchar en la red hay que poner `OLLAMA_HOST=0.0.0.0` y, para que el modelo siga cargado, `keep_alive` [H FAQ]. La API es la misma en el escritorio y en el NAS, así que el cliente es único [I].
- **Tailscale**: las conexiones directas por UDP tienen «the lowest latency and highest throughput»; DERP y Peer Relay quedan como alternativa de respaldo [H tailscale.com/kb/1257, validado el 01-06-2026]. El plan Personal es gratis, con dispositivos ilimitados y hasta 6 usuarios [H tailscale.com/pricing]. La red añade del orden de milisegundos a decenas de milisegundos en conexión directa. Es despreciable frente a la inferencia [I, sin medir].
- **El cuello de botella es la CPU y la RAM del NAS** [I]:
  - Referencia oficial ARM: Raspberry Pi 5 con Gemma 4 E2B a 7,6 tok/s y 7,8 s hasta el primer token con un prompt de 1024 tokens [H].
  - Referencia medida (sección 6): con 4 vCPU Xeon con AVX-512 (más potente que un Celeron o un N100 típico de NAS [I]), Qwen3.5-2B tarda **unos 10-13 s por petición** completa con llamada a herramienta.
  - Muchos NAS de gama doméstica traen 2-4 GB de RAM, y un modelo de 2-4 B necesita 2-4 GB solo para los pesos [I]. Sin saber el modelo del NAS no se puede cerrar [?].
- Veredicto [I]: el NAS puede servir para tareas en segundo plano, sin prisa (clasificar correo de noche, resumir o crear índices). No sirve para un chat o una voz interactivos.

## 6. Prueba propia: llamadas a herramientas en español en CPU (18-10-2026)

Archivos: `research/asistente-ia/prueba-local/prueba-tools.mjs`, `velocidad.mjs` y `resultado.txt`. Los modelos se descargaron fuera del repositorio.
- Máquina: contenedor Linux con 4 vCPU Intel Xeon a 2,1 GHz (AVX2/AVX-512), 15 GB de RAM y sin GPU. Motor: node-llama-cpp 3.22.2 (llama.cpp v0.7.0, CPU).
- 3 herramientas simuladas: `buscar_correos(consulta, cuenta)`, `buscar_archivos(texto, servicio, tipo)` y `crear_evento(titulo, inicio, fin)`. 8 peticiones en español, una de ellas sin herramienta. Prompt de sistema con la fecha «domingo 18 de octubre de 2026».

| Modelo | Herramienta correcta | Calidad de los argumentos | Tiempo por petición | Lectura del prompt / generación |
|---|---|---|---|---|
| **Qwen3.5-2B Q4_K_M** (1,28 GB) | **8/8** [H] | «Jueves que viene» → `2026-10-19` (**lunes; error**: era el 22). «Mañana 9-10» y «sábado 24 21:00», bien. La consulta de Iberdrola **no filtró septiembre** y la de Renfe **no puso el remitente**. Dice «He creado» cuando solo ha preparado el evento [H] | 9,5-13,5 s (4,7 s sin herramienta) [H] | 158 / 12,6 tok/s [H] |
| **LFM2.5-1.2B Q4_K_M** (0,73 GB) | 1/8 (solo acertó la que no necesitaba herramienta) | No llamó a ninguna herramienta: node-llama-cpp usó la plantilla ChatML genérica, que no conoce el formato de LFM [H]. Es un fallo de integración, no una medida del modelo [I] | — | 270 / 24,7 tok/s [H] |

Lecciones [I]:
1. Elegir la herramienta es fácil incluso para 2 B. Rellenar bien fechas relativas y la sintaxis de Gmail no lo es.
2. El motor y la plantilla de chat de cada modelo deciden si las llamadas funcionan. Cada combinación de modelo y motor hay que probarla.
3. La mayor parte del tiempo se va en leer el prompt dos veces (llamada y respuesta). Con 3 herramientas el prompt ya tiene unos 600-900 tokens.

## 7. Conclusión por dispositivo

| Dispositivo | ¿Viable hoy a 0 €? | Cómo | Riesgos |
|---|---|---|---|
| **Mac con M1 o posterior y macOS 26+** | **Sí, como opción** [I] | Foundation Models con `tauri-plugin-apple-intelligence`, o Ollama (MLX) con Qwen3.5-4B/9B | 4K de contexto y 3-5 herramientas por petición en el modelo de Apple; plugin joven; el modelo cambia con cada versión del sistema (hay que volver a probar los prompts) [H/I]. Falta saber qué Mac tienes [?] |
| **iPhone (15 Pro, 16 o posterior)** | **Solo en la app nativa** [I] | Foundation Models desde un plugin de Tauri para iOS en Swift (no existe; habría que escribirlo) | Una web app instalada no tiene acceso; falta saber qué iPhone tienes [?] |
| **Windows** | **Depende del equipo; poco recomendable** [I] | Ollama o Foundry Local en CPU/GPU; Phi Silica solo con Copilot+ o RTX 30+ | Phi Silica necesita un token de acceso limitado y será sustituida en enero de 2027 [H]. En CPU sin NPU, Gemma 4 E2B da unos 30 tok/s en Lunar Lake [H], pero en portátiles antiguos irá mucho peor [I] |
| **Honor 600 Pro** | **No con Gemini Nano** [H: no está en la lista]. Con LiteRT-LM, solo como experimento [I] | Plugin propio en Kotlin con LiteRT-LM y Gemma 4 E2B (2,6 GB), o WebLLM en Chrome con WebGPU (Chrome 121+ en GPU Qualcomm [H developer.chrome.com]) | Descarga de 2-4 GB por dispositivo; batería y temperatura sin medir; código nativo propio que mantener; WebLLM limita el contexto a 4096 [H] |
| **NAS (CPU)** | **Solo para trabajo en segundo plano** [I] | Ollama en Docker y Tailscale | 8-13 s o más por petición; RAM del NAS desconocida [?] |

**Propuesta [P]**
1. Que el núcleo no dependa de la IA (D-002). La fecha y la hora se interpretan siempre con el analizador determinista (`research/chrono-es`). Así se evita el error del «jueves que viene» que se vio en la prueba.
2. Diseñar el asistente sobre una interfaz de proveedor única, compatible con OpenAI (`tools`/`tool_calls`). La hablan Ollama, LM Studio, llama.cpp server y Foundry Local, y también la mayoría de las nubes. Así, pasar de un modelo local a la nube sería cambiar la configuración.
3. Proveedor local para empezar: **Foundation Models en el Mac** (gratis, privado, sin descarga y con herramientas). Opcionalmente, Ollama con Qwen3.5-4B en el escritorio, con modelo elegible. En el móvil Android, de momento la nube (otro informe), y volver a mirar cuando el Honor entre en la lista de AICore.
4. Herramientas pocas y pequeñas (3-5), con argumentos validados por esquema. La app genera la consulta de Gmail (`after:`/`before:`/`from:`) a partir de campos estructurados, no del texto libre del modelo. Toda escritura (crear un evento) va a una vista previa con la cuenta de destino y pide confirmación (regla del CLAUDE.md).
5. Antes de decidir, montar un banco de pruebas propio de 30-50 frases reales en español. Ampliar `prueba-tools.mjs` y pasarlo a cada candidato (Qwen3.5-4B, Gemma 4 E4B, Granite 4.2 3B, LFM2.5-2.6B con Ollama, y Foundation Models en el Mac).

**Pendientes [?]**
- Modelo concreto del Mac, del PC con Windows, del iPhone y del NAS (CPU y RAM).
- Medir la batería y la temperatura en el Honor 600 Pro con Gemma 4 E2B en LiteRT-LM.
- Comprobar si las herramientas de LFM2.5 funcionan con Ollama, que tiene la etiqueta «tools».
- Comprobar si el webview de Android (Tauri) tiene WebGPU.

## 8. Fuentes (consultadas el 18-10-2026)

- Hugging Face, API y tarjetas de los modelos: Qwen/Qwen3.5-{0.8B,2B,4B,9B}; google/gemma-4-{E2B,E4B,12B}-it; mistralai/Ministral-3-{3B,8B}-Instruct-2512; ibm-granite/granite-4.2-{3b,8b}; LiquidAI/LFM2.5-{1.2B-Instruct,2.6B} y su LICENSE; HuggingFaceTB/SmolLM3-3B; microsoft/Phi-4-mini-instruct; google/functiongemma-270m-it; litert-community/gemma-4-E2B-it-litert-lm. https://huggingface.co/api/models
- BFCL: https://gorilla.cs.berkeley.edu/leaderboard.html («Last Updated: 2026-04-12») y https://gorilla.cs.berkeley.edu/data_overall.csv
- Ollama: https://github.com/ollama/ollama/releases · https://docs.ollama.com/capabilities/tool-calling · https://docs.ollama.com/docker · https://docs.ollama.com/faq · https://ollama.com/library/{qwen3.5,gemma4,ministral-3,granite4.2,lfm2.5,phi4-mini}/tags · https://hub.docker.com/r/ollama/ollama (17-10-2026)
- llama.cpp: https://github.com/ggml-org/llama.cpp/releases (b11719, 18-10-2026)
- npm (`npm view … version time`): @mlc-ai/web-llm 0.2.86 (11-10-2026), @mediapipe/tasks-genai 0.10.29, ollama 0.6.4 (29-09-2026), node-llama-cpp 3.22.2 (17-10-2026), @huggingface/transformers 4.3.1 (06-10-2026), @wllama/wllama 3.8.1 (02-10-2026), @lmstudio/sdk 2.1.0 (14-10-2026)
- LM Studio: https://lmstudio.ai/download · https://lmstudio.ai/docs/developer/openai-compat/tools
- Google AI Edge: https://ai.google.dev/edge/litert-lm/overview (06-10-2026) · https://ai.google.dev/edge/litert-lm/android (04-09-2026) · https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference (01-10-2026) · https://github.com/google-ai-edge/LiteRT-LM · https://ai.google.dev/gemma/docs/core (08-07-2026)
- ML Kit GenAI: https://developers.google.com/ml-kit/genai (16-10-2026) · https://developers.google.com/ml-kit/genai/prompt/android/get-started (08-09-2026)
- Chrome: https://developer.chrome.com/docs/ai/prompt-api (26-08-2026) · https://developer.chrome.com/blog/new-in-webgpu-121
- Apple: https://developer.apple.com/documentation/foundationmodels (tool, systemlanguagemodel, managing-the-context-window, supporting-languages-and-locales…, adding-server-side-intelligence-with-private-cloud-compute) · https://support.apple.com/en-us/121115 (14-09-2026) · https://machinelearning.apple.com/research/introducing-third-generation-of-apple-foundation-models (08-06-2026) · https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- Microsoft: https://learn.microsoft.com/en-us/windows/ai/apis/phi-silica (12-10-2026) · https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-local/what-is-foundry-local (04-08-2026)
- Honor: https://www.honor.com/es/phones/honor-600-pro/ · [H·s] https://www.91mobiles.com/honor-600-pro-price-in-india · https://tecnoblog.net/produtos/honor-600-pro/
- Tailscale: https://tailscale.com/kb/1257/connection-types (validada el 01-06-2026) · https://tailscale.com/pricing
- crates.io (API): tauri-plugin-apple-intelligence, tauri-apple-intelligence, tauri-plugin-llama-crab, llama-crab, tauri-plugin-device-ai-apis, tauri-plugin-leap-ai, llama-cpp-2, mistralrs
- Energía (resúmenes): https://arxiv.org/abs/2609.11940 · https://arxiv.org/abs/2603.26603 · https://arxiv.org/abs/2406.06282
