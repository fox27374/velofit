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

### Who it is for, and what that rules out

**BuyFit is for someone who does not own a bike yet.** Confirmed on
2026-09-21 after the alternative was put and rejected.

The alternative was the only method the research doc calls honest arithmetic
rather than a black box: stack/reach matching from a bar position already
known to work, measured off a bike that fits. It would move the search window
from `No source` to a defensible derivation, and it is the single largest
badge improvement available anywhere in this feature.

It is rejected because it assumes the thing BuyFit exists to precede. A rider
buying their first bike has no position to copy, and a rider whose current
bike was never fitted — the common case — would be copying a position that was
never right. **The stack/reach window therefore keeps its `No source` badge
permanently.** Do not reopen this: it is a decision about who the tool serves,
not about evidence.

### Inputs

Inseam, height, shoulder width. Nothing else is required — every field must
have a consumer. Four optional fields add detail: **sternum height** (floor to
the jugular notch), **arm length** (shoulder tip to wrist), **sit-bone width**
(centre to centre, measured seated) and **sex**.

Sit-bone width sets the saddle width output (§8.1, brand allowance). Sex is
never a sizing input: it only picks the US Army ANSUR II averages (§8.3) that
sternum height, torso and arm are compared with. Those three are shown as
proportions and **never move the stack/reach window**. Holliday & Swart (§2.3,
n = 50) found that arm length and stature predicted no fit variable, and no
source maps a proportion to a frame dimension. Arm length is never labelled
long or short: a fitter's wrist landmark is only inferred. Foot length is
**not collected**, because no published mapping from foot length to any frame
dimension exists.

**No flexibility input.** The only saddle-height model that worked used two
clinically measured tests (Knee Extension Angle, modified Schober). A
self-rating is an unvalidated proxy for those, and nothing published says how
much it would widen the band, so it would change the output without evidence
that it should.

Metric only: body measurements are entered in centimetres, because nobody
measures their height in millimetres, and every bike output stays in
millimetres, the unit makers and shops publish. Values kept in `localStorage`; no accounts, nothing leaves the
device. Each field gets inline-SVG line art plus text stating the error
consequence — input error is comparable to the entire output tolerance, so the
instructions are load-bearing, not decoration.

### Outputs

Every line carries a **Sourced / Weak / No source** badge that links into
`doc/frame-sizing-research.md`. The badge travels with the number in a
screenshot; a single disclaimer at the top of the screen does not.

**The badges became ⓘ panels on 2026-09-27**, at the owner's request, and this
overrules the paragraph above. Each card and the size heading carry an ⓘ
button on their title line; hover or tap opens a panel with the explanation
and one line, "Evidence: Sourced / Weak / No source · read the research →",
linking to the same section of the research doc the badge linked to. The
evidence level is one tap away instead of always on screen, so it no longer
travels with the number in a screenshot. Data that belongs to the number, such
as the frame geometry card's seat-tube and top-tube ranges, stays visible.

| Line | Basis | Badge |
|---|---|---|
| Saddle height | 0.870–0.895 × inseam, BB centre to saddle top along the seat tube, ±20–25 mm | Sourced |
| Handlebar width | shoulder width ±20 mm, stating which width convention is meant | Weak |
| Crank length | 165–170 mm, or 165 mm for a racy preference, each with its reason printed | Weak |
| Stack/reach window | height → the maker's own size label → min–max of that label's stack and reach across the database | No source |
| Frame size, seat tube, ETT | wide windows from what bikes in the window ship with | No source, basis stated as *not from your body* |
| Inseam-to-height ratio | inseam ÷ height, classified against the 45–48% band, reported only | No source |
| Saddle width | sit-bone width (centre to centre) + 10 / 20 / 30 mm for racier / none / upright, shown when sit-bone width is entered | No source (brand guidance, not a validated rule) |
| Proportions | sternum height, torso (sternum minus inseam) and arm as % of height; with sex set, the ANSUR II average and z; long / typical / short for sternum and torso only | Weak |

**Crank length narrowed to 165–170 mm, and tilts with the preference.** The
research doc's defensible output is 165–175 mm, and §3.2 refuses the Palm and
Zinn formulas as pseudo-precision — that refusal stands, and no crank output
depends on inseam. But two findings in that section do survive and now shape
the band. Li et al. detected significantly worse perceived fatigue at 175 mm
than at 165 or 170 (p < 0.001) while finding no difference in efficiency,
sprint power or cadence, so 175 leaves the recommended band without becoming a
mistake to ride. And §3.2 accepts hip-angle closure at top dead centre as the
one real reason to go shorter, which is precisely what a racy preference asks
for — so that preference points at 165 mm. Both outputs print their reason next
to the number.

**The inseam-to-height ratio is reported, never applied.** §4.5 of the research
doc argues that maker size charts are wrong to key off height alone, and BuyFit
reads its window straight out of those charts — so two riders of the same height
get the same window no matter how their legs and torso divide it. The ratio
names that gap for the rider instead of papering over it: no source gives a
millimetre-per-point adjustment, and the 45–48% band it is judged against is
itself forum aggregate rather than study. A flag the rider weighs on a test ride
is defensible; a silent nudge to the window would not be.

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

Road and tri, loaded by the API's `category` (`road` or `triathlon`). ~15 models
in v1 — roughly 90 rows, enough to find every schema problem that 100 would. The matcher is tested against a synthetic table, never
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

**Optional per size: `barWidth` and `crankLength`**, the stock build's spec
where the maker publishes it. Giant does; Trek's charts carry neither, so those
rows simply omit the fields and the shortlist prints no spec line for them.
Where the spec exists the shortlist shows it against BuyFit's own band —
"440 mm bars (wider than your band)" — which is a reality check on two `Weak`
outputs rather than a score: a stock bar outside the band is a swap, not a
reason to reject a frame.

Giant does not state **which** handlebar width convention its figure uses, and
the UCI regulates three. The comparison is therefore approximate, and the
row's source note records that.

### Matching

Filter to the window, sort by distance from its centre, list **every** model
and size that fits with its mm deltas. Never a single winner, never a 0–100
score: the window usually contains several sizes across several bikes, which is
the true answer and the useful one when a shop has three of them in stock.

**Sizes with no height band.** Some makers (Cervélo, BMC) publish stack and
reach but no rider-height range. Such a size never contributes to the window:
the window is still the spread of the banded rows. But it is listed when its
stack and reach both fall inside the window (edges inclusive), flagged
`noHeightBand`, with the note "no height range published — listed because its
stack and reach are inside your window". A size with no stack or no reach
(Orbea Ordu) cannot match at all. Null is never read as 0, which would drag the
window's minimum to 0.

### Preference, and why it is allowed to exist

Body measurements cannot rank two bikes that both fit — the Madone ML and the
Domane SLR ML come back at an identical distance from the window centre. A
**preference** breaks that tie, and it is honest by construction: the rider
states what they want rather than being told what they are.

One preference only: **riding position**, racier or more upright, split on the
bike's stack-to-reach ratio. The research doc permits this ratio to classify
*bikes* while refusing it as a rider target, so it may sort a shortlist and may
never predict a body.

**The split is the median of the rider's own matches, not a fixed threshold.**
The retailer convention of 1.50 was tried first and failed on real data: the
ratio rises with frame size, so at 1600 mm every match came out "racier",
including both Domane trims, which are Trek's endurance bikes. The upright
group rendered empty. Relative means "racier than half of what fits you",
which is all this ratio was ever licensed to say. With fewer than two matches,
or when every match shares one ratio, the shortlist is shown unsplit.

The shortlist shows **both groups, always**, with the preferred one first and
labelled. Filtering would risk an empty list against a small database, and
re-ranking alone would hide why a bike placed where it did. An empty group is
reported as a gap in the data, not a verdict on the bikes.

Budget, groupset and brand are deliberately absent: they are properties of a
*build*, not a frame. One Domane SLR exists at several prices with identical
geometry, so a price field would need a whole build-level table under every
frame.

### Tri mode

A **Road / Triathlon** switch on the form (default road, saved with the
measurements; a save from before the switch reads as road). Tri loads the
`triathlon` category and matches the same way, with these output changes, from
`doc/frame-sizing-research.md` §9:

- **Saddle height** keeps the road band, 0.870–0.895 × inseam, with a note that
  fitters move it about 1 cm either way on a tri bike, and nose-forward saddles
  (ISM) usually start about 5 mm lower. The tri shift is Weak, so none is applied.
- **Crank length** is 165 mm, with "155–160 mm is fine if your hip feels closed
  at the top of the stroke". Riding preference does not change it in tri.
- **Handlebar width** is not shown. Tri bars are set in a fit, and no source
  gives a body rule.
- **Saddle width** is sit bones + 10 mm, labelled "conventional saddle only",
  with a note that nose-forward tri saddles are not sized from sit-bone width.
  The riding allowance does not apply.
- **Frame list** is labelled a coarse filter, because the front end adds most
  of the stack and adjacent sizes overlap (§9.5).

Riding preference stays on in tri. It still splits the shortlist into the
racier and more upright halves, which is a bike-character sort and not a
saddle or crank output.

### Headline size

The results screen opens with "your size is roughly X" — the most common size
label among bikes whose maker lists the rider's height, with every tied label
shown rather than one picked. Its ⓘ panel carries the `No source` level and states that
two bikes both marked 54 can differ by 50 mm of stack.

Since 2026-09-27 it heads the results, next to a body outline labelled with
the rider's three measurements and above the inseam-to-height gauge (41–52%,
the usual 45–48% band shaded, neutral colours). The gauge reports the ratio
and still applies it to nothing.

It exists because "what frame size am I?" is the question people arrive with,
and a page that refuses to answer it sends them to a calculator-clone site that
will. The badge and the shortlist underneath carry the honesty.

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

- MTB, in both the formulas and the database. Tri is in (see Tri mode): its
  geometry is a different fit problem, so tri outputs are their own, not road
  rules reused.
- Flexibility tests of any kind.
- Foot length field.
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
