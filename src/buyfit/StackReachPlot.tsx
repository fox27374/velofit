import { ratioOf, type BikeSize, type StackReachWindow } from './matcher'
import type { LegProportion } from './sizing'

/**
 * Candidate bikes on the stack/reach plane, with the search window drawn as a
 * dimensioned rectangle the way a maker's geometry chart would draw it.
 *
 * The plot earns its place by showing what the list cannot: which bikes are
 * effectively the same shape, and which one sits off on its own. It carries no
 * more authority than the window does — the window is `No source`, and the
 * drawing is only a picture of it.
 */

const W = 520
const H = 340
const PAD = { top: 22, right: 28, bottom: 46, left: 58 }

// Labels sit beside their point, nudged up or down when two labels would
// collide, and are placed loneliest point first: the bike off on its own is
// what the plot is for, so it gets first pick of the space. A label that
// would run past the right edge flips to the left of its point. A point with
// no free slot, or whose name is already shown, goes unlabelled --
// its name stays in the hover title and in the list below. Labels also keep
// clear of other points, so no circle hides a name.
const LABEL_OFFSETS = [3, -23, 29]
const LABEL_GAP = 11
// ponytail: width estimated from the 11px label font, not measured; measure
// with getComputedTextLength if a font change makes labels collide.
const CHAR_W = 6

export const labelText = (b: { brand: string; model: string }) => {
  const text = `${b.brand} ${b.model}`
  return text.length > 24 ? text.substring(0, 23) + '…' : text
}

export interface LabelPlacement {
  dy: number
  side: 'right' | 'left'
}

export interface Box {
  x0: number
  x1: number
  y0: number
  y1: number
}

export function placeLabels(
  points: { x: number; y: number; text: string }[],
  rightEdge = Infinity,
  avoid: Box[] = []
): (LabelPlacement | null)[] {
  const nearest = points.map((p, i) =>
    Math.min(Infinity, ...points.filter((_, j) => j !== i).map((q) => Math.hypot(p.x - q.x, p.y - q.y)))
  )
  const order = points.map((_, i) => i).sort((i, j) => nearest[j] - nearest[i])
  const boxes: { x0: number; x1: number; y: number; text: string }[] = []
  const out: (LabelPlacement | null)[] = points.map(() => null)
  for (const i of order) {
    const { x, y, text } = points[i]
    // Labels carry no size, so a second size of the same bike would repeat
    // the name word for word; one label per bike is enough.
    if (boxes.some((b) => b.text === text)) continue
    const w = text.length * CHAR_W
    const side = x + LABEL_GAP + w > rightEdge ? 'left' : 'right'
    const x0 = side === 'right' ? x + LABEL_GAP : x - LABEL_GAP - w
    const x1 = x0 + w
    // A label's text runs from about 9 px above its baseline to 2 below, and
    // must clear every other label, every other point's 6 px circle and
    // anything else drawn on the plot, such as the lean arrow.
    const dy = LABEL_OFFSETS.find(
      (dy) =>
        !avoid.some(
          (a) => a.x0 < x1 + 2 && x0 < a.x1 + 2 && a.y0 < y + dy + 4 && y + dy - 11 < a.y1
        ) &&
        !boxes.some((b) => b.x0 < x1 + 4 && x0 < b.x1 + 4 && Math.abs(b.y - (y + dy)) < 13) &&
        !points.some(
          (q, j) => j !== i && q.x + 6 > x0 && q.x - 6 < x1 && Math.abs(q.y - (y + dy - 4)) < 12
        )
    )
    if (dy === undefined) continue
    boxes.push({ x0, x1, y: y + dy, text })
    out[i] = { dy, side }
  }
  return out
}

// Fixed on purpose: the arrow says which way, never how far. A length that
// grew with the ratio would read as a millimetre shift no source gives
// (doc/frame-sizing-research.md §4.5).
const LEAN_LENGTH = 40
const LEAN_HEAD = 7

export interface LeanArrow {
  x1: number
  y1: number
  x2: number
  y2: number
  /** Arrowhead triangle, as an SVG points string. */
  head: string
}

/**
 * The leg-proportion lean, in plot pixels: from the window's centre towards
 * the corner that proportion favours. Long legs lean to most stack and least
 * reach (up-left), short legs to least stack and most reach (down-right).
 * Typical or unknown proportion draws nothing. The window, the matches and
 * their order are untouched: this is a direction to weigh on a test ride.
 *
 * `rect` is the window in pixels, top-left origin, as the plot draws it.
 */
export function leanArrow(
  rect: { x: number; y: number; width: number; height: number },
  proportion: LegProportion | null
): LeanArrow | null {
  if (proportion !== 'long' && proportion !== 'short') return null

  const cx = rect.x + rect.width / 2
  const cy = rect.y + rect.height / 2
  const s = proportion === 'long' ? -1 : 1
  // Towards the corner; a window flat in either axis falls back to the
  // diagonal so the direction never collapses.
  const dx = s * (rect.width || 1)
  const dy = s * (rect.height || 1)
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len

  const x2 = cx + ux * LEAN_LENGTH
  const y2 = cy + uy * LEAN_LENGTH
  const bx = x2 - ux * LEAN_HEAD
  const by = y2 - uy * LEAN_HEAD
  const hw = LEAN_HEAD / 2
  const head = [
    [x2, y2],
    [bx - uy * hw, by + ux * hw],
    [bx + uy * hw, by - ux * hw],
  ]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')

  return { x1: cx, y1: cy, x2: bx, y2: by, head }
}

/** The space the arrow covers, head included, for the labels to keep clear of. */
export function leanBox(a: LeanArrow): Box {
  const xs = a.head.split(' ').map((p) => Number(p.split(',')[0])).concat(a.x1)
  const ys = a.head.split(' ').map((p) => Number(p.split(',')[1])).concat(a.y1)
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
}

export function StackReachPlot({
  bikes,
  fitWindow,
  median,
  proportion = null,
}: {
  bikes: BikeSize[]
  fitWindow: StackReachWindow
  median: number | null
  proportion?: LegProportion | null
}) {
  if (bikes.length === 0) return null

  // Pad the extents so points never sit on the frame.
  const reaches = bikes.map((b) => b.reach).concat(fitWindow.reachMin, fitWindow.reachMax)
  const stacks = bikes.map((b) => b.stack).concat(fitWindow.stackMin, fitWindow.stackMax)
  const x0 = Math.min(...reaches) - 8
  const x1 = Math.max(...reaches) + 8
  const y0 = Math.min(...stacks) - 10
  const y1 = Math.max(...stacks) + 10

  const px = (reach: number) =>
    PAD.left + ((reach - x0) / (x1 - x0)) * (W - PAD.left - PAD.right)
  // Stack grows upwards, as it does on the bike.
  const py = (stack: number) =>
    H - PAD.bottom - ((stack - y0) / (y1 - y0)) * (H - PAD.top - PAD.bottom)

  const isRacy = (b: BikeSize) => median !== null && ratioOf(b) < median
  const win = {
    x: px(fitWindow.reachMin),
    y: py(fitWindow.stackMax),
    width: Math.max(px(fitWindow.reachMax) - px(fitWindow.reachMin), 1),
    height: Math.max(py(fitWindow.stackMin) - py(fitWindow.stackMax), 1),
  }
  const lean = leanArrow(win, proportion)
  const labels = placeLabels(
    bikes.map((b) => ({ x: px(b.reach), y: py(b.stack), text: labelText(b) })),
    W - 4,
    lean ? [leanBox(lean)] : []
  )

  return (
    <svg
      class="plot"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Stack and reach of ${bikes.length} bikes that fit, against your search window`}
    >
      <line class="plot-axis" x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} />
      <line
        class="plot-axis"
        x1={PAD.left}
        y1={H - PAD.bottom}
        x2={W - PAD.right}
        y2={H - PAD.bottom}
      />

      <text class="plot-label" x={PAD.left - 6} y={py(y0 + 4)} text-anchor="end">
        {Math.round(y0 + 10)}
      </text>
      <text class="plot-label" x={PAD.left - 6} y={py(y1 - 4)} text-anchor="end">
        {Math.round(y1 - 10)}
      </text>
      <text class="plot-label" x={12} y={PAD.top + 56} transform={`rotate(-90 12 ${PAD.top + 56})`}>
        stack mm
      </text>
      <text class="plot-label" x={px(x0 + 8)} y={H - PAD.bottom + 16} text-anchor="middle">
        {Math.round(x0 + 8)}
      </text>
      <text class="plot-label" x={px(x1 - 8)} y={H - PAD.bottom + 16} text-anchor="middle">
        {Math.round(x1 - 8)}
      </text>
      <text class="plot-label" x={(PAD.left + W - PAD.right) / 2} y={H - 8} text-anchor="middle">
        reach mm
      </text>

      <rect class="plot-dim-fill" {...win} />
      <rect class="plot-dim" fill="none" {...win} />
      <text
        class="plot-dim-text"
        x={px(fitWindow.reachMin)}
        y={py(fitWindow.stackMax) - 7}
      >
        your window
      </text>

      {bikes.map((bike) => (
        <g key={`${bike.brand}-${bike.model}-${bike.size}`}>
          <title>
            {bike.brand} {bike.model}, size {bike.size}: stack {bike.stack} mm, reach{' '}
            {bike.reach} mm
          </title>
          <circle
            class="plot-point"
            cx={px(bike.reach)}
            cy={py(bike.stack)}
            r="6"
            fill={`var(--series-${isRacy(bike) ? 'racy' : 'upright'})`}
          />
        </g>
      ))}

      {/* Over the points, and the names keep clear of it. Its words sit in
          the legend below, because the window's centre is where the bikes
          crowd and a label there collided with theirs. */}
      {lean && (
        <g class="plot-lean">
          <title>
            Your {proportion} legs lean this way inside the window. A direction only:
            no source gives how far, so it moves no bike in or out.
          </title>
          <line x1={lean.x1} y1={lean.y1} x2={lean.x2} y2={lean.y2} />
          <polygon points={lean.head} />
        </g>
      )}

      {/* Labels after every point, so no circle is painted over a name. */}
      {bikes.map((bike, i) => {
        const label = labels[i]
        if (!label) return null
        const cx = px(bike.reach)
        const cy = py(bike.stack)
        const dir = label.side === 'left' ? -1 : 1
        return (
          <g key={`label-${bike.brand}-${bike.model}-${bike.size}`}>
            {label.dy !== 3 && (
              <line
                class="plot-leader"
                x1={cx + 6 * dir}
                y1={cy}
                x2={cx + 9 * dir}
                y2={cy + label.dy - 3}
              />
            )}
            <text
              class="plot-point-label"
              x={cx + 11 * dir}
              y={cy + label.dy}
              text-anchor={dir < 0 ? 'end' : 'start'}
            >
              {labelText(bike)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
