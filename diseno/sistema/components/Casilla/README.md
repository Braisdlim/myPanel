# Casilla

Círculo para completar una tarea.

**Clase**: `pa-check` sobre `<button role="checkbox" aria-checked>` con el icono `check` dentro. Pendiente: borde `border-control`; hecha: relleno `accent` y marca `on-accent`; opcional: `pa-check--optional` (borde discontinuo).

**Qué pones tú**: el estado y un `aria-label` si la fila no lo deja claro.

El área táctil crece 8 px alrededor (13 px en el móvil) sin cambiar el dibujo. Al completar, la fila pasa a `pa-row--done`.
