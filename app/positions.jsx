// Posities (S3): PositiesScreen, HoldingsTable, HoldingsList, PartyPanel, PartyForm.
// File-local helpers use the `ps` / `Ps` / `PS_` prefix (CONTRACT §2.2).

injectStyles('positions', `
.ps-page { display: flex; flex-direction: column; gap: 12px; min-width: 0; padding: 20px; }
.ps-ht--compact table { table-layout: fixed; }
.ps-ht--compact .ps-pos__text { overflow: hidden; }
.ps-ht--compact td { overflow: hidden; }
.ps-head { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.ps-head__titles { flex: 1; min-width: 240px; }
.ps-title { margin: 0; font: 600 22px/28px var(--font); letter-spacing: -0.015em; color: var(--fg); }
.ps-meta { margin-top: 2px; font-size: 12.5px; line-height: 17px; color: var(--fg-muted); }
.ps-meta b { font-weight: 550; color: var(--fg); }
.ps-head__actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ps-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ps-foot-note { font-size: 12px; color: var(--fg-subtle); padding: 0 2px; }
.ps-row2 { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.ps-row2 > .ps-stack-card { flex: 2 1 520px; }
.ps-row2 > .ps-costs-card { flex: 1 1 280px; }

/* Holdings table */
.ps-ht { min-width: 0; display: flex; flex-direction: column; }
.ps-ht__scroll { overflow: auto; min-height: 0; }
.ps-ht table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; line-height: 18px; }
.ps-ht th { position: sticky; top: 0; z-index: var(--z-sticky); background: var(--surface); color: var(--fg-muted); font: 500 11.5px/16px var(--font); text-align: left; padding: 8px 8px; border-bottom: 1px solid var(--border); white-space: nowrap; }
.ps-ht th.num, .ps-ht td.num { text-align: right; }
.ps-ht th:first-child, .ps-ht td:first-child { padding-left: 16px; }
.ps-ht th:last-child, .ps-ht td:last-child { padding-right: 16px; }
.ps-ht td { padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: middle; height: 44px; box-sizing: border-box; }
.ps-sort { border: 0; background: none; padding: 0; font: inherit; color: inherit; cursor: pointer; display: inline-flex; align-items: center; gap: 3px; }
.ps-sort:hover { color: var(--fg); }
.ps-sort[data-active="true"] { color: var(--fg); font-weight: 550; }
.ps-row { cursor: pointer; outline: none; }
.ps-row:hover td, .ps-row:focus-visible td { background: var(--surface-2); }
.ps-row:focus-visible td:first-child { box-shadow: inset 2px 0 0 var(--accent); }
.ps-row--muted .ps-name, .ps-row--muted .ps-val { color: var(--fg-muted); }
.ps-pos { display: flex; align-items: center; gap: 10px; min-width: 0; }
.ps-pos__text { min-width: 0; display: flex; flex-direction: column; }
.ps-name { font-weight: 550; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
.ps-sub { font-size: 11.5px; line-height: 15px; color: var(--fg-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px; }
.ps-sub--stale { color: var(--warn); }
.ps-badge { display: inline-flex; align-items: center; height: 18px; padding: 0 5px; border-radius: 5px; border: 1px solid var(--border-strong); font: 500 11px/1 var(--font); color: var(--fg-muted); white-space: nowrap; }
.ps-val { font-weight: 550; font-variant-numeric: tabular-nums lining-nums; white-space: nowrap; }
.ps-gain { color: var(--gain); } .ps-loss { color: var(--loss); } .ps-flat { color: var(--fg-muted); }
.ps-pnl { display: flex; flex-direction: column; align-items: flex-end; white-space: nowrap; }
.ps-pnl small { font-size: 11.5px; line-height: 15px; font-weight: 500; font-variant-numeric: tabular-nums; }
.ps-muted { color: var(--fg-muted); }
.ps-subtle { color: var(--fg-subtle); }
.ps-group td { height: 36px; background: var(--surface); }
.ps-group__btn { display: inline-flex; align-items: center; gap: 8px; border: 0; background: none; padding: 0; font: 550 12.5px/16px var(--font); color: var(--fg); cursor: pointer; white-space: nowrap; }
.ps-group__btn .ps-chev { color: var(--fg-subtle); transition: transform var(--d-1) var(--ease); }
.ps-group__btn[aria-expanded="false"] .ps-chev { transform: rotate(-90deg); }
.ps-group__share { font-weight: 400; color: var(--fg-muted); font-variant-numeric: tabular-nums; }
.ps-group .ps-val { font-size: 12.5px; }
.ps-minibar { position: relative; height: 4px; width: 48px; border-radius: 2px; background: var(--surface-3); overflow: hidden; display: inline-block; vertical-align: middle; }
.ps-minibar > span { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 2px; }
.ps-fold td { height: 40px; }
.ps-fold__btn { display: inline-flex; align-items: center; gap: 8px; border: 0; background: none; padding: 0; font: 500 12.5px/16px var(--font); color: var(--fg-muted); cursor: pointer; }
.ps-fold__btn:hover { color: var(--fg); }
.ps-fold__btn[aria-expanded="true"] .ps-chev { transform: rotate(90deg); }
.ps-chev { transition: transform var(--d-1) var(--ease); flex-shrink: 0; }
.ps-ht tfoot td { position: sticky; bottom: 0; z-index: var(--z-sticky); background: var(--surface); border-top: 1px solid var(--border-strong); border-bottom: 0; font-weight: 600; height: 48px; }
.ps-total-label { display: inline-flex; align-items: center; gap: 4px; }
.ps-orphan td { background: var(--warn-soft); color: var(--fg); }
.ps-orphan__inner { display: flex; align-items: center; gap: 8px; }
.ps-orphan__inner .ps-warnic { color: var(--warn); }
.ps-goal { display: inline-flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.ps-goal__track { width: 64px; height: 4px; border-radius: 2px; background: var(--surface-3); overflow: hidden; }
.ps-goal__fill { height: 100%; background: var(--fg-muted); border-radius: 2px; }
.ps-goal small { font-size: 11px; color: var(--fg-subtle); font-variant-numeric: tabular-nums; }
.ps-ht__note { padding: 10px 16px; font-size: 12px; color: var(--fg-subtle); display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; border-top: 1px solid var(--border); }
.ps-ht__asof { padding: 8px 16px; font-size: 12px; color: var(--accent); background: var(--accent-soft); }

/* Mobile list */
.ps-list { display: flex; flex-direction: column; }
.ps-lgroup { display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 10px 0 4px; border: 0; background: none; width: 100%; font: 500 13px/18px var(--font); color: var(--fg-muted); text-align: left; cursor: pointer; }
.ps-lgroup__label { color: var(--fg); font-weight: 550; }
.ps-lgroup__gain { margin-left: auto; font-size: 12px; font-variant-numeric: tabular-nums; }
.ps-lgroup__gain + .ps-lgroup__val { margin-left: 6px; }
.ps-pgains { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 0; padding: 8px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.ps-pgains > div { min-width: 0; padding: 0 10px; display: flex; flex-direction: column; gap: 1px; }
.ps-pgains > div:first-child { padding-left: 0; }
.ps-pgains > div + div { border-left: 1px solid var(--border); }
.ps-pgains dt { font-size: 11px; line-height: 14px; color: var(--fg-muted); }
.ps-pgains dd { margin: 0; font-variant-numeric: tabular-nums; font-weight: 600; font-size: 13px; line-height: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ps-pgains small { display: block; font-weight: 500; font-size: 11px; line-height: 14px; opacity: .85; }
.ps-lgroup__val { margin-left: auto; font-variant-numeric: tabular-nums; color: var(--fg-muted); }
.ps-lrow { display: flex; align-items: center; gap: 12px; min-height: 64px; width: 100%; padding: 8px 0; border: 0; background: none; text-align: left; color: var(--fg); font: inherit; cursor: pointer; border-radius: 12px; }
.ps-lrow:active { background: var(--surface-2); }
.ps-lrow__main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.ps-lrow__name { font: 600 15px/20px var(--font); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
.ps-lrow__sub { font-size: 13px; line-height: 18px; color: var(--fg-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 4px; }
.ps-lrow__end { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; gap: 1px; }
.ps-lrow__val { font: 650 15px/20px var(--font); font-variant-numeric: tabular-nums lining-nums; }
.ps-lrow__sec { font-size: 13px; line-height: 18px; font-variant-numeric: tabular-nums; color: var(--fg-muted); white-space: nowrap; }
.ps-lrow--muted .ps-lrow__name, .ps-lrow--muted .ps-lrow__val { color: var(--fg-muted); }
.ps-lrow__sec.ps-gain { color: var(--gain); } .ps-lrow__sec.ps-loss { color: var(--loss); }
/* Uitklappen van aandelen binnen een brokerpositie; ingesprongen tot onder de naam */
.ps-lmore { display: flex; align-items: center; gap: 4px; align-self: flex-start; min-height: 36px; margin: -6px 0 2px; padding: 0; border: 0; background: none; font: 500 13px/18px var(--font); color: var(--fg-muted); cursor: pointer; }
.ps-lmore > span { margin-left: 52px; }
.ps-lmore:active, .ps-lmore[aria-expanded="true"] { color: var(--fg); }
.ps-lsub { display: flex; flex-direction: column; margin: 0 0 8px; }
.ps-lstock { display: flex; align-items: center; gap: 12px; min-height: 54px; margin-left: 52px; padding: 6px 0; border-top: 1px solid var(--border); }
.ps-lstock__tick { width: 34px; height: 34px; flex: none; border-radius: 50%; background: var(--surface-2); display: grid; place-items: center; font: 650 10px/1 var(--font); letter-spacing: -0.01em; color: var(--fg-muted); overflow: hidden; }
.ps-lstock__name { font: 550 14px/19px var(--font); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ps-lstock__val { font: 600 14px/19px var(--font); font-variant-numeric: tabular-nums lining-nums; }
.ps-lfold { display: flex; align-items: center; gap: 10px; min-height: 52px; width: 100%; border: 0; border-top: 1px solid var(--border); background: none; padding: 8px 0; font: inherit; color: var(--fg); text-align: left; cursor: pointer; margin-top: 4px; }
.ps-lfold__main { flex: 1; display: flex; flex-direction: column; }
.ps-lfold__title { font-weight: 600; font-size: 15px; }
.ps-lfold__sub { font-size: 13px; color: var(--fg-muted); }
.ps-pchips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; overscroll-behavior-x: contain; }
.ps-pchips::-webkit-scrollbar { display: none; }
.ps-pchips > .chip { flex: 1 0 auto; justify-content: center; height: 30px; padding: 0 10px; font-size: 12.5px; border-style: solid; border-color: var(--border); }
.ps-lnote { font-size: 13px; line-height: 18px; color: var(--fg-subtle); padding: 8px 0 2px; }
.ps-mtotal { display: flex; flex-direction: column; gap: 10px; }
.ps-mtotal__row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.ps-mtotal__val { font: 650 26px/32px var(--font); letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.ps-mtotal__meta { font-size: 13px; color: var(--fg-muted); }
.ps-mhead { display: flex; align-items: center; gap: 4px; }
.ps-mhead .ps-head__titles { min-width: 0; }
.ps-mcontrols { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ps-opt { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 48px; border: 0; background: none; border-radius: 10px; padding: 0 8px; font: 500 15px/20px var(--font); color: var(--fg); text-align: left; cursor: pointer; }
.ps-opt:hover { background: var(--surface-2); }
.ps-opt[aria-checked="true"] { font-weight: 600; }
.ps-opt__check { margin-left: auto; color: var(--accent); }

/* Party panel */
.ps-panel { display: flex; flex-direction: column; gap: 16px; }
.ps-ptitle { display: flex; align-items: center; gap: 10px; min-width: 0; }
.ps-ptitle__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ps-pvalue { font: 600 30px/36px var(--font); letter-spacing: -0.025em; font-variant-numeric: tabular-nums lining-nums; color: var(--fg); }
.ps-pdelta { margin-top: 4px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 12.5px; color: var(--fg-muted); }
.ps-chartbox { display: flex; flex-direction: column; gap: 8px; }
.ps-px { display: flex; flex-direction: column; gap: 8px; }
.ps-px__chips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
.ps-px__chip { flex: none; border: 1px solid var(--border); background: var(--surface); color: var(--fg-muted); border-radius: 999px; padding: 5px 11px; font: 500 12.5px/16px var(--font); cursor: pointer; white-space: nowrap; }
.ps-px__chip.is-on { background: var(--fg); color: var(--bg); border-color: var(--fg); }
.ps-px__head { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 10px; }
.ps-px__val { font: 650 24px/1.15 var(--font); letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.ps-px__chg { font: 600 13.5px/18px var(--font); font-variant-numeric: tabular-nums; }
.ps-px__when { font-size: 12.5px; color: var(--fg-muted); }
.ps-px__plot { position: relative; height: 150px; touch-action: pan-y; cursor: crosshair; }
.ps-px__plot svg { width: 100%; height: 100%; display: block; overflow: visible; }
.ps-px__hi, .ps-px__lo { position: absolute; right: 0; font-size: 11px; color: var(--fg-muted); font-variant-numeric: tabular-nums; background: color-mix(in srgb, var(--bg) 80%, transparent); padding: 0 2px; pointer-events: none; }
.ps-px__hi { top: 0; } .ps-px__lo { bottom: 0; }
.ps-px__empty { height: 100%; display: grid; place-items: center; font-size: 13px; color: var(--fg-muted); border: 1px dashed var(--border); border-radius: var(--r-2); }
.ps-kgrid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--border); border-radius: var(--r-2); overflow: hidden; }
.ps-kgrid > div { padding: 10px 12px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ps-kgrid > div:nth-child(odd) { border-right: 1px solid var(--border); }
.ps-kgrid > div:nth-last-child(-n+2) { border-bottom: 0; }
.ps-kgrid dt { font-size: 12px; color: var(--fg-muted); }
.ps-kgrid dd { margin: 0; font: 600 15px/20px var(--font); font-variant-numeric: tabular-nums; }
.ps-strip { display: flex; flex-wrap: wrap; gap: 6px 16px; padding: 10px 12px; border-radius: var(--r-2); background: var(--surface-2); font-size: 12.5px; color: var(--fg-muted); }
.ps-strip b { color: var(--fg); font-weight: 550; font-variant-numeric: tabular-nums; }
.ps-coins { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: var(--r-2); overflow: hidden; }
.ps-coin { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 4px 12px; align-items: center; padding: 10px 12px; }
.ps-coin + .ps-coin { border-top: 1px solid var(--border); }
.ps-coin__name { font: 600 14px/20px var(--font); }
.ps-coin__sub { font-size: 12.5px; color: var(--fg-muted); font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.ps-coin__end { text-align: right; display: flex; flex-direction: column; gap: 2px; font-variant-numeric: tabular-nums; }
.ps-coin__val { font: 600 14px/20px var(--font); }
.ps-coin__chain { grid-column: 2 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; font-size: 12px; color: var(--fg-muted); }
.ps-coin__warn { color: var(--warn); display: inline-flex; align-items: center; gap: 4px; }
.ps-stk__tick { width: 32px; height: 32px; border-radius: var(--r-2); background: var(--surface-2); display: grid; place-items: center; font: 650 10.5px/1 var(--font); letter-spacing: -0.01em; color: var(--fg-muted); overflow: hidden; }
.ps-stk__foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 12px; margin-top: 8px; font-size: 12px; line-height: 17px; color: var(--fg-muted); }
.ps-pies { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: var(--r-2); overflow: hidden; }
.ps-pie + .ps-pie { border-top: 1px solid var(--border); }
.ps-pie__head { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 4px 12px; align-items: center; width: 100%; padding: 10px 12px;
  border: 0; background: none; color: var(--fg); font: inherit; text-align: left; cursor: pointer; }
.ps-pie__head:hover { background: var(--surface-2); }
.ps-pie__ring { width: 32px; height: 32px; border-radius: 50%; }
.ps-pie__body { padding: 4px 12px 12px; display: flex; flex-direction: column; gap: 10px; }
.ps-pie__acts { display: flex; flex-wrap: wrap; gap: 8px; }
.ps-pie__sl { display: grid; grid-template-columns: 10px minmax(0, 1fr) auto; gap: 2px 10px; align-items: center; font-size: 12.5px; }
.ps-pie__sl + .ps-pie__sl { padding-top: 8px; border-top: 1px solid var(--border); }
.ps-pie__bars { grid-column: 2 / -1; display: grid; gap: 3px; }
.ps-pie__bar { height: 4px; border-radius: 2px; background: var(--surface-3); overflow: hidden; }
.ps-pie__bar > span { display: block; height: 100%; border-radius: 2px; }
.ps-pie__bar--target > span { opacity: .35; }
.pe-row { display: grid; grid-template-columns: minmax(0, 1fr) 96px auto; gap: 8px; align-items: center; }
.pe-row + .pe-row { margin-top: 8px; }
.pe-sum { font-size: 12.5px; color: var(--fg-muted); display: flex; justify-content: space-between; gap: 8px; margin-top: 8px; }
.pe-sum.is-bad { color: var(--warn); }
.pe-prev { width: 100%; border-collapse: collapse; font-size: 12.5px; font-variant-numeric: tabular-nums; }
.pe-prev td { padding: 6px 0; border-top: 1px solid var(--border); }
.pe-prev td + td { text-align: right; padding-left: 10px; }
.pe-prev tr:first-child td { border-top: 0; }
.ps-pgoal { display: flex; flex-direction: column; gap: 6px; }
.ps-pgoal__row { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--fg-muted); }
.ps-pgoal__track { height: 6px; border-radius: 3px; background: var(--surface-3); overflow: hidden; }
.ps-pgoal__fill { height: 100%; border-radius: 3px; }
.ps-und { display: flex; flex-direction: column; gap: 10px; }
.ps-und__bar { display: flex; height: 8px; border-radius: 4px; overflow: hidden; background: var(--surface-3); gap: 2px; }
.ps-und__bar > span { height: 100%; }
.ps-und__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.ps-und__row { display: grid; grid-template-columns: 10px minmax(0, 1fr) auto; gap: 2px 10px; align-items: baseline; padding: 8px 0; border-top: 1px solid var(--border); }
.ps-und__row:first-child { border-top: 0; }
.ps-und__row > .ui-swatch, .ps-und__dot { width: 10px; height: 10px; border-radius: 3px; align-self: center; }
.ps-und__name { font: 500 13.5px/18px var(--font); min-width: 0; }
.ps-und__full { grid-column: 2 / 3; font-size: 12px; line-height: 16px; color: var(--fg-muted); overflow-wrap: anywhere; }
.ps-und__end { grid-row: span 2; align-self: start; text-align: right; display: flex; flex-direction: column; gap: 2px; font-variant-numeric: tabular-nums; }
.ps-und__w { font: 600 13.5px/18px var(--font); }
.ps-und__val { font-size: 12px; line-height: 16px; color: var(--fg-muted); }
.ps-und__sub { font: 600 12px/16px var(--font); color: var(--fg-muted); margin-top: 4px; display: flex; justify-content: space-between; gap: 8px; }
.ps-und__sub span:last-child { font-weight: 400; }
.ps-und__reg { display: grid; grid-template-columns: minmax(0, 1fr) 72px auto; gap: 6px 10px; align-items: center; font-size: 12.5px; }
.ps-und__reg .ps-pgoal__track { height: 4px; }
.ps-und__reg .num { text-align: right; color: var(--fg-muted); min-width: 40px; }
.ps-und__src { font-size: 11.5px; line-height: 16px; color: var(--fg-subtle); }
.ps-und__src a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
.ps-und__src a:hover { color: var(--fg); }
.ps-sec-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.ps-sec-title { margin: 0; font: 600 14px/20px var(--font); }
.ps-link { border: 0; background: none; padding: 0; font: 500 12.5px/16px var(--font); color: var(--fg-muted); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.ps-link:hover { color: var(--fg); text-decoration: underline; text-underline-offset: 2px; }
.ps-pfoot { display: flex; gap: 8px; justify-content: space-between; }
.ps-pagewrap { display: flex; flex-direction: column; gap: 16px; padding: 8px 16px 24px; }
.ps-pagehead { display: flex; align-items: center; gap: 8px; }
.ps-pagehead__title { flex: 1; min-width: 0; }
.ps-pagehead__title h1 { margin: 0; font: 600 20px/26px var(--font); display: flex; align-items: center; gap: 10px; }

/* Party form */
.ps-form { display: flex; flex-direction: column; gap: 14px; }
.ps-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ps-classline { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--fg-muted); margin-top: 6px; }
.ps-colors { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.ps-color { width: 28px; height: 28px; border-radius: 8px; border: 2px solid transparent; padding: 0; cursor: pointer; box-shadow: inset 0 0 0 1px rgb(0 0 0 / .08); }
.ps-color[aria-checked="true"] { border-color: var(--fg); }
.ps-del { border-radius: var(--r-2); background: var(--warn-soft); padding: 14px; display: flex; flex-direction: column; gap: 10px; font-size: 13px; line-height: 18px; }
.ps-del__title { font-weight: 600; font-size: 14px; }
.ps-del__check { display: flex; gap: 8px; align-items: flex-start; cursor: pointer; }
.ps-del__check input { margin-top: 2px; width: 16px; height: 16px; accent-color: var(--loss); }
.ps-del__actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
.ps-formfoot { display: flex; gap: 8px; justify-content: flex-end; }
.ps-logo-pick { display: flex; align-items: center; gap: 12px; }
.ps-logo-pick__btn { cursor: pointer; }
.ps-cfd-detail { display: flex; flex-direction: column; gap: 10px; }
.ps-cfd-alert-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; align-items: stretch; margin-top: 8px; }
.ps-cfd-alert-form > * { min-width: 0; width: 100%; height: 40px; font-size: 14px; }
.ps-cfd-alert-form > .ps-cfd-alert-form__wide { grid-column: 1 / -1; }
.ps-cfd-alerts .ps-coin { grid-template-columns: minmax(0, 1fr) auto; }
.ps-cfd-alerts .ps-coin__name { font-size: 14px; line-height: 19px; }
.ps-cfd-alerts .switch { width: auto; padding: 0; min-height: 0; }
.ps-cfd-alerts .switch__text { display: none; }
.ps-cfd-note { margin: 0; font-size: 12px; line-height: 17px; color: var(--fg-muted); }
.ps-cfd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
.ps-cfd-pos { display: grid; gap: 8px; padding: 12px; border: 1px solid var(--border); border-radius: var(--r-2); }

@media (max-width: 767.98px) {
  .ps-page { padding: 12px 16px; }
  .ps-form__row { grid-template-columns: 1fr; }
  .ps-pvalue { font-size: 30px; }
  .ps-kgrid dd { font-size: 16px; }
  .ps-pfoot > * { flex: 1; }
  .ps-color { width: 36px; height: 36px; }
  .ps-del__check { min-height: 44px; }
}
`);

const PS_PERIOD_FALLBACK = ['ALL', '1J', 'YTD', '3M', '1M'];
// Periodes op Posities: sturen zowel de winstkolommen als de trend. 'Alles' = totale winst.
const PS_GAIN_PERIODS = [
  { key: '1D',  label: '1D',    col: 'dag',   context: 'sinds gisteren' },
  { key: '1W',  label: '1W',    col: 'week',  context: 'afgelopen 7 dagen' },
  { key: '1M',  label: '1M',    col: 'maand', context: 'afgelopen maand' },
  { key: '3M',  label: '3M',    col: '3M',    context: 'afgelopen 3 maanden' },
  { key: 'YTD', label: 'YTD',   col: 'YTD',   context: 'dit jaar' },
  { key: '1J',  label: '1J',    col: 'jaar',  context: 'afgelopen jaar' },
  { key: 'ALL', label: 'Alles', col: null,    context: 'sinds {datum}' },
];
// Effectieve winstperiode voor Posities (val terug op 'Alles' als er te weinig data is).
function psGainKey(model, prefs, override) {
  const k = override || (prefs && prefs.positionsPeriod) || 'ALL';
  if (k === 'ALL' || !PS_GAIN_PERIODS.some(p => p.key === k)) return 'ALL';
  return periodRange(model.series.dates, k).enabled ? k : 'ALL';
}
function psGainLabel(key) {
  const p = PS_GAIN_PERIODS.find(x => x.key === key);
  return p && p.col ? 'Winst ' + p.col : 'Winst';
}
// Map partij-id → periodewinst ({gain, pct, base}) voor alle samenvattingen.
function psGainMap(model, key) {
  const out = {};
  for (const s of [...model.summaries, ...model.closed, ...model.empty]) out[s.party.id] = partyPeriodGain(model, s, key);
  return out;
}
const PS_SECONDARY_OPTIONS = [
  { value: 'pnl', label: 'Winst € + %' },
  { value: 'value', label: 'Waarde & aandeel' },
  { value: 'qty', label: 'Hoeveelheid' },
  { value: 'invested', label: 'Ingelegd' },
  { value: 'cagr', label: 'Per jaar (CAGR)' },
  { value: 'pnlPct', label: 'Winst %' },
];
const PS_SORT_OPTIONS = [
  { value: 'value', label: 'Waarde' },
  { value: 'pnl', label: 'Winst €' },
  { value: 'pnlPct', label: 'Winst %' },
  { value: 'share', label: 'Aandeel' },
  { value: 'name', label: 'Naam' },
  { value: 'cagr', label: 'Per jaar' },
];

function psCx(...a) { return a.filter(Boolean).join(' '); }
function psIncluded(p) { return (p.includeInTotal ?? p.includeInPortfolio) !== false; }
function psInChart(p) { return (p.includeInTimeChart ?? p.includeInPortfolio) !== false; }
function psTone(v) { return v > 0.5 ? 'ps-gain' : v < -0.5 ? 'ps-loss' : 'ps-flat'; }
function psTyping(e) {
  const t = e.target;
  if (!t) return false;
  const tag = (t.tagName || '').toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
}

// Effective period range (falls back to the first enabled period; never overwrites the pref).
function psRange(dates, period) {
  let key = period || '1J';
  let r = periodRange(dates, key);
  if (!r.enabled) {
    for (const k of PS_PERIOD_FALLBACK) {
      const r2 = periodRange(dates, k);
      if (r2.enabled) { r = r2; key = k; break; }
    }
  }
  return { ...r, key };
}

function psPeriodOptions(dates, list = PERIODS) {
  return list.map(p => {
    const en = periodRange(dates, p.key).enabled;
    return { value: p.key, label: p.label, disabled: !en, title: en ? undefined : 'Te weinig data', testId: `period-${p.key}` };
  });
}

// 1–7 shortcuts for the period (desktop, not while typing).
function usePsPeriodKeys(app, enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey || psTyping(e) || app.overlayOpen) return;
      const i = '1234567'.indexOf(e.key);
      if (i < 0) return;
      const key = PS_GAIN_PERIODS[i].key;
      if (!periodRange(app.model.series.dates, key).enabled) return;
      app.setPrefs({ positionsPeriod: key });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enabled, app]);
}

function psSortValue(s, key, totalValue, todayIso, gains) {
  const g = gains ? gains[s.party.id] : undefined;
  switch (key) {
    case 'name': return (s.party.name || '').toLowerCase();
    case 'pnl': return gains ? (g ? g.gain : -Infinity) : (s.pnl || 0);
    case 'pnlPct': return gains ? (g && g.pct != null ? g.pct : -Infinity) : (s.invested > 0 ? s.pnlPct : -Infinity);
    case 'share': return totalValue > 0 ? (s.currentValueEur || 0) / totalValue : 0;
    case 'cagr': { const c = cagrOf(s, todayIso).pct; return c == null ? -Infinity : c; }
    default: return s.currentValueEur || 0;
  }
}

function psSortSummaries(list, sort, totalValue, valueOf, gains) {
  const key = (sort && sort.key) || 'value';
  const dir = (sort && sort.dir) === 'asc' ? 1 : -1;
  const today = todayIsoLocal();
  const val = s => (valueOf && (key === 'value' || key === 'share') ? valueOf(s) : psSortValue(s, key, totalValue, today, gains));
  return list.slice().sort((a, b) => {
    const ia = psIncluded(a.party), ib = psIncluded(b.party);
    if (ia !== ib) return ia ? -1 : 1;          // excluded last within a group
    const va = val(a), vb = val(b);
    if (key === 'name') return dir * String(va).localeCompare(String(vb), 'nl');
    if (va === vb) return (a.party.name || '').localeCompare(b.party.name || '', 'nl');
    return dir * (va < vb ? -1 : 1);
  });
}

// Groups of open summaries by asset class in slot order.
function psGroupOpen(model, grouped) {
  const open = model.open;
  if (!grouped) return [{ key: '__all', label: null, color: null, rows: open }];
  const out = [];
  for (const c of ASSET_CLASSES) {
    const rows = open.filter(s => assetClassOf(s.party) === c.key);
    if (rows.length) out.push({ key: c.key, label: c.label, color: c.color, rows });
  }
  return out;
}

function psSpark(model, id, r) {
  const v = model.series.byParty[id];
  const nn = model.series.netByParty[id];
  if (!v || !v.length || r.i1 < 0) return null;
  const values = v.slice(r.i0, r.i1 + 1);
  if (!nn) return { values, tone: 'neutral' };
  const g = (v[r.i1] - nn[r.i1]) - (r.all ? 0 : (v[r.i0] - nn[r.i0]));
  return { values, tone: g > 0.5 ? 'gain' : g < -0.5 ? 'loss' : 'neutral' };
}

function PsMoney({ value, sign = false, className }) {
  return <Money value={value} sign={sign} className={className} />;
}

function PsSubline({ s, spots }) {
  const sub = holdingSubline(s, spots);
  if (sub.staleDays != null) {
    return <span className="ps-sub ps-sub--stale"><Icon name="clock" size={12} />{s.external ? `${sub.text} · ${sub.staleDays} dagen oud` : `Waardering · ${sub.staleDays} dagen oud`}</span>;
  }
  return <span className="ps-sub">{sub.text}</span>;
}

function PsBadges({ party }) {
  const out = [];
  if (!psIncluded(party)) out.push(<span key="t" className="ps-badge">niet in totaal</span>);
  if (!psInChart(party)) out.push(<span key="c" className="ps-badge">niet in grafiek</span>);
  return out.length ? <>{out}</> : null;
}

function PsSortTh({ label, k, sort, onSort, num = true, style }) {
  const active = sort.key === k;
  const ariaSort = active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined;
  return (
    <th scope="col" className={num ? 'num' : undefined} aria-sort={ariaSort} style={style}>
      <button type="button" className="ps-sort" data-active={active || undefined} onClick={() => onSort(k)}>
        {active && num && <Icon name={sort.dir === 'asc' ? 'chevron-up' : 'chevron-down'} size={12} />}
        {label}
        {active && !num && <Icon name={sort.dir === 'asc' ? 'chevron-up' : 'chevron-down'} size={12} />}
      </button>
    </th>
  );
}

// ===================================================================
// HoldingsTable
// ===================================================================
function HoldingsTable({ app, variant = 'full', period, asOfIndex = null, maxHeight, className, style }) {
  const { model, prefs, spots } = app;
  const compact = variant === 'compact';
  // Volledige tabel (Posities): één periodekeuze voor winstkolommen én trend.
  const gk = psGainKey(model, prefs);
  const per = compact ? (period || prefs.period) : (gk === 'ALL' ? 'ALL' : gk);
  const r = psRange(model.series.dates, per);
  const perLabel = ([...PERIODS, ...PS_GAIN_PERIODS].find(p => p.key === r.key) || {}).label || '';
  const gains = useMemo(() => (gk === 'ALL' ? null : psGainMap(model, gk)), [model, gk]);
  const grouped = compact || prefs.positionsGrouping !== 'none';
  const sort = prefs.positionsSort || { key: 'value', dir: 'desc' };
  const collapsed = new Set(prefs.collapsedGroups || []);
  const [closedOpen, setClosedOpen] = useState(!!prefs.showClosed && !compact);
  const [emptyOpen, setEmptyOpen] = useState(false);
  useEffect(() => { if (!compact) setClosedOpen(!!prefs.showClosed); }, [prefs.showClosed, compact]);
  const tbodyRef = useRef(null);

  const asOf = asOfIndex != null && asOfIndex >= 0 && asOfIndex < model.series.dates.length ? asOfIndex : null;
  const at = useMemo(() => (asOf != null ? holdingsAt(model, asOf) : null), [model, asOf]);
  const valueOf = s => (at ? (at[s.party.id] ? at[s.party.id].value : null) : s.currentValueEur);
  const pnlOf = s => (at ? (at[s.party.id] ? at[s.party.id].pnl : null)
    : gains ? (gains[s.party.id] ? gains[s.party.id].gain : null) : s.pnl);
  const pctOf = s => (gains ? (gains[s.party.id] ? gains[s.party.id].pct : null) : (s.invested > 0 ? s.pnlPct : null));
  const totalGain = gains && !at ? sumPeriodGains(model.included.map(s => gains[s.party.id])) : null;
  const totalValue = at
    ? model.included.reduce((a, s) => a + (valueOf(s) || 0), 0)
    : model.totals.value;
  const totalPnl = at
    ? model.included.reduce((a, s) => a + (pnlOf(s) || 0), 0)
    : totalGain ? totalGain.gain : model.totals.pnl;
  const totalPct = totalGain ? totalGain.pct : model.totals.pnlPct;

  const groups = psGroupOpen(model, grouped).map(g => {
    const inc = g.rows.filter(s => psIncluded(s.party));
    const value = inc.reduce((a, s) => a + (valueOf(s) || 0), 0);
    const pnl = inc.reduce((a, s) => a + (pnlOf(s) || 0), 0);
    const gsum = gains && !at ? sumPeriodGains(inc.map(s => gains[s.party.id])) : null;
    return { ...g, value, pnl, pct: gsum ? gsum.pct : null, share: totalValue > 0 ? value / totalValue * 100 : 0,
      rows: psSortSummaries(g.rows, sort, totalValue, at ? valueOf : null, at ? null : gains) };
  });
  const anyGoal = !compact && model.summaries.some(s => +s.party.goal > 0);

  const onSort = k => {
    const cur = prefs.positionsSort || { key: 'value', dir: 'desc' };
    const dir = cur.key === k ? (cur.dir === 'desc' ? 'asc' : 'desc') : (k === 'name' ? 'asc' : 'desc');
    app.setPrefs({ positionsSort: { key: k, dir } });
  };
  const toggleGroup = key => {
    const next = collapsed.has(key) ? [...collapsed].filter(k => k !== key) : [...collapsed, key];
    app.setPrefs({ collapsedGroups: next });
  };
  const open = id => app.navigate('/posities/' + encodeURIComponent(id));
  const onRowKey = (e, id) => {
    if (e.key === 'Enter') { e.preventDefault(); open(id); return; }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const rows = tbodyRef.current ? [...tbodyRef.current.parentNode.querySelectorAll('tr[data-ps-row]')] : [];
    const i = rows.indexOf(e.currentTarget);
    const next = rows[i + (e.key === 'ArrowDown' ? 1 : -1)];
    if (next) next.focus();
  };

  const today = todayIsoLocal();
  const colCount = compact ? 4 : (11 + (anyGoal ? 1 : 0));

  const renderRow = (s, opts = {}) => {
    const p = s.party;
    const id = p.id;
    const inc = psIncluded(p);
    const v = valueOf(s);
    const pn = pnlOf(s);
    const sp = psSpark(model, id, r);
    const closed = !!opts.closed;
    const cursorIdx = asOf != null && asOf >= r.i0 && asOf <= r.i1 ? asOf - r.i0 : null;
    const trend = sp ? <Sparkline values={sp.values} step={p.unit === 'bundle' || p.unit === 'eur'} endTone={sp.tone} cursorIndex={cursorIdx} /> : null;
    const pos = (
      <div className="ps-pos">
        <Monogram party={p} size={28} closed={closed} />
        <div className="ps-pos__text">
          <span className="ps-name">{p.name}{!compact && <PsBadges party={p} />}</span>
          {closed ? <span className="ps-sub">Gesloten · gerealiseerd {app.prefs.privacy ? '€ •••••' : fmtMoney(s.realizedPnl, { sign: true })}</span>
            : opts.empty ? <span className="ps-sub">Nog geen transacties</span>
            : <PsSubline s={s} spots={spots} />}
        </div>
      </div>
    );
    const common = {
      key: id, 'data-ps-row': '', 'data-testid': `holding-row-${id}`, tabIndex: 0,
      className: psCx('ps-row', (!inc || closed) && 'ps-row--muted'),
      onClick: () => open(id), onKeyDown: e => onRowKey(e, id),
    };
    if (compact) {
      return (
        <tr {...common}>
          <td>{pos}</td>
          <td>{trend}</td>
          <td className="num"><span className="ps-val">{v == null ? '—' : <PsMoney value={v} />}</span></td>
          <td className="num">
            {pn == null ? '—' : (
              <span className="ps-pnl">
                <span className={psCx('ps-val', psTone(pn))}><PsMoney value={pn} sign /></span>
                {!at && pctOf(s) != null && <small className={psTone(pn)}>{fmtPct(pctOf(s), { decimals: 1 })}</small>}
              </span>
            )}
          </td>
        </tr>
      );
    }
    const cg = cagrOf(s, today);
    const gp = goalProgress(s);
    const share = inc && totalValue > 0 && v != null ? v / totalValue * 100 : null;
    return (
      <tr {...common}>
        <td style={{ minWidth: 200 }}>{pos}</td>
        <td className="num ps-muted" style={{ whiteSpace: 'nowrap' }}>{holdingQtyText(s)}</td>
        <td className="num ps-muted" style={{ whiteSpace: 'nowrap', fontSize: 12.5 }}>{holdingPriceText(s, spots)}</td>
        <td className="num"><span className="ps-val">{v == null ? '—' : <PsMoney value={v} />}</span></td>
        <td className="num ps-muted">{share == null ? '—' : fmtPct(share, { decimals: 1, sign: false })}</td>
        <td className="num ps-muted"><PsMoney value={s.invested} /></td>
        <td className="num"><span className={psCx('ps-val', psTone(pn))}>{pn == null ? '—' : <PsMoney value={pn} sign />}</span></td>
        <td className={psCx('num', psTone(pn))}>{pctOf(s) != null ? fmtPct(pctOf(s), { decimals: 1 }) : '—'}</td>
        <td className="num" title={cg.pct == null ? 'minder dan 1 jaar historie' : `CAGR ${cg.years.toFixed(1).replace('.', ',')} j`}>
          {cg.pct == null ? <span className="ps-subtle">—</span> : <span className={psTone(cg.pct)}>{fmtPct(cg.pct, { decimals: 1 })} p.j.</span>}
        </td>
        {anyGoal && (
          <td className="num">
            {gp ? (
              <span className="ps-goal" title={gp.label}>
                <span className="ps-goal__track"><span className="ps-goal__fill" style={{ width: Math.min(100, gp.pct) + '%', display: 'block', background: partyColorOf(p) }} /></span>
                <small>{fmtPct(gp.pct, { decimals: 0, sign: false })}</small>
              </span>
            ) : <span className="ps-subtle">—</span>}
          </td>
        )}
        <td>{trend}</td>
        <td className="ps-subtle" style={{ width: 20 }}><Icon name="chevron-right" size={14} /></td>
      </tr>
    );
  };

  const groupRow = g => {
    if (!g.label) return null;
    const isOpen = asOf != null || !collapsed.has(g.key);
    const cells = compact ? (
      <>
        <td>
          <button type="button" className="ps-group__btn" aria-expanded={isOpen} onClick={() => toggleGroup(g.key)}>
            <Icon name="chevron-down" size={14} className="ps-chev" />
            <Swatch color={g.color} size={9} />
            {g.label} <span className="ps-group__share">{fmtPct(g.share, { decimals: 1, sign: false })}</span>
          </button>
        </td>
        <td><span className="ps-minibar"><span style={{ width: Math.min(100, g.share) + '%', background: g.color }} /></span></td>
        <td className="num"><span className="ps-val ps-muted"><PsMoney value={g.value} /></span></td>
        <td className="num"><span className={psCx('ps-val', psTone(g.pnl))}><PsMoney value={g.pnl} sign /></span></td>
      </>
    ) : (
      <>
        <td colSpan={3}>
          <button type="button" className="ps-group__btn" aria-expanded={isOpen} onClick={() => toggleGroup(g.key)}>
            <Icon name="chevron-down" size={14} className="ps-chev" />
            <Swatch color={g.color} size={9} />
            {g.label} <span className="ps-group__share">{fmtPct(g.share, { decimals: 1, sign: false })}</span>
          </button>
        </td>
        <td className="num"><span className="ps-val ps-muted"><PsMoney value={g.value} /></span></td>
        <td className="num ps-muted">{fmtPct(g.share, { decimals: 1, sign: false })}</td>
        <td />
        <td className="num"><span className={psCx('ps-val', psTone(g.pnl))}><PsMoney value={g.pnl} sign /></span></td>
        <td className={psCx('num', psTone(g.pnl))}>{gains && g.pct != null ? fmtPct(g.pct, { decimals: 1 }) : ''}</td>
        <td colSpan={colCount - 8} />
      </>
    );
    return <tr key={'g-' + g.key} className="ps-group">{cells}</tr>;
  };

  const closedList = psSortSummaries(model.closed, { key: 'name', dir: 'asc' }, totalValue);
  const closedPnl = model.closed.filter(s => psIncluded(s.party)).reduce((a, s) => a + (s.pnl || 0), 0);
  const fold = (label, count, isOpen, setOpen, extra) => (
    <tr className="ps-fold">
      <td colSpan={compact ? 2 : colCount - 3}>
        <button type="button" className="ps-fold__btn" aria-expanded={isOpen} onClick={() => setOpen(!isOpen)}>
          <Icon name="chevron-right" size={14} className="ps-chev" />
          {label} <span className="ps-subtle">{count}</span>
        </button>
      </td>
      <td className="num ps-muted" colSpan={compact ? 2 : 3} style={{ whiteSpace: 'nowrap', fontSize: 12.5 }}>{extra}</td>
    </tr>
  );

  const head = compact ? (
    <tr>
      <PsSortTh label="Positie" k="name" sort={sort} onSort={onSort} num={false} />
      <th scope="col" style={{ width: 92 }}>Trend {perLabel}</th>
      <PsSortTh style={{ width: at ? 118 : 88 }} label={at ? `Waarde op ${fmtDateShort(model.series.dates[asOf])}` : 'Waarde'} k="value" sort={sort} onSort={onSort} />
      <PsSortTh style={{ width: 104 }} label={at ? 'Winst' : psGainLabel(gk)} k="pnl" sort={sort} onSort={onSort} />
    </tr>
  ) : (
    <tr>
      <PsSortTh label="Positie" k="name" sort={sort} onSort={onSort} num={false} />
      <th scope="col" className="num">Hoeveelheid</th>
      <th scope="col" className="num">Koers/waardering</th>
      <PsSortTh label="Waarde" k="value" sort={sort} onSort={onSort} />
      <PsSortTh label="Aandeel" k="share" sort={sort} onSort={onSort} />
      <th scope="col" className="num">Ingelegd</th>
      <PsSortTh label={psGainLabel(gk) + ' €'} k="pnl" sort={sort} onSort={onSort} />
      <PsSortTh label={psGainLabel(gk) + ' %'} k="pnlPct" sort={sort} onSort={onSort} />
      <PsSortTh label="Per jaar" k="cagr" sort={sort} onSort={onSort} />
      {anyGoal && <th scope="col" className="num">Doel</th>}
      <th scope="col">Trend {perLabel}</th>
      <th scope="col"><span className="sr-only">Openen</span></th>
    </tr>
  );

  const orphanCount = model.orphans.length;

  return (
    <div className={psCx('ps-ht', compact && 'ps-ht--compact', className)} style={style}>
      {at && <div className="ps-ht__asof">Waarden op {fmtDateLong(model.series.dates[asOf])}</div>}
      <div className="ps-ht__scroll" style={maxHeight ? { maxHeight } : undefined}>
        <table>
          <thead>{head}</thead>
          <tbody ref={tbodyRef}>
            {groups.map(g => {
              const isOpen = !g.label || asOf != null || !collapsed.has(g.key);
              return (
                <React.Fragment key={g.key}>
                  {groupRow(g)}
                  {isOpen && g.rows.map(s => renderRow(s))}
                </React.Fragment>
              );
            })}
            {!at && closedList.length > 0 && fold('Gesloten posities', closedList.length, closedOpen, setClosedOpen,
              <>gerealiseerd <span className={psTone(closedPnl)}><PsMoney value={closedPnl} sign /></span></>)}
            {!at && closedOpen && closedList.map(s => renderRow(s, { closed: true }))}
            {!at && !compact && model.empty.length > 0 && fold('Zonder transacties', model.empty.length, emptyOpen, setEmptyOpen, null)}
            {!at && !compact && emptyOpen && model.empty.map(s => renderRow(s, { empty: true }))}
            {!compact && orphanCount > 0 && (
              <tr className="ps-orphan">
                <td colSpan={colCount}>
                  <div className="ps-orphan__inner">
                    <Icon name="triangle-alert" size={14} className="ps-warnic" />
                    <span>Transacties zonder partij ({orphanCount})</span>
                    <button type="button" className="ps-link" style={{ marginLeft: 'auto' }}
                      onClick={() => app.navigate('/transacties?partij=__orphan')}>Bekijken <Icon name="arrow-right" size={12} /></button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr data-testid="holdings-total">
              {compact ? (
                <>
                  <td colSpan={2}><span className="ps-total-label">Totaal{at ? ` op ${fmtDateShort(model.series.dates[asOf])}` : ''}</span></td>
                  <td className="num"><span className="ps-val"><PsMoney value={totalValue} /></span></td>
                  <td className="num"><span className={psCx('ps-val', psTone(totalPnl))}><PsMoney value={totalPnl} sign /></span></td>
                </>
              ) : (
                <>
                  <td colSpan={3}>Totaal</td>
                  <td className="num"><span className="ps-val"><PsMoney value={totalValue} /></span></td>
                  <td className="num">100%</td>
                  <td className="num"><PsMoney value={model.totals.invested} /></td>
                  <td className="num"><span className={psCx('ps-val', psTone(totalPnl))}><PsMoney value={totalPnl} sign /></span></td>
                  <td className={psCx('num', psTone(totalPnl))}>{totalPct == null ? '—' : fmtPct(totalPct, { decimals: 1 })}</td>
                  <td colSpan={colCount - 8} />
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="ps-ht__note">
        <span>{gains
          ? `${psGainLabel(gk)}: ${(PS_GAIN_PERIODS.find(p => p.key === gk) || {}).context}, exclusief stortingen en opnames · % = simple Dietz`
          : 'Winst per positie is incl. gerealiseerd resultaat'}</span>
        {!compact && model.summaries.some(s => !psIncluded(s.party)) && <span>Partijen met 'niet in totaal' tellen niet mee in subtotalen en totaal.</span>}
      </div>
    </div>
  );
}

// Gedeelde periodekeuze voor winst (Posities + Overzicht; pref positionsPeriod per apparaat).
function HoldingsPeriodPicker({ app, variant = 'seg', className }) {
  const gk = psGainKey(app.model, app.prefs);
  const opts = psPeriodOptions(app.model.series.dates, PS_GAIN_PERIODS).map(o => (o.value === 'ALL' ? Object.assign({}, o, { disabled: false }) : o));
  const set = k => app.setPrefs({ positionsPeriod: k });
  if (variant === 'chips') {
    return (
      <div className={psCx('ps-pchips', className)} role="group" aria-label="Periode voor winst">
        {opts.map(o => (
          <Chip key={o.value} active={o.value === gk} disabled={o.disabled} title={o.title} data-testid={'gain-' + o.testId}
            onClick={() => set(o.value)}>{o.label}</Chip>
        ))}
      </div>
    );
  }
  return <Segmented size="sm" className={className} ariaLabel="Periode voor winst" value={gk} onChange={set} options={opts} />;
}

// ===================================================================
// HoldingsList (mobile)
// ===================================================================
function psSecondary(s, mode, totalValue, privacy, g) {
  const p = s.party;
  const inc = psIncluded(p);
  if (g !== undefined && (mode === 'pnl' || mode === 'pnlPct')) {
    if (!g) return <span className="ps-lrow__sec">—</span>;
    if (mode === 'pnlPct') return <span className={psCx('ps-lrow__sec', psTone(g.gain))}>{g.pct != null ? fmtPct(g.pct, { decimals: 1 }) : '—'}</span>;
    return <span className="ps-lrow__sec"><Delta value={g.gain} pct={g.pct} size="sm" showGlyph={false} /></span>;
  }
  switch (mode) {
    case 'value': return <span className="ps-lrow__sec">{inc && totalValue > 0 ? fmtPct(s.currentValueEur / totalValue * 100, { decimals: 1, sign: false }) + ' aandeel' : 'niet in totaal'}</span>;
    case 'qty': return <span className="ps-lrow__sec">{holdingQtyText(s)}</span>;
    case 'invested': return <span className="ps-lrow__sec">Ingelegd {privacy ? '€ •••••' : fmtMoney(s.invested)}</span>;
    case 'cagr': {
      const c = cagrOf(s);
      return <span className={psCx('ps-lrow__sec', c.pct != null && psTone(c.pct))}>{c.pct == null ? '—' : fmtPct(c.pct, { decimals: 1 }) + ' p.j.'}</span>;
    }
    case 'pnlPct': return <span className={psCx('ps-lrow__sec', psTone(s.pnl))}>{s.invested > 0 ? fmtPct(s.pnlPct, { decimals: 1 }) : '—'}</span>;
    default:
      return <span className="ps-lrow__sec"><Delta value={s.pnl} pct={s.invested > 0 ? s.pnlPct : null} size="sm" showGlyph={false} /></span>;
  }
}

// Aandelen binnen een brokerpositie (Trading 212): per aandeel het aantal, de koers en de waarde.
function PsStockRows({ app, s }) {
  const privacy = !!app.prefs.privacy;
  const st = s.stocks;
  return (
    <div className="ps-lsub" data-testid={`holding-stocks-${s.party.id}`}>
      {st.positions.map(x => (
        <div className="ps-lstock" key={x.symbol} data-testid={'holding-stock-' + x.symbol}>
          <span className="ps-lstock__tick" aria-hidden="true">{x.symbol.replace(/\..*$/, '').slice(0, 4)}</span>
          <span className="ps-lrow__main">
            <span className="ps-lstock__name">{x.name}</span>
            <span className="ps-lrow__sub">
              {fmtQty(x.quantity, '', { decimals: x.quantity % 1 === 0 ? 0 : 4 }).trim()} st.{x.hasQuote && x.priceEur != null ? <> · {fmtMoney(x.priceEur, { decimals: 2 })}</> : ' · geen koers'}
            </span>
          </span>
          <span className="ps-lrow__end">
            <span className="ps-lstock__val"><Money value={x.value} /></span>
            <span className={psCx('ps-lrow__sec', psTone(x.pnl))}>{privacy ? '€ •••••' : fmtMoney(x.pnl, { sign: true })} · {fmtPct(x.pnlPct, { decimals: 1 })}</span>
          </span>
        </div>
      ))}
      {st.cash >= 0.005 && (
        <div className="ps-lstock" data-testid="holding-stock-cash">
          <span className="ps-lstock__tick" aria-hidden="true"><Icon name="wallet" size={14} /></span>
          <span className="ps-lrow__main">
            <span className="ps-lstock__name">Vrije kas</span>
            <span className="ps-lrow__sub">Niet belegd saldo</span>
          </span>
          <span className="ps-lrow__end"><span className="ps-lstock__val"><Money value={st.cash} /></span></span>
        </div>
      )}
    </div>
  );
}

// CFD-rekening: open posities (richting, aantal, openings- en huidige koers, winst/verlies), margin en cash.
const cfdNf = d => new Intl.NumberFormat('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d });
function cfdPrice(v, ccy) {
  if (v == null) return '—';
  const sym = { USD: '$', EUR: '€', GBP: '£' }[ccy] || '';
  const body = cfdNf(2).format(v);
  return sym ? `${sym}${body}` : `${body} ${ccy}`;
}
function cfdQty(q) { return q == null ? '—' : fmtQty(q, '', { decimals: q % 1 === 0 ? 0 : 4 }).trim(); }
function usePsCfd(app, s) {
  const ticks = useCfdTicks();
  return (s.party && s.party.cfd ? cfdLive(cfdNormalize(s.party.cfd), app.stockQuotes, ticks) : null) || s.cfd;
}
function PsCfdRows({ app, s }) {
  const privacy = !!app.prefs.privacy;
  const c = usePsCfd(app, s);
  const pm = v => (privacy ? '€ •••••' : fmtMoney(v, { sign: true, decimals: 2 }));
  return (
    <div className="ps-lsub" data-testid={`holding-cfd-${s.party.id}`}>
      {c.positions.map(x => (
        <div className="ps-lstock" key={x.id}>
          <span className="ps-lstock__tick" aria-hidden="true">{cfdSymbolOf(x)}</span>
          <span className="ps-lrow__main">
            <span className="ps-lstock__name">{x.name} · {x.dir === 'sell' ? 'Short' : 'Long'}</span>
            <span className="ps-lrow__sub">{cfdQty(x.quantity)} st. · {cfdPrice(x.openPrice, x.currency)} → {cfdPrice(x.currentPrice, x.currency)}{x.live ? ' live' : ''}</span>
          </span>
          <span className="ps-lrow__end">
            <span className={psCx('ps-lstock__val', psTone(x.pnl))}>{x.pnl == null ? '—' : pm(x.pnl)}</span>
            <span className="ps-lrow__sec">open resultaat</span>
          </span>
        </div>
      ))}
      {c.margin != null && (
        <div className="ps-lstock">
          <span className="ps-lstock__tick" aria-hidden="true"><Icon name="percent" size={14} /></span>
          <span className="ps-lrow__main"><span className="ps-lstock__name">Margin</span><span className="ps-lrow__sub">{c.health != null ? `Health ${cfdNf(0).format(c.health)}%` : 'Vastgezet voor open posities'}</span></span>
          <span className="ps-lrow__end"><span className="ps-lstock__val"><Money value={c.margin} decimals={2} /></span></span>
        </div>
      )}
      {c.cash != null && (
        <div className="ps-lstock">
          <span className="ps-lstock__tick" aria-hidden="true"><Icon name="wallet" size={14} /></span>
          <span className="ps-lrow__main"><span className="ps-lstock__name">Cash</span><span className="ps-lrow__sub">Vrij op de CFD-rekening</span></span>
          <span className="ps-lrow__end"><span className="ps-lstock__val"><Money value={c.cash} decimals={2} /></span></span>
        </div>
      )}
    </div>
  );
}

function PsListRow({ app, s, closed = false, empty = false, totalValue, mode, gain }) {
  const p = s.party;
  const privacy = !!app.prefs.privacy;
  const inc = psIncluded(p);
  const stocks = !closed && !empty && s.stocks && s.stocks.positions && s.stocks.positions.length > 0 ? s.stocks : null;
  const openIds = app.prefs.openHoldings || [];
  const cfd = !closed && !empty && !stocks && s.cfd ? s.cfd : null;
  const isOpen = !!(stocks || cfd) && openIds.includes(p.id);
  const row = (
    <button type="button" className={psCx('ps-lrow', (!inc || closed) && 'ps-lrow--muted')} data-testid={`holding-row-${p.id}`}
      onClick={() => app.navigate('/posities/' + encodeURIComponent(p.id))}>
      <Monogram party={p} size={40} closed={closed} />
      <span className="ps-lrow__main">
        <span className="ps-lrow__name">{p.name}{!inc && <span className="ps-badge">niet in totaal</span>}</span>
        {closed ? <span className="ps-lrow__sub">Gesloten</span>
          : empty ? <span className="ps-lrow__sub">Nog geen transacties</span>
          : <PsSubline s={s} spots={app.spots} />}
      </span>
      <span className="ps-lrow__end">
        <span className="ps-lrow__val"><Money value={s.currentValueEur} /></span>
        {closed ? <span className={psCx('ps-lrow__sec', psTone(s.pnl))}>{privacy ? '€ •••••' : fmtMoney(s.pnl, { sign: true })}</span>
          : empty ? <span className="ps-lrow__sec">—</span>
          : psSecondary(s, mode, totalValue, privacy, gain)}
      </span>
    </button>
  );
  if (cfd) {
    const k = cfd.positions.length;
    return (
      <>
        {row}
        <button type="button" className="ps-lmore" aria-expanded={isOpen} data-testid={`holding-expand-${p.id}`}
          onClick={() => app.setPrefs({ openHoldings: isOpen ? openIds.filter(id => id !== p.id) : [...openIds, p.id] })}>
          <span>{isOpen ? 'Live CFD verbergen' : `Live CFD bekijken · ${k === 1 ? '1 positie' : k + ' posities'}, cash en margin`}</span>
          <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={15} />
        </button>
        {isOpen && (window.OvCfdLive ? <OvCfdLive app={app} s={s} embedded /> : <PsCfdRows app={app} s={s} />)}
      </>
    );
  }
  if (!stocks) return row;
  const n = stocks.positions.length;
  return (
    <>
      {row}
      <button type="button" className="ps-lmore" aria-expanded={isOpen} data-testid={`holding-expand-${p.id}`}
        onClick={() => app.setPrefs({ openHoldings: isOpen ? openIds.filter(id => id !== p.id) : [...openIds, p.id] })}>
        <span>{isOpen ? 'Aandelen verbergen' : `${n === 1 ? '1 aandeel' : n + ' aandelen'} bekijken`}</span>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={15} />
      </button>
      {isOpen && <PsStockRows app={app} s={s} />}
    </>
  );
}

function HoldingsList({ app, variant = 'overview', period = null }) {
  const { model, prefs } = app;
  const page = variant === 'page';
  const grouped = !page || prefs.positionsGrouping !== 'none';
  const sort = page ? (prefs.positionsSort || { key: 'value', dir: 'desc' }) : { key: 'value', dir: 'desc' };
  // Overzicht toont altijd winst (volgt de gedeelde periodekeuze); Posities volgt 'Toon'.
  const mode = page ? (prefs.positionsSecondary || 'pnl') : 'pnl';
  const totalValue = model.totals.value;
  // Overzicht geeft de gedeelde periode door; Posities gebruikt de eigen keuze.
  const gk = psGainKey(model, prefs, period);
  const gains = useMemo(() => (gk === 'ALL' ? null : psGainMap(model, gk)), [model, gk]);
  const gainOf = s => (gains ? (gains[s.party.id] || null) : undefined);
  const [closedOpen, setClosedOpen] = useState(false);
  const [emptyOpen, setEmptyOpen] = useState(false);
  const collapsed = new Set(prefs.collapsedGroups || []);
  const groups = psGroupOpen(model, grouped).map(g => {
    const inc = g.rows.filter(s => psIncluded(s.party));
    const value = inc.reduce((a, s) => a + (s.currentValueEur || 0), 0);
    const gsum = gains ? sumPeriodGains(inc.map(s => gains[s.party.id])) : null;
    return { ...g, value, gsum, share: totalValue > 0 ? value / totalValue * 100 : 0, rows: psSortSummaries(g.rows, sort, totalValue, null, gains) };
  });
  const toggleGroup = key => {
    const next = collapsed.has(key) ? [...collapsed].filter(k => k !== key) : [...collapsed, key];
    app.setPrefs({ collapsedGroups: next });
  };
  const closedPnl = model.closed.filter(s => psIncluded(s.party)).reduce((a, s) => a + (s.pnl || 0), 0);
  const privacy = !!prefs.privacy;
  return (
    <div className="ps-list">
      {groups.map(g => {
        const isOpen = !g.label || !collapsed.has(g.key);
        return (
          <React.Fragment key={g.key}>
            {g.label && (
              <button type="button" className="ps-lgroup" aria-expanded={isOpen} onClick={() => toggleGroup(g.key)}>
                <Swatch color={g.color} size={8} shape="dot" />
                <span className="ps-lgroup__label">{g.label}</span>
                <span className="num">{g.share > 0 && g.share < 0.1 ? '<0,1%' : fmtPct(g.share, { decimals: 1, sign: false })}</span>
                {g.gsum && <span className={psCx('ps-lgroup__gain', psTone(g.gsum.gain))}>{privacy ? '€ •••••' : fmtMoney(g.gsum.gain, { sign: true })}</span>}
                <span className="ps-lgroup__val"><Money value={g.value} /></span>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} style={{ color: 'var(--fg-subtle)' }} />
              </button>
            )}
            {isOpen && g.rows.map(s => <PsListRow key={s.party.id} app={app} s={s} totalValue={totalValue} mode={mode} gain={gainOf(s)} />)}
          </React.Fragment>
        );
      })}
      {model.closed.length > 0 && (
        <button type="button" className="ps-lfold" aria-expanded={closedOpen} onClick={() => setClosedOpen(!closedOpen)}>
          <span className="monogram monogram--40 monogram--closed" aria-hidden="true"><Icon name="layers" size={16} /></span>
          <span className="ps-lfold__main">
            <span className="ps-lfold__title">Gesloten posities</span>
            <span className="ps-lfold__sub">{model.closed.length} partijen · gerealiseerd <span className={psTone(closedPnl)}>{privacy ? '€ •••••' : fmtMoney(closedPnl, { sign: true })}</span></span>
          </span>
          <Icon name={closedOpen ? 'chevron-up' : 'chevron-down'} size={16} style={{ color: 'var(--fg-subtle)' }} />
        </button>
      )}
      {closedOpen && model.closed.map(s => <PsListRow key={s.party.id} app={app} s={s} closed totalValue={totalValue} mode={mode} />)}
      {page && model.empty.length > 0 && (
        <button type="button" className="ps-lfold" aria-expanded={emptyOpen} onClick={() => setEmptyOpen(!emptyOpen)}>
          <span className="ps-lfold__main">
            <span className="ps-lfold__title">Zonder transacties</span>
            <span className="ps-lfold__sub">{model.empty.length} partij(en)</span>
          </span>
          <Icon name={emptyOpen ? 'chevron-up' : 'chevron-down'} size={16} style={{ color: 'var(--fg-subtle)' }} />
        </button>
      )}
      {page && emptyOpen && model.empty.map(s => <PsListRow key={s.party.id} app={app} s={s} empty totalValue={totalValue} mode={mode} />)}
      {page && model.orphans.length > 0 && (
        <button type="button" className="ps-lfold" onClick={() => app.navigate('/transacties?partij=__orphan')}>
          <Icon name="triangle-alert" size={18} style={{ color: 'var(--warn)' }} />
          <span className="ps-lfold__main">
            <span className="ps-lfold__title">Transacties zonder partij</span>
            <span className="ps-lfold__sub">{model.orphans.length} transactie(s) · Bekijken</span>
          </span>
          <Icon name="chevron-right" size={16} style={{ color: 'var(--fg-subtle)' }} />
        </button>
      )}
      <div className="ps-lnote">{gains
        ? `${psGainLabel(gk)} (${(PS_GAIN_PERIODS.find(p => p.key === gk) || {}).context}) is exclusief stortingen en opnames.`
        : 'Winst per positie is inclusief gerealiseerde winst.'}</div>
    </div>
  );
}

// ===================================================================
// PartyPanel
// ===================================================================
function psUnitPrice(v, unit) {
  if (v == null || !Number.isFinite(+v)) return '—';
  return fmtMoney(+v, { decimals: +v >= 1000 ? 0 : 2 }) + (unit ? '/' + unit : '');
}

function PsHoldingStrip({ s, spots }) {
  const p = s.party;
  const items = [];
  const add = (k, v) => items.push(<span key={k}>{k} <b>{v}</b></span>);
  switch (p.unit) {
    case 'gram':
    case 'ounce': {
      const u = p.unit === 'gram' ? 'g' : 'oz';
      add('Bezit', holdingQtyText(s));
      add('Spot', psUnitPrice(s.currentUnitPrice ?? (u === 'g' ? spots.goldSpotEurPerGram : spots.silverSpotEurPerOunce), u));
      if (s.avgCost != null) add('Gem. aankoop', psUnitPrice(s.avgCost, u));
      break;
    }
    case 'crypto':
      add('Bezit', fmtQty(s.quantity || 0, p.unitLabel, { decimals: 8 }));
      add('Koers', psUnitPrice(s.currentUnitPrice, ''));
      if (s.avgCost != null) add('Gem. aankoop', psUnitPrice(s.avgCost, ''));
      break;
    case 'mixed':
      add('Goud', fmtQty(s.goldQty || 0, 'g', { decimals: 2 }));
      add('Zilver', fmtQty(s.silverQty || 0, 'oz', { decimals: 2 }));
      add('Spot goud', psUnitPrice(spots.goldSpotEurPerGram, 'g'));
      add('Spot zilver', psUnitPrice(spots.silverSpotEurPerOunce, 'oz'));
      break;
    case 'part':
      add('Aantal', holdingQtyText(s));
      add('Koers', holdingPriceText(s, spots));
      if (s.avgCost != null) add('Gem. aankoop', fmtMoney(s.avgCost, { decimals: 2 }));
      break;
    default:
      add('Laatste waardering', holdingPriceText(s, spots));
  }
  return <div className="ps-strip">{items}</div>;
}

// Per-coin uitsplitsing van een crypto-post (Finst / Wallet), incl. on-chain status voor self-custody.
// ── Trading 212-pies: nabootsen, inleggen/opnemen en volgen ──
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#64748b'];
function pieGradient(slices, key) {
  let at = 0;
  const parts = slices.filter(x => x[key] > 0).map((x, i) => { const from = at; at += x[key]; return `${PIE_COLORS[i % PIE_COLORS.length]} ${from}% ${at}%`; });
  return parts.length ? `conic-gradient(${parts.join(', ')}${at < 99.9 ? `, var(--surface-3) ${at}% 100%` : ''})` : 'var(--surface-3)';
}

// Echte pies uit Trading 212 (via de koppeling): waarde, resultaat en doel- vs. huidige verdeling.
function PsLivePies({ app }) {
  const privacy = !!(app.prefs && app.prefs.privacy);
  const live = app.t212Live;
  const pies = (live && live.pies) || [];
  const [open, setOpen] = useState(null);
  const names = Object.fromEntries(((live && live.positions) || []).map(x => [x.ticker, x.name]));
  if (!pies.length && !(live && live.piesError)) return null;
  return (
    <div data-testid="t212-live-pies">
      <div className="ps-sec-head" style={{ marginBottom: 8 }}>
        <h3 className="ps-sec-title">Pies ({pies.length})</h3>
        {live.piesFetchedAt && <span className="ps-subtle" style={{ fontSize: 12 }}>bijgewerkt {fmtTime(live.piesFetchedAt)}</span>}
      </div>
      {live.piesError && <p className="ps-coin__warn" style={{ fontSize: 12.5, margin: '0 0 8px' }}><Icon name="circle-alert" size={12} />Pies ophalen mislukt: {live.piesError}</p>}
      {pies.length > 0 && (
        <div className="ps-pies">
          {pies.map(pie => {
            const isOpen = open === pie.id;
            const ins = pie.instruments.slice().sort((a, b) => b.expectedShare - a.expectedShare);
            const rows = ins.map(x => ({ ...x, target: x.expectedShare * 100, actual: x.currentShare * 100 }));
            const value = pie.value + (pie.cash || 0);
            return (
              <div className="ps-pie" key={pie.id} data-testid={'live-pie-' + pie.id}>
                <button type="button" className="ps-pie__head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : pie.id)}>
                  <span className="ps-pie__ring" aria-hidden="true" style={{ background: pieGradient(rows, 'actual') }} />
                  <div style={{ minWidth: 0 }}>
                    <div className="ps-coin__name">{pie.name}</div>
                    <div className="ps-coin__sub">{ins.length} {ins.length === 1 ? 'aandeel' : 'aandelen'} · ingelegd {privacy ? '€ •••••' : fmtMoney(pie.invested)}
                      {pie.goal ? ` · doel ${privacy ? '€ •••••' : fmtMoney(pie.goal)}` : ''}</div>
                  </div>
                  <div className="ps-coin__end">
                    <span className="ps-coin__val"><Money value={value} /></span>
                    <span className={psTone(pie.result)} style={{ fontSize: 12.5 }}>{privacy ? '€ •••••' : fmtMoney(pie.result, { sign: true })}{pie.resultCoef != null ? ' · ' + fmtPct(pie.resultCoef * 100, { decimals: 1 }) : ''}</span>
                  </div>
                </button>
                {isOpen && (
                  <div className="ps-pie__body">
                    {(pie.cash > 0.005 || (pie.dividends && pie.dividends.gained > 0)) && (
                      <div className="ps-subtle" style={{ fontSize: 12.5 }}>
                        {pie.cash > 0.005 && <>Kas in pie {privacy ? '€ •••••' : fmtMoney(pie.cash, { decimals: 2 })}</>}
                        {pie.cash > 0.005 && pie.dividends && pie.dividends.gained > 0 && ' · '}
                        {pie.dividends && pie.dividends.gained > 0 && <>Dividend {privacy ? '€ •••••' : fmtMoney(pie.dividends.gained, { decimals: 2 })}{pie.dividendAction === 'REINVEST' ? ' (herbelegd)' : ''}</>}
                      </div>
                    )}
                    <div>
                      {rows.map((x, i) => (
                        <div className="ps-pie__sl" key={x.ticker}>
                          <span className="ps-und__dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span style={{ minWidth: 0 }}><b style={{ fontWeight: 600 }}>{x.symbol || x.ticker}</b> <span className="ps-subtle">{names[x.ticker] || ''}</span></span>
                          <span className="num" style={{ textAlign: 'right' }}>{privacy ? '€ •••••' : fmtMoney(x.value, { decimals: 2 })}</span>
                          <div className="ps-pie__bars" title={`Doel ${fmtPct(x.target, { decimals: 1, sign: false })} · nu ${fmtPct(x.actual, { decimals: 1, sign: false })}`}>
                            <div className="ps-pie__bar ps-pie__bar--target"><span style={{ width: Math.min(100, x.target) + '%', background: PIE_COLORS[i % PIE_COLORS.length] }} /></div>
                            <div className="ps-pie__bar"><span style={{ width: Math.min(100, x.actual) + '%', background: PIE_COLORS[i % PIE_COLORS.length] }} /></div>
                            <span className="ps-subtle" style={{ fontSize: 11.5 }}>Doel {fmtPct(x.target, { decimals: 1, sign: false })} · nu {fmtPct(x.actual, { decimals: 1, sign: false })}
                              {' · '}{fmtQty(x.ownedQuantity, '', { decimals: 4 }).trim()} st. · <span className={psTone(x.result)}>{privacy ? '€ •••••' : fmtMoney(x.result, { sign: true, decimals: 2 })}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PsPies({ app, linked }) {
  const privacy = !!(app.prefs && app.prefs.privacy);
  const pies = (app.tweaks && app.tweaks.t212Pies) || [];
  if (linked && !pies.length) return null;
  const list = useMemo(() => summarizePies(pies, (app.state && app.state.transactions) || [], app.stockQuotes || {}), [pies, app.state, app.stockQuotes]);
  const [open, setOpen] = useState(null);
  const [edit, setEdit] = useState(null);   // null | 'new' | pie
  const [money, setMoney] = useState(null); // { pie, mode }
  return (
    <div data-testid="t212-pies">
      <div className="ps-sec-head" style={{ marginBottom: 8 }}>
        <h3 className="ps-sec-title">{linked ? 'Nagebootste pies' : 'Pies'} ({pies.length})</h3>
        <button type="button" className="ps-link" onClick={() => setEdit('new')}><Icon name="plus" size={12} /> Nieuwe pie</button>
      </div>
      {linked && <p className="ps-subtle" style={{ fontSize: 12.5, margin: '0 0 8px' }}>Alleen ter vergelijking: met de koppeling tellen deze boekingen niet mee in je waarde.</p>}
      {list.length === 0 ? (
        <p className="ps-subtle" style={{ fontSize: 13, margin: 0 }}>Maak je Trading 212-pie na met dezelfde aandelen en percentages. Een inleg wordt dan automatisch over alle aandelen verdeeld.</p>
      ) : (
        <div className="ps-pies">
          {list.map(ps => {
            const isOpen = open === ps.pie.id;
            const shown = ps.slices.filter(x => x.target > 0 || x.quantity > 0);
            return (
              <div className="ps-pie" key={ps.pie.id} data-testid={'pie-' + ps.pie.id}>
                <button type="button" className="ps-pie__head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : ps.pie.id)}>
                  <span className="ps-pie__ring" aria-hidden="true" style={{ background: pieGradient(shown, ps.value > 0 ? 'actual' : 'target') }} />
                  <div style={{ minWidth: 0 }}>
                    <div className="ps-coin__name">{ps.pie.name}</div>
                    <div className="ps-coin__sub">{shown.length} {shown.length === 1 ? 'aandeel' : 'aandelen'}{ps.value > 0 ? ` · ingelegd ${privacy ? '€ •••••' : fmtMoney(ps.cost)}` : ' · nog niets ingelegd'}</div>
                  </div>
                  <div className="ps-coin__end">
                    <span className="ps-coin__val"><Money value={ps.value} /></span>
                    {ps.txCount > 0 && <span className={psTone(ps.pnl)} style={{ fontSize: 12.5 }}>{privacy ? '€ •••••' : fmtMoney(ps.pnl, { sign: true })}{ps.pnlPct != null ? ' · ' + fmtPct(ps.pnlPct, { decimals: 1 }) : ''}</span>}
                  </div>
                </button>
                {isOpen && (
                  <div className="ps-pie__body">
                    <div className="ps-pie__acts">
                      <Button size="sm" variant="primary" icon="plus" onClick={() => setMoney({ pie: ps.pie, mode: 'in' })}>Inleggen</Button>
                      <Button size="sm" variant="secondary" icon="minus" disabled={!(ps.value > 0)} onClick={() => setMoney({ pie: ps.pie, mode: 'uit' })}>Opnemen</Button>
                      <Button size="sm" variant="ghost" icon="pencil" onClick={() => setEdit(ps.pie)}>Bewerken</Button>
                    </div>
                    <div>
                      {shown.map((x, i) => (
                        <div className="ps-pie__sl" key={x.symbol}>
                          <span className="ps-und__dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span style={{ minWidth: 0 }}><b style={{ fontWeight: 600 }}>{x.symbol}</b> <span className="ps-subtle">{x.name !== x.symbol ? x.name : ''}</span></span>
                          <span className="num" style={{ textAlign: 'right' }}>{x.quantity > 0 ? (privacy ? '€ •••••' : fmtMoney(x.value, { decimals: 2 })) : '—'}</span>
                          <div className="ps-pie__bars" title={`Doel ${fmtPct(x.target, { decimals: 1, sign: false })} · nu ${fmtPct(x.actual, { decimals: 1, sign: false })}`}>
                            <div className="ps-pie__bar ps-pie__bar--target"><span style={{ width: Math.min(100, x.target) + '%', background: PIE_COLORS[i % PIE_COLORS.length] }} /></div>
                            <div className="ps-pie__bar"><span style={{ width: Math.min(100, x.actual) + '%', background: PIE_COLORS[i % PIE_COLORS.length] }} /></div>
                            <span className="ps-subtle" style={{ fontSize: 11.5 }}>Doel {fmtPct(x.target, { decimals: 1, sign: false })} · nu {fmtPct(x.actual, { decimals: 1, sign: false })}
                              {x.quantity > 0 && <> · <span className={psTone(x.pnl)}>{privacy ? '€ •••••' : fmtMoney(x.pnl, { sign: true, decimals: 2 })}</span></>}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {edit && <PieEditSheet app={app} pie={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
      {money && <PieMoneySheet app={app} pie={money.pie} mode={money.mode} summary={list.find(x => x.pie.id === money.pie.id)} onClose={() => setMoney(null)} />}
    </div>
  );
}

function PieEditSheet({ app, pie, onClose }) {
  const [name, setName] = useState(pie ? pie.name : '');
  const [slices, setSlices] = useState(() => (pie ? pie.slices : []).map(x => ({ ...x, weight: String(x.weight).replace('.', ',') })));
  const [tried, setTried] = useState(false);
  const total = slices.reduce((a, x) => a + (parseNlNumber(x.weight) || 0), 0);
  const okTotal = Math.abs(total - 100) < 0.05;
  const errors = !name.trim() ? 'Geef de pie een naam' : !slices.length ? 'Voeg minstens één aandeel toe'
    : slices.some(x => !(parseNlNumber(x.weight) > 0)) ? 'Elk aandeel heeft een percentage nodig' : !okTotal ? 'De percentages moeten samen 100% zijn' : null;
  const addSlice = it => setSlices(list => list.some(x => x.symbol === it.symbol) ? list : [...list, { symbol: it.symbol, name: it.name || it.symbol, weight: '' }]);
  const equal = () => setSlices(list => {
    const n = list.length; if (!n) return list;
    const base = Math.floor(10000 / n) / 100;
    return list.map((x, i) => ({ ...x, weight: String(i === 0 ? +(100 - base * (n - 1)).toFixed(2) : base).replace('.', ',') }));
  });
  const save = () => {
    setTried(true);
    if (errors) return;
    const next = { id: pie ? pie.id : 'pie_' + Math.random().toString(36).slice(2, 9), name: name.trim(), createdAt: pie ? pie.createdAt : new Date().toISOString(),
      slices: slices.map(x => ({ symbol: normalizeTicker(x.symbol), name: x.name, weight: +(parseNlNumber(x.weight)).toFixed(2) })) };
    app.updateTweaks(tw => {
      const names = { ...(tw.stockNames || {}) };
      next.slices.forEach(x => { if (x.name && x.name !== x.symbol) names[x.symbol] = x.name; });
      const list = (tw.t212Pies || []).filter(x => x.id !== next.id);
      return { ...tw, stockNames: names, t212Pies: pie ? (tw.t212Pies || []).map(x => x.id === next.id ? next : x) : [...list, next] };
    });
    if (app.refreshStocks) app.refreshStocks({ symbols: next.slices.map(x => x.symbol) });
    app.toast && app.toast(pie ? 'Pie opgeslagen' : 'Pie aangemaakt');
    onClose();
  };
  const remove = async () => {
    const res = await app.confirm({ title: `Pie "${pie.name}" verwijderen?`, body: 'Alleen de pie verdwijnt. De gekochte aandelen en hun transacties blijven gewoon bij Trading 212 staan.', confirmLabel: 'Verwijderen' });
    if (!res || !res.ok) return;
    app.updateTweaks(tw => ({ ...tw, t212Pies: (tw.t212Pies || []).filter(x => x.id !== pie.id) }));
    onClose();
  };
  return (
    <Sheet open onClose={onClose} testId="pie-edit" width={520} title={pie ? 'Pie bewerken' : 'Nieuwe pie'} subtitle="Dezelfde aandelen en percentages als in je Trading 212-pie."
      footer={<div className="md-foot">
        {pie && <Button variant="ghost" onClick={remove}>Verwijderen</Button>}
        <span className="md-foot__reason">{tried ? errors : ''}</span>
        <Button variant="ghost" onClick={onClose}>Annuleren</Button>
        <Button variant="primary" onClick={save} data-testid="pie-save">Opslaan</Button>
      </div>}>
      <div className="md-form">
        <Field label="Naam" htmlFor="pie-name"><Input id="pie-name" value={name} placeholder="bijv. Dividend Pie" onChange={e => setName(e.target.value)} /></Field>
        <Field label="Aandelen in de pie" hint={slices.length ? null : 'Zoek en kies de aandelen of ETF’s uit je pie.'}>
          {slices.map((x, i) => (
            <div className="pe-row" key={x.symbol}>
              <div style={{ minWidth: 0 }}><div className="md-stock__sym">{x.symbol}</div><div className="md-stock__meta" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.name}</div></div>
              <MoneyInput prefix="" suffix="%" value={x.weight} placeholder="0" ariaLabel={`Percentage ${x.symbol}`}
                onChange={v => setSlices(list => list.map((y, j) => j === i ? { ...y, weight: v } : y))} />
              <IconButton icon="x" label={`${x.symbol} verwijderen`} size="sm" onClick={() => setSlices(list => list.filter((_, j) => j !== i))} />
            </div>
          ))}
          {slices.length > 0 && (
            <div className={'pe-sum' + (okTotal ? '' : ' is-bad')}>
              <span>Totaal {fmtPct(total, { decimals: 2, sign: false })}{okTotal ? '' : ' (moet 100% zijn)'}</span>
              <button type="button" className="md-addlink" onClick={equal}>Gelijk verdelen</button>
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <MdStockPicker id="pie-add" value="" name="" recent={[]} onPick={addSlice} />
          </div>
        </Field>
      </div>
    </Sheet>
  );
}

function PieMoneySheet({ app, pie, mode, summary, onClose }) {
  const today = todayIsoLocal();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [tried, setTried] = useState(false);
  const quotes = app.stockQuotes || {};
  const isIn = mode === 'in';
  useEffect(() => { if (app.refreshStocks) app.refreshStocks({ symbols: pie.slices.map(x => normalizeTicker(x.symbol)) }); }, []); // eslint-disable-line
  const amt = parseNlNumber(amount) || 0;
  const rows = isIn
    ? pie.slices.map(x => {
        const sym = normalizeTicker(x.symbol);
        const px = stockPriceAt(quotes[sym], date, today);
        const eur = amt * (+x.weight || 0) / 100;
        return { symbol: sym, eur, px, qty: px ? eur / px : null };
      })
    : ((summary && summary.slices) || []).filter(x => x.quantity > 0).map(x => {
        const px = stockPriceAt(quotes[x.symbol], date, today);
        const frac = summary.value > 0 ? Math.min(1, amt / summary.value) : 0;
        const qty = x.quantity * frac;
        return { symbol: x.symbol, eur: px ? qty * px : 0, px, qty };
      });
  const missing = rows.filter(r => !r.px).map(r => r.symbol);
  const maxOut = summary ? summary.value : 0;
  const error = !(amt > 0) ? 'Vul een bedrag in' : missing.length ? `Nog geen koers voor ${missing.join(', ')}` : (!isIn && amt > maxOut + 0.005) ? `Maximaal ${fmtMoney(maxOut, { decimals: 2 })}` : null;
  const submit = () => {
    setTried(true);
    if (error) return;
    const batch = Math.random().toString(36).slice(2, 8);
    const txs = rows.filter(r => r.qty > 0).map(r => ({
      id: makeId(), party: STOCK_PARTY_ID, type: isIn ? 'koop' : 'verkoop', date, instrument: r.symbol,
      quantity: +r.qty.toFixed(8), unitPriceEur: +r.px.toFixed(6), amountEur: +r.eur.toFixed(2),
      note: `Pie ${pie.name}`, _t212Id: `pie:${pie.id}:${batch}`,
    }));
    app.saveTxs(txs, isIn ? `${fmtMoney(amt, { decimals: 2 })} ingelegd in ${pie.name}` : `${fmtMoney(amt, { decimals: 2 })} opgenomen uit ${pie.name}`);
    onClose();
  };
  return (
    <Sheet open onClose={onClose} testId="pie-money" width={480} title={isIn ? `Inleggen in ${pie.name}` : `Opnemen uit ${pie.name}`}
      subtitle={isIn ? 'Het bedrag wordt volgens de pie-percentages over de aandelen verdeeld.' : 'Er wordt naar verhouding uit elk aandeel verkocht.'}
      footer={<div className="md-foot">
        <span className="md-foot__reason">{tried || amt > 0 ? error : ''}</span>
        <Button variant="ghost" onClick={onClose}>Annuleren</Button>
        <Button variant="primary" onClick={submit} data-testid="pie-money-submit">{isIn ? 'Inleggen' : 'Opnemen'}</Button>
      </div>}>
      <div className="md-form">
        <Field label="Bedrag (€)" htmlFor="pie-amt" hint={!isIn && maxOut > 0 ? `Waarde nu ${fmtMoney(maxOut, { decimals: 2 })}` : null}>
          <MoneyInput id="pie-amt" large value={amount} onChange={setAmount} placeholder="0,00" />
        </Field>
        <Field label="Datum" htmlFor="pie-date">
          <div className="md-chips">
            <Chip active={date === today} onClick={() => setDate(today)}>Vandaag</Chip>
            <Chip active={date === addDaysIso(today, -1)} onClick={() => setDate(addDaysIso(today, -1))}>Gisteren</Chip>
          </div>
          <Input id="pie-date" type="date" value={date} max={today} onChange={e => setDate(e.target.value)} />
        </Field>
        {amt > 0 && (
          <div>
            <div className="ps-sec-head" style={{ marginBottom: 4 }}><h3 className="ps-sec-title">Verdeling</h3><span className="ps-subtle" style={{ fontSize: 12 }}>koers {date >= today ? 'nu' : 'op ' + fmtDateShort(date)}</span></div>
            <table className="pe-prev"><tbody>
              {rows.map(r => (
                <tr key={r.symbol}>
                  <td><b style={{ fontWeight: 600 }}>{r.symbol}</b></td>
                  <td>{r.px ? fmtQty(r.qty, '', { decimals: 4 }).trim() + ' × ' + fmtMoney(r.px, { decimals: 2 }) : <span style={{ color: 'var(--warn)' }}>geen koers</span>}</td>
                  <td>{fmtMoney(r.eur, { decimals: 2 })}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        )}
      </div>
    </Sheet>
  );
}

// Trading 212: posities per ticker met live koers (koersen-worker) en de vrije kas.
function PsStockPositions({ app, s }) {
  const privacy = !!(app.prefs && app.prefs.privacy);
  const st = s.stocks;
  const status = app.stockStatus || {};
  const fetchedAt = Object.values(app.stockQuotes || {}).map(q => q.fetchedAt).filter(Boolean).sort().pop();
  return (
    <div>
      <div className="ps-sec-head" style={{ marginBottom: 8 }}>
        <h3 className="ps-sec-title">Aandelen ({st.positions.length})</h3>
        <button type="button" className="ps-link" disabled={!!status.loading} onClick={() => { if (st.live && app.refreshT212Live) app.refreshT212Live({ force: true }); if (app.refreshStocks) app.refreshStocks({ force: true }); }}>
          <Icon name={status.loading ? 'loader' : 'refresh-cw'} size={12} /> {status.loading ? 'Ophalen…' : 'Ververs koersen'}
        </button>
      </div>
      <div className="ps-coins" data-testid="stock-positions">
        {st.positions.map(x => (
          <div className="ps-coin" key={x.symbol} data-testid={'stock-' + x.symbol}>
            <span className="ps-stk__tick" aria-hidden="true">{x.symbol.replace(/\..*$/, '').slice(0, 4)}</span>
            <div style={{ minWidth: 0 }}>
              <div className="ps-coin__name">{x.name}</div>
              <div className="ps-coin__sub">
                {x.symbol} · {fmtQty(x.quantity, '', { decimals: x.quantity % 1 === 0 ? 0 : 4 }).trim()} × {x.hasQuote ? fmtMoney(x.priceEur, { decimals: 2 }) : 'geen koers'}
                {x.quantityInPies > 0 && <> · {x.quantityInPies >= x.quantity - 1e-9 ? 'in pie' : `${fmtQty(x.quantityInPies, '', { decimals: 4 }).trim()} in pie`}</>}
                {x.dayChange != null && Math.abs(x.dayChange) >= 0.005 && <> · <span className={psTone(x.dayChange)}>{privacy ? '€ •••••' : fmtMoney(x.dayChange, { sign: true, decimals: 2 })} vandaag</span></>}
              </div>
            </div>
            <div className="ps-coin__end">
              <span className="ps-coin__val"><Money value={x.value} /></span>
              <span className={psTone(x.pnl)} style={{ fontSize: 12.5 }}>{privacy ? '€ •••••' : fmtMoney(x.pnl, { sign: true })} · {fmtPct(x.pnlPct, { decimals: 1 })}</span>
            </div>
            {!x.hasQuote && <div className="ps-coin__chain"><span className="ps-coin__warn"><Icon name="circle-alert" size={12} />Nog geen koers; gewaardeerd tegen kostprijs</span></div>}
          </div>
        ))}
        {st.cash >= 0.005 && (
          <div className="ps-coin" data-testid="stock-cash">
            <span className="ps-stk__tick" aria-hidden="true"><Icon name="wallet" size={14} /></span>
            <div style={{ minWidth: 0 }}><div className="ps-coin__name">Vrije kas</div><div className="ps-coin__sub">{st.live && st.account && st.account.inPies > 0.005 ? `Waarvan ${fmtMoney(st.account.inPies, { decimals: 2 })} in pies` : 'Niet belegd saldo bij Trading 212'}</div></div>
            <div className="ps-coin__end"><span className="ps-coin__val"><Money value={st.cash} /></span></div>
          </div>
        )}
      </div>
      <div className="ps-stk__foot">
        {st.live
          ? <span>Live uit Trading 212 · {fmtRelDay(st.fetchedAt.slice(0, 10))} {fmtTime(st.fetchedAt)}{app.t212LiveError ? '' : ''}</span>
          : <span>Koersen via Yahoo Finance, omgerekend naar euro{fetchedAt ? ` · ${fmtRelDay(fetchedAt.slice(0, 10))} ${fmtTime(fetchedAt)}` : ''}</span>}
        {st.live && app.t212LiveError && <span className="ps-coin__warn"><Icon name="circle-alert" size={12} />{app.t212LiveError} (laatste stand getoond)</span>}
        {status.error && <span className="ps-coin__warn"><Icon name="circle-alert" size={12} />{status.error}</span>}
      </div>
    </div>
  );
}

// Detailpagina CFD-rekening: kerncijfers, open posities en de stand bijwerken.
function PsCfdAccount({ app, s }) {
  const privacy = !!(app.prefs && app.prefs.privacy);
  const [edit, setEdit] = useState(false);
  const c = usePsCfd(app, s);
  const netIn = s.costBasis - (s.realizedPnl || 0);
  const pm = (v, d = 0) => (privacy ? '€ •••••' : fmtMoney(v, { sign: true, decimals: d }));
  return (
    <div data-testid="cfd-account">
      <div className="ps-sec-head" style={{ marginBottom: 8 }}>
        <h3 className="ps-sec-title">CFD-rekening</h3>
        <span style={{ display: 'flex', gap: 14 }}>
          <button type="button" className="ps-link" onClick={() => app.openTx({ type: 'koop', party: s.party.id })} data-testid="cfd-open-new">
            <Icon name="plus" size={12} /> Positie openen
          </button>
          <button type="button" className="ps-link" onClick={() => setEdit(true)} data-testid="cfd-edit">
            <Icon name="pencil" size={12} /> {c ? 'Stand bijwerken' : 'Stand invullen'}
          </button>
        </span>
      </div>
      {!c ? <p className="ps-subtle" style={{ margin: 0, fontSize: 13 }}>Vul de stand uit Trading 212 (CFD) in: accountwaarde, cash, margin en je open posities.</p> : (<>
        <p className="ps-cfd-note">{c.stream ? 'Koers live per tick' : c.live ? 'Koers per 10 min' : 'Laatste stand'}{c.live ? ` · ${privacy ? '€ •••••' : fmtMoney(c.liveDelta, { sign: true, decimals: 2 })} sinds de stand` : ''}{c.asOf ? ` van ${fmtDateLong(c.asOf)}` : ''}. Health is een schatting tot je de stand bijwerkt.</p>
      </>)}
      {edit && <PsCfdEdit app={app} s={s} onClose={() => setEdit(false)} />}
    </div>
  );
}

// Meldingen voor de CFD-rekening (opgeslagen op de partij als cfdAlerts, dus op al je apparaten dezelfde regels).
function PsCfdAlerts({ app, s }) {
  const party = s.party;
  const ticks = useCfdTicks();
  const live = cfdLive(cfdNormalize(party.cfd), app.stockQuotes || {}, ticks);
  const rules = Array.isArray(party.cfdAlerts) ? party.cfdAlerts : [];
  const syms = live ? live.positions.map(x => ({ sym: x.symbol, name: x.name })) : [];
  const [f, setF] = useState({ kind: 'pnl', symbol: '', op: 'below', value: '' });
  const save = list => app.saveParty({ ...party, cfdAlerts: list });
  const val = cfdNum(f.value);
  const needSym = f.kind === 'price';
  const sym = needSym ? (f.symbol || (syms[0] && syms[0].sym) || '') : (f.kind === 'pnl' ? f.symbol : '');
  const ok = val != null && (!needSym || sym);
  const add = () => {
    if (!ok) return;
    if (app.requestNotify) app.requestNotify();
    save([...rules, { id: 'a' + Date.now().toString(36), kind: f.kind, symbol: sym || '', op: f.op, value: val, on: true }]);
    setF(x => ({ ...x, value: '' }));
  };
  const cur = ok || f.kind ? cfdAlertValue({ kind: f.kind, symbol: sym }, live) : null;
  const curTxt = v => (v == null ? '—' : f.kind === 'health' ? `${Math.round(v)}%` : f.kind === 'price' ? String(Math.round(v * 100) / 100).replace('.', ',') : fmtMoney(v, { sign: f.kind === 'pnl', decimals: 2 }));
  return (
    <div className="ps-cfd-alerts" data-testid="cfd-alerts">
      <div className="ps-sec-head" style={{ marginBottom: 6 }}><h3 className="ps-sec-title">Meldingen</h3></div>
      {rules.length > 0 ? (
        <div className="ps-coins">
          {rules.map(r => {
            const { hit, v } = cfdAlertHit(r, live);
            return (
              <div className="ps-coin" key={r.id}>
                <div style={{ minWidth: 0 }}>
                  <div className="ps-coin__name">{cfdAlertLabel(r, live)}</div>
                  <div className="ps-coin__sub">Nu {v == null ? '—' : r.kind === 'health' ? `${Math.round(v)}%` : r.kind === 'price' ? String(Math.round(v * 100) / 100).replace('.', ',') : fmtMoney(v, { sign: r.kind === 'pnl', decimals: 2 })}{hit ? ' · voorwaarde bereikt' : ''}</div>
                </div>
                <div className="ps-coin__end" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Switch checked={r.on !== false} onChange={on => save(rules.map(x => (x.id === r.id ? { ...x, on } : x)))} label="" aria-label="Melding aan" />
                  <IconButton icon="trash-2" label="Verwijderen" onClick={() => save(rules.filter(x => x.id !== r.id))} />
                </div>
              </div>
            );
          })}
        </div>
      ) : <p className="ps-subtle" style={{ margin: '0 0 8px', fontSize: 13 }}>Nog geen meldingen. Krijg een melding als bijvoorbeeld je verlies groter wordt dan een bedrag of de health te laag wordt.</p>}
      <div className="ps-cfd-alert-form">
        <Select aria-label="Waarop" value={f.kind} onChange={e => setF(x => ({ ...x, kind: e.target.value }))}>
          {CFD_ALERT_KINDS.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
        </Select>
        {(f.kind === 'pnl' || f.kind === 'price') && (
          <Select aria-label="Positie" value={sym} onChange={e => setF(x => ({ ...x, symbol: e.target.value }))}>
            {f.kind === 'pnl' && <option value="">Alle posities</option>}
            {syms.map(o => <option key={o.sym} value={o.sym}>{o.name}</option>)}
          </Select>
        )}
        <Select aria-label="Richting" value={f.op} onChange={e => setF(x => ({ ...x, op: e.target.value }))}>
          <option value="below">onder</option><option value="above">boven</option>
        </Select>
        <Input className={(f.kind === 'pnl' || f.kind === 'price') ? undefined : 'ps-cfd-alert-form__wide'} inputMode="decimal" aria-label="Waarde" placeholder={f.kind === 'pnl' ? '-100' : f.kind === 'health' ? '30' : ''} value={f.value} onChange={e => setF(x => ({ ...x, value: e.target.value }))} />
        <Button className="ps-cfd-alert-form__wide" variant="primary" disabled={!ok} onClick={add} data-testid="cfd-alert-add">Melding toevoegen</Button>
      </div>
      <p className="ps-cfd-note" style={{ marginTop: 8 }}>Nu: {curTxt(cur)}. Meldingen komen binnen zolang de app open is of net op de achtergrond staat.</p>
    </div>
  );
}

function PsCfdEdit({ app, s, onClose }) {
  const p = s.party;
  const c = cfdNormalize(p.cfd); // de ingevoerde stand, niet de live doorgerekende
  const str = v => (v == null ? '' : String(v).replace('.', ','));
  const blank = () => ({ id: 'p' + Date.now().toString(36), symbol: '', name: '', dir: 'buy', quantity: '', openPrice: '', currentPrice: '', currency: 'USD', pnl: '' });
  const [f, setF] = useState(() => ({
    date: todayIsoLocal(),
    accountValue: str(c && c.accountValue), cash: str(c && c.cash), margin: str(c && c.margin), health: str(c && c.health),
    positions: c && c.positions.length ? c.positions.map(x => ({ ...x, quantity: str(x.quantity), openPrice: str(x.openPrice), currentPrice: str(x.currentPrice), pnl: str(x.pnl) })) : [blank()],
  }));
  const set = patch => setF(x => ({ ...x, ...patch }));
  const setPos = (i, patch) => setF(x => ({ ...x, positions: x.positions.map((y, j) => (j === i ? { ...y, ...patch } : y)) }));
  const num = v => cfdNum(v);
  const av = num(f.accountValue);
  const valid = av != null && av >= 0 && /^\d{4}-\d{2}-\d{2}$/.test(f.date);
  const submit = () => {
    const cfd = {
      asOf: f.date, accountValue: av, cash: num(f.cash), margin: num(f.margin), health: num(f.health),
      positions: f.positions.filter(x => (x.symbol || x.name).trim()).map(x => ({
        id: x.id, symbol: x.symbol.trim().toUpperCase(), name: (x.name || x.symbol).trim(), dir: x.dir, currency: x.currency,
        quantity: num(x.quantity), openPrice: num(x.openPrice), currentPrice: num(x.currentPrice), pnl: num(x.pnl),
        marginRate: x.marginRate != null && x.marginRate !== '' ? num(x.marginRate) : null, openedAt: x.openedAt || null,
      })),
      trades: (c && c.trades) || [],
    };
    app.saveParty({ ...p, cfd });
    // De waarde in totalen en grafiek: één waardering per dag (bestaande van die dag wordt bijgewerkt).
    const same = (s.transactions || []).find(t => t.party === p.id && t.type === 'waardering' && t.date === f.date);
    app.saveTx({ ...(same || { id: makeId(), party: p.id, type: 'waardering', date: f.date }), valueEur: av, note: 'Stand CFD-rekening' });
    onClose();
  };
  const footer = (
    <div className="ps-formfoot">
      <Button variant="ghost" onClick={onClose}>Annuleren</Button>
      <Button variant="primary" disabled={!valid} onClick={submit} data-testid="cfd-save">Opslaan</Button>
    </div>
  );
  const dec = { inputMode: 'decimal' };
  return (
    <Sheet open onClose={onClose} width={520} testId="cfd-sheet" title="Stand CFD-rekening" subtitle="Neem de cijfers over uit Trading 212 → CFD." footer={footer}>
      <div className="ps-form" style={{ display: 'grid', gap: 12 }}>
        <div className="ps-cfd-grid">
          <Field label="Datum" htmlFor="cfd-date"><Input id="cfd-date" type="date" value={f.date} onChange={e => set({ date: e.target.value })} /></Field>
          <Field label="Accountwaarde (€)" htmlFor="cfd-av"><Input id="cfd-av" {...dec} value={f.accountValue} onChange={e => set({ accountValue: e.target.value })} /></Field>
          <Field label="Cash (€)" htmlFor="cfd-cash"><Input id="cfd-cash" {...dec} value={f.cash} onChange={e => set({ cash: e.target.value })} /></Field>
          <Field label="Margin (€)" htmlFor="cfd-margin"><Input id="cfd-margin" {...dec} value={f.margin} onChange={e => set({ margin: e.target.value })} /></Field>
          <Field label="Health (%)" htmlFor="cfd-health"><Input id="cfd-health" {...dec} value={f.health} onChange={e => set({ health: e.target.value })} /></Field>
        </div>
        <h4 className="ps-sec-title" style={{ margin: '6px 0 0' }}>Open posities</h4>
        {f.positions.map((x, i) => (
          <div key={x.id} className="ps-cfd-pos">
            <div className="ps-cfd-grid">
              <Field label="Naam"><Input value={x.name} placeholder="Nvidia" onChange={e => setPos(i, { name: e.target.value })} /></Field>
              <Field label="Ticker"><Input value={x.symbol} placeholder="NVDA" onChange={e => setPos(i, { symbol: e.target.value })} /></Field>
              <Field label="Richting"><Select value={x.dir} onChange={e => setPos(i, { dir: e.target.value })}><option value="buy">Long (buy)</option><option value="sell">Short (sell)</option></Select></Field>
              <Field label="Aantal"><Input {...dec} value={x.quantity} onChange={e => setPos(i, { quantity: e.target.value })} /></Field>
              <Field label="Valuta koers"><Select value={x.currency} onChange={e => setPos(i, { currency: e.target.value })}>{['USD', 'EUR', 'GBP'].map(k => <option key={k} value={k}>{k}</option>)}</Select></Field>
              <Field label="Openingskoers"><Input {...dec} value={x.openPrice} onChange={e => setPos(i, { openPrice: e.target.value })} /></Field>
              <Field label="Huidige koers"><Input {...dec} value={x.currentPrice} onChange={e => setPos(i, { currentPrice: e.target.value })} /></Field>
              <Field label="Resultaat (€)"><Input {...dec} value={x.pnl} placeholder="-67,73" onChange={e => setPos(i, { pnl: e.target.value })} /></Field>
            </div>
            <button type="button" className="ps-link" onClick={() => setF(y => ({ ...y, positions: y.positions.filter((_, j) => j !== i) }))}><Icon name="trash-2" size={12} /> Positie verwijderen</button>
          </div>
        ))}
        <button type="button" className="ps-link" onClick={() => setF(y => ({ ...y, positions: [...y.positions, blank()] }))}><Icon name="plus" size={12} /> Positie toevoegen</button>
        <p className="ps-subtle" style={{ margin: 0, fontSize: 12.5 }}>Stortingen en opnames boek je als inleg/opname op deze positie; winst = accountwaarde − netto ingelegd.</p>
      </div>
    </Sheet>
  );
}

// ===================================================================
// Koers van het product zelf (niet de waarde van je positie): via de koersen-worker (/grafiek, Yahoo Finance).
// ===================================================================
const PS_PX_RANGES = [['1d', '1D'], ['5d', '1W'], ['1mo', '1M'], ['3mo', '3M'], ['1y', '1J'], ['5y', '5J'], ['max', 'Max']];
const PS_COIN_YH = { BTC: 'BTC-EUR', ETH: 'ETH-EUR', PAXG: 'PAXG-USD' };
const psPxCache = new Map();
function psPriceSymbols(s) {
  const p = s.party || {};
  const out = [];
  const add = (sym, label) => { if (sym && !out.some(o => o.sym === sym)) out.push({ sym, label: label || sym }); };
  if (p.cfd && Array.isArray(p.cfd.positions)) p.cfd.positions.forEach(x => add(String(x.symbol || '').toUpperCase(), x.name || x.symbol));
  if (s.stocks && s.stocks.positions) s.stocks.positions.forEach(x => add(x.symbol, x.name));
  if (p.ticker) add(String(p.ticker).toUpperCase(), p.name);
  if (p.id === 'meesman') add('0P0001IJJX.F', 'Meesman Aandelen Wereldwijd Totaal');
  const coin = c => PS_COIN_YH[String(c || '').toUpperCase()];
  if (p.unit === 'crypto') add(coin(p.coin || p.unitLabel), (CRYPTO_COIN_BY_KEY[String(p.coin || p.unitLabel || '').toUpperCase()] || {}).label);
  (s.leaves || []).forEach(l => { const lp = l.party || l; add(coin(lp.coin || lp.unitLabel), (CRYPTO_COIN_BY_KEY[String(lp.coin || '').toUpperCase()] || {}).label); });
  if (p.id === 'finst-paxg') add('PAXG-USD', 'PAX Gold');
  if (p.id === 'goud' || p.unit === 'gram' || p.isMixed || p.id === 'goldrepublic') add('GC=F', 'Goud (troy ounce)');
  if (p.id === 'zilver' || p.unit === 'ounce' || p.isMixed || p.id === 'goldrepublic') add('SI=F', 'Zilver (troy ounce)');
  return out.filter(o => o.sym);
}
function psPxFmt(v, ccy) {
  if (v == null || !Number.isFinite(v)) return '—';
  const d = Math.abs(v) >= 1000 ? 0 : Math.abs(v) >= 1 ? 2 : 4;
  const body = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  const sym = { USD: '$', EUR: '€', GBP: '£', GBp: 'p', CHF: 'CHF ' }[ccy];
  return sym === 'p' ? body + 'p' : sym ? sym + body : `${body} ${ccy || ''}`.trim();
}
function psPxWhen(ts, range) {
  const d = new Date(ts * 1000);
  if (range === '1d') return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  if (range === '5d' || range === '1mo') return d.toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}
function PsPriceChart({ app, s }) {
  const syms = React.useMemo(() => psPriceSymbols(s), [s]);
  const [pick, setPick] = useState(null);
  const [range, setRange] = useState(() => (app.prefs && app.prefs.pxRange) || '1mo');
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [hover, setHover] = useState(null);
  const ticks = useCfdTicks();
  const cur = syms.find(o => o.sym === pick) || syms[0];
  const sym = cur && cur.sym;
  React.useEffect(() => {
    if (!sym) return undefined;
    let dead = false;
    const key = sym + '|' + range;
    const load = async () => {
      const c = psPxCache.get(key);
      if (c && Date.now() - c.at < (range === '1d' ? 60000 : 300000)) { setData(c.data); setErr(null); return; }
      try {
        const res = await fetch(`${STOCK_API_URL}/grafiek?s=${encodeURIComponent(sym)}&range=${range}`, { cache: 'no-store' });
        const j = await res.json();
        if (!res.ok || j.error) throw new Error(j.error || `Koersdienst gaf ${res.status}`);
        psPxCache.set(key, { at: Date.now(), data: j });
        if (!dead) { setData(j); setErr(null); }
      } catch (e) { if (!dead) setErr(e.message || 'Koers ophalen mislukt'); }
    };
    setData(d => (d && d.symbol === sym && d.range === range ? d : null));
    load();
    const id = range === '1d' || range === '5d' ? setInterval(load, 60000) : null;
    return () => { dead = true; if (id) clearInterval(id); };
  }, [sym, range]);
  if (!syms.length) return null;
  const pts = data && data.symbol && data.points ? data.points.slice() : [];
  // Live tick (CFD-stream) als laatste punt.
  const tk = sym && ticks[sym];
  if (tk && tk.price > 0 && pts.length && (range === '1d' || range === '5d')) pts.push([Math.floor(Date.parse(tk.time) / 1000), tk.price]);
  const last = tk && tk.price > 0 ? tk.price : (data && data.price != null ? data.price : (pts.length ? pts[pts.length - 1][1] : null));
  const ref = range === '1d' && data && data.previousClose != null ? data.previousClose : (pts.length ? pts[0][1] : null);
  const hv = hover != null && pts[hover] ? pts[hover] : null;
  const shown = hv ? hv[1] : last;
  const chg = shown != null && ref ? shown - ref : null;
  const chgPct = chg != null && ref ? chg / ref * 100 : null;
  const tone = chg == null ? '' : chg > 0 ? 'pos' : chg < 0 ? 'neg' : '';
  const W = 1000, H = 150;
  let path = null, area = null, mn = 0, mx = 0, xOf = null, yOf = null;
  if (pts.length >= 2) {
    mn = Math.min(...pts.map(q => q[1])); mx = Math.max(...pts.map(q => q[1]));
    if (mx === mn) { mx += 1; mn -= 1; }
    const pad = (mx - mn) * 0.08;
    const lo = mn - pad, hi = mx + pad;
    const t0 = pts[0][0], t1 = pts[pts.length - 1][0];
    xOf = i => (range === '1d' || range === '5d' ? i / (pts.length - 1) : (pts[i][0] - t0) / ((t1 - t0) || 1)) * W;
    yOf = v => H - (v - lo) / (hi - lo) * H;
    path = pts.map((q, i) => `${i ? 'L' : 'M'}${xOf(i).toFixed(1)},${yOf(q[1]).toFixed(1)}`).join('');
    area = `${path}L${W},${H}L0,${H}Z`;
  }
  const col = tone === 'neg' ? 'var(--negative)' : tone === 'pos' ? 'var(--positive)' : 'var(--fg-muted)';
  const onMove = e => {
    if (!pts.length) return;
    const r = e.currentTarget.getBoundingClientRect();
    const cx = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width * W;
    let best = 0, bd = Infinity;
    for (let i = 0; i < pts.length; i++) { const d = Math.abs(xOf(i) - cx); if (d < bd) { bd = d; best = i; } }
    setHover(best);
  };
  const refLabel = range === '1d' ? 'sinds slot gisteren' : `in ${(PS_PX_RANGES.find(x => x[0] === range) || [])[1] || ''}`;
  return (
    <section className="ps-px" data-testid="price-chart">
      <div className="ps-sec-head">
        <h3 className="ps-sec-title">Koers{cur && syms.length === 1 ? ` · ${cur.label}` : ''}</h3>
        <span className="ps-subtle" style={{ fontSize: 12 }}>{data ? `${data.symbol}${data.exchange ? ' · ' + data.exchange : ''}` : sym}</span>
      </div>
      {syms.length > 1 && (
        <div className="ps-px__chips" role="tablist" aria-label="Product">
          {syms.map(o => <button key={o.sym} type="button" role="tab" aria-selected={o.sym === sym} className={'ps-px__chip' + (o.sym === sym ? ' is-on' : '')} onClick={() => { setPick(o.sym); setHover(null); }}>{o.label}</button>)}
        </div>
      )}
      <div className="ps-px__head">
        <span className="ps-px__val">{psPxFmt(shown, data && data.currency)}</span>
        {chg != null && <span className={'ps-px__chg ' + psTone(chg)}>{chg > 0 ? '+' : chg < 0 ? '−' : ''}{psPxFmt(Math.abs(chg), data && data.currency)} ({fmtPct(chgPct, { decimals: 2 })})</span>}
        <span className="ps-px__when">{hv ? psPxWhen(hv[0], range) : tk && tk.price > 0 ? 'live' : refLabel}</span>
      </div>
      <div className="ps-px__plot" onMouseMove={onMove} onMouseLeave={() => setHover(null)} onTouchStart={onMove} onTouchMove={onMove} onTouchEnd={() => setHover(null)}>
        {path ? (
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Koersverloop ${cur ? cur.label : ''}`}>
            <defs><linearGradient id={'pxg-' + sym.replace(/[^a-z0-9]/gi, '')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity=".18" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient></defs>
            {range === '1d' && ref != null && yOf(ref) >= 0 && yOf(ref) <= H && <line x1="0" x2={W} y1={yOf(ref)} y2={yOf(ref)} stroke="var(--border-strong, var(--border))" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />}
            <path d={area} fill={`url(#pxg-${sym.replace(/[^a-z0-9]/gi, '')})`} />
            <path d={path} fill="none" stroke={col} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            {hv && <line x1={xOf(hover)} x2={xOf(hover)} y1="0" y2={H} stroke="var(--fg-muted)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
          </svg>
        ) : <div className="ps-px__empty">{err ? `Koers niet beschikbaar: ${err}` : data ? 'Geen koersen in deze periode' : 'Koers laden…'}</div>}
        {path && <><span className="ps-px__hi">{psPxFmt(mx, data.currency)}</span><span className="ps-px__lo">{psPxFmt(mn, data.currency)}</span></>}
      </div>
      <Segmented size="sm" pill={app.isMobile} full={app.isMobile} ariaLabel="Periode koers" value={range}
        onChange={k => { setRange(k); setHover(null); app.setPrefs({ pxRange: k }); }} options={PS_PX_RANGES.map(([v, label]) => ({ value: v, label }))} />
      <div className="ps-stk__foot"><span>Koers van het product zelf via Yahoo Finance{data && data.currency ? `, in ${data.currency}` : ''}{range === '1d' ? ' · incl. voor- en nabeurs' : ''}{tk && tk.price > 0 ? ((range === '1d' || range === '5d') ? ' · laatste punt live' : ' · prijs bovenaan live') : ''}</span></div>
    </section>
  );
}

function PsPostCoins({ app, s }) {
  const privacy = !!(app.prefs && app.prefs.privacy);
  const leaves = s.leaves || [];
  if (!leaves.length) return null;
  const cb = app.chainBalances || {};
  return (
    <div>
      <div className="ps-sec-head" style={{ marginBottom: 8 }}><h3 className="ps-sec-title">Per coin</h3></div>
      <div className="ps-coins" data-testid="post-coins">
        {leaves.map(l => {
          const p = l.party;
          const coin = p.unitLabel || p.coin;
          const meta = CRYPTO_COIN_BY_KEY[p.coin] || {};
          const chain = p.address ? cb[p.id] : null;
          const onChain = l.bookedQuantity != null;
          const diff = onChain ? (+l.quantity || 0) - (+l.bookedQuantity || 0) : 0;
          return (
            <div className="ps-coin" key={p.id} data-testid={'post-coin-' + p.id}>
              <Monogram party={p} size={32} />
              <div style={{ minWidth: 0 }}>
                <div className="ps-coin__name">{meta.label || p.name}</div>
                <div className="ps-coin__sub">{fmtQty(+l.quantity || 0, coin, { decimals: 8 })} · {psUnitPrice(l.currentUnitPrice, '')}</div>
              </div>
              <div className="ps-coin__end">
                <span className="ps-coin__val"><Money value={l.currentValueEur || 0} /></span>
                <span className={psTone(l.pnl)} style={{ fontSize: 12.5 }}>{privacy ? '€ •••••' : fmtMoney(l.pnl || 0, { sign: true })}</span>
              </div>
              {p.address && (
                <div className="ps-coin__chain">
                  {chain && chain.checkedAt
                    ? <span><Icon name="link" size={12} /> On-chain · gecontroleerd {fmtRelDay(chain.checkedAt.slice(0, 10))} {fmtTime(chain.checkedAt)}</span>
                    : <span><Icon name="link" size={12} /> On-chain · nog niet opgehaald</span>}
                  {chain && chain.error && <span className="ps-coin__warn"><Icon name="circle-alert" size={12} />{chain.error}{chain.checkedAt ? ' (laatste saldo getoond)' : ''}</span>}
                  {onChain && Math.abs(diff) > 1e-9 && (
                    <span className="ps-coin__warn" title="Het on-chain saldo is leidend voor het aantal; boek ontbrekende overboekingen of kosten om de kostprijs te laten kloppen.">
                      <Icon name="triangle-alert" size={12} />Verschil met boekingen {diff > 0 ? '+' : '−'}{fmtQty(Math.abs(diff), coin, { decimals: 8 })}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Aan te vullen boekingen uit Financieel (Vermogensopbouw): datum, positie en bedrag, met een knop naar
// het bewerkformulier. Tot het aanvullen telt het bedrag als ingelegd tegen kostprijs (winst 0).
function PsFinAanvul({ app, partyIds = null, inline = false }) {
  const all = (app.state && app.state.transactions) || [];
  const list = all.filter(t => isFinBelAanvullen(t) && (!partyIds || partyIds.includes(t.party)))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  if (!list.length) return null;
  const parties = (app.model && app.model.allParties) || [];
  const rows = list.map(tx => {
    const party = parties.find(p => p.id === tx.party) || null;
    return (
      <ListRow key={tx.id} testId={`fin-aanvul-${tx.id}`}
        leading={party ? <Monogram party={party} size={28} /> : null}
        title={<>{finBelPartyLabel(parties, tx.party)} <Pill tone="warn" icon="pencil">OPEN</Pill></>}
        subtitle={party ? `${fmtDateLong(tx.date)} · uit Financieel`
          : `${fmtDateLong(tx.date)} · uit Financieel · onbekende positie, kies de juiste bij aanvullen`}
        value={<Money value={+tx.amountEur || 0} decimals={2} />}
        secondary={<Button size="sm" variant="primary" icon="pencil" onClick={() => app.completeFinTx(tx)}>Aanvullen</Button>} />
    );
  });
  const note = 'Uit Financieel (Vermogensopbouw). Vul aantal, prijs en kosten aan; tot dan telt het bedrag als ingelegd tegen kostprijs.';
  const heading = finBelOpenTitle(list.length);
  if (inline) {
    return (
      <div data-testid="fin-aanvul-inline">
        <div className="ps-sec-head"><h3 className="ps-sec-title">{heading}</h3></div>
        {rows}
      </div>
    );
  }
  return (
    <Card title={heading} data-testid="fin-aanvul-card">
      <p className="ps-subtle" style={{ fontSize: 12.5, margin: '0 0 6px' }}>{note}</p>
      {rows}
    </Card>
  );
}

function PsPartyBody({ app, s }) {
  const { model, prefs, spots } = app;
  const p = s.party;
  const id = p.id;
  const privacy = !!prefs.privacy;
  const inc = psIncluded(p);
  const dates = model.series.dates;
  const r = psRange(dates, prefs.period);
  const byP = model.series.byParty[id];
  const netP = model.series.netByParty[id];
  const [cursor, setCursor] = useState(null);
  const [allTx, setAllTx] = useState(false);
  const chartDates = r.i1 >= 0 ? dates.slice(r.i0, r.i1 + 1) : [];
  const primary = byP && r.i1 >= 0 ? byP.slice(r.i0, r.i1 + 1) : [];
  const secondary = netP && r.i1 >= 0 ? netP.slice(r.i0, r.i1 + 1) : null;
  const hasChart = primary.length >= 2 && primary.some(v => Math.abs(v) > 0.5);
  const cg = cagrOf(s);
  const gp = goalProgress(s);
  // s.transactions bevat ook inkomende overboekingen en, bij een crypto-post, de boekingen van alle coins.
  const txs = useMemo(() => (s.transactions || [])
    .slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')), [s.transactions]);
  const ci = cursor != null && cursor < chartDates.length ? cursor : null;
  const shown = ci != null ? primary[ci] : s.currentValueEur;
  const shownNet = ci != null && secondary ? secondary[ci] : (s.costBasis - s.realizedPnl);
  const isT212 = id === 'trading212';

  return (
    <div className="ps-panel">
      <div>
        {ci != null && <div className="ps-meta">Waarde op {fmtDateLong(chartDates[ci])}</div>}
        <div className="ps-pvalue"><Money value={shown} /></div>
        <div className="ps-pdelta">
          {ci == null
            ? <><Delta value={s.pnl} pct={s.invested > 0 ? s.pnlPct : null} size="md" />
                <span>winst sinds {isT212 && spots && spots.t212Start ? fmtDateShort(spots.t212Start) : 'start'} · gerealiseerd {privacy ? '€ •••••' : fmtMoney(s.realizedPnl)}</span></>
            : <><Delta value={shown - shownNet} size="md" /><span>winst op die datum</span></>}
        </div>
      </div>
      {!s.external && (
        <dl className="ps-pgains" data-testid="party-period-gains">
          {[['1D', 'Vandaag'], ['1W', 'Week'], ['1M', 'Maand'], ['1J', 'Jaar']].map(([k, lbl]) => {
            const g = partyPeriodGain(model, s, k);
            const ctx = (PS_GAIN_PERIODS.find(x => x.key === k) || {}).context;
            return (
              <div key={k} title={`Winst ${ctx}, exclusief stortingen en opnames`}>
                <dt>{lbl}</dt>
                <dd className={g ? psTone(g.gain) : 'ps-subtle'}>{!g ? '—' : privacy ? '€ •••••' : fmtMoney(g.gain, { sign: true })}
                  <small>{g && g.pct != null ? fmtPct(g.pct, { decimals: 1 }) : '—'}</small></dd>
              </div>
            );
          })}
        </dl>
      )}
      {p.cfd && <div className="ps-cfd-detail">{window.OvCfdLive && <OvCfdLive app={app} s={s} embedded />}<PsCfdAccount app={app} s={s} /></div>}
      {hasChart && (
        <div className="ps-chartbox">
          <Segmented size="sm" pill={app.isMobile} full={app.isMobile} ariaLabel="Periode" value={r.key} onChange={k => app.setPrefs({ period: k })}
            options={psPeriodOptions(dates).map(o => ({ ...o, testId: undefined }))} />
          <PerformanceChart dates={chartDates} primary={primary} secondary={secondary} height={140}
            cursor={ci} onCursor={i => setCursor(i)} privacy={privacy} liveDot="static" tableTwin={false}
            ariaLabel={`Waardeverloop ${p.name}`}
            valueText={i => `${fmtDateLong(chartDates[i])}: ${privacy ? 'bedrag verborgen' : fmtMoney(primary[i])}`} />
        </div>
      )}
      <PsPriceChart app={app} s={s} />
      {p.cfd && <PsCfdAlerts app={app} s={s} />}
      <dl className="ps-kgrid">
        <div><dt>Ingelegd</dt><dd><Money value={s.invested} /></dd></div>
        <div><dt>Aandeel</dt><dd className="num">{inc && model.totals.value > 0 ? fmtPct(s.currentValueEur / model.totals.value * 100, { decimals: 1, sign: false }) : '—'}</dd></div>
        <div><dt>Netto ingelegd</dt><dd><Money value={s.costBasis - s.realizedPnl} /></dd></div>
        <div title={cg.pct == null ? 'minder dan 1 jaar historie' : undefined}><dt>Rendement p.j.</dt>
          <dd className={cg.pct != null ? psTone(cg.pct) : 'ps-subtle'}>{cg.pct == null ? '—' : fmtPct(cg.pct, { decimals: 1 })}</dd></div>
        <div><dt>Kosten betaald</dt><dd><Money value={s.totalFees || 0} /></dd></div>
        {isT212
          ? <div><dt>Via cashback</dt><dd><Money value={s.totalCashback || 0} /></dd></div>
          : <div><dt>Dividend en rente</dt><dd><Money value={s.totalIncome || 0} /></dd></div>}
      </dl>
      {isT212 && s.stocks && s.stocks.live && <PsLivePies app={app} />}
      {isT212 && <PsPies app={app} linked={!!(s.stocks && s.stocks.live)} />}
      {isT212 && s.stocks && s.stocks.live && (() => {
        const n = (s.transactions || []).filter(t => !isT212ApiTx(t) && t.type !== 'waardering').length;
        return n > 0 ? <p className="ps-subtle" style={{ fontSize: 12.5, margin: 0 }}>{n} handmatige of nagebootste boeking{n === 1 ? '' : 'en'} tellen niet mee; de koppeling is leidend.</p> : null;
      })()}
      {p.unit === 'post' ? <PsPostCoins app={app} s={s} /> : p.cfd ? null : p.id === 'trading212-cfd' ? <PsCfdAccount app={app} s={s} /> : s.stocks ? <PsStockPositions app={app} s={s} /> : (s.transactions.length > 0 && <PsHoldingStrip s={s} spots={spots} />)}
      {gp && (
        <div className="ps-pgoal">
          <div className="ps-pgoal__row"><span>Doel</span><span className="num">{fmtPct(gp.pct, { decimals: 0, sign: false })} · {privacy && !['gram', 'ounce'].includes(p.unit) ? '€ •••••' : gp.label}</span></div>
          <div className="ps-pgoal__track"><div className="ps-pgoal__fill" style={{ width: Math.min(100, gp.pct) + '%', background: partyColorOf(p) }} /></div>
        </div>
      )}
      <PsUnderlying party={p} value={s.currentValueEur} privacy={privacy} />
      {s.external && s.external.history && s.external.history.length > 0 && <PsFinHistory points={s.external.history} privacy={privacy} />}
      <PsFinAanvul app={app} inline partyIds={[id, ...((s.leaves || []).map(l => (l.party ? l.party.id : l.id)))]} />
      <div>
        <div className="ps-sec-head">
          <h3 className="ps-sec-title">Transacties ({txs.length})</h3>
          <button type="button" className="ps-link" onClick={() => app.navigate('/transacties?partij=' + encodeURIComponent(id))}>
            Alle in Transacties <Icon name="arrow-right" size={12} />
          </button>
        </div>
        {txs.length === 0
          ? <EmptyState icon="receipt" title="Nog geen transacties" body="Voeg een inleg, koop of waardering toe."
              action={{ label: 'Transactie toevoegen', onClick: () => app.openTx({ party: id }) }} />
          : (window.TxList ? <TxList app={app} txs={txs} variant="party" showParty={p.unit === 'post'} limit={allTx ? undefined : 12} /> : null)}
        {txs.length > 12 && !allTx && (
          <Button variant="ghost" full onClick={() => setAllTx(true)} style={{ marginTop: 8 }}>Toon alle {txs.length} transacties</Button>
        )}
      </div>
    </div>
  );
}

// Dagwaarden van Vrij op rekening (laatste 14 registraties, nieuwste eerst) met verschil t.o.v. de vorige.
function PsFinHistory({ points, privacy }) {
  const rows = points.map((pt, i) => ({ date: pt[0], v: pt[1], d: i > 0 ? pt[1] - points[i - 1][1] : null })).reverse().slice(0, 14);
  return (
    <section data-testid="party-fin-history">
      <div className="ps-sec-head"><h3 className="ps-sec-title">Dagwaarden</h3><span className="ps-subtle" style={{ fontSize: 12 }}>{points.length} dagen vastgelegd</span></div>
      <ul className="ps-und__list">
        {rows.map(r => (
          <li key={r.date} className="ps-und__row" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
            <span className="ps-und__name">{fmtDateLong(r.date)}</span>
            <span className="ps-und__end">
              <span className={'ps-und__w num ' + (r.d == null || Math.abs(r.d) < 0.005 ? 'ps-subtle' : psTone(r.d))} style={{ fontWeight: 400 }}>
                {r.d == null || Math.abs(r.d) < 0.005 ? '—' : (privacy ? UI_MASK : (r.d > 0 ? '+' : '−') + fmtMoney(Math.abs(r.d)))}
              </span>
              <span className="ps-und__val num">{privacy ? UI_MASK : fmtMoney(r.v)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Look-through: verdeling van een fonds over zijn onderliggende fondsen (zie underlyingOf in data.jsx).
function PsUnderlying({ party, value, privacy }) {
  const u = underlyingOf(party);
  if (!u) return null;
  const funds = u.funds;
  const sum = funds.reduce((a, f) => a + (f.weight || 0), 0) || 100;
  const v = Number.isFinite(value) ? value : 0;
  const pct1 = n => fmtPct(n, { decimals: 1, sign: false });
  const reg = u.regions && Array.isArray(u.regions.items) && u.regions.items.length ? u.regions : null;
  const src = (s, asOf) => s ? (
    <>Bron: {s.publisher ? s.publisher + ', ' : ''}{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a> : s.label}{asOf ? `, peildatum ${fmtDateLong(asOf)}` : ''}</>
  ) : null;
  return (
    <section className="ps-und" aria-labelledby={'und-' + party.id} data-testid="party-underlying">
      <div className="ps-sec-head">
        <h3 className="ps-sec-title" id={'und-' + party.id}>Onderliggende fondsen</h3>
        {u.targetNote && <span className="ps-subtle" style={{ fontSize: 12 }}>{u.targetNote}</span>}
      </div>
      <div className="ps-und__bar" role="img"
        aria-label={funds.map(f => `${f.short || f.name} ${pct1(f.weight)}`).join(', ')}>
        {funds.map(f => <span key={f.name} style={{ width: (f.weight / sum * 100) + '%', background: f.color || 'var(--fg-subtle)' }} />)}
      </div>
      <ul className="ps-und__list">
        {funds.map(f => (
          <li key={f.name} className="ps-und__row">
            <span className="ps-und__dot" style={{ background: f.color || 'var(--fg-subtle)' }} aria-hidden="true" />
            <span className="ps-und__name">{f.short || f.name}</span>
            <span className="ps-und__end">
              <span className="ps-und__w num">
                {pct1(f.weight)}
                {f.target != null && <span className="ps-subtle" style={{ fontWeight: 400 }}> · doel {pct1(f.target)}</span>}
              </span>
              <span className="ps-und__val num">{privacy ? UI_MASK : fmtMoney(v * f.weight / sum)}</span>
            </span>
            {f.short && <span className="ps-und__full">{f.name}{f.isin ? ` · ${f.isin}` : ''}</span>}
          </li>
        ))}
      </ul>
      <div className="ps-und__src">{src(u.source, u.asOf)}</div>
      {reg && (
        <>
          <div className="ps-und__sub"><span>{reg.title || 'Regio’s'}</span>{reg.note && <span>{reg.note}</span>}</div>
          <div className="ps-und__reg">
            {reg.items.map(r => (
              <React.Fragment key={r.label}>
                <span>{r.label}</span>
                <span className="ps-pgoal__track"><span className="ps-pgoal__fill" style={{ display: 'block', width: Math.min(100, r.weight) + '%', background: 'var(--fg-subtle)' }} /></span>
                <span className="num">{pct1(r.weight)}</span>
              </React.Fragment>
            ))}
          </div>
          <div className="ps-und__src">{src(reg.source, reg.asOf)}</div>
        </>
      )}
    </section>
  );
}

function PsPanelTitle({ app, party }) {
  return (
    <span className="ps-ptitle">
      <Monogram party={party} size={32} />
      <span className="ps-ptitle__name">{party.name}</span>
    </span>
  );
}

function psPanelSubtitle(s, spots) {
  const p = s.party;
  const cls = ASSET_CLASS_BY_KEY[assetClassOf(p)];
  const parts = [p.category || cls.label];
  const sub = holdingSubline(s, spots);
  if (s.transactions.length || s.external) parts.push(sub.staleDays != null ? `waardering ${sub.staleDays} dagen oud` : sub.text);
  if (!psIncluded(p)) parts.push('niet in totaal');
  if (!psInChart(p)) parts.push('niet in grafiek');
  return parts.join(' · ');
}

function PsPanelMenu({ app, party }) {
  return (
    <Menu triggerLabel="Meer acties voor partij" items={[
      { label: 'Partij bewerken', icon: 'pencil', onClick: () => app.openPartyForm(party) },
      { label: 'Partij verwijderen', icon: 'trash-2', danger: true, onClick: () => app.openPartyForm(party, { startInDelete: true }) },
    ]} />
  );
}

function PartyPanel({ app, partyId, onClose, asPage = false }) {
  const s = app.model.byId[partyId];
  const close = onClose || (() => app.navigate('/posities'));
  const isPost = !!(s && s.party.unit === 'post');
  const footer = s ? (
    <div className="ps-pfoot">
      {isPost
        ? <Button variant="secondary" icon="arrow-left-right" onClick={() => app.openTx({ party: partyId, type: 'overboeking' })}>Overboeking</Button>
        : <Button variant="secondary" icon="diamond" onClick={() => app.openTx({ party: partyId, type: 'waardering' })}>Waarde bijwerken</Button>}
      <Button variant="primary" icon="plus" onClick={() => app.openTx({ party: partyId })}>Transactie</Button>
    </div>
  ) : null;
  const missing = (
    <EmptyState icon="circle-alert" title="Deze partij bestaat niet (meer)"
      action={{ label: 'Naar Posities', onClick: () => app.navigate('/posities') }} />
  );
  if (asPage) {
    return (
      <div className="ps-pagewrap" data-testid="party-panel">
        <div className="ps-pagehead">
          <IconButton icon="chevron-left" label="Terug naar Posities" onClick={close} />
          <div className="ps-pagehead__title">
            {s && <h1><PsPanelTitle app={app} party={s.party} /></h1>}
          </div>
          {s && <PsPanelMenu app={app} party={s.party} />}
        </div>
        {s ? (
          <>
            <div className="ps-meta">{psPanelSubtitle(s, app.spots)}</div>
            <PsPartyBody app={app} s={s} />
            {footer}
          </>
        ) : missing}
      </div>
    );
  }
  return (
    <Sheet open onClose={close} width={480} testId="party-panel"
      title={s ? <span className="ps-ptitle"><PsPanelTitle app={app} party={s.party} /><span style={{ marginLeft: 'auto' }}><PsPanelMenu app={app} party={s.party} /></span></span> : 'Partij'}
      subtitle={s ? psPanelSubtitle(s, app.spots) : null}
      footer={footer}>
      {s ? <PsPartyBody app={app} s={s} /> : missing}
    </Sheet>
  );
}

// ===================================================================
// PartyForm
// ===================================================================
const PS_SPOT_KEYS = [
  { value: 'btcSpotEur', label: 'Bitcoin (btcSpotEur)' },
  { value: 'ethSpotEur', label: 'Ethereum (ethSpotEur)' },
  { value: 'paxgSpotEur', label: 'Pax Gold (paxgSpotEur)' },
  { value: '', label: 'Geen' },
];

// Soort product → hoe de bezitting gewaardeerd wordt (waarderingsmethode), met een passende standaardcategorie.
const PS_PRODUCTS = [
  { key: 'share',  label: 'Aandeel, ETF of fonds', unit: 'part',   unitLabel: 'st.', category: 'Indexfondsen', how: 'Aantal × koers. Koop/verkoop in stuks; de koers werk je bij met een waardering.' },
  { key: 'crypto', label: 'Crypto',                unit: 'crypto', unitLabel: 'TOKEN', category: 'Crypto', how: 'Aantal tokens × live koers (Bitcoin, Ethereum of PAX Gold) of een handmatige koers.' },
  { key: 'gold',   label: 'Goud (gram)',           unit: 'gram',   unitLabel: 'g',   category: 'Edelmetaal', how: 'Gram × de live goudprijs.' },
  { key: 'silver', label: 'Zilver (ounce)',        unit: 'ounce',  unitLabel: 'oz',  category: 'Edelmetaal', how: 'Ounce × de live zilverprijs.' },
  { key: 'cash',   label: 'Spaargeld of cash',     unit: 'eur',    unitLabel: '€',   category: 'Liquide', how: 'Het saldo in euro: inleg min opnames plus rente.' },
  { key: 'value',  label: 'Vastgoed, participatie, crowdfunding of overig', unit: 'bundle', unitLabel: '€', category: 'Overig', how: 'Totale waarde. Je boekt inleg/opname en werkt de waarde zelf bij met een waardering.' },
];
function psProductOf(unit) { return (PS_PRODUCTS.find(o => o.unit === unit) || PS_PRODUCTS[PS_PRODUCTS.length - 1]).key; }
// Foto verkleinen tot een vierkant logo (data-URL), klein genoeg om mee te synchroniseren.
function psReadLogo(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) return reject(new Error('Kies een afbeelding'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const S = 128, c = document.createElement('canvas'); c.width = S; c.height = S;
      const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, S, S);
      const k = Math.max(S / img.width, S / img.height), w = img.width * k, h = img.height * k;
      g.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Afbeelding kon niet worden gelezen')); };
    img.src = url;
  });
}

function psBlankForm(p) {
  const unit = p ? (p.isMixed ? 'mixed' : (p.unit || 'bundle')) : 'bundle';
  const opt = PARTY_UNIT_OPTIONS.find(o => o.value === unit);
  return {
    name: p?.name || '',
    subtitle: p?.subtitle || '',
    category: p?.category || 'Overig',
    customCategory: '',
    unit,
    unitLabel: p?.unitLabel || opt?.unitLabel || '€',
    goal: p?.goal ? String(p.goal).replace('.', ',') : '',
    color: p?.color || COLOR_PRESETS[0],
    useOwnColor: p?.useOwnColor === true,
    spotKey: p?.spotKey || '',
    logo: p?.logo || '',
    ticker: p?.ticker || '',
    includeInTotal: (p?.includeInTotal ?? p?.includeInPortfolio) !== false,
    includeInTimeChart: (p?.includeInTimeChart ?? p?.includeInPortfolio) !== false,
  };
}

function PartyForm({ app, open, party = null, startInDelete = false, onClose }) {
  const [form, setForm] = useState(() => psBlankForm(party));
  const [confirmDel, setConfirmDel] = useState(!!startInDelete);
  const [alsoDelTx, setAlsoDelTx] = useState(false);
  const [touched, setTouched] = useState(false);
  const nameRef = useRef(null);
  useEffect(() => {
    if (open) { setForm(psBlankForm(party)); setConfirmDel(!!startInDelete && !!party); setAlsoDelTx(false); setTouched(false); }
  }, [open, party, startInDelete]);
  const parties = (app && app.model && app.model.parties) || [];
  const categoryOptions = useMemo(() => {
    const seen = new Set();
    return [...CATEGORY_OPTIONS, ...parties.map(p => p.category), party?.category]
      .filter(Boolean).filter(c => (seen.has(c) ? false : (seen.add(c), true)));
  }, [parties, party]);
  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const selectedCategory = categoryOptions.includes(form.category) ? form.category : CUSTOM_CATEGORY_VALUE;
  const finalCategory = (selectedCategory === CUSTOM_CATEGORY_VALUE ? (form.customCategory || '') : form.category).trim();
  const cls = ASSET_CLASS_BY_KEY[assetClassOf({ category: finalCategory })];
  const nameOk = form.name.trim().length > 0;
  const valid = nameOk && finalCategory.length > 0;
  const isPost = !!(party && party.unit === 'post');
  const ownIds = party ? new Set([party.id, ...((app.model && app.model.leavesByPost && app.model.leavesByPost[party.id]) || []).map(l => l.id)]) : new Set();
  const txCount = party ? app.state.transactions.filter(t => ownIds.has(t.party)).length : 0;

  const setUnit = value => {
    const opt = PARTY_UNIT_OPTIONS.find(o => o.value === value);
    setForm(f => ({ ...f, unit: value, unitLabel: (value === 'crypto' && f.unit === 'crypto') ? f.unitLabel : (opt?.unitLabel || f.unitLabel || '€'), spotKey: value === 'crypto' ? f.spotKey : '' }));
  };
  const submit = () => {
    setTouched(true);
    if (!valid) { if (nameRef.current) nameRef.current.focus(); return; }
    const goal = parseNlNumber(form.goal);
    const p = {
      ...(party || {}),
      id: party?.id || 'custom_' + Date.now().toString(36),
      name: form.name.trim(),
      subtitle: form.subtitle.trim(),
      category: finalCategory,
      unit: form.unit,
      unitLabel: form.unitLabel || '€',
      goal: goal > 0 ? goal : 0,
      color: form.color,
      useOwnColor: !!form.useOwnColor,
      includeInTotal: form.includeInTotal !== false,
      includeInTimeChart: form.includeInTimeChart !== false,
      isMixed: form.unit === 'mixed',
    };
    delete p.includeInPortfolio;
    if (form.unit === 'crypto' && form.spotKey) p.spotKey = form.spotKey; else delete p.spotKey;
    if (form.logo) p.logo = form.logo; else delete p.logo;
    if (form.unit === 'part' && form.ticker.trim()) p.ticker = form.ticker.trim().toUpperCase(); else delete p.ticker;
    if (isPost) { p.unit = 'post'; p.unitLabel = party.unitLabel || '€'; p.isMixed = false; }
    app.saveParty(p);
    onClose && onClose();
  };
  const doDelete = () => {
    app.deleteParty(party.id, { deleteTransactions: txCount > 0 && alsoDelTx });
    onClose && onClose();
  };

  const footer = confirmDel ? null : (
    <div className="ps-formfoot">
      <Button variant="ghost" onClick={onClose}>Annuleren</Button>
      <Button variant="primary" disabled={!valid} onClick={submit}>{party ? 'Opslaan' : 'Toevoegen'}</Button>
    </div>
  );

  return (
    <Sheet open onClose={onClose} testId="party-form" width={480} initialFocusRef={confirmDel ? undefined : nameRef}
      title={party ? 'Bezitting bewerken' : 'Bezitting toevoegen'}
      subtitle={party ? party.name : 'Naam, foto, categorie en soort product.'}
      footer={footer}>
      {confirmDel && party ? (
        <div className="ps-del" role="group" aria-labelledby="ps-del-title">
          <div className="ps-del__title" id="ps-del-title">Partij "{party.name}" definitief verwijderen?</div>
          {txCount > 0
            ? <div>Deze partij heeft <b>{txCount}</b> transactie(s). Standaard blijven die bestaan en verschijnen ze onder 'Transacties zonder partij'.</div>
            : <div>Er zijn geen transacties aan deze partij gekoppeld.</div>}
          {txCount > 0 && (
            <label className="ps-del__check">
              <input type="checkbox" checked={alsoDelTx} onChange={e => setAlsoDelTx(e.target.checked)} />
              <span>Verwijder óók de {txCount} transactie(s) (gesynct naar Supabase).</span>
            </label>
          )}
          <div className="ps-del__actions">
            <Button variant="secondary" onClick={() => (startInDelete ? onClose() : setConfirmDel(false))}>Terug</Button>
            <Button variant="danger" icon="trash-2" onClick={doDelete} data-testid="party-delete-confirm">Definitief verwijderen</Button>
          </div>
        </div>
      ) : (
        <form className="ps-form" onSubmit={e => { e.preventDefault(); submit(); }}>
          <Field label="Naam" htmlFor="ps-f-name" error={touched && !nameOk ? 'Vul een naam in' : undefined}>
            <input id="ps-f-name" ref={nameRef} className="input" value={form.name} onChange={e => set('name', e.target.value)}
              aria-describedby={touched && !nameOk ? 'ps-f-name-err' : undefined} aria-invalid={(touched && !nameOk) || undefined}
              onBlur={() => setTouched(true)} autoComplete="off" />
          </Field>
          <Field label="Foto of logo (optioneel)">
            <div className="ps-logo-pick">
              <Monogram party={{ ...(party || {}), name: form.name || '?', category: finalCategory, logo: form.logo || undefined, unit: form.unit }} size={48} />
              <label className="btn btn--secondary btn--sm ps-logo-pick__btn">
                {form.logo ? 'Andere foto' : 'Foto kiezen'}
                <input type="file" accept="image/*" hidden data-testid="party-logo-input"
                  onChange={e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) psReadLogo(f).then(u => set('logo', u)).catch(err => app.toast && app.toast(err.message)); }} />
              </label>
              {form.logo && <button type="button" className="ps-link" onClick={() => set('logo', '')}>Verwijderen</button>}
            </div>
          </Field>
          <Field label="Omschrijving (optioneel)" htmlFor="ps-f-sub">
            <Input id="ps-f-sub" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} autoComplete="off" />
          </Field>
          <Field label="Categorie" htmlFor="ps-f-cat">
            <Select id="ps-f-cat" value={selectedCategory}
              onChange={e => { const v = e.target.value; setForm(f => ({ ...f, category: v === CUSTOM_CATEGORY_VALUE ? '' : v, customCategory: v === CUSTOM_CATEGORY_VALUE ? f.customCategory : '' })); }}>
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              <option value={CUSTOM_CATEGORY_VALUE}>Nieuwe allocatie…</option>
            </Select>
            <div className="ps-classline">Wordt getoond als: <Swatch color={cls.color} size={9} /> {cls.label}</div>
          </Field>
          {selectedCategory === CUSTOM_CATEGORY_VALUE && (
            <Field label="Nieuwe allocatie" htmlFor="ps-f-newcat" hint="Deze naam blijft daarna beschikbaar als allocatie.">
              <Input id="ps-f-newcat" value={form.customCategory} onChange={e => set('customCategory', e.target.value)} aria-describedby="ps-f-newcat-hint" autoComplete="off" />
            </Field>
          )}
          {isPost ? (
            <p className="ps-classline" style={{ margin: 0 }}>Crypto-post: waarde = som van de coins (BTC, ETH) × live koers.{party.selfCustody ? ' Publieke adressen stel je in bij Instellingen → Wallet.' : ''}</p>
          ) : (<>
          <Field label="Soort product" htmlFor="ps-f-prod" hint={(PS_PRODUCTS.find(o => o.key === psProductOf(form.unit)) || {}).how}>
            <Select id="ps-f-prod" value={psProductOf(form.unit)} data-testid="party-product"
              onChange={e => { const o = PS_PRODUCTS.find(x => x.key === e.target.value); if (!o) return; setUnit(o.unit); if (!party) setForm(f => ({ ...f, category: o.category, customCategory: '' })); }}>
              {PS_PRODUCTS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </Select>
          </Field>
          {form.unit === 'part' && (
            <Field label="Ticker (optioneel)" htmlFor="ps-f-ticker" hint="Yahoo Finance-symbool, bijv. VWCE.DE of AAPL. Toont de koersgrafiek van het product.">
              <Input id="ps-f-ticker" value={form.ticker} onChange={e => set('ticker', e.target.value)} autoComplete="off" autoCapitalize="characters" />
            </Field>
          )}
          <Field label="Waarderingsmethode" htmlFor="ps-f-unit">
            <Select id="ps-f-unit" value={form.unit} onChange={e => setUnit(e.target.value)}>
              {PARTY_UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Field>
          {form.unit === 'crypto' && (
            <Field label="Spot-prijs sleutel" htmlFor="ps-f-spot">
              <Select id="ps-f-spot" value={form.spotKey} onChange={e => set('spotKey', e.target.value)}>
                {PS_SPOT_KEYS.map(o => <option key={o.value || 'none'} value={o.value}>{o.label}</option>)}
              </Select>
            </Field>
          )}
          </>)}
          <div className="ps-form__row">
            {!isPost && (
            <Field label="Eenheid label" htmlFor="ps-f-ul">
              <Input id="ps-f-ul" value={form.unitLabel} onChange={e => set('unitLabel', e.target.value)} autoComplete="off" />
            </Field>
            )}
            <Field label="Doel (€ of eenheden)" htmlFor="ps-f-goal" hint="€ voor waarde-partijen, gram/ounce voor metaal">
              <Input id="ps-f-goal" inputMode="decimal" value={form.goal} onChange={e => set('goal', e.target.value)} aria-describedby="ps-f-goal-hint" placeholder="0" autoComplete="off" />
            </Field>
          </div>
          <div>
            <Switch checked={form.useOwnColor} onChange={v => set('useOwnColor', v)} label="Eigen kleur gebruiken"
              description={form.useOwnColor ? null : <span className="ps-classline" style={{ marginTop: 0 }}>Volgt de categorie <Swatch color={cls.color} size={9} /> {cls.label}</span>} />
            {form.useOwnColor && (
              <div className="ps-colors" role="radiogroup" aria-label="Kleur">
                {COLOR_PRESETS.map((c, i) => (
                  <button key={c} type="button" role="radio" aria-checked={form.color === c} aria-label={`Kleur ${i + 1}`}
                    className="ps-color" style={{ background: c }} onClick={() => set('color', c)} />
                ))}
              </div>
            )}
          </div>
          <Switch checked={form.includeInTotal} onChange={v => set('includeInTotal', v)} label="Meetellen in totale waarde" />
          <Switch checked={form.includeInTimeChart} onChange={v => set('includeInTimeChart', v)} label="Meetellen in waarde-over-tijd grafiek" />
          {party && (
            <div>
              <Button variant="danger" icon="trash-2" onClick={() => setConfirmDel(true)}>Partij verwijderen</Button>
            </div>
          )}
          <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </form>
      )}
    </Sheet>
  );
}

// ===================================================================
// PositiesScreen
// ===================================================================
function PsStackCard({ app }) {
  const { model, prefs, state } = app;
  const privacy = !!prefs.privacy;
  const sk = psGainKey(model, prefs);
  const r = psRange(model.series.dates, ['1D', '1W'].includes(sk) ? '1M' : sk);
  const ids = model.included.map(s => s.party.id).filter(id => model.chartIds.includes(id));
  const layers = useMemo(() => {
    if (r.i1 < 0) return [];
    const out = [];
    for (const c of ASSET_CLASSES) {
      const mine = ids.filter(id => assetClassOf(model.byId[id].party) === c.key);
      if (!mine.length) continue;
      const vals = [];
      for (let i = r.i0; i <= r.i1; i++) vals.push(mine.reduce((a, id) => a + Math.max(0, model.series.byParty[id][i] || 0), 0));
      if (vals.some(v => v > 0.5)) out.push({ key: c.key, label: c.label, color: c.color, values: vals });
    }
    return out;
  }, [model, r.i0, r.i1, ids.join(',')]);
  const classKeys = new Set(ASSET_CLASSES.map(c => c.key));
  const hidden = (Array.isArray(state.hiddenParties) ? state.hiddenParties : []).filter(k => classKeys.has(k));
  const toggle = key => app.setHiddenGroups(hidden.includes(key) ? hidden.filter(k => k !== key) : [...hidden, key]);
  const dates = r.i1 >= 0 ? model.series.dates.slice(r.i0, r.i1 + 1) : [];
  return (
    <Card className="ps-stack-card" title="Verdeling door de tijd" meta={(PERIODS.find(p => p.key === r.key) || {}).context?.replace('{datum}', fmtDateLong(model.series.dates[0]))}
      actions={<Segmented size="sm" ariaLabel="Weergave" value={prefs.stackMode || 'pct'} onChange={v => app.setPrefs({ stackMode: v })}
        options={[{ value: 'pct', label: '%' }, { value: 'eur', label: '€' }]} />}>
      <div className="ps-controls" style={{ marginBottom: 10 }}>
        {layers.map(l => (
          <Chip key={l.key} swatch={l.color} active={!hidden.includes(l.key)} onClick={() => toggle(l.key)}>{l.label}</Chip>
        ))}
      </div>
      {layers.length && dates.length >= 2
        ? <StackedAreaChart dates={dates} layers={layers} mode={prefs.stackMode || 'pct'} hiddenKeys={hidden} height={220} privacy={privacy} />
        : <EmptyState icon="layers" title="Nog te weinig historie in deze periode" />}
    </Card>
  );
}

function PsCostsCard({ app }) {
  const t = app.model.totals;
  const feePct = t.invested > 0 ? t.fees / t.invested * 100 : null;
  return (
    <Card className="ps-costs-card" title="Kosten en inkomsten">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <KpiCell label="Transactiekosten" value={<Money value={-(t.fees || 0)} />}
          sub={`${t.feeTxCount} transacties met kosten${feePct != null ? ' · ' + fmtPct(feePct, { decimals: 2, sign: false }) + ' van ingelegd' : ''}`} />
        <KpiCell label="Dividend en rente" value={<Money value={t.income || 0} />} sub="sinds start" />
        <KpiCell label="Gerealiseerd resultaat" value={<span className={psTone(t.realized)}><Money value={t.realized || 0} sign /></span>} sub="uit verkopen en opnames" />
      </div>
    </Card>
  );
}

function PsOptionSheet({ open, onClose, title, options, value, onPick, extra }) {
  return (
    <Sheet open={open} onClose={onClose} title={title} size="medium">
      <div role="radiogroup" aria-label={title}>
        {options.map(o => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value} className="ps-opt"
            onClick={() => onPick(o.value)}>
            {o.label}
            {o.value === value && <Icon name="check" size={18} className="ps-opt__check" />}
          </button>
        ))}
      </div>
      {extra}
    </Sheet>
  );
}

function PsMobile({ app }) {
  const { model, prefs, route } = app;
  const [sheet, setSheet] = useState(null); // 'sort' | 'secondary'
  const partyId = route && route.params && route.params.partyId;
  if (partyId) return <PartyPanel app={app} partyId={partyId} asPage onClose={() => app.navigate('/posities')} />;
  const t = model.totals;
  const sort = prefs.positionsSort || { key: 'value', dir: 'desc' };
  const secLabel = (PS_SECONDARY_OPTIONS.find(o => o.value === (prefs.positionsSecondary || 'pnl')) || PS_SECONDARY_OPTIONS[0]).label;
  const segments = model.classes.map(c => ({ key: c.key, label: c.label, color: c.color, value: c.value }));
  const gk = psGainKey(model, prefs);
  const tg = gk === 'ALL' ? null : sumPeriodGains(model.included.map(s => partyPeriodGain(model, s, gk)));
  return (
    <div className="ps-page">
      <div className="ps-mhead">
        <div className="ps-head__titles">
          <h1 className="sr-only">Posities</h1>
          <div className="ps-meta">{t.openCount} open · {t.closedCount} gesloten · <Money value={t.value} /></div>
        </div>
        <IconButton icon="plus" label="Partij toevoegen" onClick={() => app.openPartyForm(null)} data-testid="add-party" />
        <Button variant="secondary" size="sm" icon="filter" onClick={() => setSheet('sort')}>Sorteer</Button>
      </div>
      <div className="ps-mcontrols">
        <Segmented pill ariaLabel="Groepering" value={prefs.positionsGrouping === 'none' ? 'none' : 'class'}
          onChange={v => app.setPrefs({ positionsGrouping: v })}
          options={[{ value: 'class', label: 'Categorieën' }, { value: 'none', label: 'Partijen' }]} />
        <Chip onClick={() => setSheet('secondary')}>Toon: {secLabel} ▾</Chip>
      </div>
      <Segmented size="sm" pill full ariaLabel="Periode voor winst" value={gk} onChange={k => app.setPrefs({ positionsPeriod: k })}
        options={psPeriodOptions(model.series.dates, PS_GAIN_PERIODS).map(o => (o.value === 'ALL' ? { ...o, disabled: false } : o))} />
      <Card>
        <div className="ps-mtotal">
          <div className="ps-mtotal__row">
            <span className="ps-mtotal__val"><Money value={t.value} /></span>
            {tg ? <Delta value={tg.gain} pct={tg.pct} size="sm" /> : <Delta value={t.pnl} pct={t.pnlPct} size="sm" />}
          </div>
          <div className="ps-mtotal__meta">{tg ? psGainLabel(gk) + ' · ' : ''}Totaal · {model.included.filter(s => !isClosedSummary(s) && s.transactions.length).length} partijen in totaal</div>
          <AllocationBar segments={segments} height={14} privacy={!!prefs.privacy} ariaLabel="Verdeling per categorie" />
        </div>
      </Card>
      <PsFinAanvul app={app} />
      <Card>
        <HoldingsList app={app} variant="page" />
      </Card>
      <PsOptionSheet open={sheet === 'sort'} onClose={() => setSheet(null)} title="Sorteer op" options={PS_SORT_OPTIONS}
        value={sort.key}
        onPick={k => app.setPrefs({ positionsSort: { key: k, dir: sort.key === k ? sort.dir : (k === 'name' ? 'asc' : 'desc') } })}
        extra={
          <div style={{ marginTop: 12 }}>
            <Segmented full ariaLabel="Volgorde" value={sort.dir} onChange={d => app.setPrefs({ positionsSort: { ...sort, dir: d } })}
              options={[{ value: 'desc', label: 'Aflopend ↓' }, { value: 'asc', label: 'Oplopend ↑' }]} />
          </div>
        } />
      <PsOptionSheet open={sheet === 'secondary'} onClose={() => setSheet(null)} title="Tweede regel" options={PS_SECONDARY_OPTIONS}
        value={prefs.positionsSecondary || 'pnl'} onPick={v => { app.setPrefs({ positionsSecondary: v }); setSheet(null); }} />
    </div>
  );
}

function PsDesktop({ app }) {
  const { model, prefs, route } = app;
  usePsPeriodKeys(app, true);
  const t = model.totals;
  const gk = psGainKey(model, prefs);
  const partyId = route && route.params && route.params.partyId;
  return (
    <div className="ps-page">
      <div className="ps-head">
        <div className="ps-head__titles">
          <h1 className="ps-title">Posities</h1>
          <div className="ps-meta">
            {model.parties.length} partijen · {t.openCount} open · waarde <b><Money value={t.value} /></b> · winst per positie <b className={psTone(t.pnl)}><Money value={t.pnl} sign /></b>
          </div>
        </div>
        <div className="ps-head__actions">
          <Segmented size="sm" ariaLabel="Groepering" value={prefs.positionsGrouping === 'none' ? 'none' : 'class'}
            onChange={v => app.setPrefs({ positionsGrouping: v })}
            options={[{ value: 'class', label: 'Categorie' }, { value: 'none', label: 'Geen' }]} />
          <Chip active={!!prefs.showClosed} onClick={() => app.setPrefs({ showClosed: !prefs.showClosed })}>Gesloten tonen</Chip>
          <Button variant="primary" icon="plus" onClick={() => app.openPartyForm(null)} data-testid="add-party">Partij</Button>
        </div>
      </div>
      <div className="ps-controls">
        <Segmented ariaLabel="Periode voor winst en trend" value={gk} onChange={k => app.setPrefs({ positionsPeriod: k })}
          options={psPeriodOptions(model.series.dates, PS_GAIN_PERIODS).map(o => (o.value === 'ALL' ? { ...o, disabled: false } : o))} />
        <span className="ps-foot-note">bepaalt winst- en trendkolom · Alles = totale winst</span>
      </div>
      <PsFinAanvul app={app} />
      <Card padding={0}>
        <HoldingsTable app={app} variant="full" />
      </Card>
      <div className="ps-row2">
        <PsStackCard app={app} />
        <PsCostsCard app={app} />
      </div>
      {partyId && !app.overlayOpen && <PartyPanel app={app} partyId={partyId} onClose={() => app.navigate('/posities')} />}
    </div>
  );
}

function PositiesScreen({ app }) {
  return app.isMobile ? <PsMobile app={app} /> : <PsDesktop app={app} />;
}

Object.assign(window, { PositiesScreen, HoldingsTable, HoldingsList, HoldingsPeriodPicker, PartyPanel, PartyForm });
