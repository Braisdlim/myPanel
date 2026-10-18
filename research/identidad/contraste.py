"""Contraste WCAG de las paletas candidatas (texto >= 4,5:1; indicadores >= 3:1)."""
def lum(h):
    h = h.lstrip('#'); r, g, b = (int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= .03928 else ((c + .055) / 1.055) ** 2.4
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(b)
def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True); return (la + .05) / (lb + .05)

base = {
  'oscuro': dict(bg='#0E0F13', surface='#17181D', raised='#202128', text='#F2F3F5', text2='#A6A9B3', text3='#8E919C',
                 gain='#5FD08F', loss='#FF7F7F', attention='#F2CC6B', personal='#6CC4F5', secundaria='#F7A86E'),
  'claro':  dict(bg='#F4F4F6', surface='#FFFFFF', raised='#FFFFFF', text='#16171B', text2='#565963', text3='#696C76',
                 gain='#1D7F47', loss='#C42F38', attention='#8A5E00', personal='#0A6FA6', secundaria='#A8520E'),
}
acentos = {
  'lavanda': dict(oscuro=('#B7A2FF', '#16102E'), claro=('#6A4BDB', '#FFFFFF')),
  'indigo':  dict(oscuro=('#8E9EFF', '#0D1233'), claro=('#3B4FD6', '#FFFFFF')),
  'ambar':   dict(oscuro=('#F2B55E', '#2A1A00'), claro=('#9A5800', '#FFFFFF')),
}
ok = True
for tema, c in base.items():
    for k in ('text', 'text2', 'text3', 'gain', 'loss', 'attention', 'personal', 'secundaria'):
        for fondo in ('bg', 'surface', 'raised'):
            r = ratio(c[k], c[fondo]); bien = r >= 4.5; ok &= bien
            if not bien or fondo == 'surface': print(f'{tema:6} {k:10} sobre {fondo:7} {r:5.2f} {"OK" if bien else "FALLA"}')
    for nombre, a in acentos.items():
        acc, ink = a[tema]
        for fondo in ('bg', 'surface'):
            r = ratio(acc, c[fondo]); bien = r >= 4.5; ok &= bien
            print(f'{tema:6} acento {nombre:8} sobre {fondo:7} {r:5.2f} {"OK" if bien else "FALLA"}')
        r = ratio(ink, acc); bien = r >= 4.5; ok &= bien
        print(f'{tema:6} texto del botón {nombre:8} {r:5.2f} {"OK" if bien else "FALLA"}')
print('TODO OK' if ok else 'HAY FALLOS')
