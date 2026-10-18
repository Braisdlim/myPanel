# Referencias visuales por sector

Objetivo: para cada sector, reunir **capturas reales** de las apps que tomamos como inspiración, evaluarlas contra nuestros recorridos y que **apruebes o descartes** cada idea antes de diseñar. Todo debe unificarse después en una sola app que se sienta natural.

## Cómo trabajamos cada sector
1. **Ideas candidatas**: qué tomamos de cada app (sale de `docs/producto/02-benchmark.md`).
2. **Lista de capturas**: qué pantallas concretas hacen falta para juzgar cada idea.
3. **Capturas reales** con fuente y fecha (App Store, web oficial, documentación). Nunca inventadas ni recreadas.
4. **Evaluación** con los mismos criterios para todas las ideas (abajo).
5. **Tu decisión**: ✅ aprobada, ✏️ aprobada con cambios o ❌ descartada.

## Criterios de evaluación (iguales para todos los sectores)
| Criterio | Pregunta |
|---|---|
| Recorrido | ¿Resuelve alguno de nuestros recorridos (R1–R9)? |
| Encaje | ¿Cabe en la estructura común sin inventar un patrón nuevo? |
| Principios | ¿Respeta «nada se mueve sin ti», procedencia visible y funcionar sin IA? |
| Android | ¿Tiene una traducción natural al móvil? |
| Coste | Bajo, medio o alto; ¿de qué depende (permisos, IA, datos)? |

## Reglas de unificación (para que todo parezca una sola app)
Todas las referencias se adaptan a estos elementos comunes, nunca al revés:
- **Estructura**: en el Mac, barra lateral, contenido e inspector a la derecha; en Android, barra inferior con Hoy, Calendario, ＋, Finanzas y Más.
- **Paleta de comandos única** (⌘K): buscar, apuntar e ir a cualquier sector.
- **Captura única**: el mismo campo con lenguaje natural sirve para tareas, eventos y notas.
- **Marca de procedencia** igual en todos los sectores: cuenta, fuente y fecha.
- **Mismo patrón de acción**: propuesta → confirmación → comprobación.
- **Mismas escalas de tiempo** (día, semana, mes, año) en Calendario y Finanzas.

## Estado por sector
| Sector | Dossier | Capturas | Decisión |
|---|---|---|---|
| Calendario | [calendario.md](calendario.md) | Pendientes (red bloqueada) | Pendiente |
| Finanzas | — | — | — |
| Tareas | — | — | — |
| Correo, documentos y búsqueda | — | — | — |
| Lo que sé de ti | — | — | — |

## Derechos de las imágenes
Las capturas son de sus autores. Se usan solo como referencia interna: **no se suben al repositorio** (`img/` está en `.gitignore`); en el repositorio solo queda el listado de fuentes. Para revisarlas se publican en una página privada.

## Cómo descargar las capturas
`node research/referencias/descargar.mjs calendario` lee `research/referencias/fuentes.json`. Usa la API pública de búsqueda de la App Store (capturas oficiales) y las imágenes de las páginas oficiales indicadas, y guarda imágenes y `manifiesto.json` en `docs/referencias/<sector>/img/`.
