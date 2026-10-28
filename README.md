# Pauta (repositorio myPanel)

Una «secretaria personal» que reúne en un sitio tus calendarios de varias cuentas, tus tareas y lo que sabe de ti. Incluye un **asistente con RAG** al que le preguntas en español y que responde **citando de dónde sale cada dato**. Es local primero y no cuesta nada. Funciona en escritorio y en móvil.

**Pruébala:** https://braisdlim.github.io/myPanel/#/asistente
- Sin conectar nada, el asistente usa a **Lucía, una persona de ejemplo inventada**.
- Prueba «¿Cuándo tengo el dentista?», «¿Cuántas veces tengo yoga esta semana?» o «¿Cuál es mi grupo sanguíneo?»: esta última no tiene respuesta y debe decir que no lo sabe.

## Lo que hay dentro
| Parte | Qué hace | Dónde |
|---|---|---|
| **Asistente con RAG** | Router temporal propio (las fechas y los conteos los calcula el código), BM25 en español, vectores locales opcionales (multilingual-e5-small con Transformers.js en un Web Worker), fusión RRF, citas comprobadas en código, persona de ejemplo y banco de evaluación con métricas | [docs/producto/12-asistente-rag.md](docs/producto/12-asistente-rag.md) · [resultados](research/rag/resultados.md) |
| **Calendarios de Google** | Varias cuentas con OAuth en el navegador, sin servidor ni secretos; los eventos repetidos entre calendarios se unen; puede crear eventos y «cambiar solo esta vez» con confirmación y relectura | `app/src/lib/google.js`, `calendario.js` |
| **Tareas y «Apuntar»** | Analizador de fechas en español sin IA que pregunta cuando algo es ambiguo | `app/src/lib/analizador.js` |
| **Sistema de diseño** | Tokens, componentes, contraste comprobado y paridad escritorio–móvil | [diseno/](diseno/README.md) |
| **Pruebas** | 60 unitarias (`node --test`) y 155 de Playwright en móvil y escritorio, tema claro y oscuro, con revisión de contraste, tamaño táctil y axe | `app/pruebas/` |

Hecho con Astro 7 y Svelte 5, como web estática en GitHub Pages; los datos se guardan en IndexedDB, en tu dispositivo.

## Asistente: resultados del banco (45 preguntas, 28-10-2026)
| Configuración | acierto@1 | acierto@5 | MRR | exacta |
|---|---|---|---|---|
| BM25 | 75 % | 85 % | 0,79 | 77 % |
| Vectores solos | 93 % | 98 % | 0,94 | 95 % |
| **Híbrido (RRF)** | 85 % | **98 %** | 0,90 | **95 %** |

El router temporal acierta 22 de 22. El asistente se abstiene en las 4 preguntas sin respuesta y no repite el documento trampa. Con el modelo gratuito (OVH gpt-oss-120b), el **97 %** de lo que ve el usuario contiene el dato correcto, con 0 citas inventadas. Qué significa cada cifra y sus límites: [docs/producto/12-asistente-rag.md](docs/producto/12-asistente-rag.md).

## Usarla y desarrollar
```sh
cd app
npm install
npm run dev                            # http://localhost:4321
npm test                               # pruebas unitarias
npm run build:pruebas && npx playwright test
node scripts/evaluar-rag.mjs           # banco del asistente (añade --generar=ovh para medir las respuestas del modelo)
```

Privacidad:
- Tus datos no salen del dispositivo.
- Al modelo que redacta (por defecto OVHcloud, gratis y sin clave, o el tuyo con tu clave) solo le llegan los fragmentos encontrados para cada pregunta, y la primera vez te pide permiso.
- Las claves se guardan solo en memoria.

## Documentación
- [Traspaso: dónde estamos, qué sigue y cómo trabajar](docs/TRASPASO.md)
- [Documento vivo de decisiones, supuestos y pendientes](docs/DECISIONES.md)
- [Definición del producto](docs/producto/README.md) · [Asistente con RAG](docs/producto/12-asistente-rag.md)
- [Guía: conectar Google Calendar](docs/guias/conectar-google-calendar.md)
- [Sistema de diseño](diseno/README.md) · [Referencias visuales](docs/referencias/README.md)
- [Investigación](research/) · [Fase 0](docs/fase-0/investigacion-y-propuesta.md) · [Prototipo inicial](prototype/)
