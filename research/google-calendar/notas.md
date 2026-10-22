# Paso 2: Google Calendar en solo lectura

Fecha: 20-10-2026. Etiquetas: [H] comprobado en la fuente oficial, [I] inferencia, [P] propuesta, [?] por comprobar.

## Recorrido y criterios
- En Ajustes › Cuentas pulsas «Conectar Google». Eliges tu cuenta y aceptas el aviso de app no verificada y el permiso de leer el calendario. Pauta trae tus calendarios y sus eventos.
- Hoy, Calendario y Pide atención pasan a mostrar tus eventos reales. Repites el proceso con la segunda cuenta de Gmail.
- Criterios:
  - Solo lectura y los permisos mínimos.
  - Sin servidor y sin secretos en el repositorio.
  - Los tokens no se guardan en disco.
  - Los eventos se guardan en el dispositivo, así se ven sin conexión.
  - Cada cuenta lleva su color y su nombre.
  - Se puede actualizar y desconectar.

## Lo comprobado (20-10-2026)
- **Permisos de Calendar** [H developers.google.com/workspace/calendar/api/auth, actualizada el 3-9-2026]. Los dos más estrechos que bastan:
  - `calendar.calendarlist.readonly`: «See the list of Google calendars you're subscribed to».
  - `calendar.events.readonly`: «View events on all your calendars».
  - `calendar.readonly` permite además descargar los calendarios enteros, y no hace falta.
  - [?] Google los clasifica como sensibles; la categoría exacta se ve en la consola al añadirlos.
- **Biblioteca de Google para la web** (`google.accounts.oauth2`, cargada desde `https://accounts.google.com/gsi/client`) [H guía «Use the token model», actualizada el 26-5-2026, y referencia JS]:
  - `initTokenClient()` y `requestAccessToken()` devuelven un token de acceso con el flujo implícito, sin secreto de cliente.
  - El token dura poco (`expires_in`) y para renovarlo hay que volver a pedirlo desde un clic del usuario.
  - `login_hint` salta la elección de cuenta.
  - `revoke()` retira el permiso.
  - Con `http://localhost`, Google recomienda la cabecera `Referrer-Policy: no-referrer-when-downgrade`.
- **Cliente OAuth** [H quickstart de JavaScript, actualizado el 12-10-2026]: el menú es *Google Auth platform › Clients › Create Client › Web application* y luego *Authorized JavaScript origins*. «Client secrets aren't used for Web applications».
- **Pantalla de consentimiento** [H guía «Configure OAuth consent», 3-9-2026]: *Google Auth platform › Branding / Audience / Data Access*. En *Audience* se añaden los usuarios de prueba; en *Data Access › Add or Remove Scopes*, los permisos.
- **Publicación** [H ayuda de Google Cloud, «Audience», 20-10-2026]:
  - **Testing**: como mucho 100 usuarios de prueba, y sus autorizaciones caducan a los 7 días.
  - **In production** sin verificar: aviso de app no verificada y tope de 100 usuarios durante toda la vida del proyecto.
- **El correo de cada cuenta**: Pauta toma como correo el `id` del calendario principal, y así no pide también el permiso `email`.
  - [H developers.google.com/workspace/calendar/api/concepts/events-calendars, actualizada el 3-9-2026]: «Each calendar is identified by an ID, which is an email address».
  - [I] Que el del principal sea justo la dirección de la cuenta es un comportamiento conocido; se confirma en la prueba real.
- **Qué calendarios vienen encendidos** [H referencia de `CalendarList`, actualizada el 29-7-2026]: `selected` es «Whether the calendar content shows up in the calendar UI. Optional. The default is False».
  - Pauta enciende los que ya ves en Google y siempre el principal.
  - La prueba con Google imitado detectó que el código los encendía todos cuando faltaba `selected`. Corregido.
- **Quickstart de JavaScript** [H, actualizado el 12-10-2026]: *Menu › Google Auth platform › Branding* (o «Get Started»); *Clients › Create Client › Web application › Authorized JavaScript origins › Add URI*. En su ejemplo usa *Audience: Internal*, que solo vale para Workspace; con Gmail es *External*.

## Alternativas
| | A) Biblioteca de Google en el navegador (token de acceso) | B) Código de autorización con PKCE y token de actualización | C) Esperar a Tauri |
|---|---|---|---|
| Servidor | Ninguno | Hace falta para guardar el secreto (cliente web) o una app de escritorio con redirección local | Ninguno |
| Secretos | Ninguno; el ID de cliente es público | Secreto del cliente o del escritorio | Secreto del escritorio (no es secreto de verdad) |
| Renovar | Un clic en «Actualizar» cuando caduca (≈ 1 h) | Automático | Automático |
| Disponible | Ya, en `npm run dev` | Con el servidor (Cloudflare) | En el paso 3 |

[P] **A ahora**: lo mínimo para usar tus calendarios ya, sin servidor. **B o C** en el paso 3, cuando la app se instale con Tauri y haga falta sincronizar sola.

[I] La vista previa en claude.ai no puede conectar: su política de seguridad bloquea el script de `accounts.google.com`. La conexión real funciona en local (`npm run dev`) y, más adelante, en la app instalada.

## Decisiones de implementación [P] (hechas el 20-10-2026)
- El ID de cliente va en `app/.env` (`PUBLIC_GOOGLE_CLIENT_ID`), que no se sube (D-040).
- Los tokens solo en memoria: al recargar se ven los eventos guardados y «Actualizar» pide uno nuevo con `login_hint`, normalmente sin volver a consentir.
- Ventana de eventos: 60 días atrás y 180 adelante, con `singleEvents=true` (las series vienen desplegadas en ocurrencias).
- Se omiten los eventos cancelados y los que has rechazado.
- Colores de cuenta por orden de conexión (`cuenta-1` a `cuenta-4`).
- Cuando hay al menos una cuenta real, los datos de ejemplo del calendario desaparecen. Se mantienen los avisos de cambio de hora, que son de Pauta.
- **El mismo evento en dos cuentas** (una invitación entre tus Gmail) se muestra una vez, con «También en …», usando el `iCalUID`. Así no cuenta como solape.
- Los calendarios apagados no se piden; al encender uno se actualiza la cuenta.
- Al desconectar, el permiso se retira en Google si sigue vivo en la pestaña. Si no, se enseña el enlace a myaccount.google.com/connections.

## Pruebas (20-10-2026)
- `app/pruebas/google.test.mjs`: 9 pruebas unitarias.
  - Conversión de eventos: con hora, zona horaria, cruce de medianoche, todo el día con fin exclusivo, cambio de hora de octubre, cancelados, rechazados y sin título.
  - Colores, unión de cuentas y «hace cuánto».
- `app/pruebas/google.spec.js`: el recorrido completo en móvil y escritorio, con la biblioteca de Google y la API imitadas.
  - Conectar dos cuentas, el evento compartido una vez, el solape entre cuentas y el enlace a Google Calendar.
  - Recargar sin llamar a Google, encender un calendario, desconectar con y sin permiso vivo, la vuelta a los datos de ejemplo y un error 503.
  - También capturas y revisión de contraste y tamaño táctil con cuentas reales.
- No probado: la conexión con Google de verdad, que necesita tu ID de cliente (guía en `docs/guias/conectar-google-calendar.md`).

## Paso 3: eventos repetidos y crear eventos (22-10-2026)

### Fuentes consultadas el 22-10-2026
- [H] `events.insert` (actualizada el 7-7-2026): `POST /calendars/{calendarId}/events`; `start` y `end` obligatorios; con `dateTime` hace falta el desfase **salvo que se indique `timeZone`**; todo el día con `date` y fin exclusivo. Admite, entre otros, `calendar.events.owned`. https://developers.google.com/workspace/calendar/api/v3/reference/events/insert
- [H] Permisos de Calendar (3-9-2026): `calendar.events.owned` = «See, create, change, and delete events on Google calendars you own»; `calendar.events` = «View and edit events on all your calendars». https://developers.google.com/workspace/calendar/api/auth
- [H] Modelo de token de la biblioteca de Google (26-5-2026): permiso incremental volviendo a pedir el token con más `scope`; el usuario puede aceptar permisos sueltos, así que hay que comprobarlos con `hasGrantedAllScopes()`; pedir el token desde un gesto del usuario. https://developers.google.com/identity/oauth2/web/guides/use-token-model
- [H] Eventos recurrentes (17-9-2026): para cancelar una sola ocurrencia, se lee la instancia (`events.instances`), se pone `status: "cancelled"` y se guarda con PUT; la serie no cambia. Google desaconseja editar muchas instancias una a una. https://developers.google.com/workspace/calendar/api/guides/recurringevents
- [H] Verificación de permisos sensibles (19-8-2026): no hace falta verificar si eres el único usuario o unos pocos conocidos, que pueden pasar por la pantalla de «app no verificada»; hay un tope de usuarios. Pone «leer eventos de Google Calendar» como ejemplo de permiso sensible. https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification

### Alternativas para escribir
| Opción | Qué permite | Encaje |
|---|---|---|
| `calendar.events.owned` | Crear, cambiar y borrar en calendarios tuyos | **Elegida**: lo justo. No toca los calendarios compartidos contigo (los del ensayo). |
| `calendar.events` | Editar en todos tus calendarios, también los compartidos con permiso | Más amplio de lo necesario. |
| `calendar.app.created` | Solo calendarios secundarios creados por la app | Obligaría a un calendario «Pauta» aparte; no se verían en el principal como pide el usuario. |

### Eventos repetidos entre calendarios (P-043)
- [H] Prueba real del 20-10-2026: el ensayo sale en tres calendarios compartidos con `iCalUID` distintos; la unión por `iCalUID` no basta.
- [P] Regla elegida, en código y sin IA: mismo día, mismo tipo (con hora o todo el día), **la misma hora de inicio** y título equivalente: casi todas las palabras con significado del título más corto (≥ 75 %, sin tildes, signos ni palabras vacías) están en el otro. La hora de fin puede variar y se avisa («otro calendario dice hasta las 0:00»).
- Si una copia está en un calendario tuyo, esa pasa a ser la principal (es la que podrás cambiar).
- Se ve de dónde viene: «También en «Glissandoo» y «banda…»» en el detalle del evento.
- Alternativas descartadas: unir solo por título (une planes de días distintos), por hora sin título (une planes distintos a la misma hora, p. ej., una cena y el ensayo), o con IA (innecesaria y contra D-002).

### Pruebas (22-10-2026)
- `app/pruebas/paso3.test.mjs`: 8 unitarias (títulos equivalentes, el caso real del ensayo, preferir el calendario tuyo, lo que no se une, festivos en dos idiomas, cuerpo del evento con medianoche y todo el día, relectura con cambio de hora, calendarios donde se puede escribir).
- `app/pruebas/paso3.spec.js`: recorrido en móvil (360 y 412) y escritorio con Google imitado: el ensayo una vez; sin escritura, Apuntar guarda tareas; activar «Crear eventos» pide el permiso aparte; Apuntar pregunta dónde; Enter no crea; «Crear en …» crea, relee y lo muestra; sigue tras recargar. Contraste y táctil revisados.
- No probado aún: crear un evento real en tu Google (necesita tu clic en la ventana de Google y tu confirmación).
