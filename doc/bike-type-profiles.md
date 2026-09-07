# Bike-type profiles — agreed design

Status: **designed and confirmed, not implemented.** Settled in a grilling
session on 2026-09-03. Implementation is deliberately deferred.

Blocked on one gate: the target ranges are being researched into
`doc/fit-targets-research.md`, and **no number enters code until that document
is signed off**. That sign-off is separate from the design confirmation
recorded here.

This reverses a previous non-goal. PROGRESS.md listed "no riding-discipline
profile switcher (one road-endurance default constant set in
`lib/fit_targets.dart`)" as deliberately out of scope. It is now in scope; the
non-goals section needs updating when this ships.

## What it is

A rider-selected bike type that swaps which set of fit targets the results are
scored against. Three profiles:

- **road** — explicitly the *endurance* set, labelled as such in the UI and
  here, so nobody scores a race/criterium position against it
- **mountain** — trail/XC
- **triathlon** — rider on aerobars

## Why the user picks it, rather than the app detecting it

ML Kit detects body landmarks only, not bike parts. Classifying the bike from
a frame would mean training and bundling a separate model — app size, latency,
and a new failure mode — to save a single tap.

A misclassification is silent and total: bike type selects the target ranges,
so a tri bike scored as a road bike flips every verdict, and the user is never
asked, so nobody catches it. The distinguishing features are also exactly what
a side-on frame hides or a fit changes — aerobars behind the rider's arms, seat
tube angle obscured by the leg, bar shape at the edge of frame. A road bike
with clip-on aerobars is genuinely ambiguous, and that rider is precisely the
one who wants tri numbers.

The rider knows their own bike with certainty and zero effort.

## Decisions

**Selection UI.** A `SegmentedButton` on the existing setup screen, above wheel
diameter — the other thing you set per-bike. Defaults to road. Chosen once
before calibration, immutable for the rest of the flow. No new step in the
pipeline.

**No persistence.** The choice resets to road each run. Persisting it means
adding `shared_preferences`, the project's first storage dependency, which is a
bigger decision than this feature deserves and belongs with the still-open
"should we save results at all" question.

**Data shape.** `enum BikeType { road, mountain, triathlon }` plus a
`const class FitProfile` holding the six ranges, with one const instance per
discipline. `FitTargets.isGood` / `isWarning` / `isPoor` are already generic
over `(value, min, max)` and need no change.

Rejected: per-discipline prefixed flat constants (triples the constant count
and pushes switching into the UI) and a `Map<BikeType, …>` (loses const-ness
and compile-time exhaustiveness).

**Threading.** A `bikeType` key in the existing `Map<String, dynamic>` route
arguments, carried setup → calibration → pedaling → bike point → results, the
same path `wheelDiameter` already takes. It is needed in two places:
`bike_point_screen.dart` for the KOPS sign, `results_screen.dart` for the
ranges.

Known cost, accepted: those argument maps are long and stringly-typed, so a
wrong key fails at runtime rather than at compile time. Fixing that is a
refactor of its own and is explicitly *not* being smuggled into this feature.

**KOPS becomes signed.** Positive means the knee is ahead of the pedal spindle.
It gets a per-discipline target range and is scored with the existing helpers —
tri fits deliberately place the knee ahead of the spindle, so the current
unsigned value cannot distinguish correct-for-tri from badly-wrong-for-road.

Displayed in words: "12 mm ahead of spindle" / "8 mm behind spindle". Never a
bare `+12` — a leading sign is easy to miss and meaningless without knowing the
convention, and this is the one value on the screen whose sign carries the
entire meaning.

**Mirrored captures are handled by convention, not detection.** Signing KOPS
means a drive-side or mirrored capture yields a confidently wrong-signed result
instead of a merely odd one. The convention (non-drive/left side, front wheel
to the right of frame) gets stated loudly on the how-to screen and on the bike
point screen.

Detection was rejected: ML Kit labels left/right body landmarks, but on a 2D
side-on view of a rider those labels are exactly what a mirrored frame
corrupts, so the detector is unreliable in precisely the case it is needed for.
Asking the user to confirm direction after every calibration photo adds a step
to every capture to catch a rare error.

**This is the least firmly held decision in the set** — revisit it first if
on-device testing shows mirrored captures actually happen.

**Saddle height stays unscored.** An absolute bottom-bracket-to-saddle-top
figure is dominated by rider inseam, which this app never measures — 720 mm is
correct for one rider and badly wrong for another, and discipline barely moves
it compared to leg length. It remains reported-only regardless of what the
research returns, useful for comparing your own bike before and after a change.
Scoring it would need a rider-measurement input, which is its own feature.

**Missing numbers surface as missing.** Where the literature has no
discipline-specific value, that metric renders unscored and grey, labelled "no
established target". It must never silently fall back to the road range — that
produces a confident green or red from a number nobody stands behind, invisible
both in the UI and in code review. An explicit gap also shows where more
research would pay.

**Road gets re-sourced too.** The existing four ranges are unvalidated
placeholders predating this work; they are replaced from the same document as
the other two. Leaving a known-doubtful number because it is already in the
file would make road — the profile most people use — the only unsourced one.
Consequence: results for a road fit run before this change may differ
afterwards. That belongs in the commit message and in PROGRESS.md.

**Results screen states its profile**, in a header and in each target line. The
same 52° torso is a pass or a fail depending on a choice made four screens
earlier, so a screenshot without the profile named is not interpretable later.

**Fitting Tables shows all three** disciplines at once. It is a reference screen
reachable from home with no fit in progress, it has nowhere to inherit a
selection from, and comparing disciplines is the interesting thing to do on it.

## Scope boundaries

A profile changes the four angle ranges and the KOPS interpretation. It does
**not** change:

- the capture guidance — camera distance, height and angle do not vary by bike
- the plausibility guard bounds in `angle_utils.dart` — a tri bike is still
  physically a bike
- which landmarks a metric is computed from

**Elbow angle on a tri bike** is a different *range* (~90° on aerobars, versus
150–165° on the hoods), not a different measurement. If the research shows a
metric is genuinely meaningless for a discipline rather than merely different,
the fallback is to mark it not-applicable and hide it — not to redefine its
landmarks.

## Deliberately still out

Splitting road into race vs endurance, adding gravel, persisting the selection,
and inseam-based saddle-height scoring. Each is a clean addition given this
shape; none is needed now.

## Implementation sequence

1. Research completes into `doc/fit-targets-research.md`.
2. **Numbers signed off** — the gate.
3. `fit_targets.dart` restructured to the enum + `FitProfile` shape.
4. Picker on setup, `bikeType` threaded through the route arguments.
5. Signed KOPS in `bike_point_screen.dart`, worded display and scoring on
   results.
6. Results header and per-line profile naming; Fitting Tables shows all three.
7. Tests: profile lookup, the KOPS sign convention, and the "no established
   target" rendering path.

Blast radius is small — `FitTargets` currently has exactly two consumers, the
tables list in `home_screen.dart` and `results_screen.dart`, and no test covers
it today.

## Context this does not fix

Pre-existing and unchanged by this work: nothing has run on a real device yet,
and both the plausibility guard bounds and the how-to capture numbers are
reasoned rather than measured.

---

# Research outcome (2026-09-03)

`doc/fit-targets-research.md` is complete. Numbers are **not yet signed off** and
nothing below has been implemented. Three findings change the design agreed
above; they need decisions before implementation starts.

## The design survives, with one exception

Confirmed by the research:

- **Saddle height unscored (Q14) was right, and more strongly than we knew.**
  No absolute mm target exists at any discipline — the figure is only
  interpretable as a fraction of inseam (LeMond 0.883 x inseam, Hamley 1.09 x
  inseam to the pedal axle; a peer-reviewed comparison found no significant
  difference between the methods, p = 0.917). Keep it as a reported observation.
- **Tri elbow angle is a definitional change (Q3), not just a range change** —
  90-110 degrees on aerobars versus 150-170 on the hoods. Confirmed two ways.
  Under Q3 (a) this is still handled as a range swap.
- **Re-sourcing road (Q16) was right.** Three of the four placeholders are wrong
  or off: `kneeFlexion 25-35` is the *static* goniometry range and a video method
  should use 30-40; `torsoAngle 45-55` is ~5 degrees upright of the sourced
  40-50; `elbowAngle 150-165` should be 150-170.
- **Tri KOPS is positive** — unanimous across sources on the sign.

## Finding 1: `hipAngle 40-50` was a live bug in shipped code — FIXED

Not a bad range — the wrong end of the pedal stroke. Effectively every published
hip-angle target is the *minimum*, at top of stroke. The app samples at bottom
of stroke, which yields the *maximum*, roughly 45-50 degrees larger.

Verified independently of the research: with the torso 45 degrees above
horizontal (hip->shoulder direction (0.707, 0.707)) and the thigh ~57 degrees
below horizontal at BDC (hip->knee direction (0.545, -0.839)), the interior
angle is acos(-0.208) ~ 102 degrees. The sourced BDC range is 90-105.

**A 40-50 target at BDC is geometrically unreachable, so the app scored every
rider's hip angle red no matter how they sat.**

Fixed independently of this feature, ahead of the numbers sign-off, since the
old value was not merely doubtful but impossible. `FitTargets.hipAngle` is now
90-105 with the sampling point documented, and
`test/angle_utils_test.dart` guards it by reconstruction. The remaining road
placeholders (`kneeFlexion 25-35`, `torsoAngle 45-55`, `elbowAngle 150-165`)
are still unchanged and still gated on sign-off — they are wrong-ish, not
impossible.

## Finding 2: KOPS landmark mismatch, ~20-40 mm systematic

Published KOPS figures in mm are measured to the **tibial tuberosity**. The app
uses the **pose knee-joint centre**, roughly 30-40 mm posterior to it. So app
readings will sit systematically 20-40 mm negative against a fitter's plumb
line — an offset wider than the entire proposed road target range (-40 to 0 mm).

Consequence for the agreed design: the signed-KOPS scoring from Q4 cannot use
published plumb-line numbers directly. Calibrate against marker/pose-based
sources (Velogic) rather than plumb-line ones (SportCoaching), and treat the
road KOPS range as the softest number in the whole set.

The research also documents a substantial body of opinion that KOPS is a poor
fitting metric at all — Bontrager's "The Myth of K.O.P.S." and Steve Hogg ("I
don't own a plumb line... It is irrelevant"). Worth surfacing in the UI next to
the KOPS card.

## Finding 3: mountain bike is mostly unsourced

No fit-system vendor publishes an MTB metrics table. Velogic has road and
triathlon pages and no MTB page (404, absent from sitemap); BikeFittr's chart is
road and tri only; Fit Kit Systems' MTB guide deliberately publishes no numeric
angle targets.

Sourcing by metric: `kneeFlexion` weak (one named source, internally
inconsistent with the agreed saddle drop), `hipAngle` **none**, `torsoAngle`
**none**, `elbowAngle` **none**, `KOPS` one secondary source, `saddleHeight`
direction agreed but magnitude never measured.

Under Q15 as agreed ("no established target", never a silent road fallback),
**three of the four MTB angles render grey and unscored** — the MTB profile
would ship able to score only knee flexion. That is honest, and it is also
close to useless.

**This is the open decision.** Options:

- **(a)** Hold Q15 exactly: ship MTB with three unscored metrics and a visible
  note. Honest, nearly inert.
- **(b)** Ship road ranges under MTB, labelled in the UI as "not
  discipline-specific". Scores something, is explicit that it is borrowed.
- **(c)** Ship the researcher's derived numbers, labelled "derived, unsourced".
  Looks authoritative, has nothing behind it. The research doc itself
  recommends against this.
- **(d)** Ship road and triathlon only; drop MTB until a source exists.

Nothing here is decided. My read is (b) over (a): a borrowed-and-labelled range
is more useful than a grey dash and no less honest, since the label carries the
same information. (c) is the one to avoid — it is the silent-road-fallback
failure from Q15 wearing a disguise.

## Other things worth knowing

- **Do not cite the "hip angle ~100 degrees" figure quoted everywhere in tri
  fitting** as support for the app's hip angle. That is FIST's
  BB-trochanter-acromion static angle, an unrelated quantity that lands near the
  same number by coincidence.
- **Tri `kneeFlexion` sources disagree on the direction** of the difference from
  road: BikeFittr says less flexion, Bike Fit Adviser more, Velogic none. The
  proposed 30-42 is a union of disagreeing sources, not a consensus.
- **Tri `torsoAngle`** has a large elite (10-15) versus age-grouper (20-30)
  split; the proposed 12-25 straddles it and will be wrong for both ends.
- **Phil Burt's and Andy Pruitt's books were not accessible** and contribute
  nothing beyond the 1994 Holmes/Pruitt/Whalen paper. Checking road
  `torsoAngle`, `elbowAngle` and the MTB rows against them in print is the
  highest-value follow-up.
- The app samples at 6 o'clock while Ferrer-Roca's protocol measures with the
  crank aligned with the seat tube, so app readings run ~1-3 degrees more flexed
  than that source. Within noise, but systematic.
