"""Genera tokens.css a partir de tokens.json (única fuente de los valores de Pauta).
Uso: python3 diseno/generar_tokens_css.py diseno/sistema/tokens.json diseno/sistema/tokens.css [ruta-de-fuentes]"""
import json, re, sys

src, dst = sys.argv[1], sys.argv[2]
font_base = sys.argv[3] if len(sys.argv) > 3 else ''
t = json.load(open(src))
themes = [th['id'] for th in t['color']['themes']]

def val(v):
    m = re.fullmatch(r'\{(.+)\}', v)
    return f'var(--{m.group(1)})' if m else v

def per_theme(tokens, th):
    out = []
    for tok in tokens:
        v = tok['value']
        if isinstance(v, str):
            if th == themes[0]: out.append(f'  --{tok["name"]}: {val(v)};')
        elif th in v:
            out.append(f'  --{tok["name"]}: {val(v[th])};')
    return out

lines = [f'/* {t["name"]} — generated from tokens.json */']
for f in t['type'].get('fonts', []):
    url = font_base + f['file'].split('/')[-1] if font_base else f['file']
    lines.append(f'@font-face {{ font-family: "{f["family"]}"; src: url("{url}") format("woff2"); '
                 f'font-weight: {f["weight"]}; font-style: {f.get("style", "normal")}; font-display: swap; }}')
for i, th in enumerate(themes):
    sel = f':root, [data-theme="{th}"]' if i == 0 else f'[data-theme="{th}"]'
    body = per_theme(t['color']['tokens'], th) + per_theme(t.get('shadow', {}).get('tokens', []), th)
    lines.append(sel + ' {\n' + '\n'.join(body) + f'\n  color-scheme: {"dark" if th == "dark" else "light"};\n}}')
root = []
for fam in ('spacing', 'radius', 'size'):
    root += [f'  --{x["name"]}: {x["value"]};' for x in t.get(fam, {}).get('tokens', [])]
root += [f'  --font-{k}: {v};' for k, v in t['type']['families'].items()]
lines.append(':root {\n' + '\n'.join(root) + '\n}')
for g in t['type']['groups']:
    for s in g['styles']:
        fam = s.get('family', g['family'])
        decl = [f'font-family: var(--font-{fam})', f'font-size: {s["fontSize"]}', f'line-height: {s["lineHeight"]}', f'font-weight: {s["fontWeight"]}']
        if 'letterSpacing' in s: decl.append(f'letter-spacing: {s["letterSpacing"]}')
        if 'opticalSize' in s: decl.append(f'font-variation-settings: "opsz" {s["opticalSize"]}')
        lines.append(f'.{s["name"]} {{ ' + '; '.join(decl) + '; }')
open(dst, 'w').write('\n'.join(lines) + '\n')
print('ok', dst)
