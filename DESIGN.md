# EVOLTIX by TECIMEL · Sistema de diseño (dirección B «Cercano y claro»)

Web de una instaladora eléctrica de la Región de Murcia que vende, instala y mantiene cargadores de coche eléctrico. Tiene que ser cercana para quien no sabe de cargadores, con poco texto, producto a la vista y precio claro. Marino y verde salen del logo. Todos los valores viven en `css/styles.css` (`:root`); las páginas usan siempre los nombres, nunca colores ni tamaños sueltos.

## Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` | #FFFFFF | #0A1630 | Fondo de página |
| `--surface` / `--surface-2` | #F3F6F9 / #E9EEF4 | #0F1F3E / #14264A | Secciones tintadas, tarjetas de uso |
| `--card` | #FFFFFF | #0F1F3E | Tarjetas, formulario, desplegables |
| `--mint` / `--mint-2` | #E4F5F1 / #CBEDE5 | #0E2F37 / #1A4A52 | Tarjeta del héroe, círculos de icono, cifras de ayudas |
| `--ink` | #0C1F45 | #E8EEF8 | Texto |
| `--muted` / `--soft` | #4D5A72 / #5A6780 | #B5C0D5 / #9BA8C0 | Texto secundario / etiquetas |
| `--line` / `--line-strong` | #E2E8EF / #C7D1DD | #22345A / #34497A | Bordes |
| `--head` | #0B2152 | #E3ECFF | Titulares |
| `--accent` | #0F2F6A (marino del logo) | #2FD3BB | Botón principal (texto `--on-accent`) |
| `--teal` | #07AF98 (verde del logo) | #2FD3BB | Señal: líneas de esquema, cargador «tuyo», LED |
| `--link` | #00705F | #5FE0CB | Enlaces, etiquetas, iconos |
| `--band` | #0F2F6A | #102A5C | Tarjeta marino de cierre, cifras, pie |
| `--band-cta` | #07AF98 | #2FD3BB | Botón principal dentro de marino (texto `--band-cta-fg`) |
| `--ok` / `--err` | #00705F / #B42318 | #5FE0CB / #FF8A80 | Formulario |

Contraste: todo el texto pasa WCAG AA en claro y oscuro (se comprueba con Playwright en 360, 390, 768, 1024 y 1440 px).
Fotos de producto y logos de marca: siempre sobre placa clara (`--plate` #FFFFFF; barra de marcas #F3F6F9), también en oscuro.

## Tipografía

- **Bricolage Grotesque** (700 titulares y cifras, 600 subtítulos) y **Figtree** (400 texto, 600 botones y etiquetas). Licencia OFL, archivos propios en `fonts/` (WOFF, solo latín), sin servicios externos.
- Escala de 6 tamaños: `--t1` clamp(2.5–4.5rem) h1 · `--t2` clamp(1.75–3rem) h2 y cifras · `--t3` 1.375rem h3 · `--t4` 1.0625rem texto · `--t5` .9375rem secundario · `--t6` .8125rem etiquetas.
- Titulares con `text-wrap: balance` y tracking negativo (−0,035em en h1).

## Texto

- Por sección: un titular de 8 palabras como máximo, una frase de apoyo de 20 como máximo y 60 palabras visibles en total (fuera de las páginas legales). El detalle va a las preguntas frecuentes.

## Espacio y forma

- Contenedor `--wrap` 1240px, margen `--gut` 24px (16px en móvil), cabecera `--head-h` 76px.
- Secciones: `clamp(64px, 8vw, 112px)`; separaciones en múltiplos de 4.
- Radios: botones y chips en píldora (`--pill`), campos 12px, tarjetas 20–24px, héroe y tarjeta marino 32px. Una sombra, `--shadow`, solo para lo flotante.

## Componentes

- **Héroe:** tarjeta menta con titular, frase, «Ver cargadores» + «Pedir presupuesto», tres garantías en chips y tres cargadores recortados en discos blancos con el precio «desde».
- **Páginas interiores:** la misma tarjeta menta (`.phc`), con un disco de producto, una lista con iconos o cifras a la derecha. Legales: versión `.phc.slim`.
- **Barra de marcas:** 6 marcas. Simon y Schneider Electric salen cuando su marca tiene modelos en `js/catalogo-data.js` y `EVX_CONFIG.logos` las marca como subidas.
- **Catálogo genérico:** cada modelo solo distingue red, potencia y tomas, con precio «desde»; cable o base, largo y color se concretan en el presupuesto.
- **Tarjetas de uso** (`.use`), **tarjetas con icono** (`.tiles`), **pasos** (`.steps`), **cifras** (`.nums`, `.fig`), **lista de comprobación** (`.chk`), **esquema de línea** del garaje comunitario (`.s-*`).
- **Catálogo:** filtros Uso, Marca, Red y Prestaciones con contadores; tarjeta con precio con IVA grande y sin IVA al lado («instalación aparte»); ficha con versiones; comparador.
- **Formulario:** teléfono o correo (basta uno), casilla de privacidad sin marcar y primera capa de protección de datos.

## Movimiento

- Curvas `--ease-out` cubic-bezier(.23,1,.32,1) y `--ease-io` cubic-bezier(.77,0,.175,1). Solo `transform` y `opacity`, menos de 300 ms.
- Entrada del héroe una vez; tarjetas que suben 2px y fotos que crecen un 3 % con ratón; botones que se encogen al pulsar; barra de marcas en bucle lineal. Todo se detiene con `prefers-reduced-motion`.

## Imágenes e iconos

- Fotos de fabricante de los equipos, en JPG de 500 × 500 px: producto recortado, centrado y ocupando el 82 % del lado mayor, sobre blanco puro (#FFFFFF), para que todas las tarjetas tengan el mismo tamaño óptico. Nada de fotos de banco presentadas como instalaciones propias.
- Logos de marca en color, con altura óptica igualada por marca (clases en `.mq-track img`).
- Iconos de trazo de 24px y 1,8 de grosor, en un único juego (`<symbol id="i-…">` en cada página), dentro de círculos menta.
