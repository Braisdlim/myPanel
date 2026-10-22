<script module>
  let abiertas = 0; // hojas abiertas a la vez: la app sigue inerte hasta que se cierra la última
</script>

<script>
  // Hoja (móvil) o diálogo (escritorio) modal, según el patrón de diálogo modal de WAI-ARIA (APG, W3C):
  // - el foco entra (al elemento con data-foco o a la propia hoja) y vuelve al botón que la abrió al cerrar;
  // - lo de detrás queda inerte (`inert`), así Tab no sale de la hoja y el lector de pantalla no lo lee;
  // - se cierra con Esc, tocando fuera y con «atrás» de Android (CloseWatcher, Chrome 126; donde no existe, Esc).
  // Se monta en <body> para que el `inert` de la app no la alcance.
  import { onMount } from "svelte";

  let { etiqueta, alCerrar, clase = "", estilo = "", children } = $props();
  let hoja;
  let cerrada = false;
  const cerrar = () => { if (!cerrada) { cerrada = true; alCerrar(); } };

  function aBody(nodo) {
    document.body.appendChild(nodo);
    return { destroy: () => nodo.remove() };
  }

  onMount(() => {
    const anterior = document.activeElement;
    const app = document.querySelector(".app");
    abiertas++;
    app?.setAttribute("inert", "");
    (hoja.querySelector("[data-foco]") ?? hoja).focus({ preventScroll: true });
    let vigilante = null;
    try { if ("CloseWatcher" in window) { vigilante = new CloseWatcher(); vigilante.onclose = cerrar; } } catch { vigilante = null; }
    const tecla = (e) => {
      if (e.key === "Escape" && !vigilante) { e.preventDefault(); cerrar(); }
      // Tab y Mayús+Tab dan la vuelta dentro de la hoja (APG): del último al primero y al revés
      if (e.key === "Tab") {
        const enfocables = [...hoja.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])")].filter((x) => x.offsetParent !== null);
        if (!enfocables.length) return;
        const [primero, ultimo] = [enfocables[0], enfocables.at(-1)];
        const dentro = hoja.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === primero || !dentro)) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && (document.activeElement === ultimo || !dentro)) { e.preventDefault(); primero.focus(); }
      }
    };
    addEventListener("keydown", tecla);
    return () => {
      cerrada = true;
      vigilante?.destroy();
      removeEventListener("keydown", tecla);
      if (--abiertas === 0) app?.removeAttribute("inert");
      if (anterior instanceof HTMLElement && anterior.isConnected) anterior.focus({ preventScroll: true });
    };
  });
</script>

<div class="capa" role="presentation" use:aBody onclick={(e) => e.target === e.currentTarget && cerrar()}>
  <div bind:this={hoja} class="capa__dialogo {clase}" style={estilo} role="dialog" aria-modal="true" aria-label={etiqueta} tabindex="-1">
    {@render children()}
  </div>
</div>

<style>
  [role="dialog"]:focus { outline: none; }
</style>
