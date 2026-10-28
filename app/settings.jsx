// Instellingen (S6): InstellingenScreen + PriceRows

const ST_SECTIONS = [
  { key: 'weergave',    label: 'Weergave',       icon: 'sun',                desc: 'Thema, kleuren en privacy' },
  { key: 'overzicht',   label: 'Overzicht',      icon: 'layout-dashboard',   desc: 'Modules en standaardperiode' },
  { key: 'koersen',     label: 'Koersen',        icon: 'trending-up',        desc: 'Live prijzen en Meesman NAV' },
  { key: 'wallet',      label: 'Wallet',         icon: 'wallet',             desc: 'Coinbase Wallet alleen-lezen koppelen' },
  { key: 'sync',        label: 'Synchronisatie', icon: 'cloud',              desc: 'Supabase-koppeling' },
  { key: 't212',        label: 'Trading 212',    icon: 'download',           desc: 'Stortingen en waarde importeren' },
  { key: 'partijen',    label: 'Partijen',       icon: 'layers',             desc: 'Partijen beheren en toevoegen' },
  { key: 'gegevens',    label: 'Gegevens',       icon: 'arrow-down-to-line', desc: 'Exporteren en importeren' },
  { key: 'gevarenzone', label: 'Gevarenzone',    icon: 'triangle-alert',     desc: 'Verwijderen en terugzetten' },
  { key: 'over',        label: 'Over',           icon: 'info',               desc: 'Versie, uitleg en sneltoetsen' },
];
const ST_GROUPS = [['weergave', 'overzicht'], ['koersen', 'wallet', 'sync', 't212'], ['partijen', 'gegevens'], ['gevarenzone', 'over']];
const ST_SETTINGS_PRICE_ORDER = ['gold', 'silver', 'btc', 'eth', 'paxg'];
const ST_PRICE_UNITS = { gold: '€/g', silver: '€/oz', btc: '€/BTC', eth: '€/ETH', paxg: '€/PAXG', meesman: '€/part.' };
const ST_SQL = `create table if not exists portfolio (\n  id text primary key,\n  data jsonb not null default '{}',\n  updated_at timestamptz default now()\n);\nalter table portfolio enable row level security;\ndrop policy if exists "allow all" on portfolio;\ncreate policy "allow all" on portfolio\n  for all using (true) with check (true);`;
const ST_SHORTCUTS = [
  ['N', 'Nieuwe transactie'], ['H', 'Bedragen verbergen / tonen'], ['[', 'Zijbalk in- of uitklappen'], [',', 'Instellingen'],
  ['1–5', 'Periode 1M / 3M / YTD / 1J / Alles (Overzicht, Posities)'], ['Esc', 'Paneel sluiten, daarna peildatum wissen'],
  ['← / →', 'Grafiek: één dag (Shift: 30 dagen)'], ['↑ / ↓', 'Tabellen: rij kiezen, Enter opent'],
];

injectStyles('settings', `
  .st-page { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 28px; padding: 24px 24px 48px; align-items: start; }
  .st-nav { position: sticky; top: calc(var(--topbar-h) + 16px); display: flex; flex-direction: column; gap: 1px; }
  .st-nav__item { display: flex; align-items: center; gap: 10px; height: 32px; padding: 0 10px; border-radius: var(--r-2); color: var(--fg-muted); font: inherit; font-size: 13.5px; font-weight: 500; background: none; border: 0; cursor: pointer; text-align: left; }
  .st-nav__item:hover { background: var(--surface-2); color: var(--fg); }
  .st-nav__item[aria-current="page"] { background: var(--surface-2); color: var(--fg); }
  .st-nav__item--warn[aria-current="page"], .st-nav__item--warn:hover { color: var(--warn); }
  .st-main { min-width: 0; max-width: min(100%, 720px); display: flex; flex-direction: column; gap: 16px; }
  .st-h { font-size: 20px; font-weight: 650; letter-spacing: -.01em; margin: 0; }
  .st-lead { font-size: 13px; color: var(--fg-muted); margin: -10px 0 0; }
  .st-mlist { display: flex; flex-direction: column; gap: 16px; padding: 16px; }
  .st-mgroup { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-card); overflow: hidden; }
  .st-mgroup .list-row + .list-row { border-top: 1px solid var(--border); }
  .st-mgroup .list-row { width: 100%; }
  .st-mgroup__icon { width: 32px; height: 32px; border-radius: var(--r-2); background: var(--surface-2); display: grid; place-items: center; color: var(--fg-muted); flex: none; }
  .st-mgroup__icon--warn { color: var(--warn); background: var(--warn-soft); }
  .st-mpage { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
  .st-stack { display: flex; flex-direction: column; gap: 12px; }
  .st-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .st-row--between { justify-content: space-between; }
  .st-note { font-size: 12.5px; line-height: 18px; color: var(--fg-subtle); margin: 0; }
  .st-status { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--fg-muted); min-width: 0; }
  .st-status--ok { color: var(--gain); }
  .st-status--err { color: var(--warn); word-break: break-word; }
  .st-label { font-size: 13.5px; font-weight: 600; color: var(--fg); }
  .st-sub { font-size: 12px; color: var(--fg-subtle); }
  .st-addr { font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: 13px; }
  .st-wcoin { display: flex; flex-direction: column; gap: 6px; padding-top: 12px; border-top: 1px solid var(--border); }
  .st-wcoin:first-of-type { border-top: 0; padding-top: 0; }
  .st-wline { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12.5px; color: var(--fg-muted); font-variant-numeric: tabular-nums; }
  .st-wline b { color: var(--fg); font-weight: 600; }
  .st-wline .st-status--err { font-size: 12.5px; }
  .st-switches > .switch + .switch { border-top: 1px solid var(--border); }
  .st-themes .seg__btn { gap: 8px; }
  .st-theme-sw { width: 14px; height: 14px; border-radius: 4px; box-shadow: inset 0 0 0 1px rgb(127 127 127 / .45); flex: none; display: inline-block; vertical-align: -2px; margin-right: 6px; }
  .st-theme-sw--light { background: #eff1f3; }
  .st-theme-sw--dark { background: #0a0b0e; }
  .st-theme-sw--system { background: linear-gradient(135deg, #eff1f3 50%, #0a0b0e 50%); }
  .st-prices { display: flex; flex-direction: column; gap: 4px; }
  .st-prices__head { display: flex; align-items: center; gap: 12px; justify-content: space-between; flex-wrap: wrap; padding-bottom: 8px; }
  .st-price { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; min-height: 48px; padding: 6px 0; border-top: 1px solid var(--border); }
  .st-price__name { display: flex; flex-direction: column; min-width: 0; }
  .st-price__title { font-size: 14px; font-weight: 550; }
  .st-price__title b { font-size: 11px; font-weight: 600; color: var(--fg-subtle); margin-left: 6px; letter-spacing: .02em; }
  .st-price__val { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
  .st-price__px { font-size: 14px; font-weight: 600; }
  .st-price__input { display: flex; align-items: center; gap: 6px; }
  .st-price__input .input { width: 140px; text-align: right; }
  .st-price__unit { font-size: 12px; color: var(--fg-subtle); min-width: 48px; }
  .st-meesman { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
  .st-meesman .kpi__value { font-size: 18px; }
  .st-inline { display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap; }
  .st-inline .field { flex: 1 1 180px; }
  .st-pre { margin: 8px 0 0; padding: 10px 12px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-2); font: 12px/18px ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--fg-muted); white-space: pre-wrap; overflow-x: auto; }
  .st-details summary { cursor: pointer; font-size: 13.5px; font-weight: 600; }
  .st-details p { font-size: 12.5px; line-height: 18px; color: var(--fg-muted); }
  .st-key { position: relative; }
  .st-key .input { padding-right: 44px; width: 100%; }
  .st-key .icon-btn { position: absolute; right: 2px; top: 50%; transform: translateY(-50%); }
  .st-parties { display: flex; flex-direction: column; }
  .st-parties .list-row { width: 100%; border-top: 1px solid var(--border); }
  .st-parties .list-row:first-child { border-top: 0; }
  .st-badges { display: inline-flex; gap: 4px; flex-wrap: wrap; margin-left: 6px; vertical-align: 1px; }
  .st-danger { border-color: color-mix(in srgb, var(--warn) 55%, var(--border)) !important; }
  .st-danger__row { display: flex; align-items: center; gap: 16px; justify-content: space-between; flex-wrap: wrap; padding: 4px 0; }
  .st-danger__row + .st-danger__row { border-top: 1px solid var(--border); padding-top: 14px; }
  .st-danger__text { flex: 1 1 260px; min-width: 0; }
  .st-explain { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; line-height: 20px; color: var(--fg-muted); }
  .st-explain b { color: var(--fg); font-weight: 600; }
  .st-keys { width: 100%; border-collapse: collapse; font-size: 13px; }
  .st-keys td { padding: 6px 0; border-top: 1px solid var(--border); color: var(--fg-muted); vertical-align: middle; }
  .st-keys td:first-child { width: 80px; }
  .st-link { background: none; border: 0; padding: 0; color: var(--accent); font: inherit; font-size: 13.5px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; text-align: left; }
  .st-link:hover { text-decoration: underline; }
  @media (max-width: 767.98px) {
    .st-price__input .input { width: 120px; }
    .st-mpage .card { border-radius: var(--r-card); }
  }
`);

function stTimeFull(iso) {
  try { return new Date(iso).toLocaleTimeString('nl-NL'); } catch (e) { return ''; }
}

function stPriceStatus(spotStatus) {
  if (spotStatus?.loading) return { cls: '', dot: 'busy', text: 'Ophalen…' };
  if (spotStatus?.error) return { cls: 'st-status--err', dot: null, text: '⚠ ' + spotStatus.error };
  if (spotStatus?.fetchedAt) return { cls: '', dot: 'ok', text: 'Live · bijgewerkt ' + stTimeFull(spotStatus.fetchedAt) };
  return { cls: '', dot: 'off', text: 'Handmatig' };
}

function stNumText(v) {
  if (v == null || !Number.isFinite(+v)) return '';
  return String(+v).replace('.', ',');
}

// ── Price rows (sheet = read-only, settings = editable) ──
function StPriceInput({ app, asset }) {
  const current = app.tweaks?.[asset.spotKey];
  const [draft, setDraft] = React.useState(null);
  const commit = () => {
    if (draft == null) return;
    const n = parseNlNumber(draft);
    setDraft(null);
    if (n == null || !(n > 0) || n === +current) return;
    app.updateTweaks(tw => ({ ...tw, [asset.spotKey]: n }));
  };
  return (
    <span className="st-price__input">
      <input className="input num" type="text" inputMode="decimal" aria-label={`${asset.label} (${ST_PRICE_UNITS[asset.key]})`}
        data-testid={'price-input-' + asset.spotKey}
        value={draft != null ? draft : stNumText(current)}
        onFocus={e => setDraft(stNumText(current)) || e.target.select()}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); e.currentTarget.blur(); }
          if (e.key === 'Escape') { setDraft(null); e.currentTarget.blur(); }
        }} />
      <span className="st-price__unit">{ST_PRICE_UNITS[asset.key]}</span>
    </span>
  );
}

function PriceRows({ app, variant = 'sheet' }) {
  const st = stPriceStatus(app.spotStatus);
  const settings = variant === 'settings';
  const assets = settings
    ? ST_SETTINGS_PRICE_ORDER.map(k => PRICE_ASSETS.find(a => a.key === k)).filter(Boolean)
    : PRICE_ASSETS;
  return (
    <div className="st-prices">
      <div className="st-prices__head">
        <span className={'st-status ' + st.cls} aria-live="polite">
          {st.dot && <StatusDot status={st.dot} />}
          <span>{st.text}</span>
        </span>
        <Button size="sm" icon="refresh-cw" data-testid="refresh-prices" disabled={!!app.spotStatus?.loading}
          onClick={e => app.refreshSpot(e)}>Nu verversen</Button>
      </div>
      {assets.map(a => {
        const hist = app.spots?.[a.histKey] || [];
        const last = hist.length ? hist[hist.length - 1] : null;
        const ch = priceChange(hist, 30);
        const sub = a.key === 'meesman'
          ? (last ? `NAV ${fmtDateLong(last.date)} · ${hist.length} punten` : 'Geen historie')
          : `${hist.length} punten` + (ch != null && !settings ? ` · ${fmtPct(ch, { decimals: 1 })} 30d` : '');
        return (
          <div key={a.key} className="st-price">
            <div className="st-price__name">
              <span className="st-price__title">{a.label}<b>{a.symbol}</b></span>
              <span className="st-sub num">{sub}</span>
            </div>
            {settings ? <StPriceInput app={app} asset={a} /> : (
              <div className="st-price__val">
                <span className="st-price__px num">{fmtMoney(app.spots?.[a.spotKey], { decimals: a.decimals })}{a.unit ? <span className="st-sub"> {a.unit}</span> : null}</span>
              </div>
            )}
          </div>
        );
      })}
      {settings
        ? <p className="st-note">Een live update kan handmatige waarden overschrijven.</p>
        : (
          <div style={{ paddingTop: 12 }}>
            <button type="button" className="st-link" onClick={() => { app.navigate('/instellingen/koersen'); app.closeOverlay(); }}>
              Koersen handmatig aanpassen <Icon name="arrow-right" size={14} />
            </button>
          </div>
        )}
    </div>
  );
}

// ── Sections ──
function StWeergave({ app }) {
  const p = app.prefs;
  const opts = [
    { value: 'system', label: <><span className="st-theme-sw st-theme-sw--system" aria-hidden="true" />Systeem</>, testId: 'st-theme-system' },
    { value: 'light', label: <><span className="st-theme-sw st-theme-sw--light" aria-hidden="true" />Licht</>, testId: 'st-theme-light' },
    { value: 'dark', label: <><span className="st-theme-sw st-theme-sw--dark" aria-hidden="true" />Donker</>, testId: 'st-theme-dark' },
  ];
  return (
    <>
      <Card title="Thema">
        <div className="st-stack">
          <Segmented className="st-themes" options={opts} value={p.theme} onChange={v => app.setPrefs({ theme: v })} ariaLabel="Thema" full />
          <p className="st-note">Geldt alleen voor dit apparaat. Systeem volgt de licht/donker-instelling van je apparaat.</p>
        </div>
      </Card>
      <Card title="Weergave">
        <div className="st-switches">
          <Switch checked={!!p.cvd} onChange={v => app.setPrefs({ cvd: v })} label="Kleurenblind-veilig"
            description="Winst en verlies in blauw en oranje in plaats van groen en rood." />
          <Switch checked={!!p.privacy} onChange={v => app.setPrefs({ privacy: v })} label="Bedragen verbergen"
            description="Toont € ••••• in plaats van bedragen. Sneltoets H." />
          <Switch checked={!!p.startPrivate} onChange={v => app.setPrefs({ startPrivate: v })} label="Start in privémodus"
            description="Bedragen zijn verborgen telkens als je de app opent." />
        </div>
      </Card>
    </>
  );
}

function StOverzicht({ app }) {
  const widgets = app.state.widgets;
  return (
    <>
      <Card title="Modules op Overzicht" meta="Prestaties is altijd zichtbaar">
        <div className="st-switches">
          {OVERVIEW_MODULES.map(m => (
            <Switch key={m.id} checked={isModuleEnabled(widgets, m.id)} label={m.label}
              onChange={v => app.setWidgetEnabled(m.id, v)} />
          ))}
        </div>
      </Card>
      <Card title="Standaardperiode">
        <div className="st-stack">
          <Segmented options={PERIODS.map(x => ({ value: x.key, label: x.label }))} value={app.prefs.period}
            onChange={v => app.setPrefs({ period: v })} ariaLabel="Standaardperiode" full />
          <p className="st-note">De periode waarmee Overzicht en Posities openen op dit apparaat.</p>
        </div>
      </Card>
    </>
  );
}

function StMeesman({ app }) {
  const [inp, setInp] = React.useState('');
  const hist = app.spots?.meesmanNavHistory || [];
  const last = hist.length ? hist[hist.length - 1] : null;
  const parsed = parseNlNumber(inp);
  const hs = app.meesmanHistStatus || {};
  const save = () => {
    if (parsed > 0) { app.updateMeesmanNav(parsed); setInp(''); app.toast && app.toast('Meesman-koers opgeslagen'); }
  };
  return (
    <Card title="Meesman NAV" meta="Aandelen Wereldwijd Totaal">
      <div className="st-stack">
        <div className="st-meesman">
          <KpiCell label="Huidige koers" value={<span className="num">{fmtMoney(app.spots?.meesmanNavEur, { decimals: 4 })}</span>} />
          <KpiCell label="Datum" value={last ? fmtDateLong(last.date) : '—'} />
          <KpiCell label="Historie" value={<span className="num">{hist.length} punten</span>} />
        </div>
        <div className="st-inline">
          <Field label="Nieuwe koers" htmlFor="st-meesman-input" hint="Komma of punt als decimaalteken">
            <input id="st-meesman-input" className="input num" type="text" inputMode="decimal" data-testid="meesman-input"
              aria-describedby="st-meesman-input-hint"
              placeholder={stNumText(app.spots?.meesmanNavEur) || '100,40'} value={inp}
              onChange={e => setInp(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save(); } }} />
          </Field>
          <Button variant="primary" disabled={!(parsed > 0)} onClick={save}>
            {parsed > 0 ? 'Opslaan ' + fmtMoney(parsed, { decimals: 4 }) : 'Opslaan'}
          </Button>
        </div>
        <div className="st-row">
          <Button icon={hs.loading ? 'loader' : hs.done ? 'check' : 'download'} disabled={!!hs.loading} onClick={() => app.loadMeesmanHistory()}>
            {hs.loading ? 'Laden…' : hs.done ? '✓ 2 jaar historie geladen' : 'Laad 2 jaar historie (Yahoo Finance)'}
          </Button>
          {hs.error && <span className="st-status st-status--err">⚠ {hs.error}</span>}
        </div>
        <p className="st-note">Auto-ververs elke 30 sec · opslag dagelijks</p>
      </div>
    </Card>
  );
}

function StKoersen({ app }) {
  return (
    <>
      <Card title="Live koersen">
        <PriceRows app={app} variant="settings" />
      </Card>
      <StMeesman app={app} />
    </>
  );
}

// Self-custody wallet koppelen: alleen PUBLIEKE adressen (nooit herstelzin of private key).
function StWallet({ app }) {
  const model = app.model || {};
  const posts = (model.parties || []).filter(p => p.unit === 'post' && (p.selfCustody || p.id === 'wallet'));
  const leavesOf = id => ((model.leavesByPost || {})[id] || []);
  const rawParty = id => (model.allParties || []).find(p => p.id === id) || {};
  const initialAddrs = () => Object.fromEntries(posts.flatMap(p => leavesOf(p.id)).map(l => [l.id, rawParty(l.id).address || '']));
  const sig = posts.flatMap(p => leavesOf(p.id)).map(l => l.id + '=' + (rawParty(l.id).address || '')).join('|');
  const [addrs, setAddrs] = React.useState(initialAddrs);
  React.useEffect(() => { setAddrs(initialAddrs()); }, [sig]); // eslint-disable-line
  if (!posts.length) {
    return <Card title="Wallet"><EmptyState icon="wallet" title="Geen wallet-post" body="Voeg een crypto-post toe om een wallet te koppelen." /></Card>;
  }
  const allLeaves = posts.flatMap(p => leavesOf(p.id));
  const errs = Object.fromEntries(allLeaves.map(l => [l.id, validateChainAddress(l.coin, addrs[l.id])]));
  const changed = allLeaves.filter(l => (addrs[l.id] || '').trim() !== (rawParty(l.id).address || ''));
  const hasErr = allLeaves.some(l => errs[l.id]);
  const anyAddr = allLeaves.some(l => rawParty(l.id).address);
  const save = () => {
    if (hasErr || !changed.length) return;
    const changes = Object.fromEntries(changed.map(l => [l.id, (addrs[l.id] || '').trim()]));
    app.setSyncedState(st => {
      const tomb = st.deletedPartyIds || {};
      const list = migrateCryptoPosts((Array.isArray(st.parties) && st.parties.length) ? st.parties : [...PARTIES], tomb);
      const stamp = new Date().toISOString();
      return { ...st, parties: list.map(p => {
        if (!(p.id in changes)) return p;
        const n = { ...p, updatedAt: stamp };
        if (changes[p.id]) n.address = changes[p.id]; else delete n.address;
        return n;
      }) };
    });
    app.toast && app.toast('Wallet-adressen opgeslagen');
  };
  const cb = app.chainBalances || {};
  return (
    <>
      {posts.map(post => (
        <Card key={post.id} title={`${post.name} koppelen`} meta="Alleen-lezen">
          <div className="st-stack">
            <p className="st-note">Vul alleen je <b>publieke</b> ontvangstadressen in (Coinbase Wallet → Ontvangen). Deel nooit je herstelzin (seed phrase) of private key: die heeft deze app niet nodig. Saldi komen van mempool.space (BTC) en een publieke Ethereum-node (ETH, alleen mainnet).</p>
            {leavesOf(post.id).map(l => {
              const meta = CRYPTO_COIN_BY_KEY[l.coin] || {};
              const saved = rawParty(l.id).address || '';
              const st = saved ? cb[l.id] : null;
              const sm = (model.byId || {})[l.id];
              const diff = sm && sm.bookedQuantity != null ? (+sm.quantity || 0) - (+sm.bookedQuantity || 0) : 0;
              const id = 'st-addr-' + l.id;
              return (
                <div className="st-wcoin" key={l.id}>
                  <Field label={`${meta.label || l.coin}-adres (${l.coin})`} htmlFor={id} error={errs[l.id]}>
                    <Input id={id} className="st-addr" value={addrs[l.id] || ''} spellCheck={false} autoComplete="off" autoCapitalize="off"
                      placeholder={l.coin === 'BTC' ? 'bc1q…' : '0x…'} data-testid={id}
                      onChange={e => { const v = e.target.value; setAddrs(a => ({ ...a, [l.id]: v })); }} />
                  </Field>
                  {saved && (
                    <div className="st-wline" aria-live="polite">
                      {st && st.checkedAt
                        ? <span>Saldo <b>{fmtQty(+st.qty || 0, l.coin, { decimals: 8 })}</b> · gecontroleerd {fmtRelDay(st.checkedAt.slice(0, 10))} {fmtTime(st.checkedAt)}</span>
                        : <span>{app.chainLoading ? 'Saldo ophalen…' : 'Nog geen saldo opgehaald'}</span>}
                      {st && st.error && <span className="st-status st-status--err">⚠ {st.error}</span>}
                      {sm && sm.bookedQuantity != null && Math.abs(diff) > 1e-9 && (
                        <span className="st-status st-status--err">Verschil met boekingen {diff > 0 ? '+' : '−'}{fmtQty(Math.abs(diff), l.coin, { decimals: 8 })}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="st-row">
              <Button variant="primary" icon="check" disabled={hasErr || !changed.length} onClick={save} data-testid="st-wallet-save">Opslaan</Button>
              <Button icon={app.chainLoading ? 'loader' : 'refresh-cw'} disabled={!anyAddr || !!app.chainLoading}
                onClick={() => app.refreshChain && app.refreshChain({ force: true })}>Saldo nu ophalen</Button>
            </div>
            <p className="st-note">Het on-chain saldo is leidend voor het aantal coins in {post.name}; de kostprijs komt uit je boekingen (koop en overboekingen). Bij een verschil zie je een melding. Saldi worden elke 5 minuten en bij handmatig verversen van de koersen opnieuw opgehaald.</p>
          </div>
        </Card>
      ))}
    </>
  );
}

function StSync({ app }) {
  const [showKey, setShowKey] = React.useState(false);
  const s = app.syncStatus || {};
  const cfg = app.supabaseConfig || {};
  let status;
  if (!app.sbOk) status = <span className="st-status"><StatusDot status="off" />Niet gekoppeld</span>;
  else if (s.loading) status = <span className="st-status"><StatusDot status="busy" />Bezig met synchroniseren…</span>;
  else if (s.error) status = <span className="st-status st-status--err">⚠ {s.error}</span>;
  else if (s.syncedAt) status = <span className="st-status st-status--ok">✓ Gesynchroniseerd {fmtTime(s.syncedAt)}</span>;
  else status = <span className="st-status"><StatusDot status="off" />Nog niet gesynchroniseerd</span>;
  return (
    <>
      <Card title="Status">
        <div className="st-stack" aria-live="polite">
          {status}
          <div className="st-row">
            <Button variant="primary" icon="refresh-cw" disabled={!app.sbOk || !!s.loading} onClick={() => app.syncNow()}>Nu synchroniseren</Button>
            <Button icon="download" disabled={!app.sbOk || !!s.loading} onClick={() => app.pullNow()}>Alles opnieuw ophalen</Button>
          </div>
          <p className="st-note">Wijzigingen worden automatisch opgeslagen en elke 8 seconden opgehaald zolang de app open is.</p>
        </div>
      </Card>
      <Card title="Supabase-project">
        <div className="st-stack">
          <Field label="Project URL" htmlFor="st-sb-url">
            <Input id="st-sb-url" value={cfg.url || ''} placeholder="https://abcdefgh.supabase.co" autoComplete="off" spellCheck={false}
              onChange={e => { const url = e.target.value; app.setSupabaseConfig(c => ({ ...c, url })); }} />
          </Field>
          <Field label="Anon key" htmlFor="st-sb-key" hint="opgeslagen lokaal">
            <div className="st-key">
              <Input id="st-sb-key" type={showKey ? 'text' : 'password'} value={cfg.anonKey || ''} placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                autoComplete="off" spellCheck={false} aria-describedby="st-sb-key-hint"
                onChange={e => { const anonKey = e.target.value; app.setSupabaseConfig(c => ({ ...c, anonKey })); }} />
              <IconButton icon={showKey ? 'eye-off' : 'eye'} label={showKey ? 'Key verbergen' : 'Key tonen'} size="sm"
                pressed={showKey} onClick={() => setShowKey(v => !v)} />
            </div>
          </Field>
          <details className="st-details" open={!app.sbOk}>
            <summary>Setup-hulp</summary>
            <p>Maak een gratis project aan op <b>supabase.com</b>. Voer de volgende SQL uit in de <b>SQL Editor</b> van je project:</p>
            <pre className="st-pre">{ST_SQL}</pre>
            <p>Kopieer dan je <b>Project URL</b> en <b>anon public key</b> uit <b>Project Settings → API</b>. Voor de tabellen met transacties en koershistorie: zie de bestanden <code>supabase-*.sql</code> in de repository.</p>
          </details>
        </div>
      </Card>
    </>
  );
}

function StT212({ app }) {
  const ts = app.t212Status || {};
  const mode = app.tweaks?.t212Mode || 'live';
  return (
    <Card title="Trading 212">
      <div className="st-stack">
        <div className="st-row st-row--between">
          <span className="st-label">Modus</span>
          <Segmented options={[{ value: 'live', label: 'Live' }, { value: 'demo', label: 'Paper' }]} value={mode}
            onChange={v => app.updateTweaks(tw => ({ ...tw, t212Mode: v }))} ariaLabel="Trading 212-modus" />
        </div>
        <div className="st-row">
          <Button variant="primary" icon={ts.loading ? 'loader' : 'download'} disabled={!app.sbOk || !!ts.loading} onClick={() => app.importT212()}>
            {ts.loading ? 'Bezig… (kan even duren)' : 'Importeer stortingen + waarde'}
          </Button>
          {!app.sbOk && <span className="st-sub">Koppel eerst Supabase.</span>}
        </div>
        {(ts.error || ts.done) && (
          <div className={'st-status ' + (ts.error ? 'st-status--err' : 'st-status--ok')} aria-live="polite">
            {ts.error ? '⚠ ' + ts.error : `✓ ${ts.imported} nieuwe storting(en) + waarde bijgewerkt${ts.note || ''}`}
          </div>
        )}
        <p className="st-note">Importeert je stortingen, opnames en huidige accountwaarde via de beveiligde Supabase-proxy. Je API-key staat veilig als secret in Supabase (niet hier). Duplicaten worden overgeslagen.</p>
        <button type="button" className="st-link" onClick={() => app.navigate('/transacties?partij=trading212')}>
          Bekijk Trading 212-transacties <Icon name="arrow-right" size={14} />
        </button>
      </div>
    </Card>
  );
}

function StPartijen({ app }) {
  const summaries = app.model?.summaries || [];
  const closedIds = new Set((app.model?.closed || []).map(x => x.party.id));
  return (
    <Card title="Partijen" meta={`${summaries.length} partijen`}
      actions={<Button size="sm" icon="plus" data-testid="st-add-party" onClick={() => app.openPartyForm(null)}>Partij toevoegen</Button>}>
      {summaries.length === 0
        ? <EmptyState icon="layers" title="Nog geen partijen" action={{ label: '+ Partij toevoegen', onClick: () => app.openPartyForm(null) }} />
        : (
          <div className="st-parties">
            {summaries.map(s => {
              const p = s.party;
              const txCount = (s.transactions || []).length;
              const notTotal = (p.includeInTotal ?? p.includeInPortfolio) === false;
              const notChart = (p.includeInTimeChart ?? p.includeInPortfolio) === false;
              const closed = closedIds.has(p.id);
              return (
                <ListRow key={p.id} chevron onClick={() => app.openPartyForm(p)} testId={'st-party-' + p.id}
                  leading={<Monogram party={p} size={32} closed={closed} />}
                  title={<>{p.name}
                    {(notTotal || notChart || closed) && (
                      <span className="st-badges">
                        {closed && <Pill tone="outline">Gesloten</Pill>}
                        {notTotal && <Pill tone="outline">Niet in totaal</Pill>}
                        {notChart && <Pill tone="outline">Niet in grafiek</Pill>}
                      </span>
                    )}</>}
                  subtitle={`${p.category || 'Partij'} · ${txCount} ${txCount === 1 ? 'transactie' : 'transacties'}`} />
              );
            })}
          </div>
        )}
    </Card>
  );
}

function StGegevens({ app }) {
  const fileRef = React.useRef(null);
  const msg = app.importMsg;
  return (
    <Card title="Gegevens">
      <div className="st-stack">
        <div className="st-row">
          <Button icon="download" onClick={() => app.exportData()}>Exporteren als JSON</Button>
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files && e.target.files[0]; if (f) app.importData(f); e.target.value = ''; }} />
          <Button icon="upload" onClick={() => fileRef.current && fileRef.current.click()}>Importeren uit JSON</Button>
        </div>
        {msg && (
          <div className={'st-status ' + (msg.ok ? 'st-status--ok' : 'st-status--err')} aria-live="polite">
            {msg.ok ? '✓ ' : '⚠ '}{msg.text}
          </div>
        )}
        <p className="st-note">Je gegevens staan in Supabase en worden in deze browser bewaard als cache. Deze export is een reservekopie of voor overdracht.</p>
      </div>
    </Card>
  );
}

function StGevarenzone({ app }) {
  const t212Count = (app.state.transactions || []).filter(t => t.party === 'trading212').length;
  return (
    <Card title="Gevarenzone" className="st-danger">
      <div className="st-stack">
        <div className="st-danger__row">
          <div className="st-danger__text">
            <div className="st-label">Alle Trading 212-transacties verwijderen</div>
            <div className="st-sub">{t212Count} {t212Count === 1 ? 'transactie' : 'transacties'} van Trading 212. Je kunt ze daarna opnieuw importeren.</div>
          </div>
          <Button variant="danger" icon="trash-2" disabled={t212Count === 0} onClick={() => app.deleteT212Txs()}>Verwijderen</Button>
        </div>
        <div className="st-danger__row">
          <div className="st-danger__text">
            <div className="st-label">Terug naar begindata</div>
            <div className="st-sub">Wist alle transacties in deze browser en zet de seed data terug.</div>
          </div>
          <Button variant="danger" icon="refresh-cw" onClick={() => app.resetData()}>Terugzetten</Button>
        </div>
      </div>
    </Card>
  );
}

function StOver({ app }) {
  return (
    <>
      <Card title="Investeringen">
        <p className="st-note" style={{ color: 'var(--fg-muted)' }}>Investeringen · redesign 2026-10</p>
      </Card>
      <Card title="Hoe berekenen we rendement?">
        <ul className="st-explain">
          <li><b>Totale winst</b> = huidige waarde − netto ingelegd. Netto ingelegd is wat je er per saldo in hebt gestoken: aankopen en stortingen min opbrengsten van verkopen en opnames.</li>
          <li><b>Winst excl. stortingen (periode)</b> = waardeverandering in de periode min wat je in die periode netto hebt ingelegd. Een storting is dus nooit winst.</li>
          <li><b>Het percentage</b> is geldgewogen (Modified Dietz): de winst gedeeld door de beginwaarde plus je stortingen, gewogen naar hoe lang ze in de periode meededen.</li>
          <li><b>Tijdgewogen</b> rekent stortingen helemaal weg en laat zien hoe je beleggingen zelf presteerden.</li>
          <li><b>Rendement p.j.</b> is je geldgewogen jaarrendement over alle stortingen en opnames sinds de start.</li>
          <li><b>Winst per positie</b> telt gerealiseerde winst op verkopen mee; opgeteld is dat gelijk aan je totale winst.</li>
        </ul>
      </Card>
      {!app.isMobile && (
        <Card title="Sneltoetsen">
          <table className="st-keys">
            <tbody>
              {ST_SHORTCUTS.map(([k, d]) => (
                <tr key={k}><td><Kbd>{k}</Kbd></td><td>{d}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

function StSectionBody({ app, section }) {
  switch (section) {
    case 'overzicht': return <StOverzicht app={app} />;
    case 'koersen': return <StKoersen app={app} />;
    case 'wallet': return <StWallet app={app} />;
    case 'sync': return <StSync app={app} />;
    case 't212': return <StT212 app={app} />;
    case 'partijen': return <StPartijen app={app} />;
    case 'gegevens': return <StGegevens app={app} />;
    case 'gevarenzone': return <StGevarenzone app={app} />;
    case 'over': return <StOver app={app} />;
    default: return <StWeergave app={app} />;
  }
}

function InstellingenScreen({ app }) {
  const section = app.route?.params?.section || null;
  const byKey = k => ST_SECTIONS.find(s => s.key === k);

  if (app.isMobile) {
    if (!section) {
      return (
        <div className="st-mlist">
          {ST_GROUPS.map((g, gi) => (
            <div key={gi} className="st-mgroup">
              {g.map(k => {
                const s = byKey(k);
                return (
                  <ListRow key={k} chevron testId={'settings-section-' + k} onClick={() => app.navigate('/instellingen/' + k)}
                    leading={<span className={'st-mgroup__icon' + (k === 'gevarenzone' ? ' st-mgroup__icon--warn' : '')}><Icon name={s.icon} size={16} /></span>}
                    title={s.label} subtitle={s.desc} />
                );
              })}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="st-mpage">
        <StSectionBody app={app} section={section} />
      </div>
    );
  }

  const active = section && byKey(section) ? section : 'weergave';
  const cur = byKey(active);
  return (
    <div className="st-page">
      <nav className="st-nav" aria-label="Instellingen">
        {ST_SECTIONS.map(s => (
          <button key={s.key} type="button" className={'st-nav__item' + (s.key === 'gevarenzone' ? ' st-nav__item--warn' : '')}
            aria-current={s.key === active ? 'page' : undefined} data-testid={'settings-section-' + s.key}
            onClick={() => app.navigate('/instellingen/' + s.key, { replace: true })}>
            <Icon name={s.icon} size={16} />{s.label}
          </button>
        ))}
      </nav>
      <div className="st-main">
        <h2 className="st-h">{cur.label}</h2>
        <p className="st-lead">{cur.desc}</p>
        <StSectionBody app={app} section={active} />
      </div>
    </div>
  );
}

Object.assign(window, { InstellingenScreen, PriceRows });
