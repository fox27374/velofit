import { calculateMarkerPosition } from './gaugeMarker'
import { InfoPanel } from './InfoPanel'

interface InseamGaugeProps {
  ratio: number
}

export function InseamGauge({ ratio }: InseamGaugeProps) {
  const { position: markerPos } = calculateMarkerPosition(ratio)

  const note = getLegProportionNote(ratio)

  return (
    <div className="buyfit-gauge-container">
      <div className="buyfit-gauge-header">
        <h3>Inseam-to-height ratio</h3>
        <InfoPanel
          ariaLabel="About inseam-to-height ratio"
          note={note}
          evidence="No source"
          anchor="45-inseam-does-not-determine-leg-segment-proportions"
        />
      </div>

      <svg viewBox="0 0 300 80" className="buyfit-gauge">
        {/* Background bar */}
        <rect x={30} y={35} width={240} height={12} fill="var(--rule)" rx={2} />

        {/* Usual band (45-48%) - shaded area */}
        <rect x={30 + (240 * 0.36)} y={35} width={240 * 0.27} height={12} fill="var(--rule-strong)" opacity="0.4" rx={2} />

        {/* Scale labels */}
        <text x={30} y={28} className="buyfit-gauge-label">
          41%
        </text>
        <text x={270} y={28} className="buyfit-gauge-label" textAnchor="end">
          52%
        </text>

        {/* Band labels */}
        <text x={30 + (240 * 0.36) + (240 * 0.135)} y={60} className="buyfit-gauge-band-label" textAnchor="middle">
          usual
        </text>

        {/* End labels */}
        <text x={30} y={72} className="buyfit-gauge-end-label">
          short legs
        </text>
        <text x={270} y={72} className="buyfit-gauge-end-label" textAnchor="end">
          long legs
        </text>

        {/* Marker line and value */}
        <line x1={30 + (240 * markerPos / 100)} y1={20} x2={30 + (240 * markerPos / 100)} y2={50} stroke="currentColor" strokeWidth={2} />

        {/* Marker value */}
        <text x={30 + (240 * markerPos / 100)} y={16} className="buyfit-gauge-value" textAnchor="middle">
          {ratio.toFixed(1)}%
        </text>
      </svg>
    </div>
  )
}

function getLegProportionNote(ratio: number): string {
  const proportion = ratio > 48 ? 'long' : ratio < 45 ? 'short' : 'typical'

  const notes = {
    long: `At the long-legged end of the usual 45–48% band. Expect more seatpost showing than the chart implies, and the size your height picks may feel long in the front end — worth comparing the shorter of two candidate sizes.`,
    short: `Below the usual 45–48% band, so proportionally more of your height is torso. Expect less seatpost, and the size your height picks may feel short and low — worth comparing the longer of two candidate sizes.`,
    typical: `Inside the usual 45–48% band, so the maker size charts — which key off height alone — are no further off for you than for anyone else.`,
  }

  return notes[proportion] + ` This changes none of the numbers below: no source gives a millimetre adjustment per point of ratio, so it is yours to weigh on a test ride.`
}
