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
