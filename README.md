# velofit

Bike fitting from your phone, in the browser. Two features:

- **Bike Fitting** — film yourself pedaling on a stationary trainer, and the
  app measures your joint angles, knee-over-pedal-spindle offset and saddle
  height, then compares them against target ranges.
- **BuyFit** — enter three body measurements and narrow down which frame to
  buy, before you own a bike to film.

Measurements stay in the browser and are never sent anywhere. The app fetches geometry data from the bikedb REST API at runtime, so changes to the bike database are live without rebuilds.

> **Status: BuyFit works, Bike Fitting does not yet.** `main` holds the web
> rewrite. BuyFit is live at
> [ataltpr06.lnxnet.org:8081](http://ataltpr06.lnxnet.org:8081/) (internal network only) with geometry data from the
> bikedb API. The fitting flow is still a menu entry:
> the Flutter app that did complete the capture flow on an Android device is at
> the tag `flutter-final` (`git checkout flutter-final`).
>
> No measurement this project produces has ever been checked against a tape
> measure. Do not make changes to your bike based on its numbers yet.

## How the fitting flow works

Described as designed; see `doc/web-redesign.md` for the web version of it.

1. **Setup** — enter your wheel + tyre outer diameter in mm.
2. **Calibration** — take one still photo of the bike and tap four points: top
   and bottom of the front wheel, the bottom bracket, the saddle top. The wheel
   taps give a millimetre-per-pixel scale for everything that follows.
3. **Pedaling** — the live camera stream runs pose detection at full frame
   rate, tracking the ankle's motion. A cadence validity gate arms once
   pedaling is detected as steady (40–110 rpm cadence, ±20% consistent
   intervals, ≥150 mm ankle vertical travel). Once armed, each bottom-of-stroke
   cycle is confirmed by ankle-X extremum, and that frame is captured and
   encoded to JPEG on a background isolate. Five valid cycles are kept.
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
- Film the **non-drive (left) side**. Framing the **front wheel to the right**
  is the documented setup, but the app no longer depends on it: which
  direction counts as pedal-forward is derived from your calibration taps, by
  comparing the front wheel's x against the bottom bracket's.
- **Do not move the phone between the calibration photo and the pedaling
  capture.** The scale comes from that photo and is reused for every millimetre
  figure afterwards.

## Building

Needs Node. Vite + TypeScript + Preact.

```sh
npm install
npm run dev                 # or: npm run build && npm run preview
```

Testing locally: `npm run dev` (Vite dev server with `/api` proxy to bikedb). Testing on a phone over
USB: `adb reverse tcp:5173 tcp:5173` and open `http://localhost:5173`.

## Deployment

Three containers run on the host `ataltpr06.lnxnet.org`:
- **velofit** (Caddy, port 8081): Serves the SPA and proxies `/api` → bikedb.
- **bikedb** (Go, port 8080): REST API and web GUI for bike geometry. Schema migrates on startup.
- **postgres** (internal network): Database for bikedb.

Images are pushed to `ghcr.io/fox27374/` as public images. The systemd user unit at `~/.config/systemd/user/velofit.service`
manages the podman-compose stack. Geometry data now comes from bikedb instead of a bundled JSON file.

Everything runs rootless as the host user `claude`, so no step needs root. The
unit is a *user* unit; `sudo loginctl enable-linger claude` is what keeps the
containers alive after logout and brings them back after a reboot.

Run [`deploy/deploy.sh`](deploy/deploy.sh) to build and deploy both images, copy config to the host, and run health checks.
It talks to the host through the ssh alias `tpr06` (override with `VELOFIT_HOST`).
State lives at `~/velofit/` on the host: `.env` (with `POSTGRES_PASSWORD`), `compose.yaml`, and the `pgdata` volume.

The host is reachable on port 22 only, so to open the app from outside that
network, tunnel it:

```sh
ssh -L 8081:localhost:8081 -L 8080:localhost:8080 tpr06
open http://localhost:8081
```

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
- [`doc/web-redesign.md`](doc/web-redesign.md) — the agreed design of the web
  fitting flow.
- [`doc/buyfit-design.md`](doc/buyfit-design.md) — the agreed design of BuyFit,
  including where it deliberately overrules the evidence.
- [`doc/bike-type-profiles.md`](doc/bike-type-profiles.md) — designed but
  unimplemented road / mountain / triathlon profiles.
- [`doc/fit-targets-research.md`](doc/fit-targets-research.md) — sourced target
  ranges with citations.
- [`doc/frame-sizing-research.md`](doc/frame-sizing-research.md) — what the
  literature does and does not support about sizing a frame from body
  measurements. Short version: saddle height yes, reach no.

## License

[Apache License 2.0](LICENSE). Copyright 2026 Daniel Kofler.

Dependencies are separately licensed and permissive: Preact, Vite and Vitest
under MIT. The bundled typeface is Archivo (Omnibus-Type), under the SIL Open
Font License 1.1 — self-hosted in `public/fonts/` rather than linked from
Google Fonts, so that loading the app really does send nothing anywhere.
MediaPipe, once the pose detection lands, ships under Apache-2.0 with Google's
own model terms, independent of this project's license.
