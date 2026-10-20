<script>
  import { app, ir, guardarTarea } from "../lib/estado.svelte.js";
  import { eventosEntre, conflictos, cuenta, FONDOS, serie, porcentaje } from "../lib/ejemplo.js";
  import { sumarDias, corta, distancia, rango } from "../lib/fechas.js";
  import Dos from "../componentes/Dos.svelte";
  import Icono from "../componentes/Icono.svelte";

  const choques = $derived(conflictos(eventosEntre(app.hoy, sumarDias(app.hoy, 7), app.hoy)));
  const atrasadas = $derived(app.tareas.filter((t) => !t.hecha && t.cuando && t.cuando < app.hoy));
  const vencen = $derived(app.tareas.filter((t) => !t.hecha && t.limite && t.limite <= sumarDias(app.hoy, 3)).sort((a, b) => a.limite.localeCompare(b.limite)));
  const caida = $derived.by(() => {
    const f = FONDOS[1]; const s = serie(f, sumarDias(app.hoy, -1)).slice(-60);
    const max = s.reduce((a, p) => (p.v > a.v ? p : a)); const ult = s.at(-1);
    return { f, cambio: ult.v / max.v - 1, desde: max.dia };
  });
  const aHoy = (t) => guardarTarea({ ...JSON.parse(JSON.stringify(t)), cuando: app.hoy });
</script>

{#snippet principal()}
  <div class="cabecera"><div><h1>Pide atención</h1><p>Lo que conviene mirar ahora. Nada se cambia sin que lo decidas tú.</p></div></div>
  <div class="lista">
    {#each choques as [a, b]}
      <div class="pa-alert">
        <span class="pa-dot pa-dot--danger"></span>
        <span class="pa-alert__title">{distancia(a.dia, app.hoy)[0].toUpperCase() + distancia(a.dia, app.hoy).slice(1)} se solapan dos planes</span>
        <span class="pa-alert__text">{a.titulo} ({cuenta(a.cuenta).nombre}, {rango(a.inicio, a.fin)}) y {b.titulo} ({cuenta(b.cuenta).nombre}, {rango(b.inicio, b.fin)}) · {corta(a.dia)}</span>
        <span class="pa-alert__src">Ninguna de las dos cuentas lo ve por separado · calendarios de ejemplo</span>
        <span class="pa-alert__actions"><button class="pa-btn pa-btn--sm" onclick={() => ir("calendario", "dia", a.dia)}>Ver el día</button></span>
      </div>
    {/each}
    {#each atrasadas as t (t.id)}
      <div class="pa-alert">
        <span class="pa-dot pa-dot--attention"></span>
        <span class="pa-alert__title">«{t.titulo}» está atrasada</span>
        <span class="pa-alert__text">Era para el {corta(t.cuando)} ({distancia(t.cuando, app.hoy)}).</span>
        <span class="pa-alert__actions"><button class="pa-btn pa-btn--sm" onclick={() => aHoy(t)}>Pasar a hoy</button><button class="pa-btn pa-btn--plain pa-btn--sm" onclick={() => ir("tareas", "hoy")}>Abrir</button></span>
      </div>
    {/each}
    {#each vencen as t (t.id)}
      <div class="pa-alert">
        <span class="pa-dot pa-dot--danger"></span>
        <span class="pa-alert__title">«{t.titulo}» vence {distancia(t.limite, app.hoy)}</span>
        <span class="pa-alert__text">Fecha límite: {corta(t.limite)}.</span>
        <span class="pa-alert__actions"><button class="pa-btn pa-btn--sm" onclick={() => aHoy(t)}>Hacer hoy</button></span>
      </div>
    {/each}
    <div class="pa-alert">
      <span class="pa-dot pa-dot--attention"></span>
      <span class="pa-alert__title">{caida.f.nombre}: {porcentaje(caida.cambio)} desde el máximo <span class="etiqueta-ejemplo">ejemplo</span></span>
      <span class="pa-alert__text">Máximo de los últimos 60 días el {corta(caida.desde)}. Es un aviso de ejemplo; las reglas las definirás tú.</span>
      <span class="pa-alert__actions"><button class="pa-btn pa-btn--sm" onclick={() => ir("finanzas", caida.f.id)}>Ver el fondo</button></span>
    </div>
    {#if !choques.length && !atrasadas.length && !vencen.length}
      <p class="pa-faint">Nada más pendiente.</p>
    {/if}
  </div>
{/snippet}

<Dos {principal} />

<style>
  .lista { display: flex; flex-direction: column; gap: 10px; }
</style>
