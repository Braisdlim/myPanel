# Varias cuentas (Google y Microsoft) y plataformas

Fecha de consulta: 18-10-2026. Etiquetas: [H] comprobado en fuente primaria, [I] inferencia, [P] propuesta, [?] por comprobar.

## Microsoft (Outlook, Hotmail, Microsoft 365)
- [H] Listar eventos (`GET /me/events`) admite permisos delegados en **cuentas personales de Microsoft**: `Calendars.ReadBasic`, `Calendars.Read`, `Calendars.ReadWrite`. https://learn.microsoft.com/en-us/graph/api/user-list-events?view=graph-rest-1.0
- [H] Crear eventos (`POST /me/events`) en cuentas personales pide `Calendars.ReadWrite`. https://learn.microsoft.com/en-us/graph/api/user-post-events?view=graph-rest-1.0
- [H] «La mayoría de funciones de la API de calendario de Outlook valen para cuentas personales y de trabajo o centro educativo»; algunas solo para trabajo. https://learn.microsoft.com/en-us/graph/outlook-calendar-concept-overview
- [H] Una app registrada en Microsoft Entra puede aceptar «cuentas de cualquier directorio y cuentas personales de Microsoft» (`AzureADandPersonalMicrosoftAccount`) o solo personales. https://learn.microsoft.com/en-us/entra/identity-platform/supported-accounts-validation
- [I] Mismo esquema que Google: OAuth con permiso mínimo por cuenta (primero solo lectura; escritura solo si la activas), token guardado cifrado en tu equipo.
- [?] Coste y requisitos del registro de la app en Entra para uso personal (cuenta gratuita de Azure, aviso de «editor no verificado»). Comprobar antes de construir el conector.
- [?] Una cuenta de trabajo puede tener bloqueado el consentimiento de apps de terceros por su organización.

## Plataformas
- [H] Tauri (CLI 2.12.3, publicada el 14-10-2026 según npm) compila «para Linux, macOS, Windows, Android e iOS desde una sola base de código». https://v2.tauri.app/ · `npm view @tauri-apps/cli`
- [H] Desde iOS y iPadOS 16.4, las web apps añadidas a la pantalla de inicio reciben notificaciones push. https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- [I] Por tanto, un mismo diseño sirve para Mac y Windows (escritorio) y para Android e iPhone (móvil). Cambian la barra de título (Windows: botones a la derecha), los atajos (⌘ en Mac, Ctrl en Windows), el ancho de pantalla (unos 390–430 px en iPhone, 412 px en el Honor) y los gestos del sistema.
- [?] Widgets: en Android una web app no puede poner widgets propios; en iPhone tampoco. Hacen falta las apps de Tauri para móvil o nativas. Comprobar antes de prometer el widget.

## Uso por otras personas y cuentas de trabajo (consulta del 18-10-2026)
- [H] Google: una app que pide permisos sensibles o restringidos y no está verificada muestra la pantalla de «app no verificada» y queda **limitada a 100 usuarios nuevos** hasta verificarla. https://support.google.com/cloud/answer/7454865?hl=en
- [H] Google: que haga falta verificación depende del tipo de datos (por ejemplo, entradas de calendario) y del grado de acceso (lectura o lectura y escritura). https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification
- [?] Si los permisos de calendario de Google son «sensibles» (verificación con política de privacidad y vídeo) o «restringidos» (además, auditoría de seguridad). Comprobar en la lista oficial de permisos antes de abrir la app a otros.
- [H] Microsoft: `Calendars.ReadBasic` lee eventos **sin cuerpo, adjuntos ni extensiones** y no necesita consentimiento del administrador. https://learn.microsoft.com/en-us/graph/permissions-reference
- [H] Microsoft Entra: el administrador de una empresa puede limitar el consentimiento de los usuarios a apps de **editores verificados** y a permisos de bajo impacto, o quitarlo. https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-user-consent
- [I] En una cuenta de trabajo grande (por ejemplo, NTT DATA) lo probable es que conectar una app propia pida aprobación de TI, y copiar datos de reuniones (títulos, clientes, asistentes) a una app personal puede ir contra la política de seguridad de la empresa. Hay que preguntarlo antes de conectarla.
- [P] Para cuentas de trabajo, modo «solo ocupado»: Pauta guarda solo inicio, fin y «ocupado», sin título ni asistentes, salvo que la empresa lo permita.
