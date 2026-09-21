import { useState, useEffect } from 'preact/hooks'
import { calculateSizing, checkManualFit } from './sizing'
import {
  matchBikes,
  getStackReachWindow,
  getFrameGeometryRange,
  splitByCharacter,
  ratioOf,
  headlineSizes,
  type Character,
  type BikeSize,
} from './matcher'

type TabType = 'results' | 'manual'

interface Measurements {
  inseam: number | null
  height: number | null
  shoulderWidth: number | null
}

/** What the rider wants, as opposed to what their body implies. */
type Preference = Character | 'none'

/**
 * Measuring diagrams. Line art, no text: the labels clipped at the viewBox
 * edge, and the field help text says the same thing anyway. Everything
 * inherits currentColor so both themes work.
 */
function Figure({ book = false }: { book?: boolean }) {
  return (
    <>
      <line x1="16" y1="8" x2="16" y2="150" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="150" x2="92" y2="150" stroke="currentColor" strokeWidth="2" />
      <circle cx="56" cy="30" r="9" stroke="currentColor" fill="none" strokeWidth="2" />
      <line x1="56" y1="39" x2="56" y2="95" stroke="currentColor" strokeWidth="2" />
      <line x1="56" y1="52" x2="38" y2="78" stroke="currentColor" strokeWidth="2" />
      <line x1="56" y1="52" x2="74" y2="78" stroke="currentColor" strokeWidth="2" />
      <line x1="56" y1="95" x2="46" y2="150" stroke="currentColor" strokeWidth="2" />
      <line x1="56" y1="95" x2="66" y2="150" stroke="currentColor" strokeWidth="2" />
      {book && <rect x="30" y="92" width="52" height="6" fill="currentColor" />}
    </>
  )
}

/** Vertical dimension arrow with end ticks, drawn at x. */
function VerticalMeasure({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return (
    <>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke="currentColor" strokeWidth="1.5" />
      <polyline
        points={`${x - 4},${y1 + 6} ${x},${y1} ${x + 4},${y1 + 6}`}
        stroke="currentColor"
        fill="none"
        strokeWidth="1.5"
      />
      <polyline
        points={`${x - 4},${y2 - 6} ${x},${y2} ${x + 4},${y2 - 6}`}
        stroke="currentColor"
        fill="none"
        strokeWidth="1.5"
      />
    </>
  )
}

function InseamDiagram() {
  return (
    <svg viewBox="0 0 100 160" className="buyfit-diagram" aria-label="Inseam: crotch to floor">
      <Figure book />
      <VerticalMeasure x={26} y1={95} y2={150} />
    </svg>
  )
}

function HeightDiagram() {
  return (
    <svg viewBox="0 0 100 160" className="buyfit-diagram" aria-label="Height: head to floor">
      <Figure />
      <VerticalMeasure x={26} y1={21} y2={150} />
    </svg>
  )
}

function ShoulderWidthDiagram() {
  return (
    <svg
      viewBox="0 0 160 100"
      className="buyfit-diagram-wide"
      aria-label="Shoulder width: acromion to acromion"
    >
      <circle cx="80" cy="26" r="11" stroke="currentColor" fill="none" strokeWidth="2" />
      <line x1="48" y1="50" x2="112" y2="50" stroke="currentColor" strokeWidth="2" />
      <line x1="48" y1="50" x2="42" y2="82" stroke="currentColor" strokeWidth="2" />
      <line x1="112" y1="50" x2="118" y2="82" stroke="currentColor" strokeWidth="2" />
      <circle cx="48" cy="50" r="4" fill="currentColor" />
      <circle cx="112" cy="50" r="4" fill="currentColor" />
      <line x1="48" y1="56" x2="48" y2="72" stroke="currentColor" strokeWidth="1" />
      <line x1="112" y1="56" x2="112" y2="72" stroke="currentColor" strokeWidth="1" />
      <line x1="48" y1="68" x2="112" y2="68" stroke="currentColor" strokeWidth="1.5" />
      <polyline points="54,64 48,68 54,72" stroke="currentColor" fill="none" strokeWidth="1.5" />
      <polyline points="106,64 112,68 106,72" stroke="currentColor" fill="none" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * Badge component with link to research doc on GitHub
 */
function Badge({ type, anchor }: { type: 'Sourced' | 'Weak' | 'No source'; anchor?: string }) {
  const href = anchor
    ? `https://github.com/fox27374/velofit/blob/main/doc/frame-sizing-research.md#${anchor}`
    : '#'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`badge badge-${type.toLowerCase().replace(' ', '-')}`}
      title={`${type}${anchor ? ' — see research doc' : ''}`}
    >
      {type}
    </a>
  )
}

/**
 * Input form for measurements
 */
function InputForm({
  onSubmit,
  onHome,
}: {
  onSubmit: (measurements: Required<Measurements>, preference: Preference) => void
  onHome: () => void
}) {
  const [inseam, setInseam] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [shoulderWidth, setShoulderWidth] = useState<string>('')
  const [unit, setUnit] = useState<'mm' | 'cm'>('mm')
  const [preference, setPreference] = useState<Preference>('none')

  useEffect(() => {
    const stored = localStorage.getItem('buyfit_measurements')
    if (stored) {
      try {
        const { inseam, height, shoulderWidth, unit, preference } = JSON.parse(stored)
        setInseam(inseam)
        setHeight(height)
        setShoulderWidth(shoulderWidth)
        setUnit(unit)
        if (preference) setPreference(preference)
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    const multiplier = unit === 'cm' ? 10 : 1
    const inseamNum = parseFloat(inseam)
    const heightNum = parseFloat(height)
    const shoulderWidthNum = parseFloat(shoulderWidth)

    if (!inseamNum || !heightNum || !shoulderWidthNum) return

    const inseamMm = Math.round(inseamNum * multiplier)
    const heightMm = Math.round(heightNum * multiplier)
    const shoulderWidthMm = Math.round(shoulderWidthNum * multiplier)

    if (inseamMm > 0 && heightMm > 0 && shoulderWidthMm > 0) {
      localStorage.setItem(
        'buyfit_measurements',
        JSON.stringify({ inseam, height, shoulderWidth, unit, preference })
      )
      onSubmit(
        { inseam: inseamMm, height: heightMm, shoulderWidth: shoulderWidthMm },
        preference
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="buyfit-form">
      <button type="button" onClick={onHome} className="buyfit-back">
        &larr; Home
      </button>
      <h1>BuyFit</h1>
      <p className="buyfit-help">
        Three measurements, and what the evidence actually supports about turning them into a
        frame. Every line says how well it is sourced.
      </p>

      <div className="buyfit-field">
        <div className="buyfit-diagram-container">
          <InseamDiagram />
        </div>
        <label>
          <strong>Inseam</strong>
          <p className="buyfit-help">
            Barefoot, crotch-to-floor against a wall. A 10 mm error moves saddle height about 9 mm.
          </p>
          <input
            type="number"
            step="1"
            value={inseam}
            onInput={(e) => setInseam((e.target as HTMLInputElement).value)}
            placeholder="e.g., 750"
            required
            className="buyfit-input"
          />
        </label>
      </div>

      <div className="buyfit-field">
        <div className="buyfit-diagram-container">
          <HeightDiagram />
        </div>
        <label>
          <strong>Height</strong>
          <p className="buyfit-help">
            Total height barefoot. Used to find bikes in your height band.
          </p>
          <input
            type="number"
            step="1"
            value={height}
            onInput={(e) => setHeight((e.target as HTMLInputElement).value)}
            placeholder="e.g., 1750"
            required
            className="buyfit-input"
          />
        </label>
      </div>

      <div className="buyfit-field">
        <div className="buyfit-diagram-container">
          <ShoulderWidthDiagram />
        </div>
        <label>
          <strong>Shoulder Width</strong>
          <p className="buyfit-help">
            Biacromial width, centre-to-centre (acromion to acromion). The UCI regulates three
            different handlebar width definitions; this one is used here.
          </p>
          <input
            type="number"
            step="1"
            value={shoulderWidth}
            onInput={(e) => setShoulderWidth((e.target as HTMLInputElement).value)}
            placeholder="e.g., 410"
            required
            className="buyfit-input"
          />
        </label>
      </div>

      <div className="buyfit-field">
        <label>
          <strong>Riding position you want</strong>
          <p className="buyfit-help">
            A preference, not a measurement — it sorts the shortlist, it does not change your
            numbers. Racier bikes sit lower and longer; upright ones put the bars higher.
          </p>
          <select
            value={preference}
            onChange={(e) =>
              setPreference((e.target as HTMLSelectElement).value as Preference)
            }
            className="buyfit-select"
          >
            <option value="none">No preference</option>
            <option value="racy">Racier, lower front end</option>
            <option value="relaxed">More upright</option>
          </select>
        </label>
      </div>

      <div className="buyfit-field">
        <label>
          <strong>Unit</strong>
          <select
            value={unit}
            onChange={(e) => setUnit((e.target as HTMLSelectElement).value as 'mm' | 'cm')}
            className="buyfit-select"
          >
            <option value="mm">mm</option>
            <option value="cm">cm</option>
          </select>
        </label>
      </div>

      <button type="submit" className="buyfit-button-primary">
        Calculate
      </button>
    </form>
  )
}

/** One bike in the shortlist. */
function BikeRow({ bike }: { bike: BikeSize }) {
  return (
    <div className="buyfit-result">
      <strong>
        {bike.brand} {bike.model}
      </strong>{' '}
      ({bike.year})
      <br />
      Size {bike.size}: Stack {bike.stack} mm, Reach {bike.reach} mm, ETT {bike.ett} mm, Seat
      Tube {bike.seatTube} mm
      <br />
      <span className="buyfit-delta">
        Δ Stack {bike.stackDelta > 0 ? '+' : ''}{Math.round(bike.stackDelta)} mm, Δ Reach{' '}
        {bike.reachDelta > 0 ? '+' : ''}{Math.round(bike.reachDelta)} mm, ratio{' '}
        {ratioOf(bike).toFixed(2)}
      </span>
    </div>
  )
}

/**
 * Results screen showing all outputs with badges
 */
function ResultsScreen({
  measurements,
  preference,
  onBack,
}: {
  measurements: Required<Measurements>
  preference: Preference
  onBack: () => void
}) {
  const [tab, setTab] = useState<TabType>('results')
  const inseam = measurements.inseam ?? 0
  const height = measurements.height ?? 0
  const shoulderWidth = measurements.shoulderWidth ?? 0
  const sizing = calculateSizing(inseam, height, shoulderWidth)

  // Get window from database, not from body measurements
  const fitWindow = getStackReachWindow(height)
  const geometry = getFrameGeometryRange(height)

  const matches = fitWindow
    ? matchBikes(
        height,
        fitWindow.stackMin,
        fitWindow.stackMax,
        fitWindow.reachMin,
        fitWindow.reachMax
      )
    : []

  const headline = headlineSizes(height)
  const split = splitByCharacter(matches)
  const groups: { key: Character; title: string; rows: typeof matches }[] = [
    { key: 'racy', title: 'Racier half of your matches', rows: split.racy },
    { key: 'relaxed', title: 'More upright half', rows: split.relaxed },
  ]
  // Preferred group first. Two groups, so this is a flip, not a sort.
  if (preference === 'relaxed') groups.reverse()

  return (
    <div>
      <div className="buyfit-tabs">
        <button
          onClick={() => setTab('results')}
          className={`buyfit-tab ${tab === 'results' ? 'active' : ''}`}
        >
          Matching Bikes
        </button>
        <button
          onClick={() => setTab('manual')}
          className={`buyfit-tab ${tab === 'manual' ? 'active' : ''}`}
        >
          Manual Check
        </button>
      </div>

      {tab === 'results' && (
        <div>
          <div className="buyfit-outputs">
            {headline.length > 0 && (
              <div className="buyfit-output buyfit-headline">
                <strong>Your size is roughly {headline.join(' or ')}</strong>
                <Badge
                  type="No source"
                  anchor="42-brand-to-brand-size-labels-are-not-comparable-and-this-is-measurable"
                />
                <p className="buyfit-note">
                  The most common size label among bikes whose maker lists your height. A label is
                  not a measurement: two bikes both marked 54 can differ by 50 mm of stack, so treat
                  this as a starting point for the shortlist below, not an answer.
                </p>
              </div>
            )}

            <div className="buyfit-output">
              <strong>Saddle Height</strong>
              <Badge type="Sourced" anchor="21-saddle-height--the-one-that-works-and-how-well" />
              <p>
                {sizing.saddleHeightMin}–{sizing.saddleHeightMax} mm BB centre to saddle top.
                Starting point; expect to adjust by up to 20 mm.
              </p>
            </div>

            <div className="buyfit-output">
              <strong>Handlebar Width</strong>
              <Badge type="Weak" anchor="31-handlebar-width-from-shoulder-width" />
              <p>
                {sizing.handlebarWidthMin}–{sizing.handlebarWidthMax} mm centre-to-centre.
              </p>
            </div>

            <div className="buyfit-output">
              <strong>Crank Length</strong>
              <Badge type="Weak" anchor="32-crank-length-from-inseam-or-height" />
              <p>{sizing.crankLength}; shorter if you have limited hip flexion.</p>
            </div>

            {fitWindow ? (
              <div className="buyfit-output">
                <strong>Stack/Reach Search Window</strong>
                <Badge type="No source" anchor="22-stack--usable-only-as-a-search-window" />
                <p className="buyfit-note">
                  Basis: what bikes in your height band ship with, not your body.
                </p>
                <p>
                  Stack {fitWindow.stackMin}–{fitWindow.stackMax} mm, Reach{' '}
                  {fitWindow.reachMin}–{fitWindow.reachMax} mm.
                </p>
              </div>
            ) : (
              <div className="buyfit-output buyfit-no-window">
                <strong>Stack/Reach Window</strong>
                <Badge type="No source" anchor="22-stack--usable-only-as-a-search-window" />
                <p className="buyfit-note">
                  No bikes in the database cover your height. Use the manual check to evaluate any bike.
                </p>
              </div>
            )}

            {geometry ? (
              <div className="buyfit-output">
                <strong>Frame Geometry (Size, Seat Tube, ETT)</strong>
                <Badge type="No source" anchor="42-brand-to-brand-size-labels-are-not-comparable-and-this-is-measurable" />
                <p className="buyfit-note">
                  Basis: what bikes in your height band ship with, not your body. Wide windows.
                  Frame size labels are not comparable across brands.
                </p>
                <p>
                  Size labels: {geometry.sizes.join(', ')}
                  <br />
                  Seat Tube: {geometry.seatTubeMin}–{geometry.seatTubeMax} mm
                  <br />
                  Effective Top Tube: {geometry.ettMin}–{geometry.ettMax} mm
                </p>
              </div>
            ) : null}
          </div>

          {matches.length > 0 && (
            <div>
              <h3>Bikes in Your Height Band</h3>
              <p className="buyfit-note">
                Every bike listed fits your window; the groups are about what you want, not what
                fits. They are split at the median stack-to-reach ratio of your own matches, so
                "racier" means racier than half of what fits you — not a category the bike carries
                around. A fixed threshold would call every small frame racy, because the ratio
                rises with frame size.
              </p>

              {split.median === null && (
                <div className="buyfit-results">
                  {matches.map((bike) => (
                    <BikeRow key={`${bike.brand}-${bike.model}-${bike.size}`} bike={bike} />
                  ))}
                </div>
              )}

              {split.median !== null &&
                groups.map((group) => (
                <div key={group.key}>
                  <h4>
                    {group.title}
                    {preference === group.key && ' — your preference'}
                  </h4>
                  <div className="buyfit-results">
                    {group.rows.map((bike) => (
                      <BikeRow key={`${bike.brand}-${bike.model}-${bike.size}`} bike={bike} />
                    ))}
                  </div>
                </div>
                ))}
            </div>
          )}
        </div>
      )}

      {tab === 'manual' && (
        <ManualCheckTab fitWindow={fitWindow} />
      )}

      <button onClick={onBack} className="buyfit-button-back">
        ← Back
      </button>
    </div>
  )
}

/**
 * Manual stack/reach check tab
 */
function ManualCheckTab({
  fitWindow,
}: {
  fitWindow: ReturnType<typeof getStackReachWindow>
}) {
  const [stack, setStack] = useState<string>('')
  const [reach, setReach] = useState<string>('')
  const [result, setResult] = useState<ReturnType<typeof checkManualFit> | null>(null)
  const [typed, setTyped] = useState<{ stack: number; reach: number } | null>(null)

  const handleCheck = (e: Event) => {
    e.preventDefault()
    const stackNum = parseFloat(stack)
    const reachNum = parseFloat(reach)

    if (!stackNum || !reachNum) return

    setTyped({ stack: stackNum, reach: reachNum })

    // No window means no target to compare against. Say so rather than
    // inventing one: a made-up target produces a confident wrong verdict.
    if (!fitWindow) {
      setResult(null)
      return
    }

    const targetStack = (fitWindow.stackMin + fitWindow.stackMax) / 2
    const targetReach = (fitWindow.reachMin + fitWindow.reachMax) / 2
    setResult(checkManualFit(stackNum, reachNum, targetStack, targetReach, 30))
  }

  const verdictClass: Record<string, string> = {
    fits: 'buyfit-verdict-fits',
    too_tall: 'buyfit-verdict-bad',
    too_low: 'buyfit-verdict-bad',
    too_long: 'buyfit-verdict-bad',
    too_short: 'buyfit-verdict-bad',
  }

  const verdictText: Record<string, string> = {
    fits: '✓ Fits',
    too_tall: '✕ Too Tall',
    too_low: '✕ Too Low',
    too_long: '✕ Too Long',
    too_short: '✕ Too Short',
  }

  return (
    <form onSubmit={handleCheck} className="buyfit-form">
      <p className="buyfit-help">
        Type any bike's stack and reach from the maker's chart to see if it fits. Works for bikes not
        in the database.
      </p>

      <label className="buyfit-field">
        <strong>Stack (mm)</strong>
        <input
          type="number"
          value={stack}
          onInput={(e) => setStack((e.target as HTMLInputElement).value)}
          placeholder="e.g., 555"
          required
          className="buyfit-input"
        />
      </label>

      <label className="buyfit-field">
        <strong>Reach (mm)</strong>
        <input
          type="number"
          value={reach}
          onInput={(e) => setReach((e.target as HTMLInputElement).value)}
          placeholder="e.g., 400"
          required
          className="buyfit-input"
        />
      </label>

      <button type="submit" className="buyfit-button-primary">
        Check
      </button>

      {result && (
        <div className={`buyfit-verdict ${verdictClass[result.verdict]}`}>
          <strong>{verdictText[result.verdict]}</strong>
          <p>
            Stack Δ {result.stackDelta > 0 ? '+' : ''}{Math.round(result.stackDelta)} mm
            <br />
            Reach Δ {result.reachDelta > 0 ? '+' : ''}{Math.round(result.reachDelta)} mm
          </p>
        </div>
      )}

      {!result && typed && (
        <div className="buyfit-verdict buyfit-no-window">
          <strong>No verdict possible</strong>
          <p>
            You typed stack {typed.stack} mm, reach {typed.reach} mm. No bike in the database
            covers your height, so there is no window to compare against — and a made-up target
            would give you a confident wrong answer. Add bikes to the database, or compare these
            numbers against a bike you already know fits you.
          </p>
        </div>
      )}
    </form>
  )
}

/**
 * Main BuyFit component
 */
export function BuyFit({ onHome }: { onHome: () => void }) {
  const [measurements, setMeasurements] = useState<Required<Measurements> | null>(null)
  const [preference, setPreference] = useState<Preference>('none')

  if (measurements) {
    return (
      <ResultsScreen
        measurements={measurements}
        preference={preference}
        onBack={() => setMeasurements(null)}
      />
    )
  }

  return (
    <InputForm
      onSubmit={(m, p) => {
        setPreference(p)
        setMeasurements(m)
      }}
      onHome={onHome}
    />
  )
}
