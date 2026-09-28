/**
 * "84.5 cm" from 845 mm. Whole centimetres drop the decimal: "178 cm".
 */
export function formatCm(mm: number): string {
  const cm = Math.round(mm) / 10
  return `${Number.isInteger(cm) ? cm : cm.toFixed(1)} cm`
}

// Front view, standing, arms at the sides. One open path from the right side
// of the neck, round the whole body, to the left side of the neck; the head is
// a separate ellipse. Symmetric about x = 135. Floor at y = 308.
const OUTLINE =
  'M 142,45 L 142,56 C 151,58 167,59 173,66 C 179,80 181,100 182,120 L 185,168 C 187,178 187,190 181,194 C 176,196 173,188 173,178 L 171,122 L 165,90 C 163,108 160,122 160,132 C 160,142 165,150 166,160 C 167,190 163,215 161,232 C 159,252 156,275 154,296 L 165,304 L 165,308 L 140,308 L 140,300 C 141,275 143,252 143,232 C 143,205 139,180 135,166 C 131,180 127,205 127,232 C 127,252 129,275 130,300 L 130,308 L 105,308 L 105,304 L 116,296 C 114,275 111,252 109,232 C 107,215 103,190 104,160 C 105,150 110,142 110,132 C 110,122 107,108 105,90 L 99,122 L 97,178 C 97,188 94,196 89,194 C 83,190 83,178 85,168 L 88,120 C 89,100 91,80 97,66 C 103,59 119,58 128,56 L 128,45'

/**
 * The rider's three measurements drawn on a body outline. The viewBox is
 * 300 x 320 and the CSS fixes the width at 300 px, so one unit is one pixel
 * and the 13-unit labels read as 13 px at every screen width.
 */
export function BodySketch({
  heightMm,
  inseamMm,
  shoulderMm,
}: {
  heightMm: number
  inseamMm: number
  shoulderMm: number
}) {
  const height = formatCm(heightMm)
  const inseam = formatCm(inseamMm)
  const shoulder = formatCm(shoulderMm)
  return (
    <svg
      className="body-sketch"
      viewBox="0 0 300 320"
      role="img"
      aria-label={`Your measurements: height ${height}, inseam ${inseam}, shoulder width ${shoulder}`}
    >
      <g className="body-sketch-figure">
        <ellipse cx="135" cy="27" rx="15" ry="19" />
        <path d={OUTLINE} />
      </g>

      <g className="body-sketch-dims">
        {/* Height: top of head to floor, right of the figure. */}
        <line x1="230" y1="8" x2="230" y2="308" />
        <polyline points="226,14 230,8 234,14" />
        <polyline points="226,302 230,308 234,302" />
        <line className="body-sketch-ext" x1="222" y1="8" x2="238" y2="8" />
        <line className="body-sketch-ext" x1="222" y1="308" x2="238" y2="308" />

        {/* Inseam: crotch to floor, left of the figure. */}
        <line x1="60" y1="166" x2="60" y2="308" />
        <polyline points="56,172 60,166 64,172" />
        <polyline points="56,302 60,308 64,302" />
        <line className="body-sketch-guide" x1="52" y1="166" x2="130" y2="166" />
        <line className="body-sketch-ext" x1="52" y1="308" x2="68" y2="308" />

        {/* Shoulder width: acromion to acromion, just above the shoulders. */}
        <line x1="97" y1="54" x2="173" y2="54" />
        <polyline points="103,50 97,54 103,58" />
        <polyline points="167,50 173,54 167,58" />
        <line className="body-sketch-ext" x1="97" y1="50" x2="97" y2="66" />
        <line className="body-sketch-ext" x1="173" y1="50" x2="173" y2="66" />
      </g>

      <text className="body-sketch-label" x="236" y="162">
        {height}
      </text>
      <text className="body-sketch-label" x="54" y="242" text-anchor="end">
        {inseam}
      </text>
      <text className="body-sketch-label" x="179" y="58">
        {shoulder}
      </text>
    </svg>
  )
}
