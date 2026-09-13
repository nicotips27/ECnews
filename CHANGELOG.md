# Registro de cambios

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