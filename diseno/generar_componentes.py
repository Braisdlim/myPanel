"""Genera components/<Comp>/preview.html y README.md del sistema Pauta.
Los iconos se copian de lucide-static 1.50.0 (ISC); nada se dibuja a mano."""
import os, re, sys

ROOT, LUCIDE = sys.argv[1], sys.argv[2]
OUT = os.path.join(ROOT, 'project', 'components')

def icon(name, extra=''):
    svg = open(os.path.join(LUCIDE, f'{name}.svg')).read()
    inner = re.search(r'<svg[^>]*>(.*)</svg>', svg, re.S).group(1)
    inner = re.sub(r'\s+', ' ', inner).strip()
    return (f'<svg class="pa-icon{(" " + extra) if extra else ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{inner}</svg>')

def fill(html):
    return re.sub(r'\{i:([a-z-]+)(?::([a-z-]+))?\}', lambda m: icon(m.group(1), m.group(2) or ''), html)

CHECK = '{i:check}'
def chk(state='false', extra=''):
    return f'<button class="pa-check{extra}" role="checkbox" aria-checked="{state}" aria-label="Completar">{CHECK}</button>'

C = {}

C['Boton'] = dict(group='Acciones', height=150, sub='Principal, secundario, sencillo, de icono y de borrar',
 html='''<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:20px">
  <button class="pa-btn pa-btn--primary">Planificar el día</button>
  <button class="pa-btn">Ahora no</button>
  <button class="pa-btn pa-btn--plain">Ajustar la regla</button>
  <button class="pa-btn pa-btn--icon" aria-label="Mostrar inspector">{i:panel-right}</button>
  <button class="pa-btn pa-btn--danger">Borrar esta vez</button>
  <button class="pa-btn pa-btn--sm">Solo esta vez</button>
  <button class="pa-btn" disabled>Guardando…</button>
</div>''',
 readme='''# Boton

Botón de acción en forma de píldora; uno solo principal por vista.

**Clases**: `pa-btn` (secundario, por defecto) + una variante: `pa-btn--primary` (relleno `accent`, texto `on-accent`), `pa-btn--plain` (texto `accent`, sin fondo), `pa-btn--icon` (cuadrado de 32 px, icono `text-2`), `pa-btn--danger` (texto `danger`). Tamaño pequeño: `pa-btn--sm`.

**Qué pones tú**: un `<button>` con un verbo que diga lo que pasa («Guardar», «Planificar el día», «Solo esta vez»). Los de icono llevan `aria-label`.

**Cuándo**
- `--primary` solo para la acción que hace avanzar: una por pantalla o por hoja.
- Secundario para alternativas («Ahora no»); `--plain` para acciones de texto dentro de un aviso o fila.
- `--danger` siempre dice el alcance: «Borrar esta vez», nunca «Borrar» a secas en un evento repetido.

**No**: dos principales juntos; botones con solo icono sin `aria-label`; mayúsculas sostenidas.

En el móvil crece a 44 px de alto y 16 px de texto. Pulsarlo lo encoge al 97 % durante `140 ms`.
''')

C['Ficha'] = dict(group='Acciones', height=150, sub='Filtro, ficha activa y ficha reconocida que se puede quitar',
 html='''<div style="display:flex;flex-direction:column;gap:14px;padding:20px">
  <div style="display:flex;flex-wrap:wrap;gap:8px">
    <button class="pa-chip" aria-pressed="false">Todas</button>
    <button class="pa-chip" aria-pressed="true">Hoy</button>
    <button class="pa-chip" aria-pressed="false"><span class="pa-dot pa-dot--c1"></span>Gmail 1</button>
    <button class="pa-chip" aria-pressed="false"><span class="pa-dot pa-dot--c2"></span>Gmail 2</button>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:8px">
    <span class="pa-chip pa-chip--token">{i:calendar}Viernes 21:30<button class="pa-chip__x" aria-label="Quitar fecha">{i:x}</button></span>
    <span class="pa-chip pa-chip--token">{i:repeat}Cada viernes<button class="pa-chip__x" aria-label="Quitar repetición">{i:x}</button></span>
    <span class="pa-chip pa-chip--token"><span class="pa-dot pa-dot--c2"></span>Gmail 2<button class="pa-chip__x" aria-label="Quitar cuenta">{i:x}</button></span>
  </div>
</div>''',
 readme='''# Ficha

Etiqueta pequeña y redonda para filtrar, elegir o mostrar lo que la captura ha entendido.

**Clases**: `pa-chip` como `<button aria-pressed>` para filtros (activa: relleno `accent`, texto `on-accent`); `pa-chip pa-chip--token` para una parte reconocida (fondo `accent-soft`, texto `text`) con `pa-chip__x` para quitarla. Dentro puede ir un icono de 16 px o un `pa-dot` de cuenta.

**Qué pones tú**: el texto corto («Viernes 21:30», «Gmail 2»), el icono si ayuda y el `aria-label` del botón de quitar («Quitar fecha»).

**Cuándo**: filtros de una lista; partes entendidas en la captura (fecha, repetición, cuenta, tipo); periodos de un gráfico cuando no caben en un segmentado.

**No**: más de una fila de fichas de filtro; fichas como botones de acción (usa `Boton`).
''')

C['Tecla'] = dict(group='Acciones', height=110, sub='Atajos de teclado junto a una acción',
 html='''<div style="display:flex;flex-wrap:wrap;gap:18px;align-items:center;padding:20px">
  <span style="display:flex;gap:8px;align-items:center"><span class="pa-muted">Apuntar</span><span class="pa-kbd">⌘</span><span class="pa-kbd">K</span></span>
  <span style="display:flex;gap:8px;align-items:center"><span class="pa-muted">Semana</span><span class="pa-kbd">S</span></span>
  <span style="display:flex;gap:8px;align-items:center"><span class="pa-muted">Todos los atajos</span><span class="pa-kbd">?</span></span>
  <span style="display:flex;gap:8px;align-items:center"><span class="pa-muted">Guardar</span><span class="pa-kbd">↵</span></span>
</div>''',
 readme='''# Tecla

Tecla de atajo alineada a la derecha de una acción, como en los menús del Mac.

**Clase**: `pa-kbd`, una por tecla. Usa la familia `teclas` (la del sistema) porque Inter no trae ⌘ ⌥ ⇧.

**Atajos comunes a toda la app**: ⌘K apuntar o buscar; ⌘1–4 Hoy, Calendario, Tareas, Finanzas; D, S, M, A escalas de tiempo; T ir a hoy; ? lista de atajos; ↵ guardar; esc cerrar.

**Solo en escritorio**: en Android no se muestran.
''')

C['Segmentado'] = dict(group='Acciones', height=120, sub='Escalas de tiempo y periodos',
 html='''<div style="display:flex;flex-direction:column;gap:14px;padding:20px;align-items:flex-start">
  <div class="pa-seg" role="group" aria-label="Escala"><button aria-pressed="false">Día</button><button aria-pressed="true">Semana</button><button aria-pressed="false">Mes</button><button aria-pressed="false">Año</button></div>
  <div class="pa-seg" role="group" aria-label="Periodo"><button aria-pressed="false">1S</button><button aria-pressed="false">1M</button><button aria-pressed="true">3M</button><button aria-pressed="false">1A</button><button aria-pressed="false">Todo</button></div>
</div>''',
 readme='''# Segmentado

Grupo de 2 a 5 opciones excluyentes en una pista; la elegida se eleva.

**Clases**: `pa-seg` con `role="group"` y `aria-label`; cada opción es un `<button aria-pressed>`. Pista `hover` con borde `line`; elegida en `raised` con `shadow-card` y texto `text`.

**Qué pones tú**: las opciones (cortas) y cuál está activa.

**Cuándo**: escalas del Calendario (Día · Semana · Mes · Año, con teclas D S M A) y periodos de Finanzas (1S · 1M · 3M · 1A · Todo). Es el mismo control en ambos sectores.

**No**: más de 5 opciones; acento en la opción elegida (el acento es para «ahora» y la acción principal).
''')

C['Campo'] = dict(group='Entrada', height=150, sub='Campo de texto y búsqueda con atajo',
 html='''<div style="display:flex;flex-direction:column;gap:12px;padding:20px;max-width:420px">
  <label style="display:flex;flex-direction:column;gap:6px"><span class="pa-label">regla de aviso</span><input class="pa-field" value="Cae un 5 % desde su máximo de 30 días"></label>
  <div class="pa-search">{i:search}<span>Apunta o busca…</span><span class="pa-kbd">⌘</span><span class="pa-kbd">K</span></div>
</div>''',
 readme='''# Campo

Campo de una línea y caja de búsqueda de la barra superior.

**Clases**: `pa-field` sobre `<input>` (fondo `raised`, borde `border-control`, foco con anillo `focus` de 2 px). `pa-search` para la búsqueda que abre la captura (icono, texto `text-3` y teclas).

**Qué pones tú**: la etiqueta encima en `pa-label` (minúscula inicial), el valor y el marcador de posición.

**Errores**: debajo, en `secundario` y color `danger`, diciendo qué falta y cómo arreglarlo («Escribe un porcentaje entre 1 y 50»).
''')

C['Captura'] = dict(group='Entrada', height=330, sub='Lenguaje natural con fichas, pregunta si hay duda y vista previa',
 html='''<div style="padding:20px">
 <div class="pa-capture">
  <div class="pa-capture__input">Ensayo <span class="pa-hl">el viernes a las 9:30</span> <span class="pa-hl">cada semana</span> <span class="pa-hl">en Gmail 2</span></div>
  <div class="pa-capture__tokens">
    <span class="pa-chip pa-chip--token">{i:calendar}Viernes 9:30<button class="pa-chip__x" aria-label="Quitar fecha">{i:x}</button></span>
    <span class="pa-chip pa-chip--token">{i:repeat}Cada viernes<button class="pa-chip__x" aria-label="Quitar repetición">{i:x}</button></span>
    <span class="pa-chip pa-chip--token"><span class="pa-dot pa-dot--c2"></span>Gmail 2<button class="pa-chip__x" aria-label="Quitar cuenta">{i:x}</button></span>
    <span class="pa-chip pa-chip--token">{i:calendar-clock}Evento<button class="pa-chip__x" aria-label="Cambiar a tarea">{i:x}</button></span>
  </div>
  <div class="pa-capture__ask"><span>¿Las 9:30 de la mañana o las 21:30?</span><button class="pa-btn pa-btn--sm">9:30</button><button class="pa-btn pa-btn--sm">21:30</button></div>
  <div class="pa-capture__preview">{i:calendar}<span>Se creará un <b>evento</b> en <b>Gmail 2</b>: viernes 24 oct, hora por confirmar, cada viernes.</span></div>
  <div class="pa-capture__foot"><span>Guardar <span class="pa-kbd">↵</span></span><span>Cerrar <span class="pa-kbd">esc</span></span></div>
 </div>
</div>''',
 readme='''# Captura

El campo único para apuntar cualquier cosa en lenguaje natural, con lo entendido a la vista antes de guardar.

**Partes**: `pa-capture` (caja `raised` con `shadow-menu`), `pa-capture__input` (17 px; lo reconocido envuelto en `pa-hl`), `pa-capture__tokens` (una `Ficha --token` por parte entendida: fecha, repetición, cuenta, tipo), `pa-capture__ask` (pregunta cuando hay ambigüedad, fondo `attention-soft`), `pa-capture__preview` (frase con lo que se va a crear y dónde), `pa-capture__foot` (teclas).

**Qué pones tú**: el texto escrito, las partes entendidas, la pregunta si la hay y la frase de vista previa.

**Reglas**
- Nunca guardar una hora ambigua: si «9:30» puede ser mañana o noche, se pregunta (`pa-capture__ask`).
- La vista previa siempre nombra la **cuenta de destino** y el tipo (evento o tarea). Sin cuenta clara, se pregunta.
- Cada ficha se quita con un toque; al quitarla, esa parte vuelve a ser texto.

**Dónde**: ⌘K y atajo global en el Mac; botón ＋ de la barra de pestañas y «Compartir con Pauta» en Android, dentro de una `Hoja`.

Sale de Fantastical (vista previa), Todoist (texto resaltado y fichas) y Things (sugerencia de fecha con su distancia).
''')

C['Casilla'] = dict(group='Entrada', height=110, sub='Pendiente, hecha y opcional',
 html=f'''<div style="display:flex;gap:24px;align-items:center;padding:20px">
  <span style="display:flex;gap:8px;align-items:center">{chk()}<span>Pendiente</span></span>
  <span style="display:flex;gap:8px;align-items:center">{chk('true')}<span>Hecha</span></span>
  <span style="display:flex;gap:8px;align-items:center">{chk('false', ' pa-check--optional')}<span>Opcional</span></span>
</div>''',
 readme='''# Casilla

Círculo para completar una tarea.

**Clase**: `pa-check` sobre `<button role="checkbox" aria-checked>` con el icono `check` dentro. Pendiente: borde `border-control`; hecha: relleno `accent` y marca `on-accent`; opcional: `pa-check--optional` (borde discontinuo).

**Qué pones tú**: el estado y un `aria-label` si la fila no lo deja claro.

El área táctil crece 8 px alrededor (13 px en el móvil) sin cambiar el dibujo. Al completar, la fila pasa a `pa-row--done`.
''')

C['Interruptor'] = dict(group='Entrada', height=190, sub='Apagado, encendido y no disponible, con su texto',
 html='''<div style="display:flex;flex-direction:column;gap:6px;padding:16px 20px;max-width:440px">
  <div class="pa-toggle"><span class="pa-toggle__text"><span class="pa-toggle__title">Añadir el plan a Google Calendar</span><span class="pa-toggle__meta">Antes de escribir te enseño los bloques y la cuenta</span></span><button class="pa-switch" role="switch" aria-checked="false" aria-label="Añadir el plan a Google Calendar"></button></div>
  <div class="pa-toggle"><span class="pa-toggle__text"><span class="pa-toggle__title">Aportación mensual</span><span class="pa-toggle__meta">200 € el día 5</span></span><button class="pa-switch" role="switch" aria-checked="true" aria-label="Aportación mensual"></button></div>
  <div class="pa-toggle"><span class="pa-toggle__text"><span class="pa-toggle__title" style="color:var(--text-3)">Avisar en el Mac</span><span class="pa-toggle__meta">Necesita la app de escritorio</span></span><button class="pa-switch" role="switch" aria-checked="false" aria-label="Avisar en el Mac" disabled></button></div>
</div>''',
 readme='''# Interruptor

Activa o desactiva una opción que se aplica al momento (sin botón de guardar aparte).

**Clases**: `pa-switch` sobre `<button role="switch" aria-checked>`; el botón redondo es un pseudoelemento. Apagado: pista `border-control` y botón `switch-knob`; encendido: pista `accent` y botón `on-accent`; no disponible: `disabled` (opacidad 0,45). Con su texto: `pa-toggle` → `pa-toggle__text` (`pa-toggle__title` + `pa-toggle__meta`) y el interruptor a la derecha.

**Medidas**: 40 × 24 px en el Mac y 48 × 28 px en Android; el área que se puede pulsar llega a 48 px de alto sin cambiar el dibujo. El botón se desliza en `dur-1` (140 ms); con movimiento reducido, cambia sin animación.

**Qué pones tú**: el estado, el texto y un `aria-label` igual al título.

**Cuándo**: opciones de sí o no, como «Añadir el plan a Google Calendar» en Planificar el día o «Aportación mensual» en Añadir fondo. Si al encenderlo se va a escribir en un servicio externo, empieza **apagado**, el texto dice qué se escribirá y la escritura se confirma aparte, indicando la cuenta de destino.

**No**: para elegir entre más de dos opciones (usa `Segmentado`) ni para completar tareas (usa `Casilla`).

Contraste comprobado con `diseno/colores.py`: botón apagado sobre la pista 4,38:1 (oscuro) y 3,31:1 (claro); botón encendido sobre `accent` como el texto `on-accent` (≥ 4,5:1). Sale de los interruptores de macOS y Android, con los colores de Pauta.
''')

def row_task(title, meta='', end='', state='false'):
    return (f'<li class="pa-row pa-row--hover{" pa-row--done" if state == "true" else ""}">{chk(state)}'
            f'<span class="pa-row__main"><span class="pa-row__title">{title}</span>'
            + (f'<span class="pa-row__meta">{meta}</span>' if meta else '') + f'</span><span class="pa-row__end">{end}</span></li>')
SP_UP = '<svg class="pa-spark pa-up" viewBox="0 0 56 20" aria-hidden="true"><line class="base" x1="0" y1="15" x2="56" y2="15"/><polyline points="0,15 10,13 20,14 30,9 40,8 56,4"/></svg>'
SP_DN = '<svg class="pa-spark pa-down" viewBox="0 0 56 20" aria-hidden="true"><line class="base" x1="0" y1="5" x2="56" y2="5"/><polyline points="0,5 10,7 20,6 30,11 40,13 56,16"/></svg>'
SP_FL = '<svg class="pa-spark pa-up" viewBox="0 0 56 20" aria-hidden="true"><line class="base" x1="0" y1="11" x2="56" y2="11"/><polyline points="0,11 10,11 20,10 30,10 40,9 56,9"/></svg>'

C['Fila'] = dict(group='Listas y datos', height=330, sub='La misma fila para tareas, eventos y fondos',
 html='''<div style="padding:12px;max-width:520px">
 <ul class="pa-list">''' + row_task('Pedir cita en la barbería', 'Algún día', '15 min') + row_task('Revisar la factura de la luz', 'Casa', '20 min') + row_task('Renovar el DNI', '', '30 min', 'true') + '''
  <li class="pa-row pa-row--hover"><span class="pa-dot pa-dot--c2"></span><span class="pa-row__main"><span class="pa-row__title">Ensayo</span><span class="pa-row__meta">Opcional · cada viernes · Gmail 2</span></span><span class="pa-row__end">21:30</span></li>
 </ul>
 <ul class="pa-list pa-list--lines" style="margin-top:12px">
  <li class="pa-row"><span class="pa-row__main"><span class="pa-row__title">Fondo indexado mundial</span><span class="pa-row__meta">Valor del 23 oct</span></span><span class="pa-row__end">''' + SP_UP + '''<span class="pa-delta pa-delta--solid pa-delta--up">↑ +0,42 %</span></span></li>
  <li class="pa-row"><span class="pa-row__main"><span class="pa-row__title">Fondo de emergentes</span><span class="pa-row__meta">Valor del 23 oct</span></span><span class="pa-row__end">''' + SP_DN + '''<span class="pa-delta pa-delta--solid pa-delta--down">↓ −1,10 %</span></span></li>
 </ul>
</div>''',
 readme='''# Fila

La pieza básica de toda lista: inicio, título con detalle y un valor al final.

**Partes**: `pa-row` (en `pa-list`; con `pa-row--hover` si se puede pulsar) → inicio (`Casilla`, `pa-dot` de cuenta o icono) · `pa-row__main` con `pa-row__title` y `pa-row__meta` · `pa-row__end` (duración, hora, minigráfico, `Variacion`). Hecha: `pa-row--done`. Seleccionada: `aria-selected="true"` (fondo `accent-soft`). Listas con separadores (Finanzas, inspector): `pa-list--lines`.

**Qué pones tú**: el título (una línea; se corta con «…»), un detalle opcional y un valor final.

**Variantes por sector**
- Tarea: casilla + título + lista o «Algún día» + duración estimada.
- Evento: punto de cuenta + título + «opcional · cada viernes · Gmail 2» + hora.
- Fondo: nombre + tipo y aportación mensual + minigráfico + valor con `Variacion` sólida debajo (como la lista de Bolsa).

**No**: más de un valor al final; texto de dos líneas en el título; iconos de colores distintos por fila.

Altura mínima `row-height` (36 px) en escritorio y `row-height-movil` (52 px) en el móvil. Sale de Things (fila limpia, sin separadores) y Bolsa (minigráfico y variación).
''')

C['Variacion'] = dict(group='Listas y datos', height=110, sub='Subida, bajada y sin cambios; siempre con signo y flecha',
 html='''<div style="display:flex;flex-wrap:wrap;gap:10px;padding:20px">
  <span class="pa-delta pa-delta--up">↑ +0,42 %</span><span class="pa-delta pa-delta--down">↓ −1,10 %</span><span class="pa-delta pa-delta--flat">0,00 %</span>
  <span class="pa-delta pa-delta--up">↑ +312 €</span><span class="pa-delta pa-delta--down">↓ −86,40 €</span>
  <span style="flex-basis:100%"></span>
  <span class="pa-delta pa-delta--solid pa-delta--up">↑ +0,42 %</span><span class="pa-delta pa-delta--solid pa-delta--down">↓ −1,10 %</span>
</div>''',
 readme='''# Variacion

Píldora con el cambio de un valor: flecha, signo y cifra.

**Clases**: `pa-delta` + `pa-delta--up` (`gain` sobre `gain-soft`), `--down` (`loss` sobre `loss-soft`) o `--flat` (`text-2` sobre `hover`). Añade `pa-delta--solid` para la versión de relleno (`on-gain` sobre `gain`, `on-loss` sobre `loss`): es la de las listas de Finanzas, como las píldoras de Bolsa.

**Qué pones tú**: el texto completo con flecha y signo: «↑ +0,42 %», «↓ −1,10 %». Usa el signo menos real (−), coma decimal y espacio antes de % y €.

**Por qué flecha y signo**: verde y rojo no se distinguen bien con algunos tipos de daltonismo; la flecha y el signo dan la información sin depender del color.
''')

C['Cifra'] = dict(group='Listas y datos', height=170, sub='La cifra principal con su variación y su fuente',
 html='''<div style="padding:20px">
  <div class="pa-figure__label">Patrimonio</div>
  <div class="pa-figure__value">48.215,30 €</div>
  <div class="pa-figure__row"><span class="pa-delta pa-delta--up">↑ +1.204 €</span><span class="pa-delta pa-delta--up">↑ +2,6 %</span><span class="pa-muted">en 3 meses</span></div>
  <div class="pa-figure__src">Valores liquidativos del 23 oct · cifras de ejemplo</div>
</div>''',
 readme='''# Cifra

El número más importante de una vista, grande y ligero, con su variación y de dónde sale.

**Partes**: `pa-figure__label` (qué es), `pa-figure__value` (34 px, peso 300, tamaño óptico 32, cifras tabulares; 40 px en el móvil), `pa-figure__row` (una o dos `Variacion` + periodo), `pa-figure__src` (fecha y fuente del dato, `text-3`).

**Qué pones tú**: la etiqueta, el valor formateado en español, la variación y la fecha de los datos.

**Reglas**: una sola cifra por vista; los datos financieros siempre llevan su fecha (los fondos se valoran una vez al día). Sale de Finary (patrimonio en euros) y Parqet (resumen del día).
''')

C['Minigrafico'] = dict(group='Listas y datos', height=110, sub='Tendencia breve dentro de una fila',
 html=f'''<div style="display:flex;gap:24px;align-items:center;padding:20px">{SP_UP}{SP_DN}{SP_FL}</div>''',
 readme='''# Minigrafico

Línea de 56 × 20 px que enseña la tendencia del periodo elegido, sin ejes.

**Clase**: `pa-spark` sobre un `<svg viewBox="0 0 56 20">` con un `<polyline>` y una línea punteada `base` a la altura del valor de partida; el color lo da la clase del contenedor (`pa-up` o `pa-down`, según el resultado del periodo, no la tendencia del tramo).

**Qué pones tú**: los puntos ya escalados al lienzo.

**Dónde**: al final de una `Fila` de fondo, antes de la `Variacion`. Sale de la lista de seguimiento de Bolsa.
''')

SMALL = '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px"><figure style="margin:0;display:flex;flex-direction:column;gap:6px;min-width:0"><svg class="pa-chart pa-chart--up" viewBox="0 0 260 104" role="img" aria-label="Sube en el periodo: verde"><defs><linearGradient id="g-up" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="g0"/><stop offset="1" class="g1"/></linearGradient></defs><line class="baseline" x1="0" y1="57.5" x2="260" y2="57.5"/><path d="M0.0,57.5 L5.0,63.7 L10.0,69.6 L15.0,65.3 L20.0,77.6 L25.0,77.9 L30.0,89.6 L35.0,83.2 L40.0,81.6 L45.0,73.6 L50.0,75.9 L55.0,73.2 L60.0,74.3 L65.0,77.9 L70.0,76.6 L75.0,82.9 L80.0,84.4 L85.0,80.0 L90.0,79.2 L95.0,81.0 L100.0,68.4 L105.0,67.5 L110.0,70.3 L115.0,68.9 L120.0,71.3 L125.0,72.9 L130.0,74.3 L135.0,62.5 L140.0,61.8 L145.0,60.3 L150.0,55.9 L155.0,43.6 L160.0,44.4 L165.0,47.5 L170.0,32.4 L175.0,40.5 L180.0,42.1 L185.0,37.6 L190.0,23.4 L195.0,28.6 L200.0,42.5 L205.0,38.1 L210.0,40.6 L215.0,42.3 L220.0,39.0 L225.0,37.2 L230.0,34.9 L235.0,36.9 L240.0,28.6 L245.0,18.9 L250.0,18.2 L255.0,20.4 L260.0,15.3 L260,99 L0,99 Z" fill="url(#g-up)"/><polyline class="line" points="0.0,57.5 5.0,63.7 10.0,69.6 15.0,65.3 20.0,77.6 25.0,77.9 30.0,89.6 35.0,83.2 40.0,81.6 45.0,73.6 50.0,75.9 55.0,73.2 60.0,74.3 65.0,77.9 70.0,76.6 75.0,82.9 80.0,84.4 85.0,80.0 90.0,79.2 95.0,81.0 100.0,68.4 105.0,67.5 110.0,70.3 115.0,68.9 120.0,71.3 125.0,72.9 130.0,74.3 135.0,62.5 140.0,61.8 145.0,60.3 150.0,55.9 155.0,43.6 160.0,44.4 165.0,47.5 170.0,32.4 175.0,40.5 180.0,42.1 185.0,37.6 190.0,23.4 195.0,28.6 200.0,42.5 205.0,38.1 210.0,40.6 215.0,42.3 220.0,39.0 225.0,37.2 230.0,34.9 235.0,36.9 240.0,28.6 245.0,18.9 250.0,18.2 255.0,20.4 260.0,15.3"/></svg><figcaption class="pa-label">Sube en el periodo: verde</figcaption></figure><figure style="margin:0;display:flex;flex-direction:column;gap:6px;min-width:0"><svg class="pa-chart pa-chart--down" viewBox="0 0 260 104" role="img" aria-label="Baja en el periodo: rojo"><defs><linearGradient id="g-down" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="g0"/><stop offset="1" class="g1"/></linearGradient></defs><line class="baseline" x1="0" y1="47.4" x2="260" y2="47.4"/><path d="M0.0,47.4 L5.0,41.8 L10.0,36.4 L15.0,40.3 L20.0,29.3 L25.0,29.0 L30.0,18.4 L35.0,24.2 L40.0,25.7 L45.0,32.8 L50.0,30.8 L55.0,33.2 L60.0,32.3 L65.0,29.0 L70.0,30.2 L75.0,24.5 L80.0,23.2 L85.0,27.1 L90.0,27.8 L95.0,26.2 L100.0,37.6 L105.0,38.3 L110.0,35.8 L115.0,37.1 L120.0,34.9 L125.0,33.5 L130.0,32.2 L135.0,42.9 L140.0,43.5 L145.0,44.8 L150.0,48.8 L155.0,59.8 L160.0,59.1 L165.0,56.3 L170.0,70.0 L175.0,62.6 L180.0,61.2 L185.0,65.2 L190.0,78.1 L195.0,73.4 L200.0,60.8 L205.0,64.9 L210.0,62.6 L215.0,61.0 L220.0,64.0 L225.0,65.6 L230.0,67.7 L235.0,65.9 L240.0,73.3 L245.0,82.1 L250.0,82.8 L255.0,80.8 L260.0,85.3 L260,99 L0,99 Z" fill="url(#g-down)"/><polyline class="line" points="0.0,47.4 5.0,41.8 10.0,36.4 15.0,40.3 20.0,29.3 25.0,29.0 30.0,18.4 35.0,24.2 40.0,25.7 45.0,32.8 50.0,30.8 55.0,33.2 60.0,32.3 65.0,29.0 70.0,30.2 75.0,24.5 80.0,23.2 85.0,27.1 90.0,27.8 95.0,26.2 100.0,37.6 105.0,38.3 110.0,35.8 115.0,37.1 120.0,34.9 125.0,33.5 130.0,32.2 135.0,42.9 140.0,43.5 145.0,44.8 150.0,48.8 155.0,59.8 160.0,59.1 165.0,56.3 170.0,70.0 175.0,62.6 180.0,61.2 185.0,65.2 190.0,78.1 195.0,73.4 200.0,60.8 205.0,64.9 210.0,62.6 215.0,61.0 220.0,64.0 225.0,65.6 230.0,67.7 235.0,65.9 240.0,73.3 245.0,82.1 250.0,82.8 255.0,80.8 260.0,85.3"/></svg><figcaption class="pa-label">Baja en el periodo: rojo</figcaption></figure><figure style="margin:0;display:flex;flex-direction:column;gap:6px;min-width:0"><svg class="pa-chart pa-chart--inspect" viewBox="0 0 260 104" role="img" aria-label="Inspeccionando un día: acento"><defs><linearGradient id="g-inspect" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="g0"/><stop offset="1" class="g1"/></linearGradient></defs><line class="baseline" x1="0" y1="57.5" x2="260" y2="57.5"/><path d="M0.0,57.5 L5.0,63.7 L10.0,69.6 L15.0,65.3 L20.0,77.6 L25.0,77.9 L30.0,89.6 L35.0,83.2 L40.0,81.6 L45.0,73.6 L50.0,75.9 L55.0,73.2 L60.0,74.3 L65.0,77.9 L70.0,76.6 L75.0,82.9 L80.0,84.4 L85.0,80.0 L90.0,79.2 L95.0,81.0 L100.0,68.4 L105.0,67.5 L110.0,70.3 L115.0,68.9 L120.0,71.3 L125.0,72.9 L130.0,74.3 L135.0,62.5 L140.0,61.8 L145.0,60.3 L150.0,55.9 L155.0,43.6 L160.0,44.4 L165.0,47.5 L170.0,32.4 L175.0,40.5 L180.0,42.1 L185.0,37.6 L190.0,23.4 L195.0,28.6 L200.0,42.5 L205.0,38.1 L210.0,40.6 L215.0,42.3 L220.0,39.0 L225.0,37.2 L230.0,34.9 L235.0,36.9 L240.0,28.6 L245.0,18.9 L250.0,18.2 L255.0,20.4 L260.0,15.3 L260,99 L0,99 Z" fill="url(#g-inspect)"/><polyline class="line" points="0.0,57.5 5.0,63.7 10.0,69.6 15.0,65.3 20.0,77.6 25.0,77.9 30.0,89.6 35.0,83.2 40.0,81.6 45.0,73.6 50.0,75.9 55.0,73.2 60.0,74.3 65.0,77.9 70.0,76.6 75.0,82.9 80.0,84.4 85.0,80.0 90.0,79.2 95.0,81.0 100.0,68.4 105.0,67.5 110.0,70.3 115.0,68.9 120.0,71.3 125.0,72.9 130.0,74.3 135.0,62.5 140.0,61.8 145.0,60.3 150.0,55.9 155.0,43.6 160.0,44.4 165.0,47.5 170.0,32.4 175.0,40.5 180.0,42.1 185.0,37.6 190.0,23.4 195.0,28.6 200.0,42.5 205.0,38.1 210.0,40.6 215.0,42.3 220.0,39.0 225.0,37.2 230.0,34.9 235.0,36.9 240.0,28.6 245.0,18.9 250.0,18.2 255.0,20.4 260.0,15.3"/><line class="cursor" x1="200" y1="4" x2="200" y2="99"/><circle class="point" cx="200" cy="42.5" r="4.5"/></svg><figcaption class="pa-label">Inspeccionando un día: acento</figcaption></figure></div>'

C['Grafico'] = dict(group='Listas y datos', height=330, width=900, sub='Verde si el periodo sube, rojo si baja, acento al inspeccionar; con línea de partida',
 html=f'''<div style="padding:20px;display:flex;flex-direction:column;gap:16px">
  <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center">
    <span style="display:flex;gap:10px;align-items:center"><span class="pa-label">en 1 año</span><span class="pa-delta pa-delta--up">↑ +8,1 %</span><span class="pa-muted" style="font-size:12.5px">índice ↑ +7,4 %</span></span>
    <div class="pa-seg" role="group" aria-label="Periodo"><button aria-pressed="false">1M</button><button aria-pressed="false">3M</button><button aria-pressed="true">1A</button><button aria-pressed="false">Todo</button></div>
  </div>
  {SMALL}
  <div class="pa-legend"><span><i></i>Valor liquidativo</span><span><i class="bench"></i>Índice de referencia</span><span style="display:inline-flex;align-items:center;gap:6px"><span style="width:14px;border-top:1px dashed var(--text-3)"></span>Valor al inicio del periodo</span><span class="pa-faint">Cifras de ejemplo</span></div>
</div>''',
 readme='''# Grafico

Gráfico de línea de un fondo o cartera: verde si el periodo elegido sube, rojo si baja, como en Bolsa.

**El color lo decide el periodo**: compara el último valor con el del inicio del periodo (la línea punteada `baseline`), no la tendencia del tramo. `pa-chart` o `pa-chart--up` usa `gain`; `pa-chart--down`, `loss`; `pa-chart--inspect` (mientras se arrastra o se inspecciona un punto) usa `accent`, el papel que en Bolsa hace el azul.

**Partes del SVG** (clases): `grid`, `axis` (11 px, `text-3`, tabulares, a la derecha), `baseline` (punteada), relleno con degradado (`<linearGradient>` con `<stop class="g0">` y `<stop class="g1">`, del color del gráfico al 32 % hasta transparente; o `area` plano al 14 %), `line` (2 px), `bench` (índice, `text-3` discontinuo), `cursor` y `point` (inspección), `range-edge` y `faded` (tramo entre dos fechas: el tramo se dibuja con su color y el resto al 30 %).

**Qué pones tú**: la serie escalada, el valor de partida, el índice, las etiquetas y el estado (normal, inspección o tramo con su variación encima: «27 feb – 12 jun · ↑ +6,3 %»).

**Reglas**: la variación siempre va escrita con flecha y signo junto al gráfico (el color no basta); cada gráfico responde a una pregunta; sin 3D ni decoración.

Sale de Bolsa (color por periodo, línea de partida, inspección, tramo) y Copilot/getquin (índice de referencia).
''')

C['Tarjeta'] = dict(group='Listas y datos', height=170, sub='Contenedor con título y como mucho un botón de icono',
 html='''<div style="padding:20px;max-width:360px">
 <div class="pa-card">
  <div class="pa-card__head"><div><div class="pa-card__title">Tu dinero hoy</div><div class="pa-card__sub">Desde el cierre de ayer</div></div><button class="pa-btn pa-btn--icon" aria-label="Ocultar">{i:x}</button></div>
  <div style="display:flex;gap:8px;align-items:center"><span class="pa-num" style="font-size:20px">+312 €</span><span class="pa-delta pa-delta--up">↑ +0,4 %</span></div>
 </div>
</div>''',
 readme='''# Tarjeta

Superficie para agrupar un bloque de información en «Hoy» o en un panel.

**Partes**: `pa-card` (fondo `surface`, `radius-lg`, `shadow-card`), `pa-card__head` con `pa-card__title` (y `pa-card__sub`) a la izquierda y como mucho un `Boton --icon` a la derecha.

**Qué pones tú**: el título, el contenido y, si se puede ocultar o abrir, un solo botón.

**No**: tarjetas dentro de tarjetas; tarjetas para cada fila de una lista (las listas van sin tarjeta); barras de color en el borde.
''')

def ev(start, dur, title, time, cls=''):
    lane = ''
    for k in ('lane0', 'lane1'):
        if k in cls: cls = cls.replace(k, '').strip(); lane = f';--lanes:2;--lane:{k[-1]}'
    return f'<div class="pa-ev {cls}" style="--start:{start};--dur:{dur}{lane}">{title}<small>{time}</small></div>'
TG = ('<div class="pa-tg" style="--days:5">'
      '<div class="pa-tg__corner"></div>'
      '<div class="pa-tg__day">lun <span class="pa-tg__num">20</span></div><div class="pa-tg__day">mar <span class="pa-tg__num">21</span></div>'
      '<div class="pa-tg__day pa-tg__day--today">mié <span class="pa-tg__num">22</span></div><div class="pa-tg__day">jue <span class="pa-tg__num">23</span></div>'
      '<div class="pa-tg__day">vie <span class="pa-tg__num">24</span></div>'
      '<div class="pa-tg__hours"><div class="pa-tg__hour">17:00</div><div class="pa-tg__hour">18:00</div><div class="pa-tg__hour">19:00</div><div class="pa-tg__hour">20:00</div><div class="pa-tg__hour">21:00</div><div class="pa-tg__hour">22:00</div><div class="pa-tg__hour">23:00</div></div>'
      '<div class="pa-tg__col">' + ev(0.5, 1, 'Médico', '17:30–18:30') + '</div>'
      '<div class="pa-tg__col">' + ev(1, 1.5, 'Revisar factura', '18:00–19:30', 'pa-ev--task') + '</div>'
      '<div class="pa-tg__col"><div class="pa-tg__now" style="--at:1.6"></div>' + ev(2, 1, 'Comida tardía', '19:00–20:00', 'pa-ev--c2') + '</div>'
      '<div class="pa-tg__col">' + ev(0, 1.5, 'Reunión', '17:00–18:30', 'lane0') + ev(1, 1, 'Llamada', '18:00–19:00', 'pa-ev--c2 pa-ev--conflict lane1') + '</div>'
      '<div class="pa-tg__col">' + ev(4.5, 2, 'Ensayo', 'opcional · 21:30–23:30', 'pa-ev--optional') + '</div>'
      '</div>')

C['RejillaTiempo'] = dict(group='Tiempo', height=420, width=900, sub='Semana con cuentas, tarea colocada, opcional, conflicto y «ahora»',
 html=f'<div style="padding:12px">{TG}</div>',
 readme='''# RejillaTiempo

La rejilla de horas compartida por el día y la semana del Calendario y por «Planificar» de Tareas.

**Partes**: `pa-tg` (con `--days`), `pa-tg__day` (hoy: `pa-tg__day--today`, número en `accent`), `pa-tg__hours` + `pa-tg__hour`, `pa-tg__col` por día (líneas de hora con `line`), `pa-ev` posicionado con `--start` y `--dur` en horas desde la primera hora visible, `pa-tg__now` con `--at` dentro de la columna de hoy.

**Bloques**
- Evento de la cuenta 1: `pa-ev` (relleno `cuenta-1-soft`, barra `cuenta-1`); cuenta 2: `pa-ev--c2`.
- Tarea colocada por Pauta (no es de Google): `pa-ev--task` (fondo `raised`, barra `text-3`).
- Opcional o movible (ensayo, rutinas): `pa-ev--optional` (rayado `hatch` y borde discontinuo).
- Conflicto: `pa-ev--conflict` (punto `danger`), siempre explicado en «Pide atención».
- Ahora: línea y punto en `accent`.

**Qué pones tú**: los días, la primera hora visible, los bloques con su tipo y la hora actual.

**Reglas**: el texto del bloque va en `text` (nunca en el color de la cuenta); la hora en `text-2`; una hora mide `hour-height` (48 px). Sale de Google Calendar (estructura), Notion Calendar (barra lateral del bloque y rayado de lo provisional) y Fantastical (línea de ahora).
''')

C['LineaDia'] = dict(group='Tiempo', height=380, sub='El día en una columna (Android): eventos, tareas, rutinas y huecos',
 html='''<div style="padding:16px;max-width:400px">
 <ul class="pa-dayline">
  <li><span class="pa-dayline__time">10:00</span><span class="pa-dayline__rail"><span class="pa-dayline__node pa-dayline__node--c1"></span></span><span class="pa-dayline__body"><span class="pa-row__title">Revisión del coche</span><span class="pa-row__meta">10:00–11:00 · Gmail 1</span></span></li>
  <li class="free"><span class="pa-dayline__time"></span><span class="pa-dayline__rail"></span><span class="pa-dayline__free">2 h 30 min libres</span></li>
  <li><span class="pa-dayline__time">13:30</span><span class="pa-dayline__rail"><span class="pa-dayline__node pa-dayline__node--now"></span></span><span class="pa-dayline__body"><span class="pa-row__title">Ahora: revisar la factura de la luz</span><span class="pa-row__meta">20 min · tarea</span></span></li>
  <li><span class="pa-dayline__time">21:30</span><span class="pa-dayline__rail"><span class="pa-dayline__node pa-dayline__node--optional"></span></span><span class="pa-dayline__body"><span class="pa-row__title">Ensayo</span><span class="pa-row__meta">Opcional · 21:30–23:30 · Gmail 2</span></span></li>
 </ul>
</div>''',
 readme='''# LineaDia

El día como una sola columna con nodos, para «Planificar» y «Hoy» en el móvil.

**Partes**: `pa-dayline` (lista) → cada `li` con `pa-dayline__time`, `pa-dayline__rail` + `pa-dayline__node` y `pa-dayline__body` (título y detalle con las clases de `Fila`). Nodos: `--c1`, `--c2` (cuentas), `--now` (`accent`), `--optional` (anillo vacío), sin modificador para tareas (`text-3`). Un hueco libre es `li.free` con `pa-dayline__free` y carril discontinuo.

**Qué pones tú**: los elementos del día en orden, con hora, tipo y cuenta, y los huecos libres de más de 30 min.

Es la misma información que la `RejillaTiempo`, con otra forma para pantallas estrechas. Sale de Structured.
''')

import random
random.seed(7)
def year_html():
    meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    dias = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    out = []
    for m, (nombre, n) in enumerate(zip(meses, dias)):
        out.append(f'<span class="pa-year__m">{nombre}</span>')
        for d in range(1, 32):
            if d > n: out.append('<span class="pa-year__c" hidden></span>'); continue
            attrs = ''
            if m == 7 and 4 <= d <= 15: attrs = ' data-libre'
            elif m == 9 and d == 22: attrs = f' data-h="3" data-hoy'
            elif m > 9 or (m == 9 and d > 22): attrs = ''
            else: attrs = f' data-h="{random.choice([0,0,1,1,1,2,2,3,4])}"'
            out.append(f'<span class="pa-year__c"{attrs}></span>')
    return '<div class="pa-year" aria-label="Horas comprometidas por día en 2026 (ejemplo)">' + ''.join(out) + '</div>'
RET = ('<div class="pa-returns"><span></span>' + ''.join(f'<span class="h">{m}</span>' for m in 'E F M A M J J A S O N D'.split()) +
       '<span class="h">2026</span>' + ''.join(f'<span class="{c}">{v}</span>' for c, v in [('u','+1,2'),('d','−0,8'),('u','+2,1'),('u','+0,4'),('d','−1,6'),('u','+0,9'),('u','+1,8'),('d','−0,3'),('u','+0,7'),('u','+0,4'),('e',''),('e','')]) +
       '<span class="h">2025</span>' + ''.join(f'<span class="{c}">{v}</span>' for c, v in [('u','+0,6'),('u','+1,1'),('d','−2,4'),('d','−0,9'),('u','+2,2'),('u','+0,3'),('u','+1,0'),('u','+0,5'),('d','−1,2'),('u','+1,9'),('u','+0,8'),('d','−0,2')]) + '</div>')

C['MapaAnual'] = dict(group='Tiempo', height=560, width=760, sub='El año en una cuadrícula: horas en el Calendario y rentabilidad en Finanzas',
 html=f'''<div style="padding:16px;max-width:720px;display:flex;flex-direction:column;gap:16px">
  {year_html()}
  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px">
   <span class="pa-heatlegend">menos <i style="background:var(--heat-0)"></i><i style="background:var(--heat-1)"></i><i style="background:var(--heat-2)"></i><i style="background:var(--heat-3)"></i><i style="background:var(--heat-4)"></i> más</span>
   <span class="pa-heatlegend"><i style="box-shadow:inset 0 0 0 1px var(--border-control)"></i> días libres · datos de ejemplo</span>
  </div>
  <dl class="pa-stats"><div><dt>semana más cargada</dt><dd>16–22 mar · 41 h</dd></div><div><dt>días libres que quedan</dt><dd>9</dd></div><div><dt>vacaciones apuntadas</dt><dd>4–15 ago</dd></div></dl>
  <div><div class="pa-label" style="margin-bottom:6px">rentabilidad mensual, % (ejemplo)</div>{RET}</div>
</div>''',
 readme='''# MapaAnual

Una cuadrícula para ver el año de un vistazo; la misma pieza en Calendario y en Finanzas.

**Calendario** — `pa-year`: una fila por mes (`pa-year__m`) y 31 celdas `pa-year__c`. `data-h="0…4"` colorea con `heat-0…heat-4` según las horas comprometidas (0 · ≤2 h · 2–4 h · 4–7 h · >7 h). `data-libre` marca días libres o vacaciones (contorno `border-control`); `data-hoy` rodea hoy. Debajo, `pa-heatlegend` y `pa-stats` con las cifras del año.

**Finanzas** — `pa-returns`: una fila por año y 12 columnas; cada celda dice la rentabilidad con signo: `.u` (`gain` sobre `gain-soft`), `.d` (`loss` sobre `loss-soft`), `.e` (mes sin datos).

**Qué pones tú**: las horas por día (o la rentabilidad por mes), los días libres y las estadísticas.

**Reglas**: la escala de horas usa solo el acento (más horas, más intenso); la de rentabilidad lleva siempre la cifra escrita. Sale de BusyCal (mapa de calor y «Overview») y getquin/Parqet (cuadrícula de rentabilidad).
''')

C['Capacidad'] = dict(group='Tiempo', height=210, sub='Lo planificado frente a lo libre; aviso si no cabe',
 html='''<div style="padding:20px;display:flex;flex-direction:column;gap:22px;max-width:420px">
  <div class="pa-capacity" style="--p:41%"><div class="pa-capacity__nums"><span>1 h 30 min planificadas</span><span>3 h 40 min libres</span></div><div class="pa-capacity__bar"><div class="pa-capacity__fill"></div></div></div>
  <div class="pa-capacity pa-capacity--over"><div class="pa-capacity__nums"><span>5 h 10 min planificadas</span><span>3 h 40 min libres</span></div><div class="pa-capacity__bar"><div class="pa-capacity__fill"></div></div>
   <div class="pa-capacity__msg"><span class="pa-dot pa-dot--attention"></span><span>No cabe: sobran 1 h 30 min. Pasa algo a mañana o quita una tarea.</span></div></div>
</div>''',
 readme='''# Capacidad

Barra que compara el tiempo planificado con el tiempo libre del día.

**Partes**: `pa-capacity` con `--p` (porcentaje ocupado), `pa-capacity__nums`, `pa-capacity__bar` + `pa-capacity__fill` (`accent`). Si no cabe: `pa-capacity--over` (relleno `attention`) y `pa-capacity__msg` con el motivo y qué hacer.

**Qué pones tú**: horas planificadas, horas libres (según la agenda de las dos cuentas) y, si sobra, el mensaje.

**Dónde**: «Planificar el día» y el inspector de «Hoy». Sale del aviso de sobrecarga de Sunsama.
''')

C['Aviso'] = dict(group='Avisos', height=300, sub='Elementos de «Pide atención»: conflicto, sobrecarga y regla de Finanzas',
 html='''<div style="padding:16px;display:flex;flex-direction:column;gap:10px;max-width:440px">
  <div class="pa-alert"><span class="pa-dot pa-dot--danger"></span><span class="pa-alert__title">El jueves se solapan dos citas</span><span class="pa-alert__text">Reunión (Gmail 1) y Llamada (Gmail 2), de 18:00 a 18:30.</span><div class="pa-alert__actions"><button class="pa-btn pa-btn--sm">Ver en la semana</button></div></div>
  <div class="pa-alert"><span class="pa-dot pa-dot--attention"></span><span class="pa-alert__title">Un fondo ha caído un 5,2 %</span><span class="pa-alert__text">Desde su máximo de 30 días (2 oct). Tu regla avisa a partir del 5 %.</span><span class="pa-alert__src">Valor liquidativo del 23 oct · gestora</span><div class="pa-alert__actions"><button class="pa-btn pa-btn--sm">Crear tarea «Valorar aportación»</button><button class="pa-btn pa-btn--plain pa-btn--sm">Ajustar la regla</button></div></div>
</div>''',
 readme='''# Aviso

Un elemento de la bandeja «Pide atención»: qué pasa, por qué y qué puedes hacer.

**Partes**: `pa-alert` → `pa-dot` del tipo (`--danger` conflicto, `--attention` sobrecarga o regla), `pa-alert__title` (qué pasa, en una frase), `pa-alert__text` (el dato que lo explica), `pa-alert__src` (fecha y fuente si es un dato externo), `pa-alert__actions` (una acción principal y, como mucho, una secundaria).

**Qué pones tú**: el título, la explicación con cifras y fechas, la fuente y las acciones.

**Reglas**: explica el dato, nunca recomienda («compra ahora» no existe); ofrece crear una tarea, ajustar la regla o descartar. El mismo componente sirve para Calendario, Tareas y Finanzas. Sale de Fintonic (bandeja con motivo e importe), Sunsama (sobrecarga) y Reclaim (conflictos).
''')

C['Inspector'] = dict(group='Carcasa', height=420, sub='Panel de detalle a la derecha (Mac); en Android va en una hoja',
 html='''<div style="padding:12px"><aside class="pa-inspector">
  <div class="pa-label">evento</div>
  <h2 class="pa-insp__title">Ensayo</h2>
  <div class="pa-insp__meta">Viernes 24 oct, 21:30–23:30</div>
  <ul class="pa-insp__rows">
   <li>{i:repeat}<span>Cada viernes<small>Opcional: se puede mover si hace falta</small></span></li>
   <li><span class="pa-dot pa-dot--c2" style="margin:4px"></span><span>Gmail 2<small>Calendario por confirmar</small></span></li>
   <li>{i:clock}<span>Si cambias algo<small>Solo esta vez, salvo que elijas «toda la serie»</small></span></li>
  </ul>
  <div class="pa-insp__actions"><button class="pa-btn pa-btn--sm">Mover esta vez</button><button class="pa-btn pa-btn--danger pa-btn--sm">Saltar esta vez</button></div>
 </aside></div>''',
 readme='''# Inspector

Panel de detalle de lo seleccionado, siempre con el mismo orden: qué, cuándo, de dónde viene, acciones.

**Partes**: `pa-inspector` (ancho `inspector-width`) → `pa-label` (tipo: evento, tarea, fondo), `pa-insp__title`, `pa-insp__meta` (cuándo o valor), `pa-insp__rows` (filas icono + texto + `small` con el detalle), `pa-insp__actions`.

**Qué pones tú**: el elemento seleccionado y sus acciones, que siempre dicen el alcance («Mover esta vez», «Saltar esta vez»).

**Dónde**: columna derecha de la `Carcasa` en el Mac; en Android el mismo contenido va dentro de una `Hoja`. Sale de Notion Calendar (filas con icono) y Things (orden calmado).
''')

C['BarraLateral'] = dict(group='Carcasa', height=330, sub='Sectores, vistas y cuentas (Mac)',
 html='''<div style="padding:12px"><nav class="pa-sidebar" aria-label="Sectores">
  <button class="pa-side__item" aria-current="page">{i:sun}Hoy<span class="pa-side__count">5</span></button>
  <button class="pa-side__item">{i:calendar}Calendario</button>
  <button class="pa-side__item">{i:circle-check}Tareas<span class="pa-side__count">12</span></button>
  <button class="pa-side__item">{i:trending-up}Finanzas</button>
  <button class="pa-side__item">{i:bell}Pide atención<span class="pa-side__count">2</span></button>
  <div class="pa-side__label">cuentas</div>
  <div class="pa-side__account"><span class="pa-dot pa-dot--c1"></span>Gmail 1</div>
  <div class="pa-side__account"><span class="pa-dot pa-dot--c2"></span>Gmail 2</div>
 </nav></div>''',
 readme='''# BarraLateral

Navegación principal del Mac: sectores arriba, cuentas abajo.

**Partes**: `pa-sidebar` (fondo `sidebar`, ancho `sidebar-width`) → `pa-side__item` (icono + nombre + `pa-side__count`; el actual con `aria-current="page"`: fondo `accent-soft`, icono `accent`), `pa-side__label` (grupo en minúscula inicial), `pa-side__account` (punto + nombre de la cuenta).

**Qué pones tú**: los sectores (Hoy, Calendario, Tareas, Finanzas, Pide atención), los recuentos y las cuentas conectadas.

**Reglas**: los sectores son siempre los mismos y en el mismo orden (⌘1–4); dentro de un sector, sus vistas aparecen debajo con sangría. Sale de Things y Notion Calendar (cuentas agrupadas con su color).
''')

C['BarraPestanas'] = dict(group='Carcasa', height=150, sub='Navegación de Android con el botón de apuntar en el centro',
 html='''<div style="padding:24px 12px 12px;max-width:420px"><nav class="pa-tabbar" aria-label="Sectores">
  <button class="pa-tab" aria-current="page">{i:sun}Hoy</button>
  <button class="pa-tab">{i:calendar}Calendario</button>
  <button class="pa-tab--add" aria-label="Apuntar">{i:plus}</button>
  <button class="pa-tab">{i:circle-check}Tareas</button>
  <button class="pa-tab">{i:trending-up}Finanzas</button>
 </nav></div>''',
 readme='''# BarraPestanas

Barra inferior de Android con los cuatro sectores y el botón ＋ de apuntar en el centro.

**Partes**: `pa-tabbar` (fondo `sidebar`, alto `tabbar-height` más el borde seguro) → `pa-tab` (icono de 22 px + nombre; actual con `aria-current="page"` en `accent`) y `pa-tab--add` (círculo `accent` de 52 px que abre la `Captura` en una `Hoja`).

**Qué pones tú**: el sector actual y el recuento de «Pide atención», que en el móvil vive dentro de «Hoy».

**Reglas**: objetivos de al menos `tap` (48 px); la acción principal queda en la mitad inferior, al alcance del pulgar.
''')

C['Hoja'] = dict(group='Carcasa', height=340, sub='Hoja inferior de Android con la captura dentro',
 html='''<div style="padding:12px;max-width:420px"><div class="pa-scrim" style="padding-top:40px;border-radius:var(--radius-xl) var(--radius-xl) 0 0"><div class="pa-sheet">
  <div class="pa-sheet__grabber"></div>
  <h2 class="pa-sheet__title">Apuntar</h2>
  <div class="pa-capture" style="box-shadow:none;padding:12px 0 0;background:transparent">
   <div class="pa-capture__input">Llamar al seguro <span class="pa-hl">mañana a las 10</span></div>
   <div class="pa-capture__tokens"><span class="pa-chip pa-chip--token">{i:calendar}Mañana 10:00<button class="pa-chip__x" aria-label="Quitar fecha">{i:x}</button></span><span class="pa-chip pa-chip--token">{i:circle-check}Tarea<button class="pa-chip__x" aria-label="Cambiar a evento">{i:x}</button></span></div>
  </div>
  <div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="pa-btn pa-btn--primary">Guardar</button></div>
 </div></div></div>''',
 readme='''# Hoja

Panel que sube desde abajo en Android para apuntar, ver un detalle o confirmar algo.

**Partes**: `pa-scrim` (velo) + `pa-sheet` (fondo `surface`, esquinas `radius-xl`, `shadow-sheet`) → `pa-sheet__grabber`, `pa-sheet__title` y el contenido (`Captura`, contenido del `Inspector`, confirmaciones).

**Qué pones tú**: el título, el contenido y la acción principal abajo a la derecha.

**Reglas**: se cierra arrastrando hacia abajo, tocando el velo o con atrás; al cerrarse, el foco vuelve a donde estaba. `backdrop-filter` solo aquí y en la barra de pestañas si hace falta (rendimiento en Android). Abre en `220 ms`.
''')

C['MiniAgenda'] = dict(group='Carcasa', height=330, sub='Desplegable de la barra de menús del Mac',
 html='''<div style="padding:16px"><div class="pa-menubar">
  <div class="pa-mb__next"><span class="pa-label">lo siguiente · en 45 min</span><b>Revisión del coche</b><span class="pa-muted pa-num">10:00–11:00 · Gmail 1</span></div>
  <div class="pa-mb__ev"><span class="bar c2"></span><time>13:30</time>Comida familiar</div>
  <div class="pa-mb__ev"><span class="bar"></span><time>17:00</time>Médico</div>
  <div class="pa-mb__ev"><span class="bar c2"></span><time>21:30</time>Ensayo (opcional)</div>
  <div class="pa-mb__sep"></div>
  <div class="pa-mb__cmd"><span>Apuntar…</span><span><span class="pa-kbd">⌥</span> <span class="pa-kbd">Espacio</span></span></div>
  <div class="pa-mb__cmd"><span>Abrir Pauta</span><span class="pa-kbd">⌘O</span></div>
 </div></div>''',
 readme='''# MiniAgenda

Desplegable de la barra de menús del Mac: lo siguiente, el resto del día y apuntar sin abrir la app.

**Partes**: `pa-menubar` → `pa-mb__next` (lo siguiente y cuánto falta), `pa-mb__ev` (barra de cuenta, hora y título), `pa-mb__sep`, `pa-mb__cmd` (acción con su atajo).

**Qué pones tú**: los eventos que quedan hoy de las dos cuentas y los atajos globales.

Necesita la app de escritorio (Tauri). El equivalente en Android es el widget, más adelante. Sale de Notion Calendar (barra de menús) y Fantastical (mini ventana).
''')

C['Carcasa'] = dict(group='Carcasa', height=600, width=1180, sub='Barra superior, barra lateral, contenido e inspector; en Android, pestañas',
 html=f'''<div style="padding:12px"><div class="pa-shell">
  <header class="pa-toolbar"><div class="pa-lights"><i></i><i></i><i></i></div><div class="pa-search">{{i:search}}<span>Apunta o busca…</span><span class="pa-kbd">⌘</span><span class="pa-kbd">K</span></div><button class="pa-btn pa-btn--icon" aria-label="Inspector">{{i:panel-right}}</button></header>
  <div class="pa-shell__body">
   <nav class="pa-sidebar" aria-label="Sectores"><button class="pa-side__item" aria-current="page">{{i:sun}}Hoy<span class="pa-side__count">3</span></button><button class="pa-side__item">{{i:calendar}}Calendario</button><button class="pa-side__item">{{i:circle-check}}Tareas</button><button class="pa-side__item">{{i:trending-up}}Finanzas</button><div class="pa-side__label">cuentas</div><div class="pa-side__account"><span class="pa-dot pa-dot--c1"></span>Gmail 1</div><div class="pa-side__account"><span class="pa-dot pa-dot--c2"></span>Gmail 2</div></nav>
   <main class="pa-content">
    <div class="pa-viewhead"><div><h1>Hoy</h1><p>Viernes, 24 de octubre</p></div><button class="pa-btn pa-btn--primary">Planificar el día</button></div>
    <ul class="pa-list">
     <li class="pa-row"><span class="pa-dot pa-dot--c1"></span><span class="pa-row__main"><span class="pa-row__title">Revisión del coche</span></span><span class="pa-row__end">10:00</span></li>
     <li class="pa-row"><span class="pa-dot pa-dot--c2"></span><span class="pa-row__main"><span class="pa-row__title">Comida familiar</span></span><span class="pa-row__end">13:30</span></li>
    </ul>
    <div class="pa-section">{{i:circle-check}}<span class="pa-label">tareas</span></div>
    <ul class="pa-list">{row_task('Revisar la factura de la luz', '', '20 min')}{row_task('Pedir cita en la barbería', '', '15 min')}</ul>
    <div class="pa-section">{{i:moon}}<span class="pa-label">esta noche</span></div>
    <ul class="pa-list"><li class="pa-row"><span class="pa-dot pa-dot--c2"></span><span class="pa-row__main"><span class="pa-row__title">Ensayo</span><span class="pa-row__meta">Opcional · Gmail 2</span></span><span class="pa-row__end">21:30</span></li></ul>
   </main>
   <aside class="pa-inspector"><div class="pa-label">pide atención</div><div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
    <div class="pa-alert"><span class="pa-dot pa-dot--attention"></span><span class="pa-alert__title">Mañana no cabe todo</span><span class="pa-alert__text">7 h ocupadas y 3 tareas planificadas.</span></div>
    <div class="pa-card"><div class="pa-card__title">Tu dinero hoy</div><div style="display:flex;gap:8px;align-items:center;margin-top:6px"><span class="pa-num">+312 €</span><span class="pa-delta pa-delta--up">↑ +0,4 %</span></div></div>
   </div></aside>
  </div>
  <nav class="pa-tabbar" aria-label="Sectores"><button class="pa-tab" aria-current="page">{{i:sun}}Hoy</button><button class="pa-tab">{{i:calendar}}Calendario</button><button class="pa-tab--add" aria-label="Apuntar">{{i:plus}}</button><button class="pa-tab">{{i:circle-check}}Tareas</button><button class="pa-tab">{{i:trending-up}}Finanzas</button></nav>
 </div></div>''',
 readme='''# Carcasa

La estructura única de la app: no cambia al pasar de un sector a otro, solo cambia el contenido.

**Mac** — `pa-shell`: `pa-toolbar` (semáforos del sistema, `pa-search` que abre la `Captura`, botón del inspector) y `pa-shell__body` con tres columnas: `BarraLateral` (`sidebar-width`), `pa-content` (con `pa-viewhead`: título de la vista, fecha y la acción principal) e `Inspector` (`inspector-width`, se oculta con su botón).

**Android** (< 640 px) — la barra superior, la lateral y el inspector desaparecen; el contenido ocupa la pantalla y aparece `BarraPestanas`. El inspector se abre como `Hoja`.

**Qué pones tú**: el sector actual, el contenido de la vista y lo seleccionado.

**Reglas**: un título por vista (`titulo-1`), una acción principal, el resto de acciones en el inspector o en la fila. La carcasa es la regla «una carcasa, tres contenidos».
''')

C['CarcasaAndroid'] = dict(group='Carcasa', height=760, width=412, sub='La misma carcasa a 412 px: contenido a pantalla completa y pestañas abajo',
 html=C['Carcasa']['html'].replace('<div style="padding:12px">', '<div>', 1),
 readme='''# CarcasaAndroid

La `Carcasa` en el ancho del Honor 600 Pro (unos 412 px CSS): mismo marcado, otra disposición.

Por debajo de 640 px desaparecen la barra superior, la barra lateral y el inspector; el contenido ocupa la pantalla con margen `space-4` y aparece la `BarraPestanas` con el botón ＋ de apuntar. El inspector y la captura se abren como `Hoja`.

No es un componente aparte: es la vista previa de la carcasa en el móvil, para revisar las dos a la vez.
''')

def write():
    for name, c in C.items():
        d = os.path.join(OUT, name); os.makedirs(d, exist_ok=True)
        sub = c['sub'].replace('"', "'")
        wd = f' width={c["width"]}' if 'width' in c else ''
        html = re.sub(r'(\d) (%|€)', r'\1&nbsp;\2', c['html'])
        prev = f'<!-- @dsCard group="{c["group"]}" height={c["height"]}{wd} subtitle="{sub}" -->\n' + fill(html) + \
               '\n<script>\n/* Vista estática: los estados se muestran tal cual. */\n</script>\n'
        open(os.path.join(d, 'preview.html'), 'w').write(prev)
        open(os.path.join(d, 'README.md'), 'w').write(c['readme'])
    print(len(C), 'componentes')
write()
