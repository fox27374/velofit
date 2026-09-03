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
