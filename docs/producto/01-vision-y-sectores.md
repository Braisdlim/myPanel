# 1. Visión y sectores de myPanel

Fecha: 18-10-2026. Estado: **propuesta para revisar**. El diseño visual queda aparcado hasta cerrar este documento y los siguientes.

## La idea en una frase
Una sola app, tuya y privada, que **reúne** tu tiempo (calendario, tareas), tu información (correo, documentos, lo que sabe de ti) y tu dinero (cuentas, fondos), te **dice qué importa hoy** y **hace gestiones contigo**, siempre enseñando de dónde sale cada dato y pidiéndote permiso antes de tocar nada.

## Principios (deciden los empates)
1. **Un sitio para todo, pero cada cosa en su sector.** Hoy resume y cada sector profundiza.
2. **Procedencia siempre visible**: qué cuenta, qué app, cuándo se actualizó y con qué certeza.
3. **Nada se escribe ni se mueve sin ti.** Las acciones externas se confirman y después se comprueban.
4. **Funciona sin IA.** La IA ayuda a entender, resumir y proponer, pero no es imprescindible.
5. **Rápida como una app nativa**: abrir, apuntar y buscar en segundos, con teclado en el Mac y con el pulgar en el móvil.
6. **Datos con hechos, no con opiniones.** En finanzas, la app muestra datos y avisa según reglas que defines tú; **no recomienda inversiones**.
7. **Privacidad por defecto**: lo justo de cada cuenta y lo máximo posible en tu propio servidor o NAS.

## Sectores (módulos)

| Sector | Qué resuelve (tu necesidad) | Primera versión útil | Más adelante |
|---|---|---|---|
| **Hoy** | Saber de un vistazo qué toca, qué está hecho y qué pide atención | Lo siguiente, plan del día, tareas, atención, próximos días | Resumen matinal, avisos inteligentes |
| **Calendario** | Ver y gestionar el tiempo a varias escalas y con varias cuentas | Vistas **día, semana, mes y agenda**; dos cuentas Google; crear y editar con la cuenta elegida | Vista año, zonas horarias, compartir disponibilidad |
| **Tareas y pendientes** | Capturar en segundos y decidir cuándo hacer las cosas | Captura con fecha en lenguaje natural, backlog, «hoy», posponer | Bloques de tiempo automáticos, rutinas flexibles |
| **Compromisos flexibles** | Saber qué puede moverse y qué no | Tipos fijo, opcional, movible y sin fecha; conflictos; excepciones por ocurrencia | Propuestas automáticas de reorganización |
| **Correo** | No perder lo que requiere acción | Correos importantes o sin responder de las dos cuentas, con enlace a Gmail | Convertir un correo en tarea o evento, borradores |
| **Documentos y búsqueda** | Encontrar algo («¿dónde está mi CV?») | Búsqueda en Drive y Gmail con origen, fecha y certeza | Índice propio, búsqueda por significado |
| **Finanzas** | Ver mi dinero e inversiones y cómo van | Patrimonio total, cuentas, fondos: valor, variación del día/semana/año, gráfico | Gastos por categoría, presupuestos |
| **Oportunidades** | Enterarme cuando un fondo cae para valorar una aportación extra | **Reglas que defines tú** (p. ej., «avísame si cae un 5 % desde su máximo de 30 días») con aviso y contexto | Simulador de aportaciones, calendario de aportaciones periódicas |
| **Lo que sé de ti** | Que aprenda sin inventar | Hechos confirmados, inferencias y temporales, con origen; confirmar, corregir, borrar | Memoria temporal (cambios de rutina) |
| **Gestiones** | Que haga trámites conmigo | — | Reservar peluquería (Yeasy), etc., con confirmación |
| **Ajustes y conexiones** | Controlar qué ve la app | Cuentas conectadas, permisos por cuenta, exportar y borrar | Registro de todo lo que ha hecho la app |

**Elementos transversales** (en todos los sectores):
- **Paleta de comandos**: buscar, apuntar o saltar a cualquier sitio. En el Mac, ⌘K y un atajo global.
- **Captura rápida** desde cualquier pantalla, desde el icono del móvil y con «Compartir con myPanel».
- **Avisos** discretos con su motivo.
- **Registro de acciones**: qué hizo la app, cuándo y en qué cuenta.

## Lo que NO es (por ahora)
- No sustituye a Gmail ni a Google Calendar: los **lee y escribe con tu permiso**, y para lo complejo enlaza a ellos.
- No es una app de *trading* ni de asesoramiento: no ejecuta órdenes ni recomienda productos.
- No es multiusuario.
- No tramita las vacaciones del trabajo: eso va por el portal corporativo.

## Hipótesis que hay que validar
- [I] Con **dos cuentas de Gmail** basta un proyecto propio de Google sin verificar (uso personal). Lo comprobaremos en la fase 1b.
- [I] Tus finanzas se pueden leer así: cuentas bancarias por PSD2 (open banking) y fondos por importación o token. Depende de tus entidades; ver la comparativa.
- [?] **«Financia»**: en macOS no hay ninguna app de Apple con ese nombre. Lo más probable es que sea **Bolsa (Stocks)**. Lo pregunto en la sección 5.
