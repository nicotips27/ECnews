/* ============================================================
   ECNEWS · RSS
   Capa de feeds resiliente. Para cada URL intenta, en orden:
   1) Caché en sessionStorage (10 min)
   2) Fetch directo (solo en feeds con Access-Control-Allow-Origin)
   3) Proxy CORS (api.cors.lol)
   4) rss2json (api.rss2json.com)

   Todo se normaliza al mismo formato que devolvía rss2json:
   { status, feed: { title }, items: [{ title, link, pubDate, description, thumbnail }] }
   ============================================================ */

const RSS_CACHE_TTL = 10 * 60 * 1000;
const RSS_CACHE_PREFIX = 'ecnews-rss:';

// Feeds verificados con CORS abierto: se piden directo, sin proxy.
const CORS_FEEDS = new Set([
    'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
    'https://moxie.foxnews.com/google-publisher/latest.xml',
    'https://www.wired.com/feed/rss',
    'https://techcrunch.com/feed/',
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
    'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    'https://www.cnbc.com/id/19832390/device/rss/rss.html',
    'https://feeds.marketwatch.com/marketwatch/topstories/',
    'https://www.nasa.gov/rss/dyn/breaking_news.rss',
]);

// ============================================================
// PARSEO DE XML
// ============================================================
const nodeText = (node) => (node && node.textContent ? node.textContent.trim() : '');

const parseRSSXml = (xmlText) => {
    if (!xmlText || xmlText.indexOf('<') === -1) return null;

    let doc;
    try {
        doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    } catch (e) {
        return null;
    }
    if (!doc || doc.getElementsByTagName('parsererror').length) return null;

    const channel = doc.getElementsByTagName('channel')[0];
    const feedTitle = channel ? nodeText(channel.getElementsByTagName('title')[0]) : '';

    const nodes = doc.getElementsByTagName('item');
    const items = [];

    for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i];
        const title = nodeText(item.getElementsByTagName('title')[0]);
        if (!title) continue;

        let link = nodeText(item.getElementsByTagName('link')[0]);
        if (!link) link = nodeText(item.getElementsByTagName('guid')[0]);

        const description = nodeText(item.getElementsByTagName('description')[0]);

        let thumbnail = '';
        const mediaContent = item.getElementsByTagName('media:content')[0];
        if (mediaContent) thumbnail = mediaContent.getAttribute('url') || '';
        if (!thumbnail) {
            const mediaThumb = item.getElementsByTagName('media:thumbnail')[0];
            if (mediaThumb) thumbnail = mediaThumb.getAttribute('url') || '';
        }
        if (!thumbnail) {
            const enclosure = item.getElementsByTagName('enclosure')[0];
            if (enclosure) thumbnail = enclosure.getAttribute('url') || '';
        }
        if (!thumbnail) {
            const imgs = item.getElementsByTagName('img');
            if (imgs.length) thumbnail = imgs[0].getAttribute('src') || '';
        }

        items.push({
            title,
            link,
            pubDate: nodeText(item.getElementsByTagName('pubDate')[0]),
            description,
            thumbnail,
        });
    }

    return { status: 'ok', feed: { title: feedTitle }, items };
};

// ============================================================
// PETICIONES
// ============================================================
const fetchWithTimeout = async (url, ms) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms || 9000);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res;
    } finally {
        clearTimeout(timer);
    }
};

const fetchRSS = async (url) => {
    const cacheKey = RSS_CACHE_PREFIX + url;

    try {
        const cached = JSON.parse(sessionStorage.getItem(cacheKey));
        if (cached && Date.now() - cached.ts < RSS_CACHE_TTL) return cached.data;
    } catch (e) { /* almacenamiento no disponible */ }

    const attempts = [];
    if (CORS_FEEDS.has(url)) attempts.push({ mode: 'xml', url });
    attempts.push({ mode: 'xml', url: 'https://api.cors.lol/?url=' + encodeURIComponent(url) });
    attempts.push({ mode: 'json', url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(url) });

    for (let i = 0; i < attempts.length; i++) {
        const attempt = attempts[i];
        try {
            const res = await fetchWithTimeout(attempt.url, 9000);
            const text = await res.text();
            let data = null;

            if (attempt.mode === 'json') {
                const json = JSON.parse(text);
                data = (json && json.status === 'ok' && json.items && json.items.length) ? json : null;
            } else {
                data = parseRSSXml(text);
            }

            if (data && data.items && data.items.length) {
                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
                } catch (e) { /* cuota superada */ }
                return data;
            }
        } catch (e) { /* siguiente intento */ }
    }

    return { status: 'error', feed: { title: '' }, items: [] };
};

// Fusiona varias fuentes en un solo resultado
const fetchRSSMany = async (urls) => {
    const list = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
    if (!list.length) return { status: 'error', feed: { title: '' }, items: [] };

    const results = await Promise.all(list.map(fetchRSS));
    const items = [];

    results.forEach((data, i) => {
        if (data && data.status === 'ok' && data.items) {
            data.items.forEach(item => items.push({ ...item, source: data.feed.title || 'Agencia', sourceUrl: list[i] }));
        }
    });

    const first = results.find(d => d && d.feed && d.feed.title);
    return { status: items.length ? 'ok' : 'error', feed: { title: first ? first.feed.title : '' }, items };
};
