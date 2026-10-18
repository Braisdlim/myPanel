# Maquetas del Calendario (calco de Fantastical)

Fecha: 18-10-2026. Estado: **propuesta, pendiente de tu revisión** (P-027). Segunda versión: varias cuentas (2 de Google y 1 de Microsoft) y cada pantalla en escritorio y en móvil (P-028).
Lienzo (privado, con comentarios): https://claude.ai/artifact/6Ca6kZvoyEtp3K4d2xW6G7

Copia de los tableros del lienzo. Las capturas de referencia y la fuente se cargan desde el lienzo (`/_blob/…` y `ds/pauta/`), así que aquí solo se guarda el marcado. La matriz completa de paridad está en `docs/producto/09-paridad-de-pantallas.md` y en el tablero `Paridad.dc.html`.

| Pantalla | Escritorio | Móvil |
|---|---|---|
| Anatomía de Fantastical y qué pone Pauta | `Main.dc.html` | — |
| Paridad (matriz) | `Paridad.dc.html` | — |
| Día | `MacDia.dc.html` | `AndroidDia.dc.html` |
| Semana | `MacSemana.dc.html`, `MacSemanaClaro.dc.html`, `WinSemana.dc.html` (Windows) | `AndroidSemana.dc.html` |
| Mes | `MacMes.dc.html` | `AndroidMes.dc.html`, `AndroidMesClaro.dc.html`, `IphoneMes.dc.html` (390 px) |
| Año como mapa de horas | `MacAno.dc.html` | `AndroidAno.dc.html` (girado: columnas = meses, filas = días) |
| Apuntar (pregunta hora y cuenta) | `MacCaptura.dc.html` | `AndroidCaptura.dc.html` |
| Cambiar solo esta vez | inspector de `MacSemana.dc.html` | `AndroidOcurrencia.dc.html` |
| Ajustes › Cuentas | `MacCuentas.dc.html` | `AndroidCuentas.dc.html` |
| Añadir cuenta (Google o Microsoft, permisos) | `MacAnadirCuenta.dc.html` | `AndroidAnadirCuenta.dc.html` |
| Lo siguiente sin abrir Pauta | `MacBarraMenus.dc.html` (en Windows, bandeja) | `AndroidWidget.dc.html` |

## Decisiones que proponen estas maquetas (D-033, D-034)
- Se calca de Fantastical: mini mes con puntos, ‹ Hoy ›, escalas, cabecera del día, fila de todo el día, línea de ahora y bloques de color; en el móvil, mes arriba y lista debajo.
- Cambia: escalas Día · Semana · Mes · Año (sin Trimestre), también en el móvil; buscar y apuntar en el mismo ⌘K (Ctrl K en Windows); sin el tiempo; la línea de ahora en lavanda.
- Se añade: pregunta cuando la hora es ambigua; la cuenta de destino siempre a la vista y, por defecto, «Preguntar cada vez»; cambios de un evento repetido solo para esa ocurrencia; conflictos entre cuentas explicados en «Pide atención»; el año como mapa de horas.
- Cuentas: tantas como quieras, de Google y de Microsoft; al conectar, solo lectura; escribir se activa por cuenta y pide confirmación de cada cambio. Si una cuenta es de solo lectura (Outlook en el ejemplo), Pauta solo ofrece mover el evento de la otra o abrir el servicio.

## Datos de ejemplo
Todo es de ejemplo salvo el ensayo de los viernes (21:30–23:30) y el cambio de hora del domingo 25 de octubre de 2026. Cuentas: Gmail 1 y Gmail 2 (Google) y Outlook (Microsoft); correos como `[correo]`. El viernes 23 coincide con «Hoy». El solape de ejemplo es el sábado 24: ruta en bici (Gmail 2) y reunión de la comunidad (Outlook) de 12:00 a 13:00. En qué calendario está el ensayo sigue sin saberse (P-001); se dibuja en Gmail 2. Los festivos del año son los nacionales habituales, por comprobar en el BOE de 2026.
