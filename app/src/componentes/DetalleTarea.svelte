<script>
  import { app, guardarTarea, borrarTarea } from "../lib/estado.svelte.js";
  import { sumarDias, corta, distancia } from "../lib/fechas.js";
  import { nuevoId } from "../lib/almacen.js";
  import Icono from "./Icono.svelte";

  let { t, alCerrar = () => {} } = $props();
  const guardar = (cambios) => guardarTarea({ ...JSON.parse(JSON.stringify(t)), ...cambios });
  const aHora = (min) => (min === null || min === undefined ? "" : `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`);
  const deHora = (v) => (v ? Number(v.slice(0, 2)) * 60 + Number(v.slice(3, 5)) : null);
  let nuevoPaso = $state("");
  const sugerencias = $derived([["Hoy", app.hoy], ["Mañana", sumarDias(app.hoy, 1)], ["En 7 días", sumarDias(app.hoy, 7)]]);

  function paso(e) {
    e.preventDefault();
    if (!nuevoPaso.trim()) return;
    guardar({ comprobacion: [...t.comprobacion, { id: nuevoId(), texto: nuevoPaso.trim(), hecha: false }] });
    nuevoPaso = "";
  }
  function marcarPaso(p) { guardar({ comprobacion: t.comprobacion.map((x) => (x.id === p.id ? { ...x, hecha: !x.hecha } : x)) }); }
  async function borrar() { if (confirm(`¿Borrar «${t.titulo}»? No se puede deshacer.`)) { await borrarTarea(t); alCerrar(); } }
</script>

<div class="detalle">
  <div class="arriba">
    <span class="pa-label">tarea{t.hecha ? " · hecha" : ""}</span>
    <button class="pa-btn pa-btn--icon" aria-label="Cerrar el detalle" onclick={alCerrar}><Icono n="x" /></button>
  </div>
  <input class="titulo" value={t.titulo} aria-label="Título" onchange={(e) => e.currentTarget.value.trim() && guardar({ titulo: e.currentTarget.value.trim() })} />
  <textarea class="notas" rows="3" placeholder="Notas" aria-label="Notas" value={t.notas} onchange={(e) => guardar({ notas: e.currentTarget.value })}></textarea>

  <ul class="pasos">
    {#each t.comprobacion as p (p.id)}
      <li><button class="pa-check" role="checkbox" aria-checked={p.hecha ? "true" : "false"} aria-label={p.texto} onclick={() => marcarPaso(p)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg></button><span class:hecho={p.hecha}>{p.texto}</span></li>
    {/each}
    <li><form onsubmit={paso}><input class="paso" bind:value={nuevoPaso} placeholder="+ Añadir paso" aria-label="Añadir paso" /></form></li>
  </ul>

  <ul class="pa-insp__rows">
    <li><Icono n="calendar" /><span>
      <label for="cuando">Cuándo</label>
      <span class="fila"><input id="cuando" class="pa-field" type="date" value={t.cuando ?? ""} onchange={(e) => guardar({ cuando: e.currentTarget.value || null })} /></span>
      <span class="fichas">
        {#each sugerencias as [n, d]}<button class="pa-chip" aria-pressed={t.cuando === d ? "true" : "false"} onclick={() => guardar({ cuando: d })}>{n}</button>{/each}
        <button class="pa-chip" aria-pressed={!t.cuando ? "true" : "false"} onclick={() => guardar({ cuando: null, inicio: null })}>Sin fecha</button>
      </span>
      {#if t.cuando}<small>{corta(t.cuando)} · {distancia(t.cuando, app.hoy)}</small>{/if}
    </span></li>
    <li><Icono n="clock" /><span>
      <label for="hora">Hora y duración</label>
      <span class="fila">
        <input id="hora" class="pa-field" type="time" value={aHora(t.inicio)} disabled={!t.cuando} onchange={(e) => guardar({ inicio: deHora(e.currentTarget.value) })} />
        <select class="pa-field" aria-label="Duración" value={String(t.duracionMin ?? "")} onchange={(e) => guardar({ duracionMin: e.currentTarget.value ? Number(e.currentTarget.value) : null })}>
          <option value="">sin duración</option>
          {#each [5, 10, 15, 20, 30, 45, 60, 90, 120, 180] as m}<option value={String(m)}>{m < 60 ? `${m} min` : `${m / 60} h`.replace(".5 h", " h 30 min")}</option>{/each}
        </select>
      </span>
      <small>La duración sirve para planificar el día.</small>
    </span></li>
    <li><Icono n="flag" /><span>
      <label for="limite">Fecha límite</label>
      <span class="fila"><input id="limite" class="pa-field" type="date" value={t.limite ?? ""} onchange={(e) => guardar({ limite: e.currentTarget.value || null })} /></span>
      <small>Aparece en «Pide atención» 3 días antes.</small>
    </span></li>
    <li><Icono n="folder" /><span>
      <label for="lista">Dónde</label>
      <span class="fila">
        <select id="lista" class="pa-field" value={t.lista} onchange={(e) => guardar({ lista: e.currentTarget.value })}>
          <option value="entrada">Entrada</option><option value="cualquier">En cualquier momento</option><option value="algun">Algún día</option>
        </select>
        <select class="pa-field" aria-label="Proyecto" value={t.proyectoId ?? ""} onchange={(e) => guardar({ proyectoId: e.currentTarget.value || null })}>
          <option value="">sin proyecto</option>
          {#each app.proyectos as p}<option value={p.id}>{p.nombre}</option>{/each}
        </select>
      </span>
    </span></li>
  </ul>
  <div class="pa-insp__actions">
    <button class="pa-btn pa-btn--danger" onclick={borrar}><Icono n="trash-2" />Borrar</button>
  </div>
</div>

<style>
  .arriba { display: flex; align-items: center; justify-content: space-between; margin: -6px -6px 0 0; }
  .titulo, .notas, .paso { width: 100%; box-sizing: border-box; border: 0; background: transparent; color: var(--text); font-family: var(--font-sans); outline: none; }
  .titulo { font-size: 17px; line-height: 22px; font-weight: 600; padding: 2px 0; }
  .notas { margin-top: 6px; font-size: 13px; line-height: 18px; color: var(--text-2); resize: vertical; padding: 0; }
  .titulo:focus-visible, .notas:focus-visible, .paso:focus-visible { box-shadow: 0 0 0 2px var(--focus); border-radius: 4px; }
  .pasos { list-style: none; margin: 8px 0 0; padding: 0; }
  .pasos li { display: flex; align-items: center; gap: 10px; min-height: 30px; font-size: 13px; }
  .pasos .pa-check { width: 14px; height: 14px; }
  .pasos .pa-check svg { width: 10px; height: 10px; }
  .hecho { color: var(--text-3); text-decoration: line-through; }
  .paso { font-size: 13px; color: var(--text-2); }
  .paso::placeholder { color: var(--text-3); }
  label { display: block; font-weight: 500; }
  .fila { display: flex; gap: 6px; margin-top: 6px; }
  .fila .pa-field { height: 30px; font-size: 13px; padding: 0 8px; }
  .fichas { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  small { margin-top: 4px; }
  @media (max-width: 640px) {
    .titulo { font-size: 22px; line-height: 28px; }
    .notas, .pasos li, .paso { font-size: 15px; line-height: 20px; }
    .pasos li { min-height: 44px; }
    .fila .pa-field { height: 44px; font-size: 16px; }
    :global(.pa-insp__rows) li { font-size: 15px; line-height: 20px; }
  }
</style>
