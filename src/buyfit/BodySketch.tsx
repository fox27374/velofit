/**
 * "84.5 cm" from 845 mm. Whole centimetres drop the decimal: "178 cm".
 */
export function formatCm(mm: number): string {
  const cm = Math.round(mm) / 10
  return `${Number.isInteger(cm) ? cm : cm.toFixed(1)} cm`
}

// Front view, standing, arms at the sides. One open path from the right side
// of the neck, round the whole body, to the left side of the neck; the head is
// a separate ellipse. Symmetric about x = 135. Floor at y = 308.
const OUTLINE =
  'M 142,45 L 142,56 C 151,58 167,59 173,66 C 179,80 181,100 182,120 L 185,168 C 187,178 187,190 181,194 C 176,196 173,188 173,178 L 171,122 L 165,90 C 163,108 160,122 160,132 C 160,142 165,150 166,160 C 167,190 163,215 161,232 C 159,252 156,275 154,296 L 165,304 L 165,308 L 140,308 L 140,300 C 141,275 143,252 143,232 C 143,205 139,180 135,166 C 131,180 127,205 127,232 C 127,252 129,275 130,300 L 130,308 L 105,308 L 105,304 L 116,296 C 114,275 111,252 109,232 C 107,215 103,190 104,160 C 105,150 110,142 110,132 C 110,122 107,108 105,90 L 99,122 L 97,178 C 97,188 94,196 89,194 C 83,190 83,178 85,168 L 88,120 C 89,100 91,80 97,66 C 103,59 119,58 128,56 L 128,45'

/** The rider's measurements in mm. A value of 0 or less means not entered. */
export interface SketchValues {
  heightMm?: number
  inseamMm?: number
  shoulderMm?: number
  sternumMm?: number
  armMm?: number
  sitBoneMm?: number
}

type SketchKey = keyof SketchValues

/** One numbered measure: where its line, badge and ticks sit in the 300 x 320 viewBox. */
export interface SketchMeasure {
  key: SketchKey
  name: string
  note: string
  /** x1, y1, x2, y2. Dots sit at both ends. */
  line: [number, number, number, number]
  /** Centre of the numbered badge, on the line. */
  badge: [number, number]
  /** Ticks where the line leaves the figure. */
  ext?: [number, number, number, number][]
  /** Dashed reference drawn behind the line. */
  guide?: [number, number, number, number]
}

/** The six measures, in the order they are numbered. */
export const SKETCH_MEASURES: SketchMeasure[] = [
  {
    key: 'heightMm',
    name: 'Height',
    note: 'head top to floor',
    line: [230, 8, 230, 308],
    badge: [230, 158],
    ext: [[222, 8, 238, 8], [222, 308, 238, 308]],
  },
  {
    key: 'inseamMm',
    name: 'Inseam',
    note: 'crotch to floor',
    line: [60, 166, 60, 308],
    badge: [60, 237],
    ext: [[52, 308, 68, 308]],
    guide: [52, 166, 135, 166],
  },
  {
    key: 'shoulderMm',
    name: 'Shoulder width',
    note: 'acromion to acromion',
    line: [97, 54, 173, 54],
    badge: [135, 54],
    ext: [[97, 50, 97, 66], [173, 50, 173, 66]],
  },
  {
    key: 'sternumMm',
    name: 'Sternum height',
    note: 'jugular notch to floor',
    line: [135, 62, 135, 308],
    badge: [135, 120],
  },
  {
    key: 'armMm',
    name: 'Arm length',
    note: 'shoulder tip to wrist',
    line: [82, 66, 76, 184],
    badge: [79, 125],
    ext: [[96, 66, 81, 66], [91, 184, 75, 184]],
  },
  {
    key: 'sitBoneMm',
    name: 'Sit bones',
    note: 'measured seated',
    line: [117, 178, 153, 178],
    badge: [135, 178],
  },
]

export interface SketchRow {
  /** The badge number, 1 to 6. */
  n: number
  name: string
  note: string
  /** Formatted value. Undefined in the no-values view. */
  value?: string
  geometry: SketchMeasure
}

/**
 * The measures to draw and tabulate. A measure is present only when its value
 * is above zero. With `noValues`, all six are listed and none has a value: the
 * how-to-measure view.
 */
export function sketchRows(values: SketchValues, noValues = false): SketchRow[] {
  return SKETCH_MEASURES.flatMap((geometry, i) => {
    const mm = values[geometry.key]
    if (!noValues && !(mm !== undefined && mm > 0)) return []
    return [
      {
        n: i + 1,
        name: geometry.name,
        note: geometry.note,
        value: noValues ? undefined : formatCm(mm as number),
        geometry,
      },
    ]
  })
}

/** Accessible summary of the rows, for the figure's aria-label. */
export function sketchLabel(rows: SketchRow[], noValues: boolean): string {
  if (noValues) return 'How to measure: six numbered measures, listed in the table'
  if (rows.length === 0) return 'Your measurements: none entered'
  return `Your measurements: ${rows
    .map((r) => `${r.name.toLowerCase()} ${r.value}`)
    .join(', ')}`
}

function MeasureMark({ n, geometry: g }: { n: number; geometry: SketchMeasure }) {
  const [x1, y1, x2, y2] = g.line
  return (
    <g className="body-sketch-measure">
      {g.guide && (
        <line className="body-sketch-guide" x1={g.guide[0]} y1={g.guide[1]} x2={g.guide[2]} y2={g.guide[3]} />
      )}
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {g.ext?.map(([a, b, c, d]) => (
        <line key={`${a},${b}`} className="body-sketch-ext" x1={a} y1={b} x2={c} y2={d} />
      ))}
      <circle className="body-sketch-dot" cx={x1} cy={y1} r="2" />
      <circle className="body-sketch-dot" cx={x2} cy={y2} r="2" />
      <circle className="body-sketch-badge" cx={g.badge[0]} cy={g.badge[1]} r="10" />
      <text className="body-sketch-badge-text" x={g.badge[0]} y={g.badge[1]}>
        {n}
      </text>
    </g>
  )
}

/**
 * The rider's measurements on a body outline: numbered markers on the figure,
 * values in a table beside it (stacked under it on narrow screens). With
 * `noValues`, all six markers and the table names, but no numbers: the
 * how-to-measure view. Measures with no value are left out.
 */
export function BodySketch({
  noValues = false,
  ...values
}: SketchValues & { noValues?: boolean }) {
  const rows = sketchRows(values, noValues)
  return (
    <div className="body-sketch-set">
      <svg className="body-sketch" viewBox="0 0 300 320" role="img" aria-label={sketchLabel(rows, noValues)}>
        <g className="body-sketch-figure">
          <ellipse cx="135" cy="27" rx="15" ry="19" />
          <path d={OUTLINE} />
        </g>
        {rows.map((r) => (
          <MeasureMark key={r.name} n={r.n} geometry={r.geometry} />
        ))}
      </svg>
      <table className="body-sketch-table" aria-label="Measurements">
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="body-sketch-num">{r.n}</td>
              <th scope="row">
                {r.name}
                <span className="body-sketch-note">{r.note}</span>
              </th>
              {!noValues && <td className="body-sketch-value">{r.value}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
