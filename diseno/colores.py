"""Fuente de los colores de Pauta: genera la lista de tokens y comprueba el contraste
de cada par que se usa (texto 4,5:1; bordes, iconos y foco 3:1), componiendo las transparencias."""
import json, sys

T = {  # nombre: (oscuro, claro, uso)
 'bg':           ('#0E0F13', '#F4F4F6', 'Fondo de la ventana (Mac) y de la pantalla (Android).'),
 'sidebar':      ('#131419', '#ECECEF', 'Barra lateral del Mac, barra de pestañas de Android y menú de la barra de menús.'),
 'surface':      ('#17181D', '#FFFFFF', 'Tarjetas, inspector, celdas de la rejilla de tiempo y hojas.'),
 'raised':       ('#202128', '#FFFFFF', 'Controles, fichas, campos y menús, por encima de surface (en claro se separan con sombra).'),
 'hover':        ('#FFFFFF0D', '#14161E0A', 'Fondo de una fila o botón al pasar el puntero o mantener pulsado.'),
 'line':         ('#FFFFFF14', '#14161E17', 'Separadores entre filas y entre zonas de la carcasa.'),
 'line-strong':  ('#FFFFFF24', '#14161E29', 'Borde de tarjetas en claro y de menús; contorno discontinuo de lo opcional.'),
 'border-control': ('#6E717C', '#8A8D97', 'Borde de campos, casillas y controles que deben verse (3:1 sobre surface y raised).'),
 'switch-knob':  ('#F2F3F5', '#FFFFFF', 'Botón del interruptor apagado, sobre la pista border-control (3:1). Encendido, el botón es on-accent sobre accent.'),
 'text':         ('#F2F3F5', '#16171B', 'Texto principal sobre bg, sidebar, surface, raised y los fondos suaves.'),
 'text-2':       ('#A6A9B3', '#565963', 'Texto secundario: detalle de una fila, subtítulos, etiquetas de campos. Sobre bg, sidebar, surface y raised.'),
 'text-3':       ('#8E919C', '#62656F', 'Texto terciario: horas de la rejilla, etiquetas de sección, marcadores de posición. Sobre bg, sidebar, surface y raised.'),
 'accent':       ('#B7A2FF', '#6A4BDB', 'El único acento: «ahora», foco, selección, la acción principal y el gráfico mientras se inspecciona un punto. Texto y marcas sobre bg, sidebar y surface.'),
 'on-accent':    ('#16102E', '#FFFFFF', 'Texto e iconos sobre un relleno accent (botón principal, ficha activa).'),
 'accent-soft':  ('#B7A2FF29', '#6A4BDB1A', 'Fondo de la selección en la barra lateral y de las partes reconocidas en la captura; el texto encima es text.'),
 'focus':        ('{accent}', '{accent}', 'Anillo de foco de 2 px; supera 3:1 sobre todas las superficies.'),
 'gain':         ('#5FD08F', '#19723F', 'Subidas y ganancias; siempre con signo + y flecha ↑. Línea y relleno del gráfico cuando el periodo sube. Sobre bg, surface y gain-soft.'),
 'on-gain':      ('#08261A', '#FFFFFF', 'Texto de la píldora sólida de subida (lista de Finanzas, como Bolsa).'),
 'gain-soft':    ('#5FD08F24', '#19723F1A', 'Fondo de la píldora de variación positiva y de las celdas positivas de la cuadrícula anual.'),
 'loss':         ('#FF7F7F', '#C42F38', 'Bajadas y pérdidas; siempre con signo − y flecha ↓. Línea y relleno del gráfico cuando el periodo baja. Sobre bg, surface y loss-soft.'),
 'on-loss':      ('#3A0A10', '#FFFFFF', 'Texto de la píldora sólida de bajada.'),
 'loss-soft':    ('#FF7F7F24', '#C42F381A', 'Fondo de la píldora de variación negativa y de las celdas negativas.'),
 'danger':       ('{loss}', '{loss}', 'Conflictos de agenda (punto) y acciones que borran. Siempre acompañado de texto.'),
 'attention':    ('#F2CC6B', '#8A5E00', 'Avisos de «Pide atención»: sobrecarga, reglas de Finanzas. Punto o icono con texto.'),
 'attention-soft': ('#F2CC6B1F', '#8A5E0014', 'Fondo de un aviso destacado.'),
 'cuenta-1':     ('#6CC4F5', '#0A6FA6', 'Color de la primera cuenta de Gmail: punto, barra del evento y texto de su nombre.'),
 'cuenta-1-soft':('#6CC4F529', '#0A6FA61A', 'Relleno de los eventos de la cuenta 1 en la rejilla; el texto encima es text.'),
 'cuenta-2':     ('#F7A86E', '#A8520E', 'Color de la segunda cuenta de Gmail: punto, barra del evento y texto de su nombre.'),
 'cuenta-2-soft':('#F7A86E29', '#A8520E1A', 'Relleno de los eventos de la cuenta 2 en la rejilla; el texto encima es text.'),
 'heat-0':       ('#1D1E25', '#E9E9EE', 'Mapa anual: día sin compromisos.'),
 'heat-1':       ('#2C2944', '#E2DBFA', 'Mapa anual: hasta 2 h comprometidas.'),
 'heat-2':       ('#423874', '#C7B8F5', 'Mapa anual: de 2 a 4 h.'),
 'heat-3':       ('#7963CC', '#9C85EA', 'Mapa anual: de 4 a 7 h.'),
 'heat-4':       ('#B7A2FF', '#6A4BDB', 'Mapa anual: más de 7 h.'),
 'hatch':        ('#FFFFFF24', '#14161E24', 'Rayas del relleno de lo opcional (ensayo, rutinas que se pueden mover).'),
 'scrim':        ('#04050899', '#14161E4D', 'Velo detrás de hojas y diálogos.'),
}
ORDER = list(T)

def hx(c):
    c = c.lstrip('#'); a = int(c[6:8], 16) / 255 if len(c) == 8 else 1
    return [int(c[i:i+2], 16) for i in (0, 2, 4)], a
def over(fg, bg):
    (f, a), (b, _) = hx(fg), hx(bg)
    return '#' + ''.join(f'{round(f[i]*a + b[i]*(1-a)):02X}' for i in range(3))
def res(name, th):
    v = T[name][0 if th == 'oscuro' else 1]
    return res(v[1:-1], th) if v.startswith('{') else v
def lum(c):
    rgb, _ = hx(c); f = lambda x: x/12.92 if x <= .03928 else ((x+.055)/1.055)**2.4
    r, g, b = (f(x/255) for x in rgb); return .2126*r + .7152*g + .0722*b
def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True); return (la+.05)/(lb+.05)

PAIRS = []  # (primer plano, fondo, [fondo bajo si el fondo es translúcido], mínimo)
for t in ('text', 'text-2', 'text-3'):
    for g in ('bg', 'sidebar', 'surface', 'raised'): PAIRS.append((t, g, None, 4.5))
for g in ('bg', 'sidebar', 'surface'): PAIRS += [('accent', g, None, 4.5)]
PAIRS += [('on-accent', 'accent', None, 4.5), ('text', 'accent-soft', 'sidebar', 4.5), ('text', 'accent-soft', 'surface', 4.5)]
for s in ('gain', 'loss', 'attention', 'cuenta-1', 'cuenta-2'):
    for g in ('bg', 'surface'): PAIRS.append((s, g, None, 4.5))
PAIRS += [('on-gain', 'gain', None, 4.5), ('on-loss', 'loss', None, 4.5), ('gain', 'gain-soft', 'surface', 4.5), ('loss', 'loss-soft', 'surface', 4.5), ('text', 'attention-soft', 'surface', 4.5),
          ('text', 'cuenta-1-soft', 'surface', 4.5), ('text', 'cuenta-2-soft', 'surface', 4.5)]
for g in ('surface', 'raised', 'bg'): PAIRS.append(('border-control', g, None, 3.0))
PAIRS += [('switch-knob', 'border-control', None, 3.0), ('accent', 'raised', None, 3.0)]
for g in ('bg', 'sidebar', 'surface', 'raised'): PAIRS.append(('focus', g, None, 3.0))
PAIRS += [('heat-4', 'heat-0', None, 3.0), ('heat-3', 'surface', None, 3.0)]

fallos = 0; out = []
for th in ('oscuro', 'claro'):
    for fg, bg, under, m in PAIRS:
        b = res(bg, th); b = over(b, res(under, th)) if under else b
        f = res(fg, th); f = over(f, b) if len(f) == 9 else f
        r = ratio(f, b); ok = r >= m; fallos += not ok
        out.append(f'{th:6} {fg:15} sobre {bg + ("/" + under if under else ""):22} {r:5.2f}  mín {m}  {"OK" if ok else "FALLA"}')
print('\n'.join(out)); print('TODO OK' if not fallos else f'{fallos} FALLOS')

if len(sys.argv) > 1:
    toks = []
    for n in ORDER:
        d, l, u = T[n]
        toks.append({'name': n, 'value': {'dark': d, 'light': l}, 'usage': u})
    json.dump(toks, open(sys.argv[1], 'w'), ensure_ascii=False, indent=1)
