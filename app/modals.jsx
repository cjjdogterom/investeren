// Overlays (S4): TransactionSheet (add / edit) and TxDetailSheet.

injectStyles('modals', `
.md-lead { margin: 0 0 12px; color: var(--fg-muted); font-size: 14px; }
.md-types { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.md-type { display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--r-2);
  background: var(--surface); color: var(--fg); font: inherit; text-align: left; cursor: pointer; transition: background var(--d-1) var(--ease), border-color var(--d-1) var(--ease); }
.md-type:hover { background: var(--surface-2); border-color: var(--border-strong); }
.md-type[aria-disabled="true"] { opacity: .4; cursor: not-allowed; }
.md-type__icon { width: 36px; height: 36px; border-radius: var(--r-2); background: var(--surface-2); display: grid; place-items: center; flex-shrink: 0; color: var(--fg); }
.md-type__label { font-weight: 600; font-size: 14px; display: block; }
.md-type__hint { color: var(--fg-muted); font-size: 12.5px; display: block; }
.md-form { display: grid; gap: 16px; }
.md-row2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.md-typebar { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--r-2); background: var(--surface-2); }
.md-typebar__label { font-weight: 600; font-size: 14px; }
.md-typebar__hint { color: var(--fg-muted); font-size: 13px; flex: 1; }
.md-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.md-note { font-size: 12.5px; color: var(--warn); display: flex; align-items: center; gap: 6px; }
.md-live { font-size: 13px; color: var(--fg-muted); background: var(--surface-2); border-radius: var(--r-2); padding: 8px 12px; }
.md-live b { color: var(--fg); font-weight: 600; }
.md-live .md-gain { color: var(--gain); }
.md-fee { display: flex; gap: 8px; align-items: flex-start; }
.md-fee .money-input, .md-fee > div:last-child { flex: 1; }
.md-feeconv { font-size: 12.5px; color: var(--fg-muted); margin-top: 6px; }
.md-addlink { background: none; border: 0; padding: 0; color: var(--fg-muted); font: 500 13px var(--font); cursor: pointer; display: inline-flex; gap: 6px; align-items: center; }
.md-addlink:hover { color: var(--fg); }
.md-foot { display: flex; align-items: center; gap: 8px; width: 100%; }
.md-cfd { display: flex; flex-direction: column; gap: 14px; }
.md-cfd__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.md-cfd .md-foot { position: sticky; bottom: 0; background: var(--surface); padding: 10px 0 2px; }
.md-foot__reason { flex: 1; font-size: 12.5px; color: var(--fg-subtle); min-width: 0; }
.md-dl { display: grid; grid-template-columns: max-content 1fr; gap: 10px 16px; margin: 0; font-size: 14px; }
.md-dl dt { color: var(--fg-muted); }
.md-dl dd { margin: 0; text-align: right; min-width: 0; overflow-wrap: anywhere; }
.md-dl dd.md-dl__note { text-align: left; white-space: pre-wrap; }
.md-detail-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
.md-detail-amt { font-size: 28px; font-weight: 650; letter-spacing: -0.02em; }
.md-detail-amt.is-income { color: var(--gain); }
.md-detail-amt.is-muted { color: var(--fg-muted); }
.md-party { display: inline-flex; align-items: center; gap: 8px; justify-content: flex-end; }
.md-stock { display: grid; gap: 8px; }
.md-stock__list { display: grid; border: 1px solid var(--border); border-radius: var(--r-2); overflow: hidden; }
.md-stock__opt { display: grid; grid-template-columns: minmax(72px, max-content) 1fr auto; gap: 10px; align-items: baseline; padding: 9px 12px;
  border: 0; border-top: 1px solid var(--border); background: var(--surface); color: var(--fg); font: inherit; text-align: left; cursor: pointer; }
.md-stock__opt:first-child { border-top: 0; }
.md-stock__opt:hover, .md-stock__opt:focus-visible { background: var(--surface-2); }
.md-stock__sym { font-weight: 650; font-size: 13.5px; font-variant-numeric: tabular-nums; }
.md-stock__name { font-size: 13.5px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.md-stock__ex { font-size: 12px; color: var(--fg-muted); white-space: nowrap; }
.md-stock__sel { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--r-2); background: var(--surface-2); }
.md-stock__sel > div { flex: 1; min-width: 0; }
.md-stock__meta { font-size: 12.5px; color: var(--fg-muted); }
.md-stock__msg { font-size: 12.5px; color: var(--fg-muted); }
@media (max-width: 767.98px) {
  .md-type { min-height: 72px; }
  .md-dl { font-size: 15px; }
}
`);

const MD_FORM_KEYS = ['party', 'type', 'date', 'amountEur', 'quantity', 'unitPriceEur', 'valueEur', 'feeEur', 'metalType', 'silverUnit', 'goldUnit', 'instrument', 'note', 'toParty', 'feeQty'];
const MD_TILE_ORDER = ['inleg', 'koop', 'verkoop', 'opname', 'dividend', 'rente', 'waardering', 'kosten', 'overboeking', 'cashback'];
const MD_SHORT = { cashback: 'Cashback', rente: 'Rente', kosten: 'Kosten' };
const MD_METAL_TYPES = ['koop', 'verkoop', 'waardering', 'dividend', 'opname'];
const MD_INSTR_TYPES = ['koop', 'verkoop', 'cashback', 'dividend'];
const MD_FEE_TYPES = ['koop', 'verkoop', 'cashback'];

function mdShortLabel(type) { return MD_SHORT[type] || TX_LABELS[type] || type; }
function mdIsMixed(p) { return !!(p && (p.isMixed || p.unit === 'mixed')); }
function mdUnitBased(p) { return !!p && (mdIsMixed(p) || ['part', 'crypto', 'gram', 'ounce'].includes(p.unit)); }

// Number → editable nl-NL string (no grouping), '' for empty.
function mdNum(v) {
  if (v === '' || v == null) return '';
  const n = +v;
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat('nl-NL', { useGrouping: false, maximumFractionDigits: 8 }).format(n);
}

function mdNeeds(type, party, divMode) {
  const unit = party ? party.unit : null;
  if (type === 'dividend') return divMode === 'acc' ? ['quantity', 'unitPriceEur'] : ['amountEur'];
  if (party && party.id === STOCK_PARTY_ID && type === 'cashback') return ['amountEur'];
  switch (type) {
    case 'inleg': case 'rente': case 'kosten': return ['amountEur'];
    case 'opname': return mdUnitBased(party) ? ['quantity'] : ['amountEur'];
    case 'koop': case 'verkoop': case 'cashback': case 'dividend': return ['quantity', 'unitPriceEur'];
    case 'overboeking': return ['quantity'];
    case 'waardering':
      if (unit === 'bundle') return ['valueEur'];
      if (mdIsMixed(party) || unit === 'gram' || unit === 'ounce') return ['quantity'];
      if (unit === 'part' || unit === 'crypto') return ['unitPriceEur'];
      return ['valueEur'];
    default: return [];
  }
}

function mdFormUnitLabel(form, party) {
  if (!party) return 'stuks';
  if (mdIsMixed(party)) {
    return form.metalType === 'zilver' ? (form.silverUnit === 'gram' ? 'gram' : 'ounce') : (form.goldUnit === 'ounce' ? 'ounce' : 'gram');
  }
  if (party.unit === 'gram') return 'gram';
  if (party.unit === 'ounce') return 'ounce';
  if (party.unit === 'crypto') return party.unitLabel || 'stuks';
  if (party.unit === 'part') return party.unitLabel || 'stuks';
  return 'stuks';
}

function mdBlank(initial, preset, today, allParties) {
  const i = initial || {};
  const p = preset || {};
  // Sub-holding (finst-btc) → post (finst) + coin (BTC) in het formulier.
  const all = allParties || [];
  const leafOf = id => all.find(x => x && x.id === id && x.postId) || null;
  const leaf = leafOf(i.party || p.party);
  const toLeaf = leafOf(i.toParty);
  const f = {
    party: leaf ? leaf.postId : (i.party || p.party || ''),
    coin: (leaf && leaf.coin) || p.coin || 'BTC',
    toPost: toLeaf ? toLeaf.postId : '',
    feeQty: mdNum(i.feeQty),
    type: i.type || p.type || '',
    divMode: i.type === 'dividend' ? (+i.quantity > 0 ? 'acc' : 'dist') : ((p.party || i.party) === 'meesman' ? 'acc' : 'dist'),
    date: i.date || today,
    amountEur: mdNum(i.amountEur),
    quantity: mdNum(i.quantity),
    unitPriceEur: mdNum(i.unitPriceEur),
    orderValueEur: mdNum(i.amountEur),
    valueEur: mdNum(i.valueEur),
    optAmount: mdNum(i.amountEur),
    metalType: i.metalType || 'goud',
    silverUnit: i.silverUnit || 'gram',
    goldUnit: i.goldUnit || 'gram',
    instrument: i.instrument || '',
    feeMode: 'eur',
    feeEur: mdNum(i.feeEur),
    note: i.note || '',
  };
  if (initial && ['koop', 'verkoop', 'cashback', 'dividend'].includes(i.type)
      && +i.quantity > 0 && +i.amountEur > 0 && !(+i.unitPriceEur > 0)) {
    f.unitPriceEur = mdNum(+(+i.amountEur / +i.quantity).toFixed(6));
  }
  return f;
}

function mdTypeIcon(type) { return (TX_TYPE_META[type] && TX_TYPE_META[type].icon) || 'circle-plus'; }

// Aandeel/ETF zoeken (Yahoo Finance via de koersen-worker). Kiezen zet het Yahoo-symbool in het formulier.
function MdStockPicker({ id, value, name, recent, onPick, error }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState({ loading: false, error: null, items: [] });
  const [editing, setEditing] = useState(!value);
  useEffect(() => { setEditing(!value); }, [value]);
  useEffect(() => {
    const term = q.trim();
    if (!term) { setRes({ loading: false, error: null, items: [] }); return; }
    let alive = true;
    setRes(r => ({ ...r, loading: true, error: null }));
    const t = setTimeout(() => {
      searchStocks(term)
        .then(items => { if (alive) setRes({ loading: false, error: null, items }); })
        .catch(e => { if (alive) setRes({ loading: false, error: (e && e.message) || 'Zoeken mislukt', items: [] }); });
    }, 300);
    return () => { alive = false; clearTimeout(t); };
  }, [q]);

  if (value && !editing) {
    return (
      <div className="md-stock__sel">
        <div>
          <div className="md-stock__sym">{value}</div>
          {name && name !== value && <div className="md-stock__meta">{name}</div>}
        </div>
        <Button size="sm" variant="ghost" onClick={() => { setQ(''); setEditing(true); }}>Wijzig</Button>
      </div>
    );
  }
  const pick = item => { onPick(item); setQ(''); setEditing(false); };
  return (
    <div className="md-stock">
      {recent.length > 0 && !q && (
        <div className="md-chips" style={{ marginBottom: 0 }}>
          {recent.map(r => <Chip key={r.symbol} active={value === r.symbol} onClick={() => pick(r)}>{r.symbol}</Chip>)}
        </div>
      )}
      <Input id={id} type="search" value={q} autoComplete="off" placeholder="Zoek op naam of ticker, bijv. Apple of VWCE"
        aria-invalid={error ? true : undefined} onChange={e => setQ(e.target.value)} />
      {res.loading && <div className="md-stock__msg" role="status">Zoeken…</div>}
      {res.error && <div className="md-note" role="alert"><Icon name="info" size={14} />{res.error}</div>}
      {!res.loading && !res.error && q.trim() && !res.items.length && <div className="md-stock__msg">Niets gevonden voor “{q.trim()}”.</div>}
      {res.items.length > 0 && (
        <div className="md-stock__list" role="listbox" aria-label="Zoekresultaten">
          {res.items.map(it => (
            <button key={it.symbol} type="button" role="option" aria-selected={value === it.symbol} className="md-stock__opt" onClick={() => pick(it)}>
              <span className="md-stock__sym">{it.symbol}</span>
              <span className="md-stock__name">{it.name}</span>
              <span className="md-stock__ex">{[it.exchange, it.type].filter(Boolean).join(' · ')}</span>
            </button>
          ))}
        </div>
      )}
      {value && <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Houd {value}</Button>}
    </div>
  );
}

// CFD openen/sluiten op de CFD-rekening (Trading 212 CFD): hefboom → margin, cash = accountwaarde − margin.
const MD_CFD_LEVERAGE = [[50, '1:2 · 50%'], [20, '1:5 · 20%'], [10, '1:10 · 10%'], [5, '1:20 · 5%'], [3.33, '1:30 · 3,33%']];
function MdCfdTrade({ app, party, type, onDone, positionId = null }) {
  const ticks = useCfdTicks();
  const quotes = app.stockQuotes || {};
  const cfd = cfdNormalize(party.cfd) || { accountValue: 0, cash: 0, margin: 0, health: null, positions: [], trades: [] };
  const live = cfdLive(cfd, quotes, ticks) || cfd;
  const open = type === 'koop';
  const [f, setF] = useState(() => ({ date: todayIsoLocal(), symbol: '', name: '', dir: 'buy', quantity: '', price: '', currency: 'USD', rate: '20', fee: '',
    positionId: (positionId && cfd.positions.some(x => x.id === positionId) ? positionId : (cfd.positions[0] || {}).id) || '', realized: '', accountAfter: '', note: '' }));
  const set = patch => setF(x => ({ ...x, ...patch }));
  const [q, setQ] = useState(null);
  const sym = open ? f.symbol : ((live.positions.find(x => x.id === f.positionId) || {}).symbol || '');
  useEffect(() => {
    if (!sym) { setQ(null); return undefined; }
    let alive = true;
    fetch(`${STOCK_API_URL}/koers?s=${encodeURIComponent(sym)}&range=5d`).then(r => r.json())
      .then(j => { const qq = j && j.quotes && j.quotes[sym]; if (alive && qq) { setQ(qq); if (open) setF(x => ({ ...x, currency: String(qq.currency || x.currency).toUpperCase(), name: x.name || qq.name })); } })
      .catch(() => {});
    return () => { alive = false; };
  }, [sym]); // eslint-disable-line
  const tk = sym ? ticks[sym] : null;
  const livePx = tk && tk.price > 0 ? tk.price : (q && q.price) || null;
  const ccy = open ? f.currency : ((live.positions.find(x => x.id === f.positionId) || {}).currency || 'USD');
  const fx = ccy === 'EUR' ? 1 : (ticks[`EUR${ccy}=X`] && ticks[`EUR${ccy}=X`].price > 0 ? 1 / ticks[`EUR${ccy}=X`].price : (q && q.price > 0 && q.priceEur > 0 ? q.priceEur / q.price : null));
  const num = v => cfdNum(v);
  const qty = num(f.quantity), price = num(f.price) != null ? num(f.price) : livePx, rate = num(f.rate), fee = num(f.fee) || 0;
  const pmFmt = v => (v == null ? '—' : fmtMoney(v, { decimals: 2 }));
  const pxFmt = v => (v == null ? '—' : `${ccy === 'USD' ? '$' : ccy === 'EUR' ? '€' : ccy === 'GBP' ? '£' : ''}${new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(v)}${['USD', 'EUR', 'GBP'].includes(ccy) ? '' : ' ' + ccy}`);

  // Sluiten: gekozen positie (live), standaard alles, gerealiseerd resultaat volgt uit de sluitkoers.
  const pos = !open ? live.positions.find(x => x.id === f.positionId) || null : null;
  const cQty = !open ? (qty != null ? qty : pos && pos.quantity) : null;
  const autoRealized = pos && cQty > 0 && price != null && fx != null && pos.pnl != null && pos.currentPrice != null
    ? (pos.pnl * cQty / pos.quantity) + cQty * (pos.dir === 'sell' ? -1 : 1) * (price - pos.currentPrice) * fx : null;
  const realized = num(f.realized) != null ? num(f.realized) : autoRealized;

  const notional = open && qty > 0 && price > 0 && fx ? qty * price * fx : null;
  const req = notional != null && rate > 0 ? notional * rate / 100 : null;
  const valid = open
    ? !!(f.symbol && qty > 0 && price > 0 && fx && rate > 0 && /^\d{4}-\d{2}-\d{2}$/.test(f.date))
    : !!(pos && cQty > 0 && cQty <= pos.quantity + 1e-9 && price > 0 && realized != null && Number.isFinite(realized));
  const short = open && req != null && live.cash != null && req + fee > live.cash + 0.005;
  const canSubmit = valid && !short;

  const submit = () => {
    if (!canSubmit) return;
    const r = open
      ? cfdOpenTrade(cfd, quotes, ticks, { date: f.date, symbol: f.symbol, name: f.name || f.symbol, dir: f.dir, quantity: qty, price, currency: ccy, fx, marginRate: rate, fee })
      : cfdCloseTrade(cfd, quotes, ticks, { date: f.date, positionId: pos.id, quantity: cQty, price, fx, realized, fee });
    if (!r) return;
    // Echte accountwaarde uit Trading 212 na het sluiten: die is leidend; cash = accountwaarde − resterende margin.
    const accAfter = !open ? num(f.accountAfter) : null;
    if (accAfter != null) { r.cfd.accountValue = accAfter; r.cfd.cash = accAfter - (r.cfd.margin || 0); }
    if (f.note.trim()) r.cfd.trades[r.cfd.trades.length - 1].note = f.note.trim();
    app.saveParty({ ...party, cfd: r.cfd });
    const same = ((app.state && app.state.transactions) || []).find(t => t.party === party.id && t.type === 'waardering' && t.date === f.date);
    app.saveTx({ ...(same || { id: makeId(), party: party.id, type: 'waardering', date: f.date }), valueEur: +r.cfd.accountValue.toFixed(2),
      note: open ? `CFD geopend: ${f.dir === 'sell' ? 'short' : 'long'} ${f.quantity} ${f.symbol} à ${pxFmt(price)} (${rate}% margin)` : `CFD gesloten: ${cQty} ${pos.symbol} à ${pxFmt(price)}, resultaat ${fmtMoney(realized, { sign: true, decimals: 2 })}` });
    onDone && onDone();
  };

  return (
    <div className="md-cfd" data-testid="cfd-trade">
      <div className="md-live">CFD-rekening nu: accountwaarde <b className="num">{pmFmt(live.accountValue)}</b> · cash <b className="num">{pmFmt(live.cash)}</b> · margin <b className="num">{pmFmt(live.margin)}</b></div>
      <Field label="Datum" htmlFor="md-cfd-date"><Input id="md-cfd-date" type="date" value={f.date} onChange={e => set({ date: e.target.value })} /></Field>
      {open ? (<>
        <Field label="Product" htmlFor="md-cfd-sym">
          <MdStockPicker id="md-cfd-sym" value={f.symbol} name={f.name} recent={[]} onPick={it => set({ symbol: it.symbol, name: it.name || it.symbol, price: '' })} />
        </Field>
        <Field label="Richting">
          <Segmented ariaLabel="Richting" full value={f.dir} onChange={v => set({ dir: v })} options={[{ value: 'buy', label: 'Long (buy)' }, { value: 'sell', label: 'Short (sell)' }]} />
        </Field>
        <div className="md-cfd__grid">
          <Field label="Aantal" htmlFor="md-cfd-qty"><Input id="md-cfd-qty" inputMode="decimal" value={f.quantity} placeholder="9,9602" onChange={e => set({ quantity: e.target.value })} /></Field>
          <Field label={`Openingskoers (${ccy})`} htmlFor="md-cfd-px" hint={livePx ? `Nu ${pxFmt(livePx)}` : null}>
            <Input id="md-cfd-px" inputMode="decimal" value={f.price} placeholder={livePx ? String(livePx).replace('.', ',') : ''} onChange={e => set({ price: e.target.value })} /></Field>
          <Field label="Hefboom / margin" htmlFor="md-cfd-rate">
            <Select id="md-cfd-rate" value={MD_CFD_LEVERAGE.some(([v]) => String(v) === f.rate) ? f.rate : 'eigen'} onChange={e => set({ rate: e.target.value === 'eigen' ? '' : e.target.value })}>
              {MD_CFD_LEVERAGE.map(([v, l]) => <option key={v} value={String(v)}>{l}</option>)}
              <option value="eigen">Eigen percentage…</option>
            </Select></Field>
          {!MD_CFD_LEVERAGE.some(([v]) => String(v) === f.rate) && (
            <Field label="Margin (%)" htmlFor="md-cfd-rate2"><Input id="md-cfd-rate2" inputMode="decimal" value={f.rate} placeholder="20" onChange={e => set({ rate: e.target.value })} /></Field>)}
          <Field label="Kosten (€, optioneel)" htmlFor="md-cfd-fee"><Input id="md-cfd-fee" inputMode="decimal" value={f.fee} placeholder="0" onChange={e => set({ fee: e.target.value })} /></Field>
        </div>
        <div className="md-live" aria-live="polite">
          Positiewaarde <b className="num">{pmFmt(notional)}</b> · benodigde margin <b className="num">{pmFmt(req)}</b>
          {req != null && live.cash != null && <> · cash daarna <b className="num" style={short ? { color: 'var(--negative)' } : undefined}>{pmFmt(live.cash - req - fee)}</b></>}
          {fx && ccy !== 'EUR' ? <> · koers {ccy}→EUR {new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 4 }).format(fx)}</> : null}
          {short && <div style={{ color: 'var(--negative)', marginTop: 4 }}>Niet genoeg cash voor deze margin. Boek eerst een inleg op Trading 212 CFD of kies minder stuks of een hogere hefboom.</div>}
        </div>
      </>) : (<>
        {live.positions.length ? (
          <Field label="Positie" htmlFor="md-cfd-pos">
            <Select id="md-cfd-pos" value={f.positionId} onChange={e => set({ positionId: e.target.value, quantity: '', price: '', realized: '' })}>
              {live.positions.map(x => <option key={x.id} value={x.id}>{x.name} · {x.dir === 'sell' ? 'short' : 'long'} · {x.quantity} st.</option>)}
            </Select></Field>
        ) : <div className="md-note"><Icon name="info" size={14} />Er staan geen open CFD-posities.</div>}
        {pos && (<>
          <div className="md-cfd__grid">
            <Field label="Aantal sluiten" htmlFor="md-cfd-cqty" hint={`Open: ${pos.quantity}`}><Input id="md-cfd-cqty" inputMode="decimal" value={f.quantity} placeholder={String(pos.quantity).replace('.', ',')} onChange={e => set({ quantity: e.target.value })} /></Field>
            <Field label={`Sluitkoers (${ccy})`} htmlFor="md-cfd-cpx" hint={livePx ? `Nu ${pxFmt(livePx)}` : null}><Input id="md-cfd-cpx" inputMode="decimal" value={f.price} placeholder={livePx ? String(livePx).replace('.', ',') : ''} onChange={e => set({ price: e.target.value })} /></Field>
            <Field label="Resultaat (€) uit Trading 212" htmlFor="md-cfd-real" hint="Het echte gerealiseerde resultaat; leeg = berekend"><Input id="md-cfd-real" inputMode="decimal" value={f.realized} placeholder={autoRealized != null ? autoRealized.toFixed(2).replace('.', ',') : ''} onChange={e => set({ realized: e.target.value })} /></Field>
            <Field label="Kosten (€, optioneel)" htmlFor="md-cfd-cfee" hint="Bijv. overnight-kosten of spread als die apart staan"><Input id="md-cfd-cfee" inputMode="decimal" value={f.fee} placeholder="0" onChange={e => set({ fee: e.target.value })} /></Field>
            <Field label="Accountwaarde na sluiten (€, optioneel)" htmlFor="md-cfd-acc" hint="Uit Trading 212; maakt cash en accountwaarde exact"><Input id="md-cfd-acc" inputMode="decimal" value={f.accountAfter} placeholder="" onChange={e => set({ accountAfter: e.target.value })} /></Field>
          </div>
          <div className="md-live" aria-live="polite">Geopend op {pxFmt(pos.openPrice)} · resultaat <b className="num" style={{ color: realized < 0 ? 'var(--negative)' : realized > 0 ? 'var(--positive)' : undefined }}>{realized == null ? '—' : fmtMoney(realized, { sign: true, decimals: 2 })}</b> · de margin van dit deel komt vrij als cash</div>
        </>)}
      </>)}
      <Field label="Notitie (optioneel)" htmlFor="md-cfd-note"><Textarea id="md-cfd-note" rows={2} value={f.note} onChange={e => set({ note: e.target.value })} /></Field>
      <div className="md-foot">
        <span className="md-foot__reason" />
        <Button variant="ghost" onClick={onDone}>Annuleren</Button>
        <Button variant="primary" disabled={!canSubmit} onClick={submit} data-testid="cfd-trade-submit">{open ? 'Positie openen' : 'Positie sluiten'}</Button>
      </div>
    </div>
  );
}

function TransactionSheet({ app, open, preset, initial, onClose }) {
  const parties = (app && app.model && app.model.parties) || [];
  const allParties = (app && app.model && app.model.allParties) || parties;
  const postOfLeaf = (app && app.model && app.model.postOfLeaf) || {};
  const leavesByPost = (app && app.model && app.model.leavesByPost) || {};
  const byId = React.useMemo(() => Object.fromEntries(parties.map(p => [p.id, p])), [parties]);
  const today = todayIsoLocal();
  const isEdit = !!initial;
  const [form, setForm] = useState(() => mdBlank(initial, preset, today, allParties));
  const [step, setStep] = useState(1);
  const [typeNote, setTypeNote] = useState(null);
  const [feeOpen, setFeeOpen] = useState(false);
  const [tried, setTried] = useState(false);
  const firstFieldRef = useRef(null);

  const defaultPartyFor = React.useCallback(type => {
    const ok = p => p && (!type || allowedTxTypes(p).includes(type));
    const recent = ((app && app.prefs && app.prefs.recentParties) || []).map(id => byId[postOfLeaf[id] || id]).find(ok);
    if (recent) return recent.id;
    const open1 = ((app && app.model && app.model.open) || []).map(s => s.party).find(ok);
    if (open1) return open1.id;
    const any = parties.find(ok) || parties[0];
    return any ? any.id : '';
  }, [app, byId, parties, postOfLeaf]);

  useEffect(() => {
    if (!open) return;
    const f = mdBlank(initial, preset, todayIsoLocal(), allParties);
    if (!initial && f.type && !f.party) f.party = defaultPartyFor(f.type);
    if (!initial && f.party && byId[f.party] && isPostParty(byId[f.party])) Object.assign(f, mdPostPatch(f, f.party, f.coin));
    setForm(f);
    setStep(initial || (preset && preset.type) ? 2 : 1);
    setTypeNote(null);
    setTried(false);
    setPickedName(null);
    setFeeOpen(!!(initial && +initial.feeEur > 0));
  }, [open, preset, initial]); // eslint-disable-line

  // Crypto-post (Finst/Wallet): de gekozen coin bepaalt de sub-holding waarop geboekt wordt.
  const selected = byId[form.party] || null;
  const isPost = isPostParty(selected);
  const postCoins = isPost ? (leavesByPost[selected.id] || []).map(l => l.coin) : [];
  const party = isPost ? cryptoLeafFor(allParties, selected.id, form.coin) : selected;
  const isTransfer = form.type === 'overboeking';
  const transferPosts = parties.filter(p => isPostParty(p) && (leavesByPost[p.id] || []).length);
  const toPostOptions = transferPosts.filter(p => p.id !== form.party && cryptoLeafFor(allParties, p.id, form.coin));
  const toLeaf = isTransfer && form.toPost && form.toPost !== form.party ? cryptoLeafFor(allParties, form.toPost, form.coin) : null;
  const orphanId = isEdit && initial.party && !byId[initial.party] && !postOfLeaf[initial.party] ? initial.party : null;

  const allowedFor = (p, partyId) => {
    if (!p) return TX_TYPES.map(t => t.key);
    const base = allowedTxTypes(p);
    if (isEdit && partyId === initial.party && !base.includes(initial.type)) return [...base, initial.type];
    return base;
  };

  // Re-validate type when party changes.
  const changeParty = id => {
    setForm(f => {
      const p = byId[id];
      const allowed = allowedFor(p, id);
      const extra = mdPostPatch(f, id, f.coin);
      if (f.type && p && !allowed.includes(f.type)) {
        const nt = allowed[0];
        setTypeNote(`Type aangepast naar ${TX_LABELS[nt]}`);
        return { ...f, ...extra, party: id, type: nt };
      }
      setTypeNote(null);
      return { ...f, ...extra, party: id };
    });
  };
  // Coin geldig houden voor de gekozen post en een passende ontvangende post kiezen.
  function mdPostPatch(f, partyId, coin) {
    const p = byId[partyId];
    if (!isPostParty(p)) return {};
    const coins = (leavesByPost[p.id] || []).map(l => l.coin);
    const c = coins.includes(coin) ? coin : (coins[0] || coin);
    const okTo = id => id && id !== partyId && cryptoLeafFor(allParties, id, c);
    const toPost = okTo(f.toPost) ? f.toPost : ((transferPosts.find(x => okTo(x.id)) || {}).id || '');
    return { coin: c, toPost };
  }
  const changeCoin = c => setForm(f => ({ ...f, ...mdPostPatch(f, f.party, c), coin: c }));
  const changeType = t => {
    setTypeNote(null);
    setForm(f => ({ ...f, type: t }));
  };
  const pickTile = t => {
    setForm(f => {
      let pid = f.party;
      if (!pid || !allowedTxTypes(byId[pid] || {}).includes(t)) {
        const pp = preset && preset.party ? (postOfLeaf[preset.party] || preset.party) : null;
        pid = pp && allowedTxTypes(byId[pp] || {}).includes(t) ? pp : defaultPartyFor(t);
      }
      return { ...f, ...mdPostPatch(f, pid, f.coin), type: t, party: pid };
    });
    setTypeNote(null);
    setStep(2);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isMixed = mdIsMixed(party);
  const isT212 = !!(party && party.id === STOCK_PARTY_ID);
  const isStockOrder = isT212 && ['koop', 'verkoop'].includes(form.type);
  // Orderwaarde ↔ prijs per stuk: goud/zilver en aandelen (fractioneel kopen op bedrag).
  const isGoldOrder = (isMixed || isStockOrder) && ['koop', 'verkoop'].includes(form.type);
  const calcPx = (q, ov) => { const qty = parseNlNumber(q) || 0, val = parseNlNumber(ov) || 0; return qty > 0 && val > 0 ? +(val / qty).toFixed(6) : null; };
  // Aandelen: de koers is leidend; aantal en orderwaarde rekenen elkaar uit (fractioneel kopen op bedrag).
  const stockLink = (n, from) => {
    const px = parseNlNumber(n.unitPriceEur) || 0;
    if (!(px > 0)) return n;
    if (from === 'qty') { const q = parseNlNumber(n.quantity) || 0; n.orderValueEur = q > 0 ? mdNum(+(q * px).toFixed(2)) : ''; }
    else { const ov = parseNlNumber(n.orderValueEur) || 0; if (ov > 0) n.quantity = mdNum(+(ov / px).toFixed(6)); else if (from === 'px') stockLink(n, 'qty'); }
    return n;
  };
  const setQuantity = v => setForm(f => {
    const n = { ...f, quantity: v };
    if (isStockOrder) return stockLink(n, 'qty');
    if (isGoldOrder && f.orderValueEur !== '') { const px = calcPx(v, f.orderValueEur); if (px != null) n.unitPriceEur = mdNum(px); }
    return n;
  });
  const setOrderValue = v => setForm(f => {
    const n = { ...f, orderValueEur: v };
    if (isStockOrder) return stockLink(n, 'ov');
    const px = calcPx(f.quantity, v); if (px != null) n.unitPriceEur = mdNum(px);
    return n;
  });
  const setUnitPrice = v => setForm(f => {
    const n = { ...f, unitPriceEur: v };
    if (isStockOrder) return stockLink(n, 'px');
    if (isGoldOrder && f.quantity !== '') {
      const tot = (parseNlNumber(f.quantity) || 0) * (parseNlNumber(v) || 0);
      n.orderValueEur = tot > 0 ? mdNum(+tot.toFixed(2)) : '';
    }
    return n;
  });

  const needs = mdNeeds(form.type, party, form.divMode);
  const unitLabel = mdFormUnitLabel(form, party);
  const calculatedPx = isGoldOrder && !isStockOrder ? calcPx(form.quantity, form.orderValueEur) : null;
  const parsed = {
    amountEur: parseNlNumber(form.amountEur),
    quantity: parseNlNumber(form.quantity),
    unitPriceEur: calculatedPx != null ? calculatedPx : parseNlNumber(form.unitPriceEur),
    valueEur: parseNlNumber(form.valueEur),
  };
  const qtyN = parsed.quantity || 0;
  const pxN = parsed.unitPriceEur || 0;
  const orderValue = qtyN * pxN;
  const feeRaw = parseNlNumber(form.feeEur) || 0;
  // Aanvullen van een boeking uit Financieel: het bedrag dat van de rekening ging staat al vast.
  const finAanvul = !!(initial && isFinBelAanvullen(initial));
  const finBedrag = finAanvul ? (+initial.amountEur || 0) : 0;
  // Kosten bij een inleg (bv. stortingskosten): alleen bij het aanvullen van een Financieel-boeking, of als de
  // transactie ze al heeft (anders zou bewerken ze stilletjes wissen). Ze tellen mee in de kostprijs.
  const feeOnInleg = form.type === 'inleg' && (finAanvul || !!(initial && +initial.feeEur > 0));
  const showFee = MD_FEE_TYPES.includes(form.type) || feeOnInleg;
  const feeBase = form.type === 'inleg' ? (parsed.amountEur || 0) : orderValue;
  const feeQtyN = isTransfer ? parseNlNumber(form.feeQty) : null;
  const feeEur = !showFee ? 0 : (form.feeMode === 'pct' ? (feeBase > 0 ? feeBase * feeRaw / 100 : 0) : feeRaw);
  const showInstrument = party && party.id === 'trading212' && MD_INSTR_TYPES.includes(form.type);
  const showMetal = isMixed && MD_METAL_TYPES.includes(form.type);
  const showOptAmount = form.type === 'opname' && mdUnitBased(party);
  const finFee = form.feeMode === 'eur' ? feeRaw : 0;
  const finPxSuggest = finAanvul && form.type === 'koop' && qtyN > 0 && finBedrag > finFee
    ? +((finBedrag - finFee) / qtyN).toFixed(6) : null;
  // Inleg met kosten: het Financieel-bedrag = inleg + kosten, dus voorstel inleg = bedrag − kosten.
  const finInlegSuggest = finAanvul && form.type === 'inleg' && finFee > 0 && finBedrag > finFee
    ? +(finBedrag - finFee).toFixed(2) : null;

  const errors = {};
  for (const k of needs) {
    const v = parsed[k];
    if (v == null || !Number.isFinite(v)) {
      errors[k] = k === 'quantity' ? 'Vul een aantal in' : k === 'unitPriceEur' ? 'Prijs moet groter zijn dan 0' : 'Vul een bedrag in';
    } else if ((k === 'quantity' || k === 'unitPriceEur') && !(v > 0)) {
      errors[k] = k === 'quantity' ? 'Vul een aantal in' : 'Prijs moet groter zijn dan 0';
    } else if ((k === 'amountEur' || k === 'valueEur') && v < 0) {
      errors[k] = 'Vul een bedrag in';
    }
  }
  if (isTransfer) {
    if (!toLeaf) errors.toPost = 'Kies een ontvangende post';
    if (form.feeQty !== '' && (feeQtyN == null || feeQtyN < 0)) errors.feeQty = 'Vul geldige netwerkkosten in';
  }
  if (isPost && !party) errors.coin = 'Deze post heeft geen sub-holding voor deze coin';
  if (isStockOrder && !form.instrument.trim()) errors.instrument = 'Kies een aandeel of ETF';
  const baseValid = !!(form.party && form.type && /^\d{4}-\d{2}-\d{2}$/.test(form.date || ''));
  const valid = baseValid && Object.keys(errors).length === 0;
  const reason = !form.party ? 'Kies een partij' : !form.date ? 'Kies een datum' : Object.values(errors)[0] || null;
  const errFor = k => (errors[k] && (tried || (form[k] !== '' && form[k] != null))) ? errors[k] : null;

  const stockNames = (app && app.tweaks && app.tweaks.stockNames) || {};
  const stockQuotes = (app && app.stockQuotes) || {};
  const [pickedName, setPickedName] = useState(null);
  const recentStocks = React.useMemo(() => {
    const txs = ((app && app.state && app.state.transactions) || []).filter(isStockTx).sort((a, b) => b.date.localeCompare(a.date));
    return [...new Set(txs.map(t => normalizeTicker(t.instrument)))].slice(0, 8).map(symbol => ({ symbol, name: stockNames[symbol] }));
  }, [app && app.state && app.state.transactions]); // eslint-disable-line
  const instrSym = normalizeTicker(form.instrument);
  const instrName = pickedName || stockNames[instrSym] || (stockQuotes[instrSym] && stockQuotes[instrSym].name) || null;
  // Koers op de boekingsdatum (voor prijs-suggestie); live koers als het vandaag is.
  const [pickQuote, setPickQuote] = useState(null);
  useEffect(() => {
    if (!isStockOrder || !instrSym) { setPickQuote(null); return; }
    if (stockQuotes[instrSym] && (stockQuotes[instrSym].history || []).length) { setPickQuote(stockQuotes[instrSym]); return; }
    let alive = true;
    fetch(`${STOCK_API_URL}/koers?s=${encodeURIComponent(instrSym)}&range=2y`).then(r => r.json())
      .then(j => { if (alive) setPickQuote((j && j.quotes && j.quotes[instrSym]) || null); }).catch(() => { if (alive) setPickQuote(null); });
    return () => { alive = false; };
  }, [isStockOrder, instrSym]); // eslint-disable-line
  const quotePx = pickQuote ? stockPriceAt(pickQuote, form.date) : null;
  const pickStock = item => {
    setPickedName(item.name || null);
    setForm(f => ({ ...f, instrument: item.symbol }));
  };

  const submit = () => {
    setTried(true);
    if (!valid) return;
    const base = initial ? Object.fromEntries(Object.entries(initial).filter(([k]) => !MD_FORM_KEYS.includes(k) && k !== 'updatedAt')) : {};
    const tx = { ...base, id: (initial && initial.id) || makeId(), party: party ? party.id : form.party, type: form.type, date: form.date };
    if (isTransfer) {
      tx.toParty = toLeaf.id;
      if (feeQtyN > 0) tx.feeQty = feeQtyN;
    }
    if (form.note.trim()) tx.note = form.note.trim();
    if (showInstrument && form.instrument.trim()) tx.instrument = isT212 ? normalizeTicker(form.instrument) : form.instrument.trim();
    if (isT212 && tx.instrument && instrName && stockNames[tx.instrument] !== instrName && app.updateTweaks) {
      app.updateTweaks(tw => ({ ...tw, stockNames: { ...(tw.stockNames || {}), [tx.instrument]: instrName } }));
    }
    if (showMetal) {
      tx.metalType = form.metalType;
      if (form.metalType === 'zilver') tx.silverUnit = form.silverUnit; else tx.goldUnit = form.goldUnit;
    }
    for (const k of needs) tx[k] = Number(parsed[k]);
    const ov = parseNlNumber(form.orderValueEur) || 0;
    if (isGoldOrder && ov > 0) tx.amountEur = ov;
    if (showOptAmount) { const oa = parseNlNumber(form.optAmount) || 0; if (oa > 0) tx.amountEur = oa; }
    if (feeEur > 0) tx.feeEur = +feeEur.toFixed(4);
    app.saveTx(tx);
    // CFD-rekening: een storting/opname verandert direct cash en accountwaarde van de stand.
    if (!isEdit && party && party.cfd && (tx.type === 'inleg' || tx.type === 'opname') && +tx.amountEur > 0) {
      const sign = tx.type === 'inleg' ? 1 : -1;
      const b = cfdBake(cfdNormalize(party.cfd), app.stockQuotes || {}, cfdTickStore.ticks, tx.date);
      const acc0 = b.accountValue, m0 = b.margin;
      b.accountValue = (b.accountValue || 0) + sign * +tx.amountEur - (+tx.feeEur || 0);
      b.cash = b.accountValue - (b.margin || 0);
      cfdRehealth(b, acc0, m0);
      b.trades.push({ date: tx.date, action: tx.type, amount: +tx.amountEur });
      app.saveParty({ ...party, cfd: b });
      const same = ((app.state && app.state.transactions) || []).find(t => t.party === party.id && t.type === 'waardering' && t.date === tx.date);
      app.saveTx({ ...(same || { id: makeId(), party: party.id, type: 'waardering', date: tx.date }), valueEur: +b.accountValue.toFixed(2), note: 'Stand CFD-rekening' });
    }
    onClose && onClose();
  };

  const onKeyDown = e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && step === 2) { e.preventDefault(); submit(); }
  };

  // Live line
  const liveLine = (() => {
    if (!party || !form.type) return null;
    if (isTransfer) {
      const sm = app.model && app.model.byId && app.model.byId[party.id];
      if (!sm) return null;
      const coin = party.unitLabel || form.coin;
      let avail = sm.bookedQuantity != null ? sm.bookedQuantity : (+sm.quantity || 0);
      if (isEdit && initial && initial.type === 'overboeking' && initial.party === party.id) avail += transferOutQty(initial);
      const out = qtyN + (feeQtyN > 0 ? feeQtyN : 0);
      const fromName = selected ? selected.name : party.name;
      const moved = out > 0 && sm.avgCost != null ? out * sm.avgCost : null;
      return <>Geboekt bij {fromName}: <b className="num">{fmtQty(avail, coin, { decimals: 8 })}</b>
        {moved != null && <> · kostprijs mee ≈ <b className="num">{fmtMoney(moved, { decimals: 2 })}</b></>}
        {out > avail + 1e-12 && <> · <span style={{ color: 'var(--warn)' }}>meer dan geboekt</span></>}</>;
    }
    if (isStockOrder && form.type === 'koop' && orderValue > 0) {
      const sm = app.model && app.model.byId && app.model.byId[party.id];
      const cash = sm && sm.stocks ? sm.stocks.cash : 0;
      const total = orderValue + feeEur;
      const short = total - cash;
      return <>Orderbedrag <b className="num">{fmtMoney(total, { decimals: 2 })}</b>
        {short > 0.005 ? <> · <b className="num">{fmtMoney(short, { decimals: 2 })}</b> telt als inleg</> : <> · uit kas ({fmtMoney(cash, { decimals: 2 })})</>}</>;
    }
    if (['koop', 'verkoop', 'cashback'].includes(form.type) && orderValue > 0) {
      return <>Orderbedrag <b className="num">{fmtMoney(orderValue, { decimals: 2 })}</b>
        {feeEur > 0 && <> · {form.type === 'verkoop' ? 'netto' : 'totaal'} <b className="num">{fmtMoney(form.type === 'verkoop' ? orderValue - feeEur : orderValue + feeEur, { decimals: 2 })}</b></>}</>;
    }
    if (form.type === 'dividend' && orderValue > 0) {
      return <>Herbelegging <b className="num md-gain">{fmtMoney(orderValue, { decimals: 2 })}</b> · telt niet mee als inleg</>;
    }
    if (form.type === 'waardering' && needs[0] === 'valueEur') {
      const prev = ((app.state && app.state.transactions) || [])
        .filter(t => t.party === party.id && t.type === 'waardering' && t.valueEur != null && t.valueEur !== '' && (!initial || t.id !== initial.id))
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      if (!prev) return null;
      const diff = parsed.valueEur != null ? parsed.valueEur - +prev.valueEur : null;
      return <>Vorige waardering <b className="num">{fmtMoney(+prev.valueEur)}</b> · {fmtDateShort(prev.date)}
        {diff != null && <> · verschil <b className="num">{fmtMoney(diff, { sign: true })}</b></>}</>;
    }
    if (form.type === 'inleg' && (party.unit === 'bundle' || party.unit === 'eur') && parsed.amountEur > 0) {
      const sm = app.model && app.model.byId && app.model.byId[party.id];
      if (!sm) return null;
      return <>Nieuwe waarde {party.name}: <b className="num">{fmtMoney((sm.currentValueEur || 0) + parsed.amountEur)}</b></>;
    }
    return null;
  })();

  const presetParty = preset && preset.party ? byId[postOfLeaf[preset.party] || preset.party] : null;
  const tileTypes = MD_TILE_ORDER.filter(k => k !== 'cashback' || (presetParty && allowedTxTypes(presetParty).includes('cashback')));
  const recent = [...new Set(((app.prefs && app.prefs.recentParties) || []).map(id => postOfLeaf[id] || id))]
    .map(id => byId[id]).filter(p => p && (!isTransfer || isPostParty(p))).slice(0, 5);

  const typeOptions = selected ? allowedFor(selected, isEdit ? initial.party : selected.id) : TX_TYPES.map(t => t.key);
  const ids = 'md-tx';

  const cfdMode = !isEdit && isCfdParty(selected) && (form.type === 'koop' || form.type === 'verkoop');
  const footer = step === 2 && !cfdMode ? (
    <div className="md-foot">
      <span className="md-foot__reason">{!valid && reason ? reason : <span className="sr-only">Ctrl+Enter om op te slaan</span>}</span>
      <Button variant="ghost" onClick={onClose}>Annuleren</Button>
      <Button variant="primary" disabled={!valid} onClick={submit} data-testid="tx-submit">{isEdit ? 'Opslaan' : 'Toevoegen'}</Button>
    </div>
  ) : null;

  return (
    <Sheet open={open} onClose={onClose} testId="tx-sheet" width={520}
      title={finAanvul ? 'Transactie aanvullen' : isEdit ? 'Transactie bewerken' : 'Nieuwe transactie'}
      subtitle="Leg inleg, koop, verkoop of een waardering vast."
      onBack={!isEdit && step === 2 && !(preset && preset.type) ? () => setStep(1) : undefined}
      footer={footer}>
      {step === 1 ? (
        <div>
          <p className="md-lead">Wat wil je vastleggen?</p>
          <div className="md-types">
            {tileTypes.map(k => {
              const disabled = !!(presetParty && !allowedTxTypes(presetParty).includes(k)) || (k === 'overboeking' && transferPosts.length < 2);
              return (
                <button key={k} type="button" className="md-type" data-testid={`tx-type-${k}`} aria-disabled={disabled || undefined}
                  onClick={() => { if (!disabled) pickTile(k); }}>
                  <span className="md-type__icon"><Icon name={mdTypeIcon(k)} size={18} /></span>
                  <span><span className="md-type__label">{mdShortLabel(k)}</span><span className="md-type__hint">{TX_TYPE_META[k] ? TX_TYPE_META[k].hint : ''}</span></span>
                </button>
              );
            })}
          </div>
          {presetParty && (
            <p className="md-lead" style={{ marginTop: 12, fontSize: 13 }}>Voor {presetParty.name}. Niet beschikbare types zijn uitgeschakeld.</p>
          )}
        </div>
      ) : (
        <div className="md-form" onKeyDown={onKeyDown}>
          {isEdit ? (
            <Field label="Type" htmlFor={`${ids}-type`}>
              <Select id={`${ids}-type`} value={form.type} onChange={e => changeType(e.target.value)}>
                {typeOptions.map(k => <option key={k} value={k}>{TX_LABELS[k]}</option>)}
              </Select>
            </Field>
          ) : (
            <div className="md-typebar">
              <span className="md-type__icon"><Icon name={mdTypeIcon(form.type)} size={18} /></span>
              <span className="md-typebar__label">{cfdMode ? (form.type === 'koop' ? 'CFD-positie openen' : 'CFD-positie sluiten') : TX_LABELS[form.type]}</span>
              <span className="md-typebar__hint">{TX_TYPE_META[form.type] ? TX_TYPE_META[form.type].hint : ''}</span>
              {!(preset && preset.type) && <Button size="sm" variant="ghost" onClick={() => setStep(1)}>Wijzig</Button>}
            </div>
          )}
          {typeNote && <div className="md-note" role="status"><Icon name="info" size={14} />{typeNote}</div>}
          {finAanvul && (
            <div className="md-live" data-testid="tx-fin-aanvul">
              Uit Financieel: <b className="num">{fmtMoney(finBedrag, { decimals: 2 })}</b> op {fmtDateShort(initial.date)}.
              {' '}{form.type === 'koop' ? 'Vul het aantal, de prijs per eenheid en eventuele transactiekosten in.'
                : form.type === 'inleg' ? 'Controleer het bedrag; waren er kosten, vul die dan in en trek ze van de inleg af.'
                : 'Controleer het bedrag en sla op.'}
              {' '}Na opslaan is het een gewone transactie.
            </div>
          )}

          <Field label={isTransfer ? 'Van' : 'Partij'} htmlFor={`${ids}-party`}
            hint={isCfdParty(party) ? 'CFD: kies Koop om een positie te openen en Verkoop om te sluiten; inleg/opname voor stortingen.' : party && party.unit === 'bundle' && party.id !== STOCK_PARTY_ID ? `${party.name} ondersteunt alleen inleg, opname, kosten en waardering.` : null}>
            {recent.length > 0 && (
              <div className="md-chips">
                {recent.map(p => (
                  <Chip key={p.id} active={form.party === p.id} swatch={partyColorOf(p)} onClick={() => changeParty(p.id)}>{p.name}</Chip>
                ))}
              </div>
            )}
            <Select id={`${ids}-party`} value={form.party} onChange={e => changeParty(e.target.value)}>
              {!form.party && <option value="">Kies een partij</option>}
              {orphanId && <option value={orphanId}>Onbekend ({orphanId})</option>}
              {(isTransfer ? transferPosts : parties).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>

          {cfdMode ? <MdCfdTrade key={form.type} app={app} party={selected} type={form.type} onDone={onClose} positionId={preset && preset.cfdPosition} /> : <>
          {form.type === 'dividend' && (
            <Field label="Soort dividend" hint={form.divMode === 'acc'
              ? 'Herbelegd: het dividend wordt omgezet in extra aandelen/participaties. Vul het aantal en de koers in; geen cash.'
              : 'Uitkerend: het dividend wordt als geld uitbetaald (naar cash of je rekening) en telt als gerealiseerd resultaat.'}>
              <Segmented ariaLabel="Soort dividend" full value={form.divMode} onChange={v => set('divMode', v)}
                options={[{ value: 'dist', label: 'Uitkerend' }, { value: 'acc', label: 'Accumulerend (herbelegd)' }]} />
            </Field>
          )}
          {isPost && postCoins.length > 0 && (
            <Field label="Coin" error={tried ? errors.coin : null}>
              <Segmented ariaLabel="Coin" full value={form.coin} onChange={changeCoin}
                options={postCoins.map(c => ({ value: c, label: `${(CRYPTO_COIN_BY_KEY[c] || {}).label || c} (${c})` }))} />
            </Field>
          )}

          {isTransfer && (
            <Field label="Naar" htmlFor={`${ids}-to`} error={tried ? errors.toPost : null}
              hint="Verplaatst coins en hun kostprijs tussen je eigen posten. Telt niet als inleg of opname.">
              <Select id={`${ids}-to`} value={toLeaf ? form.toPost : ''} onChange={e => set('toPost', e.target.value)}>
                {!toLeaf && <option value="">Kies een post</option>}
                {toPostOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
          )}

          <Field label="Datum" htmlFor={`${ids}-date`}>
            <div className="md-chips">
              <Chip active={form.date === today} onClick={() => set('date', today)}>Vandaag</Chip>
              <Chip active={form.date === addDaysIso(today, -1)} onClick={() => set('date', addDaysIso(today, -1))}>Gisteren</Chip>
            </div>
            <Input id={`${ids}-date`} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </Field>

          {showInstrument && (
            <Field label={isStockOrder ? 'Aandeel / ETF' : 'Aandeel / ETF (optioneel)'} htmlFor={`${ids}-instr`} error={tried ? errors.instrument : null}
              hint={quotePx != null ? `Koers ${form.date >= today ? 'nu' : 'op ' + fmtDateShort(form.date)}: ${fmtMoney(quotePx, { decimals: 2 })}${pickQuote && pickQuote.currency && pickQuote.currency !== 'EUR' ? ' (omgerekend uit ' + pickQuote.currency + ')' : ''}` : 'De koers wordt daarna automatisch opgehaald.'}>
              <MdStockPicker id={`${ids}-instr`} value={instrSym} name={instrName} recent={recentStocks} onPick={pickStock} error={tried ? errors.instrument : null} />
              {isStockOrder && quotePx != null && !(parseNlNumber(form.unitPriceEur) > 0) && (
                <button type="button" className="md-addlink" style={{ marginTop: 8 }} onClick={() => setUnitPrice(mdNum(+quotePx.toFixed(4)))}>
                  <Icon name="circle-plus" size={14} />Gebruik {fmtMoney(quotePx, { decimals: 2 })} als prijs per aandeel
                </button>
              )}
            </Field>
          )}

          {showMetal && (
            <div className="md-row2">
              <Field label="Metaal">
                <Segmented ariaLabel="Metaal" full value={form.metalType} onChange={v => set('metalType', v)}
                  options={[{ value: 'goud', label: 'Goud' }, { value: 'zilver', label: 'Zilver' }]} />
              </Field>
              <Field label={form.metalType === 'zilver' ? 'Zilver eenheid' : 'Goud eenheid'} hint="1 troy ounce = 31,1 gram">
                {form.metalType === 'zilver' ? (
                  <Segmented ariaLabel="Eenheid zilver" full value={form.silverUnit} onChange={v => set('silverUnit', v)}
                    options={[{ value: 'gram', label: 'Gram' }, { value: 'ounce', label: 'Ounce' }]} />
                ) : (
                  <Segmented ariaLabel="Eenheid goud" full value={form.goldUnit} onChange={v => set('goldUnit', v)}
                    options={[{ value: 'gram', label: 'Gram' }, { value: 'ounce', label: 'Ounce' }]} />
                )}
              </Field>
            </div>
          )}

          {needs.includes('amountEur') && (
            <Field label="Bedrag (€)" htmlFor={`${ids}-amt`} error={errFor('amountEur')}>
              <MoneyInput id={`${ids}-amt`} large value={form.amountEur} onChange={v => set('amountEur', v)} placeholder="0,00" />
            </Field>
          )}

          {(['koop', 'verkoop', 'cashback'].includes(form.type) && !(isT212 && form.type === 'cashback') || (form.type === 'dividend' && form.divMode === 'acc')) && (
            <div className="md-row2">
              <Field label={isT212 ? 'Aantal aandelen' : `Aantal (${unitLabel})`} htmlFor={`${ids}-qty`} error={errFor('quantity')}>
                <MoneyInput id={`${ids}-qty`} prefix="" value={form.quantity} onChange={setQuantity} placeholder="0" />
              </Field>
              {isGoldOrder && (
                <Field label="Orderwaarde (€)" htmlFor={`${ids}-ov`}>
                  <MoneyInput id={`${ids}-ov`} value={form.orderValueEur} onChange={setOrderValue} placeholder="0,00" />
                </Field>
              )}
              <Field label={`Prijs per ${isT212 ? 'aandeel' : unitLabel} (€)`} htmlFor={`${ids}-px`} error={errFor('unitPriceEur')}>
                <MoneyInput id={`${ids}-px`} value={form.unitPriceEur} onChange={setUnitPrice} placeholder="0,00" />
              </Field>
            </div>
          )}
          {finPxSuggest != null && Math.abs(finPxSuggest - pxN) > 1e-6 && (
            <button type="button" className="md-addlink" onClick={() => setUnitPrice(mdNum(finPxSuggest))}>
              <Icon name="circle-plus" size={14} />Gebruik {fmtMoney(finPxSuggest, { decimals: 4 })} per {unitLabel} (bedrag{finFee > 0 ? ' − kosten' : ''} ÷ aantal)
            </button>
          )}

          {isTransfer && (
            <div className="md-row2">
              <Field label={`Aantal verzonden (${unitLabel})`} htmlFor={`${ids}-xq`} error={errFor('quantity')}>
                <MoneyInput id={`${ids}-xq`} prefix="" large value={form.quantity} onChange={v => set('quantity', v)} placeholder="0" />
              </Field>
              <Field label={`Netwerkkosten (${unitLabel})`} htmlFor={`${ids}-xf`} error={errors.feeQty && form.feeQty !== '' ? errors.feeQty : null}
                hint="Optioneel. Extra afgeschreven bij de bron; telt als kosten in de kostprijs.">
                <MoneyInput id={`${ids}-xf`} prefix="" value={form.feeQty} onChange={v => set('feeQty', v)} placeholder="0" />
              </Field>
            </div>
          )}

          {form.type === 'opname' && needs.includes('quantity') && (
            <div className="md-row2">
              <Field label={`Aantal (${unitLabel})`} htmlFor={`${ids}-oq`} error={errFor('quantity')}>
                <MoneyInput id={`${ids}-oq`} prefix="" large value={form.quantity} onChange={v => set('quantity', v)} placeholder="0" />
              </Field>
              <Field label="Bedrag (€)" htmlFor={`${ids}-oa`} hint="Optioneel: wat je ervoor kreeg.">
                <MoneyInput id={`${ids}-oa`} value={form.optAmount} onChange={v => set('optAmount', v)} placeholder="0,00" />
              </Field>
            </div>
          )}

          {form.type === 'waardering' && (
            needs[0] === 'valueEur' ? (
              <Field htmlFor={`${ids}-val`} error={errFor('valueEur')}
                label={party && party.unit === 'bundle' ? 'Totale portefeuillewaarde (€)' : 'Huidige totale waarde (€)'}
                hint={party && party.unit === 'bundle' ? 'Vervangt de laatste waardering; winst/verlies wordt automatisch berekend.' : 'Vervangt de laatste waardering voor deze partij.'}>
                <MoneyInput id={`${ids}-val`} large value={form.valueEur} onChange={v => set('valueEur', v)} placeholder="0" />
              </Field>
            ) : needs[0] === 'quantity' ? (
              <Field label={`Totaal ${unitLabel} in bezit`} htmlFor={`${ids}-wq`} error={errFor('quantity')} hint="Huidige waarde wordt berekend via spot-prijs.">
                <MoneyInput id={`${ids}-wq`} prefix="" large value={form.quantity} onChange={v => set('quantity', v)} placeholder="0" />
              </Field>
            ) : (
              <Field label="Koers / NAV per stuk (€)" htmlFor={`${ids}-wp`} error={errFor('unitPriceEur')} hint="De huidige marktkoers of NAV per participatie/aandeel/token.">
                <MoneyInput id={`${ids}-wp`} large value={form.unitPriceEur} onChange={v => set('unitPriceEur', v)} placeholder="0,00" />
              </Field>
            )
          )}

          {showFee && (feeOpen ? (
            <Field label="Transactiekosten" htmlFor={`${ids}-fee`}>
              <div className="md-fee">
                <Segmented ariaLabel="Kosten in euro of procent" value={form.feeMode} onChange={v => set('feeMode', v)}
                  options={[{ value: 'eur', label: '€' }, { value: 'pct', label: '%' }]} />
                <MoneyInput id={`${ids}-fee`} prefix={form.feeMode === 'eur' ? '€' : ''} suffix={form.feeMode === 'pct' ? '%' : undefined}
                  value={form.feeEur} onChange={v => set('feeEur', v)} placeholder={form.feeMode === 'eur' ? '0,00' : '0,5'} showParsed={false} />
              </div>
              {form.feeMode === 'pct' && feeEur > 0 && <div className="md-feeconv num">= {fmtMoney(feeEur, { decimals: 2 })}</div>}
            </Field>
          ) : (
            <button type="button" className="md-addlink" onClick={() => setFeeOpen(true)}><Icon name="plus" size={14} />Transactiekosten</button>
          ))}
          {finInlegSuggest != null && Math.abs(finInlegSuggest - (parsed.amountEur || 0)) > 0.004 && (
            <button type="button" className="md-addlink" onClick={() => set('amountEur', mdNum(finInlegSuggest))}>
              <Icon name="circle-plus" size={14} />Gebruik {fmtMoney(finInlegSuggest, { decimals: 2 })} als inleg (bedrag − kosten)
            </button>
          )}

          <Field label="Notitie (optioneel)" htmlFor={`${ids}-note`}>
            <Textarea id={`${ids}-note`} rows={2} value={form.note} onChange={e => set('note', e.target.value)} />
          </Field>

          {liveLine && <div className="md-live" aria-live="polite">{liveLine}</div>}
          </>}
        </div>
      )}
    </Sheet>
  );
}

function TxDetailSheet({ app, open, txId, onClose }) {
  const txs = (app && app.state && app.state.transactions) || [];
  const tx = open ? txs.find(t => t.id === txId) : null;
  useEffect(() => {
    if (open && !tx && onClose) onClose();
  }, [open, tx]); // eslint-disable-line
  if (!open || !tx) return null;
  const party = (app.model.byId[tx.party] || {}).party || (app.model.parties || []).find(p => p.id === tx.party) || null;
  const unit = txUnitLabel(tx, party);
  const info = txAmountInfo(tx, party);
  const has = v => v !== undefined && v !== null && v !== '';
  const isTransfer = tx.type === 'overboeking';
  const rows = [];
  rows.push(['Type', TX_LABELS[tx.type] || tx.type]);
  rows.push([isTransfer ? 'Van' : 'Partij', party
    ? <span className="md-party"><Monogram party={party} size={28} />{party.name}</span>
    : `Onbekend (${tx.party})`]);
  rows.push(['Datum', fmtDateLong(tx.date)]);
  if (isTransfer) {
    const toS = app.model.byId[tx.toParty];
    rows.push(['Naar', toS ? <span className="md-party"><Monogram party={toS.party} size={28} />{toS.party.name}</span> : `Onbekend (${tx.toParty || '—'})`]);
    rows.push(['Aantal verzonden', fmtQty(+tx.quantity || 0, unit, { decimals: 8 })]);
    if (+tx.feeQty) rows.push(['Netwerkkosten', fmtQty(+tx.feeQty, unit, { decimals: 8 })]);
    rows.push(['Ontvangen', fmtQty(+tx.quantity || 0, unit, { decimals: 8 })]);
    const tc = transferCostMap(txs)[tx.id];
    if (tc) rows.push(['Kostprijs verplaatst', <Money value={tc.cost} decimals={2} />]);
  }
  if (+tx.quantity && !isTransfer) rows.push(['Aantal', fmtQty(+tx.quantity, unit, { decimals: party && party.unit === 'crypto' ? 8 : 4 })]);
  if (+tx.unitPriceEur) rows.push(['Prijs per eenheid', <Money value={+tx.unitPriceEur} decimals={4} />]);
  if (+tx.quantity && +tx.unitPriceEur) rows.push(['Orderbedrag', <Money value={txGross(tx)} decimals={2} />]);
  if (has(tx.amountEur)) rows.push(['Bedrag', <Money value={+tx.amountEur} decimals={2} />]);
  if (+tx.feeEur) rows.push(['Transactiekosten', <Money value={-Math.abs(+tx.feeEur)} decimals={2} />]);
  const net = txNetTotal(tx);
  if (tx.type !== 'waardering' && net != null) rows.push(['Netto totaal', <Money value={net} decimals={2} />]);
  if (tx.metalType) {
    const u = tx.metalType === 'zilver' ? (tx.silverUnit === 'gram' ? 'gram' : 'ounce') : (tx.goldUnit === 'ounce' ? 'ounce' : 'gram');
    rows.push(['Metaal', `${tx.metalType === 'zilver' ? 'Zilver' : 'Goud'} · ${u}`]);
  }
  if (tx.instrument) rows.push(['Instrument', tx.instrument]);
  if (has(tx.valueEur)) rows.push(['Totale waarde', <Money value={+tx.valueEur} decimals={2} />]);
  if (tx.note) rows.push(['Notitie', tx.note, true]);
  if (tx.updatedAt) rows.push(['Laatst gewijzigd', `${fmtDateLong(String(tx.updatedAt).slice(0, 10))} · ${fmtTime(tx.updatedAt)}`]);
  if (tx._t212Id && pieIdOfTx(tx)) rows.push(['Pie', tx.note && tx.note.startsWith('Pie ') ? tx.note.slice(4) : 'Trading 212-pie']);
  else if (isFinBelAanvullen(tx)) rows.push(['Status', <Pill tone="warn" icon="pencil">OPEN · uit Financieel, nog aanvullen</Pill>]);
  else if (isFinBelManaged(tx)) rows.push(['Bron', 'Uit Financieel']);
  else if (tx._t212Id) rows.push(['Bron', 'Geïmporteerd uit Trading 212']);
  const finAanvulTx = isFinBelAanvullen(tx);

  const footer = (
    <div className="md-foot">
      <span className="md-foot__reason" />
      <Button variant="danger" icon="trash-2" onClick={() => app.deleteTx(tx.id).then(ok => { if (ok && onClose) onClose(); })}>Verwijderen</Button>
      {finAanvulTx
        ? <Button variant="primary" icon="pencil" onClick={() => app.completeFinTx(tx)}>Aanvullen</Button>
        : <Button variant="primary" icon="pencil" onClick={() => app.editTx(tx)}>Bewerken</Button>}
    </div>
  );
  return (
    <Sheet open={open} onClose={onClose} testId="tx-detail" width={440} size="medium"
      title={TX_LABELS[tx.type] || 'Transactie'} subtitle={`${party ? party.name : 'Onbekende partij'} · ${fmtDateLong(tx.date)}`} footer={footer}>
      <div className="md-detail-head">
        <span className="md-type__icon"><Icon name={mdTypeIcon(tx.type)} size={18} /></span>
        <MdAmount info={info} />
      </div>
      <dl className="md-dl">
        {rows.map(([k, v, isNote]) => (
          <React.Fragment key={k}>
            <dt>{k}</dt>
            <dd className={isNote ? 'md-dl__note' : 'num'}>{v}</dd>
          </React.Fragment>
        ))}
      </dl>
    </Sheet>
  );
}

// Amount text from txAmountInfo, masked under privacy.
function MdAmount({ info, className }) {
  const privacy = usePrivacy();
  const cls = mdCx('md-detail-amt num', info.tone === 'income' && 'is-income', info.tone === 'muted' && 'is-muted', className);
  if (privacy && /€/.test(info.text)) return <span className={cls} aria-label="bedrag verborgen">{info.text.replace(/€\s?[\d.,]+/, '€ •••••')}</span>;
  return <span className={cls}>{info.text}</span>;
}
function mdCx(...p) { return p.filter(Boolean).join(' '); }

Object.assign(window, { TransactionSheet, TxDetailSheet, MdStockPicker });
