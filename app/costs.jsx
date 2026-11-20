// Kosten per aanbieder: wat er geboekt is (transactiekosten, opslag, fees) plus een schatting van de lopende kosten
// (bijv. fondskosten of herbalanceren) op basis van de waarde door de tijd. Per aanbieder een kostenprofiel;
// standaardwaarden komen van de tarievenpagina's van de aanbieders en moeten door jou bevestigd worden.
const { useState: kcUseState, useMemo: kcUseMemo } = React;

injectStyles('costs', `
.kc-page { display: grid; gap: 16px; min-width: 0; padding: 20px 24px 48px; max-width: 980px; }
.kc-head h1 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -0.01em; }
.kc-lead { margin: 4px 0 0; color: var(--fg-muted); font-size: 13.5px; line-height: 1.5; max-width: 680px; }
.kc-sum { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: var(--r-card); overflow: clip; }
.kc-sum > div { background: var(--surface); padding: 12px 14px; }
.kc-sum__l { font-size: 12px; color: var(--fg-muted); }
.kc-sum__v { font-size: 19px; font-weight: 650; margin-top: 2px; font-variant-numeric: tabular-nums; }
.kc-sum__s { font-size: 11.5px; color: var(--fg-subtle); margin-top: 1px; }
.kc-list { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-card); overflow: clip; }
.kc-row { display: grid; grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 0.8fr)) 92px; gap: 12px; align-items: center; width: 100%; padding: 11px 16px; border: 0; border-top: 1px solid var(--border); background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.kc-row:first-child { border-top: 0; }
.kc-row:hover { background: var(--surface-2); }
.kc-row--head { cursor: default; font-size: 11.5px; color: var(--fg-muted); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; padding-top: 9px; padding-bottom: 9px; background: var(--surface-2); }
.kc-row--head:hover { background: var(--surface-2); }
.kc-n { text-align: right; font-variant-numeric: tabular-nums; font-size: 13.5px; }
.kc-name { font-size: 14px; font-weight: 600; }
.kc-desc { font-size: 12px; color: var(--fg-muted); margin-top: 1px; }
.kc-st { justify-self: end; font-size: 11.5px; font-weight: 600; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
.kc-st--ok { color: var(--gain); background: color-mix(in srgb, var(--gain) 12%, transparent); }
.kc-st--def { color: var(--fg-muted); background: var(--surface-2); }
.kc-st--unk { color: var(--warn); background: color-mix(in srgb, var(--warn) 14%, transparent); }
.kc-form { display: grid; gap: 12px; }
.kc-form .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.kc-note { font-size: 12px; color: var(--fg-muted); line-height: 1.45; margin: 0; }
@media (max-width: 767.98px) {
  .kc-page { padding: 12px 16px 24px; gap: 12px; }
  .kc-sum { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .kc-row { grid-template-columns: minmax(0, 1fr) auto; gap: 4px 10px; }
  .kc-row--head { display: none; }
  .kc-row .kc-n--hide { display: none; }
  .kc-row .kc-mob { grid-column: 1 / -1; font-size: 12px; color: var(--fg-muted); }
}
@media (min-width: 768px) { .kc-mob { display: none; } }
`);

// Standaardprofielen (bron: tarievenpagina's, november 2026). tradePct = % per aan-/verkoop (alleen geschat als er geen
// kosten bij de boeking staan), yearlyPct = % per jaar van de waarde, inValue = zit al in de koers/waarde (wordt niet nog eens
// afgetrokken, alleen getoond), booked = deze kosten worden al als boeking bijgehouden.
const KC_DEFAULTS = {
  meesman: { tradePct: 0.25, yearlyPct: 0.40, inValue: true, text: '0,25% per inleg · 0,40% fondskosten per jaar (zit in de koers)', src: 'meesman.nl/kosten' },
  'finst-btc': { tradePct: 0.15, text: '0,15% per aan- of verkoop', src: 'finst.com/nl/fees' },
  'finst-eth': { tradePct: 0.15, text: '0,15% per aan- of verkoop', src: 'finst.com/nl/fees' },
  'finst-paxg': { tradePct: 0.15, text: '0,15% per aan- of verkoop', src: 'finst.com/nl/fees' },
  'finst-top25': { tradePct: 0.15, yearlyPct: 1.2, inValue: true, text: '0,15% per aan- of verkoop · herbalanceren 0,1% per maand (zit in de waarde)', src: 'finst.com/nl/fees' },
  goldrepublic: { tradePct: 1, yearlyPct: 0.5, booked: true, text: '1% per aan- of verkoop · opslag 0,5%/jaar goud, 1%/jaar zilver (als boeking)', src: 'goldrepublic.com/nl-nl/tarieven' },
  trading212: { tradePct: 0, text: 'Geen commissie · 0,15% wisselkoerskosten op niet-euro-aandelen (komt via de koppeling mee)', src: 'trading212.com · Costs and Charges' },
  'trading212-cfd': { tradePct: 0, text: 'Spread en overnight-rente zitten in het resultaat dat je bij sluiten invult', src: 'trading212.com · Costs and Charges' },
  cash: { none: true, text: 'Geen kosten' },
  'lopende-rekening': { none: true, text: 'Geen kosten' },
};

function kcProfile(p) {
  const d = KC_DEFAULTS[p.id] || null;
  const own = p.costs || null;
  if (own) return { ...(d || {}), ...own, status: own.confirmed ? 'ok' : (d ? 'def' : 'unk') };
  if (d) return { ...d, status: d.none ? 'ok' : 'def' };
  return { status: 'unk', text: 'Kosten onbekend' };
}
function kcText(pr) {
  if (pr.customText) return pr.customText;
  if (pr.text && !pr.edited) return pr.text;
  const parts = [];
  if (pr.none) return 'Geen kosten';
  if (pr.tradePct) parts.push(`${String(pr.tradePct).replace('.', ',')}% per aan-/verkoop`);
  if (pr.yearlyPct) parts.push(`${String(pr.yearlyPct).replace('.', ',')}% per jaar${pr.inValue ? ' (zit in de waarde)' : ''}`);
  if (pr.fixedYear) parts.push(`€${String(pr.fixedYear).replace('.', ',')} per jaar`);
  return parts.length ? parts.join(' · ') : 'Geen kosten';
}

// Kosten van één partij over [from, to] (ISO-datums; from null = alles).
function kcCompute(p, pr, txs, series, from, to) {
  let booked = 0, estTrade = 0;
  for (const t of txs) {
    if (t.party !== p.id || (from && t.date < from) || t.date > to) continue;
    const fee = +t.feeEur || 0;
    if (t.type === 'kosten') booked += +t.amountEur || 0;
    booked += fee;
    if ((t.type === 'koop' || t.type === 'verkoop') && !fee && pr.tradePct) {
      const amt = +t.amountEur || ((+t.quantity || 0) * (+t.unitPriceEur || 0));
      estTrade += amt * pr.tradePct / 100;
    }
  }
  // Lopende kosten: Σ waarde × % × dagen/365 over de reeks.
  let running = 0;
  if ((pr.yearlyPct || pr.fixedYear) && series && series.dates) {
    const v = series.byParty && series.byParty[p.id];
    const d = series.dates;
    if (v) for (let i = 1; i < d.length; i++) {
      if ((from && d[i] < from) || d[i] > to) continue;
      const days = (Date.parse(d[i]) - Date.parse(d[i - 1])) / 86400000;
      const val = v[i - 1] || 0;
      if (val > 0.5) running += (val * (pr.yearlyPct || 0) / 100 + (pr.fixedYear || 0)) * days / 365;
    }
  }
  // Opslag bij Goldrepublic e.d. staat al als boeking: niet nog eens schatten.
  if (pr.booked) running = 0;
  return { booked, estTrade, running, total: booked + estTrade + running };
}

// Bij een post (Finst, Wallet) de naam van de post erbij, zodat bijv. twee keer "Ethereum" te onderscheiden is.
function kcName(app, p) {
  const post = app.model && app.model.postOfLeaf && app.model.postOfLeaf[p.id];
  const pp = post && post !== p.id && app.model.byId[post] && app.model.byId[post].party;
  return pp ? `${pp.name} · ${p.name}` : p.name;
}

function KcEdit({ app, party, onClose }) {
  const pr = kcProfile(party);
  const [f, setF] = kcUseState({
    tradePct: pr.tradePct ?? '', yearlyPct: pr.yearlyPct ?? '', fixedYear: pr.fixedYear ?? '', inValue: !!pr.inValue, none: !!pr.none, note: (party.costs && party.costs.note) || '',
  });
  const num = v => { const n = parseNlNumber(String(v)); return n == null || isNaN(n) ? null : n; };
  const save = () => {
    const costs = { tradePct: num(f.tradePct), yearlyPct: num(f.yearlyPct), fixedYear: num(f.fixedYear), inValue: f.inValue, none: f.none,
      booked: pr.booked || false, note: f.note.trim() || null, confirmed: true, edited: true, updatedAt: new Date().toISOString() };
    app.saveParty({ ...party, costs });
    app.toast && app.toast(`Kosten van ${party.name} opgeslagen`);
    onClose();
  };
  return (
    <Dialog open onClose={onClose} title={`Kosten · ${kcName(app, party)}`}
      actions={<><Button variant="secondary" onClick={onClose}>Annuleren</Button><Button variant="primary" onClick={save}>Bevestigen</Button></>}>
      <div className="kc-form">
        {pr.src && <p className="kc-note">Standaard volgens {pr.src}: {pr.text}. Klopt dit niet voor jou, pas het dan aan.</p>}
        <Switch label="Geen kosten" checked={f.none} onChange={v => setF({ ...f, none: v })} />
        {!f.none && <>
          <div className="row2">
            <Field label="Per aan-/verkoop (%)" hint="Alleen geschat als er geen kosten bij de boeking staan"><input className="input" inputMode="decimal" value={f.tradePct} onChange={e => setF({ ...f, tradePct: e.target.value })} placeholder="0,15" /></Field>
            <Field label="Per jaar (% van waarde)"><input className="input" inputMode="decimal" value={f.yearlyPct} onChange={e => setF({ ...f, yearlyPct: e.target.value })} placeholder="0,40" /></Field>
          </div>
          <Field label="Vast bedrag per jaar (€)"><input className="input" inputMode="decimal" value={f.fixedYear} onChange={e => setF({ ...f, fixedYear: e.target.value })} placeholder="0" /></Field>
          <Switch label="Jaarkosten zitten al in de koers of waarde" description="Bijv. fondskosten. Dan tonen we ze alleen, ze verlagen je resultaat niet nog eens." checked={f.inValue} onChange={v => setF({ ...f, inValue: v })} />
        </>}
        <Field label="Notitie"><input className="input" value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="Bijv. beheerfee 2% per jaar volgens contract" /></Field>
      </div>
    </Dialog>
  );
}

function KostenScreen({ app }) {
  const [period, setPeriod] = kcUseState('jaar');
  const [edit, setEdit] = kcUseState(null);
  const parties = ((app.state && app.state.parties) || []).filter(p => p && p.unit !== 'post' && !p.archived);
  const txs = (app.state && app.state.transactions) || [];
  const series = app.model && app.model.series;
  const today = todayIsoLocal();
  const from = period === 'jaar' ? today.slice(0, 4) + '-01-01' : null;
  const rows = kcUseMemo(() => parties
    .filter(p => txs.some(t => t.party === p.id))
    .map(p => { const pr = kcProfile(p); return { p, pr, c: kcCompute(p, pr, txs, series, from, today) }; })
    .sort((a, b) => (a.pr.status === 'unk') - (b.pr.status === 'unk') || b.c.total - a.c.total), [parties, txs, series, from, today]); // eslint-disable-line
  const sum = k => rows.reduce((a, r) => a + r.c[k], 0);
  const value = (app.model && app.model.totals && app.model.totals.value) || 0;
  // Lopend per jaar (huidige waarde × % per jaar), als percentage van het vermogen.
  const perYear = rows.reduce((a, r) => a + ((app.model.byId[r.p.id] || {}).currentValueEur || 0) * ((r.pr.booked ? 0 : r.pr.yearlyPct) || 0) / 100 + (r.pr.fixedYear || 0), 0);
  const unknown = rows.filter(r => r.pr.status === 'unk').length;
  const m = v => (app.prefs && app.prefs.privacy ? '•••' : fmtMoney(v, { decimals: 2 }));
  return (
    <div className="kc-page">
      <div className="kc-head">
        {!app.isMobile && <h1>Kosten</h1>}
        <p className="kc-lead">Geboekte kosten (transactiekosten, opslag, fees) en een schatting van de lopende kosten per aanbieder. Tik op een aanbieder om de tarieven te controleren of in te vullen.{unknown > 0 ? ` Van ${unknown} ${unknown === 1 ? 'aanbieder' : 'aanbieders'} zijn de kosten nog onbekend.` : ''}</p>
      </div>
      <Segmented ariaLabel="Periode" value={period} onChange={setPeriod} options={[{ value: 'jaar', label: `Dit jaar (${today.slice(0, 4)})` }, { value: 'alles', label: 'Sinds start' }]} />
      <div className="kc-sum">
        <div><div className="kc-sum__l">Totaal</div><div className="kc-sum__v">{m(sum('total'))}</div><div className="kc-sum__s">{period === 'jaar' ? 'dit jaar' : 'sinds start'}</div></div>
        <div><div className="kc-sum__l">Geboekt</div><div className="kc-sum__v">{m(sum('booked'))}</div><div className="kc-sum__s">bij transacties</div></div>
        <div><div className="kc-sum__l">Geschat</div><div className="kc-sum__v">{m(sum('estTrade') + sum('running'))}</div><div className="kc-sum__s">lopend + ontbrekend</div></div>
        <div><div className="kc-sum__l">Lopend per jaar</div><div className="kc-sum__v">{m(perYear)}</div><div className="kc-sum__s">{value > 0 ? fmtPct(perYear / value * 100, { decimals: 2 }).replace(/^\+/, '') + ' van je vermogen' : ''}</div></div>
      </div>
      <div className="kc-list">
        <div className="kc-row kc-row--head"><span>Aanbieder</span><span className="kc-n">Geboekt</span><span className="kc-n">Geschat</span><span className="kc-n">Totaal</span><span /></div>
        {rows.map(({ p, pr, c }) => (
          <button key={p.id} type="button" className="kc-row" onClick={() => setEdit(p)}>
            <span style={{ minWidth: 0 }}><div className="kc-name">{kcName(app, p)}</div><div className="kc-desc">{kcText(pr)}{p.costs && p.costs.note ? ' · ' + p.costs.note : ''}</div></span>
            <span className="kc-n kc-n--hide">{m(c.booked)}</span>
            <span className="kc-n kc-n--hide">{m(c.estTrade + c.running)}</span>
            <span className="kc-n" style={{ fontWeight: 600 }}>{m(c.total)}</span>
            <span className={'kc-st kc-st--' + pr.status}>{pr.status === 'ok' ? 'Bevestigd' : pr.status === 'def' ? 'Standaard' : 'Onbekend'}</span>
            <span className="kc-mob">Geboekt {m(c.booked)} · geschat {m(c.estTrade + c.running)}</span>
          </button>
        ))}
      </div>
      <p className="kc-note">"Standaard" = tarief van de website van de aanbieder (november 2026), nog niet door jou bevestigd. Kosten die al in de koers of waarde zitten (zoals fondskosten) staan hier ter informatie; je rendement is daar al op gebaseerd.</p>
      {edit && <KcEdit app={app} party={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

Object.assign(window, { KostenScreen, kcProfile, kcCompute });
