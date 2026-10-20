<script>
  import { app, ir, SECTORES, nuevoProyecto } from "../lib/estado.svelte.js";
  import { LISTAS } from "../lib/tareas.js";
  import { CUENTAS, conflictos, eventosDelDia } from "../lib/ejemplo.js";
  import { sumarDias } from "../lib/fechas.js";
  import Icono from "./Icono.svelte";

  let { conteos } = $props();
  const r = $derived(app.ruta);
  const atencion = $derived(conflictos([...eventosDelDia(app.hoy, app.hoy), ...eventosDelDia(sumarDias(app.hoy, 1), app.hoy)]).length + app.tareas.filter((t) => !t.hecha && ((t.cuando && t.cuando < app.hoy) || (t.limite && t.limite <= sumarDias(app.hoy, 3)))).length);
  const cuenta = (id) => (id === "hoy" ? conteos.hoy : id === "atencion" ? atencion : 0);

  let creando = $state(false);
  let nombre = $state("");
  async function crear(e) {
    e.preventDefault();
    if (nombre.trim()) { const p = await nuevoProyecto(nombre.trim()); ir("tareas", "p", p.id); }
    nombre = ""; creando = false;
  }
</script>

<nav class="pa-sidebar" aria-label="Sectores">
  {#each SECTORES as s}
    <button class="pa-side__item" aria-current={r[0] === s.id ? "page" : undefined} onclick={() => ir(s.id)}>
      <Icono n={s.icono} />{s.nombre}{#if cuenta(s.id)}<span class="pa-side__count">{cuenta(s.id)}</span>{/if}
    </button>
    {#if s.id === "tareas" && r[0] === "tareas"}
      {#each LISTAS as l}
        <button class="pa-side__item sub" aria-current={(r[1] ?? "entrada") === l.id && r[1] !== "p" ? "page" : undefined} onclick={() => ir("tareas", l.id)}>
          <Icono n={l.icono} />{l.nombre}{#if conteos[l.id]}<span class="pa-side__count">{conteos[l.id]}</span>{/if}
        </button>
      {/each}
      {#each app.proyectos as p}
        <button class="pa-side__item sub" aria-current={r[1] === "p" && r[2] === p.id ? "page" : undefined} onclick={() => ir("tareas", "p", p.id)}>
          <Icono n="circle" />{p.nombre}
        </button>
      {/each}
      {#if creando}
        <form class="nuevo" onsubmit={crear}>
          <!-- svelte-ignore a11y_autofocus -->
          <input class="pa-field" bind:value={nombre} placeholder="Nombre del proyecto" aria-label="Nombre del proyecto" autofocus onblur={() => !nombre && (creando = false)} onkeydown={(e) => e.key === "Escape" && (creando = false)} />
        </form>
      {:else}
        <button class="pa-side__item sub tenue" onclick={() => (creando = true)}><Icono n="plus" />Nuevo proyecto</button>
      {/if}
    {/if}
  {/each}

  <div class="pa-side__label">cuentas <span class="etiqueta-ejemplo">ejemplo</span></div>
  {#each CUENTAS as c}
    <div class="pa-side__account"><span class="pa-dot pa-dot--{c.color}"></span>{c.nombre}<span class="pa-side__count">{c.proveedor}</span></div>
  {/each}
  <button class="pa-side__item tenue" onclick={() => ir("ajustes", "cuentas")}><Icono n="user-plus" />Añadir cuenta</button>

  <button class="pa-side__item final" aria-current={r[0] === "ajustes" ? "page" : undefined} onclick={() => ir("ajustes")}><Icono n="settings" />Ajustes</button>
</nav>

<style>
  .sub { padding-left: 30px; font-size: 13px; }
  .tenue { color: var(--text-3); font-size: 13px; }
  .final { margin-top: auto; }
  .nuevo { padding: 2px 4px 2px 26px; }
  .nuevo .pa-field { height: 30px; font-size: 13px; }
  .pa-side__label { display: flex; align-items: center; gap: 6px; }
</style>
