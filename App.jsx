import { useMemo, useState, useRef, useEffect, useCallback } from 'react';

/* ============================================================================
 * Victaulic VDC — PRV Station Sizing & Budget Quote
 *
 * Self-contained: no imports beyond React, no external assets, no storage.
 * Drops into a Vite project as src/App.jsx, or renders standalone.
 *
 * Selection logic derives from sheet "PRV Quote" rows 11-34 of
 *   PRV Sizing - Schedule - Quote Sheet - PL2025-1 - John.xlsm
 * Pricing comes exclusively from
 *   PL2026_with_Quick_Codes_.xlsx, sheet PL2026, column M "Price".
 * No price from the PL2025-1 workbook is used anywhere in this file.
 * ========================================================================== */

/* Victaulic primary logo, unmodified artwork (black wordmark, orange underline,
   registered mark intact), downscaled to 520px wide for embedding. */
const LOGO = 'data:image/png;base64,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';

const PRICE_LIST = 'PL2026';

/* --- Hunter curve, sheet "PRV Quote" AB4:AC5003 -----------------------------
 * The 5000-row table is exactly piecewise linear across these 31 anchors;
 * interpolating between them reproduces every original row to 1e-13.
 * [fixture units, GPM]                                                     */
const HUNTER = [
  [1, 3], [2, 5], [4, 8], [5, 9.4], [6, 10.7], [7, 11.8], [8, 12.8], [10, 14.6],
  [11, 15.4], [12, 16], [16, 18], [20, 19.6], [25, 21.5], [30, 23.3], [35, 24.9],
  [50, 29.1], [60, 32], [90, 41], [100, 43.5], [160, 57], [400, 105], [500, 124],
  [750, 170], [1000, 208], [1250, 239], [1500, 269], [2000, 325], [2500, 380],
  [3000, 433], [4000, 525], [5000, 593],
];
const MAX_FU = 5000;
const MAX_GPM = 593;

/* --- Pressure ratio to reduction stages -------------------------------------
 * SUPERSEDES the workbook table at AJ13:AK37, which switched to two stages at
 * a ratio of 2.98. Single stage now extends to 3.15, with 3.00-3.15 called out
 * as a review band to settle with the contractor before the quote goes out.
 *
 * Consequence to be aware of: a ratio between 2.98 and 3.15 selected a 386B-SB
 * two-stage station in the workbook and now selects a 386A-SB single-stage one,
 * a different and materially cheaper part. Those lines carry a REVIEW flag.
 */
const STAGE_RULE = {
  singleMax: 3.15,   // ratio <= 3.15  -> 1 stage
  reviewFrom: 3.0,   // 3.00 <= ratio <= 3.15 -> flag for contractor discussion
  twoMax: 7.5,       // ratio < 7.5 -> 2 stages, at or above -> 3 stages
};

/* Workbook original, retained for traceability. Not used for selection.
   [[0,1],[0.5,1],[1,1],[1.5,1],[2,1],[2.5,1],[2.98,2],[2.99,2],[3,2],[3.5,2],
    [4,2],[4.5,2],[5,2],[5.5,2],[6,2],[6.5,2],[7,2],[7.5,3],[8,3],[8.5,3],
    [9,3],[9.5,3],[10,3],[10.5,3],[11,3]]                                    */

/* --- GPM to nominal size ---------------------------------------------------
 * SHEET: breakpoints as they appear in AG13:AH787.
 * PUBLISHED: the GPM ranges printed against each station in the DB sheet.
 * These disagree by one GPM at every boundary; both are offered.            */
const SIZE_SHEET = [
  [15, '1.5"'], [45, '2"'], [79, '2.5"'], [123, '3"'], [177, '4"'], [314, '6"'],
];
const SIZE_PUBLISHED = [
  [34, '1.5"'], [44, '2"'], [78, '2.5"'], [122, '3"'], [176, '4"'], [313, '6"'],
];

/* --- size + "386" + stages  ->  quick code, sheet "PRV Quote" AL13:AM32 ---- */
const QUICKCODE_MAP = {
  '1.5"3861': '112386asb', '2"3861': '2386asb', '2.5"3861': '212386asb',
  '3"3861': '3386asb', '4"3861': '4386asb', '6"3861': '6386asb',
  '1.5"3862': '112386bsb', '2"3862': '2386bsb', '2.5"3862': '212386bsb',
  '3"3862': '3386bsb', '4"3862': '4386bsb', '6"3862': '6386bsb',
};

/* --- Catalogue. Every listPrice is from PL2026 and nowhere else. -----------
 * kind 'station' = 386-SB skid, selected by pressure and flow or by quick code.
 * kind 'valve'   = 935-H direct-acting PRV, quick code entry only: these are
 *                  specified by the engineer, not sized off the Hunter curve.
 */
const S = (quickCode, partNumber, size, stages, listPrice, gpmRange, row) => ({
  kind: 'station',
  quickCode, partNumber, size, stages, listPrice, gpmRange,
  description: `${size.replace('1.5"', '1 1/2').replace('2.5"', '2 1/2').replace('"', '')} 386${stages === 1 ? 'A' : 'B'}-SB SINGLE BRANCH ${stages} STAGE PRV STATION`,
  shortDescription: `386${stages === 1 ? 'A' : 'B'}-SB SINGLE BRANCH PRV STATION`,
  nonReturnable: true,
  source: `${PRICE_LIST} row ${row} · Quick Code ${quickCode} · Part ${partNumber}`,
});

const V = (quickCode, partNumber, size, listPrice, row) => ({
  kind: 'valve',
  quickCode, partNumber, size, stages: 1, listPrice, gpmRange: '',
  description: `${size} 935-H DIRECT ACTING PRESSURE REDUCING VALVE (THD)`,
  shortDescription: '935-H DIRECT ACTING PRV (THD)',
  nonReturnable: true,
  source: `${PRICE_LIST} row ${row} · Quick Code ${quickCode} · Part ${partNumber}`,
});

const STATIONS = {
  '112386asb': S('112386asb', 'K014386AES', '1.5"', 1, 29527.5, '34GPM - 43GPM', 19733),
  '2386asb':   S('2386asb',   'K020386AES', '2"',   1, 30250.5, '44GPM - 77GPM', 19737),
  '212386asb': S('212386asb', 'K024386AES', '2.5"', 1, 35881.0, '78GPM - 121GPM', 19738),
  '3386asb':   S('3386asb',   'K030386AES', '3"',   1, 40790.0, '122GPM - 175GPM', 19739),
  '4386asb':   S('4386asb',   'K040386AES', '4"',   1, 49669.0, '176GPM - 312GPM', 19740),
  '6386asb':   S('6386asb',   'K060386AES', '6"',   1, 73348.0, '313GPM - 705GPM', 19741),
  '112386bsb': S('112386bsb', 'K014386BES', '1.5"', 2, 39997.0, '34GPM - 43GPM', 19734),
  '2386bsb':   S('2386bsb',   'K020386BES', '2"',   2, 43893.0, '44GPM - 77GPM', 19743),
  '212386bsb': S('212386bsb', 'K024386BES', '2.5"', 2, 50823.5, '78GPM - 121GPM', 19742),
  '3386bsb':   S('3386bsb',   'K030386BES', '3"',   2, 52412.5, '122GPM - 175GPM', 19744),
  '4386bsb':   S('4386bsb',   'K040386BES', '4"',   2, 64974.0, '176GPM - 312GPM', 19745),
  '6386bsb':   S('6386bsb',   'K060386BES', '6"',   2, 103666.5, '313GPM - 705GPM', 19746),

  /* 935-H direct-acting PRVs. Quick codes as published in PL2026. */
  '12935h':  V('12935h',  'S0049353FF', '1/2"',   635.0, 18970),
  '34935h':  V('34935h',  'S0069353FF', '3/4"',   679.0, 18971),
  '1935h':   V('1935h',   'S0109353FF', '1"',     867.5, 18972),
  '114935h': V('114935h', 'S0129353FF', '1 1/4"', 1774.0, 18973),
  '112935h': V('112935h', 'S0149353FF', '1 1/2"', 2277.5, 18974),
  '2935h':   V('2935h',   'S0209353FF', '2"',     2631.0, 18975),
};

export const VALVE_CODES = Object.values(STATIONS).filter((x) => x.kind === 'valve').map((x) => x.quickCode);

const QUOTE_NOTES = [
  'All components shall be certified to NSF/ANSI/CAN 61 for domestic cold and hot water service and NSF/ANSI 372.',
  'All sizing based on information available at time of quotation. Information should be reviewed at time of PO to verify it matches current design requirements. GPM was calculated assuming "Flush Tanks".',
  'Standard station sizing and configuration based on pressure and flow data provided. Resulting station configuration may differ from those specified in drawing details.',
  'All stations will be factory preset to a 35 psi outlet pressure.',
  'Booster pump outlet psi is an estimate based on overall building height. Please verify approx outlet psi.',
  '0.433 psi pressure drop per 1 ft of elevation.',
  'TBC = To be Confirmed, details were not on the MECH Drawing.',
  'Assumptions made: maximum outlet pressure per floor is 70 psi, minimum outlet pressure per floor is 30 psi; 175 psi pressure at P1 for DCW and 175 psi for DHW. Floor elevations are assumed values.',
];
const SIZING_BASIS = [
  "Hunter Curve based on flush tanks used to convert FSU's to GPM.",
  'Valve sizing is based on 8 ft/sec as per BC plumbing code standard.',
];
const TERMS = [
  'Terms and Conditions are published in the Price List.',
  "Items with shaded prices in Victaulic's Price List are non-returnable.",
  'Please tag orders with project and/or contractor.',
];

/* ==========================================================================
 * Engine
 * ======================================================================== */

/* Excel VLOOKUP(..., TRUE): largest key <= needle, #N/A below the first key. */
function approx(needle, table) {
  if (typeof needle !== 'number' || Number.isNaN(needle)) return null;
  if (needle < table[0][0]) return null;
  let hit = null;
  for (const [k, v] of table) {
    if (k <= needle) hit = v;
    else break;
  }
  return hit;
}

const round6 = (n) => Math.round(n * 1e6) / 1e6;

function fuToGpm(fu) {
  if (!Number.isFinite(fu) || fu < 1) return null;
  const x = Math.min(Math.floor(fu), MAX_FU);
  if (x <= HUNTER[0][0]) return HUNTER[0][1];
  for (let i = 0; i < HUNTER.length - 1; i++) {
    const [x0, y0] = HUNTER[i];
    const [x1, y1] = HUNTER[i + 1];
    if (x <= x1) return round6(y0 + ((y1 - y0) * (x - x0)) / (x1 - x0));
  }
  return MAX_GPM;
}

export function ratioToStages(ratio) {
  if (!Number.isFinite(ratio) || ratio < 0) return null;
  if (ratio <= STAGE_RULE.singleMax) return 1;
  if (ratio < STAGE_RULE.twoMax) return 2;
  return 3;
}

/* True where a single stage is selected but the ratio is close enough to the
   two-stage threshold to be worth agreeing with the contractor first. */
export function inReviewBand(ratio) {
  return Number.isFinite(ratio) && ratio >= STAGE_RULE.reviewFrom && ratio <= STAGE_RULE.singleMax;
}

/*
 * Quick-code override parser. Accepts, case- and punctuation-insensitively:
 *   quick code     3386bsb        212386asb
 *   part number    K030386BES
 *   shorthand      3b   2.5a   212b   1.5a   112b
 */
const SIZE_ALIASES = {
  '15': '1.5"', '112': '1.5"', '2': '2"', '25': '2.5"', '212': '2.5"',
  '3': '3"', '4': '4"', '6': '6"',
};

export function resolveCode(raw) {
  if (!raw) return null;
  const t = String(raw).toLowerCase().replace(/[\s"'’.\-_/]/g, '');

  if (STATIONS[t]) return t;
  for (const st of Object.values(STATIONS)) {
    if (st.partNumber.toLowerCase() === t) return st.quickCode;
  }
  for (const st of Object.values(STATIONS)) {
    if (st.quickCode.replace(/sb$/, '') === t) return st.quickCode;
  }
  /* size + a|b shorthand for stations, e.g. 3b. Excluded when the digits are
     really part of a 935 code, which the exact matches above already handled. */
  const m = t.match(/^(\d+)(a|b)$/);
  if (m && !/935/.test(m[1])) {
    const size = SIZE_ALIASES[m[1]];
    if (size) return QUICKCODE_MAP[`${size}386${m[2] === 'a' ? 1 : 2}`] || null;
  }
  /* 935-H shorthand: bare size + 935, with or without the trailing h */
  const v = t.match(/^(\d+)935h?$/);
  if (v && STATIONS[`${v[1]}935h`]) return `${v[1]}935h`;
  return null;
}

export function evaluateRow(row, config) {
  const { margin, sizingMode } = config;
  /* Each line inherits the workbook multiplier unless it carries its own. */
  const lineMult = numOf(row.mult);
  const multiplier = lineMult === null ? config.multiplier : lineMult;
  const multOverridden = lineMult !== null && lineMult !== config.multiplier;
  const inletPsi = numOf(row.inletPsi);
  const outletPsi = numOf(row.outletPsi);
  const fu = numOf(row.fu);
  const qty = numOf(row.qty) ?? 1;

  const r = {
    mode: 'calculated', ratio: null, stages: null, gpm: null,
    size: null, sizeAlt: null, boundaryConflict: false, stageReview: false,
    station: null, quickCode: null, listPrice: null,
    distPrice: null, contPrice: null,
    extListPrice: null, extDistPrice: null, extContPrice: null,
    qty, status: 'incomplete', messages: [], priceSource: null, calcSize: null,
    multiplier, multOverridden, kind: null,
  };

  /* ratio, stages and GPM always evaluate, so a manual line can be cross-checked */
  const hasPsi = Number.isFinite(inletPsi) && Number.isFinite(outletPsi) && outletPsi > 0;
  if (hasPsi) {
    r.ratio = inletPsi / outletPsi;
    r.stages = ratioToStages(r.ratio);
  }
  if (Number.isFinite(fu) && fu > 0) {
    r.gpm = fuToGpm(fu);
    r.calcSize = approx(r.gpm, sizingMode === 'published' ? SIZE_PUBLISHED : SIZE_SHEET);
    r.sizeAlt = approx(r.gpm, sizingMode === 'published' ? SIZE_SHEET : SIZE_PUBLISHED);
  }

  /* ---- manual override path ---- */
  const forced = resolveCode(row.code);
  if (row.code && row.code.trim() !== '') {
    r.mode = 'manual';
    if (!forced) {
      r.status = 'error';
      r.messages.push({
        level: 'error',
        text: `"${row.code}" is not a recognised quick code. Try a quick code (3386bsb), a part number (K030386BES) or shorthand (3b).`,
      });
      return r;
    }
    const st = STATIONS[forced];
    r.quickCode = forced;
    r.station = st;
    r.size = st.size;
    r.kind = st.kind;
    if (st.kind === 'valve') {
      /* A direct-acting valve is not sized off pressure and flow, so the
         station cross-checks below do not apply to it. */
      r.stages = null;
      return price(r, st, multiplier, margin, qty);
    }
    if (r.stages === null) r.stages = st.stages;
    if (r.calcSize && r.calcSize !== st.size) {
      r.messages.push({
        level: 'warn',
        text: `Manual override. From ${r.gpm} GPM the tables would size this ${r.calcSize}.`,
      });
    }
    if (hasPsi && ratioToStages(r.ratio) !== st.stages) {
      r.messages.push({
        level: 'warn',
        text: `Manual override. Ratio ${r.ratio.toFixed(2)}:1 calls for ${ratioToStages(r.ratio)} stage(s); this station is ${st.stages}.`,
      });
    }
    return price(r, st, multiplier, margin, qty);
  }

  /* ---- calculated path ---- */
  if (!hasPsi && !Number.isFinite(fu)) {
    r.messages.push({ level: 'info', text: 'Enter pressures and FU, or type a quick code.' });
    return r;
  }
  if (!hasPsi) {
    r.messages.push({ level: 'info', text: 'Enter inlet and outlet PSI.' });
  } else {
    if (inletPsi <= outletPsi) {
      r.messages.push({ level: 'error', text: 'Inlet pressure must exceed outlet pressure.' });
    }
    if (r.stages === null) {
      r.messages.push({ level: 'error', text: 'Pressure ratio out of range — check inlet and outlet PSI.' });
    } else if (r.stages >= 3) {
      r.messages.push({
        level: 'error',
        text: `Ratio ${r.ratio.toFixed(2)}:1 calls for ${r.stages} reduction stages. No 3-stage 386-SB station exists in ${PRICE_LIST} — contact VDC, or override with a quick code.`,
      });
    } else if (inReviewBand(r.ratio)) {
      r.stageReview = true;
      r.messages.push({
        level: 'warn',
        text: `Ratio ${r.ratio.toFixed(2)}:1 sits in the ${STAGE_RULE.reviewFrom.toFixed(2)}–${STAGE_RULE.singleMax} review band. A single-stage station is selected; confirm the approach with the contractor before issuing, since a two-stage station is the conservative call this close to the threshold.`,
      });
    }
  }
  if (!Number.isFinite(fu)) {
    r.messages.push({ level: 'info', text: 'Enter fixture units.' });
  } else {
    if (fu > MAX_FU) {
      r.messages.push({ level: 'warn', text: `Hunter curve tops out at ${MAX_FU} FU (${MAX_GPM} GPM); GPM held at that ceiling.` });
    }
    r.size = r.calcSize;
    if (r.sizeAlt && r.size && r.sizeAlt !== r.size) {
      r.boundaryConflict = true;
      r.messages.push({
        level: 'warn',
        text: `At ${r.gpm} GPM the two sizing tables disagree: this one gives ${r.size}, the other ${r.sizeAlt}.`,
      });
    }
    if (r.size === null) {
      r.messages.push({
        level: 'error',
        text: sizingMode === 'published'
          ? `${r.gpm} GPM is below the published minimum of the smallest station (34 GPM).`
          : `${r.gpm} GPM is below the 15 GPM minimum of the sizing table — increase FU.`,
      });
    }
  }

  if (r.size && r.stages) {
    const qc = QUICKCODE_MAP[`${r.size}386${r.stages}`];
    r.quickCode = qc || null;
    const st = qc ? STATIONS[qc] : null;
    if (!st) {
      r.status = 'no-product';
      return r;
    }
    r.station = st;
    r.kind = st.kind;
    price(r, st, multiplier, margin, qty);
  }
  if (r.messages.some((m) => m.level === 'error')) r.status = 'error';
  return r;
}

function price(r, st, multiplier, margin, qty) {
  r.listPrice = st.listPrice;
  r.priceSource = st.source;
  r.distPrice = st.listPrice * multiplier;
  r.contPrice = margin < 1 ? r.distPrice / (1 - margin) : null;
  const n = Number.isFinite(qty) && qty > 0 ? qty : 0;
  r.extListPrice = r.listPrice * n;
  r.extDistPrice = r.distPrice * n;
  r.extContPrice = r.contPrice === null ? null : r.contPrice * n;
  if (r.status !== 'error') {
    r.status = r.messages.some((m) => m.level === 'error') ? 'error' : 'ok';
  }
  return r;
}

/* ==========================================================================
 * Formatting
 * ======================================================================== */

const numOf = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const money = (n) =>
  n === null || n === undefined || Number.isNaN(n)
    ? '—'
    : n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const gpmText = (g) => (g === null || g === undefined ? '—' : Number.isInteger(g) ? String(g) : g.toFixed(1));
const autoTag = (i) => `PRV-${i + 1}`;
const tagOf = (row, i) => (row.tag && row.tag.trim() !== '' ? row.tag : autoTag(i));

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (iso, d) => {
  const t = new Date(iso + 'T00:00:00');
  t.setDate(t.getDate() + d);
  return t.toISOString().slice(0, 10);
};
const dateLong = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
};

/* ==========================================================================
 * Quotation document
 *
 * The markup is produced once and used two ways: injected into the in-app
 * preview, and wrapped into a standalone file for download. Every selector is
 * prefixed .qdoc so the same stylesheet is safe in both contexts.
 * ======================================================================== */

const esc = (v) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const QUOTE_CSS = `
@page { size: letter landscape; margin: 12mm 11mm 14mm; }
.qdoc { font-family: Arial, Helvetica, sans-serif; color:#000; font-size:8.6pt; line-height:1.35; background:#fff; }
.qdoc *, .qdoc *::before, .qdoc *::after { box-sizing:border-box; }
.qdoc h1 { font-size:14pt; margin:0; letter-spacing:-.01em; }
.qdoc .eyebrow { font-size:7.5pt; font-weight:bold; letter-spacing:.1em; text-transform:uppercase; color:#787878; margin:0 0 3px; }
.qdoc header.doc { display:flex; justify-content:space-between; align-items:flex-start; gap:18mm; border-bottom:1.6pt solid #000; padding-bottom:6pt; }
.qdoc header.doc img { width:38mm; height:auto; display:block; }
.qdoc .wordmark { font-size:15pt; font-weight:bold; letter-spacing:-.01em; }
.qdoc .pl { margin-top:5pt; font-size:7.5pt; font-weight:bold; letter-spacing:.06em; text-transform:uppercase; }
.qdoc .pl span { border-bottom:2pt solid #f58220; padding-bottom:1pt; }
.qdoc .meta { display:flex; align-items:flex-start; gap:10mm; margin-top:8pt; }
.qdoc .metatable { border-collapse:collapse; flex:1; }
.qdoc .metatable th { text-align:left; font-size:7pt; letter-spacing:.05em; text-transform:uppercase; color:#787878; padding:2pt 8pt 2pt 0; white-space:nowrap; width:34mm; font-weight:bold; vertical-align:top; }
.qdoc .metatable td { padding:2pt 0; border-bottom:.5pt solid #dcdcdc; }
.qdoc .tbd { color:#aaa; }
.qdoc h2 { font-size:8pt; font-weight:bold; letter-spacing:.09em; text-transform:uppercase; margin:7pt 0 3pt; padding-bottom:2pt; border-bottom:.8pt solid #000; }
.qdoc table.lines { width:100%; border-collapse:collapse; }
.qdoc table.lines thead th { font-size:6.8pt; letter-spacing:.05em; text-transform:uppercase; text-align:left; padding:3pt; border-bottom:1pt solid #000; vertical-align:bottom; color:#000; }
.qdoc table.lines tbody td { padding:2.6pt 3pt; border-bottom:.5pt solid #dcdcdc; vertical-align:top; }
.qdoc table.lines tbody tr { page-break-inside:avoid; }
.qdoc table.lines td.c, .qdoc table.lines th.c { text-align:center; white-space:nowrap; }
.qdoc table.lines td.nw { white-space:nowrap; }
.qdoc table.lines td.n, .qdoc table.lines th.n { text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }
.qdoc table.lines td.b { font-weight:bold; }
.qdoc table.lines td.part { font-family:"Arial Narrow",Arial,sans-serif; font-weight:bold; white-space:nowrap; }
.qdoc table.lines tfoot td { border-top:1.4pt solid #000; border-bottom:none; padding:5pt 3pt; font-weight:bold; font-variant-numeric:tabular-nums; }
.qdoc table.lines tfoot td.lbl { text-align:right; text-transform:uppercase; font-size:7.5pt; letter-spacing:.06em; }
.qdoc .commercial { margin-top:5pt; display:flex; gap:6mm; flex-wrap:wrap; }
.qdoc .commercial div { border:.8pt solid #dcdcdc; padding:4pt 7pt; }
.qdoc .commercial .k { display:block; font-size:6.8pt; font-weight:bold; letter-spacing:.07em; text-transform:uppercase; color:#787878; }
.qdoc .commercial .v { display:block; font-size:10pt; font-weight:bold; font-variant-numeric:tabular-nums; }
.qdoc .twocol { display:flex; gap:8mm; margin-top:4pt; }
.qdoc ol.notes, .qdoc ul.notes { margin:0; padding-left:10pt; font-size:6.3pt; line-height:1.3; }
.qdoc ol.notes li, .qdoc ul.notes li { margin-bottom:1.3pt; break-inside:avoid; }
.qdoc ol.nsplit { column-count:2; column-gap:7mm; }
.qdoc .sig { margin-top:7pt; display:flex; gap:12mm; page-break-inside:avoid; }
.qdoc .sig > div { flex:1; }
/* the rule sits under blank space so there is somewhere to actually sign */
.qdoc .sig i { display:block; height:30pt; border-bottom:.8pt solid #000; }
.qdoc .sig span { display:block; padding-top:3pt; font-size:7pt; text-transform:uppercase; letter-spacing:.06em; color:#787878; }
.qdoc footer.doc { margin-top:5pt; padding-top:4pt; border-top:.8pt solid #dcdcdc; font-size:6.8pt; color:#787878; display:flex; justify-content:space-between; gap:8mm; }
`;

function quoteBody({ project, config, lines, totals, audience = 'internal' }) {
  /* The contractor copy carries no distributor pricing, no multiplier and no
     margin: it shows what the contractor pays and nothing about how it was
     built up. The internal copy keeps the full stack. */
  const contractor = audience === 'contractor';
  const showList = contractor ? false : config.showListOnQuote;
  const showDist = !contractor;
  const moneyCols = 1 + (showList ? 1 : 0) + (showDist ? 1 : 0) + 1; // qty + list + dist + cont
  const cols = 11 + moneyCols;
  const labelSpan = cols - moneyCols;

  /* Empty fields are dropped rather than printed as TBC — on a one-page quote
     the header is the cheapest place to win back vertical space. Whatever is
     left is split evenly across the two columns. */
  const metaPairs = [
    ['Project', project.projectName], ['City', project.city], ['Engineer', project.engineer],
    ['Mechanical contractor', project.contractor], ['Distributor', project.distributor],
    ['Quotation date', dateLong(project.quoteDate)], ['Valid until', dateLong(project.expiryDate)],
    ['Revision', project.revision], ['Prepared by', project.preparedBy],
  ].filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');
  const half = Math.ceil(metaPairs.length / 2);
  const metaRows = (pairs) =>
    pairs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('');

  const body = lines
    .map(({ tag, row, result: r }, i) => `
      <tr>
        <td class="c">${i + 1}</td>
        <td class="nw">${esc(tag)}</td>
        <td>${esc(row.location || '—')}</td>
        <td>${esc(row.system || '—')}</td>
        <td class="c">${esc(r.size)}</td>
        <td class="c">${esc(r.stages)}</td>
        <td class="c">${row.inletPsi && row.outletPsi ? `${esc(row.inletPsi)} / ${esc(row.outletPsi)}` : '—'}</td>
        <td class="c">${row.fu ? esc(row.fu) : '—'}</td>
        <td class="c">${gpmText(r.gpm)}</td>
        <td class="part">${esc(r.station.partNumber)}</td>
        <td>${esc(r.station.shortDescription)}</td>
        <td class="c">${esc(r.qty)}</td>
        ${showList ? `<td class="n">${money(r.extListPrice)}</td>` : ''}
        ${showDist ? `<td class="n">${money(r.extDistPrice)}</td>` : ''}
        ${contractor ? `<td class="n">${money(r.contPrice)}</td>` : ''}
        <td class="n b">${money(r.extContPrice)}</td>
      </tr>`)
    .join('');

  const logoBlock = LOGO.endsWith('__LOGO__')
    ? '<span class="wordmark">Victaulic</span>'
    : `<img src="${LOGO}" alt="Victaulic">`;

  const reviewLines = lines.filter((l) => l.result.stageReview).map((l) => l.tag);

  return `
<header class="doc">
  <div>
    ${contractor ? '' : '<p class="eyebrow">Virtual Design and Construction</p>'}
    <h1>PRV Station Budget Quotation</h1>
    <p class="pl"><span>Price list ${esc(PRICE_LIST)}</span></p>
  </div>
  ${logoBlock}
</header>

${metaPairs.length ? `<div class="meta">
  <table class="metatable">${metaRows(metaPairs.slice(0, half))}</table>
  <table class="metatable">${metaRows(metaPairs.slice(half))}</table>
</div>` : ''}

<h2>Station schedule</h2>
<table class="lines">
  <thead><tr>
    <th class="c">#</th><th>PRV tag</th><th>Location</th><th>System</th>
    <th class="c">Size</th><th class="c">Stages</th><th class="c">Inlet / outlet PSI</th>
    <th class="c">FU</th><th class="c">GPM</th><th>Part number</th><th>Description</th><th class="c">Qty</th>
    ${showList ? '<th class="n">Ext. list</th>' : ''}
    ${showDist ? '<th class="n">Dist. net</th>' : ''}
    ${contractor ? '<th class="n">Unit price</th>' : ''}
    <th class="n">${contractor ? 'Extended' : 'Contractor net'}</th>
  </tr></thead>
  <tbody>${body}</tbody>
  <tfoot><tr>
    <td class="lbl" colspan="${labelSpan}">Total — ${lines.length} item${lines.length === 1 ? '' : 's'}</td>
    <td class="c">${totals.qty}</td>
    ${showList ? `<td class="n">${money(totals.list)}</td>` : ''}
    ${showDist ? `<td class="n">${money(totals.dist)}</td>` : ''}
    ${contractor ? '<td class="n"></td>' : ''}
    <td class="n">${money(totals.cont)}</td>
  </tr></tfoot>
</table>

<div class="commercial">
  <div><span class="k">Price list</span><span class="v">${esc(PRICE_LIST)}</span></div>
  ${contractor ? '' : `
  <div><span class="k">Distributor multiplier</span><span class="v">${multiplierLabel(lines, config)}</span></div>
  <div><span class="k">Distributor margin</span><span class="v">${(config.margin * 100).toFixed(1)}%</span></div>`}
  <div><span class="k">${contractor ? 'Total' : 'Contractor net total'}</span><span class="v">${money(totals.cont)}</span></div>
</div>

<div class="twocol">
  <div style="flex:2"><h2>Quotation notes</h2>
    <ol class="notes nsplit">${QUOTE_NOTES.map((n) => `<li>${esc(n)}</li>`).join('')}
      ${reviewLines.length
        ? `<li><b>Single-stage selection to confirm:</b> ${esc(reviewLines.join(', '))} sit within
             ${STAGE_RULE.reviewFrom.toFixed(2)}–${STAGE_RULE.singleMax}:1 of the two-stage threshold and are
             quoted single stage. To be reviewed with the mechanical contractor.</li>`
        : ''}
    </ol></div>
  <div style="flex:1"><h2>Sizing basis</h2>
    <ul class="notes">${SIZING_BASIS.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
    <h2>Terms</h2>
    <ul class="notes">${TERMS.map((n) => `<li>${esc(n)}</li>`).join('')}
      <li>Stations on this quotation are non-returnable.</li></ul></div>
</div>

<div class="sig">
  <div><i></i><span>Customer acceptance</span></div>
  <div><i></i><span>Print name</span></div>
  <div><i></i><span>Date</span></div>
</div>

<footer class="doc">
  <span>Victaulic Company${contractor ? '' : ' — Virtual Design and Construction'}. Budget quotation, not a firm
        offer of sale. Sizing and pricing to be reconfirmed at time of purchase order.</span>
  <span>${esc(PRICE_LIST)} &middot; ${esc(dateLong(project.quoteDate))} &middot; Rev ${esc(project.revision)}</span>
</footer>`;
}

/* One multiplier if every line agrees, otherwise 'per line'. */
function multiplierLabel(lines, config) {
  const set = new Set(lines.map((l) => l.result.multiplier));
  if (set.size === 1) return [...set][0].toFixed(3);
  return `per line (${Math.min(...set).toFixed(3)}–${Math.max(...set).toFixed(3)})`;
}

export function buildQuoteHtml(payload) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(payload.project.projectName || 'PRV Budget Quotation')} — PRV Budget Quotation</title>
<style>
html,body{margin:0;padding:0;background:#fff}
${QUOTE_CSS}
@media screen { .qdoc { max-width:1180px; margin:0 auto; padding:16px 20px 28px; } }
@media print { .noprint { display:none !important; } }
.noprint{position:fixed;bottom:14px;right:14px;background:#000;color:#fff;border:none;padding:9px 15px;
  font:bold 11px Arial;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.35)}
</style></head><body>
<button class="noprint" onclick="window.print()">Save as PDF</button>
<div class="qdoc">${quoteBody(payload)}</div>
</body></html>`;
}


/* ==========================================================================
 * XLSX export
 *
 * A stored-entry ZIP plus the six parts Excel needs, written by hand so the
 * app keeps its single-file, zero-dependency shape. Verified against openpyxl
 * and LibreOffice.
 * ======================================================================== */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const utf8 = (s) => new TextEncoder().encode(s);

function zipStore(files) {
  const now = new Date();
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
  const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

  const chunks = [];
  const central = [];
  let offset = 0;

  const u16 = (v) => [v & 0xff, (v >>> 8) & 0xff];
  const u32 = (v) => [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];

  for (const f of files) {
    const name = utf8(f.name);
    const data = utf8(f.data);
    const crc = crc32(data);
    const local = [
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0),
      ...u16(dosTime), ...u16(dosDate),
      ...u32(crc), ...u32(data.length), ...u32(data.length),
      ...u16(name.length), ...u16(0),
    ];
    chunks.push(new Uint8Array(local), name, data);
    central.push({ name, crc, size: data.length, offset });
    offset += local.length + name.length + data.length;
  }

  const cdStart = offset;
  for (const e of central) {
    const rec = [
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0),
      ...u16(dosTime), ...u16(dosDate),
      ...u32(e.crc), ...u32(e.size), ...u32(e.size),
      ...u16(e.name.length), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0), ...u32(0), ...u32(e.offset),
    ];
    chunks.push(new Uint8Array(rec), e.name);
    offset += rec.length + e.name.length;
  }
  const eocd = [
    ...u32(0x06054b50), ...u16(0), ...u16(0),
    ...u16(central.length), ...u16(central.length),
    ...u32(offset - cdStart), ...u32(cdStart), ...u16(0),
  ];
  chunks.push(new Uint8Array(eocd));

  const total = chunks.reduce((a, c) => a + c.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  for (const c of chunks) { out.set(c, p); p += c.length; }
  return out;
}

const xesc = (v) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');

const colName = (n) => {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; }
  return s;
};

/* cell: {v, t:'s'|'n', s:styleIndex} ; null/undefined -> empty */
function sheetXml(rows, cols) {
  const colsXml = cols && cols.length
    ? `<cols>${cols.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
    : '';
  const body = rows.map((cells, ri) => {
    const r = ri + 1;
    const inner = cells.map((c, ci) => {
      if (c === null || c === undefined || c.v === null || c.v === undefined || c.v === '') {
        return c && c.s ? `<c r="${colName(ci + 1)}${r}" s="${c.s}"/>` : '';
      }
      const ref = `${colName(ci + 1)}${r}`;
      const st = c.s ? ` s="${c.s}"` : '';
      if (c.t === 'f') return `<c r="${ref}"${st}><f>${xesc(c.v)}</f></c>`;
      if (c.t === 'n') return `<c r="${ref}"${st}><v>${c.v}</v></c>`;
      return `<c r="${ref}"${st} t="inlineStr"><is><t xml:space="preserve">${xesc(c.v)}</t></is></c>`;
    }).join('');
    return `<row r="${r}">${inner}</row>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr/><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="13"/>${colsXml}<sheetData>${body}</sheetData></worksheet>`;
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2">
<numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0.00"/>
<numFmt numFmtId="165" formatCode="0.000"/>
</numFmts>
<fonts count="5">
<font><sz val="10"/><name val="Arial"/></font>
<font><b/><sz val="10"/><name val="Arial"/></font>
<font><b/><sz val="14"/><name val="Arial"/></font>
<font><b/><sz val="9"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
<font><sz val="9"/><color rgb="FF787878"/><name val="Arial"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF000000"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF2F2F2"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="3">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left/><right/><top/><bottom style="thin"><color rgb="FFDCDCDC"/></bottom><diagonal/></border>
<border><left/><right/><top style="medium"><color rgb="FF000000"/></top><bottom/><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="11">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="3" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="164" fontId="1" fillId="0" borderId="2" xfId="0" applyNumberFormat="1" applyBorder="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="2" xfId="0" applyBorder="1"/>
<xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyFill="1"/>
<xf numFmtId="0" fontId="1" fillId="3" borderId="0" xfId="0" applyFill="1" applyFont="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

/* sheets: [{name, rows, cols}] */
function buildXlsx(sheets) {
  const files = [
    {
      name: '[Content_Types].xml',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    },
    {
      name: '_rels/.rels',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xesc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    { name: 'xl/styles.xml', data: STYLES_XML },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s.rows, s.cols) })),
  ];
  return zipStore(files);
}

/* style indices into STYLES_XML above */
const XS = { plain: 0, bold: 1, title: 2, head: 3, money: 4, totalMoney: 5, mult: 6, faint: 7, total: 8 };
const TXT = (v, s) => ({ v, t: 's', s });
const NUM = (v, s) => ({ v, t: 'n', s });
const FML = (v, s) => ({ v, t: 'f', s });

function xlsxSheets({ project, config, lines, totals }) {
  /* Blank fields are omitted here too, so the workbook header stays tight. */
  const meta = [
    ['Project', project.projectName], ['City', project.city], ['Engineer', project.engineer],
    ['Mechanical contractor', project.contractor], ['Distributor', project.distributor],
    ['Prepared by', project.preparedBy],
    ['Quotation date', dateLong(project.quoteDate)], ['Valid until', dateLong(project.expiryDate)],
    ['Revision', project.revision], ['Price list', PRICE_LIST],
  ].filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');

  /* ---- tab 1: everything, including distributor build-up ---- */
  const h1 = ['PRV tag', 'Location', 'System', 'Size', 'Stages', 'Inlet PSI', 'Outlet PSI', 'FU', 'GPM',
    'Quick code', 'Part number', 'Description', 'Qty', 'List ea.', 'Mult', 'Dist net ea.',
    'Ext. dist net', 'Cont net ea.', 'Ext. contractor net'];
  const rows1 = [
    [TXT('PRV Station Budget Quotation — full pricing', XS.title)],
    [TXT('Internal. Contains distributor pricing and multipliers.', XS.faint)],
    [],
  ];
  meta.forEach(([k, v]) => rows1.push([TXT(k, XS.faint), TXT(v, XS.plain)]));
  rows1.push([]);
  rows1.push(h1.map((x) => TXT(x, XS.head)));
  /* Only list price, multiplier and quantity are entered; everything downstream
     is a formula, so editing a multiplier or a quantity in Excel reprices the
     workbook the same way the app does. */
  const firstLine = rows1.length + 1;
  const mgn = config.margin;
  lines.forEach(({ tag, row, result: r }) => {
    const n = rows1.length + 1;
    rows1.push([
      TXT(tag), TXT(row.location), TXT(row.system), TXT(r.size),
      r.stages === null ? TXT('—') : NUM(r.stages),
      numOf(row.inletPsi) === null ? TXT('—') : NUM(numOf(row.inletPsi)),
      numOf(row.outletPsi) === null ? TXT('—') : NUM(numOf(row.outletPsi)),
      numOf(row.fu) === null ? TXT('—') : NUM(numOf(row.fu)),
      r.gpm === null ? TXT('—') : NUM(r.gpm),
      TXT(r.quickCode), TXT(r.station.partNumber), TXT(r.station.description),
      NUM(r.qty), NUM(r.listPrice, XS.money), NUM(r.multiplier, XS.mult),
      FML(`N${n}*O${n}`, XS.money), FML(`M${n}*P${n}`, XS.money),
      FML(`P${n}/(1-${mgn})`, XS.money), FML(`M${n}*R${n}`, XS.money),
    ]);
  });
  const lastLine = rows1.length;
  const pad1 = (n) => Array.from({ length: n }, () => TXT('', XS.total));
  rows1.push([
    TXT('Total', XS.total), ...pad1(11),
    FML(`SUM(M${firstLine}:M${lastLine})`, XS.total), TXT('', XS.total), TXT('', XS.total), TXT('', XS.total),
    FML(`SUM(Q${firstLine}:Q${lastLine})`, XS.totalMoney), TXT('', XS.total),
    FML(`SUM(S${firstLine}:S${lastLine})`, XS.totalMoney),
  ]);
  rows1.push([]);
  rows1.push([TXT(`Distributor margin ${(config.margin * 100).toFixed(1)}%. Contractor net = distributor net / (1 - margin).`, XS.faint)]);
  rows1.push([TXT(`All list prices sourced from ${PRICE_LIST}.`, XS.faint)]);

  /* ---- tab 2: contractor only ---- */
  const h2 = ['PRV tag', 'Location', 'System', 'Size', 'Stages', 'Part number', 'Description', 'Qty',
    'Unit price', 'Extended'];
  const rows2 = [
    [TXT('PRV Station Budget Quotation', XS.title)],
    [],
  ];
  meta.filter(([k]) => k !== 'Distributor').forEach(([k, v]) => rows2.push([TXT(k, XS.faint), TXT(v, XS.plain)]));
  rows2.push([]);
  rows2.push(h2.map((x) => TXT(x, XS.head)));
  const first2 = rows2.length + 1;
  lines.forEach(({ tag, row, result: r }, idx) => {
    const n = rows2.length + 1;
    const src = firstLine + idx; // matching row on the Full Pricing tab
    rows2.push([
      TXT(tag), TXT(row.location), TXT(row.system), TXT(r.size),
      r.stages === null ? TXT('—') : NUM(r.stages),
      TXT(r.station.partNumber), TXT(r.station.shortDescription),
      FML(`'Full Pricing'!M${src}`), FML(`'Full Pricing'!R${src}`, XS.money),
      FML(`H${n}*I${n}`, XS.money),
    ]);
  });
  const last2 = rows2.length;
  rows2.push([
    TXT('Total', XS.total), ...Array.from({ length: 6 }, () => TXT('', XS.total)),
    FML(`SUM(H${first2}:H${last2})`, XS.total), TXT('', XS.total),
    FML(`SUM(J${first2}:J${last2})`, XS.totalMoney),
  ]);
  rows2.push([]);
  QUOTE_NOTES.forEach((n, i) => rows2.push([TXT(`${i + 1}. ${n}`, XS.faint)]));

  return [
    { name: 'Full Pricing', rows: rows1, cols: [13, 12, 9, 7, 7, 9, 10, 7, 8, 12, 13, 42, 6, 13, 8, 13, 14, 13, 15] },
    { name: 'Contractor', rows: rows2, cols: [13, 12, 9, 7, 7, 13, 34, 6, 13, 15] },
  ];
}

/* ==========================================================================
 * Styles
 * ======================================================================== */

const CSS = `
.vic { --or:#f58220; --g1:#787878; --g2:#aaaaaa; --g3:#dcdcdc; --bg:#f5f5f5;
  --err:#b3261e; --warn:#8a5a00; --ok:#1e7a3c;
  font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:1.45; color:#000;
  background:var(--bg); padding:0 20px 56px; }
.vic *{box-sizing:border-box}
.vic button,.vic input,.vic select{font-family:inherit;font-size:inherit;color:inherit}
.vic :focus-visible{outline:2px solid var(--or);outline-offset:2px}
.vic .mast{display:flex;align-items:flex-start;justify-content:space-between;gap:28px;
  padding:20px 0 14px;border-bottom:2px solid #000}
.vic .mast h1{font-size:20px;margin:0;letter-spacing:-.01em}
.vic .mast .sub{margin:0 0 3px;font-size:11px;color:var(--g1);font-weight:bold;letter-spacing:.07em;text-transform:uppercase}
.vic .mast img{width:140px;height:auto;display:block;margin-top:2px}
.vic .mast .wordmark{font-size:20px;font-weight:bold;letter-spacing:-.01em}
.vic .badge{display:inline-flex;align-items:center;gap:6px;margin-top:9px;padding:3px 9px;
  border:1px solid var(--g2);background:#fff;font-size:11px;font-weight:bold;letter-spacing:.05em;text-transform:uppercase}
.vic .badge i{width:7px;height:7px;background:var(--or);border-radius:50%;display:block}
.vic .panel{background:#fff;border:1px solid var(--g3);margin-top:18px}
.vic .panel>header{display:flex;align-items:center;justify-content:space-between;gap:14px;
  padding:10px 14px;border-bottom:1px solid var(--g3)}
.vic .panel>header h2{font-size:11.5px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;margin:0}
.vic .hint{font-size:12px;color:var(--g1)}
.vic .pb{padding:14px}
.vic .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:11px 14px}
.vic .fl{display:flex;flex-direction:column;gap:4px}
.vic .fl label{font-size:10.5px;font-weight:bold;letter-spacing:.05em;text-transform:uppercase;color:var(--g1)}
.vic .fl input,.vic .fl select{border:1px solid var(--g2);background:#fff;padding:7px 9px;border-radius:0;min-width:0}
.vic .fl .n{font-size:11px;color:var(--g1)}
.vic .scroll{overflow-x:auto}
.vic table.sch{width:100%;border-collapse:collapse;font-size:13px}
.vic table.sch th{font-size:9.5px;font-weight:bold;letter-spacing:.05em;text-transform:uppercase;text-align:left;
  color:var(--g1);padding:7px;border-bottom:1px solid #000;white-space:nowrap;vertical-align:bottom}
.vic table.sch td{padding:4px 7px;border-bottom:1px solid var(--g3);vertical-align:middle;white-space:nowrap}
.vic table.sch tbody tr:hover td{background:#fafafa}
.vic table.sch tr.act td{background:#fff8f1}
/* These need table.sch in the selector: '.vic table.sch th' scores (0,2,2) and
   would otherwise override a bare '.vic .cg th' at (0,2,1) whatever the order.
   All bands are black for AA contrast; the underline distinguishes them. */
.vic table.sch tr.cg th{font-size:9px;color:#fff;background:#000;padding:4px 7px;
  border-bottom:none;letter-spacing:.1em;border-left:2px solid #fff}
.vic table.sch tr.cg th.calc{box-shadow:inset 0 -3px 0 var(--g2)}
.vic table.sch tr.cg th.mny{box-shadow:inset 0 -3px 0 var(--or)}
.vic table.sch tr.cg th.bl{background:transparent;border-left:none}
.vic table.sch td.num,.vic table.sch th.num{text-align:right;font-variant-numeric:tabular-nums}
.vic table.sch td.calc{background:#fcfcfc}
.vic table.sch td.mny{text-align:right;font-variant-numeric:tabular-nums}
.vic table.sch tfoot td{border-top:2px solid #000;border-bottom:none;padding:9px 7px;font-weight:bold;font-variant-numeric:tabular-nums}
.vic table.sch tr.addrow td{border-bottom:none;padding:7px}
.vic .ci{border:1px solid transparent;background:transparent;padding:4px 5px;width:100%;min-width:52px}
.vic .ci:hover{border-color:var(--g3)}
.vic .ci:focus{border-color:var(--or);background:#fff}
.vic .ci:disabled{color:var(--g2);background:transparent}
.vic .ci.w{min-width:104px}
.vic .ci.nr{min-width:44px;text-align:right}
.vic .ci.code{min-width:96px;font-family:"Arial Narrow",Arial,sans-serif;font-weight:bold;letter-spacing:.02em;
  border-color:var(--g3);background:#fff}
.vic .ci.code::placeholder{font-weight:normal;color:var(--g2);letter-spacing:0}
.vic .ci.code.bad{border-color:var(--err);background:#fdf2f1}
.vic .ci.code.good{border-color:#000}
.vic .ci.tag{min-width:74px;font-weight:bold}
.vic .ci.mult{min-width:56px;font-variant-numeric:tabular-nums;font-weight:bold}
.vic .ci.mult.auto{color:var(--g1);font-weight:normal}
.vic table.sch td.desc{font-size:11.5px;max-width:265px;overflow:hidden;text-overflow:ellipsis}
.vic .ci.tag.auto{font-weight:normal;color:var(--g1)}
.vic .rn{color:var(--g2);font-size:11px;font-variant-numeric:tabular-nums}
.vic .mu{color:var(--g2)}
.vic .part{font-family:"Arial Narrow",Arial,sans-serif;font-weight:bold;letter-spacing:.02em}
.vic .pill{display:inline-block;padding:1px 6px;font-size:11px;font-weight:bold;border:1px solid var(--g1)}
.vic .pill.s2{border-color:#000;background:#000;color:#fff}
.vic .pill.s3{border-color:var(--err);color:var(--err)}
.vic .mtag{display:inline-block;font-size:9px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;
  border:1px solid var(--or);color:#000;padding:0 4px;margin-left:5px}
.vic .rtag{display:inline-block;font-size:9px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;
  border:1px solid var(--warn);color:var(--warn);padding:0 4px;margin-left:5px}
.vic .fg{display:inline-block;width:14px;text-align:center;font-weight:bold}
.vic .fg.e{color:var(--err)} .vic .fg.w{color:var(--warn)} .vic .fg.o{color:var(--ok)}
.vic .rowbtns{display:flex;gap:3px}
.vic .trace{display:flex;flex-wrap:wrap;border:1px solid var(--g3);background:#fff}
.vic .ts{flex:1 1 126px;min-width:126px;padding:9px 13px;border-right:1px solid var(--g3)}
.vic .ts:last-child{border-right:none}
.vic .ts .k{font-size:9px;font-weight:bold;letter-spacing:.1em;text-transform:uppercase;color:var(--g1);display:block}
.vic .ts .v{font-size:18px;font-weight:bold;line-height:1.15;display:block;margin-top:3px;font-variant-numeric:tabular-nums}
.vic .ts .v.sm{font-size:13.5px;font-family:"Arial Narrow",Arial,sans-serif;letter-spacing:.02em}
.vic .ts .f{display:block;margin-top:3px;font-size:10px;color:var(--g1);font-family:"Arial Narrow",Arial,sans-serif}
.vic .ts.end{border-top:3px solid var(--or)}
.vic .ts.dead{border-top:3px solid var(--err)}
.vic .ts.mtd{border-top:3px solid var(--g1)}
.vic .ts.rev{border-top:3px solid var(--warn)}
.vic .ts.em .v{color:var(--g2)}
.vic ul.msgs{margin:13px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}
.vic ul.msgs li{font-size:12.5px;padding:7px 10px;border-left:3px solid var(--g2);background:var(--bg)}
.vic ul.msgs li.error{border-left-color:var(--err)}
.vic ul.msgs li.warn{border-left-color:var(--warn)}
.vic ul.msgs li b{text-transform:uppercase;font-size:10px;letter-spacing:.06em;margin-right:6px}
.vic .prov{margin-top:13px;padding:10px 12px;border:1px dashed var(--g2);font-size:12px;background:#fcfcfc}
.vic .prov .k{font-weight:bold;text-transform:uppercase;font-size:10px;letter-spacing:.06em;color:var(--g1);display:block;margin-bottom:3px}
.vic .prov code{font-family:"Arial Narrow",Arial,sans-serif;font-size:12px;letter-spacing:.02em}
.vic .btn{border:1px solid #000;background:#fff;padding:8px 14px;font-size:12px;font-weight:bold;
  letter-spacing:.04em;text-transform:uppercase;cursor:pointer}
.vic .btn:hover{background:var(--g3)}
.vic .btn.pri{background:#000;color:#fff}
.vic .btn.pri:hover{background:var(--or);color:#000;border-color:var(--or)}
.vic .btn:disabled{border-color:var(--g2);color:var(--g2);background:#fff;cursor:not-allowed}
.vic .btn.q{border-color:var(--g2);color:var(--g1);font-weight:normal;text-transform:none;letter-spacing:0;padding:5px 10px}
.vic .btn.q:hover{color:#000;border-color:#000;background:#fff}
.vic .btn.ico{padding:3px 7px;font-size:13px;line-height:1.2;border-color:var(--g3);color:var(--g1);font-weight:normal}
.vic .btn.ico:hover{color:#000;border-color:#000;background:#fff}
.vic .btn.wide{width:100%;border-style:dashed;border-color:var(--g2);color:var(--g1);background:#fff;
  font-weight:bold;letter-spacing:.05em}
.vic .btn.wide:hover{color:#000;border-color:#000;border-style:solid;background:#fff}
.vic .row{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
.vic .bar{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;
  margin-top:18px;padding:13px 14px;background:#fff;border:1px solid var(--g3)}
.vic .tot{display:flex;gap:24px;flex-wrap:wrap}
.vic .tot .k{display:block;font-size:10px;font-weight:bold;letter-spacing:.07em;text-transform:uppercase;color:var(--g1)}
.vic .tot .v{display:block;font-size:18px;font-weight:bold;font-variant-numeric:tabular-nums}
.vic .tot .lead .v{border-bottom:3px solid var(--or);display:inline-block}
.vic .ft{margin-top:22px;font-size:11.5px;color:var(--g1);border-top:1px solid var(--g3);padding-top:11px}
.vic .ft p{margin:0 0 5px}
.vic .ft kbd{font-family:inherit;font-size:11px;border:1px solid var(--g2);padding:0 4px;background:#fff;color:#000}

/* ---- quotation preview overlay ---- */
.vic .qover{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.6);overflow:auto;padding:20px}
.vic .qbar{max-width:1180px;margin:0 auto 12px;display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap;align-items:center}
.vic .qbar .lbl{color:#fff;font-size:12px;margin-right:auto;text-shadow:0 1px 3px rgba(0,0,0,.9)}
.vic .qbar .btn{background:#fff}
.vic .qsheet{max-width:1180px;margin:0 auto;background:#fff;padding:22px 26px 30px;box-shadow:0 8px 40px rgba(0,0,0,.5)}
.vic .qnote{max-width:1180px;margin:10px auto 0;color:#fff;font-size:11.5px;opacity:.9;text-shadow:0 1px 3px rgba(0,0,0,.9)}

${QUOTE_CSS}

@media print {
  html,body{background:#fff !important}
  .vic{padding:0 !important;background:#fff !important}
  .vic .appbody{display:none !important}
  .vic .qover{position:static !important;inset:auto !important;overflow:visible !important;
    background:#fff !important;padding:0 !important}
  .vic .qbar,.vic .qnote{display:none !important}
  .vic .qsheet{max-width:none !important;margin:0 !important;padding:0 !important;box-shadow:none !important}
}

@media (max-width:720px){
  .vic{padding:0 12px 44px}
  .vic .mast{flex-direction:column-reverse;align-items:flex-start;gap:12px}
  .vic .qover{padding:10px}
  .vic .qsheet{padding:12px}
  .vic .bar{flex-direction:column;align-items:stretch}
  .vic .bar .row{justify-content:stretch}
  .vic .bar .row .btn{flex:1 1 auto}
  .vic .qbar{justify-content:stretch}
  .vic .qbar .lbl{flex:1 0 100%;margin:0 0 4px}
  .vic .qbar .btn{flex:1 1 auto}
}
/* The quotation is a landscape sheet. Reflowing it on a phone would show the
   reader something other than what prints, so pan it instead. */
@media screen and (max-width:920px){
  .vic .qsheet{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .vic .qsheet .qdoc{min-width:900px}
}
@media (prefers-reduced-motion:reduce){.vic *{transition:none!important;animation:none!important}}
`;

/* ==========================================================================
 * Component
 * ======================================================================== */

let seq = 0;
const blank = () => ({ id: ++seq, tag: '', location: '', system: '', code: '', inletPsi: '', outletPsi: '', fu: '', qty: '1', mult: '' });

export default function App() {
  const [project, setProject] = useState(() => ({
    projectName: '', city: '', engineer: '', contractor: '', distributor: '',
    preparedBy: '', quoteDate: todayISO(), expiryDate: addDays(todayISO(), 60), revision: '1',
  }));
  const [multiplier, setMultiplier] = useState('0.13');
  const [margin, setMargin] = useState('0.10');
  const [sizingMode, setSizingMode] = useState('sheet');
  const [showListOnQuote, setShowListOnQuote] = useState(false);
  const [rows, setRows] = useState(() => [blank()]);
  const [activeId, setActiveId] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const [preview, setPreview] = useState(null); // { audience, html }
  const codeRefs = useRef({});

  const config = useMemo(
    () => ({ multiplier: numOf(multiplier) ?? 0, margin: numOf(margin) ?? 0, sizingMode, showListOnQuote }),
    [multiplier, margin, sizingMode, showListOnQuote]
  );

  const evaluated = useMemo(
    () => rows.map((r, i) => ({ ...r, tagText: tagOf(r, i), result: evaluateRow(r, config) })),
    [rows, config]
  );
  const priced = evaluated.filter((r) => r.result.status === 'ok');
  const totals = useMemo(() => ({
    qty: priced.reduce((a, r) => a + (r.result.qty || 0), 0),
    list: priced.reduce((a, r) => a + (r.result.extListPrice || 0), 0),
    dist: priced.reduce((a, r) => a + (r.result.extDistPrice || 0), 0),
    cont: priced.reduce((a, r) => a + (r.result.extContPrice || 0), 0),
  }), [evaluated]);

  const active = evaluated.find((r) => r.id === activeId) || evaluated[0];

  useEffect(() => {
    if (focusId === null) return;
    const el = codeRefs.current[focusId];
    if (el) { el.focus(); el.select(); }
    setFocusId(null);
  }, [focusId, rows.length]);

  /* Esc closes the quotation preview */
  useEffect(() => {
    if (!preview) return;
    const onKey = (e) => { if (e.key === 'Escape') setPreview(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  const setField = useCallback((id, key, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }, []);

  const addRow = useCallback((focus = false) => {
    const next = blank();
    setRows((prev) => [...prev, next]);
    setActiveId(next.id);
    if (focus) setFocusId(next.id);
  }, []);

  /* Copy a line and drop the copy directly beneath it. The tag resets to auto so
     the new line takes its position number rather than cloning a tag. */
  const duplicateRow = useCallback((id) => {
    setRows((prev) => {
      const i = prev.findIndex((r) => r.id === id);
      if (i < 0) return prev;
      const copy = { ...prev[i], id: ++seq, tag: '' };
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      setActiveId(copy.id);
      return next;
    });
  }, []);

  const removeRow = (id) =>
    setRows((prev) => (prev.length === 1 ? [blank()] : prev.filter((r) => r.id !== id)));

  const onCodeKey = (e, row, index) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const typed = row.code.trim();
    if (typed !== '') {
      const qc = resolveCode(typed);
      if (!qc) return; // stay put; the cell is already flagged
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, code: qc } : r)));
    }
    if (index === rows.length - 1) addRow(true);
    else setFocusId(rows[index + 1].id);
  };

  const loadExample = () => {
    const ex = [
      { location: 'Level 06', system: 'DCW', inletPsi: '187', outletPsi: '45', fu: '500', qty: '1' },
      { location: 'Level 16', system: 'DCW', inletPsi: '150', outletPsi: '32', fu: '300', qty: '1' },
      { location: 'Level 16', system: 'DHW', inletPsi: '110', outletPsi: '35', fu: '180', qty: '2' },
      { location: 'Level 26', system: 'DCW', code: '4386bsb', qty: '1' },
    ].map((r) => ({ ...blank(), ...r }));
    setRows(ex);
    setActiveId(ex[0].id);
  };

  const payload = (audience = 'internal') => ({
    project, config, audience,
    lines: priced.map((r) => ({ tag: r.tagText, row: r, result: r.result })),
    totals,
  });

  const slug = () => (project.projectName || 'PRV-budget-quote').replace(/[^\w-]+/g, '-');

  const openPreview = (audience) =>
    setPreview({ audience, html: quoteBody(payload(audience)) });

  /*
   * Saving a file from a phone.
   *
   * <a download> is a desktop idiom. iOS Safari ignores it for blob: URLs often
   * enough that a tap can appear to do nothing at all, which is the worst
   * possible failure for a sales tool in the field. Where the browser supports
   * sharing files, hand the file to the OS share sheet instead — that is the
   * native "Save to Files / email this" flow on both iOS and Android. Fall back
   * to the anchor everywhere else.
   *
   * navigator.share must be called inside the user gesture, so everything above
   * it stays synchronous; no awaits before the call.
   */
  const saveBlob = (data, type, filename) => {
    const blob = new Blob([data], { type });

    const viaAnchor = () => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    };

    try {
      if (typeof File === 'function' && navigator.canShare) {
        const file = new File([blob], filename, { type });
        if (navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: filename }).catch((err) => {
            /* AbortError just means the sheet was dismissed. */
            if (!err || err.name !== 'AbortError') viaAnchor();
          });
          return;
        }
      }
    } catch {
      /* fall through */
    }
    viaAnchor();
  };

  const downloadHtml = () => {
    const audience = preview ? preview.audience : 'internal';
    saveBlob(buildQuoteHtml(payload(audience)), 'text/html',
      `${slug()}-${audience}.html`);
  };

  const openTab = () => {
    const audience = preview ? preview.audience : 'internal';
    const url = URL.createObjectURL(new Blob([buildQuoteHtml(payload(audience))], { type: 'text/html' }));
    const w = window.open(url, '_blank');
    if (!w) downloadHtml(); // popup blocked, or a mobile browser that refuses blob tabs
    setTimeout(() => URL.revokeObjectURL(url), 20000);
  };

  /* Coarse pointer and no hover is the reliable signal for a touch device;
     user-agent sniffing is not. Used only to reword hints, never to gate. */
  const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  const downloadXlsx = () => {
    const bytes = buildXlsx(xlsxSheets(payload('internal')));
    saveBlob(bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      `${slug()}-PRV-pricing.xlsx`);
  };

  const errCount = evaluated.filter((r) => ['error', 'no-product'].includes(r.result.status)).length;
  const warnCount = evaluated.filter((r) => r.result.messages.some((m) => m.level === 'warn')).length;
  const reviewCount = evaluated.filter((r) => r.result.stageReview).length;
  const multsUsed = [...new Set(priced.map((r) => r.result.multiplier))];
  const multLabel = multsUsed.length === 1 ? multsUsed[0].toFixed(3)
    : multsUsed.length === 0 ? '—' : 'mixed';

  const pf = (key, label, type = 'text') => (
    <div className="fl" key={key}>
      <label htmlFor={`p-${key}`}>{label}</label>
      <input id={`p-${key}`} type={type} value={project[key]}
        onChange={(e) => setProject((p) => ({ ...p, [key]: e.target.value }))} />
    </div>
  );

  return (
    <div className="vic">
      <style>{CSS}</style>

      <div className="appbody">
        <div className="mast">
          <div>
            <p className="sub">Virtual Design and Construction</p>
            <h1>PRV Station Sizing &amp; Budget Quote</h1>
            <span className="badge"><i aria-hidden="true" />Pricing {PRICE_LIST}</span>
          </div>
          {LOGO.endsWith('__LOGO__')
            ? <span className="wordmark">Victaulic</span>
            : <img src={LOGO} alt="Victaulic" width="140" />}
        </div>

        <section className="panel">
          <header><h2>Project</h2><span className="hint">Appears in the quotation header</span></header>
          <div className="pb"><div className="grid">
            {pf('projectName', 'Project name')}{pf('city', 'City')}{pf('engineer', 'Engineer')}
            {pf('contractor', 'Mechanical contractor')}{pf('distributor', 'Distributor')}
            {pf('preparedBy', 'Prepared by')}
            {pf('quoteDate', 'Quotation date', 'date')}{pf('expiryDate', 'Valid until', 'date')}
            {pf('revision', 'Revision')}
          </div></div>
        </section>

        <section className="panel">
          <header><h2>Commercial terms</h2><span className="hint">Applies to every line</span></header>
          <div className="pb"><div className="grid">
            <div className="fl">
              <label htmlFor="mult">Distributor multiplier</label>
              <input id="mult" type="number" step="0.001" min="0" value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)} />
              <span className="n">Distributor net = list × multiplier</span>
            </div>
            <div className="fl">
              <label htmlFor="marg">Distributor margin</label>
              <input id="marg" type="number" step="0.01" min="0" max="0.95" value={margin}
                onChange={(e) => setMargin(e.target.value)} />
              <span className="n">Contractor net = dist. net ÷ (1 − margin)</span>
            </div>
            <div className="fl">
              <label htmlFor="sz">Sizing table</label>
              <select id="sz" value={sizingMode} onChange={(e) => setSizingMode(e.target.value)}>
                <option value="sheet">Sheet table — 45 / 79 / 123 / 177 / 314 GPM</option>
                <option value="published">Published range — 44 / 78 / 122 / 176 / 313 GPM</option>
              </select>
              <span className="n">Lines where the two disagree are flagged.</span>
            </div>
            <div className="fl">
              <label htmlFor="sl">List price on quotation</label>
              <select id="sl" value={showListOnQuote ? 'y' : 'n'} onChange={(e) => setShowListOnQuote(e.target.value === 'y')}>
                <option value="n">Net prices only</option>
                <option value="y">Show extended list</option>
              </select>
              <span className="n">Net-only matches the NET PA sheet.</span>
            </div>
          </div></div>
        </section>

        <section className="panel">
          <header>
            <h2>Station schedule</h2>
            <div className="row">
              <button className="btn q" onClick={loadExample}>Load example</button>
              <button className="btn q" onClick={() => { setRows([blank()]); setActiveId(null); }}>Clear</button>
              <button className="btn" onClick={() => addRow(true)}>Add station</button>
            </div>
          </header>
          <div className="scroll">
            <table className="sch">
              <thead>
                <tr className="cg">
                  <th className="bl" />
                  <th colSpan={3}>Identification</th>
                  <th colSpan={4}>Sizing input — a quick code overrides pressures &amp; FU</th>
                  <th className="calc" colSpan={6}>Selected — {PRICE_LIST}</th>
                  <th className="mny" colSpan={5}>Pricing</th>
                  <th className="bl" />
                </tr>
                <tr>
                  <th />
                  <th>PRV tag</th><th>Location</th><th>System</th>
                  <th>Quick code</th>
                  <th className="num">Inlet PSI</th><th className="num">Outlet PSI</th><th className="num">FU</th>
                  <th className="num">Ratio</th><th className="num">Stages</th><th className="num">GPM</th>
                  <th>Size</th><th>Part number</th><th>Description</th>
                  <th className="num">Qty</th><th className="num">List ea.</th><th className="num">Mult</th>
                  <th className="num">Dist. net</th><th className="num">Cont. net</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {evaluated.map((row, i) => {
                  const r = row.result;
                  const manual = r.mode === 'manual';
                  const bad = r.messages.some((m) => m.level === 'error');
                  const warn = !bad && r.messages.some((m) => m.level === 'warn');
                  const codeTyped = row.code.trim() !== '';
                  return (
                    <tr key={row.id} className={row.id === active?.id ? 'act' : ''}
                        onFocus={() => setActiveId(row.id)} onClick={() => setActiveId(row.id)}>
                      <td className="rn">
                        {i + 1}
                        <span className={`fg ${bad ? 'e' : warn ? 'w' : r.status === 'ok' ? 'o' : ''}`}
                              title={r.messages.map((m) => m.text).join(' ')}>
                          {bad ? '!' : warn ? '△' : r.status === 'ok' ? '•' : ''}
                        </span>
                      </td>
                      <td>
                        <input className={`ci tag${row.tag.trim() === '' ? ' auto' : ''}`}
                          aria-label={`Row ${i + 1} PRV tag`} value={row.tagText}
                          onChange={(e) => {
                            const v = e.target.value;
                            setField(row.id, 'tag', v === autoTag(i) ? '' : v);
                          }} />
                      </td>
                      <td><input className="ci w" aria-label={`Row ${i + 1} location`} value={row.location}
                        onChange={(e) => setField(row.id, 'location', e.target.value)} /></td>
                      <td><input className="ci" aria-label={`Row ${i + 1} system`} value={row.system}
                        onChange={(e) => setField(row.id, 'system', e.target.value)} /></td>

                      <td>
                        <input
                          ref={(el) => { codeRefs.current[row.id] = el; }}
                          className={`ci code${codeTyped ? (r.quickCode ? ' good' : ' bad') : ''}`}
                          aria-label={`Row ${i + 1} quick code override`}
                          placeholder="e.g. 3b" value={row.code}
                          onChange={(e) => setField(row.id, 'code', e.target.value)}
                          onKeyDown={(e) => onCodeKey(e, row, i)} />
                      </td>
                      <td><input className="ci nr" type="number" aria-label={`Row ${i + 1} inlet PSI`}
                        disabled={manual} value={row.inletPsi}
                        onChange={(e) => setField(row.id, 'inletPsi', e.target.value)} /></td>
                      <td><input className="ci nr" type="number" aria-label={`Row ${i + 1} outlet PSI`}
                        disabled={manual} value={row.outletPsi}
                        onChange={(e) => setField(row.id, 'outletPsi', e.target.value)} /></td>
                      <td><input className="ci nr" type="number" max={MAX_FU} aria-label={`Row ${i + 1} fixture units`}
                        disabled={manual} value={row.fu}
                        onChange={(e) => setField(row.id, 'fu', e.target.value)} /></td>

                      <td className="calc num">{r.ratio === null ? '—' : r.ratio.toFixed(2)}</td>
                      <td className="calc num">
                        {r.stages === null ? '—' : <span className={`pill s${r.stages}`}>{r.stages}</span>}
                        {r.stageReview && <span className="rtag" title="Confirm with contractor">rev</span>}
                      </td>
                      <td className="calc num">{gpmText(r.gpm)}</td>
                      <td className="calc">
                        {r.size || <span className="mu">—</span>}
                        {r.boundaryConflict && <span className="fg w" title={`Other table gives ${r.sizeAlt}`}>△</span>}
                        {manual && r.quickCode && <span className="mtag">man</span>}
                      </td>
                      <td className="calc part">{r.station ? r.station.partNumber : <span className="mu">—</span>}</td>
                      <td className="calc desc" title={r.station ? r.station.description : ''}>
                        {r.station ? r.station.shortDescription : <span className="mu">—</span>}
                      </td>

                      <td><input className="ci nr" type="number" min="0" aria-label={`Row ${i + 1} quantity`}
                        value={row.qty} onChange={(e) => setField(row.id, 'qty', e.target.value)} /></td>
                      <td className="mny">{money(r.listPrice)}</td>
                      <td>
                        <input
                          className={`ci nr mult${row.mult.trim() === '' ? ' auto' : ''}`}
                          type="number" step="0.001" min="0"
                          aria-label={`Row ${i + 1} multiplier`}
                          title={row.mult.trim() === ''
                            ? 'Inherited from Commercial terms — type here to override this line'
                            : 'Overridden for this line'}
                          value={row.mult.trim() === '' ? multiplier : row.mult}
                          onChange={(e) => {
                            const v = e.target.value;
                            setField(row.id, 'mult', v === multiplier ? '' : v);
                          }} />
                      </td>
                      <td className="mny">{money(r.extDistPrice)}</td>
                      <td className="mny"><strong>{money(r.extContPrice)}</strong></td>
                      <td>
                        <div className="rowbtns">
                          <button className="btn ico" title="Duplicate this station below"
                            aria-label={`Duplicate row ${i + 1}`}
                            onClick={() => duplicateRow(row.id)}>⧉</button>
                          <button className="btn ico" title="Remove this station"
                            aria-label={`Remove row ${i + 1}`}
                            onClick={() => removeRow(row.id)}>×</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr className="addrow">
                  <td />
                  <td colSpan={19}>
                    <button className="btn wide" onClick={() => addRow(true)}>
                      + Add another PRV station
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={14} style={{ textAlign: 'right', textTransform: 'uppercase', fontSize: 11 }}>
                    Total — {priced.length} priced line{priced.length === 1 ? '' : 's'}
                  </td>
                  <td className="num">{totals.qty}</td>
                  <td className="num">{money(totals.list)}</td>
                  <td className="num">{multLabel}</td>
                  <td className="num">{money(totals.dist)}</td>
                  <td className="num">{money(totals.cont)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {active && (
          <section className="panel">
            <header>
              <h2>Selection trace — {active.tagText}</h2>
              <span className="hint">Click any row to trace it</span>
            </header>
            <div className="pb"><Trace result={active.result} config={config} /></div>
          </section>
        )}

        <div className="bar">
          <div className="tot">
            <div><span className="k">Extended list</span><span className="v">{money(totals.list)}</span></div>
            <div><span className="k">Distributor net</span><span className="v">{money(totals.dist)}</span></div>
            <div className="lead"><span className="k">Contractor net</span><span className="v">{money(totals.cont)}</span></div>
          </div>
          <div className="row">
            {errCount > 0 && <span className="hint" style={{ color: '#b3261e' }}>{errCount} line{errCount === 1 ? '' : 's'} unpriced</span>}
            {reviewCount > 0 && <span className="hint" style={{ color: '#8a5a00' }}>{reviewCount} to confirm with contractor</span>}
            {warnCount > reviewCount && <span className="hint" style={{ color: '#8a5a00' }}>{warnCount - reviewCount} flagged</span>}
            <button className="btn" onClick={downloadXlsx} disabled={priced.length === 0}>Excel</button>
            <button className="btn" onClick={() => openPreview('internal')} disabled={priced.length === 0}>
              Internal PDF
            </button>
            <button className="btn pri" onClick={() => openPreview('contractor')} disabled={priced.length === 0}>
              Contractor PDF
            </button>
          </div>
        </div>

        <div className="ft">
          <p>
            <b>Quick-code entry.</b> Type a code in the Quick code cell and press <kbd>Enter</kbd> — the station
            loads and the cursor jumps to the next line, adding one if you are at the bottom. Accepts a quick code
            (<b>3386bsb</b>), a part number (<b>K030386BES</b>) or shorthand (<b>3b</b> = 3&Prime; two-stage,
            <b> 2.5a</b> = 2½&Prime; one-stage, <b>112b</b> = 1½&Prime; two-stage). Clear the cell to return the line
            to pressure-and-FU sizing. <b>⧉</b> copies a station in directly beneath itself.
          </p>
          <p>
            <b>935-H direct-acting valves</b> are quick-code only, since they are specified rather than sized
            off the Hunter curve: <b>2935h</b> is a 2&Prime; 935-H. Available in ½&Prime;, ¾&Prime;, 1&Prime;,
            1¼&Prime;, 1½&Prime; and 2&Prime; — codes <b>12935h</b>, <b>34935h</b>, <b>1935h</b>, <b>114935h</b>,
            <b>112935h</b>, <b>2935h</b>. Ratio, GPM and stages stay blank on those lines.
          </p>
          <p>
            <b>Multipliers.</b> Every line starts on the multiplier in Commercial terms, shown grey. Type into a
            line's Mult cell to override just that line; it turns black and the totals follow. Clear it to go back
            to inheriting. The internal quotation reports a single multiplier when all lines agree and the range
            when they do not.
          </p>
          <p>
            <b>PRV tags</b> default to PRV-1, PRV-2, PRV-3… and renumber as lines are added, duplicated or removed.
            Type over one to set your own; clear it to go back to the default.
          </p>
          <p>
            <b>Stages.</b> A ratio of {STAGE_RULE.singleMax}:1 or lower takes a single-stage 386A-SB; above that,
            two stages. Between {STAGE_RULE.reviewFrom.toFixed(2)}:1 and {STAGE_RULE.singleMax}:1 the line is marked{' '}
            <b>rev</b> — single stage is selected but it is close enough to the threshold to be worth agreeing with
            the contractor, and the note carries onto the quotation.
          </p>
          <p>
            <b>Exports.</b> <b>Excel</b> gives one workbook with a Full Pricing tab (list, multiplier,
            distributor and contractor) and a Contractor tab (contractor pricing only).
            <b> Internal PDF</b> keeps the distributor build-up. <b>Contractor PDF</b> strips distributor net,
            multiplier and margin entirely.
          </p>
          <p>
            All list prices read from <b>{PRICE_LIST}</b>; no PL2025-1 pricing is used. 386A-SB (1 stage) and
            386B-SB (2 stage) in 1½&Prime;, 2&Prime;, 2½&Prime;, 3&Prime;, 4&Prime;, 6&Prime;. No 8&Prime; and no
            3-stage station exists in {PRICE_LIST}; Hunter curve ceiling {MAX_FU} FU / {MAX_GPM} GPM.
          </p>
        </div>
      </div>

      {preview && (
        <div className="qover" role="dialog" aria-modal="true" aria-label="Quotation preview">
          <div className="qbar">
            <span className="lbl">
              {preview.audience === 'contractor' ? 'Contractor copy' : 'Internal copy'} — {priced.length} line
              {priced.length === 1 ? '' : 's'}, {money(totals.cont)}
              {preview.audience === 'contractor' ? '' : ' contractor net'}
            </span>
            <button className="btn" onClick={() => window.print()}>Save as PDF</button>
            <button className="btn" onClick={openTab}>Open in new tab</button>
            <button className="btn" onClick={downloadHtml}>Download</button>
            <button className="btn" onClick={() => setPreview(null)}>Close</button>
          </div>
          <div className="qsheet">
            <div className="qdoc" dangerouslySetInnerHTML={{ __html: preview.html }} />
          </div>
          <p className="qnote">
            {isTouch
              ? 'Save as PDF opens your print sheet — pick “Save to Files” or “Print to PDF”. Download hands the file to the share sheet instead. Landscape US Letter is already set.'
              : 'Save as PDF opens the browser print dialog — choose “Save as PDF” as the destination, landscape, and the page is already set up for US Letter. Esc closes this preview.'}
          </p>
        </div>
      )}
    </div>
  );
}

function Trace({ result: r, config }) {
  const manual = r.mode === 'manual';
  const steps = [
    { k: 'Ratio', v: r.ratio === null ? '—' : `${r.ratio.toFixed(2)}:1`, f: 'inlet ÷ outlet PSI' },
    {
      k: 'Stages', v: r.stages === null ? '—' : String(r.stages),
      f: manual ? 'from station' : `1 up to ${STAGE_RULE.singleMax}:1`,
      rev: r.stageReview,
    },
    { k: 'Flow', v: r.gpm === null ? '—' : `${gpmText(r.gpm)} GPM`, f: 'FU → Hunter curve' },
    { k: 'Size', v: r.size || '—', f: manual ? 'manual override' : `GPM → ${config.sizingMode === 'published' ? 'published range' : 'sheet table'}` },
    { k: 'Quick code', v: r.quickCode || '—', sm: true, f: manual ? 'typed' : 'size + "386" + stages' },
    { k: 'Part number', v: r.station ? r.station.partNumber : '—', sm: true, f: `${PRICE_LIST} catalogue` },
    {
      k: 'List price', v: r.listPrice === null ? '—' : money(r.listPrice), sm: true, f: `${PRICE_LIST} · Price`,
      end: r.status === 'ok' && !manual, mtd: r.status === 'ok' && manual,
      dead: r.status === 'error' || r.status === 'no-product',
    },
  ];
  return (
    <>
      <div className="trace">
        {steps.map((s) => (
          <div key={s.k} className={['ts', s.end && 'end', s.mtd && 'mtd', s.rev && 'rev', s.dead && 'dead', s.v === '—' && 'em'].filter(Boolean).join(' ')}>
            <span className="k">{s.k}</span>
            <span className={`v${s.sm ? ' sm' : ''}`}>{s.v}</span>
            <span className="f">{s.f}</span>
          </div>
        ))}
      </div>
      {r.messages.length > 0 && (
        <ul className="msgs">
          {r.messages.map((m, i) => (
            <li key={i} className={m.level}><b>{m.level === 'info' ? 'Next' : m.level}</b>{m.text}</li>
          ))}
        </ul>
      )}
      {r.status === 'ok' && (
        <div className="prov">
          <span className="k">Price provenance{manual ? ' — manual selection' : ''}</span>
          <div>
            {money(r.listPrice)} list &nbsp;×&nbsp; {config.multiplier.toFixed(3)} mult ={' '}
            <strong>{money(r.distPrice)}</strong> distributor net &nbsp;÷&nbsp; (1 − {config.margin.toFixed(2)}) ={' '}
            <strong>{money(r.contPrice)}</strong> contractor net
            {r.qty > 1 && <> &nbsp;×&nbsp; {r.qty} ea = <strong>{money(r.extContPrice)}</strong></>}
          </div>
          <div style={{ marginTop: 5 }}><code>{r.priceSource}</code></div>
          <div style={{ marginTop: 3 }}>
            <code>{r.station.description} · published flow {r.station.gpmRange}
              {r.station.nonReturnable ? ' · non-returnable' : ''}</code>
          </div>
        </div>
      )}
    </>
  );
}
