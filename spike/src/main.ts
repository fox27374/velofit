// Throwaway spike. Answers two questions before the web rewrite is built:
// can a browser reach every frame of a phone video, and how long does
// MediaPipe pose take over one on a mid-range phone. See doc/web-redesign.md.
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const video = $<HTMLVideoElement>('video');
const out = $<HTMLPreElement>('out');
const status = (s: string) => ($('status').textContent = s);
const num = (id: string) => Number($<HTMLInputElement>(id).value);

// BlazePose indices, left side faces the camera.
const SHOULDER = 11, HIP = 23, KNEE = 25, ANKLE = 27;
const TARGETS: Record<string, number> = { bottom: Math.PI / 2, top: -Math.PI / 2, forward: 0 };

type Pt = { x: number; y: number; v: number };
type Sample = { k: number; t: number; pts: Record<number, Pt> | null };

let report: Record<string, unknown> = {};
let frameDt = 0; // median seconds per frame, from the delivery pass
// Presented timestamp of every frame. Phones often record variable frame rate,
// so frames are addressed by observed timestamp, not by a fixed grid.
let frameTimes: number[] = [];
let landmarker: PoseLandmarker | null = null;
let landmarkerKey = '';

$<HTMLInputElement>('file').onchange = (e) => {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  video.src = URL.createObjectURL(f);
  frameDt = 0;
  report = { file: { name: f.name, type: f.type, sizeMB: +(f.size / 1e6).toFixed(1) } };
  video.onloadedmetadata = () => {
    report.video = { w: video.videoWidth, h: video.videoHeight, duration: +video.duration.toFixed(3) };
    show();
    status('Loaded. Run 1, then 2.');
  };
};

$('deliver').onclick = () => run(deliveryPass);
$('analyse').onclick = () => run(async () => { if (!frameDt) await deliveryPass(); await analyse(); });
// A download rather than the clipboard: the clipboard API needs a secure
// context, and the phone reaches the dev server over plain http.
$('copy').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(report)], { type: 'application/json' }));
  a.download = `spike-${Date.now()}.json`;
  a.click();
};

async function run(f: () => Promise<void>) {
  try { await f(); } catch (err) { status('ERROR: ' + err); console.error(err); }
}

function show() {
  out.textContent = JSON.stringify({ ...report, samples: undefined }, null, 1);
}

const median = (a: number[]) => { const s = [...a].sort((p, q) => p - q); return s.length ? s[s.length >> 1] : NaN; };
const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;

// Criterion 1: play the file once and record every presented frame's timestamp.
async function deliveryPass() {
  status('Delivery pass: playing…');
  video.pause();
  await seekRaw(0);
  video.playbackRate = num('rate');
  const times: number[] = [];
  const presented: number[] = [];
  await new Promise<void>((resolve) => {
    const cb: VideoFrameRequestCallback = (_now, m) => {
      times.push(m.mediaTime);
      presented.push(m.presentedFrames);
      if (!video.ended) video.requestVideoFrameCallback(cb);
    };
    video.requestVideoFrameCallback(cb);
    video.onended = () => resolve();
    video.play();
  });
  const uniq = [...new Set(times)].sort((a, b) => a - b);
  const deltas = uniq.slice(1).map((t, i) => t - uniq[i]);
  frameDt = median(deltas);
  // Frames playback skipped get an interpolated timestamp so they stay addressable.
  frameTimes = [uniq[0]];
  for (const t of uniq.slice(1)) {
    const prev = frameTimes[frameTimes.length - 1];
    const n = Math.round((t - prev) / frameDt);
    for (let i = 1; i < n; i++) frameTimes.push(prev + ((t - prev) * i) / n);
    frameTimes.push(t);
  }
  const missing = deltas.reduce((n, d) => n + Math.max(0, Math.round(d / frameDt) - 1), 0);
  const expected = Math.round((uniq[uniq.length - 1] - uniq[0]) / frameDt) + 1;
  report.delivery = {
    playbackRate: video.playbackRate,
    callbacks: times.length,
    uniqueFrames: uniq.length,
    duplicateTimestamps: times.length - uniq.length,
    fps: +(1 / frameDt).toFixed(2),
    expectedFrames: expected,
    missingFrames: missing,
    deliveredPct: +((100 * uniq.length) / expected).toFixed(2),
    presentedFramesSpan: presented[presented.length - 1] - presented[0] + 1,
    frameIntervalMs: { min: +(1000 * Math.min(...deltas)).toFixed(2), median: +(1000 * frameDt).toFixed(2), max: +(1000 * Math.max(...deltas)).toFixed(2) },
  };
  show();
  status('Delivery pass done.');
}

function nearest(t: number) {
  let best = 0;
  for (let k = 1; k < frameTimes.length; k++) if (Math.abs(frameTimes[k] - t) < Math.abs(frameTimes[best] - t)) best = k;
  return best;
}

function seekRaw(t: number) {
  return new Promise<void>((res) => {
    video.addEventListener('seeked', () => res(), { once: true });
    video.currentTime = t;
  });
}

// Seek to the middle of frame k and report which frame the browser presented.
let seekNoCallback = 0;
async function seekFrame(k: number): Promise<boolean> {
  const t = frameTimes[k];
  const next = frameTimes[k + 1] ?? t + frameDt;
  let presentedT: number | null = null;
  const id = video.requestVideoFrameCallback((_n, m) => { presentedT = m.mediaTime; });
  await seekRaw(t + (next - t) / 2);
  if (presentedT === null) await new Promise((r) => setTimeout(r, 50));
  video.cancelVideoFrameCallback(id);
  if (presentedT === null) { seekNoCallback++; return false; }
  return Math.abs(presentedT - t) < (next - t) / 4;
}

async function getLandmarker() {
  const key = $<HTMLSelectElement>('model').value + '/' + $<HTMLSelectElement>('delegate').value;
  if (landmarker && key === landmarkerKey) return landmarker;
  landmarker?.close();
  const [model, delegate] = key.split('/') as [string, 'GPU' | 'CPU'];
  const fileset = await FilesetResolver.forVisionTasks(new URL('wasm', location.href).href);
  const t0 = performance.now();
  try {
    landmarker = await PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `models/pose_landmarker_${model}.task`, delegate },
      runningMode: 'IMAGE',
      numPoses: 1,
    });
    report.model = { model, delegate };
  } catch (err) {
    landmarker = await PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `models/pose_landmarker_${model}.task`, delegate: 'CPU' },
      runningMode: 'IMAGE',
      numPoses: 1,
    });
    report.model = { model, delegate: 'CPU', gpuFailed: String(err) };
  }
  (report.model as Record<string, unknown>).loadMs = Math.round(performance.now() - t0);
  landmarkerKey = key;
  return landmarker;
}

async function analyse() {
  const lm = await getLandmarker();
  video.pause();
  const k0 = nearest(num('start'));
  const k1 = nearest(frameTimes[k0] + num('max'));
  seekNoCallback = 0;
  const step = Math.max(1, num('step'));
  const samples = new Map<number, Sample>();
  const seekMs: number[] = [];
  const poseMs: number[] = [];
  let seekHits = 0;
  const tStart = performance.now();

  const process = async (k: number) => {
    if (samples.has(k)) return;
    let t = performance.now();
    if (await seekFrame(k)) seekHits++;
    seekMs.push(performance.now() - t);
    t = performance.now();
    const r = lm.detect(video);
    poseMs.push(performance.now() - t);
    const l = r.landmarks[0];
    const pts = l ? Object.fromEntries([SHOULDER, HIP, KNEE, ANKLE].map((i) => [i, { x: l[i].x * video.videoWidth, y: l[i].y * video.videoHeight, v: l[i].visibility ?? 0 }])) : null;
    samples.set(k, { k, t: frameTimes[k], pts });
  };

  // Coarse pass.
  const coarseKs: number[] = [];
  for (let k = k0; k <= k1; k += step) coarseKs.push(k);
  for (const [i, k] of coarseKs.entries()) {
    await process(k);
    if (i % 5 === 0) status(`Coarse ${i + 1}/${coarseKs.length}`);
  }
  const coarseMs = performance.now() - tStart;

  // Crank angle proxy: ankle angle around the median ankle position.
  const coarse = coarseKs.map((k) => samples.get(k)!).filter((s) => s.pts && s.pts[ANKLE].v > 0.5);
  const cx = median(coarse.map((s) => s.pts![ANKLE].x));
  const cy = median(coarse.map((s) => s.pts![ANKLE].y));
  const theta = (s: Sample) => Math.atan2(s.pts![ANKLE].y - cy, s.pts![ANKLE].x - cx);
  const unwrapped: number[] = [];
  for (const s of coarse) {
    const a = theta(s);
    if (!unwrapped.length) { unwrapped.push(a); continue; }
    const prev = unwrapped[unwrapped.length - 1];
    unwrapped.push(a + 2 * Math.PI * Math.round((prev - a) / (2 * Math.PI)));
  }
  const revolutions = unwrapped.length ? Math.abs(unwrapped[unwrapped.length - 1] - unwrapped[0]) / (2 * Math.PI) : 0;

  // Refine: full-rate frames around each crossing of each target angle.
  const picks: Record<string, number[]> = { bottom: [], top: [], forward: [] };
  const tRefine = performance.now();
  for (const [name, a] of Object.entries(TARGETS)) {
    for (let i = 0; i + 1 < coarse.length; i++) {
      const u0 = unwrapped[i], u1 = unwrapped[i + 1];
      if (Math.abs(u1 - u0) > Math.PI) continue;
      const c0 = Math.floor((u0 - a) / (2 * Math.PI)), c1 = Math.floor((u1 - a) / (2 * Math.PI));
      if (c0 === c1) continue;
      const b = a + 2 * Math.PI * Math.max(c0, c1);
      const tc = coarse[i].t + ((b - u0) / (u1 - u0)) * (coarse[i + 1].t - coarse[i].t);
      const kc = nearest(tc);
      const window: number[] = [];
      for (let k = Math.max(k0, kc - 2); k <= Math.min(k1, kc + 2); k++) { await process(k); window.push(k); }
      const best = window
        .map((k) => samples.get(k)!)
        .filter((s) => s.pts && s.pts[ANKLE].v > 0.5)
        .map((s) => ({ k: s.k, err: Math.abs(Math.atan2(Math.sin(theta(s) - a), Math.cos(theta(s) - a))) }))
        .sort((p, q) => p.err - q.err)[0];
      if (best) picks[name].push(best.k);
      status(`Refine ${name}: ${picks[name].length}`);
    }
  }
  const refineMs = performance.now() - tRefine;
  const totalMs = performance.now() - tStart;
  const detected = [...samples.values()].filter((s) => s.pts).length;

  report.analysis = {
    window: { k0, k1, seconds: +(frameTimes[k1] - frameTimes[k0]).toFixed(2) },
    coarseStep: step,
    framesProcessed: samples.size,
    poseDetectedPct: +((100 * detected) / samples.size).toFixed(1),
    seekExactPct: +((100 * seekHits) / samples.size).toFixed(1),
    seekNoCallback,
    seekMsAvg: +mean(seekMs).toFixed(1),
    poseMsAvg: +mean(poseMs).toFixed(1),
    poseMsMedian: +median(poseMs).toFixed(1),
    coarseSec: +(coarseMs / 1000).toFixed(1),
    refineSec: +(refineMs / 1000).toFixed(1),
    totalSec: +(totalMs / 1000).toFixed(1),
    revolutions: +revolutions.toFixed(2),
    cadenceRpm: +((60 * revolutions) / ((coarse[coarse.length - 1]?.t ?? 0) - (coarse[0]?.t ?? 0))).toFixed(1),
    picks: Object.fromEntries(Object.entries(picks).map(([n, ks]) => [n, ks.length])),
    allFramesEstimateSec: +(((k1 - k0 + 1) * (mean(seekMs) + mean(poseMs))) / 1000).toFixed(1),
  };
  report.samples = [...samples.values()].sort((p, q) => p.k - q.k).map((s) => s.pts ? [s.k, Math.round(s.pts[ANKLE].x), Math.round(s.pts[ANKLE].y)] : [s.k]);
  show();
  drawLoop(coarse, cx, cy);
  drawTrace([...samples.values()].sort((p, q) => p.k - q.k), picks);
  const mid = picks.bottom[picks.bottom.length >> 1];
  if (mid !== undefined) await drawFrame(samples.get(mid)!);
  status(`Done in ${(totalMs / 1000).toFixed(1)} s.`);
}

function drawLoop(ss: Sample[], cx: number, cy: number) {
  const c = $<HTMLCanvasElement>('loop').getContext('2d')!;
  c.clearRect(0, 0, 400, 400);
  if (!ss.length) return;
  const xs = ss.map((s) => s.pts![ANKLE].x), ys = ss.map((s) => s.pts![ANKLE].y);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const span = Math.max(Math.max(...xs) - minX, Math.max(...ys) - minY, 1);
  const px = (x: number) => 20 + ((x - minX) / span) * 360;
  const py = (y: number) => 20 + ((y - minY) / span) * 360;
  ss.forEach((s, i) => {
    c.fillStyle = `hsl(${(240 * i) / ss.length},80%,45%)`;
    c.fillRect(px(s.pts![ANKLE].x) - 2, py(s.pts![ANKLE].y) - 2, 4, 4);
  });
  c.strokeStyle = 'red';
  c.strokeRect(px(cx) - 4, py(cy) - 4, 8, 8);
  c.fillStyle = '#000';
  c.fillText('ankle path (image px, colour = time), red = centre', 4, 12);
}

function drawTrace(ss: Sample[], picks: Record<string, number[]>) {
  const c = $<HTMLCanvasElement>('trace').getContext('2d')!;
  c.clearRect(0, 0, 800, 240);
  const ok = ss.filter((s) => s.pts);
  if (!ok.length) return;
  const t0 = ok[0].t, t1 = ok[ok.length - 1].t;
  const ys = ok.map((s) => s.pts![ANKLE].y);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const px = (t: number) => 10 + ((t - t0) / (t1 - t0 || 1)) * 780;
  const py = (y: number) => 20 + ((y - minY) / (maxY - minY || 1)) * 200;
  c.strokeStyle = '#444';
  c.beginPath();
  ok.forEach((s, i) => (i ? c.lineTo : c.moveTo).call(c, px(s.t), py(s.pts![ANKLE].y)));
  c.stroke();
  const colour: Record<string, string> = { bottom: 'red', top: 'blue', forward: 'green' };
  for (const [n, ks] of Object.entries(picks)) {
    c.fillStyle = colour[n];
    for (const k of ks) {
      const s = ss.find((q) => q.k === k)!;
      c.fillRect(px(s.t) - 3, py(s.pts![ANKLE].y) - 3, 6, 6);
    }
  }
  c.fillStyle = '#000';
  c.fillText('ankle y over time (down = lower); picks: red bottom, blue top, green forward', 4, 12);
}

async function drawFrame(s: Sample) {
  await seekFrame(s.k);
  const cv = $<HTMLCanvasElement>('frame');
  cv.width = video.videoWidth;
  cv.height = video.videoHeight;
  const c = cv.getContext('2d')!;
  c.drawImage(video, 0, 0);
  if (!s.pts) return;
  c.strokeStyle = 'yellow';
  c.lineWidth = Math.max(3, cv.width / 300);
  c.beginPath();
  [SHOULDER, HIP, KNEE, ANKLE].forEach((i, j) => (j ? c.lineTo : c.moveTo).call(c, s.pts![i].x, s.pts![i].y));
  c.stroke();
  c.fillStyle = 'red';
  for (const i of [SHOULDER, HIP, KNEE, ANKLE]) c.fillRect(s.pts[i].x - 6, s.pts[i].y - 6, 12, 12);
}
