# Paridad de pantallas y varias cuentas

Fecha: 18-10-2026. Origen: petición del usuario («Tienes que dar opción a más mails… 2 de Google y una de Microsoft. Todas las pantallas que existen en el Mac/Windows deben existir en el móvil iPhone/Android… Todo debe estar pensado»).
Etiquetas: [H] comprobado, [I] inferencia, [P] propuesta, [?] por comprobar. Fuentes en `research/cuentas/notas.md`.

## 1. Regla de paridad
- [P→aceptada por el usuario] **Cada pantalla existe en escritorio y en móvil.** Escritorio es Mac y Windows; móvil es Android e iPhone.
- El contenido y las acciones son los mismos; cambia la disposición. Lo que en el escritorio va en el **inspector** (columna derecha), en el móvil va en una **hoja** que sube desde abajo o en una pantalla propia.
- Toda maqueta nueva se añade a la matriz de abajo y al tablero «Paridad» del lienzo del Calendario. Una pantalla sin pareja no se da por terminada.

## 2. Matriz (18-10-2026)

| Sector | Pantalla | Escritorio (Mac y Windows) | Móvil (Android e iPhone) | Estado |
|---|---|---|---|---|
| Hoy | Hoy | `hoy/MacHoy`, `MacHoyClaro` | `hoy/AndroidHoy`, `AndroidHoyClaro` | hecha |
| Hoy | Planificar el día | `hoy/MacPlanificar` | `hoy/AndroidPlanificar` | hecha |
| Hoy | Pide atención | `hoy/MacAtencion` | `hoy/AndroidAtencion` | nueva |
| Hoy | Tu dinero hoy | inspector de `MacHoy` | tarjeta en `AndroidHoy` | nueva |
| Calendario | Día | `calendario/MacDia` | `calendario/AndroidDia` | nueva |
| Calendario | Semana | `MacSemana`, `MacSemanaClaro`, `WinSemana` | `AndroidSemana` | nueva |
| Calendario | Mes | `MacMes` | `AndroidMes`, `AndroidMesClaro`, `IphoneMes` | nueva |
| Calendario | Año (mapa de horas) | `MacAno` | `AndroidAno` (año girado: columnas = meses) | nueva |
| Calendario | Apuntar | `MacCaptura` | `AndroidCaptura` | hecha |
| Calendario | Cambiar solo esta vez | inspector de `MacSemana` | `AndroidOcurrencia` | hecha |
| Ajustes | Cuentas | `MacCuentas` | `AndroidCuentas` | nueva |
| Ajustes | Añadir cuenta | `MacAnadirCuenta` | `AndroidAnadirCuenta` | nueva |
| Fuera de la app | Lo siguiente sin abrir Pauta | `MacBarraMenus` (Windows: bandeja del sistema) | `AndroidWidget` | nueva; [?] viabilidad |
| Finanzas | Mis fondos y detalle | `finanzas/MacOscuro`, `MacClaro` | `AndroidLista`, `AndroidDetalle`, `AndroidClaro` | hecha |
| Finanzas | Variación entre dos fechas | `MacTramo` | `AndroidTramo` | nueva |
| Finanzas | Añadir fondo o ETF | `MacAnadir` | `AndroidAnadir` | hecha |
| Tareas | Listas y áreas | barra lateral de Tareas | `tareas/AndroidListas` | nueva |
| Tareas | Entrada | `tareas/MacEntrada` | `tareas/AndroidEntrada` | nueva |
| Tareas | Proyecto | `MacProyecto`, `MacProyectoClaro` | `AndroidProyecto`, `AndroidProyectoClaro` | nueva |
| Tareas | Tarea abierta | inspector de `MacTarea` | `AndroidTarea` (hoja) | nueva |
| Tareas | Programadas | `MacProgramadas` | `AndroidProgramadas` | nueva |
| Tareas | Apuntar una tarea | `tareas/MacCaptura` | `tareas/AndroidCaptura` | nueva |
| Tareas | Revisión de la semana | `MacRevision` | `AndroidRevision` | nueva |
| Tareas | En cualquier momento, Algún día, Registro | plantilla de Entrada | plantilla de Entrada | misma plantilla |
| Ajustes | General, Avisos, Finanzas, Privacidad | — | — | por hacer |

## 3. Diferencias por plataforma
- **Mac y Windows** [I]: misma ventana. En Windows, los botones de la ventana a la derecha, Ctrl en lugar de ⌘ y la mini agenda en la bandeja del sistema (junto al reloj). Tauri compila para los dos [H].
- **Android e iPhone** [I]: mismas pantallas. iPhone desde 390 px de ancho y con la barra de inicio del sistema bajo las pestañas. Como web app añadida a la pantalla de inicio, iPhone recibe avisos desde iOS 16.4 [H].
- **Widgets** [?]: ni Android ni iPhone dejan a una web app poner widgets; harían falta las apps de Tauri para móvil o nativas. Se comprobará antes de prometerlo.

## 4. Varias cuentas de calendario
- [P] Se pueden añadir **todas las cuentas que quieras**, de **Google** (Gmail y Workspace) y de **Microsoft** (Outlook, Hotmail y Microsoft 365). Otras (iCloud, CalDAV) quedan para más adelante.
- [H] La API de calendario de Microsoft (Graph) permite leer (`Calendars.Read`) y crear o cambiar (`Calendars.ReadWrite`) eventos también en **cuentas personales**.
- [P] Al conectar se pide **solo lectura**. Escribir se activa por cuenta y después pide confirmación de cada cambio, diciendo la cuenta de destino (regla de CLAUDE.md).
- [P] **Al apuntar, guardar en: «Preguntar cada vez»** por defecto; se puede fijar una cuenta. Así «Guardar» no se activa sin cuenta elegida (propuesta para cerrar P-020).
- [P] Colores: `cuenta-1` cielo, `cuenta-2` melocotón, `cuenta-3` rosa, `cuenta-4` turquesa (contraste comprobado), en el orden en que se añaden y cambiables. Desde la quinta se repiten; el color nunca va solo, siempre con el nombre o la inicial de la cuenta.
- [P] Los conflictos entre cuentas distintas son el caso más útil de Pauta: ninguna de las dos cuentas los ve. Si una cuenta es de solo lectura, Pauta solo ofrece mover el evento de la otra o abrir el servicio (ejemplo: el sábado 24 en las maquetas).
- [?] Registro de la app en Microsoft Entra (coste, aviso de «editor no verificado») y cuentas de trabajo que bloquean apps de terceros.

## 5. Ejemplo usado en las maquetas
Gmail 1 y Gmail 2 (Google) y Outlook (Microsoft). Los correos se muestran como `[correo]`. Gmail 2 tiene la escritura activada; Gmail 1 y Outlook están en solo lectura.
