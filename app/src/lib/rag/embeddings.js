// Vectores de significado en el propio dispositivo (D-061): multilingual-e5-small (MIT, 384 dimensiones, unos 118 MB
// en q8) con Transformers.js. El modelo se descarga una vez de Hugging Face y queda en la caché del navegador.
// En la app corre dentro de un Web Worker (vectores.worker.js); en el banco de evaluación, en Node.

export const MODELO = "Xenova/multilingual-e5-small";
export const TAMANO_MB = 118;

/**
 * @param {{ cacheDir?: string, progreso?: (p) => void }} opciones
 * @returns {Promise<(textos: string[], tipo: "consulta"|"fragmento") => Promise<Float32Array[]>>}
 */
export async function crearEmbebedor({ cacheDir, progreso } = {}) {
  const { pipeline, env } = await import("@huggingface/transformers");
  if (cacheDir) env.cacheDir = cacheDir;
  const extraer = await pipeline("feature-extraction", MODELO, { dtype: "q8", progress_callback: progreso });
  // e5 pide prefijos distintos para la pregunta y para lo que se busca (ficha del modelo)
  return async (textos, tipo) => {
    const salida = await extraer(textos.map((t) => (tipo === "consulta" ? "query: " : "passage: ") + t), { pooling: "mean", normalize: true });
    return salida.tolist().map((v) => Float32Array.from(v));
  };
}
