import { calculateMarkerPosition } from './gaugeMarker'

// The usual band, 45–48%, drawn as a shaded stretch of the bar.
const BAND_LEFT = calculateMarkerPosition(45).position
const BAND_WIDTH = calculateMarkerPosition(48).position - BAND_LEFT

/**
 * Inseam as a share of height on a 41–52% bar, with the usual 45–48% band
 * shaded. Neutral colours on purpose: no ratio is better than another; the
 * gauge only shows how far a maker's height-only size chart may be off for
 * this rider. The band sits exactly in the middle, so "usual" centres under it.
 */
export function InseamGauge({ percent }: { percent: number }) {
  const { position } = calculateMarkerPosition(percent)
  // Near either end, keep the printed value from running past the bar.
  const shift = position < 10 ? '0' : position > 90 ? '-100%' : '-50%'
  return (
    <div
      className="gauge"
      role="meter"
      aria-valuemin={41}
      aria-valuemax={52}
      aria-valuenow={percent}
      aria-label={`Inseam is ${percent.toFixed(1)}% of height; usual is 45 to 48%`}
    >
      <div className="gauge-track">
        <div className="gauge-band" style={{ left: `${BAND_LEFT}%`, width: `${BAND_WIDTH}%` }} />
        <div className="gauge-marker" style={{ left: `${position}%` }} />
        <span
          className="gauge-value"
          style={{ left: `${position}%`, transform: `translateX(${shift})` }}
        >
          {percent.toFixed(1)}%
        </span>
      </div>
      <div className="gauge-labels">
        <span>short legs</span>
        <span>usual</span>
        <span>long legs</span>
      </div>
    </div>
  )
}
