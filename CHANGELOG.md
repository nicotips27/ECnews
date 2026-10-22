# Registro de cambios

## 1.3.0 (2026-10-22)

**Feeds: el portal vuelve a tener noticias**

- `api.rss2json.com` devolvía 403 y todos los grids mostraban "Error al conectar con las fuentes". Ahora la capa de feeds (`js/rss.js`) resuelve con una cadena: **caché → fetch directo → proxy CORS → rss2json**.
- Se parsea el XML en el navegador con `DOMParser` y se normaliza al formato de rss2json, sin depender de ningún intermediario.
- Cada grid incluye al menos una fuente con CORS abierto, para que nunca se quede vacío. Verificado: Español 152 · English 25 · Tecnología ES 30 · Technology EN 60 · Ciencia 28 · Economía 50.
- Se reparan dos feeds muertos: Xataka (`feed.xml` → `index.xml`) y Forbes (→ CNBC). Se añaden NYT Science, CNBC, MarketWatch y CNBC Español.
- El **ticker "Último Minuto"** ahora muestra noticias ordenadas por fecha (lo más reciente primero) y su etiqueta es **enlace a `envivo.html`**.
- El hero combina NYT World + BBC World y prioriza el artículo con imagen.

## 1.2.0 (2026-10-22)

**Franja En Vivo en el portal principal**

- El inicio (`index.html`) abre con una franja "En Vivo Ahora" con tres transmisiones destacadas: **DW Español**, **La Nación · LN+** y **Al Jazeera English**.
- Las tres **arrancan automáticamente y mudas** (el navegador lo permite al estar silenciado), dando movimiento al inicio sinMolestar al visitante.
- Botones discretos en cada miniatura: **activar sonido** y **pausar/reanudar**. Un clic en la miniatura también pausa.
- Se pausan solas cuando la franja sale de pantalla y se reanudan al volver (ahorra ancho de banda).
- Botón **"Ir"** que lleva a `envivo.html` con el resto de canales.

**Reproducción sobre HLS directo**

- Los embeds de YouTube (`live_stream?channel=`) daban error 153 / "video no disponible" y los IDs de video en vivo caducan con cada emisión.
- Ahora cada canal usa su stream HLS (`.m3u8`) con CORS abierto, reproducido con **hls.js** (nativo en Safari).
- Los reproductores arrancan en la calidad más baja y se ajustan al tamaño de la miniatura, para que la imagen aparezca rápido.
- Si un stream falla, la página **se autorepara**: consulta el índice de iptv-org y reintenta con la URL vigente del canal.
- El reproductor se monta al hacer clic en `envivo.html`, así no se abren 15 conexiones simultáneas.

## 1.1.0 (2026-10-21)

**En Vivo: subpágina de transmisiones**

- Nueva subpágina `envivo.html` con señales 24 horas en **español** e **inglés**, embebidas desde YouTube Live.
- Secciones "En Español" (RTVE Noticias 24H, CNN en Español, DW Español, Agencia EFE, FRANCE 24 Español, teleSUR) y "In English" (BBC News, Sky News, Al Jazeera English, France 24 English, DW News, Bloomberg Television, CNN, teleSUR English).
- Cada tarjeta muestra reproductor 16:9, badge de **En Vivo**, sesgo político del medio y botón "Abrir en YouTube" como respaldo.
- Ticker superior con los canales en vivo y navegación al canal.
- Tema oscuro compartido con el portal (misma clave `color-theme`).
- Enlace "En Vivo" añadido al header, menú móvil y footer del portal.

## 1.0.0 (2026-09-13)

**Filtro por sesgo en noticias**

- Ahora puedes filtrar por sesgo político (Izquierda / Centro / Derecha) tanto el directorio de medios como cada grid de noticias RSS. Las tarjetas de los feeds se etiquetan automáticamente con el sesgo de su fuente.
- El filtro se guarda y reaparece al recargar la página, así retomas donde lo dejaste.
- Los contadores de cada grid muestran `X/total artículos` cuando hay un filtro activo, para que sepas cuánto estás viendo.
- El Blindspot y las barras de distribución se recalculan sobre las fuentes visibles: las estadísticas siempre coinciden con lo que estás mirando.
- Los botones del filtro se atenúan en lugar de ocultarse, para que puedas cambiar de lado con un clic.

**Feeds más equilibrados**

- El grid en Español ahora mezcla el espectro: El País (izquierda), 20Minutos (centro) y El Mundo, Clarín y ABC (derecha).
- El grid en English añade Sky News y Fox News junto a The Guardian y BBC.
- Ciencia y Economía incorporan más fuentes (New Scientist, NYT Economy, Forbes).

**Menú de apps**

- EC Send pasa a ser **EC SendPro** (`estalingradocorp.github.io/ECsendpro`).
- EC Channel pasa a ser **EC Market** (`estalingradocorp.github.io/EstalingradoCorp/market.html`).

**Publicación**

- Se commitean por primera vez todos los ficheros del proyecto (`js/`, `css/`, `styles.css` compilado, `src/`, `package.json`) para que GitHub Pages sirva el sitio completo.

## Antes de 1.0.0 (2026-06)

- Sistema de badges de sesgo político y factualidad en el directorio.
- Feed visual con animaciones (hero destacado, grids multi-fuente, espectro).
- Panel de ajustes con opciones, banners publicitarios y favicon.
- Soporte de tema oscuro persistente.