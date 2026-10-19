# Maquetas del asistente (calco del asistente de Shortwave)

Fecha: 19-10-2026. Estado: **propuesta, pendiente de tu revisión** (P-038).
Lienzo (privado, con comentarios): https://claude.ai/artifact/LK2CJNMSSyHTm88QsNgghP

Copia de los tableros del lienzo. Las capturas de referencia y la fuente se cargan desde el lienzo (`/_blob/…` y `ds/pauta/`), así que aquí solo se guarda el marcado. Cada pantalla tiene su pareja de escritorio y de móvil (D-035); la matriz completa está en `docs/producto/09-paridad-de-pantallas.md`. Hoja de capturas: `docs/producto/capturas/asistente.jpg`.

| Pantalla | Escritorio (Mac y Windows) | Móvil (Android e iPhone) |
|---|---|---|
| Anatomía de Shortwave y qué pone Pauta | `Main.dc.html` | — |
| Preguntar o apuntar | barra ⌘K y sector «Asistente» | `AndroidApuntar.dc.html` (＋) |
| Buscar un correo | `MacCorreo.dc.html`, `MacCorreoClaro.dc.html` | `AndroidCorreo.dc.html`, `AndroidCorreoClaro.dc.html` |
| Correo abierto | inspector de `MacCorreo` | `AndroidResultado.dc.html` (hoja) |
| Encontrar un archivo | `MacArchivos.dc.html` | `AndroidArchivos.dc.html` |
| Crear un evento | `MacEvento.dc.html` | `AndroidEvento.dc.html` (con dudas), `AndroidCreado.dc.html` |
| Evento sacado de un correo | `MacDesdeCorreo.dc.html` | `AndroidDesdeCorreo.dc.html` |
| Dictar | micrófono de la barra de escribir | `AndroidVoz.dc.html` |
| Estados | `MacEstados.dc.html` | `AndroidEstados.dc.html` |
| Ajustes › Asistente | `MacAjustes.dc.html` | `AndroidAjustes.dc.html` |

## Decisiones que proponen estas maquetas (D-046)
- **Dónde vive**:
  - En el escritorio es un sector propio, «Asistente», con la conversación en el centro y el inspector a la derecha (el correo, el archivo o tu tarde de ese día). La barra ⌘K pasa a «Apunta, busca o pregunta».
  - En el móvil, el ＋ abre «Apunta o pregunta»: una tarea o un evento se apuntan como siempre; una pregunta abre el asistente a pantalla completa.
- **Se calca de Shortwave**:
  - Tu petición y una respuesta corta.
  - **La consulta usada, a la vista** (plegable, por cuenta y con el número de resultados).
  - Enlaces a cada correo.
  - Tarjeta de evento con «Crear» y «Editar», y su procedencia.
- **Se añade**:
  - Las tres cuentas a la vez, cada resultado con su cuenta (punto y nombre).
  - Citas numeradas en la respuesta.
  - Archivos de Drive y OneDrive, y del ordenador solo en las carpetas que elijas.
  - El micrófono en la barra de escribir.
  - Debajo de la barra: «Solo lectura en tus cuentas · nada se escribe sin tu confirmación».
- **Eventos**:
  - La tarjeta dice «propuesta · aún no está en tu calendario».
  - Si el día o la hora son ambiguos, los eliges tú: hoy también es viernes, y «de 9 a 11» puede ser de mañana o de noche.
  - Avisa de conflictos. Saltar el ensayo se hace solo para esa ocurrencia, con un interruptor que empieza apagado y se confirma aparte.
  - El botón nombra la cuenta («Crear en Gmail 2»).
  - «Creado» solo aparece después de releer el evento.
- **Desde un correo**:
  - Aviso «Datos sacados de un correo de…».
  - Sin invitados, ubicación ni enlaces. Los enlaces se muestran como texto.
  - El correo se ve como texto, sin imágenes remotas.
- **Estados**: primera vez con sugerencias, buscando cuenta por cuenta con «Detener», cuenta por reconectar (se busca en las demás), sin cupo o sin conexión (el resto de Pauta sigue funcionando) y evento creado y comprobado.
- **Ajustes › Asistente**:
  - Dónde piensa: Cloudflare, en este dispositivo o de pago, con el uso del cupo de hoy.
  - Qué puede leer, por cuenta (correo y archivos).
  - Qué puede hacer: solo proponer eventos.
  - Voz: micrófono propio, apagado.
  - Historial: apagado.
- **Fuera**: escribir o enviar correos, compartir o borrar archivos, invitados automáticos, memoria automática.

## Datos de ejemplo
- Todo es de ejemplo y cuadra con el resto de maquetas: hoy es viernes 23 de octubre de 2026, 9:40; Gmail 2 es la única cuenta con escritura; el ensayo es cada viernes de 21:30 a 23:30 (opcional, Gmail 2).
- La gestoría, la clínica, los nombres de archivo y los correos son inventados para el ejemplo. Lo que va entre corchetes ([nombre], [importe], [fecha]) se rellenará con tus datos.
