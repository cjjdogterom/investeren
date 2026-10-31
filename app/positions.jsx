// Posities (S3): PositiesScreen, HoldingsTable, HoldingsList, PartyPanel, PartyForm.
// File-local helpers use the `ps` / `Ps` / `PS_` prefix (CONTRACT §2.2).

injectStyles('positions', `
.ps-page { display: flex; flex-direction: column; gap: 12px; min-width: 0; padding: 20px; }
.ps-ht--compact table { table-layout: fixed; }
.ps-ht--compact .ps-pos__text { overflow: hidden; }
.ps-ht--compact td { overflow: hidden; }
.ps-head { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.ps-head__titles { flex: 1; min-width: 240px; }
.ps-title { margin: 0; font: 600 22px/28px var(--font); letter-spacing: -0.015em; color: var(--fg); }
.ps-meta { margin-top: 2px; font-size: 12.5px; line-height: 17px; color: var(--fg-muted); }
.ps-meta b { font-weight: 550; color: var(--fg); }
.ps-head__actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ps-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ps-foot-note { font-size: 12px; color: var(--fg-subtle); padding: 0 2px; }
.ps-row2 { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.ps-row2 > .ps-stack-card { flex: 2 1 520px; }
.ps-row2 > .ps-costs-card { flex: 1 1 280px; }

/* Holdings table */
.ps-ht { min-width: 0; display: flex; flex-direction: column; }
.ps-ht__scroll { overflow: auto; min-height: 0; }
.ps-ht table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; line-height: 18px; }
.ps-ht th { position: sticky; top: 0; z-index: var(--z-sticky); background: var(--surface); color: var(--fg-muted); font: 500 11.5px/16px var(--font); text-align: left; padding: 8px 8px; border-bottom: 1px solid var(--border); white-space: nowrap; }
.ps-ht th.num, .ps-ht td.num { text-align: right; }
.ps-ht th:first-child, .ps-ht td:first-child { padding-left: 16px; }
.ps-ht th:last-child, .ps-ht td:last-child { padding-right: 16px; }
.ps-ht td { padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: middle; height: 44px; box-sizing: border-box; }
.ps-sort { border: 0; background: none; padding: 0; font: inherit; color: inherit; cursor: pointer; display: inline-flex; align-items: center; gap: 3px; }
.ps-sort:hover { color: var(--fg); }
.ps-sort[data-active="true"] { color: var(--fg); font-weight: 550; }
.ps-row { cursor: pointer; outline: none; }
.ps-row:hover td, .ps-row:focus-visible td { background: var(--surface-2); }
.ps-row:focus-visible td:first-child { box-shadow: inset 2px 0 0 var(--accent); }
.ps-row--muted .ps-name, .ps-row--muted .ps-val { color: var(--fg-muted); }
.ps-pos { display: flex; align-items: center; gap: 10px; min-width: 0; }
.ps-pos__text { min-width: 0; display: flex; flex-direction: column; }
.ps-name { font-weight: 550; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
.ps-sub { font-size: 11.5px; line-height: 15px; color: var(--fg-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px; }
.ps-sub--stale { color: var(--warn); }
.ps-badge { display: inline-flex; align-items: center; height: 18px; padding: 0 5px; border-radius: 5px; border: 1px solid var(--border-strong); font: 500 11px/1 var(--font); color: var(--fg-muted); white-space: nowrap; }
.ps-val { font-weight: 550; font-variant-numeric: tabular-nums lining-nums; white-space: nowrap; }
.ps-gain { color: var(--gain); } .ps-loss { color: var(--loss); } .ps-flat { color: var(--fg-muted); }
.ps-pnl { display: flex; flex-direction: column; align-items: flex-end; white-space: nowrap; }
.ps-pnl small { font-size: 11.5px; line-height: 15px; font-weight: 500; font-variant-numeric: tabular-nums; }
.ps-muted { color: var(--fg-muted); }
.ps-subtle { color: var(--fg-subtle); }
.ps-group td { height: 36px; background: var(--surface); }
.ps-group__btn { display: inline-flex; align-items: center; gap: 8px; border: 0; background: none; padding: 0; font: 550 12.5px/16px var(--font); color: var(--fg); cursor: pointer; white-space: nowrap; }
.ps-group__btn .ps-chev { color: var(--fg-subtle); transition: transform var(--d-1) var(--ease); }
.ps-group__btn[aria-expanded="false"] .ps-chev { transform: rotate(-90deg); }
.ps-group__share { font-weight: 400; color: var(--fg-muted); font-variant-numeric: tabular-nums; }
.ps-group .ps-val { font-size: 12.5px; }
.ps-minibar { position: relative; height: 4px; width: 48px; border-radius: 2px; background: var(--surface-3); overflow: hidden; display: inline-block; vertical-align: middle; }
.ps-minibar > span { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 2px; }
.ps-fold td { height: 40px; }
.ps-fold__btn { display: inline-flex; align-items: center; gap: 8px; border: 0; background: none; padding: 0; font: 500 12.5px/16px var(--font); color: var(--fg-muted); cursor: pointer; }
.ps-fold__btn:hover { color: var(--fg); }
.ps-fold__btn[aria-expanded="true"] .ps-chev { transform: rotate(90deg); }
.ps-chev { transition: transform var(--d-1) var(--ease); flex-shrink: 0; }
.ps-ht tfoot td { position: sticky; bottom: 0; z-index: var(--z-sticky); background: var(--surface); border-top: 1px solid var(--border-strong); border-bottom: 0; font-weight: 600; height: 48px; }
.ps-total-label { display: inline-flex; align-items: center; gap: 4px; }
.ps-orphan td { background: var(--warn-soft); color: var(--fg); }
.ps-orphan__inner { display: flex; align-items: center; gap: 8px; }
.ps-orphan__inner .ps-warnic { color: var(--warn); }
.ps-goal { display: inline-flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.ps-goal__track { width: 64px; height: 4px; border-radius: 2px; background: var(--surface-3); overflow: hidden; }
.ps-goal__fill { height: 100%; background: var(--fg-muted); border-radius: 2px; }
.ps-goal small { font-size: 11px; color: var(--fg-subtle); font-variant-numeric: tabular-nums; }
.ps-ht__note { padding: 10px 16px; font-size: 12px; color: var(--fg-subtle); display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; border-top: 1px solid var(--border); }
.ps-ht__asof { padding: 8px 16px; font-size: 12px; color: var(--accent); background: var(--accent-soft); }

/* Mobile list */
.ps-list { display: flex; flex-direction: column; }
.ps-lgroup { display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 10px 0 4px; border: 0; background: none; width: 100%; font: 500 13px/18px var(--font); color: var(--fg-muted); text-align: left; cursor: pointer; }
.ps-lgroup__label { color: var(--fg); font-weight: 550; }
.ps-lgroup__gain { margin-left: auto; font-size: 12px; font-variant-numeric: tabular-nums; }
.ps-lgroup__gain + .ps-lgroup__val { margin-left: 6px; }
.ps-pgains { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 0; }
.ps-pgains > div { background: var(--surface-2); border-radius: 10px; padding: 8px 10px; min-width: 0; }
.ps-pgains dt { font-size: 11.5px; color: var(--fg-muted); margin-bottom: 2px; }
.ps-pgains dd { margin: 0; font-variant-numeric: tabular-nums; font-weight: 600; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ps-pgains small { display: block; font-weight: 500; font-size: 11.5px; }
@media (max-width: 420px) { .ps-pgains { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.ps-lgroup__val { margin-left: auto; font-variant-numeric: tabular-nums; color: var(--fg-muted); }
.ps-lrow { display: flex; align-items: center; gap: 12px; min-height: 64px; width: 100%; padding: 8px 0; border: 0; background: none; text-align: left; color: var(--fg); font: inherit; cursor: pointer; border-radius: 12px; }
.ps-lrow:active { background: var(--surface-2); }
.ps-lrow__main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.ps-lrow__name { font: 600 15px/20px var(--font); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
.ps-lrow__sub { font-size: 13px; line-height: 18px; color: var(--fg-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 4px; }
.ps-lrow__end { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; gap: 1px; }
.ps-lrow__val { font: 650 15px/20px var(--font); font-variant-numeric: tabular-nums lining-nums; }
.ps-lrow__sec { font-size: 13px; line-height: 18px; font-variant-numeric: tabular-nums; color: var(--fg-muted); white-space: nowrap; }
.ps-lrow--muted .ps-lrow__name, .ps-lrow--muted .ps-lrow__val { color: var(--fg-muted); }
.ps-lfold { display: flex; align-items: center; gap: 10px; min-height: 52px; width: 100%; border: 0; border-top: 1px solid var(--border); background: none; padding: 8px 0; font: inherit; color: var(--fg); text-align: left; cursor: pointer; margin-top: 4px; }
.ps-lfold__main { flex: 1; display: flex; flex-direction: column; }
.ps-lfold__title { font-weight: 600; font-size: 15px; }
.ps-lfold__sub { font-size: 13px; color: var(--fg-muted); }
.ps-lnote { font-size: 13px; line-height: 18px; color: var(--fg-subtle); padding: 8px 0 2px; }
.ps-mtotal { display: flex; flex-direction: column; gap: 10px; }
.ps-mtotal__row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.ps-mtotal__val { font: 650 26px/32px var(--font); letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.ps-mtotal__meta { font-size: 13px; color: var(--fg-muted); }
.ps-mhead { display: flex; align-items: center; gap: 4px; }
.ps-mhead .ps-head__titles { min-width: 0; }
.ps-mcontrols { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ps-opt { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 48px; border: 0; background: none; border-radius: 10px; padding: 0 8px; font: 500 15px/20px var(--font); color: var(--fg); text-align: left; cursor: pointer; }
.ps-opt:hover { background: var(--surface-2); }
.ps-opt[aria-checked="true"] { font-weight: 600; }
.ps-opt__check { margin-left: auto; color: var(--accent); }

/* Party panel */
.ps-panel { display: flex; flex-direction: column; gap: 16px; }
.ps-ptitle { display: flex; align-items: center; gap: 10px; min-width: 0; }
.ps-ptitle__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ps-pvalue { font: 600 30px/36px var(--font); letter-spacing: -0.025em; font-variant-numeric: tabular-nums lining-nums; color: var(--fg); }
.ps-pdelta { margin-top: 4px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 12.5px; color: var(--fg-muted); }
.ps-chartbox { display: flex; flex-direction: column; gap: 8px; }
.ps-kgrid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--border); border-radius: var(--r-2); overflow: hidden; }
.ps-kgrid > div { padding: 10px 12px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ps-kgrid > div:nth-child(odd) { border-right: 1px solid var(--border); }
.ps-kgrid > div:nth-last-child(-n+2) { border-bottom: 0; }
.ps-kgrid dt { font-size: 12px; color: var(--fg-muted); }
.ps-kgrid dd { margin: 0; font: 600 15px/20px var(--font); font-variant-numeric: tabular-nums; }
.ps-strip { display: flex; flex-wrap: wrap; gap: 6px 16px; padding: 10px 12px; border-radius: var(--r-2); background: var(--surface-2); font-size: 12.5px; color: var(--fg-muted); }
.ps-strip b { color: var(--fg); font-weight: 550; font-variant-numeric: tabular-nums; }
.ps-coins { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: var(--r-2); overflow: hidden; }
.ps-coin { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 4px 12px; align-items: center; padding: 10px 12px; }
.ps-coin + .ps-coin { border-top: 1px solid var(--border); }
.ps-coin__name { font: 600 14px/20px var(--font); }
.ps-coin__sub { font-size: 12.5px; color: var(--fg-muted); font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.ps-coin__end { text-align: right; display: flex; flex-direction: column; gap: 2px; font-variant-numeric: tabular-nums; }
.ps-coin__val { font: 600 14px/20px var(--font); }
.ps-coin__chain { grid-column: 2 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; font-size: 12px; color: var(--fg-muted); }
.ps-coin__warn { color: var(--warn); display: inline-flex; align-items: center; gap: 4px; }
.ps-pgoal { display: flex; flex-direction: column; gap: 6px; }
.ps-pgoal__row { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--fg-muted); }
.ps-pgoal__track { height: 6px; border-radius: 3px; background: var(--surface-3); overflow: hidden; }
.ps-pgoal__fill { height: 100%; border-radius: 3px; }
.ps-und { display: flex; flex-direction: column; gap: 10px; }
.ps-und__bar { display: flex; height: 8px; border-radius: 4px; overflow: hidden; background: var(--surface-3); gap: 2px; }
.ps-und__bar > span { height: 100%; }
.ps-und__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.ps-und__row { display: grid; grid-template-columns: 10px minmax(0, 1fr) auto; gap: 2px 10px; align-items: baseline; padding: 8px 0; border-top: 1px solid var(--border); }
.ps-und__row:first-child { border-top: 0; }
.ps-und__row > .ui-swatch, .ps-und__dot { width: 10px; height: 10px; border-radius: 3px; align-self: center; }
.ps-und__name { font: 500 13.5px/18px var(--font); min-width: 0; }
.ps-und__full { grid-column: 2 / 3; font-size: 12px; line-height: 16px; color: var(--fg-muted); overflow-wrap: anywhere; }
.ps-und__end { grid-row: span 2; align-self: start; text-align: right; display: flex; flex-direction: column; gap: 2px; font-variant-numeric: tabular-nums; }
.ps-und__w { font: 600 13.5px/18px var(--font); }
.ps-und__val { font-size: 12px; line-height: 16px; color: var(--fg-muted); }
.ps-und__sub { font: 600 12px/16px var(--font); color: var(--fg-muted); margin-top: 4px; display: flex; justify-content: space-between; gap: 8px; }
.ps-und__sub span:last-child { font-weight: 400; }
.ps-und__reg { display: grid; grid-template-columns: minmax(0, 1fr) 72px auto; gap: 6px 10px; align-items: center; font-size: 12.5px; }
.ps-und__reg .ps-pgoal__track { height: 4px; }
.ps-und__reg .num { text-align: right; color: var(--fg-muted); min-width: 40px; }
.ps-und__src { font-size: 11.5px; line-height: 16px; color: var(--fg-subtle); }
.ps-und__src a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
.ps-und__src a:hover { color: var(--fg); }
.ps-sec-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.ps-sec-title { margin: 0; font: 600 14px/20px var(--font); }
.ps-link { border: 0; background: none; padding: 0; font: 500 12.5px/16px var(--font); color: var(--fg-muted); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.ps-link:hover { color: var(--fg); text-decoration: underline; text-underline-offset: 2px; }
.ps-pfoot { display: flex; gap: 8px; justify-content: space-between; }
.ps-pagewrap { display: flex; flex-direction: column; gap: 16px; padding: 8px 16px 24px; }
.ps-pagehead { display: flex; align-items: center; gap: 8px; }
.ps-pagehead__title { flex: 1; min-width: 0; }
.ps-pagehead__title h1 { margin: 0; font: 600 20px/26px var(--font); display: flex; align-items: center; gap: 10px; }

/* Party form */
.ps-form { display: flex; flex-direction: column; gap: 14px; }
.ps-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ps-classline { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--fg-muted); margin-top: 6px; }
.ps-colors { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.ps-color { width: 28px; height: 28px; border-radius: 8px; border: 2px solid transparent; padding: 0; cursor: pointer; box-shadow: inset 0 0 0 1px rgb(0 0 0 / .08); }
.ps-color[aria-checked="true"] { border-color: var(--fg); }
.ps-del { border-radius: var(--r-2); background: var(--warn-soft); padding: 14px; display: flex; flex-direction: column; gap: 10px; font-size: 13px; line-height: 18px; }
.ps-del__title { font-weight: 600; font-size: 14px; }
.ps-del__check { display: flex; gap: 8px; align-items: flex-start; cursor: pointer; }
.ps-del__check input { margin-top: 2px; width: 16px; height: 16px; accent-color: var(--loss); }
.ps-del__actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
.ps-formfoot { display: flex; gap: 8px; justify-content: flex-end; }

@media (max-width: 767.98px) {
  .ps-page { padding: 12px 16px; }
  .ps-form__row { grid-template-columns: 1fr; }
  .ps-pvalue { font-size: 30px; }
  .ps-kgrid dd { font-size: 16px; }
  .ps-pfoot > * { flex: 1; }
  .ps-color { width: 36px; height: 36px; }
  .ps-del__check { min-height: 44px; }
}
`);

const PS_PERIOD_FALLBACK = ['ALL', '1J', 'YTD', '3M', '1M'];
// Periodes op Posities: sturen zowel de winstkolommen als de trend. 'Alles' = totale winst.
const PS_GAIN_PERIODS = [
  { key: '1D',  label: '1D',    col: 'dag',   context: 'sinds gisteren' },
  { key: '1W',  label: '1W',    col: 'week',  context: 'afgelopen 7 dagen' },
  { key: '1M',  label: '1M',    col: 'maand', context: 'afgelopen maand' },
  { key: '3M',  label: '3M',    col: '3M',    context: 'afgelopen 3 maanden' },
  { key: 'YTD', label: 'YTD',   col: 'YTD',   context: 'dit jaar' },
  { key: '1J',  label: '1J',    col: 'jaar',  context: 'afgelopen jaar' },
  { key: 'ALL', label: 'Alles', col: null,    context: 'sinds {datum}' },
];
// Effectieve winstperiode voor Posities (val terug op 'Alles' als er te weinig data is).
function psGainKey(model, prefs) {
  const k = (prefs && prefs.positionsPeriod) || 'ALL';
  if (k === 'ALL' || !PS_GAIN_PERIODS.some(p => p.key === k)) return 'ALL';
  return periodRange(model.series.dates, k).enabled ? k : 'ALL';
}
function psGainLabel(key) {
  const p = PS_GAIN_PERIODS.find(x => x.key === key);
  return p && p.col ? 'Winst ' + p.col : 'Winst';
}
// Map partij-id → periodewinst ({gain, pct, base}) voor alle samenvattingen.
function psGainMap(model, key) {
  const out = {};
  for (const s of [...model.summaries, ...model.closed, ...model.empty]) out[s.party.id] = partyPeriodGain(model, s, key);
  return out;
}
const PS_SECONDARY_OPTIONS = [
  { value: 'pnl', label: 'Winst € + %' },
  { value: 'value', label: 'Waarde & aandeel' },
  { value: 'qty', label: 'Hoeveelheid' },
  { value: 'invested', label: 'Ingelegd' },
  { value: 'cagr', label: 'Per jaar (CAGR)' },
  { value: 'pnlPct', label: 'Winst %' },
];
const PS_SORT_OPTIONS = [
  { value: 'value', label: 'Waarde' },
  { value: 'pnl', label: 'Winst €' },
  { value: 'pnlPct', label: 'Winst %' },
  { value: 'share', label: 'Aandeel' },
  { value: 'name', label: 'Naam' },
  { value: 'cagr', label: 'Per jaar' },
];

function psCx(...a) { return a.filter(Boolean).join(' '); }
function psIncluded(p) { return (p.includeInTotal ?? p.includeInPortfolio) !== false; }
function psInChart(p) { return (p.includeInTimeChart ?? p.includeInPortfolio) !== false; }
function psTone(v) { return v > 0.5 ? 'ps-gain' : v < -0.5 ? 'ps-loss' : 'ps-flat'; }
function psTyping(e) {
  const t = e.target;
  if (!t) return false;
  const tag = (t.tagName || '').toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
}

// Effective period range (falls back to the first enabled period; never overwrites the pref).
function psRange(dates, period) {
  let key = period || '1J';
  let r = periodRange(dates, key);
  if (!r.enabled) {
    for (const k of PS_PERIOD_FALLBACK) {
      const r2 = periodRange(dates, k);
      if (r2.enabled) { r = r2; key = k; break; }
    }
  }
  return { ...r, key };
}

function psPeriodOptions(dates, list = PERIODS) {
  return list.map(p => {
    const en = periodRange(dates, p.key).enabled;
    return { value: p.key, label: p.label, disabled: !en, title: en ? undefined : 'Te weinig data', testId: `period-${p.key}` };
  });
}

// 1–7 shortcuts for the period (desktop, not while typing).
function usePsPeriodKeys(app, enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey || psTyping(e) || app.overlayOpen) return;
      const i = '1234567'.indexOf(e.key);
      if (i < 0) return;
      const key = PS_GAIN_PERIODS[i].key;
      if (!periodRange(app.model.series.dates, key).enabled) return;
      app.setPrefs({ positionsPeriod: key });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enabled, app]);
}

function psSortValue(s, key, totalValue, todayIso, gains) {
  const g = gains ? gains[s.party.id] : undefined;
  switch (key) {
    case 'name': return (s.party.name || '').toLowerCase();
    case 'pnl': return gains ? (g ? g.gain : -Infinity) : (s.pnl || 0);
    case 'pnlPct': return gains ? (g && g.pct != null ? g.pct : -Infinity) : (s.invested > 0 ? s.pnlPct : -Infinity);
    case 'share': return totalValue > 0 ? (s.currentValueEur || 0) / totalValue : 0;
    case 'cagr': { const c = cagrOf(s, todayIso).pct; return c == null ? -Infinity : c; }
    default: return s.currentValueEur || 0;
  }
}

function psSortSummaries(list, sort, totalValue, valueOf, gains) {
  const key = (sort && sort.key) || 'value';
  const dir = (sort && sort.dir) === 'asc' ? 1 : -1;
  const today = todayIsoLocal();
  const val = s => (valueOf && (key === 'value' || key === 'share') ? valueOf(s) : psSortValue(s, key, totalValue, today, gains));
  return list.slice().sort((a, b) => {
    const ia = psIncluded(a.party), ib = psIncluded(b.party);
    if (ia !== ib) return ia ? -1 : 1;          // excluded last within a group
    const va = val(a), vb = val(b);
    if (key === 'name') return dir * String(va).localeCompare(String(vb), 'nl');
    if (va === vb) return (a.party.name || '').localeCompare(b.party.name || '', 'nl');
    return dir * (va < vb ? -1 : 1);
  });
}

// Groups of open summaries by asset class in slot order.
function psGroupOpen(model, grouped) {
  const open = model.open;
  if (!grouped) return [{ key: '__all', label: null, color: null, rows: open }];
  const out = [];
  for (const c of ASSET_CLASSES) {
    const rows = open.filter(s => assetClassOf(s.party) === c.key);
    if (rows.length) out.push({ key: c.key, label: c.label, color: c.color, rows });
  }
  return out;
}

function psSpark(model, id, r) {
  const v = model.series.byParty[id];
  const nn = model.series.netByParty[id];
  if (!v || !v.length || r.i1 < 0) return null;
  const values = v.slice(r.i0, r.i1 + 1);
  if (!nn) return { values, tone: 'neutral' };
  const g = (v[r.i1] - nn[r.i1]) - (r.all ? 0 : (v[r.i0] - nn[r.i0]));
  return { values, tone: g > 0.5 ? 'gain' : g < -0.5 ? 'loss' : 'neutral' };
}

function PsMoney({ value, sign = false, className }) {
  return <Money value={value} sign={sign} className={className} />;
}

function PsSubline({ s, spots }) {
  const sub = holdingSubline(s, spots);
  if (sub.staleDays != null) {
    return <span className="ps-sub ps-sub--stale"><Icon name="clock" size={12} />{s.external ? `${sub.text} · ${sub.staleDays} dagen oud` : `Waardering · ${sub.staleDays} dagen oud`}</span>;
  }
  return <span className="ps-sub">{sub.text}</span>;
}

function PsBadges({ party }) {
  const out = [];
  if (!psIncluded(party)) out.push(<span key="t" className="ps-badge">niet in totaal</span>);
  if (!psInChart(party)) out.push(<span key="c" className="ps-badge">niet in grafiek</span>);
  return out.length ? <>{out}</> : null;
}

function PsSortTh({ label, k, sort, onSort, num = true, style }) {
  const active = sort.key === k;
  const ariaSort = active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined;
  return (
    <th scope="col" className={num ? 'num' : undefined} aria-sort={ariaSort} style={style}>
      <button type="button" className="ps-sort" data-active={active || undefined} onClick={() => onSort(k)}>
        {active && num && <Icon name={sort.dir === 'asc' ? 'chevron-up' : 'chevron-down'} size={12} />}
        {label}
        {active && !num && <Icon name={sort.dir === 'asc' ? 'chevron-up' : 'chevron-down'} size={12} />}
      </button>
    </th>
  );
}

// ===================================================================
// HoldingsTable
// ===================================================================
function HoldingsTable({ app, variant = 'full', period, asOfIndex = null, maxHeight, className, style }) {
  const { model, prefs, spots } = app;
  const compact = variant === 'compact';
  // Volledige tabel (Posities): één periodekeuze voor winstkolommen én trend.
  const gk = compact ? 'ALL' : psGainKey(model, prefs);
  const per = compact ? (period || prefs.period) : (gk === 'ALL' ? 'ALL' : gk);
  const r = psRange(model.series.dates, per);
  const perLabel = ([...PERIODS, ...PS_GAIN_PERIODS].find(p => p.key === r.key) || {}).label || '';
  const gains = useMemo(() => (gk === 'ALL' ? null : psGainMap(model, gk)), [model, gk]);
  const grouped = compact || prefs.positionsGrouping !== 'none';
  const sort = prefs.positionsSort || { key: 'value', dir: 'desc' };
  const collapsed = new Set(prefs.collapsedGroups || []);
  const [closedOpen, setClosedOpen] = useState(!!prefs.showClosed && !compact);
  const [emptyOpen, setEmptyOpen] = useState(false);
  useEffect(() => { if (!compact) setClosedOpen(!!prefs.showClosed); }, [prefs.showClosed, compact]);
  const tbodyRef = useRef(null);

  const asOf = asOfIndex != null && asOfIndex >= 0 && asOfIndex < model.series.dates.length ? asOfIndex : null;
  const at = useMemo(() => (asOf != null ? holdingsAt(model, asOf) : null), [model, asOf]);
  const valueOf = s => (at ? (at[s.party.id] ? at[s.party.id].value : null) : s.currentValueEur);
  const pnlOf = s => (at ? (at[s.party.id] ? at[s.party.id].pnl : null)
    : gains ? (gains[s.party.id] ? gains[s.party.id].gain : null) : s.pnl);
  const pctOf = s => (gains ? (gains[s.party.id] ? gains[s.party.id].pct : null) : (s.invested > 0 ? s.pnlPct : null));
  const totalGain = gains && !at ? sumPeriodGains(model.included.map(s => gains[s.party.id])) : null;
  const totalValue = at
    ? model.included.reduce((a, s) => a + (valueOf(s) || 0), 0)
    : model.totals.value;
  const totalPnl = at
    ? model.included.reduce((a, s) => a + (pnlOf(s) || 0), 0)
    : totalGain ? totalGain.gain : model.totals.pnl;
  const totalPct = totalGain ? totalGain.pct : model.totals.pnlPct;

  const groups = psGroupOpen(model, grouped).map(g => {
    const inc = g.rows.filter(s => psIncluded(s.party));
    const value = inc.reduce((a, s) => a + (valueOf(s) || 0), 0);
    const pnl = inc.reduce((a, s) => a + (pnlOf(s) || 0), 0);
    const gsum = gains && !at ? sumPeriodGains(inc.map(s => gains[s.party.id])) : null;
    return { ...g, value, pnl, pct: gsum ? gsum.pct : null, share: totalValue > 0 ? value / totalValue * 100 : 0,
      rows: psSortSummaries(g.rows, sort, totalValue, at ? valueOf : null, at ? null : gains) };
  });
  const anyGoal = !compact && model.summaries.some(s => +s.party.goal > 0);

  const onSort = k => {
    const cur = prefs.positionsSort || { key: 'value', dir: 'desc' };
    const dir = cur.key === k ? (cur.dir === 'desc' ? 'asc' : 'desc') : (k === 'name' ? 'asc' : 'desc');
    app.setPrefs({ positionsSort: { key: k, dir } });
  };
  const toggleGroup = key => {
    const next = collapsed.has(key) ? [...collapsed].filter(k => k !== key) : [...collapsed, key];
    app.setPrefs({ collapsedGroups: next });
  };
  const open = id => app.navigate('/posities/' + encodeURIComponent(id));
  const onRowKey = (e, id) => {
    if (e.key === 'Enter') { e.preventDefault(); open(id); return; }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const rows = tbodyRef.current ? [...tbodyRef.current.parentNode.querySelectorAll('tr[data-ps-row]')] : [];
    const i = rows.indexOf(e.currentTarget);
    const next = rows[i + (e.key === 'ArrowDown' ? 1 : -1)];
    if (next) next.focus();
  };

  const today = todayIsoLocal();
  const colCount = compact ? 4 : (11 + (anyGoal ? 1 : 0));

  const renderRow = (s, opts = {}) => {
    const p = s.party;
    const id = p.id;
    const inc = psIncluded(p);
    const v = valueOf(s);
    const pn = pnlOf(s);
    const sp = psSpark(model, id, r);
    const closed = !!opts.closed;
    const cursorIdx = asOf != null && asOf >= r.i0 && asOf <= r.i1 ? asOf - r.i0 : null;
    const trend = sp ? <Sparkline values={sp.values} step={p.unit === 'bundle' || p.unit === 'eur'} endTone={sp.tone} cursorIndex={cursorIdx} /> : null;
    const pos = (
      <div className="ps-pos">
        <Monogram party={p} size={28} closed={closed} />
        <div className="ps-pos__text">
          <span className="ps-name">{p.name}{!compact && <PsBadges party={p} />}</span>
          {closed ? <span className="ps-sub">Gesloten · gerealiseerd {app.prefs.privacy ? '€ •••••' : fmtMoney(s.realizedPnl, { sign: true })}</span>
            : opts.empty ? <span className="ps-sub">Nog geen transacties</span>
            : <PsSubline s={s} spots={spots} />}
        </div>
      </div>
    );
    const common = {
      key: id, 'data-ps-row': '', 'data-testid': `holding-row-${id}`, tabIndex: 0,
      className: psCx('ps-row', (!inc || closed) && 'ps-row--muted'),
      onClick: () => open(id), onKeyDown: e => onRowKey(e, id),
    };
    if (compact) {
      return (
        <tr {...common}>
          <td>{pos}</td>
          <td>{trend}</td>
          <td className="num"><span className="ps-val">{v == null ? '—' : <PsMoney value={v} />}</span></td>
          <td className="num">
            {pn == null ? '—' : (
              <span className="ps-pnl">
                <span className={psCx('ps-val', psTone(pn))}><PsMoney value={pn} sign /></span>
                {!at && s.invested > 0 && <small className={psTone(pn)}>{fmtPct(s.pnlPct, { decimals: 1 })}</small>}
              </span>
            )}
          </td>
        </tr>
      );
    }
    const cg = cagrOf(s, today);
    const gp = goalProgress(s);
    const share = inc && totalValue > 0 && v != null ? v / totalValue * 100 : null;
    return (
      <tr {...common}>
        <td style={{ minWidth: 200 }}>{pos}</td>
        <td className="num ps-muted" style={{ whiteSpace: 'nowrap' }}>{holdingQtyText(s)}</td>
        <td className="num ps-muted" style={{ whiteSpace: 'nowrap', fontSize: 12.5 }}>{holdingPriceText(s, spots)}</td>
        <td className="num"><span className="ps-val">{v == null ? '—' : <PsMoney value={v} />}</span></td>
        <td className="num ps-muted">{share == null ? '—' : fmtPct(share, { decimals: 1, sign: false })}</td>
        <td className="num ps-muted"><PsMoney value={s.invested} /></td>
        <td className="num"><span className={psCx('ps-val', psTone(pn))}>{pn == null ? '—' : <PsMoney value={pn} sign />}</span></td>
        <td className={psCx('num', psTone(pn))}>{pctOf(s) != null ? fmtPct(pctOf(s), { decimals: 1 }) : '—'}</td>
        <td className="num" title={cg.pct == null ? 'minder dan 1 jaar historie' : `CAGR ${cg.years.toFixed(1).replace('.', ',')} j`}>
          {cg.pct == null ? <span className="ps-subtle">—</span> : <span className={psTone(cg.pct)}>{fmtPct(cg.pct, { decimals: 1 })} p.j.</span>}
        </td>
        {anyGoal && (
          <td className="num">
            {gp ? (
              <span className="ps-goal" title={gp.label}>
                <span className="ps-goal__track"><span className="ps-goal__fill" style={{ width: Math.min(100, gp.pct) + '%', display: 'block', background: partyColorOf(p) }} /></span>
                <small>{fmtPct(gp.pct, { decimals: 0, sign: false })}</small>
              </span>
            ) : <span className="ps-subtle">—</span>}
          </td>
        )}
        <td>{trend}</td>
        <td className="ps-subtle" style={{ width: 20 }}><Icon name="chevron-right" size={14} /></td>
      </tr>
    );
  };

  const groupRow = g => {
    if (!g.label) return null;
    const isOpen = asOf != null || !collapsed.has(g.key);
    const cells = compact ? (
      <>
        <td>
          <button type="button" className="ps-group__btn" aria-expanded={isOpen} onClick={() => toggleGroup(g.key)}>
            <Icon name="chevron-down" size={14} className="ps-chev" />
            <Swatch color={g.color} size={9} />
            {g.label} <span className="ps-group__share">{fmtPct(g.share, { decimals: 1, sign: false })}</span>
          </button>
        </td>
        <td><span className="ps-minibar"><span style={{ width: Math.min(100, g.share) + '%', background: g.color }} /></span></td>
        <td className="num"><span className="ps-val ps-muted"><PsMoney value={g.value} /></span></td>
        <td className="num"><span className={psCx('ps-val', psTone(g.pnl))}><PsMoney value={g.pnl} sign /></span></td>
      </>
    ) : (
      <>
        <td colSpan={3}>
          <button type="button" className="ps-group__btn" aria-expanded={isOpen} onClick={() => toggleGroup(g.key)}>
            <Icon name="chevron-down" size={14} className="ps-chev" />
            <Swatch color={g.color} size={9} />
            {g.label} <span className="ps-group__share">{fmtPct(g.share, { decimals: 1, sign: false })}</span>
          </button>
        </td>
        <td className="num"><span className="ps-val ps-muted"><PsMoney value={g.value} /></span></td>
        <td className="num ps-muted">{fmtPct(g.share, { decimals: 1, sign: false })}</td>
        <td />
        <td className="num"><span className={psCx('ps-val', psTone(g.pnl))}><PsMoney value={g.pnl} sign /></span></td>
        <td className={psCx('num', psTone(g.pnl))}>{gains && g.pct != null ? fmtPct(g.pct, { decimals: 1 }) : ''}</td>
        <td colSpan={colCount - 8} />
      </>
    );
    return <tr key={'g-' + g.key} className="ps-group">{cells}</tr>;
  };

  const closedList = psSortSummaries(model.closed, { key: 'name', dir: 'asc' }, totalValue);
  const closedPnl = model.closed.filter(s => psIncluded(s.party)).reduce((a, s) => a + (s.pnl || 0), 0);
  const fold = (label, count, isOpen, setOpen, extra) => (
    <tr className="ps-fold">
      <td colSpan={compact ? 2 : colCount - 3}>
        <button type="button" className="ps-fold__btn" aria-expanded={isOpen} onClick={() => setOpen(!isOpen)}>
          <Icon name="chevron-right" size={14} className="ps-chev" />
          {label} <span className="ps-subtle">{count}</span>
        </button>
      </td>
      <td className="num ps-muted" colSpan={compact ? 2 : 3} style={{ whiteSpace: 'nowrap', fontSize: 12.5 }}>{extra}</td>
    </tr>
  );

  const head = compact ? (
    <tr>
      <PsSortTh label="Positie" k="name" sort={sort} onSort={onSort} num={false} />
      <th scope="col" style={{ width: 92 }}>Trend {perLabel}</th>
      <PsSortTh style={{ width: at ? 118 : 88 }} label={at ? `Waarde op ${fmtDateShort(model.series.dates[asOf])}` : 'Waarde'} k="value" sort={sort} onSort={onSort} />
      <PsSortTh style={{ width: 96 }} label="Winst" k="pnl" sort={sort} onSort={onSort} />
    </tr>
  ) : (
    <tr>
      <PsSortTh label="Positie" k="name" sort={sort} onSort={onSort} num={false} />
      <th scope="col" className="num">Hoeveelheid</th>
      <th scope="col" className="num">Koers/waardering</th>
      <PsSortTh label="Waarde" k="value" sort={sort} onSort={onSort} />
      <PsSortTh label="Aandeel" k="share" sort={sort} onSort={onSort} />
      <th scope="col" className="num">Ingelegd</th>
      <PsSortTh label={psGainLabel(gk) + ' €'} k="pnl" sort={sort} onSort={onSort} />
      <PsSortTh label={psGainLabel(gk) + ' %'} k="pnlPct" sort={sort} onSort={onSort} />
      <PsSortTh label="Per jaar" k="cagr" sort={sort} onSort={onSort} />
      {anyGoal && <th scope="col" className="num">Doel</th>}
      <th scope="col">Trend {perLabel}</th>
      <th scope="col"><span className="sr-only">Openen</span></th>
    </tr>
  );

  const orphanCount = model.orphans.length;

  return (
    <div className={psCx('ps-ht', compact && 'ps-ht--compact', className)} style={style}>
      {at && <div className="ps-ht__asof">Waarden op {fmtDateLong(model.series.dates[asOf])}</div>}
      <div className="ps-ht__scroll" style={maxHeight ? { maxHeight } : undefined}>
        <table>
          <thead>{head}</thead>
          <tbody ref={tbodyRef}>
            {groups.map(g => {
              const isOpen = !g.label || asOf != null || !collapsed.has(g.key);
              return (
                <React.Fragment key={g.key}>
                  {groupRow(g)}
                  {isOpen && g.rows.map(s => renderRow(s))}
                </React.Fragment>
              );
            })}
            {!at && closedList.length > 0 && fold('Gesloten posities', closedList.length, closedOpen, setClosedOpen,
              <>gerealiseerd <span className={psTone(closedPnl)}><PsMoney value={closedPnl} sign /></span></>)}
            {!at && closedOpen && closedList.map(s => renderRow(s, { closed: true }))}
            {!at && !compact && model.empty.length > 0 && fold('Zonder transacties', model.empty.length, emptyOpen, setEmptyOpen, null)}
            {!at && !compact && emptyOpen && model.empty.map(s => renderRow(s, { empty: true }))}
            {!compact && orphanCount > 0 && (
              <tr className="ps-orphan">
                <td colSpan={colCount}>
                  <div className="ps-orphan__inner">
                    <Icon name="triangle-alert" size={14} className="ps-warnic" />
                    <span>Transacties zonder partij ({orphanCount})</span>
                    <button type="button" className="ps-link" style={{ marginLeft: 'auto' }}
                      onClick={() => app.navigate('/transacties?partij=__orphan')}>Bekijken <Icon name="arrow-right" size={12} /></button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr data-testid="holdings-total">
              {compact ? (
                <>
                  <td colSpan={2}><span className="ps-total-label">Totaal{at ? ` op ${fmtDateShort(model.series.dates[asOf])}` : ''}</span></td>
                  <td className="num"><span className="ps-val"><PsMoney value={totalValue} /></span></td>
                  <td className="num"><span className={psCx('ps-val', psTone(totalPnl))}><PsMoney value={totalPnl} sign /></span></td>
                </>
              ) : (
                <>
                  <td colSpan={3}>Totaal</td>
                  <td className="num"><span className="ps-val"><PsMoney value={totalValue} /></span></td>
                  <td className="num">100%</td>
                  <td className="num"><PsMoney value={model.totals.invested} /></td>
                  <td className="num"><span className={psCx('ps-val', psTone(totalPnl))}><PsMoney value={totalPnl} sign /></span></td>
                  <td className={psCx('num', psTone(totalPnl))}>{totalPct == null ? '—' : fmtPct(totalPct, { decimals: 1 })}</td>
                  <td colSpan={colCount - 8} />
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="ps-ht__note">
        <span>{gains
          ? `${psGainLabel(gk)}: ${(PS_GAIN_PERIODS.find(p => p.key === gk) || {}).context}, exclusief stortingen en opnames · % = simple Dietz`
          : 'Winst per positie is incl. gerealiseerd resultaat'}</span>
        {!compact && model.summaries.some(s => !psIncluded(s.party)) && <span>Partijen met 'niet in totaal' tellen niet mee in subtotalen en totaal.</span>}
      </div>
    </div>
  );
}

// ===================================================================
// HoldingsList (mobile)
// ===================================================================
function psSecondary(s, mode, totalValue, privacy, g) {
  const p = s.party;
  const inc = psIncluded(p);
  if (g !== undefined && (mode === 'pnl' || mode === 'pnlPct')) {
    if (!g) return <span className="ps-lrow__sec">—</span>;
    if (mode === 'pnlPct') return <span className={psCx('ps-lrow__sec', psTone(g.gain))}>{g.pct != null ? fmtPct(g.pct, { decimals: 1 }) : '—'}</span>;
    return <span className="ps-lrow__sec"><Delta value={g.gain} pct={g.pct} size="sm" /></span>;
  }
  switch (mode) {
    case 'value': return <span className="ps-lrow__sec">{inc && totalValue > 0 ? fmtPct(s.currentValueEur / totalValue * 100, { decimals: 1, sign: false }) + ' aandeel' : 'niet in totaal'}</span>;
    case 'qty': return <span className="ps-lrow__sec">{holdingQtyText(s)}</span>;
    case 'invested': return <span className="ps-lrow__sec">Ingelegd {privacy ? '€ •••••' : fmtMoney(s.invested)}</span>;
    case 'cagr': {
      const c = cagrOf(s);
      return <span className={psCx('ps-lrow__sec', c.pct != null && psTone(c.pct))}>{c.pct == null ? '—' : fmtPct(c.pct, { decimals: 1 }) + ' p.j.'}</span>;
    }
    case 'pnlPct': return <span className={psCx('ps-lrow__sec', psTone(s.pnl))}>{s.invested > 0 ? fmtPct(s.pnlPct, { decimals: 1 }) : '—'}</span>;
    default:
      return <span className="ps-lrow__sec"><Delta value={s.pnl} pct={s.invested > 0 ? s.pnlPct : null} size="sm" /></span>;
  }
}

function PsListRow({ app, s, closed = false, empty = false, totalValue, mode, gain }) {
  const p = s.party;
  const privacy = !!app.prefs.privacy;
  const inc = psIncluded(p);
  return (
    <button type="button" className={psCx('ps-lrow', (!inc || closed) && 'ps-lrow--muted')} data-testid={`holding-row-${p.id}`}
      onClick={() => app.navigate('/posities/' + encodeURIComponent(p.id))}>
      <Monogram party={p} size={40} closed={closed} />
      <span className="ps-lrow__main">
        <span className="ps-lrow__name">{p.name}{!inc && <span className="ps-badge">niet in totaal</span>}</span>
        {closed ? <span className="ps-lrow__sub">Gesloten</span>
          : empty ? <span className="ps-lrow__sub">Nog geen transacties</span>
          : <PsSubline s={s} spots={app.spots} />}
      </span>
      <span className="ps-lrow__end">
        <span className="ps-lrow__val"><Money value={s.currentValueEur} /></span>
        {closed ? <span className={psCx('ps-lrow__sec', psTone(s.pnl))}>{privacy ? '€ •••••' : fmtMoney(s.pnl, { sign: true })}</span>
          : empty ? <span className="ps-lrow__sec">—</span>
          : psSecondary(s, mode, totalValue, privacy, gain)}
      </span>
    </button>
  );
}

function HoldingsList({ app, variant = 'overview' }) {
  const { model, prefs } = app;
  const page = variant === 'page';
  const grouped = !page || prefs.positionsGrouping !== 'none';
  const sort = page ? (prefs.positionsSort || { key: 'value', dir: 'desc' }) : { key: 'value', dir: 'desc' };
  const mode = prefs.positionsSecondary || 'pnl';
  const totalValue = model.totals.value;
  const gk = page ? psGainKey(model, prefs) : 'ALL';
  const gains = useMemo(() => (gk === 'ALL' ? null : psGainMap(model, gk)), [model, gk]);
  const gainOf = s => (gains ? (gains[s.party.id] || null) : undefined);
  const [closedOpen, setClosedOpen] = useState(false);
  const [emptyOpen, setEmptyOpen] = useState(false);
  const collapsed = new Set(prefs.collapsedGroups || []);
  const groups = psGroupOpen(model, grouped).map(g => {
    const inc = g.rows.filter(s => psIncluded(s.party));
    const value = inc.reduce((a, s) => a + (s.currentValueEur || 0), 0);
    const gsum = gains ? sumPeriodGains(inc.map(s => gains[s.party.id])) : null;
    return { ...g, value, gsum, share: totalValue > 0 ? value / totalValue * 100 : 0, rows: psSortSummaries(g.rows, sort, totalValue, null, gains) };
  });
  const toggleGroup = key => {
    const next = collapsed.has(key) ? [...collapsed].filter(k => k !== key) : [...collapsed, key];
    app.setPrefs({ collapsedGroups: next });
  };
  const closedPnl = model.closed.filter(s => psIncluded(s.party)).reduce((a, s) => a + (s.pnl || 0), 0);
  const privacy = !!prefs.privacy;
  return (
    <div className="ps-list">
      {groups.map(g => {
        const isOpen = !g.label || !collapsed.has(g.key);
        return (
          <React.Fragment key={g.key}>
            {g.label && (
              <button type="button" className="ps-lgroup" aria-expanded={isOpen} onClick={() => toggleGroup(g.key)}>
                <Swatch color={g.color} size={10} />
                <span className="ps-lgroup__label">{g.label}</span>
                <span className="num">{g.share > 0 && g.share < 0.1 ? '<0,1%' : fmtPct(g.share, { decimals: 1, sign: false })}</span>
                {g.gsum && <span className={psCx('ps-lgroup__gain', psTone(g.gsum.gain))}>{privacy ? '€ •••••' : fmtMoney(g.gsum.gain, { sign: true })}</span>}
                <span className="ps-lgroup__val"><Money value={g.value} /></span>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} style={{ color: 'var(--fg-subtle)' }} />
              </button>
            )}
            {isOpen && g.rows.map(s => <PsListRow key={s.party.id} app={app} s={s} totalValue={totalValue} mode={mode} gain={gainOf(s)} />)}
          </React.Fragment>
        );
      })}
      {model.closed.length > 0 && (
        <button type="button" className="ps-lfold" aria-expanded={closedOpen} onClick={() => setClosedOpen(!closedOpen)}>
          <span className="monogram monogram--40 monogram--closed" aria-hidden="true"><Icon name="layers" size={16} /></span>
          <span className="ps-lfold__main">
            <span className="ps-lfold__title">Gesloten posities</span>
            <span className="ps-lfold__sub">{model.closed.length} partijen · gerealiseerd <span className={psTone(closedPnl)}>{privacy ? '€ •••••' : fmtMoney(closedPnl, { sign: true })}</span></span>
          </span>
          <Icon name={closedOpen ? 'chevron-up' : 'chevron-down'} size={16} style={{ color: 'var(--fg-subtle)' }} />
        </button>
      )}
      {closedOpen && model.closed.map(s => <PsListRow key={s.party.id} app={app} s={s} closed totalValue={totalValue} mode={mode} />)}
      {page && model.empty.length > 0 && (
        <button type="button" className="ps-lfold" aria-expanded={emptyOpen} onClick={() => setEmptyOpen(!emptyOpen)}>
          <span className="ps-lfold__main">
            <span className="ps-lfold__title">Zonder transacties</span>
            <span className="ps-lfold__sub">{model.empty.length} partij(en)</span>
          </span>
          <Icon name={emptyOpen ? 'chevron-up' : 'chevron-down'} size={16} style={{ color: 'var(--fg-subtle)' }} />
        </button>
      )}
      {page && emptyOpen && model.empty.map(s => <PsListRow key={s.party.id} app={app} s={s} empty totalValue={totalValue} mode={mode} />)}
      {page && model.orphans.length > 0 && (
        <button type="button" className="ps-lfold" onClick={() => app.navigate('/transacties?partij=__orphan')}>
          <Icon name="triangle-alert" size={18} style={{ color: 'var(--warn)' }} />
          <span className="ps-lfold__main">
            <span className="ps-lfold__title">Transacties zonder partij</span>
            <span className="ps-lfold__sub">{model.orphans.length} transactie(s) · Bekijken</span>
          </span>
          <Icon name="chevron-right" size={16} style={{ color: 'var(--fg-subtle)' }} />
        </button>
      )}
      <div className="ps-lnote">{gains
        ? `${psGainLabel(gk)} (${(PS_GAIN_PERIODS.find(p => p.key === gk) || {}).context}) is exclusief stortingen en opnames.`
        : 'Winst per positie is inclusief gerealiseerde winst.'}</div>
    </div>
  );
}

// ===================================================================
// PartyPanel
// ===================================================================
function psUnitPrice(v, unit) {
  if (v == null || !Number.isFinite(+v)) return '—';
  return fmtMoney(+v, { decimals: +v >= 1000 ? 0 : 2 }) + (unit ? '/' + unit : '');
}

function PsHoldingStrip({ s, spots }) {
  const p = s.party;
  const items = [];
  const add = (k, v) => items.push(<span key={k}>{k} <b>{v}</b></span>);
  switch (p.unit) {
    case 'gram':
    case 'ounce': {
      const u = p.unit === 'gram' ? 'g' : 'oz';
      add('Bezit', holdingQtyText(s));
      add('Spot', psUnitPrice(s.currentUnitPrice ?? (u === 'g' ? spots.goldSpotEurPerGram : spots.silverSpotEurPerOunce), u));
      if (s.avgCost != null) add('Gem. aankoop', psUnitPrice(s.avgCost, u));
      break;
    }
    case 'crypto':
      add('Bezit', fmtQty(s.quantity || 0, p.unitLabel, { decimals: 8 }));
      add('Koers', psUnitPrice(s.currentUnitPrice, ''));
      if (s.avgCost != null) add('Gem. aankoop', psUnitPrice(s.avgCost, ''));
      break;
    case 'mixed':
      add('Goud', fmtQty(s.goldQty || 0, 'g', { decimals: 2 }));
      add('Zilver', fmtQty(s.silverQty || 0, 'oz', { decimals: 2 }));
      add('Spot goud', psUnitPrice(spots.goldSpotEurPerGram, 'g'));
      add('Spot zilver', psUnitPrice(spots.silverSpotEurPerOunce, 'oz'));
      break;
    case 'part':
      add('Aantal', holdingQtyText(s));
      add('Koers', holdingPriceText(s, spots));
      if (s.avgCost != null) add('Gem. aankoop', fmtMoney(s.avgCost, { decimals: 2 }));
      break;
    default:
      add('Laatste waardering', holdingPriceText(s, spots));
  }
  return <div className="ps-strip">{items}</div>;
}

// Per-coin uitsplitsing van een crypto-post (Finst / Wallet), incl. on-chain status voor self-custody.
function PsPostCoins({ app, s }) {
  const privacy = !!(app.prefs && app.prefs.privacy);
  const leaves = s.leaves || [];
  if (!leaves.length) return null;
  const cb = app.chainBalances || {};
  return (
    <div>
      <div className="ps-sec-head" style={{ marginBottom: 8 }}><h3 className="ps-sec-title">Per coin</h3></div>
      <div className="ps-coins" data-testid="post-coins">
        {leaves.map(l => {
          const p = l.party;
          const coin = p.unitLabel || p.coin;
          const meta = CRYPTO_COIN_BY_KEY[p.coin] || {};
          const chain = p.address ? cb[p.id] : null;
          const onChain = l.bookedQuantity != null;
          const diff = onChain ? (+l.quantity || 0) - (+l.bookedQuantity || 0) : 0;
          return (
            <div className="ps-coin" key={p.id} data-testid={'post-coin-' + p.id}>
              <Monogram party={p} size={32} />
              <div style={{ minWidth: 0 }}>
                <div className="ps-coin__name">{meta.label || p.name}</div>
                <div className="ps-coin__sub">{fmtQty(+l.quantity || 0, coin, { decimals: 8 })} · {psUnitPrice(l.currentUnitPrice, '')}</div>
              </div>
              <div className="ps-coin__end">
                <span className="ps-coin__val"><Money value={l.currentValueEur || 0} /></span>
                <span className={psTone(l.pnl)} style={{ fontSize: 12.5 }}>{privacy ? '€ •••••' : fmtMoney(l.pnl || 0, { sign: true })}</span>
              </div>
              {p.address && (
                <div className="ps-coin__chain">
                  {chain && chain.checkedAt
                    ? <span><Icon name="link" size={12} /> On-chain · gecontroleerd {fmtRelDay(chain.checkedAt.slice(0, 10))} {fmtTime(chain.checkedAt)}</span>
                    : <span><Icon name="link" size={12} /> On-chain · nog niet opgehaald</span>}
                  {chain && chain.error && <span className="ps-coin__warn"><Icon name="circle-alert" size={12} />{chain.error}{chain.checkedAt ? ' (laatste saldo getoond)' : ''}</span>}
                  {onChain && Math.abs(diff) > 1e-9 && (
                    <span className="ps-coin__warn" title="Het on-chain saldo is leidend voor het aantal; boek ontbrekende overboekingen of kosten om de kostprijs te laten kloppen.">
                      <Icon name="triangle-alert" size={12} />Verschil met boekingen {diff > 0 ? '+' : '−'}{fmtQty(Math.abs(diff), coin, { decimals: 8 })}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PsPartyBody({ app, s }) {
  const { model, prefs, spots } = app;
  const p = s.party;
  const id = p.id;
  const privacy = !!prefs.privacy;
  const inc = psIncluded(p);
  const dates = model.series.dates;
  const r = psRange(dates, prefs.period);
  const byP = model.series.byParty[id];
  const netP = model.series.netByParty[id];
  const [cursor, setCursor] = useState(null);
  const [allTx, setAllTx] = useState(false);
  const chartDates = r.i1 >= 0 ? dates.slice(r.i0, r.i1 + 1) : [];
  const primary = byP && r.i1 >= 0 ? byP.slice(r.i0, r.i1 + 1) : [];
  const secondary = netP && r.i1 >= 0 ? netP.slice(r.i0, r.i1 + 1) : null;
  const hasChart = primary.length >= 2 && primary.some(v => Math.abs(v) > 0.5);
  const cg = cagrOf(s);
  const gp = goalProgress(s);
  // s.transactions bevat ook inkomende overboekingen en, bij een crypto-post, de boekingen van alle coins.
  const txs = useMemo(() => (s.transactions || [])
    .slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')), [s.transactions]);
  const ci = cursor != null && cursor < chartDates.length ? cursor : null;
  const shown = ci != null ? primary[ci] : s.currentValueEur;
  const shownNet = ci != null && secondary ? secondary[ci] : (s.costBasis - s.realizedPnl);
  const isT212 = id === 'trading212';

  return (
    <div className="ps-panel">
      <div>
        {ci != null && <div className="ps-meta">Waarde op {fmtDateLong(chartDates[ci])}</div>}
        <div className="ps-pvalue"><Money value={shown} /></div>
        <div className="ps-pdelta">
          {ci == null
            ? <><Delta value={s.pnl} pct={s.invested > 0 ? s.pnlPct : null} size="md" />
                <span>winst sinds start · gerealiseerd {privacy ? '€ •••••' : fmtMoney(s.realizedPnl)}</span></>
            : <><Delta value={shown - shownNet} size="md" /><span>winst op die datum</span></>}
        </div>
      </div>
      {!s.external && (
        <dl className="ps-pgains" data-testid="party-period-gains">
          {[['1D', 'Vandaag'], ['1W', 'Week'], ['1M', 'Maand'], ['1J', 'Jaar']].map(([k, lbl]) => {
            const g = partyPeriodGain(model, s, k);
            const ctx = (PS_GAIN_PERIODS.find(x => x.key === k) || {}).context;
            return (
              <div key={k} title={`Winst ${ctx}, exclusief stortingen en opnames`}>
                <dt>{lbl}</dt>
                <dd className={g ? psTone(g.gain) : 'ps-subtle'}>{!g ? '—' : privacy ? '€ •••••' : fmtMoney(g.gain, { sign: true })}
                  <small>{g && g.pct != null ? fmtPct(g.pct, { decimals: 1 }) : '—'}</small></dd>
              </div>
            );
          })}
        </dl>
      )}
      {hasChart && (
        <div className="ps-chartbox">
          <Segmented size="sm" pill={app.isMobile} full={app.isMobile} ariaLabel="Periode" value={r.key} onChange={k => app.setPrefs({ period: k })}
            options={psPeriodOptions(dates).map(o => ({ ...o, testId: undefined }))} />
          <PerformanceChart dates={chartDates} primary={primary} secondary={secondary} height={140}
            cursor={ci} onCursor={i => setCursor(i)} privacy={privacy} liveDot="static" tableTwin={false}
            ariaLabel={`Waardeverloop ${p.name}`}
            valueText={i => `${fmtDateLong(chartDates[i])}: ${privacy ? 'bedrag verborgen' : fmtMoney(primary[i])}`} />
        </div>
      )}
      <dl className="ps-kgrid">
        <div><dt>Ingelegd</dt><dd><Money value={s.invested} /></dd></div>
        <div><dt>Aandeel</dt><dd className="num">{inc && model.totals.value > 0 ? fmtPct(s.currentValueEur / model.totals.value * 100, { decimals: 1, sign: false }) : '—'}</dd></div>
        <div><dt>Netto ingelegd</dt><dd><Money value={s.costBasis - s.realizedPnl} /></dd></div>
        <div title={cg.pct == null ? 'minder dan 1 jaar historie' : undefined}><dt>Rendement p.j.</dt>
          <dd className={cg.pct != null ? psTone(cg.pct) : 'ps-subtle'}>{cg.pct == null ? '—' : fmtPct(cg.pct, { decimals: 1 })}</dd></div>
        <div><dt>Kosten betaald</dt><dd><Money value={s.totalFees || 0} /></dd></div>
        {isT212
          ? <div><dt>Via cashback</dt><dd><Money value={s.totalCashback || 0} /></dd></div>
          : <div><dt>Dividend en rente</dt><dd><Money value={s.totalIncome || 0} /></dd></div>}
      </dl>
      {p.unit === 'post' ? <PsPostCoins app={app} s={s} /> : (s.transactions.length > 0 && <PsHoldingStrip s={s} spots={spots} />)}
      {gp && (
        <div className="ps-pgoal">
          <div className="ps-pgoal__row"><span>Doel</span><span className="num">{fmtPct(gp.pct, { decimals: 0, sign: false })} · {privacy && !['gram', 'ounce'].includes(p.unit) ? '€ •••••' : gp.label}</span></div>
          <div className="ps-pgoal__track"><div className="ps-pgoal__fill" style={{ width: Math.min(100, gp.pct) + '%', background: partyColorOf(p) }} /></div>
        </div>
      )}
      <PsUnderlying party={p} value={s.currentValueEur} privacy={privacy} />
      {s.external && s.external.history && s.external.history.length > 0 && <PsFinHistory points={s.external.history} privacy={privacy} />}
      <div>
        <div className="ps-sec-head">
          <h3 className="ps-sec-title">Transacties ({txs.length})</h3>
          <button type="button" className="ps-link" onClick={() => app.navigate('/transacties?partij=' + encodeURIComponent(id))}>
            Alle in Transacties <Icon name="arrow-right" size={12} />
          </button>
        </div>
        {txs.length === 0
          ? <EmptyState icon="receipt" title="Nog geen transacties" body="Voeg een inleg, koop of waardering toe."
              action={{ label: 'Transactie toevoegen', onClick: () => app.openTx({ party: id }) }} />
          : (window.TxList ? <TxList app={app} txs={txs} variant="party" showParty={p.unit === 'post'} limit={allTx ? undefined : 12} /> : null)}
        {txs.length > 12 && !allTx && (
          <Button variant="ghost" full onClick={() => setAllTx(true)} style={{ marginTop: 8 }}>Toon alle {txs.length} transacties</Button>
        )}
      </div>
    </div>
  );
}

// Dagwaarden van Vrij op rekening (laatste 14 registraties, nieuwste eerst) met verschil t.o.v. de vorige.
function PsFinHistory({ points, privacy }) {
  const rows = points.map((pt, i) => ({ date: pt[0], v: pt[1], d: i > 0 ? pt[1] - points[i - 1][1] : null })).reverse().slice(0, 14);
  return (
    <section data-testid="party-fin-history">
      <div className="ps-sec-head"><h3 className="ps-sec-title">Dagwaarden</h3><span className="ps-subtle" style={{ fontSize: 12 }}>{points.length} dagen vastgelegd</span></div>
      <ul className="ps-und__list">
        {rows.map(r => (
          <li key={r.date} className="ps-und__row" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
            <span className="ps-und__name">{fmtDateLong(r.date)}</span>
            <span className="ps-und__end">
              <span className={'ps-und__w num ' + (r.d == null || Math.abs(r.d) < 0.005 ? 'ps-subtle' : psTone(r.d))} style={{ fontWeight: 400 }}>
                {r.d == null || Math.abs(r.d) < 0.005 ? '—' : (privacy ? UI_MASK : (r.d > 0 ? '+' : '−') + fmtMoney(Math.abs(r.d)))}
              </span>
              <span className="ps-und__val num">{privacy ? UI_MASK : fmtMoney(r.v)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Look-through: verdeling van een fonds over zijn onderliggende fondsen (zie underlyingOf in data.jsx).
function PsUnderlying({ party, value, privacy }) {
  const u = underlyingOf(party);
  if (!u) return null;
  const funds = u.funds;
  const sum = funds.reduce((a, f) => a + (f.weight || 0), 0) || 100;
  const v = Number.isFinite(value) ? value : 0;
  const pct1 = n => fmtPct(n, { decimals: 1, sign: false });
  const reg = u.regions && Array.isArray(u.regions.items) && u.regions.items.length ? u.regions : null;
  const src = (s, asOf) => s ? (
    <>Bron: {s.publisher ? s.publisher + ', ' : ''}{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a> : s.label}{asOf ? `, peildatum ${fmtDateLong(asOf)}` : ''}</>
  ) : null;
  return (
    <section className="ps-und" aria-labelledby={'und-' + party.id} data-testid="party-underlying">
      <div className="ps-sec-head">
        <h3 className="ps-sec-title" id={'und-' + party.id}>Onderliggende fondsen</h3>
        {u.targetNote && <span className="ps-subtle" style={{ fontSize: 12 }}>{u.targetNote}</span>}
      </div>
      <div className="ps-und__bar" role="img"
        aria-label={funds.map(f => `${f.short || f.name} ${pct1(f.weight)}`).join(', ')}>
        {funds.map(f => <span key={f.name} style={{ width: (f.weight / sum * 100) + '%', background: f.color || 'var(--fg-subtle)' }} />)}
      </div>
      <ul className="ps-und__list">
        {funds.map(f => (
          <li key={f.name} className="ps-und__row">
            <span className="ps-und__dot" style={{ background: f.color || 'var(--fg-subtle)' }} aria-hidden="true" />
            <span className="ps-und__name">{f.short || f.name}</span>
            <span className="ps-und__end">
              <span className="ps-und__w num">
                {pct1(f.weight)}
                {f.target != null && <span className="ps-subtle" style={{ fontWeight: 400 }}> · doel {pct1(f.target)}</span>}
              </span>
              <span className="ps-und__val num">{privacy ? UI_MASK : fmtMoney(v * f.weight / sum)}</span>
            </span>
            {f.short && <span className="ps-und__full">{f.name}{f.isin ? ` · ${f.isin}` : ''}</span>}
          </li>
        ))}
      </ul>
      <div className="ps-und__src">{src(u.source, u.asOf)}</div>
      {reg && (
        <>
          <div className="ps-und__sub"><span>{reg.title || 'Regio’s'}</span>{reg.note && <span>{reg.note}</span>}</div>
          <div className="ps-und__reg">
            {reg.items.map(r => (
              <React.Fragment key={r.label}>
                <span>{r.label}</span>
                <span className="ps-pgoal__track"><span className="ps-pgoal__fill" style={{ display: 'block', width: Math.min(100, r.weight) + '%', background: 'var(--fg-subtle)' }} /></span>
                <span className="num">{pct1(r.weight)}</span>
              </React.Fragment>
            ))}
          </div>
          <div className="ps-und__src">{src(reg.source, reg.asOf)}</div>
        </>
      )}
    </section>
  );
}

function PsPanelTitle({ app, party }) {
  return (
    <span className="ps-ptitle">
      <Monogram party={party} size={32} />
      <span className="ps-ptitle__name">{party.name}</span>
    </span>
  );
}

function psPanelSubtitle(s, spots) {
  const p = s.party;
  const cls = ASSET_CLASS_BY_KEY[assetClassOf(p)];
  const parts = [p.category || cls.label];
  const sub = holdingSubline(s, spots);
  if (s.transactions.length || s.external) parts.push(sub.staleDays != null ? `waardering ${sub.staleDays} dagen oud` : sub.text);
  if (!psIncluded(p)) parts.push('niet in totaal');
  if (!psInChart(p)) parts.push('niet in grafiek');
  return parts.join(' · ');
}

function PsPanelMenu({ app, party }) {
  return (
    <Menu triggerLabel="Meer acties voor partij" items={[
      { label: 'Partij bewerken', icon: 'pencil', onClick: () => app.openPartyForm(party) },
      { label: 'Partij verwijderen', icon: 'trash-2', danger: true, onClick: () => app.openPartyForm(party, { startInDelete: true }) },
    ]} />
  );
}

function PartyPanel({ app, partyId, onClose, asPage = false }) {
  const s = app.model.byId[partyId];
  const close = onClose || (() => app.navigate('/posities'));
  const isPost = !!(s && s.party.unit === 'post');
  const footer = s ? (
    <div className="ps-pfoot">
      {isPost
        ? <Button variant="secondary" icon="arrow-left-right" onClick={() => app.openTx({ party: partyId, type: 'overboeking' })}>Overboeking</Button>
        : <Button variant="secondary" icon="diamond" onClick={() => app.openTx({ party: partyId, type: 'waardering' })}>Waarde bijwerken</Button>}
      <Button variant="primary" icon="plus" onClick={() => app.openTx({ party: partyId })}>Transactie</Button>
    </div>
  ) : null;
  const missing = (
    <EmptyState icon="circle-alert" title="Deze partij bestaat niet (meer)"
      action={{ label: 'Naar Posities', onClick: () => app.navigate('/posities') }} />
  );
  if (asPage) {
    return (
      <div className="ps-pagewrap" data-testid="party-panel">
        <div className="ps-pagehead">
          <IconButton icon="chevron-left" label="Terug naar Posities" onClick={close} />
          <div className="ps-pagehead__title">
            {s && <h1><PsPanelTitle app={app} party={s.party} /></h1>}
          </div>
          {s && <PsPanelMenu app={app} party={s.party} />}
        </div>
        {s ? (
          <>
            <div className="ps-meta">{psPanelSubtitle(s, app.spots)}</div>
            <PsPartyBody app={app} s={s} />
            {footer}
          </>
        ) : missing}
      </div>
    );
  }
  return (
    <Sheet open onClose={close} width={480} testId="party-panel"
      title={s ? <span className="ps-ptitle"><PsPanelTitle app={app} party={s.party} /><span style={{ marginLeft: 'auto' }}><PsPanelMenu app={app} party={s.party} /></span></span> : 'Partij'}
      subtitle={s ? psPanelSubtitle(s, app.spots) : null}
      footer={footer}>
      {s ? <PsPartyBody app={app} s={s} /> : missing}
    </Sheet>
  );
}

// ===================================================================
// PartyForm
// ===================================================================
const PS_SPOT_KEYS = [
  { value: 'btcSpotEur', label: 'Bitcoin (btcSpotEur)' },
  { value: 'ethSpotEur', label: 'Ethereum (ethSpotEur)' },
  { value: 'paxgSpotEur', label: 'Pax Gold (paxgSpotEur)' },
  { value: '', label: 'Geen' },
];

function psBlankForm(p) {
  const unit = p ? (p.isMixed ? 'mixed' : (p.unit || 'bundle')) : 'bundle';
  const opt = PARTY_UNIT_OPTIONS.find(o => o.value === unit);
  return {
    name: p?.name || '',
    subtitle: p?.subtitle || '',
    category: p?.category || 'Overig',
    customCategory: '',
    unit,
    unitLabel: p?.unitLabel || opt?.unitLabel || '€',
    goal: p?.goal ? String(p.goal).replace('.', ',') : '',
    color: p?.color || COLOR_PRESETS[0],
    useOwnColor: p?.useOwnColor === true,
    spotKey: p?.spotKey || '',
    includeInTotal: (p?.includeInTotal ?? p?.includeInPortfolio) !== false,
    includeInTimeChart: (p?.includeInTimeChart ?? p?.includeInPortfolio) !== false,
  };
}

function PartyForm({ app, open, party = null, startInDelete = false, onClose }) {
  const [form, setForm] = useState(() => psBlankForm(party));
  const [confirmDel, setConfirmDel] = useState(!!startInDelete);
  const [alsoDelTx, setAlsoDelTx] = useState(false);
  const [touched, setTouched] = useState(false);
  const nameRef = useRef(null);
  useEffect(() => {
    if (open) { setForm(psBlankForm(party)); setConfirmDel(!!startInDelete && !!party); setAlsoDelTx(false); setTouched(false); }
  }, [open, party, startInDelete]);
  const parties = (app && app.model && app.model.parties) || [];
  const categoryOptions = useMemo(() => {
    const seen = new Set();
    return [...CATEGORY_OPTIONS, ...parties.map(p => p.category), party?.category]
      .filter(Boolean).filter(c => (seen.has(c) ? false : (seen.add(c), true)));
  }, [parties, party]);
  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const selectedCategory = categoryOptions.includes(form.category) ? form.category : CUSTOM_CATEGORY_VALUE;
  const finalCategory = (selectedCategory === CUSTOM_CATEGORY_VALUE ? (form.customCategory || '') : form.category).trim();
  const cls = ASSET_CLASS_BY_KEY[assetClassOf({ category: finalCategory })];
  const nameOk = form.name.trim().length > 0;
  const valid = nameOk && finalCategory.length > 0;
  const isPost = !!(party && party.unit === 'post');
  const ownIds = party ? new Set([party.id, ...((app.model && app.model.leavesByPost && app.model.leavesByPost[party.id]) || []).map(l => l.id)]) : new Set();
  const txCount = party ? app.state.transactions.filter(t => ownIds.has(t.party)).length : 0;

  const setUnit = value => {
    const opt = PARTY_UNIT_OPTIONS.find(o => o.value === value);
    setForm(f => ({ ...f, unit: value, unitLabel: (value === 'crypto' && f.unit === 'crypto') ? f.unitLabel : (opt?.unitLabel || f.unitLabel || '€'), spotKey: value === 'crypto' ? f.spotKey : '' }));
  };
  const submit = () => {
    setTouched(true);
    if (!valid) { if (nameRef.current) nameRef.current.focus(); return; }
    const goal = parseNlNumber(form.goal);
    const p = {
      ...(party || {}),
      id: party?.id || 'custom_' + Date.now().toString(36),
      name: form.name.trim(),
      subtitle: form.subtitle.trim(),
      category: finalCategory,
      unit: form.unit,
      unitLabel: form.unitLabel || '€',
      goal: goal > 0 ? goal : 0,
      color: form.color,
      useOwnColor: !!form.useOwnColor,
      includeInTotal: form.includeInTotal !== false,
      includeInTimeChart: form.includeInTimeChart !== false,
      isMixed: form.unit === 'mixed',
    };
    delete p.includeInPortfolio;
    if (form.unit === 'crypto' && form.spotKey) p.spotKey = form.spotKey; else delete p.spotKey;
    if (isPost) { p.unit = 'post'; p.unitLabel = party.unitLabel || '€'; p.isMixed = false; }
    app.saveParty(p);
    onClose && onClose();
  };
  const doDelete = () => {
    app.deleteParty(party.id, { deleteTransactions: txCount > 0 && alsoDelTx });
    onClose && onClose();
  };

  const footer = confirmDel ? null : (
    <div className="ps-formfoot">
      <Button variant="ghost" onClick={onClose}>Annuleren</Button>
      <Button variant="primary" disabled={!valid} onClick={submit}>{party ? 'Opslaan' : 'Toevoegen'}</Button>
    </div>
  );

  return (
    <Sheet open onClose={onClose} testId="party-form" width={480} initialFocusRef={confirmDel ? undefined : nameRef}
      title={party ? 'Partij bewerken' : 'Partij toevoegen'}
      subtitle={party ? party.name : 'Maak een eigen beleggingscategorie aan.'}
      footer={footer}>
      {confirmDel && party ? (
        <div className="ps-del" role="group" aria-labelledby="ps-del-title">
          <div className="ps-del__title" id="ps-del-title">Partij "{party.name}" definitief verwijderen?</div>
          {txCount > 0
            ? <div>Deze partij heeft <b>{txCount}</b> transactie(s). Standaard blijven die bestaan en verschijnen ze onder 'Transacties zonder partij'.</div>
            : <div>Er zijn geen transacties aan deze partij gekoppeld.</div>}
          {txCount > 0 && (
            <label className="ps-del__check">
              <input type="checkbox" checked={alsoDelTx} onChange={e => setAlsoDelTx(e.target.checked)} />
              <span>Verwijder óók de {txCount} transactie(s) (gesynct naar Supabase).</span>
            </label>
          )}
          <div className="ps-del__actions">
            <Button variant="secondary" onClick={() => (startInDelete ? onClose() : setConfirmDel(false))}>Terug</Button>
            <Button variant="danger" icon="trash-2" onClick={doDelete} data-testid="party-delete-confirm">Definitief verwijderen</Button>
          </div>
        </div>
      ) : (
        <form className="ps-form" onSubmit={e => { e.preventDefault(); submit(); }}>
          <Field label="Naam" htmlFor="ps-f-name" error={touched && !nameOk ? 'Vul een naam in' : undefined}>
            <input id="ps-f-name" ref={nameRef} className="input" value={form.name} onChange={e => set('name', e.target.value)}
              aria-describedby={touched && !nameOk ? 'ps-f-name-err' : undefined} aria-invalid={(touched && !nameOk) || undefined}
              onBlur={() => setTouched(true)} autoComplete="off" />
          </Field>
          <Field label="Omschrijving (optioneel)" htmlFor="ps-f-sub">
            <Input id="ps-f-sub" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} autoComplete="off" />
          </Field>
          <Field label="Categorie" htmlFor="ps-f-cat">
            <Select id="ps-f-cat" value={selectedCategory}
              onChange={e => { const v = e.target.value; setForm(f => ({ ...f, category: v === CUSTOM_CATEGORY_VALUE ? '' : v, customCategory: v === CUSTOM_CATEGORY_VALUE ? f.customCategory : '' })); }}>
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              <option value={CUSTOM_CATEGORY_VALUE}>Nieuwe allocatie…</option>
            </Select>
            <div className="ps-classline">Wordt getoond als: <Swatch color={cls.color} size={9} /> {cls.label}</div>
          </Field>
          {selectedCategory === CUSTOM_CATEGORY_VALUE && (
            <Field label="Nieuwe allocatie" htmlFor="ps-f-newcat" hint="Deze naam blijft daarna beschikbaar als allocatie.">
              <Input id="ps-f-newcat" value={form.customCategory} onChange={e => set('customCategory', e.target.value)} aria-describedby="ps-f-newcat-hint" autoComplete="off" />
            </Field>
          )}
          {isPost ? (
            <p className="ps-classline" style={{ margin: 0 }}>Crypto-post: waarde = som van de coins (BTC, ETH) × live koers.{party.selfCustody ? ' Publieke adressen stel je in bij Instellingen → Wallet.' : ''}</p>
          ) : (<>
          <Field label="Waarderingsmethode" htmlFor="ps-f-unit">
            <Select id="ps-f-unit" value={form.unit} onChange={e => setUnit(e.target.value)}>
              {PARTY_UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Field>
          {form.unit === 'crypto' && (
            <Field label="Spot-prijs sleutel" htmlFor="ps-f-spot">
              <Select id="ps-f-spot" value={form.spotKey} onChange={e => set('spotKey', e.target.value)}>
                {PS_SPOT_KEYS.map(o => <option key={o.value || 'none'} value={o.value}>{o.label}</option>)}
              </Select>
            </Field>
          )}
          </>)}
          <div className="ps-form__row">
            {!isPost && (
            <Field label="Eenheid label" htmlFor="ps-f-ul">
              <Input id="ps-f-ul" value={form.unitLabel} onChange={e => set('unitLabel', e.target.value)} autoComplete="off" />
            </Field>
            )}
            <Field label="Doel (€ of eenheden)" htmlFor="ps-f-goal" hint="€ voor waarde-partijen, gram/ounce voor metaal">
              <Input id="ps-f-goal" inputMode="decimal" value={form.goal} onChange={e => set('goal', e.target.value)} aria-describedby="ps-f-goal-hint" placeholder="0" autoComplete="off" />
            </Field>
          </div>
          <div>
            <Switch checked={form.useOwnColor} onChange={v => set('useOwnColor', v)} label="Eigen kleur gebruiken"
              description={form.useOwnColor ? null : <span className="ps-classline" style={{ marginTop: 0 }}>Volgt de categorie <Swatch color={cls.color} size={9} /> {cls.label}</span>} />
            {form.useOwnColor && (
              <div className="ps-colors" role="radiogroup" aria-label="Kleur">
                {COLOR_PRESETS.map((c, i) => (
                  <button key={c} type="button" role="radio" aria-checked={form.color === c} aria-label={`Kleur ${i + 1}`}
                    className="ps-color" style={{ background: c }} onClick={() => set('color', c)} />
                ))}
              </div>
            )}
          </div>
          <Switch checked={form.includeInTotal} onChange={v => set('includeInTotal', v)} label="Meetellen in totale waarde" />
          <Switch checked={form.includeInTimeChart} onChange={v => set('includeInTimeChart', v)} label="Meetellen in waarde-over-tijd grafiek" />
          {party && (
            <div>
              <Button variant="danger" icon="trash-2" onClick={() => setConfirmDel(true)}>Partij verwijderen</Button>
            </div>
          )}
          <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </form>
      )}
    </Sheet>
  );
}

// ===================================================================
// PositiesScreen
// ===================================================================
function PsStackCard({ app }) {
  const { model, prefs, state } = app;
  const privacy = !!prefs.privacy;
  const sk = psGainKey(model, prefs);
  const r = psRange(model.series.dates, ['1D', '1W'].includes(sk) ? '1M' : sk);
  const ids = model.included.map(s => s.party.id).filter(id => model.chartIds.includes(id));
  const layers = useMemo(() => {
    if (r.i1 < 0) return [];
    const out = [];
    for (const c of ASSET_CLASSES) {
      const mine = ids.filter(id => assetClassOf(model.byId[id].party) === c.key);
      if (!mine.length) continue;
      const vals = [];
      for (let i = r.i0; i <= r.i1; i++) vals.push(mine.reduce((a, id) => a + Math.max(0, model.series.byParty[id][i] || 0), 0));
      if (vals.some(v => v > 0.5)) out.push({ key: c.key, label: c.label, color: c.color, values: vals });
    }
    return out;
  }, [model, r.i0, r.i1, ids.join(',')]);
  const classKeys = new Set(ASSET_CLASSES.map(c => c.key));
  const hidden = (Array.isArray(state.hiddenParties) ? state.hiddenParties : []).filter(k => classKeys.has(k));
  const toggle = key => app.setHiddenGroups(hidden.includes(key) ? hidden.filter(k => k !== key) : [...hidden, key]);
  const dates = r.i1 >= 0 ? model.series.dates.slice(r.i0, r.i1 + 1) : [];
  return (
    <Card className="ps-stack-card" title="Verdeling door de tijd" meta={(PERIODS.find(p => p.key === r.key) || {}).context?.replace('{datum}', fmtDateLong(model.series.dates[0]))}
      actions={<Segmented size="sm" ariaLabel="Weergave" value={prefs.stackMode || 'pct'} onChange={v => app.setPrefs({ stackMode: v })}
        options={[{ value: 'pct', label: '%' }, { value: 'eur', label: '€' }]} />}>
      <div className="ps-controls" style={{ marginBottom: 10 }}>
        {layers.map(l => (
          <Chip key={l.key} swatch={l.color} active={!hidden.includes(l.key)} onClick={() => toggle(l.key)}>{l.label}</Chip>
        ))}
      </div>
      {layers.length && dates.length >= 2
        ? <StackedAreaChart dates={dates} layers={layers} mode={prefs.stackMode || 'pct'} hiddenKeys={hidden} height={220} privacy={privacy} />
        : <EmptyState icon="layers" title="Nog te weinig historie in deze periode" />}
    </Card>
  );
}

function PsCostsCard({ app }) {
  const t = app.model.totals;
  const feePct = t.invested > 0 ? t.fees / t.invested * 100 : null;
  return (
    <Card className="ps-costs-card" title="Kosten en inkomsten">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <KpiCell label="Transactiekosten" value={<Money value={-(t.fees || 0)} />}
          sub={`${t.feeTxCount} transacties met kosten${feePct != null ? ' · ' + fmtPct(feePct, { decimals: 2, sign: false }) + ' van ingelegd' : ''}`} />
        <KpiCell label="Dividend en rente" value={<Money value={t.income || 0} />} sub="sinds start" />
        <KpiCell label="Gerealiseerd resultaat" value={<span className={psTone(t.realized)}><Money value={t.realized || 0} sign /></span>} sub="uit verkopen en opnames" />
      </div>
    </Card>
  );
}

function PsOptionSheet({ open, onClose, title, options, value, onPick, extra }) {
  return (
    <Sheet open={open} onClose={onClose} title={title} size="medium">
      <div role="radiogroup" aria-label={title}>
        {options.map(o => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value} className="ps-opt"
            onClick={() => onPick(o.value)}>
            {o.label}
            {o.value === value && <Icon name="check" size={18} className="ps-opt__check" />}
          </button>
        ))}
      </div>
      {extra}
    </Sheet>
  );
}

function PsMobile({ app }) {
  const { model, prefs, route } = app;
  const [sheet, setSheet] = useState(null); // 'sort' | 'secondary'
  const partyId = route && route.params && route.params.partyId;
  if (partyId) return <PartyPanel app={app} partyId={partyId} asPage onClose={() => app.navigate('/posities')} />;
  const t = model.totals;
  const sort = prefs.positionsSort || { key: 'value', dir: 'desc' };
  const secLabel = (PS_SECONDARY_OPTIONS.find(o => o.value === (prefs.positionsSecondary || 'pnl')) || PS_SECONDARY_OPTIONS[0]).label;
  const segments = model.classes.map(c => ({ key: c.key, label: c.label, color: c.color, value: c.value }));
  const gk = psGainKey(model, prefs);
  const tg = gk === 'ALL' ? null : sumPeriodGains(model.included.map(s => partyPeriodGain(model, s, gk)));
  return (
    <div className="ps-page">
      <div className="ps-mhead">
        <div className="ps-head__titles">
          <h1 className="sr-only">Posities</h1>
          <div className="ps-meta">{t.openCount} open · {t.closedCount} gesloten · <Money value={t.value} /></div>
        </div>
        <IconButton icon="plus" label="Partij toevoegen" onClick={() => app.openPartyForm(null)} data-testid="add-party" />
        <Button variant="secondary" size="sm" icon="filter" onClick={() => setSheet('sort')}>Sorteer</Button>
      </div>
      <div className="ps-mcontrols">
        <Segmented pill ariaLabel="Groepering" value={prefs.positionsGrouping === 'none' ? 'none' : 'class'}
          onChange={v => app.setPrefs({ positionsGrouping: v })}
          options={[{ value: 'class', label: 'Categorieën' }, { value: 'none', label: 'Partijen' }]} />
        <Chip onClick={() => setSheet('secondary')}>Toon: {secLabel} ▾</Chip>
      </div>
      <Segmented size="sm" pill full ariaLabel="Periode voor winst" value={gk} onChange={k => app.setPrefs({ positionsPeriod: k })}
        options={psPeriodOptions(model.series.dates, PS_GAIN_PERIODS).map(o => (o.value === 'ALL' ? { ...o, disabled: false } : o))} />
      <Card>
        <div className="ps-mtotal">
          <div className="ps-mtotal__row">
            <span className="ps-mtotal__val"><Money value={t.value} /></span>
            {tg ? <Delta value={tg.gain} pct={tg.pct} size="sm" /> : <Delta value={t.pnl} pct={t.pnlPct} size="sm" />}
          </div>
          <div className="ps-mtotal__meta">{tg ? psGainLabel(gk) + ' · ' : ''}Totaal · {model.included.filter(s => !isClosedSummary(s) && s.transactions.length).length} partijen in totaal</div>
          <AllocationBar segments={segments} height={14} privacy={!!prefs.privacy} ariaLabel="Verdeling per categorie" />
        </div>
      </Card>
      <Card>
        <HoldingsList app={app} variant="page" />
      </Card>
      <PsOptionSheet open={sheet === 'sort'} onClose={() => setSheet(null)} title="Sorteer op" options={PS_SORT_OPTIONS}
        value={sort.key}
        onPick={k => app.setPrefs({ positionsSort: { key: k, dir: sort.key === k ? sort.dir : (k === 'name' ? 'asc' : 'desc') } })}
        extra={
          <div style={{ marginTop: 12 }}>
            <Segmented full ariaLabel="Volgorde" value={sort.dir} onChange={d => app.setPrefs({ positionsSort: { ...sort, dir: d } })}
              options={[{ value: 'desc', label: 'Aflopend ↓' }, { value: 'asc', label: 'Oplopend ↑' }]} />
          </div>
        } />
      <PsOptionSheet open={sheet === 'secondary'} onClose={() => setSheet(null)} title="Tweede regel" options={PS_SECONDARY_OPTIONS}
        value={prefs.positionsSecondary || 'pnl'} onPick={v => { app.setPrefs({ positionsSecondary: v }); setSheet(null); }} />
    </div>
  );
}

function PsDesktop({ app }) {
  const { model, prefs, route } = app;
  usePsPeriodKeys(app, true);
  const t = model.totals;
  const gk = psGainKey(model, prefs);
  const partyId = route && route.params && route.params.partyId;
  return (
    <div className="ps-page">
      <div className="ps-head">
        <div className="ps-head__titles">
          <h1 className="ps-title">Posities</h1>
          <div className="ps-meta">
            {model.parties.length} partijen · {t.openCount} open · waarde <b><Money value={t.value} /></b> · winst per positie <b className={psTone(t.pnl)}><Money value={t.pnl} sign /></b>
          </div>
        </div>
        <div className="ps-head__actions">
          <Segmented size="sm" ariaLabel="Groepering" value={prefs.positionsGrouping === 'none' ? 'none' : 'class'}
            onChange={v => app.setPrefs({ positionsGrouping: v })}
            options={[{ value: 'class', label: 'Categorie' }, { value: 'none', label: 'Geen' }]} />
          <Chip active={!!prefs.showClosed} onClick={() => app.setPrefs({ showClosed: !prefs.showClosed })}>Gesloten tonen</Chip>
          <Button variant="primary" icon="plus" onClick={() => app.openPartyForm(null)} data-testid="add-party">Partij</Button>
        </div>
      </div>
      <div className="ps-controls">
        <Segmented ariaLabel="Periode voor winst en trend" value={gk} onChange={k => app.setPrefs({ positionsPeriod: k })}
          options={psPeriodOptions(model.series.dates, PS_GAIN_PERIODS).map(o => (o.value === 'ALL' ? { ...o, disabled: false } : o))} />
        <span className="ps-foot-note">bepaalt winst- en trendkolom · Alles = totale winst</span>
      </div>
      <Card padding={0}>
        <HoldingsTable app={app} variant="full" />
      </Card>
      <div className="ps-row2">
        <PsStackCard app={app} />
        <PsCostsCard app={app} />
      </div>
      {partyId && !app.overlayOpen && <PartyPanel app={app} partyId={partyId} onClose={() => app.navigate('/posities')} />}
    </div>
  );
}

function PositiesScreen({ app }) {
  return app.isMobile ? <PsMobile app={app} /> : <PsDesktop app={app} />;
}

Object.assign(window, { PositiesScreen, HoldingsTable, HoldingsList, PartyPanel, PartyForm });
