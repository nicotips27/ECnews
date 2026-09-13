# ECNEWS — Directorio Global de Prensa

Portal de acceso centralizado a fuentes de información y agencias de noticias internacionales, con análisis de **sesgo político**, **factualidad** y **transparencia de propiedad** de cada medio (estilo Ground News).

Publicado en GitHub Pages: `https://nicotips27.github.io/ECnews/`

## Características

- **Directorio de medios** con 50 fuentes internacionales (Español, Inglés, China, Irán y Rusia). Cada tarjeta muestra sesgo político, nivel de factualidad, propietario y país.
- **Dashboard de sesgo** con barras de distribución (Izquierda / Centro / Derecha) y filtro rápido por botones.
- **Blindspot (puntos ciegos)**: detecta qué perspectiva política está subrepresentada en el directorio.
- **Filtro por sesgo combinado**: filtra a la vez el directorio y todos los grids de noticias RSS. El filtro se guarda y sobrevive a recargas de página.
- **Feed visual en vivo** con grids multi-fuente equilibrados por sesgo: Español, English, Tecnología ES/EN, Ciencia y Economía.
- **Ticker** de última hora y **hero** con la noticia destacada del momento.
- **A Través del Espectro**: la misma cobertura vista desde Izquierda, Centro y Derecha.
- **Transparencia**: panel de propiedad de los medios agrupados por propietario.
- **Panel de ajustes** (offcanvas): modo oscuro y filtro de sesgo persistente.
- **Menú desplegable de apps** de Estalingrado Corp (Buscador, Download, Market, SendPro, Monitor Big Data).
- Diseño responsive y modo oscuro con Tailwind CSS + Phosphor Icons.

## Secciones del portal

| Sección | Contenido |
| --- | --- |
| Ticker | Última hora de Clarín (RSS) |
| Dashboard de sesgo | Barras de distribución + filtro rápido |
| Blindspot | Puntos ciegos sobre el directorio |
| Medios en Español / Inglés | Tarjetas del directorio con badges de sesgo y factualidad |
| Feed Visual | Hero destacado + 6 grids de noticias RSS con contadores |
| A Través del Espectro | Cobertura comparada por sesgo |
| Transparencia | Propietarios de los medios |
| Ajustes | Modo oscuro + filtro por sesgo |

## Filtro por sesgo

El filtro (Izquierda / Centro / Derecha / Todos) actúa sobre dos tipos de tarjetas, ambas etiquetadas con `data-bias`:

- `.directory-card`: tarjetas estáticas del directorio.
- `.feed-card`: tarjetas generadas por los feeds RSS.

Al activar el filtro:

1. Las tarjetas que no coinciden se ocultan con la clase `.card-hidden`.
2. Los contadores de cada grid muestran `X/total artículos` en vez del total.
3. Las barras de distribución y el **Blindspot se recalculan** sobre las fuentes que quedan visibles, para que las estadísticas reflejen lo que estás viendo.
4. El filtro se persiste en `sessionStorage` (clave `ecnews-bias-filter`) y se restaura al recargar.

El hero, el ticker y "A Través del Espectro" no se filtran, porque representan el conjunto completo de fuentes.

## Estructura

```
ECnews/
├── index.html            # HTML (estructura + metadatos SEO)
├── styles.css            # CSS compilado de Tailwind (commiteado para GitHub Pages)
├── css/custom.css        # CSS manual (ticker, badges, barras, animaciones)
├── js/
│   ├── data.js           # Fuente única de datos: 50 medios + config RSS
│   ├── main.js           # Directorio, tema, settings, filtros, blindspot
│   └── feeds.js          # Ticker, hero, grids RSS, espectro, transparencia
├── assets/favicon.png    # Favicon local
├── src/tailwind.css      # Punto de entrada del build de Tailwind
├── tailwind.config.js    # darkMode: 'class'
└── package.json          # Scripts de build
```

## Datos (js/data.js)

Toda la información de los medios vive en `mediaSources`. Un solo cambio actualiza las tarjetas, el dashboard, el blindspot y la transparencia.

| Campo | Descripción |
| --- | --- |
| `name` | Nombre del medio |
| `url` | Sitio web |
| `country` | País / región |
| `lang` | `es` o `en` (idioma del directorio) |
| `accent` | Color de acento Tailwind (`blue`, `indigo`, etc.) |
| `bias` | Sesgo: `left`, `center-left`, `center`, `center-right`, `right` |
| `factuality` | Factualidad: `high`, `medium`, `low` |
| `owner` | Propietario |
| `ownerType` | Tipo: Corporación, Estatal, Servicio Público, etc. |
| `tech` | `true` para medios de tecnología |

`biasGroup()` agrupa el sesgo en 3 bandas para las barras: `center-left` → `left`, `center-right` → `right`, resto → `center`.

## Feeds RSS (js/data.js → RSS_CONFIG)

Los feeds se cargan vía `api.rss2json.com` con caché de 10 minutos en `sessionStorage` y manejo de errores amigable. Cada URL lleva su sesgo (`bias`) para poder filtrar.

| Grid | Fuentes (sesgo) |
| --- | --- |
| Español | El País (izq) · 20Minutos (centro) · El Mundo / Clarín / ABC (der) |
| English | The Guardian (izq) · BBC / Sky News (centro) · Fox News (der) |
| Tecnología ES | 20Minutos Tecnología (centro) · Xataka (centro) |
| Technology EN | TechCrunch (centro) · Wired (centro) |
| Ciencia y Cultura | ScienceDaily (centro) · New Scientist (centro) |
| Economía y Finanzas | Bloomberg (centro) · NYT Economy (centroizq) · Forbes (der) |

Espectro: Izquierda → The Guardian · Centro → BBC, Xataka · Derecha → El Mundo, ABC.

## Guardar y desarrollar

> **Importante:** `styles.css` se commitea al repositorio. GitHub Pages es estático y no ejecuta builds, así que el CSS compilado debe estar versionado.

```bash
npm install          # instala Tailwind

npm run build:css    # regenera styles.css (minificado) tras editar HTML/JS
npm run watch:css    # modo watch durante el desarrollo
```

## Verificación

```bash
node --check js/data.js js/main.js js/feeds.js   # sintaxis JS
npm run build:css                                # compila CSS sin errores
```

## Documentación

- [ARCHITECTURE.md](ARCHITECTURE.md) — componentes, flujo de datos y pipeline del filtro.
- [CONTRIBUTING.md](CONTRIBUTING.md) — guía para contribuir, feeds y despliegue.
- [CHANGELOG.md](CHANGELOG.md) — registro de cambios por versión.

## Despliegue

1. `npm run build:css` para regenerar `styles.css`.
2. Commit con todos los archivos (incluido `styles.css`).
3. `git push origin main` — GitHub Pages publica automáticamente.