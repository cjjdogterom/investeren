// Dividend: alles wat je aan dividend ontving, per maand/jaar, per positie en per aandeel, plus de losse uitkeringen.
// Bron: transacties van het type 'dividend' (Trading 212 komt automatisch via de koppeling; Meesman en andere boek je zelf).
// Herbelegd dividend (extra stukken, zoals bij Meesman) telt mee tegen de koers van die dag.
const { useState: dvUseState, useMemo: dvUseMemo } = React;

injectStyles('dividend', `
.dv-page { display: grid; gap: 16px; min-width: 0; padding: 20px 24px 48px; max-width: 1100px; }
.dv-head h1 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -0.01em; }
.dv-lead { margin: 4px 0 0; color: var(--fg-muted); font-size: 13.5px; line-height: 1.5; }
.dv-sum { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: var(--r-card); overflow: clip; }
.dv-sum > div { background: var(--surface); padding: 12px 14px; }
.dv-sum__l { font-size: 12px; color: var(--fg-muted); }
.dv-sum__v { font-size: 20px; font-weight: 650; margin-top: 2px; font-variant-numeric: tabular-nums; }
.dv-sum__s { font-size: 11.5px; color: var(--fg-subtle); margin-top: 1px; }
.dv-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-card); padding: 16px; min-width: 0; }
.dv-card h2 { margin: 0 0 10px; font-size: 15px; font-weight: 650; display: flex; align-items: center; gap: 10px; }
.dv-card h2 span { flex: 1; }
.dv-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; }
.dv-bars { display: flex; align-items: flex-end; gap: 4px; height: 150px; }
.dv-bar { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; position: relative; cursor: default; }
.dv-bar__fill { border-radius: 4px 4px 0 0; display: flex; flex-direction: column-reverse; overflow: hidden; min-height: 0; }
.dv-bar__fill span { display: block; }
.dv-bar__lbl { font-size: 10.5px; color: var(--fg-subtle); text-align: center; margin-top: 4px; white-space: nowrap; }
.dv-bar__val { font-size: 10.5px; color: var(--fg-muted); text-align: center; margin-bottom: 2px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dv-rows { display: grid; }
.dv-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 12px; padding: 8px 0; border-top: 1px solid var(--border); font-size: 13.5px; }
.dv-row:first-child { border-top: 0; }
.dv-row__n { display: flex; align-items: center; gap: 8px; min-width: 0; }
.dv-row__n i { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dv-row__n b { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dv-row__n small { color: var(--fg-muted); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dv-row__v { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
.dv-row__bar { grid-column: 1 / -1; height: 3px; background: var(--surface-2); border-radius: 2px; overflow: hidden; }
.dv-row__bar span { display: block; height: 100%; }
.dv-list { width: 100%; border-collapse: collapse; font-size: 13px; font-variant-numeric: tabular-nums; }
.dv-list th, .dv-list td { padding: 7px 8px; border-bottom: 1px solid var(--border); text-align: left; white-space: nowrap; }
.dv-list th { font-size: 11.5px; color: var(--fg-muted); font-weight: 600; }
.dv-list td.n, .dv-list th.n { text-align: right; }
.dv-list tr { cursor: pointer; }
.dv-list tbody tr:hover { background: var(--surface-2); }
.dv-tag { font-size: 11px; padding: 1px 6px; border-radius: 999px; background: var(--surface-2); color: var(--fg-muted); }
.dv-empty { color: var(--fg-muted); font-size: 13.5px; padding: 8px 0; }
.dv-mini { display: grid; gap: 8px; }
.dv-mini__big { font-size: 24px; font-weight: 650; font-variant-numeric: tabular-nums; }
.dv-mini__row { display: flex; gap: 14px; font-size: 12.5px; color: var(--fg-muted); flex-wrap: wrap; }
.dv-mini__row b { color: var(--fg); font-weight: 600; }
@media (max-width: 900px) { .dv-grid { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 767.98px) {
  .dv-page { padding: 12px 16px 24px; gap: 12px; }
  .dv-sum { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dv-list .dv-hide { display: none; }
}
`);

const DV_PALETTE = ['#4C78A8', '#F58518', '#54A24B', '#E45756', '#B279A2', '#EECA3B', '#72B7B2', '#9D755D', '#FF9DA6', '#2E86AB'];
const DV_MON = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

// Alle dividenduitkeringen, met bedrag in euro en waar het vandaan komt.
function dvCollect(app) {
  const byId = (app.model && app.model.byId) || {};
  const quotes = app.stockQuotes || {};
  return ((app.state && app.state.transactions) || [])
    .filter(t => t && t.type === 'dividend' && t.date)
    .map(t => {
      const party = byId[t.party] && byId[t.party].party;
      const bedrag = txGross(t);
      const herbelegd = +t.quantity > 0 && dtTxPrice(t) > 0;
      const sym = t.instrument ? normalizeTicker(t.instrument) : null;
      const q = sym && quotes[sym];
      return { t, id: t.id, date: t.date, bedrag, herbelegd, partyId: t.party, partyName: (party && party.name) || t.party,
        sym, symName: q && q.name ? q.name : null, key: sym ? `${t.party}|${sym}` : t.party };
    })
    .filter(x => x.bedrag > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function dvStats(list, today = todayIsoLocal()) {
  const sum = arr => arr.reduce((a, x) => a + x.bedrag, 0);
  const jaar = today.slice(0, 4);
  const van12 = addDaysIso(today, -365);
  const l12 = list.filter(x => x.date > van12);
  return { totaal: sum(list), ditJaar: sum(list.filter(x => x.date.startsWith(jaar))), l12: sum(l12), perMaand: sum(l12) / 12, aantal: list.length, eerste: list.length ? list[list.length - 1].date : null };
}

function DvBars({ list, per, privacy }) {
  const today = todayIsoLocal();
  const keys = [];
  if (per === 'jaar') {
    const first = list.length ? +list[list.length - 1].date.slice(0, 4) : +today.slice(0, 4);
    for (let y = first; y <= +today.slice(0, 4); y++) keys.push(String(y));
  } else {
    let y = +today.slice(0, 4), m = +today.slice(5, 7);
    for (let i = 0; i < 12; i++) { keys.unshift(`${y}-${String(m).padStart(2, '0')}`); m--; if (m < 1) { m = 12; y--; } }
  }
  const parties = [...new Set(list.map(x => x.partyName))];
  const color = name => DV_PALETTE[parties.indexOf(name) % DV_PALETTE.length];
  const cols = keys.map(k => {
    const items = list.filter(x => x.date.startsWith(k));
    const byP = {};
    items.forEach(x => { byP[x.partyName] = (byP[x.partyName] || 0) + x.bedrag; });
    return { k, total: items.reduce((a, x) => a + x.bedrag, 0), byP };
  });
  const max = Math.max(1, ...cols.map(c => c.total));
  return (
    <>
      <div className="dv-bars" role="img" aria-label={`Dividend per ${per}`}>
        {cols.map(c => (
          <div key={c.k} className="dv-bar" title={`${c.k}: ${privacy ? '€ •••' : fmtMoney(c.total, { decimals: 2 })}`}>
            {c.total > 0 && per === 'jaar' && <div className="dv-bar__val">{privacy ? '•••' : fmtMoney(c.total, { decimals: 0 })}</div>}
            <div className="dv-bar__fill" style={{ height: `${Math.max(c.total > 0 ? 3 : 0, c.total / max * (per === 'jaar' ? 82 : 92))}%` }}>
              {Object.entries(c.byP).map(([n, v]) => <span key={n} style={{ height: `${v / c.total * 100}%`, background: color(n) }} />)}
            </div>
            <div className="dv-bar__lbl">{per === 'jaar' ? c.k : DV_MON[+c.k.slice(5, 7) - 1]}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: 10, fontSize: 12, color: 'var(--fg-muted)' }}>
        {parties.map(n => <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><i style={{ width: 9, height: 9, borderRadius: 3, background: color(n), display: 'inline-block' }} />{n}</span>)}
      </div>
    </>
  );
}

function DividendScreen({ app }) {
  const [per, setPer] = dvUseState('maand');
  const [limit, setLimit] = dvUseState(20);
  const privacy = !!(app.prefs && app.prefs.privacy);
  const m = (v, d = 2) => (privacy ? '€ •••••' : fmtMoney(v, { decimals: d }));
  const list = dvUseMemo(() => dvCollect(app), [app.state && app.state.transactions, app.model, app.stockQuotes]); // eslint-disable-line
  const st = dvStats(list);
  // Per bron (positie + aandeel)
  const perBron = dvUseMemo(() => {
    const map = new Map();
    for (const x of list) {
      const r = map.get(x.key) || { key: x.key, naam: x.sym ? (x.symName || x.sym) : x.partyName, sub: x.sym ? `${x.partyName} · ${x.sym}` : (x.herbelegd ? 'herbelegd in stukken' : 'uitgekeerd'), totaal: 0, l12: 0, aantal: 0, laatste: x.date };
      r.totaal += x.bedrag; r.aantal++;
      if (x.date > addDaysIso(todayIsoLocal(), -365)) r.l12 += x.bedrag;
      map.set(x.key, r);
    }
    return [...map.values()].sort((a, b) => b.totaal - a.totaal);
  }, [list]);
  const maxB = Math.max(1, ...perBron.map(r => r.totaal));
  return (
    <div className="dv-page">
      <div className="dv-head">
        {!app.isMobile && <h1>Dividend</h1>}
        <p className="dv-lead">Alle ontvangen dividend. Trading 212 komt automatisch binnen via de koppeling; dividend van Meesman of andere beleggingen boek je als transactie <b>Dividend</b> (uitgekeerd in euro of herbelegd in extra stukken).</p>
      </div>
      <div className="dv-sum">
        <div><div className="dv-sum__l">Totaal ontvangen</div><div className="dv-sum__v">{m(st.totaal)}</div><div className="dv-sum__s">{st.aantal} uitkeringen{st.eerste ? ` sinds ${fmtDateShort(st.eerste)}` : ''}</div></div>
        <div><div className="dv-sum__l">Dit jaar</div><div className="dv-sum__v">{m(st.ditJaar)}</div><div className="dv-sum__s">{todayIsoLocal().slice(0, 4)}</div></div>
        <div><div className="dv-sum__l">Laatste 12 maanden</div><div className="dv-sum__v">{m(st.l12)}</div><div className="dv-sum__s">gem. {m(st.perMaand)} per maand</div></div>
        <div><div className="dv-sum__l">Laatste uitkering</div><div className="dv-sum__v">{list[0] ? m(list[0].bedrag) : '—'}</div><div className="dv-sum__s">{list[0] ? `${list[0].sym || list[0].partyName} · ${fmtDateShort(list[0].date)}` : ''}</div></div>
      </div>
      <div className="dv-grid">
        <section className="dv-card">
          <h2><span>Per {per === 'jaar' ? 'jaar' : 'maand'}</span>
            <Segmented size="sm" ariaLabel="Periode" value={per} onChange={setPer} options={[{ value: 'maand', label: '12 mnd' }, { value: 'jaar', label: 'Per jaar' }]} /></h2>
          {list.length ? <DvBars list={list} per={per} privacy={privacy} /> : <div className="dv-empty">Nog geen dividend ontvangen.</div>}
        </section>
        <section className="dv-card">
          <h2><span>Per aandeel of fonds</span></h2>
          <div className="dv-rows">
            {perBron.map((r, i) => (
              <div key={r.key} className="dv-row">
                <span className="dv-row__n"><i style={{ background: DV_PALETTE[i % DV_PALETTE.length] }} /><span style={{ minWidth: 0, display: 'grid' }}><b>{r.naam}</b><small>{r.sub} · {r.aantal}×</small></span></span>
                <span className="dv-row__v">{m(r.totaal)}<div style={{ fontSize: 11.5, color: 'var(--fg-muted)', fontWeight: 400 }}>12 mnd {m(r.l12)}</div></span>
                <span className="dv-row__bar"><span style={{ width: r.totaal / maxB * 100 + '%', background: DV_PALETTE[i % DV_PALETTE.length] }} /></span>
              </div>
            ))}
            {!perBron.length && <div className="dv-empty">—</div>}
          </div>
        </section>
      </div>
      <section className="dv-card">
        <h2><span>Uitkeringen</span></h2>
        {list.length ? (
          <table className="dv-list">
            <thead><tr><th>Datum</th><th>Van</th><th className="dv-hide">Positie</th><th className="dv-hide">Soort</th><th className="n">Bedrag</th></tr></thead>
            <tbody>
              {list.slice(0, limit).map(x => (
                <tr key={x.id} onClick={() => app.openTxDetail(x.id)}>
                  <td>{fmtDateShort(x.date)}</td>
                  <td>{x.sym || x.partyName}{x.symName ? <span style={{ color: 'var(--fg-muted)' }}> · {x.symName}</span> : null}</td>
                  <td className="dv-hide">{x.partyName}</td>
                  <td className="dv-hide"><span className="dv-tag">{x.herbelegd ? 'herbelegd' : 'uitgekeerd'}</span></td>
                  <td className="n"><b>{m(x.bedrag)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="dv-empty">Nog geen uitkeringen.</div>}
        {list.length > limit && <div style={{ textAlign: 'center', marginTop: 10 }}><Button size="sm" variant="ghost" onClick={() => setLimit(l => l + 40)}>Meer tonen ({list.length - limit})</Button></div>}
      </section>
    </div>
  );
}

// Kleine kaart voor Overzicht.
function OvDividendCard({ app, mini = false }) {
  const privacy = !!(app.prefs && app.prefs.privacy);
  const list = dvUseMemo(() => dvCollect(app), [app.state && app.state.transactions, app.model, app.stockQuotes]); // eslint-disable-line
  const st = dvStats(list);
  const m = v => (privacy ? '€ •••••' : fmtMoney(v, { decimals: 2 }));
  return (
    <Card title="Dividend" meta={mini ? undefined : `${st.aantal} uitkeringen`}
      actions={mini ? undefined : <button type="button" className="ov-link" onClick={() => app.navigate('/dividend')}>Bekijken <Icon name="arrow-right" size={12} /></button>}>
      <div className="dv-mini">
        <div><span className="dv-mini__big">{m(st.totaal)}</span> <span style={{ color: 'var(--fg-muted)', fontSize: 12.5 }}>totaal ontvangen</span></div>
        <div className="dv-mini__row"><span>Dit jaar <b>{m(st.ditJaar)}</b></span><span>12 mnd <b>{m(st.l12)}</b></span>{list[0] && <span>Laatst <b>{list[0].sym || list[0].partyName} {m(list[0].bedrag)}</b> · {fmtDateShort(list[0].date)}</span>}</div>
        {mini && <button type="button" className="ov-link ov-link--strong ov-fy__cta" onClick={() => app.navigate('/dividend')}>Dividendoverzicht <Icon name="chevron-right" size={14} /></button>}
      </div>
    </Card>
  );
}

Object.assign(window, { DividendScreen, OvDividendCard, dvCollect, dvStats });
