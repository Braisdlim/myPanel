# Carcasa

La estructura única de la app: no cambia al pasar de un sector a otro, solo cambia el contenido.

**Mac** — `pa-shell`: `pa-toolbar` (semáforos del sistema, `pa-search` que abre la `Captura`, botón del inspector) y `pa-shell__body` con tres columnas: `BarraLateral` (`sidebar-width`), `pa-content` (con `pa-viewhead`: título de la vista, fecha y la acción principal) e `Inspector` (`inspector-width`, se oculta con su botón).

**Android** (< 640 px) — la barra superior, la lateral y el inspector desaparecen; el contenido ocupa la pantalla y aparece `BarraPestanas`. El inspector se abre como `Hoja`.

**Qué pones tú**: el sector actual, el contenido de la vista y lo seleccionado.

**Reglas**: un título por vista (`titulo-1`), una acción principal, el resto de acciones en el inspector o en la fila. La carcasa es la regla «una carcasa, tres contenidos».
