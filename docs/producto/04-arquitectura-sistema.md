# 4. Arquitectura del sistema

Cómo funciona por dentro: piezas, flujos de datos, modelo de datos y decisiones abiertas. Es una propuesta; lo marcado como **[decisión abierta]** necesita tu respuesta o una prueba.

## 4.1 Contexto: con qué se conecta

```mermaid
flowchart LR
  Yo(("Tú"))
  subgraph Disp["Tus dispositivos"]
    Mac["Mac<br/>app de escritorio"]
    And["Honor 600 Pro<br/>app instalada"]
  end
  P["myPanel<br/>(tu servidor: Cloudflare o NAS)"]
  subgraph Google["Google: dos cuentas"]
    GC["Calendar"]
    GM["Gmail"]
    GD["Drive"]
  end
  subgraph Fin["Finanzas"]
    OB["Bancos vía open banking<br/>(Enable Banking, PSD2)"]
    INV["Gestoras y brókers<br/>(CSV, token o manual)"]
    PR["Precios de fondos<br/>(proveedor por ISIN)"]
  end
  IA["IA opcional<br/>(local en NAS o API)"]
  EXT["Servicios externos<br/>(Yeasy…, futuro)"]

  Yo --> Mac & And
  Mac & And <--> P
  P <--> GC
  P --> GM & GD
  P --> OB & INV & PR
  P -.-> IA
  P -.-> EXT
```

Flechas dobles: lectura y escritura con confirmación. Flecha simple: solo lectura. Discontinua: opcional o futuro.

## 4.2 Piezas internas (contenedores)

```mermaid
flowchart TB
  subgraph Clientes
    UI["Interfaz (una base de código)<br/>web + app de escritorio + app Android"]
    Cache["Caché local y cola sin conexión<br/>(IndexedDB)"]
    UI <--> Cache
  end
  subgraph Servidor["Servidor myPanel"]
    API["API (núcleo)<br/>sesión, permisos, endpoints por sector"]
    Sync["Sincronizadores<br/>Calendar · Gmail · Drive · bancos · precios"]
    Reglas["Motor de reglas y avisos<br/>(conflictos, caídas de fondos, recordatorios)"]
    Busq["Búsqueda<br/>consulta en vivo → índice propio (fase 2)"]
    Acc["Acciones<br/>proponer → confirmar → ejecutar → comprobar"]
    Mem["Memoria<br/>hechos con origen y vigencia (fase 3)"]
    IAG["Pasarela de IA opcional"]
    DB[("Base de datos<br/>SQLite/Postgres")]
    Sec[("Secretos cifrados<br/>tokens por cuenta")]
  end
  UI <--> API
  API --> DB
  Sync --> DB
  Sync --> Sec
  Reglas --> DB
  Busq --> DB
  Acc --> Sec
  API --> Busq & Acc & Mem
  Mem --> DB
  API -.-> IAG
```

Principio clave [P]: **API primero**. La interfaz habla con el servidor solo a través de la API. Así podemos cambiar o añadir clientes (por ejemplo, una app de Mac nativa en el futuro) sin rehacer el sistema.

## 4.3 Flujos críticos

### Captura sin conexión
```mermaid
sequenceDiagram
  participant U as Tú
  participant C as App (cliente)
  participant Q as Cola local
  participant S as Servidor
  U->>C: «pedir cita en la peluquería»
  C->>Q: guarda con id único (al instante)
  C-->>U: «Guardado» (en < 1 s)
  Note over C,S: sin red…
  C->>S: al volver la red, envía la cola
  S-->>C: confirma ids (sin duplicados)
  C->>Q: vacía la cola
```

### Escribir en el calendario (confirmar y comprobar)
```mermaid
sequenceDiagram
  participant U as Tú
  participant A as Acciones
  participant G as Google Calendar (cuenta elegida)
  A->>U: propuesta: «Faltar al ensayo solo el 23 (cuenta Personal)»
  U->>A: confirmo
  A->>G: modifica SOLO esa ocurrencia
  A->>G: vuelve a leer el evento
  alt coincide
    A-->>U: «Hecho y comprobado»
  else no coincide o error
    A-->>U: error real y cómo arreglarlo
  end
  A->>A: queda en el registro de acciones
```

### Aviso de caída de un fondo
```mermaid
sequenceDiagram
  participant T as Tarea programada (diaria)
  participant P as Proveedor de precios
  participant R as Motor de reglas
  participant U as Tú
  T->>P: valor liquidativo de tus fondos (1 consulta por fondo)
  T->>R: guarda precios y evalúa tus reglas
  R-->>U: aviso: «Fondo X −5,2 % desde su máximo del 2 oct. Precio del 17 oct (fuente)»
  U->>R: «Crear tarea: valorar aportación» / «Ignorar» / «Ajustar regla»
```

## 4.4 Modelo de datos (primera versión)

```mermaid
erDiagram
  FUENTE ||--o{ EVENTO : aporta
  FUENTE ||--o{ CORREO_REF : aporta
  FUENTE ||--o{ DOC_REF : aporta
  FUENTE ||--o{ CUENTA_FIN : aporta
  SERIE ||--o{ EXCEPCION : tiene
  SERIE ||--o{ EVENTO : genera
  TAREA }o--o| EVENTO : "colocada en"
  CUENTA_FIN ||--o{ POSICION : contiene
  INSTRUMENTO ||--o{ POSICION : es
  INSTRUMENTO ||--o{ PRECIO : cotiza
  REGLA }o--|| INSTRUMENTO : vigila
  REGLA ||--o{ AVISO : dispara
  ACCION }o--|| FUENTE : "escribe en"
  HECHO }o--o{ FUENTE : "procede de"

  FUENTE { string tipo "gmail|calendar|drive|banco|gestora" string cuenta string permisos datetime ultima_lectura }
  EVENTO { string id_externo string titulo datetime inicio datetime fin string flexibilidad "fijo|opcional|movible" }
  SERIE { string id_externo string regla_recurrencia string flexibilidad }
  EXCEPCION { date ocurrencia string tipo "saltada|movida" }
  TAREA { string titulo date fecha string estado datetime creada string origen }
  INSTRUMENTO { string isin string nombre string divisa }
  PRECIO { date fecha decimal valor string fuente }
  POSICION { decimal participaciones decimal coste_medio }
  REGLA { string tipo "caida_desde_max|caida_diaria|aportacion" decimal umbral int ventana_dias }
  AVISO { datetime cuando string texto string estado }
  ACCION { string tipo string estado "propuesta|confirmada|ejecutada|comprobada|fallida" json antes json despues }
  HECHO { string texto string estado "confirmado|inferido|temporal" date vigencia }
```

## 4.5 Seguridad y privacidad
- Tokens de cada cuenta **cifrados** en el servidor; nunca en el navegador ni en el repositorio.
- Permisos mínimos por cuenta y por sector; se piden cuando se usa el sector, no todos al principio.
- Finanzas en **solo lectura** siempre.
- Registro de acciones auditable; exportar y borrar todos tus datos.
- Si hay NAS: datos sensibles (correo indexado, finanzas) en casa, con acceso privado (Tailscale o Cloudflare Tunnel con Access).

## 4.6 Decisiones abiertas (por orden de impacto)

### A. Plataforma de la app (decide el techo de calidad «nativa de Mac») — **[decisión abierta]**
| Opción | Mac | Android | Coste y riesgo |
|---|---|---|---|
| **1. Web instalable (PWA)** | Safari permite añadirla al Dock como app [I] | Instalable desde Chrome | Una base de código; techo de «sensación nativa» más bajo: sin barra de menús ni atajo global |
| **2. Web + carcasa Tauri en Mac** | Ventana nativa, barra de menús, atajo global de captura y notificaciones [I] | PWA (o Tauri móvil, menos maduro [H·s]) | La misma interfaz; compilar la app de Mac requiere un Mac o un servidor de integración continua con macOS |
| **3. Nativa: SwiftUI en Mac + Kotlin/Compose en Android** | Máxima calidad: Liquid Glass y convenciones reales | Nativa con widget | **Dos interfaces que mantener**; yo no puedo compilar ni probar SwiftUI desde este entorno Linux; más lento |
| **4. Compose Multiplatform** | Funciona, pero no se ve como una app de Mac [I] | Nativa | Una base Kotlin; aspecto no nativo en Mac |

Mi recomendación provisional [P]: **opción 2 con arquitectura API primero**. Da casi todo lo «nativo» que pides en el Mac (ventana propia, barra de menús, ⌘K global, notificaciones) sin duplicar la interfaz. Si más adelante el techo visual no basta, la API permite añadir un cliente SwiftUI para el Mac sin tocar el servidor.

### B. Dónde vive el servidor — **[decisión abierta]**
Cloudflare gratis para empezar, o **NAS** si quieres finanzas y correo indexados en casa. Con un sector de finanzas, el NAS gana peso [I].

### C. Fuentes de datos financieros — depende de tus entidades
Hace falta saber tus bancos, gestoras o brókers y fondos (ISIN) para elegir el conector de cada uno.

### D. IA y memoria — fase 3, con pruebas comparativas antes de elegir.
