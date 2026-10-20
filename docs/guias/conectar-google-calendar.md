# Conectar tu Google Calendar a Pauta (solo lectura)

Se hace una vez y tarda unos 10 minutos. Al terminar tendrás un **ID de cliente**, que es un código público que identifica a tu app ante Google. **No hay contraseña ni secreto**: no descargues ni compartas el «client secret» si la consola te lo ofrece, porque Pauta no lo usa.

Comprobado el 20-10-2026 con la guía oficial de Google (quickstart de JavaScript, actualizada el 12-10-2026). Si algún menú ha cambiado de nombre, dímelo y actualizo la guía.

> **Si la consola está en español** no aparece «Google Auth platform» en el menú lateral. Lo más fácil es abrir las páginas directamente; cambia `proyecto-pauta` si tu proyecto tiene otro ID:
>
> | Página | Dirección |
> |---|---|
> | Resumen | https://console.cloud.google.com/auth/overview?project=proyecto-pauta |
> | Branding (marca) | https://console.cloud.google.com/auth/branding?project=proyecto-pauta |
> | Audience (público) | https://console.cloud.google.com/auth/audience?project=proyecto-pauta |
> | Data Access (acceso a los datos) | https://console.cloud.google.com/auth/scopes?project=proyecto-pauta |
> | Clients (clientes) | https://console.cloud.google.com/auth/clients?project=proyecto-pauta |
>
> También llegas por **APIs y servicios › Pantalla de consentimiento de OAuth** o escribiendo «OAuth» en el buscador de arriba. «Plataforma de agentes» es otra cosa: no la uses.

## 1. Crear el proyecto
1. Entra en https://console.cloud.google.com con una de tus cuentas de Gmail. Será la dueña del proyecto; la otra cuenta también podrá conectarse.
2. Arriba, en el selector de proyectos, pulsa **New project**. Ponle de nombre `Pauta` y pulsa **Create**.
3. Comprueba que el selector muestra `Pauta` antes de seguir.

## 2. Activar la API de Google Calendar
1. Ve a **APIs & Services › Library**, busca **Google Calendar API** y pulsa **Enable**.

## 3. Pantalla de permisos (Google Auth platform)
1. Ve a **Menú › Google Auth platform › Branding**. Si aparece «Google Auth platform not configured yet», pulsa **Get started** y rellena:
   - **App name**: `Pauta`.
   - **User support email**: tu correo.
   - **Audience**: **External**. *Internal* solo existe para empresas con Google Workspace.
   - **Contact information**: tu correo.
   - Acepta la política de datos de usuario y pulsa **Create**.
2. **Audience › Test users › Add users**: añade **tus dos direcciones de Gmail**. Solo esas cuentas podrán conectarse.
3. **Data Access › Add or remove scopes**: filtra y marca estos dos, luego pulsa **Update** y **Save**:
   - `https://www.googleapis.com/auth/calendar.calendarlist.readonly`: ver la lista de tus calendarios.
   - `https://www.googleapis.com/auth/calendar.events.readonly`: ver los eventos, sin poder cambiarlos.

   No añadas `calendar` ni `calendar.events` (sin `.readonly`): esos permiten escribir.

> **Testing o In production.** Te propongo dejarla en **Testing** (el estado inicial). Así solo pueden entrar las cuentas de la lista de prueba.
>
> Lo que cuesta: Google pide de nuevo tu permiso cada 7 días. Con Pauta eso solo significa volver a marcar las dos casillas al pulsar «Actualizar».
>
> Si te molesta, en **Audience** pulsa **Publish app** (estado *In production*, sin verificar):
> - Desaparece la caducidad de 7 días.
> - Sigue saliendo el aviso de app no verificada.
> - Hay un tope de 100 usuarios en toda la vida del proyecto.
> - Cualquiera que conozca tu ID de cliente podría intentar usar la app con su propia cuenta. Solo leería sus propios datos, nunca los tuyos.

## 4. Crear el ID de cliente
1. Ve a **Google Auth platform › Clients › Create client**.
2. En **Application type**, elige **Web application**.
3. En **Name**, escribe `Pauta en este ordenador`. Solo lo ves tú.
4. En **Authorized JavaScript origins › Add URI**, escribe exactamente `http://localhost:4321`. Sin barra final ni ruta.
   - Si también quieres probar la versión compilada, añade `http://localhost:4330`.
5. Deja vacío **Authorized redirect URIs** y pulsa **Create**.
6. Copia el **Client ID**, que termina en `.apps.googleusercontent.com`.

## 5. Ponerlo en Pauta
El ID de `proyecto-pauta` ya va en `app/src/lib/google.js` (subido al repositorio el 20-10-2026 a petición tuya; es público y no lleva secreto). Solo si creas otro, ponlo en `app/.env` (`PUBLIC_GOOGLE_CLIENT_ID=…`), que manda sobre el del código y no se sube.
```sh
npm install
npm run dev                 # abre http://localhost:4321
```
Si `npm run dev` ya estaba en marcha, páralo y arráncalo otra vez para que lea `.env`.

## 6. Conectar tus cuentas
1. En Pauta, ve a **Ajustes › Cuentas** y pulsa **Conectar Google**. Se abre una ventana de Google.
2. Elige la cuenta.
3. Saldrá el aviso de que Google no ha verificado la app, porque es tuya y no ha pasado su revisión. Pulsa **Advanced** (Avanzado) y después **Go to Pauta** (Ir a Pauta). Los textos exactos pueden variar.
4. **Marca las dos casillas** de calendario y acepta. Si falta una, Pauta te avisa y no se conecta.
5. Pauta trae tus calendarios y los eventos de 60 días atrás a 180 adelante. Desde ese momento, Hoy, Calendario y Pide atención muestran tus eventos reales, y los de ejemplo desaparecen.
6. Para la otra cuenta, pulsa **Conectar otra cuenta de Google**.
7. Opcional: con el lápiz, cambia el nombre que se muestra (por ejemplo, «Personal»). Con los interruptores, enciende o apaga calendarios: festivos, cumpleaños o compartidos.

## Qué hace y qué no hace Pauta
- **Lee**: la lista de tus calendarios y sus eventos. **No puede** crear, mover ni borrar nada.
- **Guarda en este navegador**: una copia de los eventos, para verlos sin conexión. No sale del dispositivo.
- **No guarda el permiso**: dura una hora y vive solo en esa pestaña. Al recargar la página ves lo guardado; para traer cambios pulsa **Actualizar**, en Calendario o en Ajustes › Cuentas. Normalmente no hay que volver a elegir cuenta.
- **Desconectar** una cuenta borra su copia en el dispositivo y retira el permiso en Google si sigue vivo. Si no, Pauta te lo dice y te deja el enlace.
- **Retirar el permiso a mano**: en cualquier momento, desde https://myaccount.google.com/connections.

## Si algo falla
| Lo que ves | Qué hacer |
|---|---|
| El botón «Conectar Google» está apagado | No debería pasar: el ID va en el código. Si usas `app/.env`, reinicia `npm run dev`. |
| Google dice `origin_mismatch` o `redirect_uri_mismatch` | El origen del paso 4 tiene que ser exactamente `http://localhost:4321`. Los cambios pueden tardar unos minutos. |
| Google dice `access_denied` o que no tienes acceso | Esa cuenta no está en **Audience › Test users**. |
| «El navegador bloqueó la ventana de Google» | Permite las ventanas emergentes para `localhost` y vuelve a pulsar. |
| «Google Calendar respondió 403.» | La API no está activada (paso 2) o falta un permiso (paso 3). |
| «El permiso ha caducado» | Pulsa **Actualizar**. |

La vista previa en claude.ai no puede conectar con Google, porque su política de seguridad bloquea el script de Google. La conexión real funciona en `npm run dev` y, más adelante, en la app instalada.
