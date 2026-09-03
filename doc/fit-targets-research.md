# Bike-fit target ranges: sourced reference

Research date: 2026-09-03. Compiled to replace the unvalidated placeholders in
`lib/fit_targets.dart` with discipline-specific ranges (road endurance, mountain bike
trail/XC, triathlon/TT).

**Every number in this document is expressed in the app's own conventions** (restated
below). Where a source uses a different convention, the conversion arithmetic is shown
inline.

---

## 0. Conventions, and the three that bite

App conventions (from the measurement spec):

| Metric | App definition |
|---|---|
| `kneeFlexion` | `180 − (interior hip-knee-ankle angle)`, sampled at **bottom of stroke (6 o'clock)**. Straight leg = 0. |
| `hipAngle` | Interior shoulder-hip-knee angle, at **bottom of stroke**. |
| `torsoAngle` | Shoulder-to-hip line vs **horizontal**. 0 = flat back, 90 = bolt upright. |
| `elbowAngle` | Interior shoulder-elbow-wrist angle. |
| `KOPS` | Signed horizontal mm, front knee to pedal spindle, at 3 o'clock. **Positive = knee ahead of spindle.** |
| `saddleHeight` | mm, BB centre to saddle top, along the seat tube. |

Three convention problems must be understood before reading the tables:

**(a) `kneeFlexion` — the app's convention is the *minority* one in prose, but the
majority one in fit software.** Books and papers usually quote the *interior* knee angle
at BDC (e.g. "145°"). Retul, Velogic and most motion-capture systems quote *knee
extension angle* = degrees from straight, which is exactly the app's `kneeFlexion`.
Conversion throughout: `app = 180 − interior`.

**(b) `hipAngle` at bottom of stroke is a non-standard sampling point.** Virtually all
published hip-angle targets are the **minimum** hip angle, which occurs at the **top** of
the stroke ("closed hip angle"). The app samples at the bottom, which gives the
**maximum** hip angle — a number roughly 45–50° larger. The current placeholder of
**40–50° is a top-of-stroke number applied to a bottom-of-stroke measurement** and is
geometrically impossible at BDC. Only one source located publishes a max-hip-angle
(Velogic Studio), and it is the basis for the road and tri rows below.

Sanity check on the ~45–50° offset: Bike Fit Adviser gives hip angle at 12 o'clock as
44–58°; Velogic gives hip angle max (i.e. 6 o'clock) as 90–105° for road. 90 − 44 = 46;
105 − 58 = 47. A 2D geometric reconstruction (740 mm saddle height, 172.5 mm cranks,
73° effective seat angle, 45° torso) puts the thigh 7° below horizontal at TDC and 57°
below horizontal at BDC — a 50° hip excursion, consistent with both.

**(c) `elbowAngle` changes meaning on aerobars.** Confirmed — see §4.

---

## 1. Road endurance

| Metric | Proposed range (app convention) | Primary basis | Source agreement |
|---|---|---|---|
| `kneeFlexion` | **30 – 40°** | Ferrer-Roca et al. 2012 (dynamic); Retul; Velogic | Good among *dynamic* sources; static goniometry sources sit 5–8° lower (25–35°). |
| `hipAngle` (at BDC) | **90 – 105°** | Velogic Studio road metrics ("Hip Angle: Max 90-105, up to 120 if rider has issues") | Only one direct source; corroborated arithmetically from top-of-stroke figures. |
| `torsoAngle` | **40 – 50°** | Velogic Studio ("40-50 general"); BikeFittr (35–50) | Good. Both agree 35 is racy, 50+ is unusual. |
| `elbowAngle` | **150 – 170°** | Velogic Studio (155–170); BikeFittr (150–170) | Good, but hand-position dependent (see caveats). |
| `KOPS` | **−40 to 0 mm** (knee at, or up to 40 mm behind, the spindle) | Velogic Studio "Knee Over Foot: 0 to -40"; SportCoaching "0–20 mm behind" | Poor. Landmark ambiguity alone spans 10–40 mm. See §5. |
| `saddleHeight` | **0.870 – 0.895 × inseam (mm)** — no absolute mm range exists | LeMond/Guimard 0.883 × inseam; Hamley & Thomas 1.09 × inseam | Good, and the two formulas agree to ~1.5 mm. |

Conversions shown:

- Ferrer-Roca 2012 recommends "a knee angle between 30 and 40° of flexion" for **dynamic**
  measurement — already the app's convention, no conversion needed. The same paper places
  the **static** goniometric equivalent at 25–35°, i.e. the Holmes et al. 1994 range.
  Ferrer-Roca reports dynamic knee flexion at BDC is significantly greater than static
  (reported elsewhere as ~5–10°, one figure quoted as 8°). *The app measures from video
  and is therefore a dynamic method: use 30–40, not 25–35.*
- Retul's published averages are "flexion 110° ±3, extension 37° ±3". Retul "extension
  angle" is degrees from straight at BDC = the app's `kneeFlexion`. 37 ± 3 → **34–40°**.
  (Retul "flexion 110" is at top of stroke and has no app equivalent.)
- Velogic Studio road: "Knee Angle: Max 140-145". This is the interior angle at maximum
  extension (BDC). `180 − 145 = 35`, `180 − 140 = 40` → **35–40°**.
- BikeFittr chart, "Saddle Height … Knee angle at bottom of pedal stroke", road 140–150°
  interior. `180 − 150 = 30`, `180 − 140 = 40` → **30–40°**.
- Bike Fit Adviser (John Weirath PT) gives "34°-48° (from full knee extension)" at
  6 o'clock and states this explicitly "replaces outdated 25°-35° static measurement
  standard" — already app convention, no conversion. This is the widest published range
  and the top end (48) is an outlier against every other source.
- Saddle height, LeMond: `0.883 × 840 mm inseam = 741.7 mm` (BB centre to saddle top along
  seat tube — identical to the app's definition, no conversion).
  Hamley & Thomas: `1.09 × 840 = 915.6 mm` measured saddle top **to pedal axle**, so
  `app = 915.6 − 172.5 (crank) = 743.1 mm`. The two differ by 1.4 mm at this inseam.
  A peer-reviewed comparison found no significant difference between the methods
  (p = 0.917).

Note on the sampling point: Ferrer-Roca's dynamic protocol measures with the **crank
aligned with the seat tube**, not at 6 o'clock. Maximum knee extension occurs when the
pedal is furthest from the hip, which is roughly the seat-tube-aligned position, so the
app's 6 o'clock sample will read approximately 1–3° *more* flexion than Ferrer-Roca's.
This is within the noise of the range but is a real systematic offset.

---

## 2. Mountain bike (trail / XC)

**This is the weakest discipline in the literature by a large margin.** No fit-system
vendor located publishes an MTB metrics table: Velogic Studio has road and triathlon
metric pages and **no MTB page** (confirmed 404; the sitemap has none). BikeFittr's angle
chart covers road and tri only. Fit Kit Systems' MTB fitting guide gives **no numeric
angle targets at all** — only "going a little lower with the saddle height on a mountain
bike … than what the same rider might prefer on a road bike".

| Metric | Proposed range (app convention) | Basis | Confidence |
|---|---|---|---|
| `kneeFlexion` | **33 – 45°** | Bike Fit Adviser 42–48; derived road + 1.5–3° | **Weak.** One named source, contradicted by derivation. |
| `hipAngle` (at BDC) | **90 – 110°** (derived, not sourced) | Road value, adjusted for more upright torso and lower saddle | **None.** No source. |
| `torsoAngle` | **45 – 60°** (derived, not sourced) | Bar-height convention | **None.** No source. |
| `elbowAngle` | **140 – 165°** (derived, not sourced) | Road low end extended | **None.** No source. |
| `KOPS` | **−30 to −15 mm** | SportCoaching ("15–30mm" behind, MTB) | **Weak.** Single non-primary source. |
| `saddleHeight` | **0.865 – 0.890 × inseam**, i.e. road − 5 to 10 mm | Widely-repeated fitter consensus | **Medium-low.** Direction is agreed; magnitude is not measured anywhere. |

Reasoning shown for each derived value, since these are *not* sourced:

- `kneeFlexion`: Bike Fit Adviser is the only named source that puts a number on MTB —
  "likely to be anywhere from a couple to many degrees more into flexion — so perhaps
  42°-48° with a lower overall saddle height". Independently: the consistently-reported
  practice is a saddle 5–10 mm lower than road. Ferrer-Roca's saddle-height work implies
  roughly 2.5–3° of knee angle per 10 mm of saddle height, so road (30–40) + 1.5–3°
  → **32–43°**. The two disagree: Bike Fit Adviser's 42–48 would imply a saddle roughly
  25–30 mm lower than road, far more than the stated 5–10 mm. The proposed 33–45 spans
  both and should be treated as a placeholder, not a target.
- `hipAngle`: no source at any crank position for MTB. Two effects roughly cancel — a
  more upright torso opens the hip (+5–10°), a lower saddle closes it at BDC (−2–4°) —
  so road ±10 is the honest answer. Marked derived.
- `torsoAngle`: no source. Fit Kit Systems gives grip height relative to saddle height as
  "4cm below saddle height to 8 cm above" for MTB, versus a typical road drop of 5–12 cm
  below. That is roughly 10–15 cm more bar height, which for a ~55–60 cm torso is
  ~10–15° more upright. Road 40–50 + 10 → 50–60; widened downward to 45 to cover XC
  positions that approach road. Marked derived.
- `elbowAngle`: no source. Riders hold more elbow bend on rough terrain for control, so
  the range should be extended downward rather than shifted. Marked derived.

**Recommendation:** if you would rather not ship derived numbers, ship road values for
`hipAngle`, `torsoAngle` and `elbowAngle` on MTB with a visible "not discipline-specific"
note in the UI. That is defensible; inventing an MTB-specific-looking number is not.

---

## 3. Triathlon / TT (on aerobars)

| Metric | Proposed range (app convention) | Basis | Source agreement |
|---|---|---|---|
| `kneeFlexion` | **30 – 42°** | Velogic (35–40); BikeFittr (25–35); Bike Fit Adviser (road + 2–3°) | **Poor — sources disagree on the sign of the difference from road.** |
| `hipAngle` (at BDC) | **85 – 105°** | Velogic Studio triathlon metrics ("Hip Angle: Max 85-105, up to 120 if rider has issues") | Single source. Do not conflate with the FIST "hip angle" (§4). |
| `torsoAngle` | **12 – 25°** | Velogic ("10-15 for Elite, 20-30 general"); BikeFittr (15–30); Fintelman et al. 2014 | Good on magnitude; the elite/age-grouper split is large. |
| `elbowAngle` | **90 – 110°** | BikeFittr ("Elbow angle on hoods or extensions", tri 90–110) | Single source, but corroborated geometrically and by the forearm-angle convention. |
| `KOPS` | **+20 to +60 mm** (knee **ahead** of spindle) | SportCoaching (+20 to +40); Velogic "Knee Over Foot: 20 to 80" | Sign is well established; magnitude spread is 60 mm. |
| `saddleHeight` | **No defensible discipline-specific range.** Use the road value ±10 mm. | See below | **Poor.** Sources contradict each other by up to 2 cm in both directions. |

Conversions and notes:

- Velogic tri: "Knee Angle: Max 140-145" → `180 − 145 = 35` to `180 − 140 = 40` → 35–40°.
  Identical to their road figure, i.e. Velogic says tri does not change knee angle.
- BikeFittr tri: 145–155° interior → `180 − 155 = 25` to `180 − 145 = 35` → 25–35°, i.e.
  **less** flexion than their road 30–40 (a higher effective saddle).
- Bike Fit Adviser: "likely to be a little more knee flexion on the tri/TT bike (so our
  hypothetical 40° road rider may be in the 42°-43° range)" — already app convention,
  i.e. **more** flexion than road.
  These three sources point in three directions. The proposed 30–42 is the union of the
  plausible middle, and the disagreement should be surfaced in the UI rather than hidden.
- Torso angle: Fintelman, Sterling, Hemida & Li (2014) collected data from 19 TT cyclists
  across **torso angles of 0–24°** — confirming that this is the real-world span — and
  modelled the optimum as speed-dependent: aerodynamic losses outweigh power losses only
  above 46 km/h, and "a fully horizontal torso is not optimal for speeds below 30 km/h".
  Their torso angle is measured from horizontal, the same as the app. For an age-group
  triathlete riding 30–40 km/h this argues for the upper half of the range, hence 12–25
  rather than Velogic's elite-oriented 10–15.
- Saddle height: no consensus was found. Reports range from "1–2 cm higher than road" to
  "1 cm lower than road", with experienced fitters noting professionals change little and
  that the answer depends entirely on how the measurement is taken. Compounding this, on
  a 76–80° seat tube the BB-to-saddle-top distance is a poor proxy for hip-to-pedal
  distance, and tri riders frequently sit forward of the saddle's neutral point, which
  changes effective saddle height by 10–20 mm without moving the post. **Recommend not
  showing a tri-specific saddle-height target at all.**

---

## 4. Metrics whose *meaning* changes by discipline

### 4.1 `elbowAngle` on aerobars — confirmed, and it is a definitional change

On a road bike the elbow is near-extended on the hoods (150–170°). On aerobars the
forearm rests on the extensions roughly horizontal and the upper arm hangs roughly
vertical, so the interior shoulder-elbow-wrist angle collapses to **about 90°**.

Confirmed two ways:

1. BikeFittr's chart gives tri elbow bend as **90–110°** against road's 150–170°.
2. Velogic Studio's triathlon page **does not list an elbow angle at all** — it replaces
   it with "Forearm Angle: Average 0-20 (5-10 is a good starting point)", i.e. forearm
   inclination from horizontal, and "Shoulder Angle: Average 75-100" (torso-to-upper-arm).
   Reconstructing the elbow angle from those: with a 12° torso and a 90° shoulder angle
   the upper arm points ~78° below horizontal, and with the forearm at +8°, the interior
   elbow angle is `90 − 12 + 8 ≈ 86°`, rounding to 90–95°. Consistent with BikeFittr.

Implication for the app: elbow angle on a tri profile is a much weaker fit signal than on
road — the 90° is almost forced by the armrest geometry rather than being something the
rider chooses. Consider showing forearm-from-horizontal (0–20°) instead, which is the
metric tri fitters actually use and which the app already has the keypoints for.

### 4.2 `hipAngle` — two unrelated quantities share the name

There are **three** distinct "hip angles" in circulation, and only one matches the app:

| Name | Landmarks | Crank position | Typical value |
|---|---|---|---|
| App / Velogic "hip angle max" | shoulder – hip – knee | 6 o'clock | 85–105° |
| "Closed" / minimum hip angle | shoulder – hip – knee | 12 o'clock | 44–60° |
| FIST / BikeFit hip angle | **bottom bracket – greater trochanter – acromion** | none (static) | ~100° |

The FIST/BikeFit figure is the one most often quoted for triathlon ("hip angle ~100°",
"shoulder angle 80° per Slowtwitch / 90° per BikeFit"). It uses the **bottom bracket** as
the distal reference instead of the knee and does not depend on crank position at all.
It happens to land near 100°, numerically close to the app's BDC range, **by coincidence**.
Do not cite FIST's 100° as support for the app's hipAngle target.

### 4.3 `torsoAngle` — same definition, but road values are hand-position-dependent

The definition (shoulder-hip line from horizontal) is stable across disciplines. The
problem on road is that the rider chooses the hand position: Dan Empfield's argument
against body-angle targets for road fits is exactly this — "the road position is highly
fungible, and the hip, elbow and shoulder angles your body forms when riding
correspondingly fungible. And therefore not reliably measurable." A road rider on the
tops versus in the drops can differ by 15° of torso angle with no change to the bike.
The app should record which hand position the video was shot in, or state the assumption
(hoods) in the UI.

---

## 5. KOPS: sign, magnitude, and the case against measuring it at all

### Established position by discipline (app sign convention: + = knee ahead)

| Discipline | Range | Source |
|---|---|---|
| Road endurance | −40 to 0 mm | Velogic "Knee Over Foot: 0 to -40"; SportCoaching "0–20mm behind the spindle" for endurance |
| Mountain bike | −30 to −15 mm | SportCoaching |
| Triathlon / TT | **+20 to +60 mm** | SportCoaching "20–40mm ahead", with seat tube angles of 76–80° vs road's 72–74°; Velogic "Knee Over Foot: 20 to 80" |

Sign inference: Velogic does not document its sign convention on the metrics pages. Road
is given as `0 to -40` and triathlon as `20 to 80`; the only reading consistent with
universal fitting practice (road knee at or behind the spindle, tri knee ahead of it) is
**positive = ahead**, matching the app. Flagged as an inference, not a documented fact.

**The tri claim is confirmed and it is a consequence of geometry, not intent.** Nobody
sets out to put the knee 40 mm forward; the steep 76–80° seat tube rotates the whole rider
forward around the BB to open the hip angle at the top of the stroke, and the forward
knee is what falls out. BikeFit state plainly that KOPS "is NOT a starting point for
triathlon bike fit, unlike in road or mountain bike fitting" and is used only to check
left/right asymmetry.

### The caveat, documented

The metric is contested by essentially every high-trust source:

- **Keith Bontrager**, "The Myth of K.O.P.S.": "The KOPS rule of thumb has no biomechanical
  basis at all. It is, at best, a coincidental relationship." His argument is that the
  plumb line "uses gravity as its reference, and the direction of gravity has no bearing
  on pedaling efficiency", evidenced by recumbent riders pedalling efficiently with a
  completely different knee-spindle relationship. He notes the rule "probably grew out of
  someone's observations that many successful riders sit on their bicycles with their
  knees somewhere over the pedal spindle."
- **Steve Hogg**: "KOPS / TTOPS has no foundation anyway. Like a lot of cycling lore,
  KOPS / TTOPS has achieved validity by repetition." And: "I don't own a plumb line or any
  other means of measuring KOPS / TTOPS. To do so would indicate that I give it some
  credence, which I don't. It is irrelevant." He also points out the acronym is wrong —
  the intended landmark is the **tibial tuberosity**, not the knee. He sets saddle setback
  with a balance test (hard effort in the drops, then hands off) instead.
- The defence of KOPS that survives is weak and indirect: it "succeeds as a good predictor
  of the hip position relative to the seat tube axis — not due to biomechanical principle,
  but because it correlates with balanced positioning on standard road geometry", which by
  construction fails on non-standard geometry, i.e. on tri bikes.

### The landmark problem — this one directly affects the app

Published KOPS numbers are measured to the **tibial tuberosity** (the bump below the
kneecap) or, in older references, to the front of the patella. The app measures to the
**pose-estimated knee joint centre**, which sits roughly 30–40 mm posterior and 40–50 mm
proximal to the tibial tuberosity. At the 3 o'clock crank position the app will therefore
read systematically **more negative** than a plumb-line KOPS taken by a fitter — plausibly
by 20–40 mm, which is the entire width of the road target range.

Sources acknowledge this directly: SportCoaching notes older references differ on landmark
location, "producing 10–20mm variation in results", and other fitting material puts the
total spread across expert definitions at around 80 mm. Sheldon Brown's page notes there
"is little agreement about what part of the knee should fall directly over the spindle".

The Velogic figures (`0 to -40` road, `20 to 80` tri) are the ones to prefer for this app,
because Velogic is also a marker/pose-based system measuring to a knee marker rather than
a plumb line off the tibial tuberosity — so its numbers are on the same footing as the
app's. **If you calibrate against SportCoaching's plumb-line numbers instead, expect the
app to disagree with a real fitter by 2–4 cm.**

---

## 6. Ranges that depend on things this app does not measure

Any of these can move a metric outside its target range without the fit being wrong.

| Unmeasured variable | Metrics it corrupts | Magnitude |
|---|---|---|
| **Crank length** | `kneeFlexion`, `saddleHeight`, `KOPS` | Longer cranks push the foot further from the hip at BDC and closer at TDC. Hamley's formula is crank-inclusive, LeMond's is not — the 1.4 mm agreement shown in §1 holds only near 172.5 mm cranks. A 165 vs 175 mm crank shifts BDC knee flexion by roughly 2–3°. |
| **Cleat fore-aft position** | `kneeFlexion`, `KOPS` | Moving the cleat 10 mm rearward effectively lengthens the foot lever and changes both BDC knee angle and the knee-to-spindle horizontal offset. |
| **Shoe stack height / pedal system** | `kneeFlexion`, `saddleHeight` | Different pedal/shoe combinations vary by 5–10 mm of effective saddle height. |
| **Saddle setback and seat tube angle** | `KOPS`, `hipAngle`, `torsoAngle` | The whole tri-vs-road KOPS difference is this variable. The app measures the consequence, not the cause. |
| **Ankling style / plantarflexion at BDC** | `kneeFlexion` | This is the mechanism behind the static-vs-dynamic 5–10° gap. A toe-down rider reads several degrees less knee flexion than a heel-dropper at the identical saddle height. Bike Fit Adviser explicitly defines its knee-extension target as "accounting for natural ankle plantarflexion". |
| **Hamstring / hip flexibility, torso and femur length** | `torsoAngle`, `hipAngle` | Both Velogic and BikeFittr publish flexibility-conditional widenings ("up to 120 if rider has issues", "recreational/less flexible riders 52-58° vs fit/mobile riders 44-50°"). The app has no way to select this. |
| **Hand position on road (hoods/drops/tops)** | `torsoAngle`, `elbowAngle` | Up to 15° of torso angle. See §4.3. |
| **Rider inseam** | `saddleHeight` | Absolute. There is **no** absolute mm target for saddle height at any discipline; the metric is only interpretable as a fraction of inseam. |

---

## 7. Sources

**Peer-reviewed**

1. Holmes JC, Pruitt AL, Whalen NJ. "Lower extremity overuse in bicycling." *Clinics in
   Sports Medicine*, 1994;13(1):187–205. Origin of the 25–35° knee flexion at BDC
   recommendation (static goniometer, crank at 6 o'clock), with 25–30° cited as the
   injury-minimising target. Andy Pruitt is a co-author; this is the underlying source for
   the figure repeated throughout his *Complete Medical Guide for Cyclists*.
2. Ferrer-Roca V, Roig A, Galilea P, García-López J. "Influence of saddle height on lower
   limb kinematics in well-trained cyclists: static vs. dynamic evaluation in bike
   fitting." *Journal of Strength and Conditioning Research*, 2012;26(11):3025–3029.
   DOI: 10.1519/JSC.0b013e318245c09d. Recommends **30–40°** knee flexion for dynamic
   (2D video) measurement against 25–35° for static, measured with the crank aligned with
   the seat tube. **This is the single most directly applicable source for this app**,
   because the app is a dynamic 2D video method.
   https://journals.lww.com/nsca-jscr/fulltext/2012/11000/influence_of_saddle_height_on_lower_limb.16.aspx
3. Ferrer-Roca V, Bescós R, Roig A, Galilea P, Valero O, García-López J. "Acute effects of
   small changes in bicycle saddle height on gross efficiency and lower limb kinematics."
   *Journal of Strength and Conditioning Research*, 2014;28(3):784–791. Basis for the
   degrees-per-mm sensitivity used in the MTB derivation.
4. Bini R, Hume PA, Croft JL. "Effects of bicycle saddle height on knee injury risk and
   cycling performance." *Sports Medicine*, 2011;41(6):463–476.
   DOI: 10.2165/11588740-000000000-00000. Review underpinning the injury rationale for
   the knee-angle window.
5. Fintelman DM, Sterling M, Hemida H, Li F-X. "Optimal cycling time trial position
   models: aerodynamics versus power output and metabolic energy." *Journal of
   Biomechanics*, 2014;47(8):1894–1898. DOI: 10.1016/j.jbiomech.2014.02.029. Torso angles
   0–24° measured from horizontal on 19 TT cyclists; optimum is speed-dependent, and a
   flat torso is not optimal below 30 km/h.
   https://pubmed.ncbi.nlm.nih.gov/24726654/
6. Hamley EJ, Thomas V. "Physiological and postural factors in the calibration of the
   bicycle ergometer." *Journal of Physiology*, 1967. Origin of the 109%-of-inseam
   saddle-height rule (measured to the pedal axle).
7. Various, compared in "Comparing methods for setting saddle height in trained cyclists"
   — found no significant difference between the Hamley and LeMond methods (p = 0.917).

**Named fitters and fit systems**

8. Steve Hogg, "Seat set back: for road bikes" (2011).
   https://www.stevehoggbikefitting.com/bikefit/2011/05/seat-set-back-for-road-bikes/
   Source of the KOPS rejection quotes in §5.
9. Keith Bontrager, "The Myth of K.O.P.S.", hosted at sheldonbrown.com.
   https://www.sheldonbrown.com/kops.html
10. Dan Empfield / Slowtwitch, F.I.S.T. protocol, and "Coordinate predictors versus body
    angles in road bike fit". https://www.slowtwitch.com/Bike_Fit/Road_Bike_Fit/Coordinate_Predictors_Versus_Body_Angles_in_Road_Bike_Fit_2631.html
    Source of the "road angles are fungible" caveat and of the FIST shoulder-angle
    convention (~80°).
11. BikeFit.com, "How to fit a triathlon or TT bike, part 3: upper body positioning".
    https://bikefit.com/blogs/bikefit-blog/how-to-fit-a-triathlon-or-tt-bike-part-3-upper-body-positioning
    Defines the FIST-family hip angle as **BB – greater trochanter – acromion**, target
    ~100°, shoulder angle 90° (BikeFit) vs 80° (Slowtwitch). Also the statement that KOPS
    is not a starting point for tri fits.
12. Velogic Studio documentation, road metrics and triathlon metrics pages. Marker/pose
    based fit software; publishes explicit numeric target ranges. **The only source found
    that publishes a maximum (bottom-of-stroke) hip angle, and one of only two that
    publishes a knee-over-foot offset in mm.**
    https://docs.velogicfit.com/section-02-using-velogic-studio/road-metrics
    https://docs.velogicfit.com/section-02-using-velogic-studio/triathlon-metrics
    (No MTB metrics page exists — confirmed 404 and absent from their sitemap.)
13. Retul published average ranges, as reported in fit reports and system reviews: knee
    flexion 110° ±3 (top of stroke), knee extension 37° ±3 (bottom of stroke).
14. John Weirath PT, Bike Fit Adviser: "A (not so) basic bike fit part 3: bike fit joint
    angles" and "Knee extension and saddle height".
    https://www.bikefitadviser.com/blog/not-basic-bike-fit-part-3-bike-fit-joint-angles
    https://www.bikefitadviser.com/blog/knee-extension-and-saddle-height
    Knee extension 34–48° at 6 o'clock (app convention); hip angle at 12 o'clock 44–50°
    (fit/mobile) or 52–58° (recreational); the only located named-fitter figures for MTB
    (42–48°) and tri/TT (road + 2–3°).
15. BikeFittr bike fit angle chart. Commercial AI fit product; publishes a road-vs-tri
    chart with explicit measurement definitions but **cites no sources**.
    https://www.bikefittr.com/bike-fit-angle-chart
16. SportCoaching (Coach Graeme), "KOPS method (knee over pedal spindle): bike fit guide".
    https://sportcoaching.com.au/kops-method-knee-over-pedal-spindle/
    The only located source giving KOPS mm figures for all three disciplines, measured to
    the tibial tuberosity.
17. Fit Kit Systems, "How to fit a mountain bike: practical techniques and essential
    adjustments". https://fitkitsystems.com/how-to-fit-a-mountain-bike-practical-techniques-and-essential-adjustments/
    Cited here as **negative evidence**: an established fit-system vendor's MTB guide that
    deliberately gives no numeric angle targets.

**Consulted but not usable**

18. Phil Burt, *Bike Fit: Optimise your bike position for high performance and injury
    avoidance*, 2nd ed., Bloomsbury. No accessible excerpt with numeric angle targets was
    found online; nothing from this book is cited above. It should be checked against a
    physical copy before these ranges are treated as settled.
19. Andy Pruitt, *Andy Pruitt's Complete Medical Guide for Cyclists*. Same situation — the
    25–35° figure attributed to Pruitt above comes from the Holmes/Pruitt/Whalen 1994
    paper, not from the book text, which was not accessible.

---

## 8. Confidence and gaps

### Well sourced (multiple independent sources agreeing, in a convention that converts cleanly)

- **Road `kneeFlexion` 30–40°.** Four independent sources land inside 30–40 once converted
  (Ferrer-Roca dynamic 30–40, Retul 34–40, Velogic 35–40, BikeFittr 30–40). The one
  outlier (Bike Fit Adviser 34–48) is wider at the top only.
- **Road `torsoAngle` 40–50°.** Two sources, same definition, overlapping.
- **Road `elbowAngle` 150–170°.** Two sources, overlapping.
- **Road `saddleHeight` as 0.870–0.895 × inseam.** Two formulas from independent lineages
  agreeing to ~1.5 mm, with a peer-reviewed null result between them.
- **The static-vs-dynamic 5–10° offset**, and therefore the decision to use 30–40 rather
  than the widely-quoted 25–35. Peer-reviewed.
- **Tri `elbowAngle` ≈ 90–110° being a definitional change, not a range change.**
  Confirmed by two sources plus geometric reconstruction.
- **Tri KOPS being positive (knee ahead of spindle).** Unanimous on direction.
- **The KOPS caveat itself.** Bontrager and Hogg are unambiguous and quotable.

### Moderately sourced (single credible source, or sources that agree only loosely)

- **Road and tri `hipAngle` at BDC (90–105 / 85–105).** One source (Velogic Studio) for
  the app's exact convention. Corroborated only arithmetically, via top-of-stroke figures
  plus a hip-excursion estimate. Everything else in the literature measures the *other*
  end of the stroke.
- **Tri `torsoAngle` 12–25°.** The elite (10–15) vs age-group (20–30) split is real and
  large; the proposed range straddles it, which means it will be wrong for both ends.
- **Tri `KOPS` +20 to +60 mm.** Two sources, but they span +20 to +80. The magnitude is
  soft even though the sign is not.
- **MTB `saddleHeight` (road − 5 to 10 mm).** Direction is agreed by everyone; the
  magnitude is folklore, never measured.
- **Road `KOPS` −40 to 0 mm.** Two sources give −40..0 and −20..0. The landmark problem
  (§5) is larger than the range itself.

### Weak or unsourced — do not present these as authoritative

- **MTB `kneeFlexion`.** One named source (42–48°) that is internally inconsistent with
  the agreed 5–10 mm saddle drop (which implies 32–43°). Proposed 33–45 is a compromise
  with no source behind it.
- **MTB `hipAngle`.** **No source at any crank position.** The 90–110 above is derived.
- **MTB `torsoAngle`.** **No source.** The 45–60 above is derived from bar-height
  conventions.
- **MTB `elbowAngle`.** **No source.** The 140–165 above is derived.
- **MTB `KOPS`.** One secondary source only.
- **Tri `kneeFlexion`.** Sources disagree on the *direction* of the difference from road:
  BikeFittr says less flexion, Bike Fit Adviser says more, Velogic says no difference.
  The proposed 30–42 is a union, not a consensus.
- **Tri `saddleHeight`.** No defensible range exists. Recommend not showing one.
- **Any absolute mm `saddleHeight` target for any discipline.** Meaningless without
  inseam. The app should either collect inseam or present saddle height as an
  observation rather than a pass/fail metric.
- **Phil Burt and Andy Pruitt's books were not accessible** and contribute nothing to the
  numbers above beyond the 1994 Holmes/Pruitt/Whalen paper. If either is available in
  print, checking road `torsoAngle`, `elbowAngle` and the MTB rows against them is the
  highest-value follow-up.

### Bugs in the current placeholders, for reference

| Placeholder | Verdict |
|---|---|
| `kneeFlexion 25-35` | Right convention, wrong method. That is the **static** goniometer range; a dynamic video method should use 30–40. |
| `hipAngle 40-50` | **Wrong.** This is a top-of-stroke (minimum) hip angle applied to a bottom-of-stroke measurement. The BDC equivalent is ~90–105. |
| `torsoAngle 45-55` | Roughly right for road, ~5° upright of the sourced 40–50. |
| `elbowAngle 150-165` | Roughly right for road; the sourced range is 150–170. Meaningless on a tri profile. |
