// Shared UI primitives (F1). Tokens and base classes live in index.html.

const { useState, useEffect, useRef, useMemo } = React;

// ===== Infrastructure =====
function injectStyles(id, css) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`style[data-owner="${id}"]`);
  if (!el) {
    el = document.createElement('style');
    el.setAttribute('data-owner', id);
    document.head.appendChild(el);
  }
  if (el.textContent !== css) el.textContent = css;
}

const UiPrefsContext = React.createContext({ prefs: DEFAULT_UI_PREFS, setPrefs: () => {} });
function useUiPrefs() { return React.useContext(UiPrefsContext); }
function usePrivacy() { const c = React.useContext(UiPrefsContext); return !!(c && c.prefs && c.prefs.privacy); }

function useMediaQuery(q) {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q).matches : false);
  const [match, setMatch] = useState(get);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mql = window.matchMedia(q);
    const on = () => setMatch(mql.matches);
    on();
    if (mql.addEventListener) mql.addEventListener('change', on); else mql.addListener(on);
    return () => { if (mql.removeEventListener) mql.removeEventListener('change', on); else mql.removeListener(on); };
  }, [q]);
  return match;
}
function useIsMobile() { return useMediaQuery(MQ_MOBILE); }

const UI_FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
function uiFocusables(root) {
  if (!root) return [];
  return [...root.querySelectorAll(UI_FOCUSABLE)].filter(el => !el.hasAttribute('inert') && (el.offsetParent !== null || el === document.activeElement));
}

function useFocusTrap(ref, active, opts = {}) {
  const { initialFocus, returnFocus = true } = opts;
  useEffect(() => {
    if (!active) return undefined;
    const prev = document.activeElement;
    const raf = requestAnimationFrame(() => {
      const root = ref.current;
      if (!root) return;
      if (root.contains(document.activeElement)) return;
      const target = (initialFocus && initialFocus.current) || uiFocusables(root)[0] || root;
      try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    });
    const onKey = e => {
      if (e.key !== 'Tab') return;
      const root = ref.current;
      if (!root) return;
      const els = uiFocusables(root);
      if (!els.length) { e.preventDefault(); root.focus(); return; }
      const first = els[0], last = els[els.length - 1];
      const inside = root.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey, true);
      if (returnFocus && prev && typeof prev.focus === 'function' && document.contains(prev)) {
        try { prev.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      }
    };
  }, [active]); // eslint-disable-line
}

const UI_SCROLL_LOCK = { n: 0, body: '', html: '' };
function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    if (UI_SCROLL_LOCK.n === 0) {
      UI_SCROLL_LOCK.body = document.body.style.overflow;
      UI_SCROLL_LOCK.html = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    UI_SCROLL_LOCK.n++;
    return () => {
      UI_SCROLL_LOCK.n = Math.max(0, UI_SCROLL_LOCK.n - 1);
      if (UI_SCROLL_LOCK.n === 0) {
        document.body.style.overflow = UI_SCROLL_LOCK.body;
        document.documentElement.style.overflow = UI_SCROLL_LOCK.html;
      }
    };
  }, [active]);
}

function useDebouncedCallback(fn, ms) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timer = useRef(null);
  const pending = useRef(null);
  const debounced = React.useCallback((...args) => {
    pending.current = args;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const a = pending.current;
      pending.current = null;
      timer.current = null;
      if (a) fnRef.current(...a);
    }, ms);
  }, [ms]);
  useEffect(() => () => {
    clearTimeout(timer.current);
    if (pending.current) { const a = pending.current; pending.current = null; fnRef.current(...a); }
  }, []);
  return debounced;
}

const UI_NF_CACHE = {};
function uiNf(min, max = min) {
  const k = min + ':' + max;
  if (!UI_NF_CACHE[k]) UI_NF_CACHE[k] = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: min, maximumFractionDigits: max });
  return UI_NF_CACHE[k];
}

function uiCx(...parts) { return parts.filter(Boolean).join(' '); }
function uiStripColon(id) { return String(id).replace(/:/g, ''); }

// ===== Icons (Lucide geometry, 24 grid) =====
// string = path d; {c:[cx,cy,r]} circle; {r:[x,y,w,h,rx]} rect
const UI_ICONS = {
  'layout-dashboard': [{ r: [3, 3, 7, 9, 1] }, { r: [14, 3, 7, 5, 1] }, { r: [14, 12, 7, 9, 1] }, { r: [3, 16, 7, 5, 1] }],
  'layers': ['m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z', 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65', 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65'],
  'arrow-left-right': ['M8 3 4 7l4 4', 'M4 7h16', 'm16 21 4-4-4-4', 'M20 17H4'],
  'target': [{ c: [12, 12, 10] }, { c: [12, 12, 6] }, { c: [12, 12, 2] }],
  'settings': ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', { c: [12, 12, 3] }],
  'search': [{ c: [11, 11, 8] }, 'm21 21-4.3-4.3'],
  'plus': ['M5 12h14', 'M12 5v14'],
  'minus': ['M5 12h14'],
  'eye': ['M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0', { c: [12, 12, 3] }],
  'eye-off': ['M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49', 'M14.084 14.158a3 3 0 0 1-4.242-4.242', 'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143', 'm2 2 20 20'],
  'refresh-cw': ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
  'calendar': ['M8 2v4', 'M16 2v4', { r: [3, 4, 18, 18, 2] }, 'M3 10h18'],
  'panel-left': [{ r: [3, 3, 18, 18, 2] }, 'M9 3v18'],
  'sun': [{ c: [12, 12, 4] }, 'M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41'],
  'moon': ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  'monitor': [{ r: [2, 3, 20, 14, 2] }, 'M8 21h8', 'M12 17v4'],
  'info': [{ c: [12, 12, 10] }, 'M12 16v-4', 'M12 8h.01'],
  'triangle-alert': ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
  'circle-alert': [{ c: [12, 12, 10] }, 'M12 8v4', 'M12 16h.01'],
  'clock': [{ c: [12, 12, 10] }, 'M12 6v6l4 2'],
  'diamond': ['M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z'],
  'arrow-down-to-line': ['M12 17V3', 'm6 11 6 6 6-6', 'M19 21H5'],
  'arrow-up-from-line': ['m18 9-6-6-6 6', 'M12 3v14', 'M5 21h14'],
  'circle-plus': [{ c: [12, 12, 10] }, 'M8 12h8', 'M12 8v8'],
  'circle-minus': [{ c: [12, 12, 10] }, 'M8 12h8'],
  'coins': [{ c: [8, 8, 6] }, 'M18.09 10.37A6 6 0 1 1 10.34 18', 'M7 6h1v4', 'm16.71 13.88.7.71-2.82 2.82'],
  'percent': ['M19 5 5 19', { c: [6.5, 6.5, 2.5] }, { c: [17.5, 17.5, 2.5] }],
  'receipt': ['M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z', 'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8', 'M12 17.5v-11'],
  'gift': [{ r: [3, 8, 18, 4, 1] }, 'M12 8v13', 'M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7', 'M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5'],
  'pencil': ['M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z', 'm15 5 4 4'],
  'trash-2': ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2', 'M10 11v6', 'M14 11v6'],
  'x': ['M18 6 6 18', 'm6 6 12 12'],
  'check': ['M20 6 9 17l-5-5'],
  'chevron-down': ['m6 9 6 6 6-6'],
  'chevron-up': ['m18 15-6-6-6 6'],
  'chevron-left': ['m15 18-6-6 6-6'],
  'chevron-right': ['m9 18 6-6-6-6'],
  'more-horizontal': [{ c: [12, 12, 1] }, { c: [19, 12, 1] }, { c: [5, 12, 1] }],
  'download': ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  'upload': ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm17 8-5-5-5 5', 'M12 3v12'],
  'cloud': ['M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'],
  'cloud-check': ['m17 15-5.5 5.5L9 18', 'M5 17.743A7 7 0 1 1 15.71 10h1.79a4.5 4.5 0 0 1 1.5 8.742'],
  'cloud-alert': ['M12 12v4', 'M12 20h.01', 'M17 18h.5a1 1 0 0 0 0-9h-1.79A7 7 0 1 0 7 17.708'],
  'trending-up': ['M16 7h6v6', 'm22 7-8.5 8.5-5-5L2 17'],
  'calculator': [{ r: [4, 2, 16, 20, 2] }, 'M8 6h8', 'M16 14v4', 'M16 10h.01', 'M12 10h.01', 'M8 10h.01', 'M12 14h.01', 'M8 14h.01', 'M12 18h.01', 'M8 18h.01'],
  'flag': ['M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528'],
  'wallet': ['M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1', 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4'],
  'list': ['M3 12h.01', 'M3 18h.01', 'M3 6h.01', 'M8 12h13', 'M8 18h13', 'M8 6h13'],
  'filter': ['M22 3H2l8 9.46V19l4 2v-8.54L22 3z'],
  'table': ['M12 3v18', { r: [3, 3, 18, 18, 2] }, 'M3 9h18', 'M3 15h18'],
  'keyboard': ['M10 8h.01', 'M12 12h.01', 'M14 8h.01', 'M16 12h.01', 'M18 8h.01', 'M6 8h.01', 'M7 16h10', 'M8 12h.01', { r: [2, 4, 20, 16, 2] }],
  'link': ['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'],
  'copy': [{ r: [8, 8, 14, 14, 2] }, 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'],
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'loader': ['M21 12a9 9 0 1 1-6.219-8.56'],
};
const ICON_NAMES = Object.keys(UI_ICONS);
const UI_ICON_WARNED = {};

function Icon({ name, size = 16, strokeWidth = 1.75, title, className, style, ...rest }) {
  const parts = UI_ICONS[name];
  if (!parts) {
    if (!UI_ICON_WARNED[name]) { UI_ICON_WARNED[name] = true; console.warn(`Icon: onbekende naam "${name}"`); }
    return null;
  }
  const a11y = title ? { role: 'img' } : { 'aria-hidden': 'true' };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" focusable="false"
      className={uiCx(name === 'loader' && 'spin', className)} style={{ flexShrink: 0, display: 'inline-block', ...style }} {...a11y} {...rest}>
      {title && <title>{title}</title>}
      {parts.map((p, i) => typeof p === 'string'
        ? <path key={i} d={p} />
        : p.c ? <circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.c[2]} />
        : <rect key={i} x={p.r[0]} y={p.r[1]} width={p.r[2]} height={p.r[3]} rx={p.r[4]} />)}
    </svg>
  );
}

// ===== Controls =====
const Button = React.forwardRef(function Button({ variant = 'secondary', size = 'md', icon, iconRight, kbd, full = false, disabled = false, type = 'button', onClick, ariaLabel, children, className, style, ...rest }, ref) {
  const handle = e => {
    if (disabled) { e.preventDefault(); e.stopPropagation(); return; }
    if (onClick) onClick(e);
  };
  const iconSize = size === 'lg' ? 18 : 16;
  return (
    <button ref={ref} type={type} onClick={handle} aria-disabled={disabled || undefined} aria-label={ariaLabel}
      className={uiCx('btn', `btn--${variant}`, `btn--${size}`, full && 'btn--full', className)} style={style} {...rest}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
      {kbd && <Kbd>{kbd}</Kbd>}
    </button>
  );
});

const IconButton = React.forwardRef(function IconButton({ icon, label, onClick, size = 'md', active = false, pressed, badge = null, disabled = false, className, style, iconSize, ...rest }, ref) {
  const handle = e => {
    if (disabled) { e.preventDefault(); return; }
    if (onClick) onClick(e);
  };
  return (
    <button ref={ref} type="button" aria-label={label} title={label} onClick={handle}
      aria-pressed={typeof pressed === 'boolean' ? pressed : undefined} aria-disabled={disabled || undefined}
      className={uiCx('icon-btn', size === 'sm' && 'icon-btn--sm', active && 'is-active', className)} style={style} {...rest}>
      <Icon name={icon} size={iconSize || (size === 'sm' ? 15 : 16)} />
      {badge && <span className={`icon-btn__badge icon-btn__badge--${badge}`} aria-hidden="true" />}
    </button>
  );
});

function Card({ title, meta, actions, footer, padding = 16, as = 'section', onClick, bodyClassName, children, id, className, style, hover, ...rest }) {
  const rawId = React.useId();
  const titleId = `card-${uiStripColon(rawId)}`;
  const Tag = as;
  const hasHead = title != null || actions != null;
  // Legacy callers pass their own padding via style; then the body adds none.
  const legacyPadded = !hasHead && style && style.padding != null;
  const bodyPad = legacyPadded ? 0 : padding;
  return (
    <Tag id={id} className={uiCx('card', onClick && 'card--clickable', className)} style={style} onClick={onClick}
      aria-labelledby={title != null && Tag === 'section' ? titleId : undefined} {...rest}>
      {hasHead && (
        <div className="card__head">
          <div className="card__titles">
            {title != null && <h2 className="card__title" id={titleId}>{title}</h2>}
            {meta != null && <span className="card__meta">{meta}</span>}
          </div>
          {actions != null && <div className="card__actions">{actions}</div>}
        </div>
      )}
      <div className={uiCx('card__body', bodyClassName)} style={{ padding: bodyPad }}>{children}</div>
      {footer != null && <div className="card__foot">{footer}</div>}
    </Tag>
  );
}

const UI_PILL_ALIASES = { positive: 'gain', negative: 'loss' };
function Pill({ tone = 'neutral', icon, children, className, style, ...rest }) {
  const t = UI_PILL_ALIASES[tone] || tone;
  return (
    <span className={uiCx('pill', `pill--${t}`, className)} style={style} {...rest}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

function Chip({ active = false, onClick, count, swatch, onRemove, removeLabel = 'Verwijderen', disabled = false, children, className, style, ...rest }) {
  return (
    <button type="button" aria-pressed={active} aria-disabled={disabled || undefined}
      onClick={e => { if (!disabled && onClick) onClick(e); }}
      className={uiCx('chip', className)} style={style} {...rest}>
      {swatch && <Swatch color={swatch} size={8} shape="dot" />}
      <span>{children}</span>
      {count != null && <span className="chip__count">{count}</span>}
      {onRemove && (
        <span role="button" tabIndex={0} aria-label={removeLabel} className="chip__remove"
          onClick={e => { e.stopPropagation(); onRemove(e); }}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onRemove(e); } }}>
          <Icon name="x" size={12} />
        </span>
      )}
    </button>
  );
}

function Segmented({ options, value, onChange, size = 'md', ariaLabel, full = false, pill = false, className, style }) {
  const refs = useRef([]);
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter(i => i >= 0);
  const selIdx = options.findIndex(o => o.value === value);
  const focusIdx = selIdx >= 0 && !options[selIdx].disabled ? selIdx : (enabled[0] ?? 0);
  const move = (from, dir) => {
    if (!enabled.length) return;
    let pos = enabled.indexOf(from);
    if (pos < 0) pos = 0;
    const next = enabled[(pos + dir + enabled.length) % enabled.length];
    onChange && onChange(options[next].value);
    const el = refs.current[next];
    if (el) el.focus();
  };
  const onKey = (e, i) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); move(i, 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); move(i, -1); }
  };
  return (
    <div role="radiogroup" aria-label={ariaLabel}
      className={uiCx('seg', size !== 'md' && `seg--${size}`, full && 'seg--full', pill && 'seg--pill', className)} style={style}>
      {options.map((o, i) => (
        <button key={String(o.value)} ref={el => { refs.current[i] = el; }} type="button" role="radio"
          aria-checked={o.value === value} aria-disabled={o.disabled || undefined} title={o.title}
          tabIndex={i === focusIdx ? 0 : -1} data-testid={o.testId}
          className="seg__btn"
          onClick={() => { if (!o.disabled && onChange) onChange(o.value); }}
          onKeyDown={e => onKey(e, i)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Tabs({ tabs, value, onChange, ariaLabel, className, style }) {
  const refs = useRef([]);
  const onKey = (e, i) => {
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    if (n == null) return;
    e.preventDefault();
    onChange && onChange(tabs[n].value);
    refs.current[n] && refs.current[n].focus();
  };
  return (
    <div role="tablist" aria-label={ariaLabel} className={uiCx('tabs', className)} style={style}>
      {tabs.map((t, i) => (
        <button key={t.value} ref={el => { refs.current[i] = el; }} type="button" role="tab"
          aria-selected={t.value === value} tabIndex={t.value === value ? 0 : -1} data-testid={t.testId}
          className="tab" onClick={() => onChange && onChange(t.value)} onKeyDown={e => onKey(e, i)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, hint, error, htmlFor, children, className, style }) {
  const labelEl = label != null && (htmlFor
    ? <label className="field__label" htmlFor={htmlFor}>{label}</label>
    : <span className="field__label">{label}</span>);
  const tail = (
    <>
      {hint != null && <div className="field__hint" id={htmlFor ? `${htmlFor}-hint` : undefined}>{hint}</div>}
      {error && <div className="field__error" id={htmlFor ? `${htmlFor}-err` : undefined}><Icon name="triangle-alert" size={13} />{error}</div>}
    </>
  );
  if (htmlFor) {
    return <div className={uiCx('field', className)} style={style}>{labelEl}{children}{tail}</div>;
  }
  // Without htmlFor the whole field is a <label>, so clicking the text focuses the control.
  return <label className={uiCx('field', className)} style={style}>{labelEl}{children}{tail}</label>;
}

function Input({ className, ...rest }) {
  return <input className={uiCx('input', className)} {...rest} />;
}
function Select({ className, children, ...rest }) {
  return <select className={uiCx('input input--select', className)} {...rest}>{children}</select>;
}
function Textarea({ className, ...rest }) {
  return <textarea className={uiCx('input input--textarea', className)} {...rest} />;
}

function MoneyInput({ value, onChange, prefix = '€', suffix, large = false, placeholder, id, autoFocus, ariaLabel, ariaDescribedBy, showParsed = true, className, style, inputRef, ...rest }) {
  const str = value == null ? '' : String(value);
  const parsed = parseNlNumber(str);
  let preview = null;
  if (showParsed && parsed != null && /[.,]/.test(str)) {
    const shown = uiNf(0, 8).format(parsed);
    const typed = str.replace(/[€%\s  ]/g, '').replace(/−/g, '-');
    if (shown !== typed) preview = `= ${prefix ? prefix + ' ' : ''}${shown}${suffix ? ' ' + suffix : ''}`;
  }
  return (
    <div className={className} style={style}>
      <div className={uiCx('money-input', prefix && 'money-input--pre', suffix && 'money-input--suf', large && 'money-input--large')}>
        {prefix && <span className="money-input__affix money-input__affix--pre" aria-hidden="true">{prefix}</span>}
        <input id={id} ref={inputRef} className="input" type="text" inputMode="decimal" autoComplete="off"
          value={str} placeholder={placeholder} autoFocus={autoFocus} aria-label={ariaLabel} aria-describedby={ariaDescribedBy}
          onChange={e => onChange && onChange(e.target.value)} {...rest} />
        {suffix && <span className="money-input__affix money-input__affix--suf" aria-hidden="true">{suffix}</span>}
      </div>
      {preview && <div className="money-input__preview" aria-live="polite">{preview}</div>}
    </div>
  );
}

function Switch({ checked, onChange, label, description, id, disabled = false, className, style, ...rest }) {
  return (
    <button type="button" role="switch" id={id} aria-checked={!!checked} aria-disabled={disabled || undefined}
      className={uiCx('switch', className)} style={style}
      onClick={() => { if (!disabled && onChange) onChange(!checked); }} {...rest}>
      <span className="switch__text">
        <span className="switch__label">{label}</span>
        {description != null && <span className="switch__desc">{description}</span>}
      </span>
      <span className="switch__track" aria-hidden="true"><span className="switch__thumb" /></span>
    </button>
  );
}

function uiSnap(n, min, max, step) {
  let v = Math.min(max, Math.max(min, n));
  if (step > 0) {
    v = Math.round((v - min) / step) * step + min;
    const dec = (String(step).split('.')[1] || '').length;
    v = +v.toFixed(dec);
    v = Math.min(max, Math.max(min, v));
  }
  return v;
}

function SliderField({ label, value, min, max, step = 1, onChange, suffix, prefix, format, id, testId, className, style }) {
  const rawId = React.useId();
  const baseId = id || `sf-${uiStripColon(rawId)}`;
  const display = n => (format ? format(n) : uiNf(0, 4).format(n));
  const [draft, setDraft] = useState(null);
  const commit = () => {
    if (draft == null) return;
    const n = parseNlNumber(draft);
    setDraft(null);
    if (n == null) return;
    const v = uiSnap(n, min, max, step);
    if (v !== value && onChange) onChange(v);
  };
  return (
    <div className={uiCx('slider-field', className)} style={style}>
      <label className="slider-field__label" htmlFor={`${baseId}-range`}>{label}</label>
      <input id={`${baseId}-range`} type="range" min={min} max={max} step={step} value={value ?? min}
        data-testid={testId}
        onChange={e => onChange && onChange(uiSnap(+e.target.value, min, max, step))} />
      <div className={uiCx('slider-field__num', prefix && 'slider-field__num--pre', suffix && 'slider-field__num--suf')}>
        {prefix && <span className="slider-field__affix" style={{ left: 8 }}>{prefix}</span>}
        <input className="input" type="text" inputMode="decimal" aria-label={typeof label === 'string' ? label : undefined}
          data-testid={testId ? `${testId}-num` : undefined}
          value={draft != null ? draft : display(value)}
          onFocus={e => { setDraft(display(value)); requestAnimationFrame(() => { try { e.target.select(); } catch (er) { /* ignore */ } }); }}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(); e.currentTarget.blur(); } if (e.key === 'Escape') { setDraft(null); e.currentTarget.blur(); } }} />
        {suffix && <span className="slider-field__affix" style={{ right: 8 }}>{suffix}</span>}
      </div>
    </div>
  );
}

// ===== Display =====
const UI_MASK = '€ •••••';

function Money({ value, decimals = 0, sign = false, className, as = 'span', style, ...rest }) {
  const privacy = usePrivacy();
  const Tag = as;
  if (privacy && value != null) {
    return <Tag className={uiCx('num', className)} style={style} aria-label="bedrag verborgen" {...rest}>{UI_MASK}</Tag>;
  }
  return <Tag className={uiCx('num', className)} style={style} {...rest}>{fmtMoney(value, { decimals, sign })}</Tag>;
}

function Pct({ value, decimals = 1, sign = true, colored = false, className, style, ...rest }) {
  const tone = !colored || value == null ? null : (value > 0 ? 'var(--gain)' : value < 0 ? 'var(--loss)' : null);
  return <span className={uiCx('num', className)} style={tone ? { color: tone, ...style } : style} {...rest}>{fmtPct(value, { decimals, sign })}</span>;
}

function UiDeltaGlyph({ up }) {
  return (
    <svg className="delta__glyph" width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
      <path d={up ? 'M5 1.5 9 8.5H1z' : 'M5 8.5 1 1.5h8z'} style={{ fill: 'currentColor' }} />
    </svg>
  );
}

function uiDeltaRender({ value, pct, size = 'md', decimals = 0, showGlyph = true, context, className, style }, privacy) {
  const v = value != null && Number.isFinite(+value) ? +value : null;
  const p = pct != null && Number.isFinite(+pct) ? +pct : null;
  if (v == null && p == null) return <span className={uiCx('delta delta--flat', `delta--${size}`, className)} style={style}>—</span>;
  const ref = v != null ? Math.round(v * Math.pow(10, decimals)) : Math.round(p * 10);
  const tone = ref > 0 ? 'gain' : ref < 0 ? 'loss' : 'flat';
  const word = tone === 'gain' ? 'winst' : tone === 'loss' ? 'verlies' : 'geen verandering';
  return (
    <span className={uiCx('delta', `delta--${tone}`, `delta--${size}`, className)} style={style}>
      <span className="sr-only">{word} </span>
      {showGlyph && tone !== 'flat' && <UiDeltaGlyph up={tone === 'gain'} />}
      {v != null && (privacy
        ? <span aria-label="bedrag verborgen">{UI_MASK}</span>
        : <span>{fmtMoney(v, { decimals, sign: true })}</span>)}
      {p != null && <span>{fmtPct(p, { decimals: 1, sign: true })}</span>}
      {context != null && <span className="delta__context">{context}</span>}
    </span>
  );
}

function Delta({ format, ...props }) {
  const privacy = usePrivacy();
  // Legacy API (old dashboard/modals, until rewritten): <Delta value={x} format="eur"|"pct" />
  if (format === 'pct') return uiDeltaRender({ ...props, value: null, pct: props.value, size: props.size || 'sm' }, privacy);
  if (format != null) return uiDeltaRender({ ...props, pct: null, size: props.size || 'sm' }, privacy);
  return uiDeltaRender(props, privacy);
}

function Monogram({ party, size = 32, closed = false, className, style }) {
  const color = partyColorOf(party);
  const tint = closed ? null : {
    background: `color-mix(in srgb, ${color} 16%, var(--surface))`,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 40%, transparent)`,
  };
  return (
    <span aria-hidden="true" className={uiCx('monogram', size !== 32 && `monogram--${size}`, closed && 'monogram--closed', className)}
      style={{ ...tint, ...style }}>
      {monogramOf(party)}
    </span>
  );
}

function Swatch({ color, size = 10, shape = 'square', className, style }) {
  return <span aria-hidden="true" className={uiCx('swatch', shape === 'dot' && 'swatch--dot', className)}
    style={{ width: size, height: size, background: color, ...style }} />;
}

function StatusDot({ status = 'off', label, className, style }) {
  const a11y = label ? { role: 'img', 'aria-label': label, title: label } : { 'aria-hidden': 'true' };
  if (status === 'busy') {
    return <span className={uiCx('status-dot status-dot--busy', className)} style={style} {...a11y}><Icon name="loader" size={12} strokeWidth={2.25} /></span>;
  }
  return <span className={uiCx('status-dot', `status-dot--${status}`, className)} style={style} {...a11y} />;
}

function KpiCell({ label, value, sub, info, className, style, ...rest }) {
  return (
    <div className={uiCx('kpi', className)} style={style} {...rest}>
      <div className="kpi__label">{label}{info && <InfoTip text={info} label={typeof label === 'string' ? `Uitleg ${label}` : 'Uitleg'} />}</div>
      <div className="kpi__value">{value}</div>
      {sub != null && <div className="kpi__sub">{sub}</div>}
    </div>
  );
}

function ListRow({ leading, title, subtitle, value, secondary, onClick, chevron = false, testId, muted = false, className, style, ...rest }) {
  const inner = (
    <>
      {leading}
      <span className="list-row__main">
        <span className="list-row__title">{title}</span>
        {subtitle != null && <span className="list-row__subtitle">{subtitle}</span>}
      </span>
      {(value != null || secondary != null) && (
        <span className="list-row__end">
          {value != null && <span className="list-row__value">{value}</span>}
          {secondary != null && <span className="list-row__secondary">{secondary}</span>}
        </span>
      )}
      {chevron && <Icon name="chevron-right" size={16} className="list-row__chevron" />}
    </>
  );
  const cls = uiCx('list-row', muted && 'list-row--muted', className);
  return onClick
    ? <button type="button" className={cls} style={style} onClick={onClick} data-testid={testId} {...rest}>{inner}</button>
    : <div className={cls} style={style} data-testid={testId} {...rest}>{inner}</div>;
}

function EmptyState({ icon, title, body, action, secondary, className, style }) {
  return (
    <div className={uiCx('empty', className)} style={style}>
      {icon && <div className="empty__icon"><Icon name={icon} size={20} /></div>}
      <div className="empty__title">{title}</div>
      {body != null && <div className="empty__body">{body}</div>}
      {(action || secondary) && (
        <div className="empty__actions">
          {action && <Button variant="primary" onClick={action.onClick} data-testid={action.testId}>{action.label}</Button>}
          {secondary && <Button variant="ghost" onClick={secondary.onClick}>{secondary.label}</Button>}
        </div>
      )}
    </div>
  );
}

function Skeleton({ width = '100%', height = 16, radius = 6, className, style }) {
  return <span aria-hidden="true" className={uiCx('skeleton', className)} style={{ width, height, borderRadius: radius, ...style }} />;
}

function Kbd({ children, className, style }) {
  return <kbd className={uiCx('kbd', className)} style={style}>{children}</kbd>;
}

// ===== Overlays =====
function uiPortal(node) {
  return typeof document !== 'undefined' ? ReactDOM.createPortal(node, document.body) : node;
}

function Sheet({ open, onClose, title, subtitle, onBack, footer, size = 'large', width = 480, testId, initialFocusRef, children, className, style }) {
  const isMobile = useIsMobile();
  const ref = useRef(null);
  const rawId = React.useId();
  const titleId = `sheet-${uiStripColon(rawId)}`;
  const touch = useRef(null);
  const handleDrag = useRef(null);
  useFocusTrap(ref, !!open, { initialFocus: initialFocusRef });
  useScrollLock(!!open);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (document.querySelector('.dialog-wrap')) return; // a confirm on top handles Esc first
      e.preventDefault();
      onClose && onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;

  const onTouchStart = e => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = e => {
    const s = touch.current; touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (dx > 80 && Math.abs(dy) < 60) onClose && onClose();
  };
  const onHandleDown = e => { handleDrag.current = { y: e.clientY }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } };
  const onHandleMove = e => {
    if (!handleDrag.current || !ref.current) return;
    const dy = Math.max(0, e.clientY - handleDrag.current.y);
    ref.current.style.transform = dy ? `translateY(${dy}px)` : '';
  };
  const onHandleUp = e => {
    const s = handleDrag.current; handleDrag.current = null;
    if (ref.current) ref.current.style.transform = '';
    if (s && e.clientY - s.y > 90) onClose && onClose();
  };

  const cls = uiCx('sheet', isMobile ? 'sheet--bottom' : 'sheet--panel', isMobile && `sheet--${size}`, className);
  return uiPortal(
    <>
      <div className="scrim" onClick={() => onClose && onClose()} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} data-testid={testId}
        className={cls} style={{ ...(isMobile ? null : { '--sheet-w': `${width}px` }), ...style }}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {isMobile && (
          <div className="sheet__handle" aria-hidden="true"
            onPointerDown={onHandleDown} onPointerMove={onHandleMove} onPointerUp={onHandleUp} onPointerCancel={onHandleUp} />
        )}
        <div className={uiCx('sheet__head', onBack && 'sheet__head--back')}>
          {onBack && <IconButton icon="chevron-left" label="Terug" onClick={onBack} className="sheet__close" />}
          <div className="sheet__titles">
            <h2 className="sheet__title" id={titleId}>{title}</h2>
            {subtitle != null && <div className="sheet__subtitle">{subtitle}</div>}
          </div>
          <IconButton icon="x" label="Sluiten" onClick={() => onClose && onClose()} className="sheet__close" data-testid="sheet-close" />
        </div>
        <div className="sheet__body">{children}</div>
        {footer != null && <div className="sheet__foot">{footer}</div>}
      </div>
    </>
  );
}

function Dialog({ open, onClose, title, children, actions, testId, initialFocusRef, className, style }) {
  const ref = useRef(null);
  const actionsRef = useRef(null);
  const rawId = React.useId();
  const titleId = `dialog-${uiStripColon(rawId)}`;
  const firstAction = useRef(null);
  useEffect(() => {
    if (open && actionsRef.current) firstAction.current = actionsRef.current.querySelector('button:not([aria-disabled="true"])');
  });
  useFocusTrap(ref, !!open, { initialFocus: initialFocusRef || firstAction });
  useScrollLock(!!open);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose && onClose(); } };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);
  if (!open) return null;
  return uiPortal(
    <div className="dialog-wrap">
      <div className="scrim" onClick={() => onClose && onClose()} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} data-testid={testId}
        className={uiCx('dialog', className)} style={style}>
        <h2 className="dialog__title" id={titleId}>{title}</h2>
        {children != null && <div className="dialog__body">{children}</div>}
        {actions != null && <div className="dialog__actions" ref={actionsRef}>{actions}</div>}
      </div>
    </div>
  );
}

function Popover({ open, onClose, anchorRef, align = 'end', children, ariaLabel, role = 'dialog', className, style, popRef }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  React.useLayoutEffect(() => {
    if (!open) { setPos(null); return undefined; }
    const place = () => {
      const a = anchorRef && anchorRef.current;
      const el = ref.current;
      if (!a || !el) return;
      const r = a.getBoundingClientRect();
      const w = el.offsetWidth, h = el.offsetHeight;
      const vw = window.innerWidth, vh = window.innerHeight;
      let left = align === 'start' ? r.left : r.right - w;
      left = Math.max(8, Math.min(left, vw - w - 8));
      let top = r.bottom + 6;
      if (top + h > vh - 8 && r.top - h - 6 > 8) top = r.top - h - 6;
      setPos({ left, top });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open, align]); // eslint-disable-line
  useEffect(() => {
    if (!open) return undefined;
    const onDown = e => {
      const el = ref.current, a = anchorRef && anchorRef.current;
      if (el && el.contains(e.target)) return;
      if (a && a.contains(e.target)) return;
      onClose && onClose();
    };
    const onKey = e => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose && onClose();
        const a = anchorRef && anchorRef.current;
        if (a && a.focus) a.focus();
      }
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('pointerdown', onDown, true); document.removeEventListener('keydown', onKey, true); };
  }, [open, onClose]); // eslint-disable-line
  if (!open) return null;
  return uiPortal(
    <div ref={el => { ref.current = el; if (popRef) popRef.current = el; }} role={role} aria-label={ariaLabel}
      className={uiCx('popover', className)}
      style={{ left: pos ? pos.left : -9999, top: pos ? pos.top : -9999, visibility: pos ? 'visible' : 'hidden', ...style }}>
      {children}
    </div>
  );
}

function Menu({ items, triggerLabel, triggerIcon = 'more-horizontal', align = 'end', size = 'md', className, style, testId }) {
  const [open, setOpen] = useState(false);
  const anchor = useRef(null);
  const popRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const first = popRef.current && popRef.current.querySelector('[role="menuitem"]:not([aria-disabled="true"])');
      if (first) first.focus();
    });
  }, [open]);
  const onKey = e => {
    const list = popRef.current ? [...popRef.current.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')] : [];
    const i = list.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (list[(i + 1) % list.length] || list[0])?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (list[(i - 1 + list.length) % list.length] || list[0])?.focus(); }
    if (e.key === 'Home') { e.preventDefault(); list[0]?.focus(); }
    if (e.key === 'End') { e.preventDefault(); list[list.length - 1]?.focus(); }
    if (e.key === 'Tab') setOpen(false);
  };
  return (
    <>
      <IconButton ref={anchor} icon={triggerIcon} label={triggerLabel} size={size} className={className} style={style}
        aria-haspopup="menu" aria-expanded={open} data-testid={testId}
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }} />
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchor} align={align} role="presentation" popRef={popRef}>
        <div role="menu" aria-label={triggerLabel} className="menu" onKeyDown={onKey} onClick={e => e.stopPropagation()}>
          {items.filter(Boolean).map((it, i) => (
            <button key={i} type="button" role="menuitem" tabIndex={-1} data-testid={it.testId}
              aria-disabled={it.disabled || undefined}
              className={uiCx('menu__item', it.danger && 'menu__item--danger')}
              onClick={e => {
                e.stopPropagation();
                if (it.disabled) return;
                setOpen(false);
                if (anchor.current) anchor.current.focus();
                it.onClick && it.onClick(e);
              }}>
              {it.icon && <Icon name={it.icon} size={16} />}
              {it.label}
            </button>
          ))}
        </div>
      </Popover>
    </>
  );
}

function InfoTip({ text, label = 'Uitleg', className, style }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const anchor = useRef(null);
  const close = () => { setOpen(false); setPinned(false); };
  return (
    <>
      <button ref={anchor} type="button" aria-label={label} aria-expanded={open} className={uiCx('infotip', className)} style={style}
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => { if (!pinned) setOpen(false); }}
        onFocus={() => setOpen(true)} onBlur={() => { if (!pinned) setOpen(false); }}
        onClick={e => { e.stopPropagation(); if (pinned) close(); else { setPinned(true); setOpen(true); } }}>
        <Icon name="info" size={14} />
      </button>
      <Popover open={open} onClose={close} anchorRef={anchor} align="start" role="tooltip">
        <div className="infotip__bubble">{text}</div>
      </Popover>
    </>
  );
}

function ToastHost({ toasts = [], onDismiss }) {
  return uiPortal(
    <div className="toast-host" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className="toast" data-testid="toast">
          <span>{t.text}</span>
          {t.action && (
            <button type="button" className="toast__action" onClick={() => { t.action.onClick && t.action.onClick(); onDismiss && onDismiss(t.id); }}>
              {t.action.label}
            </button>
          )}
          <button type="button" className="toast__close" aria-label="Melding sluiten" onClick={() => onDismiss && onDismiss(t.id)}>
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ===== Legacy helpers (kept for compatibility; restyled to tokens) =====
const inputStyle = {
  width: '100%',
  height: 32,
  padding: '0 10px',
  background: 'var(--surface-2)',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--r-2)',
  fontSize: 13.5,
  color: 'var(--fg)',
  outline: 'none',
  fontFamily: 'inherit',
};
const dotStyle  = (color, size = 8) => ({ width: size, height: size, borderRadius: 2, background: color, flexShrink: 0 });
const labelSm   = { fontSize: 12, color: 'var(--fg-muted)', marginBottom: 4 };
const monoSm    = { fontVariantNumeric: 'tabular-nums', fontSize: 11 };

function assetUrl(path) {
  const base = window.__ASSET_BASE__ || '';
  return base + path;
}

function AppLogo({ size = 28, style, ...rest }) {
  return (
    <img
      src={assetUrl('icon.svg')}
      alt="Investeringen"
      width={size}
      height={size}
      style={{ borderRadius: Math.round(size * 0.22), display: 'block', flexShrink: 0, ...style }}
      {...rest}
    />
  );
}

Object.assign(window, {
  injectStyles, UiPrefsContext, useUiPrefs, usePrivacy, useMediaQuery, useIsMobile, useFocusTrap, useScrollLock, useDebouncedCallback,
  Icon, ICON_NAMES, IconButton, Chip, Segmented, Tabs, MoneyInput, Switch, SliderField,
  Money, Pct, Monogram, Swatch, StatusDot, KpiCell, ListRow, EmptyState, Skeleton,
  Sheet, Dialog, Popover, Menu, InfoTip, Kbd, ToastHost,
  Button, Card, Pill, Field, Input, Select, Textarea, Delta,
  inputStyle, dotStyle, labelSm, monoSm, AppLogo, assetUrl,
});
