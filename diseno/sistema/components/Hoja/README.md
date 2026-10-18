# Hoja

Panel que sube desde abajo en Android para apuntar, ver un detalle o confirmar algo.

**Partes**: `pa-scrim` (velo) + `pa-sheet` (fondo `surface`, esquinas `radius-xl`, `shadow-sheet`) → `pa-sheet__grabber`, `pa-sheet__title` y el contenido (`Captura`, contenido del `Inspector`, confirmaciones).

**Qué pones tú**: el título, el contenido y la acción principal abajo a la derecha.

**Reglas**: se cierra arrastrando hacia abajo, tocando el velo o con atrás; al cerrarse, el foco vuelve a donde estaba. `backdrop-filter` solo aquí y en la barra de pestañas si hace falta (rendimiento en Android). Abre en `220 ms`.
