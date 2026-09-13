/* ============================================================
   ECNEWS · MAIN
   Construcción del directorio, tema, panel de ajustes, menús,
   dashboard de sesgo, blindspot y filtros.
   ============================================================ */

// ============================================================
// CONSTRUCCIÓN DEL DIRECTORIO (tarjetas de medios)
// ============================================================
const biasDotColor = (bias) => {
    if (bias === 'left' || bias === 'center-left') return '#3b82f6';
    if (bias === 'right' || bias === 'center-right') return '#ef4444';
    return '#64748b';
};

const buildMediaCard = (src) => {
    const group = biasGroup(src.bias);
    const accent = ACCENT_CLASSES[src.accent] || ACCENT_CLASSES.blue;
    const meta = CARD_META[src.accent] || CARD_META.blue;
    // Las tarjetas de tecnología usan el color de acento de la sección
    const categoryClass = src.tech ? accent.link : 'text-slate-400 dark:text-slate-500';

    return `
        <a href="${src.url}" target="_blank" rel="noopener noreferrer"
           data-bias="${group}" data-bias-detail="${src.bias}" data-factuality="${src.factuality}"
           class="directory-card group flex flex-col justify-between bg-white dark:bg-slate-800/50 p-4 sm:p-5 rounded-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ${meta.hoverBorder} transition-all duration-300">
            <div>
                <div class="flex justify-between items-start mb-1 sm:mb-2">
                    <h3 class="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-200 ${accent.hover} transition-colors">${src.name}</h3>
                    <i class="ph ph-arrow-up-right text-slate-300 dark:text-slate-600 ${meta.arrow} transition-colors"></i>
                </div>
                <div class="flex flex-wrap items-center gap-1.5 mb-2.5 sm:mb-3">
                    <span class="bias-badge bias-${src.bias}">
                        <span class="inline-block h-1.5 w-1.5 rounded-full" style="background:${biasDotColor(src.bias)}"></span> ${biasLabelMap[src.bias]}
                    </span>
                    <span class="fact-badge fact-${src.factuality}"><i class="ph ph-shield-check"></i> ${factLabelMap[src.factuality]}</span>
                </div>
            </div>
            <div>
                <p class="text-[9px] sm:text-[10px] font-bold ${categoryClass} uppercase tracking-widest">${src.country}</p>
                <p class="owner-badge text-[8px] sm:text-[9px] font-medium text-slate-400/70 dark:text-slate-500/70 mt-0.5">
                    <i class="ph ph-building-office"></i> ${src.owner} · <span class="text-slate-400/50 dark:text-slate-500/50">${src.ownerType}</span>
                </p>
            </div>
        </a>
    `;
};

const buildMediaGrids = () => {
    const esGrid = document.getElementById('media-grid-es');
    const enGrid = document.getElementById('media-grid-en');

    const esSources = mediaSources.filter(s => s.lang === 'es');
    const enSources = mediaSources.filter(s => s.lang === 'en');

    if (esGrid) esGrid.innerHTML = esSources.map(buildMediaCard).join('');
    if (enGrid) enGrid.innerHTML = enSources.map(buildMediaCard).join('');

    const esCount = document.getElementById('es-media-count');
    const enCount = document.getElementById('en-media-count');
    if (esCount) esCount.textContent = esSources.length + ' Fuentes';
    if (enCount) enCount.textContent = enSources.length + ' Sources';
};

// ============================================================
// DASHBOARD DE SESGO · DISTRIBUCIÓN · BLINDSPOT
// ============================================================
const updateDistribution = (filterBias) => {
    const allCards = document.querySelectorAll('.directory-card[data-bias]');
    let left = 0, center = 0, right = 0, total = 0;

    allCards.forEach(card => {
        const b = card.dataset.bias;
        if (filterBias && filterBias !== 'all' && b !== filterBias) return;
        if (b === 'left') left++;
        else if (b === 'right') right++;
        else center++;
        total++;
    });

    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    setText('count-left', left);
    setText('count-center', center);
    setText('count-right', right);
    setText('bias-total', total + ' fuentes');

    const maxVal = Math.max(left, center, right, 1);
    const pct = (v) => (v / maxVal) * 100;
    const setBar = (id, val) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.width = pct(val) + '%';
        el.dataset.count = val;
    };
    setBar('dist-left', left);
    setBar('dist-center', center);
    setBar('dist-right', right);

    updateBlindspot(left, center, right, total);
    applyBiasFilter(filterBias || 'all');
    updateActiveFilterBtn(filterBias || 'all');
};

const updateBlindspot = (left, center, right, total) => {
    const container = document.getElementById('blindspot-content');
    if (!container) return;
    const pct = (v) => ((v / Math.max(total, 1)) * 100).toFixed(0);

    const segments = [
        { name: 'Izquierda', count: left, pct: pct(left), color: 'blue', icon: 'ph-arrow-left', desc: '' },
        { name: 'Centro', count: center, pct: pct(center), color: 'slate', icon: 'ph-minus', desc: '' },
        { name: 'Derecha', count: right, pct: pct(right), color: 'red', icon: 'ph-arrow-right', desc: '' },
    ];

    const maxSeg = segments.reduce((a, b) => a.count > b.count ? a : b);
    segments.forEach(s => {
        const diff = maxSeg.count - s.count;
        if (diff === 0) s.desc = `Mayoría · ${s.pct}% de las fuentes`;
        else if (diff <= 2) s.desc = `Subrepresentado · ${s.pct}% (${diff} menos que ${maxSeg.name})`;
        else s.desc = `Infrarrepresentado · ${s.pct}% (${diff} menos que ${maxSeg.name})`;
    });

    const sorted = [...segments].sort((a, b) => a.count - b.count);

    container.innerHTML = sorted.map(s => {
        const isLow = s.count === sorted[0].count && sorted[0].count < sorted[1].count;
        const cls = SEGMENT_CLASSES[s.color] || SEGMENT_CLASSES.slate;
        return `
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/50 ${isLow ? 'ring-2 ring-amber-400/50' : ''}">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="inline-block h-2.5 w-2.5 rounded-full ${cls.dot} ${isLow ? 'blindspot-dot' : ''}"></span>
                        <span class="text-sm font-bold text-slate-800 dark:text-slate-200">${s.name}</span>
                    </div>
                    <span class="text-[10px] font-bold text-slate-400">${s.pct}%</span>
                </div>
                <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div class="h-full rounded-full ${cls.dot} transition-all duration-500" style="width:${s.pct}%"></div>
                </div>
                <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400">${s.desc}</p>
            </div>
        `;
    }).join('');
};

const updateActiveFilterBtn = (bias) => {
    document.querySelectorAll('.bias-filter-btn').forEach(btn => {
        const isActive = btn.dataset.bias === bias;
        btn.style.opacity = isActive ? '1' : '0.5';
        btn.style.boxShadow = isActive ? '0 0 0 2px rgba(59,130,246,0.5)' : 'none';
        const radio = document.querySelector(`input[name="bias-filter"][value="${bias}"]`);
        if (radio) radio.checked = true;
    });
    const resetBtn = document.getElementById('reset-bias-filter');
    if (resetBtn) resetBtn.classList.toggle('hidden', bias === 'all');
};

const setupBiasFilters = () => {
    document.querySelectorAll('.bias-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => updateDistribution(btn.dataset.bias));
    });

    document.querySelectorAll('input[name="bias-filter"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) updateDistribution(radio.value);
        });
    });

    const resetBtn = document.getElementById('reset-bias-filter');
    if (resetBtn) resetBtn.addEventListener('click', () => updateDistribution('all'));
};

// ============================================================
// TEMA (modo oscuro)
// ============================================================
const setupTheme = () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDot = document.getElementById('theme-toggle-dot');
    const themeIcon = document.getElementById('theme-icon');

    const updateThemeUI = () => {
        const isDark = document.documentElement.classList.contains('dark');
        themeToggleDot.classList.toggle('translate-x-6', isDark);
        themeToggleDot.classList.toggle('translate-x-1', !isDark);
        themeToggleBtn.classList.toggle('bg-blue-600', isDark);
        themeToggleBtn.classList.toggle('bg-slate-300', !isDark);
        themeIcon.classList.replace(isDark ? 'ph-moon' : 'ph-sun', isDark ? 'ph-sun' : 'ph-moon');
    };

    updateThemeUI();

    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
        updateThemeUI();
    });
};

// ============================================================
// PANEL DE AJUSTES (offcanvas)
// ============================================================
const toggleSettings = () => {
    const panel = document.getElementById('settings-panel');
    const overlay = document.getElementById('settings-overlay');
    const isClosed = panel.classList.contains('translate-x-full');
    panel.classList.toggle('translate-x-full', !isClosed);
    overlay.classList.toggle('opacity-0', !isClosed);
    overlay.classList.toggle('invisible', !isClosed);
};

const setupSettings = () => {
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const settingsOverlay = document.getElementById('settings-overlay');
    if (openSettingsBtn) openSettingsBtn.addEventListener('click', toggleSettings);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', toggleSettings);
    if (settingsOverlay) settingsOverlay.addEventListener('click', toggleSettings);
};

// ============================================================
// MENÚ MÓVIL
// ============================================================
const setupMobileMenu = () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
};

// ============================================================
// PANTALLA DE CARGA (sin delay artificial)
// ============================================================
const closeLoader = () => {
    const loader = document.getElementById('loading-screen');
    if (!loader) return;
    requestAnimationFrame(() => {
        loader.classList.add('opacity-0');
        setTimeout(() => {
            loader.classList.add('hidden');
            loader.remove();
        }, 400);
    });
};

// ============================================================
// FILTRO POR SESGO — Estado global y funciones
// ============================================================
let currentBiasFilter = 'all';

const refreshGridCounts = () => {
    RSS_CONFIG.grids.forEach(cfg => {
        const grid = document.getElementById(cfg.container);
        const countEl = document.getElementById(cfg.container.replace('grid-noticias-', '') + '-count');
        if (!grid || !countEl) return;
        const cards = grid.querySelectorAll('.feed-card');
        let visible = 0;
        cards.forEach(c => { if (!c.classList.contains('card-hidden')) visible++; });
        countEl.textContent = currentBiasFilter !== 'all'
            ? `${visible}/${cards.length} ${cfg.label}`
            : `${cards.length} ${cfg.label}`;
    });
};

const applyBiasFilter = (bias) => {
    currentBiasFilter = bias;
    try { sessionStorage.setItem('ecnews-bias-filter', bias); } catch (e) {}
    document.querySelectorAll('.feed-card[data-bias], .directory-card[data-bias]').forEach(el => {
        el.classList.toggle('card-hidden', bias !== 'all' && el.dataset.bias !== bias);
    });
    refreshGridCounts();
};

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    buildMediaGrids();
    setupTheme();
    setupSettings();
    setupMobileMenu();
    setupBiasFilters();
    let savedBias = 'all';
    try { savedBias = sessionStorage.getItem('ecnews-bias-filter') || 'all'; } catch (e) {}
    if (!['all', 'left', 'center', 'right'].includes(savedBias)) savedBias = 'all';
    updateDistribution(savedBias);
    closeLoader();
    if (typeof initFeeds === 'function') initFeeds();
});