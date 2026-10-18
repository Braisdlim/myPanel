# NAS doméstico, acceso remoto y sincronización (18-10-2026)

Etiquetas: [H] fuente primaria leída, [H·s] secundaria, [I] inferencia, [?] sin comprobar.

## Contenedores en el NAS
- Synology Container Manager 24.0.2 (4-8-2026) exige DSM 7.4; la lista oficial de modelos incluye la serie «+» y algunos de gama baja con CPU ARM [H synology.com/en-global/dsm/packages/ContainerManager]. Hay que comprobar el modelo concreto.
- QNAP Container Station en x86-64 y ARM; la imagen debe coincidir con la arquitectura [H·s qnap.com].
- UGREEN: Docker oficial en DH4300 Plus y serie DXP, no en DH2300 [H ai.ugreen.com/pages/solution-software].

## Acceso remoto sin abrir puertos
- Tailscale Personal: gratis, dispositivos ilimitados, hasta 6 usuarios [H tailscale.com/pricing]; clientes para iOS, Android, macOS, Windows y paquete para Synology [H].
- HTTPS en la red de Tailscale: certificados Let's Encrypt para `*.ts.net` con `tailscale cert` o `tailscale serve` [H tailscale.com/kb/1153/enabling-https]. Una web app en el móvil necesita HTTPS (service workers) [H MDN].
- Cloudflare Tunnel: conexiones solo salientes [H developers.cloudflare.com]; Cloudflare termina el TLS y ve el tráfico [I].
- Synology QuickConnect no admite apps propias [H synology.com].

## Copias y riesgos
- Regla 3-2-1 [H·s Backblaze]; Hyper Backup a S3, Google Drive, etc., con cifrado [H synology.com]; restic y rclone con cifrado [H].
- Synology publicó 13 avisos de seguridad en 2026, alguno crítico [H synology.com/security/advisory]; ransomware DeadBolt en QNAP en 2022 [H·s].
- Sin luz o sin internet en casa no hay sincronización remota [I].

## Motores de sincronización (versiones del 18-10-2026)
| Motor | Licencia | Sin conexión | Estado |
|---|---|---|---|
| PowerSync (servicio autoalojable) | FSL-1.1 → Apache 2.0 a los 2 años; SDK Apache-2.0 | sí, SQLite en el cliente; backend Postgres u otros | service-core 1.27.0; plugin de Tauri 0.0.6 (muy temprano) |
| ElectricSQL | Apache-2.0 | solo lecturas; escrituras por tu API | 1.8.1 |
| Rocicorp Zero | Apache-2.0 | lecturas sí, escrituras sin conexión no | 1.11.0 |
| Replicache | gratis | sí | en mantenimiento; recomiendan Zero |
| Automerge | MIT | sí (CRDT) | 3.5.0 |
| cr-sqlite | MIT | sí (CRDT) | 0.16.0 de 2023, parece abandonado [I] |
| libSQL/sqld | MIT | réplicas embebidas; `offline` contra sqld propio [?] | mantenido; novedades en Turso Database (0.8.3) |
| PocketBase | MIT | no | 0.40.5, sin compatibilidad garantizada antes de la v1 |
