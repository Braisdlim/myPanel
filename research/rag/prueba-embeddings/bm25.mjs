// BM25 propio mínimo para español (normalización + stemmer Snowball de @orama/stemmers)
// y fusión híbrida con embeddings (RRF). Uso: node bm25.mjs
import { pipeline, env } from '@huggingface/transformers';
import { stemmer } from '@orama/stemmers/spanish';

env.cacheDir = './.cache-modelos';

const VACIAS = new Set('a al algo con de del el en es la las lo los me mi para por que se su sus un una y o tengo tener hay cosas cuando cuándo'.split(' '));

export function tokens(texto) {
  return texto
    .toLowerCase()
    .split(/[^a-z0-9áéíóúüñ]+/)
    .filter((t) => t.length > 1 && !VACIAS.has(t))
    .map((t) => stemmer(t)) // el Snowball español espera las tildes: primero raíz…
    .map((t) => t.normalize('NFD').replace(/\p{M}/gu, '')); // …luego se quitan («canción» = «cancion»)
}

export function crearBM25(docs, { k1 = 1.2, b = 0.75 } = {}) {
  const tf = docs.map((d) => {
    const m = new Map();
    for (const t of tokens(d)) m.set(t, (m.get(t) ?? 0) + 1);
    return m;
  });
  const largos = tf.map((m) => [...m.values()].reduce((a, c) => a + c, 0));
  const medio = largos.reduce((a, c) => a + c, 0) / docs.length;
  const df = new Map();
  for (const m of tf) for (const t of m.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const N = docs.length;
  return (consulta) => {
    const qs = tokens(consulta);
    return tf.map((m, j) => {
      let s = 0;
      for (const t of qs) {
        const f = m.get(t);
        if (!f) continue;
        const idf = Math.log(1 + (N - df.get(t) + 0.5) / (df.get(t) + 0.5));
        s += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + (b * largos[j]) / medio));
      }
      return s;
    });
  };
}

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
const CONSULTAS = ['dentista', 'pagar facturas', 'citas', 'tocar música', 'viajes en avión'];

const bm25 = crearBM25(FRASES);
const ext = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small', { dtype: 'q8' });
const emb = async (t) => (await ext(t, { pooling: 'mean', normalize: true })).tolist();
const D = await emb(FRASES.map((f) => 'passage: ' + f));
const Q = await emb(CONSULTAS.map((c) => 'query: ' + c));

const rango = (puntos) => {
  const orden = puntos.map((s, j) => [j, s]).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]);
  return new Map(orden.map(([j], r) => [j, r + 1]));
};

console.log('Tokens de ejemplo:', tokens('Revisar las facturas pagadas y las citas médicas'));
CONSULTAS.forEach((c, i) => {
  const lex = bm25(c);
  const sem = D.map((d) => d.reduce((s, x, k) => s + x * Q[i][k], 0));
  const rl = rango(lex), rs = rango(sem);
  const K = 60; // RRF
  const rrf = FRASES.map((_, j) => (rl.has(j) ? 1 / (K + rl.get(j)) : 0) + (rs.has(j) ? 1 / (K + rs.get(j)) : 0));
  const top = (p) => p.map((s, j) => [j, s]).sort((a, b) => b[1] - a[1]).slice(0, 3).filter(([, s]) => s > 0).map(([j]) => FRASES[j]);
  console.log(`«${c}»\n   BM25:     ${top(lex).join(' | ') || '(nada)'}\n   Semántica: ${top(sem).join(' | ')}\n   Híbrido:  ${top(rrf).join(' | ')}`);
});
