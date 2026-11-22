import { useState, useEffect } from 'preact/hooks'
import {
  bodyProportions,
  calculateSizing,
  inseamRatio,
  saddleWidth,
  type BodyProportion,
  type Discipline,
  type Sex,
} from './sizing'
import { readSavedMeasurements } from './storage'
import {
  checkMeasurements,
  checkOptionalMeasurements,
  type MeasurementField,
  type OptionalField,
} from './plausibility'
import { StackReachPlot, legHint } from './StackReachPlot'
import { InfoPanel } from './InfoPanel'
import { ResultsHeader } from './ResultsHeader'
import { BodySketch, formatCm } from './BodySketch'
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
import { loadGeometryData, type GeometryCategory } from './geometryLoader'
import { normalizeDecimalInput } from './decimalInput'
import { displayLabels } from './displayName'

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

function BikeRow({ bike, name }: { bike: BikeSize; name: string }) {
  return (
    <div className="buyfit-result">
      <strong>
        {name}
      </strong>
      <span className="buyfit-result-size">size {bike.size}</span>
      <span className="buyfit-delta">{measurementLine(bike)}</span>
      {bike.noHeightBand && (
        <span className="buyfit-note">
          No height range published — listed because its stack and reach are inside your window.
        </span>
      )}
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
 * One proportion: the measurement, its share of height, and when sex is set the
 * ANSUR II average. Only sternum and torso get a label and z: arm length's
 * landmark match to a fitter is inferred (§8.3), so it is shown with no verdict.
 */
function ProportionCard({
  title,
  value,
  labelled = false,
  sex,
  note,
}: {
  title: string
  value: BodyProportion
  labelled?: boolean
  sex: Sex | ''
  note?: string
}) {
  const showComparison = value.ansurMm !== undefined
  return (
    <div className="buyfit-output">
      <div className="buyfit-card-title">
        <strong>{title}</strong>
        <InfoPanel label={title.toLowerCase()} evidence="Weak" anchor="83-arm-and-torso-length-relative-to-stature-ansur-ii">
          Set against US Army ANSUR II (2012) averages at your height and sex, not your fitter's
          reference. Long or short means more than 1 SD from that average. Arm length is never
          labelled, because the wrist landmark a fitter uses is only inferred. Holliday & Swart
          found that arm length predicted no bike fit variable (§2.3). Information only.
        </InfoPanel>
      </div>
      <span className="buyfit-value">
        {formatCm(value.measuredMm)} · {value.percentOfHeight}% of height
      </span>
      {showComparison && (
        <p className="buyfit-note">
          ANSUR II average at your height: {formatCm(value.ansurMm!)}
          {labelled && value.label && value.z !== undefined && (
            <>
              {' '}· {value.label} (z {value.z >= 0 ? '+' : ''}{value.z.toFixed(1)})
            </>
          )}
        </p>
      )}
      {!showComparison && sex === '' && (
        <p className="buyfit-note">Set sex to compare with the ANSUR II average.</p>
      )}
      {note && <p className="buyfit-note">{note}</p>}
    </div>
  )
}

/** One optional centimetre field. Its warning shows only once the rider has left it. */
function OptionalCmField({
  label,
  help,
  placeholder,
  value,
  onInput,
  onBlur,
  warning,
}: {
  label: string
  help: string
  placeholder: string
  value: string
  onInput: (value: string) => void
  onBlur: () => void
  /** Shown as a note, never as an error: optional values do not block the page. */
  warning: string | null
}) {
  return (
    <label className="buyfit-field">
      <strong>{label}</strong>
      <span className="buyfit-input-unit">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onInput={(e) => onInput(normalizeDecimalInput((e.target as HTMLInputElement).value))}
          onBlur={onBlur}
          placeholder={placeholder}
          className="buyfit-input"
        />
        <span aria-hidden="true">cm</span>
      </span>
      <p className="buyfit-help">{help}</p>
      {warning && <p className="buyfit-note" role="status">{warning}</p>}
    </label>
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
  // Tri changes the crank, saddle and saddle-width outputs and the bike data (§9).
  const [discipline, setDiscipline] = useState<Discipline>('road')
  // Optional: none of these moves the bike matching (doc/buyfit-design.md, Inputs).
  const [sternumHeight, setSternumHeight] = useState<string>('')
  const [armLength, setArmLength] = useState<string>('')
  const [sitBoneWidth, setSitBoneWidth] = useState<string>('')
  const [sex, setSex] = useState<Sex | ''>('')
  const [bikes, setBikes] = useState<Bike[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMeasuringGuide, setShowMeasuringGuide] = useState(false)
  // Saved measurements start folded into one line so a returning rider lands
  // on the results, not on two screens of inputs.
  const [editing, setEditing] = useState(true)
  const [selectedBrands, setSelectedBrands] = useState<Set<string> | null>(null)

  // Fields the rider has left at least once; their messages show only then,
  // so typing "1" on the way to "180" does not flash an error.
  const [touched, setTouched] = useState<Record<MeasurementField | OptionalField, boolean>>({
    inseam: false,
    height: false,
    shoulderWidth: false,
    sternumHeight: false,
    armLength: false,
    sitBoneWidth: false,
  })
  const touch = (field: MeasurementField | OptionalField) =>
    setTouched((t) => ({ ...t, [field]: true }))

  // Load bikes for the chosen discipline, and again when it changes. A reply for a
  // category the rider has already left is dropped.
  useEffect(() => {
    let current = true
    const category: GeometryCategory = discipline
    setLoading(true)
    setError(null)
    setBikes(null)
    loadGeometryData(category)
      .then((result) => {
        if (!current) return
        setBikes(result.bikes)
        setLoading(false)
      })
      .catch(() => {
        if (!current) return
        const apiUrl = import.meta.env.VITE_BIKEDB_URL || 'http://localhost:8080'
        setError(`No connection to the bike database at ${apiUrl}. The app needs the API to load geometry data. Start the server and reload.`)
        setLoading(false)
      })
    return () => {
      current = false
    }
  }, [discipline])

  // Load saved measurements on mount
  useEffect(() => {
    const saved = readSavedMeasurements(localStorage.getItem('buyfit_measurements'))
    const plausible =
      saved !== null &&
      checkMeasurements(parseFloat(saved.inseam), parseFloat(saved.height), parseFloat(saved.shoulderWidth)).ok
    if (saved && plausible) {
      setInseam(saved.inseam)
      setHeight(saved.height)
      setShoulderWidth(saved.shoulderWidth)
      if (saved.preference) setPreference(saved.preference as Preference)
      setDiscipline(saved.discipline ?? 'road')
      setSternumHeight(saved.sternumHeight ?? '')
      setArmLength(saved.armLength ?? '')
      setSitBoneWidth(saved.sitBoneWidth ?? '')
      setSex(saved.sex ?? '')
      // Don't show measuring guide if we have saved data
      setShowMeasuringGuide(false)
      setEditing(false)
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
  const check = checkMeasurements(inseamNum, heightNum, shoulderWidthNum)
  const allValid = check.ok
  const anyEmpty = inseam === '' || height === '' || shoulderWidth === ''
  // Optional measures: 0 when empty, and warnings only, never part of allValid.
  const sternumNum = parseFloat(sternumHeight)
  const armNum = parseFloat(armLength)
  const sitBoneNum = parseFloat(sitBoneWidth)
  const sternumMm = sternumNum ? Math.round(sternumNum * multiplier) : 0
  const armMm = armNum ? Math.round(armNum * multiplier) : 0
  const sitBoneMm = sitBoneNum ? Math.round(sitBoneNum * multiplier) : 0
  const optionalCheck = checkOptionalMeasurements(heightNum, inseamNum, sternumNum, armNum, sitBoneNum)

  // Save to localStorage whenever valid measurements change
  useEffect(() => {
    if (allValid) {
      localStorage.setItem(
        'buyfit_measurements',
        JSON.stringify({
          inseam,
          height,
          shoulderWidth,
          preference,
          discipline,
          sternumHeight,
          armLength,
          sitBoneWidth,
          sex,
          // Without a unit, storage.ts would read these centimetres as millimetres.
          unit: 'cm',
        })
      )
    }
  }, [inseam, height, shoulderWidth, preference, discipline, sternumHeight, armLength, sitBoneWidth, sex, allValid])

  // Calculate outputs only if all inputs are valid
  const sizing = allValid ? calculateSizing(inseamMm, heightMm, shoulderWidthMm, preference, discipline) : null
  const saddle = allValid ? saddleWidth(sitBoneMm, preference, discipline) : null
  const proportions = allValid
    ? bodyProportions({
        heightMm,
        inseamMm,
        sternumMm,
        armMm,
        sex: sex === '' ? undefined : sex,
      })
    : null
  const fitWindow = allValid && bikes ? getStackReachWindow(heightMm, bikes) : null
  const geometry = allValid && bikes ? getFrameGeometryRange(heightMm, bikes) : null
  const matches = allValid && fitWindow && bikes
    ? matchBikes(heightMm, fitWindow.stackMin, fitWindow.stackMax, fitWindow.reachMin, fitWindow.reachMax, bikes)
    : []
  const legProportion = allValid ? inseamRatio(inseamMm, heightMm)?.proportion ?? null : null
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
  const names = displayLabels(filteredMatches)
  const filteredSplit = allValid ? splitByCharacter(filteredMatches) : { racy: [], relaxed: [], median: null }

  const groups: { key: Character; title: string; rows: typeof filteredMatches }[] = [
    { key: 'racy', title: 'Racier half of your matches', rows: filteredSplit.racy },
    { key: 'relaxed', title: 'More upright half', rows: filteredSplit.relaxed },
  ]
  if (preference === 'relaxed') groups.reverse()

  // Shown in the empty and error states too, so the rider can switch back to road.
  const bikeTypeField = (
    <label className="buyfit-field buyfit-field--plain">
      <strong>Bike type</strong>
      <select
        value={discipline}
        onChange={(e) => setDiscipline((e.target as HTMLSelectElement).value as Discipline)}
        className="buyfit-select"
      >
        <option value="road">Road</option>
        <option value="triathlon">Triathlon / TT</option>
      </select>
    </label>
  )

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
        {bikeTypeField}
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
        {bikeTypeField}
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

      {allValid && !editing && (
        <div className="buyfit-summary">
          <span className="buyfit-summary-values">
            <span>Inseam {inseam} cm</span>
            <span>Height {height} cm</span>
            <span>Shoulders {shoulderWidth} cm</span>
          </span>
          <button type="button" className="buyfit-summary-edit" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
      )}

      {/* Inputs section */}
      <div className={allValid && !editing ? 'buyfit-inputs is-folded' : 'buyfit-inputs'}>
        <div className="buyfit-input-row">
          <label className="buyfit-field">
            <strong>Inseam</strong>
            <span className="buyfit-input-unit">
              <input
                type="text"
                inputMode="decimal"
                value={inseam}
                onInput={(e) => setInseam(normalizeDecimalInput((e.target as HTMLInputElement).value))}
                onBlur={() => touch('inseam')}
                placeholder="e.g., 84"
                className="buyfit-input"
              />
              <span aria-hidden="true">cm</span>
            </span>
            <p className="buyfit-help">
              Barefoot, crotch-to-floor against a wall. A 1 cm error moves saddle height about 9 mm.
            </p>
            {touched.inseam && check.fields.inseam && (
              <p className="buyfit-error" role="alert">{check.fields.inseam}</p>
            )}
          </label>

          <label className="buyfit-field">
            <strong>Height</strong>
            <span className="buyfit-input-unit">
              <input
                type="text"
                inputMode="decimal"
                value={height}
                onInput={(e) => setHeight(normalizeDecimalInput((e.target as HTMLInputElement).value))}
                onBlur={() => touch('height')}
                placeholder="e.g., 178"
                className="buyfit-input"
              />
              <span aria-hidden="true">cm</span>
            </span>
            <p className="buyfit-help">
              Total height barefoot. Used to find bikes in your height band.
            </p>
            {touched.height && check.fields.height && (
              <p className="buyfit-error" role="alert">{check.fields.height}</p>
            )}
          </label>

          <label className="buyfit-field">
            <strong>Shoulder Width</strong>
            <span className="buyfit-input-unit">
              <input
                type="text"
                inputMode="decimal"
                value={shoulderWidth}
                onInput={(e) => setShoulderWidth(normalizeDecimalInput((e.target as HTMLInputElement).value))}
                onBlur={() => touch('shoulderWidth')}
                placeholder="e.g., 41"
                className="buyfit-input"
              />
              <span aria-hidden="true">cm</span>
            </span>
            <p className="buyfit-help">
              Biacromial width, centre-to-centre (acromion to acromion). The UCI regulates three
              different handlebar width definitions; this one is used here.
            </p>
            {touched.shoulderWidth && check.fields.shoulderWidth && (
              <p className="buyfit-error" role="alert">{check.fields.shoulderWidth}</p>
            )}
          </label>
        </div>

        {touched.inseam && touched.height && check.ratio && (
          <p className="buyfit-error" role="alert">{check.ratio}</p>
        )}

        <div className="buyfit-optional">
          <p className="buyfit-help">
            Optional. Each adds a number; none of them changes which bikes match.
          </p>
          <div className="buyfit-input-row">
            <OptionalCmField
              label="Sternum height"
              help="Barefoot, floor to the top of the breastbone (jugular notch). Compared with the US Army average."
              placeholder="e.g., 149"
              value={sternumHeight}
              onInput={setSternumHeight}
              onBlur={() => touch('sternumHeight')}
              warning={touched.sternumHeight ? optionalCheck.sternumHeight : null}
            />
            <OptionalCmField
              label="Arm length"
              help="Shoulder tip to wrist bone, arm hanging relaxed. Information only."
              placeholder="e.g., 61"
              value={armLength}
              onInput={setArmLength}
              onBlur={() => touch('armLength')}
              warning={touched.armLength ? optionalCheck.armLength : null}
            />
            <OptionalCmField
              label="Sit-bone width"
              help="Centre to centre, measured seated on cardboard. Sets a saddle width."
              placeholder="e.g., 13"
              value={sitBoneWidth}
              onInput={setSitBoneWidth}
              onBlur={() => touch('sitBoneWidth')}
              warning={touched.sitBoneWidth ? optionalCheck.sitBoneWidth : null}
            />
          </div>
        </div>

        <div className="buyfit-input-controls">
          {bikeTypeField}
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
          <label className="buyfit-field buyfit-field--plain">
            <strong>Sex</strong>
            <select
              value={sex}
              onChange={(e) => setSex((e.target as HTMLSelectElement).value as Sex | '')}
              className="buyfit-select"
            >
              <option value="">Not set</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <span className="buyfit-help">Used only for the population averages in Proportions.</span>
          </label>
        </div>

        <details
          className="buyfit-details"
          open={showMeasuringGuide}
          onToggle={(e) => setShowMeasuringGuide((e.target as HTMLDetailsElement).open)}
        >
          <summary>How to measure</summary>
          <div className="buyfit-guide-content">
            <BodySketch noValues />
            <ol className="buyfit-steps" start={4}>
              <li>
                <strong>Sternum height.</strong> Stand barefoot against a wall. Press the edge of a
                book level into the notch at the top of your breastbone, then measure from the floor
                to that point.
              </li>
              <li>
                <strong>Arm length.</strong> Let the arm hang relaxed. Measure from the bony tip of
                the shoulder to the wrist bone on the thumb side.
              </li>
              <li>
                <strong>Sit-bone width.</strong> Sit upright on corrugated cardboard on a hard chair,
                feet flat. Lift your feet briefly, stand, and measure centre to centre between the two
                deepest dents.
              </li>
            </ol>
            <p className="buyfit-help">
              Sex is asked only to pick the population averages in Proportions. It changes no sizing
              number.
            </p>
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

      {allValid && editing && (
        <button type="button" className="buyfit-done" onClick={() => setEditing(false)}>
          Done
        </button>
      )}

      {/* Show only "Enter measurements" message if not all valid */}
      {anyEmpty && (
        <div className="buyfit-prompt">
          <p>Enter all three measurements</p>
        </div>
      )}

      {/* Show all analysis and bikes only if all inputs are valid */}
      {allValid && sizing && (
        <>
          <ResultsHeader
            heightMm={heightMm}
            inseamMm={inseamMm}
            shoulderMm={shoulderWidthMm}
            sternumMm={sternumMm}
            armMm={armMm}
            sitBoneMm={sitBoneMm}
            sizes={headline}
          />
          {/* Analysis cards section */}
          <div className="buyfit-analysis">
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
              {sizing.saddleNote && <p className="buyfit-note">{sizing.saddleNote}</p>}
            </div>

            {discipline === 'road' && (
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
            )}

            <div className="buyfit-output">
              <div className="buyfit-card-title">
                <strong>Crank length</strong>
                <InfoPanel label="crank length" evidence="Weak" anchor="32-crank-length-from-inseam-or-height">
                  {sizing.crankNote}
                </InfoPanel>
              </div>
              <span className="buyfit-value">{sizing.crankLength}</span>
            </div>

            {saddle && (
              <div className="buyfit-output">
                <div className="buyfit-card-title">
                  <strong>Saddle width</strong>
                  <InfoPanel label="saddle width" evidence="No source" anchor="81-saddle-width-from-sit-bone-width">
                    {saddle.note}
                  </InfoPanel>
                </div>
                <span className="buyfit-value">{saddle.widthMm} mm</span>
                {discipline === 'triathlon' && (
                  <p className="buyfit-note">Conventional saddle only.</p>
                )}
              </div>
            )}

          </div>

          {proportions && (proportions.sternum || proportions.torso || proportions.arm) && (
            <div className="buyfit-proportions">
              <h3 className="buyfit-group-title">Proportions</h3>
              <p className="buyfit-note">
                Compared with US Army ANSUR II (2012), not your fitter's reference. Information only:
                these never move the bike matching.
              </p>
              <div className="buyfit-analysis">
                {proportions.sternum && (
                  <ProportionCard
                    title="Sternum height"
                    value={proportions.sternum}
                    labelled
                    sex={sex}
                  />
                )}
                {proportions.torso && (
                  <ProportionCard
                    title="Torso length"
                    value={proportions.torso}
                    labelled
                    sex={sex}
                    note="Sternum height minus inseam."
                  />
                )}
                {proportions.arm && (
                  <ProportionCard title="Arm length" value={proportions.arm} sex={sex} />
                )}
              </div>
            </div>
          )}

          {/* Bikes section */}
          <div className="buyfit-bikes-section">
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
                <StackReachPlot bikes={filteredMatches} fitWindow={fitWindow} median={filteredSplit.median} names={names} legProportion={legProportion} />
                <div className="plot-legend">
                  <b className="is-racy">racier half</b>
                  <b className="is-upright">more upright half</b>
                  <span>window: stack {fitWindow.stackMin}–{fitWindow.stackMax},
                    reach {fitWindow.reachMin}–{fitWindow.reachMax} mm</span>
                </div>
                {legHint(legProportion) && <p className="plot-leg-hint">{legHint(legProportion)}</p>}
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
                {discipline === 'triathlon' && (
                  <p className="buyfit-note">
                    Tri bikes are sized from where your armrests need to be, not from your height. These
                    frames suit your height. Which size works best depends on the cockpit (risers, stem,
                    extensions) and is set in a fit. If two sizes are shown, both can usually fit you.
                    Treat this list as a coarse filter.
                  </p>
                )}
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
                        key={`${bike.bikeId}-${bike.size}`}
                        bike={bike}
                        name={names.get(bike.bikeId) ?? `${bike.brand} ${bike.family}`}
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
                        key={`${bike.bikeId}-${bike.size}`}
                        bike={bike}
                        name={names.get(bike.bikeId) ?? `${bike.brand} ${bike.family}`}
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
