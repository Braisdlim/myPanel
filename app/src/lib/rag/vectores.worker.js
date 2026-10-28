// Web Worker de vectores (D-061): el modelo corre fuera del hilo de la interfaz para que no se trabe al indexar.
import { crearEmbebedor } from "./embeddings.js";

let embeber = null;
self.onmessage = async ({ data }) => {
  const { id, textos, tipo } = data;
  try {
    embeber ??= await crearEmbebedor({ progreso: (p) => self.postMessage({ id, progreso: p }) });
    const vectores = await embeber(textos, tipo);
    self.postMessage({ id, vectores }, vectores.map((v) => v.buffer));
  } catch (e) {
    embeber = null;
    self.postMessage({ id, error: e?.message ?? String(e) });
  }
};
