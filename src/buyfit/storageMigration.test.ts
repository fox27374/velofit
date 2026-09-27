import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { migrateMeasurements } from './storageMigration';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace global localStorage with mock
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

describe('migrateMeasurements', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return null if nothing is stored', () => {
    const result = migrateMeasurements();
    expect(result).toBeNull();
  });

  it('should convert mm values to cm when unit is "mm"', () => {
    localStorage.setItem(
      'buyfit_measurements',
      JSON.stringify({
        inseam: '840',
        height: '1780',
        shoulderWidth: '410',
        unit: 'mm',
        preference: 'none',
      })
    );
    const result = migrateMeasurements();
    expect(result).toEqual({
      inseam: '84',
      height: '178',
      shoulderWidth: '41',
      preference: 'none',
    });
  });

  it('should convert mm values to cm when unit is missing (mm default)', () => {
    localStorage.setItem(
      'buyfit_measurements',
      JSON.stringify({
        inseam: '840',
        height: '1780',
        shoulderWidth: '410',
        preference: 'relaxed',
      })
    );
    const result = migrateMeasurements();
    expect(result).toEqual({
      inseam: '84',
      height: '178',
      shoulderWidth: '41',
      preference: 'relaxed',
    });
  });

  it('should use cm values as-is when unit is "cm"', () => {
    localStorage.setItem(
      'buyfit_measurements',
      JSON.stringify({
        inseam: '84',
        height: '178',
        shoulderWidth: '41',
        unit: 'cm',
        preference: 'racy',
      })
    );
    const result = migrateMeasurements();
    expect(result).toEqual({
      inseam: '84',
      height: '178',
      shoulderWidth: '41',
      preference: 'racy',
    });
  });

  it('should handle malformed JSON by returning null', () => {
    localStorage.setItem('buyfit_measurements', 'not valid json');
    const result = migrateMeasurements();
    expect(result).toBeNull();
  });

  it('should handle missing preference gracefully', () => {
    localStorage.setItem(
      'buyfit_measurements',
      JSON.stringify({
        inseam: '840',
        height: '1780',
        shoulderWidth: '410',
        unit: 'mm',
      })
    );
    const result = migrateMeasurements();
    expect(result).toEqual({
      inseam: '84',
      height: '178',
      shoulderWidth: '41',
      preference: undefined,
    });
  });
});
