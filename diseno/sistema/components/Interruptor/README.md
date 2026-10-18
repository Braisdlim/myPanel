# Interruptor

Activa o desactiva una opción que se aplica al momento (sin botón de guardar aparte).

**Clases**: `pa-switch` sobre `<button role="switch" aria-checked>`; el botón redondo es un pseudoelemento. Apagado: pista `border-control` y botón `switch-knob`; encendido: pista `accent` y botón `on-accent`; no disponible: `disabled` (opacidad 0,45). Con su texto: `pa-toggle` → `pa-toggle__text` (`pa-toggle__title` + `pa-toggle__meta`) y el interruptor a la derecha.

**Medidas**: 40 × 24 px en el Mac y 48 × 28 px en Android; el área que se puede pulsar llega a 48 px de alto sin cambiar el dibujo. El botón se desliza en `dur-1` (140 ms); con movimiento reducido, cambia sin animación.

**Qué pones tú**: el estado, el texto y un `aria-label` igual al título.

**Cuándo**: opciones de sí o no, como «Añadir el plan a Google Calendar» en Planificar el día o «Aportación mensual» en Añadir fondo. Si al encenderlo se va a escribir en un servicio externo, empieza **apagado**, el texto dice qué se escribirá y la escritura se confirma aparte, indicando la cuenta de destino.

**No**: para elegir entre más de dos opciones (usa `Segmentado`) ni para completar tareas (usa `Casilla`).

Contraste comprobado con `diseno/colores.py`: botón apagado sobre la pista 4,38:1 (oscuro) y 3,31:1 (claro); botón encendido sobre `accent` como el texto `on-accent` (≥ 4,5:1). Sale de los interruptores de macOS y Android, con los colores de Pauta.
