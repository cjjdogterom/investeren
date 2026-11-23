// Plan → Inleg: hoe je netto inleg (stortingen/aankopen min opnames/verkopen) per maand of jaar over je beleggingen verdeeld is.
// Bron: model.series.netByParty (netto ingelegd per dag per positie); per periode = stand aan het eind − stand aan het begin.
const { useState: ilUseState, useMemo: ilUseMemo } = React;

injectStyles('inleg', `
.il-wrap { display: grid; gap: 16px; min-width: 0; }
.il-bar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.il-bar__sp { flex: 1; }
.il-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-card); padding: 16px; min-width: 0; }
.il-card h2 { margin: 0 0 2px; font-size: 15px; font-weight: 650; }
.il-sub { color: var(--fg-muted); font-size: 12.5px; margin: 0 0 12px; }
.il-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 10px; font-size: 12px; color: var(--fg-muted); }
.il-legend span { display: inline-flex; align-items: center; gap: 6px; }
.il-legend i { width: 9px; height: 9px; border-radius: 3px; display: inline-block; }
.il-chart { position: relative; width: 100%; }
.il-chart svg { display: block; width: 100%; overflow: visible; }
.il-tip { position: absolute; top: 0; pointer-events: none; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0,0,0,.12)); padding: 8px 10px; font-size: 12px; min-width: 170px; z-index: 2; }
.il-tip b { display: block; font-size: 12.5px; margin-bottom: 4px; }
.il-tip div { display: flex; justify-content: space-between; gap: 12px; font-variant-numeric: tabular-nums; }
.il-tip em { font-style: normal; color: var(--fg-muted); }
.il-tablewrap { overflow-x: auto; }
.il-table { width: 100%; border-collapse: collapse; font-size: 13px; font-variant-numeric: tabular-nums; }
.il-table th, .il-table td { padding: 7px 10px; border-bottom: 1px solid var(--border); text-align: right; white-space: nowrap; }
.il-table th:first-child, .il-table td:first-child { text-align: left; position: sticky; left: 0; background: var(--surface); }
.il-table th { font-size: 11.5px; color: var(--fg-muted); font-weight: 600; }
.il-table tr.il-tot td { font-weight: 650; border-top: 1.5px solid var(--border-strong); }
.il-table td.il-zero { color: var(--fg-subtle); }
.il-name { display: inline-flex; align-items: center; gap: 8px; }
.il-name i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.il-pos { color: var(--gain); } .il-neg { color: var(--loss); }
.il-mlist { display: grid; }
.il-mrow { padding: 12px 0; border-top: 1px solid var(--border); display: grid; gap: 6px; }
.il-mrow:first-child { border-top: 0; }
.il-mrow__h { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; }
.il-stack { display: flex; height: 8px; border-radius: 4px; overflow: hidden; background: var(--surface-2); }
.il-stack span { display: block; height: 100%; }
.il-mrow__items { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12px; color: var(--fg-muted); font-variant-numeric: tabular-nums; }
.il-mrow__items span { display: inline-flex; align-items: center; gap: 5px; }
.il-mrow__items i { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
`);

const IL_PALETTE = ['#4C78A8', '#F58518', '#54A24B', '#E45756', '#B279A2', '#EECA3B', '#72B7B2', '#9D755D', '#FF9DA6', '#2E86AB', '#A0C15A', '#BAB0AC', '#7F3C8D', '#11A579', '#E73F74', '#3969AC'];
const IL_MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const ilLabel = (k, per) => (per === 'jaar' ? k : `${IL_MONTHS[+k.slice(5, 7) - 1]} ${k.slice(2, 4)}`);
const ilMoney = (v, privacy) => (privacy ? '€ •••' : (Math.abs(v) < 0.5 ? '—' : fmtMoney(v, { sign: true })));

// Netto inleg per periode per positie (of categorie).
function ilCompute(model, per, groep, range) {
  const ser = model.series;
  if (!ser || !ser.dates || !ser.dates.length) return { keys: [], rows: [], periods: [] };
  const dates = ser.dates;
  const ids = (ser.ids || Object.keys(ser.netByParty || {})).filter(id => id !== FIN_OVER_PARTY_ID);
  const keyOf = d => (per === 'jaar' ? d.slice(0, 4) : d.slice(0, 7));
  // index van de laatste dag per periode
  const lastIdx = new Map();
  dates.forEach((d, i) => lastIdx.set(keyOf(d), i));
  let periods = [...lastIdx.keys()];
  if (per === 'maand' && range !== 'alles') periods = periods.slice(-(+range));
  const firstIdxOf = new Map();
  dates.forEach((d, i) => { const k = keyOf(d); if (!firstIdxOf.has(k)) firstIdxOf.set(k, i); });
  const groupOf = id => {
    const p = model.byId[id] && model.byId[id].party;
    if (groep === 'categorie') {
      const cls = ASSET_CLASS_BY_KEY[assetClassOf({ category: p && p.category })];
      return { key: cls.key, label: cls.label, color: cls.color };
    }
    return { key: id, label: (p && p.name) || id, color: p ? partyColorOf(p) : 'var(--fg-subtle)' };
  };
  const series = new Map();   // groepkey → { label, color, vals: {periode: bedrag} }
  for (const id of ids) {
    const nn = ser.netByParty[id];
    if (!nn) continue;
    const g = groupOf(id);
    if (!series.has(g.key)) series.set(g.key, { key: g.key, label: g.label, color: g.color, vals: {} });
    const row = series.get(g.key);
    for (const k of periods) {
      const i1 = lastIdx.get(k), i0 = firstIdxOf.get(k) - 1;
      const v = (nn[i1] || 0) - (i0 >= 0 ? (nn[i0] || 0) : 0);
      row.vals[k] = (row.vals[k] || 0) + v;
    }
  }
  const rows = [...series.values()]
    .map(r => ({ ...r, total: periods.reduce((a, k) => a + (r.vals[k] || 0), 0), abs: periods.reduce((a, k) => a + Math.abs(r.vals[k] || 0), 0) }))
    .filter(r => r.abs >= 0.5)
    .sort((a, b) => b.abs - a.abs);
  // Per positie: elk een eigen, goed te onderscheiden kleur (posities in dezelfde categorie hebben anders dezelfde kleur).
  if (groep !== 'categorie') rows.forEach((r, i) => { r.color = IL_PALETTE[i % IL_PALETTE.length]; });
  return { periods, rows };
}

function IlChart({ data, per, privacy, isMobile }) {
  const { periods, rows } = data;
  const [hover, setHover] = ilUseState(null);
  const W = 1000, H = 240, padT = 10, padB = 24;
  let maxPos = 0, maxNeg = 0;
  for (const k of periods) {
    let p = 0, n = 0;
    for (const r of rows) { const v = r.vals[k] || 0; if (v > 0) p += v; else n += v; }
    maxPos = Math.max(maxPos, p); maxNeg = Math.min(maxNeg, n);
  }
  const span = (maxPos - maxNeg) || 1;
  const y = v => padT + (maxPos - v) / span * (H - padT - padB);
  const bw = W / Math.max(1, periods.length);
  const zero = y(0);
  const labelEvery = Math.max(1, Math.ceil(periods.length / (isMobile ? 4 : 12)));
  const hk = hover != null ? periods[hover] : null;
  return (
    <div className="il-chart" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: 240 }} role="img" aria-label="Netto inleg per periode per belegging">
        <line x1="0" x2={W} y1={zero} y2={zero} stroke="var(--border-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {periods.map((k, i) => {
          let up = 0, down = 0;
          const x = i * bw + bw * 0.18, w = bw * 0.64;
          return (
            <g key={k} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)}>
              <rect x={i * bw} y="0" width={bw} height={H} fill={hover === i ? 'var(--surface-2)' : 'transparent'} />
              {rows.map(r => {
                const v = r.vals[k] || 0;
                if (Math.abs(v) < 0.5) return null;
                let y0, y1;
                if (v > 0) { y0 = y(up + v); y1 = y(up); up += v; } else { y0 = y(down); y1 = y(down + v); down += v; }
                return <rect key={r.key} x={x} y={y0} width={w} height={Math.max(0.5, y1 - y0)} fill={r.color} />;
              })}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', fontSize: 11, color: 'var(--fg-subtle)', marginTop: 4 }}>
        {periods.map((k, i) => <span key={k} style={{ width: `${100 / periods.length}%`, textAlign: 'center', visibility: (periods.length - 1 - i) % labelEvery === 0 ? 'visible' : 'hidden', whiteSpace: 'nowrap', overflow: 'visible' }}>{ilLabel(k, per)}</span>)}
      </div>
      {hk && (
        <div className="il-tip" style={{ left: `clamp(0px, calc(${(hover + 0.5) / periods.length * 100}% - 90px), calc(100% - 180px))` }}>
          <b>{per === 'jaar' ? hk : `${MONTHS_NL_LONG[+hk.slice(5, 7) - 1]} ${hk.slice(0, 4)}`}</b>
          {rows.filter(r => Math.abs(r.vals[hk] || 0) >= 0.5).map(r => (
            <div key={r.key}><em>{r.label}</em><span className={r.vals[hk] > 0 ? 'il-pos' : 'il-neg'}>{ilMoney(r.vals[hk], privacy)}</span></div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4, fontWeight: 650 }}><span>Totaal</span><span>{ilMoney(rows.reduce((a, r) => a + (r.vals[hk] || 0), 0), privacy)}</span></div>
        </div>
      )}
    </div>
  );
}

function InlegView({ app }) {
  const [per, setPer] = ilUseState('maand');
  const [groep, setGroep] = ilUseState('positie');
  const [range, setRange] = ilUseState('12');
  const privacy = !!(app.prefs && app.prefs.privacy);
  const data = ilUseMemo(() => ilCompute(app.model, per, groep, range), [app.model, per, groep, range]);
  const { periods, rows } = data;
  const totOf = k => rows.reduce((a, r) => a + (r.vals[k] || 0), 0);
  const grand = rows.reduce((a, r) => a + r.total, 0);
  const newestFirst = periods.slice().reverse();
  return (
    <div className="il-wrap">
      <div className="il-bar">
        <Segmented ariaLabel="Per maand of jaar" value={per} onChange={setPer} options={[{ value: 'maand', label: 'Per maand' }, { value: 'jaar', label: 'Per jaar' }]} />
        <Segmented ariaLabel="Groeperen" value={groep} onChange={setGroep} options={[{ value: 'positie', label: 'Per positie' }, { value: 'categorie', label: 'Per categorie' }]} />
        <span className="il-bar__sp" />
        {per === 'maand' && <Segmented size="sm" ariaLabel="Aantal maanden" value={range} onChange={setRange} options={[{ value: '12', label: '12 mnd' }, { value: '24', label: '24 mnd' }, { value: 'alles', label: 'Alles' }]} />}
      </div>

      <section className="il-card">
        <h2>Netto inleg {per === 'jaar' ? 'per jaar' : 'per maand'}</h2>
        <p className="il-sub">Stortingen en aankopen min opnames en verkopen, per {groep === 'categorie' ? 'categorie' : 'positie'}. Totaal {periods.length ? `${ilLabel(periods[0], per)} – ${ilLabel(periods[periods.length - 1], per)}` : ''}: <b>{ilMoney(grand, privacy)}</b>. Je bankrekening (Vrij op rekening) telt niet mee.</p>
        {periods.length ? <IlChart data={data} per={per} privacy={privacy} isMobile={app.isMobile} /> : <p className="il-sub">Nog geen gegevens.</p>}
        <div className="il-legend">{rows.map(r => <span key={r.key}><i style={{ background: r.color }} />{r.label}</span>)}</div>
      </section>

      {app.isMobile ? (
        <section className="il-card il-mlist">
          {newestFirst.map(k => {
            const items = rows.filter(r => Math.abs(r.vals[k] || 0) >= 0.5).sort((a, b) => Math.abs(b.vals[k]) - Math.abs(a.vals[k]));
            const absSum = items.reduce((a, r) => a + Math.abs(r.vals[k]), 0) || 1;
            const t = totOf(k);
            return (
              <div key={k} className="il-mrow">
                <div className="il-mrow__h"><span>{per === 'jaar' ? k : `${MONTHS_NL_LONG[+k.slice(5, 7) - 1]} ${k.slice(0, 4)}`}</span><span className={t > 0.5 ? 'il-pos' : t < -0.5 ? 'il-neg' : ''}>{ilMoney(t, privacy)}</span></div>
                {items.length > 0 && <div className="il-stack">{items.map(r => <span key={r.key} style={{ width: Math.abs(r.vals[k]) / absSum * 100 + '%', background: r.color, opacity: r.vals[k] < 0 ? 0.45 : 1 }} />)}</div>}
                <div className="il-mrow__items">{items.length ? items.map(r => <span key={r.key}><i style={{ background: r.color }} />{r.label} {ilMoney(r.vals[k], privacy)}</span>) : <span>Geen inleg</span>}</div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="il-card">
          <div className="il-tablewrap">
            <table className="il-table">
              <thead>
                <tr><th>{groep === 'categorie' ? 'Categorie' : 'Positie'}</th>{newestFirst.map(k => <th key={k}>{ilLabel(k, per)}</th>)}<th>Totaal</th></tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.key}>
                    <td><span className="il-name"><i style={{ background: r.color }} />{r.label}</span></td>
                    {newestFirst.map(k => { const v = r.vals[k] || 0; return <td key={k} className={Math.abs(v) < 0.5 ? 'il-zero' : v > 0 ? 'il-pos' : 'il-neg'}>{ilMoney(v, privacy)}</td>; })}
                    <td className={r.total > 0.5 ? 'il-pos' : r.total < -0.5 ? 'il-neg' : 'il-zero'}><b>{ilMoney(r.total, privacy)}</b></td>
                  </tr>
                ))}
                <tr className="il-tot"><td>Totaal</td>{newestFirst.map(k => <td key={k}>{ilMoney(totOf(k), privacy)}</td>)}<td>{ilMoney(grand, privacy)}</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

Object.assign(window, { InlegView });
