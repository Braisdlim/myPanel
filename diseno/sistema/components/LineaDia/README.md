# LineaDia

El día como una sola columna con nodos, para «Planificar» y «Hoy» en el móvil.

**Partes**: `pa-dayline` (lista) → cada `li` con `pa-dayline__time`, `pa-dayline__rail` + `pa-dayline__node` y `pa-dayline__body` (título y detalle con las clases de `Fila`). Nodos: `--c1`, `--c2` (cuentas), `--now` (`accent`), `--optional` (anillo vacío), sin modificador para tareas (`text-3`). Un hueco libre es `li.free` con `pa-dayline__free` y carril discontinuo.

**Qué pones tú**: los elementos del día en orden, con hora, tipo y cuenta, y los huecos libres de más de 30 min.

Es la misma información que la `RejillaTiempo`, con otra forma para pantallas estrechas. Sale de Structured.
