import { ratioOf, type BikeSize, type StackReachWindow } from './matcher'

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

// Labels sit right of their point, nudged up or down when two points are
// close enough to collide. The nudges widen and then run out: with more
// neighbours than slots, the label overlaps rather than searching forever.
const LABEL_OFFSETS = [3, -23, 29, -49, 55]

export function labelOffset(placed: { x: number; y: number }[], cx: number, cy: number) {
  const free = LABEL_OFFSETS.find(
    (dy) => !placed.some((p) => Math.abs(p.x - cx) < 90 && Math.abs(p.y - (cy + dy)) < 13)
  )
  return free ?? LABEL_OFFSETS[0]
}

export function StackReachPlot({
  bikes,
  fitWindow,
  median,
}: {
  bikes: BikeSize[]
  fitWindow: StackReachWindow
  median: number | null
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

  const placed: { x: number; y: number }[] = []

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

      <rect
        class="plot-dim-fill"
        x={px(fitWindow.reachMin)}
        y={py(fitWindow.stackMax)}
        width={Math.max(px(fitWindow.reachMax) - px(fitWindow.reachMin), 1)}
        height={Math.max(py(fitWindow.stackMin) - py(fitWindow.stackMax), 1)}
      />
      <rect
        class="plot-dim"
        fill="none"
        x={px(fitWindow.reachMin)}
        y={py(fitWindow.stackMax)}
        width={Math.max(px(fitWindow.reachMax) - px(fitWindow.reachMin), 1)}
        height={Math.max(py(fitWindow.stackMin) - py(fitWindow.stackMax), 1)}
      />
      <text
        class="plot-dim-text"
        x={px(fitWindow.reachMin)}
        y={py(fitWindow.stackMax) - 7}
      >
        your window
      </text>

      {bikes.map((bike) => {
        const cx = px(bike.reach)
        const cy = py(bike.stack)
        const dy = labelOffset(placed, cx, cy)
        placed.push({ x: cx, y: cy + dy })
        return (
          <g key={`${bike.brand}-${bike.model}-${bike.size}`}>
            <title>
              {bike.brand} {bike.model}, size {bike.size}: stack {bike.stack} mm, reach{' '}
              {bike.reach} mm
            </title>
            <circle
              class="plot-point"
              cx={cx}
              cy={cy}
              r="6"
              fill={`var(--series-${isRacy(bike) ? 'racy' : 'upright'})`}
            />
            {dy !== 3 && (
              <line
                class="plot-leader"
                x1={cx + 6}
                y1={cy}
                x2={cx + 9}
                y2={cy + dy - 3}
              />
            )}
            <text class="plot-point-label" x={cx + 11} y={cy + dy}>
              {bike.model.split(' ')[0]} {bike.size}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
