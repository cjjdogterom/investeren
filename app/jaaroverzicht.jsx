// Plan › Jaaroverzicht: vermogensoverzicht box 3 per belastingjaar (peildatum 1 januari, werkelijk rendement
// voor de tegenbewijsregeling) met keuze welke bezittingen meetellen en export naar PDF via de printfunctie.
// Bedragen komen uit de waardereeks van de app (zelfde bron als de grafiek); per bezitting kan elk bedrag
// handmatig worden overschreven met de cijfers uit het jaaroverzicht van de aanbieder.

injectStyles('jaaroverzicht', `
.jr-view { display: grid; gap: 16px; min-width: 0; }
.jr-layout { display: grid; grid-template-columns: minmax(300px, 380px) minmax(0, 1fr); gap: 16px; align-items: start; }
.jr-side { display: grid; gap: 16px; position: sticky; top: calc(var(--topbar-h, 56px) + 16px); max-height: calc(100vh - var(--topbar-h, 56px) - 32px); overflow: auto; overscroll-behavior: contain; }
.jr-form { display: grid; gap: 14px; }
.jr-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.jr-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.jr-note { font-size: 12.5px; color: var(--fg-muted); line-height: 1.5; }
.jr-assets { display: grid; gap: 2px; }
.jr-asset { border-top: 1px solid var(--border); padding: 10px 0; display: grid; gap: 8px; }
.jr-asset:first-child { border-top: 0; padding-top: 0; }
.jr-asset__head { display: flex; align-items: center; gap: 10px; min-width: 0; }
.jr-asset__check { width: 18px; height: 18px; accent-color: var(--ink); flex-shrink: 0; margin: 0; }
.jr-asset__name { flex: 1; min-width: 0; font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.jr-asset__val { font-size: 13px; color: var(--fg-muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.jr-asset.is-off .jr-asset__name, .jr-asset.is-off .jr-asset__val { color: var(--fg-subtle); }
.jr-asset__body { display: grid; gap: 8px; padding-left: 28px; }
.jr-asset__body .input { height: 34px; font-size: 13px; }
.jr-asset__warn { font-size: 12px; color: var(--warn, #b45309); line-height: 1.45; }
.jr-ovr { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.jr-ovr label { display: grid; gap: 3px; font-size: 11.5px; color: var(--fg-muted); }
.jr-more { border: 0; background: none; padding: 0; color: var(--fg-muted); font: inherit; font-size: 12.5px; cursor: pointer; text-align: left; text-decoration: underline; text-underline-offset: 2px; }
.jr-preview { min-width: 0; overflow-x: auto; padding-bottom: 8px; }

/* ---- Document (A4) ---- */
.jr-paper { --ink: #14171f; --ink2: #3c4350; --mut: #6b7280; --rule: #e4e7ec; --rule2: #c9ced6; --acc: #1f3a5f;
  width: 210mm; min-height: 297mm; margin: 0 auto; padding: 18mm 17mm 18mm; background: #fff; color: var(--ink); box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 8px 30px rgba(0,0,0,.10); border-radius: 4px;
  font: 400 9.2pt/1.5 -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Helvetica, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.jr-paper * { box-sizing: border-box; }
.jr-paper p { margin: 0; }
.jr-top { display: flex; justify-content: space-between; font-size: 7pt; letter-spacing: .12em; text-transform: uppercase; color: var(--mut); font-weight: 600; }
.jr-title { margin: 14px 0 0; font-size: 23pt; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
.jr-title span { color: var(--mut); font-weight: 400; }
.jr-lede { margin-top: 4px !important; color: var(--ink2); font-size: 10pt; }
.jr-meta { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 16px 0 0; border-top: 1.5px solid var(--ink); border-bottom: 1px solid var(--rule2); }
.jr-meta > div { padding: 7px 10px 8px 0; }
.jr-meta > div + div { padding-left: 10px; border-left: 1px solid var(--rule); }
.jr-meta dt, .jr-lbl { font-size: 6.8pt; letter-spacing: .08em; text-transform: uppercase; color: var(--mut); font-weight: 600; }
.jr-meta dd { margin: 2px 0 0; font-weight: 600; font-size: 9pt; }
.jr-state { color: #8a5300; } .jr-state--ok { color: #1d6b3c; }
.jr-sum { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 18px; }
.jr-sum > div { padding: 2px 12px 2px 0; }
.jr-sum > div + div { padding-left: 12px; border-left: 1px solid var(--rule); }
.jr-sum__v { font-size: 14.5pt; font-weight: 700; letter-spacing: -0.01em; margin-top: 3px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.jr-sum__s { font-size: 7.3pt; color: var(--mut); margin-top: 1px; }

.jr-part { margin-top: 30px; padding-top: 12px; border-top: 1.5px solid var(--ink); display: grid; grid-template-columns: 62px minmax(0, 1fr); gap: 0 14px; align-items: baseline; }
.jr-part__no { font-size: 7.2pt; letter-spacing: .12em; text-transform: uppercase; color: var(--acc); font-weight: 700; }
.jr-part h2 { margin: 0; font-size: 15pt; font-weight: 700; letter-spacing: -0.01em; }
.jr-part p { grid-column: 2; color: var(--ink2); margin-top: 3px; font-size: 8.8pt; }
.jr-sec { margin-top: 20px; }
.jr-sec h3 { margin: 0 0 7px; font-size: 10pt; font-weight: 700; display: flex; gap: 10px; align-items: baseline; break-after: avoid; }
.jr-sec h3 .jr-num { color: var(--acc); font-weight: 600; font-variant-numeric: tabular-nums; min-width: 22px; }
.jr-intro { color: var(--ink2); font-size: 8.5pt; margin: -2px 0 8px 32px !important; }

/* Bezittingentabel */
.jr-twrap { overflow-x: auto; }
.jr-t { width: 100%; border-collapse: collapse; font-size: 8.6pt; font-variant-numeric: tabular-nums; }
.jr-t th { text-align: left; font-weight: 600; color: var(--mut); font-size: 6.8pt; text-transform: uppercase; letter-spacing: .07em; padding: 0 6px 5px; border-bottom: 1px solid var(--ink); vertical-align: bottom; }
.jr-t td { padding: 5px 6px; border-bottom: 1px solid var(--rule); vertical-align: middle; }
.jr-t th:first-child, .jr-t td:first-child { padding-left: 0; }
.jr-t th:last-child, .jr-t td:last-child { padding-right: 0; }
.jr-t .n { text-align: right; white-space: nowrap; }
.jr-t tr { break-inside: avoid; }
.jr-t .jr-grp td { padding-top: 11px; border-bottom: 1px solid var(--rule2); font-weight: 600; font-size: 8pt; color: var(--ink2); }
.jr-t .jr-grp td:first-child { font-size: 6.9pt; letter-spacing: .08em; text-transform: uppercase; color: var(--acc); font-weight: 700; }
.jr-t .jr-item td:first-child { padding-left: 14px; }
.jr-t tfoot td { font-weight: 700; border-top: 1.5px solid var(--ink); border-bottom: 3px double var(--ink); padding-top: 6px; padding-bottom: 6px; }
.jr-asset-cell { display: flex; align-items: center; gap: 9px; min-width: 0; }
.jr-asset-cell b { font-weight: 600; display: block; }
.jr-asset-cell small { display: block; font-size: 7.2pt; color: var(--mut); line-height: 1.3; }
.jr-logo { width: 20px; height: 20px; border-radius: 5px; flex-shrink: 0; overflow: hidden; background: #fff; box-shadow: inset 0 0 0 1px rgba(15,23,42,.12); display: inline-grid; place-items: center; }
.jr-logo img { width: 100%; height: 100%; object-fit: contain; padding: 2px; display: block; }
.jr-logo--tile img { padding: 0; object-fit: cover; }
.jr-logo--mono { font-size: 6.6pt; font-weight: 700; letter-spacing: -0.02em; color: var(--ink2); background: #eef0f3; }
.jr-logo--sm { width: 15px; height: 15px; border-radius: 4px; }
.jr-logo--sm.jr-logo--mono { font-size: 5.4pt; }

/* Berekeningen: ingesprongen, binnenkolom (a) voor posten en buitenkolom (b) voor (sub)totalen */
.jr-led { width: 100%; border-collapse: collapse; font-size: 9pt; font-variant-numeric: tabular-nums; }
.jr-led td { padding: 3.2px 0; vertical-align: middle; }
.jr-led td.n { text-align: right; white-space: nowrap; width: 19%; padding-left: 12px; }
.jr-led td.a { color: var(--ink2); }
.jr-led td.rule { border-top: 1px solid var(--ink); }
.jr-led tr.head td { padding-top: 10px; font-weight: 700; }
.jr-led tr.head:first-child td { padding-top: 0; }
.jr-led tr.sub td:first-child { color: var(--ink2); }
.jr-led tr.sum td { font-weight: 600; }
.jr-led tr.total td { font-weight: 700; padding-top: 5px; padding-bottom: 5px; }
.jr-led tr.total td.b { border-top: 1.5px solid var(--ink); border-bottom: 3px double var(--ink); }
.jr-led tr.muted td { color: var(--mut); font-size: 8.3pt; }
.jr-l { display: flex; align-items: center; gap: 7px; }
.jr-led small { color: var(--mut); font-size: 7.5pt; margin-left: 6px; font-weight: 400; }
.jr-block { margin-left: 32px; }

.jr-cmp { display: grid; grid-template-columns: 1fr 1fr; margin: 4px 0 0 32px; border: 1px solid var(--rule2); border-radius: 6px; overflow: hidden; break-inside: avoid; }
.jr-cmp > div { padding: 10px 12px; }
.jr-cmp > div + div { border-left: 1px solid var(--rule2); }
.jr-cmp .is-best { background: #eef6f1; }
.jr-cmp__v { font-size: 14pt; font-weight: 700; margin-top: 2px; font-variant-numeric: tabular-nums; }
.jr-cmp__s { font-size: 7.4pt; color: var(--mut); }
.jr-concl { margin: 8px 0 0 32px !important; font-size: 8.6pt; color: var(--ink2); padding-left: 10px; border-left: 2px solid var(--acc); break-inside: avoid; }

.jr-neg { color: #b42318; }
.jr-pos { color: #1d6b3c; }
.jr-muted { color: var(--mut); }
.jr-fine { font-size: 7.5pt; color: var(--mut); line-height: 1.55; }
.jr-notes { margin: 0 0 0 32px; padding-left: 14px; }
.jr-notes li { margin-bottom: 2px; }
.jr-warns { margin: 10px 0 0 32px; padding: 7px 10px 7px 24px; background: #fff8eb; border-left: 2px solid #d99a2b; font-size: 7.8pt; color: #7a4a00; break-inside: avoid; }
.jr-sign { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 34px; font-size: 7.6pt; color: var(--mut); break-inside: avoid; }
.jr-sign div { border-top: 1px solid var(--ink2); padding-top: 4px; }
.jr-foot { margin-top: 18px; padding-top: 6px; border-top: 1px solid var(--rule); display: flex; justify-content: space-between; font-size: 7pt; color: var(--mut); }

.jr-printroot { display: none; }
@media (max-width: 1100px) {
  .jr-layout { grid-template-columns: minmax(0, 1fr); }
  .jr-side { position: static; max-height: none; overflow: visible; }
}
@media screen and (max-width: 860px) {
  .jr-paper { width: auto; min-height: 0; padding: 22px 16px; font-size: 9pt; }
  .jr-meta, .jr-sum { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .jr-meta > div:nth-child(3), .jr-sum > div:nth-child(3) { border-left: 0; padding-left: 0; }
  .jr-sum > div { padding-bottom: 8px; }
  .jr-part { grid-template-columns: minmax(0, 1fr); }
  .jr-part p { grid-column: 1; }
  .jr-block, .jr-cmp, .jr-concl, .jr-intro, .jr-notes, .jr-warns { margin-left: 0 !important; }
  .jr-cmp { grid-template-columns: minmax(0, 1fr); }
  .jr-cmp > div + div { border-left: 0; border-top: 1px solid var(--rule2); }
  .jr-led td.n { width: auto; }
}
@media print {
  @page { size: A4; margin: 15mm 15mm 17mm;
    @bottom-left { content: "Vermogensoverzicht — vertrouwelijk"; font: 7pt -apple-system, Helvetica, Arial, sans-serif; color: #8a909c; }
    @bottom-right { content: "Pagina " counter(page) " van " counter(pages); font: 7pt -apple-system, Helvetica, Arial, sans-serif; color: #8a909c; } }
  html, body { background: #fff !important; }
  body > *:not(.jr-printroot) { display: none !important; }
  .jr-printroot { display: block !important; }
  .jr-printroot .jr-paper { width: auto; min-height: 0; padding: 0; margin: 0; box-shadow: none; border-radius: 0; }
  .jr-twrap { overflow: visible; }
  .jr-part--break { break-before: page; margin-top: 0; }
  .jr-part { break-after: avoid; }
  .jr-meta, .jr-sum, .jr-led, .jr-cmp { break-inside: avoid; }
  .jr-foot { display: none; }
}
`);

const JR_STORE = 'investeringen-jaaroverzicht-v1';

// Rubrieken zoals in de aangifte ('Bankrekeningen en andere bezittingen').
const JR_CATS = [
  { key: 'bank',   label: 'Bankrekeningen',     sub: 'Bank- en spaartegoeden, contant geld', rate: 'bank' },
  { key: 'beleg',  label: 'Beleggingen',        sub: "Aandelen, obligaties, fondsen en ETF's", rate: 'overig' },
  { key: 'crypto', label: 'Cryptobezittingen',  sub: 'Cryptovaluta en tokens', rate: 'overig' },
  { key: 'overig', label: 'Andere bezittingen', sub: 'Edelmetaal, participaties, uitgeleend geld e.d.', rate: 'overig' },
];
const JR_CAT_BY_KEY = Object.fromEntries(JR_CATS.map(c => [c.key, c]));

// Forfaitaire rendementen box 3 (percentages), heffingsvrij vermogen per persoon en tarief.
const JR_RATES = {
  2023: { bank: 0.92, overig: 6.17, schuld: 2.46, hvv: 57000, tarief: 32, status: 'definitief' },
  2024: { bank: 1.44, overig: 6.04, schuld: 2.47, hvv: 57000, tarief: 36, status: 'definitief' },
  2025: { bank: 1.37, overig: 5.88, schuld: 2.70, hvv: 57684, tarief: 36, status: 'definitief' },
  2026: { bank: 1.28, overig: 6.00, schuld: 2.70, hvv: 59357, tarief: 36, status: 'banktegoeden en schulden voorlopig' },
};
function jrRatesFor(year) {
  if (JR_RATES[year]) return { ...JR_RATES[year], year, estimated: false };
  const ys = Object.keys(JR_RATES).map(Number).sort((a, b) => a - b);
  const y = year > ys[ys.length - 1] ? ys[ys.length - 1] : ys[0];
  return { ...JR_RATES[y], year: y, estimated: true, status: `nog niet bekend — percentages van ${y} gebruikt` };
}

function jrLoad() {
  try { const v = JSON.parse(localStorage.getItem(JR_STORE)); if (v && typeof v === 'object') return v; } catch (e) { /* ignore */ }
  return {};
}
function jrSave(cfg) { try { localStorage.setItem(JR_STORE, JSON.stringify(cfg)); } catch (e) { /* ignore */ } }

function jrDefaultCat(p) {
  const c = assetClassOf(p);
  if (c === 'liq') return 'bank';
  if (c === 'cr' || (p && p.unit === 'crypto')) return 'crypto';
  if (c === 'idx' || c === 'br') return 'beleg';
  return 'overig';
}

function jrIdx(dates, iso) {
  let lo = 0, hi = dates.length - 1, ans = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (dates[m] <= iso) { ans = m; lo = m + 1; } else hi = m - 1; }
  return ans;
}
const jrNum = v => (v === '' || v == null || !Number.isFinite(+v) ? null : +v);
const jrDown = v => (v == null ? null : Math.floor(v + 1e-9));

// Kern: per bezitting begin/eind/stromen voor het jaar + box 3-berekeningen.
function jrCompute(app, year, cfg) {
  const { model, state } = app;
  const series = model.series || {};
  const dates = series.dates || [];
  const today = todayIsoLocal();
  const curYear = +today.slice(0, 4);
  const open = year >= curYear;
  const y0 = `${year}-01-01`, prevEnd = `${year - 1}-12-31`, yEnd = `${year}-12-31`;
  const endIso = open ? today : yEnd;
  const allTx = state.transactions || [];
  const t212Lnk = t212Linked(allTx);
  const t212Start = (app.spots && app.spots.t212Start) || null;
  const assetsCfg = cfg.assets || {};
  const ovrYear = (cfg.overrides && cfg.overrides[year]) || {};
  const typeLabel = Object.fromEntries((TX_TYPES || []).map(t => [t.key, t.label]));

  const rows = [];
  for (const s of model.summaries || []) {
    const p = s.party, id = p.id;
    const txs = (s.transactions || []).filter(t => t && t.date && !(p.id === STOCK_PARTY_ID && t212Lnk && !isT212ApiTx(t)));
    const firstTx = txs.length ? txs.reduce((m, t) => (t.date < m ? t.date : m), txs[0].date) : null;
    const v = series.byParty && series.byParty[id];
    const n = series.netByParty && series.netByParty[id];
    const warns = [];
    const at = (arr, iso, alt) => {
      if (!arr || !dates.length) return null;
      let i = jrIdx(dates, iso);
      if (i < 0 && alt) i = jrIdx(dates, alt);
      if (i < 0) return (!firstTx || firstTx > (alt || iso)) ? 0 : null;
      return arr[i] || 0;
    };
    let start = at(v, prevEnd, y0), end = year > curYear ? null : at(v, endIso);
    const n0 = at(n, prevEnd, y0), n1 = year > curYear ? null : at(n, endIso);
    let flow = n0 != null && n1 != null ? n1 - n0 : null;
    if (s.external && !(v && dates.length)) { start = null; end = open ? (s.currentValueEur || 0) : null; }

    const inYear = txs.filter(t => t.date >= y0 && t.date <= yEnd);
    let income = 0, costs = 0, inflow = 0, outflow = 0;
    for (const t of inYear) {
      const fee = +t.feeEur || 0;
      costs += fee;
      if (t.type === 'dividend' || t.type === 'rente' || t.type === 'cashback') income += +t.amountEur || 0;
      if (t.type === 'kosten') costs += +t.amountEur || 0;
      if (t.type === 'inleg') inflow += +t.amountEur || 0;
      if (t.type === 'opname') outflow += txGross(t);
      if (t.type === 'koop' && p.unit !== 'bundle' && p.unit !== 'eur') inflow += txGross(t) + fee;
      if (t.type === 'verkoop' && p.unit !== 'bundle' && p.unit !== 'eur') outflow += txGross(t) - fee;
    }

    if (id === STOCK_PARTY_ID && t212Lnk && t212Start && t212Start > y0 && t212Start <= endIso)
      warns.push(`Trading 212 wordt in de app pas vanaf ${fmtDateLong(t212Start)} bijgehouden. Neem de waarde op 1 januari en de stortingen uit het jaaroverzicht van Trading 212 over.`);
    if (p.id === 'lopende-rekening' || s.external) warns.push('Saldo komt uit het Financieel Systeem; controleer met het jaaroverzicht van de bank.');

    const o = ovrYear[id] || {};
    const oStart = jrNum(o.start), oEnd = jrNum(o.end), oFlow = jrNum(o.flow);
    const src = { start: oStart != null ? 'handmatig' : 'app', end: oEnd != null ? 'handmatig' : 'app', flow: oFlow != null ? 'handmatig' : 'app' };
    if (oStart != null) start = oStart;
    if (oEnd != null) end = oEnd;
    if (oFlow != null) flow = oFlow;
    if (start == null) warns.push('Waarde op 1 januari onbekend (geen koershistorie). Vul deze handmatig in.');
    if (end == null && year <= curYear) warns.push('Eindwaarde onbekend. Vul deze handmatig in.');

    const result = start != null && end != null && flow != null ? end - start - flow : null;
    const fiscal = result != null ? result + costs : null;
    const dormant = Math.abs(start || 0) < 0.5 && Math.abs(end || 0) < 0.5 && !inYear.length && start != null && (end != null || year > curYear);
    const ac = assetsCfg[id] || {};
    const cat = JR_CAT_BY_KEY[ac.cat] ? ac.cat : jrDefaultCat(p);
    const incl = ac.incl != null ? !!ac.incl : !dormant;
    rows.push({ id, party: p, name: p.name, sub: p.subtitle || p.category || '', cat, incl, dormant, start, end, flow, inflow, outflow,
      income, costs, result, fiscal, warns, src, firstTx, txs: inYear, typeLabel });
  }

  const inc = rows.filter(r => r.incl);
  const sum = (arr, f) => arr.reduce((a, r) => a + (f(r) || 0), 0);
  const byCat = JR_CATS.map(c => {
    const rs = inc.filter(r => r.cat === c.key);
    return { ...c, rows: rs, start: sum(rs, r => jrDown(r.start)), end: sum(rs, r => r.end), result: sum(rs, r => r.result), fiscal: sum(rs, r => r.fiscal) };
  });
  const rates = jrRatesFor(year);
  const bank = byCat.find(c => c.key === 'bank').start;
  const other = byCat.filter(c => c.rate === 'overig').reduce((a, c) => a + c.start, 0);
  const grondslag = bank + other;
  const fictBank = bank * rates.bank / 100, fictOther = other * rates.overig / 100;
  const fictief = fictBank + fictOther;
  const eff = grondslag > 0 ? fictief / grondslag : 0;
  const hvv = rates.hvv * (cfg.partner ? 2 : 1);
  const grondslagSB = Math.max(0, grondslag - hvv);
  const voordeel = grondslagSB * eff;
  const taxForfait = voordeel * rates.tarief / 100;
  const werkelijk = sum(inc, r => r.fiscal);
  const unknown = inc.some(r => r.fiscal == null);
  const taxWerkelijk = Math.max(0, werkelijk) * rates.tarief / 100;
  const totals = {
    start: sum(inc, r => jrDown(r.start)), end: sum(inc, r => r.end), flow: sum(inc, r => r.flow), inflow: sum(inc, r => r.inflow), outflow: sum(inc, r => r.outflow),
    income: sum(inc, r => r.income), costs: sum(inc, r => r.costs), result: sum(inc, r => r.result), fiscal: werkelijk,
  };
  return { year, open, today, endIso, rows, inc, byCat, rates, totals,
    forfait: { bank, other, grondslag, fictBank, fictOther, fictief, eff, hvv, grondslagSB, voordeel, tax: taxForfait },
    werkelijk: { total: werkelijk, tax: taxWerkelijk, unknown, gunstig: !unknown && taxWerkelijk < taxForfait - 0.5 } };
}

// ---- Document ----
function jrMoney(v, opts) { return v == null ? '—' : fmtMoney(v, opts); }
function jrSigned(v) {
  if (v == null) return <span className="jr-muted">—</span>;
  return <span className={v < -0.5 ? 'jr-neg' : v > 0.5 ? 'jr-pos' : undefined}>{fmtMoney(v, { sign: true })}</span>;
}
const jrPct = v => `${(+v).toFixed(2).replace('.', ',')}%`;

// Logo van de aanbieder (zelfde bestanden als in de app); anders een neutraal monogram.
function JrLogo({ party, small }) {
  const src = typeof partyLogo === 'function' ? partyLogo(party) : null;
  const [bad, setBad] = useState(false);
  const cls = 'jr-logo' + (small ? ' jr-logo--sm' : '');
  if (src && !bad) {
    return <span className={cls + (/-tile\./.test(src) ? ' jr-logo--tile' : '')} aria-hidden="true">
      <img src={src} alt="" draggable="false" onError={() => setBad(true)} /></span>;
  }
  return <span className={cls + ' jr-logo--mono'} aria-hidden="true">{monogramOf(party)}</span>;
}

// Berekening als staat: ingesprongen posten in de binnenkolom (a), (sub)totalen in de buitenkolom (b).
function JrLedger({ rows }) {
  return (
    <table className="jr-led"><tbody>{rows.filter(Boolean).map((r, i) => (
      <tr key={i} className={r.k || undefined}>
        <td style={r.lvl ? { paddingLeft: r.lvl * 16 } : undefined}>{r.l}{r.note ? <small>{r.note}</small> : null}</td>
        <td className={'n a' + (r.ra ? ' rule' : '')}>{r.a}</td>
        <td className={'n b' + (r.rb ? ' rule' : '')}>{r.b}</td>
      </tr>))}
    </tbody></table>
  );
}

function JrDocument({ rep, cfg }) {
  const Y = rep.year;
  const peil = `1 januari ${Y}`;
  const endShort = rep.open ? `Stand ${fmtDateLong(rep.endIso)}` : `31 december ${Y}`;
  const made = fmtDateLong(rep.today);
  const allWarns = rep.inc.flatMap(r => r.warns.map(w => ({ r, w })));
  const excluded = rep.rows.filter(r => !r.incl && !r.dormant);
  const f = rep.forfait, w = rep.werkelijk, R = rep.rates, T = rep.totals;
  const sum = (arr, k) => arr.reduce((a, r) => a + (r[k] || 0), 0);
  const groups = rep.byCat.filter(c => c.rows.length);
  const startExact = sum(rep.inc, 'start');
  const koers = T.result - T.income + T.costs;
  const better = w.unknown ? null : (w.tax < f.tax - 0.5 ? 'w' : 'f');
  const M = v => jrMoney(v);
  const minus = v => (v == null ? '—' : fmtMoney(-Math.abs(v)));
  const S = v => (v == null ? '—' : fmtMoney(v, { sign: true }));
  const Asset = ({ r }) => (
    <div className="jr-asset-cell"><JrLogo party={r.party} />
      <div><b>{r.name}</b>{(r.sub || r.src.start === 'handmatig' || r.src.end === 'handmatig' || r.src.flow === 'handmatig')
        ? <small>{[r.sub, (r.src.start === 'handmatig' || r.src.end === 'handmatig' || r.src.flow === 'handmatig') ? 'handmatig aangepast' : null].filter(Boolean).join(' · ')}</small> : null}</div>
    </div>);
  const LL = ({ r }) => <span className="jr-l"><JrLogo party={r.party} small />{r.name}</span>;

  return (
    <article className="jr-paper" aria-label={`Vermogensoverzicht ${Y}`}>
      <div className="jr-top"><span>Persoonlijke administratie · Box 3</span><span>Vertrouwelijk</span></div>
      <h1 className="jr-title">Vermogensoverzicht <span>{Y}</span></h1>
      <p className="jr-lede">Bezittingen, resultaat en berekening van de belasting over sparen en beleggen</p>
      <dl className="jr-meta">
        <div><dt>Belastingplichtige</dt><dd>{cfg.name || '—'}{cfg.partner ? <span className="jr-muted"> · met partner</span> : null}</dd></div>
        <div><dt>Peildatum</dt><dd>{peil}</dd></div>
        <div><dt>Opgesteld</dt><dd>{made}</dd></div>
        <div><dt>Status</dt><dd className={rep.open ? 'jr-state' : 'jr-state jr-state--ok'}>{rep.open ? 'Voorlopig' : 'Jaar afgesloten'}</dd></div>
      </dl>

      <div className="jr-sum">
        <div><div className="jr-lbl">Vermogen {peil}</div><div className="jr-sum__v">{M(T.start)}</div><div className="jr-sum__s">{rep.inc.length} bezittingen</div></div>
        <div><div className="jr-lbl">{rep.open ? 'Vermogen nu' : `Vermogen 31 dec ${Y}`}</div><div className="jr-sum__v">{M(T.end)}</div><div className="jr-sum__s">{rep.open ? fmtDateLong(rep.endIso) : 'einde belastingjaar'}</div></div>
        <div><div className="jr-lbl">Resultaat {Y}</div><div className="jr-sum__v">{jrSigned(T.result)}</div><div className="jr-sum__s">na netto inleg van {fmtMoney(T.flow, { sign: true })}</div></div>
        <div><div className="jr-lbl">Box 3 forfaitair</div><div className="jr-sum__v">{M(f.tax)}</div><div className="jr-sum__s">indicatief · {R.tarief}% van {M(f.voordeel)}</div></div>
      </div>

      {/* ---------------- Deel 1 ---------------- */}
      <header className="jr-part">
        <span className="jr-part__no">Deel 1</span><h2>Bezittingen en resultaat</h2>
        <p>Waarde per bezitting op {peil} en {rep.open ? `de stand op ${fmtDateLong(rep.endIso)}` : `31 december ${Y}`}, en het resultaat na aftrek van wat er in {Y} netto is ingelegd.</p>
      </header>

      <section className="jr-sec">
        <h3><span className="jr-num">1.1</span>Overzicht per bezitting</h3>
        <div className="jr-twrap"><table className="jr-t">
          <thead><tr><th>Bezitting</th><th className="n">{peil}</th><th className="n">Netto ingelegd</th><th className="n">{endShort}</th><th className="n">Resultaat</th></tr></thead>
          <tbody>{groups.map(c => (
            <React.Fragment key={c.key}>
              <tr className="jr-grp"><td>{c.label}</td><td className="n">{M(sum(c.rows, 'start'))}</td><td className="n">{S(sum(c.rows, 'flow'))}</td><td className="n">{M(c.end)}</td><td className="n">{jrSigned(c.result)}</td></tr>
              {c.rows.map(r => (
                <tr key={r.id} className="jr-item"><td><Asset r={r} /></td>
                  <td className="n">{M(r.start)}</td><td className="n">{r.flow == null ? '—' : S(r.flow)}</td><td className="n">{M(r.end)}</td><td className="n">{jrSigned(r.result)}</td></tr>))}
            </React.Fragment>))}
          </tbody>
          <tfoot><tr><td>Totaal</td><td className="n">{M(startExact)}</td><td className="n">{S(T.flow)}</td><td className="n">{M(T.end)}</td><td className="n">{jrSigned(T.result)}</td></tr></tfoot>
        </table></div>
        {excluded.length > 0 && <p className="jr-fine" style={{ marginTop: 6 }}>Op verzoek niet opgenomen: {excluded.map(r => r.name).join(', ')}.</p>}
      </section>

      <section className="jr-sec">
        <h3><span className="jr-num">1.2</span>Vermogensontwikkeling {Y}</h3>
        <div className="jr-block"><JrLedger rows={[
          { k: 'sum', l: `Vermogen op ${peil}`, b: M(startExact) },
          { l: 'Netto ingelegd', note: 'stortingen en aankopen min opnames en verkopen', b: S(T.flow) },
          { k: 'head', l: `Resultaat ${Y}`, b: jrSigned(T.result) },
          { k: 'sub', lvl: 1, l: 'Koers- en waardeverandering', a: S(koers) },
          { k: 'sub', lvl: 1, l: 'Ontvangen dividend en rente', a: S(T.income) },
          { k: 'sub', lvl: 1, l: 'Betaalde kosten', a: T.costs > 0.005 ? fmtMoney(-T.costs, { decimals: 2 }) : M(0) },
          { k: 'total', l: rep.open ? `Vermogen op ${fmtDateLong(rep.endIso)}` : `Vermogen op 31 december ${Y}`, b: M(T.end) },
        ]} /></div>
      </section>

      {/* ---------------- Deel 2 ---------------- */}
      <header className="jr-part">
        <span className="jr-part__no">Deel 2</span><h2>Belasting box 3</h2>
        <p>Eerst de opgave en de forfaitaire berekening zoals de Belastingdienst die toepast, daarna het werkelijk rendement voor een eventueel beroep op de tegenbewijsregeling.</p>
      </header>

      <section className="jr-sec">
        <h3><span className="jr-num">2.1</span>Opgave in de aangifte — {peil}</h3>
        <p className="jr-intro">In te vullen onder <i>Bankrekeningen en andere bezittingen</i>. Bedragen in hele euro's, naar beneden afgerond.</p>
        <div className="jr-block"><JrLedger rows={[
          ...rep.byCat.flatMap(c => [
            { k: 'head', l: c.label, note: c.rows.length ? null : 'geen', b: M(c.start) },
            ...c.rows.map(r => ({ k: 'sub', lvl: 1, l: <LL r={r} />, a: M(jrDown(r.start)) })),
          ]),
          { k: 'head', l: 'Schulden', note: 'niet opgenomen', b: M(0) },
          { k: 'total', l: 'Rendementsgrondslag', b: M(f.grondslag) },
        ]} /></div>
      </section>

      <section className="jr-sec">
        <h3><span className="jr-num">2.2</span>Forfaitaire berekening</h3>
        <p className="jr-intro">Belastingjaar {Y}: banktegoeden {jrPct(R.bank)}, overige bezittingen {jrPct(R.overig)}, schulden {jrPct(R.schuld)} ({R.status}).</p>
        <div className="jr-block"><JrLedger rows={[
          { k: 'head', l: 'Fictief rendement' },
          { k: 'sub', lvl: 1, l: 'Banktegoeden', note: `${M(f.bank)} × ${jrPct(R.bank)}`, a: M(f.fictBank) },
          { k: 'sub', lvl: 1, l: 'Overige bezittingen', note: `${M(f.other)} × ${jrPct(R.overig)}`, a: M(f.fictOther) },
          { k: 'sub', lvl: 1, l: 'Schulden', note: `${M(0)} × ${jrPct(R.schuld)}`, a: M(0) },
          { k: 'sum', lvl: 1, l: 'Totaal fictief rendement', a: M(f.fictief), ra: true },
          { k: 'muted', lvl: 1, l: 'Effectief rendementspercentage', note: `${M(f.fictief)} / ${M(f.grondslag)}`, a: jrPct(f.eff * 100) },
          { k: 'head', l: 'Grondslag sparen en beleggen' },
          { k: 'sub', lvl: 1, l: 'Rendementsgrondslag', a: M(f.grondslag) },
          { k: 'sub', lvl: 1, l: 'Heffingsvrij vermogen', note: cfg.partner ? `2 × ${M(R.hvv)}` : null, a: minus(f.hvv) },
          { k: 'sum', lvl: 1, l: 'Grondslag sparen en beleggen', a: M(f.grondslagSB), ra: true },
          { l: 'Voordeel uit sparen en beleggen', note: `${M(f.grondslagSB)} × ${jrPct(f.eff * 100)}`, b: M(f.voordeel) },
          { k: 'total', l: `Belasting box 3 (${R.tarief}%)`, b: M(f.tax) },
        ]} /></div>
        {cfg.partner && <p className="jr-fine" style={{ margin: '6px 0 0 32px' }}>Fiscale partners mogen de grondslag naar keuze verdelen; hier is het heffingsvrij vermogen van beiden toegepast.</p>}
      </section>

      <section className="jr-sec">
        <h3><span className="jr-num">2.3</span>Werkelijk rendement {rep.open ? `(tot ${fmtDateLong(rep.endIso)})` : Y}</h3>
        <p className="jr-intro">Tegenbewijsregeling: eindwaarde − beginwaarde − netto ingelegd. Kosten zijn niet aftrekbaar en worden teruggeteld; dividend en rente zitten al in de eindwaarde.</p>
        <div className="jr-block"><JrLedger rows={[
          { k: 'head', l: 'Resultaat per bezitting' },
          ...rep.inc.map(r => ({ k: 'sub', lvl: 1, l: <LL r={r} />, note: r.costs > 0.005 ? `incl. ${fmtMoney(r.costs, { decimals: 2 })} kosten` : null, a: r.fiscal == null ? '—' : S(r.fiscal) })),
          { k: 'sum', lvl: 1, l: 'Totaal', a: w.unknown ? '—' : S(w.total), ra: true },
          { k: 'head', l: 'Opbouw' },
          { k: 'sub', lvl: 1, l: rep.open ? 'Vermogen nu' : `Vermogen 31 december ${Y}`, a: M(T.end) },
          { k: 'sub', lvl: 1, l: `Af: vermogen ${peil}`, a: minus(startExact) },
          { k: 'sub', lvl: 1, l: 'Af: netto ingelegd', a: S(-T.flow) },
          { k: 'sum', lvl: 1, l: 'Resultaat', a: S(T.result), ra: true },
          { k: 'sub', lvl: 1, l: 'Bij: niet-aftrekbare kosten', a: T.costs > 0.005 ? fmtMoney(T.costs, { sign: true, decimals: 2 }) : M(0) },
          { k: 'sum', lvl: 1, l: 'Werkelijk rendement', a: w.unknown ? '—' : S(w.total), ra: true },
          { l: 'Belastbaar werkelijk rendement', note: w.total < 0 ? 'negatief wordt op nihil gesteld' : null, b: w.unknown ? '—' : M(Math.max(0, w.total)) },
          { k: 'total', l: `Belasting box 3 (${R.tarief}%)`, b: w.unknown ? '—' : M(w.tax) },
        ]} /></div>
      </section>

      <section className="jr-sec">
        <h3><span className="jr-num">2.4</span>Vergelijking</h3>
        <div className="jr-cmp">
          <div className={better === 'f' ? 'is-best' : undefined}><div className="jr-lbl">Forfaitair</div><div className="jr-cmp__v">{M(f.tax)}</div><div className="jr-cmp__s">over een voordeel van {M(f.voordeel)}</div></div>
          <div className={better === 'w' ? 'is-best' : undefined}><div className="jr-lbl">Werkelijk rendement</div><div className="jr-cmp__v">{w.unknown ? '—' : M(w.tax)}</div><div className="jr-cmp__s">{w.unknown ? 'onvolledig — vul ontbrekende bedragen in' : `over een rendement van ${M(Math.max(0, w.total))}`}</div></div>
        </div>
        <p className="jr-concl">{w.unknown ? 'Het werkelijk rendement is nog niet volledig; vergelijken is pas mogelijk als alle bedragen bekend zijn.'
          : rep.open ? `Het jaar loopt nog; de vergelijking is pas definitief na 31 december ${Y}.`
            : better === 'w' ? 'Het werkelijk rendement leidt tot minder belasting: een beroep op de tegenbewijsregeling lijkt gunstig.'
              : 'Het werkelijk rendement is niet lager dan het forfaitaire voordeel: de tegenbewijsregeling levert waarschijnlijk geen voordeel op.'}</p>
      </section>

      <section className="jr-sec">
        <h3><span className="jr-num">2.5</span>Toelichting</h3>
        <ul className="jr-fine jr-notes">
          <li>Waarde op de peildatum is de waarde in het economische verkeer aan het begin van 1 januari {Y} (slotwaarde 31 december {Y - 1}), op basis van beurskoersen, NAV van fondsen en crypto- en edelmetaalkoersen in euro.</li>
          <li>Netto ingelegd is stortingen en aankopen min opnames en verkopen binnen het jaar. Overboekingen tussen eigen bezittingen vallen in het totaal tegen elkaar weg.</li>
          <li>Bedragen met <i>handmatig aangepast</i> zijn overgenomen uit jaaroverzichten van de aanbieder en gaan voor op de berekende waarde.</li>
          <li>Pensioenvermogen, de eigen woning en box 2-belangen zijn niet opgenomen. Heffingsvrij vermogen {Y}: {M(R.hvv)} per persoon.</li>
          <li>Dit overzicht is een hulpmiddel bij de aangifte en geen fiscaal advies. Controleer de bedragen met de jaaroverzichten van banken en aanbieders en bewaar die minimaal 7 jaar.</li>
        </ul>
        {allWarns.length > 0 && <ul className="jr-warns">{allWarns.map((x, i) => <li key={i}><b>{x.r.name}:</b> {x.w}</li>)}</ul>}
      </section>

      <div className="jr-sign"><div>Datum</div><div>Handtekening{cfg.name ? ` — ${cfg.name}` : ''}</div></div>

      {cfg.appendix && (<>
        <header className="jr-part jr-part--break">
          <span className="jr-part__no">Bijlage</span><h2>Mutaties in {Y}</h2>
          <p>Alle boekingen van de opgenomen bezittingen, in datumvolgorde.</p>
        </header>
        <section className="jr-sec">
          {rep.inc.some(r => r.txs.length) ? (
            <div className="jr-twrap"><table className="jr-t">
              <thead><tr><th>Datum</th><th>Bezitting</th><th>Soort</th><th>Omschrijving</th><th className="n">Bedrag</th></tr></thead>
              <tbody>{rep.inc.flatMap(r => r.txs.map(t => ({ r, t }))).sort((a, b) => a.t.date.localeCompare(b.t.date)).map(({ r, t }) => {
                const amt = t.type === 'waardering' ? (t.valueEur != null ? +t.valueEur : null) : t.type === 'overboeking' ? null : txGross(t);
                const desc = [t.instrument, t.quantity ? fmtQty(+t.quantity) + (t.unitPriceEur ? ` × ${fmtMoney(+t.unitPriceEur, { decimals: 2 })}` : '') : null, t.feeEur ? `kosten ${fmtMoney(+t.feeEur, { decimals: 2 })}` : null].filter(Boolean).join(' · ');
                return (<tr key={r.id + t.id}><td style={{ whiteSpace: 'nowrap' }}>{fmtDateLong(t.date)}</td><td><LL r={r} /></td><td>{r.typeLabel[t.type] || t.type}</td><td className="jr-muted">{desc}</td>
                  <td className="n">{amt == null ? '—' : fmtMoney(amt, { decimals: 2 })}</td></tr>);
              })}</tbody>
            </table></div>
          ) : <p className="jr-muted">Geen mutaties in {Y}.</p>}
        </section>
      </>)}
      <footer className="jr-foot"><span>Vermogensoverzicht {Y}</span><span>Opgesteld op {made}</span></footer>
    </article>
  );
}

// PDF: in de iPhone-/Mac-app via een native printvenster (bewaar als PDF), anders de printfunctie van de browser.
function jrExportPdf(year) {
  const title = `Vermogensoverzicht box 3 ${year}`;
  const old = document.title;
  document.title = title;
  const h = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.investerenPrint;
  try {
    if (h) h.postMessage({ title });
    else window.print();
  } finally {
    setTimeout(() => { document.title = old; }, 1500);
  }
}

function JaaroverzichtView({ app }) {
  const today = todayIsoLocal();
  const curYear = +today.slice(0, 4);
  const [cfg, setCfgRaw] = useState(jrLoad);
  const setCfg = fn => setCfgRaw(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; jrSave(next); return next; });
  const firstYear = useMemo(() => {
    const ds = (app.state.transactions || []).map(t => t.date).filter(Boolean).sort();
    return ds.length ? Math.max(2023, +ds[0].slice(0, 4)) : curYear;
  }, [app.state.transactions, curYear]);
  const years = [];
  for (let y = curYear; y >= Math.min(firstYear, curYear); y--) years.push(y);
  const year = cfg.year && years.includes(cfg.year) ? cfg.year : curYear;
  const rep = useMemo(() => jrCompute(app, year, cfg), [app.model, app.state, app.spots, year, cfg]);
  const [openId, setOpenId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const setAsset = (id, patch) => setCfg(c => ({ ...c, assets: { ...(c.assets || {}), [id]: { ...((c.assets || {})[id] || {}), ...patch } } }));
  const setOvr = (id, key, val) => setCfg(c => {
    const ov = { ...(c.overrides || {}) };
    const yr = { ...(ov[year] || {}) };
    const cur = { ...(yr[id] || {}) };
    if (val === '' || val == null) delete cur[key]; else cur[key] = val;
    yr[id] = cur; ov[year] = yr;
    return { ...c, overrides: ov };
  });
  const ovr = (cfg.overrides && cfg.overrides[year]) || {};
  const listed = rep.rows.filter(r => showAll || !r.dormant || r.incl);
  const hiddenCount = rep.rows.length - listed.length;

  return (
    <div className="jr-view">
      <div className="jr-layout">
        <div className="jr-side">
          <Card title="Jaaroverzicht box 3" meta="Vermogen voor de aangifte">
            <div className="jr-form">
              <div className="jr-row2">
                <Field label="Belastingjaar" htmlFor="jr-year">
                  <Select id="jr-year" value={year} onChange={e => setCfg(c => ({ ...c, year: +e.target.value }))}>
                    {years.map(y => <option key={y} value={y}>{y}{y === curYear ? ' (lopend)' : ''}</option>)}
                  </Select>
                </Field>
                <Field label="Naam op document" htmlFor="jr-name">
                  <Input id="jr-name" value={cfg.name || ''} placeholder="Optioneel" onChange={e => setCfg(c => ({ ...c, name: e.target.value }))} />
                </Field>
              </div>
              <Switch checked={!!cfg.partner} onChange={v => setCfg(c => ({ ...c, partner: v }))} label="Fiscale partner" description="Dubbel heffingsvrij vermogen in de berekening" />
              <Switch checked={!!cfg.appendix} onChange={v => setCfg(c => ({ ...c, appendix: v }))} label="Bijlage met mutaties" description={`Alle boekingen in ${year} van de gekozen bezittingen`} />
              <div className="jr-actions">
                <Button variant="primary" icon="download" onClick={() => jrExportPdf(year)} data-testid="jr-export">Exporteer als PDF</Button>
              </div>
              <div className="jr-note">Kies in het printvenster <b>Bewaar als PDF</b>. {rep.open ? `${year} is nog niet afgesloten: de eindstand is die van vandaag.` : ''}</div>
            </div>
          </Card>
          <Card title="Bezittingen" meta={`${rep.inc.length} van ${rep.rows.length} opgenomen`}>
            <div className="jr-assets">
              {listed.map(r => {
                const o = ovr[r.id] || {};
                const isOpen = openId === r.id;
                return (
                  <div key={r.id} className={'jr-asset' + (r.incl ? '' : ' is-off')} data-testid={`jr-asset-${r.id}`}>
                    <div className="jr-asset__head">
                      <input type="checkbox" className="jr-asset__check" checked={r.incl} aria-label={`${r.name} opnemen`} onChange={e => setAsset(r.id, { incl: e.target.checked })} />
                      <JrLogo party={r.party} small /><span className="jr-asset__name">{r.name}</span>
                      <span className="jr-asset__val">{r.start == null ? '—' : fmtMoney(r.start)}</span>
                    </div>
                    {r.incl && (
                      <div className="jr-asset__body">
                        <Select aria-label={`Rubriek ${r.name}`} value={r.cat} onChange={e => setAsset(r.id, { cat: e.target.value })}>
                          {JR_CATS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </Select>
                        {r.warns.map((w, i) => <div key={i} className="jr-asset__warn">{w}</div>)}
                        <button type="button" className="jr-more" onClick={() => setOpenId(isOpen ? null : r.id)}>
                          {isOpen ? 'Bedragen verbergen' : (o.start != null || o.end != null || o.flow != null) ? 'Handmatige bedragen aanpassen' : 'Bedragen handmatig aanpassen'}
                        </button>
                        {isOpen && (
                          <div className="jr-ovr">
                            <label>1 jan {year}<Input inputMode="decimal" placeholder={r.start == null ? '—' : String(Math.round(r.start))} value={o.start ?? ''} onChange={e => setOvr(r.id, 'start', e.target.value.replace(',', '.'))} /></label>
                            <label>{rep.open ? 'Eind (nu)' : `31 dec ${year}`}<Input inputMode="decimal" placeholder={r.end == null ? '—' : String(Math.round(r.end))} value={o.end ?? ''} onChange={e => setOvr(r.id, 'end', e.target.value.replace(',', '.'))} /></label>
                            <label>Netto gestort<Input inputMode="decimal" placeholder={r.flow == null ? '—' : String(Math.round(r.flow))} value={o.flow ?? ''} onChange={e => setOvr(r.id, 'flow', e.target.value.replace(',', '.'))} /></label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {hiddenCount > 0 && <button type="button" className="jr-more" style={{ marginTop: 8 }} onClick={() => setShowAll(true)}>{hiddenCount} bezitting(en) zonder saldo in {year} tonen</button>}
            </div>
          </Card>
        </div>
        <div className="jr-preview" data-testid="jr-preview">
          <JrDocument rep={rep} cfg={cfg} />
        </div>
      </div>
      {ReactDOM.createPortal(<div className="jr-printroot"><JrDocument rep={rep} cfg={cfg} /></div>, document.body)}
    </div>
  );
}

Object.assign(window, { JaaroverzichtView, jrCompute, JR_RATES });
