// Quién redacta la respuesta (D-063). Todos hablan el formato de chat de OpenAI y admiten llamadas desde el
// navegador (CORS comprobado el 28-10-2026, research/rag/prueba-cors/). Al modelo solo le llegan los fragmentos
// encontrados; la búsqueda se queda en el dispositivo.

export const PROVEEDORES = [
  { id: "ninguno", nombre: "Sin IA: solo buscar", detalle: "Responde el código con lo que encuentra. Nada sale del dispositivo." },
  { id: "ovh", nombre: "OVHcloud (sin clave)", detalle: "Gratis y sin cuenta, 2 preguntas por minuto. Francia; no entrena con tus datos.",
    url: "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions", modelo: "gpt-oss-120b", clave: false },
  { id: "groq", nombre: "Groq (tu clave)", detalle: "Clave gratuita en console.groq.com. No entrena con tus datos.",
    url: "https://api.groq.com/openai/v1/chat/completions", modelo: "openai/gpt-oss-120b", clave: true },
  { id: "gemini", nombre: "Google Gemini (tu clave)", detalle: "Clave de Google AI Studio. Desde la UE, la capa gratuita no entrena.",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", modelo: "gemini-flash-latest", clave: true },
  { id: "openrouter", nombre: "OpenRouter (tu clave)", detalle: "Elige un modelo «:free» de un proveedor que no entrene.",
    url: "https://openrouter.ai/api/v1/chat/completions", modelo: "openai/gpt-oss-120b:free", clave: true },
  { id: "mistral", nombre: "Mistral (tu clave)", detalle: "Desactiva el entrenamiento con tus datos en su consola.",
    url: "https://api.mistral.ai/v1/chat/completions", modelo: "mistral-small-latest", clave: true },
];
export const proveedor = (id) => PROVEEDORES.find((p) => p.id === id) ?? PROVEEDORES[0];

export class LimiteAlcanzado extends Error {}

/** Llama al modelo. `fetchFn` se puede sustituir en las pruebas. */
export async function preguntarModelo({ id, clave = "", modelo, mensajes, signal, fetchFn = fetch, tiempo = 45_000 }) {
  const p = proveedor(id);
  if (!p.url) throw new Error("Sin proveedor de IA.");
  if (p.clave && !clave) throw new Error(`Falta tu clave de ${p.nombre.replace(/ \(.*/, "")} (Ajustes › Asistente).`);
  const ctl = new AbortController();
  const corte = setTimeout(() => ctl.abort(), tiempo);
  signal?.addEventListener("abort", () => ctl.abort());
  try {
    const r = await fetchFn(p.url, {
      method: "POST", signal: ctl.signal,
      headers: { "Content-Type": "application/json", ...(p.clave ? { Authorization: `Bearer ${clave}` } : {}) },
      body: JSON.stringify({ model: modelo || p.modelo, messages: mensajes, temperature: 0.1, max_tokens: 700 }),
    });
    if (r.status === 429) throw new LimiteAlcanzado(`${p.nombre.replace(/ \(.*/, "")} pide esperar un poco (límite de peticiones).`);
    if (r.status === 401 || r.status === 403) throw new Error(`${p.nombre.replace(/ \(.*/, "")} no acepta la clave.`);
    if (!r.ok) throw new Error(`${p.nombre.replace(/ \(.*/, "")} respondió ${r.status}.`);
    const j = await r.json();
    const texto = j.choices?.[0]?.message?.content ?? "";
    // Algunos modelos razonan entre <think>…</think>: no se enseña
    return { texto: texto.replace(/<think>[\s\S]*?<\/think>/g, "").trim(), modelo: j.model ?? modelo ?? p.modelo };
  } catch (e) {
    if (e.name === "AbortError") throw new Error("El modelo tardó demasiado.");
    throw e;
  } finally { clearTimeout(corte); }
}
