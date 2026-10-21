/* ============================================================
   ECNEWS · FUENTE ÚNICA DE DATOS
   Directorio de medios + configuración de feeds RSS.
   Este archivo es la fuente de verdad: las tarjetas estáticas,
   los badges de sesgo, el dashboard, el blindspot y la
   transparencia se generan a partir de mediaSources.
   ============================================================ */

const mediaSources = [
    // ==================== ESPAÑOL ====================
    { name: 'El País',          url: 'https://elpais.com/',               country: 'España',        lang: 'es', accent: 'blue',      bias: 'center-left',  factuality: 'high',   owner: 'Grupo Prisa',                    ownerType: 'Corporación' },
    { name: 'El Mundo',         url: 'https://www.elmundo.es/',           country: 'España',        lang: 'es', accent: 'blue',      bias: 'center-right', factuality: 'high',   owner: 'Unidad Editorial',                ownerType: 'Corporación' },
    { name: 'Clarín',           url: 'https://www.clarin.com/',           country: 'Argentina',     lang: 'es', accent: 'blue',      bias: 'center-right', factuality: 'medium', owner: 'Grupo Clarín',                    ownerType: 'Corporación' },
    { name: 'La Nación',        url: 'https://www.lanacion.com.ar/',      country: 'Argentina',     lang: 'es', accent: 'blue',      bias: 'center-right', factuality: 'high',   owner: 'S.A. La Nación',                  ownerType: 'Corporación' },
    { name: 'Infobae',          url: 'https://www.infobae.com/',          country: 'América Latina', lang: 'es', accent: 'blue',     bias: 'center',       factuality: 'high',   owner: 'Grupo Infobae',                   ownerType: 'Independiente' },
    { name: 'El Universal',     url: 'https://www.eluniversal.com.mx/',   country: 'México',        lang: 'es', accent: 'blue',      bias: 'center',       factuality: 'high',   owner: 'Compañía Periodística Nacional',  ownerType: 'Corporación' },
    { name: 'Reforma',          url: 'https://www.reforma.com/',          country: 'México',        lang: 'es', accent: 'blue',      bias: 'center-right', factuality: 'high',   owner: 'Grupo Reforma',                   ownerType: 'Corporación' },
    { name: 'El Tiempo',        url: 'https://www.eltiempo.com/',         country: 'Colombia',      lang: 'es', accent: 'blue',      bias: 'center',       factuality: 'high',   owner: 'Casa Editorial El Tiempo',        ownerType: 'Corporación' },
    { name: 'El Comercio',      url: 'https://elcomercio.pe/',            country: 'Perú',          lang: 'es', accent: 'blue',      bias: 'center',       factuality: 'high',   owner: 'Empresa Editora El Comercio',     ownerType: 'Corporación' },
    { name: 'BBC Mundo',        url: 'https://www.bbc.com/mundo',         country: 'Global',        lang: 'es', accent: 'blue',      bias: 'center',       factuality: 'high',   owner: 'BBC',                             ownerType: 'Servicio Público' },
    { name: 'Xataka',           url: 'https://www.xataka.com/',           country: 'Tecnología',    lang: 'es', accent: 'blue',      bias: 'center',       factuality: 'high',   owner: 'Webedia',                         ownerType: 'Corporación', tech: true },
    { name: 'Hipertextual',     url: 'https://hipertextual.com/',         country: 'Tecnología',    lang: 'es', accent: 'blue',      bias: 'center',       factuality: 'medium', owner: 'Hipertextual SL',                  ownerType: 'Independiente', tech: true },
    { name: 'Genbeta',          url: 'https://www.genbeta.com/',          country: 'Software / Tech', lang: 'es', accent: 'blue',    bias: 'center',       factuality: 'high',   owner: 'Webedia',                         ownerType: 'Corporación', tech: true },
    { name: 'Gizmodo ES',       url: 'https://es.gizmodo.com/',           country: 'Tecnología',    lang: 'es', accent: 'blue',      bias: 'center',       factuality: 'medium', owner: 'G/O Media',                        ownerType: 'Corporación', tech: true },
    { name: '3DJuegos',         url: 'https://www.3djuegos.com/',         country: 'Gaming / Tech', lang: 'es', accent: 'blue',      bias: 'center',       factuality: 'medium', owner: 'Webedia',                         ownerType: 'Corporación', tech: true },
    { name: 'CNN Español',      url: 'https://cnnespanol.cnn.com/',       country: 'Global',        lang: 'es', accent: 'blue',      bias: 'center',       factuality: 'high',   owner: 'Warner Bros. Discovery',           ownerType: 'Corporación' },
    { name: 'RTVE',             url: 'https://www.rtve.es/noticias/',     country: 'España',        lang: 'es', accent: 'blue',      bias: 'center-left',  factuality: 'high',   owner: 'Gobierno de España',               ownerType: 'Servicio Público' },
    { name: 'La Vanguardia',    url: 'https://www.lavanguardia.com/',     country: 'España',        lang: 'es', accent: 'blue',      bias: 'center-left',  factuality: 'high',   owner: 'Grupo Godó',                       ownerType: 'Corporación' },
    { name: 'El Español',       url: 'https://www.elespanol.com/',        country: 'España',        lang: 'es', accent: 'blue',      bias: 'center',       factuality: 'medium', owner: 'El Español',                       ownerType: 'Independiente' },
    { name: 'ABC',              url: 'https://www.abc.es/',               country: 'España',        lang: 'es', accent: 'blue',      bias: 'center-right', factuality: 'high',   owner: 'Vocento',                          ownerType: 'Corporación' },

    // ==================== INGLÉS ====================
    { name: 'The New York Times', url: 'https://www.nytimes.com/',            country: 'USA',     lang: 'en', accent: 'indigo', bias: 'center-left',  factuality: 'high',   owner: 'The New York Times Company',         ownerType: 'Corporación' },
    { name: 'Washington Post',    url: 'https://www.washingtonpost.com/',     country: 'USA',     lang: 'en', accent: 'indigo', bias: 'center-left',  factuality: 'high',   owner: 'Nash Holdings (Bezos)',              ownerType: 'Propietario Individual' },
    { name: 'The Guardian',       url: 'https://www.theguardian.com/international', country: 'UK', lang: 'en', accent: 'indigo', bias: 'center-left', factuality: 'high',   owner: 'Guardian Media Group',               ownerType: 'Fundación' },
    { name: 'BBC News',           url: 'https://www.bbc.com/news',           country: 'UK',      lang: 'en', accent: 'indigo', bias: 'center',       factuality: 'high',   owner: 'BBC',                                ownerType: 'Servicio Público' },
    { name: 'Wall Street Journal', url: 'https://www.wsj.com/',              country: 'USA',     lang: 'en', accent: 'indigo', bias: 'center-right', factuality: 'high',   owner: 'News Corp (Murdoch)',                ownerType: 'Corporación' },
    { name: 'Reuters',            url: 'https://www.reuters.com/',           country: 'Global',  lang: 'en', accent: 'indigo', bias: 'center',       factuality: 'high',   owner: 'Thomson Reuters',                    ownerType: 'Corporación' },
    { name: 'Associated Press',   url: 'https://apnews.com/',                country: 'USA',     lang: 'en', accent: 'indigo', bias: 'center',       factuality: 'high',   owner: 'AP (Cooperativa)',                   ownerType: 'Sin Fines de Lucro' },
    { name: 'Al Jazeera',         url: 'https://www.aljazeera.com/',         country: 'Qatar',   lang: 'en', accent: 'indigo', bias: 'center',       factuality: 'high',   owner: 'Gobierno de Qatar',                  ownerType: 'Estatal' },
    { name: 'The Times',          url: 'https://www.thetimes.co.uk/',        country: 'UK',      lang: 'en', accent: 'indigo', bias: 'center-right', factuality: 'high',   owner: 'News UK (Murdoch)',                  ownerType: 'Corporación' },
    { name: 'CNN Intl.',          url: 'https://edition.cnn.com/',           country: 'USA',     lang: 'en', accent: 'indigo', bias: 'center',       factuality: 'high',   owner: 'Warner Bros. Discovery',             ownerType: 'Corporación' },
    { name: 'TechCrunch',         url: 'https://techcrunch.com/',            country: 'Technology', lang: 'en', accent: 'indigo', bias: 'center',     factuality: 'high',   owner: 'Yahoo (Apollo Global)',              ownerType: 'Corporación', tech: true },
    { name: 'The Verge',          url: 'https://www.theverge.com/',          country: 'Technology', lang: 'en', accent: 'indigo', bias: 'center',     factuality: 'medium', owner: 'Vox Media',                           ownerType: 'Corporación', tech: true },
    { name: 'Wired',              url: 'https://www.wired.com/',             country: 'Technology', lang: 'en', accent: 'indigo', bias: 'center',     factuality: 'high',   owner: 'Condé Nast',                         ownerType: 'Corporación', tech: true },
    { name: 'Engadget',           url: 'https://www.engadget.com/',          country: 'Technology', lang: 'en', accent: 'indigo', bias: 'center',     factuality: 'medium', owner: 'Yahoo (Apollo Global)',              ownerType: 'Corporación', tech: true },
    { name: 'Ars Technica',       url: 'https://arstechnica.com/',           country: 'Technology', lang: 'en', accent: 'indigo', bias: 'center',     factuality: 'high',   owner: 'Condé Nast',                         ownerType: 'Corporación', tech: true },
    { name: 'Bloomberg',          url: 'https://www.bloomberg.com/',         country: 'Finance / Tech', lang: 'en', accent: 'indigo', bias: 'center',   factuality: 'high',   owner: 'Bloomberg L.P.',                     ownerType: 'Corporación', tech: true },
    { name: 'Forbes',             url: 'https://www.forbes.com/',            country: 'Business / Tech', lang: 'en', accent: 'indigo', bias: 'center',   factuality: 'medium', owner: 'Integrated Whale Media',              ownerType: 'Corporación', tech: true },
    { name: 'CNBC',               url: 'https://www.cnbc.com/',              country: 'Business / Tech', lang: 'en', accent: 'indigo', bias: 'center',   factuality: 'high',   owner: 'NBCUniversal (Comcast)',             ownerType: 'Corporación', tech: true },
    { name: 'The Independent',    url: 'https://www.independent.co.uk/',     country: 'UK',      lang: 'en', accent: 'indigo', bias: 'center',       factuality: 'high',   owner: 'Independent Digital News',            ownerType: 'Independiente' },
    { name: 'Financial Times',    url: 'https://www.ft.com/',                country: 'Global',  lang: 'en', accent: 'indigo', bias: 'center',       factuality: 'high',   owner: 'Nikkei',                             ownerType: 'Corporación' },

    // ==================== CHINA ====================
    { name: 'CGTN',              url: 'https://www.cgtn.com/',             country: 'China',   lang: 'en', accent: 'indigo', bias: 'center-right', factuality: 'medium', owner: 'China Media Group',                  ownerType: 'Estatal' },
    { name: 'Xinhua',            url: 'https://english.news.cn/',          country: 'China',   lang: 'en', accent: 'indigo', bias: 'center-right', factuality: 'medium', owner: 'Agencia de Noticias Xinhua',          ownerType: 'Estatal' },
    { name: 'China Daily',       url: 'https://www.chinadaily.com.cn/',    country: 'China',   lang: 'en', accent: 'indigo', bias: 'center-right', factuality: 'medium', owner: 'Gobierno de China',                   ownerType: 'Estatal' },
    { name: 'Global Times',      url: 'https://www.globaltimes.cn/',       country: 'China',   lang: 'en', accent: 'indigo', bias: 'right',        factuality: 'medium', owner: "People's Daily (PCC)",                ownerType: 'Estatal' },

    // ==================== IRÁN ====================
    { name: 'Press TV',          url: 'https://www.presstv.ir/',           country: 'Irán',    lang: 'en', accent: 'indigo', bias: 'right',        factuality: 'low',    owner: 'IRIB (Gobierno de Irán)',            ownerType: 'Estatal' },
    { name: 'Tehran Times',      url: 'https://www.tehrantimes.com/',      country: 'Irán',    lang: 'en', accent: 'indigo', bias: 'center-right', factuality: 'medium', owner: 'Gobierno de Irán',                    ownerType: 'Estatal' },
    { name: 'Tasnim',            url: 'https://www.tasnimnews.com/en',     country: 'Irán',    lang: 'en', accent: 'indigo', bias: 'right',        factuality: 'low',    owner: 'IRGC (Guardia Revolucionaria)',       ownerType: 'Estatal' },

    // ==================== RUSIA ====================
    { name: 'RT',                url: 'https://www.rt.com/',               country: 'Rusia',   lang: 'en', accent: 'indigo', bias: 'right',        factuality: 'low',    owner: 'Gobierno de Rusia',                  ownerType: 'Estatal' },
    { name: 'TASS',              url: 'https://tass.com/',                 country: 'Rusia',   lang: 'en', accent: 'indigo', bias: 'center-right', factuality: 'medium', owner: 'Estado ruso',                        ownerType: 'Estatal' },
    { name: 'Sputnik',           url: 'https://sputnikglobe.com/',         country: 'Rusia',   lang: 'en', accent: 'indigo', bias: 'right',        factuality: 'low',    owner: 'Rossiya Segodnya',                   ownerType: 'Estatal' },
];

// Normalizar: si bias comienza con 'center' lo agrupamos como 'center' para las barras
const biasGroup = (b) => {
    if (b === 'left' || b === 'center-left') return 'left';
    if (b === 'right' || b === 'center-right') return 'right';
    return 'center';
};

// Etiqueta legible de sesgo
const biasLabelMap = {
    'left': 'Izquierda',
    'center-left': 'Centroizquierda',
    'center': 'Centro',
    'center-right': 'Centroderecha',
    'right': 'Derecha',
};

// Etiqueta legible de factualidad
const factLabelMap = {
    'high': 'Alta',
    'medium': 'Media',
    'low': 'Baja',
};

// Mapa de clases Tailwind estáticas por color de acento.
// Se definen como literales completos para que el escáner de
// Tailwind pueda detectarlas en los templates JS.
const ACCENT_CLASSES = {
    blue: {
        badge: 'text-blue-700 dark:text-blue-300',
        hover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
        link: 'text-blue-500 dark:text-blue-400',
        head: 'text-blue-700 dark:text-blue-300',
        sub: 'text-blue-400 dark:text-blue-500',
    },
    indigo: {
        badge: 'text-indigo-700 dark:text-indigo-300',
        hover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
        link: 'text-indigo-500 dark:text-indigo-400',
        head: 'text-indigo-700 dark:text-indigo-300',
        sub: 'text-indigo-400 dark:text-indigo-500',
    },
    cyan: {
        badge: 'text-cyan-700 dark:text-cyan-300',
        hover: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
        link: 'text-cyan-500 dark:text-cyan-400',
        head: 'text-cyan-700 dark:text-cyan-300',
        sub: 'text-cyan-400 dark:text-cyan-500',
    },
    violet: {
        badge: 'text-violet-700 dark:text-violet-300',
        hover: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
        link: 'text-violet-500 dark:text-violet-400',
        head: 'text-violet-700 dark:text-violet-300',
        sub: 'text-violet-400 dark:text-violet-500',
    },
    emerald: {
        badge: 'text-emerald-700 dark:text-emerald-300',
        hover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
        link: 'text-emerald-500 dark:text-emerald-400',
        head: 'text-emerald-700 dark:text-emerald-300',
        sub: 'text-emerald-400 dark:text-emerald-500',
    },
    amber: {
        badge: 'text-amber-700 dark:text-amber-300',
        hover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
        link: 'text-amber-500 dark:text-amber-400',
        head: 'text-amber-700 dark:text-amber-300',
        sub: 'text-amber-400 dark:text-amber-500',
    },
    slate: {
        badge: 'text-slate-700 dark:text-slate-300',
        hover: 'group-hover:text-slate-600 dark:group-hover:text-slate-400',
        link: 'text-slate-500 dark:text-slate-400',
        head: 'text-slate-700 dark:text-slate-300',
        sub: 'text-slate-400 dark:text-slate-500',
    },
    red: {
        badge: 'text-red-700 dark:text-red-300',
        hover: 'group-hover:text-red-600 dark:group-hover:text-red-400',
        link: 'text-red-500 dark:text-red-400',
        head: 'text-red-700 dark:text-red-300',
        sub: 'text-red-400 dark:text-red-500',
    },
};

const SEGMENT_CLASSES = {
    blue: {
        dot: 'bg-blue-500',
        border: 'border-blue-200 dark:border-blue-800',
        head: 'text-blue-700 dark:text-blue-300',
        sub: 'text-blue-400 dark:text-blue-500',
    },
    slate: {
        dot: 'bg-slate-500',
        border: 'border-slate-200 dark:border-slate-800',
        head: 'text-slate-700 dark:text-slate-300',
        sub: 'text-slate-400 dark:text-slate-500',
    },
    red: {
        dot: 'bg-red-500',
        border: 'border-red-200 dark:border-red-800',
        head: 'text-red-700 dark:text-red-300',
        sub: 'text-red-400 dark:text-red-500',
    },
};

// Clases de hover/borde para las tarjetas del directorio (solo ES/EN)
const CARD_META = {
    blue: {
        arrow: 'group-hover:text-blue-500',
        hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-500/50',
    },
    indigo: {
        arrow: 'group-hover:text-indigo-500',
        hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-500/50',
    },
};

// ============================================================
// CONFIGURACIÓN DE FEEDS RSS
// ============================================================
const RSS_CONFIG = {
    ticker: 'https://www.clarin.com/rss/lo-ultimo/',
    hero: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    grids: [
        { container: 'grid-noticias-es', accent: 'blue', items: 8, max: 20, label: 'artículos', urls: [
            { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', bias: 'left' },
            { url: 'https://www.20minutos.es/rss/', bias: 'center' },
            { url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', bias: 'right' },
            { url: 'https://www.clarin.com/rss/lo-ultimo/', bias: 'right' },
            { url: 'https://www.abc.es/rss/feeds/abc_ultima.xml', bias: 'right' },
        ]},
        { container: 'grid-noticias-en', accent: 'indigo', items: 10, max: 20, label: 'articles', urls: [
            { url: 'https://www.theguardian.com/world/rss', bias: 'left' },
            { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', bias: 'center' },
            { url: 'https://feeds.skynews.com/feeds/rss/home.xml', bias: 'center' },
            { url: 'https://moxie.foxnews.com/google-publisher/latest.xml', bias: 'right' },
        ]},
        { container: 'grid-noticias-es-tech', accent: 'cyan', items: 8, max: 15, label: 'artículos', urls: [
            { url: 'https://www.20minutos.es/rss/tecnologia/', bias: 'center' },
            { url: 'https://www.xataka.com/feed.xml', bias: 'center' },
        ]},
        { container: 'grid-noticias-en-tech', accent: 'violet', items: 8, max: 15, label: 'articles', urls: [
            { url: 'https://techcrunch.com/feed/', bias: 'center' },
            { url: 'https://www.wired.com/feed/rss', bias: 'center' },
        ]},
        { container: 'grid-noticias-ciencia', accent: 'emerald', items: 6, max: 12, label: 'artículos', urls: [
            { url: 'https://www.sciencedaily.com/rss/all.xml', bias: 'center' },
            { url: 'https://www.newscientist.com/feed/home', bias: 'center' },
        ]},
        { container: 'grid-noticias-economia', accent: 'amber', items: 6, max: 12, label: 'artículos', urls: [
            { url: 'https://feeds.bloomberg.com/markets/news.rss', bias: 'center' },
            { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml', bias: 'center-left' },
            { url: 'https://www.forbes.com/feed/rss', bias: 'right' },
        ]},
    ],
    espectro: {
        izquierda: ['https://www.theguardian.com/world/rss'],
        centro:    ['https://feeds.bbci.co.uk/news/world/rss.xml', 'https://www.xataka.com/feed.xml'],
        derecha:   ['https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', 'https://www.abc.es/rss/feeds/abc_ultima.xml'],
    },
};

// ============================================================
// CONFIGURACIÓN DE TRANSMISIONES EN VIVO (YouTube Live)
// Cada entrada embebe el stream en vivo actual del canal con
// youtube.com/embed/live_stream?channel=<channelId>. Si el canal
// no está emitiendo, el reproductor muestra aviso y el botón
// "Abrir en YouTube" redirige al canal.
// ============================================================
const LIVE_CONFIG = {
    es: [
        { name: 'RTVE Noticias · 24H', channelId: 'UC7QZIf0dta-XPXsp9Hv4dTw', accent: 'blue',   bias: 'center', country: 'España' },
        { name: 'CNN en Español',      channelId: 'UC_lEiu6917IJz03TnntWUaQ', accent: 'blue',   bias: 'center', country: 'Global' },
        { name: 'DW Español',          channelId: 'UCT4Jg8h03dD0iN3Pb5L0PMA', accent: 'blue',   bias: 'center', country: 'Alemania' },
        { name: 'Agencia EFE',         channelId: 'UCvJS-YNyaWyOucx8bGrHVvw', accent: 'blue',   bias: 'center', country: 'España' },
        { name: 'FRANCE 24 Español',   channelId: 'UCUdOoVWuWmgo1wByzcsyKDQ', accent: 'blue',   bias: 'center', country: 'Francia' },
        { name: 'teleSUR En Vivo',     channelId: 'UCZSdNK_ZmMQcLTz-obKr-Dw', accent: 'blue',   bias: 'left',   country: 'Venezuela' },
    ],
    en: [
        { name: 'BBC News',            channelId: 'UC16niRr50-MSBwiO3YDb3RA', accent: 'indigo', bias: 'center', country: 'Reino Unido' },
        { name: 'Sky News',            channelId: 'UCoMdktPbSTixAyNGwb-UYkQ', accent: 'indigo', bias: 'center', country: 'Reino Unido' },
        { name: 'Al Jazeera English',  channelId: 'UCNye-wNBqNL5ZzHSJj3l8Bg', accent: 'indigo', bias: 'center', country: 'Catar' },
        { name: 'France 24 English',   channelId: 'UCQfwfsi5VrQ8yKZ-UWmAEFg', accent: 'indigo', bias: 'center', country: 'Francia' },
        { name: 'DW News',             channelId: 'UCknLrEdhRCp1aegoMqRaCZg', accent: 'indigo', bias: 'center', country: 'Alemania' },
        { name: 'Bloomberg Television',channelId: 'UCIALMKvObZNtJ6AmdCLP7Lg', accent: 'indigo', bias: 'center', country: 'EE. UU.' },
        { name: 'CNN',                 channelId: 'UCupvZG-5ko_eiXAupbDfxWw', accent: 'indigo', bias: 'center', country: 'EE. UU.' },
        { name: 'teleSUR English',     channelId: 'UCmuTmpLY35O3csvhyA6vrkg', accent: 'indigo', bias: 'left',   country: 'Venezuela' },
    ],
};