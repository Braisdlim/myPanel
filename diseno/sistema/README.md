Pauta es la secretaria personal de una sola persona: compromisos de todas sus cuentas de calendario (varias de Google, de Microsoft…), tareas e inversiones en una misma app para escritorio (Mac y Windows) y móvil (Android e iPhone), con las mismas pantallas en los dos. Debe sentirse como una app nativa del Mac, tranquila y precisa: poca información a la vista, el detalle al tocar, y nada que se mueva o se guarde sin que el usuario lo vea.

Construye con estas piezas: `tokens.json` (colores, tipografía, espacios, radios, sombras y medidas), `components/bundle.css` (clases `pa-*`) y los iconos de `assets/Iconos`. Las fichas de cada componente dicen qué clases usar y qué datos pones tú.

## Principios

- **Una carcasa, tres contenidos.** Barra lateral, contenido e inspector en el Mac; contenido y pestañas en Android. Cambiar de sector cambia el contenido, nunca la estructura (`Carcasa`).
- **Mismo problema, misma pieza.** Una lista es siempre `Fila`; una escala de horas, `RejillaTiempo`; un año, `MapaAnual`; algo que pide atención, `Aviso`.
- **Propone, no decide.** Todo lo que crea o cambia algo enseña antes qué va a pasar y en qué cuenta (`Captura`, `Inspector`). Los cambios en eventos repetidos son de una sola vez salvo que se elija la serie.
- **Explica el dato.** Cada cifra externa lleva su fecha y su fuente; los avisos de Finanzas explican, nunca recomiendan.
- **Calma.** Un título y una acción principal por vista. Sin decoración: cada gráfico responde a una pregunta.

## Contenido: cómo se escribe

- Español de España, de tú, frases cortas y en activo. Sin emoji, sin exclamaciones, sin mayúsculas sostenidas.
- Títulos y botones con mayúscula solo al principio: «Planificar el día». Etiquetas de sección en minúscula: «esta noche», «cuentas», «pide atención».
- Los botones dicen lo que pasa y su alcance: «Guardar», «Mover esta vez», «Saltar esta vez», «Crear tarea «Valorar aportación»». Nunca «Aceptar» ni «OK».
- Errores: qué ha pasado y cómo arreglarlo. «No se pudo leer Gmail 2: vuelve a conectar la cuenta en Ajustes.»
- **Fechas**: «viernes, 23 de octubre» en títulos; «vie 23 oct» en filas y fichas; «hoy», «mañana» y «en 7 días» cuando ayudan.
- **Horas**: 24 h, «21:30»; intervalos con raya corta sin espacios, «21:30–23:30». Si una hora puede ser de mañana o de noche, se pregunta: nunca se guarda una hora ambigua.
- **Duraciones**: «15 min», «1 h 30 min».
- **Dinero y porcentajes**: punto de millares, coma decimal y espacio no separable antes del símbolo: «12.480,35 €», «+0,42 %». Signo menos real (−) y flecha en las variaciones: «↓ −1,10 %».
- **Glosario**: Hoy · Planificar · Esta noche · Algún día · Pide atención · Apuntar · cuenta (no «calendario» cuando se habla de Gmail 1, Gmail 2 u Outlook) · opcional (lo que se puede mover).
- Los datos de las fichas de componentes son ejemplos, salvo el ensayo de los viernes de 21:30 a 23:30.

## Color

- Oscuro es el tema principal; claro se elige en Ajustes; por defecto sigue al sistema. Los dos temas usan los mismos nombres de token.
- **Superficies**: `bg` fondo de ventana; `sidebar` barra lateral, barra de pestañas y menús; `surface` tarjetas, inspector y hojas; `raised` controles y fichas. En oscuro se separan con `line` y `line-strong`; en claro, además, con `shadow-card`.
- **Texto**: `text` principal, `text-2` detalle y subtítulos, `text-3` horas de rejilla, etiquetas y marcadores. Los tres superan 4,5:1 sobre `bg`, `sidebar`, `surface` y `raised` en los dos temas.
- **Un solo acento**, `accent` (lavanda plana, sin degradados ni brillos): «ahora» (línea y nodo), selección (`accent-soft`), foco (`focus`) y la acción principal (relleno `accent` con texto `on-accent`). Nunca para decorar ni para la opción elegida de un segmentado.
- **Semánticos**, aparte del acento: `gain` y `loss` (siempre con flecha y signo, porque verde y rojo se confunden con algunos daltonismos), `attention` (sobrecarga, reglas) y `danger` (conflictos y borrar). Cada uno con su fondo `-soft`.
- **Gráficos financieros, como Bolsa**: la línea y su degradado son `gain` si el periodo elegido sube y `loss` si baja, medido contra la línea punteada del valor de partida; mientras se inspecciona un punto, el gráfico pasa a `accent`. En las listas de Finanzas la variación va en píldora sólida (`pa-delta--solid`, texto `on-gain`/`on-loss`).
- **Cuentas**: `cuenta-1` (cielo), `cuenta-2` (melocotón), `cuenta-3` (rosa) y `cuenta-4` (turquesa), en el orden en que se añaden; el usuario puede cambiarlos. Solo como punto, barra de evento o nombre; el texto sobre los `cuenta-N-soft` va en `text`. El color nunca va solo: la cuenta se nombra (y en listas cortas lleva su inicial). Desde la quinta cuenta, los colores se repiten.
- **Mapa anual**: `heat-0`…`heat-4`, una sola escala del acento.
- **Lo opcional** (ensayo, rutinas que se pueden mover) va rayado con `hatch` y borde discontinuo; lo fijo, sólido; un conflicto, punto `danger`.

## Tipografía

- Inter Variable, alojada con la app (`fonts/inter-latin-opsz-normal.woff2`, licencia OFL), con eje de tamaño óptico: los títulos y cifras grandes usan su versión de titular. Las teclas (⌘ ⌥ ⇧) usan la fuente del sistema (`teclas`), porque Inter no las trae.
- Escritorio: `cifra` 34/40 ligera para el número principal; `titulo-1` 24/30 para el título de la vista; `titulo-2` 17/22 inspector y hojas; `titulo-3` 14/20 tarjetas; `cuerpo` 14/20 filas y texto; `secundario` 12,5/17 detalle; `etiqueta` 11,5/15 secciones y cabeceras; `mini` 11/14 dentro de la rejilla.
- Móvil: los estilos `-movil` suben un paso: cuerpo 16/22, detalle 14/19, título 28/34, cifra 40/46.
- Jerarquía por tamaño y peso (300 cifras, 400 texto, 500 controles, 600 títulos). Nada más grueso que 600.
- Cifras tabulares (`pa-num`) en horas, duraciones, importes y porcentajes, para que las columnas se alineen.

## Espacio, medidas y forma

- Retícula de 4 px: `space-1` a `space-12`. Filas con `space-2` vertical y `space-3` horizontal; tarjetas e inspector con `space-4`; contenido del Mac con `space-5`; grupos separados `space-6`.
- Carcasa del Mac: `toolbar-height` 52, `sidebar-width` 232, `inspector-width` 300. Filas de `row-height` 36 en escritorio y `row-height-movil` 52 en Android; objetivos táctiles de al menos `tap` 48.
- Radios por jerarquía: `radius-xs` bloques de rejilla y celdas, `radius-sm` teclas y elementos de la barra lateral, `radius-md` campos y segmentados, `radius-lg` tarjetas, menús y captura, `radius-xl` hojas y ventana, `radius-pill` botones y fichas.
- Bordes antes que sombras. Sombras solo para lo que flota: `shadow-menu` (menús, captura, mini agenda) y `shadow-sheet` (hojas).
- Desenfoque de fondo (`backdrop-filter`) solo en hojas y barra de pestañas, y solo si no penaliza en Android.

## Estados y movimiento

- Pasar el puntero: fondo `hover`. Seleccionado: `accent-soft`. Foco de teclado: anillo `focus` de 2 px separado 2 px. Desactivado: 45 % de opacidad. Hecha: texto `text-3` tachado.
- El movimiento solo responde a una acción: 140 ms (pulsar, cambiar de opción), 220 ms (abrir hoja o inspector), 320 ms (cambiar de vista), con salida suave. Con «reducir movimiento» activado, nada se anima.
- Teclado igual en toda la app: ⌘K apuntar o buscar, ⌘1–4 sectores, D S M A escalas, T hoy, ? atajos, ↵ guardar, esc cerrar.

## Iconografía

- Lucide 1.50.0 (licencia ISC), trazo de 1,75 a 16 px (22 px en las pestañas de Android), puntas y uniones redondeadas, siempre en `currentColor`. El subconjunto aprobado está en `assets/Iconos`: los archivos subidos llevan tinta `#8E919C` (el `text-3` oscuro) para poder verse como imagen; en el código se usa `currentColor`.
- Un icono acompaña a un texto o lleva `aria-label`. Sin iconos de colores; el color lo pone el estado (acento en lo actual, semánticos en avisos).
- No se usan SF Symbols: están hechos para las plataformas de Apple y Pauta también corre en Android; Lucide es libre y se ve igual en los dos.

## Logotipo

- La marca son tres líneas del día; la de «ahora», en `accent` con su punto. `assets/Logo/pauta-icono.svg` es el icono completo (web, PWA y Android); `pauta-icono-macos.svg` sigue la plantilla del Mac (lienzo de 1024 con la forma de 824 centrada); `pauta-android-frente.svg` es la capa frontal adaptable (lienzo de 108 con la marca dentro de la zona segura de 66) y `pauta-monocromo.svg` la capa monocroma para los iconos temáticos de Android.
- Logotipo horizontal con la palabra en Inter 620: `pauta-logotipo-oscuro.svg` sobre fondos oscuros, `pauta-logotipo-claro.svg` sobre claros. No se recolorea ni se deforma; separación mínima alrededor igual al alto de una línea de la marca.
