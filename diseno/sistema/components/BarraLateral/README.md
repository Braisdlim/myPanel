# BarraLateral

Navegación principal del Mac: sectores arriba, cuentas abajo.

**Partes**: `pa-sidebar` (fondo `sidebar`, ancho `sidebar-width`) → `pa-side__item` (icono + nombre + `pa-side__count`; el actual con `aria-current="page"`: fondo `accent-soft`, icono `accent`), `pa-side__label` (grupo en minúscula inicial), `pa-side__account` (punto + nombre de la cuenta).

**Qué pones tú**: los sectores (Hoy, Calendario, Tareas, Finanzas, Pide atención), los recuentos y las cuentas conectadas.

**Reglas**: los sectores son siempre los mismos y en el mismo orden (⌘1–4); dentro de un sector, sus vistas aparecen debajo con sangría. Sale de Things y Notion Calendar (cuentas agrupadas con su color).
