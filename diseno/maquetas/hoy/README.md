# Maquetas de «Hoy» (calco de Things 3)

Fecha: 18-10-2026. Estado: **aprobadas** («Hoy listo», 18-10-2026).
Lienzo (privado, con comentarios): https://claude.ai/artifact/8GLyXqURLfdiLKDDpgec8h

Copia de los tableros del lienzo. Las capturas de referencia y la fuente se cargan desde el lienzo (`/_blob/…` y `ds/pauta/`), así que aquí solo se guarda el marcado.

| Tablero | Qué enseña |
|---|---|
| `Main.dc.html` | Anatomía de «Hoy» en Things 3 para Mac (6 zonas), qué pone Pauta en cada una y las referencias que completan (Things en iPhone, Sunsama, Structured, Notion Calendar) |
| `MacHoy.dc.html`, `MacHoyClaro.dc.html` | «Hoy» en el Mac: barra lateral de Pauta, capacidad del día, bloque de eventos, tareas con duración, «esta noche» e inspector |
| `MacPlanificar.dc.html` | «Planificar el día»: tareas elegidas con la hora propuesta, tareas de otras listas y el día en la rejilla horaria con lo propuesto en discontinuo |
| `AndroidHoy.dc.html`, `AndroidHoyClaro.dc.html` | «Hoy» en Android con pestañas y «Planificar el día» en la mitad inferior |
| `AndroidPlanificar.dc.html` | «Planificar el día» en Android sobre la línea del día |
| `MacAtencion.dc.html`, `AndroidAtencion.dc.html` | «Pide atención» en escritorio y en móvil: avisos de Calendario, Tareas y Finanzas, y los resueltos (añadido por la regla de paridad, 18-10-2026) |

## Decisiones que proponen estas maquetas (D-031)
- Se calca de Things: título «Hoy» con la fecha, bloque compacto de eventos arriba, filas de tarea con casilla y lista debajo, sección «esta noche» con la luna. Fuera: la barra inferior de Things (se apunta con ⌘K en el Mac y con el ＋ en Android).
- Se añade lo que Things no tiene: barra de capacidad (lo planificado frente al tiempo libre hasta el ensayo), duración estimada en cada tarea, «vence hoy» en rojo, «lo siguiente» con cuánto falta, «pide atención» y «tu dinero hoy» (ocultable) en el inspector.
- «Planificar el día»: eliges tareas y pones su duración; Pauta las coloca en los huecos dejando 15 min tras cada evento y pone primero lo que vence. Lo propuesto se dibuja en acento con borde discontinuo hasta que pulsas «Guardar el plan».
- Escribir el plan en Google Calendar es opcional, está desactivado por defecto y no tiene cuenta elegida hasta que lo decidas (P-020). Antes de escribir, Pauta enseña los bloques y la cuenta de destino y pide confirmación.

## Cambios del 18-10-2026 (paridad y varias cuentas)
- Outlook (Microsoft) aparece como tercera cuenta en la barra lateral, con «Añadir cuenta».
- El primer aviso pasa a ser el solape del sábado entre Gmail 2 y Outlook (antes «Mañana no cabe todo», que no cuadraba con el Calendario).
- «Tu dinero hoy» aparece también en el móvil, como tarjeta ocultable.

## Datos de ejemplo
Todo es de ejemplo salvo el ensayo de los viernes (21:30–23:30). Las cifras cuadran: ahora son las 9:40; eventos de 10:00–11:00, 13:30–15:30 y 17:30–18:30; quedan 7 h 50 min libres hasta las 21:30; las cuatro tareas elegidas suman 1 h, así que quedan 6 h 50 min (13 % de barra). La duración de los eventos y el calendario del ensayo (P-001) son supuestos de la maqueta.

## Posibles añadidos al sistema de diseño (pendientes de aprobar)
- Interruptor: añadido al sistema el 18-10-2026 (`pa-switch`, `pa-toggle`) y ya usado aquí y en Finanzas.
- Estado «propuesta» de la rejilla y la línea del día (`pa-ev--proposed`, nodo discontinuo en acento).
