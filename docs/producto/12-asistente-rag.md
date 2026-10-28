# 12. Asistente con RAG: pregúntale a tu propia vida

Fecha: 28-10-2026. Estado: **hecho y medido** (D-061 a D-063). Sustituye al aplazamiento de D-047.
Etiquetas: [H] comprobado, [I] inferencia, [P] propuesta.

## La idea
Preguntas en español sobre tu agenda, tus tareas, tus notas y lo que sabe de ti:
- «¿Cuándo tengo el dentista?»
- «¿Qué le regalo a Ana?»
- «¿Cuántas veces fui a yoga la semana pasada?»

Pauta responde **citando de dónde sale cada dato**. Si no lo sabe, lo dice.

Reglas:
- Funciona sin IA. El modelo solo redacta.
- Tus datos no salen del dispositivo; al modelo solo le llegan los fragmentos encontrados.
- Coste cero.

## Cómo funciona

```
Pregunta ─► 1. Router temporal (código) ─► «¿qué tengo el martes?» ─► consulta a la agenda ─┐
              │ fechas, franja, intención: agenda / la próxima / la última / contar        │
              ▼                                                                           │
            2. Filtro por fechas (antes de buscar)                                        │
              ▼                                                                           │
            3. BM25 en español  ‖  vectores locales (opcional, Web Worker)                │
              ▼                                                                           │
            4. Fusión RRF (k = 60) · máx. 2 trozos por documento                          │
              ▼                                                                           │
            5. Intención: ordenar por fecha (la próxima / la última) o contar (código) ◄──┘
              ▼
            6. Respuesta del código con citas  ──(si hay modelo)──► 7. El modelo redacta con
                                                                      los fragmentos numerados
              ▼                                                       ▼
            8. Validador de citas: quita las inventadas, avisa si no cita, detecta «no lo sé»
```

| Pieza | Archivo | Decisión y por qué |
|---|---|---|
| Fragmentos | `app/src/lib/rag/fragmentos.js` | Un fragmento por evento, tarea o dato. Las notas se trocean por párrafos (~120 palabras, con la última frase repetida en el trozo siguiente). Cada fragmento lleva una **cabecera fija** hecha con sus metadatos («Evento · mar 27 oct · 10:30–11:30 · Gmail personal»): es el *Contextual Retrieval* de Anthropic (2024) sin pagar un modelo por fragmento. |
| Router temporal | `rag/tiempo.js` | «El viernes», «la semana que viene», «en noviembre», «la última vez», «cuántas veces»: lo resuelve el código. LongMemEval (ICLR 2025) muestra que filtrar por fecha antes de buscar mejora el recall y que los modelos pequeños extraen mal los rangos [H·s, `research/rag/arquitectura.md`]. |
| Búsqueda por palabras | `rag/bm25.js`, `rag/texto.js` | BM25 propio (k1 = 1,2, b = 0,75) sobre texto sin tildes, sin palabras vacías y con raíz ligera. Sin dependencias. |
| Búsqueda por significado | `rag/embeddings.js`, `rag/vectores.worker.js` | multilingual-e5-small (MIT, 384 dimensiones, ~118 MB en q8) con Transformers.js 4.3.1 en un Web Worker. Los vectores se guardan en IndexedDB. Búsqueda exhaustiva por coseno, sin índice ANN: con miles de fragmentos tarda milisegundos [H, `research/rag/navegador.md`]. **Apagada por defecto**, porque descarga 118 MB. |
| Fusión | `rag/motor.js` | RRF (Cormack et al., 2009). Los parecidos de e5 salen apiñados (0,80–0,90) y no separan «hay respuesta» de «no la hay»: entran los 20 más parecidos y, si ninguna palabra coincide, la respuesta se marca **dudosa** («No lo encuentro. Lo más parecido: …»). |
| Respuesta y citas | `rag/respuesta.js` | Sin modelo, la escribe el código con plantillas por intención. Con modelo, los fragmentos van delimitados como **datos** (*spotlighting*); las instrucciones dicen que se ignore lo que piden; y un validador en código quita las citas que no existen. |
| Proveedores | `rag/proveedores.js` | Formato de chat de OpenAI. Por defecto **OVHcloud sin clave** (gratis, Francia, no entrena, 2 por minuto **por visitante**). Con tu clave: Groq, Gemini, OpenRouter o Mistral. CORS comprobado el 28-10-2026 [H, `research/rag/prueba-cors/`]. «Sin IA» no envía nada. |
| Persona de ejemplo | `rag/demo.js` | «Lucía», **inventada**: 99 fragmentos generados alrededor de hoy, para que cualquiera lo pruebe sin conectar nada. |
| Interfaz | `sectores/Asistente.svelte`, Ajustes › Asistente | Calco del asistente de Shortwave (D-046): citas pulsables, fuentes numeradas y «cómo lo he buscado». |

## Cómo se mide (`app/scripts/evaluar-rag.mjs`)

**Banco** (`app/pruebas/rag/banco.json`): 45 preguntas sobre la persona de ejemplo, con hoy = viernes 23-10-2026.
- Tipos: agenda, la próxima, la última, contar, datos, notas, sinónimos, sin respuesta y documento trampa.
- Cada pregunta indica qué fragmentos la responden y qué dato debe aparecer en la respuesta.

**Métricas sin LLM:** acierto@1 y @5, recall@5, MRR, nDCG@10, abstención correcta, «exacta» (la respuesta contiene el dato esperado) y acierto del router.

Resultados del 28-10-2026 [H, `research/rag/resultados.md`]:

| Configuración | acierto@1 | acierto@5 | MRR | nDCG@10 | exacta |
|---|---|---|---|---|---|
| BM25 sin cabecera | 68 % | 85 % | 0,74 | 0,75 | 77 % |
| BM25 + cabecera | 75 % | 85 % | 0,79 | 0,79 | 77 % |
| Vectores solos | 93 % | 98 % | 0,94 | 0,95 | 95 % |
| **Híbrido (RRF)** | 85 % | **98 %** | 0,90 | 0,91 | **95 %** |

Router temporal: 22 de 22. Abstención en las preguntas sin respuesta: 4 de 4. El documento trampa no se repite.

**Lo que se aprende de la tabla:**
1. **La cabecera fija mejora el primer puesto** (68 → 75 %) sin coste: el contexto que añade un LLM por fragmento se puede sacar gratis de los metadatos.
2. **BM25 no entiende sinónimos**: en esas preguntas acierta 2 de 7. Los vectores suben ese grupo a 6 de 7.
3. **En este banco, los vectores solos ganan en el primer puesto** (93 % frente a 85 % del híbrido). Aun así se usa el híbrido, porque BM25 asegura lo exacto: códigos como «LX4521», nombres y palabras raras. Con 45 preguntas, la diferencia es de 3 preguntas. [I] Hace falta un banco mayor para decidirlo.
4. **Las fechas no se buscan, se calculan.** Agenda, la próxima, la última y contar salen al 100 % con cualquier configuración, gracias al router.
5. **La abstención no puede depender del parecido** con e5-small: una pregunta sin respuesta llega a 0,85, como una con respuesta. Por eso, sin palabras en común la respuesta es dudosa y, con modelo, decide el modelo con la regla «si no está, di que no lo sabes».

**Límites honestos:**
- El banco y la persona los escribí yo. Las preguntas de sinónimos se escribieron **antes** de ajustar el motor, pero hay riesgo de sobreajuste.
- En el navegador (WASM), «¿Qué medicamento no puedo tomar?» devolvió otra memoria en primer puesto, cuando en Node acertaba: los parecidos están a 0,006 de distancia. Es frágil y queda documentado.
- Respuestas del modelo: ver la sección siguiente.

## Respuestas del modelo (OVH gpt-oss-120b, sin clave, 45 preguntas)

| Métrica | v1 | v2: pistas de intención y citas normalizadas |
|---|---|---|
| Contiene el dato esperado (texto del modelo) | 92 % | 95 % |
| **Lo que ve el usuario**, tras la verificación del código | 95 % | **97 %** |
| Cita al menos un fragmento relevante | 97 % | 97 % |
| Citas inventadas | 0 | 0 |
| Se abstiene cuando no hay respuesta | 4 de 4 | 4 de 4 |
| Cae en la trampa del documento | 0 de 2 | 0 de 2 |

Detalle en `research/rag/resultados-generacion-v1.md` y `resultados-generacion.md`.

**Lo que enseñó medir:**
1. **Cada modelo cita a su manera.** gpt-oss usa 【1】 y 【1†n】; sin normalizarlo, un validador estricto cuenta las citas como inexistentes.
2. **El modelo puede contradecir al código.** Con «la última vez que fui al dentista» citó la cita futura. Ahora el mensaje dice qué ha calculado el código y, si aun así el modelo cita solo fechas del lado contrario, se enseña la respuesta del código (`contradiceFechas`).
3. **Hay que medir la métrica antes de fiarse de ella.** La primera puntuación salió en 51 %, pero era un fallo mío al medir: el modelo escribe espacios no separables («14 de noviembre» con U+202F) y «4 reuniones» en vez de «4 veces». Corregida la comparación, las respuestas guardadas se vuelven a puntuar sin llamar al modelo (`--recalificar`).

## Para que lo use cualquiera (portafolio)
- **Sin secretos en el repositorio.** El ID de cliente de Google es público por diseño. El asistente no necesita clave (OVH sin cuenta), y quien quiera usa la suya, que se guarda **solo en memoria** o, si lo pide, en la pestaña (`sessionStorage`), nunca en `localStorage`.
  - Motivo: en GitHub Pages, todos los proyectos de un usuario comparten origen [H, `research/rag/modelos-y-claves.md`].
- **Modo demo automático.** Sin datos propios, el asistente usa a Lucía, así que un entrevistador lo prueba en segundos.
- **Con tus datos, permiso explícito**: antes del primer envío al modelo, enseña cuántos fragmentos saldrían y a quién.
- **Google para otras personas:** cada una conecta su cuenta desde la interfaz. Hay que tener en cuenta:
  - El proyecto sin verificar enseña un aviso y admite **100 usuarios** en total.
  - Abrirla de verdad exige la verificación de Google (D-001, D-040).

## Qué contar en una entrevista
1. **Por qué no todo es vectores**: el router temporal y la tabla por tipo de pregunta.
2. **Contexto sin LLM**: la cabecera de metadatos y lo que mejora el primer puesto.
3. **Híbrido con RRF**, y la sorpresa de que los vectores solos ganan en este banco: por qué aun así se usa el híbrido y qué haría falta para decidirlo.
4. **Abstención**: por qué el umbral de parecido no sirve con e5-small y cómo se resolvió.
5. **Citas comprobadas en código** y documentos subidos marcados como no fiables. Demo en vivo con la pregunta trampa.
6. **Privacidad y coste por diseño**: índice local, 0 €, el modelo solo ve k fragmentos y el modo sin IA funciona.
7. **Evaluación propia** con métricas de recuperación sin juez LLM, separada de la de generación.

## Siguiente [P]
- Hacer crecer el banco con preguntas reales del usuario (P-037) y separar desarrollo de prueba.
- Probar EmbeddingGemma-300m y granite-97m en el banco (`research/rag/navegador.md`).
- Reordenador local solo si el banco lo justifica.
- «Lo que sé de ti» con propuestas que confirmas, nunca escritas desde un fragmento recuperado (OWASP LLM01).
- Correo y Drive (fase 2, D-008) como fuentes más, con el mismo motor.
