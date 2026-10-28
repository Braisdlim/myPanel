# Búsqueda semántica local en el navegador (28-10-2026)

Pregunta: Pauta es una web estática (Astro 7 + Svelte 5, Vite) que corre en el navegador de escritorio y en el Honor 600 Pro (Chrome), con los datos en IndexedDB. ¿Cómo hacer búsqueda semántica en español sobre unos pocos miles de fragmentos cortos (eventos, tareas, notas) **en el propio dispositivo, sin servidor y gratis**?

Complementa, sin repetir, `research/rag/arquitectura.md` (por qué híbrido BM25 + vectores) y `research/rag/modelos-y-claves.md` (LLM y claves). El Honor 600 Pro lleva Snapdragon 8 Elite y 12 GB de RAM (`research/asistente-ia/modelos-locales.md`).

Etiquetas: **[H]** fuente primaria leída hoy o prueba propia · **[H·s]** fuente secundaria o afirmación del propio fabricante sin verificar · **[I]** inferencia o cálculo propio · **[P]** propuesta · **[?]** sin comprobar.

**Método.** `npm view` para versiones y fechas; API y fichas de Hugging Face leídas con `curl` (huggingface.co **sí** era accesible desde esta sesión); código fuente del paquete instalado; prueba ejecutable en Node (`prueba-embeddings/`). GitHub (API de releases de transformers.js) **no** estaba habilitado para esta sesión, así que las fechas de versión salen de npm. No se ha medido nada en el móvil ni en un navegador real: los tiempos son de Node en un contenedor de 4 núcleos.

---

## 0. Resumen

1. **Transformers.js 4.3.2** (npm, 27-10-2026) corre en el navegador con WASM (por defecto) o WebGPU, en un Web Worker, y guarda modelo y WASM en la Cache API. [H]
2. **Modelo recomendado para el móvil: `Xenova/multilingual-e5-small` en q8** (118 MB, 384 dimensiones, MIT, prefijos `query: ` / `passage: `). Acertó el primer resultado en las 5 consultas de la prueba y tarda unos 13 ms por frase en CPU. [H prueba] **Alternativa de más calidad**: `onnx-community/embeddinggemma-300m-ONNX` en q4 (197 MB, 768 dimensiones recortables, licencia Gemma), unas 4 veces más lenta. [H prueba]
3. **No hace falta librería de índice vectorial**: coseno por fuerza bruta en un `Float32Array` tarda unos 8-13 ms con 10.000 vectores de 384 dimensiones (Node, CPU). Orama, de hecho, hace también fuerza bruta. [H prueba, H código]
4. **BM25 propio** (unas 40 líneas) con el stemmer Snowball español. Snowball genera JavaScript oficialmente; `@orama/stemmers` lo trae ya compilado. [H]
5. Fusión con **RRF** (Reciprocal Rank Fusion: suma de 1/(60 + puesto) de cada lista): BM25 cubre las palabras exactas y la semántica cubre los sinónimos («tocar música» → «ensayo con la banda»). [H prueba]

---

## 1. Transformers.js (`@huggingface/transformers`)

| Dato | Valor | Fuente |
|---|---|---|
| Versión actual | **4.3.2**, publicada el 27-10-2026. Antes: 4.3.1 (06-10), 4.3.0 (16-09), 4.0.0 (30-03-2026) | [H] `npm view @huggingface/transformers time`, 28-10-2026 |
| Dependencias | `onnxruntime-web` 1.31.0-dev.20260914, `onnxruntime-node` 1.30.0, `@huggingface/tokenizers` ^0.2.0, `@huggingface/jinja`, `sharp` | [H] `npm view … dependencies` |
| Backend por defecto en el navegador | CPU vía **WASM**; con `device: 'webgpu'` usa la GPU. `dtype` por defecto: `q8` en WASM y `fp32` en WebGPU | [H] README del paquete 4.3.2 |
| WebGPU | La guía oficial dice «As of March 2026, global WebGPU support is around 85% (caniuse)»; marca la API como experimental en muchos navegadores | [H] huggingface.co/docs/transformers.js/guides/webgpu (leída el 28-10-2026; es la doc de *main*) |
| Web Worker | El código detecta `IS_WEBWORKER_ENV` y funciona en Workers; desactiva el `proxy` de ORT (`ONNX_ENV.wasm.proxy = false`), así que **el Worker lo pone la app** | [H] `dist/transformers.web.js` |
| Caché del modelo | `env.useBrowserCache` (activo si existe la Cache API) guarda los ficheros en `caches.open('transformers-cache')`. También hay `useCustomCache`/`customCache` y `experimental_useCrossOriginStorage` | [H] `dist/transformers.web.js`, objeto `env` |
| Caché del WASM | `env.useWasmCache` guarda también el binario de ONNX Runtime | [H] mismo fichero |
| De dónde baja el WASM | Si la app no fija `env.backends.onnx.wasm.wasmPaths`, lo pide a **cdn.jsdelivr.net** (`onnxruntime-web@<versión>/dist/ort-wasm-simd-threaded.asyncify.wasm`) | [H] mismo fichero, líneas ~8735-8745 |
| Modelos | Por defecto de `https://huggingface.co/{model}/resolve/{revision}/`; en el navegador `allowLocalModels` es `false` salvo que se active | [H] objeto `env` |

**Tamaño de descarga** (sin contar el modelo):
- `transformers.web.min.js`: 456 KB sin comprimir. [H] `ls` del paquete
- `ort-wasm-simd-threaded.asyncify.wasm`: 26,9 MB sin comprimir, 6,6 MB con gzip -9; jsDelivr lo sirve con Brotli y `content-length: 5547312` (5,5 MB). [H] `ls`, `gzip`, `curl -I` el 28-10-2026
- La variante `.jsep.wasm` (28,4 MB) existe en el paquete, pero el código elige `.asyncify` salvo en Safari < 26 sin WebGPU. [H]

**Consecuencias para Pauta** [I]:
- Para que funcione sin conexión y no dependa de jsDelivr, conviene servir el WASM y el modelo desde la propia web (fijar `wasmPaths`, `env.remoteHost` o `allowLocalModels` + `localModelPath`). Los ficheros de 98-197 MB **no caben en GitHub Pages como fichero del repositorio** (límite de 100 MB por fichero de GitHub [H·s]); lo práctico es bajarlos de Hugging Face la primera vez y dejar que la Cache API los guarde.
- La Cache API puede vaciarse si el navegador anda corto de espacio; `navigator.storage.persist()` lo reduce. [H·s MDN] La app debe tolerar volver a descargar.
- Hacer la carga y el cálculo en un **Worker dedicado**, con progreso visible (el `pipeline` acepta `progress_callback` [H·s doc]).

## 2. Modelos de embeddings multilingües

Todos los tamaños son de la API de Hugging Face (`/api/models/<id>?blobs=true`, 28-10-2026). [H]

| Modelo (repo ONNX) | Base, licencia | Dim. | Contexto | Tamaño q8 / q4 | Prefijos | Calidad publicada |
|---|---|---|---|---|---|---|
| `Xenova/multilingual-e5-small` | `intfloat/multilingual-e5-small`, **MIT** [H] | 384 | 512 tokens [H ficha] | **118 MB** / q4 399 MB (el q4 es mayor: no cuantiza la tabla de embeddings) [H] | **Obligatorios**: `query: ` y `passage: ` [H ficha] | STS17 es-es 84,8; STS22 es 66,9; MassiveIntent es 66,3 [H model-index]. MTEB ML Retrieval 50,9 según IBM [H·s] |
| `Xenova/paraphrase-multilingual-MiniLM-L12-v2` | sentence-transformers, **Apache-2.0** [H] | 384 | **128** tokens (`max_seq_length`) [H ficha] | 118 MB / 399 MB [H] | No | Sin MTEB en la ficha. Pensado para paráfrasis y similitud, no para consulta→documento [I] |
| `onnx-community/embeddinggemma-300m-ONNX` | `google/embeddinggemma-300m`, **licencia Gemma**; el repo de Google pide aceptar condiciones; el ONNX no [H API `gated`] | 768 (Matryoshka 512/256/128) [H] | 2 K [H·s] | 309 MB / **197 MB** (q4f16 175 MB). **No admite fp16** [H ficha] | `task: search result \| query: ` y `title: none \| text: ` [H ficha] | **MTEB Multilingual v2: 61,15** (768 d), 59,68 (256 d); en Q4_0: 60,62 [H ficha] |
| `onnx-community/granite-embedding-97m-multilingual-r2-ONNX` | IBM, **Apache-2.0**, publicado el 29-04-2026 [H ficha]; ONNX subido el 21-06-2026 [H API] | 384 | 32 K [H] | **98 MB** / 295 MB [H] | No (`prompts` vacíos) [H config_sentence_transformers.json] | **MTEB ML Retrieval (18): 60,3** según IBM [H ficha] |
| `onnx-community/gte-multilingual-base` | Alibaba, Apache-2.0 [H] | 768 | 8 K [H·s] | 340 MB / 873 MB [H] | No | STS17 es-es 87,0; STS22 es 72,0 [H model-index]. Demasiado grande para el móvil [I] |
| `Xenova/multilingual-e5-base` | MIT | 768 | 512 | 279 MB [H] | Sí | — |
| `onnx-community/Qwen3-Embedding-0.6B-ONNX` | — | — | — | 614 MB / 914 MB [H] | — | Descartado por tamaño [I] |

**Prueba propia** (20 frases inventadas de agenda, 5 consultas; `prueba-embeddings/resultado.txt`) [H]:

| Modelo | Aciertos en el 1.º puesto (de 5) | Embeber 20 frases (Node, 4 núcleos, CPU) | Observación |
|---|---|---|---|
| e5-small q8 | **5** | 258 ms | Puntuaciones apiñadas (0,82-0,86): la ficha avisa de que el coseno se reparte entre 0,7 y 1,0 y que lo que cuenta es el orden. [H ficha] No sirve un umbral fijo. |
| embeddinggemma q4 | **5** | 1.012 ms | La mejor separación entre el acierto y el resto. |
| paraphrase-MiniLM q8 | 4 (en «odontólogo», dentista y médico casi empatan: 0,433 frente a 0,434) | **69 ms** | El más rápido. |
| granite-97m-r2 q8 | 3 (falla «tocar música» y «viajes en avión») | 159-232 ms | Igual en fp32 y con el ONNX oficial de IBM; el mismo resultado sale con onnxruntime de Python, así que **no es un fallo de Transformers.js** [H]. No se ha comprobado con los pesos PyTorch [?]. Con 20 frases no se puede generalizar: puede que vaya peor con textos muy cortos [I]. Su fp16 no carga (error de tipos en `rotary_emb`) [H]. |

**Recomendación para el móvil** [P]: **multilingual-e5-small q8**.
- Es el más ligero de los que acertaron todo (118 MB), tiene licencia MIT sin condiciones y 384 dimensiones (1,5 KB por vector en fp32).
- Coste estimado de indexar 3.000 fragmentos: unos 40 s en este contenedor [I: 13 ms × 3.000]. En el móvil puede tardar varias veces más [?]: hay que hacerlo **una vez, en segundo plano, de forma incremental** y guardar los vectores en IndexedDB.
- Con fragmentos cortos no se acerca al límite de 512 tokens.
- **Plan B de calidad**: embeddinggemma q4 en escritorio o con WebGPU (197 MB, 768 d recortable a 256 d con poca pérdida: 59,68 frente a 61,15).
- **Reevaluar granite-97m-r2** con el banco de preguntas real (`arquitectura.md`): en el papel es el mejor de su tamaño.
- Si se cambia de modelo, hay que **reindexar todo**: guardar con cada vector el id del modelo y el dtype. [I]

## 3. Índice vectorial

| Opción | Estado | Comentario |
|---|---|---|
| Fuerza bruta con `Float32Array` | — | Medido [H prueba, `fuerza-bruta.mjs`]: 384 d → 0,6-0,7 ms (1.000), ~4 ms (5.000), 8-13 ms (10.000; 15 MB). 768 d → 1,2-1,5 ms (1.000), 7-8 ms (5.000), 14-15 ms (10.000; 31 MB). |
| `@orama/orama` 3.1.18 (19-12-2025, Apache-2.0) | Mantenido [H npm] | Su búsqueda vectorial es **fuerza bruta** (`findSimilarVectors` recorre todos los vectores; umbral por defecto 0,8, que con e5 lo deja pasar casi todo) [H código `trees/vector.js`]. Trae BM25, stemmers y búsqueda híbrida [H·s docs, las páginas se cargan con JS]. |
| `voy-search` 0.6.3 | Último paquete el 20-09-2023 [H npm] | Parado. |
| `hnswlib-wasm` 0.8.2 | Último paquete el 08-07-2023 [H npm] | Parado; HNSW (un índice aproximado por grafo) solo compensa con cientos de miles de vectores [I]. |
| `sqlite-vec` 0.1.10-alpha.4 (18-05-2026) | Alfa [H npm] | Exige SQLite WASM y OPFS; Pauta ya eligió IndexedDB (`research/app-v1/notas.md`). Sobra [I]. |

**Conclusión** [I]: con menos de 10.000 vectores **basta la fuerza bruta**. Una consulta cuesta milisegundos frente a los 10-50 ms de embeber la propia consulta. Propuesta [P]:
- Un único `Float32Array` (n × 384) en memoria, construido al arrancar desde IndexedDB, con vectores normalizados: el coseno es el producto escalar.
- Filtrar antes por fecha o sector (router temporal de `arquitectura.md`), que reduce aún más n.
- En el móvil puede ser 2-5 veces más lento que en el contenedor [?], pero sigue por debajo de 100 ms.

## 4. BM25 en español

| Opción | Estado | Comentario |
|---|---|---|
| **Propio** (~40 líneas, `bm25.mjs`) | — | k1 = 1,2, b = 0,75; minúsculas, partir por no-letras, palabras vacías, stemmer y, después, quitar tildes. [H prueba] |
| `minisearch` 7.2.0 (16-09-2025, MIT) | Mantenido [H npm] | Búsqueda de texto completo con prefijos y difusa; admite `processTerm` para meter el stemmer [H·s doc]. |
| `@orama/orama` + `@orama/stemmers` 3.1.18 | Mantenido [H npm] | `@orama/stemmers/spanish` es código Snowball compilado (estructura de *among*/cursor) [H código]. Se puede usar solo el stemmer. |
| `wink-bm25-text-search` 3.1.2 | Último paquete el 21-11-2022 [H npm] | Parado. |
| `lunr` 2.3.9 + `lunr-languages` 1.23.0 | lunr parado desde 2020; lunr-languages actualizado el 17-10-2026, licencia **MPL-1.1** [H npm] | Evitar. |
| `snowball-stemmers` 0.6.0 | Último paquete el 01-02-2016 [H npm] | Parado. |
| `snowball-stemmers-js` 3.1.2 (13-08-2026, BSD-3) | Reempaquetado por un tercero (QQSHI13) [H npm] | Poca trayectoria [I]. |
| **Snowball oficial** | 3.2.0 (17-10-2026); el compilador genera JavaScript [H snowballstem.org y NEWS] | Se puede generar `spanish` y copiarlo al repo (BSD) [P]. |

Ejemplo real del stemmer: «Revisar las facturas pagadas y las citas médicas» → `revis factur pag cit medic`. [H prueba]

**Detalles de normalización** [I]:
- El Snowball español espera las tildes: hay que aplicar la raíz primero y quitar los diacríticos después, para que «canción» y «cancion» coincidan.
- Al quitar diacríticos, la ñ pasa a n («año» = «ano»). En una agenda es aceptable.
- Conviene añadir sinónimos propios mínimos (p. ej. «dentista» y «odontólogo») solo si el banco de preguntas lo pide: la parte semántica ya los cubre.

**Prueba híbrida** [H, `resultado.txt` §5]:
- BM25 acierta «dentista», «pagar facturas» y «citas», pero no devuelve **nada** en «tocar música» ni en «viajes en avión».
- La semántica (e5-small) sí las resuelve.
- RRF mantiene los aciertos de las dos.

## 5. Prueba ejecutable (`research/rag/prueba-embeddings/`)

- `prueba.mjs`: carga los 4 modelos con Transformers.js 4.3.2 en Node, embebe 20 frases y 5 consultas, imprime el top-3 y los tiempos. `DTYPE=fp32 node prueba.mjs <modelo>` fuerza el tipo.
- `fuerza-bruta.mjs`: medida del coseno con 1.000, 5.000 y 10.000 vectores.
- `bm25.mjs`: BM25 propio + `@orama/stemmers/spanish` + RRF con e5-small.
- `resultado.txt`: salida completa.

Para repetirla:

```
npm install
NODE_USE_ENV_PROXY=1 node prueba.mjs
```

`NODE_USE_ENV_PROXY=1` solo hace falta detrás de un proxy, como en esta sesión: el `fetch` de Node no lee `HTTPS_PROXY`. Sin él, todas las descargas fallaron con «fetch failed».

Los modelos se guardan en `.cache-modelos/` y las dependencias en `node_modules/` (unos 745 MB, sobre todo `onnxruntime-node`). Las dos carpetas están en `.gitignore`.

Primera carga con descarga desde huggingface.co: 2,6-4,0 s por modelo. Desde la caché de disco: 1,4 s o menos. [H]

## 6. Pendientes

- Medir en el **Honor 600 Pro** (Chrome) y en el escritorio, en un Worker, con WASM y con WebGPU: tiempo de carga desde la Cache API, ms por fragmento y memoria. [?]
- Comprobar si WebGPU está activo en Chrome del Honor 600 Pro (MagicOS 10). [?]
- Evaluar e5-small, embeddinggemma y granite-r2 con el banco de 40-60 preguntas reales (recall@k, MRR). La prueba de 20 frases solo orienta.
- Decidir si el modelo se baja de huggingface.co la primera vez (depende de su disponibilidad y CORS) o se aloja en otro sitio. [P]

## Fuentes (consultadas el 28-10-2026)

- npm: `npm view` de `@huggingface/transformers`, `@orama/orama`, `@orama/stemmers`, `minisearch`, `voy-search`, `hnswlib-wasm`, `sqlite-vec`, `wink-bm25-text-search`, `lunr`, `lunr-languages`, `snowball-stemmers`, `snowball-stemmers-js`, `natural`, `flexsearch`.
- Código de `@huggingface/transformers` 4.3.2 (`dist/transformers.web.js`, README) y de `@orama/orama` 3.1.18 (`dist/esm/trees/vector.js`).
- https://huggingface.co/docs/transformers.js/guides/webgpu
- https://huggingface.co/intfloat/multilingual-e5-small (ficha, FAQ y model-index) · https://huggingface.co/Xenova/multilingual-e5-small
- https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX
- https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2 (ficha, `modules.json`, `1_Pooling/config.json`, `config_sentence_transformers.json`) · https://huggingface.co/onnx-community/granite-embedding-97m-multilingual-r2-ONNX
- https://huggingface.co/Alibaba-NLP/gte-multilingual-base (model-index)
- API de Hugging Face `https://huggingface.co/api/models/<id>?blobs=true` para tamaños, licencias y fechas.
- https://snowballstem.org/ y https://raw.githubusercontent.com/snowballstem/snowball/master/NEWS (Snowball 3.2.0, 17-10-2026).
- `curl -I` a cdn.jsdelivr.net para el tamaño Brotli del WASM.
