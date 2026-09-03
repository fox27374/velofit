"""Regenerate the VeloFit launcher icons.

The mark is a bold V (VeloFit) whose vertex carries the amber arc of a measured
joint angle — the thing the app actually does. Two strokes and an arc, so it
survives being shrunk to a 48dp launcher tile.

Needs Pillow, which is not a project dependency — it is only used here:

    python3 -m venv /tmp/iconvenv && /tmp/iconvenv/bin/pip install pillow
    /tmp/iconvenv/bin/python tool/make_icon.py

then regenerate the platform icons:

    dart run flutter_launcher_icons
"""
import math
from PIL import Image, ImageDraw

S = 1024        # output size
SS = 4          # supersample factor, downsampled at the end for antialiasing
W = S * SS

BG = (11, 61, 145, 255)     # deep blue
STROKE = (255, 255, 255)    # left leg of the V
ACCENT = (94, 214, 255)     # right leg, cyan
ARC = (255, 209, 71)        # the measured angle


def draw_mark(d, cx, cy, r):
    apex = (cx + r * 0.10, cy + r * 0.72)
    left = (cx - r * 0.78, cy - r * 0.70)
    right = (cx + r * 0.78, cy - r * 0.70)
    lw = int(r * 0.30)

    # The arc goes down first so the legs clip its ends: it reads as spanning
    # the angle rather than as a stripe painted across the V.
    ar = r * 1.02
    a1 = math.degrees(math.atan2(left[1] - apex[1], left[0] - apex[0])) % 360
    a2 = math.degrees(math.atan2(right[1] - apex[1], right[0] - apex[0])) % 360
    if (a2 - a1) % 360 > 180:
        a1, a2 = a2, a1
    d.arc([apex[0] - ar, apex[1] - ar, apex[0] + ar, apex[1] + ar],
          a1, a2, fill=ARC, width=int(r * 0.12))

    d.line([left, apex], fill=STROKE, width=lw)
    d.line([apex, right], fill=ACCENT, width=lw)
    # round the ends: PIL has no line caps
    for p, fill in ((left, STROKE), (right, ACCENT), (apex, ACCENT)):
        d.ellipse([p[0] - lw / 2, p[1] - lw / 2, p[0] + lw / 2, p[1] + lw / 2], fill=fill)


def render(path, background, mark_scale):
    img = Image.new('RGBA', (W, W), background)
    draw_mark(ImageDraw.Draw(img), W / 2, W / 2, W / 2 * mark_scale)
    img.resize((S, S), Image.LANCZOS).save(path)
    print('wrote', path)


if __name__ == '__main__':
    # Full icon: solid tile, used as-is on iOS and as the legacy Android icon.
    render('assets/icon/velofit.png', BG, 0.60)
    # Android adaptive foreground: transparent, mark kept well inside the
    # 66% safe zone since the launcher may mask or animate it.
    render('assets/icon/velofit_foreground.png', (0, 0, 0, 0), 0.38)
