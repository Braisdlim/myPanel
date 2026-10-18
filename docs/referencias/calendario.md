# Referencias: Calendario

Fecha: 18-10-2026. Estado: **capturas descargadas y seleccionadas; pendiente de tu decisión**.

- Página de revisión (privada): https://claude.ai/artifact/V2Wp6obG8vzFD2mkpWsZih
- Descarga: 123 capturas reales, 0 fallos (App Store España: Fantastical 4.2.3, Notion Calendar 1.92.0, BusyCal 2026.4.2, Google Calendar 26.39.1; webs y ayudas oficiales de Flexibits, Notion, BusyMac y Reclaim). Selección: 20 capturas.
- Huecos: (1) no hay captura oficial de la entrada en lenguaje natural de Fantastical con vista previa, solo una ilustración; (2) no hay captura oficial de las rutinas de Reclaim colocadas en la semana.

Ideas candidatas: el lenguaje natural de **Fantastical**, el teclado y la barra de menús de **Notion Calendar**, la vista anual como mapa de calor de **BusyCal** y las rutinas flexibles de **Reclaim**.

---

## Idea 1 · Lenguaje natural con vista previa (Fantastical)

**Qué es** (comprobado en fuentes):
- Escribes «Comida con Juan el viernes a la 1» y crea el evento; «recuérdame comprar leche el martes» crea una tarea con fecha [H·r ficha de App Store].
- Extrae título, lugar, fecha relativa y horas, y tolera erratas [H·s MacStories].
- En el Mac funciona desde la barra de menús: un atajo configurable abre la ventana con el campo de texto ya activo. Hay una *mini window* para consultar la agenda con otro atajo [H·r ficha de App Store; H·s MacStories].

**Qué tomaríamos**: el campo único de captura (paleta ⌘K / ＋ en Android) con **vista previa en vivo** de lo que ha entendido. Añadimos lo que Fantastical no hace por nosotros: preguntar «¿21:30 o 09:30?» cuando hay ambigüedad y elegir cuenta de destino.

**Capturas que necesito**
1. Mac: entrada rápida con una frase a medio escribir y la vista previa del evento.
2. Mac: la *mini window* desde la barra de menús.
3. Mac: ventana principal en vista semana (cómo integra la lista lateral).
4. iPhone: DayTicker y la entrada rápida, para pensar la versión Android.

**Evaluación previa**
| Criterio | Valoración |
|---|---|
| Recorrido | R2 (apuntar) y R4 (crear evento en la cuenta correcta) |
| Encaje | Total: es la captura única común a todos los sectores |
| Principios | ✅ Se previsualiza antes de guardar |
| Android | Hoja inferior desde el botón ＋, el acceso directo y «Compartir» |
| Coste | Medio: intérprete propio en español (sin IA), con pruebas |

## Idea 2 · Teclado primero y barra de menús (Notion Calendar)

**Qué es**:
- Con «?» se ve la lista completa de atajos, que se puede buscar.
- **Atajos globales** configurables (que funcionan fuera de la app) para mostrar u ocultar la barra de menús y para unirse a la reunión [H·r ayuda oficial de Notion].
- Paleta de comandos; ver el calendario de otra persona superpuesto (P); fragmentos de disponibilidad (S) [H·s guía de M. Frank].
- La barra de menús muestra la agenda, permite unirse a reuniones y abre adjuntos; vista en varias zonas horarias [H·r notas de versión de Notion, 01-2024].

**Qué tomaríamos**: atajos de una tecla para cambiar de vista (D, S, M, A), «?» con la lista de atajos, atajo global de captura y **mini agenda en la barra de menús del Mac** con lo siguiente y los avisos. La superposición de otras personas no aplica: la app es solo tuya.

**Capturas que necesito**
1. Vista semana con la paleta de comandos abierta.
2. Desplegable de la barra de menús.
3. Hoja de atajos (tecla «?»).
4. Columna con dos zonas horarias.

**Evaluación previa**
| Criterio | Valoración |
|---|---|
| Recorrido | R1 (consultar sin abrir la app) y R4 |
| Encaje | Total en Mac (paleta común); en Android, el equivalente es el widget (fase 5) |
| Principios | ✅ |
| Android | Barra de menús → widget y notificación persistente opcional |
| Coste | Medio: necesita la app de escritorio (opción Tauri o nativa) para la barra de menús y los atajos globales |

## Idea 3 · Vista anual como mapa de calor (BusyCal)

**Qué es**:
- En la vista año, desde «View Settings» se activan «Year Planner» y «Show Highlights», con estilo *Banners* o *Heatmap*.
- El mapa de calor colorea cada día según lo ocupado que está: más claro con menos eventos, más oscuro con más.
- El cajón «Highlights» muestra estadísticas del periodo visible [H·r documentación de BusyCal].
- La versión 2025.4.4 rediseñó la vista año con mapa de calor e iconos para cumpleaños y aniversarios [H·s TidBITS].

**Qué tomaríamos**: vista año con mapa de calor de **horas comprometidas** (no solo número de eventos), con vacaciones y días libres destacados y una franja de estadísticas (semanas más cargadas, días libres que quedan, vacaciones apuntadas). La misma escala anual servirá en Finanzas (rentabilidad por mes), lo que unifica.

**Capturas que necesito**
1. Vista año en modo *Heatmap*.
2. Vista año en modo *Banners* (Year Planner).
3. Cajón «Highlights» con estadísticas.

**Evaluación previa**
| Criterio | Valoración |
|---|---|
| Recorrido | R4 (ver el año, planificar vacaciones) |
| Encaje | Bueno: una escala más del calendario (día, semana, mes, **año**) |
| Principios | ✅ |
| Android | Cuadrícula de 12 meses desplazable; tocar un mes abre esa vista |
| Coste | Bajo-medio: cálculo de horas por día a partir de los eventos ya sincronizados |

## Idea 4 · Rutinas flexibles (Reclaim)

**Qué es**:
- Un *Habit* es un bloque recurrente que se mueve dentro de una **ventana** que defines. Ejemplo de su ayuda: comida entre 11:30 y 14:00, de 30 a 60 minutos, idealmente a las 12:00.
- Se coloca alrededor de tus eventos según preferencias, reglas y prioridad.
- Empieza como «libre» y pasa a «ocupado» al acercarse la hora o llenarse la agenda.
- Si una reunión lo pisa, **se reprograma solo** dentro de su ventana [H·r ayuda oficial de Reclaim].
- Hay críticas: no tiene app móvil nativa y ajustar prioridades cuesta [H·s Capterra].

**Qué tomaríamos (con un cambio importante)**: el **modelo de datos** (ventana, duración mínima y máxima, hora ideal, prioridad, libre u ocupado) para tus rutinas opcionales, como el ensayo de los viernes. **Cambio**: Reclaim mueve las cosas solo; nosotros **proponemos** y tú confirmas (principio 3), y las excepciones son por ocurrencia.

**Capturas que necesito**
1. Editor de un *Habit* (ventana, duración, hora ideal, prioridad).
2. Calendario con *Habits* colocados (cómo distingue libre y ocupado).
3. Aviso de reprogramación o planificador semanal.

**Evaluación previa**
| Criterio | Valoración |
|---|---|
| Recorrido | R3 (conflicto con el ensayo) |
| Encaje | Bueno: «Compromisos flexibles» ya está en la arquitectura (Serie + Excepción + flexibilidad) |
| Principios | ⚠️ Solo si propone y no mueve sin permiso |
| Android | Igual: aviso con opciones |
| Coste | Medio-alto: algoritmo de huecos y propuestas; sin IA |

---

## Referencias de control (para no olvidar lo básico)
- **Google Calendar** (vistas día, semana, mes, año y agenda; es tu fuente de datos) y **Calendario de Apple** (convenciones de macOS). Capturas opcionales, para comparar.

## Selección usada en la revisión
| Idea | Capturas |
|---|---|
| 1 | fantastical-mac-08 (ventana principal), mac-04 (ilustración del lenguaje natural), mac-03 (vistas), iphone-01 (DayTicker), mac-10 (zonas horarias) |
| 2 | notion-calendar-web-06 (barra de menús y panel con teclas), web-09 (paleta ⌘K), web-08 (zonas horarias), web-14 (ventana con inspector), ayuda-01 (lista de atajos), iphone-01 (tarjeta «Upcoming») |
| 3 | busycal-documentacion-05 (mapa de calor + Overview), -02 (Banners), -03 (ajustes), -06 (12 minimeses) |
| 4 | reclaim-ayuda-04 (lista y editor), -09 (duración), -12 (hora ideal), -06 (prioridad), -14 (si no cabe) |

## Lo que te pido ahora
Para cada idea: ✅ aprobada, ✏️ aprobada con cambios o ❌ descartada, y qué detalle te gusta o no.

## Fuentes (consultadas el 18-10-2026)
- Fantastical: https://apps.apple.com/us/app/fantastical/id718043190 · https://www.macstories.net/reviews/fantastical-your-personal-ical-assistant/
- Notion Calendar: https://www.notion.com/help/notion-calendar-keyboard-shortcuts · https://www.notion.com/releases/2024-01-17 · https://matthiasfrank.de/en/notion-calendar/
- BusyCal: https://www.busymac.com/docs/busycal/70590-year-view/ · https://apps.apple.com/app/id1173663647 · https://talk.tidbits.com/t/busycal-2025-4-4-and-busycontacts-2025-4-4/32582
- Reclaim: https://help.reclaim.ai/en/articles/4129152 · https://reclaim.ai/features/habits · https://help.reclaim.ai/en/articles/15280604-reclaim-2-0-faq · https://www.capterra.co.za/software/1058797/reclaim
