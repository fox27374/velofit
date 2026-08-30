# velofit — progress

Bike-fitting MVP. Analyzes video of a rider on a stationary trainer, computes
joint angles + KOPS/saddle-height, compares against target ranges. No
adjustment recommendations, no accounts/history/cloud — see non-goals below.

## State as of 2026-08-30

Feature-complete first pass, **not yet run on a real device or emulator**.
`flutter analyze` / `flutter test` (28 tests) / `flutter build apk --debug`
all pass, verified directly (not just taken on an agent's word). Two real
bugs were found by manual code review after the first implementation pass
and are now fixed and verified — see "Known-fixed bugs" below, worth
re-checking those spots first if something looks wrong on-device.

**Working tree is uncommitted.** Only commit on repo is `flutter create
scaffold` (bare scaffold). Everything described below is unstaged changes +
new files — review and commit before doing more work.

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

1. **Setup screen** — wheel+tire outer diameter input (mm, default 700;
   explicitly the outer diameter including tire, not the 622mm ISO
   bead-seat diameter — a common mixup).
2. **Calibration screen** — single still photo of the stationary bike, user
   taps 4 points in order: top of front wheel, bottom of front wheel,
   bottom bracket, saddle top. Pixel distance between the two wheel taps +
   the mm value from setup → `pixelScale` (px/mm). This screen is
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
   pedal spindle center (for KOPS). Uses a `LayoutBuilder` to get the
   actual on-screen rendered size of the image, converts the knee landmark
   from photo-pixel space into that same on-screen space via
   `photoPixelToWidget` (BoxFit.contain math) before comparing it to the
   tap — see "Known-fixed bugs".
5. **Results screen** — displays the 4 angles (already averaged across
   bottom-of-stroke cycles, passed in as plain doubles) vs target ranges
   from `lib/fit_targets.dart`, plus KOPS offset and saddle height in mm
   (no target range on those two — just reported).

## Known-fixed bugs (worth re-checking if something's off on-device)

1. **Saddle height mixed frames** — was computing BB-to-*pedal-tap*
   distance instead of BB-to-*saddle-tap* distance. Fixed: both points now
   come from the calibration photo (`bike_point_screen.dart`).
2. **Wrong pedal-stroke instant, no averaging** — angles were originally
   computed from a single pose snapshot taken at the pedal-forward instant
   (wrong crank position for a knee-flexion target that's only meaningful
   at bottom-of-stroke), never averaged. Fixed: `pedaling_screen.dart` now
   buffers landmarks at every bottom-of-stroke cycle and
   `_computeAveragedAngles()` averages across up to 8 cycles.
3. **KOPS coordinate-space mismatch** — was subtracting a raw ML-Kit
   landmark coordinate (camera-stream pixel space, e.g. ~1920×1080) from a
   Flutter tap coordinate (on-screen widget/logical-pixel space, e.g.
   ~400×800) — meaningless on a real device. Fixed: pose detection now
   re-runs on the captured pedal-forward JPEG itself (same pixel space as
   what's displayed), and `photoPixelToWidget`/`widgetToPhotoPixel` in
   `lib/angle_utils.dart` do the actual BoxFit.contain scale+letterbox
   math to reconcile it with the tap's on-screen coordinates.

Both fixes were caught by manual code review after an agent claimed
completion and its own tests passed — `flutter test` passing does not mean
the logic is right, worth remembering for the next round too.

## Non-goals (deliberately out of scope, don't reintroduce)

No accounts/cloud sync/session history, no numeric adjustment
recommendations ("raise saddle Xmm"), no reach/drop measurement, no
outdoor/unstable capture handling, no bike-parts object-detection model, no
riding-discipline profile switcher (one road-endurance default constant set
in `lib/fit_targets.dart`), no saved-video-file/scrubbing UI.

## Next steps

1. Review and commit the current working tree (nothing is committed past
   the bare scaffold).
2. **Run it on a real Android device or emulator** — nothing here has
   exercised the camera + live pose-detection stream on actual hardware.
   This is the biggest unknown: camera image format/rotation handling
   (`_createInputImage` in `pedaling_screen.dart`, NV21 assumed,
   `rotation0deg` hardcoded — real devices often need actual device
   rotation passed in, this was never device-tested) is the most likely
   thing to break first.
3. Walk the full flow once with a real bike on a trainer and sanity-check
   the numbers against a tape measure / known bike geometry.
4. iOS: install full Xcode, then `flutter doctor` again, then retest the
   iOS branch of the camera-image conversion code (untested so far).
