interface BodySketchProps {
  height: number
  inseam: number
  shoulderWidth: number
}

export function BodySketch({ height, inseam, shoulderWidth }: BodySketchProps) {
  const formatValue = (value: number) => {
    return value % 1 === 0 ? `${Math.round(value)}` : `${value.toFixed(1)}`
  }

  return (
    <svg viewBox="0 0 180 250" className="buyfit-body-sketch" aria-label="Body measurements sketch">
      {/* Figure */}
      <line x1={56} y1={15} x2={56} y2={200} stroke="currentColor" strokeWidth="2" />
      <line x1={56} y1={200} x2={132} y2={200} stroke="currentColor" strokeWidth="2" />
      <circle cx={90} cy={35} r={12} stroke="currentColor" fill="none" strokeWidth="2" />
      <line x1={90} y1={47} x2={90} y2={115} stroke="currentColor" strokeWidth="2" />
      <line x1={90} y1={65} x2={65} y2={95} stroke="currentColor" strokeWidth="2" />
      <line x1={90} y1={65} x2={115} y2={95} stroke="currentColor" strokeWidth="2" />
      <line x1={90} y1={115} x2={75} y2={200} stroke="currentColor" strokeWidth="2" />
      <line x1={90} y1={115} x2={105} y2={200} stroke="currentColor" strokeWidth="2" />

      {/* Height measurement (full length) */}
      <line x1={20} y1={15} x2={20} y2={200} stroke="currentColor" strokeWidth="1.5" />
      <polyline points="16,21 20,15 24,21" stroke="currentColor" fill="none" strokeWidth="1.5" />
      <polyline points="16,194 20,200 24,194" stroke="currentColor" fill="none" strokeWidth="1.5" />
      <text x={15} y={115} className="buyfit-sketch-label">
        {formatValue(height)} cm
      </text>

      {/* Inseam measurement (crotch to floor) */}
      <line x1={145} y1={115} x2={145} y2={200} stroke="currentColor" strokeWidth="1.5" />
      <polyline points="141,121 145,115 149,121" stroke="currentColor" fill="none" strokeWidth="1.5" />
      <polyline points="141,194 145,200 149,194" stroke="currentColor" fill="none" strokeWidth="1.5" />
      <text x={140} y={157.5} className="buyfit-sketch-label" textAnchor="end">
        {formatValue(inseam)} cm
      </text>

      {/* Shoulder width measurement */}
      <line x1={32} y1={50} x2={148} y2={50} stroke="currentColor" strokeWidth="1.5" />
      <polyline points="38,46 32,50 38,54" stroke="currentColor" fill="none" strokeWidth="1.5" />
      <polyline points="142,46 148,50 142,54" stroke="currentColor" fill="none" strokeWidth="1.5" />
      <text x={90} y={35} className="buyfit-sketch-label" textAnchor="middle">
        {formatValue(shoulderWidth)} cm
      </text>
    </svg>
  )
}
