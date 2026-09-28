import { BodySketch } from './BodySketch'
import { InseamGauge } from './InseamGauge'
import { InfoPanel } from './InfoPanel'
import { inseamRatio, type LegProportion } from './sizing'

const PROPORTION_NOTE: Record<LegProportion, string> = {
  long: `At the long-legged end of the usual 45–48% band. Expect more seatpost showing than the chart implies, and the size your height picks may feel long in the front end — worth comparing the shorter of two candidate sizes.`,
  short: `Below the usual 45–48% band, so proportionally more of your height is torso. Expect less seatpost, and the size your height picks may feel short and low — worth comparing the longer of two candidate sizes.`,
  typical: `Inside the usual 45–48% band, so the maker size charts — which key off height alone — are no further off for you than for anyone else.`,
}

/**
 * The top of the results: the rider's measurements drawn on a body, the size
 * the maker charts give that height, and the inseam-to-height ratio. The ratio
 * is reported, never applied: it moves none of the numbers below.
 */
export function ResultsHeader({
  heightMm,
  inseamMm,
  shoulderMm,
  sizes,
}: {
  heightMm: number
  inseamMm: number
  shoulderMm: number
  /** The most common size labels for this height; empty when no bike lists it. */
  sizes: string[]
}) {
  const ratio = inseamRatio(inseamMm, heightMm)
  return (
    <section className="results-header" aria-label="Your measurements and size">
      <BodySketch heightMm={heightMm} inseamMm={inseamMm} shoulderMm={shoulderMm} />
      <div className="results-header-summary">
        <div className="buyfit-card-title">
          <h2>
            {sizes.length > 0
              ? `Your size is roughly ${sizes.join(' or ')}`
              : 'No bike in the database lists your height'}
          </h2>
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
        {ratio && (
          <div className="results-header-ratio">
            <div className="buyfit-card-title">
              <strong>Inseam-to-height ratio</strong>
              <InfoPanel
                label="the inseam-to-height ratio"
                evidence="No source"
                anchor="45-inseam-does-not-determine-leg-segment-proportions"
              >
                {PROPORTION_NOTE[ratio.proportion]} This changes none of the numbers below: no
                source gives a millimetre adjustment per point of ratio, so it is yours to weigh on
                a test ride.
              </InfoPanel>
            </div>
            <InseamGauge percent={ratio.percent} />
          </div>
        )}
      </div>
    </section>
  )
}
