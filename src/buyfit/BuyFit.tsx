import { useState, useEffect } from 'preact/hooks'
import { calculateSizing, checkManualFit } from './sizing'
import { matchBikes, getStackReachWindow, getFrameGeometryRange } from './matcher'

type TabType = 'results' | 'manual'

interface Measurements {
  inseam: number | null
  height: number | null
  shoulderWidth: number | null
}

/**
 * Inline SVG diagram for inseam measurement (theme-aware, inherits currentColor)
 */
function InseamDiagram() {
  return (
    <svg
      viewBox="0 0 120 240"
      className="buyfit-diagram"
      aria-label="Inseam measurement diagram"
    >
      <circle cx="60" cy="20" r="15" stroke="currentColor" fill="none" strokeWidth="2" />
      <line x1="60" y1="35" x2="60" y2="180" stroke="currentColor" strokeWidth="2" />
      <circle cx="60" cy="180" r="8" fill="currentColor" />
      <line x1="30" y1="180" x2="90" y2="180" stroke="currentColor" strokeWidth="1" />
      <text
        x="95"
        y="185"
        fontSize="10"
        fill="currentColor"
        dy=".3em"
      >
        crotch to floor
      </text>
    </svg>
  )
}

/**
 * Inline SVG diagram for height measurement
 */
function HeightDiagram() {
  return (
    <svg
      viewBox="0 0 120 240"
      className="buyfit-diagram"
      aria-label="Height measurement diagram"
    >
      <circle cx="60" cy="20" r="12" stroke="currentColor" fill="none" strokeWidth="2" />
      <line x1="60" y1="32" x2="60" y2="200" stroke="currentColor" strokeWidth="2" />
      <circle cx="60" cy="200" r="6" fill="currentColor" />
      <line x1="30" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="1" />
      <line x1="30" y1="200" x2="20" y2="200" stroke="currentColor" strokeWidth="1" />
      <line x1="25" y1="20" x2="25" y2="200" stroke="currentColor" strokeWidth="1" />
      <text
        x="10"
        y="110"
        fontSize="10"
        fill="currentColor"
        textAnchor="middle"
        transform="rotate(-90 10 110)"
        dy=".3em"
      >
        total height
      </text>
    </svg>
  )
}

/**
 * Inline SVG diagram for shoulder width measurement
 */
function ShoulderWidthDiagram() {
  return (
    <svg
      viewBox="0 0 200 120"
      className="buyfit-diagram-wide"
      aria-label="Shoulder width measurement diagram"
    >
      <circle cx="50" cy="60" r="8" stroke="currentColor" fill="none" strokeWidth="2" />
      <circle cx="150" cy="60" r="8" stroke="currentColor" fill="none" strokeWidth="2" />
      <line x1="50" y1="60" x2="150" y2="60" stroke="currentColor" strokeWidth="2" />
      <line x1="50" y1="70" x2="50" y2="80" stroke="currentColor" strokeWidth="1" />
      <line x1="150" y1="70" x2="150" y2="80" stroke="currentColor" strokeWidth="1" />
      <line x1="50" y1="75" x2="150" y2="75" stroke="currentColor" strokeWidth="1" />
      <text
        x="100"
        y="100"
        fontSize="10"
        fill="currentColor"
        textAnchor="middle"
        dy=".3em"
      >
        centre-to-centre
      </text>
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
}: {
  onSubmit: (measurements: Required<Measurements>) => void
}) {
  const [inseam, setInseam] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [shoulderWidth, setShoulderWidth] = useState<string>('')
  const [unit, setUnit] = useState<'mm' | 'cm'>('mm')

  useEffect(() => {
    const stored = localStorage.getItem('buyfit_measurements')
    if (stored) {
      try {
        const { inseam, height, shoulderWidth, unit } = JSON.parse(stored)
        setInseam(inseam)
        setHeight(height)
        setShoulderWidth(shoulderWidth)
        setUnit(unit)
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
        JSON.stringify({ inseam, height, shoulderWidth, unit })
      )
      onSubmit({ inseam: inseamMm, height: heightMm, shoulderWidth: shoulderWidthMm })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="buyfit-form">
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

/**
 * Results screen showing all outputs with badges
 */
function ResultsScreen({
  measurements,
  onBack,
}: {
  measurements: Required<Measurements>
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
                <Badge type="No source" />
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
                <Badge type="No source" />
                <p className="buyfit-note">
                  No bikes in the database cover your height. Use the manual check to evaluate any bike.
                </p>
              </div>
            )}

            {geometry ? (
              <div className="buyfit-output">
                <strong>Frame Geometry (Size, Seat Tube, ETT)</strong>
                <Badge type="No source" />
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
              <div className="buyfit-results">
                {matches.map((bike) => (
                  <div key={`${bike.brand}-${bike.model}-${bike.size}`} className="buyfit-result">
                    <strong>
                      {bike.brand} {bike.model}
                    </strong>{' '}
                    ({bike.year})
                    <br />
                    Size {bike.size}: Stack {bike.stack} mm, Reach {bike.reach} mm, ETT{' '}
                    {bike.ett} mm, Seat Tube {bike.seatTube} mm
                    <br />
                    <span className="buyfit-delta">
                      Δ Stack {bike.stackDelta > 0 ? '+' : ''}{Math.round(bike.stackDelta)} mm,
                      Δ Reach {bike.reachDelta > 0 ? '+' : ''}{Math.round(bike.reachDelta)} mm
                    </span>
                  </div>
                ))}
              </div>
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
export function BuyFit() {
  const [measurements, setMeasurements] = useState<Required<Measurements> | null>(null)

  if (measurements) {
    return <ResultsScreen measurements={measurements} onBack={() => setMeasurements(null)} />
  }

  return <InputForm onSubmit={setMeasurements} />
}
