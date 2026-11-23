// Overzicht (S2): OverzichtScreen, desktop (direction B) + mobile (direction C).
// File-local helpers use the `ov` / `Ov` / `OV_` prefix (CONTRACT §2.2).

injectStyles('overzicht', `
.ov-desk { display: flex; flex-direction: column; gap: 12px; min-width: 0; padding: 20px; }

/* Open beleggingen uit Financieel: bovenaan het overzicht, alleen als er iets aan te vullen is */
.ov-fin { border-color: color-mix(in srgb, var(--warn) 45%, var(--border)); box-shadow: inset 3px 0 0 var(--warn); }
.ov-fin .card__title { display: inline-flex; align-items: center; gap: 8px; }
.ov-fin .card__title > svg { color: var(--warn); flex: none; }
.ov-fin__note { margin: 0 0 4px; font-size: 12.5px; line-height: 18px; color: var(--fg-muted); }
.ov-fin__list { display: flex; flex-direction: column; }
.ov-fin__list > .list-row + .list-row { border-top: 1px solid var(--border); }
.ov-fin .list-row__subtitle { white-space: normal; }
.ov-fin__more { padding-top: 8px; }
/* Live CFD-kaart */
.ov-cfd-embed { display: flex; flex-direction: column; padding: 12px 14px; margin: 0 0 10px 52px; border: 1px solid var(--border); border-radius: var(--r-2, 12px); background: var(--surface); }
.ov-cfd-embed__top { display: flex; justify-content: flex-end; margin-bottom: 4px; }
.ps-cfd-detail .ov-cfd-embed { margin-left: 0; }
.ov-cfd__new { margin: 10px 0 2px; align-self: flex-start; border: 1px dashed var(--border); background: transparent; color: var(--fg); border-radius: 999px; padding: 6px 12px; font: 600 13px/18px var(--font); cursor: pointer; }
.ov-cfd__close { align-self: flex-end; margin-top: 4px; border: 1px solid var(--border); background: var(--surface); color: var(--fg); border-radius: 999px; padding: 2px 10px; font: 600 12px/18px var(--font); cursor: pointer; }
.ov-cfd__close:hover { border-color: var(--fg-muted); }
.ov-intra-desk { padding: 12px 28px 4px; border-top: 1px solid var(--border); }
.ov-intra-desk__title { font: 600 13px/18px var(--font); margin-bottom: 6px; }
.ov-intra { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.ov-intra__days { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
.ov-intra__day { flex: none; border: 1px solid var(--border); background: transparent; color: var(--fg-muted); border-radius: 999px; padding: 3px 10px; font: 500 12px/16px var(--font); cursor: pointer; white-space: nowrap; }
.ov-intra__day.is-on { background: var(--fg); color: var(--bg); border-color: var(--fg); }
.ov-intra__head { display: flex; align-items: baseline; flex-wrap: wrap; gap: 2px 10px; }
.ov-intra__chg { font: 600 14px/19px var(--font); font-variant-numeric: tabular-nums; }
.ov-intra__meta { font-size: 12px; line-height: 17px; color: var(--fg-muted); font-variant-numeric: tabular-nums; }
.ov-intra__plot { position: relative; touch-action: pan-y; cursor: crosshair; }
.ov-intra__plot svg { width: 100%; height: 100%; display: block; overflow: visible; }
.ov-intra__axis { display: flex; justify-content: space-between; font-size: 11px; color: var(--fg-muted); font-variant-numeric: tabular-nums; }
.ov-intra__empty { display: grid; place-items: center; text-align: center; padding: 0 16px; font-size: 13px; color: var(--fg-muted); border: 1px dashed var(--border); border-radius: var(--r-2, 12px); }
.ov-m__chart .ov-intra { padding: 0 16px; }
.ov-cfd__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.ov-cfd__val { font: 650 28px/1.1 var(--font); letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.ov-cfd__pnl { font: 600 15px/20px var(--font); font-variant-numeric: tabular-nums; }
.ov-cfd__live { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--fg-muted); font-variant-numeric: tabular-nums; }
.ov-cfd__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--positive); box-shadow: 0 0 0 0 color-mix(in srgb, var(--positive) 60%, transparent); animation: ov-cfd-pulse 1.6s ease-out infinite; }
.ov-cfd__dot--off { background: var(--fg-subtle); animation: none; }
@keyframes ov-cfd-pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--positive) 55%, transparent); } 100% { box-shadow: 0 0 0 7px transparent; } }
@media (prefers-reduced-motion: reduce) { .ov-cfd__dot { animation: none; } }
.ov-cfd__pos { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 2px 12px; align-items: center; padding: 12px 0; border-top: 1px solid var(--border); margin-top: 12px; }
.ov-cfd__tick { width: 36px; height: 36px; border-radius: 50%; background: var(--surface-2); display: grid; place-items: center; font: 650 10px/1 var(--font); color: var(--fg-muted); grid-row: span 2; }
.ov-cfd__name { font: 600 14px/19px var(--font); }
.ov-cfd__sub { font-size: 12.5px; color: var(--fg-muted); font-variant-numeric: tabular-nums; }
.ov-cfd__end { text-align: right; font-variant-numeric: tabular-nums; grid-row: span 2; display: flex; flex-direction: column; gap: 2px; }
.ov-cfd__px { font: 650 15px/20px var(--font); transition: color .3s; }
.ov-cfd__px.is-up { color: var(--positive); } .ov-cfd__px.is-down { color: var(--negative); }
.ov-cfd__grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border-top: 1px solid var(--border); padding-top: 10px; }
.ov-cfd__grid > div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ov-cfd__grid dt { font-size: 12px; color: var(--fg-muted); }
.ov-cfd__grid dd { margin: 0; font: 600 14px/19px var(--font); font-variant-numeric: tabular-nums; }
.ov-cfd__bar { height: 4px; border-radius: 2px; background: var(--surface-2); overflow: hidden; margin-top: 4px; }
.ov-cfd__bar > i { display: block; height: 100%; border-radius: 2px; }
@media (max-width: 520px) { .ov-cfd__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 10px; } }
.ov-top { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.ov-left { flex: 7 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.ov-right { flex: 5 1 380px; min-width: 0; display: flex; flex-direction: column; }
.ov-right > .ov-hold { flex: 1 1 0; height: 0; min-height: 0; display: flex; flex-direction: column; }
.ov-right--stacked > .ov-hold { flex: none; height: auto; }
.ov-hold > .ps-ht { flex: 1; min-height: 0; }
.ov-hold > .ps-ht > .ps-ht__scroll { flex: 1; }
.ov-right--stacked .ov-hold > .ps-ht > .ps-ht__scroll { max-height: 640px; }

/* Bezittingen zonder kaart: randloos, rijen gescheiden door haarlijnen */
.ov-hold { min-width: 0; display: flex; flex-direction: column; }
.ov-hold__head { display: flex; align-items: center; gap: 8px 12px; flex-wrap: wrap; padding: 0 0 10px; }
.ov-hold__title { margin: 0; font: 650 18px/24px var(--font); letter-spacing: -0.006em; color: var(--fg); }
.ov-hold__meta { font-size: 12.5px; color: var(--fg-muted); }
.ov-hold__head .ov-link { margin-left: auto; }
.ov-hold .ps-ht th:first-child, .ov-hold .ps-ht td:first-child { padding-left: 4px; }
.ov-hold .ps-ht th:last-child, .ov-hold .ps-ht td:last-child { padding-right: 4px; }
.ov-hold .ps-ht th { border-bottom-color: var(--border); }
.ov-hold .ps-group td { height: 34px; }
.ov-hold .ps-ht tfoot td { border-top-color: var(--border); }
.ov-hold .ps-ht__note { padding: 10px 4px 0; border-top: 0; }
.ov-hold .ps-row:hover td, .ov-hold .ps-row:focus-visible td { background: var(--surface-2); }
.ov-row2 { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.ov-row2 > .ov-verdeling { flex: 4 1 300px; }
.ov-row2 > .ov-attn { flex: 3 1 260px; }
.ov-row3 { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.ov-row3 > .card { flex: 1 1 300px; }

/* Prestaties */
.ov-perf .card__body { padding: 0 !important; }
.ov-perf__top { display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px 0; flex-wrap: wrap; }
.ov-perf__hero { flex: 1; min-width: 280px; }
.ov-perf__ctrl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.ov-label { font: 500 12.5px/17px var(--font); color: var(--fg-muted); }
.ov-label .ov-stamp { color: var(--fg-subtle); font-weight: 400; }
.ov-hero { margin: 4px 0 6px; font: 600 44px/48px var(--font); letter-spacing: -0.032em; color: var(--fg); font-variant-numeric: tabular-nums lining-nums; white-space: nowrap; }
:root[data-theme="dark"] .ov-hero { font-weight: 560; }
.ov-hero__cur { font-size: .56em; color: var(--fg-muted); vertical-align: .32em; margin-right: .06em; font-weight: 500; }
.ov-hero__sign { margin-right: .02em; }
.ov-deltarow { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; min-height: 22px; }
.ov-deltarow .delta__context { color: var(--fg-muted); font-weight: 400; font-size: 13px; }
.ov-subrow { margin-top: 6px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px 14px; font-size: 12.5px; line-height: 17px; color: var(--fg-muted); }
.ov-subrow b { font-weight: 600; color: var(--fg); font-variant-numeric: tabular-nums; }
.ov-subrow .ov-gain b, .ov-gain { color: var(--gain); }
.ov-subrow .ov-loss b, .ov-loss { color: var(--loss); }
.ov-legend { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 14px; padding: 14px 20px 8px; }
.ov-legend__items { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 14px; flex: 1; min-width: 0; font-size: 12px; color: var(--fg-muted); }
.ov-key { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.ov-key__line { width: 14px; height: 2px; background: var(--fg); border-radius: 1px; }
.ov-key__step { width: 12px; height: 8px; border-top: 1.5px solid var(--fg-muted); border-right: 1.5px solid var(--fg-muted); }
.ov-key__band { width: 12px; height: 10px; background: var(--gain-fill); opacity: .45; border-radius: 2px; }
.ov-key__dia { width: 7px; height: 7px; background: var(--fg-muted); transform: rotate(45deg); }
.ov-key__ring { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--fg-muted); }
.ov-chartwrap { padding: 0 20px 6px; }
.ov-chartnote { padding: 0 20px 8px; font-size: 12px; color: var(--fg-subtle); }
.ov-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--border); }
.ov-kpis > .kpi { padding: 14px 20px 16px; border-left: 1px solid var(--border); }
.ov-kpis > .kpi:first-child { border-left: 0; }
.ov-kpis .kpi__value { font-size: 20px; line-height: 26px; }
.ov-pin { margin-right: 4px; }

/* Verdeling */
.ov-vrows { display: flex; flex-direction: column; gap: 2px; margin-top: 14px; }
.ov-vrow { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(60px, 1fr) 54px 64px; align-items: center; gap: 10px; min-height: 26px; border: 0; background: none; padding: 0 4px; margin: 0 -4px; font: inherit; font-size: 13px; color: var(--fg); text-align: left; cursor: pointer; border-radius: 6px; width: calc(100% + 8px); }
.ov-vrow:hover { background: var(--surface-2); }
.ov-vrow--nodrift { grid-template-columns: minmax(0, 1.3fr) minmax(60px, 1fr) 54px; }
.ov-vrow__lab { display: flex; align-items: center; gap: 8px; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ov-vrow__num { text-align: right; font-variant-numeric: tabular-nums; font-weight: 550; }
.ov-vrow__drift { text-align: right; font-variant-numeric: tabular-nums; font-size: 12px; color: var(--fg-subtle); white-space: nowrap; display: inline-flex; align-items: center; justify-content: flex-end; gap: 3px; }
.ov-vrow__drift--out { color: var(--warn); font-weight: 550; }
.ov-link { border: 0; background: none; padding: 0; font: 500 12.5px/16px var(--font); color: var(--fg-muted); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.ov-link:hover { color: var(--fg); text-decoration: underline; text-underline-offset: 2px; }
.ov-link--strong { color: var(--fg); font-weight: 600; }

/* Aandacht */
.ov-attn__list { display: flex; flex-direction: column; gap: 14px; }
.ov-item { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 10px; align-items: start; }
.ov-item__ic { color: var(--fg-muted); margin-top: 1px; }
.ov-item--warn .ov-item__ic { color: var(--warn); }
.ov-item__title { font: 550 13px/18px var(--font); color: var(--fg); }
.ov-item__sub { font-size: 12px; line-height: 17px; color: var(--fg-muted); }
.ov-item__act { border: 0; background: none; padding: 0; margin-left: 4px; font: 500 12px/17px var(--font); color: var(--fg); text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }
.ov-ok { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--fg-muted); }
.ov-ok svg { color: var(--gain); }
.ov-foot { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--fg-subtle); }
.ov-foot svg { color: var(--gain); }

/* Explainer */
.ov-explain { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 13px; line-height: 19px; color: var(--fg-muted); max-width: 380px; white-space: normal; }
.ov-explain b { color: var(--fg); font-weight: 600; }

/* First run */
.ov-first { display: flex; flex-direction: column; gap: 16px; }
.ov-first__steps { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; font-size: 13px; color: var(--fg-muted); }
.ov-first__steps span b { color: var(--fg); margin-right: 4px; }
.ov-first__ph { height: 160px; border: 1.5px dashed var(--border-strong); border-radius: var(--r-card); }

/* Mobile: strak en rustig; het totaal bovenaan is de titel van het scherm */
.ov-m { display: flex; flex-direction: column; gap: 24px; padding: 4px 16px 8px; min-width: 0; }
.ov-m__hero { display: flex; flex-direction: column; min-width: 0; }
.ov-m__herotop { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; }
.ov-m__herotop .ov-label { font-size: 13.5px; line-height: 18px; }
.ov-m__herotop .icon-btn { width: 44px; height: 44px; margin-right: -12px; color: var(--fg); }
.ov-m__hero .ov-hero { font-size: 44px; line-height: 48px; letter-spacing: -0.035em; margin: 0; }
.ov-m__delta { margin-top: 6px; display: flex; align-items: center; flex-wrap: wrap; gap: 2px 8px; min-height: 22px; }
.ov-m__delta .delta { font-size: 14.5px; font-weight: 550; }
.ov-m__ctx { font-size: 14px; line-height: 20px; color: var(--fg-muted); }
.ov-m__info { display: inline-grid; place-items: center; width: 24px; height: 24px; margin-left: -4px; border: 0; background: none; padding: 0; color: var(--fg-subtle); cursor: pointer; position: relative; }
.ov-m__info::after { content: ''; position: absolute; inset: -10px; }
.ov-m__chartblock { display: flex; flex-direction: column; margin-top: -4px; }
.ov-m__chart { margin: 0 -16px; }
.ov-m__periods { display: flex; justify-content: space-between; margin: 10px -6px 0; }
.ov-m__period { flex: 1 1 0; min-width: 0; height: 44px; border: 0; background: none; padding: 0; display: grid; place-items: center; cursor: pointer; font: 500 13.5px/1 var(--font); color: var(--fg-muted); font-variant-numeric: tabular-nums; }
.ov-m__period > span { display: grid; place-items: center; height: 32px; min-width: 40px; padding: 0 11px; border-radius: var(--r-pill); transition: background var(--d-1) var(--ease), color var(--d-1) var(--ease); }
.ov-m__period[aria-checked="true"] { font-weight: 600; }
.ov-m__period[aria-checked="true"] > span { background: var(--ink); color: var(--on-ink); }
.ov-m__period[aria-disabled="true"] { opacity: .35; cursor: not-allowed; }
.ov-m__modes { display: flex; justify-content: center; gap: 4px; margin-top: 2px; }
.ov-m__mode { height: 40px; padding: 0 12px; border: 0; background: none; cursor: pointer; font: 500 13.5px/1 var(--font); color: var(--fg-subtle); position: relative; }
.ov-m__mode[aria-checked="true"] { color: var(--fg); font-weight: 600; }
.ov-m__mode[aria-checked="true"]::after { content: ''; position: absolute; left: 12px; right: 12px; bottom: 7px; height: 2px; border-radius: 1px; background: linear-gradient(90deg, var(--chart-a), var(--chart-b)); }
.ov-secthead { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 0 10px; }
.ov-secthead .ov-sect { margin: 0; }
.ov-sect { margin: 0 0 10px; font: 650 18px/24px var(--font); letter-spacing: -0.006em; }
.ov-fy { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; margin: 0 -16px; padding: 0 16px 4px; scrollbar-width: none; overscroll-behavior-x: contain; }
.ov-fy::-webkit-scrollbar { display: none; }
.ov-fy > .card { flex: 0 0 min(300px, 84%); scroll-snap-align: start; display: flex; flex-direction: column; }
.ov-fy > .card .card__body { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.ov-fy__cta { margin-top: auto; align-self: flex-start; }
.ov-dots { display: flex; justify-content: center; gap: 6px; margin-top: 10px; }
.ov-dots span { width: 6px; height: 6px; border-radius: 3px; background: var(--border-strong); transition: width var(--d-2) var(--ease), background var(--d-2) var(--ease); }
.ov-dots span.is-on { width: 16px; background: var(--fg); }
.ov-big { font: 650 30px/36px var(--font); letter-spacing: -0.025em; font-variant-numeric: tabular-nums; }
.ov-track { position: relative; height: 8px; border-radius: 4px; background: var(--surface-3); overflow: hidden; }
.ov-track__fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; background: var(--ink); }
.ov-track__tick { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--surface); }
.ov-small { font-size: 13px; line-height: 18px; color: var(--fg-muted); }
.ov-small b { color: var(--fg); font-weight: 600; font-variant-numeric: tabular-nums; }
.ov-caption { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 12.5px; color: var(--fg-subtle); margin: 8px 0 4px; }
.ov-hold--m { margin: 0 -16px; }
.ov-hold--m .ov-hold__head { padding: 0 16px 12px; }
.ov-hold--m .ov-hold__title { font-size: 19px; letter-spacing: -0.012em; }
.ov-hold--m .ov-hold__meta { font-size: 13px; }
.ov-hold--m .ov-hold__alloc { padding: 0 16px 12px; }
.ov-hold--m .ov-caption { margin: 10px 0 0; font-size: 13px; color: var(--fg-muted); }
.ov-hold--m .ps-list { border-bottom: 1px solid var(--border); }
.ov-hold--m .ps-lgroup { padding: 12px 16px 4px; min-height: 46px; border-top: 1px solid var(--border); }
.ov-hold--m .ps-lrow { padding: 8px 16px; border-radius: 0; min-height: 66px; }
.ov-hold--m .ps-lsub, .ov-hold--m .ps-lmore { padding-left: 16px; padding-right: 16px; }
.ov-hold--m .ps-lfold { padding: 8px 16px; margin-top: 0; min-height: 66px; }
.ov-hold--m .ps-lnote { padding: 10px 16px; border-top: 1px solid var(--border); }
.ov-act--m .tr-actlist { border-bottom: 1px solid var(--border); }
.ov-act--m .tr-act { padding: 10px 16px; min-height: 64px; border-radius: 0; }
.ov-act--m .tr-actlist { border-top: 1px solid var(--border); }
.ov-mfoot { text-align: center; font-size: 12.5px; line-height: 18px; color: var(--fg-subtle); padding: 0 16px; }

@media (max-width: 767.98px) {
  .ov-vrow { min-height: 40px; }
  .ov-item__title { font-size: 14px; line-height: 19px; }
  .ov-item__sub { font-size: 13px; line-height: 18px; }
  .ov-item__act { font-size: 13px; min-height: 32px; }
}
`);

function ovCx(...a) { return a.filter(Boolean).join(' '); }
function ovTyping(e) {
  const t = e.target;
  if (!t) return false;
  const tag = (t.tagName || '').toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
}
function ovIsoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function ovLatest(...vals) {
  let best = null;
  for (const v of vals) {
    if (v == null || v === '') continue;
    const d = new Date(v);
    if (!isNaN(d.getTime()) && (!best || d > best)) best = d;
  }
  return best;
}
function ovStamp(app) {
  const d = ovLatest(app.spotStatus && app.spotStatus.fetchedAt, app.syncStatus && app.syncStatus.syncedAt);
  return d ? `${fmtDateLong(ovIsoLocal(d))}, ${fmtTime(d.toISOString())}` : null;
}
// Eén periodekiezer voor het hele Overzicht (totaal, grafiek en posities). Mobiel ook 1D en 1W.
const OV_PERIODS_ALL = [
  { key: '1D', label: '1D', context: 'sinds gisteren' },
  { key: '1W', label: '1W', context: 'afgelopen 7 dagen' },
  ...PERIODS,
];
function ovSetPeriod(app, key) { app.setPrefs({ period: key, positionsPeriod: key }); }
function ovPeriodContext(key, dates) {
  const p = OV_PERIODS_ALL.find(x => x.key === key) || PERIODS[3];
  return p.context.replace('{datum}', dates && dates.length ? fmtDateLong(dates[0]) : '');
}

// Hero value with a small muted € (SPEC §2.5 display).
function OvHeroValue({ value, privacy, testId }) {
  if (privacy) return <div className="ov-hero num" data-testid={testId} aria-label="bedrag verborgen"><span className="ov-hero__cur">€</span>•••••</div>;
  const s = fmtMoney(value);
  const m = /^([−+]?)€\s?(.*)$/u.exec(s);
  if (!m) return <div className="ov-hero num" data-testid={testId}>{s}</div>;
  return (
    <div className="ov-hero num" data-testid={testId} aria-label={s}>
      {m[1] && <span className="ov-hero__sign">{m[1]}</span>}<span className="ov-hero__cur">€</span>{m[2]}
    </div>
  );
}

function OvExplainer() {
  return (
    <ul className="ov-explain">
      <li><b>Totale winst</b> = huidige waarde − netto ingelegd. Netto ingelegd is wat je er per saldo in hebt gestoken: aankopen en stortingen min opbrengsten van verkopen en opnames.</li>
      <li><b>Winst excl. stortingen (periode)</b> = waardeverandering in de periode min wat je in die periode netto hebt ingelegd. Een storting is dus nooit winst.</li>
      <li><b>Het percentage</b> is geldgewogen (Modified Dietz): de winst gedeeld door de beginwaarde plus je stortingen, gewogen naar hoe lang ze in de periode meededen.</li>
      <li><b>Tijdgewogen</b> rekent stortingen helemaal weg en laat zien hoe je beleggingen zelf presteerden.</li>
      <li><b>Rendement p.j.</b> is je geldgewogen jaarrendement over alle stortingen en opnames sinds de start.</li>
      <li><b>Winst per positie</b> telt gerealiseerde winst op verkopen mee; opgeteld is dat gelijk aan je totale winst.</li>
    </ul>
  );
}

// ===================================================================
// Shared performance state (hero + chart + KPIs)
// ===================================================================
function useOvPerformance(app) {
  const { model, prefs, isMobile } = app;
  const periodList = isMobile ? OV_PERIODS_ALL : PERIODS;
  const privacy = !!prefs.privacy;
  const peIds = useMemo(() => model.chartIds.filter(id => model.byId[id] && assetClassOf(model.byId[id].party) === 'pe'), [model]);
  const hasPE = peIds.length > 0;
  const exclPE = !!prefs.exclPE && hasPE;
  const series = useMemo(() => (exclPE ? seriesExcluding(model.series, peIds) : model.series), [model, exclPE, peIds]);
  const dates = series.dates;

  let periodKey = prefs.period || '1J';
  if (!periodList.some(p => p.key === periodKey)) periodKey = '1M';
  let r = periodRange(dates, periodKey);
  if (!r.enabled) {
    for (const k of ['ALL', '1J', 'YTD', '3M', '1M']) {
      const r2 = periodRange(dates, k);
      if (r2.enabled) { r = r2; periodKey = k; break; }
    }
  }
  const periodOptions = periodList.map(p => {
    const en = periodRange(dates, p.key).enabled;
    return { value: p.key, label: p.label, disabled: !en, title: en ? undefined : 'Te weinig data', testId: `period-${p.key}` };
  });

  // De grafiek begint pas op de eerste dag met waarde, niet met een vlakke nul-lijn ervoor (de cijfers blijven over de hele periode).
  let c0 = r.i0;
  if (r.enabled) {
    // Begin op de eerste dag met waarde.
    let top = 0;
    for (let i = r.i0; i <= r.i1; i++) top = Math.max(top, Math.abs(series.value[i] || 0));
    const min = 0.5;
    while (c0 < r.i1 - 1 && !(Math.abs(series.value[c0] || 0) > min)) c0++;
    if (!(Math.abs(series.value[c0] || 0) > min)) c0 = r.i0;
  }

  // Week: één punt per uur, maand: één punt per 5 uur, uit de metingen van het dagverloop (elke 5 min, ook als de app dicht is).
  // Dagen vóór de eerste meting blijven dagpunten. Datums krijgen dan een tijd: 'YYYY-MM-DDTHH:MM'.
  const intra = app.intraday || [];
  const hyStep = !exclPE && prefs.chartMode !== 'return' ? (periodKey === '1W' ? 3600 : periodKey === '1M' ? 5 * 3600 : 0) : 0;
  const hy = useMemo(() => {
    if (!hyStep || !r.enabled || intra.length < 2) return null;
    const pad = v => String(v).padStart(2, '0');
    const loc = ts => { const d = new Date(ts * 1000); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
    const startDay = dates[c0];
    const b = new Map();
    for (const pt of intra) { if (loc(pt[0]).slice(0, 10) >= startDay) b.set(Math.floor(pt[0] / hyStep), pt); }
    const ip = [...b.values()].sort((a, z) => a[0] - z[0]);
    if (ip.length < 2) return null;
    const firstDay = loc(ip[0][0]).slice(0, 10);
    const out = { dates: [], value: [], net: [] };
    for (let i = c0; i <= r.i1; i++) {
      if (dates[i] >= firstDay) break;
      out.dates.push(dates[i]); out.value.push(series.value[i]); out.net.push(series.net[i]);
    }
    for (const pt of ip) { out.dates.push(loc(pt[0])); out.value.push(+pt[1]); out.net.push(+pt[2] || 0); }
    return out.dates.length >= 2 ? out : null;
  }, [hyStep, r.enabled, r.i1, c0, intra, series, dates]); // eslint-disable-line

  // Cursor keyed by date string so background pulls do not cancel it.
  const [cursor, setCursor] = useState(null);
  useEffect(() => { setCursor(null); }, [periodKey, prefs.chartMode, exclPE]);
  let ci = null;
  if (cursor && r.enabled) {
    const i = dates.indexOf(cursor.date);
    if (i >= c0 && i <= r.i1) ci = i;
  }
  const pinned = !!(cursor && cursor.pinned && ci != null && !isMobile);

  // Esc clears the pin; 1–5 choose the period.
  useEffect(() => {
    const onKey = e => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape') { if (cursor && cursor.pinned && !app.overlayOpen) setCursor(null); return; }
      if (ovTyping(e) || app.overlayOpen) return;
      const idx = '12345'.indexOf(e.key);
      if (idx < 0) return;
      const key = PERIODS[idx].key;
      if (periodRange(dates, key).enabled) ovSetPeriod(app, key);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cursor, app, dates]);

  const onCursor = (i, info = {}) => {
    if (i == null) { setCursor(null); return; }
    const d = hy ? hy.dates[i] : dates[c0 + i];
    if (!d) return;
    setCursor({ date: d, pinned: !isMobile && !!info.pinned });
  };

  const end = ci != null ? ci : r.i1;
  const stats = r.enabled ? periodStats(series, r.i0, end, r.all) : null;
  const fullStats = r.enabled ? periodStats(series, r.i0, r.i1, r.all) : null;
  const xirrPct = useMemo(() => (dates.length >= 2 ? xirr(series) : null), [series]);
  const histDays = dates.length >= 2 ? daysBetween(dates[0], dates[dates.length - 1]) : 0;

  // Hero at rest = included parties (minus included PE when Excl. PE).
  const peInc = exclPE ? model.included.filter(s => assetClassOf(s.party) === 'pe') : [];
  const sumOf = f => peInc.reduce((a, s) => a + (f(s) || 0), 0);
  const restValue = model.totals.value - sumOf(s => s.currentValueEur);
  const restNet = model.totals.netInvested - sumOf(s => s.costBasis - s.realizedPnl);
  const restPnl = model.totals.pnl - sumOf(s => s.pnl);
  const restInvested = model.totals.invested - sumOf(s => s.invested);
  const restPnlPct = restInvested > 0 ? restPnl / restInvested * 100 : null;

  const heroValue = ci != null ? series.value[ci] : restValue;
  const heroNet = ci != null ? series.net[ci] : restNet;
  const heroWinst = heroValue - heroNet;
  const deltaGain = stats ? stats.gain : null;
  let deltaPct = stats ? stats.pct : null;
  let context;
  if (ci != null) context = 't.o.v. begin periode';
  else if (r.all) {
    deltaPct = restPnlPct;
    context = `op inleg · ${ovPeriodContext('ALL', dates)}` + (xirrPct != null && histDays >= 365 ? ` · ${fmtPct(xirrPct, { decimals: 1 })} p.j.` : '');
  } else {
    context = `winst excl. stortingen · ${ovPeriodContext(periodKey, dates)}` + (stats && stats.annualized != null ? ` · ${fmtPct(stats.annualized, { decimals: 1 })} p.j.` : '');
  }

  // Chart data
  const mode = prefs.chartMode === 'return' || prefs.chartMode === 'gain' ? prefs.chartMode : 'value';
  const chartDates = r.enabled ? dates.slice(c0, r.i1 + 1) : [];
  const twrCurve = useMemo(() => (mode === 'return' && r.enabled ? (cumulativeTwr(series, r.i0, r.i1) || []).slice(c0 - r.i0) : null), [mode, series, r.i0, c0, r.i1, r.enabled]);
  // Winst = waarde − netto ingelegd; bij een periode vanaf 0 aan het begin (= winst excl. stortingen in die periode).
  const gainCurve = useMemo(() => {
    if (mode !== 'gain' || !r.enabled) return null;
    const g = i => (series.value[i] == null || series.net[i] == null ? null : series.value[i] - series.net[i]);
    const base = r.all ? 0 : (g(r.i0) || 0);
    const out = [];
    for (let i = c0; i <= r.i1; i++) { const v = g(i); out.push(v == null ? null : v - base); }
    return out;
  }, [mode, series, r.i0, c0, r.i1, r.enabled, r.all]);
  const primary = mode === 'return' ? (twrCurve || []) : mode === 'gain' ? (gainCurve || []) : (r.enabled ? series.value.slice(c0, r.i1 + 1) : []);
  const secondary = mode === 'value' && r.enabled ? series.net.slice(c0, r.i1 + 1) : null;
  const twrAllNull = mode === 'return' && primary.every(v => v == null);
  const peSet = new Set(exclPE ? peIds : []);
  const markers = model.markers
    .filter(m => !peSet.has(m.partyId) && m.index >= c0 && m.index <= r.i1)
    .map(m => ({ ...m, index: m.index - c0 }));
  const valueText = i => {
    const d = chartDates[i];
    if (!d) return '';
    if (mode === 'return') return `${fmtDateLong(d)}: ${primary[i] == null ? '—' : fmtPct(primary[i], { decimals: 1 })}`;
    if (mode === 'gain') return `${fmtDateLong(d)}: winst ${privacy ? 'bedrag verborgen' : fmtMoney(primary[i], { sign: true })}`;
    return `${fmtDateLong(d)}: ${privacy ? 'bedrag verborgen' : fmtMoney(primary[i])}`;
  };

  // Fijnmazige week/maand: grafiek, cursor en held op de uurpunten.
  if (hy) {
    const hci = cursor ? hy.dates.indexOf(cursor.date) : -1;
    const V0 = series.value[r.i0] || 0, N0 = series.net[r.i0] || 0;
    const denom = fullStats && fullStats.pct ? fullStats.gain / (fullStats.pct / 100) : V0;
    const gainAt = k => (hy.value[k] - hy.net[k]) - (V0 - N0);
    const out = {
      dates: hy.dates, c0: 0, chartDates: hy.dates,
      primary: mode === 'gain' ? hy.value.map((v, k) => (v == null ? null : gainAt(k))) : hy.value,
      secondary: null,   // inleg-lijn valt ver onder de strakke as; de inleg staat bij het slepen in de kop
      markers: model.markers.filter(m => !peSet.has(m.partyId) && m.index >= c0 && m.index <= r.i1)
        .map(m => ({ ...m, index: hy.dates.findIndex(d => d.slice(0, 10) >= dates[m.index]) })).filter(m => m.index >= 0),
    };
    out.valueText = i => {
      const d = hy.dates[i];
      if (!d) return '';
      return mode === 'gain' ? `${fmtDateLong(d)}: winst ${privacy ? 'bedrag verborgen' : fmtMoney(out.primary[i], { sign: true })}`
        : `${fmtDateLong(d)}: ${privacy ? 'bedrag verborgen' : fmtMoney(hy.value[i])}`;
    };
    if (hci >= 0) {
      const g = gainAt(hci);
      Object.assign(out, { ci: hci, heroValue: hy.value[hci], heroNet: hy.net[hci], heroWinst: hy.value[hci] - hy.net[hci],
        deltaGain: g, deltaPct: denom > 0 ? g / denom * 100 : null, context: 't.o.v. begin periode',
        pinned: !!(cursor.pinned && !isMobile), pinDay: Math.max(r.i0, dates.findLastIndex(d => d <= hy.dates[hci].slice(0, 10))) });
    } else out.ci = null;
    var hyOut = out;   // eslint-disable-line no-var
  }

  const includedIds = new Set(model.included.map(s => s.party.id));
  const chartSet = new Set(model.chartIds);
  const notInChart = [...includedIds].filter(id => !chartSet.has(id)).length;
  const setsDiffer = notInChart > 0 || model.chartIds.some(id => !includedIds.has(id));

  return {
    series, dates, r, c0, periodKey, periodOptions, cursor, setCursor, ci, pinned, onCursor,
    stats, fullStats, xirrPct, histDays, hasPE, exclPE,
    heroValue, heroNet, heroWinst, deltaGain, deltaPct, context, restPnlPct,
    mode, chartDates, primary, secondary, twrAllNull, markers, valueText,
    setsDiffer, notInChart: notInChart || model.chartIds.filter(id => !includedIds.has(id)).length,
    pinDay: pinned ? ci : null, fine: !!hy,
    ...(hy ? hyOut : {}),
  };
}

// ===================================================================
// Attention items (desktop card + mobile Voor jou)
// ===================================================================
function ovAttentionItems(app) {
  const { model, state, spots } = app;
  const items = [];
  if (app.syncStatus && app.syncStatus.error) {
    items.push({ id: 'sync', tone: 'warn', icon: 'cloud-alert', title: 'Sync mislukt', sub: String(app.syncStatus.error), action: { label: 'Opnieuw', onClick: () => app.syncNow() } });
  }
  if (app.spotStatus && app.spotStatus.error) {
    items.push({ id: 'spot', tone: 'warn', icon: 'triangle-alert', title: 'Koersen ophalen mislukt', sub: String(app.spotStatus.error), action: { label: 'Opnieuw', onClick: () => app.refreshSpot({ manual: true }) } });
  }
  const drift = driftRows(model.summaries, state.targetAllocation);
  const out = drift.rows.filter(rw => rw.outside).sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));
  const goPlan = { label: 'Bijstortplan', onClick: () => app.navigate('/plan/verdeling') };
  const driftLabel = rw => (drift.grouping === 'party' ? rw.label : ovClassLabel(rw.key, rw.label));
  if (out.length > 2) {
    items.push({ id: 'drift', tone: 'warn', icon: 'triangle-alert', title: `${out.length} categorieën wijken meer dan ${ATTENTION_THRESHOLDS.driftPt} pt af van je doel`, sub: out.slice(0, 3).map(rw => `${driftLabel(rw)} ${fmtPt(rw.drift)}`).join(' · '), action: goPlan, drift: out });
  } else {
    out.forEach(rw => items.push({ id: 'drift-' + rw.key, tone: 'warn', icon: 'triangle-alert', title: `${driftLabel(rw)} ${fmtPt(rw.drift)} t.o.v. doel`, sub: `Doel ${fmtPct(rw.target, { decimals: 0, sign: false })} · nu ${fmtPct(rw.current, { decimals: 1, sign: false })}`, action: goPlan, drift: [rw] }));
  }
  const finPending = ((state && state.transactions) || []).filter(isFinBelAanvullen).sort((a, b) => b.date.localeCompare(a.date));
  if (finPending.length) {
    const n = finPending.length;
    const one = n === 1 ? finPending[0] : null;
    items.push({ id: 'fin-aanvullen', tone: 'warn', icon: 'pencil',
      title: `${finBelOpenTitle(n)} (uit Financieel)`,
      sub: finPending.slice(0, 2).map(t => `${finBelPartyLabel(model.allParties, t.party)} ${app.prefs && app.prefs.privacy ? '€ •••••' : fmtMoney(+t.amountEur || 0, { decimals: 2 })} · ${fmtDateShort(t.date)}`).join(' · ') + (n > 2 ? ' …' : ''),
      action: one ? { label: 'Aanvullen', onClick: () => app.completeFinTx(one) } : { label: 'Bekijken', onClick: () => app.navigate('/posities') } });
  }
  if (model.orphans.length) {
    items.push({ id: 'orphans', tone: 'warn', icon: 'triangle-alert', title: `${model.orphans.length} transacties zonder partij`, sub: 'Deze tellen niet mee in je posities.', action: { label: 'Bekijken', onClick: () => app.navigate('/transacties?partij=__orphan') } });
  }
  for (const s of model.summaries) {
    const u = s.party.unit;
    if ((u !== 'bundle' && u !== 'eur') || !(s.currentValueEur > 0)) continue;
    const sub = holdingSubline(s, spots);
    if (sub.staleDays == null) continue;
    if (s.external) {
      items.push({ id: 'stale-' + s.party.id, tone: 'warn', icon: 'clock', title: `${s.party.name} · ${sub.staleDays} dagen niet bijgewerkt`, sub: 'Wordt live bijgewerkt door het Financieel Systeem.' });
      continue;
    }
    items.push({ id: 'stale-' + s.party.id, tone: 'warn', icon: 'clock', title: `${s.party.name} · waardering ${sub.staleDays} dagen oud`, sub: s.lastValuationDate ? `Laatste waardering ${fmtDateLong(s.lastValuationDate)}` : 'Nog geen waardering', action: { label: 'Bijwerken', onClick: () => app.openTx({ party: s.party.id, type: 'waardering' }) } });
  }
  const total = model.totals.value;
  if (total > 0) {
    const top = model.included.slice().sort((a, b) => b.currentValueEur - a.currentValueEur)[0];
    const share = top ? top.currentValueEur / total * 100 : 0;
    if (top && share > ATTENTION_THRESHOLDS.concentrationPct) {
      items.push({ id: 'conc', tone: 'info', icon: 'info', title: `${fmtPct(share, { decimals: 0, sign: false })} zit in één positie`, sub: top.party.name, action: { label: 'Bekijken', onClick: () => app.navigate('/posities/' + encodeURIComponent(top.party.id)) } });
    }
  }
  const nav = spots && Array.isArray(spots.meesmanNavHistory) ? spots.meesmanNavHistory : [];
  const lastNav = nav.length ? nav[nav.length - 1] : null;
  const lastNavDate = lastNav && (lastNav.date || lastNav.d || null);
  if (lastNavDate && daysBetween(String(lastNavDate).slice(0, 10), todayIsoLocal()) > ATTENTION_THRESHOLDS.navStaleDays) {
    items.push({ id: 'nav', tone: 'info', icon: 'clock', title: `Meesman-koers van ${fmtDateLong(String(lastNavDate).slice(0, 10))}`, sub: spots.meesmanNavEur ? `NAV ${fmtMoney(spots.meesmanNavEur, { decimals: 4 })}` : null, action: { label: 'Bijwerken', onClick: () => app.navigate('/instellingen/koersen') } });
  }
  return items.sort((a, b) => (a.tone === b.tone ? 0 : a.tone === 'warn' ? -1 : 1));
}

function ovClassLabel(categoryKey, fallback) {
  const k = assetClassOf({ category: categoryKey });
  return k === 'other' ? fallback : ASSET_CLASS_BY_KEY[k].label;
}

function ovStatusLine(app) {
  const sp = app.spotStatus || {};
  const sy = app.syncStatus || {};
  const fetched = ovLatest(sp.fetchedAt);
  const stale = !fetched || (Date.now() - fetched.getTime()) > ATTENTION_THRESHOLDS.priceStaleHours * 3600 * 1000;
  const prices = sp.error ? 'Koersen: fout' : stale ? (fetched ? `Koersen van ${fmtTime(fetched.toISOString())}` : 'Koersen niet opgehaald') : 'Koersen live';
  const sync = !app.sbOk ? 'sync niet gekoppeld' : sy.error ? 'sync mislukt' : 'sync actief';
  const ok = !sp.error && !stale && !sy.error && app.sbOk;
  return { text: `${prices} · ${sync}`, ok };
}

function OvAttentionList({ items, max = 4 }) {
  const shown = items.slice(0, max);
  return (
    <div className="ov-attn__list">
      {shown.map(it => (
        <div key={it.id} className={ovCx('ov-item', it.tone === 'warn' && 'ov-item--warn')}>
          <Icon name={it.icon} size={16} className="ov-item__ic" />
          <div style={{ minWidth: 0 }}>
            <div className="ov-item__title">{it.title}</div>
            <div className="ov-item__sub">
              {it.sub}{it.sub && it.action ? ' · ' : ''}
              {it.action && <button type="button" className="ov-item__act" style={{ marginLeft: 0 }} onClick={it.action.onClick}>{it.action.label}</button>}
            </div>
          </div>
        </div>
      ))}
      {items.length > max && <div className="ov-item__sub">{items.length - max} meer</div>}
    </div>
  );
}

function OvAttentionCard({ app, items }) {
  const st = ovStatusLine(app);
  return (
    <Card className="ov-attn" data-testid="attention-card" title="Aandacht" meta={items.length ? String(items.length) : null}
      footer={<span className="ov-foot"><Icon name={st.ok ? 'check' : 'clock'} size={13} style={st.ok ? null : { color: 'var(--warn)' }} />{st.text}</span>}>
      {items.length
        ? <OvAttentionList items={items} />
        : <div className="ov-ok"><Icon name="check" size={16} />Alles up-to-date</div>}
    </Card>
  );
}

// ===================================================================
// Open beleggingen uit Financieel (bovenaan, zodat je ze niet vergeet)
// ===================================================================
const OV_FIN_MAX = 5;
function OvFinOpen({ app }) {
  const list = ((app.state && app.state.transactions) || []).filter(isFinBelAanvullen)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  if (!list.length) return null;
  const parties = (app.model && app.model.allParties) || [];
  const shown = list.slice(0, OV_FIN_MAX);
  const total = list.reduce((a, t) => a + (+t.amountEur || 0), 0);
  return (
    <Card className="ov-fin" data-testid="ov-fin-open" padding={app.isMobile ? 14 : 16}
      title={<><Icon name="pencil" size={16} />{finBelOpenTitle(list.length)}</>}
      meta={list.length > 1 ? <Money value={total} decimals={2} /> : null}>
      <p className="ov-fin__note">Uit Financieel (Vermogensopbouw). Tot je ze aanvult tellen ze als ingelegd tegen kostprijs.</p>
      <div className="ov-fin__list">
        {shown.map(tx => {
          const party = parties.find(p => p.id === tx.party) || null;
          return (
            <ListRow key={tx.id} testId={`ov-fin-${tx.id}`}
              leading={party ? <Monogram party={party} size={28} /> : <span className="monogram monogram--28" aria-hidden="true"><Icon name="circle-alert" size={14} style={{ color: "var(--warn)" }} /></span>}
              title={finBelPartyLabel(parties, tx.party)}
              subtitle={party ? fmtDateLong(tx.date) : `${fmtDateLong(tx.date)} · onbekende positie, kies de juiste bij aanvullen`}
              value={<Money value={+tx.amountEur || 0} decimals={2} />}
              secondary={<Button size="sm" variant="primary" icon="pencil" onClick={() => app.completeFinTx(tx)}>Aanvullen</Button>} />
          );
        })}
      </div>
      {list.length > shown.length && (
        <div className="ov-fin__more">
          <button type="button" className="ov-link ov-link--strong" onClick={() => app.navigate('/posities')}>
            Nog {list.length - shown.length} bij Posities <Icon name="chevron-right" size={14} />
          </button>
        </div>
      )}
    </Card>
  );
}

// ===================================================================
// CFD live (Trading 212 CFD): accountwaarde, open resultaat en koers per tick
// ===================================================================
function OvCfdPos({ x, privacy, onClose }) {
  const prev = React.useRef(x.currentPrice);
  const [dir, setDir] = useState(null);
  React.useEffect(() => {
    if (prev.current != null && x.currentPrice !== prev.current) {
      setDir(x.currentPrice > prev.current ? 'is-up' : 'is-down');
      const t = setTimeout(() => setDir(null), 700);
      prev.current = x.currentPrice;
      return () => clearTimeout(t);
    }
    prev.current = x.currentPrice;
    return undefined;
  }, [x.currentPrice]);
  const sym = { USD: '$', EUR: '€', GBP: '£' }[x.currency] || '';
  const px = v => (v == null ? '—' : sym + new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v));
  const tone = x.pnl > 0.005 ? 'pos' : x.pnl < -0.005 ? 'neg' : '';
  return (
    <div className="ov-cfd__pos" data-testid={`ov-cfd-pos-${x.symbol}`}>
      <span className="ov-cfd__tick" aria-hidden="true">{cfdSymbolOf(x)}</span>
      <span className="ov-cfd__name">{x.name} · {x.dir === 'sell' ? 'Short' : 'Long'}</span>
      <span className="ov-cfd__end">
        <span className={'ov-cfd__px' + (dir ? ' ' + dir : '')}>{px(x.currentPrice)}</span>
        <span className={'ov-cfd__pnl ' + (tone ? `tone-${tone}` : '')} style={{ color: tone === 'neg' ? 'var(--negative)' : tone === 'pos' ? 'var(--positive)' : undefined }}>
          {x.pnl == null ? '—' : privacy ? '€ •••••' : fmtMoney(x.pnl, { sign: true, decimals: 2 })}</span>
        {onClose && <button type="button" className="ov-cfd__close" onClick={onClose} data-testid={`cfd-close-${x.symbol}`}>Sluiten</button>}
      </span>
      <span className="ov-cfd__sub">{fmtQty(x.quantity, '', { decimals: x.quantity % 1 === 0 ? 0 : 4 }).trim()} st. · geopend {px(x.openPrice)}{x.openPrice > 0 && x.currentPrice != null ? ` · ${fmtPct((x.currentPrice / x.openPrice - 1) * 100 * (x.dir === 'sell' ? -1 : 1), { decimals: 2 })}` : ''}</span>
    </div>
  );
}
function OvCfdLive({ app, s: sProp = null, embedded = false }) {
  const ticks = useCfdTicks();
  const s = sProp || ((app.model && app.model.summaries) || []).find(x => x && x.party && x.party.cfd && x.party.includeInTotal !== false);
  if (!s) return null;
  const c = cfdLive(cfdNormalize(s.party.cfd), app.stockQuotes, ticks);
  if (!c || c.accountValue == null) return null;
  const privacy = !!app.prefs.privacy;
  const netIn = s.costBasis - (s.realizedPnl || 0);
  const total = c.accountValue - netIn;
  const fresh = c.stream && c.marketTime && (Date.now() - Date.parse(c.marketTime) < 120000);
  const hpct = c.health == null ? null : Math.max(0, Math.min(100, c.health));
  const hcol = hpct == null ? 'var(--fg-subtle)' : hpct < 25 ? 'var(--negative)' : hpct < 50 ? 'var(--warn)' : 'var(--positive)';
  const M = v => <Money value={v} decimals={2} />;
  // Sluiten: het sluitformulier met deze positie; live waarden staan klaar, de echte cijfers uit Trading 212 kun je invullen.
  const closeAt = x => app.openTx({ type: 'verkoop', party: s.party.id, cfdPosition: x.id });
  const live = <span className="ov-cfd__live"><span className={'ov-cfd__dot' + (fresh ? '' : ' ov-cfd__dot--off')} />{c.stream ? (fresh ? 'Live' : 'Markt dicht') : c.live ? 'Koers per 10 min' : 'Laatste stand'}{c.marketTime ? ' · ' + new Date(c.marketTime).toLocaleTimeString('nl-NL') : ''}</span>;
  const inner = (
    <>
      <div className="ov-cfd__head">
        <div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Accountwaarde</div>
          <div className="ov-cfd__val">{M(c.accountValue)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Open resultaat</div>
          <div className="ov-cfd__pnl" style={{ color: c.openPnl < -0.005 ? 'var(--negative)' : c.openPnl > 0.005 ? 'var(--positive)' : undefined }}>
            {privacy ? '€ •••••' : fmtMoney(c.openPnl, { sign: true, decimals: 2 })}
            {c.accountValue - c.openPnl > 0 ? <span style={{ fontWeight: 500, color: 'var(--fg-muted)' }}> · {fmtPct(c.openPnl / (c.accountValue - c.openPnl) * 100, { decimals: 2 })}</span> : null}
          </div>
        </div>
      </div>
      {c.positions.map(x => <OvCfdPos key={x.id} x={x} privacy={privacy} onClose={app.openTx ? () => closeAt(x) : null} />)}
      {app.openTx && <button type="button" className="ov-cfd__new" onClick={() => app.openTx({ type: 'koop', party: s.party.id })} data-testid="cfd-new">+ Nieuwe CFD-positie openen</button>}
      <dl className="ov-cfd__grid" style={{ margin: 0 }}>
        <div><dt>Cash</dt><dd>{M(c.cash)}</dd></div>
        <div><dt>Margin</dt><dd>{M(c.margin)}</dd></div>
        <div><dt>Health{c.healthEstimated ? ' ≈' : ''}</dt><dd>{hpct == null ? '—' : `${Math.round(hpct)}%`}</dd>
          {hpct != null && <div className="ov-cfd__bar"><i style={{ width: hpct + '%', background: hcol }} /></div>}</div>
        <div><dt>Winst totaal</dt><dd style={{ color: total < -0.005 ? 'var(--negative)' : total > 0.005 ? 'var(--positive)' : undefined }}>{privacy ? '€ •••••' : fmtMoney(total, { sign: true, decimals: 2 })}</dd></div>
      </dl>
    </>
  );
  if (embedded) return <div className="ov-cfd-embed" data-testid="cfd-live"><div className="ov-cfd-embed__top">{live}</div>{inner}</div>;
  return (
    <Card padding={app.isMobile ? 14 : 16} data-testid="ov-cfd-live"
      title={<button type="button" className="ov-link ov-link--strong" style={{ padding: 0 }} onClick={() => app.navigate('/posities/' + encodeURIComponent(s.party.id))}>{s.party.name}</button>}
      meta={live}>{inner}</Card>
  );
}

// ===================================================================
// Dagverloop: de totale waarde binnen één dag (punten per 5 minuten uit app.intraday)
// ===================================================================
function ovDayKey(ts) { const x = new Date(ts * 1000); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; }
function OvIntraday({ app, height = 176, mode = 'value' }) {
  const pts = app.intraday || [];
  const privacy = !!app.prefs.privacy;
  const days = useMemo(() => [...new Set(pts.map(p => ovDayKey(p[0])))].slice(-7), [pts]);
  const today = todayIsoLocal();
  const [pick, setPick] = useState(null);
  const [hover, setHover] = useState(null);
  const day = pick && days.includes(pick) ? pick : (days.includes(today) ? today : days[days.length - 1]);
  // Vandaag: het actuele totaal als laatste punt, zodat de lijn tot nu loopt.
  const dayPts = useMemo(() => {
    const list = pts.filter(p => ovDayKey(p[0]) === day).map(p => p.slice());
    const t = app.model && app.model.totals;
    if (day === today && t && t.value > 0 && list.length) list.push([Date.now() / 1000, t.value, t.netInvested || 0]);
    return list;
  }, [pts, day, today, app.model]);
  const prev = useMemo(() => { let b = null; for (const p of pts) { if (ovDayKey(p[0]) < day) b = p; else break; } return b; }, [pts, day]);
  const val = p => (mode === 'value' ? p[1] : p[1] - p[2]);
  const base = prev || dayPts[0] || null;
  const chips = days.length > 1 && (
    <div className="ov-intra__days" role="tablist" aria-label="Dag">
      {days.map(k => <button key={k} type="button" role="tab" aria-selected={k === day} className={'ov-intra__day' + (k === day ? ' is-on' : '')} onClick={() => { setPick(k); setHover(null); }}>{k === today ? 'Vandaag' : fmtDateShort(k)}</button>)}
    </div>);
  if (dayPts.length < 2) {
    return (<div className="ov-intra" data-testid="ov-intraday">{chips}
      <div className="ov-intra__empty" style={{ height }}>Nog te weinig metingen{day === today ? ' vandaag' : ''}. De app legt elke 5 minuten de waarde vast zolang hij open is.</div></div>);
  }
  const vals = dayPts.map(val);
  const b0 = val(base);
  let mn = Math.min(...vals, b0), mx = Math.max(...vals, b0);
  if (mx - mn < 1) { mx += 1; mn -= 1; }
  const pad = (mx - mn) * 0.1, lo = mn - pad, hi = mx + pad;
  const W = 1000, H = height;
  const t0 = dayPts[0][0], t1 = dayPts[dayPts.length - 1][0];
  const x = i => (dayPts[i][0] - t0) / ((t1 - t0) || 1) * W;
  const y = v => H - (v - lo) / (hi - lo) * H;
  const path = dayPts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(val(p)).toFixed(1)}`).join('');
  const hp = hover != null && dayPts[hover] ? dayPts[hover] : dayPts[dayPts.length - 1];
  const chg = val(hp) - b0;
  const pct = base[1] > 0 ? chg / base[1] * 100 : null;
  const col = chg < -0.005 ? 'var(--negative)' : chg > 0.005 ? 'var(--positive)' : 'var(--fg-muted)';
  const onMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width * W;
    let best = 0, bd = Infinity;
    for (let i = 0; i < dayPts.length; i++) { const dd = Math.abs(x(i) - cx); if (dd < bd) { bd = dd; best = i; } }
    setHover(best);
  };
  const hm = ts => new Date(ts * 1000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  const money = v => (privacy ? '€ •••••' : fmtMoney(v, { decimals: 0 }));
  return (
    <div className="ov-intra" data-testid="ov-intraday">
      {chips}
      <div className="ov-intra__head">
        <span className="ov-intra__chg" style={{ color: col }}>{privacy ? '€ •••••' : fmtMoney(chg, { sign: true, decimals: 2 })}{pct != null ? ` · ${fmtPct(pct, { decimals: 2 })}` : ''}</span>
        <span className="ov-intra__meta">{hover != null ? `${hm(hp[0])} · ${money(hp[1])} · ingelegd ${money(hp[2])}` : `${prev ? 'sinds slot vorige dag' : 'sinds eerste meting'} · laag ${money(Math.min(...dayPts.map(p => p[1])))} · hoog ${money(Math.max(...dayPts.map(p => p[1])))}`}</span>
      </div>
      <div className="ov-intra__plot" style={{ height }} onMouseMove={onMove} onMouseLeave={() => setHover(null)} onTouchStart={onMove} onTouchMove={onMove} onTouchEnd={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Waardeverloop binnen de dag">
          <defs><linearGradient id="ov-intra-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity=".16" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient></defs>
          <line x1="0" x2={W} y1={y(b0)} y2={y(b0)} stroke="var(--border-strong, var(--border))" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
          <path d={`${path}L${W},${H}L0,${H}Z`} fill="url(#ov-intra-g)" />
          <path d={path} fill="none" stroke={col} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          {hover != null && <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="var(--fg-muted)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
        </svg>
      </div>
      <div className="ov-intra__axis"><span>{hm(t0)}</span><span>{dayPts.length - (day === today ? 1 : 0)} metingen</span><span>{hm(t1)}</span></div>
    </div>
  );
}

// ===================================================================
// Verdeling card
// ===================================================================
function OvVerdelingCard({ app, pinIndex }) {
  const { model, state, prefs } = app;
  const privacy = !!prefs.privacy;
  const goPlan = () => app.navigate('/plan/verdeling');
  let rows, hasTargets, subtitle;
  if (pinIndex != null) {
    const at = holdingsAt(model, pinIndex);
    const byClass = {};
    let tot = 0;
    for (const s of model.included) {
      const h = at[s.party.id];
      if (!h) continue;
      const v = Math.max(0, h.value || 0);
      const k = assetClassOf({ category: s.party.category });   // verdeling: op categorie (PAX Gold = Edelmetaal)
      byClass[k] = (byClass[k] || 0) + v;
      tot += v;
    }
    rows = ASSET_CLASSES.filter(c => byClass[c.key] > 0.5).map(c => ({ key: c.key, label: c.label, color: c.color, value: byClass[c.key], current: tot > 0 ? byClass[c.key] / tot * 100 : 0, target: null, drift: null, outside: false }))
      .sort((a, b) => b.value - a.value);
    hasTargets = false;
    subtitle = `op ${fmtDateLong(model.series.dates[pinIndex])}`;
  } else {
    const d = driftRows(model.summaries, state.targetAllocation);
    hasTargets = d.hasTargets;
    rows = d.rows.filter(rw => rw.value > 0.5 || (rw.target || 0) > 0).map(rw => ({ ...rw, label: d.grouping === 'party' ? rw.label : ovClassLabel(rw.key, rw.label) }));
    subtitle = hasTargets ? 'doel als streepje' : null;
  }
  const slot = k => { const i = ASSET_CLASSES.findIndex(c => c.key === assetClassOf({ category: k })); return i < 0 ? 99 : i; };
  const segs = (pinIndex != null ? rows.slice().sort((a, b) => ASSET_CLASSES.findIndex(c => c.key === a.key) - ASSET_CLASSES.findIndex(c => c.key === b.key))
    : rows.slice().sort((a, b) => slot(a.key) - slot(b.key)))
    .map(rw => ({ key: rw.key, label: rw.label, color: rw.color, value: rw.value }));
  const scaleMax = Math.min(100, Math.max(10, ...rows.map(rw => Math.max(rw.current || 0, rw.target || 0))) * 1.12);
  return (
    <Card className="ov-verdeling" data-testid="verdeling-card" title="Verdeling" meta={subtitle}
      actions={<button type="button" className="ov-link" onClick={goPlan}>Plan <Icon name="arrow-right" size={12} /></button>}
      footer={!hasTargets && pinIndex == null ? <span>Nog geen doelverdeling · <button type="button" className="ov-link ov-link--strong" onClick={goPlan}>Doel instellen <Icon name="arrow-right" size={12} /></button></span> : null}>
      {rows.length === 0 ? <EmptyState icon="layers" title="Nog geen posities" /> : (
        <>
          <AllocationBar segments={segs} height={10} privacy={privacy} ariaLabel="Verdeling per categorie" onSegmentClick={goPlan} />
          <div className="ov-vrows">
            {rows.map(rw => (
              <button key={rw.key} type="button" className={ovCx('ov-vrow', !hasTargets && 'ov-vrow--nodrift')} onClick={goPlan}
                title={privacy ? rw.label : `${rw.label} · ${fmtMoney(rw.value)}`}>
                <span className="ov-vrow__lab"><Swatch color={rw.color} size={9} />{rw.label}</span>
                <BulletTrack current={rw.current} target={hasTargets ? rw.target : null} scaleMax={scaleMax} color={rw.color}
                  tolerance={hasTargets ? ATTENTION_THRESHOLDS.driftPt : null} />
                <span className="ov-vrow__num">{fmtPct(rw.current, { decimals: 1, sign: false })}</span>
                {hasTargets && (
                  <span className={ovCx('ov-vrow__drift', rw.outside && 'ov-vrow__drift--out')}>
                    {rw.outside && <Icon name="triangle-alert" size={12} />}{fmtPt(rw.drift)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

// ===================================================================
// Desktop cards
// ===================================================================
const OV_CHART_MODES = [{ value: 'value', label: 'Waarde' }, { value: 'gain', label: 'Winst' }, { value: 'return', label: 'Rendement' }];

function OvPrestatiesCard({ app, pf }) {
  const { model, prefs } = app;
  const privacy = !!prefs.privacy;
  const stamp = ovStamp(app);
  const label = pf.ci != null ? `Waarde op ${fmtDateLong(pf.dates[pf.ci])}` : (pf.exclPE ? 'Waarde excl. private equity' : 'Totale waarde');
  const t = model.totals;
  const days = pf.histDays;
  let kpi1, kpi1sub;
  if (days < 365) { kpi1 = t.pnlPct; kpi1sub = `over ${Math.max(1, Math.round(days / 30.44))} mnd`; }
  else { kpi1 = pf.xirrPct; kpi1sub = 'geldgewogen · sinds start'; }
  const twr = pf.fullStats && pf.fullStats.twrGaps === 0 ? pf.fullStats.twr : null;
  const perLabel = (PERIODS.find(p => p.key === pf.periodKey) || {}).label;
  const feePct = t.invested > 0 ? t.fees / t.invested * 100 : null;
  const tone = v => (v == null ? null : v > 0 ? 'ov-gain' : v < 0 ? 'ov-loss' : null);
  const twrGapNote = pf.mode === 'return' && pf.fullStats && pf.fullStats.twrGaps > 0 && !pf.twrAllNull;

  return (
    <Card className="ov-perf" title={null}>
      <div className="ov-perf__top">
        <div className="ov-perf__hero">
          <div className="ov-label">{label}{stamp && pf.ci == null && <span className="ov-stamp"> · {stamp}</span>}</div>
          <OvHeroValue value={pf.heroValue} privacy={privacy} testId="hero-value" />
          <div className="ov-deltarow" data-testid="hero-delta">
            <Delta value={pf.deltaGain} pct={pf.deltaPct} size="md" context={pf.context} />
          </div>
          <div className="ov-subrow">
            <span>Netto ingelegd <b>{privacy ? '€ •••••' : fmtMoney(pf.heroNet)}</b></span>
            <span className={pf.heroWinst > 0.5 ? 'ov-gain' : pf.heroWinst < -0.5 ? 'ov-loss' : null}>
              <span style={{ color: 'var(--fg-muted)' }}>Totale winst </span><b>{privacy ? '€ •••••' : fmtMoney(pf.heroWinst, { sign: true })}</b>
              {pf.ci == null && pf.restPnlPct != null && <span style={{ color: 'var(--fg-muted)' }}> ({fmtPct(pf.restPnlPct, { decimals: 1 })} op inleg)</span>}
            </span>
            <InfoTip label="Hoe berekenen we je winst?" text={<OvExplainer />} />
          </div>
        </div>
        <div className="ov-perf__ctrl">
          {pf.pinned && (
            <Chip active className="ov-pin" data-testid="pin-chip" onClick={() => pf.setCursor(null)}
              onRemove={() => pf.setCursor(null)} removeLabel="Peildatum wissen">
              Peildatum {fmtDateLong(pf.dates[pf.ci])}
            </Chip>
          )}
          <Segmented size="sm" ariaLabel="Periode" value={pf.periodKey} onChange={k => app.setPrefs({ period: k })} options={pf.periodOptions} />
        </div>
      </div>
      <div className="ov-legend">
        <div className="ov-legend__items" aria-hidden="true">
          {pf.mode === 'value' ? (
            <>
              <span className="ov-key"><span className="ov-key__line" />Waarde</span>
              <span className="ov-key"><span className="ov-key__step" />Netto ingelegd</span>
              <span className="ov-key"><span className="ov-key__band" />Winst</span>
            </>
          ) : pf.mode === 'gain'
            ? <span className="ov-key"><span className="ov-key__line" />{pf.r.all ? 'Totale winst (waarde − netto ingelegd)' : 'Winst excl. stortingen sinds begin periode'}</span>
            : <span className="ov-key"><span className="ov-key__line" />Tijdgewogen rendement</span>}
        </div>
        {pf.hasPE && (
          <Chip active={!!prefs.exclPE} onClick={() => app.setPrefs({ exclPE: !prefs.exclPE })}>Excl. PE</Chip>
        )}
        <Segmented size="sm" ariaLabel="Grafiekweergave" value={pf.mode} onChange={v => app.setPrefs({ chartMode: v })}
          options={OV_CHART_MODES} />
      </div>
      <div className="ov-chartwrap">
        <PerformanceChart testId="perf-chart" baseline={pf.fine && pf.mode === 'value' ? 'tight' : undefined} dates={pf.chartDates} primary={pf.primary} secondary={pf.secondary}
          kind={pf.mode === 'return' ? 'pct' : pf.mode === 'gain' ? 'gain' : 'money'} height={220}
          liveDot={app.spotStatus && !app.spotStatus.error && app.spotStatus.fetchedAt ? 'live' : 'static'}
          cursor={pf.ci != null ? pf.ci - pf.c0 : null} pinned={pf.pinned} pinnable onCursor={pf.onCursor}
          ariaLabel={pf.mode === 'return' ? 'Tijdgewogen rendement over de periode' : pf.mode === 'gain' ? 'Winst over de periode' : 'Waarde en netto ingelegd over de periode'}
          valueText={pf.valueText} privacy={privacy}
          emptyText={pf.twrAllNull ? 'Tijdgewogen rendement niet beschikbaar voor deze periode' : undefined} />
      </div>
      {(app.intraday || []).length >= 2 && (
        <div className="ov-intra-desk">
          <div className="ov-intra-desk__title">Dagverloop</div>
          <OvIntraday app={app} height={110} mode={pf.mode === 'gain' ? 'gain' : 'value'} />
        </div>
      )}
      {twrGapNote && <div className="ov-chartnote">Koershistorie onvolledig; dagen zonder koers zijn overgeslagen.</div>}
      {pf.setsDiffer && <div className="ov-chartnote">Grafiek: {pf.notInChart} partij(en) niet meegeteld</div>}
      <div className="ov-kpis" data-testid="kpi-strip">
        <KpiCell label="Rendement p.j." info="Geldgewogen jaarrendement (XIRR) over alle stortingen en opnames sinds de start."
          value={<span className={tone(kpi1)}>{kpi1 == null ? '—' : fmtPct(kpi1, { decimals: 1 }) + (days >= 365 ? ' p.j.' : '')}</span>} sub={kpi1sub} />
        <KpiCell label={`Tijdgewogen · ${perLabel}`} value={<span className={tone(twr)}>{twr == null ? '—' : fmtPct(twr, { decimals: 1 })}</span>} sub="excl. stortingen" />
        <KpiCell label="Inkomsten · 12 mnd" info={`Dividend en rente sinds start: ${privacy ? '€ •••••' : fmtMoney(t.income || 0)}`}
          value={<Money value={t.income12m || 0} />} sub="dividend en rente" />
        <KpiCell label="Kosten" value={<Money value={-(t.fees || 0)} />}
          sub={`${t.feeTxCount} transacties met kosten${feePct != null ? ' · ' + fmtPct(feePct, { decimals: 1, sign: false }) + ' van ingelegd' : ''}`} />
      </div>
    </Card>
  );
}

function OvPositiesCard({ app, pinIndex }) {
  const t = app.model.totals;
  return (
    <section className="ov-hold" aria-labelledby="ov-hold-title" data-testid="ov-holdings">
      <div className="ov-hold__head">
        <h2 className="ov-hold__title" id="ov-hold-title">Bezittingen</h2>
        <span className="ov-hold__meta">{t.openCount} open · {t.closedCount} gesloten</span>
        {window.HoldingsPeriodPicker && pinIndex == null ? <HoldingsPeriodPicker app={app} /> : null}
        <button type="button" className="ov-link" onClick={() => app.navigate('/posities')}>Alle posities <Icon name="arrow-right" size={12} /></button>
      </div>
      {window.HoldingsTable ? <HoldingsTable app={app} variant="compact" asOfIndex={pinIndex} /> : null}
    </section>
  );
}

function OvMonthlyCard({ app }) {
  const months = useMemo(() => monthlyNetFlows(seriesExcluding(app.model.series, [FIN_OVER_PARTY_ID]), 12), [app.model.series]);
  const net = months.reduce((a, m) => a + (m.net || 0), 0);
  const privacy = !!app.prefs.privacy;
  return (
    <Card title="Netto inleg per maand" meta={`netto ${privacy ? '€ •••••' : fmtMoney(net, { sign: true })} · laatste 12 mnd`}
      actions={<button type="button" className="ov-link" onClick={() => app.navigate('/transacties?view=maand')}>Per maand <Icon name="arrow-right" size={12} /></button>}>
      <MonthlyFlowBars months={months} height={140} privacy={privacy} />
    </Card>
  );
}

function OvResultCard({ app }) {
  const { model, prefs } = app;
  const mode = prefs.resultMode === 'pct' ? 'pct' : 'eur';
  const inc = s => (s.party.includeInTotal ?? s.party.includeInPortfolio) !== false;
  const rows = model.open.filter(inc).map(s => ({ id: s.party.id, label: s.party.name, value: mode === 'eur' ? s.pnl : (s.invested > 0 ? s.pnlPct : 0) }));
  const closed = model.closed.filter(inc);
  const closedRow = mode === 'eur' && closed.length ? { label: `Gesloten (${closed.length})`, value: closed.reduce((a, s) => a + (s.pnl || 0), 0) } : null;
  return (
    <Card title="Resultaat per positie" meta="sinds start"
      actions={<Segmented size="sm" ariaLabel="Eenheid" value={mode} onChange={v => app.setPrefs({ resultMode: v })}
        options={[{ value: 'eur', label: '€' }, { value: 'pct', label: '%' }]} />}>
      {rows.length ? <DivergingBars rows={rows} mode={mode} closedRow={closedRow} privacy={!!prefs.privacy}
        onRowClick={row => row && row.id && app.navigate('/posities/' + encodeURIComponent(row.id))} />
        : <EmptyState icon="layers" title="Nog geen open posities" />}
    </Card>
  );
}

function ovRecentTxs(app, n = 5) {
  return app.state.transactions.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '') || String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))).slice(0, n);
}

function OvActivityCard({ app }) {
  const txs = ovRecentTxs(app);
  return (
    <Card title="Recente activiteit"
      actions={<button type="button" className="ov-link" onClick={() => app.navigate('/transacties')}>Alle transacties <Icon name="arrow-right" size={12} /></button>}>
      {txs.length ? (window.TxList ? <TxList app={app} txs={txs} variant="activity" limit={5} /> : null)
        : <EmptyState icon="receipt" title="Nog geen transacties" />}
    </Card>
  );
}

function OvFirstRun({ app }) {
  return (
    <Card style={{ margin: app.isMobile ? 16 : 20 }}>
      <div className="ov-first">
        <div>
          <div className="ov-label">Totale waarde</div>
          <OvHeroValue value={0} privacy={false} testId="hero-value" />
          <div className="ov-small">Nog geen posities</div>
        </div>
        <div className="ov-first__ph" aria-hidden="true" />
        <div className="ov-first__steps">
          <span><b>1</b>Voeg een partij toe →</span>
          <span><b>2</b>Registreer je eerste inleg →</span>
          <span><b>3</b>Bekijk je overzicht</span>
        </div>
        <EmptyState title="Begin met je eerste transactie"
          action={{ label: 'Eerste transactie toevoegen', onClick: () => app.openTx(), testId: 'quick-transactie' }}
          secondary={{ label: 'Importeer uit Trading 212', onClick: () => app.navigate('/instellingen/t212') }} />
      </div>
    </Card>
  );
}

function OvDesktop({ app }) {
  const pf = useOvPerformance(app);
  const widgets = app.state.widgets;
  const on = id => isModuleEnabled(widgets, id);
  const topRef = useRef(null);
  const [stacked, setStacked] = useState(false);
  useEffect(() => {
    const el = topRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => setStacked(el.clientWidth < 560 + 380 + 12));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const items = useMemo(() => ovAttentionItems(app), [app.model, app.state.targetAllocation, app.syncStatus, app.spotStatus, app.spots]);
  const pinIndex = pf.pinned ? (pf.pinDay != null ? pf.pinDay : pf.ci) : null;
  const showVerd = on('allocation');
  const row3 = [on('monthly_inleg') && <OvMonthlyCard key="m" app={app} />, on('returns') && <OvResultCard key="r" app={app} />, on('activity_feed') && <OvActivityCard key="a" app={app} />,
    on('attention') && <OvAttentionCard key="att" app={app} items={items} />].filter(Boolean);
  return (
    <div className="ov-desk">
      <OvFinOpen app={app} />
      <div className="ov-top" ref={topRef}>
        <div className="ov-left">
          <OvPrestatiesCard app={app} pf={pf} />
          {showVerd && (
            <div className="ov-row2">
              <OvVerdelingCard app={app} pinIndex={pinIndex} />
            </div>
          )}
        </div>
        {on('party_grid') && (
          <div className={ovCx('ov-right', stacked && 'ov-right--stacked')}>
            <OvPositiesCard app={app} pinIndex={pinIndex} />
          </div>
        )}
      </div>
      {row3.length > 0 && <div className="ov-row3">{row3}</div>}
    </div>
  );
}

// ===================================================================
// Mobile
// ===================================================================
function OvVoorJou({ app, items }) {
  const { model, state, prefs } = app;
  const on = id => isModuleEnabled(state.widgets, id);
  const privacy = !!prefs.privacy;
  const ref = useRef(null);
  const [page, setPage] = useState(0);
  const cards = [];
  if (on('attention')) {
    const drift = items.find(it => it.drift);
    cards.push(
      <Card key="attn" data-testid="attention-card" title="Aandacht" meta={items.length ? String(items.length) : null}>
        {items.length ? <OvAttentionList items={items} max={3} /> : <div className="ov-ok"><Icon name="check" size={16} />Alles up-to-date</div>}
        {drift && <button type="button" className="ov-link ov-link--strong ov-fy__cta" onClick={() => app.navigate('/plan/verdeling?focus=storten')}>Storting plannen <Icon name="chevron-right" size={14} /></button>}
      </Card>
    );
  }
  if (on('pension_card')) {
    const inputs = { ...PENSION_DEFAULTS, ...(state.pensionInputs || {}) };
    const pn = computePension(inputs, model.totals.value);
    cards.push(
      <Card key="pens" title={`Pensioen op ${inputs.retireAge}`} actions={pn.onTrack ? <Pill tone="neutral" icon="check">Op koers</Pill> : <Pill tone="warn">Tekort</Pill>}>
        <div className="ov-big">{fmtPct(pn.progress, { decimals: 0, sign: false })} <span className="ov-small">van je doel</span></div>
        <div className="ov-track" aria-hidden="true">
          <div className="ov-track__fill" style={{ width: Math.min(100, pn.progress) + '%' }} />
          {[25, 50, 75].map(t => <span key={t} className="ov-track__tick" style={{ left: t + '%' }} />)}
        </div>
        <div className="ov-small">Verwacht <b>{privacy ? '€ •••••' : fmtMoney(pn.fvCurrent)}</b> van <b>{privacy ? '€ •••••' : fmtCompact(pn.neededCorpusReal)}</b></div>
        {!pn.onTrack && pn.monthlySavings > 0 && <div className="ov-small">Nodig: <b>{privacy ? '€ •••••' : fmtMoney(pn.monthlySavings)}</b> per maand</div>}
        <button type="button" className="ov-link ov-link--strong ov-fy__cta" onClick={() => app.navigate('/plan/pensioen')}>Bekijk pensioenplan <Icon name="chevron-right" size={14} /></button>
      </Card>
    );
  }
  if (on('monthly_inleg')) {
    // Schommelingen op Vrij op rekening zijn geen inleg in beleggingen.
    const months = monthlyNetFlows(seriesExcluding(model.series, [FIN_OVER_PARTY_ID]), 12);
    const net = months.reduce((a, m) => a + (m.net || 0), 0);
    cards.push(
      <Card key="inleg" title="Inleg per maand">
        <div className="ov-small"><b className="ov-big" style={{ fontSize: 24 }}>{privacy ? '€ •••••' : fmtMoney(net, { sign: true })}</b> netto, laatste 12 maanden</div>
        <MonthlyFlowBars months={months} height={64} mini showAverage={false} privacy={privacy} />
        <div className="ov-small">Gemiddeld <b>{privacy ? '€ •••••' : fmtMoney(net / 12)}</b> per maand</div>
        <button type="button" className="ov-link ov-link--strong ov-fy__cta" onClick={() => app.navigate('/transacties?view=maand')}>Per maand bekijken <Icon name="chevron-right" size={14} /></button>
      </Card>
    );
  }
  if (!cards.length) return null;
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const w = el.firstChild ? el.firstChild.getBoundingClientRect().width + 12 : el.clientWidth;
    setPage(Math.max(0, Math.min(cards.length - 1, Math.round(el.scrollLeft / w))));
  };
  return (
    <section aria-labelledby="ov-fy-title">
      <div className="ov-secthead">
        <h2 className="ov-sect" id="ov-fy-title">Voor jou</h2>
        <button type="button" className="ov-link" data-testid="ov-plan-link" onClick={() => app.navigate('/plan/verdeling')}>Plan <Icon name="chevron-right" size={14} /></button>
      </div>
      <div className="ov-fy" ref={ref} onScroll={onScroll}>{cards}</div>
      {cards.length > 1 && <div className="ov-dots" aria-hidden="true">{cards.map((_, i) => <span key={i} className={i === page ? 'is-on' : undefined} />)}</div>}
    </section>
  );
}

function OvMobile({ app }) {
  const pf = useOvPerformance(app);
  const { model, state, prefs } = app;
  const privacy = !!prefs.privacy;
  const on = id => isModuleEnabled(state.widgets, id);
  const [explain, setExplain] = useState(false);
  const items = useMemo(() => ovAttentionItems(app), [app.model, app.state.targetAllocation, app.syncStatus, app.spotStatus, app.spots]);
  const label = pf.ci != null ? `Waarde op ${fmtDateLong(pf.dates[pf.ci])}` : (pf.exclPE ? 'Waarde excl. private equity' : 'Totale waarde');
  const t = model.totals;
  const mobileCtx = pf.ci != null ? 't.o.v. begin periode' : ovPeriodContext(pf.periodKey, pf.dates);
  const drift = driftRows(model.summaries, state.targetAllocation);
  const targetsText = drift.hasTargets && drift.grouping !== 'party'
    ? 'Doel: ' + drift.rows.filter(rw => rw.target > 0).map(rw => fmtPct(rw.target, { decimals: 1, sign: false }).replace('%', '').replace(',0', '')).join(' / ')
    : null;
  const segs = model.classes.map(c => ({ key: c.key, label: c.label, color: c.color, value: c.value }));
  const synced = ovLatest(app.syncStatus && app.syncStatus.syncedAt);
  const priced = ovLatest(app.spotStatus && app.spotStatus.fetchedAt);
  const recent = ovRecentTxs(app);
  const modeIdx = OV_CHART_MODES.findIndex(m => m.value === pf.mode);
  const pickMode = (i, focus) => {
    const m = OV_CHART_MODES[(i + OV_CHART_MODES.length) % OV_CHART_MODES.length];
    app.setPrefs({ chartMode: m.value });
    if (focus) requestAnimationFrame(() => { const el = document.querySelector(`[data-testid="chart-mode-${m.value}"]`); if (el) el.focus(); });
  };
  const enabledPeriods = pf.periodOptions.filter(o => !o.disabled);
  const pickPeriod = (dir, cur) => {
    const i = enabledPeriods.findIndex(o => o.value === cur);
    const next = enabledPeriods[(i + dir + enabledPeriods.length) % enabledPeriods.length];
    if (!next) return;
    ovSetPeriod(app, next.value);
    requestAnimationFrame(() => { const el = document.querySelector(`[data-testid="${next.testId}"]`); if (el) el.focus(); });
  };
  return (
    <div className="ov-m">
      <OvFinOpen app={app} />
      <section className="ov-m__hero" aria-label="Totale waarde">
        <div className="ov-m__herotop">
          <div className="ov-label">{label}</div>
          <IconButton icon={privacy ? 'eye-off' : 'eye'} label={privacy ? 'Bedragen tonen' : 'Bedragen verbergen'} pressed={privacy} iconSize={21}
            data-testid="privacy-toggle" onClick={() => app.setPrefs({ privacy: !privacy })} />
        </div>
        <OvHeroValue value={pf.heroValue} privacy={privacy} testId="hero-value" />
        <div className="ov-m__delta" data-testid="hero-delta">
          <Delta value={pf.deltaGain} pct={pf.deltaPct} size="md" showGlyph={false} />
          <span className="ov-m__ctx">{mobileCtx}</span>
          {pf.ci != null && <span className="ov-m__ctx" data-testid="hero-net">· ingelegd {privacy ? '€ •••••' : fmtMoney(pf.heroNet)}</span>}
          <button type="button" className="ov-m__info" aria-label="Hoe berekenen we je winst?" onClick={() => setExplain(true)}>
            <Icon name="info" size={14} />
          </button>
        </div>
      </section>

      <div className="ov-m__chartblock">
        <div className="ov-m__chart">
          {pf.periodKey === '1D' && (app.intraday || []).length >= 2 ? <OvIntraday app={app} height={150} mode={pf.mode === 'gain' ? 'gain' : 'value'} /> :
          <PerformanceChart testId="perf-chart" baseline={pf.fine && pf.mode === 'value' ? 'tight' : undefined} compact dates={pf.chartDates} primary={pf.primary} secondary={pf.secondary}
            kind={pf.mode === 'return' ? 'pct' : pf.mode === 'gain' ? 'gain' : 'money'} height={176} baseline="auto"
            liveDot={app.spotStatus && !app.spotStatus.error && app.spotStatus.fetchedAt ? 'live' : 'static'}
            cursor={pf.ci != null ? pf.ci - pf.c0 : null} onCursor={pf.onCursor}
            ariaLabel={pf.mode === 'return' ? 'Tijdgewogen rendement over de periode' : pf.mode === 'gain' ? 'Winst over de periode' : 'Waarde en netto ingelegd over de periode'}
            valueText={pf.valueText} privacy={privacy}
            emptyText={pf.twrAllNull ? 'Tijdgewogen rendement niet beschikbaar voor deze periode' : undefined} />}
        </div>
        <div className="ov-m__periods" role="radiogroup" aria-label="Periode">
          {pf.periodOptions.map(o => (
            <button key={o.value} type="button" role="radio" className="ov-m__period" data-testid={o.testId}
              aria-checked={o.value === pf.periodKey} aria-disabled={o.disabled || undefined} title={o.title}
              tabIndex={o.value === pf.periodKey ? 0 : -1}
              onClick={() => { if (!o.disabled) ovSetPeriod(app, o.value); }}
              onKeyDown={e => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pickPeriod(1, pf.periodKey); }
                else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pickPeriod(-1, pf.periodKey); }
              }}>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
        <div className="ov-m__modes" role="radiogroup" aria-label="Grafiekweergave">
          {OV_CHART_MODES.map((m, i) => (
            <button key={m.value} type="button" role="radio" className="ov-m__mode" data-testid={'chart-mode-' + m.value}
              aria-checked={m.value === pf.mode} tabIndex={m.value === pf.mode ? 0 : -1}
              onClick={() => pickMode(i)}
              onKeyDown={e => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pickMode(modeIdx + 1, true); }
                else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pickMode(modeIdx - 1, true); }
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>


      {on('party_grid') && (
        <section className="ov-hold ov-hold--m" aria-labelledby="ov-mhold-title" data-testid="ov-holdings">
          <div className="ov-hold__head">
            <h2 className="ov-hold__title" id="ov-mhold-title">Bezittingen</h2>
            <span className="ov-hold__meta">{t.openCount} posities</span>
            <button type="button" className="ov-link" onClick={() => app.navigate('/posities')}>Alle posities <Icon name="chevron-right" size={14} /></button>
          </div>
          {on('allocation') && segs.length > 0 && (
            <div className="ov-hold__alloc">
              <AllocationBar segments={segs} height={8} privacy={privacy} ariaLabel="Verdeling per categorie" onSegmentClick={() => app.navigate('/plan/verdeling')} />
              <div className="ov-caption"><span>Verdeling per categorie</span>{targetsText && <span>{targetsText}</span>}</div>
            </div>
          )}
          {window.HoldingsList ? <HoldingsList app={app} variant="overview" period={pf.periodKey} /> : null}
        </section>
      )}

      {on('activity_feed') && (
        <section className="ov-hold ov-hold--m ov-act--m" aria-labelledby="ov-mact-title" data-testid="ov-activity">
          <div className="ov-hold__head">
            <h2 className="ov-hold__title" id="ov-mact-title">Recente activiteit</h2>
            <button type="button" className="ov-link" onClick={() => app.navigate('/transacties')}>{t.txCount} transacties <Icon name="chevron-right" size={14} /></button>
          </div>
          {recent.length ? (window.TxList ? <TxList app={app} txs={recent} variant="activity" limit={5} /> : null)
            : <EmptyState icon="receipt" title="Nog geen transacties" />}
        </section>
      )}

      <OvVoorJou app={app} items={items} />

      <div className="ov-mfoot">
        {priced ? `Koersen van ${fmtTime(priced.toISOString())} · ` : ''}{synced ? `gesynchroniseerd om ${fmtTime(synced.toISOString())} · ` : ''}{t.txCount} transacties{t.firstTxDate ? ` sinds ${fmtDateLong(t.firstTxDate)}` : ''}
      </div>

      <Sheet open={explain} onClose={() => setExplain(false)} title="Hoe berekenen we je winst?" size="medium">
        <OvExplainer />
      </Sheet>
    </div>
  );
}

function OverzichtScreen({ app }) {
  if (!app.model || !app.model.totals.txCount) return <OvFirstRun app={app} />;
  return app.isMobile ? <OvMobile app={app} /> : <OvDesktop app={app} />;
}

Object.assign(window, { OverzichtScreen, OvCfdLive });
