// Charts (F2). Pure presentational SVG + HTML overlays. Tokens only; CSS via injectStyles('charts').

injectStyles('charts', `
.ch-root { position: relative; width: 100%; user-select: none; -webkit-user-select: none; }
.ch-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; display: block; }
.ch-svg * { vector-effect: non-scaling-stroke; }
.ch-plot { position: absolute; left: 0; top: 0; touch-action: pan-y; outline: none; }
.ch-plot:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
.ch-fade { animation: ch-fade var(--d-2) var(--ease); }
@keyframes ch-fade { from { opacity: .3; } to { opacity: 1; } }
.ch-ylab { position: absolute; right: 0; width: 48px; transform: translateY(-50%); text-align: right; font: 500 11px/14px var(--font); letter-spacing: .01em; color: var(--fg-subtle); font-variant-numeric: tabular-nums; white-space: nowrap; pointer-events: none; }
.ch-ylab--in { right: 4px; width: auto; transform: translateY(calc(-100% - 3px)); }
.ch-xaxis { position: absolute; left: 0; height: 22px; pointer-events: none; }
.ch-xlab { position: absolute; top: 5px; transform: translateX(-50%); font: 500 11px/14px var(--font); letter-spacing: .01em; color: var(--fg-subtle); white-space: nowrap; transition: opacity var(--d-1) var(--ease); }
.ch-xlab--start { transform: none; }
.ch-xlab--end { transform: translateX(-100%); }
.ch-xaxis--dim .ch-xlab { opacity: .3; }
.ch-flag { position: absolute; top: 2px; padding: 2px 6px; border-radius: 4px; background: var(--accent); color: var(--on-accent); font: 550 11px/14px var(--font); white-space: nowrap; transform: translateX(-50%); font-variant-numeric: tabular-nums; }
.ch-flag--l { transform: none; }
.ch-flag--r { transform: translateX(-100%); }
.ch-cross { position: absolute; top: 0; width: 1px; margin-left: -0.5px; background: var(--accent); pointer-events: none; }
.ch-dim { position: absolute; top: 0; right: 0; background: color-mix(in srgb, var(--surface) 58%, transparent); pointer-events: none; }
.ch-beacon { position: absolute; width: 9px; height: 9px; margin: -4.5px 0 0 -4.5px; border-radius: 50%; box-shadow: 0 0 0 2px var(--surface); pointer-events: none; }
.ch-end { position: absolute; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: var(--fg); box-shadow: 0 0 0 2px var(--surface); pointer-events: none; }
.ch-end--live::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 1.5px solid var(--fg); opacity: 0; animation: ch-pulse 2.4s var(--ease) infinite; }
@keyframes ch-pulse { 0% { transform: scale(.6); opacity: .55; } 70% { transform: scale(1.8); opacity: 0; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .ch-end--live::after { display: none; } }
.ch-marker { position: absolute; width: 16px; height: 16px; margin: -8px 0 0 -8px; padding: 0; border: 0; background: none; display: flex; align-items: center; justify-content: center; cursor: default; z-index: 1; }
.ch-marker__d { width: 7px; height: 7px; background: var(--fg-muted); transform: rotate(45deg); box-shadow: 0 0 0 2px var(--surface); }
.ch-marker__o { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--fg-muted); background: var(--surface); }
.ch-empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center; padding: 0 16px; color: var(--fg-subtle); font-size: 12.5px; }
.ch-twin { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.ch-twin:focus-within, .ch-twin[open] { position: static; width: auto; height: auto; overflow: visible; clip: auto; white-space: normal; margin-top: 8px; font-size: 12.5px; }
.ch-twin summary { cursor: pointer; color: var(--fg-muted); }
.ch-twin table { margin-top: 6px; }
.ch-spark { display: block; overflow: visible; }
.ch-spark-empty { display: inline-block; color: var(--fg-subtle); font-size: 12px; text-align: center; }
.ch-alloc { display: flex; gap: 2px; width: 100%; overflow: hidden; }
.ch-alloc__seg { position: relative; min-width: 2px; height: 100%; border: 0; padding: 0; display: flex; align-items: center; justify-content: center; forced-color-adjust: none; }
button.ch-alloc__seg { cursor: pointer; }
button.ch-alloc__seg:hover { filter: brightness(1.08); }
.ch-alloc__lab { font: 600 11px/1 var(--font); color: #fff; text-shadow: 0 0 2px rgb(0 0 0 / .45); font-variant-numeric: tabular-nums; pointer-events: none; }
.ch-bullet { position: relative; width: 100%; }
.ch-bullet__track { position: absolute; inset: 0; background: var(--surface-3); border-radius: 3px; overflow: hidden; }
.ch-bullet__fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px; forced-color-adjust: none; }
.ch-bullet__tol { position: absolute; top: 0; bottom: 0; background: color-mix(in srgb, var(--fg) 8%, transparent); }
.ch-bullet__tick { position: absolute; top: -4px; bottom: -4px; width: 2px; margin-left: -1px; background: var(--fg); border-radius: 1px; }
.ch-bullet__conn { position: absolute; top: 50%; height: 2px; margin-top: -1px; background: var(--fg-muted); }
.ch-bullet__dot { position: absolute; top: 50%; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; }
.ch-div { display: flex; flex-direction: column; gap: 2px; font-size: 12.5px; }
.ch-div__row { display: grid; grid-template-columns: var(--ch-div-cols); align-items: center; border-radius: 4px; }
.ch-div__cell { min-height: 26px; display: flex; align-items: center; }
.ch-div__label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--fg); padding-right: 8px; min-width: 0; }
.ch-div__label > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ch-div__neg { justify-content: flex-end; border-right: 1px solid var(--border-strong); }
.ch-div__pos { justify-content: flex-start; }
.ch-div__bar { height: 10px; min-width: 2px; position: relative; forced-color-adjust: none; }
.ch-div__bar--gain { background: var(--gain-fill); border-radius: 0 3px 3px 0; }
.ch-div__bar--loss { background: var(--loss-fill); border-radius: 3px 0 0 3px; }
.ch-div__brk { position: absolute; top: 50%; transform: translateY(-50%); font: 700 11px/1 var(--font); color: var(--surface); }
.ch-div__val { justify-content: flex-end; font-weight: 550; font-variant-numeric: tabular-nums; white-space: nowrap; }
.ch-div__sep { height: 1px; background: var(--border); margin: 4px 0; }
.ch-div__row--click { cursor: pointer; }
.ch-div__row--click:hover { background: var(--surface-2); }
.ch-div__row--click:hover .ch-div__label { text-decoration: underline; text-underline-offset: 2px; }

.ch-mfb { position: relative; width: 100%; }
.ch-mfb__cols { position: absolute; left: 0; right: 0; top: 0; display: flex; }
.ch-mfb__col { position: relative; flex: 1; min-width: 0; height: 100%; outline: none; }
.ch-mfb__col:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; border-radius: 2px; }
.ch-mfb__bar { position: absolute; left: 0; right: 0; border-radius: 2px; }
.ch-mfb__bar--pos { background: var(--cap-inleg); }
.ch-mfb__bar--cur { background: var(--fg); }
.ch-mfb__bar--neg { border: 1.25px solid var(--fg-subtle); background: transparent; }
.ch-mfb__bar--stub { height: 1.5px !important; background: var(--border-strong); }
.ch-mfb__base { position: absolute; left: 0; right: 0; height: 1px; background: var(--border-strong); }
.ch-mfb__avg { position: absolute; left: 0; right: 0; height: 1px; background: var(--accent); pointer-events: none; }
.ch-mfb__avglab { position: absolute; right: 0; transform: translateY(-100%); margin-top: -2px; padding: 1px 6px; border-radius: 4px; background: var(--accent-soft); color: var(--accent); font: 550 11px/14px var(--font); font-variant-numeric: tabular-nums; white-space: nowrap; }
.ch-mfb__xl { position: absolute; left: 0; right: 0; height: 18px; display: flex; }
.ch-mfb__xl span { flex: 1; text-align: center; font: 500 11px/18px var(--font); color: var(--fg-subtle); min-width: 0; overflow: visible; white-space: nowrap; }
.ch-tip { position: absolute; z-index: 3; padding: 6px 8px; border-radius: 8px; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-overlay); font: 400 12px/16px var(--font); color: var(--fg); pointer-events: none; white-space: nowrap; font-variant-numeric: tabular-nums; }
.ch-tip__row { display: flex; align-items: center; gap: 6px; }
.ch-tip__row b { font-weight: 550; margin-left: auto; padding-left: 12px; }
.ch-tip__sw { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.ch-cap { display: flex; gap: 2px; width: 100%; }
.ch-cap__seg { height: 100%; border-radius: 4px; min-width: 2px; forced-color-adjust: none; }
.ch-cap__inleg { background: var(--cap-inleg); }
.ch-cap__gain { background: var(--gain-fill); }
.ch-cap__loss { background: repeating-linear-gradient(45deg, var(--loss-fill) 0 2px, transparent 2px 4px); box-shadow: inset 0 0 0 1px var(--loss-fill); }
.ch-pen-lab { position: absolute; font: 500 11px/14px var(--font); color: var(--fg-muted); white-space: nowrap; pointer-events: none; font-variant-numeric: tabular-nums; }
.ch-pen-dot { position: absolute; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; border: 1.5px solid var(--fg); background: var(--surface); pointer-events: none; }
.ch-pen-dot--now { background: var(--fg); }
@media (max-width: 767.98px) {
  .ch-mfb__xl span { font-size: 11px; }
}
`);

// ===== Helpers (file-local) =====
const CH_MASK = '€ •••••';

function chCx(...p) { return p.filter(Boolean).join(' '); }

function chUid(raw) { return 'ch' + String(raw).replace(/[^a-zA-Z0-9_-]/g, ''); }

function chNiceTicks(lo, hi, n = 4) {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { lo: 0, hi: 1, ticks: [0, 1] };
  if (hi < lo) { const t = lo; lo = hi; hi = t; }
  if (hi - lo < 1e-9) {
    const pad = Math.abs(hi) * 0.1 || 1;
    hi += pad;
    if (lo !== 0) lo -= pad;
  }
  const raw = (hi - lo) / Math.max(1, n - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const mult = [1, 2, 2.5, 5, 10].find(s => s * mag >= raw * 0.999) || 10;
  const step = mult * mag;
  const nlo = Math.floor(lo / step + 1e-9) * step;
  const nhi = Math.ceil(hi / step - 1e-9) * step;
  const ticks = [];
  for (let v = nlo; v <= nhi + step * 1e-6; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : +v.toPrecision(12));
  return { lo: nlo, hi: nhi, ticks };
}

function chMonthTicks(dates, maxLabels = 6) {
  const n = dates ? dates.length : 0;
  if (n < 2) return [];
  const first = dates[0], last = dates[n - 1];
  const span = daysBetween(first, last);
  const sameYear = first.slice(0, 4) === last.slice(0, 4);
  let cands = [];
  if (span <= 40) {
    dates.forEach((dd, i) => { if (new Date(dd + 'T00:00:00Z').getUTCDay() === 1) cands.push({ index: i, label: `${+dd.slice(8, 10)} ${MONTHS_NL[+dd.slice(5, 7) - 1]}` }); });
    if (cands.length > maxLabels) { const k = Math.ceil(cands.length / maxLabels); cands = cands.filter((_, j) => j % k === 0); }
  } else {
    const starts = [];
    dates.forEach((dd, i) => {
      if (i === 0 ? false : dd.slice(0, 7) !== dates[i - 1].slice(0, 7)) starts.push({ i, y: +dd.slice(0, 4), m: +dd.slice(5, 7) });
    });
    let pick = starts;
    for (const step of [1, 2, 3, 6, 12]) {
      pick = starts.filter(s => ((s.y * 12 + s.m - 1) % step) === 0);
      if (pick.length <= maxLabels) break;
    }
    cands = pick.map(s => ({ index: s.i, label: sameYear ? MONTHS_NL[s.m - 1] : fmtAxisMonth(`${s.y}-${String(s.m).padStart(2, '0')}-01`) }));
  }
  return cands.filter(c => { const x = c.index / (n - 1); return x >= 0.04 && x <= 0.96; });
}

function chPath(xs, ys) {
  let d = '', pen = false;
  for (let k = 0; k < xs.length; k++) {
    const y = ys[k];
    if (y == null || !Number.isFinite(y)) { pen = false; continue; }
    d += (pen ? 'L' : 'M') + xs[k].toFixed(2) + ' ' + y.toFixed(2);
    pen = true;
  }
  return d;
}

function chStepPoints(xs, ys) {
  const pts = [];
  for (let k = 0; k < xs.length; k++) {
    if (ys[k] == null || !Number.isFinite(ys[k])) continue;
    if (pts.length) pts.push([xs[k], pts[pts.length - 1][1]]);
    pts.push([xs[k], ys[k]]);
  }
  return pts;
}

function chStepPath(xs, ys) {
  return chStepPoints(xs, ys).map((p, k) => (k ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('');
}

function chPts(pts) { return pts.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' '); }

function chSampleIdx(n, max) {
  if (n <= max) return Array.from({ length: n }, (_, i) => i);
  const step = Math.ceil(n / max);
  const out = [];
  for (let i = 0; i < n; i += step) out.push(i);
  if (out[out.length - 1] !== n - 1) out.push(n - 1);
  return out;
}

function chPctLabel(v) {
  const r = Math.round(v * 10) / 10;
  const body = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 }).format(Math.abs(r));
  return (r < 0 ? '−' : '') + body + '%';
}

function chMoney(v, privacy, opts) { return privacy ? CH_MASK : fmtMoney(v, opts); }

function chIndexFromEvent(e, el, n) {
  const r = el.getBoundingClientRect();
  if (!r.width || n < 2) return 0;
  const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  return Math.round(f * (n - 1));
}

// ===== PerformanceChart =====
function PerformanceChart({
  dates, primary, secondary = null, kind = 'money', height = 220, baseline = 'zero', markers = null,
  liveDot = 'static', cursor = null, pinned = false, pinnable = false, onCursor, compact = false,
  ariaLabel, valueText, privacy = false, emptyText = 'Nog te weinig historie in deze periode', tableTwin = true,
  className, style, testId,
}) {
  const uid = chUid(React.useId());
  const plotRef = useRef(null);
  const touchRef = useRef(null);
  const n = dates ? dates.length : 0;
  const H = height;
  const gutter = compact ? 0 : 48;
  const hasData = n >= 2 && primary && primary.filter(v => v != null && Number.isFinite(v)).length >= 2;
  const showSecondary = kind === 'money' && Array.isArray(secondary) && secondary.length === n;

  const geo = useMemo(() => {
    if (!hasData) return null;
    let mn = Infinity, mx = -Infinity;
    const scan = arr => { for (const v of arr) if (v != null && Number.isFinite(v)) { if (v < mn) mn = v; if (v > mx) mx = v; } };
    scan(primary);
    if (showSecondary) scan(secondary);
    let lo, hi;
    if (kind === 'pct') { lo = Math.min(0, mn); hi = Math.max(0, mx); }
    else if (baseline === 'auto') { lo = Math.min(mn * 0.92, mn); hi = mx; }
    else { lo = Math.min(0, mn); hi = mx; }
    const nt = chNiceTicks(lo, hi, 4);
    const y = v => H - (v - nt.lo) / (nt.hi - nt.lo || 1) * H;
    const x = i => (n > 1 ? i / (n - 1) * 1000 : 0);
    const idx = chSampleIdx(n, 500);
    const xs = idx.map(x);
    const yp = idx.map(i => (primary[i] == null || !Number.isFinite(primary[i]) ? null : y(primary[i])));
    const ys = showSecondary ? idx.map(i => (secondary[i] == null ? null : y(secondary[i]))) : null;
    const line = chPath(xs, yp);
    const out = { nt, y, x, line, xs, yp };
    const firstX = xs[yp.findIndex(v => v != null)];
    let lastK = yp.length - 1; while (lastK >= 0 && yp[lastK] == null) lastK--;
    const lastX = xs[lastK];
    const fwd = xs.map((xx, k) => [xx, yp[k]]).filter(p => p[1] != null);
    if (showSecondary) {
      const step = chStepPoints(xs, ys);
      out.stepLine = chStepPath(xs, ys);
      if (step.length) {
        const sx0 = step[0][0], sx1 = step[step.length - 1][0];
        out.wash = chPts([...step, [sx1, H], [sx0, H]]);
        out.band = chPts([...fwd, ...step.slice().reverse()]);
        out.clipAbove = chPts([...step, [sx1, -10], [sx0, -10]]);
        out.clipBelow = chPts([...step, [sx1, H + 10], [sx0, H + 10]]);
      }
    } else if (kind === 'pct') {
      const y0 = y(0);
      out.zeroY = y0;
      out.band = chPts([...fwd, [lastX, y0], [firstX, y0]]);
      out.clipAbove = chPts([[0, -10], [1000, -10], [1000, y0], [0, y0]]);
      out.clipBelow = chPts([[0, y0], [1000, y0], [1000, H + 10], [0, H + 10]]);
    }
    out.xticks = compact ? [] : chMonthTicks(dates, 6);
    return out;
  }, [hasData, dates, primary, secondary, showSecondary, kind, baseline, H, n, compact]);

  const lastIdx = useMemo(() => {
    if (!hasData) return -1;
    for (let i = n - 1; i >= 0; i--) if (primary[i] != null && Number.isFinite(primary[i])) return i;
    return -1;
  }, [hasData, primary, n]);

  const emit = (i, opts) => { if (onCursor) onCursor(i, opts); };
  const cur = cursor != null && cursor >= 0 && cursor < n ? cursor : null;

  const onPointerMove = e => {
    if (!hasData) return;
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
      if (pinned) return;
      emit(chIndexFromEvent(e, plotRef.current, n), { pinned: false, source: 'pointer' });
      return;
    }
    const t = touchRef.current;
    if (!t) return;
    const dx = e.clientX - t.x, dy = e.clientY - t.y;
    if (!t.scrub) {
      if (Math.abs(dy) > 6 && Math.abs(dy) > Math.abs(dx)) { clearTimeout(t.timer); touchRef.current = null; return; }
      if (Math.abs(dx) > 6) { t.scrub = true; clearTimeout(t.timer); try { plotRef.current.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } }
    }
    if (t.scrub) {
      const i = chIndexFromEvent(e, plotRef.current, n);
      if (t.lastMonth && dates[i] && dates[i].slice(0, 7) !== t.lastMonth && navigator.vibrate) { try { navigator.vibrate(4); } catch (er) { /* ignore */ } }
      t.lastMonth = dates[i] ? dates[i].slice(0, 7) : t.lastMonth;
      emit(i, { pinned: false, source: 'touch' });
    }
  };
  const onPointerDown = e => {
    if (!hasData || e.pointerType === 'mouse' || e.pointerType === 'pen') return;
    const t = { x: e.clientX, y: e.clientY, scrub: false, lastMonth: null, id: e.pointerId };
    t.timer = setTimeout(() => {
      if (touchRef.current !== t) return;
      t.scrub = true;
      try { plotRef.current.setPointerCapture(t.id); } catch (er) { /* ignore */ }
      emit(chIndexFromEvent({ clientX: t.x }, plotRef.current, n), { pinned: false, source: 'touch' });
    }, 180);
    touchRef.current = t;
  };
  const endTouch = e => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') return;
    const t = touchRef.current;
    touchRef.current = null;
    if (t) { clearTimeout(t.timer); if (t.scrub) emit(null, { pinned: false, source: 'touch' }); }
  };
  const onPointerLeave = e => {
    if ((e.pointerType === 'mouse' || e.pointerType === 'pen') && !pinned) emit(null, { pinned: false, source: 'pointer' });
  };
  const onClick = e => {
    if (!hasData || !pinnable) return;
    if (e.nativeEvent && e.nativeEvent.pointerType === 'touch') return;
    const i = chIndexFromEvent(e, plotRef.current, n);
    emit(i, { pinned: !pinned, source: 'pointer' });
  };
  const onKeyDown = e => {
    if (!hasData) return;
    const base = cur != null ? cur : lastIdx;
    let i = null;
    if (e.key === 'ArrowLeft') i = base - (e.shiftKey ? 30 : 1);
    else if (e.key === 'ArrowRight') i = base + (e.shiftKey ? 30 : 1);
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = n - 1;
    else if (e.key === 'Enter' && pinnable) { e.preventDefault(); emit(base, { pinned: !pinned, source: 'keyboard' }); return; }
    else if (e.key === 'Escape') { if (cur != null) { e.preventDefault(); emit(null, { pinned: false, source: 'keyboard' }); } return; }
    if (i == null) return;
    e.preventDefault();
    emit(Math.max(0, Math.min(n - 1, i)), { pinned, source: 'keyboard' });
  };

  const defaultValueText = i => {
    if (i == null || i < 0) return '';
    const parts = [fmtDateLong(dates[i])];
    const v = primary[i];
    if (kind === 'pct') parts.push(`rendement ${v == null ? '—' : fmtPct(v, { decimals: 1 })}`);
    else {
      parts.push(`waarde ${chMoney(v, privacy)}`);
      if (showSecondary) parts.push(`netto ingelegd ${chMoney(secondary[i], privacy)}`);
    }
    return parts.join(', ');
  };
  const vtIndex = cur != null ? cur : lastIdx;
  const vt = (valueText || defaultValueText)(vtIndex);

  const rootStyle = { height: H + 22, ...style };
  const plotStyle = { right: gutter, height: H };
  if (!hasData) {
    return (
      <div className={chCx('ch-root', className)} style={rootStyle} data-testid={testId} role="img" aria-label={`${ariaLabel}: ${emptyText}`}>
        <div className="ch-empty">{emptyText}</div>
      </div>
    );
  }
  const g = geo;
  const pctX = i => (i / (n - 1)) * 100;
  const pctY = v => (g.y(v) / H) * 100;
  const rangeKey = `${dates[0]}|${n}|${kind}`;
  const tickLabel = t => (kind === 'pct' ? chPctLabel(t) : (privacy ? '' : fmtCompact(t)));
  const curPrimary = cur != null ? primary[cur] : null;
  const curSecondary = cur != null && showSecondary ? secondary[cur] : null;
  const flagSide = cur == null ? '' : (cur / (n - 1) < 0.08 ? 'l' : cur / (n - 1) > 0.92 ? 'r' : '');

  return (
    <div className={chCx('ch-root', className)} style={rootStyle} data-testid={testId}>
      {/* y labels */}
      {g.nt.ticks.map(t => (
        <div key={t} className={chCx('ch-ylab', compact && 'ch-ylab--in')} style={{ top: `${(g.y(t) / H) * H}px` }}>{tickLabel(t)}</div>
      ))}
      <div ref={plotRef} className="ch-plot" style={plotStyle}
        role="slider" tabIndex={0} aria-label={ariaLabel} aria-valuemin={0} aria-valuemax={n - 1}
        aria-valuenow={vtIndex} aria-valuetext={vt}
        onPointerMove={onPointerMove} onPointerDown={onPointerDown} onPointerUp={endTouch} onPointerCancel={endTouch}
        onPointerLeave={onPointerLeave} onClick={onClick} onKeyDown={onKeyDown}>
        <svg className="ch-svg" viewBox={`0 0 1000 ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            {g.clipAbove && <clipPath id={`${uid}-a`}><polygon points={g.clipAbove} /></clipPath>}
            {g.clipBelow && <clipPath id={`${uid}-b`}><polygon points={g.clipBelow} /></clipPath>}
          </defs>
          {g.nt.ticks.map(t => (
            <line key={t} x1="0" x2="1000" y1={g.y(t)} y2={g.y(t)} style={{ stroke: kind === 'pct' && t === 0 ? 'var(--border-strong)' : 'var(--border)', strokeWidth: 1 }} />
          ))}
          <g key={rangeKey} className="ch-fade">
            {g.wash && <polygon points={g.wash} style={{ fill: 'var(--wash-inleg)' }} />}
            {g.band && g.clipAbove && <polygon points={g.band} clipPath={`url(#${uid}-a)`} style={{ fill: 'var(--gain-fill)', fillOpacity: 0.16 }} />}
            {g.band && g.clipBelow && <polygon points={g.band} clipPath={`url(#${uid}-b)`} style={{ fill: 'var(--loss-fill)', fillOpacity: 0.2 }} />}
            {g.stepLine && <path d={g.stepLine} style={{ fill: 'none', stroke: 'var(--fg-subtle)', strokeWidth: 1.5 }} />}
            <path d={g.line} style={{ fill: 'none', stroke: 'var(--fg)', strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' }} />
          </g>
        </svg>
        {/* markers */}
        {!compact && kind === 'money' && Array.isArray(markers) && markers.map((m, k) => {
          if (m.index == null || m.index < 0 || m.index >= n || primary[m.index] == null) return null;
          const tip = `${fmtDateLong(dates[m.index])} · ${privacy ? String(m.label).replace(/€[\s ]?[−\-]?[\d.,]+/g, CH_MASK) : m.label}`;
          return (
            <span key={k} className="ch-marker" title={tip} aria-label={tip} role="img"
              style={{ left: `${pctX(m.index)}%`, top: `${pctY(primary[m.index])}%` }}>
              <span className={m.kind === 'opname' ? 'ch-marker__o' : 'ch-marker__d'} />
            </span>
          );
        })}
        {/* end dot */}
        {liveDot !== 'none' && cur == null && lastIdx >= 0 && (
          <span className={chCx('ch-end', liveDot === 'live' && 'ch-end--live')} style={{ left: `${pctX(lastIdx)}%`, top: `${pctY(primary[lastIdx])}%` }} />
        )}
        {/* crosshair */}
        {cur != null && (
          <>
            <span className="ch-dim" style={{ left: `${pctX(cur)}%`, height: H }} />
            <span className="ch-cross" style={{ left: `${pctX(cur)}%`, height: H }} />
            {curSecondary != null && <span className="ch-beacon" style={{ left: `${pctX(cur)}%`, top: `${pctY(curSecondary)}%`, background: 'var(--fg-subtle)' }} />}
            {curPrimary != null && <span className="ch-beacon" style={{ left: `${pctX(cur)}%`, top: `${pctY(curPrimary)}%`, background: 'var(--fg)' }} />}
          </>
        )}
      </div>
      {/* x axis */}
      <div className={chCx('ch-xaxis', cur != null && 'ch-xaxis--dim')} style={{ top: H, right: gutter }} aria-hidden="true">
        {compact ? (
          <>
            <span className="ch-xlab ch-xlab--start" style={{ left: 0 }}>{fmtDateShort(dates[0], dates[n - 1])}</span>
            <span className="ch-xlab ch-xlab--end" style={{ left: '100%' }}>vandaag</span>
          </>
        ) : g.xticks.map(t => (
          <span key={t.index} className="ch-xlab" style={{ left: `${pctX(t.index)}%` }}>{t.label}</span>
        ))}
        {cur != null && (
          <span className={chCx('ch-flag', flagSide && `ch-flag--${flagSide}`)} style={{ left: `${pctX(cur)}%`, opacity: 1 }}>{fmtDateLong(dates[cur])}</span>
        )}
      </div>
      {tableTwin && <ChTableTwin dates={dates} primary={primary} secondary={showSecondary ? secondary : null} kind={kind} privacy={privacy} top={H + 22} />}
    </div>
  );
}

function ChTableTwin({ dates, primary, secondary, kind, privacy, top }) {
  const [open, setOpen] = useState(false);
  const rows = useMemo(() => {
    if (!open) return [];
    const out = [];
    for (let i = 0; i < dates.length; i++) {
      const last = i === dates.length - 1 || dates[i + 1].slice(0, 7) !== dates[i].slice(0, 7);
      if (last && primary[i] != null) out.push(i);
    }
    return out;
  }, [open, dates, primary]);
  return (
    <details className="ch-twin" style={{ position: open ? 'absolute' : undefined, top, left: 0, right: 0 }}
      onToggle={e => setOpen(e.currentTarget.open)}>
      <summary>Toon als tabel</summary>
      {open && (
        <div style={{ maxHeight: 240, overflow: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Datum</th>
                {kind === 'pct' ? <th scope="col" className="num">Rendement</th> : <>
                  <th scope="col" className="num">Waarde</th>
                  {secondary && <th scope="col" className="num">Netto ingelegd</th>}
                  {secondary && <th scope="col" className="num">Winst</th>}
                </>}
              </tr>
            </thead>
            <tbody>
              {rows.map(i => (
                <tr key={i}>
                  <td>{fmtDateLong(dates[i])}</td>
                  {kind === 'pct' ? <td className="num">{fmtPct(primary[i], { decimals: 1 })}</td> : <>
                    <td className="num">{chMoney(primary[i], privacy)}</td>
                    {secondary && <td className="num">{chMoney(secondary[i], privacy)}</td>}
                    {secondary && <td className="num">{chMoney(primary[i] - secondary[i], privacy, { sign: true })}</td>}
                  </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </details>
  );
}

// ===== Sparkline =====
function Sparkline({ values, width = 76, height = 22, step = false, cursorIndex = null, endTone = 'neutral', className, style, testId }) {
  const clean = (values || []).filter(v => v != null && Number.isFinite(v));
  const distinct = new Set(clean.map(v => Math.round(v * 100))).size;
  if (distinct < 3) return <span className={chCx('ch-spark-empty', className)} style={{ width, ...style }} aria-hidden="true" data-testid={testId}>—</span>;
  const n = values.length;
  const idx = chSampleIdx(n, 61);
  let mn = Infinity, mx = -Infinity;
  for (const v of clean) { if (v < mn) mn = v; if (v > mx) mx = v; }
  const pad = 2.5;
  const x = i => pad + (n > 1 ? i / (n - 1) : 0) * (width - pad * 2);
  const y = v => pad + (1 - (v - mn) / (mx - mn || 1)) * (height - pad * 2);
  const xs = idx.map(x);
  const ys = idx.map(i => (values[i] == null ? null : y(values[i])));
  const d = step ? chStepPath(xs, ys) : chPath(xs, ys);
  let li = n - 1; while (li >= 0 && values[li] == null) li--;
  const endColor = endTone === 'gain' ? 'var(--gain)' : endTone === 'loss' ? 'var(--loss)' : 'var(--fg)';
  const ci = cursorIndex != null && cursorIndex >= 0 && cursorIndex < n && values[cursorIndex] != null ? cursorIndex : null;
  return (
    <svg className={chCx('ch-spark', className)} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={style} data-testid={testId}>
      <path d={d} style={{ fill: 'none', stroke: 'var(--fg-muted)', strokeWidth: 1.3, strokeLinejoin: 'round', strokeLinecap: 'round' }} />
      {li >= 0 && <circle cx={x(li)} cy={y(values[li])} r={2.5} style={{ fill: endColor }} />}
      {ci != null && <circle cx={x(ci)} cy={y(values[ci])} r={3.5} style={{ fill: 'var(--accent)', stroke: 'var(--surface)', strokeWidth: 1 }} />}
    </svg>
  );
}

// ===== AllocationBar =====
function AllocationBar({ segments, height = 10, radius, showLabels = false, onSegmentClick, privacy = false, ariaLabel, className, style, testId }) {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!showLabels || !ref.current) return undefined;
    const el = ref.current;
    const upd = () => setW(el.getBoundingClientRect().width);
    upd();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showLabels]);
  const segs = (segments || []).filter(s => s && s.value > 0);
  const total = segs.reduce((a, s) => a + s.value, 0);
  const r = radius != null ? radius : height / 2.5;
  const tipOf = s => `${s.label} ${fmtPct(total > 0 ? s.value / total * 100 : 0, { decimals: 1, sign: false })} · ${chMoney(s.value, privacy)}`;
  const label = ariaLabel || segs.map(tipOf).join(', ');
  const interactive = typeof onSegmentClick === 'function';
  return (
    <div ref={ref} className={chCx('ch-alloc', className)} style={{ height, borderRadius: r, ...style }} data-testid={testId}
      {...(interactive ? { role: 'group', 'aria-label': ariaLabel || 'Verdeling' } : { role: 'img', 'aria-label': label })}>
      {segs.map(s => {
        const share = total > 0 ? s.value / total * 100 : 0;
        const segPx = w * share / 100;
        const lab = showLabels && share >= 7 && segPx >= 32 ? `${Math.round(share)}%` : null;
        const common = { key: s.key, className: 'ch-alloc__seg', title: tipOf(s), style: { flexGrow: s.value, flexBasis: 0, background: s.color } };
        return interactive
          ? <button type="button" {...common} aria-label={tipOf(s)} onClick={() => onSegmentClick(s)}>{lab && <span className="ch-alloc__lab">{lab}</span>}</button>
          : <span {...common}>{lab && <span className="ch-alloc__lab">{lab}</span>}</span>;
      })}
    </div>
  );
}

// ===== BulletTrack =====
function BulletTrack({ current, target = null, scaleMax, color, tolerance = null, after = null, height = 6, className, style, testId }) {
  const pc = v => `${Math.max(0, Math.min(100, (v / (scaleMax || 1)) * 100))}%`;
  const hasAfter = after != null && Number.isFinite(after);
  return (
    <div className={chCx('ch-bullet', className)} style={{ height, ...style }} aria-hidden="true" data-testid={testId}>
      <div className="ch-bullet__track">
        {target != null && tolerance != null && tolerance > 0 && (
          <span className="ch-bullet__tol" style={{ left: pc(Math.max(0, target - tolerance)), width: `calc(${pc(target + tolerance)} - ${pc(Math.max(0, target - tolerance))})` }} />
        )}
        <span className="ch-bullet__fill" style={{ width: pc(current || 0), background: color, opacity: hasAfter ? 0.45 : 1 }} />
      </div>
      {hasAfter && (
        <>
          <span className="ch-bullet__conn" style={{ left: pc(Math.min(current, after)), width: `calc(${pc(Math.max(current, after))} - ${pc(Math.min(current, after))})` }} />
          <span className="ch-bullet__dot" style={{ left: pc(current), border: '2px solid var(--fg-muted)', background: 'var(--surface)' }} />
          <span className="ch-bullet__dot" style={{ left: pc(after), background: 'var(--fg)' }} />
        </>
      )}
      {target != null && <span className="ch-bullet__tick" style={{ left: pc(target) }} />}
    </div>
  );
}

// ===== DivergingBars =====
function DivergingBars({ rows, mode = 'eur', cap = 100, closedRow = null, onRowClick, privacy = false, className, style, testId }) {
  const sorted = (rows || []).slice().sort((a, b) => (b.value || 0) - (a.value || 0));
  const all = closedRow ? [...sorted, closedRow] : sorted;
  const clampV = v => (mode === 'pct' ? Math.max(-cap, Math.min(cap, v || 0)) : (v || 0));
  const maxPos = Math.max(0, ...all.map(r => clampV(r.value)));
  const maxNeg = Math.max(0, ...all.map(r => -clampV(r.value)));
  let negFrac = maxPos + maxNeg > 0 ? maxNeg / (maxPos + maxNeg) : 0.16;
  negFrac = Math.max(0.16, Math.min(0.84, negFrac));
  const fmtV = v => (mode === 'pct' ? fmtPct(v, { decimals: 1 }) : chMoney(v, privacy, { sign: true }));
  const tone = v => (v > 0.0049 ? 'var(--gain)' : v < -0.0049 ? 'var(--loss)' : 'var(--fg-muted)');
  const renderRow = (r, key, isClosed) => {
    const v = r.value || 0, cv = clampV(v);
    const over = mode === 'pct' && Math.abs(v) > cap;
    const posW = cv > 0 && maxPos > 0 ? (cv / maxPos) * 100 : 0;
    const negW = cv < 0 && maxNeg > 0 ? (-cv / maxNeg) * 100 : 0;
    const click = !isClosed && typeof onRowClick === 'function';
    const rowProps = click ? {
      role: 'button', tabIndex: 0, 'aria-label': `${r.label}: ${fmtV(v)}`,
      onClick: () => onRowClick(r),
      onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(r); } },
    } : {};
    const tip = r.tooltip ? (privacy ? String(r.tooltip).replace(/€[\s ]?[−\-]?[\d.,]+/g, CH_MASK) : r.tooltip) : undefined;
    return (
      <div key={key} className={chCx('ch-div__row', click && 'ch-div__row--click')} title={tip} {...rowProps}>
        <div className="ch-div__cell ch-div__label" style={isClosed ? { color: 'var(--fg-muted)' } : null}><span>{r.label}</span></div>
        <div className="ch-div__cell ch-div__neg">
          {negW > 0 && <span className="ch-div__bar ch-div__bar--loss" style={{ width: `${negW}%` }}>{over && <span className="ch-div__brk" style={{ left: 2 }}>‹</span>}</span>}
        </div>
        <div className="ch-div__cell ch-div__pos">
          {posW > 0 && <span className="ch-div__bar ch-div__bar--gain" style={{ width: `${posW}%` }}>{over && <span className="ch-div__brk" style={{ right: 2 }}>›</span>}</span>}
        </div>
        <div className="ch-div__cell ch-div__val" style={{ color: tone(v) }}>{fmtV(v)}</div>
      </div>
    );
  };
  return (
    <div className={chCx('ch-div', className)} data-testid={testId}
      style={{ '--ch-div-cols': `96px minmax(0, ${negFrac}fr) minmax(0, ${1 - negFrac}fr) 72px`, ...style }}>
      {sorted.map((r, k) => renderRow(r, r.id != null ? r.id : k, false))}
      {closedRow && <div className="ch-div__sep" aria-hidden="true" />}
      {closedRow && renderRow(closedRow, '__closed', true)}
    </div>
  );
}

// ===== MonthlyFlowBars =====
function MonthlyFlowBars({ months, height = 120, mini = false, showAverage = true, currentKey, privacy = false, unitLabel = 'mnd', className, style, testId }) {
  const list = months || [];
  const m = list.length;
  const [hover, setHover] = useState(null);
  if (!m) return <div className={chCx('ch-mfb', className)} style={{ height, ...style }} data-testid={testId} />;
  const cur = currentKey != null ? currentKey : list[m - 1].month;
  const maxPos = Math.max(0, ...list.map(x => x.net || 0));
  const maxNeg = Math.max(0, ...list.map(x => -(x.net || 0)));
  const range = maxPos + maxNeg || 1;
  const xlH = mini ? 0 : 18;
  const plotH = height - xlH;
  const baseY = (maxPos / range) * plotH; // px from top
  const avg = list.reduce((a, x) => a + (x.net || 0), 0) / m;
  const avgY = baseY - (avg / range) * plotH;
  const gap = mini ? 3 : 6;
  const labelOf = x => x.label || (() => { const p = String(x.month).split('-'); return p.length >= 2 ? MONTHS_NL[+p[1] - 1] : String(x.month); })();
  const fullLabel = x => (x.label ? x.label : (() => { const p = String(x.month).split('-'); return p.length >= 2 ? `${MONTHS_NL[+p[1] - 1]} ${p[0]}` : String(x.month); })());
  const tipOf = x => `${fullLabel(x)} · netto ${chMoney(x.net || 0, privacy, { sign: true })} · in ${chMoney(x.inflow || 0, privacy)} · uit ${chMoney(x.outflow || 0, privacy)}`;
  return (
    <div className={chCx('ch-mfb', className)} style={{ height, ...style }} data-testid={testId}
      role={mini ? 'img' : 'group'} aria-label={mini ? `Netto inleg per ${unitLabel}` : undefined}>
      <div className="ch-mfb__cols" style={{ height: plotH, gap }}>
        {list.map((x, i) => {
          const v = x.net || 0;
          const h = Math.abs(v) / range * plotH;
          const isCur = x.month === cur;
          let cls, top;
          if (Math.abs(v) < 0.5) { cls = 'ch-mfb__bar--stub'; top = baseY - 0.75; }
          else if (v > 0) { cls = isCur ? 'ch-mfb__bar--cur' : 'ch-mfb__bar--pos'; top = baseY - h; }
          else { cls = 'ch-mfb__bar--neg'; top = baseY; }
          return (
            <div key={x.month} className="ch-mfb__col" tabIndex={mini ? undefined : 0} aria-label={mini ? undefined : tipOf(x)}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
              <span className={chCx('ch-mfb__bar', cls)} style={{ top, height: Math.max(h, 1.5) }} />
            </div>
          );
        })}
      </div>
      <div className="ch-mfb__base" style={{ top: baseY }} />
      {showAverage && !mini && Math.abs(avg) >= 0.5 && (
        <div className="ch-mfb__avg" style={{ top: avgY }}>
          <span className="ch-mfb__avglab">gem. {chMoney(avg, privacy)}/{unitLabel}</span>
        </div>
      )}
      {!mini && (
        <div className="ch-mfb__xl" style={{ top: plotH, gap }} aria-hidden="true">
          {list.map((x, i) => <span key={x.month}>{(i === m - 1 || (m - 1 - i) % 2 === 0) ? labelOf(x) : ''}</span>)}
        </div>
      )}
      {hover != null && !mini && (
        <div className="ch-tip" style={{ top: Math.max(0, baseY - 44), left: `${((hover + 0.5) / m) * 100}%`, transform: `translateX(${hover / m > 0.6 ? '-100%' : '0'})` }}>
          {tipOf(list[hover])}
        </div>
      )}
    </div>
  );
}

// ===== StackedAreaChart =====
function StackedAreaChart({ dates, layers, mode = 'pct', height = 220, hiddenKeys = [], privacy = false, className, style, testId }) {
  const uid = chUid(React.useId());
  const plotRef = useRef(null);
  const [hi, setHi] = useState(null);
  const n = dates ? dates.length : 0;
  const vis = (layers || []).filter(l => !hiddenKeys.includes(l.key));
  const H = height;
  const gutter = 48;
  const geo = useMemo(() => {
    if (n < 2 || !vis.length) return null;
    const idx = chSampleIdx(n, 200);
    const stacks = idx.map(i => {
      const vals = vis.map(l => Math.max(0, +(l.values[i] || 0)));
      const tot = vals.reduce((a, b) => a + b, 0);
      return mode === 'pct' ? vals.map(v => (tot > 0 ? v / tot * 100 : 0)) : vals;
    });
    let top = 100;
    if (mode !== 'pct') top = Math.max(1, ...stacks.map(s => s.reduce((a, b) => a + b, 0)));
    const nt = mode === 'pct' ? { lo: 0, hi: 100, ticks: [0, 25, 50, 75, 100] } : chNiceTicks(0, top, 4);
    const y = v => H - (v / (nt.hi || 1)) * H;
    const xs = idx.map(i => (i / (n - 1)) * 1000);
    const paths = vis.map((l, li) => {
      const upper = [], lower = [];
      stacks.forEach((s, k) => {
        const below = s.slice(0, li).reduce((a, b) => a + b, 0);
        lower.push([xs[k], y(below)]);
        upper.push([xs[k], y(below + s[li])]);
      });
      return { key: l.key, color: l.color, area: chPts([...upper, ...lower.slice().reverse()]), edge: upper.map((p, k) => (k ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('') };
    });
    return { nt, y, paths, xticks: chMonthTicks(dates, 6) };
  }, [n, dates, layers, hiddenKeys.join('|'), mode, H]); // eslint-disable-line
  if (!geo) {
    return <div className={chCx('ch-root', className)} style={{ height: H + 22, ...style }} data-testid={testId}><div className="ch-empty">Nog te weinig historie</div></div>;
  }
  const valAt = i => {
    const vals = vis.map(l => Math.max(0, +(l.values[i] || 0)));
    const tot = vals.reduce((a, b) => a + b, 0);
    return vis.map((l, k) => ({ l, v: vals[k], pct: tot > 0 ? vals[k] / tot * 100 : 0 }));
  };
  const lastVals = valAt(n - 1);
  const aria = `Verdeling door de tijd, ${fmtDateLong(dates[n - 1])}: ` + lastVals.map(r => `${r.l.label} ${fmtPct(r.pct, { decimals: 1, sign: false })}`).join(', ');
  const move = e => { if (e.pointerType === 'touch') return; setHi(chIndexFromEvent(e, plotRef.current, n)); };
  return (
    <div className={chCx('ch-root', className)} style={{ height: H + 22, ...style }} data-testid={testId} role="img" aria-label={aria}>
      {geo.nt.ticks.map(t => (
        <div key={t} className="ch-ylab" style={{ top: geo.y(t) }}>{mode === 'pct' ? `${t}%` : (privacy ? '' : fmtCompact(t))}</div>
      ))}
      <div ref={plotRef} className="ch-plot" style={{ right: gutter, height: H }} onPointerMove={move} onPointerLeave={() => setHi(null)}>
        <svg className="ch-svg" viewBox={`0 0 1000 ${H}`} preserveAspectRatio="none" aria-hidden="true" id={`${uid}-svg`}>
          {geo.paths.map(p => <polygon key={p.key} points={p.area} style={{ fill: p.color }} />)}
          {geo.paths.map((p, k) => k > 0 ? <path key={'e' + p.key} d={p.edge} style={{ fill: 'none', stroke: 'var(--surface)', strokeWidth: 1 }} /> : null)}
        </svg>
        {hi != null && <span className="ch-cross" style={{ left: `${(hi / (n - 1)) * 100}%`, height: H }} />}
        {hi != null && (
          <div className="ch-tip" style={{ top: 8, left: `${(hi / (n - 1)) * 100}%`, transform: `translateX(${hi / (n - 1) > 0.6 ? 'calc(-100% - 8px)' : '8px'})` }}>
            <div style={{ fontWeight: 550, marginBottom: 4 }}>{fmtDateLong(dates[hi])}</div>
            {valAt(hi).slice().reverse().map(r => (
              <div key={r.l.key} className="ch-tip__row">
                <span className="ch-tip__sw" style={{ background: r.l.color }} />{r.l.label}
                <b>{mode === 'pct' ? fmtPct(r.pct, { decimals: 1, sign: false }) : chMoney(r.v, privacy)}</b>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={chCx('ch-xaxis', hi != null && 'ch-xaxis--dim')} style={{ top: H, right: gutter }} aria-hidden="true">
        {geo.xticks.map(t => <span key={t.index} className="ch-xlab" style={{ left: `${(t.index / (n - 1)) * 100}%` }}>{t.label}</span>)}
      </div>
    </div>
  );
}

// ===== PensionFanChart =====
function PensionFanChart({ ages, low, mid, high, target, retireAge, milestones = [], currentValue, height = 300, privacy = false, className, style, testId }) {
  const uid = chUid(React.useId());
  const plotRef = useRef(null);
  const [hi, setHi] = useState(null);
  const n = ages ? ages.length : 0;
  const H = height;
  const gutter = 56;
  if (n < 2) return <div className={chCx('ch-root', className)} style={{ height: H + 22, ...style }} data-testid={testId}><div className="ch-empty">Geen projectie beschikbaar</div></div>;
  const a0 = ages[0], a1 = ages[n - 1];
  const top = Math.max(target || 0, ...high.filter(Number.isFinite), ...mid.filter(Number.isFinite)) * 1.05;
  const nt = chNiceTicks(0, top || 1, 4);
  const x = a => ((a - a0) / (a1 - a0 || 1)) * 1000;
  const y = v => H - (Math.max(0, v) / (nt.hi || 1)) * H;
  const px = a => `${((a - a0) / (a1 - a0 || 1)) * 100}%`;
  const py = v => (y(v) / H) * H;
  const xs = ages.map(x);
  const band = chPts([...xs.map((xx, k) => [xx, y(high[k])]), ...xs.map((xx, k) => [xx, y(low[k])]).reverse()]);
  const midPath = chPath(xs, mid.map(y));
  const xl = [];
  for (let a = Math.ceil(a0 / 5) * 5; a <= a1; a += 5) if ((a - a0) / (a1 - a0) > 0.06) xl.push(a);
  const money = v => (privacy ? CH_MASK : fmtCompact(v));
  const aria = `Pensioenprojectie van ${a0} tot ${a1} jaar. Doel ${money(target)} bij ${retireAge} jaar; verwacht ${money(mid[Math.min(n - 1, Math.max(0, retireAge - a0))])}.`;
  const move = e => { if (e.pointerType === 'touch') return; setHi(chIndexFromEvent(e, plotRef.current, n)); };
  return (
    <div className={chCx('ch-root', className)} style={{ height: H + 22, ...style }} data-testid={testId} role="img" aria-label={aria}>
      {nt.ticks.map(t => <div key={t} className="ch-ylab" style={{ top: y(t), width: gutter }}>{privacy ? '' : fmtCompact(t)}</div>)}
      <div ref={plotRef} className="ch-plot" style={{ right: gutter, height: H }} onPointerMove={move} onPointerLeave={() => setHi(null)}>
        <svg className="ch-svg" viewBox={`0 0 1000 ${H}`} preserveAspectRatio="none" aria-hidden="true" id={`${uid}-svg`}>
          {nt.ticks.map(t => <line key={t} x1="0" x2="1000" y1={y(t)} y2={y(t)} style={{ stroke: 'var(--border)', strokeWidth: 1 }} />)}
          <polygon points={band} style={{ fill: 'var(--accent)', fillOpacity: 0.14 }} />
          {target > 0 && <line x1="0" x2="1000" y1={y(target)} y2={y(target)} style={{ stroke: 'var(--fg-muted)', strokeWidth: 1.5, strokeDasharray: '5 4' }} />}
          {retireAge >= a0 && retireAge <= a1 && <line x1={x(retireAge)} x2={x(retireAge)} y1="0" y2={H} style={{ stroke: 'var(--border-strong)', strokeWidth: 1 }} />}
          <path d={midPath} style={{ fill: 'none', stroke: 'var(--fg)', strokeWidth: 2, strokeLinejoin: 'round' }} />
        </svg>
        {target > 0 && <span className="ch-pen-lab" style={{ left: 4, top: py(target) - 17 }}>Doel {money(target)}</span>}
        {retireAge >= a0 && retireAge <= a1 && <span className="ch-pen-lab" style={{ left: px(retireAge), top: 2, transform: 'translateX(4px)' }}>{retireAge}</span>}
        {milestones.filter(m => m && m.age != null && m.age >= a0 && m.age <= a1).map(m => {
          const v = (target || 0) * m.pct / 100;
          return (
            <React.Fragment key={m.pct}>
              <span className="ch-pen-dot" style={{ left: px(m.age), top: py(v) }} />
              <span className="ch-pen-lab" style={{ left: px(m.age), top: py(v) + 6, transform: `translateX(${(m.age - a0) / (a1 - a0) > 0.8 ? '-100%' : '-50%'})` }}>{m.pct}% · {Math.round(m.age)} jr</span>
            </React.Fragment>
          );
        })}
        <span className="ch-pen-dot ch-pen-dot--now" style={{ left: px(a0), top: py(currentValue || 0) }} />
        {hi != null && <span className="ch-cross" style={{ left: px(ages[hi]), height: H }} />}
        {hi != null && (
          <div className="ch-tip" style={{ top: 8, left: px(ages[hi]), transform: `translateX(${hi / (n - 1) > 0.55 ? 'calc(-100% - 8px)' : '8px'})` }}>
            leeftijd {ages[hi]} · laag {money(low[hi])} · verwacht {money(mid[hi])} · hoog {money(high[hi])}
          </div>
        )}
      </div>
      <div className="ch-xaxis" style={{ top: H, right: gutter }} aria-hidden="true">
        <span className="ch-xlab ch-xlab--start" style={{ left: 0 }}>nu</span>
        {xl.map(a => <span key={a} className="ch-xlab" style={{ left: px(a) }}>{a}</span>)}
      </div>
    </div>
  );
}

// ===== CapitalBar (kapitaalstreep) =====
function CapitalBar({ invested, gain, height = 8, privacy = false, className, style, testId }) {
  const inv = Math.max(0, +invested || 0);
  const g = +gain || 0;
  const label = `Netto ingelegd ${chMoney(inv, privacy)}, totale winst ${chMoney(g, privacy)}`;
  return (
    <div className={chCx('ch-cap', className)} style={{ height, ...style }} role="img" aria-label={label} data-testid={testId}>
      {inv > 0 && <span className="ch-cap__seg ch-cap__inleg" style={{ flexGrow: inv, flexBasis: 0 }} />}
      {g > 0 && <span className="ch-cap__seg ch-cap__gain" style={{ flexGrow: g, flexBasis: 0 }} />}
      {g < 0 && <span className="ch-cap__seg ch-cap__loss" style={{ flexGrow: -g, flexBasis: 0 }} />}
    </div>
  );
}

Object.assign(window, {
  PerformanceChart, Sparkline, AllocationBar, BulletTrack, DivergingBars, MonthlyFlowBars, StackedAreaChart, PensionFanChart, CapitalBar,
});
