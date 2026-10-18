# MapaAnual

Una cuadrícula para ver el año de un vistazo; la misma pieza en Calendario y en Finanzas.

**Calendario** — `pa-year`: una fila por mes (`pa-year__m`) y 31 celdas `pa-year__c`. `data-h="0…4"` colorea con `heat-0…heat-4` según las horas comprometidas (0 · ≤2 h · 2–4 h · 4–7 h · >7 h). `data-libre` marca días libres o vacaciones (contorno `border-control`); `data-hoy` rodea hoy. Debajo, `pa-heatlegend` y `pa-stats` con las cifras del año.

**Finanzas** — `pa-returns`: una fila por año y 12 columnas; cada celda dice la rentabilidad con signo: `.u` (`gain` sobre `gain-soft`), `.d` (`loss` sobre `loss-soft`), `.e` (mes sin datos).

**Qué pones tú**: las horas por día (o la rentabilidad por mes), los días libres y las estadísticas.

**Reglas**: la escala de horas usa solo el acento (más horas, más intenso); la de rentabilidad lleva siempre la cifra escrita. Sale de BusyCal (mapa de calor y «Overview») y getquin/Parqet (cuadrícula de rentabilidad).
