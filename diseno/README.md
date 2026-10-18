# Sistema de diseño de Pauta

Versión 1 (18-10-2026). Página de revisión con vistas previas en vivo (privada): https://claude.ai/artifact/JXsNVroPQxnUhhwAZaB83m

Esta carpeta es la **única fuente** de los valores visuales de la app. La página de arriba es una copia para revisarla; si cambia una, se actualiza la otra.

| Ruta | Qué es |
|---|---|
| `sistema/README.md` | Guía de estilo: principios, cómo se escribe, color, tipografía, espacios, estados, iconos y logotipo |
| `sistema/referencias.md` | De qué app de referencia sale cada decisión |
| `sistema/tokens.json` | Colores (oscuro y claro), tipografía, espacios, radios, sombras y medidas |
| `sistema/tokens.css` | Generado desde `tokens.json`; es lo que importa la app |
| `sistema/components/bundle.css` | Componentes (clases `pa-*`), escritorio y móvil |
| `sistema/components/<Nombre>/` | Guía (`README.md`) y vista previa (`preview.html`) de cada componente |
| `sistema/fonts/` | Inter Variable (OFL-1.1), alojada con la app |
| `sistema/assets/` | Logotipos e iconos (Lucide 1.50.0, ISC) |

## Regenerar

```sh
python3 diseno/colores.py diseno/colores.json      # comprueba el contraste de todos los pares (y exporta la lista de colores)
python3 diseno/generar_tokens_css.py diseno/sistema/tokens.json diseno/sistema/tokens.css fonts/
```

`generar_componentes.py` y `generar_logo.py` son los scripts que crearon las vistas previas (iconos copiados de `lucide-static`) y los logotipos (contornos de Inter); necesitan los paquetes descargados de npm y se dejan como registro.

## Comprobaciones hechas
- Contraste: 112 pares, todos ≥ 4,5:1 en texto y ≥ 3:1 en bordes, iconos y foco, en los dos temas (`research/identidad/resultado-tokens.txt`).
- Vistas previas renderizadas en escritorio y a 412 px (Honor 600 Pro), temas oscuro y claro, sin desbordes ni errores de carga.
