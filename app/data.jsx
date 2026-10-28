// Data model, seed data, localStorage persistence

const STORAGE_KEY = 'investeringen-v3'; // v3 = eigen data, geen demo
const OZ_TO_GRAM  = 31.1034768; // troy ounce → gram
const DEFAULT_MEESMAN_NAV_EUR = 102.7860; // Meesman site: 08-05-2026

// Zilver: converteer gram naar ounce voor interne opslag (spot is altijd €/oz)
function silverToOz(qty, silverUnit) {
  if (silverUnit === 'gram') return qty / OZ_TO_GRAM;
  return qty; // al in oz
}

// Goud: converteer ounce naar gram voor interne opslag (spot is altijd €/gram)
function goldToGram(qty, goldUnit) {
  if (goldUnit === 'ounce') return qty * OZ_TO_GRAM;
  return qty; // al in gram
}

const PARTIES = [
  { id: 'meesman',      name: 'Meesman',       category: 'Indexfondsen', subtitle: 'Wereldwijd aandelenfonds', color: 'oklch(58% 0.14 255)', unit: 'part',  unitLabel: 'part.', goal: 25000 },
  { id: 'finst',        name: 'Finst',          category: 'Crypto',   subtitle: 'Crypto-exchange · BTC en ETH', color: 'oklch(72% 0.18 55)', unit: 'post', unitLabel: '€', goal: 7500 },
  { id: 'wallet',       name: 'Wallet',         category: 'Crypto',   subtitle: 'Coinbase Wallet · self-custody', color: 'oklch(60% 0.12 265)', unit: 'post', unitLabel: '€', goal: 0, selfCustody: true },
  { id: 'finst-btc',   name: 'Bitcoin',        category: 'Crypto',   subtitle: 'BTC via Finst',           color: 'oklch(72% 0.18 55)',  unit: 'crypto', unitLabel: 'BTC',   goal: 5000, spotKey: 'btcSpotEur', postId: 'finst', coin: 'BTC' },
  { id: 'finst-eth',   name: 'Ethereum',       category: 'Crypto',   subtitle: 'ETH via Finst',           color: 'oklch(60% 0.12 265)', unit: 'crypto', unitLabel: 'ETH',   goal: 2500, spotKey: 'ethSpotEur', postId: 'finst', coin: 'ETH' },
  { id: 'wallet-btc',  name: 'Bitcoin',        category: 'Crypto',   subtitle: 'BTC in Coinbase Wallet',  color: 'oklch(72% 0.18 55)',  unit: 'crypto', unitLabel: 'BTC',   goal: 0, spotKey: 'btcSpotEur', postId: 'wallet', coin: 'BTC' },
  { id: 'wallet-eth',  name: 'Ethereum',       category: 'Crypto',   subtitle: 'ETH in Coinbase Wallet',  color: 'oklch(60% 0.12 265)', unit: 'crypto', unitLabel: 'ETH',   goal: 0, spotKey: 'ethSpotEur', postId: 'wallet', coin: 'ETH' },
  { id: 'finst-paxg',  name: 'Pax Gold',       category: 'Edelmetaal', subtitle: 'PAXG via Finst',         color: 'oklch(76% 0.14 85)',  unit: 'crypto', unitLabel: 'PAXG',  goal: 1500, spotKey: 'paxgSpotEur' },
  { id: 'finst-top25', name: 'Top 25 Bundel',  category: 'Crypto',   subtitle: 'Top 25 tokens via Finst', color: 'oklch(62% 0.15 195)', unit: 'bundle', unitLabel: '€',     goal: 1000 },
  { id: 'goldrepublic', name: 'Goldrepublic',  category: 'Edelmetaal',   subtitle: 'Goud & zilver in kluis',   color: 'oklch(78% 0.14 85)',  unit: 'mixed', unitLabel: 'g/oz',  goal: 5000, isMixed: true },
  { id: 'trading212',   name: 'Trading 212',   category: 'Broker',       subtitle: "Aandelen & ETF's",         color: 'oklch(55% 0.16 145)', unit: 'bundle',unitLabel: '€',     goal: 5000 },
  { id: 'goud',         name: 'Fysiek Goud',   category: 'Edelmetaal',   subtitle: 'Eigen bezit — gram',       color: 'oklch(75% 0.15 70)',  unit: 'gram',  unitLabel: 'g',     goal: 20 },
  { id: 'zilver',       name: 'Fysiek Zilver', category: 'Edelmetaal',   subtitle: 'Eigen bezit — ounce',      color: 'oklch(70% 0.03 240)', unit: 'ounce', unitLabel: 'oz',    goal: 30 },
  { id: 'cash',         name: 'Cash',          category: 'Liquide',      subtitle: 'Directe reserve',          color: 'oklch(55% 0.05 160)', unit: 'eur',   unitLabel: '€',     goal: 2000 },
  // Gevuld door het Financieel Systeem: per afgesloten maand (vanaf okt 2026) het bedrag dat overbleef,
  // als inleg/opname met id 'fin-over-JJJJ-MM'. Waarde = opgetelde maandoverschotten.
  { id: 'lopende-rekening', name: 'Lopende rekening', category: 'Liquide', subtitle: 'Maandoverschot uit Financieel Systeem', color: 'oklch(62% 0.06 200)', unit: 'eur', unitLabel: '€', goal: 0 },
];
// Posten die altijd in de partijlijst moeten staan (ook bij een bestaande, gesyncte lijst), tenzij verwijderd.
const ALWAYS_SEEDED_PARTY_IDS = ['lopende-rekening'];

// ===== Crypto-posten =====
// Een "post" (unit 'post', bv. Finst of Wallet) groepeert per-coin sub-holdings: gewone crypto-partijen
// met postId + coin (finst-btc, wallet-eth …). Transacties blijven op de sub-holding staan, dus bestaande
// boekingen (party 'finst-btc') hoeven niet herschreven te worden; de UI toont alleen de post.
const CRYPTO_COINS = [
  { coin: 'BTC', label: 'Bitcoin',  spotKey: 'btcSpotEur', decimals: 8 },
  { coin: 'ETH', label: 'Ethereum', spotKey: 'ethSpotEur', decimals: 8 },
];
const CRYPTO_COIN_BY_KEY = Object.fromEntries(CRYPTO_COINS.map(c => [c.coin, c]));
const CRYPTO_POST_IDS = ['finst', 'wallet'];
const CRYPTO_LEAF_DEFS = [
  { id: 'finst-btc',  postId: 'finst',  coin: 'BTC' },
  { id: 'finst-eth',  postId: 'finst',  coin: 'ETH' },
  { id: 'wallet-btc', postId: 'wallet', coin: 'BTC' },
  { id: 'wallet-eth', postId: 'wallet', coin: 'ETH' },
];

function isPostParty(p) { return !!p && p.unit === 'post'; }

// Controle van een publiek wallet-adres. Geeft null (ok) of een Nederlandse foutmelding.
function validateChainAddress(coin, addr) {
  const a = String(addr || '').trim();
  if (!a) return null;
  if (a.split(/\s+/).length >= 6) return 'Dit lijkt op een herstelzin (seed phrase). Vul die nooit in: alleen je publieke adres.';
  if (/\s/.test(a)) return 'Een adres bevat geen spaties.';
  if (coin === 'BTC') {
    if (/^[xyz]pub/i.test(a)) return 'Een xpub wordt niet ondersteund; vul een los Bitcoin-adres in.';
    return /^(bc1[02-9ac-hj-np-z]{11,87}|[13][1-9A-HJ-NP-Za-km-z]{25,34})$/i.test(a) ? null : 'Geen geldig Bitcoin-adres (begint met bc1, 1 of 3).';
  }
  if (coin === 'ETH') return /^0x[0-9a-fA-F]{40}$/.test(a) ? null : 'Geen geldig Ethereum-adres (0x gevolgd door 40 tekens).';
  return 'Onbekende coin';
}

// Idempotente migratie van de partijlijst: voegt de posten Finst en Wallet en hun coin-sub-holdings toe
// en koppelt bestaande finst-btc / finst-eth aan Finst. Transacties en waarden blijven ongewijzigd.
// Respecteert tombstones (een verwijderde post komt niet terug). Geeft dezelfde array terug als er niets verandert.
function migrateCryptoPosts(parties, deletedPartyIds) {
  if (!Array.isArray(parties) || !parties.length) return parties;
  const tomb = deletedPartyIds || {};
  const seedById = Object.fromEntries(PARTIES.map(p => [p.id, p]));
  let changed = false;
  const list = parties.slice();
  const has = id => list.some(p => p && p.id === id);
  for (const id of CRYPTO_POST_IDS) {
    if (!has(id) && !tomb[id]) {
      const at = list.findIndex(p => p && CRYPTO_LEAF_DEFS.some(d => d.postId === id && d.id === p.id));
      if (at >= 0) list.splice(at, 0, { ...seedById[id] }); else list.push({ ...seedById[id] });
      changed = true;
    }
  }
  for (const id of ALWAYS_SEEDED_PARTY_IDS) {
    if (!has(id) && !tomb[id]) { list.push({ ...seedById[id] }); changed = true; }
  }
  for (const def of CRYPTO_LEAF_DEFS) {
    const i = list.findIndex(p => p && p.id === def.id);
    if (i >= 0) {
      const p = list[i];
      if (!p.postId && !p.detachedFromPost && has(def.postId)) {
        list[i] = { ...p, postId: def.postId, coin: def.coin, unit: 'crypto', spotKey: p.spotKey || CRYPTO_COIN_BY_KEY[def.coin].spotKey };
        changed = true;
      }
    } else if (!tomb[def.id] && has(def.postId)) {
      list.push({ ...seedById[def.id] });
      changed = true;
    }
  }
  return changed ? list : parties;
}

// postId → [leaf parties]; leaves waarvan de post niet (meer) bestaat tellen als gewone partij.
function cryptoPostIndex(parties) {
  const posts = {};
  for (const p of parties || []) if (isPostParty(p)) posts[p.id] = p;
  const leavesByPost = {}, postOfLeaf = {};
  for (const p of parties || []) {
    if (p && p.postId && posts[p.postId] && !isPostParty(p)) {
      (leavesByPost[p.postId] = leavesByPost[p.postId] || []).push(p);
      postOfLeaf[p.id] = p.postId;
    }
  }
  for (const k of Object.keys(leavesByPost)) {
    leavesByPost[k].sort((a, b) => CRYPTO_COINS.findIndex(c => c.coin === a.coin) - CRYPTO_COINS.findIndex(c => c.coin === b.coin));
  }
  return { posts, leavesByPost, postOfLeaf };
}

// Sub-holding van een post voor een coin (of null).
function cryptoLeafFor(parties, postId, coin) {
  return (parties || []).find(p => p && p.postId === postId && p.coin === coin && !isPostParty(p)) || null;
}

// ===== Widget registry for customizable dashboard =====
const WIDGET_REGISTRY = [
  { id: 'portfolio_line',   label: 'Portfolio over tijd',   desc: 'Waarde vs. ingelegd',            chartTypes: ['lijn', 'rendement%'],  defaultSize: 'large'  },
  { id: 'allocation',       label: 'Verdeling',             desc: 'Aandeel per partij',              chartTypes: ['donut', 'balk'],        defaultSize: 'medium' },
  { id: 'party_comparison', label: 'Inleg vs. waarde',      desc: 'Vergelijking per partij',         chartTypes: ['groepsbalk'],           defaultSize: 'medium' },
  { id: 'returns',          label: 'Rendementen',           desc: '% rendement per partij',          chartTypes: ['balk', 'tabel'],        defaultSize: 'small'  },
  { id: 'monthly_inleg',    label: 'Maandelijkse inleg',    desc: 'Historisch inlegpatroon',         chartTypes: ['balk', 'lijn'],         defaultSize: 'small'  },
  { id: 'allocation_lines', label: 'Waarde per allocatie',  desc: 'Waardeontwikkeling per partij',   chartTypes: ['lijn'],                 defaultSize: 'full'   },
  { id: 'party_grid',       label: 'Partijkaarten',         desc: 'Overzichtskaarten',               chartTypes: ['kaarten'],              defaultSize: 'full'   },
  { id: 'monthly_table',    label: 'Maandoverzicht',        desc: 'P&L en cashflow per maand',       chartTypes: ['tabel'],                defaultSize: 'medium' },
  { id: 'activity_feed',    label: 'Recente activiteit',    desc: 'Laatste transacties',             chartTypes: ['lijst'],                defaultSize: 'small'  },
  { id: 'fees_summary',     label: 'Transactiekosten',      desc: 'Totale kosten betaald',           chartTypes: ['cijfers'],              defaultSize: 'small'  },
  { id: 'metal_holdings',   label: 'Edelmetalen detail',    desc: 'Hoeveelheden edelmetalen',        chartTypes: ['cijfers'],              defaultSize: 'small'  },
  { id: 'goals',            label: 'Doelen voortgang',      desc: 'Vooruitgang per doel',            chartTypes: ['voortgang'],            defaultSize: 'medium' },
  { id: 'attention',        label: 'Aandacht',              desc: 'Wat vraagt je aandacht',          chartTypes: ['lijst'],                defaultSize: 'small'  },
  { id: 'pension_card',     label: 'Pensioen-kaart',        desc: 'Voortgang pensioendoel',          chartTypes: ['voortgang'],            defaultSize: 'small'  },
];

const DEFAULT_WIDGETS = [
  { id: 'portfolio_line',   enabled: true,  chartType: 'lijn',      size: 'large'  },
  { id: 'allocation',       enabled: true,  chartType: 'donut',     size: 'medium' },
  { id: 'party_comparison', enabled: true,  chartType: 'groepsbalk',size: 'medium' },
  { id: 'returns',          enabled: true,  chartType: 'balk',      size: 'small'  },
  { id: 'monthly_inleg',    enabled: true,  chartType: 'balk',      size: 'small'  },
  { id: 'allocation_lines', enabled: true,  chartType: 'lijn',      size: 'full'   },
  { id: 'party_grid',       enabled: true,  chartType: 'kaarten',   size: 'full'   },
  { id: 'monthly_table',    enabled: true,  chartType: 'tabel',     size: 'medium' },
  { id: 'activity_feed',    enabled: true,  chartType: 'lijst',     size: 'small'  },
  { id: 'fees_summary',     enabled: true,  chartType: 'cijfers',   size: 'small'  },
  { id: 'metal_holdings',   enabled: false, chartType: 'cijfers',   size: 'small'  },
  { id: 'goals',            enabled: false, chartType: 'voortgang', size: 'medium' },
  { id: 'attention',        enabled: true,  chartType: 'lijst',     size: 'small'  },
  { id: 'pension_card',     enabled: true,  chartType: 'voortgang', size: 'small'  },
];

const today = new Date();
const d = (monthsAgo, day = 15) => {
  const dt = new Date(today.getFullYear(), today.getMonth() - monthsAgo, day);
  return dt.toISOString().slice(0, 10);
};

function todayIsoLocal() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDaysIso(iso, days = 1) {
  const dt = new Date(`${iso}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

const MEESMAN_NAV_SEED_HISTORY = [
  { date: '2025-01-12', nav: 88.2833 },
  { date: '2025-01-13', nav: 88.6971 },
  { date: '2025-01-17', nav: 90.3218 },
  { date: '2025-01-24', nav: 90.2836 },
  { date: '2025-02-07', nav: 91.3943 },
  { date: '2025-02-14', nav: 91.4765 },
  { date: '2025-03-07', nav: 84.9613 },
  { date: '2025-03-28', nav: 83.0794 },
  { date: '2025-05-09', nav: 81.6632 },
  { date: '2025-06-05', nav: 84.1696 },
  { date: '2025-06-13', nav: 83.7559 },
  { date: '2025-06-23', nav: 83.9741 },
  { date: '2025-06-27', nav: 84.9795 },
  { date: '2025-07-07', nav: 85.3903 },
  { date: '2025-08-01', nav: 86.4645 },
  { date: '2025-08-08', nav: 87.9118 },
  { date: '2025-08-11', nav: 87.1998 },
  { date: '2025-08-29', nav: 87.9546 },
  { date: '2025-09-26', nav: 90.3241 },
  { date: '2026-01-16', nav: 97.2780 },
  { date: '2026-01-30', nav: 95.2517 },
  { date: '2026-02-24', nav: 96.9905 },
  { date: '2026-03-02', nav: 97.5442 },
  { date: '2026-04-10', nav: 96.0370 },
  { date: '2026-04-24', nav: 100.0430 },
  { date: '2026-05-05', nav: 101.1950 },
  { date: '2026-05-08', nav: DEFAULT_MEESMAN_NAV_EUR },
].reduce((acc, h) => {
  const i = acc.findIndex(x => x.date === h.date);
  if (i >= 0) acc[i] = h;
  else acc.push(h);
  acc.sort((a, b) => a.date.localeCompare(b.date));
  return acc;
}, []);

function mergePriceHistory(base = [], extra = []) {
  const map = new Map();
  [...base, ...extra].forEach(h => {
    const nav = +(h.nav ?? h.price ?? 0);
    if (h.date && nav > 0) map.set(h.date, { date: h.date, nav });
  });
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function normalizeMeesmanHistory(history = []) {
  const officialLatest = MEESMAN_NAV_SEED_HISTORY[MEESMAN_NAV_SEED_HISTORY.length - 1];
  const normalized = mergePriceHistory(
    MEESMAN_NAV_SEED_HISTORY,
    (history || []).filter(h => h.date <= officialLatest.date || +h.nav !== 100.4)
  );
  const current = normalized[normalized.length - 1] || officialLatest;
  return { history: normalized, currentNav: current.nav };
}

function makeId() { return 'tx_' + Math.random().toString(36).slice(2, 10); }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.widgets)       parsed.widgets       = DEFAULT_WIDGETS.map(w => ({ ...w }));
      if (!parsed.hiddenParties) parsed.hiddenParties = [];
      if (!parsed.tileMetrics)   parsed.tileMetrics   = {};
      if (!parsed.transactions)  parsed.transactions  = [];
      if (!parsed.deletedTransactionIds) parsed.deletedTransactionIds = {};
      // Migratie: oude customParties + hardcoded PARTIES → één state.parties array
      if (!parsed.parties || !parsed.parties.length) {
        const ids = new Set();
        const merged = [];
        for (const p of [...PARTIES, ...(parsed.customParties || [])]) {
          if (!ids.has(p.id)) { ids.add(p.id); merged.push(p); }
        }
        parsed.parties = merged;
      }
      // Bewaar customParties NIET meer; alleen state.parties telt vanaf nu
      delete parsed.customParties;
      // Migratie: crypto-posten Finst + Wallet (idempotent, transacties blijven ongewijzigd)
      parsed.parties = migrateCryptoPosts(parsed.parties, parsed.deletedPartyIds);
      // Migratie: tweaks (spot prices, theme, API keys) verhuizen naar state.tweaks
      if (!parsed.tweaks) {
        parsed.tweaks = { ...(window.TWEAKS || {}) };
      }
      // Migratie: Meesman NAV
      if (parsed.meesmanNavEur == null) {
        parsed.meesmanNavEur = parsed.tweaks?.meesmanNavEur || DEFAULT_MEESMAN_NAV_EUR;
      }
      if (!parsed.meesmanNavHistory || !parsed.meesmanNavHistory.length) {
        const twHist = parsed.tweaks?.meesmanNavHistory;
        parsed.meesmanNavHistory = (twHist && twHist.length) ? twHist : MEESMAN_NAV_SEED_HISTORY;
      }
      const normalizedMeesman = normalizeMeesmanHistory(parsed.meesmanNavHistory);
      parsed.meesmanNavHistory = normalizedMeesman.history;
      parsed.meesmanNavEur = normalizedMeesman.currentNav;
      return parsed;
    }
  } catch (e) {}
  // Eerste keer: alle defaults uit code (zal direct naar Supabase gesyncd worden)
  return {
    transactions:       [],
    deletedTransactionIds: {},
    widgets:            DEFAULT_WIDGETS.map(w => ({ ...w })),
    parties:            [...PARTIES],
    hiddenParties:      [],
    tileMetrics:        {},
    tweaks:             { ...(window.TWEAKS || {}) },
    meesmanNavEur:      DEFAULT_MEESMAN_NAV_EUR,
    meesmanNavHistory:  MEESMAN_NAV_SEED_HISTORY,
  };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Storage quota: bewaar zonder grote history-arrays
    try {
      // Geen object-rest: Babel maakt daar een globale _excluded van die botst met ui.jsx
      const slim = { ...state };
      for (const k of ['goldHistory', 'silverHistory', 'btcHistory', 'ethHistory', 'paxgHistory']) delete slim[k];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {}
  }
}

const TX_TYPES = [
  { key: 'inleg',      label: 'Inleg' },
  { key: 'opname',     label: 'Opname' },
  { key: 'koop',       label: 'Koop' },
  { key: 'verkoop',    label: 'Verkoop' },
  { key: 'cashback',   label: 'Cashback / Spare Change' },
  { key: 'dividend',   label: 'Dividend' },
  { key: 'rente',      label: 'Rente / Rendement' },
  { key: 'kosten',     label: 'Kosten / Fee' },
  { key: 'waardering', label: 'Waardering' },
  { key: 'overboeking', label: 'Overboeking' },
];
const TX_LABELS = Object.fromEntries(TX_TYPES.map(t => [t.key, t.label]));

function spotEurForParty(party, spots) {
  if (party.unit === 'gram')    return spots.goldSpotEurPerGram;
  if (party.unit === 'ounce')   return spots.silverSpotEurPerOunce;
  if (party.unit === 'crypto')  return spots[party.spotKey] || null;
  if (party.id   === 'meesman') return spots.meesmanNavEur  || null;
  return null;
}

// Zoek meest recente NAV op of voor een gegeven datum in gesorteerde history [{date, nav}]
function findNavForDate(history, date) {
  let result = null;
  for (const h of history) {
    if (h.date <= date) result = h.nav;
    else break;
  }
  return result;
}

function daysBetween(a, b) {
  const start = new Date(`${a}T00:00:00Z`);
  const end = new Date(`${b}T00:00:00Z`);
  return Math.max(0, Math.round((end - start) / 86400000));
}

// Unit price with fallback amountEur / quantity (koop/cashback without unitPriceEur, e.g. canonical BTC buys)
function dtTxPrice(t) {
  if (+t.unitPriceEur > 0) return +t.unitPriceEur;
  if (+t.amountEur > 0 && +t.quantity > 0) return +t.amountEur / +t.quantity;
  return 0;
}

function txCashAmount(t) {
  return (+t.amountEur || 0) || (+t.quantity || 0) * (+t.unitPriceEur || 0);
}

function bundleSnapshotAtDate(txs, date) {
  let balance = 0;
  let cost = 0;
  let firstActiveDate = null;
  let lastValue = null;

  for (const t of txs) {
    if (t.date > date) continue;
    const amount = txCashAmount(t);
    if (['inleg', 'koop', 'cashback'].includes(t.type)) {
      balance += amount;
      cost += amount;
      if (!firstActiveDate && balance > 0) firstActiveDate = t.date;
    } else if (['opname', 'verkoop'].includes(t.type)) {
      const reduction = balance > 0 ? Math.min(cost, cost * (amount / balance)) : 0;
      cost = Math.max(0, cost - reduction);
      balance = Math.max(0, balance - amount);
    } else if (t.type === 'kosten') {
      cost += +t.amountEur || 0;
    } else if (t.type === 'waardering') {
      const value = t.valueEur != null ? +t.valueEur : (t.unitPriceEur != null ? +t.unitPriceEur : null);
      if (value != null) {
        lastValue = value;
      }
    }
  }

  return { balance, cost, firstActiveDate, lastValue };
}

function bundleValuations(txs) {
  let balance = 0;
  let cost = 0;
  const valuations = [];
  for (const t of txs) {
    const amount = txCashAmount(t);
    if (['inleg', 'koop', 'cashback'].includes(t.type)) {
      balance += amount;
      cost += amount;
    } else if (['opname', 'verkoop'].includes(t.type)) {
      const reduction = balance > 0 ? Math.min(cost, cost * (amount / balance)) : 0;
      cost = Math.max(0, cost - reduction);
      balance = Math.max(0, balance - amount);
    } else if (t.type === 'kosten') {
      cost += +t.amountEur || 0;
    } else if (t.type === 'waardering') {
      const value = t.valueEur != null ? +t.valueEur : (t.unitPriceEur != null ? +t.unitPriceEur : null);
      if (value != null) valuations.push({ date: t.date, value, cost });
    }
  }
  return valuations;
}

function bundleWeeklyInterpolatedValue(partyTxs, date) {
  const txs = [...partyTxs].sort((a, b) => a.date.localeCompare(b.date));
  const current = bundleSnapshotAtDate(txs, date);
  if (!txs.length || current.balance <= 0 && current.cost <= 0) return 0;

  const valuations = bundleValuations(txs);
  const prevVal = valuations.filter(v => v.date <= date).slice(-1)[0] || null;
  const nextVal = valuations.find(v => v.date > date) || null;
  if (!nextVal) {
    if (!prevVal) return current.cost;
    return Math.max(0, current.cost + (prevVal.value - prevVal.cost));
  }

  const startDate = prevVal?.date || current.firstActiveDate || txs[0].date;
  const startPnl = prevVal ? prevVal.value - prevVal.cost : 0;
  const endPnl = nextVal.value - nextVal.cost;
  const totalWeeks = Math.max(1, Math.ceil(daysBetween(startDate, nextVal.date) / 7));
  const elapsedWeeks = Math.min(totalWeeks, Math.floor(daysBetween(startDate, date) / 7));
  const fraction = elapsedWeeks / totalWeeks;
  const interpolatedPnl = startPnl + (endPnl - startPnl) * fraction;
  return Math.max(0, current.cost + interpolatedPnl);
}

function weeklyInterpolatedValue(points, date, fallback = null) {
  const vals = [...points]
    .filter(p => p.date && p.value != null && Number.isFinite(+p.value))
    .sort((a, b) => a.date.localeCompare(b.date));
  const prev = vals.filter(v => v.date <= date).slice(-1)[0] || null;
  const next = vals.find(v => v.date > date) || null;
  if (!next) return prev ? +prev.value : fallback;
  const startDate = prev?.date || date;
  const startValue = prev ? +prev.value : (fallback ?? +next.value);
  const endValue = +next.value;
  const totalWeeks = Math.max(1, Math.ceil(daysBetween(startDate, next.date) / 7));
  const elapsedWeeks = Math.min(totalWeeks, Math.floor(daysBetween(startDate, date) / 7));
  return startValue + (endValue - startValue) * (elapsedWeeks / totalWeeks);
}

function unitValuationPoints(partyTxs) {
  return [...partyTxs]
    .filter(t => t.type === 'waardering' && t.unitPriceEur != null)
    .map(t => ({ date: t.date, value: +t.unitPriceEur }));
}

function totalValuationPoints(partyTxs) {
  return [...partyTxs]
    .filter(t => t.type === 'waardering' && t.valueEur != null)
    .map(t => ({ date: t.date, value: +t.valueEur }));
}

// ----- Overboekingen (crypto van de ene post naar de andere) -----
// tx: { type: 'overboeking', party: bron-sub-holding, toParty: doel-sub-holding, quantity: verzonden aantal,
//       feeQty: netwerkkosten in dezelfde coin (optioneel, extra afgeschreven bij de bron) }.
// De kostprijs verhuist pro rata mee (incl. de kostprijs van de netwerkkosten): geen inleg/opname, geen gerealiseerd resultaat.
function txTouchesParty(t, id) { return !!t && (t.party === id || (t.type === 'overboeking' && t.toParty === id)); }
function transferOutQty(t) { return (+t.quantity || 0) + (+t.feeQty || 0); }
const DT_TRANSFER_CACHE = new WeakMap();
// id → { avg, cost }: gemiddelde kostprijs van de bron op het moment van de overboeking en de meeverhuisde kostprijs.
function transferCostMap(transactions) {
  if (!Array.isArray(transactions)) return {};
  const hit = DT_TRANSFER_CACHE.get(transactions);
  if (hit) return hit;
  const map = {};
  const transfers = transactions.filter(t => t && t.type === 'overboeking')
    .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
  for (const t of transfers) {
    const before = transactions.filter(x => x !== t && txTouchesParty(x, t.party)
      && (x.date < t.date || (x.date === t.date && x.type !== 'overboeking')));
    const src = summarizeParty({ id: t.party, unit: 'crypto' }, before, {}, { transferCost: map });
    const avg = src.quantity > 0 ? src.costBasis / src.quantity : 0;
    map[t.id] = { avg, cost: Math.min(src.costBasis, transferOutQty(t) * avg) };
  }
  DT_TRANSFER_CACHE.set(transactions, map);
  return map;
}

// Valuation for a party — tracks goud/zilver quantities separately for goldrepublic.
// ctx.transferCost: optioneel vooraf berekende transferCostMap (nodig als `transactions` een deelselectie is).
function summarizeParty(party, transactions, spots, ctx) {
  const txs = transactions
    .filter(t => txTouchesParty(t, party.id))
    .sort((a, b) => a.date.localeCompare(b.date));
  const hasTransfers = txs.some(t => t.type === 'overboeking');
  const transferCost = hasTransfers ? ((ctx && ctx.transferCost) || transferCostMap(transactions)) : {};

  let quantity = 0;
  let goldQty = 0;   // for goldrepublic
  let silverQty = 0; // for goldrepublic
  let costBasis = 0;
  let realizedCostBasis = 0;
  let realizedPnl = 0;
  let realizedProceeds = 0;
  let lastUnitPrice = null;
  let lastTotalValue = null;
  let lastValuationDate = null;
  let totalDividend = 0, totalFees = 0, totalIncome = 0;
  let totalCashback = 0;
  let netCashIn = 0;
  let bookedQuantity = null, chainCheckedAt = null;

  for (const t of txs) {
    if (t.type === 'overboeking') {
      const tc = transferCost[t.id] || { avg: 0, cost: 0 };
      if (t.party === party.id) {
        quantity = Math.max(0, quantity - transferOutQty(t));
        costBasis = Math.max(0, costBasis - tc.cost);
        totalFees += (+t.feeQty || 0) * tc.avg; // netwerkkosten (informatief, kostprijs verhuist mee)
      }
      if (t.toParty === party.id) {
        quantity += +t.quantity || 0;
        costBasis += tc.cost;
      }
      continue;
    }
    // Transactiekosten tellen mee in costBasis (echte netto-investering)
    if (t.feeEur) {
      totalFees += +t.feeEur;
      if (t.type !== 'verkoop') costBasis += +t.feeEur;
    }

    switch (t.type) {
      case 'inleg':
        netCashIn += +t.amountEur || 0;
        if (party.unit === 'eur' || party.unit === 'bundle') { quantity += +t.amountEur || 0; costBasis += +t.amountEur || 0; }
        break;
      case 'opname':
        netCashIn -= +t.amountEur || 0;
        if (party.unit === 'eur' || party.unit === 'bundle') {
          const amt = +t.amountEur || 0;
          if (quantity > 0) costBasis = Math.max(0, costBasis - (costBasis * (amt / quantity)));
          quantity = Math.max(0, quantity - amt);
        } else {
          const qty = +t.quantity || 0;
          const totalQty = party.isMixed ? (goldQty + silverQty) : quantity;
          const avgPx = totalQty > 0 ? costBasis / totalQty : 0;
          const outQty = party.isMixed
            ? ((t.metalType || 'goud') === 'goud' ? goldToGram(qty, t.goldUnit) : silverToOz(qty, t.silverUnit))
            : qty;
          costBasis = Math.max(0, costBasis - outQty * avgPx);
          if (party.isMixed) {
            const mt = t.metalType || 'goud';
            if (mt === 'goud') goldQty = Math.max(0, goldQty - goldToGram(qty, t.goldUnit));
            else silverQty = Math.max(0, silverQty - silverToOz(qty, t.silverUnit));
          } else {
            quantity = Math.max(0, quantity - qty);
          }
        }
        break;
      case 'koop':
      case 'cashback': {
        const qty = +t.quantity || 0;
        const px  = dtTxPrice(t);
        if (party.unit === 'bundle') {
          const amount = (+t.amountEur || 0) || qty * px;
          quantity += amount;
          costBasis += amount;
          if (t.type === 'cashback') totalCashback += amount;
        } else if (party.isMixed) {
          const mt = t.metalType || 'goud';
          if (mt === 'goud') goldQty += goldToGram(qty, t.goldUnit);
          else silverQty += silverToOz(qty, t.silverUnit);
          costBasis += qty * px;
        } else {
          quantity += qty;
          costBasis += qty * px;
          if (t.type === 'cashback') totalCashback += qty * px;
        }
        break;
      }
      case 'verkoop': {
        const qty = +t.quantity || 0;
        const proceeds = (+t.amountEur || 0) || qty * (+t.unitPriceEur || 0);
        const fee = +t.feeEur || 0;
        if (party.unit === 'bundle') {
          const soldCost = quantity > 0 ? Math.min(costBasis, costBasis * (proceeds / quantity)) : 0;
          realizedCostBasis += soldCost;
          realizedProceeds += proceeds;
          realizedPnl += proceeds - soldCost - fee;
          costBasis = Math.max(0, costBasis - soldCost);
          quantity = Math.max(0, quantity - proceeds);
          break;
        }
        const totalQty = party.isMixed ? (goldQty + silverQty) : quantity;
        const avgPx = totalQty > 0 ? costBasis / totalQty : 0;
        const saleQty = party.isMixed
          ? ((t.metalType || 'goud') === 'goud' ? goldToGram(qty, t.goldUnit) : silverToOz(qty, t.silverUnit))
          : qty;
        const soldCost = saleQty * avgPx;
        realizedCostBasis += soldCost;
        realizedProceeds += proceeds;
        realizedPnl += proceeds - soldCost - fee;
        costBasis = Math.max(0, costBasis - soldCost);
        if (party.isMixed) {
          const mt = t.metalType || 'goud';
          if (mt === 'goud') goldQty = Math.max(0, goldQty - goldToGram(qty, t.goldUnit));
          else silverQty = Math.max(0, silverQty - silverToOz(qty, t.silverUnit));
        } else {
          quantity = Math.max(0, quantity - qty);
        }
        break;
      }
      case 'dividend': {
        // Herbelegging dividend: participaties gratis ontvangen → toevoegen aan bezit maar NIET aan costBasis
        const qty = +t.quantity || 0;
        const px  = +t.unitPriceEur || 0;
        const divValue = (qty > 0 && px > 0) ? qty * px : (+t.amountEur || 0);
        if (qty > 0 && px > 0) {
          if (party.isMixed) {
            const mt = t.metalType || 'goud';
            if (mt === 'goud') goldQty += goldToGram(qty, t.goldUnit);
            else silverQty += silverToOz(qty, t.silverUnit);
          } else {
            quantity += qty;
          }
        }
        totalDividend += divValue;
        totalIncome   += divValue;
        break;
      }
      case 'rente':  totalIncome += +t.amountEur || 0; break;
      case 'kosten': {
        const kst = +t.amountEur || 0;
        totalFees += kst;
        costBasis += kst; // opslagkosten e.d. tellen mee als werkelijke investering
        break;
      }
      case 'waardering':
        if (t.unitPriceEur != null) lastUnitPrice  = +t.unitPriceEur;
        if (t.valueEur     != null) lastTotalValue = +t.valueEur;
        if ((party.unit === 'gram' || party.unit === 'ounce') && t.quantity != null) quantity = +t.quantity;
        lastValuationDate = t.date;
        break;
    }
  }

  // Determine current value
  let currentValueEur;
  let currentUnitPrice = null;

  if (party.isMixed) {
    // Goldrepublic: gold grams × goldSpot + silver oz × silverSpot
    currentValueEur = goldQty * (spots.goldSpotEurPerGram || 0) + silverQty * (spots.silverSpotEurPerOunce || 0);
    quantity = goldQty + silverQty; // total quantity (not meaningful unit)
  } else if (party.unit === 'crypto') {
    // Self-custody wallet met publiek adres: on-chain saldo is leidend voor het aantal.
    const chain = party.address && spots && spots.chainBalances ? spots.chainBalances[party.id] : null;
    if (chain && chain.address === party.address && Number.isFinite(chain.qty)) {
      bookedQuantity = quantity;
      quantity = chain.qty;
      chainCheckedAt = chain.checkedAt || null;
    }
    // Crypto: gebruik live spot prijs, val terug op laatste waardering
    currentUnitPrice = spotEurForParty(party, spots) ?? lastUnitPrice;
    currentValueEur  = (currentUnitPrice || 0) * quantity;
  } else if (party.unit === 'eur') {
    currentValueEur = lastTotalValue ?? quantity;
    currentUnitPrice = 1;
  } else if (party.unit === 'bundle') {
    // Top 25 Bundel: inleg optellen, waarde handmatig herwaarderen
    // Backwards compat: als oude transactie unitPriceEur gebruikte als totaalwaarde, accepteer dat ook
    const bundleVal = lastTotalValue ?? (lastUnitPrice != null ? lastUnitPrice : null);
    currentValueEur = bundleVal ?? quantity; // quantity = totaal ingelegd in €
    currentUnitPrice = null;
  } else if (lastTotalValue != null && lastUnitPrice == null) {
    currentValueEur = lastTotalValue;
  } else {
    if (party.unit === 'gram' || party.unit === 'ounce') {
      currentUnitPrice = lastUnitPrice ?? spotEurForParty(party, spots);
    } else {
      // Voor meesman en andere unit='part' partijen: live NAV heeft prioriteit, dan laatste waardering, dan kostprijs
      const livePx = spotEurForParty(party, spots);
      currentUnitPrice = livePx ?? lastUnitPrice ?? (quantity > 0 && lastTotalValue != null ? lastTotalValue / quantity : (quantity > 0 ? costBasis / quantity : null));
    }
    currentValueEur = currentUnitPrice != null ? quantity * currentUnitPrice : costBasis;
  }

  const costQty = party.isMixed ? goldQty + silverQty : (bookedQuantity != null ? bookedQuantity : quantity);
  const avgCost = costQty > 0 ? costBasis / costQty : null;
  const invested = costBasis + realizedCostBasis;
  const pnl = currentValueEur - costBasis + realizedPnl;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;

  return {
    party, transactions: txs,
    quantity,
    goldQty:   party.isMixed ? goldQty   : undefined,
    silverQty: party.isMixed ? silverQty : undefined,
    costBasis, avgCost,
    currentUnitPrice, currentValueEur,
    invested,
    lastValuationDate,
    totalDividend, totalFees, totalIncome,
    totalCashback, netCashIn,
    realizedCostBasis, realizedProceeds, realizedPnl,
    pnl, pnlPct,
    bookedQuantity, chainCheckedAt,
  };
}

// Per-allocation daily value time series.
function buildPartyTimeSeries(transactions, parties, spots) {
  if (!transactions.length) return { dates: [], byParty: {}, total: [], invested: [] };
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const tcMap = transferCostMap(transactions);
  const txByParty = Object.fromEntries(parties.map(p => [p.id, sorted.filter(t => t.party === p.id)]));
  const unitValuationsByParty = Object.fromEntries(parties.map(p => [p.id, unitValuationPoints(txByParty[p.id] || [])]));
  const totalValuationsByParty = Object.fromEntries(parties.map(p => [p.id, totalValuationPoints(txByParty[p.id] || [])]));
  const state = {};
  for (const p of parties) state[p.id] = { qty: 0, goldQty: 0, silverQty: 0, cost: 0, lastUnitPx: null, lastTotal: null };

  const dates = [];
  const byParty = Object.fromEntries(parties.map(p => [p.id, []]));
  const total = []; const invested = [];

  let ti = 0;
  let iso = sorted[0].date;
  const endIso = todayIsoLocal();
  while (iso <= endIso) {
    while (ti < sorted.length && sorted[ti].date <= iso) {
      const t = sorted[ti];
      if (t.type === 'overboeking') {
        const tc = tcMap[t.id] || { cost: 0 };
        const src = state[t.party], dst = state[t.toParty];
        if (src) { src.qty = Math.max(0, src.qty - transferOutQty(t)); src.cost = Math.max(0, src.cost - tc.cost); }
        if (dst) { dst.qty += +t.quantity || 0; dst.cost += tc.cost; }
        ti++; continue;
      }
      const s = state[t.party]; if (!s) { ti++; continue; }
      const p = parties.find(x => x.id === t.party);
      if (t.feeEur) s.cost += +t.feeEur; // fees tellen mee in investering
      switch (t.type) {
        case 'inleg':
          if (p.unit === 'eur' || p.unit === 'bundle') {
            const amt = +t.amountEur || 0;
            s.qty += amt; s.cost += amt;
            if (s.lastTotal != null) s.lastTotal += amt;
          }
          break;
        case 'opname':
          if (p.unit === 'eur' || p.unit === 'bundle') {
            const amt = +t.amountEur||0;
            if (s.qty > 0) s.cost = Math.max(0, s.cost - (s.cost * (amt / s.qty)));
            s.qty = Math.max(0, s.qty - amt);
            if (s.lastTotal != null) s.lastTotal = Math.max(0, s.lastTotal - amt);
          } else {
            const qty = +t.quantity || 0;
            const totQty = p.isMixed ? s.goldQty + s.silverQty : s.qty;
            const avg = totQty > 0 ? s.cost / totQty : 0;
            const outQty = p.isMixed
              ? ((t.metalType || 'goud') === 'goud' ? goldToGram(qty, t.goldUnit) : silverToOz(qty, t.silverUnit))
              : qty;
            s.cost = Math.max(0, s.cost - outQty * avg);
            if (s.lastTotal != null) {
              const valAvg = s.lastUnitPx ?? (totQty > 0 ? s.lastTotal / totQty : avg);
              s.lastTotal = Math.max(0, s.lastTotal - outQty * valAvg);
            }
            if (p.isMixed) {
              const mt = t.metalType || 'goud';
              if (mt === 'goud') s.goldQty = Math.max(0, s.goldQty - goldToGram(qty, t.goldUnit));
              else s.silverQty = Math.max(0, s.silverQty - silverToOz(qty, t.silverUnit));
            } else {
              s.qty = Math.max(0, s.qty - qty);
            }
          }
          break;
        case 'koop': case 'cashback':
          if (p.unit === 'bundle') {
            const amount = (+t.amountEur || 0) || (+t.quantity || 0) * (+t.unitPriceEur || 0);
            s.qty += amount;
            s.cost += amount;
            if (s.lastTotal != null) s.lastTotal += amount;
          } else if (p.isMixed) {
            const mt = t.metalType || 'goud';
            if (mt === 'goud') s.goldQty += goldToGram(+t.quantity||0, t.goldUnit);
            else s.silverQty += silverToOz(+t.quantity||0, t.silverUnit);
            s.cost += (+t.quantity||0) * dtTxPrice(t);
            if (s.lastTotal != null) s.lastTotal += (+t.quantity||0) * dtTxPrice(t);
          } else {
            s.qty += +t.quantity||0;
            s.cost += (+t.quantity||0) * dtTxPrice(t);
            if (s.lastTotal != null) s.lastTotal += (+t.quantity||0) * dtTxPrice(t);
          }
          break;
        case 'dividend': {
          // Herbelegging: participaties worden gratis bijgeschreven, GEEN cost toevoeging
          const dQty = +t.quantity||0;
          if (dQty > 0) {
            if (p.isMixed) {
              const mt = t.metalType || 'goud';
              if (mt === 'goud') s.goldQty += goldToGram(dQty, t.goldUnit);
              else s.silverQty += silverToOz(dQty, t.silverUnit);
            } else {
              s.qty += dQty;
            }
          }
          break;
        }
        case 'verkoop': {
          const qty = +t.quantity||0;
          if (p.unit === 'bundle') {
            const proceeds = (+t.amountEur || 0) || qty * (+t.unitPriceEur || 0);
            if (s.qty > 0) s.cost = Math.max(0, s.cost - (s.cost * (proceeds / s.qty)));
            s.qty = Math.max(0, s.qty - proceeds);
            if (s.lastTotal != null) s.lastTotal = Math.max(0, s.lastTotal - proceeds);
            break;
          }
          const totQty = p.isMixed ? s.goldQty + s.silverQty : s.qty;
          const avg = totQty > 0 ? s.cost / totQty : 0;
          const valAvg = s.lastUnitPx ?? (totQty > 0 && s.lastTotal != null ? s.lastTotal / totQty : avg);
          s.cost = Math.max(0, s.cost - qty * avg);
          if (s.lastTotal != null) s.lastTotal = Math.max(0, s.lastTotal - qty * valAvg);
          if (p.isMixed) {
            const mt = t.metalType || 'goud';
            if (mt === 'goud') s.goldQty = Math.max(0, s.goldQty - goldToGram(qty, t.goldUnit));
            else s.silverQty = Math.max(0, s.silverQty - silverToOz(qty, t.silverUnit));
          } else {
            s.qty = Math.max(0, s.qty - qty);
          }
          break;
        }
        case 'kosten':
          s.cost += +t.amountEur || 0; // opslagkosten in investering
          break;
        case 'waardering':
          if (t.unitPriceEur != null) s.lastUnitPx = +t.unitPriceEur;
          if (t.valueEur     != null) s.lastTotal  = +t.valueEur;
          if ((p.unit === 'gram' || p.unit === 'ounce') && t.quantity != null) s.qty = +t.quantity;
          break;
      }
      ti++;
    }

    const CRYPTO_HIST_KEY = { btcSpotEur: 'btcHistory', ethSpotEur: 'ethHistory', paxgSpotEur: 'paxgHistory' };
    let tot = 0, inv = 0;
    for (const p of parties) {
      const s = state[p.id];
      const unitValuations = unitValuationsByParty[p.id] || [];
      const totalValuations = totalValuationsByParty[p.id] || [];
      const avgCostPx = s.qty > 0 ? s.cost / s.qty : null;
      let v;
      if (p.isMixed) {
        const manualTotal = weeklyInterpolatedValue(totalValuations, iso, null);
        if (manualTotal != null) v = manualTotal;
        else {
          const goldPx = (spots.goldHistory?.length ? findNavForDate(spots.goldHistory, iso) : null) ?? (spots.goldSpotEurPerGram||0);
          const silvPx = (spots.silverHistory?.length ? findNavForDate(spots.silverHistory, iso) : null) ?? (spots.silverSpotEurPerOunce||0);
          v = s.goldQty * goldPx + s.silverQty * silvPx;
        }
      } else if (p.unit === 'crypto') {
        const manualTotal = weeklyInterpolatedValue(totalValuations, iso, null);
        if (manualTotal != null) v = manualTotal;
        else {
          const histKey = CRYPTO_HIST_KEY[p.spotKey];
          const histPx = histKey && spots[histKey]?.length ? findNavForDate(spots[histKey], iso) : null;
          const manualPx = weeklyInterpolatedValue(unitValuations, iso, avgCostPx);
          v = s.qty * (histPx ?? manualPx ?? spots[p.spotKey] ?? 0);
        }
      } else if (p.unit === 'bundle') {
        v = bundleWeeklyInterpolatedValue(txByParty[p.id] || [], iso);
      } else if (p.unit === 'eur') {
        v = weeklyInterpolatedValue(totalValuations, iso, s.qty) ?? s.qty;
      } else {
        let px = null;
        // Meesman: gebruik historische NAV indien beschikbaar
        if (px == null && p.id === 'meesman' && spots.meesmanNavHistory?.length) {
          const histNav = findNavForDate(spots.meesmanNavHistory, iso);
          if (histNav != null) px = histNav;
        }
        if (px == null && p.unit === 'gram')  px = (spots.goldHistory?.length   ? findNavForDate(spots.goldHistory,   iso) : null) ?? spotEurForParty(p, spots);
        if (px == null && p.unit === 'ounce') px = (spots.silverHistory?.length ? findNavForDate(spots.silverHistory, iso) : null) ?? spotEurForParty(p, spots);
        if (px == null) px = spotEurForParty(p, spots); // meesman live NAV als fallback
        if (px == null) px = weeklyInterpolatedValue(unitValuations, iso, avgCostPx);
        if (px == null && s.qty > 0) px = avgCostPx;
        const manualTotal = px == null ? weeklyInterpolatedValue(totalValuations, iso, null) : null;
        v = manualTotal ?? ((px || 0) * s.qty);
      }
      byParty[p.id].push(v);
      tot += v; inv += s.cost;
    }
    dates.push(iso); total.push(tot); invested.push(inv);
    iso = addDaysIso(iso, 1);
  }

  return { dates, byParty, total, invested };
}

function buildValueTimeSeries(transactions, parties, spots) {
  const ts = buildPartyTimeSeries(transactions, parties, spots);
  return ts.dates.map((d, i) => ({ date: d, total: ts.total[i], invested: ts.invested[i] }));
}

function calcYTDReturn(timeSeries) {
  if (!timeSeries.length) return { pnl: 0, pnlPct: 0, startValue: 0, currentValue: 0 };
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const current = timeSeries[timeSeries.length - 1];
  // Find value at start of year (or closest date after)
  const startPoint = timeSeries.find(t => t.date >= yearStart) || timeSeries[0];
  const startValue = startPoint.total;
  const currentValue = current.total;
  // Simple absolute return YTD (no cash-flow adjustment for now)
  const pnl = currentValue - startValue;
  const pnlPct = startValue > 0 ? (pnl / startValue) * 100 : 0;
  return { pnl, pnlPct, startValue, currentValue, since: startPoint.date };
}

function buildMonthlyFlows(transactions) {
  const map = new Map();
  for (const t of transactions) {
    const key = t.date.slice(0, 7);
    if (!map.has(key)) map.set(key, { month: key, inleg: 0, opname: 0, dividend: 0, kosten: 0, koop: 0, verkoop: 0, fees: 0, rente: 0 });
    const m = map.get(key);
    if (t.type === 'inleg')    m.inleg    += +t.amountEur || 0;
    if (t.type === 'opname')   m.opname   += +t.amountEur || 0;
    if (t.type === 'dividend') {
      // Herbelegging: quantity × unitPriceEur als waarde; valt terug op amountEur voor oud formaat
      const divVal = (t.quantity != null && t.unitPriceEur != null)
        ? (+t.quantity||0) * (+t.unitPriceEur||0)
        : (+t.amountEur||0);
      m.dividend += divVal;
    }
    if (t.type === 'kosten')   m.kosten   += +t.amountEur || 0;
    if (t.type === 'rente')    m.rente    += +t.amountEur || 0;
    if (t.type === 'koop' || t.type === 'cashback')
      m.koop += (+t.quantity||0) * dtTxPrice(t);
    if (t.type === 'verkoop')  m.verkoop  += (+t.amountEur || 0) || (+t.quantity||0) * dtTxPrice(t);
    if (t.feeEur)              m.fees     += +t.feeEur;
  }
  return [...map.values()].sort((a,b) => a.month.localeCompare(b.month));
}

// ===== Formatters =====
function fmtEur(n, opts = {}) {
  const { decimals = 0, sign = false } = opts;
  if (n == null || Number.isNaN(n)) return '—';
  const s = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Math.abs(n));
  const prefix = sign ? (n > 0 ? '+' : n < 0 ? '−' : '') : (n < 0 ? '−' : '');
  return `${prefix}€\u202f${s}`;
}
function fmtPct(n, opts = {}) {
  const { decimals = 2, sign = true } = opts;
  const p = dtSignedParts(n, decimals, sign);
  return p ? `${p.prefix}${p.body}%` : '—';
}
function fmtQty(n, unit, opts = {}) {
  if (n == null) return '—';
  const d = opts.decimals ?? (Math.abs(n) >= 100 ? 1 : 3);
  const s = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: d, minimumFractionDigits: 0 }).format(n);
  return unit ? `${s}\u202f${unit}` : s;
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtMonth(ym) {
  const [y, m] = ym.split('-');
  return new Date(+y, +m - 1, 1).toLocaleDateString('nl-NL', { month: 'short', year: '2-digit' });
}

// =====================================================================
// ===== Redesign foundation (F1): prefs, formatters, domain helpers ====
// =====================================================================

// ----- UI prefs (per device, never synced) -----
const UI_PREFS_KEY = 'investeringen-ui-v1';
const MQ_MOBILE = '(max-width: 767.98px)';
const DEFAULT_UI_PREFS = {
  v: 1,
  theme: 'system',
  cvd: false,
  privacy: false,
  startPrivate: false,
  sidebarCollapsed: false,
  period: '1J',
  chartMode: 'value',
  exclPE: false,
  resultMode: 'eur',
  stackMode: 'pct',
  positionsGrouping: 'class',
  positionsSort: { key: 'value', dir: 'desc' },
  positionsSecondary: 'pnl',
  collapsedGroups: [],
  showClosed: false,
  txView: 'list',
  monthBarsMode: 'month',
  recentParties: [],
};

function themeFromLegacy(theme) {
  if (['dark', 'terminal', 'nord', 'nebula', 'catppuccin', 'gruvbox', 'rosepine'].includes(theme)) return 'dark';
  if (['warm', 'solarized'].includes(theme)) return 'light';
  return 'system';
}

function loadUiPrefs(state) {
  try {
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(UI_PREFS_KEY)); } catch (e) { stored = null; }
    let prefs;
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      prefs = { ...DEFAULT_UI_PREFS, ...stored };
    } else {
      const map = { pnl_eur: 'pnl', pnl_pct: 'pnlPct', value: 'value', invested: 'invested', share: 'value', ytd_pct: 'pnl' };
      const counts = {};
      for (const v of Object.values((state && state.tileMetrics) || {})) {
        const k = map[v];
        if (k) counts[k] = (counts[k] || 0) + 1;
      }
      let seed = 'pnl', best = 0;
      for (const [k, c] of Object.entries(counts)) if (c > best) { best = c; seed = k; }
      prefs = { ...DEFAULT_UI_PREFS, theme: themeFromLegacy(state && state.tweaks && state.tweaks.theme), positionsSecondary: seed };
    }
    if (prefs.startPrivate) prefs.privacy = true;
    return prefs;
  } catch (e) {
    return { ...DEFAULT_UI_PREFS };
  }
}

function saveUiPrefs(prefs) {
  try { localStorage.setItem(UI_PREFS_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ }
}

// ----- Formatters (nl-NL, U+2212 minus, U+202F after €) -----
const MONTHS_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const MONTHS_NL_LONG = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

const DT_NF_CACHE = {};
function dtNf(min, max = min) {
  const k = min + ':' + max;
  if (!DT_NF_CACHE[k]) DT_NF_CACHE[k] = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: min, maximumFractionDigits: max });
  return DT_NF_CACHE[k];
}

// Shared sign/rounding algorithm for money, pct and pt. Returns null for missing / non-finite.
function dtSignedParts(n, decimals = 0, sign = false) {
  if (n == null || n === '') return null;
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return null;
  const f = Math.pow(10, decimals);
  const abs = Math.round(Math.abs(v) * f) / f;
  const r = v < 0 ? -abs : abs;
  const prefix = r < 0 ? '−' : (sign && r > 0 ? '+' : '');
  return { prefix, body: dtNf(decimals).format(abs), r };
}

function fmtMoney(n, opts = {}) {
  const { decimals = 0, sign = false } = opts;
  const p = dtSignedParts(n, decimals, sign);
  return p ? `${p.prefix}€ ${p.body}` : '—';
}

function fmtPt(n, opts = {}) {
  const { decimals = 1 } = opts;
  const p = dtSignedParts(n, decimals, true);
  return p ? `${p.prefix}${p.body} pt` : '—';
}

function fmtCompact(n) {
  if (n == null || n === '') return '—';
  const v = +n;
  if (!Number.isFinite(v)) return '—';
  const a = Math.abs(v);
  let body;
  if (Math.round(a) < 1000) {
    body = String(Math.round(a));
  } else if (Math.round(a / 1000) < 1000) {
    const k = a / 1000;
    const tenths = Math.round(k * 10);
    body = (tenths < 100 && tenths % 10 !== 0) ? dtNf(1).format(tenths / 10) + 'k' : String(Math.round(k)) + 'k';
  } else {
    const m = Math.round(a / 1e5) / 10;
    body = (Number.isInteger(m) ? dtNf(0).format(m) : dtNf(1).format(m)) + ' mln';
  }
  const prefix = v < 0 && body !== '0' ? '−' : '';
  return `${prefix}€ ${body}`;
}

function dtParseIso(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(iso);
  if (!m) return null;
  return { y: +m[1], m: +m[2], d: m[3] ? +m[3] : 1 };
}

function fmtDateLong(iso) {
  const p = dtParseIso(iso);
  return p ? `${p.d} ${MONTHS_NL[p.m - 1]} ${p.y}` : '—';
}

function fmtDateShort(iso, todayIso = todayIsoLocal()) {
  const p = dtParseIso(iso);
  if (!p) return '—';
  const t = dtParseIso(todayIso);
  return t && t.y === p.y ? `${p.d} ${MONTHS_NL[p.m - 1]}` : `${p.d} ${MONTHS_NL[p.m - 1]} ${p.y}`;
}

function fmtAxisMonth(iso) {
  const p = dtParseIso(iso);
  return p ? `${MONTHS_NL[p.m - 1]} ${String(p.y).slice(2)}` : '';
}

function fmtMonthName(ym) {
  const p = dtParseIso(ym);
  if (!p) return '—';
  const n = MONTHS_NL_LONG[p.m - 1];
  return `${n.charAt(0).toUpperCase()}${n.slice(1)} ${p.y}`;
}

function fmtTime(iso) {
  if (!iso) return '—';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return '—';
  return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
}

function fmtRelDay(iso, todayIso = todayIsoLocal()) {
  if (!dtParseIso(iso)) return '—';
  const day = iso.slice(0, 10);
  if (day === todayIso) return 'vandaag';
  if (addDaysIso(day, 1) === todayIso) return 'gisteren';
  return fmtDateShort(day, todayIso);
}

function parseNlNumber(str) {
  if (str == null) return null;
  if (typeof str === 'number') return Number.isFinite(str) ? str : null;
  let s = String(str).trim().replace(/[€%\s  ]/g, '').replace(/−/g, '-');
  if (!s) return null;
  const hasDot = s.includes('.'), hasComma = s.includes(',');
  if (hasDot && hasComma) s = s.replace(/\./g, '').replace(',', '.');
  else if (hasComma) {
    if ((s.match(/,/g) || []).length !== 1) return null;
    s = s.replace(',', '.');
  } else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, '');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// ----- Asset classes, colours, monograms -----
const ASSET_CLASSES = [
  { key: 'pe',    label: 'Private equity', color: 'var(--cat-pe)' },
  { key: 'idx',   label: 'Indexfondsen',   color: 'var(--cat-idx)' },
  { key: 'pm',    label: 'Edelmetaal',     color: 'var(--cat-pm)' },
  { key: 'cr',    label: 'Crypto',         color: 'var(--cat-cr)' },
  { key: 'cf',    label: 'Crowdfunding',   color: 'var(--cat-cf)' },
  { key: 'br',    label: 'Broker',         color: 'var(--cat-br)' },
  { key: 'other', label: 'Overig',         color: 'var(--cat-other)' },
  { key: 'liq',   label: 'Liquide',        color: 'var(--cat-liq)' },
];
const ASSET_CLASS_BY_KEY = Object.fromEntries(ASSET_CLASSES.map(c => [c.key, c]));

function assetClassOf(p) {
  const id = p && p.id;
  const cat = String((p && p.category) || '').trim().toLowerCase();
  if (id === 'cash' || cat === 'liquide' || cat === 'cash') return 'liq';
  if (cat === 'private equity') return 'pe';
  if (['indexfondsen', 'aandelen', 'etf', "etf's", 'fondsen'].includes(cat)) return 'idx';
  if (cat === 'edelmetaal' || ['goldrepublic', 'goud', 'zilver'].includes(id)) return 'pm';
  if (cat === 'crypto') return 'cr';
  if (cat === 'crowdfunding') return 'cf';
  if (cat === 'broker') return 'br';
  return 'other';
}

function partyColorOf(party) {
  if (!party) return ASSET_CLASS_BY_KEY.other.color;
  return party.useOwnColor === true && party.color ? party.color : ASSET_CLASS_BY_KEY[assetClassOf(party)].color;
}

function monogramOf(party) {
  if (!party) return '?';
  if (party.id === 'goud') return 'Au';
  if (party.id === 'zilver') return 'Ag';
  if (party.id === 'goldrepublic') return 'GR';
  if (party.unit === 'eur' || assetClassOf(party) === 'liq') return '€';
  if (party.unit === 'crypto' && /^[A-Za-z]{2,4}$/.test(party.unitLabel || '')) return party.unitLabel.toUpperCase();
  const words = String(party.name || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  if (words.length >= 2 && /^\p{L}/u.test(words[1])) return (words[0][0] + words[1][0]).toUpperCase();
  const caps = words[0].match(/\p{Lu}/gu) || [];
  if (caps.length >= 2) return caps[0] + caps[1];
  return words[0].charAt(0).toUpperCase() + (words[0].charAt(1) || '').toLowerCase();
}

// ----- Logo's per partij (assets/logos/) -----
// Bestanden '*-tile.*' zijn volledige app-tegels (vullen de hele tile). Op id; eigen (custom_*) partijen matchen op genormaliseerde naam. party.logo (pad of URL) wint altijd.
const PARTY_LOGOS = {
  meesman: 'meesman.svg', finst: 'finst.svg', 'finst-top25': 'finst.svg', wallet: 'coinbase-wallet.svg',
  'finst-paxg': 'paxg.svg', goldrepublic: 'goldrepublic-tile.png', trading212: 't212-tile.png',
  goud: 'gold-bar.svg', zilver: 'silver-bar.svg',
  greenmine: 'greenmine.png', greenmining: 'greenmine.png', naoinvest: 'nao.png', nao: 'nao.png', uptomore: 'uptomore-tile.png',
  coinbase: 'coinbase-wallet.svg', coinbasewallet: 'coinbase-wallet.svg',
};
const COIN_LOGOS = { BTC: 'btc.svg', ETH: 'eth.svg', PAXG: 'paxg.svg' };

// ----- Onderliggende fondsen (look-through) per partij -----
// Statische data uit primaire bronnen. weight = feitelijk gewicht (%), target = strategisch gewicht (%) of null
// als het prospectus geen vaste verdeling noemt (targetNote legt dan uit hoe er gewogen wordt).
// party.underlying (zelfde vorm) wint boven deze tabel.
const MEESMAN_UNDERLYING = {
  name: 'Meesman Indexfonds Aandelen Wereldwijd Totaal A',
  isin: 'NL0013689110',
  targetNote: 'marktgewogen',
  asOf: '2026-06-30',
  source: { publisher: 'Meesman', label: 'Halfjaarbericht 2026', url: 'https://www.meesman.nl/media/yculft3d/mp-hjb-2026.pdf' },
  funds: [
    { name: 'Northern Trust World Screened Equity Index Fund', short: 'Ontwikkelde landen', index: 'MSCI World Custom ESG', isin: null, target: null, weight: 79.955, color: 'oklch(58% 0.14 255)' },
    { name: 'Northern Trust Emerging Markets Screened Equity Index FGR Fund', short: 'Opkomende landen', index: 'MSCI Emerging Markets Custom ESG', isin: null, target: null, weight: 10.396, color: 'oklch(70% 0.13 175)' },
    { name: 'Northern Trust World Small Cap Low Carbon Equity Index FGR Feeder Fund', short: 'Kleine bedrijven', index: 'MSCI World Small Cap Custom ESG Low Carbon', isin: null, target: null, weight: 9.649, color: 'oklch(78% 0.12 85)' },
  ],
  regions: {
    title: 'Landen',
    asOf: '2026-09-30',
    note: '5.047 aandelen in 47 landen',
    source: { publisher: 'Meesman', label: 'Factsheet', url: 'https://www.meesman.nl/media/zpvkkdiw/factsheet-meesman-indexfonds-aandelen-wereldwijd-totaal-a-30-09-2026.pdf' },
    items: [
      { label: 'Verenigde Staten', weight: 62.9 }, { label: 'Japan', weight: 6.1 }, { label: 'Taiwan', weight: 3.3 },
      { label: 'Verenigd Koninkrijk', weight: 2.9 }, { label: 'Canada', weight: 2.8 }, { label: 'Overig', weight: 22.1 },
    ],
  },
};
const UNDERLYING_BY_PARTY = { meesman: MEESMAN_UNDERLYING };
function underlyingOf(party) {
  if (!party) return null;
  const u = party.underlying || UNDERLYING_BY_PARTY[party.id];
  return u && Array.isArray(u.funds) && u.funds.length ? u : null;
}

function partyLogo(party) {
  if (!party) return null;
  if (party.logo) return /^(https?:|data:|\/)/.test(party.logo) ? party.logo : assetUrl(party.logo);
  const nameKey = String(party.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const file = PARTY_LOGOS[party.id] || COIN_LOGOS[String(party.coin || '').toUpperCase()] || PARTY_LOGOS[nameKey];
  return file ? assetUrl('assets/logos/' + file) : null;
}

// ----- Holdings helpers -----
const ATTENTION_THRESHOLDS = { concentrationPct: 40, driftPt: 5, staleDays: 30, navStaleDays: 7, priceStaleHours: 2 };

function dtUnitKind(party) {
  if (!party) return 'part';
  if (party.unit === 'post') return 'post';
  if (party.isMixed || party.unit === 'mixed') return 'mixed';
  return party.unit || 'part';
}
function dtFmt2(n) { return dtNf(2).format(+n || 0); }
function dtLastHistDate(hist) { return Array.isArray(hist) && hist.length ? hist[hist.length - 1].date : null; }

// Per-coin tekst voor een crypto-post, bv. "0,0055 BTC · 0,02 ETH" (alleen coins met saldo, anders alle).
function postCoinsText(s) {
  const leaves = s.leaves || [];
  const withQty = leaves.filter(l => (+l.quantity || 0) > 0);
  const list = withQty.length ? withQty : leaves;
  if (!list.length) return '—';
  return list.map(l => fmtQty(+l.quantity || 0, l.party.unitLabel, { decimals: (+l.quantity || 0) < 1 ? 6 : 4 })).join(' · ');
}

function holdingQtyText(s) {
  const p = s.party, q = +s.quantity || 0;
  switch (dtUnitKind(p)) {
    case 'post':   return postCoinsText(s);
    case 'part':   return `${dtFmt2(q)} ${p.unitLabel || 'part.'}`;
    case 'gram':   return `${dtFmt2(q)} g`;
    case 'ounce':  return `${dtFmt2(q)} oz`;
    case 'crypto': return fmtQty(q, p.unitLabel, { decimals: q < 1 ? 6 : 4 });
    case 'mixed':  return `Au ${dtFmt2(s.goldQty)} g · Ag ${dtFmt2(s.silverQty)} oz`;
    default:       return '—';
  }
}

function holdingPriceText(s, spots = {}) {
  const p = s.party, px = s.currentUnitPrice;
  switch (dtUnitKind(p)) {
    case 'part': {
      const date = (p.id === 'meesman' ? dtLastHistDate(spots.meesmanNavHistory) : null) || s.lastValuationDate;
      return `NAV ${fmtMoney(px, { decimals: 4 })}${date ? ' · ' + fmtDateShort(date) : ''}`;
    }
    case 'crypto': return `Spot ${fmtMoney(px, { decimals: px >= 1000 ? 0 : 2 })}`;
    case 'post':   return (s.leaves || []).map(l => `${l.party.unitLabel} ${fmtMoney(l.currentUnitPrice, { decimals: (l.currentUnitPrice || 0) >= 1000 ? 0 : 2 })}`).join(' · ') || '—';
    case 'gram':   return `Spot ${fmtMoney(px ?? spots.goldSpotEurPerGram, { decimals: 2 })}/g`;
    case 'ounce':  return `Spot ${fmtMoney(px ?? spots.silverSpotEurPerOunce, { decimals: 2 })}/oz`;
    case 'mixed':  return `Goud ${fmtMoney(spots.goldSpotEurPerGram, { decimals: 2 })}/g · Zilver ${fmtMoney(spots.silverSpotEurPerOunce, { decimals: 2 })}/oz`;
    default:
      return s.lastValuationDate ? `Waardering ${fmtMoney(s.currentValueEur)} · ${fmtDateShort(s.lastValuationDate)}` : 'Ingelegd';
  }
}

function holdingSubline(s, spots = {}, todayIso = todayIsoLocal()) {
  const p = s.party, px = s.currentUnitPrice;
  const kind = dtUnitKind(p);
  switch (kind) {
    case 'part':   return { text: `${holdingQtyText(s)} · NAV ${fmtMoney(px, { decimals: 2 })}`, staleDays: null };
    case 'crypto': return { text: `${holdingQtyText(s)} · ${fmtMoney(px, { decimals: px >= 1000 ? 0 : 2 })}`, staleDays: null };
    case 'post':   return { text: postCoinsText(s), staleDays: null };
    case 'gram':   return { text: `${holdingQtyText(s)} · ${fmtMoney(px ?? spots.goldSpotEurPerGram, { decimals: 2 })}/g`, staleDays: null };
    case 'ounce':  return { text: `${holdingQtyText(s)} · ${fmtMoney(px ?? spots.silverSpotEurPerOunce, { decimals: 2 })}/oz`, staleDays: null };
    case 'mixed':  return { text: `Au ${fmtQty(s.goldQty || 0, 'g', { decimals: 2 })} · Ag ${fmtQty(s.silverQty || 0, 'oz', { decimals: 2 })}`, staleDays: null };
    default: {
      const text = s.lastValuationDate ? `Waardering · ${fmtDateShort(s.lastValuationDate, todayIso)}` : (p.subtitle || 'Geen waardering');
      let staleDays = null;
      if (s.lastValuationDate && (s.currentValueEur || 0) > 0) {
        const days = daysBetween(s.lastValuationDate, todayIso);
        if (days > ATTENTION_THRESHOLDS.staleDays) staleDays = days;
      }
      return { text, staleDays };
    }
  }
}

function goalProgress(s) {
  const p = s.party;
  if (!(+p.goal > 0)) return null;
  const goal = +p.goal;
  const kind = dtUnitKind(p);
  if (kind === 'gram' || kind === 'ounce') {
    const unit = kind === 'gram' ? 'g' : 'oz';
    return { pct: (+s.quantity || 0) / goal * 100, label: `${dtFmt2(s.quantity)} van ${dtNf(0, 2).format(goal)} ${unit}` };
  }
  return { pct: (+s.currentValueEur || 0) / goal * 100, label: `${fmtMoney(s.currentValueEur)} van ${fmtMoney(goal)}` };
}

function cagrOf(s, todayIso = todayIsoLocal()) {
  const first = s.transactions && s.transactions.length ? s.transactions[0].date : null;
  if (!first) return { pct: null, years: 0 };
  const years = Math.max(1 / 12, daysBetween(first, todayIso) / 365.25);
  const value = +s.currentValueEur || 0, invested = +s.invested || 0;
  const pct = (invested > 0 && value > 0 && years >= 1) ? (Math.pow(value / invested, 1 / years) - 1) * 100 : null;
  return { pct, years };
}

function isClosedSummary(s) {
  return !!s && s.transactions.length > 0 && Math.abs(s.currentValueEur || 0) < 0.5;
}

// ----- Party form constants (moved from dashboard.jsx; existing labels kept, mixed added) -----
const PARTY_UNIT_OPTIONS = [
  { value: 'bundle', label: 'Totale waarde — zoals Top 25 / Trading 212', defaultLabel: '€', unitLabel: '€' },
  { value: 'part',   label: 'Aantal × prijs — normale aandelen / participaties', defaultLabel: 'st.', unitLabel: 'st.' },
  { value: 'eur',    label: 'Eurobedrag — cash / sparen', defaultLabel: '€', unitLabel: '€' },
  { value: 'crypto', label: 'Token × koers — Bitcoin / Ethereum / PAXG', defaultLabel: 'TOKEN', unitLabel: 'TOKEN' },
  { value: 'gram',   label: 'Gram × spotprijs — goud', defaultLabel: 'g', unitLabel: 'g' },
  { value: 'ounce',  label: 'Ounce × spotprijs — zilver', defaultLabel: 'oz', unitLabel: 'oz' },
  { value: 'mixed',  label: 'Gemengd goud + zilver', defaultLabel: 'g/oz', unitLabel: 'g/oz' },
];
const CATEGORY_OPTIONS = ['Indexfondsen', 'Crypto', 'Edelmetaal', 'Broker', 'Liquide', 'Overig', 'Private Equity', 'Crowdfunding'];
const CUSTOM_CATEGORY_VALUE = '__custom__';
const COLOR_PRESETS = [
  'oklch(58% 0.14 255)','oklch(72% 0.18 55)','oklch(60% 0.12 265)',
  'oklch(76% 0.14 85)','oklch(62% 0.15 195)','oklch(55% 0.16 145)',
  'oklch(70% 0.03 240)','oklch(65% 0.18 320)','oklch(68% 0.15 30)',
  'oklch(62% 0.13 170)','oklch(72% 0.22 310)','oklch(55% 0.05 160)',
];

// ----- Transaction helpers -----
const TX_TYPE_META = {
  inleg:      { icon: 'arrow-down-to-line', hint: 'Geld erbij',        income: false },
  koop:       { icon: 'circle-plus',        hint: 'Stukken erbij',     income: false },
  verkoop:    { icon: 'circle-minus',       hint: 'Stukken eraf',      income: false },
  opname:     { icon: 'arrow-up-from-line', hint: 'Geld eraf',         income: false },
  dividend:   { icon: 'coins',              hint: 'Uitkering',         income: true  },
  rente:      { icon: 'percent',            hint: 'Rente, rendement',  income: true  },
  waardering: { icon: 'diamond',            hint: 'Nieuwe waarde',     income: false },
  kosten:     { icon: 'receipt',            hint: 'Fee, beheer',       income: false },
  cashback:   { icon: 'gift',               hint: 'Cashback',          income: true  },
  overboeking: { icon: 'arrow-left-right',  hint: 'Crypto naar andere post', income: false },
};

function allowedTxTypes(party) {
  if (isPostParty(party)) return allowedTxTypes({ unit: 'crypto', postId: party.id });
  return TX_TYPES.map(t => t.key).filter(k => {
    if (k === 'overboeking') return !!(party && party.unit === 'crypto' && party.postId);
    if (k === 'cashback' && !(party && party.id === 'trading212')) return false;
    if (party && party.unit === 'bundle' && ['koop', 'verkoop', 'cashback', 'dividend', 'rente'].includes(k)) return false;
    return true;
  });
}

function txUnitLabel(t, party) {
  if (!party) return '';
  if (dtUnitKind(party) === 'mixed') {
    return t.metalType === 'zilver' ? (t.silverUnit === 'gram' ? 'g' : 'oz') : (t.goldUnit === 'ounce' ? 'oz' : 'g');
  }
  switch (party.unit) {
    case 'crypto': return party.unitLabel || '';
    case 'gram':   return 'g';
    case 'ounce':  return 'oz';
    case 'part':   return party.unitLabel || 'part.';
    default:       return '';
  }
}

function txGross(t) {
  const qty = +t.quantity || 0, px = dtTxPrice(t);
  if (qty > 0 && px > 0) return qty * px;
  return +t.amountEur || 0;
}

function txNetTotal(t) {
  const fee = +t.feeEur || 0;
  switch (t.type) {
    case 'koop': case 'cashback': return txGross(t) + fee;
    case 'verkoop':  return txGross(t) - fee;
    case 'dividend': return txGross(t);
    case 'inleg': case 'opname': case 'rente': case 'kosten': return +t.amountEur || 0;
    case 'waardering': return t.valueEur != null && t.valueEur !== '' ? +t.valueEur : null;
    case 'overboeking': return null;
    default: return +t.amountEur || 0;
  }
}

// Naam voor weergave van een (sub-)partij-id, bv. "Wallet" voor wallet-btc. Gevuld door buildPortfolioModel.
let DT_PARTY_INDEX = {};
function dtPostNameOf(id) {
  const p = DT_PARTY_INDEX[id];
  if (!p) return id || '?';
  const post = p.postId ? DT_PARTY_INDEX[p.postId] : null;
  return post ? post.name : p.name;
}
function txTransferText(t, party) {
  const coin = (party && party.unitLabel) || '';
  const fee = +t.feeQty || 0;
  return `${dtPostNameOf(t.party)} → ${dtPostNameOf(t.toParty)} · ${fmtQty(+t.quantity || 0, coin, { decimals: 8 })}`
    + (fee > 0 ? ` (+ ${fmtQty(fee, coin, { decimals: 8 })} netwerkkosten)` : '');
}

function txAmountInfo(t, party) {
  if (t.type === 'overboeking') {
    return { text: fmtQty(+t.quantity || 0, (party && party.unitLabel) || '', { decimals: 8 }), tone: 'muted', sign: '' };
  }
  if (t.type === 'waardering') {
    let text = '—';
    if (t.valueEur != null && t.valueEur !== '') text = `= ${fmtMoney(+t.valueEur, { decimals: (+t.valueEur) % 1 === 0 ? 0 : 2 })}`;
    else if (t.unitPriceEur != null && t.unitPriceEur !== '') text = `NAV ${fmtMoney(+t.unitPriceEur, { decimals: 2 })}`;
    else if (t.quantity != null && t.quantity !== '') text = `= ${fmtQty(+t.quantity, txUnitLabel(t, party))}`;
    return { text, tone: 'muted', sign: '' };
  }
  const total = txNetTotal(t) || 0;
  const plus = ['inleg', 'rente', 'dividend', 'cashback', 'koop'].includes(t.type);
  const income = ['inleg', 'rente', 'dividend', 'cashback'].includes(t.type);
  const signed = plus ? Math.abs(total) : -Math.abs(total);
  return { text: fmtMoney(signed, { decimals: 2, sign: true }), tone: income ? 'income' : 'neutral', sign: plus ? '+' : '−' };
}

function txDetailsText(t, party) {
  if (t.type === 'overboeking') return txTransferText(t, party);
  const prefix = t.instrument ? `${t.instrument} · ` : '';
  const qty = +t.quantity || 0, px = +t.unitPriceEur || 0;
  if (qty > 0 && px > 0) {
    const isCrypto = party && party.unit === 'crypto';
    return prefix + fmtQty(qty, txUnitLabel(t, party), isCrypto ? { decimals: 8 } : {}) + ' × ' + fmtMoney(px, { decimals: 2 });
  }
  if (+t.amountEur) return prefix + fmtMoney(+t.amountEur, { decimals: 2 });
  if (t.valueEur != null && t.valueEur !== '') return prefix + '= ' + fmtMoney(+t.valueEur, { decimals: 2 });
  if (px) return prefix + 'NAV ' + fmtMoney(px, { decimals: 2 });
  return t.instrument || '';
}

// ----- Series and model -----
function dtDailyDates(startIso, endIso) {
  const out = [];
  if (!startIso) return out;
  for (let iso = startIso; iso <= endIso; iso = addDaysIso(iso, 1)) out.push(iso);
  return out;
}

function buildFlowSeries(transactions, parties) {
  if (!transactions || !transactions.length) return { dates: [], netByParty: {} };
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const todayIso = todayIsoLocal();
  const dates = dtDailyDates(sorted[0].date, todayIso);
  const idx = new Map(dates.map((x, i) => [x, i]));
  const netByParty = {};
  const ctx = { transferCost: transferCostMap(transactions) };
  for (const p of parties || []) {
    const arr = new Array(dates.length).fill(0);
    const txs = sorted.filter(t => txTouchesParty(t, p.id));
    const points = [];
    const seen = new Set();
    for (const t of txs) {
      if (t.date > todayIso || seen.has(t.date)) continue;
      seen.add(t.date);
      const sm = summarizeParty(p, txs.filter(x => x.date <= t.date), {}, ctx);
      points.push([idx.get(t.date), sm.costBasis - sm.realizedPnl]);
    }
    let pi = 0, cur = 0;
    for (let i = 0; i < dates.length; i++) {
      while (pi < points.length && points[pi][0] <= i) { cur = points[pi][1]; pi++; }
      arr[i] = cur;
    }
    netByParty[p.id] = arr;
  }
  return { dates, netByParty };
}

function dtIncluded(p) { return (p.includeInTotal ?? p.includeInPortfolio) !== false; }
function dtInChart(p)  { return (p.includeInTimeChart ?? p.includeInPortfolio) !== false; }

// Samenvatting van een crypto-post = som van zijn coin-sub-holdings (+ eventuele boekingen direct op de post).
function aggregatePostSummary(post, leaves, own) {
  const parts = own && own.transactions && own.transactions.length ? [...leaves, own] : leaves;
  const sum = k => parts.reduce((a, x) => a + (+x[k] || 0), 0);
  const seen = new Set();
  const transactions = [];
  for (const x of parts) for (const t of x.transactions || []) if (!seen.has(t.id)) { seen.add(t.id); transactions.push(t); }
  transactions.sort((a, b) => a.date.localeCompare(b.date));
  const invested = sum('invested');
  const pnl = sum('pnl');
  const lastDates = parts.map(x => x.lastValuationDate).filter(Boolean).sort();
  const chainDates = leaves.map(x => x.chainCheckedAt).filter(Boolean).sort();
  return {
    party: post, transactions,
    quantity: null, goldQty: undefined, silverQty: undefined,
    costBasis: sum('costBasis'), avgCost: null,
    currentUnitPrice: null, currentValueEur: sum('currentValueEur'),
    invested,
    lastValuationDate: lastDates.length ? lastDates[lastDates.length - 1] : null,
    totalDividend: sum('totalDividend'), totalFees: sum('totalFees'), totalIncome: sum('totalIncome'),
    totalCashback: sum('totalCashback'), netCashIn: sum('netCashIn'),
    realizedCostBasis: sum('realizedCostBasis'), realizedProceeds: sum('realizedProceeds'), realizedPnl: sum('realizedPnl'),
    pnl, pnlPct: invested > 0 ? (pnl / invested) * 100 : 0,
    bookedQuantity: null, chainCheckedAt: chainDates.length ? chainDates[chainDates.length - 1] : null,
    leaves,
  };
}

function buildPortfolioModel({ parties = [], transactions = [], summaries, flows, valueSeries, spots = {} } = {}) {
  parties = parties || [];
  transactions = transactions || [];
  summaries = summaries || parties.map(p => summarizeParty(p, transactions, spots));
  flows = flows || buildFlowSeries(transactions, parties);
  valueSeries = valueSeries || buildPartyTimeSeries(transactions, parties, spots);
  const todayIso = todayIsoLocal();

  // Crypto-posten: sub-holdings (finst-btc …) samenvoegen tot hun post (Finst). Totalen veranderen niet:
  // de post is exact de som van zijn sub-holdings.
  const allParties = parties;
  DT_PARTY_INDEX = Object.fromEntries(allParties.map(p => [p.id, p]));
  const postIdx = cryptoPostIndex(allParties);
  const leafSummaries = {};
  const rawById = {};
  summaries.forEach(s => { rawById[s.party.id] = s; });
  if (Object.keys(postIdx.postOfLeaf).length || Object.keys(postIdx.posts).length) {
    const vsByParty = { ...((valueSeries && valueSeries.byParty) || {}) };
    const flByParty = { ...((flows && flows.netByParty) || {}) };
    const sumArr = (arrs) => {
      const list = arrs.filter(Boolean);
      if (!list.length) return null;
      const out = new Array(Math.max(...list.map(a => a.length))).fill(0);
      for (const a of list) for (let i = 0; i < a.length; i++) out[i] += a[i] || 0;
      return out;
    };
    const postSummaries = {};
    for (const post of Object.values(postIdx.posts)) {
      const leaves = (postIdx.leavesByPost[post.id] || []).map(l => {
        const ls = rawById[l.id] || summarizeParty(l, transactions, spots);
        const view = { ...ls, party: { ...ls.party, name: `${post.name} · ${l.unitLabel || l.coin || l.name}` } };
        leafSummaries[l.id] = view;
        return view;
      });
      postSummaries[post.id] = aggregatePostSummary(post, leaves, rawById[post.id]);
      vsByParty[post.id] = sumArr(leaves.map(l => vsByParty[l.party.id])) || vsByParty[post.id];
      flByParty[post.id] = sumArr(leaves.map(l => flByParty[l.party.id])) || flByParty[post.id];
    }
    parties = allParties.filter(p => !postIdx.postOfLeaf[p.id]);
    summaries = parties.map(p => postSummaries[p.id] || rawById[p.id] || summarizeParty(p, transactions, spots));
    valueSeries = { ...(valueSeries || {}), byParty: vsByParty };
    flows = { ...(flows || {}), netByParty: flByParty };
  }
  const dispIdOf = id => postIdx.postOfLeaf[id] || id;

  const byId = {};
  Object.values(leafSummaries).forEach(s => { byId[s.party.id] = s; });
  summaries.forEach(s => { byId[s.party.id] = s; });
  const included = summaries.filter(s => dtIncluded(s.party));
  const chartIds = summaries.filter(s => dtInChart(s.party)).map(s => s.party.id);
  const empty = [], closed = [], open = [];
  for (const s of summaries) {
    if (!s.transactions.length && !(Math.abs(s.currentValueEur || 0) >= 0.5)) empty.push(s);
    else if (isClosedSummary(s)) closed.push(s);
    else open.push(s);
  }

  // Totals
  const sum = (arr, f) => arr.reduce((a, x) => a + (f(x) || 0), 0);
  const value = sum(included, s => s.currentValueEur);
  const invested = sum(included, s => s.invested);
  const pnl = sum(included, s => s.pnl);
  const includedIds = new Set(included.map(s => s.party.id));
  const cutoff = addDaysIso(todayIso, -365);
  let income12m = 0;
  for (const t of transactions) {
    if (!includedIds.has(dispIdOf(t.party)) || !(t.date > cutoff)) continue;
    if (t.type === 'rente') income12m += +t.amountEur || 0;
    else if (t.type === 'dividend') {
      const q = +t.quantity || 0, px = +t.unitPriceEur || 0;
      income12m += (q > 0 && px > 0) ? q * px : (+t.amountEur || 0);
    }
  }
  let fees = 0, feeTxCount = 0, firstTxDate = null;
  for (const t of transactions) {
    const f = +t.feeEur || 0;
    fees += f + (t.type === 'kosten' ? (+t.amountEur || 0) : 0);
    if (f > 0 || t.type === 'kosten') feeTxCount++;
    if (t.date && (!firstTxDate || t.date < firstTxDate)) firstTxDate = t.date;
  }
  const totals = {
    value, invested, pnl,
    netInvested: sum(included, s => s.costBasis - s.realizedPnl),
    pnlPct: invested > 0 ? pnl / invested * 100 : null,
    realized: sum(included, s => s.realizedPnl),
    income: sum(included, s => s.totalIncome),
    income12m, fees, feeTxCount,
    txCount: transactions.length, firstTxDate,
    openCount: open.length, closedCount: closed.length,
  };

  // Classes (included, slot order)
  const openIds = new Set(open.map(s => s.party.id));
  const classes = [];
  for (const c of ASSET_CLASSES) {
    const ss = included.filter(s => assetClassOf(s.party) === c.key);
    if (!ss.length) continue;
    const v = sum(ss, s => s.currentValueEur);
    if (!(v > 0.5 || ss.some(s => openIds.has(s.party.id)))) continue;
    classes.push({ key: c.key, label: c.label, color: c.color, value: v, share: value > 0 ? v / value * 100 : 0, pnl: sum(ss, s => s.pnl), summaries: ss });
  }

  // Series
  const dates = (valueSeries && valueSeries.dates && valueSeries.dates.length) ? valueSeries.dates : (flows.dates || []);
  const n = dates.length;
  const byParty = {}, netByParty = {};
  const sameAxis = flows.dates && flows.dates.length === n && n > 0 && flows.dates[0] === dates[0] && flows.dates[n - 1] === dates[n - 1];
  let flowIdx = null;
  if (!sameAxis && flows.dates) flowIdx = new Map(flows.dates.map((x, i) => [x, i]));
  for (const p of parties) {
    const vs = valueSeries && valueSeries.byParty && valueSeries.byParty[p.id];
    byParty[p.id] = vs && vs.length === n ? vs.slice() : new Array(n).fill(0);
    const fs = flows.netByParty && flows.netByParty[p.id];
    if (!fs) netByParty[p.id] = new Array(n).fill(0);
    else if (sameAxis) netByParty[p.id] = fs.slice();
    else {
      const arr = new Array(n);
      let last = 0;
      for (let i = 0; i < n; i++) {
        const j = flowIdx.get(dates[i]);
        if (j != null) last = fs[j];
        arr[i] = last;
      }
      netByParty[p.id] = arr;
    }
  }
  if (n > 0) {
    const L = n - 1;
    for (const p of parties) {
      const s = byId[p.id];
      if (!s) continue;
      byParty[p.id][L] = s.currentValueEur || 0;
      netByParty[p.id][L] = (s.costBasis || 0) - (s.realizedPnl || 0);
    }
  }
  const valueArr = new Array(n).fill(0), netArr = new Array(n).fill(0);
  for (const id of chartIds) {
    const v = byParty[id], nn = netByParty[id];
    for (let i = 0; i < n; i++) { valueArr[i] += v[i] || 0; netArr[i] += nn[i] || 0; }
  }
  const flow = netArr.map((x, i) => (i === 0 ? x : x - netArr[i - 1]));
  const series = { dates, value: valueArr, net: netArr, flow, byParty, netByParty, ids: chartIds.slice() };

  const partyIds = new Set(allParties.map(p => p.id));
  const orphans = transactions.filter(t => !partyIds.has(t.party));

  const dateIdx = new Map(dates.map((x, i) => [x, i]));
  const chartSet = new Set(chartIds);
  const markers = [];
  for (const t of [...transactions].sort((a, b) => a.date.localeCompare(b.date))) {
    const dispId = dispIdOf(t.party);
    if (!chartSet.has(dispId) || t.type === 'overboeking') continue;
    const s = byId[dispId];
    const index = dateIdx.get(t.date);
    if (index == null) continue;
    if (t.type === 'waardering' && (s.party.unit === 'bundle' || s.party.unit === 'eur')) {
      const v = t.valueEur != null && t.valueEur !== '' ? +t.valueEur : (t.unitPriceEur != null ? +t.unitPriceEur : null);
      markers.push({ index, date: t.date, kind: 'waardering', partyId: dispId, label: `Waardering ${s.party.name}${v != null ? ' · ' + fmtMoney(v) : ''}` });
    } else if (t.type === 'opname') {
      markers.push({ index, date: t.date, kind: 'opname', partyId: dispId, label: `Opname ${s.party.name} · ${fmtMoney(txGross(t))}` });
    }
  }

  return { parties, summaries, byId, included, chartIds, open, closed, empty, totals, classes, series, orphans, markers,
    allParties, postOfLeaf: postIdx.postOfLeaf, leavesByPost: postIdx.leavesByPost, dispIdOf };
}

function seriesExcluding(series, partyIds) {
  const ids = (partyIds || []).filter(id => (series.ids ? series.ids.includes(id) : true) && series.byParty && series.byParty[id]);
  const value = series.value.slice(), net = series.net.slice();
  for (const id of ids) {
    const v = series.byParty[id], nn = (series.netByParty && series.netByParty[id]) || [];
    for (let i = 0; i < value.length; i++) { value[i] -= v[i] || 0; net[i] -= nn[i] || 0; }
  }
  const flow = net.map((x, i) => (i === 0 ? x : x - net[i - 1]));
  return { dates: series.dates, value, net, flow };
}

function holdingsAt(model, index) {
  const out = {};
  const { byParty = {}, netByParty = {} } = (model && model.series) || {};
  for (const id of Object.keys(byParty)) {
    const arr = byParty[id];
    if (!arr || index == null || index < 0 || index >= arr.length) continue;
    const value = arr[index] || 0;
    const net = (netByParty[id] && netByParty[id][index]) || 0;
    out[id] = { value, net, pnl: value - net };
  }
  return out;
}

// ----- Periods and returns -----
const PERIODS = [
  { key: '1M',  label: '1M',    context: 'afgelopen maand' },
  { key: '3M',  label: '3M',    context: 'afgelopen 3 maanden' },
  { key: 'YTD', label: 'YTD',   context: 'dit jaar' },
  { key: '1J',  label: '1J',    context: 'afgelopen jaar' },
  { key: 'ALL', label: 'Alles', context: 'sinds {datum}' },
];

function periodRange(dates, key, todayIso) {
  const len = (dates && dates.length) || 0;
  if (!len) return { i0: 0, i1: -1, all: key === 'ALL', enabled: false };
  const i1 = len - 1;
  if (key === 'ALL') return { i0: 0, i1, all: true, enabled: len >= 2 };
  const t = todayIso || dates[i1];
  const start = key === '1M' ? addDaysIso(t, -30)
    : key === '3M' ? addDaysIso(t, -91)
    : key === 'YTD' ? `${t.slice(0, 4)}-01-01`
    : addDaysIso(t, -365);
  let i0 = dates.findIndex(x => x >= start);
  if (i0 < 0) i0 = i1;
  return { i0, i1, all: false, enabled: i1 - i0 >= 1 };
}

function periodStats({ dates, value, net }, i0, i1, all = false) {
  const V0 = all ? 0 : value[i0], N0 = all ? 0 : net[i0];
  const V1 = value[i1], N1 = net[i1];
  const gain = (V1 - N1) - (V0 - N0);
  const t0 = all ? addDaysIso(dates[0], -1) : dates[i0];
  const D = Math.max(1, daysBetween(t0, dates[i1]));
  let S = 0;
  for (let i = all ? i0 : i0 + 1; i <= i1; i++) {
    const F = net[i] - (i > 0 ? net[i - 1] : 0);
    if (F) S += ((D - daysBetween(t0, dates[i])) / D) * F;
  }
  const denom = V0 + S;
  const pct = denom > 0 ? gain / denom * 100 : null;
  let prod = 1, twrGaps = 0;
  for (let i = Math.max(i0 + 1, 1); i <= i1; i++) {
    const F = net[i] - net[i - 1];
    const den = value[i - 1] + F;
    if (den < 1) continue;
    const f = value[i] / den;
    if (f < 0.5 || f > 2) { twrGaps++; continue; }
    prod *= f;
  }
  const twr = twrGaps > 0 ? null : (prod - 1) * 100;
  const annualized = (pct != null && D >= 365) ? (Math.pow(1 + pct / 100, 365 / D) - 1) * 100 : null;
  return { gain, pct, twr, twrGaps, annualized, startValue: V0, endValue: V1, startNet: N0, endNet: N1, netFlow: N1 - N0, days: D };
}

// Compacte momentopname voor de iOS-widget: exact dezelfde getallen als de Overzicht-hero
// in rust (geen cursor), incl. Excl. PE- en periodekeuze uit prefs. Zie useOvPerformance.
function buildWidgetSnapshot(model, prefs = {}) {
  if (!model || !model.totals || !model.series) return null;
  const r2 = x => (x == null || !Number.isFinite(x) ? null : Math.round(x * 100) / 100);
  const peIds = (model.chartIds || []).filter(id => model.byId && model.byId[id] && assetClassOf(model.byId[id].party) === 'pe');
  const exclPE = !!prefs.exclPE && peIds.length > 0;
  const series = exclPE ? seriesExcluding(model.series, peIds) : model.series;
  const dates = series.dates || [];
  let periodKey = prefs.period || '1J';
  let r = periodRange(dates, periodKey);
  if (!r.enabled) {
    for (const k of ['ALL', '1J', 'YTD', '3M', '1M']) {
      const rr = periodRange(dates, k);
      if (rr.enabled) { r = rr; periodKey = k; break; }
    }
  }
  const peInc = exclPE ? (model.included || []).filter(s => assetClassOf(s.party) === 'pe') : [];
  const sumOf = f => peInc.reduce((a, s) => a + (f(s) || 0), 0);
  const t = model.totals;
  const value = t.value - sumOf(s => s.currentValueEur);
  const net = t.netInvested - sumOf(s => s.costBasis - s.realizedPnl);
  const pnl = t.pnl - sumOf(s => s.pnl);
  const invested = t.invested - sumOf(s => s.invested);
  const pnlPct = invested > 0 ? pnl / invested * 100 : null;
  const stats = r.enabled ? periodStats(series, r.i0, r.i1, r.all) : null;
  // Verandering vandaag: laatste punt vs. laatste punt vóór vandaag, excl. stortingen.
  const last = dates.length - 1;
  let today = null;
  if (last >= 1) {
    const iso = todayIsoLocal();
    let p = last;
    while (p > 0 && dates[p] >= iso) p--;
    if (p < last && dates[p] < iso) {
      const s = periodStats(series, p, last, false);
      today = { gain: r2(s.gain), pct: r2(s.pct) };
    } else today = { gain: 0, pct: 0 };
  }
  const n0 = Math.max(0, dates.length - 30);
  return {
    v: 1,
    asOf: new Date().toISOString(),
    total: r2(value),
    netInvested: r2(net),
    totalGain: r2(value - net),
    totalGainPct: r2(pnlPct),
    todayGain: today ? today.gain : null,
    todayPct: today ? today.pct : null,
    period: periodKey,
    periodGain: stats ? r2(stats.gain) : null,
    periodPct: r2(r.all ? pnlPct : (stats ? stats.pct : null)),
    exclPE,
    series: { dates: dates.slice(n0), values: series.value.slice(n0).map(x => Math.round(x)) },
  };
}

function cumulativeTwr({ dates, value, net }, i0, i1) {
  const out = [];
  if (i1 < i0) return out;
  out.push(0);
  let prod = 1;
  for (let i = i0 + 1; i <= i1; i++) {
    const F = net[i] - net[i - 1];
    const den = value[i - 1] + F;
    if (den >= 1) {
      const f = value[i] / den;
      if (f >= 0.5 && f <= 2) prod *= f;
    }
    out.push((prod - 1) * 100);
  }
  return out;
}

function xirr({ dates, net, value, flow }) {
  if (!dates || dates.length < 2) return null;
  const last = dates[dates.length - 1];
  if (daysBetween(dates[0], last) < 365) return null;
  const fl = flow || net.map((x, i) => (i === 0 ? x : x - net[i - 1]));
  const cfs = [];
  for (let i = 0; i < dates.length; i++) if (Math.abs(fl[i]) > 1e-9) cfs.push([daysBetween(dates[0], dates[i]), -fl[i]]);
  cfs.push([daysBetween(dates[0], last), value[value.length - 1]]);
  const npv = r => cfs.reduce((a, [dd, c]) => a + c / Math.pow(1 + r, dd / 365), 0);
  let lo = -0.99, hi = 10, flo = npv(lo), fhi = npv(hi);
  if (!Number.isFinite(flo) || !Number.isFinite(fhi) || flo * fhi > 0) return null;
  let mid = 0;
  for (let k = 0; k < 200; k++) {
    mid = (lo + hi) / 2;
    const fm = npv(mid);
    if (Math.abs(fm) < 1e-7) break;
    if (flo * fm < 0) { hi = mid; } else { lo = mid; flo = fm; }
  }
  return mid * 100;
}

function monthlyNetFlows({ dates, flow }, months = 12, todayIso = todayIsoLocal()) {
  const endKey = todayIso.slice(0, 7);
  let startKey;
  if (months > 0) {
    let y = +endKey.slice(0, 4), m = +endKey.slice(5, 7) - (months - 1);
    while (m < 1) { m += 12; y--; }
    startKey = `${y}-${String(m).padStart(2, '0')}`;
  } else {
    startKey = dates && dates.length ? dates[0].slice(0, 7) : endKey;
  }
  const keys = [];
  for (let y = +startKey.slice(0, 4), m = +startKey.slice(5, 7); ; ) {
    const k = `${y}-${String(m).padStart(2, '0')}`;
    keys.push(k);
    if (k >= endKey) break;
    m++; if (m > 12) { m = 1; y++; }
  }
  const map = new Map(keys.map(k => [k, { month: k, net: 0, inflow: 0, outflow: 0 }]));
  (dates || []).forEach((dd, i) => {
    const row = map.get(dd.slice(0, 7));
    const f = flow ? flow[i] : 0;
    if (!row || !f) return;
    if (f > 0) row.inflow += f; else row.outflow += -f;
  });
  for (const row of map.values()) row.net = row.inflow - row.outflow;
  return [...map.values()];
}

function downsample(arr, max) {
  const n = (arr && arr.length) || 0;
  if (n <= max) return n ? arr.slice() : [];
  const step = Math.ceil(n / max);
  const out = [];
  for (let i = 0; i < n; i += step) out.push(arr[i]);
  if ((n - 1) % step !== 0) out.push(arr[n - 1]);
  return out;
}

// ----- Drift -----
function driftRows(summaries, targetAllocation, tolerancePt = ATTENTION_THRESHOLDS.driftPt) {
  const grouping = (targetAllocation && targetAllocation.grouping) || 'category';
  const map = new Map();
  for (const s of (summaries || []).filter(x => dtIncluded(x.party))) {
    const key = grouping === 'party' ? s.party.id : (s.party.category || 'Overig');
    const label = grouping === 'party' ? s.party.name : (s.party.category || 'Overig');
    const color = grouping === 'party' ? partyColorOf(s.party) : ASSET_CLASS_BY_KEY[assetClassOf({ category: key })].color;
    const g = map.get(key) || { key, label, color, value: 0 };
    g.value += Math.max(0, s.currentValueEur || 0);
    map.set(key, g);
  }
  const groups = [...map.values()].sort((a, b) => b.value - a.value);
  const targets = (targetAllocation && targetAllocation[grouping]) || {};
  const hasTargets = Object.values(targets).some(v => +v > 0);
  const total = groups.reduce((a, g) => a + g.value, 0);
  const rows = groups.map(g => {
    const current = total > 0 ? g.value / total * 100 : 0;
    const target = hasTargets ? (+targets[g.key] || 0) : null;
    const drift = hasTargets ? current - target : null;
    return { ...g, current, target, drift, outside: hasTargets && Math.abs(drift) > tolerancePt };
  });
  return { grouping, hasTargets, rows };
}

// ----- Prices -----
const PRICE_ASSETS = [
  { key: 'btc',     symbol: 'BTC',   label: 'Bitcoin',  spotKey: 'btcSpotEur',            histKey: 'btcHistory',        unit: '',    decimals: 0 },
  { key: 'eth',     symbol: 'ETH',   label: 'Ethereum', spotKey: 'ethSpotEur',            histKey: 'ethHistory',        unit: '',    decimals: 0 },
  { key: 'paxg',    symbol: 'PAXG',  label: 'Pax Gold', spotKey: 'paxgSpotEur',           histKey: 'paxgHistory',       unit: '',    decimals: 0 },
  { key: 'gold',    symbol: 'XAU',   label: 'Goud',     spotKey: 'goldSpotEurPerGram',    histKey: 'goldHistory',       unit: '/g',  decimals: 2 },
  { key: 'silver',  symbol: 'XAG',   label: 'Zilver',   spotKey: 'silverSpotEurPerOunce', histKey: 'silverHistory',     unit: '/oz', decimals: 2 },
  { key: 'meesman', symbol: 'MWRLD', label: 'Meesman',  spotKey: 'meesmanNavEur',         histKey: 'meesmanNavHistory', unit: '',    decimals: 4 },
];

function dtHistVal(h) { return h == null ? null : +(h.nav ?? h.value ?? h.price ?? h.close); }

function priceChange(history, days = 30) {
  if (!Array.isArray(history) || history.length < 2) return null;
  const last = history[history.length - 1];
  const target = addDaysIso(last.date, -days);
  let base = null;
  for (let i = history.length - 2; i >= 0; i--) if (history[i].date <= target) { base = history[i]; break; }
  if (!base) return null;
  const a = dtHistVal(base), b = dtHistVal(last);
  if (!(a > 0) || !Number.isFinite(b)) return null;
  return (b / a - 1) * 100;
}

// ----- Overzicht modules -----
const OVERVIEW_MODULES = [
  { id: 'party_grid',    label: 'Posities' },
  { id: 'allocation',    label: 'Verdeling' },
  { id: 'attention',     label: 'Aandacht' },
  { id: 'monthly_inleg', label: 'Netto inleg per maand' },
  { id: 'returns',       label: 'Resultaat per positie' },
  { id: 'activity_feed', label: 'Recente activiteit' },
  { id: 'pension_card',  label: 'Pensioen-kaart (mobiel)' },
];

function mergeWidgets(stored) {
  const list = (Array.isArray(stored) ? stored : DEFAULT_WIDGETS).map(w => ({ ...w }));
  const have = new Set(list.map(w => w.id));
  for (const w of DEFAULT_WIDGETS) if (!have.has(w.id)) list.push({ ...w });
  return list;
}

function isModuleEnabled(widgets, id) {
  const w = mergeWidgets(widgets).find(x => x.id === id);
  return !w || w.enabled !== false;
}

// ----- Pension -----
const PENSION_DEFAULTS = { age: 30, retireAge: 65, monthly: 2500, wdRate: 4, retRate: 7, inflation: 2.5 };
const PENSION_LIMITS = {
  age:       { min: 18,   max: 70,    step: 1   },
  retireAge: { min: null, max: 85,    step: 1   },
  monthly:   { min: 500,  max: 10000, step: 100 },
  wdRate:    { min: 2,    max: 8,     step: 0.5 },
  retRate:   { min: 1,    max: 15,    step: 0.5 },
  inflation: { min: 0,    max: 6,     step: 0.1 },
};

function computePension(inputs, currentValue) {
  const inp = { ...PENSION_DEFAULTS, ...(inputs || {}) };
  const age = +inp.age, retireAge = +inp.retireAge, monthly = +inp.monthly;
  const wdRate = +inp.wdRate, retRate = +inp.retRate, inflation = +inp.inflation;
  const cv = +currentValue || 0;
  const years = Math.max(0, retireAge - age);
  const realRate = ((1 + retRate / 100) / (1 + inflation / 100) - 1) * 100;
  const neededCorpus = wdRate > 0 ? monthly * 12 / (wdRate / 100) : 0;
  const neededCorpusReal = neededCorpus * Math.pow(1 + inflation / 100, years);
  const fvCurrent = cv * Math.pow(1 + retRate / 100, years);
  const r = retRate / 100 / 12, n = years * 12, gap = neededCorpusReal - fvCurrent;
  const monthlySavings = (n > 0 && r > 0 && gap > 0) ? gap * r / (Math.pow(1 + r, n) - 1) : 0;
  const onTrack = fvCurrent >= neededCorpusReal;
  const progress = neededCorpusReal > 0 ? Math.min(100, fvCurrent / neededCorpusReal * 100) : 0;
  const withdrawNow = cv * (wdRate / 100) / 12;
  const valueAt = m => cv * Math.pow(1 + retRate / 100, m / 12) + (r > 0 ? monthlySavings * (Math.pow(1 + r, m) - 1) / r : monthlySavings * m);
  const targets = [0.25, 0.5, 0.75, 1].map(f => neededCorpusReal * f);
  const achieved = [null, null, null, null];
  for (let m = 0; m <= n; m++) {
    const v = valueAt(m);
    targets.forEach((t, i) => { if (achieved[i] == null && v >= t * (1 - 1e-9)) achieved[i] = age + m / 12; });
  }
  const milestones = [25, 50, 75, 100].map((pct, i) => ({ pct, value: targets[i], age: achieved[i] }));
  const maxAge = Math.max(85, retireAge + 10);
  const ages = [];
  for (let a = age; a <= maxAge; a++) ages.push(a);
  const scenario = rate => {
    const out = [cv];
    let v = cv;
    const totalMonths = (maxAge - age) * 12;
    for (let m = 1; m <= totalMonths; m++) {
      const ageAtStart = age + (m - 1) / 12;
      if (ageAtStart < retireAge) v = v * (1 + rate / 1200) + monthlySavings;
      else v = Math.max(0, v * (1 + rate / 1200) - monthly * Math.pow(1 + inflation / 100, m / 12));
      if (m % 12 === 0) out.push(v);
    }
    return out;
  };
  const low = scenario(Math.max(0, retRate - 3)), mid = scenario(retRate), high = scenario(retRate + 2);
  return { years, realRate, neededCorpus, neededCorpusReal, fvCurrent, monthlySavings, onTrack, progress, withdrawNow, milestones, ages, low, mid, high, maxAge };
}


Object.assign(window, {
  STORAGE_KEY, todayIsoLocal, addDaysIso, daysBetween, txCashAmount,
  bundleSnapshotAtDate, bundleValuations, bundleWeeklyInterpolatedValue, weeklyInterpolatedValue,
  unitValuationPoints, totalValuationPoints,
  UI_PREFS_KEY, DEFAULT_UI_PREFS, loadUiPrefs, saveUiPrefs, themeFromLegacy, MQ_MOBILE, MONTHS_NL, MONTHS_NL_LONG,
  fmtMoney, fmtPt, fmtCompact, fmtDateLong, fmtDateShort, fmtAxisMonth, fmtMonthName, fmtTime, fmtRelDay, parseNlNumber,
  ASSET_CLASSES, ASSET_CLASS_BY_KEY, assetClassOf, partyColorOf, monogramOf, PARTY_LOGOS, partyLogo,
  PARTY_UNIT_OPTIONS, CATEGORY_OPTIONS, CUSTOM_CATEGORY_VALUE, COLOR_PRESETS,
  TX_TYPE_META, allowedTxTypes, txUnitLabel, txGross, txNetTotal, txAmountInfo, txDetailsText,
  holdingSubline, holdingQtyText, holdingPriceText, goalProgress, cagrOf, isClosedSummary,
  buildFlowSeries, buildPortfolioModel, seriesExcluding, holdingsAt,
  PERIODS, periodRange, periodStats, buildWidgetSnapshot, cumulativeTwr, xirr, monthlyNetFlows, downsample,
  driftRows, PRICE_ASSETS, priceChange, OVERVIEW_MODULES, mergeWidgets, isModuleEnabled,
  PENSION_DEFAULTS, PENSION_LIMITS, computePension, ATTENTION_THRESHOLDS,
  PARTIES, TX_TYPES, TX_LABELS,
  CRYPTO_COINS, CRYPTO_COIN_BY_KEY, isPostParty, validateChainAddress, migrateCryptoPosts, cryptoPostIndex, cryptoLeafFor, txTouchesParty,
  transferOutQty, transferCostMap, aggregatePostSummary, txTransferText, dtPostNameOf,
  DEFAULT_MEESMAN_NAV_EUR, MEESMAN_NAV_SEED_HISTORY, mergePriceHistory, normalizeMeesmanHistory,
  WIDGET_REGISTRY, DEFAULT_WIDGETS,
  OZ_TO_GRAM, silverToOz, goldToGram,
  loadState, saveState, makeId,
  summarizeParty, buildValueTimeSeries, buildPartyTimeSeries, buildMonthlyFlows,
  calcYTDReturn, fmtEur, fmtPct, fmtQty, fmtDate, fmtMonth,
  spotEurForParty, findNavForDate,
});
