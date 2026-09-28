import { useState, useEffect } from 'preact/hooks'
import {
  calculateSizing,
  inseamRatio,
} from './sizing'
import { readSavedMeasurements } from './storage'
import { StackReachPlot } from './StackReachPlot'
import { InfoPanel } from './InfoPanel'
import {
  matchBikes,
  getStackReachWindow,
  getFrameGeometryRange,
  splitByCharacter,
  ratioOf,
  headlineSizes,
  type Character,
  type BikeSize,
  type Bike,
} from './matcher'
import { loadGeometryData } from './geometryLoader'

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
 * Inseam as a share of height. Reported next to the outputs, deliberately
 * without acting on them: the window below comes from the maker charts, and
 * those charts key off height alone, which is the very thing this ratio says
 * they cannot do.
 */
function LegProportionFlag({ inseam, height }: { inseam: number; height: number }) {
  const ratio = inseamRatio(inseam, height)
  if (!ratio) return null

  const note = {
    long: `At the long-legged end of the usual 45–48% band. Expect more seatpost showing than the chart implies, and the size your height picks may feel long in the front end — worth comparing the shorter of two candidate sizes.`,
    short: `Below the usual 45–48% band, so proportionally more of your height is torso. Expect less seatpost, and the size your height picks may feel short and low — worth comparing the longer of two candidate sizes.`,
    typical: `Inside the usual 45–48% band, so the maker size charts — which key off height alone — are no further off for you than for anyone else.`,
  }[ratio.proportion]

  return (
    <div className="buyfit-output">
      <div className="buyfit-card-title">
        <strong>Inseam-to-height ratio</strong>
        <InfoPanel
          label="the inseam-to-height ratio"
          evidence="No source"
          anchor="45-inseam-does-not-determine-leg-segment-proportions"
        >
          {note} This changes none of the numbers above: no source gives a millimetre adjustment
          per point of ratio, so it is yours to weigh on a test ride.
        </InfoPanel>
      </div>
      <span className="buyfit-value">{ratio.percent.toFixed(1)}%</span>
    </div>
  )
}


/** One bike in the shortlist, with the stock parts where the maker states them. */
// The loader reads a missing measurement as 0, and no frame has a 0 mm tube,
// so 0 means "the maker did not say" and is left out rather than shown.
function measurementLine(bike: BikeSize) {
  const parts = [
    ['Stack', bike.stack],
    ['reach', bike.reach],
    ['top tube', bike.ett],
    ['seat tube', bike.seatTube],
  ] as const
  return parts
    .filter(([, mm]) => mm > 0)
    .map(([name, mm]) => `${name} ${mm} mm`)
    .join(', ')
}

function BikeRow({ bike }: { bike: BikeSize }) {
  return (
    <div className="buyfit-result">
      <strong>
        {bike.brand} {bike.model}
        {bike.year > 0 && <span className="buyfit-result-size"> {bike.year}</span>}
      </strong>
      <span className="buyfit-result-size">size {bike.size}</span>
      <span className="buyfit-delta">{measurementLine(bike)}</span>
      <span className="buyfit-delta">
        {bike.stackDelta > 0 ? '+' : ''}{Math.round(bike.stackDelta)} mm stack,{' '}
        {bike.reachDelta > 0 ? '+' : ''}{Math.round(bike.reachDelta)} mm reach from the middle of
        your window · ratio {ratioOf(bike).toFixed(2)}
      </span>
      {(bike.barWidth || bike.crankLength) && (
        <>
          <span className="buyfit-spec">
            Ships with
            {bike.barWidth && (
              <>
                {' '}
                {bike.barWidth} mm bars
              </>
            )}
            {bike.barWidth && bike.crankLength && ','}
            {bike.crankLength && <> {bike.crankLength} mm cranks</>}
          </span>
        </>
      )}
    </div>
  )
}


/**
 * Main BuyFit component — single unified page with live updating
 */
export function BuyFit({ onHome }: { onHome: () => void }) {
  const [inseam, setInseam] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [shoulderWidth, setShoulderWidth] = useState<string>('')
  const [preference, setPreference] = useState<Preference>('none')
  const [bikes, setBikes] = useState<Bike[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMeasuringGuide, setShowMeasuringGuide] = useState(false)
  const [selectedBrands, setSelectedBrands] = useState<Set<string> | null>(null)

  // Load bikes on mount
  useEffect(() => {
    loadGeometryData()
      .then((result) => {
        setBikes(result.bikes)
        setLoading(false)
      })
      .catch(() => {
        const apiUrl = import.meta.env.VITE_BIKEDB_URL || 'http://localhost:8080'
        setError(`No connection to the bike database at ${apiUrl}. The app needs the API to load geometry data. Start the server and reload.`)
        setLoading(false)
      })
  }, [])

  // Load saved measurements on mount
  useEffect(() => {
    const saved = readSavedMeasurements(localStorage.getItem('buyfit_measurements'))
    if (saved) {
      setInseam(saved.inseam)
      setHeight(saved.height)
      setShoulderWidth(saved.shoulderWidth)
      if (saved.preference) setPreference(saved.preference as Preference)
      // Don't show measuring guide if we have saved data
      setShowMeasuringGuide(false)
    } else {
      // First visit: show guide by default
      setShowMeasuringGuide(true)
    }
  }, [])

  // Parse inputs to mm
  const multiplier = 10 // inputs are cm, every calculation is mm
  const inseamNum = parseFloat(inseam)
  const heightNum = parseFloat(height)
  const shoulderWidthNum = parseFloat(shoulderWidth)
  const inseamMm = inseamNum ? Math.round(inseamNum * multiplier) : 0
  const heightMm = heightNum ? Math.round(heightNum * multiplier) : 0
  const shoulderWidthMm = shoulderWidthNum ? Math.round(shoulderWidthNum * multiplier) : 0
  const allValid = inseamMm > 0 && heightMm > 0 && shoulderWidthMm > 0

  // Save to localStorage whenever valid measurements change
  useEffect(() => {
    if (allValid) {
      localStorage.setItem(
        'buyfit_measurements',
        JSON.stringify({ inseam, height, shoulderWidth, preference })
      )
    }
  }, [inseam, height, shoulderWidth, preference, allValid])

  // Calculate outputs only if all inputs are valid
  const sizing = allValid ? calculateSizing(inseamMm, heightMm, shoulderWidthMm, preference) : null
  const fitWindow = allValid && bikes ? getStackReachWindow(heightMm, bikes) : null
  const geometry = allValid && bikes ? getFrameGeometryRange(heightMm, bikes) : null
  const matches = allValid && fitWindow && bikes
    ? matchBikes(heightMm, fitWindow.stackMin, fitWindow.stackMax, fitWindow.reachMin, fitWindow.reachMax, bikes)
    : []
  const headline = allValid && bikes ? headlineSizes(heightMm, bikes) : []

  // Initialize brand filter when matches change
  useEffect(() => {
    if (selectedBrands === null && matches.length > 0) {
      const brands = new Set(matches.map((b) => b.brand))
      setSelectedBrands(brands)
    }
  }, [matches, selectedBrands])

  // Filter matches by selected brands
  const filteredMatches = selectedBrands
    ? matches.filter((b) => selectedBrands.has(b.brand))
    : matches
  const filteredSplit = allValid ? splitByCharacter(filteredMatches) : { racy: [], relaxed: [], median: null }

  const groups: { key: Character; title: string; rows: typeof filteredMatches }[] = [
    { key: 'racy', title: 'Racier half of your matches', rows: filteredSplit.racy },
    { key: 'relaxed', title: 'More upright half', rows: filteredSplit.relaxed },
  ]
  if (preference === 'relaxed') groups.reverse()

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading bikes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={onHome} className="buyfit-back">
          ← Home
        </button>
        <h1>BuyFit</h1>
        <div style={{ color: 'var(--ink-muted)', marginBottom: '1rem' }}>
          {error}
        </div>
      </div>
    )
  }

  if (!bikes || bikes.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={onHome} className="buyfit-back">
          ← Home
        </button>
        <h1>BuyFit</h1>
        <div style={{ color: 'var(--ink-muted)' }}>
          No bikes found.
        </div>
      </div>
    )
  }

  return (
    <div className="buyfit-page">
      <button onClick={onHome} className="buyfit-back">
        ← Home
      </button>
      <h1>BuyFit</h1>
      <p className="buyfit-help">
        Three measurements, and what the evidence actually supports about turning them into a
        frame. Tap ⓘ on any number to see how well it is sourced.
      </p>

      {/* Inputs section */}
      <div className="buyfit-inputs">
        <div className="buyfit-input-row">
          <label className="buyfit-field">
            <strong>Inseam</strong>
            <span className="buyfit-input-unit">
              <input
                type="number"
                step="0.1"
                value={inseam}
                onInput={(e) => setInseam((e.target as HTMLInputElement).value)}
                placeholder="e.g., 84"
                className="buyfit-input"
              />
              <span aria-hidden="true">cm</span>
            </span>
            <p className="buyfit-help">
              Barefoot, crotch-to-floor against a wall. A 1 cm error moves saddle height about 9 mm.
            </p>
          </label>

          <label className="buyfit-field">
            <strong>Height</strong>
            <span className="buyfit-input-unit">
              <input
                type="number"
                step="0.1"
                value={height}
                onInput={(e) => setHeight((e.target as HTMLInputElement).value)}
                placeholder="e.g., 178"
                className="buyfit-input"
              />
              <span aria-hidden="true">cm</span>
            </span>
            <p className="buyfit-help">
              Total height barefoot. Used to find bikes in your height band.
            </p>
          </label>

          <label className="buyfit-field">
            <strong>Shoulder Width</strong>
            <span className="buyfit-input-unit">
              <input
                type="number"
                step="0.1"
                value={shoulderWidth}
                onInput={(e) => setShoulderWidth((e.target as HTMLInputElement).value)}
                placeholder="e.g., 41"
                className="buyfit-input"
              />
              <span aria-hidden="true">cm</span>
            </span>
            <p className="buyfit-help">
              Biacromial width, centre-to-centre (acromion to acromion). The UCI regulates three
              different handlebar width definitions; this one is used here.
            </p>
          </label>
        </div>

        <div className="buyfit-input-controls">
          <label className="buyfit-field buyfit-field--plain">
            <strong>Riding position you want</strong>
            <select
              value={preference}
              onChange={(e) => setPreference((e.target as HTMLSelectElement).value as Preference)}
              className="buyfit-select"
            >
              <option value="none">No preference</option>
              <option value="racy">Racier, lower front end</option>
              <option value="relaxed">More upright</option>
            </select>
          </label>
        </div>

        <details
          className="buyfit-details"
          open={showMeasuringGuide}
          onToggle={(e) => setShowMeasuringGuide((e.target as HTMLDetailsElement).open)}
        >
          <summary>How to measure</summary>
          <div className="buyfit-guide-content">
            <div className="buyfit-diagram-row">
              <div className="buyfit-diagram-item">
                <div className="buyfit-diagram-container">
                  <InseamDiagram />
                </div>
                <p className="buyfit-diagram-caption">Inseam</p>
              </div>
              <div className="buyfit-diagram-item">
                <div className="buyfit-diagram-container">
                  <HeightDiagram />
                </div>
                <p className="buyfit-diagram-caption">Height</p>
              </div>
              <div className="buyfit-diagram-item">
                <div className="buyfit-diagram-container">
                  <ShoulderWidthDiagram />
                </div>
                <p className="buyfit-diagram-caption">Shoulder Width</p>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Show only "Enter measurements" message if not all valid */}
      {!allValid && (
        <div className="buyfit-prompt">
          <p>Enter all three measurements</p>
        </div>
      )}

      {/* Show all analysis and bikes only if all inputs are valid */}
      {allValid && sizing && (
        <>
          {/* Analysis cards section */}
          <div className="buyfit-analysis">
            <LegProportionFlag inseam={inseamMm} height={heightMm} />
            <div className="buyfit-output">
              <div className="buyfit-card-title">
                <strong>Saddle height</strong>
                <InfoPanel label="saddle height" evidence="Sourced" anchor="21-saddle-height--the-one-that-works-and-how-well">
                  BB centre to saddle top. A starting point; expect to adjust by up to 20 mm.
                </InfoPanel>
              </div>
              <span className="buyfit-value">
                {sizing.saddleHeightMin}–{sizing.saddleHeightMax} mm
              </span>
            </div>

            <div className="buyfit-output">
              <div className="buyfit-card-title">
                <strong>Handlebar width</strong>
                <InfoPanel label="handlebar width" evidence="Weak" anchor="31-handlebar-width-from-shoulder-width">
                  Measured centre to centre.
                </InfoPanel>
              </div>
              <span className="buyfit-value">
                {sizing.handlebarWidthMin}–{sizing.handlebarWidthMax} mm
              </span>
            </div>

            <div className="buyfit-output">
              <div className="buyfit-card-title">
                <strong>Crank length</strong>
                <InfoPanel label="crank length" evidence="Weak" anchor="32-crank-length-from-inseam-or-height">
                  {sizing.crankNote}
                </InfoPanel>
              </div>
              <span className="buyfit-value">{sizing.crankLength}</span>
            </div>

          </div>

          {/* Bikes section */}
          <div className="buyfit-bikes-section">
            {headline.length > 0 && (
              <div className="buyfit-headline">
                <div className="buyfit-card-title">
                  <h2>Your size is roughly {headline.join(' or ')}</h2>
                  <InfoPanel
                    label="your size"
                    evidence="No source"
                    anchor="42-brand-to-brand-size-labels-are-not-comparable-and-this-is-measurable"
                  >
                    The most common size label among bikes whose maker lists your height. A label is not a
                    measurement: two bikes both marked 54 can differ by 50 mm of stack, so treat this as a
                    starting point for the shortlist below, not an answer.
                  </InfoPanel>
                </div>
              </div>
            )}

            {/* Brand filter */}
            {selectedBrands && matches.length > 0 && (
              <div className="buyfit-brand-filter">
                {Array.from(new Set(matches.map((b) => b.brand))).map((brand) => (
                  <button
                    key={brand}
                    className="buyfit-brand-chip"
                    aria-pressed={selectedBrands.has(brand)}
                    onClick={() => {
                      const newBrands = new Set(selectedBrands)
                      if (newBrands.has(brand)) {
                        newBrands.delete(brand)
                      } else {
                        newBrands.add(brand)
                      }
                      setSelectedBrands(newBrands)
                    }}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}

            {/* Chart and window info */}
            {fitWindow && matches.length > 0 && selectedBrands && selectedBrands.size > 0 && (
              <>
                <StackReachPlot bikes={filteredMatches} fitWindow={fitWindow} median={filteredSplit.median} />
                <div className="plot-legend">
                  <b className="is-racy">racier half</b>
                  <b className="is-upright">more upright half</b>
                  <span>window: stack {fitWindow.stackMin}–{fitWindow.stackMax},
                    reach {fitWindow.reachMin}–{fitWindow.reachMax} mm</span>
                </div>
              </>
            )}

            {/* Stack/reach and frame geometry cards */}
            <div className="buyfit-window-cards">
              {fitWindow ? (
                <div className="buyfit-output">
                  <div className="buyfit-card-title">
                    <strong>Stack and reach</strong>
                    <InfoPanel label="stack and reach" evidence="No source" anchor="22-stack--usable-only-as-a-search-window">
                      A search window taken from what bikes in your height band ship with — not from your
                      body. Frame reach cannot be predicted from body measurements.
                    </InfoPanel>
                  </div>
                  <span className="buyfit-value">
                    {fitWindow.stackMin}–{fitWindow.stackMax} / {fitWindow.reachMin}–{fitWindow.reachMax} mm
                  </span>
                </div>
              ) : (
                <div className="buyfit-output buyfit-no-window">
                  <div className="buyfit-card-title">
                    <strong>Stack/Reach Window</strong>
                    <InfoPanel label="the stack and reach window" evidence="No source" anchor="22-stack--usable-only-as-a-search-window">
                      A search window taken from what bikes in your height band ship with — not from your body.
                    </InfoPanel>
                  </div>
                  <p className="buyfit-note">No bikes in the database cover your height.</p>
                </div>
              )}

              {geometry ? (
                <div className="buyfit-output">
                  <div className="buyfit-card-title">
                    <strong>Frame geometry</strong>
                    <InfoPanel
                      label="frame geometry"
                      evidence="No source"
                      anchor="42-brand-to-brand-size-labels-are-not-comparable-and-this-is-measurable"
                    >
                      Taken from the bikes in your height band, not from your body, and size labels do not
                      carry between brands.
                    </InfoPanel>
                  </div>
                  <span className="buyfit-value">{geometry.sizes.join(' · ')}</span>
                  <p className="buyfit-note">
                    Seat tube {geometry.seatTubeMin}–{geometry.seatTubeMax} mm, effective top tube{' '}
                    {geometry.ettMin}–{geometry.ettMax} mm.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Bike list */}
            {filteredMatches.length > 0 && selectedBrands && selectedBrands.size > 0 && (
              <div>
                <h3 className="buyfit-group-title">Bikes that fit your window</h3>
                <p className="buyfit-note">
                  Every bike listed fits your window; the groups are about what you want, not what
                  fits. They are split at the median stack-to-reach ratio of your own matches, so
                  "racier" means racier than half of what fits you — not a category the bike carries
                  around. A fixed threshold would call every small frame racy, because the ratio
                  rises with frame size.
                </p>

                {filteredSplit.median === null && (
                  <div className="buyfit-results">
                    {filteredMatches.map((bike) => (
                      <BikeRow
                        key={`${bike.brand}-${bike.model}-${bike.size}`}
                        bike={bike}
                      />
                    ))}
                  </div>
                )}

                {filteredSplit.median !== null &&
                  groups.map((group) => (
                  <div key={group.key}>
                    <h4 className="buyfit-group-title">
                      {group.title}
                      {preference === group.key && ' — what you asked for'}
                    </h4>
                    <div className="buyfit-results">
                      {group.rows.map((bike) => (
                        <BikeRow
                        key={`${bike.brand}-${bike.model}-${bike.size}`}
                        bike={bike}
                      />
                        ))}
                    </div>
                  </div>
                  ))}
              </div>
            )}

            {selectedBrands && selectedBrands.size === 0 && (
              <p className="buyfit-note">No brands selected</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
