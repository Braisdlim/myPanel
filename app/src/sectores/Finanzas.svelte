<script>
  import { app, ir } from "../lib/estado.svelte.js";
  import { FONDOS, serie, euros, porcentaje } from "../lib/ejemplo.js";
  import { sumarDias, corta, sumarMeses } from "../lib/fechas.js";
  import Dos from "../componentes/Dos.svelte";
  import Icono from "../componentes/Icono.svelte";

  const RANGOS = [["1S", 7], ["1M", 30], ["3M", 91], ["1A", 365], ["3A", 1095]];
  let rango = $state("1A");
  const ultimo = $derived(sumarDias(app.hoy, -1));
  const datos = $derived(FONDOS.map((f) => {
    const s = serie(f, ultimo);
    const v = s.at(-1).v, prev = s.at(-2).v;
    return { ...f, s, vl: v, valor: v * f.participaciones, dia: v / prev - 1, fecha: s.at(-1).dia };
  }));
  const total = $derived(datos.reduce((a, f) => a + f.valor, 0));
  const aportado = $derived(datos.reduce((a, f) => a + f.aportado, 0));
  const fondo = $derived(datos.find((f) => f.id === app.ruta[1]));

  function tramo(s, dias) { const desde = sumarDias(ultimo, -dias); return s.filter((p) => p.dia >= desde); }
  function chispa(s) {
    const t = tramo(s, 30), vs = t.map((p) => p.v), mn = Math.min(...vs), mx = Math.max(...vs);
    return t.map((p, i) => `${(i / (t.length - 1)) * 56},${18 - ((p.v - mn) / (mx - mn || 1)) * 16}`).join(" ");
  }
  const grafico = $derived.by(() => {
    if (!fondo) return null;
    const dias = RANGOS.find(([r]) => r === rango)[1];
    const t = tramo(fondo.s, dias);
    const vs = t.map((p) => p.v), mn = Math.min(...vs), mx = Math.max(...vs), W = 640, H = 220, pad = (mx - mn) * 0.1 || 1;
    const y = (v) => H - ((v - (mn - pad)) / (mx - mn + 2 * pad)) * H;
    const pts = t.map((p, i) => [(i / (t.length - 1)) * W, y(p.v)]);
    const linea = pts.map(([x, yy]) => `${x.toFixed(1)},${yy.toFixed(1)}`).join(" ");
    const cambio = t.at(-1).v / t[0].v - 1;
    return { W, H, linea, area: `0,${H} ${linea} ${W},${H}`, base: y(t[0].v), cambio, desde: t[0].dia, max: Math.max(...vs), min: Math.min(...vs) };
  });
</script>

{#snippet principal()}
  {#if fondo}
    <button class="pa-btn pa-btn--plain volver" onclick={() => ir("finanzas")}><Icono n="chevron-left" />Mis fondos</button>
    <div class="cabecera"><div><h1>{fondo.nombre} <span class="etiqueta-ejemplo">ejemplo</span></h1><p>{fondo.tipo} · {fondo.isin}</p></div></div>
    <div class="pa-figure__value">{euros(fondo.vl, 4).replace(" €", "")} <span class="unidad">€ por participación</span></div>
    <div class="pa-figure__row">
      <span class="pa-delta pa-delta--solid {grafico.cambio >= 0 ? 'pa-delta--up' : 'pa-delta--down'}">{porcentaje(grafico.cambio)}</span>
      <span class="pa-muted">desde el {corta(grafico.desde)}</span>
    </div>
    <div class="pa-figure__src">Valor liquidativo del {corta(fondo.fecha)} · los fondos publican con un día de retraso</div>
    <div class="pa-seg rangos" role="group" aria-label="Periodo">{#each RANGOS as [r]}<button aria-pressed={rango === r ? "true" : "false"} onclick={() => (rango = r)}>{r}</button>{/each}</div>
    <svg class="pa-chart {grafico.cambio < 0 ? 'pa-chart--down' : ''}" viewBox="0 0 {grafico.W} {grafico.H}" role="img" aria-label="Evolución en {rango}: {porcentaje(grafico.cambio)}">
      <polygon class="area" points={grafico.area} />
      <line class="baseline" x1="0" x2={grafico.W} y1={grafico.base} y2={grafico.base} />
      <polyline class="line" points={grafico.linea} />
    </svg>
    <dl class="pa-stats datos">
      <div><dt>tu valor</dt><dd>{euros(fondo.valor)}</dd></div>
      <div><dt>aportado</dt><dd>{euros(fondo.aportado)}</dd></div>
      <div><dt>rentabilidad</dt><dd class={fondo.valor >= fondo.aportado ? "pa-up" : "pa-down"}>{porcentaje(fondo.valor / fondo.aportado - 1)}</dd></div>
      <div><dt>máximo del periodo</dt><dd>{euros(grafico.max, 4)}</dd></div>
      <div><dt>participaciones</dt><dd>{fondo.participaciones.toLocaleString("es-ES")}</dd></div>
    </dl>
  {:else}
    <div class="cabecera"><div><h1>Mis fondos <span class="etiqueta-ejemplo">ejemplo</span></h1><p>Fondos inventados para ver cómo será. Tus datos llegarán en la fase de Finanzas.</p></div></div>
    <div class="pa-figure__label">patrimonio</div>
    <div class="pa-figure__value">{euros(total)}</div>
    <div class="pa-figure__row"><span class="pa-delta {total >= aportado ? 'pa-delta--up' : 'pa-delta--down'}">{porcentaje(total / aportado - 1)}</span><span class="pa-muted">sobre {euros(aportado, 0)} aportados</span></div>
    <ul class="pa-list pa-list--lines lista">
      {#each datos as f}
        <li class="pa-row pa-row--hover">
          <button class="fila" onclick={() => ir("finanzas", f.id)}>
            <span class="pa-row__main"><span class="pa-row__title">{f.nombre}</span><span class="pa-row__meta">{euros(f.valor)}</span></span>
            <svg class="pa-spark {f.dia >= 0 ? 'pa-up' : 'pa-down'}" viewBox="0 0 56 20" aria-hidden="true"><polyline points={chispa(f.s)} /></svg>
            <span class="pa-delta pa-delta--solid {f.dia >= 0 ? 'pa-delta--up' : 'pa-delta--down'}">{porcentaje(f.dia)}</span>
          </button>
        </li>
      {/each}
    </ul>
    <p class="pie-ejemplo">Variación del último día publicado ({corta(ultimo)}). Pauta no recomienda comprar ni vender: solo enseña datos y los avisos que tú definas.</p>
  {/if}
{/snippet}

{#snippet lateral()}
  <div class="pa-label">de dónde saldrán los datos</div>
  <ul class="pa-insp__rows">
    <li><Icono n="trending-up" /><span>Valor liquidativo diario<small>EODHD (gratis) por ISIN, cuando lleguemos a Finanzas</small></span></li>
    <li><Icono n="download" /><span>Tus movimientos<small>Ficheros que descargas de tu banco o bróker</small></span></li>
    <li><Icono n="lock" /><span>Cifrados en tu dispositivo<small>Nadie más puede leerlos (D-041)</small></span></li>
  </ul>
{/snippet}

<Dos {principal} {lateral} />

<style>
  .volver { margin: -6px 0 4px -8px; }
  .unidad { font-size: 14px; font-weight: 400; color: var(--text-2); letter-spacing: 0; }
  .rangos { margin: 18px 0 12px; }
  .datos { margin-top: 20px; }
  .lista { margin: 18px -12px 0; }
  .fila { all: unset; display: flex; align-items: center; gap: 14px; flex: 1; cursor: pointer; }
  .fila:focus-visible { outline: 2px solid var(--focus); outline-offset: 4px; border-radius: 4px; }
  .pa-figure__value { margin-top: 2px; }
</style>
