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
  const price = meta.regularMarketPrice ?? (hist.length ? hist[hist.length - 1].close : null);
  if (price == null) throw new Error(`Geen koers voor ${symbol}`);
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
    marketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null,
    history: hist.map(h => ({ date: h.date, eur: +(h.close * fx.at(h.date)).toFixed(6) })),
  };
}

export default {
  async fetch(req) {
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
      return json({ error: "Onbekend pad. Gebruik /zoek?q= of /koers?s=" }, 404, 0);
    } catch (e) {
      return json({ error: e.message || "Fout" }, 502, 0);
    }
  },
};
