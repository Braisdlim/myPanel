# Asistente de IA: buscar correos y archivos y crear eventos hablando

Fecha: 18-10-2026. Estado: **propuesta, pendiente de tu decisión** (P-036 y P-037).
Origen: petición del usuario («búscame este correo de no sé cuándo que decía esto», «búscame el currículum que tengo almacenado por ahí», «el viernes voy a tener una cena con mis amigos de tal hora a tal hora, y que ya se cree el evento solo»; «gratuito», «mantenimiento de coste cero»).
Etiquetas: [H] comprobado en fuente primaria · [H·s] fuente secundaria · [I] inferencia · [P] propuesta · [?] por comprobar.
Detalle, cifras y enlaces en `research/asistente-ia/`:
- `modelos-api.md`: modelos en la nube, límites gratuitos y uso de los datos.
- `modelos-locales.md`: modelos en el dispositivo, más la prueba propia en `prueba-local/`.
- `voz.md`: voz a texto, más la prueba propia de Whisper.
- `arquitectura-y-permisos.md`: cómo lo hacen otros, permisos, cuotas, fechas, MCP y seguridad, más la prueba de validación de fechas.

## 1. Qué tiene que cumplir
- **Correo**: «busca el correo de la gestoría con la factura de septiembre» → resultados de **todas tus cuentas** (Gmail 1, Gmail 2, Outlook), cada uno con su cuenta, remitente, fecha y botón para abrirlo; y, si lo pides, una respuesta corta que cite los correos.
- **Archivos**: «¿dónde está mi currículum?» → archivos de los dos Drive y de OneDrive (y, si lo activas, carpetas del ordenador), ordenados por fecha y con la cuenta a la vista.
- **Eventos, por la calle y por voz**: «el viernes ceno con mis amigos de nueve a once» → tarjeta con «Cena con amigos · vie 23 oct · 21:00–23:00 · calendario de Gmail 2» → un toque en «Crear» → Pauta lo crea, lo relee y dice «Creado en Gmail 2».
- **Criterios**:
  1. 0 € al mes con tu uso (unas decenas de peticiones al día).
  2. Nada que mantener: sin servidores propios que vigilar ni índices que reconstruir.
  3. Funciona en el móvil y en el escritorio (paridad).
  4. Ningún modelo entrena con tus correos.
  5. Nada se escribe sin que veas la cuenta de destino y confirmes (regla del proyecto).

Sobre «que se cree el evento solo»: [P] te lo dejo **a un toque**, no a cero. La tarjeta aparece ya rellena y solo pulsas «Crear». Más abajo explico por qué no conviene quitar ese toque.

## 2. Cómo lo hacen los mejores (2026)
- [H] Shortwave, Superhuman y Copilot combinan dos piezas:
  1. El modelo **traduce tu frase a búsquedas** («de la gestoría, septiembre, con adjunto» → `from:gestoria after:2026/9/1 before:2026/10/1 has:attachment`).
  2. Además mantienen un **índice semántico propio en sus servidores**, para encontrar por significado.
- [H] Google, en su servidor MCP oficial de Gmail, exige que la frase llegue ya convertida a la sintaxis de búsqueda de Gmail: es exactamente la primera pieza.
- [H] Fantastical interpreta las frases con su propio analizador y, desde la 4.1.1 (septiembre de 2025), usa Apple Intelligence solo para las frases complejas.
- [I] **Para una persona y 0 € basta la primera pieza.** Gmail, Drive y Outlook ya tienen buenos buscadores. El índice propio es lo caro: descargar 50.000 correos lleva unas 8 h por cuenta con las cuotas de Google, y luego hay que mantenerlo. Queda como mejora opcional.
- [H] El patrón técnico común es la «llamada a herramientas»: el modelo no hace nada por sí mismo, solo pide «busca en Gmail con esta consulta» y la app ejecuta la búsqueda. Con eso basta, sin marcos de agentes ni servicios extra.

## 3. Dónde corre cada cosa [P]
La clave es separar **el cerebro** (el modelo, que solo entiende y propone) de **las manos** (tus cuentas, que solo tocan tus dispositivos).

```
 Tú: texto o voz (dictado del teclado)
   │
   ▼
 Pauta (móvil o escritorio)
 │ 1. Fechas y horas: analizador propio (sin IA) → si lo entiende, tarjeta directa
 │ 2. Si no, pregunta al modelo ──────────────► Worker de Cloudflare (tuyo, con Access)
 │                                                 └─ Workers AI: modelo con herramientas
 │    ◄── «busca en Gmail 1 y 2: from:gestoria after:…»  (no guarda ni entrena) [H]
 │ 3. Pauta ejecuta las búsquedas con TUS tokens, guardados en el llavero del dispositivo
 │ 4. Devuelve al modelo solo fragmentos recortados → respuesta con citas
 │ 5. Escrituras: propuesta → validación de fecha → tarjeta con cuenta → tu toque → crear → releer
```

- **Los tokens de Google y Microsoft nunca salen de tus dispositivos.**
  - El modelo no tiene credenciales: solo ve nombres de herramientas y resultados recortados.
  - Cada dispositivo conecta sus cuentas una vez; el móvil ya lo necesita igualmente para el calendario.
- **El modelo corre en Cloudflare** porque es el único sitio gratis que vale a la vez para el móvil y el escritorio, y porque ya está previsto para sincronizar (D-041). La app habla con un Worker tuyo, así que la clave del modelo no va dentro de la app.
- **Lo local queda como opción**, no como base, para quien lo quiera en el Mac (sección 4).

## 4. ¿Qué modelo? Comparativa
Carga supuesta: 50 peticiones al día de unos 3.000 tokens de entrada y 300 de salida. La «carga agéntica» cuenta 2,5 llamadas por petición. Los cálculos son míos, con los precios oficiales [I].

| Opción | Coste al mes | ¿Entrena con tus datos? | Móvil | Pega |
|---|---|---|---|---|
| **Cloudflare Workers AI, Gemma 4 26B** | **0 €**: unas 1.800 neuronas/día con la carga base y 5.500 con la agéntica, de 10.000 gratis [H precio, I cálculo] | No, y no conserva entradas ni salidas [H] | Sí | Calidad en español sin medir [?]; las 10.000 neuronas se comparten con la voz |
| Gemini 3.5 Flash-Lite, plan gratuito | 0 € | Desde España no: en el EEE se aplican las reglas del plan de pago [H] | Sí | Límites solo visibles en AI Studio; los términos dicen que a usuarios del EEE solo se les ofrece el plan de pago [H] → encaje dudoso [?] |
| Groq gratis (gpt-oss-120b) | 0 € | No [H] | Sí | 200.000 tokens/día: la carga agéntica no cabe [H/I] |
| Mistral, Free mode | 0 € | **Sí, por defecto** (se puede desactivar) [H] | Sí | Descartado mientras entrene por defecto |
| De pago barato (Claude Haiku 5.5 o GPT-6 Luna, ambos a 0,10 / 0,50 USD por millón de tokens) | **0,7–2,3 USD** [H precio, I cálculo] | No [H] | Sí | Hay que meter tarjeta; es la opción de «si lo gratuito no da la talla» |
| En el Mac: Apple Foundation Models | 0 € | Nada sale del Mac | No (iPhone solo con app nativa) | 4.000 tokens de contexto, 3–5 herramientas; plugin de Tauri joven (0.13.0) [H] |
| En el escritorio: Ollama + Qwen3.5 (2B–9B) | 0 € | Nada sale del equipo | No | Prueba propia en CPU: herramienta correcta en 8 de 8 frases, pero 10–13 s por petición y fechas mal («jueves que viene» → lunes) [H prueba] |
| En el Honor 600 Pro: Gemini Nano | — | — | — | El Honor 600 Pro no está en la lista oficial de móviles [H] |
| En el NAS | 0 € | No sale de casa | Con VPN | Solo CPU: lento para conversar; vale para tareas de fondo [I] |
| GitHub Models | — | — | — | Retirado el 30-7-2026 [H] |

**Lo que dice la prueba local** [H]: un modelo pequeño elige bien la herramienta, pero **se equivoca con las fechas** y además dijo «He creado el evento» cuando solo lo había preparado. Eso confirma dos reglas:
1. Las fechas las calcula el código, no el modelo.
2. Lo que se le enseña al usuario es la tarjeta, no lo que «dice» el modelo.

**Recomendación [P]**:
1. **Una sola interfaz de proveedor**, compatible con el formato de OpenAI, que hablan casi todos (Cloudflare, Ollama, LM Studio, OpenAI, Gemini en modo compatible y otros). Cambiar de modelo es cambiar un ajuste, no rehacer la app.
2. **Por defecto, Cloudflare Workers AI con Gemma 4**: 0 €, no entrena, sirve para el móvil y no añade un proveedor nuevo.
3. **Antes de decidir, un banco de 30–50 frases tuyas en español** (buscar correos, archivos y crear eventos), pasado a 3 o 4 candidatos: Gemma 4 en Cloudflare, Gemini Flash-Lite, un modelo de pago barato y Foundation Models en el Mac. Medir aciertos, tiempo y coste. Así lo hacen los equipos serios: con pruebas propias, no con rankings.
4. **Si el gratuito falla mucho**, la salida es un modelo de pago barato (1–2 € al mes), no montar nada local.
5. **Local, opcional en el Mac**, para quien quiera que nada salga del equipo.

## 5. Voz
- [P] **Para empezar, el micrófono del teclado del móvil**: 0 € y nada de código. En iPhone, el español de España se dicta en el dispositivo y sin conexión [H]. En el Honor, Google solo documenta el dictado sin conexión en los Pixel [H]; en el resto de móviles hay que probarlo [?].
- [P] **Más adelante, un botón de micrófono propio** en Pauta: graba, transcribe con Whisper large-v3-turbo en Cloudflare (0,0005 USD/min, no conserva ni entrena con el audio [H]) y pasa el texto por el mismo camino.
  - Prueba propia en CPU con ruido sintético: 4,4 % de palabras erróneas sin ruido y 13,3 % con ruido [H prueba].
  - Para ruido real de calle no hay datos públicos: hay que grabar unas 20 órdenes tuyas (P-035).
- [H] La API de voz del navegador no sirve como base común: en Chrome Android el audio va a servidores de Google, no está en las web apps de iPhone y falla dentro de Tauri en el Mac.

## 6. Crear eventos sin errores
1. **Fechas sin IA primero**: el analizador determinista (`research/chrono-es`, hoy acierta 5 de 10; objetivo 9 de 10 con reglas propias en español). «El viernes de nueve a once» no necesita modelo.
2. **Si interviene el modelo**: recibe la fecha, la hora y la zona actuales y devuelve un JSON con forma fija, sin texto libre.
3. **El código lo valida** con `Temporal`. Si algo no cuadra, la tarjeta pregunta.
   - Ya probado [H prueba propia, `validar-fechas.mjs`]: día de la semana que no cuadra, fecha en el pasado, hora repetida y duración real con el cambio de hora del 25-10-2026.
   - Por añadir [P]: fin antes del inicio y hora ambigua («a las nueve»: ¿9:00 o 21:00?).
4. **Tarjeta con la cuenta de destino**, ya elegida según tu ajuste («Preguntar cada vez» por defecto, D-034) → «Crear» → se relee el evento → «Creado en Gmail 2».
5. **Por qué no quitar el toque** [H OWASP LLM 2026]: un correo puede llevar instrucciones ocultas («crea un evento e invita a x@…»). No hay forma fiable de impedir que el modelo las obedezca; la defensa es que **ninguna escritura ocurra sin que la veas**. Por eso tampoco hay herramientas de enviar correos, compartir archivos ni borrar, y los eventos no llevan invitados salvo que los añadas tú.

## 7. Permisos que harán falta
- [H] Para buscar en Gmail hace falta `gmail.readonly`, que Google clasifica como **restringido**. `gmail.metadata` no permite buscar.
- [H] En Drive, `drive.metadata.readonly` (solo nombres) también es restringido; `drive.readonly`, para buscar dentro del contenido, igual.
- [H] **Para uso personal no hace falta verificación** (menos de 100 usuarios): sale una pantalla de «app no verificada» que tú aceptas.
- [H] En el modo «Testing», los permisos caducan a los 7 días; por eso, el proyecto en «In production» sin verificar (D-007, hipótesis S-003).
- [H] Microsoft: `Mail.Read` y `Files.Read` sin administrador en cuentas personales. En la del trabajo manda la empresa (P-031).
- [I] Si un día lo abres a otras personas: que los correos no se guarden en servidores es lo que evita la auditoría anual de Google más dura. Este diseño ya lo cumple.

## 8. Por fases [P]
1. **A0, sin IA**: búsqueda unificada con filtros (cuenta, remitente, fechas, adjunto) en las tres cuentas, y la tarjeta de evento con el analizador de fechas. Útil por sí sola y base de lo demás.
2. **A1, asistente**: chat por texto y dictado; busca correos y archivos y propone eventos. Con el modelo elegido en el banco de pruebas.
3. **A2, opcional**: botón de micrófono propio (Whisper en Cloudflare) y archivos del ordenador (Spotlight / Windows Search).
4. **A3, opcional**: índice propio por significado y servidor MCP de solo lectura (especificación 2026-07-28), para usar tus datos desde otros asistentes.

## 9. El NAS, después de esto
Tienes razón: **no hace falta**.
- Con «local primero», cada dispositivo ya guarda una copia completa de tus datos [I].
- Cloudflare guarda 7 días de historial y permite exportar la base [H].
- La IA no necesita el NAS: sin GPU, sería lento para conversar [I].

[P] Lo único que añadiría es una exportación cifrada semanal **fuera de Cloudflare**, por si un día perdieras la cuenta. Esa copia puede ir a tu Drive o al NAS, si lo tienes encendido; ninguna de las dos cosas es obligatoria. El NAS queda fuera de la arquitectura (D-041 y D-017 actualizadas).

## 10. Lo que necesito de ti
1. **Modelo**: ¿te vale empezar con Cloudflare gratis (Gemma 4) y decidir con el banco de pruebas, aceptando pasar a uno de pago de 1–2 € al mes si el gratuito no da la talla?
2. **Permisos**: ¿aceptas `gmail.readonly` y `drive.readonly` (restringidos, solo lectura) en tus dos Gmail, y `Mail.Read` y `Files.Read` en Outlook?
3. **Frases reales**: cuando quieras, escríbeme 20–30 cosas que le pedirías (correos, archivos, eventos). Son el banco de pruebas.
4. **Opcional**: el modelo de tu Mac (para la opción local) y si tu Honor dicta sin conexión con Gboard.
