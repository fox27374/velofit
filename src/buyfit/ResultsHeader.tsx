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
      <div className="body-sketch-container">
        <svg viewBox="0 0 200 320" className="body-sketch" aria-label="Body measurements">
          {/* Body outline (silhouette) - front view */}
          {/* Head */}
          <path
            d="M 100 10 C 115 10, 125 20, 125 35 C 125 50, 115 60, 100 60 C 85 60, 75 50, 75 35 C 75 20, 85 10, 100 10 Z"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
          />

          {/* Neck and shoulders to arms */}
          <path
            d="M 85 60 L 80 70 Q 75 80, 65 90 L 55 120 Q 50 130, 48 145"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
          />
          <path
            d="M 115 60 L 120 70 Q 125 80, 135 90 L 145 120 Q 150 130, 152 145"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
          />

          {/* Torso left */}
          <path
            d="M 80 70 Q 70 85, 68 110 L 68 145"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
          />

          {/* Torso right */}
          <path
            d="M 120 70 Q 130 85, 132 110 L 132 145"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
          />

          {/* Hips and legs */}
          {/* Left leg */}
          <path
            d="M 68 145 Q 65 160, 62 190 L 60 310"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
          />
          <path
            d="M 68 145 Q 72 160, 75 190 L 78 310"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
          />

          {/* Right leg */}
          <path
            d="M 132 145 Q 135 160, 138 190 L 140 310"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
          />
          <path
            d="M 132 145 Q 128 160, 125 190 L 122 310"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
          />

          {/* Feet */}
          <path d="M 60 310 L 65 320" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M 78 310 L 75 320" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M 140 310 L 135 320" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M 122 310 L 125 320" stroke="currentColor" fill="none" strokeWidth="1.5" />

          {/* Height line (full figure height) on the right */}
          <line
            x1="175"
            y1="8"
            x2="175"
            y2="315"
            stroke="var(--dim)"
            strokeWidth="2.5"
          />
          <polyline
            points="171,12 175,8 179,12"
            stroke="var(--dim)"
            fill="none"
            strokeWidth="2.5"
          />
          <polyline
            points="171,311 175,315 179,311"
            stroke="var(--dim)"
            fill="none"
            strokeWidth="2.5"
          />

          {/* Shoulder width line */}
          <line
            x1="75"
            y1="68"
            x2="125"
            y2="68"
            stroke="var(--dim)"
            strokeWidth="2.5"
          />

          {/* Inseam line */}
          <line
            x1="30"
            y1="145"
            x2="30"
            y2="315"
            stroke="var(--dim)"
            strokeWidth="2.5"
          />
          <polyline
            points="26,149 30,145 34,149"
            stroke="var(--dim)"
            fill="none"
            strokeWidth="2.5"
          />
          <polyline
            points="26,311 30,315 34,311"
            stroke="var(--dim)"
            fill="none"
            strokeWidth="2.5"
          />
        </svg>

        {/* HTML labels positioned over the SVG */}
        <div className="body-sketch-label-height">
          <strong>{formatValue(heightCm)}</strong>
          <span>cm</span>
        </div>
        <div className="body-sketch-label-shoulder">
          <strong>{formatValue(shoulderWidthCm)}</strong>
          <span>cm</span>
        </div>
        <div className="body-sketch-label-inseam">
          <strong>{formatValue(inseamCm)}</strong>
          <span>cm</span>
        </div>
      </div>
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
