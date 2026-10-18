# Datos financieros: cómo recogerlos gratis y con seguridad

Fecha: 18-10-2026. Estado: **documentado y aplazado** por decisión del usuario: no se implementa todavía. Mientras tanto, las aportaciones se registran confirmándolas a mano (ver D-029).
Entidades: MyInvestor, Trade Republic y CaixaBank. Objetivo: patrimonio, inversiones, en qué se gasta y avisos de bajadas.

Etiquetas: [H] comprobado en fuente primaria · [H·r] vía resumen · [H·s] fuente secundaria · [I] inferencia · [P] propuesta · [?] por comprobar.

## 1. Lo primero: «100 % seguro» no existe
Ningún sistema conectado lo es. Lo que sí podemos garantizar es esto:
- **Nadie que no seas tú ve tus contraseñas del banco.** Pauta nunca las pide ni las guarda.
- **Solo lectura por diseño.** Ninguna pieza puede mover dinero: no se usa ninguna vía que lo permita.
- **Mínimos terceros**, con licencia y supervisión cuando los haya.
- **Revocable en un toque**, desde tu banco o desde el proveedor.
- **Tus datos financieros en casa** (Mac o NAS), cifrados, sin exponerlos a internet.

Con esas condiciones hay dos vías aceptables (niveles A y B) y varias que descarto.

## 2. Vías comparadas

| Vía | Qué cubre | Coste | Seguridad | Esfuerzo | Veredicto |
|---|---|---|---|---|---|
| **A · Importar los ficheros que tú descargas** | Todo: cuentas, tarjetas, órdenes de fondos y acciones | 0 € | Máxima: sin terceros ni credenciales; el fichero va de tu banco a tu equipo | ~5 min al mes | ✅ Base |
| **B · PSD2 de solo lectura con Enable Banking** (modo restringido, cuentas propias) | Cuentas de pago: saldos y movimientos. **No** cubre fondos ni acciones | 0 € para cuentas propias y uso personal; el número de cuentas enlazadas puede estar limitado [H condiciones de Enable Banking, 18-10-2026] | Alta: entras en la app de tu banco (SCA); el proveedor no ve tus claves; la ley solo permite leer; consentimiento con caducidad y revocable | Renovar el permiso cada 180 días como mucho | ✅ Opcional, tras una prueba |
| C · Apps agregadoras (Fintonic, Finary…) | Varía | Gratis o de pago | Tus datos en su nube; no dan API para Pauta | — | ❌ No encaja |
| D · API no oficial de Trade Republic (`pytr`) | Todo, incluido operar | 0 € | Guarda teléfono y PIN en un fichero; API privada de ingeniería inversa; puede violar sus condiciones; permite órdenes [H·s README y PyPI] | — | ❌ Descartada |
| E · Rascar la web del banco con tu usuario y contraseña | Lo que veas en la web | 0 € | Compartir credenciales; frágil; choca con la SCA | — | ❌ Descartada |
| F · GoCardless Bank Account Data | Cuentas | Era gratis | No acepta altas nuevas desde julio de 2025 [H·s documentación de Actual Budget] | — | ❌ No disponible |

### Nivel A · Ficheros que descargas tú (recomendado como base)
- **CaixaBank**: exportar movimientos de cuenta a Excel desde CaixaBankNow (Mis cuentas › extraer movimientos) [H·s HelpMyCash]. Un foro menciona coste por la descarga en Excel [?: comprobar en tu app].
- **MyInvestor**: «Resumen de movimientos» de la cuenta en Excel (Documentación de la cuenta) [H·s guía de allinvestview]; órdenes de fondos en la plataforma Inversis. No consta exportación de posiciones de fondos [?].
- **Trade Republic**: exportación CSV de transacciones (inversión y cuenta de efectivo) desde abril de 2026 [H·s getquin, foro de Portfolio Performance]; algunas guías antiguas dicen que no existe.
- Pauta lee esos ficheros con un importador por entidad: normaliza (fecha, importe, concepto, cuenta), quita duplicados y nunca los sube a ningún sitio. Los ficheros reales no entran en el repositorio.

### Nivel B · PSD2 de solo lectura con Enable Banking
- **Quién es**: Enable Banking Oy (Espoo, Finlandia), proveedor de información de cuentas autorizado y supervisado por la FIN-FSA, inscrito en el registro de la EBA [H·r condiciones de servicio y pie de su web].
- **Gratis para ti**: la aplicación de producción se activa en «modo restringido» enlazando tus propias cuentas; solo esas cuentas son accesibles, sin contrato ni KYB [H FAQ]. El uso comercial para otros sí es de pago.
- **Cómo se autentica**: Pauta firma sus peticiones con una clave privada RSA propia (JWT RS256) [H referencia de la API]; tú apruebas el acceso en la app de tu banco (CaixaBank usa CaixaBankNow para la SCA [H página de España de Enable Banking]).
- **Caducidad**: desde el 25-07-2023 la renovación de la SCA para acceso vía agregador es como mucho cada 180 días (Reglamento Delegado 2022/2360) [H·r nota de prensa de la EBA]; cada banco declara su máximo (`maximum_consent_validity`) [H referencia de la API].
- **Revocar**: en tu banco o en enablebanking.com/data-sharing-consents [H FAQ].
- **Qué no hace**: no categoriza gastos [H FAQ]; lo haremos con reglas propias.
- **Qué ve el proveedor**: tus movimientos pasan por él en tránsito [I]. Es el precio de automatizar.

### Cobertura por entidad
| Entidad | Nivel A | Nivel B (PSD2) | Inversiones |
|---|---|---|---|
| CaixaBank | Excel de movimientos | Sí; documentado por Enable Banking [H] | No aplica |
| MyInvestor | Excel de movimientos de la cuenta | Su PSD2 va por la plataforma de Redsys [H web de MyInvestor]; en Enable Banking aparece en **beta**, 180 días [H lista pública de entidades, 18-10-2026] | Fondos: posiciones a mano (participaciones) + valor liquidativo diario; órdenes desde Inversis |
| Trade Republic | CSV de transacciones (desde abril de 2026) | API PSD2 oficial para proveedores con licencia, solo cuenta de efectivo [H guía TPP 2.1, julio de 2026]; en Enable Banking aparece en **beta** y el consentimiento dura **90 días** [H lista pública de entidades y guía TPP, 18-10-2026] | Desde el CSV |

## 3. Valor liquidativo de los fondos (gratis)
| Fuente | Cobertura | Coste | Pega | Veredicto |
|---|---|---|---|---|
| **EODHD**, plan gratuito | Tiene fondos europeos por ISIN (sufijo `.EUFUND`) [H fichas de su web] | 0 €: 20 llamadas/día, 1 año de histórico, uso personal [H página de precios] | Que el plan gratuito incluya `.EUFUND` está [?] | ✅ Primera opción, tras probar tus ISIN |
| **Web de la gestora** | Oficial, fondo a fondo | 0 € | Un adaptador por gestora; cambian sus webs | ✅ Respaldo |
| **CNMV** (fichero mensual con valores diarios) | Solo fondos registrados en España | 0 € | Fichero mensual con valores diarios [H descripción de ficheros de la CNMV]; que llegue con un mes de retraso y no cubra fondos irlandeses o luxemburgueses es [I] | Solo histórico |
| Precio de tus propias operaciones | Tus fechas de compra | 0 € | No da el día a día | Complemento |
| Yahoo Finance o Morningstar sin API oficial | Amplia | 0 € | Condiciones de uso; se rompe | ❌ |

Con 5–8 fondos, una llamada diaria por fondo cabe en las 20 gratuitas [I].

## 4. Gastos e ingresos
- Categorías con **reglas propias** (comercio o concepto → categoría), editables y sin IA; lo que no encaje queda «sin clasificar» para que lo asignes y la regla aprenda [P].
- Vistas: gasto por categoría y mes, comercios más frecuentes, comparación con meses anteriores, y la misma cuadrícula anual del sistema de diseño [P].

## 5. Reglas de seguridad propuestas [P]
1. Pauta nunca pide ni guarda contraseñas de bancos o brókers.
2. Solo vías de lectura. Si un conector pudiera mover dinero (PIS, API no oficial), no se usa.
3. Datos financieros solo en tu Mac o en el NAS, cifrados en reposo; nunca en Cloudflare ni en el repositorio.
4. La clave privada de Enable Banking, en el llavero del sistema o en un secreto del NAS; nunca en el código.
5. Sin acceso desde internet al servidor de finanzas (Tailscale); copia de seguridad cifrada.
6. Registro de cada sincronización (cuándo, qué cuenta, cuántos movimientos) y aviso cuando un permiso esté a punto de caducar.
7. Botón «desconectar» que borra la sesión y te lleva a revocar en el banco.

## 6. Pruebas antes de decidir (cada una con tu confirmación) [P]
1. **Ficheros**: descargas un fichero de cada entidad; escribo los importadores con una copia anonimizada (importes y conceptos cambiados) en `research/finanzas-import/`. Los ficheros reales no salen de tu equipo.
2. **Enable Banking**: creas tú la cuenta (tu correo) y la aplicación; con su clave consulto qué bancos españoles cubre (`/aspsps?country=ES`) para confirmar MyInvestor y Trade Republic, y enlazamos una cuenta de prueba.
3. **EODHD**: creas una clave gratuita y pruebo tus ISIN.

## 7. Fuentes (consultadas el 18-10-2026)
- Enable Banking: https://enablebanking.com/docs/faq/ · https://enablebanking.com/docs/api/reference/ · https://enablebanking.com/docs/markets/es/ · https://enablebanking.com/terms · registro EBA: https://euclid.eba.europa.eu/register/pir/view/PSD_AISP/FI_FIN_FSA!29884997
- Trade Republic, guía PSD2 para TPP 2.1: https://assets.traderepublic.com/assets/files/TPP_API_Guide_v2.pdf · CSV: https://help.getquin.com/en/articles/14633614 · https://forum.portfolio-performance.info/t/import-trade-republic-csv-transaktionsexport/39126
- MyInvestor, PSD2: https://myinvestor.es/legal/normativa-psd2/ · exportaciones: https://www.allinvestview.com/es/impuestos-myinvestor/
- CaixaBank: https://www.helpmycash.com/videos/131/caixabank-como-descargar-extractos-desde-la-app-caixabank/ · https://www.caixabank.es/particular/cuentas-bancarias/extracto-bancario-p.html
- EBA, 180 días: https://www.eba.europa.eu/publications-and-media/press-releases/eba-publishes-final-report-amendment-its-technical-standards
- GoCardless: https://actualbudget.org/docs/advanced/bank-sync/gocardless/
- pytr: https://github.com/nborrmann/pytr · https://github.com/ptrstn/pytr · https://pypi.org/project/pytr/0.2.3 · https://glama.ai/mcp/servers/mwxga7ndfr
- EODHD: https://eodhd.com/pricing · https://eodhd.com/financial-summary/IE00B3NHP925.EUFUND
- CNMV: https://www.cnmv.es/DocPortal/Estadisticas/Descarga-Informacion-Individual/Periodicidad-Descripcion.pdf

## Verificación del 18-10-2026
Revisado otra vez en fuentes primarias (detalle en `research/almacenamiento/fuentes-finanzas.md`):
- Enable Banking es gratis para uso personal según sus condiciones, no según el FAQ; puede limitar el número de cuentas enlazadas.
- CaixaBank está estable (180 días); MyInvestor y Trade Republic están en beta, y Trade Republic caduca a los 90 días.
- En bancos que usan Redsys solo cabe una sesión activa por usuario y proveedor: conectar otra app con Enable Banking podría cerrar la de Pauta [I].
- El historial completo solo se puede leer en la primera hora tras autorizar; después, 90 días en muchos bancos.
- Precios: EODHD gratis (20 llamadas/día) sigue siendo la primera opción; OpenFIGI (ISIN → ticker) y el BCE (tipos de cambio) funcionan gratis y los he probado; Twelve Data gratis no permite mostrar los datos y Marketstack se queda corto.
- Tink y Salt Edge no aceptan altas abiertas; GoCardless sigue sin altas nuevas.
