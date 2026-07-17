import { describe, expect, it } from 'vitest';
import { convertMiles, displayDistanceValue, formatDistance } from '../units';

describe('units', () => {
  it('miles pass through unchanged', () => {
    expect(displayDistanceValue(8, 'miles')).toBe('8');
    expect(formatDistance(26.2, 'miles')).toBe('26.2 mi');
  });

  it('converts to km with one decimal', () => {
    expect(displayDistanceValue(5, 'km')).toBe('8');
    expect(displayDistanceValue(8, 'km')).toBe('12.9');
    expect(formatDistance(26.2, 'km')).toBe('42.2 km');
  });

  it('marathon distance converts to the canonical 42.2', () => {
    expect(Math.round(convertMiles(26.2, 'km') * 10) / 10).toBe(42.2);
  });
});
