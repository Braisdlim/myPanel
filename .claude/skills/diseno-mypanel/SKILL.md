---
name: diseno-mypanel
description: Dirección visual y reglas de interfaz de myPanel. Usar antes de diseñar o modificar cualquier pantalla, componente, color, tipografía o animación.
---

## Encargo (las palabras del usuario mandan)
- Minimalista, amigable, mucho espacio, jerarquía clara; acabado de app Apple muy pulida **sin copiar** su identidad.
- Oscuro como dirección principal; claro seleccionable; por defecto, la preferencia del sistema.
- Móvil Android (Honor 600 Pro, ~412 px de ancho CSS) y escritorio diseñados a la vez.
- Poca información al principio; los detalles se amplían al tocar.

## Sistema actual
- Tokens en `prototype/src/styles/tokens.css` (se moverán a la app). No inventes colores sueltos: usa tokens.
- Dirección v2 (referencias del usuario: paneles oscuros de cristal tipo *bento*): fondo casi negro con brillos ambientales, tarjetas de cristal (borde fino + brillo superior), tarjeta «Lo siguiente» como única con degradado y luz.
- Tipografía Outfit (alternativa Plus Jakarta Sans) con pesos ligeros: cifras grandes en 300, títulos en 400–500; nada de negritas pesadas.
- Acento lavanda en degradado (`--accent-grad`) solo para «ahora», foco y acción principal; variante ámbar disponible. Color de cuenta solo como punto + nombre en texto.
- Cada tarjeta: título (+ subtítulo) a la izquierda y como mucho un botón de icono a la derecha.
- Rayado = opcional; sólido = fijo; punto rojo = conflicto. Cada gráfico responde a una pregunta del usuario; nada decorativo.
- `backdrop-filter` solo en barra flotante y hojas (rendimiento en Android).
- Etiquetas de sección en minúscula inicial, sin mayúsculas sostenidas ni numeraciones decorativas.
- Horas con cifras tabulares (`.num`). Nunca mostrar una hora ambigua sin preguntar.

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
