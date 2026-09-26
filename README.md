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

Five containers run rootless as the user `claude` on `ataltpr06.lnxnet.org`
(10.140.60.248, reachable on the LAN), from `~/velofit/compose.yaml`:

| Container | Image | Port | |
|---|---|---|---|
| velofit | `velofit` (Caddy) | 8081 | The app; proxies `/api/*` to `bikedb:8080` |
| bikedb | `bikedb-api` | 8080 | Read-only geometry API. Only service with `DATABASE_URL`. Its write listener `:8090` is never published |
| bikedb-scraper | `bikedb-scraper` | — | Scrape worker; health on `:8091`, unpublished |
| bikedb-web | `bikedb-web` | 8082 | bikedb admin GUI, basic auth |
| db | `postgres:16` | — | Volume `velofit_pgdata` |

The API keeps the service name `bikedb` because the Caddyfile baked into the
velofit image proxies to `bikedb:8080`. `~/velofit/.env` holds
`POSTGRES_PASSWORD`, `BIKEDB_INTERNAL_TOKEN`, `ADMIN_USER`,
`ADMIN_PASSWORD_HASH` (bcrypt, pasted verbatim) and the two image tags
`BIKEDB_TAG` and `VELOFIT_TAG`; compose refuses to start without them. The
user unit `velofit.service` runs `podman-compose up -d` at boot, and
`loginctl enable-linger claude` keeps it alive without a login.

**Updating.** The `ghcr.io/fox27374/*` packages are private and the host has
no registry login, so images travel over ssh, and podman-compose 1.0.6 is not
used for updates: it ignores `--no-deps` and restarts db with whatever it
recreates. Instead:

```sh
# on this Mac, per image (bikedb: Dockerfile.api / .scraper / .web from the bikedb repo root)
podman build --platform linux/amd64 -f deploy/Containerfile -t ghcr.io/fox27374/velofit:$TAG .
podman save ghcr.io/fox27374/velofit:$TAG | gzip -1 | ssh tpr06 'gunzip | podman load'

# on the host: dump first, set the tags in .env, then swap the app containers
podman exec velofit_db_1 pg_dump -U bikedb -d bikedb > ~/velofit/backups/bikedb-$(date +%Y%m%d-%H%M%S).sql
bash ~/velofit/recreate.sh <bikedb-tag> <velofit-tag>
```

[`deploy/recreate.sh`](deploy/recreate.sh) (copy it to `~/velofit/`) removes
velofit, web, scraper and the API in dependency order and starts them again
on the new images from their own `podman inspect` config, restating the
healthchecks; db keeps running. To update velofit alone, `podman run
--replace` its container with the same labels, network alias, port and
`--requires`; nothing depends on it. If db ever sticks in "Stopping" with no
process behind it, `podman rm -f --depend velofit_db_1` (the volume survives)
and then, as a separate step, `systemctl --user restart velofit`.

[`deploy/deploy.sh`](deploy/deploy.sh) predates all of this and assumes
public images; see `PROGRESS.md` next step 9.

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
