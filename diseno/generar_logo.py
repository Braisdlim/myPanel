import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
font_path, out = sys.argv[1], sys.argv[2]
f = TTFont(font_path); f = instantiateVariableFont(f, {'wght': 620, 'opsz': 32})
gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm; hmtx = f['hmtx']
def word(text, size, x0, base, ls=-0.02):
    s = size / upm; pen = SVGPathPen(gs); x = x0
    prev = None
    for ch in text:
        g = cmap[ord(ch)]
        tp = TransformPen(pen, (s, 0, 0, -s, x, base)); gs[g].draw(tp)
        x += hmtx[g][0] * s + ls * size
    return pen.getCommands(), x
INK, ACC, G1, G2 = '#F2F3F5', '#B7A2FF', '#202128', '#0E0F13'
LIC = '<!-- Pauta. Logotipo con contornos de Inter (OFL-1.1). -->\n'
def bars(scale, ox, oy, ink=INK, acc=ACC, mono=None):
    # Marca: tres líneas del día; la de «ahora» en acento con su punto. Retícula de 100.
    c = lambda v: round(v * scale, 2)
    a = mono or acc; i1 = mono or ink
    o = 1 if mono else .45
    return (f'<rect x="{c(22)+ox}" y="{c(30)+oy}" width="{c(56)}" height="{c(7)}" rx="{c(3.5)}" fill="{i1}" fill-opacity="{1 if mono else .92}"/>'
            f'<rect x="{c(22)+ox}" y="{c(46.5)+oy}" width="{c(40)}" height="{c(7)}" rx="{c(3.5)}" fill="{a}"/>'
            f'<circle cx="{c(72)+ox}" cy="{c(50)+oy}" r="{c(5.5)}" fill="{a}"/>'
            f'<rect x="{c(22)+ox}" y="{c(63)+oy}" width="{c(30)}" height="{c(7)}" rx="{c(3.5)}" fill="{i1}" fill-opacity="{o}"/>')
grad = f'<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{G1}"/><stop offset="1" stop-color="{G2}"/></linearGradient></defs>'
# 1) Icono para web, PWA y Android (cuadrado completo; la máscara la pone el sistema)
open(f'{out}/pauta-icono.svg', 'w').write(LIC + f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">{grad}<rect width="512" height="512" rx="115" fill="url(#f)"/>{bars(5.12, 0, 0)}</svg>\n')
# 2) Icono de macOS: lienzo de 1024 con la forma de 824 centrada (plantilla habitual de macOS)
open(f'{out}/pauta-icono-macos.svg', 'w').write(LIC + f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">{grad}<rect x="100" y="100" width="824" height="824" rx="185" fill="url(#f)"/>{bars(8.24, 100, 100)}</svg>\n')
# 3) Capa frontal adaptable de Android: lienzo de 108, marca dentro de la zona segura de 66
open(f'{out}/pauta-android-frente.svg', 'w').write(LIC + f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="432" height="432">{bars(0.9, 9, 9)}</svg>\n')
# 4) Monocromo (iconos temáticos de Android, plantillas)
open(f'{out}/pauta-monocromo.svg', 'w').write(LIC + f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="432" height="432">{bars(0.9, 9, 9, mono="#16171B")}</svg>\n')
# 5) Logotipo horizontal: icono + palabra, para fondo oscuro y para fondo claro
for name, ink, ground in (('pauta-logotipo-oscuro', INK, None), ('pauta-logotipo-claro', '#16171B', None)):
    d, w = word('Pauta', 64, 104, 70)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {int(w)+6} 96" width="{int(w)+6}" height="96">{grad}'
           f'<rect x="8" y="8" width="80" height="80" rx="18" fill="url(#f)"/>{bars(0.8, 8, 8)}<path d="{d}" fill="{ink}"/></svg>\n')
    open(f'{out}/{name}.svg', 'w').write(LIC + svg)
print('ok')
