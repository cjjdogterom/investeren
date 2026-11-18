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
.jr-paper { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 16mm 15mm 18mm; background: #fff; color: #16181d; box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 8px 30px rgba(0,0,0,.10); border-radius: 4px;
  font: 400 9.5pt/1.45 -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Helvetica, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.jr-paper * { box-sizing: border-box; }
.jr-dhead { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 12px; border-bottom: 2px solid #16181d; }
.jr-dtitle { font-size: 18pt; font-weight: 700; letter-spacing: -0.01em; margin: 0; line-height: 1.15; }
.jr-dsub { margin-top: 4px; color: #4b5260; font-size: 10pt; }
.jr-dmeta { text-align: right; font-size: 8.5pt; color: #4b5260; line-height: 1.6; white-space: nowrap; }
.jr-dmeta b { color: #16181d; font-weight: 600; }
.jr-badge { display: inline-block; margin-top: 6px; padding: 2px 8px; border-radius: 999px; font-size: 7.5pt; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; background: #fff4e0; color: #8a5300; border: 1px solid #f1d4a3; }
.jr-badge--ok { background: #e9f6ee; color: #1d6b3c; border-color: #bfe3cc; }
.jr-sec { margin-top: 16px; }
.jr-sec h2 { font-size: 10.5pt; font-weight: 700; margin: 0 0 6px; padding-bottom: 4px; border-bottom: 1px solid #d5d9e0; display: flex; gap: 8px; align-items: baseline; }
.jr-sec h2 .jr-num { color: #8a909c; font-weight: 600; }
.jr-sec p { margin: 0 0 6px; }
.jr-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
.jr-kpi { border: 1px solid #d5d9e0; border-radius: 6px; padding: 8px 10px; }
.jr-kpi__l { font-size: 7.5pt; color: #6a7180; text-transform: uppercase; letter-spacing: .05em; font-weight: 600; }
.jr-kpi__v { font-size: 13pt; font-weight: 700; margin-top: 2px; font-variant-numeric: tabular-nums; }
.jr-kpi__s { font-size: 7.5pt; color: #6a7180; margin-top: 1px; }
.jr-twrap { overflow-x: auto; }
.jr-t { width: 100%; border-collapse: collapse; font-size: 8.5pt; font-variant-numeric: tabular-nums; }
.jr-t th { text-align: left; font-weight: 600; color: #4b5260; font-size: 7.5pt; text-transform: uppercase; letter-spacing: .04em; padding: 5px 6px; border-bottom: 1px solid #b9bfca; background: #f4f5f7; vertical-align: bottom; }
.jr-t td { padding: 4.5px 6px; border-bottom: 1px solid #e6e8ec; vertical-align: top; }
.jr-t .n { text-align: right; white-space: nowrap; }
.jr-t tfoot td { font-weight: 700; border-top: 1.5px solid #16181d; border-bottom: 0; background: #fafbfc; }
.jr-t .jr-cat td { background: #fafbfc; font-weight: 600; color: #2b2f37; }
.jr-t tr { break-inside: avoid; }
.jr-t--wide { font-size: 7.8pt; }
.jr-t--wide th { font-size: 6.8pt; letter-spacing: .02em; padding: 5px 4px; }
.jr-t--wide td { padding: 4.5px 4px; }
.jr-t .muted, .jr-muted { color: #6a7180; }
.jr-t .sm { font-size: 7.5pt; color: #6a7180; display: block; }
.jr-neg { color: #b42318; }
.jr-pos { color: #1d6b3c; }
.jr-calc { width: 100%; border-collapse: collapse; font-size: 9pt; font-variant-numeric: tabular-nums; }
.jr-calc td { padding: 3.5px 6px; border-bottom: 1px dotted #d5d9e0; }
.jr-calc td.n { text-align: right; white-space: nowrap; width: 30%; }
.jr-calc tr.tot td { font-weight: 700; border-top: 1.5px solid #16181d; border-bottom: 0; }
.jr-two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.jr-box { border: 1px solid #d5d9e0; border-radius: 6px; padding: 8px 10px; break-inside: avoid; }
.jr-box h3 { font-size: 9pt; margin: 0 0 4px; }
.jr-callout { margin-top: 8px; padding: 8px 10px; border-left: 3px solid #16181d; background: #f4f5f7; font-size: 8.5pt; break-inside: avoid; }
.jr-warns { margin: 6px 0 0; padding-left: 16px; font-size: 8pt; color: #8a5300; }
.jr-fine { font-size: 7.5pt; color: #6a7180; line-height: 1.5; }
.jr-fine li { margin-bottom: 2px; }
.jr-sign { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 18px; font-size: 8.5pt; color: #4b5260; break-inside: avoid; }
.jr-sign div { border-top: 1px solid #b9bfca; padding-top: 4px; }
.jr-foot { margin-top: 16px; padding-top: 6px; border-top: 1px solid #d5d9e0; display: flex; justify-content: space-between; font-size: 7.5pt; color: #8a909c; }

.jr-printroot { display: none; }
@media (max-width: 1100px) {
  .jr-layout { grid-template-columns: minmax(0, 1fr); }
  .jr-side { position: static; max-height: none; overflow: visible; }
}
@media screen and (max-width: 860px) {
  .jr-paper { width: auto; min-height: 0; padding: 20px 16px; font-size: 9pt; }
  .jr-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .jr-two { grid-template-columns: minmax(0, 1fr); }
  .jr-dhead { flex-direction: column; }
  .jr-dmeta { text-align: left; }
}
@media print {
  @page { size: A4; margin: 14mm 13mm 16mm;
    @bottom-left { content: "Vermogensoverzicht box 3 — vertrouwelijk"; font: 7pt -apple-system, Helvetica, Arial, sans-serif; color: #8a909c; }
    @bottom-right { content: "Pagina " counter(page) " van " counter(pages); font: 7pt -apple-system, Helvetica, Arial, sans-serif; color: #8a909c; } }
  html, body { background: #fff !important; }
  body > *:not(.jr-printroot) { display: none !important; }
  .jr-printroot { display: block !important; }
  .jr-printroot .jr-paper { width: auto; min-height: 0; padding: 0; margin: 0; box-shadow: none; border-radius: 0; }
  .jr-twrap { overflow: visible; }
  .jr-sec { break-inside: auto; }
  .jr-sec h2 { break-after: avoid; }
  .jr-kpis, .jr-two { break-inside: avoid; }
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

function JrDocument({ rep, cfg }) {
  const Y = rep.year;
  const peil = `1 januari ${Y}`;
  const endLabel = rep.open ? `Stand ${fmtDateLong(rep.endIso)}` : `31 december ${Y}`;
  const made = fmtDateLong(rep.today);
  const allWarns = rep.inc.flatMap(r => r.warns.map(w => `${r.name}: ${w}`));
  const excluded = rep.rows.filter(r => !r.incl && !r.dormant);
  const f = rep.forfait, w = rep.werkelijk, R = rep.rates;
  const pctFmt = v => `${String(v.toFixed(2)).replace('.', ',')}%`;
  let n = 0;
  const H = ({ children }) => <h2><span className="jr-num">{++n}.</span>{children}</h2>;
  return (
    <article className="jr-paper" aria-label={`Vermogensoverzicht box 3 ${Y}`}>
      <header className="jr-dhead">
        <div>
          <h1 className="jr-dtitle">Vermogensoverzicht box 3</h1>
          <div className="jr-dsub">Belastingjaar {Y} · peildatum {peil}{cfg.name ? <> · {cfg.name}</> : null}</div>
          <span className={rep.open ? 'jr-badge' : 'jr-badge jr-badge--ok'}>{rep.open ? 'Voorlopig — jaar nog niet afgesloten' : 'Jaar afgesloten'}</span>
        </div>
        <div className="jr-dmeta">
          {cfg.name && <div>Belastingplichtige: <b>{cfg.name}</b></div>}
          {cfg.partner && <div>Met fiscale partner</div>}
          <div>Opgesteld: <b>{made}</b></div>
          <div>Valuta: <b>EUR</b> · {rep.inc.length} bezittingen</div>
        </div>
      </header>

      <div className="jr-kpis">
        <div className="jr-kpi"><div className="jr-kpi__l">Bezittingen {peil}</div><div className="jr-kpi__v">{jrMoney(rep.totals.start)}</div><div className="jr-kpi__s">rendementsgrondslag</div></div>
        <div className="jr-kpi"><div className="jr-kpi__l">{rep.open ? 'Stand nu' : `31 december ${Y}`}</div><div className="jr-kpi__v">{jrMoney(rep.totals.end)}</div><div className="jr-kpi__s">{rep.open ? fmtDateLong(rep.endIso) : 'einde jaar'}</div></div>
        <div className="jr-kpi"><div className="jr-kpi__l">Forfaitair voordeel</div><div className="jr-kpi__v">{jrMoney(f.voordeel)}</div><div className="jr-kpi__s">belasting ± {jrMoney(f.tax)}</div></div>
        <div className="jr-kpi"><div className="jr-kpi__l">Werkelijk rendement</div><div className="jr-kpi__v">{w.unknown ? '—' : jrMoney(w.total, { sign: true })}</div><div className="jr-kpi__s">{rep.open ? 'tot nu toe' : `over ${Y}`}</div></div>
      </div>

      <section className="jr-sec">
        <H>Opgave voor de aangifte — {peil}</H>
        <p className="jr-muted">Bedragen in hele euro's (naar beneden afgerond), zoals in te vullen onder <i>Bankrekeningen en andere bezittingen</i>. Er zijn geen schulden opgenomen.</p>
        <div className="jr-twrap"><table className="jr-t">
          <thead><tr><th>Rubriek in de aangifte</th><th className="n">Aantal</th><th className="n">Waarde {peil}</th><th className="n">Forfait</th></tr></thead>
          <tbody>{rep.byCat.map(c => (
            <tr key={c.key}><td>{c.label}<span className="sm">{c.sub}</span></td><td className="n">{c.rows.length}</td><td className="n">{jrMoney(c.start)}</td>
              <td className="n">{pctFmt(c.rate === 'bank' ? R.bank : R.overig)}</td></tr>))}
          </tbody>
          <tfoot><tr><td>Totaal bezittingen</td><td className="n">{rep.inc.length}</td><td className="n">{jrMoney(rep.totals.start)}</td><td /></tr></tfoot>
        </table></div>
      </section>

      <section className="jr-sec">
        <H>Specificatie per bezitting</H>
        <div className="jr-twrap"><table className="jr-t">
          <thead><tr><th>Bezitting</th><th className="n">{peil}</th><th className="n">{endLabel}</th><th className="n">Verschil</th></tr></thead>
          <tbody>{rep.byCat.filter(c => c.rows.length).map(c => (
            <React.Fragment key={c.key}>
              <tr className="jr-cat"><td colSpan={4}>{c.label}</td></tr>
              {c.rows.map(r => (
                <tr key={r.id}><td>{r.name}<span className="sm">{r.sub}{(r.src.start === 'handmatig' || r.src.end === 'handmatig') ? ' · handmatig aangepast' : ''}</span></td>
                  <td className="n">{jrMoney(jrDown(r.start))}</td><td className="n">{jrMoney(r.end)}</td>
                  <td className="n">{r.start != null && r.end != null ? jrSigned(r.end - r.start) : '—'}</td></tr>))}
            </React.Fragment>))}
          </tbody>
          <tfoot><tr><td>Totaal</td><td className="n">{jrMoney(rep.totals.start)}</td><td className="n">{jrMoney(rep.totals.end)}</td><td className="n">{jrSigned(rep.totals.end - rep.totals.start)}</td></tr></tfoot>
        </table></div>
        {excluded.length > 0 && <p className="jr-fine" style={{ marginTop: 6 }}>Niet opgenomen in dit overzicht (op verzoek uitgesloten): {excluded.map(r => r.name).join(', ')}.</p>}
      </section>

      <section className="jr-sec">
        <H>Forfaitaire berekening (indicatief)</H>
        <div className="jr-two">
          <div className="jr-box">
            <h3>Fictief rendement</h3>
            <table className="jr-calc"><tbody>
              <tr><td>Banktegoeden {jrMoney(f.bank)} × {pctFmt(R.bank)}</td><td className="n">{jrMoney(f.fictBank)}</td></tr>
              <tr><td>Overige bezittingen {jrMoney(f.other)} × {pctFmt(R.overig)}</td><td className="n">{jrMoney(f.fictOther)}</td></tr>
              <tr><td>Schulden</td><td className="n">{jrMoney(0)}</td></tr>
              <tr className="tot"><td>Totaal fictief rendement</td><td className="n">{jrMoney(f.fictief)}</td></tr>
              <tr><td>Effectief rendementspercentage</td><td className="n">{(f.eff * 100).toFixed(2).replace('.', ',')}%</td></tr>
            </tbody></table>
          </div>
          <div className="jr-box">
            <h3>Voordeel uit sparen en beleggen</h3>
            <table className="jr-calc"><tbody>
              <tr><td>Rendementsgrondslag</td><td className="n">{jrMoney(f.grondslag)}</td></tr>
              <tr><td>Heffingsvrij vermogen{cfg.partner ? ' (2 personen)' : ''}</td><td className="n">−{jrMoney(f.hvv)}</td></tr>
              <tr><td>Grondslag sparen en beleggen</td><td className="n">{jrMoney(f.grondslagSB)}</td></tr>
              <tr className="tot"><td>Voordeel ({(f.eff * 100).toFixed(2).replace('.', ',')}%)</td><td className="n">{jrMoney(f.voordeel)}</td></tr>
              <tr><td>Belasting box 3 ({R.tarief}%)</td><td className="n"><b>{jrMoney(f.tax)}</b></td></tr>
            </tbody></table>
          </div>
        </div>
        <p className="jr-fine" style={{ marginTop: 6 }}>Percentages {R.year}: banktegoeden {pctFmt(R.bank)}, overige bezittingen {pctFmt(R.overig)}, schulden {pctFmt(R.schuld)}; heffingsvrij vermogen {jrMoney(R.hvv)} per persoon; tarief {R.tarief}% ({R.status}).
          {cfg.partner ? ' Bij fiscale partners mag de grondslag naar keuze worden verdeeld; hier is het heffingsvrij vermogen van beide partners toegepast.' : ''}</p>
      </section>

      <section className="jr-sec">
        <H>Werkelijk rendement {rep.open ? `(${Y}, tot ${fmtDateLong(rep.endIso)})` : Y} — tegenbewijsregeling</H>
        <p className="jr-muted">Werkelijk rendement = eindwaarde − beginwaarde − stortingen + onttrekkingen. Directe opbrengsten (dividend, rente) die op de rekening zijn bijgeschreven zitten al in de eindwaarde. Kosten zijn niet aftrekbaar en worden daarom teruggeteld.</p>
        <div className="jr-twrap"><table className="jr-t jr-t--wide">
          <thead><tr><th>Bezitting</th><th className="n">Begin</th><th className="n">Netto gestort</th><th className="n">Eind</th><th className="n">Resultaat</th><th className="n">Kosten¹</th><th className="n">Werkelijk rendement</th><th className="n">Dividend / rente²</th></tr></thead>
          <tbody>{rep.inc.map(r => (
            <tr key={r.id}><td>{r.name}{r.src.flow === 'handmatig' ? <span className="sm">stortingen handmatig</span> : null}</td>
              <td className="n">{jrMoney(r.start)}</td><td className="n">{r.flow == null ? '—' : fmtMoney(r.flow, { sign: true })}</td><td className="n">{jrMoney(r.end)}</td>
              <td className="n">{jrSigned(r.result)}</td><td className="n">{r.costs > 0.005 ? jrMoney(r.costs, { decimals: 2 }) : '—'}</td>
              <td className="n"><b>{jrSigned(r.fiscal)}</b></td><td className="n">{r.income > 0.005 ? jrMoney(r.income, { decimals: 2 }) : '—'}</td></tr>))}
          </tbody>
          <tfoot><tr><td>Totaal</td><td className="n">{jrMoney(rep.totals.start)}</td><td className="n">{fmtMoney(rep.totals.flow, { sign: true })}</td><td className="n">{jrMoney(rep.totals.end)}</td>
            <td className="n">{jrSigned(rep.totals.result)}</td><td className="n">{jrMoney(rep.totals.costs, { decimals: 2 })}</td><td className="n">{w.unknown ? '—' : jrSigned(w.total)}</td><td className="n">{jrMoney(rep.totals.income, { decimals: 2 })}</td></tr></tfoot>
        </table></div>
        <p className="jr-fine" style={{ marginTop: 4 }}>¹ Niet aftrekbaar; teruggeteld in het werkelijk rendement. ² Ter informatie; al begrepen in de eindwaarde.</p>
        <div className="jr-callout">
          {w.unknown ? <>Het werkelijk rendement is niet volledig: vul de ontbrekende bedragen handmatig in.</> : <>
            Belasting over het werkelijk rendement (indicatie): <b>{jrMoney(w.tax)}</b> ({R.tarief}% van {jrMoney(Math.max(0, w.total))}) tegenover <b>{jrMoney(f.tax)}</b> forfaitair.{' '}
            {rep.open ? 'Het jaar is nog niet afgesloten; de vergelijking is pas definitief na 31 december.'
              : w.gunstig ? 'Het werkelijk rendement is lager dan het forfaitaire voordeel: een beroep op de tegenbewijsregeling lijkt gunstig.'
                : 'Het werkelijk rendement is niet lager dan het forfaitaire voordeel: de tegenbewijsregeling levert waarschijnlijk geen voordeel op.'}
            {' '}Een negatief werkelijk rendement wordt op nihil gesteld en is niet verrekenbaar.</>}
        </div>
      </section>

      {cfg.appendix && (
        <section className="jr-sec">
          <H>Mutaties in {Y}</H>
          {rep.inc.some(r => r.txs.length) ? (
            <div className="jr-twrap"><table className="jr-t">
              <thead><tr><th>Datum</th><th>Bezitting</th><th>Soort</th><th>Omschrijving</th><th className="n">Bedrag</th></tr></thead>
              <tbody>{rep.inc.flatMap(r => r.txs.map(t => ({ r, t }))).sort((a, b) => a.t.date.localeCompare(b.t.date)).map(({ r, t }) => {
                const amt = t.type === 'waardering' ? (t.valueEur != null ? +t.valueEur : null) : t.type === 'overboeking' ? null : txGross(t);
                const desc = [t.instrument, t.quantity ? fmtQty(+t.quantity) + (t.unitPriceEur ? ` × ${fmtMoney(+t.unitPriceEur, { decimals: 2 })}` : '') : null, t.feeEur ? `kosten ${fmtMoney(+t.feeEur, { decimals: 2 })}` : null].filter(Boolean).join(' · ');
                return (<tr key={r.id + t.id}><td style={{ whiteSpace: 'nowrap' }}>{fmtDateLong(t.date)}</td><td>{r.name}</td><td>{r.typeLabel[t.type] || t.type}</td><td className="muted">{desc}</td>
                  <td className="n">{amt == null ? '—' : fmtMoney(amt, { decimals: 2 })}</td></tr>);
              })}</tbody>
            </table></div>
          ) : <p className="jr-muted">Geen mutaties in {Y}.</p>}
        </section>
      )}

      <section className="jr-sec">
        <H>Toelichting en grondslagen</H>
        <ul className="jr-fine" style={{ paddingLeft: 16, margin: 0 }}>
          <li>Waarde op de peildatum = waarde in het economische verkeer bij het begin van 1 januari {Y} (slotwaarde 31 december {Y - 1}), op basis van de koersen in de eigen administratie (beurskoersen, NAV van fondsen, crypto- en edelmetaalkoersen in EUR).</li>
          <li>Crypto is gewaardeerd tegen de koers op de peildatum; gebruik bij twijfel de koers van het platform waar de crypto wordt aangehouden.</li>
          <li>Netto gestort = stortingen en aankopen min onttrekkingen en verkopen binnen het jaar; overboekingen tussen eigen bezittingen vallen in het totaal tegen elkaar weg.</li>
          <li>Bedragen met de vermelding <i>handmatig aangepast</i> zijn overgenomen uit jaaroverzichten van de aanbieder en gaan voor op de berekende waarde.</li>
          <li>Pensioenvermogen, de eigen woning en eventuele box 2-belangen zijn niet in dit overzicht opgenomen.</li>
          <li>Dit overzicht is een hulpmiddel bij de aangifte en geen fiscaal advies. Controleer de bedragen met de jaaroverzichten van banken en aanbieders en bewaar die stukken minimaal 7 jaar (fiscale bewaarplicht).</li>
        </ul>
        {allWarns.length > 0 && <ul className="jr-warns">{allWarns.map((x, i) => <li key={i}>{x}</li>)}</ul>}
      </section>

      <div className="jr-sign"><div>Datum</div><div>Handtekening{cfg.name ? ` — ${cfg.name}` : ''}</div></div>
      <footer className="jr-foot"><span>Vermogensoverzicht box 3 · {Y}</span><span>Opgesteld met Investeringen op {made}</span></footer>
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
                      <span className="jr-asset__name">{r.name}</span>
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
