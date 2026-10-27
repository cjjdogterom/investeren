// Plan (S5): PlanScreen + Verdeling. Engines (ALLOC_GROUPINGS, allocationGroups, computeAllocation) unchanged.

const ALLOC_GROUPINGS = [
  { key: 'category', label: 'Per categorie' },
  { key: 'party',    label: 'Per partij' },
];

// Groepeer de (in totaal meegetelde) partijen per categorie of per partij.
function allocationGroups(summaries, grouping) {
  const included = summaries.filter(s => (s.party.includeInTotal ?? s.party.includeInPortfolio) !== false);
  const map = new Map();
  for (const s of included) {
    const key   = grouping === 'party' ? s.party.id : (s.party.category || 'Overig');
    const label = grouping === 'party' ? s.party.name : (s.party.category || 'Overig');
    const g = map.get(key) || { key, label, color: s.party.color, value: 0 };
    g.value += Math.max(0, s.currentValueEur || 0);
    map.set(key, g);
  }
  return [...map.values()].sort((a, b) => b.value - a.value);
}

// Kern-berekening.
//  - rebalance: kopen/verkopen binnen het huidige totaal
//  - needed:    minimale bijstorting om de doelverdeling te halen zonder te verkopen
//  - plan:      verdeling van een zelf gekozen bedrag (naar de grootste tekorten)
function computeAllocation(groups, targets, extra) {
  const total = groups.reduce((s, g) => s + g.value, 0);
  const t = key => Math.max(0, +targets[key] || 0) / 100;

  // Zonder verkopen: het nieuwe totaal moet zo groot zijn dat geen enkele groep te zwaar weegt.
  let neededTotal = total;
  let blocked = []; // groepen met waarde maar 0% doel: nooit te halen zonder verkopen
  for (const g of groups) {
    if (g.value <= 0) continue;
    if (t(g.key) > 0) neededTotal = Math.max(neededTotal, g.value / t(g.key));
    else blocked.push(g.label);
  }
  const needed = Math.max(0, neededTotal - total);

  // Gekozen bedrag verdelen: vul tekorten t.o.v. het nieuwe totaal naar rato.
  const amount = Math.max(0, +extra || 0);
  const newTotal = total + amount;
  const deficits = groups.map(g => Math.max(0, t(g.key) * newTotal - g.value));
  const deficitSum = deficits.reduce((s, d) => s + d, 0);

  const rows = groups.map((g, i) => {
    const target = t(g.key);
    const plan = deficitSum > 0 ? deficits[i] * Math.min(1, amount / deficitSum) : 0;
    return {
      ...g,
      currentPct: total > 0 ? g.value / total * 100 : 0,
      targetPct:  target * 100,
      rebalance:  target * total - g.value,
      toReach:    Math.max(0, target * neededTotal - g.value),
      plan,
      afterPct:   newTotal > 0 ? (g.value + plan) / newTotal * 100 : 0,
    };
  });

  // Rest als het bedrag groter is dan alle tekorten samen: naar rato van doel verdelen.
  const leftover = amount - rows.reduce((s, r) => s + r.plan, 0);
  if (leftover > 0.005) {
    const tSum = rows.reduce((s, r) => s + r.targetPct, 0);
    if (tSum > 0) rows.forEach(r => {
      r.plan += leftover * r.targetPct / tSum;
      r.afterPct = (r.value + r.plan) / newTotal * 100;
    });
  }

  return { total, needed, neededTotal, blocked, rows, amount };
}

// ===== UI (redesign) =====
injectStyles('allocation', `
.al-page { display: grid; gap: 16px; min-width: 0; padding: 12px 24px 48px; }
.al-head { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.al-tabs { flex: 1; min-width: 200px; }
.al-view { display: grid; gap: 16px; min-width: 0; }
.al-top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.al-top h2 { margin: 0; font: 650 17px/24px var(--font); }
.al-top__meta { color: var(--fg-muted); font-size: 13px; }
.al-top__spacer { flex: 1; }
.al-bars { display: grid; gap: 10px; }
.al-bar { display: grid; grid-template-columns: 96px 1fr; align-items: center; gap: 12px; }
.al-bar__label { font-size: 12.5px; color: var(--fg-muted); }
.al-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 4px; font-size: 12.5px; color: var(--fg-muted); }
.al-legend span { display: inline-flex; align-items: center; gap: 6px; }
.al-calc { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
.al-kicker { font-size: 12.5px; color: var(--fg-muted); margin-bottom: 6px; font-weight: 500; }
.al-big { font: 650 28px/34px var(--font); letter-spacing: -0.02em; }
.al-big.is-off { color: var(--fg-subtle); }
.al-msg { font-size: 13px; color: var(--fg-muted); margin-top: 6px; line-height: 1.5; }
.al-warn { display: flex; gap: 6px; align-items: flex-start; margin-top: 10px; font-size: 13px; color: var(--warn); background: var(--warn-soft); border-radius: var(--r-2); padding: 8px 10px; }
.al-storten { display: flex; gap: 8px; align-items: flex-start; flex-wrap: wrap; }
.al-storten > div:first-child { flex: 1 1 160px; }
.al-table td, .al-table th { white-space: nowrap; }
.al-table tbody tr:hover { background: none; }
.al-label { display: inline-flex; align-items: center; gap: 8px; }
.al-tin { display: inline-flex; align-items: center; gap: 4px; }
.al-tin .input { width: 68px; text-align: right; height: 30px; padding: 0 8px; }
.al-drift { display: grid; grid-template-columns: 1fr 64px; align-items: center; gap: 10px; min-width: 170px; }
.al-drift__pt { text-align: right; font-size: 12.5px; color: var(--fg-muted); }
.al-drift__pt.is-out { color: var(--warn); font-weight: 600; }
.al-foot { font-size: 12.5px; color: var(--fg-subtle); line-height: 1.6; }
.al-foot b { color: var(--fg-muted); font-weight: 600; }
.al-empty { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; padding: 12px 14px; border-radius: var(--r-2); background: var(--surface-2); margin-bottom: 12px; font-size: 13.5px; }
.al-empty__text { flex: 1 1 220px; color: var(--fg-muted); }
.al-mcards { display: grid; gap: 10px; }
.al-mcard { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-card); padding: 14px 16px; display: grid; gap: 10px; }
.al-mcard__top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.al-mcard__label { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 15px; min-width: 0; }
.al-mcard__meta { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; color: var(--fg-muted); }
.al-mcard__meta b { color: var(--fg); font-weight: 600; }
.al-stepper { display: inline-flex; align-items: center; gap: 4px; }
.al-stepper .input { width: 64px; text-align: center; height: 44px; }
@media (max-width: 767.98px) {
  .al-page { padding: 12px 16px 24px; }
  .al-bar { grid-template-columns: 76px 1fr; }
  .al-big { font-size: 30px; line-height: 36px; }
}
`);

function alNum(v) {
  if (v === '' || v == null || !Number.isFinite(+v)) return '';
  return new Intl.NumberFormat('nl-NL', { useGrouping: false, maximumFractionDigits: 2 }).format(+v);
}
function alPct(n) { return fmtPct(n, { decimals: 1, sign: false }); }
function alClamp(n) { return Math.max(0, Math.min(100, n)); }

function AlTargetInput({ value, onChange, testId, inputRef, label }) {
  const [text, setText] = useState(null);
  const shown = text != null ? text : alNum(value);
  return (
    <span className="al-tin">
      <input ref={inputRef} className="input num" type="text" inputMode="decimal" aria-label={label} data-testid={testId}
        value={shown} placeholder="0"
        onFocus={() => setText(alNum(value))}
        onBlur={() => setText(null)}
        onChange={e => {
          const t = e.target.value;
          setText(t);
          if (t.trim() === '') { onChange(''); return; }
          const n = parseNlNumber(t);
          if (n != null) onChange(alClamp(n));
        }} />
      <span className="al-drift__pt" aria-hidden="true">%</span>
    </span>
  );
}

function AlStepper({ value, onChange, testId, inputRef, label }) {
  const cur = +value || 0;
  return (
    <span className="al-stepper">
      <IconButton icon="minus" label={`${label} verlagen`} onClick={() => onChange(alClamp(+(cur - 0.5).toFixed(2)))} />
      <AlTargetInput value={value} onChange={onChange} testId={testId} inputRef={inputRef} label={label} />
      <IconButton icon="plus" label={`${label} verhogen`} onClick={() => onChange(alClamp(+(cur + 0.5).toFixed(2)))} />
    </span>
  );
}

function AlVerdelingView({ app }) {
  const state = app.state || {};
  const saved = state.targetAllocation || {};
  const isMobile = app.isMobile;
  const privacy = usePrivacy();
  const money = (v, o) => (privacy ? '€ •••••' : fmtMoney(v, o));
  const [grouping, setGrouping] = useState(saved.grouping || 'category');
  useEffect(() => { if (saved.grouping && saved.grouping !== grouping) setGrouping(saved.grouping); }, [saved.grouping]); // eslint-disable-line

  const savedTargets = saved[grouping] || {};
  const savedKey = JSON.stringify(savedTargets);
  const [draft, setDraft] = useState(savedTargets);
  const pending = useRef(false);
  useEffect(() => { if (!pending.current) setDraft(savedTargets); }, [grouping, savedKey]); // eslint-disable-line

  const write = useDebouncedCallback((g, next) => {
    pending.current = false;
    app.setSyncedState(s => ({
      ...s,
      targetAllocation: { ...(s.targetAllocation || {}), [g]: next, grouping: g, updatedAt: new Date().toISOString() },
    }));
  }, 300);
  const saveTargets = next => { pending.current = true; setDraft(next); write(grouping, next); };
  const setTarget = (key, v) => saveTargets({ ...draft, [key]: v });

  const changeGrouping = g => {
    if (g === grouping) return;
    pending.current = false;
    setGrouping(g);
    setDraft(saved[g] || {});
    app.setSyncedState(s => ({ ...s, targetAllocation: { ...(s.targetAllocation || {}), grouping: g } }));
  };

  const [extra, setExtra] = useState('');
  const extraNum = Math.max(0, parseNlNumber(extra) || 0);

  const summaries = (app.model && app.model.summaries) || [];
  const groups = React.useMemo(() => {
    const byParty = Object.fromEntries(summaries.map(s => [s.party.id, s.party]));
    return allocationGroups(summaries, grouping).map(g => ({
      ...g,
      color: grouping === 'party'
        ? partyColorOf(byParty[g.key] || {})
        : ASSET_CLASS_BY_KEY[assetClassOf({ category: g.key })].color,
    }));
  }, [summaries, grouping]);
  const targets = draft || {};
  const targetSum = groups.reduce((s, g) => s + Math.max(0, +targets[g.key] || 0), 0);
  const sumOk = Math.abs(targetSum - 100) < 0.05;
  const hasTargets = targetSum > 0;
  const calc = React.useMemo(() => computeAllocation(groups, targets, extraNum), [groups, targets, extraNum]);

  const fillFromCurrent = () => saveTargets(Object.fromEntries(groups.map(g => [g.key, +(calc.total > 0 ? g.value / calc.total * 100 : 0).toFixed(1)])));
  const normalize = () => {
    if (targetSum <= 0) return;
    saveTargets(Object.fromEntries(groups.map(g => [g.key, +(Math.max(0, +targets[g.key] || 0) / targetSum * 100).toFixed(1)])));
  };
  const example = () => {
    const pcts = [70, 15, 10, 5];
    saveTargets(Object.fromEntries(groups.map((g, i) => [g.key, pcts[i] || 0])));
  };

  const firstInput = useRef(null);
  const stortenRef = useRef(null);
  const focusQ = app.route && app.route.query && app.route.query.focus;
  useEffect(() => {
    if (focusQ === 'storten' && stortenRef.current) {
      stortenRef.current.focus();
      try { stortenRef.current.scrollIntoView({ block: 'center' }); } catch (e) { /* ignore */ }
    }
  }, [focusQ]);

  const scaleMax = Math.max(1, ...calc.rows.map(r => Math.max(r.currentPct, r.targetPct, calc.amount > 0 ? r.afterPct : 0))) * 1.12;
  const tol = ATTENTION_THRESHOLDS.driftPt;
  const showAfter = hasTargets && calc.amount > 0;

  const sumPill = hasTargets
    ? <Pill tone={sumOk ? 'neutral' : 'warn'} className="num">{sumOk ? 'Σ 100%' : `Σ ${fmtPct(targetSum, { decimals: 1, sign: false })} van 100%`}</Pill>
    : null;

  const bars = (
    <Card>
      <div className="al-bars">
        <div className="al-bar"><span className="al-bar__label">Huidig</span>
          <AllocationBar height={14} showLabels privacy={privacy} segments={calc.rows.map(r => ({ key: r.key, label: r.label, color: r.color, value: r.value }))} /></div>
        {hasTargets && <div className="al-bar"><span className="al-bar__label">Doel</span>
          <AllocationBar height={14} showLabels privacy={privacy} segments={calc.rows.map(r => ({ key: r.key, label: r.label, color: r.color, value: r.targetPct / 100 * calc.total }))} /></div>}
        {showAfter && <div className="al-bar"><span className="al-bar__label">Na storting</span>
          <AllocationBar height={14} showLabels privacy={privacy} segments={calc.rows.map(r => ({ key: r.key, label: r.label, color: r.color, value: r.value + r.plan }))} /></div>}
        <div className="al-legend">
          {calc.rows.map(r => <span key={r.key}><Swatch color={r.color} size={8} />{r.label}</span>)}
        </div>
      </div>
    </Card>
  );

  const neededMsg = !hasTargets ? 'Vul hieronder je gewenste percentages in.'
    : !sumOk ? `Doelen tellen op tot ${fmtPct(targetSum, { decimals: 1, sign: false })} — moet 100% zijn.`
    : calc.needed < 1 ? 'Je zit al op (of boven) je doelverdeling.'
    : `Zonder te verkopen · nieuw totaal ${money(calc.neededTotal)}`;

  const calcCards = (
    <div className="al-calc">
      <Card>
        <div className="al-kicker">Bijstorten om doel te halen</div>
        <div className={`al-big num${hasTargets && sumOk ? '' : ' is-off'}`}>{hasTargets && sumOk ? money(calc.needed) : '—'}</div>
        <div className="al-msg">{neededMsg}</div>
        {sumOk && calc.blocked.length > 0 && (
          <div className="al-warn"><Icon name="triangle-alert" size={14} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{calc.blocked.join(', ')} {calc.blocked.length === 1 ? 'heeft' : 'hebben'} 0% als doel — dat haal je alleen door te verkopen.</span></div>
        )}
      </Card>
      <Card>
        <div className="al-kicker"><label htmlFor="al-storten">Ik wil storten</label></div>
        <div className="al-storten">
          <MoneyInput id="al-storten" inputRef={stortenRef} large value={extra} onChange={setExtra} placeholder="0" data-testid="storten-input" />
          {hasTargets && sumOk && calc.needed >= 1 && (
            <Button variant="secondary" size={isMobile ? 'md' : 'lg'} onClick={() => setExtra(String(Math.ceil(calc.needed)))}>= {money(Math.ceil(calc.needed))}</Button>
          )}
        </div>
        <div className="al-msg">Het bedrag gaat eerst naar de onderwogen onderdelen. De kolom "Storting" toont hoe je het verdeelt.</div>
      </Card>
    </div>
  );

  const emptyBanner = !hasTargets && (
    <div className="al-empty">
      <span className="al-empty__text">Nog geen doelverdeling ingesteld.</span>
      <Button variant="primary" size="sm" onClick={fillFromCurrent}>Neem huidige verdeling over</Button>
      <Button variant="secondary" size="sm" onClick={example}>Voorbeeld 70/15/10/5</Button>
      <Button variant="ghost" size="sm" onClick={() => firstInput.current && firstInput.current.focus()}>Zelf instellen</Button>
    </div>
  );

  const driftCell = r => {
    const drift = r.currentPct - r.targetPct;
    const out = hasTargets && Math.abs(drift) > tol;
    return (
      <div className="al-drift">
        <BulletTrack current={r.currentPct} target={hasTargets ? r.targetPct : null} tolerance={hasTargets ? tol : null}
          after={showAfter ? r.afterPct : null} scaleMax={scaleMax} color={r.color} height={6} />
        <span className={`al-drift__pt num${out ? ' is-out' : ''}`}>{hasTargets ? fmtPt(drift) : '—'}</span>
      </div>
    );
  };

  const tableActions = (
    <>
      {sumPill}
      {hasTargets && !sumOk && <Button size="sm" onClick={normalize}>Schaal naar 100%</Button>}
      <Button size="sm" onClick={fillFromCurrent}>Neem huidige over</Button>
    </>
  );

  const desktopTable = (
    <Card title="Doelverdeling" actions={tableActions} padding={0}>
      {emptyBanner && <div style={{ padding: '12px 16px 0' }}>{emptyBanner}</div>}
      <div style={{ overflowX: 'auto' }}>
        <table className="table al-table">
          <thead>
            <tr>
              <th>Onderdeel</th><th className="num">Waarde</th><th className="num">Huidig</th><th className="num">Doel</th>
              <th>Afwijking</th>
              <th className="num" title="Minimale bijstorting per onderdeel om het doel te halen zonder te verkopen">Bijstorten</th>
              <th className="num" title="Kopen/verkopen binnen het huidige totaal">Herbalanceren</th>
              {calc.amount > 0 && <th className="num">Storting</th>}
            </tr>
          </thead>
          <tbody>
            {calc.rows.map((r, i) => (
              <tr key={r.key}>
                <td><span className="al-label"><Swatch color={r.color} />{r.label}</span></td>
                <td className="num">{money(r.value)}</td>
                <td className="num">{alPct(r.currentPct)}</td>
                <td className="num"><AlTargetInput value={targets[r.key]} onChange={v => setTarget(r.key, v)} label={`Doel ${r.label}`}
                  testId={`target-input-${r.key}`} inputRef={i === 0 ? firstInput : undefined} /></td>
                <td>{driftCell(r)}</td>
                <td className="num">{sumOk && r.toReach >= 1 ? money(r.toReach) : '—'}</td>
                <td className="num">{sumOk ? money(r.rebalance, { sign: true }) : '—'}</td>
                {calc.amount > 0 && <td className="num" style={{ fontWeight: 600 }}>{money(r.plan)}</td>}
              </tr>
            ))}
          </tbody>
          {sumOk && (
            <tfoot>
              <tr>
                <td>Totaal</td><td className="num">{money(calc.total)}</td><td className="num">100%</td>
                <td className="num">{alPct(targetSum)}</td><td />
                <td className="num">{money(calc.needed)}</td><td className="num">{money(0)}</td>
                {calc.amount > 0 && <td className="num">{money(calc.amount)}</td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Card>
  );

  const mobileCards = (
    <div className="al-view" style={{ gap: 10 }}>
      <div className="al-top"><h2>Doelverdeling</h2><span className="al-top__spacer" />{sumPill}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {hasTargets && !sumOk && <Button size="sm" onClick={normalize}>Schaal naar 100%</Button>}
        {hasTargets && <Button size="sm" onClick={fillFromCurrent}>Neem huidige over</Button>}
      </div>
      {emptyBanner}
      <div className="al-mcards">
        {calc.rows.map((r, i) => (
          <div key={r.key} className="al-mcard">
            <div className="al-mcard__top">
              <span className="al-mcard__label"><Swatch color={r.color} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span></span>
              <AlStepper value={targets[r.key]} onChange={v => setTarget(r.key, v)} label={`Doel ${r.label}`}
                testId={`target-input-${r.key}`} inputRef={i === 0 ? firstInput : undefined} />
            </div>
            {driftCell(r)}
            <div className="al-mcard__meta num">
              <span>{money(r.value)} · {alPct(r.currentPct)}</span>
              <span>{calc.amount > 0 ? <>Storting <b>{money(r.plan)}</b></> : sumOk ? <>Bijstorten <b>{money(r.toReach)}</b></> : null}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="al-view">
      <div className="al-top">
        <h2>Verdeling</h2>
        <span className="al-top__meta num">Portefeuille {money(calc.total)}</span>
        <span className="al-top__spacer" />
        <Segmented ariaLabel="Groepering" size="sm" value={grouping} onChange={changeGrouping}
          options={ALLOC_GROUPINGS.map(g => ({ value: g.key, label: g.label }))} />
        {!isMobile && sumPill}
      </div>
      {isMobile ? <>{calcCards}{bars}{mobileCards}</> : <>{bars}{calcCards}{desktopTable}</>}
      <div className="al-foot">
        <b>Bijstorten</b> = alleen kopen, niet verkopen. <b>Herbalanceren</b> = kopen én verkopen binnen je huidige totaal.
        Alleen partijen die in het totaal meetellen worden meegenomen. Doelen worden gesynct.
      </div>
    </div>
  );
}

function PlanScreen({ app }) {
  const tab = (app.route && app.route.params && app.route.params.tab) === 'pensioen' ? 'pensioen' : 'verdeling';
  const go = v => app.navigate('/plan/' + v);
  const tabs = [
    { value: 'verdeling', label: 'Verdeling', testId: 'plan-tab-verdeling' },
    { value: 'pensioen', label: 'Pensioen', testId: 'plan-tab-pensioen' },
  ];
  return (
    <div className="al-page">
      <div className="al-head">
        <h1 className="sr-only">Plan</h1>
        {!app.isMobile && <Tabs className="al-tabs" ariaLabel="Plan" tabs={tabs} value={tab} onChange={go} />}
      </div>
      {app.isMobile && (
        <Segmented ariaLabel="Plan" full pill value={tab} onChange={go}
          options={tabs.map(t => ({ value: t.value, label: t.label, testId: t.testId }))} />
      )}
      {tab === 'pensioen'
        ? (window.PensioenView ? <PensioenView app={app} /> : null)
        : <AlVerdelingView app={app} />}
    </div>
  );
}

Object.assign(window, { PlanScreen, ALLOC_GROUPINGS, computeAllocation, allocationGroups });
