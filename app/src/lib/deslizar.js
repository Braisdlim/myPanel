// Deslizar de lado con el dedo para pasar de día, semana, mes o año (D-057), como en Calendario de Apple y Fantastical.
// - Solo con el dedo (en el escritorio están ‹ › y las flechas del teclado).
// - Deja 24 px en cada borde para el gesto «atrás» de Android, y lo vertical para desplazar (touch-action: pan-y).
// - El contenido sigue al dedo; al soltar lejos o rápido, sale hacia ese lado y el nuevo entra desde el otro.
// - Con «reducir movimiento» cambia sin animación.
const BORDE = 24;
const CURVA = "cubic-bezier(0.2, 0.8, 0.2, 1)"; // «salida suave» de la guía del sistema

const sinMovimiento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const dosFotogramas = () => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));

export function deslizar(nodo, opciones) {
  let op = opciones;
  let id = null, x0 = 0, y0 = 0, t0 = 0, dx = 0, horizontal = null, animacion = null;
  nodo.style.touchAction = "pan-y";

  const pintar = (x) => {
    nodo.style.transform = x ? `translateX(${x}px)` : "";
    nodo.style.opacity = x ? String(1 - Math.min(0.4, Math.abs(x) / nodo.clientWidth)) : "";
  };

  function abajo(e) {
    if (e.pointerType !== "touch" || id !== null) return;
    if (e.clientX < BORDE || e.clientX > innerWidth - BORDE) return; // el borde es del sistema («atrás»)
    if (e.target.closest?.("input, textarea, select, [data-sin-deslizar]")) return;
    animacion?.cancel();
    id = e.pointerId; x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); dx = 0; horizontal = null;
  }

  function mueve(e) {
    if (e.pointerId !== id) return;
    const mx = e.clientX - x0, my = e.clientY - y0;
    if (horizontal === null) {
      if (Math.abs(mx) < 10 && Math.abs(my) < 10) return;
      horizontal = Math.abs(mx) > Math.abs(my) * 1.3;
      if (!horizontal) { id = null; return; } // es un desplazamiento vertical: no es nuestro
      nodo.setPointerCapture?.(id);
    }
    dx = mx;
    pintar(dx);
  }

  async function arriba(e) {
    if (e.pointerId !== id) return;
    id = null;
    if (!horizontal) return;
    const velocidad = Math.abs(dx) / Math.max(1, performance.now() - t0); // px/ms
    const pasa = Math.abs(dx) > nodo.clientWidth * 0.22 || (Math.abs(dx) > 40 && velocidad > 0.45);
    if (!pasa) {
      // No llega: vuelve a su sitio
      const desde = dx;
      pintar(0);
      if (!sinMovimiento()) animacion = nodo.animate([{ transform: `translateX(${desde}px)` }, { transform: "none" }], { duration: 220, easing: CURVA });
      return;
    }
    const sentido = dx < 0 ? 1 : -1; // hacia la izquierda = siguiente
    if (!sinMovimiento()) {
      animacion = nodo.animate([{ transform: `translateX(${dx}px)`, opacity: nodo.style.opacity || 1 }, { transform: `translateX(${-sentido * nodo.clientWidth * 0.4}px)`, opacity: 0 }],
        { duration: 140, easing: CURVA, fill: "forwards" });
      await animacion.finished.catch(() => {});
    }
    const cambio = new Promise((ok) => addEventListener("hashchange", ok, { once: true }));
    (sentido > 0 ? op.alSiguiente : op.alAnterior)();
    await Promise.race([cambio, new Promise((ok) => setTimeout(ok, 300))]);
    await dosFotogramas(); // ya está pintado lo nuevo
    animacion?.cancel();
    pintar(0);
    if (!sinMovimiento()) animacion = nodo.animate([{ transform: `translateX(${sentido * 40}px)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 220, easing: CURVA });
  }

  function cancelar(e) {
    if (e.pointerId !== id) return;
    id = null;
    if (horizontal) pintar(0);
  }

  nodo.addEventListener("pointerdown", abajo);
  nodo.addEventListener("pointermove", mueve);
  nodo.addEventListener("pointerup", arriba);
  nodo.addEventListener("pointercancel", cancelar);
  return {
    update(nuevas) { op = nuevas; },
    destroy() {
      nodo.removeEventListener("pointerdown", abajo);
      nodo.removeEventListener("pointermove", mueve);
      nodo.removeEventListener("pointerup", arriba);
      nodo.removeEventListener("pointercancel", cancelar);
    },
  };
}
