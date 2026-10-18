# Voz para el asistente de Pauta: qué reconocedor usar

Investigación del 18-10-2026. Todas las fuentes se consultaron ese día salvo que se indique otra fecha.
Etiquetas: **[H]** comprobado en fuente primaria · **[H·s]** fuente secundaria · **[I]** inferencia · **[P]** propuesta · **[?]** sin comprobar.

Relacionado: D-002 (núcleo sin IA), D-010 (dictado por teclado en la fase 1), D-036 (escritorio con Tauri, móvil como web app), D-041 (Cloudflare como servidor).

## 0. Recorrido y criterios de aceptación

**Recorrido.** Vas por la calle, abres Pauta en el móvil, pulsas el micrófono o el dictado del teclado y dices «el viernes ceno con mis amigos de nueve a once». Pauta muestra el texto reconocido y una vista previa («viernes 23, 21:00–23:00, Cena con amigos, cuenta: …»). Confirmas, o corriges el texto antes de guardar. Lo mismo desde el Mac o Windows.

**Criterios de aceptación** [P]:
1. Coste 0 € con el uso de una persona (estimación: 20 órdenes al día de unos 6 s, unos 60 min de audio al mes).
2. Acierta en español de España con ruido de calle. Lo que se reconozca mal se corrige en el texto antes de guardar, nunca después.
3. Privacidad: se sabe a quién llega el audio. Mejor si se procesa en el dispositivo, y nunca se envía a un servicio que entrene con él.
4. Mantenimiento mínimo: nada de modelos propios ni servidores que haya que vigilar.
5. Funciona en Android (Honor 600 Pro), iPhone, Mac y Windows.

## 1. Resumen

- **El dictado del teclado sigue siendo lo mejor para la fase 1** (confirma D-010). Cuesta 0 € y no necesita código. En iPhone, el español de España se dicta en el propio dispositivo y sin conexión [H]. En el Mac depende del idioma y se ve en Ajustes [H]. En Windows, el dictado (Win+H) usa Azure y necesita conexión [H]. En el Honor, Gboard funciona, pero Google solo documenta el procesamiento en el dispositivo para los Pixel 6 o posteriores [H]; en otros móviles puede funcionar sin conexión, aunque Google no lo documenta [H·s].
- **La Web Speech API no sirve como base común.** Chrome envía el audio a un servidor [H], y el modo en el dispositivo (`processLocally`) solo existe en Chrome y Edge de escritorio, no en Android [H]. En iPhone no funciona en las web apps de la pantalla de inicio (WebKit, 2021; [?] si sigue igual en iOS 27). Dentro de Tauri no es fiable: un fallo abierto en macOS desde 2023 y WebView2 sin soporte claro.
- **Para un botón de micrófono propio (fase 3), lo más barato y sencillo es grabar el audio y enviarlo a Whisper en Cloudflare Workers AI**: 0,0005 $/min y 10 000 neuronas gratis al día, que dan para unos 214 min diarios [H + cálculo]. Cloudflare no conserva ni entrena con el audio [H] y ya es el servidor previsto (D-041). Groq (gratis hasta 8 h de audio al día) [H] y Gemini con audio directo [H] son las alternativas.
- **Whisper en local** solo compensa en escritorio (Tauri): privado, sin conexión y gratis. En la prueba propia, el modelo base corre a 0,18× tiempo real en 4 hilos de CPU (sección 5.3). En el móvil pesa demasiado [I].

## 2. Web Speech API (`SpeechRecognition`)

### 2.1 Soporte por motor

Datos de `@mdn/browser-compat-data` 8.1.6 (publicado el 15-10-2026), comprobados con npm y en el JSON [H]:

| Motor | `SpeechRecognition` | `processLocally` (en el dispositivo) | `continuous` | Notas |
|---|---|---|---|---|
| Chrome escritorio | 139 sin prefijo (33 con `webkit`) | 139 (`available()`/`install()` 139) | Sí | `phrases` (vocabulario sesgado) desde 142 |
| Chrome Android | 139 / 33 `webkit` | **No** | **«Se puede asignar, pero no tiene efecto»** | — |
| Edge escritorio (≈ WebView2) | 139 / 79 `webkit` | 139 | Sí | Modelo local de Edge: solo en Canary/Dev ≥ 150.0.4076 y con *flag*; es-ES incluido (learn.microsoft.com, revisado el 6-10-2026) [H] |
| Safari macOS | 14.1 `webkit` | No | 17 | — |
| Safari iOS / WKWebView iOS | 14.5 `webkit` | No | 17 | — |
| Android WebView | 37 `webkit` (139 sin prefijo) | No | Sin efecto | — |

**¿A dónde va el audio?**
- **Chrome**: «En algunos navegadores, como Chrome, […] el audio se envía a un servicio web para su reconocimiento, así que no funciona sin conexión» (MDN, página `SpeechRecognition`) [H]. Con `processLocally = true` no salen ni el audio ni el texto, pero hay que descargar antes un paquete de idioma (MDN, *Using the Web Speech API*) [H].
- **Estado real del modo en el dispositivo en Chrome**: BCD lo da como incluido en Chrome 139 de escritorio, pero la ficha de chromestatus (6090916291674112, actualizada el 22-08-2025) dice «In developer trial (Behind a flag)», con Android, WebView e iOS vacíos [H]. Las dos fuentes se contradicen, así que no está claro si viene activado por defecto [?].
- **Safari/WebKit**: el código de WebKit (`WebSpeechRecognizerTask.mm`, rama main) usa `SFSpeechRecognizer` y fija `requiresOnDeviceRecognition = YES` siempre que el reconocedor admita reconocimiento local [H]. Apple ofrece dictado en el dispositivo para «Spanish (Spain)» (página de disponibilidad de funciones de iOS) [H]. Por tanto, el español en Safari se procesaría en el iPhone [I].
- **Edge**: sin el modelo local, usa un servicio en la nube [H·s]. Hay quejas de errores «language not supported» en Edge (Microsoft Q&A, 2025) [H·s].

### 2.2 ¿Funciona dentro de Tauri o de una web app?

| Entorno | Estado | Etiqueta |
|---|---|---|
| **iPhone, web app de la pantalla de inicio** | Un ingeniero de WebKit responde: «SpeechRecognition API is not available in SafariViewController and web apps added to Home Screen for now» (bug 225298, 4-5-2021, cerrado como LATER; siguen preguntando en 2025) | [H] 2021 · [?] estado en iOS 27 |
| **WKWebView iOS (Tauri iOS)** | Bug 239816: la API aparece pero «el aviso de permiso nunca sale». WebKit responde que hace falta `NSSpeechRecognitionUsageDescription` en el Info.plist y que «debería funcionar» (WORKSFORME, 2022) | [H] · sin probar |
| **WKWebView macOS (Tauri Mac)** | Fallo `tauri-apps/tauri#6208` («there is an error when using SpeechRecognition», macOS, abierto desde 7-2-2023, 12 comentarios, actualizado el 6-5-2025). No pude leer los comentarios (red del entorno) | [H] título y estado · [?] causa |
| **WebView2 (Tauri Windows)** | No hay documentación de Microsoft que lo asegure. Hay un caso cerrado de 2021 (WebView2Feedback#1613, sin leer). El modelo local de Edge es solo de Canary/Dev | [?] |
| **Android WebView (Tauri Android)** | El código de Chromium dice: «WebView does not currently support Web Speech Synthesis API, but it does support Web Speech Recognition API» (`android_webview/lib/aw_main_delegate.cc`) [H]. Depende del servicio de reconocimiento del sistema y de que la app conceda el micrófono a la WebView | [H] código · [I] comportamiento |

**Conclusión** [I]: la Web Speech API serviría en Chrome Android (PWA), con el audio en servidores de Google y sin modo local, y en Safari en una pestaña normal. No sirve como solución única para las cuatro plataformas.

## 3. Reconocimiento nativo del sistema

| Sistema | API | En el dispositivo | Fuente |
|---|---|---|---|
| Android | `SpeechRecognizer` (API 8). `createOnDeviceSpeechRecognizer()` e `isOnDeviceRecognitionAvailable()` desde la API 31 (Android 12). `checkRecognitionSupport()` y `triggerModelDownload()` desde la API 33–34 | Sí, si el sistema tiene un servicio local (en el Honor, el de Google [I]). La documentación avisa: «The implementation of this API is likely to stream audio to remote servers» | developer.android.com, actualizado el 28-08-2026 [H] |
| iOS/macOS (clásico) | `SFSpeechRecognizer` (iOS 10, macOS 10.15). `requiresOnDeviceRecognition` (iOS 13) | Sí, si `supportsOnDeviceRecognition` lo permite. Si no, usa la red, con límites diarios y un máximo de 1 min por petición | developer.apple.com (JSON de la documentación) [H] |
| iOS/macOS 26+ | `SpeechAnalyzer` + `SpeechTranscriber` (iOS, iPadOS, macOS y visionOS 26.0) y `DictationTranscriber` (el mismo modelo que el dictado del sistema, para dispositivos más antiguos; admite vocabulario propio y `farField`) | Sí; los modelos se descargan con `AssetInventory` | developer.apple.com [H]. Lista de idiomas: «unos 40 locales, incluido el español» [H·s]. es-ES en concreto [?] |
| Windows | `Windows.Media.SpeechRecognition` | La gramática de dictado se procesa en un «remote web service», con un máximo de 10 s y el permiso «Online speech recognition». Solo las gramáticas propias funcionan en el equipo | learn.microsoft.com (página de 2018) [H] |
| Windows 11, dictado del usuario | Win+H | No: «uses online speech recognition, which is powered by Azure Speech services». es-ES incluido | support.microsoft.com [H] |

### 3.1 Plugins de Tauri (crates.io y npm, 18-10-2026)

| Crate | Versión y fecha | Qué hace | Valoración |
|---|---|---|---|
| `tauri-plugin-stt` (brenogonzaga) | 0.2.2, 7-7-2026 (primera versión 18-12-2025); MIT; 1500 descargas; 23 estrellas | Escritorio: whisper.cpp a través de `whisper-rs` (Metal, CUDA o Vulkan opcionales; modelos de tiny, 75 MB, a large-v3, 3 GB). iOS: `SFSpeechRecognizer`. Android: `SpeechRecognizer`. Pulsar para hablar, sin transcripción en directo | [H] README. Un solo autor y joven. No pude ver si fuerza el modo en el dispositivo en el móvil [?] |
| `tauri-plugin-whisper-rs` | 0.2.2, 30-5-2026; 185 descargas | Whisper local | [H] ficha; sin evaluar |
| `tauri-plugin-whisper-core` | 0.1.0, 23-9-2026; 11 descargas | Whisper + VAD Silero + diarización | [H] ficha; demasiado nuevo |
| `tauri-plugin-sherpa-ncnn` | 0.1.4, 17-3-2025 | Reconocimiento en tiempo real, solo Android | [H] ficha |
| `tauri-plugin-device-ai-apis` | 0.3.0, 4-10-2026; 65 descargas | «Speech, vision, text» del dispositivo | [H] ficha; sin evaluar |
| Oficiales (`@tauri-apps/plugin-*`) | — | **No hay ningún plugin oficial de voz** | [H] búsqueda en npm |

## 4. Whisper en local

### 4.1 Motores y modelos

- **whisper.cpp** (ggml-org): C/C++, sin dependencias, con Metal, Core ML (más de 3× en el Neural Engine), Vulkan, ejemplos para iOS, Android y WebAssembly (README) [H]. No pude leer el número de la última versión (GitHub limitado en el entorno) [?]. `whisper-rs` va por la 0.16.0 (12-3-2026) [H].
- **faster-whisper** 1.2.1 (31-10-2025, PyPI) sobre CTranslate2 4.8.3 [H]. Es Python, así que no encaja en Tauri sin un proceso aparte [I].
- **Tamaños** (archivos ggml en Hugging Face `ggerganov/whisper.cpp`) [H]:

| Modelo | ggml f16 | Cuantizado | Memoria (README) |
|---|---|---|---|
| tiny | 74 MiB | q5_1 31 MiB | ~273 MB |
| base | 141 MiB | q5_1 57 MiB | ~388 MB |
| small | 465 MiB | q5_1 181 MiB | ~852 MB |
| medium | 1463 MiB | q5_0 514 MiB | ~2,1 GB |
| large-v3-turbo | 1549 MiB | q5_0 547 MiB · q8_0 834 MiB | [?] |
| large-v3 | 2952 MiB | q5_0 1031 MiB | ~3,9 GB |

### 4.2 Precisión en español (artículo de Whisper, arXiv 2212.04356, diciembre de 2022)

WER (%) extraído de las tablas 10, 11 y 13 del PDF por posición de columna [H, extracción propia]:

| Modelo | MLS es (audiolibros) | Common Voice 9 es | FLEURS es |
|---|---|---|---|
| tiny | 19,2 | 30,3 | 15,9 |
| base | 12,8 | 19,6 | 9,9 |
| small | 7,8 | 10,3 | 5,6 |
| medium | 5,3 | 6,9 | 3,6 |
| large-v2 | 4,2 | 5,6 | 3,0 |

- Groq publica un WER de 10,3 % para large-v3 y 12 % para large-v3-turbo, sin decir con qué conjunto ni en qué idioma [H].
- **No encontré ningún benchmark con fecha en español con ruido de calle** [?]. MLS y FLEURS son voz leída y limpia; Common Voice es lo más parecido a un micrófono de móvil. Mi prueba con ruido sintético (sección 4.3) es solo una aproximación.

### 4.3 Prueba propia (18-10-2026)

Script: [`prueba-whisper.py`](prueba-whisper.py). Resultado: [`resultado-whisper.txt`](resultado-whisper.txt).
Montaje: faster-whisper 1.2.1, CPU int8, `beam_size=5`, idioma fijado a `es`, 4 hilos de un Xeon a 2,1 GHz (servidor, no portátil). 10 clips de MLS español (test, CC BY 4.0) de 10 hablantes distintos, 140 s en total. Texto normalizado sin tildes ni puntuación. «Ruido 5 dB» es ruido rosa sintético a 5 dB de SNR, no ruido de calle real.

RESULTADOS_PRUEBA

### 4.4 Whisper en el navegador (transformers.js)

- `@huggingface/transformers` va por la 4.3.1 (6-10-2026; la 4.0.0 salió el 30-3-2026) (npm) [H].
- Modelos ONNX de `onnx-community` [H]: whisper-base pesa unos 136 MB en q4 (codificador 18 + decodificador 118 MB); whisper-small, unos 285 MB; whisper-large-v3-turbo, unos 724 MB en q4.
- WebGPU (BCD) [H]: Chrome Android 121, Android WebView 121, Safari y WKWebView iOS 26, Chrome escritorio 113.
- **Valoración** [I]: descargar entre 136 y 700 MB por dispositivo, ocupar memoria y gastar batería en el móvil es justo lo contrario de «mantenimiento mínimo». Solo tendría sentido como experimento sin conexión en escritorio, y ahí whisper.cpp nativo rinde más.

## 5. APIs en la nube

Uso estimado: unos 60 min al mes (20 órdenes al día × 6 s).

| Servicio | Precio | Gratis | Datos | Etiqueta |
|---|---|---|---|---|
| **Cloudflare Workers AI** `@cf/openai/whisper-large-v3-turbo` | 0,0005 $/min (46,63 neuronas/min) | 10 000 neuronas/día en el plan Free, unos **214 min/día**. Al superarlo da error, no cobra | «Zero data retention» en la inferencia normal; «does not use Customer Content […] to train» | [H] precios (página actualizada el 15-10-2026) y privacidad |
| Cloudflare `@cf/deepgram/nova-3` | 0,0052 $/min (472,73 neuronas/min) | Unos 21 min/día con las mismas neuronas | Igual que arriba | [H] |
| **Groq** `whisper-large-v3-turbo` / `whisper-large-v3` | 0,04 $/h / 0,111 $/h; mínimo facturado de 10 s por petición | Plan gratis: 20 peticiones/min, 2000/día, 7200 s de audio por hora y 28 800 s (8 h) al día; archivo ≤ 25 MB | «By default, Groq does not retain customer data for inference requests» | [H] |
| OpenAI | `gpt-4o-mini-transcribe` 0,003 $/min; `gpt-transcribe` 0,0045 $/min; `gpt-4o-transcribe` 0,006 $/min. `whisper-1` ya no aparece en la tabla | No | No entrena con datos de la API (desde el 1-3-2023); registros antiabuso hasta 30 días | [H] |
| Google Cloud Speech-to-Text | V1: **60 min/mes gratis**, luego 0,016 $/min (con registro de datos) o 0,024 $/min (sin registro). V2: 0,016 $/min sin tramo gratis visible | 60 min/mes (justo el uso estimado) + 300 $ de crédito para cuentas nuevas | Elección expresa «con o sin registro de datos» | [H] |
| Deepgram | Nova-3 Monolingual, preregistrado: 0,0043 $/min. Nova-3 Multilingual: 0,0052 $/min | **200 $ de crédito**, sin tarjeta | [?] no revisada | [H] precios |
| AssemblyAI | Universal-2: 0,15 $/h. Universal-3.5 Pro: 0,21 $/h. Streaming multilingüe (incluye español): 0,15 $/h | «Up to 185 hours» de audio grabado y 333 h de streaming, sin tarjeta | [?] no revisada | [H] precios |
| **Gemini API** (audio directo) | `gemini-3.5-flash-lite`: 0,30 $/M tokens de entrada (texto o audio). Audio: 32 tokens/s (1920/min), unos 0,0006 $/min. `gemini-3.5-transcribe` (modelo de transcripción): unos 0,005 $/min | Hay plan gratis (los límites solo se ven en AI Studio [?]) | **En el EEE, Suiza y Reino Unido se aplican las condiciones de pago también a la cuota gratuita**: no se usa para mejorar productos. Fuera de ahí, el plan gratis sí se usa y lo pueden leer revisores humanos. Pero: «You may use only Paid Services when making API Clients available to users in the EEA» | [H] precios (actualizados el 16-10-2026), audio (23-09-2026) y condiciones (28-04-2026) |

**Ventaja de Gemini** [I]: una sola llamada transcribe la orden y devuelve el evento como JSON (fecha, hora, título), sin un reconocedor aparte. Inconvenientes: va contra D-002 (núcleo sin IA) si se usa siempre, la salida no es determinista y las condiciones piden uso «profesional, no de consumo». Para una app personal hecha por un desarrollador parece encajar, pero si se abre a otras personas en el EEE haría falta el plan de pago [I].

**Precisión en español con ruido de cada proveedor**: no encontré benchmarks independientes con fecha [?]. Groq y Cloudflare usan el mismo modelo, Whisper large-v3-turbo, así que su precisión debería ser parecida [I].

## 6. Dictado del teclado del sistema (sin código)

| Plataforma | Cómo | ¿En el dispositivo? | Etiqueta |
|---|---|---|---|
| iPhone | Micrófono del teclado | «Dictation is processed on your iPhone in many languages, and no internet connection is required». **Spanish (Spain)** está en la lista de dictado en el dispositivo | [H] (support.apple.com y página de disponibilidad de funciones de iOS) |
| Android (Honor 600 Pro) | Gboard, micrófono | En Pixel 6 o posteriores, «the text you speak stays on your device» [H]. En otros móviles Google no lo documenta; en foros se habla de un paquete sin conexión [H·s]. El teclado por defecto de MagicOS puede no ser Gboard [I] | [H]/[H·s] |
| Mac | Dictado (tecla de función) | El Mac indica en Ajustes > Teclado si el dictado se procesa en el equipo | [H] |
| Windows 11 | Win+H | En línea, con Azure. «Fluid dictation» con modelos locales solo en PC Copilot+ | [H] |

Ventajas [I]: cero código, cero coste, el usuario ya lo conoce, y el texto llega al mismo campo de captura que el parser determinista (D-002). Inconvenientes: hay que abrir el teclado y pulsar su micrófono (dos toques), y la app no controla el idioma ni el vocabulario.

## 7. Tabla comparativa

| Opción | Coste para 1 persona | Precisión es + ruido | Privacidad | Sin conexión | Esfuerzo | Plataformas |
|---|---|---|---|---|---|---|
| Dictado del teclado | 0 € | Buena [I]; sin benchmark [?] | iPhone: en el dispositivo [H]. Honor: [?]. Windows: Azure [H] | iPhone sí; Android [?]; Windows no | Ninguno | Todas |
| Web Speech API | 0 € | Depende del motor [?] | Chrome: servidores de Google [H]; Safari: en el dispositivo [I] | Solo Chrome escritorio con `processLocally` | Bajo, pero con muchos casos especiales | Chrome Android y Safari en pestaña; Tauri y web app iOS dudosos |
| Nativo (SpeechRecognizer / SpeechAnalyzer) | 0 € | Buena [?] | En el dispositivo si se fuerza [H] | Sí (tras descargar el modelo) | Alto: exige Tauri móvil o app nativa; hoy el móvil es web app (D-036) | Android e iOS |
| whisper.cpp local (Tauri) | 0 € | Turbo y small, buenas en limpio; ver prueba | Total | Sí | Medio: plugin joven o integración propia; modelo de 180–550 MB | Mac y Windows |
| Whisper en navegador | 0 € | Como Whisper, según el modelo | Total | Sí | Medio-alto; 136–700 MB por dispositivo | Todas, en teoría |
| **Cloudflare Whisper turbo** | **0 €** (≈ 214 min/día gratis) | Whisper large-v3-turbo | Sin retención ni entrenamiento [H] | No | Bajo: grabar con `MediaRecorder` y una ruta en el Worker | Todas |
| Groq Whisper | 0 € (8 h/día) | Igual que el anterior | Sin retención por defecto [H] | No | Bajo; otra cuenta y otra clave | Todas |
| Gemini con audio | 0 € (plan gratis) / ≈ 0,0006 $/min | [?] | En el EEE, sin uso para mejorar productos [H] | No | Bajo; además interpreta la orden | Todas |
| OpenAI / Deepgram / AssemblyAI / Google STT | De pago o crédito temporal | [?] | Según el proveedor | No | Bajo | Todas |

## 8. Recomendación por plataforma [P]

**Fase 1 (sin código, confirma D-010):** dictado del teclado en el campo de captura, en las cuatro plataformas, con el texto siempre visible y editable antes de guardar.

**Fase 3 (botón de micrófono propio, si el dictado se queda corto):** grabar con `MediaRecorder` (pulsar para hablar), enviar el audio al Worker de Cloudflare (`whisper-large-v3-turbo`, `language: "es"`), devolver texto, pasarlo al parser determinista y mostrar la vista previa. Es un solo proveedor, el que ya está previsto, con coste 0 €, sin retención y sin claves en el cliente.

| Plataforma | Fase 1 | Fase 3 (principal) | Alternativa |
|---|---|---|---|
| Android (web app en Chrome) | Gboard o el teclado del sistema | Grabar → Cloudflare Whisper | Web Speech API de Chrome (gratis, sin servidor propio, pero el audio va a Google y no hay modo local) |
| iPhone (web app en la pantalla de inicio) | Dictado del teclado (en el iPhone, sin conexión) | Grabar → Cloudflare Whisper | Nada nativo mientras sea web app; la Web Speech API no está disponible en web apps [H 2021] |
| Mac (Tauri, WKWebView) | Dictado de macOS | whisper.cpp local con large-v3-turbo q5 (547 MB) o small q5 (181 MB): privado y sin conexión | Cloudflare Whisper |
| Windows (Tauri, WebView2) | Win+H (Azure, en línea) | Cloudflare Whisper | whisper.cpp local (sin GPU, small o base según la velocidad) |

Gemini con audio queda como **experimento opcional** para las órdenes que el parser no entienda (respeta D-002). Groq queda como **reserva** si Cloudflare falla o cambia de precio.

## 9. Pendientes y pruebas

1. **Grabar 20 órdenes reales en la calle** con el Honor y con un iPhone, y medir el WER y los aciertos del parser con: dictado del teclado, Cloudflare Whisper, Groq y Gemini. Es la prueba que falta: no hay benchmark público de español con ruido de calle.
2. Comprobar si `SpeechRecognition` funciona hoy en una web app de iOS 27 (pantalla de inicio) y en WKWebView de macOS con Tauri 2 (con `NSSpeechRecognitionUsageDescription`).
3. Comprobar en el Honor si Gboard dicta sin conexión en español y cuál es el teclado por defecto de MagicOS.
4. Leer los comentarios de `tauri-apps/tauri#6208` y `MicrosoftEdge/WebView2Feedback#1613` (bloqueados en este entorno).
5. Antes de usar Gemini: confirmar en AI Studio los límites gratuitos y si una app personal en el EEE cuenta como «making API Clients available to users».
6. Si se elige whisper.cpp en escritorio: medir la latencia de una orden de 5 s en el Mac (Metal) y en un portátil Windows sin GPU.

## 10. Fuentes (consultadas el 18-10-2026)

- MDN, `SpeechRecognition` y *Using the Web Speech API*: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition · https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
- `@mdn/browser-compat-data` 8.1.6 (15-10-2026): https://cdn.jsdelivr.net/npm/@mdn/browser-compat-data@8.1.6/data.json
- chromestatus, «On-device Web Speech API» y «On-Device Recognition Quality»: https://chromestatus.com/feature/6090916291674112 · https://chromestatus.com/feature/5136859632107520
- Microsoft Edge, SpeechRecognition con modelo local (6-10-2026): https://learn.microsoft.com/en-us/microsoft-edge/web-platform/speech-recognition-api
- WebKit, bugs 225298 y 239816: https://bugs.webkit.org/show_bug.cgi?id=225298 · https://bugs.webkit.org/show_bug.cgi?id=239816
- WebKit, código fuente: https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/speech/cocoa/WebSpeechRecognizerTask.mm
- Chromium, `android_webview/lib/aw_main_delegate.cc` (main): https://chromium.googlesource.com/chromium/src/+/refs/heads/main/android_webview/lib/aw_main_delegate.cc
- Tauri, fallo 6208 (título y estado mediante la búsqueda de GitHub): https://github.com/tauri-apps/tauri/issues/6208
- Android, `SpeechRecognizer` (28-08-2026): https://developer.android.com/reference/android/speech/SpeechRecognizer
- Apple, `SpeechAnalyzer`, `SpeechTranscriber`, `DictationTranscriber`, `SFSpeechRecognizer` y `requiresOnDeviceRecognition`: https://developer.apple.com/documentation/speech
- Apple, dictado en iPhone y Mac; disponibilidad de funciones de iOS: https://support.apple.com/guide/iphone/dictate-text-iph2c0651d2/ios · https://support.apple.com/guide/mac-help/use-dictation-mh40584/mac · https://www.apple.com/ios/feature-availability/
- Microsoft, reconocimiento de voz en apps de Windows y dictado de Windows: https://learn.microsoft.com/en-us/windows/apps/design/input/speech-recognition · https://support.microsoft.com/en-us/windows/use-voice-typing-to-talk-instead-of-type-on-your-pc-fec94565-c4bd-329d-e59a-af033fa5689f
- Gboard, dictado y funciones avanzadas: https://support.google.com/gboard/answer/2781851 · https://support.google.com/gboard/answer/11197787 · foro de GrapheneOS (secundario): https://discuss.grapheneos.org/d/278-voice-to-text
- crates.io (API de búsqueda), `tauri-plugin-stt` y su README: https://crates.io/crates/tauri-plugin-stt · https://github.com/brenogonzaga/tauri-plugin-stt
- whisper.cpp, README y modelos: https://github.com/ggml-org/whisper.cpp · https://huggingface.co/ggerganov/whisper.cpp
- Artículo de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- faster-whisper en PyPI: https://pypi.org/project/faster-whisper/ · `@huggingface/transformers` en npm · modelos ONNX: https://huggingface.co/onnx-community
- Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- Groq: límites, voz a texto y datos: https://console.groq.com/docs/rate-limits · https://console.groq.com/docs/speech-to-text · https://console.groq.com/docs/your-data
- Cloudflare Workers AI: precios (15-10-2026) y privacidad: https://developers.cloudflare.com/workers-ai/platform/pricing/ · https://developers.cloudflare.com/workers-ai/platform/privacy/
- OpenAI: precios y datos: https://platform.openai.com/docs/pricing · https://platform.openai.com/docs/guides/your-data
- Google Cloud Speech-to-Text, precios: https://cloud.google.com/speech-to-text/pricing
- Deepgram y AssemblyAI, precios: https://deepgram.com/pricing · https://www.assemblyai.com/pricing
- Gemini API: precios (16-10-2026), audio (23-09-2026), condiciones (28-04-2026) y límites: https://ai.google.dev/gemini-api/docs/pricing · https://ai.google.dev/gemini-api/docs/audio · https://ai.google.dev/gemini-api/terms · https://ai.google.dev/gemini-api/docs/rate-limits
