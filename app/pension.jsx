// Plan › Pensioen (S5): PensioenView.

injectStyles('pension', `
.pn-view { display: grid; gap: 16px; min-width: 0; }
.pn-answer { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; font-size: 16px; line-height: 1.5; }
.pn-answer p { margin: 0; flex: 1 1 320px; }
.pn-answer b { font-weight: 650; }
.pn-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.pn-kpi__label { font-size: 12.5px; color: var(--fg-muted); font-weight: 500; margin-bottom: 6px; }
.pn-kpi__value { font: 650 26px/32px var(--font); letter-spacing: -0.02em; }
.pn-kpi__value small { font-size: 14px; font-weight: 500; color: var(--fg-muted); letter-spacing: 0; }
.pn-kpi__sub { font-size: 13px; color: var(--fg-muted); margin-top: 6px; line-height: 1.45; }
.pn-ok { margin-top: 8px; font-size: 13px; color: var(--gain); }
.pn-progress { display: grid; gap: 10px; }
.pn-progress__head { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; color: var(--fg-muted); }
.pn-track { position: relative; height: 8px; border-radius: 999px; background: var(--surface-3); }
.pn-track__fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; background: var(--ink); }
.pn-track__fill.is-ok { background: var(--gain); }
.pn-track__tick { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--surface); border-radius: 1px; }
.pn-miles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; font-size: 12.5px; }
.pn-mile { color: var(--fg-muted); }
.pn-mile b { color: var(--fg); font-weight: 600; display: block; font-size: 13.5px; }
.pn-grid { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
.pn-grid > :first-child { flex: 1 1 300px; max-width: 100%; }
.pn-grid > :last-child { flex: 999 1 480px; min-width: 0; }
.pn-inputs { display: grid; gap: 14px; }
.pn-derived { font-size: 13px; color: var(--fg-muted); border-top: 1px solid var(--border); padding-top: 12px; }
.pn-derived b { color: var(--fg); font-weight: 600; }
.pn-table td, .pn-table th { white-space: nowrap; }
.pn-table tbody tr:hover { background: none; }
.pn-disclaimer { font-size: 12.5px; color: var(--fg-subtle); line-height: 1.6; }
.pn-disclaimer b { color: var(--fg-muted); }
.pn-details > summary { cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; font-weight: 650; font-size: 17px; min-height: 44px; }
.pn-details > summary::-webkit-details-marker { display: none; }
.pn-details[open] > summary svg { transform: rotate(180deg); }
@media (max-width: 767.98px) {
  .pn-answer { font-size: 17px; }
  .pn-kpis { grid-template-columns: minmax(0, 1fr); gap: 10px; }
  .pn-miles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
`);

const PN_FIELDS = ['age', 'retireAge', 'monthly', 'wdRate', 'retRate', 'inflation'];

function pnNf(dec) { return n => new Intl.NumberFormat('nl-NL', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n); }
function pnPick(obj) { const o = {}; PN_FIELDS.forEach(k => { o[k] = +obj[k]; }); return o; }

function PensioenView({ app }) {
  const state = app.state || {};
  const privacy = usePrivacy();
  const isMobile = app.isMobile;
  const money = (v, o) => (privacy ? '€ •••••' : fmtMoney(v, o));
  const stored = pnPick({ ...PENSION_DEFAULTS, ...(state.pensionInputs || {}) });
  const storedKey = JSON.stringify(stored);
  const [draft, setDraft] = useState(stored);
  const pending = useRef(false);
  useEffect(() => { if (!pending.current) setDraft(stored); }, [storedKey]); // eslint-disable-line

  const write = useDebouncedCallback(next => {
    pending.current = false;
    app.setSyncedState(s => ({ ...s, pensionInputs: { ...next, updatedAt: new Date().toISOString() } }));
  }, 400);

  const set = (field, v) => {
    setDraft(d => {
      const next = { ...d, [field]: v };
      if (field === 'age' && next.retireAge <= v) next.retireAge = Math.min(PENSION_LIMITS.retireAge.max, v + 1);
      pending.current = true;
      write(next);
      return next;
    });
  };

  const current = (app.model && app.model.totals && app.model.totals.value) || 0;
  const res = React.useMemo(() => computePension(draft, current), [draft, current]);
  const L = PENSION_LIMITS;
  const pct0 = pnNf(0), pct1 = pnNf(1);
  const wdText = (draft.wdRate % 1 === 0 ? pct0 : pct1)(draft.wdRate);
  const gap = res.fvCurrent - res.neededCorpusReal;

  const sliders = (
    <div className="pn-inputs">
      <SliderField label="Huidige leeftijd" id="pn-age" testId="pension-input-age" value={draft.age}
        min={L.age.min} max={L.age.max} step={L.age.step} suffix="jr" format={pct0} onChange={v => set('age', v)} />
      <SliderField label="Pensioenleeftijd" id="pn-retire" testId="pension-input-retireAge" value={draft.retireAge}
        min={Math.min(L.retireAge.max, draft.age + 1)} max={L.retireAge.max} step={L.retireAge.step} suffix="jr" format={pct0} onChange={v => set('retireAge', v)} />
      <SliderField label="Gewenste maandelijkse onttrekking" id="pn-monthly" testId="pension-input-monthly" value={draft.monthly}
        min={L.monthly.min} max={L.monthly.max} step={L.monthly.step} prefix="€" format={n => new Intl.NumberFormat('nl-NL').format(n)} onChange={v => set('monthly', v)} />
      <SliderField label="Onttrekkingspercentage" id="pn-wd" testId="pension-input-wdRate" value={draft.wdRate}
        min={L.wdRate.min} max={L.wdRate.max} step={L.wdRate.step} suffix="%" format={pct1} onChange={v => set('wdRate', v)} />
      <SliderField label="Verwacht rendement per jaar" id="pn-ret" testId="pension-input-retRate" value={draft.retRate}
        min={L.retRate.min} max={L.retRate.max} step={L.retRate.step} suffix="%" format={pct1} onChange={v => set('retRate', v)} />
      <SliderField label="Verwachte inflatie" id="pn-infl" testId="pension-input-inflation" value={draft.inflation}
        min={L.inflation.min} max={L.inflation.max} step={L.inflation.step} suffix="%" format={pct1} onChange={v => set('inflation', v)} />
      <div className="pn-derived num">
        Reëel rendement (na inflatie): <b>{fmtPct(res.realRate, { decimals: 1, sign: false })}</b> · Tijdshorizon: <b>{res.years} jaar</b>
      </div>
    </div>
  );

  const answer = (
    <div className="pn-answer">
      <p>Met <b className="num">{money(current)}</b> kun je nu <b className="num">{money(res.withdrawNow)}/maand</b> onttrekken ({wdText}%-regel).
        Je doel: <b className="num">{money(draft.monthly)}/maand</b>.</p>
      {res.onTrack ? <Pill tone="gain" icon="check">Op koers</Pill> : <Pill tone="warn" icon="triangle-alert">Tekort</Pill>}
    </div>
  );

  const kpis = (
    <div className="pn-kpis">
      <Card>
        <div className="pn-kpi__label">Benodigde eindwaarde (nominaal)</div>
        <div className="pn-kpi__value num">{money(res.neededCorpusReal)}</div>
        <div className="pn-kpi__sub">Op basis van {money(draft.monthly)}/maand bij {wdText}% onttrekking · incl. {pct1(draft.inflation)}% inflatie</div>
      </Card>
      <Card>
        <div className="pn-kpi__label">Portfolio bij pensioen (proj.)</div>
        <div className="pn-kpi__value num">{money(res.fvCurrent)} <small>· {pct0(res.progress)}% van doel</small></div>
        <div className="pn-kpi__sub num">{gap >= 0 ? `Overschot ${money(gap, { sign: true })}` : `Tekort ${money(gap)}`}</div>
      </Card>
      <Card>
        <div className="pn-kpi__label">Benodigde maandelijkse inleg</div>
        <div className="pn-kpi__value num">{money(res.monthlySavings)} <small>/ maand</small></div>
        {res.onTrack
          ? <div className="pn-ok">Geen extra inleg nodig. Je huidige portfolio groeit naar {money(res.fvCurrent)} — boven de doelstelling van {money(res.neededCorpusReal)}.</div>
          : <div className="pn-kpi__sub">Om de doelstelling te bereiken in {res.years} jaar bij {pct1(draft.retRate)}% rendement</div>}
      </Card>
    </div>
  );

  const progress = (
    <Card>
      <div className="pn-progress">
        <div className="pn-progress__head"><span>Voortgang naar doel</span><span className="num">{pct0(res.progress)}%</span></div>
        <div className="pn-track" role="progressbar" aria-label="Voortgang naar pensioendoel" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(res.progress)}>
          <span className={`pn-track__fill${res.onTrack ? ' is-ok' : ''}`} style={{ width: `${Math.max(1, res.progress)}%` }} />
          {[25, 50, 75].map(p => <span key={p} className="pn-track__tick" style={{ left: `${p}%` }} />)}
        </div>
        <div className="pn-miles">
          {res.milestones.map(m => (
            <div key={m.pct} className="pn-mile num">
              <b>{m.pct}%</b>
              {m.age == null ? 'Niet haalbaar' : (m.pct === 100 && Math.round(m.age) === draft.retireAge ? `${draft.retireAge} jr` : `~${Math.round(m.age)} jr`)}
              <span> · {money(m.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const tableAges = (() => {
    const out = [];
    for (let a = Math.ceil((draft.age + 1) / 10) * 10; a < draft.retireAge; a += 10) out.push(a);
    out.push(draft.retireAge);
    if (draft.retireAge + 10 <= res.maxAge) out.push(draft.retireAge + 10);
    return out.filter(a => res.ages.includes(a));
  })();
  const table = (
    <div style={{ overflowX: 'auto' }}>
      <table className="table pn-table">
        <thead><tr><th>Leeftijd</th>
          <th className="num">Laag{isMobile ? '' : ` (${pct1(Math.max(0, draft.retRate - 3))}%)`}</th>
          <th className="num">Verwacht{isMobile ? '' : ` (${pct1(draft.retRate)}%)`}</th>
          <th className="num">Hoog{isMobile ? '' : ` (${pct1(draft.retRate + 2)}%)`}</th></tr></thead>
        <tbody>
          {tableAges.map(a => {
            const i = res.ages.indexOf(a);
            return (
              <tr key={a}>
                <td>{a} jaar{a === draft.retireAge && !isMobile ? ' · pensioen' : ''}</td>
                <td className="num">{money(res.low[i])}</td>
                <td className="num" style={{ fontWeight: 600 }}>{money(res.mid[i])}</td>
                <td className="num">{money(res.high[i])}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const chart = (
    <PensionFanChart ages={res.ages} low={res.low} mid={res.mid} high={res.high} target={res.neededCorpusReal}
      retireAge={draft.retireAge} milestones={res.milestones} currentValue={current} height={isMobile ? 220 : 300} privacy={privacy} />
  );

  const disclaimer = (
    <div className="pn-disclaimer">
      <b>Aannames:</b> Berekening gebruikt de 4%-regel (Trinity Study). Rendementen zijn niet gegarandeerd. Inflatie en belastingen kunnen de werkelijke uitkomst beïnvloeden. Raadpleeg een financieel adviseur voor persoonlijk advies.
    </div>
  );

  if (isMobile) {
    return (
      <div className="pn-view">
        {answer}
        {kpis}
        {progress}
        <Card title="Projectie" meta="nominaal">{chart}</Card>
        <Card>
          <details className="pn-details">
            <summary>Aannames <Icon name="chevron-down" size={18} /></summary>
            <div style={{ paddingTop: 8 }}>{sliders}</div>
          </details>
        </Card>
        <Card title="Per leeftijd" padding={0}>{table}</Card>
        {disclaimer}
      </div>
    );
  }
  return (
    <div className="pn-view">
      {answer}
      {kpis}
      {progress}
      <div className="pn-grid">
        <Card title="Aannames">{sliders}</Card>
        <div className="pn-view">
          <Card title="Projectie" meta={`band ${pct1(Math.max(0, draft.retRate - 3))}% … ${pct1(draft.retRate + 2)}% rendement · nominaal`}>{chart}</Card>
          <Card title="Per leeftijd" padding={0}>{table}</Card>
        </div>
      </div>
      {disclaimer}
    </div>
  );
}

Object.assign(window, { PensioenView });
