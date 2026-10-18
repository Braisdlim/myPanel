# Fila

La pieza básica de toda lista: inicio, título con detalle y un valor al final.

**Partes**: `pa-row` (en `pa-list`; con `pa-row--hover` si se puede pulsar) → inicio (`Casilla`, `pa-dot` de cuenta o icono) · `pa-row__main` con `pa-row__title` y `pa-row__meta` · `pa-row__end` (duración, hora, minigráfico, `Variacion`). Hecha: `pa-row--done`. Seleccionada: `aria-selected="true"` (fondo `accent-soft`). Listas con separadores (Finanzas, inspector): `pa-list--lines`.

**Qué pones tú**: el título (una línea; se corta con «…»), un detalle opcional y un valor final.

**Variantes por sector**
- Tarea: casilla + título + lista o «Algún día» + duración estimada.
- Evento: punto de cuenta + título + «opcional · cada viernes · Gmail 2» + hora.
- Fondo: nombre + tipo y aportación mensual + minigráfico + valor con `Variacion` sólida debajo (como la lista de Bolsa).

**No**: más de un valor al final; texto de dos líneas en el título; iconos de colores distintos por fila.

Altura mínima `row-height` (36 px) en escritorio y `row-height-movil` (52 px) en el móvil. Sale de Things (fila limpia, sin separadores) y Bolsa (minigráfico y variación).
