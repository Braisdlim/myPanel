# Dónde viven los datos y cómo se sincronizan

Fecha: 18-10-2026. Estado: **propuesta, pendiente de tu decisión** (P-034).
Etiquetas: [H] comprobado en fuente primaria · [H·s] fuente secundaria · [I] inferencia · [P] propuesta · [?] por comprobar.
Detalle y enlaces: `research/almacenamiento/` (Cloudflare y bases gestionadas, NAS y sincronización, fuentes financieras) y `research/datos-almacenamiento/` (prueba de volumen).

## 1. Qué tiene que cumplir
- **Recorrido**: apuntas una tarea en el móvil en la calle y la ves al momento en el Mac de casa y en el Windows del trabajo; sin cobertura, la app sigue funcionando y sincroniza al volver.
- **Criterios**:
  1. Funciona sin conexión en todos los dispositivos.
  2. Sincroniza en segundos cuando hay conexión, también fuera de casa y sin pasos extra en el móvil.
  3. Los datos financieros no los puede leer nadie más que tú.
  4. Coste 0 € con un usuario; coste razonable si un día la usan 1.000 personas.
  5. Copias de seguridad automáticas y poco mantenimiento.
  6. Poder cambiar de proveedor sin rehacer la app.

## 2. Cuántos datos son de verdad
- [H] Prueba propia: 10 años de una persona (20 fondos con valor diario, 30.000 movimientos bancarios, 15.000 eventos y 15.000 tareas) ocupan **6,9 MB** en SQLite; con índices, unos 15 MB.
- [I] Con 1.000 personas, unos 13 GB en 10 años, porque los precios de los fondos se comparten.
- **Conclusión**: el volumen no es el problema. Lo difícil es sincronizar bien entre dispositivos, que esté disponible fuera de casa y proteger las finanzas. Eso es lo que decide.
- Los eventos de Google y Microsoft ya viven en sus servidores: Pauta solo guarda una copia local en cada dispositivo para ir rápido y funcionar sin conexión. Lo que hay que sincronizar es lo propio de Pauta: tareas, planes, ajustes, reglas de aviso y finanzas.

## 3. Las tres opciones

| Criterio | NAS en casa | Base de datos gestionada gratuita | Cloudflare |
|---|---|---|---|
| Privacidad de las finanzas | **La mejor**: no salen de casa; con Tailscale el tráfico va cifrado de punta a punta [H] | El proveedor guarda la clave de cifrado; ningún plan gratuito cifra de extremo a extremo [H] | Cloudflare guarda la clave (AES-256) [H]; datos en la UE gratis, pero procesar solo en la UE es de Enterprise [H] |
| Disponible fuera de casa | Depende de la luz y el router de casa; el móvil necesita la VPN de Tailscale encendida [H/I] | Siempre, salvo pausas | Siempre |
| Pausas del plan gratuito | No aplica | Supabase y Appwrite pausan a la semana sin uso; Turso archiva a los 10 días; Atlas a los 30 [H] | No pausa; si superas los límites diarios, corta hasta medianoche UTC (desde el 1-9-2026) [H] |
| Copias de seguridad | Las montas tú (Hyper Backup o restic, regla 3-2-1) [H] | Supabase, Appwrite y Firebase gratis: sin copias; Neon: 6 h [H] | Time Travel de 7 días gratis y exportación a .sql [H] |
| Funciona sin conexión | Con un motor de sincronización autoalojado (PowerSync, Automerge…) [H] | Solo Firebase (maduro, muy atado a Google) y Turso (antes de la 1.0, recién comprado por Supabase) [H] | Hay que construir la sincronización (base local + servidor) [I] |
| Mantenimiento | **El más alto**: actualizaciones del NAS (13 avisos de seguridad de Synology en 2026), contenedores, certificados, comprobar copias [H] | Bajo | **El más bajo** |
| Coste con 1 usuario | 0 € (ya tienes el NAS) + almacenamiento externo para copias | 0 € | 0 € [H límites del plan gratuito] |
| Con 1.000 usuarios | No sirve: tu casa no es un centro de datos [I] | De 15 a 25 $/mes en el primer plan de pago [H] | Unos 5 $/mes (plan de pago) [I según precios oficiales] |
| Cambiar de proveedor | Total libertad | Postgres (Neon, Supabase) se exporta con `pg_dump`; Firebase, mucho más difícil [H/I] | D1 es SQLite y se exporta; el código del servidor sí es propio de Cloudflare [H/I] |
| Para enseñarlo en una entrevista | Autoalojamiento y redes | Lo más habitual | Arquitectura moderna en el borde |

## 4. Recomendación [P]

**Local primero, con Cloudflare como punto de sincronización y el NAS para copias y para lo más sensible.**

1. **Cada dispositivo tiene su propia base de datos SQLite.** En el escritorio, dentro de la app de Tauri; en el móvil, dentro del navegador. La app nunca espera al servidor para mostrar algo: así funciona sin conexión y va rápida.
2. **Cloudflare sincroniza** tareas, planes, ajustes y reglas. Usaríamos el plan gratuito, con los datos en la UE y una base pequeña por usuario. Así crece de 1 a 1.000 usuarios sin rehacer nada y sin tocar los límites por base.
3. **Cifrado en tu dispositivo** antes de enviar lo sensible: Cloudflare guarda los datos, pero sin la clave (que solo está en tus dispositivos) no puede leerlos. Se resuelve la principal desventaja de Cloudflare sin perder disponibilidad.
4. **Finanzas** (fase 3), dos posibilidades a elegir entonces:
   - a) Cifradas de extremo a extremo y sincronizadas por Cloudflare, como el resto. Los movimientos los descarga tu app de escritorio con tu clave de Enable Banking guardada en el llavero del sistema, así ningún servidor los ve en claro.
   - b) Solo en el NAS, como decía D-028, y en el móvil solo cuando estés conectado a Tailscale.
   - Los precios de los fondos son públicos: los puede traer el servidor de Cloudflare cada día sin problema.
5. **El NAS, desde ya, para las copias**: cada noche guarda una copia cifrada de todo (regla 3-2-1). Más adelante, para lo pesado que conviene tener en casa, como indexar el correo o una IA local.
6. **Sincronización**: propia y sencilla al principio. Cada cambio lleva su hora y, si hay choque, gana el último campo cambiado. Con un solo usuario los choques son raros. Los motores de sincronización disponibles hoy no encajan del todo:
   - PowerSync exige Postgres y su plugin de Tauri va por la 0.0.6.
   - Electric y Zero no guardan cambios sin conexión.
   - Turso aún no ha llegado a la 1.0.

   Se revisa en la prueba técnica.

**Por qué no solo el NAS**: tendrías que llevar la VPN siempre encendida en el móvil, un corte de luz o de internet en casa te deja sin sincronizar y el mantenimiento es tuyo. Para lo que más usarás (Hoy, Calendario y Tareas) eso pesa más que la privacidad extra, que el cifrado ya da.
**Por qué no una base gestionada gratuita**: las que pausan a la semana o no hacen copias no valen para datos de los que dependes; Firebase te ata a Google; Neon es buena, pero añade un servicio más sin resolver lo de funcionar sin conexión.

## 5. Datos financieros: de dónde salen (verificado el 18-10-2026)
| Qué | Fuente | Coste y límites | Estado |
|---|---|---|---|
| Valor diario de fondos y ETF | EODHD plan gratuito (fondos por ISIN en `EUFUND`) | 20 llamadas/día, 1 año de histórico, uso personal [H] | Probar con tus ISIN si el plan gratuito incluye `EUFUND` [?]; con 20 fondos se gasta el cupo entero |
| ISIN → identificador | OpenFIGI | Gratis, sin límite diario [H, probado] | ✅ |
| Tipos de cambio | BCE | Gratis, sin clave [H, probado] | ✅ |
| Histórico anterior | Tus propias operaciones; CNMV (fondos españoles); webs de gestoras | Gratis; webs frágiles [H/I] | Complemento |
| Movimientos | Ficheros que descargas: CaixaBank (Excel), Trade Republic (CSV desde abril de 2026), MyInvestor (CSV de órdenes) [H·s] | Gratis | Base |
| Movimientos automáticos | Enable Banking, uso personal gratis [H condiciones] | CaixaBank estable (180 días); MyInvestor y Trade Republic en beta, Trade Republic 90 días [H] | Opcional; historial completo solo la primera hora tras autorizar [H] |
- Descartados: Tink y Salt Edge (sin altas abiertas), GoCardless (sin altas desde julio de 2025), Twelve Data gratis (no deja mostrar los datos), Marketstack (100 llamadas al mes), API no oficial de Trade Republic.

## 6. Qué haría falta probar (prueba técnica)
1. Una tarea creada en la app de escritorio aparece en el móvil a través de Cloudflare, con el móvil sin conexión durante un rato.
2. El contenido sensible viaja cifrado y Cloudflare solo ve datos ilegibles.
3. Copia nocturna desde el NAS y restauración de esa copia.
4. EODHD con tus ISIN y Enable Banking con CaixaBank (cuando lleguemos a Finanzas).

## 7. Lo que necesito de ti
1. **Modelo del NAS** (marca y modelo): para confirmar que puede ejecutar contenedores y qué procesador tiene.
2. **¿Te vale la recomendación?** Local primero, Cloudflare para sincronizar con cifrado y el NAS para copias.
3. **Finanzas**: ¿opción a (cifradas en Cloudflare) u opción b (solo en el NAS)? Puede esperar a la fase 3.
4. **Tus fondos (ISIN)**, cuando quieras, para probar EODHD.
