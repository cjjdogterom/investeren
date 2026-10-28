// Transacties (S4): TransactiesScreen and TxList.

injectStyles('tabs', `
.tr-page { display: grid; gap: 16px; min-width: 0; padding: 20px 24px 48px; }
.tr-table th { top: var(--topbar-h); }
.tr-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.tr-count { color: var(--fg-muted); font-size: 13.5px; }
.tr-head__spacer { flex: 1; }
.tr-summary { display: flex; flex-wrap: wrap; gap: 4px 18px; font-size: 13px; color: var(--fg-muted); }
.tr-summary b { color: var(--fg); font-weight: 600; }
.tr-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.tr-search { position: relative; flex: 1 1 240px; max-width: 360px; min-width: 180px; }
.tr-search .input { padding-left: 32px; width: 100%; }
.tr-search__icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--fg-subtle); pointer-events: none; display: flex; }
.tr-select { width: auto; min-width: 160px; }
.tr-pop { min-width: 260px; max-height: 360px; overflow: auto; padding: 6px; }
.tr-opt { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 36px; padding: 6px 8px; border: 0; border-radius: var(--r-1); background: none; color: var(--fg); font: inherit; font-size: 13.5px; text-align: left; cursor: pointer; }
.tr-opt:hover { background: var(--surface-2); }
.tr-opt__check { width: 16px; height: 16px; border-radius: 4px; border: 1.5px solid var(--border-strong); display: grid; place-items: center; flex-shrink: 0; color: var(--on-ink); }
.tr-opt[aria-checked="true"] .tr-opt__check { background: var(--ink); border-color: var(--ink); }
.tr-opt__label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tr-opt__count { color: var(--fg-subtle); font-size: 12px; }
.tr-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-card); overflow: clip; min-width: 0; }
.tr-table { table-layout: fixed; }
.tr-table td { height: 40px; padding-top: 6px; padding-bottom: 6px; }
.tr-table tbody tr { cursor: pointer; }
.tr-table tbody tr:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.tr-table .tr-month td { position: sticky; top: calc(var(--topbar-h) + 31px); background: var(--surface-2); color: var(--fg); font-weight: 600; font-size: 12.5px; height: 32px; cursor: default; }
.tr-table .tr-month:hover { background: none; }
.tr-month__meta { color: var(--fg-muted); font-weight: 500; margin-left: 6px; }
.tr-tnum { font-variant-numeric: tabular-nums lining-nums; }
.tr-ell { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tr-type { display: inline-flex; align-items: center; gap: 6px; color: var(--fg-muted); }
.tr-party { display: inline-flex; align-items: center; gap: 8px; min-width: 0; max-width: 100%; }
.tr-party .monogram { width: 20px; height: 20px; font-size: 8.5px; border-radius: 5px; flex-shrink: 0; }
.tr-income { color: var(--gain); }
.tr-muted { color: var(--fg-muted); }
.tr-subtle { color: var(--fg-subtle); }
.tr-more { display: flex; justify-content: center; padding: 12px; border-top: 1px solid var(--border); }
.tr-mrow { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 64px; padding: 8px 16px; border: 0; border-bottom: 1px solid var(--border); background: var(--surface); color: var(--fg); font: inherit; text-align: left; cursor: pointer; }
.tr-mrow:last-child { border-bottom: 0; }
.tr-mrow:active { background: var(--surface-2); }
.tr-tile { position: relative; width: 40px; height: 40px; border-radius: 12px; background: var(--surface-2); display: grid; place-items: center; flex-shrink: 0; color: var(--fg); }
.tr-tile__dot { position: absolute; right: -1px; bottom: -1px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--surface); }
.tr-mrow__main { flex: 1; min-width: 0; display: grid; gap: 1px; }
.tr-mrow__title { font-size: 15px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tr-mrow__sub { font-size: 13px; color: var(--fg-subtle); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tr-mrow__end { text-align: right; display: grid; gap: 1px; flex-shrink: 0; }
.tr-mrow__amt { font-size: 15px; font-weight: 600; }
.tr-mrow__fee { font-size: 12px; color: var(--fg-subtle); }
.tr-mmonth { position: sticky; top: var(--mheader-h, 0px); z-index: 1; padding: 8px 16px; background: var(--surface-2); font-weight: 600; font-size: 13px; border-bottom: 1px solid var(--border); }
.tr-act { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 48px; padding: 6px 0; border: 0; background: none; color: var(--fg); font: inherit; text-align: left; cursor: pointer; border-radius: var(--r-2); }
.tr-act:hover { background: var(--surface-2); }
.tr-act .tr-tile { width: 32px; height: 32px; border-radius: 9px; }
.tr-act__title { font-size: 13.5px; font-weight: 600; }
.tr-act__sub { font-size: 12.5px; color: var(--fg-subtle); }
.tr-act__amt { font-size: 13.5px; font-weight: 600; }
.tr-act__ctx { font-size: 12px; color: var(--fg-subtle); }
.tr-monthcard { padding: 16px; }
.tr-mtable td, .tr-mtable th { white-space: nowrap; }
.tr-mtable tbody tr { cursor: default; }
.tr-mcards { display: grid; gap: 10px; }
.tr-mcard { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-card); padding: 12px 16px; }
.tr-mcard__title { font-weight: 650; margin-bottom: 6px; }
.tr-mcard .dl-cell { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
.tr-sheetlist { display: grid; gap: 2px; }
.tr-sheetlist .tr-opt { min-height: 48px; font-size: 15px; }
@media (max-width: 767.98px) {
  .tr-page { gap: 12px; padding: 12px 16px 24px; }
  .tr-chiprow { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
  .tr-chiprow::-webkit-scrollbar { display: none; }
  .tr-chiprow .chip { flex-shrink: 0; }
  .tr-search { max-width: none; }
  .tr-card { border-radius: var(--r-card); }
}
`);

const TR_MAIN_TYPES = ['inleg', 'koop', 'verkoop', 'opname', 'waardering'];
const TR_MORE_TYPES = ['dividend', 'rente', 'kosten', 'overboeking', 'cashback'];
const TR_PERIODS = [{ value: 'alles', label: 'Alles' }, { value: 'jaar', label: 'Dit jaar' }, { value: '12m', label: 'Laatste 12 maanden' }];
const TR_ORPHAN = '__orphan';
const TR_PAGE_MONTHS = 6;

const TR_SHORT = { cashback: 'Cashback', rente: 'Rente', kosten: 'Kosten' };
function trShortLabel(type) { return TR_SHORT[type] || TX_LABELS[type] || type; }
function trTypeIcon(type) { return (TX_TYPE_META[type] && TX_TYPE_META[type].icon) || 'circle-plus'; }

function trDay(iso) { return iso ? `${+iso.slice(8, 10)} ${MONTHS_NL[+iso.slice(5, 7) - 1]}` : ''; }

function trSort(txs) {
  return [...txs].sort((a, b) => {
    const c = (b.date || '').localeCompare(a.date || '');
    if (c) return c;
    return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
  });
}

function trPartyOf(app, id) {
  const s = app.model && app.model.byId && app.model.byId[id];
  if (s) return s.party;
  return ((app.model && app.model.parties) || []).find(p => p.id === id) || null;
}

function trSplit(v) { return v ? String(v).split(',').map(x => x.trim()).filter(Boolean) : []; }

// Masked amount text (privacy)
function TrAmount({ tx, party, className }) {
  const privacy = usePrivacy();
  const info = txAmountInfo(tx, party);
  const cls = [className, 'num', info.tone === 'income' ? 'tr-income' : info.tone === 'muted' ? 'tr-muted' : ''].filter(Boolean).join(' ');
  const text = privacy && /€/.test(info.text) ? info.text.replace(/€\s?[\d.,]+/, '€ •••••') : info.text;
  return <span className={cls}>{text}</span>;
}

function TrFee({ tx, prefix = '' }) {
  const fee = +tx.feeEur || 0;
  if (!fee) return <span className="tr-subtle">—</span>;
  return <span className="tr-muted">{prefix}<Money value={-fee} decimals={2} /></span>;
}

function TrPartyCell({ party, id }) {
  if (!party) return <span className="tr-party tr-muted"><span className="tr-ell">Onbekend ({id})</span></span>;
  return <span className="tr-party"><Monogram party={party} size={28} /><span className="tr-ell">{party.name}</span></span>;
}

// Desktop table with optional month group header rows.
function TrTable({ app, groups, showParty = true, menu = true }) {
  const today = todayIsoLocal();
  const cols = showParty ? 8 : 7;
  const onRowKey = (e, tx) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); app.openTxDetail(tx.id); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const rows = [...e.currentTarget.closest('table').querySelectorAll('tr[data-txrow]')];
      const i = rows.indexOf(e.currentTarget);
      const n = rows[i + (e.key === 'ArrowDown' ? 1 : -1)];
      if (n) n.focus();
    }
  };
  return (
    <table className="table tr-table">
      <colgroup>
        <col style={{ width: 74 }} />
        <col style={{ width: 130 }} />
        {showParty && <col style={{ width: '20%' }} />}
        <col />
        <col style={{ width: 128 }} />
        <col style={{ width: 92 }} />
        <col style={{ width: '16%' }} />
        <col style={{ width: menu ? 44 : 0 }} />
      </colgroup>
      <thead>
        <tr>
          <th>Datum</th><th>Type</th>{showParty && <th>Partij</th>}<th>Details</th>
          <th className="num">Totaal</th><th className="num">Kosten</th><th>Notitie</th><th><span className="sr-only">Acties</span></th>
        </tr>
      </thead>
      <tbody>
        {groups.map(g => (
          <React.Fragment key={g.key}>
            {g.title != null && (
              <tr className="tr-month"><td colSpan={cols}>{g.title}<span className="tr-month__meta">· {g.txs.length} {g.txs.length === 1 ? 'transactie' : 'transacties'}</span></td></tr>
            )}
            {g.txs.map(tx => {
              const party = trPartyOf(app, tx.party);
              return (
                <tr key={tx.id} data-testid={`tx-row-${tx.id}`} data-txrow="" tabIndex={0}
                  onClick={() => app.openTxDetail(tx.id)} onKeyDown={e => onRowKey(e, tx)}>
                  <td className="tr-tnum tr-ell">{trDay(tx.date)}</td>
                  <td><span className="tr-type"><Icon name={trTypeIcon(tx.type)} size={14} /><span className="tr-ell">{trShortLabel(tx.type)}</span></span></td>
                  {showParty && <td><TrPartyCell party={party} id={tx.party} /></td>}
                  <td className="tr-tnum tr-ell tr-muted" title={txDetailsText(tx, party)}>{txDetailsText(tx, party)}</td>
                  <td className="num"><TrAmount tx={tx} party={party} /></td>
                  <td className="num"><TrFee tx={tx} /></td>
                  <td className="tr-ell tr-muted" title={tx.note || ''}>{tx.note || ''}</td>
                  <td onClick={e => e.stopPropagation()}>
                    {menu && <Menu size="sm" triggerLabel="Acties" items={[
                      { label: 'Bewerken', icon: 'pencil', onClick: () => app.editTx(tx) },
                      { label: 'Verwijderen', icon: 'trash-2', danger: true, onClick: () => app.deleteTx(tx.id) },
                    ]} />}
                  </td>
                </tr>
              );
            })}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

function TrMobileRow({ app, tx, showParty }) {
  const party = trPartyOf(app, tx.party);
  const color = party ? partyColorOf(party) : 'var(--fg-subtle)';
  const title = showParty ? (party ? party.name : `Onbekend (${tx.party})`) : TX_LABELS[tx.type];
  const sub = showParty ? `${trShortLabel(tx.type)} · ${fmtDateShort(tx.date)}` : fmtDateShort(tx.date);
  const details = txDetailsText(tx, party);
  return (
    <button type="button" className="tr-mrow" data-testid={`tx-row-${tx.id}`} onClick={() => app.openTxDetail(tx.id)}>
      <span className="tr-tile"><Icon name={trTypeIcon(tx.type)} size={18} /><span className="tr-tile__dot" style={{ background: color }} /></span>
      <span className="tr-mrow__main">
        <span className="tr-mrow__title">{title}</span>
        <span className="tr-mrow__sub">{sub}</span>
        {details && <span className="tr-mrow__sub num">{details}</span>}
      </span>
      <span className="tr-mrow__end">
        <TrAmount tx={tx} party={party} className="tr-mrow__amt" />
        {+tx.feeEur > 0 && <span className="tr-mrow__fee">kosten <Money value={-(+tx.feeEur)} decimals={2} /></span>}
      </span>
    </button>
  );
}

function TrMobileGroups({ app, groups, showParty = true }) {
  return (
    <div>
      {groups.map(g => (
        <div key={g.key}>
          {g.title != null && <div className="tr-mmonth">{g.title} <span className="tr-month__meta">· {g.txs.length}</span></div>}
          {g.txs.map(tx => <TrMobileRow key={tx.id} app={app} tx={tx} showParty={showParty} />)}
        </div>
      ))}
    </div>
  );
}

function TxList({ app, txs, variant = 'ledger', limit, showParty = true }) {
  const sorted = React.useMemo(() => trSort(txs || []), [txs]);
  const list = limit ? sorted.slice(0, limit) : sorted;
  if (!list.length) return <EmptyState icon="list" title="Nog geen transacties" />;
  if (variant === 'activity') {
    const today = todayIsoLocal();
    return (
      <div className="tr-actlist">
        {list.map(tx => {
          const party = trPartyOf(app, tx.party);
          const color = party ? partyColorOf(party) : 'var(--fg-subtle)';
          const ctx = tx.type === 'waardering' ? 'nieuwe waarde' : (+tx.quantity > 0 ? fmtQty(+tx.quantity, txUnitLabel(tx, party), { decimals: party && party.unit === 'crypto' ? 6 : 2 }) : (tx.instrument || ''));
          return (
            <button key={tx.id} type="button" className="tr-act" data-testid={`tx-row-${tx.id}`} onClick={() => app.openTxDetail(tx.id)}>
              <span className="tr-tile"><Icon name={trTypeIcon(tx.type)} size={16} /><span className="tr-tile__dot" style={{ background: color }} /></span>
              <span className="tr-mrow__main">
                <span className="tr-act__title">{TX_LABELS[tx.type]}</span>
                <span className="tr-act__sub tr-ell">{showParty ? `${party ? party.name : 'Onbekend'} · ` : ''}{fmtRelDay(tx.date, today)}</span>
              </span>
              <span className="tr-mrow__end">
                <TrAmount tx={tx} party={party} className="tr-act__amt" />
                {ctx && <span className="tr-act__ctx num">{ctx}</span>}
              </span>
            </button>
          );
        })}
      </div>
    );
  }
  const groups = [{ key: 'all', title: null, txs: list }];
  const show = showParty && variant !== 'party';
  return app.isMobile
    ? <TrMobileGroups app={app} groups={groups} showParty={show} />
    : <TrTable app={app} groups={groups} showParty={show} />;
}

// Checkbox option list (popover / sheet)
function TrOptionList({ options, selected, onToggle, className = '' }) {
  return (
    <div className={className} role="group">
      {options.map(o => {
        const on = selected.includes(o.value);
        return (
          <button key={o.value} type="button" role="checkbox" aria-checked={on} className="tr-opt" onClick={() => onToggle(o.value)}>
            <span className="tr-opt__check">{on && <Icon name="check" size={12} strokeWidth={2.5} />}</span>
            {o.leading}
            <span className="tr-opt__label">{o.label}</span>
            {o.count != null && <span className="tr-opt__count num">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function TrPopoverChip({ label, count, active, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  return (
    <>
      <span ref={ref} style={{ display: 'inline-flex' }}>
        <Chip active={active} count={count || undefined} onClick={() => setOpen(o => !o)} aria-haspopup="dialog" aria-expanded={open}>
          {label} <Icon name="chevron-down" size={13} />
        </Chip>
      </span>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={ref} align="start" ariaLabel={label}>
        <div className="tr-pop">{children}</div>
      </Popover>
    </>
  );
}

function trMonthsAggregate(rows, mode) {
  if (mode === 'month') return rows;
  const map = new Map();
  for (const r of rows) {
    const y = r.month.slice(0, 4), m = +r.month.slice(5, 7);
    const key = mode === 'year' ? y : `${y}-Q${Math.ceil(m / 3)}`;
    const label = mode === 'year' ? y : `K${Math.ceil(m / 3)} '${y.slice(2)}`;
    const a = map.get(key) || { month: key, label, net: 0, inflow: 0, outflow: 0 };
    a.net += r.net; a.inflow += r.inflow; a.outflow += r.outflow;
    map.set(key, a);
  }
  const out = [...map.values()];
  return out.slice(Math.max(0, out.length - (mode === 'year' ? 8 : 12)));
}

function TrMonthView({ app, txs }) {
  const prefs = app.prefs || {};
  const mode = prefs.monthBarsMode || 'month';
  const [showAll, setShowAll] = useState(false);
  const privacy = usePrivacy();
  const bars = React.useMemo(() => {
    const s = app.model.series || {};
    const rows = mode === 'month' ? monthlyNetFlows(s, 12) : monthlyNetFlows(s, 0);
    return trMonthsAggregate(rows, mode);
  }, [app.model.series, mode]);
  const months = React.useMemo(() => buildMonthlyFlows(txs).reverse(), [txs]);
  const shown = showAll ? months : months.slice(0, 12);
  const cols = [
    { k: 'inleg', l: 'Inleg', v: m => m.inleg },
    { k: 'opname', l: 'Opname', v: m => m.opname ? -m.opname : 0 },
    { k: 'koop', l: 'Koop', v: m => m.koop },
    { k: 'inkomsten', l: 'Inkomsten', v: m => m.dividend + m.rente },
    { k: 'kosten', l: 'Kosten', v: m => m.kosten ? -m.kosten : 0 },
    { k: 'fees', l: 'Tx-kosten', v: m => m.fees ? -m.fees : 0 },
  ];
  const cell = (v, k) => !v ? <span className="tr-subtle">—</span>
    : <Money value={v} decimals={k === 'kosten' || k === 'fees' ? 2 : 0} sign={k === 'inkomsten'} className={k === 'inkomsten' ? 'tr-income' : undefined} />;
  return (
    <>
      <div className="tr-card tr-monthcard">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <h2 className="card__title" style={{ flex: 1 }}>Netto inleg</h2>
          <Segmented size="sm" ariaLabel="Periode per staaf" value={mode} onChange={v => app.setPrefs({ monthBarsMode: v })}
            options={[{ value: 'month', label: 'Maand' }, { value: 'quarter', label: 'Kwartaal' }, { value: 'year', label: 'Jaar' }]} />
        </div>
        <MonthlyFlowBars months={bars} height={app.isMobile ? 120 : 160} privacy={privacy}
          unitLabel={mode === 'month' ? 'mnd' : mode === 'quarter' ? 'kw' : 'jr'} />
      </div>
      {months.length === 0 ? (
        <div className="tr-card"><EmptyState icon="calendar" title="Geen maanden voor deze filters" /></div>
      ) : app.isMobile ? (
        <div className="tr-mcards">
          {shown.map(m => (
            <div key={m.month} className="tr-mcard">
              <div className="tr-mcard__title">{fmtMonthName(m.month)}</div>
              {cols.map(c => <div key={c.k} className="dl-cell num" data-label={c.l}>{cell(c.v(m), c.k)}</div>)}
            </div>
          ))}
        </div>
      ) : (
        <div className="tr-card" style={{ overflowX: 'auto' }}>
          <table className="table tr-mtable">
            <thead><tr><th>Maand</th>{cols.map(c => <th key={c.k} className="num">{c.l}</th>)}</tr></thead>
            <tbody>
              {shown.map(m => (
                <tr key={m.month}><td>{fmtMonthName(m.month)}</td>{cols.map(c => <td key={c.k} className="num">{cell(c.v(m), c.k)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {months.length > 12 && !showAll && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => setShowAll(true)}>Toon alles ({months.length} maanden)</Button>
        </div>
      )}
    </>
  );
}

function TransactiesScreen({ app }) {
  const q = (app.route && app.route.query) || {};
  const isMobile = app.isMobile;
  const all = (app.state && app.state.transactions) || [];
  const parties = (app.model && app.model.parties) || [];
  const byId = React.useMemo(() => Object.fromEntries(parties.map(p => [p.id, p])), [parties]);
  // Sub-holdings (finst-btc) tellen onder hun post (Finst); een overboeking hoort bij beide posten.
  const postOfLeaf = (app.model && app.model.postOfLeaf) || {};
  const dispId = id => postOfLeaf[id] || id;
  const txPostIds = t => {
    const a = dispId(t.party);
    if (t.type !== 'overboeking' || !t.toParty) return [a];
    const b = dispId(t.toParty);
    return b === a ? [a] : [a, b];
  };
  const selParties = trSplit(q.partij);
  const selTypes = trSplit(q.type);
  const periode = ['jaar', '12m'].includes(q.periode) ? q.periode : 'alles';
  const view = q.view === 'maand' || q.view === 'lijst' ? q.view : ((app.prefs && app.prefs.txView) === 'month' ? 'maand' : 'lijst');
  const [search, setSearch] = useState(q.q || '');
  const [searchOpen, setSearchOpen] = useState(!!q.q);
  const [monthsShown, setMonthsShown] = useState(TR_PAGE_MONTHS);
  const [sheet, setSheet] = useState(null); // 'partij' | 'type' | 'periode' (mobile)
  const searchFocused = useRef(false);

  const writeQuery = patch => {
    const next = { ...q, ...patch };
    const params = new URLSearchParams();
    ['partij', 'type', 'q', 'periode', 'view'].forEach(k => {
      const v = next[k];
      if (v == null || v === '' || (k === 'periode' && v === 'alles')) return;
      params.set(k, v);
    });
    const s = params.toString().replace(/%2C/g, ',');
    app.navigate('/transacties' + (s ? '?' + s : ''), { replace: true });
  };
  const writeSearch = useDebouncedCallback(v => writeQuery({ q: v.trim() }), 250);
  useEffect(() => { if (!searchFocused.current && (q.q || '') !== search) setSearch(q.q || ''); }, [q.q]); // eslint-disable-line
  useEffect(() => { setMonthsShown(TR_PAGE_MONTHS); }, [q.partij, q.type, q.q, q.periode]);

  const toggleIn = (list, v) => list.includes(v) ? list.filter(x => x !== v) : [...list, v];
  const setParties = list => writeQuery({ partij: list.join(',') });
  const setTypes = list => writeQuery({ type: list.join(',') });
  const setView = v => { writeQuery({ view: v }); app.setPrefs && app.setPrefs({ txView: v === 'maand' ? 'month' : 'list' }); };
  const hasFilters = selParties.length > 0 || selTypes.length > 0 || periode !== 'alles' || !!(q.q || '').trim();
  const clearFilters = () => { setSearch(''); writeQuery({ partij: '', type: '', q: '', periode: '' }); };

  const today = todayIsoLocal();
  const filtered = React.useMemo(() => {
    const needle = (q.q || '').trim().toLowerCase();
    const from = periode === 'jaar' ? `${today.slice(0, 4)}-01-01` : periode === '12m' ? addDaysIso(today, -365) : null;
    return all.filter(t => {
      const orphan = !byId[dispId(t.party)];
      if (selParties.length && !(orphan ? selParties.includes(TR_ORPHAN) : txPostIds(t).some(id => selParties.includes(id)))) return false;
      if (selTypes.length && !selTypes.includes(t.type)) return false;
      if (from && !(t.date > from || (periode === 'jaar' && t.date >= from))) return false;
      if (needle) {
        const hay = [...txPostIds(t).map(id => (byId[id] || {}).name || id), (trPartyOf(app, t.party) || {}).name, t.note, t.instrument].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [all, byId, q.partij, q.type, q.q, periode, today]); // eslint-disable-line

  const sum = React.useMemo(() => {
    const s = { inleg: 0, opname: 0, income: 0, costs: 0 };
    for (const t of filtered) {
      if (t.type === 'inleg') s.inleg += +t.amountEur || 0;
      if (t.type === 'opname') s.opname += +t.amountEur || 0;
      if (t.type === 'dividend') s.income += txGross(t);
      if (t.type === 'rente') s.income += +t.amountEur || 0;
      if (t.type === 'kosten') s.costs += +t.amountEur || 0;
      s.costs += +t.feeEur || 0;
    }
    return s;
  }, [filtered]);

  const groups = React.useMemo(() => {
    const sorted = trSort(filtered);
    const orphans = sorted.filter(t => !byId[dispId(t.party)]);
    const rest = sorted.filter(t => byId[dispId(t.party)]);
    const map = new Map();
    for (const t of rest) {
      const k = (t.date || '').slice(0, 7);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(t);
    }
    const out = [];
    if (orphans.length) out.push({ key: TR_ORPHAN, title: `Zonder partij (${orphans.length})`, txs: orphans, orphan: true });
    for (const [k, txs] of map) out.push({ key: k, title: fmtMonthName(k), txs });
    return out;
  }, [filtered, byId]);
  const monthGroups = groups.filter(g => !g.orphan);
  const visibleGroups = [...groups.filter(g => g.orphan), ...monthGroups.slice(0, monthsShown)];
  const hiddenMonths = Math.max(0, monthGroups.length - monthsShown);

  // Filter option lists
  const counts = React.useMemo(() => {
    const c = {};
    for (const t of all) {
      if (!byId[dispId(t.party)]) { c[TR_ORPHAN] = (c[TR_ORPHAN] || 0) + 1; continue; }
      for (const k of txPostIds(t)) c[k] = (c[k] || 0) + 1;
    }
    return c;
  }, [all, byId]);
  const partyOptions = [
    ...parties.filter(p => counts[p.id]).map(p => ({ value: p.id, label: p.name, count: counts[p.id], leading: <Monogram party={p} size={28} style={{ width: 20, height: 20, fontSize: 8.5, borderRadius: 5 }} /> })),
    ...(counts[TR_ORPHAN] ? [{ value: TR_ORPHAN, label: 'Zonder partij', count: counts[TR_ORPHAN] }] : []),
  ];
  const typeOptions = TX_TYPES.map(t => ({ value: t.key, label: t.label }));
  const moreActive = selTypes.filter(t => TR_MORE_TYPES.includes(t)).length;
  const privacy = usePrivacy();
  const m = v => privacy ? '€ •••••' : fmtMoney(v);

  const header = (
    <div className="tr-head">
      <h1 className="sr-only">Transacties</h1>
      <span className="tr-count num" data-testid="tx-count">{filtered.length} van {all.length} transacties</span>
      <span className="tr-head__spacer" />
      {!isMobile && (
        <>
          <Segmented ariaLabel="Weergave" value={view} onChange={setView}
            options={[{ value: 'lijst', label: 'Lijst', testId: 'tx-view-lijst' }, { value: 'maand', label: 'Per maand', testId: 'tx-view-maand' }]} />
        </>
      )}
    </div>
  );

  const summary = (
    <div className="tr-summary num" aria-label="Samenvatting gefilterde transacties">
      <span>Inleg <b>{m(sum.inleg)}</b></span>
      <span>Opname <b>{m(sum.opname)}</b></span>
      <span>Inkomsten <b className={sum.income ? 'tr-income' : undefined}>{m(sum.income)}</b></span>
      <span>Kosten <b>{m(sum.costs ? -sum.costs : 0)}</b></span>
    </div>
  );

  const searchBox = (
    <div className="tr-search">
      <span className="tr-search__icon"><Icon name="search" size={15} /></span>
      <Input type="search" value={search} placeholder="Zoek in partij, notitie, instrument" aria-label="Zoeken in transacties"
        onFocus={() => { searchFocused.current = true; }} onBlur={() => { searchFocused.current = false; }}
        onChange={e => { setSearch(e.target.value); writeSearch(e.target.value); }} />
    </div>
  );

  const desktopFilters = (
    <div className="tr-filters">
      {searchBox}
      <TrPopoverChip label="Partij" count={selParties.length} active={selParties.length > 0}>
        <TrOptionList options={partyOptions} selected={selParties} onToggle={v => setParties(toggleIn(selParties, v))} />
      </TrPopoverChip>
      <Chip active={selTypes.length === 0} onClick={() => setTypes([])}>Alle</Chip>
      {TR_MAIN_TYPES.map(k => (
        <Chip key={k} active={selTypes.includes(k)} onClick={() => setTypes(toggleIn(selTypes, k))}>{TX_LABELS[k]}</Chip>
      ))}
      <TrPopoverChip label="Meer" count={moreActive} active={moreActive > 0}>
        <TrOptionList options={TR_MORE_TYPES.map(k => ({ value: k, label: TX_LABELS[k] }))} selected={selTypes} onToggle={v => setTypes(toggleIn(selTypes, v))} />
      </TrPopoverChip>
      <Select className="tr-select" aria-label="Periode" value={periode} onChange={e => writeQuery({ periode: e.target.value })}>
        {TR_PERIODS.map(p => <option key={p.value} value={p.value}>Periode: {p.label}</option>)}
      </Select>
      {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Wissen</Button>}
    </div>
  );

  const activeCount = (selParties.length ? 1 : 0) + (selTypes.length ? 1 : 0) + (periode !== 'alles' ? 1 : 0) + ((q.q || '').trim() ? 1 : 0);
  const mobileFilters = (
    <>
      <div className="tr-chiprow">
        <Chip active={searchOpen || !!(q.q || '')} onClick={() => setSearchOpen(o => !o)} aria-label="Zoeken"><Icon name="search" size={14} /></Chip>
        <Chip active={selParties.length > 0} count={selParties.length || undefined} onClick={() => setSheet('partij')}>Partij <Icon name="chevron-down" size={13} /></Chip>
        <Chip active={selTypes.length > 0} count={selTypes.length || undefined} onClick={() => setSheet('type')}>Type <Icon name="chevron-down" size={13} /></Chip>
        <Chip active={periode !== 'alles'} onClick={() => setSheet('periode')}>{periode === 'alles' ? 'Periode' : TR_PERIODS.find(p => p.value === periode).label} <Icon name="chevron-down" size={13} /></Chip>
        {activeCount > 0 && <Chip onClick={clearFilters}>Wissen ({activeCount})</Chip>}
      </div>
      {searchOpen && searchBox}
      <Sheet open={sheet === 'partij'} onClose={() => setSheet(null)} title="Partij" size="medium"
        footer={<Button variant="primary" full onClick={() => setSheet(null)}>Toon {filtered.length} transacties</Button>}>
        <TrOptionList className="tr-sheetlist" options={partyOptions} selected={selParties} onToggle={v => setParties(toggleIn(selParties, v))} />
      </Sheet>
      <Sheet open={sheet === 'type'} onClose={() => setSheet(null)} title="Type" size="medium"
        footer={<Button variant="primary" full onClick={() => setSheet(null)}>Toon {filtered.length} transacties</Button>}>
        <TrOptionList className="tr-sheetlist" options={typeOptions} selected={selTypes} onToggle={v => setTypes(toggleIn(selTypes, v))} />
      </Sheet>
      <Sheet open={sheet === 'periode'} onClose={() => setSheet(null)} title="Periode" size="medium">
        <div className="tr-sheetlist" role="radiogroup">
          {TR_PERIODS.map(p => (
            <button key={p.value} type="button" role="radio" aria-checked={periode === p.value} className="tr-opt"
              onClick={() => { writeQuery({ periode: p.value }); setSheet(null); }}>
              <span className="tr-opt__check" style={{ borderRadius: '50%' }}>{periode === p.value && <Icon name="check" size={12} strokeWidth={2.5} />}</span>
              <span className="tr-opt__label">{p.label}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );

  let body;
  if (all.length === 0) {
    body = <div className="tr-card"><EmptyState icon="list" title="Nog geen transacties" action={{ label: 'Eerste transactie toevoegen', onClick: () => app.openTx() }} /></div>;
  } else if (view === 'maand') {
    body = <TrMonthView app={app} txs={filtered} />;
  } else if (filtered.length === 0) {
    body = <div className="tr-card"><EmptyState icon="filter" title="Geen transacties voor deze filters" action={{ label: 'Filters wissen', onClick: clearFilters }} /></div>;
  } else {
    body = (
      <div className="tr-card">
        {isMobile ? <TrMobileGroups app={app} groups={visibleGroups} /> : <TrTable app={app} groups={visibleGroups} />}
        {hiddenMonths > 0 && (
          <div className="tr-more">
            <Button variant="secondary" onClick={() => setMonthsShown(n => n + TR_PAGE_MONTHS)}>Meer laden ({hiddenMonths} {hiddenMonths === 1 ? 'maand' : 'maanden'})</Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="tr-page">
      {header}
      {isMobile && (
        <Segmented ariaLabel="Weergave" full pill value={view} onChange={setView}
          options={[{ value: 'lijst', label: 'Lijst', testId: 'tx-view-lijst' }, { value: 'maand', label: 'Per maand', testId: 'tx-view-maand' }]} />
      )}
      {isMobile ? mobileFilters : desktopFilters}
      {all.length > 0 && summary}
      {body}
    </div>
  );
}

Object.assign(window, { TransactiesScreen, TxList });
