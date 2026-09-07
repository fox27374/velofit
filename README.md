# velofit

Bike fitting from your phone. Film yourself pedaling on a stationary trainer,
and the app measures your joint angles, knee-over-pedal-spindle offset and
saddle height, then compares them against target ranges.

Runs entirely on-device. No accounts, no cloud, no data leaves the phone.

> **Status: pre-alpha. Never run on a physical device.** It analyzes, builds and
> passes its tests, but no measurement it produces has been checked against a
> tape measure. Do not make changes to your bike based on its numbers yet.

## How it works

1. **Setup** — enter your wheel + tyre outer diameter in mm.
2. **Calibration** — take one still photo of the bike and tap four points: top
   and bottom of the front wheel, the bottom bracket, the saddle top. The wheel
   taps give a millimetre-per-pixel scale for everything that follows.
3. **Pedaling** — the live camera stream runs pose detection at ~15 fps,
   detecting each bottom-of-stroke instant from the ankle's motion and
   snapshotting the pose. After five cycles it captures a still at the
   pedal-forward instant.
4. **Bike point** — tap the pedal spindle on that still, for the KOPS offset.
5. **Results** — four joint angles averaged across cycles, versus target ranges,
   plus KOPS and saddle height in mm.

Body landmarks come from ML Kit's on-device pose detector. Bike reference points
are always manual taps — no bike-parts detection model, by design.

## Filming it

The measurements are only as good as the camera setup. In-app guidance lives
under **How to Measure**; in short:

- Phone on a tripod, 2.5–3 m to the side, lens at bottom-bracket height.
- Square to the bike, phone level. No tilt, no zoom.
- Film the **non-drive (left) side**, with the **front wheel to the right** of
  frame. The app relies on this to tell pedal-forward from pedal-back.
- **Do not move the phone between the calibration photo and the pedaling
  capture.** The scale comes from that photo and is reused for every millimetre
  figure afterwards.

## Building

Needs the Flutter SDK (developed against 3.47.2 stable).

```sh
flutter pub get
flutter run                 # or: flutter build apk
```

Android works. iOS builds have never been exercised — the camera-image
conversion path has an untested iOS branch.

## Accuracy, honestly

- Nothing has been validated on real hardware or against known bike geometry.
- Target ranges for knee flexion, torso and elbow angle are still unvalidated
  placeholders. Only the hip angle range is currently sourced. See
  [`doc/fit-targets-research.md`](doc/fit-targets-research.md) for what the
  literature actually supports and where it has nothing to say.
- KOPS uses the pose knee-joint centre, while published KOPS figures are
  measured to the tibial tuberosity — expect a systematic 20–40 mm offset
  against a professional fitter's plumb line. Plenty of respected fitters
  consider KOPS a poor metric in the first place.
- Saddle height is reported, not scored: it depends mostly on your inseam, which
  this app does not measure.

**This is not medical advice and not a substitute for a professional bike fit.**
Bike fit interacts with injury; if something hurts, see a physio or a fitter.

## Docs

- [`PROGRESS.md`](PROGRESS.md) — current state, architecture decisions, fixed
  and open bugs.
- [`doc/bike-type-profiles.md`](doc/bike-type-profiles.md) — designed but
  unimplemented road / mountain / triathlon profiles.
- [`doc/fit-targets-research.md`](doc/fit-targets-research.md) — sourced target
  ranges with citations.

## License

Not yet licensed — see the repository owner. Note that ML Kit itself ships under
Google's own terms, separate from whatever license this code carries.
