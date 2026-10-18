// Prueba pequeña de function calling en español con modelos locales (CPU, llama.cpp vía node-llama-cpp).
// Uso: node prueba-tools.mjs <ruta-al-modelo.gguf> [hilos]
// Requiere: npm i node-llama-cpp@3.22.2 (en un directorio aparte; no es dependencia del proyecto).
// Las herramientas son simuladas: solo se registra qué función elige el modelo y con qué argumentos.
import { getLlama, LlamaChatSession, defineChatSessionFunction } from "node-llama-cpp";
import path from "node:path";

const modelPath = process.argv[2];
const threads = Number(process.argv[3] ?? 4);
if (!modelPath) { console.error("Falta la ruta del modelo .gguf"); process.exit(1); }

// Casos: texto del usuario y herramienta esperada (null = no debería llamar a ninguna).
const casos = [
  { q: "Busca los correos de Iberdrola de septiembre en la cuenta del trabajo", esperado: "buscar_correos" },
  { q: "¿Tengo algún correo de Renfe con el billete del viaje a Vigo?", esperado: "buscar_correos" },
  { q: "Encuéntrame el PDF del contrato de alquiler en Drive", esperado: "buscar_archivos" },
  { q: "Busca en OneDrive la hoja de cálculo de gastos de 2025", esperado: "buscar_archivos" },
  { q: "Pon dentista el jueves que viene a las 17:30, una hora", esperado: "crear_evento" },
  { q: "Crea un evento mañana de 9 a 10 llamado revisión con Marta", esperado: "crear_evento" },
  { q: "Apúntame cena con mis padres el sábado 24 a las nueve de la noche", esperado: "crear_evento" },
  { q: "¿Qué tal estás? Solo quería saludar", esperado: null },
];

const llamadas = [];
const registrar = (nombre) => async (params) => { llamadas.push({ nombre, params }); return { ok: true, resultados: [] }; };

const functions = {
  buscar_correos: defineChatSessionFunction({
    description: "Busca correos en las cuentas de Gmail del usuario",
    params: {
      type: "object",
      properties: {
        consulta: { type: "string", description: "Consulta en sintaxis de búsqueda de Gmail (from:, after:, before:, subject:)" },
        cuenta: { enum: ["personal", "trabajo", "todas"] },
      },
      required: ["consulta", "cuenta"],
    },
    handler: registrar("buscar_correos"),
  }),
  buscar_archivos: defineChatSessionFunction({
    description: "Busca archivos en Google Drive u OneDrive",
    params: {
      type: "object",
      properties: {
        texto: { type: "string" },
        servicio: { enum: ["drive", "onedrive", "ambos"] },
        tipo: { enum: ["pdf", "hoja", "documento", "cualquiera"] },
      },
      required: ["texto", "servicio", "tipo"],
    },
    handler: registrar("buscar_archivos"),
  }),
  crear_evento: defineChatSessionFunction({
    description: "Prepara un evento de calendario para que el usuario lo confirme",
    params: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        inicio: { type: "string", description: "Fecha y hora local ISO 8601, p. ej. 2026-10-22T17:30" },
        fin: { type: "string", description: "Fecha y hora local ISO 8601" },
      },
      required: ["titulo", "inicio", "fin"],
    },
    handler: registrar("crear_evento"),
  }),
};

const sistema =
  "Eres el asistente de la app Pauta. Hoy es domingo 18 de octubre de 2026, zona Europe/Madrid. " +
  "Usa las herramientas cuando el usuario pida buscar correos, buscar archivos o crear eventos. " +
  "Si no hace falta ninguna herramienta, responde brevemente en español.";

const llama = await getLlama({ gpu: false });
const model = await llama.loadModel({ modelPath });
console.log(`Modelo: ${path.basename(modelPath)} | hilos: ${threads} | llama.cpp: ${llama.buildType ?? ""}`);

let aciertos = 0, totalTokens = 0, totalMs = 0;
for (const caso of casos) {
  const context = await model.createContext({ contextSize: 4096, threads });
  const session = new LlamaChatSession({ contextSequence: context.getSequence(), systemPrompt: sistema });
  llamadas.length = 0;
  const t0 = performance.now();
  let tokens = 0;
  const respuesta = await session.prompt(caso.q, {
    functions,
    maxTokens: 400,
    temperature: 0,
    budgets: { thoughtTokens: 0 },
    onToken: (t) => { tokens += t.length; },
  });
  const ms = performance.now() - t0;
  totalTokens += tokens; totalMs += ms;
  const primera = llamadas[0]?.nombre ?? null;
  const ok = primera === caso.esperado;
  if (ok) aciertos++;
  console.log(JSON.stringify({
    pregunta: caso.q, esperado: caso.esperado, llamada: llamadas[0] ?? null, ok,
    segundos: +(ms / 1000).toFixed(1), tokens_generados: tokens,
    respuesta: respuesta.slice(0, 160),
  }));
  await context.dispose();
}
console.log(`RESUMEN ${path.basename(modelPath)}: herramienta correcta ${aciertos}/${casos.length}; ` +
  `tiempo total ${(totalMs / 1000).toFixed(1)} s; tokens generados ${totalTokens} ` +
  `(≈${(totalTokens / (totalMs / 1000)).toFixed(1)} tok/s de media incluyendo prefill).`);
