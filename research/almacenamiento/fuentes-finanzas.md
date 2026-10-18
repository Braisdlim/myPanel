# Verificación de fuentes financieras (18-10-2026)

Resumen de la verificación de `docs/producto/08-datos-financieros.md`. Etiquetas: [H] fuente primaria leída, [H·s] secundaria, [I] inferencia, [?] sin comprobar.

## Banca (PSD2, solo lectura)
- Enable Banking: «Use of the Control Panel and the API under these Terms is free of charge»; producción limitada a cuentas enlazadas «for the personal use of private individuals»; «the number of Linked Accounts per Application may be limited» [H https://enablebanking.com/terms; https://enablebanking.com/docs/api/linked-accounts/].
- Lista pública de entidades en España (119) [H https://enablebanking.com/api/aspsps?country=ES]: CaixaBank estable, 180 días; MyInvestor Banco **beta**, 180 días; Trade Republic (ES) **beta**, **90 días**.
- Historial completo solo durante «around one hour» tras autorizar; luego muchos bancos dan 90 días; sin categorización [H https://enablebanking.com/docs/faq/].
- Bancos en Redsys: «one active authentication session per user per TPP» [H https://enablebanking.com/docs/markets/es/].
- Trade Republic: consentimiento «up to 90 days» [H https://assets.traderepublic.com/assets/files/TPP_API_Guide_v2.pdf].
- GoCardless: sin altas nuevas desde julio de 2025 [H·s https://actualbudget.org/docs/advanced/bank-sync/gocardless/]. Tink: precios solo para clientes existentes [H https://tink.com/pricing/]. Salt Edge: alta por invitación [H https://docs.saltedge.com/v6/].

## Precios de fondos y ETF
- EODHD gratis: 20 llamadas/día (+500 de bienvenida), un año de histórico, uso personal; cubre fondos por ISIN en `EUFUND` [H https://eodhd.com/pricing, https://eodhd.com/exchange/EUFUND]. Si el plan gratuito incluye `EUFUND`: [?] (probar con clave propia).
- OpenFIGI: gratis sin límites diarios; 25 peticiones/min sin clave; probado ISIN → ticker [H https://www.openfigi.com/api/documentation].
- BCE: tipos de cambio sin clave, probado USD/EUR del 16-10-2026 = 1,1253 [H https://data-api.ecb.europa.eu/].
- CNMV: fichero mensual con valores liquidativos diarios de fondos españoles [H PDF de la CNMV]; que no cubra fondos irlandeses o luxemburgueses es [I].
- FMP gratis 250/día, cobertura UCITS dudosa [I]; Alpha Vantage 25/día [H]; Twelve Data gratis no permite mostrar datos a usuarios [H]; Marketstack 100/mes [H].

## Exportaciones
- Trade Republic: CSV de todo el historial desde abril de 2026 [H·s foro de Portfolio Performance, mobiflip.de].
- MyInvestor: CSV de órdenes por fondo [H·s allinvestview.com]; PSD2 vía Redsys [H].
- CaixaBank: Excel o PDF de movimientos [H·s]; Norma 43 para particulares [?].

## Volumen (medido en SQLite, 10 años)
Unos 15 MB por persona con índices (52.180 valores liquidativos, 30.000 movimientos, 20.000 eventos). Con 1.000 personas, unos 13 GB (los precios se comparten). Prueba propia en `research/datos-almacenamiento/`: 6,9 MB sin índices.
