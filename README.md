# ECNEWS — Directorio Global de Prensa

Portal de acceso centralizado a fuentes de información y agencias de noticias internacionales, con análisis de **sesgo político**, **factualidad** y **transparencia de propiedad** de cada medio (estilo Ground News).

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

## Guardar y desarrollar

> **Importante:** `styles.css` se commitea al repositorio. GitHub Pages es estático y no ejecuta builds, así que el CSS compilado debe estar versionado.

```bash
npm install          # instala Tailwind

npm run build:css    # regenera styles.css (minificado) tras editar HTML/JS
npm run watch:css    # modo watch durante el desarrollo
```

## Datos

Toda la información de los medios (nombre, país, URL, sesgo, factualidad, propietario) vive en **`js/data.js`** → `mediaSources`. Las tarjetas, el dashboard, el blindspot y la transparencia se generan dinámicamente desde ahí: un solo cambio actualiza todo el sitio.

## Feeds RSS

Los feeds se cargan mediante `api.rss2json.com` con caché de 10 minutos en `sessionStorage` y manejo de errores amigable. Configuración en `js/data.js` → `RSS_CONFIG`.

## Verificación

```bash
node --check js/data.js js/main.js js/feeds.js   # sintaxis JS
npm run build:css                                # compila CSS sin errores
```