# Cloudflare y bases de datos gestionadas gratuitas (18-10-2026)

Etiquetas: [H] fuente primaria leída, [?] sin comprobar. `dc` = https://developers.cloudflare.com

## Cloudflare
| Producto | Gratis | Pago (desde 5 USD/mes) |
|---|---|---|
| Workers | 100.000 peticiones/día; 10 ms de CPU por invocación; 5 crons | 10 M peticiones/mes; hasta 5 min de CPU [H dc/workers/platform/pricing, limits] |
| D1 (SQLite) | 10 BD; 500 MB por BD; 5 GB en total; 5 M filas leídas y 100.000 escritas/día; Time Travel 7 días | 10 GB por BD; Time Travel 30 días [H dc/d1/platform/limits, pricing] |
| R2 | 10 GB-mes; salida gratis | 0,015 USD/GB-mes [H dc/r2/pricing] |
| Tunnel | todos los planes [H dc/tunnel] | — |
| Access | gratis para menos de 50 usuarios [H cloudflare.com/zero-trust/products/access] | 7 USD/usuario/mes |
- Cifrado AES-256 con clave de Cloudflare [H dc/d1/reference/data-security]; jurisdicción `eu` al crear el recurso [H dc/d1/configuration/data-location]; procesar solo en la UE exige el complemento Enterprise [H dc/data-localization].
- Desde el 1-9-2026 D1 corta las consultas al superar los límites diarios gratuitos hasta las 00:00 UTC [H changelog 2026-09-01].

## Bases gestionadas
| Servicio | Gratis | Inactividad y copias | UE | Sin conexión |
|---|---|---|---|---|
| Supabase | 500 MB, 2 proyectos | pausa a la semana; sin copias [H supabase.com/pricing] | sí | no |
| Neon (Lakebase Postgres) | 1 GB por proyecto, 100 h de cómputo/mes | se apaga a los 5 min y arranca solo; restauración 6 h [H neon.com/pricing] | Fráncfort | no |
| Turso (libSQL) | 5 GB, 500 M lecturas/mes | archivado a los 10 días; restauración 1 día [H turso.tech/pricing] | Irlanda | sí: push/pull, gana el último; SDK web 0.8.3 [H docs.turso.tech/sync] |
| Firebase Firestore | 1 GiB, 50.000 lecturas/día | copias solo de pago [H firebase.google.com/pricing] | eur3 | sí, el más maduro |
| MongoDB Atlas M0 | 512 MB | pausa a los 30 días | sí | Device Sync cerrado el 30-9-2025 [H] |
| Appwrite Cloud | 2 GB | pausa a la semana; sin copias | Fráncfort | no |
- Turso anunció el 2-10-2026 que se une a Supabase [H https://turso.tech/blog/turso-is-joining-supabase, comprobado].
- Ningún plan gratuito cifra de extremo a extremo; claves propias solo en planes de pago.
