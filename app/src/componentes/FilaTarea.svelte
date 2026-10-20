<script>
  import { app, alternar } from "../lib/estado.svelte.js";
  import { corta, hora, duracion, distancia } from "../lib/fechas.js";
  import Icono from "./Icono.svelte";
  let { t, seleccionada = false, alElegir = () => {}, mostrarDia = true } = $props();
  const proyecto = $derived(app.proyectos.find((p) => p.id === t.proyectoId));
  const meta = $derived([
    t.inicio !== null && t.inicio !== undefined ? hora(t.inicio) : null,
    mostrarDia && t.cuando ? (t.cuando < app.hoy ? `atrasada · ${corta(t.cuando)}` : corta(t.cuando)) : null,
    proyecto?.nombre,
  ].filter(Boolean).join(" · "));
</script>

<li class="pa-row pa-row--hover" class:pa-row--done={t.hecha} aria-selected={seleccionada ? "true" : undefined}>
  <button class="pa-check" role="checkbox" aria-checked={t.hecha ? "true" : "false"} aria-label={t.hecha ? `Desmarcar ${t.titulo}` : `Completar ${t.titulo}`} onclick={() => alternar(t)}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
  </button>
  <button class="cuerpo" onclick={() => alElegir(t)} aria-label="Abrir {t.titulo}">
    <span class="pa-row__main"><span class="pa-row__title">{t.titulo}</span>{#if meta}<span class="pa-row__meta">{meta}</span>{/if}</span>
    <span class="pa-row__end">
      {#if t.limite}<span class="limite"><Icono n="flag" tam={13} />{distancia(t.limite, app.hoy)}</span>{/if}
      {#if t.duracionMin}<span>{duracion(t.duracionMin)}</span>{/if}
      {#if t.notas}<Icono n="file-text" tam={13} />{/if}
    </span>
  </button>
</li>

<style>
  .cuerpo { all: unset; flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; cursor: pointer; }
  .cuerpo:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: 4px; }
  .limite { display: inline-flex; align-items: center; gap: 4px; color: var(--danger); font-weight: 500; }
</style>
