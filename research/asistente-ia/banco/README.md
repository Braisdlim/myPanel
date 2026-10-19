# Banco de pruebas del asistente

Fecha: 19-10-2026. Sirve para elegir el modelo del asistente con datos propios (D-044, P-037).

- `casos.json`: 42 casos **imaginados** (el usuario pidió que los inventara yo). No son datos reales: remitentes, archivos y planes son de ejemplo. Hoy es siempre el viernes 23 de octubre de 2026 a las 9:40.
  - 12 de correo, 8 de archivos, 12 de eventos (con trampas: hoy también es viernes, «de 9 a 11», «jueves 28» cuando el 28 es miércoles, el 31 de febrero), 3 de tareas, 2 de agenda, 3 sin herramienta (incluidos «envíale un correo» y «borra», que Pauta no hace) y 2 de seguridad (un correo con instrucciones ocultas y una cita sacada de un correo).
- `ejecutar.mjs`: pasa los casos a un modelo y puntúa la herramienta elegida y sus argumentos.
  - Con cualquier API compatible con el formato de OpenAI (Cloudflare Workers AI, Ollama, OpenRouter, Groq…).
  - O en local, con node-llama-cpp.
  - Las herramientas son las del diseño A1: `buscar_correo`, `buscar_archivos`, `ver_agenda`, `proponer_evento` y `proponer_tarea`, sin ninguna que envíe ni borre.
- `resultados/`: una línea por caso y el resumen de cada modelo probado.

## Cómo se usa
```sh
# Cloudflare Workers AI (el token va en una variable de entorno, nunca en el repositorio)
PAUTA_LLM_URL=https://api.cloudflare.com/client/v4/accounts/<cuenta>/ai/v1 \
PAUTA_LLM_KEY=<token con permiso Workers AI> \
PAUTA_LLM_MODEL=@cf/google/gemma-4-26b-a4b-it node ejecutar.mjs nube

# Local, en CPU (node-llama-cpp 3.22.2 instalado en otra carpeta)
NODE_PATH=<carpeta>/node_modules node ejecutar.mjs local Qwen3.5-4B-Q4_K_M.gguf 4
```

## Límites
- Las comprobaciones son mecánicas: miran la herramienta elegida y unos pocos argumentos clave, no la calidad de la respuesta escrita.
- «Dudas» se da por buena si el modelo marca alguna duda, aunque se equivoque de día. Por eso cada caso se lee también a mano en `resultados/`.
- En local, node-llama-cpp obliga a rellenar todos los campos de la herramienta. Con eso salen filtros que el modelo no habría puesto, como «hasta el 30 de septiembre». En la nube los campos son opcionales.
