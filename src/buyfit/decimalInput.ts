/**
 * Turns text typed into a measurement field into what `parseFloat` expects.
 * A comma is treated as a decimal separator, same as a dot, since some
 * keyboards and locales offer only one or the other. Any character that is
 * not a digit, dot or comma is dropped, and only the first separator
 * survives — a later one is dropped too, but digits after it are kept, so
 * "84,,5" becomes "84.5" rather than throwing away everything after the
 * first separator.
 */
export function normalizeDecimalInput(raw: string): string {
  let seenSeparator = false
  let result = ''
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      result += ch
    } else if ((ch === '.' || ch === ',') && !seenSeparator) {
      result += '.'
      seenSeparator = true
    }
  }
  return result
}
