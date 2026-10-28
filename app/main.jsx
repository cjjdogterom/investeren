// App root (S1 shell): state, sync, prices, routing, shell, overlays

const SUPABASE_CFG_KEY  = 'investeringen-supabase-v1';
const SUPABASE_CFG_VERSION = 2;
const SUPABASE_PULL_INTERVAL_MS = 8000;
const SERVER_PRICE_REFRESH_KEY = 'investeringen-server-price-refresh-v1';
const SERVER_PRICE_REFRESH_INTERVAL_MS = 15 * 60 * 1000;

// ── Price history helper ──────────────────────────────────────
function appendToHistory(existing, date, price) {
  if (!price) return existing || [];
  const arr = (existing || []).filter(h => h.date !== date);
  arr.push({ date, nav: +price });
  arr.sort((a, b) => a.date.localeCompare(b.date));
  return arr.slice(-1095); // 3 jaar max
}

// ── Supabase helpers ──────────────────────────────────────────
const SUPABASE_DEFAULTS = {
  configVersion: SUPABASE_CFG_VERSION,
  url:     'https://xlmbpohjlcwjubgiyjaw.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsbWJwb2hqbGN3anViZ2l5amF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNjIyODksImV4cCI6MjA5MzYzODI4OX0.BXbY5_stirCdFLuXleBHu1VouYm1cguVZd3bjkygHlo',
};

function loadSupabaseConfig() {
  try {
    const stored = JSON.parse(localStorage.getItem(SUPABASE_CFG_KEY));
    if (stored?.configVersion === SUPABASE_CFG_VERSION && stored?.url && stored?.anonKey) return stored;
  } catch {}
  return { ...SUPABASE_DEFAULTS };
}

let lastAutomaticServerPriceRefreshAt = 0;

function claimAutomaticServerPriceRefresh() {
  const now = Date.now();
  let stored = 0;
  try { stored = +(localStorage.getItem(SERVER_PRICE_REFRESH_KEY) || 0); } catch {}
  if (now - Math.max(stored, lastAutomaticServerPriceRefreshAt) < SERVER_PRICE_REFRESH_INTERVAL_MS) return false;
  lastAutomaticServerPriceRefreshAt = now;
  try { localStorage.setItem(SERVER_PRICE_REFRESH_KEY, String(now)); } catch {}
  return true;
}

let supabaseClientCache = { key: null, client: null };

function getSupabaseClient(cfg) {
  if (!cfg?.url || !cfg?.anonKey) return null;
  const url = cfg.url.trim();
  const anonKey = cfg.anonKey.trim();
  const key = `${url}|${anonKey}`;
  if (supabaseClientCache.key === key && supabaseClientCache.client) {
    return supabaseClientCache.client;
  }
  try {
    const client = window.supabase?.createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    supabaseClientCache = { key, client };
    return client;
  }
  catch { return null; }
}

const PORTFOLIO_SETTINGS_EXCLUDED_KEYS = new Set([
  'financieelOver',
  '_financieelOver',
  '_financieelOverLoaded',
  'transactions',
  'portfolioDailyValues',
  'goldHistory',
  'silverHistory',
  'btcHistory',
  'ethHistory',
  'paxgHistory',
  'meesmanNavHistory',
  'lastWeeklySpotSave',
  'customParties',
  'widgetSnapshot',
]);

function portfolioSettingsFromState(state = {}) {
  return Object.fromEntries(
    Object.entries(state || {}).filter(([key]) => !PORTFOLIO_SETTINGS_EXCLUDED_KEYS.has(key))
  );
}

async function supabaseSelectAll(makeQuery, pageSize = 1000) {
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await makeQuery().range(from, from + pageSize - 1);
    if (error) return { data: rows, error };
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return { data: rows, error: null };
}

// camelCase <-> snake_case helpers voor de transactions tabel
let transactionUpdatedAtColumnAvailable = true;

// Overboeking (crypto tussen posten) gebruikt bestaande kolommen, zonder schemawijziging:
//   instrument ← toParty (doel-sub-holding, bv. 'wallet-btc'; instrument is alleen voor Trading 212 in gebruik)
//   value_eur  ← feeQty  (netwerkkosten in coin; value_eur is alleen voor waarderingen in gebruik)
// rowToTx zet dit voor type 'overboeking' weer terug, zodat de velden lossless round-trippen.
function txToRow(t, includeUpdatedAt = true) {
  const isTransfer = t.type === 'overboeking';
  const row = {
    id:             t.id,
    party:          t.party,
    type:           t.type,
    date:           t.date,
    quantity:       t.quantity     != null ? +t.quantity     : null,
    unit_price_eur: t.unitPriceEur != null ? +t.unitPriceEur : null,
    fee_eur:        t.feeEur       != null ? +t.feeEur       : null,
    amount_eur:     t.amountEur    != null ? +t.amountEur    : null,
    note:           t.note         || null,
    metal_type:     t.metalType    || null,
    silver_unit:    t.silverUnit   || null,
    gold_unit:      t.goldUnit     || null,
    instrument:     isTransfer ? (t.toParty || null) : (t.instrument || null),
    t212_id:        t._t212Id      || null,
    value_eur:      isTransfer
      ? (t.feeQty != null && t.feeQty !== '' ? +t.feeQty : null)
      : (t.valueEur != null ? +t.valueEur : null),
  };
  if (includeUpdatedAt && t.updatedAt) row.updated_at = t.updatedAt;
  return row;
}

function rowToTx(r) {
  const t = { id: r.id, party: r.party, type: r.type, date: r.date };
  if (r.quantity       != null) t.quantity     = +r.quantity;
  if (r.unit_price_eur != null) t.unitPriceEur = +r.unit_price_eur;
  if (r.fee_eur        != null) t.feeEur       = +r.fee_eur;
  if (r.amount_eur     != null) t.amountEur    = +r.amount_eur;
  if (r.note)                   t.note         = r.note;
  if (r.metal_type)             t.metalType    = r.metal_type;
  if (r.silver_unit)            t.silverUnit   = r.silver_unit;
  if (r.gold_unit)              t.goldUnit     = r.gold_unit;
  if (r.t212_id)                t._t212Id      = r.t212_id;
  if (r.type === 'overboeking') {
    if (r.instrument)           t.toParty      = r.instrument;
    if (r.value_eur    != null) t.feeQty       = +r.value_eur;
  } else {
    if (r.instrument)           t.instrument   = r.instrument;
    if (r.value_eur    != null) t.valueEur     = +r.value_eur;
  }
  if (r.updated_at || r.created_at) t.updatedAt = r.updated_at || r.created_at;
  return t;
}

const CANONICAL_BTC_TRANSACTIONS = [
  { id: 'btc-2024-02-29-buy-50',       party: 'finst-btc', date: '2024-02-29', type: 'koop',    quantity: 0.00085623, amountEur: 50,     feeEur: 0, note: 'Screenshot Finst BTC' },
  { id: 'btc-2024-03-04-buy-70',       party: 'finst-btc', date: '2024-03-04', type: 'koop',    quantity: 0.00113883, amountEur: 70,     feeEur: 0, note: 'Screenshot Finst BTC' },
  { id: 'btc-2024-03-12-buy-5738',     party: 'finst-btc', date: '2024-03-12', type: 'koop',    quantity: 0.00086852, amountEur: 57.38,  feeEur: 0, note: 'Screenshot Finst BTC' },
  { id: 'btc-2024-03-12-buy-4001',     party: 'finst-btc', date: '2024-03-12', type: 'koop',    quantity: 0.00060528, amountEur: 40.01,  feeEur: 0, note: 'Screenshot Finst BTC' },
  { id: 'btc-2024-04-10-buy-100',      party: 'finst-btc', date: '2024-04-10', type: 'koop',    quantity: 0.00159005, amountEur: 100,    feeEur: 0, note: 'Screenshot Finst BTC' },
  { id: 'btc-2024-04-10-buy-300',      party: 'finst-btc', date: '2024-04-10', type: 'koop',    quantity: 0.00476801, amountEur: 300,    feeEur: 0, note: 'Screenshot Finst BTC' },
  { id: 'btc-2024-04-10-buy-35',       party: 'finst-btc', date: '2024-04-10', type: 'koop',    quantity: 0.00055565, amountEur: 35,     feeEur: 0, note: 'Screenshot Finst BTC' },
  { id: 'btc-2024-04-11-sell-435',     party: 'finst-btc', date: '2024-04-11', type: 'verkoop', quantity: 0.00663876, amountEur: 435,    feeEur: 0, note: 'Screenshot Finst BTC' },
  { id: 'btc-2025-02-05-buy-100',      party: 'finst-btc', date: '2025-02-05', type: 'koop',    quantity: 0.00107528, amountEur: 100,    feeEur: 0, note: 'Screenshot Finst BTC' },
  { id: 'btc-2025-02-25-buy-50',       party: 'finst-btc', date: '2025-02-25', type: 'koop',    quantity: 0.00058139, amountEur: 50,     feeEur: 0, note: 'Screenshot Finst BTC' },
  { id: 'btc-2025-04-06-withdraw-5',   party: 'finst-btc', date: '2025-04-06', type: 'opname',  quantity: 0.0001,     amountEur: 5,      feeEur: 0, note: 'Screenshot Finst BTC' },
  { id: 'btc-2026-02-08-buy-10001',    party: 'finst-btc', date: '2026-02-08', type: 'koop',    quantity: 0.0016594,  amountEur: 100.01, feeEur: 0, note: 'Screenshot Finst BTC' },
  { id: 'btc-2026-04-13-withdraw-048', party: 'finst-btc', date: '2026-04-13', type: 'opname',  quantity: 0.00005,    amountEur: 0.48,   feeEur: 0, note: 'Screenshot Finst BTC' },
];

function isIgnoredLegacyTransaction(tx) {
  return tx?.party === 'finst-btc' && String(tx.id || '').startsWith('tx_finst_btc_');
}

function normalizeTransactions(transactions = []) {
  const cleaned = transactions.filter(tx => !isIgnoredLegacyTransaction(tx));
  // Canonieke BTC-boekingen vullen alleen ontbrekende aan; bestaande (ook bewerkte) boekingen winnen.
  return mergeById(CANONICAL_BTC_TRANSACTIONS, cleaned)
    .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
}

function mergeById(local = [], remote = []) {
  const m = new Map();
  (local || []).forEach(item => item?.id && m.set(item.id, item));
  (remote || []).forEach(item => item?.id && m.set(item.id, item));
  return [...m.values()];
}

function updatedAtMs(item) {
  const t = Date.parse(item?.updatedAt || item?.updated_at || '');
  return Number.isFinite(t) ? t : 0;
}

function mergeByNewest(...lists) {
  const m = new Map();
  lists.forEach(list => (list || []).forEach(item => {
    if (!item?.id) return;
    const current = m.get(item.id);
    if (!current || updatedAtMs(item) >= updatedAtMs(current)) {
      m.set(item.id, item);
    }
  }));
  return [...m.values()];
}

function mergeDeletedIds(...sources) {
  const merged = {};
  sources.forEach(source => Object.entries(source || {}).forEach(([id, deletedAt]) => {
    if (!merged[id] || updatedAtMs({ updatedAt: deletedAt }) >= updatedAtMs({ updatedAt: merged[id] })) {
      merged[id] = deletedAt;
    }
  }));
  return merged;
}

function isDeletedByTombstone(item, deletedIds = {}) {
  const deletedAt = deletedIds[item?.id];
  return deletedAt && updatedAtMs({ updatedAt: deletedAt }) >= updatedAtMs(item);
}

function normalizeParties(parties = []) {
  return (parties || []).map(p => (
    p?.id === 'finst-paxg' && p.category === 'Crypto'
      ? { ...p, category: 'Edelmetaal' }
      : p
  ));
}

function priceRowsToState(rows = []) {
  const byAsset = rows.reduce((acc, row) => {
    if (!row?.asset || !row.date || row.nav == null) return acc;
    if (!acc[row.asset]) acc[row.asset] = [];
    acc[row.asset].push({ date: row.date, nav: +row.nav });
    return acc;
  }, {});
  return {
    goldHistory:       byAsset.gold_eur_per_gram || [],
    silverHistory:     byAsset.silver_eur_per_ounce || [],
    btcHistory:        byAsset.btc_eur || [],
    ethHistory:        byAsset.eth_eur || [],
    paxgHistory:       byAsset.paxg_eur || [],
    meesmanNavHistory: normalizeMeesmanHistory(byAsset.meesman_aandelen_wereldwijd_totaal || []).history,
  };
}

// Laad alles uit Supabase: instellingen, transacties en prijs-historie.
async function supabaseLoadAll(client) {
  const [portfolioRes, txRes, priceRes, valueRes, finOverRes] = await Promise.all([
    client.from('portfolio').select('data').eq('id', 'main').maybeSingle(),
    supabaseSelectAll(() => client.from('transactions').select('*').order('date', { ascending: true })),
    supabaseSelectAll(() => client.from('asset_price_history').select('asset,date,nav').gte('date', '2025-01-01').order('date', { ascending: true }).order('asset', { ascending: true })),
    supabaseSelectAll(() => client.from('portfolio_daily_values').select('date,total_eur,invested_eur').gte('date', '2025-01-01').order('date', { ascending: true })),
    // Alleen-lezen: live 'Vrij op rekening' uit het Financieel Systeem. Wordt nooit teruggeschreven.
    Promise.resolve(client.from('portfolio').select('data').eq('id', 'financieel-over').maybeSingle()).catch(e => ({ data: null, error: e })),
  ]);

  if (portfolioRes.error && txRes.error && priceRes.error && valueRes.error) {
    console.warn('[Supabase] laden mislukt:', portfolioRes.error?.message || txRes.error?.message);
    return null;
  }

  const portfolioData = portfolioRes.data?.data || {};
  // Geen object-rest destructuring: Babel-standalone maakt daarvoor globale `_excludedN`
  // helpers die tussen bestanden botsen. Daarom expliciet kopiëren en verwijderen.
  const _legacyTransactions = portfolioData.transactions;
  const settings = { ...portfolioData };
  ['transactions', 'portfolioDailyValues', 'goldHistory', 'silverHistory', 'btcHistory', 'ethHistory',
    'paxgHistory', 'meesmanNavHistory', 'lastWeeklySpotSave', 'widgetSnapshot'].forEach(k => { delete settings[k]; });

  const transactionsLoaded = !txRes.error;
  const transactions = transactionsLoaded
    ? normalizeTransactions((txRes.data || []).map(rowToTx))
    : normalizeTransactions(_legacyTransactions || []);

  const priceState = priceRes.error ? {} : priceRowsToState(priceRes.data || []);
  const portfolioDailyValues = valueRes.error ? [] : (valueRes.data || []).map(row => ({
    date: row.date,
    total: +row.total_eur,
    invested: +row.invested_eur,
  }));

  return {
    ...settings,
    ...priceState,
    transactions,
    portfolioDailyValues,
    _transactionsLoaded: transactionsLoaded,
    _financieelOverLoaded: !(finOverRes && finOverRes.error),
    _financieelOver: (finOverRes && finOverRes.data && finOverRes.data.data) || null,
  };
}

// Sla alleen instellingen op in portfolio; transacties en koershistorie hebben eigen tabellen.
async function supabaseSaveSettings(client, state) {
  const settings = portfolioSettingsFromState(state);
  const { data: current } = await client
    .from('portfolio')
    .select('data')
    .eq('id', 'main')
    .maybeSingle();
  const currentParties = current?.data?.parties;
  if (Array.isArray(currentParties) && currentParties.length) {
    settings.parties = normalizeParties(mergeByNewest(currentParties, settings.parties || []));
  }
  // Partij-tombstones: remote + lokaal samenvoegen en verwijderde partijen niet terugschrijven.
  const deletedPartyIds = mergeDeletedIds(current?.data?.deletedPartyIds, settings.deletedPartyIds);
  if (Object.keys(deletedPartyIds).length) {
    settings.deletedPartyIds = deletedPartyIds;
    if (Array.isArray(settings.parties)) {
      settings.parties = settings.parties.filter(p => !isDeletedByTombstone(p, deletedPartyIds));
    }
  }
  // widgetSnapshot leeft niet in de lokale state; behoud de remote versie.
  if (current?.data?.widgetSnapshot) settings.widgetSnapshot = current.data.widgetSnapshot;
  const { error } = await client
    .from('portfolio')
    .upsert({ id: 'main', data: settings, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

// Schrijf alleen data.widgetSnapshot (voor de iOS-widget). Read-modify-write op het REMOTE
// document: lokale instellingen worden nooit meegestuurd, dus dit overschrijft geen wijzigingen
// van anderen. Bestaat de rij nog niet, dan niets doen.
async function supabaseSaveWidgetSnapshot(client, snapshot) {
  const { data: current, error: readError } = await client
    .from('portfolio')
    .select('data')
    .eq('id', 'main')
    .maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!current || !current.data || typeof current.data !== 'object') return false;
  const { error } = await client
    .from('portfolio')
    .update({ data: { ...current.data, widgetSnapshot: snapshot } })
    .eq('id', 'main');
  if (error) throw new Error(error.message);
  return true;
}

async function supabaseSyncTransactions(client, transactions = [], deletedTransactionIds = {}) {
  const txs = transactions
    .filter(t => t.id && t.party && t.type && t.date && !isIgnoredLegacyTransaction(t));
  for (let i = 0; i < txs.length; i += 200) {
    const chunk = txs.slice(i, i + 200);
    const rows = chunk.map(t => txToRow(t, transactionUpdatedAtColumnAvailable));
    let { error } = await client
      .from('transactions')
      .upsert(rows, { onConflict: 'id' });
    if (error?.code === 'PGRST204' && String(error.message || '').includes('updated_at')) {
      transactionUpdatedAtColumnAvailable = false;
      const retryRows = chunk.map(t => txToRow(t, false));
      ({ error } = await client
        .from('transactions')
        .upsert(retryRows, { onConflict: 'id' }));
    }
    if (error) throw new Error(error.message);
  }
  const deletedIds = Object.keys(deletedTransactionIds || {});
  for (let i = 0; i < deletedIds.length; i += 200) {
    const { error } = await client
      .from('transactions')
      .delete()
      .in('id', deletedIds.slice(i, i + 200));
    if (error) throw new Error(error.message);
  }
}

async function supabaseUpsertAssetPriceRows(client, rows = []) {
  if (!client) return false;
  const cleanRows = rows
    .filter(r => r?.asset && r.date && +r.nav > 0)
    .map(r => ({
      asset: r.asset,
      date: r.date,
      nav: +r.nav,
      source: r.source || 'app',
      updated_at: r.updated_at || new Date().toISOString(),
    }));
  if (!cleanRows.length) return false;

  let { error } = await client
    .from('asset_price_history')
    .upsert(cleanRows, { onConflict: 'asset,date' });
  if (error?.code === 'PGRST204' && /source|updated_at/i.test(error.message || '')) {
    const legacyRows = cleanRows.map(r => ({ asset: r.asset, date: r.date, nav: r.nav }));
    ({ error } = await client
      .from('asset_price_history')
      .upsert(legacyRows, { onConflict: 'asset,date' }));
  }
  if (error) throw new Error(error.message);
  return true;
}

// ── Spot price fetchers ───────────────────────────────────────
async function fetchSpotPrices() {
  const [goldRes, silverRes, fxRes] = await Promise.all([
    fetch('https://api.gold-api.com/price/XAU').then(r => r.json()),
    fetch('https://api.gold-api.com/price/XAG').then(r => r.json()),
    fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR').then(r => r.json()),
  ]);
  const goldUsdOz   = goldRes.price;
  const silverUsdOz = silverRes.price;
  const usdToEur    = fxRes.rates?.EUR;
  if (!goldUsdOz || !silverUsdOz || !usdToEur) throw new Error('Ongeldige response');
  return {
    goldSpotEurPerGram:    (goldUsdOz * usdToEur) / OZ_TO_GRAM,
    silverSpotEurPerOunce: silverUsdOz * usdToEur,
  };
}

async function fetchCryptoPrices() {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=eur'
  ).then(r => r.json());
  if (!res.bitcoin || !res.ethereum || !res['pax-gold']) throw new Error('Ongeldige CoinGecko response');
  return {
    btcSpotEur:  res.bitcoin.eur,
    ethSpotEur:  res.ethereum.eur,
    paxgSpotEur: res['pax-gold'].eur,
  };
}

// On-chain saldo van een PUBLIEK adres (alleen-lezen; nooit seed phrase of private key).
// BTC: mempool.space (bevestigd saldo = funded − spent). ETH: publieke JSON-RPC (eth_getBalance), met fallback.
async function fetchChainBalance(coin, address) {
  const timeout = ms => (typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined);
  if (coin === 'BTC') {
    const res = await fetch(`https://mempool.space/api/address/${encodeURIComponent(address)}`, { cache: 'no-store', signal: timeout(12000) });
    if (res.status === 400) throw new Error('Ongeldig BTC-adres');
    if (!res.ok) throw new Error(`mempool.space gaf ${res.status}`);
    const j = await res.json();
    const cs = j.chain_stats || {};
    const sats = (+cs.funded_txo_sum || 0) - (+cs.spent_txo_sum || 0);
    return sats / 1e8;
  }
  if (coin === 'ETH') {
    const endpoints = ['https://ethereum-rpc.publicnode.com', 'https://cloudflare-eth.com'];
    let lastErr = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', signal: timeout(12000),
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [address, 'latest'] }),
        });
        if (!res.ok) throw new Error(`RPC gaf ${res.status}`);
        const j = await res.json();
        if (j.error) throw new Error(j.error.message || 'RPC-fout');
        if (typeof j.result !== 'string' || !/^0x[0-9a-f]*$/i.test(j.result)) throw new Error('Ongeldig RPC-antwoord');
        const wei = BigInt(j.result === '0x' ? '0x0' : j.result);
        return Number(wei / BigInt(1000000000)) / 1e9; // wei → gwei (exact) → ETH
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('ETH-saldo ophalen mislukt');
  }
  throw new Error(`Onbekende coin ${coin}`);
}

// Cache van on-chain saldi: per apparaat (niet gesynchroniseerd), zodat de app direct een waarde heeft.
const CHAIN_CACHE_KEY = 'investeringen-chain-v1';
const CHAIN_REFRESH_MS = 5 * 60 * 1000;
function loadChainCache() {
  try { const v = JSON.parse(localStorage.getItem(CHAIN_CACHE_KEY)); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  catch (e) { return {}; }
}

// Haal 1 jaar dagelijkse crypto-prijzen op (vul history bij eerste gebruik)
async function fetchCryptoHistory() {
  const toDays = prices => prices
    .map(([ts, p]) => ({ date: new Date(ts).toISOString().slice(0, 10), nav: +p.toFixed(2) }))
    .filter((h, i, arr) => i === 0 || h.date !== arr[i - 1].date);

  const [btc, eth, paxg] = await Promise.all([
    fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=eur&days=365&interval=daily').then(r => r.json()),
    fetch('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=eur&days=365&interval=daily').then(r => r.json()),
    fetch('https://api.coingecko.com/api/v3/coins/pax-gold/market_chart?vs_currency=eur&days=365&interval=daily').then(r => r.json()),
  ]);
  return {
    btcHistory:  toDays(btc.prices  || []),
    ethHistory:  toDays(eth.prices  || []),
    paxgHistory: toDays(paxg.prices || []),
  };
}

async function fetchJsonWithFallback(url, wrappers) {
  for (const wrap of wrappers) {
    try {
      const res = await fetch(wrap(url));
      if (!res.ok) continue;
      return await res.json();
    } catch {}
  }
  throw new Error('Geen data ontvangen');
}

async function fetchMetalHistory() {
  const end = Math.floor(Date.now() / 1000);
  const start = end - 730 * 86400;
  const wrappers = [
    u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy/?quest=${u}`,
    u => u,
  ];
  const yahoo = symbol =>
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${start}&period2=${end}&interval=1d`;
  const fxUrl = `https://api.frankfurter.dev/v1/${new Date(start * 1000).toISOString().slice(0,10)}..${new Date(end * 1000).toISOString().slice(0,10)}?base=USD&symbols=EUR`;
  const [gold, silver, fx] = await Promise.all([
    fetchJsonWithFallback(yahoo('GC=F'), wrappers),
    fetchJsonWithFallback(yahoo('SI=F'), wrappers),
    fetch(fxUrl).then(r => r.json()),
  ]);
  const fxRates = fx.rates || {};
  const toHistory = (data, converter) => {
    const result = data?.chart?.result?.[0];
    const ts = result?.timestamp || [];
    const closes = result?.indicators?.quote?.[0]?.close || [];
    return ts
      .map((t, i) => {
        const date = new Date(t * 1000).toISOString().slice(0, 10);
        const eur = fxRates[date]?.EUR;
        const close = closes[i];
        if (!eur || !close) return null;
        return { date, nav: +converter(close, eur).toFixed(2) };
      })
      .filter(Boolean)
      .filter((h, i, arr) => i === 0 || h.date !== arr[i - 1].date);
  };
  return {
    goldHistory: toHistory(gold, (usdOz, eur) => (usdOz * eur) / OZ_TO_GRAM),
    silverHistory: toHistory(silver, (usdOz, eur) => usdOz * eur),
  };
}

async function fetchMeesmanLatestFromWebsite() {
  const url = 'https://www.meesman.nl/onze-fondsen/aandelen-wereldwijd-totaal/';
  const wrappers = [
    u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy/?quest=${u}`,
    u => u,
  ];
  for (const wrap of wrappers) {
    try {
      const html = await fetch(wrap(url)).then(r => r.text());
      const normalizedHtml = html
        .replace(/&nbsp;|&#160;|&#xA0;/gi, ' ')
        .replace(/&#x20AC;|&#8364;|&euro;/gi, '€');
      const m = normalizedHtml.match(/Laatste\s+koers[\s\S]{0,360}?(?:€|EUR)\s*([0-9.,]+)[\s\S]{0,160}?\((\d{2}-\d{2}-\d{4})\)/i);
      if (!m) continue;
      const nav = +m[1].replace(/\./g, '').replace(',', '.');
      const [dd, mm, yyyy] = m[2].split('-');
      return { meesmanNavEur: nav, meesmanNavHistory: [{ date: `${yyyy}-${mm}-${dd}`, nav }] };
    } catch {}
  }
  throw new Error('Meesman website niet bereikbaar');
}

async function refreshPricesViaServer() {
  const res = await fetch(`/api/update-weekly-prices?ts=${Date.now()}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  const type = res.headers.get('content-type') || '';
  const body = type.includes('application/json') ? await res.json().catch(() => null) : null;
  if (!res.ok || !body?.ok) {
    const msg = body?.error || body?.errors?.join(' · ') || `Koers-update HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

// Haal 2 jaar Meesman NAV-geschiedenis op via Yahoo Finance (0P0001IJJX.F)
async function fetchMeesmanHistory() {
  const yf = 'https://query2.finance.yahoo.com/v8/finance/chart/0P0001IJJX.F?interval=1d&range=2y';
  // Probeer meerdere CORS-proxies na elkaar
  const wrappers = [
    u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy/?quest=${u}`,
    u => u, // direct (laatste poging, browser kan dit blokkeren)
  ];
  for (const wrap of wrappers) {
    try {
      const res = await fetch(wrap(yf));
      if (!res.ok) continue;
      const data = await res.json();
      const result = data?.chart?.result?.[0];
      if (!result?.timestamp?.length) continue;
      const ts      = result.timestamp;
      const closes  = result.indicators?.quote?.[0]?.close || [];
      const history = ts
        .map((t, i) => ({ date: new Date(t * 1000).toISOString().slice(0, 10), nav: closes[i] ? +closes[i].toFixed(4) : null }))
        .filter(h => h.nav != null)
        .filter((h, i, arr) => i === 0 || h.date !== arr[i - 1].date);
      if (history.length < 10) continue;
      return { meesmanNavEur: history[history.length - 1].nav, meesmanNavHistory: history };
    } catch {}
  }
  throw new Error('Geen historische data beschikbaar via Yahoo Finance');
}


// Roept de Supabase Edge Function "t212-proxy" aan (server-side, geen CORS, key blijft serverside).
// Geeft { account, transactions } terug. Vereist een gedeployde t212-proxy + T212_API_KEY secret.
async function fetchT212Bundle(supabaseConfig, mode = 'live') {
  if (!supabaseConfig?.url || !supabaseConfig?.anonKey) {
    throw new Error('Supabase niet geconfigureerd');
  }
  const url = supabaseConfig.url.trim().replace(/\/$/, '') + '/functions/v1/t212-proxy';
  const anon = supabaseConfig.anonKey.trim();
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anon,
        'Authorization': `Bearer ${anon}`,
      },
      body: JSON.stringify({ mode }),
    });
  } catch (e) {
    throw new Error('Kan de t212-proxy niet bereiken: ' + (e.message || 'netwerkfout') + ' — is de Edge Function gedeployd?');
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 404) throw new Error('t212-proxy niet gevonden (404) — deploy de Edge Function eerst in Supabase');
  if (!res.ok) throw new Error(data.error || `Proxy HTTP ${res.status}`);
  return data; // { account, transactions }
}

// Storting -> inleg, opname -> opname. Dedup via T212's unieke reference-veld.
function mapT212Transaction(t) {
  const typeMap = { DEPOSIT: 'inleg', WITHDRAW: 'opname' };
  const kind = typeMap[t.type];
  if (!kind) return null; // TRANSFER/FEE/dividend tellen niet mee in de bundle
  const ref = String(t.reference || t.id || '');
  if (!ref) return null;
  return {
    id: makeId(), party: 'trading212', type: kind,
    date: (t.dateTime || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
    amountEur: Math.abs(+t.amount || 0),
    note: `T212:${t.type}`, _t212Id: 'txn:' + ref,
  };
}

// Eén waardering-transactie met de huidige accountwaarde (zet lastTotalValue van de bundle).
function mapT212Valuation(account) {
  if (!account) return null;
  let value = null;
  if (account.kind === 'summary') {
    value = +account.data?.totalValue;
  } else if (account.kind === 'cash') {
    const d = account.data || {};
    // `total` = canonieke accountwaarde (incl. pieCash/blocked). Val alleen terug
    // op de som als `total` ontbreekt.
    value = (d.total != null)
      ? +d.total
      : (+d.invested || 0) + (+d.ppl || 0) + (+d.free || 0);
  }
  if (!(value > 0)) return null;
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: makeId(), party: 'trading212', type: 'waardering',
    date: today, valueEur: +value.toFixed(2),
    note: 'T212:accountwaarde', _t212Id: 'val:' + today, // 1 per dag, idempotent
  };
}


// ── Routing (S1) ──────────────────────────────────────────────
const SH_SETTINGS_SECTIONS = ['weergave', 'overzicht', 'koersen', 'wallet', 'sync', 't212', 'partijen', 'gegevens', 'gevarenzone', 'over'];
const SH_SECTION_TITLES = {
  weergave: 'Weergave', overzicht: 'Overzicht', koersen: 'Koersen', wallet: 'Wallet', sync: 'Synchronisatie', t212: 'Trading 212',
  partijen: 'Partijen', gegevens: 'Gegevens', gevarenzone: 'Gevarenzone', over: 'Over',
};
const SH_TITLES = { overzicht: 'Overzicht', posities: 'Posities', transacties: 'Transacties', plan: 'Plan', instellingen: 'Instellingen' };
const SH_WEEKDAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const SH_STALE_MS = 2 * 60 * 60 * 1000;

function shNormalizePath(path) {
  let p = String(path || '').trim();
  if (p.startsWith('#')) p = p.slice(1);
  if (!p.startsWith('/')) p = '/' + p;
  return p;
}

// → { route, redirect } ; redirect = normalized path to replace the hash with (or null)
function shParseRoute(hash) {
  const raw = shNormalizePath(hash || '');
  const qi = raw.indexOf('?');
  const pathPart = qi >= 0 ? raw.slice(0, qi) : raw;
  const qs = qi >= 0 ? raw.slice(qi + 1) : '';
  const query = {};
  try { new URLSearchParams(qs).forEach((v, k) => { query[k] = v; }); } catch (e) { /* ignore */ }
  const segs = pathPart.split('/').filter(Boolean).map(s => { try { return decodeURIComponent(s); } catch (e) { return s; } });
  const name = segs[0] || '';
  const mk = (n, params = {}) => ({ name: n, params, query });
  if (!name) return { route: mk('overzicht'), redirect: null };
  if (name === 'overzicht' && segs.length === 1) return { route: mk('overzicht'), redirect: null };
  if (name === 'posities' && segs.length <= 2) return { route: mk('posities', segs[1] ? { partyId: segs[1] } : {}), redirect: null };
  if (name === 'transacties' && segs.length === 1) return { route: mk('transacties'), redirect: null };
  if (name === 'plan') {
    if (segs.length === 1) return { route: mk('plan', { tab: 'verdeling' }), redirect: '/plan/verdeling' + (qs ? '?' + qs : '') };
    if (segs.length === 2 && (segs[1] === 'verdeling' || segs[1] === 'pensioen')) return { route: mk('plan', { tab: segs[1] }), redirect: null };
  }
  if (name === 'instellingen') {
    if (segs.length === 1) return { route: mk('instellingen', { section: null }), redirect: null };
    if (segs.length === 2 && SH_SETTINGS_SECTIONS.includes(segs[1])) return { route: mk('instellingen', { section: segs[1] }), redirect: null };
  }
  return { route: { name: 'overzicht', params: {}, query: {} }, redirect: '/overzicht' };
}

function shIsTyping(t) {
  if (!t) return false;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!t.isContentEditable;
}

function shSpotState(spotStatus) {
  const fetchedAt = spotStatus?.fetchedAt;
  const age = fetchedAt ? Date.now() - Date.parse(fetchedAt) : Infinity;
  if (spotStatus?.loading) return 'busy';
  if (spotStatus?.error) return 'error';
  if (!(age <= SH_STALE_MS)) return 'stale';
  return 'ok';
}

function shSyncInfo(app) {
  const s = app.syncStatus || {};
  if (!app.sbOk) return { status: 'off', label: 'Niet gekoppeld', time: null, icon: 'cloud' };
  if (s.loading) return { status: 'busy', label: 'Synchroniseren…', time: null, icon: 'loader' };
  if (s.error) return { status: 'error', label: 'Sync mislukt', time: null, icon: 'cloud-alert' };
  if (s.syncedAt) return { status: 'ok', label: 'Gesynchroniseerd', time: fmtTime(s.syncedAt), icon: 'cloud-check' };
  return { status: 'off', label: 'Nog niet gesynchroniseerd', time: null, icon: 'cloud' };
}

function shGreeting(h = new Date().getHours()) {
  if (h >= 6 && h < 12) return 'Goedemorgen';
  if (h >= 12 && h < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

injectStyles('shell', `
  .sh-app { display: grid; grid-template-columns: var(--sidebar-w) minmax(0, 1fr); height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg); transition: grid-template-columns var(--d-3) var(--ease); }
  .sh-app.is-collapsed { grid-template-columns: var(--sidebar-w-collapsed) minmax(0, 1fr); }
  .sh-sidebar { display: flex; flex-direction: column; min-width: 0; min-height: 0; padding: 10px; gap: 2px; overflow: hidden auto; z-index: var(--z-sidebar); user-select: none; -webkit-user-select: none; }
  .sh-brand { display: flex; align-items: center; gap: 10px; height: 40px; padding: 0 2px 0 6px; margin-bottom: 8px; }
  .sh-brand__name { font-weight: 600; font-size: 14px; letter-spacing: -.01em; white-space: nowrap; }
  .sh-brand .icon-btn { margin-left: auto; }
  .sh-nav { display: flex; flex-direction: column; gap: 1px; }
  .sh-nav-item { position: relative; display: flex; align-items: center; gap: 10px; height: 32px; padding: 0 8px; border-radius: var(--r-2); color: var(--fg-muted); font-size: 13.5px; font-weight: 500; white-space: nowrap; text-decoration: none; background: none; border: 0; cursor: pointer; font-family: inherit; width: 100%; text-align: left; transition: background var(--d-1) var(--ease), color var(--d-1) var(--ease); }
  .sh-nav-item:hover { background: var(--surface-2); color: var(--fg); }
  .sh-nav-item[aria-current="page"] { background: var(--surface-2); color: var(--fg); }
  .sh-nav-item[aria-current="page"]::before { content: ""; position: absolute; left: -10px; top: 8px; bottom: 8px; width: 2px; border-radius: 2px; background: var(--accent); }
  .sh-nav-item__count { margin-left: auto; font-size: 11.5px; color: var(--fg-subtle); }
  .sh-nav-item .kbd { margin-left: auto; opacity: 0; transition: opacity var(--d-1); }
  .sh-nav-item:hover .kbd { opacity: 1; }
  .sh-nav-item:hover .sh-nav-item__count { display: none; }
  .sh-nav-item--sub { height: 28px; padding-left: 34px; font-size: 13px; }
  .sh-nav-item__pip { width: 6px; height: 6px; border-radius: 50%; background: var(--warn); margin-left: auto; }
  .sh-sep { height: 1px; background: var(--border); margin: 12px 6px; flex: none; }
  .sh-ticker { padding: 0 2px; }
  .sh-ticker__head { display: flex; align-items: center; gap: 6px; height: 28px; padding: 0 0 0 6px; color: var(--fg-subtle); font-size: 11.5px; font-weight: 500; }
  .sh-ticker__state { display: inline-flex; align-items: center; gap: 5px; margin-left: auto; }
  .sh-ticker__state--stale, .sh-ticker__state--error { color: var(--warn); }
  .sh-ticker__head .icon-btn { width: 24px; height: 24px; }
  .sh-tick { display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; align-items: center; gap: 8px; height: 32px; padding: 0 6px; border-radius: var(--r-2); width: 100%; background: none; border: 0; color: inherit; font: inherit; cursor: pointer; text-align: left; }
  .sh-tick:hover { background: var(--surface-2); }
  .sh-tick__sym { font-size: 11px; font-weight: 600; color: var(--fg-muted); letter-spacing: .02em; }
  .sh-tick__spark { min-width: 0; overflow: hidden; display: flex; align-items: center; }
  .sh-tick__px { text-align: right; font-size: 12px; line-height: 14px; font-weight: 500; white-space: nowrap; }
  .sh-tick__px small { display: block; font-size: 10.5px; font-weight: 400; color: var(--fg-subtle); }
  .sh-side-foot { margin-top: auto; display: flex; flex-direction: column; gap: 6px; padding-top: 10px; border-top: 1px solid var(--border); }
  .sh-theme { display: flex; gap: 2px; padding: 2px; border-radius: var(--r-2); background: var(--surface-2); margin: 0 2px; }
  .sh-theme button { flex: 1; height: 26px; border-radius: 4px; display: grid; place-items: center; color: var(--fg-subtle); background: none; border: 0; cursor: pointer; }
  .sh-theme button[aria-pressed="true"] { background: var(--surface); color: var(--fg); box-shadow: inset 0 0 0 1px var(--border); }
  .sh-app.is-collapsed .sh-brand__name, .sh-app.is-collapsed .sh-nav-item__label, .sh-app.is-collapsed .sh-nav-item__count,
  .sh-app.is-collapsed .sh-nav-item .kbd, .sh-app.is-collapsed .sh-nav-item--sub, .sh-app.is-collapsed .sh-ticker,
  .sh-app.is-collapsed .sh-theme, .sh-app.is-collapsed .sh-ticker-sep { display: none; }
  .sh-app.is-collapsed .sh-brand { flex-direction: column; height: auto; gap: 8px; padding: 0; }
  .sh-app.is-collapsed .sh-brand .icon-btn { margin: 0; }
  .sh-app.is-collapsed .sh-nav-item { justify-content: center; padding: 0; }
  .sh-canvas { min-width: 0; min-height: 0; margin: 8px 8px 8px 0; border-radius: var(--r-4); background: var(--canvas); border: 1px solid var(--border); overflow: auto; overscroll-behavior: contain; scrollbar-gutter: stable; position: relative; }
  .sh-topbar { position: sticky; top: 0; z-index: var(--z-topbar); height: var(--topbar-h); display: flex; align-items: center; gap: 12px; padding: 0 16px 0 20px; background: color-mix(in srgb, var(--canvas) 95%, transparent); border-bottom: 1px solid var(--border); }
  .sh-topbar__title { font-size: 15px; font-weight: 600; letter-spacing: -.006em; margin: 0; white-space: nowrap; }
  .sh-topbar__right { margin-left: auto; display: flex; align-items: center; gap: 6px; }
  .sh-sync { display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 10px; border-radius: var(--r-2); font-size: 12.5px; color: var(--fg-muted); background: none; border: 0; cursor: pointer; font-family: inherit; white-space: nowrap; }
  .sh-sync:hover { background: var(--surface-2); color: var(--fg); }
  .sh-sync--error { color: var(--warn); }
  .sh-content { min-width: 0; }
  .sh-placeholder { padding: 48px 24px; color: var(--fg-subtle); font-size: 13px; text-align: center; }
  .sh-syncpanel { display: flex; flex-direction: column; gap: 10px; width: 300px; max-width: 100%; padding: 4px; }
  .sh-sheet .sh-syncpanel { width: auto; padding: 0; }
  .sh-syncpanel__status { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; }
  .sh-syncpanel__err { font-size: 12.5px; color: var(--warn); line-height: 18px; word-break: break-word; }
  .sh-syncpanel__meta { font-size: 12px; color: var(--fg-subtle); }
  .sh-link { background: none; border: 0; padding: 0; color: var(--accent); font: inherit; font-size: 13px; cursor: pointer; text-align: left; display: inline-flex; align-items: center; gap: 4px; }
  .sh-link:hover { text-decoration: underline; }
  .sh-mheader { position: sticky; top: 0; z-index: var(--z-mheader); padding-top: env(safe-area-inset-top); background: color-mix(in srgb, var(--bg) 95%, transparent); border-bottom: 1px solid var(--border); user-select: none; -webkit-user-select: none; }
  .sh-mheader__in { height: 56px; display: flex; align-items: center; gap: 10px; padding: 0 4px 0 16px; }
  .sh-mheader__in--back { padding-left: 4px; }
  .sh-mheader__greet { min-width: 0; }
  .sh-mheader__hello { font-size: 15px; font-weight: 650; line-height: 1.2; }
  .sh-mheader__sub { font-size: 13px; color: var(--fg-muted); line-height: 1.3; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
  .sh-mheader__sub--stale { color: var(--warn); }
  .sh-mheader__title { font-size: 18px; font-weight: 650; margin: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sh-mheader__actions { margin-left: auto; display: flex; flex: none; }
  .sh-mheader .icon-btn { width: 44px; height: 44px; color: var(--fg); }
  .sh-mheader .icon-btn--warn { color: var(--warn); }
  .sh-mheader .icon-btn--off { color: var(--fg-subtle); }
  .sh-mcontent { padding-bottom: calc(var(--tabbar-h) + 24px); min-width: 0; }
  .sh-tabbar { position: fixed; left: 0; right: 0; bottom: 0; z-index: var(--z-tabbar); height: var(--tabbar-h); padding-bottom: env(safe-area-inset-bottom); display: grid; grid-template-columns: repeat(5, 1fr); align-items: center; background: color-mix(in srgb, var(--bg) 96%, transparent); border-top: 1px solid var(--border); user-select: none; -webkit-user-select: none; }
  .sh-tab { height: 100%; min-height: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; color: var(--fg-subtle); font-size: 11px; font-weight: 550; background: none; border: 0; cursor: pointer; font-family: inherit; text-decoration: none; }
  .sh-tab[aria-current="page"] { color: var(--fg); }
  .sh-tab-add { justify-self: center; width: 56px; height: 40px; border-radius: 14px; background: var(--ink); color: var(--on-ink); display: grid; place-items: center; border: 0; cursor: pointer; transition: transform var(--d-1) var(--ease); }
  .sh-tab-add:active { transform: scale(.94); }
  .sh-confirm__typed { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
  .sh-confirm__check { margin-top: 12px; display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--fg); cursor: pointer; }
`);

// ── Shell components ─────────────────────────────────────────
function ShNavLink({ to, icon, label, current, count, pip, kbd, sub = false, testId, onNavigate, title }) {
  return (
    <a href={'#' + to} className={'sh-nav-item' + (sub ? ' sh-nav-item--sub' : '')} aria-current={current ? 'page' : undefined}
      data-testid={testId} title={title || label}
      onClick={e => { e.preventDefault(); onNavigate(to); }}>
      {icon && <Icon name={icon} size={16} />}
      <span className="sh-nav-item__label">{label}</span>
      {count != null && <span className="sh-nav-item__count num">{count}</span>}
      {pip && <span className="sh-nav-item__pip" role="img" aria-label="aandacht" />}
      {kbd && count == null && !pip && <Kbd>{kbd}</Kbd>}
    </a>
  );
}

function ShTicker({ app }) {
  const st = shSpotState(app.spotStatus);
  const fetchedAt = app.spotStatus?.fetchedAt;
  const errId = 'sh-ticker-err';
  return (
    <section className="sh-ticker" aria-label="Koersen">
      <div className="sh-ticker__head">
        <span>Koersen</span>
        <span className={'sh-ticker__state sh-ticker__state--' + st} aria-live="polite"
          title={st === 'error' ? app.spotStatus.error : undefined} aria-describedby={st === 'error' ? errId : undefined}>
          {st === 'error' ? <Icon name="triangle-alert" size={12} />
            : st === 'stale' ? <Icon name="clock" size={12} />
            : <StatusDot status={st} />}
          <span className="num">{st === 'stale' ? (fetchedAt ? 'Koersen van ' + fmtTime(fetchedAt) : 'Niet ververst') : fetchedAt ? fmtTime(fetchedAt) : '—'}</span>
          {st === 'error' && <span id={errId} className="sr-only">{app.spotStatus.error}</span>}
        </span>
        <IconButton icon="refresh-cw" label="Koersen verversen" size="sm" iconSize={13}
          data-testid="refresh-prices" disabled={!!app.spotStatus?.loading} onClick={e => app.refreshSpot(e)} />
      </div>
      {PRICE_ASSETS.map(a => {
        const hist = app.spots[a.histKey] || [];
        const values = hist.slice(-30).map(h => +h.nav).filter(v => Number.isFinite(v));
        const ch = priceChange(hist, 30);
        const last = hist.length ? hist[hist.length - 1] : null;
        const sub = a.key === 'meesman'
          ? (last ? 'NAV ' + fmtDateShort(last.date) : 'NAV')
          : a.unit === '/g' ? 'per gram' : a.unit === '/oz' ? 'per ounce'
          : ch == null ? '' : (ch > 0 ? '▲ ' : ch < 0 ? '▼ ' : '') + fmtPct(Math.abs(ch), { decimals: 1, sign: false }) + ' 30d';
        return (
          <button key={a.key} type="button" className="sh-tick" onClick={() => app.navigate('/instellingen/koersen')}
            title={`${a.label} · 30 dagen ${ch == null ? '—' : fmtPct(ch, { decimals: 1 })}`}>
            <span className="sh-tick__sym">{a.symbol}</span>
            <span className="sh-tick__spark">
              {window.Sparkline ? <Sparkline values={values} width={56} height={14} endTone="neutral" /> : null}
            </span>
            <span className="sh-tick__px num">{fmtMoney(app.spots[a.spotKey], { decimals: a.decimals })}<small>{sub}</small></span>
          </button>
        );
      })}
    </section>
  );
}

function ShSidebar({ app, collapsed, counts, driftWarn }) {
  const r = app.route;
  const go = to => app.navigate(to);
  const themes = [
    { v: 'system', icon: 'monitor', label: 'Systeem' },
    { v: 'light', icon: 'sun', label: 'Licht' },
    { v: 'dark', icon: 'moon', label: 'Donker' },
  ];
  return (
    <nav className="sh-sidebar" aria-label="Hoofdnavigatie">
      <div className="sh-brand">
        <AppLogo size={24} />
        <span className="sh-brand__name">Investeringen</span>
        <IconButton icon="panel-left" label={collapsed ? 'Zijbalk uitklappen ([)' : 'Zijbalk inklappen ([)'} pressed={collapsed}
          data-testid="sidebar-collapse" onClick={() => app.setPrefs({ sidebarCollapsed: !collapsed })} />
      </div>
      <div className="sh-nav">
        <ShNavLink to="/overzicht" icon="layout-dashboard" label="Overzicht" current={r.name === 'overzicht'} testId="nav-overzicht" onNavigate={go} />
        <ShNavLink to="/posities" icon="layers" label="Posities" current={r.name === 'posities'} count={counts.open} testId="nav-posities" onNavigate={go} />
        <ShNavLink to="/transacties" icon="arrow-left-right" label="Transacties" current={r.name === 'transacties'} count={counts.tx} testId="nav-transacties" onNavigate={go} />
        <ShNavLink to="/plan/verdeling" icon="target" label="Plan" current={r.name === 'plan' && collapsed} testId="nav-plan" onNavigate={go} />
        <ShNavLink to="/plan/verdeling" label="Verdeling" sub current={r.name === 'plan' && r.params.tab === 'verdeling'} pip={driftWarn}
          title={driftWarn ? 'Verdeling: categorie buiten bandbreedte' : 'Verdeling'} testId="nav-verdeling" onNavigate={go} />
        <ShNavLink to="/plan/pensioen" label="Pensioen" sub current={r.name === 'plan' && r.params.tab === 'pensioen'} testId="nav-pensioen" onNavigate={go} />
      </div>
      <div className="sh-sep sh-ticker-sep" />
      <ShTicker app={app} />
      <div className="sh-side-foot">
        <div className="sh-theme" role="group" aria-label="Thema">
          {themes.map(t => (
            <button key={t.v} type="button" aria-pressed={app.prefs.theme === t.v} aria-label={'Thema: ' + t.label.toLowerCase()} title={t.label}
              data-testid={'theme-' + t.v} onClick={() => app.setPrefs({ theme: t.v })}>
              <Icon name={t.icon} size={14} />
            </button>
          ))}
        </div>
        <ShNavLink to="/instellingen" icon="settings" label="Instellingen" kbd="," current={r.name === 'instellingen'} testId="nav-instellingen" onNavigate={go} />
      </div>
    </nav>
  );
}

function ShSyncPanel({ app, onDone }) {
  const info = shSyncInfo(app);
  const s = app.syncStatus || {};
  const done = () => { if (onDone) onDone(); };
  if (!app.sbOk) {
    return (
      <div className="sh-syncpanel">
        <div className="sh-syncpanel__status"><StatusDot status="off" />Niet gekoppeld</div>
        <div className="sh-syncpanel__meta">Supabase is niet ingesteld. Je gegevens staan alleen in deze browser.</div>
        <button type="button" className="sh-link" onClick={() => { done(); app.navigate('/instellingen/sync'); }}>Koppelen in Instellingen <Icon name="arrow-right" size={14} /></button>
      </div>
    );
  }
  return (
    <div className="sh-syncpanel" aria-live="polite">
      <div className="sh-syncpanel__status"><StatusDot status={info.status} />{info.label}{info.time ? ' ' + info.time : ''}</div>
      {s.error && <div className="sh-syncpanel__err">⚠ {s.error}</div>}
      <Button variant="primary" full icon="refresh-cw" disabled={!!s.loading} onClick={() => app.syncNow()}>Nu synchroniseren</Button>
      <Button full icon="download" disabled={!!s.loading} onClick={() => app.pullNow()}>Alles opnieuw ophalen</Button>
      <div className="sh-syncpanel__meta">Laatst gesynchroniseerd {s.syncedAt ? new Date(s.syncedAt).toLocaleTimeString('nl-NL') : '—'}</div>
      <button type="button" className="sh-link" onClick={() => { done(); app.navigate('/instellingen/sync'); }}>Instellingen… <Icon name="arrow-right" size={14} /></button>
    </div>
  );
}

function ShTopbar({ app, title, syncOpen, setSyncOpen }) {
  const anchor = React.useRef(null);
  const info = shSyncInfo(app);
  const privacy = !!app.prefs.privacy;
  return (
    <header className="sh-topbar">
      <h1 className="sh-topbar__title">{title}</h1>
      <div className="sh-topbar__right">
        <button ref={anchor} type="button" className={'sh-sync' + (info.status === 'error' ? ' sh-sync--error' : '')} data-testid="sync-status"
          aria-haspopup="dialog" aria-expanded={syncOpen}
          title={app.syncStatus?.error || (app.syncStatus?.syncedAt ? 'Laatst gesynchroniseerd ' + new Date(app.syncStatus.syncedAt).toLocaleTimeString('nl-NL') : info.label)}
          onClick={() => { if (!app.sbOk) app.navigate('/instellingen/sync'); else setSyncOpen(!syncOpen); }}>
          {info.status === 'error' ? <Icon name="triangle-alert" size={14} /> : <StatusDot status={info.status} />}
          <span>{info.label}</span>
          {info.time && <time className="num">{info.time}</time>}
        </button>
        <Popover open={syncOpen} onClose={() => setSyncOpen(false)} anchorRef={anchor} align="end" ariaLabel="Synchronisatie">
          <ShSyncPanel app={app} onDone={() => setSyncOpen(false)} />
        </Popover>
        <IconButton icon={privacy ? 'eye-off' : 'eye'} label={privacy ? 'Bedragen tonen (H)' : 'Bedragen verbergen (H)'} pressed={privacy}
          data-testid="privacy-toggle" onClick={() => app.setPrefs({ privacy: !privacy })} />
        <Button variant="primary" icon="plus" kbd="N" data-testid="add-tx" onClick={() => app.openTx()}>Transactie</Button>
      </div>
    </header>
  );
}

function ShMobileHeader({ app }) {
  const r = app.route;
  const privacy = !!app.prefs.privacy;
  const info = shSyncInfo(app);
  let back = null;
  let title = SH_TITLES[r.name] || 'Overzicht';
  if (r.name === 'posities' && r.params.partyId) {
    back = '/posities';
    const p = app.model?.byId?.[r.params.partyId]?.party;
    title = p ? p.name : 'Posities';
  } else if (r.name === 'instellingen' && r.params.section) {
    back = '/instellingen';
    title = SH_SECTION_TITLES[r.params.section] || 'Instellingen';
  }
  let greet = null;
  if (r.name === 'overzicht') {
    const now = new Date();
    const st = shSpotState(app.spotStatus);
    const fetchedAt = app.spotStatus?.fetchedAt;
    const dateTxt = `${SH_WEEKDAYS[now.getDay()]} ${now.getDate()} ${MONTHS_NL[now.getMonth()]}`;
    let priceTxt;
    if (st === 'stale') {
      if (fetchedAt) {
        const hrs = Math.max(2, Math.floor((Date.now() - Date.parse(fetchedAt)) / 3600000));
        priceTxt = `koersen ${hrs} uur oud`;
      } else priceTxt = 'koersen niet ververst';
    } else if (st === 'busy' && !fetchedAt) priceTxt = 'koersen ophalen…';
    else if (st === 'error') priceTxt = 'koersen ' + (fetchedAt ? fmtTime(fetchedAt) : '—') + ' ⚠';
    else priceTxt = 'koersen ' + (fetchedAt ? fmtTime(fetchedAt) : '—');
    greet = (
      <div className="sh-mheader__greet">
        <div className="sh-mheader__hello">{shGreeting(now.getHours())}</div>
        <div className={'sh-mheader__sub' + (st === 'stale' || st === 'error' ? ' sh-mheader__sub--stale' : '')}
          title={st === 'error' ? app.spotStatus.error : undefined}>
          {st === 'stale' && <Icon name="clock" size={13} />}
          <span className="num">{dateTxt} · {priceTxt}</span>
        </div>
      </div>
    );
  }
  const syncCls = info.status === 'error' ? 'icon-btn--warn' : info.status === 'off' ? 'icon-btn--off' : '';
  return (
    <header className="sh-mheader">
      <div className={'sh-mheader__in' + (back ? ' sh-mheader__in--back' : '')}>
        {back && <IconButton icon="chevron-left" label="Terug" iconSize={22} onClick={() => app.navigate(back)} />}
        {r.name === 'overzicht' && <AppLogo size={32} />}
        {greet || <h1 className="sh-mheader__title">{title}</h1>}
        <div className="sh-mheader__actions">
          <IconButton icon={privacy ? 'eye-off' : 'eye'} label={privacy ? 'Bedragen tonen' : 'Bedragen verbergen'} pressed={privacy} iconSize={20}
            data-testid="privacy-toggle" onClick={() => app.setPrefs({ privacy: !privacy })} />
          <IconButton icon={info.icon} label={'Synchronisatie: ' + info.label} iconSize={20} className={syncCls}
            badge={info.status === 'error' ? 'warn' : null} data-testid="sync-status" onClick={() => app.openSync()} />
          <IconButton icon="settings" label="Instellingen" iconSize={20} data-testid="nav-instellingen"
            onClick={() => app.navigate('/instellingen')} />
        </div>
      </div>
    </header>
  );
}

function ShTabBar({ app }) {
  const r = app.route;
  const tabs = [
    { name: 'overzicht', to: '/overzicht', icon: 'layout-dashboard', label: 'Overzicht' },
    { name: 'posities', to: '/posities', icon: 'layers', label: 'Posities' },
    null,
    { name: 'transacties', to: '/transacties', icon: 'arrow-left-right', label: 'Transacties' },
    { name: 'plan', to: '/plan/verdeling', icon: 'target', label: 'Plan' },
  ];
  return (
    <nav className="sh-tabbar" aria-label="Hoofdnavigatie">
      {tabs.map((t, i) => {
        if (!t) {
          return (
            <button key="add" type="button" className="sh-tab-add" aria-label="Transactie toevoegen" data-testid="add-tx"
              onClick={() => app.openTx()}>
              <Icon name="plus" size={24} strokeWidth={2.2} />
            </button>
          );
        }
        const active = r.name === t.name;
        return (
          <a key={t.name} href={'#' + t.to} className="sh-tab" aria-current={active ? 'page' : undefined} data-testid={'nav-' + t.name}
            onClick={e => {
              e.preventDefault();
              const atRoot = active && (t.name !== 'posities' || !r.params.partyId);
              if (atRoot) { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (er) { window.scrollTo(0, 0); } }
              else app.navigate(t.to);
            }}>
            <Icon name={t.icon} size={22} strokeWidth={active ? 2 : 1.75} />
            <span>{t.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

function ShConfirmDialog({ confirmState, onSettle }) {
  const opts = confirmState?.opts || {};
  const [typed, setTyped] = React.useState('');
  const [checked, setChecked] = React.useState(!!opts.checkbox?.defaultChecked);
  const typedOk = !opts.typed || typed.trim().toLowerCase() === String(opts.typed).trim().toLowerCase();
  const inputRef = React.useRef(null);
  return (
    <Dialog open={!!confirmState} onClose={() => onSettle(false, checked)} title={opts.title || 'Weet je het zeker?'} testId="confirm-dialog"
      initialFocusRef={opts.typed ? inputRef : undefined}
      actions={<>
        <Button variant="secondary" onClick={() => onSettle(false, checked)}>{opts.cancelLabel || 'Annuleren'}</Button>
        <Button variant={opts.danger === false ? 'primary' : 'danger'} disabled={!typedOk} data-testid="confirm-ok"
          onClick={() => { if (typedOk) onSettle(true, checked); }}>{opts.confirmLabel || 'Verwijderen'}</Button>
      </>}>
      {opts.body != null && <div>{opts.body}</div>}
      {opts.checkbox && (
        <label className="sh-confirm__check">
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />
          {opts.checkbox.label}
        </label>
      )}
      {opts.typed && (
        <div className="sh-confirm__typed">
          <label htmlFor="sh-confirm-typed">Typ <b>{opts.typed}</b> om te bevestigen</label>
          <input className="input" id="sh-confirm-typed" ref={inputRef} value={typed} autoComplete="off" autoCapitalize="off" spellCheck={false}
            onChange={e => setTyped(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && typedOk) { e.preventDefault(); onSettle(true, checked); } }} />
        </div>
      )}
    </Dialog>
  );
}

function ShScreen({ app }) {
  const name = app.route.name;
  const ph = label => <div className="sh-placeholder">{label} wordt geladen…</div>;
  if (name === 'posities') return window.PositiesScreen ? <PositiesScreen app={app} /> : ph('Posities');
  if (name === 'transacties') return window.TransactiesScreen ? <TransactiesScreen app={app} /> : ph('Transacties');
  if (name === 'plan') return window.PlanScreen ? <PlanScreen app={app} /> : ph('Plan');
  if (name === 'instellingen') return window.InstellingenScreen ? <InstellingenScreen app={app} /> : ph('Instellingen');
  return window.OverzichtScreen ? <OverzichtScreen app={app} /> : ph('Overzicht');
}

class ShErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error('[scherm]', error); }
  componentDidUpdate(prev) { if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null }); }
  render() {
    if (this.state.error) {
      return <div className="sh-placeholder">Dit scherm kon niet worden geladen: {String(this.state.error.message || this.state.error)}</div>;
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────
function App() {
  const [state, setState]           = React.useState(() => loadState());
  // tweaks zit binnen state.tweaks (gesynchroniseerd via Supabase).
  const tweaks = state.tweaks || {};
  const [liveSpot, setLiveSpot]     = React.useState({});
  const [spotStatus, setSpotStatus] = React.useState({ loading: false, error: null, fetchedAt: null });
  const [chainBalances, setChainBalances] = React.useState(loadChainCache);
  const [chainLoading, setChainLoading] = React.useState(false);
  const chainBalancesRef = React.useRef(chainBalances);
  chainBalancesRef.current = chainBalances;
  const chainTargetsRef = React.useRef([]);
  const refreshChainRef = React.useRef(null);
  React.useEffect(() => { try { localStorage.setItem(CHAIN_CACHE_KEY, JSON.stringify(chainBalances)); } catch (e) { /* ignore */ } }, [chainBalances]);
  const [t212Status, setT212Status] = React.useState({ loading: false, error: null, imported: 0, done: false });
  const [importMsg, setImportMsg]   = React.useState(null);
  const [supabaseConfig, setSupabaseConfig] = React.useState(loadSupabaseConfig);
  const [syncStatus, setSyncStatus] = React.useState({ loading: false, error: null, syncedAt: null });
  const syncTimerRef = React.useRef(null);
  const supabaseLoadedRef = React.useRef(false);
  const transactionsLoadedRef = React.useRef(false);
  const stateRef       = React.useRef(state);
  const pendingSaveRef = React.useRef(false);
  const saveQueueRef   = React.useRef(Promise.resolve());
  const skipNextAutosaveRef = React.useRef(false);
  const isMobile = useIsMobile();

  // ── UI prefs (per device) ──
  const [prefs, setPrefsRaw] = React.useState(() => loadUiPrefs(state));
  const setPrefs = React.useCallback(patch => {
    setPrefsRaw(p => {
      const delta = typeof patch === 'function' ? patch(p) : patch;
      const next = { ...p, ...(delta || {}) };
      saveUiPrefs(next);
      return next;
    });
  }, []);
  React.useEffect(() => { saveUiPrefs(prefs); }, []); // eslint-disable-line -- legt migratie eenmalig vast

  // ── Route ──
  const [route, setRoute] = React.useState(() => shParseRoute(window.location.hash).route);
  const routeRef = React.useRef(route);
  routeRef.current = route;
  const lastHashRef = React.useRef(null);

  // ── Overlays / confirm / toasts ──
  const [overlay, setOverlay] = React.useState(null);
  const overlayRef = React.useRef(null);
  const overlayPushedRef = React.useRef(false);
  const pendingBackRef = React.useRef(false);
  const queuedNavRef = React.useRef(null);
  const [syncPopOpen, setSyncPopOpen] = React.useState(false);
  const [confirmState, setConfirmState] = React.useState(null);
  const [toasts, setToasts] = React.useState([]);
  const toastSeqRef = React.useRef(0);
  const canvasRef = React.useRef(null);

  // Persist state to localStorage
  React.useEffect(() => { saveState(state); }, [state]);
  React.useEffect(() => { stateRef.current = state; }, [state]);

  // Persist Supabase config to localStorage
  React.useEffect(() => {
    try { localStorage.setItem(SUPABASE_CFG_KEY, JSON.stringify(supabaseConfig)); } catch {}
  }, [supabaseConfig]);

  // Live 'Vrij op rekening' (portfolio/financieel-over): los van de gesyncte state, nooit gepusht of geëxporteerd.
  const [financieelOver, setFinancieelOver] = React.useState(null);
  React.useEffect(() => {
    window.__setFinancieelOver = v => setFinancieelOver(v || null); // dev/test-haak
    return () => { delete window.__setFinancieelOver; };
  }, []);
  const applyRemoteData = React.useCallback(remoteData => {
    if (!remoteData) {
      transactionsLoadedRef.current = false;
      return;
    }
    const remote = { ...remoteData };
    const _transactionsLoaded = remote._transactionsLoaded;
    delete remote._transactionsLoaded;
    if (remote._financieelOverLoaded) {
      const fo = remote._financieelOver || null;
      setFinancieelOver(prev => (JSON.stringify(prev) === JSON.stringify(fo) ? prev : fo));
    }
    delete remote._financieelOverLoaded;
    delete remote._financieelOver;
    transactionsLoadedRef.current = _transactionsLoaded !== false;
    setState(s => {
      const meesman = normalizeMeesmanHistory(
        mergePriceHistory(s.meesmanNavHistory, remote.meesmanNavHistory)
      );
      const mergedDeletedTransactionIds = mergeDeletedIds(remote.deletedTransactionIds, s.deletedTransactionIds);
      const remoteTxs = normalizeTransactions(remote.transactions || [])
        .filter(t => !isDeletedByTombstone(t, mergedDeletedTransactionIds));
      const mergedTxs = normalizeTransactions(mergeByNewest(remoteTxs, s.transactions || [])
        .filter(t => !isDeletedByTombstone(t, mergedDeletedTransactionIds)))
        .sort((a, b) => a.date.localeCompare(b.date));

      const mergedDeletedPartyIds = mergeDeletedIds(remote.deletedPartyIds, s.deletedPartyIds);
      const hasPartyTombstones = Object.keys(mergedDeletedPartyIds).length > 0;
      const mergedParties = migrateCryptoPosts(normalizeParties(mergeByNewest(remote.parties, s.parties))
        .filter(p => !isDeletedByTombstone(p, mergedDeletedPartyIds)), mergedDeletedPartyIds);
      const mergedTweaks = { ...(s.tweaks || {}), ...(remote.tweaks || {}) };

      return {
        ...s,
        ...remote,
        transactions:      mergedTxs,
        deletedTransactionIds: mergedDeletedTransactionIds,
        deletedPartyIds:   mergedDeletedPartyIds,
        parties:           (mergedParties.length || hasPartyTombstones) ? mergedParties : normalizeParties(s.parties || []),
        tweaks:            mergedTweaks,
        meesmanNavEur:     meesman.currentNav,
        meesmanNavHistory: meesman.history,
        goldHistory:       mergePriceHistory(s.goldHistory,   remote.goldHistory),
        silverHistory:     mergePriceHistory(s.silverHistory, remote.silverHistory),
        btcHistory:        mergePriceHistory(s.btcHistory,    remote.btcHistory),
        ethHistory:        mergePriceHistory(s.ethHistory,    remote.ethHistory),
        paxgHistory:       mergePriceHistory(s.paxgHistory,   remote.paxgHistory),
        portfolioDailyValues: remote.portfolioDailyValues?.length ? remote.portfolioDailyValues : (s.portfolioDailyValues || []),
      };
    });
  }, []);

  // Laad data van Supabase bij opstarten
  const didInitialLoad = React.useRef(false);
  React.useEffect(() => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) return;
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;
    const client = getSupabaseClient(supabaseConfig);
    if (!client) return;
    // Eerste load is geen gebruikersactie: geen "Synchroniseren…" tonen.
    supabaseLoadAll(client)
      .then(remoteData => {
        skipNextAutosaveRef.current = true;
        applyRemoteData(remoteData);
        supabaseLoadedRef.current = true;
        setSyncStatus({ loading: false, error: null, syncedAt: new Date().toISOString() });
      })
      .catch(e => {
        supabaseLoadedRef.current = true;
        transactionsLoadedRef.current = false;
        setSyncStatus({ loading: false, error: e.message, syncedAt: null });
      });
  }, [supabaseConfig.url, supabaseConfig.anonKey, applyRemoteData]);

  // Haal 1 jaar crypto-geschiedenis op als de history leeg is
  React.useEffect(() => {
    if ((state.btcHistory || []).length > 10) return;
    fetchCryptoHistory()
      .then(h => setState(s => ({ ...s, ...h })))
      .catch(() => {});
  }, []); // eenmalig bij mount

  // Haal 2 jaar goud/zilver historie op voor de waarde-over-tijd grafiek
  React.useEffect(() => {
    if ((state.goldHistory || []).length > 20 && (state.silverHistory || []).length > 20) return;
    fetchMetalHistory()
      .then(h => setState(s => ({
        ...s,
        goldHistory: mergePriceHistory(s.goldHistory, h.goldHistory),
        silverHistory: mergePriceHistory(s.silverHistory, h.silverHistory),
      })))
      .catch(() => {});
  }, []); // eenmalig bij mount

  const runSaveSnapshotToSupabase = React.useCallback(snapshot => {
    const client = getSupabaseClient(supabaseConfig);
    if (!client) return Promise.resolve(false);
    const jobs = [supabaseSaveSettings(client, snapshot)];
    jobs.push(supabaseSyncTransactions(client, snapshot.transactions || [], snapshot.deletedTransactionIds || {}));
    return Promise.all(jobs)
      .then(() => setSyncStatus(s => ({ ...s, error: null, syncedAt: new Date().toISOString() })))
      .then(() => true);
  }, [supabaseConfig]);

  const saveSnapshotToSupabase = React.useCallback(snapshot => {
    const job = saveQueueRef.current
      .catch(() => {})
      .then(() => runSaveSnapshotToSupabase(snapshot));
    saveQueueRef.current = job;
    return job;
  }, [runSaveSnapshotToSupabase]);

  const setSyncedState = React.useCallback(updater => {
    let shouldSave = false;
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next !== prev && !shouldSave) {
        shouldSave = true;
        skipNextAutosaveRef.current = true;
        pendingSaveRef.current = true;
        clearTimeout(syncTimerRef.current);
        Promise.resolve().then(() => {
          pendingSaveRef.current = false;
          return saveSnapshotToSupabase(next)
            .catch(e => {
              pendingSaveRef.current = true;
              setSyncStatus(s => ({ ...s, error: e.message }));
              return false;
            });
        });
      }
      return next;
    });
  }, [saveSnapshotToSupabase]);

  // Save NU (gebruikt bij pagehide/visibilitychange/focus).
  const flushSave = React.useCallback(() => {
    if (!pendingSaveRef.current) return Promise.resolve(false);
    clearTimeout(syncTimerRef.current);
    pendingSaveRef.current = false;
    return saveSnapshotToSupabase(stateRef.current)
      .catch(e => {
        pendingSaveRef.current = true;
        setSyncStatus(s => ({ ...s, error: e.message }));
        return false;
      });
  }, [saveSnapshotToSupabase]);

  // silent: achtergrond-pull (8 s timer, focus, prijs-refresh) → geen "Synchroniseren…" en fout niet wissen bij start.
  const reloadSupabase = React.useCallback(({ silent = false } = {}) => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) return Promise.resolve(false);
    const client = getSupabaseClient(supabaseConfig);
    if (!client) return Promise.resolve(false);
    if (!silent) setSyncStatus(s => ({ ...s, loading: true, error: null }));
    return supabaseLoadAll(client)
      .then(remoteData => {
        skipNextAutosaveRef.current = true;
        applyRemoteData(remoteData);
        supabaseLoadedRef.current = true;
        setSyncStatus({ loading: false, error: null, syncedAt: new Date().toISOString() });
        return true;
      })
      .catch(e => {
        setSyncStatus(s => ({ ...s, loading: false, error: e.message }));
        return false;
      });
  }, [supabaseConfig, applyRemoteData]);

  // Houd geopende laptop- en telefoontabs gelijk zonder handmatig herladen.
  React.useEffect(() => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) return;
    const pullWhenVisible = () => {
      if (document.visibilityState === 'hidden') return;
      reloadSupabase({ silent: true });
    };
    const timer = setInterval(pullWhenVisible, SUPABASE_PULL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [supabaseConfig.url, supabaseConfig.anonKey, reloadSupabase]);

  // Automatisch opslaan: korte debounce. Markeer als "pending" zodat flush kan vuren.
  React.useEffect(() => {
    const client = getSupabaseClient(supabaseConfig);
    if (!client) return;
    if (!supabaseLoadedRef.current) return; // wacht op eerste load zodat we niets overschrijven
    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }
    pendingSaveRef.current = true;
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      pendingSaveRef.current = false;
      saveSnapshotToSupabase(state)
        .catch(e => {
          pendingSaveRef.current = true;
          setSyncStatus(s => ({ ...s, error: e.message }));
        });
    }, 350);
  }, [state]); // eslint-disable-line

  // Flush bij wegnavigeren — kritiek voor mobiel waar de app vaak in achtergrond verdwijnt
  React.useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushSave();
    };
    const onPageHide = () => flushSave();
    const onShow = () => {
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      flushSave().finally(() => reloadSupabase({ silent: true }));
    };
    document.addEventListener('visibilitychange', onHide);
    document.addEventListener('visibilitychange', onShow);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onShow);
    window.addEventListener('focus', onShow);
    window.addEventListener('online', onShow);
    window.addEventListener('beforeunload', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      document.removeEventListener('visibilitychange', onShow);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onShow);
      window.removeEventListener('focus', onShow);
      window.removeEventListener('online', onShow);
      window.removeEventListener('beforeunload', onPageHide);
    };
  }, [flushSave, reloadSupabase]);

  // Thema toepassen op <html> (per apparaat, uit prefs)
  React.useEffect(() => {
    const el = document.documentElement;
    [...el.classList].forEach(c => { if (c.startsWith('theme-') || c.startsWith('preview-')) el.classList.remove(c); });
    if (prefs.theme === 'light' || prefs.theme === 'dark') el.setAttribute('data-theme', prefs.theme);
    else el.removeAttribute('data-theme');
    if (prefs.cvd) el.setAttribute('data-cvd', 'on'); else el.removeAttribute('data-cvd');
    const ml = document.getElementById('meta-theme-light');
    const md = document.getElementById('meta-theme-dark');
    if (ml) ml.setAttribute('content', prefs.theme === 'dark' ? '#0a0b0e' : '#eff1f3');
    if (md) md.setAttribute('content', prefs.theme === 'light' ? '#eff1f3' : '#0a0b0e');
  }, [prefs.theme, prefs.cvd]);

  // Schrijft tweaks naar state.tweaks → wordt automatisch naar Supabase gesynchroniseerd
  const updateTweaks = React.useCallback(updater => {
    setState(s => {
      const prev = s.tweaks || {};
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: next }, '*'); } catch {}
      return { ...s, tweaks: next };
    });
  }, []);

  const displayTweaks = React.useMemo(() => ({ ...tweaks, ...liveSpot }), [tweaks, liveSpot]);

  const refreshSpot = React.useCallback(async (options = {}) => {
    const manual = options?.manual === true || options?.type === 'click';
    const autoServerRefresh = !manual && claimAutomaticServerPriceRefresh();
    setSpotStatus(s => ({ ...s, loading: true, error: null }));
    // On-chain wallet-saldi mee verversen (automatisch hooguit elke 5 min, handmatig altijd).
    if (refreshChainRef.current) refreshChainRef.current({ force: manual });

    let serverRefreshFailed = false;
    if (manual || autoServerRefresh) {
      try {
        const serverResult = await refreshPricesViaServer();
        await reloadSupabase({ silent: true });
        if (manual) {
          const warnings = (serverResult.warnings || []).filter(Boolean);
          setSpotStatus({
            loading: false,
            error: warnings.length ? warnings.join(' · ') : null,
            fetchedAt: new Date().toISOString(),
          });
          return;
        }
      } catch (e) {
        serverRefreshFailed = true;
        console.warn('[prijzen] server-refresh mislukt, probeer browser fallback:', e.message);
      }
    }

    const refreshMeesmanInBrowser = manual || serverRefreshFailed;
    const [metals, crypto, meesman] = await Promise.allSettled([
      fetchSpotPrices(),
      fetchCryptoPrices(),
      refreshMeesmanInBrowser ? fetchMeesmanLatestFromWebsite() : Promise.resolve(null),
    ]);
    const updates = {};
    const priceRows = [];
    const today = new Date().toISOString().slice(0, 10);
    if (metals.status === 'fulfilled') {
      updates.goldSpotEurPerGram    = +metals.value.goldSpotEurPerGram.toFixed(2);
      updates.silverSpotEurPerOunce = +metals.value.silverSpotEurPerOunce.toFixed(2);
      priceRows.push(
        { asset: 'gold_eur_per_gram', date: today, nav: +metals.value.goldSpotEurPerGram.toFixed(8), source: 'browser refresh' },
        { asset: 'silver_eur_per_ounce', date: today, nav: +metals.value.silverSpotEurPerOunce.toFixed(8), source: 'browser refresh' },
      );
    }
    if (crypto.status === 'fulfilled') {
      updates.btcSpotEur  = +crypto.value.btcSpotEur.toFixed(2);
      updates.ethSpotEur  = +crypto.value.ethSpotEur.toFixed(2);
      updates.paxgSpotEur = +crypto.value.paxgSpotEur.toFixed(2);
      priceRows.push(
        { asset: 'btc_eur', date: today, nav: +crypto.value.btcSpotEur.toFixed(8), source: 'browser refresh' },
        { asset: 'eth_eur', date: today, nav: +crypto.value.ethSpotEur.toFixed(8), source: 'browser refresh' },
        { asset: 'paxg_eur', date: today, nav: +crypto.value.paxgSpotEur.toFixed(8), source: 'browser refresh' },
      );
    }
    const meesmanEntry = meesman.status === 'fulfilled' ? meesman.value?.meesmanNavHistory?.[0] : null;
    if (refreshMeesmanInBrowser && meesmanEntry?.date && +meesmanEntry.nav > 0) {
      priceRows.push({
        asset: 'meesman_aandelen_wereldwijd_totaal',
        date: meesmanEntry.date,
        nav: +meesmanEntry.nav,
        source: 'meesman.nl',
      });
    }
    if (Object.keys(updates).length || (refreshMeesmanInBrowser && meesmanEntry?.date && +meesmanEntry.nav > 0)) {
      // Sla op in liveSpot (directe weergave) én tweaks (persistent na refresh)
      if (Object.keys(updates).length) {
        setLiveSpot(prev => ({ ...prev, ...updates }));
        updateTweaks(tw => ({ ...tw, ...updates }));
      }
      // Sla vandaag's spot op in de history voor de grafiek
      setState(s => {
        const hist = {};
        if (updates.goldSpotEurPerGram)    hist.goldHistory   = appendToHistory(s.goldHistory,   today, updates.goldSpotEurPerGram);
        if (updates.silverSpotEurPerOunce) hist.silverHistory = appendToHistory(s.silverHistory, today, updates.silverSpotEurPerOunce);
        if (updates.btcSpotEur)            hist.btcHistory    = appendToHistory(s.btcHistory,    today, updates.btcSpotEur);
        if (updates.ethSpotEur)            hist.ethHistory    = appendToHistory(s.ethHistory,    today, updates.ethSpotEur);
        if (updates.paxgSpotEur)           hist.paxgHistory   = appendToHistory(s.paxgHistory,   today, updates.paxgSpotEur);
        if (refreshMeesmanInBrowser && meesmanEntry?.date && +meesmanEntry.nav > 0) {
          const normalized = normalizeMeesmanHistory(mergePriceHistory(s.meesmanNavHistory, [meesmanEntry]));
          hist.meesmanNavHistory = normalized.history;
          hist.meesmanNavEur = normalized.currentNav;
        }
        return Object.keys(hist).length ? { ...s, ...hist } : s;
      });
    }

    let priceSaveError = null;
    if ((manual || serverRefreshFailed) && priceRows.length) {
      const client = getSupabaseClient(supabaseConfig);
      if (client) {
        try {
          await supabaseUpsertAssetPriceRows(client, priceRows);
          await reloadSupabase({ silent: true });
        } catch (e) {
          priceSaveError = `Koersopslag: ${e.message}`;
          setSyncStatus(s => ({ ...s, error: e.message }));
        }
      }
    }

    const errors = [
      metals.status === 'rejected' ? `Goud/zilver: ${metals.reason?.message}` : null,
      crypto.status === 'rejected' ? `Crypto: ${crypto.reason?.message}`       : null,
      refreshMeesmanInBrowser && meesman.status === 'rejected' ? `Meesman: ${meesman.reason?.message}` : null,
      priceSaveError,
    ].filter(Boolean);

    setSpotStatus({ loading: false, error: errors.length ? errors.join(' · ') : null, fetchedAt: new Date().toISOString() });
  }, [updateTweaks, supabaseConfig, reloadSupabase]);

  // Meesman NAV handmatig bijwerken
  const updateMeesmanNav = React.useCallback((nav) => {
    const today = new Date().toISOString().slice(0, 10);
    const entry = { date: today, nav: +nav };
    setSyncedState(s => {
      const normalized = normalizeMeesmanHistory(mergePriceHistory(s.meesmanNavHistory, [entry]));
      return { ...s, meesmanNavEur: normalized.currentNav, meesmanNavHistory: normalized.history };
    });
    const client = getSupabaseClient(supabaseConfig);
    if (client) {
      supabaseUpsertAssetPriceRows(client, [{
        asset: 'meesman_aandelen_wereldwijd_totaal',
        date: today,
        nav: +nav,
        source: 'handmatig',
      }])
        .then(() => reloadSupabase({ silent: true }))
        .catch(e => setSyncStatus(s => ({ ...s, error: e.message })));
    }
  }, [setSyncedState, supabaseConfig, reloadSupabase]);

  // Haal historische Meesman data op via Yahoo Finance
  const [meesmanHistStatus, setMeesmanHistStatus] = React.useState({ loading: false, error: null, done: false });
  const loadMeesmanHistory = React.useCallback(async () => {
    setMeesmanHistStatus({ loading: true, error: null, done: false });
    try {
      const result = await fetchMeesmanHistory();
      const latest = await fetchMeesmanLatestFromWebsite().catch(() => null);
      setState(s => {
        // Samenvoegen: bestaande handmatige entries bewaren, Yahoo-data als basis
        const officialLatest = latest?.meesmanNavHistory?.[0] || MEESMAN_NAV_SEED_HISTORY[MEESMAN_NAV_SEED_HISTORY.length - 1];
        const merged = mergePriceHistory(
          result.meesmanNavHistory.filter(h => h.date <= officialLatest.date),
          [...(s.meesmanNavHistory || []), ...(latest?.meesmanNavHistory || [])]
        );
        const normalized = normalizeMeesmanHistory(merged);
        return { ...s, meesmanNavEur: officialLatest.nav || normalized.currentNav, meesmanNavHistory: normalized.history };
      });
      setMeesmanHistStatus({ loading: false, error: null, done: true });
    } catch (e) {
      setMeesmanHistStatus({ loading: false, error: e.message, done: false });
    }
  }, []);

  // Auto-fetch bij eerste keer opstarten als history leeg/schaars is
  React.useEffect(() => {
    if ((state.meesmanNavHistory || []).length < 20) loadMeesmanHistory();
  }, []); // eslint-disable-line

  // ── Toasts & confirm ──
  const dismissToast = React.useCallback(id => setToasts(ts => ts.filter(t => t.id !== id)), []);
  const toast = React.useCallback((text, { action, duration } = {}) => {
    const id = ++toastSeqRef.current;
    setToasts(ts => [...ts.slice(-2), { id, text, action }]);
    setTimeout(() => dismissToast(id), duration || (action ? 6000 : 2200));
    return id;
  }, [dismissToast]);

  const confirmFn = React.useCallback(opts => new Promise(resolve => {
    setConfirmState({ opts: opts || {}, resolve, key: Date.now() });
  }), []);
  const settleConfirm = React.useCallback((ok, checked) => {
    setConfirmState(c => {
      if (c) setTimeout(() => c.resolve({ ok: !!ok, checked: !!checked }), 0);
      return null;
    });
  }, []);

  const importT212 = React.useCallback(async () => {
    setT212Status({ loading: true, error: null, imported: 0, done: false });
    try {
      const { account, transactions = [], partial = false } =
        await fetchT212Bundle(supabaseConfig, tweaks.t212Mode || 'live');

      const existingIds = new Set(state.transactions.filter(t => t._t212Id).map(t => t._t212Id));

      // Stortingen -> inleg, opnames -> opname (dedup op T212 reference, idempotent).
      const depTxs = transactions
        .map(mapT212Transaction)
        .filter(tx => tx && !existingIds.has(tx._t212Id));

      // Huidige accountwaarde -> waardering. ALTIJD meenemen (geen dedup-guard):
      // de kept-filter hieronder vervangt de waardering-van-vandaag, zodat een
      // her-import de waarde ververst i.p.v. de eerste meting te bevriezen.
      const valTx = mapT212Valuation(account);
      const newTxs = [...depTxs];
      if (valTx) newTxs.push(valTx);

      if (newTxs.length > 0) {
        const now = new Date().toISOString();
        setSyncedState(s => {
          const stamped = newTxs.map(tx => ({ ...tx, updatedAt: now }));
          const deletedTransactionIds = { ...(s.deletedTransactionIds || {}) };
          stamped.forEach(tx => { delete deletedTransactionIds[tx.id]; });
          // Vervang een bestaande waardering-van-vandaag zodat er max. één per dag is.
          const valIds = new Set(stamped.filter(t => t.type === 'waardering').map(t => t._t212Id));
          const kept = s.transactions.filter(
            t => !(t.party === 'trading212' && t.type === 'waardering' && valIds.has(t._t212Id))
          );
          return { ...s, transactions: [...kept, ...stamped], deletedTransactionIds };
        });
      }
      const note = partial ? ' (historie deels — draai nog eens voor de rest)' : '';
      setT212Status({ loading: false, error: null, imported: depTxs.length, done: true, note });
      toast(`${depTxs.length} storting(en) geïmporteerd`);
    } catch (e) {
      setT212Status({ loading: false, error: e.message || 'Importfout', imported: 0, done: false });
    }
  }, [supabaseConfig, tweaks.t212Mode, state.transactions, setSyncedState, toast]);

  React.useEffect(() => {
    refreshSpot();
    const t = setInterval(refreshSpot, 30 * 1000);
    return () => clearInterval(t);
  }, [refreshSpot]);

  const resetData = React.useCallback(async () => {
    const res = await confirmFn({
      title: 'Terug naar begindata?',
      body: 'Alle transacties wissen en terug naar de seed data?',
      confirmLabel: 'Terugzetten',
      typed: 'terugzetten',
    });
    if (!res.ok) return false;
    localStorage.removeItem('investeringen-v3');
    setState(loadState());
    return true;
  }, [confirmFn]);

  const deleteT212Txs = React.useCallback(async () => {
    const ids = stateRef.current.transactions.filter(t => t.party === 'trading212').map(t => t.id);
    const count = ids.length;
    const res = await confirmFn({
      title: 'Alle Trading 212-transacties verwijderen?',
      body: `${count} Trading 212 transacties verwijderen?`,
      confirmLabel: 'Verwijderen',
    });
    if (!res.ok) return false;
    setSyncedState(s => {
      const deletedAt = new Date().toISOString();
      const deletedTransactionIds = { ...(s.deletedTransactionIds || {}) };
      ids.forEach(id => { deletedTransactionIds[id] = deletedAt; });
      return { ...s, transactions: s.transactions.filter(t => t.party !== 'trading212'), deletedTransactionIds };
    });
    setT212Status({ loading: false, error: null, imported: 0, done: false });
    toast(`${count} transacties verwijderd`);
    return true;
  }, [setSyncedState, confirmFn, toast]);

  const syncNow = React.useCallback(async () => {
    const client = getSupabaseClient(supabaseConfig);
    if (!client) return;
    setSyncStatus({ loading: true, error: null, syncedAt: null });
    try {
      await Promise.all([
        supabaseSaveSettings(client, state),
        supabaseSyncTransactions(client, state.transactions || [], state.deletedTransactionIds || {}),
      ]);
      setSyncStatus({ loading: false, error: null, syncedAt: new Date().toISOString() });
    } catch (e) {
      setSyncStatus({ loading: false, error: e.message, syncedAt: null });
    }
  }, [supabaseConfig, state]);

  const pullNow = React.useCallback(
    () => flushSave().finally(() => reloadSupabase({ silent: false })),
    [flushSave, reloadSupabase]
  );

  const exportData = React.useCallback(() => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `investeringen-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }, [state]);

  const importData = React.useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.transactions || !Array.isArray(data.transactions)) {
          const text = 'Ongeldig bestand — geen transacties gevonden';
          setImportMsg({ ok: false, text }); toast(text); return;
        }
        if (!data.widgets)       data.widgets       = DEFAULT_WIDGETS.map(w => ({ ...w }));
        if (!data.parties || !data.parties.length) {
          // Migreer legacy customParties + seed defaults
          const ids = new Set();
          const merged = [];
          for (const p of [...PARTIES, ...(data.customParties || [])]) {
            if (!ids.has(p.id)) { ids.add(p.id); merged.push(p); }
          }
          data.parties = merged;
        }
        delete data.customParties;
        if (!data.hiddenParties) data.hiddenParties = [];
        if (!data.tileMetrics)   data.tileMetrics   = {};
        if (!data.deletedTransactionIds) data.deletedTransactionIds = {};
        if (!data.deletedPartyIds) data.deletedPartyIds = {};
        if (!data.tweaks)        data.tweaks        = { ...(window.TWEAKS || {}) };
        setSyncedState(data);
        const text = `${data.transactions.length} transacties geladen`;
        setImportMsg({ ok: true, text }); toast(text);
      } catch {
        const text = 'Kon bestand niet lezen — geldig JSON?';
        setImportMsg({ ok: false, text }); toast(text);
      }
    };
    reader.readAsText(file);
  }, [setSyncedState, toast]);

  // spots: live prijzen + historische reeksen uit state/Supabase.
  // Gekeyed op een goedkope signatuur zodat 8-s pulls met identieke arrays niet herberekenen.
  const histSig = h => (h && h.length ? h.length + ':' + h[h.length - 1].date : '0');
  const meesmanNavResolved = state.meesmanNavEur ?? displayTweaks.meesmanNavEur ?? 100.4;
  const meesmanHistResolved = (state.meesmanNavHistory?.length ? state.meesmanNavHistory : null)
    ?? displayTweaks.meesmanNavHistory ?? [];
  const spotsKey = [
    displayTweaks.goldSpotEurPerGram, displayTweaks.silverSpotEurPerOunce,
    displayTweaks.btcSpotEur, displayTweaks.ethSpotEur, displayTweaks.paxgSpotEur,
    meesmanNavResolved, histSig(meesmanHistResolved),
    histSig(state.goldHistory), histSig(state.silverHistory),
    histSig(state.btcHistory), histSig(state.ethHistory), histSig(state.paxgHistory),
    Object.entries(chainBalances || {}).map(([k, v]) => `${k}:${v && v.address}:${v && v.qty}`).join(','),
  ].join('|');
  const spots = React.useMemo(() => ({
    goldSpotEurPerGram:    displayTweaks.goldSpotEurPerGram,
    silverSpotEurPerOunce: displayTweaks.silverSpotEurPerOunce,
    btcSpotEur:            displayTweaks.btcSpotEur,
    ethSpotEur:            displayTweaks.ethSpotEur,
    paxgSpotEur:           displayTweaks.paxgSpotEur,
    // Meesman: uit state, tweaks als fallback
    meesmanNavEur:         meesmanNavResolved,
    meesmanNavHistory:     meesmanHistResolved,
    goldHistory:           state.goldHistory   || [],
    silverHistory:         state.silverHistory || [],
    btcHistory:            state.btcHistory    || [],
    ethHistory:            state.ethHistory    || [],
    paxgHistory:           state.paxgHistory   || [],
    chainBalances:         chainBalances || {},
  }), [spotsKey]); // eslint-disable-line

  // state.parties is dé bron van waarheid (gesynced via Supabase). Fallback op seed PARTIES
  // alleen zolang er nog nooit partijen (of tombstones) waren.
  const allParties = React.useMemo(() => {
    const list = state.parties; const tomb = state.deletedPartyIds || {};
    return (Array.isArray(list) && (list.length > 0 || Object.keys(tomb).length > 0)) ? migrateCryptoPosts(list, tomb) : PARTIES;
  }, [state.parties, state.deletedPartyIds]);
  const allPartiesRef = React.useRef(allParties);
  allPartiesRef.current = allParties;

  // ── On-chain saldi (alleen-lezen, publieke adressen van self-custody sub-holdings) ──
  const chainTargets = React.useMemo(() => allParties
    .filter(p => p && p.unit === 'crypto' && p.postId && p.address && CRYPTO_COIN_BY_KEY[p.coin])
    .map(p => ({ id: p.id, coin: p.coin, address: String(p.address).trim() })), [allParties]);
  chainTargetsRef.current = chainTargets;
  const chainSig = chainTargets.map(t => t.id + ':' + t.address).join('|');
  const refreshChain = React.useCallback(async ({ force = false } = {}) => {
    const targets = chainTargetsRef.current;
    const cache = chainBalancesRef.current || {};
    if (Object.keys(cache).some(id => !targets.some(t => t.id === id && t.address === (cache[id] || {}).address))) {
      setChainBalances(prev => Object.fromEntries(Object.entries(prev).filter(([id, v]) => targets.some(t => t.id === id && t.address === (v || {}).address))));
    }
    const now = Date.now();
    const due = targets.filter(t => {
      const c = cache[t.id];
      if (force || !c || c.address !== t.address) return true;
      return now - (Date.parse(c.attemptAt || c.checkedAt || '') || 0) > CHAIN_REFRESH_MS;
    });
    if (!due.length) return;
    setChainLoading(true);
    const results = await Promise.all(due.map(async t => {
      const attemptAt = new Date().toISOString();
      const invalid = validateChainAddress(t.coin, t.address);
      if (invalid) return { id: t.id, address: t.address, error: invalid, attemptAt };
      try {
        const qty = await fetchChainBalance(t.coin, t.address);
        return { id: t.id, address: t.address, qty, checkedAt: attemptAt, attemptAt, error: null };
      } catch (e) {
        const msg = e && e.name === 'TimeoutError' ? 'Time-out bij ophalen van het saldo'
          : (e instanceof TypeError ? 'Saldo-dienst niet bereikbaar' : ((e && e.message) || 'Ophalen mislukt'));
        return { id: t.id, address: t.address, error: msg, attemptAt };
      }
    }));
    setChainBalances(prev => {
      const next = { ...prev };
      for (const r of results) {
        const old = prev[r.id] && prev[r.id].address === r.address ? prev[r.id] : {};
        next[r.id] = r.error ? { ...old, address: r.address, error: r.error, attemptAt: r.attemptAt } : { address: r.address, qty: r.qty, checkedAt: r.checkedAt, attemptAt: r.attemptAt, error: null };
        delete next[r.id].id;
      }
      return next;
    });
    setChainLoading(false);
  }, []);
  refreshChainRef.current = refreshChain;
  React.useEffect(() => { refreshChain(); }, [chainSig]); // eslint-disable-line
  // Oude fin-over-boekingen (Vrij op rekening) tellen nergens mee: de post is live gewaardeerd.
  const valTxs = React.useMemo(() => {
    const all = state.transactions || [];
    return all.some(isFinOverTx) ? all.filter(t => !isFinOverTx(t)) : all;
  }, [state.transactions]);
  const viewState = React.useMemo(() => (valTxs === state.transactions ? state : { ...state, transactions: valTxs }), [state, valTxs]);
  const summaries   = React.useMemo(() => allParties.map(p => summarizeParty(p, valTxs, spots)), [valTxs, allParties, spots]);
  const flows       = React.useMemo(() => buildFlowSeries(valTxs, allParties), [valTxs, allParties]);
  const valueSeries = React.useMemo(() => buildPartyTimeSeries(valTxs, allParties, spots), [valTxs, allParties, spots]);
  const model       = React.useMemo(
    () => buildPortfolioModel({ parties: allParties, transactions: valTxs, summaries, flows, valueSeries, spots, financieelOver }),
    [allParties, valTxs, summaries, flows, valueSeries, spots, financieelOver]
  );

  const sbOk = !!(supabaseConfig.url && supabaseConfig.anonKey);

  // ── iOS-widget: publiceer de hero-getallen naar portfolio.data.widgetSnapshot ──
  // Alleen na een geslaagde Supabase-load met transacties, zonder openstaande save/fout,
  // met live koersen; en alleen bij ≥ € 1 verschil in totaal of ≥ 10 min sinds de vorige write.
  const widgetSnapLastRef = React.useRef({ total: null, at: 0 });
  const widgetSnapTimerRef = React.useRef(null);
  React.useEffect(() => {
    if (!sbOk) return undefined;
    clearTimeout(widgetSnapTimerRef.current);
    widgetSnapTimerRef.current = setTimeout(() => {
      if (!supabaseLoadedRef.current || !transactionsLoadedRef.current || pendingSaveRef.current) return;
      if (syncStatus.error || syncStatus.loading || !syncStatus.syncedAt) return;
      if (!spotStatus.fetchedAt || spotStatus.loading) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      const snap = buildWidgetSnapshot(model, prefs);
      if (!snap || !Number.isFinite(snap.total) || !(state.transactions || []).length) return;
      const last = widgetSnapLastRef.current;
      const now = Date.now();
      if (last.total != null && Math.abs(snap.total - last.total) < 1 && now - last.at < 10 * 60 * 1000) return;
      const client = getSupabaseClient(supabaseConfig);
      if (!client) return;
      widgetSnapLastRef.current = { total: snap.total, at: now };
      saveQueueRef.current = saveQueueRef.current
        .catch(() => {})
        .then(() => supabaseSaveWidgetSnapshot(client, snap))
        .catch(e => {
          widgetSnapLastRef.current = last;
          console.warn('[Supabase] widget-snapshot mislukt:', e.message);
        });
    }, 4000);
    return () => clearTimeout(widgetSnapTimerRef.current);
  }, [sbOk, model, prefs.exclPE, prefs.period, syncStatus, spotStatus, supabaseConfig, state.transactions]);

  // ── Navigation ──
  const doNavigate = React.useCallback((path, { replace = false } = {}) => {
    const norm = shNormalizePath(path);
    const parsed = shParseRoute(norm);
    const target = parsed.redirect || norm;
    const nextRoute = parsed.redirect ? shParseRoute(target).route : parsed.route;
    if (replace) {
      try { window.history.replaceState(window.history.state, '', '#' + target); } catch (e) { /* ignore */ }
    } else if (window.location.hash !== '#' + target) {
      window.location.hash = target;
    }
    lastHashRef.current = '#' + target;
    setRoute(nextRoute);
  }, []);

  const runQueuedNav = React.useCallback(() => {
    const q = queuedNavRef.current;
    queuedNavRef.current = null;
    if (q) doNavigate(q.path, q.opts);
  }, [doNavigate]);

  const closeOverlay = React.useCallback(() => {
    if (overlayPushedRef.current) {
      overlayPushedRef.current = false;
      pendingBackRef.current = true;
      setTimeout(() => {
        if (pendingBackRef.current) { pendingBackRef.current = false; runQueuedNav(); }
      }, 500);
      try { window.history.back(); } catch (e) { pendingBackRef.current = false; }
    }
    overlayRef.current = null;
    setOverlay(null);
  }, [runQueuedNav]);

  const navigate = React.useCallback((path, opts = {}) => {
    setSyncPopOpen(false);
    if (overlayRef.current || overlayPushedRef.current) closeOverlay();
    if (pendingBackRef.current) { queuedNavRef.current = { path, opts }; return; }
    doNavigate(path, opts);
  }, [closeOverlay, doNavigate]);

  const openOverlay = React.useCallback(o => {
    if (!overlayRef.current && !overlayPushedRef.current && !pendingBackRef.current) {
      try { window.history.pushState({ ovl: 1 }, '', window.location.href); overlayPushedRef.current = true; } catch (e) { /* ignore */ }
    }
    overlayRef.current = o;
    setOverlay(o);
    setSyncPopOpen(false);
  }, []);

  // Hash- en history-luisteraars
  React.useEffect(() => {
    const init = shParseRoute(window.location.hash);
    if (init.redirect) {
      try { window.history.replaceState(window.history.state, '', '#' + init.redirect); } catch (e) { /* ignore */ }
      setRoute(shParseRoute(init.redirect).route);
    }
    lastHashRef.current = window.location.hash;
    const onHash = () => {
      const parsed = shParseRoute(window.location.hash);
      if (parsed.redirect) {
        try { window.history.replaceState(window.history.state, '', '#' + parsed.redirect); } catch (e) { /* ignore */ }
      }
      if (window.location.hash === lastHashRef.current) return;
      lastHashRef.current = window.location.hash;
      setRoute(parsed.redirect ? shParseRoute(parsed.redirect).route : parsed.route);
      if (overlayRef.current) { overlayRef.current = null; overlayPushedRef.current = false; setOverlay(null); }
    };
    const onPop = () => {
      if (pendingBackRef.current) {
        pendingBackRef.current = false;
        // Tussendoor een nieuwe overlay geopend? Dan alsnog een history-entry voor Back.
        if (overlayRef.current && !overlayPushedRef.current) {
          try { window.history.pushState({ ovl: 1 }, '', window.location.href); overlayPushedRef.current = true; } catch (e) { /* ignore */ }
        }
        runQueuedNav();
        return;
      }
      if (overlayRef.current) {
        overlayRef.current = null;
        overlayPushedRef.current = false;
        setOverlay(null);
      }
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onPop);
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('popstate', onPop); };
  }, [runQueuedNav]);

  // Scroll naar boven bij wisselen van pagina
  const scrollKey = route.name + '|' + (route.params.partyId || '') + '|' + (route.params.section || '') + '|' + (route.params.tab || '');
  React.useEffect(() => {
    if (isMobile) { try { window.scrollTo(0, 0); } catch (e) { /* ignore */ } }
    else if (canvasRef.current) canvasRef.current.scrollTop = 0;
  }, [isMobile ? scrollKey : route.name]); // eslint-disable-line

  // Tweaks host integration (edit-mode berichten)
  React.useEffect(() => {
    const onMessage = e => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') navigate('/instellingen');
      if (d.type === '__deactivate_edit_mode' && routeRef.current.name === 'instellingen') navigate('/overzicht');
    };
    window.addEventListener('message', onMessage);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) { /* ignore */ }
    return () => window.removeEventListener('message', onMessage);
  }, [navigate]);

  // ── Actions ──
  const deleteTxRef = React.useRef(null);

  const saveTx = React.useCallback(tx => {
    if (!tx || !tx.id) return;
    const updatedAt = new Date().toISOString();
    const stampedTx = { ...tx, updatedAt };
    const isNew = !(stateRef.current.transactions || []).some(t => t.id === tx.id);
    setSyncedState(s => {
      const exists = s.transactions.some(t => t.id === tx.id);
      const deletedTransactionIds = { ...(s.deletedTransactionIds || {}) };
      delete deletedTransactionIds[tx.id];
      return { ...s, transactions: exists
        ? s.transactions.map(t => t.id === tx.id ? stampedTx : t)
        : [...s.transactions, stampedTx],
        deletedTransactionIds };
    });
    if (tx.party) {
      setPrefs(p => ({ recentParties: [tx.party, ...(p.recentParties || []).filter(id => id !== tx.party)].slice(0, 5) }));
    }
    if (isNew) {
      toast('Transactie toegevoegd', { action: { label: 'Ongedaan maken', onClick: () => deleteTxRef.current && deleteTxRef.current(tx.id, { confirm: false, toast: false }) } });
    } else {
      toast('Transactie opgeslagen');
    }
  }, [setSyncedState, setPrefs, toast]);

  const deleteTx = React.useCallback(async (id, { confirm = true, toast: showToast = true } = {}) => {
    const tx = (stateRef.current.transactions || []).find(t => t.id === id);
    if (!tx) return false;
    if (confirm) {
      const party = allPartiesRef.current.find(p => p.id === tx.party);
      let amount = '';
      try { amount = txAmountInfo(tx, party).text; } catch (e) { amount = ''; }
      const body = [TX_LABELS[tx.type] || tx.type, party ? party.name : (tx.party || 'Zonder partij'), fmtDateLong(tx.date), amount]
        .filter(Boolean).join(' · ');
      const res = await confirmFn({ title: 'Transactie verwijderen?', body, confirmLabel: 'Verwijderen' });
      if (!res.ok) return false;
    }
    const deletedAt = new Date().toISOString();
    setSyncedState(s => ({
      ...s,
      transactions: s.transactions.filter(t => t.id !== id),
      deletedTransactionIds: { ...(s.deletedTransactionIds || {}), [id]: deletedAt },
    }));
    if (showToast) {
      toast('Transactie verwijderd', { action: { label: 'Ongedaan maken', onClick: () => {
        const restored = { ...tx, updatedAt: new Date().toISOString() };
        setSyncedState(s => {
          const deletedTransactionIds = { ...(s.deletedTransactionIds || {}) };
          delete deletedTransactionIds[id];
          const transactions = s.transactions.some(t => t.id === id)
            ? s.transactions
            : [...s.transactions, restored].sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
          return { ...s, transactions, deletedTransactionIds };
        });
      } } });
    }
    return true;
  }, [setSyncedState, confirmFn, toast]);
  deleteTxRef.current = deleteTx;

  const saveParty = React.useCallback(p => {
    if (!p || !p.id) return;
    setSyncedState(s => {
      const stampedParty = { ...p, updatedAt: new Date().toISOString() };
      const tomb = s.deletedPartyIds || {};
      const list = (Array.isArray(s.parties) && (s.parties.length || Object.keys(tomb).length)) ? s.parties : [...PARTIES];
      const exists = list.some(x => x.id === p.id);
      const deletedPartyIds = { ...tomb };
      delete deletedPartyIds[p.id];
      return { ...s, parties: exists
        ? list.map(x => x.id === p.id ? { ...x, ...stampedParty } : x)
        : [...list, stampedParty],
        deletedPartyIds };
    });
    toast('Partij opgeslagen');
  }, [setSyncedState, toast]);

  const deleteParty = React.useCallback((id, { deleteTransactions = false } = {}) => {
    setSyncedState(s => {
      const stamp = new Date().toISOString();
      const tomb = s.deletedPartyIds || {};
      const list = (Array.isArray(s.parties) && (s.parties.length || Object.keys(tomb).length)) ? s.parties : [...PARTIES];
      // Crypto-post: verwijder ook de coin-sub-holdings (anders zou de migratie ze los laten staan).
      const ids = new Set([id, ...list.filter(p => p.postId === id).map(p => p.id)]);
      const partyTomb = { ...tomb };
      ids.forEach(x => { partyTomb[x] = stamp; });
      const next = { ...s, parties: list.filter(p => !ids.has(p.id)), deletedPartyIds: partyTomb };
      if (deleteTransactions) {
        const prevDeleted = s.deletedTransactionIds || {};
        const tombstones = { ...prevDeleted };
        for (const t of (s.transactions || [])) if (ids.has(t.party)) tombstones[t.id] = stamp;
        next.transactions = (s.transactions || []).filter(t => !ids.has(t.party));
        next.deletedTransactionIds = tombstones;
      }
      return next;
    });
    if (routeRef.current.params.partyId === id) navigate('/posities', { replace: true });
    toast('Partij verwijderd');
  }, [setSyncedState, navigate, toast]);

  const setWidgetEnabled = React.useCallback((id, enabled) => {
    setSyncedState(s => ({ ...s, widgets: mergeWidgets(s.widgets).map(w => w.id === id ? { ...w, enabled } : w) }));
  }, [setSyncedState]);
  const setHiddenGroups = React.useCallback(keys => {
    setSyncedState(s => ({ ...s, hiddenParties: keys }));
  }, [setSyncedState]);

  const openTx = React.useCallback((preset = null) => openOverlay({ kind: 'tx', preset: preset || null, initial: null }), [openOverlay]);
  const editTx = React.useCallback(tx => openOverlay({ kind: 'tx', preset: null, initial: tx }), [openOverlay]);
  const openTxDetail = React.useCallback(txId => openOverlay({ kind: 'txDetail', txId }), [openOverlay]);
  const openPartyForm = React.useCallback((party = null, { startInDelete = false } = {}) => openOverlay({ kind: 'partyForm', party, startInDelete }), [openOverlay]);
  const openPrices = React.useCallback(() => openOverlay({ kind: 'prices' }), [openOverlay]);
  const openSync = React.useCallback(() => {
    if (isMobile) openOverlay({ kind: 'sync' });
    else setSyncPopOpen(true);
  }, [isMobile, openOverlay]);

  // Sneltoetsen (desktop)
  React.useEffect(() => {
    if (isMobile) return undefined;
    const onKey = e => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (shIsTyping(e.target)) return;
      if (document.querySelector('.dialog-wrap')) return;
      const k = e.key;
      if (k === 'h' || k === 'H') { e.preventDefault(); setPrefs(p => ({ privacy: !p.privacy })); return; }
      if (overlayRef.current) return;
      if (k === 'n' || k === 'N') { e.preventDefault(); openTx(); }
      else if (k === '[') { e.preventDefault(); setPrefs(p => ({ sidebarCollapsed: !p.sidebarCollapsed })); }
      else if (k === ',') { e.preventDefault(); navigate('/instellingen'); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMobile, setPrefs, openTx, navigate]);

  const app = React.useMemo(() => ({
    state: viewState, model, spots, tweaks: displayTweaks, isMobile, route, navigate, prefs, setPrefs,
    spotStatus, syncStatus, sbOk, supabaseConfig, setSupabaseConfig, t212Status, importMsg, meesmanHistStatus,
    chainBalances, chainLoading, refreshChain,
    setSyncedState, updateTweaks, refreshSpot, updateMeesmanNav, loadMeesmanHistory, importT212, deleteT212Txs,
    syncNow, pullNow, exportData, importData, resetData,
    saveTx, deleteTx, saveParty, deleteParty, setWidgetEnabled, setHiddenGroups,
    openTx, editTx, openTxDetail, openPartyForm, openPrices, openSync, closeOverlay,
    overlayOpen: overlay !== null, confirm: confirmFn, toast,
  }), [viewState, model, spots, displayTweaks, isMobile, route, navigate, prefs, setPrefs,
    spotStatus, syncStatus, sbOk, supabaseConfig, t212Status, importMsg, meesmanHistStatus,
    chainBalances, chainLoading, refreshChain,
    setSyncedState, updateTweaks, refreshSpot, updateMeesmanNav, loadMeesmanHistory, importT212, deleteT212Txs,
    syncNow, pullNow, exportData, importData, resetData,
    saveTx, deleteTx, saveParty, deleteParty, setWidgetEnabled, setHiddenGroups,
    openTx, editTx, openTxDetail, openPartyForm, openPrices, openSync, closeOverlay, overlay, confirmFn, toast]);

  // Sidebar-tellers
  const driftWarn = React.useMemo(() => {
    try { return driftRows(model.summaries, state.targetAllocation).rows.some(r => r.outside); } catch (e) { return false; }
  }, [model, state.targetAllocation]);
  const counts = { open: model.totals?.openCount ?? (model.open || []).length, tx: (viewState.transactions || []).length };

  const ov = overlay || {};
  const screen = (
    <ShErrorBoundary resetKey={route.name}>
      <ShScreen app={app} />
    </ShErrorBoundary>
  );
  const overlays = (
    <>
      {window.TransactionSheet ? <TransactionSheet app={app} open={ov.kind === 'tx'} preset={ov.kind === 'tx' ? ov.preset : null}
        initial={ov.kind === 'tx' ? ov.initial : null} onClose={closeOverlay} /> : null}
      {window.TxDetailSheet ? <TxDetailSheet app={app} open={ov.kind === 'txDetail'} txId={ov.kind === 'txDetail' ? ov.txId : null}
        onClose={closeOverlay} /> : null}
      {window.PartyForm ? <PartyForm app={app} open={ov.kind === 'partyForm'} party={ov.kind === 'partyForm' ? ov.party : null}
        startInDelete={ov.kind === 'partyForm' ? !!ov.startInDelete : false} onClose={closeOverlay} /> : null}
      <Sheet open={ov.kind === 'prices'} onClose={closeOverlay} title="Koersen" size="medium" testId="prices-sheet">
        {window.PriceRows ? <PriceRows app={app} variant="sheet" /> : null}
      </Sheet>
      <Sheet open={ov.kind === 'sync'} onClose={closeOverlay} title="Synchronisatie" size="medium" className="sh-sheet" testId="sync-sheet">
        <ShSyncPanel app={app} onDone={closeOverlay} />
      </Sheet>
      <ShConfirmDialog key={confirmState ? confirmState.key : 'none'} confirmState={confirmState} onSettle={settleConfirm} />
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </>
  );

  return (
    <UiPrefsContext.Provider value={{ prefs, setPrefs }}>
      {isMobile ? (
        <>
          <ShMobileHeader app={app} />
          <main className="sh-mcontent">{screen}</main>
          <ShTabBar app={app} />
        </>
      ) : (
        <div className={'sh-app' + (prefs.sidebarCollapsed ? ' is-collapsed' : '')}>
          <ShSidebar app={app} collapsed={!!prefs.sidebarCollapsed} counts={counts} driftWarn={driftWarn} />
          <main className="sh-canvas" ref={canvasRef}>
            <ShTopbar app={app} title={SH_TITLES[route.name] || 'Overzicht'} syncOpen={syncPopOpen} setSyncOpen={setSyncPopOpen} />
            <div className="sh-content">{screen}</div>
          </main>
        </div>
      )}
      {overlays}
    </UiPrefsContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
