# Método: maquetas sobre una app base antes de programar

Fecha: 18-10-2026. Estado: **propuesta, pendiente de tu revisión**.

## 1. Qué recomienda la práctica actual (fuentes secundarias, sin estándar formal)
- Primero un sistema de diseño legible por máquinas (ya lo tenemos: `diseno/sistema/`), después explorar en un lienzo y, al final, pasar a código desde ese lienzo [H·s Anima, Devlin Peck, designproject.io, Figr, 2026].
- Explorar 2–3 direcciones de una pantalla que ya se entiende y elegir antes de producir [H·s ginfomedia, 2026].
- Las herramientas de generación por IA (Stitch, Figma AI) sirven para idear; el trabajo fino se hace en un lienzo ligado al código [H·s Wireflow, OpenDesign, 2026].

## 2. Herramientas (comprobado el 18-10-2026)
| Herramienta | Coste | Para qué | Pega |
|---|---|---|---|
| **Lienzo de diseño de Claude** (tipo de página «Design» de esta cuenta) | Incluido | Pantallas en tablero, escritas por mí con los mismos tokens y clases `pa-*`; las comentas desde el móvil | No lo editas tú a mano |
| **Figma** + kit oficial de macOS 27 de Apple | Starter gratis con «acceso limitado»; Professional 16 $/mes por editor [H figma.com/pricing] | Editar a mano; kit de Apple para Figma y Sketch [H developer.apple.com/design/resources] | Para que yo lo lea o escriba hay que conectar Figma en los conectores de claude.ai; el kit de Apple es para interfaces de sus plataformas |
| **Penpot** | Professional 0 $, «sin límites» [H penpot.app/pricing] | Alternativa libre a Figma; tiene servidor MCP para agentes [H penpot.app] | Montar la conexión del agente requiere tener Penpot abierto con su complemento |
| **Google Stitch** | Gratis (Google Labs), exporta a Figma y HTML [H·s reseñas] | Generar ideas rápidas desde texto o imágenes | No sigue nuestro sistema con precisión; producto experimental |
| **Mobbin** | Gratis limitado; Pro 15 $/mes [H mobbin.com/pricing, captura 11-09-2026] | Biblioteca de pantallas reales web y móvil | No consta biblioteca de apps de Mac; ya tenemos capturas oficiales propias |

## 3. Proceso propuesto [P]
1. **Una app base por sector** (estructura y comportamiento), el resto como detalles:
   - Finanzas → **Bolsa** de Apple (Mac e iPhone). Decidido por el usuario.
   - Calendario → **Fantastical** (barra lateral con minimes y agenda + semana); alternativas: Calendario de Apple (macOS 27) o Notion Calendar.
   - Tareas y Hoy → **Things 3** (Hoy con eventos arriba, «Esta noche», Algún día).
2. **Anatomía** de la pantalla base: zonas, medidas, jerarquía y qué componente nuestro ocupa cada zona.
3. **Calco con nuestro contenido** en el lienzo: la misma composición que la base, con el sistema Pauta y datos reales o marcados como ejemplo; Mac y Android, oscuro y claro, con la captura de referencia al lado.
4. **Revisión** con comentarios en el lienzo y una o dos vueltas.
5. **Código** solo de lo aprobado; el lienzo usa los mismos tokens y clases, así que el paso es directo.

Orden: Finanzas → Hoy → Calendario → Tareas.

## 4. Fuentes
- https://developer.apple.com/design/resources/ (kit de macOS 27 para Figma y Sketch)
- https://help.figma.com/hc/en-us/articles/24037833895831-Get-started-with-Apple-s-UI-kit
- https://www.figma.com/pricing/ · https://penpot.app/pricing · https://penpot.app/penpot-mcp-server · https://mobbin.com/pricing.md
- https://www.banani.co/blog/google-stitch-ai-review · https://moda.app/blog/google-stitch-review
- https://animaapp.com/blog/ai-design-en/ai-design/ · https://www.devlinpeck.com/content/ai-in-design · https://designproject.io/blog/ai-design-workflow/ · https://figr.design/blog/reinventing-design-systems-ai · https://www.wireflow.ai/blog/best-agentic-design-tools-in-2026 · https://open-design.ai/blog/ai-design-agents/
- https://timingapp.com/blog/best-calendar-apps-for-mac/ · https://thesweetsetup.com/apps/best-calendar-app-for-mac/
