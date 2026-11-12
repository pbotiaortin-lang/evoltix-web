# EVOLTIX by TECIMEL · Sistema de diseño

Web de una instaladora eléctrica de la Región de Murcia que vende, instala y mantiene cargadores de coche eléctrico. Tiene que transmitir oficio, claridad y precio a la vista. Marino y verde salen del logo. Los valores viven en `css/styles.css` (`:root`); las páginas usan siempre los nombres, nunca colores sueltos.

## Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` | #F5F7FA | #0A1426 | Fondo de página |
| `--surface` / `--surface-2` | #EDF1F6 / #E4EAF2 | #0F1C33 / #13223D | Secciones tintadas, chips, cajas de nota |
| `--card` | #FFFFFF | #0F1C33 | Tarjetas, formulario, desplegables |
| `--ink` | #0B1B36 | #E6ECF6 | Texto |
| `--muted` / `--soft` | #3F4B63 / #56627A | #B4BFD3 / #9AA6BD | Texto secundario / etiquetas y contadores |
| `--line` / `--line-strong` | #DDE4EE / #C3CEDD | #22324F / #33476C | Bordes y separadores |
| `--head` | #0B2A5B | #DCE8FF | Titulares |
| `--accent` | #0B2A5B | #3BD39A | Botón principal (texto `--on-accent`) |
| `--link` | #0A6E4A | #6FE0B4 | Enlaces, etiquetas de sección, estado activo |
| `--green` / `--green-soft` | #13B37A / #E3F6EE | #3BD39A / #0F2E2A | Selección (tarjetas de caso, casillas) |
| `--band` | #0B2A5B | #0F2147 | Bandas oscuras (proceso, mantenimiento, cierre, pie) |
| `--band-cta` | #13B37A | #3BD39A | Botón principal dentro de una banda (texto `--band-cta-fg`) |
| `--ok` / `--err` | #0A7A52 / #B42318 | #5BDCC6 / #FF8A80 | Éxito y error del formulario |

Contraste: todo el texto visible pasa WCAG AA (4,5:1; 3:1 en texto grande) en claro y en oscuro; se comprueba con `qa.py`.
Fotos de producto: siempre sobre placa blanca (`#fff`), también en modo oscuro.

## Tipografía

- **Inter Display** 500/600 para titulares; **Inter** 400/500/600 para texto. Archivos propios (`fonts/`), sin servicios externos.
- Escala: h1 portada `clamp(2.6rem, 5.6vw, 5.25rem)` · h1 interior `clamp(2.2rem, 4.2vw, 3.5rem)` · h2 `clamp(1.75rem, 3.2vw, 2.75rem)` · h3 1.125–1.5rem · cuerpo 17px/1.6 · secundario 15px · etiquetas 12–13px en mayúsculas con 0.08em.
- Titulares con `text-wrap: balance` y tracking negativo; texto corrido a 60–75 caracteres.

## Espacio y forma

- Contenedor `--wrap` 1240px, margen lateral `--gut` 24px (16px en móvil), cabecera `--head-h` 76px.
- Secciones: `clamp(64px, 8vw, 112px)` arriba y abajo; separaciones internas en múltiplos de 4 (8, 12, 16, 24, 32, 40).
- Radios: `--r-s` 10px (campos), 12px (botones), `--r` 14px (tarjetas), `--r-l` 20px (bloques grandes). Una sola sombra, `--shadow`, para elementos flotantes.

## Componentes

- **Botones:** principal (`--accent`), secundario (borde `--line-strong`), en banda (`--band-cta`). Altura 50px (44px en la versión pequeña). Pulsar: `scale(.97)`. Hover solo con ratón.
- **Tarjetas de caso** (portada): dos opciones, casa y garaje comunitario o empresa. Al elegir, aparece el catálogo filtrado; no recomiendan un modelo.
- **Tarjeta de cargador:** foto en placa blanca, marca, modelo, kW, chips (tomas · red · salida), prestaciones, precio con IVA grande y sin IVA al lado, «Precio con instalación», ficha y comparar.
- **Filtros:** Uso (todos, 1 toma, 2 tomas, torres de exterior, pedestales y accesorios), marca, red y prestaciones, con contadores. En móvil, panel a pantalla completa con botón de resultados fijo.
- **Navegación:** desplegables «Casa y comunidad», «Cargadores», «Precios y ayudas» con título y explicación por enlace; menú móvil agrupado; barra fija de llamar y presupuesto en móvil.
- **Formulario:** teléfono o correo (basta uno), casilla de privacidad obligatoria y sin marcar, primera capa de protección de datos debajo.

## Movimiento

- Curvas `--ease-out` cubic-bezier(.23,1,.32,1) y `--ease-io` cubic-bezier(.77,0,.175,1). Solo `transform` y `opacity`, menos de 300 ms en la interfaz.
- Barra de marcas en bucle lineal; proceso que avanza solo mientras se ve. Todo se detiene con `prefers-reduced-motion`.

## Imágenes e iconos

- Fotos de fabricante de los equipos. Nada de fotos de banco presentadas como instalaciones propias.
- Iconos de trazo (1.75–2px, `currentColor`), un solo estilo en toda la web.
