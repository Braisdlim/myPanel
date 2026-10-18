# Ficha

Etiqueta pequeña y redonda para filtrar, elegir o mostrar lo que la captura ha entendido.

**Clases**: `pa-chip` como `<button aria-pressed>` para filtros (activa: relleno `accent`, texto `on-accent`); `pa-chip pa-chip--token` para una parte reconocida (fondo `accent-soft`, texto `text`) con `pa-chip__x` para quitarla. Dentro puede ir un icono de 16 px o un `pa-dot` de cuenta.

**Qué pones tú**: el texto corto («Viernes 21:30», «Gmail 2»), el icono si ayuda y el `aria-label` del botón de quitar («Quitar fecha»).

**Cuándo**: filtros de una lista; partes entendidas en la captura (fecha, repetición, cuenta, tipo); periodos de un gráfico cuando no caben en un segmentado.

**No**: más de una fila de fichas de filtro; fichas como botones de acción (usa `Boton`).
