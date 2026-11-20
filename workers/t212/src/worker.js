// Trading 212-koppeling voor de Investeren-app. Alleen-lezen: haalt account, posities, pies en historie op
// met de Trading 212 Public API (v0) en geeft ze in het formaat van de app terug.
// Toegang alleen met de deelsleutel (header x-sleutel). Geheimen: T212_KEY, T212_SECRET, DEELSLEUTEL.
const HOSTS = { live: "https://live.trading212.com", demo: "https://demo.trading212.com" };
const YF = "https://query2.finance.yahoo.com";
const PIES_TTL = 15 * 60 * 1000;
const HIST_TTL = 10 * 60 * 1000;
const SNAP_TTL = 60 * 1000;

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "x-sleutel",
};
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Constante-tijd vergelijking van de deelsleutel.
function sameKey(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || !a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// Welke combinatie van omgeving en auth-vorm werkt, wordt één keer bepaald en onthouden (KV 'auth', geen geheimen).
// Nieuw: Basic base64(key:secret). Legacy: de sleutel zelf in de Authorization-header.
function authVariants(env) {
  const key = (env.T212_KEY || "").trim(), secret = (env.T212_SECRET || "").trim();
  const v = [];
  const pref = HOSTS[env.T212_OMGEVING] ? env.T212_OMGEVING : "live";
  for (const omg of [pref, pref === "live" ? "demo" : "live"]) {
    if (key && secret) v.push({ id: `${omg}:basic`, host: HOSTS[omg], auth: "Basic " + btoa(`${key}:${secret}`) });
    if (key && secret) v.push({ id: `${omg}:basic-omgedraaid`, host: HOSTS[omg], auth: "Basic " + btoa(`${secret}:${key}`) });
    if (key) v.push({ id: `${omg}:legacy-key`, host: HOSTS[omg], auth: key });
    if (secret) v.push({ id: `${omg}:legacy-secret`, host: HOSTS[omg], auth: secret });
  }
  return v;
}
let memAuth = null;
let authPromise = null;
async function probe(cand) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(cand.host + "/api/v0/equity/account/summary", { headers: { Authorization: cand.auth, accept: "application/json" } });
    if (r.status !== 429) return r.status;
    const reset = +r.headers.get("x-ratelimit-reset") || 0;
    await sleep(Math.min(10000, Math.max(1500, reset * 1000 - Date.now() + 250)));
  }
  return 429;
}
async function resolveAuth(env) {
  if (memAuth) return memAuth;
  if (authPromise) return authPromise;
  authPromise = (async () => {
    const variants = authVariants(env);
    const known = await env.CACHE.get("auth");
    const hit = variants.find(x => x.id === known);
    if (hit) return (memAuth = hit);
    for (const cand of variants) {
      const st = await probe(cand);
      if (st === 200 || st === 403) { await env.CACHE.put("auth", cand.id); return (memAuth = cand); }
      if (st === 429) throw new Error("Trading 212: te veel verzoeken, probeer het zo opnieuw");
    }
    throw new Error("Trading 212 weigert de sleutel (401) in alle varianten. Maak een nieuwe API-sleutel en draai koppel.sh opnieuw.");
  })().finally(() => { authPromise = null; });
  return authPromise;
}

function t212Client(env) {
  return async function get(path) {
    const { host, auth } = await resolveAuth(env);
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(host + path, { headers: { Authorization: auth, accept: "application/json" } });
      if (res.status === 429 && attempt === 0) {
        const reset = +res.headers.get("x-ratelimit-reset") || 0;
        await sleep(Math.min(30000, Math.max(1000, reset * 1000 - Date.now() + 250)));
        continue;
      }
      if (res.status === 401) { memAuth = null; await env.CACHE.delete("auth"); throw new Error("Trading 212 weigert de sleutel (401). Controleer API-sleutel en secret."); }
      if (res.status === 403) throw new Error(`Sleutel mist een recht voor ${path.split("?")[0]} (403). Geef leesrechten voor dit onderdeel.`);
      if (!res.ok) throw new Error(`Trading 212 gaf ${res.status} voor ${path.split("?")[0]}`);
      return res.json();
    }
    throw new Error("Trading 212: te veel verzoeken, probeer het zo opnieuw");
  };
}

async function allPages(get, path) {
  const out = [];
  let next = path + (path.includes("?") ? "&" : "?") + "limit=50";
  for (let i = 0; next && i < 200; i++) {
    const page = await get(next);
    out.push(...(page.items || []));
    next = page.nextPagePath || null;
    if (next && !next.startsWith("/")) next = "/" + next;
  }
  return out;
}

// ── Trading 212-ticker → Yahoo-symbool (voor historische koersen in de app) ──
const SUFFIX = { d: ".DE", l: ".L", a: ".AS", p: ".PA", m: ".MI", e: ".MC", s: ".SW", b: ".BR", f: ".HE", o: ".OL", k: ".ST", c: ".CO", v: ".VI", t: ".TO" };
function guessYahoo(ticker) {
  const m = /^(.+?)_([A-Z]{2})_EQ$/.exec(ticker);
  if (m) return m[2] === "US" ? m[1].replace(/\./g, "-") : m[1];
  const e = /^(.+?)([a-z])_EQ$/.exec(ticker);
  if (e && SUFFIX[e[2]]) return e[1] + SUFFIX[e[2]];
  return ticker.replace(/_EQ$/, "");
}
async function yahooExists(sym) {
  const r = await fetch(`${YF}/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d`, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!r.ok) return false;
  const j = await r.json().catch(() => null);
  return !!(j && j.chart && j.chart.result && j.chart.result[0]);
}
async function yahooByIsin(isin, currency) {
  if (!isin) return null;
  const r = await fetch(`${YF}/v1/finance/search?q=${encodeURIComponent(isin)}&quotesCount=10&newsCount=0`, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!r.ok) return null;
  const quotes = ((await r.json().catch(() => ({}))).quotes || []).filter(q => q.symbol);
  const pref = currency === "EUR" ? [".DE", ".AS", ".PA", ".MI", ".MC"] : currency === "GBP" || currency === "GBX" ? [".L"] : currency === "USD" ? [""] : [];
  for (const sfx of pref) {
    const q = quotes.find(x => sfx ? x.symbol.endsWith(sfx) : !x.symbol.includes("."));
    if (q) return q.symbol;
  }
  return quotes.length ? quotes[0].symbol : null;
}
async function mapTickers(env, instruments) {
  const map = (await env.CACHE.get("tickers", "json")) || {};
  let changed = false;
  for (const ins of instruments) {
    if (!ins || !ins.ticker || map[ins.ticker]) continue;
    const guess = guessYahoo(ins.ticker);
    let sym = (await yahooExists(guess)) ? guess : await yahooByIsin(ins.isin, ins.currency);
    map[ins.ticker] = sym || guess;
    changed = true;
  }
  if (changed) await env.CACHE.put("tickers", JSON.stringify(map));
  return map;
}

// ── Account + posities (live, 60 s in het geheugen) ──
let memSnap = null;
async function liveSnapshot(env) {
  if (memSnap && Date.now() - memSnap.at < SNAP_TTL) return memSnap.data;
  const get = t212Client(env);
  const summary = await get("/api/v0/equity/account/summary");
  await sleep(1100);
  const rawPos = await get("/api/v0/equity/positions");
  const posList = Array.isArray(rawPos) ? rawPos : (rawPos.items || []);
  const map = await mapTickers(env, posList.map(p => p.instrument || {}));
  const cash = summary.cash || {}, inv = summary.investments || {};
  const free = +cash.availableToTrade || 0, inPies = +cash.inPies || 0, reserved = +cash.reservedForOrders || 0;
  const data = {
    currency: summary.currency || "EUR",
    account: {
      free, inPies, reserved,
      investedValue: +inv.currentValue || 0,
      totalCost: +inv.totalCost || 0,
      unrealized: +inv.unrealizedProfitLoss || 0,
      realized: +inv.realizedProfitLoss || 0,
      totalValue: summary.totalValue != null ? +summary.totalValue : null,
      total: (+inv.currentValue || 0) + free + inPies + reserved,
    },
    positions: posList.map(p => {
      const ins = p.instrument || {}, w = p.walletImpact || {};
      return {
        ticker: ins.ticker, symbol: map[ins.ticker] || guessYahoo(ins.ticker || ""), name: ins.name || ins.ticker, isin: ins.isin || null,
        currency: ins.currency || null, quantity: +p.quantity || 0, quantityInPies: +p.quantityInPies || 0,
        avgPrice: p.averagePricePaid != null ? +p.averagePricePaid : null, currentPrice: p.currentPrice != null ? +p.currentPrice : null,
        value: +w.currentValue || 0, cost: +w.totalCost || 0, pnl: +w.unrealizedProfitLoss || 0,
        fxImpact: w.fxImpact != null ? +w.fxImpact : null, openedAt: p.createdAt || null,
      };
    }).sort((a, b) => b.value - a.value),
    fetchedAt: new Date().toISOString(),
  };
  memSnap = { at: Date.now(), data };
  return data;
}

// ── Pies (API deprecated maar werkend; 1 verzoek / 5 s per pie → 15 min in KV) ──
async function refreshPies(env) {
  const get = t212Client(env);
  const list = await get("/api/v0/equity/pies");
  const pies = [];
  for (const p of list || []) {
    await sleep(5200);
    const d = await get(`/api/v0/equity/pies/${p.id}`);
    const s = d.settings || {}, r = p.result || {};
    pies.push({
      id: p.id, name: s.name || `Pie ${p.id}`, icon: s.icon || null, goal: s.goal != null ? +s.goal : null,
      cash: +p.cash || 0, status: p.status || null, progress: p.progress != null ? +p.progress : null,
      invested: +r.priceAvgInvestedValue || 0, value: +r.priceAvgValue || 0, result: +r.priceAvgResult || 0, resultCoef: r.priceAvgResultCoef != null ? +r.priceAvgResultCoef : null,
      dividends: p.dividendDetails || null, dividendAction: s.dividendCashAction || null, createdAt: s.creationDate || null,
      instruments: (d.instruments || []).map(x => ({
        ticker: x.ticker, expectedShare: +x.expectedShare || 0, currentShare: +x.currentShare || 0, ownedQuantity: +x.ownedQuantity || 0,
        invested: x.result ? +x.result.priceAvgInvestedValue || 0 : 0, value: x.result ? +x.result.priceAvgValue || 0 : 0,
        result: x.result ? +x.result.priceAvgResult || 0 : 0, issues: (x.issues || []).map(i => i.name),
      })),
    });
  }
  const map = await mapTickers(env, pies.flatMap(p => p.instruments.map(x => ({ ticker: x.ticker }))));
  pies.forEach(p => p.instruments.forEach(x => { x.symbol = map[x.ticker] || guessYahoo(x.ticker); }));
  const data = { pies, fetchedAt: new Date().toISOString() };
  await env.CACHE.put("pies", JSON.stringify(data));
  return data;
}
async function cachedPies(env, ctx, force) {
  const cur = await env.CACHE.get("pies", "json");
  const stale = !cur || Date.now() - Date.parse(cur.fetchedAt) > PIES_TTL;
  if (!cur || force) return refreshPies(env);
  if (stale) ctx.waitUntil(refreshPies(env).catch(() => {}));
  return cur;
}

// ── Historie → boekingen in het formaat van de app ──
const num = v => (v == null || v === "" ? 0 : +v);
async function buildHistory(env) {
  const get = t212Client(env);
  const [cashTx, orders, divs] = [
    await allPages(get, "/api/v0/equity/history/transactions"),
    await allPages(get, "/api/v0/equity/history/orders"),
    await allPages(get, "/api/v0/equity/history/dividends"),
  ];
  const map = await mapTickers(env, [
    ...orders.map(o => (o.order && (o.order.instrument || { ticker: o.order.ticker })) || {}),
    ...divs.map(d => d.instrument || { ticker: d.ticker }),
  ]);
  const sym = t => (t ? map[t] || guessYahoo(t) : null);
  const day = iso => String(iso || "").slice(0, 10);
  const out = [];
  const warnings = [];

  for (const t of cashTx) {
    // TRANSFER = overboeking tussen eigen Trading 212-rekeningen (bijv. Invest → CFD): uit = opname, in = inleg.
    const kind = t.type === "TRANSFER" ? (num(t.amount) < 0 ? "opname" : "inleg")
      : { DEPOSIT: "inleg", WITHDRAW: "opname", FEE: "kosten", INTEREST_ON_FREE_CASH: "rente", LENDING_INTEREST: "rente" }[t.type];
    if (!kind || !t.reference) continue;
    if (t.currency && t.currency !== "EUR") warnings.push(`${t.type} ${t.reference} in ${t.currency}`);
    out.push({ key: "txn:" + t.reference, type: kind, date: day(t.dateTime), amountEur: Math.abs(num(t.amount)), note: `T212:${t.type}` });
  }
  for (const h of orders) {
    const f = h.fill, o = h.order || {};
    if (!f || f.type !== "TRADE" || !(Math.abs(num(f.quantity)) > 0)) continue;
    const qty = Math.abs(num(f.quantity));
    const w = f.walletImpact || {};
    const fees = (w.taxes || []).reduce((a, x) => a + Math.abs(num(x.quantity)), 0);
    const net = Math.abs(num(w.netValue));
    const buy = (o.side || (num(f.quantity) > 0 ? "BUY" : "SELL")) === "BUY";
    // netValue = wat er van/naar je kas gaat (incl. kosten); bruto = netto ∓ kosten.
    const gross = net > 0 ? (buy ? net - fees : net + fees) : qty * num(f.price);
    out.push({
      key: "ord:" + f.id, type: buy ? "koop" : "verkoop", date: day(f.filledAt), instrument: sym(o.ticker),
      quantity: qty, unitPriceEur: gross > 0 ? +(gross / qty).toFixed(6) : null, amountEur: +gross.toFixed(2),
      feeEur: fees > 0 ? +fees.toFixed(4) : undefined, note: `T212:${o.ticker}${o.initiatedFrom ? " · " + o.initiatedFrom : ""}`,
      t212Ticker: o.ticker,
    });
  }
  for (const d of divs) {
    if (!d.reference) continue;
    const amt = d.amountInEuro != null ? num(d.amountInEuro) : num(d.amount);
    out.push({ key: "div:" + d.reference, type: "dividend", date: day(d.paidOn), instrument: sym(d.ticker), amountEur: +amt.toFixed(2), note: `T212:dividend ${d.ticker}` });
  }
  out.sort((a, b) => a.date.localeCompare(b.date));
  return { transactions: out, counts: { cash: cashTx.length, orders: orders.length, dividends: divs.length }, warnings, fetchedAt: new Date().toISOString() };
}
async function cachedHistory(env, force) {
  const cur = await env.CACHE.get("hist", "json");
  if (cur && !force && Date.now() - Date.parse(cur.fetchedAt) < HIST_TTL) return cur;
  const data = await buildHistory(env);
  await env.CACHE.put("hist", JSON.stringify(data));
  return data;
}

export default {
  async fetch(req, env, ctx) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...cors, "access-control-max-age": "86400" } });
    if (req.method !== "GET") return json({ error: "Alleen GET" }, 405);
    if (!env.DEELSLEUTEL || !sameKey(req.headers.get("x-sleutel") || "", env.DEELSLEUTEL)) return json({ error: "Geen of onjuiste deelsleutel" }, 401);
    if (!env.T212_KEY || !env.T212_SECRET) return json({ error: "Trading 212-sleutel is nog niet ingesteld (draai koppel.sh)" }, 503);
    const url = new URL(req.url);
    const force = url.searchParams.get("vers") === "1";
    try {
      if (url.pathname === "/snapshot") {
        const [live, pies] = await Promise.all([liveSnapshot(env), cachedPies(env, ctx, force).catch(e => ({ pies: [], error: e.message }))]);
        return json({ ...live, pies: pies.pies, piesFetchedAt: pies.fetchedAt || null, piesError: pies.error || null, verbinding: memAuth ? memAuth.id : null });
      }
      if (url.pathname === "/geschiedenis") return json(await cachedHistory(env, force));
      return json({ error: "Onbekend pad. Gebruik /snapshot of /geschiedenis" }, 404);
    } catch (e) {
      return json({ error: e.message || "Fout" }, 502);
    }
  },
};
