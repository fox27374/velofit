# velofit — progress

Bike-fitting MVP. Analyzes video of a rider on a stationary trainer, computes
joint angles + KOPS/saddle-height, compares against target ranges. No
adjustment recommendations, no accounts/history/cloud — see non-goals below.

## Direction change, 2026-09-18: web app

**The Flutter app is being replaced by a web app.** Design agreed and
recorded in `doc/web-redesign.md`: the phone's camera app records a video,
the browser analyses it afterwards (MediaPipe pose, self-hosted), frames at
6/3/12 o'clock are picked from the ankle's loop, dynamic targets. Vite +
TypeScript + Preact, GitHub Pages. Everything below this section describes
the Flutter app and stays as the record of what was learned.

**Gated on a spike** — branch `spike-video-frames`, folder `spike/`, never to
be merged. It measures whether a phone browser reaches every frame of a
recorded video and how long pose takes over it. Headless Chrome on the Mac
with a synthetic video: 100% of seeks land on the exact frame (once frames
are addressed by observed timestamp, not a fixed grid — phone video is often
variable frame rate), ~45 ms per seek, ~24 ms per pose frame, 1x playback
missed ~3% of frames. **Not yet run on the Redmi with a real pedaling
video** — that is the next step.

To run it: `cd spike && npm install && npm run setup && npm run dev`
(`setup` copies the WASM and downloads the lite/full models, which are
gitignored). Phone over USB: `adb reverse tcp:5173 tcp:5173`, open
`http://localhost:5173`. Or over Wi-Fi at the Mac's LAN IP, port 5173.

## State as of 2026-09-17

**First real-device session done** (Redmi Note 9 Pro, Android 11, release
APK). The app installs, launches, films, calibrates and completes the capture
flow. `flutter analyze` / `flutter test` (75 tests) / `flutter build apk
--release` all pass, verified directly rather than taken on an agent's word —
which mattered: an agent reported "analyze: no issues" twice when there was a
warning, and reported tests for behaviour it had not tested.

Device testing found that almost nothing in the capture path actually worked,
and none of it was visible from the desk:

- The release APK died before Flutter started. R8 renames WorkManager's
  generated `WorkDatabase_Impl`, which Room loads by name. Debug builds do
  not run R8, so this could only ever appear on a release install.
- Cycle detection could never count. `isPeak` was asked about the newest
  sample, which it can never confirm.
- ML Kit was fed a third of a frame — NV21 metadata over a single YUV plane,
  because the controller never requested `ImageFormatGroup.nv21` — and a
  hardcoded `rotation0deg`, so it saw a sideways rider.
- Mounting the bike scored five "cycles", because any ankle-Y local maximum
  counted. The whole results set from that run was mount, not pedaling.
- The "pedal-forward" still was taken at a bottom-of-stroke detection plus
  shutter latency, so it was neither pedal-forward nor synchronised to
  anything. KOPS was systematically wrong even with perfect pedaling.

The capture redesign that followed (cycle validity gate, stream-sourced
pedal-forward frames) is designed, implemented and unit-tested, **but has
never been ridden**. See "Next steps".

### What device testing is and is not

Verified on hardware: install, launch, camera preview filling the frame in
landscape, calibration photo and four-point tapping, pose detection producing
landmarks, cycle counting reaching five, and the flow reaching the bike-point
and results screens.

NOT verified on hardware: anything the redesign changed, and every number the
app prints. No measurement has been compared to a tape measure.

### Working notes on process

The bugs that survived longest all had the same shape: **a condition
evaluated at an index where it cannot hold.** `isPeak` on the newest sample;
the X-extremum check nested under the Y-peak branch; the kept frame's
landmarks read from the current frame instead of the confirmed extremum a
lookahead window back. Unit tests of the pure helpers passed in every case —
the helpers were correct. What caught them was pushing a synthesised
pedaling signal (sinusoidal ankle x and y, 90° out of phase) through the
whole state machine and asserting on the phase of the frames it chose.
`test/capture_gate_test.dart` is that test; keep it, and extend it rather
than adding more isolated helper tests, whenever capture behaviour changes.

Commits from this session sit on the `device-testing-fixes` branch, not
`main`. Nothing is pushed.

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
   (px/mm), via `pixelScaleFromTaps()`. Taps are stored in **photo-pixel**
   space, not widget space, so `pixelScale` is px/mm *of the calibration
   photo* and survives a device rotation between screens — treat that as the
   reference pattern for "how this must work" if debugging coordinate issues
   elsewhere. Anything measured on a stream frame must be rescaled into
   calibration-photo pixels by the width ratio before it meets `pixelScale`.
   The taps also decide which ankle-x extremum means pedal-forward (front
   wheel x vs bottom bracket x), so the filming convention is derived rather
   than assumed.
3. **Pedaling screen** — live camera stream runs pose detection at full
   frame rate (`google_mlkit_pose_detection`). Tracks the ankle landmark's
   (x,y) in a rolling buffer. A **cycle validity gate** arms once pedaling
   is proven periodic and large: cadence must be 40–110 rpm, each
   inter-peak interval within ±20% of the running median, and ankle vertical
   travel ≥150 mm (in real mm via `pixelScale`). The gate arms after K=3
   consecutive valid intervals. Once armed, each bottom-of-stroke (ankle-Y
   peak) confirms a cycle; each cycle's full landmark set is stored for
   angle averaging. For pedal-forward capture, the rolling frame buffer keeps
   the last 8 stream frames (raw NV21 bytes, dimensions, landmarks). When
   each cycle's ankle-X extremum (max or min depending on wheel position) is
   confirmed, that frame is encoded to JPEG on a compute isolate (YUV→RGB
   conversion + `image` package), keeping one per cycle for 5 total. Breaks
   (irregular/missed strokes) pause counting; gaps >3 seconds reset the gate
   and buffer. A 60-second timeout stops the capture if the gate never arms
   or pedaling stops.
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

### Found by the 2026-09-17 device session

- **Release APK crashed at startup** — R8 vs WorkManager's Room database.
  `isMinifyEnabled = false` in `android/app/build.gradle.kts`.
- **`isPeak` asked about the newest sample** — can never be confirmed, so no
  cycle was ever counted. Callers must lag the candidate by the window;
  `test/angle_utils_test.dart` pins this contract.
- **NV21 metadata over one YUV plane** — controller now requests
  `ImageFormatGroup.nv21` and all planes are concatenated.
- **`rotation0deg` hardcoded** — now derived from sensor and device
  orientation.
- **Pose stored from the wrong frame** — a peak is confirmed a lookahead
  window after it happens; the pose from the peak frame is now kept.
- **Camera preview collapsed in landscape** — bare `CameraPreview` in a
  `Stack`; `FillPreview` covers the box using the controller's own
  orientation.
- **Measurement taps were widget-space** — rotating the phone between
  screens silently corrupted every millimetre. Now photo-pixel.
- **Microphone permission prompt** — `enableAudio` defaulted true on the
  calibration controller, and the plugin merged `RECORD_AUDIO`.
- **Kept frame was the wrong frame** — the KOPS frame and its knee landmark
  were read from the current frame rather than the confirmed extremum, about
  48° of crank rotation late at 80 rpm, in precisely the coordinate KOPS
  measures.

### Found earlier by code review

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

6. **`hipAngle` target was the wrong end of the pedal stroke.** `FitTargets`
   set 40-50°, but essentially every published hip-angle target is the
   *minimum*, at top of stroke, while `pedaling_screen.dart` samples at
   *bottom* of stroke — which gives the maximum, roughly 45-50° larger. A
   40-50° target at BDC is geometrically unreachable, so the app scored every
   rider's hip angle red regardless of how they sat. Fixed: 90-105°, sourced in
   `doc/fit-targets-research.md`, with the sampling point spelled out in the
   doc comment and in the Fitting Tables label.

   Guarded by `test/angle_utils_test.dart`, which reconstructs a normal BDC
   position (torso 45° above horizontal, thigh 57° below) from landmark
   coordinates, asserts it measures ~102°, and asserts that value scores as
   good. Any future edit reintroducing a top-of-stroke range fails there.

All six were caught by manual code review after an agent claimed completion
and its own tests passed — `flutter test` passing does not mean the logic is
right, worth remembering for the next round too.

## Known-OPEN bugs

1. **KOPS is measured to the wrong landmark for the published figures.**
   Published KOPS values in mm are to the tibial tuberosity; the app uses the
   pose knee-joint centre, ~30-40mm posterior. App readings therefore sit a
   systematic 20-40mm negative against a fitter's plumb line — an offset wider
   than the whole proposed road target range. Currently harmless, because KOPS
   is reported without a target; it becomes a real problem the moment KOPS is
   scored. See `doc/bike-type-profiles.md`, Finding 2.

2. **The APK ships permissions the README's privacy claim disowns.** The
   merged manifest declares `INTERNET`, `ACCESS_NETWORK_STATE`, `WAKE_LOCK`,
   `RECEIVE_BOOT_COMPLETED` and `FOREGROUND_SERVICE`. None are declared by
   this app — they arrive transitively via ML Kit's WorkManager dependency
   (the same one whose Room database R8 breaks). The README opens with "Runs
   entirely on-device. No accounts, no cloud, no data leaves the phone", so
   shipping `INTERNET` contradicts the headline claim even though nothing
   sends anything. Re-check with
   `aapt2 dump badging <apk> | grep uses-permission` after any dependency
   change.

   `READ_EXTERNAL_STORAGE` is declared by our own manifest and looks
   vestigial — camera stills land in app-private storage, which needs no
   permission.

   Not yet acted on. `RECORD_AUDIO` was removed this way already
   (`tools:node="remove"` in `android/app/src/main/AndroidManifest.xml`), so
   the mechanism is proven; `INTERNET` additionally needs confirming that the
   bundled pose model never reaches out before it can be stripped.

## Plausibility guards

`calibrationProblem()` and `measurementProblems()` in `lib/angle_utils.dart`
are bounds on **physical possibility**, deliberately not fit targets (those
live in `fit_targets.dart` and are much tighter). They exist so a broken
capture reads as "recapture" instead of as a confident number.

**Calibration checks** (`calibrationProblem`): wheel diameter outside
300-1000mm; wheel taps too close together (the threshold is a parameter —
the calibration screen passes 5% of the photo's shortest side, since a fixed
50px was tuned for widget pixels and means nothing on a 1280x720 photo);
wheel taps given bottom-first;
saddle tapped below the bottom bracket; wheel and bottom-bracket x within
10px (phone not square to bike).

**Measurement checks** (`measurementProblems`): saddle height outside
400-1000mm; KOPS over 250mm; any unmeasured angle; knee-x spread across
the 5 kept pedal-forward frames > 15mm (indicating unreliable knee detection).

**Gate parameters** (in `lib/angle_utils.dart`, marked as reasoned and
unvalidated): minimum cadence 40 rpm, maximum cadence 110 rpm, interval
consistency tolerance ±20%, arming threshold K=3 intervals, minimum ankle
vertical travel 150 mm, maximum knee-x spread 15 mm.

**These numbers are guesses from the capture geometry and pilot expectations,
never validated against real captures.** Check them on the first device
walkthrough — a bound that is too tight will block valid fits, which is
worse than one that is slightly loose.

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

1. **Run the spike on the Redmi** with a 20-30 s real pedaling video (empty
   bike ~2 s, then steady pedaling, left side to camera, good light, 60 fps if
   offered). Pass criteria in `doc/web-redesign.md`: >= 99% of frames
   reachable, analysis <= 2 min, a clean ankle loop. If 1x playback misses
   frames, retry at playback rate 0.5.
2. Pass: merge `device-testing-fixes` into `main`, tag `flutter-final`,
   delete the Flutter code, build the web app via the `coder` agent. Fail:
   try the lite model / fewer refined frames, else fall back to static photos
   (see the design doc).
3. The Flutter next steps (validating the live-stream gate on a ride, iOS via
   Xcode, the transitive INTERNET permission) are superseded by the web
   redesign and should not be worked on.
