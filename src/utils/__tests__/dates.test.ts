import { describe, expect, it } from 'vitest';
import { localDateStr, todayLocalStr } from '../dates';

describe('localDateStr', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(localDateStr(new Date(2026, 6, 17, 12, 0, 0))).toBe('2026-07-17');
  });

  it('stays on the local day late in the evening (UTC would roll over)', () => {
    // 11:30pm local on Jul 17. In any negative-UTC-offset timezone,
    // toISOString() would report Jul 18 — the bug this helper prevents.
    expect(localDateStr(new Date(2026, 6, 17, 23, 30, 0))).toBe('2026-07-17');
  });

  it('stays on the local day just after midnight', () => {
    expect(localDateStr(new Date(2026, 6, 17, 0, 5, 0))).toBe('2026-07-17');
  });

  it('pads single-digit months and days', () => {
    expect(localDateStr(new Date(2026, 0, 3, 12, 0, 0))).toBe('2026-01-03');
  });
});

describe('todayLocalStr', () => {
  it('matches localDateStr(new Date())', () => {
    expect(todayLocalStr()).toBe(localDateStr(new Date()));
  });
});
