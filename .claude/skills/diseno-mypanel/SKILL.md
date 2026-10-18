---
name: diseno-mypanel
description: Dirección visual y reglas de interfaz de myPanel. Usar antes de diseñar o modificar cualquier pantalla, componente, color, tipografía o animación.
---

## Encargo (las palabras del usuario mandan)
- Minimalista, amigable, mucho espacio, jerarquía clara; acabado de app Apple muy pulida **sin copiar** su identidad.
- Oscuro como dirección principal; claro seleccionable; por defecto, la preferencia del sistema.
- Móvil (Android e iPhone; Honor 600 Pro ~412 px de ancho CSS, iPhone desde 390 px) y escritorio (Mac y Windows) diseñados a la vez. **Paridad**: toda pantalla de escritorio tiene su versión móvil y al revés; la matriz está en `docs/producto/09-paridad-de-pantallas.md`.
- Poca información al principio; los detalles se amplían al tocar.

## Sistema actual: Pauta v1 (aprobado por el usuario el 18-10-2026)
- **Fuente única**: `diseno/sistema/` (guía en `README.md`, valores en `tokens.json`, `tokens.css` generado, componentes `pa-*` en `components/bundle.css`). Revisión en vivo: https://claude.ai/artifact/JXsNVroPQxnUhhwAZaB83m. Lee la guía y la ficha del componente antes de tocar una pantalla. No inventes colores, tamaños ni radios sueltos: usa tokens; si falta uno, añádelo a `tokens.json`, comprueba el contraste con `diseno/colores.py` y regenera `tokens.css`.
- Nombre de la app: **Pauta** (el repositorio sigue llamándose myPanel). Icono: tres líneas del día, la de «ahora» en acento.
- Estilo nativo de Mac, plano y tranquilo: superficies grafito separadas por bordes finos, **sin cristal, degradados ni resplandores** (la dirección v2 queda sustituida).
- Tipografía **Inter Variable** con tamaño óptico, alojada con la app; pesos 300 (cifras), 400 (texto), 500 (controles), 600 (títulos), nunca más.
- **Un solo acento, lavanda plana** (`accent`): «ahora», foco, selección y acción principal. Semánticos aparte (`gain`/`loss` siempre con flecha y signo, `attention`, `danger`). Cuentas (varias de Google, Microsoft…): `cuenta-1` cielo, `cuenta-2` melocotón, `cuenta-3` rosa, `cuenta-4` turquesa, solo como punto, barra o nombre, y nunca sin el nombre de la cuenta.
- Gráficos financieros como Bolsa: línea y degradado `gain` si el periodo sube y `loss` si baja, contra la línea punteada del valor de partida; `accent` solo al inspeccionar un punto; píldoras sólidas (`pa-delta--solid`) en las listas.
- Una carcasa para todo: barra lateral, contenido e inspector en el Mac; contenido + pestañas con ＋ en Android (< 640 px). Mismo problema, misma pieza (`Fila`, `RejillaTiempo`, `MapaAnual`, `Aviso`, `Captura`).
- Cada tarjeta: título (+ subtítulo) a la izquierda y como mucho un botón de icono a la derecha.
- Rayado = opcional; sólido = fijo; punto rojo = conflicto. Cada gráfico responde a una pregunta del usuario; nada decorativo.
- `backdrop-filter` solo en hojas y barra de pestañas (rendimiento en Android).
- Etiquetas de sección en minúscula inicial, sin mayúsculas sostenidas ni numeraciones decorativas.
- Horas y cifras tabulares (`pa-num`). Nunca mostrar una hora ambigua sin preguntar. Formatos: «vie 23 oct», «21:30–23:30», «1 h 30 min», «12.480,35 €», «↓ −1,10 %».
- Iconos Lucide 1.50.0 en `currentColor`, trazo 1,75 a 16 px.

## Calidad mínima
- Contraste ≥ 4,5:1 en texto e indicadores ≥ 3:1 (comprobar con un script, no a ojo).
- Objetivos táctiles ≥ 48 px; acciones principales en la mitad inferior en móvil.
- Movimiento solo como respuesta a una acción, 140–320 ms; `prefers-reduced-motion` lo desactiva.
- Foco visible, navegación por teclado, diálogos que devuelven el foco al cerrarse.

## Proceso
1. Plan breve (tokens afectados, composición en ASCII) y contrástalo con el encargo.
2. Implementa.
3. Revisa con la skill `revision-visual` y mira las capturas tú mismo antes de dar algo por bueno.
4. Si el plugin oficial `frontend-design` está activo, úsalo como guía de proceso; este archivo prevalece si hay conflicto.
