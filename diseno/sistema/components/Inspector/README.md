# Inspector

Panel de detalle de lo seleccionado, siempre con el mismo orden: qué, cuándo, de dónde viene, acciones.

**Partes**: `pa-inspector` (ancho `inspector-width`) → `pa-label` (tipo: evento, tarea, fondo), `pa-insp__title`, `pa-insp__meta` (cuándo o valor), `pa-insp__rows` (filas icono + texto + `small` con el detalle), `pa-insp__actions`.

**Qué pones tú**: el elemento seleccionado y sus acciones, que siempre dicen el alcance («Mover esta vez», «Saltar esta vez»).

**Dónde**: columna derecha de la `Carcasa` en el Mac; en Android el mismo contenido va dentro de una `Hoja`. Sale de Notion Calendar (filas con icono) y Things (orden calmado).
