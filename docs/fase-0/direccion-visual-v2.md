# Fase 0c — Dirección visual v2

Fecha: **18 de octubre de 2026**. Prototipo: https://claude.ai/artifact/1J3LjR2F2K3Mu3tsYqtsuM (privado). Capturas: [`capturas-v2/`](capturas-v2/). La v1 sigue en [`capturas/`](capturas/) y en el selector «Composición» del prototipo.

## 1. Qué tomo de tus referencias

Esta vez sí he visto las imágenes (las pegaste en el chat). El enlace de Dribbble no lo he podido abrir: la red del entorno lo bloquea.

| Referencia | Qué tomo | Qué no tomo |
|---|---|---|
| Panel «Welcome, Michael» (oscuro, lila) | Saludo grande con peso **regular**, no negrita; rejilla *bento* de tarjetas con título a la izquierda y **un solo botón de icono** a la derecha; barras **rayadas** para lo parcial; barra lateral agrupada con buscador y atajo; degradado lila-rosa como acento. | Gráficos decorativos sin significado, avatares y tarjetas de tareas densas. |
| «Investment Dashboard» (cristal sobre degradado vivo) | Superficies translúcidas con borde fino y brillo superior; cifras grandes y finas; controles en píldora. | El fondo saturado entero: cansa a diario y baja el contraste. En su lugar uso brillos ambientales suaves. |
| «LuxAuto» (azul noche, dorado) | Brillo de luz en la esquina de la tarjeta destacada; un acento cálido único (lo dejo como variante «Ámbar»). | Burbujas y barras 3D: lucen, pero informan poco. |
| Kit «From Tokens to Components» (por el título) | Construir **de tokens a componentes**: añado la pantalla «Sistema de diseño» al prototipo. | — |

**Regla que aplico** [P]: cada gráfico tiene que responder a una pregunta tuya. Por eso solo hay dos: **«Tu tarde»** (cuánto tiempo libre te queda hoy) y **«Esta semana»** (horas comprometidas por día, con lo opcional rayado y el conflicto del viernes marcado).

## 2. Qué cambia de la v1 a la v2

| Aspecto | v1 | v2 |
|---|---|---|
| Fuente | Figtree, pesos 600–720 | **Outfit** (geométrica, como tus referencias) con pesos 300–560. Alternativa en el selector: Plus Jakarta Sans. |
| Jerarquía | Negritas | Tamaño grande y ligero para lo importante; todo lo demás, pequeño y tranquilo |
| Superficies | Planas; solo la tarjeta principal tenía material | Tarjetas de cristal con borde fino y brillo superior; la principal, con degradado y luz |
| Fondo | Gris azulado con grano | Casi negro con brillos ambientales lila, rosa y azul |
| Acento | Ámbar | **Lavanda en degradado** (el ámbar queda como variante) |
| Escritorio | Tres pruebas distintas | Barra lateral agrupada + *bento* de 12 columnas |
| Móvil | Barra de pestañas | Barra flotante de cristal con botón central para apuntar |
| Pantallas | Hoy, captura, búsqueda | + **Planificar** (línea del día con huecos libres), Pendientes y **Sistema de diseño** |

He combinado lo que propuse en la ronda anterior: el foco de C, la captura de A y la línea del día de B, que pasa a ser «Planificar».

## 3. Calidad comprobada
- **Contraste** (script sobre los tokens, teniendo en cuenta el cristal y la zona de más brillo): todo el texto ≥ 4,5:1 en ambos temas. He corregido dos fallos: el texto terciario en oscuro (4,02 → 4,85) y el texto blanco sobre el degradado en claro (2,68 → ≥ 4,6, oscureciendo el degradado).
- **Rendimiento** [I]: el desenfoque de fondo (`backdrop-filter`) solo está en la barra flotante y en las hojas. Las tarjetas son translúcidas sobre un fondo estático, así que no lo necesitan; así se evita que vaya a tirones en un Android de gama media.
- **Diseño adaptable**: las tarjetas usan *container queries*, de modo que su contenido se reorganiza según el ancho de la tarjeta y no solo según la pantalla. Ejemplos: el anillo pasa a fila en móvil y los botones de «Pide atención» bajan bajo el texto.
- **Pendiente**: el gesto atrás de Android, una auditoría completa de teclado y medir la velocidad en tu Honor.

## 4. Siguiente paso: cerrar el diseño y empezar la fase 1a

**Paso 1 · Revisión de la v2 (tú, 10 minutos en el Honor y en el PC)**: abre el prototipo y, en «Revisión», prueba acento (Lavanda/Ámbar), fuente (Outfit/Plus Jakarta) y tema. Dime qué sobra, qué falta y qué te chirría. Con eso **congelo los tokens** y la pantalla «Sistema de diseño» pasa a ser la referencia.

**Paso 2 · Fase 1a, el primer código real (yo)**. Objetivo: usar la app a diario sin Google todavía.
1. Investigación corta previa, con la skill del repositorio: SSR de Astro 7 con su adaptador, Actions y sesiones; inicio de sesión con *passkey*; SQLite con Drizzle; *service worker* hecho a mano; manifiesto con accesos directos y «compartir con».
2. Proyecto `app/` en Astro 7 + Svelte 5 con los tokens y componentes de esta v2.
3. **Hoy, apuntar, Pendientes y Planificar** con tareas propias, sincronizadas entre el PC y el móvil a través del servidor.
4. Apuntar **sin conexión**: cola local que se envía al volver la red, sin duplicados.
5. Intérprete de fechas en español con pruebas automáticas: lo que hoy falla («nueve y media», «pasado mañana», «la semana que viene», rangos, «antes del 15») y la pregunta de mañana o noche.
6. **Instalable en el Honor**: icono, acceso directo largo «Apuntar» y aparecer en «Compartir».
7. Recorridos R1 y R2 automatizados con Playwright en móvil y escritorio.

**Criterios de la fase 1a**: abrir Hoy en < 1 s con caché; apuntar en ≤ 2 s también en modo avión; lo apuntado en el móvil aparece en el PC en < 5 s con red; contraste y objetivos táctiles como en la fase 0; instalación comprobada en tu Honor.

**Paso 3 · Fase 1b**: conectar tus dos Gmail (solo lectura de calendario primero) y comprobar que el permiso no caduca a los 7 días.

## 5. Decisiones que necesito
1. ¿Te convence la v2? ¿Lavanda o ámbar? ¿Outfit o Plus Jakarta Sans?
2. **Alojamiento de la fase 1a**: para que el PC y el móvil compartan las tareas hace falta un servidor. Propongo **Cloudflare (gratis)**; tendrías que crear la cuenta tú y darme acceso cuando lleguemos a desplegar. La alternativa es esperar al NAS.
