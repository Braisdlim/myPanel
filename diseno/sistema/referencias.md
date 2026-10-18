# De dónde sale cada decisión

Cada pieza toma un comportamiento de una app de referencia; el aspecto (color, tipografía, iconos) es siempre el de Pauta. Capturas oficiales revisadas el 18-10-2026.

## Carcasa y navegación

| Decisión | Referencia | Qué se toma | Qué cambia |
|---|---|---|---|
| Tres zonas en el Mac (`Carcasa`) | Notion Calendar, Copilot Money, Bolsa | Barra lateral, contenido e inspector | Igual en los tres sectores |
| Cuentas agrupadas con su color (`BarraLateral`) | Notion Calendar | Punto de color por cuenta bajo los sectores | Solo dos cuentas, sin casillas de visibilidad en la vista principal |
| Inspector con filas de icono (`Inspector`) | Notion Calendar, Things | Filas icono + dato; orden calmado | Acciones con alcance («esta vez») |
| Mini agenda en la barra de menús (`MiniAgenda`) | Notion Calendar, Fantastical | «Lo siguiente» y el resto del día con barra de cuenta | Apuntar desde ahí con atajo global |
| Atajos de una tecla y «?» (`Tecla`) | Notion Calendar | D S M A, ⌘K, lista de atajos | Los mismos en todos los sectores |
| Pestañas con ＋ central (`BarraPestanas`) | Convención de Android y apps revisadas | Acción principal al alcance del pulgar | El ＋ abre la captura única |

## Captura

| Decisión | Referencia | Qué se toma | Qué cambia |
|---|---|---|---|
| Vista previa antes de guardar (`Captura`) | Fantastical | Escribir de corrido y ver qué se va a crear | Siempre nombra la cuenta de destino |
| Texto resaltado y fichas que se quitan (`Ficha --token`) | Todoist | Cada parte entendida, resaltada y como ficha con ✕ | Fichas también para cuenta y tipo |
| Fecha sugerida con su distancia | Things 3 | «lun 22 sept · en 7 días» | — |
| Pregunta si hay ambigüedad | Propio | — | «¿9:30 o 21:30?» antes de guardar |

## Calendario y tiempo

| Decisión | Referencia | Qué se toma | Qué cambia |
|---|---|---|---|
| Bloque con relleno suave y barra de color (`RejillaTiempo`) | Notion Calendar, Google Calendar | Barra lateral del bloque en el color del calendario | Texto siempre en `text`, no en el color de la cuenta |
| Rayado para lo provisional (`pa-ev--optional`) | Notion Calendar | Bloques rayados y con borde discontinuo | Significa «opcional, se puede mover» |
| Línea de ahora | Fantastical | Línea y punto sobre la hora actual | En acento (el rojo es para conflictos) |
| Día de hoy marcado en la cabecera | Fantastical, Notion Calendar | Número del día en una píldora | — |
| Año como mapa de calor (`MapaAnual`) | BusyCal | Cuadrícula de días coloreada por ocupación; resumen debajo | Horas comprometidas, no número de eventos; días libres con contorno |
| Línea del día en el móvil (`LineaDia`) | Structured | Columna con nodos, horas y huecos | Nodos por cuenta; sin iconos de colores |

## Tareas

| Decisión | Referencia | Qué se toma | Qué cambia |
|---|---|---|---|
| «Hoy» con eventos arriba y «Esta noche» (`Carcasa`) | Things 3 | Estructura y calma de la vista | Eventos de dos cuentas con su punto |
| Fila limpia sin separadores (`Fila`) | Things 3 | Título y detalle gris, sin líneas | Duración estimada al final |
| Capacidad del día (`Capacidad`) | Sunsama | Duraciones, total y aviso de sobrecarga | Gratis y opcional |
| Opción de sí o no (`Interruptor`) | Interruptores de macOS y Android | Pista con botón que se desliza | Colores de Pauta; apagado por defecto si al encenderlo se escribe en otro servicio |
| Revisión semanal Importante/Urgente | TickTick | Solo la matriz, como vista de revisión | Sin Pomodoro, hábitos ni sonidos |

## Finanzas

| Decisión | Referencia | Qué se toma | Qué cambia |
|---|---|---|---|
| Fila con minigráfico y variación (`Fila`, `Minigrafico`, `Variacion`) | Bolsa de Apple | Lista de seguimiento | Fecha del valor liquidativo en el detalle |
| Píldora de variación con flecha (`Variacion`) | Bolsa de Apple, Parqet | Píldora sólida en las listas | Flecha y signo siempre, por accesibilidad; texto con contraste 4,5:1 |
| Periodos y variación entre dos fechas (`Grafico`) | Bolsa de Apple | 1S · 1M · 3M · 1A · Todo y arrastrar sobre el gráfico | Mismo `Segmentado` que las escalas del Calendario |
| Color por periodo (`Grafico`) | Bolsa de Apple | Verde si sube, rojo si baja, contra la línea punteada del inicio; degradado; color neutro al inspeccionar | El neutro es nuestro acento |
| Comparación con un índice (`Grafico`) | Copilot Money, getquin, Parqet | Línea de referencia en el mismo gráfico | Discontinua y en gris |
| Cifra principal con fecha (`Cifra`) | Finary, Parqet | Patrimonio en euros grande | Siempre con fecha y fuente |
| Cuadrícula de rentabilidad (`MapaAnual`) | getquin | Rentabilidad por periodo en celdas de color | Por meses y con el mismo dibujo que el año del Calendario |
| Bandeja de avisos (`Aviso`) | Fintonic | Cada aviso con motivo e importe | Reglas propias; explica, nunca recomienda |

## Lo que se dejó fuera

Superposición de calendarios de otras personas (Notion Calendar), mover cosas sin permiso (Reclaim), Pomodoro, hábitos con rachas y sonidos (TickTick), prioridades P1–P4 (Todoist), noticias y cotización al segundo (Bolsa), degradados, cristal y resplandores (dirección visual anterior).
