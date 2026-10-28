// Banco de evaluación del asistente (D-062): mide la búsqueda y las respuestas sobre la persona de ejemplo.
//   node scripts/evaluar-rag.mjs                 → recuperación: BM25 sin cabecera, BM25, vectores y híbrido (sin red salvo
//                                                  la primera descarga del modelo de vectores; con proxy: NODE_USE_ENV_PROXY=1)
//   node scripts/evaluar-rag.mjs --generar=ovh   → además, respuestas del modelo (2 por minuto en OVH: ~25 min)
// Escribe research/rag/resultados.md y resultados.json.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { datosDemo, CUENTAS_DEMO } from "../src/lib/rag/demo.js";
import { crearFragmentos, textoIndexable } from "../src/lib/rag/fragmentos.js";
import { crearMotor } from "../src/lib/rag/motor.js";
import { respuestaSinModelo, mensajes, validarCitas, contradiceFechas } from "../src/lib/rag/respuesta.js";
import { leerTiempo } from "../src/lib/rag/tiempo.js";

const banco = JSON.parse(readFileSync(new URL("../pruebas/rag/banco.json", import.meta.url)));
const { hoy, ahora } = banco;
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const fr = crearFragmentos(datosDemo(hoy), { hoy, cuenta: (id) => CUENTAS_DEMO.find((c) => c.id === id) });

// ---------- métricas (sin LLM) ----------
const recall = (top, rel, k) => (rel.length ? rel.filter((r) => top.slice(0, k).includes(r)).length / rel.length : null);
const acierto = (top, rel, k) => (rel.length ? (rel.some((r) => top.slice(0, k).includes(r)) ? 1 : 0) : null);
const mrr = (top, rel) => { const i = top.findIndex((x) => rel.includes(x)); return rel.length ? (i === -1 ? 0 : 1 / (i + 1)) : null; };
const ndcg = (top, rel, k = 10) => {
  if (!rel.length) return null;
  const dcg = top.slice(0, k).reduce((s, x, i) => s + (rel.includes(x) ? 1 / Math.log2(i + 2) : 0), 0);
  const ideal = rel.slice(0, k).reduce((s, _, i) => s + 1 / Math.log2(i + 2), 0);
  return dcg / ideal;
};
const media = (xs) => { const v = xs.filter((x) => x != null); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
// «contiene»: cada elemento puede dar alternativas con «|» («4 veces|4 reuniones»); espacios raros normalizados
const contiene = (texto, cs) => { const t = texto.toLowerCase().replace(/[\u00a0\u202f\u2009]/g, " "); return cs.every((c) => c.toLowerCase().split("|").some((x) => t.includes(x))); };
const pct = (x) => (x == null ? "—" : `${Math.round(x * 100)} %`);
const dec = (x) => (x == null ? "—" : x.toFixed(2));

// ---------- vectores ----------
let vectores = null, embeber = null, msVector = null;
if (args.vectores !== "no") {
  const { crearEmbebedor } = await import("../src/lib/rag/embeddings.js");
  const cacheDir = new URL("../.cache-modelos/", import.meta.url).pathname;
  if (!existsSync(cacheDir)) mkdirSync(cacheDir);
  const t0 = performance.now();
  const emb = await crearEmbebedor({ cacheDir });
  const vs = await emb(fr.map(textoIndexable), "fragmento");
  msVector = (performance.now() - t0) / fr.length;
  vectores = new Map(fr.map((f, i) => [f.id, vs[i]]));
  embeber = async (t) => (await emb([t], "consulta"))[0];
}

const CONFIGS = [
  ["BM25 sin cabecera", crearMotor(fr, { usarCabecera: false }), false],
  ["BM25 + cabecera", crearMotor(fr), false],
  ...(vectores ? [["Vectores solos", crearMotor(fr, { vectores, embeber, soloVectores: true }), true], ["Híbrido (RRF)", crearMotor(fr, { vectores, embeber }), true]] : []),
];

const filas = [], detalle = {};
for (const [nombre, motor, conV] of CONFIGS) {
  const porTipo = {};
  for (const q of banco.preguntas) {
    const t0 = performance.now();
    const r = await motor.preguntar(q.pregunta, { hoy, ahora, vectoresActivos: conV });
    const ms = performance.now() - t0;
    const top = r.resultados.map((x) => x.f.id);
    const texto = respuestaSinModelo(r, hoy);
    const fila = {
      id: q.id, tipo: q.tipo, ms,
      r5: recall(top, q.relevantes, 5), h1: acierto(top, q.relevantes, 1), h5: acierto(top, q.relevantes, 5), mrr: mrr(top, q.relevantes), ndcg: ndcg(top, q.relevantes),
      abstiene: q.relevantes.length || q.tipo === "trampa" ? null : (r.abstener || r.dudoso || (r.modo === "agenda" && !r.resultados.length) ? 1 : 0),
      exacta: q.contiene.length ? (contiene(texto, q.contiene) ? 1 : 0) : null,
      texto, top: top.slice(0, 5),
    };
    (porTipo[q.tipo] ??= []).push(fila);
    (detalle[nombre] ??= []).push(fila);
  }
  const todas = Object.values(porTipo).flat();
  filas.push({ nombre, total: resumen(todas), porTipo: Object.fromEntries(Object.entries(porTipo).map(([t, xs]) => [t, resumen(xs)])) });
}
function resumen(xs) {
  return { n: xs.length, r5: media(xs.map((x) => x.r5)), h1: media(xs.map((x) => x.h1)), h5: media(xs.map((x) => x.h5)), mrr: media(xs.map((x) => x.mrr)), ndcg: media(xs.map((x) => x.ndcg)),
    abstiene: media(xs.map((x) => x.abstiene)), exacta: media(xs.map((x) => x.exacta)), ms: media(xs.map((x) => x.ms)) };
}

// Router temporal
const conRuta = banco.preguntas.filter((q) => q.ruta);
const rutaOk = conRuta.filter((q) => { const r = leerTiempo(q.pregunta, hoy); return Object.entries(q.ruta).every(([k, v]) => r[k] === v); });

// ---------- generación (opcional) ----------
let gen = null;
if (args.generar) {
  const { preguntarModelo } = await import("../src/lib/rag/proveedores.js");
  const mejor = CONFIGS.at(-1)[1], conV = CONFIGS.at(-1)[2];
  const recalificar = args.recalificar ? JSON.parse(readFileSync(args.recalificar)).gen : null;
  const espera = recalificar ? 0 : Number(args.espera ?? (args.generar === "ovh" ? 31000 : 2500));
  gen = [];
  for (const q of banco.preguntas) {
    const r = await mejor.preguntar(q.pregunta, { hoy, ahora, vectoresActivos: conV });
    let salida, error = null;
    // --recalificar=archivo.json: vuelve a puntuar respuestas ya guardadas, sin llamar al modelo
    const guardada = recalificar?.find((g) => g.id === q.id);
    if (guardada) { salida = { texto: guardada.texto }; error = guardada.error; }
    else {
      try { salida = await preguntarModelo({ id: args.generar, clave: process.env.CLAVE_IA ?? "", modelo: args.modelo, mensajes: mensajes(q.pregunta, r, hoy) }); }
      catch (e) { error = e.message; }
    }
    const v = validarCitas(salida?.texto ?? "", r.resultados.length);
    const textoBajo = v.texto.toLowerCase();
    const citadosRelevantes = v.citas.filter((n) => q.relevantes.includes(r.resultados[n - 1]?.f.id)).length;
    gen.push({
      id: q.id, tipo: q.tipo, pregunta: q.pregunta, error, texto: v.texto, invalidas: v.invalidas.length, sinCitas: v.sinCitas ? 1 : 0,
      exacta: q.contiene.length ? (contiene(v.texto, q.contiene) ? 1 : 0) : null,
      contradice: contradiceFechas(r, v.citas, hoy) ? 1 : 0,
      // Lo que ve el usuario: si el modelo contradice al código, se enseña la respuesta del código
      exactaFinal: q.contiene.length ? (contiene(contradiceFechas(r, v.citas, hoy) ? respuestaSinModelo(r, hoy) : v.texto, q.contiene) ? 1 : 0) : null,
      abstiene: q.relevantes.length || q.tipo === "trampa" ? null : (v.abstiene ? 1 : 0),
      citaRelevante: q.relevantes.length && !v.abstiene ? (citadosRelevantes ? 1 : 0) : null,
      cae: q.prohibido ? (q.prohibido.some((p) => textoBajo.includes(p)) ? 1 : 0) : null,
    });
    process.stdout.write(`${q.id} ${error ? "error" : "ok"}  `);
    await new Promise((ok) => setTimeout(ok, espera));
  }
  console.log();
}

// ---------- informe ----------
const T = ["agenda", "proxima", "ultima", "contar", "hecho", "nota", "semantica", "sin-respuesta", "trampa"];
let md = `# Resultados del banco del asistente\n\nGenerado por \`app/scripts/evaluar-rag.mjs\` el ${new Date().toISOString().slice(0, 10)}. ${banco.preguntas.length} preguntas sobre la persona de ejemplo (inventada), hoy = ${hoy}. ${fr.length} fragmentos.\n`;
md += `Métricas sin LLM: acierto@1 y @5 (hay al menos un fragmento relevante en los primeros), recall@5, MRR, nDCG@10, abstención correcta en las preguntas sin respuesta y «exacta» (la respuesta escrita por el código contiene el dato esperado).\n\n`;
md += `## Recuperación por configuración\n\n| Configuración | acierto@1 | acierto@5 | recall@5 | MRR | nDCG@10 | abstención | exacta | ms/pregunta |\n|---|---|---|---|---|---|---|---|---|\n`;
for (const f of filas) { const t = f.total; md += `| ${f.nombre} | ${pct(t.h1)} | ${pct(t.h5)} | ${pct(t.r5)} | ${dec(t.mrr)} | ${dec(t.ndcg)} | ${pct(t.abstiene)} | ${pct(t.exacta)} | ${dec(t.ms)} |\n`; }
md += `\n## Por tipo de pregunta (acierto@5 · exacta)\n\n| Tipo (n) | ${filas.map((f) => f.nombre).join(" | ")} |\n|---|${filas.map(() => "---").join("|")}|\n`;
for (const t of T) { const n = filas[0].porTipo[t]?.n; if (!n) continue; md += `| ${t} (${n}) | ${filas.map((f) => { const x = f.porTipo[t]; return t === "sin-respuesta" ? `abstiene ${pct(x.abstiene)}` : `${pct(x.h5)} · ${pct(x.exacta)}`; }).join(" | ")} |\n`; }
md += `\nRouter temporal: ${rutaOk.length} de ${conRuta.length} preguntas con fechas entendidas como se esperaba.\n`;
if (msVector) md += `Vectores: ${dec(msVector)} ms por fragmento al indexar (CPU, Node, ${fr.length} fragmentos).\n`;
if (gen) {
  const ok = gen.filter((g) => !g.error);
  md += `\n## Respuestas del modelo (${args.generar}${args.modelo ? `, ${args.modelo}` : ""})\n\n| Métrica | Valor |\n|---|---|\n`;
  md += `| Respuestas sin error | ${ok.length} de ${gen.length} |\n| Contiene el dato esperado (texto del modelo) | ${pct(media(ok.map((g) => g.exacta)))} |\n| Contiene el dato esperado (lo que ve el usuario, tras la verificación del código) | ${pct(media(ok.map((g) => g.exactaFinal)))} |\n| Cita al menos un fragmento relevante | ${pct(media(ok.map((g) => g.citaRelevante)))} |\n`;
  md += `| Citas inventadas (quitadas por el validador) | ${ok.reduce((s, g) => s + g.invalidas, 0)} |\n| Afirma sin citar | ${ok.reduce((s, g) => s + g.sinCitas, 0)} respuestas |\n| Fecha contraria a la intención (el código la detecta y responde él) | ${ok.reduce((s, g) => s + g.contradice, 0)} |\n| Se abstiene cuando no hay respuesta | ${pct(media(ok.map((g) => g.abstiene)))} |\n| Cae en la trampa del documento | ${ok.filter((g) => g.cae === 1).length} de ${ok.filter((g) => g.cae != null).length} |\n`;
  md += `\n<details><summary>Respuestas</summary>\n\n${gen.map((g) => `- **${g.id}** ${g.pregunta} → ${g.error ? `*error: ${g.error}*` : g.texto.replace(/\n+/g, " ")}`).join("\n")}\n\n</details>\n`;
}
md += `\n<details><summary>Fallos de la mejor configuración (${filas.at(-1).nombre})</summary>\n\n`;
for (const x of detalle[filas.at(-1).nombre].filter((x) => x.h5 === 0 || x.exacta === 0 || x.abstiene === 0)) md += `- **${x.id}** (${x.tipo}): «${x.texto}» · top: ${x.top.join(", ")}\n`;
md += `\n</details>\n`;
const destino = new URL("../../research/rag/", import.meta.url);
writeFileSync(new URL(args.salida ? args.salida + ".md" : args.generar ? "resultados-generacion.md" : "resultados.md", destino), md);
writeFileSync(new URL(args.salida ? args.salida + ".json" : args.generar ? "resultados-generacion.json" : "resultados.json", destino), JSON.stringify({ filas, gen, detalle }, null, 1));
console.log(md);
