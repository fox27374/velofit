# Web redesign — agreed design

Agreed in a grilling session on 2026-09-18. Replaces the Flutter app.

## Why

- No developer accounts ($99/yr Apple, $25 Google), no store review, no Xcode
  install blocking iOS.
- The Flutter app processed the **live** camera stream only because
  `ffmpeg_kit` was pulled from pub.dev, leaving no way to decode a recorded
  video. Browsers decode video natively, so that constraint is gone.
- Recording first and analysing afterwards removes the pose-detection frame
  rate as a limit (browser MediaPipe pose manages ~11-12 fps on a Pixel 5 —
  too coarse for live stroke detection) and removes the online state machine
  whose bugs were all "a condition evaluated at an index where it cannot
  hold". Offline, the whole time series is available.
- Flutter Web was ruled out: `camera_web` does not support frame streaming and
  `google_mlkit_pose_detection` has no web implementation.

## Gate: the spike

Nothing is built until a throwaway spike (branch `spike-video-frames`, never
merged) passes on the Redmi Note 9 Pro, with a 20 s video of real pedaling and
the MediaPipe `full` pose model:

1. Frame delivery: >= 99% of duration x fps frames reachable, no duplicate
   timestamps.
2. Processing: full analysis (coarse pass, then refine near target positions)
   <= 2 minutes.
3. Pose sanity: the ankle traces a clean loop with an obvious stroke rhythm.

On failure: first try a lighter model or fewer refined frames. If that is not
enough, fall back to static photos at 6/3/12 o'clock with a timer shutter and
**static** targets (knee flexion 25-35).

## Platform and repo

- Order: merge `device-testing-fixes` into `main`, tag `flutter-final`, delete
  the Flutter code (`lib/`, `android/`, `ios/`, `web/`, `linux/`, `macos/`,
  `windows/`, `test/`, `pubspec.*`, `tool/`), put the app at the repo root.
  `doc/`, `PROGRESS.md`, `README.md`, `LICENSE` stay.
- Vite + TypeScript + Preact. Math (angles, stroke analysis, targets) is plain
  TypeScript with no framework dependency, tested with Vitest.
- GitHub Pages at `fox27374.github.io/velofit`, deployed by a GitHub Action on
  push to `main`. Custom domain later.
- MediaPipe WASM and the `full` pose model are self-hosted: no CDN, no service
  worker, no offline mode. Nothing leaves the device; the README's privacy
  claim is rewritten to say so for the web version.

## Capture

- The phone's own camera app records, via
  `<input type="file" accept="video/*" capture>`. Picking an existing clip
  from the gallery also works. No in-app camera, no framing overlay.
- Accept >= 30 fps (How-To recommends 60). Analyse at most 30 s after the
  calibration frame.
- Recording sequence: empty bike in view ~2 s, get on, pedal steadily
  >= 20 s, stop.
- Filming convention unchanged: left side of the bike faces the camera.
  Pedal-forward direction is derived from the calibration taps (front wheel x
  vs bottom bracket x).

## Analysis

- Calibration: four taps (wheel top, wheel bottom, bottom bracket, saddle top)
  on frame 0, with a slider to pick a later empty-bike frame. One video means
  the camera cannot have moved between calibration and measurement.
  `calibrationProblem()` checks carry over.
- Steady stretch: longest run at 40-110 rpm where each stroke's duration is
  within +-20% of the median. Fewer than 5 strokes means recapture.
- Crank position: estimated for every frame as the angle of the ankle around
  the centre of its loop over the steady stretch. Per stroke, the frames
  closest to 6, 3 and 12 o'clock are picked. The ankle is not the spindle, so
  this is off by a few degrees depending on ankling.
- Each angle is the median across strokes, so one bad pose frame cannot drag
  it.
- KOPS: spindle tapped once, on the most typical 3 o'clock frame; KOPS uses
  the median knee x across strokes.
- Checks: existing knee-x spread (15 mm), saddle height and KOPS bounds; new:
  bottom-bracket-to-spindle line within +-10 degrees of horizontal, and at
  least 5 strokes.

## Targets (road only)

| Measurement | Position | Target |
|---|---|---|
| Knee flexion | 6 o'clock | 30-40 (dynamic) |
| Minimum hip angle | 12 o'clock | 44-58 |
| Torso | all picked frames | 45-55 |
| Elbow | all picked frames | 150-165 |
| Hip angle | 6 o'clock | shown, not scored (single source) |
| Knee flexion | 12 o'clock | shown, not scored (single source) |
| KOPS | 3 o'clock | mm, not scored |
| Saddle height | calibration frame | mm, not scored |

Sources in `doc/fit-targets-research.md`. KOPS is still measured to the
knee-joint centre rather than the tibial tuberosity; harmless while unscored.

## Screens

1. Home — Bike Fitting, How to Measure, Fitting Tables.
2. Setup — wheel + tire outer diameter.
3. Video — record or pick.
4. Calibration — frame slider, 4 taps, Undo / Retake / Continue.
5. Processing — progress bar.
6. Spindle tap — on the chosen 3 o'clock frame.
7. Results — three thumbnails (6/3/12) with the detected skeleton drawn over
   them, the numbers, and a "Recapture recommended" banner when checks fail.

How-To is rewritten for the recording sequence and for lighting: bright light
on the rider, because at 1/60 s the ankle smears 2-3 cm.

## Not in v1

Bike-type profiles, saved results, offline mode, in-app framing overlay, iOS
testing (no iPhone assumed available — HEVC and Safari untested).

## Testing

Key test: a synthesised ankle loop in, assert the stroke count and the frames
picked at 6/3/12 o'clock. It replaces what `capture_gate_test.dart` did.
Implementation goes to the `coder` agent; results are verified by running
build, test and lint directly, then on the Redmi.
