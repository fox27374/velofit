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
 * Similar to Figure component but with height, inseam, and shoulder-width lines.
 */
function BodySketch({ inseamCm, heightCm, shoulderWidthCm }: Omit<ResultsHeaderProps, 'headline'>) {
  const formatValue = (cm: number) => {
    const rounded = Math.round(cm * 10) / 10;
    return rounded === Math.round(rounded) ? Math.round(rounded).toString() : rounded.toFixed(1);
  };

  return (
    <div className="results-header-sketch">
      <svg viewBox="0 0 100 160" className="body-sketch" aria-label="Body measurements">
        {/* Figure body */}
        <line x1="16" y1="8" x2="16" y2="150" stroke="currentColor" strokeWidth="2" />
        <line x1="16" y1="150" x2="92" y2="150" stroke="currentColor" strokeWidth="2" />
        <circle cx="56" cy="30" r="9" stroke="currentColor" fill="none" strokeWidth="2" />
        <line x1="56" y1="39" x2="56" y2="95" stroke="currentColor" strokeWidth="2" />
        <line x1="56" y1="52" x2="38" y2="78" stroke="currentColor" strokeWidth="2" />
        <line x1="56" y1="52" x2="74" y2="78" stroke="currentColor" strokeWidth="2" />
        <line x1="56" y1="95" x2="46" y2="150" stroke="currentColor" strokeWidth="2" />
        <line x1="56" y1="95" x2="66" y2="150" stroke="currentColor" strokeWidth="2" />

        {/* Height line (full figure height) */}
        <line
          x1="8"
          y1="8"
          x2="8"
          y2="150"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <polyline
          points="4,14 8,8 12,14"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <polyline
          points="4,144 8,150 12,144"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Inseam line (crotch to floor) */}
        <line
          x1="80"
          y1="95"
          x2="80"
          y2="150"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <polyline
          points="76,101 80,95 84,101"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <polyline
          points="76,144 80,150 84,144"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Shoulder width line */}
        <line
          x1="38"
          y1="52"
          x2="74"
          y2="52"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <polyline
          points="44,48 38,52 44,56"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <polyline
          points="68,48 74,52 68,56"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
          opacity="0.6"
        />
      </svg>

      {/* Labels */}
      <div className="body-sketch-labels">
        <div className="body-sketch-label">
          <span className="body-sketch-label-value">{formatValue(heightCm)} cm</span>
          <span className="body-sketch-label-text">Height</span>
        </div>
        <div className="body-sketch-label">
          <span className="body-sketch-label-value">{formatValue(inseamCm)} cm</span>
          <span className="body-sketch-label-text">Inseam</span>
        </div>
        <div className="body-sketch-label">
          <span className="body-sketch-label-value">{formatValue(shoulderWidthCm)} cm</span>
          <span className="body-sketch-label-text">Shoulder</span>
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
      <h3 className="gauge-title">Inseam-to-height ratio</h3>

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
        <span className="gauge-scale-tick">41%</span>
        <span className="gauge-scale-tick">52%</span>
      </div>

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

        <InseamGauge inseamCm={inseamCm} heightCm={heightCm} />
      </div>
    </div>
  );
}
