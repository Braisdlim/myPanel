# RAG en una web estática: modelos, claves y quién paga (28-10-2026)

Pregunta: Pauta se publica como web estática en GitHub Pages, sin servidor propio. Debe generar respuestas RAG en español con citas. Requisitos: **coste cero**, que **cualquier persona pueda probarla** (portafolio, entrevistas) **sin que el autor exponga una clave secreta**, y **privacidad razonable** (sin entrenar con los datos).

Este documento **actualiza** y no repite:
- `research/asistente-ia/modelos-api.md` (18-10-2026): Gemini, Groq, Mistral, OpenRouter, Cloudflare, Anthropic y OpenAI.
- `research/asistente-ia/apis-gratuitas.md` (19-10-2026): OVH, Cerebras, Z.ai, Vercel y otros; enrutado con respaldo.
- `research/asistente-ia/modelos-locales.md`: WebLLM, Transformers.js, Chrome Prompt API y el Honor 600 Pro.
- `research/asistente-ia/comunidad.md`.

Lo nuevo aquí: **qué proveedores aceptan llamadas directas desde el navegador (CORS)**, el **proxy en Workers** con sus límites y defensas, **modelos en el navegador para RAG** y **cómo guardar la clave del usuario**.

Etiquetas: **[H]** fuente primaria o prueba propia de hoy, **[H·s]** fuente secundaria, **[I]** inferencia o cálculo propio, **[?]** sin comprobar. Las fechas son las de la página («Last updated») cuando la página la da.

**Límites del método.** WebFetch no resolvía DNS en este entorno, así que he leído la documentación con `curl` a través del proxy: las versiones `.md` de Cloudflare, Groq y OpenRouter, y el HTML de Google y Cerebras. No he creado ninguna cuenta ni he usado ninguna clave real. Las pruebas de CORS usan una clave falsa: comprueban las cabeceras, no que la llamada con clave buena funcione desde un navegador real.

---

## 1. Llamadas directas desde el navegador con la clave del usuario («trae tu clave»)

### 1.1 Prueba propia de CORS (28-10-2026, 21:27 UTC)

Script: `research/rag/prueba-cors/prueba-cors.sh`. Resultado: `research/rag/prueba-cors/resultado-cors.txt`. Hace dos cosas contra cada `…/chat/completions`:
- un *preflight* `OPTIONS` con `Origin: https://ejemplo.github.io`, `Access-Control-Request-Method: POST` y `Access-Control-Request-Headers: authorization,content-type`;
- un `POST` con `Authorization: Bearer clave-falsa`.

| Proveedor · endpoint | Preflight (OPTIONS) | `Access-Control-Allow-Origin` | En el error 401/400/403 | ¿Directo desde el navegador? |
|---|---|---|---|---|
| **Groq** `api.groq.com/openai/v1` | 204; permite `authorization,content-type` | `*` | Sí, `*` | **Sí** [H] |
| **OpenRouter** `openrouter.ai/api/v1` | 204; lista larga de cabeceras | `*` | Sí, `*` | **Sí** [H]. `/api/v1/auth/keys` también da `*` [H] |
| **Gemini (capa OpenAI)** `generativelanguage.googleapis.com/v1beta/openai` | 200; permite `authorization,content-type` | Devuelve **el origen recibido** (`https://ejemplo.github.io`) | Sí | **Sí** [H] |
| **Cloudflare Workers AI (REST)** `api.cloudflare.com/client/v4/accounts/{id}/ai/v1` (y `/ai/run/…`) | **405** | **Ninguna** | Ninguna | **No** [H]. El navegador bloquea la llamada. Hay que pasar por un Worker (§ 2) |
| **Mistral** `api.mistral.ai/v1` | 200 | `*` | Sí, `*` | **Sí** [H] |
| **Cerebras** `api.cerebras.ai/v1` | 200; permite `authorization,content-type` | `*` | **No**: el 401 llega sin la cabecera | **Probablemente sí** [H preflight / I]. Con una clave mala, el navegador verá un error de red opaco en vez del 401 |
| **OVHcloud AI Endpoints, sin cuenta** `oai.endpoints.kepler.ai.cloud.ovh.net/v1` | 200; permite `*` | `*` | Sí, `*` (403 con clave falsa) | **Sí, y sin clave** [H] |

Además, un `POST` real anónimo a OVH con `Origin` devolvió **200**, `access-control-allow-origin: *`, `x-ratelimit-limit-minute: 2` y una respuesta RAG correcta en español con citas `[1]` y `[2]` (gpt-oss-120b, 151 tokens de entrada y 192 de salida) [H, prueba propia]. El endpoint `/v1/embeddings` con `bge-m3` también responde de forma anónima y con el mismo límite de 2 por minuto [H].

**[I]** CORS abierto no lo elige la app, lo decide el proveedor, y puede cambiar sin aviso. Conviene que la app detecte el fallo («no se puede llamar a este proveedor desde el navegador») en lugar de dar un error genérico.

### 1.2 Límites gratuitos y datos (solo lo nuevo o lo que ha cambiado)

| Proveedor | Plan gratuito hoy | ¿Entrena con los datos? | Cambios desde el 18/19-10 |
|---|---|---|---|
| **Groq** | gpt-oss-120b, gpt-oss-20b y qwen3.8-27b: **30 RPM, 1.000 peticiones/día, 8.000 tokens/min y 200.000 tokens/día**. Los tokens en caché no cuentan. Los límites son **por organización** [H rate-limits.md, 28-10-2026]. Ojo: la página dice que esas cifras son «base limits for the Developer plan», lo que choca con lo leído el 18-10 [?] | No, según el contrato [H 18-10, no lo he vuelto a leer] | Las cifras no cambian. La frase sobre el plan es ambigua; hay que verlo en `console.groq.com/settings/limits` con una cuenta [?] |
| **OpenRouter** `:free` | 20 RPM; **50 al día** con menos de 10 créditos comprados, **1.000** a partir de 10 [H limits.md, 28-10]. Contador consultable en `GET /api/v1/key` → `free_model_daily_requests` [H] | Depende del proveedor; hay un ajuste para excluir a los que entrenan [H 18-10]. Gemma 4 `:free` la sirve Google AI Studio [H 19-10] | Hay **OAuth PKCE para que el usuario traiga su clave con un clic**, sin copiarla (§ 4.2) [H oauth.md] |
| **Gemini** | Las cifras del plan gratuito solo se ven en AI Studio [H rate-limits, 26-10-2026] | En el EEE, Suiza y Reino Unido se aplican los términos de pago también a la cuota gratuita: no entrena [H terms, 28-4-2026] | **Desde el 28-5-2026 las claves nuevas de AI Studio son «auth keys»**, y la API rechaza las claves estándar sin restringir [H api-key, 27-10-2026]. Google dice: «Never expose keys client-side in production… run a backend proxy server» [H]. Sigue la cláusula «You may use only Paid Services when making API Clients available to users in the European Economic Area» [H] |
| **Cloudflare Workers AI** | 10.000 neuronas/día, en Free y en Paid; 0,011 USD por 1.000 neuronas, solo en Paid [H pricing, 20-10-2026]. 300 RPM en generación de texto [H limits, 17-9-2026] | No entrena y no conserva en la inferencia normal [H data-usage, 16-10-2026] | Sin cambios. Solo se puede usar a través de un Worker (§ 2) |
| **Mistral** | «Free mode»; límites solo en la consola [H 18-10] | **Sí por defecto**; se puede desactivar [H 18-10] | No lo he vuelto a comprobar hoy |
| **Cerebras** | **No hay gratuito permanente**: 5 USD que caducan a los 30 días, con método de pago verificado. Prueba: gpt-oss-120b a 5 RPM y 1 M tokens/día; qwen-3.8-27b a 1 RPM. «Cerebras doesn't currently offer a no-cost tier that renews automatically» [H rate-limits, 28-10] | No conserva [H 19-10] | Confirma lo del 19-10. **Descartado para coste cero** [I] |
| **OVHcloud anónimo** | **2 peticiones/min por IP y por modelo**, sin cuenta ni clave [H, cabeceras de hoy]. Modelos hoy: gpt-oss-120b, gpt-oss-20b, Qwen3.8-27B, Qwen3.6-27B, Qwen3.5-9B, Qwen3.5-397B-A17B, Llama-3.3-70B, Mistral-Small-3.2-24B, Mistral-Nemo, **bge-m3, bge-multilingual-gemma2 y Qwen3-Embedding-8B** [H `/v1/models`] | «Your data is never used to train our models»; proceso en Gravelines, Francia [H 19-10] | Han aparecido modelos de *embeddings* útiles para RAG multilingüe [H] |

**[I] Lo que esto significa para Pauta.** Con OVH anónimo, el límite es **por IP del visitante**, no del autor. Si el navegador llama directo, cada entrevistador tiene su propio cupo de 2 por minuto y nadie gasta nada del autor. Es justo lo contrario de lo que pasa detrás de un Worker: allí la IP de salida es compartida (riesgo ya anotado en `apis-gratuitas.md` § 4.8).

---

## 2. Sin clave del usuario: un proxy mínimo en Cloudflare Workers (solo documentado; no he creado cuentas)

### 2.1 Qué da el plan gratuito

| Recurso | Workers Free | Fuente |
|---|---|---|
| Peticiones al Worker | **100.000 al día** | [H workers/platform/limits, 12-10-2026] |
| CPU por petición | **10 ms**; la espera de red (`fetch`, la llamada a la IA) **no cuenta** | [H misma página] |
| Subpeticiones | 50 por petición | [H] |
| Workers AI | **10.000 neuronas/día**. Al pasarse, en Free no se cobra: hace falta pasar a Paid (mínimo 5 USD/mes) | [H pricing, 20-10-2026] |
| Turnstile | **Gratis**, hasta 20 *widgets*, «Unlimited challenges» | [H turnstile/plans, 14-8-2026] |

**Cuántas respuestas RAG caben al día** [I], suponiendo 2.500 tokens de entrada (pregunta y fragmentos) y 400 de salida. Neuronas por MTok según la tabla de precios [H]:

| Modelo en Workers AI | Neuronas por respuesta | Respuestas/día con 10.000 |
|---|---|---|
| `@cf/google/gemma-4-26b-a4b-it` (9.091 / 27.273) | ≈ 34 | **≈ 290** |
| `@cf/zai-org/glm-4.7-flash` (5.500 / 36.400) | ≈ 28, sin contar el razonamiento | ≈ 350 como mucho [?] |
| `@cf/openai/gpt-oss-120b` (31.818 / 68.182) | ≈ 107 | ≈ 93 |
| *Embedding* de la pregunta con `@cf/baai/bge-m3` o `@cf/qwen/qwen3-embedding-0.6b` (1.075 por MTok de entrada) | < 0,1 | Despreciable |

**Coste: 0 € garantizado en el plan Free** [I]. Al gastar el cupo, Workers AI deja de responder hasta las 00:00 UTC; no genera factura porque Free no admite exceso [H pricing]. El riesgo no es pagar, sino que **un abusador agote el cupo del día** y la demo deje de funcionar.

### 2.2 Cómo limitar el abuso

1. **Rate Limiting binding** [H workers/runtime-apis/bindings/rate-limit, 21-10-2026]:
   - Se configura con `limit` y `period`, y **`period` solo puede ser 10 o 60 segundos**.
   - `env.LIMITE.limit({ key })` devuelve `{ success }`. La clave es cualquier cadena.
   - Los límites son **aproximados y por ubicación de Cloudflare**: «Requests can exceed your configured limit». Para un límite estricto en todas las ubicaciones, Cloudflare remite a Durable Objects.
   - Cloudflare **desaconseja usar la IP como clave**: «many users may share a single IP, especially on mobile networks».
   - Requiere Wrangler 4.36.0 o posterior. **La página no dice si el binding está en el plan Free ni si tiene coste** [?].
   - **[I]** No sirve para un tope diario, porque el periodo máximo es de 60 s. Sirve para frenar ráfagas.
2. **Turnstile** [H server-side-validation, 22-10-2026]:
   - La validación en el servidor (Siteverify) **es obligatoria**: «The client-side widget alone does not protect your forms».
   - Cada token vale **300 s** y **se usa una sola vez**.
   - **[P]** Patrón: el navegador resuelve Turnstile y el Worker lo valida. Después, el Worker emite un permiso corto propio (por ejemplo, un JWT firmado de 10 min) para no pedir un reto por cada pregunta.
3. **Tope diario global** [P]: un contador por día en KV o en un Durable Object, por ejemplo 200 respuestas al día para la demo. Al llegar, un mensaje claro: «La demo ha llegado a su límite de hoy; trae tu clave o vuelve mañana». Si KV o Durable Objects están en el plan Free y con qué límites lo he **dejado sin comprobar** [?].
4. **Reducir lo que se puede pedir** [P]:
   - El Worker **no es un proxy abierto**: solo acepta `{pregunta, ids_de_fragmentos}` sobre el corpus de la demo, y construye él el prompt.
   - Nada de `model`, `max_tokens` ni `messages` libres.
   - Respuesta limitada a unos 400 tokens.
   - CORS del Worker solo para el origen de Pauta. **[I]** Esto no frena a `curl`, porque `Origin` se falsifica fuera del navegador (OWASP lo dice expresamente [H]). Por eso hacen falta Turnstile y el tope.
5. **El secreto no sale del Worker** [I]: con el binding `env.AI`, ni siquiera hace falta un token de API de Cloudflare. No hay ninguna clave que exponer en la web.

**[I] Encaje con lo ya decidido:** D-043/D-044 ya proponían «el modelo, en un Worker propio». Este proxy es la versión mínima para la demo pública.

---

## 3. Modelos en el propio navegador (sin nube)

### 3.1 Datos comprobados hoy

- **Versiones** [H npm, 28-10-2026]: `@mlc-ai/web-llm` 0.2.86 (11-10-2026, sin cambios), `@huggingface/transformers` **4.3.2** (27-10-2026; antes 4.3.1) y `@wllama/wllama` 3.8.1.
- **WebLLM, catálogo** [H `prebuiltAppConfig` del paquete 0.2.86]. **Todos los modelos tienen el contexto limitado a 4.096 tokens.**

| Modelo WebLLM (q4f16_1) | VRAM declarada | Descarga real (repositorio de HF) | Notas |
|---|---|---|---|
| Qwen3.5-0.8B | 1,6 GB | **0,45 GB** | `low_resource_required: true` |
| Qwen3.5-2B | 2,2 GB | **1,08 GB** | |
| Llama-3.2-3B-Instruct | 2,3 GB | 1,82 GB | |
| Ministral-3-3B-Instruct-2512 | 2,9 GB | 1,95 GB | |
| Qwen3.5-4B | 3,9 GB | **2,39 GB** | |
| **gemma-4-E2B-it** | 3,4 GB | **2,83 GB** | Necesita la función `shader-f16` de WebGPU |
| Qwen3.5-9B | 6,4 GB | — | Solo escritorio con GPU dedicada [I] |

- **Transformers.js (ONNX en `onnx-community`, q4f16)** [H API de HF]:
  - Qwen3.5-0.8B: decodificador de 437 MB más 147 MB de *embeddings* (≈ 0,6 GB).
  - Qwen3.5-2B: ≈ 1,4 GB.
  - Gemma-4-E2B: ≈ 3,1 GB (1,52 + 1,59).
  - Gemma-3-1B: 0,76 GB.
- **Embeddings para buscar, en el navegador** [H API de HF]:
  - `Xenova/multilingual-e5-small`: **118 MB** en int8.
  - `onnx-community/embeddinggemma-300m-ONNX`: 175 MB en q4f16.
  - **[I]** Esto sí es ligero. Buscar en el navegador es viable en cualquier dispositivo; lo pesado es generar.
- **WebGPU en Android**: activado por defecto desde Chrome 121 en Android 12 o posterior con GPU de Qualcomm o ARM [H developer.chrome.com/blog/new-in-webgpu-121]. El Honor 600 Pro (Snapdragon 8 Elite, 12 GB) cumple [H `modelos-locales.md`]. Si Chrome en ese móvil expone `shader-f16`, que Gemma 4 E2B necesita, está **sin comprobar** [?].
- **Velocidad**:
  - Escritorio: la referencia oficial de Gemma 4 E2B por WebGPU es de **73 tok/s en un M4 Max**, con 1,8 GB de memoria (LiteRT-LM Web, no WebLLM) [H `modelos-locales.md`]. El artículo de WebLLM da unos 90 tok/s para un 3B en 4 bits en un M3 [H·s arXiv 2412.15803, diciembre de 2024].
  - **Android en navegador: no hay ninguna medida fiable** para WebLLM con un Snapdragon 8 Elite. Los blogs dan de 4 a 8 tok/s en otros Snapdragon y se contradicen [H·s, pinggy.io 2026]. **[?]** Hay que medirlo en el Honor.

### 3.2 ¿Sirve para RAG en español con citas?

- **[I] Contexto.** 4.096 tokens dan para unas instrucciones, 4 o 5 fragmentos de unos 400 tokens y la respuesta. Para RAG basta si la búsqueda es buena y los fragmentos son cortos.
- **[?] Calidad en español con citas: no medida.** La única referencia propia es de llamadas a herramientas, no de RAG: Qwen3.5-4B local sacó 31/42 en el banco, frente a 30/42 de gpt-oss-120b en OVH (`apis-gratuitas.md` § 4.8.1) [H]. **[I]** En RAG, los modelos de 0,8B a 2B suelen inventar citas o mezclar fragmentos. A partir de 4B (Qwen3.5-4B, Gemma 4 E2B) es razonable para respuestas cortas y extractivas, pero hay que verificarlo.
- **[I] Experiencia de demo.** Un entrevistador no va a esperar a que se descarguen 1-3 GB. En el móvil, además, gasta datos y batería. **Como modo por defecto de la demo, no sirve.** Como **modo «sin nube» opcional** para el modo personal en escritorio, sí: descarga una vez (la caché del navegador lo guarda), privacidad total y coste cero.
- **Alternativa en escritorio:** la Chrome Prompt API (Gemini Nano) admite español, pero **solo en escritorio** y pide más de 4 GB de VRAM o 16 GB de RAM [H `modelos-locales.md`, 26-8-2026]. Sería el «sin nube» con descarga gestionada por Chrome [I].
- **[P] Propuesta híbrida.** Búsqueda siempre en el navegador (e5-small o embeddinggemma, o vectores precalculados en la compilación y servidos como JSON estático). **Generación** con el proveedor elegido; local opcional con Qwen3.5-4B o Gemma 4 E2B. Si no hay generación posible, Pauta muestra los fragmentos encontrados con su procedencia (principio 4, «funciona sin IA»).

---

## 4. Recomendación

### 4.1 Orden de proveedores [P]

**Modo demo (entrevistadores, sin cuenta ni clave, corpus público de ejemplo):**
1. **OVHcloud anónimo, directo desde el navegador**: gpt-oss-120b, con gpt-oss-20b de respaldo. Sin clave, CORS abierto, UE, no entrena y el cupo es **de cada visitante** [H]. 2 peticiones/min bastan para una demo si se limita a una pregunta cada 30 s, con un aviso en la interfaz [I]. Riesgo: no hay contrato y OVH puede cambiarlo [I].
2. **Worker propio con Workers AI** (gemma-4-26b), Turnstile y tope diario. Respaldo cuando OVH falle; ≈ 290 respuestas/día a 0 € [I]. Requiere una cuenta de Cloudflare del autor (la crearía él, no el agente).
3. **Sin IA**: mostrar los fragmentos encontrados, con la procedencia, y el aviso «la generación no está disponible ahora».

**Modo personal (el autor u otra persona con su clave; datos propios):**
1. **Gemini** con su clave de AI Studio (desde el EEE no entrena [H]; CORS ok [H]). Está la cláusula «Paid Services» para apps en el EEE [H]; **[I]** con la clave del propio usuario, el «API Client» lo opera él, pero no está claro.
2. **Groq** con clave (contrato sin entrenamiento [H]; 200.000 tokens/día, unas 70 respuestas RAG [I]).
3. **OpenRouter** por OAuth PKCE: solo con modelos y proveedores que no entrenen, activando el filtro de privacidad. 50/día gratis [H].
4. **Mistral**, solo si el usuario ha desactivado el entrenamiento [H 18-10].
5. **Local** (WebLLM/Transformers.js, o Chrome Prompt API en escritorio), opcional, para «sin nube».
- **Descartados para coste cero:** Cerebras (prueba de 30 días [H]) y Cloudflare REST directo (sin CORS [H]; además, el token sería de cuenta).
- Con datos personales sensibles (correos), se sigue el enrutado por sensibilidad de `apis-gratuitas.md` § 6. Este documento cubre la demo y los documentos propios.

### 4.2 Cómo guardar la clave del usuario

Hechos:
- OWASP: «A single Cross Site Scripting can be used to steal all the data in these objects… it's recommended not to store sensitive information in local storage». Recomienda `sessionStorage` si no hace falta persistencia, y **no alojar varias apps en el mismo origen** porque comparten `localStorage` [H HTML5 Security Cheat Sheet].
- **En GitHub Pages, todos los sitios de proyecto de un usuario comparten origen**: `https://<usuario>.github.io/<repo>` [H docs.github.com, About GitHub Pages]. **[I]** Cualquier otro repositorio publicado en `braisdlim.github.io` podría leer la clave guardada por Pauta en `localStorage` o IndexedDB, y un fallo de XSS en cualquiera de ellos también.

| Opción | Persistencia | Riesgo | Cuándo |
|---|---|---|---|
| **Solo en memoria** (variable JS) | Se pierde al recargar | El más bajo: solo un XSS activo en ese momento | **Demo** y por defecto [P] |
| `sessionStorage` | Hasta cerrar la pestaña | XSS; compartido en el origen mientras la pestaña vive | Comodidad razonable [P] |
| `localStorage` / IndexedDB en claro | Permanente | XSS en **cualquier app del mismo origen** `*.github.io/…`; malware local; copias de seguridad del perfil | Solo con la casilla «Recordar en este dispositivo» y un aviso [P] |
| **Cifrada con una frase de paso** (WebCrypto: PBKDF2 o Argon2 + AES-GCM; la frase no se guarda) | Permanente | Protege la clave en reposo y frente a otras apps del origen. **No** protege frente a un XSS en Pauta mientras está desbloqueada | Modo personal [P] |
| `CryptoKey` no exportable en IndexedDB que cifra la clave | Permanente | **[I]** Otro script del mismo origen puede **usar** la `CryptoKey` para descifrar, aunque no pueda exportarla. Frente a XSS y apps vecinas, da poca protección real | No compensa la complejidad [I] |

Medidas que reducen el riesgo de verdad [P]:
- **Dominio propio o subdominio dedicado** para Pauta, para no compartir origen con otros repositorios de `github.io`. Es la medida que más aporta [I].
- **CSP estricta con `<meta http-equiv>`**, porque GitHub Pages no deja enviar cabeceras propias [I]: `connect-src` solo a los proveedores de la lista, sin scripts de terceros y sin `innerHTML` con texto del modelo (lo que devuelve el modelo es dato, no HTML).
- **Claves con tope**:
  - OpenRouter: clave por OAuth PKCE con presupuesto, revocable en `openrouter.ai/keys/{hash}` [H oauth.md].
  - Gemini: restricción por origen o aplicación en Cloud Console [H api-key].
  - Groq y Mistral: claves separadas solo para Pauta [P].
- Un botón visible **«Olvidar clave»**, y mostrar siempre a qué proveedor va cada petición (principio de procedencia) [P].

---

## 5. Pendientes

- [?] Medir en el Honor 600 Pro (Chrome) WebLLM con Qwen3.5-2B/4B y Gemma 4 E2B: si hay `shader-f16`, tok/s, temperatura y tiempo de descarga.
- [?] Montar un banco de RAG en español con citas (10-20 preguntas sobre un corpus de ejemplo, con citas comprobables) y pasarlo a OVH gpt-oss-120b, Workers AI gemma-4-26b, Gemini, Groq y Qwen3.5-4B local.
- [?] Ver en la consola de Groq si 1.000/día y 200.000 tokens/día son del plan gratuito (la página es ambigua hoy).
- [?] Confirmar si el Rate Limiting binding, KV y Durable Objects están en Workers Free y con qué límites.
- [?] Probar CORS con una clave real desde un navegador real (Cerebras devuelve el 401 sin `Access-Control-Allow-Origin`).
- [?] Decidir si Pauta tendrá dominio o subdominio propio (afecta a la seguridad de la clave guardada).

## 6. Fuentes (consultadas el 28-10-2026)

**Pruebas propias:** `research/rag/prueba-cors/prueba-cors.sh` y `resultado-cors.txt`. Llamada anónima a OVH `chat/completions` y `embeddings` (descrita en el § 1.1). Tamaños de los repositorios con `https://huggingface.co/api/models/{repo}/tree/main`. `prebuiltAppConfig` de `@mlc-ai/web-llm` 0.2.86 (npm).

**Primarias:**
- Groq: https://console.groq.com/docs/rate-limits.md
- OpenRouter: https://openrouter.ai/docs/api_reference/limits.md · https://openrouter.ai/docs/guides/overview/auth/oauth.md
- Gemini: https://ai.google.dev/gemini-api/docs/rate-limits (26-10-2026) · https://ai.google.dev/gemini-api/docs/api-key (27-10-2026) · https://ai.google.dev/gemini-api/terms (28-4-2026)
- Cerebras: https://inference-docs.cerebras.ai/support/rate-limits
- Cloudflare: https://developers.cloudflare.com/workers-ai/platform/pricing/ (20-10-2026) · …/workers-ai/platform/limits/ (17-9-2026) · …/workers-ai/platform/data-usage/ (16-10-2026) · …/workers-ai/configuration/open-ai-compatibility/ (18-9-2026) · …/workers/platform/limits/ (12-10-2026) · …/workers/runtime-apis/bindings/rate-limit/ (21-10-2026) · …/turnstile/plans/ (14-8-2026) · …/turnstile/get-started/server-side-validation/ (22-10-2026)
- OVHcloud: https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/models
- Chrome: https://developer.chrome.com/blog/new-in-webgpu-121
- OWASP: https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html (leída desde el repositorio `OWASP/CheatSheetSeries`)
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
- npm: `@mlc-ai/web-llm`, `@huggingface/transformers`, `@wllama/wllama`

**Secundarias:**
- WebLLM (artículo): https://arxiv.org/html/2412.15803v1
- Velocidad en Android (sin rigor): https://pinggy.io/blog/run_llm_in_browser_webgpu/
