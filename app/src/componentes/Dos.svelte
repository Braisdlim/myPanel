<script>
  // Contenido + inspector a la derecha en el escritorio. En el móvil el inspector va debajo o se oculta.
  let { principal, lateral = null, enMovil = "debajo", ancha = false } = $props();
</script>

<div class="dos" class:sin-lateral={!lateral}>
  <div class="dos__main"><div class="vista" class:vista--ancha={ancha}>{@render principal()}</div></div>
  {#if lateral}
    <aside class="pa-inspector dos__lat" class:oculto-movil={enMovil === "oculto"} aria-label="Detalle">{@render lateral()}</aside>
  {/if}
</div>

<style>
  .dos { display: grid; grid-template-columns: minmax(0, 1fr) var(--inspector-width); height: 100%; min-height: 0; }
  .dos.sin-lateral { grid-template-columns: minmax(0, 1fr); }
  .dos__main { min-width: 0; overflow: auto; }
  .dos__lat { width: auto; overflow: auto; }
  @media (max-width: 640px) {
    .dos { display: block; height: auto; overflow: visible; }
    .dos__lat { border-left: 0; border-top: 1px solid var(--line); padding: 16px; }
    .oculto-movil { display: none; }
  }
</style>
