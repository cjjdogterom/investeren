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

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(intradayTick(env).then(r => console.log("[dagverloop]", r), e => console.log("[dagverloop] fout", e.message)));
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
