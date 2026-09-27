import { inseamRatio } from './sizing'
import { calculateMarkerPosition } from './gaugeMarker'
import { InfoPanel } from './InfoPanel'

interface ResultsHeaderProps {
  inseamCm: number; // in cm
  heightCm: number; // in cm
  shoulderWidthCm: number; // in cm
  headline: string[]; // size labels
}

/**
 * Body sketch with measurement lines in cm.
 * Front-view outline with height, inseam, and shoulder-width lines.
 */
function BodySketch({ inseamCm, heightCm, shoulderWidthCm }: Omit<ResultsHeaderProps, 'headline'>) {
  const formatValue = (cm: number) => {
    const rounded = Math.round(cm * 10) / 10;
    return rounded === Math.round(rounded) ? Math.round(rounded).toString() : rounded.toFixed(1);
  };

  return (
    <div className="results-header-sketch">
      <svg viewBox="0 0 140 280" className="body-sketch" aria-label="Body measurements">
        {/* Head */}
        <circle cx="70" cy="20" r="12" stroke="var(--ink-muted)" fill="none" strokeWidth="1.5" />

        {/* Neck */}
        <line x1="70" y1="32" x2="70" y2="45" stroke="var(--ink-muted)" strokeWidth="1.5" />

        {/* Shoulders and arms (hanging at sides) */}
        <line x1="40" y1="50" x2="100" y2="50" stroke="var(--ink-muted)" strokeWidth="1.5" />
        <line x1="40" y1="50" x2="30" y2="95" stroke="var(--ink-muted)" strokeWidth="1.5" />
        <line x1="100" y1="50" x2="110" y2="95" stroke="var(--ink-muted)" strokeWidth="1.5" />

        {/* Torso */}
        <line x1="70" y1="45" x2="70" y2="130" stroke="var(--ink-muted)" strokeWidth="1.5" />
        <line x1="40" y1="50" x2="50" y2="130" stroke="var(--ink-muted)" strokeWidth="1.5" />
        <line x1="100" y1="50" x2="90" y2="130" stroke="var(--ink-muted)" strokeWidth="1.5" />

        {/* Legs (slightly apart) */}
        <line x1="60" y1="130" x2="55" y2="270" stroke="var(--ink-muted)" strokeWidth="1.5" />
        <line x1="80" y1="130" x2="85" y2="270" stroke="var(--ink-muted)" strokeWidth="1.5" />

        {/* Height line (full figure height) on the right */}
        <line
          x1="125"
          y1="8"
          x2="125"
          y2="270"
          stroke="var(--dim)"
          strokeWidth="2.5"
        />
        <polyline
          points="121,12 125,8 129,12"
          stroke="var(--dim)"
          fill="none"
          strokeWidth="2.5"
        />
        <polyline
          points="121,266 125,270 129,266"
          stroke="var(--dim)"
          fill="none"
          strokeWidth="2.5"
        />

        {/* Shoulder width line */}
        <line
          x1="40"
          y1="50"
          x2="100"
          y2="50"
          stroke="var(--dim)"
          strokeWidth="2.5"
        />

        {/* Inseam line (crotch to floor, centered between legs) */}
        <line
          x1="15"
          y1="130"
          x2="15"
          y2="270"
          stroke="var(--dim)"
          strokeWidth="2.5"
        />
        <polyline
          points="11,134 15,130 19,134"
          stroke="var(--dim)"
          fill="none"
          strokeWidth="2.5"
        />
        <polyline
          points="11,266 15,270 19,266"
          stroke="var(--dim)"
          fill="none"
          strokeWidth="2.5"
        />

        {/* Height label */}
        <text
          x="135"
          y="142"
          fontSize="11"
          fontWeight="600"
          fill="var(--ink)"
          textAnchor="start"
        >
          {formatValue(heightCm)} cm
        </text>

        {/* Shoulder width label */}
        <text
          x="70"
          y="42"
          fontSize="11"
          fontWeight="600"
          fill="var(--ink)"
          textAnchor="middle"
          dominantBaseline="hanging"
        >
          {formatValue(shoulderWidthCm)} cm
        </text>

        {/* Inseam label */}
        <text
          x="5"
          y="200"
          fontSize="11"
          fontWeight="600"
          fill="var(--ink)"
          textAnchor="end"
        >
          {formatValue(inseamCm)} cm
        </text>
      </svg>
    </div>
  );
}

/**
 * Inseam-to-height gauge: horizontal bar from 41–52% with usual band 45–48%.
 */
function InseamGauge({ inseamCm, heightCm }: { inseamCm: number; heightCm: number }) {
  const inseamMm = Math.round(inseamCm * 10);
  const heightMm = Math.round(heightCm * 10);
  const ratio = inseamRatio(inseamMm, heightMm);

  if (!ratio) {
    return null;
  }

  const marker = calculateMarkerPosition(ratio.percent);

  return (
    <div className="gauge-container">
      <div className="gauge-title-row">
        <h3 className="gauge-title">Inseam-to-height ratio</h3>
        <InfoPanel
          ariaLabel="About inseam-to-height ratio"
          note={
            (ratio.proportion === 'long'
              ? `At the long-legged end of the usual 45–48% band. Expect more seatpost showing than the chart implies, and the size your height picks may feel long in the front end — worth comparing the shorter of two candidate sizes.`
              : ratio.proportion === 'short'
                ? `Below the usual 45–48% band, so proportionally more of your height is torso. Expect less seatpost, and the size your height picks may feel short and low — worth comparing the longer of two candidate sizes.`
                : `Inside the usual 45–48% band, so the maker size charts — which key off height alone — are no further off for you than for anyone else.`) +
            ' This changes none of the numbers below: no source gives a millimetre adjustment per point of ratio, so it is yours to weigh on a test ride.'
          }
          evidence="No source"
          anchor="45-inseam-does-not-determine-leg-segment-proportions"
        />
      </div>

      <div className="gauge-wrapper">
        <div className="gauge-bar">
          {/* Usual band 45–48% */}
          <div className="gauge-band" style={{ left: '36.36%', width: '27.27%' }} />

          {/* Marker */}
          <div
            className="gauge-marker"
            style={{ left: `${marker.position}%` }}
            role="progressbar"
            aria-valuenow={ratio.percent}
            aria-valuemin={41}
            aria-valuemax={52}
          >
            <span className="gauge-marker-value">{ratio.percent.toFixed(1)}%</span>
          </div>
        </div>

        <div className="gauge-labels">
          <span className="gauge-label gauge-label-left">short legs</span>
          <span className="gauge-label gauge-label-center">usual</span>
          <span className="gauge-label gauge-label-right">long legs</span>
        </div>
      </div>

      <div className="gauge-scale">
        <span className="gauge-scale-tick gauge-scale-tick-left">41%</span>
        <span className="gauge-scale-tick gauge-scale-tick-right">52%</span>
      </div>
    </div>
  );
}

/**
 * Results header: body sketch (left) and size info + gauge (right).
 * Two columns on desktop, stacks below 640px.
 */
export function ResultsHeader({ inseamCm, heightCm, shoulderWidthCm, headline }: ResultsHeaderProps) {
  return (
    <div className="results-header">
      {/* Left column: body sketch */}
      <div className="results-header-left">
        <BodySketch inseamCm={inseamCm} heightCm={heightCm} shoulderWidthCm={shoulderWidthCm} />
      </div>

      {/* Right column: size heading and gauge */}
      <div className="results-header-right">
        <div className="results-header-size">
          <div className="results-header-size-title">
            <h2>
              {headline.length > 0
                ? `Your size is roughly ${headline.join(' or ')}`
                : 'No bike in the database lists your height'}
            </h2>
            {headline.length > 0 && (
              <InfoPanel
                ariaLabel="About size labels"
                note="The most common size label among bikes whose maker lists your height. A label is not a measurement: two bikes both marked 54 can differ by 50 mm of stack, so treat this as a starting point for the shortlist below, not an answer."
                evidence="No source"
                anchor="42-brand-to-brand-size-labels-are-not-comparable-and-this-is-measurable"
              />
            )}
          </div>
        </div>

        <InseamGauge inseamCm={inseamCm} heightCm={heightCm} />
      </div>
    </div>
  );
}
