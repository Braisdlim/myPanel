# Resultados del banco del asistente

Generado por `app/scripts/evaluar-rag.mjs` el 2026-10-28. 45 preguntas sobre la persona de ejemplo (inventada), hoy = 2026-10-23. 99 fragmentos.
Métricas sin LLM: acierto@1 y @5 (hay al menos un fragmento relevante en los primeros), recall@5, MRR, nDCG@10, abstención correcta en las preguntas sin respuesta y «exacta» (la respuesta escrita por el código contiene el dato esperado).

## Recuperación por configuración

| Configuración | acierto@1 | acierto@5 | recall@5 | MRR | nDCG@10 | abstención | exacta | ms/pregunta |
|---|---|---|---|---|---|---|---|---|
| BM25 sin cabecera | 68 % | 85 % | 84 % | 0.74 | 0.75 | 100 % | 77 % | 0.35 |
| BM25 + cabecera | 75 % | 85 % | 84 % | 0.79 | 0.79 | 100 % | 77 % | 0.08 |
| Vectores solos | 93 % | 98 % | 98 % | 0.94 | 0.95 | 100 % | 95 % | 3.60 |
| Híbrido (RRF) | 85 % | 98 % | 98 % | 0.90 | 0.91 | 100 % | 95 % | 3.54 |

## Por tipo de pregunta (acierto@5 · exacta)

| Tipo (n) | BM25 sin cabecera | BM25 + cabecera | Vectores solos | Híbrido (RRF) |
|---|---|---|---|---|
| agenda (6) | 100 % · 100 % | 100 % · 100 % | 100 % · 100 % | 100 % · 100 % |
| proxima (6) | 100 % · 100 % | 100 % · 100 % | 100 % · 100 % | 100 % · 100 % |
| ultima (5) | 100 % · 100 % | 100 % · 100 % | 100 % · 100 % | 100 % · 100 % |
| contar (3) | 100 % · 100 % | 100 % · 100 % | 100 % · 100 % | 100 % · 100 % |
| hecho (7) | 86 % · 86 % | 86 % · 71 % | 100 % · 100 % | 100 % · 100 % |
| nota (5) | 100 % · 80 % | 100 % · 100 % | 100 % · 100 % | 100 % · 100 % |
| semantica (7) | 29 % · 0 % | 29 % · 0 % | 86 % · 71 % | 86 % · 71 % |
| sin-respuesta (4) | abstiene 100 % | abstiene 100 % | abstiene 100 % | abstiene 100 % |
| trampa (2) | 100 % · — | 100 % · — | 100 % · — | 100 % · — |

Router temporal: 22 de 22 preguntas con fechas entendidas como se esperaba.
Vectores: 23.78 ms por fragmento al indexar (CPU, Node, 99 fragmentos).

<details><summary>Fallos de la mejor configuración (Híbrido (RRF))</summary>

- **s5** (semantica): «No lo encuentro en tus datos. Lo más parecido: «Mi pareja se llama Marcos y es vegetariano.»: Mi pareja se llama Marcos y es vegetariano. [1].» · top: memoria:demo-m-7, memoria:demo-m-inf, evento:demo-2026-10-24-Cena con Marcos, memoria:demo-m-1, evento:demo-2026-10-15-Médico: análisis de sangre
- **s6** (semantica): «No lo encuentro en tus datos. Lo más parecido: «Mi médica de cabecera es la doctora Salas, del centro de sal»: Mi médica de cabecera es la doctora Salas, del centro de salud Legazpi. [1].» · top: memoria:demo-m-3, memoria:demo-m-8, memoria:demo-m-4, memoria:demo-m-5, memoria:demo-m-1

</details>
