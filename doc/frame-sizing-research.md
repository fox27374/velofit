# Frame sizing from static body measurements: sourced reference

Research date: 2026-09-21. Companion to `doc/fit-targets-research.md`, same conventions and
the same rule: every number traceable to a named source, or marked derived/unverified.

**Scope.** Predicting frame size or target frame geometry from body measurements alone —
height, inseam, arm length, torso length, shoulder width, foot length, and a flexibility
self-rating. No video. No measurement of an existing bike. That last constraint is doing
most of the damage in this document: nearly every method below that actually works needs
either a fit bike, a rider on a trainer, or a known-good bike to copy.

**Headline.** One output (saddle height) is well supported and still has a ±20–25 mm honest
band. Two (handlebar width, crank length) are defensible as *bands* rather than numbers, and
for crank length the best evidence says the number barely matters. Everything else — reach,
top tube, setback, stem length, drop, and the frame size label itself — is either unsupported
by the one peer-reviewed regression that tested it, or unmeasurable in a way that survives
brand-to-brand comparison. See §5 for what the app should actually print.

---

## 0. Conventions

| Term | Definition used here |
|---|---|
| `inseam` | Barefoot crotch-to-floor, measured against a wall with a rigid straight-edge pulled firmly up. Not a trouser inseam. This is the input every published formula assumes. |
| `saddle height` | BB centre to saddle top **along the seat tube** (same as the app's). Hamley's convention differs — see §1.2. |
| `stack` | Vertical, BB centre to top-of-head-tube centre. |
| `reach` | Horizontal, BB centre to top-of-head-tube centre. |
| `effective top tube` (ETT) | Horizontal BB-to-seat-tube-axis... actually horizontal head-tube-top to seat-tube-axis intersection. Depends on seat angle, which is why it is not comparable across brands (§4.2). |
| `saddle–bar drop` | Vertical saddle top to bar top. A **fit** measurement, not a frame measurement. |
| `handlebar width` | Ambiguous by default: centre-to-centre or outside-to-outside, at the hoods or at the drops. The UCI now regulates three of these separately (§3.1). |

**Frame geometry vs. fit coordinates.** Two different things get called "frame size":

1. **Frame geometry** — stack, reach, seat tube, top tube. A property of the bike.
2. **Fit coordinates** — where the saddle top and bar top sit relative to the BB. A property
   of the *rider on a bike*, achieved by frame + stem + spacers + seatpost + saddle rails.

A body-measurement form can only aspire to (2), and can only convert (2) into (1) if it also
knows the stem, spacer stack, seatpost setback and saddle rail position you intend to use.
Most calculators silently assume a stem length and a spacer stack. Competitive Cyclist's
does; it outputs a stem length as one of its results, which is how it closes the system.

---

## 1. Inventory of methods

### 1.1 Competitive Cyclist "Fit Calculator" (Competitive Fit / Eddy Fit / French Fit)

| | |
|---|---|
| **Inputs** | 8 measurements: inseam, trunk, forearm, arm, thigh, lower leg, sternal notch, total height. |
| **Outputs** | Seat tube C-C, seat tube C-T, (effective) top tube, stem length, BB-to-saddle, saddle-to-handlebar, saddle setback. Three columns, one per method. |
| **Published?** | **No.** No formula, no derivation, no citation is published anywhere I could find. |
| **Provenance** | Unclear and partly marketing. The site itself is geo-blocked from the EU (both `/bike-fit-calculator` and `/docs/competitivecyclist/fitcal/road-fit.pdf` 302 to `static.backcountry.com/eu/bc_eu.html`), so the live page could not be read directly for this document — input/output lists above are reconstructed from forum and secondary reports and should be treated as **unverified in detail**. |

On the three methods:

- **Competitive Fit** — smallest frame, longest stem, largest saddle-to-bar drop.
- **Eddy Fit** — larger frame, less drop, more upright. Named after Eddy Merckx. One
  secondary source is blunt that the name is invention: "Eddy-fit is a clever term created
  by the Competitive Cyclist to let bicyclists feel at ease with sitting more upright than
  current fashion dictates" — i.e. **not a documented reconstruction of Merckx's position**.
  Treat the attribution to Merckx as marketing, not provenance.
- **French Fit** — largest frame, most upright.

The "French Fit" almost certainly descends from the **Genzling** method (Claude Genzling,
co-author with Bernard Hinault of *Road Racing Technique and Training*, chapter "Morphology,
Position and Frame Design"), which is the French anthropometric sizing tradition and which
uses a seven-measurement protocol including a trunk measure taken from the sternal notch —
exactly matching Competitive Cyclist's unusual "sternal notch" input. **This link is an
inference, not a documented fact.** Genzling is real and peer-referenced (Millour & Bertucci
2017 compare Genzling against Hamley); the identification of "French Fit" with it is mine.

Widely reposted claims that the calculator uses `frame size = inseam × 0.65` and
`saddle height = inseam × 0.883` appear only on SEO calculator-clone sites
(calculator.city, citicalculator.com). **There is no traceable origin for the 0.65 figure**
and it should not be presented as Competitive Cyclist's algorithm. The 0.883 is LeMond's
(§1.2) and is not specific to this calculator.

### 1.2 LeMond / Guimard: saddle height = 0.883 × inseam

| | |
|---|---|
| **Input** | Inseam (mm) |
| **Output** | Saddle height, BB centre to saddle top along the seat tube |
| **Published?** | Yes, as a chart and a multiplier, in *Greg LeMond's Complete Book of Bicycling*. No derivation or dataset is published. |
| **Provenance** | Not LeMond's. Developed by his coach **Cyrille Guimard** in the early 1980s working with LeMond and Hinault; some accounts add Dr. Ginet. The empirical basis — what was measured, on whom, against what criterion — has never been published. |

LeMond's book also contains a **frame sizing chart** keyed to inseam. That chart is the
origin of the widely-quoted "seat tube ≈ 0.65 × inseam" family of rules. I could not locate
a primary reproduction of the chart with its multipliers; **treat any specific LeMond frame
multiplier as unverified.** It is in any case a *seat tube* number, which §4.2 shows is not
comparable across brands.

### 1.3 Hamley & Thomas: 109% of inseam

| | |
|---|---|
| **Input** | Inseam |
| **Output** | Saddle top to **pedal axle** (pedal at its lowest point) = 1.09 × inseam. Convert to app convention by subtracting crank length. |
| **Published?** | **Yes — this is the only saddle-height rule with a real primary paper.** Hamley EJ, Thomas V, "Physiological and postural factors in the calibration of the bicycle ergometer", *J Physiol*, 1967. |
| **Provenance** | Ergometer power-optimisation study. Faria & Cavanagh (1978) are widely cited as confirming ~1% power loss per 1% deviation from 109% — **I did not verify this against the Faria & Cavanagh primary text; treat as unverified relay.** |

Crank-inclusive vs crank-exclusive is the whole difference between Hamley and LeMond, and it
is why they agree to ~1.5 mm at 172.5 mm cranks and drift apart elsewhere (see
`fit-targets-research.md` §1). Hamley predates clipless pedals, so shoe/cleat stack is
unaccounted for.

**The important result about this formula is negative.** Peveler & Green (2011) found that
setting saddle height to 109% of inseam put the rider **outside** the 25–35° knee-angle
window **73% of the time**. Since LeMond and Hamley agree to ~1.5 mm, LeMond inherits that
miss rate. The stated reason is that inseam does not decompose into femur, tibia and foot
length, and those distribute differently between riders at equal inseam.

### 1.4 Kirby Palm (0.216 × inseam) and Zinn (0.21 × inseam): crank length

| | |
|---|---|
| **Input** | Inseam |
| **Output** | Crank length |
| **Published?** | Palm's derivation is published in full, on a personal website (nettally.com/palmk), with the reasoning shown. Zinn's 0.21 appears in his Velo tech Q&A columns. |
| **Provenance** | **Neither is empirical.** Palm's is an argued geometric derivation, not a fit to data. Zinn's is professional judgement from a custom framebuilder. There is no study behind either multiplier. |

See §3.2: the peer-reviewed evidence is that this precision is unwarranted in both directions.

### 1.5 Stack/reach matching (Slowtwitch, Bike Insights, fitter practice)

| | |
|---|---|
| **Input** | A *known* pair of fit coordinates — bar X/Y relative to BB — obtained from a fit session or from a bike you already know fits. |
| **Output** | A shortlist of frames whose stack and reach, plus a realistic stem and spacer stack, can place the bars there. |
| **Published?** | The *method* is fully published and is simple arithmetic. |
| **Provenance** | Stack and reach as a sizing language were introduced by **Dan Empfield** at Slowtwitch (the earliest primer chapter located is bylined "Slowman", 19 Feb 2003); road.cc instead credits **Cervélo** with popularising them. Both are probably partly right — Empfield coined the terms, Cervélo pushed them into mainstream spec sheets. The discrepancy is noted rather than resolved. |

**This is the only method in the list that is honest arithmetic rather than a black box, and
it is precisely the one that does not work from body measurements.** It needs a target bar
position, which needs a bike. Quoting the Slowtwitch primer: "You can't be led by the
geometry of the bike. You have to determine where you need to be 'in space' and then find
the right bike to place underneath you." Body measurements do not tell you where in space.

Bike Insights is a geometry database with comparison tooling and an "Upright–Aggressive"
scale; it offers "personalised sizing guidance" behind a profile. Its sizing methodology is
not published and its geometry data is partly crowd-contributed ("any user can add a new bike
if it isn't already on the site"). Useful as a data source, **not** as a sizing authority.

### 1.6 Brand size charts driven by height alone

| | |
|---|---|
| **Input** | Height. Occasionally inseam as a tiebreak. |
| **Output** | A size label ("56", "M", "L"). |
| **Published?** | Yes, per brand. |
| **Provenance** | None stated by any brand located. No brand publishes the dataset, the fit criterion, or the tolerance. |

The charts are not wrong so much as low-information: they map one scalar to a label whose
meaning is brand-specific (§4.2). Trek's public sizing guide URL used in this research
returned 404, so **no brand chart was read directly for this document**; the criticism below
rests on published geometry tables rather than on the charts themselves.

### 1.7 Retül Match / Specialized Body Geometry

| | |
|---|---|
| **Input** | A short questionnaire (gender, bike type, self-selected upright/middle/low position) plus body measurements taken in-store with the Retül **Zin wand** on a Match tower. |
| **Output** | A recommended bike size and starting saddle height, plus Specialized product recommendations (saddle width, shoe, footbed). |
| **Published?** | **No.** Entirely proprietary. No formula, no validation study, no published accuracy claim. |
| **Provenance** | Retül–Specialized partnership since 2012. Explicitly positioned as an entry-level pre-fit sizing aid for riders "who wouldn't know the difference between fork rake and stem rise", not as a fit. |

Relevant to this project as an **existence proof of the product shape** — a measurement-driven
size recommendation — but it contributes no numbers, and it is measured with a calibrated
wand by a trained operator rather than by a rider with a tape measure at home.

### 1.8 Trek Precision Fit, Cyclefit, and studio fitting generally

| | |
|---|---|
| **Input** | Interview, physical assessment (range of motion, flexibility), then the rider on their own bike or a fit bike with 2D motion capture. |
| **Output** | Adjusted bike, plus recommended size for a future purchase. |
| **Published?** | Process descriptions are published. **No algorithm, no numeric targets, no validation data.** |

Trek Precision Fit is explicitly *not* a body-measurement-to-size calculator: the sizing
recommendation is an output of the fit session, not an input to it. I found **no published
Cyclefit methodology** at all beyond marketing copy — treat Cyclefit as unverified.

These are listed mainly as negative evidence: the established commercial systems that could
publish anthropometric sizing regressions have chosen not to, and the ones with the largest
datasets (Retül, MyVeloFit) publish assertions without numbers (§3.1).

### 1.9 Peer-reviewed work

**The single most relevant paper is Holliday & Swart (2021).** It is the only located study
that attempts exactly what this feature wants: predict bike configuration from anthropometry.

> Holliday W, Swart J. "Anthropometrics, flexibility and training history as determinants for
> bicycle configuration." *Sports Medicine and Health Science* 2021;3(2):93–100.
> DOI: 10.1016/j.smhs.2021.02.007. PMC9219349.

n = 50 well-trained male cyclists, own bikes, freely chosen positions. Multivariate linear
regression onto four outputs:

| Output | Result | Adjusted R² |
|---|---|---|
| **Saddle height** | Significant. Predictors: trochanteric leg length (p < 0.01), Knee Extension Angle test (p < 0.01), modified Schober test (p = 0.04) | **0.46** |
| **Handlebar drop** | Significant. Predictor: Knee Extension Angle test (p = 0.01) | **0.25** |
| **Saddle setback** | **Not significant** (F₆,₂₇ = 1.39) | 0.07 |
| **Handlebar reach** | **Not significant** (F₆,₃₅ = 0.40) | **−0.10** |

Reported coefficients: saddle height +0.39 cm per cm of leg length, +0.08 cm per degree of
KEA, +0.6 cm per cm of mSchober improvement; handlebar drop +0.09% per degree of KEA.

Authors' own caveat, quoted: "we cannot determine exact predictions based on the measured
variables alone", and bicycle configuration "is not an exact science".

*Provenance note:* the regression table above was extracted from the PMC full text by
automated reading, not transcribed from the printed tables. The signs, magnitudes and
p-values should be checked against the PDF before any of it is shipped as a formula.

**What this paper means for the feature, stated plainly:** two of the four quantities a
frame-sizing form most wants to output — **reach and setback** — were *not predictable from
anthropometry at all* in trained cyclists. Handlebar reach came back with a **negative**
adjusted R², which is what you get when the model is worse than the sample mean. Arm length
was measured and did not survive into any model. Stature was measured and did not survive
into the saddle-height model; **trochanteric leg length did**.

Supporting and adjacent:

- **Husband et al. (2024)**, systematic review, 47 studies / 724 participants: saddle height,
  trunk angle and saddle fore-aft have real positional effects, but "**there are no clear
  recommendations for crank length, handlebar height, Q factor or cleat position**".
- **Grainger et al. (2017)**, *Applied Ergonomics*, n = 142 children aged 7–16 on an
  adjustable fitting rig: seat height predictable from inside leg (R² > 0.999), reach from
  torso + arm length (R² = 0.649), rise weakly (R² = 0.231). **Do not transfer these R²
  values to adults.** A sample spanning ages 7–16 is dominated by growth; almost any body
  dimension correlates with almost any other across that range, which is why seat height
  reaches R² > 0.999 — a value that does not occur in real adult data. The *ordering*
  (height >> reach >> drop) is the transferable finding, and it matches Holliday & Swart.
- **Millour & Bertucci (2017)**, *Comput Methods Biomech Biomed Engin*, "Comparison of
  Genzling method vs Hamley method allowing a postural adjustment in cycling: preliminary
  study". Confirms that inconsistencies exist between the static inseam-based methods.
  Preliminary, small; not used for numbers here.
- **Peveler & Green (2011)**, JSCR 25(3):629–633, and **Peveler (2008)**, JSCR — the 73%
  miss-rate result in §1.3.
- **ISO 4210 / ISO 8098** — checked and **not relevant**. ISO 4210 is a bicycle *safety*
  standard; it partitions bicycles by maximum saddle height (≥635 mm; ISO 8098 covers
  435–635 mm) purely to decide which test regime applies. **There is no ISO or CEN standard
  that specifies frame sizing from body measurements**, and no standard definition of a
  bicycle "size". This is a genuine negative finding worth stating in the UI.

**False lead, recorded so nobody repeats the search:** Peters DM & Eston RG, "Prediction and
measurement of frame size in young adult males", *J Sports Sci* 1993;11(1):9–15. Despite the
title, "frame size" here means **skeletal body build** (small/medium/large), not bicycle
frames. It is about elbow breadth and wrist girth. Irrelevant.

---

## 2. Which outputs are defensible

Tolerance bands below are the honest width, not the marketing width. Where a band is derived
rather than sourced, it says so and shows the arithmetic.

| Output | Best evidence for a body-measurement target | Honest band | Verdict |
|---|---|---|---|
| **Saddle height** | LeMond 0.883 × inseam; Hamley 1.09 × inseam; Holliday adj R² = 0.46 | **±20–25 mm** | **Print it**, as a range, labelled "starting point" |
| **Handlebar width** | Lin et al. 2025 (n = 10); universal fitter convention ≈ shoulder width | **±20 mm / one size step** | **Print a band** |
| **Crank length** | Martin & Spirduso 2001; Li et al. 2025; Husband 2024 review | Evidence says **any of 165–175 is fine** for most riders | **Print a permissive range and say why** |
| **Saddle–bar drop** | Holliday adj R² = 0.25, and the predictor is *flexibility*, not anthropometry | **±30 mm at best** | Borderline — see §5 |
| **Frame stack** | Indirect only (via saddle height + a drop assumption + a spacer assumption) | ±30–40 mm | **Search window only**, never a target |
| **Frame reach** | **Holliday adj R² = −0.10.** No predictive relationship found | — | **Refuse** |
| **Effective top tube** | Same as reach, plus seat-angle dependence (§4.2) | — | **Refuse** |
| **Seat tube length** | Folklore multipliers with no traceable origin | — | **Refuse** |
| **Stack-to-reach ratio** | Classifies *bikes*, not riders | — | **Refuse as a target**; fine as a filter label |
| **Saddle setback** | **Holliday adj R² = 0.07 (n.s.)**; KOPS rejected by Bontrager and Hogg | — | **Refuse** |
| **Stem length** | No published rule located, at all | — | **Refuse** |
| **Size label ("56", "M")** | Means different things per brand (§4.2) | — | **Refuse**, or print per-brand |

### 2.1 Saddle height — the one that works, and how well

Two independent lineages (Guimard's empirical multiplier, Hamley's ergometer study) agree to
~1.5 mm at 172.5 mm cranks, and a peer-reviewed comparison found no significant difference
between them (p = 0.917; recorded in `fit-targets-research.md` §1). That is real agreement.

The honest band is nevertheless wide, by two independent routes:

1. **Empirical.** Peveler & Green: 109% of inseam lands outside the 25–35° knee-angle window
   **73% of the time**. Not "occasionally wrong" — usually outside the window.
2. **Derived from Holliday's R².** Adjusted R² = 0.46 means the model explains under half the
   variance. With a typical between-rider saddle-height SD of ~30 mm in trained male
   cyclists (*assumed, not sourced — flagged*), residual SD ≈ √(1 − 0.46) × 30 ≈ **22 mm**,
   so a 95% interval is roughly **±44 mm**. Cross-checking against knee angle via
   Ferrer-Roca's ~2.5–3° per 10 mm gives ±22 mm ≈ ±6°, which spans the entire 30–40° target
   range — consistent with Peveler's 73%.

**So: 0.870–0.895 × inseam is a legitimate starting range, and a claim of millimetre
precision from inseam alone is refuted by the literature.** The app should print the range
and say what it is: where to put the post before the first ride, not where it should end up.

### 2.2 Stack — usable only as a search window

You cannot derive a stack target from body measurements. You *can* derive a plausibility
window, and it is worth being explicit that this is a different and much weaker claim:

- Saddle height from §2.1 sets roughly how far the saddle is above the BB.
- A drop assumption (flexibility-conditional, Holliday adj R² = 0.25) sets roughly how far
  below the saddle the bars want to be.
- A spacer/stem assumption converts bar height into head-tube-top height, i.e. stack.

Every step adds error, and the last two are assumptions rather than measurements. The output
is "frames whose stack is within roughly ±30–40 mm of X are worth looking at", which is a
shortlisting filter. It is not a target, and presenting it as one would be the exact
pseudo-precision this document exists to prevent.

### 2.3 Reach, top tube, stem, setback — refuse

Holliday & Swart tested handlebar reach and saddle setback against anthropometry on 50
trained cyclists and found nothing (adj R² = −0.10 and 0.07). That is the best available
evidence and it is a null result on exactly these quantities. Nothing else located
contradicts it. Stem length has no published rule at all — the "forearm length" folklore is
untraceable.

Torso length and arm length feel like they should predict reach. The one adult study that
tested them says they do not. Children's data says they partly do (R² = 0.649), which is
explained by growth (§1.9).

---

## 3. Handlebar width and crank length, in detail

### 3.1 Handlebar width from shoulder width

**The convention.** Handlebar width ≈ biacromial (shoulder) width is the closest thing bike
fitting has to a universal rule. It is genuinely universal in practice, and it is genuinely
unvalidated: no study located establishes it as optimal against a criterion.

**The one direct experiment located:**

> Lin Z-J, Tsai P-C, Chen C-H. "Handlebar Width Choices Must Be Considered for Female
> Cyclists." *Journal of Functional Morphology and Kinesiology* 2025;10(1):28.
> DOI: 10.3390/jfmk10010028.

n = 10 healthy women (age 20.6 ± 1.4, shoulder width 33.2 ± 1.3 cm), riding at fixed 90 rpm
and 100 W across handlebar widths spanning 28–36 cm, with surface EMG and 3D motion capture.
Finding: a **medium width matching shoulder width** produced significantly lower biceps
brachii and latissimus dorsi activation than narrower widths and than the riders'
self-selected width, plus reduced hip range of motion.

Population reference values in the same paper: female mean shoulder width **32.9 ± 1.5 cm**,
male **38.1 ± 1.8 cm**, against a commercial handlebar range of **36–44 cm**.

**What this supports, honestly:** n = 10, one sex, one age band, one power output, one
cadence, no performance or comfort outcome over time. It supports "bar ≈ shoulder width is a
reasonable default and the market's narrow end is too wide for many women". It does **not**
support a precise width, and it does not support the popular "5–10% narrower than shoulders"
refinement — the study found *matching*, not narrower, minimised activation, and the "5–10%
narrower" rule appears only on commercial blogs with no source.

**The narrow-bar trend and what actually backs it.** The aerodynamic argument is real but the
numbers in circulation are not primary. Widely repeated claims — "8–12 W from 400 mm to
360 mm", "25 W per 2 cm of frontal width at 40 km/h", "2–4% drag reduction" — trace to
manufacturer and blog sources, not to published wind-tunnel data. **All of these should be
treated as unverified.** Directionally, narrower is faster; the magnitudes are not sourced.

**The UCI intervention is the best-documented part of the story**, and it is a primary source:

> UCI press release, "UCI statement on its recent decisions regarding changes to equipment
> regulations based on SafeR recommendations."
>
> - **400 mm** minimum between the two **outer** edges of the handlebar
> - **320 mm** minimum between the **inner** edges of the brake levers
> - **380 mm** minimum **centre-to-centre**
> - Maximum 50 mm between the inside of a brake lever and the outer edge of the bar on the same side
> - Road and cyclo-cross: **1 January 2026**. Track: **350 mm** outer minimum from **1 January 2027**.

Note that the UCI regulates three different width definitions simultaneously. Any app field
called "handlebar width" that does not say *which* of the three it means is ambiguous by
construction.

**The counter-argument, and its evidential status.** MyVeloFit (Dana Galley, 16 June 2025)
argued the 400 mm rule disadvantages smaller riders and women, asserting "the average optimal
handlebar width for women is 38 cm" and proposing a 280 mm inside-to-inside lever minimum
instead. Read directly: **the article publishes no sample size, no distribution, and no
percentage of affected riders**, despite MyVeloFit claiming the world's largest rider fit
database. The argument is very likely correct — Lin et al.'s population means point the same
way — but as published it is an assertion, not data. Named fitters made the same case in
Cyclingnews; that article could not be read in full (truncated fetch) and its specifics are
**unverified**.

**Defensible output:** shoulder width ± one size step (±20 mm), with an explicit statement of
which width definition is meant, and a note that the market may not stock the recommendation
at the narrow end.

### 3.2 Crank length from inseam or height

**The formulas.** Kirby Palm: `crank = 0.216 × inseam`. Lennard Zinn: `0.21 × inseam`. Both
published, neither empirical — Palm's is an argued geometric derivation, Zinn's is
framebuilder judgement. A third figure, "20% of leg length or 41% of tibia length", is
attributed to Martin & Spirduso as the optimum for *maximal sprint power*; I found this only
via BikeRadar's reporting of the paper and **did not verify it in the primary text** — treat
as unverified relay.

**What the primary evidence actually says.**

> Martin JC, Spirduso WW. "Determinants of maximal cycling power: crank length, pedaling rate
> and pedal speed." *Eur J Appl Physiol* 2001;84:413–418. DOI: 10.1007/s004210100400.

n = 16 trained cyclists, maximal inertial-load ergometry at 120/145/170/195/220 mm. Maximum
power ranged from **1149 W (220 mm)** to **1194 W (145 mm)** — a **3.8% spread across an
83% change in crank length**. 145 and 170 mm were significantly better than 120 and 220 mm
(p < 0.05); 145 vs 170 was not separated. Optimal pedalling rate fell from 136 rpm at 120 mm
to 110 rpm at 220 mm; optimal pedal speed rose from 1.71 to 2.53 m/s.

> Li J et al. "Effects of crank length on cycling efficiency, sprint performance, and
> perceived fatigue in high-level amateur road cyclists." *J Exerc Sci Fit* 2025;23(3):175–180.
> DOI: 10.1016/j.jesf.2025.100384.

n = 28 trained male cyclists, 165 / 170 / 175 mm. **No effect on efficiency** at 60% VO₂max
(p = 0.36). **No effect on sprint peak power, average power or cadence** (p > 0.34).
**Perceived fatigue was significantly worse on 175 mm** (p < 0.001) than on 165 or 170.

> Husband SP, Wainwright B, Wilson F, Crump D, Mockler D, Carragher P, Nugent F, Simms C.
> "Cycling position optimisation — a systematic review of the impact of positional changes on
> biomechanical and physiological factors in cycling." *J Sports Sci* 2024.
> DOI: 10.1080/02640414.2024.2394752. 47 studies, 724 participants.

Conclusion, quoted: "**there are no clear recommendations for crank length**, handlebar
height, Q factor or cleat position."

Phil Burt, quoted in BikeRadar (Simon von Bromley, 26 Feb 2021): "The science is clear, crank
length is not important in sub-maximal power production, within a range of 80 mm to 300 mm."
That is a striking claim and it is a secondary quote — **unverified against a Burt primary
text** — but it is directionally consistent with all three papers above.

**The honest summary.** The performance case for a specific crank length is close to
non-existent across the range anyone actually sells (165–175 mm). The real reasons to go
shorter are (a) hip-angle closure at top dead centre for riders with limited hip flexion or
aggressive positions, and (b) perceived fatigue, which is the one thing Li et al. did detect.
The pro-peloton shift to short cranks (GB track 165/160 at Rio 2016; Wiggins 177.5 → 170 for
the hour record) is driven by *position*, not leverage.

**Defensible output:** "165–175 mm is supported for almost everyone; go shorter if hip
closure or tri/TT position is a constraint." Printing `0.216 × inseam = 172.4 mm` is
pseudo-precision from a formula that was never fitted to data, against a literature that
could not detect a difference across that entire range.

### 3.3 Foot length

**No published mapping from foot length to any frame dimension was located.** Its only
fitting use is cleat fore-aft position, and even there the systematic review says there are
"no clear recommendations for... cleat position", and fore-aft cleat position "appears to have
little impact on the ability to deliver power".

**Recommendation: drop the foot-length field**, or keep it only if the app intends to give
cleat guidance, and label it as such. Collecting a measurement that feeds nothing is worse
than not collecting it — it implies a precision the output does not have.

---

## 4. Where the whole idea is weak

### 4.1 Most calculators are unpublished regressions, or not regressions at all

Of the methods in §1, exactly **two** publish their reasoning: Hamley & Thomas (a 1967 paper)
and Kirby Palm (a personal website, and his is a derivation rather than a fit to data).
Competitive Cyclist, Retül Match, Bike Insights' sizing guidance, and every brand size chart
publish **nothing**: no formula, no dataset, no validation, no tolerance. LeMond's multiplier
is published as a number with no derivation.

This matters because an unpublished regression cannot be criticised, cannot be corrected, and
cannot be checked for whether its training population resembles the user. It also means the
app cannot credibly claim to implement any of them — at best it can reimplement a rumour of
them.

### 4.2 Brand-to-brand size labels are not comparable, and this is measurable

The best quantified source located:

> MyVeloFit, "The Data Of Bike Sizing", Raffi Adjeleian, 1 May 2022. Database of **133 road
> and gravel models from 24 brands**.

- Across bikes **labelled 54 cm with the same effective top tube**: reach varies by **18 mm**,
  stack varies by **50 mm**.
- 3T Exploro Ultra vs Trek Checkpoint, **both labelled 54 cm**: **30 mm** reach difference —
  equal to the *entire* reach range of the Trek Émonda from 52 to 60 cm.
- Colnago's size progression is non-monotonic in character: near-vertical stack growth from
  48 to 54, then a large reach jump from 54 to 56, such that one Colnago size step ≈ five
  Émonda size steps.
- Quoted: "Asking for a 54 cm top tube is like asking for a t-shirt with a 24 cm diameter arm
  hole."

Corroborated independently by road.cc (Mat Brett, 21 Apr 2020), all four bikes labelled 56 cm:

| Bike | Stack | Reach |
|---|---|---|
| Specialized Tarmac | 565 mm | 395 mm |
| Specialized Roubaix | 605 mm | 384 mm |
| Trek Madone | 563 mm | 391 mm |
| Trek Domane | 591 mm | 377 mm |

**42 mm of stack and 18 mm of reach separate two bikes from the same brand with the same
number on them.** Add the Bianchi-vs-Giant case (an equivalent frame labelled 55 by Bianchi
and 47 by Giant, because Bianchi sizes from a notional seat tube and Giant uses a steeply
sloping top tube) and the size label carries essentially no transferable information.

**Consequence for this feature:** any output expressed as a size label, a seat tube length or
an effective top tube is brand-specific at best and meaningless at worst. Only **stack and
reach** survive the comparison, and reach is the one Holliday & Swart could not predict.

### 4.3 Flexibility and discipline dominate — and the app cannot measure flexibility

Holliday & Swart's saddle height model has **two flexibility terms out of three predictors**
(Knee Extension Angle and modified Schober), and their handlebar drop model has **only** a
flexibility term. Anthropometry alone was not sufficient for either.

Those are **clinically measured** tests: KEA with a goniometer on a supine subject with the
hip at 90°, mSchober with a tape and skin marks over the lumbar spine. **A self-rated
"flexible / average / stiff" dropdown is not those tests, and no study located establishes
the correlation between a self-rating and either measurement.** Treat any flexibility-gated
output as resting on an unvalidated proxy, and say so in the UI.

Discipline matters at least as much: `fit-targets-research.md` §3 already documents that
road, MTB and tri produce different targets from the same body, and that the tri numbers come
out of seat-tube geometry rather than rider intent.

### 4.4 Fitters disagree with each other, measurably

> "Inter-rater variability in 2D kinematic cycling analysis using Kinovea®: a cross-sectional
> study with 53 bike fitting professionals in Brazil." *Journal of Science and Cycling*.
> (Authors not captured; article 1050 on jsc-journal.com. **Citation incomplete — verify
> before use.**)

53 professional bike fitters analysed **the same 40-second video of the same cyclist**.
Coefficients of variation: knee extension **6.2%**, trunk flexion **5.8%**, plantarflexion
**4.8%** — all above the study's 2–4% tolerance threshold. 95% limits of agreement:
plantarflexion **−10.79 to +9.10°**, hip flexion **−7.0 to +5.25°**.

That is the disagreement on *identical input data with a shared tool*. Disagreement between
fitters working on live riders with different methods is necessarily larger. A calculator
that prints a single number is claiming a precision that trained humans cannot reproduce from
the same video.

### 4.5 Inseam does not determine leg segment proportions

Peveler's explanation for the 73% miss rate is the structural problem with every inseam-based
formula: **inseam is the sum of femur, tibia and foot contributions, and riders with identical
inseams distribute it differently.** Saddle height responds to that distribution; the formula
cannot see it. The same argument applies with more force to torso and arm length predicting
reach, since reach also depends on spine flexion, shoulder mobility and hand position — none
of which a tape measure sees.

Related and worth stating: inseam is roughly 45–48% of stature, with real individual
variation. Cycling-specific sources put the practical range at roughly 41–51% of height, but
these are **self-reported forum aggregates, not studies** — one such source states outright
that no study of the ratio exists. The authoritative dataset that *could* quantify this is
**ANSUR II** (US Army, 2012; 6,068 soldiers, 93 dimensions, crotch height among them), but
**I did not extract the crotch-height/stature statistics for this document** — marked
unverified. The point stands qualitatively: **height alone cannot stand in for inseam**, which
is exactly what every brand size chart does.

### 4.6 Measurement error at the input

Every published formula assumes an inseam taken with a straight-edge pulled firmly into the
crotch against a wall, barefoot. A user with a tape measure and no helper will be off by
5–15 mm (**estimate, unsourced**). At 0.883, a 10 mm inseam error is a 9 mm saddle height
error — which is comparable to the entire difference between disciplines documented in
`fit-targets-research.md`. Shoulder width is worse: the landmark is the acromion process,
which most people cannot find on themselves.

---

## 5. Recommendation: what the form can honestly print

Given inputs **height, inseam, arm length, torso length, shoulder width, foot length,
flexibility self-rating**:

### 5.1 Print with a confidence label

| Output | What to print | Label | Basis |
|---|---|---|---|
| **Saddle height** | `0.870–0.895 × inseam` as a **range in mm**, BB centre to saddle top along the seat tube | **Moderate** — "starting point, expect to adjust by up to 20 mm" | LeMond/Guimard, Hamley & Thomas, Holliday adj R² = 0.46; Peveler's 73% miss rate is the reason for the band |
| **Handlebar width** | Shoulder width ± 20 mm, **stating the measurement convention** (c-c vs o-o) | **Moderate-low** — one n = 10 study plus universal practice | Lin et al. 2025 |
| **Crank length** | "165–175 mm; shorter if you have limited hip flexion or ride an aggressive position" — a **range with a reason**, not a number | **High confidence that it barely matters** | Martin & Spirduso 2001, Li et al. 2025, Husband et al. 2024 |
| **Stack/reach search window** | A **box** on the stack/reach plane to filter a geometry database, explicitly labelled a shortlist filter | **Low** — and say so | Derived; see §2.2 |
| **Per-brand size band** | For named brands only, *their* chart's answer for this height, with the caveat that the label is brand-specific | **Low** | Brand charts; §4.2 |

### 5.2 Refuse to print

- **A single frame size** ("you are a 56"). Meaningless across brands — §4.2 shows 42 mm of
  stack separating two bikes both labelled 56 from the same manufacturer.
- **Seat tube length in cm.** The `0.65 × inseam` multiplier has no traceable origin, and the
  quantity itself is not comparable across brands.
- **Effective top tube.** Same, plus seat-angle dependence.
- **Frame reach.** Holliday & Swart: adjusted R² = **−0.10**. The model is worse than guessing
  the mean. This is a tested null result, not an absence of evidence.
- **Saddle setback / KOPS.** Holliday & Swart: not significant (adj R² = 0.07). Independently
  rejected on principle by Bontrager ("no biomechanical basis at all") and Hogg ("achieved
  validity by repetition").
- **Stem length.** No published rule located, in any source, peer-reviewed or otherwise.
- **Saddle-to-bar drop in mm.** The only predictor that worked was a *clinically measured*
  hamstring test (adj R² = 0.25). A self-rating is an unvalidated proxy for it (§4.3). If
  shipped at all, ship it as a **±30 mm band gated on the self-rating with a visible warning**,
  or not at all. My recommendation: not at all, in v1.
- **Stack-to-reach ratio as a rider target.** The 1.4-race / 1.5–1.6-endurance figures
  describe *bike categories* and come from retailer blogs, not from any rider-side study.
  Usable as a category label on a search result; not as something a body predicts.

### 5.3 Form changes implied

- **Drop foot length** unless the app ships cleat guidance. It feeds no defensible output
  (§3.3), and collecting it implies precision the results do not have.
- **Drop or demote arm length and torso length** for sizing purposes. They were measured by
  Holliday & Swart and survived into none of the four models. Keep them only if the app uses
  them for something else; do not let their presence imply the reach output is real, because
  there is no reach output.
- **Make inseam the primary input and height secondary.** Trochanteric leg length beat stature
  in the one regression that tested both. Height is what brand charts use and is the weakest
  usable input (§4.5).
- **Add measurement instructions with a diagram for inseam and shoulder width.** §4.6 — input
  error is comparable to the entire output tolerance, so the instructions are load-bearing,
  not decoration.
- **State the handlebar width convention** on both the input and the output. The UCI
  regulates three different definitions of it (§3.1).

### 5.4 The honest framing for the UI

The defensible product here is **a shortlist and a starting position**, not a size
recommendation. Specifically: a saddle height range, a handlebar width band, a permissive
crank length statement, and a stack/reach box to filter a geometry database — with a visible
statement that the label on the frame is not a fit measurement and that nothing here replaces
sitting on the bike.

Presenting that as "your frame size is X" would be claiming a precision that (a) the one
relevant peer-reviewed regression explicitly failed to find for two of the four quantities,
(b) 53 professional fitters could not reproduce from identical video, and (c) the frames
themselves do not have, because the numbers on them mean different things.

---

## 6. Sources

**Peer-reviewed**

1. Holliday W, Swart J. "Anthropometrics, flexibility and training history as determinants for
   bicycle configuration." *Sports Medicine and Health Science* 2021;3(2):93–100.
   DOI: 10.1016/j.smhs.2021.02.007. PMC9219349.
   https://pmc.ncbi.nlm.nih.gov/articles/PMC9219349/
   **The single most relevant paper for this feature.** n = 50. Saddle height adj R² = 0.46;
   handlebar drop adj R² = 0.25; **saddle setback and handlebar reach not significant**.
2. Husband SP, Wainwright B, Wilson F, Crump D, Mockler D, Carragher P, Nugent F, Simms C.
   "Cycling position optimisation – a systematic review of the impact of positional changes on
   biomechanical and physiological factors in cycling." *Journal of Sports Sciences* 2024.
   DOI: 10.1080/02640414.2024.2394752. 47 studies, 724 participants. "No clear recommendations
   for crank length, handlebar height, Q factor or cleat position."
3. Peveler WW, Green JM. "Effects of saddle height on economy and anaerobic power in
   well-trained cyclists." *J Strength Cond Res* 2011;25(3):629–633.
   https://pubmed.ncbi.nlm.nih.gov/20581695/ — **109% of inseam falls outside the recommended
   25–35° knee angle range 73% of the time.**
4. Peveler WW. "Effects of saddle height on economy in cycling." *J Strength Cond Res* 2008.
   https://pubmed.ncbi.nlm.nih.gov/18545167/
5. Hamley EJ, Thomas V. "Physiological and postural factors in the calibration of the bicycle
   ergometer." *Journal of Physiology*, 1967. Origin of the 109%-of-inseam rule, measured to
   the pedal axle.
6. Martin JC, Spirduso WW. "Determinants of maximal cycling power: crank length, pedaling rate
   and pedal speed." *Eur J Appl Physiol* 2001;84:413–418. DOI: 10.1007/s004210100400.
   https://link.springer.com/article/10.1007/s004210100400
7. Li J et al. "Effects of crank length on cycling efficiency, sprint performance, and
   perceived fatigue in high-level amateur road cyclists." *J Exerc Sci Fit* 2025;23(3):175–180.
   DOI: 10.1016/j.jesf.2025.100384. https://pmc.ncbi.nlm.nih.gov/articles/PMC12060448/
8. Lin Z-J, Tsai P-C, Chen C-H. "Handlebar Width Choices Must Be Considered for Female
   Cyclists." *J Funct Morphol Kinesiol* 2025;10(1):28. DOI: 10.3390/jfmk10010028.
   https://pmc.ncbi.nlm.nih.gov/articles/PMC11755458/
9. Grainger [et al.]. "Predicting bicycle setup for children based on anthropometrics and
   comfort." *Applied Ergonomics* 2017. https://pubmed.ncbi.nlm.nih.gov/27890157/
   n = 142 children 7–16. **Full author list and DOI not verified.**
10. Millour G, Bertucci W. "Comparison of Genzling method vs Hamley method allowing a postural
    adjustment in cycling: preliminary study." *Computer Methods in Biomechanics and Biomedical
    Engineering* 2017. DOI: 10.1080/10255842.2017.1382898.
11. "Inter-rater variability in 2D kinematic cycling analysis using Kinovea®: a cross-sectional
    study with 53 bike fitting professionals in Brazil." *Journal of Science and Cycling*,
    article 1050. https://www.jsc-journal.com/index.php/JSC/article/view/1050
    **Authors and year not captured — citation incomplete.**
12. Bini R, Encarnación-Martínez A, Priego-Quesada JI, Carpes FP. "Details our eyes cannot see:
    Challenges for the analysis of body position during bicycle fitting." *Sports Biomechanics*
    2023;22(4). DOI: 10.1080/14763141.2021.1987509. **Consulted; abstract could not be
    retrieved. Contributes nothing to the numbers above.**
13. ISO 4210-2:2023 and ISO 8098 — cycle safety standards. https://www.iso.org/standard/78077.html
    Cited as **negative evidence**: they partition bicycles by maximum saddle height for test
    purposes only. **No ISO/CEN standard specifies frame sizing from body measurements.**

**Named methods, calculators and fit systems**

14. Competitive Cyclist Fit Calculator. https://www.competitivecyclist.com/bike-fit-calculator
    **Geo-blocked from the EU (302 to static.backcountry.com/eu/bc_eu.html); not read
    directly.** Inputs/outputs reconstructed from secondary reports — unverified.
15. Greg LeMond, *Greg LeMond's Complete Book of Bicycling*. Source of the 0.883 multiplier and
    of a frame sizing chart. Formula attributed to **Cyrille Guimard**, early 1980s. **Book not
    accessed; the frame chart's multipliers are unverified.**
16. Claude Genzling & Bernard Hinault, *Road Racing Technique and Training*, ch. "Morphology,
    Position and Frame Design". Origin of the French anthropometric sizing tradition, including
    the sternal-notch trunk measurement and the T/E ≈ 0.76 average trunk-to-inseam ratio.
    **Out of print; not accessed.**
17. Kirby Palm, "Bicycle Crank Length: A Formula" and "Derivation of the Formula".
    https://www.nettally.com/palmk/crankset.html · https://www.nettally.com/palmk/crderiva.html
    `crank = 0.216 × inseam`. Derivation published; **not empirically fitted**.
18. Lennard Zinn, Velo technical Q&A. `crank = 0.21 × inseam`. Professional judgement.
    https://velo.outsideonline.com/road/road-racing/technical-qa-with-lennard-zinn-a-question-of-crank-length/
19. Dan Empfield / Slowtwitch, Stack & Reach primer (earliest located chapter bylined
    "Slowman", 19 Feb 2003). https://www.slowtwitch.com/industry/stack-reach-primer-chapter-three/
    "You can't be led by the geometry of the bike. You have to determine where you need to be
    'in space' and then find the right bike to place underneath you."
20. Bike Insights. https://bikeinsights.com/ — geometry database and comparison tool; sizing
    methodology unpublished; data partly crowd-contributed.
21. Retül Match / Specialized Body Geometry. Zin wand + Match tower; proprietary; no published
    algorithm or validation. https://www.retul.com/
22. Trek Precision Fit — published process description only; sizing is an output of a fit
    session, not a calculator.
23. Cyclefit — **no published methodology located. Unverified.**

**Data on brand inconsistency**

24. MyVeloFit, "The Data Of Bike Sizing", Raffi Adjeleian, 1 May 2022.
    https://www.myvelofit.com/fit-academy/the-data-of-bike-sizing/
    133 models / 24 brands. 54 cm bikes at equal ETT: 18 mm reach and 50 mm stack variance.
25. road.cc, "Bike geometry 101: Find out why stack & reach are important", Mat Brett,
    21 Apr 2020. https://road.cc/content/feature/what-are-stack-and-reach-and-why-are-they-important-266968
    56 cm Tarmac 565/395, Roubaix 605/384, Madone 563/391, Domane 591/377.

**Handlebar width regulation and the narrow-bar argument**

26. UCI, "UCI statement on its recent decisions regarding changes to equipment regulations based
    on SafeR recommendations." https://www.uci.org/pressrelease/uci-statement-on-its-recent-decisions-regarding-changes-to-equipment/39bHGV3T3d3sNHKNe2Rvbx
    400 mm outer / 320 mm inner at levers / 380 mm c-c, road & CX from 1 Jan 2026; track 350 mm
    from 1 Jan 2027.
27. MyVeloFit, "Why the UCI's New Handlebar Width Rule Misses the Mark", Dana Galley,
    16 Jun 2025. https://www.myvelofit.com/fit-academy/why-the-ucis-new-handlebar/
    Cited as **an assertion without published data** — no sample size, no distribution.
28. Cyclingnews, "Bike fitters hit out at the UCI's new handlebar width rules…"
    **Fetch truncated; contents unverified.**

**Named fitters**

29. Steve Hogg, "Seat set back: for road bikes" (2011).
    https://www.stevehoggbikefitting.com/bikefit/2011/05/seat-set-back-for-road-bikes/
    "KOPS / TTOPS has no foundation anyway. Like a lot of cycling lore, KOPS / TTOPS has
    achieved validity by repetition."
30. Keith Bontrager, "The Myth of K.O.P.S." https://www.sheldonbrown.com/kops.html
31. Phil Burt, quoted in BikeRadar (Simon von Bromley, 26 Feb 2021): "The science is clear,
    crank length is not important in sub-maximal power production, within a range of 80 mm to
    300 mm." https://www.bikeradar.com/advice/sizing-and-fit/what-is-the-best-crank-length-for-cycling
    **Secondary quote; not verified against a Burt primary text.**

**Reference datasets**

32. ANSUR II (2012 Anthropometric Survey of US Army Personnel), 6,068 subjects, 93 dimensions
    including crotch height. https://apps.dtic.mil/sti/tr/pdf/AD1100615.pdf
    **Statistics not extracted for this document.** The authoritative way to quantify
    inseam-to-stature variation if that becomes load-bearing.

**Checked and rejected**

33. Peters DM, Eston RG. "Prediction and measurement of frame size in young adult males."
    *J Sports Sci* 1993;11(1):9–15. DOI: 10.1080/02640419308729957. **"Frame size" here means
    skeletal body build, not bicycle frames. Irrelevant — recorded so the search is not
    repeated.**
34. calculator.city, citicalculator.com, bike-size.com, bikecalcs.uk, and similar SEO calculator
    clones. **Not sources.** They are the origin of several uncited multipliers in circulation
    (notably `0.65 × inseam`) and were not used for any number above.

**Saddle width and sit bones (§8.1–§8.2)**

35. Lin Z-J, Wang H-H, Chen C-H. "The Effect of Bicycle Saddle Widths on Saddle Pressure in
    Female Cyclists." *J Sports Sci Med* 2023;22(3):425–430. DOI: 10.52082/jssm.2023.425.
    PMC10499128. n = 10 women; saddle width = ischial width +1 cm gave the best pressure
    distribution. **Method for ischial width not stated, comfort not measured, and the power
    output differs between abstract and methods.**
36. Chen Y-L. "Changes in external ischial tuberosity width at varying trunk–thigh angles
    between sexes using two measurement methods." *Sci Rep* 2021;11:19676.
    DOI: 10.1038/s41598-021-99232-w. PMC8490358. n = 45 men + 45 women. With the clay impress
    method (centre-to-centre), width is stable across posture; on a hard-surface pressure mat
    it shrinks by about 11.5 mm from 105° to 60° trunk–thigh angle.
37. SQlab (manufacturer). Sit-bone measurement and saddle width system pages:
    https://www.sq-lab.com/en/us/ergonomics/sit-bone-measurement-for-bike-saddles ·
    https://www.sq-lab.com/en/technology/saddle-width-system ·
    https://www.sq-lab.com/en/brand/news/gravel-ergonomics-advice (sporty +1 cm, moderate +2 cm) ·
    https://www.sq-lab.com/en/bicycle-type/trekking-bike/saddles (+3 cm) ·
    MTB page (+2 cm; via search summary, page not read directly). **Manufacturer guidance; no
    study cited.**
38. SQlab, "Stop guessing. Start measuring."
    https://www.sq-lab.com/en/us/brand/news/0017_stop-guessing-start-measuring- — "Mark the
    center of both imprints and measure the distance between them."
39. Selle Italia idmatch size guide. https://www.selleitalia.com/size-guide/ — S below 120 mm,
    L above 120 mm; pelvic rotation picks the cut-out size (1/2/3), not the width.
    **Manufacturer guidance.**
40. Specialized sit-bone → saddle-width chart (143 / 155 / 168 mm), as reproduced on a
    Performance Bike product page ("All measurements are provided by the manufacturer").
    https://www.performancebike.com/specialized-power-pro-mirror-saddle-black-27122-8703-p/p1416860
    **specialized.com returned 403; not read on the manufacturer's own site.**
41. Ergon, "Measuring Your Sit Bone Width for the Right Saddle Size."
    https://www.ergonbike.com/en/magazine/measuring-your-sit-bone-width-for-the-right-saddle-size
    Centre-to-centre; S/M vs M/L boundary at about 12 cm. **Manufacturer guidance.**
42. bike-components.de, "Measuring sit bone distance" guide.
    https://www.bike-components.de/blog/en/guides/measuring-sit-bone-distance-bicycle-saddle-home-saddle-width
    Retailer guide: allowance of 0 (tri) to "up to four centimeters" (upright).
43. Potter JJ, Sauer JL, Weisshaar CL, Thelen DG, Ploeg HL. "Gender differences in bicycle saddle
    pressure distribution during seated cycling." *Med Sci Sports Exerc* 2008;40(6):1126–1134.
    DOI: 10.1249/MSS.0b013e3181666eea. Abstract only.
44. Spears IR, Cummins NK, Brenchley Z, et al. "The effect of saddle design on stresses in the
    perineum during cycling." *Med Sci Sports Exerc* 2003;35(9):1620–1625.
    DOI: 10.1249/01.MSS.0000084559.35162.73. Single-pelvis finite-element model; abstract only.
45. Bressel E, Nash D, Dolny D. "Association between attributes of a cyclist and bicycle seat
    pressure." *J Sex Med* 2010;7(10):3424–3433. DOI: 10.1111/j.1743-6109.2010.01905.x.
46. Larsen AS, Larsen FG, Sørensen FF, et al. "The effect of saddle nose width and cutout on saddle
    pressure distribution and perceived discomfort in women during ergometer cycling."
    *Appl Ergon* 2018;70:175–181. DOI: 10.1016/j.apergo.2018.03.002. Tests the nose, not the rear
    width; recorded so the search is not repeated.
47. Sauer JL, Potter JJ, Weisshaar CL, Ploeg HL, Thelen DG. "Influence of gender, power, and hand
    position on pelvic motion during seated cycling." *Med Sci Sports Exerc* 2007;39(12):2204–2211.
    DOI: 10.1249/mss.0b013e3181568b66.

**Body proportions (§8.3)**

48. ANSUR II public data, Penn State OpenLab mirror:
    https://tools.openlab.psu.edu/publicData/ANSUR_II_MALE_Public.csv ·
    https://tools.openlab.psu.edu/publicData/ANSUR_II_FEMALE_Public.csv (index page
    https://www.openlab.psu.edu/ansur2/). 4,082 men and 1,986 women. The §8.3 ratios were
    computed from these files, unweighted. This supersedes the "statistics not extracted" note
    on source 32 for crotch height.
49. *Measurer's Handbook: US Army and Marine Corps
    Anthropometric Surveys, 2010–2011.* NATICK/TR-11/017.
    https://tools.openlab.psu.edu/publicData/ANSURII-TR11-017.pdf — landmark and measurement
    definitions quoted in §8.3. **Authors not captured.**
50. Chen Y-L, Yang P-J. "A preliminary study of the measurement of external ischial tuberosity
    width and its gender differences." *J Phys Ther Sci* 2016;28(3):820–823.
    DOI: 10.1589/jpts.28.820. n = 15 + 15 Taiwanese adults. Impress method: men 11.96 cm, women
    13.53 cm.

**Triathlon / TT sizing (§9)**

51. Price D, Donne B. "Effect of variation in seat tube angle at different seat heights on
    submaximal cycling performance in man." *J Sports Sci* 1997;15(4):395–402.
    https://sponet.de/sponet/Record/4001871?lng=en — n = 14 road racers, 200 W, seat tube 68° /
    74° / 80° at 96 / 100 / 104% of trochanteric height. 80° beat 74° on VO₂ and efficiency at
    **all three** heights. **Abstract only**; no per-angle optimum height is reported.
52. Garside I, Doran DA. "Effects of bicycle frame ergonomics on triathlon 10-km running
    performance." *J Sports Sci* 2000;18(10):825–833. https://sponet.de/sponet/Record/4004706 —
    n = 8 triathletes, 73° vs 81°, 40 km ride then 10 km run; run faster after 81°. **Abstract
    and secondary summaries only; saddle-height handling not captured.**
53. Ricard MD, Hills-Meyer P, Miller MG, Michael TJ. "The effects of bicycle frame geometry on
    muscle activation and power during a Wingate anaerobic test." *J Sports Sci Med*
    2006;5:25–32. https://www.jssm.org/jssm-05-25.xml-Fulltext — 72° vs 82°. "Subjects
    self-selected their seat height prior to the start of each testing session."
54. Heil DP, Pickels R. "The influence of bicycle geometry on time-trial positioning kinematics
    and markers of performance." *Int J Phys Educ Fit Sports* 2019;8(1):11–24.
    DOI: 10.26524/ijpefs1912. Seat tube 76° vs 80°. **Full text could not be fetched**; only the
    statement that mean knee angle was insensitive to seat-tube angle while hip angle moved was
    seen, in a search excerpt.
55. Jongerius N, Wainwright B, Walker J, Bissas A. "The biomechanics of maintaining effective
    force application across cycling positions." *J Biomech* 2022;138:111103.
    https://eprints.glos.ac.uk/11044/ — 56 male cyclists, TT-trained vs road-trained. TT riders
    prefer a more forward hip. **Abstract only.**
56. McDonald R, Holliday W, Swart J. "Muscle recruitment patterns and saddle pressure indexes
    with alterations in effective seat tube angle." *Sports Med Health Sci* 2022;4(1):29–37.
    DOI: 10.1016/j.smhs.2021.10.007. https://pmc.ncbi.nlm.nih.gov/articles/PMC9219297 —
    saddle height was re-set after each ±3 cm fore-aft move to hold static joint angles; knee
    31.5–32.6°, no significant difference.
57. Bini RR, Hume PA, Croft JL. "Cyclists and triathletes have different body positions on the
    bicycle." *Eur J Sport Sci* 2014;14(S1):S109–S115. **Not read; cited by title only.**
58. Slowman (Dan Empfield), "Seat height", Slowtwitch, 13 Sep 2007.
    https://slowtwitch.com/industry/seat-height/ — his tri saddle "10mm or 12mm taller" than
    road; knee about 143° road vs 145° tri; most of the gap is sitting "nearer the nose".
59. Ferrer-Roca V, Rivero-Palomo V, Ogueta-Alday A, Rodríguez-Marroyo JA, García-López J. "Acute
    effects of small changes in crank length on gross efficiency and pedalling technique
    during submaximal cycling." *J Sports Sci* 2017;35(14):1328–1335.
    DOI: 10.1080/02640414.2016.1215490. n = 12; preferred ±5 mm. **Abstract only.**
60. Reynolds, Chidley, Briley, Outram. "The impact of minor crank length adjustments on lower
    body cycling kinematics." *Sports Biomechanics* 2025. University of Derby repository
    (https://repository.derby.ac.uk/item/qy8v2/). **Abstract only; initials, n and DOI not
    captured.**
61. Fred Matheny, "Crankarm study says length doesn't matter", RoadBikeRider (undated).
    https://www.roadbikerider.com/crankarm-study-says-length-doesn-t-matter-d1/ — paraphrases
    Jim Martin recommending 165 mm, the shortest stock length, for TT. **Secondary paraphrase,
    not a Martin quote.**
62. "Optimal handlebar position for track cyclists." *Sports Engineering* 2013;16:81–90.
    DOI: 10.1007/s12283-013-0111-5. https://sponet.de/sponet/Record/4028906?lng=en — 7 + 7 track
    cyclists in a wind tunnel; bar height mattered more than elbow-pad separation, high
    between-rider variability. **Authors not confirmed (probably Underwood & Jermy); abstract
    only.**
63. Fit Werx (Ian), "Aerobar Arm Pad Width", *Triathlete* May 2002, updated 5 Feb 2016.
    https://fitwerx.com/aerobar-arm-pad-width/ — upper arms should shield, "but is not wider
    than, the thighs and hips". Fitter opinion, no data.
64. ISM (manufacturer). FAQ: https://ismseat.com/help/frequently-asked-questions/ — "We do not use
    sit bone width to determine which saddle you should choose." Setup guide:
    https://ismseat.com/help/setup-guide/ — start "5 millimeters, or 1/4 inch lower", and set
    the front "about 2-3 inches, or 5-8 centimeters" further back than a nosed saddle.
    **Manufacturer guidance.**
65. Greg Kopecky, "Challenging Triathlon Saddle Assumptions", Slowtwitch, 20 Jun 2018.
    https://www.slowtwitch.com/cycling/challenging-triathlon-saddle-assumptions/ — widest point
    = sit bones to +1–3 cm "a fine way to go (but not the only way)"; effective width of some
    noseless saddles only 110–120 mm. Fitter opinion, no data.
66. BikeFit.com, "How to fit a triathlon or time trial bike", part 1 (7 May 2015) and part 2
    (6 May 2015). https://bikefit.com/blogs/bikefit-blog/how-to-fit-a-triathlon-or-time-trial-bike-part-1-overview ·
    https://bikefit.com/blogs/bikefit-blog/how-to-fit-a-triathlon-or-time-trial-tt-bike-part-2-the-pelvis-saddle-fitting
    — fit before buying; knee 27–37° from straight; "the millimeter adjustment is not as
    important as you might believe"; UCI/USAC saddle nose 5 cm behind the BB (relayed, UCI rule
    text not read here).
67. Slowman, "What is Pad Y/X?", Slowtwitch, 28 Jun 2016. https://slowtwitch.com/industry/what-is-pad-y-x/
    — Pad Y/X = BB to armrest pad; "tri bikes are harder because you have a handlebar on top of a
    handlebar".
68. Slowman, "The Ordu Gets a Pad XY Chart", Slowtwitch, 11 Jul 2016.
    https://www.slowtwitch.com/industry/the-ordu-gets-a-pad-xy-chart/ — one rider's 630/500 pad
    numbers "could ride either an M or an L".
69. Slowman, "Your Ideal Tri Bike", Slowtwitch, 6 Jun 2016. https://slowtwitch.com/industry/your-ideal-tri-bike/
    — many M/L tri frames converge near stack 540 / reach 425 mm.
70. Slowtwitch forum, "Official FIT ASSISTANCE for Cervelo TT and Triathlon Bikes" (Cervélo fit
    rep answering riders). https://forum.slowtwitch.com/t/official-fit-assistance-for-cervelo-tt-and-triathlon-bikes/775865
    — sizes chosen from pad stack/reach, with back-of-pad vs mid-pad conventions differing.
    **Forum; manufacturer-representative opinion.**

---

## 7. Confidence and gaps

### Well sourced

- **Sit bones are measured centre-to-centre** (cardboard, gel or clay). Every manufacturer
  method agrees, and the research impress method is the same measurement made precise (§8.1).
- **ANSUR II proportions** (§8.3): male inseam 48.15 ± 1.41%, sternum height
  81.91 ± 0.71%, torso 33.75 ± 1.39%, arm (acromion→stylion) 34.34 ± 1.01% of stature. Female
  values in §8.3. Computed from 6,068 public records. The definitions come from the Measurer's
  Handbook. Torso% is nearly the mirror of inseam% (r ≈ −0.87).

- **Saddle height ≈ 0.870–0.895 × inseam as a starting range**, with a ±20–25 mm honest band.
  Two independent lineages agreeing to ~1.5 mm, a peer-reviewed null between them, a
  regression (adj R² = 0.46) that keeps leg length as a predictor, and a peer-reviewed
  quantification of the error (73% outside the knee-angle window).
- **Crank length barely matters between 165 and 175 mm.** Three independent lines: a maximal-
  power study spanning 120–220 mm finding a 3.8% spread, a 2025 trial at 165/170/175 finding
  nothing on efficiency or sprint power, and a 47-study systematic review explicitly declining
  to recommend a crank length.
- **Brand size labels are not comparable.** Two independent datasets with concrete numbers
  (MyVeloFit's 133-model analysis; road.cc's four-bike table).
- **Reach and saddle setback are not predictable from anthropometry.** A tested null result
  on 50 trained cyclists, not an absence of evidence. This is the most important finding in
  the document and it is the best-evidenced negative one.
- **There is no ISO/CEN frame sizing standard.** Confirmed by reading the scope of ISO 4210.
- **Fitters disagree measurably on identical data.** 53 fitters, one video, CVs above tolerance
  on every angle that matters.

### Moderately sourced

- **Handlebar width ≈ shoulder width.** One direct experiment (n = 10, women, one power/cadence
  condition) plus universal but unvalidated fitter practice. The population means in the same
  paper (female 32.9 ± 1.5 cm vs commercial bars 36–44 cm) are the strongest part of the case.
- **Handlebar drop is flexibility-driven.** Holliday adj R² = 0.25 with a single flexibility
  predictor. Real, but weak, and the predictor is a clinical test the app cannot run.
- **The Genzling ↔ "French Fit" identification.** An inference from the shared sternal-notch
  measurement. Plausible, undocumented.
- **Riding position changes the effective sit-bone contact width** (§8.2). Chen 2021: on a hard
  surface, about −11.5 mm from 105° to 60° trunk–thigh angle; Potter 2008: centre of pressure moves
  forward in the drops. The direction is sourced. The seated postures were not cycling, and no
  study converts this into a saddle allowance.
- **Tri frame stack/reach is only a coarse filter** (§9.5). Manufacturer pad-X/Y charts and
  fit reps size tri bikes from armrest coordinates, and adjacent sizes overlap. Empfield's
  "fit first" method (§1.5) is the published basis. No study, but no source disagrees.
- **A steep seat angle moves the hip more than the knee** (§9.1). Price & Donne 1997 (hip range
  of motion smaller at 80°), Heil & Pickels 2019 (knee insensitive, excerpt only), McDonald
  et al. 2022 (knee unchanged once height is re-set). Abstracts and excerpts only.
- **ANSUR II ratios as civilian cyclist norms** (§8.3). The statistics themselves are well
  sourced (computed from the public files). The population is a young, fit US military sample,
  unweighted.

### Weak, unverified, or actively rejected

- **The `0.65 × inseam` frame size multiplier.** No traceable origin. Appears only on SEO
  calculator clones and forum reposts. **Do not ship.**
- **Competitive Cyclist's inputs and outputs as listed in §1.1.** Reconstructed from secondary
  sources because the site is geo-blocked from the EU. The three methods' formulas are not
  published by anyone.
- **The "Eddy Fit" attribution to Eddy Merckx.** One secondary source states plainly it is a
  marketing coinage. No documentation of Merckx's actual position was located.
- **LeMond's frame sizing chart multipliers.** Book not accessed.
- **All narrow-bar aerodynamic wattage figures** (8–12 W, 25 W per 2 cm, 2–4% drag). Blog and
  manufacturer sources only. Direction is agreed; magnitudes are unsourced.
- **"Handlebars 5–10% narrower than shoulders."** Commercial blogs only, and it contradicts the
  one study, which found *matching* shoulder width minimised muscle activation.
- **Martin & Spirduso's "20% of leg length / 41% of tibia length" optimum.** Reported only via
  BikeRadar; not verified in the primary text.
- **Faria & Cavanagh's "1% power per 1% deviation from 109%".** Relayed by a blog; primary not
  accessed.
- **Phil Burt's 80–300 mm claim.** Secondary quote.
- **Inseam-to-stature variation of 41–51%.** Forum self-reports. ANSUR II would settle it;
  not extracted here.
- **Cyclefit methodology.** Nothing published located at all.
- **Saddle width = sit bones + 10–30 mm** (§8.1). Manufacturer guidance (SQlab), not
  evidence. The only independent test is Lin 2023 (n = 10 women, +1 cm best, ischial-width
  method unstated). Specialized's chart (143/155/168) implies a different and more generous
  allowance. Spears 2003's "at least two times the bi-ischial width" is irreconcilable with all
  commercial rules and unexplained.
- **Per-position saddle allowance (+1 / +2 / +3 cm).** No study located. SQlab only. Two
  other versions also circulate. Competitive Cyclist's "+10–30 mm" could not be read (the site
  is geo-blocked from the EU, §1.1). Zinn Cycles' "+2 cm standard, +3–4 cm upright" was seen
  only in a search summary. Neither page was read directly.
- **Fitter "arm length" landmark and fitter "average" reference values.** No published fitter
  protocol was found. The reference rider's fitter averages sit 2.1 cm (sternum height) and
  3.1 cm (arm) below ANSUR II at 183 cm, but match it on inseam. The fitter's reference is
  unknown.
- **Any tri-specific saddle-height multiplier** (§9.1). No study compares optimal saddle height
  between road and TT positions or across seat angles. Fitter and manufacturer advice points
  both ways: Empfield +10–12 mm, ISM −5 mm, Bike Fit Adviser more knee flexion, BikeFittr less.
  Bini, Hume & Croft 2014 (cyclists vs triathletes) was not read.
- **A tri crank length number** (§9.2). The direction (shorter opens the hip at TDC, at no
  measured power cost) is sourced. The 165 mm figure is a secondary paraphrase of Martin;
  anything shorter is fitter practice.
- **Aerobar pad width from shoulder width** (§9.3). No study. Fitters disagree on the reference
  (shoulders vs thighs and hips). One wind-tunnel study found pad separation mattered less than
  bar height and varied between riders.
- **Saddle width for nose-forward tri saddles** (§9.4). ISM explicitly does not size by sit
  bones. The retailer "+0 for tri" and Kopecky's "+1–3 cm" are opinion.
- **The reference rider's "Sattelposition 16.3 cm"** (§9.6). Interpreted geometrically as
  horizontal BB-to-saddle offset; the fitter's reference point is not documented.
- **Sit-bone population norms for Europeans.** Only Taiwanese (Chen 2016/2021) and small US samples
  were located. No population dataset of centre-to-centre sit-bone width was found.
- **The flexibility self-rating.** No study located relates a self-rating to the Knee Extension
  Angle or modified Schober tests that the one relevant regression actually used. Any output
  gated on it rests on an unvalidated proxy.

### Highest-value follow-ups

1. **Read Holliday & Swart's printed regression tables.** The coefficients and adjusted R²
   values in §1.9 came from automated extraction of the PMC text. They are the load-bearing
   numbers in the whole document — both the positive saddle-height model and the two null
   results — and should be transcribed by hand before anything is shipped on them.
2. **Complete the Kinovea inter-rater citation** (authors, year, volume) if the 53-fitter
   variability result is quoted in the UI.
3. **Decide whether the stack/reach search window ships at all.** It is the only output that
   could plausibly be called "frame sizing", and it is entirely derived (§2.2). If it ships,
   its confidence label is the most important string in the feature.
4. **Get the Lin 2023 ischial-width method** (§8.1). If its 15.5 cm is an outer-edge measure, the
   "+1 cm" maps to a different centre-to-centre allowance.
5. **Find a published fitter arm-length protocol** (landmark at the wrist, and arm hanging vs
   horizontal) before velofit labels arms "long" or "short" next to a fitter's report.

---

## 8. Saddle width and body-proportion reference values

Research date: 2026-11-22. Added after §1–§7; same rules. Sources are numbered on from §6
(35–50), and the gaps are listed in §7. Each claim below carries one of the §7 grades. A fifth
label, **manufacturer guidance**, marks a brand's own recommendation. It is never counted as
evidence.

### 8.1 Saddle width from sit-bone width

**How sit bones are measured, and what the number means.** Every manufacturer method found
uses the same home test. The rider sits on corrugated cardboard (or a gel or memory-foam pad)
with feet raised so the knees are at about 90°, then stands up. The rider marks **the centre of
each imprint** and measures between the two marks. So the input to every rule below is
**centre-to-centre** distance. SQlab says this directly ("Mark the center of both imprints and
measure the distance between them" [38]); Ergon says "Measure the distance between the centres
of the indentations" [41]; the Specialized chart on a retailer page says "Make a dot in the
center of each sit bone impression" [40]. **Well sourced** that the convention is
centre-to-centre.

The research name for this quantity is *external ischial tuberosity width* (EITW). Chen 2021
[36] measured it by having the sitter press into clay, then measuring between the deepest
point of each hollow with a vernier caliper. That is the cardboard method made precise, so it
is also centre-to-centre. On this method EITW **did not change with trunk–thigh angle**
(spread across 60–105°: 2.8 mm for men, 2.1 mm for women). Means: men 112.6–115.4 mm,
women 125.9–128.0 mm (n = 45 + 45, young Taiwanese adults) [36]. Women's sit bones were about
13 mm wider [36]; Sauer et al., as cited in [36], found 18 mm. **Well sourced** that the
soft-medium method is stable and that the sex difference is 13–18 mm.
The population means do not transfer to other populations without checking.

On a **hard flat surface with a pressure mat**, the result moves with posture instead. See §8.2.

**The rules that exist. All are manufacturer guidance; none publishes a validation.**

| Source | Rule (input: sit bones centre-to-centre) | Implied allowance |
|---|---|---|
| SQlab, road / sporty [37] | sit bones **+ 1 cm** | +10 mm |
| SQlab, moderate / more upright [37] | sit bones **+ 2 cm** | +20 mm |
| SQlab, MTB [37] | sit bones **+ 2 cm** | +20 mm |
| SQlab, trekking [37] | sit bones **+ 3 cm** | +30 mm |
| bike-components.de guide (SQlab tools) [42] | fully stretched (tri) **+ 0**; upright "up to four centimetres" | 0 to +40 mm |
| Specialized chart, via a retailer [40] | 80–121 → 143 mm; 122–140 → 155 mm; 141–180 → 168 mm | +15 to +63 mm, by band |
| Selle Italia idmatch [39] | < 120 mm → **S**, > 120 mm → **L** (no mm width given) | not stated |
| Ergon [41] | S/M vs M/L boundary at about 12 cm | not stated |

SQlab also says "a more aggressive posture shifts the pressure point further forward on the
saddle" and that, when unsure, the wider of two sizes is the safer choice [37]. Saddle width
itself has no standard definition. SQlab defines *effective* width as the points beyond which
the saddle falls by more than 1 cm [37]. Brands that print only the total width are not
comparable on this number. The same problem applies to handlebar width (§3.1).

**Is any rule validated? Mostly no.**

- **Lin, Wang & Chen 2023** [35] is the only located study that tests saddle width against the
  rider's own ischial width. n = 10 young women, 3D-printed saddles 14–17 cm wide, 30 s of
  pressure-mat data per condition at 90 rpm. A saddle **1 cm wider** than ischial width gave
  lower peak and mean pressure under the posterior ischium. It also gave a smaller contact
  area over the pubic bone than saddles equal to the ischial width or 1 cm narrower. The
  abstract claims "better comfort", but **no comfort rating was collected**. The paper does not
  say how ischial width was measured. Its mean of 15.5 cm is well above the 12.6–12.8 cm that
  [36] found for women. So it may not be a centre-to-centre number. The abstract says 150 W and
  the methods say 100 W. **Weak.** It points the same way as SQlab's +1 cm road rule, but cannot
  carry a formula.
- **Spears et al. 2003** [44] used a finite-element model of **one** male pelvis. Perineal stress
  fell once the saddle supported both tuberosities, "best achieved when the saddle was at least
  two times wider than the bi-ischial width". The abstract does not define the bi-ischial width
  it used. "Two times" is far wider than any commercial rule (a 128 mm rider would need
  256 mm). **Weak**, and not reconciled with the rules above. It does support the direction:
  too narrow loads the perineum.
- **Potter et al. 2008** [43] (n = 22): IT width correlated with where the centre of pressure
  sat on the saddle, but no width rule was tested.
- **Bressel et al. 2010** [45] (n = 40 men): **body weight** explained up to 50% of mean seat
  pressure; pelvic tilt and flexibility explained peak pressure. IT width was measured but was
  not a leading predictor. **Moderately sourced**: sit-bone width is not the main driver of
  seat pressure.
- **Larsen et al. 2018** [46] (n = 19 women): this study tested **nose** width and cut-out, not
  rear width. Not relevant to the rule.

**What velofit can print.**

> **Saddle width ≈ sit-bone width (centre-to-centre) + 10 to 30 mm.** Use +10 mm for a low road
> position, +20 mm for moderate or MTB, and +30 mm for upright or trekking. Between two sizes,
> take the wider one.

Grade: **manufacturer guidance (SQlab)**, plus **Weak** independent support for the +10 mm end
(Lin 2023, n = 10). Label it "brand guidance, not a validated rule", and name the convention:
the input is centre-to-centre and the output is the saddle's *effective* width. Note in the UI
that Specialized's chart is more generous in the low band. For the reference rider
(128 mm), the rule gives **138 / 148 / 158 mm**, while Specialized's chart gives 155 mm for any
position.

### 8.2 Does riding position change the right width?

**Direction: moderately sourced. Magnitude: manufacturer guidance only.**

The mechanism is that as the pelvis rotates forward, the rider sits further forward on the
ischial and pubic rami. Those rami converge towards the front, so the contact points get
closer together. Two studies support the direction:

- **Chen 2021** [36] measured the same 90 people on a **hard flat pressure mat**. The measured
  contact width shrank as the trunk–thigh (TT) angle closed, while the clay method did not
  change (§8.1). Seated-pressure EITW, mean (SD):

  | TT angle | Men | Women |
  |---|---|---|
  | 105° | 122.6 (13.9) mm | 136.3 (10.5) mm |
  | 90° | 120.7 (13.4) mm | 134.0 (8.7) mm |
  | 75° | 116.6 (12.9) mm | 129.4 (10.2) mm |
  | 60° | 111.1 (12.7) mm | 124.6 (10.9) mm |

  That is **about −11.5 mm across 45° of closing**, roughly 2.5 mm per 10°. These are seated
  postures with the back against a wall, not riding. A road position in the drops closes the
  hip further than 60°, and that range was not tested.
- **Potter et al. 2008** [43]: going from the tops to the drops moved the centre of pressure
  forward in every region and lowered posterior load. In women, it raised anterior load.
  **Sauer et al. 2007** [47] measured anterior pelvic tilt in the drops: 21 ± 3° for men and
  24 ± 4° for women.

**What is not sourced.** No study tests a saddle-width *allowance* per riding position. The
+1 / +2 / +3 cm steps are SQlab's [37]. "Up to +4 cm upright, +0 for tri" is a retailer guide
[42]. Selle Italia maps pelvic rotation to **cut-out size**, not width [39]. Treat the steps as
manufacturer guidance.

**Implementation.** Take the allowance from the riding-position choice velofit already
collects: +10 / +20 / +30 mm. Show it as brand guidance. Chen's numbers are a plausibility
check only: they put a 10–20 mm gap between upright and aggressive sitting, the same size as
SQlab's step. They are not a formula.

### 8.3 Arm and torso length relative to stature (ANSUR II)

**Dataset.** ANSUR II public release [48]: 4,082 men and 1,986 women, US Army, 2010–2012. Every
row has all 93 dimensions, so there are no missing values. Values are in mm. The ratios below
were computed for this document from the public CSVs. Each row was used once, with **no
population weighting**, so these are not the weighted Army statistics in the Summary Report.
Landmark definitions come from the Measurer's Handbook [49].

**Which ANSUR variable matches which fitter measurement.**

| Fitter term | Closest ANSUR II variable | Handbook definition [49] |
|---|---|---|
| Inseam (Schrittlänge) | `crotchheight` | Floor to crotch, anthropometer blade raised "in firm contact with the crotch", with "additional upward pressure". Same as the §0 convention. |
| Sternum height (Brustbeinhöhe) | `suprasternaleheight` | Floor to suprasternale, "the inferior point of the jugular notch of the sternum (top of the breastbone)". **An exact match** for floor to jugular notch. |
| Torso length | `suprasternaleheight − crotchheight` | Derived. ANSUR has no single variable for this. |
| Arm length | `acromionradialelength + radialestylionlength` | Acromion (tip of the shoulder) to radiale (top of the radius at the elbow), plus radiale to stylion (tip of the radial styloid at the wrist), arm hanging. A beam caliper is laid parallel to each segment. |
| Arm length, vertical alternative | `acromialheight − wristheight` | Both measured to the floor with the arm hanging straight. About 0.6% of stature shorter, because the arm does not hang perfectly vertical. |

A fitter's "arm length" is usually a tape measure laid along the hanging arm from the acromion
to the wrist. That matches **acromion → stylion as two segments** best, but only if the
fitter ends at the radial styloid, the bony bump on the thumb side, which sits at about the
wrist crease. That landmark match is inferred, not sourced. A fitter who measures to the
centre of the fist or to the grip will get a larger number. **Weak**: fitter landmarks are not
published (see the gap in §7).

**Results, as a percentage of stature (mean ± 1 SD).**

| Measure | Men (n = 4,082) | Women (n = 1,986) |
|---|---|---|
| Stature | 1756 ± 69 mm | 1629 ± 64 mm |
| Inseam (crotch height) | **48.15 ± 1.41 %** | **48.02 ± 1.51 %** |
| Sternum height (suprasternale) | **81.91 ± 0.71 %** | **81.64 ± 0.71 %** |
| Torso (suprasternale − crotch) | **33.75 ± 1.39 %** | **33.62 ± 1.34 %** |
| Arm (acromion→radiale→stylion) | **34.34 ± 1.01 %** | **33.92 ± 1.08 %** |
| Arm (acromial ht − wrist ht) | 33.77 ± 1.08 % | 33.21 ± 1.12 % |
| Span | 103.30 ± 2.74 % | 101.95 ± 2.92 % |

Grade: **Well sourced** as statistics of ANSUR II. Applying them to civilian cyclists is
**Moderately sourced**. The sample is military, aged 17–58 (median 28 for men, 27 for women; about 85% are 40 or younger), screened for fitness, and
US-mixed in ethnicity.

**Ratios drift with stature.** Taller people have proportionally longer legs. A linear fit on
stature (mm), with the residual SD (the "±1 SD" at a given height), gives:

| Measure | Men | Women |
|---|---|---|
| Inseam | `−176.3 + 0.5821·S`, resid SD 23.9 | `−179.1 + 0.5904·S`, resid SD 23.6 |
| Sternum height | `−101.4 + 0.8769·S`, resid SD 11.7 | `−93.6 + 0.8740·S`, resid SD 11.0 |
| Torso | `74.9 + 0.2948·S`, resid SD 24.2 | `85.5 + 0.2836·S`, resid SD 21.5 |
| Arm (segments) | `−35.4 + 0.3636·S`, resid SD 17.6 | `−58.5 + 0.3752·S`, resid SD 17.5 |

From the regression, the expected male inseam is 47.5% of stature at 1650 mm and 48.9% at
1900 mm. That drift is about 1 SD across the range. **Classify with the regression
form, not a fixed ratio.**

**Torso adds almost nothing beyond inseam.** Sternum height is very tight (SD 0.71% of stature,
r = 0.98 with stature). So torso% and inseam% are almost mirror images: r = −0.87 for men and
−0.88 for women. In practice, "long torso" means "short legs for the height". Arm% correlates
+0.52 to +0.58 with inseam% and −0.39 to −0.45 with torso%.

**Suggested classification.** Let *z* = (measured − predicted from stature) / residual SD,
computed separately for men and women. Use **long** for *z* > +1, **short** for *z* < −1, and
**typical** in between. By construction, about 16% of people fall into each tail. The band is a
convention, not a cycling finding. Holliday & Swart (§1.9) found that arm length predicted no
fit variable.

**Sanity check against the reference rider** (male, 183.0 cm):

| Measure | Rider | ANSUR II predicted at 1830 mm | *z* | Fitter's "vs average" |
|---|---|---|---|---|
| Inseam | 88.6 cm | 88.9 cm (ratio: 88.1) | −0.1 | +0.5 → fitter average 88.1 |
| Sternum height | 148.9 cm | 150.3 cm (ratio: 149.9) | −1.2 | +0.7 → fitter average 148.2 |
| Arm | 61.2 cm | 63.0 cm (ratio: 62.8) | −1.0 | +1.3 → fitter average 59.9 |
| Torso | 60.3 cm | 61.4 cm (ratio: 61.8) | −0.5 | — |

The inseam agrees with the fixed-ratio ANSUR value to 0.0 cm. **Sternum height and arm do
not.** The fitter's average sternum is 2.1 cm lower and the fitter's average arm is 3.1 cm
shorter than ANSUR at the same height. Against ANSUR, the rider is *short* in sternum and arm
(*z* ≈ −1). Against the fitter, he is above average. The fitter either uses a different
reference population or ends the arm at a different landmark, or both. Neither is
published. **velofit must say which reference it uses**, and it must not mix its labels with
a fitter's "+x cm vs average".

---

## 9. Triathlon / TT sizing

Research date: 2026-11-22. Added for velofit's tri mode; same rules as §8. Sources are numbered
on from §6 (51–70), and the gaps are listed in §7. Grades are the §7 ones: **Well sourced**,
**Moderately sourced**, **Weak**, **No source**, plus **manufacturer guidance**, which is never
counted as evidence.

**Context.** Tri mode keeps the road mode's matching rule: frames whose published rider-height
band contains the rider's height, then compared by frame stack and reach. There is still no
body-based reach formula (§2.3). The question for each BuyFit card is whether the road number
carries over to an aero position on a 78–81° effective seat angle.

**Summary for implementation.**

| Card | Tri output | Grade |
|---|---|---|
| Saddle height | **Same band, 0.870–0.895 × inseam.** No tri shift. Add a note. | Road band: Moderately sourced. Any tri shift: **Weak** |
| Crank length | **165 mm**, "shorter (155–160) is fine if you have it". | Direction: Moderately sourced. Number: **Weak** |
| Handlebar width | **Hide.** Replace with an information card on pad width, no number. | **No source** for any body rule |
| Saddle width | **Do not apply sit bones + allowance to nose-forward saddles.** Keep the rule only for conventional saddles, at +10 mm. | Manufacturer guidance, and it conflicts |
| Frame shortlist | Keep the height-band match, labelled as a coarse filter. | Moderately sourced |

### 9.1 Saddle height in an aero position

**What the studies on steep seat angles did and did not test.** Four peer-reviewed papers vary
seat-tube angle in the tri range. None compares the *optimal* saddle height between road and TT.

- **Price & Donne 1997** [51]: 68°, 74° and 80°, each at 96, 100 and 104% of trochanteric height.
  80° beat 74° on VO₂ and efficiency **at all three heights**, and hip range of motion was smaller
  at 80° than at 68°. The abstract reports no optimum height per angle. So the paper says a steep
  angle helps whatever the height. It does not say the height should change.
- **Garside & Doran 2000** [52]: 73° vs 81°, n = 8 triathletes. The 10 km run after the 81° ride
  was faster. How saddle height was carried across the two frames was not captured.
- **Ricard et al. 2006** [53]: 72° vs 82°. Riders "self-selected their seat height" each session,
  so height was not controlled and the paper cannot answer this question.
- **Heil & Pickels 2019** [54]: 76° vs 80° in TT positions. The only text seen says mean knee
  angle was insensitive to seat-tube angle while hip angle changed. **Full text not read.**

Two further papers support the same mechanism. **McDonald, Holliday & Swart 2022** [56] moved the
saddle ±3 cm fore-aft and then re-set height to hold static angles; knee stayed at 31.5–32.6°.
**Jongerius et al. 2022** [55] found TT-trained riders prefer a more forward hip. So steepening
the seat angle rotates the rider forward around the bottom bracket. The hip angle opens; the knee
angle, which saddle height sets, does not need to move. **Moderately sourced** for the mechanism
(abstracts and excerpts only); **No source** for a different multiplier.

**What fitters and manufacturers say. They disagree in direction.**

| Source | Tri vs road saddle height (BB to saddle top) |
|---|---|
| Empfield, Slowtwitch 2007 [58] | **+10–12 mm** in his own case; about 2° of knee, the rest from sitting "nearer the nose" |
| ISM setup guide [64] | **−5 mm** when moving to a noseless saddle, "to maintain the same body height" |
| Bike Fit Adviser (fit-targets §3) | slightly **more** knee flexion on tri (i.e. lower) |
| BikeFittr (fit-targets §3) | **less** knee flexion on tri (i.e. higher) |
| BikeFit.com [66] | no tri-specific height; knee 27–37°; "the millimeter adjustment is not as important as you might believe" |

The two effects that move the number are known, and they cancel in part. Sitting on the nose
lowers the effective height, because the seat tube measurement is taken further back than where
the rider sits; that argues for a taller post. A noseless saddle puts the sit point lower and
further back on the shell; that argues for a shorter one. Neither is a body measurement.

**Rule for velofit.** Print the road band unchanged: **0.870–0.895 × inseam**, BB centre to
saddle top along the seat tube. Add one line: "On a tri bike you sit further forward. Fitters
move this by about 1 cm either way, depending on the saddle. Set it on the bike." Grade:
**Moderately sourced** for the band itself (§2.1); **Weak** for any tri-specific shift, which is
why none is applied. This agrees with `fit-targets-research.md` §3: no tri-specific target.

**Reference rider check.** Inseam 886 mm gives **771–793 mm**. The studio set **775 mm**
(0.875 × inseam), inside the band near the low end. The band holds for this rider.

### 9.2 Crank length in an aero position

**Mechanism: sourced.** In an aero position the hip is most closed at top dead centre. A shorter
crank lowers the knee at TDC and opens that angle.

- **Ferrer-Roca et al. 2017** [59] (n = 12): ±5 mm from the preferred length. A longer crank
  raised maximum hip and knee flexion by about 1–3.4° (abstract versions differ), with **no
  change in gross efficiency**. The authors: if in doubt between two lengths, take the shorter.
- **Reynolds et al. 2025** [60]: small crank reductions lowered hip and knee flexion and
  non-sagittal motion, with **no change in power output**. Abstract only.
- **Martin & Spirduso 2001** [6]: 145 and 170 mm were not separable on maximal power (§3.2).
- **Li et al. 2025** [7]: 175 mm gave worse perceived fatigue than 165 or 170 (§3.2).

None of these tested an aero position. The step from "shorter opens the hip" to "a tri rider
should go shorter" is an inference, but every source located draws it and none argues against
it. **Moderately sourced** for the direction.

**Number: weak.** Martin is relayed as recommending **165 mm** for TT, the shortest stock
length [61]; that is a secondary paraphrase. Shorter lengths (150–160) are fitter and pro
practice (§3.2: GB track 165/160), not study results. By Ferrer-Roca's figures, 170 → 165 opens
the TDC hip angle by roughly 1–3°, a derived estimate.

**Rule for velofit.** Tri mode outputs **165 mm**, with the note: "Shorter (155–160 mm) is fine
if your hip feels closed at the top of the stroke; no study found a power cost for going
shorter." It is the same as the current `'racy'` band. Grade: **Moderately sourced** (direction),
**Weak** (the specific 165).

### 9.3 Handlebar width, and pad width

**Base-bar width.** On aerobars the hands are on the base bar only for climbing, cornering and
braking. Tri base bars come as part of the cockpit, often with integrated bars, so the rider
rarely picks a width. The shoulder-width rule (§3.1, Lin 2025) was tested on a road position
with hands on the bar. **No source** transfers it to a tri base bar.

**Pad (elbow) width.** No study relates armrest width to shoulder width.

- **Wind tunnel** [62]: 14 track cyclists. Bar height affected drag area more than elbow-pad
  separation, and the optimum varied a lot between riders. **Weak** (abstract only, authors not
  confirmed). It argues against a body formula.
- **Fitters disagree on the reference.** A retailer guide says pads should align with shoulder
  width (search summary only). Fit Werx [63] says the upper arms should shield the body "but
  [not be] wider than, the thighs and hips". A Slowtwitch forum fitter proposed a formula from
  shoulder width and extension spacing, as an idea only. None has data.
- Pad width is usually quoted **centre-to-centre**; ranges on stock bars run roughly 150–250 mm
  (forum examples: 221, 243 mm). Not a recommendation.

**Rule for velofit.** **Hide the handlebar-width card** in tri mode. If a card is kept, make it
information only: "Aerobar pad width is set during a fit. It depends on shoulder mobility and
aerodynamics more than on shoulder width, and no study gives a body rule." Print no number.
Grade: **No source** for any rule.

### 9.4 Saddle width for tri saddles

**Conventional saddles in an aero position.** The §8 rule applies, at the narrow end. The pelvis
is rotated furthest forward, so contact moves forward onto the converging rami (§8.2).
bike-components.de gives **+0** for a "fully stretched" tri position [42]; SQlab gives +10 mm for
its sportiest position [37]; Kopecky [65] says widest point equal to sit bones or 1–3 cm wider.
Grade: **manufacturer guidance**, and the guidance spreads 0–30 mm.

**Nose-forward and split-nose saddles (ISM, and similar).** These are not sized the same way.

- **ISM** [64]: "We do not use sit bone width to determine which saddle you should choose."
  ISM's model choice is by bike type and padding, not by width. The rider sits on the pubic rami,
  and the saddle goes 5–8 cm further back and about 5 mm lower than a nosed saddle.
- Kopecky [65] warns that some noseless saddles quote a maximum width outside the sitting area;
  their effective width can be 110–120 mm.
- No pressure-mapping study of sit-bone width against a nose-forward saddle was located. Lin 2023
  (§8.1) used conventional shells. **No source.**

**Rule for velofit.** In tri mode:

1. Show sit bones **+ 10 mm** labelled "conventional saddles only" (the existing `'racy'`
   allowance). Grade: manufacturer guidance (SQlab).
2. Add: "Nose-forward tri saddles (e.g. ISM) are not sized from sit bones. The maker says so.
   Choose by test ride; set it about 5 cm further back and 5 mm lower than a normal saddle."
   Grade: manufacturer guidance (ISM).

Do not print a tri-saddle width.

### 9.5 Frame size choice: why frame stack and reach are only a coarse filter

**The published method is fit first, then frame.** Empfield introduced stack and reach to pick a
frame from a known position (§1.5). His tri version uses **Pad Y / Pad X**: vertical and
horizontal BB-to-armrest distances [67]. "Tri bikes are harder because you have a handlebar on
top of a handlebar." BikeFit.com says the same: get a fit before you buy [66]. Manufacturers
follow it. Orbea and Trek publish Pad X/Y charts that map pad coordinates to a size *and* a stem
and pedestal setup [67, 68]. Cervélo's fit rep on Slowtwitch sizes P-Series riders from pad stack
and pad reach, not from height [70]. Grade: **Moderately sourced** as the accepted method. No
study tests it, and no source argues against it.

**Why the frame number is coarse, stated so the UI can say it.**

1. **The front end adds most of the stack.** Aerobar risers, pedestals and stems sit between the
   head-tube top and the pads. On integrated cockpits the frame stack/reach cannot be turned
   into pad coordinates by simple arithmetic [67].
2. **Adjacent sizes overlap.** One rider's 630/500 pad position "could ride either an M or an L"
   Ordu [68]. The reference rider got M–L for Ordu and Timemachine: the same overlap.
3. **Tri frames converge.** Many M/L tri frames sit near stack 540 / reach 425 mm [69], so frame
   numbers separate brands less than the cockpit does.
4. **Reach is still not predictable from the body** (§2.3, Holliday & Swart). The tri position
   is more sensitive to flexibility (torso 12–25°, fit-targets §3), which a tape measure cannot
   see.
5. **Pad conventions differ.** Back of pad vs middle of pad, and centre vs edge [70]. Fit sheets
   are not comparable without the convention.

**Suggested UI text.** "Tri bikes are sized from where your armrests need to be, not from your
height. These frames suit your height. Which size works best depends on the cockpit (risers,
stem, extensions) and is set in a fit. If two sizes are shown, both can usually fit you."

### 9.6 Reference rider (studio tri fit)

Male, 183 cm, inseam 88.6 cm. Studio recommendations: Orbea Ordu **M–L**, BMC Timemachine 01
**M–L**, Cervélo P-Series **56**.

- **Saddle height 77.5 cm = 0.875 × inseam.** Inside the road band (77.1–79.3 cm), §9.1.
- **Frames.** Two brands given as two sizes: consistent with §9.5, point 2. The same Cervélo fit
  thread shows a 183 cm rider told "56 likely right" [70]; anecdotal, but it agrees.
- **"Sattelposition 16.3 cm".** The reference point is not documented. The plausible reading is
  **horizontal distance from the BB centre back to the saddle's sitting reference** (saddle
  centre or sit point). At 775 mm along the seat tube, 163 mm behind the BB is an effective seat
  angle of acos(163 / 775) ≈ **77.9°**, inside the 78–81° tri range. If instead it were the
  saddle *nose* 163 mm behind the BB, the sit point would be about 26 cm back, a road angle near
  70°, which does not fit a tri bike. For comparison, UCI time trials require the nose at least
  5 cm behind the BB (relayed by [66]). Treat this reading as **derived, unverified**: ask the
  studio which point they measure to before velofit displays it.
