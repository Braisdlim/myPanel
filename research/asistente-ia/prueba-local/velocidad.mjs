// Mide por separado la lectura del prompt (prefill) y la generación (decode) en CPU.
// Uso: node velocidad.mjs <modelo.gguf> [hilos]
import { getLlama, LlamaChatSession } from "node-llama-cpp";
import path from "node:path";

const modelPath = process.argv[2];
const threads = Number(process.argv[3] ?? 4);
const llama = await getLlama({ gpu: false });
const model = await llama.loadModel({ modelPath });
const context = await model.createContext({ contextSize: 4096, threads });
const seq = context.getSequence();

// Prompt de ~500 tokens: tamaño típico de instrucciones + definiciones de 3 herramientas.
const texto = "Eres el asistente de la app Pauta. Busca correos, archivos y crea eventos. ".repeat(40);
const tokens = model.tokenize(texto);
let t0 = performance.now();
await seq.evaluateWithoutGeneratingNewTokens(tokens);
const prefillS = (performance.now() - t0) / 1000;

const session = new LlamaChatSession({ contextSequence: seq });
// Muestra qué plantilla de chat ha elegido node-llama-cpp (afecta al formato de las llamadas a herramientas).
const wrapper = session.chatWrapper?.wrapperName ?? session.chatWrapper?.constructor?.name;
let n = 0;
t0 = performance.now();
let tPrimer = null;
await session.prompt("Escribe una frase larga sobre el otoño en Galicia.", {
  maxTokens: 64, temperature: 0, budgets: { thoughtTokens: 0 },
  onToken: (t) => { if (tPrimer === null) tPrimer = performance.now(); n += t.length; },
});
const decodeS = (performance.now() - (tPrimer ?? t0)) / 1000;
console.log(JSON.stringify({
  modelo: path.basename(modelPath), hilos: threads, plantilla: wrapper,
  prefill_tokens: tokens.length, prefill_tok_s: +(tokens.length / prefillS).toFixed(1),
  decode_tokens: n, decode_tok_s: +(n / decodeS).toFixed(1),
}));
