# Reglas de trabajo para agentes

- Al empezar una sesión nueva, lee `docs/TRASPASO.md` (estado actual, hechos del usuario, siguiente paso y trampas conocidas) y `docs/DECISIONES.md`. Al terminar un bloque de trabajo importante, actualiza `docs/TRASPASO.md`.

- Idioma: español para documentos, interfaz y commits.
- Antes de cada fase o funcionalidad importante, usa la skill `investigar-antes-de-construir`. Para cambios visuales, `revision-visual`.
- Mantén `docs/DECISIONES.md` al día: decisiones, supuestos, fuentes con fecha y pendientes.
- Separa siempre hechos comprobados, inferencias y propuestas. No inventes resultados, precios ni APIs.
- Toda escritura en un servicio externo indica la cuenta de destino, requiere confirmación y se verifica releyendo el recurso.
- Las excepciones de calendario se aplican por ocurrencia; nunca a la serie sin orden explícita.
- No guardes ejemplos hipotéticos como hechos (p. ej., «toca el saxofón»).
- Nunca subas secretos ni tokens al repositorio.
- Evita dependencias y servicios de pago innecesarios.
