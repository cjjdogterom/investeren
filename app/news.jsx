// Nieuws: koppen uit meerdere bronnen (via de koersen-worker), de grootste bewegers in de 500 grootste beursbedrijven
// ter wereld en meldingen op de iPhone (via de gratis app ntfy) bij een harde daling of stijging.
const { useState: nwUseState, useEffect: nwUseEffect, useMemo: nwUseMemo, useRef: nwUseRef } = React;

injectStyles('news', `
.nw-page { display: grid; gap: 16px; min-width: 0; padding: 20px 24px 48px; }
.nw-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 20px; align-items: start; }
.nw-aside { display: grid; gap: 16px; position: sticky; top: calc(var(--topbar-h, 56px) + 16px); }
.nw-head { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.nw-head h1 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -0.01em; }
.nw-head__meta { color: var(--fg-muted); font-size: 13px; }
.nw-head__sp { flex: 1; }
.nw-chips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.nw-chips::-webkit-scrollbar { display: none; }
.nw-chips > * { flex-shrink: 0; }
.nw-feed { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-card); overflow: clip; }
.nw-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 14px; padding: 14px 16px; color: inherit; text-decoration: none; border-top: 1px solid var(--border); }
.nw-item:first-child { border-top: 0; }
.nw-item:hover { background: var(--surface-2); }
.nw-item:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.nw-src { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--fg-muted); margin-bottom: 4px; min-width: 0; }
.nw-src b { color: var(--fg); font-weight: 600; white-space: nowrap; }
.nw-mono { width: 18px; height: 18px; border-radius: 5px; display: inline-grid; place-items: center; font-size: 9.5px; font-weight: 700; color: #fff; flex-shrink: 0; letter-spacing: -0.02em; }
.nw-title { font-size: 15px; font-weight: 600; line-height: 1.35; color: var(--fg); margin: 0; text-wrap: pretty; }
.nw-sum { margin: 4px 0 0; font-size: 13px; line-height: 1.45; color: var(--fg-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.nw-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 8px; }
.nw-tag { font-size: 11.5px; font-weight: 600; padding: 2px 7px; border-radius: var(--r-pill, 999px); background: var(--accent-soft, var(--surface-2)); color: var(--fg); }
.nw-thumb { width: 92px; height: 64px; border-radius: 8px; object-fit: cover; background: var(--surface-2); align-self: start; }
.nw-empty { padding: 28px 16px; text-align: center; color: var(--fg-muted); font-size: 13.5px; }
.nw-more { display: flex; justify-content: center; padding: 10px; border-top: 1px solid var(--border); }

.nw-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-card); overflow: clip; }
.nw-card__h { display: flex; align-items: center; gap: 8px; padding: 14px 16px 10px; }
.nw-card__h h2 { margin: 0; font-size: 14.5px; font-weight: 650; white-space: nowrap; }
.nw-card__h small { display: block; color: var(--fg-muted); font-size: 12px; font-weight: 400; }
.nw-card__sp { flex: 1; }
.nw-card__b { padding: 0 16px 14px; }
.nw-card__foot { padding: 10px 16px; border-top: 1px solid var(--border); font-size: 12px; color: var(--fg-muted); }
.nw-mv { display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; align-items: center; gap: 10px; width: 100%; padding: 8px 16px; border: 0; border-top: 1px solid var(--border); background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.nw-mv:hover { background: var(--surface-2); }
.nw-mv[aria-pressed="true"] { background: var(--surface-2); box-shadow: inset 3px 0 0 var(--accent); }
.nw-rank { font-size: 11px; color: var(--fg-subtle); font-variant-numeric: tabular-nums; text-align: right; }
.nw-mv__n { font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nw-mv__s { font-size: 11.5px; color: var(--fg-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 5px; }
.nw-live { width: 6px; height: 6px; border-radius: 50%; background: var(--gain); display: inline-block; }
.nw-chg { font-size: 13px; font-weight: 650; font-variant-numeric: tabular-nums; padding: 3px 8px; border-radius: 7px; min-width: 64px; text-align: right; }
.nw-chg--neg { color: var(--loss); background: color-mix(in srgb, var(--loss) 12%, transparent); }
.nw-chg--pos { color: var(--gain); background: color-mix(in srgb, var(--gain) 12%, transparent); }

.nw-set { display: grid; gap: 12px; }
.nw-row { display: flex; align-items: center; gap: 10px; justify-content: space-between; font-size: 13.5px; }
.nw-row > span { white-space: nowrap; }
.nw-set .switch { width: 100%; }
.nw-steps { margin: 0; padding-left: 18px; font-size: 13px; color: var(--fg-muted); display: grid; gap: 6px; }
.nw-steps b { color: var(--fg); }
.nw-topic { display: flex; align-items: center; gap: 6px; padding: 6px 8px 6px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface-2); font: 600 13px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; }
.nw-topic code { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.nw-note { font-size: 12px; color: var(--fg-muted); line-height: 1.45; margin: 0; }
.nw-alert { padding: 9px 16px; border-top: 1px solid var(--border); font-size: 12.5px; display: grid; gap: 2px; }
.nw-alert__top { display: flex; gap: 8px; align-items: baseline; }
.nw-alert__top b { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nw-alert a { color: var(--fg-muted); text-decoration: none; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.nw-alert a:hover { color: var(--fg); text-decoration: underline; }
.nw-alert time { color: var(--fg-subtle); font-size: 11.5px; }

@media (max-width: 1100px) { .nw-grid { grid-template-columns: minmax(0, 1fr); } .nw-aside { position: static; } }
@media (max-width: 767.98px) {
  .nw-page { gap: 12px; padding: 12px 16px 24px; }
  .nw-item { padding: 12px 14px; gap: 10px; }
  .nw-thumb { width: 72px; height: 54px; }
  .nw-title { font-size: 14.5px; }
}
`);

const NW_CFG_ID = 'nieuws-config';
const NW_SRC_COLORS = {
  'CNBC': '#005594', 'MarketWatch': '#2b6d3c', 'Seeking Alpha': '#f47c20', 'Investing.com': '#e2a400', 'Bloomberg': '#1f1f1f',
  'Financial Times': '#c9806b', 'NOS Economie': '#e61e14', 'Yahoo Finance': '#6001d2', 'Nasdaq': '#0090ba',
};
const NW_NTFY_APP = 'https://apps.apple.com/app/ntfy/id1625396347';

function nwAgo(iso) {
  if (!iso) return '';
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (s < 90) return 'zojuist';
  if (s < 3600) return `${Math.round(s / 60)} min`;
  if (s < 86400) return `${Math.round(s / 3600)} u`;
  if (s < 2 * 86400) return 'gisteren';
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}
function nwPct(v) { return (v < 0 ? '−' : '+') + Math.abs(v).toFixed(1).replace('.', ',') + '%'; }
function nwMono(name) {
  const n = String(name || '?');
  const words = n.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : n.slice(0, 2)).toUpperCase();
}
function nwColor(name) {
  if (NW_SRC_COLORS[name]) return NW_SRC_COLORS[name];
  let h = 0; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h} 45% 42%)`;
}
function nwRandomTopic() {
  const a = new Uint8Array(9);
  (window.crypto || window.msCrypto).getRandomValues(a);
  return 'investeren-' + Array.from(a, b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
}

// Trading 212 gebruikt voor Meta nog de oude ticker FB; nieuwsbronnen kennen het bedrijf als META.
const NW_ALIAS = { FB: 'META' };
const NW_ALIAS_BACK = Object.fromEntries(Object.entries(NW_ALIAS).map(([a, b]) => [b, a]));
// Aandelen die je nu hebt (Trading 212: netto aantal > 0) plus de CFD-symbolen.
function nwHeldSymbols(app) {
  const qty = {};
  for (const t of (app.state && app.state.transactions) || []) {
    if (!isStockTx(t)) continue;
    const s = normalizeTicker(t.instrument);
    qty[s] = (qty[s] || 0) + (t.type === 'verkoop' ? -1 : 1) * (+t.quantity || 0);
  }
  const held = Object.keys(qty).filter(s => qty[s] > 1e-6).map(s => NW_ALIAS[s] || s);
  const cfd = cfdSymbolsOf((app.state && app.state.parties) || []);
  return [...new Set([...cfd, ...held])].slice(0, 16);
}

function nwUseFetch(url, everyMs) {
  const [st, setSt] = nwUseState({ data: null, loading: true, error: null });
  const [tick, setTick] = nwUseState(0);
  nwUseEffect(() => {
    if (!url) return undefined;
    let dead = false;
    setSt(s => ({ ...s, loading: true }));
    fetch(url, { cache: 'no-store' }).then(r => r.json().then(j => { if (!r.ok) throw new Error(j.error || r.status); return j; }))
      .then(j => { if (!dead) setSt({ data: j, loading: false, error: null }); })
      .catch(e => { if (!dead) setSt(s => ({ ...s, loading: false, error: e.message || 'Ophalen mislukt' })); });
    return () => { dead = true; };
  }, [url, tick]);
  nwUseEffect(() => {
    const id = setInterval(() => { if (!document.hidden) setTick(t => t + 1); }, everyMs);
    const onVis = () => { if (!document.hidden) setTick(t => t + 1); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [everyMs]);
  return { ...st, reload: () => setTick(t => t + 1) };
}

function NwArticle({ it, names }) {
  const src = it.source || it.via;
  return (
    <a className="nw-item" href={it.link} target="_blank" rel="noopener noreferrer">
      <div style={{ minWidth: 0 }}>
        <div className="nw-src">
          <span className="nw-mono" style={{ background: nwColor(src) }} aria-hidden="true">{nwMono(src)}</span>
          <b>{src}</b>
          {it.time && <span>· {nwAgo(it.time)}</span>}
          {it.sources && it.sources.length > 1 && <span title={it.sources.join(', ')}>· {it.sources.length} bronnen</span>}
        </div>
        <p className="nw-title">{it.title}</p>
        {it.summary && <p className="nw-sum">{it.summary}</p>}
        {it.symbols && it.symbols.length > 0 && (
          <div className="nw-tags">{it.symbols.map(s => <span key={s} className="nw-tag">{names[s] || s}</span>)}</div>
        )}
      </div>
      {it.image ? <img className="nw-thumb" src={it.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = 'none'; }} /> : <span />}
    </a>
  );
}

function NwMovers({ movers, focus, onFocus, isMobile }) {
  const [side, setSide] = nwUseState('losers');
  const [all, setAll] = nwUseState(false);
  const list = (movers && movers[side]) || [];
  const shown = all ? list : list.slice(0, isMobile ? 8 : 10);
  return (
    <section className="nw-card" aria-label="Grote bewegers">
      <div className="nw-card__h">
        <div><h2>Grote bewegers</h2><small>500 grootste bedrijven ter wereld</small></div><span className="nw-card__sp" />
        <Segmented size="sm" ariaLabel="Dalers of stijgers" value={side} onChange={setSide}
          options={[{ value: 'losers', label: 'Dalers' }, { value: 'gainers', label: 'Stijgers' }]} />
      </div>
      {!movers && <div className="nw-empty">Koersen worden opgehaald…</div>}
      {shown.map(m => (
        <button key={m.symbol} type="button" className="nw-mv" aria-pressed={focus === m.symbol}
          onClick={() => onFocus(focus === m.symbol ? null : m)} title={`Nieuws over ${m.name}`}>
          <span className="nw-rank">#{m.rank}</span>
          <span style={{ minWidth: 0 }}>
            <div className="nw-mv__n">{m.name}</div>
            <div className="nw-mv__s">{m.live && <span className="nw-live" title="Beurs open" />}{m.symbol} · {m.country}</div>
          </span>
          <span className={'nw-chg ' + (m.chg < 0 ? 'nw-chg--neg' : 'nw-chg--pos')}>{nwPct(m.chg)}</span>
        </button>
      ))}
      {list.length > shown.length && <div className="nw-more"><Button size="sm" variant="ghost" onClick={() => setAll(true)}>Toon alle {list.length}</Button></div>}
      {movers && (
        <div className="nw-card__foot">
          {movers.count} van 500 koersen · bijgewerkt {nwAgo(movers.asOf)} · groene stip = beurs nu open. Tik op een bedrijf voor het nieuws.
        </div>
      )}
    </section>
  );
}

function NwAlertsCard({ app, alerts }) {
  const client = nwUseMemo(() => (app.supabaseConfig ? getSupabaseClient(app.supabaseConfig) : null), [app.supabaseConfig]);
  const [cfg, setCfg] = nwUseState(null);
  const [busy, setBusy] = nwUseState(false);
  nwUseEffect(() => {
    if (!client) { setCfg({}); return; }
    client.from('portfolio').select('data').eq('id', NW_CFG_ID).maybeSingle()
      .then(({ data }) => setCfg((data && data.data) || {}), () => setCfg({}));
  }, [client]);
  const save = async patch => {
    const next = { ...(cfg || {}), ...patch, updatedAt: new Date().toISOString() };
    setCfg(next);
    if (!client) { app.toast && app.toast('Geen verbinding met de database'); return; }
    const { error } = await client.from('portfolio').upsert({ id: NW_CFG_ID, data: next });
    if (error) app.toast && app.toast('Opslaan mislukt: ' + error.message);
  };
  const test = async () => {
    if (!cfg || !cfg.ntfyTopic) return;
    setBusy(true);
    try {
      const r = await fetch('https://ntfy.sh/', { method: 'POST', body: JSON.stringify({
        topic: cfg.ntfyTopic, title: '📉 Testmelding Investeren', message: 'Zo ziet een melding eruit als een van de 500 grootste bedrijven hard daalt.',
        tags: ['chart_with_downwards_trend'], click: location.href.split('#')[0] + '#/nieuws',
      }) });
      app.toast && app.toast(r.ok ? 'Testmelding verstuurd' : 'Versturen mislukt');
    } catch (e) { app.toast && app.toast('Versturen mislukt'); }
    setBusy(false);
  };
  const copy = () => { try { navigator.clipboard.writeText(cfg.ntfyTopic); app.toast && app.toast('Gekopieerd'); } catch (e) { /* ignore */ } };
  const on = cfg && cfg.enabled !== false;
  const step = (cfg && +cfg.dropPct) || 5;
  return (
    <section className="nw-card" aria-label="Meldingen">
      <div className="nw-card__h"><Icon name="bell" size={16} /><h2>Meldingen op je iPhone</h2></div>
      <div className="nw-card__b nw-set">
        {!cfg ? <p className="nw-note">Laden…</p> : <>
          <p className="nw-note">Elke 10 minuten worden de 500 grootste beursbedrijven ter wereld gecontroleerd, ook als de app dicht is. Daalt er een hard, dan krijg je een melding met het laatste nieuwsbericht erbij. Bij elke volgende stap (bijv. −5%, −10%, −15%) opnieuw.</p>
          <Switch label="Meldingen aan" checked={on} onChange={v => save({ enabled: v })} />
          <div className="nw-row"><span>Melden vanaf</span>
            <Segmented size="sm" ariaLabel="Drempel" value={String(step)} onChange={v => save({ dropPct: +v, risePct: +v })}
              options={['3', '5', '7', '10'].map(v => ({ value: v, label: '−' + v + '%' }))} /></div>
          <Switch label={`Ook bij harde stijgers (+${step}%)`} checked={!!cfg.rises} onChange={v => save({ rises: v, risePct: step })} />
          {!cfg.ntfyTopic ? (
            <Button variant="primary" icon="bell" onClick={() => save({ ntfyTopic: nwRandomTopic(), enabled: true })}>iPhone koppelen</Button>
          ) : (
            <>
              <ol className="nw-steps">
                <li>Installeer de gratis app <a href={NW_NTFY_APP} target="_blank" rel="noopener noreferrer"><b>ntfy</b></a> uit de App Store en sta meldingen toe.</li>
                <li>Tik in ntfy op <b>+</b> en abonneer op dit onderwerp (server ntfy.sh):</li>
              </ol>
              <div className="nw-topic"><code>{cfg.ntfyTopic}</code><IconButton icon="copy" size="sm" label="Kopieer onderwerp" onClick={copy} /></div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button size="sm" onClick={test} disabled={busy}>Testmelding sturen</Button>
                <Button size="sm" variant="ghost" onClick={() => save({ ntfyTopic: nwRandomTopic() })}>Nieuw onderwerp</Button>
              </div>
              <p className="nw-note">Het onderwerp werkt als adres: wie het kent, kan je meldingen ook zien. Deel het niet.</p>
            </>
          )}
          <p className="nw-note">Een melding is informatie over een koersbeweging, geen advies om te kopen, verkopen of short te gaan.</p>
        </>}
      </div>
      {alerts && alerts.length > 0 && <>
        <div className="nw-card__h" style={{ borderTop: '1px solid var(--border)' }}><h2>Recente meldingen</h2></div>
        {alerts.slice(0, 8).map((a, i) => (
          <div key={i} className="nw-alert">
            <div className="nw-alert__top"><b>{a.name}</b><span className={'nw-chg ' + (a.chg < 0 ? 'nw-chg--neg' : 'nw-chg--pos')} style={{ minWidth: 0, padding: '1px 6px' }}>{nwPct(a.chg)}</span><time>{nwAgo(a.at)}</time></div>
            {a.headline ? <a href={a.link} target="_blank" rel="noopener noreferrer">{a.headline}</a> : <span className="nw-note">Geen nieuwsbericht gevonden</span>}
          </div>
        ))}
      </>}
    </section>
  );
}

function NieuwsScreen({ app }) {
  const isMobile = app.isMobile;
  const q = (app.route && app.route.query) || {};
  const held = nwUseMemo(() => nwHeldSymbols(app), [app.state && app.state.transactions, app.state && app.state.parties]); // eslint-disable-line
  const quotes = app.stockQuotes || {};
  const [focus, setFocus] = nwUseState(q.s ? { symbol: q.s, name: q.s } : null);   // bedrijf uit de bewegers-lijst
  nwUseEffect(() => { if (q.s) setFocus(f => (f && f.symbol === q.s ? f : { symbol: q.s, name: q.s })); }, [q.s]);
  const [filter, setFilter] = nwUseState(q.s ? q.s : 'alles');   // 'alles' | 'mijn' | symbool
  const [tab, setTab] = nwUseState('nieuws');
  const [limit, setLimit] = nwUseState(40);

  const syms = [...new Set([...(focus ? [focus.symbol] : []), ...held])].slice(0, 16);
  const names = {};
  syms.forEach(s => { const qq = quotes[s] || quotes[NW_ALIAS_BACK[s]]; const qn = qq && qq.name; names[s] = (focus && focus.symbol === s && focus.name !== s) ? focus.name : (qn || s); });
  const shortName = s => String(names[s] || s).replace(/,?\s+(Inc|Corp(oration)?|N\.?V\.?|plc|Ltd|Limited|Holding(s)?|Group|SE|AG|S\.?A\.?|Co)\.?$/i, '');
  const newsUrl = syms.length || true
    ? `${STOCK_API_URL}/nieuws?s=${encodeURIComponent(syms.join(','))}&n=${encodeURIComponent(syms.map(shortName).join('|'))}`
    : null;
  const news = nwUseFetch(newsUrl, 5 * 60 * 1000);
  const mv = nwUseFetch(`${STOCK_API_URL}/bewegers`, 2 * 60 * 1000);

  const items = (news.data && news.data.items) || [];
  const shown = items.filter(it => filter === 'alles' ? true : filter === 'mijn' ? it.symbols.some(s => held.includes(s)) : it.symbols.includes(filter));
  const counts = {};
  items.forEach(it => it.symbols.forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
  const srcCount = news.data ? Object.values(news.data.sources || {}).filter(n => n > 0).length : 0;
  const nameMap = Object.fromEntries(syms.map(s => [s, shortName(s)]));

  const onFocus = m => {
    if (!m) { setFocus(null); setFilter('alles'); app.navigate('/nieuws', { replace: true }); return; }
    setFocus(m); setFilter(m.symbol); setTab('nieuws');
    app.navigate('/nieuws?s=' + encodeURIComponent(m.symbol), { replace: true });
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { /* ignore */ }
  };

  const chips = (
    <div className="nw-chips" role="group" aria-label="Filter">
      <Chip active={filter === 'alles'} onClick={() => setFilter('alles')} count={items.length}>Alles</Chip>
      {held.length > 0 && <Chip active={filter === 'mijn'} onClick={() => setFilter('mijn')}>Mijn aandelen</Chip>}
      {syms.filter(s => counts[s] > 0 || filter === s).map(s => <Chip key={s} active={filter === s} onClick={() => setFilter(s)} count={counts[s] || 0}>{nameMap[s]}</Chip>)}
    </div>
  );
  const feed = (
    <div className="nw-feed">
      {news.loading && !news.data && <div className="nw-empty">Nieuws wordt opgehaald uit {9 + Math.min(syms.length, 8)} bronnen…</div>}
      {news.error && !news.data && <div className="nw-empty">Nieuws ophalen mislukt ({news.error}). <Button size="sm" variant="ghost" onClick={news.reload}>Opnieuw</Button></div>}
      {news.data && shown.length === 0 && <div className="nw-empty">Geen recente berichten{filter !== 'alles' ? ' voor dit filter' : ''}.</div>}
      {shown.slice(0, limit).map(it => <NwArticle key={it.link} it={it} names={nameMap} />)}
      {shown.length > limit && <div className="nw-more"><Button size="sm" variant="ghost" onClick={() => setLimit(l => l + 40)}>Meer berichten</Button></div>}
    </div>
  );
  const header = (
    <div className="nw-head">
      {!isMobile && <h1>Nieuws</h1>}
      <span className="nw-head__meta">{news.data ? `${items.length} berichten uit ${srcCount} bronnen · ${nwAgo(news.data.fetchedAt)}` : ''}</span>
      <span className="nw-head__sp" />
      <IconButton icon="refresh-cw" label="Vernieuwen" onClick={() => { news.reload(); mv.reload(); }} />
    </div>
  );
  const moversCard = <NwMovers movers={mv.data && mv.data.movers} focus={focus && focus.symbol} onFocus={onFocus} isMobile={isMobile} />;
  const alertsCard = <NwAlertsCard app={app} alerts={mv.data && mv.data.alerts} />;

  if (isMobile) {
    return (
      <div className="nw-page">
        <Segmented ariaLabel="Onderdeel" full pill value={tab} onChange={setTab}
          options={[{ value: 'nieuws', label: 'Nieuws' }, { value: 'bewegers', label: 'Bewegers' }, { value: 'meldingen', label: 'Meldingen' }]} />
        {tab === 'nieuws' && <>{header}{chips}{feed}</>}
        {tab === 'bewegers' && moversCard}
        {tab === 'meldingen' && alertsCard}
      </div>
    );
  }
  return (
    <div className="nw-page">
      {header}
      <div className="nw-grid">
        <div style={{ display: 'grid', gap: 12, minWidth: 0 }}>{chips}{feed}</div>
        <aside className="nw-aside">{moversCard}{alertsCard}</aside>
      </div>
    </div>
  );
}

Object.assign(window, { NieuwsScreen });
