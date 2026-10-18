# Grafico

Gráfico de línea de una cartera o fondo, con el índice de referencia y la variación entre dos fechas elegidas.

**Partes del SVG** (clases): `grid` (líneas `line`), `axis` (etiquetas `text-3`, 11 px, tabulares), `area` (relleno `accent` al 12 %), `line` (`accent`, 2 px), `bench` (índice, `text-3` discontinuo), `range` y `range-edge` (tramo elegido, `accent-soft` y bordes `accent`), `point` (punto bajo el puntero). Encima, un `Segmentado` de periodos; debajo, `pa-legend`.

**Qué pones tú**: la serie escalada, el índice, las etiquetas de eje y, si se ha arrastrado, el tramo con su variación encima («entre 2 y 16 oct · ↑ +3,1 %»).

**Reglas**: cada gráfico responde a una pregunta («¿qué tal han ido estos días?»); sin decoración ni 3D; etiquetas solo en valores que el gráfico alcanza; la línea de la cartera es la única en acento.

Sale de Bolsa (periodos y arrastrar entre dos fechas) y Copilot/getquin (comparación con un índice).
