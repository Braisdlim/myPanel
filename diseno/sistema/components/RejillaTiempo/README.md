# RejillaTiempo

La rejilla de horas compartida por el día y la semana del Calendario y por «Planificar» de Tareas.

**Partes**: `pa-tg` (con `--days`), `pa-tg__day` (hoy: `pa-tg__day--today`, número en `accent`), `pa-tg__hours` + `pa-tg__hour`, `pa-tg__col` por día (líneas de hora con `line`), `pa-ev` posicionado con `--start` y `--dur` en horas desde la primera hora visible, `pa-tg__now` con `--at` dentro de la columna de hoy.

**Bloques**
- Evento de la cuenta 1: `pa-ev` (relleno `cuenta-1-soft`, barra `cuenta-1`); cuenta 2: `pa-ev--c2`.
- Tarea colocada por Pauta (no es de Google): `pa-ev--task` (fondo `raised`, barra `text-3`).
- Opcional o movible (ensayo, rutinas): `pa-ev--optional` (rayado `hatch` y borde discontinuo).
- Conflicto: `pa-ev--conflict` (punto `danger`), siempre explicado en «Pide atención».
- Ahora: línea y punto en `accent`.

**Qué pones tú**: los días, la primera hora visible, los bloques con su tipo y la hora actual.

**Reglas**: el texto del bloque va en `text` (nunca en el color de la cuenta); la hora en `text-2`; una hora mide `hour-height` (48 px). Sale de Google Calendar (estructura), Notion Calendar (barra lateral del bloque y rayado de lo provisional) y Fantastical (línea de ahora).
