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

function mdNeeds(type, party) {
  const unit = party ? party.unit : null;
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
  const isGoldOrder = isMixed && ['koop', 'verkoop'].includes(form.type);
  const calcPx = (q, ov) => { const qty = parseNlNumber(q) || 0, val = parseNlNumber(ov) || 0; return qty > 0 && val > 0 ? +(val / qty).toFixed(6) : null; };
  const setQuantity = v => setForm(f => {
    const n = { ...f, quantity: v };
    if (isGoldOrder && f.orderValueEur !== '') { const px = calcPx(v, f.orderValueEur); if (px != null) n.unitPriceEur = mdNum(px); }
    return n;
  });
  const setOrderValue = v => setForm(f => {
    const n = { ...f, orderValueEur: v };
    const px = calcPx(f.quantity, v); if (px != null) n.unitPriceEur = mdNum(px);
    return n;
  });
  const setUnitPrice = v => setForm(f => {
    const n = { ...f, unitPriceEur: v };
    if (isGoldOrder && f.quantity !== '') {
      const tot = (parseNlNumber(f.quantity) || 0) * (parseNlNumber(v) || 0);
      n.orderValueEur = tot > 0 ? mdNum(+tot.toFixed(2)) : '';
    }
    return n;
  });

  const needs = mdNeeds(form.type, party);
  const unitLabel = mdFormUnitLabel(form, party);
  const calculatedPx = isGoldOrder ? calcPx(form.quantity, form.orderValueEur) : null;
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
  const showFee = MD_FEE_TYPES.includes(form.type);
  const feeQtyN = isTransfer ? parseNlNumber(form.feeQty) : null;
  const feeEur = !showFee ? 0 : (form.feeMode === 'pct' ? (orderValue > 0 ? orderValue * feeRaw / 100 : 0) : feeRaw);
  const showInstrument = party && party.id === 'trading212' && MD_INSTR_TYPES.includes(form.type);
  const showMetal = isMixed && MD_METAL_TYPES.includes(form.type);
  const showOptAmount = form.type === 'opname' && mdUnitBased(party);

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
  const baseValid = !!(form.party && form.type && /^\d{4}-\d{2}-\d{2}$/.test(form.date || ''));
  const valid = baseValid && Object.keys(errors).length === 0;
  const reason = !form.party ? 'Kies een partij' : !form.date ? 'Kies een datum' : Object.values(errors)[0] || null;
  const errFor = k => (errors[k] && (tried || (form[k] !== '' && form[k] != null))) ? errors[k] : null;

  const t212Instruments = React.useMemo(() => {
    const names = ((app && app.state && app.state.transactions) || []).filter(t => t.party === 'trading212' && t.instrument).map(t => t.instrument);
    return [...new Set(names)].sort();
  }, [app && app.state && app.state.transactions]); // eslint-disable-line

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
    if (showInstrument && form.instrument.trim()) tx.instrument = form.instrument.trim();
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

  const footer = step === 2 ? (
    <div className="md-foot">
      <span className="md-foot__reason">{!valid && reason ? reason : <span className="sr-only">Ctrl+Enter om op te slaan</span>}</span>
      <Button variant="ghost" onClick={onClose}>Annuleren</Button>
      <Button variant="primary" disabled={!valid} onClick={submit} data-testid="tx-submit">{isEdit ? 'Opslaan' : 'Toevoegen'}</Button>
    </div>
  ) : null;

  return (
    <Sheet open={open} onClose={onClose} testId="tx-sheet" width={520}
      title={isEdit ? 'Transactie bewerken' : 'Nieuwe transactie'}
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
              <span className="md-typebar__label">{TX_LABELS[form.type]}</span>
              <span className="md-typebar__hint">{TX_TYPE_META[form.type] ? TX_TYPE_META[form.type].hint : ''}</span>
              {!(preset && preset.type) && <Button size="sm" variant="ghost" onClick={() => setStep(1)}>Wijzig</Button>}
            </div>
          )}
          {typeNote && <div className="md-note" role="status"><Icon name="info" size={14} />{typeNote}</div>}

          <Field label={isTransfer ? 'Van' : 'Partij'} htmlFor={`${ids}-party`}
            hint={party && party.unit === 'bundle' ? `${party.name} ondersteunt alleen inleg, opname, kosten en waardering.` : null}>
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
            <Field label="Instrument (aandeel / ETF)" htmlFor={`${ids}-instr`} hint="Eerder gebruikte instrumenten verschijnen als suggesties.">
              <Input id={`${ids}-instr`} list={`${ids}-instr-list`} value={form.instrument} placeholder="bijv. VWCE, AAPL, VOO…"
                onChange={e => set('instrument', e.target.value)} />
              <datalist id={`${ids}-instr-list`}>{t212Instruments.map(n => <option key={n} value={n} />)}</datalist>
              {t212Instruments.length > 0 && (
                <div className="md-chips" style={{ marginTop: 8, marginBottom: 0 }}>
                  {t212Instruments.filter(n => !form.instrument || n.toLowerCase().includes(form.instrument.toLowerCase())).slice(0, 8).map(n => (
                    <Chip key={n} active={form.instrument === n} onClick={() => set('instrument', n)}>{n}</Chip>
                  ))}
                </div>
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

          {['koop', 'verkoop', 'cashback', 'dividend'].includes(form.type) && (
            <div className="md-row2">
              <Field label={`Aantal (${unitLabel})`} htmlFor={`${ids}-qty`} error={errFor('quantity')}>
                <MoneyInput id={`${ids}-qty`} prefix="" value={form.quantity} onChange={setQuantity} placeholder="0" />
              </Field>
              {isGoldOrder && (
                <Field label="Orderwaarde (€)" htmlFor={`${ids}-ov`}>
                  <MoneyInput id={`${ids}-ov`} value={form.orderValueEur} onChange={setOrderValue} placeholder="0,00" />
                </Field>
              )}
              <Field label={`Prijs per ${unitLabel} (€)`} htmlFor={`${ids}-px`} error={errFor('unitPriceEur')}>
                <MoneyInput id={`${ids}-px`} value={form.unitPriceEur} onChange={setUnitPrice} placeholder="0,00" />
              </Field>
            </div>
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

          <Field label="Notitie (optioneel)" htmlFor={`${ids}-note`}>
            <Textarea id={`${ids}-note`} rows={2} value={form.note} onChange={e => set('note', e.target.value)} />
          </Field>

          {liveLine && <div className="md-live" aria-live="polite">{liveLine}</div>}
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
  if (tx._t212Id) rows.push(['Bron', 'Geïmporteerd uit Trading 212']);

  const footer = (
    <div className="md-foot">
      <span className="md-foot__reason" />
      <Button variant="danger" icon="trash-2" onClick={() => app.deleteTx(tx.id).then(ok => { if (ok && onClose) onClose(); })}>Verwijderen</Button>
      <Button variant="primary" icon="pencil" onClick={() => app.editTx(tx)}>Bewerken</Button>
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

Object.assign(window, { TransactionSheet, TxDetailSheet });
