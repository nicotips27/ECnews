# Contribuir a ECNEWS

Gracias por aportar al directorio global de prensa. Este documento explica cómo poner el proyecto en marcha, hacer cambios comunes y publicarlos.

## Puesta en marcha

Requisitos: Node.js (para Tailwind) y acceso a `api.rss2json.com` (los feeds funcionan por defecto).

```bash
npm install          # instala Tailwind CSS
npm run build:css    # compila src/tailwind.css → styles.css (minificado)
npm run watch:css    # recompila automáticamente mientras editas
```

Para probar en local abre `index.html` directamente o lanza un servidor estático:

```bash
npx serve .          # en el directorio del proyecto
```

No olvides recompilar el CSS después de tocar HTML/JS, porque las clases de Tailwind usadas en los templates JS se detectan en el build.

## Trabajar en una tarea

1. Compila el CSS: `npm run build:css`.
2. Haz los cambios en `index.html`, `js/` o `css/`.
3. Verifica antes de subir:
   ```bash
   node --check js/data.js js/main.js js/feeds.js   # sintaxis JS
   npm run build:css                                # CSS sin errores
   ```

## Añadir un medio al directorio

Edita `js/data.js` → `mediaSources`. Cada entrada:

```js
{ name: 'El País', url: 'https://elpais.com/', country: 'España', lang: 'es',
  accent: 'blue', bias: 'center-left', factuality: 'high',
  owner: 'Grupo Prisa', ownerType: 'Corporación' }
```

- `lang: 'es'` lo coloca en Medios en Español; `lang: 'en'` en Medios en Inglés.
- `tech: true` activa el acento de la sección de tecnología.
- El `bias` y la `factuality` son valores del catálogo (ver README).

Las tarjetas, el dashboard, el blindspot y la transparencia se generan solos.

## Añadir o cambiar un feed RSS

Edita `js/data.js` → `RSS_CONFIG`. Estructura de un grid:

```js
{ container: 'grid-noticias-es', accent: 'blue', items: 8, max: 20, label: 'artículos', urls: [
    { url: 'https://feeds.elpais.com/...', bias: 'left' },
  ]},
```

- `items`: cuántos artículos se toman por fuente.
- `max`: tope total de tarjetas del grid.
- `bias`: obligatorio en cada URL, alimenta el filtro por sesgo y el contador visible.

Guarda siempre los tres valores de sesgo representados (`left`, `center`, `right`) en las secciones políticas. Purezas técnicas van con `center`.

## Añadir un canal en vivo

Edita `js/data.js` → `LIVE_CONFIG` (dentro de `es` o `en`). Cada entrada:

```js
{ name: 'RTVE 24 Horas',
  hls: 'https://ztnr.rtve.es/ztnr/1694255.m3u8',
  channel: '24Horas.es',
  youtube: 'UC7QZIf0dta-XPXsp9Hv4dTw',
  accent: 'blue', bias: 'center', country: 'España' },
```

- `hls`: URL `.m3u8` del stream. Debe servir con `Access-Control-Allow-Origin`
  (compruébalo con `curl -I -H "Origin: https://nicotips27.github.io" <url>`).
  Sin HLS, pon `null` y se usará el embed de YouTube.
- `channel`: ID del canal en iptv-org (el que aparece en
  `https://iptv-org.github.io/api/channels.json`). Es lo que permite que la
  página se autorepare si la URL del stream deja de servir.
- `youtube`: ID de canal (`UC…`) o de video (11 caracteres). Sirve de respaldo y
  alimenta el enlace "Ver en YouTube".
- `accent`: `blue` para español, `indigo` para inglés.
- `bias`: `left`, `center` o `right`; alimenta el badge de la tarjeta.

Para encontrar el stream de un canal:

```bash
# lista los streams disponibles de un canal de iptv-org
curl -s https://iptv-org.github.io/api/streams.json \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
      JSON.parse(d).filter(s=>s.channel==='24Horas.es').forEach(s=>console.log(s.title,s.url))})"
```

No olvides recompilar el CSS (`npm run build:css`) tras tocar HTML/JS.

## Cambiar el filtro por sesgo

La lógica vive en `js/main.js`: `applyBiasFilter`, `refreshGridCounts` y `updateDistribution`. Reglas a respetar:

- El selector de ocultado debe ser `.feed-card[data-bias], .directory-card[data-bias]` (no `[data-bias]` a secas, o se ocultarían los botones).
- El estado se persiste en `sessionStorage` con la clave `ecnews-bias-filter`.
- El Blindspot se calcula sobre las tarjetas visibles para reflejar el filtro.

## Desplegar en GitHub Pages

El sitio se publica desde `main` sin build en producción, así que `styles.css` compilado debe ir commiteado.

```bash
npm run build:css
git add .
git commit -m "Descripción del cambio"
git push origin main
```

GitHub Pages actualiza el sitio automáticamente (unos minutos).

## Convenciones

- Estilo visual: Tailwind CSS con `darkMode: 'class'` (clase `dark` en `<html>`).
- Iconos: Phosphor Icons (`<i class="ph ph-..."></i>`).
- CSS extra tira a `css/custom.css`; el resto a clases Tailwind.
- Todo el contenido en español salvo los feeds y textos en inglés donde corresponde.
- Sin comentarios en el código a menos que añadan contexto real.