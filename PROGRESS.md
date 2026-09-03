# velofit — progress

Bike-fitting MVP. Analyzes video of a rider on a stationary trainer, computes
joint angles + KOPS/saddle-height, compares against target ranges. No
adjustment recommendations, no accounts/history/cloud — see non-goals below.

## State as of 2026-09-03

Feature-complete first pass, **still not run on a real device or emulator**.
`flutter analyze` / `flutter test` (41 tests) / `flutter build apk --debug`
all pass, verified directly (not just taken on an agent's word). Five real
bugs have now been found by manual code review across two passes and are
fixed — see "Known-fixed bugs" below, worth re-checking those spots first if
something looks wrong on-device.

Everything is committed. `417b363` added the home screen, fitting tables and
capture instructions; `b5605fe` added tap correction and plausibility guards;
`2d131d3` added the launcher icon. Nothing is pushed.

## Toolchain (this Mac)

- Flutter installed via `brew install --cask flutter` (3.47.2, stable).
- Android SDK cmdline-tools installed (`brew install --cask
  android-commandlinetools`, copied into `~/Library/Android/sdk/cmdline-tools/latest`),
  licenses accepted, `flutter config --android-sdk` pointed at it.
  `flutter doctor` is green for Android.
- CocoaPods installed via brew, ready for whenever iOS is unblocked.
- **iOS is blocked**: only Xcode CLI tools are present, not full Xcode.
  Needs installing from the App Store (large download) before any iOS
  build/simulator work — that's on the user, not automatable here.

## Architecture decisions (from the grilling session)

- Flutter (not React Native) + `google_mlkit_pose_detection` (BlazePose,
  33 landmarks) — chosen after research showed RN pose-detection packages
  are stale (~20mo no release) vs this one being actively maintained with
  full iOS/Android parity.
- On-device only, no backend, no accounts, no persisted history.
- Capture context: bike on a stationary trainer, phone on tripod, side-on,
  **non-drive (left) side** of bike in frame, **front wheel on the right**
  of frame (fixed convention, used for pedal-forward peak-direction logic).
- Explicitly did NOT use `ffmpeg_kit_flutter*` — that project was retired/
  pulled from pub.dev in 2025 (license dispute). This is why the pipeline
  processes the **live camera image stream** directly rather than
  recording-then-decoding a video file.
- ML Kit only detects body landmarks, not bike parts — bike reference
  points (wheel rim top/bottom, bottom bracket, saddle top, pedal spindle)
  are always **manual taps** on a captured photo, by design, not a gap to
  fill later with an object-detection model.

## Pipeline / flow

The app opens on a **home screen** (`lib/screens/home_screen.dart`), not on
the fit flow: a menu of Bike Fitting, How to Measure and Fitting Tables. The
numbered flow below is what sits behind `/setup`. `FitTablesScreen` (same
file) renders the `FitTargets` ranges read-only. `HowToScreen`
(`how_to_screen.dart`) is the capture guide — distance, phone height, camera
angle, the left-side/wheel-right framing convention, and not moving the phone
after calibration; its numbers are derived from the capture geometry below
and **not yet checked against real captures**. It is also linked from an info
button on the calibration app bar, where it actually matters.

1. **Setup screen** — wheel+tire outer diameter input (mm, default 700;
   explicitly the outer diameter including tire, not the 622mm ISO
   bead-seat diameter — a common mixup).
2. **Calibration screen** — single still photo of the stationary bike, user
   taps 4 points in order: top of front wheel, bottom of front wheel,
   bottom bracket, saddle top. Taps do not auto-advance: markers are
   numbered 1-4 and Undo / Retake / Continue are explicit, and Continue runs
   `calibrationProblem()` (`angle_utils.dart`) before computing anything —
   a failed check shows the problem and refuses to navigate. Pixel distance
   between the two wheel taps + the mm value from setup → `pixelScale`
   (px/mm), via `pixelScaleFromTaps()`. This screen is
   internally coordinate-consistent (all taps + derived scale share one
   widget's on-screen coordinate space) — treat it as the reference
   pattern for "how this must work" if debugging coordinate issues
   elsewhere.
3. **Pedaling screen** — live camera stream, ~15fps pose detection
   (`google_mlkit_pose_detection`, every 2nd frame). Tracks the ankle
   landmark's (x,y) in a rolling buffer; simple local-max peak detection
   (`isPeak` in `lib/angle_utils.dart`) finds bottom-of-stroke (y-peak,
   since image y grows downward) and pedal-forward (x-peak, since front
   wheel is framed to the right) instants. On each bottom-of-stroke peak,
   snapshots that cycle's full landmark set into a buffer (last 8). Once 5
   cycles are captured, takes a still photo at the pedal-forward instant,
   re-runs pose detection on *that photo file* (not the stream frame — see
   "Known-fixed bugs"), and extracts the knee landmark from it in the
   photo's own pixel space.
4. **Bike-point screen** — shows the pedal-forward photo, user taps the
   pedal spindle center (for KOPS); tapping again moves the marker, Clear
   removes it, Continue advances. Uses a `LayoutBuilder` to get the
   actual on-screen rendered size of the image, converts the knee landmark
   from photo-pixel space into that same on-screen space via
   `photoPixelToWidget` (BoxFit.contain math) before comparing it to the
   tap — see "Known-fixed bugs".
5. **Results screen** — displays the 4 angles (already averaged across
   bottom-of-stroke cycles, passed in as plain doubles) vs target ranges
   from `lib/fit_targets.dart`, plus KOPS offset and saddle height in mm
   (no target range on those two — just reported). Above them,
   `measurementProblems()` drives a "Recapture recommended" banner. A value
   that was never measured arrives as `double.nan` (see below) and renders
   as "Not measured" rather than a red 0.0°.

## Known-fixed bugs (worth re-checking if something's off on-device)

1. **Saddle height mixed frames** — was computing BB-to-*pedal-tap*
   distance instead of BB-to-*saddle-tap* distance. Fixed: both points now
   come from the calibration photo (`bike_point_screen.dart`).
2. **Wrong pedal-stroke instant, no averaging** — angles were originally
   computed from a single pose snapshot taken at the pedal-forward instant
   (wrong crank position for a knee-flexion target that's only meaningful
   at bottom-of-stroke), never averaged. Fixed: `pedaling_screen.dart` now
   buffers landmarks at every bottom-of-stroke cycle and
   `_computeAveragedAngles()` averages across up to 8 cycles. **This fix was
   incomplete** — see bug 5.
3. **KOPS coordinate-space mismatch** — was subtracting a raw ML-Kit
   landmark coordinate (camera-stream pixel space, e.g. ~1920×1080) from a
   Flutter tap coordinate (on-screen widget/logical-pixel space, e.g.
   ~400×800) — meaningless on a real device. Fixed: pose detection now
   re-runs on the captured pedal-forward JPEG itself (same pixel space as
   what's displayed), and `photoPixelToWidget`/`widgetToPhotoPixel` in
   `lib/angle_utils.dart` do the actual BoxFit.contain scale+letterbox
   math to reconcile it with the tap's on-screen coordinates.
4. **`RangeError` on the 4th calibration tap** — the instruction banner
   indexed `_labels[_tappedPoints.length]`, so the rebuild triggered by the
   final tap read index 4 of a 4-element list. Never seen because nothing
   had run the flow on a device. Fixed along with the tap-correction work.
5. **Averaging denominator counted cycles, not valid samples** — the second
   half of bug 2. `_computeAveragedAngles()` divided every metric by the
   total cycle count, but a cycle where the pose detector missed a joint
   skipped that metric's accumulation while still counting in its
   denominator — so each miss quietly pulled that angle toward zero, and a
   metric with no valid cycles at all reported a confident 0°. Fixed: counts
   are per metric, and a metric with zero valid cycles returns
   `unavailableMeasurement` (`double.nan`).

All five were caught by manual code review after an agent claimed completion
and its own tests passed — `flutter test` passing does not mean the logic is
right, worth remembering for the next round too.

## Known-OPEN bugs

1. **`hipAngle` target is the wrong end of the pedal stroke.** `FitTargets`
   sets 40-50°, but essentially every published hip-angle target is the
   *minimum*, at top of stroke, while `pedaling_screen.dart` samples at
   *bottom* of stroke — which gives the maximum, roughly 45-50° larger. The
   sourced BDC range is 90-105° (`doc/fit-targets-research.md` §0b), confirmed
   geometrically: torso 45° above horizontal and thigh ~57° below horizontal at
   BDC give an interior angle of ~102°.

   **A 40-50° target at BDC is geometrically unreachable, so the app currently
   scores every rider's hip angle red regardless of how they sit.** Not yet
   fixed. It predates the bike-type-profile work and should be fixed
   independently of it — the profile feature is gated on a numbers sign-off,
   this is not.

2. **KOPS is measured to the wrong landmark for the published figures.**
   Published KOPS values in mm are to the tibial tuberosity; the app uses the
   pose knee-joint centre, ~30-40mm posterior. App readings therefore sit a
   systematic 20-40mm negative against a fitter's plumb line — an offset wider
   than the whole proposed road target range. Currently harmless, because KOPS
   is reported without a target; it becomes a real problem the moment KOPS is
   scored. See `doc/bike-type-profiles.md`, Finding 2.

## Plausibility guards

`calibrationProblem()` and `measurementProblems()` in `lib/angle_utils.dart`
are bounds on **physical possibility**, deliberately not fit targets (those
live in `fit_targets.dart` and are much tighter). They exist so a broken
capture reads as "recapture" instead of as a confident number: wheel
diameter outside 300-1000mm, wheel taps under 50px apart or given
bottom-first, saddle tapped below the bottom bracket, saddle height outside
400-1000mm, KOPS over 250mm, any unmeasured angle.

**These numbers are guesses from the capture geometry, never validated
against a real capture.** Check them on the first device walkthrough — a
bound that is too tight will block valid fits, which is worse than one that
is slightly loose.

Unmeasured values propagate as `double.nan` rather than `null`, so they flow
through the existing `Map<String, dynamic>` route arguments with no
signature changes. The cost is that every display site must check `isNaN`;
the three that exist do.

## Launcher icon

`tool/make_icon.py` draws the source art (a bold V with the amber arc of a
measured angle at its vertex) at 4x and downsamples for antialiasing, into
`assets/icon/`. `flutter_launcher_icons` turns that into the Android
densities, the adaptive-icon XML and the iOS appiconset — rerun with
`dart run flutter_launcher_icons` after changing the art.

Pillow is not a project dependency and nothing in the app or the build needs
Python; the script's docstring carries the venv commands to run it.

## Non-goals (deliberately out of scope, don't reintroduce)

No accounts/cloud sync/session history, no numeric adjustment
recommendations ("raise saddle Xmm"), no reach/drop measurement, no
outdoor/unstable capture handling, no bike-parts object-detection model, no
saved-video-file/scrubbing UI.

**The riding-discipline profile switcher is no longer a non-goal.** Road /
mountain / triathlon profiles are designed and confirmed in
`doc/bike-type-profiles.md`, with sourced ranges in
`doc/fit-targets-research.md`. Not implemented, and gated on signing off those
numbers. Bike type is *selected by the user*, never detected from the image.

## Next steps

1. **Run it on a real Android device or emulator** — nothing here has
   exercised the camera + live pose-detection stream on actual hardware.
   This is the biggest unknown: camera image format/rotation handling
   (`_createInputImage` in `pedaling_screen.dart`, NV21 assumed,
   `rotation0deg` hardcoded — real devices often need actual device
   rotation passed in, this was never device-tested) is the most likely
   thing to break first.
2. Walk the full flow once with a real bike on a trainer and sanity-check
   the numbers against a tape measure / known bike geometry. Same trip
   validates the capture distances/heights in `HowToScreen` and the bounds
   in the plausibility guards — all three are currently reasoned, not
   measured.
3. iOS: install full Xcode, then `flutter doctor` again, then retest the
   iOS branch of the camera-image conversion code (untested so far).
4. Decide on saving results. It is still a non-goal, but it is the one most
   likely to be wrong: closing the app loses everything, so you cannot
   compare before/after an adjustment, which is the point of a fit. Revisit
   once there are real numbers to compare.
