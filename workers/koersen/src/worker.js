// Koersen-proxy voor de Investeren-app: zoekt aandelen/ETF's en haalt koersen op bij Yahoo Finance.
// Alleen-lezen, geen sleutels. Bedragen worden in EUR omgerekend (via Yahoo-wisselkoersen).
const YF = "https://query2.finance.yahoo.com";
const SYM = /^[A-Za-z0-9.\-=^]{1,24}$/;
const RANGES = new Set(["5d", "1mo", "3mo", "6mo", "1y", "2y", "5y"]);
const TYPES = new Set(["EQUITY", "ETF", "MUTUALFUND", "INDEX"]);

const cors = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, OPTIONS" };
const json = (body, status = 200, maxAge = 300) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${maxAge}` },
});

async function yahoo(path) {
  const res = await fetch(YF + path, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; InvesterenKoersen/1.0)", accept: "application/json" },
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`Yahoo gaf ${res.status}`);
  return res.json();
}

async function zoek(q) {
  const j = await yahoo(`/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=12&newsCount=0&listsCount=0`);
  return (j.quotes || [])
    .filter(x => x.symbol && TYPES.has(x.quoteType))
    .map(x => ({
      symbol: x.symbol,
      name: x.longname || x.shortname || x.symbol,
      exchange: x.exchDisp || x.exchange || "",
      type: x.typeDisp || x.quoteType,
    }));
}

const day = ts => new Date(ts * 1000).toISOString().slice(0, 10);

async function chart(symbol, range) {
  const j = await yahoo(`/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d`);
  const r = j.chart && j.chart.result && j.chart.result[0];
  if (!r) throw new Error(`Geen koers voor ${symbol}`);
  const closes = (r.indicators && r.indicators.quote && r.indicators.quote[0] && r.indicators.quote[0].close) || [];
  const hist = [];
  (r.timestamp || []).forEach((ts, i) => { if (closes[i] != null) hist.push({ date: day(ts), close: closes[i] }); });
  return { meta: r.meta || {}, hist };
}

// Valuta → EUR-factor per dag. GBp (pence) = GBP / 100.
async function fxSeries(currency, range) {
  let cur = (currency || "EUR").toUpperCase(), scale = 1;
  if (currency === "GBp" || currency === "GBX") { cur = "GBP"; scale = 0.01; }
  if (currency === "ZAc" || currency === "ILA") { cur = currency === "ZAc" ? "ZAR" : "ILS"; scale = 0.01; }
  if (cur === "EUR") return { now: scale, at: () => scale };
  const { meta, hist } = await chart(`${cur}EUR=X`, range);
  const now = (meta.regularMarketPrice || (hist.length ? hist[hist.length - 1].close : null));
  if (!now) throw new Error(`Geen wisselkoers ${cur}/EUR`);
  return {
    now: now * scale,
    at: date => {
      let v = null;
      for (const h of hist) { if (h.date <= date) v = h.close; else break; }
      return (v || now) * scale;
    },
  };
}

async function koers(symbol, range) {
  const { meta, hist } = await chart(symbol, range);
  let price = meta.regularMarketPrice ?? (hist.length ? hist[hist.length - 1].close : null);
  if (price == null) throw new Error(`Geen koers voor ${symbol}`);
  // Voor- en nabeurs: neem de laatste koers als die nieuwer is dan de slotkoers (zelfde bron als de live stream in de app).
  let extTime = null;
  try {
    const x = await rawPrice(symbol);
    if (x.time && meta.regularMarketTime && x.time > meta.regularMarketTime + 60) { price = x.price; extTime = x.time; }
  } catch (e) { /* slotkoers blijft staan */ }
  const fx = await fxSeries(meta.currency, range);
  // Vorige slotkoers: laatste dagbalk vóór de huidige handelsdag (chartPreviousClose ligt vóór het hele bereik).
  const marketDay = meta.regularMarketTime ? day(meta.regularMarketTime) : null;
  const before = hist.filter(h => !marketDay || h.date < marketDay);
  const prev = before.length ? before[before.length - 1].close : null;
  return {
    symbol: meta.symbol || symbol,
    name: meta.longName || meta.shortName || symbol,
    currency: meta.currency || "EUR",
    exchange: meta.fullExchangeName || meta.exchangeName || "",
    price,
    priceEur: price * fx.now,
    previousCloseEur: prev != null ? prev * fx.now : null,
    marketTime: (extTime || meta.regularMarketTime) ? new Date((extTime || meta.regularMarketTime) * 1000).toISOString() : null,
    extended: !!extTime,
    history: hist.map(h => ({ date: h.date, eur: +(h.close * fx.at(h.date)).toFixed(6) })),
  };
}

// Koersgrafiek van één product in de eigen valuta (aandelen, ETF's, fondsen, crypto, grondstoffen).
const GRAPH = {
  "1d": { interval: "5m", ttl: 60, prepost: true },
  "5d": { interval: "15m", ttl: 120, prepost: true },
  "1mo": { interval: "60m", ttl: 600 },
  "3mo": { interval: "1d", ttl: 1800 },
  "6mo": { interval: "1d", ttl: 1800 },
  "1y": { interval: "1d", ttl: 3600 },
  "5y": { interval: "1wk", ttl: 21600 },
  "max": { interval: "1mo", ttl: 21600 },
};
async function grafiek(symbol, range) {
  const g = GRAPH[range];
  const res = await fetch(`${YF}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${g.interval}${g.prepost ? "&includePrePost=true" : ""}`, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; InvesterenKoersen/1.0)", accept: "application/json" },
    cf: { cacheTtl: g.ttl, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`Yahoo gaf ${res.status}`);
  const j = await res.json();
  const r = j.chart && j.chart.result && j.chart.result[0];
  if (!r) throw new Error(`Geen koers voor ${symbol}`);
  const closes = (r.indicators && r.indicators.quote && r.indicators.quote[0] && r.indicators.quote[0].close) || [];
  const points = [];
  (r.timestamp || []).forEach((ts, i) => { if (closes[i] != null) points.push([ts, +closes[i].toFixed(6)]); });
  const m = r.meta || {};
  return {
    symbol: m.symbol || symbol, name: m.longName || m.shortName || symbol, currency: m.currency || "EUR",
    exchange: m.fullExchangeName || m.exchangeName || "", price: m.regularMarketPrice ?? null,
    previousClose: m.chartPreviousClose ?? m.previousClose ?? null,
    marketTime: m.regularMarketTime ? new Date(m.regularMarketTime * 1000).toISOString() : null,
    range, interval: g.interval, points, ttl: g.ttl,
  };
}

// ── Dagverloop (cron, elke 5 minuten): totale waarde doorrekenen en opslaan, ook als de app dicht is ──
// De app publiceert een recept (portfolio/id 'intraday-recipe': totaal + aantallen per symbool). Bij een nieuw recept
// leggen we de koersen van dat moment vast als referentie; daarna: totaal + Σ aantal × (koers nu − referentie), in euro.
const INTRA_STEP = 300, INTRA_KEEP = 8 * 86400;
async function sb(env, method, path, body) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    method, body: body ? JSON.stringify(body) : undefined,
    headers: { apikey: env.SUPABASE_ANON_KEY, authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, "content-type": "application/json", prefer: "resolution=merge-duplicates,return=minimal" },
  });
  if (!res.ok) throw new Error(`Supabase ${method} ${res.status}`);
  return method === "GET" ? res.json() : null;
}
async function rawPrice(symbol) {
  const res = await fetch(`${YF}/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m&includePrePost=true`, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; InvesterenKoersen/1.0)", accept: "application/json" }, cf: { cacheTtl: 60, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`Yahoo ${res.status}`);
  const r = (await res.json()).chart?.result?.[0];
  if (!r) throw new Error("geen data");
  const closes = r.indicators?.quote?.[0]?.close || [];
  const stamps = r.timestamp || [];
  let last = null, time = null; for (let i = closes.length - 1; i >= 0; i--) if (closes[i] != null) { last = closes[i]; time = stamps[i] || null; break; }
  const price = last ?? r.meta?.regularMarketPrice;
  if (!(price > 0)) throw new Error("geen koers");
  return { price, time, currency: r.meta?.currency || "EUR" };
}
async function eurPrices(symbols) {
  const raw = {};
  await Promise.all(symbols.map(async s => { try { raw[s] = await rawPrice(s); } catch (e) { /* overslaan */ } }));
  const fx = { EUR: 1 }, scale = {};
  const curOf = c => (c === "GBp" || c === "GBX" ? ["GBP", 0.01] : c === "ZAc" ? ["ZAR", 0.01] : c === "ILA" ? ["ILS", 0.01] : [String(c).toUpperCase(), 1]);
  const need = [...new Set(Object.values(raw).map(r => curOf(r.currency)[0]))].filter(c => c !== "EUR");
  await Promise.all(need.map(async c => { try { fx[c] = (await rawPrice(`${c}EUR=X`)).price; } catch (e) { /* overslaan */ } }));
  const out = {};
  for (const [s, r] of Object.entries(raw)) { const [c, k] = curOf(r.currency); if (fx[c] > 0) out[s] = r.price * k * fx[c]; }
  return out;
}
async function intradayTick(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return "geen configuratie";
  const rows = await sb(env, "GET", "portfolio?id=in.(intraday,intraday-recipe,intraday-ref)&select=id,data");
  const get = id => (rows.find(r => r.id === id) || {}).data || null;
  const recipe = get("intraday-recipe");
  if (!recipe || !(recipe.total > 0) || !Array.isArray(recipe.items)) return "geen recept";
  // Recept ouder dan 14 dagen: niet meer doorrekenen (aantallen kunnen verouderd zijn).
  if (Date.now() - Date.parse(recipe.asOf) > 14 * 86400e3) return "recept te oud";
  const prices = await eurPrices(recipe.items.map(i => i.s));
  let ref = get("intraday-ref");
  if (!ref || ref.asOf !== recipe.asOf) {
    ref = { asOf: recipe.asOf, prices };
    await sb(env, "POST", "portfolio?on_conflict=id", { id: "intraday-ref", data: ref });
  }
  let total = recipe.total;
  for (const it of recipe.items) {
    const now = prices[it.s], was = ref.prices[it.s];
    if (now > 0 && was > 0) total += it.q * (now - was);
    else if (now > 0 && !(was > 0)) { ref.prices[it.s] = now; }
  }
  const t = Math.floor(Date.now() / 1000);
  const map = new Map();
  for (const p of [...((get("intraday") || {}).points || []), [t, Math.round(total * 100) / 100, recipe.net || 0]]) {
    if (Array.isArray(p) && p[0] > t - INTRA_KEEP && Number.isFinite(+p[1])) map.set(Math.floor(p[0] / INTRA_STEP), p);
  }
  const points = [...map.values()].sort((a, b) => a[0] - b[0]);
  await sb(env, "POST", "portfolio?on_conflict=id", { id: "intraday", data: { points } });
  return `ok ${points.length} punten, ${Object.keys(prices).length}/${recipe.items.length} koersen`;
}


// ── Nieuws: meerdere bronnen samengevoegd (RSS, geen sleutels) ──
const NEWS_FEEDS = [
  { id: "cnbc", name: "CNBC", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html" },
  { id: "cnbc-markets", name: "CNBC", url: "https://www.cnbc.com/id/20910258/device/rss/rss.html" },
  { id: "marketwatch", name: "MarketWatch", url: "https://feeds.content.dowjones.io/public/rss/mw_topstories" },
  { id: "marketwatch-pulse", name: "MarketWatch", url: "https://feeds.content.dowjones.io/public/rss/mw_marketpulse" },
  { id: "seekingalpha", name: "Seeking Alpha", url: "https://seekingalpha.com/market_currents.xml" },
  { id: "investing", name: "Investing.com", url: "https://www.investing.com/rss/news_25.rss" },
  { id: "bloomberg", name: "Bloomberg", url: "https://feeds.bloomberg.com/markets/news.rss" },
  { id: "ft", name: "Financial Times", url: "https://www.ft.com/markets?format=rss" },
  { id: "nos", name: "NOS Economie", url: "https://feeds.nos.nl/nosnieuwseconomie" },
];
const decodeXml = t => String(t || "")
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&amp;/g, "&");
const stripHtml = t => decodeXml(t).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
function rssItems(xml) {
  const out = [];
  for (const m of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)) {
    const b = m[1];
    const tag = n => { const r = b.match(new RegExp(`<${n}\\b[^>]*>([\\s\\S]*?)<\\/${n}>`)); return r ? r[1] : ""; };
    const src = b.match(/<source\b[^>]*>([\s\S]*?)<\/source>/);
    const img = b.match(/<media:(?:content|thumbnail)\b[^>]*url="([^"]+)"/) || b.match(/<enclosure\b[^>]*url="([^"]+)"[^>]*type="image/);
    let title = stripHtml(tag("title"));
    const publisher = src ? stripHtml(src[1]) : null;
    if (publisher && title.endsWith(" - " + publisher)) title = title.slice(0, -(publisher.length + 3));
    const link = decodeXml(tag("link")).trim() || decodeXml(tag("guid")).trim();
    const t = Date.parse(stripHtml(tag("pubDate")) || stripHtml(tag("dc:date")));
    const desc = stripHtml(tag("description")).slice(0, 320);
    if (title && link) out.push({ title, link, publisher, time: isNaN(t) ? null : new Date(t).toISOString(), summary: desc && desc !== title ? desc : "", image: img ? decodeXml(img[1]) : null });
  }
  return out;
}
async function feed(url, ttl = 300) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; InvesterenNieuws/1.0)", accept: "application/rss+xml, application/xml, text/xml" }, cf: { cacheTtl: ttl, cacheEverything: true } });
  if (!res.ok) throw new Error(`${res.status}`);
  return rssItems(await res.text());
}
const normTitle = t => t.toLowerCase().replace(/[^a-z0-9à-ÿ ]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
async function nieuws(symbols, names) {
  const jobs = NEWS_FEEDS.map(f => ({ src: f.name, id: f.id, url: f.url, syms: null }));
  // Per aandeel: Yahoo Finance (tickerfeed) en Google Nieuws op bedrijfsnaam.
  for (let i = 0; i < symbols.length; i += 8) {
    const part = symbols.slice(i, i + 8);
    jobs.push({ src: "Yahoo Finance", id: "yahoo", url: `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${part.map(encodeURIComponent).join(",")}&region=US&lang=en-US`, syms: part.length === 1 ? part : null });
  }
  // Nasdaq per aandeel (alleen Amerikaanse tickers zonder beurs-achtervoegsel).
  symbols.filter(s => /^[A-Z]{1,5}$/.test(s)).slice(0, 8).forEach(s => {
    jobs.push({ src: "Nasdaq", id: "nasdaq", url: `https://www.nasdaq.com/feed/rssoutbound?symbol=${encodeURIComponent(s)}`, syms: [s], limit: 12 });
  });
  const res = await Promise.allSettled(jobs.map(j => feed(j.url)));
  const seen = new Map(), sources = {};
  // Herkennen welke van jouw aandelen in een kop voorkomen (naam of ticker).
  const matchers = symbols.map((s, i) => {
    const base = s.split(/[.\-=]/)[0];
    const nm = (names[i] || "").replace(/,?\s+(inc|corp(oration)?|n\.?v\.?|plc|ltd|limited|holding(s)?|group|se|ag|sa|co)\.?$/i, "").trim();
    const parts = [nm.length >= 3 ? escRe(nm) : null, base.length >= 3 ? `\\$?${escRe(base)}` : null].filter(Boolean);
    return { s, re: parts.length ? new RegExp(`\\b(${parts.join("|")})\\b`, "i") : null };
  });
  res.forEach((r, k) => {
    const j = jobs[k];
    sources[j.id] = r.status === "fulfilled" ? (sources[j.id] || 0) + r.value.length : (sources[j.id] || 0);
    if (r.status !== "fulfilled") return;
    for (const it of r.value.slice(0, j.limit || 40)) {
      const key = normTitle(it.title);
      const tagged = new Set(j.syms || []);
      for (const m of matchers) if (m.re && m.re.test(it.title)) tagged.add(m.s);
      const prev = seen.get(key);
      if (prev) { tagged.forEach(x => prev.symbols.includes(x) || prev.symbols.push(x)); if (!prev.sources.includes(j.src)) prev.sources.push(j.src); continue; }
      seen.set(key, { ...it, source: it.publisher || j.src, via: j.src, sources: [j.src], symbols: [...tagged] });
    }
  });
  const cutoff = Date.now() - 4 * 86400 * 1000;
  const items = [...seen.values()].filter(x => !x.time || Date.parse(x.time) > cutoff)
    .sort((a, b) => (b.time || "").localeCompare(a.time || "")).slice(0, 200);
  return { items, sources, fetchedAt: new Date().toISOString() };
}

// ── Grote bewegers in de 500 grootste beursbedrijven ter wereld + meldingen via ntfy (iPhone-app ntfy) ──
async function top500() {
  const res = await fetch("https://companiesmarketcap.com/?download=csv", { headers: { "user-agent": "Mozilla/5.0" }, cf: { cacheTtl: 86400, cacheEverything: true } });
  if (!res.ok) throw new Error(`lijst ${res.status}`);
  const rows = (await res.text()).split("\n").slice(1);
  const out = [];
  for (const line of rows) {
    const c = [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(m => m[1].replace(/""/g, '"'));
    if (c.length < 6 || !SYM.test(c[2])) continue;
    out.push({ rank: +c[0], name: c[1], symbol: c[2], mcapUsd: +c[3], country: c[5] });
    if (out.length >= 500) break;
  }
  return out;
}
async function sparkQuotes(symbols) {
  const out = {};
  const parts = [];
  for (let i = 0; i < symbols.length; i += 20) parts.push(symbols.slice(i, i + 20));
  await Promise.all(parts.map(async part => {
    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v7/finance/spark?symbols=${part.map(encodeURIComponent).join(",")}&range=1d&interval=1d`, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; InvesterenKoersen/1.0)", accept: "application/json" }, cf: { cacheTtl: 120, cacheEverything: true },
      });
      if (!res.ok) return;
      const j = await res.json();
      for (const r of (j.spark && j.spark.result) || []) {
        const m = r.response && r.response[0] && r.response[0].meta;
        if (!m || !(m.regularMarketPrice > 0)) continue;
        const prev = m.chartPreviousClose || m.previousClose;
        const chg = m.regularMarketChangePercent != null ? m.regularMarketChangePercent : (prev > 0 ? (m.regularMarketPrice / prev - 1) * 100 : null);
        if (chg == null || !isFinite(chg)) continue;
        out[r.symbol] = { price: m.regularMarketPrice, currency: m.currency || "", chg, time: m.regularMarketTime || null, longName: m.longName || m.shortName || null };
      }
    } catch (e) { /* batch overslaan */ }
  }));
  return out;
}
const SUFFIX = /,?\s+(inc|corp|corporation|nv|n\.v|plc|ltd|limited|holding|holdings|group|se|ag|sa|co|company)\.?$/i;
async function latestHeadline(symbol, name) {
  // Alleen een kop die echt over dit bedrijf gaat (naam of ticker in de titel).
  const nm = String(name || "").replace(/\(.*?\)/g, "").replace(SUFFIX, "").trim();
  const first = nm.split(/\s+/)[0] || "";
  const base = symbol.split(/[.\-=]/)[0];
  const parts = ["\\b" + escRe(nm) + "\\b"];
  if (first.length >= 4 && first !== nm) parts.push("\\b" + escRe(first) + "\\b");
  const nameRe = new RegExp(parts.join("|"), "i");
  // Ticker hoofdlettergevoelig, zodat bijv. NET (Cloudflare) niet op het woord "net" valt.
  const tickRe = /^[A-Z]{2,5}$/.test(base) ? new RegExp("\\b" + base + "\\b") : null;
  const re = { test: t => nameRe.test(t) || !!(tickRe && tickRe.test(t)) };
  const urls = [`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`];
  if (/^[A-Z]{1,5}$/.test(symbol)) urls.push(`https://www.nasdaq.com/feed/rssoutbound?symbol=${encodeURIComponent(symbol)}`);
  const lists = await Promise.allSettled(urls.map(u => feed(u, 120)));
  const items = lists.flatMap(r => (r.status === "fulfilled" ? r.value : []));
  const fresh = items.filter(x => x.time && Date.now() - Date.parse(x.time) < 36 * 3600 * 1000 && re.test(x.title))
    .sort((a, b) => b.time.localeCompare(a.time));
  return fresh[0] || null;
}
const APP_URL = "https://cjjdogterom.github.io/investeren/";
const fmtPctNl = v => (v < 0 ? "−" : "+") + Math.abs(v).toFixed(1).replace(".", ",") + "%";
async function moversTick(env) {
  const list = await top500();
  const quotes = await sparkQuotes(list.map(x => x.symbol));
  const nowS = Date.now() / 1000;
  const rows = list.filter(x => quotes[x.symbol]).map(x => ({ ...x, ...quotes[x.symbol], name: x.name }));
  const live = rows.filter(x => x.time && nowS - x.time < 45 * 60);
  const byChg = rows.slice().sort((a, b) => a.chg - b.chg);
  const pick = x => ({ rank: x.rank, name: x.name, symbol: x.symbol, chg: +x.chg.toFixed(2), price: x.price, currency: x.currency, time: x.time ? new Date(x.time * 1000).toISOString() : null, live: !!(x.time && nowS - x.time < 45 * 60), country: x.country });
  const got = await sb(env, "GET", "portfolio?id=in.(nieuws-config,nieuws-alerts)&select=id,data");
  const cfg = ((got.find(r => r.id === "nieuws-config") || {}).data) || {};
  const st = ((got.find(r => r.id === "nieuws-alerts") || {}).data) || {};
  const fired = st.fired || {};
  const log = st.log || [];
  const step = Math.max(1, +cfg.dropPct || 5);
  const riseStep = cfg.rises ? Math.max(1, +cfg.risePct || step) : null;
  const cand = [];
  for (const x of live) {
    const day = new Date(x.time * 1000).toISOString().slice(0, 10);
    const k = `${day}|${x.symbol}`;
    const down = x.chg <= -step ? Math.floor(-x.chg / step) : 0;
    const up = riseStep && x.chg >= riseStep ? Math.floor(x.chg / riseStep) : 0;
    const prev = fired[k] || 0;   // negatief = daling-niveau, positief = stijging-niveau
    if (down && -prev < down) cand.push({ x, k, level: -down });
    else if (up && prev < up && prev >= 0) cand.push({ x, k, level: up });
  }
  cand.sort((a, b) => Math.abs(b.x.chg) - Math.abs(a.x.chg));
  const sent = [];
  for (const c of cand.slice(0, 6)) {
    const x = c.x;
    const h = await latestHeadline(x.symbol, x.name);
    const entry = { at: new Date().toISOString(), symbol: x.symbol, name: x.name, rank: x.rank, chg: +x.chg.toFixed(2), price: x.price, currency: x.currency,
      headline: h ? h.title : null, link: h ? h.link : null, sent: false };
    if (cfg.enabled !== false && cfg.ntfyTopic && /^[A-Za-z0-9_-]{6,64}$/.test(cfg.ntfyTopic)) {
      try {
        const r = await fetch("https://ntfy.sh/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
          topic: cfg.ntfyTopic,
          title: `${x.chg < 0 ? "📉" : "📈"} ${x.name} ${fmtPctNl(x.chg)} · #${x.rank} wereldwijd`,
          message: `${x.symbol} staat op ${x.price.toFixed(2).replace(".", ",")} ${x.currency}.` + (h ? `\nNieuws: ${h.title}` : "\nGeen recent nieuwsbericht gevonden."),
          click: h ? h.link : `${APP_URL}#/nieuws?s=${encodeURIComponent(x.symbol)}`,
          actions: [{ action: "view", label: "Open in app", url: `${APP_URL}#/nieuws?s=${encodeURIComponent(x.symbol)}` }],
          tags: [x.chg < 0 ? "chart_with_downwards_trend" : "chart_with_upwards_trend"],
          priority: Math.abs(x.chg) >= 2 * step ? 5 : 4,
        }) });
        entry.sent = r.ok;
      } catch (e) { /* niet verstuurd */ }
    }
    fired[c.k] = c.level;
    log.unshift(entry);
    sent.push(entry);
  }
  const cut = new Date(Date.now() - 4 * 86400 * 1000).toISOString().slice(0, 10);
  for (const k of Object.keys(fired)) if (k.slice(0, 10) < cut) delete fired[k];
  const data = { asOf: new Date().toISOString(), count: rows.length, liveCount: live.length,
    losers: byChg.slice(0, 25).map(pick), gainers: byChg.slice(-25).reverse().map(pick) };
  await sb(env, "POST", "portfolio?on_conflict=id", [{ id: "markt-bewegers", data }, { id: "nieuws-alerts", data: { fired, log: log.slice(0, 60) } }]);
  return `ok ${rows.length}/${list.length} koersen, ${live.length} live, ${sent.length} meldingen`;
}

export default {
  async scheduled(event, env, ctx) {
    if (event.cron === "*/5 * * * *") ctx.waitUntil(intradayTick(env).then(r => console.log("[dagverloop]", r), e => console.log("[dagverloop] fout", e.message)));
    else ctx.waitUntil(moversTick(env).then(r => console.log("[bewegers]", r), e => console.log("[bewegers] fout", e.message)));
  },
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...cors, "access-control-max-age": "86400" } });
    if (req.method !== "GET") return json({ error: "Alleen GET" }, 405, 0);
    const url = new URL(req.url);
    try {
      if (url.pathname === "/zoek") {
        const q = (url.searchParams.get("q") || "").trim().slice(0, 60);
        if (!q) return json({ results: [] });
        return json({ results: await zoek(q) }, 200, 3600);
      }
      if (url.pathname === "/koers") {
        const syms = [...new Set((url.searchParams.get("s") || "").split(",").map(s => s.trim()).filter(Boolean))].slice(0, 25);
        if (!syms.length || !syms.every(s => SYM.test(s))) return json({ error: "Ongeldig symbool" }, 400, 0);
        const range = RANGES.has(url.searchParams.get("range")) ? url.searchParams.get("range") : "1y";
        const out = await Promise.allSettled(syms.map(s => koers(s, range)));
        const quotes = {}, errors = {};
        out.forEach((r, i) => { if (r.status === "fulfilled") quotes[syms[i]] = r.value; else errors[syms[i]] = r.reason.message; });
        return json({ quotes, errors, fetchedAt: new Date().toISOString() });
      }
      if (url.pathname === "/dagverloop") return json({ status: await intradayTick(env) }, 200, 0);
      if (url.pathname === "/nieuws") {
        const syms = [...new Set((url.searchParams.get("s") || "").split(",").map(x => x.trim()).filter(Boolean))].slice(0, 16);
        if (!syms.every(x => SYM.test(x))) return json({ error: "Ongeldig symbool" }, 400, 0);
        const names = (url.searchParams.get("n") || "").split("|").map(x => x.trim().slice(0, 60)).slice(0, 16);
        return json(await nieuws(syms, names), 200, 300);
      }
      if (url.pathname === "/bewegers") {
        if (url.searchParams.get("nu") === "1") await moversTick(env);
        const got = await sb(env, "GET", "portfolio?id=in.(markt-bewegers,nieuws-alerts)&select=id,data");
        const m = ((got.find(r => r.id === "markt-bewegers") || {}).data) || null;
        const a = ((got.find(r => r.id === "nieuws-alerts") || {}).data) || {};
        return json({ movers: m, alerts: a.log || [] }, 200, 60);
      }
      if (url.pathname === "/grafiek") {
        const s = (url.searchParams.get("s") || "").trim();
        if (!SYM.test(s)) return json({ error: "Ongeldig symbool" }, 400, 0);
        const range = GRAPH[url.searchParams.get("range")] ? url.searchParams.get("range") : "1y";
        const g = await grafiek(s, range);
        return json(g, 200, Math.min(g.ttl, 300));
      }
      return json({ error: "Onbekend pad. Gebruik /zoek?q=, /koers?s= of /grafiek?s=&range=" }, 404, 0);
    } catch (e) {
      return json({ error: e.message || "Fout" }, 502, 0);
    }
  },
};
