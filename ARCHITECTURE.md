# Arquitectura

Visión técnica de ECNEWS: componentes, flujo de datos y el pipeline del filtro por sesgo.

## Visión general

ECNEWS es un sitio estático servido por GitHub Pages. No hay servidor ni build en producción: todo el contenido se genera en el navegador desde ficheros JS que se cargan en orden en cada página.

`index.html` (portal principal):
```html
<script src="js/data.js"></script>
<script src="js/main.js"></script>
<script src="js/feeds.js"></script>
```

`envivo.html` (subpágina de transmisiones en vivo):
```html
<script src="js/data.js"></script>
<script src="js/envivo.js"></script>
```

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  index.html │ ──▶ │  js/data.js │ ──▶ │  js/main.js │ ──▶ DOM: directorio,
│  (estructura)│     │  datos +    │     │  (lógica    │       dashboard,
│              │     │  config RSS │     │   principal)│       blindspot
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │ initFeeds()
                                               ▼
                                        ┌─────────────┐
                                        │ js/feeds.js │ ──▶ DOM: ticker, hero,
                                        │  (RSS)      │       grids, espectro
                                        └─────────────┘
```

## Componentes

| Fichero | Responsabilidad | Salidas al DOM |
| --- | --- | --- |
| `js/data.js` | Fuente única de datos. `mediaSources` (directorio) + `RSS_CONFIG` (feeds) + `LIVE_CONFIG` (transmisiones en vivo) + utilidades de sesgo (`biasGroup`, `biasLabelMap`, `factLabelMap`) + mapas de clases Tailwind (`ACCENT_CLASSES`, `SEGMENT_CLASSES`, `CARD_META`) | — |
| `js/main.js` | Construye del directorio (`buildMediaGrids` → `buildMediaCard`), dashboard y blindspot (`updateDistribution`, `updateBlindspot`), tema oscuro, panel de ajustes, menú móvil, y el pipeline del filtro (`applyBiasFilter`, `refreshGridCounts`) | Tarjetas `.directory-card`, barras, contadores, blindspot |
| `js/feeds.js` | Rutinas RSS con caché (`fetchRSS`), ticker (`loadTicker`), hero (`loadFeatured`), grids (`loadGrid` → `renderCard`), espectro (`loadEspectro`, `renderColumn`) y transparencia (`renderOwnership`). Orquestado por `initFeeds()` | Ticker, hero, `.feed-card`, columnas de espectro, propiedad |
| `envivo.html` | Subpágina de transmisiones en vivo. Header compacto, ticker de canales y dos grids (`#grid-envivo-es`, `#grid-envivo-en`) | Tarjetas `.live-card` con iframe de YouTube Live |
| `js/envivo.js` | Render de `LIVE_CONFIG` (`renderLiveCard`, `loadLiveGrid`), ticker (`renderLiveTicker`), tema oscuro y menú móvil propios | `.live-card`, ticker `#live-ticker` |

El estado global `currentBiasFilter` se comparte entre ambos ficheros (ambos se declaran en el ámbito global del script).

## Flujo de datos RSS

1. `initFeeds()` dispara en paralelo ticker, hero, cada grid de `RSS_CONFIG.grids`, espectro y transparencia.
2. `fetchRSS(url)` consulta `api.rss2json.com/v1/api.json?rss_url=...`. La respuesta se cachea 10 minutos en `sessionStorage` bajo la clave `ecnews-rss:<url>` para proteger límites de la API y acelerar recargas.
3. `loadGrid(cfg)` hace `Promise.all` sobre `cfg.urls`, y por cada URL guarda los ítems junto con `source` (título del feed) y `bias` (declarado en `RSS_CONFIG`).
4. Los ítems se mezclan aleatoriamente, se toman los primeros `cfg.max` y se pintan con `renderCard(item, source, accent, idx, bias)`, que emite `data-bias` y la clase `feed-card`.
5. Al terminar, `loadGrid` re-aplica el filtro activo con `applyBiasFilter(currentBiasFilter)` para que las tarjetas nuevas respeten el estado.

## Pipeline del filtro por sesgo

El filtro es un pequeño estado global en `js/main.js`:

```
bias = 'all' | 'left' | 'center' | 'right'

updateDistribution(bias)
  ├── cuenta solo las .directory-card visibles (las que coinciden con el filtro)
  ├── actualiza barras (dist-left/right/center) y blindspot con ese subconjunto
  └── llama applyBiasFilter(bias) + updateActiveFilterBtn(bias)

applyBiasFilter(bias)
  ├── persiste en sessionStorage ('ecnews-bias-filter')
  ├── hace toggle de .card-hidden sobre .feed-card[data-bias] y
  │   .directory-card[data-bias] según coincidan
  └── refreshGridCounts(): por cada grid, muestra "X/total artículos"
      cuando hay filtro, o el total cuando "Todas"
```

Hallazgos clave:

- El selector del filtro se limita a `.feed-card, .directory-card` para no ocultar los botones de filtro, que también llevan `data-bias`.
- El Blindspot y las barras se recalculan sobre el subconjunto visible, así las estadísticas coinciden con lo que el usuario está viendo.
- El estado se restaura al cargar (`DOMContentLoaded`) leyendo `sessionStorage`; los valores inválidos caen a `all`.
- Hero, ticker y espectro no se filtran porque representan el conjunto completo.

## Página En Vivo (`envivo.html`)

1. `DOMContentLoaded` en `js/envivo.js` inicializa tema, menú móvil y ticker.
2. `loadLiveGrid` pinta las tarjetas de `LIVE_CONFIG.es` y `LIVE_CONFIG.en`. Cada
   tarjeta arranca con un póster: el reproductor se monta al hacer clic
   (click-to-play), para no abrir 15 conexiones simultáneas.
3. Si el canal tiene `hls`, se carga `hls.js` bajo demanda y se reproduce el
   `.m3u8`. Safari usa HLS nativo (`canPlayType`).
4. Si el stream falla, `repairStreamUrl` consulta el índice de iptv-org
   (`api/streams.json`, cacheado 6 h en `sessionStorage`, guardando solo las URLs
   de nuestros canales) y reintenta con la URL vigente.
5. Si no hay HLS o la reparación falla, se monta el embed de YouTube. El enlace
   "Ver en YouTube" está siempre visible.

El tema usa la misma clave `color-theme` de `index.html`, así que la preferencia
se comparte entre páginas.

## Caché y almacenamiento

| Capa | Clave | Caducidad | Propósito |
| --- | --- | --- | --- |
| Feeds RSS | `ecnews-rss:<url>` | 10 min | Evitar límites de api.rss2json.com y acelerar recargas |
| Índice iptv-org | `ecnews-iptv-streams` | 6 h | URLs de stream vigentes para autoreparar los canales en vivo |
| Filtro | `ecnews-bias-filter` | sesión | Persistir el filtro activo entre recargas |
| Tema | `color-theme` | indefinida | Persistir modo claro/oscuro |

## Tema oscuro

`tailwind.config.js` usa `darkMode: 'class'`. El toggle en `js/main.js` agrega la clase `dark` a `<html>` y guarda la preferencia en `localStorage`.

## Despliegue estático

GitHub Pages sirve el repo tal cual. Por eso `styles.css` (compilado con Tailwind) se commitea: el sitio no ejecuta builds. El CSS manual vive en `css/custom.css` (ticker, badges, barras, `.card-hidden`, `.live-dot`). `tailwind.config.js` escanea `index.html`, `envivo.html` y `js/**/*.js`, así que las clases nuevas de la página en vivo se compilan al reconstruir el CSS.

## Definiciones de datos

- Sesgo bruto (5 valores): `left`, `center-left`, `center`, `center-right`, `right`.
- Bandas del dashboard (3): `biasGroup()` mapea `center-left → left`, `center-right → right`, resto → `center`.
- Factualidad (3): `high`, `medium`, `low`.

Ver `README.md` para el catálogo de feeds y campos de `mediaSources`.