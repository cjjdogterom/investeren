// Overzicht (S2): OverzichtScreen, desktop (direction B) + mobile (direction C).
// File-local helpers use the `ov` / `Ov` / `OV_` prefix (CONTRACT §2.2).

injectStyles('overzicht', `
.ov-desk { display: flex; flex-direction: column; gap: 12px; min-width: 0; padding: 20px; }
.ov-top { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.ov-left { flex: 7 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.ov-right { flex: 5 1 380px; min-width: 0; display: flex; flex-direction: column; }
.ov-right > .card { flex: 1 1 0; height: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.ov-right--stacked > .card { flex: none; height: auto; }
.ov-pos__body { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.ov-pos__body > .ps-ht { flex: 1; min-height: 0; }
.ov-pos__body > .ps-ht > .ps-ht__scroll { flex: 1; }
.ov-right--stacked .ov-pos__body > .ps-ht > .ps-ht__scroll { max-height: 640px; }
.ov-row2 { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.ov-row2 > .ov-verdeling { flex: 4 1 300px; }
.ov-row2 > .ov-attn { flex: 3 1 260px; }
.ov-row3 { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.ov-row3 > .card { flex: 1 1 300px; }

/* Prestaties */
.ov-perf .card__body { padding: 0 !important; }
.ov-perf__top { display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px 0; flex-wrap: wrap; }
.ov-perf__hero { flex: 1; min-width: 280px; }
.ov-perf__ctrl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.ov-label { font: 500 12.5px/17px var(--font); color: var(--fg-muted); }
.ov-label .ov-stamp { color: var(--fg-subtle); font-weight: 400; }
.ov-hero { margin: 4px 0 6px; font: 600 44px/48px var(--font); letter-spacing: -0.032em; color: var(--fg); font-variant-numeric: tabular-nums lining-nums; white-space: nowrap; }
:root[data-theme="dark"] .ov-hero { font-weight: 560; }
.ov-hero__cur { font-size: .56em; color: var(--fg-muted); vertical-align: .32em; margin-right: .06em; font-weight: 500; }
.ov-hero__sign { margin-right: .02em; }
.ov-deltarow { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; min-height: 22px; }
.ov-deltarow .delta__context { color: var(--fg-muted); font-weight: 400; font-size: 13px; }
.ov-subrow { margin-top: 6px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px 14px; font-size: 12.5px; line-height: 17px; color: var(--fg-muted); }
.ov-subrow b { font-weight: 600; color: var(--fg); font-variant-numeric: tabular-nums; }
.ov-subrow .ov-gain b, .ov-gain { color: var(--gain); }
.ov-subrow .ov-loss b, .ov-loss { color: var(--loss); }
.ov-legend { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 14px; padding: 14px 20px 8px; }
.ov-legend__items { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 14px; flex: 1; min-width: 0; font-size: 12px; color: var(--fg-muted); }
.ov-key { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.ov-key__line { width: 14px; height: 2px; background: var(--fg); border-radius: 1px; }
.ov-key__step { width: 12px; height: 8px; border-top: 1.5px solid var(--fg-muted); border-right: 1.5px solid var(--fg-muted); }
.ov-key__band { width: 12px; height: 10px; background: var(--gain-fill); opacity: .45; border-radius: 2px; }
.ov-key__dia { width: 7px; height: 7px; background: var(--fg-muted); transform: rotate(45deg); }
.ov-key__ring { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--fg-muted); }
.ov-chartwrap { padding: 0 20px 6px; }
.ov-chartnote { padding: 0 20px 8px; font-size: 12px; color: var(--fg-subtle); }
.ov-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--border); }
.ov-kpis > .kpi { padding: 14px 20px 16px; border-left: 1px solid var(--border); }
.ov-kpis > .kpi:first-child { border-left: 0; }
.ov-kpis .kpi__value { font-size: 20px; line-height: 26px; }
.ov-pin { margin-right: 4px; }

/* Verdeling */
.ov-vrows { display: flex; flex-direction: column; gap: 2px; margin-top: 14px; }
.ov-vrow { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(60px, 1fr) 54px 64px; align-items: center; gap: 10px; min-height: 26px; border: 0; background: none; padding: 0 4px; margin: 0 -4px; font: inherit; font-size: 13px; color: var(--fg); text-align: left; cursor: pointer; border-radius: 6px; width: calc(100% + 8px); }
.ov-vrow:hover { background: var(--surface-2); }
.ov-vrow--nodrift { grid-template-columns: minmax(0, 1.3fr) minmax(60px, 1fr) 54px; }
.ov-vrow__lab { display: flex; align-items: center; gap: 8px; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ov-vrow__num { text-align: right; font-variant-numeric: tabular-nums; font-weight: 550; }
.ov-vrow__drift { text-align: right; font-variant-numeric: tabular-nums; font-size: 12px; color: var(--fg-subtle); white-space: nowrap; display: inline-flex; align-items: center; justify-content: flex-end; gap: 3px; }
.ov-vrow__drift--out { color: var(--warn); font-weight: 550; }
.ov-link { border: 0; background: none; padding: 0; font: 500 12.5px/16px var(--font); color: var(--fg-muted); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.ov-link:hover { color: var(--fg); text-decoration: underline; text-underline-offset: 2px; }
.ov-link--strong { color: var(--fg); font-weight: 600; }

/* Aandacht */
.ov-attn__list { display: flex; flex-direction: column; gap: 14px; }
.ov-item { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 10px; align-items: start; }
.ov-item__ic { color: var(--fg-muted); margin-top: 1px; }
.ov-item--warn .ov-item__ic { color: var(--warn); }
.ov-item__title { font: 550 13px/18px var(--font); color: var(--fg); }
.ov-item__sub { font-size: 12px; line-height: 17px; color: var(--fg-muted); }
.ov-item__act { border: 0; background: none; padding: 0; margin-left: 4px; font: 500 12px/17px var(--font); color: var(--fg); text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }
.ov-ok { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--fg-muted); }
.ov-ok svg { color: var(--gain); }
.ov-foot { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--fg-subtle); }
.ov-foot svg { color: var(--gain); }

/* Explainer */
.ov-explain { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 13px; line-height: 19px; color: var(--fg-muted); max-width: 380px; white-space: normal; }
.ov-explain b { color: var(--fg); font-weight: 600; }

/* First run */
.ov-first { display: flex; flex-direction: column; gap: 16px; }
.ov-first__steps { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; font-size: 13px; color: var(--fg-muted); }
.ov-first__steps span b { color: var(--fg); margin-right: 4px; }
.ov-first__ph { height: 160px; border: 1.5px dashed var(--border-strong); border-radius: var(--r-card); }

/* Mobile */
.ov-m { display: flex; flex-direction: column; gap: 20px; padding: 12px 16px 8px; min-width: 0; }
.ov-m__hero { display: flex; flex-direction: column; gap: 6px; }
.ov-m__hero .ov-hero { font-size: 52px; line-height: 54px; letter-spacing: -0.036em; margin: 2px 0 2px; }
.ov-m__chip { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: var(--r-pill); border: 0; background: var(--surface-2); color: var(--fg-muted); font: 500 12.5px/1 var(--font); cursor: pointer; position: relative; }
.ov-m__chip::after { content: ''; position: absolute; inset: -8px -4px; }
.ov-m__cap { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.ov-m__legend { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 13px; color: var(--fg-muted); }
.ov-m__legend span { display: inline-flex; align-items: center; gap: 6px; }
.ov-m__legend b { color: var(--fg); font-weight: 600; font-variant-numeric: tabular-nums; }
.ov-m__chart { margin: 0 -16px; }
.ov-m__periods { display: flex; gap: 8px; align-items: center; }
.ov-m__periods .seg { flex: 1; }
.ov-m__periods .seg__btn { height: 36px; }
.ov-quick { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ov-quick__btn { display: flex; flex-direction: column; align-items: center; gap: 6px; border: 0; background: none; padding: 0; font: 500 12.5px/16px var(--font); color: var(--fg); cursor: pointer; }
.ov-quick__well { width: 56px; height: 56px; border-radius: 20px; display: flex; align-items: center; justify-content: center; background: var(--surface); border: 1px solid var(--border); color: var(--fg); }
.ov-quick__btn--ink .ov-quick__well { background: var(--ink); color: var(--on-ink); border-color: var(--ink); }
.ov-quick__btn:active .ov-quick__well { transform: scale(.96); }
.ov-sect { margin: 0 0 10px; font: 650 18px/24px var(--font); letter-spacing: -0.006em; }
.ov-fy { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; margin: 0 -16px; padding: 0 16px 4px; scrollbar-width: none; overscroll-behavior-x: contain; }
.ov-fy::-webkit-scrollbar { display: none; }
.ov-fy > .card { flex: 0 0 min(300px, 84%); scroll-snap-align: start; display: flex; flex-direction: column; }
.ov-fy > .card .card__body { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.ov-fy__cta { margin-top: auto; align-self: flex-start; }
.ov-dots { display: flex; justify-content: center; gap: 6px; margin-top: 10px; }
.ov-dots span { width: 6px; height: 6px; border-radius: 3px; background: var(--border-strong); transition: width var(--d-2) var(--ease), background var(--d-2) var(--ease); }
.ov-dots span.is-on { width: 16px; background: var(--fg); }
.ov-big { font: 650 30px/36px var(--font); letter-spacing: -0.025em; font-variant-numeric: tabular-nums; }
.ov-track { position: relative; height: 8px; border-radius: 4px; background: var(--surface-3); overflow: hidden; }
.ov-track__fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; background: var(--ink); }
.ov-track__tick { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--surface); }
.ov-small { font-size: 13px; line-height: 18px; color: var(--fg-muted); }
.ov-small b { color: var(--fg); font-weight: 600; font-variant-numeric: tabular-nums; }
.ov-caption { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 12.5px; color: var(--fg-subtle); margin: 8px 0 4px; }
.ov-mfoot { text-align: center; font-size: 12.5px; line-height: 18px; color: var(--fg-subtle); padding: 0 16px; }

@media (max-width: 767.98px) {
  .ov-vrow { min-height: 40px; }
  .ov-item__title { font-size: 14px; line-height: 19px; }
  .ov-item__sub { font-size: 13px; line-height: 18px; }
  .ov-item__act { font-size: 13px; min-height: 32px; }
}
`);

function ovCx(...a) { return a.filter(Boolean).join(' '); }
function ovTyping(e) {
  const t = e.target;
  if (!t) return false;
  const tag = (t.tagName || '').toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
}
function ovIsoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function ovLatest(...vals) {
  let best = null;
  for (const v of vals) {
    if (v == null || v === '') continue;
    const d = new Date(v);
    if (!isNaN(d.getTime()) && (!best || d > best)) best = d;
  }
  return best;
}
function ovStamp(app) {
  const d = ovLatest(app.spotStatus && app.spotStatus.fetchedAt, app.syncStatus && app.syncStatus.syncedAt);
  return d ? `${fmtDateLong(ovIsoLocal(d))}, ${fmtTime(d.toISOString())}` : null;
}
function ovPeriodContext(key, dates) {
  const p = PERIODS.find(x => x.key === key) || PERIODS[3];
  return p.context.replace('{datum}', dates && dates.length ? fmtDateLong(dates[0]) : '');
}

// Hero value with a small muted € (SPEC §2.5 display).
function OvHeroValue({ value, privacy, testId }) {
  if (privacy) return <div className="ov-hero num" data-testid={testId} aria-label="bedrag verborgen"><span className="ov-hero__cur">€</span>•••••</div>;
  const s = fmtMoney(value);
  const m = /^([−+]?)€\s?(.*)$/u.exec(s);
  if (!m) return <div className="ov-hero num" data-testid={testId}>{s}</div>;
  return (
    <div className="ov-hero num" data-testid={testId} aria-label={s}>
      {m[1] && <span className="ov-hero__sign">{m[1]}</span>}<span className="ov-hero__cur">€</span>{m[2]}
    </div>
  );
}

function OvExplainer() {
  return (
    <ul className="ov-explain">
      <li><b>Totale winst</b> = huidige waarde − netto ingelegd. Netto ingelegd is wat je er per saldo in hebt gestoken: aankopen en stortingen min opbrengsten van verkopen en opnames.</li>
      <li><b>Winst excl. stortingen (periode)</b> = waardeverandering in de periode min wat je in die periode netto hebt ingelegd. Een storting is dus nooit winst.</li>
      <li><b>Het percentage</b> is geldgewogen (Modified Dietz): de winst gedeeld door de beginwaarde plus je stortingen, gewogen naar hoe lang ze in de periode meededen.</li>
      <li><b>Tijdgewogen</b> rekent stortingen helemaal weg en laat zien hoe je beleggingen zelf presteerden.</li>
      <li><b>Rendement p.j.</b> is je geldgewogen jaarrendement over alle stortingen en opnames sinds de start.</li>
      <li><b>Winst per positie</b> telt gerealiseerde winst op verkopen mee; opgeteld is dat gelijk aan je totale winst.</li>
    </ul>
  );
}

// ===================================================================
// Shared performance state (hero + chart + KPIs)
// ===================================================================
function useOvPerformance(app) {
  const { model, prefs, isMobile } = app;
  const privacy = !!prefs.privacy;
  const peIds = useMemo(() => model.chartIds.filter(id => model.byId[id] && assetClassOf(model.byId[id].party) === 'pe'), [model]);
  const hasPE = peIds.length > 0;
  const exclPE = !!prefs.exclPE && hasPE;
  const series = useMemo(() => (exclPE ? seriesExcluding(model.series, peIds) : model.series), [model, exclPE, peIds]);
  const dates = series.dates;

  let periodKey = prefs.period || '1J';
  let r = periodRange(dates, periodKey);
  if (!r.enabled) {
    for (const k of ['ALL', '1J', 'YTD', '3M', '1M']) {
      const r2 = periodRange(dates, k);
      if (r2.enabled) { r = r2; periodKey = k; break; }
    }
  }
  const periodOptions = PERIODS.map(p => {
    const en = periodRange(dates, p.key).enabled;
    return { value: p.key, label: p.label, disabled: !en, title: en ? undefined : 'Te weinig data', testId: `period-${p.key}` };
  });

  // Cursor keyed by date string so background pulls do not cancel it.
  const [cursor, setCursor] = useState(null);
  useEffect(() => { setCursor(null); }, [periodKey, prefs.chartMode, exclPE]);
  let ci = null;
  if (cursor && r.enabled) {
    const i = dates.indexOf(cursor.date);
    if (i >= r.i0 && i <= r.i1) ci = i;
  }
  const pinned = !!(cursor && cursor.pinned && ci != null && !isMobile);

  // Esc clears the pin; 1–5 choose the period.
  useEffect(() => {
    const onKey = e => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape') { if (cursor && cursor.pinned && !app.overlayOpen) setCursor(null); return; }
      if (ovTyping(e) || app.overlayOpen) return;
      const idx = '12345'.indexOf(e.key);
      if (idx < 0) return;
      const key = PERIODS[idx].key;
      if (periodRange(dates, key).enabled) app.setPrefs({ period: key });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cursor, app, dates]);

  const onCursor = (i, info = {}) => {
    if (i == null) { setCursor(null); return; }
    const d = dates[r.i0 + i];
    if (!d) return;
    setCursor({ date: d, pinned: !isMobile && !!info.pinned });
  };

  const end = ci != null ? ci : r.i1;
  const stats = r.enabled ? periodStats(series, r.i0, end, r.all) : null;
  const fullStats = r.enabled ? periodStats(series, r.i0, r.i1, r.all) : null;
  const xirrPct = useMemo(() => (dates.length >= 2 ? xirr(series) : null), [series]);
  const histDays = dates.length >= 2 ? daysBetween(dates[0], dates[dates.length - 1]) : 0;

  // Hero at rest = included parties (minus included PE when Excl. PE).
  const peInc = exclPE ? model.included.filter(s => assetClassOf(s.party) === 'pe') : [];
  const sumOf = f => peInc.reduce((a, s) => a + (f(s) || 0), 0);
  const restValue = model.totals.value - sumOf(s => s.currentValueEur);
  const restNet = model.totals.netInvested - sumOf(s => s.costBasis - s.realizedPnl);
  const restPnl = model.totals.pnl - sumOf(s => s.pnl);
  const restInvested = model.totals.invested - sumOf(s => s.invested);
  const restPnlPct = restInvested > 0 ? restPnl / restInvested * 100 : null;

  const heroValue = ci != null ? series.value[ci] : restValue;
  const heroNet = ci != null ? series.net[ci] : restNet;
  const heroWinst = heroValue - heroNet;
  const deltaGain = stats ? stats.gain : null;
  let deltaPct = stats ? stats.pct : null;
  let context;
  if (ci != null) context = 't.o.v. begin periode';
  else if (r.all) {
    deltaPct = restPnlPct;
    context = `op inleg · ${ovPeriodContext('ALL', dates)}` + (xirrPct != null && histDays >= 365 ? ` · ${fmtPct(xirrPct, { decimals: 1 })} p.j.` : '');
  } else {
    context = `winst excl. stortingen · ${ovPeriodContext(periodKey, dates)}` + (stats && stats.annualized != null ? ` · ${fmtPct(stats.annualized, { decimals: 1 })} p.j.` : '');
  }

  // Chart data
  const mode = prefs.chartMode === 'return' ? 'return' : 'value';
  const chartDates = r.enabled ? dates.slice(r.i0, r.i1 + 1) : [];
  const twrCurve = useMemo(() => (mode === 'return' && r.enabled ? cumulativeTwr(series, r.i0, r.i1) : null), [mode, series, r.i0, r.i1, r.enabled]);
  const primary = mode === 'return' ? (twrCurve || []) : (r.enabled ? series.value.slice(r.i0, r.i1 + 1) : []);
  const secondary = mode === 'value' && r.enabled ? series.net.slice(r.i0, r.i1 + 1) : null;
  const twrAllNull = mode === 'return' && primary.every(v => v == null);
  const peSet = new Set(exclPE ? peIds : []);
  const markers = model.markers
    .filter(m => !peSet.has(m.partyId) && m.index >= r.i0 && m.index <= r.i1)
    .map(m => ({ ...m, index: m.index - r.i0 }));
  const valueText = i => {
    const d = chartDates[i];
    if (!d) return '';
    if (mode === 'return') return `${fmtDateLong(d)}: ${primary[i] == null ? '—' : fmtPct(primary[i], { decimals: 1 })}`;
    return `${fmtDateLong(d)}: ${privacy ? 'bedrag verborgen' : fmtMoney(primary[i])}`;
  };

  const includedIds = new Set(model.included.map(s => s.party.id));
  const chartSet = new Set(model.chartIds);
  const notInChart = [...includedIds].filter(id => !chartSet.has(id)).length;
  const setsDiffer = notInChart > 0 || model.chartIds.some(id => !includedIds.has(id));

  return {
    series, dates, r, periodKey, periodOptions, cursor, setCursor, ci, pinned, onCursor,
    stats, fullStats, xirrPct, histDays, hasPE, exclPE,
    heroValue, heroNet, heroWinst, deltaGain, deltaPct, context, restPnlPct,
    mode, chartDates, primary, secondary, twrAllNull, markers, valueText,
    setsDiffer, notInChart: notInChart || model.chartIds.filter(id => !includedIds.has(id)).length,
  };
}

// ===================================================================
// Attention items (desktop card + mobile Voor jou)
// ===================================================================
function ovAttentionItems(app) {
  const { model, state, spots } = app;
  const items = [];
  if (app.syncStatus && app.syncStatus.error) {
    items.push({ id: 'sync', tone: 'warn', icon: 'cloud-alert', title: 'Sync mislukt', sub: String(app.syncStatus.error), action: { label: 'Opnieuw', onClick: () => app.syncNow() } });
  }
  if (app.spotStatus && app.spotStatus.error) {
    items.push({ id: 'spot', tone: 'warn', icon: 'triangle-alert', title: 'Koersen ophalen mislukt', sub: String(app.spotStatus.error), action: { label: 'Opnieuw', onClick: () => app.refreshSpot({ manual: true }) } });
  }
  const drift = driftRows(model.summaries, state.targetAllocation);
  const out = drift.rows.filter(rw => rw.outside).sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));
  const goPlan = { label: 'Bijstortplan', onClick: () => app.navigate('/plan/verdeling') };
  const driftLabel = rw => (drift.grouping === 'party' ? rw.label : ovClassLabel(rw.key, rw.label));
  if (out.length > 2) {
    items.push({ id: 'drift', tone: 'warn', icon: 'triangle-alert', title: `${out.length} categorieën wijken meer dan ${ATTENTION_THRESHOLDS.driftPt} pt af van je doel`, sub: out.slice(0, 3).map(rw => `${driftLabel(rw)} ${fmtPt(rw.drift)}`).join(' · '), action: goPlan, drift: out });
  } else {
    out.forEach(rw => items.push({ id: 'drift-' + rw.key, tone: 'warn', icon: 'triangle-alert', title: `${driftLabel(rw)} ${fmtPt(rw.drift)} t.o.v. doel`, sub: `Doel ${fmtPct(rw.target, { decimals: 0, sign: false })} · nu ${fmtPct(rw.current, { decimals: 1, sign: false })}`, action: goPlan, drift: [rw] }));
  }
  if (model.orphans.length) {
    items.push({ id: 'orphans', tone: 'warn', icon: 'triangle-alert', title: `${model.orphans.length} transacties zonder partij`, sub: 'Deze tellen niet mee in je posities.', action: { label: 'Bekijken', onClick: () => app.navigate('/transacties?partij=__orphan') } });
  }
  for (const s of model.summaries) {
    const u = s.party.unit;
    if ((u !== 'bundle' && u !== 'eur') || !(s.currentValueEur > 0)) continue;
    const sub = holdingSubline(s, spots);
    if (sub.staleDays == null) continue;
    if (s.external) {
      items.push({ id: 'stale-' + s.party.id, tone: 'warn', icon: 'clock', title: `${s.party.name} · ${sub.staleDays} dagen niet bijgewerkt`, sub: 'Wordt live bijgewerkt door het Financieel Systeem.' });
      continue;
    }
    items.push({ id: 'stale-' + s.party.id, tone: 'warn', icon: 'clock', title: `${s.party.name} · waardering ${sub.staleDays} dagen oud`, sub: s.lastValuationDate ? `Laatste waardering ${fmtDateLong(s.lastValuationDate)}` : 'Nog geen waardering', action: { label: 'Bijwerken', onClick: () => app.openTx({ party: s.party.id, type: 'waardering' }) } });
  }
  const total = model.totals.value;
  if (total > 0) {
    const top = model.included.slice().sort((a, b) => b.currentValueEur - a.currentValueEur)[0];
    const share = top ? top.currentValueEur / total * 100 : 0;
    if (top && share > ATTENTION_THRESHOLDS.concentrationPct) {
      items.push({ id: 'conc', tone: 'info', icon: 'info', title: `${fmtPct(share, { decimals: 0, sign: false })} zit in één positie`, sub: top.party.name, action: { label: 'Bekijken', onClick: () => app.navigate('/posities/' + encodeURIComponent(top.party.id)) } });
    }
  }
  const nav = spots && Array.isArray(spots.meesmanNavHistory) ? spots.meesmanNavHistory : [];
  const lastNav = nav.length ? nav[nav.length - 1] : null;
  const lastNavDate = lastNav && (lastNav.date || lastNav.d || null);
  if (lastNavDate && daysBetween(String(lastNavDate).slice(0, 10), todayIsoLocal()) > ATTENTION_THRESHOLDS.navStaleDays) {
    items.push({ id: 'nav', tone: 'info', icon: 'clock', title: `Meesman-koers van ${fmtDateLong(String(lastNavDate).slice(0, 10))}`, sub: spots.meesmanNavEur ? `NAV ${fmtMoney(spots.meesmanNavEur, { decimals: 4 })}` : null, action: { label: 'Bijwerken', onClick: () => app.navigate('/instellingen/koersen') } });
  }
  return items.sort((a, b) => (a.tone === b.tone ? 0 : a.tone === 'warn' ? -1 : 1));
}

function ovClassLabel(categoryKey, fallback) {
  const k = assetClassOf({ category: categoryKey });
  return k === 'other' ? fallback : ASSET_CLASS_BY_KEY[k].label;
}

function ovStatusLine(app) {
  const sp = app.spotStatus || {};
  const sy = app.syncStatus || {};
  const fetched = ovLatest(sp.fetchedAt);
  const stale = !fetched || (Date.now() - fetched.getTime()) > ATTENTION_THRESHOLDS.priceStaleHours * 3600 * 1000;
  const prices = sp.error ? 'Koersen: fout' : stale ? (fetched ? `Koersen van ${fmtTime(fetched.toISOString())}` : 'Koersen niet opgehaald') : 'Koersen live';
  const sync = !app.sbOk ? 'sync niet gekoppeld' : sy.error ? 'sync mislukt' : 'sync actief';
  const ok = !sp.error && !stale && !sy.error && app.sbOk;
  return { text: `${prices} · ${sync}`, ok };
}

function OvAttentionList({ items, max = 4 }) {
  const shown = items.slice(0, max);
  return (
    <div className="ov-attn__list">
      {shown.map(it => (
        <div key={it.id} className={ovCx('ov-item', it.tone === 'warn' && 'ov-item--warn')}>
          <Icon name={it.icon} size={16} className="ov-item__ic" />
          <div style={{ minWidth: 0 }}>
            <div className="ov-item__title">{it.title}</div>
            <div className="ov-item__sub">
              {it.sub}{it.sub && it.action ? ' · ' : ''}
              {it.action && <button type="button" className="ov-item__act" style={{ marginLeft: 0 }} onClick={it.action.onClick}>{it.action.label}</button>}
            </div>
          </div>
        </div>
      ))}
      {items.length > max && <div className="ov-item__sub">{items.length - max} meer</div>}
    </div>
  );
}

function OvAttentionCard({ app, items }) {
  const st = ovStatusLine(app);
  return (
    <Card className="ov-attn" data-testid="attention-card" title="Aandacht" meta={items.length ? String(items.length) : null}
      footer={<span className="ov-foot"><Icon name={st.ok ? 'check' : 'clock'} size={13} style={st.ok ? null : { color: 'var(--warn)' }} />{st.text}</span>}>
      {items.length
        ? <OvAttentionList items={items} />
        : <div className="ov-ok"><Icon name="check" size={16} />Alles up-to-date</div>}
    </Card>
  );
}

// ===================================================================
// Verdeling card
// ===================================================================
function OvVerdelingCard({ app, pinIndex }) {
  const { model, state, prefs } = app;
  const privacy = !!prefs.privacy;
  const goPlan = () => app.navigate('/plan/verdeling');
  let rows, hasTargets, subtitle;
  if (pinIndex != null) {
    const at = holdingsAt(model, pinIndex);
    const byClass = {};
    let tot = 0;
    for (const s of model.included) {
      const h = at[s.party.id];
      if (!h) continue;
      const v = Math.max(0, h.value || 0);
      const k = assetClassOf(s.party);
      byClass[k] = (byClass[k] || 0) + v;
      tot += v;
    }
    rows = ASSET_CLASSES.filter(c => byClass[c.key] > 0.5).map(c => ({ key: c.key, label: c.label, color: c.color, value: byClass[c.key], current: tot > 0 ? byClass[c.key] / tot * 100 : 0, target: null, drift: null, outside: false }))
      .sort((a, b) => b.value - a.value);
    hasTargets = false;
    subtitle = `op ${fmtDateLong(model.series.dates[pinIndex])}`;
  } else {
    const d = driftRows(model.summaries, state.targetAllocation);
    hasTargets = d.hasTargets;
    rows = d.rows.filter(rw => rw.value > 0.5 || (rw.target || 0) > 0).map(rw => ({ ...rw, label: d.grouping === 'party' ? rw.label : ovClassLabel(rw.key, rw.label) }));
    subtitle = hasTargets ? 'doel als streepje' : null;
  }
  const slot = k => { const i = ASSET_CLASSES.findIndex(c => c.key === assetClassOf({ category: k })); return i < 0 ? 99 : i; };
  const segs = (pinIndex != null ? rows.slice().sort((a, b) => ASSET_CLASSES.findIndex(c => c.key === a.key) - ASSET_CLASSES.findIndex(c => c.key === b.key))
    : rows.slice().sort((a, b) => slot(a.key) - slot(b.key)))
    .map(rw => ({ key: rw.key, label: rw.label, color: rw.color, value: rw.value }));
  const scaleMax = Math.min(100, Math.max(10, ...rows.map(rw => Math.max(rw.current || 0, rw.target || 0))) * 1.12);
  return (
    <Card className="ov-verdeling" data-testid="verdeling-card" title="Verdeling" meta={subtitle}
      actions={<button type="button" className="ov-link" onClick={goPlan}>Plan <Icon name="arrow-right" size={12} /></button>}
      footer={!hasTargets && pinIndex == null ? <span>Nog geen doelverdeling · <button type="button" className="ov-link ov-link--strong" onClick={goPlan}>Doel instellen <Icon name="arrow-right" size={12} /></button></span> : null}>
      {rows.length === 0 ? <EmptyState icon="layers" title="Nog geen posities" /> : (
        <>
          <AllocationBar segments={segs} height={10} privacy={privacy} ariaLabel="Verdeling per categorie" onSegmentClick={goPlan} />
          <div className="ov-vrows">
            {rows.map(rw => (
              <button key={rw.key} type="button" className={ovCx('ov-vrow', !hasTargets && 'ov-vrow--nodrift')} onClick={goPlan}
                title={privacy ? rw.label : `${rw.label} · ${fmtMoney(rw.value)}`}>
                <span className="ov-vrow__lab"><Swatch color={rw.color} size={9} />{rw.label}</span>
                <BulletTrack current={rw.current} target={hasTargets ? rw.target : null} scaleMax={scaleMax} color={rw.color}
                  tolerance={hasTargets ? ATTENTION_THRESHOLDS.driftPt : null} />
                <span className="ov-vrow__num">{fmtPct(rw.current, { decimals: 1, sign: false })}</span>
                {hasTargets && (
                  <span className={ovCx('ov-vrow__drift', rw.outside && 'ov-vrow__drift--out')}>
                    {rw.outside && <Icon name="triangle-alert" size={12} />}{fmtPt(rw.drift)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

// ===================================================================
// Desktop cards
// ===================================================================
function OvPrestatiesCard({ app, pf }) {
  const { model, prefs } = app;
  const privacy = !!prefs.privacy;
  const stamp = ovStamp(app);
  const label = pf.ci != null ? `Waarde op ${fmtDateLong(pf.dates[pf.ci])}` : (pf.exclPE ? 'Waarde excl. private equity' : 'Totale waarde');
  const t = model.totals;
  const days = pf.histDays;
  let kpi1, kpi1sub;
  if (days < 365) { kpi1 = t.pnlPct; kpi1sub = `over ${Math.max(1, Math.round(days / 30.44))} mnd`; }
  else { kpi1 = pf.xirrPct; kpi1sub = 'geldgewogen · sinds start'; }
  const twr = pf.fullStats && pf.fullStats.twrGaps === 0 ? pf.fullStats.twr : null;
  const perLabel = (PERIODS.find(p => p.key === pf.periodKey) || {}).label;
  const feePct = t.invested > 0 ? t.fees / t.invested * 100 : null;
  const tone = v => (v == null ? null : v > 0 ? 'ov-gain' : v < 0 ? 'ov-loss' : null);
  const twrGapNote = pf.mode === 'return' && pf.fullStats && pf.fullStats.twrGaps > 0 && !pf.twrAllNull;

  return (
    <Card className="ov-perf" title={null}>
      <div className="ov-perf__top">
        <div className="ov-perf__hero">
          <div className="ov-label">{label}{stamp && pf.ci == null && <span className="ov-stamp"> · {stamp}</span>}</div>
          <OvHeroValue value={pf.heroValue} privacy={privacy} testId="hero-value" />
          <div className="ov-deltarow" data-testid="hero-delta">
            <Delta value={pf.deltaGain} pct={pf.deltaPct} size="md" context={pf.context} />
          </div>
          <div className="ov-subrow">
            <span>Netto ingelegd <b>{privacy ? '€ •••••' : fmtMoney(pf.heroNet)}</b></span>
            <span className={pf.heroWinst > 0.5 ? 'ov-gain' : pf.heroWinst < -0.5 ? 'ov-loss' : null}>
              <span style={{ color: 'var(--fg-muted)' }}>Totale winst </span><b>{privacy ? '€ •••••' : fmtMoney(pf.heroWinst, { sign: true })}</b>
              {pf.ci == null && pf.restPnlPct != null && <span style={{ color: 'var(--fg-muted)' }}> ({fmtPct(pf.restPnlPct, { decimals: 1 })} op inleg)</span>}
            </span>
            <InfoTip label="Hoe berekenen we je winst?" text={<OvExplainer />} />
          </div>
        </div>
        <div className="ov-perf__ctrl">
          {pf.pinned && (
            <Chip active className="ov-pin" data-testid="pin-chip" onClick={() => pf.setCursor(null)}
              onRemove={() => pf.setCursor(null)} removeLabel="Peildatum wissen">
              Peildatum {fmtDateLong(pf.dates[pf.ci])}
            </Chip>
          )}
          <Segmented size="sm" ariaLabel="Periode" value={pf.periodKey} onChange={k => app.setPrefs({ period: k })} options={pf.periodOptions} />
        </div>
      </div>
      <div className="ov-legend">
        <div className="ov-legend__items" aria-hidden="true">
          {pf.mode === 'value' ? (
            <>
              <span className="ov-key"><span className="ov-key__line" />Waarde</span>
              <span className="ov-key"><span className="ov-key__step" />Netto ingelegd</span>
              <span className="ov-key"><span className="ov-key__band" />Winst</span>
              <span className="ov-key"><span className="ov-key__dia" />Waardering</span>
              <span className="ov-key"><span className="ov-key__ring" />Opname</span>
            </>
          ) : <span className="ov-key"><span className="ov-key__line" />Tijdgewogen rendement</span>}
        </div>
        {pf.hasPE && (
          <Chip active={!!prefs.exclPE} onClick={() => app.setPrefs({ exclPE: !prefs.exclPE })}>Excl. PE</Chip>
        )}
        <Segmented size="sm" ariaLabel="Grafiekweergave" value={pf.mode} onChange={v => app.setPrefs({ chartMode: v })}
          options={[{ value: 'value', label: 'Waarde' }, { value: 'return', label: 'Rendement' }]} />
      </div>
      <div className="ov-chartwrap">
        <PerformanceChart testId="perf-chart" dates={pf.chartDates} primary={pf.primary} secondary={pf.secondary}
          kind={pf.mode === 'return' ? 'pct' : 'money'} height={220} markers={pf.mode === 'value' ? pf.markers : null}
          liveDot={app.spotStatus && !app.spotStatus.error && app.spotStatus.fetchedAt ? 'live' : 'static'}
          cursor={pf.ci != null ? pf.ci - pf.r.i0 : null} pinned={pf.pinned} pinnable onCursor={pf.onCursor}
          ariaLabel={pf.mode === 'return' ? 'Tijdgewogen rendement over de periode' : 'Waarde en netto ingelegd over de periode'}
          valueText={pf.valueText} privacy={privacy}
          emptyText={pf.twrAllNull ? 'Tijdgewogen rendement niet beschikbaar voor deze periode' : undefined} />
      </div>
      {twrGapNote && <div className="ov-chartnote">Koershistorie onvolledig; dagen zonder koers zijn overgeslagen.</div>}
      {pf.setsDiffer && <div className="ov-chartnote">Grafiek: {pf.notInChart} partij(en) niet meegeteld</div>}
      <div className="ov-kpis" data-testid="kpi-strip">
        <KpiCell label="Rendement p.j." info="Geldgewogen jaarrendement (XIRR) over alle stortingen en opnames sinds de start."
          value={<span className={tone(kpi1)}>{kpi1 == null ? '—' : fmtPct(kpi1, { decimals: 1 }) + (days >= 365 ? ' p.j.' : '')}</span>} sub={kpi1sub} />
        <KpiCell label={`Tijdgewogen · ${perLabel}`} value={<span className={tone(twr)}>{twr == null ? '—' : fmtPct(twr, { decimals: 1 })}</span>} sub="excl. stortingen" />
        <KpiCell label="Inkomsten · 12 mnd" info={`Dividend en rente sinds start: ${privacy ? '€ •••••' : fmtMoney(t.income || 0)}`}
          value={<Money value={t.income12m || 0} />} sub="dividend en rente" />
        <KpiCell label="Kosten" value={<Money value={-(t.fees || 0)} />}
          sub={`${t.feeTxCount} transacties met kosten${feePct != null ? ' · ' + fmtPct(feePct, { decimals: 1, sign: false }) + ' van ingelegd' : ''}`} />
      </div>
    </Card>
  );
}

function OvPositiesCard({ app, pinIndex }) {
  const t = app.model.totals;
  return (
    <Card className="ov-pos" title="Posities" meta={`${t.openCount} open · ${t.closedCount} gesloten`} padding={0} bodyClassName="ov-pos__body"
      actions={<button type="button" className="ov-link" onClick={() => app.navigate('/posities')}>Alle posities <Icon name="arrow-right" size={12} /></button>}>
      {window.HoldingsTable ? <HoldingsTable app={app} variant="compact" asOfIndex={pinIndex} /> : null}
    </Card>
  );
}

function OvMonthlyCard({ app }) {
  const months = useMemo(() => monthlyNetFlows(seriesExcluding(app.model.series, [FIN_OVER_PARTY_ID]), 12), [app.model.series]);
  const net = months.reduce((a, m) => a + (m.net || 0), 0);
  const privacy = !!app.prefs.privacy;
  return (
    <Card title="Netto inleg per maand" meta={`netto ${privacy ? '€ •••••' : fmtMoney(net, { sign: true })} · laatste 12 mnd`}
      actions={<button type="button" className="ov-link" onClick={() => app.navigate('/transacties?view=maand')}>Per maand <Icon name="arrow-right" size={12} /></button>}>
      <MonthlyFlowBars months={months} height={140} privacy={privacy} />
    </Card>
  );
}

function OvResultCard({ app }) {
  const { model, prefs } = app;
  const mode = prefs.resultMode === 'pct' ? 'pct' : 'eur';
  const inc = s => (s.party.includeInTotal ?? s.party.includeInPortfolio) !== false;
  const rows = model.open.filter(inc).map(s => ({ id: s.party.id, label: s.party.name, value: mode === 'eur' ? s.pnl : (s.invested > 0 ? s.pnlPct : 0) }));
  const closed = model.closed.filter(inc);
  const closedRow = mode === 'eur' && closed.length ? { label: `Gesloten (${closed.length})`, value: closed.reduce((a, s) => a + (s.pnl || 0), 0) } : null;
  return (
    <Card title="Resultaat per positie" meta="sinds start"
      actions={<Segmented size="sm" ariaLabel="Eenheid" value={mode} onChange={v => app.setPrefs({ resultMode: v })}
        options={[{ value: 'eur', label: '€' }, { value: 'pct', label: '%' }]} />}>
      {rows.length ? <DivergingBars rows={rows} mode={mode} closedRow={closedRow} privacy={!!prefs.privacy}
        onRowClick={row => row && row.id && app.navigate('/posities/' + encodeURIComponent(row.id))} />
        : <EmptyState icon="layers" title="Nog geen open posities" />}
    </Card>
  );
}

function ovRecentTxs(app, n = 5) {
  return app.state.transactions.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '') || String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))).slice(0, n);
}

function OvActivityCard({ app }) {
  const txs = ovRecentTxs(app);
  return (
    <Card title="Recente activiteit"
      actions={<button type="button" className="ov-link" onClick={() => app.navigate('/transacties')}>Alle transacties <Icon name="arrow-right" size={12} /></button>}>
      {txs.length ? (window.TxList ? <TxList app={app} txs={txs} variant="activity" limit={5} /> : null)
        : <EmptyState icon="receipt" title="Nog geen transacties" />}
    </Card>
  );
}

function OvFirstRun({ app }) {
  return (
    <Card style={{ margin: app.isMobile ? 16 : 20 }}>
      <div className="ov-first">
        <div>
          <div className="ov-label">Totale waarde</div>
          <OvHeroValue value={0} privacy={false} testId="hero-value" />
          <div className="ov-small">Nog geen posities</div>
        </div>
        <div className="ov-first__ph" aria-hidden="true" />
        <div className="ov-first__steps">
          <span><b>1</b>Voeg een partij toe →</span>
          <span><b>2</b>Registreer je eerste inleg →</span>
          <span><b>3</b>Bekijk je overzicht</span>
        </div>
        <EmptyState title="Begin met je eerste transactie"
          action={{ label: 'Eerste transactie toevoegen', onClick: () => app.openTx(), testId: 'quick-transactie' }}
          secondary={{ label: 'Importeer uit Trading 212', onClick: () => app.navigate('/instellingen/t212') }} />
      </div>
    </Card>
  );
}

function OvDesktop({ app }) {
  const pf = useOvPerformance(app);
  const widgets = app.state.widgets;
  const on = id => isModuleEnabled(widgets, id);
  const topRef = useRef(null);
  const [stacked, setStacked] = useState(false);
  useEffect(() => {
    const el = topRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => setStacked(el.clientWidth < 560 + 380 + 12));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const items = useMemo(() => ovAttentionItems(app), [app.model, app.state.targetAllocation, app.syncStatus, app.spotStatus, app.spots]);
  const pinIndex = pf.pinned ? pf.ci : null;
  const showVerd = on('allocation'), showAttn = on('attention');
  const row3 = [on('monthly_inleg') && <OvMonthlyCard key="m" app={app} />, on('returns') && <OvResultCard key="r" app={app} />, on('activity_feed') && <OvActivityCard key="a" app={app} />].filter(Boolean);
  return (
    <div className="ov-desk">
      <div className="ov-top" ref={topRef}>
        <div className="ov-left">
          <OvPrestatiesCard app={app} pf={pf} />
          {(showVerd || showAttn) && (
            <div className="ov-row2">
              {showVerd && <OvVerdelingCard app={app} pinIndex={pinIndex} />}
              {showAttn && <OvAttentionCard app={app} items={items} />}
            </div>
          )}
        </div>
        {on('party_grid') && (
          <div className={ovCx('ov-right', stacked && 'ov-right--stacked')}>
            <OvPositiesCard app={app} pinIndex={pinIndex} />
          </div>
        )}
      </div>
      {row3.length > 0 && <div className="ov-row3">{row3}</div>}
    </div>
  );
}

// ===================================================================
// Mobile
// ===================================================================
function OvVoorJou({ app, items }) {
  const { model, state, prefs } = app;
  const on = id => isModuleEnabled(state.widgets, id);
  const privacy = !!prefs.privacy;
  const ref = useRef(null);
  const [page, setPage] = useState(0);
  const cards = [];
  if (on('attention')) {
    const drift = items.find(it => it.drift);
    cards.push(
      <Card key="attn" data-testid="attention-card" title="Aandacht" meta={items.length ? String(items.length) : null}>
        {items.length ? <OvAttentionList items={items} max={3} /> : <div className="ov-ok"><Icon name="check" size={16} />Alles up-to-date</div>}
        {drift && <button type="button" className="ov-link ov-link--strong ov-fy__cta" onClick={() => app.navigate('/plan/verdeling?focus=storten')}>Storting plannen <Icon name="chevron-right" size={14} /></button>}
      </Card>
    );
  }
  if (on('pension_card')) {
    const inputs = { ...PENSION_DEFAULTS, ...(state.pensionInputs || {}) };
    const pn = computePension(inputs, model.totals.value);
    cards.push(
      <Card key="pens" title={`Pensioen op ${inputs.retireAge}`} actions={pn.onTrack ? <Pill tone="neutral" icon="check">Op koers</Pill> : <Pill tone="warn">Tekort</Pill>}>
        <div className="ov-big">{fmtPct(pn.progress, { decimals: 0, sign: false })} <span className="ov-small">van je doel</span></div>
        <div className="ov-track" aria-hidden="true">
          <div className="ov-track__fill" style={{ width: Math.min(100, pn.progress) + '%' }} />
          {[25, 50, 75].map(t => <span key={t} className="ov-track__tick" style={{ left: t + '%' }} />)}
        </div>
        <div className="ov-small">Verwacht <b>{privacy ? '€ •••••' : fmtMoney(pn.fvCurrent)}</b> van <b>{privacy ? '€ •••••' : fmtCompact(pn.neededCorpusReal)}</b></div>
        {!pn.onTrack && pn.monthlySavings > 0 && <div className="ov-small">Nodig: <b>{privacy ? '€ •••••' : fmtMoney(pn.monthlySavings)}</b> per maand</div>}
        <button type="button" className="ov-link ov-link--strong ov-fy__cta" onClick={() => app.navigate('/plan/pensioen')}>Bekijk pensioenplan <Icon name="chevron-right" size={14} /></button>
      </Card>
    );
  }
  if (on('monthly_inleg')) {
    // Schommelingen op Vrij op rekening zijn geen inleg in beleggingen.
    const months = monthlyNetFlows(seriesExcluding(model.series, [FIN_OVER_PARTY_ID]), 12);
    const net = months.reduce((a, m) => a + (m.net || 0), 0);
    cards.push(
      <Card key="inleg" title="Inleg per maand">
        <div className="ov-small"><b className="ov-big" style={{ fontSize: 24 }}>{privacy ? '€ •••••' : fmtMoney(net, { sign: true })}</b> netto, laatste 12 maanden</div>
        <MonthlyFlowBars months={months} height={64} mini showAverage={false} privacy={privacy} />
        <div className="ov-small">Gemiddeld <b>{privacy ? '€ •••••' : fmtMoney(net / 12)}</b> per maand</div>
        <button type="button" className="ov-link ov-link--strong ov-fy__cta" onClick={() => app.navigate('/transacties?view=maand')}>Per maand bekijken <Icon name="chevron-right" size={14} /></button>
      </Card>
    );
  }
  if (!cards.length) return null;
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const w = el.firstChild ? el.firstChild.getBoundingClientRect().width + 12 : el.clientWidth;
    setPage(Math.max(0, Math.min(cards.length - 1, Math.round(el.scrollLeft / w))));
  };
  return (
    <section aria-labelledby="ov-fy-title">
      <h2 className="ov-sect" id="ov-fy-title">Voor jou</h2>
      <div className="ov-fy" ref={ref} onScroll={onScroll}>{cards}</div>
      {cards.length > 1 && <div className="ov-dots" aria-hidden="true">{cards.map((_, i) => <span key={i} className={i === page ? 'is-on' : undefined} />)}</div>}
    </section>
  );
}

function OvMobile({ app }) {
  const pf = useOvPerformance(app);
  const { model, state, prefs } = app;
  const privacy = !!prefs.privacy;
  const on = id => isModuleEnabled(state.widgets, id);
  const [explain, setExplain] = useState(false);
  const items = useMemo(() => ovAttentionItems(app), [app.model, app.state.targetAllocation, app.syncStatus, app.spotStatus, app.spots]);
  const label = pf.ci != null ? `Waarde op ${fmtDateLong(pf.dates[pf.ci])}` : (pf.exclPE ? 'Waarde excl. private equity' : 'Totale waarde');
  const t = model.totals;
  const mobileCtx = pf.ci != null ? 't.o.v. begin periode' : ovPeriodContext(pf.periodKey, pf.dates);
  const drift = driftRows(model.summaries, state.targetAllocation);
  const targetsText = drift.hasTargets && drift.grouping !== 'party'
    ? 'Doel: ' + drift.rows.filter(rw => rw.target > 0).map(rw => fmtPct(rw.target, { decimals: 1, sign: false }).replace('%', '').replace(',0', '')).join(' / ')
    : null;
  const segs = model.classes.map(c => ({ key: c.key, label: c.label, color: c.color, value: c.value }));
  const synced = ovLatest(app.syncStatus && app.syncStatus.syncedAt);
  const recent = ovRecentTxs(app);
  return (
    <div className="ov-m">
      <section className="ov-m__hero" aria-label="Totale waarde">
        <div className="ov-label">{label}</div>
        <OvHeroValue value={pf.heroValue} privacy={privacy} testId="hero-value" />
        <div className="ov-deltarow" data-testid="hero-delta">
          <Delta value={pf.deltaGain} pct={pf.deltaPct} size="md" context={mobileCtx} />
        </div>
        <button type="button" className="ov-m__chip" onClick={() => setExplain(true)}>
          {pf.r.all && pf.ci == null ? 'op inleg' : 'excl. stortingen'} <Icon name="info" size={14} />
        </button>
        <div className="ov-m__cap">
          <CapitalBar invested={Math.max(0, pf.heroNet)} gain={pf.heroWinst} height={8} privacy={privacy} />
          <div className="ov-m__legend">
            <span><Swatch color="var(--cap-inleg)" size={10} />Netto ingelegd <b>{privacy ? '€ •••••' : fmtMoney(pf.heroNet)}</b></span>
            <span><Swatch color={pf.heroWinst < 0 ? 'var(--loss-fill)' : 'var(--gain-fill)'} size={10} />{pf.heroWinst < 0 ? 'Verlies' : 'Totale winst'} <b className={pf.heroWinst < 0 ? 'ov-loss' : 'ov-gain'}>{privacy ? '€ •••••' : fmtMoney(pf.heroWinst, { sign: true })}</b></span>
          </div>
        </div>
      </section>

      <div>
        <div className="ov-m__chart">
          <PerformanceChart testId="perf-chart" compact dates={pf.chartDates} primary={pf.primary} secondary={pf.secondary}
            kind={pf.mode === 'return' ? 'pct' : 'money'} height={200}
            liveDot={app.spotStatus && !app.spotStatus.error && app.spotStatus.fetchedAt ? 'live' : 'static'}
            cursor={pf.ci != null ? pf.ci - pf.r.i0 : null} onCursor={pf.onCursor}
            ariaLabel={pf.mode === 'return' ? 'Tijdgewogen rendement over de periode' : 'Waarde en netto ingelegd over de periode'}
            valueText={pf.valueText} privacy={privacy}
            emptyText={pf.twrAllNull ? 'Tijdgewogen rendement niet beschikbaar voor deze periode' : undefined} />
        </div>
        <div className="ov-m__periods" style={{ marginTop: 10 }}>
          <Segmented pill full ariaLabel="Periode" value={pf.periodKey} onChange={k => app.setPrefs({ period: k })} options={pf.periodOptions} />
          <IconButton icon="trending-up" label="Rendement tonen" pressed={pf.mode === 'return'}
            onClick={() => app.setPrefs({ chartMode: pf.mode === 'return' ? 'value' : 'return' })} />
        </div>
      </div>

      <nav className="ov-quick" aria-label="Snelle acties">
        <button type="button" className="ov-quick__btn ov-quick__btn--ink" data-testid="quick-transactie" onClick={() => app.openTx()}>
          <span className="ov-quick__well"><Icon name="plus" size={22} /></span>Transactie</button>
        <button type="button" className="ov-quick__btn" data-testid="quick-waardering" onClick={() => app.openTx({ type: 'waardering' })}>
          <span className="ov-quick__well"><Icon name="pencil" size={20} /></span>Waardering</button>
        <button type="button" className="ov-quick__btn" data-testid="quick-storten" onClick={() => app.navigate('/plan/verdeling?focus=storten')}>
          <span className="ov-quick__well"><Icon name="calculator" size={20} /></span>Storten</button>
        <button type="button" className="ov-quick__btn" data-testid="quick-koersen" onClick={() => app.openPrices()}>
          <span className="ov-quick__well"><Icon name="refresh-cw" size={20} /></span>Koersen</button>
      </nav>

      <OvVoorJou app={app} items={items} />

      {on('party_grid') && (
        <Card title="Bezittingen" meta={`${t.openCount} posities`}
          actions={<button type="button" className="ov-link ov-link--strong" onClick={() => app.navigate('/posities')}>Alle posities <Icon name="chevron-right" size={14} /></button>}>
          {on('allocation') && segs.length > 0 && (
            <>
              <AllocationBar segments={segs} height={14} privacy={privacy} ariaLabel="Verdeling per categorie" onSegmentClick={() => app.navigate('/plan/verdeling')} />
              <div className="ov-caption"><span>Verdeling per categorie</span>{targetsText && <span>{targetsText}</span>}</div>
            </>
          )}
          {window.HoldingsList ? <HoldingsList app={app} variant="overview" /> : null}
        </Card>
      )}

      {on('activity_feed') && (
        <Card title="Recente activiteit"
          actions={<button type="button" className="ov-link ov-link--strong" onClick={() => app.navigate('/transacties')}>{t.txCount} transacties <Icon name="chevron-right" size={14} /></button>}>
          {recent.length ? (window.TxList ? <TxList app={app} txs={recent} variant="activity" limit={5} /> : null)
            : <EmptyState icon="receipt" title="Nog geen transacties" />}
        </Card>
      )}

      <div className="ov-mfoot">
        {synced ? `Gesynchroniseerd om ${fmtTime(synced.toISOString())} · ` : ''}{t.txCount} transacties{t.firstTxDate ? ` sinds ${fmtDateLong(t.firstTxDate)}` : ''}
      </div>

      <Sheet open={explain} onClose={() => setExplain(false)} title="Hoe berekenen we je winst?" size="medium">
        <OvExplainer />
      </Sheet>
    </div>
  );
}

function OverzichtScreen({ app }) {
  if (!app.model || !app.model.totals.txCount) return <OvFirstRun app={app} />;
  return app.isMobile ? <OvMobile app={app} /> : <OvDesktop app={app} />;
}

Object.assign(window, { OverzichtScreen });
