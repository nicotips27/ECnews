/* ============================================================
   ECNEWS Â· EN VIVO
   Reproductores HLS directos (hls.js) con click-to-play.
   - Fuente principal: stream .m3u8 con CORS abierto (no caduca).
   - Si un stream falla, se autorepara consultando el Ã­ndice de
     iptv-org y reintentando con la URL vigente del canal.
   - Respaldo final: embed de YouTube + enlace "Ver en YouTube".
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
// MENÃš MÃ“VIL
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
        <a href="${liveTargetUrl(ch)}" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center px-4 sm:px-6 hover:text-white transition-colors duration-200">
            <span class="text-red-500 mr-2 text-lg leading-none">•</span>
            <span class="tracking-wide">${ch.name}</span>
        </a>
    `).join('');
};


// ============================================================
// TARJETA DE CANAL
// ============================================================
const renderLiveCard = (ch, idx) => `
    <article class="live-card flex flex-col bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-[0_10px_35px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_10px_35px_rgb(0,0,0,0.4)] transition-all duration-300">
        <div class="live-stage relative aspect-video bg-black overflow-hidden cursor-pointer group/stage" data-index="${idx}" role="button" tabindex="0" aria-label="Reproducir ${ch.name} en directo">
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white transition-opacity group-hover/stage:opacity-80">
                <i class="ph ph-play-circle text-5xl text-red-500"></i>
                <span class="text-sm font-medium">Reproducir en directo</span>
            </div>
            <span class="live-badge absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[9px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-sm">
                <span class="live-dot"></span> En Vivo
            </span>
            ${ch.hls ? '<span class="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-black/60 text-white/90 text-[8px] font-bold uppercase tracking-wider backdrop-blur-sm">HLS</span>' : ''}
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
                <a href="${liveTargetUrl(ch)}" target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center text-[9px] sm:text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider">
                    Ver en YouTube <i class="ph ph-arrow-up-right ml-1"></i>
                </a>
            </div>
        </div>
    </article>
`;

// ============================================================
// GRIDS DE TRANSMISIONES
// ============================================================
const loadLiveGrid = (containerId, countId, channels) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = channels.map((ch, idx) => renderLiveCard(ch, idx)).join('');

    const countEl = document.getElementById(countId);
    if (countEl) countEl.textContent = channels.length + ' Canales';

    container.querySelectorAll('.live-stage').forEach(stage => {
        const index = Number(stage.dataset.index);
        const ch = channels[index];
        const activate = () => {
            if (stage.dataset.playing === '1') return;
            stage.dataset.playing = '1';
            startPlayback(stage, ch);
        };
        stage.addEventListener('click', activate);
        stage.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
        });
    });
};

// ============================================================
// INICIALIZACIÃ“N
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
