# RAG sobre «tu vida» en Pauta: estado del arte y arquitectura propuesta

Fecha: 28-10-2026. Investigación previa a construir (no hay código todavía).
Etiquetas: [H] comprobado en fuente primaria · [H·s] fuente secundaria o resumen de buscador · [I] inferencia · [P] propuesta · [?] incierto.
No repite lo ya investigado en `research/asistente-ia/` (modelos, cuotas, permisos de Gmail/Drive, voz, regla de dos, Action-Selector) ni en `docs/producto/11-asistente-ia.md`; lo cita cuando hace falta.

**Límite de esta investigación** [H]: desde esta sesión no se pudieron abrir arxiv.org, huggingface.co, docs.ragas.io, genai.owasp.org, docs.khoj.dev, platform.openai.com, developers.cloudflare.com ni research.trychroma.com (DNS bloqueado por la red de la sesión). Lo que viene de esas fuentes está marcado [H·s] (resumen del buscador) y conviene releerlo cuando se permitan esos dominios. Sí se leyeron directamente: anthropic.com, platform.claude.com, github.com, raw.githubusercontent.com, npm y PyPI.

---

## 0. Resumen en cinco líneas
1. Lo que más evidencia tiene, con diferencia: **búsqueda híbrida (BM25 + vectores) fusionada**, **contexto añadido a cada fragmento** y **reordenación**; BM25 solo ya es una línea base dura.
2. Para la agenda, **las preguntas temporales se resuelven con filtros estructurados antes que con vectores**: se extrae el rango de fechas de la pregunta y se filtra.
3. Recuperación se evalúa sin LLM (recall@k, MRR, nDCG) con un banco propio de 40–60 preguntas; la generación necesita juez o revisión humana, salvo la verificación de citas, que es código.
4. La inyección indirecta no tiene prevención fiable (OWASP LLM01:2026): la defensa es de arquitectura (sin herramientas de escritura, contenido marcado, citas verificadas, sin enlaces activos).
5. Para Pauta: índice en el navegador (Orama o propio sobre IndexedDB) + embeddings locales con Transformers.js + router temporal con el analizador de fechas existente + LLM opcional que solo ve los fragmentos recuperados.

---

## 1. Qué hacen la comunidad y los expertos (2026)

### 1.1 Proyectos «second brain» reales
| Proyecto | Estado comprobado | Cómo recupera | Lección para Pauta |
|---|---|---|---|
| **Khoj** (github.com/khoj-ai/khoj) | 37,9 k estrellas, AGPL-3.0, autoalojable [H GitHub, 28-10-2026]. Su nube app.khoj.dev se habría cerrado el 15-4-2026 [H·s promptquorum, everydev; el README aún la anuncia → ?] | «Búsqueda semántica» sobre notas, PDF, Notion; clientes web, Obsidian, Emacs [H README] | Un servicio en la nube de un «second brain» es frágil; lo local sobrevive al producto [I] |
| **Reor** (github.com/reorproject/reor) | **Archivado el 7-3-2026**, 8,5 k estrellas [H GitHub] | Trocea y vectoriza cada nota en LanceDB; embeddings locales con Transformers.js; LLM con Ollama [H README] | Misma pila que proponemos (Transformers.js en local); el abandono muestra el coste de mantener una app entera de notas [I] |
| **Smart Connections** (Obsidian) | Licencia «Smart Plugins License», *source available* (ya no GPL) [H README]. Modelo de embeddings local incluido, sin clave [H README]; sería bge-micro-v2, 384 dimensiones [H·s blogs] | Solo semántica; el propio README avisa de que **una nota que contiene el texto exacto de la búsqueda puede no aparecer** [H README] | Argumento directo para la búsqueda híbrida: sin BM25 fallan nombres propios y palabras exactas |
| **AnythingLLM** (Mintplex-Labs) | 67,7 k estrellas, MIT; LanceDB y un *embedder* nativo por defecto; **citas a la fuente** en el chat [H README] | Vectores; el README no menciona reordenación [H] | Citas visibles como requisito mínimo de producto |

[I] Patrón común: todos indexan **en local** (LanceDB, archivos), usan un modelo de embeddings pequeño (≈ 20–300 M parámetros) y dejan el LLM como pieza intercambiable (Ollama o API compatible con OpenAI). Ninguno de los revisados trata las fechas como dato de primera clase: es el hueco que Pauta puede ocupar.

### 1.2 Guías de laboratorios y técnicas con evidencia
- **Contextual Retrieval (Anthropic, 19-9-2024)** [H anthropic.com/news/contextual-retrieval]:
  - Fallo de recuperación (1 − recall@20, media de varios corpus, embeddings Gemini Text 004): base 5,7 % → *contextual embeddings* 3,7 % (−35 %) → + *contextual BM25* 2,9 % (−49 %) → + reordenación (Cohere, de 150 candidatos a 20) 1,9 % (−67 %).
  - El «contexto» son 50–100 tokens generados por un LLM por fragmento y antepuestos antes de vectorizar e indexar en BM25. Fragmentos de «unos cientos de tokens»; top-20 fue lo mejor de 5/10/20.
  - Si toda la base cabe en **< 200 000 tokens**, recomiendan meterla entera en el *prompt* sin RAG.
  - [I] Las cifras son reducciones **relativas** de un único métrico (¿está el fragmento dorado en el top-20?), medidas en inglés y con modelos de pago. La tendencia es lo transferible, no el número.
- **RRF, fusión por rango recíproco** (Cormack, Clarke y Büttcher, SIGIR 2009) [H·s ir.webis.de, plg.uwaterloo.ca]: `puntuación = Σ 1/(k + rango)`, mejor que cada sistema por separado y que Condorcet. k = 60 es la constante habitual [H·s docs de Apache Doris y PyTerrier]. Ventaja práctica [I]: no hay que calibrar escalas entre BM25 y coseno.
- **BEIR** (Thakur et al., NeurIPS 2021) [H·s arXiv 2104.08663]: BM25 es una línea base fuerte en recuperación *zero-shot*; los modelos densos pueden quedar por debajo fuera de su dominio; reordenadores y *late interaction* dan lo mejor de media, con alto coste.
- **OpenAI file_search** [H·s foro de OpenAI y SDK]: por defecto fragmentos de 800 tokens con 400 de solapamiento, máximo 20 fragmentos al contexto. No se pudo confirmar en la documentación oficial si es híbrido ni qué hace el *ranker* «auto» [?].
- **Troceado (Chroma, 3-7-2024)** [H·s research.trychroma.com/evaluating-chunking]: introduce recall/precisión/IoU a nivel de token; `RecursiveCharacterTextSplitter` bien parametrizado funciona bien y **algunos valores por defecto populares rinden mal**. Las cifras concretas solo se vieron en blogs secundarios [?].
- **Filtros por metadatos inferidos por el LLM** (LlamaIndex *auto-retrieval*) [H·s developers.llamaindex.ai]: el LLM recibe la descripción de los campos y devuelve `{filtros, consulta}`; p. ej. `{'country': 'United States'}` + «celebrities».
- **Embeddings multilingües que caben en el navegador**:
  - `EmbeddingGemma-300m` (Google, 4-9-2025): 308 M, 2 K tokens de contexto, 768 dimensiones recortables a 512/256/128 (Matryoshka), versión ONNX con ejemplo para Transformers.js; **no admite fp16**, usar fp32, q8 o q4 [H·s ficha de onnx-community]. También está en Workers AI [H·s].
  - `multilingual-e5-small` (≈ 118 M, 384 dim.): versión Xenova para Transformers.js; exige prefijos `query: ` y `passage: ` [H·s ficha]. MIRACL-es nDCG@10 = 50,8 según el informe de Granite Embedding [H·s arXiv 2502.20204].
  - `@huggingface/transformers` 4.3.2 publicado el 27-10-2026 [H npm].
- **Reordenador gratuito**: `@cf/baai/bge-reranker-base` en Workers AI, 0,003 USD por millón de tokens de entrada [H·s página de precios de Cloudflare]. [?] Es un modelo entrenado sobre todo en inglés y chino; su calidad en español está sin medir.

**Qué tiene más evidencia** [I, a partir de lo anterior]: (1) híbrido BM25 + vectores con RRF — evidencia repetida en BEIR, Anthropic y la práctica de Shortwave/Copilot (`arquitectura-y-permisos.md`); (2) reordenación — mejora consistente pero con coste; (3) contexto por fragmento — buena evidencia de un único laboratorio; (4) tamaño de fragmento — depende del corpus, hay que medirlo. Las técnicas «agénticas» (varias búsquedas, reformular) tienen sobre todo evidencia de producto, no de banco público.

---

## 2. RAG sobre datos con fechas (agenda)
- **LongMemEval** (Wu et al., ICLR 2025) [H·s arXiv 2410.10813, diapositivas ICLR]: 500 preguntas sobre memoria a largo plazo de un asistente, con cinco capacidades: extracción, razonamiento entre sesiones, **razonamiento temporal**, actualización de conocimiento y **abstención** («no lo sé»). Propone indexar cada recuerdo también por la fecha de los hechos y, en la consulta, que un LLM **extraiga un rango temporal y filtre** antes de buscar: +6,8 a +11,3 % de recall en preguntas temporales con un LLM fuerte; **Llama 3.1 8B extrae mal los rangos** (alucina o se salta pistas temporales).
- **TempRAGEval / MRAG** (arXiv 2412.15540) [H·s]: todos los recuperadores probados fallan en preguntas con razonamiento temporal.
- **DeFuzzRAG** (AAAI, según el buscador) [H·s, venue sin comprobar]: un modelo local pequeño convierte expresiones vagas en rangos concretos y **filtra por metadatos**; +15,7 % de *hit rate* en consultas difusas.
- **ChronoQA** (arXiv 2508.12282) [H·s]: clasifica las preguntas temporales en absolutas, agregadas y relativas.
- Lo ya medido en Pauta [H, `docs/producto/11` §4 bis y `research/asistente-ia/resultado-fechas.txt`]: casi todos los fallos de los modelos en el banco propio son fechas; regla del proyecto: **las fechas las calcula el código**.

**Conclusión para Pauta** [I]: «qué tengo el viernes» no es una pregunta de RAG, es una **consulta estructurada** (eventos con `inicio ∈ [vie 00:00, sáb 00:00)` en `Europe/Madrid`) que no necesita vectores ni LLM. «Cuándo fue la última vez que fui al dentista» es **búsqueda léxica/semántica + orden por fecha descendente + top-1**, y la respuesta es el dato, no un texto generado. Solo las preguntas abiertas («qué dije sobre la mudanza») necesitan el RAG completo. Tipos de pregunta y ruta:

| Tipo | Ejemplo | Ruta [P] |
|---|---|---|
| Rango absoluto/relativo | «qué tengo el viernes», «esta semana» | Analizador de fechas → filtro → lista ordenada. Sin vectores ni LLM |
| Última/próxima vez | «cuándo fue la última vez que…» | Búsqueda híbrida + filtro `fecha < ahora` + orden por fecha |
| Agregado | «cuántos ensayos he tenido en octubre» | Filtro + conteo en código; el LLM nunca cuenta |
| Abierta con o sin fecha | «qué sé de la reforma del piso» | Filtro opcional + híbrido + RRF + (reordenar) + LLM con citas |
| Sin respuesta | «qué opina mi jefe de…» | Abstención si la mejor puntuación < umbral |

[P] El *router* lo hace primero el analizador determinista ya existente (`app/src/lib/analizador.js`); solo si no reconoce nada y hay IA activa, un LLM devuelve un JSON `{tipo, rango?, consulta}` que el código valida (mismo patrón que la tarjeta de eventos).

---

## 3. Evaluación
### 3.1 Métricas estándar
- **Recuperación (sin LLM, con etiquetas de qué fragmento es relevante)** [H·s Hamel Husain, *AI Evals FAQ*, hamel.dev]: Recall@k (¿está algún relevante en los k primeros?), Precision@k, **MRR** (1/rango del primer relevante), **nDCG@k** (pondera por posición y admite relevancia graduada; métrica principal de BEIR [H·s]). Husain: evaluar recuperación y generación **por separado**, priorizar recall en la primera fase («el LLM puede ignorar lo irrelevante, pero no generar desde lo que falta») y hacer análisis de errores leyendo trazas antes de elegir métricas.
- **Generación (casi siempre con LLM juez)**:
  - **Tríada RAG de TruLens** [H·s trulens.org]: *context relevance*, *groundedness* (trocear la respuesta en afirmaciones y buscar apoyo para cada una) y *answer relevance*. Snowflake midió que el juez de *groundedness* sin optimizar tenía precisión 0,62 frente a 0,76 de Bespoke-MiniCheck-7B [H·s snowflake.com]: **los jueces también fallan**.
  - **RAGAS** 0.4.3 (13-1-2026) [H PyPI]: *Context Precision/Recall*, *Faithfulness*, *Response Relevancy*, *Noise Sensitivity*… y métricas tradicionales sin LLM: Exact Match, String Presence, BLEU, ROUGE, chrF y similitud de cadenas [H docs en GitHub]. Variantes «NonLLM» e «IDBased» de context precision/recall [H·s].
  - **DeepEval** 4.3.2 (27-10-2026), Apache-2.0 [H PyPI, README]: Contextual Precision/Recall/Relevancy, Faithfulness, Answer Relevancy; el juez es configurable.
  - **TruLens** 2.16.0 (19-10-2026) [H PyPI].
- [I] Los tres marcos son Python y asumen un LLM juez (por defecto de pago). Para Pauta (JS, 0 €) basta un script Node propio con las métricas sin LLM; RAGAS o DeepEval con un juez gratuito solo como experimento puntual.

### 3.2 Qué se puede calcular sin LLM [I salvo indicación]
1. Recall@k, MRR, nDCG@k por tipo de pregunta (tabla del §2).
2. **Exactitud de la ruta**: ¿clasificó bien el *router*? ¿el rango extraído es exactamente el esperado?
3. **Respuestas factuales exactas** en preguntas estructuradas (fecha, número): Exact Match.
4. **Validez de citas**: toda cita apunta a un fragmento recuperado; si la cita incluye una frase entre comillas, aparece literal (tras normalizar) en ese fragmento.
5. **Cobertura de citas**: proporción de frases de la respuesta con al menos una cita.
6. **Abstención correcta** en preguntas sin respuesta (tasa de «no lo sé» acertados).
7. Latencia p50/p95 en móvil y escritorio; tamaño del índice; tiempo de indexado.
8. Seguridad: % de documentos trampa que producen una propuesta de acción o un enlace activo (debe ser 0).

### 3.3 Banco propio pequeño [P]
- **Corpus sintético fijo** en el repo (`research/rag/banco/`): ~150 eventos, 60 tareas, 40 notas, 15 «lo que sé de ti», 5 documentos; con casos difíciles (sinónimos, tildes, nombres propios, eventos repetidos, cambio de hora 25-10-2026, notas contradictorias antiguas/nuevas como en «actualización de conocimiento» de LongMemEval). **Datos inventados y marcados como ficticios**; nada real del usuario sin su permiso (regla del proyecto).
- **50 preguntas** en español con: tipo, ids de fragmentos relevantes (graduados 0–2), respuesta esperada si es factual, y 8–10 sin respuesta. Escritas a mano primero (lo que Husain llama la opción de más calidad); más tarde, sintéticas generadas a partir de fragmentos y revisadas.
- **10 documentos trampa** con instrucciones ocultas (ya previsto en `arquitectura-y-permisos.md` §11).
- Ejecutar con `node --test` (ya es el sistema de pruebas de `app/`), guardar resultados con fecha en `research/rag/resultados/` y comparar configuraciones: solo BM25 · solo vectores · híbrido RRF · híbrido + contexto · + reordenación. **Esa tabla es la pieza central de la entrevista.**

---

## 4. Seguridad: inyección indirecta en lo recuperado
- [H GitHub GenAI-Security-Project/GenAI-LLM-Top10] **OWASP GenAI LLM Top 10 2026**, publicado el 4-8-2026: LLM01 Prompt Injection, LLM02 Sensitive Information Disclosure, LLM03 Excessive Agency, LLM04 Supply Chain, LLM05 Data and Model Poisoning, LLM06 Unbounded Consumption, LLM07 Misinformation, LLM08 Hidden Context Exposure, **LLM09 Vector and Embedding Weaknesses**, LLM10 Improper Output Handling. (En la de 2025, «Vector and Embedding Weaknesses» era LLM08 [H·s].) *Nota*: `arquitectura-y-permisos.md` la fecha el 3-8-2026; el repositorio dice 4-8-2026.
- [H LLM01:2026] «Los LLM no distinguen arquitectónicamente instrucciones de datos»; el contenido recuperado (web, documento, correo, pasaje RAG) es vía principal; «tan solo cinco documentos envenenados han alcanzado ~90 % de éxito» contra una base grande; las escrituras en memoria son **operaciones privilegiadas** (registrar y aprobar memorias con forma de instrucción).
- [H·s arXiv 2403.14720, Hines et al., Microsoft, 2024] **Spotlighting**: delimitadores, *datamarking* (intercalar un marcador en el texto no fiable) y *encoding* (p. ej. base64); de > 50 % a < 2 % de éxito de ataque con modelos GPT, poco coste en la tarea. [I] El *encoding* exige un modelo capaz; para modelos pequeños, *datamarking*.
- Ya decidido y aplicable sin cambios [H, `arquitectura-y-permisos.md` §8]: regla de dos, sin herramientas de escritura, quitar caracteres invisibles, no pintar imágenes ni enlaces remotos, confirmación con la acción exacta.
- **Verificación de citas en código**: Anthropic garantiza en su API de *citations* que las citas «contienen punteros válidos a los documentos» porque las extrae la API, y admite documentos de «contenido personalizado» con un bloque por fragmento RAG, citado por índice [H platform.claude.com, 28-10-2026]. Pauta usa Workers AI (D-044), así que [P] se replica en código: cada fragmento lleva un id corto (`[E12]`, `[N3]`); el validador elimina o marca las citas a ids no recuperados y las comillas que no aparezcan literalmente; una frase sin cita válida se muestra atenuada con «sin fuente».

Específico del RAG personal [I/P]:
1. **Documentos subidos y correos = no fiables; tus notas y la memoria confirmada = semifiables** (OWASP 2026 pide distinguir niveles). El nivel viaja en cada fragmento y se muestra.
2. **«Lo que sé de ti» nunca se escribe desde un fragmento recuperado** sin tu confirmación (LLM01:2026 sobre memoria; ASI06 envenenamiento de memoria).
3. **Envenenamiento del índice (LLM09)**: un documento subido puede repetir palabras clave para colarse en todo; limitar a N fragmentos por documento en el top-k y mostrar el origen.
4. **Al modelo solo los k fragmentos recortados**, nunca el índice ni los vectores; los embeddings se calculan en el dispositivo y no salen (LLM09 menciona la reconstrucción de texto desde vectores [H·s]).

---

## 5. Recomendación de arquitectura para Pauta [P]

```
 Pregunta (es) ─► 1. Router determinista (analizador.js) ──► estructurada ─► consulta IndexedDB ─► respuesta-dato
                     │ no reconoce / abierta
                     ▼
                  2. (IA opcional) LLM → JSON {tipo, rango, consulta} → validado en código
                     ▼
                  3. Filtro por metadatos (fecha, tipo, cuenta, nivel de confianza)
                     ▼
                  4. BM25 (español: minúsculas, sin tildes, stemmer) ‖ vectores (Web Worker, local)
                     ▼
                  5. RRF (k=60) → top-30 → [reordenar opcional] → top-8, máx. 2 por documento
                     ▼
     modo sin IA ◄┤ resultados con fecha y origen (fin)
                     ▼
                  6. LLM (Worker, D-044) con fragmentos marcados + ids → respuesta
                     ▼
                  7. Validador de citas en código → interfaz con citas pulsables
```

Pasos de construcción, cada uno útil por sí solo:
1. **R0 · Modelo de fragmentos**: una colección `fragmentos` en IndexedDB `{id, origen (evento/tarea/nota/memoria/doc), idOrigen, texto, cabecera, fecha, fechaFin, cuenta, confianza, hash}`. La **cabecera determinista** («Evento · Ensayo · vie 30 oct 2026 21:30–23:30 · Gmail 1») es el «contexto» de Anthropic a coste cero: sin LLM por fragmento. Eventos y tareas = un fragmento cada uno; notas y documentos = trozos de ~200–400 palabras por párrafos/encabezados con ~15 % de solapamiento (punto de partida a medir, no dato).
2. **R1 · Búsqueda léxica sin IA**: BM25 sobre `cabecera + texto` con normalización española. Opciones: **Orama** 3.1.18 (Apache-2.0, BM25 + vectores + híbrido en el navegador, stemmer español en `@orama/stemmers`, pesos híbridos por defecto 0,5/0,5) [H npm; H·s docs] o un BM25 propio de ~150 líneas sobre IndexedDB (cero dependencias, más que enseñar). [I] Inclino por el propio + Orama como comparación en el banco: la regla del proyecto es evitar dependencias y el BM25 es corto. Más el *router* temporal. **Esto ya es el «modo solo búsqueda».**
3. **R2 · Banco de evaluación** (§3.3) antes de añadir vectores, para tener línea base BM25.
4. **R3 · Vectores locales**: Transformers.js en un Web Worker; candidatos a medir en el banco: `multilingual-e5-small` (ligero) y `EmbeddingGemma-300m` q8 a 256 dimensiones. Vectores como `Float32Array` en IndexedDB; búsqueda exhaustiva por coseno (con unos miles de fragmentos no hace falta índice ANN [I]). Indexado incremental por `hash`. Descarga del modelo opcional y avisada (tamaño por medir [?]).
5. **R4 · Fusión RRF + diversidad** (máx. 2 fragmentos por documento) y abstención por umbral. Medir en el banco frente a R1.
6. **R5 · Respuesta con citas (IA opcional)**: Worker de Cloudflare ya previsto; *prompt* con fragmentos delimitados y *datamarking*, cada uno con id y nivel de confianza; validador de citas; sin herramientas. Para enlazar con la regla de 200 K tokens de Anthropic: no aplica, porque precisamente no queremos enviar todo [I].
7. **R6 · Reordenación (opcional)**: probar `bge-reranker-base` de Workers AI solo si el banco muestra que el top-8 falla y el reordenador mejora en español; implica enviar más fragmentos fuera del dispositivo, así que va desactivado por defecto.
8. **R7 · Documentos subidos**: texto plano y PDF con texto (sin OCR al principio); marcados «no fiables»; sin enlaces activos.

Lo que **no** haría [I]: base vectorial externa, LangChain/LlamaIndex en el navegador, *GraphRAG*, generar contexto con LLM por fragmento (coste y privacidad) ni memoria automática.

Pendientes para `docs/DECISIONES.md` (no los añado yo sin confirmación): elegir BM25 propio vs Orama; modelo de embeddings tras el banco; si el reordenador remoto es aceptable en privacidad; si los documentos subidos entran en la primera versión.

---

## 6. Qué enseñar en una entrevista
1. **Tabla de ablación propia** en español: BM25 → vectores → híbrido RRF → + cabecera de contexto → + reordenación, con recall@5, MRR y nDCG@10 por tipo de pregunta, y latencia en móvil.
2. **Router temporal**: por qué «qué tengo el viernes» no va a vectores; citar LongMemEval (filtro temporal antes de buscar, y que los modelos pequeños extraen mal rangos) y tu banco de fechas.
3. **Contextual retrieval sin LLM**: cabeceras deterministas a partir de metadatos que ya tienes; qué ganan frente al fragmento desnudo (medido).
4. **Privacidad por diseño**: índice y embeddings en el dispositivo; al modelo solo k fragmentos; modo sin IA funcional.
5. **Citas verificadas en código** y abstención: demostración en vivo con una pregunta sin respuesta y con un documento trampa.
6. **Seguridad**: OWASP LLM01 y LLM09 de 2026, regla de dos, spotlighting; la batería de 10 documentos trampa con 0 acciones.
7. **Disciplina de evaluación**: separar recuperación y generación, métricas sin LLM, y por qué no te fías ciegamente de un LLM juez (dato de Snowflake sobre la precisión del juez de *groundedness*).
8. **Decisiones de coste**: 0 €, sin servidor de vectores, y cuándo cambiarías (corpus > N fragmentos → índice ANN; preguntas abiertas pobres → reordenador).

---

## 7. Fuentes (consultadas el 28-10-2026)
- Anthropic, «Introducing Contextual Retrieval», 19-9-2024: https://www.anthropic.com/news/contextual-retrieval [H]
- Anthropic, Citations: https://platform.claude.com/docs/en/build-with-claude/citations [H]
- OWASP GenAI LLM Top 10 2026 (publicado 4-8-2026): https://github.com/GenAI-Security-Project/GenAI-LLM-Top10 y `2026/final/LLM01_PromptInjection.md` [H]; https://github.com/OWASP/www-project-top-10-for-large-language-model-applications [H]
- Khoj: https://github.com/khoj-ai/khoj [H]; cierre de la nube: https://www.promptquorum.com/power-local-llm/khoj-ai-second-brain-review [H·s]
- Reor: https://github.com/reorproject/reor [H] · Smart Connections: https://github.com/brianpetro/obsidian-smart-connections [H] · AnythingLLM: https://github.com/Mintplex-Labs/anything-llm [H]
- Cormack et al., RRF, SIGIR 2009: https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf [H·s]
- Thakur et al., BEIR: https://arxiv.org/abs/2104.08663 [H·s]
- Wu et al., LongMemEval, ICLR 2025: https://arxiv.org/abs/2410.10813 [H·s]
- TempRAGEval/MRAG: https://arxiv.org/abs/2412.15540 · ChronoQA: https://arxiv.org/abs/2508.12282 · DeFuzzRAG: https://ojs.aaai.org/index.php/AAAI/article/view/40276 [H·s]
- Hines et al., Spotlighting, 2024: https://arxiv.org/abs/2403.14720 [H·s]
- Chroma, Evaluating Chunking, 3-7-2024: https://research.trychroma.com/evaluating-chunking [H·s]
- LlamaIndex auto-retrieval: https://developers.llamaindex.ai/python/examples/vector_stores/chroma_auto_retriever [H·s]
- OpenAI file_search, valores por defecto: https://community.openai.com/t/dear-all-i-have-the-questions-about-the-openai-assistant-chunk-size-and-chunk-overlap-of-file-search-tool/831342 [H·s]
- RAGAS métricas: https://github.com/explodinggradients/ragas (docs/concepts/metrics/available_metrics) [H]; DeepEval: https://github.com/confident-ai/deepeval [H]; TruLens tríada: https://www.trulens.org/getting_started/core_concepts/rag_triad [H·s]; Snowflake, jueces de la tríada: https://www.snowflake.com/en/blog/engineering/benchmarking-LLM-as-a-judge-RAG-triad-metrics/ [H·s]
- Hamel Husain, evaluar RAG: https://hamel.dev/blog/posts/evals-faq/how-should-i-approach-evaluating-my-rag-system.html [H·s]
- EmbeddingGemma ONNX: https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX [H·s] · multilingual-e5-small: https://huggingface.co/Xenova/multilingual-e5-small [H·s] · Granite Embedding (MIRACL-es): https://arxiv.org/abs/2502.20204 [H·s]
- Orama: https://github.com/oramasearch/orama [H]; híbrido: https://docs.orama.com/open-source/usage/search/hybrid-search [H·s]
- Cloudflare Workers AI, precios (bge-reranker-base): https://developers.cloudflare.com/workers-ai/platform/pricing/ [H·s]
- Versiones (npm/PyPI, 28-10-2026) [H]: @orama/orama 3.1.18 (19-12-2025), @huggingface/transformers 4.3.2 (27-10-2026), minisearch 7.2.0 (16-9-2025), ragas 0.4.3 (13-1-2026), deepeval 4.3.2 (27-10-2026), trulens 2.16.0 (19-10-2026).
