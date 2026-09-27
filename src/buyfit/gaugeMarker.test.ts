import { describe, it, expect } from 'vitest';
import { calculateMarkerPosition } from './gaugeMarker';

describe('calculateMarkerPosition', () => {
  it('should place marker inside band at 45%', () => {
    const result = calculateMarkerPosition(45);
    expect(result.clamped).toBe(false);
    expect(result.position).toBeCloseTo(36.36, 1); // (45-41)/(52-41)*100
  });

  it('should place marker inside band at 48%', () => {
    const result = calculateMarkerPosition(48);
    expect(result.clamped).toBe(false);
    expect(result.position).toBeCloseTo(63.64, 1); // (48-41)/(52-41)*100
  });

  it('should place marker at left edge and clamp when at 41%', () => {
    const result = calculateMarkerPosition(41);
    expect(result.position).toBe(0);
    expect(result.clamped).toBe(false);
  });

  it('should place marker at right edge and clamp when at 52%', () => {
    const result = calculateMarkerPosition(52);
    expect(result.position).toBe(100);
    expect(result.clamped).toBe(false);
  });

  it('should clamp to left edge when below 41%', () => {
    const result = calculateMarkerPosition(38);
    expect(result.position).toBe(0);
    expect(result.clamped).toBe(true);
  });

  it('should clamp to right edge when above 52%', () => {
    const result = calculateMarkerPosition(55);
    expect(result.position).toBe(100);
    expect(result.clamped).toBe(true);
  });
});
