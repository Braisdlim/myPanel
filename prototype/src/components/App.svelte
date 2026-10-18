<script>
  import { onMount } from "svelte";
  import CompA from "./CompA.svelte";
  import CompB from "./CompB.svelte";
  import CompC from "./CompC.svelte";
  import Sheet from "./Sheet.svelte";
  import Capture from "./Capture.svelte";
  import Conflict from "./Conflict.svelte";
  import Palette from "./Palette.svelte";
  import ReviewBar from "./ReviewBar.svelte";
  import { ui, initFromUrl, syncUrl, applyTheme, go } from "../lib/ui.svelte.js";

  const SAMPLE = "cena con Ana el viernes a las nueve y media";
  let ready = $state(false);

  onMount(() => {
    initFromUrl();
    ready = true;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); go(ui.comp === "c" ? "busqueda" : "captura"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  $effect(() => {
    if (!ready) return;
    ui.comp; ui.screen; ui.estado; ui.theme; ui.font;
    applyTheme();
    syncUrl();
  });
</script>

{#if ready}
  {#if ui.comp === "a"}<CompA />{:else if ui.comp === "b"}<CompB />{:else}<CompC />{/if}

  {#if ui.screen === "captura"}
    {#if ui.comp === "c"}
      <Sheet label="Apuntar o buscar" variant="palette" onclose={() => go("hoy")}><Palette mode="apuntar" initial={SAMPLE} /></Sheet>
    {:else}
      <Sheet label="Apuntar algo" title="Apuntar algo" onclose={() => go("hoy")}><Capture variant={ui.comp} initial={SAMPLE} onsaved={() => go("hoy")} /></Sheet>
    {/if}
  {:else if ui.screen === "busqueda" && ui.comp === "c"}
    <Sheet label="Apuntar o buscar" variant="palette" onclose={() => go("hoy")}><Palette mode="buscar" /></Sheet>
  {/if}

  {#if ui.estado === "conflicto" && ui.screen === "hoy"}
    <Sheet label="Conflicto el viernes" onclose={() => (ui.estado = "normal")}><Conflict /></Sheet>
  {/if}

  {#if ui.toast}<div class="toast" role="status">{ui.toast}</div>{/if}
  {#if !ui.bare}<ReviewBar />{/if}
{/if}

<style>
  .toast {
    position: fixed; left: 50%; bottom: calc(150px + env(safe-area-inset-bottom)); transform: translateX(-50%);
    z-index: 70; max-width: min(92vw, 460px); padding: 12px 18px; border-radius: 14px;
    background: var(--text); color: var(--bg); font-size: var(--fs-meta); font-weight: 600; line-height: var(--lh-meta);
    box-shadow: 0 12px 30px rgb(0 0 0 / .35); animation: t var(--t-med) var(--ease-out);
  }
  @keyframes t { from { opacity: 0; transform: translate(-50%, 8px); } }
  @media (min-width: 1024px) { .toast { bottom: 32px; } }
</style>
