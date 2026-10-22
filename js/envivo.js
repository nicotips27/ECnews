/* ============================================================
   ECNEWS · EN VIVO
   Reproductores HLS directos (hls.js) con click-to-play.
   - Fuente principal: stream .m3u8 con CORS abierto (no caduca).
   - Si un stream falla, se autorepara consultando el índice de
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
        <a href="${liveTargetUrl(ch)}" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center px-4 sm:px-6 hover:text-white transition-colors duration-200">
            <span class="text-red-500 mr-2 text-lg leading-none">•</span>
            <span class="tracking-wide">${ch.name}</span>
        </a>
    `).join('');
};

// ============================================================
// URLs DE CANAL (YouTube de respaldo)
// ============================================================
const isVideoId = (v) => v && /^[A-Za-z0-9_-]{11}$/.test(v);

const liveTargetUrl = (ch) => {
    if (!ch.youtube) return '#';
    return isVideoId(ch.youtube)
        ? `https://www.youtube.com/watch?v=${ch.youtube}`
        : `https://www.youtube.com/channel/${ch.youtube}/live`;
};

const liveEmbedUrl = (ch) => {
    if (!ch.youtube) return null;
    return isVideoId(ch.youtube)
        ? `https://www.youtube.com/embed/${ch.youtube}?autoplay=1&mute=1&playsinline=1`
        : `https://www.youtube.com/embed/live_stream?channel=${ch.youtube}&autoplay=1&mute=1&playsinline=1`;
};

// ============================================================
// HLS.JS (carga bajo demanda)
// ============================================================
const HLS_JS_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';

let hlsLibPromise = null;

const loadHlsLib = () => {
    if (hlsLibPromise) return hlsLibPromise;
    hlsLibPromise = new Promise((resolve, reject) => {
        if (window.Hls) return resolve(window.Hls);
        const script = document.createElement('script');
        script.src = HLS_JS_URL;
        script.onload = () => (window.Hls ? resolve(window.Hls) : reject(new Error('Hls no disponible')));
        script.onerror = () => reject(new Error('No se pudo cargar hls.js'));
        document.head.appendChild(script);
    });
    return hlsLibPromise;
};

// ============================================================
// AUTOREPARACIÓN (índice de iptv-org)
// Descarga el índice una vez por sesión y cachea solo las URLs
// de nuestros canales. Si una URL deja de servir, se sustituye
// por la vigente y se reintenta la reproducción.
// ============================================================
const IPTV_INDEX_URL = 'https://iptv-org.github.io/api/streams.json';
const IPTV_CACHE_KEY = 'ecnews-iptv-streams';
const IPTV_TTL = 6 * 60 * 60 * 1000;

const wantedChannelIds = () => {
    const ids = new Set();
    [...LIVE_CONFIG.es, ...LIVE_CONFIG.en].forEach(ch => { if (ch.channel) ids.add(ch.channel); });
    return ids;
};

const fetchIptvIndex = async () => {
    const wanted = wantedChannelIds();

    try {
        const cached = JSON.parse(sessionStorage.getItem(IPTV_CACHE_KEY));
        if (cached && Date.now() - cached.ts < IPTV_TTL) return cached.map;
    } catch (e) { /* almacenamiento no disponible */ }

    try {
        const res = await fetch(IPTV_INDEX_URL);
        if (!res.ok) return null;
        const data = await res.json();
        const map = {};
        data.forEach(s => {
            if (wanted.has(s.channel) && s.url && /\.m3u8(\?|$)/i.test(s.url)) {
                if (!map[s.channel]) map[s.channel] = [];
                map[s.channel].push(s.url);
            }
        });
        try {
            sessionStorage.setItem(IPTV_CACHE_KEY, JSON.stringify({ ts: Date.now(), map }));
        } catch (e) { /* cuota superada */ }
        return map;
    } catch (e) {
        return null;
    }
};

const repairStreamUrl = async (ch) => {
    if (!ch.channel) return null;
    const map = await fetchIptvIndex();
    if (!map || !map[ch.channel] || !map[ch.channel].length) return null;
    const candidates = map[ch.channel];
    return candidates.find(u => u !== ch.hls) || candidates[0];
};

// ============================================================
// REPRODUCTOR
// ============================================================
const showStageError = (stage, ch, message) => {
    stage.innerHTML = `
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center bg-slate-900">
            <i class="ph ph-warning-circle text-4xl text-amber-400"></i>
            <p class="text-sm font-medium text-slate-300">${message}</p>
            <a href="${liveTargetUrl(ch)}" target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:underline">
                Ver en YouTube <i class="ph ph-arrow-up-right ml-1"></i>
            </a>
        </div>`;
};

const appendLiveBadge = (stage, ch) => {
    const badge = document.createElement('span');
    badge.className = 'live-badge absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[9px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-sm';
    badge.innerHTML = '<span class="live-dot"></span> En Vivo';
    stage.appendChild(badge);
};

const mountHlsPlayer = async (stage, ch, url) => {
    stage.innerHTML = '';
    let hlsInstance = null;

    const video = document.createElement('video');
    video.className = 'absolute inset-0 w-full h-full bg-black';
    video.controls = true;
    video.playsInline = true;
    video.autoplay = true;
    video.muted = true;
    video.setAttribute('playsinline', '');
    stage.appendChild(video);
    appendLiveBadge(stage, ch);

    const onFatal = async () => {
        try { if (hlsInstance) hlsInstance.destroy(); } catch (e) { /* ignore */ }
        const repaired = await repairStreamUrl(ch);
        if (repaired && repaired !== url) {
            mountHlsPlayer(stage, ch, repaired);
            return;
        }
        showStageError(stage, ch, 'La señal no está disponible en este momento');
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
    } else {
        let Hls;
        try {
            Hls = await loadHlsLib();
        } catch (e) {
            showStageError(stage, ch, 'No se pudo cargar el reproductor');
            return;
        }
        if (!Hls.isSupported()) {
            video.src = url;
        } else {
            hlsInstance = new Hls({ maxBufferLength: 20, enableWorker: true });
            hlsInstance.on(Hls.Events.ERROR, (_evt, data) => {
                if (data && data.fatal) onFatal();
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
        }
    }

    video.addEventListener('error', () => {
        if (video.networkState === video.NETWORK_NO_SOURCE) onFatal();
    });
};

const mountYouTubePlayer = (stage, ch) => {
    const embed = liveEmbedUrl(ch);
    if (!embed) {
        showStageError(stage, ch, 'Canal no disponible');
        return;
    }
    stage.innerHTML = `
        <iframe src="${embed}" title="${ch.name}" loading="lazy"
                class="absolute inset-0 w-full h-full bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen frameborder="0"></iframe>`;
    appendLiveBadge(stage, ch);
};

const startPlayback = (stage, ch) => {
    stage.innerHTML = '';
    if (ch.hls) {
        mountHlsPlayer(stage, ch, ch.hls);
    } else {
        mountYouTubePlayer(stage, ch);
    }
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
