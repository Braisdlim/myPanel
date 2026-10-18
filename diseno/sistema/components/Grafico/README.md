# Grafico

Gráfico de línea de un fondo o cartera: verde si el periodo elegido sube, rojo si baja, como en Bolsa.

**El color lo decide el periodo**: compara el último valor con el del inicio del periodo (la línea punteada `baseline`), no la tendencia del tramo. `pa-chart` o `pa-chart--up` usa `gain`; `pa-chart--down`, `loss`; `pa-chart--inspect` (mientras se arrastra o se inspecciona un punto) usa `accent`, el papel que en Bolsa hace el azul.

**Partes del SVG** (clases): `grid`, `axis` (11 px, `text-3`, tabulares, a la derecha), `baseline` (punteada), relleno con degradado (`<linearGradient>` con `<stop class="g0">` y `<stop class="g1">`, del color del gráfico al 32 % hasta transparente; o `area` plano al 14 %), `line` (2 px), `bench` (índice, `text-3` discontinuo), `cursor` y `point` (inspección), `range-edge` y `faded` (tramo entre dos fechas: el tramo se dibuja con su color y el resto al 30 %).

**Qué pones tú**: la serie escalada, el valor de partida, el índice, las etiquetas y el estado (normal, inspección o tramo con su variación encima: «27 feb – 12 jun · ↑ +6,3 %»).

**Reglas**: la variación siempre va escrita con flecha y signo junto al gráfico (el color no basta); cada gráfico responde a una pregunta; sin 3D ni decoración.

Sale de Bolsa (color por periodo, línea de partida, inspección, tramo) y Copilot/getquin (índice de referencia).
