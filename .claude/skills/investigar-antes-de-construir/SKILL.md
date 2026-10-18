---
name: investigar-antes-de-construir
description: Ciclo de investigación obligatorio antes de implementar una fase o funcionalidad importante de myPanel (framework, integración, API, IA, servicio externo).
---

1. Formula el recorrido de usuario que se va a construir y los criterios de aceptación.
2. Comprueba el estado actual en fuentes primarias: documentación oficial, registro de paquetes (`npm view <pkg> version time`), repositorios mantenidos y productos reales. Anota URL y fecha de consulta.
3. Verifica precios, límites, permisos y vigencia de las APIs. Si solo tienes un resumen o una fuente secundaria, márcalo como tal.
4. Compara al menos dos alternativas con criterios explícitos (recorridos, coste, privacidad, mantenimiento).
5. Si es posible, haz una prueba ejecutable pequeña en `research/<tema>/` y guarda el resultado.
6. Etiqueta cada afirmación: [H] comprobado, [H·r] vía resumen, [H·s] secundario, [I] inferencia, [P] propuesta, [?] incierto.
7. Actualiza `docs/DECISIONES.md` (decisión, supuestos, pendientes, registro) y pide revisión si la decisión afecta a producto, interfaz, permisos, coste o arquitectura.
