// Medida: coseno por fuerza bruta sobre N vectores normalizados en un Float32Array contiguo.
// Uso: node fuerza-bruta.mjs
import { performance } from 'node:perf_hooks';

function normalizar(v, off, dim) {
  let s = 0;
  for (let i = 0; i < dim; i++) s += v[off + i] * v[off + i];
  s = 1 / Math.sqrt(s);
  for (let i = 0; i < dim; i++) v[off + i] *= s;
}

function topK(matriz, n, dim, q, k) {
  const puntos = new Float32Array(n);
  for (let j = 0; j < n; j++) {
    let s = 0;
    const off = j * dim;
    for (let i = 0; i < dim; i++) s += matriz[off + i] * q[i];
    puntos[j] = s;
  }
  // selección simple de los k mejores (k pequeño)
  const mejores = [];
  for (let j = 0; j < n; j++) {
    if (mejores.length < k) mejores.push(j), mejores.sort((a, b) => puntos[b] - puntos[a]);
    else if (puntos[j] > puntos[mejores[k - 1]]) {
      mejores[k - 1] = j;
      mejores.sort((a, b) => puntos[b] - puntos[a]);
    }
  }
  return mejores;
}

for (const dim of [384, 768]) {
  for (const n of [1000, 5000, 10000]) {
    const m = new Float32Array(n * dim);
    for (let i = 0; i < m.length; i++) m[i] = Math.random() - 0.5;
    for (let j = 0; j < n; j++) normalizar(m, j * dim, dim);
    const q = new Float32Array(dim).map(() => Math.random() - 0.5);
    normalizar(q, 0, dim);
    for (let r = 0; r < 5; r++) topK(m, n, dim, q, 10); // calentamiento
    const rep = 50;
    const t0 = performance.now();
    for (let r = 0; r < rep; r++) topK(m, n, dim, q, 10);
    const ms = (performance.now() - t0) / rep;
    console.log(`dim ${dim} · ${n} vectores · ${(m.byteLength / 1e6).toFixed(1)} MB · top-10 en ${ms.toFixed(2)} ms`);
  }
}
