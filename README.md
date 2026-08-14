# PRV Station Sizing & Budget Quote

Internal Victaulic VDC tool. Sizes 386-SB pressure reducing valve stations from
system pressures and fixture units, takes 935-H direct-acting valves by quick
code, prices everything at **PL2026**, and exports an internal quote, a
contractor quote, or an Excel workbook.

Everything lives in **`src/App.jsx`** — logic, catalogue, styles, logo, the quote
document and the XLSX writer. No CSS file, no data module, no runtime dependency
beyond React.

## Run and deploy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
```

Vercel: import the repo and accept the detected settings, or `vercel --prod`.
`vercel.json` declares the Vite preset, build command and output directory, so
there is nothing to configure in the dashboard.

### GitHub

```bash
git init
git add .
git commit -m "PRV quote tool"
git remote add origin git@github.com:<org>/<repo>.git
git push -u origin main
```

Nine files, no binary assets, no submodules — `node_modules` and `dist` are
ignored. On Vercel: New Project, import the repo, Deploy. Every later push
redeploys automatically.

**Make the repo private.** It contains PL2026 list pricing, the multiplier and
the margin in source. A public GitHub repo puts all of that on the open web and
into search indexes, which is a different and worse exposure than an
unadvertised URL.

## Sharing without a server

```bash
npm run standalone   # -> PRV-Quote-Tool.html
```

Produces one self-contained `.html` file, about 650 KB, that runs by
double-clicking. React, ReactDOM and the scheduler are compiled into the file
from `node_modules` rather than loaded from a CDN, so it needs **no internet
connection** — put it on SharePoint, a network drive, or email it. Verified with
the browser fully offline on both a desktop and an iPhone viewport: zero external
requests, no console errors, quick-code entry, per-line multipliers, duplication,
both PDFs and the Excel download all working.

Chrome or Edge. Two things to know before circulating it:

- **It contains PL2026 list pricing, the multiplier and the margin in plain
  text**, readable by anyone who opens the file in a text editor. Share it the
  way you would share the pricing spreadsheet itself.
- **Everyone gets their own copy.** A PL2027 update means rebuilding and
  redistributing. The hosted version avoids that, since everyone loads the same
  URL.

## Exports

| Button | Contents |
|---|---|
| **Excel** | One workbook, two tabs. `Full Pricing` = list, multiplier, distributor net and contractor net. `Contractor` = contractor pricing only. |
| **Internal PDF** | Full build-up: extended list (optional), distributor net, multiplier, margin. |
| **Contractor PDF** | Unit price and extended only. No distributor net, no multiplier, no margin, and no "Virtual Design and Construction" line. |

Each PDF opens in an in-app preview with Save as PDF, Open in new tab, Download
and Close. Print CSS hides the app chrome so only the quotation prints; the page
is pre-set to US Letter landscape.

The workbook is **formula-driven**, not a dump of values. Only list price,
multiplier and quantity are entered; distributor net, contractor net, extended
columns and all totals are real formulas, and the Contractor tab pulls its unit
prices from the Full Pricing tab. Change a multiplier or a quantity in Excel and
the whole workbook reprices exactly as the app does. Written by hand as a stored
ZIP with the six parts Excel needs, so the app stays dependency-free; verified
against openpyxl and recalculated in LibreOffice with zero formula errors.

Blank project fields are omitted from both the quotation and the workbook header
rather than printed as TBC, which keeps a short quote on one page. The
distributor *name* still appears on the contractor PDF when filled in, since that
is a commercial field rather than pricing; leave it blank and the row disappears.

### Phones

Saving a file uses the OS share sheet where the browser supports it
(`navigator.share` with files), falling back to a normal download elsewhere.
`<a download>` is a desktop idiom that iOS Safari ignores often enough that a tap
can appear to do nothing at all, which is the worst possible failure in the
field. All four paths are covered and tested: share succeeds, the user cancels
the sheet (nothing saved, no surprise file), share fails for a real reason (falls
back to a download), and the browser refuses file sharing (falls back).

For PDFs on a phone, Save as PDF opens the print sheet — the hint text switches
to "pick Save to Files or Print to PDF" on touch devices. The quotation is a
landscape sheet, so the preview pans horizontally rather than reflowing; what you
see is what prints.

## Catalogue

**386-SB stations** — 386A-SB (1 stage) and 386B-SB (2 stage) in 1½", 2", 2½",
3", 4", 6". Selected from pressures and FU, or by quick code.

**935-H direct-acting PRVs** — quick code entry only, because these are specified
by the engineer rather than sized off the Hunter curve. Ratio, GPM and stages
stay blank on those lines.

| Size | Quick code | Part number | PL2026 list |
|---|---|---|---|
| ½" | `12935h` | S0049353FF | 635.00 |
| ¾" | `34935h` | S0069353FF | 679.00 |
| 1" | `1935h` | S0109353FF | 867.50 |
| 1¼" | `114935h` | S0129353FF | 1,774.00 |
| 1½" | `112935h` | S0149353FF | 2,277.50 |
| 2" | `2935h` | S0209353FF | 2,631.00 |

Quick codes are as published in PL2026. The trailing `h` is optional (`2935`
works) and punctuation is ignored, so `1 1/2 935h` resolves to `112935h`. Part
numbers are accepted too.

## Multipliers

Every line starts on the multiplier in Commercial terms, shown grey. Type into a
line's Mult cell to override just that line — it turns bold black and the totals
follow. Clear it to go back to inheriting. The schedule total shows the single
multiplier when all lines agree and `mixed` when they do not; the internal
quotation reports either the one value or the range.

## Stage selection rule

| Pressure ratio | Stages | Station |
|---|---|---|
| up to 3.15 : 1 | 1 | 386A-SB |
| above 3.15 up to 7.5 : 1 | 2 | 386B-SB |
| 7.5 : 1 and above | 3 | none exists — flagged |
| **3.00 – 3.15 : 1** | **1, flagged `rev`** | 386A-SB, confirm with contractor |

This **supersedes the workbook**, which switched to two stages at 2.98 : 1. Any
ratio between 2.98 and 3.15 now selects a single-stage station where the
spreadsheet selected a two-stage one — a different and materially cheaper part.
Lines in the review band carry a `rev` marker in the schedule, a warning in the
selection trace, and a numbered note on the quotation naming the affected tags.

## Entering lines

**Quick-code override.** Type a code and press Enter: the item loads and the
cursor jumps to the next line's Quick code cell, adding a line if you were on the
last one. Accepts a quick code (`3386bsb`, `2935h`), a part number
(`K030386BES`, `S0209353FF`) or station shorthand (`3b`, `2.5a`, `212b`, `112a`).
Case and punctuation are ignored; an unrecognised code turns the cell red and
leaves the line unpriced rather than guessing.

When a station line is overridden, PSI and FU still evaluate in the background:
if they would have produced a different station, the line is flagged with what
the tables would have said.

**Duplicate.** `⧉` copies a line in directly beneath itself, carrying location,
system, quick code, pressures, FU, quantity and multiplier. The copy takes the
next tag number rather than cloning the tag.

**Add a row.** The *Add station* button in the panel header or the
`+ Add another PRV station` button beneath the last row. Both put the cursor in
the new line's Quick code cell.

**PRV tags** default to PRV-1, PRV-2, PRV-3… and renumber as lines are added,
duplicated or removed. Type over one to set your own (bold); clear it to return
to the default (grey).

## Where the numbers come from

| Value | Source |
|---|---|
| List price | `PL2026_with_Quick_Codes_.xlsx`, sheet `PL2026`, column M `Price` |
| Part number, description, non-returnable flag | same file, columns B, K, P |
| FU → GPM Hunter curve | PL2025-1 workbook, sheet `PRV Quote`, `AB4:AC5003` |
| GPM → size | same sheet, `AG13:AH787` |
| Quick-code map | same sheet, `AL13:AM32` |
| Published GPM ranges | PL2025-1 workbook, sheet `DB`, column G |
| Quotation notes | same sheet `PRV Quote`, `B36:B43` |
| Ratio → stages | **not from the workbook** — see the rule above |

**No price from the PL2025-1 workbook is used anywhere.** All eighteen catalogue
items resolve in PL2026 on the `Quick Code` key.

The 5,000-row Hunter curve is stored as 31 anchor points because the table is
exactly piecewise linear between them; interpolating reproduces all 5,000
original values to within 1e-13, verified row by row.

To move to a future price list, update the `listPrice` values and their `row`
provenance numbers in the catalogue, and change `PRICE_LIST`.

## Other deviations from the source workbook

1. **The GPM lookup range is anchored.** In the workbook it is relative, so each
   row down the schedule loses one more low-GPM entry — row 11 reads
   `AG13:AH794`, row 34 reads `AG36:AH817`. Same inputs, different answers
   depending on which row you typed them into.
2. **Escalation columns removed.** PL2026 list only.
3. **Multipliers are real inputs.** Cell `S4` ("ENTER MULT", 0.125) was orphaned
   while each row hardcoded 0.13.
4. **One lookup path for all lines.** The workbook used `JOHNDB` for rows 11–20
   and `MISCDB`/`MISCDB2` for rows 21–34, which start at different offsets.
5. **8" removed.** No 8" 386-SB station exists in PL2026 or the old `DB`, and the
   Hunter curve ceiling of 593 GPM makes the 706 GPM break unreachable.
6. **3-stage flagged, not silently blank.** The workbook returned
   "ENTER GPM & FU", which reads like an input error.
7. **Quantity per line.** Defaults to 1, so totals match unless changed.
8. **Row limit removed.** The workbook was fixed at 24 rows, one of which
   (row 34) had no part-selection formula at all.
9. **Sizing table is switchable.** The workbook's GPM breakpoints sit one GPM
   above the published ranges in `DB` column G, so at 44 / 78 / 122 / 176 / 313
   GPM it selected a station outside its published range. Lines where the two
   disagree are flagged.
10. **Quote header references fixed.** On sheet `PRV NET PA`, `A10:A33` all
    pointed at `$B$11`, so every line carried the same PRV tag, and the column
    headed "Orientation" pulled the description.
11. **Description shortened on the quotation.** Size and Stages have their own
    columns, so repeating both forced the table to wrap. The full PL2026
    description still appears in the selection trace and the Excel Full Pricing
    tab.

## Branding

Arial throughout, black body text, Victaulic Orange `F58220` as an accent only,
neutral greys `787878` / `AAAAAA` / `DCDCDC`. The primary logo is embedded as a
data URI — unmodified artwork with the registered mark intact, downscaled to
520px wide — placed top-right per house standard, never recoloured or rebuilt
from text. Group-header bands are white on black rather than white on grey so
small bold text clears the WCAG 2.1 AA 4.5:1 contrast threshold. Excel output is
Arial with a black header band.
Ref: Victaulic Logo and Brand Integrity Guidelines VC-CC-5168 REV A 10/2025.
