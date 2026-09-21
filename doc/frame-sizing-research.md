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

---

## 7. Confidence and gaps

### Well sourced

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
