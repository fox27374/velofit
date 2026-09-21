# BuyFit — agreed design

Agreed in a grilling session on 2026-09-21. A second feature alongside the
video fit, sharing the app but not the flow.

## Why

The video fit answers "is the bike I own set up right for me". BuyFit answers
the question that comes before owning it: **which frame should I buy**. It
needs no camera, no pose detection and no spike, which is also why it ships
first — see "Order of work".

## What the evidence allows

`doc/frame-sizing-research.md` is the sourced reference, researched for this
feature. Its verdict, in short: **about one and a half of the eleven outputs a
sizing calculator wants to print are defensible.**

- **Saddle height** from inseam is real, and still carries a ±20–25 mm honest
  band. Peveler & Green (2011): 109%-of-inseam lands outside the 25–35°
  knee-angle window **73% of the time**, and LeMond's 0.883 inherits that,
  since the two agree to ~1.5 mm.
- **Handlebar width** ≈ shoulder width rests on one n = 10 study (Lin et al.
  2025) plus universal fitter practice. The popular "5–10% narrower" rule
  contradicts that study and has no source.
- **Crank length**: the honest finding is that it barely matters. 120 → 220 mm
  moved peak power 3.8% (Martin & Spirduso 2001); a 2024 systematic review of
  47 studies declines to recommend a crank length at all.
- **Reach and saddle setback are a tested null.** Holliday & Swart (2021,
  n = 50) regressed bike configuration onto anthropometry: saddle height
  adj R² = 0.46, handlebar drop 0.25, saddle setback 0.07 (n.s.), **handlebar
  reach adj R² = −0.10** — worse than guessing the mean. Arm length and stature
  survived into no model.
- **Size labels do not transfer between brands.** 133 models / 24 brands: bikes
  labelled 54 cm with identical effective top tube vary 18 mm in reach and
  50 mm in stack. Two Specialized frames both labelled 56 differ by 42 mm of
  stack.
- `frame size = 0.65 × inseam`, widely reposted, **has no traceable origin** —
  it appears only on SEO calculator-clone sites. Not shipped.

## Decisions, including where they overrule the research

**BuyFit prints the full set of outputs, not just the defensible ones.** The
research recommends refusing frame size, seat tube, effective top tube, reach,
setback and stem length outright. This design overrules that: they are printed
as **wide windows with a visible "No source" badge**, and for stem and setback
the badge states the basis is *what bikes in your window ship with*, not your
body. The reasoning is that a user who came to be told a frame size is not
served by a blank space, and a badged wide window is more honest than the
calculator sites they would otherwise use. The research doc stands unedited as
the record of what the evidence actually supports.

### Inputs

Inseam, height, shoulder width. Nothing else — every field must have a
consumer. Arm length, torso length and foot length are **not collected**:
Holliday & Swart measured the first two and they survived into no model, and
no published mapping from foot length to any frame dimension exists.

**No flexibility input.** The only saddle-height model that worked used two
clinically measured tests (Knee Extension Angle, modified Schober). A
self-rating is an unvalidated proxy for those, and nothing published says how
much it would widen the band, so it would change the output without evidence
that it should.

Metric only. Values kept in `localStorage`; no accounts, nothing leaves the
device. Each field gets inline-SVG line art plus text stating the error
consequence — input error is comparable to the entire output tolerance, so the
instructions are load-bearing, not decoration.

### Outputs

Every line carries a **Sourced / Weak / No source** badge that links into
`doc/frame-sizing-research.md`. The badge travels with the number in a
screenshot; a single disclaimer at the top of the screen does not.

| Line | Basis | Badge |
|---|---|---|
| Saddle height | 0.870–0.895 × inseam, BB centre to saddle top along the seat tube, ±20–25 mm | Sourced |
| Handlebar width | shoulder width ±20 mm, stating which width convention is meant | Weak |
| Crank length | 165–175 mm, with "this barely matters" said out loud | Weak |
| Stack/reach window | height → the maker's own size label → min–max of that label's stack and reach across the database | No source |
| Frame size, seat tube, ETT | wide windows from what bikes in the window ship with | No source, basis stated as *not from your body* |

**Setback and stem were dropped from that line during implementation**, and
this overrules the agreed list. Makers do not publish saddle setback or stem
length per size in their geometry charts — Trek's Madone chart, the first real
model typed in, carries neither — so the database has no field to range over
and there is nothing to print. Four honest numbers beat six with two invented.

The handlebar width convention must be stated on both input and output: the
UCI regulates three different definitions of handlebar width simultaneously.

### The geometry database

Hand-typed static JSON, numbers taken from each maker's own published geometry
chart. **No scraping** of 99spokes, geometrygeeks or Bike Insights: it breaches
their terms, and in the EU their compiled collection carries *sui generis*
database right independent of the individual figures, which are facts and free.

Road only. ~15 models in v1 — roughly 90 rows, enough to find every schema
problem that 100 would. The matcher is tested against a synthetic table, never
against the shipped data, so typing in real bikes cannot break the tests.

First real model in: **Trek Madone SLR 9 AXS Gen 8 (2026)**, six sizes, stack
reach ETT and seat tube from Trek's geometry chart, rider-height bands from
Trek's separate size chart. Both charts are in cm; the database is mm.

Trek's size chart also publishes an **inseam band per size**, which the schema
does not yet carry. Worth adding as a second filter once more models are typed
in — inseam beats height as a predictor everywhere else in this feature.

Per model and size: **stack, reach, effective top tube, seat tube, and the
maker's own rider-height band** (the height band is what Q21's window
derivation consumes), plus a `verified` date per model so staleness is visible.

### Matching

Filter to the window, sort by distance from its centre, list **every** model
and size that fits with its mm deltas. Never a single winner, never a 0–100
score: the window usually contains several sizes across several bikes, which is
the true answer and the useful one when a shop has three of them in stock.

Second tab on the results screen: **type any bike's stack and reach** from the
maker's chart and get fits / too long / too tall in mm. With 15 models in the
database, most bikes a user looks at will not be listed, so this is not a
fallback — it is the path that works from day one.

## Order of work

BuyFit ships before the video fit. The web migration therefore happens now,
ahead of the spike, in the order `doc/web-redesign.md` already set: merge
`device-testing-fixes` into `main`, tag `flutter-final`, delete the Flutter
tree, web app at the repo root. The tag makes the Flutter app recoverable in
full with `git checkout flutter-final`.

The spike outcome does not put the migration at risk: even a failed spike falls
back to static photos in a web app. The video fit resumes once the spike runs
on the Redmi with a real pedaling video.

Home screen gains a fourth entry: Bike Fitting / How to Measure / Fitting
Tables / **BuyFit**.

## Not in v1

- Tri and MTB, in both the formulas and the database. Tri geometry is a
  different fit problem — steep seat angle, weight on the aerobars — so an
  Orbea Ordu matched by road rules would be matched wrong.
- Flexibility tests of any kind.
- Arm length, torso length, foot length fields.
- A shared rider profile with the video fit. **Consequence:** inseam is typed
  twice, and the video fit keeps printing saddle height unscored even though
  BuyFit now knows the inseam that would let it be scored.
- User-submitted database entries (a moderation queue and a backend, and this
  app has neither).
- Saddle-to-bar drop in mm.

## Before shipping

**Hand-check Holliday & Swart's printed regression tables against the PDF.**
The coefficients and adjusted R² values were extracted from the PMC full text
by automated reading, and they carry both the one positive result and both
nulls — the entire evidential basis for what BuyFit prints and for what it
badges.

## Testing

Sizing math and the matcher are plain TypeScript, no framework dependency,
tested with Vitest against a synthetic geometry table: a known body in, assert
which model/size rows come back and in what order, including the boundary case
where a bike sits exactly on the window edge. Build, lint and test are run
directly, not taken on an agent's word.
