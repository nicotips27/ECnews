/* ============================================================
   ECNEWS · EN VIVO
   Tarjetas de canales en vivo (click-to-play): el reproductor
   YouTube solo se incrusta al hacer clic, así la página nunca
   muestra pantallas de error si un canal no está emitiendo.
   Siempre hay un enlace directo "Ver en YouTube" como respaldo.
   ============================================================ */

// ============================================================
// TEMA (modo oscuro)
// ============================================================
const setupLiveTheme = () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    const updateThemeUI = () => {
        const isDark = document.documentElement.classList.contains('dark');
        themeToggleBtn.classList.toggle('bg-slate-200', !isDark);
        themeToggleBtn.classList.toggle('bg-slate-800', isDark);
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
// MENÚ MÓVIL
// ============================================================
const setupLiveMobileMenu = () => {
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
// TICKER DE CANALES EN VIVO
// ============================================================
const biasDotColor = (bias) => {
    if (bias === 'left' || bias === 'center-left') return '#3b82f6';
    if (bias === 'right' || bias === 'center-right') return '#ef4444';
    return '#64748b';
};

const renderLiveTicker = () => {
    const container = document.getElementById('live-ticker');
    if (!container || !LIVE_CONFIG) return;

    const channels = [...LIVE_CONFIG.es, ...LIVE_CONFIG.en];
    container.innerHTML = channels.map(ch => `
        <a href="https://www.youtube.com/channel/${ch.channelId}/live" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center px-4 sm:px-6 hover:text-white transition-colors duration-200">
            <span class="text-red-500 mr-2 text-lg leading-none">•</span>
            <span class="tracking-wide">${ch.name}</span>
        </a>
    `).join('');
};

// ============================================================
// TARJETA DE CANAL (click-to-play)
// ============================================================
const renderLiveCard = (ch, idx) => {
    const origin = window.location.origin;
    const embed = `https://www.youtube.com/embed/live_stream?channel=${ch.channelId}&autoplay=1&mute=1&playsinline=1&origin=${encodeURIComponent(origin)}`;
    const channelUrl = `https://www.youtube.com/channel/${ch.channelId}/live`;

    return `
        <article class="live-card flex flex-col bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-[0_10px_35px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_10px_35px_rgb(0,0,0,0.4)] transition-all duration-300 group hover:-translate-y-1" style="animation: fadeInUp 0.4s ease ${idx * 0.06}s both;">
            <!-- Poster (se reemplaza por el reproductor al hacer clic) -->
            <div class="live-poster relative aspect-video bg-gradient-to-b from-slate-900 to-black flex items-center justify-center overflow-hidden cursor-pointer select-none" data-embed="${embed}" role="button" tabindex="0" aria-label="Reproducir ${ch.name}">
                <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                <span class="live-badge absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[9px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-sm z-10">
                    <span class="live-dot"></span> En Vivo
                </span>
                <div class="relative z-10 flex flex-col items-center text-white pointer-events-none">
                    <i class="ph ph-play-circle text-5xl text-red-500 mb-3"></i>
                    <h3 class="text-lg font-bold sm:text-xl leading-snug">${ch.name}</h3>
                    <p class="text-sm text-slate-300 mt-1 max-w-xs px-2 text-center">Haz clic para reproducir</p>
                </div>
            </div>
            <div class="p-4 flex flex-col">
                <div class="flex items-start justify-between gap-2 mb-2">
                    <h4 class="font-bold text-sm sm:text-[15px] text-slate-900 dark:text-white leading-snug">${ch.name}</h4>
                    <span class="bias-badge bias-${ch.bias} shrink-0">
                        <span class="inline-block h-1.5 w-1.5 rounded-full" style="background:${biasDotColor(ch.bias)}"></span> ${biasLabelMap[ch.bias] || 'Centro'}
                    </span>
                </div>
                <div class="flex items-center justify-between pt-2.5 mt-auto border-t border-slate-100 dark:border-slate-700/50">
                    <span class="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <i class="ph ph-globe-hemisphere-west mr-1"></i>${ch.country}
                    </span>
                    <a href="${channelUrl}" target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center text-[9px] sm:text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider">
                        Ver en YouTube <i class="ph ph-arrow-up-right ml-1"></i>
                    </a>
                </div>
            </div>
        </article>
    `;
};

// ============================================================
// GRIDS DE TRANSMISIONES
// ============================================================
const loadLiveGrid = (containerId, countId, channels) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = channels.map((ch, idx) => renderLiveCard(ch, idx)).join('');

    const countEl = document.getElementById(countId);
    if (countEl) countEl.textContent = channels.length + ' Canales';

    // Click-to-play: carga el reproductor YouTube solo al hacer clic
    container.querySelectorAll('.live-poster').forEach(poster => {
        const activate = () => {
            if (poster.dataset.active === '1') return;
            poster.dataset.active = '1';
            const embed = poster.dataset.embed;
            if (!embed) return;
            poster.innerHTML = `
                <iframe src="${embed}" title="En directo" loading="lazy"
                        class="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen frameborder="0"></iframe>`;
        };
        poster.addEventListener('click', activate);
        poster.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    });
};

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    setupLiveTheme();
    setupLiveMobileMenu();
    renderLiveTicker();

    if (typeof LIVE_CONFIG !== 'undefined') {
        loadLiveGrid('grid-envivo-es', 'live-es-count', LIVE_CONFIG.es);
        loadLiveGrid('grid-envivo-en', 'live-en-count', LIVE_CONFIG.en);
    }
});
