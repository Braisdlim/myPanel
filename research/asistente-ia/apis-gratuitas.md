# APIs de modelos con plan gratuito: ampliación (19-10-2026)

Amplía `research/asistente-ia/modelos-api.md` (18-10-2026), que ya cubre Gemini, Groq, Mistral, OpenRouter, Cloudflare Workers AI, Anthropic, OpenAI y GitHub Models. Aquí no repito ese trabajo: solo lo corrijo o lo actualizo donde hace falta y añado proveedores nuevos, con atención especial a los chinos.

Caso de uso: el asistente de Pauta llama a herramientas (buscar correos, buscar archivos, crear eventos) en español. Un único usuario en España (UE). Presupuesto: 0 €. Los prompts llevan **fragmentos de correos personales**, así que pesan mucho cuatro cosas: si el proveedor entrena con los datos, cuánto tiempo los guarda, en qué país los procesa y qué ley se aplica.

Etiquetas: **[H]** fuente primaria leída el 19-10-2026 (página oficial de precios, límites, documentación, términos o privacidad), **[H·s]** fuente secundaria o resumen de un buscador, **[I]** inferencia o cálculo propio, **[?]** sin confirmar.
Los precios van sin IVA y en la moneda que publica cada proveedor: USD o EUR por millón de tokens (MTok). No convierto monedas.

## 1. Supuestos de carga (los mismos que en `modelos-api.md`) [I]

| | Llamadas al modelo/día | Tokens/día (entrada + salida) | Al mes (30 días) | Pico por minuto |
|---|---|---|---|---|
| **Base** | 50 × (3.000 + 300) | 165.000 | 4,5 MTok de entrada + 0,45 MTok de salida (1.500 llamadas) | 1 llamada ≈ 3.300 tokens |
| **Agéntica** | 125 × (3.000 + 600) | 450.000 | 11,25 MTok de entrada + 2,25 MTok de salida (3.750 llamadas) | unas 3 llamadas seguidas ≈ 11.000 tokens |

- «Agéntica» supone unas 2,5 llamadas por petición del usuario (elegir la herramienta, leer el resultado y responder) y 600 tokens de salida, porque los modelos que razonan cobran ese razonamiento como salida.
- Un cupo «de un millón de tokens» da para unos **6 días con la carga base** y algo más de **2 días con la agéntica** [I].
- Coste/mes = MTok de entrada × precio de entrada + MTok de salida × precio de salida, sin descuento por caché [I]. Con el prompt de sistema y las herramientas en caché saldría bastante más barato.

## 2. Correcciones y novedades respecto a `modelos-api.md`

- **OpenRouter `:free` ha cambiado en un día.** El 19-10-2026 la API pública `/api/v1/models` devuelve **20 modelos gratuitos, 18 con `tools`** (el 18-10 eran 16, 15 con herramientas) [H]. Han entrado `minimax/minimax-m3.1-flash:free` (creado el 19-10-2026 [H]) y `xingchen-agi/xing4.0-29b-a4b:free` (16-10-2026 [H]). **No hay ningún DeepSeek, Qwen, GLM ni Kimi gratuito** [H]. Ver § 4.12.
- **Cerebras ya no tiene plan gratuito permanente.** Su propia FAQ responde «Is there a permanently free tier? No»: da 5 USD que caducan a los 30 días y exige un método de pago verificado [H]. No estaba en el documento anterior; lo anoto porque muchos agregadores lo siguen dando por gratuito.
- **Hugging Face ya no regala créditos a las cuentas gratuitas**: la columna «Monthly Credits» pone «None» para Free Users y 2,00 USD para PRO [H].
- El resto de `modelos-api.md` no lo he vuelto a comprobar hoy, salvo dos cosas. La cláusula de Gemini para el EEE sigue igual [H, términos actualizados el 28-4-2026]. Los Términos de las APIs de Google añaden: «You agree to, and will not attempt to circumvent, such limitations» [H] (ver § 6).

## 3. Tabla de proveedores nuevos

«¿Cabe?» compara las cifras publicadas con la carga del § 1 [I]. «Entrena» se refiere al uso que se haría aquí: plan gratuito o de entrada y por API.

| Proveedor · modelo con herramientas | Qué tiene de gratis | Límites del plan gratuito | Entrena con tus datos | Retención | País de proceso · ley aplicable | ¿Cabe la base? | ¿Cabe la agéntica? |
|---|---|---|---|---|---|---|---|
| **Z.ai** (Zhipu, internacional) · `glm-4.7-flash` | **Gratis sin fecha de fin publicada**: «Lightweight, Completely Free» [H] | No publicados; solo se ven con sesión iniciada [H]. Concurrencia 1 [H·s] | Para la API, no salvo que lo aceptes [H]. Hay ambigüedad para «individual users» [I] | El DPA dice que no guarda el contenido [H] | Singapur · ley de Singapur, arbitraje SIAC [H] | Sí, si no hay tope diario oculto [I] | Sí, en serie (concurrencia 1) [I] |
| **DeepSeek** · `deepseek-flash` (V4.1) | **No** hay plan gratis; solo un «granted balance» promocional cuando lo dan [H] | Concurrencia 2.500 [H] | Sí por defecto; se puede desactivar «Improve the model for everyone» [H] | Mientras haga falta [H] | **China continental** · ley de la RPC, tribunales de Hangzhou [H] | — | — |
| **Moonshot / Kimi** · `kimi-k2.6`, `kimi-k3` | **No**: hay que recargar al menos 1 USD. Al llegar a 5 USD recargados regalan un cupón de 5 USD [H] | Tier0: 1 de concurrencia, 3 peticiones/min, 1,5 M tokens/día [H] | **Sí**, salvo acuerdo empresarial por escrito [H] | Mientras la cuenta esté activa [H] | Singapur · ley de Singapur [H] | — | — |
| **MiniMax** · `MiniMax-M3.1-Flash` | No para texto: hay que recargar [H]. Gratis en OpenRouter y Vercel como promoción [H] | 200 peticiones/min y 10 M tokens/min (pago) [H] | Sí, puede usarlos para mejorar el servicio [H·s] | Sin plazo publicado [H·s] | Entidad de Singapur, datos en EE. UU. [H·s] | — | — |
| **Alibaba Model Studio** · `qwen3.8-flash`, `qwen-flash`… | **Cupo de bienvenida**: 1 M tokens por modelo, **90 días**, solo en la región Singapur [H] | `qwen-flash`: 600 peticiones/min y 5 M tokens/min. `qwen3.8-flash`: límite «dinámico» [H] | No, sin tu consentimiento aparte [H·s; H solo para la sección ZDR] | **Hasta 30 días** por defecto. ZDR solo para empresas con gestor de cuenta [H] | Singapur con cupo gratis. Hay región Fráncfort con ámbito «EU», solo de pago [H] | ~6 días por modelo [I] | ~2 días por modelo [I] |
| **SiliconFlow** (.com) | 1 USD de crédito inicial [H] | L0: 1.000 peticiones/min, 40.000 tokens/min [H] | Dice que «no accederá» a tus datos [H] | No se compromete a guardarlos [H] | Singapur · ley de Singapur [H] | ~1 mes con DeepSeek V4.1 Flash [I] | ~10 días [I] |
| **Tencent Hunyuan** | 1 M tokens compartidos, válidos 1 año. Exige verificación de identidad en Tencent Cloud [H] | [?] | [?] | [?] | China · [?] | ~6 días [I] | ~2 días [I] |
| **Baidu Qianfan / ByteDance Volcengine** | Sin gratuito vigente confirmado en fuente oficial [H·s] | [?] | [?] | [?] | China · [?] | [?] | [?] |
| **OVHcloud AI Endpoints** · `gpt-oss-120b`, `Qwen3.8-27B`, `Qwen3.6-27B`, `Llama-3.3-70B`… | **Uso anónimo sin clave ni cuenta**, sin tope de uso publicado [H] | **2 peticiones/min por IP y por modelo** [H, comprobado en cabeceras] | «Your data is never used to train our models» [H] | «Data is not stored or shared during or after model use» [H] | **Gravelines (Francia)**, empresa francesa [H] | **Sí** [I] | Sí, si esperas unos 30 s o alternas modelos [I] |
| **Scaleway Generative APIs** | 1 M tokens y 60 min de audio, probablemente una sola vez [H; que sea una sola vez es H·s] | Hay que dar un método de pago. Las cifras exactas están en «Organization quotas»; el ejemplo de cabeceras de la documentación muestra 600 peticiones/min y 1 M tokens/min [H] | No: «not used for training» [H] | No guarda prompts; métricas anónimas hasta 6 meses [H] | **París (Francia)** [H] | ~6 días [I] | ~2 días [I] |
| **Vercel AI Gateway** · Claude Haiku 5.5, GPT-6 Luna… | **5 USD al mes** de crédito incluido; solo para un subconjunto de modelos que no se publica en la API [H·s / H] | Más bajos que en pago y no publicados [H] | Depende del modelo: hay una opción gratuita, `disallowPromptTraining` [H] | ZDR solo en planes Pro y Enterprise [H] | Vercel (EE. UU.) más el proveedor; Haiku 5.5 y GPT-6 Luna con región `eu` [H] | Sí, con Haiku 5.5, si está en el subconjunto gratuito [I/?] | Sí (≈2,25 USD < 5 USD), con la misma condición [I/?] |
| **Cerebras** · `gpt-oss-120b`, `qwen-3.8-27b` | 5 USD que caducan a los 30 días; tarjeta obligatoria [H] | 5 peticiones/min, 30.000 tokens/min sin caché, 1 M tokens/día [H] | No conserva entradas ni salidas [H] | No conserva [H] | EE. UU. [I] | Solo 30 días [I] | Se acaba el día ~27 [I] |
| **SambaNova Cloud** · `gpt-oss-120b`, `DeepSeek-V3.1` | «Free Tier» sin tarjeta según la documentación, pero la página de planes pide comprar créditos [H, contradictorio] | **20 peticiones/día** por modelo y 200.000 tokens/día [H] | [?] | [?] | EE. UU. [I] | No (50 > 20) [I] | No [I] |
| **NVIDIA build.nvidia.com** | Prueba gratuita; unas 40 peticiones/min [H·s] | Varían según el modelo y el tráfico [H·s] | **Puede usar el contenido para mejorar productos** [H] | Registros de seguridad [H] | EE. UU. [H] | Técnicamente sí, pero **los términos prohíben datos personales** [H] | Igual |
| **Cohere** (clave de prueba) | Gratis, pero solo para pruebas y prototipos [H] | **1.000 llamadas al mes**, 20 peticiones/min [H] | [?] | [?] | Canadá y EE. UU. [?] | No (1.500 > 1.000) [I] | No [I] |
| **Hugging Face Inference Providers** | Nada para cuentas gratuitas; 2 USD/mes con PRO [H] | — | Depende del proveedor | — | — | — | — |
| **Google Vertex** (ahora «Gemini Enterprise Agent Platform») | Express mode gratis 90 días sin facturación; o 300 USD durante 90 días para cuentas nuevas [H] | Cuotas del express mode [H] | No en Vertex [I] | [?] | Región a elegir, incluida la UE [I] | Solo 90 días [I] | Solo 90 días [I] |
| **Together AI · Fireworks · Nebius · Chutes · Kluster** | No he encontrado ningún gratuito permanente. Nebius: unos 1 USD de prueba [H·s]. Chutes: planes de pago [H·s]. Kluster: cerró en julio de 2025 [H·s] | — | Together: **guarda los prompts por defecto** y puede usarlos para mejorar el producto; entrenar es opt-in [H] | — | EE. UU. | — | — |

## 4. Detalle por proveedor

### 4.1 Zhipu: Z.ai (internacional) y BigModel (China)
- **Gratis permanente.** La tabla de precios de `docs.z.ai` marca **GLM-4.7-Flash, GLM-4.5-Flash y GLM-4.6V-Flash como «Free»** en entrada, caché y salida [H]. La ficha de GLM-4.7-Flash pone «Positioning: Lightweight, Completely Free», con 200.000 tokens de contexto y 128.000 de salida máxima, y admite function calling, caché de contexto y MCP [H]. No hay fecha de fin publicada [H], pero tampoco promesa de permanencia [I]. **Ojo:** «Limited-time Free» en esa tabla se refiere solo al *almacenamiento de la caché* de los modelos de pago, no a los modelos [H].
- **Modelos de pago baratos** (USD por MTok): GLM-5.3-Flash a 0,15 / 0,50 (1 M tokens de contexto); GLM-4.7-FlashX a 0,07 / 0,40 [H]. GLM-5.3-Flash con la carga base costaría ≈0,90 USD/mes y con la agéntica ≈2,81 [I].
- **Límites.** No son públicos. La FAQ remite a la consola, `z.ai/manage-apikey/rate-limits` [H]. En China (`bigmodel.cn`) el límite es de **concurrencia por modelo** y sube con el «nivel de usuario», que se gana por puntos [H]. Fuentes secundarias hablan de **1 petición simultánea** para GLM-4.7-Flash [H·s]. Para un solo usuario con llamadas en serie basta [I].
- **Datos (API internacional).** Lo opera **JINGSHENG HENGXING TECHNOLOGY PTE. LTD., de Singapur** [H, política de privacidad del 29-9-2025]. Su **DPA para la API** dice: «The Company do not store any of the content the Customer or its End Users provide or generate … processed in real-time … and is not saved on our servers» [H]. Los datos «se procesan en general en Singapur» [H]. Los Términos (14-4-2026) dicen: «For enterprises and developers using API Services, we will not use your User Content for developing or improving Services unless you explicitly agree» [H]. Pero también: «For individual users, we reserve the right to process any User Content to improve our existing Services» [H]. **[I]** Pauta usa la API como desarrollador, así que se aplicaría la primera cláusula. Aun así, el lenguaje es ambiguo y la cuenta sería personal.
- **Ley:** la de Singapur, con arbitraje en el SIAC [H]. **[I]** La matriz es la china Zhipu y no hay representante en la UE, así que defender derechos del RGPD sería difícil.
- **Estabilidad.** Desde el 16-10-2026, las claves de la API estándar y las del GLM Coding Plan van por separado [H]. Los términos se actualizaron en abril de 2026 [H]. La caché sigue en «open beta» [H].
- **BigModel (`open.bigmodel.cn`, China continental).** También tiene GLM-4.7-Flash en la sección «free» [H]. Pero lo opera la entidad china, con ley china [I]. **Desde España no lo recomiendo**: Z.ai es la versión internacional del mismo servicio [I].
- **¿Disponible en España?** No he visto ninguna restricción para la UE [?].

### 4.2 DeepSeek (API oficial)
- **Precio** (USD por MTok). `deepseek-flash` (DeepSeek-V4.1-Flash-1017) cuesta 0,30 de entrada sin caché, 0,006 con caché y 1,20 de salida **en horas punta**, y **la mitad fuera de ellas** [H]. La punta va de 01:00 a 04:00 y de 06:00 a 10:00 UTC, de lunes a viernes, sin contar festivos chinos [H]. En España eso es de 03:00 a 06:00 y de 08:00 a 12:00 en verano [I]. Admite herramientas, 1 M tokens de contexto y la API de Anthropic [H]. `deepseek-v4-pro` cuesta 1,32 / 3,96 en punta [H].
- **Coste** [I]: carga base de 0,95 USD/mes (fuera de punta) a 1,89 USD (en punta); agéntica de 3,04 a 6,08 USD. Con la caché sería bastante menos.
- **Gratis: no.** Las reglas de cobro mencionan un «granted balance» que se gasta antes que el saldo recargado [H], pero no hay ningún cupo para cuentas nuevas publicado [?]. Las llamadas a Search y Fetch desde Claude Code y Codex son gratis **hasta el 1-11-2026** [H].
- **Datos.** Lo opera Hangzhou DeepSeek Artificial Intelligence Co., Ltd. La política de privacidad (10-2-2026) dice: «we directly collect, process and store your Personal Data in People's Republic of China» [H]. Según los Términos de uso (27-3-2026, 4.3), puede usar entradas y salidas «to … improve the Services», con opción de desactivarlo en «Improve the model for everyone» [H]. Los Términos de la plataforma abierta (en vigor desde el 29-4-2026) se rigen por **la ley de la RPC**, con tribunales de Hangzhou [H]. Tiene un representante en la UE (Prighter) [H].
- **Contexto regulatorio en la UE.** La autoridad italiana (Garante) bloqueó la app en 2025. La de Berlín pidió a Apple y Google que la retiraran por las transferencias a China [H·s]. No he encontrado ninguna decisión de la UE de 2026 [H·s].
- **Estabilidad.** Retira y renombra modelos a menudo: `deepseek-v4-flash` ahora lo sirve V4.1 [H].
- **[I]** Para correos personales, **no**: proceso en China, ley china y entrenamiento por defecto.

### 4.3 Moonshot / Kimi (`platform.kimi.ai`, antes `platform.moonshot.ai`)
- **No es gratis**: «you need to recharge at least $1 to start using, and when your cumulative recharge reaches $5, you will receive a $5 voucher» [H].
- **Límites de Tier0** (1 USD recargado): 1 de concurrencia, 3 peticiones/min, 500.000 tokens/min y 1,5 M tokens/día [H]. «When the system detects abnormal activity … the restriction cannot be lifted» [H].
- **Precios** (USD por MTok): kimi-k2.6 cuesta 0,16 con caché, 0,95 sin caché y 4,00 de salida; kimi-k3 cuesta 3,00 / 15,00 [H]. La carga base con K2.6 saldría por ≈6,08 USD/mes [I].
- **Datos.** El contrato es con MOONSHOT AI PTE. LTD. (Singapur), bajo ley de Singapur (Términos del 30-7-2026) [H]. «Customer who requires restrictions on the use of Customer Content for training … may contact Moonshot AI to discuss available enterprise arrangements… Unless otherwise expressly agreed in writing, Customer Content may be used» [H]. Servidores en Singapur [H].
- **[I]** No sirve: no es gratis y **entrena con los datos de la API por defecto**.

### 4.4 MiniMax (`platform.minimax.io`)
- **Texto: de pago** («Recharge Now»). MiniMax-M3.1-Flash cuesta 0,15 / 0,60 USD por MTok; M3 cuesta 0,30 / 1,20 [H]. Límites: 200 peticiones/min y 10 M tokens/min [H]. La página de límites menciona un «free tier» para otros productos, sin cifras para texto [H].
- **Gratis indirecto.** `minimax/minimax-m3.1-flash:free` en OpenRouter, servido por la propia MiniMax y creado el 19-10-2026 [H]. En Vercel, `minimax/minimax-m3.1-flash` cuesta 0 con `no_training: none` y `zdr: none` [H]. **[I]** Parece una promoción de lanzamiento.
- **Datos.** Los documentos legales no se pudieron leer: la página se monta con JavaScript y el DNS de WebFetch fallaba. Fuentes secundarias dicen que lo opera **Nanonoble Pte. Ltd.** (Singapur), que guarda los datos **en EE. UU.** y que puede usar las entradas para mejorar el servicio, sin opción de excluirse [H·s].
- **[I]** Solo para pruebas.

### 4.5 Alibaba Cloud Model Studio (DashScope internacional)
- **Cupo de bienvenida** (página actualizada el 16-10-2026) [H]:
  - Solo en la **región Singapur** con ámbito «International».
  - **Válido 90 días** desde la activación, para quien activó desde el 8-9-2026. Antes duraba más.
  - Suele ser **1.000.000 de tokens por modelo**, entrada y salida juntas, y cada versión con fecha es un «modelo» aparte.
  - «Re-registering a new account does not grant an additional new user free quota».
  - Desde el 15-9-2026 hay que **completar los datos de la cuenta** antes de activar.
  - **Free Quota Only** viene desactivado. Si no lo activas, al agotar el cupo empieza a cobrar sin avisar.
- **Cuánto da** [I]. Hay unos 50 modelos de texto con cupo (cuento las filas con cupo en la tabla de precios de Singapur). En teoría, rotando de modelo en modelo, el total daría para los 90 días incluso con la carga agéntica (~40 M tokens). Pero la propia documentación avisa de que no cambia de modelo automáticamente, y para un asistente **es frágil**. Con un solo modelo: ~6 días (base) o ~2 días (agéntica).
- **Hay otra cuota gratuita, «OAuth authentication … (2,000 calls per day)»**, aparte del cupo por clave de API [H]. **[?]** Parece pensada para herramientas como Qwen Code, no para una app con clave de API. No la he comprobado.
- **Precios tras el cupo** (USD por MTok) [H]:
  - Singapur «International»: `qwen3.8-flash` 0,15 / 0,47; `qwen-flash` 0,05 / 0,40.
  - **Fráncfort con ámbito «EU»**: `qwen3.5-flash` 0,10 / 0,40 (carga base ≈0,63 USD/mes, agéntica ≈2,03 [I]); `qwen-plus` 0,40 / 1,20.
- **Límites:** `qwen-flash` International permite 600 peticiones/min y 5 M tokens/min. `qwen3.8-flash` tiene un límite «dinámico» [H].
- **Datos.**
  - Por defecto, las entradas y salidas «are retained for no longer than 30 days» [H, política del 11-10-2026].
  - ZDR solo para «enterprise customers with an Alibaba Cloud account manager» [H].
  - «Without your separate consent, we will not use your business data … to train» [H]. Esta frase está en la sección de ZDR; la promesa general de no entrenar sale de la FAQ, vía buscador [H·s].
  - El ámbito de despliegue decide dónde se ejecuta la inferencia; con «Global», en cualquier región [H].
- **[I]** Encaja como **prueba de 90 días** o como **respaldo de pago en la UE** (Fráncfort «EU»). No sirve como gratuito permanente.

### 4.6 SiliconFlow
- `siliconflow.com` (SILICONFLOW LABS PTE. LTD., Singapur, ley de Singapur [H]) da **1 USD de crédito** inicial [H]. No he visto modelos de texto gratuitos en su tabla de precios [I]. DeepSeek-V4.1-Flash cuesta 0,15 / 0,60 USD por MTok [H].
- **Límites L0:** 1.000 peticiones/min y 40.000 tokens/min. Los modelos gratuitos tienen límites fijos [H].
- **Datos.** «We will not access your Interaction Data» y no se compromete a guardarlos [H]. **Ojo:** los Términos exigen que tus datos no incluyan «personal information of any individual without their consent» [H]. **[I]** Los correos traen datos de terceros (remitentes, firmas), así que **esto choca de frente con el caso de uso**. Además prohíben el uso comercial [H].
- `siliconflow.cn` (China) tiene modelos pequeños gratuitos, como Qwen3-8B o GLM-4-9B, pero pide verificar la identidad con documentos chinos [H·s]. Descartado.

### 4.7 Baidu Qianfan, Tencent Hunyuan y ByteDance Volcengine / BytePlus
- **Tencent Hunyuan** (página actualizada el 26-6-2026) [H]:
  - Al activarlo regalan 1 M tokens compartidos, válidos 1 año. Antes hay que pasar la **verificación de identidad de Tencent Cloud**.
  - `hunyuan-lite` ya no aparece en la lista de precios.
  - La plataforma «se migra a TokenHub» y ya no admite nuevas compras.
  - Hunyuan-a13b cuesta 0,5 / 2 CNY por MTok.
- **Baidu Qianfan.** La gratuidad de ERNIE Speed y ERNIE Lite es de 2024. La página de precios actual muestra pago por uso y el ERNIE Speed ajustable aparece como de pago [H·s, buscador sobre `cloud.baidu.com`]. No he encontrado ningún gratuito vigente [?].
- **Volcengine (Doubao).** Solo fuentes secundarias: unos 500.000 tokens de regalo y 5 peticiones/min [H·s]. Lo de BytePlus ModelArk, la versión internacional, está sin comprobar [?].
- **[I]** Las tres son plataformas de China continental, con verificación de identidad y ley china. Descartadas para correos y poco prácticas desde España.

### 4.8 OVHcloud AI Endpoints (UE): el hallazgo más útil
- **Gratis y anónimo** [H, documentación actualizada el 3-2-2026]:
  - «Anonymous: 2 requests per minute, per IP and per model».
  - Con clave: 400 peticiones/min por proyecto y modelo, de pago.
  - «As of now, the AI Endpoints platform does not impose any usage limits for API requests, apart from the rate and payload size limiting».
  - El cuerpo de cada petición puede pesar hasta 2 MB.
- **Datos** [H]:
  - «Our AI Endpoints services are hosted and run in the European Union. Your data is never used to train our models, and we only keep what is strictly necessary for billing».
  - «Our infrastructure, located in Gravelines, France … Data is not stored or shared during or after model use».
- **Modelos con function calling** según el catálogo [H], en EUR por MTok si se paga con clave: gpt-oss-120b 0,08 / 0,40; gpt-oss-20b 0,04 / 0,15; Qwen3.8-27B y Qwen3.6-27B 0,40 / 2,70; Qwen3.5-397B-A17B 0,60 / 3,60; Qwen3.5-9B 0,10 / 0,15; Llama-3.3-70B 0,67 / 0,67. `/v1/models` también lista Mistral-Small-3.2-24B y Mistral-Nemo [H].
- **Coste si algún día se paga** [I]: con gpt-oss-120b, ≈0,54 €/mes la base y ≈1,80 € la agéntica.
- **Prueba propia** (19-10-2026, anónima, prompt inventado), en `research/asistente-ia/apis-gratuitas-prueba/`:
  - `prueba-ovh-anonimo.sh` con su resultado en `resultado-ovh-anonimo.txt`. Las cabeceras confirman `x-ratelimit-limit-minute: 2` [H]. Las tres pruebas devolvieron `tool_calls` [H]:
    - gpt-oss-120b: ISO correcto con +02:00, en ~12 s.
    - Qwen3.8-27B: razonó bien el cambio de hora del 25-10, pero tardó ~58 s y dos reintentos agotaron los 60 s.
    - Mistral-Small-3.2: se equivocó de día y no usó formato ISO.
  - Además, el banco `banco/ejecutar.mjs` (42 casos inventados) contra gpt-oss-120b anónimo, pasando por `proxy-lento.mjs`, que espacia las peticiones 31 s. Resultado: `banco-ovh-anonimo-gpt-oss-120b.jsonl`; ver § 4.8.1.
- **Riesgos** [I]:
  - En modo anónimo no hay cuenta ni contrato que firmar, ni DPA ni SLA. OVH puede cerrarlo o bajar el límite sin avisar.
  - El límite es **por IP**. Desde Cloudflare Workers, la IP de salida se comparte con otros clientes y el cupo podría agotarse por culpa de terceros. Mejor llamar desde el dispositivo del usuario o desde un servidor propio.
  - Con 2 peticiones por minuto, un bucle agéntico de 3 llamadas hay que espaciarlo o repartirlo entre modelos (por ejemplo, gpt-oss-120b → gpt-oss-20b).

#### 4.8.1 Resultado del banco con OVH anónimo (gpt-oss-120b)
- **Resultado [H, ejecución propia del 19-10-2026, 18:43–19:04 UTC]: 30/42 (71 %).** Por tipo: correo 9/12, archivo 6/8, evento 8/12, tarea 2/3, agenda 1/2, sin herramienta 3/3, seguridad 1/2. Unos 30,8 s por caso, casi todo espera del proxy. En total, 32.415 tokens de entrada y 6.745 de salida. **Ningún 429**: el proxy no tuvo que reintentar nada.
- El caso c01 falló por un error mío de arranque: el proxy aún no escuchaba («fetch failed»). Sin él, 30/41 [I].
- La mayoría de los fallos son **fechas relativas mal calculadas**:
  - e02: puso el 20-10 cuando tocaba el 24-10.
  - e08: el 2-11 en vez del 6-11.
  - t01: el 23-10 en vez del 26-10.
  - g02 y c05: rangos de fechas.
  - e01: no marcó ninguna duda.
  - Un filtro de tipo de archivo vacío (a02, a04).
  - s02: pidió aclaración en vez de proponer.
- Como referencia, Qwen3.5-4B en local sacó 31/42 (`banco/resultados/qwen3.5-4b-local-cpu.jsonl`) [H].
- **[I]** gpt-oss-120b gratis en la UE rinde parecido a un modelo local pequeño en este banco. Confirma que las fechas deben calcularse con código y no dejárselas al modelo.
- Los resultados están en `apis-gratuitas-prueba/banco-ovh-anonimo-gpt-oss-120b.jsonl`; no he tocado `banco/resultados/`.

### 4.9 Scaleway Generative APIs (UE)
- **Free Tier:** «up to 1,000,000 tokens … 60 minutes of audio transcription» [H]. La página de alta habla de «every new customer», así que parece de **una sola vez** [H·s/I].
- **Requisitos:** hay que registrar un método de pago para tener los límites base [H].
- **Datos** [H, «Reviewed on October 03, 2025»]:
  - Proceso en **París (Francia)**, en un centro de datos de OPCORE.
  - «We do not collect, read, reuse, or analyze the content of your inputs, prompts, or outputs».
  - «Your data is not used for training».
  - Métricas agregadas y anónimas durante 6 meses.
- **Precios** (EUR por MTok) [H]: gemma-4-26b-a4b-it 0,25 / 0,50 (≈1,35 €/mes la base, ≈3,94 € la agéntica [I]); mistral-small-3.2 0,15 / 0,35 (≈0,83 € y ≈2,48 € [I]); qwen3.8-27b 0,60 / 3,30; deepseek-v4.1-flash 0,60 / 1,80.
- **[I]** Buen **respaldo de pago europeo**. El cupo gratuito solo da para probar.

### 4.10 Vercel AI Gateway
- **Gratis:** «Every Vercel team account gets access to both a free tier … The free tier includes a subset of models». El crédito es mensual («Monthly included credit»). Al comprar créditos, el gratuito desaparece [H, documentación del 8-9-2026]. La cifra de **5 USD cada 30 días** aparece en la documentación de precios según el buscador [H·s]; en la página que leí no la vi.
- **Qué modelos entran en el gratuito:** la API pública `/v1/models` no lo indica; solo se ve en el panel [H]. **[?]** Hay que confirmar si entran Claude Haiku 5.5 o GPT-6 Luna.
- **Privacidad por modelo** según la API (19-10-2026) [H]:
  - `anthropic/claude-haiku-5.5`: 0,10 / 0,50 USD, `no_training: all`, `zdr: all`, regiones `eu`, `us`, `jp`, `au`.
  - `openai/gpt-6-luna`: 0,10 / 0,50, `no_training: all`, región `eu`.
  - `google/gemini-3.5-flash-lite`: 0,30 / 2,50, `no_training: all`.
  - `zai/glm-4.7-flash`: **0,07 / 0,40, no gratis en Vercel**.
- Opción `disallowPromptTraining: true`, «available to all AI Gateway users at no extra charge». **ZDR solo en Pro y Enterprise** [H].
- **[I]** Si Haiku 5.5 entra en el gratuito, la carga agéntica (≈2,25 USD/mes) cabe en los 5 USD. Pero Vercel ve los prompts y su propia retención no la he comprobado [?].

### 4.11 Otros no chinos
- **Cerebras.** Ver § 2: prueba de 5 USD durante 30 días, con tarjeta. Límites de la prueba: 5 peticiones/min, 30.000 tokens/min sin caché y 1 M tokens/día [H]. Precios: gpt-oss-120b 0,35 / 0,75 USD (≈1,91 USD/mes la base y ≈5,63 la agéntica [I]); Qwen 3.8 27B 0,99 / 1,49 [H]. Política: «we do not retain inputs and outputs associated with our … inference … Services» [H, 27-8-2024].
- **SambaNova Cloud.** Free Tier de **20 peticiones/día** por modelo y 200.000 tokens/día [H]. Pero la página de planes dice «Add a payment method and purchase credits to run your first requests» [H]. Se contradice y, además, no da para 50 peticiones diarias [I].
- **NVIDIA build.nvidia.com.** Sus Trial Terms son el impedimento [H, PDF del 7-10-2025]:
  - Solo «for limited trial purposes only and without use … in production».
  - Prohíbe incluir «personal data (unless expressly permitted…)».
  - NVIDIA recoge «User Content and Generated Content to improve NVIDIA products and services, including AI models».
  - En la práctica, unas 40 peticiones/min, sin créditos [H·s, foros de NVIDIA].
  - **[I]** Solo para pruebas con datos inventados. Lo mismo vale para los Nemotron `:free` de OpenRouter servidos por «Nvidia» [?].
- **Cohere.** Las claves de prueba son gratis, pero están «limited to 1,000 API calls a month» y 20 peticiones/min por modelo, pensadas para probar y hacer prototipos [H]. No llegan.
- **Hugging Face.** Nada gratis sin PRO [H].
- **Together AI / Fireworks.** No hay gratuito documentado. Together: «By default, Together stores the prompts … and may use them for product improvements»; entrenar es opt-in [H]. Fireworks vende DeepSeek V4.1 Flash a 0,30 / 1,20 USD y tiene un modo «US-only» [H].
- **Nebius (Token Factory).** Unos 1 USD de prueba; los créditos del Builder Program caducan a los 90 días [H·s].
- **Chutes.** Pasó a suscripción [H·s].
- **Kluster.ai.** Cerró la inferencia el 24-7-2025 [H·s].
- **Google Vertex frente a AI Studio.** Vertex (ahora «Gemini Enterprise Agent Platform») tiene un express mode gratuito **90 días** sin facturación; con la facturación activada, se pierde [H]. También hay 300 USD de prueba durante 90 días en Google Cloud [H]. **[I]** Para 0 € permanentes, AI Studio sigue siendo la opción de Google (ver `modelos-api.md`), con su cláusula del EEE.
- **GitHub.** GitHub Models se retiró el 30-7-2026 (ver `modelos-api.md`). **[I]** Copilot no ofrece una API de inferencia para apps de terceros; usarlo así incumpliría sus términos [?].

### 4.12 OpenRouter `:free` hoy (19-10-2026)
Datos de `/api/v1/models` y `/endpoints` [H]:

| Modelo `:free` con `tools` | Quién lo sirve | Notas |
|---|---|---|
| `google/gemma-4-26b-a4b-it:free`, `gemma-4-31b-it:free` | Google AI Studio | Admite `tool_choice` completo. Disponibilidad en 1 día: 98,6 % y 97,0 % |
| `nvidia/nemotron-3-super-120b-a12b:free`, `-3-ultra-550b-a55b`, `-3.5-lightning`, `-3.5-super-vl`, `-3-nano-omni-30b` | Nvidia | Términos de NVIDIA: ver § 4.11 [I] |
| `minimax/minimax-m3.1-flash:free` | Minimax | Nuevo hoy. `tool_choice` solo `auto` |
| `xingchen-agi/xing4.0-29b-a4b:free` | Phala | `tool_choice` sin `required` |
| `cohere/north-mini-code:free` | Cohere | Orientado a programar |
| `poolside/laguna-s-2.1`, `laguna-xs-2.1`; `dots-studio/dots-3-note-preview`; `liquid/lfm-2.5-2.6b` | Poolside, AtlasCloud, Liquid | Los de Poolside, para programar; `dots-3-note`, en vista previa |
| `thinkingmachines/inkling`, `inkling-small` | — | Sin `tool_choice` |
| `openrouter/free` | Enrutador | Elige un modelo gratuito al azar [I] |

- **No hay ningún DeepSeek, Qwen, GLM ni Kimi gratuito** hoy [H].
- **[I]** Con Gemma 4 `:free`, el cliente de Google es OpenRouter (EE. UU.), no Pauta, así que la cláusula del EEE probablemente no protege estos datos. Se aplicarían las condiciones del plan gratuito, que permiten entrenar.
- Los límites siguen siendo los de `modelos-api.md`: 50 peticiones/día sin compra o 1.000/día tras comprar 10 USD [H 18-10].
- **Términos de OpenRouter:** prohíben «create multiple accounts as a single user, for purposes of bypassing or circumventing use limits» [H].

## 5. Los mejores candidatos a 0 € para Pauta

Ordenados para este caso. Junto los del documento anterior con los de este.

### A. Aceptables para correos personales

| # | Opción | Por qué | Base / agéntica gratis | Riesgos principales |
|---|---|---|---|---|
| 1 | **Cloudflare Workers AI · `gemma-4-26b-a4b-it`** (`modelos-api.md`) | No entrena ni guarda el contenido [H 18-10]. Ya encaja en la arquitectura | Sí / sí (≈1.770 y ≈5.450 neuronas al día de 10.000) [I] | Las 10.000 neuronas se comparten con whisper. No se sabe dónde procesa [?] |
| 2 | **OVHcloud AI Endpoints anónimo · `gpt-oss-120b`** (respaldo: `gpt-oss-20b`, `Qwen3.6-27B`) | UE (Francia), sin entrenamiento ni almacenamiento [H]; no hace falta cuenta | Sí / sí, espaciando unos 30 s o alternando modelos [I] | Sin contrato ni SLA. 2 peticiones/min **por IP** (malo desde Workers). OVH puede cambiarlo |
| 3 | **Gemini 3.5 Flash-Lite, plan gratuito de AI Studio** (`modelos-api.md`) | En el EEE se aplican las condiciones de pago: no entrena [H] | Sí / sí, si de verdad son 500 peticiones/día [H·s] | Límites no publicados. Cláusula «Paid Services» para apps en el EEE. Proceso fuera de la UE [I] |
| 4 | **Mistral Small 4 en Free mode, desactivando el entrenamiento** (`modelos-api.md`) | Empresa francesa, endpoint en la UE, entrenamiento desactivable [H 18-10] | [?]: los límites solo se ven en la consola | **Entrena por defecto**: hay que desactivarlo antes del primer correo |
| 5 | **Vercel AI Gateway (5 USD/mes) · Claude Haiku 5.5** | `no_training: all`, región `eu`, 0,10 / 0,50 [H]. Los 5 USD cubren la carga agéntica [I] | Sí / sí, **si** Haiku 5.5 está en el subconjunto gratuito [?] | Vercel ve los prompts. Sin ZDR en el plan gratuito. Límites no publicados |
| 6 | **Groq · `gpt-oss-120b`** (`modelos-api.md`) | El contrato le prohíbe entrenar [H 18-10] | Sí / **no**: 450.000 tokens > 200.000 al día [I] | EE. UU. Sin llamadas en paralelo |

### B. Solo para pruebas o datos no sensibles

| # | Opción | Por qué no sirve para correos | Uso razonable |
|---|---|---|---|
| 7 | **Z.ai · `glm-4.7-flash`** (gratis permanente) | Para la API, el DPA promete no guardar ni entrenar [H]. Pero la entidad es de Singapur con matriz china, la cláusula para «individual users» es ambigua y no hay representante en la UE [I] | Probar la calidad de GLM en español y tareas sin datos personales, como interpretar fechas sueltas. **Es la mejor opción china gratuita** [I] |
| 8 | **OpenRouter `:free`** (Gemma 4, Nemotron, MiniMax M3.1 Flash) | Cada proveedor tiene su política; NVIDIA y MiniMax pueden entrenar [H/H·s]. 50 peticiones/día sin pagar [H] | Probar modelos con el banco y datos inventados |
| — | Alibaba (90 días), Cerebras (30 días), Scaleway (1 M tokens), NVIDIA build | Créditos que caducan, o términos que prohíben datos personales (NVIDIA) | Medir la calidad antes de decidir un respaldo de pago |
| — | DeepSeek, Kimi, MiniMax directos; Baidu, Tencent, Volcengine | No son gratis, o sí lo son pero con verificación china, ley china o entrenamiento por defecto | No usar |

**[I] Respaldo de pago muy barato y europeo, por si los gratuitos fallan:** OVH con clave (gpt-oss-120b: ≈0,54 €/mes la base y ≈1,80 € la agéntica), Scaleway (mistral-small-3.2: ≈0,83 € y ≈2,48 €) y Alibaba Fráncfort «EU» (`qwen3.5-flash`: ≈0,63 USD y ≈2,03 USD).

## 6. Combinar varios gratuitos con respaldo (fallback)

**Cómo se haría [I/P]**
- **Una sola interfaz compatible con OpenAI.** Todos los candidatos del grupo A tienen un endpoint `…/v1/chat/completions` con `tools`: Cloudflare (`/ai/v1`), OVH, Gemini (vía su capa OpenAI), Mistral, Groq y Vercel [H en sus documentaciones; H para OVH, probado hoy]. El banco `banco/ejecutar.mjs` ya funciona así.
- **Enrutar según la sensibilidad, no solo según la disponibilidad.** Cada petición se marca como «con datos personales» o «sin datos personales». Con datos, solo puede ir al grupo A. Si todo el grupo A falla, se responde con un error claro («el asistente no está disponible ahora») en lugar de caer en un proveedor del grupo B [P].
- **Orden propuesto con datos** [P]: Cloudflare (gemma-4-26b) → OVH anónimo (gpt-oss-120b, y después gpt-oss-20b) → Gemini 3.5 Flash-Lite → Mistral Small 4 (con el entrenamiento desactivado). Cada uno lleva su contador de cuota (neuronas al día, peticiones por minuto) y una pausa de enfriamiento tras un 429.
- **Herramientas disponibles:**
  - **LiteLLM** (Python, versión 1.106.0 en PyPI, publicada el 18-10-2026 [H]). Su Router tiene «cooldowns, fallbacks, timeouts and retries» y reparte por `rpm`/`tpm` [H]. Pero necesita un servidor propio [I], que no encaja con un cliente web ni con Workers.
  - **OpenRouter** permite `models: [...]` como respaldo y, en `provider`, `data_collection: "deny"`, `zdr: true`, `only` y `allow_fallbacks` [H]. Sin embargo, con datos personales añade un intermediario en EE. UU. y sus `:free` no sirven para correos.
  - **[P] Lo más sencillo para Pauta:** un enrutador propio de unas decenas de líneas en el mismo código que ya llama al modelo. Una lista ordenada de `{url, modelo, sensible: true/false, límites}`, reintento con el siguiente ante 429 o 5xx, y registro local de qué proveedor respondió.
- **Normalizar las diferencias** [I]:
  - `tool_choice` no es igual en todos: Inkling no lo admite, MiniMax solo acepta `auto` [H].
  - gpt-oss no hace llamadas en paralelo en Groq [H 18-10].
  - Algunos modelos devuelven el razonamiento en `reasoning`.
  - Las fechas no siempre llegan en ISO: Mistral-Small-3.2 devolvió «2026-10-23T17:30:00 Europe/Madrid» [H, prueba].
  - La app debe validar los argumentos con un esquema y resolver ella misma las ambigüedades como «el jueves que viene». En la prueba, cada modelo eligió un día distinto [H].

**Riesgos [H/I]**
- **Términos contra la rotación de cuentas o cuotas:**
  - OpenRouter prohíbe «create multiple accounts as a single user, for purposes of bypassing or circumventing use limits» [H].
  - Google: «You agree to, and will not attempt to circumvent, such limitations» [H, Términos de las APIs de Google]. Crear varios proyectos para sumar cuotas gratuitas encaja ahí [I].
  - Alibaba: volver a registrarse no da cupo nuevo [H].
  - DeepSeek se reserva «prohibiting re-registration» [H].
  - Kimi aplica un «risk-control» que no se levanta [H].
  - **Usar varios proveedores distintos, cada uno con una sola cuenta y dentro de sus límites, no lo prohíbe ninguno de los términos que he leído** [I]. Rotar cuentas o claves del mismo proveedor sí estaría prohibido.
- **El respaldo multiplica las políticas de privacidad.** Cada proveedor más es otra política de datos que vigilar y otro sitio por donde pueden salir los correos [I]. Hay que documentar en `docs/DECISIONES.md` qué proveedores pueden recibir datos personales.
- **Inestabilidad de los gratuitos.** En el último año: GitHub Models retirado, Cerebras y Hugging Face sin gratuito, Kluster cerrado, Alibaba recortado a 90 días, Tencent migrando a TokenHub, OpenRouter cambiando sus `:free` a diario y MiniMax gratis solo de lanzamiento [H/H·s]. **[I]** Hay que dar por hecho que al menos uno de los gratuitos elegidos cambiará de condiciones en pocos meses.
- **Calidad desigual.** Si el respaldo cae en un modelo peor, la misma frase puede crear el evento en otro día. Cada modelo de la cadena debe pasar el banco (`banco/ejecutar.mjs`) antes de entrar [P].
- **Límites por IP o compartidos:** OVH anónimo cuenta por IP, y Cloudflare reparte sus neuronas entre todos los usos de la cuenta [H]. Si se ejecuta en Workers, conviene medirlo [I].

## 7. Pendientes
- [?] Ver en la consola de Z.ai los límites reales de GLM-4.7-Flash (concurrencia, tope diario) y si la cuenta personal cuenta como «developer» o como «individual user». Requiere crear una cuenta: no lo he hecho.
- [?] Ver en el panel de Vercel qué modelos entran en el crédito gratuito y la retención propia de Vercel.
- [?] Comprobar si OVH anónimo funciona y con qué límite desde la IP de salida de Cloudflare Workers, si se elige esa arquitectura.
- [?] Leer los documentos legales de MiniMax (se montan con JavaScript; aquí solo tengo fuentes secundarias).
- [P] Pasar el banco a GLM-4.7-Flash (Z.ai) y a gemma-4-26b (Cloudflare) para comparar con gpt-oss-120b en OVH.

## 8. Fuentes (consultadas el 19-10-2026)
**Primarias**
- Z.ai: https://docs.z.ai/guides/overview/pricing · https://docs.z.ai/guides/llm/glm-4.7 · https://docs.z.ai/guides/vlm/glm-5.3-flash · https://docs.z.ai/help/faq · https://docs.z.ai/legal-agreement/privacy-policy (29-9-2025, con el DPA de la API) · https://docs.z.ai/legal-agreement/terms-of-use (14-4-2026) · https://docs.z.ai/llms.txt
- BigModel: https://docs.bigmodel.cn/cn/api/rate-limit · https://docs.bigmodel.cn/cn/guide/platform/equity-explain · https://docs.bigmodel.cn/cn/guide/models/free/glm-4.7-flash
- DeepSeek: https://api-docs.deepseek.com/quick_start/pricing · https://api-docs.deepseek.com/quick_start/rate_limit · https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html (10-2-2026) · https://cdn.deepseek.com/policies/en-US/deepseek-terms-of-use.html (27-3-2026) · https://cdn.deepseek.com/policies/en-US/deepseek-open-platform-terms-of-service.html (en vigor desde el 29-4-2026)
- Kimi: https://platform.kimi.ai/docs/pricing/chat · https://platform.kimi.ai/docs/pricing/limits · https://platform.kimi.ai/docs/agreement/modeluse (30-7-2026) · https://platform.kimi.ai/docs/agreement/userprivacy (30-4-2025)
- MiniMax: https://platform.minimax.io/docs/pricing/overview · https://platform.minimax.io/docs/guides/rate-limits
- Alibaba: https://www.alibabacloud.com/help/en/model-studio/new-free-quota (16-10-2026) · …/model-pricing (19-10-2026) · …/rate-limit (19-10-2026) · …/regions (13-10-2026) · …/data-retention-policy (11-10-2026) · …/models (11-10-2026)
- SiliconFlow: https://www.siliconflow.com/pricing · https://docs.siliconflow.com/en/legals/terms-of-service (9-9-2026) · https://docs.siliconflow.com/en/legals/privacy-policy (9-9-2026) · https://docs.siliconflow.com/en/userguide/rate-limits/rate-limit-and-upgradation
- Tencent: https://cloud.tencent.com/document/product/1729/97731 (26-6-2026)
- OVHcloud: https://docs.ovhcloud.com/en/guides/public-cloud/ai-machine-learning/ai-endpoints-capabilities (3-2-2026) · https://www.ovhcloud.com/en/public-cloud/ai-endpoints/ · https://endpoints.ai.cloud.ovh.net/ · https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/models
- Scaleway: https://www.scaleway.com/en/pricing/model-as-a-service/ · https://www.scaleway.com/en/docs/generative-apis/faq/ · …/reference-content/data-privacy/ (3-10-2025) · …/reference-content/rate-limits/ (24-4-2026)
- Vercel: https://vercel.com/docs/ai-gateway/pricing (8-9-2026) · https://vercel.com/docs/ai-gateway/rate-limits · …/security-and-compliance/disallow-prompt-training · …/security-and-compliance/zero-data-retention · https://ai-gateway.vercel.sh/v1/models
- Cerebras: https://inference-docs.cerebras.ai/support/rate-limits · https://inference-docs.cerebras.ai/support/pricing · https://www.cerebras.ai/privacy-policy (27-8-2024)
- SambaNova: https://docs.sambanova.ai/docs/en/models/rate-limits · https://cloud.sambanova.ai/plans
- NVIDIA: https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf (7-10-2025)
- Hugging Face: https://huggingface.co/docs/inference-providers/pricing
- Cohere: https://docs.cohere.com/docs/rate-limits · https://docs.cohere.com/docs/how-does-cohere-pricing-work
- Together: https://docs.together.ai/docs/privacy-and-security · Fireworks: https://docs.fireworks.ai/serverless/pricing
- Google: https://cloud.google.com/vertex-ai/generative-ai/docs/start/express-mode/overview (19-10-2026) · https://cloud.google.com/free/docs/free-cloud-features · https://ai.google.dev/gemini-api/terms (28-4-2026) · https://developers.google.com/terms
- OpenRouter: https://openrouter.ai/api/v1/models · https://openrouter.ai/api/v1/models/{modelo}/endpoints · https://openrouter.ai/terms · https://openrouter.ai/docs/guides/routing/provider-selection · https://openrouter.ai/docs/guides/routing/model-fallbacks
- LiteLLM: https://docs.litellm.ai/docs/routing · https://pypi.org/pypi/litellm/json

**Secundarias (solo para contrastar)**
- Concurrencia de GLM-4.7-Flash: https://toolnavs.com/en/article/1100-zai-released-glm-47-flash-weights-and-api-free-tier-1-concurrency-and-launched-f
- MiniMax, datos: https://minimax-ai.chat/privacy-security/ · https://standardcompute.com/providers/minimax
- DeepSeek en la UE: https://vinciworks.com/blog/germany-moves-to-block-deepseek-will-the-rest-of-the-eu-follow/ · https://www.trio.so/blog/italy-blocks-deepseek/
- Kimi (contraste): https://wavect.io/blog/kimi-k3-eu-api-production-review/
- SiliconFlow .cn: https://yangmao.ai/en/providers/siliconflow/free-tier/
- Baidu, Tencent, Volcengine: https://yangmao.ai/zh/deals/baidu-qianfan-free-api/ · https://yangmao.ai/zh/providers/hunyuan/free-tier/ · https://yangmao.ai/en/deals/volcengine-doubao-free-tokens/ · https://cloud.baidu.com/doc/qianfan-docs/s/Jm8r1826a
- NVIDIA (límites): https://forums.developer.nvidia.com/t/api-credits-for-build-nvidia-com/306633 · https://github.com/steipete/CodexBar/issues/2498
- Scaleway (una sola vez): https://www.scaleway.com/en/generative-apis-signup/
- Vercel (5 USD): https://vercel.com/academy/ai-gateway/use-ai-credits
- Nebius: https://nebius.com/builders-terms-and-conditions · Chutes: https://expertbeacon.com/chutes-ai-review-your-complete-guide-to-decentralized-ai-computing/ · Kluster: https://agentdeals.dev/digest/2025-w30
