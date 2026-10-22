/* ============================================================
   ECNEWS · LIVE PLAYER (compartido)
   Lógica de reproducción de transmisiones en vivo, usada por:
   - envivo.html  (js/envivo.js)      → grid completo de canales
   - index.html   (js/live-strip.js)  → franja destacada
   Depende de LIVE_CONFIG (js/data.js).

   Fuente principal: stream HLS directo (.m3u8) con CORS abierto.
   Respaldo: embed de YouTube + autoreparación vía índice iptv-org.
   ============================================================ */

// ============================================================
// URLs DE CANAL (YouTube de respaldo)
// ============================================================
const isVideoId = (v) => v && /^[A-Za-z0-9_-]{11}$/.test(v);

const liveTargetUrl = (ch) => {
    if (!ch || !ch.youtube) return '#';
    return isVideoId(ch.youtube)
        ? `https://www.youtube.com/watch?v=${ch.youtube}`
        : `https://www.youtube.com/channel/${ch.youtube}/live`;
};

const liveEmbedUrl = (ch) => {
    if (!ch || !ch.youtube) return null;
    return isVideoId(ch.youtube)
        ? `https://www.youtube.com/embed/${ch.youtube}?autoplay=1&mute=1&playsinline=1`
        : `https://www.youtube.com/embed/live_stream?channel=${ch.youtube}&autoplay=1&mute=1&playsinline=1`;
};

// ============================================================
// HLS.JS (carga bajo demanda, solo si hace falta)
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
    if (typeof LIVE_CONFIG === 'undefined') return ids;
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
    if (!ch || !ch.channel) return null;
    const map = await fetchIptvIndex();
    if (!map || !map[ch.channel] || !map[ch.channel].length) return null;
    const candidates = map[ch.channel];
    return candidates.find(u => u !== ch.hls) || candidates[0];
};

// ============================================================
// ESCENAS DE REPRODUCCIÓN
// ============================================================
const showStageError = (stage, ch, message) => {
    stage.innerHTML = `
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center bg-slate-900">
            <i class="ph ph-warning-circle text-3xl text-amber-400"></i>
            <p class="text-xs sm:text-sm font-medium text-slate-300">${message}</p>
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
    if (ch.hls) {
        mountHlsPlayer(stage, ch, ch.hls);
    } else {
        mountYouTubePlayer(stage, ch);
    }
};
