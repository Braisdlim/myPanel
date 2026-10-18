# Captura

El campo único para apuntar cualquier cosa en lenguaje natural, con lo entendido a la vista antes de guardar.

**Partes**: `pa-capture` (caja `raised` con `shadow-menu`), `pa-capture__input` (17 px; lo reconocido envuelto en `pa-hl`), `pa-capture__tokens` (una `Ficha --token` por parte entendida: fecha, repetición, cuenta, tipo), `pa-capture__ask` (pregunta cuando hay ambigüedad, fondo `attention-soft`), `pa-capture__preview` (frase con lo que se va a crear y dónde), `pa-capture__foot` (teclas).

**Qué pones tú**: el texto escrito, las partes entendidas, la pregunta si la hay y la frase de vista previa.

**Reglas**
- Nunca guardar una hora ambigua: si «9:30» puede ser mañana o noche, se pregunta (`pa-capture__ask`).
- La vista previa siempre nombra la **cuenta de destino** y el tipo (evento o tarea). Sin cuenta clara, se pregunta.
- Cada ficha se quita con un toque; al quitarla, esa parte vuelve a ser texto.

**Dónde**: ⌘K y atajo global en el Mac; botón ＋ de la barra de pestañas y «Compartir con Pauta» en Android, dentro de una `Hoja`.

Sale de Fantastical (vista previa), Todoist (texto resaltado y fichas) y Things (sugerencia de fecha con su distancia).
