/* ============================================================
   ECNEWS · FEEDS
   Ticker, hero destacado, grids multi-fuente, espectro y
   transparencia. Carga en paralelo con caché en sessionStorage
   y manejo de errores amigable.
   ============================================================ */

// ============================================================
// UTILIDADES
// ============================================================
const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const stripTags = (html, max) => html ? html.replace(/<[^>]+>/g, '').slice(0, max) : '';

// Extraer imagen de un ítem RSS (múltiples estrategias)
const extractImage = (item) => {
    // 1. thumbnail directo
    if (item.thumbnail) return item.thumbnail;
    // 2. enclosure link
    if (item.enclosure && item.enclosure.link) return item.enclosure.link;
    // 3. media:content (rss2json a veces lo pasa como 'media:content')
    if (item['media:content'] && item['media:content'].url) return item['media:content'].url;
    if (item['media:thumbnail'] && item['media:thumbnail'].url) return item['media:thumbnail'].url;
    // 4. Primer <img> del description
    if (item.description) {
        const match = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match && match[1]) return match[1];
    }
    // 5. Primer <img> del content seguro
    if (item.content) {
        const match = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match && match[1]) return match[1];
    }
    // 6. Sin imagen
    return null;
};

// Placeholder SVG con la inicial del medio. Se codifica completo
// con encodeURIComponent para ser seguro dentro de atributos HTML.
const placeholderSVG = (source, accent) => {
    const color = accent === 'violet' ? '#8b5cf6' : accent === 'indigo' ? '#6366f1' : accent === 'cyan' ? '#06b6d4' : '#3b82f6';
    const bg = accent === 'violet' ? '#1e1b4b' : accent === 'indigo' ? '#1e1b4b' : accent === 'cyan' ? '#164e63' : '#1e3a5f';
    const initial = source ? source.charAt(0).toUpperCase() : 'N';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="${bg}" width="400" height="300"/><circle cx="200" cy="130" r="60" fill="${color}" opacity="0.3"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="72" font-weight="700" font-family="Inter,sans-serif" opacity="0.6">${initial}</text></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
};

// FETCH RSS con caché corta en sessionStorage (protección ante
// límites de api.rss2json.com y mejor tiempo de carga en recargas)
// La resolución con cadena de fuentes vive en js/rss.js
const setCount = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
};

const showGridStatus = (containerId, message) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<div class="col-span-full py-10 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">${message}</div>`;
};

// ============================================================
// TICKER
// ============================================================
const loadTicker = async () => {
    const container = document.getElementById('news-ticker');
    if (!container) return;
    try {
        const data = await fetchRSSMany(RSS_CONFIG.ticker);
        if (data.status === 'ok' && data.items && data.items.length) {
            // Lo más reciente primero
            const sorted = data.items.slice().sort((a, b) => {
                const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0;
                const tb = b.pubDate ? new Date(b.pubDate).getTime() : 0;
                return tb - ta;
            });
            container.innerHTML = sorted.slice(0, 14).map(item => `
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 sm:px-6 hover:text-white transition-colors duration-200">
                    <span class="text-blue-500 mr-2 text-lg leading-none">•</span>
                    <span class="tracking-wide">${item.title}</span>
                </a>
            `).join('');
        }
    } catch (e) { /* silencioso: muestra el estado por defecto */ }
};

// ============================================================
// HERO DESTACADO
// ============================================================
const loadFeatured = async () => {
    const hero = document.getElementById('featured-news');
    const link = document.getElementById('featured-link');
    if (!hero || !link) return;
    try {
        const data = await fetchRSSMany(RSS_CONFIG.hero);
        if (data.status !== 'ok' || !data.items.length) return;

        // Lo más reciente primero y, a igualdad, el primero con imagen
        const sorted = data.items.slice().sort((a, b) => {
            const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0;
            const tb = b.pubDate ? new Date(b.pubDate).getTime() : 0;
            return tb - ta;
        });
        const item = sorted.find(i => extractImage(i)) || sorted[0];

        let heroImg = extractImage(item);
        if (!heroImg) heroImg = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200';
        const cleanDesc = stripTags(item.description, 150);

        hero.style.backgroundImage = `url(${heroImg})`;
        hero.style.backgroundSize = 'cover';
        hero.style.backgroundPosition = 'center';
        const loading = document.getElementById('featured-loading');
        if (loading) loading.remove();
        link.classList.remove('opacity-0');
        link.href = item.link;
        document.getElementById('featured-badge').textContent = item.source || 'Última Hora';
        document.getElementById('featured-title').textContent = item.title;
        document.getElementById('featured-desc').textContent = cleanDesc;
    } catch (e) { /* silencioso */ }
};

// ============================================================
// TARJETA DE NOTICIA (template reutilizable)
// ============================================================
const renderCard = (item, sourceName, accentColor, idx, bias) => {
    let imageUrl = extractImage(item);
    if (!imageUrl) imageUrl = placeholderSVG(sourceName, accentColor);
    const cleanDesc = stripTags(item.description, 120);
    const pubDate = timeAgo(item.pubDate);
    const ac = ACCENT_CLASSES[accentColor] || ACCENT_CLASSES.blue;

    return `
        <a href="${item.link}" target="_blank" rel="noopener noreferrer" data-bias="${biasGroup(bias) || ''}"
           class="feed-card flex flex-col bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-slate-200/60 dark:border-slate-700/50 transition-all duration-300 group hover:-translate-y-1" style="animation: fadeInUp 0.4s ease ${idx * 0.04}s both;">
            <div class="relative h-36 sm:h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src="${imageUrl}" alt="Noticia" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" onerror="this.src='${placeholderSVG(sourceName, accentColor)}'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div class="absolute top-2.5 left-2.5">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 ${ac.badge} shadow-sm backdrop-blur-sm">${sourceName}</span>
                </div>
                <div class="absolute top-2.5 right-2.5">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold bg-black/50 text-white/90 backdrop-blur-sm">
                        <i class="ph ph-clock"></i> ${pubDate}
                    </span>
                </div>
            </div>
            <div class="p-3.5 sm:p-4 flex-grow flex flex-col justify-between">
                <h4 class="font-bold text-sm sm:text-[14px] text-slate-900 dark:text-slate-200 leading-snug mb-2 ${ac.hover} transition-colors line-clamp-3">${item.title}</h4>
                ${cleanDesc ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-light mb-2.5">${cleanDesc}</p>` : ''}
                <div class="flex items-center justify-between pt-2.5 mt-auto border-t border-slate-100 dark:border-slate-700/50">
                    <span class="text-[8px] font-medium text-slate-400 dark:text-slate-500"><i class="ph ph-clock mr-1"></i>${pubDate}</span>
                    <span class="text-[8px] font-bold ${ac.link} uppercase tracking-wider">Leer <i class="ph ph-arrow-right ml-0.5"></i></span>
                </div>
            </div>
        </a>
    `;
};

// ============================================================
// GRID MULTI-FUENTE
// ============================================================
const loadGrid = async (cfg) => {
    const container = document.getElementById(cfg.container);
    if (!container) return;

    try {
        const results = await Promise.all(cfg.urls.map(u => fetchRSS(u.url)));
        const allItems = [];

        results.forEach((data, i) => {
            if (data && data.status === 'ok' && data.items) {
                const source = data.feed.title || 'Agencia';
                const bias = cfg.urls[i].bias;
                data.items.slice(0, cfg.items).forEach(item => {
                    allItems.push({ item, source, bias });
                });
            }
        });

        if (allItems.length === 0) {
            showGridStatus(cfg.container, 'No hay noticias disponibles en este momento.');
            return;
        }

        allItems.sort(() => Math.random() - 0.5);
        const selected = allItems.slice(0, cfg.max);

        container.innerHTML = selected.map((entry, idx) =>
            renderCard(entry.item, entry.source, cfg.accent, idx, entry.bias)
        ).join('');

        // Las tarjetas nuevas respetan el filtro activo
        applyBiasFilter(currentBiasFilter);
    } catch (e) {
        showGridStatus(cfg.container, 'Error al conectar con las fuentes. Inténtalo de nuevo en unos minutos.');
    }
};

// ============================================================
// ESPECTRO (Izquierda · Centro · Derecha)
// ============================================================
const renderColumn = (items, title, color, icon) => {
    const cls = SEGMENT_CLASSES[color] || SEGMENT_CLASSES.slate;
    const cards = items.map((entry, idx) => {
        let img = extractImage(entry.item);
        if (!img) img = placeholderSVG(entry.source, color);
        const desc = stripTags(entry.item.description, 100);
        return `
            <a href="${entry.item.link}" target="_blank" rel="noopener noreferrer" class="flex flex-col bg-white dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700/50 hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5" style="animation: fadeInUp 0.4s ease ${idx * 0.06}s both;">
                <div class="relative h-28 sm:h-32 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src="${img}" alt="" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" onerror="this.src='${placeholderSVG(entry.source, color)}'">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    <div class="absolute top-2 left-2">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 ${cls.head} shadow-sm">${entry.source}</span>
                    </div>
                </div>
                <div class="p-3 flex-grow flex flex-col justify-between">
                    <h4 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-200 leading-snug line-clamp-3 ${cls.head} transition-colors">${entry.item.title}</h4>
                    ${desc ? `<p class="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5">${desc}</p>` : ''}
                </div>
            </a>
        `;
    }).join('');

    return `
        <div class="flex flex-col">
            <div class="flex items-center space-x-2 mb-4 pb-3 border-b-2 ${cls.border}">
                <span class="inline-block h-3 w-3 rounded-full ${cls.dot}"></span>
                <h4 class="font-bold text-sm uppercase tracking-widest ${cls.head}">${icon} ${title}</h4>
                <span class="text-[9px] font-bold ${cls.sub} ml-auto">${items.length}</span>
            </div>
            <div class="flex flex-col space-y-3">
                ${cards || '<div class="text-[10px] text-slate-400 text-center py-6">Sin artículos</div>'}
            </div>
        </div>
    `;
};

const loadEspectro = async () => {
    const container = document.getElementById('grid-espectro');
    if (!container) return;

    const fetchAll = (urls) => Promise.all(urls.map(fetchRSS));

    try {
        const [izq, cen, der] = await Promise.all([
            fetchAll(RSS_CONFIG.espectro.izquierda),
            fetchAll(RSS_CONFIG.espectro.centro),
            fetchAll(RSS_CONFIG.espectro.derecha),
        ]);

        const extractItems = (dataList) => {
            const items = [];
            dataList.forEach(d => {
                if (d && d.status === 'ok' && d.items) {
                    d.items.slice(0, 5).forEach(item => {
                        items.push({ item, source: d.feed.title || 'Fuente' });
                    });
                }
            });
            items.sort(() => Math.random() - 0.5);
            return items.slice(0, 6);
        };

        const columns = [
            { items: extractItems(izq), label: 'Izquierda', color: 'blue', icon: '←' },
            { items: extractItems(cen), label: 'Centro', color: 'slate', icon: '—' },
            { items: extractItems(der), label: 'Derecha', color: 'red', icon: '→' },
        ];

        container.innerHTML = columns.map(col => renderColumn(col.items, col.label, col.color, col.icon)).join('');

        const total = columns.reduce((s, c) => s + c.items.length, 0);
        setCount('espectro-count', total + ' artículos · 3 ángulos');
    } catch (e) {
        showGridStatus('grid-espectro', 'Error al conectar con las fuentes.');
    }
};

// ============================================================
// TRANSPARENCIA (propiedad de los medios)
// ============================================================
const renderOwnership = () => {
    const container = document.getElementById('ownership-content');
    if (!container) return;

    const owners = {};
    mediaSources.forEach(src => {
        if (!owners[src.owner]) owners[src.owner] = { owner: src.owner, type: src.ownerType, sources: [], biases: new Set() };
        owners[src.owner].sources.push(src.name);
        owners[src.owner].biases.add(src.bias);
    });

    const entries = Object.entries(owners).sort((a, b) => b[1].sources.length - a[1].sources.length);

    container.innerHTML = entries.map(([key, data]) => {
        const biasList = [...data.biases].map(b => {
            const color = (b === 'left' || b === 'center-left') ? 'blue' : (b === 'right' || b === 'center-right') ? 'red' : 'slate';
            const cls = SEGMENT_CLASSES[color] || SEGMENT_CLASSES.slate;
            return `<span class="inline-block h-2 w-2 rounded-full ${cls.dot} mr-1"></span>`;
        }).join('');

        return `
            <div class="bg-white dark:bg-slate-800/50 p-4 sm:p-5 rounded-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-bold text-sm text-slate-900 dark:text-slate-200">${data.owner}</h4>
                    <span class="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">${data.type}</span>
                </div>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5 font-medium">
                    <i class="ph ph-newspaper mr-1"></i> ${data.sources.length} medio${data.sources.length > 1 ? 's' : ''}
                </p>
                <div class="flex flex-wrap gap-1">
                    ${data.sources.map(s => `<span class="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-medium">${s}</span>`).join('')}
                </div>
                <div class="flex items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <span class="text-[8px] text-slate-400 dark:text-slate-500 font-medium">Espectro: ${biasList}</span>
                </div>
            </div>
        `;
    }).join('');
};

// ============================================================
// INICIALIZACIÓN (carga en paralelo, sin cascadas artificiales)
// ============================================================
const initFeeds = () => {
    loadTicker();
    loadFeatured();
    RSS_CONFIG.grids.forEach(loadGrid);
    loadEspectro();
    renderOwnership();
};