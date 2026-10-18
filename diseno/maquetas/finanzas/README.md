# Maquetas de Finanzas (calco de Bolsa)

Fecha: 18-10-2026. Estado: **propuesta, pendiente de tu revisión**.
Lienzo (privado, con comentarios): https://claude.ai/artifact/1Dmp1APhbBSL1Y1F3NuNAU

Copia de los tableros del lienzo. Las capturas de Bolsa y la fuente se cargan desde el lienzo (`/_blob/…` y `ds/pauta/`), así que aquí solo se guarda el marcado.

| Tablero | Qué enseña |
|---|---|
| `Main.dc.html` | Anatomía de Bolsa en el Mac (10 zonas) y qué pone Pauta en cada una |
| `MacOscuro.dc.html`, `MacClaro.dc.html` | Finanzas en el Mac: barra lateral de Pauta, lista «Mis fondos» (lista de Bolsa) y detalle del fondo |
| `MacTramo.dc.html` | Arrastrar entre dos fechas: «27 feb – 12 jun · ↑ +6,3 %» |
| `RefIphone.dc.html` | Referencia de Bolsa en iPhone (lista y detalle en hoja) |
| `AndroidLista.dc.html`, `AndroidClaro.dc.html` | Lista en Android con patrimonio, aviso y pestañas |
| `AndroidDetalle.dc.html` | Detalle del fondo en una hoja |
| `MacAnadir.dc.html`, `AndroidAnadir.dc.html` | Añadir un fondo o ETF y su aportación mensual (importe, día, desde dónde) |

## Decisiones que proponen estas maquetas
- En el Mac, Finanzas usa tres columnas como Bolsa y Mail: barra lateral de sectores, lista de fondos y detalle. El inspector queda oculto (el detalle ya hace su papel).
- Se calca de Bolsa: lista con minigráfico y píldora apilada, selector de listas, pestañas, cabecera grande, periodos, gráfico con eje a la derecha, cuadrícula de datos, arrastrar entre dos fechas y «Añadir al calendario».
- Cambia respecto a Bolsa: periodos sin «1D» (los fondos tienen un valor al día); valor liquidativo con su fecha; tus euros (posición, ganancia); la franja de volumen marca tus aportaciones; las noticias se sustituyen por la regla de aviso.
- Color del gráfico como Bolsa (versión 2, 18-10-2026): verde si el periodo sube y rojo si baja, contra la línea punteada del valor de partida, con degradado; acento solo al inspeccionar un punto; en un tramo, el resto queda apagado. El gráfico muestra el valor liquidativo (como Bolsa el precio) y se puede cambiar a «Tu posición». Píldoras sólidas en la lista.
- Aportaciones mensuales: cada fondo o ETF lleva importe y día; el patrimonio dice cuánto aportas al mes y cuándo es la próxima. Se añaden con el ＋ de «Mis fondos». Hasta tener datos conectados, Pauta pregunta el día de la aportación si se hizo.
- Todas las cifras son de ejemplo y cuadran entre sí (patrimonio = suma de fondos; posición = participaciones × valor liquidativo). `[ISIN]`, `[gestora]` y `[TER]` quedan como huecos hasta saber tus fondos (P-019).
