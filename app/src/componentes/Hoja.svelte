<script module>
  let abiertas = 0; // hojas abiertas a la vez: la app sigue inerte hasta que se cierra la última
</script>

<script>
  // Hoja (móvil) o diálogo (escritorio) modal, según el patrón de diálogo modal de WAI-ARIA (APG, W3C):
  // - el foco entra (al elemento con data-foco o a la propia hoja) y vuelve al botón que la abrió al cerrar;
  // - lo de detrás queda inerte (`inert`), así Tab no sale de la hoja y el lector de pantalla no lo lee;
  // - se cierra con Esc, tocando fuera y con «atrás» de Android (CloseWatcher, Chrome 126; donde no existe, Esc).
  // Movimiento (D-057): entra con CSS (estilos.css) y sale con una transición de Svelte, así se anima también cuando
  // la cierra un botón de fuera. En el móvil se puede bajar con el dedo; si se suelta lejos o rápido, se cierra.
  // Se monta en <body> para que el `inert` de la app no la alcance.
  import { onMount } from "svelte";

  let { etiqueta, alCerrar, clase = "", estilo = "", children } = $props();
  let hoja;
  let cerrada = false;
  let arrastre = $state(0); // px bajados con el dedo
  let soltando = $state(false); // vuelve a su sitio con transición
  const cerrar = () => { if (!cerrada) { cerrada = true; alCerrar(); } };

  const sinMovimiento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esMovil = () => matchMedia("(max-width: 640px)").matches;
  // Salidas: el fondo se aclara y la hoja baja (móvil, desde donde la dejó el dedo) o se desvanece (escritorio)
  const salidaFondo = () => ({ duration: sinMovimiento() ? 0 : 220, css: (t) => `opacity: ${t}` });
  const salidaHoja = () => {
    const desde = arrastre;
    if (esMovil()) return { duration: sinMovimiento() ? 0 : 220, easing: (t) => t * (2 - t), css: (t) => `transform: translateY(calc(${desde}px + ${(1 - t) * 100}%))` };
    return { duration: sinMovimiento() ? 0 : 160, css: (t) => `opacity: ${t}; transform: translateY(${(1 - t) * 8}px) scale(${0.98 + 0.02 * t})` };
  };

  // Arrastrar hacia abajo para cerrar (móvil): solo si la hoja está arriba del todo, para no robar su desplazamiento
  function arrastrable(nodo) {
    let y0 = 0, t0 = 0, activo = false;
    const empieza = (e) => {
      if (!esMovil() || e.touches.length !== 1) return;
      y0 = e.touches[0].clientY; t0 = performance.now(); activo = nodo.scrollTop <= 0; soltando = false;
    };
    const mueve = (e) => {
      if (!activo) return;
      const dy = e.touches[0].clientY - y0;
      if (dy <= 0) { arrastre = 0; return; } // hacia arriba: que desplace su contenido
      e.preventDefault();
      arrastre = dy;
    };
    const termina = () => {
      if (!activo) return;
      activo = false;
      const velocidad = arrastre / Math.max(1, performance.now() - t0); // px/ms
      if (arrastre > 110 || (arrastre > 30 && velocidad > 0.6)) cerrar();
      else { soltando = true; arrastre = 0; }
    };
    nodo.addEventListener("touchstart", empieza, { passive: true });
    nodo.addEventListener("touchmove", mueve, { passive: false });
    nodo.addEventListener("touchend", termina);
    nodo.addEventListener("touchcancel", termina);
    return { destroy() { nodo.removeEventListener("touchstart", empieza); nodo.removeEventListener("touchmove", mueve); nodo.removeEventListener("touchend", termina); nodo.removeEventListener("touchcancel", termina); } };
  }

  // A <body>. Al destruirla hay que quitarla a mano: Svelte quita el tramo de la pantalla donde nació y, si esa
  // pantalla se cierra entera (cambiar de pantalla con la hoja abierta), la hoja se quedaría huérfana tapándolo todo.
  // Si hay salida animada, Svelte llama a destroy al terminarla.
  function aBody(nodo) { document.body.appendChild(nodo); return { destroy: () => nodo.remove() }; }

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

<div class="capa" role="presentation" use:aBody out:salidaFondo onclick={(e) => e.target === e.currentTarget && cerrar()}>
  <div bind:this={hoja} use:arrastrable out:salidaHoja class="capa__dialogo {clase}" class:soltando
    style="{estilo}{arrastre ? `; transform: translateY(${arrastre}px)` : ''}" role="dialog" aria-modal="true" aria-label={etiqueta} tabindex="-1">
    {@render children()}
  </div>
</div>

<style>
  [role="dialog"]:focus { outline: none; }
  .soltando { transition: transform 220ms cubic-bezier(0.32, 0.72, 0, 1); }
  @media (prefers-reduced-motion: reduce) { .soltando { transition: none; } }
</style>
