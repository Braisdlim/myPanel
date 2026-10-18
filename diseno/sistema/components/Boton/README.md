# Boton

Botón de acción en forma de píldora; uno solo principal por vista.

**Clases**: `pa-btn` (secundario, por defecto) + una variante: `pa-btn--primary` (relleno `accent`, texto `on-accent`), `pa-btn--plain` (texto `accent`, sin fondo), `pa-btn--icon` (cuadrado de 32 px, icono `text-2`), `pa-btn--danger` (texto `danger`). Tamaño pequeño: `pa-btn--sm`.

**Qué pones tú**: un `<button>` con un verbo que diga lo que pasa («Guardar», «Planificar el día», «Solo esta vez»). Los de icono llevan `aria-label`.

**Cuándo**
- `--primary` solo para la acción que hace avanzar: una por pantalla o por hoja.
- Secundario para alternativas («Ahora no»); `--plain` para acciones de texto dentro de un aviso o fila.
- `--danger` siempre dice el alcance: «Borrar esta vez», nunca «Borrar» a secas en un evento repetido.

**No**: dos principales juntos; botones con solo icono sin `aria-label`; mayúsculas sostenidas.

En el móvil crece a 44 px de alto y 16 px de texto. Pulsarlo lo encoge al 97 % durante `140 ms`.
