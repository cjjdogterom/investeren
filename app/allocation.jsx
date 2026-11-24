// Plan (S5): PlanScreen + Verdeling. Engines (ALLOC_GROUPINGS, allocationGroups, computeAllocation) unchanged.

const ALLOC_GROUPINGS = [
  { key: 'category', label: 'Per categorie' },
  { key: 'party',    label: 'Per partij' },
];

// Groepeer de (in totaal meegetelde) partijen per categorie of per partij.
function allocationGroups(summaries, grouping) {
  const included = summaries.filter(s => inAllocation(s.party));
  const map = new Map();
  for (const s of included) {
    const parts = grouping === 'party' ? [{ category: s.party.id, value: Math.max(0, s.currentValueEur || 0) }] : allocPartsOf(s);
    for (const pt of parts) {
      const key   = pt.category;
      const label = grouping === 'party' ? s.party.name : key;
      const g = map.get(key) || { key, label, color: s.party.color, value: 0 };
      g.value += pt.value;
      map.set(key, g);
    }
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
.al-mp { display: grid; gap: 12px; }
.al-mp__buf { display: grid; gap: 10px; padding: 10px 12px; border-radius: var(--r-2); background: var(--surface-2); }
.al-mp__max { display: grid; gap: 6px; font-size: 13px; color: var(--fg-muted); max-width: 260px; }
.al-mp__list { display: grid; }
.al-mp__row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid var(--border); font-size: 14px; }
.al-mp__head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.al-mp__edit { display: grid; }
.al-mp__lbl { display: grid; gap: 2px; min-width: 0; }
.al-mp__lbl small { font-size: 12px; color: var(--fg-subtle); padding-left: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.al-mp__pct { color: var(--fg-subtle); font-size: 12px; margin-left: 4px; }
.al-mp__tot { font-weight: 600; }
.al-mp__amt { display: grid; justify-items: end; gap: 2px; }
.al-mp__amt b { font-weight: 650; }
.al-mp__amt small { font-size: 12px; color: var(--fg-muted); }
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
      {(() => { const mp = <AlMonthPlan app={app} grouping={grouping} targets={targets} sumOk={sumOk} hasTargets={hasTargets} />;
        return isMobile ? <>{mp}{calcCards}{bars}{mobileCards}</> : <>{mp}{bars}{calcCards}{desktopTable}</>; })()}
      <div className="al-foot">
        <b>Bijstorten</b> = alleen kopen, niet verkopen. <b>Herbalanceren</b> = kopen én verkopen binnen je huidige totaal.
        Alleen partijen die in het totaal en in de doelverdeling meetellen worden meegenomen (de buffer niet). Doelen worden gesynct.
      </div>
    </div>
  );
}

// ===== Maandplan: vast bedrag per maand verdelen volgens de doelverdeling =====
// 1. Buffer/potjes (niet in de verdeling, met een doel) eerst aanvullen tot hun doel, eventueel met een maximum per maand.
// 2. De rest gaat naar de onderdelen die het verst onder hun doel zitten (computeAllocation).
// Gerekend vanaf de stand aan het begin van de maand, zodat het plan niet verschuift terwijl je inlegt;
// 'al gedaan' = netto inleg deze maand, 'nog' = plan − al gedaan.
// Groepen voor de vaste maandverdeling.
const MP_BUCKETS = [
  { key: 'pe',      label: 'Private equity', color: 'var(--cat-pe)',  match: p => assetClassOf(p) === 'pe' },
  { key: 'meesman', label: 'Meesman',        color: 'var(--cat-idx)', match: p => p.id === 'meesman' },
  { key: 'aandelen', label: 'Aandelen',      color: 'var(--cat-br)',  match: p => p.id === 'trading212' },
  { key: 'goud',    label: 'Goud',           color: 'oklch(75% 0.15 70)', match: p => ['goud', 'goldrepublic', 'finst-paxg'].includes(p.id) },
  { key: 'zilver',  label: 'Zilver',         color: 'oklch(70% 0.03 240)', match: p => p.id === 'zilver' },
  { key: 'crypto',  label: 'Crypto',         color: 'var(--cat-cr)',  match: p => assetClassOf(p) === 'cr' && p.id !== 'finst-paxg' },
  { key: 'buffer',  label: 'Buffer',         color: 'oklch(60% 0.09 185)', match: p => p.id === 'buffer' },
];

// Vaste verdeling van je maandbedrag: per groep (MP_BUCKETS) een percentage dat bewaard blijft (monthlyPlan.split).
// Elke maand vul je in wat je overhoudt; per positie zie je wat je stort (op hele euro's), min wat je deze maand al inlegde.
function AlFixedSplit({ app, amount }) {
  const privacy = usePrivacy();
  const money = (v, o) => (privacy ? '€ •••••' : fmtMoney(v, o));
  const model = app.model;
  const saved = ((app.state && app.state.monthlyPlan) || {}).split || {};
  const savedKey = JSON.stringify(saved);
  const [draft, setDraft] = useState(saved);
  const pending = useRef(false);
  useEffect(() => { if (!pending.current) setDraft(saved); }, [savedKey]); // eslint-disable-line
  const write = useDebouncedCallback(next => {
    pending.current = false;
    app.setSyncedState(s => ({ ...s, monthlyPlan: { ...(s.monthlyPlan || {}), split: next, updatedAt: new Date().toISOString() } }));
  }, 400);
  const setPct = (id, v) => {
    const next = { ...draft };
    if (v === '' || !(+v > 0)) delete next[id]; else next[id] = +v;
    pending.current = true; setDraft(next); write(next); setEditing(true);
  };
  const [editing, setEditing] = useState(false);

  // Vaste groepen voor je maandbedrag; per groep tellen alle bijbehorende posities mee voor 'al ingelegd'.
  const items = React.useMemo(() => {
    const inflow = monthInflowByParty(model);
    const leaves = model.leavesByPost || {};
    const ids = s2 => [s2.party.id, ...((leaves[s2.party.id] || []).map(l => l.id))];
    const sums = (model.summaries || []).filter(x => x.party.id !== FIN_OVER_PARTY_ID && dtIncluded(x.party));
    return MP_BUCKETS.map(b => {
      const members = sums.filter(x => b.match(x.party));
      const done = members.reduce((a, x) => a + ids(x).reduce((a2, id) => a2 + (inflow[id] || 0), 0), 0);
      const where = members.filter(x => (x.currentValueEur || 0) > 0.5 || x.party.id === 'buffer').map(x => x.party.name);
      const w = where.join(', ');
      return { key: b.key, label: b.label, color: b.color, done, where: w && w !== b.label ? w : '' };
    });
  }, [model]);
  const sum = items.reduce((a, x) => a + (+draft[x.key] || 0), 0);
  const sumOk = Math.abs(sum - 100) < 0.05;
  const hasSplit = sum > 0;

  // Bedragen op hele euro's (grootste-restmethode, zodat het totaal precies klopt).
  const rows = React.useMemo(() => {
    const act = items.filter(x => +draft[x.key] > 0).map(x => ({ ...x, pct: +draft[x.key], plan: Math.floor(amount * (+draft[x.key]) / 100) }));
    const target = Math.round(amount * Math.min(100, sum) / 100);
    // grootste-restmethode: de overgebleven euro's naar de posten met de grootste afgekapte rest
    let diff = target - act.reduce((a, x) => a + x.plan, 0);
    [...act].sort((a, b) => (amount * b.pct / 100 - b.plan) - (amount * a.pct / 100 - a.plan)).forEach(x => { if (diff > 0) { x.plan += 1; diff -= 1; } });
    return act.map(x => ({ ...x, todo: Math.max(0, x.plan - Math.max(0, x.done)) })).sort((a, b) => b.pct - a.pct);
  }, [items, draft, amount, sum]);
  const todo = rows.reduce((a, x) => a + x.todo, 0);
  const normalize = () => { if (sum > 0) { const next = {}; items.forEach(x => { if (+draft[x.key] > 0) next[x.key] = +((+draft[x.key]) / sum * 100).toFixed(1); }); pending.current = true; setDraft(next); write(next); } };
  const showEdit = editing || !hasSplit;

  return (
    <div className="al-mp">
      <div className="al-mp__head">
        <span className="al-kicker" style={{ margin: 0 }}>Jouw vaste verdeling</span>
        <span style={{ flex: 1 }} />
        {hasSplit && <Pill tone={sumOk ? 'neutral' : 'warn'} className="num">{sumOk ? 'Σ 100%' : `Σ ${fmtPct(sum, { decimals: 1, sign: false })}`}</Pill>}
        {hasSplit && <Button size="sm" variant={showEdit ? 'primary' : 'secondary'} onClick={() => setEditing(!editing)} data-testid="split-edit">{showEdit ? 'Klaar' : 'Aanpassen'}</Button>}
      </div>
      {showEdit && (
        <div className="al-mp__edit">
          {!hasSplit && <div className="al-msg" style={{ marginTop: 0 }}>Geef per groep aan welk deel van je maandbedrag erheen gaat. Dit wordt onthouden.</div>}
          {items.map(x => (
            <div className="al-mp__row" key={x.key}>
              <span className="al-mp__lbl"><span className="al-label"><Swatch color={x.color} />{x.label}</span>{x.where && <small>{x.where}</small>}</span>
              <AlTargetInput value={draft[x.key]} onChange={v => setPct(x.key, v)} label={`Deel ${x.label}`} testId={`split-${x.key}`} />
            </div>
          ))}
          {hasSplit && !sumOk && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="al-msg" style={{ margin: 0 }}>Samen {fmtPct(sum, { decimals: 1, sign: false })}{sum < 100 ? ': de rest blijft onverdeeld.' : ': meer dan 100%.'}</span>
            <Button size="sm" onClick={normalize}>Schaal naar 100%</Button></div>}
        </div>
      )}
      {!showEdit && amount > 0 && (
        <div className="al-mp__list">
          {rows.map(x => (
            <div className="al-mp__row" key={x.key}>
              <span className="al-mp__lbl"><span className="al-label"><Swatch color={x.color} />{x.label} <small className="al-mp__pct num">{fmtPct(x.pct, { decimals: x.pct % 1 ? 1 : 0, sign: false })}</small></span>{x.where && <small>{x.where}</small>}</span>
              <span className="al-mp__amt num">
                <b>{money(x.plan, { decimals: 0 })}</b>
                <small>{x.done >= 0.5 ? <>al {money(x.done)} · {x.todo >= 0.5 ? <>nog <b>{money(x.todo, { decimals: 0 })}</b></> : 'klaar ✓'}</> : 'nog niets ingelegd'}</small>
              </span>
            </div>
          ))}
          <div className="al-mp__row al-mp__tot">
            <span>Totaal{sum < 99.95 ? ` (${fmtPct(sum, { decimals: 0, sign: false })} verdeeld)` : ''}</span>
            <span className="al-mp__amt num"><b>{money(rows.reduce((a, x) => a + x.plan, 0), { decimals: 0 })}</b><small>nog {money(todo, { decimals: 0 })} deze maand</small></span>
          </div>
        </div>
      )}
      {!showEdit && !(amount > 0) && <div className="al-msg" style={{ marginTop: 0 }}>Vul hierboven in wat je deze maand overhoudt.</div>}
    </div>
  );
}

function AlMonthPlan({ app, grouping, targets, sumOk, hasTargets }) {
  const privacy = usePrivacy();
  const money = (v, o) => (privacy ? '€ •••••' : fmtMoney(v, o));
  const saved = (app.state && app.state.monthlyPlan) || {};
  const [amt, setAmt] = useState(saved.amount ? alNum(saved.amount) : '');
  const [maxBuf, setMaxBuf] = useState(saved.bufferMax ? alNum(saved.bufferMax) : '');
  useEffect(() => { setAmt(saved.amount ? alNum(saved.amount) : ''); setMaxBuf(saved.bufferMax ? alNum(saved.bufferMax) : ''); }, [saved.updatedAt]); // eslint-disable-line
  const write = useDebouncedCallback(patch => {
    app.setSyncedState(s => ({ ...s, monthlyPlan: { ...(s.monthlyPlan || {}), ...patch, updatedAt: new Date().toISOString() } }));
  }, 400);
  const bufferFirst = saved.bufferFirst !== false;
  const mode = saved.mode === 'doel' ? 'doel' : 'vast';
  const finOver = (() => { const fo = normalizeFinancieelOver(app.financieelOver); return fo && fo.bedrag > 0.5 ? Math.floor(fo.bedrag) : null; })();
  const amount = Math.max(0, parseNlNumber(amt) || 0);
  const bufMaxNum = Math.max(0, parseNlNumber(maxBuf) || 0);

  const model = app.model;
  const calc = React.useMemo(() => {
    const summaries = model.summaries || [];
    const inflow = monthInflowByParty(model);
    // potjes: niet in de verdeling, wel een eurodoel
    const pots = summaries.filter(x => x.party.excludeFromAllocation === true && +x.party.goal > 0 && x.party.unit === 'eur' && dtIncluded(x.party))
      .map(x => {
        const done = inflow[x.party.id] || 0;
        const start = (x.currentValueEur || 0) - done;
        return { key: x.party.id, label: x.party.name, color: partyColorOf(x.party), goal: +x.party.goal, value: x.currentValueEur || 0, gap: Math.max(0, +x.party.goal - start), done };
      });
    let left = amount;
    pots.forEach(pt => {
      const cap = bufferFirst ? (bufMaxNum > 0 ? Math.min(bufMaxNum, pt.gap) : pt.gap) : 0;
      pt.plan = Math.min(left, cap); left -= pt.plan;
      pt.todo = Math.max(0, pt.plan - Math.max(0, pt.done));
    });
    // onderdelen van de verdeling, met de waarde aan het begin van de maand
    const doneByGroup = {};
    summaries.filter(x => inAllocation(x.party)).forEach(x => {
      const k = grouping === 'party' ? x.party.id : (x.party.category || 'Overig');
      // Vrij op rekening schommelt met je betaalrekening: dat is geen inleg.
      if (x.party.id !== FIN_OVER_PARTY_ID) doneByGroup[k] = (doneByGroup[k] || 0) + (inflow[x.party.id] || 0);
    });
    const byParty = Object.fromEntries(summaries.map(x => [x.party.id, x.party]));
    const groups = allocationGroups(summaries, grouping).map(g => ({
      ...g,
      color: grouping === 'party' ? partyColorOf(byParty[g.key] || {}) : ASSET_CLASS_BY_KEY[assetClassOf({ category: g.key })].color,
      value: Math.max(0, g.value - (doneByGroup[g.key] || 0)),
    }));
    const res = computeAllocation(groups, targets, left);
    const rows = res.rows.filter(r => r.plan >= 0.5 || (doneByGroup[r.key] || 0) >= 0.5).map(r => {
      const done = doneByGroup[r.key] || 0;
      return { ...r, done, todo: Math.max(0, r.plan - Math.max(0, done)) };
    }).sort((a, b) => b.plan - a.plan);
    const todo = pots.reduce((a, x) => a + x.todo, 0) + rows.reduce((a, x) => a + x.todo, 0);
    const done = pots.reduce((a, x) => a + Math.max(0, x.done), 0) + rows.reduce((a, x) => a + Math.max(0, x.done), 0);
    return { pots, rows, rest: left, todo, done };
  }, [model, grouping, targets, amount, bufferFirst, bufMaxNum]);

  const month = MONTHS_NL_LONG[new Date().getMonth()];
  const row = (r, extra) => (
    <div className="al-mp__row" key={r.key}>
      <span className="al-label"><Swatch color={r.color} />{r.label}</span>
      <span className="al-mp__amt num">
        <b>{money(r.plan)}</b>
        <small>{r.done >= 0.5 ? <>al {money(r.done)} · {r.todo >= 0.5 ? <>nog <b>{money(r.todo)}</b></> : 'klaar ✓'}</> : extra || 'nog niets ingelegd'}</small>
      </span>
    </div>
  );
  return (
    <Card title="Maandelijks inleggen" meta={amount > 0 && mode === 'doel' ? `${month} · nog ${money(calc.todo)} te doen` : null}>
      <div className="al-mp">
        <div className="al-storten">
          <MoneyInput id="al-mp-amount" large value={amt} placeholder="0" data-testid="monthly-amount" ariaLabel="Bedrag per maand"
            onChange={v => { setAmt(v); write({ amount: Math.max(0, parseNlNumber(v) || 0) }); }} />
          {finOver != null && Math.round(amount) !== finOver && (
            <Button variant="secondary" size={app.isMobile ? 'md' : 'lg'} onClick={() => { setAmt(String(finOver)); write({ amount: finOver }); }}
              title="Wat je volgens je Financieel-systeem deze maand overhoudt">Wat ik overhoud: {money(finOver, { decimals: 0 })}</Button>
          )}
        </div>
        <Segmented ariaLabel="Verdelen" size="sm" value={mode} onChange={v => write({ mode: v })}
          options={[{ value: 'vast', label: 'Vaste verdeling' }, { value: 'doel', label: 'Naar doelverdeling' }]} />
        {mode === 'vast' ? <AlFixedSplit app={app} amount={amount} /> : <>
        <div className="al-msg">Je ziet hoeveel je in elk onderdeel stopt om je doelverdeling aan te houden. Wat je deze maand al inlegde, wordt eraf gehaald.</div>
        {calc.pots.length > 0 && (
          <div className="al-mp__buf">
            <Switch checked={bufferFirst} onChange={v => write({ bufferFirst: v })} label={`Eerst ${calc.pots.map(x => x.label.toLowerCase()).join(' en ')} aanvullen tot het doel`}
              description={calc.pots.map(x => `${x.label}: ${money(x.value)} van ${money(x.goal)}${x.gap < 0.5 ? ' · doel bereikt' : ''}`).join(' · ')} />
            {bufferFirst && (
              <label className="al-mp__max">
                <span>Maximaal per maand naar {calc.pots.length === 1 ? calc.pots[0].label.toLowerCase() : 'potjes'}</span>
                <MoneyInput value={maxBuf} placeholder="geen max." ariaLabel="Maximum per maand naar buffer"
                  onChange={v => { setMaxBuf(v); write({ bufferMax: Math.max(0, parseNlNumber(v) || 0) }); }} />
              </label>
            )}
          </div>
        )}
        {amount > 0 && (!hasTargets || !sumOk) && calc.rest > 0.5 && (
          <div className="al-warn"><Icon name="triangle-alert" size={14} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{hasTargets ? 'Je doelpercentages tellen niet op tot 100%.' : 'Stel hieronder eerst je doelverdeling in.'} Dan zie je per onderdeel wat je inlegt.</span></div>
        )}
        {amount > 0 && (
          <div className="al-mp__list">
            {calc.pots.filter(x => x.plan >= 0.5 || x.done >= 0.5).map(x => row(x))}
            {hasTargets && sumOk && calc.rows.map(x => row(x))}
          </div>
        )}
        </>}
      </div>
    </Card>
  );
}

function PlanScreen({ app }) {
  const rt = app.route && app.route.params && app.route.params.tab;
  const tab = rt === 'pensioen' || rt === 'jaaroverzicht' || rt === 'inleg' ? rt : 'verdeling';
  const go = v => app.navigate('/plan/' + v);
  const tabs = [
    { value: 'verdeling', label: 'Verdeling', testId: 'plan-tab-verdeling' },
    { value: 'inleg', label: 'Inleg', testId: 'plan-tab-inleg' },
    { value: 'pensioen', label: 'Pensioen', testId: 'plan-tab-pensioen' },
    { value: 'jaaroverzicht', label: 'Jaaroverzicht', testId: 'plan-tab-jaaroverzicht' },
  ];
  return (
    <div className="al-page">
      <div className="al-head">
        <h1 className="sr-only">Plan</h1>
        {!app.isMobile && <Tabs className="al-tabs" ariaLabel="Plan" tabs={tabs} value={tab} onChange={go} />}
      </div>
      {app.isMobile && (
        <Segmented ariaLabel="Plan" full pill value={tab} onChange={go}
          options={tabs.map(t => ({ value: t.value, label: t.value === 'jaaroverzicht' ? 'Jaar' : t.label, testId: t.testId }))} />
      )}
      {tab === 'inleg'
        ? (window.InlegView ? <InlegView app={app} /> : null)
        : tab === 'pensioen'
        ? (window.PensioenView ? <PensioenView app={app} /> : null)
        : tab === 'jaaroverzicht'
          ? (window.JaaroverzichtView ? <JaaroverzichtView app={app} /> : null)
          : <AlVerdelingView app={app} />}
    </div>
  );
}

Object.assign(window, { PlanScreen, ALLOC_GROUPINGS, computeAllocation, allocationGroups });
