// AllocationTab: huidige vs. gewenste verdeling + hoeveel bijstorten om die te halen

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

function AllocationTab({ state, setState, summaries, isMobile }) {
  const saved = state.targetAllocation || {};
  const [grouping, setGrouping] = React.useState(saved.grouping || 'category');
  const [extra, setExtra] = React.useState('');

  const groups  = React.useMemo(() => allocationGroups(summaries, grouping), [summaries, grouping]);
  const targets = (saved[grouping] || {});
  const targetSum = groups.reduce((s, g) => s + (Math.max(0, +targets[g.key] || 0)), 0);
  const sumOk = Math.abs(targetSum - 100) < 0.05;

  const calc = React.useMemo(
    () => computeAllocation(groups, targets, extra),
    [groups, targets, extra]
  );

  const saveTargets = next => setState(s => ({
    ...s,
    targetAllocation: {
      ...(s.targetAllocation || {}),
      grouping,
      [grouping]: next,
      updatedAt: new Date().toISOString(),
    },
  }));
  const setTarget = (key, val) => {
    const clean = val === '' ? '' : Math.max(0, Math.min(100, +val));
    saveTargets({ ...targets, [key]: clean });
  };
  const changeGrouping = key => {
    setGrouping(key);
    setState(s => ({ ...s, targetAllocation: { ...(s.targetAllocation || {}), grouping: key } }));
  };
  const fillFromCurrent = () => saveTargets(Object.fromEntries(
    groups.map(g => [g.key, +(calc.total > 0 ? g.value / calc.total * 100 : 0).toFixed(1)])
  ));
  const normalize = () => {
    if (targetSum <= 0) return;
    saveTargets(Object.fromEntries(
      groups.map(g => [g.key, +((Math.max(0, +targets[g.key] || 0)) / targetSum * 100).toFixed(1)])
    ));
  };

  const card = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding: isMobile ? '16px' : '20px 24px' };
  const kicker = { fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--fg-muted)', marginBottom:6 };
  const hasTargets = targetSum > 0;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? '16px 14px 100px' : '28px 28px 60px' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:16, flexWrap:'wrap', marginBottom:24 }}>
        <div>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--fg-muted)', marginBottom:6, fontFamily:'var(--ff-mono)' }}>
            Portefeuille · {fmtEur(calc.total)}
          </div>
          <h1 style={{ margin:0, fontFamily:'var(--ff-display)', fontWeight:500, fontSize: isMobile ? 30 : 38, letterSpacing:'-0.02em', lineHeight:1 }}>
            Verdeling
          </h1>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {ALLOC_GROUPINGS.map(g => (
            <FilterChip key={g.key} active={grouping === g.key} onClick={() => changeGrouping(g.key)}>{g.label}</FilterChip>
          ))}
        </div>
      </div>

      {/* Stacked bars: huidig vs doel vs na storting */}
      <div style={{ ...card, marginBottom:16 }}>
        <AllocBar label="Huidig" rows={calc.rows} field="currentPct" />
        {hasTargets && <AllocBar label="Doel" rows={calc.rows} field="targetPct" />}
        {hasTargets && calc.amount > 0 && <AllocBar label="Na storting" rows={calc.rows} field="afterPct" />}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 14px', marginTop:12 }}>
          {calc.rows.map(r => (
            <span key={r.key} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'var(--fg-muted)' }}>
              <span style={dotStyle(r.color)} />{r.label}
            </span>
          ))}
        </div>
      </div>

      {/* Samenvatting */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:16, marginBottom:16 }}>
        <div style={card}>
          <div style={kicker}>Bijstorten om doel te halen</div>
          <div style={{ fontFamily:'var(--ff-mono)', fontSize:28, fontWeight:600, color: hasTargets && sumOk ? 'var(--accent)' : 'var(--fg-dim)' }}>
            {hasTargets && sumOk ? fmtEur(calc.needed) : '—'}
          </div>
          <div style={{ fontSize:12, color:'var(--fg-dim)', marginTop:6, fontFamily:'var(--ff-mono)', lineHeight:1.5 }}>
            {!hasTargets ? 'Vul hieronder je gewenste percentages in.'
              : !sumOk ? `Doelen tellen op tot ${targetSum.toFixed(1)}% — moet 100% zijn.`
              : calc.needed < 1 ? 'Je zit al op (of boven) je doelverdeling.'
              : `Zonder te verkopen · nieuw totaal ${fmtEur(calc.neededTotal)}`}
          </div>
          {sumOk && calc.blocked.length > 0 && (
            <div style={{ fontSize:12, color:'var(--negative)', marginTop:8 }}>
              {calc.blocked.join(', ')} {calc.blocked.length === 1 ? 'heeft' : 'hebben'} 0% als doel — dat haal je alleen door te verkopen.
            </div>
          )}
        </div>
        <div style={card}>
          <div style={kicker}>Ik wil storten</div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontFamily:'var(--ff-mono)', fontSize:20, color:'var(--fg-muted)' }}>€</span>
            <input type="number" inputMode="decimal" min="0" step="50" value={extra} placeholder="0"
              onChange={e => setExtra(e.target.value)}
              style={{ ...inputStyle, fontFamily:'var(--ff-mono)', fontSize:20, padding:'8px 12px' }} />
            {hasTargets && sumOk && calc.needed >= 1 && (
              <Button variant="secondary" onClick={() => setExtra(String(Math.ceil(calc.needed)))} style={{ whiteSpace:'nowrap' }}>
                = {fmtEur(Math.ceil(calc.needed))}
              </Button>
            )}
          </div>
          <div style={{ fontSize:12, color:'var(--fg-dim)', marginTop:8, lineHeight:1.5 }}>
            Het bedrag gaat eerst naar de onderwogen onderdelen. De kolom "Storting" toont hoe je het verdeelt.
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div style={card}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:10 }}>
          <div style={{ fontWeight:600, fontSize:15 }}>Doelverdeling</div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontFamily:'var(--ff-mono)', fontSize:12, color: sumOk ? 'var(--positive)' : 'var(--negative)' }}>
              Σ {targetSum.toFixed(1)}%
            </span>
            {!sumOk && targetSum > 0 && <Button variant="secondary" onClick={normalize}>Schaal naar 100%</Button>}
            <Button variant="secondary" onClick={fillFromCurrent}>Neem huidige over</Button>
          </div>
        </div>

        {isMobile ? (
          <div>
            {calc.rows.map(r => (
              <div key={r.key} style={{ padding:'12px 0', borderTop:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, minWidth:0 }}>
                    <span style={dotStyle(r.color)} />{r.label}
                  </span>
                  <TargetInput value={targets[r.key]} onChange={v => setTarget(r.key, v)} />
                </div>
                <DeviationBar current={r.currentPct} target={r.targetPct} color={r.color} />
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--ff-mono)', fontSize:11, color:'var(--fg-muted)', marginTop:4 }}>
                  <span>{fmtEur(r.value)} · {r.currentPct.toFixed(1)}%</span>
                  <span>{calc.amount > 0 ? <>Storting <b style={{ color:'var(--fg)' }}>{fmtEur(r.plan)}</b></> : sumOk && <>Bijstorten <b style={{ color:'var(--fg)' }}>{fmtEur(r.toReach)}</b></>}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', minWidth:820, borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--fg-muted)', fontFamily:'var(--ff-mono)' }}>
                  <th style={thL}>Onderdeel</th>
                  <th style={thR}>Waarde</th>
                  <th style={thR}>Huidig</th>
                  <th style={{ ...thR, paddingRight:22 }}>Doel</th>
                  <th style={{ ...thL, paddingLeft:16, width:150 }}>Afwijking</th>
                  <th style={thR} title="Minimale bijstorting per onderdeel om het doel te halen zonder te verkopen">Bijstorten</th>
                  <th style={thR} title="Kopen/verkopen binnen het huidige totaal">Herbalanceren</th>
                  {calc.amount > 0 && <th style={thR}>Storting</th>}
                </tr>
              </thead>
              <tbody>
                {calc.rows.map(r => (
                  <tr key={r.key} style={{ borderTop:'1px solid var(--border)' }}>
                    <td style={tdL}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}><span style={dotStyle(r.color)} />{r.label}</span>
                    </td>
                    <td style={tdR}>{fmtEur(r.value)}</td>
                    <td style={tdR}>{r.currentPct.toFixed(1)}%</td>
                    <td style={{ ...tdR, padding:'6px 0 6px 8px' }}><TargetInput value={targets[r.key]} onChange={v => setTarget(r.key, v)} /></td>
                    <td style={{ ...tdL, paddingLeft:16 }}><DeviationBar current={r.currentPct} target={r.targetPct} color={r.color} /></td>
                    <td style={{ ...tdR, fontWeight:600 }}>{sumOk ? (r.toReach >= 1 ? fmtEur(r.toReach) : '—') : '—'}</td>
                    <td style={{ ...tdR, color: !sumOk ? 'var(--fg-dim)' : r.rebalance >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                      {sumOk ? `${r.rebalance >= 0 ? '+' : '−'}${fmtEur(Math.abs(r.rebalance))}` : '—'}
                    </td>
                    {calc.amount > 0 && <td style={{ ...tdR, fontWeight:600, color:'var(--accent)' }}>{fmtEur(r.plan)}</td>}
                  </tr>
                ))}
              </tbody>
              {sumOk && (
                <tfoot>
                  <tr style={{ borderTop:'1px solid var(--border-strong)', fontWeight:600 }}>
                    <td style={tdL}>Totaal</td>
                    <td style={tdR}>{fmtEur(calc.total)}</td>
                    <td style={tdR}>100%</td>
                    <td style={tdR}>{targetSum.toFixed(1)}%</td>
                    <td />
                    <td style={tdR}>{fmtEur(calc.needed)}</td>
                    <td style={tdR}>€ 0</td>
                    {calc.amount > 0 && <td style={{ ...tdR, color:'var(--accent)' }}>{fmtEur(calc.amount)}</td>}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop:16, fontSize:11, color:'var(--fg-dim)', fontFamily:'var(--ff-mono)', lineHeight:1.6 }}>
        <b style={{ color:'var(--fg-muted)' }}>Bijstorten</b> = alleen kopen, niet verkopen. <b style={{ color:'var(--fg-muted)' }}>Herbalanceren</b> = kopen én verkopen binnen je huidige totaal.
        Alleen partijen die in het totaal meetellen worden meegenomen. Doelen worden gesynct.
      </div>
    </div>
  );
}

const thL = { textAlign:'left',  padding:'8px 8px 8px 0', fontWeight:600 };
const thR = { textAlign:'right', padding:'8px 0 8px 8px', fontWeight:600 };
const tdL = { textAlign:'left',  padding:'10px 8px 10px 0' };
const tdR = { textAlign:'right', padding:'10px 0 10px 8px', fontFamily:'var(--ff-mono)', whiteSpace:'nowrap' };

function TargetInput({ value, onChange }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, whiteSpace:'nowrap' }}>
      <input type="number" inputMode="decimal" min="0" max="100" step="0.5"
        value={value ?? ''} placeholder="0"
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, width:72, padding:'5px 8px', textAlign:'right', fontFamily:'var(--ff-mono)', fontSize:13 }} />
      <span style={{ fontSize:12, color:'var(--fg-muted)' }}>%</span>
    </span>
  );
}

function AllocBar({ label, rows, field }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'88px 1fr', alignItems:'center', gap:10, marginBottom:8 }}>
      <span style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--fg-muted)', fontFamily:'var(--ff-mono)' }}>{label}</span>
      <div style={{ display:'flex', height:22, borderRadius:6, overflow:'hidden', background:'var(--surface-2)' }}>
        {rows.filter(r => r[field] > 0).map(r => (
          <div key={r.key} title={`${r.label}: ${r[field].toFixed(1)}%`}
            style={{ width:`${r[field]}%`, background:r.color, transition:'width .3s',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:10, color:'#fff', fontFamily:'var(--ff-mono)', overflow:'hidden', whiteSpace:'nowrap',
              borderRight:'1px solid var(--surface)' }}>
            {r[field] >= 7 ? `${Math.round(r[field])}%` : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

// Balk met huidige % en een markering op het doel-%.
function DeviationBar({ current, target, color }) {
  const scale = Math.max(current, target, 1) * 1.15;
  const diff = current - target;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6 }}>
      <div style={{ position:'relative', flex:1, height:8, background:'var(--surface-2)', borderRadius:4 }}>
        <div style={{ width:`${current / scale * 100}%`, height:'100%', background:color, borderRadius:4, opacity:.85 }} />
        {target > 0 && (
          <div title={`Doel ${target.toFixed(1)}%`}
            style={{ position:'absolute', top:-3, bottom:-3, left:`${target / scale * 100}%`, width:2, background:'var(--fg)', borderRadius:1 }} />
        )}
      </div>
      <span style={{ fontFamily:'var(--ff-mono)', fontSize:11, minWidth:44, textAlign:'right',
        color: Math.abs(diff) < 0.5 ? 'var(--fg-dim)' : diff > 0 ? 'var(--negative)' : 'var(--positive)' }}>
        {diff >= 0 ? '+' : '−'}{Math.abs(diff).toFixed(1)}
      </span>
    </div>
  );
}

Object.assign(window, { AllocationTab, computeAllocation, allocationGroups });
