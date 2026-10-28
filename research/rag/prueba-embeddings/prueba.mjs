// Prueba mínima de búsqueda semántica local en español con Transformers.js en Node.
// Uso: node prueba.mjs [id-modelo ...]   (sin argumentos prueba los modelos candidatos)
// Los textos son inventados para la prueba; no son datos del usuario.
import { pipeline, env } from '@huggingface/transformers';
import { performance } from 'node:perf_hooks';

env.cacheDir = './.cache-modelos'; // fuera de git (ver .gitignore)

const FRASES = [
  'Reunión con el dentista el martes a las 10:00',
  'Comprar pan, leche y huevos en el supermercado',
  'Pagar la factura de la luz antes del día 5',
  'Ensayo con la banda el viernes por la noche',
  'Renovar el DNI en la comisaría',
  'Llamar a mamá por su cumpleaños',
  'Entregar el informe trimestral al jefe',
  'Cita en la peluquería el sábado por la mañana',
  'Revisar el seguro del coche que vence en noviembre',
  'Ir al gimnasio lunes, miércoles y viernes',
  'Reservar mesa para cenar con los amigos del instituto',
  'Mandar el currículum a la oferta de desarrollador frontend',
  'Recoger el paquete de Correos antes del jueves',
  'Pedir cita con el médico de cabecera por el dolor de espalda',
  'Preparar la declaración de la renta',
  'Vuelo a Santiago el 12 de diciembre a las 7:40',
  'Comprar un regalo de Navidad para mi hermana',
  'Llevar el coche al taller para cambiar el aceite',
  'Estudiar para el examen de inglés B2',
  'Regar las plantas del balcón',
];

const CONSULTAS = [
  '¿cuándo tengo que ir al odontólogo?',
  'trámites con la administración',
  'cosas del coche',
  'tocar música',
  'viajes en avión',
];

// Prefijos según cada model card (fuente en navegador.md)
const MODELOS = {
  'onnx-community/granite-embedding-97m-multilingual-r2-ONNX': { q: '', p: '', pooling: 'cls' },
  'Xenova/multilingual-e5-small': { q: 'query: ', p: 'passage: ', pooling: 'mean' },
  'Xenova/paraphrase-multilingual-MiniLM-L12-v2': { q: '', p: '', pooling: 'mean' },
  'onnx-community/embeddinggemma-300m-ONNX': { q: 'task: search result | query: ', p: 'title: none | text: ', pooling: 'gemma', dtype: 'q4' },
};

function coseno(a, b) {
  // vectores ya normalizados: coseno = producto escalar
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

async function embeberGemma(model, tokenizer, textos) {
  const inputs = await tokenizer(textos, { padding: true, truncation: true });
  const { sentence_embedding } = await model(inputs);
  return sentence_embedding.tolist();
}

async function probar(id) {
  const cfg = MODELOS[id];
  const dtype = process.env.DTYPE ?? cfg.dtype ?? 'q8';
  const lineas = [`\n=== ${id} (dtype ${dtype}) ===`];
  const t0 = performance.now();
  let embeber;
  if (cfg.pooling === 'gemma') {
    const { AutoModel, AutoTokenizer } = await import('@huggingface/transformers');
    const tokenizer = await AutoTokenizer.from_pretrained(id);
    const model = await AutoModel.from_pretrained(id, { dtype });
    embeber = (t) => embeberGemma(model, tokenizer, t);
  } else {
    const ext = await pipeline('feature-extraction', id, { dtype });
    embeber = async (t) => (await ext(t, { pooling: cfg.pooling, normalize: true })).tolist();
  }
  const t1 = performance.now();
  const docs = await embeber(FRASES.map((f) => cfg.p + f));
  const t2 = performance.now();
  const qs = await embeber(CONSULTAS.map((c) => cfg.q + c));
  const t3 = performance.now();
  lineas.push(`Dimensión: ${docs[0].length}`);
  lineas.push(`Carga del modelo (incluye descarga si no está en caché): ${(t1 - t0).toFixed(0)} ms`);
  lineas.push(`Embeber 20 frases (un lote): ${(t2 - t1).toFixed(0)} ms; 5 consultas: ${(t3 - t2).toFixed(0)} ms`);
  CONSULTAS.forEach((c, i) => {
    const top = docs
      .map((d, j) => ({ j, s: coseno(qs[i], d) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);
    lineas.push(`«${c}»`);
    top.forEach((r, k) => lineas.push(`   ${k + 1}. ${r.s.toFixed(3)}  ${FRASES[r.j]}`));
  });
  console.log(lineas.join('\n'));
}

const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(MODELOS);
console.log(`Node ${process.version} · ${new Date().toISOString()}`);
for (const id of ids) {
  try {
    await probar(id);
  } catch (e) {
    console.log(`\n=== ${id}: ERROR ${e.message}`);
  }
}
